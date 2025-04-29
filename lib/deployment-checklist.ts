import type { ChecklistItem, ChecklistCategory } from "./checklist-types"
import { validateEnv } from "./env"

export const CHECKLIST_CATEGORIES: Record<ChecklistCategory, { name: string; description: string; icon: string }> = {
  environment: {
    name: "Environment & Configuration",
    description: "Environment variables, configuration files, and settings",
    icon: "Settings",
  },
  database: {
    name: "Database",
    description: "Database setup, migrations, and data integrity",
    icon: "Database",
  },
  authentication: {
    name: "Authentication & Security",
    description: "User authentication, authorization, and security measures",
    icon: "Shield",
  },
  performance: {
    name: "Performance",
    description: "Application performance, optimization, and load times",
    icon: "Zap",
  },
  testing: {
    name: "Testing & QA",
    description: "Testing procedures, quality assurance, and bug fixes",
    icon: "CheckCircle",
  },
  accessibility: {
    name: "Accessibility",
    description: "Web accessibility standards and compliance",
    icon: "Accessibility",
  },
  seo: {
    name: "SEO & Metadata",
    description: "Search engine optimization and metadata",
    icon: "Search",
  },
  monitoring: {
    name: "Monitoring & Logging",
    description: "Error tracking, monitoring, and logging",
    icon: "LineChart",
  },
  security: {
    name: "Security",
    description: "Security best practices and vulnerability prevention",
    icon: "Lock",
  },
  documentation: {
    name: "Documentation",
    description: "User documentation, code documentation, and deployment guides",
    icon: "FileText",
  },
}

// Define the deployment checklist items
export const DEPLOYMENT_CHECKLIST: ChecklistItem[] = [
  // Environment & Configuration
  {
    id: "env-required-vars",
    title: "Verify required environment variables",
    description: "Ensure all required environment variables are set in the production environment",
    category: "environment",
    completed: false,
    automated: true,
    automatedCheck: async () => {
      const validation = validateEnv()
      return validation.valid
    },
    critical: true,
  },
  {
    id: "env-secrets",
    title: "Secure sensitive environment variables",
    description: "Ensure all API keys, tokens, and secrets are properly secured and not exposed in client-side code",
    category: "environment",
    completed: false,
    critical: true,
  },
  {
    id: "env-next-config",
    title: "Verify Next.js configuration",
    description: "Check that next.config.js is properly configured for production",
    category: "environment",
    completed: false,
    critical: false,
  },
  {
    id: "env-cors",
    title: "Configure CORS settings",
    description: "Ensure Cross-Origin Resource Sharing (CORS) is properly configured for production APIs",
    category: "environment",
    completed: false,
    critical: true,
  },

  // Database
  {
    id: "db-migrations",
    title: "Run database migrations",
    description: "Ensure all database migrations are applied to the production database",
    category: "database",
    completed: false,
    critical: true,
  },
  {
    id: "db-backup",
    title: "Create database backup",
    description: "Create a backup of the production database before deploying",
    category: "database",
    completed: false,
    critical: true,
  },
  {
    id: "db-indexes",
    title: "Optimize database indexes",
    description: "Ensure database indexes are optimized for production queries",
    category: "database",
    completed: false,
    critical: false,
  },
  {
    id: "db-connection-pool",
    title: "Configure database connection pool",
    description: "Ensure database connection pool is properly configured for production load",
    category: "database",
    completed: false,
    critical: false,
  },

  // Authentication & Security
  {
    id: "auth-routes",
    title: "Secure authentication routes",
    description: "Verify that all authentication routes and middleware are working correctly",
    category: "authentication",
    completed: false,
    critical: true,
  },
  {
    id: "auth-password-reset",
    title: "Test password reset flow",
    description: "Ensure the password reset flow works correctly in the production environment",
    category: "authentication",
    completed: false,
    critical: true,
  },
  {
    id: "auth-session",
    title: "Configure session settings",
    description: "Ensure session timeout, cookie settings, and refresh tokens are properly configured",
    category: "authentication",
    completed: false,
    critical: true,
  },
  {
    id: "auth-roles",
    title: "Verify user roles and permissions",
    description: "Ensure user roles and permissions are correctly implemented and enforced",
    category: "authentication",
    completed: false,
    critical: false,
  },

  // Performance
  {
    id: "perf-bundle-size",
    title: "Optimize bundle size",
    description: "Analyze and optimize JavaScript bundle size for faster loading",
    category: "performance",
    completed: false,
    critical: false,
  },
  {
    id: "perf-image-optimization",
    title: "Optimize images",
    description: "Ensure all images are optimized, properly sized, and use modern formats",
    category: "performance",
    completed: false,
    critical: false,
  },
  {
    id: "perf-caching",
    title: "Configure caching",
    description: "Set up appropriate caching headers for static assets and API responses",
    category: "performance",
    completed: false,
    critical: false,
  },
  {
    id: "perf-lazy-loading",
    title: "Implement lazy loading",
    description: "Ensure components and routes use lazy loading where appropriate",
    category: "performance",
    completed: false,
    critical: false,
  },

  // Testing & QA
  {
    id: "test-e2e",
    title: "Run end-to-end tests",
    description: "Execute end-to-end tests against the production build",
    category: "testing",
    completed: false,
    critical: true,
  },
  {
    id: "test-browser-compatibility",
    title: "Test browser compatibility",
    description: "Verify the application works correctly in all supported browsers",
    category: "testing",
    completed: false,
    critical: true,
  },
  {
    id: "test-mobile-responsiveness",
    title: "Test mobile responsiveness",
    description: "Ensure the application is fully responsive on mobile devices",
    category: "testing",
    completed: false,
    critical: true,
  },
  {
    id: "test-error-handling",
    title: "Verify error handling",
    description: "Test error scenarios and ensure they are handled gracefully",
    category: "testing",
    completed: false,
    critical: true,
  },

  // Accessibility
  {
    id: "a11y-keyboard-navigation",
    title: "Test keyboard navigation",
    description: "Ensure the application can be fully navigated using only the keyboard",
    category: "accessibility",
    completed: false,
    critical: false,
  },
  {
    id: "a11y-screen-readers",
    title: "Test with screen readers",
    description: "Verify the application works correctly with screen readers",
    category: "accessibility",
    completed: false,
    critical: false,
  },
  {
    id: "a11y-color-contrast",
    title: "Check color contrast",
    description: "Ensure all text has sufficient color contrast for readability",
    category: "accessibility",
    completed: false,
    critical: false,
  },
  {
    id: "a11y-aria",
    title: "Verify ARIA attributes",
    description: "Ensure ARIA attributes are correctly implemented for interactive elements",
    category: "accessibility",
    completed: false,
    critical: false,
  },

  // SEO & Metadata
  {
    id: "seo-meta-tags",
    title: "Verify meta tags",
    description: "Ensure all pages have appropriate title, description, and other meta tags",
    category: "seo",
    completed: false,
    critical: false,
  },
  {
    id: "seo-sitemap",
    title: "Generate sitemap",
    description: "Create and verify the sitemap.xml file",
    category: "seo",
    completed: false,
    critical: false,
  },
  {
    id: "seo-robots",
    title: "Configure robots.txt",
    description: "Ensure robots.txt is properly configured for production",
    category: "seo",
    completed: false,
    critical: false,
  },
  {
    id: "seo-structured-data",
    title: "Implement structured data",
    description: "Add structured data (JSON-LD) for rich search results",
    category: "seo",
    completed: false,
    critical: false,
  },

  // Monitoring & Logging
  {
    id: "monitoring-error-tracking",
    title: "Set up error tracking",
    description: "Configure error tracking service (e.g., Sentry) for production",
    category: "monitoring",
    completed: false,
    critical: true,
  },
  {
    id: "monitoring-performance",
    title: "Set up performance monitoring",
    description: "Configure performance monitoring for production",
    category: "monitoring",
    completed: false,
    critical: false,
  },
  {
    id: "monitoring-alerts",
    title: "Configure alerts",
    description: "Set up alerts for critical errors and performance issues",
    category: "monitoring",
    completed: false,
    critical: true,
  },
  {
    id: "monitoring-logging",
    title: "Configure logging",
    description: "Ensure appropriate logging is set up for production",
    category: "monitoring",
    completed: false,
    critical: false,
  },

  // Security
  {
    id: "security-headers",
    title: "Configure security headers",
    description: "Set up appropriate security headers (CSP, HSTS, etc.)",
    category: "security",
    completed: false,
    critical: true,
  },
  {
    id: "security-xss",
    title: "Prevent XSS vulnerabilities",
    description: "Ensure protection against cross-site scripting (XSS) attacks",
    category: "security",
    completed: false,
    critical: true,
  },
  {
    id: "security-csrf",
    title: "Implement CSRF protection",
    description: "Ensure protection against cross-site request forgery (CSRF) attacks",
    category: "security",
    completed: false,
    critical: true,
  },
  {
    id: "security-dependencies",
    title: "Audit dependencies",
    description: "Run security audit on npm dependencies and fix vulnerabilities",
    category: "security",
    completed: false,
    critical: true,
  },

  // Documentation
  {
    id: "docs-readme",
    title: "Update README",
    description: "Ensure README is up-to-date with deployment instructions",
    category: "documentation",
    completed: false,
    critical: false,
  },
  {
    id: "docs-api",
    title: "Document API endpoints",
    description: "Ensure all API endpoints are documented",
    category: "documentation",
    completed: false,
    critical: false,
  },
  {
    id: "docs-env-vars",
    title: "Document environment variables",
    description: "Ensure all environment variables are documented with examples",
    category: "documentation",
    completed: false,
    critical: false,
  },
  {
    id: "docs-deployment",
    title: "Create deployment guide",
    description: "Document the deployment process step by step",
    category: "documentation",
    completed: false,
    critical: false,
  },
]

// Helper function to get checklist items by category
export function getChecklistItemsByCategory(category: ChecklistCategory): ChecklistItem[] {
  return DEPLOYMENT_CHECKLIST.filter((item) => item.category === category)
}

// Helper function to get all categories with their items
export function getCategoriesWithItems(): Array<{
  category: (typeof CHECKLIST_CATEGORIES)[ChecklistCategory]
  items: ChecklistItem[]
}> {
  return Object.entries(CHECKLIST_CATEGORIES).map(([id, category]) => ({
    category: { ...category, id: id as ChecklistCategory },
    items: getChecklistItemsByCategory(id as ChecklistCategory),
  }))
}
