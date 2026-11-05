const React = window.QwenPaw.host.React;
const { useEffect, useRef, useState } = React;

function FieldHelp({ field }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const trigger = useRef(null);
  const closeTimer = useRef(null);
  const showHelp = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  const helpId = "df-help-" + field.key;
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    const closeWithEscape = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      const restoreFocus = container.current?.contains(document.activeElement);
      setOpen(false);
      if (restoreFocus) trigger.current?.focus();
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape, true);
    };
  }, [open]);
  return (
    <span
      className="df-field-help"
      ref={container}
      onMouseEnter={showHelp}
      onMouseLeave={(event) => {
        if (
          event.relatedTarget?.nodeType &&
          event.currentTarget.contains(event.relatedTarget)
        )
          return;
        if (!container.current?.contains(document.activeElement))
          closeTimer.current = window.setTimeout(() => setOpen(false), 120);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <button
        type="button"
        className="df-field-help-trigger"
        aria-label={field.label + "：填写说明"}
        aria-expanded={open}
        aria-controls={open ? helpId : undefined}
        aria-describedby={open ? helpId : undefined}
        ref={trigger}
        onFocus={showHelp}
        onClick={showHelp}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="M7.8 7.6a2.3 2.3 0 0 1 4.4.9c0 1.6-2.2 1.8-2.2 3.2" />
          <circle cx="10" cy="14" r=".65" fill="currentColor" stroke="none" />
        </svg>
      </button>
      {open && (
        <span
          className="df-field-help-content"
          id={helpId}
          role="tooltip"
          onMouseEnter={showHelp}
        >
          {field.help}
        </span>
      )}
    </span>
  );
}

export default function FieldLabel({ field, inputId }) {
  const Label = inputId ? "label" : "span";
  return (
    <div className="df-field-label">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && (
          <span className="df-required" title="必填" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {field.help && <FieldHelp field={field} />}
    </div>
  );
}
