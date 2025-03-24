'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar, 
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/authSlice';
import { clearUser } from '../../store/userSlice';
import UserProfile from '../../components/UserProfile';

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(clearUser());
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  if (loading || !user) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor={theme.palette.background.default}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }
  
  // Get user initials for avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0] || '')
        .join('')
        .toUpperCase();
    }
    
    return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: theme.palette.grey[100]
    }}>
      <AppBar position="static" elevation={0} color="primary">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <div>≡</div>
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
              User Dashboard
            </Box>
            <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
              Dashboard
            </Box>
          </Typography>
          
          {!isMobile && (
            <>
              <IconButton color="inherit" sx={{ mx: 1 }}>
                <div>🔔</div>
              </IconButton>
            </>
          )}
          
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="profile-menu"
            aria-haspopup="true"
          >
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.secondary.main,
                border: `2px solid ${theme.palette.common.white}`
              }}
            >
              {getInitials()}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 200 }
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user.displayName || user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
          Logout
        </MenuItem>
      </Menu>
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              backgroundImage: 'linear-gradient(120deg, #e0f7fa 0%, #bbdefb 100%)'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome back, {user.displayName || user.email?.split('@')[0] || 'User'}
            </Typography>
            <Typography variant="body1">
              Manage your profile and account settings below.
            </Typography>
          </Paper>
          
          <UserProfile />
        </Container>
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          textAlign: 'center',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
} 