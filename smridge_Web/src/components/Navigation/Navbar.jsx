import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

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

    return (
        <>
            <motion.nav
                className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
                style={{ position: 'fixed' }}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.logo}>
                    <span className={styles.logoText}>SMRIDGE</span>
                </div>

                <div className={styles.desktopMenu}>
                    {['Vision', 'Technology', 'Features', 'Insights', 'App', 'Team'].map((item) => (
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

                <div className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </div>

                <motion.div className={styles.progressBar} style={{ scaleX }} />
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        style={{ position: 'fixed' }}
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "tween" }}
                    >
                        <div className={styles.mobileLinks}>
                            {['Vision', 'Technology', 'Features', 'Insights', 'App', 'Team', 'Admin'].map((item) => (
                                item === "Admin" ? (
                                    <Link
                                        key={item}
                                        to="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className={styles.mobileLink}
                                    >
                                        {item}
                                    </Link>
                                ) : (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (window.premiumScrollTo) window.premiumScrollTo(item.toLowerCase());
                                            setIsMenuOpen(false);
                                        }}
                                        className={styles.mobileLink}
                                    >
                                        {item}
                                    </a>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
