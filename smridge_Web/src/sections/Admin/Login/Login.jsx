import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import styles from './Login.module.css';

import { useAuth } from '../../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user, loading: authLoading } = useAuth();

    React.useEffect(() => {
        if (!authLoading && user) {
            navigate('/admin/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className={styles.container}>
            <button 
                className={styles.backBtn}
                onClick={() => navigate('/')}
            >
                <ArrowLeft size={18} />
                <span>Return to Website</span>
            </button>

            <motion.div
                className={styles.loginCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.logo}>
                    <h1>SMRIDGE</h1>
                    <span>ADMIN PORTAL</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Admin ID or Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <motion.button
                        className={styles.loginBtn}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : <>{'Authenticate'} <ArrowRight size={18} /></>}
                    </motion.button>
                </form>

                <div className={styles.footer}>
                    <p>Restricted Access. Authorized Personnel Only.</p>
                </div>
            </motion.div>

            <div className={styles.backgroundGlow} />
        </div>
    );
};

export default Login;
