import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Extract tenant from email domain
    const domain = email.split('@')[1];
    let tenantSlug = '';
    let tenantName = '';

    if (domain === 'acme.test') {
      tenantSlug = 'acme';
      tenantName = 'Acme Corporation';
    } else if (domain === 'globex.test') {
      tenantSlug = 'globex';
      tenantName = 'Globex Corporation';
    } else {
      // For other domains, create a default tenant
      tenantSlug = domain.split('.')[0];
      tenantName = `${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} Corporation`;
    }

    // Find or create tenant
    let tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      tenant = new Tenant({
        name: tenantName,
        slug: tenantSlug,
        plan: 'free',
        maxNotes: 3,
      });
      await tenant.save();
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      role: 'member',
      tenantId: tenant._id,
    });

    await user.save();

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '7d' });

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user endpoint
router.get('/user', authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      _id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's tenant info
router.get('/user/tenant', authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

export default router;
