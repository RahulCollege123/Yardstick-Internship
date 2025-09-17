export interface User {
  _id?: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  _id?: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro';
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id?: string;
  title: string;
  content: string;
  userId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}