import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, Shield, Lock, User, Package } from 'lucide-react';
import Footer from '../Component/Footer';
import Navbar from '../Component/NavBar';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
    const { 
        getCurrentUserCart, 
        clearCart, 
        getCartTotal, 
        getCartItemsCount,
        cartItems: allCartItems // Get all cart items from context
    } = useCart();
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    const [activePaymentMethod, setActivePaymentMethod] = useState('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState('');

    // Get current user's cart items
    const cart = getCurrentUserCart();

    // Form state
    const [formData, setFormData] = useState({
        upiId: '',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });

    const [errors, setErrors] = useState({});

    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444',
        success: '#10B981'
    };

    // Redirect if cart is empty or user not logged in
    useEffect(() => {
        // Only check after auth loading is complete
        if (!loading) {
            if (cart.length === 0 && !showSuccessModal) {
                toast.info('Your cart is empty');
                navigate('/products');
            }
            if (!user && !showSuccessModal) {
                toast.info('Please login to checkout');
                navigate('/login');
            }
        }
    }, [cart, navigate, showSuccessModal, user, loading]);

    // Calculate order totals
    const subtotal = getCartTotal();
    const shipping = subtotal > 5000 ? 0 : 200;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    // Generate random order ID
    const generateOrderId = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD${timestamp}${random}`;
    };

    // Generate order details for storage
    const generateOrderDetails = () => {
        return {
            id: generateOrderId(),
            userId: user.id,
            userName: user.username,
            userEmail: user.email,
            items: cart.map(item => ({
                productId: item.productId,
                productName: item.productName || item.name,
                productImage: item.productImage || item.image,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity
            })),
            subtotal,
            shipping,
            tax,
            total,
            paymentMethod: activePaymentMethod,
            paymentDetails: activePaymentMethod === 'upi' 
                ? { upiId: formData.upiId }
                : { 
                    cardLast4: formData.cardNumber.slice(-4),
                    cardHolder: formData.cardHolder
                },
            status: 'completed',
            createdAt: new Date().toISOString(),
            deliveredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        };
    };

    // Save order to localStorage (simulating database)
    const saveOrderToStorage = (order) => {
        try {
            // Get existing orders or initialize empty array
            const existingOrders = JSON.parse(localStorage.getItem('user_orders')) || {};
            
            // Create user's order history if not exists
            if (!existingOrders[user.id]) {
                existingOrders[user.id] = [];
            }
            
            // Add new order to user's history
            existingOrders[user.id].push(order);
            
            // Save back to localStorage
            localStorage.setItem('user_orders', JSON.stringify(existingOrders));
            
            console.log('Order saved to localStorage:', order);
            return true;
        } catch (error) {
            console.error('Error saving order:', error);
            return false;
        }
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (activePaymentMethod === 'upi') {
            if (!formData.upiId.trim()) {
                newErrors.upiId = 'UPI ID is required';
            } else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
                newErrors.upiId = 'Invalid UPI ID format (e.g., username@upi)';
            }
        } else {
            if (!formData.cardNumber.trim()) {
                newErrors.cardNumber = 'Card number is required';
            } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Card number must be 16 digits';
            }

            if (!formData.cardHolder.trim()) {
                newErrors.cardHolder = 'Card holder name is required';
            }

            if (!formData.expiryDate.trim()) {
                newErrors.expiryDate = 'Expiry date is required';
            } else {
                const [month, year] = formData.expiryDate.split('/');
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;

                if (!month || !year || month < 1 || month > 12 || year < currentYear ||
                    (year == currentYear && month < currentMonth)) {
                    newErrors.expiryDate = 'Invalid expiry date';
                }
            }

            if (!formData.cvv.trim()) {
                newErrors.cvv = 'CVV is required';
            } else if (!/^\d{3,4}$/.test(formData.cvv)) {
                newErrors.cvv = 'CVV must be 3 or 4 digits';
            }
        }

        return newErrors;
    };

    // Check if form is valid
    const isFormValid = () => {
        const validationErrors = validateForm();
        return Object.keys(validationErrors).length === 0;
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        return parts.length ? parts.join(' ') : value;
    };

    // Format expiry date
    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
        }
        return v;
    };

    // Handle payment submission
    const handlePayment = async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.warning('Your cart is empty');
            navigate('/products');
            return;
        }

        if (!user) {
            toast.warning('Please log in to complete your purchase');
            navigate('/login');
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing with API call
        try {
            // Create order details
            const orderDetails = generateOrderDetails();
            const newOrderId = orderDetails.id;
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Save order to localStorage (simulating database)
            const saveSuccess = saveOrderToStorage(orderDetails);
            
            if (saveSuccess) {
                // Clear the cart
                await clearCart();
                
                // Show success
                setOrderId(newOrderId);
                setShowSuccessModal(true);
                
                toast.success('Payment successful! Order placed.');
            } else {
                toast.error('Failed to save order. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Continue shopping
    // const handleContinueShopping = () => {
    //     setShowSuccessModal(false);
    //     navigate('/products');
    // };

    // View order details
    const handleViewOrders = () => {
        setShowSuccessModal(false);
        // Navigate to orders page (you might want to create this)
        navigate('/products');
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Loading...
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Checking authentication...
                        </p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (cart.length === 0 && !showSuccessModal) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Cart is Empty
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Please add some products to your cart before checkout
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!user && !showSuccessModal) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: colors.background }}>
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <User size={32} style={{ color: colors.primary }} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
                            Login Required
                        </h1>
                        <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.7 }}>
                            Please log in to complete your purchase
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                            style={{ backgroundColor: colors.primary }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* User Info Banner */}
                    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6" style={{ borderColor: colors.accent }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User size={20} style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <h3 className="font-semibold" style={{ color: colors.text }}>
                                        {user.username}
                                    </h3>
                                    <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Items in Cart</p>
                                <p className="font-semibold" style={{ color: colors.primary }}>
                                    {getCartItemsCount()} items
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Payment Details */}
                        <div className="space-y-6">
                            {/* Payment Methods */}
                            <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: colors.accent }}>
                                <h2 className="text-xl font-semibold mb-6" style={{ color: colors.text }}>
                                    Payment Method
                                </h2>

                                <div className="space-y-4">
                                    {/* UPI Payment Option */}
                                    <div 
                                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: activePaymentMethod === 'upi' ? colors.primary : colors.accent,
                                            backgroundColor: activePaymentMethod === 'upi' ? '#A0E9FF20' : 'transparent'
                                        }}
                                        onClick={() => setActivePaymentMethod('upi')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${activePaymentMethod === 'upi' ? 'border-blue-500' : 'border-gray-300'
                                            }`}>
                                            {activePaymentMethod === 'upi' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <Smartphone size={24} style={{ color: colors.primary }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ color: colors.text }}>UPI Payment</h3>
                                            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Pay using UPI ID</p>
                                        </div>
                                    </div>

                                    {/* Card Payment Option */}
                                    <div 
                                        className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                                        style={{
                                            borderColor: activePaymentMethod === 'card' ? colors.primary : colors.accent,
                                            backgroundColor: activePaymentMethod === 'card' ? '#A0E9FF20' : 'transparent'
                                        }}
                                        onClick={() => setActivePaymentMethod('card')}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${activePaymentMethod === 'card' ? 'border-blue-500' : 'border-gray-300'
                                            }`}>
                                            {activePaymentMethod === 'card' && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            )}
                                        </div>
                                        <CreditCard size={24} style={{ color: colors.primary }} />
                                        <div>
                                            <h3 className="font-semibold" style={{ color: colors.text }}>Debit Card</h3>
                                            <p className="text-sm" style={{ color: colors.text, opacity: 0.7 }}>Pay using debit card</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Form */}
                                <form onSubmit={handlePayment} className="mt-6 space-y-4">
                                    {activePaymentMethod === 'upi' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                UPI ID
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.upiId}
                                                onChange={(e) => handleInputChange('upiId', e.target.value)}
                                                placeholder="username@upi"
                                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${errors.upiId
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                    }`}
                                            />
                                            {errors.upiId && (
                                                <p className="text-red-500 text-sm mt-1">{errors.upiId}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Example: username@oksbi, username@ybl, username@paytm
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Card Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardNumber}
                                                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${errors.cardNumber
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                />
                                                {errors.cardNumber && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Card Holder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.cardHolder}
                                                    onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase())}
                                                    placeholder="JOHN DOE"
                                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${errors.cardHolder
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                        }`}
                                                />
                                                {errors.cardHolder && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.expiryDate}
                                                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${errors.expiryDate
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                            }`}
                                                    />
                                                    {errors.expiryDate && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={formData.cvv}
                                                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                                        placeholder="123"
                                                        maxLength={4}
                                                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${errors.cvv
                                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                                            }`}
                                                    />
                                                    {errors.cvv && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Security Notice */}
                                    <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50" style={{ color: colors.text }}>
                                        <Lock size={16} style={{ color: colors.primary }} />
                                        <span>Your payment details are secure and encrypted</span>
                                    </div>

                                    {/* Pay Button */}
                                    <button
                                        type="submit"
                                        disabled={!isFormValid() || isProcessing || cart.length === 0}
                                        className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${!isFormValid() || isProcessing || cart.length === 0
                                            ? 'opacity-60 cursor-not-allowed bg-gray-400'
                                            : 'hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0'
                                            }`}
                                        style={{ 
                                            backgroundColor: (isFormValid() && !isProcessing && cart.length > 0) ? colors.primary : '#9CA3AF',
                                            background: (isFormValid() && !isProcessing && cart.length > 0) 
                                                ? 'linear-gradient(135deg, #00A9FF 0%, #0077B6 100%)' 
                                                : '#9CA3AF'
                                        }}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Shield size={20} />
                                                Pay ₹{total.toLocaleString()}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-28" style={{ borderColor: colors.accent }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                                        Order Summary
                                    </h2>
                                    <div className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                                        <Package size={16} />
                                        <span>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                                    </div>
                                </div>

                                {/* Cart Items */}
                                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                    {cart.map((item, index) => (
                                        <div key={`${item.productId}-${index}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="shrink-0">
                                                <img
                                                    src={item.productImage || item.image}
                                                    alt={item.productName || item.name}
                                                    className="w-12 h-12 object-contain rounded-lg bg-gray-100 p-1"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-sm truncate" style={{ color: colors.text }}>
                                                    {item.productName || item.name}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs">
                                                    <p style={{ color: colors.text, opacity: 0.7 }}>
                                                        Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                                    </p>
                                                    <p className="font-semibold" style={{ color: colors.primary }}>
                                                        ₹{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Price Breakdown */}
                                <div className="space-y-3 border-t pt-4" style={{ borderColor: colors.accent }}>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Subtotal</span>
                                        <span style={{ color: colors.text }}>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Shipping</span>
                                        <span style={{ color: colors.text }}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: colors.text, opacity: 0.7 }}>Tax (18%)</span>
                                        <span style={{ color: colors.text }}>₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold border-t pt-3" style={{ borderColor: colors.accent }}>
                                        <span style={{ color: colors.text }}>Total Amount</span>
                                        <span style={{ color: colors.primary }}>₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                {/* Free Shipping Message */}
                                {subtotal < 5000 && subtotal > 0 && (
                                    <div className="mt-4 p-3 rounded-lg text-center text-sm" 
                                         style={{ 
                                             backgroundColor: `${colors.accent}20`,
                                             color: colors.primary,
                                             border: `1px dashed ${colors.accent}`
                                         }}>
                                        <span className="font-medium">
                                            Add ₹{(5000 - subtotal).toLocaleString()} more for <strong>FREE Shipping</strong>!
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-tranparate bg-opacity-70 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 animate-slideUp">
                        <div className="text-center">
                            {/* Success Icon */}
                            <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-pulse">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>

                            {/* Success Message */}
                            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                                Payment Successful!
                            </h3>
                            <p className="text-gray-600 mb-2">
                                Thank you for your purchase, {user.username}!
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm font-semibold text-gray-800">
                                    Order ID: <span className="text-blue-600">{orderId}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Estimated delivery: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleViewOrders}
                                    className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg"
                                    style={{ 
                                        backgroundColor: colors.primary,
                                        background: 'linear-gradient(135deg, #00A9FF 0%, #0077B6 100%)'
                                    }}
                                >
                                    Shop More
                                </button>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CheckoutPage;