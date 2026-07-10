/* ── Property Masterlist ─────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};
  window.VIEW_VIEWS['property-masterlist'] = {
    label:        "Property Masterlist",
    group:        "Property",
    hasDateBar:   false,
    filterFields: ["ItemCode", "Description", "PropertyNumber", "LongDescription", "SerialNumber", "ClassificationName", "CategoryName", "BrandName", "ModelName", "PRNumber", "PONumber", "InvoiceNumber", "DRNumber", "IssuanceNo", "EmployeeName", "WarehouseName", "Location", "Area", "Region", "Branch", "Office", "DateOfAcquisition", "UsefulLife", "RemainingUsefulLife", "MaintenanceDate", "WarrantyStartDate", "WarrantyEndDate", "InsuranceStartDate", "InsuranceEndDate", "ExpiryDate", "AcquiredCost", "StraightLineDepreciation", "DiminishingBalanceDepreciation", "Status", "DisposedDate", "IssuedDate", "LastMaintenanceDate", "InventoryName", "InventoryCreatedDate", "InventoryStatus", "InventorySite", "InventoryLocation"],
    columns:      ["Item Code", "Description", "Property #", "Long Description", "Serial #", "Classification", "Category", "Brand", "Model", "PR #", "PO #", "Invoice #", "DR #", "Issuance #", "Issued To", "Region", "Branch", "Office", "Acquired Date", "Useful Life", "Remaining Useful Life", "Next Maintenance", "Warranty Date", "Insurance Date", "Expiry Date", "Acquired Cost", "Depreciated Cost", "Status", "Disposed Date", "Issued Date", "Last Maintenance", "Inventory Name", "Inventory Date", "Inventory Status", "Inventory Site", "Inventory Location"],
  };
}());
