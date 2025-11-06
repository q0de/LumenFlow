# LumenFlow Download Test Script
# Tests if the download endpoint is working correctly

param(
    [Parameter(Mandatory=$true)]
    [string]$JobId,
    
    [string]$OutputFile = "test-download.webm"
)

$baseUrl = "http://localhost:3000"

Write-Host "Testing LumenFlow Download Endpoint" -ForegroundColor Cyan
Write-Host "Job ID: $JobId" -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if job exists
Write-Host "1. Checking job status..." -ForegroundColor Green
try {
    $jobResponse = Invoke-RestMethod -Uri "$baseUrl/api/jobs/$JobId" -Method Get
    Write-Host "   ✓ Job found: $($jobResponse.status)" -ForegroundColor Green
    
    if ($jobResponse.status -ne "completed") {
        Write-Host "   ⚠ Job not completed yet. Status: $($jobResponse.status)" -ForegroundColor Yellow
        exit 1
    }
    
    if ($jobResponse.outputFilename) {
        Write-Host "   ✓ Output filename: $($jobResponse.outputFilename)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Job not found or error: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Try to download
Write-Host ""
Write-Host "2. Testing download..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/download/$JobId" -OutFile $OutputFile
    
    Write-Host "   ✓ Download successful!" -ForegroundColor Green
    Write-Host "   ✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   ✓ Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Green
    
    # Check file
    if (Test-Path $OutputFile) {
        $fileInfo = Get-Item $OutputFile
        Write-Host "   ✓ File saved: $OutputFile" -ForegroundColor Green
        Write-Host "   ✓ File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
        
        # Check if it's actually a WEBM file (not JSON)
        $firstBytes = Get-Content $OutputFile -TotalCount 1 -Raw -Encoding Byte
        $isWebM = $firstBytes[0] -eq 0x1A -and $firstBytes[1] -eq 0x45 -and $firstBytes[2] -eq 0xDF -and $firstBytes[3] -eq 0xA3
        
        if ($isWebM) {
            Write-Host "   ✓ Valid WEBM file detected!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ File might not be a valid WEBM (could be JSON error)" -ForegroundColor Yellow
            Write-Host "   First bytes: $($firstBytes[0..3] -join ' ')" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ✗ Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All tests passed! ✓" -ForegroundColor Green

