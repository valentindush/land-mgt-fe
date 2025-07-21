#!/bin/bash

# TransferForm Test Runner Script
# This script runs the TransferForm.vue component tests with various options

echo "🧪 TransferForm.vue Test Runner"
echo "================================"

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

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to run tests with different options
run_tests() {
    local option=$1
    local description=$2
    
    print_status "$description"
    echo "----------------------------------------"
    
    case $option in
        "basic")
            npx vitest run src/components/transfer/__tests__/TransferForm.test.ts
            ;;
        "watch")
            print_warning "Running in watch mode. Press 'q' to quit."
            npx vitest src/components/transfer/__tests__/TransferForm.test.ts
            ;;
        "coverage")
            npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --coverage
            ;;
        "verbose")
            npx vitest run src/components/transfer/__tests__/TransferForm.test.ts --reporter=verbose
            ;;
        "ui")
            print_warning "Opening Vitest UI in browser..."
            npx vitest --ui src/components/transfer/__tests__/TransferForm.test.ts
            ;;
        *)
            print_error "Unknown option: $option"
            return 1
            ;;
    esac
    
    local exit_code=$?
    echo "----------------------------------------"
    
    if [ $exit_code -eq 0 ]; then
        print_success "Tests completed successfully!"
    else
        print_error "Tests failed with exit code: $exit_code"
    fi
    
    return $exit_code
}

# Main menu
show_menu() {
    echo ""
    echo "Select test mode:"
    echo "1) Basic test run"
    echo "2) Watch mode (continuous testing)"
    echo "3) Coverage report"
    echo "4) Verbose output"
    echo "5) UI mode (browser interface)"
    echo "6) All modes (sequential)"
    echo "q) Quit"
    echo ""
}

# Handle command line arguments
if [ $# -eq 1 ]; then
    case $1 in
        "basic"|"1")
            run_tests "basic" "Running basic tests..."
            exit $?
            ;;
        "watch"|"2")
            run_tests "watch" "Running tests in watch mode..."
            exit $?
            ;;
        "coverage"|"3")
            run_tests "coverage" "Running tests with coverage report..."
            exit $?
            ;;
        "verbose"|"4")
            run_tests "verbose" "Running tests with verbose output..."
            exit $?
            ;;
        "ui"|"5")
            run_tests "ui" "Opening Vitest UI..."
            exit $?
            ;;
        "all"|"6")
            print_status "Running all test modes sequentially..."
            run_tests "basic" "1/3 - Basic test run..."
            run_tests "verbose" "2/3 - Verbose output..."
            run_tests "coverage" "3/3 - Coverage report..."
            exit $?
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [mode]"
            echo ""
            echo "Modes:"
            echo "  basic     - Run tests once"
            echo "  watch     - Run tests in watch mode"
            echo "  coverage  - Run tests with coverage"
            echo "  verbose   - Run tests with verbose output"
            echo "  ui        - Open Vitest UI"
            echo "  all       - Run all modes sequentially"
            echo "  help      - Show this help"
            exit 0
            ;;
        *)
            print_error "Unknown argument: $1"
            echo "Use '$0 help' for usage information."
            exit 1
            ;;
    esac
fi

# Interactive mode
while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1|"basic")
            run_tests "basic" "Running basic tests..."
            ;;
        2|"watch")
            run_tests "watch" "Running tests in watch mode..."
            ;;
        3|"coverage")
            run_tests "coverage" "Running tests with coverage report..."
            ;;
        4|"verbose")
            run_tests "verbose" "Running tests with verbose output..."
            ;;
        5|"ui")
            run_tests "ui" "Opening Vitest UI..."
            ;;
        6|"all")
            print_status "Running all test modes sequentially..."
            run_tests "basic" "1/3 - Basic test run..."
            run_tests "verbose" "2/3 - Verbose output..."
            run_tests "coverage" "3/3 - Coverage report..."
            ;;
        q|Q|"quit"|"exit")
            print_status "Goodbye!"
            exit 0
            ;;
        *)
            print_warning "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done
