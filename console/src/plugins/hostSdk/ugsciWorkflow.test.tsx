import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  TeamRunHistory,
  TeamWorkflowCard,
} from "../../../../plugins/bundle/ugsci/ui/src/team/workflow";

const idleState = {
  active: false,
  status: "idle",
  state: {},
  instance_id: null,
  error: null,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const Text = ({ children }: React.PropsWithChildren) => <span>{children}</span>;
const Paragraph = ({ children }: React.PropsWithChildren) => <p>{children}</p>;
const Button = ({
  children,
  onClick,
}: React.PropsWithChildren<{ onClick?: () => void }>) => (
  <button onClick={onClick}>{children}</button>
);
const Alert = ({
  message,
  description,
  action,
}: {
  message?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div role="alert">
    {message}
    {description}
    {action}
  </div>
);
const Empty = ({
  description,
  children,
}: React.PropsWithChildren<{ description?: React.ReactNode }>) => (
  <div>
    {description}
    {children}
  </div>
);
const Container = ({ children }: React.PropsWithChildren) => (
  <div>{children}</div>
);

let selectedAgentId = "agent-a";

function installHost(fetchMock: ReturnType<typeof vi.fn>) {
  Object.defineProperty(window, "QwenPaw", {
    configurable: true,
    value: {
      host: {
        React,
        fetch: fetchMock,
        getApiToken: () => null,
        getApiUrl: (path: string) => `/api${path}`,
        useSelectedAgent: () => ({ id: selectedAgentId }),
        antd: {
          Alert,
          Button,
          Card: Container,
          Empty,
          Spin: () => <div>loading</div>,
          Steps: () => null,
          Tag: Container,
          Typography: { Text, Paragraph },
        },
        antdIcons: {},
      },
    },
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("UGSci workflow polling", () => {
  beforeEach(() => {
    selectedAgentId = "agent-a";
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    Reflect.deleteProperty(window, "QwenPaw");
  });

  it("does not abort or duplicate a slow automatic state request", async () => {
    const pending = deferredResponse();
    let firstSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_path: string, init?: RequestInit) => {
      firstSignal ??= init?.signal ?? undefined;
      return pending.promise;
    });
    installHost(fetchMock);

    render(<TeamWorkflowCard enabled />);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstSignal?.aborted).toBe(false);

    pending.resolve(jsonResponse(idleState));
    await flushPromises();
  });

  it("shows the initial backend error detail and recovers on retry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ detail: "backend unavailable" }, 503),
      )
      .mockResolvedValueOnce(jsonResponse(idleState));
    installHost(fetchMock);

    render(<TeamWorkflowCard enabled />);
    await flushPromises();

    expect(screen.getByRole("alert")).toHaveTextContent("专家团状态加载失败");
    expect(screen.getByRole("alert")).toHaveTextContent("backend unavailable");

    fireEvent.click(screen.getByRole("button", { name: "重试" }));
    await flushPromises();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("暂无活跃的专家团工作流")).toBeInTheDocument();
  });

  it("backs off failed state polling and keeps the last successful state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(idleState))
      .mockResolvedValueOnce(jsonResponse({ detail: "temporary" }, 503))
      .mockResolvedValueOnce(jsonResponse({ detail: "temporary" }, 503))
      .mockResolvedValueOnce(jsonResponse(idleState));
    installHost(fetchMock);

    render(<TeamWorkflowCard enabled />);
    await flushPromises();
    expect(screen.getByText("暂无活跃的专家团工作流")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "状态更新失败，当前显示上次成功读取的结果",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("temporary");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("aborts the previous state request when the selected Agent changes", async () => {
    const first = deferredResponse();
    const second = deferredResponse();
    const signals: AbortSignal[] = [];
    const fetchMock = vi.fn((_path: string, init?: RequestInit) => {
      if (init?.signal) signals.push(init.signal);
      return fetchMock.mock.calls.length === 1 ? first.promise : second.promise;
    });
    installHost(fetchMock);

    const view = render(<TeamWorkflowCard enabled />);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    selectedAgentId = "agent-b";
    view.rerender(<TeamWorkflowCard enabled />);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signals[0].aborted).toBe(true);
    expect(
      new Headers(fetchMock.mock.calls[1][1]?.headers).get("X-Agent-Id"),
    ).toBe("agent-b");

    first.resolve(jsonResponse(idleState));
    second.resolve(jsonResponse(idleState));
    await flushPromises();
  });

  it("polls the active run list without replacing it with a spinner", async () => {
    const background = deferredResponse();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockImplementationOnce(() => background.promise);
    installHost(fetchMock);

    render(<TeamRunHistory activeOnly enabled />);
    await flushPromises();
    expect(screen.getByText("暂无进行中的专家团讨论")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("暂无进行中的专家团讨论")).toBeInTheDocument();
    expect(screen.queryByText("loading")).not.toBeInTheDocument();

    background.resolve(jsonResponse([]));
    await flushPromises();
  });

  it("keeps the last run list when a background refresh fails", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({ detail: "runs unavailable" }, 503));
    installHost(fetchMock);

    render(<TeamRunHistory activeOnly enabled />);
    await flushPromises();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "讨论运行记录更新失败，当前显示上次成功读取的结果",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("runs unavailable");
    expect(screen.getByText("暂无进行中的专家团讨论")).toBeInTheDocument();
  });

  it("refreshes history whenever its tab becomes enabled again", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    installHost(fetchMock);

    const view = render(<TeamRunHistory enabled={false} />);
    expect(fetchMock).not.toHaveBeenCalled();

    view.rerender(<TeamRunHistory enabled />);
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    view.rerender(<TeamRunHistory enabled={false} />);
    view.rerender(<TeamRunHistory enabled />);
    await flushPromises();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
