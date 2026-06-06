---
id: warehouse-basics
section: modules
title: Warehouses, Lakes & the Lakehouse
level: Intermediate
minutes: 11
tags: warehouse, snowflake, bigquery, must-know
---

Where does all the transformed data *live* for analytics and AI? In a **data warehouse**, a **data lake**, or the modern blend, a **lakehouse**. Understanding the differences (and the vendors) is essential.

## The three storage paradigms
| | Data Warehouse | Data Lake | Lakehouse |
|---|---|---|---|
| Stores | Structured tables | Any raw files (CSV, JSON, images, Parquet) | Files + table reliability layer |
| Schema | **Schema-on-write** (defined up front) | **Schema-on-read** (interpret later) | Both |
| Strength | Fast SQL, reliable, governed | Cheap, flexible, all data types | Cheap *and* reliable |
| Weakness | Costlier, structured only | Can become a "data swamp" | Newer, evolving tooling |
| Examples | Snowflake, BigQuery, Redshift | S3/ADLS/GCS + files | Databricks + **Delta Lake**, Iceberg |

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
A <strong>warehouse</strong> is a tidy, labelled retail store — everything organised, fast to find, but you pay for the organising. A <strong>lake</strong> is a giant cheap warehouse where you dump everything raw — flexible but can become a mess ("data swamp"). A <strong>lakehouse</strong> puts shelving and a catalog on top of the cheap warehouse so it's both cheap <em>and</em> organised.
</div>

## Why warehouses are fast: columnar storage
Analytical queries usually touch *a few columns across millions of rows*. **Columnar storage** keeps each column together, so the engine reads only the columns you ask for. Tick/untick columns below and watch the I/O drop (**Parquet** is the columnar format you'll use in lakes):

<div class="widget-mount" data-widget="columnar"></div>

## MPP — Massively Parallel Processing
Warehouses like Redshift, BigQuery, and Snowflake split work across many nodes that each handle a slice of the data, then combine results — that's how they query terabytes in seconds. The design implication for *you*: distribute data well and minimise shuffling between nodes (same idea as Spark).

## Key vendor concepts
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Snowflake</strong><p>Separates storage from compute — independent virtual warehouses scale per workload; you pay for compute by the second.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="chart"></i></span><div><strong>BigQuery (GCP)</strong><p>Serverless — no clusters to manage; billed mainly by <strong>bytes scanned</strong>, so partitioning and reading few columns saves money.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>Redshift (AWS)</strong><p>Node-based MPP; performance depends on good <strong>distribution keys</strong> and <strong>sort keys</strong>.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="layers"></i></span><div><strong>Databricks + Delta Lake</strong><p>The lakehouse — Spark plus a transactional table layer (ACID, time travel, MERGE) over your lake files.</p></div></div>
</div>

## Designing for performance & cost
- **Partitioning:** physically split a table by a column (usually **date**) so queries prune to relevant partitions.
- **Clustering / sort keys:** order data within partitions on common filter columns.
- **Distribution:** co-locate rows that get joined to avoid network shuffles.
- **Materialised views:** precompute heavy aggregations.
- **Don't `SELECT *`** on wide tables — especially on scan-billed engines.

## How it ties together
Modern stack ("modern data stack"):
```text
Sources → ingestion (Fivetran/custom) → lake/warehouse (raw)
        → dbt transforms (SQL, ELT) → star-schema marts
        → BI (Tableau/Power BI/Looker) + reverse-ETL + ML/GenAI
```

## Practice
1. In BigQuery (free tier) create a partitioned-by-date table and compare bytes scanned for `SELECT *` vs selecting two columns with a date filter.
2. Explain why columnar storage helps analytical queries (say it out loud).
3. Describe the difference between a data lake, warehouse, and lakehouse to an imaginary interviewer.

> **Key takeaway:** **Warehouse** = structured, fast, governed; **lake** = cheap, raw, flexible; **lakehouse** = both via a table layer (Delta/Iceberg). Speed comes from **columnar storage + MPP**; cost/perf comes from **partitioning, clustering, and reading only what you need.**
