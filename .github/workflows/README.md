# GitHub Actions CI/CD Workflows

This directory contains all GitHub Actions workflows for automated testing, building, and deployment.

## 📋 Workflows Overview

### 1. **CI (Continuous Integration)** - `ci.yml`

**Triggers:**
- Pull requests to `main`, `develop`, or `phase*` branches
- Pushes to `main` and `develop`

**Jobs:**
- **Lint & Type Check**: Runs ESLint and TypeScript compiler
- **Build**: Builds all apps and packages
- **Tests**: Runs Vitest tests with coverage reporting
- **Security**: Runs yarn audit for dependency vulnerabilities
- **CI Success**: Final status check (required for PR merges)

**Duration:** ~10-15 minutes

---

### 2. **Deploy** - `deploy.yml`

**Triggers:**
- Push to `main` (deploys to production)
- Push to `develop` (deploys to staging)
- Manual workflow dispatch

**Jobs:**
- **Setup**: Determines deployment environment
- **Build**: Creates optimized production build
- **Deploy Web**: Deploys web app to Vercel
- **Deploy Admin**: Deploys admin app to Vercel
- **Migrate**: Runs Prisma database migrations
- **Deployment Complete**: Final status check

**Duration:** ~10-15 minutes

**Environments:**
- `production` - Production environment
- `staging` - Staging environment
- `production-admin` - Production admin
- `staging-admin` - Staging admin

---

### 3. **CodeQL Security Scan** - `codeql.yml`

**Triggers:**
- Pull requests to `main` and `develop`
- Pushes to `main` and `develop`
- Scheduled: Every Monday at 00:00 UTC

**Jobs:**
- **Analyze**: Scans JavaScript/TypeScript code for security vulnerabilities

**Duration:** ~15-20 minutes

---

### 4. **PR Checks** - `pr-checks.yml`

**Triggers:**
- PR opened, synchronized, reopened, or marked ready for review

**Jobs:**
- **Validate PR**: Checks PR title follows semantic commit format
- **Dependency Review**: Reviews new/updated dependencies for vulnerabilities
- **Secret Scan**: Scans for accidentally committed secrets
- **Changed Files**: Detects which parts of the monorepo changed
- **PR Info**: Comments on PR with analysis and CI status

**Duration:** ~5-10 minutes

---

## 🔐 Required Secrets

Configure these in GitHub repository settings → Secrets and variables → Actions:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Database
```
DATABASE_URL
```

### Astrology Provider
```
JYOTISH_API_URL
JYOTISH_API_KEY
```

### Vercel Deployment
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_ADMIN_PROJECT_ID
```

---

## 🌍 Environment Setup

### Production Environment

1. Go to Settings → Environments → New environment
2. Name: `production`
3. Add protection rules:
   - ✅ Required reviewers (1+)
   - ✅ Wait timer: 5 minutes
4. Add environment secrets (listed above)

### Staging Environment

1. Go to Settings → Environments → New environment
2. Name: `staging`
3. Add environment secrets

---

## 🔄 Workflow Dependencies

```
PR Created
    ↓
┌─────────────────┐
│   pr-checks     │  (Validates PR, scans secrets)
└─────────────────┘
    ↓
┌─────────────────┐
│      ci         │  (Lint, test, build, security)
└─────────────────┘
    ↓
PR Approved & Merged
    ↓
┌─────────────────┐
│     deploy      │  (Build, deploy, migrate)
└─────────────────┘
```

---

## 📊 Status Checks

### Required Status Checks (for PR merges)

Configure these in: Settings → Branches → Branch protection rules

- `CI Success` (from ci.yml)
- `Validate PR` (from pr-checks.yml)
- `Dependency Review` (from pr-checks.yml)

---

## 🧪 Testing Workflows Locally

### Using Act (GitHub Actions local runner)

```bash
# Install act
brew install act

# Run CI workflow
act pull_request -W .github/workflows/ci.yml

# Run specific job
act pull_request -j lint
```

### Manual Testing

```bash
# Test lint
yarn lint

# Test type check
cd apps/web && npx tsc --noEmit

# Test build
yarn build

# Test tests
yarn test
```

---

## 🎯 Best Practices

1. **Keep workflows fast**
   - Use caching for dependencies
   - Run jobs in parallel when possible
   - Set reasonable timeouts

2. **Security**
   - Never commit secrets
   - Use environment secrets
   - Scan for secrets in PRs

3. **PR Quality**
   - Use semantic commit messages
   - Keep PRs focused and small
   - Add tests for new features

4. **Deployment**
   - Always deploy to staging first
   - Run migrations before deploying code
   - Use environment protection rules

---

## 🐛 Troubleshooting

### Build fails on CI but works locally

**Possible causes:**
- Environment variables not set
- Different Node.js versions
- Cached dependencies

**Solution:**
```bash
# Clear local cache
rm -rf node_modules .yarn/cache
yarn install --immutable

# Match CI Node version
nvm use 20
```

### Deploy fails

**Check:**
1. Vercel secrets are set correctly
2. Environment secrets match `.env.example`
3. Database migrations are up to date
4. Build artifacts were uploaded successfully

### Tests fail on CI

**Check:**
1. Test files use correct imports
2. No hardcoded paths (use relative imports)
3. Tests don't depend on local services
4. Environment variables for tests are set

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/cli)
- [Prisma Migrations](https://www.prisma.io/docs/guides/migrate)
- [CodeQL](https://codeql.github.com/docs/)
