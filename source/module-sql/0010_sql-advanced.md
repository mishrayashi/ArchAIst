---
id: sql-advanced
section: modules
title: SQL 2 — windows, CTEs & optimisation
level: Intermediate
minutes: 13
tags: sql, code, must-know
---

Intermediate SQL is what separates "can query" from "got hired." These topics appear in nearly every data engineering interview.

## CTEs (Common Table Expressions) — readable building blocks
A CTE (`WITH ... AS`) names a temporary result so you can build complex queries step by step instead of nesting messy subqueries.
```sql
WITH customer_totals AS (
    SELECT cust_id, SUM(amount) AS total_spent
    FROM orders
    GROUP BY cust_id
)
SELECT c.name, ct.total_spent
FROM customer_totals ct
JOIN customers c ON c.id = ct.cust_id
WHERE ct.total_spent > 200;
```

## Window functions — the superpower
A **window function** computes across a set of rows *related to the current row*, **without collapsing** them like GROUP BY does. You keep every row *and* get an aggregate alongside it.

<div class="widget-mount" data-widget="windowFn"></div>

```sql
-- Running total of orders over time
SELECT
    id,
    amount,
    SUM(amount) OVER (ORDER BY id) AS running_total
FROM orders;

-- Rank customers' orders from biggest to smallest, per customer
SELECT
    cust_id,
    amount,
    ROW_NUMBER() OVER (PARTITION BY cust_id ORDER BY amount DESC) AS rn
FROM orders;
```

The pattern is `function() OVER (PARTITION BY ... ORDER BY ...)`:
- **PARTITION BY** = restart the calculation per group (like GROUP BY, but rows stay).
- **ORDER BY** = order within each partition (needed for running totals/ranking).

Key window functions to know:

| Function | Use |
|----------|-----|
| `ROW_NUMBER()` | Unique 1,2,3 per partition (great for "latest row per group") |
| `RANK()` / `DENSE_RANK()` | Ranking with ties |
| `LAG()` / `LEAD()` | Look at previous/next row (e.g. month-over-month change) |
| `SUM/AVG() OVER` | Running totals / moving averages |

**The classic "top N per group" query** (asked everywhere):
```sql
-- The single largest order per customer
WITH ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY cust_id ORDER BY amount DESC) AS rn
    FROM orders
)
SELECT * FROM ranked WHERE rn = 1;
```

## Subqueries
```sql
-- Customers who spent more than the average customer
SELECT name FROM customers
WHERE id IN (
    SELECT cust_id FROM orders
    GROUP BY cust_id
    HAVING SUM(amount) > (SELECT AVG(amount) FROM orders)
);
```

## NULL handling
```sql
SELECT COALESCE(phone, 'unknown') FROM customers;  -- replace NULLs
SELECT * FROM orders WHERE product IS NULL;        -- never use = NULL
```

## Query optimisation — interview gold
When asked "how would you make a slow query faster?", hit these:
1. **Indexes** — add an index on columns used in JOINs and WHERE filters. An index is like a book's index: the DB finds rows without scanning every page.
2. **Select only needed columns** — avoid `SELECT *` on wide tables.
3. **Filter early** — push `WHERE` conditions to reduce rows before joining/aggregating.
4. **Avoid functions on indexed columns** in WHERE (`WHERE YEAR(date)=2024` can't use the index; `WHERE date >= '2024-01-01'` can).
5. **Partition large tables** (by date) so the engine scans less.
6. **Read the EXPLAIN plan** — it shows whether the DB does a fast index seek or a slow full scan.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Interview tip:</strong> When they say "optimise this query," always say "first I'd run <code>EXPLAIN</code> to see the actual bottleneck." It signals real experience.</div></div>

## Practice
1. Use `ROW_NUMBER()` to get each customer's most recent order.
2. Use `LAG()` to compute the change in amount between consecutive orders.
3. Rewrite a nested subquery as a CTE for readability.

> **Key takeaway:** CTEs make queries readable; window functions let you rank and run totals without losing rows; and knowing indexes + EXPLAIN is how you answer optimisation questions convincingly.
