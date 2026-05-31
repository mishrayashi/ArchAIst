---
id: arch-patterns
section: concepts
title: Architecture patterns (data & AI)
level: Intermediate
minutes: 11
tags: system design, architecture, must-know
---

The named, reusable shapes for building data & AI systems. Recognise them, and you can describe almost any platform in a sentence.

## Lambda architecture
Run **two paths in parallel**: a **batch layer** (accurate, slow, reprocesses everything) and a **speed/streaming layer** (fast, approximate), then merge for serving. Powerful but you maintain *two* codebases for the same logic.
*Say it when:* you need both real-time freshness and historically correct reprocessing.

## Kappa architecture
**Stream-only.** Treat *everything* as an event stream; reprocess history by replaying the log. One codebase instead of two. Simpler than lambda when your stream engine can also handle reprocessing.
*Say it when:* you can express batch as "replay the stream."

## Medallion architecture (Bronze / Silver / Gold)
Layered refinement in a lakehouse: **Bronze** = raw as-ingested, **Silver** = cleaned/conformed, **Gold** = business-ready aggregates. Each layer rebuilds from the one before. The default modern data-engineering pattern.

## Data warehouse vs Data lake vs Lakehouse
- **Warehouse** — structured, governed, fast SQL (Snowflake/BigQuery/Redshift).
- **Lake** — cheap object storage holding any raw files; flexible, risk of a "data swamp."
- **Lakehouse** — a table layer (Delta/Iceberg/Hudi) over lake files adding ACID + reliability. Cheap *and* trustworthy. *(Full lesson: [Warehouses & lakehouse](#/page/warehouse-basics).)*

## Data Mesh
An **organisational** pattern: decentralise data ownership to **domain teams**, each publishing their data as a well-documented **data product**, governed by federated standards. Solves the "central data team is a bottleneck" problem at large companies.
*Say it when:* one central team can't keep up with many domains.

## Data Fabric
A **technology** pattern: a unified metadata/access layer that connects data across many systems so it *looks* integrated without physically moving it all. Often confused with data mesh (mesh = org/ownership; fabric = tech/integration).

## ETL vs ELT
Transform-before-load (ETL, traditional) vs load-raw-then-transform-in-warehouse (ELT, modern cloud). *(Full lesson: [ETL & ELT](#/page/etl-concepts).)*

## Monolith vs Microservices
- **Monolith** — one big deployable app. Simple to start, harder to scale teams.
- **Microservices** — many small independently-deployed services talking over APIs/events. Scales teams & components independently; adds network/ops complexity.
*Say it when:* discussing how the *services around* your pipelines are structured.

## Event-driven architecture
Components communicate by **emitting and reacting to events** (via Kafka/Pub-Sub) instead of calling each other directly. Decoupled, scalable, the backbone of streaming platforms. See [Streaming & Kafka](#/page/streaming-kafka).

## Star vs Snowflake schema
Dimensional-modelling shapes for analytics — flat dimensions (star, default) vs normalized sub-dimensions (snowflake). *(Full lesson: [Data modeling](#/page/dm-fundamentals).)*

## Hub-and-spoke / Layered / Onion (quick mentions)
Common enterprise integration shapes: a central **hub** routing to many **spokes**; **layered** separation (ingestion/storage/serving); **onion** (domain core wrapped by infrastructure). You'll hear these — now they won't surprise you.

<div class="callout callout-note"><span class="cfor"></span><div><span class="ctitle">Most-asked in interviews:</span> Lambda vs Kappa, Medallion, Lake vs Warehouse vs Lakehouse, and Data Mesh. Be able to define each in one sentence and say when you'd pick it.</div></div>

> **Key takeaway:** These named patterns are the vocabulary of platform design. Lambda/Kappa (real-time shape), Medallion (lakehouse layers), Mesh (org) vs Fabric (tech), and Monolith vs Microservices come up constantly.
