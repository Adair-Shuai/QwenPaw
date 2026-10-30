import { useId, type CSSProperties } from "react";
import { useInteraction } from "./context";
import type { InteractionField, InteractionValue } from "./types";

const inputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minWidth: 0,
  minHeight: 38,
  padding: "8px 10px",
  border: "1px solid var(--app-border, #aeb8c4)",
  borderRadius: "var(--app-radius, 6px)",
  background: "var(--app-surface, #fff)",
  color: "var(--app-text, #20252d)",
  font: "inherit",
  accentColor: "var(--app-accent, #1677ff)",
};

function Field({ field }: { field: InteractionField }) {
  const { values, onChange, disabled, zh } = useInteraction();
  const id = useId();
  const value = values[field.name];
  const change = (next: InteractionValue) => {
    if (!disabled) onChange({ ...values, [field.name]: next });
  };
  const hint = field.description;
  const common = {
    id,
    name: field.name,
    disabled,
    required: field.required,
    "aria-describedby": hint ? `${id}-hint` : undefined,
    style: { ...inputStyle, opacity: disabled ? 0.72 : 1 },
  };
  const selectPlaceholder = zh ? "请选择" : "Choose an option";
  let control;
  if (field.type === "boolean") {
    // A required boolean asks for an explicit yes/no; false is a valid answer.
    control = (
      <select
        {...common}
        value={typeof value === "boolean" ? String(value) : ""}
        onChange={(event) =>
          change(event.target.value === "" ? "" : event.target.value === "true")
        }
      >
        <option value="">{selectPlaceholder}</option>
        <option value="true">{zh ? "是" : "Yes"}</option>
        <option value="false">{zh ? "否" : "No"}</option>
      </select>
    );
  } else if (field.type === "select" || field.type === "multiselect") {
    const multiple = field.type === "multiselect";
    control = (
      <select
        {...common}
        multiple={multiple}
        size={
          multiple
            ? Math.min(6, Math.max(3, field.options?.length || 0))
            : undefined
        }
        value={
          multiple
            ? Array.isArray(value)
              ? value
              : []
            : typeof value === "string"
            ? value
            : ""
        }
        onChange={(event) =>
          change(
            multiple
              ? Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                )
              : event.target.value,
          )
        }
      >
        {!multiple && <option value="">{selectPlaceholder}</option>}
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  } else {
    const numeric = field.type === "number" || field.type === "integer";
    control = (
      <input
        {...common}
        type={numeric ? "number" : "text"}
        value={
          typeof value === "string" || typeof value === "number" ? value : ""
        }
        min={numeric ? field.minimum : undefined}
        max={numeric ? field.maximum : undefined}
        step={numeric ? (field.type === "integer" ? 1 : "any") : undefined}
        onChange={(event) => {
          const text = event.target.value;
          const number = event.target.valueAsNumber;
          // Keep an empty draft empty; Number("") would silently create zero.
          change(
            numeric
              ? text === "" || !Number.isFinite(number)
                ? ""
                : number
              : text,
          );
        }}
      />
    );
  }
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}
    >
      <label htmlFor={id} style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {field.label}
        {field.unit && <span style={{ fontWeight: 400 }}> ({field.unit})</span>}
        {field.required && (
          <span
            aria-hidden="true"
            style={{ color: "var(--app-error, #c5221f)", marginLeft: 4 }}
          >
            *
          </span>
        )}
      </label>
      {control}
      {hint && (
        <span
          id={`${id}-hint`}
          style={{
            fontSize: "0.9em",
            color: "var(--app-text-secondary, #596575)",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

export function InteractionFields() {
  const { fields } = useInteraction();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
        gap: 16,
        width: "100%",
        minWidth: 0,
      }}
    >
      {fields.map((field) => (
        <Field key={field.name} field={field} />
      ))}
    </div>
  );
}
