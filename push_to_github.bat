@echo off
echo Checking if Git is available...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not found in your PATH. Please install Git or add it to your PATH.
    echo Default install location might be "C:\Program Files\Git\cmd\git.exe"
    pause
    exit /b
)

echo.
echo Initializing/Re-initializing Git...
if not exist ".git" (
    git init
    echo Git repository initialized.
) else (
    echo Git repository already exists.
)

echo.
echo Setting up remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/vk2420/Delivery-Tracking-

echo.
echo Staging all files...
git add .

echo.
echo Committing changes...
git commit -m "Update code via Assistive AI"

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Done!
pause
