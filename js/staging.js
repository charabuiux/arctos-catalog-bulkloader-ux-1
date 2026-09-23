/* ============================================================
   Staging Table page logic
   ============================================================ */

function initStagingPage() {
  renderHeader();
  renderStepper(3, { title: "Bulkload Catalog Records: Staging" });
  renderFooter();
  hydrateIcons();

  const occupiedView = document.getElementById("occupied-view");
  const availableView = document.getElementById("available-view");
  const emptyView = document.getElementById("empty-view");

  function currentStatus() {
    return Store.get("staging_status", "available");
  }

  function renderState() {
    const status = currentStatus();
    occupiedView.style.display = status === "occupied-by-other" ? "block" : "none";
    availableView.style.display = status === "available" ? "block" : "none";
    emptyView.style.display = status === "empty" ? "block" : "none";
    const description = document.getElementById("staging-description");
    description.style.display = status === "occupied-by-other" ? "none" : "";
    description.textContent =
      status === "empty"
        ? "This Staging Table holds records temporarily for validation. Only 1 user can use the staging table at a time."
        : description.dataset.full;
    document.querySelectorAll('input[name="staging-demo"]').forEach((r) => {
      r.checked = r.value === status;
    });

    if (status === "occupied-by-other") {
      const since = Store.get("occupied_since", Date.now() - 25 * 60 * 1000);
      Store.set("occupied_since", since);
      const mins = Math.max(0, Math.round((Date.now() - since) / 60000));
      const d = new Date(since);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s/g, "").toLowerCase();
      document.getElementById("occupied-since").innerHTML = `<strong>${mins} minutes</strong> since data was entered ${dateStr} ${timeStr}`;
    }

    if (status === "available") {
      const deadline = new Date(Date.now() + 30 * 60000);
      document.getElementById("deadline-time").textContent = deadline.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }

  document.querySelectorAll('input[name="staging-demo"]').forEach((r) => {
    r.addEventListener("change", () => {
      Store.set("staging_status", r.value);
      renderState();
    });
  });

  document.getElementById("validate-btn").addEventListener("click", () => {
    toast("Validation started in the background…");
    setTimeout(() => {
      Store.set("staging_validated", true);
      toast("Validation complete — 1 error found. See Check Status for details.");
    }, 900);
  });

  document.getElementById("strip-junk-btn").addEventListener("click", () => {
    toast("Non-printing characters stripped from staged text fields.");
  });

  document.getElementById("edit-grid-btn").addEventListener("click", () => {
    toast("This opens an inline, editable grid of the staging table records.");
  });

  document.getElementById("download-their-data-btn").addEventListener("click", () => {
    const header = Object.keys(DEMO_RECORDS[0]);
    const rows = [header, ...DEMO_RECORDS.map((r) => header.map((h) => r[h]))];
    downloadCSV("staging_table_data.csv", rows);
    toast("Downloaded the data currently in the staging table.");
  });

  document.getElementById("download-staging-btn").addEventListener("click", () => {
    const header = Object.keys(DEMO_RECORDS[0]);
    const rows = [header, ...DEMO_RECORDS.map((r) => header.map((h) => r[h]))];
    downloadCSV("staging_table.csv", rows);
    toast("Staging table exported as CSV.");
  });

  document.getElementById("clear-data-btn").addEventListener("click", () => {
    if (confirm("Permanently clear all records from the staging table? This cannot be undone.")) {
      Store.set("staging_status", "empty");
      Store.set("staging_validated", false);
      Store.remove("mismatch_pending");
      Store.remove("file_name");
      toast("Staging table cleared.");
      renderState();
    }
  });

  document.getElementById("load-browse-btn").addEventListener("click", () => {
    Store.set("browse_count", DEMO_RECORDS.length);
  });

  renderState();
}
