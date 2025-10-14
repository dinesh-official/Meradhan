#!/bin/bash

# MeraDhan Setup Script
# This script installs all dependencies for the project components

set -e  # Exit on any error

echo "🚀 Starting MeraDhan setup..."
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

# Check if bun is installed
check_bun() {
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun first."
        echo "Visit: https://bun.sh"
        exit 1
    else
        print_success "Bun is installed: $(bun --version)"
    fi
}

# Check if node and npm are installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        echo "Visit: https://nodejs.org"
        exit 1
    else
        print_success "Node.js is installed: $(node --version)"
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    else
        print_success "npm is installed: $(npm --version)"
    fi
}

# Function to install dependencies with error handling
install_dependencies() {
    local dir=$1
    local package_manager=$2
    local component_name=$3
    local force_flag=$4
    
    print_status "Installing dependencies for $component_name..."
    
    if [ -d "$dir" ]; then
        cd "$dir"
        
        if [ "$package_manager" = "bun" ]; then
            if bun install; then
                print_success "$component_name dependencies installed successfully"
            else
                print_error "Failed to install $component_name dependencies"
                exit 1
            fi
        elif [ "$package_manager" = "npm" ]; then
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
        fi
        
        cd ..
    else
        print_warning "Directory $dir not found, skipping $component_name"
    fi
}


install_dependencies_prisma_backend() {
    local dir=$1
    local package_manager=$2
    local component_name=$3
    local force_flag=$4

# setup Prisma 
    print_status "Setting up Prisma for $component_name..."
    if [ -d "$dir" ]; then
        cd "$dir"
        
        if [ "$package_manager" = "bun" ]; then
            if bun prisma generate && bun prisma db push; then
                print_success "Prisma setup completed for $component_name"
            else
                print_error "Failed to setup Prisma for $component_name"
                exit 1
            fi
        elif [ "$package_manager" = "npm" ]; then
            if npx prisma generate; then
                print_success "Prisma setup completed for $component_name"
            else
                print_error "Failed to setup Prisma for $component_name"
                exit 1
            fi
        fi
        
        cd ../../../
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
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_bun
    check_node
    
    echo ""
    print_status "Installing packages for all components..."
    echo "=========================================="
    
    # Install schema dependencies first (other packages depend on it)
    install_dependencies "packages/schema" "npm" "Schema Package"
    cd ../
    # Install apiclient dependencies (frontend depends on it)
    install_dependencies "packages/apiGateway" "npm" "API Client"
    cd ../
    # Install backend dependencies
    install_dependencies "backend" "npm" "Backend"
    install_dependencies_prisma_backend "backend/databases/supabase" "npm" "Backend"
    
    # Install frontend dependencies
    install_dependencies "frontend/crm" "npm" "Frontend (Next.js)" "force"
    
    echo ""
    print_success "🎉 All packages installed successfully!"
    print_status "Or use the start script: ./scripts/start.sh"
}

# Run main function
main "$@"