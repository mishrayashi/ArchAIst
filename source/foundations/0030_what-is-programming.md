---
id: what-is-programming
section: foundations
title: What is programming? (and why Python)
level: Zero
minutes: 8
tags: python, fundamentals
---

**Programming is writing step-by-step instructions for a computer.** The computer does exactly what you say — no more, no less. A *program* (or *script*, or *code*) is the written list of instructions. A *programming language* is the vocabulary and grammar you write them in.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
A recipe is a program: "Heat oil. Add onions. Wait 5 minutes. Add tomatoes." The cook (computer) follows it exactly. If you forget to say "peel the onion," it won't. Computers are powerful but literal.
</div>

## Why Python is the language for data and AI

There are hundreds of programming languages. For data and AI, the world has overwhelmingly chosen **Python** because:

- It reads almost like English — gentle for beginners.
- It has free, ready-made toolkits ("libraries") for *everything*: data (`pandas`), big data (`PySpark`), AI (`PyTorch`, `transformers`), and more.
- It's the default language of every AI company on earth.

Here is a complete, working Python program. Read it:

```python
# A list of daily temperatures
temperatures = [30, 32, 35, 31, 29, 28, 33]

# Add them all up and find the average
total = sum(temperatures)
average = total / len(temperatures)

print("Average temperature:", average)

# Find the hottest days (above 31)
hot_days = [t for t in temperatures if t > 31]
print("Hot days:", hot_days)
```

Running this prints:
```text
Average temperature: 31.142857142857142
Hot days: [32, 35, 33]
```

You just read a real program that loads data, does maths, makes a decision (`if t > 31`), and reports a result. That is the *entire* essence of programming.

## The building blocks (you'll meet these everywhere)

| Block | What it does | Tiny example |
|-------|--------------|--------------|
| **Variable** | A labelled box that holds a value | `age = 25` |
| **Data type** | The kind of value: number, text, list… | `"hello"`, `42`, `[1,2,3]` |
| **Condition** | "If this, do that" | `if age > 18:` |
| **Loop** | "Do this for each item" | `for t in temperatures:` |
| **Function** | A reusable named recipe | `def average(nums): ...` |

The full **Python module** teaches each of these slowly with exercises. For now, just absorb: *programming is instructions; Python is the friendly language we use; it has five basic building blocks.*

## Where do you write code?

- **A code editor** like **VS Code** (free, most popular).
- **Notebooks** like **Jupyter** (the `.ipynb` files) — great for data because you run code in small chunks and see results immediately. You likely already have `coding.ipynb` open right now — that's a Jupyter notebook.

> **Key takeaway:** Programming = precise instructions for a computer. **Python** is the beginner-friendly language that runs the data and AI world. Five building blocks cover most of it.
