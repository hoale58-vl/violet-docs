# ClickHouse

A high-performance, column-oriented SQL database management system (DBMS) designed for online analytical processing (OLAP) and real-time analytics on massive datasets.

## Use Cases

### When to Use ClickHouse

Choose ClickHouse over other databases when you need its unique strengths:

| Use Case | Why ClickHouse Over Other Databases |
|----------|-------------------------------------|
| **Real-Time Analytics & BI** | **vs PostgreSQL/MySQL**: 100-1000x faster for aggregations on billions of rows thanks to columnar storage. Query entire year of data in milliseconds instead of minutes.<br/><br/>**vs Elasticsearch**: Better compression (10-20x), lower storage costs, and true SQL support for complex analytics. More efficient for structured time-series data.<br/><br/>**vs BigQuery/Snowflake**: Lower costs for high-frequency queries, no cold start delays, and full control over infrastructure. Better for real-time dashboards. |
| **Log Analytics & Monitoring** | **vs Elasticsearch**: 5-10x better compression means lower storage costs. Faster aggregations on large time ranges. Native support for complex SQL analytics without learning DSL.<br/><br/>**vs Splunk**: Dramatically lower costs (open source), better performance on structured logs, and SQL interface that developers already know.<br/><br/>**vs Traditional RDBMS**: Can handle 100x more log volume with better query performance. Purpose-built for append-only log data. |
| **Time-Series Data** | **vs InfluxDB/TimescaleDB**: Superior performance at scale (billions of data points), better compression, and more flexible query capabilities with full SQL support.<br/><br/>**vs Prometheus**: Can store years of metrics data efficiently (vs weeks/months), supports complex joins and aggregations, and handles high cardinality better.<br/><br/>**vs Cassandra**: Faster analytical queries, better compression, simpler operations, and SQL interface instead of CQL. |
| **E-commerce & Product Analytics** | **vs MongoDB**: 50-100x faster for aggregations and analytics queries. Better for read-heavy analytical workloads. Columnar format perfect for user event data.<br/><br/>**vs Data Warehouses (Redshift/BigQuery)**: Lower latency for real-time queries (milliseconds vs seconds), lower costs for frequent queries, and no vendor lock-in.<br/><br/>**vs PostgreSQL**: Can analyze billions of user events in real-time. PostgreSQL would struggle with even millions of rows for complex funnel queries. |
| **Financial Data & Ad-Tech** | **vs Traditional Databases**: Can process millions of transactions per second with sub-second query latency. Built for high-throughput ingestion.<br/><br/>**vs Kafka + Stream Processing**: Serves as both storage and query engine, eliminating need for separate systems. Direct SQL queries on streaming data.<br/><br/>**vs In-Memory Databases (Redis)**: Similar query speeds but with persistent storage, much higher data volumes, and lower memory costs. |
| **Data Warehousing** | **vs Snowflake/BigQuery**: 10-100x lower costs for same workload, no vendor lock-in, and better performance for real-time queries. Full control over infrastructure.<br/><br/>**vs Hadoop/Spark**: Simpler architecture (no complex clusters), faster queries (seconds vs minutes), and SQL interface instead of MapReduce/Spark jobs.<br/><br/>**vs Redshift**: Better compression, faster queries, lower costs, and easier to operate. No need for VACUUM or complex maintenance. |

### Decision Flowchart: Should You Use ClickHouse?

```mermaid
graph TD
    Start[What's your primary use case?] --> Question1{Need frequent<br/>updates/deletes?}

    Question1 -->|Yes| OLTP[Use PostgreSQL/MySQL<br/>for OLTP workloads]
    Question1 -->|No| Question2{What's your<br/>data volume?}

    Question2 -->|< 100GB| Small[Use PostgreSQL<br/>Overhead not worth it]
    Question2 -->|> 100GB| Question3{Query type?}

    Question3 -->|Analytics/Aggregations| Question4{Read vs Write ratio?}
    Question3 -->|Transactional/CRUD| OLTP2[Use PostgreSQL/MySQL<br/>Better for transactions]
    Question3 -->|Full-text search| Search[Use Elasticsearch<br/>Better for text search]
    Question3 -->|Document storage| Document[Use MongoDB<br/>Better for flexible schemas]

    Question4 -->|Heavy reads,<br/>append-only writes| Question5{Query latency<br/>requirements?}
    Question4 -->|Balanced reads/writes| Balanced[Use PostgreSQL<br/>Better balanced performance]

    Question5 -->|Sub-second<br/>on billions of rows| ClickHouse[✅ Use ClickHouse!]
    Question5 -->|Seconds acceptable| DataWarehouse[Consider Snowflake/Redshift<br/>or ClickHouse]

    ClickHouse --> UseCases[Perfect for:<br/>• Real-time analytics<br/>• Log aggregation<br/>• Time-series data<br/>• Event tracking<br/>• Metrics & monitoring]

    style ClickHouse fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff
    style OLTP fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style OLTP2 fill:#f44336,stroke:#c62828,stroke-width:2px,color:#fff
    style Small fill:#ff9800,stroke:#ef6c00,stroke-width:2px,color:#fff
    style Search fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Document fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style Balanced fill:#ff9800,stroke:#ef6c00,stroke-width:2px,color:#fff
    style DataWarehouse fill:#00BCD4,stroke:#00838F,stroke-width:2px,color:#fff
    style UseCases fill:#E8F5E9,stroke:#4CAF50,stroke-width:2px
```

**Quick Decision Table:**

| Your Scenario | Recommendation | Why |
|---------------|----------------|-----|
| Frequent updates/deletes on records | ❌ PostgreSQL/MySQL | ClickHouse is terrible at mutations |
| Dataset &lt; 100GB | ⚠️ PostgreSQL | ClickHouse overhead not worth it |
| Transactional workloads (CRUD operations) | ❌ PostgreSQL/MySQL | Need ACID guarantees |
| Flexible document schemas (JSON heavy) | ❌ MongoDB | Better for unstructured data |
| Full-text search across documents | ❌ Elasticsearch | Purpose-built for search |
| Primary application database | ❌ PostgreSQL/MySQL | ClickHouse is analytics-only |
| Analytics on 100GB+ data, append-only | ✅ ClickHouse | Perfect fit! |
| Real-time dashboards on billions of rows | ✅ ClickHouse | Sub-second queries |
| Log aggregation at scale | ✅ ClickHouse | Excellent compression & speed |
| Time-series metrics (years of data) | ✅ ClickHouse | Better than Prometheus/InfluxDB |
| Event tracking & user analytics | ✅ ClickHouse | Made for this! |

## Key Features

### 1. Lightning-Fast Queries

```sql
-- Scan 10 billion rows in seconds
SELECT
    toStartOfDay(timestamp) as day,
    countIf(status = 200) as success,
    countIf(status >= 400) as errors,
    avg(response_time) as avg_time,
    quantile(0.99)(response_time) as p99_time
FROM http_logs
WHERE timestamp >= today() - 30
GROUP BY day
ORDER BY day DESC

-- Typical execution time: 100-500ms on 10B rows
```

### 2. Efficient Compression

```sql
-- Example compression ratios
CREATE TABLE events (
    timestamp DateTime,
    user_id UInt64,
    event_name String,
    properties String
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id)
SETTINGS index_granularity = 8192;

-- Compression: 1TB uncompressed → 50-100GB compressed (10-20x)
```

### 3. Materialized Views

```sql
-- Pre-aggregate data for instant queries
CREATE MATERIALIZED VIEW daily_stats
ENGINE = SummingMergeTree()
ORDER BY (date, country)
AS SELECT
    toDate(timestamp) as date,
    country,
    count() as events,
    sum(revenue) as total_revenue
FROM raw_events
GROUP BY date, country;

-- Query the materialized view (instant results)
SELECT * FROM daily_stats WHERE date >= today() - 7;
```

### 4. Distributed Queries

```sql
-- Query distributed across multiple nodes
CREATE TABLE events_distributed AS events
ENGINE = Distributed(cluster_name, default, events, rand());

-- Automatically parallelized across all nodes
SELECT count() FROM events_distributed;
```

### 5. Advanced SQL Features

```sql
-- Array functions
SELECT
    arrayMap(x -> x * 2, [1, 2, 3]) as doubled;

-- JSON extraction
SELECT
    JSONExtractString(properties, 'user_agent') as browser
FROM events;

-- Approximate algorithms for speed
SELECT
    uniqExact(user_id) as exact_users,      -- Exact count (slower)
    uniq(user_id) as approx_users           -- ~2% error (10x faster)
FROM events;
```

## Pricing

### ClickHouse Cloud Pricing (2025)

As of January 2025, ClickHouse Cloud introduced updated pricing with significant changes:

| Component | Cost | Notes |
|-----------|------|-------|
| **Compute** | vCPU + RAM based | Pay-as-you-go model |
| **Storage** | $25.30 per TiB | Compare to AWS S3: $23/TiB |
| **Data Transfer (Egress)** | New fees (2025) | Makes migrations expensive |
| **Price Change** | ~30% increase | Grandfathered until July 23, 2025 |

### Self-Hosted Pricing

| Deployment Option | Cost Range | Details |
|-------------------|------------|---------|
| **Open Source** | Free | Apache 2.0 license, community support |
| **AWS Infrastructure** | $500-$5,000/month | c5.2xlarge: $0.34/hr (~$245/mo)<br/>EBS SSD: ~$0.10/GB/month |
| **GCP Infrastructure** | Similar to AWS | Comparable instance and storage costs |
| **On-Premises** | Hardware costs | Server hardware + operational expenses |

### Managed Service Alternatives

| Provider | Key Features | Pricing Model |
|----------|--------------|---------------|
| **Altinity.Cloud** | • Fully managed ClickHouse<br/>• 100% open source (no restrictions)<br/>• BYOC/BYOK support<br/>• Better transparency | More cost-effective than ClickHouse Cloud |
| **DoubleCloud** | • Managed service on AWS/GCP<br/>• Multi-cloud support | Competitive pricing |
| **ClickHouse Cloud** | • Official managed service<br/>• Automatic scaling | Premium pricing, egress fees apply |

## Setup & Installation

### Docker (Quickest Start)

```bash
# Run ClickHouse server
docker run -d \
  --name clickhouse-server \
  -p 8123:8123 \
  -p 9000:9000 \
  --ulimit nofile=262144:262144 \
  clickhouse/clickhouse-server
```

### Docker Compose (Development)

Create `./clickhouse/disable-telemetry.xml`:

```xml
<clickhouse>
    <opentelemetry_span_log remove="1"/>
    <query_log remove="1"/>
    <query_thread_log remove="1"/>
    <part_log remove="1"/>
    <metric_log remove="1"/>
    <asynchronous_metric_log remove="1"/>
    <trace_log remove="1"/>
    <session_log remove="1"/>
    <text_log remove="1"/>
    <crash_log remove="1"/>
</clickhouse>
```

Create `./clickhouse/postgres.xml`:

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

Create `docker-compose.yml`:

```yaml
name: clickhouse
services:
  clickhouse:
    container_name: clickhouse
    hostname: clickhouse
    image: clickhouse/clickhouse-server:latest
    restart: always
    ports:
      - "8123:8123"
      - "9000:9000"
      - "9004:9004"
      - "9005:9005"
    environment:
      CLICKHOUSE_DB: clickhouse
      CLICKHOUSE_USER: clickhouse
      CLICKHOUSE_PASSWORD: 5M8TDqtRi86dSvXv2y7FkBjUoL8fRs
      CLICKHOUSE_LOG_LEVEL: WARNING
    volumes:
      - ./data/clickhouse:/var/lib/clickhouse/
      - ./clickhouse/postgres.xml:/etc/clickhouse-server/config.d/postgres.xml:ro
      - ./clickhouse/disable-telemetry.xml:/etc/clickhouse-server/config.d/disable-telemetry.xml:ro
    healthcheck:
      test: ["CMD", "clickhouse-client", "--query=SELECT 1"]
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 10s
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
```

Start the cluster:

```bash
# Start server
docker-compose up -d
# Connect with client
docker-compose run --rm clickhouse-client
# Or use HTTP interface
curl 'http://localhost:8123/?query=SELECT+version()'
```

### Altinity Helm Chart

#### Add chart dependency

- Ref: https://github.com/Altinity/helm-charts/tree/main/charts/clickhouse

```bash
helm repo add altinity https://helm.altinity.com

helm upgrade --install clickhouse-operator \
  altinity/altinity-clickhouse-operator \
  --version 0.25.5 \
  --namespace clickhouse \
  --create-namespace
```

```yaml
dependencies:
  ...
  - name: clickhouse
    version: 0.3.5
    repository: https://helm.altinity.com
```

### HyperDX Helm Chart

- Ref: https://clickhouse.com/docs/use-cases/observability/clickstack/deployment/helm

### macOS Installation

```bash
# Using Homebrew
brew install clickhouse

# Start server
clickhouse-server

# In another terminal, connect
clickhouse-client
```

## Best Practices

### 1. Choose the Right Table Engine

```sql
-- MergeTree: Most common, for general use
CREATE TABLE events ENGINE = MergeTree()
ORDER BY (timestamp, user_id);

-- ReplacingMergeTree: Deduplicate rows
CREATE TABLE users ENGINE = ReplacingMergeTree()
ORDER BY user_id;

-- SummingMergeTree: Pre-aggregate metrics
CREATE TABLE metrics ENGINE = SummingMergeTree()
ORDER BY (date, metric_name);

-- Distributed: Query across multiple nodes
CREATE TABLE events_distributed ENGINE = Distributed(
    cluster_name, database, table, rand()
);
```

### 2. Optimize ORDER BY

```sql
-- Good: Query filters match ORDER BY
CREATE TABLE events ENGINE = MergeTree()
ORDER BY (timestamp, user_id, event_name);

-- Queries using this ordering will be fast
SELECT * FROM events
WHERE timestamp >= today()
  AND user_id = 12345;  -- Uses index efficiently

-- Bad: Query filters don't match ORDER BY
SELECT * FROM events
WHERE country = 'US';  -- Full table scan (slow)
```

### 3. Use Partitioning Wisely

```sql
-- Partition by month for time-series data
CREATE TABLE events ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (timestamp, user_id);

-- Benefits:
-- 1. Drop old partitions instantly
ALTER TABLE events DROP PARTITION '202501';

-- 2. Query only relevant partitions
SELECT count() FROM events
WHERE timestamp >= '2025-11-01';  -- Only scans November partition
```

### 4. Use Materialized Views

```sql
-- Pre-aggregate heavy queries
CREATE MATERIALIZED VIEW hourly_metrics
ENGINE = SummingMergeTree()
ORDER BY (hour, country)
AS SELECT
    toStartOfHour(timestamp) as hour,
    country,
    count() as events,
    uniq(user_id) as unique_users,
    sum(revenue) as total_revenue
FROM events
GROUP BY hour, country;

-- Query is now instant
SELECT * FROM hourly_metrics
WHERE hour >= today();
```

### 5. Monitor and Optimize

```bash
# Monitor disk usage
clickhouse-client --query "
SELECT
    database,
    table,
    formatReadableSize(sum(bytes)) as size
FROM system.parts
WHERE active
GROUP BY database, table
ORDER BY sum(bytes) DESC"

# Monitor query performance
clickhouse-client --query "
SELECT
    query,
    query_duration_ms,
    read_rows,
    formatReadableSize(read_bytes) as read_size
FROM system.query_log
WHERE type = 'QueryFinish'
  AND event_time >= now() - INTERVAL 1 HOUR
ORDER BY query_duration_ms DESC
LIMIT 10"
```

### 6. Cost Optimization

#### Use Appropriate Compression Codecs

```sql
-- Choose codecs based on data type
CREATE TABLE events (
    timestamp DateTime CODEC(DoubleDelta),        -- Time-series data
    user_id UInt64 CODEC(Delta, LZ4),            -- Sequential IDs
    event_name LowCardinality(String),           -- Save memory for repeated values
    properties String CODEC(ZSTD),               -- Best general compression
    counter UInt32 CODEC(T64, LZ4)               -- Small integers
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id);
```

#### Set TTL to Auto-Delete Old Data

```sql
-- Delete data older than 90 days
ALTER TABLE events
    MODIFY TTL timestamp + INTERVAL 90 DAY;

-- Different retention for different columns
ALTER TABLE events
    MODIFY COLUMN properties String TTL timestamp + INTERVAL 30 DAY,
    MODIFY TTL timestamp + INTERVAL 90 DAY;

-- Move old data to cheaper storage
ALTER TABLE events
    MODIFY TTL
        timestamp + INTERVAL 7 DAY TO VOLUME 'hot',
        timestamp + INTERVAL 30 DAY TO VOLUME 'cold',
        timestamp + INTERVAL 90 DAY DELETE;
```

#### Use Sampling for Exploratory Queries

```sql
-- Query 10% of data for quick exploration
SELECT
    country,
    count() * 10 as estimated_events  -- Multiply by sampling rate
FROM events SAMPLE 0.1
WHERE date = today()
GROUP BY country;

-- Use different sampling rates
SELECT count() FROM events SAMPLE 0.01;  -- 1% sample
SELECT count() FROM events SAMPLE 1000000;  -- Sample 1M rows
```

#### Monitor Storage Costs

```sql
-- Check compression ratios
SELECT
    table,
    formatReadableSize(sum(data_compressed_bytes)) as compressed,
    formatReadableSize(sum(data_uncompressed_bytes)) as uncompressed,
    round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) as ratio
FROM system.columns
WHERE database = 'analytics'
GROUP BY table
ORDER BY sum(data_compressed_bytes) DESC;

-- Identify large tables
SELECT
    table,
    formatReadableSize(sum(bytes)) as size,
    sum(rows) as rows,
    formatReadableSize(avg(bytes_on_disk)) as avg_part_size
FROM system.parts
WHERE active AND database = 'analytics'
GROUP BY table
ORDER BY sum(bytes) DESC;
```

## Tags

`clickhouse`, `analytics`, `olap`, `columnar-database`, `real-time`, `big-data`, `database`, `sql`, `data-warehouse`, `time-series`

---

*Last updated: 2025-11-07*
