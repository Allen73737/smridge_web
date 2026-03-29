import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import styles from './ProblemStats.module.css';
import { TextReveal, Reveal } from '../../components/Effects/Reveal';

const Counter = ({ to, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, to, {
                duration: 2,
                ease: "easeOut",
                onUpdate: (value) => {
                    setDisplayValue(value);
                }
            });
            return () => controls.stop();
        } else {
            setDisplayValue(0); // Reset when out of view
        }
    }, [isInView, to]);

    // Better formatting for numbers
    const formattedValue = to % 1 === 0 
        ? Math.floor(displayValue) 
        : displayValue.toFixed(1);

    return (
        <div className={styles.statItem} ref={ref}>
            <motion.div
                className={styles.statValue}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8 }}
            >
                {formattedValue}{suffix}
            </motion.div>
            <motion.div
                className={styles.statLabel}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
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
        <section className={styles.statsSection} ref={containerRef} style={{ position: 'relative' }}>
            <div className={styles.gridBackground}></div>

            <div className={styles.contentWrapper}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-gradient">
                        <TextReveal text="The Intelligence Gap" centered={true} />
                    </h2>
                    <Reveal delay={0.4} centered={true}>
                        <p className="section-subtext">Traditional refrigeration is static. We've built an ecosystem that evolves with your lifestyle.</p>
                    </Reveal>
                </motion.div>

                <motion.div 
                    className={styles.statsGrid}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <Counter to={30} suffix="%" label="Global Food Wasted" />
                    <Counter to={1.3} suffix="B" label="Tonnes Lost Annually" />
                    <Counter to={450} suffix="$" label="Avg Household Loss/Yr" />
                </motion.div>

                <motion.div
                    className={styles.storyText}
                    style={{ y }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
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
