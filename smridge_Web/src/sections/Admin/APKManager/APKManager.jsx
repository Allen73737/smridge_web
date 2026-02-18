import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileCode, CheckCircle, Download } from 'lucide-react';
import styles from './APKManager.module.css';

import api from '../../../services/api';

const APKManager = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [version, setVersion] = useState("2.1.0");
    const [notes, setNotes] = useState("");
    const [latestAPK, setLatestAPK] = useState(null);
    const [fileToUpload, setFileToUpload] = useState(null);

    React.useEffect(() => {
        const fetchAPK = async () => {
            try {
                const { data } = await api.get('/apk/latest');
                setLatestAPK(data);
            } catch (error) {
                console.log("No APK found");
            }
        };
        fetchAPK();
    }, []);

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
        document.getElementById('apkInput').click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const startUpload = async () => {
        if (!fileToUpload) return alert("Please select a file");

        setIsUploading(true);
        const formData = new FormData();
        formData.append('apk', fileToUpload);
        formData.append('version', version);
        formData.append('releaseNotes', notes);

        try {
            await api.post('/apk/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            alert('Upload Successful!');
            setFileToUpload(null);
            setUploadProgress(0);

            // Refresh
            const { data } = await api.get('/apk/latest');
            setLatestAPK(data);
        } catch (error) {
            alert('Upload Failed');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>APK Management</h1>
                <p>Deploy new firmware versions to all connected units.</p>
            </div>

            <div className={styles.grid}>
                <motion.div
                    className={styles.uploadCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3>Upload New Build</h3>

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
                                <span>Uploading... {uploadProgress}%</span>
                            </div>
                        ) : (
                            <>
                                <Upload size={48} className={styles.uploadIcon} />
                                <p>{fileToUpload ? fileToUpload.name : 'Drag & Drop APK file here'}</p>
                                <input
                                    type="file"
                                    id="apkInput"
                                    accept=".apk"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button className={styles.browseBtn} onClick={handleBrowse}>
                                    {fileToUpload ? 'Change File' : 'Browse Files'}
                                </button>
                            </>
                        )}
                    </div>

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
                        <CheckCircle size={18} /> Deploy to Production
                    </button>
                </motion.div>

                <motion.div
                    className={styles.infoCard}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3>Current Active Build</h3>

                    <div className={styles.currentVersion}>
                        <FileCode size={40} className={styles.fileIcon} />
                        <div>
                            <div className={styles.versionNumber}>{latestAPK ? latestAPK.version : 'N/A'}</div>
                            <div className={styles.pubDate}>Published: {latestAPK ? new Date(latestAPK.uploadedAt).toLocaleDateString() : '-'}</div>
                        </div>
                    </div>

                    <div className={styles.statRow}>
                        <span>Size</span>
                        <span>{latestAPK ? latestAPK.fileSize : '-'}</span>
                    </div>
                    <div className={styles.statRow}>
                        <span>Downloads</span>
                        <span>-</span>
                    </div>
                    <div className={styles.statRow}>
                        <span>Notes</span>
                        <span className={styles.hash} style={{ maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {latestAPK?.releaseNotes || '-'}
                        </span>
                    </div>

                    <button className={styles.downloadBtn}>
                        <Download size={18} /> Download Current APK
                    </button>

                    <div className={styles.warningBox}>
                        <strong>Note:</strong> Rollbacks must be performed manually via CLI access if the new build fails integrity checks.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default APKManager;
