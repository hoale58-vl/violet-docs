# Microservices

Guide to designing, building, and deploying microservices with best practices, frameworks, and tools.

## Best Practices Checklist

| # | Best Practice | Reference / Details |
|:-:|--------------|---------------------|
| ⬜ | **Use API Gateway for client access** | [API Gateway](#api-gateway) - Centralized entry point |
| ⬜ | **Implement service discovery** | [Service Discovery](#service-discovery) - Consul, Eureka, or K8s DNS |
| ⬜ | **Use asynchronous messaging** | [Communication Patterns](#communication-patterns) - Event-driven with message brokers |
| ⬜ | **Implement circuit breakers** | Prevent cascading failures |
| ⬜ | **Implement health checks** | `/health` and `/ready` endpoints |
| ⬜ | **Use database per service** | Avoid shared databases |
| ⬜ | **Implement rate limiting** | Protect services from overload |
| ⬜ | **Handle failures gracefully** | Retry, timeout, fallback pattern |

---

## Architecture Overview

### High-Level Architecture

```mermaid
flowchart TB
    Client[Clients<br/>Web • Mobile • Desktop]
    Gateway[API Gateway<br/>Entry Point]
    Services[Microservices<br/>Auth • User • Order • Payment]
    Data[Data Layer<br/>Databases • Cache]
    Events[Message Broker<br/>RabbitMQ/Kafka]
    Obs[Observability<br/>Logs • Metrics • Traces]

    Client --> Gateway
    Gateway --> Services
    Services --> Data
    Services --> Events
    Services -.-> Obs

    style Gateway fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Services fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style Data fill:#fff4e1,stroke:#f57c00,stroke-width:2px
    style Events fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Obs fill:#fce4ec,stroke:#c2185b,stroke-width:2px
```

### Detailed Service Flow

```mermaid
flowchart LR
    subgraph External
        Client[Client Apps]
    end

    subgraph Gateway["API Gateway"]
        GW[Kong/Traefik<br/>Routing • Auth]
    end

    subgraph Services["Microservices Layer"]
        Auth[Auth Service]
        User[User Service]
        Order[Order Service]
        Payment[Payment Service]
    end

    subgraph Storage["Data Storage"]
        DB1[(PostgreSQL)]
        DB2[(MongoDB)]
        Cache[(Redis)]
    end

    Client --> GW
    GW --> Auth
    GW --> User
    GW --> Order
    GW --> Payment

    Auth --> DB1
    User --> DB2
    Order --> DB1
    Payment --> DB1
    User --> Cache

    style Gateway fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Services fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Storage fill:#fff4e1,stroke:#f57c00,stroke-width:2px
```

### Communication Flow

```mermaid
flowchart TB
    subgraph Sync["Synchronous (REST/gRPC)"]
        S1[Service A] -->|HTTP Request| S2[Service B]
        S2 -->|HTTP Response| S1
    end

    subgraph Async["Asynchronous (Events)"]
        S3[Order Service] -->|Publish Event| MB[Message Broker]
        MB -->|Subscribe| S4[Email Service]
        MB -->|Subscribe| S5[Inventory Service]
    end

    style Sync fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    style Async fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
```

---

## Communication Patterns

| Pattern | Type | Protocol | Use Cases | Pros | Cons | Best For |
|---------|------|----------|-----------|------|------|----------|
| **REST** | Synchronous | HTTP/JSON | • Direct request/response<br/>• Simple CRUD operations<br/>• Real-time operations | ✅ Simple, widely adopted<br/>✅ Easy to debug<br/>✅ Human-readable<br/>✅ Cacheable | ❌ Tight coupling<br/>❌ Latency sensitive<br/>❌ Over/under-fetching data | Simple services, public APIs, traditional web apps |
| **gRPC** | Synchronous | HTTP/2 + Protobuf | • High-performance RPC<br/>• Streaming data<br/>• Service-to-service calls | ✅ Very fast (binary)<br/>✅ Built-in code generation<br/>✅ Bi-directional streaming<br/>✅ Type-safe | ❌ Harder to debug<br/>❌ Binary format<br/>❌ Limited browser support | Internal microservices, low-latency services, polyglot systems |
| **GraphQL** | Synchronous | HTTP/JSON | • Complex data queries<br/>• Mobile/web clients<br/>• Aggregated data from multiple services | ✅ Flexible queries<br/>✅ No over-fetching<br/>✅ Single endpoint<br/>✅ Strongly typed | ❌ Complex server setup<br/>❌ Caching challenges<br/>❌ N+1 query problem | BFF (Backend for Frontend), mobile apps, complex UIs |
| **Message Queue** | Asynchronous | AMQP/Custom | • Task distribution<br/>• Work queues<br/>• Decoupled services | ✅ Reliable delivery<br/>✅ Load leveling<br/>✅ Retry mechanisms<br/>✅ Decoupled | ❌ Eventual consistency<br/>❌ Complex debugging<br/>❌ Message ordering issues | Background jobs, email sending, image processing |
| **Event Streaming** | Asynchronous | Kafka Protocol | • Event sourcing<br/>• Real-time analytics<br/>• Event-driven architecture | ✅ High throughput<br/>✅ Event replay<br/>✅ Multiple consumers<br/>✅ Scalable | ❌ Complex setup<br/>❌ Eventual consistency<br/>❌ Storage overhead | Activity tracking, log aggregation, real-time analytics |
| **WebSocket** | Synchronous | WebSocket | • Real-time bidirectional<br/>• Live updates<br/>• Chat, gaming | ✅ Real-time, low latency<br/>✅ Persistent connection<br/>✅ Bidirectional | ❌ Connection management<br/>❌ Scaling challenges<br/>❌ Firewall issues | Chat apps, live dashboards, gaming, real-time collaboration |

### Pattern Selection Guide

| Requirement | Recommended Pattern |
|-------------|---------------------|
| **Need immediate response** | REST or gRPC |
| **High performance between services** | gRPC |
| **Background processing** | Message Queue |
| **Event sourcing / audit trail** | Event Streaming (Kafka) |
| **Real-time updates to clients** | WebSocket or Server-Sent Events |
| **Complex data aggregation** | GraphQL |
| **Simple public API** | REST |
| **Decoupled microservices** | Message Queue or Event Streaming |

---

## Best Frameworks by Language

### Node.js

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **Express.js** | Simple APIs, flexibility | ⭐ Easy | General-purpose, REST APIs |
| **NestJS** | Enterprise apps, TypeScript | ⭐⭐ Medium | Complex business logic, scalable apps |
| **Fastify** | High performance | ⭐⭐ Medium | Performance-critical services |
| **Koa** | Minimalist APIs | ⭐ Easy | Lightweight services |

**Recommendation:** NestJS for enterprise, Express.js for simple services

### Python

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **FastAPI** | Modern APIs, auto docs | ⭐⭐ Medium | Data APIs, ML services, async operations |
| **Django REST** | Full-featured REST APIs | ⭐⭐⭐ Hard | Complex CRUD, admin panels |
| **Flask** | Lightweight APIs | ⭐ Easy | Simple services, prototypes |
| **Sanic** | Async high performance | ⭐⭐ Medium | High-throughput services |

**Recommendation:** FastAPI for modern microservices, Django REST for traditional apps

### Java

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **Spring Boot** | Enterprise microservices | ⭐⭐⭐ Hard | Large-scale production systems |
| **Micronaut** | Low memory, fast startup | ⭐⭐ Medium | Cloud-native, serverless |
| **Quarkus** | Kubernetes-native | ⭐⭐ Medium | Container-optimized services |
| **Helidon** | Lightweight cloud services | ⭐⭐ Medium | Modern cloud apps |

**Recommendation:** Spring Boot for enterprise, Quarkus for cloud-native

### Go

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **Gin** | Fast HTTP APIs | ⭐ Easy | High-performance REST APIs |
| **Echo** | Minimalist framework | ⭐ Easy | Simple services |
| **Fiber** | Express-like experience | ⭐ Easy | Fast APIs with familiar syntax |
| **Go-kit** | Distributed systems | ⭐⭐⭐ Hard | Complex microservices architecture |

**Recommendation:** Gin for most cases, Go-kit for complex systems

### C# / .NET

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **ASP.NET Core** | Enterprise microservices | ⭐⭐ Medium | Full-featured production services |
| **Minimal APIs** | Simple endpoints | ⭐ Easy | Lightweight services |
| **Dapr** | Distributed apps | ⭐⭐⭐ Hard | Cloud-native, polyglot systems |

**Recommendation:** ASP.NET Core for .NET ecosystem

### Rust

| Framework | Best For | Difficulty | Use Case |
|-----------|----------|------------|----------|
| **Actix-web** | High performance, async | ⭐⭐ Medium | Ultra-fast APIs, high-throughput services |
| **Rocket** | Developer-friendly | ⭐⭐ Medium | Type-safe web services |
| **Axum** | Modern, ergonomic | ⭐⭐ Medium | Async services with Tokio ecosystem |
| **Warp** | Composable filters | ⭐⭐⭐ Hard | Complex routing, filter-based APIs |

**Recommendation:** Actix-web for performance, Axum for modern async

---

## Essential Tools

### API Gateway

| Tool | Best For | Deployment |
|------|----------|------------|
| **Kong** | Enterprise, plugins | Self-hosted, Cloud |
| **NGINX** | High performance, simple | Self-hosted |
| **Traefik** | Kubernetes-native | K8s, Docker |
| **AWS API Gateway** | AWS ecosystem | AWS Cloud |
| **Azure API Management** | Azure ecosystem | Azure Cloud |

**Recommendation:** Traefik for Kubernetes, Kong for self-hosted

### Service Discovery

| Tool | Best For | Integration |
|------|----------|-------------|
| **Consul** | Multi-cloud, K8s | HashiCorp stack |
| **Eureka** | Spring ecosystem | Java/Spring Boot |
| **Kubernetes DNS** | K8s only | Built-in K8s |
| **etcd** | Kubernetes, distributed config | Cloud-native |

**Recommendation:** Kubernetes DNS if using K8s, Consul otherwise

### Message Brokers

| Tool | Best For | Use Case |
|------|----------|----------|
| **RabbitMQ** | Traditional messaging | Work queues, task distribution |
| **Apache Kafka** | High-throughput streaming | Event sourcing, logs, analytics |
| **NATS** | Lightweight, fast | Real-time messaging |
| **AWS SQS/SNS** | AWS ecosystem | Managed queuing |
| **Redis Streams** | Simple pub/sub | Caching + messaging |

**Recommendation:** Kafka for event streaming, RabbitMQ for task queues

### Observability

**Logging:**

| Tool | Type | Best For |
|------|------|----------|
| **ELK Stack** | Elasticsearch + Logstash + Kibana | Full-text search, analytics |
| **Loki** | Grafana Labs | Kubernetes logs |
| **Fluentd** | Log aggregator | Multi-source collection |

**Metrics:**

| Tool | Best For |
|------|----------|
| **Prometheus** | Time-series metrics |
| **Grafana** | Visualization dashboards |
| **Datadog** | All-in-one SaaS |

**Tracing:**

| Tool | Best For |
|------|----------|
| **Jaeger** | Distributed tracing |
| **Zipkin** | Lightweight tracing |
| **OpenTelemetry** | Vendor-neutral standard |

**Recommendation:** Prometheus + Grafana + Jaeger (open-source stack)

---

## API Gateway

Centralized entry point for all services:

**Responsibilities:**

| Function | Description |
|----------|-------------|
| **Routing** | Forward requests to appropriate services |
| **Authentication** | Verify JWT tokens |
| **Rate limiting** | Prevent abuse |
| **Load balancing** | Distribute traffic |
| **Caching** | Cache frequent responses |
| **Logging** | Centralized request logs |
| **SSL termination** | Handle HTTPS |

## Tags

`microservices`, `architecture`, `distributed-systems`, `backend`, `design-patterns`, `devops`

---

*Last updated: 2025-11-02*
