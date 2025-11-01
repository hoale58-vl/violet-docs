# Best Practices

Essential best practices for working with Docker containers.

## Quick Start Checklist

Use this checklist for every Docker project to ensure you're following best practices:

| # | Best Practice | Reference / Commands |
|:-:|--------------|---------------------|
| ⬜ | **Use multi-stage builds** to reduce image size | [Multi-Stage Builds](#multi-stage-builds) |
| ⬜ | **Create .dockerignore file** to exclude unnecessary files | [.dockerignore](#dockerignore) |
| ⬜ | **Don't run containers as root** - create non-root user | [Security Best Practices](#security-best-practices) |
| ⬜ | **Use specific image tags** instead of `latest` | Use versioned tags like `node:18.17.1-alpine` |
| ⬜ | **Scan images for vulnerabilities** before deployment | `docker scan <image>` or use Trivy/Snyk |
| ⬜ | **Use Alpine-based images** for smaller size | Choose `-alpine` variants when available |
| ⬜ | **Combine RUN commands** to reduce layers | Use `&&` to chain commands |
| ⬜ | **Order Dockerfile instructions** from least to most frequently changing | Place `COPY package.json` before `COPY .` |
| ⬜ | **Use COPY instead of ADD** unless extracting archives | Prefer `COPY` for clarity |
| ⬜ | **Set resource limits** for containers | Use `--memory` and `--cpus` flags |
| ⬜ | **Use health checks** in Dockerfile | Add `HEALTHCHECK` instruction |
| ⬜ | **Pin dependency versions** in package files | Avoid floating versions |
| ⬜ | **Use layer caching** effectively | Copy dependency files first, then app code |
| ⬜ | **Set proper labels** for metadata | Use `LABEL` for maintainer, version, etc. |
| ⬜ | **Avoid storing secrets in images** | Use environment variables or secrets management |
| ⬜ | **Use .env files** for local development | Keep secrets out of docker-compose.yml |
| ⬜ | **Implement proper logging** | Log to stdout/stderr, not files |
| ⬜ | **Use docker-compose** for multi-container apps | [Docker Compose](#docker-compose) |
| ⬜ | **Tag images properly** before pushing | `docker tag <image> <registry>/<name>:<version>` |
| ⬜ | **Clean up regularly** to save disk space | `docker system prune -a --volumes` |

> **Note:** Copy this checklist to your project README and manually check off items (⬜ → ✅) as you complete them.

### Verification Commands

Run these commands to verify your Docker setup:

```bash
# Check Docker version
docker --version
docker-compose --version

# Inspect image layers and size
docker history <image>
docker images

# Scan for vulnerabilities
docker scan <image>
# Or use Trivy
trivy image <image>

# Check running containers resource usage
docker stats

# Verify health checks
docker inspect <container> | grep -A 10 Health

# Check for root user (should not be root)
docker run --rm <image> whoami

# List image labels
docker inspect <image> | grep -A 10 Labels

# Check layer caching efficiency
docker build --no-cache -t test .
docker build -t test .  # Should be faster

# Verify .dockerignore is working
docker build -t test . 2>&1 | grep "Sending build context"
```

## Multi-Stage Builds

Use multi-stage builds to reduce image size:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "index.js"]
```

## .dockerignore

Always use `.dockerignore` to exclude unnecessary files:

```text
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
```

## Security Best Practices

1. **Don't run as root**
   ```dockerfile
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   USER nextjs
   ```

2. **Use specific image tags**
   ```dockerfile
   # Bad
   FROM node:latest

   # Good
   FROM node:18.17.1-alpine
   ```

3. **Scan images for vulnerabilities**
   ```bash
   docker scan myimage:latest
   ```

## Optimization Tips

- Use Alpine-based images when possible
- Combine RUN commands to reduce layers
- Order Dockerfile instructions from least to most frequently changing
- Use COPY instead of ADD unless you need tar extraction

## Tags

`docker`, `containers`, `devops`, `infrastructure`

---

*Last updated: 2025-10-30*
