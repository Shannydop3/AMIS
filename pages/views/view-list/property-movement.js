/* ── Property Movement ───────────────────────── */
(function () {
  'use strict';

  /* Register view metadata */
  window.VIEWS = window.VIEWS || {};
  window.VIEWS['property-movement'] = {
    label:           'Property Movement',
    group:           'Property',
    columns:         ['Property Number', 'Activity', 'Date', 'Action'],
    hasTypeDropdown: true,
  };

  /* Register sample data */
  window.SAMPLE_DATA = window.SAMPLE_DATA || {};
  window.SAMPLE_DATA['property-movement'] = [
    {
      id: 'PM-2024-0001',
      cells: ['PROP-2019-0042', 'Issuance to Field Office A', '2024-01-08'],
      details: {
        'Property Number': 'PROP-2019-0042',
        'Description':     'HP Desktop PC Core i5',
        'Activity':        'Issuance to Field Office A',
        'Date':            '2024-01-08',
        'Type':            'PAR',
        'Issued To':       'Field Office A – IT Division',
        'Issued By':       'Central Supply',
        'Remarks':         'Transferred for field operations support',
      },
    },
    {
      id: 'PM-2024-0002',
      cells: ['PROP-2020-0115', 'Return from Maintenance', '2024-02-14'],
      details: {
        'Property Number': 'PROP-2020-0115',
        'Description':     'Brother Printer DCP-L2540DW',
        'Activity':        'Return from Maintenance',
        'Date':            '2024-02-14',
        'Type':            'ICS',
        'Returned By':     'Repair Center',
        'Received By':     'Property Custodian',
        'Remarks':         'Repaired and returned in good working condition',
      },
    },
    {
      id: 'PM-2024-0003',
      cells: ['PROP-2021-0067', 'Transfer to Division B', '2024-03-21'],
      details: {
        'Property Number': 'PROP-2021-0067',
        'Description':     'Ergonomic Office Chair',
        'Activity':        'Transfer to Division B',
        'Date':            '2024-03-21',
        'Type':            'PAR',
        'From':            'Division A',
        'To':              'Division B',
        'Approved By':     'Director Santos',
        'Remarks':         'Office reorganization',
      },
    },
    {
      id: 'PM-2024-0004',
      cells: ['PROP-2022-0033', 'Issuance – New Unit', '2024-04-05'],
      details: {
        'Property Number': 'PROP-2022-0033',
        'Description':     'Epson Projector EB-X51',
        'Activity':        'Issuance – New Unit',
        'Date':            '2024-04-05',
        'Type':            'PAR',
        'Issued To':       'Conference Room A',
        'Issued By':       'Central Supply',
        'Remarks':         'New acquisition deployed',
      },
    },
    {
      id: 'PM-2024-0005',
      cells: ['PROP-2023-0088', 'Inter-Office Transfer', '2024-05-18'],
      details: {
        'Property Number': 'PROP-2023-0088',
        'Description':     'Samsung 32" Smart TV',
        'Activity':        'Inter-Office Transfer',
        'Date':            '2024-05-18',
        'Type':            'PAR',
        'From':            'Lobby – Ground Floor',
        'To':              'Board Room – 3rd Floor',
        'Approved By':     'Director Reyes',
        'Remarks':         'Moved for board meetings use',
      },
    },
    {
      id: 'PM-2024-0006',
      cells: ['PROP-2024-0014', 'Issuance – New Unit', '2024-06-02'],
      details: {
        'Property Number': 'PROP-2024-0014',
        'Description':     'Cisco IP Phone 8845',
        'Activity':        'Issuance – New Unit',
        'Date':            '2024-06-02',
        'Type':            'ICS',
        'Issued To':       'Finance Division',
        'Issued By':       'IT Assets',
        'Remarks':         'Part of telephony upgrade project',
      },
    },
    {
      id: 'PM-2024-0007',
      cells: ['PROP-2024-0031', 'Return – Fully Depreciated', '2024-07-10'],
      details: {
        'Property Number': 'PROP-2024-0031',
        'Description':     'HP LaserJet 1320 Printer',
        'Activity':        'Return – Fully Depreciated',
        'Date':            '2024-07-10',
        'Type':            'ICS',
        'Returned By':     'Admin Division',
        'Received By':     'Property Section',
        'Remarks':         'Returned for disposal processing',
      },
    },
    {
      id: 'PM-2024-0008',
      cells: ['PROP-2024-0055', 'Issuance – Replacement Unit', '2024-08-22'],
      details: {
        'Property Number': 'PROP-2024-0055',
        'Description':     'Lenovo ThinkCentre M720s',
        'Activity':        'Issuance – Replacement Unit',
        'Date':            '2024-08-22',
        'Type':            'PAR',
        'Issued To':       'Records Division',
        'Issued By':       'IT Assets',
        'Remarks':         'Replacement for fully depreciated unit',
      },
    },
  ];
}());
