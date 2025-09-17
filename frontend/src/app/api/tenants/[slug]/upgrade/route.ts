import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { findTenantBySlug, updateTenantPlan } from '@/lib/database';

async function authenticateUser(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  if (!token) {
    throw new Error('No token provided');
  }
  
  const payload = verifyToken(token) as any;
  if (!payload) {
    throw new Error('Invalid token');
  }
  
  return payload;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await authenticateUser(request);
    
    // Only admins can upgrade plans
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }
    
    const tenant = await findTenantBySlug(params.slug);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    // Ensure user belongs to this tenant
    if (tenant._id !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    await updateTenantPlan(tenant._id!, 'pro');
    
    return NextResponse.json({ 
      message: 'Successfully upgraded to Pro plan',
      tenant: { ...tenant, plan: 'pro' }
    });
  } catch (error: any) {
    console.error('Upgrade tenant error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}