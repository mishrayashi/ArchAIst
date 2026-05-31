---
id: comms-cheatsheet
section: concepts
title: Talk like an engineer — say what you mean
level: Beginner
minutes: 9
tags: system design, communication, must-know
---

Half of seniority is **naming things correctly** so teammates instantly know what you mean. When you say "this is the LLD" or "we'll use a medallion architecture" or "that's a RAG problem," everyone aligns in one sentence. This page is your translation table — the approach, what it means, and *when you'd say it.*

## The "what am I even talking about?" table

| When you say… | You mean… | You'd say it when… |
|---|---|---|
| "Let's start with the **HLD**" | the big-picture boxes-and-arrows design | kicking off any system design |
| "Now the **LLD**" | detailed schemas, classes, APIs, algorithms | after the HLD is agreed |
| "We'll use a **medallion architecture**" | Bronze (raw) → Silver (clean) → Gold (business) layers | designing a lakehouse pipeline |
| "This is a **RAG** problem" | answer from our docs by retrieving + prompting an LLM | building a GenAI feature over private data |
| "Make it **idempotent**" | safe to re-run without duplicating data | designing any pipeline/consumer |
| "Do an **upsert** / **MERGE**" | insert-or-update on a key | loading changing data |
| "Use **CDC**" | capture inserts/updates/deletes from the source log | near-real-time incremental loads |
| "We need **exactly-once**" | no loss, no duplicates | billing / financial streams |
| "It's **eventually consistent**" | reads may be briefly stale, converge later | high-availability distributed stores |
| "**Partition** by date" | physically split data so queries scan less | big tables / Spark / warehouses |
| "**Denormalize** it" | pre-join/duplicate for read speed | analytics / star schema |
| "That's a **lambda** vs **kappa** choice" | batch+stream vs stream-only architecture | designing real-time + historical |
| "Watch for **data drift**" | input stats changing and silently breaking a model | productionising ML |
| "Let's define a **data contract**" | an agreed schema + guarantees between producer & consumer | cross-team data hand-offs |
| "What's the **grain**?" | what one row represents | designing a fact table |
| "We'll **backfill**" | reprocess historical periods | after a logic fix or new pipeline |

## A mental checklist for *any* design conversation
When someone describes a system, silently slot it into these buckets — it's how senior engineers think:
1. **Batch or streaming?** (latency requirement)
2. **What's the source of truth?** (where the canonical data lives)
3. **How does data get in?** (ingestion: pull/push, batch/CDC/stream)
4. **How is it stored & modelled?** (lake/warehouse, schema, grain, partitioning)
5. **How is it served?** (BI, API, model, feature store)
6. **The -ilities:** scalability, reliability, consistency, cost, security.
7. **What breaks, and what happens then?** (retries, idempotency, alerting, DR)

<div class="callout callout-tip"><span class="cfor"></span><div><span class="ctitle">Pro move:</span> in interviews and standups, narrate which layer you're in — "stepping down to the LLD now" or "that's an ingestion concern, not transformation." It signals you have the mental map, not just the facts.</div></div>

The next pages define every term above (and many more) properly. Skim them once; revisit before interviews.

> **Key takeaway:** Knowing the *name* of your approach — HLD/LLD, medallion, RAG, CDC, lambda/kappa, idempotency — lets you align a whole room in one sentence. That fluency *is* seniority.
