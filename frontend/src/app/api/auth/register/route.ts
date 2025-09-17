import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, findTenantBySlug } from '@/lib/database';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantSlug } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // For demo purposes, extract tenant from email domain
    const emailDomain = email.split('@')[1];
    let tenantId = '';
    
    if (emailDomain === 'acme.test') {
      const tenant = await findTenantBySlug('acme');
      tenantId = tenant!._id!;
    } else if (emailDomain === 'globex.test') {
      const tenant = await findTenantBySlug('globex');
      tenantId = tenant!._id!;
    } else {
      return NextResponse.json(
        { error: 'Invalid email domain. Use @acme.test or @globex.test' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userId = await createUser({
      email,
      password: hashedPassword,
      role: 'member', // Default role
      tenantId
    });

    const token = signToken({
      userId,
      email,
      role: 'member',
      tenantId
    });

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email,
        role: 'member',
        tenantId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}