#!/bin/bash

# MeraDhan Setup Script (npm version)
# This script installs all dependencies for the project components using npm only

set -e  # Exit on any error
source ~/.bashrc
echo "🚀 Starting MeraDhan setup (npm version)..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}


print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to install dependencies with error handling
install_dependencies() {
    local dir=$1
    local component_name=$2
    local force_flag=$3
    
    print_status "Installing dependencies for $component_name..."
    
    if [ -d "$dir" ]; then
        cd "$dir"
        
        local npm_cmd="npm install"
        if [ "$force_flag" = "force" ]; then
            npm_cmd="npm install --force"
            print_status "Using --force flag for $component_name"
        fi
        
        if $npm_cmd; then
            print_success "$component_name dependencies installed successfully"
        else
            print_error "Failed to install $component_name dependencies"
            exit 1
        fi
        
        cd - > /dev/null
    else
        print_warning "Directory $dir not found, skipping $component_name"
    fi
}

# Function to setup Prisma in backend
install_dependencies_prisma_backend() {
    local dir=$1
    local component_name=$2

    print_status "Setting up Prisma for $component_name..."
    if [ -d "$dir" ]; then
        cd "$dir"
        
        if npx prisma generate; then
            print_success "Prisma setup completed for $component_name"
        else
            print_error "Failed to setup Prisma for $component_name"
            exit 1
        fi
        
        cd - > /dev/null
    else
        print_warning "Directory $dir not found, skipping Prisma setup for $component_name"
    fi
}

# Main installation process
main() {
    # Get the directory of the script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR"
    
    print_status "Current directory: $(pwd)"
    
    echo ""
    print_status "Installing packages for all components..."
    echo "=========================================="
    
    # Install schema dependencies first
    install_dependencies "packages/schema" "Schema Package"

    # Install kyc-providers dependencies
    install_dependencies "packages/kyc-providers" "Schema Package"

    
    # Install API Gateway dependencies
    install_dependencies "packages/apiGateway" "API Client"
    install_dependencies "packages/config" "Env Configuration"

    
    # Install backend dependencies
    install_dependencies "backend" "Backend"
    install_dependencies_prisma_backend "backend/databases/postgres" "Backend"
    
    # Install frontend dependencies
    install_dependencies "frontend/crm" "Frontend (Next.js)" "force"
    install_dependencies "frontend/meradhan" "Meradhan (Next.js)" "force"

    
    echo ""
    print_success "🎉 All packages installed successfully!"
    print_status "You can now start the project using: ./scripts/start.sh"
}

# Run main function
main "$@"
