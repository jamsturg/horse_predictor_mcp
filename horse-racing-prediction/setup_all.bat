@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Horse Racing Prediction Engine - Complete Setup
echo ===================================================
echo This script will:
echo  - Collect required API keys
echo  - Save configuration
echo  - Install backend and frontend dependencies
echo  - Start all required servers
echo  - Provide automated error handling
echo ===================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is required for error handling functionality.
    echo Please install Python from https://www.python.org/downloads/
    exit /b 1
)

:: Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: pip is required for error handling functionality.
    echo Please ensure pip is installed with your Python installation.
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is required for this application.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is required for this application.
    echo Please ensure npm is installed with your Node.js installation.
    exit /b 1
)

:: Create error handler script
echo Creating error handler script...
mkdir errorhandler 2>nul
echo import os > errorhandler\error_handler.py
echo import sys >> errorhandler\error_handler.py
echo import anthropic >> errorhandler\error_handler.py
echo import subprocess >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo def handle_error(user_command, error_message, api_key): >> errorhandler\error_handler.py
echo     client = anthropic.Anthropic(api_key=api_key) >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     prompt = f"""You are an AI assistant specialized in troubleshooting and fixing errors in software development environments, particularly focusing on terminal commands, dependency installations, and configuration issues. Your primary goal is to help users resolve errors they encounter and successfully execute their intended commands.\n\nWhen a user encounters an error while running a command, you will be provided with the following information:\n\n<user_command>\n{user_command}\n</user_command>\n\n<error_message>\n{error_message}\n</error_message>\n\nFollow these steps to address the error and assist the user:\n\n1. Analyze the error message carefully. Identify the type of error (e.g., dependency missing, permission issue, syntax error) and the specific component or action causing the problem.\n\n2. Based on your analysis, determine the most likely cause of the error and formulate a plan to fix it. Consider common solutions such as:\n   - Installing missing dependencies\n   - Updating existing packages\n   - Modifying configuration files\n   - Changing file permissions\n   - Correcting syntax errors in the command\n\n3. Explain your proposed solution to the user in clear, concise language. Use <explanation> tags to enclose your explanation.\n\n4. Provide the corrective command(s) or action(s) needed to fix the error. Use <fix_command> tags to enclose each command. If multiple commands are needed, number them sequentially.\n\n5. After applying the fix, attempt to re-run the original user command. Use <rerun_command> tags to enclose this command.\n\n6. If the re-run is successful, inform the user that the error has been resolved and the original command has been executed. Use <success_message> tags for this message.\n\n7. If the error persists or a new error occurs, repeat steps 1-5. If you've attempted to fix the error three times without success, apologize to the user and suggest they seek further assistance from a human expert or consult the software's documentation. Use <persistent_error_message> tags for this message.\n\n8. Throughout the process, maintain a helpful and patient tone. If you need any clarification from the user, ask specific questions using <question> tags.\n\nRemember to always prioritize the security and integrity of the user's system. Do not suggest actions that could potentially harm the system or compromise sensitive information.\n\nBegin your response by analyzing the error message and proposing a solution.""" >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     message = client.messages.create( >> errorhandler\error_handler.py
echo         model="claude-3-7-sonnet-20250219", >> errorhandler\error_handler.py
echo         max_tokens=20000, >> errorhandler\error_handler.py
echo         temperature=1, >> errorhandler\error_handler.py
echo         messages=[ >> errorhandler\error_handler.py
echo             { >> errorhandler\error_handler.py
echo                 "role": "user", >> errorhandler\error_handler.py
echo                 "content": prompt >> errorhandler\error_handler.py
echo             } >> errorhandler\error_handler.py
echo         ] >> errorhandler\error_handler.py
echo     ) >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     response = message.content[0].text >> errorhandler\error_handler.py
echo     print("\n\n===== CLAUDE'S ANALYSIS =====") >> errorhandler\error_handler.py
echo     print(response) >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     # Extract fix commands >> errorhandler\error_handler.py
echo     import re >> errorhandler\error_handler.py
echo     fix_commands = re.findall(r'<fix_command>(.*?)</fix_command>', response, re.DOTALL) >> errorhandler\error_handler.py
echo     rerun_commands = re.findall(r'<rerun_command>(.*?)</rerun_command>', response, re.DOTALL) >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     # Execute fix commands >> errorhandler\error_handler.py
echo     if fix_commands: >> errorhandler\error_handler.py
echo         print("\n\n===== EXECUTING FIX COMMANDS =====") >> errorhandler\error_handler.py
echo         for i, cmd in enumerate(fix_commands): >> errorhandler\error_handler.py
echo             print(f"Executing fix command {i+1}: {cmd}") >> errorhandler\error_handler.py
echo             try: >> errorhandler\error_handler.py
echo                 subprocess.run(cmd, shell=True, check=True) >> errorhandler\error_handler.py
echo                 print(f"Fix command {i+1} executed successfully") >> errorhandler\error_handler.py
echo             except subprocess.CalledProcessError as e: >> errorhandler\error_handler.py
echo                 print(f"Error executing fix command {i+1}: {e}") >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo     # Re-run original command >> errorhandler\error_handler.py
echo     if rerun_commands: >> errorhandler\error_handler.py
echo         print("\n\n===== RE-RUNNING ORIGINAL COMMAND =====") >> errorhandler\error_handler.py
echo         rerun_cmd = rerun_commands[0] >> errorhandler\error_handler.py
echo         print(f"Re-running command: {rerun_cmd}") >> errorhandler\error_handler.py
echo         try: >> errorhandler\error_handler.py
echo             subprocess.run(rerun_cmd, shell=True, check=True) >> errorhandler\error_handler.py
echo             print("Command executed successfully") >> errorhandler\error_handler.py
echo             return True >> errorhandler\error_handler.py
echo         except subprocess.CalledProcessError as e: >> errorhandler\error_handler.py
echo             print(f"Error re-running command: {e}") >> errorhandler\error_handler.py
echo             return False >> errorhandler\error_handler.py
echo     return False >> errorhandler\error_handler.py
echo. >> errorhandler\error_handler.py
echo if __name__ == "__main__": >> errorhandler\error_handler.py
echo     if len(sys.argv) < 4: >> errorhandler\error_handler.py
echo         print("Usage: python error_handler.py <user_command> <error_message> <api_key>") >> errorhandler\error_handler.py
echo         sys.exit(1) >> errorhandler\error_handler.py
echo     user_command = sys.argv[1] >> errorhandler\error_handler.py
echo     error_message = sys.argv[2] >> errorhandler\error_handler.py
echo     api_key = sys.argv[3] >> errorhandler\error_handler.py
echo     handle_error(user_command, error_message, api_key) >> errorhandler\error_handler.py

:: Install required Python packages
echo Installing required Python packages...
pip install anthropic >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to install required Python packages.
    exit /b 1
)

:: Collect API keys
echo.
echo ===================================================
echo Collecting API Keys
echo ===================================================
echo.

set /p PUNTINGFORM_API_KEY="Enter Puntingform API Key [e4f5ce71-8880-4907-8a29-2b7af4a6c26a]: "
if "!PUNTINGFORM_API_KEY!"=="" set PUNTINGFORM_API_KEY=e4f5ce71-8880-4907-8a29-2b7af4a6c26a

set /p TAB_CLIENT_ID="Enter TAB Client ID [d2cf1351-c311-4585-bd3a-f7f6a73136cb]: "
if "!TAB_CLIENT_ID!"=="" set TAB_CLIENT_ID=d2cf1351-c311-4585-bd3a-f7f6a73136cb

set /p TAB_CLIENT_SECRET="Enter TAB Client Secret [5a76767e-71bc-423a-ae86-281d2c503a88]: "
if "!TAB_CLIENT_SECRET!"=="" set TAB_CLIENT_SECRET=5a76767e-71bc-423a-ae86-281d2c503a88

set /p ANTHROPIC_API_KEY="Enter Anthropic API Key for error handling: "
if "!ANTHROPIC_API_KEY!"=="" (
    echo ERROR: Anthropic API Key is required for error handling.
    exit /b 1
)

:: Update .env file
echo.
echo ===================================================
echo Updating Configuration Files
echo ===================================================
echo.

echo NODE_ENV=development > .env
echo PORT=3000 >> .env
echo # Puntingform API Key >> .env
echo PUNTINGFORM_API_KEY=!PUNTINGFORM_API_KEY! >> .env
echo. >> .env
echo # TAB API OAuth 2.0 credentials >> .env
echo TAB_CLIENT_ID=!TAB_CLIENT_ID! >> .env
echo TAB_CLIENT_SECRET=!TAB_CLIENT_SECRET! >> .env
echo. >> .env
echo # MCP Integration URLs >> .env
echo REDIS_URL=redis://redis:6379 >> .env
echo MEMORY_SERVER_URL=http://memory-server:3002 >> .env
echo SEQUENTIAL_THINKING_SERVER_URL=http://sequential-thinking-server:3003 >> .env
echo FETCH_SERVER_URL=http://fetch-server:3004 >> .env
echo FILESYSTEM_SERVER_URL=http://filesystem-server:3005 >> .env
echo MCP_CHAT_URL=http://mcp-chat:3001 >> .env
echo ANTHROPIC_API_KEY=!ANTHROPIC_API_KEY! >> .env

echo Configuration files updated successfully.

:: Install backend dependencies
echo.
echo ===================================================
echo Installing Backend Dependencies
echo ===================================================
echo.

cd src\backend
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies.
    echo Attempting to fix with Claude...
    
    set error_output_file=error_output.txt
    call npm install 2> !error_output_file!
    
    python ..\..\errorhandler\error_handler.py "npm install" "!error_output_file!" "!ANTHROPIC_API_KEY!"
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to fix backend dependency installation.
        exit /b 1
    )
)

echo Backend dependencies installed successfully.
cd ..\..

:: Install frontend dependencies
echo.
echo ===================================================
echo Installing Frontend Dependencies
echo ===================================================
echo.

cd src\frontend
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    echo Attempting to fix with Claude...
    
    set error_output_file=error_output.txt
    call npm install 2> !error_output_file!
    
    python ..\..\errorhandler\error_handler.py "npm install" "!error_output_file!" "!ANTHROPIC_API_KEY!"
    
    if %errorlevel% neq 0 (
        echo ERROR: Failed to fix frontend dependency installation.
        exit /b 1
    )
)

echo Frontend dependencies installed successfully.
cd ..\..

:: Start all servers
echo.
echo ===================================================
echo Starting Servers
echo ===================================================
echo.

:: Start backend server
echo Starting backend server...
start "Backend Server" cmd /c "cd src\backend && npm run dev"

:: Wait for backend to start
echo Waiting for backend server to start...
timeout /t 5 /nobreak > nul

:: Start frontend server
echo Starting frontend server...
start "Frontend Server" cmd /c "cd src\frontend && set PORT=3001 && npm start"

echo.
echo ===================================================
echo Setup Complete!
echo ===================================================
echo.
echo Backend server running on http://localhost:3000
echo Frontend application running on http://localhost:3001
echo.
echo Press any key to exit this setup script. The servers will continue running.
echo.
pause > nul

endlocal