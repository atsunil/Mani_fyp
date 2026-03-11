import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Select, FormControl, InputLabel,
    Tabs, Tab, Collapse, IconButton, Avatar
} from '@mui/material';
import { paymentAPI, orderAPI, retailerAPI } from '../../services/api';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { toast } from 'react-toastify';

const methodLabels = { cash: 'Cash', upi: 'UPI', card: 'Card', bank_transfer: 'Bank Transfer', cheque: 'Cheque' };
const paymentColors = { unpaid: 'error', partial: 'warning', paid: 'success' };

function PendingRow({ row }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem' }}>
                            {row.retailer?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{row.retailer.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{row.retailer.userId}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{row.retailer.shopName || '—'}</TableCell>
                <TableCell>{row.orders.length}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ₹{parseFloat(row.totalDue).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                    {row.overdueCount > 0 ? (
                        <Chip label={`${row.overdueCount} Overdue (₹${row.overdueAmount})`} size="small" color="error" />
                    ) : (
                        <Chip label="No Overdue" size="small" color="success" variant="outlined" />
                    )}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                            <Typography variant="subtitle2" gutterBottom component="div" fontWeight={600}>
                                Unpaid Orders
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order #</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                        <TableCell>Due Date</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.orders.map((order) => {
                                        const isOverdue = order.paymentDueDate && new Date(order.paymentDueDate) < new Date();
                                        return (
                                            <TableRow key={order._id}>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{order.orderNumber}</TableCell>
                                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(order.finalAmount || order.totalAmount).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {order.paymentDueDate ? (
                                                        <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'} fontWeight={isOverdue ? 600 : 400}>
                                                            {new Date(order.paymentDueDate).toLocaleDateString()}
                                                            {isOverdue && ' (Overdue)'}
                                                        </Typography>
                                                    ) : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={order.paymentStatus} size="small" color={paymentColors[order.paymentStatus] || 'error'} sx={{ textTransform: 'capitalize' }} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

const PaymentManagement = () => {
    const [tab, setTab] = useState(0);
    const [payments, setPayments] = useState([]);
    const [pendingData, setPendingData] = useState({ retailers: [], grandTotal: 0, totalOverdue: 0, totalOrders: 0 });
    const [dialog, setDialog] = useState(false);
    const [formData, setFormData] = useState({
        orderId: '', retailerId: '', amountCollected: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '', receiptImage: null, agentName: ''
    });
    const [orders, setOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);

    useEffect(() => {
        if (tab === 0) fetchPendingPayments();
        if (tab === 1) fetchPayments();
        fetchOrders();
        fetchRetailers();
    }, [tab]);

    const fetchPayments = async () => {
        try {
            const res = await paymentAPI.getAll();
            setPayments(res.data.payments);
        } catch { toast.error('Failed to fetch payments'); }
    };

    const fetchPendingPayments = async () => {
        try {
            const res = await orderAPI.getPendingPayments();
            setPendingData(res.data);
        } catch { toast.error('Failed to fetch pending payments'); }
    };

    const fetchOrders = async () => {
        try { const res = await orderAPI.getAll(); setOrders(res.data.orders); } catch { }
    };

    const fetchRetailers = async () => {
        try { const res = await retailerAPI.getAll(); setRetailers(res.data.retailers); } catch { }
    };

    const handleSubmit = async () => {
        try {
            await paymentAPI.record(formData);
            toast.success('Payment recorded');
            setDialog(false);
            if (tab === 0) fetchPendingPayments();
            if (tab === 1) fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        }
    };

    const handleVerify = async (id) => {
        try {
            await paymentAPI.verify(id);
            toast.success('Payment verified');
            fetchPayments();
        } catch { toast.error('Failed to verify'); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Payments</Typography>
                    <Typography variant="body2" color="text.secondary">Manage agent collections and pending balances</Typography>
                </Box>
                <Button variant="contained" onClick={() => setDialog(true)}>Record Manual Payment</Button>
            </Box>

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Pending Balances" />
                <Tab label="Payment History" />
            </Tabs>

            {tab === 0 && (
                <>
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, bgcolor: '#fff3e0' }}>
                                <Typography variant="subtitle2" color="text.secondary">Total Outstanding Balance</Typography>
                                <Typography variant="h5" fontWeight={700} color="warning.main">₹{pendingData.grandTotal.toLocaleString()}</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, bgcolor: '#ffebee' }}>
                                <Typography variant="subtitle2" color="text.secondary">Total Overdue Amount</Typography>
                                <Typography variant="h5" fontWeight={700} color="error.main">₹{pendingData.totalOverdue.toLocaleString()}</Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                                <Typography variant="subtitle2" color="text.secondary">Unpaid Orders</Typography>
                                <Typography variant="h5" fontWeight={700} color="primary.main">{pendingData.totalOrders}</Typography>
                            </Card>
                        </Grid>
                    </Grid>

                    <Card>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={50} />
                                        <TableCell>Retailer</TableCell>
                                        <TableCell>Shop Name</TableCell>
                                        <TableCell>Unpaid Orders</TableCell>
                                        <TableCell align="right">Total Due (₹)</TableCell>
                                        <TableCell align="right">Overdue Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingData.retailers.map((row) => (
                                        <PendingRow key={row.retailer._id} row={row} />
                                    ))}
                                    {pendingData.retailers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">No pending payments found.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}

            {tab === 1 && (
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Order #</TableCell>
                                    <TableCell>Retailer</TableCell>
                                    <TableCell>Shop</TableCell>
                                    <TableCell>Agent</TableCell>
                                    <TableCell align="right">Amount (₹)</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Verified</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments.map((p) => (
                                    <TableRow key={p._id || p.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{p.order?.orderNumber}</TableCell>
                                        <TableCell>{p.paymentRetailer?.name}</TableCell>
                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{p.paymentRetailer?.retailer?.shopName}</TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem' }}>{p.agentName || '—'}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(p.amountCollected).toLocaleString()}</TableCell>
                                        <TableCell><Chip label={methodLabels[p.paymentMethod] || p.paymentMethod} size="small" variant="outlined" /></TableCell>
                                        <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip label={p.isVerified ? 'Verified' : 'Pending'} size="small" color={p.isVerified ? 'success' : 'warning'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            {!p.isVerified && (
                                                <Button size="small" variant="outlined" color="success" onClick={() => handleVerify(p._id || p.id)}>Verify</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {payments.length === 0 && (
                                    <TableRow><TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">No payment history recorded</Typography>
                                    </TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            )}

            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>Record Manual Payment</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Order</InputLabel>
                                <Select value={formData.orderId} label="Order" onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}>
                                    {orders.map(o => <MenuItem key={o._id || o.id} value={o._id || o.id}>{o.orderNumber}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Retailer</InputLabel>
                                <Select value={formData.retailerId} label="Retailer" onChange={(e) => setFormData({ ...formData, retailerId: e.target.value })}>
                                    {retailers.map(r => <MenuItem key={r._id || r.id} value={r._id || r.id}>{r.name} ({r.userId})</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Agent Name" value={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })} placeholder="Delivery agent name" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Amount Collected" type="number" required value={formData.amountCollected} onChange={(e) => setFormData({ ...formData, amountCollected: e.target.value })} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select value={formData.paymentMethod} label="Payment Method" onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                    {Object.entries(methodLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date" type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button variant="outlined" component="label" fullWidth sx={{ height: 56 }}>
                                {formData.receiptImage ? formData.receiptImage.name : 'Upload Receipt'}
                                <input type="file" hidden accept="image/*,.pdf" onChange={(e) => setFormData({ ...formData, receiptImage: e.target.files[0] })} />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Notes" multiline rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Record</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentManagement;
