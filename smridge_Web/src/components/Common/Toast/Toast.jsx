import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle className={styles.iconSuccess} size={20} />,
        error: <AlertCircle className={styles.iconError} size={20} />,
        info: <Info className={styles.iconInfo} size={20} />,
    };

    return (
        <motion.div
            className={`${styles.toast} ${styles[type]}`}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            layout
        >
            <div className={styles.iconContainer}>
                {icons[type]}
            </div>
            <div className={styles.content}>
                <p>{message}</p>
            </div>
            <button onClick={onClose} className={styles.closeBtn}>
                <X size={16} />
            </button>
            <div className={styles.progress} />
        </motion.div>
    );
};

export default Toast;
