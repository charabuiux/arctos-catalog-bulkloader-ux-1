# Arctos Bulkloader — Functional Notes

Functional information about how the tool is intended to work, as opposed to how the prototype is built. Add to this file as new behavior is decided.

## Notices (all pages)

- Messages shown after an action (confirmations, errors, "not available" notices) stay on screen for a time based on their length, sized for users around 60 years old:
  - **Duration = 2 seconds + 80 ms × number of characters**, never less than 6 seconds or more than 20 seconds.
  - 80 ms per character is a reading speed of about 150 words a minute, slower than a typical adult's ~240, to allow for age-related slower reading and reduced near vision. The 2 seconds covers noticing the message and starting to read it.
  - Examples: "Filters applied." 6 s; the no-rows-selected notice 8 s; the Publish Selected confirmation about 11.5 s.
- A notice also closes as soon as the user clicks anywhere else on the page. Clicking the notice itself doesn't close it.

## Browse & Edit

### Records table

- **Frozen header row:** the table doesn't scroll in its own box; the whole page scrolls. Once the column headers reach the top of the screen, they stay pinned there while the rows and footer scroll underneath. The pinned headers can still be clicked to sort or select all.
- **Default columns:** when the page opens, only columns with a value in at least one record are shown; columns that are empty in every record are hidden. Any character counts as a value, including `0` (so a column of all zeros, like extras, is shown). The key column always shows. A count next to the show all / hide empty toggle shows how many columns are visible and hidden.
- **show all col. / hide empty col.:** one toggle link. While any column is hidden it reads "show all col." (eye icon) and shows every column. Once every column is showing it reads "hide empty col." (eye-slash icon) and returns to the default view.
- **customize view:** not built in the prototype yet; for now the link shows a notice saying so.
- **Frozen key column:** when the table scrolls sideways, the key column stays on the left edge (in the header row and every data row). No other column is frozen; the checkbox and actions columns scroll away.
- **Read-only columns:** key and entered_to_bulk_date are static text. Clicking a key number does nothing.
- **Entered By, Accession and Collection filters:** each list allows more than one choice. Clicking a value selects it; clicking it again deselects it. Clicking Any clears that list's choices, and Any is highlighted whenever nothing else is chosen. Rows must match one of the chosen values in each list. The table is filtered when the user clicks Apply Filter.
- **Filter by key:** use the filter icon in the actions column (hover text: "Add to key filter"). The notes panel says "Click the filter icon to filter by key(s)".
  - Clicking it adds that row's key to the Key(s) field. Keys from further rows are added to the same field, separated by commas. The table is filtered when the user clicks Apply Filter.
  - If the key is already in the field, it isn't added again and an error says "<key> is already included in the Key(s) filter."
  - The Key(s) field shows rows matching any of the listed keys.
- **All other data cells:** editable (white background, thin light grey border) directly in the table, including Status, which is plain text and no longer a pill. Edits save when the cell loses focus.
- **Actions column** (left side of the table, after the select checkbox):
  - **Edit (pen) icon:** opens a page dedicated to that record, showing much more detail than the table does. Keep this icon even though the table cells are editable inline. This is the Enter / Edit Record page. It isn't built in the prototype yet; for now the icon shows a notice saying which page it would open.
  - **Duplicate icon:** copies the record.
  - **Filter icon:** adds that record's key to the Key(s) filter (see Filter by key).

### Set status shortcuts (notes panel)

- `autoload`: publish record.
- `DELETE`: delete a record. Takes about 30 minutes and is case-sensitive.

### Deleting

- **delete selected** changes the status of the selected rows to `DELETE` and confirms: Status updated to "DELETE" for N rows. They will be deleted in about 30 minutes. The rows stay in the table until then.
- If no rows are selected, delete selected changes nothing and says: No rows are selected. Select one or more rows, then click delete selected.

### Publishing

- The queue link is labelled **Publishing Queue**. It opens the page currently titled "Cache Status", which isn't built in the prototype yet; for now the link shows a notice saying so.
- **Publish Selected** changes the status of the selected rows to `autoload` and confirms: Status updated to "autoload" for N rows. Once the system publishes them, they will no longer appear in Browse & Edit.
- If no rows are selected, Publish Selected changes nothing and says: No rows are selected. Select one or more rows, then click Publish Selected.

#### What happens after a row is set to autoload

Source: [Arctos Handbook, Bulkloader documentation](https://handbook.arctosdb.org/documentation/bulkloader.html) (Status and Post-load sections).

- A script periodically tries to load each `autoload` row into Arctos. There are two possible results:
  - **Success:** the catalog record is created and the bulkloader row is deleted, so **the row no longer appears in Browse & Edit** after it's published.
  - **Error:** the row stays in Browse & Edit, and its status column shows the error message so the user can fix it and set it to `autoload` again.
- A successfully loaded record then has to be refreshed in the cache before it appears anywhere in Arctos. Records are refreshed in the order they enter the queue. This often takes less than a minute, but with many thousands of queued records it can take up to several days. Between loading and the cache refresh, the record isn't visible in any user interface, including Browse & Edit.
- Prototype only: rows set to `autoload` stay in the table with that status; the prototype doesn't simulate loading or removing them.

#### Design recommendation: show the expected turnaround time

- It would be ideal to show users an **expected turnaround time** from setting a row to `autoload` to the record being published and visible in Arctos. For example, the Publish Selected confirmation or the Publishing Queue ("Cache Status") page could show an estimate based on how many records are ahead in the queue.
- Without it, users see their rows disappear from Browse & Edit but can't find the new records anywhere until the cache refresh finishes, which can look like data was lost.

## Build Your CSV

- Fields are grouped by category. Each category has a header row with a checkbox that selects or deselects every field in that category. The box shows a partial state when only some fields are selected, and the header shows "n of N selected". Required fields stay checked.
- The fields table extends the full height of the page instead of scrolling inside its own box.

## Staging Table

- Only one user's data can be in the staging table at a time.
- If another user's data is in the table, an upload fails with "Your file could not be uploaded because there is currently data in the staging table."
- The table becomes available when the data owner either uploads their data to their Browse & Edit table or clears it from the staging table.
- Wait at least 30 minutes from the data entry time before contacting the data's owner. If they don't respond within 30 minutes of being contacted, you may download their data, attach it to a GitHub Issue, and tag them by GitHub username.
- The countdown pill shows the time by which the current user should finish, 30 minutes after they upload their data ("Please finish using the staging table by <time>"). The time stays the same when the page is refreshed or revisited, and only changes with a new upload.
- Once that time has passed, the clock icon and the time turn red.
- Prototype only: the upload time is saved in the tester's browser. If a tester reaches the Staging page without uploading, their first visit counts as the upload time.
