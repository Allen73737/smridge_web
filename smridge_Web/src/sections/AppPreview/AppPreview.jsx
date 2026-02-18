import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Battery, Signal, Wifi, Bell, Thermometer } from 'lucide-react';
import styles from './AppPreview.module.css';

const AppScreen = () => {
    return (
        <div className={styles.phoneScreen}>
            <div className={styles.statusBar}>
                <div className={styles.time}>12:42</div>
                <div className={styles.statusIcons}>
                    <Signal size={14} />
                    <Wifi size={14} />
                    <Battery size={14} />
                </div>
            </div>

            <div className={styles.appHeader}>
                <div className={styles.avatar}></div>
                <div className={styles.greeting}>
                    <p>Hello, Allen</p>
                    <h3>My Smridge</h3>
                </div>
                <Bell size={20} className={styles.notifIcon} />
            </div>

            <div className={styles.tempCard}>
                <div className={styles.tempHeader}>
                    <Thermometer size={18} />
                    <span>Internal Temp</span>
                </div>
                <div className={styles.tempValue}>
                    3.5<span>°C</span>
                </div>
                <div className={styles.tempGraph}>
                    {/* Simple CSS bars for graph */}
                    {[40, 60, 45, 70, 50, 65, 55].map((h, i) => (
                        <motion.div
                            key={i}
                            className={styles.graphBar}
                            style={{ height: `${h}%` }}
                            animate={{ height: [`${h}%`, `${h + Math.random() * 20 - 10}%`, `${h}%`] }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.inventoryList}>
                <h3>Freshness Alert</h3>
                {[
                    { name: "Avocados", days: 2, color: "#ffaa00" },
                    { name: "Milk", days: 4, color: "#00ff9d" },
                    { name: "Salmon", days: 1, color: "#ff0055" }
                ].map((item, i) => (
                    <div key={i} className={styles.inventoryItem}>
                        <div className={styles.itemDot} style={{ background: item.color }} />
                        <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemDays} style={{ color: item.color }}>{item.days} days left</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.bottomNav}>
                <div className={styles.navIndicator} />
            </div>
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
                    <h2 className="text-gradient">Total Control.</h2>
                    <h3 className={styles.subHeader}>In your pocket.</h3>
                    <p>
                        Monitor temperature, manage inventory, and receive freshness alerts instantly.
                        The Smridge app puts the brain of your refrigerator in the palm of your hand.
                    </p>
                    <ul className={styles.featureList}>
                        <li>Real-time Alerts</li>
                        <li>Remote Temperature Control</li>
                        <li>Inventory Tracking</li>
                        <li>Energy Usage Stats</li>
                    </ul>
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
