// pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Mail, Phone, Calendar, MoreVertical } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/users`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users. Please check if json-server is running.');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Admin</span>;
      case 'user':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">User</span>;
      case 'customer':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Customer</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{role || 'User'}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Inactive</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A9FF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Users Management</h2>
            <p className="text-slate-600 mt-1">Total Users: {users.length}</p>
          </div>
          <button className="inline-flex items-center px-4 py-3 bg-[#00A9FF] text-white font-medium rounded-lg hover:bg-[#0088CC]">
            <Users size={20} className="mr-2" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Users</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">{users.length}</p>
              </div>
              <Users size={24} className="text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Active Users</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {users.filter(u => u.status?.toLowerCase() === 'active').length}
                </p>
              </div>
              <UserCheck size={24} className="text-green-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Admins</p>
                <p className="text-2xl font-bold text-red-900 mt-2">
                  {users.filter(u => u.role?.toLowerCase() === 'admin').length}
                </p>
              </div>
              <UserX size={24} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">⚠️</div>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-700 text-sm mt-1">
                Make sure json-server is running on http://localhost:3001
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#89CFF3]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Joined</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-slate-100 hover:bg-[#A0E9FF]/40 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#00A9FF] to-[#89CFF3] flex items-center justify-center text-white font-bold mr-4">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {user.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">ID: #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail size={14} className="text-slate-400 mr-2" />
                        <p className="text-sm text-slate-800 truncate max-w-[200px]">
                          {user.email || 'No email'}
                        </p>
                      </div>
                      {user.phone && (
                        <div className="flex items-center">
                          <Phone size={14} className="text-slate-400 mr-2" />
                          <p className="text-sm text-slate-600">{user.phone}</p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Calendar size={14} className="text-slate-400 mr-2" />
                      <p className="text-sm text-slate-600">
                        {user.createdAt || user.joinDate || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center p-2 text-[#00A9FF] hover:bg-[#00A9FF]/10 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="inline-flex items-center p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button className="inline-flex items-center p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No users found</h3>
            <p className="text-slate-600">
              No users have been registered yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Eye = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const Edit2 = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default UsersPage;
