import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import styles from './ProblemStats.module.css';

const Counter = ({ from, to, duration = 2, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Custom hook or simple logic to animate number would go here
    // For simplicity using a keyframe-like effect with css or just motion

    return (
        <div className={styles.statItem} ref={ref}>
            <motion.div
                className={styles.statValue}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
            >
                {/* Simplified counter for now, real implementation would stick the number */}
                {to}{suffix}
            </motion.div>
            <motion.div
                className={styles.statLabel}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                {label}
            </motion.div>
        </div>
    );
};

const ProblemStats = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

    return (
        <section className={styles.statsSection}>
            <div className={styles.gridBackground}></div>

            <div className={styles.contentWrapper}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-gradient">The Silent Crisis</h2>
                    <p>Traditional refrigeration is broken. We're fixing it.</p>
                </motion.div>

                <div className={styles.statsGrid}>
                    <Counter to={30} suffix="%" label="Global Food Wasted" />
                    <Counter to={1.3} suffix="B" label="Tonnes Lost Annually" />
                    <Counter to={450} suffix="$" label="Avg Household Loss/Yr" />
                </div>

                <motion.div
                    className={styles.storyText}
                    style={{ y }}
                >
                    <div className={styles.glassCard}>
                        <h3>Intelligence is the Answer</h3>
                        <p>
                            Smridge doesn't just cool. It sees, analyzes, and predicts.
                            By monitoring freshness in real-time, we empower you to reduce waste
                            and eat healthier.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ProblemStats;
