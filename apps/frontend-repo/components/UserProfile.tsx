import { useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert,
  Stack,
  Grid,
  Avatar,
  Paper,
  Divider,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchUser } from '../store/userSlice';
import UpdateButton from './UpdateButton';

const UserProfile = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.user);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if (authUser?.uid) {
      dispatch(fetchUser(authUser.uid));
    }
  }, [dispatch, authUser]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" my={4}>
        <CircularProgress size={60} />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading profile data...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!user) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No user data available.
      </Alert>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(n => n[0] || '')
        .join('')
        .toUpperCase();
    }
  
    return user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  };
  
  // Format date for better display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box sx={{ my: 4 }}>
      <Grid container spacing={3}>
        {/* Left column - Profile overview */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              textAlign="center"
            >
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2, 
                  bgcolor: theme.palette.primary.main,
                  fontSize: '2.5rem'
                }}
              >
                {getInitials()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold">
                {user.name || 'User'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              
              {user.totalAverageWeightRatings !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                  <Typography variant="body2" color="text.secondary" mr={1}>
                    Rating:
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    fontWeight: 'bold'
                  }}>
                    {user.totalAverageWeightRatings.toFixed(1)}
                  </Box>
                </Box>
              )}
              
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                User ID
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all',
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}
              >
                {user.id}
              </Typography>
              
              <Box mt={3}>
                <UpdateButton />
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right column - User details */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* User Information */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {user.name || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {user.email || 'Not set'}
                    </Typography>
                  </Box>
                </Grid>
                
                {user.numberOfRents !== undefined && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Rents
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.numberOfRents}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                
                {user.recentlyActive && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Active
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(user.recentlyActive)}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
            
            {/* User Account Information */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Account Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Updated At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(user.updatedAt)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
            
            {/* User Preferences */}
            {user?.preferences && (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Theme
                      </Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {user?.preferences?.theme || 'Default'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notifications
                      </Typography>
                      <Typography variant="body1">
                        {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile; 