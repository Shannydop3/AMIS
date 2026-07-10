/* ── Property Request History ────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['property-request-history'] = {
    label:        "Property Request History",
    group:        "Property",
    hasDateBar:   true,
    filterFields: ["RequestNumber", "RequestedBy", "ReturnDate", "TransactionDate", "Status"],
    columns:      ["Request #", "Requested By", "Return Date", "Transaction Date", "Status", "Decline/Cancel Remarks", "Document", "Action"],
  };
}());
