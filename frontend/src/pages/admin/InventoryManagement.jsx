import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Grid, Alert
} from '@mui/material';
import { Warning, CheckCircle, Error as ErrorIcon, Inventory as InvIcon } from '@mui/icons-material';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const InventoryManagement = () => {
    const [summary, setSummary] = useState(null);
    const [lowStock, setLowStock] = useState([]);
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [sumRes, lowRes, logRes] = await Promise.all([
                    inventoryAPI.getSummary(),
                    inventoryAPI.getLowStock(),
                    inventoryAPI.getLogs()
                ]);
                setSummary(sumRes.data.summary);
                setLowStock(lowRes.data.products);
                setLogs(logRes.data.logs);
            } catch { toast.error('Failed to load inventory data'); }
        };
        fetchAll();
    }, []);

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Inventory</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Real-time stock monitoring and alerts</Typography>

            <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Products', value: summary?.totalProducts || 0, color: '#2196f3', icon: <InvIcon /> },
                    { label: 'Total Stock', value: summary?.totalStock || 0, color: '#4caf50', icon: <CheckCircle /> },
                    { label: 'Low Stock', value: summary?.lowStockCount || 0, color: '#ff9800', icon: <Warning /> },
                    { label: 'Out of Stock', value: summary?.outOfStock || 0, color: '#f44336', icon: <ErrorIcon /> },
                ].map((item, i) => (
                    <Grid key={i} size={{ xs: 6, md: 3 }}>
                        <Card sx={{ p: 2.5, textAlign: 'center', borderTop: `4px solid ${item.color}` }}>
                            <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                            <Typography variant="h4" fontWeight={700}>{item.value}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {lowStock.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
                    <strong>{lowStock.length} products</strong> are below their stock threshold!
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>⚠️ Low Stock Alerts</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="center">Stock</TableCell>
                                        <TableCell align="center">Threshold</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {lowStock.map(p => (
                                        <TableRow key={p._id || p.id}>
                                            <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                            <TableCell>{p.category?.name}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={p.stockQuantity} size="small" color={p.stockQuantity === 0 ? 'error' : 'warning'} />
                                            </TableCell>
                                            <TableCell align="center">{p.lowStockThreshold}</TableCell>
                                        </TableRow>
                                    ))}
                                    {lowStock.length === 0 && (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <CheckCircle sx={{ color: '#4caf50', fontSize: 36, mb: 1 }} /><br />
                                            <Typography color="text.secondary">All stock levels are healthy!</Typography>
                                        </TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ p: 2 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>📋 Recent Activity</Typography>
                        <TableContainer sx={{ maxHeight: 400 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell align="center">Change</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.slice(0, 20).map(log => (
                                        <TableRow key={log._id || log.id}>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{log.product?.name}</TableCell>
                                            <TableCell>
                                                <Chip label={log.changeType} size="small"
                                                    color={log.changeType === 'addition' ? 'success' : log.changeType === 'deduction' ? 'error' : 'info'}
                                                    sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                                                />
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                {log.changeType === 'addition' ? '+' : log.changeType === 'deduction' ? '-' : ''}
                                                {log.quantityChanged}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.length === 0 && (
                                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}>No activity logged</TableCell></TableRow>
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

export default InventoryManagement;
