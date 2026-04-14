import React from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  FileText, 
  Settings 
} from 'lucide-react';

function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add-asset', label: 'Add Asset', icon: Plus },
    { id: 'assets', label: 'Asset List', icon: List },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-denr-dark text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Navigation</h2>
        <p className="text-denr-light text-sm">Asset Management System</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                activeView === item.id
                  ? 'bg-denr-green text-white'
                  : 'text-denr-light hover:bg-denr-green hover:bg-opacity-20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-8 border-t border-denr-green border-opacity-30">
        <div className="text-denr-light text-sm">
          <p className="mb-2">© 2024 PENRO-DENR</p>
          <p>Asset Depreciation System</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
