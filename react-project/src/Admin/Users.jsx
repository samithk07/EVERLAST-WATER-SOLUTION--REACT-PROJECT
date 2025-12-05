// pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Mail, Phone, Calendar, 
  MoreVertical, Search, Filter, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, Plus, Download, RefreshCw,
  Check, X, Shield, User, Save
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:3001';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

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
      toast.success('Users loaded successfully');
    } catch (err) {
      setError('Failed to load users. Please check if json-server is running.');
      toast.error('Failed to load users');
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user });
  };

  const handleEditChange = (field, value) => {
    setEditingUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveEdit = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingUser),
      });

      if (!response.ok) throw new Error('Failed to update user');

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (err) {
      toast.error('Failed to update user');
      console.error('Update error:', err);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
      console.error('Delete error:', err);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Failed to add user');

      const addedUser = await response.json();
      setUsers([...users, addedUser]);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      });
      setShowAddUserModal(false);
      toast.success('User added successfully');
    } catch (err) {
      toast.error('Failed to add user');
      console.error('Add user error:', err);
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updatedUser = { ...user, status: newStatus };

    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Status update error:', err);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center">
          <Shield size={12} className="mr-1" /> Admin
        </span>;
      case 'user':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center">
          <User size={12} className="mr-1" /> User
        </span>;
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Users Management</h2>
            <p className="text-slate-600 mt-1">
              Total Users: {users.length} | Showing: {filteredUsers.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center px-4 py-3 bg-[#00A9FF] text-white font-medium rounded-lg hover:bg-[#0088CC]"
            >
              <Plus size={20} className="mr-2" />
              Add User
            </button>
            <button 
              onClick={exportUsers}
              className="inline-flex items-center px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              <Download size={20} className="mr-2" />
              Export CSV
            </button>
            <button 
              onClick={fetchUsers}
              className="inline-flex items-center px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
            >
              <RefreshCw size={20} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
          
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Admins</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {users.filter(u => u.role?.toLowerCase() === 'admin').length}
                </p>
              </div>
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Inactive</p>
                <p className="text-2xl font-bold text-red-900 mt-2">
                  {users.filter(u => u.status?.toLowerCase() === 'inactive').length}
                </p>
              </div>
              <UserX size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="customer">Customer</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              {currentUsers.map((user) => (
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
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.role}
                        onChange={(e) => handleEditChange('role', e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9FF]"
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="customer">Customer</option>
                      </select>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {editingUser?.id === user.id ? (
                      <select
                        value={editingUser.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                        className="px-3 py-1 border border-slate-300 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#00A9FF]"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {getStatusBadge(user.status)}
                      </button>
                    )}
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
                      {editingUser?.id === user.id ? (
                        <>
                          <button 
                            onClick={saveEdit}
                            className="inline-flex items-center p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center p-2 text-[#00A9FF] hover:bg-[#00A9FF]/10 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No users found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try changing your search or filters' 
                : 'No users have been registered yet.'}
            </p>
            {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="text-[#00A9FF] hover:text-[#0088CC] font-medium"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => setShowAddUserModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
              >
                <Plus size={16} className="mr-2" />
                Add First User
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-slate-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? 'text-slate-400' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg ${currentPage === number 
                    ? 'bg-[#00A9FF] text-white' 
                    : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-slate-400' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Add New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
                >
                  <Save size={16} className="inline mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Delete User</h3>
              <p className="text-slate-600 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{userToDelete?.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;