/**
 * jsx-runtime-shim.mjs — delegates JSX runtime to the host's React.
 *
 * Problem: @xyflow/react imports `react/jsx-runtime`.  If the plugin's
 * node_modules has React 19 but the host app runs React 18, the bundled
 * jsx-runtime creates elements with `Symbol.for("react.transitional.element")`
 * (React 19) while the host's reconciler expects `Symbol.for("react.element")`
 * (React 18) — causing "Objects are not valid as a React child".
 *
 * Solution: alias `react/jsx-runtime` to this shim so every `jsx`/`jsxs`
 * call goes through the host's `React.createElement`, which uses the
 * correct `$$typeof` symbol for the host's React version.
 *
 * Key handling: React's automatic runtime passes `key` either as the third
 * argument (`maybeKey`) or inside the config object.  We merge both sources
 * into the props object so React.createElement can extract it normally.
 */

/* eslint-disable */

function getReact() {
  if (typeof window === "undefined") return null;
  return (
    window.React ||
    (window.QwenPaw &&
      window.QwenPaw.host &&
      window.QwenPaw.host.React)
  );
}

/**
 * Mirror the `jsx(type, config, maybeKey)` signature from React's
 * automatic runtime, but delegate element creation to the host's
 * `React.createElement`.
 *
 * React.createElement(type, props, ...children) extracts `key` and `ref`
 * from the props object itself, so we just need to make sure `key` is
 * present in the props we pass through.
 */
export function jsx(type, config, maybeKey) {
  const R = getReact();
  if (!R) {
    throw new Error(
      "[flowforge] Host React not available — ensure window.React is set before plugin loads",
    );
  }

  // Fast path: no config at all.
  if (config == null) {
    if (maybeKey !== undefined && maybeKey !== null) {
      return R.createElement(type, { key: maybeKey });
    }
    return R.createElement(type);
  }

  // Clone config so we don't mutate the caller's object, then overlay
  // maybeKey (the third argument takes precedence, matching React's
  // automatic runtime semantics).
  const props = {};
  for (const k in config) {
    if (Object.prototype.hasOwnProperty.call(config, k)) {
      props[k] = config[k];
    }
  }
  if (maybeKey !== undefined && maybeKey !== null) {
    props.key = maybeKey;
  }

  return R.createElement(type, props);
}

/** jsxs is identical to jsx in React's automatic runtime. */
export const jsxs = jsx;

/**
 * Fragment — the banner (which runs before this module initialises) already
 * sets `window.React` from `window.QwenPaw.host.React`, so it is safe to
 * access eagerly here.  Using the host's Fragment symbol ensures React's
 * reconciler recognises `<Fragment>` elements created by the plugin.
 */
export const Fragment = getReact().Fragment;
