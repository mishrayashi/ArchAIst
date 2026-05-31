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
- **Directed:** tasks have a direction (A then B).
- **Acyclic:** no loops (you can't depend on yourself — it would never finish).
- **Graph:** tasks (nodes) connected by dependencies (edges).

```text
extract ──▶ transform ──▶ load ──▶ quality_check
                  │
                  └────▶ send_report
```

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
- **Operator:** a template for one task. `PythonOperator`, `BashOperator`, `SQLExecuteQueryOperator`, plus cloud-specific ones (run a Spark job, load BigQuery, etc.).
- **Task vs Task Instance:** a *task* is the definition; a *task instance* is one run of it for a specific date.
- **Schedule (cron):** when the DAG runs. `0 2 * * *` = 2 AM daily.
- **Retries & retry_delay:** auto-recover from transient failures.
- **Backfill / catchup:** running the DAG for past dates it "missed." Often disabled to avoid surprise load.
- **Idempotency:** each run should be safe to re-run (ties back to the ETL lesson!). Design tasks around a "logical date" so reruns overwrite the right partition.
- **XCom:** small messages passed between tasks (don't pass big data through it — pass *pointers* like a file path).
- **Sensors:** tasks that *wait* for a condition (e.g. a file to land) before proceeding.

## Why orchestration matters (the value)
- **Dependencies:** guarantees transform never runs before extract finishes.
- **Scheduling:** runs reliably without a human clicking buttons.
- **Observability:** a UI showing what ran, what failed, how long it took.
- **Recovery:** automatic retries + alerting (email/Slack) on failure.
- **Backfilling:** reprocess history cleanly when logic changes.

## Modern alternatives (good to name-drop)
Airflow is the incumbent, but know these exist: **Dagster** and **Prefect** (more Pythonic, asset-aware), **dbt** (transformation orchestration in SQL), and cloud-native ones (**AWS Step Functions**, **Azure Data Factory**, **GCP Composer** = managed Airflow).

## Practice
1. Install Airflow locally (or use the official Docker compose) and run the example DAG.
2. Add a 4th task that depends on `load` and runs a data-quality check.
3. Make two tasks run in parallel, then converge into one.

> **Key takeaway:** Orchestration schedules and sequences pipelines. **Airflow** models workflows as **DAGs** of tasks with dependencies (`>>`), schedules (cron), retries, and monitoring — and tasks should be **idempotent** so reruns are safe.
