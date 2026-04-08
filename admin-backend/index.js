import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Simple in-memory refresh token store
const refreshTokenStore = new Map();

app.use(cors());
app.use(express.json());

// ----------------------------------------
// Admin Authentication
// ----------------------------------------

// Admin login endpoint
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email: username },
      select: {
        id: true,
        email: true,
        name: true,
        hashed_password: true
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcryptjs.compareSync(password, admin.hashed_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create access token (short-lived: 15 minutes)
    const accessToken = jwt.sign(
      { sub: String(admin.id), email: admin.email },
      process.env.SECRET_KEY,
      { expiresIn: '15m' }
    );

    // Create refresh token (long-lived: 7 days)
    const refreshToken = jwt.sign(
      { sub: String(admin.id), email: admin.email, type: 'refresh' },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Store refresh token in memory
    refreshTokenStore.set(refreshToken, {
      adminId: admin.id,
      email: admin.email,
      createdAt: Date.now()
    });

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'bearer',
      expires_in: 900 // 15 minutes in seconds
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token endpoint
app.post('/admin/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    // Verify refresh token signature
    const decoded = jwt.verify(refresh_token, process.env.SECRET_KEY);

    // Check if refresh token exists in store
    const tokenData = refreshTokenStore.get(refresh_token);
    if (!tokenData) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Get fresh admin data
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(decoded.sub) },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!admin) {
      refreshTokenStore.delete(refresh_token);
      return res.status(401).json({ error: 'Admin not found' });
    }

    // Create new access token
    const newAccessToken = jwt.sign(
      { sub: String(admin.id), email: admin.email },
      process.env.SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.json({
      access_token: newAccessToken,
      refresh_token: refresh_token,
      token_type: 'bearer',
      expires_in: 900
    });
  } catch (error) {
    // Refresh token expired or invalid
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/admin/logout', (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    refreshTokenStore.delete(refresh_token);
  }
  res.json({ success: true });
});

// Auth Middleware (mirrors FastAPI logic)
const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // the subject from FastAPI is the admin ID string
    const admin = await prisma.admin.findUnique({ 
      where: { id: parseInt(decoded.sub) },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    if (!admin) {
      return res.status(403).json({ error: 'Forbidden - Admin not found' });
    }
    
    req.user = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ----------------------------------------
// Dashboard Stats
// ----------------------------------------
app.get('/api/stats', authenticateAdmin, async (req, res) => {
  const [users, posts, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  res.json({ users, posts, products, orders });
});

// ----------------------------------------
// Users
// ----------------------------------------
app.get('/api/users', authenticateAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'desc' }
  });
  res.json(users);
});

app.delete('/api/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.put('/api/users/:id/promote', authenticateAdmin, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { is_admin: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

// ----------------------------------------
// Posts
// ----------------------------------------
app.get('/api/posts', authenticateAdmin, async (req, res) => {
  const posts = await prisma.post.findMany({
    include: { user: true },
    orderBy: { id: 'desc' }
  });
  res.json(posts);
});

app.delete('/api/posts/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ----------------------------------------
// Products
// ----------------------------------------
app.get('/api/products', authenticateAdmin, async (req, res) => {
  const products = await prisma.product.findMany({
    include: { user: true },
    orderBy: { id: 'desc' }
  });
  res.json(products);
});

app.post('/api/products', authenticateAdmin, async (req, res) => {
  try {
    // Get or create system user for admin products
    let systemUser = await prisma.user.findUnique({
      where: { email: 'system@shop.local' }
    });
    
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          email: 'system@shop.local',
          name: 'System',
          hashed_password: 'N/A',
          is_admin: false
        }
      });
    }
    
    // Create product with system user_id
    const newProduct = await prisma.product.create({
      data: {
        ...req.body,
        user_id: systemUser.id
      }
    });
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});

app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: req.body.name,
        description: req.body.description,
        price: parseFloat(req.body.price),
        quantity: parseInt(req.body.quantity),
        category: req.body.category,
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ----------------------------------------
// Orders
// ----------------------------------------
app.get('/api/orders', authenticateAdmin, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { 
      user: true,
      orderitem: {
        include: { product: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  res.json(orders);
});

app.patch('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const updated = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {});
