---
id: cap-distributed
section: concepts
title: CAP theorem & distributed systems
level: Advanced
minutes: 8
tags: distributed, cap, must-know
---

Once your data lives across *many machines* (which it always does at scale), you hit fundamental trade-offs. The **CAP theorem** names the most famous one.

<div class="widget-mount" data-widget="cap"></div>

## The three letters
In a **distributed** system you want all three, but you can't fully have all three at once.

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="check"></i></span><div><strong>C — Consistency</strong><p>Every read sees the most recent write, so everyone sees the same data. (Different from the C in ACID.)</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="zap"></i></span><div><strong>A — Availability</strong><p>Every request gets a non-error response, even if some nodes are down.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="network"></i></span><div><strong>P — Partition tolerance</strong><p>The system keeps working even when the network between nodes breaks (a "partition").</p></div></div>
</div>

## The theorem
**When a network partition happens (P), you must choose between Consistency (C) and Availability (A).** Since networks *will* fail in any real distributed system, P is non-negotiable — so the real choice is **CP vs AP**.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Two shop branches that normally sync stock. The phone line between them dies (partition). Now: do you <strong>refuse sales</strong> until you can confirm stock with the other branch (consistency — CP), or <strong>keep selling</strong> and risk overselling, fixing it later (availability — AP)? You can't have both during the outage.
</div>

## CP vs AP in practice

| Choice | During a partition | Good for | Examples |
| --- | --- | --- | --- |
| **CP** (Consistency + Partition tolerance) | Refuse/withhold answers rather than serve stale data | Banking, inventory — anywhere wrong data is dangerous | HBase, MongoDB (some configs), traditional RDBMS clusters |
| **AP** (Availability + Partition tolerance) | Always answer, accept temporary staleness (eventual consistency) | Social feeds, shopping carts — being up matters more than perfect freshness | Cassandra, DynamoDB, CouchDB |

## Beyond CAP: PACELC (bonus)
CAP only talks about behaviour *during* a partition. **PACELC** extends it: *if Partition, choose A or C; **E**lse (normal operation), choose between **L**atency and **C**onsistency.* Even with no failures, you often trade a little consistency for lower latency (e.g. reading from a nearby replica that's slightly behind).

## Why this matters for data engineers
- Choosing a database/storage means choosing a point on these trade-offs.
- **Replication** (copies of data on many nodes) gives durability + availability but creates consistency lag.
- **Partitioning/sharding** (splitting data across nodes) gives scale but complicates joins and transactions.
- Understanding eventual consistency explains real bugs: "I wrote it, why doesn't my read see it yet?"

> **Key takeaway:** In distributed systems, partitions are inevitable, so you trade **Consistency vs Availability** (CP vs AP). **PACELC** adds the everyday **latency vs consistency** trade-off. Your storage choices are really choices on these axes.
