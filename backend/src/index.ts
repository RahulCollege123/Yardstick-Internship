import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import tenantsRoutes from './routes/tenants';
import healthRoutes from './routes/health';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const password = process.env.MONGODB_PASSWORD;
    const mongoURI = process.env.MONGODB_URI || 
      (password ? `mongodb+srv://23bei048_db_user:${password}@clusterforinternship.isdoq2h.mongodb.net/noteshub?retryWrites=true&w=majority` : 
       'mongodb://localhost:27017/noteshub');
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Routes
app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', notesRoutes);
app.use('/api', tenantsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server immediately, connect to DB in background
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  
  // Connect to DB after server starts
  connectDB().then(connected => {
    console.log(`Database status: ${connected ? 'connected' : 'disconnected'}`);
  });
});

export default app;
