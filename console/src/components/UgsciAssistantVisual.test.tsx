import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { UgsciAssistantVisual } from "./UgsciAssistantVisual";

afterEach(() => vi.restoreAllMocks());

it("replaces animated SVG images immediately when the system motion preference changes", () => {
  let reduced = false;
  const media = new EventTarget();
  Object.defineProperty(media, "matches", { get: () => reduced });
  const remove = vi.spyOn(media, "removeEventListener");
  vi.spyOn(window, "matchMedia").mockReturnValue(
    media as unknown as MediaQueryList,
  );
  const { container, rerender, unmount } = render(
    <UgsciAssistantVisual state="thinking" />,
  );
  const image = () => container.querySelector("img");
  expect(image()).toHaveAttribute(
    "src",
    "/ugsci-mono/assistant/motion/thinking.svg",
  );

  act(() => {
    reduced = true;
    media.dispatchEvent(new Event("change"));
  });
  expect(image()).toHaveAttribute(
    "src",
    "/ugsci-mono/assistant/states/thinking.svg",
  );
  rerender(<UgsciAssistantVisual state="tool-running" />);
  expect(image()).toHaveAttribute(
    "src",
    "/ugsci-mono/assistant/states/tool-running.svg",
  );

  act(() => {
    reduced = false;
    media.dispatchEvent(new Event("change"));
  });
  expect(image()).toHaveAttribute(
    "src",
    "/ugsci-mono/assistant/motion/tool-running.svg",
  );
  unmount();
  expect(remove).toHaveBeenCalledWith("change", expect.any(Function));
});
