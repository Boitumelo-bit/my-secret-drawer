import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const AdminAuditLogsPage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  useEffect(() => {
    fetchLogs();
    fetchActions();
  }, []);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const params = new URLSearchParams({
        page,
        limit: 20
      });
      if (selectedAction !== 'all') params.append('action', selectedAction);
      
      const response = await axios.get(`${apiUrl}/api/admin/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setLogs(response.data.logs);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchActions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/admin/audit-logs/actions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setActions(response.data.actions);
      }
    } catch (err) {
      console.error('Error fetching actions:', err);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return <PlusIcon className="w-3 h-3 md:w-4 md:h-4 text-green-500" />;
    } else if (action.includes('UPDATE') || action.includes('EDIT')) {
      return <PencilIcon className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />;
    } else if (action.includes('DELETE') || action.includes('REMOVE')) {
      return <TrashIcon className="w-3 h-3 md:w-4 md:h-4 text-red-500" />;
    } else if (action.includes('LOGIN')) {
      return <ArrowRightOnRectangleIcon className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />;
    } else {
      return <ShieldCheckIcon className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />;
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) {
      return 'bg-green-100 text-green-700';
    } else if (action.includes('UPDATE') || action.includes('EDIT')) {
      return 'bg-yellow-100 text-yellow-700';
    } else if (action.includes('DELETE') || action.includes('REMOVE')) {
      return 'bg-red-100 text-red-700';
    } else if (action.includes('LOGIN')) {
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-purple-100 text-purple-700';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStats = () => {
    return {
      total: logs.length,
      uniqueActions: new Set(logs.map(l => l.action)).size,
      uniqueUsers: new Set(logs.map(l => l.userId)).size
    };
  };

  const stats = getStats();

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-10">
        <div className="container mx-auto px-3">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-pink-500"></div>
            <p className="mt-3 text-gray-500 text-sm">Loading audit logs...</p>
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
              onClick={() => fetchLogs()}
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
        {/* Header - Mobile optimized */}
        <div className="mb-5 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DocumentTextIcon className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              <h1 className="text-xl md:text-3xl font-playfair font-bold text-gray-800">Audit Logs</h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500">Track all actions performed in the system</p>
          </div>
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
          >
            <ArrowPathIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Refresh
          </button>
        </div>

        {/* Stats Cards - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-5 md:mb-6">
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Logs</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Unique Actions</p>
            <p className="text-lg md:text-2xl font-bold text-purple-600">{stats.uniqueActions}</p>
          </div>
          <div className="bg-white rounded-lg p-2 md:p-4 shadow-sm">
            <p className="text-xs text-gray-500">Active Users</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.uniqueUsers}</p>
          </div>
        </div>

        {/* Search and Filter - Mobile optimized */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-5 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              />
            </div>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                fetchLogs(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 bg-white"
            >
              <option value="all">All Actions</option>
              {actions.map(action => (
                <option key={action.action} value={action.action}>
                  {action.action} ({action._count.action})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs List - Card view on mobile, table on desktop */}
        <div className="block md:hidden space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadge(log.action)}`}>
                    {getActionIcon(log.action)}
                    {log.action}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatDate(log.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <UserCircleIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {log.user?.name || 'System'}
                  </span>
                </div>
                {log.details && (
                  <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(log.details, null, 2).substring(0, 150)}
                      {JSON.stringify(log.details, null, 2).length > 150 && '...'}
                    </pre>
                  </div>
                )}
                {log.ipAddress && (
                  <div className="mt-1 text-xs text-gray-400">
                    IP: {log.ipAddress}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              No audit logs found
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </div>
                        </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getActionBadge(log.action)}`}>
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                        </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserCircleIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{log.user?.name?.split(' ')[0] || 'System'}</p>
                            <p className="text-xs text-gray-500">{log.user?.email}</p>
                          </div>
                        </div>
                        </td>
                      <td className="px-4 py-3">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap max-w-xs break-words">
                          {JSON.stringify(log.details, null, 2)?.substring(0, 80) || 'No details'}
                          {JSON.stringify(log.details, null, 2)?.length > 80 && '...'}
                        </pre>
                        </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {log.ipAddress || 'N/A'}
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination - Mobile optimized */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 md:px-4 py-1.5 md:py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 md:px-4 py-1.5 md:py-2 text-sm text-gray-600">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 md:px-4 py-1.5 md:py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}

        {logs.length === 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
            <p className="text-yellow-700 text-xs md:text-sm">
              📝 No audit logs found. Logs are created when users perform actions like login, create orders, update products, etc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;