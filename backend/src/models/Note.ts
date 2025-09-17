import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  _id: string;
  title: string;
  content: string;
  tenantId: mongoose.Types.ObjectId;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
noteSchema.index({ tenantId: 1, createdAt: -1 });
noteSchema.index({ tenantId: 1, createdBy: 1 });

export const Note = mongoose.model<INote>('Note', noteSchema);
