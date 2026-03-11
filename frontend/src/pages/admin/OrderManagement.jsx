import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, MenuItem, Select, FormControl,
    InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grid,
    TextField, Divider, Alert
} from '@mui/material';
import { orderAPI } from '../../services/api';
import { toast } from 'react-toastify';

const statusColors = { pending: 'warning', confirmed: 'info', delivered: 'success', cancelled: 'error' };
const paymentColors = { unpaid: 'error', partial: 'warning', paid: 'success' };

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [detailDialog, setDetailDialog] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [discountPercent, setDiscountPercent] = useState('');
    const [paymentDueDate, setPaymentDueDate] = useState('');

    useEffect(() => { fetchOrders(); }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            const params = {};
            if (filterStatus) params.status = filterStatus;
            const res = await orderAPI.getAll(params);
            setOrders(res.data.orders);
        } catch { toast.error('Failed to fetch orders'); }
    };

    const handleStatusUpdate = async (orderId, newStatus, extraData = {}) => {
        try {
            await orderAPI.updateStatus(orderId, { status: newStatus, ...extraData });
            toast.success(`Order ${newStatus}`);
            fetchOrders();
            if (detailDialog?._id === orderId || detailDialog?.id === orderId) {
                const res = await orderAPI.getOne(orderId);
                setDetailDialog(res.data.order);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const openConfirmDialog = (order) => {
        setConfirmDialog(order);
        setDiscountPercent('');
        setPaymentDueDate('');
    };

    const handleConfirmOrder = () => {
        const orderId = confirmDialog._id || confirmDialog.id;
        const extraData = {};
        if (discountPercent && parseFloat(discountPercent) > 0) {
            extraData.discountPercent = parseFloat(discountPercent);
        }
        if (paymentDueDate) {
            extraData.paymentDueDate = paymentDueDate;
        }
        handleStatusUpdate(orderId, 'confirmed', extraData);
        setConfirmDialog(null);
    };

    const handlePaymentStatusUpdate = async (orderId, paymentStatus) => {
        try {
            await orderAPI.updatePaymentStatus(orderId, { paymentStatus });
            toast.success(`Payment marked as ${paymentStatus}`);
            fetchOrders();
            if (detailDialog?._id === orderId || detailDialog?.id === orderId) {
                const res = await orderAPI.getOne(orderId);
                setDetailDialog(res.data.order);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update payment');
        }
    };

    const calcPreview = () => {
        if (!confirmDialog) return { discount: 0, final: 0 };
        const total = parseFloat(confirmDialog.totalAmount);
        const dp = parseFloat(discountPercent) || 0;
        const discountAmt = parseFloat((total * dp / 100).toFixed(2));
        return { discount: discountAmt, final: parseFloat((total - discountAmt).toFixed(2)) };
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Orders</Typography>
                    <Typography variant="body2" color="text.secondary">Manage all incoming orders</Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Filter Status</InputLabel>
                    <Select value={filterStatus} label="Filter Status" onChange={(e) => setFilterStatus(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Retailer</TableCell>
                                <TableCell>Shop</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Total (₹)</TableCell>
                                <TableCell align="right">Final (₹)</TableCell>
                                <TableCell>Payment</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order._id || order.id} hover>
                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</TableCell>
                                    <TableCell>{order.retailer?.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{order.retailer?.retailer?.shopName}</TableCell>
                                    <TableCell>{order.items?.length || 0}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: order.discountPercent > 0 ? 'success.main' : 'inherit' }}>
                                        {order.finalAmount ? `₹${parseFloat(order.finalAmount).toLocaleString()}` : '—'}
                                        {order.discountPercent > 0 && (
                                            <Typography variant="caption" display="block" color="success.main">-{order.discountPercent}%</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.status !== 'pending' && order.status !== 'cancelled' && (
                                            <Chip label={order.paymentStatus || 'unpaid'} size="small" color={paymentColors[order.paymentStatus] || 'error'} sx={{ textTransform: 'capitalize' }} />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={order.status} size="small" color={statusColors[order.status]} sx={{ textTransform: 'capitalize' }} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => setDetailDialog(order)} sx={{ mr: 0.5 }}>View</Button>
                                        {order.status === 'pending' && (
                                            <>
                                                <Button size="small" color="info" variant="outlined" onClick={() => openConfirmDialog(order)} sx={{ mr: 0.5 }}>Confirm</Button>
                                                <Button size="small" color="error" variant="outlined" onClick={() => handleStatusUpdate(order._id || order.id, 'cancelled')}>Cancel</Button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <Button size="small" color="success" variant="outlined" onClick={() => handleStatusUpdate(order._id || order.id, 'delivered')}>Mark Delivered</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {orders.length === 0 && (
                                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No orders found</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Confirm Order Dialog — Admin sets discount + due date */}
            <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Order — {confirmDialog?.orderNumber}
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
                        Set a discount and payment due date before confirming. Leave blank for no discount.
                    </Alert>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">Order Subtotal</Typography>
                            <Typography variant="h5" fontWeight={700}>₹{parseFloat(confirmDialog?.totalAmount || 0).toLocaleString()}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="Discount (%)" type="number"
                                value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)}
                                inputProps={{ min: 0, max: 100, step: 0.5 }}
                                helperText="0-100%"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth label="Payment Due Date" type="date"
                                value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                helperText="Retailer can pay by this date"
                            />
                        </Grid>
                        {discountPercent && parseFloat(discountPercent) > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography color="text.secondary">Discount ({discountPercent}%)</Typography>
                                    <Typography color="error.main" fontWeight={600}>-₹{calcPreview().discount.toLocaleString()}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography fontWeight={700} variant="h6">Final Amount</Typography>
                                    <Typography fontWeight={700} variant="h6" color="success.main">₹{calcPreview().final.toLocaleString()}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="info" onClick={handleConfirmOrder}>Confirm Order</Button>
                </DialogActions>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog open={!!detailDialog} onClose={() => setDetailDialog(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Order {detailDialog?.orderNumber}
                    <Chip label={detailDialog?.status} size="small" color={statusColors[detailDialog?.status]} sx={{ ml: 2, textTransform: 'capitalize' }} />
                    {detailDialog?.status !== 'pending' && detailDialog?.status !== 'cancelled' && (
                        <Chip label={detailDialog?.paymentStatus || 'unpaid'} size="small" color={paymentColors[detailDialog?.paymentStatus] || 'error'} sx={{ ml: 1, textTransform: 'capitalize' }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">Retailer</Typography>
                            <Typography fontWeight={500}>{detailDialog?.retailer?.name} ({detailDialog?.retailer?.userId})</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">Order Date</Typography>
                            <Typography fontWeight={500}>{detailDialog && new Date(detailDialog.orderDate).toLocaleString()}</Typography>
                        </Grid>
                        {detailDialog?.shippingAddress && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="body2" color="text.secondary">Shipping Address</Typography>
                                <Typography>{detailDialog.shippingAddress}</Typography>
                            </Grid>
                        )}
                        {detailDialog?.paymentDueDate && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Payment Due Date</Typography>
                                <Typography fontWeight={600} color={new Date(detailDialog.paymentDueDate) < new Date() && detailDialog.paymentStatus !== 'paid' ? 'error.main' : 'text.primary'}>
                                    {new Date(detailDialog.paymentDueDate).toLocaleDateString()}
                                    {new Date(detailDialog.paymentDueDate) < new Date() && detailDialog.paymentStatus !== 'paid' && ' (OVERDUE)'}
                                </Typography>
                            </Grid>
                        )}
                    </Grid>

                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Order Items</Typography>
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
                                {detailDialog?.items?.map((item) => (
                                    <TableRow key={item._id || item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell align="center">{item.quantity}</TableCell>
                                        <TableCell align="right">₹{parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(item.totalPrice).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                        ₹{parseFloat(detailDialog?.totalAmount || 0).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                                {detailDialog?.discountPercent > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="right" sx={{ color: 'error.main' }}>Discount ({detailDialog.discountPercent}%)</TableCell>
                                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 600 }}>
                                            -₹{parseFloat(detailDialog.discountAmount || 0).toLocaleString()}
                                        </TableCell>
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
                <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
                    {detailDialog?.status === 'pending' && (
                        <>
                            <Button color="error" onClick={() => handleStatusUpdate(detailDialog._id || detailDialog.id, 'cancelled')}>Cancel Order</Button>
                            <Button variant="contained" color="info" onClick={() => { setDetailDialog(null); openConfirmDialog(detailDialog); }}>Confirm Order</Button>
                        </>
                    )}
                    {detailDialog?.status === 'confirmed' && (
                        <Button variant="contained" color="success" onClick={() => handleStatusUpdate(detailDialog._id || detailDialog.id, 'delivered')}>Mark Delivered</Button>
                    )}
                    {(detailDialog?.status === 'confirmed' || detailDialog?.status === 'delivered') && detailDialog?.paymentStatus !== 'paid' && (
                        <>
                            <Button variant="outlined" color="warning" onClick={() => handlePaymentStatusUpdate(detailDialog._id || detailDialog.id, 'partial')}>Mark Partial Payment</Button>
                            <Button variant="contained" color="success" onClick={() => handlePaymentStatusUpdate(detailDialog._id || detailDialog.id, 'paid')}>Mark Paid</Button>
                        </>
                    )}
                    <Button onClick={() => setDetailDialog(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderManagement;
