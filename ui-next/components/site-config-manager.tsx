'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { SiteConfig } from '@/lib/config/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FloppyDiskIcon, 
  RefreshIcon, 
  EyeIcon, 
  Settings01Icon, 
  PaintBoardIcon, 
  GlobeIcon, 
  Briefcase01Icon, 
  Shield01Icon 
} from '@hugeicons/core-free-icons';
import { toast } from '@/hooks/use-toast';

export function SiteConfigManager() {
  const {
    config,
    updateConfig,
    getSEOConfig,
    getBrandingConfig,
    getContactConfig,
    getCompanyConfig,
    getLegalConfig,
    getFeatureFlags,
    isFeatureEnabled,
    isLoading,
    error,
  } = useSiteConfig();

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<SiteConfig>>(config);

  const handleInputChange = (section: keyof SiteConfig, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: keyof SiteConfig, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [subsection]: {
          ...((prev[section] as any)?.[subsection] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      await updateConfig(formData);
      toast({
        title: 'Configuration Updated',
        description: 'Site configuration has been saved successfully.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setFormData(config);
  };

  if (error) {
    return (
      <Card className="border border-destructive bg-destructive/10">
        <CardHeader>
          <CardTitle className="text-destructive">Configuration Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Site Configuration</h2>
          <p className="text-muted-foreground">
            Manage your site's SEO, branding, and general settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading} className="gap-2 border-border hover:bg-muted">
            <HugeiconsIcon icon={RefreshIcon} className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="gap-2">
            <HugeiconsIcon icon={FloppyDiskIcon} className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-muted p-1">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <HugeiconsIcon icon={PaintBoardIcon} className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <HugeiconsIcon icon={Briefcase01Icon} className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure your site's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Site Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', 'name', e.target.value)}
                    placeholder="DevOps Monitor"
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-foreground">Site URL</Label>
                  <Input
                    id="url"
                    value={formData.url || ''}
                    onChange={(e) => handleInputChange('url', 'url', e.target.value)}
                    placeholder="https://your-site.com"
                    className="bg-card border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Site Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', 'description', e.target.value)}
                  placeholder="Describe your monitoring platform..."
                  rows={3}
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-foreground">Contact Email</Label>
                <Input
                  id="contact-email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'contact', 'email', e.target.value)}
                  placeholder="support@your-site.com"
                  className="bg-card border-border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">SEO Configuration</CardTitle>
              <CardDescription className="text-muted-foreground">
                Optimize your site for search engines and social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title" className="text-foreground">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={formData.seo?.title || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'title', e.target.value)}
                  placeholder="Your Site Title - SEO Optimized"
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description" className="text-foreground">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  value={formData.seo?.description || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'description', e.target.value)}
                  placeholder="A compelling description for search engines..."
                  rows={3}
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords" className="text-foreground">Keywords (comma-separated)</Label>
                <Input
                  id="seo-keywords"
                  value={formData.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'keywords', e.target.value.split(', '))}
                  placeholder="monitoring, devops, metrics, alerts"
                  className="bg-card border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og-title" className="text-foreground">Open Graph Title</Label>
                  <Input
                    id="og-title"
                    value={formData.seo?.og?.title || ''}
                    onChange={(e) => handleNestedInputChange('seo', 'og', 'title', e.target.value)}
                    placeholder="Social Media Title"
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-image" className="text-foreground">Open Graph Image</Label>
                  <Input
                    id="og-image"
                    value={formData.seo?.og?.image || ''}
                    onChange={(e) => handleNestedInputChange('seo', 'og', 'image', e.target.value)}
                    placeholder="/banner.png"
                    className="bg-card border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Branding & Visual Identity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Customize your site's visual appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-light" className="text-foreground">Light Logo</Label>
                  <Input
                    id="logo-light"
                    value={formData.branding?.logo?.light || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'light', e.target.value)}
                    placeholder="/logo-light.png"
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-dark" className="text-foreground">Dark Logo</Label>
                  <Input
                    id="logo-dark"
                    value={formData.branding?.logo?.dark || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'dark', e.target.value)}
                    placeholder="/logo-dark.png"
                    className="bg-card border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="favicon" className="text-foreground">Favicon</Label>
                  <Input
                    id="favicon"
                    value={formData.branding?.logo?.favicon || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'favicon', e.target.value)}
                    placeholder="/favicon.ico"
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apple-touch-icon" className="text-foreground">Apple Touch Icon</Label>
                  <Input
                    id="apple-touch-icon"
                    value={formData.branding?.logo?.apple_touch_icon || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'apple_touch_icon', e.target.value)}
                    placeholder="/apple-touch-icon.png"
                    className="bg-card border-border"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Brand Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color" className="text-foreground">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={formData.branding?.colors?.primary || '#525252'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'primary', e.target.value)}
                      className="bg-card border-border h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color" className="text-foreground">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={formData.branding?.colors?.secondary || '#737373'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'secondary', e.target.value)}
                      className="bg-card border-border h-10 p-1 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color" className="text-foreground">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={formData.branding?.colors?.accent || '#a3a3a3'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'accent', e.target.value)}
                      className="bg-card border-border h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Company Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Add your company details and legal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name" className="text-foreground">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.company?.name || ''}
                    onChange={(e) => handleNestedInputChange('company', 'company', 'name', e.target.value)}
                    placeholder="Your Company Inc."
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-founded" className="text-foreground">Founded</Label>
                  <Input
                    id="company-founded"
                    value={formData.company?.founded || ''}
                    onChange={(e) => handleNestedInputChange('company', 'company', 'founded', e.target.value)}
                    placeholder="2024"
                    className="bg-card border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-description" className="text-foreground">Company Description</Label>
                <Textarea
                  id="company-description"
                  value={formData.company?.description || ''}
                  onChange={(e) => handleNestedInputChange('company', 'company', 'description', e.target.value)}
                  placeholder="Describe your company..."
                  rows={3}
                  className="bg-card border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright" className="text-foreground">Copyright Notice</Label>
                <Input
                  id="copyright"
                  value={formData.legal?.copyright || ''}
                  onChange={(e) => handleNestedInputChange('legal', 'legal', 'copyright', e.target.value)}
                  placeholder="© 2024 Your Company. All rights reserved."
                  className="bg-card border-border"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Feature Flags</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enable or disable specific features of your monitoring platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(formData.features || {}).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium capitalize text-foreground">
                        {feature.replace('_', ' ')}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {getFeatureDescription(feature as keyof SiteConfig['features'])}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('features', 'features', feature, checked)
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getFeatureDescription(feature: keyof SiteConfig['features']): string {
  const descriptions = {
    analytics: 'Enable analytics tracking and reporting',
    notifications: 'Enable notification system for alerts',
    multi_tenant: 'Enable multi-tenant support',
    plugins: 'Enable plugin system for extensions',
    api_docs: 'Enable API documentation and explorer',
  };
  return descriptions[feature] || 'Feature description not available';
}
