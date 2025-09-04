#!/bin/bash

# Setup script for DevOps Monitoring UI environment variables
echo "Setting up environment variables for DevOps Monitoring UI..."

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Get the project root directory (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
UI_NEXT_DIR="$PROJECT_ROOT/ui-next"

# Change to ui-next directory
cd "$UI_NEXT_DIR" || {
    echo "❌ Failed to change to ui-next directory."
    exit 1
}

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="devops-monitoring-secret-key-2024-production-ready"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT=""
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""
EOF
    echo "✅ .env.local file created successfully!"
else
    echo "⚠️  .env.local file already exists. Skipping creation."
fi

echo ""
echo "🔧 Environment setup complete!"
echo ""
echo "For Vercel deployment, make sure to set these environment variables in your Vercel dashboard:"
echo "  - NEXTAUTH_URL: https://devops-monitoring-in-a-box.vercel.app"
echo "  - NEXTAUTH_SECRET: devops-monitoring-secret-key-2024-production-ready"
echo "  - DATABASE_URL: file:./dev.db"
echo ""
echo "You can also run 'vercel env add' to add them via CLI."
