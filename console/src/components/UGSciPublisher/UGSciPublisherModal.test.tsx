import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  status: vi.fn(),
  inspect: vi.fn(),
  publish: vi.fn(),
  upload: vi.fn(),
  message: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/api/modules/publisher", () => ({
  fetchPublisherStatus: mocks.status,
  inspectInstalledAsset: mocks.inspect,
  publishInstalledAsset: mocks.publish,
  uploadPublishArchive: mocks.upload,
}));
vi.mock("@/hooks/useAppMessage", () => ({
  useAppMessage: () => ({ message: mocks.message }),
}));
vi.mock("@/api/modules/plugin", () => ({ fetchPlugins: async () => [] }));
vi.mock("@/api/modules/pawapp", () => ({
  pawappApi: {
    list: async () => ({
      apps: [{ id: "alice-demo", name: "测试应用", version: "1.0.0" }],
    }),
  },
}));
import { UGSciPublisherModal } from "./UGSciPublisherModal";

const inspection = {
  plugin_id: "alice-demo",
  name: "测试应用",
  version: "1.0.0",
  asset_kind: "app",
  catalog_kind: "apps",
  file_count: 2,
  source_size_bytes: 100,
  warnings: [],
  blockers: [],
};

describe("UGSci application publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.status.mockResolvedValue({
      direct_publish_configured: false,
      submission_configured: true,
      max_archive_mb: 256,
    });
    mocks.inspect.mockResolvedValue(inspection);
    mocks.publish.mockResolvedValue({
      ...inspection,
      status: "submitted",
      sha256: "verified-digest",
      remote: {
        receipt_id: "alice/app/alice-demo/1.0.0",
        object_key:
          "publisher-private/submissions/alice/app/alice-demo/1.0.0.zip",
      },
    });
  });
  afterEach(cleanup);

  it("requires package inspection and consent before upload then shows the OSS receipt", async () => {
    render(<UGSciPublisherModal open kind="app" onClose={() => {}} />);
    const submit = await screen.findByRole("button", { name: "提交审核" });
    expect(submit).toBeDisabled();
    fireEvent.change(screen.getByLabelText("投稿凭证"), {
      target: { value: "temporary-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: "检查发布包" }));
    await waitFor(() =>
      expect(mocks.inspect).toHaveBeenCalledWith({
        pluginId: "alice-demo",
        kind: "app",
      }),
    );
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    await waitFor(() => expect(submit).toBeEnabled());
    fireEvent.click(submit);
    await screen.findByText("已上传 OSS，等待管理员审核");
    expect(mocks.publish).toHaveBeenCalledWith({
      pluginId: "alice-demo",
      kind: "app",
      mode: "submission",
      token: "temporary-token",
    });
    expect(
      screen.getByText("回执：alice/app/alice-demo/1.0.0"),
    ).toBeInTheDocument();
    expect(localStorage.getItem("temporary-token")).toBeNull();
  });

  it("keeps local preparation distinct from a remote submission and clears the temporary token", async () => {
    mocks.status.mockResolvedValue({
      direct_publish_configured: false,
      submission_configured: false,
      max_archive_mb: 256,
    });
    mocks.publish.mockResolvedValue({
      ...inspection,
      status: "prepared",
      sha256: "local-digest",
    });
    const view = render(
      <UGSciPublisherModal open kind="app" onClose={() => {}} />,
    );
    await screen.findByText(/尚未配置投稿服务/);
    fireEvent.change(screen.getByLabelText("投稿凭证"), {
      target: { value: "temporary-token" },
    });
    fireEvent.click(screen.getByRole("button", { name: "检查发布包" }));
    await waitFor(() => expect(mocks.inspect).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("checkbox"));
    const prepare = screen.getByRole("button", { name: "生成标准发布包" });
    await waitFor(() => expect(prepare).toBeEnabled());
    fireEvent.click(prepare);
    await screen.findByText("仅已生成本地包，尚未上传 OSS");
    expect(
      screen.queryByText("已上传 OSS，等待管理员审核"),
    ).not.toBeInTheDocument();
    view.rerender(
      <UGSciPublisherModal open={false} kind="app" onClose={() => {}} />,
    );
    view.rerender(<UGSciPublisherModal open kind="app" onClose={() => {}} />);
    await waitFor(() =>
      expect(screen.getByLabelText("投稿凭证")).toHaveValue(""),
    );
  });
});
