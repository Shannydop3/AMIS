/* ── Property Disposal Request History ───────── */
(function () {
  'use strict';

  /* Register view metadata */
  window.VIEWS = window.VIEWS || {};
  window.VIEWS['property-disposal-request-history'] = {
    label:   'Property Disposal Request History',
    group:   'Property',
    columns: ['Disposal Number', 'Disposed By', 'Date', 'Status', 'Decline/Cancel Remarks', 'Document', 'Action'],
  };

  /* Register sample data */
  window.SAMPLE_DATA = window.SAMPLE_DATA || {};
  window.SAMPLE_DATA['property-disposal-request-history'] = [
    {
      id: 'DRH-2024-0001',
      cells: [
        'DRH-2024-0001', 'Juan Dela Cruz', '2024-01-15',
        '<span class="views-badge views-badge-green">Approved</span>',
        '—',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0001',
        'Disposed By':            'Juan Dela Cruz',
        'Date':                   '2024-01-15',
        'Status':                 'Approved',
        'Decline/Cancel Remarks': '—',
        'Property Description':   'HP LaserJet Printer Model 1022',
        'Serial Number':          'SN-2019-HP1022-001',
        'Appraised Value':        '₱2,500.00',
        'Disposal Method':        'Public Auction',
        'Approved By':            'Maria Reyes',
        'Remarks':                'Unit approved for disposal per Memo No. 2024-001',
      },
    },
    {
      id: 'DRH-2024-0002',
      cells: [
        'DRH-2024-0002', 'Maria Santos', '2024-02-03',
        '<span class="views-badge views-badge-amber">Pending</span>',
        '—',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0002',
        'Disposed By':            'Maria Santos',
        'Date':                   '2024-02-03',
        'Status':                 'Pending',
        'Decline/Cancel Remarks': '—',
        'Property Description':   'Dell Monitor 24"',
        'Serial Number':          'SN-2020-DL2400-042',
        'Appraised Value':        '₱3,800.00',
        'Disposal Method':        'Condemnation',
        'Approved By':            'Pending',
        'Remarks':                'Awaiting approval from Property Division',
      },
    },
    {
      id: 'DRH-2024-0003',
      cells: [
        'DRH-2024-0003', 'Jose Reyes', '2024-03-10',
        '<span class="views-badge views-badge-gray">Declined</span>',
        'Unit not serviceable',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0003',
        'Disposed By':            'Jose Reyes',
        'Date':                   '2024-03-10',
        'Status':                 'Declined',
        'Decline/Cancel Remarks': 'Unit not serviceable',
        'Property Description':   'Epson Scanner ES-400',
        'Serial Number':          'SN-2018-EP400-015',
        'Appraised Value':        '₱1,200.00',
        'Disposal Method':        'Condemnation',
        'Approved By':            'N/A',
        'Remarks':                'Request declined — unit does not meet disposal criteria',
      },
    },
    {
      id: 'DRH-2024-0004',
      cells: [
        'DRH-2024-0004', 'Ana Lim', '2024-04-22',
        '<span class="views-badge views-badge-green">Approved</span>',
        '—',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0004',
        'Disposed By':            'Ana Lim',
        'Date':                   '2024-04-22',
        'Status':                 'Approved',
        'Decline/Cancel Remarks': '—',
        'Property Description':   'Acer Laptop Aspire 5',
        'Serial Number':          'SN-2021-AC5-088',
        'Appraised Value':        '₱8,000.00',
        'Disposal Method':        'Transfer to another agency',
        'Approved By':            'Roberto Cruz',
        'Remarks':                'Transferred to DepEd Regional Office',
      },
    },
    {
      id: 'DRH-2024-0005',
      cells: [
        'DRH-2024-0005', 'Pedro Garcia', '2024-05-07',
        '<span class="views-badge views-badge-amber">Pending</span>',
        '—',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0005',
        'Disposed By':            'Pedro Garcia',
        'Date':                   '2024-05-07',
        'Status':                 'Pending',
        'Decline/Cancel Remarks': '—',
        'Property Description':   'Canon DSLR Camera EOS 200D',
        'Serial Number':          'SN-2022-CN200D-003',
        'Appraised Value':        '₱15,000.00',
        'Disposal Method':        'Public Auction',
        'Approved By':            'Pending',
        'Remarks':                'Submitted for review',
      },
    },
    {
      id: 'DRH-2024-0006',
      cells: [
        'DRH-2024-0006', 'Rosa Valdez', '2024-06-18',
        '<span class="views-badge views-badge-green">Approved</span>',
        '—',
      ],
      document: 'PDF',
      details: {
        'Disposal Number':        'DRH-2024-0006',
        'Disposed By':            'Rosa Valdez',
        'Date':                   '2024-06-18',
        'Status':                 'Approved',
        'Decline/Cancel Remarks': '—',
        'Property Description':   'Lenovo ThinkPad E14 Gen 2',
        'Serial Number':          'SN-2021-LN-E14-066',
        'Appraised Value':        '₱9,500.00',
        'Disposal Method':        'Public Auction',
        'Approved By':            'Director Santos',
        'Remarks':                'Disposed per BAC resolution',
      },
    },
  ];
}());
