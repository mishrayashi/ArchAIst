---
id: cloud-for-de
section: modules
title: Cloud for Data Engineers (AWS/Azure/GCP)
level: Intermediate
minutes: 11
tags: cloud, aws, azure, gcp
---

Almost all serious data work runs on the **cloud**. You don't need to master all three providers — **learn one deeply**, and the concepts transfer. This lesson gives you the map and the vocabulary.

## The building blocks (same idea on every cloud)
| Concept | What it is | AWS | Azure | GCP |
|---------|-----------|-----|-------|-----|
| **Object storage** | Cheap bucket for any files (the data lake) | **S3** | **ADLS / Blob** | **GCS** |
| **Compute (VMs)** | Rentable machines | EC2 | VMs | Compute Engine |
| **Data warehouse** | Analytical SQL store | **Redshift** | **Synapse / Fabric** | **BigQuery** |
| **Managed Spark** | Big-data processing | EMR / Glue | Databricks / Synapse | Dataproc |
| **Serverless functions** | Run code without servers | Lambda | Functions | Cloud Functions |
| **Orchestration** | Schedule pipelines | MWAA (Airflow) | Data Factory | Cloud Composer |
| **Streaming** | Real-time events | Kinesis / MSK | Event Hubs | Pub/Sub |
| **Identity & access** | Permissions | IAM | Entra ID / RBAC | IAM |

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Which cloud to learn?</strong> Pick by job market in your area/target companies. <strong>AWS</strong> = largest overall market. <strong>Azure</strong> = enterprises/finance/Microsoft shops (great with Fabric + Databricks). <strong>GCP</strong> = data/AI-forward companies (BigQuery is loved). Any one is a fine bet; the patterns are 80% the same.</div></div>

## Object storage = the data lake
The foundation of cloud data engineering is **object storage** (S3 and friends): dirt-cheap, virtually unlimited, stores *any* file (CSV, Parquet, JSON, images). You organise data into "buckets" and folder-like "prefixes." A **data lake** is essentially "all our raw data, well-organised, in object storage."

```text
s3://company-lake/
  bronze/orders/dt=2024-05-30/part-0001.parquet
  silver/orders/...
  gold/daily_sales/...
```
Storing as **Parquet** (columnar, compressed) instead of CSV makes queries far cheaper and faster.

## IAM — permissions (don't skip; interviewers ask)
**IAM (Identity and Access Management)** controls *who* can do *what* to *which* resource. Core ideas:
- **Principal** (user/role/service) → is granted **permissions** (actions) → on **resources**.
- **Roles** are assumed by services (e.g. a Spark job assumes a role that can read one bucket).
- **Principle of least privilege:** grant only the minimum access needed. This is the #1 cloud security rule.

## Cost awareness — a real engineering skill
Cloud bills explode without care. Control it: **cold storage tiers**, **right-size + auto-terminate** compute, **partition + columnar** formats (scan-billed engines charge by bytes!), and **spot VMs** for batch.

## A typical cloud data architecture
The same shape on every cloud — storage → compute → warehouse → serve:

<div class="widget-mount" data-widget="pipeline"></div>

Scheduled by an orchestrator (Airflow/Composer/Data Factory), secured by **IAM**.

## Getting hands-on for free
All three clouds have **free tiers**. Good first exercises:
1. Create a storage bucket, upload a Parquet file.
2. Query files directly with a serverless engine (Athena / BigQuery external table).
3. Run a tiny managed-Spark or serverless-function job.
4. Set up an IAM role with least-privilege access to your bucket.

Optional but valued: a **cloud certification** (e.g. AWS Data Engineer Associate, GCP Professional Data Engineer, Azure DP-203) signals commitment to recruiters — but **projects matter more**.

> **Key takeaway:** Learn one cloud deeply. The pattern is always: **object storage (lake) → compute (Spark/serverless) → warehouse → BI/ML**, scheduled by an orchestrator and secured by **IAM** with least privilege. Design for cost: columnar formats, partitioning, and auto-terminating compute.
