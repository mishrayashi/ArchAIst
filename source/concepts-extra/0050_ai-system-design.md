---
id: ai-system-design
section: concepts
title: AI / ML system design terms
level: Advanced
minutes: 12
tags: ai, genai, mlops, must-know
---

The vocabulary of putting AI into production — what an **AI Data Engineer / GenAI Engineer** must speak fluently. Many of these are the "hidden terms" people drop in meetings.

## The GenAI / RAG stack
- **Embedding** — text/image turned into a vector capturing meaning. See [GenAI 2](#/page/genai-rag).
- **Vector database** — stores embeddings, finds nearest ones fast (pgvector, FAISS, Pinecone, Milvus).
- **RAG (Retrieval-Augmented Generation)** — retrieve relevant chunks, prompt the LLM to answer from them. The default "answer from our data" pattern.
- **Chunking** — splitting documents into pieces to embed; size + overlap dominate RAG quality.
- **Re-ranking** — retrieve many candidates, then reorder for the best few (cross-encoder).
- **Hybrid search** — combine keyword (BM25) + vector search.
- **Context window** — how much text (tokens) the model can consider at once.
- **Tokens / tokenization** — the units models read/write; you pay per token.
- **Grounding & citations** — tying answers to sources to fight hallucination.
- **Hallucination** — confident but false output; the central reliability risk.

## Training & adaptation
- **Pre-training / fine-tuning** — learn language broadly, then specialise on your data.
- **LoRA / QLoRA** — cheap, efficient fine-tuning of tiny adapter weights. See [GenAI 2](#/page/genai-rag).
- **RLHF / alignment** — tuning a model to be helpful/safe via human (or AI) feedback.
- **RAG vs fine-tuning** — RAG for *knowledge/freshness*, fine-tuning for *behaviour/style*. Often both.
- **Prompt engineering** — designing instructions (role, few-shot, structured output, chain-of-thought).

## Agents & orchestration
- **AI agent** — an LLM that uses **tools** (APIs, code, search) and takes multi-step actions.
- **Tool use / function calling** — letting the model invoke defined functions.
- **Guardrails** — input/output filters, prompt-injection defence, PII handling.
- **Evals** — automated quality measurement (faithfulness, accuracy) — the "tests" of AI systems.

## Serving & MLOps
- **Inference** — running a trained model to get predictions. **Batch** (offline, many at once) vs **online/real-time** (low-latency, per-request).
- **Feature store** — serves the *same* computed features for training and live inference (Feast, Vertex/Databricks). Prevents **training–serving skew**.
- **Model registry** — versioned catalogue of trained models with stage (staging/prod) — MLflow.
- **Experiment tracking** — logging runs, params, metrics (MLflow, Weights & Biases).
- **Data / model versioning** — DVC, lakeFS — reproducibility for datasets & models.
- **Quantization** — shrinking model weights (e.g. 4-bit) to run cheaper/faster.
- **vLLM / batching** — high-throughput LLM serving with smart request batching.

## Reliability for ML/AI
- **Data drift** — input distributions change over time, silently degrading models.
- **Concept drift** — the input→output relationship itself changes.
- **Training–serving skew** — features computed differently in training vs production (a top cause of "works in the notebook, fails in prod").
- **A/B testing** — compare model/feature variants on live traffic.
- **Canary / blue-green / shadow deployment** — roll out safely: to a small slice (canary), to a parallel environment you flip to (blue-green), or by running the new model alongside without serving its output (shadow).

<div class="callout callout-note"><span class="cfor"></span><div><span class="ctitle">Say it right:</span> "This is a RAG problem, not a fine-tuning one." "We need a feature store to avoid training–serving skew." "Let's shadow-deploy the new model and watch for drift." These sentences are what separate someone who *uses* AI tools from someone who *engineers* AI systems.</div></div>

> **Key takeaway:** Speak the AI stack — **embeddings → vector DB → RAG (chunking, re-ranking, grounding)**; choose **RAG vs fine-tuning (LoRA)**; productionise with **feature stores, model registries, evals, guardrails**; serve **batch vs online**; and protect against **drift, training–serving skew** with **A/B, canary, shadow** rollouts.
