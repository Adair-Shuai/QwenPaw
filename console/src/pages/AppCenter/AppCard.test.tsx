// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppCard, type AppCardData } from "./AppCard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

function makeApp(overrides: Partial<AppCardData> = {}): AppCardData {
  return {
    id: "demo-app",
    name: "Demo App",
    version: "1.2.3",
    description: "A demo app",
    category: "tools",
    icon: "🎮",
    entry_page: "/apps/demo-app",
    launch_scope: "page",
    status: "active",
    ...overrides,
  };
}

describe("AppCard", () => {
  it.each([
    "storage-capacity",
    "wellbore-pressure",
    "document-forms",
    "uproject",
    "ulit",
    "uideas",
  ])("uses the original themed artwork for %s", (id) => {
    const { container } = render(
      <AppCard app={makeApp({ id })} onClick={vi.fn()} />,
    );
    const icon = container.querySelector<HTMLElement>(
      `[data-ugsci-app-icon="${id}"]`,
    );
    expect(icon).toBeInTheDocument();
    expect(icon?.style.maskImage).toMatch(/^url\(/);
    expect(icon?.style.backgroundColor).toBe("currentcolor");
    expect(
      container.querySelector("svg.lucide-app-window"),
    ).not.toBeInTheDocument();
  });

  it("uses a Lucide fallback when no image icon is available", () => {
    render(<AppCard app={makeApp()} onClick={vi.fn()} />);

    expect(screen.queryByText("🎮")).not.toBeInTheDocument();
    expect(document.querySelector("svg.lucide-app-window")).toBeInTheDocument();
    expect(screen.getByText("Demo App")).toBeInTheDocument();
  });

  it("prefers the image icon over the emoji glyph", () => {
    render(
      <AppCard
        app={makeApp({ icon_url: "/icons/demo.png" })}
        onClick={vi.fn()}
      />,
    );

    expect(screen.queryByText("🎮")).not.toBeInTheDocument();
  });

  it("opens the app when the card body is clicked", () => {
    const onClick = vi.fn();
    render(<AppCard app={makeApp()} onClick={onClick} />);

    fireEvent.click(screen.getByText("Demo App"));

    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "demo-app",
      }),
    );
  });

  it.each(["Enter", " "])("opens the app with the %s key", (key) => {
    const onClick = vi.fn();
    render(<AppCard app={makeApp()} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole("button", { name: "Demo App" }), {
      key,
    });

    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "demo-app" }),
    );
  });

  it("opens the app from the card action", () => {
    const onClick = vi.fn();
    const onUninstall = vi.fn();
    render(
      <AppCard app={makeApp()} onClick={onClick} onUninstall={onUninstall} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "appCenter.openApp" }));

    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "demo-app" }),
    );
    expect(onUninstall).not.toHaveBeenCalled();
  });

  it("triggers uninstall from the menu without opening the app", async () => {
    const onClick = vi.fn();
    const onUninstall = vi.fn();
    render(
      <AppCard app={makeApp()} onClick={onClick} onUninstall={onUninstall} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "appCenter.moreActions" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "appCenter.uninstall" }),
    );

    expect(onUninstall).toHaveBeenCalledWith(
      expect.objectContaining({ id: "demo-app" }),
    );
    expect(onClick).not.toHaveBeenCalled();
  });

  it("hides uninstall when it is not available but keeps open available", () => {
    render(<AppCard app={makeApp()} onClick={vi.fn()} />);

    expect(
      screen.queryByRole("button", { name: "appCenter.uninstall" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "appCenter.openApp" }),
    ).toBeInTheDocument();
  });
  it.each(["failed", "disabled", "pending"])(
    "keeps %s apps inspectable without opening them",
    async (status) => {
      const onClick = vi.fn();
      const onUninstall = vi.fn();
      render(
        <AppCard
          app={makeApp({
            status,
            loaded: false,
            enabled: status !== "disabled",
            diagnostics: ["App is unavailable"],
          })}
          onClick={onClick}
          onUninstall={onUninstall}
        />,
      );
      const card = screen.getByRole("button", { name: "Demo App" });
      fireEvent.click(card);
      fireEvent.keyDown(card, { key: "Enter" });
      expect(onClick).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "appCenter.openApp" }),
      ).toBeDisabled();
      expect(screen.getByText("App is unavailable")).toBeVisible();
      fireEvent.click(
        screen.getByRole("button", { name: "appCenter.moreActions" }),
      );
      fireEvent.click(await screen.findByText("appCenter.uninstall"));
      expect(onUninstall).toHaveBeenCalledWith(
        expect.objectContaining({ status }),
      );
    },
  );
});
