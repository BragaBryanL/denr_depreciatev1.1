import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, FileText } from 'lucide-react';

function RepairMaintenance() {
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      propertyNumber: 'IM-P177-2005-90-50',
      natureOfRepair: 'Air Conditioning System Repair',
      supplier: 'CoolAir Services Inc.',
      amount: 15000,
      poNumber: 'PO-2024-001',
      date: '2024/03/15',
      status: 'Completed'
    },
    {
      id: '2',
      propertyNumber: 'CI-SPHV-2025-08-03',
      natureOfRepair: 'Generator Maintenance',
      supplier: 'PowerTech Solutions',
      amount: 25000,
      poNumber: 'PO-2024-002',
      date: '2024/03/20',
      status: 'In Progress'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    propertyNumber: '',
    natureOfRepair: '',
    supplier: '',
    amount: '',
    poNumber: '',
    date: ''
  });

  const filteredTransactions = transactions.filter(transaction =>
    transaction.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.natureOfRepair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'In Progress'
    };
    setTransactions(prev => [...prev, newTransaction]);
    setFormData({
      propertyNumber: '',
      natureOfRepair: '',
      supplier: '',
      amount: '',
      poNumber: '',
      date: ''
    });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Property #', 'Nature of Repair and Maintenance', 'Supplier', 'Amount', 'PO Number', 'Date'],
      ...filteredTransactions.map(t => [
        t.propertyNumber,
        t.natureOfRepair,
        t.supplier,
        t.amount,
        t.poNumber,
        t.date
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'repair_maintenance_transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="denr-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-denr-green">Repair and Maintenance Transactions</h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="denr-button flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Close Form' : 'Add Transaction'}</span>
          </button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="denr-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-denr-green">{filteredTransactions.length}</p>
              </div>
              <div className="p-3 bg-denr-light rounded-full">
                <FileText className="w-6 h-6 text-denr-green" />
              </div>
            </div>
          </div>

          <div className="denr-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-denr-green">
                  ₱ {totalAmount.toLocaleString('en-PH')}
                </p>
              </div>
              <div className="p-3 bg-denr-light rounded-full">
                <Filter className="w-6 h-6 text-denr-green" />
              </div>
            </div>
          </div>

          <div className="denr-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Amount</p>
                <p className="text-2xl font-bold text-denr-green">
                  ₱ {filteredTransactions.length > 0 ? (totalAmount / filteredTransactions.length).toLocaleString('en-PH') : '0'}
                </p>
              </div>
              <div className="p-3 bg-denr-light rounded-full">
                <Filter className="w-6 h-6 text-denr-green" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="denr-input w-full pl-10"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="denr-button-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Add Transaction Form */}
      {isAdding && (
        <div className="denr-card">
          <h3 className="text-lg font-semibold text-denr-green mb-4">Add New Transaction</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property #</label>
                <input
                  type="text"
                  value={formData.propertyNumber}
                  onChange={(e) => setFormData(prev => ({...prev, propertyNumber: e.target.value}))}
                  className="denr-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nature of Repair and Maintenance</label>
                <input
                  type="text"
                  value={formData.natureOfRepair}
                  onChange={(e) => setFormData(prev => ({...prev, natureOfRepair: e.target.value}))}
                  className="denr-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({...prev, supplier: e.target.value}))}
                  className="denr-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                  className="denr-input w-full"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => setFormData(prev => ({...prev, poNumber: e.target.value}))}
                  className="denr-input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                  className="denr-input w-full"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="denr-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="denr-button"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="denr-card">
        <h3 className="text-lg font-semibold text-denr-green mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-denr-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nature of Repair and Maintenance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.propertyNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.natureOfRepair}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₱ {transaction.amount.toLocaleString('en-PH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.poNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

export default RepairMaintenance;
