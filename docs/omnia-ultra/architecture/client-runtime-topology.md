---
id: OMNIA-ULTRA-ARCH-CLIENTS
title: Client and runtime topology
status: normative-target
---

# Client and runtime topology

Clients:

- Windows native shell.
- CLI.
- Web remote projection.
- Android/tablet.
- Headless service.

Trusted core:

- Omnia Kernel.
- policy/approval broker.
- event journal.
- provider gateway.
- context compiler.
- artifact/project-twin engine.
- scheduler/workflow engine.

Least-trusted runtimes:

- local interactive machine;
- local background process;
- isolated sandbox/container/VM;
- persistent machine;
- remote machine;
- browser broker;
- official API connector;
- plugin/MCP/tool process.

Clients request typed commands and consume committed event cursors. They do not
directly mutate storage, unwrap secrets, select privileges or publish fake
runtime state.

Client reconnect must:

1. authenticate session/epoch;
2. request a fixed event watermark;
3. hydrate projections;
4. replay committed events;
5. reconcile pending local UI state;
6. resume live subscription.

