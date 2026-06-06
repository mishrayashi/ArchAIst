---
id: messaging-movement
section: concepts
title: Messaging & data-movement patterns
level: Intermediate
minutes: 9
tags: streaming, system design, ingestion
---

How data physically moves between systems — and the contracts that keep it from breaking. These terms surface the moment you design ingestion or cross-team data flow.

## Queue vs Log
- **Message queue** (RabbitMQ, SQS) — messages are consumed and *removed*; good for task distribution.
- **Log** (Kafka) — an **append-only, replayable** sequence; many consumers read independently and remember their **offset**. Data isn't deleted on read. This replayability is why logs power streaming + kappa architecture. See [Kafka](#/page/streaming-kafka).

## Pub/Sub (publish–subscribe)
Producers **publish** to a topic; any number of **subscribers** receive it, decoupled from the producer. The backbone of event-driven systems (Kafka, Google Pub/Sub, SNS).

## Push vs Pull ingestion
- **Push** — the source sends data to you (webhooks, events).
- **Pull** — you periodically fetch from the source (API polling, scheduled extracts).

<div class="flow flow-row">
  <div class="flow-node"><strong>Push</strong><span>source initiates</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>You</strong></div>
  <div class="flow-link"><i data-ic="arrowLeft" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Pull</strong><span>you initiate</span></div>
</div>

## Change Data Capture (CDC)
Capture **inserts/updates/deletes** from a source database's transaction log in near-real-time (Debezium, Fivetran). The efficient way to keep a warehouse in sync without full reloads. See [ETL](#/page/etl-concepts).

## Schema evolution & the schema registry
- **Schema evolution** — data structures change over time (new columns, type changes). Your pipeline must handle it without breaking.
- **Schema registry** — a central store of message schemas (common with Kafka/Avro) that enforces **compatibility** rules (backward/forward) so producers can't silently break consumers.

## Data contracts
An explicit, agreed **interface** between a data producer and its consumers: the schema, semantics, freshness, quality guarantees, and ownership. Treating data like an API — increasingly expected on serious teams.

## Backfill & replay
- **Backfill** — populate historical periods (new pipeline, or after a fix).
- **Replay** — re-run a log/stream from a past offset to rebuild state. Kappa architecture relies on this.

## Ingestion patterns at a glance

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="layers"></i></span><div><strong>Full / incremental / CDC</strong><p>Pick by volume and freshness need.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Bronze landing</strong><p>Always land raw first (medallion) so you can reprocess.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="refresh"></i></span><div><strong>Idempotent writes</strong><p>Retries and replays don't create duplicates.</p></div></div>
</div>

<div class="callout callout-tip"><span class="cfor"></span><div><span class="ctitle">Hidden-but-common:</span> "data contract," "schema registry," and "CDC" trip up many mid-level engineers. Knowing them — and saying "let's enforce a backward-compatible schema via the registry" — instantly reads as experienced.</div></div>

> **Key takeaway:** A **log** (Kafka) is a replayable, multi-consumer queue powering **pub/sub** and event-driven systems. Move changing data with **CDC**; protect consumers with **schema registries** and **data contracts**; and design for **backfill/replay** with idempotent writes.
