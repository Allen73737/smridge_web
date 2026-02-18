import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Wind, DoorOpen, Clock } from 'lucide-react';
import styles from './FridgeStatus.module.css';

const FridgeCard = ({ id, user, freshness, temp, gas, doorOpen, lastPulse }) => {
    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, borderColor: 'var(--color-primary)' }}
        >
            <div className={styles.cardHeader}>
                <h3>{user}'s Fridge</h3>
                <span className={`${styles.statusDot} ${doorOpen ? styles.warning : styles.good}`} />
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
                    <span>Overall Freshness</span>
                    <span>{freshness}%</span>
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
        </motion.div>
    );
};

import api from '../../../services/api';
import socket from '../../../services/socket';

const FridgeStatus = () => {
    const [fridges, setFridges] = useState([]);

    React.useEffect(() => {
        const fetchFridges = async () => {
            try {
                const { data } = await api.get('/fridge');
                setFridges(data);
            } catch (error) {
                console.error("Failed to fetch fridge statuses", error);
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

        return () => {
            socket.off('fridgeUpdated');
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Fridge Status Monitoring</h1>
                <p>Live telemetry from connected units</p>
            </div>

            <div className={styles.grid}>
                {fridges.map(fridge => (
                    <FridgeCard
                        key={fridge._id}
                        id={fridge._id}
                        user={fridge.userId?.name || 'Unknown'}
                        freshness={fridge.freshnessPercentage}
                        temp={fridge.temperature}
                        gas={fridge.gasLevel}
                        doorOpen={fridge.doorStatus === 'open'}
                        lastPulse={new Date(fridge.lastUpdated).toLocaleTimeString()}
                    />
                ))}
            </div>
        </div>
    );
};

export default FridgeStatus;
