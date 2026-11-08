import { desktop, isDesktopRuntime } from "@/lib/desktop";

export interface DiscoveryProfile {
  id: string;
  displayName: string;
  providerType: string;
  enabled: boolean;
  credentialStatus: "present" | "missing" | "locked" | "unknown";
}

export interface DiscoveryModel {
  id: string;
  displayName: string;
  ownedBy: string | null;
  createdAt: number | null;
  capabilities: {
    streaming: boolean;
    tools: boolean | null;
    vision: boolean | null;
    reasoning: boolean | null;
    source: string;
  };
}

export interface DiscoveryCatalog { profileId: string; discoveredAt: string; models: DiscoveryModel[]; }
export interface ModelDiscoveryService {
  available: boolean;
  listProfiles: () => Promise<unknown>;
  listModels: (profileId: string) => Promise<unknown>;
}
export interface ModelDiscoverySnapshot {
  phase: "unavailable" | "idle" | "loading-profiles" | "loading-models" | "ready" | "error" | "cancelled";
  profiles: DiscoveryProfile[];
  selectedProfileId: string;
  catalog: DiscoveryCatalog | null;
  error: string | null;
}

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid native data");
  return value as Record<string, unknown>;
};
const safeText = (value: unknown, limit = 512): string => {
  if (typeof value !== "string" || !value.trim() || value.length > limit || /[\u0000-\u001f\u007f]/.test(value)) throw new Error("Invalid native text");
  return value.trim();
};
const nullableBoolean = (value: unknown): boolean | null => {
  if (value === null || value === undefined) return null;
  if (typeof value !== "boolean") throw new Error("Invalid capability");
  return value;
};

function decodeProfiles(value: unknown): DiscoveryProfile[] {
  if (!Array.isArray(value) || value.length > 256) throw new Error("Invalid native profiles");
  const seen = new Set<string>();
  return value.map((entry) => {
    const row = record(entry); const id = safeText(row.id, 256);
    if (seen.has(id) || typeof row.enabled !== "boolean") throw new Error("Invalid native profile");
    seen.add(id);
    return {
      id, displayName: safeText(row.displayName, 512), providerType: safeText(row.providerType, 128), enabled: row.enabled,
      credentialStatus: (["present", "missing", "locked"].includes(String(row.credentialStatus)) ? row.credentialStatus : "unknown") as DiscoveryProfile["credentialStatus"],
    };
  });
}

function decodeCatalog(value: unknown, expectedProfileId: string): DiscoveryCatalog {
  const data = record(value); const profileId = safeText(data.profileId, 256);
  if (profileId !== expectedProfileId || typeof data.discoveredAt !== "string" || !Number.isFinite(Date.parse(data.discoveredAt)) || !Array.isArray(data.models) || data.models.length > 2_000) throw new Error("Invalid native model catalog");
  const seen = new Set<string>();
  const models = data.models.map((entry): DiscoveryModel => {
    const row = record(entry); const id = safeText(row.id); const caps = record(row.capabilities);
    if (seen.has(id) || typeof caps.streaming !== "boolean") throw new Error("Invalid native model");
    seen.add(id);
    if (row.createdAt != null && (typeof row.createdAt !== "number" || !Number.isFinite(row.createdAt))) throw new Error("Invalid creation time");
    return {
      id, displayName: safeText(row.displayName), ownedBy: row.ownedBy == null ? null : safeText(row.ownedBy), createdAt: row.createdAt == null ? null : row.createdAt as number,
      capabilities: { streaming: caps.streaming, tools: nullableBoolean(caps.tools), vision: nullableBoolean(caps.vision), reasoning: nullableBoolean(caps.reasoning), source: safeText(caps.source, 128) },
    };
  });
  return { profileId, discoveredAt: data.discoveredAt, models };
}

/** Uses native profile IDs only. Credentials and endpoints never enter this state. */
export function nativeModelDiscoveryService(): ModelDiscoveryService {
  return { available: isDesktopRuntime(), listProfiles: () => desktop.listProviderProfiles(), listModels: (id) => desktop.listProviderModels(id) };
}

/** A revision invalidates every previous response, including failed and cancelled IPC. */
export class ModelDiscoveryController {
  private revision = 0;
  private listeners = new Set<() => void>();
  private snapshot: ModelDiscoverySnapshot;

  constructor(private service: ModelDiscoveryService, preferredProfileId = "") {
    this.snapshot = { phase: service.available ? "idle" : "unavailable", profiles: [], selectedProfileId: preferredProfileId, catalog: null, error: null };
  }
  getSnapshot = (): ModelDiscoverySnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<ModelDiscoverySnapshot>) { this.snapshot = { ...this.snapshot, ...patch }; for (const listener of this.listeners) listener(); }

  refreshProfiles = async (): Promise<void> => {
    if (!this.service.available) return;
    const revision = ++this.revision;
    this.update({ phase: "loading-profiles", catalog: null, error: null });
    try {
      const profiles = decodeProfiles(await this.service.listProfiles());
      if (revision !== this.revision) return;
      const selectedProfileId = profiles.some((profile) => profile.id === this.snapshot.selectedProfileId && profile.enabled) ? this.snapshot.selectedProfileId : "";
      this.update({ phase: "idle", profiles, selectedProfileId });
    } catch {
      if (revision !== this.revision) return;
      this.update({ phase: "error", profiles: [], selectedProfileId: "", error: "Provider profiles could not be loaded. Check the provider configuration and native permissions, then retry." });
    }
  };

  selectProfile = (profileId: string): void => {
    ++this.revision;
    if (!this.service.available) return;
    if (profileId === "") { this.update({ phase: "idle", selectedProfileId: "", catalog: null, error: null }); return; }
    const profile = this.snapshot.profiles.find((entry) => entry.id === profileId && entry.enabled);
    if (!profile) { this.update({ phase: "error", selectedProfileId: "", catalog: null, error: "Select an enabled provider profile before discovering models." }); return; }
    this.update({ phase: "idle", selectedProfileId: profileId, catalog: null, error: null });
  };

  refreshModels = async (): Promise<void> => {
    if (!this.service.available) return;
    const profileId = this.snapshot.selectedProfileId;
    if (!this.snapshot.profiles.some((entry) => entry.id === profileId && entry.enabled)) {
      this.update({ phase: "error", catalog: null, error: "Select an enabled provider profile before discovering models." }); return;
    }
    const revision = ++this.revision;
    this.update({ phase: "loading-models", catalog: null, error: null });
    try {
      const catalog = decodeCatalog(await this.service.listModels(profileId), profileId);
      if (revision !== this.revision) return;
      this.update({ phase: "ready", catalog });
    } catch {
      if (revision !== this.revision) return;
      this.update({ phase: "error", catalog: null, error: "Model discovery failed. Check the provider connection, permissions and native credential status, then retry." });
    }
  };

  /** Native IPC has no abort command: this cancels UI acceptance only. */
  cancel = (): void => {
    ++this.revision;
    if (this.service.available) this.update({ phase: "cancelled", catalog: null, error: null });
  };
}
