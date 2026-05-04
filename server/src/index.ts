import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import solutionRoutes from './routes/solutions';
import commentRoutes from './routes/comments';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', solutionRoutes); 
app.use('/api', commentRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));