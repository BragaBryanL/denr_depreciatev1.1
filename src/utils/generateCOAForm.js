import * as XLSX from 'xlsx';

export const generateCOAForm = (asset, transactions = []) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create the worksheet data based on the COA format (matching Python reference exactly)
  const data = [
    // Row 1-3: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 4: Main title (D4:J4 merged)
    [null, null, null, 'PROPERTY, PLANT AND EQUIPMENT LEDGER CARD', null, null, null, null, null, null, null, null],
    // Row 5-6: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 7: Entity Name label (B7) and Fund Cluster label (I7)
    ['Entity Name :', null, null, null, null, null, null, null, 'Fund Cluster :', null, null, null],
    // Row 8: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 9: Upper left info block (B9:H12) and Upper right info block (I9:L12)
    ['Property, Plant and Equipment:', null, null, null, null, null, null, null, 'Object Account Code:', null, null, null],
    // Row 10
    [null, null, null, null, null, null, null, null, 'Estimated Useful Life:', null, null, null],
    // Row 11
    ['Description:', null, null, null, null, null, null, null, 'Rate of Depreciation:', null, null, null],
    // Row 12
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 13: Table headers (merged vertical)
    [null, 'Date', 'Reference', 'Receipt', null, null, 'Accumulated\nDepreciation', 'Accumulated\nImpairment\nLosses', 'Issues/Transfers/\nAdjustments/s', 'Adjusted\nCost', 'Repair History', null],
    // Row 14: Table subheaders
    [null, null, null, 'Qty.', 'Unit\nCost', 'Total\nCost', null, null, null, null, 'Nature of\nRepair', 'Amount'],
  ];
  
  // Add initial acquisition row (row 15)
  data.push([
    null,
    asset.dateAcquired || '',
    asset.propertyDescription || '',
    '1',
    parseFloat(asset.unitCost) || parseFloat(asset.cost) || 0,
    parseFloat(asset.cost) || 0,
    0,
    0,
    0,
    parseFloat(asset.cost) || 0,
    '',
    ''
  ]);
  
  // Add yearly depreciation rows
  if (asset.dateAcquired && asset.annualDepreciation && asset.cost) {
    const acquiredDate = new Date(asset.dateAcquired);
    const currentDate = new Date();
    const startYear = acquiredDate.getFullYear();
    const endYear = currentDate.getFullYear();
    const annualDepreciation = parseFloat(asset.annualDepreciation) || 0;
    const totalCost = parseFloat(asset.cost) || 0;
    
    for (let year = startYear; year <= endYear; year++) {
      const yearEnd = new Date(year, 11, 31); // December 31 of each year
      
      // Skip if year end is before acquisition date
      if (yearEnd < acquiredDate) continue;
      
      // Calculate time elapsed from acquisition to year end
      const timeElapsed = Math.max(0, (yearEnd - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
      const accumulatedDepreciation = Math.min(annualDepreciation * timeElapsed, totalCost * 0.95); // Max 95% depreciation
      const netBookValue = totalCost - accumulatedDepreciation;
      
      data.push([
        null,
        yearEnd.toISOString().split('T')[0],
        'Annual Accumulated Depreciation',
        '',
        '',
        '',
        accumulatedDepreciation,
        0,
        0,
        netBookValue,
        '',
        0
      ]);
    }
  }
  
  // Add repair history transactions if any
  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      data.push([
        null,
        transaction.date || '',
        'Repair/Maintenance',
        '',
        '',
        transaction.amount || 0,
        '',
        '',
        '',
        '',
        transaction.natureOfRepair || '',
        transaction.amount || 0
      ]);
    });
  }
  
  // Fill remaining rows up to row 38 (24 ledger rows total from row 15-38)
  while (data.length < 38) {
    data.push([null, null, null, null, null, null, null, null, null, null, null, null]);
  }
  
  // Add side mark A19
  data[18][0] = 'L/L';
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Populate data into cells
  // Entity Name (C7)
  if (asset.officePlace) {
    worksheet['C7'] = { t: 's', v: asset.officePlace };
  }
  
  // Fund Cluster (J7)
  if (asset.fundCluster) {
    worksheet['J7'] = { t: 's', v: asset.fundCluster };
  }
  
  // Property, Plant and Equipment (C9:H10 area)
  if (asset.ppeClass) {
    worksheet['C9'] = { t: 's', v: asset.ppeClass };
  }
  
  // Description (C11:H12 area)
  if (asset.propertyDescription) {
    worksheet['C11'] = { t: 's', v: asset.propertyDescription };
  }
  
  // Object Account Code (K9:L9)
  if (asset.accountCode) {
    worksheet['K9'] = { t: 's', v: asset.accountCode };
  }
  
  // Estimated Useful Life (K10:L10)
  if (asset.usefulLife) {
    worksheet['K10'] = { t: 's', v: asset.usefulLife };
  }
  
  // Rate of Depreciation (K11:L11)
  const rateOfDepreciation = asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '');
  if (rateOfDepreciation) {
    worksheet['K11'] = { t: 's', v: rateOfDepreciation };
  }
  
  // Appendix 70 (L1)
  worksheet['L1'] = { t: 's', v: 'Appendix 70' };
  
  // Set column widths (matching Python implementation)
  worksheet['!cols'] = [
    { wch: 4 },   // A
    { wch: 12 },  // B - Date
    { wch: 18 },  // C - Reference
    { wch: 9 },   // D - Qty
    { wch: 11 },  // E - Unit Cost
    { wch: 12 },  // F - Total Cost
    { wch: 16 },  // G - Accumulated Depreciation
    { wch: 18 },  // H - Accumulated Impairment Losses
    { wch: 19 },  // I - Issues/Transfers/Adjustments
    { wch: 14 },  // J - Adjusted Cost
    { wch: 16 },  // K - Nature of Repair
    { wch: 12 },  // L - Amount
  ];
  
  // Set row heights (matching Python implementation)
  worksheet['!rows'] = [
    { hpx: 18 }, // Row 1
    { hpx: 18 }, // Row 2
    { hpx: 18 }, // Row 3
    { hpx: 24 }, // Row 4
    { hpx: 8 },  // Row 5
    { hpx: 10 }, // Row 6
    { hpx: 22 }, // Row 7
    { hpx: 10 }, // Row 8
    { hpx: 22 }, // Row 9
    { hpx: 22 }, // Row 10
    { hpx: 22 }, // Row 11
    { hpx: 8 },  // Row 12
    { hpx: 24 }, // Row 13
    { hpx: 34 }, // Row 14
  ];
  // Rows 15-38: height 18
  for (let i = 15; i <= 38; i++) {
    worksheet['!rows'].push({ hpx: 18 });
  }
  
  // Initialize merges
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  
  // D4:J4: Main title
  worksheet['!merges'].push({ s: { r: 3, c: 3 }, e: { r: 3, c: 9 } });
  
  // B13:B14: Date
  worksheet['!merges'].push({ s: { r: 12, c: 1 }, e: { r: 13, c: 1 } });
  
  // C13:C14: Reference
  worksheet['!merges'].push({ s: { r: 12, c: 2 }, e: { r: 13, c: 2 } });
  
  // D13:F13: Receipt
  worksheet['!merges'].push({ s: { r: 12, c: 3 }, e: { r: 12, c: 5 } });
  
  // G13:G14: Accumulated Depreciation
  worksheet['!merges'].push({ s: { r: 12, c: 6 }, e: { r: 13, c: 6 } });
  
  // H13:H14: Accumulated Impairment Losses
  worksheet['!merges'].push({ s: { r: 12, c: 7 }, e: { r: 13, c: 7 } });
  
  // I13:I14: Issues/Transfers/Adjustments
  worksheet['!merges'].push({ s: { r: 12, c: 8 }, e: { r: 13, c: 8 } });
  
  // J13:J14: Adjusted Cost
  worksheet['!merges'].push({ s: { r: 12, c: 9 }, e: { r: 13, c: 9 } });
  
  // K13:L13: Repair History
  worksheet['!merges'].push({ s: { r: 12, c: 10 }, e: { r: 12, c: 11 } });
  
  // L1: Appendix 70 - italic, size 11, right-aligned
  if (worksheet['L1']) {
    worksheet['L1'].s = {
      font: { name: 'Times New Roman', sz: 11, italic: true },
      alignment: { horizontal: 'right', vertical: 'center' }
    };
  }
  
  // D4: Main title - bold, centered, size 14
  if (worksheet['D4']) {
    worksheet['D4'].s = {
      font: { name: 'Times New Roman', sz: 14, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
  
  // B7: Entity Name label - bold, size 11
  if (worksheet['B7']) {
    worksheet['B7'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // I7: Fund Cluster label - bold, size 11
  if (worksheet['I7']) {
    worksheet['I7'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // C7:G7: Entity Name input line - bottom medium border
  for (let c = 2; c <= 6; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 6, c });
    if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
    worksheet[cellAddr].s = {
      font: { name: 'Times New Roman', sz: 11 },
      border: { bottom: { style: 'medium', color: { auto: 1 } } },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // J7:L7: Fund Cluster input line - bottom medium border
  for (let c = 9; c <= 11; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 6, c });
    if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
    worksheet[cellAddr].s = {
      font: { name: 'Times New Roman', sz: 11 },
      border: { bottom: { style: 'medium', color: { auto: 1 } } },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // Upper left info block B9:H12 - medium outer border only
  for (let r = 8; r <= 11; r++) {
    for (let c = 1; c <= 7; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 11 },
        border: {
          top: r === 8 ? { style: 'medium', color: { auto: 1 } } : undefined,
          bottom: r === 11 ? { style: 'medium', color: { auto: 1 } } : undefined,
          left: c === 1 ? { style: 'medium', color: { auto: 1 } } : undefined,
          right: c === 7 ? { style: 'medium', color: { auto: 1 } } : undefined
        },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
  }
  
  // B9: Property, Plant and Equipment - top-left aligned
  if (worksheet['B9']) {
    worksheet['B9'].s = {
      font: { name: 'Times New Roman', sz: 11 },
      alignment: { horizontal: 'left', vertical: 'top' },
      border: worksheet['B9'].s?.border
    };
  }
  
  // B11: Description - top-left aligned
  if (worksheet['B11']) {
    worksheet['B11'].s = {
      font: { name: 'Times New Roman', sz: 11 },
      alignment: { horizontal: 'left', vertical: 'top' },
      border: worksheet['B11'].s?.border
    };
  }
  
  // Upper right info block I9:L12 - medium outer border, thin inner horizontal rules
  for (let r = 8; r <= 11; r++) {
    for (let c = 8; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 11 },
        border: {
          top: r === 8 ? { style: 'medium', color: { auto: 1 } } : (r === 9 || r === 10 ? { style: 'thin', color: { auto: 1 } } : undefined),
          bottom: r === 11 ? { style: 'medium', color: { auto: 1 } } : (r === 9 || r === 10 ? { style: 'thin', color: { auto: 1 } } : undefined),
          left: c === 8 ? { style: 'medium', color: { auto: 1 } } : undefined,
          right: c === 11 ? { style: 'medium', color: { auto: 1 } } : undefined
        },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
  }
  
  // I9, I10, I11: Object Account Code, Estimated Useful Life, Rate of Depreciation - bold
  ['I9', 'I10', 'I11'].forEach(cellAddr => {
    if (worksheet[cellAddr]) {
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 11, bold: true },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: worksheet[cellAddr].s?.border
      };
    }
  });
  
  // Main ledger table B13:L38 - medium outer border, thin inner grid
  for (let r = 12; r <= 37; r++) {
    for (let c = 1; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
      
      // Data rows (15+) have different alignment: Reference (C) and Nature of Repair (K) are left-aligned
      const isDataRow = r >= 15;
      const isReferenceCol = c === 2; // Column C
      const isNatureOfRepairCol = c === 10; // Column K
      
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 10 },
        border: {
          top: r === 12 ? { style: 'medium', color: { auto: 1 } } : { style: 'thin', color: { auto: 1 } },
          bottom: r === 37 ? { style: 'medium', color: { auto: 1 } } : { style: 'thin', color: { auto: 1 } },
          left: c === 1 ? { style: 'medium', color: { auto: 1 } } : { style: 'thin', color: { auto: 1 } },
          right: c === 11 ? { style: 'medium', color: { auto: 1 } } : { style: 'thin', color: { auto: 1 } }
        },
        alignment: {
          horizontal: (isDataRow && (isReferenceCol || isNatureOfRepairCol)) ? 'left' : 'center',
          vertical: 'center',
          wrapText: true
        }
      };
    }
  }
  
  // Table headers - bold, centered, size 10
  const headerCells = ['B13', 'C13', 'D13', 'G13', 'H13', 'I13', 'J13', 'K13', 'D14', 'E14', 'F14', 'K14', 'L14'];
  headerCells.forEach(cellAddr => {
    if (worksheet[cellAddr]) {
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 10, bold: true },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: worksheet[cellAddr].s?.border || {
          top: { style: 'thin', color: { auto: 1 } },
          bottom: { style: 'thin', color: { auto: 1 } },
          left: { style: 'thin', color: { auto: 1 } },
          right: { style: 'thin', color: { auto: 1 } }
        }
      };
    }
  });
  
  // A19: Side mark - vertical L/L, size 10
  if (worksheet['A19']) {
    worksheet['A19'].s = {
      font: { name: 'Times New Roman', sz: 10 },
      alignment: { vertical: 'center', horizontal: 'center', textRotation: 90 }
    };
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Ledger Card');
  
  // Generate file name
  const fileName = `COA_Form_${asset.propertyNumber || 'Property'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Download the file
  XLSX.writeFile(workbook, fileName);
  
  return fileName;
};
