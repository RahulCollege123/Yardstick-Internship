import clientPromise from './mongodb';
import { User, Tenant, Note } from '../models/User';
import { ObjectId } from 'mongodb';

export async function getDatabase() {
  const client = await clientPromise;
  return client.db('noteshub');
}

// User operations
export async function createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection('users').insertOne({
    ...user,
    createdAt: now,
    updatedAt: now
  });
  return result.insertedId.toString();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const user = await db.collection('users').findOne({ email });
  if (!user) return null;
  return { 
    _id: user._id.toString(),
    email: user.email,
    password: user.password,
    role: user.role,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDatabase();
  const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
  if (!user) return null;
  return { 
    _id: user._id.toString(),
    email: user.email,
    password: user.password,
    role: user.role,
    tenantId: user.tenantId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

// Tenant operations
export async function createTenant(tenant: Omit<Tenant, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection('tenants').insertOne({
    ...tenant,
    createdAt: now,
    updatedAt: now
  });
  return result.insertedId.toString();
}

export async function findTenantBySlug(slug: string): Promise<Tenant | null> {
  const db = await getDatabase();
  const tenant = await db.collection('tenants').findOne({ slug });
  if (!tenant) return null;
  return { 
    _id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    plan: tenant.plan,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt
  };
}

export async function updateTenantPlan(tenantId: string, plan: 'free' | 'pro') {
  const db = await getDatabase();
  await db.collection('tenants').updateOne(
    { _id: new ObjectId(tenantId) },
    { $set: { plan, updatedAt: new Date() } }
  );
}

// Note operations
export async function createNote(note: Omit<Note, '_id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDatabase();
  const now = new Date();
  const result = await db.collection('notes').insertOne({
    ...note,
    createdAt: now,
    updatedAt: now
  });
  return result.insertedId.toString();
}

export async function getNotesByTenant(tenantId: string): Promise<Note[]> {
  const db = await getDatabase();
  const notes = await db.collection('notes').find({ tenantId }).toArray();
  return notes.map(note => ({
    _id: note._id.toString(),
    title: note.title,
    content: note.content,
    userId: note.userId,
    tenantId: note.tenantId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  }));
}

export async function findNoteById(id: string): Promise<Note | null> {
  const db = await getDatabase();
  const note = await db.collection('notes').findOne({ _id: new ObjectId(id) });
  if (!note) return null;
  return {
    _id: note._id.toString(),
    title: note.title,
    content: note.content,
    userId: note.userId,
    tenantId: note.tenantId,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

export async function updateNote(id: string, updates: Partial<Note>) {
  const db = await getDatabase();
  await db.collection('notes').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function deleteNote(id: string) {
  const db = await getDatabase();
  await db.collection('notes').deleteOne({ _id: new ObjectId(id) });
}

export async function countNotesByTenant(tenantId: string): Promise<number> {
  const db = await getDatabase();
  return await db.collection('notes').countDocuments({ tenantId });
}