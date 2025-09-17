import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  _id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  maxNotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  maxNotes: {
    type: Number,
    default: 3,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
tenantSchema.index({ slug: 1 });

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
