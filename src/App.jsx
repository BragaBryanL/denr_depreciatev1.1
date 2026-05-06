import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Properties from './components/Properties.jsx';
import Reports from './components/Reports.jsx';
import RepairMaintenance from './components/RepairMaintenance.jsx';
import IssuesTransfers from './components/IssuesTransfers.jsx';
import Login from './components/Login.jsx';
import Modal from './components/Modal.jsx';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem('denr_notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const scrollTimeoutRef = useRef(null);

  // Check if user is already logged in
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');
    const storedUserType = localStorage.getItem('userType');
    if (loggedIn === 'true' && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserType(storedUserType || 'user');
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Handle scroll-based navigation highlighting and topbar minimization
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['dashboard', 'properties', 'repair-maintenance', 'issues-transfers', 'reports', 'settings'];
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

          // Direct scroll detection for minimization
          setIsMinimized(window.scrollY > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSettingsDropdownOpen && !event.target.closest('.settings-dropdown')) {
        setIsSettingsDropdownOpen(false);
      }
      if (isNotificationDropdownOpen && !event.target.closest('.notification-dropdown')) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsDropdownOpen, isNotificationDropdownOpen]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    // Default to user type if not specified
    const storedUserType = localStorage.getItem('userType') || 'user';
    setUserType(storedUserType);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserType('');
    setActiveSection('dashboard');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    setIsSettingsModalOpen(false);
  };

  // Helper function to add notification
  const addNotification = (notification) => {
    let newNotification;
    
    if (typeof notification === 'string') {
      newNotification = {
        message: notification,
        time: new Date().toLocaleString()
      };
    } else {
      newNotification = {
        ...notification,
        time: new Date().toLocaleString()
      };
    }
    
    const updatedNotifications = [...notifications, newNotification];
    setNotifications(updatedNotifications);
    localStorage.setItem('denr_notifications', JSON.stringify(updatedNotifications));
  };

  // Handle accept account
  const handleAcceptAccount = (username, notificationIndex) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.map(user => 
      user.username === username ? { ...user, status: 'active' } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Remove notification
    const updatedNotifications = notifications.filter((_, index) => index !== notificationIndex);
    setNotifications(updatedNotifications);
    localStorage.setItem('denr_notifications', JSON.stringify(updatedNotifications));
  };

  // Handle reject account
  const handleRejectAccount = (username, notificationIndex) => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.filter(user => user.username !== username);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Remove notification
    const updatedNotifications = notifications.filter((_, index) => index !== notificationIndex);
    setNotifications(updatedNotifications);
    localStorage.setItem('denr_notifications', JSON.stringify(updatedNotifications));
  };

  // Make addNotification available globally for other components
  useEffect(() => {
    window.addNotification = addNotification;
    return () => {
      delete window.addNotification;
    };
  }, [notifications]);

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
      <div 
        className={`sticky top-0 z-50 bg-gradient-to-r from-denr-green to-green-600 backdrop-blur-sm border-b border-green-700 shadow-xl transition-all duration-300 ease-in-out ${isMinimized ? 'h-12' : 'h-16'}`}
        style={{ height: isMinimized ? '3rem' : '4rem' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo and Brand - Left side */}
            <div className="flex items-center space-x-3">
              <img 
                src="/denrlogo.jpg" 
                alt="DENR Logo" 
                className={`logo-circular transition-all duration-300 ${isMinimized ? 'h-8' : 'h-10'}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzIyQzU1NiIvPgo8cGF0aCBkPSJNMTAgMjBMMjAgMTBMMzAgMjBMMjAgMzBMMTAgMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
                }}
              />
              <div className={`hidden sm:block transition-all duration-300 ${isMinimized ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                <h1 className="text-white font-bold text-lg">PENRO-DENR</h1>
                <p className="text-green-100 text-xs">Asset Depreciation System</p>
              </div>
            </div>
            
            {/* Navigation Buttons - All moved to right side corner */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => scrollToSection('dashboard')}
                className={`rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  activeSection === 'dashboard' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection('properties')}
                className={`rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  activeSection === 'properties' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Properties
              </button>
              <button
                onClick={() => scrollToSection('repair-maintenance')}
                className={`rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  activeSection === 'repair-maintenance' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Repair & Maintenance
              </button>
              <button
                onClick={() => scrollToSection('issues-transfers')}
                className={`rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  activeSection === 'issues-transfers' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Issues & Transfers
              </button>
              <button
                onClick={() => scrollToSection('reports')}
                className={`rounded-lg font-medium transition-all duration-200 ${
                  isMinimized ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                } ${
                  activeSection === 'reports' 
                    ? 'bg-white text-denr-green shadow-md' 
                    : 'text-white hover:bg-white/20 hover:text-white'
                }`}
              >
                Reports
              </button>
              {/* Notification Bell - Admin Only */}
              {userType === 'admin' && (
                <div className="relative notification-dropdown">
                <button
                  onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  className={`p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200 ${
                    isMinimized ? 'opacity-100' : 'opacity-100'
                  }`}
                  title="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-denr-green mb-4">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {notifications.map((notification, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="text-sm text-gray-800">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              {notification.type === 'pending_account' && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleAcceptAccount(notification.username, index)}
                                    className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectAccount(notification.username, index)}
                                    className="flex-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={() => {
                            setNotifications([]);
                            localStorage.removeItem('denr_notifications');
                          }}
                          className="w-full mt-3 px-3 py-2 bg-denr-green text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )}
              {/* Settings Button - Right corner */}
              <div className="relative settings-dropdown">
                <button
                  onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
                  className={`p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200 ${
                    isMinimized ? 'opacity-100' : 'opacity-100'
                  }`}
                  title="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {/* Settings Dropdown Menu */}
                {isSettingsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-denr-green mb-4">Settings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">Dark Mode</label>
                          <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`px-4 py-1 rounded text-sm transition-colors ${
                              isDarkMode 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {isDarkMode ? 'On' : 'Off'}
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">Export Data</label>
                          <button
                            onClick={() => {
                              const assets = localStorage.getItem('denr_assets');
                              if (assets) {
                                const blob = new Blob([assets], { type: 'application/json' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'denr_assets_backup.json';
                                a.click();
                                window.URL.revokeObjectURL(url);
                              }
                            }}
                            className="px-3 py-1 bg-denr-green text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">Clear All Data</label>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                                localStorage.removeItem('denr_assets');
                                localStorage.removeItem('denr_transactions');
                                localStorage.removeItem('users');
                                localStorage.removeItem('denr_notifications');
                                window.location.reload();
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        <hr className="my-3 border-gray-200" />
                        <div className="text-xs text-gray-500">
                          <p>Logged in as: <span className="font-semibold">{username}</span></p>
                          <p>User Type: <span className="font-semibold capitalize">{userType}</span></p>
                        </div>
                        <hr className="my-3 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Single Page Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-0">
        {/* Dashboard Section */}
        <section id="dashboard" className="min-h-screen pb-12">
          <Dashboard />
        </section>

        <hr className="my-8 border-gray-300 dark:border-gray-700" />

        {/* Properties Section */}
        <section id="properties" className="min-h-screen pt-8 pb-12">
          <Properties />
        </section>

        <hr className="my-8 border-gray-300 dark:border-gray-700" />

        {/* Repair and Maintenance Section */}
        <section id="repair-maintenance" className="min-h-screen pt-8 pb-12">
          <RepairMaintenance />
        </section>

        <hr className="my-8 border-gray-300 dark:border-gray-700" />

        {/* Issues & Transfers Section */}
        <section id="issues-transfers" className="min-h-screen pt-8 pb-12">
          <IssuesTransfers />
        </section>

        <hr className="my-8 border-gray-300 dark:border-gray-700" />

        {/* Reports Section */}
        <section id="reports" className="min-h-screen pt-8">
          <Reports />
        </section>
      </div>

      {/* Settings Modal */}
      <Modal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        title="Settings"
      >
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
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full denr-button bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
