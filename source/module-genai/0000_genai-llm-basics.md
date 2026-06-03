---
id: genai-llm-basics
section: modules
title: GenAI 1 — how LLMs work & prompting
level: Intermediate
minutes: 12
tags: genai, llm, must-know
---

You don't need a PhD to engineer with LLMs — but you do need a correct mental model. This lesson gives you exactly enough of how they work, plus practical prompting.

## What an LLM actually does
A **Large Language Model** is, at its core, a **next-token predictor**. Given some text, it predicts the most likely next chunk of text (a "token"), appends it, and repeats. Trained on a huge slice of the internet, this simple objective produces models that can write, reason, summarise, translate, and code.

<div class="eli"><span class="eli-tag">Explain like I'm new</span>
It's an extraordinarily good autocomplete — one <em>token</em> at a time, with vast context. It isn't "looking things up"; it predicts plausible continuations. Try it:
</div>

<div class="widget-mount" data-widget="nextToken"></div>

## Vocabulary you must know
- **Token:** the unit an LLM reads/writes — roughly ¾ of a word (e.g. "engineering" might be 2 tokens). You pay per token and limits are in tokens.
- **Context window:** how much text (in tokens) the model can consider at once — its short-term memory. Bigger = can read more documents at once.
- **Parameters / weights:** the billions of numbers learned during training (e.g. "8B" = 8 billion parameters). More ≈ more capable but costlier.
- **Temperature:** randomness knob. **0** = focused/deterministic (good for facts, code); **higher** = more creative/varied.
- **Tokenization:** splitting text into tokens before the model sees it.
- **Hallucination:** when a model states something false *confidently*. The central reliability problem of LLMs.
- **Transformer:** the neural-network architecture behind modern LLMs; its key trick is **attention** (weighing which earlier tokens matter for the next one).

## How a model is built (3 stages, high level)
1. **Pre-training:** learn language by predicting next tokens on massive text. Expensive; done by big labs.
2. **Fine-tuning:** further training on specific data/tasks (covered next lesson).
3. **Alignment (RLHF/RLAIF):** tuning so the model is helpful, honest, and safe via human/AI feedback.

## Calling an LLM from code
```python
# Example with the Anthropic SDK (OpenAI's is very similar)
from anthropic import Anthropic
client = Anthropic()   # reads ANTHROPIC_API_KEY from env

resp = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=500,
    temperature=0,                      # deterministic for a factual task
    system="You are a concise data engineering tutor.",
    messages=[{"role": "user", "content": "Explain ETL vs ELT in 3 bullets."}],
)
print(resp.content[0].text)
```
Note the **roles**: `system` (overall instructions/persona), `user` (the request), `assistant` (the model's replies). Multi-turn chat = appending to the `messages` list.

## Prompt engineering — the practical skill
Better prompts = better, more reliable output. The high-impact techniques:
- **Be specific & give context.** Vague in, vague out. State the goal, audience, and format.
- **Assign a role:** "You are an expert data engineer reviewing a pipeline…"
- **Few-shot examples:** show 2–3 input→output examples; the model mimics the pattern.
- **Ask for structure:** "Respond in JSON with keys `summary` and `risks`." Great for programmatic use.
- **Chain-of-thought:** "Think step by step" for reasoning tasks (improves accuracy on logic/maths).
- **Set boundaries:** "If you don't know, say so. Use only the context provided." (reduces hallucination).

```text
WEAK:   "Write SQL for sales."
STRONG: "You are a senior analyst. Given tables customers(id,name,city)
         and orders(id,cust_id,amount), write Postgres SQL returning the
         top 3 cities by total order amount. Return only the SQL."
```

## What "GenAI engineering" really is
90% of GenAI jobs are *not* training models. They're: designing prompts, connecting models to your data (RAG — next lesson), building agents, controlling cost/latency, evaluating quality, and shipping reliable features. It's software + data engineering with a model in the loop — which is why your DE foundation is a superpower here.

> **Key takeaway:** An LLM predicts the next **token**; key knobs are **context window** and **temperature**; the central risk is **hallucination**. Most GenAI work is *using* models well via strong **prompting**, structured output, and grounding — not training them.
