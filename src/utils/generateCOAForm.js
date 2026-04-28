import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export const generateCOAForm = (asset, transactions = [], format = 'excel') => {
  const baseFileName = `COA_Form_${asset.propertyNumber || 'Property'}_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'pdf') {
    return generatePDF(asset, transactions, baseFileName);
  }
  
  // Excel, CSV, Word generation
  return generateExcel(asset, transactions, format, baseFileName);
};

const generatePDF = (asset, transactions, baseFileName) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Title section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Appendix 70', 195, 20, { align: 'right' });
  
  doc.setFontSize(12);
  doc.text('PROPERTY, PLANT AND EQUIPMENT LEDGER CARD', 105, 30, { align: 'center' });
  
  // Header section with proper layout (two-column)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let y = 45;
  const lineHeight = 8;
  const leftCol = 20;
  const rightCol = 120;
  
  // Row 1: Entity Name | Fund Cluster
  doc.setFont('helvetica', 'bold');
  doc.text('Entity Name', leftCol, y);
  doc.text('Fund Cluster', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.officePlace || ''), leftCol, y);
  doc.text(String(asset.fundCluster || ''), rightCol, y);
  y += lineHeight + 2;
  
  // Row 2: Property, Plant and Equipment | Object Account Code
  doc.setFont('helvetica', 'bold');
  doc.text('Property, Plant and Equipment', leftCol, y);
  doc.text('Object Account Code', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.ppeClass || ''), leftCol, y);
  doc.text(String(asset.accountCode || ''), rightCol, y);
  y += lineHeight + 2;
  
  // Row 3: Description | Estimated Useful Life
  doc.setFont('helvetica', 'bold');
  doc.text('Description', leftCol, y);
  doc.text('Estimated Useful Life', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.propertyDescription || ''), leftCol, y);
  doc.text(String(asset.usefulLife || ''), rightCol, y);
  y += lineHeight + 2;
  
  // Row 4: Empty | Rate of Depreciation
  doc.setFont('helvetica', 'bold');
  doc.text('Rate of Depreciation', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  const rateOfDepreciation = asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '');
  doc.text(String(rateOfDepreciation), rightCol, y);
  y += lineHeight + 10;
  
  // Table headers with proper merged cell layout
  const headers = [
    // Main headers (with rowSpan effect)
    [
      { content: 'Date', rowSpan: 2, width: 20 },
      { content: 'Reference', rowSpan: 2, width: 25 },
      { content: 'Receipt', colSpan: 3, width: 30 },
      { content: 'Accumulated Depreciation', rowSpan: 2, width: 30 },
      { content: 'Accumulated Impairment Losses', rowSpan: 2, width: 30 },
      { content: 'Issues/Transfers/Adjustment/s', rowSpan: 2, width: 35 },
      { content: 'Adjusted Cost', rowSpan: 2, width: 25 },
      { content: 'Repair History', colSpan: 2, width: 30 }
    ],
    // Sub headers
    [
      { content: '', width: 20 }, // Date (spanned above)
      { content: '', width: 25 }, // Reference (spanned above)
      { content: 'Qty.', width: 10 }, // Receipt sub
      { content: 'Unit Cost', width: 15 }, // Receipt sub
      { content: 'Total Cost', width: 15 }, // Receipt sub
      { content: '', width: 30 }, // Accumulated Depreciation (spanned above)
      { content: '', width: 30 }, // Accumulated Impairment Losses (spanned above)
      { content: '', width: 35 }, // Issues/Transfers (spanned above)
      { content: '', width: 25 }, // Adjusted Cost (spanned above)
      { content: 'Nature of Repair', width: 20 }, // Repair History sub
      { content: 'Amount', width: 15 } // Repair History sub
    ]
  ];
  
  // Prepare table data
  const tableData = [];
  
  // Initial acquisition row
  tableData.push([
    asset.dateAcquired || '',
    asset.propertyDescription || '',
    '1',
    (parseFloat(asset.unitCost) || parseFloat(asset.cost) || 0).toFixed(2),
    (parseFloat(asset.cost) || 0).toFixed(2),
    '0.00',
    '0.00',
    '0.00',
    (parseFloat(asset.cost) || 0).toFixed(2),
    '',
    '0.00'
  ]);
  
  // Yearly depreciation rows
  if (asset.dateAcquired && asset.annualDepreciation && asset.cost) {
    const acquiredDate = new Date(asset.dateAcquired);
    const currentDate = new Date();
    const startYear = acquiredDate.getFullYear();
    const endYear = currentDate.getFullYear();
    const annualDepreciation = parseFloat(asset.annualDepreciation) || 0;
    const totalCost = parseFloat(asset.cost) || 0;
    
    for (let year = startYear; year <= endYear; year++) {
      const yearEnd = new Date(year, 11, 31);
      
      if (yearEnd < acquiredDate) continue;
      
      const timeElapsed = Math.max(0, (yearEnd - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
      const accumulatedDepreciation = Math.min(annualDepreciation * timeElapsed, totalCost * 0.95);
      const netBookValue = totalCost - accumulatedDepreciation;
      
      tableData.push([
        yearEnd.toISOString().split('T')[0],
        'Annual Accumulated Depreciation',
        '',
        '',
        '',
        accumulatedDepreciation.toFixed(2),
        '0.00',
        '0.00',
        netBookValue.toFixed(2),
        '',
        '0.00'
      ]);
    }
  }
  
  // Repair history rows
  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      tableData.push([
        transaction.date || '',
        'Repair/Maintenance',
        '',
        '',
        (parseFloat(transaction.amount) || 0).toFixed(2),
        '',
        '',
        '',
        '',
        transaction.natureOfRepair || '',
        (parseFloat(transaction.amount) || 0).toFixed(2)
      ]);
    });
  }
  
  // Fill remaining rows (25 total data rows)
  while (tableData.length < 25) {
    tableData.push(['', '', '', '', '', '', '', '', '', '', '']);
  }
  
  // Generate table with proper column widths
  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: y,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      font: 'helvetica',
      lineColor: [0, 0, 0], // Black borders
      textColor: [0, 0, 0], // Black text
    },
    headStyles: {
      fillColor: [255, 255, 255], // White background
      textColor: [0, 0, 0], // Black text
      fontStyle: 'bold',
      fontSize: 8,
      lineColor: [0, 0, 0], // Black borders
    },
    bodyStyles: {
      fontSize: 8,
      fillColor: [255, 255, 255], // White background
      textColor: [0, 0, 0], // Black text
      lineColor: [0, 0, 0], // Black borders
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255], // White background (no alternating colors)
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 25 }, // Reference
      2: { cellWidth: 10 }, // Qty
      3: { cellWidth: 15 }, // Unit Cost
      4: { cellWidth: 15 }, // Total Cost
      5: { cellWidth: 30 }, // Accumulated Depreciation
      6: { cellWidth: 30 }, // Accumulated Impairment Losses
      7: { cellWidth: 35 }, // Issues/Transfers
      8: { cellWidth: 25 }, // Adjusted Cost
      9: { cellWidth: 20 }, // Nature of Repair
      10: { cellWidth: 15 }, // Amount
    },
    willDrawCell: (data) => {
      // Handle merged cells manually for headers
      if (data.section === 'head') {
        if (data.row === 0) {
          // Draw borders for merged cells
          if (data.column === 2) { // Receipt header (spans columns 2,3,4)
            doc.setDrawColor(0);
            doc.rect(data.cell.x, data.cell.y, data.cell.width * 3, data.cell.height);
          } else if (data.column === 9) { // Repair History header (spans columns 9,10)
            doc.setDrawColor(0);
            doc.rect(data.cell.x, data.cell.y, data.cell.width * 2, data.cell.height);
          }
        }
      }
    },
    didParseCell: (data) => {
      // Handle merged cells in headers
      if (data.section === 'head') {
        if (data.row === 0) {
          if (data.column === 2) { // Receipt header
            data.cell.styles.halign = 'center';
          } else if (data.column === 9) { // Repair History header
            data.cell.styles.halign = 'center';
          }
        }
      }
    }
  });
  
  const fileName = `${baseFileName}.pdf`;
  doc.save(fileName);
  return fileName;
};

const generateExcel = (asset, transactions, format, baseFileName) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create the worksheet data based on exact Excel mapping
  const data = [
    // Row 1: Empty except L1 - Appendix 70
    [null, null, null, null, null, null, null, null, null, null, null, 'Appendix 70'],
    // Row 2-3: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 4: Main title (B4:J4 merged)
    [null, 'PROPERTY, PLANT AND EQUIPMENT LEDGER CARD', null, null, null, null, null, null, null, null, null, null],
    // Row 5-6: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 7: Entity Name (B7:G7) and Fund Cluster (H7:L7)
    ['Entity Name', null, null, null, null, null, null, 'Fund Cluster', null, null, null, null],
    // Row 8: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 9: Property, Plant and Equipment (B9:G9) and Object Account Code (H9:L9)
    ['Property, Plant and Equipment', null, null, null, null, null, null, 'Object Account Code', null, null, null, null],
    // Row 10: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 11: Description (B11:G11) and Estimated Useful Life (H10:L10) - Note: H10:L10 is row 10
    ['Description', null, null, null, null, null, null, 'Estimated Useful Life', null, null, null, null],
    // Row 12: Empty for Rate of Depreciation (H11:L11) - Note: H11:L11 is row 11
    [null, null, null, null, null, null, null, 'Rate of Depreciation', null, null, null, null],
    // Row 13: Table headers
    [null, 'Date', 'Reference', 'Receipt', null, null, 'Accumulated Depreciation', 'Accumulated Impairment Losses', 'Issues/Transfers/Adjustment/s', 'Adjusted Cost', 'Repair History', null],
    // Row 14: Table subheaders
    [null, null, null, 'Qty.', 'Unit Cost', 'Total Cost', null, null, null, null, 'Nature of Repair', 'Amount'],
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
  
  // Fill remaining rows up to row 39 (25 data rows total from row 15-39)
  while (data.length < 39) {
    data.push([null, null, null, null, null, null, null, null, null, null, null, null]);
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Populate data into cells
  // Entity Name (C7:G7) - actual data
  if (asset.officePlace) {
    for (let c = 2; c <= 6; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 6, c });
      worksheet[cellAddr] = { t: 's', v: asset.officePlace };
    }
  }
  
  // Fund Cluster (I7:L7) - actual data
  if (asset.fundCluster) {
    for (let c = 8; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 6, c });
      worksheet[cellAddr] = { t: 's', v: asset.fundCluster };
    }
  }
  
  // Property, Plant and Equipment (C9:G9) - actual data
  if (asset.ppeClass) {
    for (let c = 2; c <= 6; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 8, c });
      worksheet[cellAddr] = { t: 's', v: asset.ppeClass };
    }
  }
  
  // Object Account Code (I9:L9) - actual data
  if (asset.accountCode) {
    for (let c = 8; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 8, c });
      worksheet[cellAddr] = { t: 's', v: asset.accountCode };
    }
  }
  
  // Description (C11:G11) - actual data
  if (asset.propertyDescription) {
    for (let c = 2; c <= 6; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 10, c });
      worksheet[cellAddr] = { t: 's', v: asset.propertyDescription };
    }
  }
  
  // Estimated Useful Life (I10:L10) - actual data (row 9)
  if (asset.usefulLife) {
    for (let c = 8; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 9, c });
      worksheet[cellAddr] = { t: 's', v: asset.usefulLife };
    }
  }
  
  // Rate of Depreciation (I11:L11) - actual data (row 10)
  const rateOfDepreciation = asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '');
  if (rateOfDepreciation) {
    for (let c = 8; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 10, c });
      worksheet[cellAddr] = { t: 's', v: rateOfDepreciation };
    }
  }
  
  // Set column widths based on exact mapping
  worksheet['!cols'] = [
    { wch: 4 },   // A
    { wch: 8 },   // B - Date (70px ≈ 8 chars)
    { wch: 10 },  // C - Reference (90px ≈ 10 chars)
    { wch: 6 },   // D - Qty (50px ≈ 6 chars)
    { wch: 8 },   // E - Unit Cost (70px ≈ 8 chars)
    { wch: 8 },   // F - Total Cost (70px ≈ 8 chars)
    { wch: 10 },  // G - Accumulated Depreciation (90px ≈ 10 chars)
    { wch: 10 },  // H - Accumulated Impairment Losses (90px ≈ 10 chars)
    { wch: 12 },  // I - Issues/Transfers/Adjustments (100px ≈ 12 chars)
    { wch: 9 },   // J - Adjusted Cost (80px ≈ 9 chars)
    { wch: 13 },  // K - Nature of Repair (110px ≈ 13 chars)
    { wch: 9 },   // L - Amount (80px ≈ 9 chars)
  ];
  
  // Set row heights (22px for data rows)
  worksheet['!rows'] = [
    { hpx: 20 }, // Row 1
    { hpx: 20 }, // Row 2
    { hpx: 20 }, // Row 3
    { hpx: 30 }, // Row 4 - Title
    { hpx: 20 }, // Row 5
    { hpx: 20 }, // Row 6
    { hpx: 22 }, // Row 7 - Entity/Fund
    { hpx: 20 }, // Row 8
    { hpx: 22 }, // Row 9 - PPE/Object
    { hpx: 22 }, // Row 10 - Estimated Use
    { hpx: 22 }, // Row 11 - Description/Rate
    { hpx: 20 }, // Row 12
    { hpx: 30 }, // Row 13 - Headers
    { hpx: 30 }, // Row 14 - Subheaders
  ];
  // Rows 15-39: height 22px (25 data rows)
  for (let i = 15; i <= 39; i++) {
    worksheet['!rows'].push({ hpx: 22 });
  }
  
  // Initialize merges
  if (!worksheet['!merges']) worksheet['!merges'] = [];
  
  // L1: Appendix 70 - italic, right-aligned
  if (worksheet['L1']) {
    worksheet['L1'].s = {
      font: { name: 'Times New Roman', sz: 11, italic: true },
      alignment: { horizontal: 'right', vertical: 'center' }
    };
  }
  
  // B4:J4: Main title - bold, centered, size 14
  worksheet['!merges'].push({ s: { r: 3, c: 1 }, e: { r: 3, c: 9 } });
  if (worksheet['B4']) {
    worksheet['B4'].s = {
      font: { name: 'Times New Roman', sz: 14, bold: true },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }
  
  // B7:G7: Entity Name - bold, size 11
  worksheet['!merges'].push({ s: { r: 6, c: 1 }, e: { r: 6, c: 6 } });
  if (worksheet['B7']) {
    worksheet['B7'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // H7:L7: Fund Cluster - bold, size 11
  worksheet['!merges'].push({ s: { r: 6, c: 7 }, e: { r: 6, c: 11 } });
  if (worksheet['H7']) {
    worksheet['H7'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // B9:G9: Property, Plant and Equipment - bold, size 11
  worksheet['!merges'].push({ s: { r: 8, c: 1 }, e: { r: 8, c: 6 } });
  if (worksheet['B9']) {
    worksheet['B9'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // H9:L9: Object Account Code - bold, size 11
  worksheet['!merges'].push({ s: { r: 8, c: 7 }, e: { r: 8, c: 11 } });
  if (worksheet['H9']) {
    worksheet['H9'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // B11:G11: Description - bold, size 11
  worksheet['!merges'].push({ s: { r: 10, c: 1 }, e: { r: 10, c: 6 } });
  if (worksheet['B11']) {
    worksheet['B11'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // H10:L10: Estimated Useful Life - bold, size 11
  worksheet['!merges'].push({ s: { r: 9, c: 7 }, e: { r: 9, c: 11 } });
  if (worksheet['H10']) {
    worksheet['H10'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // H11:L11: Rate of Depreciation - bold, size 11
  worksheet['!merges'].push({ s: { r: 10, c: 7 }, e: { r: 10, c: 11 } });
  if (worksheet['H11']) {
    worksheet['H11'].s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // Table headers - bold, centered, size 10
  worksheet['!merges'].push({ s: { r: 12, c: 1 }, e: { r: 13, c: 1 } }); // B13:B14 - Date
  worksheet['!merges'].push({ s: { r: 12, c: 2 }, e: { r: 13, c: 2 } }); // C13:C14 - Reference
  worksheet['!merges'].push({ s: { r: 12, c: 3 }, e: { r: 12, c: 5 } }); // D13:F13 - Receipt
  worksheet['!merges'].push({ s: { r: 12, c: 6 }, e: { r: 13, c: 6 } }); // G13:G14 - Accumulated Depreciation
  worksheet['!merges'].push({ s: { r: 12, c: 7 }, e: { r: 13, c: 7 } }); // H13:H14 - Accumulated Impairment Losses
  worksheet['!merges'].push({ s: { r: 12, c: 8 }, e: { r: 13, c: 8 } }); // I13:I14 - Issues/Transfers/Adjustments
  worksheet['!merges'].push({ s: { r: 12, c: 9 }, e: { r: 13, c: 9 } }); // J13:J14 - Adjusted Cost
  worksheet['!merges'].push({ s: { r: 12, c: 10 }, e: { r: 12, c: 11 } }); // K13:L13 - Repair History
  
  // Style table headers
  const headerCells = ['B13', 'C13', 'D13', 'G13', 'H13', 'I13', 'J13', 'K13', 'D14', 'E14', 'F14', 'K14', 'L14'];
  headerCells.forEach(cellAddr => {
    if (worksheet[cellAddr]) {
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 10, bold: true },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: { top: { style: 'thin', color: { auto: 1 } }, bottom: { style: 'thin', color: { auto: 1 } }, left: { style: 'thin', color: { auto: 1 } }, right: { style: 'thin', color: { auto: 1 } } }
      };
    }
  });
  
  // Add borders to all table cells (B15:L39)
  for (let r = 14; r <= 38; r++) {
    for (let c = 1; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 10 },
        border: { top: { style: 'thin', color: { auto: 1 } }, bottom: { style: 'thin', color: { auto: 1 } }, left: { style: 'thin', color: { auto: 1 } }, right: { style: 'thin', color: { auto: 1 } } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }
  
  // Add borders to header section (B7:L11)
  for (let r = 6; r <= 10; r++) {
    for (let c = 1; c <= 11; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      if (!worksheet[cellAddr]) worksheet[cellAddr] = { t: 's', v: '' };
      worksheet[cellAddr].s = {
        font: { name: 'Times New Roman', sz: 11 },
        border: { top: { style: 'thin', color: { auto: 1 } }, bottom: { style: 'thin', color: { auto: 1 } }, left: { style: 'thin', color: { auto: 1 } }, right: { style: 'thin', color: { auto: 1 } } },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Ledger Card');
  
  // Generate file name based on format
  let fileName;
  
  switch (format) {
    case 'csv':
      fileName = `${baseFileName}.csv`;
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
      break;
    case 'word':
      // For Word, we'll use .xlsx as a workaround since docx library is not installed
      fileName = `${baseFileName}.docx`;
      XLSX.writeFile(workbook, fileName);
      alert('Word export requires additional libraries. Excel file downloaded instead. Please convert to Word manually.');
      break;
    case 'excel':
    default:
      fileName = `${baseFileName}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      break;
  }
  
  return fileName;
};
