import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LoadingScreen.module.css';

import logo from '../../assets/smridge_logo.png';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const intervalTime = 40; // 40ms * 25 steps = 1000ms
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    onComplete(); 
                    return 100;
                }
                return prev + 4;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <motion.div
            className={styles.container}
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4, ease: "easeIn" } }}
        >
            <div className={styles.content}>
                <motion.div
                    className={styles.brandWrapper}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2 }}
                >
                    <img 
                        src={logo} 
                        alt="Smridge Logo" 
                        className={styles.logoImg} 
                    />
                    <h1 className={styles.logoText}>
                        SMRIDGE
                    </h1>
                    <p className={styles.motto}>
                        Where Vision Meets Refrigeration
                    </p>
                </motion.div>

                <div className={styles.loaderWrapper}>
                    <div className={styles.progressBarBg}>
                        <motion.div 
                            className={styles.progressBarFill} 
                            style={{ width: `${progress}%` }}
                            animate={{ backgroundColor: ["#00f0ff", "#7000ff", "#00f0ff"] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </div>
                    <span className={styles.percentage}>{Math.round(progress)}%</span>
                </div>

                <div className={styles.statusText}>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={Math.floor(progress / 25)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {progress < 25 && "Powering up Freshness..."}
                            {progress >= 25 && progress < 50 && "Establishing Satellite Link..."}
                            {progress >= 50 && progress < 75 && "Calibrating Neural Sensors..."}
                            {progress >= 75 && "Securing Ecosystem access..."}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
