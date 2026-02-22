@echo off
cd /d "%~dp0"
echo Starting Computer Center System...
echo.
echo Please wait while the server starts up...
echo.

start "" "app.exe"

timeout /t 3 /nobreak >nul

start "" "http://localhost:5000"

echo Server is running. Browser should open automatically.
echo To stop the server, close the black console window.
echo.
pause
