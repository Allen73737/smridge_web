import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './Thresholds.module.css';
import api from '../../../services/api';
import socket from '../../../services/socket';

const SliderControl = ({ label, value, min, max, unit, onChange, color }) => {
    return (
        <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
                <label>{label}</label>
                <span style={{ color }}>{value}{unit}</span>
            </div>
            <div className={styles.sliderContainer}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step="0.1"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className={styles.slider}
                    style={{ '--thumb-color': color }}
                />
                <div
                    className={styles.progressBar}
                    style={{ width: `${((value - min) / (max - min)) * 100}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
};

const Thresholds = () => {
    const [settings, setSettings] = useState({
        tempMin: 1.0,
        tempMax: 5.0,
        humidityTarget: 85,
        gasWarning: 0.5,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    React.useEffect(() => {
        const fetchThresholds = async () => {
            try {
                const { data } = await api.get('/threshold');
                setSettings({
                    tempMin: 1.0,
                    tempMax: data.temperatureLimit || 5.0,
                    humidityTarget: data.humidityLimit || 85,
                    gasWarning: data.gasLimit || 0.5,
                });
            } catch (error) {
                console.error("Failed to fetch thresholds");
            }
        };
        fetchThresholds();

        socket.on('thresholdUpdated', (data) => {
            setSettings(prev => ({
                ...prev,
                tempMax: data.temperatureLimit,
                humidityTarget: data.humidityLimit,
                gasWarning: data.gasLimit,
            }));
        });

        return () => socket.off('thresholdUpdated');
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/threshold/update', {
                temperatureLimit: settings.tempMax,
                humidityLimit: settings.humidityTarget,
                gasLimit: settings.gasWarning,
                freshnessWarningLevel: 50
            });
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (error) {
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.thresholdsContainer}>
            <div className={styles.header}>
                <h1>Global Thresholds</h1>
                <p>Configure system-wide alert triggers and operating limits.</p>
            </div>

            <div className={styles.contentGrid}>
                <motion.div
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.cardTitle}>
                        <AlertCircle size={20} className={styles.icon} />
                        Environmental Controls
                    </div>

                    <SliderControl
                        label="Min Temperature"
                        value={settings.tempMin}
                        min={-2} max={10} unit="°C"
                        color="#00f0ff"
                        onChange={(v) => setSettings({ ...settings, tempMin: v })}
                    />

                    <SliderControl
                        label="Max Temperature"
                        value={settings.tempMax}
                        min={0} max={15} unit="°C"
                        color="#ff0055"
                        onChange={(v) => setSettings({ ...settings, tempMax: v })}
                    />

                    <SliderControl
                        label="Target Humidity"
                        value={settings.humidityTarget}
                        min={40} max={95} unit="%"
                        color="#00ff9d"
                        onChange={(v) => setSettings({ ...settings, humidityTarget: v })}
                    />

                    <SliderControl
                        label="Gas Warning Level"
                        value={settings.gasWarning}
                        min={0.1} max={2.0} unit=" PPM"
                        color="#ffaa00"
                        onChange={(v) => setSettings({ ...settings, gasWarning: v })}
                    />

                    <div className={styles.actions}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <RefreshCw className={styles.spin} size={18} /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : 'Update Configuration'}
                        </button>
                        <AnimatePresence>
                            {showSaved && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={styles.savedMsg}
                                >
                                    Changes Saved!
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.previewCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>Live Impact Preview</h3>
                    <p className={styles.previewDesc}>Est. daily energy consumption based on current thresholds.</p>

                    <div className={styles.impactMetric}>
                        <span>Est. Power Draw</span>
                        <span className={styles.bigValue}>
                            {(12.5 + (5 - settings.tempMin) * 0.8).toFixed(1)} kWh
                        </span>
                    </div>

                    <div className={styles.impactMetric}>
                        <span>Freshness Retention</span>
                        <span className={styles.bigValue} style={{ color: '#00ff9d' }}>
                            {(98 - (settings.tempMax - 3) * 2).toFixed(1)}%
                        </span>
                    </div>

                    <div className={styles.note}>
                        Adjusting temperature ranges affects energy efficiency and food preservation duration.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Thresholds;
