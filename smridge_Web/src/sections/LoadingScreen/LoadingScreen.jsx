import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 1000); // Wait a bit before unmounting
                    return 100;
                }
                return prev + Math.random() * 5;
            });
        }, 100);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <motion.div
            className={styles.container}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <div className={styles.content}>
                <motion.div
                    className={styles.logo}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <div className={styles.logoText}>SMRIDGE</div>
                    <div className={styles.logoGlow}></div>
                </motion.div>

                <div className={styles.progressContainer}>
                    <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                </div>

                <div className={styles.statusText}>
                    {progress < 30 && "Initializing System..."}
                    {progress >= 30 && progress < 70 && "Calibrating Sensors..."}
                    {progress >= 70 && "Freshness Engine Online"}
                </div>
            </div>

            <div className={styles.backgroundParticles}>
                {/* Simple CSS particles can be added here or via canvas */}
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
