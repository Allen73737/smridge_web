import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Terminal, Smartphone, Apple, RefreshCw } from 'lucide-react';
import styles from './Download.module.css';
import api from '../../services/api';
import { Reveal, TextReveal } from '../../components/Effects/Reveal';

const DownloadCard = ({ platform, data }) => {
    const isIOS = platform === 'ios';
    const Icon = isIOS ? Apple : Smartphone;

    return (
        <motion.div
            initial={{ opacity: 0, x: isIOS ? 100 : -100, rotateY: isIOS ? -15 : 15 }}
            whileInView={{ 
                opacity: 1, 
                x: 0, 
                rotateY: 0,
                transition: {
                    type: "spring",
                    stiffness: 60,
                    damping: 20,
                    delay: isIOS ? 0.3 : 0.1
                }
            }}
            viewport={{ once: false, margin: "-100px" }}
            whileHover={{ y: -10, scale: 1.02 }}
            className={styles.card}
        >
            <div className={`${styles.iconCircle} ${isIOS ? styles.iosIcon : ''}`}>
                <Icon size={40} />
            </div>

            <h2>{isIOS ? 'Smridge for iOS' : 'Smridge for Android'}</h2>
            <p>Experience the ecosystem with our native {isIOS ? 'iOS' : 'Android'} application.</p>

            {data && data.length > 0 ? (
                <div className={styles.versionList}>
                    {data.map((build) => {
                        let finalUrl = '';
                        if (build.isLink) {
                            finalUrl = build.externalLink || build.fileUrl || '';
                        } else if (build.fileUrl && build.fileUrl.startsWith('http')) {
                            finalUrl = build.fileUrl.replace('http://', 'https://');
                            if (finalUrl.includes('/upload/') && !finalUrl.includes('fl_attachment')) {
                                finalUrl = finalUrl.replace('/upload/', '/upload/fl_attachment/');
                            }
                        } else if (build.fileUrl) {
                            finalUrl = `${api.defaults.baseURL.replace('/api', '')}${build.fileUrl}`;
                        }
                        return (
                        <div key={build._id} className={styles.versionItem}>
                            <div className={styles.vInfo}>
                                <span className={styles.vLabel}>v{build.version}</span>
                                {build.isLatest && <span className={styles.latestBadge}>LATEST</span>}
                                <span className={styles.vSize}>{build.fileSize}</span>
                            </div>
                                <a 
                                    href={finalUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={!build.isLink && !(build.fileUrl && build.fileUrl.startsWith('http'))} 
                                    className={styles.miniDownloadBtn}
                                >
                                    <Download size={16} />
                                </a>
                        </div>
                    )})}
                </div>
            ) : (
                <div className={styles.comingSoon}>
                    <span>Version Sync Pending...</span>
                </div>
            )}
        </motion.div>
    );
};

const DownloadAPK = () => {
    const [releases, setReleases] = useState({ android: [], ios: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReleases = async () => {
            try {
                const [androidRes, iosRes] = await Promise.allSettled([
                    api.get('/apk/history/android'),
                    api.get('/apk/history/ios')
                ]);

                setReleases({
                    android: androidRes.status === 'fulfilled' ? androidRes.value.data : [],
                    ios: iosRes.status === 'fulfilled' ? iosRes.value.data : []
                });
            } catch {
                console.error("Failed to sync with build server");
            } finally {
                setLoading(false);
            }
        };
        fetchReleases();
    }, []);

    return (
        <section id="download" className={styles.downloadSection}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Reveal delay={0.2}>
                        <span className="section-tagline">Where Vision Meets Refrigeration</span>
                    </Reveal>
                    <h2 className="text-gradient">
                        <TextReveal text="Sync the Ecosystem" />
                    </h2>
                    <Reveal delay={0.4}>
                        <p className="section-subtext">Enter the Smridge Ecosystem. Precision cooling at your fingertips.</p>
                    </Reveal>
                </div>

                <Reveal delay={0.6} width="100%">
                    <div className={styles.grid}>
                        {loading ? (
                            <div className={styles.loading}>
                                <RefreshCw className={styles.spin} />
                                <span>Syncing with Global Build Server...</span>
                            </div>
                        ) : (
                            <>
                                <DownloadCard platform="android" data={releases.android} />
                                <DownloadCard platform="ios" data={releases.ios} />
                            </>
                        )}
                    </div>
                </Reveal>

                <Reveal delay={0.8} width="100%">
                    <div className={styles.warning}>
                        <Terminal size={14} />
                        <span>Secure end-to-end encrypted build delivery active.</span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
};

export default DownloadAPK;
