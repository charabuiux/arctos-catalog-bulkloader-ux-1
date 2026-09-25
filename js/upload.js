/* ============================================================
   Upload CSV page logic
   ============================================================ */

function initUploadPage() {
  const fileInput = document.getElementById("file-input");
  const chooseBtn = document.getElementById("choose-file-btn");
  const fileStatus = document.getElementById("file-status");
  const uploadBtn = document.getElementById("upload-btn");
  const uploadHelper = document.getElementById("upload-helper");
  const mismatchInline = document.getElementById("mismatch-inline");

  let fileName = Store.get("file_name", null);
  let cameBackWithMismatch = Store.get("mismatch_pending", false);

  function renderFileState() {
    if (fileName) {
      fileStatus.innerHTML = `<span class="file-chosen">${fileName}
        <button class="del-file" id="clear-file-btn" title="Remove file">${svgIcon("trash-solid", 14)}</button>
      </span>`;
      document.getElementById("clear-file-btn").addEventListener("click", () => {
        fileName = null;
        Store.remove("file_name");
        Store.remove("mismatch_pending");
        cameBackWithMismatch = false;
        fileInput.value = "";
        mismatchInline.style.display = "none";
        renderFileState();
      });
      uploadBtn.disabled = false;
      uploadHelper.style.display = "none";
    } else {
      fileStatus.textContent = "No file chosen";
      uploadBtn.disabled = true;
      uploadHelper.style.display = "inline";
    }

    if (fileName && cameBackWithMismatch) {
      mismatchInline.style.display = "flex";
      uploadHelper.textContent = "Re-upload a file to proceed";
      uploadHelper.style.display = "inline";
      uploadBtn.disabled = true;
    } else {
      mismatchInline.style.display = "none";
      uploadHelper.textContent = "Upload a file to proceed";
    }
  }

  chooseBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      fileName = fileInput.files[0].name;
      Store.set("file_name", fileName);
      Store.remove("mismatch_pending");
      cameBackWithMismatch = false;
      renderFileState();
    }
  });

  uploadBtn.addEventListener("click", () => {
    if (!fileName) return;
    const scenario = document.querySelector('input[name="scenario"]:checked').value;

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading…";

    setTimeout(() => {
      uploadBtn.textContent = "Upload CSV to Staging →";
      if (scenario === "mismatch") {
        Store.set("mismatch_pending", true);
        document.getElementById("modal-mismatch-filename").textContent = fileName;
        openModal("modal-mismatch");
      } else if (scenario === "occupied") {
        Store.set("staging_status", "occupied-by-other");
        openModal("modal-occupied");
      } else {
        Store.set("staging_status", "available");
        Store.set("staging_uploaded_at", Date.now());
        Store.set("staging_validated", false);
        Store.remove("mismatch_pending");
        document.getElementById("modal-success-filename").textContent = fileName;
        openModal("modal-success");
      }
      uploadBtn.disabled = false;
    }, 500);
  });

  renderFileState();
}
