import { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, Avatar
} from '@mui/material';
import { People, LocalPharmacy, ShoppingCart, TrendingUp, Warning, Pending } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { reportAPI, inventoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'error' };

const StatCard = ({ icon, title, value, color, gradient }) => (
    <Card sx={{
        background: gradient,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(0,0,0,0.15)' },
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5, fontWeight: 500 }}>{title}</Typography>
                    <Typography variant="h4" fontWeight={800}>{value}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 52, height: 52 }}>
                    {icon}
                </Avatar>
            </Box>
        </CardContent>
        <Box sx={{
            position: 'absolute', bottom: -20, right: -20, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [inventorySummary, setInventorySummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashRes, invRes] = await Promise.all([
                reportAPI.getDashboard(),
                inventoryAPI.getSummary()
            ]);
            setStats(dashRes.data.stats);
            setRecentOrders(dashRes.data.recentOrders);
            setMonthlyRevenue(dashRes.data.monthlyRevenue?.map(m => ({
                month: m.month,
                revenue: parseFloat(m.revenue || 0),
                orders: parseInt(m.orders || 0)
            })) || []);
            setInventorySummary(invRes.data.summary);
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map(i => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                            <Skeleton variant="rounded" height={130} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>Dashboard</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Welcome back! Here's your business overview.</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard icon={<People />} title="Total Retailers" value={stats?.totalRetailers || 0}
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard icon={<LocalPharmacy />} title="Total Products" value={stats?.totalProducts || 0}
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard icon={<ShoppingCart />} title="Total Orders" value={stats?.totalOrders || 0}
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard icon={<TrendingUp />} title="Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`}
                        gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #ff9800' }}>
                        <Pending sx={{ color: '#ff9800', fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700}>{stats?.pendingOrders || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Pending Orders</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #f44336' }}>
                        <Warning sx={{ color: '#f44336', fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700}>{inventorySummary?.lowStockCount || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Low Stock Items</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #2196f3' }}>
                        <LocalPharmacy sx={{ color: '#2196f3', fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700}>{inventorySummary?.totalStock || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Stock Units</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderLeft: '4px solid #9c27b0' }}>
                        <LocalPharmacy sx={{ color: '#9c27b0', fontSize: 32, mb: 1 }} />
                        <Typography variant="h5" fontWeight={700}>{inventorySummary?.outOfStock || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">Out of Stock</Typography>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Monthly Revenue</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[8, 8, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0d47a1" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#00bfa5" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Recent Orders</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order</TableCell>
                                        <TableCell>Retailer</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order._id || order.id} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem' }}>
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{order.retailer?.name}</TableCell>
                                            <TableCell>
                                                <Chip label={order.status} size="small" color={statusColors[order.status]}
                                                    sx={{ fontSize: '0.7rem', height: 24, textTransform: 'capitalize' }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No orders yet</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
