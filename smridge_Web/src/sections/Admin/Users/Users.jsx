import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Trash2, Shield, ShieldOff, MoreVertical, Crown } from 'lucide-react';
import styles from './Users.module.css';

import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import ConfirmDialog from '../../../components/Common/ConfirmDialog/ConfirmDialog';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [expandedUserId, setExpandedUserId] = useState(null);
    const { showToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, user: null });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (user) => {
        if (user.role === 'admin') return;
        setConfirmConfig({ isOpen: true, user });
    };

    const performDelete = async () => {
        const user = confirmConfig.user;
        if (!user) return;

        try {
            await api.delete(`/users/${user._id}`);
            setUsers(users.filter(u => u._id !== user._id));
            showToast(`User ${user.name} and all associated data deleted successfully`, 'success');
        } catch {
            console.error("Failed to delete user");
            showToast('Failed to delete user. Please check your connection.', 'error');
        } finally {
            setConfirmConfig({ isOpen: false, user: null });
        }
    };

    const handleBlock = async (user) => {
        if (user.role === 'admin') return;
        try {
            const { data } = await api.put(`/users/block/${user._id}`);
            setUsers(users.map(u => u._id === user._id ? data : u));
            showToast(`${user.name} has been ${data.isBlocked ? 'blocked' : 'unblocked'}`, 'info');
        } catch {
            console.error("Failed to block user");
            showToast('Failed to update user status', 'error');
        }
    };

    const handleToggleSimulation = async (user) => {
        try {
            const { data } = await api.put(`/users/simulation/${user._id}`);
            setUsers(users.map(u => u._id === user._id ? data : u));
            showToast(`Simulation ${data.isSimulationEnabled ? 'enabled' : 'disabled'} for ${user.name}`, 'info');
        } catch {
            console.error("Failed to toggle simulation");
            showToast('Failed to update simulation status', 'error');
        }
    };

    const toggleDetails = (userId) => {
        setExpandedUserId(expandedUserId === userId ? null : userId);
    };

    const isOnline = (lastActive) => {
        if (!lastActive) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (new Date() - new Date(lastActive)) < fiveMinutes;
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <motion.div 
                    className={styles.loader}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p>Syncing User Database...</p>
            </div>
        );
    }

    return (
        <div className={styles.usersContainer}>
            <div className={styles.header}>
                <h1>User Management</h1>
                <div className={styles.searchBar}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                {!isMobile ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status / Activity</th>
                                <th>Last Active</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((user, index) => (
                                    <React.Fragment key={user._id}>
                                        <motion.tr
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`${styles.row} ${user.role === 'admin' ? styles.adminRow : ''} ${expandedUserId === user._id ? styles.expandedRow : ''}`}
                                        >
                                            <td>
                                                <div className={styles.userInfo}>
                                                    <div className={`${styles.avatar} ${user.role === 'admin' ? styles.adminAvatar : ''}`}>
                                                        {user.role === 'admin' ? <Crown size={12} /> : user.name.charAt(0)}
                                                    </div>
                                                    <div className={styles.userMeta}>
                                                        <span className={styles.userName}>{user.name}</span>
                                                        <span className={styles.userEmail}>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.admin : ''}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.statusGroup}>
                                                    <span className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                                    </span>
                                                    <span className={`${styles.indicator} ${isOnline(user.lastActive) ? styles.online : styles.offline}`}>
                                                        {isOnline(user.lastActive) ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.timeInfo}>
                                                    <span>{new Date(user.lastActive).toLocaleDateString()}</span>
                                                    <small>{new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <button 
                                                        className={`${styles.actionBtn} ${expandedUserId === user._id ? styles.activeEye : ''}`}
                                                        title="View Details"
                                                        onClick={() => toggleDetails(user._id)}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button 
                                                        className={`${styles.actionBtn} ${user.role === 'admin' ? styles.disabled : ''}`} 
                                                        onClick={() => handleBlock(user)}
                                                        disabled={user.role === 'admin'}
                                                        title={user.isBlocked ? "Unblock User" : "Block User"}
                                                    >
                                                        {user.isBlocked ? <ShieldOff size={16} color="#ff0055" /> : <Shield size={16} />}
                                                    </button>
                                                    <button 
                                                        className={`${styles.actionBtn} ${styles.delete} ${user.role === 'admin' ? styles.disabled : ''}`} 
                                                        onClick={() => handleDelete(user)}
                                                        disabled={user.role === 'admin'}
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                        <AnimatePresence>
                                            {expandedUserId === user._id && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className={styles.detailsRow}
                                                >
                                                    <td colSpan="5">
                                                        <div className={styles.detailsContent}>
                                                            <div className={styles.detailItem}>
                                                                <div className={styles.detailLabel}>
                                                                    <h3>Data Simulation</h3>
                                                                    <p>Enable artificial sensor drift for this user when hardware is offline.</p>
                                                                </div>
                                                                <button 
                                                                    className={`${styles.simulationToggle} ${user.isSimulationEnabled ? styles.simActive : ''}`}
                                                                    onClick={() => handleToggleSimulation(user)}
                                                                >
                                                                    <div className={styles.toggleTrack}>
                                                                        <div className={styles.toggleKnob} />
                                                                    </div>
                                                                    <span>{user.isSimulationEnabled ? 'Simulation ON' : 'Simulation OFF'}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.userGrid}>
                        <AnimatePresence>
                            {filteredUsers.map((user, index) => (
                                <motion.div
                                    key={user._id}
                                    className={`${styles.userCard} ${user.role === 'admin' ? styles.adminCard : ''} ${expandedUserId === user._id ? styles.expandedCard : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.02 }}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.userInfo}>
                                            <div className={`${styles.avatar} ${user.role === 'admin' ? styles.adminAvatar : ''}`}>
                                                {user.role === 'admin' ? <Crown size={14} /> : user.name.charAt(0)}
                                            </div>
                                            <div className={styles.userMeta}>
                                                <span className={styles.userName}>{user.name}</span>
                                                <span className={styles.userEmail}>{user.email}</span>
                                            </div>
                                        </div>
                                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.admin : ''}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className={styles.cardStats}>
                                        <div className={styles.statusGroup}>
                                            <span className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                            <span className={`${styles.indicator} ${isOnline(user.lastActive) ? styles.online : styles.offline}`}>
                                                {isOnline(user.lastActive) ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <div className={styles.timeInfo}>
                                            <span>{new Date(user.lastActive).toLocaleDateString()}</span>
                                            <small>{new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        </div>
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button 
                                            className={`${styles.actionBtnMobile} ${expandedUserId === user._id ? styles.activeEyeMobile : ''}`}
                                            onClick={() => toggleDetails(user._id)}
                                        >
                                            <Eye size={18} /> {expandedUserId === user._id ? 'Close' : 'Details'}
                                        </button>
                                        <button 
                                            className={`${styles.actionBtnMobile} ${user.role === 'admin' ? styles.disabled : ''}`} 
                                            onClick={() => handleBlock(user)}
                                            disabled={user.role === 'admin'}
                                        >
                                            {user.isBlocked ? <ShieldOff size={18} color="#ff0055" /> : <Shield size={18} />}
                                            {user.isBlocked ? 'Unblock' : 'Block'}
                                        </button>
                                        <button 
                                            className={`${styles.actionBtnMobile} ${styles.delete} ${user.role === 'admin' ? styles.disabled : ''}`} 
                                            onClick={() => handleDelete(user)}
                                            disabled={user.role === 'admin'}
                                        >
                                            <Trash2 size={18} /> Remove
                                        </button>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {expandedUserId === user._id && (
                                            <motion.div 
                                                className={styles.mobileDetails}
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <div className={styles.detailLabel}>
                                                    <h3>Simulation Settings</h3>
                                                    <p>Control sensor simulation for testing purposes.</p>
                                                </div>
                                                <button 
                                                    className={`${styles.simulationToggle} ${user.isSimulationEnabled ? styles.simActive : ''}`}
                                                    onClick={() => handleToggleSimulation(user)}
                                                >
                                                    <div className={styles.toggleTrack}>
                                                        <div className={styles.toggleKnob} />
                                                    </div>
                                                    <span>{user.isSimulationEnabled ? 'Enabled' : 'Disabled'}</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <ConfirmDialog 
                isOpen={confirmConfig.isOpen}
                title="Delete User Account?"
                message={`Are you sure you want to delete ${confirmConfig.user?.name}? This will permanently remove their profile, sensor logs, and all associated ecosystem data. This action is irreversible.`}
                onConfirm={performDelete}
                onCancel={() => setConfirmConfig({ isOpen: false, user: null })}
                confirmText="Delete Permanently"
                type="danger"
            />
        </div>
    );
};

export default UsersManagement;
