import { desktop } from "@/lib/desktop";
import { IdeAccessError, MAX_DIRECTORY_ENTRIES, MAX_EDITOR_BYTES, documentId, normalizeRelativePath, type IdeDocument, type IdeEntry, type IdeListing, type IdeRoot } from "./ide-model";

export interface IdeWritable {
  write(content: string): Promise<void>;
  close(): Promise<void>;
  abort?(): Promise<void>;
}

export interface IdeFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  requestPermission?(options: { mode: "readwrite" }): Promise<PermissionState>;
  createWritable?(options?: { keepExistingData?: boolean }): Promise<IdeWritable>;
}

export interface IdeDirectoryHandle {
  kind: "directory";
  name: string;
  entries(): AsyncIterableIterator<[string, IdeFileHandle | IdeDirectoryHandle]>;
  getDirectoryHandle(name: string): Promise<IdeDirectoryHandle>;
  getFileHandle(name: string): Promise<IdeFileHandle>;
}

export interface IdeAccess {
  readonly native: boolean;
  readonly folderPickerAvailable: boolean;
  listRoots(): Promise<IdeRoot[]>;
  pickFolder(): Promise<IdeRoot | null>;
  listDirectory(rootId: string, relativePath: string): Promise<IdeListing>;
  readFile(entry: Pick<IdeEntry, "rootId" | "relativePath">): Promise<IdeDocument>;
  importFiles(files: readonly File[]): Promise<IdeDocument[]>;
  saveFile(document: IdeDocument, baseline: string, content: string): Promise<IdeDocument>;
  exportCopy(document: IdeDocument, content: string): void;
}

interface PickerWindow extends Window {
  showDirectoryPicker?: (options?: { mode?: "readwrite" | "read" }) => Promise<IdeDirectoryHandle>;
}

interface HandleRoot { root: IdeRoot; handle: IdeDirectoryHandle }
interface ImportedSource { file: File; document: IdeDocument }

let sourceSequence = 0;
function nextId(prefix: string): string { sourceSequence += 1; return `${prefix}-${Date.now().toString(36)}-${sourceSequence.toString(36)}`; }

async function readBrowserFile(file: File): Promise<string> {
  if (file.size > MAX_EDITOR_BYTES) throw new IdeAccessError("file_too_large", "This editor opens UTF-8 files up to 2 MiB. The original file was not changed.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.subarray(0, 8_192).includes(0)) throw new IdeAccessError("binary_file", "This file contains binary data. Text editing is disabled to protect its bytes.");
  try { return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { throw new IdeAccessError("unsupported_encoding", "This file is not valid UTF-8. It was not decoded with replacement characters."); }
}

function nativeRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const internals = (window as unknown as { __TAURI_INTERNALS__?: { invoke?: unknown } }).__TAURI_INTERNALS__;
  return typeof internals?.invoke === "function";
}

function browserVersion(file: File): string { return `file:${file.lastModified}:${file.size}`; }

async function directoryAt(handle: IdeDirectoryHandle, path: string): Promise<IdeDirectoryHandle> {
  let current = handle;
  for (const segment of path ? normalizeRelativePath(path).split("/") : []) current = await current.getDirectoryHandle(segment);
  return current;
}

async function fileAt(handle: IdeDirectoryHandle, path: string): Promise<IdeFileHandle> {
  const segments = normalizeRelativePath(path).split("/");
  const name = segments.pop();
  if (!name) throw new IdeAccessError("invalid_path", "Select a regular file.");
  const parent = await directoryAt(handle, segments.join("/"));
  return parent.getFileHandle(name);
}

/** Native source access is read-only until a native write grant/command is implemented. */
export function createIdeAccess(): IdeAccess {
  const native = nativeRuntime();
  const picker = typeof window !== "undefined" ? (window as PickerWindow).showDirectoryPicker : undefined;
  const handles = new Map<string, HandleRoot>();
  const imports = new Map<string, ImportedSource>();
  let bootstrap: Promise<unknown> | null = null;
  const ensureNative = (): Promise<unknown> => {
    bootstrap ??= desktop.runtimeInfo().then((info) => desktop.initializeCore(info.appVersion)).catch((error: unknown) => { bootstrap = null; throw error; });
    return bootstrap;
  };

  const access: IdeAccess = {
    native,
    folderPickerAvailable: native || Boolean(picker),
    async listRoots() {
      const result = [...handles.values()].map((item) => item.root);
      if (!native) return result;
      await ensureNative();
      const grants = await desktop.listWorkspaceGrants();
      return [...grants.filter((grant) => grant.revokedAtMs === null).map((grant): IdeRoot => ({ id: grant.id, name: grant.displayName, displayPath: grant.displayPath, origin: "native", readOnly: true })), ...result];
    },
    async pickFolder() {
      if (native) {
        await ensureNative();
        const grant = await desktop.pickWorkspaceFolder();
        return grant ? { id: grant.id, name: grant.displayName, displayPath: grant.displayPath, origin: "native", readOnly: true } : null;
      }
      if (!picker) throw new IdeAccessError("picker_unavailable", "This browser does not expose directory handles. Open individual local files instead.");
      try {
        // Invoke the picker directly from the user gesture; do not await an unrelated bootstrap first.
        const handle = await picker.call(window, { mode: "readwrite" });
        const root: IdeRoot = { id: nextId("folder"), name: handle.name, displayPath: handle.name, origin: "handle", readOnly: false };
        handles.set(root.id, { root, handle });
        return root;
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return null;
        throw error;
      }
    },
    async listDirectory(rootId, relativePath) {
      const path = normalizeRelativePath(relativePath, true);
      const known = handles.get(rootId);
      if (known) {
        const directory = await directoryAt(known.handle, path);
        const entries: IdeEntry[] = [];
        let truncated = false;
        for await (const [name, item] of directory.entries()) {
          if (entries.length >= MAX_DIRECTORY_ENTRIES) { truncated = true; break; }
          const relative = normalizeRelativePath(path ? `${path}/${name}` : name);
          entries.push({ rootId, name, relativePath: relative, kind: item.kind, byteSize: null });
        }
        entries.sort((left, right) => Number(left.kind === "file") - Number(right.kind === "file") || left.name.localeCompare(right.name));
        return { rootId, relativePath: path, entries, truncated };
      }
      if (!native) throw new IdeAccessError("folder_unavailable", "This folder handle is no longer available. Choose the folder again.");
      await ensureNative();
      const listing = await desktop.listWorkspaceDirectory(rootId, path);
      if (listing.grantId !== rootId || normalizeRelativePath(listing.relativePath, true) !== path) throw new IdeAccessError("scope_mismatch", "The directory response did not match the selected folder.");
      return { rootId, relativePath: path, truncated: listing.truncated, entries: listing.entries.map((entry) => ({ rootId, name: entry.name, relativePath: normalizeRelativePath(entry.relativePath), kind: entry.kind, byteSize: entry.byteSize })) };
    },
    async readFile(entry) {
      const path = normalizeRelativePath(entry.relativePath);
      const id = documentId(entry.rootId, path);
      const imported = imports.get(id);
      if (imported) return { ...imported.document };
      const known = handles.get(entry.rootId);
      if (known) {
        const handle = await fileAt(known.handle, path);
        const file = await handle.getFile();
        const content = await readBrowserFile(file);
        return { id, rootId: entry.rootId, relativePath: path, name: file.name, origin: "handle", content, version: browserVersion(file), saveMode: handle.createWritable ? "original" : "copy" };
      }
      if (!native) throw new IdeAccessError("file_unavailable", "The file must be opened again with an explicit local selection.");
      await ensureNative();
      const file = await desktop.readWorkspaceTextFile(entry.rootId, path);
      if (file.grantId !== entry.rootId || normalizeRelativePath(file.relativePath) !== path || !/^[a-f0-9]{64}$/i.test(file.contentSha256)) throw new IdeAccessError("scope_mismatch", "The file response did not match the selected path and content receipt.");
      return { id, rootId: entry.rootId, relativePath: path, name: path.split("/").pop() ?? path, origin: "native", content: file.content, version: file.contentSha256, saveMode: "copy" };
    },
    async importFiles(files) {
      const result: IdeDocument[] = [];
      // Validate every file before mutating the import registry; a rejected selection is atomic.
      for (const file of files) {
        const path = normalizeRelativePath(file.name);
        const content = await readBrowserFile(file);
        const rootId = nextId("file");
        const document: IdeDocument = { id: documentId(rootId, path), rootId, relativePath: path, name: file.name, origin: "import", content, version: browserVersion(file), saveMode: "copy" };
        result.push(document);
      }
      for (let index = 0; index < result.length; index += 1) {
        const document = result[index]; const file = files[index];
        if (document && file) imports.set(document.id, { file, document });
      }
      return result;
    },
    async saveFile(document, baseline, content) {
      const path = normalizeRelativePath(document.relativePath);
      const known = handles.get(document.rootId);
      if (!known || document.origin !== "handle" || document.saveMode !== "original") throw new IdeAccessError("read_only", "The selected source has no write grant. Export a copy of your edits; the original remains unchanged.");
      const handle = await fileAt(known.handle, path);
      if (!handle.createWritable) throw new IdeAccessError("read_only", "The selected file handle cannot create a writable stream.");
      if (handle.requestPermission && await handle.requestPermission({ mode: "readwrite" }) !== "granted") throw new IdeAccessError("permission_denied", "Write permission was not granted. Your edits remain in this tab.");
      const current = await handle.getFile();
      if (await readBrowserFile(current) !== baseline) throw new IdeAccessError("save_conflict", "The source changed outside Omnia. Reload the source or export your edits before saving.");
      if (new TextEncoder().encode(content).length > MAX_EDITOR_BYTES) throw new IdeAccessError("file_too_large", "The edited content exceeds the 2 MiB editor limit.");
      const writer = await handle.createWritable({ keepExistingData: false });
      try { await writer.write(content); await writer.close(); }
      catch (error: unknown) { try { await writer.abort?.(); } catch { /* Retain the original error. */ } throw error; }
      const after = await handle.getFile();
      const actual = await readBrowserFile(after);
      if (actual !== content) throw new IdeAccessError("write_verification_failed", "The file readback did not match the saved snapshot. Your tab was not marked saved.");
      return { ...document, content, version: browserVersion(after) };
    },
    exportCopy(document, content) {
      const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
      const anchor = window.document.createElement("a");
      anchor.href = url; anchor.download = document.name; anchor.rel = "noopener";
      window.document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    },
  };
  return access;
}
