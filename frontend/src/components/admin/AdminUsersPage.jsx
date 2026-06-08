import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  UsersIcon, 
  MagnifyingGlassIcon, 
  UserCircleIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const AdminUsersPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'ADMIN': 
        return { color: 'bg-red-100 text-red-700', icon: ShieldCheckIcon, label: 'Admin' };
      case 'EMPLOYEE': 
        return { color: 'bg-blue-100 text-blue-700', icon: BriefcaseIcon, label: 'Employee' };
      default: 
        return { color: 'bg-green-100 text-green-700', icon: UserIcon, label: 'Customer' };
    }
  };

  const getStats = () => {
    const customers = users.filter(u => u.role === 'CUSTOMER').length;
    const employees = users.filter(u => u.role === 'EMPLOYEE').length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const active = users.filter(u => u.isActive).length;
    return { customers, employees, admins, active, total: users.length };
  };

  const stats = getStats();

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={fetchUsers}
              className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="container mx-auto px-3 md:px-4">
        {/* Header */}
        <div className="mb-5 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              <h1 className="text-xl md:text-3xl font-playfair font-bold text-gray-800">Manage Users</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500">View and manage all registered users</p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-5 md:mb-6">
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Customers</p>
            <p className="text-lg md:text-2xl font-bold text-green-600">{stats.customers}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Employees</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.employees}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Admins</p>
            <p className="text-lg md:text-2xl font-bold text-red-600">{stats.admins}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-lg md:text-2xl font-bold text-teal-600">{stats.active}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 bg-white"
            >
              <option value="all">All Roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs md:text-sm text-gray-500">
                  <th className="px-3 md:px-6 py-2 md:py-3">User</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 hidden sm:table-cell">Role</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Orders</th>
                  <th className="px-3 md:px-6 py-2 md:py-3 hidden md:table-cell">Joined</th>
                  <th className="px-3 md:px-6 py-2 md:py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const roleInfo = getRoleBadge(user.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <UserCircleIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-800 text-sm md:text-base truncate">{user.name || 'No name'}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded-full mt-1 sm:hidden ${roleInfo.color}`}>
                                <RoleIcon className="w-2.5 h-2.5" />
                                {roleInfo.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${roleInfo.color}`}>
                            <RoleIcon className="w-3 h-3" />
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-1">
                            <ShoppingBagIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                            <span className="font-medium text-sm">{user.orderCount || user.orders?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs text-gray-600 hidden md:table-cell">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          {user.isActive ? (
                            <span className="flex items-center gap-0.5 md:gap-1 text-green-600 text-xs md:text-sm">
                              <CheckCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="hidden sm:inline">Active</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 md:gap-1 text-red-600 text-xs md:text-sm">
                              <XCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="hidden sm:inline">Inactive</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;