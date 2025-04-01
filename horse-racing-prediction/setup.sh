#!/bin/bash

echo "==================================================="
echo "Horse Racing Prediction Engine - Setup"
echo "==================================================="
echo

# Check if .env file exists, if not create it from .env.example
if [ ! -f .env ]; then
    echo ".env file not found. Creating from .env.example..."
    cp .env.example .env
    echo ".env file created."
else
    echo ".env file already exists."
fi

# Check for required environment variables in .env
echo "Checking for required environment variables..."
MISSING_VARS=0

# Function to get value of a variable from .env file
get_env_value() {
    grep "^$1=" .env | cut -d '=' -f2
}

# Check PUNTINGFORM_API_KEY
PUNTINGFORM_API_KEY=$(get_env_value "PUNTINGFORM_API_KEY")
if [ -z "$PUNTINGFORM_API_KEY" ] || [ "$PUNTINGFORM_API_KEY" = "your_puntingform_api_key" ]; then
    echo "PUNTINGFORM_API_KEY is missing or has placeholder value."
    read -p "Enter Puntingform API Key: " PUNTINGFORM_API_KEY
    MISSING_VARS=1
fi

# Check TAB_CLIENT_ID
TAB_CLIENT_ID=$(get_env_value "TAB_CLIENT_ID")
if [ -z "$TAB_CLIENT_ID" ] || [ "$TAB_CLIENT_ID" = "your_tab_client_id" ]; then
    echo "TAB_CLIENT_ID is missing or has placeholder value."
    read -p "Enter TAB Client ID: " TAB_CLIENT_ID
    MISSING_VARS=1
fi

# Check TAB_CLIENT_SECRET
TAB_CLIENT_SECRET=$(get_env_value "TAB_CLIENT_SECRET")
if [ -z "$TAB_CLIENT_SECRET" ] || [ "$TAB_CLIENT_SECRET" = "your_tab_client_secret" ]; then
    echo "TAB_CLIENT_SECRET is missing or has placeholder value."
    read -p "Enter TAB Client Secret: " TAB_CLIENT_SECRET
    MISSING_VARS=1
fi

# Update .env file if variables were missing
if [ $MISSING_VARS -eq 1 ]; then
    echo "Updating .env file with provided values..."
    
    # Create a temporary file
    cp .env .env.tmp
    
    # Replace values in the temporary file
    if [ ! -z "$PUNTINGFORM_API_KEY" ]; then
        sed -i.bak "s/PUNTINGFORM_API_KEY=.*/PUNTINGFORM_API_KEY=$PUNTINGFORM_API_KEY/" .env.tmp
    fi
    
    if [ ! -z "$TAB_CLIENT_ID" ]; then
        sed -i.bak "s/TAB_CLIENT_ID=.*/TAB_CLIENT_ID=$TAB_CLIENT_ID/" .env.tmp
    fi
    
    if [ ! -z "$TAB_CLIENT_SECRET" ]; then
        sed -i.bak "s/TAB_CLIENT_SECRET=.*/TAB_CLIENT_SECRET=$TAB_CLIENT_SECRET/" .env.tmp
    fi
    
    # Replace the original file
    mv .env.tmp .env
    rm -f .env.tmp.bak
    echo ".env file updated."
fi

echo "All required environment variables are set."
echo

# Ask user which setup method to use
echo "Choose setup method:"
echo "1. Docker (Production)"
echo "2. Development (Local)"
read -p "Enter choice (1 or 2): " SETUP_METHOD

if [ "$SETUP_METHOD" = "1" ]; then
    echo
    echo "==================================================="
    echo "Setting up with Docker (Production)"
    echo "==================================================="
    echo
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "ERROR: Docker is not installed or not in PATH."
        echo "Please install Docker from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "ERROR: Docker Compose is not installed or not in PATH."
        echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Build and start the services
    echo "Building and starting services with Docker Compose..."
    
    # Export environment variables from .env for Docker Compose
    echo "Setting environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    
    # Run Docker Compose with environment variables
    docker-compose up -d
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to start services with Docker Compose."
        exit 1
    fi
    
    echo
    echo "==================================================="
    echo "Setup Complete!"
    echo "==================================================="
    echo
    echo "Access the application at:"
    echo "- Frontend: http://localhost"
    echo "- MCP Chat: http://localhost:3001"
    echo
    
elif [ "$SETUP_METHOD" = "2" ]; then
    echo
    echo "==================================================="
    echo "Setting up for Development (Local)"
    echo "==================================================="
    echo
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "ERROR: Node.js is not installed or not in PATH."
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "ERROR: npm is not installed or not in PATH."
        echo "Please ensure npm is installed with your Node.js installation."
        exit 1
    fi
    
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
    
    # Install backend dependencies
    echo "Installing backend dependencies..."
    cd src/backend
    npm install
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies."
        cd ../..
        exit 1
    fi
    
    # Start backend server
    echo "Starting backend server..."
    open_terminal "cd $(pwd) && npm run dev"
    cd ../..
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    cd src/frontend
    npm install
    
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies."
        cd ../..
        exit 1
    fi
    
    # Start frontend server
    echo "Starting frontend server..."
    open_terminal "cd $(pwd) && npm start"
    cd ../..
    
    echo
    echo "==================================================="
    echo "Setup Complete!"
    echo "==================================================="
    echo
    echo "Backend server running on http://localhost:3000"
    echo "Frontend application running on http://localhost:3001"
    echo
    
else
    echo "Invalid choice. Please run the script again and select 1 or 2."
    exit 1
fi

echo "Press Enter to exit..."
read
