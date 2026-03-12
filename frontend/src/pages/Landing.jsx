import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  AppBar,
  Toolbar,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../context/AuthContext';

const floatAnimation = {
  '@keyframes float': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-15px)' },
    '100%': { transform: 'translateY(0px)' }
  },
  animation: 'float 6s ease-in-out infinite'
};

const pulseAnimation = {
  '@keyframes pulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(13, 71, 161, 0.5)' },
    '70%': { boxShadow: '0 0 0 25px rgba(13, 71, 161, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(13, 71, 161, 0)' }
  },
  animation: 'pulse 2s infinite'
};

const FeatureCard = ({ icon, title, description }) => {
  const theme = useTheme();
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 5, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRadius: 4,
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          opacity: 0,
          transition: 'opacity 0.3s'
        },
        '&:hover': {
          transform: 'translateY(-12px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
          '&::before': {
            opacity: 1
          },
          '& .MuiSvgIcon-root': {
            transform: 'scale(1.1) rotate(5deg)',
            color: theme.palette.secondary.main,
          }
        }
      }}
    >
      <Box 
        sx={{ 
          width: 64,
          height: 64,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          color: theme.palette.primary.main, 
          mb: 3,
          '& svg': { 
            fontSize: 32,
            transition: 'all 0.3s ease'
          }
        }}
      >
        {icon}
      </Box>
      <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Paper>
  );
};

const Landing = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/retailer');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      {/* Navigation App Bar */}
      <AppBar position="absolute" color="transparent" elevation={0} sx={{ py: 2, zIndex: 10 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 2, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Typography variant="h5" fontWeight="900" color="white">M</Typography>
              </Box>
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ fontWeight: 900, color: theme.palette.text.primary, letterSpacing: '-0.5px' }}
              >
                MediLink
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {user ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={handleCTA}
                  sx={{ 
                    borderRadius: 3, 
                    textTransform: 'none', 
                    fontWeight: 700,
                    ...pulseAnimation
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    color="inherit" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main, bgcolor: 'transparent' }
                    }}
                  >
                    Log in
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => navigate('/register')}
                    sx={{ 
                      borderRadius: 3, 
                      textTransform: 'none', 
                      fontWeight: 700,
                      px: 3,
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 15, md: 22 },
          pb: { xs: 10, md: 15 },
          position: 'relative',
        }}
      >
        {/* Dynamic Background Blurs */}
        <Box 
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '0%',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 60%)`,
            zIndex: 0,
            filter: 'blur(60px)',
          }}
        />
        <Box 
          sx={{
            position: 'absolute',
            bottom: '0%',
            left: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 60%)`,
            zIndex: 0,
            filter: 'blur(80px)',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6} lg={5}>
              <Box sx={{ pr: { lg: 4 } }}>
                <Box 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2, 
                    py: 1, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    borderRadius: 10,
                    mb: 3,
                    fontWeight: 700,
                    fontSize: '0.875rem'
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                  Supply Chain Redefined
                </Box>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '3rem', sm: '4rem', md: '4.5rem' },
                    lineHeight: 1.05,
                    letterSpacing: '-1px',
                    mb: 3,
                    color: theme.palette.text.primary
                  }}
                >
                  The platform for <br />
                  <span style={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    modern pharmacy
                  </span>
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 5, 
                    lineHeight: 1.6, 
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                    maxWidth: 500
                  }}
                >
                  Connect with suppliers seamlessly. Automate inventory, track orders in real-time, and make data-driven decisions that grow your bottom line.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large" 
                    onClick={handleCTA}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 2, 
                      px: 5, 
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                  >
                    {user ? 'Enter Workspace' : 'Start for free'}
                  </Button>
                  {!user && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        fontWeight: 600,
                        ml: 2,
                        cursor: 'pointer',
                        '&:hover': { color: theme.palette.primary.main }
                      }}
                      onClick={() => navigate('/login')}
                    >
                      Already have an account? Sign in
                    </Typography>
                  )}
                </Box>
                
                {/* Trust Badges */}
                <Box sx={{ mt: 8, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.6 }}>
                  <Typography variant="body2" fontWeight="bold">TRUSTED PARTNERS</Typography>
                  <Box sx={{ width: 40, height: 2, bgcolor: 'divider' }} />
                  <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 2 }}>PHARMACORP</Typography>
                  <Typography variant="h6" fontWeight="bold" fontStyle="italic">MediSupplyCo</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} lg={7}>
              <Box 
                sx={{ 
                  width: '100%',
                  position: 'relative',
                  ...floatAnimation
                }}
              >
                {/* Floating Decorative Elements */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    p: 2,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.2), color: theme.palette.success.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LocalShippingIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Delivery Arriving</Typography>
                    <Typography variant="caption" color="text.secondary">Today, 2:30 PM</Typography>
                  </Box>
                </Paper>
                
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-10%',
                    p: 2,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AssessmentIcon />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">+24% Revenue</Typography>
                    <Typography variant="caption" color="text.secondary">This month sync</Typography>
                  </Box>
                </Paper>

                {/* Main Dashboard UI Mockup */}
                <Box
                  sx={{
                    borderRadius: 6,
                    overflow: 'hidden',
                    boxShadow: `0 30px 60px ${alpha(theme.palette.primary.dark, 0.15)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}`,
                    bgcolor: 'background.paper',
                    lineHeight: 0,
                    aspectRatio: '16/10',
                    backgroundImage: 'url(/dashboard_mockup.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '8px solid white'
                  }}
                >
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: { xs: 10, md: 15 }, position: 'relative' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
             <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              color="primary" 
              gutterBottom
              sx={{ letterSpacing: 1.5, textTransform: 'uppercase' }}
            >
              Platform Capabilities
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: theme.palette.text.primary, letterSpacing: '-0.5px' }}>
              Everything you need to scale.
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: '700px', mx: 'auto', fontWeight: 400, color: theme.palette.text.secondary, lineHeight: 1.6 }}>
              Built specifically for modern pharmaceutical retail. MediLink gives you the tools to stop managing spreadsheets and start managing growth.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<InventoryIcon />}
                title="Smart Inventory"
                description="Real-time stock tracking with automated low-stock alerts, AI predictive ordering, and expiration date monitoring."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<LocalShippingIcon />}
                title="Order Management"
                description="Seamless B2B order processing, dynamic routing, and precise delivery tracking from the supplier straight to your shelves."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<AssessmentIcon />}
                title="Advanced Analytics"
                description="Comprehensive visual reporting to identify sales trends, optimize your stock levels, and massively boost profitability."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard 
                icon={<SecurityIcon />}
                title="Secure Platform"
                description="Enterprise-grade architecture ensuring complete data privacy, HIPAA-style compliance, and 99.99% infrastructure uptime."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          pt: 10,
          pb: 6, 
          backgroundColor: '#0a1128', 
          color: theme.palette.grey[400],
          mt: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} sx={{ mb: 8 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 1.5, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" fontWeight="900" color="white">M</Typography>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'white' }}>
                  MediLink
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.7 }}>
                The ultimate platform for modern pharmaceutical distribution and retail operations. Engineered for scale, speed, and reliability.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={4}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>Product</Typography>
                  {['Features', 'Pricing', 'Integrations', 'Changelog', 'Documentation'].map((item) => (
                    <Typography key={item} variant="body2" sx={{ mb: 2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: 'white' } }}>
                      {item}
                    </Typography>
                  ))}
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>Company</Typography>
                  {['About Us', 'Careers', 'Blog', 'Contact', 'Partners'].map((item) => (
                    <Typography key={item} variant="body2" sx={{ mb: 2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: 'white' } }}>
                      {item}
                    </Typography>
                  ))}
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>Legal</Typography>
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security', 'Compliance'].map((item) => (
                    <Typography key={item} variant="body2" sx={{ mb: 2, cursor: 'pointer', transition: 'color 0.2s', '&:hover': { color: 'white' } }}>
                      {item}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} MediLink Platform Inc. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <Typography key={social} variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: 'white' } }}>
                  {social}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
