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
    } catch (error) {
      logger.error(`Failed to read data from file ${filename}:`, error);
      throw error;
    }
  }
}

module.exports = MCPIntegration;
