/**
 * API Routes for Horse Racing Prediction Engine
 */

const express = require('express');
const router = express.Router();
const puntingformAPI = require('./api/puntingform');
const tabAPI = require('./api/tab');
const MCPIntegration = require('./mcp-integration');
const predictionService = require('./services/prediction');

const mcpIntegration = new MCPIntegration();

// Initialize MCP Integration
mcpIntegration.initialize().catch(err => {
  console.error('Failed to initialize MCP Integration:', err);
});

// Get all races from Puntingform API
router.get('/races', async (req, res) => {
  try {
    const races = await puntingformAPI.getRaces(req.query);
    res.json(races);
  } catch (error) {
    console.error('Error fetching races:', error);
    res.status(500).json({ error: 'Failed to fetch races' });
  }
});

// Get all meetings from Puntingform API
router.get('/meetings', async (req, res) => {
  try {
    const meetings = await puntingformAPI.getMeetings(req.query);
    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get all horses from Puntingform API
router.get('/horses', async (req, res) => {
  try {
    const horses = await puntingformAPI.getHorses(req.query);
    res.json(horses);
  } catch (error) {
    console.error('Error fetching horses:', error);
    res.status(500).json({ error: 'Failed to fetch horses' });
  }
});

// Get predictions for races
router.get('/predictions', async (req, res) => {
  try {
    // Fetch race data from Puntingform API
    const races = await puntingformAPI.getRaces(req.query);
    
    // Generate mock predictions since MCP servers are not available
    const predictions = races.map(race => {
      // Create mock analysis for each race
      const analysis = {
        raceId: race.id,
        raceName: race.name,
        trackName: race.track,
        raceTime: race.startTime,
        confidence: 0.85,
        predictions: race.horses.map(horse => {
          // Calculate mock probability and odds
          const probability = Math.random() * 0.5 + 0.1; // Random probability between 0.1 and 0.6
          return {
            horseId: horse.id,
            horseName: horse.name,
            probability: probability,
            odds: 1 / probability,
            jockey: horse.jockey
          };
        }).sort((a, b) => b.probability - a.probability) // Sort by probability (highest first)
      };
      
      return analysis;
    });
    
    res.json(predictions);
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// Get race markets from TAB API
router.get('/markets/:raceId', async (req, res) => {
  try {
    const { raceId } = req.params;
    const markets = await tabAPI.getRaceMarkets(raceId);
    res.json(markets);
  } catch (error) {
    console.error(`Error fetching markets for race ${req.params.raceId}:`, error);
    res.status(500).json({ error: 'Failed to fetch markets' });
  }
});

// Get race info from TAB API
router.get('/race/:raceId', async (req, res) => {
  try {
    const { raceId } = req.params;
    const raceInfo = await tabAPI.getRaceInfo(raceId);
    res.json(raceInfo);
  } catch (error) {
    console.error(`Error fetching race info for race ${req.params.raceId}:`, error);
    res.status(500).json({ error: 'Failed to fetch race info' });
  }
});

// Place a bet using TAB API
router.post('/bet', async (req, res) => {
  try {
    const betResult = await tabAPI.placeBet(req.body);
    res.json(betResult);
  } catch (error) {
    console.error('Error placing bet:', error);
    res.status(500).json({ error: 'Failed to place bet' });
  }
});

module.exports = router;