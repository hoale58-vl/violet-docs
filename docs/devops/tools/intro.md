# DevOps Tools

Essential tools and utilities for DevOps engineers and SREs with installation recommendations and benefits.

## Command Line Tools

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **jq** | JSON processor | Parse, filter, transform JSON in shell | ⭐⭐⭐ Essential | `brew install jq` / `apt install jq` | [jqlang.github.io/jq](https://jqlang.github.io/jq/) |
| **yq** | YAML processor | Parse YAML files like jq for JSON | ⭐⭐⭐ Essential | `brew install yq` / `pip install yq` | [mikefarah.gitbook.io/yq](https://mikefarah.gitbook.io/yq/) |
| **kubectl** | Kubernetes CLI | Manage K8s clusters and resources | ⭐⭐⭐ Essential | `brew install kubectl` | [kubernetes.io/docs/tasks/tools](https://kubernetes.io/docs/tasks/tools/) |
| **helm** | K8s package manager | Deploy apps with templated charts | ⭐⭐⭐ Essential | `brew install helm` | [helm.sh](https://helm.sh/) |
| **terraform** | Infrastructure as Code | Provision cloud resources declaratively | ⭐⭐⭐ Essential | `brew install terraform` | [terraform.io](https://www.terraform.io/) |
| **aws-cli** | AWS command line | Manage AWS resources from terminal | ⭐⭐ Important | `brew install awscli` / `pip install awscli` | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |
| **gcloud** | Google Cloud CLI | Manage GCP resources | ⭐⭐ Important | [Install script](https://cloud.google.com/sdk/docs/install) | [cloud.google.com/sdk](https://cloud.google.com/sdk) |
| **az** | Azure CLI | Manage Azure resources | ⭐⭐ Important | `brew install azure-cli` | [learn.microsoft.com/cli/azure](https://learn.microsoft.com/en-us/cli/azure/) |

**Recommended pack:** Install all if working with Kubernetes + Cloud providers

---

## Debugging & Troubleshooting

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **curl** | HTTP client | Test APIs, download files, debug endpoints | ⭐⭐⭐ Essential | Pre-installed (most OS) | [curl.se](https://curl.se/) |
| **httpie** | Modern HTTP client | User-friendly curl alternative with colors | ⭐ Nice-to-have | `brew install httpie` / `pip install httpie` | [httpie.io](https://httpie.io/) |
| **netcat (nc)** | Network Swiss Army knife | Test TCP/UDP connections, port scanning | ⭐⭐ Important | Pre-installed (most OS) | [nc110.sourceforge.io](http://nc110.sourceforge.io/) |
| **telnet** | Terminal network protocol | Test raw TCP connections | ⭐⭐ Important | `brew install telnet` / `apt install telnet` | - |
| **dig** | DNS lookup | Query DNS records, troubleshoot DNS | ⭐⭐⭐ Essential | Pre-installed (most OS) | [linux.die.net/man/1/dig](https://linux.die.net/man/1/dig) |
| **nslookup** | DNS query tool | Alternative DNS lookup tool | ⭐ Nice-to-have | Pre-installed (most OS) | - |
| **tcpdump** | Packet capture | Network traffic analysis, debug issues | ⭐⭐ Important | Pre-installed (most OS) | [tcpdump.org](https://www.tcpdump.org/) |
| **wireshark** | GUI packet analyzer | Deep packet inspection with UI | ⭐ Nice-to-have | `brew install wireshark` | [wireshark.org](https://www.wireshark.org/) |
| **strace** | System call tracer | Debug process behavior, find file access | ⭐⭐ Important | Pre-installed (Linux) | [strace.io](https://strace.io/) |
| **ltrace** | Library call tracer | Trace library calls in programs | ⭐ Nice-to-have | `apt install ltrace` | [ltrace.org](http://www.ltrace.org/) |

**Recommended pack:** curl, dig, netcat, tcpdump (core debugging toolkit)

---

## Performance & Monitoring

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **htop** | Interactive process viewer | Better than top with colors and UI | ⭐⭐⭐ Essential | `brew install htop` / `apt install htop` | [htop.dev](https://htop.dev/) |
| **top** | Process monitor | Basic process monitoring | ⭐⭐⭐ Essential | Pre-installed (most OS) | - |
| **iotop** | I/O monitor | Track disk I/O by process | ⭐⭐ Important | `apt install iotop` | [guichaz.free.fr/iotop](http://guichaz.free.fr/iotop/) |
| **nethogs** | Network bandwidth monitor | Per-process network usage | ⭐⭐ Important | `brew install nethogs` / `apt install nethogs` | [github.com/raboof/nethogs](https://github.com/raboof/nethogs) |
| **prometheus** | Metrics collection | Time-series metrics database | ⭐⭐⭐ Essential | [Docker/K8s deployment](https://prometheus.io/docs/prometheus/latest/installation/) | [prometheus.io](https://prometheus.io/) |
| **grafana** | Metrics visualization | Beautiful dashboards for metrics | ⭐⭐⭐ Essential | [Docker/K8s deployment](https://grafana.com/docs/grafana/latest/setup-grafana/installation/) | [grafana.com](https://grafana.com/) |
| **glances** | System monitoring | All-in-one monitor (CPU, mem, network, disk) | ⭐ Nice-to-have | `brew install glances` / `pip install glances` | [nicolargo.github.io/glances](https://nicolargo.github.io/glances/) |

**Recommended pack:** htop, iotop, nethogs (local monitoring) + Prometheus + Grafana (cluster monitoring)

---

## Container Tools

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **docker** | Container runtime | Run and build containers | ⭐⭐⭐ Essential | [Docker Desktop](https://docs.docker.com/get-docker/) | [docker.com](https://www.docker.com/) |
| **docker-compose** | Multi-container orchestration | Define multi-container apps with YAML | ⭐⭐⭐ Essential | Included with Docker Desktop | [docs.docker.com/compose](https://docs.docker.com/compose/) |
| **dive** | Docker image explorer | Analyze image layers, find bloat | ⭐⭐ Important | `brew install dive` | [github.com/wagoodman/dive](https://github.com/wagoodman/dive) |
| **hadolint** | Dockerfile linter | Best practices validation | ⭐⭐ Important | `brew install hadolint` | [github.com/hadolint/hadolint](https://github.com/hadolint/hadolint) |
| **trivy** | Vulnerability scanner | Scan containers for CVEs | ⭐⭐⭐ Essential | `brew install trivy` | [trivy.dev](https://trivy.dev/) |
| **lazydocker** | Docker terminal UI | Manage containers with TUI | ⭐ Nice-to-have | `brew install lazydocker` | [github.com/jesseduffield/lazydocker](https://github.com/jesseduffield/lazydocker) |
| **ctop** | Container metrics | Top-like interface for containers | ⭐ Nice-to-have | `brew install ctop` | [github.com/bcicen/ctop](https://github.com/bcicen/ctop) |

**Recommended pack:** Docker + docker-compose + dive + hadolint + trivy (complete container workflow)

---

## Infrastructure as Code

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **terraform** | Cloud infrastructure provisioning | Multi-cloud IaC with declarative syntax | ⭐⭐⭐ Essential | `brew install terraform` | [terraform.io](https://www.terraform.io/) |
| **ansible** | Configuration management | Automate server setup and deployment | ⭐⭐⭐ Essential | `brew install ansible` / `pip install ansible` | [ansible.com](https://www.ansible.com/) |
| **packer** | Image builder | Build machine images (AMI, Docker, etc.) | ⭐⭐ Important | `brew install packer` | [packer.io](https://www.packer.io/) |
| **vagrant** | Development environments | Reproducible dev environments | ⭐ Nice-to-have | `brew install vagrant` | [vagrantup.com](https://www.vagrantup.com/) |
| **localstack** | Local AWS cloud | Test AWS services locally | ⭐⭐ Important | `pip install localstack` / Docker | [localstack.cloud](https://www.localstack.cloud/) |
| **terragrunt** | Terraform wrapper | Keep Terraform DRY | ⭐ Nice-to-have | `brew install terragrunt` | [terragrunt.gruntwork.io](https://terragrunt.gruntwork.io/) |

**Recommended pack:** Terraform + Ansible (core IaC tools) + Packer (for custom images)

---

## Productivity & Terminal

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **tmux** | Terminal multiplexer | Multiple terminal sessions, persistent sessions | ⭐⭐⭐ Essential | `brew install tmux` / `apt install tmux` | [github.com/tmux/tmux](https://github.com/tmux/tmux) |
| **screen** | Terminal multiplexer | Alternative to tmux | ⭐ Nice-to-have | Pre-installed (most OS) | [gnu.org/software/screen](https://www.gnu.org/software/screen/) |
| **oh-my-zsh** | Zsh framework | Themes, plugins, better shell experience | ⭐⭐ Important | [Install script](https://ohmyz.sh/#install) | [ohmyz.sh](https://ohmyz.sh/) |
| **starship** | Cross-shell prompt | Fast, customizable prompt | ⭐⭐ Important | `brew install starship` | [starship.rs](https://starship.rs/) |
| **vim** | Text editor | Powerful terminal editor | ⭐⭐⭐ Essential | Pre-installed (most OS) | [vim.org](https://www.vim.org/) |
| **nano** | Simple text editor | Beginner-friendly editor | ⭐⭐ Important | Pre-installed (most OS) | [nano-editor.org](https://www.nano-editor.org/) |
| **fzf** | Fuzzy finder | Command history search, file finding | ⭐⭐ Important | `brew install fzf` | [github.com/junegunn/fzf](https://github.com/junegunn/fzf) |
| **bat** | Better cat | Syntax highlighting for cat | ⭐ Nice-to-have | `brew install bat` | [github.com/sharkdp/bat](https://github.com/sharkdp/bat) |
| **exa** | Better ls | Modern ls replacement with colors | ⭐ Nice-to-have | `brew install exa` | [the.exa.website](https://the.exa.website/) |

**Recommended pack:** tmux + oh-my-zsh/starship + fzf (productivity boost)

---

## Git Tools

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **git** | Version control | Essential for code management | ⭐⭐⭐ Essential | `brew install git` / `apt install git` | [git-scm.com](https://git-scm.com/) |
| **tig** | Git text UI | Browse git history in terminal | ⭐⭐ Important | `brew install tig` | [jonas.github.io/tig](https://jonas.github.io/tig/) |
| **lazygit** | Git terminal UI | Simple, powerful git TUI | ⭐⭐ Important | `brew install lazygit` | [github.com/jesseduffield/lazygit](https://github.com/jesseduffield/lazygit) |
| **git-extras** | Git utilities | Additional git commands | ⭐ Nice-to-have | `brew install git-extras` | [github.com/tj/git-extras](https://github.com/tj/git-extras) |
| **gh** | GitHub CLI | Manage GitHub from terminal | ⭐⭐ Important | `brew install gh` | [cli.github.com](https://cli.github.com/) |
| **glab** | GitLab CLI | Manage GitLab from terminal | ⭐ Nice-to-have | `brew install glab` | [gitlab.com/gitlab-org/cli](https://gitlab.com/gitlab-org/cli) |

**Recommended pack:** git + lazygit + gh (complete git workflow)

---

## Security & Secrets

| Tool | Purpose | Why Use It | Necessary? | Install | Link |
|------|---------|------------|------------|---------|------|
| **vault** | Secrets management | Secure secret storage and access | ⭐⭐⭐ Essential | `brew install vault` | [vaultproject.io](https://www.vaultproject.io/) |
| **sops** | File encryption | Encrypt YAML/JSON files | ⭐⭐ Important | `brew install sops` | [github.com/mozilla/sops](https://github.com/mozilla/sops) |
| **age** | File encryption | Modern encryption tool | ⭐⭐ Important | `brew install age` | [github.com/FiloSottile/age](https://github.com/FiloSottile/age) |
| **gpg** | Encryption & signing | PGP encryption and signing | ⭐⭐ Important | Pre-installed (most OS) | [gnupg.org](https://gnupg.org/) |
| **pass** | Password manager | Unix password manager | ⭐ Nice-to-have | `brew install pass` | [passwordstore.org](https://www.passwordstore.org/) |

**Recommended pack:** vault + sops (secrets management)

---

## Necessity Legend

| Symbol | Level | Description |
|--------|-------|-------------|
| ⭐⭐⭐ | **Essential** | Must-have tool for daily DevOps work |
| ⭐⭐ | **Important** | Highly recommended, use frequently |
| ⭐ | **Nice-to-have** | Optional but improves productivity |

---

## Quick Install Guides

### macOS (Homebrew)

```bash
# Essential DevOps pack
brew install jq yq kubectl helm terraform docker

# Debugging pack
brew install curl httpie dig

# Monitoring pack
brew install htop nethogs

# Productivity pack
brew install tmux fzf starship lazygit
```

### Linux (Ubuntu/Debian)

```bash
# Essential DevOps pack
sudo apt update
sudo apt install -y jq curl git htop tmux

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Terraform
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### Docker (All platforms)

```bash
# Run tools via Docker (no installation needed)
docker run --rm -it amazon/aws-cli --version
docker run --rm -v "$PWD:/work" alpine/terragrunt version
docker run --rm -v "$PWD:/src" hadolint/hadolint < Dockerfile
```

---

## Suggested Tool Packs

### Beginner DevOps Pack

```bash
# Minimum viable toolkit
brew install kubectl helm terraform docker jq yq curl git tmux
```

### Full DevOps Stack

```bash
# Complete professional toolkit
brew install kubectl helm terraform docker jq yq \
  aws-cli gcloud azure-cli \
  ansible packer \
  htop nethogs \
  dive hadolint trivy \
  tmux fzf starship lazygit gh \
  vault sops
```

### Cloud-Native Pack (Kubernetes focused)

```bash
# Kubernetes + Cloud tools
brew install kubectl helm k9s kubectx stern \
  terraform aws-cli gcloud \
  jq yq docker dive trivy
```

---

## Tags

`devops`, `tools`, `cli`, `utilities`, `productivity`, `installation`

---

*Last updated: 2025-11-02*
