import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Battery, Signal, Wifi, Bell, Thermometer, Menu, ChevronLeft, Settings } from 'lucide-react';
import styles from './AppPreview.module.css';
import { Reveal, TextReveal } from '../../components/Effects/Reveal';

const AppScreen = () => {
    return (
        <div className={styles.phoneScreen}>
            {/* Status Bar: Realistic Elements */}
            <div className={styles.statusBar}>
                <span className={styles.statusTime}>09:41</span>
                <div className={styles.statusIcons}>
                    <Signal size={14} />
                    <Wifi size={14} />
                    <Battery size={14} />
                </div>
            </div>

            {/* Header: Exact Screenshot Sync */}
            <div className={styles.appHeader}>
                <Menu size={18} className={styles.headerIcon} />
                <h3 className={styles.logoTitle}>SMRIDGE</h3>
                <div className={styles.snowflakeIcon}>
                    <div className={styles.snowflakeCircle}>
                        <div className={styles.innerSnowflake} />
                    </div>
                </div>
            </div>

            {/* Status Card: Glassmorphic Dark */}
            <div className={styles.statusCard}>
                <div className={styles.statusRow}>
                    <span>Temperature</span>
                    <span className={styles.cyanText}>2.0°C</span>
                </div>
                <div className={styles.statusRow}>
                    <span>Humidity</span>
                    <span className={styles.cyanText}>67%</span>
                </div>
                <div className={styles.statusRow}>
                    <span>Freshness</span>
                    <div className={styles.freshDots}>
                        <div className={`${styles.dot} ${styles.dotActive}`} />
                        <div className={styles.dot} />
                        <div className={styles.dot} />
                    </div>
                </div>
                <div className={styles.statusRow}>
                    <span>Door</span>
                    <div className={styles.doorStatus}>
                        <span className={styles.greenText}>SECURED</span>
                        <ChevronLeft size={12} className={styles.chevron} style={{ transform: 'rotate(-90deg)', marginLeft: '4px' }} />
                    </div>
                </div>
            </div>

            {/* Main Panel: Large Fridge Door UI */}
            <div className={styles.mainDoorPanel}>
                <div className={styles.panelOverlay}>
                    <div className={styles.panelGlow} />
                    <div className={styles.panelTitle}>SMRIDGE AI</div>
                </div>
                {/* Smridge AI FAB */}
                <motion.div 
                    className={styles.aiFab}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Smartphone size={24} color="#000" />
                    <div className={styles.fabPulse} />
                </motion.div>
            </div>

            {/* Bottom Navigation Dock */}
            <div className={styles.bottomDock}>
                <div className={`${styles.dockItem} ${styles.dockActive}`}>
                    <div className={styles.homeIcon}>
                        <div className={styles.homeRoof} />
                        <div className={styles.homeBase} />
                    </div>
                    <div className={styles.activeGlow} />
                </div>
                <div className={styles.dockItem}><Battery size={18} /></div>
                <div className={styles.dockItem}><Smartphone size={18} /></div>
                <div className={styles.dockItem}><div className={styles.plusCircle}>+</div></div>
                <div className={styles.dockItem}><Bell size={18} /></div>
                <div className={styles.dockItem}><Settings size={18} /></div>
            </div>
            
            {/* iOS Style Navigation Pill */}
            <div className={styles.navPillContainer}>
                <div className={styles.navPill} />
            </div>
            
            <div className={styles.screenScanline} />
        </div>
    );
};



const AppPreview = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-200px" });

    return (
        <section id="app" className={styles.appSection} ref={ref}>
            <div className={styles.contentContainer}>
                <motion.div
                    className={styles.textContent}
                    initial={{ opacity: 0, x: -50 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-gradient">
                        <TextReveal text="Total Ecosystem Control" />
                    </h2>
                    <Reveal delay={0.4}>
                        <h3 className={styles.subHeader}>The Hub of Smridge Intelligence.</h3>
                    </Reveal>
                    <Reveal delay={0.6}>
                        <p className="section-subtext">
                            Monitor freshness curves, adjust global thresholds, and manage your inventory with AI-driven precision.
                            The Smridge app is the nervous system of your refrigerator, bridging the gap between vision and preservation.
                        </p>
                    </Reveal>
                    <Reveal delay={0.8}>
                        <ul className={styles.featureList}>
                            <li>Real-time Freshness Monitoring</li>
                            <li>Global Environment Thresholds</li>
                            <li>Intelligent Inventory Management</li>
                            <li>Ecosystem Health Analytics</li>
                        </ul>
                    </Reveal>
                </motion.div>

                <motion.div
                    className={styles.phoneWrapper}
                    initial={{ opacity: 0, y: 100, rotate: 10 }}
                    animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                >
                    <div className={styles.phoneFrame}>
                        <div className={styles.notch}></div>
                        <div className={styles.sideBtn}></div>
                        <div className={styles.volBtn}></div>
                        <AppScreen />
                    </div>
                    <div className={styles.phoneGlow} />
                </motion.div>
            </div>
        </section>
    );
};

export default AppPreview;
