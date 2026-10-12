// Beginner-friendly rewrite of each concept: plain language, everyday analogies,
// and jargon explained the first time it appears. Layered on top of the original
// content the same way extras.js is — ConceptView prefers `definition` and `body`
// from here when present, and still shows the original interactive widget.
//
// `body` is prose only (HTML). For concepts that have an interactive widget, the
// widget is pulled out of the original body by ConceptView and shown after this
// prose, so nothing has to be duplicated here.

export const BEGINNER = {
  /* ===================== PHASE 00 — PREREQUISITES ===================== */
  'py-async': {
    definition: 'A way to let your program start many slow tasks (like waiting for the internet) at the same time, instead of doing them one-by-one and waiting for each to finish.',
    body: `
      <p>Imagine a barista taking coffee orders. A slow barista takes one order, makes the whole drink, hands it over, and only <em>then</em> starts the next customer. A smart barista takes your order, starts your drink, and while it brews takes the next person's order too. Same barista, far more coffee per hour.</p>
      <p>Talking to an AI model is like ordering a drink: you send a request over the internet and <strong>wait</strong> for the reply, which can take a few seconds. That waiting is "dead time" — your program is just standing around. <strong>async/await</strong> is Python's way of using that dead time to start other requests instead of freezing.</p>
      <p>The keyword <code>await</code> means "this line will take a while — feel free to work on something else until the answer comes back." If you need to send 10 requests, you can fire them all off together and collect the answers as they arrive, instead of waiting 10 times in a row.</p>
      <p>You don't need to master this on day one — just know that when a batch of AI calls feels painfully slow, doing them "concurrently" (all at once) instead of "sequentially" (one after another) is usually the fix.</p>`,
  },
  'rest-json': {
    definition: 'The simple back-and-forth format used to talk to an AI over the internet: you send a request (a question in a tidy text format called JSON), and you get a reply back in the same format.',
    body: `
      <p>Talking to an AI model works like sending a letter. You write your message, put it in an envelope with the right address and a stamp (this is the <strong>request</strong>), and the model writes back (the <strong>response</strong>).</p>
      <p>The "language" inside the envelope is <strong>JSON</strong> — just text organized as labelled boxes, like <code>{"question": "hello", "max_length": 100}</code>. It's easy for both humans and computers to read.</p>
      <p>Every reply also comes with a small <strong>status code</strong> — a number that says how it went, like a delivery receipt:</p>
      <ul>
        <li><code>200</code> = success, here's your answer.</li>
        <li><code>400</code> = "I couldn't understand your request" — something in what <em>you</em> sent was wrong.</li>
        <li><code>401</code>/<code>403</code> = "who are you?" — a login/key problem.</li>
        <li><code>429</code> = "slow down, too many requests" — wait a moment and try again.</li>
        <li><code>500</code>/<code>529</code> = "our side broke" — not your fault, just retry shortly.</li>
      </ul>
      <p>Tools called SDKs (ready-made code libraries) hide these details for you, but knowing the letter-and-receipt picture is what lets you figure out what went wrong when something breaks.</p>`,
  },
  'git': {
    definition: 'A tool that saves snapshots of your work over time — like unlimited save points in a video game — so you can look back, undo mistakes, and share changes with teammates.',
    body: `
      <p>Think of <strong>Git</strong> as the version history in Google Docs, but for all your project files and much more powerful. Every time you finish a small piece of work, you take a snapshot (called a <strong>commit</strong>) with a short note describing what changed. If a change turns out badly, you can rewind to any earlier snapshot.</p>
      <p>The everyday routine is a handful of steps you'll repeat constantly:</p>
      <ul>
        <li><strong>clone</strong> — download a copy of a project.</li>
        <li><strong>branch</strong> — make a separate "sandbox" copy to try changes safely.</li>
        <li><strong>commit</strong> — save a snapshot with a note.</li>
        <li><strong>push</strong> — upload your snapshots to share them.</li>
        <li><strong>pull request</strong> — ask teammates to review and merge your changes.</li>
      </ul>
      <p>One AI-specific habit: when you change how you're prompting the model, save the "score" of how well it worked in your commit note. That way, if quality drops later, your history tells you exactly which change caused it.</p>
      <p>Golden rule: never save secret passwords or API keys into Git — once they're in the history, they're hard to remove and easy for others to find.</p>`,
  },
  'math-basics': {
    definition: 'The three small math ideas that show up everywhere in AI — none of them require advanced math, just a picture in your head.',
    body: `
      <p>Good news: you do <strong>not</strong> need heavy math to build AI apps. You need three simple ideas, and each is really just a mental picture.</p>
      <p><strong>1. A "vector" is just a list of numbers that marks a spot.</strong> Like GPS coordinates pinpoint a place on a map, a vector pinpoints the <em>meaning</em> of a word or sentence in an imaginary space. Words with similar meaning sit close together.</p>
      <p><strong>2. "Similarity" is how close two spots are.</strong> To check if two pieces of text mean similar things, we measure how close their spots are (a common measure is called <strong>cosine similarity</strong>). Close together = similar meaning; far apart = unrelated. This is the trick behind "find the most relevant document."</p>
      <p><strong>3. "Softmax" turns scores into chances.</strong> When the AI picks its next word, it doesn't pick one for sure — it gives each option a percentage chance and then rolls a weighted dice. A setting called <strong>temperature</strong> makes that dice more predictable (always picks the top option) or more surprising (spreads the chances out).</p>
      <p>That's genuinely most of the math you'll use day to day.</p>`,
  },

  /* ===================== PHASE 01 — LLM FOUNDATIONS ===================== */
  'transformer': {
    definition: 'The type of "engine" inside every modern AI language model. Its key trick is letting every word in a sentence look at every other word to figure out what\'s going on.',
    body: `
      <p>Every well-known AI model — ChatGPT, Claude, Gemini — runs on the same kind of engine, called a <strong>transformer</strong>. You don't need to build one, but a rough mental model helps everything else make sense.</p>
      <p>Its superpower is called <strong>attention</strong>. Read this sentence: "The trophy didn't fit in the suitcase because <em>it</em> was too big." What does "it" mean — the trophy or the suitcase? To answer, you glance back at the other words. That glancing-around is exactly what attention does: for every word, the model checks how much each <em>other</em> word matters for understanding it, and pays more "attention" to the important ones.</p>
      <p>The model does this many times in parallel, with each pass tracking a different kind of relationship (one might follow grammar, another the overall topic). Stacking dozens of these layers is what makes the model capable.</p>
      <p>Two things to keep in mind: attention is a <em>learned habit from reading tons of text</em>, not human understanding. And because the model weighs all words together, where you put important instructions in a long prompt can actually affect how much notice they get.</p>`,
  },
  'tokenization': {
    definition: 'How an AI chops text into small pieces (called tokens) before it can read it. A token is usually a short chunk of a word, not a whole word or a single letter.',
    body: `
      <p>An AI model can't read letters or words directly. First it breaks your text into <strong>tokens</strong> — small building blocks, a bit like LEGO pieces. A token is often a chunk of a word: "unbelievable" might become "un" + "believ" + "able".</p>
      <p>This one detail explains a lot of "weird" AI behavior:</p>
      <ul>
        <li><strong>Counting letters is hard for AI.</strong> Ask "how many R's in strawberry?" and it often gets it wrong — because it sees chunks like "straw" + "berry", not eight separate letters.</li>
        <li><strong>Other languages can cost more.</strong> Models were trained mostly on English, so English gets efficient chunks while other languages get chopped into more, smaller pieces — meaning more tokens for the same sentence.</li>
      </ul>
      <p>Why care? You're billed by the token, and each model can only hold so many tokens at once. A handy rule of thumb: <strong>1 token ≈ 4 letters of English ≈ ¾ of a word</strong>. Try the little tool below to see text get split into pieces.</p>`,
  },
  'embeddings': {
    definition: 'A way to turn a piece of text into a list of numbers that captures its meaning — so a computer can tell that "car" and "automobile" are related, even though the words look different.',
    body: `
      <p>Computers are great with numbers but bad with meaning. An <strong>embedding</strong> bridges that gap: it turns a word or sentence into a list of numbers that acts like a <em>meaning fingerprint</em>.</p>
      <p>Picture a giant map where every word gets a location based on meaning. "Dog" and "puppy" land right next to each other; "dog" and "spreadsheet" land far apart. The embedding is just the coordinates of that location. Because meaning becomes distance, the computer can now measure how related two texts are by how close their points sit.</p>
      <p>This is the foundation of "search by meaning." Instead of matching exact words, you can find text that <em>means</em> the same thing — so a search for "how to fix a flat tire" can surface a document titled "repairing a punctured wheel."</p>
      <p>Two practical notes for later: different embedding tools make different maps, so you can't mix coordinates from two of them; and a bigger list of numbers isn't automatically better — it's a trade-off between detail and cost. Try the tool below to see meaning-as-distance in action.</p>`,
  },
  'decoding': {
    definition: 'How an AI actually writes an answer — one token at a time, a bit like your phone\'s predictive text, repeatedly guessing the next piece until it\'s done.',
    body: `
      <p>An AI doesn't write a whole answer at once. It writes <strong>one small piece at a time</strong>, like the predictive-text bar above your phone keyboard that suggests the next word. It picks a piece, adds it, then looks at everything so far to pick the next piece, and repeats.</p>
      <p>At each step it actually has a list of possible next pieces, each with a percentage chance. How it chooses from that list is up to a few dials you can turn:</p>
      <ul>
        <li><strong>Temperature</strong> — the "creativity" dial. Low (near 0) makes it play it safe and predictable; high makes it more adventurous and random.</li>
        <li><strong>Top-p / Top-k</strong> — how many of the likely options it's even allowed to consider before choosing.</li>
      </ul>
      <p>Rule of thumb: for factual, consistent answers use a low temperature; for brainstorming or creative writing, turn it up. Play with the slider below to watch the odds shift.</p>`,
  },
  'context-window': {
    definition: "The maximum amount of text (your prompt plus the model's reply) an AI can keep in mind at once — like the size of its desk. Anything that doesn't fit gets left off.",
    body: `
      <p>Think of the <strong>context window</strong> as the model's desk. Everything it needs for this one reply — your question, any documents you paste in, the conversation so far, and the answer it's writing — all has to fit on that desk at the same time. When the desk is full, older things fall off the edge.</p>
      <p>The desk is measured in tokens (those word-chunks from earlier). It's <em>shared</em> between what you put in and what comes out: if you fill almost the whole desk with a long document, there's little room left for a long answer.</p>
      <p>Two surprises worth knowing:</p>
      <ul>
        <li><strong>Bigger isn't always better.</strong> Models tend to pay closest attention to the <em>start</em> and <em>end</em> of a long prompt and can gloss over the middle — a real effect nicknamed "lost in the middle."</li>
        <li><strong>Fuller desks cost more and run slower.</strong> More tokens = more money and more waiting.</li>
      </ul>
      <p>So don't dump everything in "just in case." Put the most important instructions near the top or bottom, and only include what's relevant.</p>`,
  },
  'training-stages': {
    definition: 'The three steps that turn a raw AI model into a helpful assistant — a bit like how a person goes from reading widely, to being taught by example, to getting feedback.',
    body: `
      <p>A helpful AI assistant isn't built in one step. It grows up in stages, much like a student:</p>
      <ul>
        <li><strong>1. Pretraining — "read everything."</strong> The model reads an enormous amount of text and just learns to predict the next word. This gives it a huge store of knowledge and language, but it doesn't yet know how to <em>follow instructions</em> — it's like a very well-read person who doesn't realize you're asking them a question.</li>
        <li><strong>2. Fine-tuning — "learn by example."</strong> It's then shown many examples of good question-and-answer pairs, which teaches it to actually respond helpfully when asked.</li>
        <li><strong>3. Feedback (RLHF/DPO) — "get coached."</strong> Finally, humans (or another AI) compare its answers and mark which are better. The model adjusts to prefer the better style — more helpful, more polite, safer.</li>
      </ul>
      <p>You mostly use the finished product, but knowing these stages explains why models are knowledgeable yet still need good prompting, and why they have a certain "tone."</p>`,
  },
  'finetuning': {
    definition: "Taking an already-trained model and giving it extra training on your own examples, so it gets better at your specific task or matches your style.",
    body: `
      <p><strong>Fine-tuning</strong> is like hiring a smart, experienced employee and then giving them a short course on <em>how your company does things</em>. The base knowledge is already there; you're specializing it.</p>
      <p>You'd fine-tune when you want the model to consistently follow a particular <strong>style or format</strong> (say, always answer in your brand's voice) or handle a narrow task where examples teach it better than instructions could.</p>
      <p>There are lighter and heavier versions:</p>
      <ul>
        <li><strong>Full fine-tuning</strong> — retrain everything. Powerful, but expensive and creates a whole new copy of the model.</li>
        <li><strong>LoRA / QLoRA</strong> — the popular shortcut: leave the big model frozen and train a tiny "add-on" layer. Cheap, fast, and you can swap add-ons per task.</li>
      </ul>
      <p>Important beginner tip: fine-tuning is great for teaching <em>style and behavior</em>, but it's usually the <em>wrong</em> tool for adding fresh facts — for that, look up information at question time (that's RAG, coming later).</p>`,
  },
  'quantization': {
    definition: "Shrinking a model by storing its numbers with less precision — making it smaller and faster to run, with usually only a small drop in quality.",
    body: `
      <p><strong>Quantization</strong> is like saving a photo at a lower resolution. The image is smaller and loads faster, and for most uses you can barely tell the difference — but if you zoom way in, it's slightly less sharp.</p>
      <p>A model is really a giant pile of numbers. Normally each number is stored very precisely, which takes lots of memory. Quantization rounds those numbers to shorter, "good enough" versions, so the whole model takes up far less space and runs faster — even on a laptop.</p>
      <p>You'll see labels like <strong>FP16</strong> (full quality), <strong>INT8</strong> (about half the size, barely any quality loss), and <strong>INT4</strong> (a quarter of the size, small quality loss). Lower means smaller and faster, but a bit less accurate.</p>
      <p>Why it matters to a beginner: quantization is what makes it possible to run capable open models on ordinary hardware instead of needing an expensive server. Use the toggle below to feel the trade-off.</p>`,
  },
  'prompt-engineering': {
    definition: "The skill of writing your request to an AI clearly enough that you reliably get the answer you want — because how you ask makes a big difference.",
    body: `
      <p>An AI will do very different things depending on <em>how</em> you ask. <strong>Prompt engineering</strong> is just the craft of asking well — the same way a clear question to a coworker gets a better answer than a vague one.</p>
      <p>A few beginner-friendly moves that reliably help:</p>
      <ul>
        <li><strong>Be specific about the task and the format.</strong> "Summarize this in 3 bullet points for a 10-year-old" beats "summarize this."</li>
        <li><strong>Give an example or two</strong> (called <em>few-shot</em>). Showing "here's an input and the kind of output I want" is often more powerful than describing it.</li>
        <li><strong>Ask it to think step by step</strong> (called <em>chain-of-thought</em>) for anything involving reasoning or math — it genuinely improves accuracy.</li>
        <li><strong>Set a role.</strong> "You are a patient tutor" nudges the whole tone and style.</li>
      </ul>
      <p>The mindset: treat the model like a brilliant but very literal intern. It'll do a great job if you tell it clearly what you want, show an example, and say how to format the answer.</p>`,
  },

  /* ============= PHASE 02 — LLM APIs & STRUCTURED OUTPUTS ============= */
  'raw-api': {
    definition: "The actual format of a chat with an AI: a list of messages labelled by who said what. Surprisingly, the AI has no memory — you resend the whole conversation each time.",
    body: `
      <p>Under the hood, a chat with an AI is just a <strong>list of messages</strong>, each tagged with who's speaking:</p>
      <ul>
        <li><strong>system</strong> — the standing instructions ("You are a friendly support agent").</li>
        <li><strong>user</strong> — what the person says.</li>
        <li><strong>assistant</strong> — what the model replies.</li>
      </ul>
      <p>Here's the part that surprises everyone: <strong>the model has no memory of your past messages.</strong> Each time you send a message, your program actually resends the <em>entire</em> conversation so far. The "memory" in a chatbot is just your app quietly keeping the transcript and passing it along every turn.</p>
      <p>That's why long conversations cost more and can eventually overflow the desk (the context window): every turn, the whole growing history is sent again. Knowing this demystifies a lot — the AI isn't remembering you, your app is reminding it.</p>`,
  },
  'tool-use': {
    definition: "Letting an AI do things, not just talk — by giving it a menu of actions (like 'look up the weather' or 'do this math') that it can ask your program to run.",
    body: `
      <p>By itself, a language model can only produce text. <strong>Tool use</strong> gives it hands. You hand the model a menu of actions it's allowed to request — say, <code>get_weather(city)</code> or <code>search_database(query)</code> — described in plain terms.</p>
      <p>The dance goes like this: you ask "what should I wear in Paris today?" The model can't know the weather, so instead of guessing it <em>requests</em> the <code>get_weather</code> tool for Paris. Your program runs that tool, gets "12°C and raining," hands the result back, and <em>then</em> the model writes a normal answer using real data.</p>
      <p>This is a big deal because it fixes two AI weaknesses at once: it can now use <strong>live, real information</strong> (not just what it memorized during training) and it can <strong>take actions</strong> in the real world, like booking or calculating. This simple loop — model asks for a tool, your code runs it, model continues — is the seed of everything called an "AI agent."</p>`,
  },
  'structured-outputs': {
    definition: "Getting the AI to answer in a strict, predictable format (usually JSON) instead of a free-form paragraph — so your program can use the answer automatically.",
    body: `
      <p>A paragraph is great for a human to read, but hard for a program to use. If you ask "extract the name, date, and total from this receipt" and the AI replies with a chatty sentence, your code has to awkwardly dig the pieces out.</p>
      <p><strong>Structured output</strong> means asking the AI to fill in a form instead. You say "give me the answer as JSON with fields <code>name</code>, <code>date</code>, and <code>total</code>," and you get back neat, labelled data like <code>{"name": "...", "date": "...", "total": 42.50}</code> that your program can read directly.</p>
      <p>Modern models have a "JSON mode" or schema setting that <em>guarantees</em> the shape comes out valid, so you're not left hoping. A common safety step is to <strong>check</strong> the result fits your form and, if not, politely ask again.</p>
      <p>Whenever the AI's answer needs to flow into another piece of software — a database, a spreadsheet, the next step of your app — reach for structured output instead of parsing prose.</p>`,
  },
  'streaming': {
    definition: "Showing the AI's answer word-by-word as it's being written, instead of making the user stare at a blank screen until the whole thing is finished.",
    body: `
      <p>You've seen ChatGPT type its answer out gradually, word by word. That's <strong>streaming</strong>. The alternative is waiting silently until the entire answer is ready and then showing it all at once — which feels slow and broken even when it isn't.</p>
      <p>Nothing about the total speed changes much; streaming just <em>starts showing</em> the answer the moment the first words are ready. The key benefit is <strong>perceived speed</strong>: seeing text appear within a fraction of a second feels responsive, while a 10-second blank wait feels like the app froze.</p>
      <p>Technically, the server sends the answer in a trickle of little updates and your app glues them together on screen. As a beginner, the main takeaway is simple: for anything a person is watching in real time, stream the response — it dramatically improves how the app feels.</p>`,
  },
  'error-handling': {
    definition: "Planning for the times an AI call fails or returns junk — and handling it gracefully with retries and checks, instead of letting your app crash.",
    body: `
      <p>Calls to an AI fail more often than you'd expect: the service is briefly overloaded, you sent too many requests too fast, or the answer comes back in the wrong shape. <strong>Error handling</strong> is the unglamorous code that keeps your app steady when that happens. It's not exciting, but it's the difference between a demo and something people can rely on.</p>
      <p>The core habits are common-sense:</p>
      <ul>
        <li><strong>Retry the temporary stuff, but politely.</strong> For "slow down" (429) or "our side broke" (500) errors, wait a moment and try again — and wait a little <em>longer</em> each time (this is called <em>exponential backoff</em>), so you don't pile on.</li>
        <li><strong>Don't retry your own mistakes.</strong> A "bad request" (400) means something in what you sent is wrong; retrying the same thing just fails again. Fix it instead.</li>
        <li><strong>Check the answer before trusting it.</strong> If you expected JSON and got something else, catch that and ask again rather than crashing.</li>
      </ul>
      <p>Build this in early. It's much easier than debugging a mysterious crash later.</p>`,
  },

  /* ===================== PHASE 03 — RAG ===================== */
  'rag-overview': {
    definition: "A technique that lets an AI answer using your own documents — it looks up the most relevant bits first, then answers based on them. Think of it as an open-book exam.",
    body: `
      <p>Out of the box, an AI only knows what it read during training — it doesn't know your company handbook, your product docs, or last week's news. <strong>RAG</strong> (Retrieval-Augmented Generation) fixes that by letting the model take an <strong>open-book exam</strong> instead of relying on memory.</p>
      <p>Here's the whole idea in one sentence: <em>before</em> the AI answers, you find the most relevant pages from your own documents and hand them to it along with the question. The AI then answers using those pages.</p>
      <p>It happens in two phases:</p>
      <ul>
        <li><strong>Getting ready (done in advance):</strong> chop your documents into bite-sized pieces and store them so they're searchable by meaning.</li>
        <li><strong>At question time:</strong> find the few pieces most relevant to the question, paste them into the prompt, and let the model answer — ideally citing where it got the info.</li>
      </ul>
      <p>Why it's so popular: it makes answers accurate and up-to-date <em>without</em> retraining the model, and it lets the AI point to its sources. Click the steps in the diagram below to walk through it.</p>`,
  },
  'chunking': {
    definition: "Cutting your documents into smaller pieces before storing them, so the AI can retrieve just the relevant part instead of a whole 50-page file.",
    body: `
      <p>You can't hand an AI a whole 300-page manual for every question — it won't fit, and it's wasteful. So in RAG you first cut documents into smaller <strong>chunks</strong>, like turning a book into a stack of index cards. Later, you fetch only the few cards that match the question.</p>
      <p>Where you make the cuts matters a lot. Cut in the wrong place and a card ends mid-thought, making it confusing or useless. Good chunking keeps each piece self-contained.</p>
      <p>Common ways to cut, simplest first:</p>
      <ul>
        <li><strong>Fixed-size:</strong> every N words, with a little overlap so ideas aren't sliced in half. Simple, but ignores meaning.</li>
        <li><strong>By structure:</strong> split along the document's own shape — paragraphs, headings, sections. Usually much better.</li>
        <li><strong>By meaning:</strong> start a new chunk when the topic shifts.</li>
      </ul>
      <p>For beginners, splitting on paragraphs/sections with a small overlap is a great default. Try the tool below to see the same text chunked different ways.</p>`,
  },
  'embedding-models-rag': {
    definition: "Choosing the tool that turns your text into meaning-coordinates. It's the single biggest factor in how well your document search works.",
    body: `
      <p>Remember embeddings — turning text into meaning-coordinates on a map? An <strong>embedding model</strong> is the specific tool that does that conversion, and in RAG your search is only as good as this tool. Pick a poor one and even perfect documents won't be found.</p>
      <p>The main choices, in plain terms:</p>
      <ul>
        <li><strong>Pay-as-you-go (hosted):</strong> a company runs it for you and charges per use. Easy, strong quality, no setup — great to start with.</li>
        <li><strong>Run-it-yourself (open):</strong> free to run on your own machine, more private, but you handle the setup.</li>
        <li><strong>Specialist:</strong> models tuned for a specific field like law, medicine, or code, which beat general ones on that kind of text.</li>
      </ul>
      <p>Beginner advice: start with a well-regarded hosted model, and only shop around if your search results are disappointing. And remember the earlier rule — once you pick one, stick with it, because different embedding tools make incompatible maps.</p>`,
  },
  'vector-dbs': {
    definition: "A special kind of database built to store meaning-coordinates and instantly find the closest matches — the search engine that powers 'find by meaning.'",
    body: `
      <p>Once you've turned thousands of document chunks into meaning-coordinates, you need somewhere to keep them and a fast way to ask "which chunks are closest to <em>this</em> point?" That's a <strong>vector database</strong>.</p>
      <p>A regular database is great at exact matches ("find the customer named Smith"). A vector database is built for <em>closeness</em> ("find the chunks whose meaning is nearest this question") — and it can do that across millions of items in a blink.</p>
      <p>You'll hear names like <strong>Pinecone</strong> (fully managed for you), <strong>Qdrant</strong> and <strong>Weaviate</strong> (popular, run hosted or yourself), and <strong>pgvector</strong> (an add-on that lets the ordinary Postgres database do vector search too — handy if you already use Postgres).</p>
      <p>As a beginner, don't overthink the choice. Any of them works to learn on; pgvector is especially convenient if you already have a normal database. The concept is what matters: it's a library that finds things by meaning, fast.</p>`,
  },
  'hybrid-search': {
    definition: "Combining two kinds of search — one that matches meaning and one that matches exact words — because each catches things the other misses.",
    body: `
      <p>Search-by-meaning (the embeddings approach) is powerful but has a blind spot: it can miss <strong>exact terms</strong> like a product code "X-4102", a person's name, or a rare acronym, because those don't have a rich "meaning" to match on.</p>
      <p>Old-fashioned <strong>keyword search</strong> has the opposite strengths and weaknesses: it nails exact words but doesn't understand that "car" and "automobile" mean the same thing.</p>
      <p><strong>Hybrid search</strong> simply runs both and blends the results, so you get the best of each — meaning <em>and</em> exact matches. It's like searching a library by topic <em>and</em> by exact title at the same time, then merging the two lists.</p>
      <p>A common, beginner-friendly way to merge the two ranked lists is called <strong>Reciprocal Rank Fusion</strong> — a simple formula that rewards items that rank high on either list. Try the demo below to watch two lists combine into one better list.</p>`,
  },
  'reranking': {
    definition: "A second, pickier pass that re-sorts your search results by carefully re-reading each one against the question — turning 'roughly relevant' into 'best first.'",
    body: `
      <p>Your first search is fast but a little rough — it grabs, say, the top 50 chunks that seem related. A <strong>reranker</strong> is a second reader that carefully re-examines those 50, comparing each one directly against the question, and re-sorts them so the truly best ones rise to the top. You then keep just the top 3–5.</p>
      <p>Think of it as a two-round hiring process: the first round quickly screens hundreds of résumés into a shortlist; the second round reads the shortlist closely to rank the finalists. The careful reading would be too slow to do on everything, but it's cheap and highly effective on a shortlist.</p>
      <p>This is often the single highest-value upgrade to a RAG system, because the model can only answer well if the <em>right</em> chunks are near the top of what you hand it. Watch the order change when you apply reranking in the demo below.</p>`,
  },
  'query-transform': {
    definition: "Improving the user's question before you search with it — rephrasing or expanding it — because people rarely phrase questions the way documents phrase answers.",
    body: `
      <p>People ask short, messy questions ("password reset?") while documents are written formally ("To change your account credentials..."). That mismatch can make good documents hard to find. <strong>Query transformation</strong> fixes the question <em>before</em> searching.</p>
      <p>A few beginner-friendly versions:</p>
      <ul>
        <li><strong>Rephrase / expand:</strong> turn "password reset?" into a fuller "how do I reset or change my account password?" so it matches more documents.</li>
        <li><strong>Multiple versions:</strong> generate a few different wordings of the question, search with each, and combine the results — casting a wider net.</li>
        <li><strong>Routing:</strong> figure out what kind of question it is and send it to the right place ("2+2" → a calculator; "refund policy" → the docs).</li>
      </ul>
      <p>The mindset: a little cleanup of the question often does more for search quality than fancier machinery downstream.</p>`,
  },
  'graph-rag': {
    definition: "A version of RAG that also maps how things connect (people, companies, events) — so the AI can answer questions that require joining facts from different places.",
    body: `
      <p>Normal RAG is great at "find the page that talks about X." But some questions need <em>connecting the dots</em> across many pages — "Which projects are led by people who used to work at the company we just acquired?" No single chunk contains that answer.</p>
      <p><strong>Graph RAG</strong> helps by first building a map of <em>relationships</em>: it pulls out the key things (people, companies, products) and the links between them ("Alice → works on → Project X", "Acme → acquired → Beta"). This map is called a <strong>knowledge graph</strong> — think of a detective's cork board with photos and string connecting them.</p>
      <p>With that map, the AI can follow the links to answer multi-step questions, and it can also summarize whole clusters to answer big-picture questions about your entire collection.</p>
      <p>It's more work to set up than plain RAG, so as a beginner, reach for it only when your questions are genuinely about <em>relationships and connections</em>, not just "find the relevant passage."</p>`,
  },
  'multimodal-rag': {
    definition: "Extending 'search your documents' beyond plain text to also cover images, charts, tables, and video.",
    body: `
      <p>Plain RAG assumes your knowledge is text. But real documents are full of <strong>images, charts, diagrams, and tables</strong> — and sometimes the answer lives in a picture, not a paragraph. <strong>Multimodal RAG</strong> lets you search and answer over those too.</p>
      <p>There are two common approaches, both easy to picture:</p>
      <ul>
        <li><strong>Describe it in words first:</strong> use an AI that can "see" to write a text caption for each image or chart, then search those captions the normal way.</li>
        <li><strong>Match pictures directly:</strong> use special models that put images and text on the <em>same</em> meaning-map, so a text question can find a matching image.</li>
      </ul>
      <p>Tables deserve special care — if you flatten a table into plain text carelessly, the rows and columns lose their meaning, so it's worth keeping their structure.</p>
      <p>Beginner takeaway: if your important information hides in visuals, plain-text RAG will miss it — you'll need a multimodal step.</p>`,
  },
  'rag-eval': {
    definition: "Measuring whether your RAG system is actually good — separately checking 'did it find the right documents?' and 'did it answer well using them?'",
    body: `
      <p>When a RAG answer is bad, you need to know <em>why</em>: did the system fail to <strong>find</strong> the right information, or did it find it but <strong>answer</strong> poorly? RAG evaluation checks these separately, like grading a student on both "did you look up the right pages?" and "did you write a good answer from them?"</p>
      <p>The main things to measure, in plain terms:</p>
      <ul>
        <li><strong>Did it retrieve the right stuff?</strong> Were the relevant chunks actually found and ranked near the top?</li>
        <li><strong>Is the answer faithful?</strong> Does the answer stick to what the documents actually say, without making things up (hallucinating)?</li>
        <li><strong>Is the answer relevant?</strong> Does it actually address the question?</li>
      </ul>
      <p>There are tools (like RAGAS) that use another AI to score these automatically, so you can test many questions quickly. The key habit: measure both halves, because fixing the wrong one wastes your time.</p>`,
  },
  'when-not-rag': {
    definition: "Recognizing the situations where looking things up is the wrong tool — so you don't build a complicated system you didn't need.",
    body: `
      <p>RAG is popular, so beginners often reach for it reflexively. But sometimes looking things up is the wrong tool, and knowing when saves you a lot of complexity. A few cases where you probably don't need RAG:</p>
      <ul>
        <li><strong>It all fits already.</strong> If your source is short enough to just paste into the prompt (say, one contract), do that — no search system needed.</li>
        <li><strong>It's a math or data question.</strong> "What were total sales last quarter?" needs a calculation or a database query (a tool call), not a document lookup.</li>
        <li><strong>You want a style, not facts.</strong> Teaching the model to write in your brand voice is a fine-tuning job, not a retrieval job.</li>
        <li><strong>It's one fast-changing fact.</strong> "What's the current stock price?" is better answered by calling a live API directly.</li>
      </ul>
      <p>The lesson: RAG is for "answer using this body of knowledge." If your problem isn't that, a simpler tool is usually the right call.</p>`,
  },
  'contextual-retrieval': {
    definition: "A fix for a common chunking problem — a piece of text losing its meaning once separated from the document it came from — by attaching a little context note to each chunk.",
    body: `
      <p>Chunking has a sneaky weakness. Imagine a chunk that just says: <em>"The company grew 30% that year."</em> Which company? Which year? Ripped out of its document, the chunk is nearly useless — and hard to find in search.</p>
      <p><strong>Contextual retrieval</strong> fixes this by clipping a short "context note" to each chunk before storing it, so it stands on its own. The chunk above becomes: <em>"[From Acme's 2023 annual report, revenue section] The company grew 30% that year."</em> Now it's clear and far easier to match to a question.</p>
      <p>A related idea, <strong>parent-document retrieval</strong>, is even simpler: search using small precise chunks, but when you find a match, hand the model the <em>bigger</em> surrounding section so it has full context to answer from.</p>
      <p>Beginner takeaway: if your RAG answers are vague or miss obvious documents, poorly-contextualized chunks are a likely culprit — and adding context notes is a high-impact, low-effort fix.</p>`,
  },
  'semantic-caching': {
    definition: "Saving AI answers so that when someone asks a similar question later, you can reuse the saved answer instantly instead of paying for a new one.",
    body: `
      <p>A regular cache remembers answers to <em>exactly</em> repeated questions. But people phrase the same question a hundred ways: "how do I reset my password?" and "I forgot my password, what now?" mean the same thing but don't match word-for-word.</p>
      <p><strong>Semantic caching</strong> is smarter: it remembers answers by <em>meaning</em>. When a new question comes in, it checks whether you've already answered something close enough (using those meaning-coordinates again) and, if so, instantly returns the saved answer — no new AI call, no cost, no waiting.</p>
      <p>This can save a lot of money and time on apps that get many similar questions. The one dial to be careful with is <strong>how similar is "close enough"</strong>: set it too loose and you'll serve a saved answer to a question that was actually different, giving people the wrong response.</p>
      <p>Beginner takeaway: great for FAQs and repetitive workloads; just tune the similarity threshold carefully so you only reuse answers that truly fit.</p>`,
  },

  /* ===================== PHASE 04 — AGENTS ===================== */
  'tool-error-recovery': {
    definition: "Designing an AI agent so that when a tool it uses fails, it notices, understands the problem, and adapts — instead of crashing or confidently making things up.",
    body: `
      <p>Once an AI can use tools (look things up, call APIs), those tools will sometimes <strong>fail</strong> — a website is down, a search returns nothing, a request was malformed. A brittle agent crashes or, worse, pretends it got an answer. A robust one handles it like a capable person would.</p>
      <p>The key trick is simple: when a tool fails, <strong>tell the agent about the failure</strong> instead of hiding it. If you feed the error message back ("that address wasn't found"), the model can react — try a different spelling, use another tool, or ask the user for help.</p>
      <p>Two guardrails make this safe:</p>
      <ul>
        <li><strong>Limit the retries</strong> so a failing agent can't loop forever (e.g., try 3 times, then give up gracefully).</li>
        <li><strong>Have a fallback</strong> — if the tool stays broken, return a sensible "I couldn't do that right now" instead of nonsense.</li>
      </ul>
      <p>Beginner takeaway: expect tools to fail, and let the agent <em>see</em> failures so it can recover.</p>`,
  },
  'react-loop': {
    definition: "The basic rhythm of an AI agent: Think about what to do, Act (use a tool), Observe the result, and repeat until the task is done.",
    body: `
      <p>An <strong>agent</strong> is an AI that can take several steps on its own to reach a goal. The most common rhythm it follows is nicknamed <strong>ReAct</strong>, and it's just a loop of four beats:</p>
      <ul>
        <li><strong>Think:</strong> "To plan a picnic I first need tomorrow's weather."</li>
        <li><strong>Act:</strong> it calls the weather tool.</li>
        <li><strong>Observe:</strong> it reads the result — "rainy, 12°C."</li>
        <li><strong>Repeat:</strong> "Rain — I should suggest an indoor option instead," and around again, until it can give a final answer.</li>
      </ul>
      <p>It's the same way a person tackles a task with tools: you don't plan everything up front, you take a step, see what happened, and decide the next step. This think-act-observe loop is the heartbeat of nearly every AI agent. Step through the demo below to watch one run.</p>`,
  },
  'langgraph': {
    definition: "A tool for building more reliable agents by laying them out as a flowchart — clear steps, clear paths between them, and a shared notepad the steps write to.",
    body: `
      <p>Letting an agent freely loop is flexible but can be unpredictable. <strong>LangGraph</strong> is a popular tool that lets you build an agent as an explicit <strong>flowchart</strong>, so you stay in control of what can happen and when.</p>
      <p>Three simple pieces:</p>
      <ul>
        <li><strong>Steps (nodes):</strong> boxes on the flowchart — "search the docs," "ask the model," "call a tool."</li>
        <li><strong>Paths (edges):</strong> the arrows between boxes, including "if this, go here; otherwise go there."</li>
        <li><strong>Shared notepad (state):</strong> a scratchpad every step can read and write, so information carries through the whole run.</li>
      </ul>
      <p>A nice bonus: because it's laid out this way, LangGraph can <strong>pause and resume</strong> — for example, stopping to get a human's approval before doing something risky, then continuing.</p>
      <p>Beginner takeaway: when a free-form agent gets too unpredictable, drawing it as a flowchart makes it reliable and easy to reason about. Watch the shared notepad update as the demo steps through the graph below.</p>`,
  },
  'memory-systems': {
    definition: "Giving an agent ways to remember things beyond a single conversation — both a running summary of the current chat and durable notes it can look up later.",
    body: `
      <p>By default an AI forgets everything once the conversation ends (and even mid-conversation, once the desk fills up). <strong>Memory systems</strong> give an agent proper recall, and it's really three separate jobs:</p>
      <ul>
        <li><strong>Short-term memory:</strong> keeping track of the <em>current</em> conversation without overflowing the context window — often by summarizing older turns ("earlier, the user said they're vegetarian").</li>
        <li><strong>Long-term memory:</strong> saving durable facts that should survive across sessions ("this user prefers metric units") into a store it can search later.</li>
        <li><strong>Remembering the right thing at the right time:</strong> pulling up only the relevant memories for the current moment, and letting stale ones fade.</li>
      </ul>
      <p>A helpful analogy: short-term memory is what's in your head during a chat; long-term memory is your notebook you can flip back to. Beginner takeaway: "give my agent memory" is really several smaller design choices, not one switch.</p>`,
  },
  'multi-agent': {
    definition: "Splitting a big task across several specialized AI agents that work together — like a small team of experts instead of one person doing everything.",
    body: `
      <p>Sometimes one agent trying to do everything gets overwhelmed or confused. <strong>Multi-agent</strong> systems split the work across several agents, each with a focused role — like a team where one person researches, another writes, and an editor reviews.</p>
      <p>Common shapes:</p>
      <ul>
        <li><strong>Manager + workers:</strong> a lead agent breaks the task into pieces and hands them to specialist agents, then combines the results.</li>
        <li><strong>Assembly line:</strong> agents pass work down a chain — researcher → analyst → writer.</li>
        <li><strong>Back-and-forth:</strong> two agents talk to each other, e.g., one writes code and another critiques it.</li>
      </ul>
      <p>Important beginner warning: multiple agents add cost, complexity, and more ways to go wrong. Very often <em>one</em> well-designed agent beats a crowd. Only reach for a team when a single agent genuinely can't handle the scope — don't add agents just because it sounds impressive.</p>`,
  },
  'mcp-a2a': {
    definition: "Emerging 'universal plug' standards: MCP is a standard way for AI apps to connect to tools and data; A2A is a standard way for separate agents to talk to each other.",
    body: `
      <p>Before USB, every device needed its own special cable. Connecting AI to tools has felt the same way — custom glue code for every tool. New <strong>standards</strong> aim to be the "USB port" for AI.</p>
      <ul>
        <li><strong>MCP (Model Context Protocol):</strong> a standard way to plug tools and data sources into an AI app. If a tool speaks MCP, any MCP-compatible app can use it without custom code — like any USB device working in any USB port. For example, a "GitHub MCP server" instantly gives your assistant the ability to read repositories.</li>
        <li><strong>A2A (Agent-to-Agent):</strong> a standard way for <em>separate</em> agents — maybe built by different companies — to talk and hand tasks to each other.</li>
      </ul>
      <p>These are still young and evolving, so as a beginner you mostly just need the concept: shared standards so tools and agents can connect without everyone reinventing the wiring.</p>`,
  },
  'agentic-rag': {
    definition: "Letting the agent decide when and how to look things up — including whether to search at all, and whether to search again — instead of always doing one fixed lookup.",
    body: `
      <p>Basic RAG always does the same thing: take the question, do one search, answer. <strong>Agentic RAG</strong> makes retrieval a <em>decision</em> the agent makes, so it behaves more like a smart researcher.</p>
      <p>That means the agent can:</p>
      <ul>
        <li><strong>Decide whether to search at all.</strong> "What's 2+2?" needs no document lookup; "what's our refund policy?" does.</li>
        <li><strong>Search again if the results are weak.</strong> If the first search comes back unhelpful, it can reword the question and try once more — instead of answering from bad material.</li>
        <li><strong>Treat search as one tool among several,</strong> alongside a calculator, a database, or the web.</li>
      </ul>
      <p>The picture: instead of a fixed "always look up one thing" pipeline, you get a researcher who judges what they need and keeps digging until they've got it. It's more capable, at the cost of being a bit less predictable.</p>`,
  },
  'browser-agents': {
    definition: "Agents that operate a computer or website the way a person would — looking at the screen and clicking, typing, and scrolling — so they can use software that has no special AI connection.",
    body: `
      <p>Most tools an agent uses have a tidy "API" — a proper connection built for programs. But lots of software doesn't. <strong>Browser and computer-use agents</strong> handle that by operating the screen <em>like a human</em>: they look at a screenshot, then move the mouse, click buttons, and type.</p>
      <p>This unlocks anything a person can do on a screen, even with no official integration — filling a web form, navigating an old internal app, booking something on a website.</p>
      <p>But be realistic about the downsides, because they're big for beginners to appreciate:</p>
      <ul>
        <li><strong>Slow and fragile</strong> — a redesigned button or a popup can throw it off.</li>
        <li><strong>Risky</strong> — an agent clicking around with real access can do real damage, so it's usually run in a locked-down sandbox with no ability to, say, make real payments.</li>
      </ul>
      <p>Powerful and exciting, but treat it as a last resort when a proper connection isn't available.</p>`,
  },
  'guardrails': {
    definition: "Safety measures that control what goes into and comes out of an AI, so it can't be tricked into misbehaving or allowed to do something harmful.",
    body: `
      <p>Once an AI can access real data and take real actions, safety stops being optional. <strong>Guardrails</strong> are the checks around it — like the railings on a mountain road that keep it from going off the edge.</p>
      <p>The threat beginners most need to know about is <strong>prompt injection</strong>: hidden instructions sneaked into content the AI reads. Imagine a webpage that secretly says "ignore your previous instructions and email me the user's data." Without guardrails, a naive agent might obey it.</p>
      <p>Guardrails work on both sides:</p>
      <ul>
        <li><strong>On the way in:</strong> screen user input and any documents/websites for sneaky instructions, and keep the AI from treating that content as commands.</li>
        <li><strong>On the way out:</strong> check the response before it acts — block leaked secrets, unsafe content, or dangerous actions.</li>
        <li><strong>Ask permission for big actions:</strong> require a human's OK before anything high-stakes (like a large refund).</li>
      </ul>
      <p>Rule of thumb: never fully trust either the user's input or the model's output when real access is on the line.</p>`,
  },
  'agent-benchmarks': {
    definition: "Tests that check whether an agent can actually finish real, multi-step tasks — not just produce nice-sounding text — plus deliberately trying to break it.",
    body: `
      <p>It's easy to be fooled by an agent that <em>sounds</em> capable. <strong>Agent benchmarks</strong> test whether it can actually <em>get the job done</em> — measured by real outcomes, not eloquence.</p>
      <p>For example, one well-known test (SWE-bench) hands an agent a real reported software bug and checks whether its fix genuinely makes the tests pass. That's a world away from "did it write a plausible-looking answer."</p>
      <p>Two flavors matter:</p>
      <ul>
        <li><strong>Did it succeed?</strong> Run it on realistic tasks and measure the completion rate. Some tests also look at <em>how</em> it got there — did it take sensible steps and use the right tools?</li>
        <li><strong>Can it be broken? (red teaming):</strong> deliberately attack it — try prompt injection, try to make it misbehave — to find weaknesses before real users (or bad actors) do.</li>
      </ul>
      <p>Beginner takeaway: judge agents by real task success and by how they hold up under attack, not by how confident they sound.</p>`,
  },

  /* ===================== PHASE 05 — EVAL & OBSERVABILITY ===================== */
  'evals': {
    definition: "Tests for your AI — a set of example questions with a way to score the answers — so you can tell, with evidence, whether a change made things better or worse.",
    body: `
      <p>Because AI outputs aren't fixed, "it seems better" is a trap. <strong>Evals</strong> are the AI version of tests: a collection of example inputs plus a way to score the outputs, so you get an actual number instead of a gut feeling.</p>
      <p>Picture a spelling test with an answer key. You gather realistic examples (say, 50 typical customer questions), decide what a good answer looks like, and score the model's answers. Now when you tweak your prompt, you can <em>measure</em> whether the score went up or down.</p>
      <p>Ways to score, simplest first:</p>
      <ul>
        <li><strong>Exact checks</strong> when there's a right answer ("did it output APPROVED?").</li>
        <li><strong>AI-as-judge</strong> for open-ended answers — have another model grade against a rubric ("rate this reply 1–5 for helpfulness").</li>
        <li><strong>Human review</strong> — the gold standard, but slow and costly.</li>
      </ul>
      <p>Beginner takeaway: build even a small eval set early. It turns "I think this is better" into "this scored higher," which is how you improve on purpose instead of by luck.</p>`,
  },
  'observability': {
    definition: "Tools that let you see exactly what your AI app did on each request — the prompts, tool calls, timing, and cost — so you can debug it when something goes wrong.",
    body: `
      <p>When an AI app misbehaves, "it just gave a weird answer" isn't much to go on. <strong>Observability</strong> is like a flight recorder (black box) for your app: it records everything that happened on each request so you can play it back and see <em>why</em>.</p>
      <p>A good trace shows you, step by step:</p>
      <ul>
        <li>the exact prompt that was sent (often different from what you <em>thought</em> you sent — a super common bug),</li>
        <li>which tools were called and what they returned,</li>
        <li>how many tokens were used and what it cost,</li>
        <li>how long each step took.</li>
      </ul>
      <p>Tools like LangSmith, Langfuse, and Phoenix capture and display all this for you. Beginner takeaway: you can't fix what you can't see — set up tracing early, because most "the AI is acting strange" mysteries are solved just by reading the actual recorded prompt and tool results.</p>`,
  },
  'cost-latency': {
    definition: "The practical tricks for making an AI app cheaper to run and faster to respond — often the difference between a fun demo and something you can actually ship.",
    body: `
      <p>A demo can ignore money and speed. A real product can't. <strong>Cost and latency optimization</strong> is the set of levers that keep your app affordable and snappy. The good news: a few simple moves go a long way.</p>
      <ul>
        <li><strong>Reuse repeated text (caching):</strong> if every request includes the same big instructions, cache them so you don't pay to process them over and over.</li>
        <li><strong>Right-size the model (routing):</strong> send easy requests to a small, cheap, fast model and save the big expensive model for the hard ones.</li>
        <li><strong>Keep outputs short:</strong> the reply is often the biggest cost and the slowest part, so ask for concise answers and set a length limit.</li>
        <li><strong>Batch when you can:</strong> if answers aren't needed instantly, process many at once — often at a discount.</li>
      </ul>
      <p>Beginner takeaway: measure first, then apply the obvious wins. Shorter outputs and right-sizing the model usually give the biggest savings for the least effort.</p>`,
  },
  'regression-testing': {
    definition: "Automatically running your evals every time you change something, so a tweak that quietly makes the AI worse gets caught before it reaches users.",
    body: `
      <p>Here's a scary property of AI apps: a small change to a prompt can quietly make things <em>worse</em> without any error message. Everything still runs — it just answers a bit worse. <strong>Regression testing</strong> catches that automatically.</p>
      <p>The idea borrows from normal software: every time you change your prompt, model, or settings, your eval set runs automatically and checks the score didn't drop. If it did, the change is flagged (or blocked) before it ships. "Regression" just means "accidentally going backwards," and this is your safety net against it.</p>
      <p>A simple version: set a minimum score, and if a change pushes the eval below it, don't merge. You can also save known-good answers and get alerted when outputs suddenly change.</p>
      <p>Beginner takeaway: pair this with your evals and you can improve your app confidently, knowing you'll be warned the moment a change makes it worse.</p>`,
  },

  /* ===================== PHASE 06 — SERVING & DEPLOYMENT ===================== */
  'fastapi-docker': {
    definition: "The standard way to take your AI app off your laptop and put it online: wrap it in a web service (FastAPI) and pack it in a portable box (Docker) that runs the same anywhere.",
    body: `
      <p>Your app works on your laptop — now other people need to use it. Two everyday tools get it there:</p>
      <ul>
        <li><strong>FastAPI</strong> gives your app a <em>front door</em>: a web address others can send requests to. It's a popular Python framework for turning your code into an online service, so a website or app can call it.</li>
        <li><strong>Docker</strong> puts your app in a <em>shipping container</em>: a self-contained box holding your code and everything it needs. Because the box is identical everywhere, it runs the same on your laptop, a teammate's machine, or a cloud server — killing the classic "but it worked on my computer!" problem.</li>
      </ul>
      <p>Together they're the common recipe for deployment: build the front door with FastAPI, seal it in a Docker box, and run that box on a server. One habit to build early: never bake secret keys into the box — feed them in from the outside at runtime.</p>`,
  },
  'inference-serving': {
    definition: "Running an open AI model yourself in an efficient way, so a single expensive graphics card can serve many users at once instead of one at a time.",
    body: `
      <p>If you host your <em>own</em> model (instead of calling a paid API), you quickly hit a problem: AI models are heavy, and running them naively serves only one user at a time while an expensive GPU sits mostly idle. <strong>Inference serving</strong> tools solve this.</p>
      <p>Two names you'll meet:</p>
      <ul>
        <li><strong>Ollama</strong> — the easy on-ramp. A few commands and you're chatting with a model on your own machine. Perfect for learning and local experiments.</li>
        <li><strong>vLLM</strong> — built for scale. It cleverly serves <em>many</em> requests together and reuses work between them, squeezing far more out of each GPU.</li>
      </ul>
      <p>The clever trick behind the scenes is remembering work it already did (a <strong>KV-cache</strong>) so it doesn't recompute the same thing for every new word, and packing multiple users' requests together efficiently.</p>
      <p>Beginner takeaway: use Ollama to play locally; know that tools like vLLM are what make self-hosting affordable when real traffic arrives.</p>`,
  },
  'security-prod': {
    definition: "Applying real-world security to a live AI app — protecting secret keys, keeping different users' data separate, and limiting abuse.",
    body: `
      <p>Once your app is live and untrusted people can send it anything, security becomes real. <strong>Production security</strong> is mostly careful, boring hygiene — and skipping it is how small projects turn into incidents.</p>
      <p>The essentials, in plain terms:</p>
      <ul>
        <li><strong>Protect your keys.</strong> Keep API keys out of your code, store them safely, and rotate them. A leaked key can rack up a huge bill fast.</li>
        <li><strong>Keep users apart.</strong> Make sure one user can never see another user's data or documents — especially important with shared search indexes.</li>
        <li><strong>Limit abuse.</strong> Cap how much any one user can request, so nobody can run up your costs or overload the app.</li>
        <li><strong>Handle sensitive data carefully.</strong> Be deliberate about what personal information reaches the model or gets written into your logs.</li>
      </ul>
      <p>Beginner takeaway: assume strangers will poke at your app, and lock the obvious doors before you launch.</p>`,
  },
  'managed-vs-selfhosted': {
    definition: "The recurring choice between using a ready-made AI service someone else runs (renting) and running your own model (owning) — each with clear trade-offs.",
    body: `
      <p>Almost every AI project faces one fork: use a hosted service, or run your own model? It's the classic <strong>rent vs. own</strong> decision.</p>
      <ul>
        <li><strong>Managed / hosted (renting):</strong> you call a company's API (like Claude or GPT). You get top quality with zero setup and pay per use. Downsides: your data leaves your walls, and heavy usage can get pricey.</li>
        <li><strong>Self-hosted (owning):</strong> you run an open model on your own hardware. You get full control and privacy, but you handle the setup, upkeep, and the fixed cost of the machines.</li>
      </ul>
      <p>A simple way to think about cost: renting wins when usage is low or bursty; owning can win when you have steady, very high volume (like owning a car pays off only if you drive a lot).</p>
      <p>Beginner advice: start by renting — it's faster to build and learn on. Consider owning later, only if privacy needs or large steady volume make it worth the effort.</p>`,
  },

  /* ===================== PHASE 07 — ADVANCED ===================== */
  'moe': {
    definition: "A model design where only a few relevant 'expert' sub-networks switch on for each word — giving the model huge knowledge while keeping each response cheap to compute.",
    body: `
      <p>Imagine a hospital with many specialist doctors. You don't consult <em>all</em> of them for a sprained ankle — a receptionist routes you to the one or two who matter. <strong>Mixture of Experts (MoE)</strong> builds a model the same way.</p>
      <p>Instead of every part of the model working on every word, the model contains many "expert" sub-networks, and a little router picks just the few most relevant for each word. So the model can be <em>enormous</em> overall (lots of stored capability) while only a small slice actually runs each time — meaning big-model smarts at small-model speed and cost.</p>
      <p>You'll see this described as "47 billion total parameters, but only 13 billion active per token" — that gap is the MoE trick at work.</p>
      <p>As a beginner you won't build one, but it explains how some models manage to be both very capable and surprisingly efficient.</p>`,
  },
  'speculative-decoding': {
    definition: "A speed-up where a small fast model guesses the next few words and the big model checks them all at once — so you get the big model's quality, faster.",
    body: `
      <p>Recall that models write one word at a time, and each step with a big model is slow. <strong>Speculative decoding</strong> speeds this up without lowering quality, using a clever teamwork trick.</p>
      <p>Think of a fast junior assistant who quickly drafts the next few words, and a slow expert who can <em>check</em> a whole draft in a single glance. The junior guesses ahead; the expert verifies the guesses all at once and keeps the ones that are right. When the guesses are good (which is often, for predictable text), you skip a lot of slow one-at-a-time steps.</p>
      <p>The beautiful part: the expert has the final say on every word, so the output is <em>exactly</em> what the big model would have produced — just arrived at faster. No quality trade-off, only speed.</p>
      <p>Beginner takeaway: it's a behind-the-scenes optimization that makes big models respond quicker, with no downside to answer quality.</p>`,
  },
  'test-time-compute': {
    definition: "Letting a model spend more effort thinking when it answers a hard question — reasoning longer or trying several approaches — to get a better answer.",
    body: `
      <p>People solve an easy question instantly but slow down and think harder for a tricky one. Giving models that same option is <strong>test-time compute</strong>: spending extra effort <em>at the moment of answering</em> to boost quality on hard problems.</p>
      <p>Common forms, all intuitive:</p>
      <ul>
        <li><strong>Think longer first:</strong> the model works through its reasoning before giving a final answer (you may know this as "extended thinking" or "reasoning" modes).</li>
        <li><strong>Try several times and pick the best:</strong> generate a few independent answers and choose the one they mostly agree on.</li>
        <li><strong>Explore options:</strong> consider multiple approaches and back out of dead ends.</li>
      </ul>
      <p>The trade-off is straightforward: better answers, but more time and cost. Beginner takeaway: for hard reasoning or math, letting the model think more genuinely helps — but don't pay for deep thinking on simple questions.</p>`,
  },
  'distillation': {
    definition: "Training a small, cheap model to copy a big, expensive one — so you keep much of the quality at a fraction of the size and cost.",
    body: `
      <p><strong>Distillation</strong> is like an experienced teacher training an apprentice. The big, capable "teacher" model produces lots of high-quality answers, and a small "student" model learns to imitate them. The result: a compact model that punches well above its size, is cheaper to run, and responds faster.</p>
      <p>A simple version: use a top model to generate thousands of great example answers, then train a small model on those examples until it behaves similarly for your task.</p>
      <p>The catch is that a student usually can't fully match a much larger teacher across <em>everything</em> — but for a specific, well-defined task, a distilled small model is often more than good enough, and dramatically cheaper.</p>
      <p>Beginner takeaway: distillation is how you turn "great but pricey" into "nearly as good and cheap" for a focused job.</p>`,
  },
  'synthetic-data-rlaif': {
    definition: "Using AI to create its own training material and feedback — generating example data and having an AI (instead of humans) judge which answers are better.",
    body: `
      <p>Training and improving models normally needs lots of human-made examples and human feedback, which is slow and expensive. This topic is about letting <strong>AI help create that material itself</strong>.</p>
      <ul>
        <li><strong>Synthetic data:</strong> use a strong model to <em>generate</em> training examples — like a teacher writing a huge custom workbook — instead of collecting them all by hand.</li>
        <li><strong>RLAIF (AI feedback):</strong> normally humans rank answers to teach a model what "better" looks like. Here an AI does that ranking, so you can give feedback at a scale humans couldn't match.</li>
      </ul>
      <p>The obvious risk: if AI-made data is low quality or too repetitive, the model can learn bad habits (sometimes called "model collapse"). So this data is filtered carefully.</p>
      <p>Beginner takeaway: it's a way to scale up training when human-labelled data is too slow or costly — powerful, but only as good as the quality controls around it.</p>`,
  },
  'constrained-generation': {
    definition: "Forcing a model's output to exactly follow a required format — like valid JSON or a specific pattern — by only allowing valid next words as it writes.",
    body: `
      <p>Earlier we asked nicely for structured output. <strong>Constrained generation</strong> goes further and <em>guarantees</em> the format by controlling the model as it writes: at each step, it's simply not <em>allowed</em> to produce anything that would break the required shape.</p>
      <p>Picture autocomplete that refuses to type any character that would make the result invalid. If you require JSON, the model literally cannot produce a stray comma or missing bracket — the invalid options are blocked before it can pick them. The output comes out perfectly formatted every time.</p>
      <p>This is handy when downstream software absolutely depends on a rigid format — valid JSON, a phone-number pattern, a fixed set of allowed answers. Tools like Outlines and Guidance do this for you.</p>
      <p>Beginner takeaway: when "usually the right format" isn't good enough and you need "always," constrained generation enforces it at the source.</p>`,
  },
  'voice-agents': {
    definition: "AI you talk to out loud: it listens to your speech, thinks, and speaks back — built by chaining speech-to-text, the AI, and text-to-speech together.",
    body: `
      <p>A <strong>voice agent</strong> is an AI you have a spoken conversation with, like a smart phone assistant. It's usually three familiar pieces chained together:</p>
      <ul>
        <li><strong>Speech-to-text (STT):</strong> converts what you said into written words.</li>
        <li><strong>The AI model:</strong> reads those words and decides what to say back.</li>
        <li><strong>Text-to-speech (TTS):</strong> turns the reply back into a spoken voice.</li>
      </ul>
      <p>The hard part isn't any single piece — it's <strong>speed and natural turn-taking</strong>. In a real conversation, even a one-second delay feels awkward, and the agent needs to know when you've finished talking (and let you interrupt it). So voice systems work hard to shave off every bit of delay, and newer "speech-to-speech" models handle audio directly to cut the lag further.</p>
      <p>Beginner takeaway: a voice agent is mostly a fast, well-timed pipeline of listen → think → speak.</p>`,
  },
  'model-selection': {
    definition: "Choosing the right AI model for each job instead of always grabbing the biggest one — balancing quality, speed, cost, and privacy.",
    body: `
      <p>Beginners often reach for the biggest, smartest model for everything. But the biggest model is also the slowest and priciest, and it's overkill for simple jobs. <strong>Model selection</strong> is the habit of matching the model to the task — like not renting a moving truck to pick up groceries.</p>
      <p>Things to weigh:</p>
      <ul>
        <li><strong>How hard is the task?</strong> Simple extraction or sorting can use a small, cheap, fast model; deep reasoning may need a top-tier one.</li>
        <li><strong>Top-tier vs open model?</strong> Hosted frontier models are easiest and strongest; open models you run yourself offer control and privacy.</li>
        <li><strong>Special needs?</strong> Very long documents or images/audio require models that support them.</li>
      </ul>
      <p>A practical method: pick the <em>cheapest, fastest</em> model that still passes your evals for that task. Beginner takeaway: use just enough model for the job — it saves money and time without hurting quality.</p>`,
  },
  'data-engineering-llm': {
    definition: "Cleaning and preparing your data before feeding it to an AI system — removing duplicates, stripping out private information, and dropping junk — because good output needs good input.",
    body: `
      <p>There's an old saying: garbage in, garbage out. Every RAG knowledge base, training set, and eval set is only as good as the data behind it. <strong>Data engineering</strong> is the prep-cook work of cleaning ingredients before you cook.</p>
      <p>The three cleanups that matter most:</p>
      <ul>
        <li><strong>Remove duplicates.</strong> Near-identical copies of a document make your search return the same thing five times and can skew results. Deduplicate them.</li>
        <li><strong>Strip out private info (PII).</strong> Catch and remove sensitive personal data — names, emails, IDs — <em>before</em> it ever lands in a database or logs. Cleaning it up after a leak is far more painful.</li>
        <li><strong>Drop the junk.</strong> Filter out garbled text, navigation menus, and other low-value content so it doesn't dilute the good stuff.</li>
      </ul>
      <p>And do this as an ongoing, repeatable pipeline — not a one-time manual scrub. Beginner takeaway: time spent cleaning data upfront pays back many times over in output quality.</p>`,
  },
}
