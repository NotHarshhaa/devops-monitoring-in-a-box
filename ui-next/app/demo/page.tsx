'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, Loader2, RefreshCw, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DemoState {
  activeUsers: number;
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  simulateErrors: boolean;
  simulateSlowResponse: boolean;
  simulateHighLoad: boolean;
}

export default function DemoPage() {
  const [state, setState] = useState<DemoState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const DEMO_APP_URL = process.env.NEXT_PUBLIC_DEMO_APP_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchState = async () => {
    try {
      const response = await fetch(`${DEMO_APP_URL}/api/demo/state`);
      const data = await response.json();
      setState(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch demo state:', error);
      setLoading(false);
    }
  };

  const handleAction = async (endpoint: string, data?: any) => {
    setActionLoading(endpoint);
    try {
      const response = await fetch(`${DEMO_APP_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      setState(result.state || state);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const generateLogs = async (count: number, level: string) => {
    setActionLoading('logs');
    try {
      await fetch(`${DEMO_APP_URL}/api/demo/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, level }),
      });
    } catch (error) {
      console.error('Failed to generate logs:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Demo Application Unavailable</CardTitle>
            <CardDescription>
              The demo application is not running. Please start it with docker-compose.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Demo Application Control</h1>
          <p className="text-muted-foreground mt-2">
            Control the demo application to see monitoring in action
          </p>
        </div>
        <Button onClick={fetchState} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current State */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.activeUsers}</div>
            <Badge variant={state.activeUsers > 50 ? 'destructive' : 'default'} className="mt-2">
              {state.activeUsers > 50 ? 'High' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.cpuUsage.toFixed(1)}%</div>
            <Badge variant={state.cpuUsage > 80 ? 'destructive' : state.cpuUsage > 60 ? 'default' : 'secondary'} className="mt-2">
              {state.cpuUsage > 80 ? 'Critical' : state.cpuUsage > 60 ? 'Warning' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.responseTime}ms</div>
            <Badge variant={state.responseTime > 2000 ? 'destructive' : state.responseTime > 1000 ? 'default' : 'secondary'} className="mt-2">
              {state.responseTime > 2000 ? 'Slow' : state.responseTime > 1000 ? 'Moderate' : 'Fast'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(state.errorRate * 100).toFixed(1)}%</div>
            <Badge variant={state.errorRate > 0.1 ? 'destructive' : 'secondary'} className="mt-2">
              {state.errorRate > 0.1 ? 'High' : 'Low'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Controls */}
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="api">API Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Scenarios</CardTitle>
              <CardDescription>
                Trigger different scenarios to see how monitoring responds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Simulation */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${state.simulateErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium">Error Simulation</div>
                    <div className="text-sm text-muted-foreground">
                      Simulate application errors (triggers alerts)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={state.simulateErrors ? 'destructive' : 'secondary'}>
                    {state.simulateErrors ? 'ON' : 'OFF'}
                  </Badge>
                  <Button
                    onClick={() => handleAction('/api/demo/errors', { enabled: !state.simulateErrors, rate: 0.2 })}
                    variant={state.simulateErrors ? 'destructive' : 'default'}
                    size="sm"
                    disabled={actionLoading === '/api/demo/errors'}
                  >
                    {state.simulateErrors ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {/* Slow Response Simulation */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className={`h-5 w-5 ${state.simulateSlowResponse ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium">Slow Response Simulation</div>
                    <div className="text-sm text-muted-foreground">
                      Simulate slow API responses (triggers performance alerts)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={state.simulateSlowResponse ? 'destructive' : 'secondary'}>
                    {state.simulateSlowResponse ? 'ON' : 'OFF'}
                  </Badge>
                  <Button
                    onClick={() => handleAction('/api/demo/slow', { enabled: !state.simulateSlowResponse, delay: 3000 })}
                    variant={state.simulateSlowResponse ? 'destructive' : 'default'}
                    size="sm"
                    disabled={actionLoading === '/api/demo/slow'}
                  >
                    {state.simulateSlowResponse ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {/* High Load Simulation */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${state.simulateHighLoad ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="font-medium">High Load Simulation</div>
                    <div className="text-sm text-muted-foreground">
                      Simulate high CPU and memory usage (triggers resource alerts)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={state.simulateHighLoad ? 'destructive' : 'secondary'}>
                    {state.simulateHighLoad ? 'ON' : 'OFF'}
                  </Badge>
                  <Button
                    onClick={() => handleAction('/api/demo/load', { enabled: !state.simulateHighLoad })}
                    variant={state.simulateHighLoad ? 'destructive' : 'default'}
                    size="sm"
                    disabled={actionLoading === '/api/demo/load'}
                  >
                    {state.simulateHighLoad ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>

              {/* Reset Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => handleAction('/api/demo/reset')}
                  variant="outline"
                  className="w-full"
                  disabled={actionLoading === '/api/demo/reset'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All Simulations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Test Logs</CardTitle>
              <CardDescription>
                Generate logs to see them appear in Loki
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  onClick={() => generateLogs(10, 'info')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === 'logs'}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  10 Info
                </Button>
                <Button
                  onClick={() => generateLogs(10, 'warn')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === 'logs'}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  10 Warn
                </Button>
                <Button
                  onClick={() => generateLogs(10, 'error')}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading === 'logs'}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  10 Error
                </Button>
                <Button
                  onClick={() => generateLogs(50, 'error')}
                  variant="destructive"
                  size="sm"
                  disabled={actionLoading === 'logs'}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  50 Errors
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                View generated logs in the Logs page or Grafana Loki interface
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                Test the demo application API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">GET /api/users</div>
                    <div className="text-sm text-muted-foreground">Fetch user list</div>
                  </div>
                  <Button
                    onClick={() => window.open(`${DEMO_APP_URL}/api/users`, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    Test
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">POST /api/login</div>
                    <div className="text-sm text-muted-foreground">Simulate user login</div>
                  </div>
                  <Button
                    onClick={() => {
                      fetch(`${DEMO_APP_URL}/api/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'demo', password: 'demo123' }),
                      }).then(() => fetchState());
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Test
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">GET /metrics</div>
                    <div className="text-sm text-muted-foreground">Prometheus metrics</div>
                  </div>
                  <Button
                    onClick={() => window.open(`${DEMO_APP_URL}/metrics`, '_blank')}
                    variant="outline"
                    size="sm"
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>View monitoring data from the demo app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:9090/graph?g0.expr=demo_app_http_requests_total', '_blank')}>
              <Activity className="h-4 w-4 mr-2" />
              Prometheus Metrics
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:3100/explore?orgId=1&left=%5B%22now-1h%22,%22now%22,%22Loki%22,%7B%22expr%22:%22%7Bapp%3D%5C%22demo-app%5C%22%7D%22%7D%5D', '_blank')}>
              <Activity className="h-4 w-4 mr-2" />
              Loki Logs
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:9093/#/alerts', '_blank')}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Alertmanager
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(`${DEMO_APP_URL}/health`, '_blank')}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Health Check
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

