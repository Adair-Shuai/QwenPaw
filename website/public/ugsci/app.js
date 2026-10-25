document.querySelectorAll(".copy").forEach((b) =>
  b.addEventListener("click", async () => {
    const code = b.parentElement.querySelector("code").textContent;
    const status = b.parentElement.querySelector(".copy-status");
    try {
      if (navigator.clipboard && window.isSecureContext)
        await navigator.clipboard.writeText(code);
      else {
        const t = document.createElement("textarea");
        t.value = code;
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.append(t);
        t.select();
        if (!document.execCommand("copy")) throw Error("copy");
        t.remove();
      }
      status.textContent = "已复制";
      b.textContent = "已复制";
    } catch {
      status.textContent = "请手动选择并复制示例";
    }
  }),
);
const toggle = document.querySelector(".mobile-nav");
if (toggle)
  toggle.addEventListener("click", () => {
    const nav = document.querySelector(".sidebar");
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
const search = document.querySelector("#doc-search"),
  results = document.querySelector(".search-results"),
  allNav = document.querySelector(".chapter-list");
if (search) {
  const index = JSON.parse(document.querySelector("#search-data").textContent);
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    results.replaceChildren();
    allNav.hidden = !!q;
    if (!q) return;
    const found = index.filter((x) =>
      (x.title + " " + x.path + " " + x.text).toLowerCase().includes(q),
    );
    if (!found.length) {
      const p = document.createElement("p");
      p.className = "no-results";
      p.textContent = "没有找到匹配章节";
      results.append(p);
    }
    found.forEach((x) => {
      const a = document.createElement("a");
      a.href = x.slug + ".html";
      a.textContent = x.title;
      const path = document.createElement("span");
      path.dataset.searchPath = "";
      path.textContent = x.path;
      a.append(path);
      const s = document.createElement("small");
      const pos = x.text.toLowerCase().indexOf(q);
      s.textContent =
        x.text.slice(Math.max(0, pos - 14), Math.max(0, pos - 14) + 60) + "…";
      a.append(s);
      results.append(a);
    });
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      document.querySelector(".sidebar").classList.add("is-open");
      toggle?.setAttribute("aria-expanded", "true");
      search.focus();
    }
  });
}
document
  .querySelectorAll("[data-print]")
  .forEach((b) => b.addEventListener("click", () => window.print()));
