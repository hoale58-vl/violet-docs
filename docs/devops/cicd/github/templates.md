# Workflow Templates

Ready-to-use workflow templates for common CI/CD scenarios.

## Quick Start

Copy any template below to `.github/workflows/` in your repository and customize as needed.

---

## React Static Website to Cloud Storage

### Deploy to AWS S3

```yaml
name: Deploy React App to S3

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  AWS_REGION: 'us-east-1'
  S3_BUCKET: 'my-react-app-bucket'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write  # Required for AWS OIDC

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Build application
        run: npm run build
        env:
          CI: true
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync build/ s3://${{ env.S3_BUCKET }} \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

      - name: Invalidate CloudFront cache
        if: github.ref == 'refs/heads/main'
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Comment PR with preview URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed to: https://${{ env.S3_BUCKET }}.s3.amazonaws.com`
            })
```

### Deploy to GCP Cloud Storage

```yaml
name: Deploy React App to GCS

on:
  push:
    branches: [main]

env:
  NODE_VERSION: '18'
  GCS_BUCKET: 'my-react-app-bucket'
  PROJECT_ID: 'my-gcp-project'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write  # Required for GCP Workload Identity

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Build application
        run: npm run build
        env:
          CI: true
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to GCS
        run: |
          gsutil -m rsync -r -d build/ gs://${{ env.GCS_BUCKET }}

      - name: Set cache headers
        run: |
          gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
            "gs://${{ env.GCS_BUCKET }}/static/**"

      - name: Make bucket public
        run: |
          gsutil iam ch allUsers:objectViewer gs://${{ env.GCS_BUCKET }}
```

---

## Rust Binary Build

```yaml
name: Build Rust Binary

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Cache cargo registry
        uses: actions/cache@v3
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache cargo index
        uses: actions/cache@v3
        with:
          path: ~/.cargo/git
          key: ${{ runner.os }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}

      - name: Cache target directory
        uses: actions/cache@v3
        with:
          path: target
          key: ${{ runner.os }}-target-${{ hashFiles('**/Cargo.lock') }}

      - name: Check formatting
        run: cargo fmt --all -- --check

      - name: Run clippy
        run: cargo clippy --all-targets --all-features -- -D warnings

      - name: Run tests
        run: cargo test --all-features

  build:
    name: Build - ${{ matrix.target }}
    needs: test
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            artifact_name: myapp
            asset_name: myapp-linux-amd64
          - os: ubuntu-latest
            target: x86_64-unknown-linux-musl
            artifact_name: myapp
            asset_name: myapp-linux-musl-amd64
          - os: macos-latest
            target: x86_64-apple-darwin
            artifact_name: myapp
            asset_name: myapp-macos-amd64
          - os: macos-latest
            target: aarch64-apple-darwin
            artifact_name: myapp
            asset_name: myapp-macos-arm64
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            artifact_name: myapp.exe
            asset_name: myapp-windows-amd64.exe

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}

      - name: Install musl tools (Linux musl only)
        if: matrix.target == 'x86_64-unknown-linux-musl'
        run: |
          sudo apt-get update
          sudo apt-get install -y musl-tools

      - name: Build release binary
        run: cargo build --release --target ${{ matrix.target }}

      - name: Strip binary (Unix)
        if: matrix.os != 'windows-latest'
        run: strip target/${{ matrix.target }}/release/${{ matrix.artifact_name }}

      - name: Upload binary
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.asset_name }}
          path: target/${{ matrix.target }}/release/${{ matrix.artifact_name }}

  release:
    name: Create Release
    needs: build
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: artifacts/**/*
          generate_release_notes: true
          draft: false
          prerelease: false
```

---

## Go Binary Build

```yaml
name: Build Go Binary

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'
          cache: true

      - name: Run tests
        run: go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.txt

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Run golangci-lint
        uses: golangci/golangci-lint-action@v3
        with:
          version: latest
          args: --timeout=5m

  build:
    name: Build - ${{ matrix.goos }}-${{ matrix.goarch }}
    needs: [test, lint]
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest

    strategy:
      matrix:
        include:
          - goos: linux
            goarch: amd64
          - goos: linux
            goarch: arm64
          - goos: darwin
            goarch: amd64
          - goos: darwin
            goarch: arm64
          - goos: windows
            goarch: amd64

    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Build binary
        env:
          GOOS: ${{ matrix.goos }}
          GOARCH: ${{ matrix.goarch }}
          CGO_ENABLED: 0
        run: |
          VERSION=${GITHUB_REF#refs/tags/}
          OUTPUT_NAME=myapp-${VERSION}-${{ matrix.goos }}-${{ matrix.goarch }}
          if [ "${{ matrix.goos }}" = "windows" ]; then
            OUTPUT_NAME="${OUTPUT_NAME}.exe"
          fi

          go build -ldflags="-s -w -X main.version=${VERSION}" \
            -o "${OUTPUT_NAME}" \
            ./cmd/myapp

      - name: Upload binary
        uses: actions/upload-artifact@v4
        with:
          name: myapp-${{ matrix.goos }}-${{ matrix.goarch }}
          path: myapp-*

  release:
    name: Create Release
    needs: build
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest

    permissions:
      contents: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: artifacts/**/*
          generate_release_notes: true
```

---

## Docker Build and Push

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write
      id-token: write  # For cosign

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=sha,prefix={{branch}}-

      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:buildcache,mode=max
          platforms: linux/amd64,linux/arm64

      - name: Install cosign
        if: github.event_name != 'pull_request'
        uses: sigstore/cosign-installer@v3

      - name: Sign the images with cosign
        if: github.event_name != 'pull_request'
        env:
          COSIGN_EXPERIMENTAL: "true"
        run: |
          cosign sign --yes ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}

      - name: Run Trivy security scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.version }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## Test and Lint

```yaml
name: Test and Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

      - name: Check TypeScript
        run: npm run type-check

  test:
    name: Test - Node ${{ matrix.node }}
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node: [16, 18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        if: matrix.node == '18'
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  security:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

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
    if: github.actor == 'dependabot[bot]'

    steps:
      - name: Fetch Dependabot metadata
        id: metadata
        uses: dependabot/fetch-metadata@v1
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

---

## Minimal Template

Basic template for getting started:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup environment
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

## Tags

`github-actions`, `templates`, `workflows`, `ci-cd`, `devops`, `examples`

---

*Last updated: 2025-10-30*
