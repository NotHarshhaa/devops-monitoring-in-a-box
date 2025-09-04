#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
UI_DIR="$PROJECT_ROOT/ui-next"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║              Starting DevOps Monitor UI                  ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if UI directory exists
if [ ! -d "$UI_DIR" ]; then
    echo -e "${RED}[ERROR] UI directory not found at: $UI_DIR${NC}"
    exit 1
fi

# Change to UI directory
cd "$UI_DIR" || {
    echo -e "${RED}[ERROR] Failed to change to UI directory.${NC}"
    exit 1
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${GREEN}[INFO] Installing dependencies...${NC}"
    npm install
fi

# Start the Next.js app
echo -e "${GREEN}[INFO] Starting Next.js app on port 3001...${NC}"
npm run dev -- -p 3001

# Check if start was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to start the Next.js app.${NC}"
    exit 1
fi 