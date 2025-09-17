import express from 'express';
import { z } from 'zod';
import { Note } from '../models/Note';
import { Tenant } from '../models/Tenant';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { enforceTenantIsolation } from '../middleware/tenant';

const router = express.Router();

const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
});

// Get all notes for the user's tenant
router.get('/notes', authenticateToken as any, enforceTenantIsolation as any, async (req: AuthRequest, res) => {
  try {
    const notes = await Note.find({ tenantId: req.user!.tenantId })
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific note
router.get('/notes/:id', authenticateToken as any, enforceTenantIsolation as any, async (req: AuthRequest, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenantId: req.user!.tenantId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new note
router.post('/notes', authenticateToken as any, enforceTenantIsolation as any, async (req: AuthRequest, res) => {
  try {
    const { title, content } = createNoteSchema.parse(req.body);

    // Check tenant plan limits
    const tenant = await Tenant.findById(req.user!.tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (tenant.plan === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: req.user!.tenantId });
      if (noteCount >= tenant.maxNotes) {
        return res.status(403).json({ 
          message: `Free plan limited to ${tenant.maxNotes} notes. Upgrade to Pro for unlimited notes.` 
        });
      }
    }

    const note = new Note({
      title,
      content,
      tenantId: req.user!.tenantId,
      createdBy: req.user!.email,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a note
router.put('/notes/:id', authenticateToken as any, enforceTenantIsolation as any, async (req: AuthRequest, res) => {
  try {
    const updateData = updateNoteSchema.parse(req.body);

    const note = await Note.findOneAndUpdate(
      { 
        _id: req.params.id, 
        tenantId: req.user!.tenantId 
      },
      updateData,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a note
router.delete('/notes/:id', authenticateToken as any, enforceTenantIsolation as any, async (req: AuthRequest, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.user!.tenantId 
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
