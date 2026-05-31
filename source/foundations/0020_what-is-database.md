---
id: what-is-database
section: foundations
title: Databases, tables & SQL (gentle intro)
level: Zero
minutes: 8
tags: database, sql
---

A **database** is a program whose only job is to store data and let you find it again **quickly and safely**, even with millions of rows and many people using it at once.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
Think of a giant, magical library. A <strong>spreadsheet</strong> is a single notebook — fine for 100 rows. A <strong>database</strong> is the whole library with a librarian who can find any book in milliseconds, never loses one, and lets 10,000 people borrow at once without chaos.
</div>

## Two big families of databases

**1. SQL / Relational databases** — data lives in **tables** with strict columns. They are related to each other (hence "relational"). Examples: **PostgreSQL, MySQL, SQL Server, Oracle**. You talk to them with a language called **SQL**.

**2. NoSQL databases** — more flexible shapes, built for huge scale or special needs. Examples: **MongoDB** (documents), **Redis** (key-value, super fast), **Cassandra** (massive scale).

For a beginner: **learn SQL first.** It is the single most important skill in all of data work. Every data engineer, analyst, and scientist uses it daily.

## SQL = asking questions in (almost) English

SQL stands for **Structured Query Language**. A *query* is just a question you ask the database. Look how readable it is:

```sql
-- Get the names of customers in Mumbai
SELECT name
FROM customers
WHERE city = 'Mumbai';
```

Read it out loud: *"Select the name, from the customers table, where city equals Mumbai."* That's it. You just read code.

A few more, building up:

```sql
-- How many customers signed up in each city?
SELECT city, COUNT(*) AS total_customers
FROM customers
GROUP BY city
ORDER BY total_customers DESC;
```

```sql
-- Combine two tables: customers and their orders
SELECT c.name, o.product, o.amount
FROM customers AS c
JOIN orders AS o ON c.customer_id = o.customer_id
WHERE o.amount > 1000;
```

Don't worry about memorising this yet — there's a full **SQL module** later. The point right now: SQL is **readable, logical, and learnable by anyone.**

## The four things you do to data (CRUD)

Almost everything is one of these four:

- **C**reate — add new data (`INSERT`)
- **R**ead — look at data (`SELECT`)  ← you'll do this 90% of the time
- **U**pdate — change existing data (`UPDATE`)
- **D**elete — remove data (`DELETE`)

> **Key takeaway:** A database safely stores data; **SQL** is the friendly language you use to ask it questions. Master SQL and half the field opens up to you.
