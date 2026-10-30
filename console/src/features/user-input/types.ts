import type { ComponentType } from "react";

/** Version-one public input contract. The server remains the validation authority. */
export type InputValue = string | number | boolean | string[];
export type InputValues = Record<string, InputValue>;
export interface InteractionField {
  name: string;
  label: string;
  type: "string" | "number" | "integer" | "boolean" | "select" | "multiselect";
  required?: boolean;
  default?: InputValue;
  unit?: string;
  description?: string;
  options?: { label: string; value: string }[];
  minimum?: number;
  maximum?: number;
}
export interface InteractionRequest {
  id: string;
  kind: "clarify" | "confirm" | "form";
  title: string;
  description?: string;
  fields: InteractionField[];
  preview?: { label: string; value: string }[];
  status: "pending" | "submitted" | "cancelled";
  revision: number;
  values: InputValues;
  answer?: InputValues;
  agent_id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  delivery_status?: "pending" | "queued" | null;
  continuation?: string;
}
export interface InteractionFormProps {
  requestId: string;
  title: string;
  description?: string;
  fields: InteractionField[];
  preview?: { label: string; value: string }[];
  values: InputValues;
  onChange: (values: InputValues) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  error?: string;
  submitLabel?: string;
}
export interface InteractionScope {
  agentId: string;
  sessionId: string;
}
export interface InteractionRuntime {
  InteractionForm?: ComponentType<InteractionFormProps>;
}
