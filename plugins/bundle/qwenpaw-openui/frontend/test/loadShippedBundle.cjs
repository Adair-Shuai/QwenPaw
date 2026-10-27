// Use Node's ESM loader for the actual release module. A distinct query keeps
// repeated test bootstraps isolated while loading the same on-disk artifact.
let loads = 0;

module.exports = function loadShippedBundle(fileUrl, expectedFunction) {
  if (globalThis.Function !== expectedFunction) {
    throw new Error("Native release loading must share the Function guard");
  }
  const url = new URL(fileUrl);
  url.searchParams.set("testLoad", String(++loads));
  return import(url.href);
};
