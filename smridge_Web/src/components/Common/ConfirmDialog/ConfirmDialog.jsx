import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay}>
                <motion.div 
                    className={styles.modal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className={styles.header}>
                        <div className={`${styles.iconWrapper} ${styles[type]}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <button onClick={onCancel} className={styles.closeBtn}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        <h3>{title}</h3>
                        <p>{message}</p>
                    </div>

                    <div className={styles.footer}>
                        <button onClick={onCancel} className={styles.cancelBtn}>
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className={`${styles.confirmBtn} ${styles[`confirm${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmDialog;
