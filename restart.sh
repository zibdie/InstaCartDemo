#!/bin/bash

echo "🧹 InstaCart - Clean Restart Script"
echo "===================================="

# Stop all running containers
echo "🛑 Stopping all containers..."
docker stop $(docker ps -q) 2>/dev/null || echo "No running containers to stop"

# Remove all containers
echo "🗑️  Removing all containers..."
docker rm $(docker ps -aq) 2>/dev/null || echo "No containers to remove"

# Remove all images
echo "🖼️  Removing all images..."
docker rmi $(docker images -q) 2>/dev/null || echo "No images to remove"

# Remove all volumes
echo "💾 Removing all volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || echo "No volumes to remove"

# Remove all networks (except default ones)
echo "🌐 Removing custom networks..."
docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || echo "No custom networks to remove"

# Clean up build cache
echo "🧽 Cleaning build cache..."
docker builder prune -af

# System cleanup
echo "🔧 Running system cleanup..."
docker system prune -af --volumes

echo ""
echo "✅ Cleanup completed!"
echo ""
echo "🚀 Starting InstaCart services..."
echo "=================================="

# Build and start containers
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "📊 Container Status:"
echo "==================="
docker-compose ps

echo ""
echo "🎉 InstaCart is ready!"
echo "======================"
echo "🌐 Frontend:    http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000/api"
echo "🗄️  phpMyAdmin:  http://localhost:8080"
echo ""
echo "👥 Demo Users (password: password123):"
echo "   • customer1 - Customer interface"
echo "   • store1    - Store management"
echo "   • driver1   - Driver panel"
echo ""
echo "🌍 Language: Toggle between English/Arabic in app"
echo ""
echo "✨ Happy grocery delivering! ✨"