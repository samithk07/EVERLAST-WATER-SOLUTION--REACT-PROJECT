// pages/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock, XCircle, Eye, Download } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Failed to load orders. Please check if json-server is running.');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            <h2 className="text-2xl font-bold text-slate-800">Orders Management</h2>
            <p className="text-slate-600 mt-1">Total Orders: {orders.length}</p>
          </div>
          <button className="inline-flex items-center px-4 py-3 bg-[#00A9FF] text-white font-medium rounded-lg hover:bg-[#0088CC]">
            <Download size={20} className="mr-2" />
            Export Orders
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Completed</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {orders.filter(o => o.status?.toLowerCase() === 'completed').length}
                </p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 mt-2">
                  {orders.filter(o => o.status?.toLowerCase() === 'pending').length}
                </p>
              </div>
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  ₹{orders.reduce((total, order) => total + (order.total || 0), 0).toLocaleString()}
                </p>
              </div>
              <ShoppingBag size={24} className="text-blue-600" />
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

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#89CFF3]">
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Total</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="border-b border-slate-100 hover:bg-[#A0E9FF]/40 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-slate-800">
                      {order.id?.toString().startsWith('#') ? order.id : `#ORD-${order.id}`}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {order.customerName || order.userName || 'Unknown Customer'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {order.customerEmail || order.userEmail || 'No email'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-800">
                      {order.date || order.createdAt || 'N/A'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-slate-800">
                      ₹{(order.total || 0).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-600">
              No orders have been placed yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Edit2 = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default OrdersPage;