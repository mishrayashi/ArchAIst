---
id: distributed-blocks
section: concepts
title: Distributed systems building blocks
level: Advanced
minutes: 12
tags: distributed, system design, must-know
---

At scale, data lives across many machines. These are the building blocks (and scary words) you must recognise. You don't need to *implement* consensus — you need to know what each term means when it's said.

## Replication
Keeping **copies** of data on multiple nodes for durability and availability. Trade-off: copies can lag → **replication lag** → temporarily stale reads.
- **Leader–follower (primary–replica):** writes go to one leader, reads can fan out to followers.
- **Multi-leader / leaderless:** multiple nodes accept writes (more available, harder conflicts).

## Partitioning / Sharding
**Splitting data across nodes** so no single machine holds it all. "Partitioning" (within a system) and "sharding" (across databases) are near-synonyms.
- **Hash partitioning** — by hash of a key (even spread).
- **Range partitioning** — by value ranges (e.g. date) — great for pruning, risk of hot ranges.
- **Hot partition / skew** — one partition gets disproportionate load (a classic Spark problem; fix with salting).

## Consistency models
*How fresh/agreed* reads are across replicas:
- **Strong consistency** — every read sees the latest write (feels like one machine).
- **Eventual consistency** — replicas converge "eventually"; reads may be briefly stale.
- **Causal / read-your-writes** — weaker guarantees that still feel sane to users.
Tie-in: [CAP & PACELC](#/page/cap-distributed) explain *why* you trade these.

## Consensus & quorum
- **Consensus** — getting nodes to agree on a value despite failures. Algorithms: **Raft**, **Paxos** (know the names; "we need consensus, so something like Raft").
- **Quorum** — requiring a majority (e.g. 2 of 3) of nodes to acknowledge a read/write. `R + W > N` gives strong-ish guarantees.

## Write-ahead log (WAL) & checkpointing
- **WAL** — append every change to a durable log *before* applying it, so you can recover after a crash. The basis of database durability and Kafka.
- **Checkpointing** — periodically saving processing state (e.g. stream offsets) so a restarted job resumes instead of redoing everything.

## Idempotency & delivery guarantees
- **Idempotent** — running twice = same result as once (vital for retries). See [ETL](#/page/etl-concepts).
- **Delivery semantics** — how hard the system tries to deliver each message:

<div class="flow flow-row">
  <div class="flow-node tone-bronze"><strong>At-most-once</strong><span>may drop, never duplicates</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-silver"><strong>At-least-once</strong><span>never drops, may duplicate</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Exactly-once</strong><span>at-least-once + idempotent</span></div>
</div>

## Transactions across systems
- **Two-phase commit (2PC)** — a coordinator asks all participants to "prepare," then "commit." Strong but blocking and fragile at scale.
- **Saga** — a long transaction split into steps, each with a **compensating action** to undo on failure. The scalable alternative to 2PC in microservices.

## Backpressure & flow control
When a consumer can't keep up with a producer, **backpressure** signals "slow down" so you don't overflow memory or queues — a core streaming concern.

## Dead-letter queue (DLQ)
A side queue where repeatedly-failing messages are parked for later inspection, so one poison message doesn't block the whole stream.

## Fan-in / Fan-out
- **Fan-out** — one event delivered to many consumers/partitions.
- **Fan-in** — many producers/streams merged into one.

<div class="callout callout-tip"><span class="cfor"></span><div><span class="ctitle">How to use these in an interview:</span> you rarely implement them, but dropping the right term — "we'd want quorum writes for durability," "add a DLQ for poison messages," "use a saga instead of 2PC here" — shows you operate at the system level.</div></div>

> **Key takeaway:** Replication (copies), partitioning/sharding (splits), consistency models (freshness), consensus/quorum (agreement), WAL/checkpointing (recovery), 2PC vs saga (cross-system transactions), backpressure & DLQ (stream safety). Recognise them; deploy the term at the right moment.
