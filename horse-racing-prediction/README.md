# Horse Racing Prediction Engine

A comprehensive horse racing prediction system built using the Model Context Protocol (MCP) architecture. This system integrates with the Puntingform API and TAB API to analyze horse racing data, generate predictions, and provide real-time updates.

## Features

- Real-time horse racing data analysis
- Predictive modeling for race outcomes
- Historical performance tracking
- Live odds integration via TAB API
- Interactive chat interface for querying predictions
- WebSocket integration for real-time updates

## Architecture

The system is built using a microservices architecture with the following components:

- **Master MCP SSE Server**: Core server that integrates all components and provides real-time updates via SSE
- **Memory MCP Server**: Stores and retrieves prediction data
- **Sequential Thinking MCP Server**: Analyzes race data and generates predictions
- **Fetch MCP Server**: Retrieves data from external APIs
- **Filesystem MCP Server**: Handles file operations for data persistence
- **MCP Chat**: Interactive chat interface for querying
# Complete the README file
cat >> /root/horse-racing-prediction/README.md << 'EOL'
 predictions and betting information

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/horse-racing-prediction.git
   cd horse-racing-prediction
   ```

2. Create a `.env` file with your API keys
   ```bash
   cp .env.example .env
   # Edit .env file to add your TAB API key
   ```

3. Build and start the services
   ```bash
   docker-compose up -d
   ```

4. Access the application
   - Frontend: http://localhost
   - MCP Chat: http://localhost:3001

## API Endpoints

- `/api/races`: Get race data
- `/api/meetings`: Get meeting data
- `/api/horses`: Get horse data
- `/api/predictions`: Get predictions for races
- `/api/events`: SSE endpoint for real-time updates

## WebSocket

Connect to the WebSocket server at `ws://localhost:3000` to receive real-time updates and place bets.

## Development

### Backend

```bash
cd src/backend
npm install
npm run dev
```

### Frontend

```bash
cd src/frontend
npm install
npm start
```

## MCP Integration

This system integrates with the following MCP servers:

- Memory Server: Stores and retrieves prediction data
- Sequential Thinking Server: Analyzes race data and generates predictions
- Fetch Server: Retrieves data from external APIs
- Filesystem Server: Handles file operations for data persistence
- MCP Chat: Interactive chat interface for querying predictions

## License

MIT
