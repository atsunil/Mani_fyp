import { useState, useEffect } from 'react';
import {
    Box, Card, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Tooltip, InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, Search, Category as CategoryIcon } from '@mui/icons-material';
import { categoryAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [search, setSearch] = useState('');
    const [deleteDialog, setDeleteDialog] = useState(null);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res.data.categories);
        } catch { toast.error('Failed to fetch categories'); }
    };

    const handleSubmit = async () => {
        try {
            if (editing) {
                await categoryAPI.update(editing._id || editing.id, formData);
                toast.success('Category updated');
            } else {
                await categoryAPI.create(formData);
                toast.success('Category created');
            }
            setDialog(false);
            setEditing(null);
            setFormData({ name: '', description: '' });
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        try {
            await categoryAPI.delete(deleteDialog._id || deleteDialog.id);
            toast.success('Category deleted');
            setDeleteDialog(null);
            fetchCategories();
        } catch { toast.error('Failed to delete'); }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>Categories</Typography>
                    <Typography variant="body2" color="text.secondary">Manage product categories</Typography>
                </Box>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setFormData({ name: '', description: '' }); setDialog(true); }}>
                    Add Category
                </Button>
            </Box>

            <Card sx={{ p: 2, mb: 3 }}>
                <TextField fullWidth placeholder="Search categories..." size="small" value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
            </Card>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((c) => (
                                <TableRow key={c._id || c.id} hover>
                                    <TableCell>{c._id || c.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                                    <TableCell sx={{ color: 'text.secondary', maxWidth: 400 }}>{c.description || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => { setEditing(c); setFormData({ name: c.name, description: c.description || '' }); setDialog(true); }}><Edit fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteDialog(c)}><Delete fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <CategoryIcon sx={{ fontSize: 48, color: '#ccc' }} /><br />
                                    <Typography color="text.secondary">No categories found</Typography>
                                </TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={600}>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} sx={{ mt: 1, mb: 2 }} />
                    <TextField fullWidth label="Description" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{editing ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteDialog} onClose={() => setDeleteDialog(null)}>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogContent><Typography>Delete <strong>{deleteDialog?.name}</strong>?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManagement;
