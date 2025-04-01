const axios = require('axios');
const moment = require('moment');
const logger = require('../utils/logger');

class PuntingformAPI {
  constructor() {
    this.apiKey = process.env.PUNTINGFORM_API_KEY;
    this.baseUrl = 'https://www.puntingform.com.au/api';
    this.cache = {};
    this.cacheExpiry = {};
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  async request(endpoint, params = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = `${url}?${JSON.stringify(params)}`;
    
    // Check cache
    if (this.cache[cacheKey] && this.cacheExpiry[cacheKey] > Date.now()) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return this.cache[cacheKey];
    }
    
    try {
      // Add API key to params
      const requestParams = {
        ...params,
        professional: this.apiKey,
        format: 'json'
      };
      
      logger.debug(`Making request to ${url} with params: ${JSON.stringify(requestParams)}`);
      
      const response = await axios.get(url, { params: requestParams });
      
      // Cache the response
      this.cache[cacheKey] = response.data;
      this.cacheExpiry[cacheKey] = Date.now() + this.cacheTTL;
      
      return response.data;
    } catch (error) {
      logger.error(`Error making request to ${url}: ${error.message}`);
      throw error;
    }
  }

  async getRaces(params = {}) {
    return this.request('/ratingsservice/GetRatings', params);
  }

  async getMeetings(params = {}) {
    return this.request('/ratingsservice/GetSectionalsMeetingList', params);
  }

  async getHorses(params = {}) {
    return this.request('/formdataservice/GetHorses', params);
  }

  async getUpcomingRaces() {
    const today = moment().format('D-MMM-YYYY');
    return this.request('/ratingsservice/GetRatings', { date: today });
  }

  async getFeatureRaces() {
    return this.request('/ratingsservice/GetFeatureRaces');
  }

  async getScratchings(params = {}) {
    return this.request('/scratchingsservice/GetScratchings', params);
  }
}

module.exports = new PuntingformAPI();
