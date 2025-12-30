# Demo Application for Monitoring in a Box

This is a sample application designed to demonstrate the monitoring capabilities of the Monitoring in a Box stack.

## Features

- **Prometheus Metrics**: Exposes custom application metrics
- **Loki Logging**: Sends structured logs to Loki
- **Simulation Controls**: API endpoints to simulate various scenarios
- **Health Checks**: Built-in health check endpoint

## Endpoints

### Health & Metrics
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics endpoint

### Demo API
- `GET /api/users` - Simulate user API endpoint
- `POST /api/login` - Simulate user login
- `POST /api/logout` - Simulate user logout
- `POST /api/process` - Simulate data processing

### Demo Controls
- `GET /api/demo/state` - Get current demo state
- `POST /api/demo/errors` - Enable/disable error simulation
  ```json
  { "enabled": true, "rate": 0.1 }
  ```
- `POST /api/demo/slow` - Enable/disable slow response simulation
  ```json
  { "enabled": true, "delay": 2000 }
  ```
- `POST /api/demo/load` - Enable/disable high load simulation
  ```json
  { "enabled": true }
  ```
- `POST /api/demo/logs` - Generate test logs
  ```json
  { "count": 10, "level": "info" }
  ```
- `POST /api/demo/reset` - Reset all demo state
- `GET /api/demo/sample` - Get sample data

## Metrics Exposed

- `demo_app_http_request_duration_seconds` - HTTP request duration histogram
- `demo_app_http_requests_total` - Total HTTP requests counter
- `demo_app_errors_total` - Total errors counter
- `demo_app_active_users` - Active users gauge
- `demo_app_response_time_seconds` - Response time gauge
- `demo_app_memory_usage_bytes` - Memory usage gauge
- `demo_app_cpu_usage_percent` - CPU usage gauge

## Usage

### Running with Docker Compose

The demo app is automatically included in `docker-compose.yml`:

```bash
docker-compose up -d demo-app
```

### Running Locally

```bash
cd demo-app
npm install
npm start
```

The app will be available at `http://localhost:5000`

## Integration with Monitoring Stack

1. **Prometheus**: Automatically scrapes metrics from `/metrics` endpoint
2. **Loki**: Receives logs via Winston-Loki transport
3. **Alertmanager**: Alerts configured in `prometheus/alert_rules.yml`

## Example: Simulating High Load

```bash
# Enable high load simulation
curl -X POST http://localhost:5000/api/demo/load \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Check metrics in Prometheus
# Query: demo_app_cpu_usage_percent
# Query: demo_app_active_users
```

## Example: Generating Errors

```bash
# Enable error simulation
curl -X POST http://localhost:5000/api/demo/errors \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "rate": 0.2}'

# Check alerts in Alertmanager
# View logs in Loki: {app="demo-app", level="error"}
```

## Example: Generating Logs

```bash
# Generate 50 error logs
curl -X POST http://localhost:5000/api/demo/logs \
  -H "Content-Type: application/json" \
  -d '{"count": 50, "level": "error"}'

# View in Loki: {app="demo-app", level="error"}
```

