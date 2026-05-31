---
id: scaling-reliability
section: concepts
title: Scaling, performance & the -ilities
level: Intermediate
minutes: 10
tags: system design, performance, must-know
---

When an interviewer says "how would this scale?" or "how do you make it reliable?", these are the words and levers they want to hear.

## Throughput, latency, and the metrics
- **Throughput** — how much work per unit time (rows/sec, requests/sec, QPS).
- **Latency** — how long one operation takes. Watch **p95 / p99** (tail latency), not just average.
- **SLA / SLO / SLI** — **SLA** = the promise to customers (e.g. 99.9% uptime); **SLO** = your internal target; **SLI** = the actual measured indicator. Say "our freshness SLO is 1 hour."

## Scaling
- **Vertical scaling (scale up)** — a bigger machine. Simple, but a ceiling.
- **Horizontal scaling (scale out)** — more machines. Near-unlimited, needs partitioning/coordination. The default at data scale.
- **Autoscaling** — add/remove capacity automatically with load (and shut idle compute to save cost).

## Load balancing
Spreading requests across many servers (round-robin, least-connections, hashing). Keeps any one node from melting; enables horizontal scale.

## Caching
Storing hot results closer/faster (Redis, CDN, materialised views) to cut latency and load. Concerns: **cache invalidation** (the hard part), **TTL** (expiry), **cache hit ratio**, and **stampede** (many misses at once).

## Performance levers for data systems
- **Partition pruning** — scan only relevant partitions (date filters).
- **Columnar + compression** — read only needed columns (Parquet). See [File formats](#/page/file-formats).
- **Indexing / clustering / sort keys** — find rows without full scans.
- **Broadcast joins / avoiding shuffles** — Spark tuning. See [Spark](#/page/spark-basics).
- **Materialised views** — precompute heavy aggregations.
- **Batching** — amortise per-call overhead.

## The "-ilities" (non-functional requirements)
Senior design is judged on these as much as features:
- **Scalability** — handles growth.
- **Reliability / Availability** — stays up; **HA** = no single point of failure; measured in "nines."
- **Fault tolerance** — survives component failures (retries, replicas, graceful degradation).
- **Durability** — committed data isn't lost.
- **Maintainability** — easy to change safely.
- **Observability** — you can *see* what's happening: **logging**, **metrics**, **tracing**, plus **monitoring** & **alerting**.
- **Security** — least privilege, encryption, auditing. See [Data quality & governance](#/page/data-quality-governance).
- **Cost-efficiency** — performance per dollar (a real engineering metric in cloud).

## Reliability patterns
- **Retries with backoff** + **idempotency** — recover from transient failures safely.
- **Circuit breaker** — stop hammering a failing dependency; fail fast, recover gracefully.
- **Graceful degradation** — serve a reduced experience instead of total failure.
- **Disaster Recovery (DR)** — **RPO** (how much data you can lose) and **RTO** (how fast you recover) targets; backups, multi-region.
- **Single Point of Failure (SPOF)** — the thing whose death kills the system; design it out.

<div class="callout callout-note"><span class="cfor"></span><div><span class="ctitle">Interview framing:</span> "First, what are the throughput and latency targets, and the SLO? Then I'd scale horizontally with partitioning, add caching for hot reads, and ensure reliability with retries+idempotency, replicas, and monitoring — while watching cost." That one paragraph hits every -ility.</div></div>

> **Key takeaway:** Talk in **throughput/latency/p99** and **SLA/SLO/SLI**; scale **out** with partitioning + load balancing + caching; and earn senior marks by naming the **-ilities** (reliability, fault tolerance, observability, cost) and patterns (retries+idempotency, circuit breaker, DR with RPO/RTO).
