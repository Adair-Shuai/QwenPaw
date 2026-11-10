import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import { NavigationGuard } from "./NavigationGuard";

afterEach(cleanup);

function Probe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output>{location.pathname + location.search + location.hash}</output>
      <button
        onClick={() =>
          navigate("/settings/general?tab=中文#field", {
            state: { draft: "kept" },
          })
        }
      >
        Push
      </button>
      <button onClick={() => navigate("/chat?from=flow", { replace: true })}>
        Replace
      </button>
      <button onClick={() => navigate(-1)}>Back</button>
      <pre>{JSON.stringify(location.state)}</pre>
    </>
  );
}

describe("workbench navigation protection", () => {
  it("guards real BrowserRouter-compatible pushes and retries exactly once with original state", () => {
    let retry: () => void = () => {};
    const listener = (event: Event) => {
      const guard = event as CustomEvent<{ to: string; retry: () => void }>;
      if (guard.detail.to.startsWith("history:")) return;
      expect(guard.detail.to).toBe("/settings/general?tab=中文#field");
      event.preventDefault();
      retry = guard.detail.retry;
    };
    window.addEventListener("qwenpaw:before-navigate", listener);
    try {
      render(
        <MemoryRouter initialEntries={["/flowforge?flow=example"]}>
          <NavigationGuard />
          <Probe />
        </MemoryRouter>,
      );
      fireEvent.click(screen.getByText("Push"));
      expect(screen.getByRole("status")).toHaveTextContent(
        "/flowforge?flow=example",
      );
      act(() => {
        retry();
        retry();
      });
      expect(screen.getByRole("status")).toHaveTextContent(
        "/settings/general?tab=中文#field",
      );
      expect(screen.getByText('{"draft":"kept"}')).toBeVisible();
      fireEvent.click(screen.getByText("Back"));
      expect(screen.getByRole("status")).toHaveTextContent(
        "/flowforge?flow=example",
      );
    } finally {
      window.removeEventListener("qwenpaw:before-navigate", listener);
    }
  });

  it("preserves replace semantics and invalidates a pending retry on unmount", () => {
    let retry: () => void = () => {};
    let shouldBlock = true;
    const listener = (event: Event) => {
      const guard = event as CustomEvent<{ retry: () => void }>;
      if ((event as CustomEvent<{ method: string }>).detail.method === "go")
        return;
      if (shouldBlock) {
        event.preventDefault();
        retry = guard.detail.retry;
      }
    };
    window.addEventListener("qwenpaw:before-navigate", listener);
    try {
      const view = render(
        <MemoryRouter
          initialEntries={["/origin", "/flowforge"]}
          initialIndex={1}
        >
          <NavigationGuard />
          <Probe />
        </MemoryRouter>,
      );
      fireEvent.click(screen.getByText("Replace"));
      expect(screen.getByRole("status")).toHaveTextContent("/flowforge");
      act(() => retry());
      expect(screen.getByRole("status")).toHaveTextContent("/chat?from=flow");
      fireEvent.click(screen.getByText("Back"));
      expect(screen.getByRole("status")).toHaveTextContent("/origin");
      fireEvent.click(screen.getByText("Replace"));
      view.rerender(
        <MemoryRouter>
          <Probe />
        </MemoryRouter>,
      );
      act(() => retry());
      expect(screen.getByRole("status")).toHaveTextContent("/origin");
      shouldBlock = false;
      fireEvent.click(screen.getByText("Replace"));
      expect(screen.getByRole("status")).toHaveTextContent("/chat?from=flow");
    } finally {
      window.removeEventListener("qwenpaw:before-navigate", listener);
    }
  });
});
