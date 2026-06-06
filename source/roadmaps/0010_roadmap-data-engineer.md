---
id: roadmap-data-engineer
section: roadmaps
title: Roadmap: Zero → Data Engineer
level: Beginner
minutes: 10
tags: roadmap, data engineer
---

Here's the whole journey in one place — from your very first line of Python to walking into interviews as a job-ready Data Engineer. Thousands have made it along this exact path, and you can too. Take it one phase at a time: each one quietly sets up the next, so trust the order and resist the urge to skip ahead. Every step links to the precise lessons to study, so you'll never be left wondering what to do next.

## Phase 1 — Foundations (Weeks 1–4)
- Finish the **Foundations** section here (you may already have).
- **Python basics:** variables, types, lists/dicts, loops, conditions, functions, files. → *Python module*
- **SQL basics:** SELECT, WHERE, JOIN, GROUP BY, aggregates. → *SQL module*
- Set up **Git/GitHub**; commit code daily.
- **Mini project:** read a CSV with Python, clean it, load it into a local PostgreSQL/SQLite database, and run 5 analytical queries.

## Phase 2 — Core data skills (Weeks 5–10)
- **Advanced SQL:** window functions, CTEs, subqueries, query optimisation. → *SQL module*
- **Python for data:** `pandas`, working with APIs, JSON, error handling. → *Python module*
- **Data modelling:** normalization, star vs snowflake schema, fact/dimension tables, **SCD types**. → *Data Modeling module*
- **ETL/ELT concepts:** what a pipeline is, idempotency, incremental loads. → *ETL module*
- **Project:** build a small ETL pipeline — pull from a public API daily, transform with pandas, load into a warehouse-style schema.

## Phase 3 — Big data & cloud (Weeks 11–18)
- **Apache Spark / PySpark:** distributed processing, transformations vs actions, partitioning. → *Spark module*
- **One cloud (pick AWS *or* Azure *or* GCP):** object storage, compute, IAM basics, a managed warehouse. → *Cloud module*
- **A data warehouse:** Snowflake or BigQuery — loading, modelling, performance. → *Warehouse module*
- **Orchestration:** Apache Airflow — DAGs, scheduling, retries, dependencies. → *Orchestration module*
- **Project (the big one):** an end-to-end pipeline — ingest → store in cloud → transform with Spark/SQL → load to warehouse → orchestrate with Airflow → simple dashboard. *This single project can get you hired.*

## Phase 4 — Production & streaming (Weeks 19–24)
- **Streaming basics:** Kafka, batch vs stream, exactly-once ideas. → *Streaming module*
- **dbt** for transformation-as-code; **data quality & testing**.
- **Docker** basics; **CI/CD** awareness.
- **System design:** **HLD & LLD** for data systems — how to design a pipeline on a whiteboard. → *Concepts*

## Phase 5 — Job hunt (ongoing from Week 16)
- Polish **GitHub** + a 1-page resume that leads with projects and numbers.
- Drill the **Interview Bank**: SQL, Spark, data modelling, pipeline design, and your target **companies**.
- Practise explaining your projects with the **Problem → Approach → Result** structure.
- Apply broadly; do mock interviews; iterate on feedback.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>The 80/20:</strong> SQL + Python + one cloud + Spark + Airflow + one strong end-to-end project covers the vast majority of junior DE interviews. Don't get stuck collecting tools you never use.</div></div>

## Your clickable study track
Work straight through these lessons, in order:
1. [Foundations — data, databases, programming, cloud, AI](#/page/welcome)
2. [Python 1 — basics](#/page/py-basics) · [Python 2 — pandas](#/page/py-data)
3. [SQL 1 — querying](#/page/sql-basics) · [SQL 2 — windows & CTEs](#/page/sql-advanced)
4. [Data modeling](#/page/dm-fundamentals) · [SCD types](#/page/dm-scd)
5. [ETL & ELT](#/page/etl-concepts) · [Spark / PySpark](#/page/spark-basics)
6. [Cloud](#/page/cloud-for-de) · [Warehouses & lakehouse](#/page/warehouse-basics)
7. [Airflow orchestration](#/page/orchestration-airflow) · [Streaming & Kafka](#/page/streaming-kafka)
8. [System design: HLD/LLD](#/page/hld-lld) · [Data quality & governance](#/page/data-quality-governance)
9. Drill the [Interview Bank](#/interview) — filter role = Data Engineer

> **Key takeaway:** Foundations → core (SQL/Python/modelling/ETL) → big data & cloud → production/streaming → job hunt. One excellent end-to-end project is worth more than ten tutorials.
