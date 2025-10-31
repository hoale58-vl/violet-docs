# Templates

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
    paths:
      - 'src/**'
      - 'public/**'
      - 'package*.json'
      - '.github/workflows/**'
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '18'
  AWS_REGION: 'us-east-1'
  S3_BUCKET: 'my-react-app-bucket'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read
      pull-requests: write  # For PR comments
      id-token: write  # Required for AWS OIDC

    steps:
      - name: Checkout code
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        timeout-minutes: 5
        run: npm test -- --coverage --watchAll=false

      - name: Build application
        timeout-minutes: 5
        run: npm run build
        env:
          CI: true
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502  # v4.0.2
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          aws s3 sync build/ s3://${{ env.S3_BUCKET }} \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

      - name: Invalidate CloudFront cache
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

      - name: Comment PR with preview URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@60a0d83039c74a4aee543508d2ffcb1c3799cdea  # v7.0.1
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 Preview deployed to: https://${{ env.S3_BUCKET }}.s3.amazonaws.com`
            })

      - name: Cleanup on failure
        if: failure()
        run: |
          echo "Build failed, cleaning up..."
          rm -rf build/ node_modules/.cache
```

### Deploy to GCP Cloud Storage

```yaml
name: Deploy React App to GCS

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package*.json'
      - '.github/workflows/**'
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '18'
  GCS_BUCKET: 'my-react-app-bucket'
  PROJECT_ID: 'my-gcp-project'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read
      id-token: write  # Required for GCP Workload Identity

    steps:
      - name: Checkout code
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        timeout-minutes: 5
        run: npm test -- --coverage --watchAll=false

      - name: Build application
        timeout-minutes: 5
        run: npm run build
        env:
          CI: true
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@55bd3a7c6e2ae7cf1877fd1ccb9d54c0503c457c  # v2.1.3
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@98ddc00a17442e89a24bbf282954a3b65ce6d200  # v2.1.0

      - name: Deploy to GCS
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          gsutil -m rsync -r -d build/ gs://${{ env.GCS_BUCKET }}

      - name: Set cache headers
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" \
            "gs://${{ env.GCS_BUCKET }}/static/**"

      - name: Make bucket public
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          gsutil iam ch allUsers:objectViewer gs://${{ env.GCS_BUCKET }}

      - name: Cleanup on failure
        if: failure()
        run: |
          echo "Build failed, cleaning up..."
          rm -rf build/ node_modules/.cache
```

---

## Rust Binary Build

```yaml
name: Build Rust Binary

on:
  push:
    branches: [main]
    tags: ['v*']
    paths:
      - 'src/**'
      - 'Cargo.*'
      - '.github/workflows/**'
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 20

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-cargo-

      - name: Check formatting
        run: cargo fmt --all -- --check

      - name: Run clippy
        timeout-minutes: 10
        run: cargo clippy --all-targets --all-features -- -D warnings

      - name: Run tests
        timeout-minutes: 15
        run: cargo test --all-features

  build:
    name: Build - ${{ matrix.target }}
    needs: test
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ${{ matrix.os }}
    timeout-minutes: 30

    permissions:
      contents: read

    strategy:
      fail-fast: false
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
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.target }}

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-${{ matrix.target }}-cargo-${{ hashFiles('**/Cargo.lock') }}
          restore-keys: |
            ${{ runner.os }}-${{ matrix.target }}-cargo-

      - name: Install musl tools (Linux musl only)
        if: matrix.target == 'x86_64-unknown-linux-musl'
        run: |
          sudo apt-get update
          sudo apt-get install -y musl-tools

      - name: Build release binary
        timeout-minutes: 20
        run: cargo build --release --target ${{ matrix.target }}

      - name: Strip binary (Unix)
        if: matrix.os != 'windows-latest'
        run: strip target/${{ matrix.target }}/release/${{ matrix.artifact_name }}

      - name: Upload binary
        uses: actions/upload-artifact@65462800fd760344b1a7b4382951275a0abb4808  # v4.3.3
        with:
          name: ${{ matrix.asset_name }}
          path: target/${{ matrix.target }}/release/${{ matrix.artifact_name }}
          retention-days: 7

  release:
    name: Create Release
    needs: build
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      contents: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@65a9edc5881444af0b9093a5e628f2fe47ea3b2e  # v4.1.7
        with:
          path: artifacts

      - name: Create GitHub Release
        uses: softprops/action-gh-release@69320dbe05506a9a39fc8ae11030b214ec2d1f87  # v2.0.5
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
    paths:
      - '**.go'
      - 'go.*'
      - '.github/workflows/**'
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491  # v5.0.0
        with:
          go-version: '1.21'
          cache: true

      - name: Run tests
        timeout-minutes: 10
        run: go test -v -race -coverprofile=coverage.txt -covermode=atomic ./...

      - name: Upload coverage
        uses: codecov/codecov-action@54bcd8715eee62d40e33596ef5e8f0f48dbbccab  # v4.1.0
        continue-on-error: true
        with:
          files: ./coverage.txt

  lint:
    name: Lint
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491  # v5.0.0
        with:
          go-version: '1.21'
          cache: true

      - name: Run golangci-lint
        uses: golangci/golangci-lint-action@3cfe3a4abbb849e10058ce4af15d205b6da42804  # v4.0.0
        with:
          version: latest
          args: --timeout=5m

  build:
    name: Build - ${{ matrix.goos }}-${{ matrix.goarch }}
    needs: [test, lint]
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read

    strategy:
      fail-fast: false
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
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Go
        uses: actions/setup-go@0c52d547c9bc32b1aa3301fd7a9cb496313a4491  # v5.0.0
        with:
          go-version: '1.21'
          cache: true

      - name: Build binary
        timeout-minutes: 10
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
        uses: actions/upload-artifact@65462800fd760344b1a7b4382951275a0abb4808  # v4.3.3
        with:
          name: myapp-${{ matrix.goos }}-${{ matrix.goarch }}
          path: myapp-*
          retention-days: 7

  release:
    name: Create Release
    needs: build
    if: startsWith(github.ref, 'refs/tags/')
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      contents: write

    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@65a9edc5881444af0b9093a5e628f2fe47ea3b2e  # v4.1.7
        with:
          path: artifacts

      - name: Create Release
        uses: softprops/action-gh-release@69320dbe05506a9a39fc8ae11030b214ec2d1f87  # v2.0.5
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
    paths:
      - 'Dockerfile'
      - 'src/**'
      - '.dockerignore'
      - '.github/workflows/**'
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    permissions:
      contents: read
      packages: write
      id-token: write  # For cosign
      security-events: write  # For uploading SARIF results

    steps:
      - name: Checkout code
        uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@2b51285047da1547ffb1b2203d8be4c0af6b1f20  # v3.2.0

      - name: Log in to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@e92390c5fb421da1463c202d546fed0ec5c39f20  # v3.1.0
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@8e5442c4ef9f78752691e2d8f8d19755c6f78e81  # v5.5.1
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
        timeout-minutes: 20
        uses: docker/build-push-action@2cdde995de11925a030ce8070c3d77a52ffcf1c0  # v5.3.0
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
        uses: sigstore/cosign-installer@59acb6260d9c0ba8f4a2f9d9b48431a222b68e20  # v3.5.0

      - name: Sign the images with cosign
        if: github.event_name != 'pull_request'
        env:
          COSIGN_EXPERIMENTAL: "true"
        run: |
          cosign sign --yes ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}

      - name: Run Trivy security scan
        uses: aquasecurity/trivy-action@7c2007bcb556501da015201bcba5aa14069b74e2  # 0.23.0
        continue-on-error: true
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@afb54ba388a7dca6ecae48f608c4ff05ff4cc77a  # v3.25.8
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
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package*.json'
      - 'tsconfig.json'
      - '.eslintrc*'
      - '.github/workflows/**'
  pull_request:
    branches: [main, develop]

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
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
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
    name: Test - Node ${{ matrix.node }}
    runs-on: ubuntu-latest
    timeout-minutes: 20

    permissions:
      contents: read

    strategy:
      fail-fast: false
      matrix:
        node: [18, 20]

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ matrix.node }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ matrix.node }}-

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        timeout-minutes: 15
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        if: matrix.node == '18'
        uses: codecov/codecov-action@54bcd8715eee62d40e33596ef5e8f0f48dbbccab  # v4.1.0
        continue-on-error: true
        with:
          files: ./coverage/coverage-final.json

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    timeout-minutes: 30

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Cache dependencies
        uses: actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9  # v4.0.2
        with:
          path: |
            node_modules
            ~/.cache/ms-playwright
          key: ${{ runner.os }}-e2e-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-e2e-

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        timeout-minutes: 20
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@65462800fd760344b1a7b4382951275a0abb4808  # v4.3.3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  security:
    name: Security Scan
    runs-on: ubuntu-latest
    timeout-minutes: 10

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup Node.js
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '18'

      - name: Run npm audit
        continue-on-error: true
        run: npm audit --audit-level=high

      - name: Run Snyk security scan
        uses: snyk/actions/node@cdb760004ba9ea4d525f2e043745dfe85bb9077e  # master as of 2024-01
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

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    permissions:
      contents: read

    steps:
      - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

      - name: Setup environment
        uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        timeout-minutes: 10
        run: npm test

      - name: Build
        timeout-minutes: 5
        run: npm run build
```

## Tags

`github-actions`, `templates`, `workflows`, `ci-cd`, `devops`, `examples`

---

*Last updated: 2025-10-30*
