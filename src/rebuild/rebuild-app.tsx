import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Bot, Boxes, Code2, Globe2, MessageSquare, Moon, Settings2, Sun, X } from "lucide-react";
import { useChatWorkspace } from "./chat/chat-controller";
import { ChatView, SessionList } from "./chat/chat-view";
import { BrowserWorkspace } from "./browser/browser-workspace";
import { IdeWorkspace } from "./ide/ide-workspace";
import { ReferenceWorkbench } from "./reference/reference-workbench";
import { SettingsPanel } from "./settings/SettingsPanel";
import { useRebuildSettings } from "./settings/settings";
import { useModalBoundary } from "./use-modal-boundary";
import "./rebuild-app.css";

type Surface = "chat" | "browser" | "ide";

function applyTheme(theme: "dark" | "light") {
  document.documentElement.dataset.rebuildTheme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function RebuildApp() {
  const controller = useChatWorkspace();
  const { settings, update } = useRebuildSettings();
  const [surface, setSurface] = useState<Surface>("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [companionOpen, setCompanionOpen] = useState(false);
  const companionToggle = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalOpen = settingsOpen || researchOpen;
  const dismissModal = useCallback(() => { setSettingsOpen(false); setResearchOpen(false); }, []);
  useModalBoundary(modalRef, modalOpen, dismissModal);
  useEffect(() => { applyTheme(settings.theme); }, [settings.theme]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && event.key === "1") { event.preventDefault(); setSurface("chat"); }
      if (event.altKey && event.key === "2") { event.preventDefault(); setSurface("browser"); }
      if (event.altKey && event.key === "3") { event.preventDefault(); setSurface("ide"); }
      if (event.key === "Escape" && companionOpen && !modalOpen) {
        event.preventDefault(); setCompanionOpen(false); companionToggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [companionOpen, modalOpen]);
  const toggleTheme = () => update({ theme: settings.theme === "dark" ? "light" : "dark" });
  return <div className="rb-app" data-surface={surface}>
    <header className="rb-topbar" inert={modalOpen}>
      <div className="rb-brand"><span className="rb-brand-glyph"><Bot size={16} /></span><strong>OMNIA</strong><span className="rb-brand-version">rebuild / local-first</span></div>
      <nav className="rb-surface-nav" aria-label="Primary surfaces">{([ ["chat", "Chat", Bot, "Alt+1"], ["browser", "Browser", Globe2, "Alt+2"], ["ide", "IDE", Code2, "Alt+3"] ] as const).map(([id, label, Icon, shortcut]) => <button key={id} type="button" className={`rb-surface-button ${surface === id ? "is-active" : ""}`} onClick={() => setSurface(id)} aria-current={surface === id ? "page" : undefined} title={`${label} · ${shortcut}`}><Icon size={15} />{label}</button>)}</nav>
      <div className="rb-top-actions"><button type="button" className="rb-top-icon" onClick={() => setResearchOpen(true)} aria-label="Open reference workbench" title="Research synthesis"><BookOpen size={15} /></button><button type="button" className="rb-top-icon" onClick={toggleTheme} aria-label="Toggle theme">{settings.theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}</button><button type="button" className="rb-top-icon" onClick={() => setSettingsOpen(true)} aria-label="Open settings"><Settings2 size={15} /></button></div>
    </header>
    <div className="rb-contextbar" inert={modalOpen}><div className="rb-context-title"><span className="rb-context-kicker">{surface === "chat" ? "Conversation" : surface === "browser" ? "Research surface" : "Code surface"}</span><span className="rb-context-session">{controller.activeSession.title}</span></div><div className="rb-context-metrics"><span><Boxes size={12} /> {controller.sessions.length} threads</span><span>{controller.native ? "core connected" : "preview / no provider"}</span></div>{surface !== "chat" ? <button ref={companionToggle} type="button" className="rb-companion-toggle" aria-label={companionOpen ? "Hide chat companion" : "Open chat companion"} aria-controls="rb-chat-companion" aria-expanded={companionOpen} onClick={() => setCompanionOpen((open) => !open)}><MessageSquare size={14} />Chat</button> : null}</div>
    <main className={`rb-main rb-main--${surface}`} inert={modalOpen}>
      <SessionList controller={controller} />
      {surface === "chat" ? <ChatView controller={controller} onOpenSettings={() => setSettingsOpen(true)} onOpenIde={() => setSurface("ide")} /> : null}
      {surface === "browser" ? <BrowserWorkspace /> : null}
      {surface === "ide" ? <IdeWorkspace /> : null}
      {surface !== "chat" ? <aside id="rb-chat-companion" className={`rb-companion-chat${companionOpen ? " is-open" : ""}`} aria-label="Chat companion"><div className="rb-companion-header"><span>Chat · {controller.activeSession.title}</span><button type="button" className="rb-top-icon" aria-label="Close chat companion" onClick={() => { setCompanionOpen(false); companionToggle.current?.focus(); }}><X size={16} /></button></div><ChatView controller={controller} compact onOpenSettings={() => setSettingsOpen(true)} onOpenIde={() => setSurface("ide")} /></aside> : null}
    </main>
    {settingsOpen ? <div ref={modalRef} tabIndex={-1} className="rb-overlay"><SettingsPanel onClose={dismissModal} onChooseModel={({ profileId, modelId }) => { void controller.updateSettings({ profileId, model: modelId }); }} /></div> : null}
    {researchOpen ? <div ref={modalRef} tabIndex={-1} className="rb-overlay rb-overlay--research" role="dialog" aria-modal="true" aria-label="Reference workbench"><button type="button" className="rb-research-close" onClick={dismissModal} aria-label="Close research workbench"><X size={16} /></button><ReferenceWorkbench onClose={dismissModal} /></div> : null}
  </div>;
}

export default RebuildApp;
