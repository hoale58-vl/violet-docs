# Cheat Sheet

Quick reference for essential Docker commands.

## Common Workflows

### Build and Run

```bash
docker build -t myapp:latest .
docker run -d -p 8080:80 --name myapp myapp:latest
docker logs -f myapp
```

### Push to Registry

```bash
docker tag myapp:latest username/myapp:latest
docker login
docker push username/myapp:latest
```

### Clean Up Everything

```bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker volume prune -f
docker network prune -f
```

### Debug Container

```bash
docker run -it --entrypoint /bin/sh myapp:latest
docker exec -it container_name /bin/bash
docker logs --tail 100 -f container_name
```

## Container Management

| Command | Description |
|---------|-------------|
| `docker run <image>` | Run container from image |
| `docker run -d <image>` | Run in background (detached) |
| `docker run -d --name <name> <image>` | Run with custom name |
| `docker run -d -p 8080:80 <image>` | Run with port mapping (host:container) |
| `docker run -it <image> /bin/bash` | Run interactive with terminal |
| `docker run -v /host:/container <image>` | Run with volume mount |
| `docker run -e "KEY=value" <image>` | Run with environment variable |
| `docker run --rm <image>` | Auto-remove container on exit |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers (including stopped) |
| `docker start <container>` | Start stopped container |
| `docker stop <container>` | Stop running container |
| `docker restart <container>` | Restart container |
| `docker rm <container>` | Remove container |
| `docker rm -f <container>` | Force remove running container |
| `docker container prune` | Remove all stopped containers |

## Container Inspection

| Command | Description |
|---------|-------------|
| `docker logs <container>` | View container logs |
| `docker logs -f <container>` | Follow logs (tail -f) |
| `docker logs --tail 100 <container>` | Show last N lines |
| `docker exec -it <container> /bin/bash` | Execute command in running container |
| `docker inspect <container>` | View container details (JSON) |
| `docker stats <container>` | View resource usage stats |
| `docker top <container>` | View running processes |
| `docker cp <container>:/path /host/path` | Copy files from container |
| `docker cp /host/path <container>:/path` | Copy files to container |
| `docker port <container>` | View port mappings |
| `docker diff <container>` | View filesystem changes |

## Image Management

| Command | Description |
|---------|-------------|
| `docker images` | List all images |
| `docker build -t <name>:<tag> .` | Build image from Dockerfile |
| `docker build -f Dockerfile.prod -t <name> .` | Build with specific Dockerfile |
| `docker build --no-cache -t <name> .` | Build without cache |
| `docker build --build-arg KEY=value -t <name> .` | Build with arguments |
| `docker tag <image> <name>:<tag>` | Tag an image |
| `docker rmi <image>` | Remove image |
| `docker image prune` | Remove unused images |
| `docker image prune -a` | Remove all unused images |
| `docker save -o <file>.tar <image>` | Save image to tar file |
| `docker load -i <file>.tar` | Load image from tar file |
| `docker history <image>` | Show image layer history |

## Registry Operations

| Command | Description |
|---------|-------------|
| `docker login` | Login to Docker Hub |
| `docker login <registry>` | Login to private registry |
| `docker pull <image>:<tag>` | Pull image from registry |
| `docker push <image>:<tag>` | Push image to registry |
| `docker search <term>` | Search for images |
| `docker logout` | Logout from registry |

## Docker Compose

| Command | Description |
|---------|-------------|
| `docker-compose up` | Start services |
| `docker-compose up -d` | Start in background |
| `docker-compose up --build` | Rebuild and start |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop and remove volumes |
| `docker-compose ps` | List services |
| `docker-compose logs` | View logs |
| `docker-compose logs -f` | Follow logs |
| `docker-compose logs -f <service>` | Follow logs for specific service |
| `docker-compose exec <service> <cmd>` | Execute command in service |
| `docker-compose build` | Build/rebuild services |
| `docker-compose restart <service>` | Restart service |
| `docker-compose stop` | Stop services |
| `docker-compose start` | Start services |

## System Management

| Command | Description |
|---------|-------------|
| `docker info` | Show system information |
| `docker version` | Show Docker version |
| `docker system df` | Show disk usage |
| `docker system prune` | Remove unused data (containers, networks, images) |
| `docker system prune -a` | Remove all unused data |
| `docker system prune -a --volumes` | Remove all unused data including volumes |
| `docker events` | Show real-time events |


## Tags

`docker`, `cli`, `cheatsheet`, `containers`, `devops`

---

*Last updated: 2025-10-31*
