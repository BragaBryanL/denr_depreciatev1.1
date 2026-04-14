import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Package, DollarSign, AlertCircle } from 'lucide-react';

function Dashboard() {
  // Sample data for charts
  const assetData = [
    { name: 'Land', value: 2500000, count: 45 },
    { name: 'Buildings', value: 1800000, count: 23 },
    { name: 'Equipment', value: 1200000, count: 67 },
    { name: 'Vehicles', value: 800000, count: 31 },
    { name: 'Furniture', value: 450000, count: 89 },
  ];

  const depreciationData = [
    { month: 'Jan', depreciation: 45000 },
    { month: 'Feb', depreciation: 48000 },
    { month: 'Mar', depreciation: 52000 },
    { month: 'Apr', depreciation: 49000 },
    { month: 'May', depreciation: 51000 },
    { month: 'Jun', depreciation: 53000 },
  ];

  const COLORS = ['#2E7D32', '#14532D', '#DCFEAA', '#F59E0B', '#EF4444', '#8B5CF6'];

  const totalAssets = assetData.reduce((sum, item) => sum + item.value, 0);
  const totalDepreciation = depreciationData.reduce((sum, item) => sum + item.depreciation, 0);
  const assetCount = assetData.reduce((sum, item) => sum + item.count, 0);

  const recentAssets = [
    {
      propertyNumber: '2024-98-03-0001-01',
      ppeClass: 'Buildings',
      office: 'PENRO',
      status: 'Serviceable',
      totalCost: 1300000,
      accumulatedDepreciation: 978688.49,
      netbookValue: 321311.51,
      dateAcquired: '2020/09/14'
    },
    {
      propertyNumber: 'CI-SPHV-2025-08-03',
      ppeClass: 'Machinery and Equipment',
      office: 'INITAO',
      status: 'Serviceable',
      totalCost: 850000,
      accumulatedDepreciation: 245000,
      netbookValue: 605000,
      dateAcquired: '2021/03/15'
    },
    {
      propertyNumber: '2023-05-0002-02',
      ppeClass: 'Motor Vehicles',
      office: 'GINGOOG',
      status: 'Unserviceable',
      totalCost: 650000,
      accumulatedDepreciation: 195000,
      netbookValue: 455000,
      dateAcquired: '2023/01/20'
    }
  ];

  return (
    <div className="space-y-6">
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
                {assetData.filter(item => item.name !== 'Vehicles').reduce((sum, item) => sum + item.count, 0)}
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
          <PieChart width={400} height={300}>
            <Pie
              data={assetData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
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
          <BarChart width={400} height={300} data={depreciationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            <Bar dataKey="depreciation" fill="#2E7D32" />
          </BarChart>
        </div>
      </div>

      {/* Recent Assets Table */}
      <div className="denr-card">
        <h3 className="text-lg font-semibold text-denr-green mb-4">Recent Assets</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-denr-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PPE Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Office
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accumulated Depreciation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Book Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Acquired
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAssets.map((asset, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.propertyNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.ppeClass}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.office}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      asset.status === 'Serviceable'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{asset.totalCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{asset.accumulatedDepreciation.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱{asset.netbookValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {asset.dateAcquired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
