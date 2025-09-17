import express from 'express';
import { Tenant } from '../models/Tenant';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Upgrade tenant plan (Admin only)
router.post('/tenants/:slug/upgrade', authenticateToken as any, requireRole(['admin']) as any, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    // Ensure admin can only upgrade their own tenant
    const userTenant = await Tenant.findById(req.user!.tenantId);
    if (!userTenant || userTenant.slug !== slug) {
      return res.status(403).json({ message: 'Unauthorized to upgrade this tenant' });
    }

    const tenant = await Tenant.findOneAndUpdate(
      { slug, _id: req.user!.tenantId },
      { 
        plan: 'pro',
        maxNotes: -1, // Unlimited notes for pro plan
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tenant information
router.get('/tenants/:slug', authenticateToken as any, async (req: AuthRequest, res) => {
  try {
    const { slug } = req.params;

    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Ensure user can only access their own tenant
    if (tenant._id.toString() !== req.user!.tenantId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to tenant' });
    }

    res.json(tenant);
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
