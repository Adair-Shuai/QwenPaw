import type { ReactNode } from "react";
import { getHost } from "../core/runtime";

/** An in-page editor; callers retain their existing validation and persistence. */
export function CapabilityDetail({
  open,
  title,
  children,
  onClose,
  onCancel,
  onOk,
  extra,
  footer,
  confirmLoading,
  okText = "保存",
  ...rest
}: {
  open?: boolean;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  onCancel?: () => void;
  onOk?: () => void;
  extra?: ReactNode;
  footer?: ReactNode;
  confirmLoading?: boolean;
  okText?: string;
  width?: number | string;
  cancelText?: string;
  rootClassName?: string;
}) {
  const React = getHost().React;
  const { Button } = getHost().antd;
  const { ArrowLeftOutlined } = getHost().antdIcons || {};
  const headingId = React.useId();
  const sectionRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    sectionRef.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);
  if (!open) return null;
  const close = onClose || onCancel;
  return React.createElement(
    "section",
    {
      className: "ugsci-capability-focus " + (rest.rootClassName || ""),
      "aria-labelledby": headingId,
      ref: sectionRef,
      tabIndex: -1,
      style: { outline: "none" },
    },
    React.createElement(
      Button,
      {
        type: "text",
        onClick: close,
        icon: ArrowLeftOutlined
          ? React.createElement(ArrowLeftOutlined)
          : undefined,
      },
      "返回列表",
    ),
    React.createElement(
      "div",
      { className: "ugsci-capability-detail" },
      React.createElement(
        "div",
        { className: "ugsci-capability-detail-heading" },
        React.createElement("h2", { id: headingId }, title),
        extra,
      ),
      children,
      footer || onOk
        ? React.createElement(
            "div",
            { className: "ugsci-capability-detail-footer" },
            footer ||
              React.createElement(
                Button,
                { type: "primary", loading: confirmLoading, onClick: onOk },
                okText,
              ),
          )
        : null,
    ),
  );
}
