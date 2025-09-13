import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import redisClient from './lib/redis';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Connect to Redis
redisClient.connect().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 user endpoints: http://localhost:${PORT}/api/user`);
  console.log(`👑 admin endpoints: http://localhost:${PORT}/api/admin`);
});

export default app;
