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
Spark splits your data into **partitions** and processes them **in parallel** across a **cluster** (many machines). One *driver* coordinates; many *executors* do the work. You write code as if on one machine; Spark handles the distribution.

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
- **Partitioning:** good partition sizes (~128MB) keep all executors busy; too few = idle machines, too many = overhead.
- **Broadcast join:** if one table is small, *broadcast* it to every executor to avoid a big shuffle: `orders.join(F.broadcast(small_dim), "key")`.
- **Avoid `collect()` on big data** — it pulls everything to the driver and can crash it.
- **Filter early, select only needed columns** — less data shuffled.
- **Watch for data skew** — if one key has 90% of rows, one executor does all the work while others idle.
- **Cache** (`df.cache()`) a DataFrame you reuse many times.

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
