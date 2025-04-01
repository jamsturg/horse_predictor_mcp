#!/bin/bash

echo "==================================================="
echo "Horse Racing Prediction Engine - Complete Setup"
echo "==================================================="
echo "This script will:"
echo " - Collect required API keys"
echo " - Save configuration"
echo " - Install backend and frontend dependencies"
echo " - Start all required servers"
echo " - Provide automated error handling"
echo "==================================================="
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is required for error handling functionality."
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "ERROR: pip is required for error handling functionality."
    echo "Please ensure pip is installed with your Python installation."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is required for this application."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is required for this application."
    echo "Please ensure npm is installed with your Node.js installation."
    exit 1
fi

# Create error handler script
echo "Creating error handler script..."
mkdir -p errorhandler
cat > errorhandler/error_handler.py << 'EOF'
import os
import sys
import anthropic
import subprocess
import re

def handle_error(user_command, error_message, api_key):
    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are an AI assistant specialized in troubleshooting and fixing errors in software development environments, particularly focusing on terminal commands, dependency installations, and configuration issues. Your primary goal is to help users resolve errors they encounter and successfully execute their intended commands.

When a user encounters an error while running a command, you will be provided with the following information:

<user_command>
{user_command}
</user_command>

<error_message>
{error_message}
</error_message>

Follow these steps to address the error and assist the user:

1. Analyze the error message carefully. Identify the type of error (e.g., dependency missing, permission issue, syntax error) and the specific component or action causing the problem.

2. Based on your analysis, determine the most likely cause of the error and formulate a plan to fix it. Consider common solutions such as:
   - Installing missing dependencies
   - Updating existing packages
   - Modifying configuration files
   - Changing file permissions
   - Correcting syntax errors in the command

3. Explain your proposed solution to the user in clear, concise language. Use <explanation> tags to enclose your explanation.

4. Provide the corrective command(s) or action(s) needed to fix the error. Use <fix_command> tags to enclose each command. If multiple commands are needed, number them sequentially.

5. After applying the fix, attempt to re-run the original user command. Use <rerun_command> tags to enclose this command.

6. If the re-run is successful, inform the user that the error has been resolved and the original command has been executed. Use <success_message> tags for this message.

7. If the error persists or a new error occurs, repeat steps 1-5. If you've attempted to fix the error three times without success, apologize to the user and suggest they seek further assistance from a human expert or consult the software's documentation. Use <persistent_error_message> tags for this message.

8. Throughout the process, maintain a helpful and patient tone. If you need any clarification from the user, ask specific questions using <question> tags.

Remember to always prioritize the security and integrity of the user's system. Do not suggest actions that could potentially harm the system or compromise sensitive information.

Begin your response by analyzing the error message and proposing a solution."""

    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=20000,
        temperature=1,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response = message.content[0].text
    print("\n\n===== CLAUDE'S ANALYSIS =====")
    print(response)

    # Extract fix commands
    fix_commands = re.findall(r'<fix_command>(.*?)</fix_command>', response, re.DOTALL)
    rerun_commands = re.findall(r'<rerun_command>(.*?)</rerun_command>', response, re.DOTALL)

    # Execute fix commands
    if fix_commands:
        print("\n\n===== EXECUTING FIX COMMANDS =====")
        for i, cmd in enumerate(fix_commands):
            print(f"Executing fix command {i+1}: {cmd}")
            try:
                subprocess.run(cmd, shell=True, check=True)
                print(f"Fix command {i+1} executed successfully")
            except subprocess.CalledProcessError as e:
                print(f"Error executing fix command {i+1}: {e}")

    # Re-run original command
    if rerun_commands:
        print("\n\n===== RE-RUNNING ORIGINAL COMMAND =====")
        rerun_cmd = rerun_commands[0]
        print(f"Re-running command: {rerun_cmd}")
        try:
            subprocess.run(rerun_cmd, shell=True, check=True)
            print("Command executed successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error re-running command: {e}")
            return False
    return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python error_handler.py <user_command> <error_message> <api_key>")
        sys.exit(1)
    user_command = sys.argv[1]
    error_message = sys.argv[2]
    api_key = sys.argv[3]
    handle_error(user_command, error_message, api_key)
EOF

# Install required Python packages
echo "Installing required Python packages..."
pip3 install anthropic > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install required Python packages."
    exit 1
fi

# Collect API keys
echo
echo "==================================================="
echo "Collecting API Keys"
echo "==================================================="
echo

read -p "Enter Puntingform API Key [e4f5ce71-8880-4907-8a29-2b7af4a6c26a]: " PUNTINGFORM_API_KEY
PUNTINGFORM_API_KEY=${PUNTINGFORM_API_KEY:-e4f5ce71-8880-4907-8a29-2b7af4a6c26a}

read -p "Enter TAB Client ID [d2cf1351-c311-4585-bd3a-f7f6a73136cb]: " TAB_CLIENT_ID
TAB_CLIENT_ID=${TAB_CLIENT_ID:-d2cf1351-c311-4585-bd3a-f7f6a73136cb}

read -p "Enter TAB Client Secret [5a76767e-71bc-423a-ae86-281d2c503a88]: " TAB_CLIENT_SECRET
TAB_CLIENT_SECRET=${TAB_CLIENT_SECRET:-5a76767e-71bc-423a-ae86-281d2c503a88}

read -p "Enter Anthropic API Key for error handling: " ANTHROPIC_API_KEY
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "ERROR: Anthropic API Key is required for error handling."
    exit 1
fi

# Update .env file
echo
echo "==================================================="
echo "Updating Configuration Files"
echo "==================================================="
echo

cat > .env << EOF
NODE_ENV=development
PORT=3000
# Puntingform API Key
PUNTINGFORM_API_KEY=$PUNTINGFORM_API_KEY

# TAB API OAuth 2.0 credentials
TAB_CLIENT_ID=$TAB_CLIENT_ID
TAB_CLIENT_SECRET=$TAB_CLIENT_SECRET

# MCP Integration URLs
REDIS_URL=redis://redis:6379
MEMORY_SERVER_URL=http://memory-server:3002
SEQUENTIAL_THINKING_SERVER_URL=http://sequential-thinking-server:3003
FETCH_SERVER_URL=http://fetch-server:3004
FILESYSTEM_SERVER_URL=http://filesystem-server:3005
MCP_CHAT_URL=http://mcp-chat:3001
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
EOF

echo "Configuration files updated successfully."

# Install backend dependencies
echo
echo "==================================================="
echo "Installing Backend Dependencies"
echo "==================================================="
echo

cd src/backend
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies."
    echo "Attempting to fix with Claude..."
    
    error_output_file="error_output.txt"
    npm install 2> "$error_output_file"
    
    python3 ../../errorhandler/error_handler.py "npm install" "$error_output_file" "$ANTHROPIC_API_KEY"
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to fix backend dependency installation."
        exit 1
    fi
fi

echo "Backend dependencies installed successfully."
cd ../..

# Install frontend dependencies
echo
echo "==================================================="
echo "Installing Frontend Dependencies"
echo "==================================================="
echo

cd src/frontend
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies."
    echo "Attempting to fix with Claude..."
    
    error_output_file="error_output.txt"
    npm install 2> "$error_output_file"
    
    python3 ../../errorhandler/error_handler.py "npm install" "$error_output_file" "$ANTHROPIC_API_KEY"
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to fix frontend dependency installation."
        exit 1
    fi
fi

echo "Frontend dependencies installed successfully."
cd ../..

# Start all servers
echo
echo "==================================================="
echo "Starting Servers"
echo "==================================================="
echo

# Function to open a new terminal window based on OS
open_terminal() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && $1\""
    else
        # Linux
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd $(pwd) && $1; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd $(pwd) && $1" &
        else
            echo "Unable to open a new terminal window. Please start the server manually with: $1"
            return 1
        fi
    fi
    return 0
}

# Start backend server
echo "Starting backend server..."
open_terminal "cd src/backend && npm run dev"

# Wait for backend to start
echo "Waiting for backend server to start..."
sleep 5

# Start frontend server
echo "Starting frontend server..."
open_terminal "cd src/frontend && PORT=3001 npm start"

echo
echo "==================================================="
echo "Setup Complete!"
echo "==================================================="
echo
echo "Backend server running on http://localhost:3000"
echo "Frontend application running on http://localhost:3001"
echo
echo "Press Enter to exit this setup script. The servers will continue running."
echo
read