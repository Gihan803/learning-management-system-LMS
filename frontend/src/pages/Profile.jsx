import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import NotificationModal from '../components/NotificationModal';

export default function Profile() {
    const { user, fetchUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put('/profile/name', { name });
            await fetchUser();
            setModal({ isOpen: true, type: 'success', message: 'Name updated successfully!' });
        } catch (err) {
            setModal({ isOpen: true, type: 'error', message: err.response?.data?.message || 'Failed to update name.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.put('/profile/password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: newPasswordConfirmation
            });
            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
            setModal({ isOpen: true, type: 'success', message: 'Password updated successfully!' });
        } catch (err) {
            setModal({ isOpen: true, type: 'error', message: err.response?.data?.message || 'Failed to update password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);

        setLoading(true);
        try {
            await API.post('/profile/picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchUser();
            setModal({ isOpen: true, type: 'success', message: 'Profile picture updated successfully!' });
        } catch (err) {
            setModal({ isOpen: true, type: 'error', message: err.response?.data?.message || 'Failed to update profile picture.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark">
            <Navbar />
            <div className="container py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-white">Account Settings</h1>

                    <div className="grid gap-8">
                        {/* Profile Picture Section */}
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold mb-4 text-white">Profile Picture</h2>
                            <div className="flex items-center gap-6">
                                <img 
                                    src={user?.profile_picture_url} 
                                    alt={user?.name} 
                                    className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/50"
                                />
                                <div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="btn btn-outline btn-sm"
                                        disabled={loading}
                                    >
                                        Change Photo
                                    </button>
                                    <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Name Section */}
                        <div className="glass-card p-8">
                            <h2 className="text-xl font-semibold mb-4 text-white">Basic Information</h2>
                            <form onSubmit={handleUpdateName} className="space-y-4">
                                <div className="form-group">
                                    <label className="text-gray-300">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="text-gray-300">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={user?.email}
                                        className="w-full opacity-50 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Password Section */}
                        <div className="glass-card p-8">
                            <h2 className="text-xl font-semibold mb-4 text-white">Change Password</h2>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="form-group">
                                    <label className="text-gray-300">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="text-gray-300">New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-gray-300">Confirm New Password</label>
                                        <input 
                                            type="password" 
                                            value={newPasswordConfirmation}
                                            onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                            className="w-full"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <NotificationModal 
                isOpen={modal.isOpen}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />
        </div>
    );
}
