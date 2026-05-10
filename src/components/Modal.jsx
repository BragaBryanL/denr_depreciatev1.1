import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText } from 'lucide-react';

function Modal({ isOpen, onClose, title, children }) {
  const scrollPositionRef = React.useRef(0);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save scroll position
      scrollPositionRef.current = window.scrollY;
      // Lock scroll on html element (not body to avoid position issues)
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.documentElement.style.overflow = '';
      // Restore scroll position with delay to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gradient-to-br from-white to-green-50 border-l-4 border-denr-green rounded-lg shadow-2xl w-fit max-w-6xl max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-denr-green/5 to-green-50">
          <h2 className="text-xl font-bold text-denr-green flex items-center">
            <span className="bg-denr-green text-white p-2 rounded-lg mr-3">
              <FileText className="w-5 h-5" />
            </span>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default Modal;
