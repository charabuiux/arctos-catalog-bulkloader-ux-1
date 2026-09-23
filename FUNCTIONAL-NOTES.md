# Arctos Bulkloader — Functional Notes

Functional information about how the tool is intended to work, as opposed to how the prototype is built. Add to this file as new behavior is decided.

## Browse & Edit

### Records table

- **Read-only columns:** key, enteredby, entered_to_bulk_date and uuid are static text, shown together on the left of the table (in that order, before status). Clicking a key number does nothing.
- **Filter by key:** use the filter icon in the actions column. The notes panel says "Click the filter icon to filter by key(s)".
- **All other data cells:** editable (white background, thin light grey border) directly in the table, including Status, which is plain text and no longer a pill. Edits save when the cell loses focus.
- **Actions column** (left side of the table, after the select checkbox):
  - **Edit (pen) icon:** opens a page dedicated to that record, showing much more detail than the table does. Keep this icon even though the table cells are editable inline. The detail page is not built in the prototype yet; for now the icon only toggles an edit state.
  - **Duplicate icon:** copies the record.
  - **Filter icon:** filters the table to that record's key.

### Set status shortcuts (notes panel)

- `autoload`: publish record.
- `DELETE`: delete a record. Takes about 30 minutes and is case-sensitive.

### Publishing

- The queue link is labelled **Publishing Queue**.
- **Publish Selected** sends the selected records to the Publishing Queue.

## Build Your CSV

- Fields are grouped by category. Each category has a header row with a checkbox that selects or deselects every field in that category. The box shows a partial state when only some fields are selected, and the header shows "n of N selected". Required fields stay checked.
- The fields table extends the full height of the page instead of scrolling inside its own box.

## Staging Table

- Only one user's data can be in the staging table at a time.
- If another user's data is in the table, an upload fails with "Your file could not be uploaded because there is currently data in the staging table."
- The table becomes available when the data owner either uploads their data to their Browse & Edit table or clears it from the staging table.
- Wait at least 30 minutes from the data entry time before contacting the data's owner. If they don't respond within 30 minutes of being contacted, you may download their data, attach it to a GitHub Issue, and tag them by GitHub username.
- The countdown pill shows the time by which the current user should finish, 30 minutes after they start ("Please finish using the staging table by <time>").
