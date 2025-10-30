# Popular Actions

Essential and commonly used GitHub Actions for building robust CI/CD pipelines.

## Essential Actions (Must-Have)

### actions/checkout
**Check out repository code**

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # Fetch all history for all branches and tags
    submodules: recursive  # Checkout submodules
    token: ${{ secrets.GITHUB_TOKEN }}  # Use custom token if needed
```

**Use cases:**
- Required for accessing repository files
- Needed in almost every workflow

**Repository:** [actions/checkout](https://github.com/actions/checkout)

---

### actions/setup-node
**Set up Node.js environment**

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'  # or 'yarn', 'pnpm'
    registry-url: 'https://registry.npmjs.org'
```

**Use cases:**
- JavaScript/TypeScript projects
- Frontend and backend development

**Repository:** [actions/setup-node](https://github.com/actions/setup-node)

**Similar actions:**
- `actions/setup-python@v5` - Python
- `actions/setup-go@v5` - Go
- `actions/setup-java@v4` - Java
- `dtolnay/rust-toolchain@stable` - Rust

---

### actions/cache
**Cache dependencies and build outputs**

```yaml
- uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Use cases:**
- Speed up workflow by caching dependencies
- Reduce build times

**Repository:** [actions/cache](https://github.com/actions/cache)

---

### actions/upload-artifact
**Upload build artifacts**

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 5
    if-no-files-found: error
```

**Use cases:**
- Share files between jobs
- Store build outputs
- Preserve test results

**Repository:** [actions/upload-artifact](https://github.com/actions/upload-artifact)

---

### actions/download-artifact
**Download artifacts from previous jobs**

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

**Use cases:**
- Access artifacts from previous jobs
- Deploy pre-built applications

**Repository:** [actions/download-artifact](https://github.com/actions/download-artifact)

---

## Docker & Containers

### docker/login-action
**Log in to Docker registry**

```yaml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

**Supported registries:**
- Docker Hub
- GitHub Container Registry (ghcr.io)
- AWS ECR
- GCP GCR
- Azure ACR

**Repository:** [docker/login-action](https://github.com/docker/login-action)

---

### docker/build-push-action
**Build and push Docker images**

```yaml
- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: user/app:latest
    cache-from: type=registry,ref=user/app:buildcache
    cache-to: type=registry,ref=user/app:buildcache,mode=max
    platforms: linux/amd64,linux/arm64
```

**Repository:** [docker/build-push-action](https://github.com/docker/build-push-action)

---

### docker/setup-buildx-action
**Set up Docker Buildx**

```yaml
- uses: docker/setup-buildx-action@v3
```

**Use cases:**
- Multi-platform builds
- Advanced build features

**Repository:** [docker/setup-buildx-action](https://github.com/docker/setup-buildx-action)

---

### docker/metadata-action
**Extract metadata for Docker images**

```yaml
- uses: docker/metadata-action@v5
  id: meta
  with:
    images: ghcr.io/${{ github.repository }}
    tags: |
      type=ref,event=branch
      type=ref,event=pr
      type=semver,pattern={{version}}
      type=semver,pattern={{major}}.{{minor}}
      type=sha
```

**Repository:** [docker/metadata-action](https://github.com/docker/metadata-action)

---

## Cloud Providers

### aws-actions/configure-aws-credentials
**Configure AWS credentials**

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

**Repository:** [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)

---

### google-github-actions/auth
**Authenticate to Google Cloud**

```yaml
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
    service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
```

**Repository:** [google-github-actions/auth](https://github.com/google-github-actions/auth)

---

### azure/login
**Azure login**

```yaml
- uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

**Repository:** [azure/login](https://github.com/Azure/login)

---

## Code Quality & Security

### github/codeql-action
**Run CodeQL analysis**

```yaml
- uses: github/codeql-action/init@v2
  with:
    languages: javascript, python

- uses: github/codeql-action/analyze@v2
```

**Use cases:**
- Security scanning
- Vulnerability detection
- Code quality analysis

**Repository:** [github/codeql-action](https://github.com/github/codeql-action)

---

### aquasecurity/trivy-action
**Scan for vulnerabilities**

```yaml
- uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**Scan types:**
- Filesystem
- Container images
- Git repositories
- Kubernetes

**Repository:** [aquasecurity/trivy-action](https://github.com/aquasecurity/trivy-action)

---

### snyk/actions
**Snyk security scanning**

```yaml
- uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Repository:** [snyk/actions](https://github.com/snyk/actions)

---

### golangci/golangci-lint-action
**Go linting**

```yaml
- uses: golangci/golangci-lint-action@v3
  with:
    version: latest
    args: --timeout=5m
```

**Repository:** [golangci/golangci-lint-action](https://github.com/golangci/golangci-lint-action)

---

## Testing

### cypress-io/github-action
**Run Cypress tests**

```yaml
- uses: cypress-io/github-action@v6
  with:
    start: npm start
    wait-on: 'http://localhost:3000'
    browser: chrome
```

**Repository:** [cypress-io/github-action](https://github.com/cypress-io/github-action)

---

### microsoft/playwright-github-action
**Run Playwright tests**

```yaml
- uses: microsoft/playwright-github-action@v1

- name: Run tests
  run: npx playwright test
```

**Repository:** [microsoft/playwright-github-action](https://github.com/microsoft/playwright-github-action)

---

### codecov/codecov-action
**Upload coverage reports**

```yaml
- uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
```

**Repository:** [codecov/codecov-action](https://github.com/codecov/codecov-action)

---

## Deployment & Release

### softprops/action-gh-release
**Create GitHub releases**

```yaml
- uses: softprops/action-gh-release@v1
  if: startsWith(github.ref, 'refs/tags/')
  with:
    files: |
      dist/*.zip
      dist/*.tar.gz
    generate_release_notes: true
    draft: false
```

**Repository:** [softprops/action-gh-release](https://github.com/softprops/action-gh-release)

---

### peaceiris/actions-gh-pages
**Deploy to GitHub Pages**

```yaml
- uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    cname: myapp.example.com
```

**Repository:** [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

---

### JamesIves/github-pages-deploy-action
**Alternative GitHub Pages deployment**

```yaml
- uses: JamesIves/github-pages-deploy-action@v4
  with:
    folder: dist
    branch: gh-pages
```

**Repository:** [JamesIves/github-pages-deploy-action](https://github.com/JamesIves/github-pages-deploy-action)

---

## Utilities

### actions/github-script
**Run JavaScript in workflows**

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      const issue = await github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: 'Automated issue',
        body: 'This issue was created automatically'
      })
      console.log(`Created issue #${issue.data.number}`)
```

**Use cases:**
- GitHub API interactions
- Complex workflow logic
- Custom automations

**Repository:** [actions/github-script](https://github.com/actions/github-script)

---

### dawidd6/action-download-artifact
**Download artifacts from other workflows**

```yaml
- uses: dawidd6/action-download-artifact@v2
  with:
    workflow: build.yml
    name: build-output
```

**Repository:** [dawidd6/action-download-artifact](https://github.com/dawidd6/action-download-artifact)

---

### peter-evans/create-pull-request
**Create pull requests automatically**

```yaml
- uses: peter-evans/create-pull-request@v5
  with:
    commit-message: Update dependencies
    title: 'chore: update dependencies'
    body: Automated dependency updates
    branch: update-deps
```

**Repository:** [peter-evans/create-pull-request](https://github.com/peter-evans/create-pull-request)

---

### actions/stale
**Mark and close stale issues/PRs**

```yaml
- uses: actions/stale@v8
  with:
    stale-issue-message: 'This issue is stale'
    stale-pr-message: 'This PR is stale'
    days-before-stale: 30
    days-before-close: 7
```

**Repository:** [actions/stale](https://github.com/actions/stale)

---

## Notifications

### 8398a7/action-slack
**Send Slack notifications**

```yaml
- uses: 8398a7/action-slack@v3
  if: always()
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
```

**Repository:** [8398a7/action-slack](https://github.com/8398a7/action-slack)

---

### dawidd6/action-send-mail
**Send email notifications**

```yaml
- uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Build failed
    body: The build failed. Check the logs.
    to: team@example.com
```

**Repository:** [dawidd6/action-send-mail](https://github.com/dawidd6/action-send-mail)

---

## Signing & Security

### sigstore/cosign-installer
**Install cosign for container signing**

```yaml
- uses: sigstore/cosign-installer@v3

- name: Sign container image
  run: |
    cosign sign --yes ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}
```

**Repository:** [sigstore/cosign-installer](https://github.com/sigstore/cosign-installer)

---

## Debugging

### mxschmitt/action-tmate
**Debug workflows interactively**

```yaml
- uses: mxschmitt/action-tmate@v3
  if: failure()
  timeout-minutes: 30
```

**Use cases:**
- Interactive debugging
- Troubleshooting failed workflows

**Repository:** [mxschmitt/action-tmate](https://github.com/mxschmitt/action-tmate)

---

## Summary Table

| Category | Action | Purpose |
|----------|--------|---------|
| **Essential** | `actions/checkout` | Clone repository |
| **Essential** | `actions/setup-node` | Setup Node.js |
| **Essential** | `actions/cache` | Cache dependencies |
| **Essential** | `actions/upload-artifact` | Upload artifacts |
| **Docker** | `docker/build-push-action` | Build/push images |
| **Docker** | `docker/login-action` | Registry login |
| **Cloud** | `aws-actions/configure-aws-credentials` | AWS authentication |
| **Cloud** | `google-github-actions/auth` | GCP authentication |
| **Security** | `aquasecurity/trivy-action` | Vulnerability scanning |
| **Security** | `github/codeql-action` | Code analysis |
| **Testing** | `cypress-io/github-action` | E2E testing |
| **Testing** | `codecov/codecov-action` | Coverage reports |
| **Release** | `softprops/action-gh-release` | Create releases |
| **Deploy** | `peaceiris/actions-gh-pages` | GitHub Pages |
| **Utility** | `actions/github-script` | GitHub API access |
| **Utility** | `peter-evans/create-pull-request` | Auto PRs |

## Finding More Actions

- [GitHub Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)
- Search repositories on GitHub

## Tags

`github-actions`, `actions`, `marketplace`, `ci-cd`, `devops`, `tools`

---

*Last updated: 2025-10-30*
