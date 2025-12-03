import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, User as UserIcon } from 'lucide-react';

const UserPage = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Color theme
    const colors = {
        primary: '#00A9FF',
        secondary: '#89CFF3',
        accent: '#A0E9FF',
        background: '#CDF5FD',
        text: '#0B0C10',
        error: '#EF4444'
    };

    // Check if user is logged in on component mount
    useEffect(() => {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            setCurrentUser(JSON.parse(userData));
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleUserButtonClick = () => {
        if (currentUser) {
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
        setIsDropdownOpen(false);
        navigate('/');
        // Optional: Show logout success message
        alert('You have been logged out successfully!');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsDropdownOpen(false);
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        setIsDropdownOpen(false);
    };

    // Styles
    const styles = {
        userButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '12px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            minWidth: '200px'
        },
        userButtonHover: {
            backgroundColor: `${colors.background}80`,
            transform: 'translateY(-1px)'
        },
        userIcon: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            transition: 'all 0.3s ease',
            flexShrink: 0
        },
        userText: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            flex: 1,
            minWidth: 0
        },
        userName: {
            fontSize: '14px',
            fontWeight: '600',
            color: currentUser ? colors.primary : '#374151',
            transition: 'color 0.3s ease',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px'
        },
        userSubtext: {
            fontSize: '12px',
            color: '#6B7280',
            fontWeight: '400'
        },
        dropdown: {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '220px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.accent}`,
            overflow: 'hidden',
            zIndex: 1000,
            opacity: 0,
            transform: 'translateY(-10px)',
            transition: 'all 0.3s ease'
        },
        dropdownOpen: {
            opacity: 1,
            transform: 'translateY(0)'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            textAlign: 'left',
            fontSize: '14px',
            color: colors.text
        },
        dropdownItemHover: {
            backgroundColor: `${colors.background}80`
        },
        dropdownIcon: {
            width: '16px',
            height: '16px',
            color: colors.primary
        },
        dropdownDivider: {
            height: '1px',
            backgroundColor: `${colors.accent}50`,
            margin: '4px 0'
        },
        userInfo: {
            padding: '12px 16px',
            backgroundColor: `${colors.background}30`,
            borderBottom: `1px solid ${colors.accent}30`
        },
        userEmail: {
            fontSize: '12px',
            color: '#6B7280',
            fontWeight: '400',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                style={styles.userButton}
                onClick={handleUserButtonClick}
                onMouseEnter={(e) => {
                    Object.assign(e.target.style, styles.userButtonHover);
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                }}
                aria-label={currentUser ? "User menu" : "Login or register"}
                aria-expanded={isDropdownOpen}
            >
                <div
                    style={styles.userIcon}
                    onMouseEnter={(e) => {
                        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    <User size={20} style={{ color: 'white' }} />
                </div>
                <div style={styles.userText}>
                    <span
                        style={styles.userName}
                        onMouseEnter={(e) => {
                            if (currentUser) {
                                e.target.style.color = colors.secondary;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentUser) {
                                e.target.style.color = colors.primary;
                            }
                        }}
                    >
                        {currentUser ? currentUser.name || 'Welcome' : 'Welcome'}
                    </span>
                    <span style={styles.userSubtext}>
                        {currentUser ? 'My Account' : 'Login / Register'}
                    </span>
                </div>
            </button>

            {/* Dropdown Menu */}
            {currentUser && (
                <div
                    style={{
                        ...styles.dropdown,
                        ...(isDropdownOpen ? styles.dropdownOpen : {})
                    }}
                >
                    {/* User Info Section */}
                    <div style={styles.userInfo}>
                        <div style={styles.userName}>
                            {currentUser.name || 'User'}
                        </div>
                        <div style={styles.userEmail}>
                            {currentUser.email}
                        </div>
                    </div>

                    {/* Dropdown Items */}
                    <button
                        style={styles.dropdownItem}
                        onClick={handleProfileClick}
                        onMouseEnter={(e) => {
                            Object.assign(e.target.style, styles.dropdownItemHover);
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <UserIcon style={styles.dropdownIcon} />
                        <span>My Profile</span>
                    </button>

                    <button
                        style={styles.dropdownItem}
                        onClick={handleSettingsClick}
                        onMouseEnter={(e) => {
                            Object.assign(e.target.style, styles.dropdownItemHover);
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <Settings style={styles.dropdownIcon} />
                        <span>Settings</span>
                    </button>

                    <div style={styles.dropdownDivider} />

                    <button
                        style={{
                            ...styles.dropdownItem,
                            color: colors.error
                        }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = `${colors.error}10`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        <LogOut style={{ ...styles.dropdownIcon, color: colors.error }} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserPage;