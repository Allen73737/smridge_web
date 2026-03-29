import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import styles from './Team.module.css';
import api from '../../services/api';

// Local Assets from public folder
const LOCAL_PHOTOS = ['/team/member1_real.jpg', '/team/member2_real.jpg', '/team/member3_real.jpg', '/team/member4_real.jpg'];

/* ─────────────────────────────────────────────────────────────
   Hardcoded fallback team (when API is empty / unavailable)
───────────────────────────────────────────────────────────── */
const FALLBACK_TEAM = [
  {
    _id: 'f1',
    name: 'Aaryan Sharma',
    role: 'Co-Founder & CEO',
    gmail: 'aaryan@smridge.com',
    instagram: '@aaryan_smridge',
    bio: 'Visionary architect behind Smridge\'s core IoT sensor pipeline.',
    photo: LOCAL_PHOTOS[0],
  },
  {
    _id: 'f2',
    name: 'Aditya Nair',
    role: 'Co-Founder & CTO',
    gmail: 'aditya@smridge.com',
    instagram: '@aditya_smridge',
    bio: 'Full-stack innovator who transforms raw hardware telemetry into predictive insights.',
    photo: LOCAL_PHOTOS[1],
  },
  {
    _id: 'f3',
    name: 'Tushar Mehta',
    role: 'Co-Founder & CPO',
    gmail: 'tushar@smridge.com',
    instagram: '@tushar_smridge',
    bio: 'The systems mind of Smridge. Designs the back-end infrastructure.',
    photo: LOCAL_PHOTOS[2],
  },
  {
    _id: 'f4',
    name: 'Rahul Verma',
    role: 'Co-Founder & COO',
    gmail: 'rahul@smridge.com',
    instagram: '@rahul_smridge',
    bio: 'Creative technologist bridging product design and hardware engineering.',
    photo: LOCAL_PHOTOS[3],
  },
];

/* ─────────────────────────────────────────────────────────────
   Enrich raw API data with defaults for optional fields
───────────────────────────────────────────────────────────── */
const enrich = (members) =>
  members.map((m, i) => {
    const name = m.name || `Founder ${i + 1}`;
    
    // TRUST THE DATABASE PHOTO FIRST.
    // If missing, use a fallback from LOCAL_PHOTOS based on index i.
    let finalPhoto = m.photo || LOCAL_PHOTOS[i % 4];
    
    // Legacy support: mapping /src/assets/team/ paths to /team/ public paths
    if (typeof finalPhoto === 'string' && finalPhoto.startsWith('/src/assets/team/')) {
        const fileName = finalPhoto.split('/').pop();
        finalPhoto = `/team/${fileName}`;
    }

    return {
      ...m,
      name,
      role: m.role || 'Founder',
      photo: finalPhoto,
      gmail: m.gmail || '',
      instagram: m.instagram || '',
      bio: m.bio || '',
    };
  });

/* ─────────────────────────────────────────────────────────────
   Typewriter Component for Animated Text
───────────────────────────────────────────────────────────── */
const TypewriterText = ({ text, delay = 0, speed = 15, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed); // Speed of typing
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`${styles.boldText} ${className}`}
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={styles.cursor}
      >
        |
      </motion.span>
    </motion.span>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Team Component
───────────────────────────────────────────────────────────── */
const Team = () => {
  const [members, setMembers] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  
  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.85, 1, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [60, 0, 0, -60]);

  // Fetch or fallback
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/team');
        setMembers(data && data.length > 0 ? enrich(data) : enrich(FALLBACK_TEAM));
      } catch {
        setMembers(enrich(FALLBACK_TEAM));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Navigation helpers
  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIdx((p) => (p + 1) % members.length);
  }, [members.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIdx((p) => (p - 1 + members.length) % members.length);
  }, [members.length]);

  // Auto-advance every 8 seconds + progress bar
  useEffect(() => {
    if (!members.length) return;
    setProgress(0);
    const TOTAL = 8000;
    const TICK = 50;
    let elapsed = 0;

    const progressTimer = setInterval(() => {
      elapsed += TICK;
      setProgress(Math.min((elapsed / TOTAL) * 100, 100));
    }, TICK);

    const advanceTimer = setTimeout(() => {
      goNext();
    }, TOTAL);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(advanceTimer);
    };
  }, [currentIdx, members.length, goNext]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader} />
      </div>
    );
  }

  const m = members[currentIdx];
  const displayNum = String(currentIdx + 1).padStart(2, '0');

  // Premium scroll-triggered entrance variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      filter: 'blur(10px)',
      y: 100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { 
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1], // Premium Cubic Bezier
        staggerChildren: 0.15
      }
    }
  };

  const staggerVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      rotateX: -10,
      filter: 'blur(5px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      filter: 'blur(0px)',
      transition: { 
        duration: 0.8, 
        ease: [0.33, 1, 0.68, 1] 
      }
    }
  };

  // Premium Sliding Variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 80 : -80,
      opacity: 0,
      filter: 'blur(12px)',
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: { 
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        filter: { duration: 0.6 },
        scale: { duration: 0.5 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 80 : -80,
      opacity: 0,
      filter: 'blur(12px)',
      scale: 0.9,
      transition: { 
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        filter: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <motion.section 
      className={styles.teamSection} 
      id="team"
      ref={containerRef}
      style={{ 
        opacity, 
        scale, 
        y: translateY
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* ── BACKGROUND BLUR LAYER ── */}
      <div className={styles.backgroundBlurWrapper}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={m.photo}
            custom={direction}
            className={styles.backgroundBlur}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ backgroundImage: `url(${m.photo})` }}
          />
        </AnimatePresence>
      </div>

      <div className={styles.gridContainer}>

        {/* ── ROW 1: HEADER ── */}
        <motion.div 
          className={`${styles.cell} ${styles.headerLeft}`}
          variants={staggerVariants}
        >
          SMRIDGE / FOUNDERS
        </motion.div>
        <motion.div 
          className={`${styles.cell} ${styles.headerCenter}`}
          variants={staggerVariants}
        >
          {`${displayNum} / ${String(members.length).padStart(2, '0')}`}
        </motion.div>
        <motion.div 
          className={`${styles.cell} ${styles.headerRight}`}
          variants={staggerVariants}
        >
          SMRIDGE.
        </motion.div>

        {/* ── ROW 2+3: LEFT — Title + Member Info ── */}
        <motion.div 
          className={`${styles.cell} ${styles.mainTitleArea}`}
          variants={staggerVariants}
        >
          <div className={styles.titleBlock}>
            <h2 className={styles.mainTitle}>
              MEET<br />THE<br />FOUNDERS
            </h2>

            <div className={styles.missionText}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mission-${currentIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <TypewriterText text="THE ONES WHO ARE SHAPING THE FUTURE" delay={0.2} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 2+3: CENTER — Photo ── */}
        <motion.div 
          className={`${styles.cell} ${styles.imageArea}`}
          variants={staggerVariants}
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div
              key={currentIdx}
              className={styles.imageFrame}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
            >
              <img
                src={m.photo}
                alt={m.name}
                className={styles.founderImage}
              />
              <div className={styles.imageOverlay} />
              
              {/* Scanning line animation */}
              <motion.div 
                className={styles.scanningLine}
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: 0.3 
                }}
              />

            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── ROW 2+3: RIGHT — Large Name Display ── */}
        <motion.div 
          className={`${styles.cell} ${styles.rightContentArea}`}
          variants={staggerVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={`r-info-${currentIdx}`}
              className={styles.rightContentInner}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className={styles.indexNumber}>{displayNum}.</div>
              <div className={styles.indexSeparator} />
              {(() => {
                const TARGET_DURATION = 1500; // Animation duration target in ms
                const nameSpeed = Math.max(2, Math.floor(TARGET_DURATION / m.name.length));
                
                return (
                  <>
                    <motion.div 
                      className={styles.verticalTitle}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <TypewriterText text={m.name.toUpperCase()} delay={0.1} speed={nameSpeed} />
                    </motion.div>
                    <motion.div 
                      className={styles.rightBio}
                      initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                      {m.bio}
                    </motion.div>
                  </>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── ROW 4: BOTTOM NAV ── */}
        <motion.div 
          className={`${styles.cell} ${styles.bottomLeftSocial}`}
          variants={staggerVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={`social-l-${currentIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={styles.socialInner}
            >
              <span className={styles.socialLabel}>GMAIL</span>
              <span className={styles.socialValue}>
                <TypewriterText text={m.gmail} delay={0.6} />
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className={`${styles.cell} ${styles.bottomCenter}`}
          variants={staggerVariants}
        >
          <button className={styles.navBtn} onClick={goPrev}>
            PREVIOUS
          </button>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <button className={styles.navBtn} onClick={goNext}>
            NEXT
          </button>
        </motion.div>

        <motion.div 
          className={`${styles.cell} ${styles.bottomRightSocial}`}
          variants={staggerVariants}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={`social-r-${currentIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={styles.socialInnerR}
            >
              <span className={styles.socialLabel}>INSTAGRAM</span>
              <span className={styles.socialValue}>
                <TypewriterText text={m.instagram} delay={0.7} />
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Team;