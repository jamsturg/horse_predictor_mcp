const axios = require('axios');
const moment = require('moment');
const logger = require('../utils/logger');

/**
 * Mock implementation of the Puntingform API
 * This provides mock data instead of making real API calls
 */
class PuntingformAPI {
  constructor() {
    this.apiKey = process.env.PUNTINGFORM_API_KEY;
    this.baseUrl = 'https://www.puntingform.com.au/api';
    this.cache = {};
    this.cacheExpiry = {};
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    
    // Mock data
    this.mockRaces = [
      {
        id: 'race-001',
        name: 'Melbourne Cup',
        track: 'Flemington',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        horses: [
          { id: 'horse-001', name: 'Thunder Bolt', number: 1, odds: 4.5, jockey: 'John Smith' },
          { id: 'horse-002', name: 'Fast Lightning', number: 2, odds: 3.2, jockey: 'Jane Doe' },
          { id: 'horse-003', name: 'Lucky Star', number: 3, odds: 7.0, jockey: 'Mike Johnson' },
          { id: 'horse-004', name: 'Silver Streak', number: 4, odds: 9.5, jockey: 'Sarah Williams' }
        ]
      },
      {
        id: 'race-002',
        name: 'Sydney Stakes',
        track: 'Randwick',
        startTime: new Date(Date.now() + 7200000).toISOString(),
        horses: [
          { id: 'horse-005', name: 'Golden Arrow', number: 1, odds: 2.8, jockey: 'Tom Wilson' },
          { id: 'horse-006', name: 'Midnight Runner', number: 2, odds: 5.1, jockey: 'Lisa Brown' },
          { id: 'horse-007', name: 'Royal Flush', number: 3, odds: 6.3, jockey: 'David Miller' },
          { id: 'horse-008', name: 'Desert Storm', number: 4, odds: 8.7, jockey: 'Emma Davis' }
        ]
      }
    ];
    
    this.mockMeetings = [
      { id: 'meeting-001', name: 'Flemington Race Day', date: new Date().toISOString(), races: 8 },
      { id: 'meeting-002', name: 'Randwick Race Day', date: new Date().toISOString(), races: 6 }
    ];
    
    this.mockHorses = [
      { id: 'horse-001', name: 'Thunder Bolt', trainer: 'Bob Johnson', age: 5, weight: 540 },
      { id: 'horse-002', name: 'Fast Lightning', trainer: 'Mary Smith', age: 4, weight: 520 },
      { id: 'horse-003', name: 'Lucky Star', trainer: 'James Wilson', age: 6, weight: 550 },
      { id: 'horse-004', name: 'Silver Streak', trainer: 'Patricia Brown', age: 3, weight: 510 },
      { id: 'horse-005', name: 'Golden Arrow', trainer: 'Robert Davis', age: 5, weight: 535 },
      { id: 'horse-006', name: 'Midnight Runner', trainer: 'Susan Miller', age: 4, weight: 525 },
      { id: 'horse-007', name: 'Royal Flush', trainer: 'Michael Jones', age: 7, weight: 560 },
      { id: 'horse-008', name: 'Desert Storm', trainer: 'Jennifer White', age: 3, weight: 515 }
    ];
  }

  async request(endpoint, params = {}) {
    logger.debug(`Mock request to ${endpoint} with params: ${JSON.stringify(params)}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.getMockData(endpoint);
  }

  getMockData(endpoint) {
    if (endpoint.includes('GetRatings')) {
      return this.mockRaces;
    } else if (endpoint.includes('GetSectionalsMeetingList')) {
      return this.mockMeetings;
    } else if (endpoint.includes('GetHorses')) {
      return this.mockHorses;
    } else if (endpoint.includes('GetFeatureRaces')) {
      return this.mockRaces.slice(0, 1); // Just return the first race as a feature race
    } else if (endpoint.includes('GetScratchings')) {
      return []; // No scratchings
    }
    
    return [];
  }

  async getRaces(params = {}) {
    logger.info('Getting mock races data');
    return this.mockRaces;
  }

  async getMeetings(params = {}) {
    logger.info('Getting mock meetings data');
    return this.mockMeetings;
  }

  async getHorses(params = {}) {
    logger.info('Getting mock horses data');
    return this.mockHorses;
  }

  async getUpcomingRaces() {
    logger.info('Getting mock upcoming races data');
    return this.mockRaces;
  }

  async getFeatureRaces() {
    logger.info('Getting mock feature races data');
    return this.mockRaces.slice(0, 1);
  }

  async getScratchings(params = {}) {
    logger.info('Getting mock scratchings data');
    return [];
  }
}

module.exports = new PuntingformAPI();
