import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign, AlertCircle } from 'lucide-react';

function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const dashboardRef = React.useRef(null);

  const loadData = () => {
    const savedAssets = localStorage.getItem('denr_assets');
    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    }

    const savedTransactions = localStorage.getItem('denr_transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  };

  useEffect(() => {
    loadData();

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'denr_assets' || e.key === 'denr_transactions') {
        loadData();
      }
    };

    // Listen for custom data change event
    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('denrDataChanged', handleDataChange);

    // Intersection Observer to reload when Dashboard becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadData();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (dashboardRef.current) {
      observer.observe(dashboardRef.current);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('denrDataChanged', handleDataChange);
      if (dashboardRef.current) {
        observer.unobserve(dashboardRef.current);
      }
    };
  }, []);

  // Calculate asset data dynamically
  const assetData = assets.reduce((acc, asset) => {
    const existing = acc.find(item => item.name === asset.ppeClass);
    if (existing) {
      existing.value += asset.cost || 0;
      existing.count += 1;
    } else {
      acc.push({ name: asset.ppeClass, value: asset.cost || 0, count: 1 });
    }
    return acc;
  }, []);

  // Calculate depreciation data dynamically
  const depreciationData = assets.reduce((acc, asset) => {
    if (asset.annualDepreciation) {
      const month = new Date(asset.dateAcquired).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.depreciation += parseFloat(asset.annualDepreciation);
      } else {
        acc.push({ month, depreciation: parseFloat(asset.annualDepreciation) });
      }
    }
    return acc;
  }, []);

  const COLORS = ['#2E7D32', '#14532D', '#DCFEAA', '#F59E0B', '#EF4444', '#8B5CF6'];

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.cost || 0), 0);
  const totalDepreciation = assets.reduce((sum, asset) => sum + (asset.accumulatedDepreciation || 0), 0);
  const assetCount = assets.length;

  // Get recent assets (last 5)
  const recentAssets = assets
    .sort((a, b) => new Date(b.dateAcquired) - new Date(a.dateAcquired))
    .slice(0, 5)
    .map(asset => ({
      propertyNumber: asset.propertyNumber,
      ppeClass: asset.ppeClass,
      office: asset.officePlace,
      status: asset.status,
      totalCost: asset.cost || 0,
      accumulatedDepreciation: asset.accumulatedDepreciation || 0,
      netbookValue: asset.netBookValue || 0,
      dateAcquired: asset.dateAcquired
    }));

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-denr-green">
                ₱{totalAssets.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-denr-light rounded-full">
              <Package className="w-6 h-6 text-denr-green" />
            </div>
          </div>
        </div>

        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Asset Count</p>
              <p className="text-2xl font-bold text-denr-green">
                {assetCount}
              </p>
            </div>
            <div className="p-3 bg-denr-light rounded-full">
              <Package className="w-6 h-6 text-denr-green" />
            </div>
          </div>
        </div>

        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Depreciation</p>
              <p className="text-2xl font-bold text-red-600">
                ₱{totalDepreciation.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="denr-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Serviceable Assets</p>
              <p className="text-2xl font-bold text-denr-green">
                {assets.filter(asset => asset.status === 'Serviceable').length}
              </p>
            </div>
            <div className="p-3 bg-denr-light rounded-full">
              <TrendingUp className="w-6 h-6 text-denr-green" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="denr-card">
          <h3 className="text-lg font-semibold text-denr-green mb-4">Asset Distribution</h3>
          <PieChart width={500} height={400}>
            <Pie
              data={assetData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {assetData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="denr-card">
          <h3 className="text-lg font-semibold text-denr-green mb-4">Monthly Depreciation Trend</h3>
          <BarChart width={500} height={400} data={depreciationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            <Bar dataKey="depreciation" fill="#2E7D32" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
