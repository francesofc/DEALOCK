import { defineConfig, devices } from '@playwright/test';

/**
 * ============================================
 * DEALOCK E2E TEST CONFIGURATION
 * ============================================
 * 
 * Playwright configuration for end-to-end testing of the Dealock
 * commercial real estate platform.
 * 
 * PREREQUISITE: Server must be running on localhost:3000
 * Run: ./scripts/start-e2e-server.sh
 * 
 * Then run tests: npx playwright test
 * 
 * Key features:
 * - Screenshot and video capture on failure
 * - Trace collection for debugging
 * - Serial execution for test data stability
 */

export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // File pattern for test files
  testMatch: '**/*.spec.ts',
  
  // Run tests serially to avoid test data conflicts
  // (Parallel workers caused duplicate test record issues)
  fullyParallel: false,
  workers: 1,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter to use
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL to use in actions like `await page.goto('/')'
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'on-first-retry',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use dark mode to match Dealock's dark theme
        colorScheme: 'dark',
      },
    },
  ],

  // No webServer config - we manage server manually for stability
  // Use: ./scripts/start-e2e-server.sh to start server
});
