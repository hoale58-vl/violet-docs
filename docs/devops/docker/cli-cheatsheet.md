# Docker CLI Cheat Sheet

Essential Docker commands for everyday development and operations.

## Container Management

### Running Containers

```bash
# Run container in foreground
docker run nginx

# Run container in background (detached)
docker run -d nginx

# Run with name
docker run -d --name my-nginx nginx

# Run with port mapping
docker run -d -p 8080:80 nginx

# Run with environment variables
docker run -d -e "ENV=production" -e "DEBUG=false" nginx

# Run with volume mount
docker run -d -v /host/path:/container/path nginx

# Run with interactive terminal
docker run -it ubuntu /bin/bash

# Run with auto-remove on exit
docker run --rm ubuntu echo "Hello"
```

### Managing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start a stopped container
docker start container_name

# Stop a running container
docker stop container_name

# Restart a container
docker restart container_name

# Remove a container
docker rm container_name

# Remove all stopped containers
docker container prune

# Force remove a running container
docker rm -f container_name
```

### Container Inspection

```bash
# View logs
docker logs container_name

# Follow logs
docker logs -f container_name

# View last 100 lines
docker logs --tail 100 container_name

# View container details
docker inspect container_name

# View container stats
docker stats container_name

# Execute command in running container
docker exec -it container_name /bin/bash

# Copy files from container
docker cp container_name:/path/to/file /host/path

# Copy files to container
docker cp /host/path container_name:/path/to/file
```

## Image Management

### Building Images

```bash
# Build from Dockerfile
docker build -t myapp:latest .

# Build with different Dockerfile name
docker build -t myapp:latest -f Dockerfile.prod .

# Build with build arguments
docker build --build-arg VERSION=1.0 -t myapp:latest .

# Build without cache
docker build --no-cache -t myapp:latest .

# Build with target stage (multi-stage)
docker build --target production -t myapp:prod .
```

### Managing Images

```bash
# List images
docker images

# Remove an image
docker rmi image_name:tag

# Remove all unused images
docker image prune

# Remove all images
docker image prune -a

# Tag an image
docker tag myapp:latest myapp:v1.0

# Save image to tar file
docker save -o myapp.tar myapp:latest

# Load image from tar file
docker load -i myapp.tar
```

### Registry Operations

```bash
# Login to registry
docker login

# Pull image from registry
docker pull nginx:latest

# Push image to registry
docker push username/myapp:latest

# Search for images
docker search nginx
```

## Docker Compose

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f service_name

# List services
docker-compose ps

# Execute command in service
docker-compose exec service_name /bin/bash

# Rebuild services
docker-compose build

# Rebuild and start
docker-compose up --build
```

## Network Management

```bash
# List networks
docker network ls

# Create network
docker network create my-network

# Connect container to network
docker network connect my-network container_name

# Disconnect container from network
docker network disconnect my-network container_name

# Remove network
docker network rm my-network

# Inspect network
docker network inspect my-network
```

## Volume Management

```bash
# List volumes
docker volume ls

# Create volume
docker volume create my-volume

# Remove volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune

# Inspect volume
docker volume inspect my-volume
```

## System Management

```bash
# Show Docker disk usage
docker system df

# Remove all unused resources
docker system prune

# Remove all unused resources including volumes
docker system prune -a --volumes

# Show Docker info
docker info

# Show Docker version
docker version
```

## Debugging

```bash
# View container processes
docker top container_name

# View real-time events
docker events

# View container resource usage
docker stats

# Export container filesystem
docker export container_name > container.tar

# View container changes
docker diff container_name

# View port mappings
docker port container_name
```

## Quick Tips

- Use `docker ps -q` to get only container IDs
- Combine commands: `docker rm $(docker ps -a -q)` to remove all containers
- Use `--help` with any command for more options: `docker run --help`
- Set aliases for common commands in your `.bashrc` or `.zshrc`

## Common Aliases

```bash
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias dex='docker exec -it'
alias dlog='docker logs -f'
alias dstop='docker stop $(docker ps -q)'
alias drm='docker rm $(docker ps -a -q)'
alias drmi='docker rmi $(docker images -q)'
```

## Tags

`docker`, `cli`, `cheatsheet`, `containers`, `devops`

---

*Last updated: 2025-10-30*
