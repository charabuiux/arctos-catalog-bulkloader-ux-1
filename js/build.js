/* ============================================================
   Build Your CSV page logic
   ============================================================ */

function initBuildCsvPage() {
  const counts = {};
  REPEATING_GROUPS.forEach((g) => (counts[g.key] = g.default));

  const fcRows = document.getElementById("fc-rows");
  fcRows.innerHTML = REPEATING_GROUPS.map((g) => {
    const options = Array.from({ length: 31 }, (_, n) => n)
      .map((n) => `<option value="${n}" ${n === g.default ? "selected" : ""}>${n}</option>`)
      .join("");
    return `
      <div class="fc-row">
        <select data-key="${g.key}">${options}</select>
        <div><span class="fc-name">${breakAtUnderscores(g.key)}</span><span class="fc-desc">${g.desc}</span></div>
      </div>`;
  }).join("");

  fcRows.querySelectorAll("select").forEach((sel) => {
    sel.addEventListener("change", () => {
      counts[sel.dataset.key] = parseInt(sel.value, 10);
    });
  });

  document.getElementById("reset-defaults-btn").addEventListener("click", () => {
    REPEATING_GROUPS.forEach((g) => {
      counts[g.key] = g.default;
      fcRows.querySelector(`select[data-key="${g.key}"]`).value = g.default;
    });
    toast("Field counts reset to defaults. Click “Apply to Table” to rebuild the fields table.");
  });

  document.getElementById("apply-table-btn").addEventListener("click", () => {
    buildFieldsTable(counts);
    toast("Fields table rebuilt from the selected counts.");
  });

  buildFieldsTable(counts);

  document.getElementById("select-all-fields").addEventListener("change", (e) => {
    document.querySelectorAll("#fields-tbody input[data-field]:not(:disabled)").forEach((cb) => {
      cb.checked = e.target.checked;
    });
    updateFieldCount();
  });

  document.getElementById("download-csv-btn").addEventListener("click", () => {
    const checked = Array.from(document.querySelectorAll("#fields-tbody input[data-field]:checked")).map(
      (cb) => cb.dataset.field
    );
    if (!checked.length) {
      toast("Select at least one field before downloading.");
      return;
    }
    downloadCSV("BulkRecords_template.csv", [checked]);
    toast(`Downloaded a CSV template with ${checked.length} field${checked.length === 1 ? "" : "s"}.`);
  });
}

// Lets long field names wrap after an underscore instead of mid-word on narrow screens.
function breakAtUnderscores(name) {
  return name.replace(/_/g, "_<wbr>");
}

// On phones the Category column is hidden (each group's header row already names the
// category), so the header row's name cell spans 1 column instead of 2.
const phoneQuery = window.matchMedia("(max-width: 600px)");
const catNameSpan = () => (phoneQuery.matches ? 1 : 2);
phoneQuery.addEventListener("change", () => {
  document.querySelectorAll("#fields-tbody td.cat-name").forEach((td) => (td.colSpan = catNameSpan()));
});

function buildFieldsTable(counts) {
  const tbody = document.getElementById("fields-tbody");
  const rows = [];

  RECORD_FIELDS.forEach((f) => {
    rows.push({ category: "record", field: f.name, required: !!f.required });
  });

  REPEATING_GROUPS.forEach((g) => {
    const n = counts[g.key] || 0;
    const cat = categoryForGroup(g.key);
    for (let i = 1; i <= n; i++) {
      g.sub.forEach((s) => {
        rows.push({ category: cat, field: `${cat}_${i}_${s}` });
      });
    }
  });

  let lastCat = null;
  tbody.innerHTML = rows
    .map((r, idx) => {
      const checked = r.required || idx < 3 ? "checked" : "";
      const disabled = r.required ? "disabled checked" : "";
      let header = "";
      if (r.category !== lastCat) {
        lastCat = r.category;
        const total = rows.filter((x) => x.category === r.category).length;
        header = `
        <tr class="cat-header-row" data-cat="${r.category}">
          <td class="cat-name" colspan="${catNameSpan()}"><strong>${r.category}</strong> <span class="cat-count" data-cat-count="${r.category}"></span></td>
          <td class="chk-cell"><input type="checkbox" class="cat-toggle" data-cat="${r.category}" data-total="${total}" title="Select / deselect all ${r.category} fields" aria-label="Select or deselect all ${r.category} fields" /></td>
        </tr>`;
      }
      return `${header}
        <tr>
          <td class="cat-cell">${r.category}</td>
          <td class="${r.required ? "req" : ""}">${breakAtUnderscores(r.field)}</td>
          <td class="chk-cell"><input type="checkbox" data-field="${r.field}" data-cat="${r.category}" ${r.required ? disabled : checked} /></td>
        </tr>`;
    })
    .join("");

  tbody.querySelectorAll("input[type='checkbox']:not(.cat-toggle)").forEach((cb) => {
    cb.addEventListener("change", updateFieldCount);
  });

  tbody.querySelectorAll(".cat-toggle").forEach((toggle) => {
    toggle.addEventListener("change", () => {
      tbody
        .querySelectorAll(`input[data-field][data-cat="${toggle.dataset.cat}"]:not(:disabled)`)
        .forEach((cb) => (cb.checked = toggle.checked));
      updateFieldCount();
    });
  });

  document.getElementById("fields-table-total") && null;
  window.__totalFieldRows = rows.length;
  updateFieldCount();
}

function updateFieldCount() {
  const total = window.__totalFieldRows || 0;
  const checked = document.querySelectorAll("#fields-tbody input[data-field]:checked").length;
  document.getElementById("fields-count-label").textContent = `${checked} of ${total} fields selected`;

  document.querySelectorAll("#fields-tbody .cat-toggle").forEach((toggle) => {
    const boxes = document.querySelectorAll(`#fields-tbody input[data-field][data-cat="${toggle.dataset.cat}"]`);
    const on = Array.from(boxes).filter((cb) => cb.checked).length;
    toggle.checked = on === boxes.length;
    toggle.indeterminate = on > 0 && on < boxes.length;
    document.querySelector(`[data-cat-count="${toggle.dataset.cat}"]`).textContent = `${on} of ${boxes.length} selected`;
  });
}
