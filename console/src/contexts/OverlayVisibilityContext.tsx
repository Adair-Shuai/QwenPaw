import { createContext, useContext } from "react";

/** Portaled pickers should close when their containing menu becomes hidden. */
const OverlayVisibilityContext = createContext(true);
export const OverlayVisibilityProvider = OverlayVisibilityContext.Provider;
export const useOverlayVisibility = () => useContext(OverlayVisibilityContext);
