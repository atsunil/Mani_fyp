import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Chip, Tooltip, InputAdornment,
    MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Search, LocalPharmacy, Inventory } from '@mui/icons-material';
import { productAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [stockDialog, setStockDialog] = useState(null);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(null);
    const [formData, setFormData] = useState({
        name: '', categoryId: '', description: '', price: '', costPrice: '',
        stockQuantity: '', lowStockThreshold: '10', expiryDate: '', manufacturer: '', batchNumber: ''
    });
    const [stockData, setStockData] = useState({ quantity: '', type: 'addition', reason: '' });

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getAllAdmin();
            setProducts(res.data.products);
        } catch { toast.error('Failed to fetch products'); }
    };

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data.categories);
        } catch { }
    };

    const handleSubmit = async () => {
        try {
            if (editing) {
                await productAPI.update(editing._id || editing.id, formData);
                toast.success('Product updated');
            } else {
                await productAPI.create(formData);
                toast.success('Product created');
            }
            setDialog(false);
            setEditing(null);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleStockUpdate = async () => {
        try {
            await productAPI.updateStock(stockDialog._id || stockDialog.id, {
                quantity: parseInt(stockData.quantity),
                type: stockData.type,
                reason: stockData.reason
            });
            toast.success('Stock updated');
            setStockDialog(null);
            setStockData({ quantity: '', type: 'addition', reason: '' });
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update stock');
        }
    };

    const handleDelete = async () => {
        try {
            await productAPI.delete(deleteDialog._id || deleteDialog.id);
            toast.success('Product removed');
            setDeleteDialog(null);
            fetchProducts();
        } catch { toast.error('Failed to delete'); }
    };

    const openEdit = (p) => {
        setEditing(p);
        setFormData({
            name: p.name, categoryId: p.categoryId?._id || p.categoryId, description: p.description || '',
            price: p.price, costPrice: p.costPrice || '', stockQuantity: p.stockQuantity,
            lowStockThreshold: p.lowStockThreshold, expiryDate: p.expiryDate || '',
            manufacturer: p.manufacturer || '', batchNumber: p.batchNumber || ''
        });
        setDialog(true);
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.manufacturer?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Products</Typography>
                    <Typography variant="body2" color="text.secondary">Manage medicines and stock</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => {
                    setEditing(null);
                    setFormData({ name: '', categoryId: '', description: '', price: '', costPrice: '', stockQuantity: '', lowStockThreshold: '10', expiryDate: '', manufacturer: '', batchNumber: '' });
                    setDialog(true);
                }}>
                    Add Product
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField fullWidth placeholder="Search products..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Price (₹)</TableCell>
                                <TableCell align="center">Stock</TableCell>
                                <TableCell>Expiry</TableCell>
                                <TableCell>Manufacturer</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((p) => (
                                <TableRow key={p._id || p.id} hover sx={{ opacity: p.isActive ? 1 : 0.5 }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                                    <TableCell><Chip label={p.category?.name || '—'} size="small" variant="outlined" /></TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(p.price).toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={p.stockQuantity}
                                            size="small"
                                            color={p.stockQuantity <= 0 ? 'error' : p.stockQuantity <= p.lowStockThreshold ? 'warning' : 'success'}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem' }}>{p.expiryDate || '—'}</TableCell>
                                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{p.manufacturer || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Update Stock">
                                            <IconButton size="small" color="secondary" onClick={() => setStockDialog(p)}>
                                                <Inventory fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(p)}><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <LocalPharmacy sx={{ fontSize: 48, color: '#ccc' }} /><br />
                                    <Typography color="text.secondary">No products found</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Product Form Dialog */}
            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle fontWeight={600}>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Product Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth required>
                                <InputLabel>Category</InputLabel>
                                <Select value={formData.categoryId} label="Category" onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                                    {categories.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Description" multiline rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Selling Price" type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Cost Price" type="number" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                        </Grid>
                        {!editing && (
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField fullWidth label="Initial Stock" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Low Stock Threshold" type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Manufacturer" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Batch Number" value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* Stock Update Dialog */}
            <Dialog open={!!stockDialog} onClose={() => setStockDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>Update Stock — {stockDialog?.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Current stock: <strong>{stockDialog?.stockQuantity}</strong>
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={stockData.type} label="Type" onChange={(e) => setStockData({ ...stockData, type: e.target.value })}>
                                    <MenuItem value="addition">Add Stock</MenuItem>
                                    <MenuItem value="deduction">Deduct Stock</MenuItem>
                                    <MenuItem value="adjustment">Set Exact Value</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Quantity" type="number" required value={stockData.quantity} onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Reason" value={stockData.reason} onChange={(e) => setStockData({ ...stockData, reason: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setStockDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="secondary" onClick={handleStockUpdate}>Update Stock</Button>
                </DialogActions>
            </Dialog>

            {/* Delete dialog */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Remove Product</DialogTitle>
                <DialogContent><Typography>Remove <strong>{deleteDialog?.name}</strong>?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Remove</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductManagement;
