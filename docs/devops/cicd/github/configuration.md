# Configuration Reference

Complete reference for all GitHub Actions workflow syntax and configuration options.

## Workflow Structure

```yaml
name: Workflow Name              # Optional
run-name: Custom run name        # Optional, can use expressions

on: [push, pull_request]         # Trigger events

env:                             # Environment variables
  GLOBAL_VAR: value

permissions:                     # Token permissions
  contents: read

concurrency:                     # Concurrency control
  group: ${{ github.workflow }}

defaults:                        # Default settings
  run:
    shell: bash

jobs:                           # Required
  job-name:
    # Job configuration
```

---

## Workflow Triggers (`on`)

### Event Triggers

```yaml
# Single event
on: push

# Multiple events
on: [push, pull_request, workflow_dispatch]

# Event with configuration
on:
  push:
    branches:
      - main
      - 'releases/**'
    tags:
      - 'v*'
    paths:
      - 'src/**'
      - '!src/**/*.test.js'
    paths-ignore:
      - '**.md'
```

### Common Events

#### push
```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'feature/**'       # Wildcard
      - '!feature/test'    # Exclude
    tags:
      - v1.*
      - v2.*
    paths:
      - '**.js'
      - 'src/**'
    paths-ignore:
      - 'docs/**'
```

#### pull_request
```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
      - closed
    branches:
      - main
```

**Available types:**
- `opened`, `edited`, `closed`, `reopened`
- `synchronize` (new commits pushed)
- `assigned`, `unassigned`
- `labeled`, `unlabeled`
- `locked`, `unlocked`
- `review_requested`, `review_request_removed`
- `ready_for_review`, `converted_to_draft`

#### pull_request_target
```yaml
on:
  pull_request_target:
    types: [opened, synchronize]
```

**Use for:**
- Running workflows from forks with write permissions
- Be careful with security implications

#### schedule
```yaml
on:
  schedule:
    - cron: '0 0 * * *'      # Daily at midnight
    - cron: '0 */6 * * *'    # Every 6 hours
    - cron: '0 9 * * 1'      # Every Monday at 9 AM
```

**Cron syntax:** `minute hour day month weekday`

#### workflow_dispatch
```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production
        default: 'dev'
      version:
        description: 'Version to deploy'
        required: false
        type: string
      dry-run:
        description: 'Dry run'
        required: false
        type: boolean
        default: false
```

**Input types:**
- `string`, `boolean`, `choice`, `environment`

#### workflow_call
```yaml
on:
  workflow_call:
    inputs:
      config-path:
        required: true
        type: string
    secrets:
      token:
        required: true
    outputs:
      result:
        description: 'Result of the workflow'
        value: ${{ jobs.build.outputs.result }}
```

#### repository_dispatch
```yaml
on:
  repository_dispatch:
    types: [custom-event]
```

#### Other Events
- `issues`, `issue_comment`
- `release`, `published`
- `deployment`, `deployment_status`
- `workflow_run`
- `check_run`, `check_suite`
- `create`, `delete`
- `fork`, `watch`, `star`
- `gollum` (wiki)
- `page_build`
- `public`

---

## Environment Variables (`env`)

### Workflow Level
```yaml
env:
  NODE_VERSION: '18'
  DEPLOY_ENV: production

jobs:
  build:
    steps:
      - run: echo $NODE_VERSION
```

### Job Level
```yaml
jobs:
  build:
    env:
      BUILD_TYPE: release
    steps:
      - run: echo $BUILD_TYPE
```

### Step Level
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: ./deploy.sh
```

### Default Environment Variables

```yaml
${{ github.actor }}                    # User who triggered
${{ github.event_name }}              # Event that triggered
${{ github.ref }}                      # Branch or tag ref
${{ github.ref_name }}                 # Short ref name
${{ github.repository }}               # owner/repo
${{ github.repository_owner }}         # owner
${{ github.sha }}                      # Commit SHA
${{ github.run_id }}                   # Unique run ID
${{ github.run_number }}               # Run number
${{ github.workflow }}                 # Workflow name
${{ github.job }}                      # Job name
${{ runner.os }}                       # OS (Linux, Windows, macOS)
${{ runner.arch }}                     # Architecture
${{ runner.temp }}                     # Temp directory
```

---

## Permissions

```yaml
# Workflow level
permissions:
  contents: read
  pull-requests: write
  issues: write
  packages: write
  id-token: write
  actions: read
  checks: write
  deployments: write
  statuses: write

# Job level
jobs:
  build:
    permissions:
      contents: read
      packages: write
```

**Permission levels:**
- `read`, `write`, `none`

**Common permissions:**
- `contents` - Repository contents
- `pull-requests` - Pull requests
- `issues` - Issues
- `packages` - GitHub Packages
- `id-token` - OIDC token
- `actions` - GitHub Actions
- `checks` - Checks
- `deployments` - Deployments

---

## Concurrency

```yaml
# Cancel in-progress runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Don't cancel, queue instead
concurrency:
  group: deployment-${{ github.ref }}
  cancel-in-progress: false
```

---

## Defaults

```yaml
defaults:
  run:
    shell: bash
    working-directory: ./src

jobs:
  build:
    defaults:
      run:
        shell: pwsh
        working-directory: ./app
```

**Available shells:**
- `bash`, `sh`
- `pwsh`, `powershell` (Windows)
- `cmd` (Windows)
- `python`

---

## Jobs

### Basic Job Configuration

```yaml
jobs:
  job-id:
    name: Display name
    runs-on: ubuntu-latest
    timeout-minutes: 30
    continue-on-error: false
    if: github.ref == 'refs/heads/main'
    env:
      VAR: value
    outputs:
      result: ${{ steps.step-id.outputs.result }}
    steps:
      - run: echo "Hello"
```

### Runners (`runs-on`)

```yaml
# GitHub-hosted
runs-on: ubuntu-latest        # Ubuntu (latest)
runs-on: ubuntu-22.04         # Ubuntu 22.04
runs-on: ubuntu-20.04         # Ubuntu 20.04
runs-on: windows-latest       # Windows Server
runs-on: macos-latest         # macOS (x86)
runs-on: macos-13             # macOS 13 (x86)
runs-on: macos-14             # macOS 14 (ARM64/M1)

# Larger runners (Team/Enterprise)
runs-on: ubuntu-latest-4-cores
runs-on: ubuntu-latest-8-cores
runs-on: ubuntu-latest-16-cores

# Self-hosted
runs-on: self-hosted
runs-on: [self-hosted, linux, x64]
runs-on: [self-hosted, macOS, ARM64]

# Matrix
runs-on: ${{ matrix.os }}
```

### Job Dependencies

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Setup"

  build:
    needs: setup              # Wait for setup
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build"

  test:
    needs: [setup, build]     # Wait for multiple
    runs-on: ubuntu-latest
    steps:
      - run: echo "Test"

  deploy:
    needs: test
    if: success()             # Only if test succeeded
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy"
```

### Job Outputs

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: get-version
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

      - id: set-matrix
        run: echo "matrix=[\"18\", \"20\"]" >> $GITHUB_OUTPUT

  build:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - run: echo "Version: ${{ needs.setup.outputs.version }}"
```

### Strategy (Matrix)

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [16, 18, 20]
    include:
      - os: ubuntu-latest
        node: 20
        experimental: true
    exclude:
      - os: macos-latest
        node: 16
  fail-fast: true             # Stop all on first failure
  max-parallel: 3             # Max concurrent jobs

steps:
  - name: Use matrix values
    run: echo "OS=${{ matrix.os }}, Node=${{ matrix.node }}"
```

### Container Jobs

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: node:18
      credentials:
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
      env:
        NODE_ENV: test
      volumes:
        - /data:/data
      options: --cpus 2
```

### Service Containers

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
        ports:
          - 6379:6379

    steps:
      - run: |
          echo "Postgres available at localhost:5432"
          echo "Redis available at localhost:6379"
```

---

## Steps

### Run Commands

```yaml
- name: Step name
  id: step-id
  run: |
    echo "Multi-line"
    echo "command"
  shell: bash
  working-directory: ./src
  env:
    VAR: value
  continue-on-error: false
  timeout-minutes: 5
  if: success()
```

### Use Actions

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
  env:
    VAR: value
  id: checkout
  name: Checkout code
  if: always()
  continue-on-error: false
  timeout-minutes: 10
```

### Conditional Steps

```yaml
# Status functions
if: success()                 # Previous steps succeeded
if: failure()                 # Any previous step failed
if: cancelled()              # Workflow was cancelled
if: always()                 # Always run

# Comparisons
if: github.ref == 'refs/heads/main'
if: github.event_name == 'push'
if: startsWith(github.ref, 'refs/tags/')
if: contains(github.event.head_commit.message, '[skip ci]')
if: runner.os == 'Linux'

# Step outcomes
if: steps.step-id.outcome == 'success'
if: steps.step-id.conclusion == 'failure'

# Job status
if: needs.setup.result == 'success'

# Logical operators
if: success() && github.ref == 'refs/heads/main'
if: failure() || cancelled()
if: "!cancelled()"
```

---

## Expressions and Functions

### String Functions

```yaml
contains(github.ref, 'main')
startsWith(github.ref, 'refs/tags/')
endsWith(github.ref, '/main')
format('Hello {0} {1}', 'GitHub', 'Actions')
join(array, ', ')
toJSON(object)
fromJSON('{"key": "value"}')
```

### Status Functions

```yaml
success()      # All previous steps succeeded
failure()      # Any previous step failed
cancelled()    # Workflow cancelled
always()       # Always execute
```

### Object Filters

```yaml
${{ github.event.*.name }}
${{ github.event.commits.*.message }}
```

### Operators

```yaml
# Comparison
==, !=, <, <=, >, >=

# Logical
&&, ||, !

# Example
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

---

## Contexts

### github Context

```yaml
${{ github.actor }}
${{ github.event_name }}
${{ github.ref }}
${{ github.sha }}
${{ github.repository }}
${{ github.workflow }}
${{ github.job }}
${{ github.run_id }}
${{ github.run_number }}
${{ github.event.pull_request.number }}
${{ github.event.issue.number }}
```

### env Context

```yaml
${{ env.MY_VAR }}
```

### job Context

```yaml
${{ job.status }}
${{ job.container.id }}
${{ job.services.postgres.id }}
```

### steps Context

```yaml
${{ steps.step-id.outputs.result }}
${{ steps.step-id.outcome }}         # success, failure, cancelled, skipped
${{ steps.step-id.conclusion }}      # Final status after continue-on-error
```

### runner Context

```yaml
${{ runner.os }}                     # Linux, Windows, macOS
${{ runner.arch }}                   # X86, X64, ARM, ARM64
${{ runner.name }}
${{ runner.temp }}
${{ runner.tool_cache }}
```

### needs Context

```yaml
${{ needs.job-id.result }}           # success, failure, cancelled, skipped
${{ needs.job-id.outputs.key }}
```

### secrets Context

```yaml
${{ secrets.SECRET_NAME }}
```

### inputs Context

```yaml
${{ inputs.parameter-name }}         # For workflow_dispatch and workflow_call
```

---

## Reusable Workflows

### Calling Workflow

```yaml
jobs:
  call-workflow:
    uses: owner/repo/.github/workflows/reusable.yml@main
    with:
      input1: value
    secrets:
      token: ${{ secrets.TOKEN }}
```

### Reusable Workflow Definition

```yaml
on:
  workflow_call:
    inputs:
      input1:
        required: true
        type: string
      input2:
        required: false
        type: number
        default: 10
    secrets:
      token:
        required: true
    outputs:
      output1:
        description: "Output description"
        value: ${{ jobs.job-id.outputs.result }}

jobs:
  job-id:
    runs-on: ubuntu-latest
    steps:
      - run: echo "${{ inputs.input1 }}"
```

---

## Environments

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - run: ./deploy.sh
```

**Environment features:**
- Protection rules
- Required reviewers
- Wait timer
- Deployment branches
- Environment secrets

---

## Composite Actions

```yaml
# .github/actions/my-action/action.yml
name: 'My Action'
description: 'Action description'
inputs:
  param1:
    description: 'Parameter 1'
    required: true
    default: 'default-value'
outputs:
  result:
    description: 'Result'
    value: ${{ steps.step-id.outputs.result }}

runs:
  using: 'composite'
  steps:
    - run: echo "${{ inputs.param1 }}"
      shell: bash
    - id: step-id
      run: echo "result=success" >> $GITHUB_OUTPUT
      shell: bash
```

---

## Workflow Commands

```bash
# Set output
echo "name=value" >> $GITHUB_OUTPUT

# Set environment variable
echo "VAR=value" >> $GITHUB_ENV

# Add to PATH
echo "/path/to/dir" >> $GITHUB_PATH

# Set step summary
echo "## Summary" >> $GITHUB_STEP_SUMMARY
echo "Build succeeded" >> $GITHUB_STEP_SUMMARY

# Grouping log lines
echo "::group::Group title"
echo "Log lines"
echo "::endgroup::"

# Log commands
echo "::debug::Debug message"
echo "::notice::Notice message"
echo "::warning::Warning message"
echo "::error::Error message"

# Stop commands
echo "::stop-commands::token"
# Commands are ignored
echo "::token::"
```

---

## Artifacts and Caching

### Upload Artifacts

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: my-artifact
    path: |
      dist/
      build/
    retention-days: 5
    if-no-files-found: error
    compression-level: 6
```

### Download Artifacts

```yaml
- uses: actions/download-artifact@v4
  with:
    name: my-artifact
    path: ./download
```

### Cache

```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      ~/.cache
    key: ${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-
```

---

## Tags

`github-actions`, `configuration`, `reference`, `syntax`, `workflow`, `ci-cd`

---

*Last updated: 2025-10-30*
