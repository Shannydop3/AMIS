/* ── Property Issuance History ───────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['property-issuance-history'] = {
    label:        "Property Issuance History",
    group:        "Property",
    hasDateBar:   true,
    filterFields: ["IssuanceNo", "PropertyNumber", "Description", "EmployeeName", "Date", "Status"],
    columns:      ["Issuance #", "Property #", "Description", "Issued To", "Date", "Status", "Decline/Cancel Remarks", "Document", "Action"],
  };
}());
