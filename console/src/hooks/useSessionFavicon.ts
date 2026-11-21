import { useLayoutEffect } from "react";
import logo from "../../public/online.svg?raw";

export function useSessionFavicon(unread: boolean) {
  useLayoutEffect(() => {
    if (!unread) return;

    const existing =
      document.querySelector<HTMLLinkElement>(
        'link[rel="icon"][type="image/svg+xml"]',
      ) ?? document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    const icon = existing ?? document.createElement("link");
    const originalHref = icon.getAttribute("href");
    const originalType = icon.getAttribute("type");
    const svg = logo
      .trimEnd()
      .replace(
        /<\/svg>$/,
        '<circle cx="52" cy="12" r="10" fill="#52c41a" stroke="white" stroke-width="3"/></svg>',
      );
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    if (!existing) document.head.appendChild(icon);

    return () => {
      if (!existing) {
        icon.remove();
        return;
      }
      if (originalHref === null) icon.removeAttribute("href");
      else icon.setAttribute("href", originalHref);
      if (originalType === null) icon.removeAttribute("type");
      else icon.setAttribute("type", originalType);
    };
  }, [unread]);
}
