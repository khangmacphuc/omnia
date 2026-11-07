---
id: OMNIA-ULTRA-TERMINOLOGY
title: Canonical terminology
status: normative
last_reviewed: 2026-08-14
---

# Canonical terminology

| Term | Meaning |
|---|---|
| Conversation | Durable tree container for messages and branches |
| Branch | Immutable-history/output-routing boundary inside a conversation |
| Copy | Content/export operation; does not create execution lineage |
| Fork | New conversation, task or project derived from an exact source snapshot |
| Jump prompt | Navigation from a prompt/message/attempt/source to another anchored point |
| Run | One logical requested outcome |
| Attempt | One provider dispatch or a precisely protected same-attempt retry |
| Iteration | One model/tool-loop step inside a run |
| Steer | Execute after the current atomic step, before ordinary queue items |
| Queue | Execute after all earlier queued work according to order/dependency |
| Btw | Side-question lane that does not mutate main context until promoted |
| Outcome unknown | Provider may have accepted the request but local terminal evidence is missing |
| Frozen input | Native-owned immutable provider input snapshot |
| Artifact | Versioned file or structured output with lineage |
| Project Twin | Graph, docs, atlas and evidence projection for a project |
| Role icon | Visual identity of an agent/persona/operation class |
| State glyph | Runtime state such as running, waiting, error or complete |
| Auto | Environment or routing selector, never an authority grant |
| Ultra | Highest-effort model plus multi-agent planning, implementation and verification |

## Request timing terms

- queued_at: accepted into Omnia queue.
- prepared_at: frozen context/provider input committed.
- dispatch_started_at: provider attempt began.
- first_byte_at: first transport byte.
- first_provider_output_at: first normalized provider item.
- first_reasoning_at: first provider-visible reasoning event, if any.
- first_visible_output_at: first visible output token/item.
- first_complete_item_at: first complete message/tool/artifact item.
- last_visible_output_at: last visible output.
- terminal_at: durable terminal fact.

## Token terms

- input_tokens.
- cache_read_input_tokens.
- cache_write_input_tokens.
- output_tokens.
- reasoning_tokens.
- visible_output_tokens.

Missing values are unknown, not zero.

