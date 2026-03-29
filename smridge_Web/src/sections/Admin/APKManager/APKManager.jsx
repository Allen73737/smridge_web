import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileCode, CheckCircle, Download, Smartphone, Apple, Star, Trash2 } from 'lucide-react';
import styles from './APKManager.module.css';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const BuildManager = () => {
    const { showToast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [version, setVersion] = useState("2.1.0");
    const [notes, setNotes] = useState("");
    const [platform, setPlatform] = useState("android");
    const [isLink, setIsLink] = useState(false);
    const [externalLink, setExternalLink] = useState("");
    const [fileToUpload, setFileToUpload] = useState(null);
    const [history, setHistory] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // ID of build to delete

    const fetchLatest = async (p) => {
        try {
            const { data } = await api.get(`/apk/history/${p}`);
            setHistory(data);
        } catch (err) {
            console.error("Fetch latest failed:", err);
            setHistory([]);
        }
    };

    useEffect(() => {
        fetchLatest(platform);
    }, [platform]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFileToUpload(e.dataTransfer.files[0]);
        }
    };

    const handleBrowse = () => {
        document.getElementById('buildInput').click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const startUpload = async () => {
        if (!fileToUpload && !isLink) return showToast("Please select a file or provide a link", "error");
        if (isLink && !externalLink) return showToast("Please provide a valid download link", "error");

        setIsUploading(true);
        const formData = new FormData();
        if (fileToUpload) formData.append('file', fileToUpload);
        formData.append('version', version);
        formData.append('releaseNotes', notes);
        formData.append('platform', platform);
        formData.append('isLink', isLink);
        formData.append('externalLink', externalLink);

        try {
            await api.post('/apk/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            showToast(`${platform.toUpperCase()} Build Deployed Successfully!`, "success");
            setFileToUpload(null);
            setExternalLink("");
            setUploadProgress(0);
            fetchLatest(platform);
        } catch (err) {
            console.error("Upload failed:", err);
            showToast('Deployment Failed. Please check server logs.', "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSetLatest = async (id) => {
        try {
            await api.put(`/apk/${id}/latest`);
            showToast("Latest version updated successfully", "success");
            fetchLatest(platform);
        } catch (err) {
            console.error("Set latest failed:", err);
            showToast("Failed to update latest version", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/apk/${id}`);
            showToast("Build removed from ecosystem", "info");
            setShowDeleteConfirm(null);
            fetchLatest(platform);
        } catch (err) {
            console.error("Delete failed:", err);
            showToast("Failed to delete build", "error");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Ecosystem Build Manager</h1>
                <p>Deploy cross-platform updates across the Smridge network.</p>
            </div>

            <div className={styles.platformTabs}>
                <button 
                    className={`${styles.tab} ${platform === 'android' ? styles.activeTab : ''}`}
                    onClick={() => setPlatform('android')}
                >
                    <Smartphone size={18} /> Android (.apk)
                </button>
                <button 
                    className={`${styles.tab} ${platform === 'ios' ? styles.activeTab : ''}`}
                    onClick={() => setPlatform('ios')}
                >
                    <Apple size={18} /> iOS (.ipa)
                </button>
            </div>

            <div className={styles.grid}>
                <motion.div
                    className={styles.uploadCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.uploadTypeToggle}>
                        <button 
                            className={`${styles.typeBtn} ${!isLink ? styles.activeType : ''}`}
                            onClick={() => setIsLink(false)}
                        >
                            File Upload
                        </button>
                        <button 
                            className={`${styles.typeBtn} ${isLink ? styles.activeType : ''}`}
                            onClick={() => setIsLink(true)}
                        >
                            External Link
                        </button>
                    </div>

                    {!isLink ? (
                        <div
                            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {isUploading ? (
                                <div className={styles.uploadingState}>
                                    <div className={styles.progressBar}>
                                        <motion.div
                                            className={styles.progressFill}
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <span>Deploying... {uploadProgress}%</span>
                                </div>
                            ) : (
                                <>
                                    <Upload size={48} className={styles.uploadIcon} />
                                    <p>{fileToUpload ? fileToUpload.name : `Drag & Drop ${platform.toUpperCase()} file here`}</p>
                                    <input
                                        type="file"
                                        id="buildInput"
                                        accept={platform === 'android' ? ".apk" : ".ipa"}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <button className={styles.browseBtn} onClick={handleBrowse}>
                                        {fileToUpload ? 'Change File' : 'Browse Files'}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={styles.linkInputContainer}>
                            <label>Download Link (iOS Only/Recommended)</label>
                            <input
                                type="url"
                                placeholder="https://testflight.apple.com/join/..."
                                value={externalLink}
                                onChange={(e) => setExternalLink(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>Version Tag</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Release Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={styles.textarea}
                            rows={4}
                        />
                    </div>

                    <button className={styles.deployBtn} onClick={startUpload} disabled={isUploading}>
                        <CheckCircle size={18} /> Deploy to {platform.toUpperCase()} Production
                    </button>
                </motion.div>

                <motion.div
                    className={styles.infoCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.historyHeader}>
                        <h3>Version History</h3>
                        <div className={styles.countBadge}>{history.length} Builds</div>
                    </div>

                    <div className={styles.historyList}>
                        {history.map((build) => (
                            <div key={build._id} className={`${styles.historyItem} ${build.isLatest ? styles.latest : ''}`}>
                                <div className={styles.historyMeta}>
                                    <div className={styles.versionCol}>
                                        <span className={styles.vNum}>{build.version}</span>
                                        {build.isLatest && <span className={styles.latestTag}>LATEST</span>}
                                    </div>
                                    <span className={styles.vDate}>{new Date(build.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.historyActions}>
                                    {!build.isLatest && (
                                        <button 
                                            onClick={() => handleSetLatest(build._id)}
                                            className={styles.miniBtn}
                                            title="Mark as Latest"
                                        >
                                            <Star size={14} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => window.open(build.isLink ? (build.externalLink || build.fileUrl) : (build.fileUrl && (build.fileUrl.startsWith('http') ? build.fileUrl : `${api.defaults.baseURL.replace('/api', '')}${build.fileUrl}`)), '_blank')}
                                        className={styles.miniBtn}
                                        title="Download/Open"
                                    >
                                        <Download size={14} />
                                    </button>
                                    <button 
                                        onClick={() => setShowDeleteConfirm(build._id)} 
                                        className={`${styles.miniBtn} ${styles.deleteBtn}`}
                                        title="Delete Build"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && <div className={styles.emptyHistory}>No builds deployed yet.</div>}
                    </div>

                    <div className={styles.warningBox}>
                        <strong>Live Ecosystem:</strong> Updates are instantly visible in the 'Sync the Ecosystem' section of the public website.
                    </div>
                </motion.div>
            </div>

            {/* Premium Delete Confirmation Snackbar */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className={styles.snackbarOverlay}>
                        <motion.div 
                            className={styles.deleteSnackbar}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <div className={styles.snackbarContent}>
                                <div className={styles.snackbarIcon}>
                                    <Trash2 size={24} />
                                </div>
                                <div className={styles.snackbarText}>
                                    <h4>Delete Version {history.find(b => b._id === showDeleteConfirm)?.version}?</h4>
                                    <p>This action is permanent and cannot be undone.</p>
                                </div>
                            </div>
                            <div className={styles.snackbarActions}>
                                <button 
                                    className={styles.cancelBtn} 
                                    onClick={() => setShowDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className={styles.confirmDeleteBtn}
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                >
                                    Confirm Permanent Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BuildManager;
