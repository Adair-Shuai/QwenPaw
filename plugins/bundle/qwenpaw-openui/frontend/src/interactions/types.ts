/** Data only. Business validation and persistence belong to the host. */
export type InteractionValue = string | number | boolean | string[];
export type InteractionValues = Record<string, InteractionValue>;

export interface InteractionField {
  name: string;
  label: string;
  type: "string" | "number" | "integer" | "boolean" | "select" | "multiselect";
  required?: boolean;
  default?: InteractionValue;
  unit?: string;
  description?: string;
  options?: Array<{ label: string; value: string }>;
  minimum?: number;
  maximum?: number;
}

export interface InteractionFormProps {
  requestId: string;
  title: string;
  description?: string;
  fields: InteractionField[];
  preview?: Array<{ label: string; value: string }>;
  values: InteractionValues;
  onChange: (values: InteractionValues) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  error?: string;
  submitLabel?: string;
}
