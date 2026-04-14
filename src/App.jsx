import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import AssetForm from './components/AssetForm.jsx';
import AssetList from './components/AssetList.jsx';
import Reports from './components/Reports.jsx';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-asset':
        return <AssetForm />;
      case 'assets':
        return <AssetList />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'dashboard' 
                    ? 'bg-denr-green text-white' 
                    : 'text-gray-700 hover:bg-denr-light hover:text-denr-green'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('add-asset')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'add-asset' 
                    ? 'bg-denr-green text-white' 
                    : 'text-gray-700 hover:bg-denr-light hover:text-denr-green'
                }`}
              >
                Add Asset
              </button>
              <button
                onClick={() => setActiveSection('assets')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'assets' 
                    ? 'bg-denr-green text-white' 
                    : 'text-gray-700 hover:bg-denr-light hover:text-denr-green'
                }`}
              >
                Asset List
              </button>
              <button
                onClick={() => setActiveSection('reports')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeSection === 'reports' 
                    ? 'bg-denr-green text-white' 
                    : 'text-gray-700 hover:bg-denr-light hover:text-denr-green'
                }`}
              >
                Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveSection()}
      </div>
    </div>
  );
}

export default App;
