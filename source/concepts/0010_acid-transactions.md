---
id: acid-transactions
section: concepts
title: ACID, transactions & consistency
level: Intermediate
minutes: 8
tags: database, acid, must-know
---

When data is written, can you trust it not to get corrupted, half-written, or lost? **ACID** is the set of guarantees that answer "yes." It's a classic interview topic.

## A transaction
A **transaction** is a group of operations treated as a single, all-or-nothing unit. The classic example: transferring ₹100 from account A to B is *two* steps (debit A, credit B) that must **both** happen or **neither** — otherwise money vanishes or doubles.

<div class="widget-mount" data-widget="acidTxn"></div>

## ACID — the four guarantees
- **A — Atomicity:** all steps in a transaction succeed, or none do. No half-done states. (Both the debit and credit, or roll back.)
- **C — Consistency:** a transaction moves the database from one *valid* state to another, respecting all rules/constraints (no negative balance if that's a rule).
- **I — Isolation:** concurrent transactions don't step on each other; the result is as if they ran one at a time. (Two people withdrawing at once can't both spend the last ₹100.)
- **D — Durability:** once committed, data survives crashes/power loss (it's written to durable storage).

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
ACID is the bank's promise that your money transfer is safe: it fully happens or fully doesn't (A), never breaks the rules (C), isn't messed up by other people transacting at the same moment (I), and won't be forgotten if the power goes out right after (D).
</div>

## Why data engineers care
- Traditional databases (Postgres, MySQL) are fully ACID.
- Old data lakes (just files on S3) were **not** — a failed Spark job could leave half-written, corrupt files. **Delta Lake / Iceberg / Hudi** added ACID transactions to lakes, which is a big reason the "lakehouse" works. Saying "Delta Lake gives the lake ACID guarantees and lets me do reliable MERGEs/upserts" is a strong interview line.

## BASE — the NoSQL trade-off
Many large-scale NoSQL systems relax strict ACID for availability and speed, following **BASE**: **Basically Available, Soft state, Eventually consistent.** Instead of guaranteeing everyone sees the latest value instantly, they guarantee it *eventually*. This trade-off connects directly to the CAP theorem (next lesson).

## Isolation levels (bonus, senior-level)
Isolation isn't all-or-nothing; databases offer levels trading safety for speed: *Read Uncommitted → Read Committed → Repeatable Read → Serializable*. Higher = safer but slower. Know the anomalies they prevent: **dirty reads, non-repeatable reads, phantom reads.**

> **Key takeaway:** A **transaction** is all-or-nothing. **ACID** = Atomicity, Consistency, Isolation, Durability — the trust guarantees of databases. Lakes gained ACID via **Delta/Iceberg/Hudi**. Large NoSQL often trades ACID for **BASE** (eventual consistency).
