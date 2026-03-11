import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, Alert
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'error' };
const paymentColors = { unpaid: 'error', partial: 'warning', paid: 'success' };

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [detailDialog, setDetailDialog] = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await orderAPI.getMyOrders();
            setOrders(res.data.orders);
        } catch { toast.error('Failed to fetch orders'); }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>My Orders</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Track your order history and status</Typography>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Total (₹)</TableCell>
                                <TableCell align="right">Final (₹)</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order._id || order.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</TableCell>
                                    <TableCell>{order.items?.length || 0} items</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: order.discountPercent > 0 ? 'success.main' : 'inherit' }}>
                                        {order.finalAmount ? `₹${parseFloat(order.finalAmount).toLocaleString()}` : '—'}
                                        {order.discountPercent > 0 && (
                                            <Typography variant="caption" display="block" color="success.main">-{order.discountPercent}% off</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.status !== 'pending' && order.status !== 'cancelled' ? (
                                            <Chip label={order.paymentStatus || 'unpaid'} size="small" color={paymentColors[order.paymentStatus] || 'error'} sx={{ textTransform: 'capitalize' }} />
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>
                                        {order.paymentDueDate ? (
                                            <Typography variant="body2"
                                                color={new Date(order.paymentDueDate) < new Date() && order.paymentStatus !== 'paid' ? 'error.main' : 'text.primary'}
                                                fontWeight={500}
                                            >
                                                {new Date(order.paymentDueDate).toLocaleDateString()}
                                            </Typography>
                                        ) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={order.status} size="small" color={statusColors[order.status]} sx={{ textTransform: 'capitalize' }} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => setDetailDialog(order)}>View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <ShoppingCart sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                    <Typography color="text.secondary">No orders yet</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Order {detailDialog?.orderNumber}
                    <Chip label={detailDialog?.status} size="small" color={statusColors[detailDialog?.status]} sx={{ ml: 2, textTransform: 'capitalize' }} />
                    {detailDialog?.status !== 'pending' && detailDialog?.status !== 'cancelled' && (
                        <Chip label={detailDialog?.paymentStatus || 'unpaid'} size="small" color={paymentColors[detailDialog?.paymentStatus] || 'error'} sx={{ ml: 1, textTransform: 'capitalize' }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    {detailDialog?.paymentDueDate && detailDialog?.paymentStatus !== 'paid' && new Date(detailDialog.paymentDueDate) < new Date() && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Payment is overdue! Due date was {new Date(detailDialog.paymentDueDate).toLocaleDateString()}
                        </Alert>
                    )}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Order Date</Typography>
                            <Typography fontWeight={500}>{detailDialog && new Date(detailDialog.orderDate).toLocaleString()}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                            <Typography fontWeight={700} color="primary" variant="h6">
                                ₹{parseFloat(detailDialog?.finalAmount || detailDialog?.totalAmount || 0).toLocaleString()}
                            </Typography>
                            {detailDialog?.discountPercent > 0 && (
                                <Typography variant="caption" color="success.main">
                                    {detailDialog.discountPercent}% discount applied (saved ₹{parseFloat(detailDialog.discountAmount || 0).toLocaleString()})
                                </Typography>
                            )}
                        </Grid>
                        {detailDialog?.paymentDueDate && (
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Payment Due Date</Typography>
                                <Typography fontWeight={600}
                                    color={new Date(detailDialog.paymentDueDate) < new Date() && detailDialog.paymentStatus !== 'paid' ? 'error.main' : 'text.primary'}
                                >
                                    {new Date(detailDialog.paymentDueDate).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        )}
                        {detailDialog?.confirmedAt && (
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Confirmed At</Typography>
                                <Typography>{new Date(detailDialog.confirmedAt).toLocaleString()}</Typography>
                            </Grid>
                        )}
                        {detailDialog?.deliveredAt && (
                            <Grid size={{ xs: 6 }}>
                                <Typography variant="body2" color="text.secondary">Delivered At</Typography>
                                <Typography>{new Date(detailDialog.deliveredAt).toLocaleString()}</Typography>
                            </Grid>
                        )}
                    </Grid>

                    <Typography variant="subtitle2" fontWeight={600} mb={1}>Items</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Qty</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detailDialog?.items?.map(item => (
                                    <TableRow key={item._id || item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell align="center">{item.quantity}</TableCell>
                                        <TableCell align="right">₹{parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(item.totalPrice).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(detailDialog?.totalAmount || 0).toLocaleString()}</TableCell>
                                </TableRow>
                                {detailDialog?.discountPercent > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="right" sx={{ color: 'success.main' }}>Discount ({detailDialog.discountPercent}%)</TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>-₹{parseFloat(detailDialog.discountAmount || 0).toLocaleString()}</TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                        {detailDialog?.discountPercent > 0 ? 'Final Amount' : 'Grand Total'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>
                                        ₹{parseFloat(detailDialog?.finalAmount || detailDialog?.totalAmount || 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyOrders;
