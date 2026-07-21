import type { TFunction } from "i18next";

const defaultConfig = {
  theme: {
    colorPrimary: "#0072f5",
    darkMode: false,
    prefix: "qwenpaw",
    leftHeader: {
      logo: "",
      title: "Work with UGSci",
    },
    bubbleList: {
      userMessageAnchors: {
        variant: "navigator",
      },
    },
  },
  sender: {
    attachments: true,
    maxLength: 10000,
    longTextUpload: {
      enabled: true,
    },
    disclaimer: "Works for you, grows with you",
  },
  welcome: {
    greeting: "Hello, how can I help you today?",
    description:
      "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
    avatar: "/online.svg",
    prompts: [
      {
        value: "Can you tell me what you can do?",
      },
    ],
  },
  api: {
    baseURL: "",
    token: "",
  },
} as const;

class ChatConfigProvider {
  getGreeting(t: TFunction): string {
    return t("chat.greeting");
  }

  getDescription(t: TFunction): string {
    return t("chat.description");
  }

  getPrompts(t: TFunction): Array<{ value: string }> {
    return [{ value: t("chat.prompt1") }];
  }

  getConfig(t: TFunction) {
    return {
      ...defaultConfig,
      sender: {
        ...defaultConfig.sender,
        disclaimer: t("chat.disclaimer"),
      },
      welcome: {
        ...defaultConfig.welcome,
        greeting: this.getGreeting(t),
        description: this.getDescription(t),
        prompts: this.getPrompts(t),
      },
    };
  }
}

const configProvider = new ChatConfigProvider();

export function getDefaultConfig(t: TFunction) {
  return configProvider.getConfig(t);
}

export default defaultConfig;

export type DefaultConfig = typeof defaultConfig;

// Export provider for extension
export { configProvider };
