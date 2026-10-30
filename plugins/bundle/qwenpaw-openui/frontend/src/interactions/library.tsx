import { defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { streamingLibrary } from "../library";
import { InteractionFields } from "./InteractionFields";
import { useInteraction } from "./context";

function Heading() {
  const { title, description } = useInteraction();
  return (
    <header style={{ minWidth: 0, overflowWrap: "anywhere" }}>
      <h2 style={{ margin: 0, fontSize: "1.15em" }}>{title}</h2>
      {description && (
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--app-text-secondary, #596575)",
            whiteSpace: "pre-wrap",
          }}
        >
          {description}
        </p>
      )}
    </header>
  );
}

function Preview() {
  const { preview, zh } = useInteraction();
  if (!preview?.length) return null;
  return (
    <section
      aria-label={zh ? "输入依据" : "Input context"}
      style={{
        padding: 12,
        borderRadius: 8,
        background: "var(--app-surface-sunken, #f4f6f8)",
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: "0.95em" }}>
        {zh ? "输入依据" : "Input context"}
      </h3>
      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
          gap: "8px 12px",
          margin: 0,
        }}
      >
        {preview.map((item, index) => (
          <div key={index} style={{ display: "contents" }}>
            <dt
              style={{
                color: "var(--app-text-secondary, #596575)",
                overflowWrap: "anywhere",
              }}
            >
              {item.label}
            </dt>
            <dd
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Actions() {
  const { onCancel, disabled, error, submitLabel, zh } = useInteraction();
  const buttonStyle = {
    font: "inherit",
    padding: "8px 14px",
    borderRadius: "var(--app-radius, 6px)",
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
  return (
    <div style={{ minWidth: 0 }}>
      {error && (
        <p
          role="alert"
          style={{
            color: "var(--app-error-text, #b42318)",
            margin: "0 0 12px",
            whiteSpace: "pre-wrap",
          }}
        >
          {error}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="submit"
          disabled={disabled}
          style={{
            ...buttonStyle,
            border: "1px solid var(--app-accent, #1677ff)",
            background: "var(--app-accent, #1677ff)",
            color: "var(--app-text-inverse, #fff)",
          }}
        >
          {submitLabel || (zh ? "确认并继续" : "Confirm and continue")}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) onCancel();
            }}
            style={{
              ...buttonStyle,
              border: "1px solid var(--app-border, #aeb8c4)",
              background: "var(--app-surface, #fff)",
              color: "var(--app-text, #20252d)",
            }}
          >
            {zh ? "取消本次请求" : "Cancel request"}
          </button>
        )}
      </div>
    </div>
  );
}

// The language contains only stable layout. Labels, values and callbacks stay
// in React context, so a draft/title/preview update cannot restart the runtime.
export const interactionSource = `root = Card([content])
content = Stack([heading, preview, fields, actions], "column", "l", "stretch")
heading = InteractionHeading()
preview = InteractionPreview()
fields = InteractionFields()
actions = InteractionActions()`;

// This private catalog does not expose host actions or interactive fields to
// ordinary chat fences. Add future controls here without changing host APIs.
export const interactionLibrary = streamingLibrary.extend({
  components: {
    add: [
      ["InteractionHeading", Heading],
      ["InteractionPreview", Preview],
      ["InteractionFields", InteractionFields],
      ["InteractionActions", Actions],
    ].map(([name, component]) =>
      defineComponent({
        name: name as string,
        props: z.object({}),
        description: "Host-controlled task interaction content.",
        component: component as typeof Heading,
      }),
    ),
  },
});
