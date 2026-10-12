// Additional Python prerequisites.  The generated content.js file is intentionally
// left untouched; curriculum.js merges these lessons into Module 00 at runtime.

const PYTHON_PATH = [
  {
    id: 'python-fundamentals',
    title: 'Python fundamentals',
    tag: 'Syntax, values, control flow & functions',
    definition: 'The core Python vocabulary used in every AI project: values, variables, conditions, loops, functions, imports, and readable program structure.',
    beginner: `
      <p>Python is the main working language of AI engineering because it is readable and has a huge ecosystem. Start with five building blocks: <strong>values</strong> such as text and numbers, <strong>variables</strong> that name those values, <strong>conditions</strong> that choose a path, <strong>loops</strong> that repeat work, and <strong>functions</strong> that package reusable behaviour.</p>
      <p>Python uses indentation to group code. Four spaces under an <code>if</code>, loop, or function means “this code belongs inside it.” The fastest way to learn is to write tiny programs and inspect values with <code>print()</code> or a debugger.</p>
      <p>For AI work, focus on expressing data transformations clearly. A good function accepts explicit inputs, returns a useful result, and avoids hidden global state.</p>`,
    intermediate: `
      <p>Move beyond syntax by learning Python’s execution model. Names point to objects; assigning a list to a second variable does not copy it. Understand mutable values (lists, dictionaries, sets) versus immutable values (numbers, strings, tuples), truthiness, scope, and the difference between <code>==</code> and <code>is</code>.</p>
      <p>Design functions with small responsibilities, keyword arguments, sensible defaults, and explicit return values. Use unpacking, f-strings, <code>enumerate</code>, <code>zip</code>, and comprehensions when they improve clarity. Organise related functions into modules and import them instead of growing one giant script.</p>
      <p>Read tracebacks from the bottom upward: the final line names the exception, while the frames above show the path your program took. This skill matters more than memorising every built-in.</p>`,
    expert: `
      <p>Production Python depends on predictable interfaces and an accurate mental model of object identity. Avoid mutable default arguments, make side effects obvious, prefer dependency injection over hidden globals, and use pure functions for transformations that must be easy to test.</p>
      <p>Know when Python’s convenience has a runtime cost. Repeated string concatenation, unnecessary copies of large collections, and Python-level loops over numeric data can dominate an AI pipeline. Measure before optimising, then use iterators, vectorised libraries, or compiled operations where the profile points.</p>
      <p>Treat readability as an engineering control: format automatically, lint consistently, document public functions, and choose boring, explicit code around prompts, model parameters, and data boundaries. Those values are part of the system’s behaviour and must be reviewable.</p>`,
    patterns: [
      { name: 'Values & types', desc: 'Strings, integers, floats, booleans, and None are the atomic values you combine.', example: 'model = "small"; temperature = 0.2; enabled = True' },
      { name: 'Control flow', desc: 'Conditions and loops select or repeat operations.', example: 'if score >= threshold: accept(result)' },
      { name: 'Functions', desc: 'Named transformations with explicit inputs and outputs.', example: 'def normalize(text: str) -> str: return text.strip().lower()' },
      { name: 'Modules', desc: 'Python files that group and expose related code.', example: 'from retrieval import search' },
    ],
    examples: [
      {
        title: 'A small, testable text pipeline', lang: 'python',
        code: `def clean_text(text: str) -> str:
    """Normalize text before indexing it."""
    return " ".join(text.strip().lower().split())

def keep_long_enough(text: str, minimum: int = 20) -> bool:
    return len(clean_text(text)) >= minimum

documents = ["  Hello   world  ", "A useful document with enough detail"]
clean = [clean_text(doc) for doc in documents if keep_long_enough(doc)]`,
        note: 'Each function has one job, accepts all required data, and can be tested without a model or network call.',
      },
      {
        title: 'Avoid the mutable-default trap', lang: 'python',
        code: `# Wrong: every call shares the same list
def add_message(message, history=[]):
    history.append(message)
    return history

# Correct: create a fresh list per call
def add_message(message, history=None):
    history = [] if history is None else list(history)
    history.append(message)
    return history`,
        note: 'Default arguments are evaluated once when the function is defined, not once per call.',
      },
    ],
    glossary: [
      { term: 'Object', def: 'A runtime value with a type and identity; Python variables are names that refer to objects.' },
      { term: 'Mutable', def: 'An object that can change in place, such as a list or dictionary.' },
      { term: 'Scope', def: 'The region where a name is visible, such as local function scope or module scope.' },
      { term: 'Traceback', def: 'The call stack printed when an exception occurs, showing where and how execution failed.' },
    ],
    pitfalls: [
      'Writing one long notebook cell or script with hidden global state instead of small functions.',
      'Using <code>is</code> to compare values; use <code>==</code> except for identity checks such as <code>x is None</code>.',
      'Using mutable values such as <code>[]</code> as function defaults, which shares state across calls.',
    ],
    apply: [
      'Write a small parser that accepts raw text and returns a clean dictionary.',
      'Move reusable prompt-building and response-parsing functions into modules.',
      'Run a formatter and linter automatically so style does not depend on memory.',
    ],
    checks: [
      { q: 'Why can changing b also change a after writing b = a for a list?', a: 'Both names refer to the same mutable list object. Use an intentional copy when independent state is required.' },
      { q: 'What makes a function easy to test?', a: 'Explicit inputs, a deterministic return value, a small responsibility, and few or no hidden side effects.' },
      { q: 'Where should you start when reading a traceback?', a: 'At the final line for the exception type and message, then move upward through the frames to find the first relevant line in your code.' },
    ],
    resources: [
      { label: 'Python tutorial — official documentation', url: 'https://docs.python.org/3/tutorial/' },
      { label: 'Python data model', url: 'https://docs.python.org/3/reference/datamodel.html' },
    ],
  },
  {
    id: 'python-collections',
    title: 'Collections, iterators & generators',
    tag: 'Working fluently with real data',
    definition: 'Python’s tools for organising and transforming many values: lists, tuples, dictionaries, sets, comprehensions, iterators, and memory-efficient generators.',
    beginner: `
      <p>AI applications constantly move collections of messages, documents, chunks, scores, and tool results. A <strong>list</strong> keeps ordered items, a <strong>dictionary</strong> maps keys to values, a <strong>set</strong> keeps unique items, and a <strong>tuple</strong> is a small fixed record.</p>
      <p>Learn to add, remove, look up, slice, sort, and loop over each collection. Comprehensions provide a compact way to transform or filter values, but a normal loop is better when the logic needs several steps.</p>`,
    intermediate: `
      <p>An <strong>iterable</strong> can produce values one at a time; an <strong>iterator</strong> tracks the current position. This protocol powers <code>for</code> loops and lets pipelines process data without first loading every item into memory.</p>
      <p>A function containing <code>yield</code> creates a <strong>generator</strong>. Generators are ideal for document ingestion and batched model calls because they stream items lazily. Combine them with <code>itertools</code>, stable sorting, dictionary grouping, and explicit schemas for clean transformation pipelines.</p>`,
    expert: `
      <p>Choose a collection by its guarantees and complexity: dictionaries and sets offer average O(1) lookup, lists offer O(1) append but O(n) membership, and deques provide efficient operations at both ends. At scale, the wrong choice becomes a latency problem.</p>
      <p>Build streaming pipelines that bound memory, but remember that generators are single-pass and can hide failures until iteration. Make ownership clear, avoid mutating a collection while iterating over it, and materialise at deliberate boundaries when replay or random access is required.</p>`,
    patterns: [
      { name: 'List', desc: 'Ordered, mutable sequence used for messages, chunks, and results.', example: 'messages.append({"role": "user", "content": text})' },
      { name: 'Dictionary', desc: 'Key-value mapping used for JSON-like records and indexes.', example: 'by_id[document["id"]] = document' },
      { name: 'Set', desc: 'Unique values with fast membership tests.', example: 'seen_ids = {doc["id"] for doc in docs}' },
      { name: 'Generator', desc: 'Lazy sequence that yields one value at a time.', example: 'def batches(items): yield items[i:i+32]' },
    ],
    examples: [
      {
        title: 'Filter, rank, and select retrieval results', lang: 'python',
        code: `results = [
    {"id": "a", "score": 0.91},
    {"id": "b", "score": 0.42},
    {"id": "c", "score": 0.78},
]

top = sorted(
    (row for row in results if row["score"] >= 0.70),
    key=lambda row: row["score"],
    reverse=True,
)[:5]`,
        note: 'The generator filters lazily; <code>sorted</code> materialises only at the boundary that needs ordering.',
      },
      {
        title: 'Stream fixed-size batches', lang: 'python',
        code: `from itertools import islice

def batched(iterable, size):
    iterator = iter(iterable)
    while batch := list(islice(iterator, size)):
        yield batch

for batch in batched(load_documents(), 64):
    index_documents(batch)`,
        note: 'Only one batch is held in memory, even if the source contains millions of documents.',
      },
    ],
    glossary: [
      { term: 'Iterable', def: 'An object that can return an iterator, so it can be used in a <code>for</code> loop.' },
      { term: 'Iterator', def: 'A stateful object that returns the next item until it raises <code>StopIteration</code>.' },
      { term: 'Generator', def: 'A compact iterator produced by a function with <code>yield</code> or a generator expression.' },
      { term: 'Comprehension', def: 'Syntax for constructing a list, set, or dictionary by transforming and optionally filtering an iterable.' },
    ],
    pitfalls: [
      'Using a list for repeated membership checks when a set would make the intent and performance clearer.',
      'Iterating over a generator twice and expecting the values to reappear; generators are normally single-use.',
      'Writing dense nested comprehensions that save lines but hide the transformation.',
    ],
    apply: [
      'Represent model messages as a list of dictionaries with a consistent schema.',
      'Use a generator to stream documents through cleaning, chunking, and embedding.',
      'Choose sets for deduplication and dictionaries for fast lookup by ID.',
    ],
    checks: [
      { q: 'When is a set preferable to a list?', a: 'When uniqueness or repeated membership checks matter more than ordering or duplicate values.' },
      { q: 'Why use a generator for an ingestion pipeline?', a: 'It yields one item or batch at a time, bounding memory instead of loading the entire corpus.' },
      { q: 'What is the main danger of a generator?', a: 'It is lazy and usually single-pass, so work and errors occur during iteration and exhausted values cannot be replayed without recreating it.' },
    ],
    resources: [
      { label: 'Python data structures', url: 'https://docs.python.org/3/tutorial/datastructures.html' },
      { label: 'itertools — iterator building blocks', url: 'https://docs.python.org/3/library/itertools.html' },
    ],
  },
  {
    id: 'python-architecture',
    title: 'Types, classes & project structure',
    tag: 'Maintainable Python applications',
    definition: 'The design tools that turn scripts into maintainable systems: type hints, dataclasses, protocols, classes, modules, packages, and dependency boundaries.',
    beginner: `
      <p>As a project grows, split it into modules with clear responsibilities: one for configuration, one for model clients, one for retrieval, and one for application logic. Imports connect these files into a package.</p>
      <p>A <strong>class</strong> groups data with behaviour. Use one when several operations share state, such as a model client with a base URL and API key. Use a <strong>dataclass</strong> when you mainly need a named record. Type hints document what values a function expects and let tools catch mistakes before runtime.</p>`,
    intermediate: `
      <p>Prefer composition over deep inheritance. Define small interfaces with <code>Protocol</code> so business logic can accept any retriever or model client with the required methods. This makes provider swaps and test doubles straightforward.</p>
      <p>Use <code>dataclass</code>, <code>TypedDict</code>, or a validation library according to the boundary: dataclasses for internal records, TypedDict for dictionary-shaped values, and runtime validation for untrusted API input. Keep imports flowing in one direction to avoid circular dependencies.</p>`,
    expert: `
      <p>Treat architectural boundaries as test seams. High-level orchestration should depend on interfaces, not concrete SDKs. Inject clocks, clients, and stores so tests can control time and failures. Keep domain models independent of web frameworks and vendor response objects.</p>
      <p>Use static analysis in CI, publish intentional package APIs, and version data contracts. Avoid “manager” classes that collect unrelated responsibilities. A small set of cohesive modules with explicit dependencies scales better than either one giant file or an elaborate hierarchy.</p>`,
    patterns: [
      { name: 'Type hints', desc: 'Machine-checkable documentation for function and data contracts.', example: 'def embed(texts: list[str]) -> list[list[float]]: ...' },
      { name: 'Dataclass', desc: 'A concise typed record for internal domain data.', example: '@dataclass(frozen=True) class Chunk: text: str; source: str' },
      { name: 'Protocol', desc: 'A structural interface satisfied by any object with matching methods.', example: 'class Retriever(Protocol): def search(self, query: str) -> list[Chunk]: ...' },
      { name: 'Package', desc: 'A directory of importable modules with a deliberate public API.', example: 'app/retrieval/, app/models/, app/evals/' },
    ],
    examples: [
      {
        title: 'Depend on a protocol, not one vendor', lang: 'python',
        code: `from dataclasses import dataclass
from typing import Protocol

@dataclass(frozen=True)
class Chunk:
    text: str
    source: str

class Retriever(Protocol):
    def search(self, query: str, limit: int = 5) -> list[Chunk]: ...

def answer(question: str, retriever: Retriever) -> str:
    context = retriever.search(question)
    return "\n".join(chunk.text for chunk in context)`,
        note: 'The orchestration works with a real vector store or a tiny fake used by tests.',
      },
      {
        title: 'Validate at the boundary, simplify inside', lang: 'python',
        code: `from dataclasses import dataclass

@dataclass(frozen=True)
class GenerationRequest:
    prompt: str
    max_tokens: int

def parse_request(raw: dict) -> GenerationRequest:
    prompt = str(raw["prompt"]).strip()
    limit = int(raw.get("max_tokens", 500))
    if not prompt or not 1 <= limit <= 4000:
        raise ValueError("invalid generation request")
    return GenerationRequest(prompt, limit)`,
        note: 'Once untrusted data is checked, internal code can rely on a small, typed object.',
      },
    ],
    glossary: [
      { term: 'Type hint', def: 'An annotation describing expected value types; checked by tools but not normally enforced by Python itself.' },
      { term: 'Dataclass', def: 'A class decorator that generates record-like methods such as the constructor and representation.' },
      { term: 'Protocol', def: 'A structural interface: objects satisfy it by having the required methods, without explicit inheritance.' },
      { term: 'Dependency injection', def: 'Passing a dependency into code instead of constructing or finding it globally.' },
    ],
    pitfalls: [
      'Creating classes for every function even when no shared state or interface exists.',
      'Letting vendor SDK response objects leak through the whole application.',
      'Adding type hints but never running a type checker, so annotations silently drift from reality.',
    ],
    apply: [
      'Split configuration, provider clients, domain models, and orchestration into separate modules.',
      'Represent stable internal records with frozen dataclasses.',
      'Use protocols around model, retrieval, and storage clients to make tests and provider changes easier.',
    ],
    checks: [
      { q: 'When should you use a dataclass instead of a dictionary?', a: 'When the record has a stable internal schema and benefits from named fields, type checking, and clear construction.' },
      { q: 'Why depend on a Protocol?', a: 'It decouples orchestration from one implementation, allowing multiple providers and lightweight test doubles.' },
      { q: 'Where should runtime validation happen?', a: 'At untrusted boundaries such as HTTP input, files, tool output, and provider responses; internal code can then use trusted typed models.' },
    ],
    resources: [
      { label: 'typing — official documentation', url: 'https://docs.python.org/3/library/typing.html' },
      { label: 'dataclasses — official documentation', url: 'https://docs.python.org/3/library/dataclasses.html' },
    ],
  },
  {
    id: 'python-reliability',
    title: 'Files, errors, testing & tooling',
    tag: 'Reliable Python beyond the happy path',
    definition: 'The practices that make Python dependable: environments and dependencies, safe file handling, precise exceptions, logging, automated tests, and repeatable command-line workflows.',
    beginner: `
      <p>Real programs fail: files are missing, JSON is malformed, networks time out, and APIs return unexpected data. Use <code>try</code>/<code>except</code> around the narrow operation that can fail, catch specific exception types, and either recover or raise a clearer error.</p>
      <p>Use <code>with</code> when opening files so they close even after an error. Keep secrets in environment variables, dependencies in a project-specific virtual environment, and tests alongside the code they protect.</p>`,
    intermediate: `
      <p>Separate expected operational failures from programmer bugs. Define a small exception hierarchy for cases callers can handle, preserve the original cause with <code>raise ... from ...</code>, and never swallow an exception without recording enough context.</p>
      <p>Write unit tests for deterministic transformations and integration tests for boundaries. Mock your own interfaces rather than deep SDK internals. Use structured logging with request IDs and safe metadata; do not log secrets, full sensitive prompts, or raw personal data.</p>`,
    expert: `
      <p>Reliability comes from explicit policies: timeout every external call, retry only transient and idempotent operations, cap attempts, and test failure paths. Use temporary directories and dependency injection to keep tests isolated. Freeze dependencies and make setup reproducible in CI.</p>
      <p>Test behaviour rather than implementation. Add property-based tests for parsers and chunkers, contract tests for providers, and regression fixtures for model-facing transformations. Logs, metrics, and traces should share correlation IDs so one user request can be reconstructed without exposing its secrets.</p>`,
    patterns: [
      { name: 'Context manager', desc: 'Guarantees acquisition and cleanup around a resource.', example: 'with path.open(encoding="utf-8") as handle: ...' },
      { name: 'Specific exception', desc: 'Communicates a failure callers can identify and handle.', example: 'except json.JSONDecodeError as exc: ...' },
      { name: 'Unit test', desc: 'Checks one deterministic behaviour in isolation.', example: 'assert chunk("abcdef", 3) == ["abc", "def"]' },
      { name: 'Structured log', desc: 'Records searchable fields rather than one ambiguous sentence.', example: 'logger.info("model_call", extra={"latency_ms": 420})' },
    ],
    examples: [
      {
        title: 'Turn a low-level error into a useful boundary error', lang: 'python',
        code: `import json
from pathlib import Path

class ConfigError(RuntimeError):
    pass

def load_config(path: Path) -> dict:
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError as exc:
        raise ConfigError(f"config not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ConfigError(f"invalid JSON in {path}: line {exc.lineno}") from exc`,
        note: 'The caller sees an actionable domain error while the original exception remains available for debugging.',
      },
      {
        title: 'Test success and failure', lang: 'python',
        code: `import pytest

def test_load_config_reads_json(tmp_path):
    path = tmp_path / "config.json"
    path.write_text('{"model": "small"}', encoding="utf-8")
    assert load_config(path)["model"] == "small"

def test_load_config_rejects_invalid_json(tmp_path):
    path = tmp_path / "config.json"
    path.write_text("not-json", encoding="utf-8")
    with pytest.raises(ConfigError, match="invalid JSON"):
        load_config(path)`,
        note: 'A failure-path test verifies the contract users depend on, not only the happy path.',
      },
    ],
    glossary: [
      { term: 'Virtual environment', def: 'An isolated Python installation for one project’s dependencies.' },
      { term: 'Exception chaining', def: 'Raising a higher-level exception with <code>from</code> while retaining the original cause.' },
      { term: 'Fixture', def: 'Reusable test setup that supplies controlled data or dependencies.' },
      { term: 'Idempotent', def: 'Safe to repeat without creating an additional side effect, an important property for retries.' },
    ],
    pitfalls: [
      'Catching bare <code>Exception</code> and continuing, which hides bugs and corrupts later results.',
      'Committing <code>.env</code> files, API keys, model outputs containing PII, or local virtual environments.',
      'Mocking so much implementation detail that tests pass while the real integration is broken.',
    ],
    apply: [
      'Create a virtual environment and lock project dependencies.',
      'Add tests for parsing, chunking, prompt assembly, and malformed provider responses.',
      'Log safe identifiers, duration, model, token counts, and error class for each external call.',
    ],
    checks: [
      { q: 'Why catch specific exceptions?', a: 'It prevents unrelated programmer bugs from being mistaken for expected operational failures and lets recovery logic match the actual cause.' },
      { q: 'What should a retry policy include?', a: 'A transient-error allowlist, idempotency awareness, timeout, capped attempts, exponential backoff, jitter, and observability.' },
      { q: 'What is the best boundary to mock?', a: 'Your own small interface around the dependency, not many private methods inside a third-party SDK.' },
    ],
    resources: [
      { label: 'Errors and exceptions — Python tutorial', url: 'https://docs.python.org/3/tutorial/errors.html' },
      { label: 'pytest documentation', url: 'https://docs.pytest.org/' },
    ],
  },
  {
    id: 'python-data-stack',
    title: 'NumPy, pandas & data pipelines',
    tag: 'Preparing data for AI systems',
    definition: 'The practical Python data stack for efficient numeric arrays, tabular cleaning, vector operations, and reproducible data preparation pipelines.',
    beginner: `
      <p><strong>NumPy</strong> stores numbers in compact arrays and performs operations over whole arrays at once. <strong>pandas</strong> adds labelled tables called DataFrames, with columns, filtering, grouping, missing-value handling, and file import/export.</p>
      <p>Use them when preparing eval datasets, inspecting logs, analysing token costs, or transforming embedding vectors. Keep the raw input unchanged and write each cleaning step explicitly so the result can be reproduced.</p>`,
    intermediate: `
      <p>Learn array shape, axis, dtype, broadcasting, boolean masks, and vectorised operations in NumPy. In pandas, understand indexes, joins, group-by operations, null semantics, and the difference between selecting a view and making a copy.</p>
      <p>For larger datasets, read and write columnar formats such as Parquet, select only required columns, process in chunks, and validate assumptions such as uniqueness and allowed nulls after every important transformation.</p>`,
    expert: `
      <p>Optimise data work by reducing copies, choosing compact dtypes, and moving work into vectorised kernels—but profile first. A Python loop over millions of rows is usually slower than a vectorised expression; a clever vectorised expression that creates five full temporary arrays may still exhaust memory.</p>
      <p>Treat a dataset as a versioned product. Record source, schema, transformation code, row counts, quality checks, and lineage. Prevent train/eval leakage, deduplicate before splitting, and use deterministic seeds and content hashes so an experiment can be reconstructed later.</p>`,
    patterns: [
      { name: 'ndarray', desc: 'A dense typed n-dimensional array supporting vectorised numeric work.', example: 'similarities = embeddings @ query' },
      { name: 'DataFrame', desc: 'A labelled table for filtering, joining, grouping, and validating records.', example: 'df.groupby("model")["cost"].sum()' },
      { name: 'Boolean mask', desc: 'An array of true/false values used to select matching rows.', example: 'clean = df[df["text"].str.len() > 20]' },
      { name: 'Data lineage', desc: 'The recorded path from raw source through transformations to an output dataset.', example: 'raw-v3 → dedupe-v2 → eval-split-seed-42' },
    ],
    examples: [
      {
        title: 'Vectorised cosine similarity', lang: 'python',
        code: `import numpy as np

docs = np.asarray(document_embeddings, dtype=np.float32)
query = np.asarray(query_embedding, dtype=np.float32)

docs /= np.linalg.norm(docs, axis=1, keepdims=True).clip(min=1e-12)
query /= max(np.linalg.norm(query), 1e-12)
scores = docs @ query
top_ids = np.argsort(scores)[-5:][::-1]`,
        note: 'The matrix operation evaluates every document in compiled numeric code instead of a slow Python loop.',
      },
      {
        title: 'Build a clean evaluation slice', lang: 'python',
        code: `import pandas as pd

df = pd.read_parquet("runs.parquet", columns=["id", "model", "score", "tokens"])
clean = (
    df.dropna(subset=["id", "model", "score"])
      .drop_duplicates(subset=["id", "model"], keep="last")
      .assign(cost_band=lambda x: pd.cut(x["tokens"], [0, 500, 2000, float("inf")]))
)
summary = clean.groupby(["model", "cost_band"], observed=True)["score"].mean()`,
        note: 'The transformation is a readable chain, and each assumption can be asserted before the summary is trusted.',
      },
    ],
    glossary: [
      { term: 'Vectorisation', def: 'Applying an operation to an entire array through compiled kernels instead of a Python loop.' },
      { term: 'Shape', def: 'The length of every dimension in an array, such as <code>(1000, 768)</code> for 1,000 embeddings.' },
      { term: 'Broadcasting', def: 'NumPy’s rule for applying operations between arrays with compatible but different shapes.' },
      { term: 'Data lineage', def: 'Metadata that records where data came from and which transformations produced it.' },
    ],
    pitfalls: [
      'Using Python loops over DataFrame rows for work that can be expressed as vectorised operations.',
      'Fitting cleaning or normalisation rules on the full dataset before the train/eval split, causing leakage.',
      'Changing data in place without retaining raw inputs, schema checks, or transformation versions.',
    ],
    apply: [
      'Analyse model quality, latency, and cost by model and use case with pandas.',
      'Use NumPy for embedding normalisation and similarity calculations.',
      'Version raw and processed datasets and assert row counts, uniqueness, null rates, and allowed ranges.',
    ],
    checks: [
      { q: 'Why is vectorisation usually faster than a Python loop?', a: 'The operation runs in optimised compiled code over contiguous typed memory instead of paying Python interpreter overhead per element.' },
      { q: 'What is data leakage?', a: 'Information from the evaluation or future data influences training or preprocessing, making measured performance unrealistically high.' },
      { q: 'Why keep raw data immutable?', a: 'It makes transformations reproducible, reviewable, and reversible when cleaning logic changes.' },
    ],
    resources: [
      { label: 'NumPy user guide', url: 'https://numpy.org/doc/stable/user/' },
      { label: 'pandas user guide', url: 'https://pandas.pydata.org/docs/user_guide/' },
    ],
  },
]

export const PREREQUISITE_CONCEPTS = PYTHON_PATH.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  tag: lesson.tag,
  body: lesson.intermediate,
  pitfalls: lesson.pitfalls,
  apply: lesson.apply,
  selfCheck: lesson.checks,
  resources: lesson.resources,
}))

export const PREREQUISITE_BEGINNER = Object.fromEntries(
  PYTHON_PATH.map((lesson) => [lesson.id, { definition: lesson.definition, body: lesson.beginner }])
)

export const PREREQUISITE_EXTRAS = Object.fromEntries(
  PYTHON_PATH.map((lesson) => [lesson.id, { definition: lesson.definition, subtypes: lesson.patterns }])
)

export const PREREQUISITE_DEEP = Object.fromEntries(
  PYTHON_PATH.map((lesson) => [lesson.id, {
    levels: {
      beginner: lesson.beginner,
      intermediate: lesson.intermediate,
      expert: lesson.expert,
    },
    examples: lesson.examples,
    glossary: lesson.glossary,
    practice: lesson.checks,
  }])
)

