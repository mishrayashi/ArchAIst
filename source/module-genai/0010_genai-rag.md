---
id: genai-rag
section: modules
title: GenAI 2 — embeddings, RAG, agents & fine-tuning
level: Advanced
minutes: 13
tags: genai, rag, llm, must-know
---

This is the lesson that makes you employable in GenAI. **RAG** is the single most common production GenAI pattern, and it sits squarely on data-engineering skills.

## The problem: LLMs don't know *your* data
An LLM only knows what it saw in training. It doesn't know your company's documents, last week's data, or private policies — and if you ask anyway, it may **hallucinate**. Two ways to fix this: **RAG** (give it the info at question time) and **fine-tuning** (teach it new behaviour). RAG is usually the right first choice.

## Embeddings — turning meaning into numbers
An **embedding** is a list of numbers (a **vector**) that represents the *meaning* of a piece of text. Texts with similar meaning have vectors that are *close together* in space. This lets computers measure "how related are these two pieces of text?" mathematically (cosine similarity).

<div class="widget-mount" data-widget="embeddings"></div>
```text
"king"  → [0.21, -0.04, 0.88, ...]   (e.g. 1536 numbers)
"queen" → [0.20, -0.02, 0.85, ...]   ← close to "king"
"pizza" → [-0.7, 0.33, 0.10, ...]    ← far away
```

## Vector databases
A **vector database** stores embeddings and finds the *nearest* vectors to a query vector blazingly fast (approximate nearest-neighbour search). Options: **pgvector** (Postgres extension), **FAISS** (library), **Pinecone, Chroma, Milvus, Weaviate, Qdrant**. As an AI Data Engineer, *loading and maintaining these* is often your job.

## RAG — Retrieval-Augmented Generation
RAG = **retrieve** relevant info, then **augment** the prompt with it, so the model **generates** a grounded answer. The flow:

<div class="widget-mount" data-widget="rag"></div>

<div class="flow-title">Indexing · offline — this is a data pipeline</div>
<div class="flow flow-row">
  <div class="flow-node"><strong>Documents</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Chunks</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Embed</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Vector DB</strong></div>
</div>

<div class="flow-title">Answering · at question time</div>
<div class="flow flow-row">
  <div class="flow-node"><strong>Question</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Embed</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Search top-k</strong><span>nearest chunks</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Augment prompt</strong><span>chunks as context</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Grounded answer</strong><span>+ sources</span></div>
</div>

```python
# Conceptual RAG
chunks = split_into_chunks(documents)                 # ~500-token chunks
vectordb.add(embed(chunks))                           # index (offline)

def answer(question):
    q_vec = embed(question)
    context = vectordb.search(q_vec, top_k=5)         # retrieve
    prompt = f"Answer using ONLY this context:\n{context}\n\nQ: {question}"
    return llm(prompt)                                # generate (grounded)
```

<div class="callout callout-note"><span class="cfor">🔑</span><div><strong>Why RAG is a data-engineering job:</strong> the indexing step is literally an ETL pipeline — extract documents, transform (clean + <strong>chunk</strong>), load (embed → vector DB). RAG quality is dominated by <strong>chunking strategy and data quality</strong>, not the model. This is your edge.</div></div>

Things that make RAG good (interview-worthy):
- **Chunking strategy:** size + overlap; split on semantic boundaries, not mid-sentence.
- **Metadata filtering:** store source/date/permissions with chunks; filter before/after retrieval.
- **Re-ranking:** retrieve many, then re-rank for the best few.
- **Hybrid search:** combine keyword (BM25) + vector search.
- **Context order ("lost in the middle"):** models ignore evidence buried in the middle of a long prompt — put the strongest chunks first or last, and prefer fewer, better chunks over more.
- **Citations:** return sources so users can verify (and to fight hallucination).
- **Evals:** measure retrieval quality and answer faithfulness.

## Fine-tuning vs RAG — when to use which
| | RAG | Fine-tuning |
|---|-----|-------------|
| Teaches | New *knowledge / facts* | New *behaviour / style / format* |
| Freshness | Easy — just update the index | Stale — must retrain |
| Cost | Lower | Higher (GPUs) |
| Best for | "Answer from our docs" | "Always reply in our tone/format/task" |

Often you use **both**. And many "fine-tuning" needs are better solved by better prompting + RAG first.

## Fine-tuning, efficiently: LoRA / QLoRA
Full fine-tuning updates *all* billions of weights — expensive. **LoRA (Low-Rank Adaptation)** freezes the original model and trains tiny add-on matrices (~0.1–1% of params): far cheaper, small swappable adapter files, ~95% of the quality for many tasks. **QLoRA** adds quantization to fit training on a single GPU. Tools: Hugging Face **transformers + PEFT**, and **Ray/DeepSpeed** for scale.

## AI agents
An **agent** is an LLM that can **use tools** and take **multi-step actions**: it decides to call a function (search the web, query a DB, run code), reads the result, and continues until the task is done. Frameworks: **LangChain, LlamaIndex, LangGraph**. Powerful but watch cost, latency, error loops, and safety (sandbox tool access!).

## Production concerns (what separates demos from jobs)
- **Cost & latency:** cache results, pick the cheapest model that works, stream responses.
- **Evaluation:** automated evals + human review; track faithfulness and hallucination rate.
- **Guardrails & safety:** input/output filtering, prompt-injection defence, PII handling.
- **Observability:** log prompts, retrievals, tokens, and outcomes (tools like LangSmith).

> **Key takeaway:** **Embeddings** turn meaning into vectors; **vector DBs** find similar ones fast; **RAG** grounds an LLM in *your* data (and its indexing step is an ETL pipeline you can build). Use **RAG for knowledge, fine-tuning (LoRA) for behaviour**, and remember production = cost, evals, guardrails, observability.
