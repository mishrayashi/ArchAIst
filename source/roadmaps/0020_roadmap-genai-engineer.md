---
id: roadmap-genai-engineer
section: roadmaps
title: Roadmap: → GenAI / AI Engineer
level: Intermediate
minutes: 9
tags: roadmap, genai, llm
---

This roadmap assumes you can code in Python (do Phases 1–2 of the DE roadmap first if not). GenAI engineering is very learnable because you mostly *use* powerful models rather than build them.

## Phase 1 — Python + data fluency (prereq)
- Solid Python, working with APIs and JSON, environment management.
- Enough SQL to pull data. Enough data sense to know clean vs dirty.

## Phase 2 — Understand the models (Weeks 1–3)
- How **LLMs** work at a useful level: tokens, context window, temperature, embeddings. → *GenAI module*
- **Prompt engineering**: clear instructions, few-shot examples, structured output, system prompts.
- Call an LLM API from Python (the Claude or OpenAI SDK). Build a tiny CLI chatbot.

## Phase 3 — RAG & vectors (Weeks 4–7)
- **Embeddings**: turning text into vectors; similarity search. → *GenAI module*
- **Vector databases**: pgvector, FAISS, Pinecone, Chroma — store & query embeddings.
- **RAG** (Retrieval-Augmented Generation): chunk documents → embed → retrieve → prompt. Build a "chat with your PDFs" app.
- Frameworks: **LangChain** / **LlamaIndex** (learn one; understand what they automate).

## Phase 4 — Agents, evals & production (Weeks 8–12)
- **AI agents & tool use**: letting a model call functions/APIs and take multi-step actions.
- **Evaluation**: measuring quality, reducing **hallucinations**, guardrails, safety.
- **Production concerns**: cost control, caching, latency, streaming responses, observability.
- **MLOps-lite**: versioning prompts, monitoring, A/B testing outputs.
- **Project:** a production-style RAG assistant over a real document set, with evals and a simple web UI.

## Phase 5 — (Optional) go deeper toward LLM Engineer
- Deep learning fundamentals + **PyTorch**.
- **Fine-tuning** with Hugging Face **transformers** + **PEFT/LoRA**.
- **Serving & optimisation**: quantization, **vLLM**, GPU inference, distributed training (**Ray**).

<div class="callout callout-note"><span class="cfor">🧭</span><div><strong>GenAI vs LLM split:</strong> Stop after Phase 4 and you're a strong <strong>GenAI Engineer</strong>. Continue into Phase 5 and you're heading toward <strong>LLM Engineer</strong>. Most jobs today are Phase 1–4.</div></div>

## Don't skip the data part
The biggest mistake new GenAI engineers make is treating data as an afterthought. RAG quality lives or dies on **data quality and chunking**. The DE skills you learn here are your unfair advantage.

## Your clickable study track
1. [Python 1 — basics](#/page/py-basics) · [Python 2 — pandas](#/page/py-data)
2. [SQL 1 — querying](#/page/sql-basics) (enough to pull data)
3. [GenAI 1 — how LLMs work & prompting](#/page/genai-llm-basics)
4. [GenAI 2 — embeddings, RAG, agents & fine-tuning](#/page/genai-rag)
5. [System design: HLD/LLD](#/page/hld-lld) · [Data quality & governance](#/page/data-quality-governance)
6. Drill the [Interview Bank](#/interview) — filter role = GenAI Engineer

> **Key takeaway:** Models → prompts → RAG/vectors → agents/evals/production. You can be a hireable GenAI engineer in ~3 months on top of Python, because you're using models, not training them. Go deeper only if you want the LLM-Engineer path.
