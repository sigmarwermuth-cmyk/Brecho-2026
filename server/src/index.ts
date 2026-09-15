import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import productRoutes from './routes/products';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static uploads
  app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

  // API routes
  app.use('/api/products', productRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });

  // Vite middleware in dev / static in production
  if (process.env.NODE_ENV !== 'production') {
    const clientRoot = path.resolve(__dirname, '../../client');
    const vite = await createViteServer({
      root: clientRoot,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

