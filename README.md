# Arctos Bulkload Catalog Records: UX prototype

A clickable HTML prototype of the redesigned bulkloader for [Arctos](https://arctosdb.org). It covers the full workflow for bulkloading catalog records: preparing a CSV, uploading it to the staging table, validating and fixing records, and publishing them from Browse & Edit.

## Links

- **Live, clickable prototype:** https://charabuiux.github.io/arctos-catalog-bulkloader-ux-1/
- **Repository:** https://github.com/charabuiux/arctos-catalog-bulkloader-ux-1
- **User pathways flowchart:** https://claude.ai/artifact/U4ZsBAs6sgQUFgVWjsh4nT

## Workflow

| Step | Page | What the user does |
| --- | --- | --- |
| Start | [`index.html`](index.html) | Chooses to prepare a CSV or upload one |
| 1 · Prepare CSV | [`prepare-csv.html`](prepare-csv.html), [`build-csv.html`](build-csv.html) | Builds a CSV template by choosing fields, or exports search results |
| 2 · Upload CSV | [`upload-csv.html`](upload-csv.html), [`header-mismatches.html`](header-mismatches.html) | Uploads the CSV to staging; fixes header mismatches if any |
| 3 · Staging | [`staging.html`](staging.html), [`check-status.html`](check-status.html) | Validates, fixes errors and loads records within a 30-minute window |
| 4 · Browse & Edit | [`browse-edit.html`](browse-edit.html) | Filters, edits and publishes records |

The stepper at the top of each page links to every step, so you can jump around freely.

## Trying different scenarios

Some pages have a **Prototype demo control** panel at the bottom for switching between states:

- **Upload CSV:** simulate a successful upload, a header mismatch, or a staging table occupied by another user.
- **Staging:** show the staging table as available, occupied by another user, or empty.

## Running it locally

No build step or server is needed. Open `index.html` in a browser.

## Project files

- `css/styles.css`: shared styles
- `js/`: page behavior and demo data (`data.js`)
- `icons/`: SVG and PNG icons
- `UI elements/`: standalone component explorations
- [`FUNCTIONAL-NOTES.md`](FUNCTIONAL-NOTES.md): how the tool is intended to work, as opposed to how the prototype is built

All names, emails and records in the prototype are placeholder demo data.
