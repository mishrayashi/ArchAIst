---
id: etl-concepts
section: modules
title: ETL & ELT — the heart of data engineering
level: Beginner
minutes: 11
tags: etl, pipelines, must-know
---

A **data pipeline** moves data from where it's created to where it's useful, transforming it along the way. **ETL** and **ELT** are the two patterns for doing this — and "build me an ETL pipeline" is the bread and butter of the job.

## ETL vs ELT — what the letters mean
- **E**xtract — pull data from sources (databases, APIs, files, events).
- **T**ransform — clean, join, reshape, aggregate it.
- **L**oad — write it into the destination (warehouse/lake).

The *order* is the whole distinction:

| | ETL | ELT |
|---|-----|-----|
| Order | Extract → **Transform** → Load | Extract → Load → **Transform** |
| Transform happens | Before loading (on a separate engine) | After loading (inside the warehouse) |
| Era | Traditional, on-prem | Modern cloud (Snowflake/BigQuery) |
| Why | Limited warehouse compute | Warehouses are now cheap & powerful, so load raw then transform with SQL |

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
<strong>ETL</strong> = wash & chop the vegetables, <em>then</em> put them in the fridge. <strong>ELT</strong> = put the raw vegetables in the (huge, powerful) fridge first, and chop them whenever you cook. Modern cloud fridges are so big and strong that ELT usually wins.
</div>

Modern stacks are mostly **ELT**: dump raw data into a lake/warehouse, then transform with SQL (often using **dbt**). It keeps the raw data so you can reprocess if logic changes.

## Batch vs Streaming
- **Batch** — process a chunk of data on a schedule (every hour/day). Simple, efficient, the default. e.g. "load yesterday's sales each night."
- **Streaming** — process events continuously as they arrive (seconds/milliseconds). For real-time needs: fraud detection, live dashboards. Harder. (See the Streaming module.)

## Full load vs Incremental load
- **Full load:** reprocess *everything* each run. Simple but slow/expensive as data grows.
- **Incremental load:** only process *new or changed* rows since last run (using a timestamp or id watermark). Essential at scale.
```sql
-- Incremental: only pull rows newer than what we already loaded
SELECT * FROM source_orders
WHERE updated_at > '2024-05-30 23:59:59';  -- the "watermark"
```
**CDC (Change Data Capture)** is an advanced incremental technique that reads the database's change log to capture inserts/updates/deletes in near-real-time.

## Idempotency — the concept that gets you hired
A pipeline is **idempotent** if running it multiple times produces the *same result* as running it once. This matters because pipelines fail and get retried — you must not create duplicates or double-count.

<div class="callout callout-note"><span class="cfor">🔑</span><div><strong>How to make a load idempotent:</strong> instead of blindly <code>INSERT</code>ing, use <strong>upsert/MERGE</strong> (insert-or-update on a key), or use "delete-then-insert for this partition." Then a retry overwrites cleanly instead of duplicating. Always design for "what happens if this runs twice?"</div></div>

## Anatomy of a real pipeline
```text
[Source DB / API / files]
        │ extract (incremental, watermark)
        ▼
[Raw / Bronze layer]  ← store exactly as received (auditable)
        │ transform (clean, dedupe, conform types)
        ▼
[Cleaned / Silver layer]
        │ transform (join, aggregate, model into star schema)
        ▼
[Business / Gold layer]  → dashboards, ML, AI
```
This **Bronze → Silver → Gold** pattern is called **medallion architecture** (popularised by Databricks). Each layer is reproducible from the one before it.

<div class="widget-mount" data-widget="medallion"></div>

## A tiny ELT in Python (concept)
```python
import pandas as pd, sqlalchemy as sa

engine = sa.create_engine("postgresql://user:pass@host/db")

# EXTRACT (incremental)
last = pd.read_sql("SELECT MAX(updated_at) FROM stg_orders", engine).iloc[0,0]
new = pd.read_sql(f"SELECT * FROM source.orders WHERE updated_at > '{last}'", engine)

# LOAD raw
new.to_sql("stg_orders", engine, if_exists="append", index=False)

# TRANSFORM in-warehouse (idempotent upsert handled by MERGE in real SQL)
engine.execute("""
  INSERT INTO gold.daily_sales
  SELECT date_trunc('day', order_ts) AS day, SUM(amount)
  FROM stg_orders GROUP BY 1
  ON CONFLICT (day) DO UPDATE SET sum = EXCLUDED.sum;  -- idempotent
""")
```

## What makes a pipeline *good* (interview checklist)
- **Reliable:** retries, alerting on failure, no silent data loss.
- **Idempotent:** safe to re-run.
- **Incremental:** doesn't reprocess everything.
- **Observable:** logs, row counts, data-quality checks, freshness metrics.
- **Documented & tested:** schema tests, not-null/unique checks.
- **Cost-aware:** scans less, runs only when needed.

> **Key takeaway:** Pipelines = Extract, Transform, Load. Modern cloud favours **ELT** + **medallion (Bronze/Silver/Gold)**. Prefer **incremental** loads and always make them **idempotent** so retries never duplicate data.
