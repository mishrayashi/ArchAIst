---
id: what-is-data
section: foundations
title: What is data, really?
level: Zero
minutes: 7
tags: fundamentals
---

**Data is just recorded facts.** That's the whole idea. Your name, your age, the time you woke up, the price of milk, the number of likes on a video — each of these is a piece of data.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
A shopkeeper writing "Sold 5 breads, ₹50 each, to Ravi at 9am" in a notebook is <em>creating data</em>. A computer doing the same thing a billion times a second is what powers Amazon, YouTube, and your bank.
</div>

## The shapes data comes in

| Type | What it means | Example |
|------|---------------|---------|
| **Structured** | Fits neatly in rows and columns (like a spreadsheet) | A table of customers: name, email, city |
| **Semi-structured** | Has some structure but is flexible | A JSON message from an app, an XML file |
| **Unstructured** | No fixed shape | Photos, PDFs, voice recordings, chat messages |

Most "easy" data work is on **structured** data (tables). Modern AI is exciting partly because it finally lets us work well with **unstructured** data (text, images, audio).

## A row, a column, a table

Picture a spreadsheet:

| customer_id | name  | city      | signup_date |
|-------------|-------|-----------|-------------|
| 1           | Ravi  | Mumbai    | 2024-01-05  |
| 2           | Sara  | Delhi     | 2024-02-11  |

- A **column** (also called a *field* or *attribute*) is one kind of fact — e.g. `city`.
- A **row** (also called a *record*) is one complete thing — e.g. everything about Ravi.
- A **table** is a collection of rows about the same kind of thing (all customers).

That's 80% of the vocabulary you need to start. Tables, rows, columns.

## Where does data live?

- In **files** — like a `.csv` (comma-separated values) text file you can open in Excel.
- In **databases** — special programs built to store and find data fast (next lesson).
- In **the cloud** — someone else's powerful computers you rent over the internet.

## Why companies obsess over data

Because data answers questions that make or save money:
- *Which products sell best on Friday evenings?*
- *Which customers are about to leave us?*
- *Is this credit-card transaction fraud?*

Turning raw, messy data into clean answers is **literally the job** of a data engineer. AI is the newest, most powerful tool for squeezing answers out of data — especially messy, unstructured data.

> **Key takeaway:** Data = recorded facts. The whole industry exists to *collect it, clean it, move it, store it, and turn it into decisions.*
