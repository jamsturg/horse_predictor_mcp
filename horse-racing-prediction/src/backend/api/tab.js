const WebSocket = require('ws');
const axios = require('axios');
const logger = require('../utils/logger');

class TabAPI {
  constructor() {
    this.apiKey = process.env.TAB_API_KEY;
    this.clientId = process.env.TAB_CLIENT_ID || 'horse-racing-prediction';
    this.clientSecret = process.env.TAB_CLIENT_SECRET;
    this.tokenUrl = 'https://api.tab.com.au/oauth/token';
    this.wsUrl = 'wss://api.tab.com.au/racing';
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.ws = null;
    this.subscribers = {};
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
  }

  async getAccessToken() {
    // If token is still valid, return it
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      // OAuth 2.0 client credentials flow
      const response = await axios.post(
        this.tokenUrl,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry time (subtract 60 seconds for safety)
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      logger.info('Successfully obtained OAuth access token for TAB API');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to obtain OAuth access token:', error.message);
      throw error;
    }
  }

  async connect() {
    if (this.ws && this.connected) return;

    try {
      // Get OAuth token before connecting
      const token = await this.getAccessToken();
      this.ws = new WebSocket(this.wsUrl);

      this.ws.on('open', () => {
        logger.info('Connected to TAB WebSocket API');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Authenticate with OAuth bearer token
        this.ws.send(JSON.stringify({
          type: 'auth',
          token: token
        }));

        // Resubscribe to markets if any
        Object.keys(this.subscribers).forEach(marketId => {
          this.ws.send(JSON.stringify({
            type: 'subscribe',
            marketId
          }));
        });
      });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        if (message.type === 'market_update' && message.marketId && this.subscribers[message.marketId]) {
          // Notify all subscribers for this market
          this.subscribers[message.marketId].forEach(callback => {
            callback(message.data);
          });
        }
      } catch (error) {
        logger.error('Error parsing WebSocket message:', error);
      }
    });

    this.ws.on('close', () => {
      logger.warn('TAB WebSocket connection closed');
      this.connected = false;
      this.reconnect();
    });

    this.ws.on('error', (error) => {
      logger.error('TAB WebSocket error:', error);
      this.connected = false;
    });
    } catch (error) {
      logger.error('Failed to connect to TAB WebSocket API:', error.message);
      this.reconnect();
    }
  }

  async reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('Reconnect failed:', error.message);
      }
    }, this.reconnectInterval);
  }
  /**
   * Subscribe to a market for updates
   * @param {string} marketId The market ID to subscribe to
   * @param {function} callback The callback to be called when updates are received
   */
  async subscribe(marketId, callback) {
    // Add to subscribers list
    if (!this.subscribers[marketId]) {
      this.subscribers[marketId] = [];
    }
    this.subscribers[marketId].push(callback);

    // Connect if not already connected
    if (!this.connected) {
      await this.connect();
    } else {
      // Send subscribe message if already connected
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        marketId
      }));
    }
  }

  /**
   * Unsubscribe from a market
   * @param {string} marketId The market ID to unsubscribe from
   * @param {function} callback The callback to remove (if not provided, all callbacks are removed)
   */
  unsubscribe(marketId, callback) {
    if (!this.subscribers[marketId]) return;

    if (callback) {
      // Remove specific callback
      const index = this.subscribers[marketId].indexOf(callback);
      if (index !== -1) {
        this.subscribers[marketId].splice(index, 1);
      }
    } else {
      // Remove all callbacks
      delete this.subscribers[marketId];
    }

    // If we're still connected and there are no more subscribers for this market,
    // send unsubscribe message
    if (this.connected && (!this.subscribers[marketId] || this.subscribers[marketId].length === 0)) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        marketId
      }));
    }
  }

  /**
   * Get race information using REST API (not WebSocket)
   * @param {string} raceId The race ID to get information for
   */
  async getRaceInfo(raceId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`https://api.tab.com.au/v1/racing/races/${raceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get race info for race ${raceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get markets for a race using REST API
   * @param {string} raceId The race ID to get markets for
   */
  async getRaceMarkets(raceId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`https://api.tab.com.au/v1/racing/races/${raceId}/markets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      logger.error(`Failed to get markets for race ${raceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Place a bet using REST API
   * @param {Object} bet The bet to place
   */
  async placeBet(bet) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post('https://api.tab.com.au/v1/betting/bets', bet, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Failed to place bet:', error.message);
      throw error;
    }
  }
}

module.exports = new TabAPI();
