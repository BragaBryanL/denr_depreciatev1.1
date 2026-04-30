import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, PageOrientation, convertInchesToTwip, convertMillimetersToTwip } from 'docx';

export const generateCOAForm = (asset, transactions = [], format = 'excel') => {
  const baseFileName = `COA_Form_${asset.propertyNumber || 'Property'}_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'pdf') {
    return generatePDF(asset, transactions, baseFileName);
  }
  
  if (format === 'word') {
    return generateWord(asset, transactions, baseFileName);
  }
  
  // Excel, CSV generation
  return generateExcel(asset, transactions, format, baseFileName);
};

const generatePDF = (asset, transactions, baseFileName) => {
  // Use landscape orientation for better table fit
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set smaller margins to fit more content
  const pageWidth = 297; // A4 landscape width in mm
  const pageHeight = 210; // A4 landscape height in mm
  const margin = 10;
  
  // Set font
  doc.setFont('helvetica');
  
  // Title section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Appendix 70', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(10);
  doc.text('PROPERTY, PLANT AND EQUIPMENT LEDGER CARD', pageWidth / 2, 22, { align: 'center' });
  
  // Header section with proper layout (two-column)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  let y = 30;
  const lineHeight = 6;
  const leftCol = margin;
  const rightCol = pageWidth - 40; // Move to rightmost corner
  
  // Row 1: Entity Name | Fund Cluster
  doc.setFont('helvetica', 'bold');
  doc.text('Entity Name', leftCol, y);
  doc.text('Fund Cluster', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.officePlace || ''), leftCol, y);
  doc.text(String(asset.fundCluster || ''), rightCol, y);
  y += lineHeight + 1;
  
  // Row 2: Property, Plant and Equipment | Object Account Code
  doc.setFont('helvetica', 'bold');
  doc.text('Property, Plant and Equipment', leftCol, y);
  doc.text('Object Account Code', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.ppeClass || ''), leftCol, y);
  doc.text(String(asset.accountCode || ''), rightCol, y);
  y += lineHeight + 1;
  
  // Row 3: Description | Estimated Useful Life
  doc.setFont('helvetica', 'bold');
  doc.text('Description', leftCol, y);
  doc.text('Estimated Useful Life', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(String(asset.propertyDescription || ''), leftCol, y);
  doc.text(String(asset.usefulLife || ''), rightCol, y);
  y += lineHeight + 1;
  
  // Row 4: Empty | Rate of Depreciation
  doc.setFont('helvetica', 'bold');
  doc.text('Rate of Depreciation', rightCol, y);
  y += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  const rateOfDepreciation = asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '');
  doc.text(String(rateOfDepreciation), rightCol, y);
  y += lineHeight + 5;
  
  // Table headers - create manually to match Word exactly
  const pdfTableHeaders = [
    // Row 1: Main headers
    ['Date', 'Reference', 'Receipt', '', '', 'Accumulated Depreciation', 'Accumulated Impairment Losses', 'Issues/Transfers/Adjustment/s', 'Adjusted Cost', 'Repair History', ''],
    // Row 2: Sub headers
    ['', '', 'Qty.', 'Unit Cost', 'Total Cost', '', '', '', '', 'Nature of Repair', 'Amount']
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
        asset.propertyDescription || '',
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
  
  // Generate table using autoTable with proper structure
  const tableHeaders = [
    [
      { content: 'Date', rowSpan: 2 },
      { content: 'Reference', rowSpan: 2 },
      { content: 'Receipt', colSpan: 3 },
      { content: 'Accumulated Depreciation', rowSpan: 2 },
      { content: 'Accumulated Impairment Losses', rowSpan: 2 },
      { content: 'Issues/Transfers/Adjustment/s', rowSpan: 2 },
      { content: 'Adjusted Cost', rowSpan: 2 },
      { content: 'Repair History', colSpan: 2 }
    ],
    [
      'Qty.',
      'Unit Cost',
      'Total Cost',
      'Nature of Repair',
      'Amount'
    ]
  ];
  
  // Calculate available width for table
  const availableWidth = pageWidth - (margin * 2); // 277mm
  
  // Generate table
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: y,
    tableWidth: availableWidth, // Force table to fill entire available width
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      font: 'helvetica',
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // Date
      1: { cellWidth: 30, halign: 'left' }, // Reference
      2: { cellWidth: 17, halign: 'center' }, // Qty
      3: { cellWidth: 17, halign: 'center' }, // Unit Cost
      4: { cellWidth: 16, halign: 'center' }, // Total Cost
      5: { cellWidth: 35, halign: 'center' }, // Accumulated Depreciation
      6: { cellWidth: 35, halign: 'center' }, // Accumulated Impairment Losses
      7: { cellWidth: 35, halign: 'center' }, // Issues/Transfers
      8: { cellWidth: 30, halign: 'center' }, // Adjusted Cost
      9: { cellWidth: 25, halign: 'left' }, // Nature of Repair
      10: { cellWidth: 17, halign: 'center' }, // Amount
    },
    margin: { top: margin, right: margin, bottom: margin, left: margin },
    pageBreak: 'auto',
    rowPageBreak: 'avoid'
  });
  
  const fileName = `${baseFileName}.pdf`;
  doc.save(fileName);
  return fileName;
};

const generateExcel = (asset, transactions, format, baseFileName) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create the worksheet data based on the Python PPE card format
  const data = [
    // Row 1: Empty except L1 - Appendix 70
    [null, null, null, null, null, null, null, null, null, null, null, 'Appendix 70'],
    // Row 2-3: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 4: Main title (D4:J4 merged)
    [null, null, null, 'PROPERTY, PLANT AND EQUIPMENT LEDGER CARD', null, null, null, null, null, null, null, null],
    // Row 5-6: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 7: Entity Name and Fund Cluster labels
    [null, 'Entity Name :', null, null, null, null, null, null, null, 'Fund Cluster :', null, null],
    // Row 8: Empty (for underlines)
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 9: Left block and right block labels
    [null, 'Property, Plant and Equipment:', null, null, null, null, null, null, 'Object Account Code:', null, null, null],
    // Row 10: Empty (for internal lines)
    [null, null, null, null, null, null, null, null, 'Estimated Useful Life:', null, null, null],
    // Row 11: Description and Rate of Depreciation
    [null, 'Description:', null, null, null, null, null, null, 'Rate of Depreciation:', null, null, null],
    // Row 12: Empty
    [null, null, null, null, null, null, null, null, null, null, null, null],
    // Row 13: Table headers (merged cells)
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
    '',
    '',
    '',
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
        asset.propertyDescription || '',
        '',
        '',
        '',
        accumulatedDepreciation,
        '',
        '',
        netBookValue,
        '',
        ''
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
  
  // No need to fill with empty rows - only create rows with actual data
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Apply Python-style formatting
  applyPythonStyle(worksheet, asset, data);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PPE Ledger Card');
  
  // Generate file name based on format
  let fileName;
  
  if (format === 'csv') {
    fileName = `${baseFileName}.csv`;
    XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
  } else {
    fileName = `${baseFileName}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
  
  return fileName;
};

const applyPythonStyle = (worksheet, asset, data) => {
  // Set column widths for text visibility while fitting reasonably on page
  worksheet['!cols'] = [
    { wch: 4 },   // A
    { wch: 15 },  // B - Date/Labels
    { wch: 50 },  // C - Reference/Description (increased back to 50 for text visibility)
    { wch: 8 },   // D - Qty
    { wch: 10 },  // E - Unit Cost
    { wch: 10 },  // F - Total Cost
    { wch: 12 },  // G - Accumulated Depreciation
    { wch: 12 },  // H - Accumulated Impairment Losses
    { wch: 12 },  // I - Issues/Transfers/Adjustments
    { wch: 10 },  // J - Adjusted Cost/Values
    { wch: 15 },  // K - Nature of Repair
    { wch: 10 },  // L - Amount
  ];
  
  // Set row heights based on Python format with increased height for description row
  worksheet['!rows'] = [
    { hpx: 18 }, // Row 1
    { hpx: 18 }, // Row 2
    { hpx: 18 }, // Row 3
    { hpx: 24 }, // Row 4 - Title
    { hpx: 8 },  // Row 5
    { hpx: 10 }, // Row 6
    { hpx: 22 }, // Row 7 - Entity/Fund
    { hpx: 10 }, // Row 8
    { hpx: 22 }, // Row 9 - PPE/Object
    { hpx: 22 }, // Row 10
    { hpx: 60 }, // Row 11 - Description/Rate (increased from 22 to 60 for text wrapping)
    { hpx: 8 },  // Row 12
    { hpx: 24 }, // Row 13 - Headers
    { hpx: 34 }, // Row 14 - Subheaders
  ];
  // Transaction rows - only create for actual data rows
  const actualDataRows = data.length - 14; // Subtract header rows (1-14)
  for (let i = 0; i < actualDataRows; i++) {
    worksheet['!rows'].push({ hpx: 45 });
  }

  // Initialize merges
  if (!worksheet['!merges']) worksheet['!merges'] = [];

  // Apply Python-style cell formatting
  const borderStyle = {
    style: 'thin',
    color: { auto: 1 }
  };
  
  const mediumBorder = {
    style: 'medium',
    color: { auto: 1 }
  };

  // L1: Appendix 70 - italic, right-aligned
  const l1Cell = worksheet['L1'];
  if (l1Cell) {
    l1Cell.s = {
      font: { name: 'Times New Roman', sz: 11, italic: true },
      alignment: { horizontal: 'right', vertical: 'center' }
    };
  }
  
  // D4:J4: Main title - bold, centered, size 14
  worksheet['!merges'].push({ s: { r: 3, c: 3 }, e: { r: 3, c: 9 } });
  const d4Cell = worksheet['D4'];
  if (d4Cell) {
    d4Cell.s = {
      font: { name: 'Times New Roman', sz: 14, bold: true },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
    };
  }
  
  // Entity and Fund labels
  const b7Cell = worksheet['B7'];
  if (b7Cell) {
    b7Cell.s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  const j7Cell = worksheet['J7'];
  if (j7Cell) {
    j7Cell.s = {
      font: { name: 'Times New Roman', sz: 11, bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    };
  }
  
  // Table header merges from Python code
  // B13:B14 - Date
  worksheet['!merges'].push({ s: { r: 12, c: 1 }, e: { r: 13, c: 1 } });
  
  // C13:C14 - Reference  
  worksheet['!merges'].push({ s: { r: 12, c: 2 }, e: { r: 13, c: 2 } });
  
  // D13:F13 - Receipt
  worksheet['!merges'].push({ s: { r: 12, c: 3 }, e: { r: 12, c: 5 } });
  
  // G13:G14 - Accumulated Depreciation
  worksheet['!merges'].push({ s: { r: 12, c: 6 }, e: { r: 13, c: 6 } });
  
  // H13:H14 - Accumulated Impairment Losses
  worksheet['!merges'].push({ s: { r: 12, c: 7 }, e: { r: 13, c: 7 } });
  
  // I13:I14 - Issues/Transfers/Adjustments
  worksheet['!merges'].push({ s: { r: 12, c: 8 }, e: { r: 13, c: 8 } });
  
  // J13:J14 - Adjusted Cost
  worksheet['!merges'].push({ s: { r: 12, c: 9 }, e: { r: 13, c: 9 } });
  
  // K13:L13 - Repair History
  worksheet['!merges'].push({ s: { r: 12, c: 10 }, e: { r: 12, c: 11 } });
  
  // Populate data
  if (asset.officePlace) {
    const c7Cell = worksheet['C7'];
    if (c7Cell) {
      c7Cell.v = asset.officePlace;
      c7Cell.s = {
        font: { name: 'Times New Roman', sz: 11 },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
  }
  
  if (asset.fundCluster) {
    const k7Cell = worksheet['K7'];
    if (k7Cell) {
      k7Cell.v = asset.fundCluster;
      k7Cell.s = {
        font: { name: 'Times New Roman', sz: 11 },
        alignment: { horizontal: 'left', vertical: 'center' }
      };
    }
  }
  
  // Populate missing fields in correct cells (preserve labels)
  // Property, Plant and Equipment value goes to cell C9 (after the label in B9)
  if (asset.ppeClass) {
    worksheet['C9'] = { t: 's', v: asset.ppeClass, s: { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } } };
  }
  
  // Object Account Code value goes to cell J9 (after the label in I9)
  if (asset.accountCode) {
    worksheet['J9'] = { t: 's', v: asset.accountCode, s: { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } } };
  }
  
  // Description value goes to cell C11 (after the label in B11)
  if (asset.propertyDescription) {
    worksheet['C11'] = { t: 's', v: asset.propertyDescription, s: { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } } };
  }
  
  // Estimated Useful Life value goes to cell J10 (after the label in I10)
  if (asset.usefulLife) {
    worksheet['J10'] = { t: 's', v: asset.usefulLife, s: { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } } };
  }
  
  // Rate of Depreciation value goes to cell J11 (after the label in I11)
  const rateOfDepreciation = asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '');
  if (rateOfDepreciation) {
    worksheet['J11'] = { t: 's', v: rateOfDepreciation, s: { alignment: { horizontal: 'left', vertical: 'center', wrapText: true } } };
  }
  
  // Apply borders to entity/fund section with bold underlines
  const boldUnderline = { style: 'medium', color: { rgb: '000000' } };
  
  // Entity Name cells (C7:G7) - create cells and add bold underline
  for (let c = 2; c <= 6; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c });
    if (!worksheet[cellRef]) {
      worksheet[cellRef] = { t: 's', v: '', s: {} };
    }
    worksheet[cellRef].s = {
      ...worksheet[cellRef].s,
      border: { bottom: boldUnderline }
    };
  }
  
  // Fund Cluster cells (J7:L7) - create cells and add bold underline
  for (let c = 9; c <= 11; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 6, c });
    if (!worksheet[cellRef]) {
      worksheet[cellRef] = { t: 's', v: '', s: {} };
    }
    worksheet[cellRef].s = {
      ...worksheet[cellRef].s,
      border: { bottom: boldUnderline }
    };
  }
  
  // Apply table borders - complete border structure
  applyTableBorders(worksheet, data);
  
  // Side mark (optional)
  const a19Cell = worksheet['A19'];
  if (a19Cell) {
    a19Cell.v = 'L/L';
    a19Cell.s = {
      font: { name: 'Times New Roman', sz: 10 },
      alignment: { textRotation: 90, horizontal: 'center', vertical: 'center' }
    };
  }
};

const applyTableBorders = (worksheet, data) => {
  // Create border style using xlsx-js-style format
  const boldBorder = {
    top: { style: 'medium', color: { rgb: '000000' } },
    bottom: { style: 'medium', color: { rgb: '000000' } },
    left: { style: 'medium', color: { rgb: '000000' } },
    right: { style: 'medium', color: { rgb: '000000' } }
  };
  
  // Apply borders to all table cells
  const applyBorderToRange = (startRow, endRow, startCol, endCol, fontBold = false, align = 'center') => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: r - 1, c: c - 1 });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' };
        }
        worksheet[cellRef].s = {
          border: boldBorder,
          font: { name: 'Times New Roman', sz: 10, bold: fontBold },
          alignment: { horizontal: align, vertical: 'center', wrapText: true }
        };
      }
    }
  };
  
  // Information blocks - ALL cells with bold borders
  applyBorderToRange(9, 12, 2, 8); // Left block (B9:H12)
  applyBorderToRange(9, 12, 9, 12); // Right block (I9:L12)
  
  // Table headers - ALL cells with bold borders
  applyBorderToRange(13, 14, 2, 12, true, 'center'); // Rows 13-14, cols B-L
  
  // Transaction rows - ALL cells with bold borders
  const lastDataRow = data.length; // Last actual row with data
  applyBorderToRange(15, lastDataRow, 2, 12, false, 'center'); // Actual data rows, cols B-L
  
  // Fix alignment for Reference and Nature of Repair columns
  for (let r = 15; r <= lastDataRow; r++) {
    // Reference column (C)
    const refCell = XLSX.utils.encode_cell({ r: r - 1, c: 2 });
    if (worksheet[refCell]) {
      worksheet[refCell].s.alignment.horizontal = 'left';
    }
    // Nature of Repair column (K)
    const repairCell = XLSX.utils.encode_cell({ r: r - 1, c: 10 });
    if (worksheet[repairCell]) {
      worksheet[repairCell].s.alignment.horizontal = 'left';
    }
  }
};

const generateWord = (asset, transactions, baseFileName) => {
  // Create table data similar to Excel but for Word
  const tableData = [];
  
  // Header rows - matching PDF structure with fixed widths
  tableData.push([
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date", bold: true })] })], width: { size: convertMillimetersToTwip(20) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Reference", bold: true })] })], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Receipt", bold: true })] })], width: { size: convertMillimetersToTwip(50) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Accumulated Depreciation", bold: true })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Accumulated Impairment Losses", bold: true })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Issues/Transfers/Adjustment/s", bold: true })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Adjusted Cost", bold: true })] })], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Repair History", bold: true })] })], width: { size: convertMillimetersToTwip(42) } })
  ]);
  
  // Sub-header row for Receipt and Repair History
  tableData.push([
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(20) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qty.    Unit Cost    Total Cost", bold: true })] })], width: { size: convertMillimetersToTwip(50) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nature of Repair    Amount", bold: true })] })], width: { size: convertMillimetersToTwip(42) } })
  ]);
  
  // Initial acquisition row
  tableData.push([
    new TableCell({ children: [new Paragraph(asset.dateAcquired || '')], width: { size: convertMillimetersToTwip(20) } }),
    new TableCell({ children: [new Paragraph(asset.propertyDescription || '')], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1    " + (parseFloat(asset.unitCost) || parseFloat(asset.cost) || 0).toFixed(2) + "    " + (parseFloat(asset.cost) || 0).toFixed(2) })] })], width: { size: convertMillimetersToTwip(50) } }),
    new TableCell({ children: [new Paragraph('0.00')], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph('0.00')], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph('0.00')], width: { size: convertMillimetersToTwip(35) } }),
    new TableCell({ children: [new Paragraph((parseFloat(asset.cost) || 0).toFixed(2))], width: { size: convertMillimetersToTwip(30) } }),
    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "    0.00" })] })], width: { size: convertMillimetersToTwip(42) } })
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
        new TableCell({ children: [new Paragraph(yearEnd.toISOString().split('T')[0])], width: { size: convertMillimetersToTwip(20) } }),
        new TableCell({ children: [new Paragraph(asset.propertyDescription || '')], width: { size: convertMillimetersToTwip(30) } }),
        new TableCell({ children: [new Paragraph('')], width: { size: convertMillimetersToTwip(50) } }),
        new TableCell({ children: [new Paragraph(accumulatedDepreciation.toFixed(2))], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph('0.00')], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph('0.00')], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph(netBookValue.toFixed(2))], width: { size: convertMillimetersToTwip(30) } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "    0.00" })] })], width: { size: convertMillimetersToTwip(42) } })
      ]);
    }
  }
  
  // Repair history rows
  if (transactions && transactions.length > 0) {
    transactions.forEach((transaction) => {
      tableData.push([
        new TableCell({ children: [new Paragraph(transaction.date || '')], width: { size: convertMillimetersToTwip(20) } }),
        new TableCell({ children: [new Paragraph('Repair/Maintenance')], width: { size: convertMillimetersToTwip(30) } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "    " + (parseFloat(transaction.amount) || 0).toFixed(2) })] })], width: { size: convertMillimetersToTwip(50) } }),
        new TableCell({ children: [new Paragraph('')], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph('')], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph('')], width: { size: convertMillimetersToTwip(35) } }),
        new TableCell({ children: [new Paragraph('')], width: { size: convertMillimetersToTwip(30) } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (transaction.natureOfRepair || '') + "    " + (parseFloat(transaction.amount) || 0).toFixed(2) })] })], width: { size: convertMillimetersToTwip(42) } })
      ]);
    });
  }
  
  // Create the document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE,
            width: convertMillimetersToTwip(297), // A4 landscape width
            height: convertMillimetersToTwip(210), // A4 landscape height
          },
          margin: {
            top: convertMillimetersToTwip(10),
            bottom: convertMillimetersToTwip(10),
            left: convertMillimetersToTwip(10),
            right: convertMillimetersToTwip(10),
          },
        },
      },
      children: [
        // Appendix 70 - right aligned
        new Paragraph({
          children: [
            new TextRun({
              text: "Appendix 70",
              bold: true,
              italic: true
            })
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 }
        }),
        
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: "PROPERTY, PLANT AND EQUIPMENT LEDGER CARD",
              bold: true,
              size: 32
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        // Asset information in two-column layout
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Entity Name", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Fund Cluster", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.officePlace || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.fundCluster || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Property, Plant and Equipment", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Object Account Code", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.ppeClass || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.accountCode || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Estimated Useful Life", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.propertyDescription || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: asset.usefulLife || '' })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "" })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Rate of Depreciation", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "" })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    children: [new TextRun({ 
                      text: asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : (asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : '') 
                    })] 
                  })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE }
        }),
        
        // Main table
        new Table({
          rows: tableData.map(rowData => 
            new TableRow({
              children: rowData
            })
          ),
          width: {
            size: convertMillimetersToTwip(277), // A4 landscape width minus margins
            type: WidthType.DXA
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
            insideVertical: { style: BorderStyle.SINGLE, size: 1 }
          },
          alignment: AlignmentType.CENTER
        })
      ]
    }]
  });
  
  // Generate and save the Word document
  const fileName = `${baseFileName}.docx`;
  
  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
  return fileName;
};
