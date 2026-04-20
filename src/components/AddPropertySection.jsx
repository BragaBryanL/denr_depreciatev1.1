import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AssetForm from './AssetForm.jsx';
import Modal from './Modal.jsx';

function AddPropertySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAsset = (newAsset) => {
    console.log('New asset added:', newAsset);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* Header and Button */}
      <div className="denr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-denr-green">Add New Property</h2>
          <button
            onClick={handleOpenModal}
            className="denr-button flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>

        {/* Instructions */}
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
      </div>

      {/* Modal for Add Property */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="Add New Property"
      >
        <AssetForm 
          isVisible={isModalOpen} 
          onClose={handleCloseModal}
          onAddAsset={handleAddAsset}
        />
      </Modal>
    </div>
  );
}

export default AddPropertySection;
