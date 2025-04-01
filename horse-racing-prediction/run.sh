#!/bin/bash

# Run Script for Horse Racing Prediction Engine
echo "Starting Horse Racing Prediction Engine..."

# Build and start the services
docker-compose up -d

echo "Services are starting up. You can access the application at http://localhost"
echo "MCP Chat is available at http://localhost:3001"
echo "To view logs, run: docker-compose logs -f"
echo "To stop the services, run: docker-compose down"
