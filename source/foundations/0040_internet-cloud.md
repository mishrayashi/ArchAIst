---
id: internet-cloud
section: foundations
title: Servers, the internet & 'the cloud'
level: Zero
minutes: 7
tags: cloud, fundamentals
---

To understand modern data jobs, you need a simple mental model of how computers talk to each other.

## Client and server

- A **client** is a computer asking for something — your phone opening Instagram.
- A **server** is a computer that answers — a powerful machine in a data centre holding Instagram's data.

When you open an app, your client sends a **request** over the internet, and a server sends back a **response** — your photos, messages, and so on.

<div class="flow flow-row">
  <div class="flow-node"><strong>Client</strong><span>your phone</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Request</strong><span>over the internet</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Server</strong><span>in a data centre</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Response</strong><span>your photos</span></div>
</div>

Servers are just computers — usually without screens — running 24/7 in big buildings called **data centres**.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
You (client) call a restaurant (server) and order food. You don't go into the kitchen; you just send a request and get a response. The internet is the phone line.
</div>

## What is "the cloud"?

The **cloud** simply means *renting* computers, storage, and software over the internet instead of buying your own machines. Rather than your company buying 100 servers (expensive, hard to maintain), you rent exactly what you need, when you need it, from a cloud provider — and give it back when you're done.

The big three cloud providers (you'll see these constantly):

| Provider | Owned by | Common nickname |
|----------|----------|-----------------|
| **AWS** (Amazon Web Services) | Amazon | "AWS" |
| **Azure** | Microsoft | "Azure" |
| **GCP** (Google Cloud Platform) | Google | "GCP" |

Why the cloud matters for data engineers:
- Data can grow to **petabytes** (millions of gigabytes). No single laptop can handle that. The cloud gives you near-unlimited storage and computing power on demand.
- You can spin up a 100-machine cluster for one hour to crunch huge data, then shut it down and pay only for that hour.
- All the modern data and AI tools (Snowflake, Databricks, BigQuery…) run on the cloud.

## Three things the cloud rents you

<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="cube"></i></span><div><strong>Compute</strong><p>Processing power — machines, CPUs, and GPUs to <em>run</em> programs.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="database"></i></span><div><strong>Storage</strong><p>Space to <em>keep</em> data, e.g. AWS S3, Azure Blob, Google Cloud Storage.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="layers"></i></span><div><strong>Managed services</strong><p>Ready-made tools so you don't build everything yourself — databases, AI models, pipelines.</p></div></div>
</div>

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Don't panic about the cloud yet.</strong> You can learn all the core skills (Python, SQL, data modelling) on your own laptop for free. Cloud comes later, and free tiers let you practise without spending money.</div></div>

> **Key takeaway:** Clients ask, servers answer, the internet connects them. The **cloud** = renting powerful computers and ready-made tools over the internet — where all serious data and AI work now happens.
