# Prometheus API Integration

This document describes the Prometheus API integration implemented in Phase 1 of the DevOps Monitoring UI.

## Overview

The UI now integrates with Prometheus to fetch real-time system metrics instead of using hardcoded mock data. All metrics are automatically refreshed every 5 seconds and displayed in real-time charts and cards.

## Features Implemented

### ✅ Phase 1 - Metrics (Prometheus API Integration)

- **Real-time Data**: Replaced all hardcoded UI numbers with live Prometheus metrics
- **Auto-refresh**: Metrics automatically refresh every 5 seconds
- **React Query Integration**: Uses React Query for efficient data fetching and caching
- **Error Handling**: Graceful error handling with user-friendly error messages
- **Loading States**: Loading indicators while fetching data

### Metrics Available

1. **CPU Usage** - Current CPU utilization percentage
2. **Memory Usage** - Current RAM utilization percentage  
3. **Disk Usage** - Current storage utilization percentage
4. **Network Traffic** - Inbound and outbound network throughput
5. **System Load** - 1, 5, and 15-minute load averages

## Architecture

### Components

- **`PrometheusAPI`** (`lib/prometheus-api.ts`) - Service class for all Prometheus API calls
- **Custom Hooks** (`lib/hooks/use-prometheus-metrics.ts`) - React Query hooks for data fetching
- **`MetricsCard`** (`components/metrics-card.tsx`) - Reusable card component for displaying metrics
- **`MetricsChart`** (`components/metrics-chart.tsx`) - Chart component for time-series data
- **`MetricsOverview`** (`components/metrics-overview.tsx`) - Overview component with key metrics

### Data Flow

1. **Prometheus** → **PrometheusAPI** → **Custom Hooks** → **React Components**
2. **Auto-refresh**: React Query handles automatic refetching every 5 seconds
3. **Caching**: React Query provides intelligent caching and background updates

## Configuration

### Environment Variables

Set the following environment variable to configure the Prometheus endpoint:

```bash
NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090
```

### Default Configuration

If no environment variable is set, the UI defaults to `http://localhost:9090` (the standard Prometheus port).

## Prometheus Queries Used

### CPU Usage
```promql
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

### Memory Usage
```promql
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100
```

### Disk Usage
```promql
(1 - (node_filesystem_avail_bytes{mountpoint="/",fstype!="rootfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="rootfs"})) * 100
```

### Network Traffic
```promql
# Inbound
rate(node_network_receive_bytes_total[5m]) / 1024 / 1024

# Outbound  
rate(node_network_transmit_bytes_total[5m]) / 1024 / 1024
```

### System Load
```promql
node_load1, node_load5, node_load15
```

## Usage Examples

### Basic Metrics Card

```tsx
import { MetricsCard } from '@/components/metrics-card';
import { useCPUUsage } from '@/lib/hooks/use-prometheus-metrics';

function CPUCard() {
  const cpuUsage = useCPUUsage();
  
  return (
    <MetricsCard
      title="CPU Usage"
      description="Current CPU utilization"
      value={cpuUsage.data || 0}
      unit="%"
      percentage={cpuUsage.data || 0}
      isLoading={cpuUsage.isLoading}
      isError={cpuUsage.isError}
      errorMessage="Failed to load CPU usage"
    />
  );
}
```

### Time Series Chart

```tsx
import { MetricsChart } from '@/components/metrics-chart';
import { useCPUUsageRange } from '@/lib/hooks/use-prometheus-metrics';

function CPUChart() {
  const cpuRange = useCPUUsageRange(start, end);
  
  return (
    <MetricsChart
      title="CPU Usage Over Time"
      description="CPU utilization trends"
      data={cpuRange.data || []}
      dataKeys={[
        { key: 'value', color: '#3b82f6', name: 'CPU Usage' },
      ]}
      isLoading={cpuRange.isLoading}
      isError={cpuRange.isError}
      height={400}
      yAxisDomain={[0, 100]}
      formatYAxis={(value) => `${value}%`}
    />
  );
}
```

## Error Handling

The system includes comprehensive error handling:

- **Network Errors**: Displays user-friendly error messages
- **Data Validation**: Handles missing or malformed data gracefully
- **Retry Logic**: Automatically retries failed requests
- **Fallback UI**: Shows appropriate loading and error states

## Performance Features

- **Background Updates**: Data refreshes without interrupting user interaction
- **Smart Caching**: React Query optimizes data fetching and caching
- **Debounced Updates**: Prevents excessive API calls during rapid state changes
- **Efficient Re-renders**: Only updates components when data actually changes

## Troubleshooting

### Common Issues

1. **Prometheus Connection Failed**
   - Verify Prometheus is running on the configured port
   - Check firewall settings
   - Ensure CORS is properly configured

2. **No Data Displayed**
   - Verify Node Exporter is running and collecting metrics
   - Check Prometheus targets are healthy
   - Verify the metrics queries are valid for your setup

3. **Slow Performance**
   - Check Prometheus query performance
   - Verify network latency between UI and Prometheus
   - Consider adjusting refresh intervals

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages and API call information.

## Future Enhancements

### Phase 2 - Logs (Loki Integration)
- Real-time log streaming
- Log search and filtering
- Log correlation with metrics

### Phase 3 - Alerts (Alertmanager Integration)
- Alert management and silencing
- Alert history and trends
- Custom alert rules

### Phase 4 - Advanced Features
- Custom dashboard creation
- Metric correlation analysis
- Performance optimization recommendations
- Export and reporting capabilities

## Contributing

When adding new metrics:

1. Add the query to `PrometheusAPI` class
2. Create corresponding custom hooks
3. Update the UI components to use the new data
4. Add proper error handling and loading states
5. Update this documentation

## Support

For issues or questions about the Prometheus integration:

1. Check the browser console for error messages
2. Verify Prometheus configuration and targets
3. Review the metrics queries for your specific environment
4. Check the troubleshooting section above
