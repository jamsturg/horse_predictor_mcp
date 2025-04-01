/**
 * Master MCP SSE Server for Horse Racing Prediction
 * Main server file that integrates all MCP components and APIs
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SSE = require('express-sse');
const path = require('path');
const WebSocket = require('ws');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Initialize SSE for real-time updates
const sse = new SSE();

// Import routes
const apiRoutes = require('./routes');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SSE endpoint for real-time updates
app.get('/api/events', sse.init);

// Use API routes
app.use('/api', apiRoutes);

// Serve React frontend for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Import TAB API
const tabAPI = require('./api/tab');

// WebSocket server for real-time TAB API integration
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Store active subscriptions for this connection
  const subscriptions = new Set();
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);
      
      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to market updates via TAB API
          const marketId = data.marketId;
          if (marketId) {
            subscriptions.add(marketId);
            
            // Set up callback for market updates
            const handleMarketUpdate = (updateData) => {
              ws.send(JSON.stringify({
                type: 'odds_update',
                raceId: marketId,
                ...updateData
              }));
            };
            
            // Subscribe to TAB API for real-time updates
            await tabAPI.subscribe(marketId, handleMarketUpdate);
            
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              marketId
            }));
            
            console.log(`Client subscribed to market ${marketId}`);
          }
          break;
          
        case 'unsubscribe':
          // Unsubscribe from market updates
          const unsubMarketId = data.marketId;
          if (unsubMarketId && subscriptions.has(unsubMarketId)) {
            tabAPI.unsubscribe(unsubMarketId);
            subscriptions.delete(unsubMarketId);
            
            ws.send(JSON.stringify({
              type: 'unsubscription_confirmed',
              marketId: unsubMarketId
            }));
            
            console.log(`Client unsubscribed from market ${unsubMarketId}`);
          }
          break;
          
        case 'place_bet':
          try {
            // Place a bet using TAB API
            const betResult = await tabAPI.placeBet({
              raceId: data.raceId,
              selectionId: data.horseId,
              stake: data.amount,
              betType: data.betType || 'win'
            });
            
            ws.send(JSON.stringify({
              type: 'bet_result',
              success: true,
              betId: betResult.betId || ('bet_' + Date.now()),
              raceId: data.raceId,
              horseId: data.horseId,
              message: 'Bet placed successfully'
            }));
            
            console.log(`Bet placed for client on race ${data.raceId}, horse ${data.horseId}`);
          } catch (betError) {
            ws.send(JSON.stringify({
              type: 'bet_result',
              success: false,
              raceId: data.raceId,
              horseId: data.horseId,
              message: `Failed to place bet: ${betError.message}`
            }));
            
            console.error('Error placing bet:', betError);
          }
          break;
          
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    
    // Clean up subscriptions when client disconnects
    for (const marketId of subscriptions) {
      tabAPI.unsubscribe(marketId);
      console.log(`Cleaned up subscription to market ${marketId}`);
    }
    subscriptions.clear();
  });
});

// Export the app for testing
module.exports = app;
