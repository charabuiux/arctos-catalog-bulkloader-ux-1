/* ============================================================
   Browse & Edit page logic
   ============================================================ */

let records = [];
let sortState = { key: "entered_to_bulk_date", dir: "asc" };
let filterSelections = { enteredby: "Any", accn: "Any", guid_prefix: "Any" };
let visibleExtras = new Set();
let hiddenBaseCols = new Set();

function initBrowseEditPage() {
  records = DEMO_RECORDS.map((r) => ({ ...r, __selected: false }));

  Store.set("browse_count", records.length);
  renderHeader();
  renderStepper(4, { title: "Bulkload Catalog Records: Browse &amp; Edit" });
  renderFooter();
  hydrateIcons();

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
    if (visibleExtras.size < EXTRA_COLUMNS.length) {
      EXTRA_COLUMNS.forEach((c) => visibleExtras.add(c.key));
    } else {
      visibleExtras.clear();
    }
    buildTableHead();
    renderRows();
  });

  const colChooser = document.getElementById("col-chooser");
  document.getElementById("customize-view-link").addEventListener("click", (e) => {
    e.preventDefault();
    renderColChooser();
    colChooser.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#col-chooser") && !e.target.closest("#customize-view-link")) {
      colChooser.classList.remove("open");
    }
  });

  document.getElementById("delete-selected-link").addEventListener("click", (e) => {
    e.preventDefault();
    const selected = records.filter((r) => r.__selected);
    if (!selected.length) {
      toast("Select one or more records first.");
      return;
    }
    if (confirm(`Delete ${selected.length} selected record${selected.length === 1 ? "" : "s"}?`)) {
      records = records.filter((r) => !r.__selected);
      buildFilterLists();
      renderRows();
      updateStepperCount();
      toast(`${selected.length} record${selected.length === 1 ? "" : "s"} deleted.`);
    }
  });

  document.getElementById("publish-selected-btn").addEventListener("click", () => {
    const selected = records.filter((r) => r.__selected);
    if (!selected.length) {
      toast("Select one or more records to publish.");
      return;
    }
    selected.forEach((r) => (r.status = "PUBLISHED"));
    renderRows();
    toast(`${selected.length} record${selected.length === 1 ? "" : "s"} sent to the Publishing Queue.`);
  });

  document.getElementById("publish-queue-link").addEventListener("click", (e) => {
    e.preventDefault();
    const pending = records.filter((r) => r.status === "PUBLISHED").length;
    toast(pending ? `Publishing Queue: ${pending} record${pending === 1 ? "" : "s"} awaiting publish.` : "Publishing Queue is empty.");
  });

  document.getElementById("download-browse-csv").addEventListener("click", (e) => {
    e.preventDefault();
    const cols = RECORD_COLUMNS.map((c) => c.key);
    const rows = [cols, ...getVisibleRows().map((r) => cols.map((c) => r[c]))];
    downloadCSV("browse_and_edit.csv", rows);
    toast("Downloaded CSV of the current view.");
  });
}

function updateStepperCount() {
  Store.set("browse_count", records.length);
  const stepEl = document.querySelectorAll(".step-item")[3];
  if (stepEl) {
    stepEl.innerHTML = stepEl.innerHTML.replace(/\(\d+\)/, `(${records.length})`);
  }
}

function buildFilterLists() {
  const groups = [
    { id: "filter-enteredby", field: "enteredby" },
    { id: "filter-accn", field: "accn" },
    { id: "filter-collection", field: "guid_prefix" },
  ];
  groups.forEach(({ id, field }) => {
    const values = ["Any", ...new Set(records.map((r) => r[field]).filter(Boolean))];
    const ul = document.getElementById(id);
    ul.innerHTML = values
      .map((v) => `<li data-value="${v}" class="${filterSelections[field] === v ? "selected" : ""}">${v}</li>`)
      .join("");
    ul.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        filterSelections[field] = li.dataset.value;
        ul.querySelectorAll("li").forEach((x) => x.classList.remove("selected"));
        li.classList.add("selected");
      });
    });
  });
}

function applyFilters() {
  renderRows();
  toast("Filters applied.");
}

function clearFilters() {
  filterSelections = { enteredby: "Any", accn: "Any", guid_prefix: "Any" };
  buildFilterLists();
  ["ff-key", "ff-uuid", "ff-catnum", "ff-status"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  renderRows();
  toast("Filters cleared.");
}

function getVisibleRows() {
  const keyQ = document.getElementById("ff-key").value.trim().toLowerCase();
  const uuidQ = document.getElementById("ff-uuid").value.trim().toLowerCase();
  const catQ = document.getElementById("ff-catnum").value.trim().toLowerCase();
  const statusQ = document.getElementById("ff-status").value.trim().toLowerCase();

  let rows = records.filter((r) => {
    if (filterSelections.enteredby !== "Any" && r.enteredby !== filterSelections.enteredby) return false;
    if (filterSelections.accn !== "Any" && r.accn !== filterSelections.accn) return false;
    if (filterSelections.guid_prefix !== "Any" && r.guid_prefix !== filterSelections.guid_prefix) return false;
    if (keyQ && !r.key.toLowerCase().includes(keyQ)) return false;
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
      if (!c.sortable) return `<th>${c.label}</th>`;
      const active = sortState.key === c.key;
      const icon = active ? (sortState.dir === "asc" ? "sort-ascending" : "sort-descending") : "sort-default";
      return `<th class="sortable" data-key="${c.key}">${c.label} <img src="icons/${icon}.svg" alt="" /></th>`;
    })
    .join("");

  row.innerHTML = `<th><input type="checkbox" id="select-all-records" /></th><th>actions</th>${headCells}`;

  document.getElementById("select-all-records").addEventListener("change", (e) => {
    getVisibleRows().forEach((r) => (r.__selected = e.target.checked));
    renderRows();
  });

  row.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
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

function renderColChooser() {
  const chooser = document.getElementById("col-chooser");
  const allCols = [...RECORD_COLUMNS.map((c) => ({ key: c.key, label: c.label, base: true })), ...EXTRA_COLUMNS.map((c) => ({ ...c, base: false }))];
  chooser.innerHTML = allCols
    .map((c) => {
      const checked = c.base ? !hiddenBaseCols.has(c.key) : visibleExtras.has(c.key);
      return `<label><input type="checkbox" data-col="${c.key}" data-base="${c.base}" ${checked ? "checked" : ""} /> ${c.label}</label>`;
    })
    .join("");

  chooser.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    cb.addEventListener("change", () => {
      const key = cb.dataset.col;
      const isBase = cb.dataset.base === "true";
      if (isBase) {
        if (cb.checked) hiddenBaseCols.delete(key);
        else hiddenBaseCols.add(key);
      } else {
        if (cb.checked) visibleExtras.add(key);
        else visibleExtras.delete(key);
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
            return `<td>${r[c.key] ?? ""}</td>`;
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
            <button data-act="filter" data-key="${r.key}" title="Filter by this key">${svgIcon("filter-solid", 14)}</button>
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
        rec.__editable = !rec.__editable;
        renderRows();
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
        document.getElementById("ff-key").value = key;
        applyFilters();
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
    } else if (realTh.classList.contains("sortable")) {
      realTh.click();
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
