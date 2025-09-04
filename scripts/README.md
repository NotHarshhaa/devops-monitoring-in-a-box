# 📜 Scripts Directory

This directory contains all the shell scripts for managing the Monitoring in a Box platform. These scripts provide convenient commands for setup, management, and maintenance of the monitoring stack.

## 🚀 Management Scripts

### `devops-monitor.sh`
**Main management script** for the entire monitoring stack.

```bash
# Usage
./scripts/devops-monitor.sh [command]

# Available commands:
./scripts/devops-monitor.sh start     # Start all services
./scripts/devops-monitor.sh stop      # Stop all services
./scripts/devops-monitor.sh restart   # Restart all services
./scripts/devops-monitor.sh status    # Check service status
./scripts/devops-monitor.sh logs      # View service logs
./scripts/devops-monitor.sh ui        # Start UI development server
./scripts/devops-monitor.sh help      # Show help information
```

**Features:**
- Start/stop/restart the entire monitoring stack
- Check service health and status
- View logs from all services
- Start UI development server
- Comprehensive help system

### `start.sh`
**Quick start script** for the monitoring stack.

```bash
# Usage
./scripts/start.sh
```

**Features:**
- Starts all monitoring services with Docker Compose
- Checks if services are already running
- Provides status feedback

### `stop.sh`
**Quick stop script** for the monitoring stack.

```bash
# Usage
./scripts/stop.sh
```

**Features:**
- Stops all monitoring services
- Cleans up containers and networks
- Provides confirmation feedback

### `start-ui.sh`
**UI development server** startup script.

```bash
# Usage
./scripts/start-ui.sh
```

**Features:**
- Starts the Next.js development server
- Enables hot reloading for development
- Sets up proper environment variables

## 🛠️ Setup Scripts

### `setup-ui-next.sh`
**UI setup script** for initial configuration.

```bash
# Usage
./scripts/setup-ui-next.sh
```

**Features:**
- Installs Node.js dependencies
- Sets up Prisma database
- Configures environment variables
- Runs database migrations
- Seeds initial data

### `setup-env.sh`
**Environment setup script** for configuration.

```bash
# Usage
./scripts/setup-env.sh
```

**Features:**
- Creates environment files from templates
- Validates configuration
- Sets up development environment
- Configures database connections

### `generate-env.sh`
**Environment generation script** for creating configuration files.

```bash
# Usage
./scripts/generate-env.sh
```

**Features:**
- Interactive environment configuration
- Generates `.env` files from templates
- Validates configuration values
- Creates production-ready configurations

### `start-full-stack.sh`
**Full stack startup script** for complete monitoring stack.

```bash
# Usage
./scripts/start-full-stack.sh
```

**Features:**
- Starts the complete monitoring stack
- Includes all services and dependencies
- Provides comprehensive startup process
- Handles service dependencies

### `test-docker-build.sh`
**Docker build testing script** for validating container builds.

```bash
# Usage
./scripts/test-docker-build.sh
```

**Features:**
- Tests Docker container builds
- Validates image creation
- Checks for build errors
- Provides build status feedback

## 📋 Quick Reference

### Starting the Platform
```bash
# Start everything
./scripts/devops-monitor.sh start

# Or use the quick start
./scripts/start.sh
```

### Development Workflow
```bash
# Setup for first time
./scripts/setup-ui-next.sh
./scripts/setup-env.sh

# Start development
./scripts/start-ui.sh
```

### Stopping Services
```bash
# Stop everything
./scripts/devops-monitor.sh stop

# Or use the quick stop
./scripts/stop.sh
```

### Checking Status
```bash
# Check all services
./scripts/devops-monitor.sh status

# View logs
./scripts/devops-monitor.sh logs
```

## 🔧 Script Features

### Error Handling
- All scripts include comprehensive error handling
- Clear error messages and exit codes
- Validation of prerequisites and dependencies

### Logging
- Consistent logging format across all scripts
- Verbose and quiet modes available
- Log rotation and management

### Cross-Platform Support
- Compatible with Linux, macOS, and WSL
- Handles different shell environments
- Path resolution for different systems

### Safety Features
- Confirmation prompts for destructive operations
- Backup creation before major changes
- Rollback capabilities for failed operations

## 🚨 Troubleshooting

### Common Issues

#### Permission Denied
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### Docker Not Running
```bash
# Start Docker service
sudo systemctl start docker

# Or on macOS
open -a Docker
```

#### Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :9090

# Kill processes if needed
sudo kill -9 <PID>
```

#### Environment Issues
```bash
# Regenerate environment
./scripts/generate-env.sh

# Or reset completely
rm .env
./scripts/setup-env.sh
```

### Getting Help
```bash
# Show help for main script
./scripts/devops-monitor.sh help

# Check script syntax
bash -n scripts/devops-monitor.sh

# Run in debug mode
bash -x scripts/devops-monitor.sh start
```

## 📝 Adding New Scripts

When adding new scripts to this directory:

1. **Follow naming convention**: Use descriptive names with `.sh` extension
2. **Add shebang**: Start with `#!/bin/bash`
3. **Include help**: Add `--help` or `-h` option
4. **Error handling**: Include proper error handling and exit codes
5. **Documentation**: Update this README with script description
6. **Permissions**: Make executable with `chmod +x`

### Script Template
```bash
#!/bin/bash

# Script description
# Usage: ./scripts/script-name.sh [options]

set -e  # Exit on error
set -u  # Exit on undefined variable

# Default values
VERBOSE=false
DRY_RUN=false

# Help function
show_help() {
    echo "Usage: $0 [options]"
    echo "Options:"
    echo "  -h, --help     Show this help"
    echo "  -v, --verbose  Verbose output"
    echo "  -d, --dry-run  Show what would be done"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main script logic here
echo "Script executed successfully"
```

## 🔗 Related Documentation

- **[Setup Guide](../docs/SETUP.md)** - Detailed setup instructions
- **[Configuration Guide](../docs/CONFIGURATION_GUIDE.md)** - Configuration reference
- **[Project Structure](../docs/PROJECT_STRUCTURE.md)** - Complete project overview
- **[Main README](../README.md)** - Project overview

---

**Need help?** Check our [troubleshooting guide](../docs/TROUBLESHOOTING.md) or reach out to our community!
