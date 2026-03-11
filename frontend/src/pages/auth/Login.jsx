import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Card, TextField, Button, Typography, Alert, InputAdornment,
    IconButton, CircularProgress, Link, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, MedicalServices } from '@mui/icons-material';
import { toast } from 'react-toastify';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await login(formData.email, formData.password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin' : '/retailer');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 30%, #00bfa5 70%, #00897b 100%)',
            p: 2,
        }}>
            <Card sx={{
                maxWidth: 460, width: '100%', p: { xs: 3, sm: 5 },
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(20px)',
                background: 'rgba(255,255,255,0.97)',
            }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 68, height: 68, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0d47a1, #00bfa5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mx: 'auto', mb: 2, boxShadow: '0 8px 24px rgba(13,71,161,0.3)',
                    }}>
                        <MedicalServices sx={{ color: 'white', fontSize: 34 }} />
                    </Box>
                    <Typography variant="h4" fontWeight={800} sx={{
                        background: 'linear-gradient(135deg, #0d47a1, #00bfa5)',
                        backgroundClip: 'text', WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        MediLink
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                        Sign in to your account
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth label="Email Address" type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        sx={{ mb: 2.5 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>
                        }}
                    />
                    <TextField
                        fullWidth label="Password" required
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit" fullWidth variant="contained" size="large"
                        disabled={loading}
                        sx={{
                            py: 1.5, fontSize: '1rem', fontWeight: 700,
                            background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #00bfa5 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #002171 0%, #0d47a1 50%, #008e76 100%)',
                                boxShadow: '0 6px 20px rgba(13,71,161,0.4)',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </form>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">New to MediLink?</Typography>
                </Divider>

                <Button
                    component={RouterLink} to="/register" fullWidth variant="outlined" size="large"
                    sx={{
                        py: 1.3, borderWidth: 2, fontWeight: 600,
                        '&:hover': { borderWidth: 2 },
                    }}
                >
                    Register as Retailer
                </Button>
            </Card>
        </Box>
    );
};

export default Login;
