---
id: lakehouse-cheatsheet
section: concepts
title: Modern lakehouse cheat-sheet (Delta & Databricks)
level: Intermediate
minutes: 7
tags: lakehouse, databricks, delta, reference, must-know
---

The lakehouse vocabulary that shows up in every modern data interview — each need mapped to the feature that solves it. Skim it, then dig into the ones you don't recognise.

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Delta Lake</strong><p>ACID tables on cheap object storage — the foundation.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="building"></i></span><div><strong>Unity Catalog</strong><p>One place for governance, lineage &amp; access control.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="zap"></i></span><div><strong>Photon</strong><p>Vectorized C++ engine — faster SQL &amp; DataFrame queries.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="refresh"></i></span><div><strong>Auto Loader</strong><p>Incremental file ingestion with schema evolution.</p></div></div>
</div>

## Use case → feature

| Use case | Feature / command |
|----------|-------------------|
| ACID transactions on files | **Delta Lake** |
| Insert-or-update on a key | **MERGE INTO** (upsert) |
| Delete / update rows cheaply | **DELETE / UPDATE** + **deletion vectors** (no full rewrite) |
| Roll back or read old data | **Time travel** — `VERSION AS OF` / `TIMESTAMP AS OF` |
| Compact small files | **OPTIMIZE** (+ Auto-Compaction) |
| Faster reads via clustering | **Z-ORDER** → now **Liquid Clustering** |
| Skip irrelevant data | **Data skipping** (file statistics) |
| Remove stale files | **VACUUM** |
| Incremental file ingestion | **Auto Loader** (`cloudFiles`) |
| Capture row-level changes | **Change Data Feed (CDF)** |
| Continuous processing | **Structured Streaming** |
| Governance, lineage, discovery | **Unity Catalog** |
| Column / row security | **Dynamic views & column masks** |
| Faster query engine | **Photon** |
| Orchestration | **Workflows / Jobs** |
| Layered refinement | **Medallion** — Bronze → Silver → Gold |
| Reusable ML features | **Feature Store** |
| Experiment tracking | **MLflow** |
| Cost control | **Cluster policies + autoscaling** |
| Monitoring | **System tables + Query History** |

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Interview gold:</strong> when asked "how would you do X on the lakehouse?", name the <em>feature</em> and the <em>why</em> — e.g. "Incremental loads → Auto Loader, because it tracks only new files and evolves the schema, so I'm not rescanning the whole bucket."</div></div>

> **Key takeaway:** The lakehouse = cheap lake storage + warehouse reliability (**Delta**) + governance (**Unity Catalog**) + a fast engine (**Photon**). Most "Databricks" interview questions are really *"which feature solves this?"* — this table is your map.
