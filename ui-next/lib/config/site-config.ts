// Site Configuration for DevOps Monitoring System
import { SiteConfig } from './types';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  // Basic Site Information
  name: 'Monitoring in a Box',
  description: 'Modern monitoring solution for your DevOps infrastructure with real-time metrics, logs, and alerts',
  url: 'http://localhost:3000',
  version: '1.0.0',
  
  // SEO Configuration
  seo: {
    title: 'Monitoring in a Box - Modern Infrastructure Monitoring',
    description: 'Comprehensive DevOps monitoring solution with real-time metrics, centralized logging, and intelligent alerting. Monitor your infrastructure with Prometheus, Grafana, and Loki integration.',
    keywords: [
      'devops monitoring',
      'infrastructure monitoring',
      'prometheus',
      'grafana',
      'loki',
      'alertmanager',
      'metrics',
      'logs',
      'alerts',
      'observability',
      'system monitoring',
      'application monitoring'
    ],
    author: 'Monitoring in a Box Team',
    robots: 'index, follow',
    canonical: 'http://localhost:3000',
    og: {
      title: 'Monitoring in a Box - Modern Infrastructure Monitoring',
      description: 'Comprehensive DevOps monitoring solution with real-time metrics, centralized logging, and intelligent alerting.',
      type: 'website',
      image: '/banner.png',
      url: 'http://localhost:3000',
      site_name: 'Monitoring in a Box'
    },
    twitter: {
      card: 'summary_large_image',
      site: '@monitoringinabox',
      creator: '@monitoringinabox',
      title: 'Monitoring in a Box - Modern Infrastructure Monitoring',
      description: 'Comprehensive DevOps monitoring solution with real-time metrics, centralized logging, and intelligent alerting.',
      image: '/banner.png'
    }
  },
  
  // Branding Configuration
  branding: {
    logo: {
      light: '/logo-light.png',
      dark: '/logo-dark.png',
      favicon: '/favicon.ico',
      apple_touch_icon: '/apple-touch-icon.png'
    },
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc'
    },
    fonts: {
      primary: 'Inter',
      secondary: 'system-ui, sans-serif'
    }
  },
  
  // Contact Information
  contact: {
    email: 'support@monitoringinabox.com',
    phone: '+1 (555) 123-4567',
    address: '123 DevOps Street, Monitoring City, MC 12345',
    social: {
      twitter: 'https://twitter.com/monitoringinabox',
      linkedin: 'https://linkedin.com/company/devops-monitor',
      github: 'https://github.com/monitoring-in-a-box',
      discord: 'https://discord.gg/monitoring-in-a-box'
    }
  },
  
  // Company Information
  company: {
    name: 'Monitoring in a Box Inc.',
    description: 'Leading provider of modern DevOps monitoring solutions',
    founded: '2025',
    location: 'San Francisco, CA'
  },
  
  // Legal Information
  legal: {
    privacy_policy_url: '/privacy-policy',
    terms_of_service_url: '/terms-of-service',
    cookie_policy_url: '/cookie-policy',
    copyright: '© 2025 Monitoring in a Box Inc. All rights reserved.'
  },
  
  // Feature Flags
  features: {
    analytics: true,
    notifications: true,
    multi_tenant: true,
    plugins: true,
    api_docs: true
  }
};

// Site Configuration Manager
export class SiteConfigManager {
  private static instance: SiteConfigManager;
  private config: SiteConfig;
  private listeners: Array<(config: SiteConfig) => void> = [];

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): SiteConfigManager {
    if (!SiteConfigManager.instance) {
      SiteConfigManager.instance = new SiteConfigManager();
    }
    return SiteConfigManager.instance;
  }

  public getConfig(): SiteConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<SiteConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.notifyListeners();
  }

  public getSEOConfig() {
    return this.config.seo;
  }

  public getBrandingConfig() {
    return this.config.branding;
  }

  public getContactConfig() {
    return this.config.contact;
  }

  public getCompanyConfig() {
    return this.config.company;
  }

  public getLegalConfig() {
    return this.config.legal;
  }

  public getFeatureFlags() {
    return this.config.features;
  }

  public isFeatureEnabled(feature: keyof SiteConfig['features']): boolean {
    return this.config.features[feature];
  }

  public addListener(callback: (config: SiteConfig) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.config));
  }

  private loadConfig(): SiteConfig {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('site-config');
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...DEFAULT_SITE_CONFIG, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load site config from localStorage:', error);
      }
    }
    return DEFAULT_SITE_CONFIG;
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('site-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save site config to localStorage:', error);
      }
    }
  }
}

// Export singleton instance
export const siteConfigManager = SiteConfigManager.getInstance();
