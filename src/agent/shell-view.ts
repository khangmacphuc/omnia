/**
 * Top-level views of the merged shell, in rail order. "agent" is the Home hub
 * (sessions, transcript, start page); the rest are workspace surfaces. Memory
 * and Skills live as tabs inside Library rather than as their own views.
 */
export const WORKSPACE_VIEWS = ["projects", "work", "library", "code", "browser"] as const;

export type WorkspaceView = (typeof WORKSPACE_VIEWS)[number];
export type ShellView = "agent" | WorkspaceView;

export interface ShellViewDescriptor {
  id: ShellView;
  label: string;
  /** Alt+digit shortcut handled by the shell. */
  shortcut: string;
}

export const SHELL_VIEWS: readonly ShellViewDescriptor[] = [
  { id: "agent", label: "Home", shortcut: "Alt+1" },
  { id: "projects", label: "Projects", shortcut: "Alt+2" },
  { id: "work", label: "Work", shortcut: "Alt+3" },
  { id: "library", label: "Library", shortcut: "Alt+4" },
  { id: "code", label: "Code", shortcut: "Alt+5" },
  { id: "browser", label: "Browser", shortcut: "Alt+6" },
];

export function isWorkspaceView(view: ShellView): view is WorkspaceView {
  return view !== "agent";
}

export function shellViewLabel(view: ShellView): string {
  return SHELL_VIEWS.find((entry) => entry.id === view)?.label ?? view;
}
