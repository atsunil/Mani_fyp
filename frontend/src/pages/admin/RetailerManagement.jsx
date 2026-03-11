import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Chip, Tooltip, InputAdornment, Switch, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Search, Person } from '@mui/icons-material';
import { retailerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const emptyForm = {
    name: '', email: '', password: '', phone: '', shopName: '', address: '',
    city: '', state: '', pincode: '', gstNumber: '', drugLicenseNumber: ''
};

const RetailerManagement = () => {
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => { fetchRetailers(); }, []);

    const fetchRetailers = async () => {
        try {
            const res = await retailerAPI.getAll();
            setRetailers(res.data.retailers);
        } catch (err) {
            toast.error('Failed to fetch retailers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            if (editing) {
                await retailerAPI.update(editing._id || editing.id, formData);
                toast.success('Retailer updated');
            } else {
                await retailerAPI.create(formData);
                toast.success('Retailer created');
            }
            setDialog(false);
            setEditing(null);
            setFormData(emptyForm);
            fetchRetailers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (retailer) => {
        setEditing(retailer);
        setFormData({
            name: retailer.name, email: retailer.email, password: '', phone: retailer.phone || '',
            shopName: retailer.retailer?.shopName || '', address: retailer.retailer?.address || '',
            city: retailer.retailer?.city || '', state: retailer.retailer?.state || '',
            pincode: retailer.retailer?.pincode || '', gstNumber: retailer.retailer?.gstNumber || '',
            drugLicenseNumber: retailer.retailer?.drugLicenseNumber || '',
            isActive: retailer.isActive,
        });
        setDialog(true);
    };

    const handleDelete = async () => {
        try {
            await retailerAPI.delete(deleteDialog._id || deleteDialog.id);
            toast.success('Retailer deleted');
            setDeleteDialog(null);
            fetchRetailers();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const filtered = retailers.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.userId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Retailers</Typography>
                    <Typography variant="body2" color="text.secondary">Manage retailer accounts</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setFormData(emptyForm); setDialog(true); }}>
                    Add Retailer
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField fullWidth placeholder="Search retailers..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
                />
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Shop Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((r) => (
                                <TableRow key={r._id || r.id} hover>
                                    <TableCell><Chip label={r.userId} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 600 }} /></TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{r.name}</TableCell>
                                    <TableCell>{r.retailer?.shopName || '—'}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary' }}>{r.email}</TableCell>
                                    <TableCell>{r.retailer?.city || '—'}</TableCell>
                                    <TableCell>
                                        <Chip label={r.isActive ? 'Active' : 'Inactive'} size="small" color={r.isActive ? 'success' : 'default'} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEdit(r)} color="primary"><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteDialog(r)} color="error"><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Person sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                                    <Typography color="text.secondary">No retailers found</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            {/* Add/Edit dialog */}
            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>{editing ? 'Edit Retailer' : 'Add New Retailer'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </Grid>
                        {!editing && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Shop Name" required value={formData.shopName} onChange={(e) => setFormData({ ...formData, shopName: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Address" required multiline rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField fullWidth label="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="GST Number" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Drug License No." value={formData.drugLicenseNumber} onChange={(e) => setFormData({ ...formData, drugLicenseNumber: e.target.value })} />
                        </Grid>
                        {editing && (
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel control={<Switch checked={formData.isActive !== false} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />} label="Active Account" />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Retailer</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <strong>{deleteDialog?.name}</strong>?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RetailerManagement;
