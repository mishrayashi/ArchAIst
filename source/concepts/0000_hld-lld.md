---
id: hld-lld
section: concepts
title: HLD vs LLD — system design explained
level: Intermediate
minutes: 11
tags: system design, hld, lld, must-know
---

**HLD** and **LLD** confuse even experienced engineers. They are simply **two zoom levels** for designing a system. Interviews — especially at senior levels and big companies — test both.

## The one-line difference
- **HLD (High-Level Design):** the *bird's-eye view* — the major components, how data flows between them, and the big technology choices. "What are the boxes and arrows?"
- **LLD (Low-Level Design):** the *zoomed-in view* — the detailed design of individual components: classes, schemas, function signatures, exact algorithms. "What's inside one box?"

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Building a house: <strong>HLD</strong> is the architect's overall plan — where the rooms, plumbing, and electrical lines go. <strong>LLD</strong> is the detailed blueprint of one room — exact dimensions, wiring diagrams, materials. You need both; they're different zoom levels of the same building.
</div>

## HLD — what it includes
- **Major components/services** and their responsibilities.
- **Data flow** between them (the arrows).
- **Technology choices:** which database, queue, cache, processing engine, cloud services.
- **Scalability & reliability strategy:** how it handles growth and failures.
- **Trade-offs:** batch vs streaming, SQL vs NoSQL, cost vs latency.

Toggle the two zoom levels to feel the difference:

<div class="widget-mount" data-widget="hldlld"></div>

## LLD — what it includes
- **Schemas:** exact table/column definitions, keys, indexes, partitioning.
- **Class/module design:** for code-heavy components (interfaces, methods, responsibilities).
- **APIs:** endpoints, request/response shapes.
- **Algorithms & data structures** for specific logic.
- **Error handling, retries, idempotency** at the detail level.

LLD output is the concrete **schema, keys, and partitioning** (see the zoomed-in view in the toggle above) — plus class/API design and idempotency.

## How they relate
HLD comes first (the shape), LLD second (the details). HLD says "we'll use a warehouse with a star schema." LLD says "here is fact_sales, its columns, keys, partition strategy, and the upsert logic." A good engineer can zoom between both fluidly.

## OOP for LLD (for data engineers too)
LLD often expects basic object-oriented design. The four pillars in plain terms:
- **Encapsulation:** bundle data + the methods that act on it; hide internals.
- **Abstraction:** expose a simple interface, hide complexity (`extractor.run()`).
- **Inheritance:** a class reuses/extends another (`PostgresExtractor(BaseExtractor)`).
- **Polymorphism:** different classes share an interface so callers don't care which one they use.

```python
class BaseExtractor:
    def extract(self): raise NotImplementedError
class APIExtractor(BaseExtractor):
    def extract(self): ...   # pull from a REST API
class DBExtractor(BaseExtractor):
    def extract(self): ...   # pull from a database
# Caller doesn't care which — polymorphism + abstraction
for ex in [APIExtractor(), DBExtractor()]:
    ex.extract()
```

## How to answer a system-design question (the framework)
1. **Clarify requirements** — volume, latency (batch vs real-time?), consistency, budget. *Never start drawing immediately.*
2. **Estimate scale** — rows/day, GB/TB, peak QPS. Pick batch vs streaming accordingly.
3. **HLD first** — sketch components and data flow; state tech choices and *why*.
4. **Zoom to LLD** — schema, partitioning, key logic, idempotency.
5. **Address the "-ilities"** — scalability, reliability (retries/alerting), data quality, cost, security.
6. **State trade-offs** — there's no perfect answer; show you understand the costs of each choice.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>The phrase that scores points:</strong> "It depends on the requirements — let me clarify a few things first." Then ask about volume, latency, and consistency. Jumping straight to a solution is the most common mistake.</div></div>

> **Key takeaway:** HLD = the big picture (components, data flow, tech choices, trade-offs); LLD = the details (schemas, classes, APIs, algorithms). Clarify → estimate → HLD → LLD → address scalability/reliability/cost/security → name trade-offs.
