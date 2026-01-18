# Deployment Checklist

Quick reference checklist for deploying the Tax Filing Application to different environments.

---

## Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)
- [ ] Git branch up to date with remote
- [ ] All changes committed and pushed

### Environment Configuration
- [ ] Environment file created (`.env`, `.env.staging`, or `.env.production`)
- [ ] Database URL configured correctly
- [ ] JWT_SECRET is strong and unique (not default value)
- [ ] CORS_ORIGIN matches frontend domain(s)
- [ ] Feature flags set appropriately
- [ ] IRS e-file credentials configured (if applicable)

### Security
- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Secrets stored in vault/secrets manager (production)
- [ ] SSL/TLS certificates configured (production)
- [ ] HTTPS enforced (production)

---

## Local Development Deployment

```bash
# 1. Setup
☐ cp .env.example .env
☐ Edit .env with local settings
☐ docker-compose -f docker-compose.dev.yml up -d

# 2. Database
☐ npm run db:init
☐ npm run rules:init

# 3. Start Services
☐ npm run dev                    # Terminal 1: Backend
☐ cd frontend && npm run dev     # Terminal 2: Frontend

# 4. Verify
☐ curl http://localhost:3000/health
☐ curl http://localhost:3000/ready
☐ Visit http://localhost:5173
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## Docker Compose Deployment

```bash
# 1. Configuration
☐ Set environment variables or create .env file
☐ Verify DATABASE_URL points to correct database
☐ Verify ports are available (3000, 8080, 5433)

# 2. Build & Deploy
☐ docker-compose build
☐ docker-compose up -d

# 3. Verify
☐ docker-compose ps                                    # All services "Up"
☐ docker-compose logs -f                               # Check for errors
☐ curl http://localhost:3000/health                    # Should return 200
☐ curl http://localhost:3000/ready                     # Should return 200
☐ curl http://localhost:8080/health                    # Should return 200

# 4. Post-Deployment
☐ Visit http://localhost:8080
☐ Register a test user
☐ Create a test tax return
☐ Verify tax calculation works
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## Kubernetes Staging Deployment

```bash
# 1. Cluster Access
☐ kubectl config current-context                       # Verify correct cluster
☐ kubectl get nodes                                    # Cluster accessible

# 2. Build & Push Images
☐ Build images: docker-compose build
☐ Tag images: docker tag tax-filing-backend:latest <registry>/tax-filing-backend:staging-<version>
☐ Push images: docker push <registry>/tax-filing-backend:staging-<version>

# 3. Secrets Configuration
☐ Create namespace: kubectl apply -f k8s/namespace.yaml
☐ Create database secret
☐ Create app-secrets secret
☐ Create redis-secret secret
☐ Verify secrets: kubectl get secrets -n tax-filing-staging

# 4. Deploy Application
☐ kubectl apply -f k8s/configmap.yaml
☐ kubectl apply -f k8s/deployment.yaml
☐ kubectl apply -f k8s/service.yaml
☐ kubectl apply -f k8s/hpa.yaml

# 5. Verify Deployment
☐ kubectl get deployments -n tax-filing-staging
☐ kubectl get pods -n tax-filing-staging               # All "Running"
☐ kubectl get svc -n tax-filing-staging
☐ kubectl get hpa -n tax-filing-staging

# 6. Test Health Endpoints
☐ kubectl port-forward svc/tax-filing-api 3000:3000 -n tax-filing-staging
☐ curl http://localhost:3000/health
☐ curl http://localhost:3000/ready

# 7. Smoke Tests
☐ Access frontend via LoadBalancer IP or Ingress
☐ Test user registration
☐ Test tax return creation
☐ Test tax calculation
☐ Test PDF generation

# 8. Monitor
☐ Check pod logs: kubectl logs -f deployment/tax-filing-api -n tax-filing-staging
☐ Monitor HPA: kubectl get hpa -w -n tax-filing-staging
☐ Check metrics (if OpenTelemetry enabled)
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## Kubernetes Production Deployment

### Pre-Production Checklist
- [ ] Successfully deployed to staging
- [ ] All smoke tests passed in staging
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Backup strategy in place
- [ ] Rollback plan documented
- [ ] On-call team notified
- [ ] Monitoring dashboards ready
- [ ] Alerting rules configured

```bash
# 1. Final Verification
☐ All staging tests passed
☐ Production secrets configured in AWS Secrets Manager/Vault
☐ DNS records configured
☐ SSL/TLS certificates configured
☐ Monitoring and alerting active

# 2. Production Secrets
☐ kubectl create secret generic db-secret --from-literal=url='<PRODUCTION_DB_URL>' -n tax-filing-production
☐ kubectl create secret generic app-secrets \
    --from-literal=jwt-secret='<STRONG_SECRET>' \
    --from-literal=irs-efile-tcc='<TCC>' \
    --from-literal=irs-efile-efin='<EFIN>' \
    -n tax-filing-production
☐ kubectl create secret generic redis-secret --from-literal=url='<REDIS_URL>' -n tax-filing-production

# 3. ConfigMaps
☐ Verify production ConfigMap values in k8s/configmap.yaml
☐ kubectl apply -f k8s/configmap.yaml

# 4. Deploy (Blue/Green or Canary recommended)
☐ kubectl apply -f k8s/deployment.yaml
☐ Watch rollout: kubectl rollout status deployment/tax-filing-api -n tax-filing-production

# 5. Services & Ingress
☐ kubectl apply -f k8s/service.yaml
☐ kubectl apply -f k8s/ingress.yaml (if using)
☐ Verify external IP: kubectl get svc -n tax-filing-production

# 6. Autoscaling
☐ kubectl apply -f k8s/hpa.yaml
☐ Verify HPA: kubectl get hpa -n tax-filing-production

# 7. Health Checks
☐ curl https://api.taxfiling.example.com/health
☐ curl https://api.taxfiling.example.com/ready

# 8. Smoke Tests (Production)
☐ Access https://app.taxfiling.example.com
☐ Test user registration (use test account)
☐ Test tax return creation
☐ Test tax calculation with known values
☐ Test PDF generation
☐ Test e-file XML generation (test mode)

# 9. Monitor for 1 Hour
☐ Watch pod status: kubectl get pods -w -n tax-filing-production
☐ Monitor logs for errors: kubectl logs -f deployment/tax-filing-api -n tax-filing-production
☐ Check metrics dashboard
☐ Verify no error alerts triggered
☐ Check application performance (response times)

# 10. Post-Deployment
☐ Update deployment documentation
☐ Tag release in Git
☐ Notify stakeholders of successful deployment
☐ Schedule post-deployment review
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## GitHub Actions CI/CD Deployment

### Automatic Deployment (Push to main)
```bash
# 1. Merge to main
☐ Create PR to main branch
☐ All CI checks pass
☐ Code review approved
☐ Merge PR

# 2. Automated Pipeline
☐ CI workflow runs (tests, lint, security)
☐ Build workflow runs (Docker images built & pushed)
☐ Deploy workflow runs (Kubernetes deployment)

# 3. Monitor Pipeline
☐ Check GitHub Actions tab
☐ Verify all jobs succeed
☐ Check deployment logs

# 4. Verify Deployment
☐ Run post-deployment smoke tests
☐ Monitor application metrics
```

### Manual Deployment (Workflow Dispatch)
```bash
# 1. Trigger via GitHub UI
☐ Go to Actions → Deploy to Production → Run workflow
☐ Select environment (staging or production)
☐ Click "Run workflow"

# 2. Monitor
☐ Watch workflow execution
☐ Check for any failures
☐ Review deployment logs

# 3. Verify
☐ Test health endpoints
☐ Run smoke tests
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## Rollback Procedures

### Kubernetes Rollback
```bash
# View deployment history
☐ kubectl rollout history deployment/tax-filing-api -n <namespace>

# Rollback to previous version
☐ kubectl rollout undo deployment/tax-filing-api -n <namespace>

# Rollback to specific revision
☐ kubectl rollout undo deployment/tax-filing-api --to-revision=<N> -n <namespace>

# Verify rollback
☐ kubectl rollout status deployment/tax-filing-api -n <namespace>
☐ curl <health-endpoint>
```

### Docker Compose Rollback
```bash
# Stop current version
☐ docker-compose down

# Pull previous image
☐ docker pull <registry>/tax-filing-backend:<previous-tag>

# Update docker-compose.yml image tags
☐ Edit image versions in docker-compose.yml

# Restart
☐ docker-compose up -d
```

**Status:** ☐ Not Started | ☐ In Progress | ☐ Complete

---

## Post-Deployment Verification

### Functional Tests
- [ ] User can register
- [ ] User can login
- [ ] User can create tax return
- [ ] User can add W-2 form
- [ ] User can add 1099 forms
- [ ] Tax calculation completes successfully
- [ ] PDF generation works
- [ ] E-file XML generation works

### Performance Tests
- [ ] Response times < 2 seconds for form saves
- [ ] Response times < 5 seconds for tax calculations
- [ ] No memory leaks observed
- [ ] Database connection pool healthy
- [ ] CPU usage within expected range

### Monitoring & Alerts
- [ ] All pods healthy
- [ ] HPA functioning correctly
- [ ] Metrics being collected
- [ ] Logs being aggregated
- [ ] Alert rules active
- [ ] No critical alerts fired

---

## Common Issues & Solutions

| Issue | Check | Solution |
|-------|-------|----------|
| Pods in CrashLoopBackOff | `kubectl describe pod <pod>` | Check secrets/configmaps exist |
| Database connection fails | `/ready` endpoint returns 503 | Verify DATABASE_URL, check DB accessibility |
| Frontend shows CORS errors | Browser console | Update CORS_ORIGIN in backend config |
| Health checks failing | Pod logs | Check resource limits, dependencies |
| Images not pulling | `kubectl get pods -o wide` | Verify image registry credentials |

---

## Emergency Contacts

- **On-Call Engineer:** [Contact Info]
- **DevOps Team:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Security Team:** [Contact Info]

---

## Notes

**Last Deployed:** ___________
**Deployed By:** ___________
**Version:** ___________
**Issues Encountered:**
___________________________________________
___________________________________________

**Rollback Required:** ☐ Yes  ☐ No
**Reason:** ___________________________________________
