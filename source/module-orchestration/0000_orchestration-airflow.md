---
id: orchestration-airflow
section: modules
title: Orchestration with Airflow
level: Intermediate
minutes: 10
tags: airflow, pipelines, orchestration
---

A real data platform runs *many* pipelines, on schedules, with dependencies between them. **Orchestration** is the scheduling, sequencing, retrying, and monitoring of all those jobs. **Apache Airflow** is the most widely used orchestrator and a frequent interview topic.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Cooking a big dinner: you can't fry the rice before boiling it; some dishes can cook in parallel; if a pot burns you redo just that one. An orchestrator is the head chef directing the order, parallelism, and retries of every task.
</div>

## The core concept: a DAG
Airflow models a workflow as a **DAG** — a **Directed Acyclic Graph**:

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="arrowRight"></i></span><div><strong>Directed</strong><p>Tasks have a direction: A then B.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="refresh"></i></span><div><strong>Acyclic</strong><p>No loops — you can't depend on yourself, or it would never finish.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="network"></i></span><div><strong>Graph</strong><p>Tasks (nodes) connected by dependencies (edges).</p></div></div>
</div>

<div class="widget-mount" data-widget="dag"></div>

## A minimal Airflow DAG
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract():   print("pulling data...")
def transform(): print("cleaning data...")
def load():      print("loading to warehouse...")

with DAG(
    dag_id="daily_sales",
    schedule="0 2 * * *",          # cron: every day at 02:00
    start_date=datetime(2024, 1, 1),
    catchup=False,                 # don't backfill old missed runs
    default_args={"retries": 3},   # auto-retry failed tasks 3x
) as dag:

    e = PythonOperator(task_id="extract",   python_callable=extract)
    t = PythonOperator(task_id="transform", python_callable=transform)
    l = PythonOperator(task_id="load",      python_callable=load)

    e >> t >> l    # define dependencies: e then t then l
```
That `e >> t >> l` line is the magic: it tells Airflow the order. Tasks with no dependency between them run in **parallel**.

## Key concepts interviewers probe
- **Operator** — a template for one task (`PythonOperator`, `BashOperator`, cloud ones).
- **Schedule (cron)** — when it runs. `0 2 * * *` = 2 AM daily.
- **Retries / catchup** — auto-recover failures; backfill missed dates (often off).
- **Idempotency** — each run is safe to re-run (key around a "logical date").
- **XCom / Sensors** — pass small messages; *wait* for a condition (e.g. a file).

<div class="callout callout-note"><span class="cfor"></span><div><span class="ctitle">Why it matters:</span> dependencies, scheduling, observability, automatic retries + alerts, and clean backfills — all in one place.</div></div>

## Modern alternatives (good to name-drop)
Airflow is the incumbent, but know these too: **Dagster** and **Prefect** (more Pythonic, asset-aware), **dbt** (SQL transformation orchestration), and cloud-native options (**AWS Step Functions**, **Azure Data Factory**, **GCP Composer** = managed Airflow).

## Practice
1. Install Airflow locally (or use the official Docker compose) and run the example DAG.
2. Add a 4th task that depends on `load` and runs a data-quality check.
3. Make two tasks run in parallel, then converge into one.

> **Key takeaway:** Orchestration schedules and sequences pipelines. **Airflow** models workflows as **DAGs** of tasks with dependencies (`>>`), schedules (cron), retries, and monitoring — and tasks should be **idempotent** so reruns are safe.
