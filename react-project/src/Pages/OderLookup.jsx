// pages/OrderLookupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderLookupPage = () => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLookup = (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }
    
    // Clean the order ID
    const cleanOrderId = orderId.trim().toUpperCase();
    
    // Navigate to order page
    navigate(`/order/${cleanOrderId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Track Your Order</h1>
          <p className="text-slate-600 mt-2">
            Enter your order ID to view order details and tracking information
          </p>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Order ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setError('');
                }}
                placeholder="Enter your order ID (e.g., ORD-00001)"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Track Order
            <ArrowRight size={20} className="ml-2" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Need Help?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Your order ID was sent to your email</li>
            <li>• Check your email inbox for order confirmation</li>
            <li>• Contact support if you can't find your order ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderLookupPage;
