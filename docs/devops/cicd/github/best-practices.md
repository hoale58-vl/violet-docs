# Best Practices

Essential best practices for building robust, secure, and efficient CI/CD pipelines with GitHub Actions.

## Quick Start Checklist

Use this checklist for every new GitHub Actions workflow to ensure you're following best practices:

| # | Best Practice | Reference / Commands |
|:-:|--------------|---------------------|
| ⬜ | **Minimize token permissions** with least privilege principle | Set `permissions:` at workflow/job level - [Minimize Token Permissions](#1-minimize-token-permissions) |
| ⬜ | **Never hardcode secrets** - use GitHub Secrets | Settings → Secrets → Actions - [Use Environment Secrets](#2-use-environment-secrets) |
| ⬜ | **Pin action versions to SHA** for security and immutability | Use SHA: `actions/checkout@b4ffde6...` - [Pin Action Versions to SHA](#3-pin-action-versions-to-sha) |
| ⬜ | **Use environment protection rules** for production deployments | Settings → Environments - [Use Environment Protection Rules](#4-use-environment-protection-rules) |
| ⬜ | **Never log secrets** in workflow output | Avoid `echo ${{ secrets.* }}` - [Never Log Secrets](#5-never-log-secrets) |
| ⬜ | **Validate external inputs** to prevent injection attacks | Use regex validation - [Validate External Inputs](#6-validate-external-inputs) |
| ⬜ | **Use concurrency controls** to prevent duplicate runs | Add `concurrency:` group - [Use Concurrency Controls](#1-use-concurrency-controls) |
| ⬜ | **Cache dependencies** aggressively for faster builds | `actions/cache@v3` - [Cache Dependencies Aggressively](#2-cache-dependencies-aggressively) |
| ⬜ | **Use matrix strategy** wisely to avoid redundant builds | Exclude unnecessary combinations - [Use Matrix Strategy Wisely](#3-use-matrix-strategy-wisely) |
| ⬜ | **Parallelize independent jobs** for faster execution | Split lint/test/build jobs - [Parallelize Independent Jobs](#4-parallelize-independent-jobs) |
| ⬜ | **Set appropriate timeouts** to prevent hanging jobs | `timeout-minutes: 10` - [Set Appropriate Timeouts](#5-set-appropriate-timeouts) |
| ⬜ | **Use reusable workflows** to reduce duplication | Create in `.github/workflows/` - [Use Reusable Workflows](#1-use-reusable-workflows) |
| ⬜ | **Create composite actions** for repeated step sequences | [Use Composite Actions](#2-use-composite-actions) |
| ⬜ | **Use path filters** to skip unnecessary runs | `paths:` and `paths-ignore:` - [Use Path Filters](#1-use-path-filters) |
| ⬜ | **Use conditional job execution** for branch-specific logic | `if: github.ref == 'refs/heads/main'` - [Conditional Job Execution](#2-conditional-job-execution) |
| ⬜ | **Use job outputs** to pass data between jobs | Set outputs with `GITHUB_OUTPUT` - [Use Job Outputs](#3-use-job-outputs) |
| ⬜ | **Handle errors properly** with continue-on-error and cleanup | [Error Handling](#error-handling) |
| ⬜ | **Clean up artifacts** with retention policies | `retention-days: 5` - [Clean Up Artifacts](#3-clean-up-artifacts) |
| ⬜ | **Use paths-ignore** to skip docs-only changes | Ignore `**.md`, `docs/**` - [Use paths-ignore](#1-use-paths-ignore-to-skip-unnecessary-runs) |

> **Note:** Copy this checklist to your project README and manually check off items (⬜ → ✅) as you complete them.

### Verification Commands

Run these commands to verify and test your workflows:

```bash
# Validate workflow syntax (requires act or GitHub CLI)
gh workflow view <workflow-name>

# List all workflows
gh workflow list

# Check workflow run status
gh run list --workflow=<workflow-name>

# View workflow run logs
gh run view <run-id> --log

# Re-run failed jobs
gh run rerun <run-id> --failed

# Manually trigger workflow
gh workflow run <workflow-name>

# Test locally with act (requires Docker)
act -l  # List jobs
act -n  # Dry run
act push  # Simulate push event

# Check secrets (list names only, not values)
gh secret list

# Validate YAML syntax locally
yamllint .github/workflows/*.yml

# Check for common issues with actionlint
actionlint .github/workflows/*.yml
```

### Quick Security Audit

```bash
# Check for hardcoded secrets (basic scan)
grep -r "password\|secret\|token\|api[_-]key" .github/workflows/ --exclude-dir=.git

# Verify actions are pinned to SHA
grep "uses:" .github/workflows/*.yml | grep -v "@[a-f0-9]\{40\}"

# List all permissions granted
grep -A 5 "permissions:" .github/workflows/*.yml
```

## Security Best Practices

### 1. Minimize Token Permissions

Use least privilege principle with `GITHUB_TOKEN`:

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
  # Only grant necessary permissions

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read  # Only read access to repository
    steps:
      - uses: actions/checkout@v4
```

### 2. Use Environment Secrets

Never hardcode secrets in workflows:

```yaml
# Bad - Never do this
env:
  API_KEY: "sk-1234567890abcdef"

# Good - Use secrets
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### 3. Pin Action Versions to SHA

```yaml
# Bad - Can be changed by maintainer
- uses: actions/checkout@v4

# Good - Immutable reference
- uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1

# Better - Use SHA with comment
- uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8  # v4.0.2
```

### 4. Use Environment Protection Rules

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - name: Deploy
        run: ./deploy.sh
```

### 5. Never Log Secrets

```yaml
- name: Use secret safely
  run: |
    # Bad - Logs the secret
    echo "API_KEY=${{ secrets.API_KEY }}"

    # Good - Use without logging
    curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" https://api.example.com
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

### 6. Validate External Inputs

```yaml
- name: Validate input
  run: |
    if [[ ! "${{ github.event.inputs.environment }}" =~ ^(dev|staging|prod)$ ]]; then
      echo "Invalid environment"
      exit 1
    fi
```

## Performance Optimization

### 1. Use Concurrency Controls

Prevent multiple runs for the same branch:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### 2. Cache Dependencies Aggressively

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cargo
      ~/.cache
      node_modules
      target
    key: ${{ runner.os }}-deps-${{ hashFiles('**/package-lock.json', '**/Cargo.lock') }}
    restore-keys: |
      ${{ runner.os }}-deps-
```

### 3. Use Matrix Strategy Wisely

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest]
    node: [16, 18, 20]
    exclude:
      - os: macos-latest
        node: 16  # Skip unnecessary combinations
  fail-fast: false  # Continue other jobs if one fails
```

### 4. Parallelize Independent Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]  # Run only after lint and test pass
    steps:
      - run: npm run build
```

### 5. Set Appropriate Timeouts

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10  # Prevent hanging jobs
    steps:
      - name: Build
        timeout-minutes: 5  # Step-level timeout
        run: npm run build
```

### 6. Use Self-Hosted Runners for Heavy Workloads

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, x64]  # Custom runner
    steps:
      - run: npm run build
```

## Code Organization

### 1. Use Reusable Workflows

**`.github/workflows/reusable-test.yml`:**
```yaml
name: Reusable Test Workflow

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
    secrets:
      npm-token:
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - run: npm test
```

**Usage:**
```yaml
jobs:
  call-test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '18'
    secrets:
      npm-token: ${{ secrets.NPM_TOKEN }}
```

### 2. Use Composite Actions

**`.github/actions/setup-project/action.yml`:**
```yaml
name: 'Setup Project'
description: 'Setup Node.js and install dependencies'
inputs:
  node-version:
    description: 'Node.js version'
    required: false
    default: '18'

runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
    - run: npm ci
      shell: bash
```

**Usage:**
```yaml
- uses: ./.github/actions/setup-project
  with:
    node-version: '20'
```

## Workflow Design

### 1. Use Path Filters

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'
      - '!src/**/*.test.js'  # Exclude test files
```

### 2. Conditional Job Execution

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh

  deploy-staging:
    if: startsWith(github.ref, 'refs/heads/release/')
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy-staging.sh
```

### 3. Use Job Outputs

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get_version.outputs.version }}
      changed: ${{ steps.check_changes.outputs.changed }}
    steps:
      - id: get_version
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

      - id: check_changes
        run: echo "changed=true" >> $GITHUB_OUTPUT

  build:
    needs: setup
    if: needs.setup.outputs.changed == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building version ${{ needs.setup.outputs.version }}"
```

### 4. Use Strategy for Dynamic Matrices

```yaml
jobs:
  generate-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "matrix=[\"18\", \"20\"]" >> $GITHUB_OUTPUT
          else
            echo "matrix=[\"20\"]" >> $GITHUB_OUTPUT
          fi

  test:
    needs: generate-matrix
    strategy:
      matrix:
        node-version: ${{ fromJson(needs.generate-matrix.outputs.matrix) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

## Error Handling

### 1. Use `continue-on-error`

```yaml
- name: Run optional check
  continue-on-error: true
  run: npm run optional-check

- name: Run linting (warning only)
  id: lint
  continue-on-error: true
  run: npm run lint

- name: Report lint results
  if: steps.lint.outcome == 'failure'
  run: echo "::warning::Linting failed but continuing"
```

### 2. Use `always()` for Cleanup

```yaml
- name: Cleanup
  if: always()
  run: |
    docker-compose down
    rm -rf temp/
```

### 3. Set Exit Codes Properly

```yaml
- name: Validate
  run: |
    set -e  # Exit on error
    npm run validate
    npm run test
```

## Cost Optimization

### 1. Use `paths-ignore` to Skip Unnecessary Runs

```yaml
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.github/**'
```

### 2. Use Smaller Runners When Possible

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest  # Smaller runner for simple tasks

  build:
    runs-on: ubuntu-latest-8-cores  # Larger runner only when needed
```

### 3. Clean Up Artifacts

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  with:
    name: build
    path: dist/
    retention-days: 5  # Auto-delete after 5 days
```

## Tags

`github-actions`, `ci-cd`, `best-practices`, `devops`, `automation`, `security`

---

*Last updated: 2025-10-30*
