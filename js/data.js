/* ============================================================
   Shared demo data for the Arctos Bulkload prototype
   ============================================================ */

const RECORD_FIELDS = [
  { name: "guid_prefix", desc: "GUID prefix", required: true },
  { name: "enteredby", desc: "entered by username", required: true },
  { name: "accn", desc: "accession number", required: true },
  { name: "status", desc: "record status" },
  { name: "cat_num", desc: "catalog number" },
  { name: "record_type", desc: "type of record" },
  { name: "record_remark", desc: "remark on record" },
];

const REPEATING_GROUPS = [
  { key: "identifier_count", desc: "identifiers (Other IDs)", default: 5, sub: ["type", "issued_by", "value", "relationship", "remark"] },
  { key: "identification_count", desc: "identifications", default: 2, sub: ["type", "remark"] },
  { key: "identification_attribute_count", desc: "attributes per identification", default: 3, sub: ["attribute", "value", "remark"] },
  { key: "identification_determiner_count", desc: "determiners per identification", default: 3, sub: ["agent", "is_current", "remark"] },
  { key: "collector_count", desc: "collector-agents", default: 8, sub: ["agent", "is_primary", "remark"] },
  { key: "locality_attribute_count", desc: "locality attributes", default: 6, sub: ["attribute", "value", "remark"] },
  { key: "event_attribute_count", desc: "event attributes", default: 6, sub: ["attribute", "value", "remark"] },
  { key: "part_count", desc: "parts", default: 20, sub: ["part_name", "count", "remark"] },
  { key: "part_attribute_count", desc: "attributes per part", default: 4, sub: ["attribute", "value", "remark"] },
  { key: "attribute_count", desc: "record attributes", default: 20, sub: ["attribute", "value", "remark"] },
];

/* Category shown in the left column of the fields table */
function categoryForGroup(groupKey) {
  return groupKey.replace(/_count$/, "");
}

const HEADER_MISMATCH_REPORT = [
  { field: "wrongly_spelled", result: "no match" },
  { field: "outdated_field", result: "no match" },
  { field: "outdated_field2", result: "no match" },
  { field: "missingfield", result: "Missing" },
  { field: "matching_field1", result: "has match" },
  { field: "matching_field2", result: "has match" },
  { field: "matching_field3", result: "has match" },
  { field: "matching_field4", result: "has match" },
  { field: "matching_field5", result: "has match" },
  { field: "matching_field6", result: "has match" },
  { field: "matching_field7", result: "has match" },
  { field: "matching_field8", result: "has match" },
  { field: "matching_field9", result: "has match" },
  { field: "matching_field10", result: "has match" },
  { field: "matching_field11", result: "has match" },
];

const VALIDATION_ERRORS = [
  { count: 1, status: "locality_higher_geog matches 0 records; locality_specific is required", cell: "A11" },
];

const DEMO_RECORDS = [
  { key: "key_0000001", status: "NEW", extras: 0, enteredby: "user2", entered_to_bulk_date: "2026-01-21T16:51:58.56769", accn: "1004", guid_prefix: "MVZ:Fish", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000002", status: "NEW", extras: 0, enteredby: "jdoe", entered_to_bulk_date: "2026-01-22T22:50:45.801777", accn: "1004", guid_prefix: "MVZ:Fish", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000003", status: "NEW", extras: 0, enteredby: "testuser", entered_to_bulk_date: "2026-01-23T22:50:45.801777", accn: "1004", guid_prefix: "MVZ:Bird", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000004", status: "NEW", extras: 0, enteredby: "testuser", entered_to_bulk_date: "2026-01-24T22:50:45.801777", accn: "1011", guid_prefix: "MVZ:Fish", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000005", status: "NEW", extras: 0, enteredby: "testuser", entered_to_bulk_date: "2026-01-25T22:50:45.801777", accn: "1011", guid_prefix: "MVZ:Fish", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000006", status: "NEW", extras: 0, enteredby: "testuser", entered_to_bulk_date: "2026-01-26T22:50:45.801777", accn: "1011", guid_prefix: "MVZ:Arch", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
  { key: "key_0000007", status: "NEW", extras: 0, enteredby: "testuser", entered_to_bulk_date: "2026-01-27T22:50:45.801777", accn: "1011", guid_prefix: "MVZ:Fish", cat_num: "cat_num", uuid: "uuid", uuid_issued_by: "uuid_issued_by", record_type: "FossilSpecimen", record_remark: "", identification_count: 1 },
];

const RECORD_COLUMNS = [
  { key: "key", label: "key", sortable: false, readonly: true },
  { key: "enteredby", label: "enteredby", sortable: true, readonly: true },
  { key: "entered_to_bulk_date", label: "entered_to_bulk_date", sortable: true, defaultSort: "asc", readonly: true },
  { key: "uuid", label: "uuid", sortable: false, readonly: true },
  { key: "status", label: "status", sortable: true },
  { key: "extras", label: "extras", sortable: true },
  { key: "accn", label: "accn", sortable: true },
  { key: "guid_prefix", label: "guid_prefix", sortable: true },
  { key: "cat_num", label: "cat_num", sortable: true },
  { key: "uuid_issued_by", label: "uuid_issued_by", sortable: false },
  { key: "record_type", label: "record_type", sortable: true },
];

const EXTRA_COLUMNS = [
  { key: "record_remark", label: "record_remark" },
  { key: "identification_count", label: "identification_count" },
];
