/* ============================================================
   Browse & Edit page logic
   ============================================================ */

let records = [];
let sortState = { key: "entered_to_bulk_date", dir: "asc" };
let filterSelections = { enteredby: [], accn: [], guid_prefix: [] };
let visibleExtras = new Set();
let hiddenBaseCols = new Set();

function initBrowseEditPage() {
  records = DEMO_RECORDS.map((r) => ({ ...r, __selected: false }));

  Store.set("browse_count", records.length);
  renderHeader();
  renderStepper(4, { title: "Bulkload Catalog Records: Browse &amp; Edit" });
  renderFooter();
  hydrateIcons();

  applyDefaultColumns();
  buildFilterLists();
  buildTableHead();
  renderRows();
  initStickyHead();

  document.getElementById("apply-filter-btn").addEventListener("click", applyFilters);
  document.getElementById("clear-filter-btn").addEventListener("click", clearFilters);

  document.getElementById("add-record-link").addEventListener("click", (e) => {
    e.preventDefault();
    const n = records.length + 1;
    records.unshift({
      key: `key_${String(n).padStart(7, "0")}`,
      status: "NEW",
      extras: 0,
      enteredby: "jdoe",
      entered_to_bulk_date: new Date().toISOString(),
      accn: "",
      guid_prefix: "",
      cat_num: "cat_num",
      uuid: "uuid",
      uuid_issued_by: "uuid_issued_by",
      record_type: "FossilSpecimen",
      record_remark: "",
      identification_count: 0,
      __selected: false,
      __editable: true,
    });
    buildFilterLists();
    renderRows();
    updateStepperCount();
    toast("New blank record added — edit its cells directly in the grid.");
  });

  document.getElementById("show-all-col-link").addEventListener("click", (e) => {
    e.preventDefault();
    // Shows every column; when all are already showing, goes back to the default view.
    if (hiddenBaseCols.size || visibleExtras.size < EXTRA_COLUMNS.length) {
      hiddenBaseCols.clear();
      EXTRA_COLUMNS.forEach((c) => visibleExtras.add(c.key));
    } else {
      applyDefaultColumns();
    }
    buildTableHead();
    renderRows();
  });

  document.getElementById("customize-view-link").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Customize view isn't available in the prototype yet.");
  });

  document.getElementById("delete-selected-link").addEventListener("click", (e) => {
    e.preventDefault();
    const selected = records.filter((r) => r.__selected);
    if (!selected.length) {
      toast("No rows are selected. Select one or more rows, then click delete selected.");
      return;
    }
    selected.forEach((r) => (r.status = "DELETE"));
    renderRows();
    const n = selected.length;
    toast(`Status updated to "DELETE" for ${n} row${n === 1 ? "" : "s"}. ${n === 1 ? "It" : "They"} will be deleted in about 30 minutes.`);
  });

  document.getElementById("publish-selected-btn").addEventListener("click", () => {
    const selected = records.filter((r) => r.__selected);
    if (!selected.length) {
      toast("No rows are selected. Select one or more rows, then click Publish Selected.");
      return;
    }
    selected.forEach((r) => (r.status = "autoload"));
    renderRows();
    const n = selected.length;
    toast(
      `Status updated to "autoload" for ${n} row${n === 1 ? "" : "s"}. Once the system publishes ${n === 1 ? "it, it" : "them, they"} will no longer appear in Browse & Edit.`
    );
  });

  document.getElementById("publish-queue-link").addEventListener("click", (e) => {
    e.preventDefault();
    toast(`This would open the page currently titled "Cache Status". That page isn't available in the prototype yet.`);
  });

  document.getElementById("download-browse-csv").addEventListener("click", (e) => {
    e.preventDefault();
    const cols = RECORD_COLUMNS.map((c) => c.key);
    const rows = [cols, ...getVisibleRows().map((r) => cols.map((c) => r[c]))];
    downloadCSV("browse_and_edit.csv", rows);
    toast("Downloaded CSV of the current view.");
  });
}

// Default view: show only columns that have a value in at least one record, and hide
// columns that are empty in every record. The key column always shows.
function applyDefaultColumns() {
  const hasValues = (key) => records.some((r) => r[key] !== undefined && r[key] !== null && String(r[key]).trim() !== "");
  hiddenBaseCols = new Set(RECORD_COLUMNS.filter((c) => c.key !== "key" && !hasValues(c.key)).map((c) => c.key));
  visibleExtras = new Set(EXTRA_COLUMNS.filter((c) => hasValues(c.key)).map((c) => c.key));
}

function updateStepperCount() {
  Store.set("browse_count", records.length);
  const stepEl = document.querySelectorAll(".step-item")[3];
  if (stepEl) {
    stepEl.innerHTML = stepEl.innerHTML.replace(/\(\d+\)/, `(${records.length})`);
  }
}

// Entered By, Accession and Collection lists allow several values each. An empty
// selection means "Any". Clicking a value toggles it; clicking Any clears the others.
function buildFilterLists() {
  const groups = [
    { id: "filter-enteredby", field: "enteredby" },
    { id: "filter-accn", field: "accn" },
    { id: "filter-collection", field: "guid_prefix" },
  ];
  groups.forEach(({ id, field }) => {
    const values = [...new Set(records.map((r) => r[field]).filter(Boolean))];
    const ul = document.getElementById(id);
    ul.setAttribute("role", "listbox");
    ul.setAttribute("aria-multiselectable", "true");

    const render = () => {
      const chosen = filterSelections[field];
      ul.innerHTML = ["Any", ...values]
        .map((v) => {
          const on = v === "Any" ? chosen.length === 0 : chosen.includes(v);
          return `<li role="option" tabindex="0" aria-selected="${on}" data-value="${v}" class="${on ? "selected" : ""}">${v}</li>`;
        })
        .join("");
    };

    const toggle = (value) => {
      if (value === "Any") {
        filterSelections[field] = [];
      } else if (filterSelections[field].includes(value)) {
        filterSelections[field] = filterSelections[field].filter((v) => v !== value);
      } else {
        filterSelections[field] = [...filterSelections[field], value];
      }
      render();
      ul.querySelector(`li[data-value="${CSS.escape(value)}"]`).focus({ preventScroll: true });
    };

    ul.onclick = (e) => {
      const li = e.target.closest("li");
      if (li) toggle(li.dataset.value);
    };
    ul.onkeydown = (e) => {
      const li = e.target.closest("li");
      if (li && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        toggle(li.dataset.value);
      }
    };

    render();
  });
}

// The Key(s) field holds a comma-separated list of keys.
function parseKeyList(value) {
  return value.split(",").map((k) => k.trim()).filter(Boolean);
}

// Row filter icon: adds that row's key to the Key(s) field. It doesn't apply the
// filter, so the user can keep adding keys from other rows before clicking Apply Filter.
function addKeyToFilter(key) {
  const field = document.getElementById("ff-key");
  const keys = parseKeyList(field.value);
  if (keys.some((k) => k.toLowerCase() === key.toLowerCase())) {
    toast(`${key} is already included in the Key(s) filter.`, "error");
    return;
  }
  keys.push(key);
  field.value = keys.join(", ");
  toast(`Added ${key} to the Key(s) filter. Click Apply Filter to filter the table.`);
}

// The table only changes when Apply Filter or Clear Filter is clicked. Editing the
// filter fields or lists (including the row filter icon) doesn't filter by itself,
// even if the table redraws for another reason (add record, sort, etc.).
const NO_FILTERS = { enteredby: [], accn: [], guid_prefix: [], keys: [], uuid: "", catnum: "", status: "" };
let appliedFilters = { ...NO_FILTERS };

function readFilterForm() {
  return {
    enteredby: [...filterSelections.enteredby],
    accn: [...filterSelections.accn],
    guid_prefix: [...filterSelections.guid_prefix],
    keys: parseKeyList(document.getElementById("ff-key").value).map((k) => k.toLowerCase()),
    uuid: document.getElementById("ff-uuid").value.trim().toLowerCase(),
    catnum: document.getElementById("ff-catnum").value.trim().toLowerCase(),
    status: document.getElementById("ff-status").value.trim().toLowerCase(),
  };
}

function applyFilters() {
  appliedFilters = readFilterForm();
  renderRows();
  toast("Filters applied.");
}

function clearFilters() {
  filterSelections = { enteredby: [], accn: [], guid_prefix: [] };
  buildFilterLists();
  ["ff-key", "ff-uuid", "ff-catnum", "ff-status"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  appliedFilters = { ...NO_FILTERS };
  renderRows();
  toast("Filters cleared.");
}

function getVisibleRows() {
  const f = appliedFilters;
  const keyQs = f.keys;
  const uuidQ = f.uuid;
  const catQ = f.catnum;
  const statusQ = f.status;

  let rows = records.filter((r) => {
    for (const field of ["enteredby", "accn", "guid_prefix"]) {
      const chosen = f[field];
      if (chosen.length && !chosen.includes(r[field])) return false;
    }
    if (keyQs.length && !keyQs.some((k) => r.key.toLowerCase().includes(k))) return false;
    if (uuidQ && !r.uuid.toLowerCase().includes(uuidQ)) return false;
    if (catQ && !String(r.cat_num).toLowerCase().includes(catQ)) return false;
    if (statusQ && !r.status.toLowerCase().includes(statusQ)) return false;
    return true;
  });

  if (sortState.key) {
    rows = rows.slice().sort((a, b) => {
      const av = a[sortState.key] ?? "";
      const bv = b[sortState.key] ?? "";
      if (av < bv) return sortState.dir === "asc" ? -1 : 1;
      if (av > bv) return sortState.dir === "asc" ? 1 : -1;
      return 0;
    });
  }
  return rows;
}

function buildTableHead() {
  const row = document.getElementById("records-thead-row");
  const cols = RECORD_COLUMNS.filter((c) => !hiddenBaseCols.has(c.key));
  const extras = EXTRA_COLUMNS.filter((c) => visibleExtras.has(c.key));

  const headCells = [...cols, ...extras]
    .map((c) => {
      // The key column stays frozen on the left when the table scrolls sideways.
      if (!c.sortable) return `<th${c.key === "key" ? ' class="col-key"' : ""}>${c.label}</th>`;
      const active = sortState.key === c.key;
      const icon = active ? (sortState.dir === "asc" ? "sort-ascending" : "sort-descending") : "sort-default";
      // Only the icon sorts, so the header text can be selected and copied.
      return `<th class="sortable${c.key === "key" ? " col-key" : ""}" data-key="${c.key}">${c.label}<button type="button" class="sort-btn" aria-label="Sort by ${c.label}"><img src="icons/${icon}.svg" alt="" /></button></th>`;
    })
    .join("");

  row.innerHTML = `<th><input type="checkbox" id="select-all-records" /></th><th>actions</th>${headCells}`;

  // Data columns only (not the checkbox or actions columns).
  const total = RECORD_COLUMNS.length + EXTRA_COLUMNS.length;
  const shown = cols.length + extras.length;
  document.getElementById("col-count").textContent = `${shown} visible · ${total - shown} hidden`;

  // Toggle link: "show all col." while any column is hidden, "hide empty col." once all are showing.
  const allShown = shown === total;
  document.getElementById("show-all-col-link").innerHTML = allShown
    ? `${svgIcon("eye-slash-solid", 13)} hide empty col.`
    : `${svgIcon("eye-solid", 13)} show all col.`;

  document.getElementById("select-all-records").addEventListener("change", (e) => {
    getVisibleRows().forEach((r) => (r.__selected = e.target.checked));
    renderRows();
  });

  row.querySelectorAll("th.sortable").forEach((th) => {
    th.querySelector(".sort-btn").addEventListener("click", () => {
      const key = th.dataset.key;
      if (sortState.key === key) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState = { key, dir: "asc" };
      }
      buildTableHead();
      renderRows();
    });
  });
}

function renderRows() {
  const tbody = document.getElementById("records-tbody");
  const cols = RECORD_COLUMNS.filter((c) => !hiddenBaseCols.has(c.key));
  const extras = EXTRA_COLUMNS.filter((c) => visibleExtras.has(c.key));
  const rows = getVisibleRows();

  tbody.innerHTML = rows
    .map((r) => {
      const cells = cols
        .map((c) => {
          if (c.readonly) {
            return `<td${c.key === "key" ? ' class="col-key"' : ""}>${r[c.key] ?? ""}</td>`;
          }
          return `<td contenteditable="true" data-record="${r.key}" data-field="${c.key}">${r[c.key] ?? ""}</td>`;
        })
        .join("");
      const extraCells = extras
        .map((c) => `<td contenteditable="true" data-record="${r.key}" data-field="${c.key}">${r[c.key] ?? ""}</td>`)
        .join("");
      return `
        <tr>
          <td><input type="checkbox" class="row-check" data-key="${r.key}" ${r.__selected ? "checked" : ""} /></td>
          <td class="actions-cell">
            <button data-act="edit" data-key="${r.key}" title="Edit">${svgIcon("pen-to-square-solid", 14)}</button>
            <button data-act="copy" data-key="${r.key}" title="Duplicate">${svgIcon("copy-regular", 14)}</button>
            <button data-act="filter" data-key="${r.key}" title="Add to key filter" aria-label="Add to key filter">${svgIcon("filter-solid", 14)}</button>
          </td>
          ${cells}${extraCells}
        </tr>`;
    })
    .join("");

  tbody.querySelectorAll(".row-check").forEach((cb) => {
    cb.addEventListener("change", () => {
      const rec = records.find((r) => r.key === cb.dataset.key);
      rec.__selected = cb.checked;
    });
  });

  tbody.querySelectorAll("td[contenteditable]").forEach((td) => {
    td.addEventListener("blur", () => {
      const rec = records.find((r) => r.key === td.dataset.record);
      if (rec) rec[td.dataset.field] = td.textContent.trim();
    });
  });

  tbody.querySelectorAll("button[data-act]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const rec = records.find((r) => r.key === key);
      if (btn.dataset.act === "edit") {
        toast(`This would open the Enter / Edit Record page for ${key}. That page isn't available in the prototype yet.`);
      } else if (btn.dataset.act === "copy") {
        const n = records.length + 1;
        const clone = { ...rec, key: `key_${String(n).padStart(7, "0")}`, __selected: false, __editable: false };
        const idx = records.indexOf(rec);
        records.splice(idx + 1, 0, clone);
        buildFilterLists();
        renderRows();
        updateStepperCount();
        toast(`Duplicated ${key} as ${clone.key}.`);
      } else if (btn.dataset.act === "filter") {
        addKeyToFilter(key);
      }
    });
  });

  document.getElementById("select-all-records").checked = rows.length > 0 && rows.every((r) => r.__selected);
  syncStickyHead();
}

/* ---------- Frozen header row ----------
   The table scrolls sideways inside its own box, which stops a CSS sticky header
   from pinning to the page. Instead, a copy of the header row pins to the top of
   the screen once the real one scrolls off, and follows the table's sideways scroll. */

function initStickyHead() {
  const wrap = document.querySelector(".records-table-wrap");
  const inner = document.getElementById("records-sticky-inner");

  wrap.addEventListener("scroll", () => {
    inner.scrollLeft = wrap.scrollLeft;
  });
  window.addEventListener("scroll", updateStickyHeadVisibility, { passive: true });
  window.addEventListener("resize", syncStickyHead);

  // Clicks on the copy act on the real header: sorting and select all.
  inner.addEventListener("click", (e) => {
    const th = e.target.closest("th");
    if (!th) return;
    const realTh = document.getElementById("records-thead-row").children[th.cellIndex];
    if (e.target.matches("input[type='checkbox']")) {
      e.preventDefault();
      realTh.querySelector("input").click();
    } else if (e.target.closest(".sort-btn")) {
      realTh.querySelector(".sort-btn").click();
    }
  });

  syncStickyHead();
}

function syncStickyHead() {
  const inner = document.getElementById("records-sticky-inner");
  if (!inner) return;
  const wrap = document.querySelector(".records-table-wrap");
  const realTable = document.getElementById("records-table");
  const realRow = document.getElementById("records-thead-row");

  const copy = realRow.cloneNode(true);
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  [...realRow.children].forEach((th, i) => {
    copy.children[i].style.width = `${th.getBoundingClientRect().width}px`;
  });
  copy.querySelector("input[type='checkbox']").checked = document.getElementById("select-all-records").checked;

  document.getElementById("records-sticky-thead").replaceChildren(copy);
  inner.querySelector("table").style.width = `${realTable.getBoundingClientRect().width}px`;
  inner.style.width = `${wrap.offsetWidth}px`;
  inner.scrollLeft = wrap.scrollLeft;
  updateStickyHeadVisibility();
}

function updateStickyHeadVisibility() {
  const realHead = document.getElementById("records-table").tHead.getBoundingClientRect();
  const table = document.getElementById("records-table").getBoundingClientRect();
  const stuck = realHead.top < 0 && table.bottom > realHead.height * 2;
  document.getElementById("records-sticky-head").classList.toggle("stuck", stuck);
}
