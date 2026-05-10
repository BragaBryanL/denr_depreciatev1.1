import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Edit, Trash2, ToggleLeft, FileText, Package } from 'lucide-react';

function AssetList() {
  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data
  useEffect(() => {
    const sampleAssets = [
      {
        id: 1,
        propertyNumber: '2024-98-03-0001-01',
        ppeClass: 'Buildings',
        office: 'PENRO',
        status: 'Serviceable',
        totalCost: 1300000,
        accumulatedDepreciation: 978688.49,
        netbookValue: 321311.51,
        dateAcquired: '2020/09/14',
        usefulLife: 30,
        depreciationAmount: 1235000,
        annualDepreciation: 41166.67
      },
      {
        id: 2,
        propertyNumber: 'CI-SPHV-2025-08-03',
        ppeClass: 'Machinery and Equipment',
        office: 'INITAO',
        status: 'Serviceable',
        totalCost: 850000,
        accumulatedDepreciation: 245000,
        netbookValue: 605000,
        dateAcquired: '2021/03/15',
        usefulLife: 10,
        depreciationAmount: 807500,
        annualDepreciation: 80750
      },
      {
        id: 3,
        propertyNumber: '2023-05-0002-02',
        ppeClass: 'Motor Vehicles',
        office: 'GINGOOG',
        status: 'Unserviceable',
        totalCost: 650000,
        accumulatedDepreciation: 195000,
        netbookValue: 455000,
        dateAcquired: '2023/01/20',
        usefulLife: 5,
        depreciationAmount: 617500,
        annualDepreciation: 123500
      }
    ];
    setAssets(sampleAssets);
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.ppeClass.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.office.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || asset.ppeClass === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (asset) => {
    console.log('Edit asset:', asset);
  };

  const handleDelete = (asset) => {
    console.log('Delete asset:', asset);
  };

  const handleStatusToggle = (asset) => {
    const newStatus = asset.status === 'Serviceable' ? 'Unserviceable' : 'Serviceable';
    setAssets(assets.map(a => a.id === asset.id ? { ...a, status: newStatus } : a));
  };

  const generateCOAForm = (asset) => {
    console.log('Generate COA Form for:', asset);
  };

  const handleAddAsset = (newAsset) => {
    const assetWithId = {
      ...newAsset,
      id: Date.now().toString(),
      propertyNumber: newAsset.propertyNumber,
      dateAcquired: newAsset.dateAcquired,
      officeDescription: newAsset.officeDescription || '',
      accountableOfficer: newAsset.accountableOfficer || '',
      ppeClass: newAsset.ppeClass,
      accountCode: newAsset.accountCode || '',
      usefulLife: newAsset.usefulLife || '',
      status: newAsset.status || 'Serviceable',
      unitCost: newAsset.unitCost || 0,
      totalCost: newAsset.totalCost || 0,
      residual: (newAsset.totalCost || 0) * 0.05,
      depreciationAmount: (newAsset.totalCost || 0) - ((newAsset.totalCost || 0) * 0.05),
      annualDepreciation: newAsset.annualDepreciation || 0,
      accumulatedDepreciation: newAsset.accumulatedDepreciation || 0,
      netbookValue: newAsset.netbookValue || 0,
      remarks: newAsset.remarks || ''
    };
    
    setAssets(prev => [...prev, assetWithId]);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Property Number', 'Date Acquired', 'Office Description', 'Accountable Officer/End-user', 'PPE Class', 'Account Code', 'Useful Life (yrs)', 'Status', 'Unit Cost', 'Total Cost', 'Residual', 'Depreciate Amount', 'Annual Depreciate', 'Accumulated Depreciate', 'Net Book', 'Remarks'],
      ...filteredAssets.map(asset => [
        asset.propertyNumber,
        asset.dateAcquired,
        asset.officeDescription || 'N/A',
        asset.accountableOfficer || 'N/A',
        asset.ppeClass,
        asset.accountCode || 'N/A',
        asset.usefulLife ? `${asset.usefulLife} years` : 'N/A',
        asset.status,
        asset.unitCost || 0,
        asset.totalCost,
        asset.residual || 0,
        asset.depreciationAmount || 0,
        asset.annualDepreciation || 0,
        asset.accumulatedDepreciation || 0,
        asset.netbookValue || 0,
        asset.remarks || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const categories = ['all', ...new Set(assets.map(asset => asset.ppeClass))];
  const statuses = ['all', 'Serviceable', 'Unserviceable'];

  const totalAssetsValue = filteredAssets.reduce((sum, asset) => sum + asset.totalCost, 0);
  const totalDepreciationValue = filteredAssets.reduce((sum, asset) => sum + asset.accumulatedDepreciation, 0);
  const totalNetbookValue = filteredAssets.reduce((sum, asset) => sum + asset.netbookValue, 0);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="denr-card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="denr-input w-full pl-10"
              />
            </div>
          </div>
          
          <button
            onClick={() => {
              const newAsset = {
                propertyNumber: '',
                dateAcquired: '',
                officeDescription: '',
                ppeClass: '',
                accountCode: '',
                usefulLife: '',
                status: 'Serviceable',
                unitCost: '',
                totalCost: 0,
                residual: 0,
                depreciationAmount: 0,
                annualDepreciation: 0,
                accumulatedDepreciation: 0,
                netbookValue: 0,
                remarks: ''
              };
              handleAddAsset(newAsset);
            }}
            className="denr-button flex items-center space-x-2"
          >
            <span className="text-white">+ Add Property</span>
          </button>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="denr-input"
          >
            <option value="all">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="denr-input"
          >
            <option value="all">All Status</option>
            {statuses.map((status, index) => (
              <option key={index} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            className="denr-button flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assets Value</p>
              <p className="text-2xl font-bold text-denr-green">
                ₱{totalAssetsValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-denr-light rounded-full">
              <Package className="w-6 h-6 text-denr-green" />
            </div>
          </div>
        </div>

        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Depreciation</p>
              <p className="text-2xl font-bold text-red-600">
                ₱{totalDepreciationValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Filter className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Book Value</p>
              <p className="text-2xl font-bold text-denr-green">
                ₱{totalNetbookValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-denr-light rounded-full">
              <Package className="w-6 h-6 text-denr-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="denr-card">
        <h3 className="text-lg font-semibold text-denr-green mb-4">Property List</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[1500px]">
            <table className="w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-denr-bg">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Property Number
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date Acquired
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Office Description
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Accountable Officer/End-user
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    PPE CLASS
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Account Code
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Useful Life (yrs)
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Unit Cost
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total Cost
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Residual
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Depreciate Amount
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Annual Depreciate
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Accumulated Depreciate
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Net Book
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Remarks
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.propertyNumber}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.dateAcquired}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.officeDescription || 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.accountableOfficer || 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.ppeClass}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.accountCode || 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.usefulLife ? `${asset.usefulLife} years` : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs">
                      <span className={`px-1 inline-flex text-xs leading-3 font-semibold rounded-full ${
                        asset.status === 'Serviceable'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.unitCost ? asset.unitCost.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.totalCost.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.residual ? asset.residual.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.depreciationAmount ? asset.depreciationAmount.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.annualDepreciation ? asset.annualDepreciation.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.accumulatedDepreciation ? asset.accumulatedDepreciation.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      ₱{asset.netbookValue ? asset.netbookValue.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      {asset.remarks || 'N/A'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-denr-green hover:text-denr-dark"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(asset)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Toggle Status"
                        >
                          <ToggleLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => generateCOAForm(asset)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Generate COA Form"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetList;
