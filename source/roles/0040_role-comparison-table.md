---
id: role-comparison-table
section: roles
title: Master comparison & how they work together
level: Beginner
minutes: 7
tags: careers, must-know
---

Keep this page bookmarked. It's the cheat-sheet for the whole career landscape.

## The full comparison

| Role | Builds or analyses? | Main tools | Maths load | Best for someone who… |
|------|--------------------|-----------|------------|------------------------|
| **Data Analyst** | Analyses | SQL, Excel, Power BI/Tableau | Low | likes answering business questions with charts |
| **Data Scientist** | Analyses/Models | Python, stats, scikit-learn, notebooks | High | loves maths, statistics, experiments |
| **Data Engineer** | Builds | SQL, Python, Spark, Airflow, cloud | Low–Med | loves logic, structure, reliable systems |
| **AI Data Engineer** | Builds | DE stack + vectors, feature stores, MLflow | Medium | wants DE skills aimed at AI |
| **ML Engineer** | Builds | Python, PyTorch/TF, MLOps, Docker/K8s | High | loves software engineering + ML |
| **GenAI Engineer** | Builds | LangChain, vector DBs, prompts, APIs | Low–Med | wants to ship AI products fast |
| **LLM Engineer** | Builds | PyTorch, HF transformers, GPUs, vLLM | High | wants to go deep on the models |

## How they collaborate on one real project
Imagine a bank building an **AI assistant that answers customer questions from policy documents**. The work flows down the chain, each role handing off to the next:

<nav class="pathway pathway-flow"><span class="pw-step"><span class="pw-n">1</span>Data Engineer</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">2</span>AI Data Engineer</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">3</span>GenAI Engineer</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">4</span>LLM Engineer</span><span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span><span class="pw-step"><span class="pw-n">5</span>Data Scientist / Analyst</span></nav>

1. **Data Engineer** builds pipelines that collect and clean all the policy PDFs and customer data into a lake/warehouse.
2. **AI Data Engineer** converts documents into **embeddings** and loads them into a **vector database**; sets up the feature/data flow.
3. **GenAI Engineer** builds the **RAG chatbot**: retrieves the right document chunks and prompts an LLM to answer.
4. **LLM Engineer** **fine-tunes** the model on the bank's tone and optimises it to run cheaply and fast.
5. **Data Scientist / Analyst** measures whether it actually helps customers and reduces call-centre load.

Everyone depends on the data engineer's pipes being solid. That's why we start there.

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Don't agonise over the "perfect" title.</strong> Skills overlap massively. Build a strong foundation (SQL, Python, pipelines), pick a direction, and let your real interests pull you toward a specialisation. Job titles are fuzzy; <em>skills</em> are what get you hired.</div></div>

> **Key takeaway:** All these roles are points on a spectrum of *build vs analyse* and *data vs AI*. They collaborate on real projects, and they all stand on a data-engineering foundation. Now go pick your **Roadmap**.
