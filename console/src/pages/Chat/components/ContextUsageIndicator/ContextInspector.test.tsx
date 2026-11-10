import { useState, type ReactElement } from "react";
import { ConfigProvider } from "antd";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { renderWithProviders } from "@/test/common_setup";
import { OverlayVisibilityProvider } from "@/contexts/OverlayVisibilityContext";
import { useTurnUsageStore } from "../../turnUsageStore";
import ContextUsageIndicator from "./ContextUsageIndicator";
import type { ContextInspectorProps, ContextInspectorSource } from "./types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "chat.contextInspector.remove")
        return `Remove ${options?.title}`;
      if (key === "chat.contextInspector.removed")
        return `Removed ${options?.title}`;
      return key;
    },
  }),
}));

const quote: ContextInspectorSource = {
  id: "quote-1",
  kind: "quote",
  title: "Quoted analysis",
  content: "Keep the original conclusion.\n<img src=x onerror=alert(1)>",
  detail: "Answer 12",
  status: "pending",
  removable: true,
};

const savedSource: ContextInspectorSource = {
  id: "rule-1",
  kind: "rule",
  title: "Saved project rules",
  content: "Preserve input units.",
  status: "included",
  // A server-provided editable flag must never make recorded data editable.
  removable: true,
};

function renderWithTheme(ui: ReactElement) {
  const wrap = (element: ReactElement) => (
    <ConfigProvider theme={{ token: { motion: false } }}>
      {element}
    </ConfigProvider>
  );
  const view = renderWithProviders(wrap(ui));
  return {
    ...view,
    rerender: (element: ReactElement) => view.rerender(wrap(element)),
  };
}

function renderInspector(props: ContextInspectorProps = {}) {
  return renderWithTheme(
    <ContextUsageIndicator
      showValue
      onCompact={vi.fn()}
      onNew={vi.fn()}
      {...props}
    />,
  );
}

async function openInspector() {
  const trigger = screen.getByRole("button", {
    name: "chat.turnUsagePopover.ariaLabel",
  });
  fireEvent.click(trigger);
  const panel = await screen.findByRole("dialog", {
    name: "chat.contextInspector.title",
  });
  await waitFor(() => expect(panel).toBeVisible());
  return { trigger, panel };
}

function showSaved() {
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "latest" },
  });
}

beforeEach(() => {
  useTurnUsageStore.setState({
    activeMaxInputLength: 100000,
    snapshot: {
      context_usage: {
        estimated_tokens: 24000,
        max_input_length: 100000,
        context_usage_ratio: 24,
      },
      usage: {
        session_cache_observed: true,
        session_cache_hit_rate: 94,
        session_cache_read_tokens: 940,
        session_cache_eligible_input_tokens: 1000,
      },
    },
  });
});

afterEach(() => {
  cleanup();
  useTurnUsageStore.setState({ snapshot: null, activeMaxInputLength: null });
});

describe("Context inspector popover", () => {
  it("opens from the existing dial on click and preserves usage and cache details", async () => {
    const inspect = vi.fn();
    const changed = vi.fn();
    renderInspector({ onInspect: inspect, onOpenChange: changed });
    const trigger = screen.getByRole("button");
    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const { panel } = await openInspector();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveTextContent("9424%");
    expect(within(panel).getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "24",
    );
    fireEvent.click(screen.getByText("chat.contextInspector.usageDetails"));
    expect(screen.getByText("chat.turnUsagePopover.cacheLabel")).toBeVisible();
    expect(screen.getByText("94%")).toBeVisible();
    expect(inspect).toHaveBeenCalledOnce();
    expect(changed).toHaveBeenLastCalledWith(true);
    expect(screen.getByText("chat.contextInspector.emptyDraft")).toBeVisible();
    expect(
      screen.getByText("chat.contextInspector.sourcesNotice"),
    ).toBeVisible();
  });

  it("previews supplied draft text and delegates removal and undo without changing saved sources", async () => {
    const remove = vi.fn();
    const undo = vi.fn();
    function ComposerHarness() {
      const [sources, setSources] = useState([quote]);
      const [removed, setRemoved] = useState<ContextInspectorSource | null>(
        null,
      );
      return (
        <ContextUsageIndicator
          showValue
          onCompact={vi.fn()}
          onNew={vi.fn()}
          draftSources={sources}
          details={{ sources: [savedSource] }}
          removedSource={removed}
          onRemoveSource={(id) => {
            remove(id);
            setSources([]);
            setRemoved(quote);
          }}
          onUndoRemove={() => {
            undo();
            setSources([quote]);
            setRemoved(null);
          }}
        />
      );
    }
    renderWithTheme(<ComposerHarness />);
    const { panel } = await openInspector();
    fireEvent.click(screen.getByText(quote.title));
    expect(screen.getByText(quote.content!.replace(/\s+/g, " "))).toBeVisible();
    expect(panel.querySelector("img")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: `Remove ${quote.title}` }),
    );
    expect(remove).toHaveBeenCalledWith(quote.id);
    expect(screen.queryByText(quote.title)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "chat.contextInspector.undo" }),
    );
    expect(undo).toHaveBeenCalledOnce();
    expect(screen.getByText(quote.title)).toBeVisible();
    showSaved();
    expect(screen.getByText(savedSource.title)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /^Remove / }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "chat.contextInspector.undo" }),
    ).not.toBeInTheDocument();
  });

  it("shows recorded evidence and the exact stored summary without inventing rule or memory inclusion", async () => {
    const summary =
      "## Confirmed objective\n<script>not executed</script>\nKeep 0 values.";
    renderInspector({
      details: {
        sources: [
          savedSource,
          {
            id: "memory",
            kind: "memory",
            title: "Memory loading record",
            status: "unknown",
          },
          {
            id: "workspace",
            kind: "other",
            title: "Project directory",
            status: "accessible",
          },
        ],
        summary: {
          content: summary,
          updatedAt: "2026-11-06 14:32",
          notice: "Saved after the last completed turn.",
        },
        notice: "Only records saved for this conversation.",
      },
    });
    const { panel } = await openInspector();
    showSaved();
    expect(
      screen.getByText("chat.contextInspector.status.unknown"),
    ).toBeVisible();
    expect(
      screen.getByText("chat.contextInspector.status.accessible"),
    ).toBeVisible();
    expect(
      screen.getAllByText("chat.contextInspector.status.included"),
    ).toHaveLength(1);
    expect(
      screen.getByText("Only records saved for this conversation."),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("tab", { name: "chat.contextInspector.summary" }),
    );
    expect(screen.getByText(summary.replace(/\s+/g, " "))).toBeVisible();
    expect(screen.getByText("2026-11-06 14:32")).toBeVisible();
    expect(panel.querySelector("script")).toBeNull();
    expect(
      screen.getByText("Saved after the last completed turn."),
    ).toBeVisible();
  });

  it("keeps drafts available during remote loading and replaces stale records with retryable errors", async () => {
    const retry = vi.fn();
    const props = {
      draftSources: [quote],
      details: { sources: [savedSource] },
      onRetry: retry,
    };
    const view = renderInspector({ ...props, detailsLoading: true });
    await openInspector();
    expect(screen.getByText(quote.title)).toBeVisible();
    showSaved();
    expect(screen.getByRole("status")).toHaveTextContent(
      "chat.contextInspector.loading",
    );
    expect(screen.queryByText(savedSource.title)).not.toBeInTheDocument();
    view.rerender(
      <ContextUsageIndicator
        {...props}
        showValue
        onCompact={vi.fn()}
        onNew={vi.fn()}
        detailsError="Record could not be read."
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Record could not be read.",
    );
    expect(screen.queryByText(savedSource.title)).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "chat.contextInspector.retry" }),
    );
    expect(retry).toHaveBeenCalledOnce();
  });

  it("supports keyboard tabs and Escape, and closes on scope or containing overlay changes", async () => {
    const changed = vi.fn();
    function Inspector({
      scope = "a",
      visible = true,
    }: {
      scope?: string;
      visible?: boolean;
    }) {
      return (
        <OverlayVisibilityProvider value={visible}>
          <ContextUsageIndicator
            scopeKey={scope}
            showValue
            onCompact={vi.fn()}
            onNew={vi.fn()}
            onOpenChange={changed}
          />
        </OverlayVisibilityProvider>
      );
    }
    const view = renderWithTheme(<Inspector />);
    const { trigger, panel } = await openInspector();
    await waitFor(() => expect(panel).toHaveFocus());
    fireEvent.keyDown(
      screen.getByRole("tab", { name: "chat.contextInspector.sources" }),
      { key: "ArrowRight" },
    );
    const summaryTab = screen.getByRole("tab", {
      name: "chat.contextInspector.summary",
    });
    expect(summaryTab).toHaveAttribute("aria-selected", "true");
    expect(summaryTab).toHaveFocus();
    fireEvent.keyDown(summaryTab, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(changed).toHaveBeenLastCalledWith(false);
    await openInspector();
    view.rerender(<Inspector scope="b" />);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await openInspector();
    expect(
      screen.getByRole("tab", { name: "chat.contextInspector.sources" }),
    ).toHaveAttribute("aria-selected", "true");
    view.rerender(<Inspector scope="b" visible={false} />);
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(changed).toHaveBeenLastCalledWith(false);
  });

  it("disables compaction while executing but preserves the new conversation action", async () => {
    const compact = vi.fn();
    const newChat = vi.fn();
    renderWithTheme(
      <ContextUsageIndicator
        showValue
        executionBusy
        onCompact={compact}
        onNew={newChat}
      />,
    );
    await openInspector();
    const compactButton = screen.getByRole("button", {
      name: "chat.turnUsagePopover.compact",
    });
    expect(compactButton).toBeDisabled();
    fireEvent.click(compactButton);
    expect(compact).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "chat.turnUsagePopover.new" }),
    );
    expect(newChat).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("keeps sources usable without model capacity and distinguishes unavailable and uncompressed summaries", async () => {
    useTurnUsageStore.setState({ snapshot: null, activeMaxInputLength: null });
    const view = renderInspector({
      draftSources: [quote],
      details: { sources: [], summaryAvailable: false },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "chat.composer.contextUnavailable" }),
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText(quote.title)).toBeVisible();
    fireEvent.click(
      screen.getByRole("tab", { name: "chat.contextInspector.summary" }),
    );
    expect(
      screen.getByText("chat.contextInspector.summaryUnavailable"),
    ).toBeVisible();
    view.rerender(
      <ContextUsageIndicator
        showValue
        onCompact={vi.fn()}
        onNew={vi.fn()}
        details={{
          sources: [],
          summary: {
            content: "",
            notice: "This older conversation has no saved summary.",
          },
        }}
      />,
    );
    expect(
      screen.getByText("This older conversation has no saved summary."),
    ).toBeVisible();
  });
});
