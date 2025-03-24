'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  Container, 
  Box, 
  Typography, 
  Paper
} from '@mui/material';
import LoginForm from '../components/LoginForm';

export default function Home() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
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