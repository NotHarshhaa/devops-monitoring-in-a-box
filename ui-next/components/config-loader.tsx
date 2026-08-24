// Configuration loader component for importing/exporting config files

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMultiTenantConfig } from "@/lib/hooks/use-multi-tenant-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload01Icon, 
  Download01Icon, 
  File01Icon, 
  CheckmarkCircle01Icon, 
  AlertCircleIcon, 
  Loading03Icon,
  Copy01Icon,
  RefreshIcon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ClientOnly } from "./client-only";

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
  } = useMultiTenantConfig();
  
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
    <ClientOnly fallback={
      <div className={cn("space-y-6", className)}>
        <Card className="border border-border bg-card">
          <CardContent className="flex items-center justify-center h-32">
            <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    }>
      <div className={cn("space-y-6", className)}>
        {/* Configuration Summary */}
        <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
            Current Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Overview of the current monitoring configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 border border-border">
              <div className="text-2xl font-bold text-foreground">{configSummary.metrics.total}</div>
              <div className="text-sm text-muted-foreground">Metrics</div>
            </div>
            <div className="text-center p-3 border border-border">
              <div className="text-2xl font-bold text-foreground">{configSummary.services.total}</div>
              <div className="text-sm text-muted-foreground">Services</div>
            </div>
            <div className="text-center p-3 border border-border">
              <div className="text-2xl font-bold text-foreground">{configSummary.logs.limit}</div>
              <div className="text-sm text-muted-foreground">Log Limit</div>
            </div>
            <div className="text-center p-3 border border-border">
              <div className="text-2xl font-bold text-foreground">{configSummary.alerts.severity_levels}</div>
              <div className="text-sm text-muted-foreground">Alert Levels</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-border">v{configSummary.version}</Badge>
            <Badge variant="outline" className="border-border">
              {configSummary.dashboard.refresh_interval} refresh
            </Badge>
            <Badge variant="outline" className="border-border">
              {configSummary.metrics.groups} groups
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Configuration */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HugeiconsIcon icon={Download01Icon} className="h-5 w-5" />
              Export Configuration
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Download or copy the current configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleExportConfig} className="flex-1 gap-2">
                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                Download JSON
              </Button>
              <Button variant="outline" onClick={handleCopyConfig} className="border-border hover:bg-muted">
                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Export your current configuration to share or backup
            </div>
          </CardContent>
        </Card>

        {/* Import Configuration */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <HugeiconsIcon icon={Upload01Icon} className="h-5 w-5" />
              Import Configuration
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Load configuration from a JSON file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="config-file" className="text-foreground">Select Configuration File</Label>
              <Input
                id="config-file"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="mt-1 bg-card border-border"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Choose a JSON configuration file to import
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON Editor */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
                Configuration Editor
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Edit configuration directly in JSON format
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="border-border hover:bg-muted"
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetConfig}
                className="gap-2 border-border hover:bg-muted"
              >
                <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="json-editor" className="text-foreground">JSON Configuration</Label>
            <Textarea
              id="json-editor"
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste your JSON configuration here..."
              className="mt-1 min-h-[300px] font-mono text-sm bg-card border-border"
            />
          </div>

          {/* Validation Results */}
          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("p-4 border",
                validationResult.valid
                  ? "border-border bg-muted"
                  : "border-destructive bg-destructive/10"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-foreground" />
                ) : (
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-destructive" />
                )}
                <span className={cn("font-medium",
                  validationResult.valid ? "text-foreground" : "text-destructive"
                )}>
                  {validationResult.valid ? 'Configuration Valid' : 'Configuration Invalid'}
                </span>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm font-medium text-destructive mb-1">Errors:</div>
                  <ul className="text-sm text-destructive list-disc list-inside">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-foreground mb-1">Warnings:</div>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
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
              className="flex-1 gap-2"
            >
              {isValidating || isLoading ? (
                <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Upload01Icon} className="h-4 w-4" />
              )}
              Load Configuration
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-destructive bg-destructive/10"
            >
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-destructive" />
                <span className="text-destructive font-medium">Error</span>
              </div>
              <p className="text-destructive text-sm mt-1">{error}</p>
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
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Configuration Preview</CardTitle>
              <CardDescription className="text-muted-foreground">
                Current configuration in JSON format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 border border-border overflow-auto text-sm font-mono">
                {exportConfig()}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>
    </ClientOnly>
  );
}
