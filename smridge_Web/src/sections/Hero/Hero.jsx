import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text as ScreenText } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Hero.module.css';
import { Reveal } from '../../components/Effects/Reveal';

/* ─── Animated number counter ─── */
const FridgeModel = () => {
    const meshRef = useRef();

    useFrame(() => {
        const t = performance.now() / 1000;
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(t / 4) / 8; 
            meshRef.current.position.y = Math.sin(t / 1.5) / 20;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Fridge Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.3, 2.5, 1]} />
                <meshPhysicalMaterial
                    color="#080c14"
                    metalness={0.9}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    reflectivity={1}
                    envMapIntensity={1.5}
                />
            </mesh>

            {/* Glossy Front Panel */}
            <mesh position={[0, 0, 0.51]}>
                <planeGeometry args={[1.25, 2.45]} />
                <meshPhysicalMaterial
                    color="#010204"
                    metalness={0.9}
                    roughness={0.05}
                    clearcoat={1}
                    transmission={0.05}
                />
            </mesh>

            {/* Glowing Edge/Handle */}
            <mesh position={[-0.62, 0, 0.52]}>
                <boxGeometry args={[0.04, 1.8, 0.04]} />
                <meshBasicMaterial color="#00f0ff" toneMapped={false} />
                <pointLight position={[0, 0, 0.1]} distance={0.5} intensity={8} color="#00f0ff" />
            </mesh>

            {/* Integrated Door Display (Final Polish) */}
            <group position={[0, 0.82, 0.515]}>
                {/* Clean Glowing Border (Using LineSegments to avoid diagonal triangle lines) */}
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(1.0, 0.72)]} />
                    <lineBasicMaterial color="#00f0ff" transparent opacity={0.9} linewidth={2} />
                </lineSegments>

                {/* Visual Glass Frame & Display Plane */}
                <mesh position={[0, 0, -0.005]}>
                    <planeGeometry args={[0.98, 0.7]} />
                    <meshStandardMaterial 
                        color="#010204"
                        roughness={0}
                        metalness={1}
                        transparent
                        opacity={0.99}
                    />
                </mesh>

                {/* HUD Content using 3D Text (Left-aligned for perfect fit) */}
                <group position={[-0.45, 0.15, 0.02]}>
                    <ScreenText 
                        position={[0, 0, 0]} 
                        fontSize={0.055} 
                        color="#ffffff"
                        anchorX="left"
                        font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                      <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={0.8} />
                        Temperature
                    </ScreenText>
                    <ScreenText 
                        position={[0.9, 0, 0]} 
                        fontSize={0.075} 
                        color="#4df0ff"
                        fontWeight="bold"
                        anchorX="right"
                            font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                        6.0°C
                    </ScreenText>

                    <ScreenText 
                        position={[0, -0.12, 0]} 
                        fontSize={0.055} 
                        color="#ffffff"
                        anchorX="left"
                        font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                      <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={0.8} />
                        Humidity
                    </ScreenText>
                    <ScreenText 
                        position={[0.9, -0.12, 0]} 
                        fontSize={0.075} 
                        color="#4df0ff"
                        fontWeight="bold"
                        anchorX="right"
                            font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                        50%
                    </ScreenText>

                    <ScreenText 
                        position={[0, -0.24, 0]} 
                        fontSize={0.055} 
                        color="#ffffff"
                        anchorX="left"
                        font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                      <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={0.8} />
                        Freshness
                    </ScreenText>
                    {/* ... (dots unchanged) ... */}
                    <group position={[0.7, -0.24, 0]}>
                        <mesh position={[0, 0, 0]}>
                            <circleGeometry args={[0.018, 32]} />
                            <meshBasicMaterial color="#50ffab" />
                        </mesh>
                        <mesh position={[0.1, 0, 0]}>
                            <circleGeometry args={[0.015, 32]} />
                            <meshBasicMaterial color="#ffd740" opacity={0.3} transparent />
                        </mesh>
                        <mesh position={[0.2, 0, 0]}>
                            <circleGeometry args={[0.015, 32]} />
                            <meshBasicMaterial color="#ff5252" opacity={0.3} transparent />
                        </mesh>
                    </group>

                    <ScreenText 
                        position={[0, -0.36, 0]} 
                        fontSize={0.055} 
                        color="#ffffff"
                        anchorX="left"
                        font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                    >
                      <meshBasicMaterial attach="material" color="#ffffff" transparent opacity={0.8} />
                        Door
                    </ScreenText>
                    <group position={[0.7, -0.36, 0]}>
                        <ScreenText 
                            position={[0, 0, 0]} 
                            fontSize={0.075} 
                            color="#50ffab"
                            fontWeight="bold"
                            anchorX="right"
                            font="https://cdn.jsdelivr.net/npm/@fontsource/orbitron/files/orbitron-latin-700-normal.woff"
                        >
                            Closed
                        </ScreenText>
                        <mesh position={[0.15, 0, 0]}>
                            <circleGeometry args={[0.025, 32]} />
                            <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
                        </mesh>
                        <ScreenText 
                            position={[0.15, -0.01, 0.01]} 
                            fontSize={0.025} 
                            color="#50ffab"
                            font="https://cdn.jsdelivr.net/npm/@fontsource/anta/files/anta-latin-400-normal.woff"
                        >
                            ▼
                        </ScreenText>
                    </group>
                </group>

                <pointLight position={[0, 0, 0.1]} distance={0.5} intensity={18} color="#00f0ff" />
            </group>
        </group>
    );
};




const Hero = () => {
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToSection = (id) => {
        if (window.premiumScrollTo) {
            window.premiumScrollTo(id);
        } else {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "20%" : "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <section id="vision" className={styles.heroSection} ref={containerRef} style={{ position: 'relative' }}>
            <motion.div style={{ y: glowY, opacity }} className={styles.backgroundGlow} />
            <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]), opacity }} className={styles.backgroundGlow} />

            <motion.div style={{ y, opacity, scale }} className={styles.contentContainer}>
                <motion.div
                    className={styles.textContent}
                    initial={{ opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? 20 : 0 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <Reveal delay={0.2}>
                        <span className="section-tagline">Where Vision Meets Refrigeration</span>
                    </Reveal>
                    <motion.h2 
                        className={styles.headline}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        viewport={{ once: false, margin: "-50px" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        ENTER THE SMRIDGE ECOSYSTEM. PRECISION COOLING AT YOUR FINGERTIPS.
                    </motion.h2>
                    <Reveal delay={0.6}>
                        <p className={styles.description}>
                            Experience the first AI-powered cooling ecosystem. Smridge doesn't just store your food; it sees, analyzes, and protects your lifestyle with precision freshness monitoring and predictive intelligence.
                        </p>
                    </Reveal>

                    <div className={styles.buttonGroup}>
                        <motion.button
                            className={styles.primaryButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => scrollToSection('technology')}
                        >
                            Explore Technology
                        </motion.button>
                        <motion.button
                            className={styles.secondaryButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => scrollToSection('download')}
                        >
                            Download App
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.modelContainer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                >
                    <Canvas 
                        camera={{ 
                            position: isMobile ? [0, 0, 5] : [0, 0, 5], 
                            fov: isMobile ? 30 : 45 
                        }}
                        gl={{ precision: isMobile ? 'mediump' : 'highp', antialias: true }}
                    >
                        <ambientLight intensity={0.8} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                        <pointLight position={[-10, -10, -10]} intensity={2} color="#00f0ff" />
                        <Environment preset="night" />
                        <FridgeModel />
                        <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#00f0ff" />
                        <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={0.5} />
                    </Canvas>
                </motion.div>
            </motion.div>

            <motion.div
                className={styles.scrollIndicator}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <span>Scroll to Explore</span>
                <div className={styles.scrollLine}></div>
            </motion.div>
        </section>
    );
};

export default Hero;
