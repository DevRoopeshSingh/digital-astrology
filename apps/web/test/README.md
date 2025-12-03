# Testing Guide

Comprehensive testing setup for the Digital Astrology web application.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Mock Factories](#mock-factories)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Install Dependencies

```bash
yarn install
```

### Run Tests

```bash
# Run all tests
yarn test

# Run in watch mode
yarn test --watch

# Run with coverage
yarn test --coverage

# Run specific test file
yarn test auth.test.ts
```

---

## 🧪 Running Tests

### Local Development

```bash
# Watch mode for active development
yarn test --watch

# Run tests for changed files only
yarn test --changed

# Run tests matching a pattern
yarn test --grep "authentication"
```

### CI/CD

Tests run automatically on every PR via GitHub Actions:
- All test suites
- Coverage reporting
- Upload to Codecov

---

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('does something correctly', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Component Tests

```typescript
import { render, screen } from '@test/utils/render'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  it('renders user information', () => {
    render(<UserProfile name="John Doe" email="john@example.com" />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const onSave = vi.fn()
    render(<UserProfile name="John" onSave={onSave} />)

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalled()
  })
})
```

### Hook Tests

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useMyHook } from './useMyHook'

describe('useMyHook', () => {
  it('returns expected data', async () => {
    const { result } = renderHook(() => useMyHook())

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.loading).toBe(false)
  })
})
```

### API Route Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { GET } from './route'

describe('GET /api/users', () => {
  it('returns user list', async () => {
    const request = new Request('http://localhost:3000/api/users')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('users')
  })

  it('requires authentication', async () => {
    // Mock unauthenticated state
    const request = new Request('http://localhost:3000/api/users')

    const response = await GET(request)

    expect(response.status).toBe(401)
  })
})
```

---

## 🛠️ Test Utilities

### Render Helpers

```typescript
import { render, renderWithProviders } from '@test/utils/render'

// Basic render
render(<Component />)

// Render with providers (React Query, etc.)
renderWithProviders(<Component />)
```

### Wait Utilities

```typescript
import { waitForCondition, flushPromises } from '@test/utils/test-utils'

// Wait for a condition
await waitForCondition(() => element.textContent === 'Loaded')

// Wait for all promises to resolve
await flushPromises()
```

### Mock Responses

```typescript
import { createMockResponse, createMockErrorResponse } from '@test/utils/test-utils'

// Success response
const response = createMockResponse({ data: 'test' })

// Error response
const errorResponse = createMockErrorResponse('Not found', 404)
```

---

## 🏭 Mock Factories

### User Mocks

```typescript
import { createMockUser, createMockSession } from '@test/mocks/supabase'

const user = createMockUser({
  email: 'custom@example.com',
  name: 'Custom Name',
})

const session = createMockSession({
  user: user,
  expires_at: Date.now() + 3600,
})
```

### Supabase Client Mock

```typescript
import { mockSupabaseClient } from '@test/mocks/supabase'

const mockClient = mockSupabaseClient()

// Customize behavior
mockClient.auth.getUser.mockResolvedValue({
  data: { user: null },
  error: { message: 'Not authenticated' },
})
```

### Data Factories

```typescript
import {
  createMockUserData,
  createMockKundli,
  createMockProduct,
  createMockHoroscope,
} from '@test/mocks/factories'

const user = createMockUserData({ name: 'John' })
const kundli = createMockKundli({ userId: user.id })
const product = createMockProduct({ price: 1999 })
const horoscope = createMockHoroscope({ sunSign: 'aries' })
```

---

## 📊 Coverage

### Coverage Goals

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

### View Coverage

```bash
# Generate coverage report
yarn test --coverage

# View HTML report
open coverage/index.html
```

### Coverage Reports

- **Text**: Displayed in terminal
- **HTML**: Interactive browser report at `coverage/index.html`
- **LCOV**: For CI integration at `coverage/lcov.info`
- **JSON**: For programmatic access at `coverage/coverage-final.json`

---

## ✅ Best Practices

### DO

✅ **Write descriptive test names**
```typescript
it('shows error message when login fails with invalid credentials', () => {})
```

✅ **Test user behavior, not implementation**
```typescript
// Good: Test what user sees
expect(screen.getByText('Login successful')).toBeInTheDocument()

// Bad: Test implementation details
expect(component.state.isLoggedIn).toBe(true)
```

✅ **Use data-testid for dynamic content**
```typescript
<div data-testid="user-name">{user.name}</div>

// In test
screen.getByTestId('user-name')
```

✅ **Clean up after tests**
```typescript
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
```

✅ **Mock external dependencies**
```typescript
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))
```

### DON'T

❌ **Don't test implementation details**
```typescript
// Bad
expect(component.state.count).toBe(1)

// Good
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

❌ **Don't make tests depend on each other**
```typescript
// Bad: Test order matters
it('creates user', () => { /* creates user */ })
it('updates user', () => { /* assumes user exists */ })

// Good: Each test is independent
it('updates user', () => {
  const user = createMockUser()
  // ... test with mock user
})
```

❌ **Don't use real API calls**
```typescript
// Bad
const data = await fetch('https://api.example.com/data')

// Good
vi.mock('fetch')
global.fetch = vi.fn().mockResolvedValue(createMockResponse(data))
```

❌ **Don't ignore async operations**
```typescript
// Bad
it('loads data', () => {
  render(<AsyncComponent />)
  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})

// Good
it('loads data', async () => {
  render(<AsyncComponent />)
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

---

## 📝 Test Organization

```
apps/web/
├── test/
│   ├── setup.ts              # Test setup and global mocks
│   ├── utils/
│   │   ├── render.tsx        # Render utilities
│   │   └── test-utils.ts     # Helper functions
│   ├── mocks/
│   │   ├── supabase.ts       # Supabase mocks
│   │   └── factories.ts      # Data factories
│   └── fixtures/             # Test data files
│       └── sample-data.json
├── lib/
│   └── **/*.test.ts          # Unit tests near source
├── components/
│   └── **/*.test.tsx         # Component tests near source
└── app/
    └── **/*.test.ts          # Route tests near source
```

---

## 🐛 Debugging Tests

### Run Single Test

```bash
yarn test -t "test name"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "yarn",
  "runtimeArgs": ["test", "--run", "--threads", "false"],
  "console": "integratedTerminal"
}
```

### Verbose Output

```bash
yarn test --reporter=verbose
```

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
