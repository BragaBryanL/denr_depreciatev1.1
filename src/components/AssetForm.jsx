import React, { useState, useEffect } from 'react';
import { Save, X, Calculator, FileText, Building, Landmark, Car, Laptop, Server, Phone, Wrench, Home, TreePine, Droplets, Zap, Briefcase, Shield, Package, CheckCircle2, XCircle } from 'lucide-react';
import CustomDropdown from './CustomDropdown.jsx';

const offices = [
  'PENRO',
  'INITAO',
  'GINGOOG',
  'BALATUKAN',
  'MIMBILISAN',
  'ILPLS',
  'INREMP'
];

const ppeClasses = [
  { name: 'Land', usefulLife: 'Indefinite', accountCode: '10601010' },
  { name: 'Land Improvements, Reforestation Projects', usefulLife: 'Indefinite', accountCode: '10602020' },
  { name: 'Other Land Improvements', usefulLife: 20, accountCode: '10602990' },
  { name: 'Water Supply Systems', usefulLife: 15, accountCode: '10603040' },
  { name: 'Power Supply Systems', usefulLife: 20, accountCode: '10603050' },
  { name: 'Buildings', usefulLife: 30, accountCode: '10604010' },
  { name: 'Other Structures', usefulLife: 20, accountCode: '10604990' },
  { name: 'Office Equipment', usefulLife: 5, accountCode: '10605020' },
  { name: 'Information and Communication Technology Equipment', usefulLife: 5, accountCode: '10605030' },
  { name: 'Communication Equipment', usefulLife: 5, accountCode: '10605070' },
  { name: 'Technical and Scientific Equipment', usefulLife: 7, accountCode: '10605140' },
  { name: 'Motor Vehicles', usefulLife: 7, accountCode: '10606010' },
  { name: 'Furniture and Fixtures', usefulLife: 10, accountCode: '10607010' },
  { name: 'Construction in Progress - Land Improvements', usefulLife: 'Indefinite', accountCode: '10699010' },
  { name: 'Construction in Progress - Buildings and Other Structures', usefulLife: 'Indefinite', accountCode: '10699030' },
  { name: 'Disaster Response and Rescue Equipment', usefulLife: 5, accountCode: '10605090' }
];

const fundClusters = [
  'Regular Agency Fund',
  'Foreign Assisted Projects Fund',
  'Special Account - Locally Funded/Domestic Grants Fund',
  'Special Account - Foreign Assisted/Foreign Grants Fund',
  'Internally Generated Funds',
  'Business Related Funds',
  'Trust Receipts',
];

function AssetForm({ isVisible, onClose, onAddAsset, editingAsset }) {
  const [formData, setFormData] = useState({
    propertyNumber: '',
    dateAcquired: '',
    officeDescription: '',
    accountableOfficer: '',
    ppeClass: '',
    accountCode: '',
    usefulLife: '',
    office: '',
    fundCluster: '',
    status: 'Serviceable',
    unitCost: '',
    quantity: '',
    remarks: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (editingAsset) {
      // Convert date format from YYYY/MM/DD to YYYY-MM-DD for HTML date input
      let formattedDate = editingAsset.dateAcquired || '';
      if (formattedDate && typeof formattedDate === 'string') {
        formattedDate = formattedDate.replace(/\//g, '-');
      }
      
      setFormData({
        propertyNumber: editingAsset.propertyNumber || '',
        dateAcquired: formattedDate,
        officeDescription: editingAsset.propertyDescription || '',
        accountableOfficer: editingAsset.accountableOfficer || '',
        ppeClass: editingAsset.ppeClass || '',
        accountCode: editingAsset.accountCode || '',
        usefulLife: editingAsset.usefulLife || '',
        office: editingAsset.officePlace || '',
        fundCluster: '',
        status: editingAsset.status || 'Serviceable',
        unitCost: editingAsset.cost ? (editingAsset.cost / (editingAsset.quantity || 1)).toString() : '',
        quantity: editingAsset.quantity || '1',
        remarks: editingAsset.remarks || '',
      });
    } else {
      handleReset();
    }
  }, [editingAsset]);

  const [calculatedValues, setCalculatedValues] = useState({
    totalCost: '',
    residual: '',
    depreciationAmount: '',
    annualDepreciation: '',
    rateOfDepreciation: '',
    accumulatedDepreciation: '',
    netbookValue: '',
  });

  // Icon mappings for PPE classes
  const ppeClassIconMap = {
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
    'Serviceable': <CheckCircle2 className="w-4 h-4" />,
    'Unserviceable': <XCircle className="w-4 h-4" />
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-format property number with dashes
    if (name === 'propertyNumber') {
      let formattedValue = value.replace(/[^a-zA-Z0-9]/g, ''); // Remove all non-alphanumeric chars
      
      // Auto-insert dashes at positions 4, 7, 10, 15 (format: XXXX-XX-XX-XXXX-XXX = 18 chars total)
      if (formattedValue.length > 4) {
        formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
      }
      if (formattedValue.length > 7) {
        formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
      }
      if (formattedValue.length > 10) {
        formattedValue = formattedValue.slice(0, 10) + '-' + formattedValue.slice(10);
      }
      if (formattedValue.length > 15) {
        formattedValue = formattedValue.slice(0, 15) + '-' + formattedValue.slice(15);
      }
      
      // Limit to max length (18 chars: XXXX-XX-XX-XXXX-XXX)
      formattedValue = formattedValue.slice(0, 18);
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Auto-fill based on PPE Class selection
    if (name === 'ppeClass') {
      const selectedClass = ppeClasses.find(ppe => ppe.name === value);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          accountCode: selectedClass.accountCode,
          usefulLife: selectedClass.usefulLife
        }));
      }
    }

    // Calculate values when unit cost or quantity changes
    if (name === 'unitCost' || name === 'quantity') {
      const unitCost = parseFloat(formData.unitCost) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      const newUnitCost = name === 'unitCost' ? parseFloat(value) || 0 : unitCost;
      const newQuantity = name === 'quantity' ? parseFloat(value) || 0 : quantity;
      
      if (newUnitCost && newQuantity) {
        calculateDepreciation(newUnitCost, newQuantity, formData.usefulLife);
      }
    }

    // Recalculate when useful life changes
    if (name === 'usefulLife') {
      const unitCost = parseFloat(formData.unitCost) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      if (unitCost && quantity && value) {
        calculateDepreciation(unitCost, quantity, value);
      }
    }
  };

  const calculateDepreciation = (unitCost, quantity, usefulLife) => {
    const totalCost = unitCost * quantity;
    const residualRate = 0.05; // 5% residual value
    const residualValue = totalCost * residualRate;
    const depreciationAmount = totalCost - residualValue;
    const usefulLifeYears = parseFloat(usefulLife);
    
    let annualDepreciation = 0;
    let accumulatedDepreciation = 0;
    let netBookValue = totalCost;
    let rateOfDepreciation = 0;
    
    if (usefulLifeYears > 0 && usefulLife !== 'Indefinite') {
      annualDepreciation = depreciationAmount / usefulLifeYears;
      
      // Calculate rate of depreciation (as percentage)
      rateOfDepreciation = usefulLifeYears > 0 ? (annualDepreciation / totalCost) * 100 : 0;
      
      // Calculate accumulated depreciation based on date acquired
      if (formData.dateAcquired) {
        const acquiredDate = new Date(formData.dateAcquired);
        const currentDate = new Date();
        const yearsElapsed = Math.max(0, (currentDate - acquiredDate) / (365.25 * 24 * 60 * 60 * 1000));
        accumulatedDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciationAmount);
        netBookValue = totalCost - accumulatedDepreciation;
      }
    }

    setCalculatedValues({
      totalCost: totalCost.toFixed(2),
      residual: residualValue.toFixed(2),
      depreciationAmount: depreciationAmount.toFixed(2),
      annualDepreciation: annualDepreciation.toFixed(2),
      rateOfDepreciation: rateOfDepreciation.toFixed(2),
      accumulatedDepreciation: accumulatedDepreciation.toFixed(2),
      netbookValue: netBookValue.toFixed(2),
    });
  };

  useEffect(() => {
    const unitCost = parseFloat(formData.unitCost) || 0;
    const quantity = parseFloat(formData.quantity) || 0;
    if (unitCost && quantity) {
      calculateDepreciation(unitCost, quantity, formData.usefulLife);
    }
  }, [formData.dateAcquired]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const assetData = {
      ...formData,
      ...calculatedValues,
      unitCost: parseFloat(formData.unitCost),
      quantity: parseInt(formData.quantity),
    };

    onAddAsset(assetData);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      propertyNumber: '',
      dateAcquired: '',
      officeDescription: '',
      accountableOfficer: '',
      ppeClass: '',
      accountCode: '',
      usefulLife: '',
      office: '',
      fundCluster: '',
      status: 'Serviceable',
      unitCost: '',
      quantity: '',
      remarks: '',
    });
    setCalculatedValues({
      totalCost: '',
      residual: '',
      depreciationAmount: '',
      annualDepreciation: '',
      rateOfDepreciation: '',
      accumulatedDepreciation: '',
      netbookValue: '',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Number</label>
            <input
              type="text"
              name="propertyNumber"
              value={formData.propertyNumber}
              onChange={handleInputChange}
              placeholder="0000-00-00-0000-000"
              className="denr-input w-full"
              maxLength="18"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Dashes auto-inserted. Letters and numbers allowed. (18 chars total)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Acquired</label>
            <input
              type="date"
              name="dateAcquired"
              value={formData.dateAcquired}
              onChange={handleInputChange}
              className="denr-input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Description</label>
            <input
              type="text"
              name="officeDescription"
              value={formData.officeDescription}
              onChange={handleInputChange}
              className="denr-input w-full"
              placeholder="Enter property description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accountable Officer/End-user</label>
            <input
              type="text"
              name="accountableOfficer"
              value={formData.accountableOfficer}
              onChange={handleInputChange}
              className="denr-input w-full"
              placeholder="Enter name of accountable officer"
              required
            />
          </div>

          <div>
            <CustomDropdown
              value={formData.ppeClass}
              onChange={(value) => handleInputChange({ target: { name: 'ppeClass', value } })}
              options={ppeClasses.map(ppe => ppe.name)}
              placeholder="Select PPE Class"
              label="PPE Class"
              searchable={true}
              iconMap={ppeClassIconMap}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
            <input
              type="text"
              name="accountCode"
              value={formData.accountCode}
              onChange={handleInputChange}
              className="denr-input w-full"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years)</label>
            <input
              type="text"
              name="usefulLife"
              value={formData.usefulLife}
              onChange={handleInputChange}
              className="denr-input w-full"
              readOnly
            />
          </div>

          <div>
            <CustomDropdown
              value={formData.office}
              onChange={(value) => handleInputChange({ target: { name: 'office', value } })}
              options={offices}
              placeholder="Select Office"
              label="Office"
            />
          </div>

          <div>
            <CustomDropdown
              value={formData.fundCluster}
              onChange={(value) => handleInputChange({ target: { name: 'fundCluster', value } })}
              options={fundClusters}
              placeholder="Select Fund Cluster"
              label="Fund Cluster"
            />
          </div>

          <div>
            <CustomDropdown
              value={formData.status}
              onChange={(value) => handleInputChange({ target: { name: 'status', value } })}
              options={['Serviceable', 'Unserviceable']}
              placeholder="Select Status"
              label="Status"
              iconMap={statusIconMap}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
            <input
              type="number"
              name="unitCost"
              value={formData.unitCost}
              onChange={handleInputChange}
              className="denr-input w-full"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="denr-input w-full"
              min="1"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="denr-input w-full"
              rows="2"
              placeholder="Enter any additional information"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="denr-button-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            type="submit"
            className="denr-button flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Property</span>
          </button>
        </div>
      </form>

      {/* Automatic Calculation Results */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-base font-semibold text-denr-green mb-3 flex items-center">
          <Calculator className="w-4 h-4 mr-2" />
          Automatic Calculation Results
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Total Cost</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.totalCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Residual Value</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.residual || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Depreciable Amount</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.depreciationAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Annual Depreciation</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.annualDepreciation || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Rate of Depreciation</span>
            <span className="font-semibold text-denr-green">
              {parseFloat(calculatedValues.rateOfDepreciation || 0).toFixed(2)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Accumulated Depreciation</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.accumulatedDepreciation || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-gray-700">Net Book Value</span>
            <span className="font-semibold text-denr-green">
              ₱ {parseFloat(calculatedValues.netbookValue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Depreciation Schedule Preview */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="text-base font-semibold text-denr-green mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Depreciation Schedule Preview
        </h3>
        <div className="bg-white p-3 rounded border">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Method:</strong> Straight Line Depreciation
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Date Acquired:</strong> {formData.dateAcquired || 'Not specified'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Useful Life:</strong> {formData.usefulLife ? `${formData.usefulLife} years` : 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AssetForm;
