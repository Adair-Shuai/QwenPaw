import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { type ReactNode, createContext, useState } from "react";
import { App } from "antd";
import type { PendingApproval } from "../api/modules/console";

const ApprovalContext = createContext<{
  approvals: PendingApproval[];
  setApprovals: (approvals: PendingApproval[]) => void;
}>({
  approvals: [],
  setApprovals: () => {},
});

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: MemoryRouterProps["initialEntries"];
}

function AllProviders({
  children,
  routerProps,
}: {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
}) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  return (
    <ApprovalContext.Provider value={{ approvals, setApprovals }}>
      <App>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </App>
    </ApprovalContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries = ["/chat"],
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllProviders routerProps={{ initialEntries }}>{children}</AllProviders>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
