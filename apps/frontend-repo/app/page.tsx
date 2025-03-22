'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            textAlign: 'center',
            background: 'transparent'
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to User Management
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please sign in to access your profile
          </Typography>
        </Paper>
        
        <LoginForm />
      </Box>
    </Container>
  );
} 