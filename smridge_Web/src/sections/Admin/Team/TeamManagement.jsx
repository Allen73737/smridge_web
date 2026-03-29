import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, User, Shield, AlertCircle, RefreshCw, Mail, Instagram, Type, Camera, X, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import styles from './TeamManagement.module.css';

// --- Cropper Utility ---
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas.toDataURL('image/jpeg', 0.9);
}
// ----------------------

const TeamManagement = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    // Cropper Modals States
    const [croppingMemberId, setCroppingMemberId] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const fileInputRef = useRef(null);

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/team');
            setMembers(data);
        } catch (error) {
            console.error(error);
            showToast('Failed to fetch team members', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleUpdate = async (id) => {
        try {
            setSaving(true);
            const memberToUpdate = members.find(m => m._id === id);
            await api.put(`/team/${id}`, memberToUpdate);
            showToast('Member updated successfully', 'success');
            // Re-fetch to guarantee paths are correct
            fetchMembers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Update failed', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (id, field, value) => {
        setMembers(members.map(m => m._id === id ? { ...m, [field]: value } : m));
    };

    const handleRoleChange = (id, e) => handleFieldChange(id, 'role', e.target.value);
    const handleNameChange = (id, e) => handleFieldChange(id, 'name', e.target.value);
    const handleBioChange = (id, e) => handleFieldChange(id, 'bio', e.target.value);
    const handleGmailChange = (id, e) => handleFieldChange(id, 'gmail', e.target.value);
    const handleInstaChange = (id, e) => handleFieldChange(id, 'instagram', e.target.value);
    const handleOrderChange = (id, e) => handleFieldChange(id, 'order', parseInt(e.target.value) || 0);

    // --- Image Selection & Cropping Flow ---
    const triggerFileSelect = (memberId) => {
        if(fileInputRef.current) {
            fileInputRef.current.dataset.memberId = memberId;
            fileInputRef.current.click();
        }
    };

    const onSelectFile = (e) => {
        const id = e.target.dataset.memberId;
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setCroppingMemberId(id);
                setCrop({ x: 0, y: 0 });
                setZoom(1);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const processCrop = async () => {
        try {
            const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
            
            setMembers(members.map(m => 
                m._id === croppingMemberId 
                ? { ...m, photo: croppedImageBase64, photoBase64: croppedImageBase64 } 
                : m
            ));

            closeModal();
            showToast('Photo cropped. Don\'t forget to hit Save Changes!', 'info');
        } catch (e) {
            console.error(e);
            showToast('Failed to crop image', 'error');
        }
    };

    const closeModal = () => {
        setCroppingMemberId(null);
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spinner} size={32} />
                <p>Loading Team Data...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={onSelectFile} 
            />

            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <Shield className={styles.headerIcon} />
                    <div>
                        <h1>Team Management</h1>
                        <p>Customize team identities, roles, and content for the public website.</p>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{members.length}</span>
                        <span className={styles.statLabel}>Total Members</span>
                    </div>
                </div>
            </div>

            <div className={styles.alert}>
                <AlertCircle size={20} />
                <p>Changes made here, including cropped photos, will securely update the 3D team section upon save.</p>
            </div>

            <div className={styles.grid}>
                {members.map((member) => (
                    <motion.div 
                        key={member._id}
                        className={styles.memberCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.cardHeader}>
                            <div className={styles.avatarWrapper} onClick={() => triggerFileSelect(member._id)}>
                                <img src={member.photo} alt={member.name} className={styles.avatar} />
                                <div className={styles.cameraOverlay}>
                                    <Camera size={24} />
                                </div>
                            </div>
                            <div className={styles.memberMeta}>
                                <h3>{member.name}</h3>
                                <span className={styles.roleTag}>{member.role}</span>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={18} />
                                    <input 
                                        type="text" 
                                        value={member.name} 
                                        onChange={(e) => handleNameChange(member._id, e)}
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Role</label>
                                <div className={styles.inputWrapper}>
                                    <Shield size={18} />
                                    <input 
                                        type="text" 
                                        value={member.role} 
                                        onChange={(e) => handleRoleChange(member._id, e)}
                                        placeholder="e.g. Co-Founder & CEO"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <label>Gmail</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail size={18} />
                                        <input 
                                            type="email" 
                                            value={member.gmail || ''} 
                                            onChange={(e) => handleGmailChange(member._id, e)}
                                            placeholder="founder@smridge.com"
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Display Order</label>
                                    <div className={styles.inputWrapper}>
                                        <RefreshCw size={18} />
                                        <input 
                                            type="number" 
                                            value={member.order || 0} 
                                            onChange={(e) => handleOrderChange(member._id, e)}
                                            placeholder="0"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Instagram</label>
                                <div className={styles.inputWrapper}>
                                    <Instagram size={18} />
                                    <input 
                                        type="text" 
                                        value={member.instagram || ''} 
                                        onChange={(e) => handleInstaChange(member._id, e)}
                                        placeholder="@handle"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Biography</label>
                                <div className={styles.inputWrapper}>
                                    <Type size={18} />
                                    <textarea 
                                        value={member.bio || ''} 
                                        onChange={(e) => handleBioChange(member._id, e)}
                                        placeholder="Write an AI-themed vision bio for this founder..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardFooter}>
                            <button 
                                className={styles.saveBtn}
                                onClick={() => handleUpdate(member._id)}
                                disabled={saving}
                            >
                                {saving ? <RefreshCw className={styles.spinner} size={18} /> : <Save size={18} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Cropper Modal */}
            <AnimatePresence>
                {imageSrc && (
                    <motion.div 
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className={styles.modalContent}
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <h2><Crop size={24} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }}/> Crop Photo</h2>
                                <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>
                            </div>
                            
                            <div className={styles.cropContainer}>
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={3 / 4} // Standard portrait
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            </div>

                            <div className={styles.controls}>
                                <label>Zoom</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(e.target.value)}
                                    className={styles.slider}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                                <button className={styles.cropBtn} onClick={processCrop}>
                                    <Crop size={18} /> Apply Crop
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default TeamManagement;
