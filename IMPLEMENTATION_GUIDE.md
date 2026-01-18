# Tax Filing Software - Complete Implementation Guide

**Version:** 1.0.0
**Last Updated:** January 18, 2026
**Status:** Production-Ready MVP

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Prerequisites](#prerequisites)
6. [Quick Start](#quick-start)
7. [Detailed Setup](#detailed-setup)
8. [Project Structure](#project-structure)
9. [Development Workflow](#development-workflow)
10. [API Reference](#api-reference)
11. [Design System](#design-system)
12. [Database Schema](#database-schema)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Monitoring & Observability](#monitoring--observability)
16. [Security](#security)
17. [Troubleshooting](#troubleshooting)
18. [Contributing](#contributing)

---

## Overview

A comprehensive **US Individual Income Tax Filing Application** supporting Federal Form 1040 and state tax returns (NY, PA, NJ) for tax years 2024-2025. Built with modern web technologies, featuring a professional design system, automated calculations, PDF generation, and IRS e-file XML export.

### Key Highlights

- ✅ **Complete Tax Engine**: Federal 1040 calculations with 2025 tax rules
- ✅ **Professional UI**: Atomic design system with trust-blue branding
- ✅ **Form Support**: W-2, 1099-INT, 1099-DIV, 1099-B
- ✅ **Schedules**: Schedule 1, A, B, D with automated calculations
- ✅ **State Tax**: NY IT-201, PA PA-40, NJ NJ-1040
- ✅ **E-Filing**: IRS MeF XML generation
- ✅ **PDF Export**: Form 1040 PDF generation
- ✅ **Production-Ready**: Docker, Kubernetes, CI/CD, observability

---

## Features

### Tax Filing Capabilities

| Feature | Status | Description |
|---------|--------|-------------|
| **User Authentication** | ✅ Complete | JWT-based auth with bcrypt password hashing |
| **Tax Return Management** | ✅ Complete | Create, view, edit multiple tax years |
| **W-2 Forms** | ✅ Complete | Wages, federal/state withholding |
| **1099-INT** | ✅ Complete | Interest income tracking |
| **1099-DIV** | ✅ Complete | Dividend income (ordinary & qualified) |
| **1099-B** | ✅ Complete | Capital gains/losses from sales |
| **Schedule 1** | ✅ Complete | Additional income & adjustments |
| **Schedule A** | ✅ Complete | Itemized deductions |
| **Schedule B** | ✅ Complete | Interest & dividend details |
| **Schedule D** | ✅ Complete | Capital gains/losses summary |
| **Dependents** | ✅ Complete | Dependent tracking with SSN validation |
| **Tax Payments** | ✅ Complete | Estimated tax payment tracking |
| **Tax Calculation** | ✅ Complete | Full 1040 calculation engine |
| **PDF Generation** | ✅ Complete | Form 1040 PDF export |
| **E-File XML** | ✅ Complete | IRS MeF format XML generation |
| **State Tax** | ✅ Complete | NY, PA, NJ returns |
| **Audit Logging** | ✅ Complete | SHA256 integrity verification |

### User Experience Features

- **Onboarding Questionnaire**: Interactive tax situation assessment
- **Smart Navigation**: Progress tracking across form completion
- **Auto-Save**: Individual save buttons with loading states
- **Toast Notifications**: Non-blocking success/error messages
- **Modal Dialogs**: Confirmation prompts for destructive actions
- **Formatted Inputs**: Currency ($), SSN (XXX-XX-XXXX), date pickers
- **Empty States**: Helpful guidance when no data exists
- **Loading States**: Spinners for all async operations
- **Responsive Design**: Mobile-first approach (Tailwind CSS)

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **TypeScript** | 5.3.2 | Type-safe development |
| **Express.js** | 4.18.2 | REST API framework |
| **PostgreSQL** | 15+ | Primary database |
| **pg** | 8.11.3 | PostgreSQL driver |
| **JWT** | 9.0.3 | Authentication tokens |
| **bcryptjs** | 3.0.3 | Password hashing |
| **pdf-lib** | 1.17.1 | PDF generation |
| **xmlbuilder2** | 4.0.3 | E-file XML generation |
| **Winston** | 3.11.0 | Logging framework |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin requests |
| **OpenTelemetry** | Latest | Distributed tracing & metrics |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.3.2 | Type safety |
| **Vite** | 5.0.8 | Build tool & dev server |
| **React Router** | 7.12.0 | Client-side routing |
| **Tailwind CSS** | 4.1.18 | Utility-first styling |
| **Axios** | 1.13.2 | HTTP client |
| **lucide-react** | 0.562.0 | Icon library |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Local orchestration |
| **Kubernetes** | Production orchestration |
| **GitHub Actions** | CI/CD pipelines |
| **Nginx** | Frontend web server |
| **Redis** | Caching (optional) |
| **AWS EKS** | Kubernetes hosting |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Browser                       │
│                    (React SPA on Vite)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Frontend)                        │
│              - Static file serving                           │
│              - SPA fallback routing                          │
│              - Security headers                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ API Proxy
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express API Server                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes Layer (API Endpoints)                       │   │
│  │  - /api/auth/*    - /api/returns/*                  │   │
│  │  - /api/forms/*   - /api/schedule1/*                │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │  Services Layer (Business Logic)                    │   │
│  │  - AuthService    - TaxCalculationService           │   │
│  │  - PdfService     - EFileService                    │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │  Repositories Layer (Data Access)                   │   │
│  │  - UserRepository    - TaxReturnRepository          │   │
│  │  - FormRepository    - AuditLogRepository           │   │
│  └────────────────┬────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼────────────────────────────────────┐   │
│  │  Tax Calculation Engine                             │   │
│  │  - Federal 1040 Calculator                          │   │
│  │  - State Tax Calculators (NY, PA, NJ)               │   │
│  │  - Schedule Processors (1, A, B, D)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  - users                - tax_returns                        │
│  - w2_forms             - form_1099_int                      │
│  - form_1099_div        - form_1099_b                        │
│  - schedule_1           - dependents                         │
│  - payments             - schedule_a                         │
│  - tax_rules            - audit_logs                         │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Component Architecture (Atomic Design)

```
Pages (Templates)
├── Login.tsx
├── Register.tsx
├── Dashboard.tsx
├── Onboarding.tsx
├── FormInput.tsx
├── Schedule1.tsx
├── ScheduleA.tsx
├── Dependents.tsx
├── Payments.tsx
├── ReturnView.tsx
└── Profile.tsx

Organisms (Layout)
├── Layout.tsx
├── ThreeColumnLayout.tsx
├── TrustHeader.tsx
├── NavigationSidebar.tsx
└── AssistantRail.tsx

Modules
└── RefundTracker.tsx

Molecules (Composite Components)
├── Card.tsx
├── FormField.tsx
├── CurrencyInput.tsx
├── SSNInput.tsx
├── DateInput.tsx
├── Modal.tsx
├── ConfirmDialog.tsx
└── Toast.tsx

Atoms (Basic Components)
├── Button.tsx
├── Input.tsx
├── Select.tsx
├── Checkbox.tsx
├── Radio.tsx
├── Badge.tsx
├── Alert.tsx
├── Spinner.tsx
├── Textarea.tsx
├── Icon.tsx
├── Tooltip.tsx
└── ProgressBar.tsx
```

---

## Prerequisites

### Required Software

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (comes with Node.js)
- **PostgreSQL**: 15.x or higher ([Download](https://www.postgresql.org/download/))
- **Git**: Latest version ([Download](https://git-scm.com/))

### Optional (for Docker deployment)

- **Docker**: 20.x or higher ([Download](https://www.docker.com/))
- **Docker Compose**: 2.x or higher (included with Docker Desktop)

### Recommended Tools

- **VS Code**: For development ([Download](https://code.visualstudio.com/))
- **Postman**: For API testing ([Download](https://www.postman.com/))
- **pgAdmin**: For database management ([Download](https://www.pgadmin.org/))
- **Git Bash**: For Windows users ([Download](https://git-scm.com/))

---

## Quick Start

### Option 1: Local Development (Recommended for Development)

```bash
# 1. Clone the repository
git clone <repository-url>
cd tax-filing-app

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 5. Start PostgreSQL (if using Docker)
docker-compose -f docker-compose.dev.yml up -d

# 6. Initialize database
npm run build
npm run db:init
npm run rules:init

# 7. Start backend server (Terminal 1)
npm run dev

# 8. Start frontend server (Terminal 2)
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

### Option 2: Docker Compose (Full Stack)

```bash
# 1. Clone the repository
git clone <repository-url>
cd tax-filing-app

# 2. Copy environment file
cp .env.example .env

# 3. Build and start all services
docker-compose up -d

# 4. Initialize database (one-time)
docker-compose exec backend npm run db:init
docker-compose exec backend npm run rules:init
```

**Access the application:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

---

## Detailed Setup

### Step 1: Database Setup

#### Option A: Using Docker (Easiest)

```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d

# Verify database is running
docker-compose -f docker-compose.dev.yml ps
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL 15+
2. Create a database:

```sql
CREATE DATABASE tax_filing_db;
CREATE USER tax_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tax_filing_db TO tax_user;
```

3. Update `.env`:

```bash
DATABASE_URL=postgresql://tax_user:your_secure_password@localhost:5432/tax_filing_db
```

### Step 2: Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

**Critical variables to configure:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tax_filing_db

# Security (IMPORTANT: Change in production!)
JWT_SECRET=your_super_secret_random_string_min_32_chars
BCRYPT_ROUNDS=10

# Server
PORT=3000
NODE_ENV=development

# CORS (allow frontend origin)
CORS_ORIGIN=http://localhost:5173

# Features
ENABLE_PDF_GENERATION=true
ENABLE_EFILE_SUBMISSION=false
ENABLE_STATE_TAX=true
```

**Generate secure JWT secret:**

```bash
# Linux/Mac
openssl rand -base64 64

# Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Database Initialization

```bash
# Build TypeScript
npm run build

# Run migrations (creates tables)
npm run db:init

# Bootstrap tax rules (2024-2025 tax tables)
npm run rules:init
```

**Verify database setup:**

```bash
# Using psql
psql -U tax_user -d tax_filing_db -c "\dt"

# Expected tables:
# - users
# - tax_returns
# - w2_forms
# - form_1099_int
# - form_1099_div
# - form_1099_b
# - schedule_1
# - dependents
# - payments
# - schedule_a
# - tax_rules
# - audit_logs
```

### Step 4: Backend Setup

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Or build and start production server
npm run build
npm start
```

**Verify backend is running:**

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}

curl http://localhost:3000/ready
# Expected: {"status":"ready","database":"connected"}
```

### Step 5: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

**Frontend will be available at:** http://localhost:5173

---

## Project Structure

```
tax-filing-app/
│
├── src/                                # Backend source code
│   ├── api/                           # API routes
│   │   ├── auth.ts                    # Authentication endpoints
│   │   ├── returns.ts                 # Tax return CRUD
│   │   ├── forms.ts                   # Tax form endpoints
│   │   ├── schedule1.ts               # Schedule 1 routes
│   │   └── dependents.ts              # Dependents management
│   │
│   ├── config/                        # Configuration
│   │   └── database.ts                # Database config
│   │
│   ├── database/                      # Database layer
│   │   ├── connection.ts              # Pool management
│   │   ├── init.ts                    # Migration runner
│   │   └── migrations/                # SQL migrations
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_create_tax_forms.sql
│   │       ├── 003_create_1099b.sql
│   │       ├── 004_create_tax_rules.sql
│   │       ├── 005_create_schedule_1.sql
│   │       ├── 006_create_dependents.sql
│   │       ├── 007_alter_filing_status.sql
│   │       └── 008_create_schedule_a.sql
│   │
│   ├── efile/                         # E-filing functionality
│   │   ├── generator.ts               # XML generation
│   │   └── templates/                 # MeF templates
│   │
│   ├── engine/                        # Tax calculation engine
│   │   ├── federal-1040.ts            # Main 1040 calculator
│   │   ├── schedule-d.ts              # Capital gains calculator
│   │   ├── tax-rules-engine.ts        # Database-driven rules
│   │   └── state/                     # State tax calculators
│   │       ├── ny-it201.ts            # New York
│   │       ├── pa-40.ts                # Pennsylvania
│   │       └── nj-1040.ts             # New Jersey
│   │
│   ├── observability/                 # Monitoring
│   │   └── otel-setup.ts              # OpenTelemetry config
│   │
│   ├── repositories/                  # Data access layer
│   │   ├── user.repository.ts
│   │   ├── tax-return.repository.ts
│   │   ├── form.repository.ts
│   │   ├── schedule1.repository.ts
│   │   ├── dependent.repository.ts
│   │   └── audit-log.repository.ts
│   │
│   ├── scripts/                       # Utility scripts
│   │   └── init-tax-rules.ts          # Tax rules bootstrap
│   │
│   ├── services/                      # Business logic
│   │   ├── auth.service.ts
│   │   ├── tax-calculation.service.ts
│   │   ├── pdf-generation.service.ts
│   │   └── efile.service.ts
│   │
│   └── index.ts                       # Entry point
│
├── frontend/                          # Frontend React app
│   ├── public/                        # Static assets
│   │
│   ├── src/
│   │   ├── components/                # UI components
│   │   │   ├── atoms/                 # Basic components
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Icon.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Radio.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Textarea.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   │
│   │   │   ├── molecules/             # Composite components
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── CurrencyInput.tsx
│   │   │   │   ├── DateInput.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── SSNInput.tsx
│   │   │   │   └── Toast.tsx
│   │   │   │
│   │   │   ├── layout/                # Layout components
│   │   │   │   ├── AssistantRail.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── NavigationSidebar.tsx
│   │   │   │   ├── ThreeColumnLayout.tsx
│   │   │   │   └── TrustHeader.tsx
│   │   │   │
│   │   │   └── modules/               # Feature modules
│   │   │       └── RefundTracker.tsx
│   │   │
│   │   ├── context/                   # React context
│   │   │   └── ToastContext.tsx       # Global toast notifications
│   │   │
│   │   ├── pages/                     # Page components
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── Dependents.tsx         # Manage dependents
│   │   │   ├── FormInput.tsx          # W-2, 1099 forms
│   │   │   ├── Login.tsx              # Login page
│   │   │   ├── Onboarding.tsx         # Tax questionnaire
│   │   │   ├── Payments.tsx           # Tax payments
│   │   │   ├── Profile.tsx            # User profile
│   │   │   ├── Register.tsx           # Registration
│   │   │   ├── ReturnView.tsx         # Tax return summary
│   │   │   ├── Schedule1.tsx          # Additional income
│   │   │   └── ScheduleA.tsx          # Itemized deductions
│   │   │
│   │   ├── App.tsx                    # App root component
│   │   ├── index.css                  # Global styles
│   │   └── main.tsx                   # Entry point
│   │
│   ├── nginx.conf                     # Nginx configuration
│   ├── package.json                   # Frontend dependencies
│   ├── postcss.config.js              # PostCSS config
│   ├── tailwind.config.js             # Tailwind configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── vite.config.ts                 # Vite configuration
│
├── k8s/                               # Kubernetes manifests
│   ├── namespace.yaml                 # Namespaces
│   ├── secrets.yaml                   # Secrets template
│   ├── configmap.yaml                 # ConfigMaps
│   ├── deployment.yaml                # Deployments
│   ├── service.yaml                   # Services
│   ├── hpa.yaml                       # Autoscaling
│   └── ingress.yaml                   # Ingress rules
│
├── .github/workflows/                 # CI/CD pipelines
│   ├── ci.yml                         # Continuous integration
│   ├── build-and-push.yml             # Docker image builds
│   └── deploy-production.yml          # Production deployment
│
├── docs/                              # Documentation
│   └── DEPLOYMENT.md                  # Deployment guide
│
├── .env.example                       # Environment template
├── .env.development                   # Dev environment
├── .env.staging                       # Staging environment
├── .env.production                    # Production template
├── .dockerignore                      # Docker ignore rules
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Production compose
├── docker-compose.dev.yml             # Development compose
├── Dockerfile                         # Backend Dockerfile
├── package.json                       # Backend dependencies
├── tsconfig.json                      # Backend TypeScript config
├── README.md                          # Project overview
├── IMPLEMENTATION_GUIDE.md            # This file
└── PHASE15_COMPLETION_SUMMARY.md      # Phase 15 summary
```

---

## Development Workflow

### Daily Development

```bash
# 1. Start database (if using Docker)
docker-compose -f docker-compose.dev.yml up -d

# 2. Start backend (Terminal 1)
npm run dev

# 3. Start frontend (Terminal 2)
cd frontend && npm run dev

# 4. Make changes and test
# Backend will auto-reload on file changes
# Frontend will hot-reload in browser
```

### Code Quality

```bash
# Backend linting
npm run lint

# Backend formatting
npm run format

# Frontend linting (from frontend directory)
cd frontend
npm run build  # TypeScript type checking
```

### Testing

```bash
# Backend tests
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production

```bash
# Backend build
npm run build
# Output: dist/

# Frontend build
cd frontend
npm run build
# Output: dist/

# Preview production build
npm run preview
```

---

## API Reference

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}

Response: 201 Created
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Tax Returns

#### Create Tax Return

```http
POST /api/returns
Authorization: Bearer <token>
Content-Type: application/json

{
  "tax_year": 2024,
  "filing_status": "single"
}

Response: 201 Created
{
  "id": "uuid",
  "tax_year": 2024,
  "filing_status": "single",
  "status": "draft"
}
```

#### Get All Returns

```http
GET /api/returns
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "tax_year": 2024,
    "filing_status": "single",
    "status": "draft",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

#### Calculate Tax

```http
POST /api/returns/:id/calculate
Authorization: Bearer <token>

Response: 200 OK
{
  "total_income": 75000,
  "adjusted_gross_income": 70000,
  "taxable_income": 56200,
  "total_tax": 8234,
  "total_payments": 9500,
  "refund_amount": 1266,
  "amount_owed": 0
}
```

#### Generate PDF

```http
GET /api/returns/:id/pdf
Authorization: Bearer <token>

Response: 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="form-1040-2024.pdf"

<PDF binary data>
```

### Forms

#### Add W-2 Form

```http
POST /api/returns/:returnId/forms/w2
Authorization: Bearer <token>
Content-Type: application/json

{
  "employer_name": "ABC Corporation",
  "employer_ein": "12-3456789",
  "wages": 75000,
  "federal_withholding": 9500,
  "social_security_wages": 75000,
  "medicare_wages": 75000
}

Response: 201 Created
```

#### Add 1099-INT Form

```http
POST /api/returns/:returnId/forms/1099-int
Authorization: Bearer <token>
Content-Type: application/json

{
  "payer_name": "Bank of America",
  "payer_tin": "12-3456789",
  "interest_income": 1250
}

Response: 201 Created
```

### Schedule 1

#### Save Additional Income

```http
POST /api/schedule1/:returnId/additional-income
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_income": 5000,
  "rental_real_estate": 12000,
  "unemployment_compensation": 0
}

Response: 200 OK
```

#### Save Adjustments

```http
POST /api/schedule1/:returnId/adjustments
Authorization: Bearer <token>
Content-Type: application/json

{
  "educator_expenses": 250,
  "student_loan_interest": 2500,
  "ira_deduction": 6500
}

Response: 200 OK
```

### Dependents

#### Add Dependent

```http
POST /api/returns/:returnId/dependents
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "ssn": "123-45-6789",
  "relationship": "daughter",
  "date_of_birth": "2018-05-15",
  "is_qualifying_child": true
}

Response: 201 Created
```

### Payments

#### Add Tax Payment

```http
POST /api/returns/:returnId/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2024-04-15",
  "amount": 2500,
  "type": "estimated",
  "description": "Q1 Estimated Payment"
}

Response: 201 Created
```

---

## Design System

### Color Palette

The application uses a professional color scheme based on financial trust and clarity:

#### Primary Colors

```css
/* Trust Blue - Primary brand color */
--trust-blue-50: #E6F0FF;
--trust-blue-100: #CCE0FF;
--trust-blue-200: #99C2FF;
--trust-blue-300: #66A3FF;
--trust-blue-400: #3385FF;
--trust-blue-500: #0052CC;  /* Primary */
--trust-blue-600: #0047B3;
--trust-blue-700: #003C99;
--trust-blue-800: #003180;
--trust-blue-900: #002666;

/* Financial Green - Success, positive values */
--financial-green-50: #E6F7F0;
--financial-green-100: #CCEFE0;
--financial-green-200: #99DFC2;
--financial-green-300: #66CFA3;
--financial-green-400: #33BF85;
--financial-green-500: #00875A;  /* Success */
--financial-green-600: #00764D;
--financial-green-700: #006540;
--financial-green-800: #005433;
--financial-green-900: #004326;

/* Alert Red - Errors, negative values */
--alert-red-50: #FFEBE6;
--alert-red-100: #FFD6CC;
--alert-red-200: #FFAD99;
--alert-red-300: #FF8566;
--alert-red-400: #FF5C33;
--alert-red-500: #DE350B;  /* Error */
--alert-red-600: #BF2E09;
--alert-red-700: #A02708;
--alert-red-800: #802006;
--alert-red-900: #611905;
```

#### Neutral Colors

```css
/* Neutral Gray - Text, backgrounds */
--neutral-gray-50: #FAFBFC;
--neutral-gray-100: #F4F5F7;
--neutral-gray-200: #EBECF0;
--neutral-gray-300: #DFE1E6;
--neutral-gray-400: #C1C7D0;
--neutral-gray-500: #A5ADBA;
--neutral-gray-600: #7A869A;
--neutral-gray-700: #505F79;  /* Body text */
--neutral-gray-800: #344563;
--neutral-gray-900: #172B4D;  /* Headings */
```

### Typography

```css
/* Font Families */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Component Usage

#### Button Variants

```tsx
import { Button } from '../components/atoms/Button';

// Primary button (trust-blue)
<Button variant="primary" onClick={handleSave}>
  Save
</Button>

// Secondary button (outline)
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Danger button (alert-red)
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// With icon
<Button variant="primary" leftIcon={Save} loading={saving}>
  Save Changes
</Button>
```

#### Form Components

```tsx
import { FormField } from '../components/molecules/FormField';
import { CurrencyInput } from '../components/molecules/CurrencyInput';
import { SSNInput } from '../components/molecules/SSNInput';
import { DateInput } from '../components/molecules/DateInput';

// Standard text input
<FormField
  label="Employer Name"
  value={employerName}
  onChange={(e) => setEmployerName(e.target.value)}
  required
/>

// Currency input (auto-formats with $)
<CurrencyInput
  value={wages}
  onChange={(value) => setWages(value)}
  placeholder="0.00"
  allowNegative={false}
/>

// SSN input (auto-formats as XXX-XX-XXXX)
<SSNInput
  value={ssn}
  onChange={(value) => setSSN(value)}
  placeholder="XXX-XX-XXXX"
/>

// Date input
<DateInput
  value={dateOfBirth}
  onChange={(e) => setDateOfBirth(e.target.value)}
  required
/>
```

#### Card Component

```tsx
import { Card } from '../components/molecules/Card';

<Card padding="lg">
  <h2 className="text-xl font-semibold text-neutral-gray-900 mb-4">
    W-2 Information
  </h2>
  {/* Card content */}
</Card>
```

#### Toast Notifications

```tsx
import { useToast } from '../context/ToastContext';

const { toast } = useToast();

// Success message
toast.showSuccess('Tax return saved successfully!');

// Error message
toast.showError('Failed to calculate tax. Please try again.');
```

#### Modal Dialogs

```tsx
import { ConfirmDialog } from '../components/molecules/Modal';

const [showDeleteDialog, setShowDeleteDialog] = useState(false);

<ConfirmDialog
  isOpen={showDeleteDialog}
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDelete}
  title="Delete Tax Return"
  message="Are you sure you want to delete this tax return? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="danger"
/>
```

---

## Database Schema

### Key Tables

#### users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### tax_returns

```sql
CREATE TABLE tax_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    filing_status VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    personal_info JSONB,
    calculation_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### w2_forms

```sql
CREATE TABLE w2_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_return_id UUID REFERENCES tax_returns(id) ON DELETE CASCADE,
    employer_name VARCHAR(255) NOT NULL,
    employer_ein VARCHAR(20),
    wages NUMERIC(12,2) DEFAULT 0,
    federal_withholding NUMERIC(12,2) DEFAULT 0,
    social_security_wages NUMERIC(12,2) DEFAULT 0,
    medicare_wages NUMERIC(12,2) DEFAULT 0,
    state_wages NUMERIC(12,2) DEFAULT 0,
    state_withholding NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### dependents

```sql
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_return_id UUID REFERENCES tax_returns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    ssn VARCHAR(11) NOT NULL,
    relationship VARCHAR(50),
    date_of_birth DATE,
    is_qualifying_child BOOLEAN DEFAULT false,
    months_lived_in_home INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### schedule_1

```sql
CREATE TABLE schedule_1 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_return_id UUID REFERENCES tax_returns(id) ON DELETE CASCADE,
    -- Part I: Additional Income
    taxable_refunds NUMERIC(12,2) DEFAULT 0,
    alimony_received NUMERIC(12,2) DEFAULT 0,
    business_income NUMERIC(12,2) DEFAULT 0,
    capital_gain_loss NUMERIC(12,2) DEFAULT 0,
    rental_real_estate NUMERIC(12,2) DEFAULT 0,
    unemployment_compensation NUMERIC(12,2) DEFAULT 0,
    -- Part II: Adjustments to Income
    educator_expenses NUMERIC(12,2) DEFAULT 0,
    health_savings_account NUMERIC(12,2) DEFAULT 0,
    ira_deduction NUMERIC(12,2) DEFAULT 0,
    student_loan_interest NUMERIC(12,2) DEFAULT 0,
    alimony_paid NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Deployment

### Development Environment

Already covered in [Quick Start](#quick-start).

### Staging Environment

```bash
# 1. Copy staging environment
cp .env.staging .env

# 2. Update secrets
# Edit .env with staging database credentials

# 3. Build application
npm run build
cd frontend && npm run build && cd ..

# 4. Deploy using Docker Compose
docker-compose up -d

# 5. Initialize database
docker-compose exec backend npm run db:init
docker-compose exec backend npm run rules:init
```

### Production Deployment (Kubernetes)

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete production deployment guide.

**Quick overview:**

```bash
# 1. Set up secrets in Kubernetes
kubectl create secret generic tax-filing-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=JWT_SECRET='...' \
  -n tax-filing-production

# 2. Apply Kubernetes manifests
kubectl apply -f k8s/

# 3. Verify deployment
kubectl get all -n tax-filing-production

# 4. Check pod health
kubectl get pods -n tax-filing-production
```

### CI/CD Pipeline

GitHub Actions workflows are configured for:

1. **Continuous Integration** (`.github/workflows/ci.yml`)
   - Runs on every push/PR
   - Linting, type checking, tests
   - Security scanning

2. **Build and Push** (`.github/workflows/build-and-push.yml`)
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Runs on main/staging branches

3. **Production Deployment** (`.github/workflows/deploy-production.yml`)
   - Deploys to Kubernetes
   - Runs smoke tests
   - Auto-rollback on failure

---

## Testing

### Backend Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/engine/federal-1040.test.ts
```

### Frontend Tests

```bash
cd frontend

# Run component tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

### Integration Testing

```bash
# Start all services
docker-compose up -d

# Run integration tests
npm run test:integration

# Test specific endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","full_name":"Test User"}'
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Create new tax return
- [ ] Complete onboarding questionnaire
- [ ] Add W-2 form
- [ ] Add 1099 forms
- [ ] Add dependents
- [ ] Add tax payments
- [ ] Complete Schedule 1
- [ ] Complete Schedule A
- [ ] Calculate tax
- [ ] Generate PDF
- [ ] View all returns
- [ ] Logout

---

## Monitoring & Observability

### Health Checks

```bash
# Liveness probe (is app running?)
curl http://localhost:3000/health

# Readiness probe (is DB connected?)
curl http://localhost:3000/ready
```

### OpenTelemetry

Enable observability in `.env`:

```bash
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=tax-filing-api
```

**Available metrics:**
- `tax_calculations_total` - Total tax calculations performed
- `tax_calculation_duration_ms` - Calculation time histogram
- `efile_submissions_total` - E-file submission count
- `pdf_generations_total` - PDF generation count
- `user_logins_total` - User login count
- `db_query_duration_ms` - Database query performance

**Traces:**
- HTTP request tracing
- Database query tracing
- Service-to-service calls

### Logging

Winston logger is configured for structured logging:

```typescript
import { logger } from './utils/logger';

logger.info('Tax calculation completed', {
  returnId: 'uuid',
  totalTax: 8234,
  calculationTime: 45
});

logger.error('Failed to generate PDF', {
  returnId: 'uuid',
  error: err.message
});
```

### Monitoring Dashboards

For production, configure:
- **Grafana** for metrics visualization
- **Jaeger** for distributed tracing
- **Prometheus** for metrics collection
- **Datadog** or **New Relic** for full observability

---

## Security

### Authentication & Authorization

- **JWT tokens** with configurable expiry
- **bcrypt password hashing** with 10+ rounds
- **Role-based access control** (user, admin)
- **Token refresh** mechanism (optional)

### API Security

- **CORS** protection with configurable origins
- **Helmet.js** security headers
- **Rate limiting** (configurable)
- **Input validation** on all endpoints
- **SQL injection protection** (parameterized queries)

### Data Security

- **Encryption at rest** (database encryption)
- **Encryption in transit** (HTTPS/TLS)
- **Audit logging** with SHA256 integrity
- **Sensitive data masking** in logs

### Production Security Checklist

Before production deployment:

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Use AWS Secrets Manager or Vault for secrets
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Restrict CORS origins to production domain
- [ ] Enable database SSL connections
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure rate limiting
- [ ] Enable container image scanning
- [ ] Set up intrusion detection
- [ ] Configure backup encryption
- [ ] Implement GDPR/CCPA compliance
- [ ] Set up security monitoring alerts

### Vulnerability Management

```bash
# Check for vulnerable dependencies
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Generate security report
npm audit --json > security-report.json
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error:** `ECONNREFUSED` or `Database connection failed`

**Solutions:**
```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection manually
psql -U tax_user -d tax_filing_db -c "SELECT 1"

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres
```

#### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000        # Mac/Linux
netstat -ano | grep :3000  # Windows

# Kill the process
kill -9 <PID>        # Mac/Linux
taskkill /PID <PID> /F    # Windows

# Or change port in .env
PORT=3001
```

#### 3. Frontend Can't Reach Backend

**Error:** `Network Error` or `CORS error`

**Solutions:**
```bash
# 1. Verify backend is running
curl http://localhost:3000/health

# 2. Check CORS_ORIGIN in .env includes frontend URL
CORS_ORIGIN=http://localhost:5173

# 3. Check API_URL in frontend code
# Should match backend URL
```

#### 4. Database Migrations Failed

**Error:** `Migration failed` or `Table already exists`

**Solutions:**
```bash
# Drop and recreate database
psql -U tax_user -c "DROP DATABASE tax_filing_db"
psql -U tax_user -c "CREATE DATABASE tax_filing_db"

# Run migrations again
npm run db:init
npm run rules:init
```

#### 5. Build Errors

**Error:** `TypeScript compilation failed`

**Solutions:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist/

# Rebuild
npm run build
```

### Debug Mode

Enable detailed logging:

```bash
# Backend
LOG_LEVEL=debug npm run dev

# Frontend (in browser console)
localStorage.setItem('debug', '*')
```

### Getting Help

1. Check logs:
   ```bash
   # Backend logs
   npm run dev

   # Docker logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. Enable debug mode (see above)

3. Check [GitHub Issues](https://github.com/your-repo/issues)

4. Contact support:
   - Development: dev@taxfiling.example.com
   - Security: security@taxfiling.example.com

---

## Contributing

### Development Guidelines

1. **Branch Naming:**
   - Feature: `feature/tax-calculator-improvements`
   - Bugfix: `bugfix/fix-w2-validation`
   - Hotfix: `hotfix/security-patch`

2. **Commit Messages:**
   ```
   feat: Add Schedule C support for business income
   fix: Correct capital gains calculation in Schedule D
   docs: Update API documentation for dependents endpoint
   refactor: Simplify tax calculation engine
   test: Add unit tests for state tax calculators
   ```

3. **Code Style:**
   - Use TypeScript strict mode
   - Follow ESLint rules
   - Run Prettier before committing
   - Add JSDoc comments for functions
   - Write unit tests for new features

4. **Pull Request Process:**
   ```bash
   # 1. Create feature branch from develop
   git checkout -b feature/my-feature develop

   # 2. Make changes and commit
   git add .
   git commit -m "feat: Add new feature"

   # 3. Push to remote
   git push origin feature/my-feature

   # 4. Create PR to develop branch
   # 5. Wait for CI/CD checks to pass
   # 6. Request code review
   # 7. Merge after approval
   ```

### Testing Requirements

All pull requests must include:
- [ ] Unit tests for new functions
- [ ] Integration tests for new endpoints
- [ ] Type definitions for TypeScript
- [ ] Updated documentation
- [ ] No linting errors
- [ ] Passing CI/CD pipeline

---

## License

ISC License

Copyright (c) 2026

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

## Support

### Documentation

- **README.md** - Project overview and quick start
- **IMPLEMENTATION_GUIDE.md** - This comprehensive guide
- **docs/DEPLOYMENT.md** - Production deployment guide
- **PHASE15_COMPLETION_SUMMARY.md** - Latest phase completion

### Contact

- **General Questions:** dev@taxfiling.example.com
- **Security Issues:** security@taxfiling.example.com
- **Bug Reports:** [GitHub Issues](https://github.com/your-repo/issues)

### Useful Links

- [IRS Tax Forms](https://www.irs.gov/forms-instructions)
- [IRS MeF Documentation](https://www.irs.gov/e-file-providers/modernized-e-file-overview)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Last Updated:** January 18, 2026
**Document Version:** 1.0
**Project Status:** Production-Ready MVP ✅
