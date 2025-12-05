// components/AdminLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight,
   HelpCircle,
  FileText,
  Shield,
  Database,
  RefreshCw,
  Check,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
  UserPlus,
  Server,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';

const API_URL = 'http://localhost:3001'; // JSON Server URL

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    today: 0
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const logoutRef = useRef(null);
  const notificationIntervalRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    notificationIntervalRef.current = setInterval(fetchNotifications, 30000);
    
    // Cleanup interval on unmount
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  // Update notification stats whenever notifications change
  useEffect(() => {
    updateNotificationStats();
  }, [notifications]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get(`${API_URL}/notifications?_sort=createdAt&_order=desc`);
      
      // Transform the data to match our format
      const transformedNotifications = response.data.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: getNotificationTitle(notification.type),
        message: getNotificationMessage(notification),
        time: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
        unread: !notification.read,
        data: notification.data || {},
        createdAt: notification.createdAt,
        icon: getNotificationIcon(notification.type)
      }));
      
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Fallback to mock data if API fails
      if (notifications.length === 0) {
        loadMockNotifications();
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load mock notifications (fallback)
  const loadMockNotifications = () => {
    const mockNotifications = [
      { 
        id: 1, 
        type: 'order', 
        title: 'New Order Received', 
        message: 'Order #1234 has been placed by John Doe', 
        time: '5 min ago', 
        unread: true,
        data: { orderId: 1234, customer: 'John Doe' },
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        icon: 'shopping-cart'
      },
      { 
        id: 2, 
        type: 'stock', 
        title: 'Low Stock Alert', 
        message: 'AquaPure RO System is low in stock (Only 5 left)', 
        time: '2 hours ago', 
        unread: true,
        data: { productId: 1, productName: 'AquaPure RO System', stock: 5 },
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        icon: 'alert'
      },
      { 
        id: 3, 
        type: 'user', 
        title: 'New User Registered', 
        message: 'Jane Smith has created an account', 
        time: '1 day ago', 
        unread: false,
        data: { userId: 45, userName: 'Jane Smith' },
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
        icon: 'user'
      },
      { 
        id: 4, 
        type: 'system', 
        title: 'System Update', 
        message: 'Database backup completed successfully', 
        time: '2 days ago', 
        unread: false,
        data: { backupSize: '2.4 GB', duration: '15 minutes' },
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        icon: 'server'
      },
    ];
    setNotifications(mockNotifications);
  };

  // Update notification statistics
  const updateNotificationStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => n.unread).length;
    const today = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      const today = new Date();
      return notificationDate.toDateString() === today.toDateString();
    }).length;
    
    setNotificationStats({ total, unread, today });
  };

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Update locally first for immediate feedback
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, unread: false } : notif
      ));
      
      // Try to update in the backend if using API
      await axios.patch(`${API_URL}/notifications/${notificationId}`, {
        read: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Update locally first
      setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
      
      // Try to update all in backend
      const unreadIds = notifications.filter(n => n.unread).map(n => n.id);
      await Promise.all(
        unreadIds.map(id => 
          axios.patch(`${API_URL}/notifications/${id}`, {
            read: true,
            readAt: new Date().toISOString()
          })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation(); // Prevent triggering click event on parent
    
    try {
      // Remove locally first
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Try to delete from backend
      await axios.delete(`${API_URL}/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      // Get all notification IDs
      const notificationIds = notifications.map(n => n.id);
      
      // Delete all from backend first
      await Promise.all(
        notificationIds.map(id => axios.delete(`${API_URL}/notifications/${id}`))
      );
      
      // Clear locally
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      
      // If API fails, clear locally anyway
      setNotifications([]);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (notification.unread) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        navigate(`/admin/orders/${notification.data.orderId || ''}`);
        break;
      case 'stock':
        navigate('/admin/products');
        break;
      case 'user':
        navigate(`/admin/users/${notification.data.userId || ''}`);
        break;
      case 'system':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
    
    // Close dropdown
    setDropdownOpen(false);
  };

  // Get notification title based on type
  const getNotificationTitle = (type) => {
    switch (type) {
      case 'order': return 'New Order';
      case 'stock': return 'Stock Alert';
      case 'user': return 'New User';
      case 'system': return 'System Update';
      default: return 'Notification';
    }
  };

  // Get notification message
  const getNotificationMessage = (notification) => {
    if (notification.message) return notification.message;
    
    switch (notification.type) {
      case 'order':
        return `Order #${notification.data.orderId} has been placed`;
      case 'stock':
        return `${notification.data.productName} is low in stock`;
      case 'user':
        return `${notification.data.userName} has registered`;
      case 'system':
        return 'System update completed';
      default:
        return 'New notification';
    }
  };

  // Get notification icon component
  const getNotificationIcon = (type) => {
    const iconProps = { size: 16, className: 'mr-3' };
    
    switch (type) {
      case 'order':
        return <ShoppingCart {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'stock':
        return <AlertCircle {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'user':
        return <UserPlus {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case 'system':
        return <Server {...iconProps} className={`${iconProps.className} text-purple-500`} />;
      default:
        return <Bell {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  // Get notification priority color
  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'border-l-blue-500';
      case 'stock': return 'border-l-yellow-500';
      case 'user': return 'border-l-green-500';
      case 'system': return 'border-l-purple-500';
      default: return 'border-l-gray-500';
    }
  };

  // Create a mock notification (for testing)
  const createMockNotification = async () => {
    const types = ['order', 'stock', 'user', 'system'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const mockNotification = {
      type,
      title: getNotificationTitle(type),
      message: `This is a test ${type} notification`,
      read: false,
      data: {
        test: true,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };
    
    try {
      // Try to save to API
      const response = await axios.post(`${API_URL}/notifications`, mockNotification);
      
      // Add to local state
      const newNotification = {
        id: response.data.id,
        ...mockNotification,
        unread: true,
        time: 'Just now',
        icon: getNotificationIcon(type)
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    } catch (error) {
      console.error('Error creating notification:', error);
      
      // Fallback to local only
      const newNotification = {
        id: Date.now(),
        ...mockNotification,
        unread: true,
        time: 'Just now',
        icon: getNotificationIcon(type)
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Handle search in notifications
  const filteredNotifications = notifications.filter(notification => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.type.toLowerCase().includes(query)
    );
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { id: 'products', label: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { id: 'users', label: 'Users', icon: <Users size={20} />, path: '/admin/users' },
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const item = navItems.find(item => currentPath.includes(item.id));
    return item ? item.label : 'Dashboard';
  };

  const getPageDescription = () => {
    const currentPath = location.pathname;
    if (currentPath.includes('dashboard')) return 'Overview and analytics';
    if (currentPath.includes('products')) return 'Manage product catalog';
    if (currentPath.includes('orders')) return 'View and process orders';
    if (currentPath.includes('users')) return 'Manage user accounts';
    return 'Admin Panel';
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    // Animate logout button
    const button = logoutRef.current;
    if (button) {
      button.style.transform = 'scale(0.95)';
      button.style.opacity = '0.7';
    }

    // Show logout animation for 1.5 seconds
    setTimeout(() => {
      logout();
      navigate('/login');
      setIsLoggingOut(false);
    }, 1500);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-[#CDF5FD]'}`}>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow dark:bg-gray-800 dark:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-linear-to-b from-[#00A9FF] to-[#89CFF3] 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:translate-x-0 lg:block
          dark:from-gray-800 dark:to-gray-900
        `}>
          {/* Navigation */}
          <nav className="p-4">
            <div className="mb-4 px-4">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Main Menu</p>
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      group w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 relative
                      ${isActive
                        ? 'bg-[#A0E9FF] text-slate-800 font-medium shadow-sm'
                        : 'text-white/90 hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="mr-3 group-hover:scale-110 transition-transform">{item.icon}</span>
                    {item.label}
                    <ChevronRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.id === 'dashboard' && location.pathname === '/admin/dashboard' && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 dark:border-gray-700">
            {/* <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors mb-2"
            >
              <Settings size={18} className="mr-3" />
              Settings
            </button> */}
            <button 
              ref={logoutRef}
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300
                ${isLoggingOut 
                  ? 'bg-linear-to-r from-red-500 to-orange-500 animate-pulse' 
                  : 'bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                }
                text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
              `}
            >
              {isLoggingOut ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Logging Out...
                </>
              ) : (
                <>
                  <LogOut size={18} className="mr-2" />
                  Logout
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-hidden">
          {/* Top Bar */}
          <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} border-b sticky top-0 z-30`}>
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 mr-4 transition-colors"
                  >
                    <Menu size={20} className={darkMode ? 'text-gray-300' : 'text-slate-600'} />
                  </button>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {getPageTitle()}
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      {getPageDescription()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search Bar */}
                  <div className="relative hidden md:block">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`
                        pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A9FF] 
                        ${darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'border border-slate-300'
                        }
                      `}
                    />
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <Bell size={20} className={darkMode ? 'text-gray-300' : 'text-slate-600'} />
                      {notificationStats.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                          {notificationStats.unread > 9 ? '9+' : notificationStats.unread}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {dropdownOpen && (
                      <div className={`absolute right-0 mt-2 w-96 max-h-[80vh] rounded-xl shadow-xl z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              Notifications
                            </h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={createMockNotification}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                                title="Create test notification"
                              >
                                Test
                              </button>
                              <button
                                onClick={clearAllNotifications}
                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                                title="Clear all notifications"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
                                {notificationStats.total} total
                              </span>
                              <span className="text-blue-500 font-medium">
                                {notificationStats.unread} unread
                              </span>
                              <span className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
                                {notificationStats.today} today
                              </span>
                            </div>
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#00A9FF] hover:text-[#0088CC] flex items-center"
                              disabled={notificationStats.unread === 0}
                            >
                              <Check size={14} className="mr-1" />
                              Mark all read
                            </button>
                          </div>
                        </div>
                        
                        {/* Search within notifications */}
                        <div className="p-3 border-b border-slate-100 dark:border-gray-700">
                          <div className="relative">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-slate-400'}`} size={16} />
                            <input
                              type="text"
                              placeholder="Search notifications..."
                              className={`
                                w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00A9FF]
                                ${darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                  : 'border border-slate-300'
                                }
                              `}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                // Search logic is handled by filteredNotifications
                                e.stopPropagation();
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                          {loadingNotifications ? (
                            <div className="p-8 text-center">
                              <RefreshCw size={24} className="mx-auto text-gray-400 mb-2 animate-spin" />
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading notifications...</p>
                            </div>
                          ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`
                                  p-4 border-b cursor-pointer transition-all duration-200 group
                                  ${darkMode 
                                    ? 'border-gray-700 hover:bg-gray-700' 
                                    : 'border-slate-100 hover:bg-slate-50'
                                  }
                                  ${notification.unread 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4' 
                                    : 'border-l-4'
                                  }
                                  ${getNotificationColor(notification.type)}
                                `}
                              >
                                <div className="flex items-start">
                                  <div className="shrink-0">
                                    {notification.icon || getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                        {notification.title}
                                        {notification.unread && (
                                          <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        )}
                                      </p>
                                      <div className="flex items-center space-x-2 ml-2">
                                        {notification.unread && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              markAsRead(notification.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition-opacity"
                                            title="Mark as read"
                                          >
                                            <CheckCircle size={14} className="text-green-500" />
                                          </button>
                                        )}
                                        <button
                                          onClick={(e) => deleteNotification(notification.id, e)}
                                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-opacity"
                                          title="Delete notification"
                                        >
                                          <X size={14} className="text-red-500" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-gray-500">
                                        {notification.time}
                                      </p>
                                      <span className={`
                                        text-xs px-2 py-1 rounded-full capitalize
                                        ${notification.type === 'order' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                                          notification.type === 'stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                          notification.type === 'user' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}
                                      `}>
                                        {notification.type}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No notifications found</p>
                              <button
                                onClick={createMockNotification}
                                className="mt-2 text-sm text-[#00A9FF] hover:text-[#0088CC]"
                              >
                                Create test notification
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} rounded-b-xl border-t ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                          <button
                            onClick={() => {
                              navigate('/admin/notifications');
                              setDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-center text-sm text-[#00A9FF] hover:text-[#0088CC]"
                          >
                            View all notifications
                            <ExternalLink size={14} className="ml-2" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#00A9FF] to-[#89CFF3] flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Administrator</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className={`p-4 sm:p-6 lg:p-8 h-[calc(100vh-4rem)] overflow-y-auto ${darkMode ? 'bg-gray-900' : ''}`}>
            {/* System Status Bar */}
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
                    <span className={darkMode ? 'text-gray-300' : 'text-slate-700'}>System Online</span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <Database size={16} className="mr-2 text-blue-500" />
                    <span className={darkMode ? 'text-gray-300' : 'text-slate-700'}>Notifications: {notificationStats.total} ({notificationStats.unread} new)</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center text-sm text-[#00A9FF] hover:text-[#0088CC]">
                    <HelpCircle size={16} className="mr-1" />
                    Help
                  </button>
                  <button className="flex items-center text-sm text-[#00A9FF] hover:text-[#0088CC]">
                    <FileText size={16} className="mr-1" />
                    Docs
                  </button>
                  <button className="flex items-center text-sm text-[#00A9FF] hover:text-[#0088CC]">
                    <Shield size={16} className="mr-1" />
                    Security
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;