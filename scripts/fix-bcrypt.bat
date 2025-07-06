@echo off
setlocal enabledelayedexpansion

REM Fix bcrypt deployment issues on Windows
REM This script rebuilds bcrypt native binaries for the current platform

echo 🔧 Fixing bcrypt for deployment...
echo Platform: Windows
node --version
npm --version

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root.
    exit /b 1
)

echo 🧹 Removing existing bcrypt installation...
if exist "node_modules\bcrypt" (
    rmdir /s /q "node_modules\bcrypt"
    if !errorlevel! equ 0 (
        echo ✅ bcrypt removal completed successfully
    ) else (
        echo ❌ bcrypt removal failed
        exit /b 1
    )
)

echo 🧹 Clearing npm cache for bcrypt...
npm cache clean bcrypt --force >nul 2>&1
echo ✅ cache clearing completed successfully

echo 📦 Installing bcrypt from source...
npm install bcrypt --build-from-source
if !errorlevel! equ 0 (
    echo ✅ bcrypt installation completed successfully
) else (
    echo ❌ bcrypt installation failed
    echo 💡 Make sure you have Visual Studio Build Tools installed
    echo    Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
    exit /b 1
)

echo 🔨 Rebuilding bcrypt...
npm rebuild bcrypt
if !errorlevel! equ 0 (
    echo ✅ bcrypt rebuild completed successfully
) else (
    echo ❌ bcrypt rebuild failed
    exit /b 1
)

echo 🧪 Testing bcrypt installation...
node -e "const bcrypt = require('bcrypt'); const testPassword = 'test123'; console.log('Testing bcrypt...'); const hash = bcrypt.hashSync(testPassword, 10); const isValid = bcrypt.compareSync(testPassword, hash); if (isValid) { console.log('✅ bcrypt is working correctly'); process.exit(0); } else { console.log('❌ bcrypt test failed'); process.exit(1); }"
if !errorlevel! equ 0 (
    echo ✅ bcrypt test completed successfully
) else (
    echo ❌ bcrypt test failed
    exit /b 1
)

echo.
echo 🎉 bcrypt has been successfully fixed for deployment!
echo 📝 You can now deploy your application.
echo.
echo 💡 If you still encounter issues:
echo    1. Install Visual Studio Build Tools
echo    2. Install Python 3.x
echo    3. Try running: npm install --build-from-source
echo    4. Check Node.js version compatibility

pause
