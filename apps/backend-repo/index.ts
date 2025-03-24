import dotenv from 'dotenv';
import app from './core/app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

// Start the server only if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server started successfully`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   - GET  http://localhost:${PORT}/health`);
    console.log(`   - GET  http://localhost:${PORT}/api/users/:userId`);
    console.log(`   - POST http://localhost:${PORT}/api/users/:userId`);
    console.log(`   - POST http://localhost:${PORT}/api/users/:userId/rating`);
    console.log(`   - POST http://localhost:${PORT}/api/users/:userId/activity`);
    console.log(`   - GET  http://localhost:${PORT}/api/users/high-potential`);
  });
}

// Export the Express app for Vercel
export default app; 