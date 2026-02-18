import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, AlertTriangle, User, FileText, Filter } from 'lucide-react';
import styles from './ActivityLogs.module.css';
import api from '../../../services/api';

const LogItem = ({ type, action, user, time, details, index }) => {
    const icons = {
        auth: User,
        system: FileText,
        alert: AlertTriangle,
        admin: Shield
    };

    const colors = {
        auth: '#00f0ff',
        system: '#00ff9d',
        alert: '#ff0055',
        admin: '#7000ff'
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
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/logs');
                setLogs(data);
            } catch (error) {
                console.error("Failed to fetch logs");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = filter === 'all'
        ? logs
        : logs.filter(log => {
            if (filter === 'auth') return ['LOGIN', 'REGISTER'].includes(log.action);
            if (filter === 'admin') return ['DELETE_USER', 'BLOCK_USER', 'UPDATE_ROLE', 'UPDATE_THRESHOLD', 'UPLOAD_APK'].includes(log.action);
            return true;
        });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Activity Logs</h1>
                <div className={styles.controls}>
                    <Filter size={18} className={styles.filterIcon} />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Events</option>
                        <option value="auth">Authentication</option>
                        <option value="admin">Admin Actions</option>
                    </select>
                </div>
            </div>

            <div className={styles.logsList}>
                <AnimatePresence mode="wait">
                    {filteredLogs.map((log, index) => (
                        <LogItem
                            key={log._id}
                            type={['LOGIN', 'REGISTER'].includes(log.action) ? 'auth' : 'admin'}
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
