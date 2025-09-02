// Configuration for the DevOps Monitoring UI
export const config = {
  // Prometheus API Configuration
  prometheus: {
    baseURL: process.env.NEXT_PUBLIC_PROMETHEUS_URL || 'http://localhost:9090',
    // Default time range for charts (in hours)
    defaultTimeRange: 24,
    // Auto-refresh interval in milliseconds
    refreshInterval: 5000,
  },
  
  // Loki API Configuration
  loki: {
    baseURL: process.env.NEXT_PUBLIC_LOKI_URL || 'http://localhost:3100',
    // Default time range for logs (in hours)
    defaultTimeRange: 1,
    // Auto-refresh interval in milliseconds
    refreshInterval: 10000,
    // Maximum number of log entries to fetch
    maxEntries: 1000,
  },
  
  // Alertmanager API Configuration
  alertmanager: {
    baseURL: process.env.NEXT_PUBLIC_ALERTMANAGER_URL || 'http://localhost:9093',
    // Auto-refresh interval in milliseconds
    refreshInterval: 5000,
    // Maximum number of alerts to fetch
    maxAlerts: 1000,
  },
  
  // UI Configuration
  ui: {
    // Chart heights
    chartHeights: {
      overview: 350,
      detail: 400,
      small: 300,
    },
    // Animation durations
    animations: {
      fadeIn: 500,
      slideUp: 500,
      stagger: 100,
    },
    // Refresh intervals (in milliseconds)
    refreshIntervals: {
      fast: 5000,    // 5 seconds
      normal: 15000, // 15 seconds
      slow: 60000,   // 1 minute
      manual: 0,     // Manual refresh only
    },
    // Mobile breakpoints
    breakpoints: {
      sm: 640,   // Small screens
      md: 768,   // Medium screens
      lg: 1024,  // Large screens
      xl: 1280,  // Extra large screens
    },
  },
  
  // Metrics Configuration
  metrics: {
    // Thresholds for status indicators
    thresholds: {
      cpu: {
        warning: 60,
        critical: 80,
      },
      memory: {
        warning: 75,
        critical: 90,
      },
      disk: {
        warning: 80,
        critical: 90,
      },
      load: {
        warning: 1.0,
        critical: 2.0,
      },
    },
  },
};
