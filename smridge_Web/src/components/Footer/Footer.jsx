import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';
import { Reveal } from '../../components/Effects/Reveal';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerGlow} />
            
            <motion.div 
                className={styles.container}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div className={styles.contentGrid}>
                    <motion.div 
                        className={styles.brandColumn}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className={styles.logoText}>SMRIDGE</h2>
                        <p className={styles.tagline}>Where Vision Meets Refrigeration.</p>
                        <div className={styles.socialIcons}>
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <motion.a 
                                    key={i} 
                                    href="#" 
                                    className={styles.socialBtn}
                                    whileHover={{ y: -5, scale: 1.2, color: '#00f0ff' }}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                >
                                    <Icon size={20} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
 
                    <motion.div 
                        className={styles.linksColumn}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3>Quick Links</h3>
                        <ul>
                            {['Vision', 'Technology', 'Insights', 'Features', 'App', 'Team'].map((link) => (
                                <li key={link}>
                                    <motion.a 
                                        href={`#${link.toLowerCase()}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (window.premiumScrollTo) window.premiumScrollTo(link.toLowerCase());
                                        }}
                                        whileHover={{ x: 10, color: '#00f0ff' }}
                                    >
                                        {link}
                                    </motion.a>
                                </li>
                            ))}
                            <li>
                                <Link to="/admin" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.3s' }}>
                                    <motion.span whileHover={{ x: 10, color: '#7000ff' }}>Admin Panel</motion.span>
                                </Link>
                            </li>
                        </ul>
                    </motion.div>
 
                    <motion.div 
                        className={styles.contactColumn}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h3>Connect</h3>
                        <div className={styles.contactItem}>
                            <MapPin size={18} />
                            <span>Infopark, Kakkanad, Kochi, Kerala</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Phone size={18} />
                            <span>+91 94460 12345</span>
                        </div>
                        <div className={styles.contactItem}>
                            <Mail size={18} />
                            <span>smriidge@gmail.com</span>
                        </div>
                    </motion.div>
 
                    <motion.div 
                        className={styles.newsletterColumn}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h3>Newsletter</h3>
                        <p>Join the ecosystem for exclusive product updates.</p>
                        <div className={styles.inputGroup}>
                            <input type="email" placeholder="Email Address" />
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Join
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Smridge AI. All rights reserved.</p>
                    <div className={styles.bottomLinks}>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;
