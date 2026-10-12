// Topic-specific middle and advanced layers for concepts that previously had
// only a single beginner explanation.  Shared rendering lives in index.js.

export const TOPIC_GUIDANCE = {
  'raw-api': {
    intermediate: `<p>Model APIs are stateless: every request must carry the messages and settings required for that turn. Learn the roles, typed content blocks, token usage, stop reasons, request IDs, and how the provider SDK maps onto the underlying HTTP request. Build a small adapter that returns your own response type instead of spreading vendor objects through the app.</p>`,
    expert: `<p>Own the conversation budget explicitly. Summarise or retrieve old turns instead of replaying an ever-growing transcript, separate trusted instructions from untrusted content, and record the exact model/config/prompt version for reproducibility. Use connection pooling, deadlines, idempotency where available, and contract tests that detect provider response-shape changes.</p>`,
  },
  'tool-use': {
    intermediate: `<p>Treat tool calling as a protocol: publish a narrow JSON schema, let the model propose a call, validate its arguments, execute trusted code, and return a typed result for the next model turn. Keep tool descriptions unambiguous and report failures as structured observations the model can reason about.</p>`,
    expert: `<p>The model is an untrusted planner, not an authorisation system. Enforce permissions, tenant boundaries, timeouts, budgets, idempotency, and approval gates outside the model. Use stable tool-call IDs, deduplicate retries, redact sensitive results, and evaluate both final answers and call trajectories—including unnecessary or unsafe actions.</p>`,
  },
  'structured-outputs': {
    intermediate: `<p>Define the output contract first with a JSON Schema or typed model. Ask the provider to constrain generation when supported, then parse and validate every response. Distinguish syntax validity from semantic validity: valid JSON can still contain an impossible date or an unsupported enum combination.</p>`,
    expert: `<p>Version schemas, keep them small enough for reliable decoding, and design evolution rules for new optional fields. Repair only safe, local errors; otherwise retry with clear validation feedback. Monitor validation failures by model and schema version, and use property-based tests to probe edge cases such as nulls, Unicode, large numbers, and extra fields.</p>`,
  },
  streaming: {
    intermediate: `<p>Streaming changes perceived latency, not model compute. Consume incremental events, assemble text and tool-input deltas by event type, and expose a cancellation path. The user interface must handle partial Markdown, reconnects, and a final event carrying usage and stop metadata.</p>`,
    expert: `<p>Design for backpressure: a slow browser must not let buffers grow without bound. Propagate disconnect cancellation to the provider, separate time-to-first-token from tokens-per-second, and do not persist or act on a partial tool call. Treat the completed, validated event stream as the commit point.</p>`,
  },
  'error-handling': {
    intermediate: `<p>Classify failures before retrying: validation and authentication errors require a fix; rate limits and transient server failures may be retried; timeouts are ambiguous and may need idempotency. Use capped exponential backoff with jitter and honour provider retry headers.</p>`,
    expert: `<p>Retries are load multipliers. Bound attempts by a total deadline, add concurrency and token-rate limiters, use circuit breakers during sustained outages, and shed optional work before critical work. Record attempt count, wait time, request ID, error class, and final outcome without logging secrets.</p>`,
  },

  'rag-overview': {
    intermediate: `<p>Build RAG as separate, measurable stages: ingest and normalise sources, split them into retrievable units, embed and index, transform the query, retrieve candidates, rerank, assemble context with citations, and generate an answer constrained to that evidence. A failure in any stage can look like “the model hallucinated.”</p>`,
    expert: `<p>Make provenance a first-class data structure from source through answer. Version the corpus, parser, chunker, embedding model, and index together; enforce document-level access control before ranking; and evaluate retrieval separately from generation. Add abstention when evidence is weak instead of forcing an answer.</p>`,
  },
  chunking: {
    intermediate: `<p>Choose chunks around the retrieval task, not an arbitrary character count. Preserve headings and metadata, add controlled overlap only where boundaries lose meaning, and tune size against both embedding quality and generation context. Parent-child retrieval often combines small search units with larger reading units.</p>`,
    expert: `<p>Chunking is a data-model decision. Keep stable chunk IDs and source offsets, detect boilerplate and duplicate fragments, and re-index deterministically. Evaluate boundary recall with real queries, compare semantic and structure-aware splitting, and measure the context precision lost when large chunks carry irrelevant text.</p>`,
  },
  'embedding-models-rag': {
    intermediate: `<p>Compare models on your own language, domain, query/document lengths, and retrieval metric. Respect each model’s required prefixes and normalisation, and never mix vectors from different model versions in one index. Dimension affects storage and speed, not just quality.</p>`,
    expert: `<p>Create a migration path with dual indexes or a full atomic rebuild, because an embedding upgrade changes the coordinate system. Track drift, multilingual performance, hard negatives, latency, and cost. Fine-tune only after a strong evaluation set shows a stable domain-specific gap.</p>`,
  },
  'vector-dbs': {
    intermediate: `<p>A vector database combines approximate-nearest-neighbour indexes with metadata, filtering, persistence, and update APIs. Learn the recall/latency trade-off of the chosen index, filter before or during search where possible, and keep the source of truth outside the index.</p>`,
    expert: `<p>Tune index parameters against a brute-force recall sample, plan namespaces and tenant isolation, and monitor index freshness. Use idempotent upserts, tombstones or verified deletes, backups, and a rebuild procedure. Capacity planning must include vectors, metadata, replicas, and temporary space during re-indexing.</p>`,
  },
  'hybrid-search': {
    intermediate: `<p>Dense retrieval captures meaning while lexical retrieval catches exact terms, IDs, and rare names. Run both, normalise or rank-fuse their results, then optionally rerank. Reciprocal rank fusion is a strong baseline because it combines ranks without assuming comparable raw scores.</p>`,
    expert: `<p>Segment evaluation by query type; hybrid gains often come from a small but valuable class of exact-match queries. Tune candidate counts and fusion weights on held-out data, preserve filters in both branches, and log which retriever contributed each selected result for diagnosis.</p>`,
  },
  reranking: {
    intermediate: `<p>Retrieve broadly with a fast method, then score a smaller candidate set with a more accurate cross-encoder or LLM. The reranker sees the query and document together, which improves ordering at the cost of added latency.</p>`,
    expert: `<p>Optimise candidate depth, reranker batch size, and final context count jointly. Cache stable scores, calibrate thresholds for abstention, and evaluate marginal gain over retrieval alone. Reranking cannot recover a relevant document that never entered the candidate set.</p>`,
  },
  'query-transform': {
    intermediate: `<p>Rewrite conversational questions into standalone search queries, generate a small set of alternative phrasings, or route to specialised indexes. HyDE embeds a hypothetical answer when answer-shaped text retrieves better than the original question.</p>`,
    expert: `<p>Transformations can silently change intent. Retain the original query, constrain expansion count, deduplicate candidates, and compare transformed and untransformed recall. Route only when confidence is high, and include a fallback path so a bad classifier does not make relevant data unreachable.</p>`,
  },
  'graph-rag': {
    intermediate: `<p>Graph retrieval is useful when questions depend on entities and relationships across documents. Extract entities and edges with provenance, resolve aliases, traverse a bounded neighbourhood, and combine graph facts with source text for generation.</p>`,
    expert: `<p>Entity resolution and graph freshness dominate quality. Attach confidence and source evidence to every edge, limit traversal to avoid noisy explosions, and enforce permissions during traversal. Compare against a simpler vector baseline; graph construction cost is justified only by relational gains.</p>`,
  },
  'multimodal-rag': {
    intermediate: `<p>Parse each modality into retrievable units: text blocks, table structures, page images, audio segments, or video frames. Preserve page, time, and bounding-box coordinates so an answer can cite and display the exact evidence.</p>`,
    expert: `<p>Late fusion keeps modality-specific retrievers and combines rankings; joint embeddings search a shared space. Evaluate OCR and extraction errors separately from retrieval. Store derived captions as searchable aids, not unquestioned ground truth, and protect sensitive media with the same access rules as text.</p>`,
  },
  'rag-eval': {
    intermediate: `<p>Measure retrieval and generation separately. Retrieval metrics include hit rate, recall@k, MRR, and nDCG; answer metrics include correctness, faithfulness to context, relevance, and citation accuracy. Build the dataset from real questions with known evidence.</p>`,
    expert: `<p>LLM judges need calibrated rubrics, position-bias checks, and periodic human audit. Slice results by source, query type, language, and answerability; averages hide regressions. Track corpus and pipeline versions so a score can be reproduced and compared fairly.</p>`,
  },
  'when-not-rag': {
    intermediate: `<p>Use long context when the corpus is small and supplied per request, a normal database for exact structured facts, tools for live transactional state, and fine-tuning for style or repeated behaviour. RAG is for selecting external knowledge, not every information problem.</p>`,
    expert: `<p>Choose architecture with an evaluation and an operational budget. Retrieval adds ingestion, permissions, freshness, and debugging burden. A hybrid system may use SQL for authoritative fields, search for documents, and a model only for synthesis; keep each source’s authority explicit.</p>`,
  },
  'contextual-retrieval': {
    intermediate: `<p>Add a short document-aware context to each chunk before embedding or indexing so isolated passages retain their meaning. Late chunking instead embeds a long document first and derives chunk representations from context-aware token states.</p>`,
    expert: `<p>Context generation increases ingestion cost and may inject mistakes, so store it separately and evaluate with and without it. Preserve the original text for quoting, cap synthetic context length, and rebuild consistently when the source or model changes.</p>`,
  },
  'semantic-caching': {
    intermediate: `<p>A semantic cache embeds a new request and reuses a previous result when similarity and policy conditions pass. Include model, prompt version, tenant, permissions, and relevant settings in the cache key, not only the user text.</p>`,
    expert: `<p>A false hit is more dangerous than a miss. Tune thresholds by intent, exclude personalised or time-sensitive queries, set freshness rules, and store evidence needed to explain reuse. Measure hit rate, quality delta, cost saved, and unsafe cross-context matches.</p>`,
  },

  'tool-error-recovery': {
    intermediate: `<p>Return typed tool errors that distinguish invalid arguments, permission denial, timeout, not-found, and transient failure. Give the agent enough detail to repair the plan without exposing secrets or internal stack traces.</p>`,
    expert: `<p>Bound reflection and retries with step, time, and cost budgets. Detect repeated identical calls, require idempotency for mutating tools, and escalate high-impact recovery to a human. Evaluate whether the agent recovers safely—not merely whether it eventually succeeds.</p>`,
  },
  'react-loop': {
    intermediate: `<p>A ReAct agent cycles through state: inspect the goal, choose an action, observe the result, and decide whether to continue. Keep observations structured and expose a clear terminal condition rather than relying on the model to stop eventually.</p>`,
    expert: `<p>Persist the trajectory as events, enforce budgets outside the prompt, and separate private planning from user-visible explanations. Add loop detection, tool allowlists, state validation, and checkpoints. Prefer a deterministic workflow whenever the action sequence is known in advance.</p>`,
  },
  langgraph: {
    intermediate: `<p>Model the agent as state passed through nodes connected by conditional edges. Nodes perform one testable operation; reducers merge updates; checkpoints allow pause, resume, and human review. Draw the graph before implementing it.</p>`,
    expert: `<p>Design state schemas and migration carefully because persisted runs outlive code versions. Make side-effecting nodes idempotent, checkpoint before external actions, and test routes with deterministic fake models. Trace state diffs and edge decisions rather than only final text.</p>`,
  },
  'memory-systems': {
    intermediate: `<p>Separate short-term working context from long-term semantic facts, episodic events, and procedural preferences. Memory requires extraction, storage, retrieval, and forgetting policies; a chat transcript alone is not a memory system.</p>`,
    expert: `<p>Memory creates privacy and correctness risks. Record provenance, confidence, owner, scope, expiry, and consent; let users inspect and delete it. Resolve contradictions, prevent one tenant’s facts reaching another, and evaluate whether retrieved memory actually improves the task.</p>`,
  },
  'multi-agent': {
    intermediate: `<p>Split agents only when roles have genuinely different tools, context, or parallel work. Define a coordinator, typed handoff payloads, ownership of shared state, and a merge rule for conflicting outputs.</p>`,
    expert: `<p>More agents multiply calls, latency, failure modes, and prompt-injection surfaces. Add end-to-end budgets, deadlock and loop detection, isolated permissions, and trajectory evaluation. Compare against one well-instructed agent; orchestration must earn its complexity.</p>`,
  },
  'mcp-a2a': {
    intermediate: `<p>MCP standardises how a host discovers tools and resources exposed by servers; A2A-style protocols describe task exchange between independent agents. Understand capability discovery, transport, schemas, authentication, and trust boundaries.</p>`,
    expert: `<p>Treat remote capabilities as supply-chain dependencies. Pin versions, validate schemas, authenticate both ends, scope credentials per server, and require approval for dangerous operations. Log capability use and sanitise all returned content because protocol-compliant does not mean trustworthy.</p>`,
  },
  'agentic-rag': {
    intermediate: `<p>Expose retrieval as a tool so the agent can decide whether, where, and how to search. Let it assess evidence, reformulate weak queries, and stop once the answer is sufficiently supported.</p>`,
    expert: `<p>Bound retrieval loops and keep an audit trail linking claims to evidence from each iteration. Grade evidence before generation, defend against instructions embedded in retrieved documents, and compare adaptive retrieval against a cheaper fixed pipeline on the same eval set.</p>`,
  },
  'browser-agents': {
    intermediate: `<p>Prefer structured DOM or accessibility targets when available and vision coordinates when necessary. Verify page state before and after each action, wait on conditions rather than fixed sleeps, and separate navigation from irreversible actions.</p>`,
    expert: `<p>Run browser agents in isolated profiles or sandboxes with minimal credentials. Treat pages as hostile, block secret exfiltration, require confirmation for purchases or messages, and capture screenshots plus action traces. Design recovery for layout changes, stale elements, pop-ups, and partial submissions.</p>`,
  },
  guardrails: {
    intermediate: `<p>Layer controls: validate input, separate instructions from data, minimise tool permissions, constrain output schemas, and authorise actions in deterministic code. Content filters are one layer, not a complete security design.</p>`,
    expert: `<p>Assume prompt injection cannot be perfectly detected. Use least privilege, data-flow controls, sandboxing, taint tracking for untrusted content, and human approval at high-impact boundaries. Red-team indirect injection and cross-tenant leakage, then monitor bypass attempts in production.</p>`,
  },
  'agent-benchmarks': {
    intermediate: `<p>Evaluate agents in reproducible environments with a clear success predicate, fixed starting state, and captured trajectory. Score task completion, tool correctness, steps, cost, latency, and policy compliance.</p>`,
    expert: `<p>Prevent benchmark leakage and brittle grading with hidden cases, multiple seeds, environment reset, and human audit. Build adversarial suites for injection, ambiguous instructions, tool failures, and unsafe shortcuts. A high final-answer score cannot excuse a dangerous trajectory.</p>`,
  },

  evals: {
    intermediate: `<p>Start from product decisions: what failure would block release? Build representative inputs, reference facts or rubrics, deterministic checks where possible, and model/human grading where necessary. Store every run with prompt, model, config, and dataset version.</p>`,
    expert: `<p>Measure judge agreement, calibrate thresholds against humans, and report confidence intervals rather than a single noisy score. Slice by risk and use case, maintain challenge sets, and separate development from untouched test data to avoid tuning on the benchmark.</p>`,
  },
  observability: {
    intermediate: `<p>Trace each request across retrieval, model calls, tools, and post-processing. Record safe prompt/version identifiers, token counts, latency, cost, errors, and quality feedback with a shared correlation ID.</p>`,
    expert: `<p>Use sampling and redaction so observability does not become a privacy leak or cost centre. Define service-level objectives for latency, error rate, and quality proxies; detect drift by model and prompt version; and support replay with sensitive inputs replaced by controlled fixtures.</p>`,
  },
  'cost-latency': {
    intermediate: `<p>Measure before optimising. Reduce unnecessary context and output, cache stable prefixes and results, batch offline work, parallelise independent calls, and route easy requests to a cheaper model that passes the same eval.</p>`,
    expert: `<p>Optimise the whole distribution, not only the average: p95 latency, queue time, retry amplification, and long-output tails drive capacity. Build quality-constrained routing, per-feature budgets, admission control, and graceful degradation when spend or latency limits are reached.</p>`,
  },
  'regression-testing': {
    intermediate: `<p>Run a small deterministic smoke suite on every change and a larger statistical suite on scheduled builds. Compare against an approved baseline, enforce risk-weighted thresholds, and show changed examples—not just aggregate numbers—in review.</p>`,
    expert: `<p>Account for model nondeterminism with repeated samples, paired comparisons, and confidence intervals. Pin what can be pinned, record provider versions, quarantine flaky graders, and require explicit approval when a quality gain trades off safety, latency, or cost.</p>`,
  },

  'fastapi-docker': {
    intermediate: `<p>Separate request validation, orchestration, and provider adapters. Use async only for non-blocking I/O, stream with disconnect handling, expose health/readiness endpoints, and inject configuration through environment or a secret manager. Build a minimal non-root container with pinned dependencies.</p>`,
    expert: `<p>Set worker and connection limits from measured concurrency, propagate deadlines and cancellation, and shut down gracefully so in-flight requests finish or fail clearly. Scan and sign images, use multi-stage builds, drop Linux capabilities, and keep state in external services so instances can scale horizontally.</p>`,
  },
  'inference-serving': {
    intermediate: `<p>Serving engines batch requests and reuse a KV cache to keep accelerators busy. Understand prefill versus decode, quantisation, tensor parallelism, continuous batching, and the throughput/latency trade-off when choosing limits.</p>`,
    expert: `<p>Capacity-plan with real prompt and output length distributions. Monitor time-to-first-token, inter-token latency, queue depth, cache utilisation, memory fragmentation, and rejected requests. Use admission control and autoscaling carefully because loading weights is slow and GPU memory is a hard boundary.</p>`,
  },
  'security-prod': {
    intermediate: `<p>Threat-model the full data path: user input, retrieved content, model provider, tools, logs, caches, and analytics. Scope secrets and service identities, isolate tenants in every query, redact sensitive data, and rate-limit by both requests and tokens.</p>`,
    expert: `<p>Use defence in depth with egress controls, encryption, audit trails, key rotation, retention/deletion workflows, and incident response. Test cross-tenant access and indirect prompt injection. Vendor contracts and deployment regions are part of the security architecture, not paperwork after launch.</p>`,
  },
  'managed-vs-selfhosted': {
    intermediate: `<p>Compare quality, total latency, traffic shape, data residency, availability, and operational skill—not just token price versus GPU price. Prototype with measured traffic and include idle capacity, engineering time, and failover in the model.</p>`,
    expert: `<p>Use a workload model to find the real crossover point and revisit it as models and prices change. Design a provider abstraction without pretending models are interchangeable; capability evals and prompt variants belong behind the route. Hybrid systems need explicit privacy and fallback rules.</p>`,
  },

  moe: {
    intermediate: `<p>A router selects a small number of feed-forward experts for each token, giving the model high parameter capacity without activating every parameter. Training adds load-balancing objectives so traffic does not collapse onto a few experts.</p>`,
    expert: `<p>MoE serving is limited by routing imbalance, expert communication across devices, and memory bandwidth. Distinguish total from active parameters when estimating cost. Router precision, expert parallelism, capacity factors, and dropped-token policy all affect quality and throughput.</p>`,
  },
  'speculative-decoding': {
    intermediate: `<p>A fast draft model proposes several tokens; the target model verifies them in one pass and accepts the matching prefix without changing its output distribution. Speed-up depends on acceptance rate and the relative cost of draft and target.</p>`,
    expert: `<p>Benchmark on real traffic because creative tasks, sampling settings, and domain mismatch reduce acceptance. Tune draft length dynamically, include batching effects, and measure end-to-end latency—not isolated tokens per second. Extra heads and self-speculative methods trade deployment simplicity against training work.</p>`,
  },
  'test-time-compute': {
    intermediate: `<p>Spend more inference work on hard tasks through longer reasoning, multiple candidates, search, tool use, or a verifier. Allocate the budget by estimated difficulty instead of applying the maximum to every request.</p>`,
    expert: `<p>More reasoning is not monotonically better; models can reinforce an early error. Use independent samples, calibrated verifiers, stopping rules, and compute-aware evals. Report accuracy against cost and latency curves so the product can choose an operating point.</p>`,
  },
  distillation: {
    intermediate: `<p>Generate or collect teacher targets, train a smaller student on responses or softened probability targets, and evaluate it on held-out task data. Task-specific students can retain useful quality while becoming much cheaper.</p>`,
    expert: `<p>Control teacher errors, licensing, privacy, and data diversity. Mix hard labels with soft targets where available, tune temperature, and check calibration and safety—not only average accuracy. Distillation transfers behaviour and biases; it does not prove factual correctness.</p>`,
  },
  'synthetic-data-rlaif': {
    intermediate: `<p>Use strong models to create diverse examples, critiques, and preference pairs, then filter with rules, judges, and deduplication. Keep a human-authored validation set that synthetic generation never sees.</p>`,
    expert: `<p>Prevent feedback loops and model collapse by mixing trusted real data, tracking generator versions, measuring diversity, and rejecting self-consistent but wrong samples. Audit the judging constitution and demographic slices; scalable feedback also scales systematic bias.</p>`,
  },
  'constrained-generation': {
    intermediate: `<p>Compile a schema, grammar, or regular expression into allowed next-token choices so invalid syntax cannot be emitted. This guarantees form, while application validation still guarantees meaning and permissions.</p>`,
    expert: `<p>Complex schemas can create slow or empty token sets, and tokenisation makes some constraints expensive. Cache compiled grammars, keep schemas shallow, define repair/failure behaviour, and test Unicode, recursion, optional branches, and provider-specific limitations.</p>`,
  },
  'voice-agents': {
    intermediate: `<p>Build a streaming pipeline with voice-activity detection, speech recognition, model reasoning, and speech synthesis. Optimise perceived responsiveness with partial transcripts and early audio while supporting interruption and correction.</p>`,
    expert: `<p>Measure endpointing delay, first-audio latency, transcription error, and task success by accent and environment. Handle barge-in by cancelling downstream work, protect audio and transcripts as sensitive data, and use explicit confirmations before high-impact spoken actions.</p>`,
  },
  'model-selection': {
    intermediate: `<p>Turn requirements into an eval matrix: quality by task, context and modality needs, latency, cost, privacy, region, rate limits, and operational fit. Select the cheapest option that clears the required thresholds.</p>`,
    expert: `<p>Use routing only when classifier errors and operational complexity are included in the eval. Maintain fallback and migration plans, rerun benchmarks as providers change models, and avoid overfitting prompts to one benchmark or treating public leaderboard scores as product evidence.</p>`,
  },
  'data-engineering-llm': {
    intermediate: `<p>Build ingestion as an idempotent pipeline: acquire, parse, normalise, classify, redact, deduplicate, validate, version, and publish. Preserve raw inputs and provenance while making each derived artefact reproducible.</p>`,
    expert: `<p>Define data contracts and quality SLOs for freshness, completeness, duplication, schema drift, and PII leakage. Use content hashes, lineage, quarantine, backfills, and deletion propagation. Prevent train/eval contamination and enforce access controls before data enters embeddings or logs.</p>`,
  },
}

