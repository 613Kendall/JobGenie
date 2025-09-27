// Environment configuration for JobGenie
// Handle both Vite and CRA environment variable patterns
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Try Vite pattern first (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any)[key] || defaultValue;
    }
  }
  
  // Fallback to process.env if available (Node.js or bundled)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  return defaultValue;
};

const getNodeEnv = (): string => {
  // Try multiple ways to get the environment
  if (typeof window !== 'undefined') {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any).MODE || (import.meta.env as any).NODE_ENV || 'development';
    }
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || 'development';
  }
  
  return 'development';
};

const nodeEnv = getNodeEnv();

export const config = {
  // Environment detection
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  
  // API Configuration
  api: {
    baseUrl: getEnvVar('REACT_APP_API_BASE_URL', 'https://api.jobgenie.com'),
    key: getEnvVar('REACT_APP_API_KEY', ''),
    timeout: 10000, // 10 seconds
  },
  
  // Feature flags
  features: {
    useMockData: getEnvVar('REACT_APP_USE_MOCK_DATA', 'true') === 'true' || nodeEnv === 'development',
    enableAnalytics: getEnvVar('REACT_APP_ENABLE_ANALYTICS', 'false') === 'true',
    enableErrorReporting: getEnvVar('REACT_APP_ENABLE_ERROR_REPORTING', 'false') === 'true',
  },
  
  // App configuration
  app: {
    name: 'JobGenie',
    version: getEnvVar('REACT_APP_VERSION', '1.0.0'),
    environment: nodeEnv,
  }
};

// Type definitions for environment variables
interface ImportMetaEnv {
  MODE: string;
  NODE_ENV?: string;
  REACT_APP_API_BASE_URL?: string;
  REACT_APP_API_KEY?: string;
  REACT_APP_USE_MOCK_DATA?: string;
  REACT_APP_ENABLE_ANALYTICS?: string;
  REACT_APP_ENABLE_ERROR_REPORTING?: string;
  REACT_APP_VERSION?: string;
}

// Extend ImportMeta interface
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Also support traditional process.env for compatibility
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      REACT_APP_API_BASE_URL?: string;
      REACT_APP_API_KEY?: string;
      REACT_APP_USE_MOCK_DATA?: string;
      REACT_APP_ENABLE_ANALYTICS?: string;
      REACT_APP_ENABLE_ERROR_REPORTING?: string;
      REACT_APP_VERSION?: string;
    }
  }
}

export default config;