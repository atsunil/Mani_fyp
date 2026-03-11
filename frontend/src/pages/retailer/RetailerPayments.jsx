import { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Grid, Avatar, Alert, LinearProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material';
import { Payment, Warning, CheckCircle, AccessTime } from '@mui/icons-material';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';

const paymentColors = { unpaid: 'error', partial: 'warning', paid: 'success' };

const RetailerPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payDialog, setPayDialog] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getMyOrders();
            setOrders(res.data.orders.filter(o => ['confirmed', 'delivered'].includes(o.status)));
        } catch { toast.error('Failed to load payment data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handlePay = async () => {
        try {
            const orderId = payDialog._id || payDialog.id;
            await orderAPI.payOrder(orderId);
            toast.success('Payment successful!');
            setPayDialog(null);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        }
    };

    // Calculate payment summary
    const totalDue = orders
        .filter(o => o.paymentStatus !== 'paid')
        .reduce((sum, o) => sum + parseFloat(o.finalAmount || o.totalAmount || 0), 0);

    const totalPaid = orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.finalAmount || o.totalAmount || 0), 0);

    const overdueOrders = orders.filter(o =>
        o.paymentDueDate && new Date(o.paymentDueDate) < new Date() && o.paymentStatus !== 'paid'
    );

    const totalOverdue = overdueOrders
        .reduce((sum, o) => sum + parseFloat(o.finalAmount || o.totalAmount || 0), 0);

    const totalOrders = orders.length;
    const paidCount = orders.filter(o => o.paymentStatus === 'paid').length;
    const progressPercent = totalOrders > 0 ? Math.round((paidCount / totalOrders) * 100) : 0;

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" fontWeight={700} mb={3}>My Payments</Typography>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>My Payments</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Track your payment status and due dates</Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #ff5252, #f44336)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Due</Typography>
                                    <Typography variant="h4" fontWeight={800}>₹{totalDue.toLocaleString()}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><Payment /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Overdue</Typography>
                                    <Typography variant="h4" fontWeight={800}>₹{totalOverdue.toLocaleString()}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{overdueOrders.length} order(s)</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><Warning /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Total Paid</Typography>
                                    <Typography variant="h4" fontWeight={800}>₹{totalPaid.toLocaleString()}</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><CheckCircle /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: 'white', '&:hover': { transform: 'translateY(-4px)' }, transition: 'transform 0.3s' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="body2" sx={{ opacity: 0.85 }}>Payment Progress</Typography>
                                    <Typography variant="h4" fontWeight={800}>{paidCount}/{totalOrders}</Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{progressPercent}% cleared</Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}><AccessTime /></Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Progress Bar */}
            <Card sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>Overall Payment Progress</Typography>
                    <Typography variant="body2" fontWeight={600}>{progressPercent}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progressPercent} sx={{
                    height: 10, borderRadius: 5, bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: progressPercent === 100 ? 'linear-gradient(90deg, #43e97b, #38f9d7)' : 'linear-gradient(90deg, #4facfe, #00f2fe)'
                    }
                }} />
            </Card>

            {overdueOrders.length > 0 && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                    <strong>{overdueOrders.length} payment(s) overdue!</strong> Total overdue: ₹{totalOverdue.toLocaleString()}
                </Alert>
            )}

            {/* Payment Details Table */}
            <Card>
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <Typography variant="h6" fontWeight={600}>Payment Details</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Order Date</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                                <TableCell align="center">Discount</TableCell>
                                <TableCell align="right">Amount to Pay</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map(order => {
                                const isOverdue = order.paymentDueDate && new Date(order.paymentDueDate) < new Date() && order.paymentStatus !== 'paid';
                                return (
                                    <TableRow key={order._id || order.id} hover
                                        sx={{
                                            bgcolor: isOverdue ? 'rgba(244,67,54,0.04)' : order.paymentStatus === 'paid' ? 'rgba(76,175,80,0.04)' : 'inherit',
                                            borderLeft: isOverdue ? '4px solid #f44336' : order.paymentStatus === 'paid' ? '4px solid #4caf50' : '4px solid transparent'
                                        }}
                                    >
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                        <TableCell align="right" sx={{ color: 'text.secondary' }}>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                                        <TableCell align="center">
                                            {order.discountPercent > 0 ? (
                                                <Chip label={`${order.discountPercent}% off`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                            ₹{parseFloat(order.finalAmount || order.totalAmount).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {order.paymentDueDate ? (
                                                <Typography variant="body2" fontWeight={600}
                                                    color={isOverdue ? 'error.main' : 'text.primary'}>
                                                    {new Date(order.paymentDueDate).toLocaleDateString()}
                                                    {isOverdue && <Typography variant="caption" display="block" color="error.main" fontWeight={700}>OVERDUE</Typography>}
                                                </Typography>
                                            ) : <Typography variant="body2" color="text.secondary">Not set</Typography>}
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={order.paymentStatus || 'unpaid'} size="small"
                                                color={paymentColors[order.paymentStatus] || 'error'}
                                                sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                                        </TableCell>
                                        <TableCell align="right">
                                            {order.paymentStatus !== 'paid' ? (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="success"
                                                    onClick={() => setPayDialog(order)}
                                                    sx={{
                                                        fontWeight: 600,
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        px: 2
                                                    }}
                                                >
                                                    Pay Now
                                                </Button>
                                            ) : (
                                                <Chip label="✓ Paid" size="small" color="success" variant="outlined" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {orders.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <Payment sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                    <Typography color="text.secondary">No confirmed orders yet</Typography>
                                </TableCell></TableRow>
                            )}
                            {orders.length > 0 && (
                                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>Total Outstanding:</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.1rem', color: totalDue > 0 ? 'error.main' : 'success.main' }}>
                                        ₹{totalDue.toLocaleString()}
                                    </TableCell>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Pay Confirmation Dialog */}
            <Dialog open={!!payDialog} onClose={() => setPayDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Confirm Payment</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                        You are about to mark this order as paid.
                    </Alert>
                    <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 3 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Order</Typography>
                                <Typography fontWeight={700} sx={{ fontFamily: 'monospace' }}>{payDialog?.orderNumber}</Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Order Date</Typography>
                                <Typography fontWeight={500}>{payDialog && new Date(payDialog.orderDate).toLocaleDateString()}</Typography>
                            </Grid>
                            {payDialog?.discountPercent > 0 && (
                                <>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                                        <Typography>₹{parseFloat(payDialog?.totalAmount || 0).toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Typography variant="body2" color="text.secondary">Discount</Typography>
                                        <Typography color="success.main" fontWeight={600}>-{payDialog?.discountPercent}% (₹{parseFloat(payDialog?.discountAmount || 0).toLocaleString()})</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={700}>Amount to Pay</Typography>
                            <Typography variant="h5" fontWeight={800} color="primary.main">
                                ₹{parseFloat(payDialog?.finalAmount || payDialog?.totalAmount || 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPayDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handlePay} sx={{ fontWeight: 600, px: 4 }}>
                        Confirm Payment
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RetailerPayments;
