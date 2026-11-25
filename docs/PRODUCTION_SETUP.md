# Production Setup Guide

This document explains how to configure the DevOps Monitoring UI for production use.

## 🚀 Quick Demo vs Production

- **Demo Mode**: Works out-of-the-box with default credentials (demo@example.com / demo123)
- **Production Mode**: Requires proper environment configuration for security

## 🔧 Environment Variables

For production deployment, set these environment variables:

### Required Variables

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-secret-key-here

# Alertmanager webhook authentication (required by docker-compose.yml)
ALERT_WEBHOOK_TOKEN=your-secure-webhook-token

# Disable demo login accounts in exposed production deployments
ENABLE_DEMO_AUTH=false
```

### Optional Variables

```bash
# Runtime notification config location (defaults to /tmp/config.json in Docker)
CONFIG_PATH=/tmp/config.json

# SQLite database URL used by prisma/schema.prisma
DATABASE_URL="file:./dev.db"

# OAuth Providers (when extending auth with OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@your-domain.com
```

## 🔐 Security Considerations

1. **Generate `NEXTAUTH_SECRET` and `ALERT_WEBHOOK_TOKEN`** (`./scripts/setup-env.sh` or `.\scripts\devops-monitor.ps1 init-env`):
   ```bash
   openssl rand -base64 32
   ```

2. **Disable demo credentials** (`ENABLE_DEMO_AUTH=false`) and change default Grafana credentials before exposing the stack.

3. **Keep backend ports private** (Prometheus `9090`, Loki `3100`, Alertmanager `9093`, Blackbox `9115`) — the Next.js proxy communicates over the internal Docker network.

4. **Run with least privilege**: `docker-compose.yml` enforces `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges:true`, and distroless `65532:65532` execution on the UI service.

## 📦 Deployment Platforms

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables
4. Redeploy your application

### Docker
```bash
# Generate .env and alertmanager/webhook_token safely
./scripts/setup-env.sh
# Edit .env with your production values (e.g., ENABLE_DEMO_AUTH=false)
docker compose up -d
```

### Other Platforms
Set the environment variables according to your platform's documentation.

## 🎯 Demo Credentials (Preview Only)

For testing the preview version:
- **Email**: demo@example.com
- **Password**: demo123

**⚠️ These credentials are for demo purposes only and should not be used in production.**

## 📞 Support

If you need help with production setup, please refer to the main documentation or create an issue in the repository.
