// Per-concept enrichment layered on top of the extracted PHASES data:
//   definition — a crisp, textbook-style "what this actually is"
//   subtypes   — the meaningful sub-kinds/variants of the topic, each with a
//                concrete example so the idea is understandable at a glance
// Keyed by concept id. Rendered by ConceptView above the original body.

export const EXTRAS = {
  /* ===================== PHASE 00 — PREREQUISITES ===================== */
  'py-async': {
    definition: 'A concurrency model where a single thread runs an event loop that suspends a coroutine at each `await` (typically I/O waits) and runs other coroutines meanwhile — overlapping many network calls without threads or extra CPU.',
    subtypes: [
      { name: 'Coroutine (async def)', desc: 'A function that can pause and resume; calling it returns an awaitable, it does not run until awaited.', example: 'async def fetch(): ...  → coro = fetch()  → await coro' },
      { name: 'asyncio.gather', desc: 'Schedules many awaitables concurrently and waits for all — the workhorse for fan-out API calls.', example: 'results = await asyncio.gather(*[call(p) for p in prompts])' },
      { name: 'Semaphore (bounded concurrency)', desc: 'Caps how many coroutines run at once so you stay under provider rate limits.', example: 'sem = asyncio.Semaphore(10);  async with sem: await call(p)' },
      { name: 'Task / create_task', desc: 'Fire-and-track a coroutine in the background while you keep doing other work.', example: 'task = asyncio.create_task(worker()); ...; await task' },
    ],
  },
  'rest-json': {
    definition: 'The request/response contract behind nearly every LLM call: an HTTP method + URL, headers (auth, content-type), a JSON body, and a JSON response carrying content, token usage, and a stop reason — plus a status code signalling success or failure class.',
    subtypes: [
      { name: 'Request anatomy', desc: 'Method, URL, headers, and body that together define one call.', example: 'POST /v1/messages  ·  header: x-api-key  ·  body: {model, messages, max_tokens}' },
      { name: '2xx success', desc: 'The call worked; parse content + usage from the body.', example: '200 → {"content":[...], "usage":{"input_tokens":..,"output_tokens":..}}' },
      { name: '4xx client errors', desc: 'Your request is wrong (400 schema, 401 auth, 429 rate limit) — fixing/backing off is on you.', example: '429 Too Many Requests → back off and retry with exponential delay' },
      { name: '5xx server errors', desc: 'Provider-side failure; transient, so retry with backoff.', example: '529 Overloaded → retry after a short, growing wait' },
    ],
  },
  'git': {
    definition: 'A distributed version-control system that snapshots your files into commits on branches, letting you diff, revert, and merge — the substrate every prompt template, eval set, and agent graph lives in.',
    subtypes: [
      { name: 'The daily loop', desc: 'clone → branch → commit → push → pull request: the core cycle you must be fluent in.', example: 'git switch -c fix-prompt && git commit -am "tighten system prompt" && git push' },
      { name: 'Branching & tagging', desc: 'Isolate risky changes and mark known-good states you can roll back to.', example: 'git tag v1-eval-0.82  # the prompt version that scored 0.82' },
      { name: 'Ignoring secrets/data', desc: 'Keep API keys and large artifacts out of history from day one.', example: '.gitignore: .env, *.faiss, data/*.parquet' },
      { name: 'Bisect', desc: 'Binary-search history to find the commit that dropped quality.', example: 'git bisect start; git bisect bad; git bisect good v1' },
    ],
  },
  'math-basics': {
    definition: 'The three ideas that recur across embeddings, attention, and retrieval: vectors as points in space, dot-product/cosine as a similarity measure, and softmax turning scores into a sampled probability distribution.',
    subtypes: [
      { name: 'Vectors as points', desc: 'An embedding is a coordinate in high-dimensional space; nearby = similar meaning.', example: '"dog" → [0.12, -0.4, ...], "puppy" lands close by' },
      { name: 'Dot product & cosine', desc: 'Cosine measures the angle between vectors, ignoring length — the core RAG relevance signal.', example: 'cos(θ) = (A·B)/(‖A‖‖B‖);  1.0 = same direction' },
      { name: 'Softmax', desc: 'Converts raw logits into probabilities that sum to 1; temperature reshapes it.', example: 'softmax([2,1,0]) ≈ [0.67, 0.24, 0.09]' },
      { name: 'Norms & distance', desc: 'L2/Euclidean distance is the alternative to cosine for nearest-neighbour search.', example: '‖A−B‖ small → A and B are close in the space' },
    ],
  },

  /* ===================== PHASE 01 — LLM FOUNDATIONS ===================== */
  'transformer': {
    definition: 'A neural architecture built from stacked identical blocks, each combining multi-head self-attention (letting every token weigh every other token) with a feed-forward network, wrapped in residual connections and layer norm — enabling parallel processing of whole sequences.',
    subtypes: [
      { name: 'Self-attention (Q·K·V)', desc: 'Each token forms a Query, Key, and Value; attention weight = Query·Key, output = weighted sum of Values.', example: 'token "it" attends strongly to "cat" it refers to' },
      { name: 'Multi-head attention', desc: 'Several attention computations in parallel, each tracking a different relationship.', example: 'head 1 → grammar agreement, head 2 → long-range topic' },
      { name: 'Feed-forward network', desc: 'Per-token two-layer MLP applied after attention for extra transformation capacity.', example: 'Linear → GeLU → Linear on each token independently' },
      { name: 'Residual + LayerNorm', desc: 'Skip connections and normalization that make stacking dozens of blocks trainable.', example: 'x = x + Attention(LayerNorm(x))' },
      { name: 'Decoder-only vs encoder-decoder', desc: 'Chat LLMs are decoder-only (self-attention + causal mask); translation-style models add cross-attention.', example: 'GPT/Claude = decoder-only; original T5 = encoder-decoder' },
    ],
  },
  'tokenization': {
    definition: 'The process of converting text into integer token IDs from a fixed vocabulary (usually via Byte Pair Encoding), the units a model actually reads, is billed on, and fits into its context window.',
    subtypes: [
      { name: 'Byte Pair Encoding (BPE)', desc: 'Greedily merges the most frequent adjacent pairs into subword tokens.', example: '"tokenization" → "token" + "ization"' },
      { name: 'WordPiece', desc: 'BERT-family variant that marks subword continuations.', example: '"playing" → "play" + "##ing"' },
      { name: 'SentencePiece / Unigram', desc: 'Language-agnostic tokenization that treats input as raw bytes/characters, no pre-tokenization.', example: 'used by Llama/T5; handles spaces as "▁"' },
      { name: 'Special tokens', desc: 'Reserved IDs that mark structure rather than text.', example: '<|endoftext|>, [BOS], role/turn delimiters' },
    ],
  },
  'embeddings': {
    definition: 'A fixed-length vector that encodes the meaning of a piece of text as a point in high-dimensional space, so semantic similarity becomes geometric closeness (cosine/Euclidean) — the backbone of retrieval.',
    subtypes: [
      { name: 'Dedicated embedding models', desc: 'Models trained so a whole sentence/doc vector is comparable — what you use for RAG.', example: 'text-embedding-3-large, BGE, E5' },
      { name: 'Internal token embeddings', desc: 'The per-token vectors inside a transformer before attention; not usable externally.', example: 'the lookup table at layer 0 of GPT' },
      { name: 'Dense vs sparse', desc: 'Dense = few hundred/thousand floats (semantic); sparse = vocab-sized, mostly zeros (lexical).', example: 'dense: [0.1,...]; sparse: SPLADE term weights' },
      { name: 'Dimensionality tradeoff', desc: 'More dims capture nuance but cost more storage/compute; some models allow truncation (MRL).', example: '3072-dim vs 1024-dim of the same model' },
    ],
  },
  'decoding': {
    definition: 'The autoregressive loop that generates text one token at a time — the model outputs a probability distribution over the vocabulary, a sampling strategy picks the next token, it is appended, and the process repeats.',
    subtypes: [
      { name: 'Greedy / temperature', desc: 'Temperature scales logits before softmax: low = deterministic/peaky, high = random/flat.', example: 'temp 0 → most likely token every time; temp 1.2 → creative' },
      { name: 'Top-k sampling', desc: 'Restrict sampling to the k highest-probability tokens.', example: 'top_k=40 → sample only among the 40 likeliest' },
      { name: 'Top-p (nucleus)', desc: 'Sample from the smallest set of tokens whose cumulative probability ≥ p.', example: 'top_p=0.9 → dynamic cutoff by probability mass' },
      { name: 'Repetition penalty', desc: 'Down-weights already-used tokens to reduce loops.', example: 'frequency_penalty > 0 → fewer repeated phrases' },
    ],
  },
  'context-window': {
    definition: 'The maximum number of tokens (prompt + output) a model can attend to in one call; everything the model "knows" for that turn must fit inside it, and cost/latency scale with how full it is.',
    subtypes: [
      { name: 'Input vs output budget', desc: 'The window is shared: a long prompt leaves less room to generate.', example: '200k window, 190k prompt → only ~10k tokens to answer' },
      { name: '"Lost in the middle"', desc: 'Models attend more reliably to the start and end than the middle of long contexts.', example: 'key instruction buried mid-prompt gets ignored' },
      { name: 'Effective vs advertised', desc: 'A model may accept N tokens but reason well over far fewer.', example: '1M-token window but recall degrades past ~128k' },
      { name: 'Context compaction', desc: 'Summarizing or dropping old turns to stay within budget.', example: 'summarize turns 1–20 into a paragraph, keep 21+' },
    ],
  },
  'training-stages': {
    definition: 'The pipeline that turns raw text into a helpful assistant: self-supervised pretraining (predict next token), supervised fine-tuning on curated instruction-response pairs, then preference optimization (RLHF/DPO) to align tone and helpfulness.',
    subtypes: [
      { name: 'Pretraining', desc: 'Next-token prediction over trillions of tokens; produces raw knowledge, not instruction-following.', example: 'base model completes text but won\'t "answer questions"' },
      { name: 'Supervised fine-tuning (SFT)', desc: 'Trains on human-written prompt→response demos to teach the chat format.', example: '{"prompt":"Explain X","response":"X is..."} pairs' },
      { name: 'RLHF', desc: 'A reward model trained on human preference rankings guides RL (PPO) to prefer better answers.', example: 'humans rank A > B → model shifts toward A-style' },
      { name: 'DPO', desc: 'Directly optimizes on preference pairs without a separate reward model — simpler than RLHF.', example: 'train on (chosen, rejected) pairs directly' },
    ],
  },
  'finetuning': {
    definition: 'Adapting a pretrained model to a task/domain/style by continuing training on your data — ranging from updating all weights to cheap low-rank adapters, or preference tuning.',
    subtypes: [
      { name: 'Full fine-tuning', desc: 'Update every weight; maximum control, maximum cost and storage.', example: 'a full copy of a 70B model per task' },
      { name: 'LoRA', desc: 'Freeze the base, train small low-rank adapter matrices — tiny, swappable.', example: 'a few MB adapter on top of a frozen base' },
      { name: 'QLoRA', desc: 'LoRA on a 4-bit quantized base, so large models fine-tune on one GPU.', example: 'fine-tune a 65B model on a single 48GB GPU' },
      { name: 'DPO / preference tuning', desc: 'Fine-tune on chosen/rejected pairs to shape behavior, not add knowledge.', example: 'teach a consistent brand voice from preference data' },
    ],
  },
  'quantization': {
    definition: 'Reducing the numeric precision of model weights (and sometimes activations) from 16/32-bit floats to 8-bit or 4-bit integers, shrinking memory and speeding inference at a usually-small accuracy cost.',
    subtypes: [
      { name: 'FP16 / BF16', desc: 'The common "full precision" serving baseline.', example: '70B model ≈ 140GB in FP16' },
      { name: 'INT8', desc: 'Halves memory vs FP16 with minimal quality loss.', example: 'LLM.int8() weight quantization' },
      { name: 'INT4 / NF4', desc: 'Aggressive 4-bit formats; big savings, some degradation, popular for local inference.', example: 'GGUF Q4_K_M running a 70B model on a laptop' },
      { name: 'PTQ vs QAT', desc: 'Post-training quantization (fast, after the fact) vs quantization-aware training (better quality, needs training).', example: 'GPTQ/AWQ (PTQ) vs QAT during fine-tune' },
    ],
  },
  'prompt-engineering': {
    definition: 'Structuring the text you send a model to reliably elicit the behavior you want — via clear instructions, examples, reasoning scaffolds, and role/format constraints.',
    subtypes: [
      { name: 'Zero-shot', desc: 'Just an instruction, no examples.', example: '"Classify the sentiment: <review>"' },
      { name: 'Few-shot', desc: 'A handful of input→output examples to demonstrate the pattern.', example: '"cat→animal, rose→plant, salmon→?"' },
      { name: 'Chain-of-thought', desc: 'Ask the model to reason step by step before answering.', example: '"Think step by step, then give the final answer."' },
      { name: 'Role & format constraints', desc: 'System prompt persona + explicit output schema.', example: '"You are a strict JSON API. Respond only with {..}."' },
    ],
  },

  /* ============= PHASE 02 — LLM APIs & STRUCTURED OUTPUTS ============= */
  'raw-api': {
    definition: 'The bare mechanics of talking to a chat model: a messages array of role-tagged turns, statelessly resent each call, with the model appending the next assistant turn — conversation "memory" is just you re-sending history.',
    subtypes: [
      { name: 'Roles', desc: 'system (rules), user (input), assistant (model output) — the building blocks of a turn.', example: '[{role:"system",...},{role:"user","Hi"}]' },
      { name: 'Multi-turn state', desc: 'You maintain history client-side and resend it; the API is stateless.', example: 'append each reply to messages[] and resend' },
      { name: 'System prompt', desc: 'Top-level instructions that steer the whole conversation.', example: '"You are a concise support agent."' },
      { name: 'Stop reason', desc: 'Why generation ended — end_turn, max_tokens, tool_use, stop_sequence.', example: 'stop_reason:"max_tokens" → answer was cut off' },
    ],
  },
  'tool-use': {
    definition: 'A protocol where you describe callable tools (name, description, JSON-schema args) to the model; it responds with a structured request to call one, your code executes it, and you feed the result back so the model can continue — letting it act, not just talk.',
    subtypes: [
      { name: 'Tool definition', desc: 'A JSON schema telling the model what a tool does and its parameters.', example: '{name:"get_weather", input_schema:{city:"string"}}' },
      { name: 'Tool call request', desc: 'The model emits structured args instead of text; your code runs it.', example: 'model → {tool:"get_weather", args:{city:"Paris"}}' },
      { name: 'Result round-trip', desc: 'You append the tool result as a message and call again.', example: 'tool_result:"18°C" → model writes final answer' },
      { name: 'Parallel tool calls', desc: 'The model can request several tools at once to reduce round-trips.', example: 'one turn requests weather + calendar together' },
    ],
  },
  'structured-outputs': {
    definition: 'Techniques for making a model return machine-parseable data (usually JSON) that conforms to a schema, so downstream code can consume it reliably instead of parsing prose.',
    subtypes: [
      { name: 'JSON mode', desc: 'Provider flag guaranteeing syntactically valid JSON output.', example: 'response_format={"type":"json_object"}' },
      { name: 'Schema-constrained', desc: 'Enforce a specific shape, not just "some JSON".', example: 'Pydantic/Zod schema → {name:str, age:int}' },
      { name: 'Tool-call as schema', desc: 'Define a single tool whose args are your target schema.', example: 'force tool "extract" with your fields as params' },
      { name: 'Validation + retry', desc: 'Parse against the schema and re-prompt on failure.', example: 'Pydantic ValidationError → send error back, retry' },
    ],
  },
  'streaming': {
    definition: 'Delivering the model output incrementally as tokens are generated (via Server-Sent Events) instead of waiting for the whole response, cutting perceived latency to first token.',
    subtypes: [
      { name: 'Server-Sent Events (SSE)', desc: 'The one-way event stream transport most providers use.', example: 'data: {"delta":{"text":"Hel"}}\\n\\n' },
      { name: 'Delta events', desc: 'Each chunk carries a small text delta you append client-side.', example: 'accumulate "Hel"+"lo"+" world"' },
      { name: 'Time-to-first-token', desc: 'The latency metric streaming optimizes — user sees output fast.', example: 'first token in 300ms vs 8s full wait' },
      { name: 'Tool/stop events', desc: 'Streams also signal tool calls and completion, not just text.', example: 'message_stop / content_block_stop events' },
    ],
  },
  'error-handling': {
    definition: 'The defensive layer around LLM calls that turns flaky, rate-limited, and malformed responses into reliable behavior via retries with backoff, validation, and fallbacks.',
    subtypes: [
      { name: 'Exponential backoff', desc: 'Retry transient failures with growing, jittered delays.', example: 'wait 1s, 2s, 4s (+jitter) on 429/529' },
      { name: 'Retry vs fail-fast', desc: 'Retry 429/5xx; do not retry 400 (your bug) — fix it.', example: '400 → raise; 529 → retry' },
      { name: 'Output validation', desc: 'Verify structure/content before trusting it, re-prompt on failure.', example: 'JSON parse fails → send error back once' },
      { name: 'Timeouts & fallbacks', desc: 'Bound each call and degrade gracefully.', example: 'timeout 30s → fall back to a smaller/cached answer' },
    ],
  },

  /* ===================== PHASE 03 — RAG ===================== */
  'rag-overview': {
    definition: 'A pattern that answers questions by first retrieving relevant chunks from an external knowledge base and injecting them into the prompt, so the model grounds its answer in your data instead of only its training memory.',
    subtypes: [
      { name: 'Indexing (offline)', desc: 'Load → chunk → embed → store in a vector DB, done ahead of time.', example: 'docs → 800-token chunks → vectors → Qdrant' },
      { name: 'Retrieval (online)', desc: 'Embed the query, find nearest chunks at request time.', example: 'query → top-5 chunks by cosine similarity' },
      { name: 'Augmentation', desc: 'Insert retrieved context into the prompt with the question.', example: '"Using the context below, answer: ...\\n<chunks>"' },
      { name: 'Generation', desc: 'Model answers grounded in the injected context, ideally with citations.', example: 'answer + "[source: doc3, p2]"' },
    ],
  },
  'chunking': {
    definition: 'Splitting source documents into retrieval-sized units before embedding; the split boundaries strongly shape retrieval quality because each chunk is what gets matched and returned whole.',
    subtypes: [
      { name: 'Fixed-size', desc: 'Split every N tokens/characters, often with overlap. Simple, boundary-blind.', example: '512 tokens, 50-token overlap' },
      { name: 'Recursive', desc: 'Split on a hierarchy of separators (paragraph → sentence) to respect structure.', example: 'split on \\n\\n, then \\n, then " "' },
      { name: 'Semantic', desc: 'Break where embedding similarity between adjacent sentences drops.', example: 'new chunk when topic shifts mid-document' },
      { name: 'Structure-aware', desc: 'Chunk along document structure — headings, tables, code blocks.', example: 'one chunk per Markdown section' },
    ],
  },
  'embedding-models-rag': {
    definition: 'Choosing the embedding model that turns your chunks and queries into vectors — the single biggest lever on dense-retrieval quality, traded off against dimension, cost, latency, and domain fit.',
    subtypes: [
      { name: 'Proprietary API', desc: 'Hosted, strong general quality, per-token cost, no infra.', example: 'OpenAI text-embedding-3-large' },
      { name: 'Open-weight', desc: 'Self-hosted, no per-call cost, you own latency/privacy.', example: 'BGE-large, E5, GTE' },
      { name: 'Domain-tuned', desc: 'Trained/fine-tuned on specialized text; beats general models there.', example: 'a legal- or code-specific embedder' },
      { name: 'MTEB leaderboard', desc: 'Benchmark to compare models per task before committing.', example: 'check retrieval scores on MTEB' },
    ],
  },
  'vector-dbs': {
    definition: 'Databases specialized for storing embeddings and running fast approximate-nearest-neighbour (ANN) search over millions of vectors, plus metadata filtering.',
    subtypes: [
      { name: 'Dedicated (Qdrant, Weaviate)', desc: 'Purpose-built vector engines with rich filtering and scaling.', example: 'Qdrant collection with payload filters' },
      { name: 'Managed cloud (Pinecone)', desc: 'Fully hosted; you never run the index.', example: 'Pinecone serverless index' },
      { name: 'Extension (pgvector)', desc: 'Vector search inside Postgres — one DB for vectors + relational data.', example: 'CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)' },
      { name: 'ANN algorithms', desc: 'HNSW/IVF trade recall for speed; the knob behind "fast but approximate".', example: 'HNSW graph traversal for sub-ms search' },
    ],
  },
  'hybrid-search': {
    definition: 'Combining dense (semantic) vector search with sparse (keyword/BM25) search so you catch both meaning-based matches and exact terms like IDs, names, and acronyms that embeddings miss.',
    subtypes: [
      { name: 'Dense (vector)', desc: 'Matches by meaning; strong on paraphrase, weak on exact tokens.', example: '"car" retrieves "automobile"' },
      { name: 'Sparse (BM25/keyword)', desc: 'Matches exact terms; strong on codes/names, blind to synonyms.', example: 'error code "E1042" matched exactly' },
      { name: 'Reciprocal Rank Fusion', desc: 'Merges two ranked lists by summing 1/(k+rank), no score calibration needed.', example: 'RRF blends vector + BM25 rankings' },
      { name: 'Weighted fusion', desc: 'Blend normalized scores with a tunable alpha.', example: 'score = 0.7·dense + 0.3·sparse' },
    ],
  },
  'reranking': {
    definition: 'A second-stage model that re-scores an initial candidate set by jointly reading query and document together (cross-encoder), producing far more accurate ordering than the first-stage similarity — cheap because it runs on only a few dozen candidates.',
    subtypes: [
      { name: 'Cross-encoder reranker', desc: 'Reads (query, doc) as one input for a precise relevance score.', example: 'Cohere Rerank, BGE-reranker' },
      { name: 'Two-stage retrieval', desc: 'Retrieve many cheaply (ANN), rerank the top ~50 precisely.', example: 'top-100 vectors → rerank → top-5' },
      { name: 'LLM-as-reranker', desc: 'Prompt an LLM to score/order candidates when no reranker fits.', example: '"Rate each passage 0–10 for relevance."' },
      { name: 'Bi- vs cross-encoder', desc: 'Bi-encoder embeds separately (fast, for retrieval); cross-encoder reads jointly (slow, for reranking).', example: 'embed once to search, rerank to refine' },
    ],
  },
  'query-transform': {
    definition: 'Rewriting or expanding the user query before retrieval so it better matches how answers are actually phrased in the corpus, fixing the gap between question language and document language.',
    subtypes: [
      { name: 'HyDE', desc: 'Generate a hypothetical answer, embed that, and search with it.', example: 'draft a fake answer → retrieve docs like it' },
      { name: 'Multi-query', desc: 'Expand one question into several rephrasings, retrieve for each, merge.', example: 'one query → 3 variants → union of results' },
      { name: 'Query routing', desc: 'Classify the query and send it to the right index/tool.', example: '"refund policy" → policy index; "2+2" → calculator' },
      { name: 'Decomposition', desc: 'Break a multi-part question into sub-questions retrieved separately.', example: '"compare A and B" → retrieve A, retrieve B' },
    ],
  },
  'graph-rag': {
    definition: 'Retrieval over a knowledge graph of entities and relationships (not just a flat vector store), so you can answer questions that require connecting facts across documents rather than similarity to a single chunk.',
    subtypes: [
      { name: 'Knowledge graph', desc: 'Entities as nodes, relationships as edges extracted from your corpus.', example: '(Acme)-[acquired]->(Beta) in 2021' },
      { name: 'Community summaries', desc: 'Cluster the graph and summarize each cluster for global questions.', example: 'GraphRAG summarizes themes across a corpus' },
      { name: 'Multi-hop traversal', desc: 'Follow edges to chain facts a single chunk can\'t hold.', example: '"who leads the team that built X?" → 2 hops' },
      { name: 'Hybrid graph+vector', desc: 'Use vectors to find entry nodes, then traverse the graph.', example: 'embed to locate entity, walk relationships' },
    ],
  },
  'multimodal-rag': {
    definition: 'Extending retrieval beyond plain text to images, tables, charts, and video — either by describing/transcribing them into text or by embedding them directly with multimodal models.',
    subtypes: [
      { name: 'Image-as-text', desc: 'Caption/OCR images into text, then embed normally.', example: 'chart → GPT-4o caption → embed the caption' },
      { name: 'Multimodal embeddings', desc: 'Embed text and images into one shared space.', example: 'CLIP embeds "a red car" and its photo nearby' },
      { name: 'Table extraction', desc: 'Preserve tabular structure so rows/columns stay meaningful.', example: 'PDF table → Markdown/JSON before chunking' },
      { name: 'Visual document QA', desc: 'Retrieve the page image and let a vision model read it.', example: 'ColPali retrieves page images directly' },
    ],
  },
  'rag-eval': {
    definition: 'Measuring RAG quality by separating retrieval quality from generation quality, using reference-free LLM-judged metrics so you know whether a bad answer is a retrieval or a generation problem.',
    subtypes: [
      { name: 'Context precision/recall', desc: 'Did retrieval return the right chunks, and all of them?', example: 'relevant chunk ranked high = high precision' },
      { name: 'Faithfulness', desc: 'Is the answer supported by the retrieved context (no hallucination)?', example: 'every claim traceable to a chunk' },
      { name: 'Answer relevance', desc: 'Does the answer actually address the question?', example: 'on-topic and complete vs evasive' },
      { name: 'RAGAS / frameworks', desc: 'Tooling that computes these metrics with an LLM judge.', example: 'RAGAS scores a test set automatically' },
    ],
  },
  'when-not-rag': {
    definition: 'The judgment of recognizing problems where retrieval is the wrong tool — because the task needs reasoning/computation, the whole corpus fits in context, or the knowledge belongs in fine-tuning or a tool call instead.',
    subtypes: [
      { name: 'Fits in context', desc: 'If the whole source fits the window, just include it — no index needed.', example: 'a 20-page contract → paste it in' },
      { name: 'Needs computation', desc: 'Math/aggregation/live data belongs to tools, not retrieval.', example: '"sum this quarter\'s sales" → SQL/tool' },
      { name: 'Style, not facts', desc: 'Teaching format/voice is fine-tuning, not RAG.', example: 'consistent brand tone → fine-tune' },
      { name: 'Long-tail freshness', desc: 'Rapidly changing single facts may suit a direct API call.', example: '"current stock price" → market API' },
    ],
  },
  'contextual-retrieval': {
    definition: 'Techniques that fix chunking\'s core weakness — chunks losing the context of the document they came from — by prepending a generated context blurb to each chunk or embedding chunks with document-level awareness.',
    subtypes: [
      { name: 'Contextual chunk headers', desc: 'Prepend an LLM-written summary situating each chunk in its document.', example: '"From Acme 2023 10-K, Risk section: <chunk>"' },
      { name: 'Late chunking', desc: 'Embed the full document first, then pool per-chunk vectors so each keeps global context.', example: 'long-context embed → slice pooled vectors' },
      { name: 'Contextual BM25', desc: 'Apply the same context augmentation to the keyword index too.', example: 'index chunk + its context for lexical match' },
      { name: 'Parent-document retrieval', desc: 'Match on small chunks but return the larger parent for the model.', example: 'retrieve sentence, feed surrounding section' },
    ],
  },
  'semantic-caching': {
    definition: 'Caching LLM responses by the meaning of the request (embedding similarity) rather than exact string match, so paraphrased-but-equivalent queries reuse a cached answer and save cost and latency.',
    subtypes: [
      { name: 'Exact-match cache', desc: 'Classic key-value cache on the literal prompt string.', example: 'hash(prompt) → response' },
      { name: 'Semantic (embedding) cache', desc: 'Return a cached answer when a new query is close enough in vector space.', example: '"reset password" ≈ "how do I change my password"' },
      { name: 'Similarity threshold', desc: 'The cutoff deciding cache hit vs miss — too loose serves wrong answers.', example: 'hit only if cosine ≥ 0.95' },
      { name: 'Provider prompt caching', desc: 'Server-side caching of a long prompt prefix (distinct but related).', example: 'cache a big system prompt across calls' },
    ],
  },

  /* ===================== PHASE 04 — AGENTS ===================== */
  'tool-error-recovery': {
    definition: 'Designing agents so that when a tool call fails or returns something unexpected, the model can see the error, reflect, and adapt — rather than crashing or confidently proceeding on bad data.',
    subtypes: [
      { name: 'Error as observation', desc: 'Feed the failure text back so the model can react to it.', example: 'tool_result:"404 not found" → model retries differently' },
      { name: 'Self-correction / reflection', desc: 'Prompt the agent to critique and fix its own failed attempt.', example: '"That call errored; diagnose and try again."' },
      { name: 'Bounded retries', desc: 'Cap attempts so a failing loop can\'t run forever.', example: 'max 3 tool retries then escalate' },
      { name: 'Graceful degradation', desc: 'Fall back to a safe path when a tool stays broken.', example: 'API down → return cached data + a caveat' },
    ],
  },
  'react-loop': {
    definition: 'An agent pattern where the model interleaves Reasoning and Acting in a cycle — Think about what to do, Act by calling a tool, Observe the result, and repeat until it can give a final answer.',
    subtypes: [
      { name: 'Thought', desc: 'The model reasons about the next step in natural language.', example: '"I need the weather before I can advise."' },
      { name: 'Action', desc: 'It calls a tool with concrete arguments.', example: 'call get_weather(city="Paris")' },
      { name: 'Observation', desc: 'The tool result is fed back into the loop.', example: 'observation: "18°C, rain"' },
      { name: 'Loop termination', desc: 'Stop on a final answer or a max-steps guard.', example: 'answer produced, or 10-step cap hit' },
    ],
  },
  'langgraph': {
    definition: 'A library for building agents as explicit stateful graphs — nodes are steps, edges (including conditional ones) are control flow, and a shared state object persists across steps, enabling cycles, checkpoints, and human-in-the-loop.',
    subtypes: [
      { name: 'Nodes', desc: 'Units of work (an LLM call, a tool, a function) that read/write shared state.', example: 'node "retrieve" adds docs to state' },
      { name: 'Edges & conditionals', desc: 'Define flow, including branching on state.', example: 'if state.needs_tool → tool node, else → end' },
      { name: 'Shared state', desc: 'A typed object threaded through the whole graph.', example: 'state = {messages, docs, step_count}' },
      { name: 'Checkpointing / persistence', desc: 'Save state so runs can pause, resume, and support human approval.', example: 'checkpoint before a risky action for review' },
    ],
  },
  'memory-systems': {
    definition: 'Giving agents recall beyond a single context window, which is really three distinct problems: what to keep in the current window, how to store long-term facts, and how to retrieve the right memory at the right time.',
    subtypes: [
      { name: 'Short-term (working)', desc: 'Managing the live conversation within the context window.', example: 'keep last N turns + a running summary' },
      { name: 'Long-term (persistent)', desc: 'Store durable facts across sessions, usually in a vector/DB store.', example: '"user prefers metric units" saved forever' },
      { name: 'Episodic vs semantic', desc: 'Specific past events vs distilled general facts.', example: 'episodic: "on Mar 3 user asked X"; semantic: "user is a nurse"' },
      { name: 'Retrieval & forgetting', desc: 'Fetching relevant memories and pruning stale ones.', example: 'RAG over memory; expire old preferences' },
    ],
  },
  'multi-agent': {
    definition: 'Decomposing a task across multiple specialized agents that coordinate — via roles, hierarchies, or conversation — used when a single agent\'s context or responsibilities grow unwieldy, at the cost of added complexity and latency.',
    subtypes: [
      { name: 'Supervisor / orchestrator', desc: 'A lead agent routes subtasks to worker agents.', example: 'planner delegates to researcher + writer' },
      { name: 'Role-based crews', desc: 'Agents with fixed roles collaborate on a pipeline.', example: 'CrewAI: researcher → analyst → editor' },
      { name: 'Conversational', desc: 'Agents talk to each other to reach a result.', example: 'AutoGen coder ↔ critic dialogue' },
      { name: 'When to avoid', desc: 'One good agent often beats many; only split when justified.', example: 'don\'t add agents for a single-step task' },
    ],
  },
  'mcp-a2a': {
    definition: 'Emerging open standards for connecting AI systems: MCP (Model Context Protocol) standardizes how a model discovers and calls external tools/data servers; A2A (Agent-to-Agent) standardizes how independent agents communicate.',
    subtypes: [
      { name: 'MCP server', desc: 'A process exposing tools/resources/prompts over a standard protocol.', example: 'a filesystem or GitHub MCP server' },
      { name: 'MCP client/host', desc: 'The app (e.g. an IDE or Claude) that connects to MCP servers.', example: 'Claude Code connecting to MCP tools' },
      { name: 'Transports', desc: 'How client and server talk — stdio locally, HTTP/SSE remotely.', example: 'stdio for a local server, HTTP for hosted' },
      { name: 'A2A', desc: 'A protocol for agents built by different parties to interoperate.', example: 'your agent hands a task to a vendor agent' },
    ],
  },
  'agentic-rag': {
    definition: 'Treating retrieval as a decision the agent makes and controls — whether to retrieve, what to query, whether to re-retrieve after seeing results — rather than a single fixed step bolted before generation.',
    subtypes: [
      { name: 'Retrieve-or-not', desc: 'The agent decides if external knowledge is even needed.', example: '"2+2" → skip retrieval; "our refund policy?" → retrieve' },
      { name: 'Iterative retrieval', desc: 'Retrieve, assess, refine the query, retrieve again.', example: 'weak results → rewrite query → search again' },
      { name: 'Retrieval as a tool', desc: 'Search is just one tool among many the agent can call.', example: 'search_docs() alongside calculator()' },
      { name: 'Self-reflective (CRAG)', desc: 'Grade retrieved context and correct/augment when it\'s poor.', example: 'low-quality chunks → fall back to web search' },
    ],
  },
  'browser-agents': {
    definition: 'Agents that operate a computer or browser through screenshots and simulated clicks/typing, letting them use software built for humans when no API exists — powerful but slow, brittle, and security-sensitive.',
    subtypes: [
      { name: 'Computer use', desc: 'Model sees a screenshot and issues mouse/keyboard actions.', example: 'Claude computer use clicks a button by coords' },
      { name: 'DOM-based automation', desc: 'Drive the page via structured DOM/accessibility tree, not pixels.', example: 'Playwright-driven agent reads the DOM' },
      { name: 'Vision grounding', desc: 'Locate the right UI element from the rendered image.', example: 'find the "Submit" button in a screenshot' },
      { name: 'Safety sandboxing', desc: 'Confine the agent so a wrong action can\'t do harm.', example: 'run in a disposable VM, no real payments' },
    ],
  },
  'guardrails': {
    definition: 'Controls that constrain what goes into and comes out of an agent so it can\'t be manipulated (prompt injection) or produce harmful/unauthorized actions — essential once an agent has real tools and data access.',
    subtypes: [
      { name: 'Input guardrails', desc: 'Screen/sanitize user and retrieved content for injection attempts.', example: 'detect "ignore previous instructions" in a doc' },
      { name: 'Output guardrails', desc: 'Validate/filter responses before they act or reach users.', example: 'block leaked secrets or unsafe content' },
      { name: 'Prompt-injection defense', desc: 'Separate trusted instructions from untrusted data, least privilege.', example: 'tool output can\'t override the system prompt' },
      { name: 'Action authorization', desc: 'Gate high-impact tool calls behind approval/limits.', example: 'refunds over $100 need human sign-off' },
    ],
  },
  'agent-benchmarks': {
    definition: 'Evaluating agents on whether they actually complete real, multi-step tasks (not just produce good-sounding text), plus adversarial red-teaming to find where they can be broken or misused.',
    subtypes: [
      { name: 'Task-completion benchmarks', desc: 'Measure end-to-end success on realistic tasks.', example: 'SWE-bench (fix a real GitHub issue)' },
      { name: 'Environment benchmarks', desc: 'Interactive sandboxes scoring tool use and web tasks.', example: 'WebArena, τ-bench' },
      { name: 'Trajectory eval', desc: 'Judge the steps taken, not only the final answer.', example: 'did it call the right tools in order?' },
      { name: 'Red teaming', desc: 'Adversarially probe for injection, misuse, unsafe actions.', example: 'try to make the agent exfiltrate data' },
    ],
  },

  /* ===================== PHASE 05 — EVAL & OBSERVABILITY ===================== */
  'evals': {
    definition: 'The AI equivalent of unit tests: a curated dataset of inputs with a scoring method that measures output quality, so you can tell — objectively and repeatably — whether a prompt/model change made things better or worse.',
    subtypes: [
      { name: 'Golden dataset', desc: 'Fixed input→expected-output pairs representing real usage.', example: '100 support tickets with ideal replies' },
      { name: 'Code-based scoring', desc: 'Deterministic checks: exact match, regex, JSON-valid, contains.', example: 'assert output == "APPROVED"' },
      { name: 'LLM-as-judge', desc: 'A model grades open-ended outputs against a rubric.', example: '"Score 1–5 for helpfulness and correctness."' },
      { name: 'Human eval', desc: 'People rate/label outputs — the gold standard, expensive.', example: 'annotators rank A vs B blind' },
    ],
  },
  'observability': {
    definition: 'Instrumenting LLM apps so you can see what actually happened inside a call or agent run — full traces of prompts, tool calls, tokens, latency, and cost — which is how you debug non-deterministic behavior in production.',
    subtypes: [
      { name: 'Tracing', desc: 'Record every step of a request/agent as a nested trace.', example: 'span tree: retrieve → rerank → generate' },
      { name: 'Token & cost tracking', desc: 'Attribute tokens and spend per call/user/feature.', example: 'this endpoint costs $0.004/request' },
      { name: 'Latency breakdown', desc: 'See where time goes across steps.', example: 'retrieval 80ms, generation 2.1s' },
      { name: 'Platforms', desc: 'Tools that capture and visualize all of the above.', example: 'LangSmith, Langfuse, Phoenix' },
    ],
  },
  'cost-latency': {
    definition: 'The set of levers that reduce the price and delay of serving LLMs — caching repeated prompt prefixes, routing easy requests to cheaper models, and batching — usually the difference between a demo and a viable product.',
    subtypes: [
      { name: 'Prompt caching', desc: 'Reuse a cached long prefix so you pay/compute it once.', example: 'cache a 10k-token system prompt across calls' },
      { name: 'Model routing', desc: 'Send easy queries to a small model, hard ones to a large one.', example: 'classify → Haiku for simple, Opus for complex' },
      { name: 'Batching', desc: 'Group many requests to amortize overhead / use batch APIs.', example: 'overnight batch job at ~50% cost' },
      { name: 'Output-length control', desc: 'Output tokens dominate cost/latency — cap and tighten them.', example: 'set max_tokens, ask for concise answers' },
    ],
  },
  'regression-testing': {
    definition: 'Running your eval suite automatically on every prompt/model/config change (in CI) so a tweak that silently degrades quality is caught before it ships — CI for AI behavior.',
    subtypes: [
      { name: 'Eval-in-CI', desc: 'Gate merges on the eval suite passing a threshold.', example: 'block PR if score drops below 0.80' },
      { name: 'Snapshot/golden tests', desc: 'Flag when outputs change vs an approved baseline.', example: 'diff new outputs against saved goldens' },
      { name: 'Threshold gates', desc: 'Fail the build on a metric regression, not just crashes.', example: 'faithfulness < baseline → fail' },
      { name: 'Score-tagged commits', desc: 'Record eval scores with each change for traceability.', example: 'commit msg: "prompt v3 — eval 0.86 (+0.04)"' },
    ],
  },

  /* ===================== PHASE 06 — SERVING & DEPLOYMENT ===================== */
  'fastapi-docker': {
    definition: 'The standard way to ship an LLM app off your laptop: wrap it in a FastAPI web service and package it in a Docker container so it runs identically anywhere.',
    subtypes: [
      { name: 'FastAPI endpoints', desc: 'Async Python web framework exposing your app over HTTP.', example: '@app.post("/chat") async def chat(req): ...' },
      { name: 'Streaming responses', desc: 'Stream tokens to clients via SSE from the endpoint.', example: 'return StreamingResponse(token_gen())' },
      { name: 'Dockerfile', desc: 'A recipe that pins deps and builds a portable image.', example: 'FROM python:3.12-slim; pip install ...; CMD uvicorn' },
      { name: 'Config & secrets', desc: 'Inject keys/settings via env, never bake them in.', example: 'API key from env var at runtime' },
    ],
  },
  'inference-serving': {
    definition: 'Running open-weight models efficiently yourself, using serving engines that exploit batching and a KV-cache so a GPU handles many concurrent requests at high throughput.',
    subtypes: [
      { name: 'vLLM', desc: 'High-throughput server using PagedAttention + continuous batching.', example: 'vllm serve meta-llama/Llama-3-8B' },
      { name: 'Ollama', desc: 'Dead-simple local runner for quantized models.', example: 'ollama run llama3' },
      { name: 'KV-cache', desc: 'Caches past keys/values so each new token is cheap.', example: 'avoids recomputing attention over the prompt' },
      { name: 'Continuous batching', desc: 'Dynamically merges requests into GPU batches for utilization.', example: 'new request slots into an in-flight batch' },
    ],
  },
  'security-prod': {
    definition: 'Carrying Phase 4\'s guardrail thinking into deployment: protecting keys, tenants, and data flows in a live system where untrusted input meets tools with real-world power.',
    subtypes: [
      { name: 'Secrets management', desc: 'Store and rotate keys outside code, scoped tightly.', example: 'keys in a vault, per-service, rotated' },
      { name: 'Tenant isolation', desc: 'Ensure one user\'s data/context can\'t leak into another\'s.', example: 'scope vector search by tenant_id' },
      { name: 'Rate limiting & abuse', desc: 'Throttle to control cost and block abuse.', example: 'per-key request + token quotas' },
      { name: 'PII & data flow', desc: 'Control what sensitive data reaches models/logs.', example: 'redact PII before logging prompts' },
    ],
  },
  'managed-vs-selfhosted': {
    definition: 'The recurring infra decision between using a hosted API (someone else runs the model) and self-hosting open weights (you run it) — a tradeoff of cost curve, control, privacy, latency, and operational burden.',
    subtypes: [
      { name: 'Managed API', desc: 'Frontier quality, zero ops, per-token cost, data leaves your walls.', example: 'call Claude/GPT over HTTPS' },
      { name: 'Self-hosted', desc: 'Full control and data residency, fixed GPU cost, you own uptime.', example: 'vLLM + Llama on your own GPUs' },
      { name: 'Cost crossover', desc: 'APIs win at low/spiky volume; self-hosting wins at steady high volume.', example: 'millions of steady calls → break-even flips' },
      { name: 'Hybrid', desc: 'Route sensitive/bulk traffic in-house, hard cases to an API.', example: 'local model default, API fallback' },
    ],
  },

  /* ===================== PHASE 07 — ADVANCED ===================== */
  'moe': {
    definition: 'A model architecture where feed-forward layers are split into many "expert" sub-networks and a router activates only a few per token, so total parameter capacity is huge but compute per token stays small.',
    subtypes: [
      { name: 'Experts', desc: 'Parallel FFN sub-networks specialized during training.', example: '8 experts, each an FFN' },
      { name: 'Router / gating', desc: 'Picks the top-k experts for each token.', example: 'top-2 of 8 experts activated per token' },
      { name: 'Sparse activation', desc: 'Only chosen experts compute, keeping inference cheap.', example: '47B total params, ~13B active per token' },
      { name: 'Load balancing', desc: 'Auxiliary loss so tokens spread across experts.', example: 'prevents one expert getting all traffic' },
    ],
  },
  'speculative-decoding': {
    definition: 'A generation speedup where a small fast "draft" model proposes several tokens ahead and the large model verifies them in one parallel pass — accepted tokens are free, giving faster output with identical quality.',
    subtypes: [
      { name: 'Draft model', desc: 'A small model guesses the next few tokens quickly.', example: '1B draft proposes 4 tokens' },
      { name: 'Verification', desc: 'The big model checks all drafted tokens in one forward pass.', example: 'accept the longest correct prefix' },
      { name: 'Acceptance rate', desc: 'How often drafts match determines the speedup.', example: 'high on predictable text, low on creative' },
      { name: 'Self-speculative / Medusa', desc: 'Extra heads on the same model draft instead of a separate one.', example: 'Medusa heads predict multiple positions' },
    ],
  },
  'test-time-compute': {
    definition: 'Spending more computation at inference — longer chains of reasoning, sampling many candidates, self-verification — to get better answers on hard problems, trading latency/cost for accuracy without retraining.',
    subtypes: [
      { name: 'Extended thinking', desc: 'The model reasons at length before answering.', example: 'a hidden reasoning budget before the reply' },
      { name: 'Best-of-N / self-consistency', desc: 'Sample many answers and pick the best/majority.', example: 'generate 8, take the majority answer' },
      { name: 'Search / tree-of-thought', desc: 'Explore and prune multiple reasoning branches.', example: 'branch, score, backtrack on dead ends' },
      { name: 'Verifier-guided', desc: 'A verifier scores candidates to steer the search.', example: 'reward model ranks reasoning paths' },
    ],
  },
  'distillation': {
    definition: 'Training a small "student" model to mimic a large "teacher" — learning from the teacher\'s outputs (or output distribution) — to get much of the quality at a fraction of the size and cost.',
    subtypes: [
      { name: 'Response distillation', desc: 'Fine-tune the student on teacher-generated answers.', example: 'big model labels data → train small model on it' },
      { name: 'Logit distillation', desc: 'Match the teacher\'s full probability distribution, not just the top answer.', example: 'student learns soft targets from teacher logits' },
      { name: 'Task-specific', desc: 'Distill only for a narrow task to shrink aggressively.', example: 'a tiny classifier from a big LLM' },
      { name: 'Data generation', desc: 'Use a strong model to synthesize the training set.', example: 'GPT writes 50k Q/A pairs for the student' },
    ],
  },
  'synthetic-data-rlaif': {
    definition: 'Scaling training data using AI instead of humans: generating synthetic examples with a strong model, and RLAIF — using AI feedback in place of human preference labels to align models.',
    subtypes: [
      { name: 'Synthetic generation', desc: 'A model produces training examples at scale.', example: 'generate diverse instruction-response pairs' },
      { name: 'RLAIF', desc: 'An AI judge provides preference labels for alignment instead of humans.', example: 'model ranks A vs B → train on that signal' },
      { name: 'Constitutional AI', desc: 'The model critiques/revises its own outputs against written principles.', example: 'revise to follow a set of rules, then train' },
      { name: 'Quality filtering', desc: 'Filter synthetic data hard to avoid model-collapse.', example: 'drop low-diversity or wrong samples' },
    ],
  },
  'constrained-generation': {
    definition: 'Enforcing output structure at the token level during decoding — masking out any token that would violate a grammar/schema — so the output is guaranteed valid JSON, regex, or a formal grammar.',
    subtypes: [
      { name: 'Grammar-constrained', desc: 'A formal grammar restricts which tokens are legal next.', example: 'GBNF grammar forces valid syntax' },
      { name: 'JSON-schema constrained', desc: 'Decoding follows the schema so output always parses.', example: 'only tokens valid for the next field allowed' },
      { name: 'Regex-constrained', desc: 'Force output to match a regular expression.', example: 'phone numbers matching \\d{3}-\\d{4}' },
      { name: 'Libraries', desc: 'Tooling that implements token-masking decoding.', example: 'Outlines, Guidance, XGrammar' },
    ],
  },
  'voice-agents': {
    definition: 'Extending agents to spoken conversation via a real-time pipeline that converts speech to text, runs the LLM, and converts the reply back to speech — where end-to-end latency and turn-taking dominate the experience.',
    subtypes: [
      { name: 'STT (speech-to-text)', desc: 'Transcribe the user\'s audio, ideally streaming.', example: 'Whisper / Deepgram streaming transcription' },
      { name: 'TTS (text-to-speech)', desc: 'Voice the model\'s reply, streamed for low latency.', example: 'ElevenLabs streaming synthesis' },
      { name: 'Speech-to-speech', desc: 'A single model handling audio in and out, lower latency.', example: 'GPT-4o realtime voice' },
      { name: 'Turn-taking / VAD', desc: 'Detect when the user stops/interrupts to feel natural.', example: 'voice-activity detection + barge-in' },
    ],
  },
  'model-selection': {
    definition: 'A framework for choosing the right model per task rather than defaulting to the biggest — balancing capability, cost, latency, context, privacy, and whether frontier or open-weight fits.',
    subtypes: [
      { name: 'Frontier vs open-weight', desc: 'Top capability + ease vs control + data residency + cost.', example: 'Claude/GPT vs Llama/Qwen self-hosted' },
      { name: 'Capability tiers', desc: 'Match model size to task difficulty within a family.', example: 'Haiku for extraction, Opus for reasoning' },
      { name: 'Task-fit criteria', desc: 'Score candidates on your own eval + cost/latency.', example: 'pick the cheapest model passing the eval' },
      { name: 'Context & modality', desc: 'Some tasks demand long context or vision/audio.', example: 'huge doc → long-context model' },
    ],
  },
  'data-engineering-llm': {
    definition: 'The pipeline discipline that makes every RAG corpus, fine-tuning set, and eval set trustworthy — deduplication, PII scrubbing, and quality filtering applied at ingestion, not as afterthoughts.',
    subtypes: [
      { name: 'Deduplication', desc: 'Remove near-duplicate documents that would skew retrieval/training.', example: 'MinHash/embedding dedup of near-copies' },
      { name: 'PII scrubbing', desc: 'Detect and redact sensitive data before it enters any store.', example: 'Presidio redacts emails/SSNs at ingest' },
      { name: 'Quality filtering', desc: 'Drop garbled, boilerplate, or low-signal content.', example: 'filter out nav bars, OCR garbage' },
      { name: 'Ingestion as a pipeline', desc: 'Treat ingestion as ongoing, versioned, monitored — not a one-off script.', example: 'scheduled job with data-quality checks' },
    ],
  },
}
