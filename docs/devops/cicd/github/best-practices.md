# Best Practices

Essential best practices for building robust, secure, and efficient CI/CD pipelines with GitHub Actions.

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

### 3. Keep Workflows DRY with YAML Anchors

Use reusable workflows instead of YAML anchors (not supported in GitHub Actions).

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

## Debugging

### 1. Enable Debug Logging

```yaml
- name: Debug information
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    echo "SHA: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
```

### 2. Use `ACTIONS_STEP_DEBUG`

Set repository secret `ACTIONS_STEP_DEBUG=true` for detailed logs.

### 3. Use `tmate` for Interactive Debugging

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 30
```

## Documentation

### 1. Add Workflow Descriptions

```yaml
name: CI Pipeline
on: [push, pull_request]

# Add description at the top
# This workflow runs tests, linting, and builds the application
# It runs on all pushes and pull requests
```

### 2. Comment Complex Logic

```yaml
- name: Calculate version
  run: |
    # Extract version from package.json
    VERSION=$(jq -r .version package.json)

    # Append commit SHA for non-release branches
    if [[ "${{ github.ref }}" != refs/heads/main ]]; then
      VERSION="${VERSION}-${GITHUB_SHA::7}"
    fi

    echo "VERSION=${VERSION}" >> $GITHUB_ENV
```

### 3. Use Meaningful Job and Step Names

```yaml
# Bad
- name: Run script
  run: ./script.sh

# Good
- name: Deploy application to production
  run: ./deploy-production.sh
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

## Monitoring and Notifications

### 1. Send Status Notifications

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Create GitHub Releases

```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: softprops/action-gh-release@v1
  with:
    files: dist/*
    generate_release_notes: true
```

### 3. Update Pull Request with Results

```yaml
- name: Comment PR
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '✅ Build successful!'
      })
```

## Summary Checklist

- [ ] Pin action versions to commit SHA
- [ ] Use minimal token permissions
- [ ] Store sensitive data in secrets
- [ ] Enable concurrency controls
- [ ] Cache dependencies appropriately
- [ ] Set timeout limits
- [ ] Use path filters to skip unnecessary runs
- [ ] Implement error handling
- [ ] Add meaningful names and descriptions
- [ ] Use reusable workflows for common patterns
- [ ] Test workflows in feature branches first
- [ ] Monitor workflow costs and optimize
- [ ] Set up notifications for failures
- [ ] Use environment protection for production
- [ ] Document complex workflows

## Tags

`github-actions`, `ci-cd`, `best-practices`, `devops`, `automation`, `security`

---

*Last updated: 2025-10-30*
