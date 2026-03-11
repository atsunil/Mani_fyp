import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Card, TextField, Button, Typography, Alert, InputAdornment,
    IconButton, CircularProgress, Grid, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, MedicalServices } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', phone: '',
        shopName: '', address: '', city: '', state: '', pincode: '',
        gstNumber: '', drugLicenseNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = await register(formData);
            toast.success(`Welcome, ${user.name}! Your ID: ${user.userId}`);
            navigate('/retailer');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 30%, #00bfa5 70%, #00897b 100%)',
            p: 2, py: 4,
        }}>
            <Card sx={{
                maxWidth: 700, width: '100%', p: { xs: 3, sm: 5 },
                borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                background: 'rgba(255,255,255,0.97)',
            }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0d47a1, #00bfa5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 1.5,
                    }}>
                        <MedicalServices sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={800} sx={{
                        background: 'linear-gradient(135deg, #0d47a1, #00bfa5)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Retailer Registration
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create your MediLink account
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                        Personal Details
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Full Name" name="name" required value={formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Email" name="email" type="email" required value={formData.email} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="Password" name="password" required
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password} onChange={handleChange}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1.5 }}>
                        Shop Details
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Shop Name" name="shopName" required value={formData.shopName} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Address" name="address" required multiline rows={2} value={formData.address} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Drug License Number" name="drugLicenseNumber" value={formData.drugLicenseNumber} onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading}
                        sx={{
                            py: 1.5, fontSize: '1rem', fontWeight: 700, mt: 1,
                            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #00bfa5 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #002171 0%, #0d47a1 50%, #008e76 100%)' },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                </form>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">Already have an account?</Typography>
                </Divider>

                <Button component={RouterLink} to="/login" fullWidth variant="outlined" size="large"
                    sx={{ py: 1.2, borderWidth: 2, fontWeight: 600, '&:hover': { borderWidth: 2 } }}
                >
                    Sign In
                </Button>
            </Card>
        </Box>
    );
};

export default Register;
