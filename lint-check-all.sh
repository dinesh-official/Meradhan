#!/bin/bash

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to run lint and check for a project
run_lint_check() {
    local project_path=$1
    local project_name=$2
    
    echo ""
    echo "=================================================="
    print_status "Processing: $project_name"
    echo "=================================================="
    
    cd "$project_path" || {
        print_error "Failed to change directory to $project_path"
        return 1
    }
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_warning "No package.json found in $project_path"
        return 1
    fi
    
    local lint_failed=false
    local check_failed=false
    
    # Run npm run lint
    print_status "Running 'npm run lint' for $project_name..."
    if npm run lint; then
        print_success "Lint passed for $project_name"
    else
        print_error "Lint failed for $project_name"
        lint_failed=true
    fi
    
    echo ""
    
    # Run npm run check
    print_status "Running 'npm run check' for $project_name..."
    if npm run check; then
        print_success "Type check passed for $project_name"
    else
        print_error "Type check failed for $project_name"
        check_failed=true
    fi
    
    # Return to original directory
    cd - > /dev/null
    
    # Return status
    if [ "$lint_failed" = true ] || [ "$check_failed" = true ]; then
        return 1
    else
        return 0
    fi
}

# Main execution
main() {
    local project_root="/home/sourav/Desktop/Work/WebSites/MeraDhan"
    local failed_projects=()
    local total_projects=0
    local successful_projects=0
    
    print_status "Starting lint and type check for all projects..."
    print_status "Project root: $project_root"
    
    # Array of projects with their paths and names
    declare -a projects=(
        "$project_root/backend:Backend"
        "$project_root/frontend/crm:Frontend CRM"
        "$project_root/frontend/meradhan:Frontend Meradhan"
        "$project_root/packages/apiGateway:API Gateway Package"
        "$project_root/packages/schema:Schema Package"
        "$project_root/packages/kyc-providers:KYC Providers Package"
    )
    
    # Process each project
    for project in "${projects[@]}"; do
        IFS=':' read -r path name <<< "$project"
        total_projects=$((total_projects + 1))
        
        if run_lint_check "$path" "$name"; then
            successful_projects=$((successful_projects + 1))
        else
            failed_projects+=("$name")
        fi
    done
    
    echo ""
    echo "=================================================="
    print_status "SUMMARY"
    echo "=================================================="
    echo "Total projects processed: $total_projects"
    echo "Successful projects: $successful_projects"
    echo "Failed projects: ${#failed_projects[@]}"
    
    if [ ${#failed_projects[@]} -eq 0 ]; then
        print_success "All projects passed lint and type checks! 🎉"
        exit 0
    else
        echo ""
        print_error "Projects with failures:"
        for project in "${failed_projects[@]}"; do
            echo "  - $project"
        done
        echo ""
        print_error "Some projects failed lint or type checks. Please review the output above."
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -d "/home/sourav/Desktop/Work/WebSites/MeraDhan" ]; then
    print_error "Project directory not found. Please make sure you're running this script from the correct location."
    exit 1
fi

# Run main function
main "$@"
