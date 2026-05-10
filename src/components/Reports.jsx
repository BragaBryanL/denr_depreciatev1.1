import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';

function Reports() {
  const [reportType, setReportType] = useState('depreciation');
  const [dateRange, setDateRange] = useState('current-year');
  const [selectedPPEClass, setSelectedPPEClass] = useState('all');
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const reportsRef = React.useRef(null);
  const tableRef = React.useRef(null);

  const loadData = () => {
    const savedAssets = localStorage.getItem('denr_assets');
    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    }

    const savedTransactions = localStorage.getItem('denr_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  useEffect(() => {
    loadData();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'denr_assets' || e.key === 'denr_transactions') {
        loadData();
      }
    };

    // Listen for custom data change event
    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('denrDataChanged', handleDataChange);

    // Intersection Observer to reload when Reports becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadData();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (reportsRef.current) {
      observer.observe(reportsRef.current);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('denrDataChanged', handleDataChange);
      if (reportsRef.current) {
        observer.unobserve(reportsRef.current);
      }
    };
  }, []);

  const reportTypes = [
    { id: 'depreciation', label: 'Depreciation Report', icon: FileText },
    { id: 'asset-summary', label: 'Asset Summary', icon: FileText },
    { id: 'disposal', label: 'Disposal Report', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
  ];

  const dateRanges = [
    { id: 'current-year', label: 'Current Year' },
    { id: 'last-quarter', label: 'Last Quarter' },
    { id: 'last-year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  // Pagination logic
  const totalPages = Math.ceil(assets.length / itemsPerPage);
  const paginatedAssets = assets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when report type changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reportType]);

  // Scroll to table when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  
  const downloadReport = () => {
    if (reportType === 'depreciation') {
      const { reportData, totalAnnualDepreciation, totalAccumulatedDepreciation } = getDepreciationReportData();

      // Create worksheet data
      const wsData = [
        ['#', 'PPE Class', 'Account Code', 'Annual Depreciation', 'Accumulated Depreciation'],
        ...reportData.map((item, index) => [
          index + 1,
          item.ppeClass,
          item.accountCode,
          item.annualDepreciation,
          item.accumulatedDepreciation
        ]),
        ['TOTAL', '', '', totalAnnualDepreciation, totalAccumulatedDepreciation]
      ];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { width: 5 },  // #
        { width: 40 }, // PPE Class
        { width: 15 }, // Account Code
        { width: 20 }, // Annual Depreciation
        { width: 25 }  // Accumulated Depreciation
      ];

      // Apply proper cell styling with xlsx-js-style
      const range = XLSX.utils.decode_range(ws['!ref']);

      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];

          if (cell) {
            // Default border for all cells
            cell.s = {
              border: {
                top: { style: "thin", color: { rgb: "FF000000" } },
                bottom: { style: "thin", color: { rgb: "FF000000" } },
                left: { style: "thin", color: { rgb: "FF000000" } },
                right: { style: "thin", color: { rgb: "FF000000" } }
              }
            };

            // Header row formatting
            if (R === 0) {
              cell.s.font = { bold: true };
              cell.s.fill = { patternType: "solid", fgColor: { rgb: "FFD3D3D3" } };
              cell.s.alignment = { horizontal: "center", vertical: "center" };
              cell.s.border = {
                top: { style: "medium", color: { rgb: "FF000000" } },
                bottom: { style: "medium", color: { rgb: "FF000000" } },
                left: { style: "thin", color: { rgb: "FF000000" } },
                right: { style: "thin", color: { rgb: "FF000000" } }
              };
            }
            // Total row formatting
            else if (R === range.e.r) {
              cell.s.font = { bold: true };
              cell.s.fill = { patternType: "solid", fgColor: { rgb: "FFE6E6E6" } };
              cell.s.alignment = { horizontal: "right", vertical: "center" };
              cell.s.border = {
                top: { style: "medium", color: { rgb: "FF000000" } },
                bottom: { style: "medium", color: { rgb: "FF000000" } },
                left: { style: "thin", color: { rgb: "FF000000" } },
                right: { style: "thin", color: { rgb: "FF000000" } }
              };

              // Apply peso formatting to depreciation columns in TOTAL row
              if (C >= 3 && C <= 4) {
                cell.s.numFmt = '"₱"#,##0.00';
              }

              // Merge first 3 columns for TOTAL
              if (C === 0) {
                ws['!merges'] = ws['!merges'] || [];
                ws['!merges'].push({ s: { r: R, c: 0 }, e: { r: R, c: 2 } });
              }
            }
            // Data rows
            else {
              // Alternating row colors
              if (R % 2 === 1) {
                cell.s.fill = { patternType: "solid", fgColor: { rgb: "FFF9F9F9" } };
              }

              // ACTIVE COLUMN HIGHLIGHTING for depreciation columns
              if (C >= 3 && C <= 4) {
                cell.s.numFmt = '"₱"#,##0.00';
                cell.s.alignment = { horizontal: "right", vertical: "center" };
                cell.s.border.right = { style: "medium", color: { rgb: "FF000000" } };
              }
              // ACTIVE COLUMN HIGHLIGHTING for Account Code column
              else if (C === 2) {
                cell.s.alignment = { horizontal: "left", vertical: "center" };
                cell.s.border.right = { style: "medium", color: { rgb: "FF000000" } };
              }
              // # column
              else if (C === 0) {
                cell.s.alignment = { horizontal: "center", vertical: "center" };
              }
              // PPE Class column
              else if (C === 1) {
                cell.s.alignment = { horizontal: "left", vertical: "center" };
              }
            }
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Depreciation Report');

      // Generate filename with date range
      const dateRangeLabel = dateRanges.find(dr => dr.id === dateRange)?.label || 'Custom';
      const filename = `Depreciation_Report_${dateRangeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
    } else if (reportType === 'asset-summary') {
      const rpcpeData = getRPCPEReportData();
      const ppeClasses = Object.keys(rpcpeData);
      const filteredPPEClasses = selectedPPEClass === 'all' ? ppeClasses : [selectedPPEClass];
      let globalIndex = 1;

      // Create worksheet data with Appendix 73 format
      const wsData = [];
      
      // Add header rows for Appendix 73 format
      wsData.push(['179', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['Appendix 73', '', '', '', '', '', '', '', '', '', '']);
      wsData.push([]);
      wsData.push(['REPORT ON THE PHYSICAL COUNT OF PROPERTY, PLANT AND EQUIPMENT', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['________________________________', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['(Type of Property, Plant and Equipment)', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['As at ________________________________', '', '', '', '', '', '', '', '', '', '']);
      wsData.push([]);
      wsData.push(['Fund Cluster : ________________________________', '', '', '', '', '', '', '', '', '', '']);
      wsData.push(['For which ___(Name of Accountable Officer)__, _ (Official Designation)___, _______(Entity Name)________ is accountable, having assumed such accountability on _(Date of Assumption).', '', '', '', '', '', '', '', '', '', '']);
      wsData.push([]);
      
      // Add table header
      wsData.push(['ARTICLE', 'DESCRIPTION', 'PROPERTY NUMBER', 'UNIT OF MEASURE', 'UNIT VALUE', 'QUANTITY', 'QUANTITY', 'SHORTAGE/OVERAGE', '', 'REMARKS']);
      wsData.push(['', '', '', '', '', 'per', 'per', '', '', '']);
      wsData.push(['', '', '', '', '', 'PROPERTY CARD', 'PHYSICAL COUNT', 'Quantity', 'Value', '']);
      wsData.push(['', '', '', '', '', '', '', '', '', '']);

      filteredPPEClasses.forEach((ppeClass) => {
        // Add PPE class header row
        wsData.push([ppeClass, '', '', '', '', '', '', '', '', '']);
        // Add assets under this PPE class
        rpcpeData[ppeClass].forEach((asset) => {
          const shortageQty = asset.shortageQuantity || ((asset.quantity || 1) - (asset.physicalCountQuantity || asset.quantity || 1));
          const shortageValue = shortageQty * (parseFloat(asset.cost) || 0);
          wsData.push([
            asset.ppeClass || '',
            asset.description || '',
            asset.propertyNumber || '',
            asset.unitOfMeasure || 'Unit',
            parseFloat(asset.cost) || 0,
            asset.quantity || 1,
            asset.physicalCountQuantity || asset.quantity || 1,
            shortageQty,
            shortageValue,
            asset.accountableOfficer || asset.status || ''
          ]);
        });
      });

      // Add empty rows
      for (let i = 0; i < 15; i++) {
        wsData.push(['', '', '', '', '', '', '', '', '', '']);
      }

      // Add certification section
      wsData.push([]);
      wsData.push(['Certified Correct by:', '', '', '', '', '', '', '', '', '']);
      wsData.push(['', 'Approved by:', '', '', '', '', '', '', '', 'Verified by:']);
      wsData.push(['', '', '', '', '', '', '', '', '', '']);
      wsData.push(['Signature over Printed Name of Inventory Committee Chair and Members', '', '', '', '', '', '', '', '', 'Signature over Printed Name of Head of Agency/Entity or Authorized Representative', '', '', '', '', '', '', '', '', 'Signature over Printed Name of COA Representative']);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { width: 20 },  // ARTICLE
        { width: 30 },  // DESCRIPTION
        { width: 18 },  // PROPERTY NUMBER
        { width: 12 },  // UNIT OF MEASURE
        { width: 12 },  // UNIT VALUE
        { width: 12 },  // QUANTITY per PROPERTY CARD
        { width: 12 },  // QUANTITY per PHYSICAL COUNT
        { width: 10 },  // SHORTAGE/OVERAGE Quantity
        { width: 12 },  // SHORTAGE/OVERAGE Value
        { width: 25 }   // REMARKS
      ];

      // Apply proper cell styling with xlsx-js-style
      const range = XLSX.utils.decode_range(ws['!ref']);

      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];

          if (cell) {
            // Page number and Appendix 73
            if (R === 0) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "left", vertical: "center" }
              };
            }
            // Form title
            else if (R === 3) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" }
              };
              // Merge cells for title
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 9 } });
            }
            // Underline
            else if (R === 4) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" }
              };
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 9 } });
            }
            // Type of PPE label
            else if (R === 5) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" }
              };
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 5, c: 0 }, e: { r: 5, c: 9 } });
            }
            // As at line
            else if (R === 6) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" }
              };
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 6, c: 0 }, e: { r: 6, c: 9 } });
            }
            // Fund Cluster line
            else if (R === 8) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "left", vertical: "center" }
              };
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 8, c: 0 }, e: { r: 8, c: 9 } });
            }
            // Accountable officer line
            else if (R === 9) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "left", vertical: "center" }
              };
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 9, c: 0 }, e: { r: 9, c: 9 } });
            }
            // Table header row 1
            else if (R === 11) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "FF000000" } },
                  bottom: { style: "thin", color: { rgb: "FF000000" } },
                  left: { style: "thin", color: { rgb: "FF000000" } },
                  right: { style: "thin", color: { rgb: "FF000000" } }
                }
              };
            }
            // Table header row 2
            else if (R === 12) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "FF000000" } },
                  bottom: { style: "thin", color: { rgb: "FF000000" } },
                  left: { style: "thin", color: { rgb: "FF000000" } },
                  right: { style: "thin", color: { rgb: "FF000000" } }
                }
              };
            }
            // Table header row 3
            else if (R === 13) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "FF000000" } },
                  bottom: { style: "thin", color: { rgb: "FF000000" } },
                  left: { style: "thin", color: { rgb: "FF000000" } },
                  right: { style: "thin", color: { rgb: "FF000000" } }
                }
              };
              // Merge SHORTAGE/OVERAGE columns
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: 11, c: 7 }, e: { r: 13, c: 7 } });
              ws['!merges'].push({ s: { r: 11, c: 6 }, e: { r: 13, c: 6 } });
              ws['!merges'].push({ s: { r: 11, c: 5 }, e: { r: 13, c: 5 } });
            }
            // PPE class header rows (where only first column has text)
            else if (C === 0 && wsData[R][C] && !wsData[R][1]) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "left", vertical: "center" },
                border: {
                  top: { style: "thin", color: { rgb: "FF000000" } },
                  bottom: { style: "thin", color: { rgb: "FF000000" } },
                  left: { style: "thin", color: { rgb: "FF000000" } },
                  right: { style: "thin", color: { rgb: "FF000000" } }
                }
              };
              // Merge cells for PPE class header
              ws['!merges'] = ws['!merges'] || [];
              ws['!merges'].push({ s: { r: R, c: 0 }, e: { r: R, c: 9 } });
            }
            // Data rows
            else if (wsData[R][1]) {
              // Numeric columns formatting
              if (C === 4) { // Unit Value
                cell.s = {
                  numFmt: '"₱"#,##0.00',
                  alignment: { horizontal: "right", vertical: "center" },
                  border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                  }
                };
              }
              else if (C === 5 || C === 6 || C === 7) { // Qty columns
                cell.s = {
                  alignment: { horizontal: "right", vertical: "center" },
                  border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                  }
                };
              }
              else if (C === 8) { // Shortage Value
                cell.s = {
                  numFmt: '"₱"#,##0.00',
                  alignment: { horizontal: "right", vertical: "center" },
                  border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                  }
                };
              }
              else {
                cell.s = {
                  alignment: { horizontal: "left", vertical: "center" },
                  border: {
                    top: { style: "thin", color: { rgb: "FF000000" } },
                    bottom: { style: "thin", color: { rgb: "FF000000" } },
                    left: { style: "thin", color: { rgb: "FF000000" } },
                    right: { style: "thin", color: { rgb: "FF000000" } }
                  }
                };
              }
            }
            // Certification section
            else if (R >= range.e.r - 3) {
              cell.s = {
                font: { bold: true },
                alignment: { horizontal: "left", vertical: "center" }
              };
            }
          }
        }
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'RPCPPE');

      // Generate filename with PPE class filter
      const ppeClassLabel = selectedPPEClass === 'all' ? 'All' : selectedPPEClass;
      const filename = `RPCPPE_${ppeClassLabel}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
    } else {
      console.log(`Downloading ${reportType} report`);
      // Implementation for other report types
    }
  };

  const calculateDepreciationAsOfDate = (asset, asOfDate) => {
    if (asset.usefulLife === 'Indefinite' || asset.status !== 'Serviceable') {
      return {
        annualDepreciation: parseFloat(asset.annualDepreciation) || 0,
        accumulatedDepreciation: parseFloat(asset.accumulatedDepreciation) || 0
      };
    }

    const acquiredDate = new Date(asset.dateAcquired);
    const usefulLifeYears = parseFloat(asset.usefulLife) || 0;
    const totalCost = asset.cost || 0;
    
    if (usefulLifeYears <= 0) {
      return {
        annualDepreciation: parseFloat(asset.annualDepreciation) || 0,
        accumulatedDepreciation: parseFloat(asset.accumulatedDepreciation) || 0
      };
    }

    // Calculate annual depreciation
    const residualValue = totalCost * 0.10; // 10% residual value
    const depreciationAmount = totalCost - residualValue;
    const annualDepreciation = depreciationAmount / usefulLifeYears;
    
    // Calculate accumulated depreciation as of the specified date
    const yearsElapsed = Math.max(0, (asOfDate - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
    const maxDepreciation = depreciationAmount; // Maximum is 90% of cost
    const accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, maxDepreciation);
    
    return {
      annualDepreciation,
      accumulatedDepreciation
    };
  };

  const getDateRangeForCalculation = (dateRange) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    switch (dateRange) {
      case 'current-year':
        return new Date(currentYear, 11, 31); // December 31st of current year
        
      case 'last-quarter':
        // Calculate last quarter end date
        const lastQuarter = Math.floor(currentMonth / 3);
        const lastQuarterYear = lastQuarter === 0 ? currentYear - 1 : currentYear;
        const quarterEndMonth = lastQuarter === 0 ? 12 : lastQuarter * 3;
        return new Date(lastQuarterYear, quarterEndMonth - 1, new Date(lastQuarterYear, quarterEndMonth, 0).getDate());
        
      case 'last-year':
        return new Date(currentYear - 1, 11, 31); // December 31st of last year
        
      case 'custom':
        // For now, default to current year end
        return new Date(currentYear, 11, 31);
        
      default:
        return new Date(currentYear, 11, 31);
    }
  };

  const getDepreciationReportData = () => {
    // Get the calculation date based on the selected date range
    const calculationDate = getDateRangeForCalculation(dateRange);
    
    // PPE Class to Account Code mapping
    const ppeAccountCodes = {
      'Land': '10601010',
      'Land Improvements, Reforestation Projects': '10602020',
      'Other Land Improvements': '10602990',
      'Water Supply Systems': '10603040',
      'Power Supply Systems': '10603050',
      'Buildings': '10604010',
      'Other Structures': '10604990',
      'Office Equipment': '10605020',
      'Information and Communication Technology Equipment': '10605030',
      'Communication Equipment': '10605070',
      'Technical and Scientific Equipment': '10605140',
      'Motor Vehicles': '10606010',
      'Furniture and Fixtures': '10607010',
      'Construction in Progress - Land Improvements': '10699010',
      'Construction in Progress - Buildings and Other Structures': '10699030',
      'Disaster Response and Rescue Equipment': '10605090'
    };

    // Group assets by PPE class and calculate totals as of the selected date
    const groupedData = {};
    let totalAnnualDepreciation = 0;
    let totalAccumulatedDepreciation = 0;

    assets.forEach(asset => {
      if (asset.status === 'Serviceable') {
        const ppeClass = asset.ppeClass || 'Unknown';
        const accountCode = ppeAccountCodes[ppeClass] || '00000000';
        
        // Calculate depreciation as of the selected date
        const depreciation = calculateDepreciationAsOfDate(asset, calculationDate);
        
        if (!groupedData[ppeClass]) {
          groupedData[ppeClass] = {
            accountCode,
            annualDepreciation: 0,
            accumulatedDepreciation: 0
          };
        }

        groupedData[ppeClass].annualDepreciation += depreciation.annualDepreciation;
        groupedData[ppeClass].accumulatedDepreciation += depreciation.accumulatedDepreciation;
        
        totalAnnualDepreciation += depreciation.annualDepreciation;
        totalAccumulatedDepreciation += depreciation.accumulatedDepreciation;
      }
    });

    // Convert to array and sort by PPE class
    const reportData = Object.entries(groupedData).map(([ppeClass, data]) => ({
      ppeClass,
      accountCode: data.accountCode,
      annualDepreciation: data.annualDepreciation,
      accumulatedDepreciation: data.accumulatedDepreciation
    })).sort((a, b) => a.ppeClass.localeCompare(b.ppeClass));

    return { reportData, totalAnnualDepreciation, totalAccumulatedDepreciation };
  };

  const getRPCPEReportData = () => {
    // Group assets by PPE class
    const groupedAssets = assets.reduce((acc, asset) => {
      const ppeClass = asset.ppeClass || 'Unclassified';
      if (!acc[ppeClass]) {
        acc[ppeClass] = [];
      }
      acc[ppeClass].push(asset);
      return acc;
    }, {});

    return groupedAssets;
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'depreciation':
        const { reportData, totalAnnualDepreciation, totalAccumulatedDepreciation } = getDepreciationReportData();

        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Depreciation Report by PPE Class</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-denr-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PPE Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annual Depreciation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accumulated Depreciation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((item, index) => (
                    <tr key={item.ppeClass}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ppeClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.accountCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{item.annualDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{item.accumulatedDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan="3">TOTAL</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{totalAnnualDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{totalAccumulatedDepreciation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'asset-summary':
        const rpcpeData = getRPCPEReportData();
        const ppeClasses = Object.keys(rpcpeData);
        const filteredPPEClasses = selectedPPEClass === 'all' ? ppeClasses : [selectedPPEClass];
        let globalIndex = 1;

        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Report on the Physical Count of Property, Plant and Equipment (Asset Summary)</h4>
            <div className="mb-4 flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by PPE Class:</label>
              <select
                value={selectedPPEClass}
                onChange={(e) => setSelectedPPEClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green/50 focus:border-denr-green bg-white"
              >
                <option value="all">All PPE Classes</option>
                {ppeClasses.sort().map((ppeClass) => (
                  <option key={ppeClass} value={ppeClass}>{ppeClass}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto" ref={tableRef}>
              <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                <thead className="bg-denr-bg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Article (PPE Class)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Property Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Unit of Measure
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Unit Value (Cost)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Qty per Property Card
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Qty per Physical Count
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Shortage Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Shortage Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                      Remarks (Accountable Officer)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPPEClasses.map((ppeClass) => (
                    <React.Fragment key={ppeClass}>
                      <tr className="bg-gray-100 font-semibold">
                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300" colSpan="11">
                          {ppeClass}
                        </td>
                      </tr>
                      {rpcpeData[ppeClass].map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">{globalIndex++}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">{asset.ppeClass || ''}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{asset.description || ''}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">{asset.propertyNumber || ''}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">{asset.unitOfMeasure || 'Unit'}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right border border-gray-300">₱{(parseFloat(asset.cost) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right border border-gray-300">{asset.quantity || 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right border border-gray-300">{asset.physicalCountQuantity || asset.quantity || 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right border border-gray-300">
                            {asset.shortageQuantity || ((asset.quantity || 1) - (asset.physicalCountQuantity || asset.quantity || 1))}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right border border-gray-300">
                            ₱{((asset.shortageQuantity || ((asset.quantity || 1) - (asset.physicalCountQuantity || asset.quantity || 1))) * (parseFloat(asset.cost) || 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">{asset.accountableOfficer || asset.status || ''}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'disposal':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Disposal Report</h4>
            <div className="text-gray-500">
              Disposal report will be displayed here.
            </div>
          </div>
        );

      case 'audit':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Audit Trail</h4>
            <div className="text-gray-500">
              Audit trail will be displayed here.
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-gray-500">
              Select a report type to generate.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6" ref={reportsRef}>
      <div className="denr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-denr-green">Reports</h2>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`p-4 border rounded-lg text-left transition-all ${
                reportType === type.id
                  ? 'border-denr-green bg-denr-green text-white'
                  : 'border-gray-300 hover:border-denr-green'
              }`}
            >
              <div className="flex items-center space-x-2">
                <type.icon className="w-5 h-5" />
                <span className="font-medium">{type.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Date Range Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex flex-wrap gap-2">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`px-4 py-2 border rounded-lg transition-all ${
                  dateRange === range.id
                    ? 'border-denr-green bg-denr-green text-white'
                    : 'border-gray-300 hover:border-denr-green'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={downloadReport}
            className="denr-button flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="denr-card" ref={tableRef}>
        {renderReportContent()}
      </div>
    </div>
  );
}

export default Reports;
