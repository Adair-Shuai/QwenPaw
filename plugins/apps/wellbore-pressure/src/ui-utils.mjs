export const fmt = (n, d = 4) =>
  n !== 0 && Math.abs(n) < 0.5 * 10 ** -d
    ? Number(n).toExponential(2)
    : Number(n).toLocaleString("zh-CN", {
        maximumFractionDigits: d,
        minimumFractionDigits: d,
      });
