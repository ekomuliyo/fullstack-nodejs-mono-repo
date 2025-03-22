import { useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Typography,
  Alert,
  Box,
  IconButton,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { updateUser } from '../store/userSlice';
import { User } from 'shared';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

const UpdateButton = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch<AppDispatch>();
  const { user, updateStatus, updateError } = useSelector((state: RootState) => state.user);
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  
  const handleOpen = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleSubmit = async () => {
    if (!user || !authUser) return;
    
    const userData: Partial<User> = {
      name,
      email,
    };
    
    try {
      await dispatch(updateUser({ 
        userId: user.id, 
        userData 
      })).unwrap();
      
      handleClose();
    } catch (error) {
      console.error('Error updating user:', error);
      // Keep dialog open on error
    }
  };
  
  const isLoading = updateStatus === 'loading';
  const isSuccess = updateStatus === 'succeeded';
  
  return (
    <>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpen}
        disabled={!user || !authUser}
        startIcon={<span>✏️</span>}
        sx={{
          px: 3,
          py: 1,
          borderRadius: '20px',
          boxShadow: theme.shadows[2],
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          }
        }}
      >
        Edit Profile
      </Button>
      
      {updateStatus === 'succeeded' && (
        <Typography 
          color="success.main" 
          sx={{ 
            mt: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center' 
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'success.light',
              color: 'success.contrastText',
              fontWeight: 'medium',
            }}
          >
            Profile updated successfully!
          </Box>
        </Typography>
      )}
      
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}>
          <Typography variant="h6" fontWeight="bold">
            Update Profile Information
          </Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose}
            aria-label="close"
            size="small"
          >
            <span>✕</span>
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {updateError && (
            <Alert severity="error" sx={{ mb: 3 }} variant="filled">
              {updateError}
            </Alert>
          )}
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Your Profile Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
          </Box>
          
          <TextField
            autoFocus
            margin="normal"
            id="name"
            label="Full Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <TextField
            margin="normal"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            variant="outlined"
            InputProps={{
              readOnly: true, // Email fields should typically be read-only
            }}
            helperText="Email cannot be changed as it's linked to your account"
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose} 
            disabled={isLoading}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <span>💾</span>}
            sx={{ borderRadius: 2, px: 3 }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateButton; 