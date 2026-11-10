/**
 * Global stub for @agentscope-ai/design in tests.
 * The real lib/ is 3MB and causes long hangs when loaded via deps.inline.
 * Tests that need specific behavior can override with vi.mock('@agentscope-ai/design', factory).
 */
import React from "react";

const passThrough = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) =>
  React.createElement("div", props, children);

const buttonLike = ({
  children,
  onClick,
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
}) => React.createElement("button", { onClick, ...props }, icon, children);

const tabsLike = ({
  items = [],
  activeKey,
  defaultActiveKey,
  onChange,
  className,
}: Record<string, unknown>) =>
  React.createElement(
    "div",
    { role: "tablist", className },
    (items as Array<{ key?: React.Key; label?: React.ReactNode }>).map(
      (item, index) => {
        const key = String(item.key ?? index);
        const selectedKey = activeKey ?? defaultActiveKey;
        return React.createElement(
          "button",
          {
            key,
            type: "button",
            role: "tab",
            "aria-selected": selectedKey === item.key,
            onClick: () =>
              (onChange as ((value: string) => void) | undefined)?.(key),
          },
          item.label,
        );
      },
    ),
  );

export const IconButton = buttonLike;
export const Dropdown = passThrough;
export const Button = buttonLike;
export const Input = Object.assign(
  (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    React.createElement("input", props),
  {
    TextArea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
      React.createElement("textarea", props),
    Search: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
      React.createElement("input", { ...props, type: "search" }),
    Password: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
      React.createElement("input", { ...props, type: "password" }),
    Group: passThrough,
  },
);

export const Switch = ({
  checked,
  onChange,
  ...props
}: Record<string, unknown>) =>
  React.createElement("input", {
    type: "checkbox",
    role: "switch",
    checked,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      (onChange as ((v: boolean) => void) | undefined)?.(e.target.checked),
    ...props,
  });

export const Modal = Object.assign(passThrough, {
  confirm: () => {},
  info: () => {},
  warning: () => {},
  error: () => {},
});

export const Tag = passThrough;
export const Tooltip = passThrough;
export const Form = Object.assign(passThrough, {
  Item: passThrough,
  useForm: () => [{}],
});
export const InputNumber = (
  props: React.InputHTMLAttributes<HTMLInputElement>,
) => React.createElement("input", { type: "number", ...props });
export const Spin = passThrough;
export const Tabs = Object.assign(tabsLike, { TabPane: passThrough });

export default {
  IconButton,
  Dropdown,
  Button,
  Input,
  Switch,
  Modal,
  Tag,
  Tooltip,
  Form,
  InputNumber,
  Spin,
  Tabs,
};
