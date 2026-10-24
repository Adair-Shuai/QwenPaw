import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import LocalAvatarPicker from "./LocalAvatarPicker";
import { avatarApi } from "../api/modules/avatars";
import { useLocalAvatar } from "../stores/localAvatarStore";
vi.hoisted(() => vi.stubEnv("BASE_URL", "/qwenpaw/"));
afterAll(() => vi.unstubAllEnvs());

vi.mock("../api/modules/avatars", () => ({
  avatarApi: {
    get: vi.fn(),
    select: vi.fn(),
    upload: vi.fn(),
    image: vi.fn(),
  },
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../components/interaction/SharedModal", () => ({
  SharedModal: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
}));
beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:gif");
  URL.revokeObjectURL = vi.fn();
  useLocalAvatar.getState().reset();
  vi.mocked(avatarApi.get).mockResolvedValue({ selected: null, history: [] });
  const history = [{ id: "gif", mime: "image/gif", created_at: "2026-09-22" }];
  vi.mocked(avatarApi.upload).mockResolvedValue({ selected: "gif", history });
  vi.mocked(avatarApi.select).mockResolvedValue({ selected: null, history });
  vi.mocked(avatarApi.image).mockResolvedValue(new Blob(["GIF89a"]));
});
it("offers both built-in avatars and restores a saved choice without fetching a private image", async () => {
  const profile = { selected: "builtin:ugsci-cute", history: [] };
  vi.mocked(avatarApi.select).mockResolvedValue(profile);
  const view = render(<LocalAvatarPicker />);
  fireEvent.click(screen.getByRole("button", { name: "sidebar.changeAvatar" }));
  const cute = await screen.findByRole("button", {
    name: "sidebar.cuteAvatar",
  });
  await waitFor(() => expect(cute).toBeEnabled());
  expect(cute.querySelector("img")).toHaveAttribute(
    "src",
    `${import.meta.env.BASE_URL}ugsci-avatar-cute.webp`,
  );
  expect(
    screen
      .getByRole("button", { name: "sidebar.defaultAvatar" })
      .querySelector("img"),
  ).toHaveAttribute("src", `${import.meta.env.BASE_URL}ugsci-avatar.webp`);
  fireEvent.click(cute);
  await waitFor(() => expect(cute).toHaveAttribute("aria-pressed", "true"));
  expect(avatarApi.select).toHaveBeenCalledWith("builtin:ugsci-cute");
  expect(avatarApi.upload).not.toHaveBeenCalled();
  expect(avatarApi.image).not.toHaveBeenCalled();
  useLocalAvatar.getState().reset();
  vi.mocked(avatarApi.get).mockResolvedValue(profile);
  await useLocalAvatar.getState().load();
  expect(useLocalAvatar.getState().selected).toBe("builtin:ugsci-cute");
  expect(useLocalAvatar.getState().history).toEqual([]);
  view.unmount();
});
it("keeps uploaded GIF bytes instead of flattening animation through canvas", async () => {
  const gif = readFileSync("public/qwenpaw-avatar.gif");
  const view = render(<LocalAvatarPicker />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "sidebar.changeAvatar" }));
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "sidebar.uploadAvatar" }),
    ).toBeEnabled(),
  );
  expect(
    screen
      .getByRole("button", { name: "sidebar.defaultAvatar" })
      .querySelector("img"),
  ).toHaveAttribute("src", `${import.meta.env.BASE_URL}ugsci-avatar.webp`);
  const file = new File([gif], "mascot.gif", { type: "image/gif" });
  fireEvent.change(view.container.querySelector('input[type="file"]')!, {
    target: { files: [file] },
  });
  await waitFor(() => expect(useLocalAvatar.getState().selected).toBe("gif"));
  expect(avatarApi.upload).toHaveBeenCalledWith(file);
  fireEvent.click(
    screen.getByRole("button", { name: "sidebar.defaultAvatar" }),
  );
  await waitFor(() => expect(useLocalAvatar.getState().selected).toBeNull());
  expect(useLocalAvatar.getState().history).toHaveLength(1);
});
