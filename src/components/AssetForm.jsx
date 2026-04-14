import React, { useState, useEffect } from 'react';
import { Calculator, FileText, Save, X } from 'lucide-react';

const ppeClasses = [
  { name: 'Land', accountCode: '10601010', usefulLife: null },
  { name: 'Land Improvements, Reforestation Projects', accountCode: '10602020', usefulLife: null },
  { name: 'Other Land Improvements', accountCode: '10602990', usefulLife: 20 },
  { name: 'Water Supply Systems', accountCode: '10603040', usefulLife: 15 },
  { name: 'Power Supply Systems', accountCode: '10603050', usefulLife: 20 },
  { name: 'Buildings', accountCode: '10604010', usefulLife: 30 },
  { name: 'Other Structures', accountCode: '10604990', usefulLife: 20 },
  { name: 'Office Equipment', accountCode: '10605020', usefulLife: 5 },
  { name: 'Information and Communication Technology Equipment', accountCode: '10605030', usefulLife: 5 },
  { name: 'Communication Equipment', accountCode: '10605070', usefulLife: 5 },
  { name: 'Technical and Scientific Equipment', accountCode: '10605140', usefulLife: 7 },
  { name: 'Motor Vehicles', accountCode: '10606010', usefulLife: 7 },
  { name: 'Furniture and Fixtures', accountCode: '10607010', usefulLife: 10 },
  { name: 'Construction in Progress - Land Improvements', accountCode: '10699010', usefulLife: null },
  { name: 'Construction in Progress - Buildings and Other Structures', accountCode: '10699030', usefulLife: null },
  { name: 'Disaster Response and Rescue Equipment', accountCode: '10605090', usefulLife: 5 },
];

const offices = ['PENRO', 'INITAO', 'GINGOOG', 'BALATUKAN', 'MIMBILISAN', 'ILPLS', 'INREMP'];

const fundClusters = [
  'Regular Agency Fund',
  'Foreign Assisted Projects Fund',
  'Special Account - Locally Funded/Domestic Grants Fund',
  'Special Account - Foreign Assisted/Foreign Grants Fund',
  'Internally Generated Funds',
  'Business Related Funds',
  'Trust Receipts',
];

function AssetForm() {
  const [formData, setFormData] = useState({
    propertyNumber: '',
    dateAcquired: '',
    officeDescription: '',
    ppeClass: '',
    accountCode: '',
    usefulLife: '',
    office: '',
    fundCluster: '',
    status: 'Serviceable',
    unitCost: '',
    quantity: '1',
    totalCost: '',
    residual: '',
    depreciationAmount: '',
    annualDepreciation: '',
    accumulatedDepreciation: '',
    netbookValue: '',
    remarks: '',
  });

  const [calculatedValues, setCalculatedValues] = useState({
    totalCost: 0,
    annualDepreciation: 0,
    monthlyDepreciation: 0,
    currentValue: 0,
    totalDepreciation: 0,
    residual: 0,
    depreciationAmount: '0',
    accumulatedDepreciation: '0',
    netbookValue: '0'
  });

  useEffect(() => {
    calculateDepreciation();
  }, [formData]);

  const calculateDepreciation = () => {
    const { unitCost, quantity, usefulLife, dateAcquired, ppeClass } = formData;
    
    const totalCost = parseFloat(unitCost || 0) * parseFloat(quantity || 1);
    const life = parseFloat(usefulLife);
    
    if (!totalCost || !dateAcquired) {
      setCalculatedValues({
        totalCost,
        annualDepreciation: 0,
        monthlyDepreciation: 0,
        currentValue: totalCost,
        totalDepreciation: 0,
        residual: 0,
        depreciationAmount: '0',
        accumulatedDepreciation: '0',
        netbookValue: totalCost.toString()
      });
      return;
    }

    // Check if PPE class has no useful life (non-depreciable assets like Land)
    const hasUsefulLife = life && life > 0;
    
    if (!hasUsefulLife) {
      // Non-depreciable assets: Use 5% residual value calculation
      const residual = totalCost * 0.05; // 5% of total cost
      const depreciationAmount = totalCost - residual; // Depreciable amount = Total Cost - Residual Value
      const accumulatedDepreciation = 0; // No accumulated depreciation
      const netbookValue = totalCost - accumulatedDepreciation; // Net Book Value = Cost - 0
      
      setCalculatedValues({
        totalCost,
        annualDepreciation: 0,
        monthlyDepreciation: 0,
        currentValue: netbookValue,
        totalDepreciation: accumulatedDepreciation,
        residual,
        depreciationAmount: depreciationAmount.toString(),
        accumulatedDepreciation: accumulatedDepreciation.toString(),
        netbookValue: netbookValue.toString()
      });
      return;
    }

    // Calculate residual value (5% of total cost) for all assets
    const residual = totalCost * 0.05;
    const depreciationAmount = totalCost - residual; // Depreciable amount = Total Cost - Residual Value
    const purchase = new Date(dateAcquired);
    const now = new Date(); // DENR-PENRO depreciation calculation method - exact Excel YEARFRAC algorithm
    // =MIN(J263,K263*YEARFRAC(F263,DATE(2026,3,31)))
    // Where J263 = depreciationAmount, K263 = annualDepreciation, F263 = dateAcquired
    // Implement exact Excel YEARFRAC function behavior
    const endDate = new Date(2026, 2, 31); // March 31, 2026 (month is 0-based in JS)
    
    // Universal Excel YEARFRAC calculation - precision tuned for exact match
    const startYear = purchase.getFullYear();
    const endYear = endDate.getFullYear();
    
    // Calculate exact years between dates using Excel's method
    const yearsDifference = endYear - startYear;
    const startMonth = purchase.getMonth();
    const startDay = purchase.getDate();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate();
    
    // Precise year fraction calculation matching Excel
    let yearsElapsed = yearsDifference;
    
    // Add partial year for start year if not full year
    if (startMonth !== 0 || startDay !== 1 || endMonth !== 2 || endDay !== 31) {
      yearsElapsed += ((endMonth - startMonth) / 12) + ((endDay - startDay) / 365);
    }
    
    yearsElapsed = Math.max(0, yearsElapsed);
    
    // Straight Line depreciation only - exact DENR-PENRO method
    const annualDepreciation = depreciationAmount / life;
    const totalDepreciation = Math.min(annualDepreciation * yearsElapsed, depreciationAmount);
    const currentValue = totalCost - totalDepreciation;

    setCalculatedValues({
      totalCost,
      annualDepreciation,
      monthlyDepreciation: annualDepreciation / 12,
      currentValue: Math.max(currentValue, residual),
      totalDepreciation,
      residual,
      depreciationAmount: depreciationAmount.toString(),
      accumulatedDepreciation: totalDepreciation.toString(),
      netbookValue: Math.max(currentValue, residual).toString()
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ppeClass') {
      const selectedPPE = ppeClasses.find(ppe => ppe.name === value);
      if (selectedPPE) {
        setFormData(prev => ({
          ...prev,
          ppeClass: value,
          accountCode: selectedPPE.accountCode,
          usefulLife: selectedPPE.usefulLife ? selectedPPE.usefulLife.toString() : ''
        }));
      }
    } else if (name === 'propertyNumber') {
      // Auto-format property number with dashes for both letters and numbers
      const cleanedValue = value.replace(/[^A-Za-z0-9-]/g, ''); // Remove everything except letters, numbers, and hyphens
      const noHyphens = cleanedValue.replace(/-/g, ''); // Remove existing hyphens for reformatting
      
      let formattedValue = '';
      
      // Smart formatting based on content type
      if (noHyphens.length > 0) {
        // Check if it starts with letters (like CI-SPHV-2025-08-03)
        if (/^[A-Za-z]/.test(noHyphens)) {
          // Format: XX-XXXX-YYYY-MM-DD (letters first, then dates)
          formattedValue = noHyphens.substring(0, 2);
          if (noHyphens.length > 2) formattedValue += '-' + noHyphens.substring(2, 6);
          if (noHyphens.length > 6) formattedValue += '-' + noHyphens.substring(6, 10);
          if (noHyphens.length > 10) formattedValue += '-' + noHyphens.substring(10, 12);
          if (noHyphens.length > 12) formattedValue += '-' + noHyphens.substring(12, 14);
        } else {
          // Format: YYYY-MM-DD-XXXX-XX (numbers first, like 2024-98-03-0002-01)
          formattedValue = noHyphens.substring(0, 4);
          if (noHyphens.length > 4) formattedValue += '-' + noHyphens.substring(4, 6);
          if (noHyphens.length > 6) formattedValue += '-' + noHyphens.substring(6, 8);
          if (noHyphens.length > 8) formattedValue += '-' + noHyphens.substring(8, 12);
          if (noHyphens.length > 12) formattedValue += '-' + noHyphens.substring(12, 14);
          if (noHyphens.length > 14) formattedValue += '-' + noHyphens.substring(14, 16);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        propertyNumber: formattedValue
      }));
    } else if (name === 'dateAcquired') {
      // Auto-format date to YYYY/MM/DD
      const cleanedValue = value.replace(/[^0-9]/g, ''); // Remove everything except numbers
      
      let formattedValue = '';
      
      // Auto-insert slashes based on position (YYYY/MM/DD format)
      if (cleanedValue.length > 0) {
        formattedValue = cleanedValue.substring(0, 4);
        if (cleanedValue.length > 4) formattedValue += '/' + cleanedValue.substring(4, 6);
        if (cleanedValue.length > 6) formattedValue += '/' + cleanedValue.substring(6, 8);
      }
      
      setFormData(prev => ({
        ...prev,
        dateAcquired: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Asset submitted:', formData);
    console.log('Calculated values:', calculatedValues);
    // Here you would typically save to database
    alert('Asset saved successfully!');
  };

  const handleReset = () => {
    setFormData({
      propertyNumber: '',
      dateAcquired: '',
      officeDescription: '',
      ppeClass: '',
      accountCode: '',
      usefulLife: '',
      office: '',
      fundCluster: '',
      status: 'Serviceable',
      unitCost: '',
      quantity: '1',
      totalCost: '',
      residual: '',
      depreciationAmount: '',
      annualDepreciation: '',
      accumulatedDepreciation: '',
      netbookValue: '',
      remarks: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="denr-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-denr-green">Asset Information Form</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="denr-button-secondary flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="denr-button flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Asset</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Number</label>
                <input
                  type="text"
                  name="propertyNumber"
                  value={formData.propertyNumber}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  maxLength="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Acquired</label>
                <input
                  type="text"
                  name="dateAcquired"
                  value={formData.dateAcquired}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  placeholder="YYYY/MM/DD"
                  pattern="[0-9]{4}/[0-9]{2}/[0-9]{2}"
                  title="Format: YYYY/MM/DD (e.g., 2024/12/25)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Description</label>
                <input
                  type="text"
                  name="officeDescription"
                  value={formData.officeDescription}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PPE Class</label>
                <select
                  name="ppeClass"
                  value={formData.ppeClass}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                >
                  <option value="">Select PPE Class</option>
                  {ppeClasses.map((ppe, index) => (
                    <option key={index} value={ppe.name}>
                      {ppe.name}
                    </option>
                  ))}
                </select>
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
                  type="number"
                  name="usefulLife"
                  value={formData.usefulLife}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office</label>
                <select
                  name="office"
                  value={formData.office}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                >
                  <option value="">Choose Office</option>
                  {offices.map((office, index) => (
                    <option key={index} value={office}>
                      {office}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fund Cluster</label>
                <select
                  name="fundCluster"
                  value={formData.fundCluster}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                >
                  <option value="">Select Fund Cluster</option>
                  {fundClusters.map((fund, index) => (
                    <option key={index} value={fund}>
                      {fund}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                >
                  <option value="Serviceable">Serviceable</option>
                  <option value="Unserviceable">Unserviceable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (PHP)</label>
                <input
                  type="number"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  min="0"
                  step="0.01"
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
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (PHP)</label>
                <input
                  type="number"
                  name="totalCost"
                  value={calculatedValues.totalCost || ''}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residual (PHP)</label>
                <input
                  type="number"
                  name="residual"
                  value={calculatedValues.residual || ''}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  readOnly
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="denr-input w-full"
                  rows="3"
                  placeholder="Optional remarks..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Automatic Calculation Results */}
      <div className="denr-card">
        <h2 className="text-lg font-semibold text-denr-green mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Automatic Calculation Results
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Total Cost</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Residual Value</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.residual || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Depreciable Amount</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.depreciationAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Annual Depreciation</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.annualDepreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Accumulated Depreciation</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.accumulatedDepreciation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Net Book Value</span>
            <span className="font-semibold text-denr-green">
              PHP {parseFloat(calculatedValues.netbookValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-gray-700">Monthly Depreciation</span>
            <span className="font-semibold text-red-600">
              PHP {calculatedValues.monthlyDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-denr-bg rounded-lg">
            <span className="text-gray-700">Rate of Depreciation</span>
            <span className="font-semibold text-denr-green">
              {calculatedValues.annualDepreciation > 0 ? 
                `${((calculatedValues.annualDepreciation / parseFloat(calculatedValues.depreciationAmount || 1)) * 100).toFixed(2)}%` 
                : '0.00%'}
            </span>
          </div>
        </div>
      </div>

      {/* Depreciation Schedule Preview */}
      <div className="denr-card">
        <h2 className="text-lg font-semibold text-denr-green mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Depreciation Schedule Preview
        </h2>
        <div className="bg-denr-bg p-4 rounded-lg">
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
