import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, MenuItem, Select,
    FormControl, InputLabel, Tabs, Tab, Chip
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { reportAPI, retailerAPI, orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportManagement = () => {
    const [tab, setTab] = useState(0);
    const [retailers, setRetailers] = useState([]);
    const [retailerFilter, setRetailerFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);

    useEffect(() => {
        const fetchRetailers = async () => {
            try { const res = await retailerAPI.getAll(); setRetailers(res.data.retailers); } catch { }
        };
        fetchRetailers();
    }, []);

    const fetchRetailerReport = async () => {
        try {
            const params = {};
            if (retailerFilter) params.retailerId = retailerFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await reportAPI.retailerReport(params);
            setReport({ ...res.data.report, type: 'standard' });
        } catch { toast.error('Failed to generate report'); }
    };

    const fetchDailyReport = async () => {
        try {
            const res = await reportAPI.dailyReport({ date: dailyDate });
            setReport({ ...res.data.report, type: 'standard' });
        } catch { toast.error('Failed to generate report'); }
    };

    const fetchSalesReport = async () => {
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await reportAPI.salesReport(params);
            setReport({ ...res.data.report, type: 'standard' });
        } catch { toast.error('Failed to generate report'); }
    };

    const fetchPendingPaymentsReport = async () => {
        try {
            const res = await orderAPI.getPendingPayments();
            setReport({
                type: 'pending_payments',
                totalOrders: res.data.totalOrders,
                grandTotal: res.data.grandTotal,
                totalOverdue: res.data.totalOverdue,
                retailers: res.data.retailers
            });
        } catch { toast.error('Failed to generate report'); }
    };

    const exportPDF = () => {
        if (!report) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(13, 71, 161);
        doc.text('MediLink Report', 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

        doc.setFontSize(12);
        doc.setTextColor(0);

        if (report.type === 'pending_payments') {
            doc.text(`Total Unpaid Orders: ${report.totalOrders}`, 14, 42);
            doc.text(`Total Outstanding: Rs. ${report.grandTotal?.toLocaleString()}`, 14, 50);
            doc.text(`Total Overdue: Rs. ${report.totalOverdue?.toLocaleString()}`, 14, 58);

            if (report.retailers?.length > 0) {
                autoTable(doc, {
                    startY: 68,
                    head: [['Retailer', 'Shop Name', 'Num Orders', 'Overdue Amount', 'Total Due']],
                    body: report.retailers.map(r => [
                        r.retailer?.name || '—',
                        r.retailer?.shopName || '—',
                        r.orders?.length || 0,
                        `Rs. ${r.overdueAmount?.toLocaleString()}`,
                        `Rs. ${r.totalDue?.toLocaleString()}`
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [13, 71, 161] },
                });
            }
        } else {
            doc.text(`Total Orders: ${report.totalOrders}`, 14, 42);
            doc.text(`Total Revenue: Rs. ${report.totalRevenue?.toLocaleString()}`, 14, 50);
            doc.text(`Products Sold: ${report.productsSold || '—'}`, 14, 58);

            if (report.orders?.length > 0) {
                autoTable(doc, {
                    startY: 68,
                    head: [['Order #', 'Retailer', 'Status', 'Amount', 'Date']],
                    body: report.orders.map(o => [
                        o.orderNumber,
                        o.retailer?.name || '—',
                        o.status,
                        `Rs. ${parseFloat(o.totalAmount).toLocaleString()}`,
                        new Date(o.orderDate).toLocaleDateString()
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [13, 71, 161] },
                });
            }
        }

        doc.save(report.type === 'pending_payments' ? 'medilink-pending-payments.pdf' : 'medilink-report.pdf');
        toast.success('PDF exported');
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Reports</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Generate and export sales & financial reports</Typography>

            <Card sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => { setTab(v); setReport(null); }}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab label="Retailer Report" />
                    <Tab label="Daily Report" />
                    <Tab label="Sales Report" />
                    <Tab label="Pending Payments" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {tab === 0 && (
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Retailer</InputLabel>
                                    <Select value={retailerFilter} label="Retailer" onChange={(e) => setRetailerFilter(e.target.value)}>
                                        <MenuItem value="">All</MenuItem>
                                        {retailers.map(r => <MenuItem key={r._id || r.id} value={r._id || r.id}>{r.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField fullWidth size="small" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField fullWidth size="small" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button fullWidth variant="contained" onClick={fetchRetailerReport}>Generate</Button>
                            </Grid>
                        </Grid>
                    )}
                    {tab === 1 && (
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth size="small" label="Date" type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Button fullWidth variant="contained" onClick={fetchDailyReport}>Generate</Button>
                            </Grid>
                        </Grid>
                    )}
                    {tab === 2 && (
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6} sm={4}>
                                <TextField fullWidth size="small" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                                <TextField fullWidth size="small" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button fullWidth variant="contained" onClick={fetchSalesReport}>Generate</Button>
                            </Grid>
                        </Grid>
                    )}
                    {tab === 3 && (
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Button fullWidth variant="contained" color="warning" onClick={fetchPendingPaymentsReport} sx={{ fontWeight: 600 }}>
                                    Generate Pending Payments Report
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Card>

            {report && (
                <>
                    {report.type === 'pending_payments' ? (
                        <>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd, #e0f7fa)' }}>
                                        <Typography variant="h3" fontWeight={800} color="primary">{report.totalOrders}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Unpaid Orders</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)' }}>
                                        <Typography variant="h3" fontWeight={800} color="warning.main">₹{report.grandTotal?.toLocaleString()}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Total Outstanding</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #ffebee, #ffcdd2)' }}>
                                        <Typography variant="h3" fontWeight={800} color="error.main">₹{report.totalOverdue?.toLocaleString()}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Total Overdue</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Card sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>Retailer Outstanding Balances</Typography>
                                    <Button variant="contained" color="primary" startIcon={<PictureAsPdf />} onClick={exportPDF}>Export to PDF</Button>
                                </Box>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Retailer</TableCell>
                                                <TableCell>Shop Name</TableCell>
                                                <TableCell align="center">Unpaid Orders</TableCell>
                                                <TableCell align="right">Overdue</TableCell>
                                                <TableCell align="right">Total Due</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.retailers?.map(r => (
                                                <TableRow key={r.retailer._id} hover>
                                                    <TableCell sx={{ fontWeight: 600 }}>{r.retailer.name}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{r.retailer.shopName || '—'}</TableCell>
                                                    <TableCell align="center">{r.orders?.length || 0}</TableCell>
                                                    <TableCell align="right">
                                                        {r.overdueAmount > 0 ? (
                                                            <Typography color="error.main" fontWeight={600} variant="body2">
                                                                ₹{r.overdueAmount.toLocaleString()}
                                                            </Typography>
                                                        ) : (
                                                            <Typography color="text.secondary" variant="body2">—</Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'warning.main' }}>
                                                        ₹{r.totalDue.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {report.retailers?.length === 0 && (
                                                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}>No pending payments to report.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd, #e0f7fa)' }}>
                                        <Typography variant="h3" fontWeight={800} color="primary">{report.totalOrders}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Total Orders</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)' }}>
                                        <Typography variant="h3" fontWeight={800} color="success.main">₹{report.totalRevenue?.toLocaleString()}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Revenue</Typography>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Card sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fce4ec, #fff3e0)' }}>
                                        <Typography variant="h3" fontWeight={800} color="secondary">{report.productsSold || '—'}</Typography>
                                        <Typography color="text.secondary" fontWeight={500}>Products Sold</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {report.topProducts && report.topProducts.length > 0 && (
                                <Card sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6" fontWeight={600} mb={2}>Top Products</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={report.topProducts}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-20} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                                            <YAxis />
                                            <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#0d47a1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card>
                            )}

                            <Card sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                                    <Typography variant="h6" fontWeight={600}>Order Details</Typography>
                                    <Button variant="contained" color="primary" startIcon={<PictureAsPdf />} onClick={exportPDF}>Export PDF</Button>
                                </Box>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Order #</TableCell>
                                                <TableCell>Retailer</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                                <TableCell>Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {report.orders?.map(o => (
                                                <TableRow key={o._id || o.id} hover>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{o.orderNumber}</TableCell>
                                                    <TableCell>{o.retailer?.name}</TableCell>
                                                    <TableCell><Chip label={o.status} size="small" color={o.status === 'delivered' ? 'success' : o.status === 'confirmed' ? 'info' : 'warning'} sx={{ textTransform: 'capitalize' }} /></TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(o.totalAmount).toLocaleString()}</TableCell>
                                                    <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(o.orderDate).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Card>
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default ReportManagement;
