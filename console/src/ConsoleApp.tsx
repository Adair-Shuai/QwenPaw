import App from "./App";
import DesktopWindowFrame from "./tauri/DesktopWindowFrame";
import { installHostExternals } from "./plugins/hostExternals";
import { installThemeTokenSync } from "./plugins/themeTokens";
import "./layouts/registry/builtinMenu";
import "./layouts/registry/builtinRoutes";

installHostExternals();
// Subscribe the document to plugin theme-token registrations before any
// plugin module loads, so a plugin's tokens are in effect from its first
// render. The stylesheet is removed again when the last override is disposed.
installThemeTokenSync();

export default function ConsoleApp(props: React.ComponentProps<typeof App>) {
  return (
    <DesktopWindowFrame>
      <App {...props} />
    </DesktopWindowFrame>
  );
}
