---
id: py-data
section: modules
title: Python 2 — pandas & wrangling data
level: Beginner
minutes: 12
tags: python, pandas, code
---

**pandas** is the most important Python library for working with tabular data. It gives you the **DataFrame** — basically a programmable spreadsheet. Almost every data engineer and scientist uses it daily.

Install once: `pip install pandas`

## Creating and reading data
```python
import pandas as pd   # everyone aliases pandas as 'pd'

# From a dictionary
df = pd.DataFrame({
    "name": ["Ravi", "Sara", "Amit"],
    "city": ["Mumbai", "Delhi", "Mumbai"],
    "sales": [120, 340, 90],
})

# From a CSV file (the most common in real life)
df = pd.read_csv("sales.csv")

df.head()       # first 5 rows
df.shape        # (rows, columns)
df.info()       # column names, types, non-null counts
df.describe()   # quick statistics for numeric columns
```

## Selecting data
```python
df["sales"]                 # one column (a Series)
df[["name", "sales"]]       # multiple columns
df[df["sales"] > 100]       # filter rows where sales > 100
df[df["city"] == "Mumbai"]  # filter by text
df.iloc[0]                  # first row by position
df.loc[df["city"] == "Delhi", "sales"]  # sales for Delhi rows
```

## Cleaning data — the daily reality
Real data is messy. Cleaning it is 70% of the job.
```python
df.isnull().sum()                 # count missing values per column
df = df.dropna()                  # drop rows with missing values
df["sales"] = df["sales"].fillna(0)   # OR fill missing with 0
df = df.drop_duplicates()             # remove duplicate rows
df["city"] = df["city"].str.strip().str.title()  # tidy text
df["sales"] = df["sales"].astype(int) # fix data type
df = df.rename(columns={"sales": "amount"})       # rename column
```

## Transforming & aggregating
```python
# Add a calculated column
df["with_tax"] = df["amount"] * 1.18

# Group and summarise (just like SQL GROUP BY)
summary = df.groupby("city")["amount"].sum().reset_index()
print(summary)

# Sort
df = df.sort_values("amount", ascending=False)
```

## Joining two DataFrames (like a SQL JOIN)
```python
customers = pd.DataFrame({"id": [1, 2], "name": ["Ravi", "Sara"]})
orders    = pd.DataFrame({"cust_id": [1, 1, 2], "amount": [100, 50, 200]})

merged = customers.merge(orders, left_on="id", right_on="cust_id")
```

## Writing results out
```python
df.to_csv("clean_sales.csv", index=False)
df.to_parquet("clean_sales.parquet")   # Parquet = compact, fast, columnar (preferred in data engineering)
```

## A complete mini-pipeline
```python
import pandas as pd

# 1. EXTRACT
df = pd.read_csv("raw_sales.csv")

# 2. TRANSFORM
df = df.dropna(subset=["amount"])
df["city"] = df["city"].str.title()
df["amount"] = df["amount"].astype(float)
report = df.groupby("city")["amount"].sum().reset_index()

# 3. LOAD
report.to_csv("city_sales_report.csv", index=False)
print("Done! Wrote", len(report), "rows.")
```

You just wrote your first **ETL** (Extract-Transform-Load) job in pandas — the exact pattern you'll scale up with Spark later.

## Practice
1. Load any CSV (find one online), print `.info()` and `.describe()`.
2. Filter to rows matching a condition; save the result to a new CSV.
3. `groupby` a category column and sum a numeric column.

> **Key takeaway:** pandas DataFrames let you read, clean, transform, join, and write tabular data in a few lines. Extract → Transform → Load is the core rhythm of data engineering.
