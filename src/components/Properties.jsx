import React, { useState } from 'react';
import { Plus, Save, X, Edit, Trash2, Search, Filter, Download, Calculator, FileText, Upload } from 'lucide-react';
import AssetForm from './AssetForm.jsx';
import Modal from './Modal.jsx';

function Properties() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [assets, setAssets] = useState([
    {
      id: '1',
      propertyNumber: 'IM-P177-2005-90-50',
      officePlace: 'PENRO',
      propertyDescription: 'Main office building with administrative facilities',
      accountableOfficer: 'Juan Dela Cruz',
      ppeClass: 'Buildings',
      accountCode: '10604010',
      dateAcquired: '2015/02/02',
      cost: 545000,
      residualValue: 27250,
      usefulLife: '20',
      depreciableAmount: 517750,
      annualDepreciation: 25887.5,
      accumulatedDepreciation: 192651.07,
      netBookValue: 352348.93,
      remarks: 'Primary administrative office',
      status: 'Serviceable'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddAsset = (newAsset) => {
    const assetWithId = {
      ...newAsset,
      id: Date.now().toString(),
      accountableOfficer: newAsset.accountableOfficer || ''
    };
    setAssets(prev => [...prev, assetWithId]);
    setShowAddForm(false);
  };

  const handleEdit = (asset) => {
    console.log('Edit asset:', asset);
    // TODO: Implement edit functionality
  };

  const handleDelete = (asset) => {
    console.log('Delete asset:', asset);
    setAssets(prev => prev.filter(a => a.id !== asset.id));
  };

  const handleGenerateCOA = (asset) => {
    console.log('Generate COA Form for:', asset);
    // TODO: Implement COA form generation
  };

  const handleToggleStatus = (asset) => {
    const newStatus = asset.status === 'Serviceable' ? 'Unserviceable' : 'Serviceable';
    setAssets(prev => prev.map(a => 
      a.id === asset.id ? { ...a, status: newStatus } : a
    ));
  };

  const handleImportFile = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Import file selected:', file.name);
        // TODO: Implement file import logic
        alert(`File "${file.name}" selected for import. Import functionality will be implemented.`);
      }
    };
    input.click();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.ppeClass.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || asset.ppeClass === filterCategory;
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalAssetsValue = filteredAssets.reduce((sum, asset) => sum + (parseFloat(asset.cost) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="denr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-denr-green">Properties</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleImportFile}
              className="denr-button-secondary flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Import File</span>
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="denr-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Close Form' : 'Add Property'}</span>
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="denr-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-denr-green">{filteredAssets.length}</p>
              </div>
              <div className="p-3 bg-denr-light rounded-full">
                <FileText className="w-6 h-6 text-denr-green" />
              </div>
            </div>
          </div>
          <div className="denr-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-denr-green">₱ {totalAssetsValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-denr-light rounded-full">
                <Calculator className="w-6 h-6 text-denr-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="denr-input w-full pl-10"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="denr-input">
            <option value="all">All Categories</option>
            <option value="Buildings">Buildings</option>
            <option value="Land">Land</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="denr-input">
            <option value="all">All Status</option>
            <option value="Serviceable">Serviceable</option>
            <option value="Unserviceable">Unserviceable</option>
          </select>
        </div>
      </div>

      {/* Add Property Modal */}
      <Modal 
        isOpen={showAddForm} 
        onClose={() => setShowAddForm(false)}
        title="Add New Property"
      >
        <AssetForm 
          isVisible={showAddForm} 
          onClose={() => setShowAddForm(false)}
          onAddAsset={handleAddAsset}
        />
      </Modal>

      {/* Properties Table */}
      <div className="denr-card">
        <h3 className="text-lg font-semibold text-denr-green mb-4">Property List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-denr-bg">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Property Number</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Office/Place</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Property Description</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Accountable Officer</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">PPE Class</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Account Code</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date Acquired</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cost</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Residual Value</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Useful Life (Years)</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Depreciable Amount</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Annual Depreciation</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Accumulated Depreciation</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Net Book Value</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">REMARKS</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.propertyNumber}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.officePlace}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.propertyDescription}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.accountableOfficer}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.ppeClass}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.accountCode}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.dateAcquired}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.cost) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.residualValue) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.usefulLife || 'N/A'}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.depreciableAmount) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.annualDepreciation) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.accumulatedDepreciation) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">₱ {(parseFloat(asset.netBookValue) || 0).toLocaleString('en-PH')}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs">
                    <span className={`px-1 inline-flex text-xs leading-3 font-semibold rounded-full ${
                      asset.status === 'Serviceable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>{asset.status}</span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">{asset.remarks}</td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEdit(asset)}
                        className="text-blue-600 hover:text-blue-900 p-1" 
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDelete(asset)}
                        className="text-red-600 hover:text-red-900 p-1" 
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleGenerateCOA(asset)}
                        className="text-green-600 hover:text-green-900 p-1" 
                        title="Generate COA Form"
                      >
                        <FileText className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(asset)}
                        className={`p-1 ${asset.status === 'Serviceable' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                        title="Toggle Status"
                      >
                        <Filter className="w-3 h-3" />
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
  );
}

export default Properties;
