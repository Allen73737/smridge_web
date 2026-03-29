import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, AlertTriangle, User, FileText, Filter, RefreshCw } from 'lucide-react';
import styles from './ActivityLogs.module.css';
import api from '../../../services/api';
import socket from '../../../services/socket';

const LogItem = ({ type, action, user, time, details, index }) => {
    const icons = {
        auth: User,
        system: FileText,
        alert: AlertTriangle,
        admin: Shield,
        inventory: FileText
    };

    const colors = {
        auth: '#00f0ff',
        system: '#00ff9d',
        alert: '#ff0055',
        admin: '#7000ff',
        inventory: '#ffaa00'
    };

    const Icon = icons[type] || FileText;
    const color = colors[type] || '#fff';

    return (
        <motion.div
            className={styles.logItem}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{ borderLeftColor: color }}
        >
            <div className={styles.logIcon} style={{ color: color, backgroundColor: `${color}15` }}>
                <Icon size={18} />
            </div>
            <div className={styles.logContent}>
                <div className={styles.logHeader}>
                    <span className={styles.actionTitle} style={{ color: color }}>{action}</span>
                    <span className={styles.time}><Clock size={12} /> {time}</span>
                </div>
                <div className={styles.details}>{details}</div>
                <div className={styles.user}>by {user}</div>
            </div>
        </motion.div>
    );
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [logsRes, usersRes] = await Promise.all([
                api.get('/logs'),
                api.get('/users')
            ]);
            setLogs(logsRes.data);
            setUsers(usersRes.data);
        } catch {
            console.error("Failed to fetch logs or users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();

        // Socket listeners
        socket.on('logAdded', (newLog) => {
            setLogs(prev => [newLog, ...prev]);
        });

        socket.on('userAdded', (newUser) => {
            setUsers(prev => [newUser, ...prev]);
        });

        return () => {
            socket.off('logAdded');
            socket.off('userAdded');
        };
    }, []);

    const filteredLogs = logs.filter(log => {
        // Category Filter
        let categoryMatch = true;
        if (filter === 'auth') categoryMatch = ['LOGIN', 'REGISTER'].includes(log.action);
        else if (filter === 'admin') categoryMatch = ['DELETE_USER', 'BLOCK_USER', 'UPDATE_ROLE', 'UPDATE_THRESHOLD', 'UPLOAD_APK'].includes(log.action);
        else if (filter === 'inventory') categoryMatch = ['ADD_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM'].includes(log.action);
        else if (filter === 'alerts') categoryMatch = ['SPOILAGE_ALERT', 'TEMP_ALERT'].includes(log.action);
        else if (filter === 'user_only') {
            const isSmridge = log.userId?.name?.toLowerCase().includes('smridge');
            categoryMatch = log.role === 'user' && !isSmridge;
        }

        // User Filter
        let userMatch = true;
        if (userFilter !== 'all') {
            userMatch = log.userId?._id === userFilter;
        }

        return categoryMatch && userMatch;
    });

    const getLogType = (action) => {
        if (['LOGIN', 'REGISTER'].includes(action)) return 'auth';
        if (['ADD_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM'].includes(action)) return 'inventory';
        if (['SPOILAGE_ALERT', 'TEMP_ALERT'].includes(action)) return 'alert';
        return 'admin';
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Activity Logs</h1>
                <div className={styles.controls}>
                    <button 
                        onClick={fetchInitialData}
                        className={styles.refreshBtn}
                        title="Refresh Data"
                    >
                        <RefreshCw size={18} className={loading ? styles.spinning : ''} />
                    </button>
                    <Filter size={18} className={styles.filterIcon} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Categories</option>
                        <option value="user_only">User Activity Only</option>
                        <option value="auth">Authentication</option>
                        <option value="admin">Admin Actions</option>
                        <option value="inventory">Inventory Updates</option>
                        <option value="alerts">System Alerts</option>
                    </select>

                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Users</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.logsList}>
                <AnimatePresence mode="wait">
                    {filteredLogs.map((log, index) => (
                        <LogItem
                            key={log._id}
                            type={getLogType(log.action)}
                            action={log.action}
                            user={log.userId?.name || 'System'}
                            time={new Date(log.timestamp).toLocaleTimeString()}
                            details={log.details}
                            index={index}
                        />
                    ))}
                </AnimatePresence>
                {filteredLogs.length === 0 && (
                    <div className={styles.emptyState}>
                        {loading ? 'Loading logs...' : 'No logs found for this filter.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
