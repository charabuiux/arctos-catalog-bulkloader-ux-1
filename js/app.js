/* ============================================================
   Shared layout + utilities for the Arctos Bulkload prototype
   ============================================================ */

/* Icon rendered as an inline <svg fill="currentColor"> (see js/icons.js) so it always
   matches the surrounding text color, with no external file load and no browser/protocol
   quirks (this replaced an earlier CSS mask-image approach that broke under some
   browsers/environments). */
function icon(name, opts = {}) {
  const { cls = "", h = 14 } = opts;
  return svgIcon(name, h, cls);
}

/* Hydrates static-HTML icon placeholders: <span class="ic" data-icon="name" data-size="14"></span> */
function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.dataset.icon;
    const px = parseInt(el.dataset.size || "14", 10);
    const cls = el.dataset.cls || "";
    el.outerHTML = svgIcon(name, px, cls);
  });
}

/* ---------------- localStorage-backed prototype state ---------------- */

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem("ab_" + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("ab_" + key, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  },
  remove(key) {
    localStorage.removeItem("ab_" + key);
  },
};

/* ---------------- Header ---------------- */

const NAV_MENUS = {
  Search: [
    ["Agents", "#"],
    ["Catalog Records", "#"],
    ["Code Tables", "#"],
    ["Collections", "#"],
    ["Media & Documents", "#"],
    ["Places & Events", "#"],
    ["Publications & Projects", "#"],
    ["Surprise Me!", "#"],
    ["Taxonomy", "#"],
    ["API", "#"],
  ],
  Join: [
    ["What Arctos Values & Delivers", "#", true],
    ["Prospective Collection Request", "#", true],
    ["Existing Institutions - New Portal Request", "#", true],
  ],
  Help: [
    ["Acknowledgment of Harmful Content", "#", true],
    ["About", "#", true],
    ["Help", "#", true],
    ["Webinars", "#", true],
    ["Tutorials", "#", true],
  ],
};

function renderHeader(activeRoot = "") {
  const el = document.getElementById("site-header");
  if (!el) return;

  const menu = (label) => {
    const items = NAV_MENUS[label];
    const lis = items
      .map(
        ([text, href, ext]) =>
          `<li><a href="${href}" target="${ext ? "_blank" : "_self"}">${text}${
            ext ? icon("external-icon", { cls: "ext", h: 10 }) : ""
          }</a></li>`
      )
      .join("");
    return `
      <div class="nav-item" data-menu="${label}">
        <button type="button" class="nav-trigger">${label} ${icon("chevron-down-solid", { cls: "chev", h: 8 })}</button>
        <div class="nav-dropdown"><ul>${lis}</ul></div>
      </div>`;
  };

  el.innerHTML = `
    <div class="brand-bar">
      <a href="index.html" class="brand" style="text-decoration:none;">
        <img src="icons/arctos-logo.png" alt="Arctos Collaborative Collection Management Solution" class="brand-logo" />
      </a>
      <nav class="top-nav">
        ${menu("Search")}
        <div class="nav-item"><a href="#" class="nav-trigger" style="text-decoration:none;">Tools Directory</a></div>
        ${menu("Join")}
        ${menu("Help")}
        <div class="nav-item user-menu" data-menu="user">
          <button type="button" class="nav-trigger">jdoe [81] ${icon("chevron-down-solid", { cls: "chev", h: 8 })}</button>
          <div class="nav-dropdown">
            <ul>
              <li><a href="#">Profile</a></li>
              <li><a href="#">Saved Searches</a></li>
              <li><a href="#">Sign In</a></li>
            </ul>
            <div class="user-menu-meta">
              59 minutes left in session<br />
              Last login: 2026-09-22<br />
              arctos-worker-03 (TEST)
            </div>
          </div>
        </div>
      </nav>
    </div>
  `;

  el.querySelectorAll(".nav-item").forEach((item) => {
    const trigger = item.querySelector(".nav-trigger");
    if (!item.querySelector(".nav-dropdown")) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".nav-item.open").forEach((n) => n.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-item")) {
      document.querySelectorAll(".nav-item.open").forEach((n) => n.classList.remove("open"));
    }
  });

  // None of the header's destination pages are in the prototype: every menu item and
  // the Tools Directory link show a notice instead of navigating.
  el.querySelectorAll(".nav-dropdown a, a.nav-trigger").forEach((link) => {
    link.removeAttribute("target");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".nav-item.open").forEach((n) => n.classList.remove("open"));
      toast(`"${link.textContent.trim()}" isn't available in the prototype.`);
    });
  });
}

/* ---------------- Stepper ---------------- */

const STEPS = ["Prepare CSV", "Upload CSV", "Staging", "Browse & Edit"];
const STEPS_SHORT = ["Prepare", "Upload", "Stage", "Edit"]; // labels used on narrow (mobile) screens
const STEP_HREFS = ["index.html", "upload-csv.html", "staging.html", "browse-edit.html"];

/* Default record count shown next to "Browse & Edit" until the Browse & Edit page changes it. */
const DEFAULT_BROWSE_COUNT = 27;

function getBrowseCount() {
  return Store.get("browse_count", DEFAULT_BROWSE_COUNT);
}

/* Shared page-title help link (external link with icon), used next to every page title. */
function helpLink(label, href) {
  return `<a class="handbook-link" href="${href}" target="_blank">${label}${icon("external-icon", { cls: "ext", h: 11 })}</a>`;
}

function renderStepper(current, opts = {}) {
  const el = document.getElementById("page-header");
  if (!el) return;
  const { title = "Bulkload Catalog Records", showVersion = true } = opts;
  const browseCount = getBrowseCount();

  const stepsHtml = STEPS.map((label, i) => {
    const idx = i + 1;
    let cls = "step-item";
    const count = idx === 4 ? ` (${browseCount})` : "";
    const content = `<span class="step-full">${label}${count}</span><span class="step-short">${STEPS_SHORT[i]}${count}</span>`;
    if (idx < current) cls += " completed";
    else if (idx === current) cls += " active";
    return `<a class="${cls}" href="${STEP_HREFS[i]}" title="Go to ${label}">${content}</a>`;
  }).join("");

  el.innerHTML = `
    <div class="page-title-row">
      <h1>${title}</h1>
      ${showVersion ? '<span class="version-badge">v1.8</span>' : ""}
      ${helpLink("How-To Handbook", "https://handbook.arctosdb.org/how_to/bulkload-catalog-records.html")}
    </div>
    <nav class="workflow-stepper" aria-label="Bulkload progress">${stepsHtml}</nav>
  `;
}

function renderStandaloneTitle(title, help) {
  const el = document.getElementById("page-header");
  if (!el) return;
  const link = help ? helpLink(help.label, help.href) : "";
  el.innerHTML = `<div class="page-title-row"><h1>${title}</h1>${link}</div>`;
}

/* ---------------- Footer ---------------- */

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <div class="footer-grid">
      <div class="footer-left">
        <select>
          <option>Select Language</option>
          <option>English</option>
          <option>Español</option>
          <option>Français</option>
        </select>
        <div class="footer-brand">
          <img src="icons/arctos-logo.png" alt="Arctos Collaborative Collection Management Solution" class="footer-logo" />
          <p>Arctos Consortium is a fiscally sponsored project of Community Initiatives, a US 501(c)(3) nonprofit organization.</p>
        </div>
      </div>
      <div class="footer-links">
        <a href="#" target="_blank">Donate${icon("external-icon", { cls: "ext", h: 11 })}</a>
        <a href="#" target="_blank">Contact Us${icon("external-icon", { cls: "ext", h: 11 })}</a>
        <a href="#" target="_blank">About Arctos${icon("external-icon", { cls: "ext", h: 11 })}</a>
        <a href="#" target="_blank">Acknowledgment of Harmful Content${icon("external-icon", { cls: "ext", h: 11 })}</a>
        <a href="#" target="_blank">Report bug or request support${icon("external-icon", { cls: "ext", h: 11 })}</a>
      </div>
    </div>
  `;
}

/* ---------------- Toast ---------------- */

// How long a notice stays up depends on its length, sized for a 60-year-old reader:
//   2 s to notice it and start reading + 80 ms per character (about 150 words a minute),
//   never shorter than 6 s or longer than 20 s.
// It also closes as soon as the user clicks anywhere else on the page.
const TOAST_START_MS = 2000;
const TOAST_MS_PER_CHAR = 80;
const TOAST_MIN_MS = 6000;
const TOAST_MAX_MS = 20000;

function toastDuration(message) {
  const ms = TOAST_START_MS + message.length * TOAST_MS_PER_CHAR;
  return Math.min(TOAST_MAX_MS, Math.max(TOAST_MIN_MS, ms));
}

function toast(message, type = "info") {
  let stack = document.getElementById("toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toast-stack";
    document.body.appendChild(stack);
  }
  const t = document.createElement("div");
  t.className = type === "error" ? "toast toast-error" : "toast";
  if (type === "error") t.setAttribute("role", "alert");
  t.textContent = message;
  stack.appendChild(t);

  const onClickElsewhere = (e) => {
    if (!t.contains(e.target)) close();
  };
  const close = () => {
    document.removeEventListener("pointerdown", onClickElsewhere, true);
    t.remove();
  };
  // Start listening after the click that opened this notice has finished.
  setTimeout(() => document.addEventListener("pointerdown", onClickElsewhere, true), 0);
  setTimeout(close, toastDuration(message));
}

/* ---------------- Modal ---------------- */

function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

/* ---------------- CSV download helper ---------------- */

function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ---------------- Boot ---------------- */

function bootLayout(opts = {}) {
  renderHeader();
  if (opts.stepper) {
    renderStepper(opts.stepper, opts.stepperOpts || {});
  } else if (opts.standaloneTitle) {
    renderStandaloneTitle(opts.standaloneTitle);
  }
  renderFooter();
}
