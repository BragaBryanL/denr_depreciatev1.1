import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

function Reports() {
  const [reportType, setReportType] = useState('depreciation');
  const [dateRange, setDateRange] = useState('current-year');
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

  const generateReport = () => {
    console.log(`Generating ${reportType} report for ${dateRange}`);
    // Implementation for report generation
  };

  const downloadReport = () => {
    console.log(`Downloading ${reportType} report`);
    // Implementation for report download
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'depreciation':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Depreciation Schedule</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-denr-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PPE Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Office
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Acquired
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Useful Life
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Annual Depreciation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accumulated Depreciation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Book Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.propertyNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.ppeClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.officePlace}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.dateAcquired}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{asset.usefulLife}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(asset.annualDepreciation || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(asset.accumulatedDepreciation || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{parseFloat(asset.netBookValue || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        No assets found. Add properties to generate reports.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-2">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, assets.length)} of {assets.length} assets
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {(() => {
                    const maxVisiblePages = 4;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    const pages = [];
                    if (startPage > 1) {
                      pages.push(1);
                      if (startPage > 2) {
                        pages.push('...');
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push('...');
                      }
                      pages.push(totalPages);
                    }
                    
                    return pages.map((page, index) => {
                      if (page === '...') {
                        return <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg ${currentPage === page ? 'bg-denr-green text-white border-denr-green' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'asset-summary':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-denr-green mb-4">Asset Summary Report</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="denr-card">
                <h5 className="text-md font-semibold mb-3">Total Assets by Category</h5>
                <div className="space-y-2">
                  {assets.reduce((acc, asset) => {
                    const existing = acc.find(item => item.name === asset.ppeClass);
                    if (existing) {
                      existing.value += asset.cost || 0;
                    } else {
                      acc.push({ name: asset.ppeClass, value: asset.cost || 0 });
                    }
                    return acc;
                  }, []).map((category) => (
                    <div key={category.name} className="flex justify-between">
                      <span>{category.name}:</span>
                      <span className="font-semibold">₱{category.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="text-sm text-gray-500">No assets found</div>
                  )}
                </div>
              </div>
              <div className="denr-card">
                <h5 className="text-md font-semibold mb-3">Depreciation Summary</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-semibold">₱{assets.reduce((sum, asset) => sum + (asset.cost || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Depreciation:</span>
                    <span className="font-semibold text-red-600">₱{assets.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Book Value:</span>
                    <span className="font-semibold text-denr-green">₱{assets.reduce((sum, asset) => sum + (asset.netBookValue || 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a report type to view details</p>
          </div>
        );
    }
  };

  return (
    <div ref={reportsRef} className="space-y-6">
      <div className="denr-card">
        <h3 className="text-lg font-semibold text-denr-green mb-4">Report Generator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={reportType === type.id}
                    onChange={(e) => setReportType(e.target.value)}
                    className="text-denr-green focus:ring-denr-green"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              {dateRanges.map((range) => (
                <label key={range.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    value={range.id}
                    checked={dateRange === range.id}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-denr-green focus:ring-denr-green"
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={generateReport}
            className="denr-button flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={downloadReport}
            className="denr-button-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="denr-card" ref={tableRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-denr-green">Report Preview</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{dateRanges.find(r => r.id === dateRange)?.label}</span>
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
}

export default Reports;
