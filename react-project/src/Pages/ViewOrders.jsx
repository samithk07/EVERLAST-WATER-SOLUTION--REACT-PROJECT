// pages/UserOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  User,
  DollarSign,
  Calendar,
  MapPin,
  Truck,
  CreditCard,
  AlertCircle,
  Mail,
  Phone,
  Home,
  Download,
  Printer,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:3001';

const ViewOrders = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  
  // Order tracking timeline
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const orderRes = await fetch(`${API_BASE}/orders/${orderId}`);
      
      if (!orderRes.ok) {
        throw new Error('Order not found');
      }
      
      const orderData = await orderRes.json();
      
      // Fetch products for order items
      const productsRes = await fetch(`${API_BASE}/products`);
      const productsData = await productsRes.json();
      
      // Fetch user details if userId exists
      let userData = null;
      if (orderData.userId) {
        const userRes = await fetch(`${API_BASE}/users/${orderData.userId}`);
        if (userRes.ok) {
          userData = await userRes.json();
        }
      }
      
      // Transform order data
      const transformedOrder = transformOrderData(orderData, productsData, userData);
      setOrder(transformedOrder);
      setUserDetails(userData);
      
      // Generate tracking timeline
      generateTrackingTimeline(transformedOrder);
      
      toast.success('Order details loaded');
    } catch (err) {
      setError('Failed to load order details. The order may not exist.');
      console.error('Order fetch error:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const transformOrderData = (orderData, productsData, userData) => {
    // Get all ordered products with full details
    const orderItems = orderData.items || orderData.products || [];
    const detailedItems = orderItems.map(item => {
      const product = productsData.find(p => p.id === item.productId || p.name === item.name);
      return {
        ...item,
        id: item.productId || product?.id || item.id,
        name: product?.name || item.name || 'Unknown Product',
        price: product?.price || item.price || 0,
        quantity: item.quantity || 1,
        image: product?.image || item.image,
        category: product?.category || item.category,
        description: product?.description || item.description
      };
    });

    // Calculate total from items if not provided
    const calculatedTotal = detailedItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    // Handle shipping address
    let shippingAddress = {};
    
    if (orderData.shippingAddress) {
      if (typeof orderData.shippingAddress === 'string') {
        shippingAddress.fullAddress = orderData.shippingAddress;
      } else if (typeof orderData.shippingAddress === 'object') {
        shippingAddress = {
          street: orderData.shippingAddress.street || orderData.shippingAddress.address || '',
          city: orderData.shippingAddress.city || '',
          state: orderData.shippingAddress.state || orderData.shippingAddress.province || '',
          zipCode: orderData.shippingAddress.zipCode || orderData.shippingAddress.postalCode || orderData.shippingAddress.pincode || '',
          country: orderData.shippingAddress.country || '',
          fullAddress: orderData.shippingAddress.fullAddress || 
            `${orderData.shippingAddress.street || ''}, ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} - ${orderData.shippingAddress.zipCode || ''}, ${orderData.shippingAddress.country || ''}`
        };
      }
    } else if (orderData.address) {
      if (typeof orderData.address === 'string') {
        shippingAddress.fullAddress = orderData.address;
      } else if (typeof orderData.address === 'object') {
        shippingAddress = {
          street: orderData.address.street || orderData.address.address || '',
          city: orderData.address.city || '',
          state: orderData.address.state || orderData.address.province || '',
          zipCode: orderData.address.zipCode || orderData.address.postalCode || orderData.address.pincode || '',
          country: orderData.address.country || '',
          fullAddress: orderData.address.fullAddress || 
            `${orderData.address.street || ''}, ${orderData.address.city || ''}, ${orderData.address.state || ''} - ${orderData.address.zipCode || ''}, ${orderData.address.country || ''}`
        };
      }
    }

    // If still no address, create a default
    if (!shippingAddress.fullAddress || shippingAddress.fullAddress.trim() === '') {
      shippingAddress = {
        street: 'Not specified',
        city: 'Not specified',
        state: 'Not specified',
        zipCode: 'Not specified',
        country: 'India',
        fullAddress: 'Address not specified'
      };
    }

    return {
      id: orderData.id,
      orderId: orderData.orderId || `ORD-${String(orderData.id).padStart(5, '0')}`,
      
      // Customer details
      customerName: orderData.customerName || userData?.name || `Customer #${orderData.id}`,
      customerEmail: orderData.customerEmail || userData?.email || orderData.email || `customer${orderData.id}@example.com`,
      customerPhone: orderData.customerPhone || userData?.phone || orderData.phone || 'Not provided',
      userId: orderData.userId || userData?.id,
      
      // Shipping address details
      shippingAddress: shippingAddress,
      
      // Order items with full product details
      items: detailedItems,
      
      // Financial details
      subtotal: orderData.subtotal || calculatedTotal,
      tax: orderData.tax || orderData.taxAmount || 0,
      shippingCost: orderData.shippingCost || orderData.shipping || 0,
      discount: orderData.discount || orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || orderData.total || (calculatedTotal + (orderData.tax || 0) + (orderData.shippingCost || 0) - (orderData.discount || 0)),
      
      // Order status and dates
      status: orderData.status || 'pending',
      paymentMethod: orderData.paymentMethod || 'credit-card',
      paymentStatus: orderData.paymentStatus || 'pending',
      orderDate: orderData.orderDate || orderData.createdAt || orderData.date || new Date().toISOString(),
      estimatedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deliveredDate: orderData.deliveredDate,
      
      // Additional info
      notes: orderData.notes || orderData.note || '',
      trackingNumber: orderData.trackingNumber || `TRK-${Date.now()}`,
      shippingMethod: orderData.shippingMethod || 'standard',
      shippingCarrier: orderData.shippingCarrier || 'Standard Shipping',
      
      // Payment details
      transactionId: orderData.transactionId,
      paymentDetails: orderData.paymentDetails || {}
    };
  };

  const generateTrackingTimeline = (orderData) => {
    const steps = [];
    const orderDate = new Date(orderData.orderDate);
    
    // Order Placed
    steps.push({
      id: 1,
      title: 'Order Placed',
      description: 'Your order has been received',
      date: orderDate,
      completed: true,
      icon: <ShoppingBag size={16} />,
      color: 'text-green-600 bg-green-100'
    });
    
    // Order Confirmed
    const confirmedDate = new Date(orderDate.getTime() + 1 * 60 * 60 * 1000); // 1 hour later
    steps.push({
      id: 2,
      title: 'Order Confirmed',
      description: 'Order has been confirmed',
      date: confirmedDate,
      completed: ['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(orderData.status),
      icon: <CheckCircle size={16} />,
      color: ['confirmed', 'processing', 'shipped', 'delivered', 'completed'].includes(orderData.status) 
        ? 'text-green-600 bg-green-100' 
        : 'text-gray-400 bg-gray-100'
    });
    
    // Processing
    const processingDate = new Date(orderDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours later
    steps.push({
      id: 3,
      title: 'Processing',
      description: 'Your order is being prepared',
      date: processingDate,
      completed: ['processing', 'shipped', 'delivered', 'completed'].includes(orderData.status),
      icon: <RefreshCw size={16} />,
      color: ['processing', 'shipped', 'delivered', 'completed'].includes(orderData.status)
        ? 'text-blue-600 bg-blue-100'
        : 'text-gray-400 bg-gray-100'
    });
    
    // Shipped
    let shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // 1 day later
    if (orderData.status === 'shipped' || orderData.status === 'delivered' || orderData.status === 'completed') {
      shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);
    }
    steps.push({
      id: 4,
      title: 'Shipped',
      description: 'Your order is on the way',
      date: shippedDate,
      completed: ['shipped', 'delivered', 'completed'].includes(orderData.status),
      icon: <Truck size={16} />,
      color: ['shipped', 'delivered', 'completed'].includes(orderData.status)
        ? 'text-purple-600 bg-purple-100'
        : 'text-gray-400 bg-gray-100'
    });
    
    // Delivered
    let deliveredDate = orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery) : new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (orderData.deliveredDate) {
      deliveredDate = new Date(orderData.deliveredDate);
    }
    steps.push({
      id: 5,
      title: 'Delivered',
      description: 'Order has been delivered',
      date: deliveredDate,
      completed: ['delivered', 'completed'].includes(orderData.status),
      icon: <Package size={16} />,
      color: ['delivered', 'completed'].includes(orderData.status)
        ? 'text-emerald-600 bg-emerald-100'
        : 'text-gray-400 bg-gray-100'
    });
    
    setTrackingSteps(steps);
  };

  // Order Status Configuration
  const statusConfig = {
    'pending': {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: <Clock size={18} className="mr-2" />,
      badgeColor: 'bg-yellow-500'
    },
    'confirmed': {
      label: 'Confirmed',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <CheckCircle size={18} className="mr-2" />,
      badgeColor: 'bg-blue-500'
    },
    'processing': {
      label: 'Processing',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: <RefreshCw size={18} className="mr-2" />,
      badgeColor: 'bg-indigo-500'
    },
    'shipped': {
      label: 'Shipped',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Truck size={18} className="mr-2" />,
      badgeColor: 'bg-purple-500'
    },
    'delivered': {
      label: 'Delivered',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle size={18} className="mr-2" />,
      badgeColor: 'bg-green-500'
    },
    'completed': {
      label: 'Completed',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle size={18} className="mr-2" />,
      badgeColor: 'bg-emerald-500'
    },
    'cancelled': {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: <XCircle size={18} className="mr-2" />,
      badgeColor: 'bg-red-500'
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    const invoiceContent = `
      Order Invoice
      =============
      
      Order ID: ${order?.orderId}
      Date: ${format(new Date(order?.orderDate), 'MMMM dd, yyyy')}
      
      Customer Details:
      ----------------
      Name: ${order?.customerName}
      Email: ${order?.customerEmail}
      Phone: ${order?.customerPhone}
      
      Shipping Address:
      -----------------
      ${order?.shippingAddress?.fullAddress}
      
      Order Items:
      ------------
      ${order?.items?.map(item => `${item.name} x${item.quantity} - ₹${item.price * item.quantity}`).join('\n')}
      
      Order Summary:
      --------------
      Subtotal: ₹${order?.subtotal?.toFixed(2)}
      Shipping: ₹${order?.shippingCost?.toFixed(2)}
      Tax: ₹${order?.tax?.toFixed(2)}
      Discount: ₹${order?.discount?.toFixed(2)}
      Total: ₹${order?.totalAmount?.toFixed(2)}
      
      Status: ${order?.status}
      Tracking: ${order?.trackingNumber}
      Estimated Delivery: ${format(new Date(order?.estimatedDelivery), 'MMMM dd, yyyy')}
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${order?.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#00A9FF] border-t-transparent"></div>
        <p className="text-slate-600 mt-4">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-[#00A9FF] text-white rounded-lg hover:bg-[#0088CC]"
          >
            <Home size={18} className="mr-2" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-600 hover:text-slate-800 mr-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Order Details</h1>
                <p className="text-slate-600">Order ID: {order.orderId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                <Download size={18} className="mr-2" />
                Download Invoice
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
              >
                <Printer size={18} className="mr-2" />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Banner */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <ShoppingBag size={24} className="text-[#00A9FF] mr-3" />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Order Status</h2>
                      <p className="text-slate-600 text-sm">
                        Placed on {format(new Date(order.orderDate), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-slate-600">Estimated Delivery</p>
                  <p className="text-lg font-bold text-slate-800">
                    {format(new Date(order.estimatedDelivery), 'MMMM dd, yyyy')}
                  </p>
                  {order.deliveredDate && (
                    <p className="text-sm text-green-600 mt-1">
                      Delivered on {format(new Date(order.deliveredDate), 'MMMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Tracking Progress */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Tracking</h3>
                <div className="relative">
                  {/* Timeline */}
                  <div className="flex items-center justify-between mb-4">
                    {trackingSteps.map((step, index) => (
                      <div key={step.id} className="flex flex-col items-center relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.completed ? step.color : 'text-gray-400 bg-gray-100'} mb-2`}>
                          {step.icon}
                        </div>
                        <span className={`text-sm font-medium ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.title}
                        </span>
                        {index < trackingSteps.length - 1 && (
                          <div className={`absolute top-6 left-full w-full h-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-200'} -translate-x-1/2`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Timeline Details */}
                  <div className="mt-8 space-y-4">
                    {trackingSteps.map(step => (
                      <div key={step.id} className={`flex items-start p-3 rounded-lg ${step.completed ? 'bg-green-50 border border-green-100' : 'bg-slate-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${step.completed ? step.color : 'text-gray-400 bg-gray-100'}`}>
                          {step.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className={`font-medium ${step.completed ? 'text-slate-800' : 'text-slate-500'}`}>
                              {step.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(step.date, 'MMM dd, hh:mm a')}
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Items ({order.items?.length || 0})</h3>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-slate-600">Quantity: {item.quantity}</span>
                          <span className="text-sm text-slate-600">Price: ₹{item.price.toLocaleString()}</span>
                          {item.category && (
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-800">₹{order.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-800">₹{order.shippingCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-800">₹{order.tax?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-₹{order.discount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-800">Total Amount</span>
                    <span className="text-[#00A9FF]">₹{order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Information */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center mb-4">
                <User size={20} className="text-[#00A9FF] mr-2" />
                <h3 className="text-lg font-semibold text-slate-800">Customer Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#00A9FF]/10 flex items-center justify-center mr-3">
                    <User size={16} className="text-[#00A9FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{order.customerName}</p>
                    <p className="text-sm text-slate-600">Customer</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail size={16} className="text-slate-400 mr-3" />
                  <p className="text-sm text-slate-700">{order.customerEmail}</p>
                </div>
                <div className="flex items-center">
                  <Phone size={16} className="text-slate-400 mr-3" />
                  <p className="text-sm text-slate-700">{order.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center mb-4">
                <MapPin size={20} className="text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-slate-800">Shipping Address</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin size={16} className="text-slate-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-slate-700">{order.shippingAddress?.street}</p>
                    <p className="text-sm text-slate-700">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p className="text-sm text-slate-700">{order.shippingAddress?.zipCode}, {order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping & Payment Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <div className="flex items-center mb-4">
                <Truck size={20} className="text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-slate-800">Shipping & Payment</h3>
              </div>
              
              <div className="space-y-4">
                {/* Shipping Details */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Shipping Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Method:</span>
                      <span className="text-slate-800 font-medium">{order.shippingMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Carrier:</span>
                      <span className="text-slate-800 font-medium">{order.shippingCarrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tracking:</span>
                      <span className="text-slate-800 font-medium">{order.trackingNumber}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Method:</span>
                      <span className="text-slate-800 font-medium">
                        {order.paymentMethod?.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                    {order.transactionId && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transaction ID:</span>
                        <span className="text-slate-800 font-medium text-xs truncate max-w-[120px]">
                          {order.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <AlertCircle size={20} className="text-amber-600 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800">Order Notes</h3>
                </div>
                <p className="text-amber-700">{order.notes}</p>
              </div>
            )}

            {/* Support Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                If you have any questions about your order, please contact our customer support.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-blue-800 font-medium">📞 Support: +91 1234567890</p>
                <p className="text-sm text-blue-800 font-medium">✉️ Email: support@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;