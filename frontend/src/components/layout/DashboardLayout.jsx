import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem, Divider,
    useMediaQuery, useTheme, Chip, Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, People, Category, Inventory, ShoppingCart,
    Assessment, Payment, LocalPharmacy, Logout, Person, ChevronLeft,
    Store, MedicalServices
} from '@mui/icons-material';

const drawerWidth = 240;

const adminMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Retailers', icon: <People />, path: '/admin/retailers' },
    { text: 'Categories', icon: <Category />, path: '/admin/categories' },
    { text: 'Products', icon: <LocalPharmacy />, path: '/admin/products' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Inventory', icon: <Inventory />, path: '/admin/inventory' },
    { text: 'Payments', icon: <Payment />, path: '/admin/payments' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
];

const retailerMenuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/retailer' },
    { text: 'Browse Medicines', icon: <LocalPharmacy />, path: '/retailer/products' },
    { text: 'My Orders', icon: <ShoppingCart />, path: '/retailer/orders' },
    { text: 'Place Order', icon: <Store />, path: '/retailer/place-order' },
    { text: 'Payments', icon: <Payment />, path: '/retailer/payments' },
];

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const menuItems = user?.role === 'admin' ? adminMenuItems : retailerMenuItems;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #00bfa5 100%)',
                color: 'white',
                minHeight: 80,
            }}>
                <MedicalServices sx={{ fontSize: 36 }} />
                <Box>
                    <Typography variant="h5" fontWeight={800} letterSpacing={1}>MediLink</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85, fontSize: '0.7rem' }}>
                        Wholesale Medical Platform
                    </Typography>
                </Box>
                {isMobile && (
                    <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: 'auto', color: 'white' }}>
                        <ChevronLeft />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ px: 2, py: 2 }}>
                <Box sx={{
                    p: 2, borderRadius: 3,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #e0f7fa 100%)',
                    display: 'flex', alignItems: 'center', gap: 1.5
                }}>
                    <Avatar sx={{
                        bgcolor: user?.role === 'admin' ? '#0d47a1' : '#00bfa5',
                        width: 40, height: 40, fontSize: '1rem', fontWeight: 700
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{user?.name}</Typography>
                        <Chip
                            label={user?.role === 'admin' ? 'Admin' : 'Retailer'}
                            size="small"
                            color={user?.role === 'admin' ? 'primary' : 'secondary'}
                            sx={{ height: 20, fontSize: '0.65rem', mt: 0.3 }}
                        />
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            <List sx={{ flex: 1, px: 1.5, py: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => { navigate(item.path); isMobile && setMobileOpen(false); }}
                                sx={{
                                    borderRadius: 2.5,
                                    py: 1.2,
                                    px: 2,
                                    transition: 'all 0.2s ease',
                                    ...(isActive && {
                                        background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(13, 71, 161, 0.35)',
                                        '&:hover': { background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)' },
                                        '& .MuiListItemIcon-root': { color: 'white' },
                                    }),
                                    ...(!isActive && {
                                        '&:hover': {
                                            background: 'rgba(13, 71, 161, 0.08)',
                                            transform: 'translateX(4px)',
                                        },
                                    }),
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 42, color: isActive ? 'white' : '#546e7a' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500, fontSize: '0.9rem' }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ mx: 2 }} />
            <List sx={{ px: 1.5, pb: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}
                        sx={{
                            borderRadius: 2.5, py: 1.2, color: '#ef5350',
                            '&:hover': { background: 'rgba(239, 83, 80, 0.08)' }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 42, color: '#ef5350' }}><Logout /></ListItemIcon>
                        <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4f8' }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth, border: 'none' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth, border: 'none',
                        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.06)',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
            }}>
                <AppBar position="sticky" elevation={0}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        color: 'text.primary',
                    }}
                >
                    <Toolbar>
                        <IconButton edge="start" onClick={() => setMobileOpen(true)}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                            {menuItems.find(m => m.path === location.pathname)?.text || 'MediLink'}
                        </Typography>

                        <Chip
                            label={user?.userId}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 2, fontFamily: 'monospace', fontWeight: 600, display: { xs: 'none', sm: 'flex' } }}
                        />

                        <Tooltip title="Profile">
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <Avatar sx={{ bgcolor: '#0d47a1', width: 36, height: 36, fontSize: '0.9rem' }}>
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 3 } }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={() => { setAnchorEl(null); navigate(user?.role === 'admin' ? '/admin/profile' : '/retailer/profile'); }}>
                                <Person sx={{ mr: 1.5, fontSize: 20 }} /> Profile
                            </MenuItem>
                            <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: '#ef5350' }}>
                                <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>

                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardLayout;
