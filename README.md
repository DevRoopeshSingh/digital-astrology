# Jyotishya • Digital Astrology Platform

[![CI](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/ci.yml/badge.svg)](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/ci.yml)
[![Deploy](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/deploy.yml/badge.svg)](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/codeql.yml/badge.svg)](https://github.com/DevRoopeshSingh/digital-astrology/actions/workflows/codeql.yml)

This repository houses a modern astrology platform tailored for India, featuring Vedic + Western horoscopes, Kundli generation, compatibility tools, live astrologer consultations, and an e-commerce marketplace.

## ✨ Features

- 🔐 **Authentication** - Supabase-powered auth with Google OAuth and OTP
- 📊 **Daily Horoscopes** - Personalized predictions based on sun signs
- 🌙 **Panchang** - Traditional Hindu almanac with tithi, nakshatra, yoga
- 🎯 **Kundli Generation** - Birth chart calculations and analysis
- 💬 **Live Consultations** - Connect with verified astrologers
- 🛍️ **E-Commerce** - Spiritual products marketplace
- 🌍 **Multi-language** - English, Hindi, Tamil support
- 📱 **Responsive** - Mobile-first design

## Monorepo Layout

- `apps/web` — customer-facing Next.js 14 application.
- `apps/admin` — operations/admin portal (Next.js).
- `services/` — modular backend services (NestJS / TypeScript and a FastAPI astro-core prototype).
- `packages/` — shared UI kit, business logic, schema definitions.
- `infrastructure/` — Terraform, Helm, Docker assets.
- `docs/` — architecture notes, API guides, GTM playbooks.
- `scripts/` — automation, seeding, and DX helpers.

## Prerequisites

- Node.js **>= 18.18** (20.x recommended).
- Yarn **Berry (4.x)** — already configured through `.yarn/releases`. Use `corepack enable` once per machine.
- Optional for backend services: Docker (for databases) and Nest CLI (`yarn dlx @nestjs/cli new` is available via PnP).

## Installation

Install all workspace dependencies from the repo root:

```bash
corepack enable             # if you have not done this before
yarn install
```

The project uses Plug’n’Play; IDEs may need the TypeScript SDK patched via `yarn dlx @yarnpkg/sdks vscode` (or the equivalent for your editor).

## Running Applications

### Web (customer site)

```bash
# Dev server with component HMR
yarn dev --filter @digital-astrology/web
```

The site boots at `http://localhost:3000`. It serves mock data when upstream services are unavailable.

### Admin portal

```bash
yarn dev --filter @digital-astrology/admin
```

### Backend services

All services support standard NestJS scripts. For example, to run the Astro Core aggregator:

```bash
# Compile & watch mode (NestJS)
yarn dev --filter @digital-astrology/astro-core -- start:dev
```

Some services rely on environment variables or databases; check their individual READMEs or `docs/` for details.

### Python astro-core proxy

`services/astro-core-python` bundles a FastAPI wrapper around FreeAstrologyAPI. To run it locally:

```bash
cd services/astro-core-python
python -m venv .venv
source .venv/bin/activate
pip install -e .
export FREE_API_BASE_URL=https://json.freeastrologyapi.com
export FREE_API_KEY=your_api_key
uvicorn freeastrology.main:app --host 0.0.0.0 --port 4001 --reload
```

Then set `ASTRO_CORE_URL=http://localhost:4001` (or `http://localhost:4001/api/astro-core` depending on your routing preference) in the web app. See `services/astro-core-python/README.md` for advanced configuration and endpoints.

## Environment Variables

The Next.js app proxies to backend services when the following variables are provided (set them in `.env.local` at the repo root):

```dotenv
ASTRO_CORE_URL=http://localhost:4001/api/astro-core
COMMERCE_SERVICE_URL=http://localhost:4002/api/commerce
ASTROLOGY_PROVIDER=open_source          # or jyotish_api
JYOTISH_API_URL=https://api.example.com # required when ASTROLOGY_PROVIDER=jyotish_api
JYOTISH_API_KEY=replace-with-secret
JYOTISH_API_TIMEOUT_MS=8000
INTERPRETATION_PROVIDER=mock            # or openai
OPENAI_API_KEY=replace-with-secret
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=10000
```

Unset variables default to local mocks so development remains functional.

## Quality Checks & Testing

Run these from the repository root unless noted otherwise:

```bash
# Type-check the entire monorepo
cd apps/web && npx tsc --noEmit
cd apps/admin && npx tsc --noEmit

# Lint all packages
yarn lint

# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Build all packages
yarn build
```

Vitest lives alongside Next.js code (`apps/web/lib/api/*.test.ts`). Add new tests there and run `yarn test --watch` for red/green feedback.

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Workflows

- **CI** - Runs on every PR (lint, type-check, test, build)
- **Deploy** - Auto-deploys to Vercel on `main` (production) and `develop` (staging)
- **CodeQL** - Security scanning (weekly + on PRs)
- **PR Checks** - Validates PR format, dependencies, secrets

### Branch Protection

- `main` - Protected, requires PR approval and passing CI
- `develop` - Staging branch, auto-deploys on push
- `phase*` - Feature branches for major milestones

### Deployment

- **Production**: Deployed to Vercel on merge to `main`
- **Staging**: Deployed to Vercel on merge to `develop`
- **Preview**: Deployed on every PR

See [.github/workflows/README.md](.github/workflows/README.md) for detailed CI/CD documentation.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for:

- Development workflow
- Code standards
- Testing guidelines
- Commit message format
- PR process

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`yarn test`)
5. Commit (`git commit -m 'feat: add amazing feature'`)
6. Push (`git push origin feat/amazing-feature`)
7. Open a Pull Request

All PRs must:
- ✅ Pass all CI checks
- ✅ Have test coverage
- ✅ Follow code standards
- ✅ Include documentation updates

## Internationalisation

- Locale copy is defined in `apps/web/components/providers/intl-provider.tsx` (`en`, `hi`, `ta`).
- `LocaleSwitcher` persists the reader’s preference in `localStorage` and swaps UI strings instantly.

## Additional Notes

- The shared TypeScript configuration now uses `module: "NodeNext"` and aligns with `moduleResolution: "NodeNext"` to keep `tsc --noEmit` happy across workspaces.
- Horoscopes returned by `@digital-astrology/lib` include an optional `summary.snapshot` payload so interpretation prompts can use richer planetary context.

## 🗺️ Roadmap

### ✅ Completed (Phase 1)
- [x] Supabase authentication (Google OAuth + OTP)
- [x] User management system
- [x] CI/CD pipeline with GitHub Actions
- [x] Security scanning (CodeQL, Dependabot)
- [x] Automated testing infrastructure
- [x] Multi-language support (EN, HI, TA)
- [x] Daily horoscope integration
- [x] Panchang calculations

### 🚧 In Progress (Phase 2)
- [ ] Comprehensive test coverage (target: 70%+)
- [ ] Error tracking and logging (Sentry)
- [ ] Performance monitoring
- [ ] Rate limiting and API security
- [ ] Docker setup for local development
- [ ] API documentation (OpenAPI/Swagger)

### 📋 Planned (Phase 3)
- [ ] Complete commerce service
- [ ] Complete consultations service
- [ ] Complete notifications service
- [ ] Payment integration (Razorpay, PhonePe)
- [ ] Real-time chat for consultations
- [ ] Mobile apps (React Native)
- [ ] Advanced caching (Redis)

## 📚 Documentation

- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [CI/CD Workflows](.github/workflows/README.md) - GitHub Actions setup
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Infrastructure](docs/INFRASTRUCTURE.md) - Architecture overview

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [FreeAstrologyAPI](https://www.freeastrologyapi.com/) - Astrology calculations
- [Supabase](https://supabase.com/) - Authentication and database
- [Vercel](https://vercel.com/) - Hosting and deployments
- [Next.js](https://nextjs.org/) - React framework

---

**Built with ❤️ for the Indian astrology community**
