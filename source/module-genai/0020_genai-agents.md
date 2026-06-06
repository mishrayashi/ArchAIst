---
id: genai-agents
section: modules
title: GenAI 3 — agents, tool calling & evals
level: Advanced
minutes: 12
tags: genai, agents, tool calling, mcp, must-know
---

Modern GenAI interviews are less about "what is an LLM" and more about **building real AI systems**: agents that use tools, how you evaluate them, and how you keep them safe in production. This lesson covers exactly that.

## Agent vs workflow — know the difference
A **workflow** follows predefined steps. An **agent** uses an LLM to *decide the next action at runtime*, looping until the goal is met.

<div class="flow flow-row">
  <div class="flow-node tone-gold"><strong>Goal</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Decide</strong><span>LLM picks next step</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Act</strong><span>call a tool</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>Observe</strong><span>read result, loop</span></div>
</div>

<div class="callout callout-tip"><span class="cfor">💡</span><div><strong>Interview answer:</strong> "Prefer a <strong>workflow</strong> when the path is predictable and deterministic — it's cheaper, faster, and easier to debug. Reach for an <strong>agent</strong> only when the steps genuinely can't be known in advance."</div></div>

## Tool / function calling
**Tool calling** lets the model request an external function through **structured (JSON) arguments**; your application runs the function and returns the result. The model never executes code itself — it just *asks*.

<div class="flow-title">The tool-calling loop</div>
<div class="flow flow-row">
  <div class="flow-node"><strong>User asks</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>LLM picks a tool</strong><span>+ JSON arguments</span></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node"><strong>App validates &amp; runs</strong></div>
  <div class="flow-link"><i data-ic="arrowRight" class="ic-sm"></i></div>
  <div class="flow-node tone-gold"><strong>Result back to LLM</strong><span>answer or call another tool</span></div>
</div>

### Designing good tools (and handling failure)
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="target"></i></span><div><strong>Keep tools narrow</strong><p>Clear names, specific descriptions, typed inputs, small structured outputs.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="check"></i></span><div><strong>Validate inputs</strong><p>Never trust the model's arguments — schema-check before executing.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="refresh"></i></span><div><strong>Retry &amp; fall back</strong><p>Retry transient errors with backoff; degrade gracefully with clear error messages.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="message"></i></span><div><strong>Human in the loop</strong><p>For risky actions (deletes, payments), require confirmation; log every trace.</p></div></div>
</div>

## Memory, multi-agent & MCP
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="book"></i></span><div><strong>Memory</strong><p>State across turns: conversation summaries, user preferences, task progress, retrieved facts, persistent records.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="network"></i></span><div><strong>Multi-agent systems</strong><p>Specialised agents (researcher, planner, coder) under a supervisor. Use only when roles are separable — one agent is simpler.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="grid"></i></span><div><strong>MCP</strong><p>Model Context Protocol — an open standard for connecting AI apps to external tools &amp; data sources in a uniform way.</p></div></div>
</div>

## Evaluating LLM apps & agents
You can't ship what you can't measure. Define task-specific success criteria, build labelled examples, and gate releases with regression tests.

- **LLM app eval:** measure answer **faithfulness**, relevance, and hallucination rate — automatically *and* with human review.
- **Agent eval:** judge the whole **trajectory**, not just the final answer — correct **tool choice**, **argument accuracy**, number of **steps**, **cost**, **latency**, and **safe behaviour**.
- **Tracing / observability:** log prompts, tool calls, inputs/outputs, tokens, costs, and decisions so failures can be debugged and replayed (e.g. LangSmith).

## Safety — the part juniors skip
<div class="callout callout-warn"><span class="cfor">⚠️</span><div><strong>Prompt injection:</strong> untrusted text (a web page, a document, a user message) that tries to override your instructions, leak the system prompt, or misuse tools. <strong>Treat all external text as untrusted</strong> — validate, isolate, and constrain it. <strong>Excessive agency:</strong> giving the model too much permission or autonomy, so a mistake (or attack) can do real damage. The fix is <strong>least privilege, always</strong> — scope tool access tightly and gate destructive actions.</div></div>

## What production actually checks
<div class="feat-grid">
  <div class="feat"><span class="feat-ic"><i data-ic="zap"></i></span><div><strong>Cost &amp; latency</strong><p>Cache, stream, pick the cheapest model that works, set rate limits.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="chart"></i></span><div><strong>Quality &amp; regressions</strong><p>Evals on every release; watch for model-version drift.</p></div></div>
  <div class="feat"><span class="feat-ic"><i data-ic="target"></i></span><div><strong>Safety &amp; ownership</strong><p>Guardrails, PII handling, and a clear answer to "who owns the output?"</p></div></div>
</div>

> **Key takeaway:** An agent = LLM + tools + memory + a control loop. Design narrow validated tools, evaluate the whole trajectory (not just the answer), trace everything, and lock down permissions — **least privilege, always**.
