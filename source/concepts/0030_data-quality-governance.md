---
id: data-quality-governance
section: concepts
title: Data quality & governance
level: Intermediate
minutes: 9
tags: data quality, governance
---

"Garbage in, garbage out." A pipeline that delivers *wrong* data fast is worse than no pipeline. **Data quality** and **governance** are what make data *trustworthy* — and they're increasingly asked about in interviews (especially in finance, healthcare, and government work).

## The six dimensions of data quality
Memorise these — they're a great structured answer to "how do you ensure data quality?":
1. **Accuracy** — does it reflect reality? (Is the price actually ₹500?)
2. **Completeness** — are required values present? (No missing customer IDs.)
3. **Consistency** — does it agree across systems? (Same total in two reports.)
4. **Timeliness / Freshness** — is it up to date? (Today's data loaded by 8am.)
5. **Validity** — does it match the rules/format? (Email looks like an email; date is a real date.)
6. **Uniqueness** — no unintended duplicates. (One row per order.)

## How you actually enforce quality
- **Schema validation:** types, nullability, allowed values, primary-key uniqueness, referential integrity.
- **Business-rule checks:** "amount > 0", "end_date ≥ start_date", "country in valid ISO list."
- **Reconciliation:** row counts and totals match between source and destination.
- **Anomaly/freshness monitoring:** alert if today's row count is wildly off, or data is late.
- **Severity levels:** *fail* (stop the pipeline), *warn* (continue but flag), *info* (log). Write failures to an audit table with rule id, batch id, and sample bad rows.

Tools: **Great Expectations**, **dbt tests**, **Soda**, **Deequ** (Spark). In code, even simple assertions help:
```python
assert df["amount"].min() >= 0,            "negative amounts found"
assert df["order_id"].is_unique,           "duplicate order_ids"
assert df["customer_id"].notnull().all(),  "missing customer_ids"
```

## Data governance — the bigger umbrella
**Governance** is the policies and controls for managing data as an asset:
- **Lineage:** where did this data come from, and what transformed it? (Trace a number back to source.) Tools like **Unity Catalog**, OpenLineage, DataHub.
- **Cataloging & metadata:** a searchable inventory of datasets, owners, and definitions.
- **Access control & security:** who can see what; row/column-level security; encryption.
- **Privacy & compliance:** GDPR, HIPAA, PII handling, masking, retention policies, audit logs.
- **Ownership / stewardship:** a named owner accountable for each dataset's quality.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Interview gold:</strong> "I treat data quality as code — versioned tests (schema + business rules) that run in the pipeline, with severity levels, an audit table for failures, and freshness/volume alerts. For governance I rely on a catalog for lineage and least-privilege access control." This one answer signals real-world maturity.</div></div>

> **Key takeaway:** Trust = quality + governance. Quality has six dimensions (accuracy, completeness, consistency, timeliness, validity, uniqueness), enforced by automated tests with severity levels and alerting. Governance adds lineage, cataloging, access control, and compliance.
