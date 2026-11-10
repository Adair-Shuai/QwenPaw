import type { IAgentScopeRuntimeWebUIOptions } from "@agentscope-ai/chat";

type NativeApi = IAgentScopeRuntimeWebUIOptions["api"];
type NativeFetchData = Parameters<NonNullable<NativeApi["fetch"]>>[0];
type NativeCancelData = Parameters<NonNullable<NativeApi["cancel"]>>[0];
type NativeSender = NonNullable<IAgentScopeRuntimeWebUIOptions["sender"]>;
type NativeAttachments = NonNullable<NativeSender["attachments"]>;
type UploadData = Parameters<
  NonNullable<NativeAttachments["customRequest"]>
>[0];
type NativeSession = IAgentScopeRuntimeWebUIOptions["session"];
type NativeTheme = NonNullable<IAgentScopeRuntimeWebUIOptions["theme"]>;
type NativeActions = NonNullable<IAgentScopeRuntimeWebUIOptions["actions"]>;
type NativeRequestActions = NonNullable<
  IAgentScopeRuntimeWebUIOptions["requestActions"]
>;
type CapturedAction = Omit<
  NativeActions["list"][number],
  "onClick" | "render"
> & {
  onClick?: (context: { data: CapturedWireFrame }) => void | Promise<void>;
  render?: (context: {
    data: CapturedWireFrame;
  }) => import("react").ReactElement<{ children?: import("react").ReactNode }>;
};

export interface CapturedWireFrame {
  object?: string;
  type?: string;
  role?: string;
  output?: CapturedWireFrame[];
  content?: Array<{ text?: string; type?: string; [key: string]: unknown }>;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// The mounted page fills these callback groups. Transport fixtures also exercise
// legacy calls before the SDK supplies routing identity, and unknown wire fields.
export type CapturedChatOptions = Omit<
  IAgentScopeRuntimeWebUIOptions,
  "api" | "sender" | "session" | "theme" | "actions" | "requestActions"
> & {
  api: Omit<NativeApi, "fetch" | "cancel" | "responseParser"> & {
    fetch: (
      data: Partial<Omit<NativeFetchData, "input">> & {
        input: unknown[];
        [key: string]: unknown;
      },
    ) => Promise<Response>;
    cancel: (data: Partial<NativeCancelData>) => void | Promise<void>;
    responseParser: (chunk: string) => CapturedWireFrame | null;
  };
  sender: Omit<
    NativeSender,
    "attachments" | "prefix" | "actionAffix" | "beforeSubmit"
  > & {
    prefix: import("react").ReactNode;
    actionAffix?: import("react").ReactNode;
    beforeSubmit: NonNullable<NativeSender["beforeSubmit"]>;
    attachments: Omit<NativeAttachments, "customRequest"> & {
      customRequest: (
        data: Pick<UploadData, "file"> & Partial<Omit<UploadData, "file">>,
      ) => void | Promise<void>;
    };
  };
  session: NativeSession & {
    api: Required<NonNullable<NativeSession["api"]>>;
  };
  theme: NativeTheme & { colorPrimary: string };
  actions: Omit<NativeActions, "list" | "right"> & {
    list: CapturedAction[];
    right?: false | CapturedAction[];
  };
  requestActions?: Omit<NativeRequestActions, "list"> & {
    list?: CapturedAction[];
  };
};

type NativeChatProps = import("react").ComponentProps<
  typeof import("@agentscope-ai/chat").AgentScopeRuntimeWebUI
>;

export type CapturedChatProps = Omit<NativeChatProps, "options"> & {
  options: CapturedChatOptions;
};

export type NativeRequestData = Parameters<
  NonNullable<NonNullable<IAgentScopeRuntimeWebUIOptions["request"]>["render"]>
>[0]["data"];
