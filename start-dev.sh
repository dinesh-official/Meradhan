#!/bin/bash

# ProjectStarterKit Development Environment Starter
# This script starts all services in separate terminal tabs

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🚀 Starting ProjectStarterKit Development Environment...${NC}"
echo -e "${YELLOW}Project Root: ${PROJECT_ROOT}${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists gnome-terminal; then
    echo -e "${RED}❌ gnome-terminal not found. Please install it or modify the script for your terminal.${NC}"
    exit 1
fi

if ! command_exists bun; then
    echo -e "${RED}❌ bun not found. Please install bun first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Function to start a service in a new terminal tab
start_service() {
    local service_name="$1"
    local service_path="$2"
    local command="$3"
    local color="$4"
    
    echo -e "${color}📦 Starting ${service_name}...${NC}"
    
    # Create a script that will run in the new terminal
    cat > "/tmp/start_${service_name,,}.sh" << EOF
#!/bin/bash
cd "${PROJECT_ROOT}/${service_path}"
echo -e "${color}Starting ${service_name} in \$(pwd)${NC}"
echo -e "${color}Running: ${command}${NC}"
echo "----------------------------------------"
${command}
EOF
    
    chmod +x "/tmp/start_${service_name,,}.sh"
    
    # Start the service in a new terminal tab
    gnome-terminal --tab --title="${service_name}" -- bash -c "/tmp/start_${service_name,,}.sh; exec bash"
}

# Start services
echo -e "${GREEN}🔧 Starting development services...${NC}"

# Start Backend
start_service "Backend" "backend" "bun run dev" "${GREEN}"

# Wait a moment before starting the next service
sleep 2

# Start Frontend Client
start_service "Frontend" "frontend/client" "npm run dev" "${BLUE}"

# Optional: Start additional services if needed
# Uncomment the following lines if you want to start other services

# Start Schema (if it has a dev script)
# start_service "Schema" "schema" "bun run dev" "${YELLOW}"

# Start API Client (if it has a dev script)
# start_service "API Client" "apiclient" "bun run dev" "${YELLOW}"

echo ""
echo -e "${GREEN}✅ All services are starting in separate terminal tabs!${NC}"
echo ""
echo -e "${YELLOW}📋 Services Overview:${NC}"
echo -e "  🖥️  Backend: http://localhost:4000 (assumed)"
echo -e "  🌐 Frontend: http://localhost:3002"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo -e "  • Each service runs in its own terminal tab"
echo -e "  • Close individual tabs to stop services"
echo -e "  • Use Ctrl+C in each tab to stop the service"
echo -e "  • Check the terminal output for any errors"
echo ""
echo -e "${GREEN}🎉 Development environment is ready!${NC}"

# Clean up temporary scripts after a delay
(sleep 10 && rm -f /tmp/start_*.sh) &