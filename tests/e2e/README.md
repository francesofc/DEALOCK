# Dealock E2E Tests

End-to-end testing suite for Dealock using Playwright.

## Prerequisites

- Node.js 20+
- Playwright browsers installed: `npx playwright install chromium`
- Application built: `npm run build`

## Quick Start

```bash
# 1. Build the application (required for stable tests)
npm run build

# 2. Start production server in background
npm start &

# 3. Wait for server to be ready, then run tests
npx wait-on http://localhost:3000 --timeout 60000
npx playwright test

# Or use the convenience command
npm run test:e2e:ci
```

## Test Commands

```bash
# Run all E2E tests (requires production server running)
npm run test:e2e

# Run tests with visible browser
npm run test:e2e:headed

# Run tests with UI debugger
npm run test:e2e:ui

# Run specific test suites
npm run test:e2e:seller    # Seller lifecycle tests
npm run test:e2e:match     # Match tests (manual + auto)
npm run test:e2e:buyer     # Buyer detail tests

# Debug mode
npx playwright test --debug

# CI mode (build, start server, run tests, cleanup)
npm run test:e2e:ci
```

## Test Structure

```
tests/
├── e2e/                          # Test specifications
│   ├── seller-lifecycle.spec.ts  # Seller navigation, mandates
│   ├── manual-match.spec.ts      # Manual match creation flow
│   ├── auto-match.spec.ts        # Automatic match generation
│   └── buyer-detail.spec.ts      # Buyer detail, matches display
├── helpers/
│   └── selectors.ts              # Centralized selectors
├── fixtures/
│   └── test-data.ts              # Shared test data
└── e2e/README.md                 # This file
```

## Test Coverage

| Suite | Tests | Coverage |
|-------|-------|----------|
| Seller Lifecycle | 5 | Page display, list, navigation, mandates |
| Manual Match | 4 | Drawer, selection, validation, creation |
| Auto Match | 5 | Generation, summary, duplicates, updates |
| Buyer Detail | 9 | Navigation, matches, qualifications |

**Total: 23 tests**

## Important Notes

### Production Build Required
Tests require a production build (`npm run build`) for stability. The dev server (`npm run dev`) can cause resource loading issues with Playwright.

### Data Dependencies
Some tests skip when data is missing:
- Navigation tests skip when no sellers/buyers exist
- Match creation skips when no buyers/targets available

This is intentional - tests are designed to work with empty databases.

### Selectors
Tests use semantic selectors:
- Text content: `button:has-text("Generate")`
- Test IDs: `[data-testid="seller-row"]` (added for critical elements)
- URL patterns: `/\/buyers\/.+/`

## Configuration

See `playwright.config.ts` for:
- Browser settings (Chromium, dark mode)
- Timeout configurations
- Screenshot/video settings
- Reporter configuration

## CI/CD

GitHub Actions workflow in `.github/workflows/e2e.yml`:
- Runs on push to `main`/`develop`
- Runs on pull requests
- Builds production app before testing
- Uploads test reports as artifacts

## Troubleshooting

### Tests failing with blank screenshots
The dev server may not be serving resources correctly. Use production build:
```bash
npm run build
npm start
# Then run tests in another terminal
```

### Port already in use
```bash
# Kill existing processes
pkill -f "next"
# Or use a different port
PORT=3001 npm start
```

### Tests flaky
Increase timeouts in `playwright.config.ts` or add explicit waits:
```typescript
await page.waitForTimeout(1000); // Wait for hydration
```

### View test report
```bash
npx playwright show-report
```

## Best Practices

1. **Always use production build for testing**
2. **Use semantic selectors** over CSS classes
3. **Handle empty states gracefully** - tests should skip when data missing
4. **Add `data-testid` for critical elements** when text selectors are brittle
5. **Use explicit waits** for JavaScript hydration
