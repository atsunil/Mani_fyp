import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Avatar, Skeleton
} from '@mui/material';
import { ShoppingCart, LocalPharmacy, TrendingUp, Pending } from '@mui/icons-material';
import { orderAPI, productAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'error' };

const RetailerDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getMyOrders();
            setOrders(res.data.orders);
        } catch { toast.error('Failed to load orders'); }
        finally { setLoading(false); }
    };

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalSpent = orders.filter(o => ['confirmed', 'delivered'].includes(o.status))
        .reduce((s, o) => s + parseFloat(o.totalAmount), 0);

    if (loading) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map(i => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Skeleton variant="rounded" height={130} sx={{ borderRadius: 4 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Welcome, {user?.name}!</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Your Retailer ID: <Chip label={user?.userId} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} />
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Orders</Typography>
                                    <Typography variant="h4" fontWeight={800}>{totalOrders}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><ShoppingCart /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Pending</Typography>
                                    <Typography variant="h4" fontWeight={800}>{pendingOrders}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><Pending /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Delivered</Typography>
                                    <Typography variant="h4" fontWeight={800}>{deliveredOrders}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><LocalPharmacy /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Spent</Typography>
                                    <Typography variant="h4" fontWeight={800}>₹{totalSpent.toLocaleString()}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><TrendingUp /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={2}>Recent Orders</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Total (₹)</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.slice(0, 10).map(order => (
                                <TableRow key={order._id || order.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</TableCell>
                                    <TableCell>{order.items?.length || 0} items</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                    <TableCell><Chip label={order.status} size="small" color={statusColors[order.status]} sx={{ textTransform: 'capitalize' }} /></TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No orders yet. Start by placing your first order!</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default RetailerDashboard;
