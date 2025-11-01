# Templates

Production-ready Dockerfile templates for common application stacks.

## Available Templates

- [Next.js SSR Application](#nextjs-ssr-application)
- [Express.js Application](#expressjs-application)
- [Rust Application](#rust-application)
- [Go Application](#go-application)
- [Docker Compose Examples](#docker-compose)

---

## Next.js SSR Application

Multi-stage Dockerfile for Next.js applications with server-side rendering.

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### next.config.js

Required for standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
```

### .dockerignore

```
node_modules
.next
.git
.gitignore
README.md
.env*.local
.vscode
.idea
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
coverage
.cache
dist
build
```

---

## Express.js Application

Optimized Dockerfile for Express.js REST APIs.

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Development Dependencies (for building TypeScript)
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (if applicable)
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Set ownership
RUN chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 3000

ENV PORT 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
```

### .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.*.local
.vscode
.idea
*.log
coverage
.nyc_output
dist
build
.cache
.DS_Store
```

### Build & Run

```bash
# Build
docker build -t express-api .

# Run
docker run -p 3000:3000 express-api

# With environment variables
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -e REDIS_URL="redis://..." \
  express-api
```

---

## Rust Application

Multi-stage Dockerfile optimized for Rust binaries with minimal final image  (Actix Web / Rocket).

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev pkgconfig openssl-dev openssl-libs-static

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Create dummy for caching
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy source
COPY src ./src
COPY migrations ./migrations
COPY templates ./templates

# Build
RUN touch src/main.rs && \
    cargo build --release --locked

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates libgcc

RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# Copy binary and static assets
COPY --from=builder /app/target/release/myapp /app/myapp
COPY --from=builder /app/templates ./templates
COPY static ./static

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENV RUST_LOG=info
ENV PORT=8080
ENV HOST=0.0.0.0

CMD ["/app/myapp"]
```

### .dockerignore

```
target
.git
.gitignore
README.md
.env
.env.local
*.log
.vscode
.idea
.DS_Store
Dockerfile
.dockerignore
```

---

## Go Application

Minimal Dockerfile for Go applications using scratch base image  (Fiber / Gin / Echo Web Frameworks).

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags='-w -s -X main.Version=$(git describe --tags --always)' \
    -o /app/api \
    ./cmd/api

# Runtime
FROM alpine:3.19

RUN apk add --no-cache ca-certificates

RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# Copy binary and assets
COPY --from=builder /app/api /app/api
COPY --from=builder /app/config ./config
COPY --from=builder /app/migrations ./migrations

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/app/api", "healthcheck"]

ENV GIN_MODE=release
ENV PORT=8080

CMD ["/app/api", "serve"]
```

### .dockerignore

```
.git
.gitignore
README.md
.env
.env.local
*.log
.vscode
.idea
.DS_Store
bin
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor
.air.toml
tmp
```

---

## Docker Compose

```yaml
version: '3.8'

services:
  psql:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## Tags

`docker`, `dockerfile`, `templates`, `nextjs`, `express`, `rust`, `golang`, `containerization`, `devops`

---

*Last updated: 2025-10-31*
