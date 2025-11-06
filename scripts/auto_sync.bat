@echo off
REM LumenFlow - Auto Sync Script (Windows)
REM Watches the input folder and automatically processes new videos

set INPUT_DIR=.\input
set KEYED_DIR=.\keyed
set WEBM_DIR=.\webm
set CONFIG=pipeline_config.json

echo LumenFlow Auto Sync
echo Watching: %INPUT_DIR%
echo Press Ctrl+C to stop
echo.

REM Ensure directories exist
if not exist "%INPUT_DIR%" mkdir "%INPUT_DIR%"
if not exist "%KEYED_DIR%" mkdir "%KEYED_DIR%"
if not exist "%WEBM_DIR%" mkdir "%WEBM_DIR%"

REM Function to process a video file
:process_video
setlocal
set "file=%~1"
for %%F in ("%file%") do set "basename=%%~nF"

echo Processing: %file%
echo   → Chroma keying...

python scripts\chroma_key.py "%file%" -c "%CONFIG%"
if errorlevel 1 (
    echo ✗ Chroma key failed for: %basename%
    goto :end
)

echo   → Converting to WEBM...
python scripts\convert_webm.py "%KEYED_DIR%\%basename%_alpha.mp4" -c "%CONFIG%"
if errorlevel 1 (
    echo ✗ WEBM conversion failed for: %basename%
    goto :end
)

echo ✓ Complete: %basename%
echo.

:end
endlocal
goto :eof

REM Main loop - check for new files every 5 seconds
:watch_loop
for %%F in ("%INPUT_DIR%\*.mp4") do (
    set "file=%%F"
    set "processed=%KEYED_DIR%\%%~nF_alpha.mp4"
    
    REM Check if already processed
    if not exist "!processed!" (
        call :process_video "%%F"
    )
)

timeout /t 5 /nobreak >nul
goto :watch_loop

