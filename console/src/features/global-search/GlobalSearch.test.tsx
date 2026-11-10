import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import GlobalSearch from "./GlobalSearch";
import { SearchTrigger } from "./SearchTrigger";
import { request } from "../../api/request";
import { useAgentStore } from "../../stores/agentStore";
import { searchWorkspace } from "./search";

vi.mock("../../api/request", () => ({ request: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
const chat = {
  id: "chat-a",
  session_id: "runtime-a",
  name: "Release plan",
  updated_at: "2026-11-06",
  created_at: "2026-11-05",
};
const mocked = vi.mocked(request);
function Location() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}
function mount() {
  return render(
    <MemoryRouter initialEntries={["/chat/draft"]}>
      <textarea aria-label="draft" defaultValue="Keep my draft" />
      <SearchTrigger />
      <GlobalSearch />
      <Location />
    </MemoryRouter>,
  );
}
beforeEach(() => {
  useAgentStore.setState({ selectedAgent: "expert-a", agents: [] });
  mocked.mockImplementation(async (path) => {
    if (path.startsWith("/chats?")) return [chat];
    if (path.startsWith("/chats/"))
      return {
        messages: [
          {
            id: "msg-a",
            role: "assistant",
            content: [{ type: "text", text: "Release evidence and details" }],
          },
        ],
      };
    return {
      turns: [
        {
          id: "turn-a",
          response_id: "response-a",
          started_at: "2026-11-06",
          files: [
            {
              id: "file-a",
              name: "release.pdf",
              path: "reports/release.pdf",
              delivered: true,
            },
            {
              id: "file-b",
              name: "notes.txt",
              path: "notes.txt",
              delivered: false,
            },
          ],
        },
      ],
    };
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("searches real scoped APIs from the mounted dialog and opens an exact message without changing the draft", async () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "globalSearch.title" }));
  const input = await screen.findByRole("combobox", {
    name: "globalSearch.placeholder",
  });
  fireEvent.change(input, { target: { value: "evidence" } });
  const option = await screen.findByRole("option", { name: /Release plan/ });
  expect(option.querySelector("strong")).toHaveTextContent(
    "Release evidence and details",
  );
  expect(option.querySelector("small")).toHaveTextContent(
    "globalSearch.assistant · Release plan",
  );
  expect(
    within(option).getByText(/evidence/, { selector: "mark" }),
  ).toBeInTheDocument();
  expect(
    mocked.mock.calls.every(
      ([, options]) =>
        (options?.headers as Record<string, string>)["X-Agent-Id"] ===
        "expert-a",
    ),
  ).toBe(true);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(screen.getByTestId("location").textContent).toBe(
    "/chat/chat-a?agent=expert-a&searchMessage=msg-a",
  );
  expect(screen.getByRole("textbox", { name: "draft" })).toHaveValue(
    "Keep my draft",
  );
});

it("cancels obsolete searches and keeps the query when reopening with the keyboard", async () => {
  let resolveOld!: (value: unknown) => void;
  let oldSignal: AbortSignal | undefined;
  mocked.mockImplementation((path, options) => {
    if (path.startsWith("/chats?")) {
      oldSignal = options?.signal as AbortSignal;
      return new Promise((resolve) => {
        resolveOld = resolve;
      });
    }
    return Promise.resolve({ messages: [], turns: [] });
  });
  mount();
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });
  const input = await screen.findByRole("combobox", {
    name: "globalSearch.placeholder",
  });
  fireEvent.change(input, { target: { value: "old" } });
  await waitFor(() => expect(resolveOld).toBeDefined());
  const resolve = resolveOld;
  const signal = oldSignal;
  fireEvent.change(input, { target: { value: "new" } });
  expect(signal?.aborted).toBe(true);
  await act(async () => resolve([{ ...chat, name: "old result" }]));
  expect(screen.queryByText("old result")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(window, { key: "k", metaKey: true });
  expect(
    await screen.findByRole("combobox", { name: "globalSearch.placeholder" }),
  ).toHaveValue("new");
});

it("searches immutable delivery records and reports partial failures instead of an empty success", async () => {
  const snapshots: Parameters<
    Parameters<typeof searchWorkspace>[0]["onProgress"]
  >[0][] = [];
  await searchWorkspace({
    query: "release",
    agentId: "expert-b",
    kind: "artifact",
    archived: true,
    days: 0,
    limit: 100,
    signal: new AbortController().signal,
    onProgress: (value) => snapshots.push(value),
  });
  expect(snapshots[snapshots.length - 1]?.results[0]).toMatchObject({
    kind: "artifact",
    title: "release.pdf",
    agentId: "expert-b",
    messageId: "response-a",
  });
  expect(
    mocked.mock.calls.some(([url]) =>
      url.includes("session_id=runtime-a&chat_id=chat-a"),
    ),
  ).toBe(true);
  mocked.mockImplementation(async (path) => {
    if (path.startsWith("/chats?")) return [chat];
    throw new Error("offline");
  });
  await searchWorkspace({
    query: "release",
    agentId: "expert-b",
    kind: "all",
    archived: false,
    days: 0,
    limit: 100,
    signal: new AbortController().signal,
    onProgress: (value) => snapshots.push(value),
  });
  expect(snapshots[snapshots.length - 1]).toMatchObject({
    failed: 2,
    scanned: 1,
  });
});

it("locates a loaded message only inside the target agent and chat", async () => {
  const scroll = vi.fn();
  HTMLElement.prototype.scrollIntoView = scroll;
  render(
    <MemoryRouter
      initialEntries={["/chat/chat-a?agent=expert-a&searchMessage=msg-a"]}
    >
      <div
        data-global-search-chat="wrong-chat"
        data-global-search-agent="expert-a"
      >
        <p data-global-search-message="msg-a">Wrong</p>
      </div>
      <div data-global-search-chat="chat-a" data-global-search-agent="expert-a">
        <p data-global-search-message="msg-a">Right</p>
      </div>
      <GlobalSearch />
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByText("Right")).toHaveAttribute(
      "data-global-search-highlight",
      "true",
    ),
  );
  expect(screen.getByText("Wrong")).not.toHaveAttribute(
    "data-global-search-highlight",
  );
  expect(scroll).toHaveBeenCalled();
});

it("filters delivery results and exposes a recoverable list error in the mounted dialog", async () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "globalSearch.title" }));
  fireEvent.change(
    await screen.findByRole("combobox", { name: "globalSearch.placeholder" }),
    { target: { value: "release" } },
  );
  fireEvent.click(screen.getByRole("tab", { name: "globalSearch.artifact" }));
  expect(
    await screen.findByRole("option", { name: /release.pdf/ }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: /Release plan/ }),
  ).not.toBeInTheDocument();
  fireEvent.change(
    screen.getByRole("combobox", { name: "globalSearch.placeholder" }),
    { target: { value: "" } },
  );
  expect(
    await screen.findByRole("option", { name: /release.pdf/ }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: /Release plan/ }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "globalSearch.message" }));
  expect(
    await screen.findByRole("option", { name: /Release evidence and details/ }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: "globalSearch.file" }));
  expect(
    await screen.findByRole("option", { name: /notes.txt/ }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: /release.pdf/ }),
  ).not.toBeInTheDocument();
  fireEvent.change(
    screen.getByRole("combobox", { name: "globalSearch.placeholder" }),
    { target: { value: "release" } },
  );
  expect(
    screen.queryByRole("checkbox", { name: "globalSearch.archived" }),
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "globalSearch.filters" }));
  expect(
    screen.getByRole("button", { name: "globalSearch.filters" }),
  ).toHaveAttribute("aria-expanded", "true");
  mocked.mockRejectedValue(new Error("offline"));
  fireEvent.click(
    screen.getByRole("checkbox", { name: "globalSearch.archived" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "globalSearch.error",
  );
  mocked.mockResolvedValue([]);
  fireEvent.click(screen.getByRole("button", { name: "globalSearch.retry" }));
  await waitFor(() =>
    expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
  );
  expect(mocked).toHaveBeenLastCalledWith(
    "/chats?include_app_owned=false",
    expect.anything(),
  );
});
