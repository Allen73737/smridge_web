import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className={styles.logo}>
                    <span className={styles.logoText}>SMRIDGE</span>
                </div>

                <div className={styles.desktopMenu}>
                    {['Vision', 'Technology', 'Features', 'App'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className={styles.navLink}>
                            {item}
                            <span className={styles.linkUnderline}></span>
                        </a>
                    ))}
                    <a href="/admin" className={styles.adminLink}>Admin Access</a>
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
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "tween" }}
                    >
                        <div className={styles.mobileLinks}>
                            {['Vision', 'Technology', 'Features', 'App', 'Admin'].map((item) => (
                                <a
                                    key={item}
                                    href={item === "Admin" ? "/admin" : `#${item.toLowerCase()}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={styles.mobileLink}
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
