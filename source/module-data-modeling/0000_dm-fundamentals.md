---
id: dm-fundamentals
section: modules
title: Data Modeling 1 — schemas & dimensions
level: Beginner
minutes: 12
tags: data modeling, warehouse, must-know
---

**Data modelling** is deciding *how to organise tables* so data is correct, fast to query, and easy to understand. Good modelling is the difference between a warehouse people love and one nobody trusts. It's a core interview topic for data engineers.

## Two worlds: OLTP vs OLAP
| | OLTP (operational) | OLAP (analytical) |
|---|---|---|
| Purpose | Run the app (orders, logins) | Analyse data (reports, ML) |
| Pattern | Many tiny reads/writes | Few huge reads |
| Design goal | Avoid duplication (**normalize**) | Fast reads (**denormalize**) |
| Example | The orders table in a shop's app | The sales warehouse for analytics |

Operational databases are **normalized**; analytical warehouses are often **denormalized** into a *star schema*. Let's see both.

## Normalization (OLTP) — no duplicated data
**Normalization** means splitting data into related tables so each fact is stored *once*. This prevents update anomalies (changing a customer's city in 1,000 order rows).

<div class="widget-mount" data-widget="normalization"></div>

The three you must know build on each other — each form assumes the one inside it:

<div class="nest"><div class="nest-l nest-1"><span class="nest-t">3NF</span><em>no transitive dependencies — no non-key column depends on another non-key column</em>
  <div class="nest-l nest-2"><span class="nest-t">2NF</span><em>every non-key column depends on the whole primary key (matters for composite keys)</em>
    <div class="nest-l nest-3"><span class="nest-t">1NF</span><em>each cell holds a single value; no repeating groups (no "phone1, phone2, phone3" columns)</em></div>
  </div>
</div></div>

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Instead of writing a customer's full address on every single order, you store the customer once in a <code>customers</code> table and just reference their <code>id</code> on each order. Change the address in one place; everything stays correct.
</div>

## Dimensional modelling (OLAP) — the star schema
For analytics we deliberately reorganise into **facts** and **dimensions** — the *star schema* (Kimball method).

<div class="widget-mount" data-widget="starSchema"></div>

- **Fact table** = the *measurements/events*, mostly numbers + foreign keys. Long and thin. e.g. `fact_sales` (one row per sale: amount, quantity, + keys to date/product/customer/store).
- **Dimension tables** = the *descriptive context* you slice by. Wide and short. e.g. `dim_product` (name, category, brand), `dim_date`, `dim_customer`, `dim_store`.

```text
        dim_date
            |
dim_customer — fact_sales — dim_product
            |
        dim_store
```

```sql
-- A star-schema query feels natural: facts joined to dimensions
SELECT d.month, p.category, SUM(f.amount) AS revenue
FROM fact_sales f
JOIN dim_date    d ON f.date_key    = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.month, p.category;
```

**Star vs Snowflake schema:**
- **Star:** flat (denormalized) dimensions. Simple, fast, fewer joins. *Default choice.*
- **Snowflake:** dimensions split further into sub-tables (normalized). Saves space but adds joins and complexity. Use only when dimensions are huge.

## Keys
- **Primary key (PK):** uniquely identifies a row (e.g. `customer_id`).
- **Foreign key (FK):** a column pointing to another table's PK (links fact → dimension).
- **Natural key:** a real-world id (email, SSN). **Surrogate key:** a meaningless system-generated id (1,2,3…). Warehouses prefer **surrogate keys** — they're stable even when source ids change, and they're essential for tracking history (next lesson).

## Grain — the most important modelling decision
The **grain** of a fact table is *what one row represents*. "One row per order line item." "One row per daily account balance." Decide the grain first, write it down, and never mix grains in one table. Wrong grain = wrong numbers.

> **Key takeaway:** Normalize operational databases (no duplication); use a denormalized **star schema** (facts + dimensions, surrogate keys, clear grain) for analytics. This vocabulary is interview bread-and-butter.
