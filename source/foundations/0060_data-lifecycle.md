---
id: data-lifecycle
section: foundations
title: The data lifecycle — the big picture
level: Beginner
minutes: 8
tags: pipelines, must-know
---

Before diving into roles and tools, see the **whole journey** data takes inside a company. Almost every data job is *one stage* of this pipeline. Understanding the map tells you where each role fits.

<div class="widget-mount" data-widget="pipeline"></div>

```text
   SOURCES          INGEST          STORE           TRANSFORM        SERVE
 ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐
 │ Apps    │     │ Collect │     │ Data lake│     │ Clean    │    │ Dashboards│
 │ Sensors │ ──▶ │ & load  │ ──▶ │ + Data   │ ──▶ │ join,    │──▶ │ ML models │
 │ Files   │     │ (batch/ │     │ warehouse│     │ aggregate│    │ AI apps   │
 │ APIs    │     │ stream) │     │          │     │ model    │    │ reports   │
 └─────────┘     └─────────┘     └──────────┘     └──────────┘    └──────────┘
```

## The five stages

1. **Generate / Source** — data is created: a user buys something, a sensor records temperature, an app logs a click.
2. **Ingest** — we *collect* that data and bring it into our systems. Either in big scheduled batches (**batch**) or continuously as it happens (**streaming**).
3. **Store** — we keep it somewhere reliable: a **data lake** (cheap storage for raw everything) and/or a **data warehouse** (organised tables for analysis).
4. **Transform** — the heart of data engineering: clean it, fix errors, join tables, aggregate, and model it into a useful shape. This is **ETL / ELT** (you'll learn this deeply later).
5. **Serve** — deliver the finished data to the people and systems that use it: business dashboards, machine-learning models, and AI applications.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
It's a water supply system. Rain (sources) is collected into reservoirs (ingest + store), filtered and treated (transform), then piped clean to your tap (serve). A <strong>data engineer</strong> builds and maintains these pipes. A <strong>data scientist / AI engineer</strong> uses the clean water to make something valuable.
</div>

## Where the roles live on this map

| Stage | Who works here |
|-------|----------------|
| Ingest, Store, Transform | **Data Engineer**, **AI Data Engineer** |
| Serve → ML models | **Data Scientist**, **ML Engineer** |
| Serve → AI/LLM apps | **GenAI Engineer**, **LLM Engineer** |
| Serve → dashboards/reports | **Data Analyst** |

This is why data engineering is called the **foundation**: nothing downstream works if the pipes are broken. "Garbage in, garbage out" — even the smartest AI fails on dirty data.

> **Key takeaway:** Data flows Source → Ingest → Store → Transform → Serve. Each role owns part of this pipeline. Engineers build the pipes; scientists and AI engineers use what comes out. Next, let's pin down exactly what each role does.
