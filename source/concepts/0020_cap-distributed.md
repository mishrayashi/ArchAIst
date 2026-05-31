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
In a **distributed** system you want all three, but you can't fully have all three at once:
- **C — Consistency:** every read sees the most recent write (everyone sees the same data). *(Note: different from the C in ACID.)*
- **A — Availability:** every request gets a (non-error) response, even if some nodes are down.
- **P — Partition tolerance:** the system keeps working even when the network between nodes breaks (a "partition").

## The theorem
**When a network partition happens (P), you must choose between Consistency (C) and Availability (A).** Since networks *will* fail in any real distributed system, P is non-negotiable — so the real choice is **CP vs AP**.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Two shop branches that normally sync stock. The phone line between them dies (partition). Now: do you <strong>refuse sales</strong> until you can confirm stock with the other branch (consistency — CP), or <strong>keep selling</strong> and risk overselling, fixing it later (availability — AP)? You can't have both during the outage.
</div>

## CP vs AP in practice
- **CP (Consistency + Partition tolerance):** refuse/withhold answers rather than serve stale data. Good for banking, inventory, anything where wrong data is dangerous. Examples: HBase, MongoDB (in certain configs), traditional RDBMS clusters.
- **AP (Availability + Partition tolerance):** always answer, accept temporary staleness (eventual consistency). Good for social feeds, shopping carts, where being up matters more than perfect freshness. Examples: Cassandra, DynamoDB, CouchDB.

## Beyond CAP: PACELC (bonus)
CAP only talks about behaviour *during* a partition. **PACELC** extends it: *if Partition, choose A or C; **E**lse (normal operation), choose between **L**atency and **C**onsistency.* Even with no failures, you often trade a little consistency for lower latency (e.g. reading from a nearby replica that's slightly behind).

## Why this matters for data engineers
- Choosing a database/storage means choosing a point on these trade-offs.
- **Replication** (copies of data on many nodes) gives durability + availability but creates consistency lag.
- **Partitioning/sharding** (splitting data across nodes) gives scale but complicates joins and transactions.
- Understanding eventual consistency explains real bugs: "I wrote it, why doesn't my read see it yet?"

> **Key takeaway:** In distributed systems, partitions are inevitable, so you trade **Consistency vs Availability** (CP vs AP). **PACELC** adds the everyday **latency vs consistency** trade-off. Your storage choices are really choices on these axes.
