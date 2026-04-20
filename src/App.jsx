import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Properties from './components/Properties.jsx';
import Reports from './components/Reports.jsx';
import RepairMaintenance from './components/RepairMaintenance.jsx';
import Login from './components/Login.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');

  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    if (loggedIn === 'true' && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Handle scroll-based navigation highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['dashboard', 'properties', 'repair-maintenance', 'reports', 'settings'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setActiveSection('dashboard');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-denr-green to-green-600 backdrop-blur-sm border-b border-green-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand - Left side */}
            <div className="flex items-center space-x-3">
              <img 
                src="/denrlogo.jpg" 
                alt="DENR Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzIyQzU1NiIvPgo8cGF0aCBkPSJNMTAgMjBMMjAgMTBMMzAgMjBMMjAgMzBMMTAgMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                }}
              />
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg">PENRO-DENR</h1>
                <p className="text-green-100 text-xs">Asset Depreciation System</p>
              </div>
            </div>
            
            {/* Navigation Buttons - All moved to right side corner */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => scrollToSection('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'dashboard' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection('properties')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'properties' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => scrollToSection('repair-maintenance')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'repair-maintenance' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Repair & Maintenance
              </button>
              <button
                onClick={() => scrollToSection('reports')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'reports' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => scrollToSection('settings')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === 'settings' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Single Page Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Dashboard Section */}
        <section id="dashboard" className="min-h-screen">
          <Dashboard />
        </section>

        {/* Properties Section */}
        <section id="properties" className="min-h-screen">
          <Properties />
        </section>

        {/* Repair and Maintenance Section */}
        <section id="repair-maintenance" className="min-h-screen">
          <RepairMaintenance />
        </section>

        {/* Reports Section */}
        <section id="reports" className="min-h-screen">
          <Reports />
        </section>

        {/* Settings Section */}
        <section id="settings" className="min-h-screen">
          <div className="denr-card">
            <h2 className="text-2xl font-bold text-denr-green mb-6">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-section">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="form-label">Enable Dark Mode</label>
                    <button className="denr-button-secondary">Toggle</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Email Notifications</label>
                    <button className="denr-button-secondary">Configure</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Data Export Format</label>
                    <select className="denr-input max-w-xs">
                      <option>CSV</option>
                      <option>Excel</option>
                      <option>PDF</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-section">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="form-label">Default Office</label>
                    <select className="denr-input max-w-xs">
                      <option>PENRO</option>
                      <option>INITAO</option>
                      <option>GINGOOG</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Default Fund Cluster</label>
                    <select className="denr-input max-w-xs">
                      <option>Select Fund Cluster</option>
                      <option>Internally Generated Funds</option>
                      <option>Special Account - Foreign Assisted/Foreign Grants Fund</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
