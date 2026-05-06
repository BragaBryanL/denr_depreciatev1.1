import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, Download } from 'lucide-react';

function COAPreviewModal({ asset, transactions, onClose, onDownload }) {
  const scrollPositionRef = React.useRef(0);
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [depreciationView, setDepreciationView] = useState('yearly');
  
  // Load issues-transfers data
  const [issuesTransfers, setIssuesTransfers] = useState(() => {
    const savedIssuesTransfers = localStorage.getItem('denr_issues_transfers');
    return savedIssuesTransfers ? JSON.parse(savedIssuesTransfers) : [];
  });

  // Generate table rows based on depreciation view
  const generateTableRows = () => {
    if (!asset.dateAcquired || !asset.annualDepreciation || !asset.cost) {
      return (
        <tr>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{asset.dateAcquired || ''}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center">1</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.unitCost) || parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        </tr>
      );
    }

    const acquiredDate = new Date(asset.dateAcquired);
    const currentDate = new Date();
    const startYear = acquiredDate.getFullYear();
    const endYear = currentDate.getFullYear();
    const annualDepreciation = parseFloat(asset.annualDepreciation) || 0;
    const totalCost = parseFloat(asset.cost) || 0;
    const usefulLife = parseFloat(asset.usefulLife) || 1;

    const rows = [];

    // Always show initial acquisition row
    rows.push(
      <tr key="acquisition">
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{asset.dateAcquired || ''}</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-center">1</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.unitCost) || parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
      </tr>
    );

    // Generate depreciation rows based on view
    if (depreciationView === 'yearly') {
      // Show all yearly depreciation
      for (let year = startYear; year <= endYear; year++) {
        const yearEnd = new Date(year, 11, 31);
        
        if (yearEnd < acquiredDate) continue;
        
        const timeElapsed = Math.max(0, (yearEnd - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
        const accumulatedDepreciation = Math.min(annualDepreciation * timeElapsed, totalCost * 0.95);
        const netBookValue = totalCost - accumulatedDepreciation;
        
        rows.push(
          <tr key={year}>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{yearEnd.toISOString().split('T')[0]}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{accumulatedDepreciation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{netBookValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          </tr>
        );
      }
    } else if (depreciationView === 'summary') {
      // Show only current accumulated depreciation summary
      const timeElapsed = Math.max(0, (currentDate - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
      const accumulatedDepreciation = Math.min(annualDepreciation * timeElapsed, totalCost * 0.95);
      const netBookValue = totalCost - accumulatedDepreciation;
      
      rows.push(
        <tr key="summary">
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{currentDate.toISOString().split('T')[0]}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{accumulatedDepreciation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{netBookValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
        </tr>
      );
    } else if (depreciationView === 'current-year') {
      // Show only current year depreciation
      const currentYear = currentDate.getFullYear();
      const yearEnd = new Date(currentYear, 11, 31);
      
      if (yearEnd >= acquiredDate) {
        const timeElapsed = Math.max(0, (yearEnd - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
        const accumulatedDepreciation = Math.min(annualDepreciation * timeElapsed, totalCost * 0.95);
        const netBookValue = totalCost - accumulatedDepreciation;
        
        rows.push(
          <tr key="current-year">
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{yearEnd.toISOString().split('T')[0]}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{accumulatedDepreciation.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{netBookValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
            <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
          </tr>
        );
      }
    }
    // acquisition-only shows only the initial acquisition row (already added above)

    return rows;
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && asset) {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [asset, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (asset) {
      // Save scroll position
      scrollPositionRef.current = window.scrollY;
      // Lock scroll on html element
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.documentElement.style.overflow = '';
      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [asset]);

  if (!asset) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-denr-green flex items-center gap-2">
            <FileText className="w-5 h-5" />
            COA Form Preview - {asset.propertyNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
            {/* Header Section */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Appendix 70</h3>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-2">PROPERTY, PLANT AND EQUIPMENT LEDGER CARD</h2>
            </div>

            {/* Entity and Fund Cluster */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Entity Name:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.officePlace || '________________________'}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fund Cluster:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.fundCluster || ''}
                </div>
              </div>
            </div>

            {/* Property Number and Accountable Officer */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Number:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.propertyNumber || ''}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Accountable Officer:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.accountableOfficer || ''}
                </div>
              </div>
            </div>

            {/* Date Acquired and Unit of Measure */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Acquired:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.dateAcquired || ''}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit of Measure:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.unitMeasure || 'Unit'}
                </div>
              </div>
            </div>

            {/* PPE Details */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property, Plant and Equipment:</label>
              <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                {asset.ppeClass || ''}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Object Account Code:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.accountCode || ''}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Useful Life:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.usefulLife || ''}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.propertyDescription || ''}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate of Depreciation:</label>
                <div className="border-b border-gray-300 dark:border-gray-600 py-1 mt-1">
                  {asset.rateOfDepreciation ? `${asset.rateOfDepreciation}%` : asset.cost && asset.annualDepreciation ? `${((parseFloat(asset.annualDepreciation) / parseFloat(asset.cost)) * 100).toFixed(2)}%` : ''}
                </div>
              </div>
            </div>

            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Reference</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300" colSpan="3">Receipt</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Accumulated Depreciation</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Accumulated Impairment Losses</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Issues/Transfers/Adjustments</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">Adjusted Cost</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-xs font-medium text-gray-700 dark:text-gray-300" colSpan="2">Repair History</th>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-600">
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Qty.</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Unit Cost</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Total Cost</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"></th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Nature of Repair</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {generateTableRows()}
                  
                  {/* Issues & Transfers Rows */}
                  {issuesTransfers && issuesTransfers.length > 0 && issuesTransfers.filter(issue => issue.propertyNumber === asset.propertyNumber).map((issue, index) => (
                    <tr key={`issue-${index}`}>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{issue.date || ''}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{issue.accountableUser}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{issue.parNumber}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                    </tr>
                  ))}
                  
                  {/* Repair History Rows */}
                  {transactions && transactions.length > 0 && transactions.map((transaction, index) => (
                    <tr key={`repair-${index}`}>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{transaction.date || ''}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">Repair/Maintenance</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(transaction.amount) || 0).toLocaleString('en-PH')}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm"></td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm">{transaction.natureOfRepair || ''}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 py-2 text-sm text-right">₱{(parseFloat(transaction.amount) || 0).toLocaleString('en-PH')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Depreciation View:</label>
              <select
                value={depreciationView}
                onChange={(e) => setDepreciationView(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-denr-green"
              >
                <option value="yearly">Yearly Depreciation</option>
                <option value="summary">Summary View</option>
                <option value="acquisition-only">Acquisition Only</option>
                <option value="current-year">Current Year Only</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Download as:</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-denr-green"
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="word">Word (.docx)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDownload(selectedFormat, depreciationView)}
              className="px-4 py-2 bg-denr-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default COAPreviewModal;
