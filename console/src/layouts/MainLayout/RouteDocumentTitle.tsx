import { useLayoutEffect } from "react";

export function RouteDocumentTitle({ title }: { title: string }) {
  useLayoutEffect(() => {
    const nextTitle =
      title === "QwenPaw" || title === "UGSci" ? "UGSci" : `${title} · UGSci`;
    document.title = nextTitle;
    document.dispatchEvent(
      new CustomEvent("qwenpaw:document-title-change", {
        detail: nextTitle,
      }),
    );
  }, [title]);

  return null;
}
