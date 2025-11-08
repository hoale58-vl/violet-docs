# EVM Indexing Tools

Comprehensive guide to EVM blockchain indexing tools and platforms for querying, analyzing, and building on blockchain data.

## What is EVM Indexing?

EVM indexing is the process of extracting, transforming, and storing blockchain data from Ethereum Virtual Machine (EVM) compatible chains into queryable databases. Indexers make blockchain data accessible for applications by:

- **Reading blockchain data**: Blocks, transactions, logs, traces, and events
- **Decoding smart contract data**: Converting raw bytecode into readable formats
- **Storing in databases**: PostgreSQL, MongoDB, or custom stores
- **Providing APIs**: GraphQL, REST, or WebSocket interfaces
- **Real-time updates**: Keeping data synced with the latest blockchain state

## Why Use an Indexer?

| Challenge | Solution with Indexers |
|-----------|----------------------|
| **Slow RPC queries** | Pre-indexed data returns results in milliseconds vs seconds |
| **Complex data relationships** | Join data across blocks, transactions, and contracts |
| **Historical analysis** | Query years of blockchain data efficiently |
| **High RPC costs** | Reduce API calls by 100-1000x |
| **Real-time updates** | WebSocket subscriptions for instant notifications |
| **Custom business logic** | Transform raw blockchain data into application-specific formats |

## Open Source Indexers

### The Graph

A decentralized protocol for indexing and querying blockchain data.

| Feature | Details |
|---------|---------|
| **Website** | [thegraph.com](https://thegraph.com) |
| **Type** | Decentralized indexing protocol |
| **Language** | TypeScript/AssemblyScript |
| **Storage** | IPFS + PostgreSQL |
| **Best For** | DApps needing decentralized, censorship-resistant indexing |

**Key Features:**
- Build and publish open APIs called "subgraphs"
- Decentralized network of indexers and curators
- GraphQL API for querying indexed data
- Multi-chain support (Ethereum, Polygon, Arbitrum, etc.)
- Network incentives via GRT token

**Setup Example:**

```bash
# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Initialize a new subgraph
graph init --product hosted-service username/mysubgraph

# Deploy subgraph
graph deploy --product hosted-service username/mysubgraph
```

**Subgraph Example:**

```graphql
type Transfer @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  timestamp: BigInt!
}
```

### reth-indexer

Direct reth database reader that stores decoded data in PostgreSQL.

| Feature | Details |
|---------|---------|
| **GitHub** | [joshstevens19/reth-indexer](https://github.com/joshstevens19/reth-indexer) |
| **Type** | Database-level indexer |
| **Language** | Rust |
| **Storage** | PostgreSQL |
| **Best For** | High-performance indexing with direct database access |

**Key Features:**
- Reads directly from reth database (no RPC calls)
- Simple YAML configuration
- Exposed query API for custom queries
- Extremely fast (no network overhead)
- Supports all EVM-compatible chains

**Configuration Example:**

```yaml
database:
  host: localhost
  port: 5432
  database: indexer

contracts:
  - address: "0x..."
    start_block: 15000000
    events:
      - Transfer
      - Approval
```

### Ponder

Modern backend framework for blockchain applications with hot reloading.

| Feature | Details |
|---------|---------|
| **Website** | [ponder.sh](https://ponder.sh) |
| **Type** | Backend framework |
| **Language** | TypeScript |
| **Storage** | PostgreSQL/SQLite |
| **Best For** | Rapid development with DX focus |

**Key Features:**
- Hot reloading for instant development feedback
- GraphQL API generation
- Type-safe indexing functions
- Built-in caching and optimization
- Multi-chain support out of the box

**Example:**

```typescript
// ponder.config.ts
export default {
  networks: {
    mainnet: {
      chainId: 1,
      rpcUrl: process.env.RPC_URL,
    },
  },
  contracts: {
    MyNFT: {
      network: "mainnet",
      address: "0x...",
      abi: "./abis/MyNFT.json",
      startBlock: 15000000,
    },
  },
};

// src/MyNFT.ts
import { ponder } from "@/generated";

ponder.on("MyNFT:Transfer", async ({ event, context }) => {
  await context.db.Transfer.create({
    id: event.log.id,
    from: event.args.from,
    to: event.args.to,
    tokenId: event.args.tokenId,
  });
});
```

### evm-indexer

Scalable SQL-based indexer for comprehensive EVM chain data.

| Feature | Details |
|---------|---------|
| **GitHub** | [eabz/evm-indexer](https://github.com/eabz/evm-indexer) |
| **Type** | Full-chain indexer |
| **Language** | Go |
| **Storage** | PostgreSQL |
| **Best For** | Indexing all blockchain data (not just contracts) |

**Key Features:**
- Indexes blocks, transactions, receipts, logs, traces, withdrawals
- Scalable architecture for high-throughput chains
- SQL queries for flexible data analysis
- Multi-chain support
- No configuration needed for basic indexing

**SQL Query Examples:**

```sql
-- Find all transactions to a specific address
SELECT * FROM transactions
WHERE to_address = '0x...'
ORDER BY block_number DESC
LIMIT 100;

-- Analyze gas usage over time
SELECT
  DATE(block_timestamp) as date,
  AVG(gas_used) as avg_gas,
  SUM(gas_used) as total_gas
FROM transactions
WHERE block_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE(block_timestamp);
```

### Reservoir Protocol Indexer

NFT-specialized indexer for orderbook reconstruction.

| Feature | Details |
|---------|---------|
| **GitHub** | [reservoirprotocol/indexer](https://github.com/reservoirprotocol/indexer) |
| **Type** | NFT indexer |
| **Language** | TypeScript |
| **Storage** | PostgreSQL |
| **Best For** | NFT marketplaces and analytics |

**Key Features:**
- Combines Arweave order data with Ethereum ownership
- Tracks NFT transfers, sales, and listings
- Multi-marketplace aggregation (OpenSea, LooksRare, etc.)
- Real-time floor price tracking
- Collection metadata indexing

### Apibara DNA

Production-grade indexer SDK connecting on-chain to web2 services.

| Feature | Details |
|---------|---------|
| **GitHub** | [apibara/dna](https://github.com/apibara/dna) |
| **Type** | Indexer SDK/Platform |
| **Language** | TypeScript/Python |
| **Storage** | Flexible (any database) |
| **Best For** | Custom integrations and complex workflows |

**Key Features:**
- Stream blockchain data to any destination
- Python and TypeScript SDKs
- Built-in transformations and filters
- Webhook support for real-time notifications
- Enterprise-grade reliability

### Coherent EVM Models

DBT models and tables for Ethereum transaction analysis.

| Feature | Details |
|---------|---------|
| **GitHub** | [coherentdevs/evm-models](https://github.com/coherentdevs/evm-models) |
| **Type** | Data models framework |
| **Language** | SQL (DBT) |
| **Storage** | Data warehouse (Snowflake, BigQuery) |
| **Best For** | Data analytics and BI pipelines |

**Key Features:**
- Pre-built DBT models for common patterns
- Raw and decoded transaction data
- Customizable transformation pipelines
- Compatible with modern data stacks
- Best practices for blockchain analytics

### Rarible Ethereum Indexer

Multi-purpose indexer for NFTs, ERC-20 balances, and orders.

| Feature | Details |
|---------|---------|
| **GitHub** | [rarible/ethereum-indexer-public](https://github.com/rarible/ethereum-indexer-public) |
| **Type** | Multi-purpose indexer |
| **Language** | Kotlin |
| **Storage** | MongoDB |
| **Best For** | NFT + token tracking |

**Key Features:**
- Tracks NFT ownership and metadata
- ERC-20 balance tracking
- Order matching and trade history
- Multi-chain support
- Production-tested at scale

## Hosted Services

### indexer.xyz (Goldsky)

Real-time, decoded crypto datasets with CC0 license.

| Feature | Details |
|---------|---------|
| **Website** | [indexer.xyz](https://indexer.xyz) |
| **GitHub** | [indexed-xyz/docs](https://github.com/indexed-xyz/docs) |
| **Pricing** | **Free forever** (CC0 public domain) |
| **Best For** | Analytics and research without vendor lock-in |

**Key Features:**
- Permanently free, public domain datasets
- Real-time decoded data
- No vendor lock-in (download full datasets)
- High-quality data validation
- SQL and API access

**Query Example:**

```sql
-- Query via SQL interface
SELECT
  block_number,
  transaction_hash,
  from_address,
  to_address,
  value
FROM ethereum.transactions
WHERE block_number > 18000000
LIMIT 100;
```

### Subsquid

Peer-to-peer network for batch querying blockchain data.

| Feature | Details |
|---------|---------|
| **Website** | [subsquid.io](https://subsquid.io) |
| **Pricing** | Free tier + paid plans |
| **Best For** | High-volume data processing |

**Key Features:**
- Batch queries aggregating terabytes of data
- 100-1000x faster than RPC
- GraphQL and TypeScript SDK
- Multi-chain support (100+ chains)
- Decentralized data lake

**Example:**

```typescript
processor
  .addLog({
    address: ['0x...'],
    topic0: [Transfer.topic],
  })
  .addTransaction({
    from: ['0x...'],
  });
```

### Subquery

Decentralized APIs for blockchain data with customizable queries.

| Feature | Details |
|---------|---------|
| **Website** | [subquery.network](https://subquery.network) |
| **Pricing** | Free tier + paid plans |
| **Best For** | Custom indexing with managed infrastructure |

**Key Features:**
- Multi-chain support (Polkadot, Cosmos, EVM)
- GraphQL API
- Flexible data transformation
- Decentralized network
- Fast deployment

### nxyz

Real-time blockchain data APIs with low latency.

| Feature | Details |
|---------|---------|
| **Website** | [n.xyz](https://n.xyz) |
| **Pricing** | Usage-based |
| **Best For** | Real-time applications |

**Key Features:**
- Multi-chain support
- WebSocket subscriptions
- Sub-second latency
- REST and GraphQL APIs
- Enterprise SLA

### Transpose

Indexed real-time blockchain data platform.

| Feature | Details |
|---------|---------|
| **Website** | [transpose.io](https://transpose.io) |
| **Pricing** | Free tier + enterprise |
| **Best For** | NFT and DeFi data |

**Key Features:**
- Real-time data ingestion
- SQL and REST APIs
- NFT metadata and ownership
- Token balances and transfers
- Bulk data exports

### Ormi

Next-generation indexing layer with subgraphs and APIs.

| Feature | Details |
|---------|---------|
| **Website** | [ormilabs.com](https://ormilabs.com) |
| **Pricing** | Contact for pricing |
| **Best For** | Enterprise applications |

**Key Features:**
- Data synced to chain tip
- Subgraph hosting
- Custom API endpoints
- High availability
- Dedicated support

## Comparison Matrix

| Tool | Type | Hosting | Language | Best Use Case | Cost |
|------|------|---------|----------|---------------|------|
| **The Graph** | Protocol | Decentralized | TypeScript | Decentralized DApps | Token-based |
| **reth-indexer** | DB-level | Self-hosted | Rust | High performance | Free (OSS) |
| **Ponder** | Framework | Self-hosted | TypeScript | Rapid development | Free (OSS) |
| **evm-indexer** | Full-chain | Self-hosted | Go | Complete chain data | Free (OSS) |
| **Reservoir** | NFT-focused | Self-hosted | TypeScript | NFT marketplaces | Free (OSS) |
| **Apibara DNA** | SDK | Self/Cloud | TS/Python | Custom integrations | Free + Cloud |
| **indexer.xyz** | Service | Cloud | SQL | Analytics | **Free forever** |
| **Subsquid** | Network | Cloud | TypeScript | High-volume queries | Freemium |
| **Subquery** | Service | Cloud | TypeScript | Multi-chain DApps | Freemium |
| **nxyz** | Service | Cloud | API | Real-time apps | Paid |
| **Transpose** | Service | Cloud | API | NFT/DeFi data | Freemium |
| **Ormi** | Service | Cloud | API | Enterprise | Enterprise |

## Decision Guide

### Choose Open Source When:

- ✅ You need full control over infrastructure
- ✅ You want to avoid vendor lock-in
- ✅ You have DevOps resources
- ✅ You need custom data transformations
- ✅ You're building for high scale

**Recommended:** Ponder (fast dev), reth-indexer (performance), The Graph (decentralized)

### Choose Hosted Service When:

- ✅ You want to focus on application logic
- ✅ You need instant scalability
- ✅ You prefer managed infrastructure
- ✅ You need multi-chain support quickly
- ✅ You value reliability and uptime SLA

**Recommended:** indexer.xyz (free), Subsquid (high-volume), nxyz (real-time)

### Choose by Use Case:

| Use Case | Best Options |
|----------|--------------|
| **NFT Marketplace** | Reservoir Protocol, Transpose, The Graph |
| **DeFi Dashboard** | The Graph, Subsquid, Transpose |
| **Analytics Platform** | indexer.xyz, Coherent Models, evm-indexer |
| **Real-time Trading Bot** | nxyz, Apibara DNA, reth-indexer |
| **Multi-chain DApp** | Subquery, Subsquid, The Graph |
| **Enterprise Application** | Ormi, Transpose (Enterprise), Subsquid |
| **Research/Education** | indexer.xyz (free), evm-indexer |

## Getting Started

### Quick Start: Ponder (Easiest)

```bash
# Install Ponder
npm create ponder@latest

# Follow setup wizard
cd my-ponder-app
npm install

# Start development server
npm run dev
```

### Quick Start: The Graph

```bash
# Install Graph CLI
npm install -g @graphprotocol/graph-cli

# Create subgraph from contract
graph init --from-contract 0x... --network mainnet

# Deploy
cd my-subgraph
npm install
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
graph deploy --product hosted-service username/my-subgraph
```

### Quick Start: Subsquid

```bash
# Install Squid CLI
npm i -g @subsquid/cli

# Create new squid
sqd init my-squid -t evm

# Start
cd my-squid
npm install
sqd up
sqd process
```

## Best Practices

### 1. Choose the Right Indexer

```plaintext
Project Requirements → Indexer Selection

High performance needs → reth-indexer (Rust, direct DB)
Fast development → Ponder (TS, hot reload)
Decentralization → The Graph (protocol)
NFT focus → Reservoir Protocol
Analytics → indexer.xyz or Coherent Models
```

### 2. Optimize Query Performance

```sql
-- Bad: Full table scan
SELECT * FROM transfers WHERE block_number > 10000000;

-- Good: Use indexed columns
CREATE INDEX idx_transfers_block ON transfers(block_number);
SELECT from_address, to_address, value
FROM transfers
WHERE block_number > 10000000
LIMIT 1000;
```

### 3. Handle Reorgs

```typescript
// Always handle chain reorganizations
ponder.on("MyContract:Transfer", async ({ event, context }) => {
  // Upsert instead of insert
  await context.db.Transfer.upsert({
    id: event.log.id,
    create: { /* data */ },
    update: { /* data */ },
  });
});
```

### 4. Monitor Indexer Health

```bash
# Check indexing status
curl https://api.thegraph.com/index-node/graphql \
  -d '{"query": "{ indexingStatuses { subgraph health synced }}"}'

# Monitor lag
SELECT
  MAX(block_number) as latest_indexed,
  (SELECT number FROM blocks ORDER BY number DESC LIMIT 1) as chain_tip,
  chain_tip - latest_indexed as blocks_behind
FROM indexed_blocks;
```

### 5. Cost Optimization

- **Use batch queries** instead of multiple single queries
- **Cache frequently accessed data** in application layer
- **Set appropriate start blocks** to avoid indexing unnecessary history
- **Use webhooks** instead of polling for real-time updates
- **Leverage free tiers** before scaling to paid plans

## Common Patterns

### Pattern 1: Real-time Balance Tracking

```typescript
// Track ERC-20 balance changes in real-time
ponder.on("Token:Transfer", async ({ event, context }) => {
  const { from, to, value } = event.args;

  // Update sender balance
  await context.db.Balance.update({
    id: `${event.log.address}-${from}`,
    data: ({ current }) => ({
      amount: current.amount - value,
    }),
  });

  // Update receiver balance
  await context.db.Balance.upsert({
    id: `${event.log.address}-${to}`,
    create: { amount: value },
    update: ({ current }) => ({
      amount: current.amount + value,
    }),
  });
});
```

### Pattern 2: Aggregated Analytics

```sql
-- Daily trading volume aggregation
CREATE MATERIALIZED VIEW daily_volume AS
SELECT
  DATE(block_timestamp) as date,
  token_address,
  SUM(amount_usd) as volume_usd,
  COUNT(*) as trade_count
FROM trades
GROUP BY DATE(block_timestamp), token_address;

-- Refresh periodically
REFRESH MATERIALIZED VIEW daily_volume;
```

### Pattern 3: Cross-chain Indexing

```typescript
// Index same contract across multiple chains
const chains = ['ethereum', 'polygon', 'arbitrum'];

chains.forEach(chain => {
  processor.addLog({
    chain,
    address: [CONTRACT_ADDRESS],
    topic0: [Transfer.topic],
  });
});
```

## Resources

### Official Documentation

- [The Graph Docs](https://thegraph.com/docs)
- [Ponder Docs](https://ponder.sh/docs)
- [Subsquid Docs](https://docs.subsquid.io)
- [Subquery Docs](https://academy.subquery.network)

### Community

- [The Graph Discord](https://discord.gg/thegraph)
- [EVM Indexer Discussions](https://github.com/o-az/awesome-evm-indexer/discussions)
- [Ponder GitHub](https://github.com/ponder-sh/ponder)

### Learning Resources

- [Awesome EVM Indexer](https://github.com/o-az/awesome-evm-indexer) - Curated list
- [The Graph Academy](https://thegraph.academy) - Subgraph tutorials
- [Blockchain Data Analysis Course](https://www.udemy.com/blockchain-data-analysis/)

## Tags

`blockchain`, `ethereum`, `evm`, `indexing`, `web3`, `graphql`, `data`, `analytics`, `smart-contracts`, `defi`, `nft`

---

*Last updated: 2025-11-07*
