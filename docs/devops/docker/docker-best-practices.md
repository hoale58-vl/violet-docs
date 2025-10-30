# Docker Best Practices

Essential best practices for working with Docker containers.

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
