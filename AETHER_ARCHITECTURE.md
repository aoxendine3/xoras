# AETHER OS: Sovereign Memory Architecture (v2.0)

## The Paradigm Shift
The AI industry has largely adopted a monolithic standard: bloated, cloud-based Vector Databases (e.g., Pinecone) that rely on "fuzzy" cosine similarity to fake agent memory. This approach fails at scale for enterprise revenue operations, where exact outcomes, explicit temporal tracking, and data sovereignty are required.

Aether OS abandons fuzzy vector RAG in favor of a **Sovereign Cognitive Graph Database** engineered exclusively on SQLite. 

## The Four-Layer Architecture (CoALA Framework)

Aether executes memory not as a static drive, but as a continuous cognitive process:

1. **Working Memory (The Context Window)**: Ephemeral state held in RAM (sub-10ms logic gates). 
2. **Episodic Memory (The Lifelog)**: A relational table (`episodic_logs`) that records every action, query, and—crucially—the definitive outcome (Success/Failed) of the campaign.
3. **Semantic Memory (Spreading Activation)**: Entity-relation mapping linking target demographics to historical messaging effectiveness.
4. **Procedural Memory (The Rulebook)**: Autonomously generated workflow rules stored in `procedural_rules`.

## The Write-Manage-Read Cycle
Aether is capable of autonomous learning through the `CognitiveArchivist` node:
1. **Write**: The orchestrator fires an outreach attempt and logs it to Episodic memory.
2. **Tag**: Human-in-the-loop (or secondary telemetry) tags the log as a `FAILURE` if the campaign does not convert.
3. **Manage**: The Archivist node scans for failed episodes, abstracts the context (e.g., "Law Firms rejected this tone"), and writes a permanent behavioral directive to Procedural Memory.
4. **Read**: In the next cycle, the Orchestrator queries the Rulebook *before* generating text, autonomously correcting its own behavior.

## Reproducibility & Deployment
This architecture runs entirely in-process within Node.js using the `better-sqlite3` driver. 
- **Latency**: Queries execute in microseconds.
- **Footprint**: Megabytes, not Gigabytes. B-Tree indexing means Node.js never has to load the full ledger into RAM.
- **Sovereignty**: 100% offline. `aether_brain.sqlite` never leaves the host machine.

### Universal Specs
Run the spec validation test to confirm full operational integrity:
\`\`\`bash
node intelligence_core/tests/memory_engine.test.cjs
\`\`\`

## Strategic Outlook
This architecture shifts Aether from an "Automated Prompt Generator" to a **Stateful Revenue Agent**. By establishing relational memory, Aether inherently scales into the 'RevOps Sniper' market. It remembers every failure, updates its own rules, and executes campaigns that compound in accuracy over time—all while maintaining absolute data privacy.
