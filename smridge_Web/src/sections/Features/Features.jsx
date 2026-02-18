import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Features.module.css';

const featuresData = [
    {
        id: 1,
        title: "Real-time Freshness Meter",
        description: "Know exactly when your food is at its peak. Our AI analyzes chemical signatures to give you a precise freshness score.",
        color: "#00f0ff"
    },
    {
        id: 2,
        title: "Auto Expiry Detection",
        description: "Never guess expiration dates again. Smridge automatically logs items and alerts you before they spoil.",
        color: "#00ff9d"
    },
    {
        id: 3,
        title: "Smart Notifications",
        description: "Get notified when you're low on essentials or when it's time to use that kale you bought last week.",
        color: "#7000ff"
    },
    {
        id: 4,
        title: "Live Monitoring",
        description: "Check your fridge contents from anywhere in the world via the Smridge App. See what's inside without opening the door.",
        color: "#ff0055"
    }
];

const FeatureCard = ({ feature, index, range, targetScale, progress }) => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start end', 'start start']
    });

    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} className={styles.cardContainer}>
            <motion.div
                style={{ scale, top: `calc(-5% + ${index * 25}px)` }}
                className={styles.card}
            >
                <div className={styles.cardBody} style={{ borderTop: `4px solid ${feature.color}` }}>
                    <h2 style={{ color: feature.color }}>{feature.title}</h2>
                    <p>{feature.description}</p>
                    <div className={styles.mockupPlaceholder}>
                        {/* Placeholder for feature UI visualization */}
                        <div className={styles.mockupContent} style={{ background: `linear-gradient(45deg, ${feature.color}22, transparent)` }}></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Features = () => {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    return (
        <section id="features" className={styles.featuresSection} ref={container}>
            <div className={styles.header}>
                <h2 className="text-gradient">Capabilities</h2>
                <p>Designed for the future of living.</p>
            </div>

            {featuresData.map((feature, i) => {
                const targetScale = 1 - ((featuresData.length - i) * 0.05);
                return (
                    <FeatureCard
                        key={feature.id}
                        feature={feature}
                        index={i}
                        range={[i * 0.25, 1]}
                        targetScale={targetScale}
                        progress={scrollYProgress}
                    />
                );
            })}
        </section>
    );
};

export default Features;
