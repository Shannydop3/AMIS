/* ── Property Transfer History ───────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['property-transfer-history'] = {
    label:        "Property Transfer History",
    group:        "Property",
    hasDateBar:   true,
    filterFields: ["TransferNumber", "TransactedBy", "Date", "Status"],
    columns:      ["Transfer #", "Remarks", "Transacted By", "Date", "Decline/Cancel Remarks", "Document", "Action"],
  };
}());
