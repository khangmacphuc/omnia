# Omnia Context Compiler & Hierarchical Memory Architecture

- Status: [IN_PROGRESS]
- Standards: .omnia/ Standard & 4-Layer Memory Pipeline
- Scope: Workspace indexing, semantic graphs, RAG vector retrieval, and recurrent episodic summarization.

## 1. The 4-Layer Memory Architecture

Omnia eliminates the limitations of flat single-file memory buffers by deploying a 4-layer hierarchical memory engine:

`	ext
+-------------------------------------------------------------+
| Layer 1: Working Memory (Prompt Buffer & Active Scratchpad) |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 2: Project Memory (.omnia/ Standard Directory)        |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 3: Knowledge Graph & Semantic RAG (SQLite + Vectors)  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Layer 4: Episodic / Recurrent Memory (LSTM-style Vector)    |
+-------------------------------------------------------------+
`

### Layer 1: Working Memory
- Temporary prompt context and active tool scratchpad.
- Managed by omnia-harness/src/compact.rs with split-compaction when conversation tokens approach context limits.

### Layer 2: Project Memory (The .omnia/ Standard)
Every repository managed by Omnia maintains a standardized .omnia/ folder:
- .omnia/project.json: Project metadata, tech stack, and primary targets.
- .omnia/memory/decisions.md: Architecture Decision Records (ADRs).
- .omnia/memory/conventions.md: Code style, security policies, and lint rules.
- .omnia/specs/: Strict technical feature specs with status and DoD.
- .omnia/plans/: Project roadmaps, milestones, and task backlogs.
- .omnia/artifacts/: Test logs, diff snapshots, and execution receipts.
- .omnia/skills/: Automatically generated, project-specific procedural skills.

### Layer 3: Knowledge Graph & Semantic RAG
- **AST Code Graph:** Extracted via Tree-sitter into SQLite (.omnia/memory/knowledge-graph.db). Indexes symbol declarations, function signatures, caller-callee graphs, and imports.
- **Vector Index:** Fast embeddings for documentation, user manuals, and historical PR reviews.

### Layer 4: Episodic / Recurrent Memory
- Recurrent LSTM-style state summarization across long-running turns.
- Preserves high-level state vectors and critical user preferences across turn boundaries, preventing catastrophic forgetting during context compactions.

---

## 2. Autonomous Prompt Understanding & Context Policy

When the user submits a prompt, the Context Compiler executes a multi-pass pipeline:
1. **Intent Extraction:** Identifies task domain (refactor, debug, research, download, new feature).
2. **Skill Resolution:** Matches intent against built-in and project-specific skills in .omnia/skills/.
3. **Graph Retrieval:** Queries the AST Knowledge Graph for symbols directly relevant to the prompt.
4. **Context Budgeting:** Allocates token slots for system instructions (15%), project rules (10%), memory/graph context (25%), conversation history (35%), and reserved output generation (15%).
