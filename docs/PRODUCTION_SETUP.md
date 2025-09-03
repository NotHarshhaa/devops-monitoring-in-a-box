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

# Database
DATABASE_URL=postgresql://username:password@host:port/database
```

### Optional Variables

```bash
# OAuth Providers
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

1. **Generate a secure NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

2. **Use a production database** (PostgreSQL recommended)

3. **Configure OAuth providers** for secure authentication

4. **Set up proper email configuration** for notifications

## 📦 Deployment Platforms

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the required variables
4. Redeploy your application

### Docker
```bash
# Create .env file with your variables
cp env.example .env
# Edit .env with your production values
docker-compose up -d
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
