import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, FileText } from 'lucide-react';
import Modal from './Modal.jsx';

function RepairMaintenance() {
  const tableRef = React.useRef(null);
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('denr_transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('denr_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    propertyNumber: '',
    natureOfRepair: '',
    supplier: '',
    amount: '',
    poNumber: '',
    date: ''
  });

  const handleSelectTransaction = (id) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(transId => transId !== id) : [...prev, id]
    );
  };

  const handleSelectAllTransactions = () => {
    if (selectedTransactions.length === paginatedTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(paginatedTransactions.map(transaction => transaction.id));
    }
  };

  const handleDeleteSelectedTransactions = () => {
    if (selectedTransactions.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTransactions.length} transactions?`)) {
      setTransactions(prev => prev.filter(transaction => !selectedTransactions.includes(transaction.id)));
      setSelectedTransactions([]);
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('denrDataChanged'));
    }
  };

  // ESC key to deselect all (only if no modal is open)
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        const modal = document.querySelector('.fixed.inset-0.z-\\[999999\\]');
        if (!modal) {
          setSelectedTransactions([]);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.propertyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.natureOfRepair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Scroll to table when page changes
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? {
              ...t,
              propertyNumber: formData.propertyNumber,
              natureOfRepair: formData.natureOfRepair,
              supplier: formData.supplier,
              amount: parseFloat(formData.amount),
              poNumber: formData.poNumber,
              date: formData.date
            }
          : t
      ));
      setEditingTransaction(null);
    } else {
      // Add new transaction
      const newTransaction = {
        id: Date.now().toString(),
        propertyNumber: formData.propertyNumber,
        natureOfRepair: formData.natureOfRepair,
        supplier: formData.supplier,
        amount: parseFloat(formData.amount),
        poNumber: formData.poNumber,
        date: formData.date,
        status: 'Pending'
      };
      setTransactions([...transactions, newTransaction]);
    }
    
    setIsModalOpen(false);
    setFormData({
      propertyNumber: '',
      natureOfRepair: '',
      supplier: '',
      amount: '',
      poNumber: '',
      date: ''
    });
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('denrDataChanged'));
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      propertyNumber: transaction.propertyNumber,
      natureOfRepair: transaction.natureOfRepair,
      supplier: transaction.supplier,
      amount: transaction.amount.toString(),
      poNumber: transaction.poNumber,
      date: transaction.date
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('denrDataChanged'));
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
            onClick={() => {
              setEditingTransaction(null);
              setFormData({
                propertyNumber: '',
                natureOfRepair: '',
                supplier: '',
                amount: '',
                poNumber: '',
                date: ''
              });
              setIsModalOpen(true);
            }}
            className="denr-button flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
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

      {/* Add Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          setFormData({
            propertyNumber: '',
            natureOfRepair: '',
            supplier: '',
            amount: '',
            poNumber: '',
            date: ''
          });
        }} 
        title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
      >
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property #</label>
              <input
                type="text"
                value={formData.propertyNumber}
                onChange={(e) => {
                  let formattedValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                  if (formattedValue.length > 4) formattedValue = formattedValue.slice(0, 4) + '-' + formattedValue.slice(4);
                  if (formattedValue.length > 7) formattedValue = formattedValue.slice(0, 7) + '-' + formattedValue.slice(7);
                  if (formattedValue.length > 10) formattedValue = formattedValue.slice(0, 10) + '-' + formattedValue.slice(10);
                  if (formattedValue.length > 15) formattedValue = formattedValue.slice(0, 15) + '-' + formattedValue.slice(15);
                  formattedValue = formattedValue.slice(0, 18);
                  setFormData(prev => ({...prev, propertyNumber: formattedValue}));
                }}
                placeholder="0000-00-00-0000-000"
                className="denr-input w-full"
                maxLength="18"
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
              onClick={() => setIsModalOpen(false)}
              className="denr-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="denr-button"
            >
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transactions Table */}
      <div className="denr-card" ref={tableRef}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-denr-green">Transaction History</h3>
          {selectedTransactions.length > 0 && (
            <button
              onClick={handleDeleteSelectedTransactions}
              className="px-4 py-4 border border-red-300/50 dark:border-gray-600 rounded-lg cursor-pointer 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500
                       transition-all duration-200
                       font-medium
                       hover:border-red-500 dark:hover:border-red-400
                       shadow-sm hover:shadow-md min-h-[56px]"
            >
              Delete Selected ({selectedTransactions.length})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-denr-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onChange={handleSelectAllTransactions}
                    className="w-4 h-4 rounded border-gray-300 text-denr-green focus:ring-denr-green"
                  />
                </th>
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
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className="w-4 h-4 rounded border-gray-300 text-denr-green focus:ring-denr-green"
                    />
                  </td>
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
                        onClick={() => handleEditTransaction(transaction)}
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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 border rounded-lg ${currentPage === page ? 'bg-denr-green text-white border-denr-green' : 'border-gray-300 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RepairMaintenance;
