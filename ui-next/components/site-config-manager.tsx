'use client';

import React, { useState } from 'react';
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
import { Save, RefreshCw, Eye, Settings, Palette, Globe, Building, Shield } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Configuration Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Configuration</h2>
          <p className="text-muted-foreground">
            Manage your site's SEO, branding, and general settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure your site's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', 'name', e.target.value)}
                    placeholder="DevOps Monitor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Site URL</Label>
                  <Input
                    id="url"
                    value={formData.url || ''}
                    onChange={(e) => handleInputChange('url', 'url', e.target.value)}
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', 'description', e.target.value)}
                  placeholder="Describe your monitoring platform..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => handleNestedInputChange('contact', 'contact', 'email', e.target.value)}
                  placeholder="support@your-site.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Configuration</CardTitle>
              <CardDescription>
                Optimize your site for search engines and social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO Title</Label>
                <Input
                  id="seo-title"
                  value={formData.seo?.title || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'title', e.target.value)}
                  placeholder="Your Site Title - SEO Optimized"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO Description</Label>
                <Textarea
                  id="seo-description"
                  value={formData.seo?.description || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'description', e.target.value)}
                  placeholder="A compelling description for search engines..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords (comma-separated)</Label>
                <Input
                  id="seo-keywords"
                  value={formData.seo?.keywords?.join(', ') || ''}
                  onChange={(e) => handleNestedInputChange('seo', 'seo', 'keywords', e.target.value.split(', '))}
                  placeholder="monitoring, devops, metrics, alerts"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og-title">Open Graph Title</Label>
                  <Input
                    id="og-title"
                    value={formData.seo?.og?.title || ''}
                    onChange={(e) => handleNestedInputChange('seo', 'og', 'title', e.target.value)}
                    placeholder="Social Media Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og-image">Open Graph Image</Label>
                  <Input
                    id="og-image"
                    value={formData.seo?.og?.image || ''}
                    onChange={(e) => handleNestedInputChange('seo', 'og', 'image', e.target.value)}
                    placeholder="/banner.png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Visual Identity</CardTitle>
              <CardDescription>
                Customize your site's visual appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-light">Light Logo</Label>
                  <Input
                    id="logo-light"
                    value={formData.branding?.logo?.light || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'light', e.target.value)}
                    placeholder="/logo-light.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-dark">Dark Logo</Label>
                  <Input
                    id="logo-dark"
                    value={formData.branding?.logo?.dark || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'dark', e.target.value)}
                    placeholder="/logo-dark.png"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <Input
                    id="favicon"
                    value={formData.branding?.logo?.favicon || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'favicon', e.target.value)}
                    placeholder="/favicon.ico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apple-touch-icon">Apple Touch Icon</Label>
                  <Input
                    id="apple-touch-icon"
                    value={formData.branding?.logo?.apple_touch_icon || ''}
                    onChange={(e) => handleNestedInputChange('branding', 'logo', 'apple_touch_icon', e.target.value)}
                    placeholder="/apple-touch-icon.png"
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Brand Colors</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={formData.branding?.colors?.primary || '#3b82f6'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'primary', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={formData.branding?.colors?.secondary || '#10b981'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'secondary', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Input
                      id="accent-color"
                      type="color"
                      value={formData.branding?.colors?.accent || '#f59e0b'}
                      onChange={(e) => handleNestedInputChange('branding', 'colors', 'accent', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Add your company details and legal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={formData.company?.name || ''}
                    onChange={(e) => handleNestedInputChange('company', 'company', 'name', e.target.value)}
                    placeholder="Your Company Inc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-founded">Founded</Label>
                  <Input
                    id="company-founded"
                    value={formData.company?.founded || ''}
                    onChange={(e) => handleNestedInputChange('company', 'company', 'founded', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-description">Company Description</Label>
                <Textarea
                  id="company-description"
                  value={formData.company?.description || ''}
                  onChange={(e) => handleNestedInputChange('company', 'company', 'description', e.target.value)}
                  placeholder="Describe your company..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright">Copyright Notice</Label>
                <Input
                  id="copyright"
                  value={formData.legal?.copyright || ''}
                  onChange={(e) => handleNestedInputChange('legal', 'legal', 'copyright', e.target.value)}
                  placeholder="© 2024 Your Company. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable specific features of your monitoring platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(formData.features || {}).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium capitalize">
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
