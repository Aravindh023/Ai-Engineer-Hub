export const EXPANSION_P1 = [
  {
    phaseId: 'p1', after: null, id: 'ai-engineering-role',
    title: 'The AI engineering stack', tag: 'Models are one component of a complete system',
    definition: 'AI engineering is the discipline of turning probabilistic models into useful, secure, measurable, and maintainable software systems.',
    levels: {
      beginner: `<p>An AI engineer does much more than call a model. You translate a user problem into a system, prepare data, choose a model, design prompts and tools, evaluate quality, deploy the service, and monitor what happens after launch.</p><p>Think in layers: <strong>product goal → data → model → orchestration → application → evaluation → operations</strong>. A weakness in any layer can make the whole product fail even when the model is excellent.</p>`,
      intermediate: `<p>Start every project with a measurable task contract: inputs, outputs, users, unacceptable failures, latency target, privacy boundary, and cost budget. Build the simplest baseline that can be evaluated before adding RAG, agents, or fine-tuning.</p><p>The core loop is empirical: collect representative cases, implement a baseline, measure it, inspect failures, change one variable, and repeat. Model choice is one decision inside that loop—not the architecture itself.</p>`,
      expert: `<p>Production AI is a socio-technical system. Reliability includes data provenance, policy enforcement, human escalation, observability, rollback, and ownership. Separate deterministic controls from probabilistic decisions and make every high-impact action independently authorised.</p><p>Manage the system as a portfolio of quality, latency, cost, safety, and maintainability. Improvements must be evaluated across all five; a benchmark gain that doubles cost or creates an unreviewable failure mode may be a regression.</p>`,
    },
    patterns: [
      { name: 'Task contract', desc: 'A precise definition of inputs, outputs, constraints, and success.', example: 'Answer policy questions with cited evidence; abstain if evidence is absent' },
      { name: 'Baseline-first', desc: 'Build the smallest measurable solution before adding complexity.', example: 'prompt-only → retrieval → agent only if evals justify each step' },
      { name: 'Feedback loop', desc: 'Use real failures to drive data, prompt, model, and product changes.', example: 'trace → label failure → add eval → fix → regression test' },
      { name: 'Layered system', desc: 'Treat data, model, orchestration, UI, and operations as separate concerns.', example: 'provider adapter behind a domain service with evals and tracing' },
    ],
    pitfalls: ['Starting with a fashionable framework before defining the task and eval.', 'Treating a fluent demo as evidence of reliability.', 'Putting permissions or business rules only in a prompt.'],
    apply: ['Write a one-page task contract for an AI feature.', 'Create a 20-case baseline eval before choosing advanced architecture.', 'Draw the full data flow, including logs, vendors, tools, and user feedback.'],
    practice: [
      { q: 'What is the first deliverable for an AI project?', a: 'A measurable task contract and representative evaluation set, followed by the simplest baseline.' },
      { q: 'Why is a model not an authorisation layer?', a: 'Its output is probabilistic and influenced by untrusted input; deterministic code must enforce identity, permissions, limits, and approvals.' },
    ],
    resources: [{ label: 'Google Rules of ML', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml' }],
  },
  {
    phaseId: 'p1', after: 'ai-engineering-role', id: 'ml-foundations',
    title: 'Machine-learning foundations', tag: 'Features, labels, training, validation & generalisation',
    definition: 'Machine learning fits a parameterised function to examples so it generalises to unseen inputs, rather than encoding every rule manually.',
    levels: {
      beginner: `<p>In supervised learning, each example has an input and a desired answer called a <strong>label</strong>. Training adjusts the model to reduce a numerical <strong>loss</strong> between predictions and labels. Evaluation asks whether that learning transfers to examples the model never saw.</p><p>Classification predicts a category, regression predicts a number, clustering finds groups, and ranking orders candidates. Modern AI systems often combine several of these tasks.</p>`,
      intermediate: `<p>Split data into training, validation, and test sets before tuning. The training set updates parameters, validation guides choices, and the untouched test set estimates final generalisation. Use metrics that match product costs: precision/recall for imbalanced decisions, calibration for confidence, and ranking metrics for retrieval.</p><p>Underfitting means the model cannot capture the pattern; overfitting means it memorises training quirks. Regularisation, more representative data, simpler models, and early stopping manage the bias–variance trade-off.</p>`,
      expert: `<p>Assume data is sampled from a deployment distribution that changes. Define the unit of independence before splitting—users, documents, or time—to prevent leakage. Evaluate slices, uncertainty, and distribution shift rather than trusting one average metric.</p><p>Causal validity matters: predictive correlation does not prove an intervention will work. For high-impact decisions, document label quality, selection bias, confounders, and the cost of false positives versus false negatives.</p>`,
    },
    patterns: [
      { name: 'Supervised learning', desc: 'Learn input-to-label mappings from examples.', example: 'classify support tickets by queue' },
      { name: 'Unsupervised learning', desc: 'Discover structure without provided labels.', example: 'cluster embedding vectors into themes' },
      { name: 'Ranking', desc: 'Order items by relevance or utility.', example: 'rank retrieved chunks for a question' },
      { name: 'Generalisation', desc: 'Perform well on new data from the intended environment.', example: 'accuracy on future users, not memorised training rows' },
    ],
    pitfalls: ['Splitting duplicate or same-user examples across train and test.', 'Optimising a convenient metric that does not reflect product harm.', 'Using the test set repeatedly until it becomes another validation set.'],
    apply: ['Define the learning task and baseline metric.', 'Choose a leakage-resistant split strategy.', 'Report per-slice metrics and inspect errors, not only the average.'],
    practice: [
      { q: 'Why keep a final test set untouched?', a: 'Repeated decisions based on it overfit development to that set, making the score optimistic.' },
      { q: 'When is recall more important than precision?', a: 'When missing a positive case is much more costly than reviewing an extra false positive, such as safety-event detection.' },
    ],
    resources: [{ label: 'Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }],
  },
  {
    phaseId: 'p1', after: 'ml-foundations', id: 'neural-networks',
    title: 'Neural networks & backpropagation', tag: 'How parameters learn representations',
    definition: 'A neural network composes differentiable layers and updates their parameters with gradients computed by backpropagation.',
    levels: {
      beginner: `<p>A neuron multiplies inputs by learned weights, adds a bias, and passes the result through an activation function. Layers of these units can learn increasingly useful representations: edges, shapes, meanings, or task-specific features.</p><p>Training repeats four steps: make a prediction, calculate loss, compute which parameters contributed to the error, and adjust them slightly.</p>`,
      intermediate: `<p>The chain rule lets <strong>backpropagation</strong> compute gradients from the loss back through every operation. An optimiser such as Adam uses those gradients to update parameters. Learning rate controls update size; batch size controls how many examples estimate each update.</p><p>Nonlinear activations let stacked layers represent complex functions. Initialisation, normalisation, residual connections, dropout, and gradient clipping help deep networks train stably.</p>`,
      expert: `<p>Diagnose optimisation with loss curves, gradient norms, activation statistics, and validation gaps. Vanishing/exploding gradients, dead activations, unstable mixed precision, or a data bug can produce similar symptoms; instrument before changing architecture.</p><p>Understand automatic differentiation as a dynamic computation graph and vector-Jacobian products. This mental model helps with frozen parameters, gradient accumulation, checkpointing, custom losses, and memory debugging.</p>`,
    },
    patterns: [
      { name: 'Forward pass', desc: 'Compute predictions from inputs through current parameters.', example: 'logits = model(batch)' },
      { name: 'Loss function', desc: 'Translate prediction error into a differentiable scalar.', example: 'cross-entropy for next-token prediction' },
      { name: 'Backpropagation', desc: 'Apply the chain rule to compute parameter gradients.', example: 'loss.backward()' },
      { name: 'Optimiser step', desc: 'Update parameters using gradients and optimiser state.', example: 'optimizer.step(); optimizer.zero_grad()' },
    ],
    pitfalls: ['Forgetting to clear accumulated gradients between steps.', 'Reading training loss alone and missing overfitting.', 'Using a learning rate that makes training diverge or stall.'],
    apply: ['Implement a tiny two-layer network.', 'Plot training and validation loss.', 'Inspect gradient norms when training becomes unstable.'],
    practice: [
      { q: 'What does backpropagation compute?', a: 'The gradient of the final loss with respect to every trainable parameter by applying the chain rule backward through the graph.' },
      { q: 'Why are nonlinear activation functions required?', a: 'Without them, any stack of linear layers collapses to one linear transformation and cannot represent complex boundaries.' },
    ],
    resources: [{ label: 'Neural Networks and Deep Learning', url: 'http://neuralnetworksanddeeplearning.com/' }],
  },
  {
    phaseId: 'p1', after: 'neural-networks', id: 'pytorch-fundamentals',
    title: 'PyTorch for model work', tag: 'Tensors, autograd, modules & training loops',
    definition: 'PyTorch is a tensor and automatic-differentiation framework used to build, train, fine-tune, and inspect neural networks.',
    levels: {
      beginner: `<p>A <strong>tensor</strong> is a typed multidimensional array. Its shape tells you how data is organised: a token batch may be <code>[batch, sequence]</code>, while hidden states may be <code>[batch, sequence, dimension]</code>.</p><p>PyTorch modules hold parameters and define a <code>forward</code> computation. Datasets and data loaders feed batches; autograd records operations and computes gradients.</p>`,
      intermediate: `<p>Master shape transformations, broadcasting, devices, dtypes, masking, and the training/evaluation modes of modules. A complete loop moves batches to the device, computes predictions and loss, backpropagates, updates parameters, and records validation metrics.</p><p>Use <code>torch.no_grad()</code> or inference mode when gradients are unnecessary, save both model and optimiser state for resumable training, and seed all relevant random generators when comparing experiments.</p>`,
      expert: `<p>Profile the input pipeline, host-to-device transfer, kernel execution, synchronisation, and memory allocation separately. Use automatic mixed precision, gradient accumulation, checkpointing, compilation, and distributed strategies only after identifying the bottleneck.</p><p>Reproducibility has limits across hardware and kernels; record environment, library versions, seeds, data order, and configuration. Validate numerical stability when changing dtype or compilation mode.</p>`,
    },
    patterns: [
      { name: 'Tensor', desc: 'Typed n-dimensional data with a shape, dtype, and device.', example: 'x.shape == (batch, sequence, hidden)' },
      { name: 'nn.Module', desc: 'Composable object containing parameters and forward logic.', example: 'class Classifier(nn.Module): ...' },
      { name: 'Autograd', desc: 'Records tensor operations and computes gradients automatically.', example: 'loss.backward()' },
      { name: 'DataLoader', desc: 'Batches, shuffles, and loads dataset examples.', example: 'DataLoader(dataset, batch_size=32, shuffle=True)' },
    ],
    examples: [{ title: 'Minimal training step', lang: 'python', code: `model.train()
optimizer.zero_grad(set_to_none=True)
with torch.autocast(device_type="cuda", enabled=use_amp):
    logits = model(input_ids)
    loss = criterion(logits, labels)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()`, note: 'The same lifecycle appears in fine-tuning code, even when a higher-level trainer hides it.' }],
    pitfalls: ['Mixing CPU and accelerator tensors.', 'Ignoring tensor shape semantics and broadcasting the wrong dimension.', 'Running evaluation without switching modes or disabling gradients.'],
    apply: ['Practice tensor indexing and shape transformations.', 'Write one complete training and validation loop.', 'Save a checkpoint and prove it can resume exactly.'],
    practice: [
      { q: 'What information does every tensor carry?', a: 'Values plus shape, dtype, and device; all four affect correctness and performance.' },
      { q: 'Why call model.eval() during validation?', a: 'It changes modules such as dropout and batch normalisation to inference behaviour; disabling gradients alone does not do this.' },
    ],
    resources: [{ label: 'PyTorch tutorials', url: 'https://pytorch.org/tutorials/' }],
  },
  {
    phaseId: 'p1', after: 'pytorch-fundamentals', id: 'language-modeling',
    title: 'NLP & language-model objectives', tag: 'From text corpora to next-token prediction',
    definition: 'Language modelling learns a probability distribution over token sequences, usually by predicting missing or next tokens from context.',
    levels: {
      beginner: `<p>A language model sees tokens and learns to predict what comes next. Repeating this across enormous text collections teaches grammar, facts, style, code patterns, and many task behaviours without a separate label for each one.</p><p>The model does not store a database of sentences. It learns parameters that assign probabilities to possible continuations.</p>`,
      intermediate: `<p>Causal models predict each next token using only earlier tokens; masked models reconstruct hidden tokens using both sides; encoder-decoder models map an input sequence to an output sequence. Training uses teacher forcing and cross-entropy across many token positions at once.</p><p>Perplexity measures average predictive surprise but does not directly measure instruction following or factuality. Corpus quality, tokenisation, sequence packing, and contamination strongly shape results.</p>`,
      expert: `<p>Objective and data distribution define capabilities and failure modes. Deduplicate to prevent memorisation and benchmark leakage, balance domains and languages deliberately, and document licensing and provenance. Curriculum order and data mixture weights can matter as much as raw volume.</p><p>Analyse loss by domain and token type, not only globally. Scaling data beyond its quality frontier can amplify low-value patterns, while over-filtering can erase rare but important knowledge.</p>`,
    },
    patterns: [
      { name: 'Causal LM', desc: 'Predict each next token from its left context.', example: 'decoder-only GPT-style training' },
      { name: 'Masked LM', desc: 'Reconstruct selected hidden tokens from surrounding text.', example: 'BERT-style representation learning' },
      { name: 'Seq2seq', desc: 'Generate an output sequence conditioned on an input sequence.', example: 'translation or summarisation' },
      { name: 'Perplexity', desc: 'Exponentiated average token loss; lower means less surprise on that distribution.', example: 'compare checkpoints on held-out corpus data' },
    ],
    pitfalls: ['Equating low perplexity with safe or helpful assistant behaviour.', 'Training and evaluating on contaminated or duplicated data.', 'Ignoring language and domain imbalance in the corpus.'],
    apply: ['Train a tiny character or token language model.', 'Calculate cross-entropy and perplexity on held-out text.', 'Audit a dataset sample for duplicates, quality, language, and licensing.'],
    practice: [
      { q: 'What is teacher forcing?', a: 'During training, the model predicts each next token while receiving the correct previous tokens rather than its own generated mistakes.' },
      { q: 'Why can perplexity improve while assistant quality does not?', a: 'Perplexity measures next-token prediction on a corpus, not instruction following, factual grounding, safety, or task success.' },
    ],
    resources: [{ label: 'Hugging Face NLP course', url: 'https://huggingface.co/learn/nlp-course/' }],
  },
  {
    phaseId: 'p1', after: 'transformer', id: 'positional-attention',
    title: 'Position encodings & attention variants', tag: 'How transformers represent order and scale context',
    definition: 'Position methods inject sequence order into attention, while attention variants trade expressiveness, memory, and serving cost.',
    levels: {
      beginner: `<p>Attention compares tokens but has no natural idea which token came first. Position information gives every token a sense of order, so “dog bites person” differs from “person bites dog.”</p><p>Different models encode position with learned vectors, sinusoidal patterns, or rotations. You usually do not configure this, but it affects context length and long-range behaviour.</p>`,
      intermediate: `<p>Absolute embeddings add a position vector. Relative biases score token distance. Rotary position embeddings rotate query/key dimensions so relative offsets emerge in their dot product. ALiBi adds distance-based attention bias.</p><p>Multi-query and grouped-query attention share key/value heads to reduce KV-cache memory. Sliding-window and sparse attention reduce long-context compute by limiting which token pairs interact.</p>`,
      expert: `<p>Context extension is not just increasing a configuration value. RoPE scaling, interpolation, extrapolation, attention sinks, retrieval heads, and the trained length distribution affect usable context. Evaluate recall by position and sequence length.</p><p>Choose attention variants against the serving workload: prefill cost, decode bandwidth, KV-cache capacity, batch size, and quality. Efficient kernels improve constants, while sparse patterns change the computation itself.</p>`,
    },
    patterns: [
      { name: 'RoPE', desc: 'Rotates query/key features by position to encode relative offsets.', example: 'common in modern decoder-only LLMs' },
      { name: 'Relative bias', desc: 'Adds learned or fixed distance information to attention scores.', example: 'nearby tokens can receive a distance-dependent bias' },
      { name: 'GQA/MQA', desc: 'Shares key/value heads to shrink serving memory and bandwidth.', example: 'many query heads reuse fewer KV heads' },
      { name: 'Sparse/window attention', desc: 'Restricts token interactions to reduce long-sequence cost.', example: 'local window plus selected global tokens' },
    ],
    pitfalls: ['Assuming advertised context length guarantees equal recall everywhere.', 'Extending positional settings without evaluating long-context quality.', 'Ignoring KV-cache memory when sizing inference.'],
    apply: ['Compare attention cost as sequence length grows.', 'Test fact recall at the beginning, middle, and end of long prompts.', 'Include KV-cache size in serving capacity estimates.'],
    practice: [
      { q: 'Why does a transformer need position information?', a: 'Plain self-attention is permutation-equivariant and otherwise cannot distinguish different token orders.' },
      { q: 'What problem does grouped-query attention address?', a: 'It reduces the number of stored key/value heads, lowering KV-cache memory and decode bandwidth with limited quality loss.' },
    ],
    resources: [{ label: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' }],
  },
  {
    phaseId: 'p1', after: 'training-stages', id: 'training-data-optimization',
    title: 'Training data, loss & optimisation', tag: 'What controls whether a model actually learns',
    definition: 'Model training is the coordinated design of data mixtures, objectives, batching, optimisation schedules, validation, and checkpoints.',
    levels: {
      beginner: `<p>Training quality depends on what examples the model sees, what error the loss rewards, and how parameter updates are scheduled. More data is useful only when it is relevant, legal, diverse, and clean.</p><p>An epoch is one pass through a dataset; a batch is the set of examples used for one update; a checkpoint is a saved training state.</p>`,
      intermediate: `<p>AdamW, learning-rate warmup and decay, weight decay, gradient clipping, and gradient accumulation are standard controls. Sequence packing reduces padding waste. Validation checkpoints detect overfitting and enable early stopping.</p><p>Data mixture weights act like product priorities: oversampling code, multilingual text, or instruction examples changes capability. Track dataset versions and sample counts alongside every run.</p>`,
      expert: `<p>Optimisation failures often originate in data. Monitor per-domain loss, gradient norms, token throughput, overflow/skipped steps, and example duplication. Use deterministic sharding and resumable data-loader state for large runs.</p><p>Checkpoint selection should follow downstream evals, not training loss alone. Build data governance for provenance, consent, deletion, licences, contamination, and harmful-content handling before scale makes mistakes expensive.</p>`,
    },
    patterns: [
      { name: 'AdamW', desc: 'Adaptive optimiser with decoupled weight decay.', example: 'common default for transformer training' },
      { name: 'Warmup + decay', desc: 'Increase learning rate safely, then reduce it as training converges.', example: 'linear warmup followed by cosine decay' },
      { name: 'Gradient accumulation', desc: 'Combine gradients across microbatches before one update.', example: 'simulate batch 256 with 8 × 32 microbatches' },
      { name: 'Data mixture', desc: 'Weighted composition of domains and task types.', example: 'web + code + books + multilingual + instructions' },
    ],
    pitfalls: ['Selecting checkpoints by training loss only.', 'Changing data and optimiser settings simultaneously without traceability.', 'Failing to save optimiser, scheduler, scaler, and data position for resume.'],
    apply: ['Create a versioned training manifest.', 'Plot learning rate, loss, and gradient norms.', 'Evaluate checkpoints on downstream tasks and safety slices.'],
    practice: [
      { q: 'Why use learning-rate warmup?', a: 'Early gradients can be unstable; warmup avoids destructive large updates before optimiser statistics and representations settle.' },
      { q: 'What must a resumable checkpoint contain?', a: 'Model, optimiser, scheduler, mixed-precision scaler, random states, step count, configuration, and data-loader position or equivalent.' },
    ],
    resources: [{ label: 'PyTorch optimisation documentation', url: 'https://pytorch.org/docs/stable/optim.html' }],
  },
  {
    phaseId: 'p1', after: 'training-data-optimization', id: 'scaling-laws',
    title: 'Scaling laws & compute planning', tag: 'Parameters, data, compute and capability trade-offs',
    definition: 'Scaling laws describe predictable relationships between model size, training data, compute, and loss, guiding efficient training and deployment decisions.',
    levels: {
      beginner: `<p>Larger models often improve when they also receive enough data and training compute. Scaling only parameter count can waste resources if the model is under-trained.</p><p>For application builders, the practical lesson is that a smaller recent model can outperform a larger older one, and benchmark quality must be weighed against inference cost.</p>`,
      intermediate: `<p>Compute-optimal training balances parameters and tokens under a fixed budget. Training FLOPs, memory, communication, and data availability set hard constraints. Scaling trends are smooth on average but individual capabilities and benchmarks can emerge unevenly.</p><p>Estimate training and inference separately: training is a one-time frontier cost; inference repeats per token and often dominates a successful product’s lifetime cost.</p>`,
      expert: `<p>Use scaling curves fitted to pilot runs, not a universal exponent copied from another regime. Account for architecture, data quality, sparsity, sequence length, precision, and hardware utilisation. Report uncertainty in extrapolation.</p><p>Plan total cost of ownership: accelerator time, interconnect, storage, failed runs, evaluation, serving replicas, power, and engineering. Optimise for useful capability per dollar and per joule, not parameter count.</p>`,
    },
    patterns: [
      { name: 'Parameter scaling', desc: 'Increase model capacity.', example: 'deeper or wider transformer' },
      { name: 'Data scaling', desc: 'Increase high-quality training tokens.', example: 'deduplicated domain-balanced corpus' },
      { name: 'Compute-optimal balance', desc: 'Allocate budget across model and data rather than maximising one.', example: 'pilot runs estimate best tokens-per-parameter regime' },
      { name: 'Inference economics', desc: 'Measure recurring cost per useful task.', example: 'quality threshold at dollars per million requests' },
    ],
    pitfalls: ['Using parameter count as a direct proxy for quality.', 'Ignoring data quality and hardware utilisation.', 'Extrapolating a scaling curve far beyond measured pilot runs.'],
    apply: ['Estimate tokens, FLOPs, memory, and wall-clock for a proposed run.', 'Plot quality versus latency and cost for candidate models.', 'Choose the smallest model that clears task-specific eval thresholds.'],
    practice: [
      { q: 'Why can a larger model be compute-inefficient?', a: 'If the fixed compute budget leaves too few training tokens, capacity is under-trained and a smaller model with more data may achieve lower loss.' },
      { q: 'What should an application team optimise?', a: 'Task quality under latency, cost, safety, privacy, and operational constraints—not parameter count.' },
    ],
    resources: [{ label: 'Training Compute-Optimal Large Language Models', url: 'https://arxiv.org/abs/2203.15556' }],
  },
  {
    phaseId: 'p1', after: 'prompt-engineering', id: 'foundations-capstone',
    title: 'Capstone: inspect and train a tiny language model', tag: 'Prove the foundations with code and evidence',
    definition: 'A hands-on project that connects tokenisation, tensors, attention, optimisation, generation, and evaluation in one reproducible experiment.',
    levels: {
      beginner: `<p>Build or follow a tiny character-level language model on a small text file. Inspect the vocabulary, encode/decode examples, train briefly, and generate samples at different temperatures.</p><p>Your goal is not quality; it is to see every stage of the pipeline with no hidden API.</p>`,
      intermediate: `<p>Implement a compact transformer or adapt a minimal reference. Track training/validation loss, save checkpoints, compare sampling settings, and explain every tensor shape. Add a baseline such as a bigram model.</p><p>Write a short model card covering data, objective, limitations, and compute.</p>`,
      expert: `<p>Run controlled ablations: context length, embedding size, heads, learning rate, and data size. Compare quality, speed, memory, and overfitting. Add deterministic configuration, resume support, and a small evaluation script.</p><p>Present conclusions with evidence and identify which lessons transfer to production LLM systems and which do not.</p>`,
    },
    patterns: [
      { name: 'Deliverable 1', desc: 'Reproducible training script and locked environment.', example: 'train.py + config.json + requirements.lock' },
      { name: 'Deliverable 2', desc: 'Metrics and experiment comparison.', example: 'loss curves, sample outputs, tokens/sec, memory' },
      { name: 'Deliverable 3', desc: 'Model card and limitations.', example: 'data provenance, intended use, failure examples' },
      { name: 'Stretch goal', desc: 'Add attention visualisation or KV-cached generation.', example: 'compare cached vs uncached decoding latency' },
    ],
    pitfalls: ['Copying a notebook without explaining the data and tensor shapes.', 'Reporting only attractive generated samples.', 'Changing several variables in one experiment.'],
    apply: ['Create the repository and baseline.', 'Run at least three controlled experiments.', 'Write a technical report with failures and next steps.'],
    practice: [
      { q: 'What proves this capstone is complete?', a: 'Another person can reproduce training, inspect metrics, generate samples, and understand limitations from the repository.' },
      { q: 'Why include a simple baseline?', a: 'It shows whether transformer complexity produces measurable improvement and catches broken evaluation.' },
    ],
    resources: [{ label: 'PyTorch language modeling tutorial', url: 'https://pytorch.org/tutorials/' }],
  },
]

