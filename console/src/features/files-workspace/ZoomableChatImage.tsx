import { cloneElement, useRef, useState, type ImgHTMLAttributes } from "react";
import { Image } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./InlineFileImage.module.less";

export default function ZoomableChatImage({
  src,
  alt,
  className,
  ...imageProps
}: Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  "title" | "loading" | "onError"
> & {
  src: string;
  alt: string;
  className: string;
}) {
  const { t } = useTranslation();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const label = alt
    ? `${t("turnFiles.previewImage")} ${alt}`
    : t("turnFiles.previewImage");

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={className}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <img {...imageProps} src={src} alt={alt} />
      </button>
      {open && (
        <Image.PreviewGroup
          items={[{ src }]}
          preview={{
            visible: true,
            transitionName: "",
            title: <span className={styles.viewerTitle}>{label}</span>,
            imageRender: (image) => cloneElement(image, { alt }),
            onVisibleChange: (visible) => {
              if (!visible) {
                setOpen(false);
                trigger.current?.focus({ preventScroll: true });
              }
            },
          }}
        />
      )}
    </>
  );
}
