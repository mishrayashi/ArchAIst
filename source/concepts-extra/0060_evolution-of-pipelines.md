---
id: evolution-of-pipelines
section: concepts
title: The evolution of data pipelines
level: Intermediate
minutes: 8
tags: history, architecture, must-know
---

For 40 years, every shift in the data stack answered one question: **who consumes the data?** Here's the whole arc — and where it's heading.

<div class="flow flow-row">
  <div class="flow-node"><strong>Batch ETL</strong><span>1990s–2000s</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Big Data</strong><span>2010–2015</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Cloud ELT</strong><span>2015–2020</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Semantic Layer</strong><span>2020–2023</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>AI-Ready</strong><span>2023–now</span></div>
</div>

## What changed in each era

| Era | Primary consumer | What it unlocked | What broke |
|-----|------------------|------------------|------------|
| **Batch ETL** | Analysts (SQL) | Scheduled reports, audit trails, one version of truth | Slow "Friday reports", rigid schemas, IT bottlenecks |
| **Big Data** | Data scientists & engineers | Petabyte scale, unstructured data, batch + streaming | Data swamps, no governance, tribal knowledge |
| **Cloud ELT** | Analytics engineers (SQL + Git) | Elastic compute, transform-in-warehouse, CI/CD for data | Dashboard sprawl, "which number is right?" |
| **Semantic Layer** | Business users (self-serve BI) | Consistent, governed metrics defined once | Still pull-based — you must know what to ask |
| **AI-Ready** | AI agents & users (natural language) | Agents query data directly, multi-source reasoning | New: governance, cost, "who owns the answer?" |

<div class="callout callout-note"><span class="cfor">🧠</span><div><strong>The pattern:</strong> each era didn't kill the last — it <em>added a consumer</em>. Warehouses still run under the semantic layer; the semantic layer still feeds the agents.</div></div>

## The consumer progression
Who reads the data has steadily moved from humans writing SQL to machines reasoning in natural language:

<nav class="pathway pathway-flow" aria-label="Who consumes the data, over time">
  <span class="pw-step"><span class="pw-n">1</span>Analysts</span>
  <span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span>
  <span class="pw-step"><span class="pw-n">2</span>Data scientists</span>
  <span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span>
  <span class="pw-step"><span class="pw-n">3</span>Analytics engineers</span>
  <span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span>
  <span class="pw-step"><span class="pw-n">4</span>Business users</span>
  <span class="pw-arrow"><i data-ic="arrowRight" class="ic-sm"></i></span>
  <span class="pw-step"><span class="pw-n">5</span>AI agents</span>
</nav>

## Match the layer to the job
Modern stacks keep all the layers and route each question to the right one:

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="chart"></i></span><div><strong>Warehouse — core</strong><p>Governed facts &amp; metrics: the source of truth.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Lake — raw</strong><p>Cheap storage for everything, any format.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="grid"></i></span><div><strong>Semantic — metrics</strong><p>Define a metric once; everyone agrees.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="network"></i></span><div><strong>Graph — relations</strong><p>Connections &amp; lineage between entities.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="sparkles"></i></span><div><strong>Vector — retrieval</strong><p>Meaning-based search for RAG &amp; agents.</p></div></div>
</div>

> **Key takeaway:** The stack evolves by *adding* consumers, not replacing them: Analysts → scientists → analytics engineers → business users → **AI agents**. Each new consumer still needs the layers below it to be clean, governed, and fast — which is exactly the data engineer's job.
