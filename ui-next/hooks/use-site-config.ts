// React hook for site configuration management
import { useState, useEffect, useCallback } from 'react';
import { SiteConfig } from '@/lib/config/types';
import { siteConfigManager } from '@/lib/config/site-config';

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(() => {
    // Only access siteConfigManager on client side
    if (typeof window !== 'undefined') {
      return siteConfigManager.getConfig();
    }
    // Return default config for SSR
    return siteConfigManager.getConfig();
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Subscribe to configuration changes
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const unsubscribe = siteConfigManager.addListener((newConfig) => {
        setConfig(newConfig);
        setError(null);
      });

      return unsubscribe;
    }
  }, []);

  // Update configuration
  const updateConfig = useCallback(async (updates: Partial<SiteConfig>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      siteConfigManager.updateConfig(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update site configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get specific configuration sections
  const getSEOConfig = useCallback(() => {
    return siteConfigManager.getSEOConfig();
  }, []);

  const getBrandingConfig = useCallback(() => {
    return siteConfigManager.getBrandingConfig();
  }, []);

  const getContactConfig = useCallback(() => {
    return siteConfigManager.getContactConfig();
  }, []);

  const getCompanyConfig = useCallback(() => {
    return siteConfigManager.getCompanyConfig();
  }, []);

  const getLegalConfig = useCallback(() => {
    return siteConfigManager.getLegalConfig();
  }, []);

  const getFeatureFlags = useCallback(() => {
    return siteConfigManager.getFeatureFlags();
  }, []);

  const isFeatureEnabled = useCallback((feature: keyof SiteConfig['features']) => {
    return siteConfigManager.isFeatureEnabled(feature);
  }, []);

  return {
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
    isClient,
  };
}
