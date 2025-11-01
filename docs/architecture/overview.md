# Architecture Overview

This document summarises the high-level architecture for the Jyotishya digital astrology platform.

## Context

- Frontend apps built with Next.js (App Router) located in `apps/`
- Backend services implemented with NestJS and modular TypeScript packages under `services/`
- Shared logic and UI extracted into `packages/`
- Infrastructure as code definitions under `infrastructure/`

## Service Mesh

The platform is designed for microservices orchestrated via Kubernetes with gRPC and REST interfaces.
