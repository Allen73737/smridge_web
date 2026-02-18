import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Thermometer, Settings,
    Smartphone, FileText, LogOut, Menu, ChevronLeft
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

    React.useEffect(() => {
        if (!loading && !user) {
            navigate('/admin');
        }
    }, [user, loading, navigate]);

    if (loading) return null;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Thermometer, label: 'Fridge Status', path: '/admin/fridge' },
        { icon: Settings, label: 'Thresholds', path: '/admin/thresholds' },
        { icon: Smartphone, label: 'APK Manager', path: '/admin/apk' },
        { icon: FileText, label: 'Activity Logs', path: '/admin/logs' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/admin');
    };

    return (
        <div className={styles.adminContainer}>
            <motion.aside
                className={styles.sidebar}
                animate={{ width: isCollapsed ? 80 : 250 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <div className={styles.sidebarHeader}>
                    {!isCollapsed && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={styles.logo}
                        >
                            SMRIDGE
                        </motion.h1>
                    )}
                    <button
                        className={styles.collapseBtn}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                <nav className={styles.navigation}>
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            isActive={location.pathname === item.path}
                            isCollapsed={isCollapsed}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <SidebarItem
                        icon={LogOut}
                        label="Logout"
                        path="#"
                        isActive={false}
                        isCollapsed={isCollapsed}
                        onClick={handleLogout}
                    />
                </div>
            </motion.aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <h2 className={styles.pageTitle}>
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                    </h2>
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
                        <span className={styles.userName}>{user?.name || 'Admin'}</span>
                    </div>
                </header>

                <div className={styles.contentArea}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
