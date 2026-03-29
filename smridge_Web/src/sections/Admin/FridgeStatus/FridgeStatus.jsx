import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Wind, DoorOpen, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './FridgeStatus.module.css';
import Fridge3D from '../../../components/Admin/Fridge3D/Fridge3D';
import api from '../../../services/api';
import socket from '../../../services/socket';

const FridgeCard = ({ id, user, freshness, temp, gas, doorOpen, status, lastPulse, fullData }) => {
    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className={styles.visualSection}>
                <Fridge3D status={fullData} />
            </div>

            <div className={styles.infoSection}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleInfo}>
                        <h3>{user}'s Smridge</h3>
                        <span className={`${styles.statusBadge} ${status === 'online' ? styles.online : styles.offline}`}>
                            {status === 'online' ? '● Online' : '○ Offline'}
                        </span>
                    </div>
                    <div className={styles.headerBadges}>
                        <span className={`${styles.statusDot} ${doorOpen ? styles.warning : styles.good}`} />
                        <span className={styles.unitId}>#{id.slice(-4)}</span>
                    </div>
                </div>

                <div className={styles.metrics}>
                    <div className={styles.metricRow}>
                        <div className={styles.metricLabel}><Thermometer size={14} /> Temp</div>
                        <div className={styles.metricValue}>{temp}°C</div>
                    </div>
                    <div className={styles.metricRow}>
                        <div className={styles.metricLabel}><Wind size={14} /> Gas (PPM)</div>
                        <div className={styles.metricValue}>{gas}</div>
                    </div>
                    <div className={styles.metricRow}>
                        <div className={styles.metricLabel}><DoorOpen size={14} /> Door</div>
                        <div className={`${styles.metricValue} ${doorOpen ? styles.alert : ''}`}>
                            {doorOpen ? 'OPEN' : 'Closed'}
                        </div>
                    </div>
                </div>

                <div className={styles.freshnessContainer}>
                    <div className={styles.freshnessLabel}>
                        <span className={styles.flexItem}>Overall Freshness</span>
                        <span className={styles.flexItem}>{freshness}%</span>
                    </div>
                    <div className={styles.progressBarBg}>
                        <motion.div
                            className={styles.progressBarFill}
                            style={{ width: `${freshness}%`, backgroundColor: freshness > 80 ? '#00ff9d' : '#ffaa00' }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <Clock size={12} /> Last update: {lastPulse}
                </div>
            </div>
        </motion.div>
    );
};

const FridgeStatus = () => {
    const [fridges, setFridges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFridges = async () => {
            try {
                setLoading(true);
                const { data } = await api.get('/fridge');
                setFridges(data);
            } catch (error) {
                console.error("Failed to fetch fridge statuses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFridges();

        socket.on('fridgeUpdated', (updatedFridge) => {
            setFridges(prev => {
                const exists = prev.find(f => f._id === updatedFridge._id);
                if (exists) {
                    return prev.map(f => f._id === updatedFridge._id ? updatedFridge : f);
                }
                return [...prev, updatedFridge];
            });
        });

        return () => socket.off('fridgeUpdated');
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Fridge Status Monitoring</h1>
                <p>Live telemetry from connected units across the ecosystem</p>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <RefreshCw className={styles.spinner} />
                    <span>Syncing with Global Units...</span>
                </div>
            ) : fridges.length === 0 ? (
                <div className={styles.emptyState}>
                    <AlertCircle size={48} color="rgba(255, 255, 255, 0.1)" />
                    <h3>No Units Connected</h3>
                    <p>Register new Smridge units via the mobile app to start monitoring telemetry.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    <AnimatePresence>
                        {fridges.map(fridge => (
                            <FridgeCard
                                key={fridge._id}
                                id={fridge._id}
                                user={fridge.userId?.name || 'User Unit'}
                                freshness={fridge.freshnessPercentage}
                                temp={fridge.temperature}
                                gas={fridge.gasLevel}
                                doorOpen={fridge.doorStatus === 'open'}
                                status={fridge.status}
                                lastPulse={new Date(fridge.lastUpdated).toLocaleTimeString()}
                                fullData={fridge}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default FridgeStatus;
