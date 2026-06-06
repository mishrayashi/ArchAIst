---
id: spark-basics
section: modules
title: Spark / PySpark — processing big data
level: Intermediate
minutes: 13
tags: spark, pyspark, big data, must-know
---

When data is too big for one machine (or pandas runs out of memory), you use **Apache Spark** — the standard engine for processing huge datasets across many machines at once. **PySpark** is its Python interface. This is a top interview topic for data engineers.

## The core idea: distributed processing
Spark splits your data into **partitions** and processes them **in parallel** across a **cluster**. One *driver* coordinates; many *executors* do the work. You write code as if on one machine; Spark handles the distribution.

<div class="flow flow-row">
  <div class="flow-node"><strong>Driver</strong><span>plans &amp; coordinates</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Partitions</strong><span>data split into chunks</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Executors</strong><span>process in parallel</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Result</strong><span>combined back</span></div>
</div>

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Counting votes in a country: one person counting all ballots takes forever. Instead, split ballots across 1,000 counters (partitions on executors), each counts their pile, then you sum the totals (a "shuffle"/reduce). Spark is the system that organises those 1,000 counters.
</div>

## The Spark DataFrame
Like a pandas DataFrame, but distributed. Same mental model, different scale.
```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.appName("demo").getOrCreate()

df = spark.read.parquet("s3://bucket/sales/")   # reads across the cluster

df.printSchema()
df.show(5)
print(df.count())
```

## Transformations vs Actions — the #1 Spark concept
- **Transformations** (`select`, `filter`, `groupBy`, `join`, `withColumn`) are **lazy** — they don't run immediately. Spark just builds a *plan*.
- **Actions** (`show`, `count`, `collect`, `write`) **trigger** the actual computation.

<div class="widget-mount" data-widget="sparkLazy"></div>

```python
# These transformations build a plan but run NOTHING yet:
clean = (df
    .filter(F.col("amount") > 0)
    .withColumn("amount_with_tax", F.col("amount") * 1.18)
    .groupBy("city")
    .agg(F.sum("amount").alias("total")))

clean.show()   # <-- THIS action triggers the whole plan to execute
```

<div class="callout callout-note"><span class="cfor">🔑</span><div><strong>Why lazy evaluation matters:</strong> because Spark sees the whole plan before running, it can <em>optimise</em> it (via the Catalyst optimizer) — reorder filters, combine steps, minimise data movement. A great interview answer.</div></div>

## The DAG: stages & tasks
That "plan" is a **DAG** — a **D**irected (data flows one way) **A**cyclic (no loops) **G**raph of your transformations. Spark builds it lazily and only runs it when an **action** fires.

<div class="flow flow-row">
  <div class="flow-node"><strong>DAG</strong><span>your transformations as a graph</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Stages</strong><span>split at every shuffle boundary</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Tasks</strong><span>one per partition, run in parallel</span></div>
</div>

**Narrow vs wide dependencies** decide where the stages split:
- **Narrow** — each parent partition feeds **one** child partition, so no data moves. e.g. `map`, `filter`, `select`, `withColumn`. Stays in the same stage.
- **Wide** — a child partition needs data from **many** parent partitions, forcing a **shuffle** across the cluster. e.g. `groupBy`, `join`, `distinct`. **Every wide dependency starts a new stage.**

So the whole execution model in one line: **DAG → split into stages at each shuffle → each stage runs as parallel tasks, one per partition.**

## Common operations
```python
df.select("name", "amount")
df.filter(F.col("city") == "Mumbai")
df.withColumn("year", F.year("order_date"))
df.groupBy("city").agg(F.sum("amount"), F.avg("amount"))
df.orderBy(F.desc("amount"))
df.dropDuplicates(["order_id"])
df.na.fill(0)                       # fill nulls

# Joins
orders.join(customers, orders.cust_id == customers.id, "inner")
```

## The "shuffle" — where performance is won or lost
Operations like `groupBy`, `join`, and `distinct` need to move data between machines so matching keys end up together. This movement is a **shuffle** — it's expensive (network + disk). Minimising shuffles is the heart of Spark tuning.

Key performance levers:

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="grid"></i></span><div><strong>Partitioning</strong><p>~128MB partitions keep executors busy; too few idle machines, too many overhead.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="zap"></i></span><div><strong>Broadcast join</strong><p>Send a small table to every executor to skip a big shuffle: <code>orders.join(F.broadcast(small_dim), "key")</code>.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Avoid collect()</strong><p>On big data it pulls everything to the driver and can crash it.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="target"></i></span><div><strong>Filter &amp; select early</strong><p>Fewer rows and columns means less data shuffled.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="chart"></i></span><div><strong>Watch data skew</strong><p>If one key holds 90% of rows, one executor does all the work while others idle.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="refresh"></i></span><div><strong>Cache reuse</strong><p><code>df.cache()</code> a DataFrame you read many times.</p></div></div>
</div>

## RDD vs DataFrame
- **RDD** = the old, low-level API (raw distributed objects). Flexible but no automatic optimisation.
- **DataFrame / SQL** = the modern, high-level API. Optimised by Catalyst, faster, and what you should use 99% of the time. (Interviewers like hearing "I default to DataFrames because Catalyst optimises them; I only drop to RDDs for rare low-level needs.")

## Spark SQL — write SQL on big data
```python
df.createOrReplaceTempView("sales")
spark.sql("""
  SELECT city, SUM(amount) AS total
  FROM sales WHERE amount > 0
  GROUP BY city ORDER BY total DESC
""").show()
```

## Writing output (partitioned for speed)
```python
(clean.write
    .mode("overwrite")
    .partitionBy("city")          # creates city=Mumbai/, city=Delhi/ folders
    .parquet("s3://bucket/gold/city_sales/"))
```
Partitioning output by a common filter column (like date or city) means future queries scan only the folders they need — huge speedups. Pick a month below and watch the engine **skip** the folders it doesn't need (this is *partition pruning*, a favourite interview topic):

<div class="widget-mount" data-widget="partition"></div>

## Delta Lake / Lakehouse (you'll hear this constantly)
**Delta Lake** adds database-like reliability to files in a data lake: ACID transactions, schema enforcement, time travel, and efficient **MERGE** (great for SCD2). The "lakehouse" idea = the cheap storage of a lake + the reliability of a warehouse. Databricks is the main vendor.

## Practice
1. Read a CSV into Spark, filter, group by a column, write to Parquet.
2. Explain (out loud) the difference between a transformation and an action.
3. Describe when you'd use a broadcast join.

> **Key takeaway:** Spark processes huge data in parallel across a cluster. Master **transformations (lazy) vs actions (trigger)**, **shuffles** and how to minimise them (broadcast joins, partitioning, avoiding skew), and prefer **DataFrames/SQL** over RDDs.
