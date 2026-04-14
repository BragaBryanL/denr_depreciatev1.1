import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

function Reports() {
  const [reportType, setReportType] = useState('depreciation');
  const [dateRange, setDateRange] = useState('current-year');

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
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-98-03-0001-01</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Buildings</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PENRO</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2020/09/14</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">30 years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱41,166.67</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱978,688.49</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱321,311.51</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                  <div className="flex justify-between">
                    <span>Land:</span>
                    <span className="font-semibold">₱2,500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buildings:</span>
                    <span className="font-semibold">₱1,800,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment:</span>
                    <span className="font-semibold">₱1,200,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicles:</span>
                    <span className="font-semibold">₱800,000</span>
                  </div>
                </div>
              </div>
              <div className="denr-card">
                <h5 className="text-md font-semibold mb-3">Depreciation Summary</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Depreciation (YTD):</span>
                    <span className="font-semibold text-red-600">₱1,418,688</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Book Value:</span>
                    <span className="font-semibold text-denr-green">₱5,581,312</span>
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
    <div className="space-y-6">
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

      <div className="denr-card">
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
