/* ============================================
   AMIS – Shared Layout (Sidebar + Header)
   ============================================
   USAGE — in every page's <head>:

     <script>
       window.AMIS_PAGE = { id: 'dashboard', title: 'Dashboard' };
     </script>
     <script src="../../common/common.js"></script>
     <script src="../../common/layout.js"></script>

   In every page's <body>, use this exact structure:

     <body>
       <div id="layout-root"></div>   ← layout.js fills this
       <div id="page-body">
         ... your page-specific content here ...
       </div>
       <script src="page.js"></script>
     </body>

   layout.js injects the full sidebar + header into
   #layout-root, then MOVES #page-body into .page-content.
   Nothing is destroyed — no body.innerHTML rewriting.
   ============================================ */

(function () {
  'use strict';

  /* ── Operation Module sub-items ────────── */
  var OP_ITEMS = [
    { id: 'op-goods-receive',                       label: 'Goods Receive',                       href: '../operation-module/operation-module.html?op=goods-receive',                       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 16.5 1 14.65 1c-1.04 0-1.96.5-2.59 1.28L12 2.37l-.06-.1C11.35 1.5 10.43 1 9.35 1 7.5 1 6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5 0H9c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1z"/></svg>' },
    { id: 'op-tagging',                             label: 'Tagging',                             href: '../operation-module/operation-module.html?op=tagging',                             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>' },
    { id: 'op-property-information',               label: 'Property Information',               href: '../operation-module/operation-module.html?op=property-information',               icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>' },
    { id: 'op-property-issuance',                  label: 'Property Issuance',                  href: '../operation-module/operation-module.html?op=property-issuance',                  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' },
    { id: 'op-stock-issuance',                     label: 'Stock Issuance',                     href: '../operation-module/operation-module.html?op=stock-issuance',                     icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' },
    { id: 'op-property-request',                   label: 'Property Request',                   href: '../operation-module/operation-module.html?op=property-request',                   icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' },
    { id: 'op-stock-request',                      label: 'Stock Request',                      href: '../operation-module/operation-module.html?op=stock-request',                      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' },
    { id: 'op-property-transfer',                  label: 'Property Transfer',                  href: '../operation-module/operation-module.html?op=property-transfer',                  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>' },
    { id: 'op-property-return',                    label: 'Property Return',                    href: '../operation-module/operation-module.html?op=property-return',                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>' },
    { id: 'op-property-return-request',            label: 'Property Return Request',            href: '../operation-module/operation-module.html?op=property-return-request',            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>' },
    { id: 'op-stock-return',                       label: 'Stock Return',                       href: '../operation-module/operation-module.html?op=stock-return',                       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>' },
    { id: 'op-property-maintenance-request',       label: 'Property Maintenance Request',       href: '../operation-module/operation-module.html?op=property-maintenance-request',       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>' },
    { id: 'op-property-maintenance',               label: 'Property Maintenance',               href: '../operation-module/operation-module.html?op=property-maintenance',               icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>' },
    { id: 'op-property-verification',              label: 'Property Verification',              href: '../operation-module/operation-module.html?op=property-verification',              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' },
    { id: 'op-property-gate-pass-request',         label: 'Property Gate Pass Request',         href: '../operation-module/operation-module.html?op=property-gate-pass-request',         icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' },
    { id: 'op-inventory-count',                    label: 'Inventory Count',                    href: '../operation-module/operation-module.html?op=inventory-count',                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>' },
    { id: 'op-personal-property-gate-pass-request',label: 'Personal Property Gate Pass Request',href: '../operation-module/operation-module.html?op=personal-property-gate-pass-request',icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' },
    { id: 'op-property-disposal',                  label: 'Property Disposal',                  href: '../operation-module/operation-module.html?op=property-disposal',                  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' },
    { id: 'op-property-disposal-request',          label: 'Property Disposal Request',          href: '../operation-module/operation-module.html?op=property-disposal-request',          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' },
    { id: 'op-stock-disposal',                     label: 'Stock Disposal',                     href: '../operation-module/operation-module.html?op=stock-disposal',                     icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' },
  ];

  /* ── Views sub-items ───────────────────── */
  var VIEWS_ITEMS = [
    { id: 'view-property-masterlist',                   label: 'Property Masterlist',                      href: '../views/views.html?view=property-masterlist',                   icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>' },
    { id: 'view-stock-masterlist',                      label: 'Stock Masterlist',                         href: '../views/views.html?view=stock-masterlist',                      icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 16.5 1 14.65 1c-1.04 0-1.96.5-2.59 1.28L12 2.37l-.06-.1C11.35 1.5 10.43 1 9.35 1 7.5 1 6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>' },
    { id: 'view-good-receive-history',                  label: 'Good Receive History',                     href: '../views/views.html?view=good-receive-history',                  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 16.5 1 14.65 1c-1.04 0-1.96.5-2.59 1.28L12 2.37l-.06-.1C11.35 1.5 10.43 1 9.35 1 7.5 1 6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg>' },
    { id: 'view-property-issuance-history',             label: 'Property Issuance History',                href: '../views/views.html?view=property-issuance-history',             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' },
    { id: 'view-property-request-history',              label: 'Property Request History',                 href: '../views/views.html?view=property-request-history',              icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' },
    { id: 'view-property-transfer-history',             label: 'Property Transfer History',                href: '../views/views.html?view=property-transfer-history',             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>' },
    { id: 'view-property-maintenance-history',          label: 'Property Maintenance History',             href: '../views/views.html?view=property-maintenance-history',          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>' },
    { id: 'view-gate-pass-view',                        label: 'Gate Pass View',                           href: '../views/views.html?view=gate-pass-view',                        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' },
    { id: 'view-stock-issuance-history',                label: 'Stock Issuance History',                   href: '../views/views.html?view=stock-issuance-history',                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>' },
    { id: 'view-stock-request-history',                 label: 'Stock Request History',                    href: '../views/views.html?view=stock-request-history',                 icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>' },
    { id: 'view-inventory-count-view',                  label: 'Inventory Count View',                     href: '../views/views.html?view=inventory-count-view',                  icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>' },
    { id: 'view-property-disposal-history',             label: 'Property Disposal History',                href: '../views/views.html?view=property-disposal-history',             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' },
    { id: 'view-property-disposal-request-history',     label: 'Property Disposal Request History',        href: '../views/views.html?view=property-disposal-request-history',     icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' },
    { id: 'view-property-movement',                     label: 'Property Movement',                        href: '../views/views.html?view=property-movement',                     icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>' },
    { id: 'view-stock-card',                            label: 'Stock Card',                               href: '../views/views.html?view=stock-card',                            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>' },
    { id: 'view-property-card',                         label: 'Property Card',                            href: '../views/views.html?view=property-card',                         icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>' },
    { id: 'view-ppe-ledger-card',                       label: 'PPE Ledger Card',                          href: '../views/views.html?view=ppe-ledger-card',                       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>' },
    { id: 'view-sep-ledger-card',                       label: 'SEP Ledger Card',                          href: '../views/views.html?view=sep-ledger-card',                       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>' },
    { id: 'view-rspi-view',                             label: 'RSPI View',                                href: '../views/views.html?view=rspi-view',                             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>' },
    { id: 'view-rsmi-view',                             label: 'RSMI View',                                href: '../views/views.html?view=rsmi-view',                             icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>' },
    { id: 'view-regspi-view',                           label: 'RegSPI View',                              href: '../views/views.html?view=regspi-view',                           icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>' },
    { id: 'view-tagging-history',                       label: 'Tagging History',                          href: '../views/views.html?view=tagging-history',                       icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>' },
    { id: 'view-personal-property-gate-pass-request',   label: 'Personal Property Gate Pass Request View', href: '../views/views.html?view=personal-property-gate-pass-request',   icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>' },
    { id: 'view-property-return-history',               label: 'Property Return History',                  href: '../views/views.html?view=property-return-history',               icon: '' },
    { id: 'view-stock-disposal-history',                label: 'Stock Disposal History',                   href: '../views/views.html?view=stock-disposal-history',                icon: '' },
    { id: 'view-audit-trail',                           label: 'Audit Trail',                              href: '../views/views.html?view=audit-trail',                           icon: '' },
  ];

  /* ── Nav items ────────────────────────── */
  var NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '../dashboard/dashboard.html',
      icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="8" height="10" x="13" y="11" fill="currentColor" rx="1"/><rect width="8" height="6" x="3" y="15" fill="currentColor" rx="1"/><rect width="8" height="6" x="13" y="3" fill="currentColor" rx="1"/><rect width="8" height="10" x="3" y="3" fill="currentColor" rx="1"/></svg>',
    },
    {
      id: 'system',
      label: 'System',
      href: '../system/system.html',
      icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13 7.813a2.751 2.751 0 1 0-2 0v1.363l-3.85 2.25v4.458l-1.28.644a2.75 2.75 0 1 0 1.08 1.696l1.165-.587L12 19.908l3.885-2.27l1.165.585q-.05.256-.05.527a2.75 2.75 0 1 0 1.13-2.223l-1.281-.644v-4.457l-3.85-2.25z"/></svg>',
    },
    {
      id: 'user-management',
      label: 'User Management',
      href: '../user-management/user-management.html',
      icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M13.07 10.41a5 5 0 0 0 0-5.82A3.4 3.4 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.4 3.4 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z"/></svg>',
    },
    {
      id: 'files-data',
      label: 'Files Data',
      href: '../files-data/files-data.html',
      icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M16 420a28 28 0 0 0 28 28h424a28 28 0 0 0 28-28V208H16Zm480-296a28 28 0 0 0-28-28H212.84l-48-32H44a28 28 0 0 0-28 28v84h480Z"/></svg>',
    },
    {
      id: 'operation-module',
      label: 'Operation Module',
      href: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.5 2.717L2 5.926V21.5l5.5-2.267zm2 16.193l1.75 1.033V18a6.75 6.75 0 0 1 3.25-5.773V5.091l-5-2.953zM22 2.5v10.062a6.77 6.77 0 0 0-5.5-1.145v-6.65zm-3 11.626V12.75h-2v1.376a4 4 0 0 0-1.854 1.072l-1.193-.689l-1 1.732l1.192.688a4 4 0 0 0 0 2.142l-1.192.688l1 1.732l1.193-.689A4 4 0 0 0 17 21.874v1.376h2v-1.376a4 4 0 0 0 1.854-1.072l1.192.689l1-1.732l-1.191-.688a4 4 0 0 0 0-2.142l1.191-.688l-1-1.732l-1.192.688A4 4 0 0 0 19 14.127m-2.715 2.844a2 2 0 0 1 3.43 0l.036.063c.159.287.249.616.249.967c0 .35-.09.68-.249.967l-.037.063a2 2 0 0 1-3.429 0l-.037-.063A2 2 0 0 1 16 18a2 2 0 0 1 .248-.967z"/></svg>',
      children: OP_ITEMS,
    },
    {
      id: 'sticker-tag',
      label: 'Sticker Tag',
      href: '../sticker-tag/sticker-tag.html',
      icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M18 7H6V3h12zm0 5.5q.425 0 .713-.288T19 11.5t-.288-.712T18 10.5t-.712.288T17 11.5t.288.713t.712.287M16 19v-4H8v4zm2 2H6v-4H2v-6q0-1.275.875-2.137T5 8h14q1.275 0 2.138.863T22 11v6h-4z"/></svg>',
    },
    {
      id: 'views',
      label: 'Views',
      href: '#',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M16 9h5.5L16 3.5zM7 2h10l6 6v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2M3 6v16h18v2H3a2 2 0 0 1-2-2V6z"/></svg>',
      children: VIEWS_ITEMS,
    },
    {
      id: 'about',
      label: 'About',
      href: '../about/about.html',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path fill="currentColor" d="M7.5 1C6.7 1 6 1.7 6 2.5S6.7 4 7.5 4S9 3.3 9 2.5S8.3 1 7.5 1M4 5v1s2 0 2 2v2c0 2-2 2-2 2v1h7v-1s-2 0-2-2V6c0-.5-.5-1-1-1z"/></svg>',
    },
  ];

  /* ── Determine if a views sub-item is active ── */
  function activeViewId() {
    if (typeof URLSearchParams === 'undefined') return null;
    var params = new URLSearchParams(window.location.search);
    var v = params.get('view');
    return v ? 'view-' + v : null;
  }

  /* ── Determine if an op sub-item is active ── */
  function activeOpId() {
    if (typeof URLSearchParams === 'undefined') return null;
    var params = new URLSearchParams(window.location.search);
    var v = params.get('op');
    return v ? 'op-' + v : null;
  }

  /* ── Build nav HTML ───────────────────────── */
  function buildNav(activeId) {
    var currentViewId = activeViewId();
    var currentOpId   = activeOpId();
    /* Submenus only open when the user is currently on that section's page */
    var isViewsPage   = (currentViewId !== null);
    var isOpPage      = (currentOpId !== null);

    return NAV_ITEMS.map(function (item) {
      /* ── Views: expandable submenu ── */
      if (item.id === 'views' && item.children) {
        var isOpen = isViewsPage;
        var html =
          '<li class="nav-item nav-item--has-children' + (isOpen ? ' open active' : '') + '" id="nav-views-item">' +
            '<button class="nav-link nav-link--parent" id="nav-views-toggle" aria-expanded="' + isOpen + '" data-tip="' + item.label + '">' +
              item.icon +
              '<span class="nav-label">' + item.label + '</span>' +
              '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<ul class="nav-sub-list">';

        item.children.forEach(function (child) {
          var isChildActive = (child.id === currentViewId);
          html +=
            '<li class="nav-sub-item' + (isChildActive ? ' active' : '') + '">' +
              '<a href="' + child.href + '" class="nav-sub-link">' +
                '<span class="nav-sub-radio">' +
                  '<span class="nav-radio-dot"></span>' +
                '</span>' +
                '<span class="nav-sub-label">' + child.label + '</span>' +
              '</a>' +
            '</li>';
        });

        html += '</ul></li>';
        return html;
      }

      /* ── Operation Module: expandable submenu ── */
      if (item.id === 'operation-module' && item.children) {
        var isOpen = isOpPage;
        var html =
          '<li class="nav-item nav-item--has-children' + (isOpen ? ' open active' : '') + '" id="nav-op-item">' +
            '<button class="nav-link nav-link--parent" id="nav-op-toggle" aria-expanded="' + isOpen + '" data-tip="' + item.label + '">' +
              item.icon +
              '<span class="nav-label">' + item.label + '</span>' +
              '<svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
            '</button>' +
            '<ul class="nav-sub-list">';

        item.children.forEach(function (child) {
          var isChildActive = (child.id === currentOpId);
          html +=
            '<li class="nav-sub-item' + (isChildActive ? ' active' : '') + '">' +
              '<a href="' + child.href + '" class="nav-sub-link">' +
                '<span class="nav-sub-radio">' +
                  '<span class="nav-radio-dot"></span>' +
                '</span>' +
                '<span class="nav-sub-label">' + child.label + '</span>' +
              '</a>' +
            '</li>';
        });

        html += '</ul></li>';
        return html;
      }

      /* ── Regular item — suppress active when an op/views sub-page is loaded ── */
      var isRegularActive = (item.id === activeId) && !isOpPage && !isViewsPage;
      return (
        '<li class="nav-item' + (isRegularActive ? ' active' : '') + '">' +
          '<a href="' + item.href + '" class="nav-link">' +
            item.icon +
            '<span class="nav-label">' + item.label + '</span>' +
          '</a>' +
        '</li>'
      );
    }).join('');
  }

  /* ── Build shell HTML ─────────────────────── */
  function buildShell(cfg) {
    var activeId = cfg.id    || '';
    var title    = cfg.title || 'AMIS';

    return (
      /* Page Loader */
      '<div id="page-loader">' +
        '<div class="loader-spinner"></div>' +
        '<span class="loader-text">LOADING...</span>' +
      '</div>' +

      /* Column Visibility panel */
      '<div class="col-vis-panel" id="col-vis-panel">' +
        '<div class="col-vis-panel__head">' +
          '<span>Column Visibility</span>' +
          '<button class="col-vis-panel__close" id="col-vis-close">&times;</button>' +
        '</div>' +
        '<div class="col-vis-panel__body" id="col-vis-body"></div>' +
      '</div>' +
      '<div class="col-vis-backdrop" id="col-vis-backdrop"></div>' +

      /* App shell */
      '<div class="app-shell">' +

        /* ── Sidebar ── */
        '<aside class="sidebar" id="sidebar">' +
          '<div class="sidebar__header">' +
            '<div class="sidebar__logos">' +
              '<img src="../../assets/AMIS-LOGO_only.png" alt="AMIS" class="sidebar__amis-logo-only"/>' +
              '<div class="sidebar__brand-text">' +
                '<span class="sidebar__brand-amis">AMIS</span>' +
                '<span class="sidebar__brand-full">Asset Management<br>Information System</span>' +
              '</div>' +
            '</div>' +
            '<button class="sidebar__collapse" id="sidebar-collapse" aria-label="Collapse sidebar">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
            '</button>' +
          '</div>' +
          '<nav class="sidebar__nav">' +
            '<ul class="nav-list">' + buildNav(activeId) + '</ul>' +
          '</nav>' +
          '<div class="sidebar__footer">' +
            '<div class="sidebar__user" id="sidebar-user">' +
              '<div class="user-avatar" id="user-avatar-sidebar">\u2014</div>' +
              '<div class="user-info">' +
                '<span class="user-name" id="user-name-sidebar">Loading...</span>' +
                '<span class="user-role" id="user-role-sidebar">\u2014</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</aside>' +

        /* ── Main wrapper ── */
        '<div class="main-wrapper">' +

          /* Top header */
          '<header class="top-header">' +
            '<div class="header-left">' +
              '<button class="header-menu-btn" id="mobile-menu-btn" aria-label="Toggle menu">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
              '</button>' +
              '<div class="header-breadcrumb">' +
                '<span class="breadcrumb-home">AMIS</span>' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>' +
                '<span class="breadcrumb-current" id="page-title">' + title + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="header-right">' +
              '<button class="header-icon-btn" aria-label="Notifications" id="notif-btn">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' +
                '<span class="notif-badge" id="notif-badge">3</span>' +
              '</button>' +
              '<div class="header-user-wrap">' +
                '<button class="header-user-btn" id="user-dropdown-btn">' +
                  '<div class="header-user-avatar" id="user-avatar-header">\u2014</div>' +
                  '<div class="header-user-info">' +
                    '<span class="header-user-name" id="user-name-header">Loading...</span>' +
                    '<span class="header-user-role" id="user-role-header">\u2014</span>' +
                  '</div>' +
                  '<svg class="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
                '</button>' +
                '<div class="user-dropdown" id="user-dropdown">' +
                  '<div class="dropdown-header">' +
                    '<div class="dropdown-avatar" id="dropdown-avatar">\u2014</div>' +
                    '<div class="dropdown-header-info">' +
                      '<div class="dropdown-name" id="dropdown-name">\u2014</div>' +
                      '<div class="dropdown-email" id="dropdown-email">\u2014</div>' +
                      '<div class="dropdown-role" id="dropdown-role">\u2014</div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="dropdown-divider"></div>' +
                    '<ul class="dropdown-menu">' +
                      '<li><a href="../profile/profile.html" class="dropdown-item">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.75a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5m-4 9.5A3.75 3.75 0 0 0 4.25 17v1.188c0 .754.546 1.396 1.29 1.517c4.278.699 8.642.699 12.92 0a1.54 1.54 0 0 0 1.29-1.517V17A3.75 3.75 0 0 0 16 13.25h-.34q-.28.001-.544.086l-.866.283a7.25 7.25 0 0 1-4.5 0l-.866-.283a1.8 1.8 0 0 0-.543-.086z"/></svg>' +
                        'My Profile' +
                      '</a></li>' +
                    '</ul>' +
                  '<div class="dropdown-divider"></div>' +
                  '<button class="dropdown-signout" id="signout-btn">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.393 4C4 4.617 4 5.413 4 7.004v9.994c0 1.591 0 2.387.393 3.002q.105.165.235.312c.483.546 1.249.765 2.78 1.202c1.533.438 2.3.657 2.856.329a1.5 1.5 0 0 0 .267-.202C11 21.196 11 20.4 11 18.803V5.197c0-1.596 0-2.393-.469-2.837a1.5 1.5 0 0 0-.267-.202c-.555-.328-1.323-.11-2.857.329c-1.53.437-2.296.656-2.78 1.202a2.5 2.5 0 0 0-.234.312M11 4h2.017c1.902 0 2.853 0 3.443.586c.33.326.476.764.54 1.414m-6 14h2.017c1.902 0 2.853 0 3.443-.586c.33-.326.476-.764.54-1.414m4-6h-7m5.5-2.5S22 11.34 22 12s-2.5 2.5-2.5 2.5"/></svg>' +
                    'Sign Out' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</header>' +

          /* Page content slot */
          '<main class="page-content" id="page-content"></main>' +

        '</div>' + /* /.main-wrapper */
      '</div>'    /* /.app-shell */
    );
  }

  /* ── Inject on DOMContentLoaded ──────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var cfg  = window.AMIS_PAGE || {};
    var root = document.getElementById('layout-root');
    var body = document.getElementById('page-body');

    if (!root) {
      console.error('[layout.js] <div id="layout-root"> not found in <body>.');
      return;
    }

    /* 1. Inject sidebar + header into the placeholder */
    root.innerHTML = buildShell(cfg);

    /* 2. Move #page-body node into .page-content — no cloning, no innerHTML */
    var slot = document.getElementById('page-content');
    if (slot && body) {
      slot.appendChild(body);
      body.style.display = 'contents'; /* transparent wrapper — no layout impact */
    }

    /* 3. Update <title> */
    if (cfg.title) {
      document.title = 'AMIS \u2013 ' + cfg.title + ' | DICT';
    }

    /* ── Sidebar collapse (persisted across pages) ── */
    var sidebar = document.getElementById('sidebar');
    var SIDEBAR_KEY = 'amis_sidebar_collapsed';

    /* Restore saved state immediately on every page load */
    if (localStorage.getItem(SIDEBAR_KEY) === '1') {
      sidebar.classList.add('collapsed');
    }

    document.getElementById('sidebar-collapse').addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem(SIDEBAR_KEY, sidebar.classList.contains('collapsed') ? '1' : '0');
    });

    /* ── Views submenu toggle ────────────────── */
    var viewsToggle = document.getElementById('nav-views-toggle');
    var viewsItem   = document.getElementById('nav-views-item');

    if (viewsToggle && viewsItem) {
      viewsToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (sidebar.classList.contains('collapsed')) {
          sidebar.classList.remove('collapsed');
          localStorage.setItem(SIDEBAR_KEY, '0');
        }
        var isOpen = viewsItem.classList.toggle('open');
        viewsToggle.setAttribute('aria-expanded', isOpen);
        /* Sync active: highlight this parent, clear others */
        if (isOpen) {
          document.querySelectorAll('.nav-item.active, .nav-item--has-children.active').forEach(function(el) {
            el.classList.remove('active');
          });
          viewsItem.classList.add('active');
        } else {
          viewsItem.classList.remove('active');
        }
      });
    }

    /* ── Operation Module submenu toggle ─────── */
    var opToggle = document.getElementById('nav-op-toggle');
    var opItem   = document.getElementById('nav-op-item');

    if (opToggle && opItem) {
      opToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (sidebar.classList.contains('collapsed')) {
          sidebar.classList.remove('collapsed');
          localStorage.setItem(SIDEBAR_KEY, '0');
        }
        var isOpen = opItem.classList.toggle('open');
        opToggle.setAttribute('aria-expanded', isOpen);
        /* Sync active: highlight this parent, clear others */
        if (isOpen) {
          document.querySelectorAll('.nav-item.active, .nav-item--has-children.active').forEach(function(el) {
            el.classList.remove('active');
          });
          opItem.classList.add('active');
        } else {
          opItem.classList.remove('active');
        }
      });
    }

    /* ── Nav tooltips — floating div appended to <body>
       to escape sidebar overflow:hidden                    ── */
    var floatTip = document.createElement('div');
    floatTip.id = 'nav-float-tip';
    document.body.appendChild(floatTip);

    var tipTimeout = null;

    /* Tooltip helper — works for regular links AND parent toggle buttons */
    function attachTooltip(el, text) {
      if (!text) return;
      el.addEventListener('mouseenter', function () {
        if (!sidebar.classList.contains('collapsed')) return;
        clearTimeout(tipTimeout);
        floatTip.textContent = text;
        floatTip.style.display = 'flex';
        var rect = el.getBoundingClientRect();
        floatTip.style.top  = (rect.top + rect.height / 2) + 'px';
        floatTip.style.left = (rect.right + 10) + 'px';
      });
      el.addEventListener('mouseleave', function () {
        tipTimeout = setTimeout(function () { floatTip.style.display = 'none'; }, 80);
      });
    }

    /* Regular nav links */
    document.querySelectorAll('.nav-link:not(.nav-link--parent)').forEach(function (link) {
      var label = link.querySelector('.nav-label');
      if (label) attachTooltip(link, label.textContent.trim());
    });

    /* Parent toggle buttons (Operation Module, Views) */
    document.querySelectorAll('.nav-link--parent[data-tip]').forEach(function (btn) {
      attachTooltip(btn, btn.getAttribute('data-tip'));
    });

    /* ── Mobile overlay ───────────────────── */
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    document.getElementById('mobile-menu-btn').addEventListener('click', function () {
      sidebar.classList.add('mobile-open');
      overlay.classList.add('show');
    });
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
    });

    /* ── User dropdown ────────────────────── */
    var uBtn  = document.getElementById('user-dropdown-btn');
    var uDrop = document.getElementById('user-dropdown');
    uBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      uDrop.classList.toggle('open');
      uBtn.classList.toggle('open', uDrop.classList.contains('open'));
    });
    document.addEventListener('click', function () {
      uDrop.classList.remove('open');
      uBtn.classList.remove('open');
    });

    /* ── Sign out ─────────────────────────── */
    document.getElementById('signout-btn').addEventListener('click', function () {
      if (typeof Auth   !== 'undefined') Auth.clearSession();
      if (typeof Loader !== 'undefined') Loader.show('Signing out...');
      if (typeof Toast  !== 'undefined') Toast.show('You have been signed out.', 'info', 2000);
      setTimeout(function () {
        window.location.href = '../login/login.html';
      }, 900);
    });

    /* ── Notifications ────────────────────── */
    document.getElementById('notif-btn').addEventListener('click', function () {
      if (typeof Toast !== 'undefined') Toast.show('Notification panel coming soon.', 'info');
    });

    /* ── Populate user info from Auth ────── */
    function populateUser() {
      if (typeof Auth === 'undefined') return;
      var session = Auth.getSession();
      if (!session) return;
      var name     = session.name  || '';
      var role     = session.role  || 'Staff';
      var email    = session.email || '';
      var initials = name.split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase() || '?';
      [
        ['user-name-sidebar',   name],
        ['user-role-sidebar',   role],
        ['user-avatar-sidebar', initials],
        ['user-name-header',    name],
        ['user-role-header',    role],
        ['user-avatar-header',  initials],
        ['dropdown-name',       name],
        ['dropdown-email',      email],
        ['dropdown-role',       role],
        ['dropdown-avatar',     initials],
      ].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el) el.textContent = pair[1];
      });
    }
    populateUser();

    /* ── Signal page scripts that layout is ready ── */
    document.dispatchEvent(new CustomEvent('amis:layout-ready'));
  });

}());