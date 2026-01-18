# Tax Filing Application

A comprehensive US Individual Income Tax Filing Application supporting Federal Form 1040 and state tax returns for tax years 2024-2025.

## Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Copy environment file
cp .env.example .env

# 3. Start infrastructure (PostgreSQL, Redis)
docker-compose -f docker-compose.dev.yml up -d

# 4. Initialize database
npm run db:init
npm run rules:init

# 5. Start backend (Terminal 1)
npm run dev

# 6. Start frontend (Terminal 2)
cd frontend && npm run dev
```

Visit:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

### Docker Compose (Production-like)

```bash
# Build and start all services
docker-compose up -d

# Services:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:8080
# - Database: localhost:5433
```

## Technology Stack

**Backend:**
- Node.js 18 + TypeScript
- Express.js
- PostgreSQL 15
- Redis (optional caching)

**Frontend:**
- React 18
- Vite
- TailwindCSS 4
- React Router 7

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes (production)
- GitHub Actions (CI/CD)
- OpenTelemetry (observability)

## Features

### Implemented ✅

- **Tax Forms:** W-2, 1099-INT, 1099-DIV, 1099-B
- **Tax Schedules:** Schedule 1, B, D, A (partial)
- **Tax Calculation Engine:** 2025 Federal rules
- **State Tax Support:** NY (IT-201), PA (PA-40), NJ (NJ-1040)
- **Dependents & Payments Tracking**
- **PDF Generation:** Basic Form 1040
- **E-file XML Generation:** IRS MeF format
- **User Authentication:** JWT-based
- **Audit Logging:** Immutable with SHA256 integrity
- **Tax Rules Versioning:** Database-driven rules

### In Progress 🚧

- Child Tax Credit calculation
- Schedule 1 integration into engine
- Dependents management UI
- Tax payments tracking UI

## Project Structure

```
tax-filing-app/
├── src/                      # Backend source code
│   ├── api/                  # REST API routes
│   ├── database/             # Database migrations & setup
│   ├── engine/               # Tax calculation engine
│   ├── repositories/         # Data access layer
│   ├── services/             # Business logic
│   └── observability/        # OpenTelemetry setup
├── frontend/                 # React frontend
│   └── src/
│       ├── pages/            # UI pages
│       └── context/          # React context
├── k8s/                      # Kubernetes manifests
├── .github/workflows/        # CI/CD pipelines
├── docs/                     # Documentation
└── docker-compose.yml        # Docker orchestration
```

## Available Scripts

### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm test             # Run tests
npm run db:init      # Initialize database
npm run rules:init   # Bootstrap tax rules
```

### Frontend

```bash
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

See [.env.example](.env.example) for all available configuration options.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing (use strong random value)
- `CORS_ORIGIN` - Allowed frontend origins
- `OTEL_ENABLED` - Enable OpenTelemetry observability

## Documentation

- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[Application Status](../Documents/APPLICATION_STATUS.md)** - Current development status
- **[Tax Filing Strategy](../Documents/tax-filing-strategy.md)** - Product strategy

## Health Checks

The application provides two health check endpoints:

- `GET /health` - Liveness probe (returns 200 if app is running)
- `GET /ready` - Readiness probe (returns 200 if database is connected)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tax Returns
- `GET /api/returns` - List user's tax returns
- `POST /api/returns` - Create new tax return
- `GET /api/returns/:id` - Get specific return
- `POST /api/returns/:id/calculate` - Calculate taxes
- `GET /api/returns/:id/pdf` - Generate PDF
- `GET /api/returns/:id/efile` - Generate e-file XML

### Forms
- `POST /api/returns/:id/forms/w2` - Add W-2 form
- `POST /api/returns/:id/forms/1099-int` - Add 1099-INT form
- `POST /api/returns/:id/forms/1099-div` - Add 1099-DIV form
- `POST /api/returns/:id/forms/1099-b` - Add 1099-B form

### Schedules
- `POST /api/schedule1/:returnId/additional-income` - Schedule 1 Part I
- `POST /api/schedule1/:returnId/adjustments` - Schedule 1 Part II
- `POST /api/returns/:returnId/dependents` - Manage dependents
- `POST /api/returns/:returnId/payments` - Track tax payments

## Monitoring & Observability

OpenTelemetry instrumentation provides:
- **Distributed Tracing:** Track requests across services
- **Custom Metrics:** Tax calculations, e-file submissions, PDF generation
- **Auto-instrumentation:** HTTP, Express, PostgreSQL

Enable in `.env`:
```bash
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### Staging/Production (Kubernetes)
```bash
kubectl apply -f k8s/
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## Security

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- CORS protection
- Helmet.js security headers
- Audit logging with cryptographic integrity
- Rate limiting (configurable)
- Input validation
- SQL injection prevention (parameterized queries)

**Production Security Checklist:**
- [ ] All secrets in AWS Secrets Manager/Vault
- [ ] HTTPS/TLS enabled
- [ ] Strong JWT_SECRET configured
- [ ] CORS origins restricted
- [ ] Container images scanned
- [ ] Database SSL connections

## Contributing

1. Create a feature branch from `develop`
2. Make changes and add tests
3. Run linting: `npm run lint`
4. Submit PR to `develop` branch

## License

ISC

## Support

For issues or questions:
- **Development:** freeustaxes@gmail.com
- **Security:** freeustaxes@gmail.com

---

**Status:** 85% MVP Complete | **Version:** 1.0.0 | **Last Updated:** January 13, 2026
