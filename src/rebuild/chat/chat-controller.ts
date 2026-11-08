import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import { desktop, invokeCore, isDesktopRuntime } from "@/lib/desktop";

export type ChatStatus = "loading" | "ready" | "running" | "disconnected" | "error";
export type ChatScope = "non-project" | "project";
export type ChatEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max" | "ultra";

export interface ChatSession {
  id: string;
  title: string;
  scope: ChatScope;
  cwd?: string;
  profileId: string;
  model: string;
  effort?: ChatEffort;
  permissionMode: string;
  settingsRevision: number;
  messageCount: number;
  updatedAtMs: number;
  localOnly?: boolean;
  running: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  text: string;
  timestamp: number;
  blocks?: Array<{ kind: "text" | "thinking" | "tool" | "error"; text: string; label?: string }>;
}

export interface ChatApproval {
  id: string;
  tool: string;
  summary: string;
  input: unknown;
}

export interface ChatQuestion {
  id: string;
  prompt: string;
  options: string[];
  recommended?: string[];
}

export interface ChatController {
  sessions: ChatSession[];
  activeId: string;
  activeSession: ChatSession;
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  draft: string;
  setDraft: (value: string) => void;
  selectSession: (id: string) => void;
  createSession: (cwd?: string) => Promise<ChatSession>;
  renameSession: (title: string) => Promise<void>;
  updateSettings: (input: { model?: string; effort?: ChatEffort; permissionMode?: string }) => Promise<void>;
  send: () => Promise<void>;
  steer: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
  approve: (id: string, decision: "allow_once" | "allow_always" | "deny") => Promise<void>;
  answerQuestion: (id: string, answer: string | null) => Promise<void>;
  approvals: ChatApproval[];
  questions: ChatQuestion[];
  refresh: () => Promise<void>;
  native: boolean;
}

interface NativeSessionSummary {
  id: string;
  title: string;
  cwd: string;
  profileId: string;
  model: string;
  reasoningEffort?: string | null;
  permissionMode?: string;
  settingsRevision?: number;
  messageCount?: number;
  updatedAtMs?: number;
  running?: boolean;
}

interface NativeMessage {
  role?: string;
  content?: Array<{ type?: string; text?: string; name?: string; input?: unknown; content?: unknown }>;
}

interface AgentEventPayload {
  sessionId?: string;
  event?: Record<string, unknown>;
  sequence?: number;
}

const STORAGE_KEY = "omnia.rebuild.chat.v1";
const LOCAL_SESSION_PREFIX = "rebuild-nonproject-";

function localSession(): ChatSession {
  const now = Date.now();
  return {
    id: `${LOCAL_SESSION_PREFIX}${crypto.randomUUID()}`,
    title: "New conversation",
    scope: "non-project",
    profileId: "unconfigured",
    model: "unconfigured",
    permissionMode: "ask_writes",
    settingsRevision: 1,
    messageCount: 0,
    updatedAtMs: now,
    localOnly: true,
    running: false,
  };
}

function mapSession(item: NativeSessionSummary): ChatSession {
  return {
    id: item.id,
    title: item.title.trim() || "Untitled conversation",
    scope: item.cwd ? "project" : "non-project",
    ...(item.cwd ? { cwd: item.cwd } : {}),
    profileId: item.profileId,
    model: item.model,
    ...(item.reasoningEffort ? { effort: normalizeEffort(item.reasoningEffort) } : {}),
    permissionMode: item.permissionMode ?? "ask_writes",
    settingsRevision: item.settingsRevision ?? 1,
    messageCount: item.messageCount ?? 0,
    updatedAtMs: item.updatedAtMs ?? 0,
    running: item.running ?? false,
  };
}

function normalizeEffort(value: string): ChatEffort {
  return ["none", "minimal", "low", "medium", "high", "xhigh", "max", "ultra"].includes(value)
    ? (value as ChatEffort)
    : "medium";
}

function readStoredState(): { activeId?: string; drafts?: Record<string, string> } {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object") return {};
    const record = value as Record<string, unknown>;
    const drafts = record.drafts;
    const result: { activeId?: string; drafts?: Record<string, string> } = {};
    if (typeof record.activeId === "string") result.activeId = record.activeId;
    if (drafts && typeof drafts === "object") result.drafts = drafts as Record<string, string>;
    return result;
  } catch {
    return {};
  }
}

function persistState(activeId: string, drafts: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, activeId, drafts }));
  } catch {
    // Storage can be disabled by a hardened webview; the in-memory state remains authoritative for the run.
  }
}

function messageText(message: NativeMessage): { text: string; blocks: ChatMessage["blocks"] } {
  const blocks: NonNullable<ChatMessage["blocks"]> = [];
  for (const block of message.content ?? []) {
    const type = block.type ?? "text";
    if (type === "text" && typeof block.text === "string") blocks.push({ kind: "text", text: block.text });
    else if (type === "thinking" && typeof block.text === "string") blocks.push({ kind: "thinking", text: block.text, label: "Reasoning summary" });
    else if (type === "tool_use") blocks.push({ kind: "tool", text: safeJson(block.input), label: block.name ?? "Tool call" });
    else if (type === "tool_result") blocks.push({ kind: "tool", text: safeJson(block.content), label: "Tool result" });
  }
  return { text: blocks.filter((block) => block.kind === "text").map((block) => block.text).join("\n") || blocks.map((block) => block.text).join("\n"), blocks };
}

function safeJson(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? "";
  } catch {
    return "[unserializable tool payload]";
  }
}

function mapMessages(messages: NativeMessage[]): ChatMessage[] {
  return messages.map((message, index) => {
    const mapped = messageText(message);
    const mappedMessage: ChatMessage = {
      id: `native-${index}`,
      role: message.role === "user" ? "user" : message.role === "assistant" ? "assistant" : "system",
      text: mapped.text,
      timestamp: 0,
    };
    if (mapped.blocks) mappedMessage.blocks = mapped.blocks;
    return mappedMessage;
  });
}

function eventText(event: Record<string, unknown>): string | null {
  const stream = event.event;
  if (stream && typeof stream === "object") {
    const inner = stream as Record<string, unknown>;
    if (inner.type === "text_delta" && typeof inner.text === "string") return inner.text;
    if (inner.type === "thinking_delta" && typeof inner.text === "string") return inner.text;
  }
  if (event.type === "tool_progress" && typeof event.chunk === "string") return event.chunk;
  if (event.type === "hook_message" && typeof event.message === "string") return event.message;
  return null;
}

export function useChatWorkspace(): ChatController {
  const stored = useMemo(readStoredState, []);
  const [sessions, setSessions] = useState<ChatSession[]>(() => [localSession()]);
  const [activeId, setActiveId] = useState(() => stored.activeId ?? "");
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>(stored.drafts ?? {});
  const [status, setStatus] = useState<ChatStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Record<string, ChatApproval[]>>({});
  const [questions, setQuestions] = useState<Record<string, ChatQuestion[]>>({});
  const [native, setNative] = useState(isDesktopRuntime());
  const unlisten = useRef<UnlistenFn | null>(null);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const applyEvent = useCallback((payload: AgentEventPayload) => {
    const sessionId = payload.sessionId;
    const event = payload.event;
    if (!sessionId || !event) return;
    const type = typeof event.type === "string" ? event.type : "";
    const text = eventText(event);
    if (text) {
      setMessagesBySession((current) => {
        const prior = current[sessionId] ?? [];
        const last = prior[prior.length - 1];
        if (last?.role === "assistant" && last.id === `stream-${sessionId}`) {
          return { ...current, [sessionId]: [...prior.slice(0, -1), { ...last, text: `${last.text}${text}` }] };
        }
        return { ...current, [sessionId]: [...prior, { id: `stream-${sessionId}`, role: "assistant", text, timestamp: Date.now() }] };
      });
    }
    if (type === "approval_requested") {
      const request = (event.request ?? {}) as Record<string, unknown>;
      const id = typeof request.toolUseId === "string" ? request.toolUseId : `approval-${Date.now()}`;
      setApprovals((current) => ({ ...current, [sessionId]: [...(current[sessionId] ?? []).filter((item) => item.id !== id), { id, tool: String(request.tool ?? "tool"), summary: String(request.summary ?? "Approval requested"), input: request.input }] }));
    }
    if (type === "approval_decided") setApprovals((current) => ({ ...current, [sessionId]: (current[sessionId] ?? []).filter((item) => item.id !== event.id) }));
    if (type === "ask_user" || type === "request_user_input") {
      const prompt = typeof event.prompt === "string" ? event.prompt : typeof event.question === "string" ? event.question : "The agent needs your input";
      const options = Array.isArray(event.options) ? event.options.filter((option): option is string => typeof option === "string") : [];
      const recommended = Array.isArray(event.recommended)
        ? event.recommended.filter((option): option is string => typeof option === "string")
        : undefined;
      const id = String(event.id ?? event.requestId ?? `question-${Date.now()}`);
      setQuestions((current) => ({ ...current, [sessionId]: [...(current[sessionId] ?? []).filter((item) => item.id !== id), { id, prompt, options, ...(recommended?.length ? { recommended } : {}) }] }));
    }
    if (type === "ask_user_resolved" || type === "request_user_input_resolved" || type === "question_answered") {
      const id = typeof event.id === "string" ? event.id : typeof event.requestId === "string" ? event.requestId : "";
      if (id) setQuestions((current) => ({ ...current, [sessionId]: (current[sessionId] ?? []).filter((item) => item.id !== id) }));
    }
    if (type === "run_started" || type === "turn_started") {
      setSessions((current) => current.map((session) => session.id === sessionId ? { ...session, running: true } : session));
      setStatus("running");
    }
    if (["run_completed", "error", "cancelled", "run_finished"].includes(type)) {
      setSessions((current) => current.map((session) => session.id === sessionId ? { ...session, running: false, updatedAtMs: Date.now() } : session));
      setStatus(type === "error" ? "error" : "ready");
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isDesktopRuntime()) {
      setNative(false);
      setSessions((current) => current.length ? current : [localSession()]);
      setStatus("ready");
      return;
    }
    try {
      const runtime = await desktop.runtimeInfo();
      await desktop.initializeCore(runtime.appVersion);
      const list = await invokeCore<NativeSessionSummary[]>("agent_session_list");
      const mapped = list.map(mapSession);
      setSessions(mapped.length ? mapped : [localSession()]);
      setActiveId((current) => current && mapped.some((session) => session.id === current) ? current : mapped[0]?.id ?? "");
      setNative(true);
      setStatus("ready");
      setError(null);
    } catch (cause) {
      setNative(true);
      setStatus("disconnected");
      setError(cause instanceof Error ? cause.message : "Omnia Core is unavailable. Choose a project folder or start the desktop runtime.");
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    void refresh();
    if (isDesktopRuntime()) {
      void listen<AgentEventPayload>("omnia-agent", ({ payload }) => {
        if (!disposed) applyEvent(payload);
      }).then((cleanup) => {
        if (disposed) cleanup();
        else unlisten.current = cleanup;
      });
    }
    return () => {
      disposed = true;
      unlisten.current?.();
      unlisten.current = null;
    };
  }, [applyEvent, refresh]);

  useEffect(() => {
    if (!activeId && sessions[0]) setActiveId(sessions[0].id);
    persistState(activeId, drafts);
  }, [activeId, drafts, sessions]);

  const activeSession = sessions.find((session) => session.id === activeId) ?? sessions[0] ?? localSession();
  const selectSession = useCallback((id: string) => {
    if (sessionsRef.current.some((session) => session.id === id)) {
      setActiveId(id);
      setError(null);
      if (isDesktopRuntime() && !id.startsWith(LOCAL_SESSION_PREFIX)) {
        void invokeCore<{ messages: NativeMessage[] }>("agent_session_read", { request: { sessionId: id } }).then((detail) => setMessagesBySession((current) => ({ ...current, [id]: mapMessages(detail.messages ?? []) }))).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not read this session"));
      }
    }
  }, []);

  const createSession = useCallback(async (cwd?: string): Promise<ChatSession> => {
    if (!cwd || !isDesktopRuntime()) {
      const created = localSession();
      setSessions((current) => [created, ...current]);
      setActiveId(created.id);
      setDrafts((current) => ({ ...current, [created.id]: "" }));
      setStatus("ready");
      setError(null);
      return created;
    }
    try {
      const created = await invokeCore<NativeSessionSummary>("agent_session_create", { request: { cwd, profileId: "default", model: "default", title: "New project conversation", reasoningEffort: "medium" } });
      const mapped = mapSession(created);
      setSessions((current) => [mapped, ...current.filter((session) => !session.localOnly)]);
      setActiveId(mapped.id);
      setError(null);
      setStatus("ready");
      return mapped;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not create the native session";
      setError(message);
      setStatus("error");
      throw new Error(message);
    }
  }, []);

  const renameSession = useCallback(async (title: string) => {
    const clean = title.trim().slice(0, 200);
    if (!clean) return;
    setSessions((current) => current.map((session) => session.id === activeId ? { ...session, title: clean } : session));
    if (!activeSession.localOnly && isDesktopRuntime()) await invokeCore("agent_session_update", { request: { sessionId: activeId, expectedSettingsRevision: activeSession.settingsRevision, title: clean } });
  }, [activeId, activeSession.localOnly, activeSession.settingsRevision]);

  const updateSettings = useCallback(async (input: { model?: string; effort?: ChatEffort; permissionMode?: string }) => {
    setSessions((current) => current.map((session) => session.id === activeId ? { ...session, ...(input.model ? { model: input.model } : {}), ...(input.effort ? { effort: input.effort } : {}), ...(input.permissionMode ? { permissionMode: input.permissionMode } : {}), settingsRevision: session.settingsRevision + 1 } : session));
    if (!activeSession.localOnly && isDesktopRuntime()) {
      await invokeCore("agent_session_update", { request: { sessionId: activeId, expectedSettingsRevision: activeSession.settingsRevision, ...(input.model ? { model: input.model } : {}), ...(input.effort ? { reasoningEffort: input.effort } : {}), ...(input.permissionMode ? { permissionMode: input.permissionMode } : {}) } });
    }
  }, [activeId, activeSession.localOnly, activeSession.settingsRevision]);

  const send = useCallback(async () => {
    const text = (drafts[activeId] ?? "").trim();
    if (!text) return;
    if (activeSession.localOnly || !isDesktopRuntime()) {
      setMessagesBySession((current) => ({ ...current, [activeId]: [...(current[activeId] ?? []), { id: `local-${Date.now()}`, role: "user", text, timestamp: Date.now() }] }));
      setDrafts((current) => ({ ...current, [activeId]: "" }));
      setError("This is a non-project draft. Choose a project folder to connect a native agent; no reply was fabricated.");
      return;
    }
    setMessagesBySession((current) => ({ ...current, [activeId]: [...(current[activeId] ?? []), { id: `user-${Date.now()}`, role: "user", text, timestamp: Date.now() }] }));
    setDrafts((current) => ({ ...current, [activeId]: "" }));
    setStatus("running");
    setSessions((current) => current.map((session) => session.id === activeId ? { ...session, running: true } : session));
    try {
      await invokeCore("agent_send", { request: { sessionId: activeId, text, images: [] } });
    } catch (cause) {
      setStatus("error");
      setSessions((current) => current.map((session) => session.id === activeId ? { ...session, running: false } : session));
      setError(cause instanceof Error ? cause.message : "The agent request could not be started");
    }
  }, [activeId, activeSession.localOnly, drafts]);

  const steer = useCallback(async (text: string) => {
    if (!text.trim() || activeSession.localOnly || !isDesktopRuntime()) return;
    await invokeCore("agent_steer", { request: { sessionId: activeId, text } });
  }, [activeId, activeSession.localOnly]);
  const interrupt = useCallback(async () => {
    if (activeSession.localOnly || !isDesktopRuntime()) return;
    await invokeCore("agent_interrupt", { request: { sessionId: activeId } });
  }, [activeId, activeSession.localOnly]);
  const approve = useCallback(async (id: string, decision: "allow_once" | "allow_always" | "deny") => {
    if (activeSession.localOnly || !isDesktopRuntime()) return;
    await invokeCore("agent_approval_decide", { request: { sessionId: activeId, toolUseId: id, decision: decision === "deny" ? { type: "deny", feedback: null } : { type: decision } } });
    setApprovals((current) => ({ ...current, [activeId]: (current[activeId] ?? []).filter((item) => item.id !== id) }));
  }, [activeId, activeSession.localOnly]);

  const answerQuestion = useCallback(async (id: string, answer: string | null) => {
    const clean = answer?.trim() ?? "";
    if (!clean && answer !== null) return;
    if (activeSession.localOnly || !isDesktopRuntime()) {
      setError("Ask-user answers require the connected Omnia Core; this preview cannot submit them.");
      return;
    }
    try {
      // The native command is intentionally capability-gated. Older cores do not
      // expose it; retaining the question on failure makes the missing capability
      // visible instead of silently claiming that an answer was accepted.
      await invokeCore("agent_user_input", { request: { sessionId: activeId, requestId: id, answer: answer === null ? null : clean } });
      setQuestions((current) => ({ ...current, [activeId]: (current[activeId] ?? []).filter((item) => item.id !== id) }));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The connected core does not support ask-user answers yet.");
    }
  }, [activeId, activeSession.localOnly]);

  return {
    sessions,
    activeId,
    activeSession,
    messages: messagesBySession[activeId] ?? [],
    status,
    error,
    draft: drafts[activeId] ?? "",
    setDraft: (value) => setDrafts((current) => ({ ...current, [activeId]: value })),
    selectSession,
    createSession,
    renameSession,
    updateSettings,
    send,
    steer,
    interrupt,
    approve,
    answerQuestion,
    approvals: approvals[activeId] ?? [],
    questions: questions[activeId] ?? [],
    refresh,
    native,
  };
}
