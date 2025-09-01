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
