/**
 * Demo Application for Monitoring in a Box
 * 
 * This application demonstrates how to integrate with Prometheus, Loki, and Alertmanager.
 * It generates various metrics, logs, and can simulate different scenarios.
 */

const express = require('express');
const client = require('prom-client');
const winston = require('winston');

// Initialize Prometheus metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom application metrics
const httpRequestDuration = new client.Histogram({
  name: 'demo_app_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
  name: 'demo_app_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const demoAppErrors = new client.Counter({
  name: 'demo_app_errors_total',
  help: 'Total number of errors',
  labelNames: ['type']
});

const demoAppActiveUsers = new client.Gauge({
  name: 'demo_app_active_users',
  help: 'Number of active users'
});

const demoAppResponseTime = new client.Gauge({
  name: 'demo_app_response_time_seconds',
  help: 'Current response time in seconds'
});

const demoAppMemoryUsage = new client.Gauge({
  name: 'demo_app_memory_usage_bytes',
  help: 'Memory usage in bytes'
});

const demoAppCpuUsage = new client.Gauge({
  name: 'demo_app_cpu_usage_percent',
  help: 'CPU usage percentage'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(demoAppErrors);
register.registerMetric(demoAppActiveUsers);
register.registerMetric(demoAppResponseTime);
register.registerMetric(demoAppMemoryUsage);
register.registerMetric(demoAppCpuUsage);

// Initialize Winston logger
// Logs will be collected by Promtail from Docker container logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    app: 'demo-app',
    environment: 'demo'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

const app = express();
app.use(express.json());

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status: res.statusCode },
      duration
    );
    httpRequestTotal.inc({ method: req.method, route: req.route?.path || req.path, status: res.statusCode });
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(3)}s`,
      ip: req.ip
    });
  });
  
  next();
});

// State for demo scenarios
let state = {
  activeUsers: 0,
  errorRate: 0,
  responseTime: 100,
  memoryUsage: 0,
  cpuUsage: 0,
  simulateErrors: false,
  simulateSlowResponse: false,
  simulateHighLoad: false
};

// Update metrics periodically
setInterval(() => {
  demoAppActiveUsers.set(state.activeUsers);
  demoAppResponseTime.set(state.responseTime / 1000);
  demoAppMemoryUsage.set(state.memoryUsage);
  demoAppCpuUsage.set(state.cpuUsage);
  
  // Simulate memory and CPU usage
  const memUsage = process.memoryUsage();
  state.memoryUsage = memUsage.heapUsed;
  
  // Simulate CPU usage based on state
  state.cpuUsage = state.simulateHighLoad ? 85 + Math.random() * 10 : 20 + Math.random() * 10;
}, 5000);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// Demo endpoints

// Simulate normal API endpoint
app.get('/api/users', (req, res) => {
  if (state.simulateErrors && Math.random() < state.errorRate) {
    demoAppErrors.inc({ type: 'api_error' });
    logger.error('API Error: Failed to fetch users', { endpoint: '/api/users' });
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  const delay = state.simulateSlowResponse ? state.responseTime : 50 + Math.random() * 50;
  setTimeout(() => {
    logger.info('Users fetched successfully', { count: 10 });
    res.json({ users: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` })) });
  }, delay);
});

// Simulate user login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (state.simulateErrors && Math.random() < 0.1) {
    demoAppErrors.inc({ type: 'auth_error' });
    logger.warn('Login failed', { username, reason: 'Invalid credentials' });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  state.activeUsers++;
  logger.info('User logged in', { username, activeUsers: state.activeUsers });
  res.json({ success: true, token: 'demo-token-12345' });
});

// Simulate user logout
app.post('/api/logout', (req, res) => {
  if (state.activeUsers > 0) {
    state.activeUsers--;
  }
  logger.info('User logged out', { activeUsers: state.activeUsers });
  res.json({ success: true });
});

// Simulate data processing
app.post('/api/process', (req, res) => {
  const { data } = req.body;
  
  if (state.simulateErrors && Math.random() < state.errorRate) {
    demoAppErrors.inc({ type: 'processing_error' });
    logger.error('Processing error', { dataSize: data?.length || 0 });
    return res.status(500).json({ error: 'Processing failed' });
  }
  
  const processingTime = state.simulateSlowResponse ? state.responseTime : 100 + Math.random() * 200;
  setTimeout(() => {
    logger.info('Data processed successfully', { 
      dataSize: data?.length || 0,
      processingTime: `${processingTime}ms`
    });
    res.json({ success: true, processed: data?.length || 0 });
  }, processingTime);
});

// Demo control endpoints

// Get current state
app.get('/api/demo/state', (req, res) => {
  res.json(state);
});

// Simulate errors
app.post('/api/demo/errors', (req, res) => {
  const { enabled, rate = 0.1 } = req.body;
  state.simulateErrors = enabled !== undefined ? enabled : !state.simulateErrors;
  state.errorRate = rate;
  
  logger.info('Error simulation updated', { enabled: state.simulateErrors, rate: state.errorRate });
  res.json({ success: true, state });
});

// Simulate slow responses
app.post('/api/demo/slow', (req, res) => {
  const { enabled, delay = 2000 } = req.body;
  state.simulateSlowResponse = enabled !== undefined ? enabled : !state.simulateSlowResponse;
  state.responseTime = delay;
  
  logger.info('Slow response simulation updated', { enabled: state.simulateSlowResponse, delay });
  res.json({ success: true, state });
});

// Simulate high load
app.post('/api/demo/load', (req, res) => {
  const { enabled } = req.body;
  state.simulateHighLoad = enabled !== undefined ? enabled : !state.simulateHighLoad;
  
  if (state.simulateHighLoad) {
    state.activeUsers = 100;
    state.cpuUsage = 90;
    state.memoryUsage = 500 * 1024 * 1024; // 500MB
    logger.warn('High load simulation enabled', { activeUsers: state.activeUsers });
  } else {
    state.activeUsers = Math.max(0, state.activeUsers - 50);
    logger.info('High load simulation disabled');
  }
  
  res.json({ success: true, state });
});

// Generate test logs
app.post('/api/demo/logs', (req, res) => {
  const { count = 10, level = 'info' } = req.body;
  
  for (let i = 0; i < count; i++) {
    const message = `Test log message ${i + 1}`;
    switch (level) {
      case 'error':
        logger.error(message, { logIndex: i, timestamp: new Date().toISOString() });
        break;
      case 'warn':
        logger.warn(message, { logIndex: i, timestamp: new Date().toISOString() });
        break;
      case 'debug':
        logger.debug(message, { logIndex: i, timestamp: new Date().toISOString() });
        break;
      default:
        logger.info(message, { logIndex: i, timestamp: new Date().toISOString() });
    }
  }
  
  res.json({ success: true, logsGenerated: count, level });
});

// Reset demo state
app.post('/api/demo/reset', (req, res) => {
  state = {
    activeUsers: 0,
    errorRate: 0,
    responseTime: 100,
    memoryUsage: 0,
    cpuUsage: 0,
    simulateErrors: false,
    simulateSlowResponse: false,
    simulateHighLoad: false
  };
  
  logger.info('Demo state reset');
  res.json({ success: true, state });
});

// Generate sample data endpoint
app.get('/api/demo/sample', (req, res) => {
  const samples = [];
  for (let i = 0; i < 100; i++) {
    samples.push({
      id: i,
      value: Math.random() * 100,
      timestamp: new Date(Date.now() - (100 - i) * 60000).toISOString()
    });
  }
  
  logger.info('Sample data generated', { count: samples.length });
  res.json({ data: samples });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Demo application started on port ${PORT}`, {
    port: PORT,
    metricsEndpoint: '/metrics',
    healthEndpoint: '/health'
  });
  
  // Log startup info
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         Demo Application for Monitoring in a Box            ║
╠══════════════════════════════════════════════════════════════╣
║  Health Check:  http://localhost:${PORT}/health              ║
║  Metrics:       http://localhost:${PORT}/metrics             ║
║  API Docs:      http://localhost:${PORT}/api/demo/state      ║
╠══════════════════════════════════════════════════════════════╣
║  Available Demo Endpoints:                                   ║
║  • POST /api/demo/errors  - Simulate errors                  ║
║  • POST /api/demo/slow    - Simulate slow responses         ║
║  • POST /api/demo/load    - Simulate high load               ║
║  • POST /api/demo/logs    - Generate test logs               ║
║  • POST /api/demo/reset   - Reset demo state                 ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

