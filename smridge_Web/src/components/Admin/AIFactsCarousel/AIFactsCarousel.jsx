import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles } from 'lucide-react';
import facts from '../../../data/aiFacts.json';
import styles from './AIFactsCarousel.module.css';

const AIFactsCarousel = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % facts.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.header}>
                <Sparkles size={16} className={styles.sparkle} />
                <span>SMRIDGE AI INSIGHTS</span>
            </div>
            
            <div className={styles.content}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className={styles.factWrapper}
                    >
                        <Info size={24} className={styles.infoIcon} />
                        <p className={styles.factText}>{facts[index]}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={styles.indicators}>
                {facts.map((_, i) => (
                    <div 
                        key={i} 
                        className={`${styles.dot} ${i === index ? styles.active : ''}`}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AIFactsCarousel;
