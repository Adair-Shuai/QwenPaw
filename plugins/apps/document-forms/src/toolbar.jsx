const React = window.QwenPaw.host.React;
const { useEffect, useRef, useState } = React;

export function ToolbarIcon({ name }) {
  const paths = {
    template: (
      <>
        <path d="M8 3h8l4 4v13H8z" />
        <path d="M16 3v5h4M4 7v14M11 12h6M11 16h6" />
      </>
    ),
    import: (
      <>
        <path d="M5 3h9l5 5v13H5zM14 3v5h5" />
        <path d="M12 10v8m-3-3 3 3 3-3" />
      </>
    ),
    export: (
      <>
        <path d="M5 3h9l5 5v13H5zM14 3v5h5" />
        <path d="M12 18v-8m-3 3 3-3 3 3" />
      </>
    ),
    save: (
      <>
        <path d="M4 3h13l4 4v14H4zM8 3v6h9V3M8 21v-8h9v8" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    file: (
      <>
        <path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h6" />
      </>
    ),
    settings: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="9" cy="6" r="2" />
        <circle cx="15" cy="12" r="2" />
        <circle cx="9" cy="18" r="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 11h18M7 15h2M13 15h2" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    back: <path d="m10 5-7 7 7 7M3 12h18" />,
    chevron: <path d="m7 10 5 5 5-5" />,
  };
  return (
    <svg
      className="df-toolbar-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function ToolbarMenu({
  label,
  icon,
  disabled,
  children,
  iconOnly = false,
}) {
  const menu = useRef(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const closeOutside = (event) => {
      if (!menu.current?.contains(event.target)) setOpen(false);
    };
    const closeWithEscape = (event) => {
      if (event.key !== "Escape" || !menu.current?.open) return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      menu.current.querySelector("summary").focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape, true);
    };
  }, []);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <details
      className={"df-toolbar-menu" + (iconOnly ? " df-toolbar-menu-more" : "")}
      ref={menu}
      open={open}
    >
      <summary
        aria-label={label}
        title={label}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={(event) => {
          event.preventDefault();
          if (!disabled) setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (disabled && ["Enter", " "].includes(event.key))
            event.preventDefault();
        }}
      >
        <ToolbarIcon name={icon} />
        {!iconOnly && <span>{label}</span>}
        {!iconOnly && <ToolbarIcon name="chevron" />}
      </summary>
      {open && (
        <div
          className="df-toolbar-popover"
          role="region"
          aria-label={label + "菜单"}
        >
          {children}
        </div>
      )}
    </details>
  );
}
