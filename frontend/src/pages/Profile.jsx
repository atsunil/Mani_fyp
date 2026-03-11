import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Box, Card, Typography, TextField, Button, Grid, Divider, Alert, Avatar
} from '@mui/material';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [profileData, setProfileData] = useState({ name: '', phone: '', shopName: '', address: '', city: '', state: '', pincode: '', gstNumber: '', drugLicenseNumber: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authAPI.getProfile();
                const u = res.data.user;
                setProfile(u);
                setProfileData({
                    name: u.name || '', phone: u.phone || '',
                    shopName: u.retailer?.shopName || '', address: u.retailer?.address || '',
                    city: u.retailer?.city || '', state: u.retailer?.state || '',
                    pincode: u.retailer?.pincode || '', gstNumber: u.retailer?.gstNumber || '',
                    drugLicenseNumber: u.retailer?.drugLicenseNumber || ''
                });
            } catch { toast.error('Failed to load profile'); }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const res = await authAPI.updateProfile(profileData);
            updateUser(res.data.user);
            toast.success('Profile updated');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await authAPI.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
            toast.success('Password changed');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={3}>Profile</Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ width: 80, height: 80, fontSize: 32, mx: 'auto', mb: 2, bgcolor: '#0d47a1' }}>
                            {user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600}>{user?.name}</Typography>
                        <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>{user?.userId}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="caption" color="text.secondary" textTransform="uppercase">{user?.role}</Typography>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Update Profile</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Phone" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                            </Grid>
                            {user?.role === 'retailer' && (
                                <>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField fullWidth label="Shop Name" value={profileData.shopName} onChange={(e) => setProfileData({ ...profileData, shopName: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField fullWidth label="Address" multiline rows={2} value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth label="City" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth label="State" value={profileData.state} onChange={(e) => setProfileData({ ...profileData, state: e.target.value })} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <TextField fullWidth label="Pincode" value={profileData.pincode} onChange={(e) => setProfileData({ ...profileData, pincode: e.target.value })} />
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        <Button variant="contained" onClick={handleUpdateProfile} disabled={loading} sx={{ mt: 2 }}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Card>

                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField fullWidth type="password" label="Current Password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth type="password" label="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth type="password" label="Confirm New Password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                            </Grid>
                        </Grid>
                        <Button variant="outlined" onClick={handleChangePassword} sx={{ mt: 2 }}>Change Password</Button>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
