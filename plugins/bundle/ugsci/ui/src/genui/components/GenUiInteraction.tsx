/** Shared client-side state for interactive controls in one GenUI tree. */

import type { GenUiNode } from "../types/genUi";

type ReactNode = any;
type ReactElement = any;

const text = (value: unknown): string =>
  typeof value === "string" ? value : value != null ? String(value) : "";

let interactionContext: any = null;

export function getInteractionContext(React: any): any {
  if (!interactionContext) interactionContext = React.createContext(null as any);
  return interactionContext;
}

export function fieldName(node: GenUiNode): string {
  const props = node.props || {};
  const explicit = text(props.name);
  if (explicit) return explicit;
  const label = text(props.label);
  const coefficient = label.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return coefficient ? coefficient[1].toLowerCase() : label || node.nodeId;
}

function collectInitialValues(
  node: GenUiNode,
  result: Record<string, unknown> = {},
): Record<string, unknown> {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(node.kind)) {
    const props = node.props || {};
    const value = props.value ?? props.checked;
    if (value !== undefined) result[fieldName(node)] = value;
  }
  for (const child of node.children || []) collectInitialValues(child, result);
  return result;
}

export function GenUiInteractionProvider({
  node,
  children,
  onValuesChange,
}: {
  node: GenUiNode;
  children?: ReactNode;
  onValuesChange?: (values: Record<string, unknown>) => void;
}): ReactElement | null {
  const React = (window as any).QwenPaw?.host?.React;
  if (!React) return null;
  const initial = React.useMemo(() => collectInitialValues(node), [node]);
  const [values, setValues] = React.useState(initial as Record<string, unknown>);
  React.useEffect(
    () => setValues((old: Record<string, unknown>) => ({ ...initial, ...old })),
    [initial],
  );
  React.useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);
  const api = React.useMemo(
    () => ({
      values,
      setValue: (name: string, value: unknown) =>
        setValues((old: Record<string, unknown>) => ({ ...old, [name]: value })),
    }),
    [values],
  );
  return React.createElement(
    getInteractionContext(React).Provider,
    { value: api },
    children,
  );
}
