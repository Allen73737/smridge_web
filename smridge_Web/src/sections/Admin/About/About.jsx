import React from 'react';
import { motion } from 'framer-motion';
import { 
    Info, ShieldCheck, Mail, Globe, 
    Copyright, Zap, Flag, MessageSquare, 
    Bug, Cpu
} from 'lucide-react';
import styles from './About.module.css';

const About = () => {
    const sections = [
        {
            id: 1,
            icon: Info,
            title: "App Overview",
            content: "Smridge is a futuristic IoT refrigerator ecosystem designed to revolutionize food management through real-time sensing, automated tracking, and intelligent insights. Our ecosystem bridge connects your kitchen hardware to a seamless digital experience."
        },
        {
            id: 2,
            icon: Cpu,
            title: "Version & Build",
            content: "Current Version: v1.0.0. Build Stage: Stable. Optimized for cross-platform synchronization with the Smridge Mobile App (v1.0.0+1)."
        },
        {
            id: 3,
            icon: Zap,
            title: "Developer Info",
            content: "Designed and Engineered by the Smridge Systems Team. We specialize in high-fidelity IoT solutions and sustainable home technology."
        },
        {
            id: 4,
            icon: ShieldCheck,
            title: "Permissions & Data Usage",
            content: "Hardware access includes ESP32 sensor feeds, local network discovery, and cloud synchronization for inventory persistence. No private data is sold; everything is used to enhance your food freshness tracking."
        },
        {
            id: 5,
            icon: Copyright,
            title: "Credits & Legal",
            content: "Built with React, Vite, Framer Motion, and Socket.io. © 2026 Smridge IoT Systems. All Rights Reserved. All hardware specifications are proprietary."
        },
        {
            id: 6,
            icon: Flag,
            title: "Mission & Vision",
            content: "To eliminate global food waste through precision technology and intuitive data. We envision a future where every household manages resources with 100% efficiency."
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    About Smridge Ecosystem
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Version 1.0.0 | Enterprise Admin Dashboard
                </motion.p>
            </div>

            <div className={styles.grid}>
                {sections.map((section, index) => (
                    <motion.div 
                        key={section.id}
                        className={styles.card}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className={styles.iconWrapper}>
                            <section.icon size={24} />
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{section.title}</h3>
                            <p>{section.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div 
                className={styles.feedbackSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <h2>Feedback & Support</h2>
                <div className={styles.actionGrid}>
                    <a href="mailto:support@smridge.io?subject=Bug Report - Admin Web" className={styles.actionBtn}>
                        <Bug size={20} /> Report a Bug
                    </a>
                    <a href="mailto:support@smridge.io?subject=Feedback - Admin Web" className={styles.actionBtn}>
                        <MessageSquare size={20} /> Send Feedback
                    </a>
                    <a href="https://www.smridge.io" target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
                        <Globe size={20} /> Official Website
                    </a>
                </div>
            </motion.div>
        </div>
    );
};

export default About;
