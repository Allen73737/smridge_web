import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Thermometer, Settings,
    Smartphone, FileText, LogOut, Menu, ChevronLeft,
    ExternalLink, Info
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const SidebarItem = ({ icon: Icon, label, path, isActive, isCollapsed, onClick }) => {
    return (
        <motion.div
            className={`${styles.sidebarItem} ${isActive ? styles.active : ''}`}
            onClick={onClick}
            whileHover={{ x: 5, backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
            whileTap={{ scale: 0.98 }}
        >
            <Icon size={20} className={styles.icon} />
            {!isCollapsed && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.label}
                >
                    {label}
                </motion.span>
            )}
            {isActive && <motion.div layoutId="activeglow" className={styles.activeGlow} />}
        </motion.div>
    );
};

import { useAuth } from '../../../context/AuthContext';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(true);
            else setIsSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/admin');
            } else if (user.role !== 'admin') {
                // If logged in as non-admin, redirect to main site or show error
                navigate('/?skipLoading=true');
            }
        }
    }, [user, loading, navigate]);

    if (loading) return null;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Thermometer, label: 'Fridge Status', path: '/admin/fridge' },
        { icon: Settings, label: 'Thresholds', path: '/admin/thresholds' },
        { icon: Smartphone, label: 'Build Manager', path: '/admin/apk' },
        { icon: Users, label: 'Team Settings', path: '/admin/team' },
        { icon: FileText, label: 'Activity Logs', path: '/admin/logs' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    return (
        <div className={styles.adminContainer}>
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.backdrop}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className={`${styles.sidebar} ${isMobile ? styles.mobileSidebar : ''} ${isSidebarOpen ? styles.open : styles.closed}`}
                initial={false}
                animate={{ 
                    width: isMobile ? '280px' : (isCollapsed ? 80 : 250),
                    x: isMobile && !isSidebarOpen ? '-100%' : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className={styles.sidebarHeader}>
                    {(!isCollapsed || isMobile) && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.logo}
                        >
                            SMRIDGE
                        </motion.h1>
                    )}
                    {!isMobile && (
                        <button
                            className={styles.collapseBtn}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    )}
                    {isMobile && (
                        <button
                            className={styles.collapseBtn}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                </div>

                <nav className={styles.navigation}>
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            isActive={location.pathname === item.path}
                            isCollapsed={isCollapsed && !isMobile}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setIsSidebarOpen(false);
                            }}
                        />
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <SidebarItem
                        icon={ExternalLink}
                        label="Go to Website"
                        path="/"
                        isActive={false}
                        isCollapsed={isCollapsed && !isMobile}
                        onClick={() => {
                            navigate('/?skipLoading=true');
                            if (isMobile) setIsSidebarOpen(false);
                        }}
                    />
                    <SidebarItem
                        icon={LogOut}
                        label="Logout"
                        path="#"
                        isActive={false}
                        isCollapsed={isCollapsed && !isMobile}
                        onClick={handleLogout}
                    />
                </div>
            </motion.aside>

            <main className={`${styles.mainContent} ${isMobile ? styles.mainMobile : ''}`}>
                <header className={styles.topBar}>
                    <div className={styles.topBarLeft}>
                        {isMobile && (
                            <button className={styles.mobileMenuBtn} onClick={() => setIsSidebarOpen(true)}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 className={styles.pageTitle}>
                            {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
                        {!isMobile && <span className={styles.userName}>{user?.name || 'Admin'}</span>}
                    </div>
                </header>

                <div className={styles.contentArea}>
                    <Outlet />
                </div>
            </main>

            {/* Premium Mobile Bottom Dock */}
            {isMobile && (
                <div className={styles.bottomDock}>
                    {[
                        { icon: LayoutDashboard, label: 'Dash', path: '/admin/dashboard' },
                        { icon: Users, label: 'Users', path: '/admin/users' },
                        { icon: Thermometer, label: 'Fridge', path: '/admin/fridge' },
                        { icon: Settings, label: 'Rules', path: '/admin/thresholds' },
                        { icon: Smartphone, label: 'Builds', path: '/admin/apk' },
                        { icon: FileText, label: 'Logs', path: '/admin/logs' },
                    ].map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div 
                                key={item.path}
                                className={`${styles.dockItem} ${isActive ? styles.active : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                {isActive && <motion.div layoutId="dockglow" className={styles.dockActiveGlow} />}
                                <item.icon size={22} className={styles.dockIcon} />
                                <span className={styles.dockLabel}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
