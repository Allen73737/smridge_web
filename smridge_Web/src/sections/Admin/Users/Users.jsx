import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Trash2, Shield, MoreVertical } from 'lucide-react';
import styles from './Users.module.css';

import api from '../../../services/api';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const handleBlock = async (id) => {
        try {
            const { data } = await api.put(`/users/block/${id}`);
            setUsers(users.map(u => u._id === id ? data : u));
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.usersContainer}>
            <div className={styles.header}>
                <h1>User Management</h1>
                <div className={styles.searchBar}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredUsers.map((user, index) => (
                                <motion.tr
                                    key={user._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={styles.row}
                                >
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>{user.name.charAt(0)}</div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.admin : ''}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${user.isBlocked ? styles.blocked : styles.active}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.actionBtn}><Eye size={16} /></button>
                                            <button className={styles.actionBtn} onClick={() => handleBlock(user._id)}>
                                                <Shield size={16} color={user.isBlocked ? '#ff0055' : 'inherit'} />
                                            </button>
                                            <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(user._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManagement;
