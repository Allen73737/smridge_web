import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../../assets/smridge_logo.png';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = ['Vision', 'Technology', 'Features', 'Insights', 'App', 'Team'];

    return (
        <>
            <motion.nav
                className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
                style={{ position: 'fixed' }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.logoContainer}>
                    <img src={logo} alt="SMRIDGE" className={styles.logoImage} />
                    <span className={styles.logoText}>SMRIDGE</span>
                </div>

                <div className={styles.desktopMenu}>
                    {menuItems.map((item) => (
                        <motion.a 
                            key={item} 
                            href={`#${item.toLowerCase()}`} 
                            onClick={(e) => {
                                e.preventDefault();
                                if (window.premiumScrollTo) window.premiumScrollTo(item.toLowerCase());
                            }}
                            className={styles.navLink}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item}
                            <span className={styles.linkUnderline}></span>
                        </motion.a>
                    ))}
                    <motion.div 
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)" }}
                    >
                        <Link to="/admin" className={styles.adminLink}>
                            Admin Access
                        </Link>
                    </motion.div>
                </div>

                <div className={styles.mobileActions}>
                    <motion.div 
                        className={styles.mobileToggle} 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        animate={{ rotate: isMenuOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                        <ChevronDown size={28} color="#00f0ff" />
                    </motion.div>
                </div>

                <motion.div className={styles.progressBar} style={{ scaleX }} />
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={styles.mobileLinksGrid}>
                            {[...menuItems, 'Admin'].map((item, index) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {item === "Admin" ? (
                                        <Link
                                            to="/admin"
                                            onClick={() => setIsMenuOpen(false)}
                                            className={styles.mobileGridLink}
                                        >
                                            <span className={styles.linkContent}>{item}</span>
                                        </Link>
                                    ) : (
                                        <a
                                            href={`#${item.toLowerCase()}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (window.premiumScrollTo) window.premiumScrollTo(item.toLowerCase());
                                                setIsMenuOpen(false);
                                            }}
                                            className={styles.mobileGridLink}
                                        >
                                            <span className={styles.linkContent}>{item}</span>
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;

