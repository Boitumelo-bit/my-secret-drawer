import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlusIcon, TrashIcon, PauseIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const EmployeeManagement = () => {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const employeesList = data.users.filter(user => user.role === 'EMPLOYEE');
        const customersList = data.users.filter(user => user.role === 'CUSTOMER');
        
        setEmployees(employeesList);
        setCustomers(customersList);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.user.isActive ? 'User activated' : 'User deactivated');
        fetchData();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update status');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-2 text-gray-500 text-sm">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold">User Management</h2>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm md:text-base"
        >
          <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Refresh
        </button>
      </div>

      {/* Employees Table */}
      <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Employees ({employees.length})</h3>
      <div className="overflow-x-auto mb-6 md:mb-8">
        <table className="w-full border rounded-lg text-sm md:text-base">
          <thead className="bg-gray-50">
            <tr className="text-xs md:text-sm">
              <th className="p-2 md:p-3 text-left">Name</th>
              <th className="p-2 md:p-3 text-left hidden sm:table-cell">Email</th>
              <th className="p-2 md:p-3 text-left">Status</th>
              <th className="p-2 md:p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500 text-sm">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 md:p-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">{emp.name?.split(' ')[0] || 'No name'}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{emp.email}</p>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 hidden sm:table-cell text-sm">{emp.email}</td>
                  <td className="p-2 md:p-3">
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full ${
                      emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2 md:p-3">
                    <button 
                      onClick={() => toggleStatus(emp.id, emp.isActive)} 
                      className="text-yellow-600 hover:text-yellow-800 p-1 active:scale-90 transition-transform"
                      title={emp.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {emp.isActive ? <PauseIcon className="w-4 h-4 md:w-5 md:h-5" /> : <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customers Table - Mobile optimized */}
      <h3 className="font-semibold mb-2 md:mb-3 text-base md:text-lg">Customers ({customers.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg text-sm md:text-base">
          <thead className="bg-gray-50">
            <tr className="text-xs md:text-sm">
              <th className="p-2 md:p-3 text-left">Name</th>
              <th className="p-2 md:p-3 text-left hidden sm:table-cell">Email</th>
              <th className="p-2 md:p-3 text-left">Orders</th>
              <th className="p-2 md:p-3 text-left">Status</th>
              <th className="p-2 md:p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500 text-sm">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map(cust => (
                <tr key={cust.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 md:p-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">{cust.name?.split(' ')[0] || 'No name'}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{cust.email}</p>
                    </div>
                  </td>
                  <td className="p-2 md:p-3 hidden sm:table-cell text-sm">{cust.email}</td>
                  <td className="p-2 md:p-3 text-center">
                    <span className="font-semibold text-sm">{cust.orderCount || 0}</span>
                  </td>
                  <td className="p-2 md:p-3">
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[10px] md:text-xs rounded-full ${
                      cust.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cust.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-2 md:p-3">
                    <button 
                      onClick={() => toggleStatus(cust.id, cust.isActive)} 
                      className="text-yellow-600 hover:text-yellow-800 p-1 active:scale-90 transition-transform"
                      title={cust.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {cust.isActive ? <PauseIcon className="w-4 h-4 md:w-5 md:h-5" /> : <PlayIcon className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;