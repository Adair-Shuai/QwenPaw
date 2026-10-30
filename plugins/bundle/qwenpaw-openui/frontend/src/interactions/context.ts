import { createContext, useContext } from "react";
import type { InteractionFormProps } from "./types";

export const InteractionContext = createContext<
  (InteractionFormProps & { zh: boolean }) | null
>(null);

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (!context)
    throw new Error("Interaction components require InteractionForm.");
  return context;
}
