#!/bin/bash

# MeraDhan Setup Script — npm workspaces monorepo install

set -e

for profile in "$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile"; do
    if [ -f "$profile" ]; then
        # shellcheck source=/dev/null
        source "$profile"
    fi
done

echo "Starting MeraDhan setup (npm workspaces)..."
echo "========================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Current directory: $(pwd)"
echo ""
print_status "Installing all workspace packages..."
echo "=========================================="

if npm install; then
    print_success "Workspace dependencies installed successfully"
else
    print_error "Failed to install workspace dependencies"
    exit 1
fi

print_status "Setting up Prisma for Backend..."
if [ -d "backend/databases/postgres" ]; then
    (
        cd backend
        if npx prisma generate --schema=databases/postgres/prisma/schema; then
            print_success "Prisma setup completed for Backend"
        else
            print_error "Failed to setup Prisma for Backend"
            exit 1
        fi
    )
else
    print_warning "Directory backend/databases/postgres not found, skipping Prisma setup"
fi

echo ""
print_success "All packages installed successfully!"
print_status "You can now start the project using: ./scripts/start.sh"
