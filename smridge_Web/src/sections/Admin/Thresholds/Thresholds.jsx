import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import styles from './Thresholds.module.css';
import api from '../../../services/api';
import socket from '../../../services/socket';

const RangeControl = ({ label, minVal, maxVal, min, max, unit, onChangeMin, onChangeMax, color }) => {
    return (
        <div className={styles.controlGroup}>
            <div className={styles.controlHeader}>
                <label>{label}</label>
                <div className={styles.valueRange}>
                    <span style={{ color }}>{minVal}{unit}</span>
                    <span className={styles.separator}>—</span>
                    <span style={{ color }}>{maxVal}{unit}</span>
                </div>
            </div>
            <div className={styles.rangeContainer}>
                <div className={styles.sliderWrapper}>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step="0.1"
                        value={minVal}
                        onChange={(e) => {
                            const val = Math.min(parseFloat(e.target.value), maxVal - 0.5);
                            onChangeMin(val);
                        }}
                        className={`${styles.slider} ${styles.sliderMin}`}
                        style={{ '--thumb-color': color }}
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step="0.1"
                        value={maxVal}
                        onChange={(e) => {
                            const val = Math.max(parseFloat(e.target.value), minVal + 0.5);
                            onChangeMax(val);
                        }}
                        className={`${styles.slider} ${styles.sliderMax}`}
                        style={{ '--thumb-color': color }}
                    />
                    <div
                        className={styles.rangeTrack}
                        style={{
                            left: `${((minVal - min) / (max - min)) * 100}%`,
                            right: `${100 - ((maxVal - min) / (max - min)) * 100}%`,
                            backgroundColor: color
                        }}
                    />
                </div>
            </div>
            <div className={styles.rangeGuides}>
                <span>Min: {min}{unit}</span>
                <span>Max: {max}{unit}</span>
            </div>

            <div className={styles.manualInputs}>
                <div className={styles.inputBox}>
                    <span className={styles.inputLabel}>Min Bound</span>
                    <input
                        type="number"
                        step="0.1"
                        value={minVal}
                        onChange={(e) => {
                            const val = Math.min(parseFloat(e.target.value) || min, maxVal - 0.1);
                            onChangeMin(val);
                        }}
                        className={styles.numInput}
                    />
                </div>
                <div className={styles.inputBox}>
                    <span className={styles.inputLabel}>Max Bound</span>
                    <input
                        type="number"
                        step="0.1"
                        value={maxVal}
                        onChange={(e) => {
                            const val = Math.max(parseFloat(e.target.value) || max, minVal + 0.1);
                            onChangeMax(val);
                        }}
                        className={styles.numInput}
                    />
                </div>
            </div>
        </div>
    );
};

import { useHistory } from '../../../hooks/useHistory';

const Thresholds = () => {
    const [settings, setSettings, undo, redo, canUndo, canRedo] = useHistory({
        tempMin: 0,
        tempMax: 10.0,
        humMin: 40,
        humMax: 95,
        gasMin: 0.1,
        gasMax: 1.0,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Keyboard shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    useEffect(() => {
        const fetchThresholds = async () => {
            try {
                const { data } = await api.get('/threshold');
                setSettings({
                    tempMin: data.temperatureLimitMin || 0,
                    tempMax: data.temperatureLimitMax || 10,
                    humMin: data.humidityLimitMin || 40,
                    humMax: data.humidityLimitMax || 95,
                    gasMin: data.gasLimitMin || 0.1,
                    gasMax: data.gasLimitMax || 1.0,
                });
            } catch (error) {
                console.error("Failed to fetch thresholds");
            }
        };
        fetchThresholds();

        socket.on('thresholdUpdated', (data) => {
            setSettings({
                tempMin: data.temperatureLimitMin,
                tempMax: data.temperatureLimitMax,
                humMin: data.humidityLimitMin,
                humMax: data.humidityLimitMax,
                gasMin: data.gasLimitMin,
                gasMax: data.gasLimitMax,
            });
        });

        return () => socket.off('thresholdUpdated');
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/threshold/update', {
                temperatureLimitMin: settings.tempMin,
                temperatureLimitMax: settings.tempMax,
                humidityLimitMin: settings.humMin,
                humidityLimitMax: settings.humMax,
                gasLimitMin: settings.gasMin,
                gasLimitMax: settings.gasMax,
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

                    <RangeControl
                        label="Temperature Range"
                        minVal={settings.tempMin}
                        maxVal={settings.tempMax}
                        min={-10} max={25} unit="°C"
                        color="#00f0ff"
                        onChangeMin={(v) => setSettings({ ...settings, tempMin: v })}
                        onChangeMax={(v) => setSettings({ ...settings, tempMax: v })}
                    />

                    <RangeControl
                        label="Humidity Range"
                        minVal={settings.humMin}
                        maxVal={settings.humMax}
                        min={0} max={100} unit="%"
                        color="#00ff9d"
                        onChangeMin={(v) => setSettings({ ...settings, humMin: v })}
                        onChangeMax={(v) => setSettings({ ...settings, humMax: v })}
                    />

                    <RangeControl
                        label="Gas Sensing Range"
                        minVal={settings.gasMin}
                        maxVal={settings.gasMax}
                        min={0} max={5} unit=" PPM"
                        color="#ffaa00"
                        onChangeMin={(v) => setSettings({ ...settings, gasMin: v })}
                        onChangeMax={(v) => setSettings({ ...settings, gasMax: v })}
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
