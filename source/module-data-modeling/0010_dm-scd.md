---
id: dm-scd
section: modules
title: Data Modeling 2 — SCD (Slowly Changing Dimensions)
level: Intermediate
minutes: 12
tags: scd, data modeling, must-know
---

**SCD = Slowly Changing Dimensions.** This is one of the most-asked data-engineering interview topics — and many experienced engineers explain it poorly. Master it and you'll stand out.

## The problem SCD solves
Dimension attributes change over time: a customer moves city, a product changes category, a salesperson changes region. **When the value changes, do we overwrite history or keep it?** How you answer defines the SCD *type*.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Ravi lived in Mumbai, then moved to Pune. You have 2023 sales (Mumbai) and 2024 sales (Pune). If someone asks "how much did Mumbai sell in 2023?", do your records still say Ravi was in Mumbai back then — or did moving him to Pune silently rewrite the past? SCD is the set of strategies for handling exactly this.
</div>

## The SCD types

### SCD Type 0 — never change
The value is fixed forever (e.g. original signup date, date of birth). Ignore updates.

### SCD Type 1 — overwrite (no history)
Just update the value in place. Simple, but **history is lost**. Good when old value has no analytical meaning (fixing a typo, correcting an email).
```text
Before:  cust_id=1, name=Ravi, city=Mumbai
After:   cust_id=1, name=Ravi, city=Pune      ← Mumbai is gone forever
```

### SCD Type 2 — add a new row (full history) ⭐ most important
Keep the old row, add a **new row** for the new value, and use metadata columns to mark which is current. **This is the one interviewers care about most.**

<div class="widget-mount" data-widget="scd2"></div>

```text
| sk | cust_id | name | city   | start_date | end_date   | is_current |
|----|---------|------|--------|------------|------------|------------|
| 10 | 1       | Ravi | Mumbai | 2022-01-01 | 2023-12-31 |   false    |
| 27 | 1       | Ravi | Pune   | 2024-01-01 | 9999-12-31 |   true     |
```
- `sk` = **surrogate key** (a brand-new key per version — this is why warehouses use surrogate keys!).
- `start_date` / `end_date` = the period this version was valid.
- `is_current` = quick flag for the latest version.

Now `fact_sales` rows from 2023 point to `sk=10` (Mumbai) and 2024 rows point to `sk=27` (Pune). History is **perfectly preserved** — Mumbai 2023 still totals correctly.

### SCD Type 3 — keep limited history (previous value column)
Add a `previous_city` column. You can see the current *and* one prior value, but not full history. Rare; used when you only ever care about "before and after one change."
```text
| cust_id | current_city | previous_city |
|---------|--------------|---------------|
| 1       | Pune         | Mumbai        |
```

### Type 4 & 6 (know they exist)
- **Type 4:** current values in the main dim, full history in a separate *history* table.
- **Type 6:** a hybrid combining 1 + 2 + 3 (the "1+2+3=6" mnemonic) — Type 2 rows *plus* a current-value column.

## Quick comparison

| Type | History kept | How | When to use |
|------|--------------|-----|-------------|
| 0 | n/a | never update | truly fixed attributes |
| 1 | none | overwrite | corrections, history irrelevant |
| **2** | **full** | **new row + dates + flag** | **most dimensions; the default for "track changes"** |
| 3 | one prior | extra column | only "previous vs current" matters |
| 4 | full | separate history table | high-churn dims |
| 6 | full + current | hybrid | advanced reporting needs |

## How SCD Type 2 is implemented (the MERGE)
In SQL/Spark you typically run a **MERGE** (upsert): when an attribute changes, expire the old current row and insert a new one.

<div class="flow flow-row">
  <div class="flow-node"><strong>Match</strong><span>current row by key</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Expire</strong><span>is_current=false, set end_date</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Insert</strong><span>new current version</span></div>
</div>

```sql
-- Simplified SCD2 logic
MERGE INTO dim_customer AS tgt
USING staging_customer AS src
ON tgt.cust_id = src.cust_id AND tgt.is_current = true
WHEN MATCHED AND tgt.city <> src.city THEN
  UPDATE SET tgt.is_current = false, tgt.end_date = current_date
-- then a separate INSERT adds the new current version
;
```
In practice, tools like **dbt snapshots** or **Delta Lake MERGE** automate SCD2 for you — but interviewers want to see you understand the mechanics above.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Interview answer template:</strong> "SCD handles how we track changes in dimension attributes. Type 1 overwrites and loses history; Type 2 — the most common — adds a new row with start/end dates and an is_current flag, using surrogate keys so facts can point to the version that was valid at the time. We usually implement it with a MERGE/upsert or a dbt snapshot."</div></div>

> **Key takeaway:** SCD = strategies for changing dimension data. **Type 1 = overwrite** (no history), **Type 2 = new versioned row** (full history, surrogate keys, start/end/is_current). Type 2 is *the* answer to know cold.
