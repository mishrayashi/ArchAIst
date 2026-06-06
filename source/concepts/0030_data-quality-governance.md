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

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="target"></i></span><div><strong>Accuracy</strong><p>Does it reflect reality? (Is the price actually ₹500?)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="check"></i></span><div><strong>Completeness</strong><p>Are required values present? (No missing customer IDs.)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="layers"></i></span><div><strong>Consistency</strong><p>Does it agree across systems? (Same total in two reports.)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="clock"></i></span><div><strong>Timeliness</strong><p>Is it up to date? (Today's data loaded by 8am.)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="grid"></i></span><div><strong>Validity</strong><p>Does it match the rules/format? (A real email, a real date.)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>Uniqueness</strong><p>No unintended duplicates. (One row per order.)</p></div></div>
</div>

## How you actually enforce quality
Checks run *inside* the pipeline as a **gate** — bad rows get caught before they reach Gold. Toggle the checks below:

<div class="widget-mount" data-widget="dataQuality"></div>

In practice: schema validation, business rules (`amount > 0`), reconciliation (counts match source↔destination), and freshness alerts. Each check carries a **severity** — *fail* stops the run, *warn* flags it, *info* just logs — and failures are written to an audit table.

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
