@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Horse Racing Prediction Engine - Setup
echo ===================================================
echo.

:: Check if .env file exists, if not create it from .env.example
if not exist .env (
    echo .env file not found. Creating from .env.example...
    copy .env.example .env
    echo .env file created.
) else (
    echo .env file already exists.
)

:: Check for required environment variables in .env
echo Checking for required environment variables...
set MISSING_VARS=0

:: Read .env file
for /f "tokens=1,2 delims==" %%a in (.env) do (
    set KEY=%%a
    set VALUE=%%b
    
    :: Remove leading/trailing spaces
    set KEY=!KEY: =!
    set VALUE=!VALUE: =!
    
    :: Check if value is empty or placeholder
    if "!KEY!"=="PUNTINGFORM_API_KEY" (
        if "!VALUE!"=="" (
            echo PUNTINGFORM_API_KEY is missing.
            set /p PUNTINGFORM_API_KEY="Enter Puntingform API Key: "
            set MISSING_VARS=1
        ) else if "!VALUE!"=="your_puntingform_api_key" (
            echo PUNTINGFORM_API_KEY has placeholder value.
            set /p PUNTINGFORM_API_KEY="Enter Puntingform API Key: "
            set MISSING_VARS=1
        )
    )
    
    if "!KEY!"=="TAB_CLIENT_ID" (
        if "!VALUE!"=="" (
            echo TAB_CLIENT_ID is missing.
            set /p TAB_CLIENT_ID="Enter TAB Client ID: "
            set MISSING_VARS=1
        ) else if "!VALUE!"=="your_tab_client_id" (
            echo TAB_CLIENT_ID has placeholder value.
            set /p TAB_CLIENT_ID="Enter TAB Client ID: "
            set MISSING_VARS=1
        )
    )
    
    if "!KEY!"=="TAB_CLIENT_SECRET" (
        if "!VALUE!"=="" (
            echo TAB_CLIENT_SECRET is missing.
            set /p TAB_CLIENT_SECRET="Enter TAB Client Secret: "
            set MISSING_VARS=1
        ) else if "!VALUE!"=="your_tab_client_secret" (
            echo TAB_CLIENT_SECRET has placeholder value.
            set /p TAB_CLIENT_SECRET="Enter TAB Client Secret: "
            set MISSING_VARS=1
        )
    )
)

:: Update .env file if variables were missing
if !MISSING_VARS!==1 (
    echo Updating .env file with provided values...
    
    :: Create a temporary file
    type .env > .env.tmp
    
    :: Replace values in the temporary file
    if defined PUNTINGFORM_API_KEY (
        powershell -Command "(Get-Content .env.tmp) -replace 'PUNTINGFORM_API_KEY=.*', 'PUNTINGFORM_API_KEY=!PUNTINGFORM_API_KEY!' | Set-Content .env.tmp"
    )
    
    if defined TAB_CLIENT_ID (
        powershell -Command "(Get-Content .env.tmp) -replace 'TAB_CLIENT_ID=.*', 'TAB_CLIENT_ID=!TAB_CLIENT_ID!' | Set-Content .env.tmp"
    )
    
    if defined TAB_CLIENT_SECRET (
        powershell -Command "(Get-Content .env.tmp) -replace 'TAB_CLIENT_SECRET=.*', 'TAB_CLIENT_SECRET=!TAB_CLIENT_SECRET!' | Set-Content .env.tmp"
    )
    
    :: Replace the original file
    move /y .env.tmp .env
    echo .env file updated.
)

echo All required environment variables are set.
echo.

:: Ask user which setup method to use
echo Choose setup method:
echo 1. Docker (Production)
echo 2. Development (Local)
set /p SETUP_METHOD="Enter choice (1 or 2): "

if "%SETUP_METHOD%"=="1" (
    echo.
    echo ===================================================
    echo Setting up with Docker (Production)
    echo ===================================================
    echo.
    
    :: Check if Docker is installed
    docker --version > nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker is not installed or not in PATH.
        echo Please install Docker from https://www.docker.com/products/docker-desktop
        exit /b 1
    )
    
    :: Check if Docker Compose is installed
    docker-compose --version > nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker Compose is not installed or not in PATH.
        echo Please install Docker Compose from https://docs.docker.com/compose/install/
        exit /b 1
    )
    
    :: Build and start the services
    echo Building and starting services with Docker Compose...
    docker-compose up -d
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to start services with Docker Compose.
        exit /b 1
    )
    
    echo.
    echo ===================================================
    echo Setup Complete!
    echo ===================================================
    echo.
    echo Access the application at:
    echo - Frontend: http://localhost
    echo - MCP Chat: http://localhost:3001
    echo.
    
) else if "%SETUP_METHOD%"=="2" (
    echo.
    echo ===================================================
    echo Setting up for Development (Local)
    echo ===================================================
    echo.
    
    :: Check if Node.js is installed
    node --version > nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Node.js is not installed or not in PATH.
        echo Please install Node.js from https://nodejs.org/
        exit /b 1
    )
    
    :: Check if npm is installed
    npm --version > nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: npm is not installed or not in PATH.
        echo Please ensure npm is installed with your Node.js installation.
        exit /b 1
    )
    
    :: Install backend dependencies
    echo Installing backend dependencies...
    cd src\backend
    call npm install
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies.
        cd ..\..
        exit /b 1
    )
    
    :: Start backend server
    echo Starting backend server...
    start "Backend Server" cmd /c "cd %CD% && npm run dev"
    cd ..\..
    
    :: Install frontend dependencies
    echo Installing frontend dependencies...
    cd src\frontend
    call npm install
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies.
        cd ..\..
        exit /b 1
    )
    
    :: Start frontend server
    echo Starting frontend server...
    start "Frontend Server" cmd /c "cd %CD% && npm start"
    cd ..\..
    
    echo.
    echo ===================================================
    echo Setup Complete!
    echo ===================================================
    echo.
    echo Backend server running on http://localhost:3000
    echo Frontend application running on http://localhost:3001
    echo.
    
) else (
    echo Invalid choice. Please run the script again and select 1 or 2.
    exit /b 1
)

echo Press any key to exit...
pause > nul
endlocal