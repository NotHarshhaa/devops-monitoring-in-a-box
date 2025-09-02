// Configuration loader component for importing/exporting config files

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useConfig } from "@/lib/hooks/use-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigLoaderProps {
  className?: string;
}

export function ConfigLoader({ className }: ConfigLoaderProps) {
  const { 
    config, 
    loadFromJson, 
    exportConfig, 
    resetToDefault, 
    isLoading, 
    error,
    getConfigSummary 
  } = useConfig();
  
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setJsonInput(text);
      await validateJson(text);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  };

  const validateJson = async (jsonString: string) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await loadFromJson(jsonString);
      setValidationResult(result);
    } catch (err) {
      setValidationResult({
        valid: false,
        errors: [`Validation error: ${err instanceof Error ? err.message : 'Unknown error'}`],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      // Debounce validation
      const timeoutId = setTimeout(() => {
        validateJson(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setValidationResult(null);
    }
  };

  const handleLoadConfig = async () => {
    if (!jsonInput.trim()) return;
    await validateJson(jsonInput);
  };

  const handleExportConfig = () => {
    const configJson = exportConfig();
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monitoring-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(exportConfig());
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy config:', err);
    }
  };

  const handleResetConfig = () => {
    resetToDefault();
    setJsonInput("");
    setValidationResult(null);
  };

  const configSummary = getConfigSummary();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription>
            Overview of the current monitoring configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{configSummary.metrics.total}</div>
              <div className="text-sm text-muted-foreground">Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{configSummary.services.total}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{configSummary.logs.limit}</div>
              <div className="text-sm text-muted-foreground">Log Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{configSummary.alerts.severity_levels}</div>
              <div className="text-sm text-muted-foreground">Alert Levels</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">v{configSummary.version}</Badge>
            <Badge variant="outline">
              {configSummary.dashboard.refresh_interval} refresh
            </Badge>
            <Badge variant="outline">
              {configSummary.metrics.groups} groups
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Configuration
            </CardTitle>
            <CardDescription>
              Download or copy the current configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleExportConfig} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
              <Button variant="outline" onClick={handleCopyConfig}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Export your current configuration to share or backup
            </div>
          </CardContent>
        </Card>

        {/* Import Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Configuration
            </CardTitle>
            <CardDescription>
              Load configuration from a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="config-file">Select Configuration File</Label>
              <Input
                id="config-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="mt-1"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Choose a JSON configuration file to import
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration Editor
              </CardTitle>
              <CardDescription>
                Edit configuration directly in JSON format
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetConfig}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="json-editor">JSON Configuration</Label>
            <Textarea
              id="json-editor"
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste your JSON configuration here..."
              className="mt-1 min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Validation Results */}
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-lg border",
                validationResult.valid
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={cn(
                  "font-medium",
                  validationResult.valid ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"
                )}>
                  {validationResult.valid ? 'Configuration Valid' : 'Configuration Invalid'}
                </span>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Errors:</div>
                  <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Warnings:</div>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleLoadConfig}
              disabled={!jsonInput.trim() || isValidating || isLoading}
              className="flex-1"
            >
              {isValidating || isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Load Configuration
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Configuration Preview</CardTitle>
              <CardDescription>
                Current configuration in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono">
                {exportConfig()}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
