import React from 'react';
import { motion } from 'framer-motion';
import { Download, Terminal } from 'lucide-react';
import styles from './Download.module.css';

const DownloadAPK = () => {
    return (
        <section className={styles.downloadSection}>
            <div className={styles.content}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className={styles.card}
                >
                    <div className={styles.iconCircle}>
                        <Download size={40} />
                    </div>

                    <h2>Experience the Future</h2>
                    <p>Download the Smridge APK to unlock full control of your smart lifestyle.</p>

                    <div className={styles.versionInfo}>
                        <span>Version: 2.0.4 (Beta)</span>
                        <span>Size: 45MB</span>
                    </div>

                    <button className={styles.downloadBtn}>
                        Download APK
                        <div className={styles.btnGlow}></div>
                    </button>

                    <div className={styles.warning}>
                        <Terminal size={14} />
                        <span>Connection to backend server required for latest build.</span>
                    </div>

                    {/* Note to developer */}
                    {/* Backend Integration: Fetch latest version from /api/latest-release */}
                </motion.div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>SMRIDGE</div>
                    <div className={styles.footerLinks}>
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Support</a>
                    </div>
                    <div className={styles.copyright}>© 2026 Smridge Systems AI.</div>
                </div>
            </footer>
        </section>
    );
};

export default DownloadAPK;
