# @digital-astrology/schemas

Database schemas and Prisma client for the Digital Astrology platform.

## Overview

This package contains:
- **Prisma Schema**: Database schema definition
- **Prisma Client**: Type-safe database client
- **Seed Data**: Sample data for development
- **Migrations**: Database version control

## Database Schema

### Core Entities

- **User**: User accounts with email/phone authentication
- **Account**: OAuth provider accounts
- **Session**: User sessions (NextAuth.js)
- **Kundli**: Birth charts with calculated data
- **Astrologer**: Astrologer profiles
- **Consultation**: Booking system
- **Product**: E-commerce products
- **Order**: Customer orders

## Usage

### Installation

```bash
yarn install
```

### Generate Prisma Client

```bash
yarn db:generate
```

### Run Migrations

```bash
# Development (with prompt)
yarn db:migrate

# Production (auto-apply)
yarn db:migrate:deploy

# Push schema without migration
yarn db:push
```

### Seed Database

```bash
yarn db:seed
```

### Open Prisma Studio

```bash
yarn db:studio
# Opens at http://localhost:5555
```

## Using in Your App

```typescript
import { prisma, User, Kundli } from "@digital-astrology/schemas";

// Find user
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});

// Create kundli
const kundli = await prisma.kundli.create({
  data: {
    userId: user.id,
    name: "John Doe",
    birthDate: new Date("1990-01-15T10:30:00Z"),
    birthTime: "10:30",
    birthPlace: "New Delhi",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
    chartData: { /* chart data */ }
  }
});

// Query with relations
const userWithKundlis = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    kundlis: true,
    consultations: {
      include: { astrologer: true }
    }
  }
});
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/digital_astrology?schema=public"
```

## Schema Diagram

```
users
  ├── accounts (OAuth providers)
  ├── sessions (NextAuth)
  ├── kundlis
  ├── consultations
  ├── orders
  └── favorites

astrologers
  ├── consultations
  └── availability

products
  ├── order_items
  └── favorites
```

## Sample Data

Running `yarn db:seed` creates:
- 2 users (demo@jyotishya.com, admin@jyotishya.com)
- 3 astrologers with different specializations
- 4 products (Rudraksha, Yantra, Gemstone, Puja Kit)
- 1 sample kundli

## Development

### Adding New Models

1. Edit `prisma/schema.prisma`
2. Run `yarn db:migrate --name add_new_model`
3. Run `yarn db:generate`

### Updating Seed Data

1. Edit `prisma/seed.ts`
2. Run `yarn db:seed`

## Production

### Backup Database

```bash
# PostgreSQL
pg_dump -U user -d digital_astrology > backup.sql

# Restore
psql -U user -d digital_astrology < backup.sql
```

### Connection Pooling

Use PgBouncer for production:

```env
DATABASE_URL="postgresql://user:password@pgbouncer:6432/digital_astrology?pgbouncer=true"
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
yarn db:generate
```

### Error: "Relation does not exist"

```bash
yarn db:push
```

### Reset Database

```bash
yarn db:push --force-reset
yarn db:seed
```

## License

MIT
