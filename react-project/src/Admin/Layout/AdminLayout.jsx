
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
  Home,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  User,
  Moon,
  Sun,
  HelpCircle,
  FileText,
  Shield,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const logoutRef = useRef(null);

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

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: 'New Order Received', message: 'Order #1234 has been placed', time: '5 min ago', unread: true },
      { id: 2, title: 'Low Stock Alert', message: 'AquaPure RO System is low in stock', time: '2 hours ago', unread: true },
      { id: 3, title: 'New User Registered', message: 'John Doe has created an account', time: '1 day ago', unread: false },
      { id: 4, title: 'System Update', message: 'Database backup completed successfully', time: '2 days ago', unread: false },
    ];
    setNotifications(mockNotifications);
  }, []);

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

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
          {/* Sidebar Header */}
          {/* <div className="p-6 border-b border-white/20 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Home size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Everlast Water Solutions</h1>
                <p className="text-xs text-white/80">Premium Water Purifiers</p>
              </div>
            </div>
          </div> */}

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
            <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg transition-colors mb-2"
            >
              <Settings size={18} className="mr-3" />
              Settings
            </button>
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

                  {/* Dark Mode Toggle */}
                  {/* <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-100 text-gray-700'} hover:opacity-90 transition-opacity`}
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button> */}

                  {/* Notifications */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`p-2 rounded-lg relative ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'} transition-colors`}
                    >
                      <Bell size={20} className={darkMode ? 'text-gray-300' : 'text-slate-600'} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {dropdownOpen && (
                      <div className={`absolute right-0 mt-2 w-80 rounded-xl shadow-xl z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-slate-100'}`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                              Notifications
                            </h3>
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#00A9FF] hover:text-[#0088CC]"
                            >
                              Mark all as read
                            </button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-slate-100 hover:bg-slate-50'} transition-colors cursor-pointer ${notification.unread ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                              >
                                <div className="flex items-start">
                                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${notification.unread ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                  <div className="flex-1">
                                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {notification.title}
                                    </p>
                                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No notifications</p>
                            </div>
                          )}
                        </div>
                        <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} rounded-b-xl`}>
                          {/* <button
                            onClick={() => navigate('/admin/notifications')}
                            className="w-full text-center text-sm text-[#00A9FF] hover:text-[#0088CC]"
                          >
                            View all notifications
                          </button> */}
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
                    <span className={darkMode ? 'text-gray-300' : 'text-slate-700'}>JSON Server Connected</span>
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