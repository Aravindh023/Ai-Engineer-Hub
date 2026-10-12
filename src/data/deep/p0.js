// Deep, multi-level lessons for Phase 00 — Prerequisites.
// Schema per concept: { levels:{beginner,intermediate,expert}, examples:[{title,lang,code,note}],
//                       glossary:[{term,def}], practice:[{q,a}] }

export const DEEP_P0 = {
  /* ------------------------------------------------------------------ */
  'py-async': {
    levels: {
      beginner: `
        <p>Most of the time your AI code spends is not doing math — it is <strong>waiting</strong> for a reply to come back over the internet. A single call to a model can take anywhere from a fraction of a second to half a minute. If your program just sits frozen during that wait, and you have many calls to make, the waiting stacks up fast.</p>
        <p><strong>Asynchronous programming</strong> ("async") is Python's way of using that waiting time productively. The mental model: instead of one worker who starts a task and stares at it until it finishes, you have one very organised worker who starts a task, and while it is "cooking" starts the next one, checking back on each as they become ready.</p>
        <p>You write async code with two keywords. <code>async def</code> marks a function as one that can pause. <code>await</code> marks the exact spot where it is okay to pause — usually a line that waits on the network. When Python hits an <code>await</code>, it is saying "this will take a while; go do something else and come back when the answer arrives."</p>
        <p>The one habit to internalise now: <em>awaiting things one at a time in a loop is still sequential.</em> The speed-up only happens when you deliberately start many operations before awaiting their results.</p>`,
      intermediate: `
        <p>Under the hood, async runs on an <strong>event loop</strong>: a single thread that keeps a list of tasks and repeatedly runs whichever one is ready to make progress. When a task hits an <code>await</code> on I/O, it yields control back to the loop, which runs other ready tasks until the awaited result is available. Crucially this is <em>concurrency, not parallelism</em> — there is still only one thread, so it never uses more than one CPU core. It works purely because network waiting is idle time.</p>
        <p>The workhorse for running things concurrently is <code>asyncio.gather()</code>. You pass it many coroutines and it schedules them all, returning when every one is done. Compared to awaiting in a for-loop, this is the difference between 10 calls taking 20 seconds and taking ~2 seconds.</p>
        <p>Two tools you will reach for constantly:</p>
        <ul>
          <li><strong>Semaphore</strong> — <code>asyncio.Semaphore(n)</code> caps how many operations run at once. Without it, firing 500 requests at a provider gets you an instant rate-limit (429) error.</li>
          <li><strong>return_exceptions=True</strong> — by default, one failed coroutine in <code>gather()</code> raises and can abandon the rest. Passing this flag makes failures come back as values instead, so one bad call doesn't sink the whole batch.</li>
        </ul>
        <p>You will also use <strong>async context managers</strong> (<code>async with</code>, e.g. for an HTTP client) and sometimes <strong>async generators</strong> (<code>async for</code>) to consume a streaming response chunk by chunk.</p>`,
      expert: `
        <p>The number-one production bug in async code is a <strong>blocking call sneaking into the event loop</strong>. Any synchronous, CPU-bound or blocking-I/O call (the classic <code>requests</code> library, a heavy JSON parse, <code>time.sleep</code>, a synchronous DB driver) does not yield to the loop — it freezes <em>every</em> coroutine until it returns. Symptoms are baffling: your "concurrent" code runs serially and latency spikes. The fixes are to use async-native libraries, or to push genuinely blocking work to a thread pool via <code>asyncio.to_thread()</code> / <code>loop.run_in_executor()</code>, and CPU-bound work to a separate process (async does not help CPU-bound workloads at all — reach for <code>multiprocessing</code> there).</p>
        <p>Modern code favours <strong>structured concurrency</strong> with <code>asyncio.TaskGroup</code> (Python 3.11+): tasks spawned in a group are all awaited at the block's exit, and if one fails the group cancels the siblings and propagates the error cleanly. This avoids the classic "orphaned task" leaks you get from bare <code>create_task</code>. Pair it with <code>asyncio.timeout()</code> for cancellation windows.</p>
        <p>At scale you must think about <strong>backpressure and rate governance</strong>: a semaphore bounds concurrency, but you often also want a token-bucket limiter to respect requests-per-minute and tokens-per-minute quotas simultaneously, plus retry-with-jitter on 429/5xx layered <em>inside</em> the bounded worker so retries don't blow past your concurrency cap. Cancellation correctness matters too — always handle <code>asyncio.CancelledError</code> so partial work (open files, DB transactions) is cleaned up rather than left dangling.</p>
        <p>Finally, understand that <code>await</code> points are the <em>only</em> places a context switch can happen. Between them your code is effectively atomic, which is both a footgun (a long stretch of sync code starves everything) and a feature (you rarely need locks for simple shared-state updates that never await mid-update).</p>`,
    },
    examples: [
      {
        title: 'Sequential vs concurrent — the core win',
        lang: 'python',
        code: `import asyncio, time, httpx

async def call(client, prompt):
    r = await client.post(URL, json={"prompt": prompt})
    return r.json()

async def main():
    prompts = ["A", "B", "C", "D", "E"]
    async with httpx.AsyncClient(timeout=30) as client:
        # SLOW: awaits each before starting the next (~5x one call)
        seq = [await call(client, p) for p in prompts]

        # FAST: all five in flight at once (~1x one call)
        conc = await asyncio.gather(*(call(client, p) for p in prompts))
    return conc

asyncio.run(main())`,
        note: 'Same work, same API — the only difference is whether calls overlap. The <code>gather</code> version is limited by the slowest single call, not their sum.',
      },
      {
        title: 'Bounded concurrency + resilient batch',
        lang: 'python',
        code: `import asyncio, httpx

sem = asyncio.Semaphore(10)  # never more than 10 requests in flight

async def bounded_call(client, prompt):
    async with sem:                       # wait for a free slot
        r = await client.post(URL, json={"prompt": prompt})
        return r.json()

async def run_batch(prompts):
    async with httpx.AsyncClient(timeout=30) as client:
        results = await asyncio.gather(
            *(bounded_call(client, p) for p in prompts),
            return_exceptions=True,       # one failure won't kill the batch
        )
    ok = [r for r in results if not isinstance(r, Exception)]
    failed = [r for r in results if isinstance(r, Exception)]
    return ok, failed`,
        note: 'This is the shape of almost every real batch-inference or evaluation script: bounded, concurrent, and failure-tolerant.',
      },
      {
        title: 'Structured concurrency with a timeout (3.11+)',
        lang: 'python',
        code: `import asyncio

async def main():
    async with asyncio.timeout(15):        # cancel everything after 15s
        async with asyncio.TaskGroup() as tg:
            t1 = tg.create_task(call("A"))
            t2 = tg.create_task(call("B"))
        # both tasks are guaranteed complete (or the group raised) here
    return t1.result(), t2.result()`,
        note: 'If either task fails, the group cancels the other and raises — no leaked tasks, no half-finished state.',
      },
    ],
    glossary: [
      { term: 'Coroutine', def: 'A function defined with <code>async def</code>. Calling it does not run it — it returns an awaitable object that runs only when awaited or scheduled.' },
      { term: 'Event loop', def: 'The single-threaded scheduler that runs ready coroutines and resumes them when their awaited I/O completes.' },
      { term: 'await', def: 'Marks a suspension point: "pause here and let the loop run other work until this result is ready."' },
      { term: 'Task', def: 'A coroutine scheduled to run on the loop (via <code>create_task</code> or a TaskGroup) so it can progress concurrently with others.' },
      { term: 'Semaphore', def: 'A counter that limits how many coroutines may be inside a section at once — used to cap in-flight requests.' },
      { term: 'Concurrency vs parallelism', def: 'Concurrency = many tasks making progress by interleaving on one thread; parallelism = truly running at the same instant on multiple cores. Async gives you the former.' },
      { term: 'Blocking call', def: 'Synchronous code that does not yield to the loop, freezing all coroutines until it returns — the top async performance bug.' },
    ],
    practice: [
      { q: 'You wrap your calls in async and they are still slow. What is the most likely cause?', a: 'Either you are <code>await</code>-ing them one at a time in a loop (still sequential), or a blocking/synchronous call is sitting inside the event loop and freezing it. Use <code>gather</code>/<code>TaskGroup</code> to overlap, and move blocking work to a thread/process.' },
      { q: 'Why does async give no benefit for a CPU-heavy task like resizing 10,000 images?', a: 'Async only helps when tasks spend time <em>waiting</em> (I/O). CPU-bound work never yields idle time to reuse, and the single thread can only do one computation at a time. Use <code>multiprocessing</code> for CPU-bound parallelism.' },
      { q: 'Your batch of 300 calls instantly returns 429 errors. What is missing and what do you add?', a: 'Concurrency bounding. Add an <code>asyncio.Semaphore</code> (e.g. 10) so only a safe number are in flight at once, ideally combined with retry-with-jitter on 429 inside the bounded worker.' },
      { q: 'What does return_exceptions=True change in asyncio.gather?', a: 'Instead of the first failing coroutine raising and potentially abandoning the others, each failure is returned as an exception object in the results list, so the batch completes and you can inspect which items failed.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'rest-json': {
    levels: {
      beginner: `
        <p>Almost everything you do with an AI model happens over <strong>HTTP</strong> — the same protocol your browser uses to load web pages. You send a <strong>request</strong> and get back a <strong>response</strong>. The data in both directions is usually <strong>JSON</strong>, a simple text format of labelled values.</p>
        <p>A request has four parts worth knowing by name: the <strong>method</strong> (for AI calls, almost always <code>POST</code>, meaning "here is some data, do something with it"), the <strong>URL</strong> (the address of the endpoint), the <strong>headers</strong> (metadata like your API key and the content type), and the <strong>body</strong> (the JSON payload — your model name, messages, and settings).</p>
        <p>Every response carries a <strong>status code</strong>, a three-digit number summarising the outcome: 2xx means success, 4xx means "you made a mistake in the request", and 5xx means "the server had a problem". Learning to read these is the fastest way to debug.</p>`,
      intermediate: `
        <p>JSON has just a few building blocks: objects <code>{ }</code> (labelled key–value pairs), arrays <code>[ ]</code> (ordered lists), strings, numbers, booleans, and null. A model request body is an object; inside it, <code>messages</code> is an array of objects. Getting comfortable reading nested JSON is essential because model responses are deeply nested — the text you want is often several layers down (e.g. <code>response["content"][0]["text"]</code>).</p>
        <p>Know the status codes that actually matter in practice:</p>
        <ul>
          <li><code>200</code> — success.</li>
          <li><code>400</code> — malformed request. Your JSON is missing a field, has a typo, or a value is the wrong type. <em>Retrying will not help</em> until you fix it.</li>
          <li><code>401 / 403</code> — authentication/authorisation. Bad or missing API key, or the key lacks permission.</li>
          <li><code>404</code> — wrong URL or model name.</li>
          <li><code>429</code> — rate limited. Back off and retry.</li>
          <li><code>500 / 503 / 529</code> — server-side/overloaded. Transient; retry with backoff.</li>
        </ul>
        <p>Every response also includes a <strong>usage</strong> object with token counts. You are billed per token, so log this from day one — it is your only real-time cost signal.</p>`,
      expert: `
        <p>Treat the raw HTTP contract as the source of truth and the SDK as a convenience. When something behaves oddly, drop to <code>curl</code> or an async HTTP client and inspect the exact bytes on the wire — a surprising share of "the model ignored my instruction" bugs are actually "I serialised a different payload than I thought" (a stray nesting level, an un-stringified value, wrong content-type). Log full request/response pairs (redacting secrets) behind a debug flag.</p>
        <p>Build a thin client wrapper that classifies failures <em>before</em> business logic sees them: raise immediately on 4xx (your bug — surface a clear message with the response body), and retry 429/5xx with <strong>exponential backoff plus jitter</strong>, honouring the <code>Retry-After</code> header when present. Cap attempts and total time. Distinguish <em>idempotent</em> retries (safe) from side-effecting calls where a naive retry could double-execute; use idempotency keys where the provider supports them.</p>
        <p>Understand the transport nuances: model responses can be streamed as <strong>Server-Sent Events</strong> (a long-lived response delivering incremental <code>data:</code> chunks) rather than one JSON blob, which changes how you parse. Set sensible <strong>connect and read timeouts</strong> separately — long generations need generous read timeouts but short connect timeouts. Reuse a connection pool (a persistent client) rather than opening a socket per call; TLS handshakes per request add real latency at scale.</p>
        <p>Finally, parse defensively: providers add fields over time, <code>stop_reason</code> can be <code>max_tokens</code> (truncated!) or <code>tool_use</code>, and content is a list of typed blocks, not a bare string. Never assume the happy-path shape.</p>`,
    },
    examples: [
      {
        title: 'The same call three ways: curl, raw httpx, SDK',
        lang: 'bash / python',
        code: `# 1) curl — see exactly what goes on the wire
curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $KEY" -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"claude-sonnet-4-6","max_tokens":100,
       "messages":[{"role":"user","content":"Hi"}]}'

# 2) raw httpx — the request as data you control
import httpx
r = httpx.post(URL, headers=HEADERS, json={
    "model": "claude-sonnet-4-6", "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hi"}],
})
print(r.status_code, r.json()["content"][0]["text"])

# 3) SDK — the same thing, ergonomic
from anthropic import Anthropic
msg = Anthropic().messages.create(
    model="claude-sonnet-4-6", max_tokens=100,
    messages=[{"role": "user", "content": "Hi"}])`,
        note: 'Doing it with curl once demystifies the SDK: it is the same request, just wrapped.',
      },
      {
        title: 'A status-aware client wrapper',
        lang: 'python',
        code: `import httpx, time, random

def call(payload, attempts=5):
    for i in range(attempts):
        r = httpx.post(URL, headers=HEADERS, json=payload, timeout=(5, 60))
        if r.status_code == 200:
            return r.json()
        if 400 <= r.status_code < 500 and r.status_code != 429:
            raise RuntimeError(f"Your request is wrong: {r.status_code} {r.text}")
        # 429 or 5xx -> transient, back off with jitter
        wait = min(2 ** i + random.random(), 30)
        time.sleep(float(r.headers.get("retry-after", wait)))
    raise RuntimeError("exhausted retries")`,
        note: 'The key idea: fail fast on <em>your</em> mistakes (4xx), retry patiently on <em>their</em> problems (429/5xx).',
      },
    ],
    glossary: [
      { term: 'HTTP method', def: 'The verb of a request. <code>POST</code> (send data to process) dominates LLM calls; <code>GET</code> (fetch) is rare for generation.' },
      { term: 'Header', def: 'Key–value metadata attached to a request/response — e.g. the API key, content-type, and rate-limit info.' },
      { term: 'Body / payload', def: 'The JSON data sent with the request (model, messages, parameters) or returned in the response.' },
      { term: 'Status code', def: 'A 3-digit result summary: 2xx success, 4xx client error (your fault), 5xx server error (their fault).' },
      { term: 'Rate limit (429)', def: 'The provider telling you to slow down; the correct response is exponential backoff, not immediate retry.' },
      { term: 'usage', def: 'The response field reporting input/output token counts — your billing and context-budget signal.' },
      { term: 'Idempotency', def: 'A property where repeating a request has the same effect as doing it once — important when deciding whether a retry is safe.' },
    ],
    practice: [
      { q: 'You get a 400 on every call. Do you add retries?', a: 'No. 400 means the request itself is malformed — retrying repeats the same failure. Inspect the response body, fix the payload (missing/mis-typed field, wrong model name), then call again.' },
      { q: 'What is the practical difference between 429 and 500?', a: '429 = you are sending too fast; back off and retry. 500 (and 503/529) = the provider had a transient failure; also retry with backoff. Both are safe to retry, unlike 400.' },
      { q: 'Why log the usage field on every response?', a: 'You are billed by tokens, and usage is your only real-time visibility into cost. Skipping it means you find out the cost from the invoice, not from your dashboards.' },
      { q: 'Why call the raw endpoint with curl at least once?', a: 'So the SDK stops feeling like magic. Seeing the exact headers, JSON body, and response shape is what lets you debug serialization and schema issues later.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'git': {
    levels: {
      beginner: `
        <p><strong>Git</strong> records the history of your project as a series of snapshots called <strong>commits</strong>. Think of it like the version history in Google Docs, but you decide exactly when a snapshot is taken and you attach a short note describing the change. If anything breaks, you can look back — or jump back — to any earlier commit.</p>
        <p>The daily rhythm is small: you <strong>edit</strong> files, <strong>stage</strong> the changes you want to save (<code>git add</code>), take a snapshot (<code>git commit -m "note"</code>), and later <strong>push</strong> them to a shared server like GitHub so teammates can see them.</p>
        <p>A <strong>branch</strong> is a parallel line of work — a safe sandbox where you can try changes without touching the main version. When the work is good, you open a <strong>pull request</strong> (PR) asking teammates to review and merge it into the main branch.</p>`,
      intermediate: `
        <p>Git tracks changes in three areas: your <strong>working directory</strong> (files as they are now), the <strong>staging area/index</strong> (changes marked for the next commit), and the <strong>repository</strong> (committed history). <code>git status</code> shows where everything sits; <code>git diff</code> shows unstaged changes and <code>git diff --staged</code> shows what a commit will contain. Making this loop second-nature prevents most beginner mistakes.</p>
        <p>Good commit hygiene pays off enormously: make <strong>small, focused commits</strong> with clear messages, each representing one logical change. This is what makes <code>git log</code> readable and <code>git revert</code> (undo one commit) and <code>git bisect</code> (binary-search history for the commit that introduced a problem) actually useful.</p>
        <p>For AI work specifically, treat <strong>prompts, eval datasets, and config as versioned artifacts</strong>. Commit a prompt change separately from code changes, and record the eval score in the message (e.g. "prompt v4 — faithfulness 0.86, was 0.81"). Because a prompt change can silently degrade quality with no error, this history is often your only record of exactly where quality moved.</p>`,
      expert: `
        <p>Understand that a commit is a snapshot identified by a hash, pointing to its parent(s); a branch is just a movable pointer to a commit. This model explains everything else. <strong>Rebase</strong> replays your commits onto a new base for a linear history; <strong>merge</strong> preserves the branch topology with a merge commit — teams pick a convention and stick to it. Interactive rebase lets you clean up local history (squash, reword) <em>before</em> sharing, but never rewrite history that others have already pulled.</p>
        <p>Adopt a real workflow: short-lived feature branches, PRs with review, and CI that runs your test <em>and eval</em> suite on every PR so a quality regression blocks the merge (this is the Phase-5 idea of regression-testing prompts, enforced through Git). Protect the main branch. Tag releases and known-good model/prompt versions (<code>git tag v1-eval-0.86</code>) so rollback is one command.</p>
        <p>Secrets discipline is non-negotiable: <code>.gitignore</code> <code>.env</code> and credentials from the first commit, because a leaked model key is scraped and abused within minutes, and rewriting history to purge it (<code>git filter-repo</code>) is painful and incomplete once pushed. Add a pre-commit hook or a secret-scanner to catch accidental commits. Likewise ignore large binary artifacts — vector index dumps, model weights, datasets — and use Git LFS or external storage/DVC for data you must version, since Git bloats badly with large binaries.</p>`,
    },
    examples: [
      {
        title: 'The everyday loop',
        lang: 'bash',
        code: `git switch -c tune-system-prompt   # new branch to work safely
# ...edit prompt.txt...
git status                          # see what changed
git add prompt.txt                  # stage just this change
git commit -m "Tighten system prompt; eval faithfulness 0.81 -> 0.86"
git push -u origin tune-system-prompt
# then open a Pull Request on GitHub for review`,
        note: 'Each commit is one logical change with the eval score attached — future-you can trace exactly where quality moved.',
      },
      {
        title: 'A minimal .gitignore for an AI project',
        lang: 'gitignore',
        code: `# secrets — never commit these
.env
*.key

# large / generated artifacts — version elsewhere (LFS/DVC)
*.faiss
data/*.parquet
models/

# python noise
__pycache__/
.venv/`,
        note: 'Keeping secrets and big binaries out of history from commit #1 saves you from painful cleanups later.',
      },
    ],
    glossary: [
      { term: 'Commit', def: 'A saved snapshot of your project at a point in time, with a message and a unique hash.' },
      { term: 'Branch', def: 'A movable pointer to a commit — a parallel line of work you can develop and later merge.' },
      { term: 'Staging area (index)', def: 'The set of changes marked to go into your next commit; lets you commit some edits while leaving others out.' },
      { term: 'Pull request (PR)', def: 'A request to review and merge one branch into another — the collaboration and code-review checkpoint.' },
      { term: 'Merge vs rebase', def: 'Two ways to combine branches: merge keeps history topology with a merge commit; rebase replays commits for a linear history.' },
      { term: 'git bisect', def: 'A binary search through commit history to find exactly which commit introduced a bug or quality regression.' },
      { term: '.gitignore', def: 'A file listing paths Git should never track — used to keep secrets and large artifacts out of history.' },
    ],
    practice: [
      { q: 'Why does pairing eval scores with commits matter more in AI engineering than in ordinary code?', a: 'A prompt/model change can degrade output quality without ever throwing an error. The commit history + recorded scores is often the only trace of where quality dropped, which makes regressions findable (e.g. via bisect).' },
      { q: 'You accidentally committed and pushed an API key. What now?', a: 'Rotate/revoke the key immediately (assume it is compromised), remove it from the code, and purge it from history (git filter-repo) — but treat the key as already leaked. Prevention (.gitignore + secret scanning) is the real fix.' },
      { q: 'Why prefer many small commits over one big weekly commit?', a: 'Small, focused commits make history readable, reviews manageable, reverts surgical, and bisect precise — so you can pinpoint which specific change hurt eval scores.' },
      { q: 'When should you NOT rewrite Git history?', a: 'After it has been shared/pushed and others may have pulled it. Rewriting shared history (force-push, rebase of public branches) breaks everyone else\'s copies.' },
    ],
  },

  /* ------------------------------------------------------------------ */
  'math-basics': {
    levels: {
      beginner: `
        <p>You do not need a maths degree to build AI applications. You need three ideas, and each is really just a picture. Get these and most of the field stops feeling mysterious.</p>
        <p><strong>1. A vector is a list of numbers that marks a location.</strong> Just as latitude and longitude pin a place on Earth, a vector of numbers pins the <em>meaning</em> of a word or sentence in an imaginary space. Words with similar meanings get nearby locations.</p>
        <p><strong>2. Similarity is closeness.</strong> To ask "how related are these two texts?", we measure how close their locations are. The most common measure, <strong>cosine similarity</strong>, looks at the <em>angle</em> between two vectors: pointing the same way (angle 0) scores 1.0 = very similar; at right angles scores 0 = unrelated.</p>
        <p><strong>3. Softmax turns scores into probabilities.</strong> When a model picks the next word, it produces a score for every option and softmax squashes those scores into percentages that add up to 100%. A dial called <strong>temperature</strong> makes the percentages sharper (predictable) or flatter (varied).</p>`,
      intermediate: `
        <p><strong>Cosine similarity</strong> is the operation at the heart of retrieval. Its formula, <code>cos(θ) = (A·B) / (‖A‖·‖B‖)</code>, has two pieces: the <strong>dot product</strong> <code>A·B</code> (multiply the vectors element-wise and sum) measures alignment, and dividing by the two <strong>magnitudes</strong> (lengths) removes the effect of size, leaving pure direction. That is why two texts of very different lengths can still score as highly similar — cosine only cares about direction, i.e. meaning.</p>
        <p>Related measures: <strong>Euclidean (L2) distance</strong> is straight-line distance; for <em>normalised</em> vectors (length 1) it ranks results identically to cosine, which is why vector databases often normalise and then use whichever is faster. <strong>Dot product</strong> alone is used when magnitude carries meaning.</p>
        <p><strong>Softmax and temperature:</strong> softmax exponentiates each score then divides by the total, so bigger scores dominate. Temperature <em>T</em> divides the scores before exponentiating: small <em>T</em> (→0) exaggerates differences (the top token wins → near-deterministic), large <em>T</em> flattens them (more randomness). This single mechanism is what the <code>temperature</code> parameter controls.</p>`,
      expert: `
        <p>Some numerical realities matter in production. Softmax is implemented with the <strong>max-subtraction trick</strong> (subtract the largest logit before exponentiating) to avoid floating-point overflow; without it, large logits produce <code>inf</code>. This is why you compute in log-space where possible. Note also that <code>temperature=0</code> is <em>not</em> guaranteed bit-identical across runs on most providers: batching, GPU non-associativity of floating-point addition, and kernel scheduling introduce tiny nondeterminism, so "deterministic" means "greedy argmax", not "reproducible to the bit".</p>
        <p>For retrieval, treat cosine scores as a <strong>ranking signal, not an absolute truth</strong>. A cosine of 0.85 means very different things for different embedding models and domains; calibrate a threshold per model per corpus rather than copying a magic number. The <strong>curse of dimensionality</strong> also bites: in very high dimensions distances concentrate (everything looks roughly equidistant), which is why approximate-nearest-neighbour indexes (HNSW, IVF) and dimensionality choices are engineering trade-offs, not free upgrades — a 3072-dim embedding is not automatically better than 1024-dim for your task, just costlier per comparison.</p>
        <p>When debugging bad retrieval, compute the cosine between your query embedding and a chunk you <em>expected</em> to match, by hand. If it is low, the embedding model itself is failing to represent your domain — no amount of retrieval-code tuning will fix that; you need a better or domain-tuned embedder. This one diagnostic separates "my index is misconfigured" from "my embeddings are wrong", which are completely different fixes.</p>`,
    },
    examples: [
      {
        title: 'Cosine similarity from scratch',
        lang: 'python',
        code: `import numpy as np

def cosine(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

king  = [0.9, 0.8, 0.1]
queen = [0.85, 0.82, 0.12]
car   = [0.1, 0.05, 0.95]

cosine(king, queen)  # ~0.999  -> nearly same direction = similar meaning
cosine(king, car)    # ~0.29   -> different direction  = unrelated`,
        note: 'Notice it measures direction only: scale one vector up 10x and the score is unchanged.',
      },
      {
        title: 'Temperature reshaping a distribution',
        lang: 'python',
        code: `import numpy as np

def softmax(logits, T=1.0):
    x = np.array(logits) / T
    x = x - x.max()          # numerical-stability trick
    e = np.exp(x)
    return e / e.sum()

logits = [3.5, 3.2, 2.8, 1.0]
softmax(logits, T=0.3)   # ~[0.62, 0.28, 0.09, 0.00]  peaky / predictable
softmax(logits, T=1.5)   # ~[0.33, 0.29, 0.24, 0.14]  flat / varied`,
        note: 'Lower temperature exaggerates the leader; higher temperature spreads the odds — exactly what you feel when tuning creativity.',
      },
    ],
    glossary: [
      { term: 'Vector', def: 'An ordered list of numbers representing a point (or direction) in space — here, the meaning of a piece of text.' },
      { term: 'Dot product', def: 'Element-wise multiply two vectors and sum; measures how much they point the same way.' },
      { term: 'Magnitude (norm)', def: 'The length of a vector. Dividing by it isolates direction, which is what meaning-similarity cares about.' },
      { term: 'Cosine similarity', def: 'The cosine of the angle between two vectors (1 = same direction, 0 = unrelated); the core retrieval relevance score.' },
      { term: 'Euclidean (L2) distance', def: 'Straight-line distance between two points; ranks identically to cosine for length-normalised vectors.' },
      { term: 'Softmax', def: 'Turns a list of scores (logits) into probabilities that sum to 1 by exponentiating and normalising.' },
      { term: 'Temperature', def: 'A divisor applied to logits before softmax: low = sharper/more deterministic, high = flatter/more random.' },
    ],
    practice: [
      { q: 'Two vectors point the same way but one is twice as long. Their cosine similarity?', a: '1.0 — cosine ignores magnitude entirely and only measures the angle. This is exactly why it is used for meaning: two texts of very different lengths can still be judged identical in meaning.' },
      { q: 'Does temperature=0 guarantee identical output every time?', a: 'No. It gives greedy (argmax) decoding, but floating-point non-associativity on GPUs and batching introduce tiny nondeterminism on most providers. "Deterministic" here means greedy, not bit-reproducible.' },
      { q: 'Retrieval returns the wrong chunk. How do you tell if it is the embeddings or the retrieval code?', a: 'Manually compute cosine between the query embedding and the chunk you expected. If it is low, the embedding model is failing to represent your domain (fix: better/domain-tuned embedder). If it is high but not returned, the retrieval/index config is at fault.' },
      { q: 'Is a 3072-dimension embedding always better than 1024?', a: 'No — it is a cost/precision trade-off, not a strict upgrade. More dimensions cost more storage and compute per comparison, and a smaller domain-tuned model can beat a larger general one on your data.' },
    ],
  },
}
