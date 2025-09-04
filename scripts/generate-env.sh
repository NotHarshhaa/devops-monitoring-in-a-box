#!/bin/bash

echo "🔐 DevOps Monitoring - Environment Variables Generator"
echo "=================================================="
echo ""

# Generate NEXTAUTH_SECRET
echo "1. NEXTAUTH_SECRET (for authentication):"
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null)
echo "   $NEXTAUTH_SECRET"
echo ""

# Get current domain or ask for it
echo "2. NEXTAUTH_URL (your domain):"
if [ -n "$VERCEL_URL" ]; then
    NEXTAUTH_URL="https://$VERCEL_URL"
    echo "   Auto-detected: $NEXTAUTH_URL"
else
    echo "   For local development: http://localhost:3000"
    echo "   For production: https://your-domain.com"
    echo "   For Vercel: https://your-project.vercel.app"
fi
echo ""

# Database URL examples
echo "3. DATABASE_URL (database connection):"
echo "   For SQLite (development): file:./dev.db"
echo "   For PostgreSQL (production): postgresql://user:pass@host:port/db"
echo "   For Vercel Postgres: (get from Vercel dashboard)"
echo ""

echo "📋 Copy these to your .env.local file:"
echo "======================================"
echo "NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\""
echo "NEXTAUTH_URL=\"http://localhost:3000\""
echo "DATABASE_URL=\"file:./dev.db\""
echo ""

echo "🌐 For Vercel deployment, add these environment variables:"
echo "========================================================="
echo "NEXTAUTH_SECRET = $NEXTAUTH_SECRET"
echo "NEXTAUTH_URL = https://your-project.vercel.app"
echo "DATABASE_URL = (your production database URL)"
echo ""

echo "✅ Done! Use these values in your deployment."
