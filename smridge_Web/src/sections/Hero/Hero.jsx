import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, ContactShadows } from '@react-three/drei';
import styles from './Hero.module.css';

const FridgeModel = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        meshRef.current.rotation.y = Math.sin(t / 4) / 4;
        meshRef.current.position.y = Math.sin(t / 1.5) / 10;
    });

    return (
        <group ref={meshRef}>
            {/* Fridge Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.2, 2.4, 1]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.9}
                    roughness={0.1}
                    envMapIntensity={1}
                />
            </mesh>

            {/* Front Panel/Door Split */}
            <mesh position={[0, 0, 0.51]}>
                <planeGeometry args={[1.15, 2.35]} />
                <meshStandardMaterial
                    color="#050505"
                    metalness={1}
                    roughness={0.05}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Glowing Edge/Handle */}
            <mesh position={[0.4, 0, 0.52]}>
                <boxGeometry args={[0.05, 1.5, 0.05]} />
                <meshBasicMaterial color="#00f0ff" toneMapped={false} />
            </mesh>
        </group>
    );
};

const Hero = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

    return (
        <section id="vision" className={styles.heroSection} ref={containerRef}>
            <div className={styles.backgroundGlow} />

            <motion.div style={{ y, opacity, scale }} className={styles.contentContainer}>
                <motion.div
                    className={styles.textContent}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <h2 className={styles.subHeadline}>Next Gen Cooling</h2>
                    <h1 className={styles.headline}>
                        Smridge <br />
                        <span className="text-gradient">The Refrigerator That Thinks.</span>
                    </h1>
                    <p className={styles.description}>
                        Where Vision Meets Refrigeration. Experience the first AI-powered cooling system that creates a zero-waste ecosystem for your home.
                    </p>

                    <div className={styles.buttonGroup}>
                        <motion.button
                            className={styles.primaryButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Technology
                        </motion.button>
                        <motion.button
                            className={styles.secondaryButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                        <ambientLight intensity={0.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00f0ff" />
                        <Environment preset="city" />

                        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                            <FridgeModel />
                        </Float>

                        <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#00f0ff" />
                        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
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
