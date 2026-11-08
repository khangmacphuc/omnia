import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdeWorkspace } from "./ide-workspace";
import type { IdeAccess } from "./ide-access";
import type { IdeDocument, IdeListing, IdeRoot } from "./ide-model";

const root: IdeRoot = { id: "root", name: "sample", displayPath: "C:/sample", origin: "handle", readOnly: false };
const document: IdeDocument = { id: "root:src/main.ts", rootId: "root", relativePath: "src/main.ts", name: "main.ts", origin: "handle", content: "const value = 1;\n", version: "v1", saveMode: "original" };

function accessFixture(): IdeAccess & { saved: string[] } {
  const saved: string[] = [];
  const listing: IdeListing = { rootId: "root", relativePath: "", truncated: false, entries: [{ rootId: "root", name: "src", relativePath: "src", kind: "directory", byteSize: null }] };
  return {
    native: false, folderPickerAvailable: true, saved,
    listRoots: vi.fn(async () => [root]),
    pickFolder: vi.fn(async () => root),
    listDirectory: vi.fn(async (_rootId: string, path: string): Promise<IdeListing> => path === "" ? listing : { rootId: "root", relativePath: path, truncated: false, entries: [{ rootId: "root", name: "main.ts", relativePath: "src/main.ts", kind: "file", byteSize: document.content.length }] }),
    readFile: vi.fn(async () => document),
    importFiles: vi.fn(async (files: readonly File[]) => files.map((file) => ({ ...document, id: `file:${file.name}`, rootId: "file", relativePath: file.name, name: file.name, origin: "import" as const, content: "draft", saveMode: "copy" as const }))),
    saveFile: vi.fn(async (doc: IdeDocument, _baseline: string, content: string) => { saved.push(content); return { ...doc, content, version: "v2" }; }),
    exportCopy: vi.fn(),
  };
}

afterEach(() => { vi.restoreAllMocks(); });

describe("rebuild IDE workspace", () => {
  it("opens a selected folder, drills into a file, edits and verifies original save", async () => {
    const access = accessFixture();
    render(<IdeWorkspace access={access} />);
    expect(screen.getByText("Select a file to inspect")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open folder/ }));
    await waitFor(() => expect(screen.getByText("src")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /src/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /main.ts/ })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /main.ts/ }));
    const editor = await screen.findByRole("textbox", { name: /Code editor/ });
    fireEvent.change(editor, { target: { value: "const value = 2;\n" } });
    expect(screen.getByRole("button", { name: /●.*main.ts/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(access.saveFile).toHaveBeenCalledWith(document, document.content, "const value = 2;\n"));
    expect(access.saved).toEqual(["const value = 2;\n"]);
  });

  it("keeps read-only native drafts explicit and exports instead of pretending to save", async () => {
    const access = accessFixture();
    const nativeDocument = { ...document, origin: "native" as const, saveMode: "copy" as const };
    access.readFile = vi.fn(async () => nativeDocument);
    render(<IdeWorkspace access={access} />);
    fireEvent.click(screen.getByRole("button", { name: /Open folder/ }));
    await waitFor(() => expect(screen.getByText("src")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /src/ }));
    fireEvent.click(await screen.findByRole("button", { name: /main.ts/ }));
    await screen.findByRole("textbox", { name: /Code editor/ });
    expect(screen.getByRole("button", { name: "Export copy" })).toBeInTheDocument();
    expect(screen.getByText(/Read grant active/)).toBeInTheDocument();
  });

  it("filters and searches content without injecting markup", async () => {
    const access = accessFixture();
    render(<IdeWorkspace access={access} />);
    fireEvent.click(screen.getByRole("button", { name: /Open folder/ }));
    await waitFor(() => expect(screen.getByText("src")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /src/ }));
    fireEvent.click(await screen.findByRole("button", { name: /main.ts/ }));
    await screen.findByRole("textbox", { name: /Code editor/ });
    fireEvent.change(screen.getByRole("textbox", { name: "Filter files" }), { target: { value: "main" } });
    expect(screen.getAllByRole("button", { name: /main.ts/ }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("<script>", { exact: false })).not.toBeInTheDocument();
  });
});
