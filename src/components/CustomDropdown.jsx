import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Building, Landmark, Car, Laptop, Server, Phone, Wrench, Home, TreePine, Droplets, Zap, Briefcase, Shield, Package, CheckCircle2, XCircle } from 'lucide-react';

function CustomDropdown({ value, onChange, options, placeholder, label, searchable = false, iconMap = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayValue = (value === 'all' || !value) ? placeholder : value;
  const selectedIcon = iconMap[value] || iconMap['all'];

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 border border-green-300/50 dark:border-gray-600 rounded-lg cursor-pointer 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-denr-green/50 focus:border-denr-green
                   transition-all duration-200
                   flex items-center justify-between
                   hover:border-green-500 dark:hover:border-green-400
                   shadow-sm hover:shadow-md min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          {selectedIcon && <span className="text-denr-green dark:text-green-400">{selectedIcon}</span>}
          <span className="truncate text-base font-medium">{displayValue}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[99999] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-denr-green/50"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-80">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-base">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const icon = iconMap[option];
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-4 cursor-pointer transition-colors duration-150 flex items-center gap-3
                      ${value === option 
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium' 
                        : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                      ${index !== filteredOptions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}
                    `}
                  >
                    {icon && <span className="text-denr-green dark:text-green-400">{icon}</span>}
                    <span className="truncate text-base">{option}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
