---
id: py-basics
section: modules
title: Python 1 — the absolute basics
level: Zero
minutes: 12
tags: python, code
---

Python is the main language of data and AI. This lesson takes you from "never coded" to writing useful little programs. **Type every example yourself** — open `coding.ipynb` or any `.py` file and run it.

<div class="flow flow-row">
  <div class="flow-node"><strong>Values</strong><span>types &amp; variables</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Collections</strong><span>lists &amp; dicts</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Logic</strong><span>if / loops</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Functions</strong><span>reuse</span></div>
</div>

## Printing & comments
```python
# A comment starts with '#'. Python ignores it. Use comments to explain code.
print("Hello, data world!")   # print() shows text on screen
```

## Variables — labelled boxes for values
A variable stores a value under a name so you can reuse it.
```python
name = "Ravi"        # text (a 'string')
age = 25             # whole number (an 'int')
height = 5.8         # decimal number (a 'float')
is_student = True    # True/False (a 'bool')

print(name, "is", age, "years old")
```

## The core data types
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>str</strong><p>text, in quotes.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>int</strong><p>whole numbers.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>float</strong><p>decimal numbers.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>bool</strong><p>True or False.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>None</strong><p>"no value" yet.</p></div></div>
</div>

```python
city = "Mumbai"              # str  — text
count = 42                   # int  — whole number
price = 99.5                 # float — decimal
active = False               # bool — True/False
nothing = None               # None — "no value"
```

## Lists — ordered collections
```python
fruits = ["apple", "banana", "mango"]
print(fruits[0])         # 'apple'  (counting starts at 0!)
print(len(fruits))       # 3        (how many items)
fruits.append("orange")  # add to end
fruits[1] = "grape"      # change an item
print(fruits)            # ['apple', 'grape', 'mango', 'orange']
```

## Dictionaries — labelled data (key → value)
Dictionaries are everywhere in data work (JSON is basically a dictionary).
```python
customer = {
    "name": "Sara",
    "city": "Delhi",
    "orders": 3
}
print(customer["name"])     # 'Sara'
customer["orders"] = 4      # update a value
customer["email"] = "s@x.com"  # add a new key
```

## Making decisions — if / elif / else
```python
score = 72

if score >= 90:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"

print("Grade:", grade)   # Grade: B
```
<div class="callout callout-warn"><span class="cfor">⚠️</span><div><strong>Indentation is not optional in Python.</strong> The spaces before <code>grade = "A"</code> tell Python that line belongs to the <code>if</code>. Use 4 spaces. Mixing tabs and spaces causes errors.</div></div>

## Loops — repeat for each item
```python
fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print("I like", fruit)

# Repeat a fixed number of times with range()
for i in range(3):     # 0, 1, 2
    print("Step", i)
```

## Functions — reusable named recipes
```python
def average(numbers):
    """Return the average of a list of numbers."""
    return sum(numbers) / len(numbers)

temps = [30, 32, 35, 31]
print(average(temps))   # 32.0
```

## Putting it together — a tiny real program
```python
sales = [120, 340, 90, 560, 230]

total = sum(sales)
avg = average(sales)              # reuse our function
big_sales = [s for s in sales if s > 200]   # list comprehension

print("Total:", total)
print("Average:", avg)
print("Big sales:", big_sales)
```

That `[s for s in sales if s > 200]` is a **list comprehension** — a compact Python way to build a new list by filtering/transforming another. You'll use these constantly.

## Practice (do these now)
1. Make a list of 5 city names; print each in a loop.
2. Write a function `is_even(n)` returning True/False.
3. Build a dictionary for yourself (name, age, city) and print a sentence using it.
4. Given `nums = [4, 9, 2, 7, 1]`, print only the numbers greater than 3.

> **Key takeaway:** Variables, types, lists, dicts, if/else, loops, functions — these six ideas cover most beginner Python. Next: using Python to actually wrangle data.
