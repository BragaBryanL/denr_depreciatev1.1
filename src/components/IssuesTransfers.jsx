import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, FileText, ArrowRightLeft, Package, User, Calendar, FileText as FileIcon, ArrowUpDown } from 'lucide-react';
import Modal from './Modal.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

function IssuesTransfers() {
  const tableRef = React.useRef(null);
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('denr_issues_transfers');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('denr_issues_transfers', JSON.stringify(transactions));
  }, [transactions]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    transaction: null,
    isBulk: false
  });
  const [formData, setFormData] = useState({
    propertyNumber: '',
    accountableUser: '',
    date: '',
    parNumber: '',
    type: 'ISSUE', // ISSUE or TRANSFER
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setFormData({
      propertyNumber: '',
      accountableUser: '',
      date: new Date().toISOString().split('T')[0],
      parNumber: '',
      type: 'ISSUE',
      notes: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      propertyNumber: transaction.propertyNumber || '',
      accountableUser: transaction.accountableUser || '',
      date: transaction.date || '',
      parNumber: transaction.parNumber || '',
      type: transaction.type || 'ISSUE',
      notes: transaction.notes || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.propertyNumber.trim()) {
      newErrors.propertyNumber = 'Property number is required';
    }
    
    if (!formData.accountableUser.trim()) {
      newErrors.accountableUser = 'Accountable user is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.parNumber.trim()) {
      newErrors.parNumber = 'PAR number is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const transactionData = {
        id: editingTransaction ? editingTransaction.id : Date.now().toString(),
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0],
        createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTransaction) {
        setTransactions(prev => prev.map(trans => 
          trans.id === editingTransaction.id ? transactionData : trans
        ));
      } else {
        setTransactions(prev => [...prev, transactionData]);
      }

      setIsModalOpen(false);
      setEditingTransaction(null);
      setIsSubmitting(false);
      setErrors({});
    }, 500);
  };

  const handleDeleteTransaction = (transaction, isBulk = false) => {
    setDeleteConfirmation({
      isOpen: true,
      transaction,
      isBulk
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.isBulk) {
      setTransactions(prev => prev.filter(trans => !selectedTransactions.includes(trans.id)));
      setSelectedTransactions([]);
    } else {
      setTransactions(prev => prev.filter(trans => trans.id !== deleteConfirmation.transaction.id));
    }
    setDeleteConfirmation({ isOpen: false, transaction: null, isBulk: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction =>
    transaction.propertyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.accountableUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.parNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Issues & Transfers</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage asset issues and transfers</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTransaction}
              className="px-4 py-2 bg-denr-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" ref={tableRef}>
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onChange={handleSelectAllTransactions}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Property No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Accountable Officer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">PAR Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => handleSelectTransaction(transaction.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{transaction.propertyNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{transaction.accountableUser}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{transaction.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{transaction.parNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      transaction.type === 'ISSUE' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTransaction(transaction)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-denr-green" />
              Property Number
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="propertyNumber"
                value={formData.propertyNumber}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.propertyNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., 2017-05-07-0032-01"
              />
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.propertyNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.propertyNumber}</p>
            )}
          </div>

          {/* Accountable Officer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-denr-green" />
              Accountable Officer
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="accountableUser"
                value={formData.accountableUser}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.accountableUser ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Juan Dela Cruz"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.accountableUser && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.accountableUser}</p>
            )}
          </div>

          {/* Date and Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-denr-green" />
                Date
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                    errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-denr-green" />
                Transaction Type
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all appearance-none ${
                    errors.type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="ISSUE">ISSUE</option>
                  <option value="TRANSFER">TRANSFER</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>
              )}
            </div>
          </div>

          {/* PAR Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileIcon className="w-4 h-4 text-denr-green" />
              PAR Number
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="parNumber"
                value={formData.parNumber}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all ${
                  errors.parNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., AEGF-784136-5995"
              />
              <FileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {errors.parNumber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parNumber}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-denr-green" />
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green dark:bg-gray-700 dark:text-gray-300 transition-all resize-none"
              placeholder="Add any additional notes or remarks..."
            />
          </div>

          {/* Transaction Type Badge Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                formData.type === 'ISSUE' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {formData.type}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formData.propertyNumber && `Property: ${formData.propertyNumber}`}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-denr-green text-white rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {editingTransaction ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, transaction: null, isBulk: false })}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete ${deleteConfirmation.isBulk ? 'the selected transactions' : 'this transaction'}? This action cannot be undone.`}
      />
    </div>
  );
}

export default IssuesTransfers;
