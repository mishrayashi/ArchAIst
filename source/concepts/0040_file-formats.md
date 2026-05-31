---
id: file-formats
section: concepts
title: File formats: CSV, Parquet, Avro, ORC, JSON
level: Beginner
minutes: 7
tags: file formats, parquet
---

A small topic with outsized interview value: **why do data engineers prefer Parquet over CSV?** Knowing file formats shows you understand storage and performance.

## Row vs Columnar storage
- **Row-based** stores all of row 1, then all of row 2… Great for writing/reading whole records (operational apps).
- **Columnar** stores all values of column A together, then column B… Great for analytics, where you read a few columns across millions of rows.

```text
Row:      [1,Ravi,Mumbai][2,Sara,Delhi]      ← read a whole record fast
Columnar: [1,2][Ravi,Sara][Mumbai,Delhi]     ← read just 'city' fast, compress well
```

## The formats you'll meet
| Format | Type | Best for | Notes |
|--------|------|----------|-------|
| **CSV** | Row, text | Tiny data, sharing, human-readable | No types, no compression, slow, error-prone |
| **JSON** | Row, text | APIs, semi-structured/nested data | Flexible, verbose, not for big analytics |
| **Parquet** | **Columnar, binary** | **Analytics in lakes/Spark** ⭐ | Compressed, typed, fast, the default in data engineering |
| **ORC** | Columnar, binary | Analytics (Hive ecosystem) | Similar to Parquet, common with Hive |
| **Avro** | Row, binary | Streaming/Kafka, schema evolution | Row-based; great for write-heavy + evolving schemas |

## Why Parquet wins for analytics
1. **Columnar** → reads only needed columns (less I/O).
2. **Compression** → columns of similar values compress extremely well (smaller = cheaper, faster).
3. **Typed + schema embedded** → no guessing types like CSV.
4. **Predicate/column pushdown** → engines skip irrelevant data using built-in stats (min/max per chunk).
5. **Splittable** → multiple workers read one file in parallel.

<div class="callout callout-note"><span class="cfor">🔑</span><div><strong>Rule of thumb:</strong> CSV/JSON at the <em>edges</em> (ingesting from sources, sharing with humans); <strong>Parquet</strong> everywhere <em>inside</em> your lake/warehouse for analytics; <strong>Avro</strong> for streaming/Kafka where you write constantly and schemas change. Table formats <strong>Delta/Iceberg/Hudi</strong> sit on top of Parquet to add ACID transactions.</div></div>

```python
import pandas as pd
df = pd.read_csv("data.csv")          # ingest from source
df.to_parquet("data.parquet")         # store columnar for analytics
# A 1GB CSV often becomes ~100-200MB as Parquet, and queries run many times faster.
```

> **Key takeaway:** Use **Parquet** (columnar, compressed, typed) for analytical data in lakes/warehouses; **CSV/JSON** only at the edges; **Avro** for streaming. **Delta/Iceberg** add ACID on top of Parquet. "Why Parquet over CSV?" = columnar + compression + types + pushdown.
