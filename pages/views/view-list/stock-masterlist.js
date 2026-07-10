/* ── Stock Masterlist ────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['stock-masterlist'] = {
    label:        "Stock Masterlist",
    group:        "Stock",
    hasDateBar:   false,
    filterFields: ["ItemCode", "Description", "Quantity", "Unit", "Region", "ClassificationName", "CustodianType", "MinStockLevel"],
    columns:      ["Item Code", "Description", "Quantity", "Unit", "Custodian Type", "Region", "Min. Stock Level"],
  };
}());
