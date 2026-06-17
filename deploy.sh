#!/bin/bash

# WhatsApp Chatbot Deployment Script

set -e

echo "🚀 Starting WhatsApp Chatbot deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create required directories
echo "📁 Creating required directories..."
mkdir -p auth_info_baileys
mkdir -p state
mkdir -p public

# Build Docker image
echo "🏗️  Building Docker image..."
docker-compose build

# Start the container
echo "▶️  Starting container..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for bot to start..."
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Container is running!"
    echo ""
    echo "📱 Scan QR code at: http://localhost:3000/qr"
    echo "💚 Health check: http://localhost:3000/health"
    echo "📊 Status: http://localhost:3000/status"
    echo ""
    echo "📋 View logs with: docker-compose logs -f"
    echo "🛑 Stop with: docker-compose down"
else
    echo "❌ Container failed to start. Check logs with: docker-compose logs"
    exit 1
fi
