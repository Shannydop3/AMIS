/* ── Property Card ───────────────────────────── */
(function () {
  'use strict';

  /* Register view metadata */
  window.VIEWS = window.VIEWS || {};
  window.VIEWS['property-card'] = {
    label:           'Property Card',
    group:           'Property',
    columns:         ['Item Code', 'Property Number', 'Classification', 'Category', 'Brand', 'Model', 'Action'],
    hasTypeDropdown: true,
  };

  /* Register sample data */
  window.SAMPLE_DATA = window.SAMPLE_DATA || {};
  window.SAMPLE_DATA['property-card'] = [
    {
      id: 'PC-001',
      cells: ['ACCPOINT-0003', '2016-606010-0507-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'CAMBIUM', 'PMP 450i'],
      details: {
        'Item Code':       'ACCPOINT-0003',
        'Property Number': '2016-606010-0507-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'CAMBIUM',
        'Model':           'PMP 450i',
      },
    },
    {
      id: 'PC-002',
      cells: ['ACCPOINT-0003', '2016-606010-0507A-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'CAMBIUM', 'PMP 450i'],
      details: {
        'Item Code':       'ACCPOINT-0003',
        'Property Number': '2016-606010-0507A-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'CAMBIUM',
        'Model':           'PMP 450i',
      },
    },
    {
      id: 'PC-003',
      cells: ['ACCPOINT-0003', '2016-606010-0045-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'CAMBIUM', 'PMP 450i'],
      details: {
        'Item Code':       'ACCPOINT-0003',
        'Property Number': '2016-606010-0045-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'CAMBIUM',
        'Model':           'PMP 450i',
      },
    },
    {
      id: 'PC-004',
      cells: ['ACCPOINT-0003', '2016-606010-0045A-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'CAMBIUM', 'PMP 450i'],
      details: {
        'Item Code':       'ACCPOINT-0003',
        'Property Number': '2016-606010-0045A-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'CAMBIUM',
        'Model':           'PMP 450i',
      },
    },
    {
      id: 'PC-005',
      cells: ['ACCPOINT-0004', '2016-606010-0533-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'ZoneFlex', 'ZoneFlex T610 802.11'],
      details: {
        'Item Code':       'ACCPOINT-0004',
        'Property Number': '2016-606010-0533-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'ZoneFlex',
        'Model':           'ZoneFlex T610 802.11',
      },
    },
    {
      id: 'PC-006',
      cells: ['ACCPOINT-0004', '2016-606010-0533A-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'ZoneFlex', 'ZoneFlex T610 802.11'],
      details: {
        'Item Code':       'ACCPOINT-0004',
        'Property Number': '2016-606010-0533A-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'ZoneFlex',
        'Model':           'ZoneFlex T610 802.11',
      },
    },
    {
      id: 'PC-007',
      cells: ['ACCPOINT-0004', '2016-606010-0067-01-F', 'ACCESS POINT', 'MOTOR VEHICLES', 'ZoneFlex', 'ZoneFlex T610 802.11'],
      details: {
        'Item Code':       'ACCPOINT-0004',
        'Property Number': '2016-606010-0067-01-F',
        'Classification':  'ACCESS POINT',
        'Category':        'MOTOR VEHICLES',
        'Brand':           'ZoneFlex',
        'Model':           'ZoneFlex T610 802.11',
      },
    },
    {
      id: 'PC-008',
      cells: ['ACCPOINT-001', '2023-605030-0005-01', 'ACCESS POINT', 'SEMI-EXPENDABLE ICT EQUIPMENT', 'RUIJIE', 'RG-AP820-LV3, Wi-Fi 6 AX3000 Indoor AP'],
      details: {
        'Item Code':       'ACCPOINT-001',
        'Property Number': '2023-605030-0005-01',
        'Classification':  'ACCESS POINT',
        'Category':        'SEMI-EXPENDABLE ICT EQUIPMENT',
        'Brand':           'RUIJIE',
        'Model':           'RG-AP820-LV3, Wi-Fi 6 AX3000 Indoor AP',
      },
    },
    {
      id: 'PC-009',
      cells: ['ACCPOINT-001', '2023-605030-0006-01', 'ACCESS POINT', 'SEMI-EXPENDABLE ICT EQUIPMENT', 'RUIJIE', 'RG-AP820-LV3, Wi-Fi 6 AX3000 Indoor AP'],
      details: {
        'Item Code':       'ACCPOINT-001',
        'Property Number': '2023-605030-0006-01',
        'Classification':  'ACCESS POINT',
        'Category':        'SEMI-EXPENDABLE ICT EQUIPMENT',
        'Brand':           'RUIJIE',
        'Model':           'RG-AP820-LV3, Wi-Fi 6 AX3000 Indoor AP',
      },
    },
    {
      id: 'PC-010',
      cells: ['LAPTOP-003', '2025-10405030-0040-01', 'LAPTOP', 'ICT EQUIPMENT', 'ACER', 'Travelmate TMP414-51-59KM'],
      details: {
        'Item Code':       'LAPTOP-003',
        'Property Number': '2025-10405030-0040-01',
        'Classification':  'LAPTOP',
        'Category':        'ICT EQUIPMENT',
        'Brand':           'ACER',
        'Model':           'Travelmate TMP414-51-59KM',
      },
    },
    {
      id: 'PC-011',
      cells: ['SWITCHGEAR', '2024-10605010-0004-05', 'SWITCHGEAR', 'MACHINERY', 'ABB', 'ABB Medium Voltage Switchgear 13.8KV'],
      details: {
        'Item Code':       'SWITCHGEAR',
        'Property Number': '2024-10605010-0004-05',
        'Classification':  'SWITCHGEAR',
        'Category':        'MACHINERY',
        'Brand':           'ABB',
        'Model':           'ABB Medium Voltage Switchgear 13.8KV',
      },
    },
    {
      id: 'PC-012',
      cells: ['DESKTOP-001', '2023-10405030-0012-01', 'DESKTOP', 'ICT EQUIPMENT', 'DELL', 'OptiPlex 5090 SFF'],
      details: {
        'Item Code':       'DESKTOP-001',
        'Property Number': '2023-10405030-0012-01',
        'Classification':  'DESKTOP',
        'Category':        'ICT EQUIPMENT',
        'Brand':           'DELL',
        'Model':           'OptiPlex 5090 SFF',
      },
    },
  ];
}());
