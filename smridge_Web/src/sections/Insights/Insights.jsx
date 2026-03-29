import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import facts from '../../data/aiFacts.json';
import styles from './Insights.module.css';

const AnimatedText = ({ text }) => {
    const letters = Array.from(text);
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
            variants={container}
            initial="hidden"
            animate="visible"
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index} style={{ marginRight: letter === " " ? "0.5rem" : "0" }}>
                    {letter}
                </motion.span>
            ))}
        </motion.div>
    );
};

const Insights = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [currentIndex, isAutoPlaying]);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % facts.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + facts.length) % facts.length);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                duration: 0.8,
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.5,
            rotateY: direction < 0 ? 45 : -45,
            transition: {
                duration: 0.5
            }
        })
    };

    const currentIcon = currentIndex % 3 === 0 ? <Brain size={48} /> : currentIndex % 3 === 1 ? <Zap size={48} /> : <ShieldCheck size={48} />;

    return (
        <section id="insights" className={styles.insightsSection}>
            <div className={styles.backgroundBlur} />
            
            <div className={styles.header}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false }}
                    className={styles.badge}
                >
                    <Sparkles size={14} />
                    <span>SMART INTELLIGENCE</span>
                </motion.div>
                <motion.h2 
                    className="text-gradient"
                    initial={{ opacity: 0, filter: "blur(10px)", y: 30 }}
                    whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Smridge Insights
                </motion.h2>
                <motion.p 
                    className="section-subtext"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 0.5, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Decoding the future of food preservation through data-driven clarity.
                </motion.p>
            </div>

            <div className={styles.carouselContainer}>
                <button className={`${styles.navBtn} ${styles.prev}`} onClick={() => { handlePrev(); setIsAutoPlaying(false); }}>
                    <ChevronLeft />
                </button>

                <div className={styles.carouselStage}>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className={styles.insightCard}
                        >
                            <div className={styles.cardGlow} />
                            <motion.div 
                                className={styles.iconWrapper}
                                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                {currentIcon}
                            </motion.div>
                            <div className={styles.insightContent}>
                                <AnimatedText text={facts[currentIndex]} />
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.indicatorContainer}>
                                    {facts.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`${styles.indicator} ${i === currentIndex ? styles.activeIndicator : ''}`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button className={`${styles.navBtn} ${styles.next}`} onClick={() => { handleNext(); setIsAutoPlaying(false); }}>
                    <ChevronRight />
                </button>
            </div>
        </section>
    );
};

export default Insights;
