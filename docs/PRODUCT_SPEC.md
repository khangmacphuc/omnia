# Omnia — Sovereign Desktop Ecosystem & Autonomous Harness Specification

- Status: [IN_PROGRESS]
- Version: 0.2.0-sovereign-alpha
- Target Platform: Windows 11 Desktop (Tauri v2 + Rust Core + React/Vite/TypeScript)
- Target Audience: High-end software engineers, AI researchers, autonomous systems developers, and advanced technical power users.

## 1. Executive Thesis & Non-Negotiable Principles

Omnia is an independent, sovereign, all-in-one AI operating environment. It is **not** an Electron wrapper, **not** an iframe container, and **not** a collection of fragmented AI tools. Omnia integrates the full capabilities of modern IDEs (VS Code / Antigravity), browsers (Chrome CDP / WebView2), deep research tools (Perplexity / NotebookLM), multi-stream download engines (IDM / HyperDownloader), and intelligent proxy orchestrators (htmustc-proxy) into a single, high-performance Rust core and a unified, zero-slop Slate Dark interface.

### Non-Negotiable Engineering Principles
1. **Zero-Slop UI & 100% Interactive Integrity:** Every button, menu, input, slider, and shortcut has an active, tested event handler. No mock buttons, no dead-end controls, and no blinding neon/black contrast.
2. **Single Sovereign Shell:** No double sidebars or frame-inside-frame embedding. Omnia owns the single Activity Rail and collapsible Sidebar; the central canvas hosts native editor and browser surfaces without redundant outer chrome.
3. **Deep Rust Engine Fusion:** Heavy operations (TCP connection chunking, CDP websocket protocol, subagent task scheduling, named-pipe IPC, SQLite knowledge graphs, and local model inference) execute in native Rust crates in src-tauri/crates/.
4. **Autonomous Prompt-Driven Routing:** The harness parses user prompt semantics to dynamically instantiate skills, assign agent roles, allocate tools, and route requests to optimal model endpoints (Cloud Frontier, htmustc-proxy pool, or Local Uncensored GGUF).
5. **Decentralized Multi-Agent DAG Execution:** Agents are organized in hierarchical DAGs or K-D trees, scaling up to 100+ concurrent slots with real-time visual graph observability and live cross-session IPC.
6. **Hierarchical 4-Layer Memory:** Project memory is standardized under .omnia/, backed by SQLite AST knowledge graphs, vector semantic search, and recurrent episodic state summarization.

---

## 2. Quantitative Definition of Done (DoD)

| Category | Metric | Requirement (DoD Threshold) | Status | Evidence / Verification Method |
|---|---|---|---|---|
| **Performance** | Cold Start Latency | < 1.500 ms to interactive shell | [IN_PROGRESS] | Measured from process spawn to window.onload |
| **Performance** | Keystroke Latency | < 16 ms (60 FPS) in editor & chat | [DONE] | Verified in Monaco and native input tests |
| **Resource** | Idle Memory Footprint | < 350 MB RAM (Editor + Browser idle) | [IN_PROGRESS] | Win32 Memory Working Set counter |
| **Reliability** | Subagent Spawn Time | < 50 ms per subagent node | [DONE] | Measured via Tokio async runtime benchmarks |
| **Reliability** | Proxy Failover Speed | < 250 ms automatic cooldown on 429/5xx | [IN_PROGRESS] | Simulated 429 fault injection test |
| **Accessibility** | Text Contrast Ratio | >= 7.0:1 (WCAG AAA) for body text | [IN_PROGRESS] | Automated Axe / Playwright visual sweep |
| **Integrity** | Interactive Controls | 100% of rendered buttons have live handlers | [IN_PROGRESS] | Automated DOM event listener crawler |
| **Quality** | Rust Unit/Eval Tests | 100% Pass (0 failed, 0 memory leaks) | [DONE] | cargo test --workspace passes all crates |
| **Quality** | Frontend TypeScript | 0 type errors under strict mode | [DONE] | npm run typecheck:app exits 0 |
| **Display** | Multi-DPI Rendering | Crisp rendering at 100%, 125%, 150%, 200% | [DONE] | Verified via CDP viewport bounds scaling |

---

## 3. Workbenches & Feature Inventory

### 3.1 Sovereign IDE Workspace
- [DONE] Native editor process manager with isolated loopback port binding (127.0.0.1:1430).
- [DONE] Generation key and token authentication preventing stale iframe hijacking.
- [IN_PROGRESS] Single unified sidebar integration: file explorer, git staging, and symbol outline rendered in Omnia sidebar, removing VS Code duplicate left activity bar.
- [PLANNED] Tree-sitter AST Code Graph integration for instant definition jumping and contextual subagent prompt injection.

### 3.2 Sovereign Browser & Web Research
- [DONE] WebView2 native surface child window with DPI-aware physical pixel bounds.
- [DONE] Native keyboard accelerator bridge: Ctrl+L, Alt+D, Ctrl+T, Ctrl+W, Ctrl+Tab, Escape.
- [DONE] Repeat-key guard preventing runaway tab destruction or focus loops.
- [IN_PROGRESS] Deep research engine: Perplexity-style multi-query synthesis, web source scraping, and automatic [^1] footnote citations.

### 3.3 Multi-Stream Download Accelerator
- [DONE] Initial HLS / DASH / HTTP stream downloader in omnia-download.
- [IN_PROGRESS] IDM-style multi-connection TCP chunking with dynamic HTTP Range headers and work-stealing re-segmentation.
- [IN_PROGRESS] Google Drive Downloader integration (driveScanner, hyperDownloader, cookie bypass).

### 3.4 Gemini Notebook & Knowledge Workspace
- [DONE] Chrome Canary cookie decryption via AES-GCM DPAPI (canary_cookies.db, chrome_master_key.bin).
- [IN_PROGRESS] Multi-format document ingestion engine: converting PDF, YouTube transcripts, and web articles to structured Markdown with semantic entity links.

### 3.5 Decentralized Multi-Agent DAG & Cross-Session IPC
- [DONE] Shared parent/child budget ledger with saturating arithmetic and one-time warnings.
- [DONE] Sibling approval namespace isolation preventing collision between parallel subagents.
- [IN_PROGRESS] Removal of 1-level subagent limit to enable recursive DAG / K-D tree delegation up to 100+ agents.
- [IN_PROGRESS] Named-pipe cross-session IPC server (\.\pipe\omnia-session-bridge) enabling live transcript streaming and Orca-style cross-model debate.

### 3.6 Uncensored Local Model Engine
- [PLANNED] Embedded GGUF / llama.cpp inference engine in omnia-local-model for private, offline, zero-refusal sovereign task execution alongside cloud frontier models.
