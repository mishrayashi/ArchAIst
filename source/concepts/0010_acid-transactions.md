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
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="layers"></i></span><div><strong>A — Atomicity</strong><p>All steps succeed or none do. No half-done states: both the debit and credit, or roll back.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="check"></i></span><div><strong>C — Consistency</strong><p>Moves the database from one valid state to another, respecting all rules and constraints.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="network"></i></span><div><strong>I — Isolation</strong><p>Concurrent transactions don't step on each other; the result is as if they ran one at a time.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>D — Durability</strong><p>Once committed, data survives crashes and power loss; it's written to durable storage.</p></div></div>
</div>

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
ACID is the bank's promise that your money transfer is safe: it fully happens or fully doesn't (A), never breaks the rules (C), isn't messed up by other people transacting at the same moment (I), and won't be forgotten if the power goes out right after (D).
</div>

## Why data engineers care
- Traditional databases (Postgres, MySQL) are fully ACID.
- Old data lakes (just files on S3) were **not** — a failed Spark job could leave half-written, corrupt files. **Delta Lake / Iceberg / Hudi** added ACID transactions to lakes, which is a big reason the "lakehouse" works. Saying "Delta Lake gives the lake ACID guarantees and lets me do reliable MERGEs/upserts" is a strong interview line.

## BASE — the NoSQL trade-off
Many large-scale NoSQL systems relax strict ACID for availability and speed, following **BASE**: **Basically Available, Soft state, Eventually consistent.** Instead of guaranteeing everyone sees the latest value instantly, they guarantee it *eventually*. This trade-off connects directly to the CAP theorem (next lesson).

## Isolation levels (bonus, senior-level)
Isolation isn't all-or-nothing; databases offer levels that trade safety for speed. Higher = safer but slower.

<nav class="pathway pathway-flow"><span class="pw-step"><span class="pw-n">1</span>Read Uncommitted</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">2</span>Read Committed</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">3</span>Repeatable Read</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">4</span>Serializable</span></nav>

Know the anomalies they prevent: **dirty reads, non-repeatable reads, phantom reads.**

> **Key takeaway:** A **transaction** is all-or-nothing. **ACID** = Atomicity, Consistency, Isolation, Durability — the trust guarantees of databases. Lakes gained ACID via **Delta/Iceberg/Hudi**. Large NoSQL often trades ACID for **BASE** (eventual consistency).
