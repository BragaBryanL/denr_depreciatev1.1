import React from 'react';

function Header() {
  return (
    <header className="bg-gradient-to-r from-denr-green to-denr-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="./denrlogo.jpg" 
                alt="PENRO-DENR Logo" 
                className="h-12 w-auto max-h-12 object-contain"
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold tracking-tight">PENRO-DENR</h1>
                <p className="text-sm text-denr-light">Asset Depreciation System</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#dashboard" 
              className="text-white hover:text-denr-light px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Dashboard
            </a>
            <a 
              href="#add-asset" 
              className="text-white hover:text-denr-light px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Add Asset
            </a>
            <a 
              href="#assets" 
              className="text-white hover:text-denr-light px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Asset List
            </a>
            <a 
              href="#reports" 
              className="text-white hover:text-denr-light px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Reports
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
