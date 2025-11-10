# Templates

Ready-to-use workflow templates for common CI/CD scenarios.

---

## React Static Website to Cloud Storage

### Deploy to GCP Cloud Storage

```yaml
name: Deploy React App to GCS

on:
  push:
    branches:
      - staging
      - prod
    paths:
      - 'src/**'
      - 'public/**'
      - 'package*.json'
      - '.github/workflows/**'
  pull_request:
    branches:
      - staging
      - prod

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '18'
  PROJECT_ID: 'violet-project'
  CURRENT_SERVICE: ${{ github.event.repository.name }}
  REGION: us-central1
  STAGING_GCS_BUCKET: gs://staging.violet.xyz/
  PROD_GCS_BUCKET: gs://prod.violet.xyz/
  NAMESPACE: ${{ github.ref_name }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read
      id-token: write  # Required for GCP Workload Identity

    steps:
      - name: Checkout code
        uses: actions/checkout@v5.0.0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v6.0.0
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "pnpm"

      - name: Cache dependencies
        uses: actions/cache@v4.3.0
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        timeout-minutes: 5
        run: npm test -- --coverage --watchAll=false

      - name: Build application
        timeout-minutes: 5
        run: pnpm build
        env:
          CI: true

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        id: auth
        with:
          project_id: ${{ env.PROJECT_ID }}
          workload_identity_provider: 'projects/624428081092/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider'
          service_account: 'github-actions-sa@${{ env.PROJECT_ID }}.iam.gserviceaccount.com'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v3.0.1

      - name: Deploy to GCS (Staging)
        if: github.event_name == 'push' && github.ref_name == 'staging'
        run: |
          gsutil -m rsync -r -d dist/ ${{ env.STAGING_GCS_BUCKET }}
      
      - name: Deploy to GCS (Prod)
        if: github.event_name == 'push' && github.ref_name == 'prod'
        run: |
          gsutil -m rsync -r -d dist/ ${{ env.PROD_GCS_BUCKET }}

      - name: Cleanup on failure
        if: failure()
        run: |
          echo "Build failed, cleaning up..."
          rm -rf dist/ node_modules/.cache
```

---

## Docker Build and Push

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [prod, staging]
    tags: ['v*']
    paths:
      - 'Dockerfile'
      - 'src/**'
      - '.dockerignore'
      - '.github/workflows/**'
  pull_request:
    branches: [prod, staging]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  CURRENT_SERVICE: ${{ github.event.repository.name }}
  PROJECT_ID: fewcha-450202
  REGION: us-central1
  GKE_CLUSTER: fewcha-gke

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: 'read'
      id-token: 'write'
      security-events: write # For uploading SARIF results
    steps:
      - name: Checkout code
        uses: actions/checkout@v5.0.0

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3.11.1

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5.8.0
        with:
          images: ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Set up Google Cloud SDK
        uses: google-github-actions/auth@v3
        id: auth
        with:
          project_id: ${{ env.PROJECT_ID }}
          workload_identity_provider: 'projects/624428081092/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider'
          service_account: 'github-actions-sa@${{ env.PROJECT_ID }}.iam.gserviceaccount.com'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v3.0.1

      - name: Configure Docker for Artifact Registry
        run: |
          gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Get GKE credential
        uses: 'google-github-actions/get-gke-credentials@v2'
        with:
          cluster_name: ${{ env.GKE_CLUSTER }}
          location: ${{ env.REGION }}

      - name: Build and push Docker image
        id: build
        timeout-minutes: 20
        uses: docker/build-push-action@v6.18.0
        with:
          context: .
          file: ./Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}:buildcache
          cache-to: type=registry,ref=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}:buildcache,mode=max
          platforms: linux/amd64

      - name: Install cosign
        if: github.event_name != 'pull_request'
        uses: sigstore/cosign-installer@v4.0.0

      - name: Sign the images with cosign
        if: github.event_name != 'pull_request'
        env:
          COSIGN_EXPERIMENTAL: 'true'
        run: |
          cosign sign --yes ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}@${{ steps.build.outputs.digest }}

      - name: Run Trivy security scan
        uses: aquasecurity/trivy-action@0.33.1
        continue-on-error: true
        with:
          image-ref: ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}@${{ steps.build.outputs.digest }}
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'

      - name: Apply to K8S
        if: github.event_name == 'push' && github.ref_name == 'staging'
        run: |-
          kubectl rollout restart -n roshambo-${{ github.ref_name }} deploy ${{ env.CURRENT_SERVICE }}

```

---

## Test and Lint

```yaml
name: Test and Lint

on:
  push:
    branches:
      - staging
      - prod
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package*.json'
      - 'tsconfig.json'
      - '.eslintrc*'
      - '.github/workflows/**'
  pull_request:
    branches:
      - staging
      - prod

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v5.0.0

      - name: Setup Node.js
        uses: actions/setup-node@v6.0.0
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@v4.3.0
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        timeout-minutes: 5
        run: npm run lint

      - name: Run Prettier check
        timeout-minutes: 3
        run: npm run format:check

      - name: Check TypeScript
        timeout-minutes: 5
        run: npm run type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 20
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v5.0.0

      - name: Setup Node.js
        uses: actions/setup-node@v6.0.0
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Cache dependencies
        uses: actions/cache@v4.3.0
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        timeout-minutes: 15
        run: npm test
        env:
          NODE_ENV: test
          MNEMONIC: 'test test test test test test test test test test test junk'

      - name: Run tests with coverage
        run: npm run test:coverage
        env:
          NODE_ENV: test
          MNEMONIC: 'test test test test test test test test test test test junk'

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

---

## Rust Project Build and Deploy

### GitHub Actions Workflow

```yaml
name: Build and Push Rust Docker Image

on:
  push:
    branches:
      - prod
      - staging
    tags: ['v*']
    paths:
      - 'src/**'
      - 'Cargo.toml'
      - 'Cargo.lock'
      - 'Dockerfile'
      - '.dockerignore'
      - '.github/workflows/**'
  pull_request:
    branches:
      - prod
      - staging

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  CURRENT_SERVICE: ${{ github.event.repository.name }}
  PROJECT_ID: fewcha-450202
  REGION: us-central1
  RUST_VERSION: '1.83'
  APP_NAME: indexer
  GKE_CLUSTER: fewcha-gke

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    timeout-minutes: 45

    permissions:
      contents: read
      id-token: write
      security-events: write

    strategy:
      matrix:
        include:
          - platform: linux/amd64
            target: x86_64-unknown-linux-musl

    steps:
      - name: Checkout code
        uses: actions/checkout@v5.0.0

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: ${{ env.RUST_VERSION }}
          targets: ${{ matrix.target }}

      - name: Install cross-compilation tools
        run: |
          sudo apt-get update
          sudo apt-get install -y musl-tools

      - name: Cache cargo registry
        uses: actions/cache@v4.3.0
        with:
          path: ~/.cargo/registry/index
          key: ${{ runner.os }}-${{ matrix.target }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.target }}-cargo-registry-

      - name: Cache cargo git
        uses: actions/cache@v4.3.0
        with:
          path: ~/.cargo/git/db
          key: ${{ runner.os }}-${{ matrix.target }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.target }}-cargo-git-

      - name: Cache cargo build
        uses: actions/cache@v4.3.0
        with:
          path: target
          key: ${{ runner.os }}-${{ matrix.target }}-cargo-build-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.target }}-cargo-build-

      - name: Build Rust binary
        timeout-minutes: 25
        run: |
          cargo build --release --target ${{ matrix.target }} --locked
        env:
          RUSTFLAGS: '-C target-feature=+crt-static'

      - name: Strip binary
        run: |
          strip target/${{ matrix.target }}/release/${{ env.APP_NAME }}

      - name: Prepare binary for Docker
        run: |
          mkdir -p ./docker-context
          cp target/${{ matrix.target }}/release/${{ env.APP_NAME }} ./docker-context/app

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3.11.1

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5.8.0
        with:
          images: ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v3
        id: auth
        with:
          project_id: ${{ env.PROJECT_ID }}
          workload_identity_provider: 'projects/624428081092/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider'
          service_account: 'github-actions-sa@${{ env.PROJECT_ID }}.iam.gserviceaccount.com'

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v3.0.1

      - name: Configure Docker for Artifact Registry
        run: |
          gcloud auth configure-docker ${{ env.REGION }}-docker.pkg.dev --quiet

      - name: Build and push Docker image
        id: build
        timeout-minutes: 15
        uses: docker/build-push-action@v6.18.0
        with:
          context: ./docker-context
          file: ./Dockerfile
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}:buildcache
          cache-to: type=registry,ref=${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}:buildcache,mode=max
          platforms: linux/amd64

      - name: Install cosign
        if: github.event_name != 'pull_request'
        uses: sigstore/cosign-installer@v4.0.0

      - name: Sign the images with cosign
        if: github.event_name != 'pull_request'
        env:
          COSIGN_EXPERIMENTAL: 'true'
        run: |
          cosign sign --yes ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}@${{ github.ref_name }}

      - name: Run Trivy security scan
        uses: aquasecurity/trivy-action@0.33.1
        continue-on-error: true
        with:
          image-ref: ${{ env.REGION }}-docker.pkg.dev/${{ env.PROJECT_ID }}/${{ env.CURRENT_SERVICE }}/${{ env.CURRENT_SERVICE }}@${{ github.ref_name }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Get GKE credential
        uses: 'google-github-actions/get-gke-credentials@v2'
        with:
          cluster_name: ${{ env.GKE_CLUSTER }}
          location: ${{ env.REGION }}

      - name: Deploy to Kubernetes
        run:
          kubectl rollout restart -n lynox-${{ github.ref_name }} deploy ${{ env.CURRENT_SERVICE }}
```

### Lightweight Dockerfile (Pre-built Binary)

```dockerfile
# syntax=docker/dockerfile:1.4

# ============================================
# Runtime image with Debian (includes shell)
# ============================================
FROM debian:bookworm-slim AS runtime

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pre-built binary from GitHub Actions
COPY app /usr/local/bin/app

# Ensure binary is executable
RUN chmod +x /usr/local/bin/app

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 8080

# Health check (adjust as needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/usr/local/bin/app", "--health-check"] || exit 1

# Run the application
ENTRYPOINT ["/usr/local/bin/app"]
CMD []

# ============================================
# Distroless runtime (most secure, smallest)
# ============================================
FROM gcr.io/distroless/static-debian12:nonroot AS runtime-distroless

WORKDIR /app

# Copy pre-built static binary from GitHub Actions
COPY app /app/app

# Distroless runs as non-root by default
USER nonroot:nonroot

# Expose application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["/app/app"]
CMD []
```

### .dockerignore File

```dockerignore
# Git
.git
.gitignore
.gitattributes

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# Rust
target/
Cargo.lock
**/*.rs.bk
*.pdb

# IDE
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store

# Documentation
*.md
LICENSE
docs/

# Tests
tests/
benches/

# Development
.env
.env.local
*.log
tmp/
temp/
```

## Automatic Dependency Updates

### Dependabot Configuration

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 10
    reviewers:
      - "team-leads"
    labels:
      - "dependencies"
      - "npm"
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
      include: "scope"
    ignore:
      # Ignore major version updates for these packages
      - dependency-name: "react"
        update-types: ["version-update:semver-major"]

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"

  # Enable version updates for Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "docker"

  # Enable version updates for Go modules
  - package-ecosystem: "gomod"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "go"

  # Enable version updates for Cargo
  - package-ecosystem: "cargo"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "rust"
```

### Auto-merge Dependabot PRs

```yaml
name: Auto-merge Dependabot PRs

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: write
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@c9c4182bf1b97f5224aee3906fd373f6b61b4526  # v2.1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Auto-merge patch and minor updates
        if: steps.metadata.outputs.update-type == 'version-update:semver-patch' || steps.metadata.outputs.update-type == 'version-update:semver-minor'
        run: |
          gh pr review --approve "$PR_URL"
          gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Label major updates for manual review
        if: steps.metadata.outputs.update-type == 'version-update:semver-major'
        run: gh pr edit "$PR_URL" --add-label "major-update,needs-review"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Renovate Configuration

Alternative to Dependabot - create `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "schedule": ["before 6am on monday"],
  "timezone": "America/New_York",
  "labels": ["dependencies"],
  "assignees": ["@team-leads"],
  "rangeStrategy": "bump",
  "semanticCommits": "enabled",
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": "!/^0/",
      "automerge": true,
      "automergeType": "pr",
      "automergeStrategy": "squash"
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["^@types/"],
      "automerge": true
    }
  ]
}
```

## Tags

`github-actions`, `templates`, `workflows`, `ci-cd`, `devops`, `examples`

---

*Last updated: 2025-10-30*
