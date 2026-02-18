import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Droplets, Wind, Cpu, Brain, X } from 'lucide-react';
import styles from './Sensors.module.css';

const sensorsData = [
    {
        id: 1,
        title: "Gas Sensor",
        icon: <Wind size={40} />,
        description: "Detects ethylene and spoilage gases instantly.",
        details: "High-sensitivity MOX gas sensor capable of detecting PPM-level ethylene concentrations, signaling early stages of fruit ripening and spoilage."
    },
    {
        id: 2,
        title: "Temp Control",
        icon: <Thermometer size={40} />,
        description: "Multi-zone precision cooling to 0.1°C.",
        details: "PID-controlled independent cooling zones ensure that meat, vegetables, and dairy are each kept at their optimal preservation temperatures."
    },
    {
        id: 3,
        title: "Humidity",
        icon: <Droplets size={40} />,
        description: "Adaptive moisture control for crispness.",
        details: "Ultrasonic misting and active dehumidification maintain 85-95% humidity for greens and <40% for dry goods/grains."
    },
    {
        id: 4,
        title: "ESP32 Core",
        icon: <Cpu size={40} />,
        description: "Dual-core processing power.",
        details: "The brain of the operation. Handles real-time sensor data fusion, WiFi connectivity, and local control logic with military-grade stability."
    },
    {
        id: 5,
        title: "AI Engine",
        icon: <Brain size={40} />,
        description: "Predictive freshness algorithms.",
        details: "Neural networks analyze sensor patterns to predict shelf life. It learns your usage habits to optimize cooling cycles and save energy."
    }
];

const Card = ({ sensor, onClick }) => {
    return (
        <motion.div
            className={styles.card}
            layoutId={`card-${sensor.id}`}
            onClick={() => onClick(sensor)}
            whileHover={{ y: -10, boxShadow: "0 0 25px rgba(0, 240, 255, 0.3)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className={styles.iconWrapper}>{sensor.icon}</div>
            <h3>{sensor.title}</h3>
            <p>{sensor.description}</p>
            <div className={styles.cardGlow} />
        </motion.div>
    );
};

const Sensors = () => {
    const [selectedSensor, setSelectedSensor] = useState(null);

    return (
        <section id="technology" className={styles.sensorSection}>
            <div className={styles.header}>
                <h2 className="text-gradient">Core Technology</h2>
                <p>Powered by advanced sensing and AI.</p>
            </div>

            <div className={styles.grid}>
                {sensorsData.map(sensor => (
                    <Card key={sensor.id} sensor={sensor} onClick={setSelectedSensor} />
                ))}
            </div>

            <AnimatePresence>
                {selectedSensor && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSensor(null)}
                    >
                        <motion.div
                            className={styles.expandedCard}
                            layoutId={`card-${selectedSensor.id}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeButton} onClick={() => setSelectedSensor(null)}>
                                <X size={24} />
                            </button>
                            <div className={styles.expandedIcon}>{selectedSensor.icon}</div>
                            <h3>{selectedSensor.title}</h3>
                            <p className={styles.expandedDetails}>{selectedSensor.details}</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Sensors;
