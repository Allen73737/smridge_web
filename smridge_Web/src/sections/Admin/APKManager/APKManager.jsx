import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Upload, FileCode, CheckCircle, Download, Smartphone, Apple,
    Star, Trash2, Link2, Info, X, AlertTriangle, Loader2
} from 'lucide-react';
import styles from './APKManager.module.css';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

/**
 * Uploads a file directly from the browser to Cloudinary using a signed URL.
 * This bypasses Vercel's 4.5 MB serverless body limit entirely.
 *
 * Steps:
 *  1. GET /api/apk/sign         → server returns {signature, timestamp, apiKey, cloudName, folder}
 *  2. POST to Cloudinary upload API directly with the file
 *  3. POST /api/apk/register    → send Cloudinary URL + metadata to save in MongoDB
 */
const directUploadToCloudinary = async ({ file, version, notes, platform, apiInstance, onProgress }) => {
    // Generate publicId before signing
    const ext = file.name.split('.').pop();
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const publicId = `${baseName}-${Date.now()}.${ext}`;

    // ── Step 1: Get signed credentials from our server ──
    onProgress({ step: 1, percent: 0, label: 'Signing upload credentials...' });
    const { data: creds } = await apiInstance.get('/apk/sign', { params: { publicId } });

    // ── Step 2: Upload the file directly → Cloudinary ──
    onProgress({ step: 2, percent: 0, label: 'Uploading to Cloudinary...' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', creds.apiKey);
    formData.append('timestamp', creds.timestamp);
    formData.append('signature', creds.signature);
    formData.append('folder', creds.folder);
    formData.append('public_id', publicId);
    formData.append('resource_type', 'raw');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${creds.cloudName}/raw/upload`;

    const cloudinaryResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', cloudinaryUrl, true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                onProgress({ step: 2, percent: pct, label: `Uploading... ${pct}%` });
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    reject(new Error(err?.error?.message || `Cloudinary error: ${xhr.status}`));
                } catch {
                    reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status})`));
                }
            }
        };

        xhr.onerror = () => reject(new Error('Network error during Cloudinary upload'));
        xhr.send(formData);
    });

    // Ensure HTTPS URL + preserve extension + Force Download (fl_attachment)
    let fileUrl = (cloudinaryResult.secure_url || cloudinaryResult.url || '').replace('http://', 'https://');
    if (fileUrl.includes('/upload/') && !fileUrl.includes('fl_attachment')) {
        fileUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    // ── Step 3: Register the Cloudinary URL in MongoDB ──
    onProgress({ step: 3, percent: 100, label: 'Saving metadata to database...' });

    const fileSizeMB = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const { data: apk } = await apiInstance.post('/apk/register', {
        version,
        releaseNotes: notes,
        platform,
        fileUrl,
        fileSize: fileSizeMB,
        isLink: false,
    });

    return apk;
};

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

const StepIndicator = ({ step, currentStep, label }) => {
    const done = currentStep > step;
    const active = currentStep === step;
    return (
        <div className={`${styles.stepItem} ${done ? styles.stepDone : ''} ${active ? styles.stepActive : ''}`}>
            <div className={styles.stepCircle}>
                {done ? <CheckCircle size={14} /> : <span>{step}</span>}
            </div>
            <span className={styles.stepLabel}>{label}</span>
        </div>
    );
};

const InfoTooltip = ({ text }) => {
    const [visible, setVisible] = useState(false);
    return (
        <span className={styles.infoWrapper}>
            <Info
                size={14}
                className={styles.infoIcon}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
            />
            <AnimatePresence>
                {visible && (
                    <motion.div
                        className={styles.tooltip}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
};

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────

const BuildManager = () => {
    const { showToast } = useToast();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadState, setUploadState] = useState({ active: false, step: 0, percent: 0, label: '' });
    const [version, setVersion] = useState('2.1.0');
    const [notes, setNotes] = useState('');
    const [platform, setPlatform] = useState('android');
    const [isLink, setIsLink] = useState(false);
    const [externalLink, setExternalLink] = useState('');
    const [fileToUpload, setFileToUpload] = useState(null);
    const [history, setHistory] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [errorLog, setErrorLog] = useState(null);

    const fetchHistory = async (p) => {
        try {
            const { data } = await api.get(`/apk/history/${p}`);
            setHistory(data);
        } catch (err) {
            console.error('Fetch history failed:', err);
            setHistory([]);
        }
    };

    useEffect(() => {
        fetchHistory(platform);
    }, [platform]);

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) setFileToUpload(e.dataTransfer.files[0]);
    };
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setFileToUpload(e.target.files[0]);
    };

    const startUpload = async () => {
        if (!fileToUpload && !isLink) return showToast('Please select a file or provide a link', 'error');
        if (isLink && !externalLink) return showToast('Please provide a valid download link', 'error');
        if (!version.trim()) return showToast('Please enter a version tag', 'error');

        setErrorLog(null);
        setUploadState({ active: true, step: 1, percent: 0, label: 'Starting deployment...' });

        try {
            if (isLink) {
                // External link — just register directly (no file, no Cloudinary)
                setUploadState({ active: true, step: 3, percent: 80, label: 'Registering link...' });
                await api.post('/apk/register', {
                    version,
                    releaseNotes: notes,
                    platform,
                    fileUrl: externalLink,
                    fileSize: 'Link',
                    isLink: true,
                    externalLink,
                });
            } else {
                // Direct upload to Cloudinary (bypasses Vercel body limit)
                await directUploadToCloudinary({
                    file: fileToUpload,
                    version,
                    notes,
                    platform,
                    apiInstance: api,
                    onProgress: ({ step, percent, label }) => {
                        setUploadState({ active: true, step, percent, label });
                    },
                });
            }

            setUploadState({ active: false, step: 0, percent: 0, label: '' });
            showToast(`✅ ${platform.toUpperCase()} Build v${version} Deployed!`, 'success');
            setFileToUpload(null);
            setExternalLink('');
            fetchHistory(platform);

        } catch (err) {
            console.error('Deployment error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Unknown error';
            setErrorLog(msg);
            setUploadState({ active: false, step: 0, percent: 0, label: '' });
            showToast('Deployment Failed — see error log below', 'error');
        }
    };

    const handleSetLatest = async (id) => {
        try {
            await api.put(`/apk/${id}/latest`);
            showToast('Latest version updated', 'success');
            fetchHistory(platform);
        } catch {
            showToast('Failed to update latest version', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/apk/${id}`);
            showToast('Build removed from ecosystem', 'info');
            setShowDeleteConfirm(null);
            fetchHistory(platform);
        } catch {
            showToast('Failed to delete build', 'error');
        }
    };

    const isDeploying = uploadState.active;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Ecosystem Build Manager</h1>
                <p>Deploy cross-platform updates across the Smridge network.</p>
            </div>

            {/* Platform Tabs */}
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
                {/* ── Upload Card ── */}
                <motion.div
                    className={styles.uploadCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Upload Type Toggle */}
                    <div className={styles.uploadTypeToggle}>
                        <button
                            className={`${styles.typeBtn} ${!isLink ? styles.activeType : ''}`}
                            onClick={() => setIsLink(false)}
                            disabled={isDeploying}
                        >
                            <Upload size={14} /> File Upload
                            <InfoTooltip text="File is uploaded directly from your browser to Cloudinary — bypasses Vercel's 4.5 MB limit. No file size restrictions." />
                        </button>
                        <button
                            className={`${styles.typeBtn} ${isLink ? styles.activeType : ''}`}
                            onClick={() => setIsLink(true)}
                            disabled={isDeploying}
                        >
                            <Link2 size={14} /> External Link
                            <InfoTooltip text="Paste a direct download URL (e.g. GitHub Releases, Google Drive). No upload needed." />
                        </button>
                    </div>

                    {/* Step Indicator (shown during upload) */}
                    <AnimatePresence>
                        {isDeploying && (
                            <motion.div
                                className={styles.stepsRow}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <StepIndicator step={1} currentStep={uploadState.step} label="Sign" />
                                <div className={styles.stepConnector} />
                                <StepIndicator step={2} currentStep={uploadState.step} label="Upload" />
                                <div className={styles.stepConnector} />
                                <StepIndicator step={3} currentStep={uploadState.step} label="Register" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Drop Zone / Link Input */}
                    {!isLink ? (
                        <div
                            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${isDeploying ? styles.deploying : ''}`}
                            onDragOver={!isDeploying ? handleDragOver : undefined}
                            onDragLeave={!isDeploying ? handleDragLeave : undefined}
                            onDrop={!isDeploying ? handleDrop : undefined}
                        >
                            {isDeploying ? (
                                <div className={styles.uploadingState}>
                                    <Loader2 size={32} className={styles.spinner} />
                                    <p className={styles.deployLabel}>{uploadState.label}</p>
                                    {uploadState.step === 2 && (
                                        <div className={styles.progressBar}>
                                            <motion.div
                                                className={styles.progressFill}
                                                animate={{ width: `${uploadState.percent}%` }}
                                                transition={{ ease: 'linear' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Upload size={48} className={styles.uploadIcon} />
                                    <p>{fileToUpload ? fileToUpload.name : `Drag & Drop ${platform.toUpperCase()} file here`}</p>
                                    {fileToUpload && (
                                        <span className={styles.fileSize}>
                                            {(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    )}
                                    <input
                                        type="file"
                                        id="buildInput"
                                        accept={platform === 'android' ? '.apk' : '.ipa'}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <button className={styles.browseBtn} onClick={() => document.getElementById('buildInput').click()}>
                                        {fileToUpload ? 'Change File' : 'Browse Files'}
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className={styles.linkInputContainer}>
                            <label>
                                <Link2 size={14} style={{ marginRight: 6 }} />
                                Direct Download URL
                            </label>
                            <input
                                type="url"
                                placeholder={platform === 'ios'
                                    ? 'https://testflight.apple.com/join/...'
                                    : 'https://github.com/user/repo/releases/download/v2.1.0/app.apk'}
                                value={externalLink}
                                onChange={(e) => setExternalLink(e.target.value)}
                                className={styles.input}
                                disabled={isDeploying}
                            />
                        </div>
                    )}

                    {/* Error Log */}
                    <AnimatePresence>
                        {errorLog && (
                            <motion.div
                                className={styles.errorBox}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <AlertTriangle size={16} />
                                <div className={styles.errorContent}>
                                    <strong>Deployment Error:</strong>
                                    <code>{errorLog}</code>
                                </div>
                                <button className={styles.errorClose} onClick={() => setErrorLog(null)}>
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Version + Notes */}
                    <div className={styles.formGroup}>
                        <label>Version Tag</label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className={styles.input}
                            placeholder="e.g. 2.1.0"
                            disabled={isDeploying}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Release Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={styles.textarea}
                            rows={3}
                            placeholder="What changed in this build?"
                            disabled={isDeploying}
                        />
                    </div>

                    <button className={styles.deployBtn} onClick={startUpload} disabled={isDeploying}>
                        {isDeploying
                            ? <><Loader2 size={16} className={styles.spinner} /> {uploadState.label}</>
                            : <><CheckCircle size={18} /> Deploy to {platform.toUpperCase()} Production</>
                        }
                    </button>
                </motion.div>

                {/* ── Version History Card ── */}
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
                            <div
                                key={build._id}
                                className={`${styles.historyItem} ${build.isLatest ? styles.latest : ''}`}
                            >
                                <div className={styles.historyMeta}>
                                    <div className={styles.versionCol}>
                                        <span className={styles.vNum}>{build.version}</span>
                                        {build.isLatest && <span className={styles.latestTag}>LATEST</span>}
                                        {build.isLink && <span className={styles.linkTag}><Link2 size={10} /> LINK</span>}
                                    </div>
                                    <div className={styles.versionInfo}>
                                        <span className={styles.vDate}>{new Date(build.uploadedAt || build.createdAt).toLocaleDateString()}</span>
                                        {build.fileSize && build.fileSize !== 'Link' && (
                                            <span className={styles.vSize}>{build.fileSize}</span>
                                        )}
                                    </div>
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
                                        onClick={() => {
                                            let url = build.fileUrl || build.externalLink || '';
                                            url = url.replace('http://', 'https://');
                                            if (url) window.open(url, '_blank');
                                            else showToast('No download URL found', 'error');
                                        }}
                                        className={styles.miniBtn}
                                        title="Download / Open"
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
                        {history.length === 0 && (
                            <div className={styles.emptyHistory}>
                                <FileCode size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p>No builds deployed yet.</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.warningBox}>
                        <strong>Live Ecosystem:</strong> Updates are instantly visible in the
                        &lsquo;Sync the Ecosystem&rsquo; section of the public website.
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
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className={styles.snackbarContent}>
                                <div className={styles.snackbarIcon}><Trash2 size={24} /></div>
                                <div className={styles.snackbarText}>
                                    <h4>Delete Version {history.find(b => b._id === showDeleteConfirm)?.version}?</h4>
                                    <p>This action is permanent and cannot be undone.</p>
                                </div>
                            </div>
                            <div className={styles.snackbarActions}>
                                <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(null)}>
                                    Cancel
                                </button>
                                <button className={styles.confirmDeleteBtn} onClick={() => handleDelete(showDeleteConfirm)}>
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
