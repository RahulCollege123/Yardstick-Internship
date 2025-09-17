import { NextResponse } from 'next/server';

export async function POST() {
  // Since we're using JWT tokens stored client-side, 
  // logout is handled client-side by removing the token
  return NextResponse.json({ message: 'Logged out successfully' });
}