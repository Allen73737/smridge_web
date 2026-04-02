import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Features.module.css';
import { TextReveal, Reveal } from '../../components/Effects/Reveal';

const featuresData = [
    {
        id: 1,
        title: "Dynamic Freshness Analysis",
        description: "Powered by advanced neural sensors, Smridge monitors chemical signatures to track the real-time decay of perishables, ensuring you never miss a meal's peak.",
        color: "#00f0ff"
    },
    {
        id: 3,
        title: "Predictive Inventory Sync",
        description: "Using intelligent cloud algorithms, we predict your consumption patterns and alert you before you run out of essentials, keeping your fridge perfectly stocked.",
        color: "#7000ff"
    },
    {
        id: 4,
        title: "Global Threshold Control",
        description: "Precision at your fingertips. Adjust environmental limits from anywhere in the world and watch your Smridge adapt its cooling curve in real-time.",
        color: "#ff0055"
    },
    {
        id: 5,
        title: "AI Vision Intelligence",
        description: "Our integrated visual cores identify every individual item upon entry, automatically categorizing and tracking expiration dates without manual input.",
        color: "#ffaa00"
    },
    {
        id: 6,
        title: "Cloud Environment Sync",
        description: "Seamlessly synchronize your refrigerator's internal climate with local external humidity and temperature trends for optimal energy efficiency.",
        color: "#0088ff"
    }
];

const FeatureCard = ({ feature, index, range, targetScale, progress, customTop }) => {
    const container = useRef(null);
    
    // Use the progress from parent to drive scale, rotation, and slight translation
    const scale = useTransform(progress, range, [1, targetScale]);
    const rotate = useTransform(progress, range, [0, -2]); // Subtle rotation as it stacks
    const opacity = useTransform(progress, [range[0], range[0] + 0.1], [1, 0.9]); // Slight dimming of stacked cards

    return (
        <div ref={container} className={styles.cardContainer}>
            <motion.div
                style={{ 
                    scale, 
                    rotate,
                    opacity,
                    top: customTop, // Use dynamic sticky top
                    zIndex: index // Ensure cards stack correctly
                }}
                className={styles.card}
            >
                <div className={styles.cardBody} style={{ borderTop: `4px solid ${feature.color}` }}>
                    <div className={styles.cardHeader}>
                        <h3 style={{ color: feature.color }}>{feature.title}</h3>
                        <span className={styles.indexNumber}>{(index + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="secondary-font">{feature.description}</p>
                    <div className={styles.mockupPlaceholder}>
                        <div className={styles.mockupContent} style={{ background: `linear-gradient(45deg, ${feature.color}15, transparent)` }}>
                             <div className={styles.glassEffect} />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};



const Features = () => {
    const container = useRef(null);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start start', 'end end']
    });

    return (
        <section id="features" className={styles.featuresSection} ref={container}>
            <div className={styles.header}>
                <h2 className="text-gradient">
                    <TextReveal text="Ecosystem Intelligence" />
                </h2>
                <Reveal delay={0.4}>
                    <p className="section-subtext">Features that transform refrigeration into a vision-driven experience.</p>
                </Reveal>
            </div>

            {featuresData.map((feature, i) => {
                // Adaptive scaling and positioning for mobile
                const scaleStep = isMobile ? 0.02 : 0.04;
                const topOffset = isMobile ? 5 : 10;
                const stackPadding = isMobile ? 12 : 30;

                const targetScale = 1 - ((featuresData.length - i) * scaleStep);
                
                return (
                    <FeatureCard
                        key={feature.id}
                        feature={feature}
                        index={i}
                        range={[i * (1 / featuresData.length), 1]}
                        targetScale={targetScale}
                        progress={scrollYProgress}
                        customTop={`calc(${topOffset}% + ${i * stackPadding}px)`}
                    />
                );
            })}
        </section>
    );
};

export default Features;
