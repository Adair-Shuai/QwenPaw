import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, type MemoryRouterProps } from "react-router-dom";
import { type ReactNode, createContext, useState } from "react";
import { App } from "antd";
import type { PendingApproval } from "../api/modules/console";
import { AuthStatusProvider } from "@/contexts/AuthStatusContext";

const ApprovalContext = createContext<{
  approvals: PendingApproval[];
  setApprovals: (approvals: PendingApproval[]) => void;
}>({
  approvals: [],
  setApprovals: () => {},
});

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  initialEntries?: MemoryRouterProps["initialEntries"];
  authEnabled?: boolean;
}

function AllProviders({
  children,
  routerProps,
  authEnabled = false,
}: {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
  authEnabled?: boolean;
}) {
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  return (
    <ApprovalContext.Provider value={{ approvals, setApprovals }}>
      <AuthStatusProvider
        value={{ enabled: authEnabled, has_users: authEnabled }}
      >
        <App>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </App>
      </AuthStatusProvider>
    </ApprovalContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    initialEntries = ["/chat"],
    authEnabled = false,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllProviders routerProps={{ initialEntries }} authEnabled={authEnabled}>
        {children}
      </AllProviders>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
