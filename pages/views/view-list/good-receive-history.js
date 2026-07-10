/* ── Good Receive History ────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['good-receive-history'] = {
    label:        "Good Receive History",
    group:        "Stock",
    hasDateBar:   true,
    filterFields: ["GoodsReceiveNumber", "ReceivedBy", "Date", "Status"],
    columns:      ["Goods Receive #", "Received By", "No. of Item", "Date", "Decline/Cancel Remarks", "Document", "Action"],
  };
}());
