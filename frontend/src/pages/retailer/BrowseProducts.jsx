import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, TextField, InputAdornment, Chip,
    MenuItem, Select, FormControl, InputLabel, CardContent, CardActions,
    Button, Dialog, DialogTitle, DialogContent, DialogActions as DlgActions
} from '@mui/material';
import { Search, LocalPharmacy, ShoppingCart } from '@mui/icons-material';
import { productAPI, categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const BrowseProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [detailProduct, setDetailProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await productAPI.getAll({ inStock: 'true' });
            setProducts(res.data.products);
        } catch { toast.error('Failed to fetch products'); }
    };

    const fetchCategories = async () => {
        try { const res = await categoryAPI.getAll(); setCategories(res.data.categories); } catch { }
    };

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.manufacturer?.toLowerCase().includes(search.toLowerCase());
        const catId = p.categoryId?._id || p.categoryId;
        const matchCat = !category || catId === category;
        return matchSearch && matchCat;
    });

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Browse Medicines</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Find and order medicines from our catalog</Typography>

            <Card sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                        <TextField fullWidth placeholder="Search medicines..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Card>

            <Grid container spacing={2.5}>
                {filtered.map(product => (
                    <Grid key={product._id || product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Card sx={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 28px rgba(0,0,0,0.12)' },
                        }}>
                            <Box sx={{
                                p: 2.5, pb: 1.5,
                                background: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)',
                                textAlign: 'center',
                            }}>
                                <LocalPharmacy sx={{ fontSize: 48, color: '#0d47a1', opacity: 0.7 }} />
                            </Box>
                            <CardContent sx={{ flex: 1, pb: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>{product.name}</Typography>
                                <Chip label={product.category?.name} size="small" variant="outlined" sx={{ mb: 1 }} />
                                <Typography variant="h5" fontWeight={800} color="primary" sx={{ my: 1 }}>
                                    ₹{parseFloat(product.price).toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Stock: <Chip label={product.stockQuantity} size="small" color={product.stockQuantity > 50 ? 'success' : 'warning'} sx={{ ml: 0.5 }} />
                                </Typography>
                                {product.expiryDate && (
                                    <Typography variant="caption" color="text.secondary">
                                        Exp: {product.expiryDate}
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button size="small" fullWidth variant="outlined" onClick={() => setDetailProduct(product)}>
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {filtered.length === 0 && (
                    <Grid size={{ xs: 12 }}>
                        <Card sx={{ p: 6, textAlign: 'center' }}>
                            <LocalPharmacy sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No products found</Typography>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Product Detail Dialog */}
            <Dialog open={!!detailProduct} onClose={() => setDetailProduct(null)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>{detailProduct?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Category</Typography>
                            <Typography fontWeight={500}>{detailProduct?.category?.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Price</Typography>
                            <Typography fontWeight={700} color="primary" variant="h6">₹{parseFloat(detailProduct?.price || 0).toFixed(2)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">In Stock</Typography>
                            <Typography fontWeight={500}>{detailProduct?.stockQuantity} units</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                            <Typography fontWeight={500}>{detailProduct?.expiryDate || '—'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Manufacturer</Typography>
                            <Typography fontWeight={500}>{detailProduct?.manufacturer || '—'}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="body2" color="text.secondary">Batch</Typography>
                            <Typography fontWeight={500}>{detailProduct?.batchNumber || '—'}</Typography>
                        </Grid>
                        {detailProduct?.description && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="body2" color="text.secondary">Description</Typography>
                                <Typography>{detailProduct.description}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DlgActions sx={{ p: 2 }}>
                    <Button onClick={() => setDetailProduct(null)}>Close</Button>
                </DlgActions>
            </Dialog>
        </Box>
    );
};

export default BrowseProducts;
