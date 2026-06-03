---
id: sql-basics
section: modules
title: SQL 1 — query data like a pro
level: Zero
minutes: 13
tags: sql, code, must-know
---

**SQL is the single most important skill in data work.** Analysts, scientists, and engineers all use it daily. The good news: it reads almost like English. Practise on a free SQLite/PostgreSQL database or sites like sqlite.org's online tool.

We'll use two example tables:

```text
customers                          orders
+----+-------+---------+           +----+----------+---------+--------+
| id | name  | city    |           | id | cust_id  | product | amount |
+----+-------+---------+           +----+----------+---------+--------+
| 1  | Ravi  | Mumbai  |           | 1  | 1        | Book    | 300    |
| 2  | Sara  | Delhi   |           | 2  | 1        | Pen     | 50     |
| 3  | Amit  | Mumbai  |           | 3  | 2        | Bag     | 900    |
+----+-------+---------+           +----+----------+---------+--------+
```

## SELECT — read data
```sql
SELECT * FROM customers;              -- all columns, all rows
SELECT name, city FROM customers;     -- just two columns
```

## WHERE — filter rows
```sql
SELECT name FROM customers
WHERE city = 'Mumbai';

SELECT * FROM orders
WHERE amount > 100 AND product != 'Pen';

SELECT * FROM customers
WHERE city IN ('Mumbai', 'Delhi');

SELECT * FROM customers
WHERE name LIKE 'R%';   -- names starting with R
```

## ORDER BY & LIMIT — sort and cap
```sql
SELECT name, amount FROM orders
ORDER BY amount DESC      -- biggest first
LIMIT 5;                  -- only top 5
```

## Aggregates — summarise many rows into one number
```sql
SELECT COUNT(*)      FROM orders;          -- how many orders
SELECT SUM(amount)   FROM orders;          -- total revenue
SELECT AVG(amount)   FROM orders;          -- average order
SELECT MIN(amount), MAX(amount) FROM orders;
```

## GROUP BY — aggregate *per category*
This is where SQL gets powerful. "Total sales **per** city," "orders **per** customer." Hit play below and switch between SUM / COUNT / AVG to *see* the rows collapse into one row per group:

<div class="widget-mount" data-widget="groupBy"></div>

```sql
-- Total amount spent by each customer
SELECT cust_id, SUM(amount) AS total_spent
FROM orders
GROUP BY cust_id;

-- Only groups meeting a condition: use HAVING (WHERE for groups)
SELECT cust_id, SUM(amount) AS total_spent
FROM orders
GROUP BY cust_id
HAVING SUM(amount) > 200;
```
<div class="callout callout-note"><span class="cfor">🔑</span><div><strong>WHERE vs HAVING:</strong> <code>WHERE</code> filters <em>rows before</em> grouping. <code>HAVING</code> filters <em>groups after</em> aggregating. Classic interview question!</div></div>

## JOIN — combine tables
Data lives in separate tables; JOINs stitch them together using a shared key (`cust_id` ↔ `id`).

<div class="widget-mount" data-widget="join"></div>
```sql
SELECT c.name, o.product, o.amount
FROM customers AS c
JOIN orders AS o
  ON c.id = o.cust_id;
```

The main JOIN types (a top interview topic):

| JOIN | Keeps |
|------|-------|
| **INNER JOIN** | Only rows matching in *both* tables |
| **LEFT JOIN** | All left rows + matches from right (NULLs if none) |
| **RIGHT JOIN** | All right rows + matches from left |
| **FULL OUTER JOIN** | All rows from both, matched where possible |

```sql
-- All customers, even those with no orders (amount will be NULL)
SELECT c.name, o.amount
FROM customers AS c
LEFT JOIN orders AS o ON c.id = o.cust_id;
```

## The logical order SQL runs in
You *write* SELECT first, but the database *executes* in this order — knowing this fixes most confusion:
```text
FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```

## Practice
1. Find all orders over 200, sorted high to low.
2. Count how many customers are in each city.
3. List each customer's name and their total spend (JOIN + GROUP BY).
4. Show customers who have *never* ordered (LEFT JOIN + `WHERE o.id IS NULL`).

> **Key takeaway:** SELECT/WHERE/ORDER BY/GROUP BY/JOIN cover most everyday SQL. Master GROUP BY and JOIN types — they dominate interviews.
