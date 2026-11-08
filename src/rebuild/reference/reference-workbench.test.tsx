import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReferenceWorkbench } from "./reference-workbench";

describe("ReferenceWorkbench", () => {
  it("renders reviewed observations and an explicit synthesis decision", () => {
    render(<ReferenceWorkbench />);
    expect(screen.getByRole("heading", { name: "Reference workbench" })).toBeInTheDocument();
    expect(screen.getAllByText("Codex session continuity").length).toBeGreaterThan(0);
    expect(screen.getByText("Omnia decision")).toBeInTheDocument();
    expect(screen.getByText(/Represent a session as durable state/)).toBeInTheDocument();
  });

  it("filters by area and searches without losing provenance", () => {
    render(<ReferenceWorkbench />);
    fireEvent.click(screen.getByRole("button", { name: /Browser harness/ }));
    expect(screen.getByText("Chrome CDP tab protocol")).toBeInTheDocument();
    expect(screen.queryByText("Codex session continuity")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Search observations" }), { target: { value: "stale" } });
    fireEvent.click(screen.getByRole("button", { name: /Chrome CDP tab protocol/ }));
    expect(screen.getByText(/Tab switch, navigation, release/)).toBeInTheDocument();
    expect(screen.getByText("browser/chrome-canary/src/cdp-client.ts")).toBeInTheDocument();
  });

  it("supports keyboard-usable row selection and held-out filtering", () => {
    render(<ReferenceWorkbench />);
    const row = screen.getByRole("button", { name: /Assistant UI primitive model/ });
    row.focus();
    expect(row).toHaveFocus();
    fireEvent.click(row);
    expect(screen.getByText(/Use the interaction taxonomy only/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Hide held-out references"));
    expect(screen.queryByText("Assistant UI primitive model")).not.toBeInTheDocument();
  });

  it("clears an unmatched search", () => {
    render(<ReferenceWorkbench />);
    fireEvent.change(screen.getByRole("textbox", { name: "Search observations" }), { target: { value: "does-not-exist" } });
    expect(screen.getByText("No observed contract matches this filter.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getAllByText("Codex session continuity").length).toBeGreaterThan(0);
  });
});
