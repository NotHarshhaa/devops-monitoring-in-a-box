#!/bin/bash

# DevOps Monitor - Main Management Script
# This is a wrapper script that calls the actual script in the scripts/ directory

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the actual management script
exec "$SCRIPT_DIR/scripts/devops-monitor.sh" "$@"
