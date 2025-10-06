#!/bin/bash

# Eden Parfum Development Scripts
# Usage: ./dev.sh [command]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup development environment
setup() {
    log_info "Setting up development environment..."

    # Check prerequisites
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    if ! command_exists npm; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi

    # Install dependencies
    log_info "Installing root dependencies..."
    npm install

    log_info "Installing backend dependencies..."
    cd "$PROJECT_ROOT/backend"
    npm install

    log_info "Installing frontend dependencies..."
    cd "$PROJECT_ROOT/frontend"
    npm install

    cd "$PROJECT_ROOT"

    # Check for .env file
    if [ ! -f "backend/.env" ]; then
        log_warning "Backend .env file not found. Copying from template..."
        cp backend/.env.example backend/.env
        log_warning "Please edit backend/.env with your Supabase credentials"
    fi

    log_success "Development environment setup complete!"
    log_info "Next steps:"
    echo "  1. Edit backend/.env with your Supabase credentials"
    echo "  2. Run database migrations: npm run migrate:supabase"
    echo "  3. Start development: npm run dev"
}

# Start development servers
dev() {
    log_info "Starting development servers..."

    # Check if concurrently is installed
    if ! npm list -g concurrently >/dev/null 2>&1 && ! npm list concurrently >/dev/null 2>&1; then
        log_warning "Installing concurrently for development..."
        npm install --save-dev concurrently
    fi

    # Start both frontend and backend
    npm run dev
}

# Run tests
test() {
    log_info "Running tests..."

    # Backend tests
    log_info "Running backend tests..."
    cd "$PROJECT_ROOT/backend"
    if npm test; then
        log_success "Backend tests passed"
    else
        log_error "Backend tests failed"
        exit 1
    fi

    # Integration tests
    log_info "Running integration tests..."
    cd "$PROJECT_ROOT/tests"
    if node test_api.js && node test_supabase.js; then
        log_success "Integration tests passed"
    else
        log_error "Integration tests failed"
        exit 1
    fi

    cd "$PROJECT_ROOT"
    log_success "All tests passed!"
}

# Run database migrations
migrate() {
    log_info "Running database migrations..."

    if [ ! -f "backend/.env" ]; then
        log_error "Backend .env file not found. Please run setup first."
        exit 1
    fi

    cd "$PROJECT_ROOT/database"
    if node migrate.js; then
        log_success "Database migration completed"
    else
        log_error "Database migration failed"
        exit 1
    fi
}

# Clean up temporary files
clean() {
    log_info "Cleaning up temporary files..."

    # Remove node_modules (optional - will need reinstall)
    read -p "Remove node_modules directories? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Removing node_modules..."
        rm -rf "$PROJECT_ROOT/node_modules"
        rm -rf "$PROJECT_ROOT/backend/node_modules"
        rm -rf "$PROJECT_ROOT/frontend/node_modules"
        log_success "node_modules removed"
    fi

    # Remove logs
    log_info "Removing log files..."
    find "$PROJECT_ROOT" -name "*.log" -type f -delete
    log_success "Log files removed"

    # Remove backup files
    log_info "Removing backup files..."
    find "$PROJECT_ROOT" -name "*.backup*" -type f -delete
    find "$PROJECT_ROOT" -name "*.tmp" -type f -delete
    log_success "Backup files removed"

    # Clear npm cache
    log_info "Clearing npm cache..."
    npm cache clean --force
    log_success "npm cache cleared"
}

# Build for production
build() {
    log_info "Building for production..."

    # Build backend (if needed)
    log_info "Preparing backend..."
    cd "$PROJECT_ROOT/backend"
    npm run build 2>/dev/null || log_info "No build script for backend"

    # Frontend is static, no build needed
    log_info "Frontend is ready (static files)"

    cd "$PROJECT_ROOT"
    log_success "Build complete!"
}

# Show help
help() {
    echo "Eden Parfum Development Scripts"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     Set up development environment"
    echo "  dev       Start development servers"
    echo "  test      Run all tests"
    echo "  migrate   Run database migrations"
    echo "  clean     Clean up temporary files"
    echo "  build     Build for production"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh setup    # Initial setup"
    echo "  ./dev.sh dev      # Start development"
    echo "  ./dev.sh test     # Run tests"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup
        ;;
    dev)
        dev
        ;;
    test)
        test
        ;;
    migrate)
        migrate
        ;;
    clean)
        clean
        ;;
    build)
        build
        ;;
    help|--help|-h)
        help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac</content>
<parameter name="filePath">c:\Users\PC\Desktop\EdenWebSite\scripts\dev.sh