# Tax Filing Application - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Observability](#monitoring-and-observability)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Software

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 15+
- **Docker** 20.10+ and Docker Compose 2.0+
- **kubectl** (for Kubernetes deployments)
- **Git** for version control

### Required Accounts/Access

- AWS account with appropriate permissions (for production)
- GitHub repository access
- Container registry access (GitHub Container Registry or AWS ECR)
- Kubernetes cluster access (for production deployments)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourorg/tax-filing-app.git
cd tax-filing-app
```

### Step 2: Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your local settings
# Minimum required:
# - DATABASE_URL
# - JWT_SECRET (use any value for local dev)
```

### Step 4: Start Infrastructure Services

```bash
# Start PostgreSQL and Redis using Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose -f docker-compose.dev.yml ps
```

### Step 5: Initialize Database

```bash
# Run database migrations
npm run db:init

# Bootstrap tax rules for 2025
npm run rules:init
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
# Backend will run on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### Step 7: Verify Installation

```bash
# Check backend health
curl http://localhost:3000/health

# Check backend readiness (database connectivity)
curl http://localhost:3000/ready
```

---

## Docker Deployment

### Development Environment

```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production-like Build

```bash
# Build production images
docker-compose build

# Start services
docker-compose up -d

# Services will be available at:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:8080
```

### Using Environment Variables

```bash
# Set environment variables
export DB_USER=custom_user
export DB_PASSWORD=custom_password
export JWT_SECRET=your_production_secret

# Start with custom environment
docker-compose up -d
```

---

## Kubernetes Deployment

### Prerequisites

1. **Kubernetes Cluster** (EKS, GKE, AKS, or self-hosted)
2. **kubectl** configured to access your cluster
3. **Container images** pushed to registry

### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Configure Secrets

**Option A: Manual Secret Creation**

```bash
# Create database secret
kubectl create secret generic db-secret \
  --from-literal=url='postgresql://user:password@host:5432/database' \
  --namespace=tax-filing-production

# Create application secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret='YOUR_JWT_SECRET_HERE' \
  --from-literal=irs-efile-tcc='YOUR_TCC_HERE' \
  --from-literal=irs-efile-efin='YOUR_EFIN_HERE' \
  --namespace=tax-filing-production

# Create Redis secret
kubectl create secret generic redis-secret \
  --from-literal=url='redis://redis-host:6379' \
  --namespace=tax-filing-production
```

**Option B: Using AWS Secrets Manager**

```bash
# Install External Secrets Operator
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Configure ExternalSecret resources (see k8s/external-secrets.yaml)
```

**Option C: Using HashiCorp Vault**

```bash
# Install Vault Secrets Operator
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault \
  --namespace vault \
  --create-namespace
```

### Step 3: Apply ConfigMaps

```bash
kubectl apply -f k8s/configmap.yaml
```

### Step 4: Deploy Applications

```bash
# Deploy backend and frontend
kubectl apply -f k8s/deployment.yaml

# Verify deployments
kubectl get deployments -n tax-filing-production
kubectl get pods -n tax-filing-production
```

### Step 5: Create Services

```bash
# Create LoadBalancer services
kubectl apply -f k8s/service.yaml

# Get external IPs
kubectl get svc -n tax-filing-production
```

### Step 6: Configure Autoscaling

```bash
# Apply Horizontal Pod Autoscalers
kubectl apply -f k8s/hpa.yaml

# Verify HPA status
kubectl get hpa -n tax-filing-production
```

### Step 7: Setup Ingress (Optional)

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace

# Install cert-manager for TLS
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml
```

### Step 8: Verify Deployment

```bash
# Check pod status
kubectl get pods -n tax-filing-production -w

# View pod logs
kubectl logs -f deployment/tax-filing-api -n tax-filing-production

# Test health endpoints
kubectl port-forward svc/tax-filing-api 3000:3000 -n tax-filing-production
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

---

## Environment Configuration

### Environment Files

| File | Purpose | Location |
|------|---------|----------|
| `.env.example` | Template with all variables | Root directory |
| `.env` | Local development (gitignored) | Root directory |
| `.env.development` | Development environment | Root directory |
| `.env.staging` | Staging environment | Root directory |
| `.env.production` | Production template (secrets from vault) | Root directory |

### Critical Environment Variables

**Security (REQUIRED in production):**
```bash
JWT_SECRET=                    # Strong random string (openssl rand -base64 64)
DATABASE_URL=                  # PostgreSQL connection string
REDIS_URL=                     # Redis connection string
```

**Application Configuration:**
```bash
NODE_ENV=production           # production, staging, development
PORT=3000                     # API server port
LOG_LEVEL=warn                # error, warn, info, debug
```

**Database Configuration:**
```bash
DB_POOL_MIN=10                # Minimum connection pool size
DB_POOL_MAX=50                # Maximum connection pool size
```

**Observability:**
```bash
OTEL_ENABLED=true             # Enable OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=  # OTLP collector endpoint
OTEL_SERVICE_NAME=            # Service name for tracing
```

**Feature Flags:**
```bash
ENABLE_PDF_GENERATION=true    # Enable/disable PDF generation
ENABLE_EFILE_SUBMISSION=true  # Enable/disable e-filing
ENABLE_STATE_TAX=true         # Enable/disable state tax calculations
```

---

## Monitoring and Observability

### OpenTelemetry Setup

The application includes OpenTelemetry instrumentation for distributed tracing and metrics.

**Enable OpenTelemetry:**
```bash
# In your environment file
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=tax-filing-api
```

**Deploy OpenTelemetry Collector (Kubernetes):**
```bash
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install otel-collector open-telemetry/opentelemetry-collector \
  --namespace observability \
  --create-namespace
```

### Available Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `tax_calculations_total` | Counter | Total tax calculations performed |
| `tax_calculation_duration_ms` | Histogram | Tax calculation duration |
| `tax_calculation_errors_total` | Counter | Tax calculation errors |
| `efile_submissions_total` | Counter | E-file submissions |
| `efile_acceptances_total` | Counter | Accepted e-file submissions |
| `efile_rejections_total` | Counter | Rejected e-file submissions |
| `pdf_generations_total` | Counter | PDF generations |
| `pdf_generation_duration_ms` | Histogram | PDF generation duration |
| `user_logins_total` | Counter | User logins |
| `user_registrations_total` | Counter | User registrations |

### Health Check Endpoints

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `/health` | Liveness probe | 200 if service is running |
| `/ready` | Readiness probe | 200 if database is connected |

### Viewing Logs

**Docker Compose:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

**Kubernetes:**
```bash
# View backend logs
kubectl logs -f deployment/tax-filing-api -n tax-filing-production

# View logs from all pods
kubectl logs -f -l app=tax-filing-api -n tax-filing-production

# View previous container logs (useful after crash)
kubectl logs deployment/tax-filing-api --previous -n tax-filing-production
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Fails

**Symptoms:**
- `/ready` endpoint returns 503
- Logs show "connection refused"

**Solutions:**
```bash
# Check if database is running
docker-compose ps postgres

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database

# Check network connectivity (Kubernetes)
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql $DATABASE_URL -c "SELECT 1"
```

#### 2. Frontend Can't Reach Backend

**Symptoms:**
- Frontend shows "Network Error"
- CORS errors in browser console

**Solutions:**
```bash
# Verify CORS_ORIGIN is set correctly
echo $CORS_ORIGIN

# Should include frontend URL
# Local: http://localhost:5173,http://localhost:5174
# Prod: https://app.taxfiling.example.com

# Check backend is accessible
curl http://localhost:3000/health
```

#### 3. Pods Crash in Kubernetes

**Symptoms:**
- Pods in CrashLoopBackOff state

**Solutions:**
```bash
# Check pod events
kubectl describe pod <pod-name> -n tax-filing-production

# Check logs
kubectl logs <pod-name> -n tax-filing-production

# Check resource limits
kubectl top pods -n tax-filing-production

# Common causes:
# - Missing secrets/configmaps
# - Resource limits too low
# - Database not accessible
```

#### 4. Build Failures

**Symptoms:**
- Docker build fails
- TypeScript compilation errors

**Solutions:**
```bash
# Clear build cache
docker-compose build --no-cache

# Check Node.js version
node --version  # Should be 18+

# Rebuild TypeScript
npm run build

# Check for missing dependencies
npm install
```

---

## Rollback Procedures

### Kubernetes Rollback

```bash
# View deployment history
kubectl rollout history deployment/tax-filing-api -n tax-filing-production

# Rollback to previous version
kubectl rollout undo deployment/tax-filing-api -n tax-filing-production

# Rollback to specific revision
kubectl rollout undo deployment/tax-filing-api \
  --to-revision=2 \
  -n tax-filing-production

# Monitor rollback status
kubectl rollout status deployment/tax-filing-api -n tax-filing-production
```

### Docker Compose Rollback

```bash
# Pull previous image version
docker pull tax-filing-backend:previous-tag

# Update docker-compose.yml to use previous tag
# Then restart services
docker-compose up -d
```

### Database Migration Rollback

```bash
# If migrations include down migrations
npm run db:migrate:down

# Manual rollback
psql $DATABASE_URL -f migrations/rollback_script.sql
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to main, develop | Run tests, linting, security scans |
| `build-and-push.yml` | Push to main, tags | Build and push Docker images |
| `deploy-production.yml` | Push to main, manual | Deploy to Kubernetes |

### Deployment Process

1. **Developer pushes to `develop` branch**
   - CI workflow runs (tests, lint, security scan)

2. **PR merged to `main` branch**
   - CI workflow runs
   - Docker images built and pushed to registry

3. **Automatic or manual deployment**
   - Images deployed to Kubernetes
   - Health checks performed
   - Rollback on failure

### Manual Deployment Trigger

```bash
# Via GitHub Actions UI
# Go to: Actions → Deploy to Production → Run workflow
# Select environment: staging or production

# Via GitHub CLI
gh workflow run deploy-production.yml \
  -f environment=production
```

---

## Security Checklist

Before deploying to production:

- [ ] All secrets stored in AWS Secrets Manager / Vault
- [ ] No hardcoded credentials in code or configs
- [ ] JWT_SECRET is strong random string
- [ ] Database passwords are complex and unique
- [ ] HTTPS/TLS enabled for all endpoints
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Security headers enabled (helmet.js)
- [ ] Container images scanned for vulnerabilities
- [ ] Database connections use SSL
- [ ] Audit logging enabled and immutable
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

---

## Support and Contacts

- **Development Team:** dev@taxfiling.example.com
- **DevOps/Infrastructure:** devops@taxfiling.example.com
- **Security Issues:** security@taxfiling.example.com
- **On-call Pager:** +1-XXX-XXX-XXXX

---

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE.md)
- [Compliance Documentation](./COMPLIANCE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
