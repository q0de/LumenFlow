# LumenFlow - Check if WEBM has Alpha Channel
# Usage: .\check-alpha.ps1 "path\to\video.webm"

param(
    [Parameter(Mandatory=$false)]
    [string]$VideoPath = ""
)

if ([string]::IsNullOrEmpty($VideoPath)) {
    # Find first WEBM in webm folder
    $webmFiles = Get-ChildItem -Path "webm" -Filter "*.webm" | Select-Object -First 1
    if ($webmFiles) {
        $VideoPath = $webmFiles.FullName
        Write-Host "Checking: $($webmFiles.Name)" -ForegroundColor Cyan
    } else {
        Write-Host "No WEBM files found in webm folder" -ForegroundColor Red
        Write-Host "Usage: .\check-alpha.ps1 `"path\to\video.webm`"" -ForegroundColor Yellow
        exit 1
    }
}

if (-not (Test-Path $VideoPath)) {
    Write-Host "File not found: $VideoPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nChecking video file for alpha channel..." -ForegroundColor Cyan
Write-Host "File: $VideoPath`n" -ForegroundColor Gray

# Check pixel format
$pixFmt = ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=noprint_wrappers=1:nokey=1 "$VideoPath" 2>&1 | Out-String
$pixFmt = $pixFmt.Trim()

# Check codec
$codec = ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "$VideoPath" 2>&1 | Out-String
$codec = $codec.Trim()

Write-Host "Pixel Format: $pixFmt" -ForegroundColor White
Write-Host "Codec: $codec" -ForegroundColor White
Write-Host ""

if ($pixFmt -like "*yuva*" -or $pixFmt -like "*rgba*" -or $pixFmt -like "*yuva420p*") {
    Write-Host "✓ ALPHA CHANNEL DETECTED!" -ForegroundColor Green
    Write-Host "  The 'a' in '$pixFmt' means alpha (transparency) is present" -ForegroundColor Green
    Write-Host "  Your video has transparency - it will work in Unity!" -ForegroundColor Green
} else {
    Write-Host "✗ NO ALPHA CHANNEL FOUND" -ForegroundColor Red
    Write-Host "  Pixel format '$pixFmt' does not include alpha" -ForegroundColor Red
    Write-Host "  The chroma key process may not have worked correctly" -ForegroundColor Yellow
}

Write-Host "`nFull video info:" -ForegroundColor Cyan
ffprobe -v error -show_format -show_streams "$VideoPath" 2>&1 | Select-String -Pattern "pix_fmt|codec_name|width|height|duration" | ForEach-Object { Write-Host $_ -ForegroundColor Gray }

