---
id: ai-ml-dl-genai-llm
section: foundations
title: AI vs ML vs Deep Learning vs GenAI vs LLM
level: Zero
minutes: 10
tags: ai, genai, llm, must-know
---

These five words get mixed up constantly — even by professionals. Let's fix that forever. They are **nested circles**, like Russian dolls, from biggest idea to most specific.

<div class="widget-mount" data-widget="nesting"></div>

```text
┌─────────────────────────────────────────────┐
│ Artificial Intelligence (AI)                 │
│  any machine doing "smart" tasks             │
│  ┌─────────────────────────────────────────┐ │
│  │ Machine Learning (ML)                    │ │
│  │  machines that LEARN from data           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │ Deep Learning (DL)                   │ │ │
│  │  │  ML using neural networks            │ │ │
│  │  │  ┌─────────────────────────────────┐ │ │ │
│  │  │  │ Generative AI (GenAI)            │ │ │ │
│  │  │  │  DL that CREATES new content     │ │ │ │
│  │  │  │   ┌───────────────────────────┐  │ │ │ │
│  │  │  │   │ LLMs (e.g. GPT, Claude)   │  │ │ │ │
│  │  │  │   │  GenAI for text/language  │  │ │ │ │
│  │  │  │   └───────────────────────────┘  │ │ │ │
│  │  │  └─────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 1. Artificial Intelligence (AI) — the broadest idea
Any technique that makes a machine do something we'd call "intelligent." This includes simple rule-based systems (a chess program from 1980, a thermostat) all the way to ChatGPT. **AI is the umbrella term.**

## 2. Machine Learning (ML) — learning from examples
Instead of a human writing every rule, we **show the computer lots of examples and it figures out the pattern itself.**

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
To teach a child "cat," you don't list rules ("four legs, whiskers…"). You point at many cats. Eventually they generalise. ML is the same: show 10,000 labelled photos of cats and dogs, and the model learns to tell them apart — <em>without</em> you writing the rules.
</div>

Classic ML examples: predicting house prices, detecting spam email, recommending products. The tools here are libraries like **scikit-learn**.

## 3. Deep Learning (DL) — ML with neural networks
A **neural network** is a model loosely inspired by brain cells, made of many layers. "Deep" just means *many layers*. Deep learning is what made AI explode after ~2012 because it's brilliant at messy, unstructured data — images, audio, language. Tools: **PyTorch, TensorFlow**.

## 4. Generative AI (GenAI) — AI that *creates*
Most older AI **classified** or **predicted** (cat or dog? fraud or not?). **Generative** AI produces brand-new content: text, images, music, code, video. Image generators (Midjourney, Stable Diffusion) and chatbots are GenAI.

## 5. Large Language Models (LLMs) — GenAI for language
An **LLM** is a generative model trained on enormous amounts of text to understand and produce human language. **ChatGPT, Claude, Gemini, Llama** are LLMs. They power chatbots, coding assistants, summarisers, and translators.

<div class="callout callout-note"><span class="cfor">🔑</span><div>
<strong>One-line definitions to memorise:</strong>
<ul>
<li><strong>AI</strong> = machines doing smart things.</li>
<li><strong>ML</strong> = machines learning patterns from data.</li>
<li><strong>Deep Learning</strong> = ML using many-layered neural networks.</li>
<li><strong>GenAI</strong> = AI that creates new content.</li>
<li><strong>LLM</strong> = a GenAI model specialised in text/language.</li>
</ul>
</div></div>

## How a beginner should feel about this
You do **not** need to build these models from scratch to get a great job. Most "AI / GenAI engineering" jobs are about **using** these models well: feeding them clean data, connecting them to company knowledge, and building reliable systems around them. That's engineering — and it's exactly what this academy teaches.

> **Key takeaway:** Five nested circles — AI ⊃ ML ⊃ Deep Learning ⊃ GenAI ⊃ LLM. Each one is a more specific kind of the one before it.
