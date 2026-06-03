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
Checks run *inside* the pipeline as a **gate** — bad rows get caught before they reach Gold. Toggle the checks below:

<div class="widget-mount" data-widget="dataQuality"></div>

In practice: schema validation, business rules (`amount > 0`), reconciliation (counts match source↔destination), and freshness alerts — each with a **severity** (*fail* stops the run, *warn* flags, *info* logs) and failures written to an audit table.

Tools: **Great Expectations**, **dbt tests**, **Soda**, **Deequ** (Spark). Even simple assertions help:
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
