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
Analytical queries usually touch *a few columns across millions of rows* ("total sales by month"). **Columnar storage** stores each column together, so the engine reads only the columns you ask for — skipping the rest. This (plus compression and parallelism) is why warehouses crush analytical queries. **Parquet** is the columnar file format you'll use in lakes.

```text
Row storage (slow for analytics):  [id,name,amt][id,name,amt][id,name,amt]
Columnar storage (fast):           [id,id,id][name,name,name][amt,amt,amt]
                                                              ▲ read only this
```

## MPP — Massively Parallel Processing
Warehouses like Redshift/BigQuery/Snowflake split work across many nodes that each handle a slice of the data, then combine results. That's how they query terabytes in seconds. The key design implication for *you*: distribute data well and minimise data shuffling between nodes (same idea as Spark).

## Key vendor concepts
- **Snowflake:** separates *storage* from *compute* — independent "virtual warehouses" (compute clusters) scale up/down per workload; you pay for compute by the second. Loved for ease of use.
- **BigQuery (GCP):** serverless — no clusters to manage; you're billed mainly by **bytes scanned**, so partitioning/clustering and selecting few columns directly saves money.
- **Redshift (AWS):** node-based MPP; performance depends on good **distribution keys** and **sort keys**.
- **Databricks + Delta Lake:** the lakehouse — Spark + a transactional table layer (ACID, time travel, MERGE) over your lake files.

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
