#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║             DevOps Monitor UI Next.js Setup              ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed. Please install Node.js 18+ before continuing.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed. Please install npm before continuing.${NC}"
    exit 1
fi

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
UI_NEXT_DIR="$PROJECT_ROOT/ui-next"

echo -e "${GREEN}[INFO] Setting up Next.js UI in $UI_NEXT_DIR${NC}"

# Check if ui-next directory exists
if [ ! -d "$UI_NEXT_DIR" ]; then
    echo -e "${RED}[ERROR] ui-next directory not found. Make sure you're running this script from the project root.${NC}"
    exit 1
fi

# Change to ui-next directory
cd "$UI_NEXT_DIR" || {
    echo -e "${RED}[ERROR] Failed to change to ui-next directory.${NC}"
    exit 1
}

# Install dependencies
echo -e "${GREEN}[INFO] Installing dependencies...${NC}"
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to install dependencies.${NC}"
    exit 1
fi

echo -e "${GREEN}[INFO] Dependencies installed successfully.${NC}"

# Build the Next.js app
echo -e "${GREEN}[INFO] Building the Next.js app...${NC}"
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERROR] Failed to build the Next.js app.${NC}"
    exit 1
fi

echo -e "${GREEN}[INFO] Next.js app built successfully.${NC}"

# Create start-ui.sh script
echo -e "${GREEN}[INFO] Creating start-ui.sh script...${NC}"
cat > "$SCRIPT_DIR/start-ui.sh" << 'EOL'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$SCRIPT_DIR/ui-next"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║              Starting DevOps Monitor UI                 ║${NC}"
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
EOL

# Make start-ui.sh executable
chmod +x "$SCRIPT_DIR/start-ui.sh"

echo -e "${GREEN}[INFO] start-ui.sh script created successfully.${NC}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}║               Setup completed successfully!              ║${NC}"
echo -e "${BLUE}║                                                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}To start the Next.js UI, run:${NC}"
echo -e "  ${BLUE}./start-ui.sh${NC}"
echo ""
echo -e "${GREEN}The UI will be available at:${NC} http://localhost:3001"
echo ""
