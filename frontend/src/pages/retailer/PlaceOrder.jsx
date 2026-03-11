import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Grid, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Chip,
    InputAdornment, FormControl, InputLabel, Select, MenuItem, Alert, Divider
} from '@mui/material';
import { Add, Remove, Delete, Search, ShoppingCart, LocalPharmacy } from '@mui/icons-material';
import { productAPI, orderAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [prodRes] = await Promise.all([productAPI.getAll({ inStock: 'true' })]);
                setProducts(prodRes.data.products);
                // Extract unique categories
                const cats = [...new Map(prodRes.data.products.filter(p => p.category).map(p => [p.category._id || p.category.id, p.category])).values()];
                setCategories(cats);
            } catch { toast.error('Failed to load products'); }
        };
        fetch();
    }, []);

    const addToCart = (product) => {
        const pid = product._id || product.id;
        const existing = cart.find(c => c.productId === pid);
        if (existing) {
            if (existing.quantity >= product.stockQuantity) {
                toast.warning('Maximum available stock reached');
                return;
            }
            setCart(cart.map(c => c.productId === pid ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { productId: pid, name: product.name, price: parseFloat(product.price), quantity: 1, maxStock: product.stockQuantity }]);
        }
        toast.success(`${product.name} added`);
    };

    const updateQty = (productId, delta) => {
        setCart(cart.map(c => {
            if (c.productId === productId) {
                const newQty = c.quantity + delta;
                if (newQty <= 0) return null;
                if (newQty > c.maxStock) { toast.warning('Max stock reached'); return c; }
                return { ...c, quantity: newQty };
            }
            return c;
        }).filter(Boolean));
    };

    const removeFromCart = (productId) => setCart(cart.filter(c => c.productId !== productId));

    const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

    const handlePlaceOrder = async () => {
        if (cart.length === 0) { toast.warning('Add items to cart first'); return; }
        setPlacing(true);
        try {
            const res = await orderAPI.placeOrder({
                items: cart.map(c => ({ productId: c.productId, quantity: c.quantity })),
                shippingAddress,
                notes
            });
            toast.success(`Order ${res.data.order.orderNumber} placed successfully!`);
            navigate('/retailer/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacing(false);
        }
    };

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const catId = p.categoryId?._id || p.categoryId;
        const matchCat = !category || catId === category;
        return matchSearch && matchCat;
    });

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} mb={0.5}>Place Order</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>Select medicines and place bulk orders</Typography>

            <Grid container spacing={3}>
                {/* Product Selection */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={1.5}>
                            <Grid size={{ xs: 8 }}>
                                <TextField fullWidth size="small" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                                        <MenuItem value="">All</MenuItem>
                                        {categories.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Card>

                    <Card>
                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Medicine</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="center">Stock</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map(p => (
                                        <TableRow key={p._id || p.id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                                            <TableCell><Chip label={p.category?.name} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>₹{parseFloat(p.price).toFixed(2)}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={p.stockQuantity} size="small" color={p.stockQuantity > 50 ? 'success' : 'warning'} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button size="small" variant="contained" startIcon={<Add />} onClick={() => addToCart(p)}
                                                    disabled={cart.find(c => c.productId === (p._id || p.id))?.quantity >= p.stockQuantity}
                                                    sx={{ fontSize: '0.7rem' }}>
                                                    Add
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Grid>

                {/* Cart */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ p: 2, position: 'sticky', top: 80 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <ShoppingCart color="primary" />
                            <Typography variant="h6" fontWeight={600}>Cart ({cart.length})</Typography>
                        </Box>

                        {cart.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <LocalPharmacy sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                <Typography color="text.secondary">Cart is empty</Typography>
                            </Box>
                        ) : (
                            <>
                                {cart.map(item => (
                                    <Box key={item.productId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={500} noWrap>{item.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">₹{item.price.toFixed(2)} each</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton size="small" onClick={() => updateQty(item.productId, -1)}><Remove fontSize="small" /></IconButton>
                                            <Chip label={item.quantity} size="small" />
                                            <IconButton size="small" onClick={() => updateQty(item.productId, 1)}><Add fontSize="small" /></IconButton>
                                            <IconButton size="small" color="error" onClick={() => removeFromCart(item.productId)}><Delete fontSize="small" /></IconButton>
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} sx={{ ml: 1, minWidth: 70, textAlign: 'right' }}>
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6" fontWeight={700}>Total</Typography>
                                    <Typography variant="h6" fontWeight={700} color="primary">₹{cartTotal.toLocaleString()}</Typography>
                                </Box>

                                <TextField fullWidth size="small" label="Shipping Address" multiline rows={2} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} sx={{ mb: 1.5 }} />
                                <TextField fullWidth size="small" label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} sx={{ mb: 2 }} />

                                <Button
                                    fullWidth variant="contained" size="large" disabled={placing}
                                    onClick={handlePlaceOrder}
                                    sx={{
                                        py: 1.5, fontWeight: 700,
                                        background: 'linear-gradient(135deg, #0d47a1 0%, #00bfa5 100%)',
                                    }}
                                >
                                    {placing ? 'Placing Order...' : `Place Order — ₹${cartTotal.toLocaleString()}`}
                                </Button>
                            </>
                        )}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PlaceOrder;
