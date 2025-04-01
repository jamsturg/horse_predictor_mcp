/**
 * MCP Integration Script
 * Connects all MCP components together for the Horse Racing Prediction Engine
 */

const axios = require('axios');
const WebSocket = require('ws');
const logger = require('./utils/logger');

class MCPIntegration {
  constructor() {
    this.memoryServerUrl = process.env.MEMORY_SERVER_URL || 'http://memory-server:3002';
    this.sequentialThinkingServerUrl = process.env.SEQUENTIAL_THINKING_SERVER_URL || 'http://sequential-thinking-server:3003';
    this.fetchServerUrl = process.env.FETCH_SERVER_URL || 'http://fetch-server:3004';
    this.filesystemServerUrl = process.env.FILESYSTEM_SERVER_URL || 'http://filesystem-server:3005';
    this.mcpChatUrl = process.env.MCP_CHAT_URL || 'http://mcp-chat:3001';
  }

  async initialize() {
    logger.info('Initializing MCP Integration...');
    try {
      // Check if all MCP servers are available
      await this.checkServers();
      logger.info('All MCP servers are available');
      return true;
    } catch (error) {
      logger.error('Failed to initialize MCP Integration:', error);
      return false;
    }
  }

  async checkServers() {
    const servers = [
      { name: 'Memory Server', url: this.memoryServerUrl },
      { name: 'Sequential Thinking Server', url: this.sequentialThinkingServerUrl },
      { name: 'Fetch Server', url: this.fetchServerUrl },
      { name: 'Filesystem Server', url: this.filesystemServerUrl },
      { name: 'MCP Chat', url: this.mcpChatUrl }
    ];

    for (const server of servers) {
      try {
        await axios.get(`${server.url}/health`);
        logger.info(`${server.name} is available`);
      } catch (error) {
        logger.warn(`${server.name} is not available: ${error.message}`);
      }
    }
  }
  async storeRaceData(raceData) {
    try {
      const response = await axios.post(`${this.memoryServerUrl}/store`, {
        key: `race:${raceData.id}`,
        value: raceData
      });
      logger.info(`Stored race data for race ${raceData.id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to store race data for race ${raceData.id}:`, error);
      throw error;
    }
  }

  async getRaceData(raceId) {
    try {
      const response = await axios.get(`${this.memoryServerUrl}/retrieve`, {
        params: { key: `race:${raceId}` }
      });
      logger.info(`Retrieved race data for race ${raceId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to retrieve race data for race ${raceId}:`, error);
      throw error;
    }
  }

  async fetchRaceData(params) {
    try {
      const response = await axios.post(`${this.fetchServerUrl}/fetch`, {
        url: 'https://www.puntingform.com.au/api/ratingsservice/GetRatings',
        params: {
          ...params,
          professional: process.env.PUNTINGFORM_API_KEY,
          format: 'json'
        }
      });
      logger.info('Fetched race data from Puntingform API');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch race data from Puntingform API:', error);
      throw error;
    }
  }

  async analyzeRace(raceData) {
    try {
      const response = await axios.post(`${this.sequentialThinkingServerUrl}/think`, {
        steps: [
          { name: 'analyzeTrackConditions', data: raceData },
          { name: 'evaluateHorses', data: raceData.horses || [] },
          { name: 'calculateProbabilities' },
          { name: 'generatePredictions' }
        ]
      });
      logger.info(`Analyzed race ${raceData.id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to analyze race ${raceData.id}:`, error);
      throw error;
    }
  }

  async saveToFilesystem(filename, data) {
    try {
      const response = await axios.post(`${this.filesystemServerUrl}/write`, {
        path: filename,
        content: JSON.stringify(data, null, 2)
      });
      logger.info(`Saved data to file ${filename}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to save data to file ${filename}:`, error);
      throw error;
    }
  }

  async readFromFilesystem(filename) {
    try {
      const response = await axios.get(`${this.filesystemServerUrl}/read`, {
        params: { path: filename }
      });
      logger.info(`Read data from file ${filename}`);
      return JSON.parse(response.data.content);
    }
# Create a simple API routes file for the backend
cat > /root/horse-racing-prediction/src/backend/routes.js << 'EOL'
/**
 * API Routes for Horse Racing Prediction Engine
 */

const express = require('express');
const router = express.Router();
const puntingformAPI = require('./api/puntingform');
const MCPIntegration = require('./mcp-integration');

const mcpIntegration = new MCPIntegration();

// Initialize MCP Integration
mcpIntegration.initialize().catch(err => {
  console.error('Failed to initialize MCP Integration:', err);
});

// Get all races
router.get('/races', async (req, res) => {
  try {
    const races = await puntingformAPI.getRaces(req.query);
    res.json(races);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Get all meetings
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await puntingformAPI.getMeetings(req.query);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get all horses
router.get('/horses', async (req, res) => {
  try {
    const horses = await puntingformAPI.getHorses(req.query);
    res.json(horses);
  } catch (error) {
    console.error('Error fetching horses:', error);
    res.status(500).json({ error: 'Failed to fetch horses' });
  }
});

// Get predictions for a race
router.get('/predictions', async (req, res) => {
  try {
    // Fetch race data from Puntingform API
    const races = await puntingformAPI.getRaces(req.query);
    
    // Process each race to generate predictions
    const predictions = [];
    for (const race of races) {
      // Store race data in memory
      await mcpIntegration.storeRaceData(race);
      
      // Analyze race data to generate predictions
      const analysis = await mcpIntegration.analyzeRace(race);
      
      // Save analysis to filesystem for historical reference
      await mcpIntegration.saveToFilesystem(`predictions/${race.id}.json`, analysis);
      
      predictions.push(analysis);
    }
    
    res.json(predictions);
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
}
# Create a comprehensive setup script
cat > /root/horse-racing-prediction/setup-and-run.sh << 'EOL'
#!/bin/bash

# Setup and Run Script for Horse Racing Prediction Engine
echo "Setting up and running Horse Racing Prediction Engine..."

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
PUNTINGFORM_API_KEY=e4f5ce71-8880-4907-8a29-2b7af4a6c26a
TAB_API_KEY=your_tab_api_key
REDIS_URL=redis://redis:6379
MEMORY_SERVER_URL=http://memory-server:3002
SEQUENTIAL_THINKING_SERVER_URL=http://sequential-thinking-server:3003
FETCH_SERVER_URL=http://fetch-server:3004
FILESYSTEM_SERVER_URL=http://filesystem-server:3005
MCP_CHAT_URL=http://mcp-chat:3001
EOF
  echo ".env file created. Please update the TAB_API_KEY value."
fi

# Build and start the services
echo "Building and starting services..."
docker-compose up -d

echo "Services are starting up. You can access the application at http://localhost"
echo "MCP Chat is available at http://localhost:3001"
echo "To view logs, run: docker-compose logs -f"
echo "To stop the services, run: docker-compose down"
