import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Edit, Trash2, Search, Filter, Download, Calculator, FileText, Upload, Building, Landmark, Car, Laptop, Server, Phone, Wrench, Home, TreePine, Droplets, Zap, Briefcase, Shield, Package, CheckCircle2, XCircle, Filter as FilterIcon } from 'lucide-react';
import AssetForm from './AssetForm.jsx';
import Modal from './Modal.jsx';
import Toast from './Toast.jsx';
import CustomDropdown from './CustomDropdown.jsx';
import * as XLSX from 'xlsx';

function Properties() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [toast, setToast] = useState(null);
  const tableRef = React.useRef(null);
  const [assets, setAssets] = useState(() => {
    const savedAssets = localStorage.getItem('denr_assets');
    return savedAssets ? JSON.parse(savedAssets) : [];
  });

  // Icon mappings for PPE classes
  const ppeClassIconMap = {
    'all': <FilterIcon className="w-4 h-4" />,
    'Land': <Landmark className="w-4 h-4" />,
    'Land Improvements, Reforestation Projects': <TreePine className="w-4 h-4" />,
    'Other Land Improvements': <Home className="w-4 h-4" />,
    'Water Supply Systems': <Droplets className="w-4 h-4" />,
    'Power Supply Systems': <Zap className="w-4 h-4" />,
    'Buildings': <Building className="w-4 h-4" />,
    'Other Structures': <Home className="w-4 h-4" />,
    'Office Equipment': <Briefcase className="w-4 h-4" />,
    'Information and Communication Technology Equipment': <Laptop className="w-4 h-4" />,
    'Communication Equipment': <Phone className="w-4 h-4" />,
    'Technical and Scientific Equipment': <Server className="w-4 h-4" />,
    'Motor Vehicles': <Car className="w-4 h-4" />,
    'Furniture and Fixtures': <Package className="w-4 h-4" />,
    'Construction in Progress - Land Improvements': <Wrench className="w-4 h-4" />,
    'Construction in Progress - Buildings and Other Structures': <Wrench className="w-4 h-4" />,
    'Disaster Response and Rescue Equipment': <Shield className="w-4 h-4" />
  };

  // Icon mappings for status
  const statusIconMap = {
    'all': <FilterIcon className="w-4 h-4" />,
    'Serviceable': <CheckCircle2 className="w-4 h-4" />,
    'Unserviceable': <XCircle className="w-4 h-4" />
  };

  // Save assets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('denr_assets', JSON.stringify(assets));
  }, [assets]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSelectProperty = (id) => {
    setSelectedProperties(prev => 
      prev.includes(id) ? prev.filter(propId => propId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === paginatedAssets.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(paginatedAssets.map(asset => asset.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedProperties.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProperties.length} properties?`)) {
      setAssets(prev => prev.filter(asset => !selectedProperties.includes(asset.id)));
      setSelectedProperties([]);
      setToast({ message: `${selectedProperties.length} properties deleted successfully`, type: 'success' });
    }
  };

  // ESC key to deselect all (only if no modal is open)
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        const modal = document.querySelector('.fixed.inset-0.z-\\[999999\\]');
        if (!modal) {
          setSelectedProperties([]);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const handleAddAsset = (newAsset) => {
    if (editingAsset) {
      // Update existing asset
      setAssets(prev => prev.map(asset => 
        asset.id === editingAsset.id 
          ? {
              ...asset,
              propertyNumber: newAsset.propertyNumber,
              officePlace: newAsset.office || '',
              propertyDescription: newAsset.officeDescription || '',
              accountableOfficer: newAsset.accountableOfficer || '',
              ppeClass: newAsset.ppeClass,
              accountCode: newAsset.accountCode,
              dateAcquired: newAsset.dateAcquired,
              cost: parseFloat(newAsset.totalCost) || 0,
              residualValue: parseFloat(newAsset.residual) || 0,
              usefulLife: newAsset.usefulLife,
              depreciableAmount: parseFloat(newAsset.depreciationAmount) || 0,
              annualDepreciation: parseFloat(newAsset.annualDepreciation) || 0,
              accumulatedDepreciation: parseFloat(newAsset.accumulatedDepreciation) || 0,
              netBookValue: parseFloat(newAsset.netbookValue) || 0,
              remarks: newAsset.remarks || '',
              status: newAsset.status
            }
          : asset
      ));
      setEditingAsset(null);
    } else {
      // Add new asset
      const assetWithId = {
        id: Date.now().toString(),
        propertyNumber: newAsset.propertyNumber,
        officePlace: newAsset.office || '',
        propertyDescription: newAsset.officeDescription || '',
        accountableOfficer: newAsset.accountableOfficer || '',
        ppeClass: newAsset.ppeClass,
        accountCode: newAsset.accountCode,
        dateAcquired: newAsset.dateAcquired,
        cost: parseFloat(newAsset.totalCost) || 0,
        residualValue: parseFloat(newAsset.residual) || 0,
        usefulLife: newAsset.usefulLife,
        depreciableAmount: parseFloat(newAsset.depreciationAmount) || 0,
        annualDepreciation: parseFloat(newAsset.annualDepreciation) || 0,
        accumulatedDepreciation: parseFloat(newAsset.accumulatedDepreciation) || 0,
        netBookValue: parseFloat(newAsset.netbookValue) || 0,
        remarks: newAsset.remarks || '',
        status: newAsset.status
      };
      setAssets(prev => [...prev, assetWithId]);
    }
    setShowAddForm(false);
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('denrDataChanged'));
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setShowAddForm(true);
  };

  const handleDelete = (asset) => {
    console.log('Delete asset:', asset);
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('denrDataChanged'));
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
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('denrDataChanged'));
  };

  const handleImportFile = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (fileExtension === 'csv' || fileExtension === 'txt') {
          // Handle CSV and TXT files
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            
            const importedAssets = [];
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const asset = {
                  id: Date.now().toString() + i,
                  propertyNumber: values[0] || '',
                  officePlace: values[1] || '',
                  propertyDescription: values[2] || '',
                  accountableOfficer: values[3] || '',
                  ppeClass: values[4] || '',
                  accountCode: values[5] || '',
                  dateAcquired: values[6] || '',
                  cost: parseFloat(values[7]) || 0,
                  residualValue: parseFloat(values[8]) || 0,
                  usefulLife: values[9] || '',
                  depreciableAmount: parseFloat(values[10]) || 0,
                  annualDepreciation: parseFloat(values[11]) || 0,
                  accumulatedDepreciation: parseFloat(values[12]) || 0,
                  netBookValue: parseFloat(values[13]) || 0,
                  remarks: values[14] || '',
                  status: values[15] || 'Serviceable'
                };
                importedAssets.push(asset);
              }
            }
            
            if (importedAssets.length > 0) {
              setAssets(prev => [...prev, ...importedAssets]);
              window.dispatchEvent(new CustomEvent('denrDataChanged'));
              setToast({ message: `Successfully imported ${importedAssets.length} properties from ${file.name}`, type: 'success' });
            } else {
              setToast({ message: 'No valid properties found in the file. Please check the file format.', type: 'error' });
            }
          };
          reader.readAsText(file);
        } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
          // Handle Excel files using xlsx library
          const reader = new FileReader();
          reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // Log first row to debug column names
            if (jsonData.length > 0) {
              console.log('Excel columns:', Object.keys(jsonData[0]));
            }
            
            const importedAssets = jsonData.map((row, index) => {
              // Try to get property number from various possible column names
              const propertyNumber = row['Property No.'] || row['Property Number'] || row['PropertyNumber'] || row['propertyNumber'] || 
                                    row['PROP NO'] || row['Property_No'] || row['PropNumber'] || row['PROP_NO'] ||
                                    row['Property No'] || row['property_no'] || '';
              
              // Get office/place
              const office = row['Office/Place'] || row['OfficePlace'] || row['Office'] || row['officePlace'] || 
                            row['Office Place'] || row['OFFICE'] || '';
              
              // Get date acquired and handle format conversion
              let dateAcquired = row['Date Acquired'] || row['DateAcquired'] || row['Date_Acquired'] || row['dateAcquired'] || row['Date'] || '';
              
              if (dateAcquired) {
                if (typeof dateAcquired === 'number') {
                  // Handle Excel serial date numbers
                  // Excel epoch starts at January 1, 1900 (serial number 1)
                  const excelEpoch = new Date(1900, 0, 1);
                  const date = new Date(excelEpoch.getTime() + (dateAcquired - 2) * 24 * 60 * 60 * 1000);
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  dateAcquired = `${year}/${month}/${day}`;
                } else if (typeof dateAcquired === 'string') {
                  // Convert MM/DD/YYYY to YYYY/MM/DD if needed
                  const dateParts = dateAcquired.split('/');
                  if (dateParts.length === 3) {
                    const [month, day, year] = dateParts;
                    if (year.length === 4) {
                      dateAcquired = `${year}/${month}/${day}`;
                    }
                  }
                } else if (dateAcquired instanceof Date) {
                  // If it's a date object, convert to string
                  const year = dateAcquired.getFullYear();
                  const month = String(dateAcquired.getMonth() + 1).padStart(2, '0');
                  const day = String(dateAcquired.getDate()).padStart(2, '0');
                  dateAcquired = `${year}/${month}/${day}`;
                } else {
                  // Convert to string as fallback
                  dateAcquired = String(dateAcquired);
                }
              }
              
              return {
                id: Date.now().toString() + index,
                propertyNumber: propertyNumber || `AUTO-${Date.now()}-${index}`,
                officePlace: office,
                propertyDescription: row['Property Description'] || row['PropertyDescription'] || row['Description'] || row['propertyDescription'] || row['Property Desc'] || '',
                accountableOfficer: row['Accountable Officer'] || row['AccountableOfficer'] || row['Accountable_Officer'] || row['accountableOfficer'] || row['Accountable Off'] || '',
                ppeClass: row['PPE Class'] || row['PPEClass'] || row['PPE'] || row['ppeClass'] || row['PPE Class'] || row['CLASS'] || '',
                accountCode: row['Account Code'] || row['AccountCode'] || row['Account_Code'] || row['accountCode'] || row['Account Code'] || row['ACCOUNT CODE'] || '',
                dateAcquired: dateAcquired,
                cost: parseFloat(row['Cost'] || row['cost'] || row['COST'] || row['Total Cost'] || row['TOTAL COST'] || 0),
                residualValue: parseFloat(row['Residual Value'] || row['ResidualValue'] || row['Residual_Value'] || row['residualValue'] || row['RESIDUAL VALUE'] || 0),
                usefulLife: row['Useful Life (Years)'] || row['Useful Life'] || row['UsefulLife'] || row['Useful_Life'] || row['usefulLife'] || row['USEFUL LIFE'] || '',
                depreciableAmount: parseFloat(row['Depreciable Amount'] || row['DepreciableAmount'] || row['Depreciable_Amount'] || row['depreciableAmount'] || row['DEPRECIABLE AMOUNT'] || 0),
              annualDepreciation: parseFloat(row['Annual Depreciation'] || row['AnnualDepreciation'] || row['Annual_Depreciation'] || row['annualDepreciation'] || row['ANNUAL DEPRECIATION'] || 0),
              accumulatedDepreciation: parseFloat(row['Accumulated Depreciation'] || row['AccumulatedDepreciation'] || row['Accumulated_Depreciation'] || row['accumulatedDepreciation'] || row['ACCUMULATED DEPRECIATION'] || 0),
              netBookValue: parseFloat(row['Net Book Value'] || row['NetBookValue'] || row['Net_Book_Value'] || row['netBookValue'] || row['NET BOOK VALUE'] || 0),
              remarks: row['REM ARKS'] || row['REMARKS'] || row['Remarks'] || row['remarks'] || row['REMARK'] || '',
              status: row['Status'] || row['status'] || 'Serviceable'
            };
            });
            
            if (importedAssets.length > 0) {
              setAssets(prev => [...prev, ...importedAssets]);
              window.dispatchEvent(new CustomEvent('denrDataChanged'));
              setToast({ message: `Successfully imported ${importedAssets.length} properties from ${file.name}`, type: 'success' });
            } else {
              setToast({ message: 'No valid properties found in the Excel file. Please check the file format.', type: 'error' });
            }
          };
          reader.readAsArrayBuffer(file);
        } else if (fileExtension === 'pdf') {
          // PDF files require additional library (pdf-parse or pdf.js)
          setToast({ message: 'PDF file import requires additional libraries. Please convert the file to CSV format for import.', type: 'warning' });
        } else if (fileExtension === 'doc' || fileExtension === 'docx') {
          // Word files require additional library (mammoth.js)
          setToast({ message: 'Word file import requires additional libraries. Please convert the file to CSV format for import.', type: 'warning' });
        } else {
          setToast({ message: 'Unsupported file format. Please use CSV, TXT, Excel, or convert your file to CSV format.', type: 'error' });
        }
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

  // Pagination logic
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  // Scroll to table when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

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

        {/* Search */}
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
        </div>
      </div>
      
      <div className="mb-8"></div>

      {/* Add Property Modal */}
      <Modal 
        isOpen={showAddForm} 
        onClose={() => {
          setShowAddForm(false);
          setEditingAsset(null);
        }}
        title={editingAsset ? 'Edit Property' : 'Add New Property'}
      >
        <AssetForm 
          isVisible={showAddForm} 
          editingAsset={editingAsset}
          onClose={() => {
            setShowAddForm(false);
            setEditingAsset(null);
          }}
          onAddAsset={handleAddAsset}
        />
      </Modal>

      {/* Properties Table */}
      <div className="denr-card" ref={tableRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-denr-green">Property List</h3>
          <div className="flex gap-2 items-center">
            <CustomDropdown
              value={filterCategory}
              onChange={setFilterCategory}
              options={['all', 'Land', 'Land Improvements, Reforestation Projects', 'Other Land Improvements', 'Water Supply Systems', 'Power Supply Systems', 'Buildings', 'Other Structures', 'Office Equipment', 'Information and Communication Technology Equipment', 'Communication Equipment', 'Technical and Scientific Equipment', 'Motor Vehicles', 'Furniture and Fixtures', 'Construction in Progress - Land Improvements', 'Construction in Progress - Buildings and Other Structures', 'Disaster Response and Rescue Equipment']}
              placeholder="All PPE Classes"
              searchable={false}
              iconMap={ppeClassIconMap}
            />
            <CustomDropdown
              value={filterStatus}
              onChange={setFilterStatus}
              options={['all', 'Serviceable', 'Unserviceable']}
              placeholder="All Status"
              iconMap={statusIconMap}
            />
            {selectedProperties.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-4 border border-red-300/50 dark:border-gray-600 rounded-lg cursor-pointer 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500
                         transition-all duration-200
                         font-medium
                         hover:border-red-500 dark:hover:border-red-400
                         shadow-sm hover:shadow-md min-h-[56px]"
              >
                Delete Selected ({selectedProperties.length})
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-denr-bg">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-10">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === paginatedAssets.length && paginatedAssets.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-denr-green focus:ring-denr-green"
                  />
                </th>
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
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(asset.id)}
                      onChange={() => handleSelectProperty(asset.id)}
                      className="w-4 h-4 rounded border-gray-300 text-denr-green focus:ring-denr-green"
                    />
                  </td>
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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} properties
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg ${currentPage === page ? 'bg-denr-green text-white border-denr-green' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Properties;
