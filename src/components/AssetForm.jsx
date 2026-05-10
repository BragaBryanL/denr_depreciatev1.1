import React, { useState, useEffect } from 'react';
import { Save, X, Calculator, FileText, Building, Landmark, Car, Laptop, Server, Phone, Wrench, Home, TreePine, Droplets, Zap, Briefcase, Shield, Package, CheckCircle2, XCircle, Package as PackageIcon, User, Calendar, DollarSign, FileText as FileIcon, Hash, Database, CreditCard, Tag } from 'lucide-react';

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
  { name: 'Land', usefulLife: 'Indefinite', accountCode: '10601010', unitOfMeasure: 'SQM' },
  { name: 'Land Improvements, Reforestation Projects', usefulLife: 'Indefinite', accountCode: '10602020', unitOfMeasure: 'SQM' },
  { name: 'Other Land Improvements', usefulLife: 20, accountCode: '10602990', unitOfMeasure: 'SQM' },
  { name: 'Water Supply Systems', usefulLife: 15, accountCode: '10603040', unitOfMeasure: 'Set' },
  { name: 'Power Supply Systems', usefulLife: 20, accountCode: '10603050', unitOfMeasure: 'Set' },
  { name: 'Buildings', usefulLife: 30, accountCode: '10604010', unitOfMeasure: 'SQM' },
  { name: 'Other Structures', usefulLife: 20, accountCode: '10604990', unitOfMeasure: 'SQM' },
  { name: 'Office Equipment', usefulLife: 5, accountCode: '10605020', unitOfMeasure: 'pcs' },
  { name: 'Information and Communication Technology Equipment', usefulLife: 5, accountCode: '10605030', unitOfMeasure: 'pcs' },
  { name: 'Communication Equipment', usefulLife: 5, accountCode: '10605070', unitOfMeasure: 'pcs' },
  { name: 'Technical and Scientific Equipment', usefulLife: 7, accountCode: '10605140', unitOfMeasure: 'Set' },
  { name: 'Motor Vehicles', usefulLife: 7, accountCode: '10606010', unitOfMeasure: 'Unit' },
  { name: 'Furniture and Fixtures', usefulLife: 10, accountCode: '10607010', unitOfMeasure: 'Set' },
  { name: 'Construction in Progress - Land Improvements', usefulLife: 'Indefinite', accountCode: '10699010', unitOfMeasure: 'HAS' },
  { name: 'Construction in Progress - Buildings and Other Structures', usefulLife: 'Indefinite', accountCode: '10699030', unitOfMeasure: 'HAS' },
  { name: 'Disaster Response and Rescue Equipment', usefulLife: 5, accountCode: '10605090', unitOfMeasure: 'Set' }
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.propertyNumber.trim()) {
      newErrors.propertyNumber = 'Property number is required';
    }
    
    if (!formData.dateAcquired) {
      newErrors.dateAcquired = 'Date acquired is required';
    }
    
    if (!formData.officeDescription.trim()) {
      newErrors.officeDescription = 'Property description is required';
    }
    
    if (!formData.accountableOfficer.trim()) {
      newErrors.accountableOfficer = 'Accountable officer is required';
    }
    
    if (!formData.ppeClass) {
      newErrors.ppeClass = 'PPE class is required';
    }
    
    if (!formData.office) {
      newErrors.office = 'Office is required';
    }
    
    if (!formData.fundCluster) {
      newErrors.fundCluster = 'Fund cluster is required';
    }
    
    if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
      newErrors.unitCost = 'Valid unit cost is required';
    }
    
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Valid quantity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    unitOfMeasure: '',
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
        fundCluster: editingAsset.fundCluster || '',
        status: editingAsset.status || 'Serviceable',
        unitCost: editingAsset.cost ? (editingAsset.cost / (editingAsset.quantity || 1)).toString() : '',
        quantity: editingAsset.quantity || '1',
        remarks: editingAsset.remarks || '',
        unitOfMeasure: editingAsset.unitOfMeasure || '',
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
      setErrors(prev => ({ ...prev, propertyNumber: '' }));
    } else if (name === 'dateAcquired' || name === 'officeDescription' || name === 'accountableOfficer' || name === 'office' || name === 'fundCluster' || name === 'status') {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
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
          usefulLife: selectedClass.usefulLife,
          unitOfMeasure: selectedClass.unitOfMeasure || 'Unit'
        }));
      }
    }

    // Calculate values when unit cost or quantity changes
    if (name === 'unitCost' || name === 'quantity') {
      const unitCost = parseFloat(formData.unitCost) || 0;
      const quantity = parseFloat(formData.quantity) || 0;
      const newUnitCost = name === 'unitCost' ? parseFloat(value) || 0 : unitCost;
      const newQuantity = name === 'quantity' ? parseFloat(value) || 0 : quantity;
      
      setErrors(prev => ({ ...prev, [name]: '' }));
      
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const assetData = {
        ...formData,
        ...calculatedValues,
        unitCost: parseFloat(formData.unitCost) || 0,
        quantity: parseInt(formData.quantity) || 0,
        createdAt: editingAsset ? editingAsset.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onAddAsset(assetData);
      handleReset();
      setIsSubmitting(false);
      setErrors({});
    }, 500);
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
      unitOfMeasure: '',
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
    setErrors({});
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-denr-green" />
              Property Number
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="propertyNumber"
                value={formData.propertyNumber}
                onChange={handleInputChange}
                placeholder="0000-00-00-0000-000"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all font-mono ${
                  errors.propertyNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                maxLength="18"
              />
              <PackageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Dashes auto-inserted. Letters and numbers allowed. (18 chars total)</p>
            {errors.propertyNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.propertyNumber}</p>
            )}
          </div>

          {/* Date Acquired */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-denr-green" />
              Date Acquired
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateAcquired"
                value={formData.dateAcquired}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.dateAcquired ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.dateAcquired && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateAcquired}</p>
            )}
          </div>

          {/* Property Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-denr-green" />
              Property Description
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="officeDescription"
                value={formData.officeDescription}
                onChange={handleInputChange}
                placeholder="Enter property description"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.officeDescription ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <FileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.officeDescription && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.officeDescription}</p>
            )}
          </div>

          {/* Accountable Officer/End-user */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-denr-green" />
              Accountable Officer/End-user
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="accountableOfficer"
                value={formData.accountableOfficer}
                onChange={handleInputChange}
                placeholder="Enter name of accountable officer"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.accountableOfficer ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.accountableOfficer && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.accountableOfficer}</p>
            )}
          </div>

          {/* PPE Class */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-denr-green" />
              PPE Class
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="ppeClass"
                value={formData.ppeClass}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all appearance-none ${
                  errors.ppeClass ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Select PPE Class</option>
                {ppeClasses.map((ppe, index) => (
                  <option key={index} value={ppe.name}>
                    {ppe.name}
                  </option>
                ))}
              </select>
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.ppeClass && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ppeClass}</p>
            )}
          </div>

          {/* Account Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-denr-green" />
              Account Code
            </label>
            <div className="relative">
              <input
                type="text"
                name="accountCode"
                value={formData.accountCode}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                readOnly
              />
              <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-filled based on PPE Class</p>
          </div>

          {/* Useful Life */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-denr-green" />
              Useful Life (Years)
            </label>
            <div className="relative">
              <input
                type="text"
                name="usefulLife"
                value={formData.usefulLife}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 dark:text-gray-300 cursor-not-allowed"
                readOnly
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Auto-filled based on PPE Class</p>
          </div>

          {/* Office */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-denr-green" />
              Office
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="office"
                value={formData.office}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all appearance-none ${
                  errors.office ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Office</option>
                {offices.map((office, index) => (
                  <option key={index} value={office}>{office}</option>
                ))}
              </select>
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.office && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.office}</p>
            )}
          </div>

          {/* Fund Cluster */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-denr-green" />
              Fund Cluster
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="fundCluster"
                value={formData.fundCluster}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-8 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all appearance-none ${
                  errors.fundCluster ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Fund Cluster</option>
                {fundClusters.map((cluster, index) => (
                  <option key={index} value={cluster}>{cluster}</option>
                ))}
              </select>
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.fundCluster && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fundCluster}</p>
            )}
          </div>

          {/* Unit of Measure */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-denr-green" />
              Unit of Measure
            </label>
            <div className="relative">
              <input
                type="text"
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                placeholder="e.g., SQM, Unit, Set"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all"
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Auto-filled based on PPE class (e.g., Land: SQM, Equipment: Unit, Building: SQM, CIP: HAS)</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              {formData.status === 'Serviceable' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              Status
            </label>
            <div className="relative">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all appearance-none"
              >
                <option value="Serviceable">Serviceable</option>
                <option value="Unserviceable">Unserviceable</option>
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {formData.status === 'Serviceable' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 pointer-events-none" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 pointer-events-none" />
                )}
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Unit Cost */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-denr-green" />
              Unit Cost
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                placeholder="0.00"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.unitCost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                step="0.01"
                min="0"
              />
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.unitCost && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unitCost}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <PackageIcon className="w-4 h-4 text-denr-green" />
              Quantity
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="1"
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                min="1"
              />
              <PackageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-denr-green" />
              Remarks
            </label>
            <div className="relative">
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all resize-none"
                rows="3"
                placeholder="Enter any additional information"
              />
              <FileIcon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-denr-green text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {editingAsset ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{editingAsset ? 'Update Property' : 'Save Property'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Automatic Calculation Results */}
      <div className="bg-gradient-to-r from-denr-light/50 to-green-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl border border-denr-green/20">
        <h3 className="text-lg font-bold text-denr-green mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Automatic Calculation Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Cost</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.totalCost || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <Tag className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Residual Value</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.residual || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <PackageIcon className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Depreciable Amount</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.depreciationAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <Calculator className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Annual Depreciation</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.annualDepreciation || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <Calendar className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rate of Depreciation</p>
                <p className="text-lg font-bold text-denr-green">
                  {parseFloat(calculatedValues.rateOfDepreciation || 0).toFixed(2)}%
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <Hash className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Accumulated Depreciation</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.accumulatedDepreciation || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <FileIcon className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Net Book Value</p>
                <p className="text-lg font-bold text-denr-green">
                  ₱ {parseFloat(calculatedValues.netbookValue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 bg-denr-light rounded-full">
                <Tag className="w-4 h-4 text-denr-green" />
              </div>
            </div>
          </div>

          {/* PPE Class Badge */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">PPE Class</p>
                <div className="flex items-center gap-2 mt-1">
                  {formData.ppeClass && ppeClassIconMap[formData.ppeClass] && (
                    <span className="text-denr-green">
                      {ppeClassIconMap[formData.ppeClass]}
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {formData.ppeClass || 'Not selected'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Depreciation Schedule Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-xl border border-blue-200 dark:border-gray-600">
        <h3 className="text-lg font-bold text-denr-green mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Depreciation Schedule Preview
        </h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Method:</span> Straight Line Depreciation
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Date Acquired:</span> {formData.dateAcquired || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Useful Life:</span> {formData.usefulLife ? `${formData.usefulLife} years` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Account Code:</span> {formData.accountCode || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Office:</span> {formData.office || 'Not specified'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                  formData.status === 'Serviceable' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {formData.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetForm;
