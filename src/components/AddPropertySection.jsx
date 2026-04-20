import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AssetForm from './AssetForm.jsx';

function AddPropertySection() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Toggle Button */}
      <div className="denr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-denr-green">Add New Property</h2>
          <button
            onClick={handleToggleForm}
            className="denr-button flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormVisible ? 'Close Form' : 'Add Property'}</span>
          </button>
        </div>

        {/* Instructions when form is hidden */}
        {!isFormVisible && (
          <div className="text-center py-8">
            <div className="bg-denr-light rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-denr-green" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Add a New Property?</h3>
            <p className="text-gray-600 mb-4">
              Click the "Add Property" button above to open the property information form.
            </p>
            <p className="text-sm text-gray-500">
              Fill in all the required details including property number, acquisition date, 
              office information, PPE classification, and cost details.
            </p>
          </div>
        )}
      </div>

      {/* Property Form - Only shown when isFormVisible is true */}
      <AssetForm isVisible={isFormVisible} onClose={handleCloseForm} />
    </div>
  );
}

export default AddPropertySection;
