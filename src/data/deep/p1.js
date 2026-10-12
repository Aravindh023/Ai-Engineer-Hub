// Deep, multi-level lessons for Phase 01 — LLM Foundations.
// Schema mirrors p0.js.

export const DEEP_P1 = {
  /* ------------------------------------------------------------------ */
  'transformer': {
    levels: {
      beginner: `
        <p>Every well-known chat model — GPT, Claude, Gemini, Llama — runs on the same kind of engine: the <strong>transformer</strong>. You will not build one, but a rough picture makes everything else click.</p>
        <p>Its central trick is called <strong>attention</strong>. Take the sentence "The trophy didn't fit in the suitcase because <em>it</em> was too big." To know what "it" refers to, you glance back at the other words and weigh which ones matter. Attention is exactly that: for every word, the model works out how much each <em>other</em> word should influence it, and blends them accordingly.</p>
        <p>The model repeats this in many parallel "heads", each learning to track a different kind of relationship, and it stacks dozens of these layers. Reading enormous amounts of text is how it learns <em>which</em> words should attend to which. Nothing here is human understanding — it is a very sophisticated pattern of learned weightings.</p>`,
      intermediate: `
        <p>Inside one attention step, each token is projected into three vectors: a <strong>Query</strong> ("what am I looking for?"), a <strong>Key</strong> ("what do I offer?"), and a <strong>Value</strong> ("what information do I carry?"). The model compares one token's Query with every token's Key via a dot product — high similarity means "pay attention here". Those scores are softmaxed into weights, and each token's new representation is the weighted sum of all the Values. That is the whole mechanism: <em>attention is a learned, content-based weighted average.</em></p>
        <p><strong>Multi-head attention</strong> runs several of these in parallel with different learned projections, so one head can follow grammatical agreement while another tracks long-range topic. Their outputs are concatenated and mixed.</p>
        <p>Each block then passes every token through a position-wise <strong>feed-forward network</strong> (two linear layers with a non-linearity) for extra transformation, and wraps both sub-layers with <strong>residual connections</strong> (add the input back) and <strong>layer normalization</strong> (keep activations in a stable numeric range). Those two are what make it possible to stack many blocks without the training signal vanishing or exploding. Because attention has no inherent sense of order, <strong>positional encodings</strong> are added so the model knows word order.</p>`,
      expert: `
        <p>The reason transformers displaced RNNs is <strong>parallelism</strong>: attention computes all pairwise token interactions as matrix multiplications, so a whole sequence is processed at once, whereas an RNN's state at step <em>t</em> depends on step <em>t−1</em>, forcing sequential computation. The cost is that self-attention is <strong>O(n²)</strong> in sequence length — doubling context roughly quadruples attention compute and memory, which is why long-context models rely on optimizations like <strong>FlashAttention</strong> (an IO-aware kernel that avoids materialising the full attention matrix) and why context length is expensive.</p>
        <p>Modern chat LLMs are <strong>decoder-only</strong> and use <strong>causal (masked) self-attention</strong>: a token may attend only to itself and earlier tokens, never the future — this is what makes next-token prediction well-defined. At inference, the <strong>KV-cache</strong> stores past Keys and Values so generating token <em>t+1</em> reuses prior work instead of recomputing attention over the whole prefix; its memory footprint (proportional to layers × heads × context) often dominates serving cost and is a prime target for <strong>Grouped-Query / Multi-Query Attention</strong>, which share K/V heads to shrink it.</p>
        <p>Practical consequence for prompt engineers: attention is a soft, learned weighting, not guaranteed retrieval. In a long prompt, competing text dilutes an instruction's influence and models attend most reliably to the start and end (the "lost in the middle" effect). So place critical instructions at the boundaries, and do not assume a buried directive will be honoured just because it is present. Positional scheme details (RoPE and its extensions) also govern how gracefully a model generalises beyond its trained context length.</p>`,
    },
    examples: [
      {
        title: 'Attention as a weighted average (toy, one head)',
        lang: 'python',
        code: `import numpy as np
def softmax(x): e = np.exp(x - x.max()); return e / e.sum()

# 3 tokens, each already projected to Q, K, V (2-dim, illustrative)
Q = np.array([[1.0, 0.0]])          # the query for token we're updating
K = np.array([[1,0],[0.9,0.1],[0,1]])  # keys for tokens 1,2,3
V = np.array([[10,0],[9,1],[0,10]])    # values for tokens 1,2,3

scores = (Q @ K.T) / np.sqrt(2)     # similarity, scaled by sqrt(dim)
weights = softmax(scores[0])        # -> ~[0.5, 0.47, 0.03]
out = weights @ V                   # blend values by attention weight
# out is dominated by tokens 1 & 2, barely token 3`,
        note: 'The new representation is literally a similarity-weighted mix of the other tokens\' Values — that is all "attention" is doing.',
      },
      {
        title: 'Why long context is expensive (O(n²))',
        lang: 'text',
        code: `context = 1,000 tokens  ->   1,000,000 attention scores
context = 2,000 tokens  ->   4,000,000  (4x, not 2x)
context = 8,000 tokens  ->  64,000,000

Attention compares every token with every other token,
so cost grows with the SQUARE of the length.`,
        note: 'This quadratic scaling is why bigger context windows cost more and why kernels like FlashAttention exist.',
      },
    ],
    glossary: [
      { term: 'Self-attention', def: 'A layer where each token computes how much to weigh every other token in the same sequence, then blends their Value vectors accordingly.' },
      { term: 'Query / Key / Value', def: 'Three learned projections per token: Query = what it seeks, Key = what it offers, Value = the information it passes on.' },
      { term: 'Multi-head attention', def: 'Several attention computations in parallel with different projections, each capturing a different type of relationship.' },
      { term: 'Feed-forward network', def: 'A per-token MLP applied after attention, adding transformation capacity within each block.' },
      { term: 'Residual + LayerNorm', def: 'Skip connections and normalization that keep gradients and activations stable, enabling very deep stacks of blocks.' },
      { term: 'Causal mask', def: 'The rule that a token may attend only to itself and earlier tokens, making next-token prediction well-defined in decoder-only models.' },
      { term: 'KV-cache', def: 'Stored Keys/Values from previous tokens reused during generation so each new token is cheap; often the dominant serving memory cost.' },
    ],
    practice: [
      { q: 'Why can transformers process a sequence in parallel while RNNs cannot?', a: 'Self-attention computes every token\'s relationship to every other token independently as matrix multiplications. An RNN\'s hidden state at step t depends on step t−1, forcing strictly sequential computation.' },
      { q: 'What do residual connections + layer norm make possible?', a: 'Stacking many (dozens+) blocks without the training signal vanishing or exploding. Residuals let gradients flow directly; layer norm keeps activations in a stable range at every step.' },
      { q: 'A critical instruction buried in the middle of a long prompt is ignored. Why, and what do you do?', a: 'Attention is a learned soft weighting, not guaranteed retrieval; competing text dilutes it and models attend most to the start/end ("lost in the middle"). Move critical instructions to the beginning or end.' },
      { q: 'Why does doubling the context length more than double attention cost?', a: 'Self-attention is O(n²) — it compares every token with every other, so cost scales with the square of the length. Doubling length roughly quadruples attention compute/memory.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'tokenization': {
    levels: {
      beginner: `
        <p>A model cannot read letters or words directly. First your text is broken into <strong>tokens</strong> — small chunks, often pieces of words. "unbelievable" might become "un" + "believ" + "able"; a common word like "the" is usually one token; a space is often attached to the word that follows it.</p>
        <p>This single fact explains a lot of odd behaviour. Ask "how many R's in strawberry?" and models stumble, because they see chunks like "str" + "aw" + "berry", not eight separate letters — they never observe the individual characters.</p>
        <p>Why care as a builder? You are <strong>billed per token</strong>, and a model's context window is measured in tokens. A useful rule of thumb for English: <strong>1 token ≈ 4 characters ≈ ¾ of a word</strong>. Every provider gives you a tokenizer to count exactly.</p>`,
      intermediate: `
        <p>Almost all production LLMs use a variant of <strong>Byte Pair Encoding (BPE)</strong>. Training the tokenizer starts from individual bytes/characters and repeatedly merges the most frequent adjacent pair into a new token, building a vocabulary (typically 50k–150k entries) of common subwords, whole words, and frequent fragments. Rare or novel strings fall back to many small pieces; common ones collapse to a single token.</p>
        <p>Consequences worth internalising:</p>
        <ul>
          <li><strong>Languages cost differently.</strong> Vocabularies are trained on mostly-English internet text, so English is efficient while other scripts (Japanese, Hindi, Arabic) get chopped into more, smaller tokens — the same sentence can cost 2–3× more.</li>
          <li><strong>Numbers and code tokenize unevenly</strong>, which is part of why raw arithmetic is unreliable and why code tokens add up faster than you expect.</li>
          <li><strong>Whitespace and casing matter</strong>: " Cat", "Cat", and "cat" can be different tokens, which subtly affects prompts.</li>
        </ul>
        <p>Related families: <strong>WordPiece</strong> (BERT) marks continuations ("play" + "##ing"); <strong>SentencePiece/Unigram</strong> (Llama, T5) treats input as raw bytes with no pre-splitting, handling spaces as a special "▁" marker — important for multilingual robustness.</p>`,
      expert: `
        <p>Tokenization is a quiet source of production bugs. Token <strong>budgeting</strong> must use the <em>actual</em> tokenizer for your target model — character estimates drift badly for code and non-English, and an off-by-a-few-hundred estimate can silently truncate a prompt or blow the context window. Cache token counts for static prompt parts. Remember the window is shared between input and output: reserve headroom for <code>max_tokens</code>.</p>
        <p>Several classic failure modes trace to tokenization: <strong>character-level tasks</strong> (counting letters, reversing strings, precise substring surgery) should be done in code after generation, not asked of the model. <strong>Glitch tokens</strong> — rare vocabulary entries that were under-trained — can trigger bizarre outputs. <strong>Prompt-boundary effects</strong> arise because a trailing space or its absence changes the next-token distribution. And <strong>structured formats</strong> (JSON, code) spend tokens on punctuation and indentation, so pretty-printing a large payload can cost noticeably more than compact form.</p>
        <p>For multilingual or cost-sensitive products, measure tokens-per-character across your real traffic and factor it into pricing and latency models; a chatbot that is cheap in English can be uneconomic in a language that tokenizes at 3× density. When fine-tuning or adding domain jargon, know that unfamiliar terms fragment into many tokens (raising cost and sometimes hurting quality) — a reason some teams extend the vocabulary. Finally, tokenization interacts with <strong>constrained/structured generation</strong>: grammar constraints operate at the token level, so what is "one token" shapes what can be masked.</p>`,
    },
    examples: [
      {
        title: 'Counting tokens the right way',
        lang: 'python',
        code: `# Use the ACTUAL tokenizer for your model, not a character estimate.
import tiktoken                      # OpenAI-family example
enc = tiktoken.get_encoding("cl100k_base")

text = "Tokenization is sneaky!"
ids = enc.encode(text)
print(len(ids), ids)                # exact token count + integer IDs
print([enc.decode([i]) for i in ids])  # see the actual pieces

# Rule of thumb only as a fallback: ~len(text)/4 tokens for English.`,
        note: 'Before assuming a prompt fits, count with the real tokenizer — estimates mislead on code and non-English text.',
      },
      {
        title: 'Do character work in code, not in the model',
        lang: 'python',
        code: `# WRONG: ask the model
#   "How many r's in 'strawberry'?"  -> unreliable (it sees chunks)

# RIGHT: get the string from the model, then count in code
word = "strawberry"
print(word.count("r"))     # 3, every time`,
        note: 'The model never sees individual characters for most tokens, so letter-level tasks belong in ordinary code.',
      },
    ],
    glossary: [
      { term: 'Token', def: 'The unit a model actually reads — an integer ID for a chunk of text, often a subword. Billing and context limits are counted in tokens.' },
      { term: 'Byte Pair Encoding (BPE)', def: 'The dominant tokenization method: iteratively merge the most frequent adjacent pairs to build a subword vocabulary.' },
      { term: 'Vocabulary', def: 'The fixed set of tokens a model knows (typically 50k–150k). Text is expressed as sequences of these IDs.' },
      { term: 'Subword', def: 'A token smaller than a word (e.g. "believ"); lets a fixed vocabulary represent any word, common ones compactly and rare ones in pieces.' },
      { term: 'SentencePiece', def: 'A language-agnostic tokenizer (Llama, T5) that operates on raw bytes with no pre-splitting, marking spaces as "▁".' },
      { term: 'Special tokens', def: 'Reserved IDs that encode structure rather than text — end-of-text, role/turn delimiters, etc.' },
      { term: 'Glitch token', def: 'A rarely-seen vocabulary entry that was under-trained and can provoke strange model behaviour.' },
    ],
    practice: [
      { q: 'Why is "count the letters in this word" unreliable for an LLM?', a: 'Its input is subword tokens (e.g. "straw"+"berry"), not individual letters, so it has no direct access to character positions to count. Do such tasks in code.' },
      { q: 'Your product is cheap in English but expensive in Japanese. Why?', a: 'Tokenizer vocabularies are trained mostly on English, so other scripts fragment into more, smaller tokens — the same meaning costs more tokens, hence more money and latency.' },
      { q: 'Roughly how many tokens is a 4,000-character English prompt, and why only "roughly"?', a: 'About 1,000 tokens (≈4 chars/token). It is only a rule of thumb because code, punctuation, numbers, and non-English text tokenize at very different densities — count with the real tokenizer to be sure.' },
      { q: 'You need to reverse a user-supplied string exactly. Model or code?', a: 'Code. Character-level operations are unreliable for the model because it works in subword tokens; take the string from the model if needed, then manipulate it programmatically.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'embeddings': {
    levels: {
      beginner: `
        <p>Computers handle numbers well and meaning poorly. An <strong>embedding</strong> bridges that gap: it turns a word, sentence, or document into a list of numbers — a <em>meaning fingerprint</em> — positioned in a space where similar meanings sit close together.</p>
        <p>Picture a giant map where "dog" and "puppy" land beside each other while "dog" and "spreadsheet" land far apart. Because meaning becomes distance, a computer can now find text that <em>means</em> the same thing even when the words differ: a search for "fix a flat tyre" can surface "repairing a punctured wheel".</p>
        <p>This is the foundation of search-by-meaning and of RAG (looking things up before answering). The rotating 3D cloud above shows the idea: words from the same topic cluster together.</p>`,
      intermediate: `
        <p>Be careful not to conflate two different things called "embeddings". <strong>Internal token embeddings</strong> live inside a transformer (the vector each token starts as) and are not meant for external use. <strong>Dedicated embedding models</strong> are what you use for retrieval: separate, usually smaller models trained so that a whole sentence or document maps to one semantically meaningful vector you can compare — e.g. OpenAI's <code>text-embedding-3-large</code>, or open options like BGE and E5.</p>
        <p>Key practical facts:</p>
        <ul>
          <li><strong>Vectors from different models are not comparable.</strong> Each model defines its own space, so you can never mix vectors from two embedders in one index.</li>
          <li><strong>Dimensionality is a trade-off.</strong> More dimensions can capture more nuance but cost more storage and compute per comparison; bigger is not automatically better.</li>
          <li><strong>Quality is domain-sensitive.</strong> A general embedder can underperform a domain-tuned one on legal, medical, or code text.</li>
        </ul>
        <p>You compare vectors with cosine similarity (or L2 distance). To search millions quickly, you store them in a vector database that uses approximate-nearest-neighbour indexes.</p>`,
      expert: `
        <p>Production nuances that separate a toy from a system: choose an embedder using a <strong>benchmark on your own data</strong>, not a leaderboard alone (MTEB is a starting point, not a verdict) — retrieval quality is task- and domain-specific. Consider <strong>Matryoshka (MRL) embeddings</strong>, where a single model produces vectors you can safely truncate to fewer dimensions, letting you trade accuracy for storage/latency without re-embedding. Watch <strong>max input length</strong>: most embedders silently truncate long inputs, so a document longer than the model's window loses its tail — chunk before embedding.</p>
        <p>Normalize thoughtfully: if you L2-normalize vectors at index time, dot product equals cosine and many ANN indexes run faster; be consistent between indexing and query. Beware <strong>asymmetric retrieval</strong> — some models are trained with distinct query and passage encoders or prompts ("query: …", "passage: …"); using the wrong side tanks recall. And remember embeddings encode <strong>surface semantics, not truth or freshness</strong>: two contradictory statements about the same topic embed close together, so retrieval finds <em>relevant</em> text, not <em>correct</em> text — verification is a separate job.</p>
        <p>Operationally, embeddings drift when you change models or preprocessing, which means a <strong>re-embedding migration</strong> of the whole corpus (and index rebuild) — version your embedding model alongside your data. Cost and latency scale with corpus size and dimension; batch embedding calls, cache embeddings of stable content, and monitor for silent truncation and rate limits just as with generation calls.</p>`,
    },
    examples: [
      {
        title: 'Embed, then rank by meaning',
        lang: 'python',
        code: `from openai import OpenAI
import numpy as np
client = OpenAI()

def embed(texts):
    r = client.embeddings.create(model="text-embedding-3-small", input=texts)
    return np.array([d.embedding for d in r.data])

query = "how do I reset my password?"
docs  = ["Change your account credentials here...",
         "Our refund policy allows 30 days...",
         "Forgot login? Use the reset link..."]

qv = embed([query])[0]
dv = embed(docs)
sims = dv @ qv / (np.linalg.norm(dv, axis=1) * np.linalg.norm(qv))
best = int(sims.argmax())   # doc 0 or 2 win despite different wording`,
        note: 'The password query matches the credential/reset docs by meaning, not shared keywords — the whole point of embeddings.',
      },
      {
        title: 'A rule you must not break',
        lang: 'text',
        code: `index built with:   text-embedding-3-large   (3072-dim space A)
query embedded with: bge-large               (1024-dim space B)

Result: similarity scores are MEANINGLESS.
Different models = different, incomparable spaces.
Always embed queries with the SAME model as the index.`,
        note: 'Mixing embedders is a silent, catastrophic bug — the numbers still compute, they just mean nothing.',
      },
    ],
    glossary: [
      { term: 'Embedding', def: 'A fixed-length numeric vector representing the meaning of text as a point in space, so similarity becomes distance.' },
      { term: 'Embedding model', def: 'A model trained specifically to produce comparable whole-text vectors for retrieval (e.g. text-embedding-3, BGE, E5).' },
      { term: 'Dimensionality', def: 'How many numbers are in each vector; a cost/precision trade-off, not a strict measure of quality.' },
      { term: 'MTEB', def: 'A public benchmark suite for comparing embedding models across tasks — a starting point, best confirmed on your own data.' },
      { term: 'Matryoshka (MRL)', def: 'An embedding trained so shorter prefixes of the vector remain useful, letting you truncate dimensions to trade accuracy for cost.' },
      { term: 'Asymmetric retrieval', def: 'Models that expect distinct query vs passage encodings/prompts; using the wrong side badly degrades recall.' },
      { term: 're-embedding migration', def: 'Re-computing all vectors and rebuilding the index when you change embedding model or preprocessing.' },
    ],
    practice: [
      { q: 'You get nonsense results after swapping embedding models for queries only. Why?', a: 'Each model defines its own vector space; query vectors from model B are not comparable to index vectors from model A. Re-embed queries (and ideally the whole index) with one consistent model.' },
      { q: 'Is a higher-dimensional embedding always better?', a: 'No. It is a cost/precision trade-off — more dimensions cost more storage and compute per comparison, and a smaller domain-tuned model can beat a larger general one on your data.' },
      { q: 'Your documents are longer than the embedder\'s max input. What happens and what do you do?', a: 'Most embedders silently truncate, dropping the tail so its meaning is lost. Chunk documents to fit the model\'s window before embedding.' },
      { q: 'Retrieval returns a relevant but factually wrong passage. Is that an embedding failure?', a: 'No. Embeddings encode relevance/semantics, not truth — contradictory statements on a topic embed close together. Correctness must be handled separately (reranking, verification, source quality).' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'decoding': {
    levels: {
      beginner: `
        <p>A model does not write an answer all at once. It writes <strong>one token at a time</strong>, like the predictive-text bar on a phone: pick a piece, add it, look at everything so far, pick the next piece, repeat. This one-piece-at-a-time process is called <strong>autoregressive generation</strong>.</p>
        <p>At each step the model actually produces a whole list of possible next tokens, each with a probability. <em>How</em> it chooses from that list is controlled by a few dials — most importantly <strong>temperature</strong>. Low temperature makes it play safe and predictable; high temperature makes it more surprising and creative.</p>
        <p>Rule of thumb: for factual, consistent answers use a low temperature; for brainstorming or creative writing, raise it. The slider above lets you watch the odds change.</p>`,
      intermediate: `
        <p>The model outputs <strong>logits</strong> (raw scores) for every token in the vocabulary; softmax turns them into a probability distribution; a <strong>sampling strategy</strong> then picks one. The common controls:</p>
        <ul>
          <li><strong>Temperature</strong> — divides the logits before softmax. Near 0 → greedy, near-deterministic; higher → flatter, more random.</li>
          <li><strong>Top-k</strong> — only the k highest-probability tokens are eligible; the rest are discarded before sampling.</li>
          <li><strong>Top-p (nucleus)</strong> — keep the smallest set of tokens whose cumulative probability reaches p (e.g. 0.9), then sample among those. It adapts the cutoff to the distribution's shape.</li>
          <li><strong>Frequency/presence penalties</strong> — down-weight tokens already used, reducing repetition and loops.</li>
        </ul>
        <p>These interact. A common recipe is a moderate temperature with top-p ≈ 0.9. Change one dial at a time when tuning, or you cannot tell which caused a change. For anything you need to parse or that must be reproducible-ish, favour low temperature.</p>`,
      expert: `
        <p>Decoding strategy is a quality/latency/diversity lever, not a mere afterthought. <strong>Greedy</strong> decoding (argmax) is fast and stable but can get stuck in bland or repetitive loops; <strong>beam search</strong> (keeping several candidate sequences) helps for short, closed-ended tasks like translation but tends to produce dull, "safe" text for open-ended generation and is rarely used for chat. <strong>Sampling</strong> (temperature + top-p/top-k) is the norm for assistants because it balances coherence and variety.</p>
        <p>Newer methods matter in production: <strong>min-p</strong> sampling thresholds relative to the top token for more robust cutoffs across contexts; <strong>repetition/no-repeat-ngram</strong> penalties curb loops; and <strong>logit bias</strong> lets you forbid or force specific tokens (e.g. ban a stop word, steer toward a label set). <strong>Constrained decoding</strong> (grammars, JSON schemas) masks illegal tokens at each step to <em>guarantee</em> valid structure — a Phase-7 topic, but it lives at this layer. <strong>Speculative decoding</strong> also operates here: a small draft model proposes tokens the big model verifies in parallel, speeding generation with identical output.</p>
        <p>Two gotchas: first, <code>temperature=0</code> means greedy, not bit-reproducible — GPU floating-point nondeterminism remains. Second, <strong>output tokens usually dominate latency and cost</strong> because they are generated serially (each depends on the last), whereas the prompt is processed in parallel; so capping <code>max_tokens</code> and prompting for concise answers is often your biggest speed/cost win. Streaming does not change total time but massively improves perceived latency by showing the first tokens immediately.</p>`,
    },
    examples: [
      {
        title: 'Same prompt, different dials',
        lang: 'python',
        code: `# Deterministic-ish, for extraction / classification / code
resp = client.messages.create(model=M, max_tokens=200,
        temperature=0.0, messages=msgs)

# Balanced creativity, for chat / drafting
resp = client.messages.create(model=M, max_tokens=400,
        temperature=0.7, top_p=0.9, messages=msgs)

# Tune ONE knob at a time so you know what changed.`,
        note: 'Match the dials to the job: low temperature when you need consistency, higher when you want variety.',
      },
      {
        title: 'Why top-p adapts where top-k does not',
        lang: 'text',
        code: `Confident step: probs = [0.92, 0.04, 0.02, 0.01, ...]
  top_p=0.9 keeps just the 1 dominant token   (focused)
  top_k=40  still keeps 40 tokens              (lets in noise)

Uncertain step: probs = [0.15, 0.13, 0.12, 0.11, ...]
  top_p=0.9 keeps many tokens                  (allows variety)
  top_k=40  keeps 40 regardless                (fixed)`,
        note: 'Top-p sizes the candidate pool to the model\'s confidence at each step; top-k is a fixed count.',
      },
    ],
    glossary: [
      { term: 'Autoregressive generation', def: 'Producing text one token at a time, each conditioned on all tokens generated so far.' },
      { term: 'Logits', def: 'The raw, unnormalized scores the model assigns to every vocabulary token before softmax.' },
      { term: 'Temperature', def: 'A divisor on logits controlling randomness: ~0 = greedy/predictable, higher = flatter/more varied.' },
      { term: 'Top-k', def: 'Restrict sampling to the k highest-probability tokens.' },
      { term: 'Top-p (nucleus)', def: 'Sample from the smallest set of tokens whose cumulative probability ≥ p — an adaptive cutoff.' },
      { term: 'Greedy vs beam vs sampling', def: 'Greedy always takes the top token; beam keeps several candidate sequences; sampling draws from the distribution (the norm for chat).' },
      { term: 'Logit bias', def: 'A per-token adjustment to forbid or encourage specific tokens during decoding.' },
    ],
    practice: [
      { q: 'You need JSON you can parse reliably. What temperature and why?', a: 'Low (≈0). You want deterministic, predictable output so the structure is stable and parseable; high temperature increases the chance of format drift.' },
      { q: 'What is the difference between top-k and top-p?', a: 'Top-k always keeps a fixed number of candidate tokens; top-p keeps however many tokens are needed to reach a cumulative probability, so the pool shrinks when the model is confident and grows when it is unsure.' },
      { q: 'Why do output tokens cost more time than input tokens?', a: 'Input is processed in parallel in one pass, but output tokens are generated serially — each depends on the previous — so generation length dominates latency and cost. Capping max_tokens is a top optimization.' },
      { q: 'Does streaming make generation faster?', a: 'No — total time is about the same. It improves <em>perceived</em> latency by showing the first tokens almost immediately instead of after the whole answer is done.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'context-window': {
    levels: {
      beginner: `
        <p>The <strong>context window</strong> is how much text a model can consider at once — think of it as the size of its desk. Your question, any documents you paste, the conversation history, and the answer being written all have to fit on that desk together. When it is full, the oldest things fall off.</p>
        <p>The desk is measured in tokens, and it is <strong>shared</strong> between what goes in and what comes out: fill it almost entirely with a long document and there is little room left to generate an answer.</p>
        <p>Two surprises: bigger is not always better — models pay closest attention to the start and end and can gloss over the middle — and a fuller desk costs more money and runs slower. So do not dump everything in "just in case".</p>`,
      intermediate: `
        <p>Every request's total tokens = system prompt + conversation history + retrieved context + the space reserved for the reply (<code>max_tokens</code>). Because chat APIs are stateless, your app resends the growing history each turn, so long conversations steadily consume more of the window and cost more — until they must be trimmed.</p>
        <p>The <strong>"lost in the middle"</strong> effect is well documented: recall of information placed in the middle of a long context is markedly worse than at the beginning or end. So position matters — put the task instruction and the most important evidence at the boundaries.</p>
        <p>Managing a long conversation ("context management") uses a few techniques: <strong>truncation</strong> (drop oldest turns), <strong>summarization/compaction</strong> (replace old turns with a compact summary), and <strong>retrieval</strong> (store history externally and pull back only what is relevant now). Reserve enough headroom for the output, or generation gets cut off (a <code>stop_reason</code> of <code>max_tokens</code>).</p>`,
      expert: `
        <p>Distinguish <strong>advertised vs effective</strong> context. A model may accept a million tokens yet reason reliably over far fewer; measure with your own "needle in a haystack" and multi-fact tests rather than trusting the headline number. Long-context quality also depends on the <strong>positional scheme</strong> (RoPE and extensions like YaRN/NTK scaling) and on training data length distribution, so behaviour degrades unevenly as you approach the limit.</p>
        <p>Economics: because attention is O(n²) and the KV-cache grows with context, both latency and cost rise super-linearly as the window fills. <strong>Prompt caching</strong> is the key mitigation — providers can cache a long, stable prefix (a big system prompt, few-shot exemplars, a fixed document) so repeated calls skip re-processing it, cutting cost and time dramatically. Structure prompts so the cacheable part is a stable prefix and only the variable part changes.</p>
        <p>Design implications: prefer <strong>retrieval over stuffing</strong> — pulling the right 3–5 chunks beats pasting a whole corpus, both for cost and for accuracy (less distractor text). For agents and long chats, implement explicit <strong>context compaction</strong> (summarize completed sub-tasks, keep a rolling working set) and treat the window as a budget with named allocations (system / tools / memory / retrieved / output). Monitor real token usage per request; "it worked in testing" often hides a slow context creep that eventually truncates silently.</p>`,
    },
    examples: [
      {
        title: 'Budgeting the window',
        lang: 'text',
        code: `Window = 200,000 tokens (the "desk")

  system prompt ............   2,000
  few-shot examples ........   3,000
  conversation history .....  20,000
  retrieved documents ......  40,000
  ------------------------------------
  used so far ..............  65,000
  reserve for the answer ...   4,000  (max_tokens)
  ------------------------------------
  comfortable headroom left: ~131,000

Overfill the input and the answer gets truncated (stop_reason=max_tokens).`,
        note: 'Treat the window as a budget with line items, always reserving room for the output.',
      },
      {
        title: 'Compact an old conversation to save the window',
        lang: 'python',
        code: `# When history grows large, replace old turns with a summary.
if tokens(history) > 15_000:
    summary = summarize(history[:-6])          # compress all but recent turns
    history = [{"role": "system", "content": f"Summary so far: {summary}"}] \\
              + history[-6:]                    # keep the last few verbatim`,
        note: 'Summarization keeps the essential thread while freeing desk space — vital for long agent runs and chats.',
      },
    ],
    glossary: [
      { term: 'Context window', def: 'The maximum tokens a model can attend to in one call, shared between prompt and generated output.' },
      { term: 'Lost in the middle', def: 'The tendency to recall information at the start/end of a long context more reliably than the middle.' },
      { term: 'Context management', def: 'Techniques (truncation, summarization, retrieval) to keep a long/growing conversation within the window.' },
      { term: 'Prompt caching', def: 'Reusing a cached, stable prompt prefix across calls so it is not re-processed — a major cost/latency saver on large fixed context.' },
      { term: 'Effective vs advertised context', def: 'The length a model reasons well over vs the length it will accept; the former is usually smaller and must be measured.' },
      { term: 'Needle in a haystack', def: 'A test that hides a fact in a long context and checks whether the model can retrieve it, probing effective context.' },
      { term: 'max_tokens', def: 'The cap on generated output; must be reserved within the window or the answer is truncated.' },
    ],
    practice: [
      { q: 'You paste a huge document and the answer comes back cut off. Why?', a: 'The window is shared between input and output. The document consumed almost all of it, leaving too little room for generation, so the reply hit the max_tokens/space limit and truncated. Reserve output headroom or retrieve less.' },
      { q: 'Where should you place the most important instruction in a long prompt?', a: 'At the beginning or the end. Models attend most reliably to the boundaries and can gloss over the middle ("lost in the middle").' },
      { q: 'A model advertises a 1M-token window. Can you trust it to use all of it well?', a: 'Not blindly. Effective context (where it reasons reliably) is usually smaller than advertised. Measure with needle-in-a-haystack and multi-fact tests on your own data.' },
      { q: 'Why does prompt caching help, and how do you structure prompts for it?', a: 'It lets the provider skip re-processing a stable prefix, cutting cost and latency super-linearly as context grows. Put the large fixed part (system prompt, exemplars, fixed docs) first as a stable prefix, and vary only the tail.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'training-stages': {
    levels: {
      beginner: `
        <p>A helpful assistant is not built in one step — it grows up in stages, much like a student:</p>
        <ul>
          <li><strong>1. Pretraining — "read everything."</strong> The model reads a vast amount of text and just learns to predict the next word. This gives it broad knowledge and language skill, but it does not yet know how to <em>follow instructions</em>.</li>
          <li><strong>2. Fine-tuning — "learn by example."</strong> It is shown many examples of good question→answer pairs, which teaches it to actually respond helpfully when asked.</li>
          <li><strong>3. Feedback — "get coached."</strong> Humans (or another AI) compare its answers and mark which are better; the model adjusts to prefer the better style — more helpful, polite, and safe.</li>
        </ul>
        <p>You use the finished product, but these stages explain why models are knowledgeable yet still need clear prompting, and why they have a certain tone and set of refusals.</p>`,
      intermediate: `
        <p>The technical names:</p>
        <ul>
          <li><strong>Pretraining</strong> — self-supervised next-token prediction over trillions of tokens. Produces a <em>base model</em>: fluent and knowledgeable, but it completes text rather than answering questions.</li>
          <li><strong>Supervised fine-tuning (SFT)</strong> — training on curated prompt→response demonstrations, which teaches the chat format and instruction-following.</li>
          <li><strong>Preference optimization</strong> — aligning tone, helpfulness, and safety using human preference data. <strong>RLHF</strong> trains a reward model on human rankings, then uses reinforcement learning (PPO) to prefer higher-reward answers. <strong>DPO</strong> reaches a similar goal by optimizing directly on chosen/rejected pairs, skipping the separate reward model — simpler and increasingly common.</li>
        </ul>
        <p>Why it matters to you as a builder: a <em>base</em> model and an <em>instruct/chat</em> model behave very differently — always use the instruct variant for assistants. Alignment is also why models refuse some requests and hedge; that behaviour was trained in during this stage, not hard-coded.</p>`,
      expert: `
        <p>Each stage shapes what you can and cannot fix with prompting or fine-tuning. Knowledge and capabilities are overwhelmingly set in <strong>pretraining</strong>; SFT and preference tuning mostly teach <em>behaviour and format</em>, not new facts — a key reason RAG (retrieval) beats fine-tuning for injecting fresh or proprietary knowledge. The knowledge <strong>cutoff</strong> and training-data biases likewise originate here.</p>
        <p>Alignment introduces the <strong>alignment tax</strong> (some raw capability can be traded for helpfulness/safety) and phenomena like sycophancy (agreeing with the user) and calibrated refusals — all learned from the preference data, so they vary by provider and version. Modern pipelines add <strong>RLAIF/Constitutional AI</strong> (AI-generated preference labels against written principles) to scale feedback, and increasingly <strong>reasoning-focused RL</strong> that rewards correct step-by-step solutions, which underlies "thinking" models (a Phase-7 topic).</p>
        <p>For practitioners this frames the build-vs-prompt decision: to change <em>style/format/persona</em>, prompt first, then SFT/DPO on examples; to add <em>knowledge</em>, use retrieval; to change <em>core capability</em>, you generally cannot without pretraining-scale resources, so pick a stronger base model instead. Understanding the stack also demystifies version differences: two releases of "the same" model can differ mainly in their alignment/preference data, changing tone and refusal behaviour while core knowledge is similar.</p>`,
    },
    examples: [
      {
        title: 'Base vs instruct — a concrete difference',
        lang: 'text',
        code: `Prompt: "Explain photosynthesis."

BASE model (pretraining only) might continue:
  "Explain photosynthesis. Explain respiration. Explain the
   water cycle. (a list of homework questions...)"
  -> it completes text; it doesn't realize it's being ASKED.

INSTRUCT model (after SFT + preference tuning):
  "Photosynthesis is how plants convert sunlight, water, and
   CO2 into glucose and oxygen. Here's how it works: ..."
  -> it answers, because SFT taught the question->answer format.`,
        note: 'Always use the instruct/chat variant for assistant apps; the base model is a text-completer, not a responder.',
      },
      {
        title: 'Choosing the right lever',
        lang: 'text',
        code: `Want to change...           Use...
  writing style / persona    prompt, then SFT/DPO on examples
  output format (JSON etc.)  prompt / structured outputs
  fresh or private facts     RAG (retrieval) — NOT fine-tuning
  core reasoning ability     a stronger base model`,
        note: 'Stages map to fixes: behaviour → fine-tune; knowledge → retrieve; capability → bigger/better base.',
      },
    ],
    glossary: [
      { term: 'Pretraining', def: 'Self-supervised next-token prediction over huge text corpora; produces a knowledgeable base model that completes rather than answers.' },
      { term: 'Base vs instruct model', def: 'Base completes text; instruct/chat has been fine-tuned + aligned to follow instructions. Use instruct for assistants.' },
      { term: 'Supervised fine-tuning (SFT)', def: 'Training on prompt→response demonstrations to teach the chat format and instruction-following.' },
      { term: 'RLHF', def: 'Reinforcement Learning from Human Feedback: train a reward model on human rankings, then optimize the policy (PPO) toward higher reward.' },
      { term: 'DPO', def: 'Direct Preference Optimization: align directly on chosen/rejected pairs without a separate reward model — simpler than RLHF.' },
      { term: 'Alignment tax', def: 'The tendency for safety/helpfulness alignment to trade away some raw capability.' },
      { term: 'Knowledge cutoff', def: 'The date after which the base model has no training knowledge — a pretraining artifact, addressed with retrieval/tools.' },
    ],
    practice: [
      { q: 'Why does RAG usually beat fine-tuning for adding fresh company facts?', a: 'Knowledge is set mainly during pretraining; SFT/preference tuning teach behaviour and format, not new facts. Retrieval injects up-to-date, verifiable knowledge at query time without retraining.' },
      { q: 'What is the practical difference between a base model and an instruct model?', a: 'A base model completes text and does not reliably follow instructions; an instruct/chat model has had SFT + preference tuning so it answers questions and follows directions. Use instruct for assistants.' },
      { q: 'Where do a model\'s refusals and "tone" come from?', a: 'From the preference/alignment stage (RLHF/DPO/Constitutional AI), learned from human or AI feedback data — not hard-coded rules. That is why tone and refusals vary by provider and version.' },
      { q: 'You want a consistent brand voice. Prompt, fine-tune, or retrieve?', a: 'Prompt first (cheap, fast). If it must be very consistent, fine-tune (SFT/DPO) on examples of the voice. Retrieval is for facts, not style.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'finetuning': {
    levels: {
      beginner: `
        <p><strong>Fine-tuning</strong> is taking an already-trained model and giving it extra training on your own examples, so it gets better at your specific task or matches your style. Think of hiring a smart, experienced person and giving them a short course on <em>how your team does things</em> — the general ability is already there; you are specializing it.</p>
        <p>You would fine-tune to make the model reliably follow a particular <strong>style or format</strong>, or to handle a narrow task where showing examples teaches it better than instructions could.</p>
        <p>The most important beginner rule: fine-tuning is great for <em>style and behaviour</em>, but it is usually the <strong>wrong tool for adding facts</strong> — for knowledge, look things up at query time (RAG). Reach for prompting first; fine-tune only when prompting is not enough.</p>`,
      intermediate: `
        <p>There is a spectrum from cheap to expensive:</p>
        <ul>
          <li><strong>Full fine-tuning</strong> — update every weight. Maximum control, but expensive and it produces a whole new model copy per task to store and serve.</li>
          <li><strong>LoRA (Low-Rank Adaptation)</strong> — freeze the base model and train small "adapter" matrices inserted into it. The adapter is tiny (megabytes), fast to train, and swappable, so one base model can serve many tasks by loading different adapters.</li>
          <li><strong>QLoRA</strong> — LoRA on top of a 4-bit <em>quantized</em> base, so even very large models can be fine-tuned on a single GPU.</li>
          <li><strong>DPO / preference tuning</strong> — fine-tune on chosen/rejected pairs to shape behaviour and preferences rather than add knowledge.</li>
        </ul>
        <p>You need a dataset of high-quality examples (often just hundreds to a few thousand for LoRA on a narrow task), a held-out eval set, and a clear metric. Data quality dominates: a small, clean, consistent dataset beats a large noisy one.</p>`,
      expert: `
        <p>Decide with a cost/benefit lens. Fine-tuning earns its keep when you need <strong>consistent format/style at scale, lower per-call cost</strong> (a fine-tuned small model can replace a big prompted one), <strong>latency</strong> (shorter prompts, since instructions are baked in), or a <strong>narrow task</strong> where a small model can match a large one after specialization. It does <em>not</em> reliably teach new facts, fix reasoning gaps, or keep up with changing information — use RAG/tools for those.</p>
        <p>Engineering realities: LoRA hyperparameters (rank, alpha, target modules, learning rate) and data formatting must match the base model's chat template exactly, or quality collapses. Guard against <strong>catastrophic forgetting</strong> (over-training on a narrow set erodes general ability) and <strong>overfitting</strong> (memorizing the training set) with held-out evals, early stopping, and mixing in some general data. Always compare against strong prompting and few-shot baselines before committing — many "we need fine-tuning" problems are solved by a better prompt or retrieval.</p>
        <p>Serving: LoRA adapters enable multi-tenant serving (many adapters on one base, hot-swapped per request, e.g. via S-LoRA/vLLM), which is far cheaper than hosting many full models. Preference methods (DPO and successors like ORPO/KTO) are now the practical path to behavioural alignment without standing up a full RLHF pipeline. Version your datasets, adapters, and eval scores together (Phase-0 Git discipline) so every behavioural change is traceable and reversible.</p>`,
    },
    examples: [
      {
        title: 'When to fine-tune vs prompt vs retrieve',
        lang: 'text',
        code: `Symptom / goal                         Best first tool
  "answers use the wrong tone"          prompt -> then SFT/LoRA
  "must output our exact JSON shape"    structured outputs / prompt
  "needs this week's product data"      RAG (retrieval)
  "big-model cost too high at scale"    distill/fine-tune a small model
  "reasoning is just wrong"             stronger base model, not FT`,
        note: 'Fine-tuning is a behaviour/efficiency tool, not a knowledge tool — try prompting and retrieval first.',
      },
      {
        title: 'Why LoRA is the popular default',
        lang: 'text',
        code: `Full fine-tune of a 13B model:
  - updates ALL ~13B parameters
  - stores a full ~26GB copy PER task
  - needs multiple high-end GPUs

LoRA on the same model:
  - freezes the base, trains ~0.1-1% extra params
  - adapter file is a few MB, swappable at serve time
  - trains on a single GPU (QLoRA: even a consumer GPU)`,
        note: 'Same specialization, a fraction of the cost and storage — one base model can carry many LoRA adapters.',
      },
    ],
    glossary: [
      { term: 'Fine-tuning', def: 'Continuing training of a pretrained model on your own examples to specialize its behaviour, style, or task performance.' },
      { term: 'Full fine-tuning', def: 'Updating all model weights — most powerful, most expensive, one full model copy per task.' },
      { term: 'LoRA', def: 'Low-Rank Adaptation: freeze the base and train tiny inserted adapter matrices; small, fast, swappable.' },
      { term: 'QLoRA', def: 'LoRA applied on a 4-bit quantized base, enabling fine-tuning of large models on a single GPU.' },
      { term: 'Catastrophic forgetting', def: 'Loss of general ability when a model is over-trained on a narrow dataset.' },
      { term: 'Overfitting', def: 'Memorizing the training set rather than learning to generalize; caught with held-out evaluation.' },
      { term: 'Adapter serving', def: 'Hosting many LoRA adapters on one base model, hot-swapping per request for cheap multi-task serving.' },
    ],
    practice: [
      { q: 'Your model gives outdated facts. Is fine-tuning the fix?', a: 'No. Fine-tuning teaches behaviour/style, not fresh facts, and it goes stale. Use RAG/tools to inject current, verifiable knowledge at query time.' },
      { q: 'Why is LoRA usually preferred over full fine-tuning?', a: 'It freezes the base and trains a tiny adapter (megabytes), so it is far cheaper, trains on modest hardware, and lets one base model serve many tasks by swapping adapters — with quality close to full fine-tuning on narrow tasks.' },
      { q: 'What are the two big training failure modes and how do you catch them?', a: 'Catastrophic forgetting (loses general ability) and overfitting (memorizes the training set). Catch both with a held-out eval set, early stopping, and mixing in general data.' },
      { q: 'Before fine-tuning, what should you always try first?', a: 'Strong prompting and few-shot examples, plus retrieval for any knowledge need. Many "we need fine-tuning" cases are solved more cheaply by a better prompt or RAG.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'quantization': {
    levels: {
      beginner: `
        <p><strong>Quantization</strong> is like saving a photo at a lower resolution: the file is smaller and loads faster, and for most uses you can barely tell the difference — only if you zoom right in is it slightly less sharp.</p>
        <p>A model is a giant pile of numbers. Normally each is stored very precisely, which takes a lot of memory. Quantization rounds those numbers to shorter, "good enough" versions, so the whole model takes far less space and runs faster — sometimes even on a laptop.</p>
        <p>You will see labels like <strong>FP16</strong> (full quality), <strong>INT8</strong> (about half the size, barely any quality loss), and <strong>INT4</strong> (a quarter of the size, a small quality loss). Lower = smaller and faster, but slightly less accurate. Use the toggle above to feel the trade-off.</p>`,
      intermediate: `
        <p>Numbers in a model are stored in a numeric <strong>precision</strong>. Common ones: <strong>FP32</strong> (32-bit, training default), <strong>FP16/BF16</strong> (16-bit, the usual serving baseline), <strong>INT8</strong> (8-bit), and <strong>INT4/NF4</strong> (4-bit). Halving the bits roughly halves memory and can speed inference, because you move and multiply fewer bytes.</p>
        <p>A rough sizing rule: a model needs about <em>(params × bytes-per-param)</em> of memory for weights. A 7-billion-parameter model is ~14GB at FP16, ~7GB at INT8, ~3.5GB at INT4 — which is exactly why 4-bit lets big models run on modest GPUs.</p>
        <p>Two families of method: <strong>post-training quantization (PTQ)</strong> compresses an already-trained model (fast, no retraining — e.g. GPTQ, AWQ, GGUF formats), while <strong>quantization-aware training (QAT)</strong> trains with quantization in mind for better quality at low bit-widths (slower, needs training). For running open models locally you will mostly meet PTQ formats like GGUF (e.g. a "Q4_K_M" file).</p>`,
      expert: `
        <p>Not all bits are equal. Aggressive weight quantization (4-bit) is usually tolerable for inference, but <strong>activations and the KV-cache</strong> are more sensitive; outlier activations can wreck naive schemes, which is why methods like LLM.int8() isolate outliers and AWQ/GPTQ use per-group scales and calibration data to protect salient weights. Expect a small but real quality drop that grows at lower bit-widths and varies by task — measure on <em>your</em> eval, especially for reasoning and long-context, where degradation shows first.</p>
        <p>Performance is nuanced: quantization primarily saves <strong>memory and memory bandwidth</strong>, and LLM inference is often memory-bandwidth-bound, so 4-bit can speed up decode — but only if the runtime has optimized low-bit kernels; otherwise you save memory without much speed, or even lose speed to dequantization overhead. KV-cache quantization is a separate lever that extends usable context on limited VRAM.</p>
        <p>Practical guidance: for self-hosting, pick a well-supported format for your engine (GGUF for llama.cpp/Ollama; GPTQ/AWQ for GPU serving via vLLM/TGI), start at 8-bit if quality is critical and try 4-bit if memory-constrained, and always A/B against the full-precision baseline on your metrics. Quantization composes with LoRA (QLoRA fine-tunes a 4-bit base) and is central to on-device/edge deployment. It is a deployment-time trade-off knob — not a strict upgrade — so treat "which quantization" as an eval-driven decision.</p>`,
    },
    examples: [
      {
        title: 'Memory footprint by precision (≈ 7B params)',
        lang: 'text',
        code: `Precision   bytes/param   weights memory   quality
  FP32        4             ~28 GB           reference
  FP16/BF16   2             ~14 GB           ~reference
  INT8        1             ~7 GB            tiny loss
  INT4/NF4    0.5           ~3.5 GB          small loss

Lower precision = smaller & often faster, slightly less accurate.`,
        note: 'This sizing is why 4-bit quantization is what puts big models on consumer GPUs and laptops.',
      },
      {
        title: 'Running a quantized model locally',
        lang: 'bash',
        code: `# Ollama pulls a quantized (GGUF) model by default
ollama run llama3            # ships as ~4-bit; runs on a laptop

# Pick a specific quantization level explicitly
ollama run llama3:8b-instruct-q8_0   # 8-bit: higher quality, more RAM
ollama run llama3:8b-instruct-q4_K_M # 4-bit: smaller, faster, small loss`,
        note: 'The q4/q8 suffix is the precision dial: q8 for quality, q4 when memory is tight — benchmark both on your task.',
      },
    ],
    glossary: [
      { term: 'Quantization', def: 'Storing model numbers at lower numeric precision to shrink memory and speed inference, at a small accuracy cost.' },
      { term: 'Precision (FP32/FP16/INT8/INT4)', def: 'How many bits represent each number; fewer bits = less memory and often more speed, slightly less accuracy.' },
      { term: 'PTQ', def: 'Post-Training Quantization: compress an already-trained model without retraining (GPTQ, AWQ, GGUF).' },
      { term: 'QAT', def: 'Quantization-Aware Training: train with quantization simulated, giving better quality at low bit-widths but requiring training.' },
      { term: 'GGUF', def: 'A popular file format for quantized models run on CPUs/laptops via llama.cpp/Ollama (e.g. Q4_K_M).' },
      { term: 'KV-cache quantization', def: 'Quantizing the stored attention Keys/Values to extend usable context on limited memory.' },
      { term: 'Memory-bandwidth bound', def: 'When inference speed is limited by moving weights to/from memory — the regime where quantization most helps latency.' },
    ],
    practice: [
      { q: 'What does quantization primarily save, and when does it also speed things up?', a: 'It primarily saves memory and memory bandwidth. It also speeds up inference when the runtime has optimized low-bit kernels and the workload is memory-bandwidth-bound; without such kernels you may save memory but not much time.' },
      { q: 'Why does 4-bit let a large model run on a consumer GPU?', a: 'It roughly quarters the weight memory vs FP16 (e.g. a 7B model from ~14GB to ~3.5GB), fitting within limited VRAM.' },
      { q: 'What is the difference between PTQ and QAT?', a: 'PTQ compresses an already-trained model with no retraining (fast, e.g. GPTQ/AWQ/GGUF); QAT trains with quantization simulated for better low-bit quality but needs a training run.' },
      { q: 'How should you choose a quantization level for production?', a: 'Empirically: A/B each candidate (e.g. 8-bit vs 4-bit) against the full-precision baseline on your own eval, watching reasoning and long-context tasks where degradation appears first. It is a trade-off knob, not a free upgrade.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'prompt-engineering': {
    levels: {
      beginner: `
        <p>An AI does very different things depending on <em>how</em> you ask. <strong>Prompt engineering</strong> is simply the craft of asking well — the same way a clear request to a colleague gets a better result than a vague one.</p>
        <p>Beginner moves that reliably help:</p>
        <ul>
          <li><strong>Be specific about task and format.</strong> "Summarize this in 3 bullets for a beginner" beats "summarize this".</li>
          <li><strong>Show an example or two</strong> (few-shot). Demonstrating the input→output you want often works better than describing it.</li>
          <li><strong>Ask it to think step by step</strong> (chain-of-thought) for reasoning or maths.</li>
          <li><strong>Set a role</strong>: "You are a patient tutor" shapes tone and depth.</li>
        </ul>
        <p>Treat the model like a brilliant but very literal intern: tell it clearly what you want, show an example, and say how to format the answer.</p>`,
      intermediate: `
        <p>The named techniques, and when to use them:</p>
        <ul>
          <li><strong>Zero-shot</strong> — just an instruction; fine for simple, common tasks.</li>
          <li><strong>Few-shot</strong> — include 1–5 worked examples to pin down format and edge cases. The single most reliable quality lever for structured tasks; keep examples diverse and representative.</li>
          <li><strong>Chain-of-thought (CoT)</strong> — "reason step by step before answering" measurably improves multi-step problems (note: modern "reasoning" models do this internally, so explicit CoT helps less there).</li>
          <li><strong>Role / system prompt</strong> — set persona, audience, constraints, and rules of engagement once at the top.</li>
          <li><strong>Output contracts</strong> — state the exact format ("respond only with JSON matching…"), pairing with structured outputs for reliability.</li>
        </ul>
        <p>Structure a prompt clearly: role and task first, then context/data, then explicit instructions and format, then examples. Use delimiters (headings, XML-ish tags, triple backticks) to separate instructions from data so the model does not confuse them. Iterate against a small eval set rather than by vibes.</p>`,
      expert: `
        <p>Advanced patterns extend the basics. <strong>Self-consistency</strong> samples several CoT answers and takes the majority, trading cost for accuracy on hard problems. <strong>Decomposition</strong> (least-to-most, plan-then-solve) breaks a task into ordered sub-steps. <strong>ReAct</strong> interleaves reasoning with tool calls (Phase 4). <strong>Prompt chaining</strong> splits a complex job into a pipeline of focused prompts, each validated, which is more reliable than one mega-prompt. Provide a <strong>reference / grounding</strong> (retrieved context) and instruct "answer only from the context; say you don't know otherwise" to curb hallucination.</p>
        <p>Placement and hygiene matter because of how attention works: put the most important instructions at the <strong>start and end</strong> (models lose the middle), keep the stable, cacheable content as a prefix (prompt caching), and separate <strong>trusted instructions from untrusted data</strong> — never let retrieved or user content be treated as commands, or you invite prompt injection (Phase 4 guardrails). Prefer positive, specific instructions over long lists of "don'ts", which models follow less reliably.</p>
        <p>Treat prompts as versioned artifacts under evaluation: maintain a golden test set, measure changes, and store prompt + score together (Phase 0/5). Beware over-fitting a prompt to one model — prompts are somewhat model-specific, and a migration (or a provider's model update) can shift behaviour, so re-run evals when the model changes. The goal is a robust, testable spec of desired behaviour, not a lucky incantation.</p>`,
    },
    examples: [
      {
        title: 'Vague vs engineered prompt',
        lang: 'text',
        code: `WEAK:
  "Summarize this."

STRONG:
  "You are a technical editor.
   Summarize the text below for a beginner in exactly 3 bullet
   points, each under 20 words. Use plain language, no jargon.

   TEXT:
   \"\"\"{document}\"\"\""

The strong version fixes role, audience, length, format, style,
and clearly separates instructions from the data.`,
        note: 'Specificity + clear format + delimiters around the data is most of prompt engineering in one example.',
      },
      {
        title: 'Few-shot to lock the format',
        lang: 'text',
        code: `Classify sentiment as POSITIVE, NEGATIVE, or NEUTRAL.

Review: "Loved it, works perfectly."   -> POSITIVE
Review: "Broke after one day."          -> NEGATIVE
Review: "It's fine, nothing special."   -> NEUTRAL
Review: "{new_review}"                  ->`,
        note: 'A few diverse examples pin down both the labels and the exact output shape far better than a description.',
      },
    ],
    glossary: [
      { term: 'Zero-shot', def: 'Prompting with only an instruction and no examples.' },
      { term: 'Few-shot', def: 'Including a handful of input→output examples to demonstrate the desired pattern and format.' },
      { term: 'Chain-of-thought (CoT)', def: 'Instructing the model to reason step by step before answering, improving multi-step tasks.' },
      { term: 'System prompt', def: 'Top-level instructions setting persona, rules, audience, and constraints for the whole interaction.' },
      { term: 'Self-consistency', def: 'Sampling several reasoning paths and taking the majority answer to boost accuracy on hard problems.' },
      { term: 'Prompt chaining', def: 'Splitting a complex task into a pipeline of smaller, validated prompts instead of one large prompt.' },
      { term: 'Grounding', def: 'Supplying reference context and instructing the model to answer only from it, reducing hallucination.' },
    ],
    practice: [
      { q: 'What is the single most reliable technique for getting a consistent output format?', a: 'Few-shot examples — showing 1–5 diverse input→output pairs pins down the format and edge cases far better than describing it, ideally paired with a stated output contract / structured outputs.' },
      { q: 'Why separate instructions from data with delimiters?', a: 'So the model does not mistake the data (a document, user text, retrieved content) for instructions. This also reduces prompt-injection risk when the data is untrusted.' },
      { q: 'Where should the most important instructions go in a long prompt, and why?', a: 'At the start and end. Because of how attention weights context, models attend most reliably to the boundaries and can neglect the middle.' },
      { q: 'You improved a prompt and quality jumped, then a model update made it worse. What went wrong and what is the fix?', a: 'Prompts are somewhat model-specific and can overfit to one version. Treat prompts as versioned artifacts with a golden eval set and re-run evals whenever the model changes.' },
    ],
  },
}
