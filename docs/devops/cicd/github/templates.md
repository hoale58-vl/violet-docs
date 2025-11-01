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
      - main
    paths:
      - 'src/**'
      - 'public/**'
      - 'package*.json'
      - '.github/workflows/**'
  pull_request:
    branches:
      - main

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '18'
  PROJECT_ID: 'violet-project'
  CURRENT_SERVICE: ${{ github.event.repository.name }}
  REGION: us-central1
  GCS_BUCKET: gs://violet.xyz/
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

      - name: Deploy to GCS
        if: github.event_name == 'push'
        run: |
          gsutil -m rsync -r -d dist/ ${{ env.GCS_BUCKET }}

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
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v4.31.2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Apply to K8S
        if: github.event_name == 'push' && steps.meta.outputs.tags == 'staging'
        run: |-
          kubectl rollout restart -n roshambo-${{ steps.meta.outputs.tags }} deploy ${{ env.CURRENT_SERVICE }}

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

## Tags

`github-actions`, `templates`, `workflows`, `ci-cd`, `devops`, `examples`

---

*Last updated: 2025-10-30*
