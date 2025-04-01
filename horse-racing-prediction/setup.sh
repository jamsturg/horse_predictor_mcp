#!/bin/bash

# Setup Script for Horse Racing Prediction Engine
echo "Setting up Horse Racing Prediction Engine..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker and try again."
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Docker Compose is not installed. Please install Docker Compose and try again."
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
# Puntingform API Key
PUNTINGFORM_API_KEY=e4f5ce71-8880-4907-8a29-2b7af4a6c26a

# TAB API OAuth 2.0 credentials
TAB_API_KEY=your_tab_api_key
TAB_CLIENT_ID=horse-racing-prediction
TAB_CLIENT_SECRET=your_tab_client_secret

# MCP Integration URLs
REDIS_URL=redis://redis:6379
MEMORY_SERVER_URL=http://memory-server:3002
SEQUENTIAL_THINKING_SERVER_URL=http://sequential-thinking-server:3003
FETCH_SERVER_URL=http://fetch-server:3004
FILESYSTEM_SERVER_URL=http://filesystem-server:3005
MCP_CHAT_URL=http://mcp-chat:3001
EOF
  echo ".env file created. Please update the TAB_API
# Complete the setup script
cat >> /root/horse-racing-prediction/setup.sh << 'EOL'
_KEY value."
fi

# Create necessary directories
mkdir -p src/backend/api
mkdir -p src/backend/services
mkdir -p src/backend/utils
mkdir -p src/frontend/src/components

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd src/frontend
npm install
cd ../..

echo "Setup complete! You can now run the application with:"
echo "docker-compose up -d"
