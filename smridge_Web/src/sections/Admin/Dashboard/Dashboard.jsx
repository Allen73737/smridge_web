import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Wifi, AlertTriangle, Activity } from 'lucide-react';
import styles from './Dashboard.module.css';
import api from '../../../services/api';
import socket from '../../../services/socket';

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
    return (
        <motion.div
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5, boxShadow: `0 0 20px ${color}40` }}
            style={{ borderColor: `${color}40` }}
        >
            <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20`, color: color }}>
                <Icon size={24} />
            </div>
            <div className={styles.statInfo}>
                <h3>{title}</h3>
                <div className={styles.valueWrapper}>
                    <motion.span
                        className={styles.value}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: delay + 0.5 }}
                    >
                        {value}
                    </motion.span>
                </div>
            </div>
            <div className={styles.miniGraph}>
                {[40, 60, 30, 70, 50, 80, 60].map((h, i) => (
                    <motion.div
                        key={i}
                        className={styles.bar}
                        style={{ backgroundColor: color }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 + (i * 0.1) }}
                    />
                ))}
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const [statsData, setStatsData] = useState({
        users: 0,
        fridges: 0,
        alerts: 0,
        freshness: 0,
        energyTrends: [],
        activityTrends: []
    });

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/fridge/admin/stats');
            setStatsData({
                users: data.totalUsers,
                fridges: data.activeFridges,
                alerts: data.alertCount,
                freshness: data.avgFreshness,
                energyTrends: data.energyTrends || [],
                activityTrends: data.activityTrends || []
            });
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
        socket.on('fridgeUpdated', fetchStats);
        socket.on('thresholdUpdated', fetchStats);
        socket.on('statsUpdated', (newStats) => {
            setStatsData(prev => ({ ...prev, ...newStats }));
        });

        return () => {
            socket.off('fridgeUpdated');
            socket.off('thresholdUpdated');
            socket.off('statsUpdated');
        };
    }, []);

    const stats = [
        { title: "Total Users", value: statsData.users, icon: Users, color: "#00f0ff" },
        { title: "Active Fridges", value: statsData.fridges, icon: Wifi, color: "#00ff9d" },
        { title: "System Alerts", value: statsData.alerts, icon: AlertTriangle, color: "#ff0055" },
        { title: "Avg Freshness", value: `${statsData.freshness}%`, icon: Activity, color: "#7000ff" },
    ];

    return (
        <div className={styles.dashboardContainer}>
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <h1>System Overview</h1>
                <p>Real-time monitoring of Smridge Ecosystem</p>
            </motion.div>

            <div className={styles.topRow}>
                <div className={styles.statsSection}>
                    <div className={styles.statsGrid}>
                        {stats.map((stat, i) => (
                            <StatCard key={i} {...stat} delay={i * 0.1} />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.chartsRow}>
                <motion.div
                    className={styles.chartCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3>Energy Consumption Trends</h3>
                    <div className={styles.chartPlaceholder}>
                        <div className={styles.barChartContainer}>
                            {(statsData.energyTrends || []).slice(-7).map((day, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.energyBar}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(day.totalEnergy * 10, 100)}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    title={`${day._id}: ${day.totalEnergy.toFixed(2)} W`}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.chartCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3>Ecosystem Activity (Last 24h)</h3>
                    <div className={styles.chartPlaceholder}>
                        <div className={styles.barChartContainer}>
                            {(statsData.activityTrends || []).map((hour, i) => (
                                <motion.div
                                    key={i}
                                    className={styles.activityBar}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(hour.count * 10, 100)}%` }}
                                    transition={{ duration: 1, delay: i * 0.05 }}
                                    title={`Hour ${hour._id}: ${hour.count} events`}
                                />
                            ))}
                            {statsData.activityTrends.length === 0 && (
                                <div className={styles.emptyChart}>No activity recorded</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
