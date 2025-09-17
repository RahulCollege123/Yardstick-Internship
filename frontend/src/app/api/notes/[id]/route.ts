import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { 
  findNoteById, 
  updateNote, 
  deleteNote
} from '@/lib/database';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request);
    const note = await findNoteById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Ensure tenant isolation
    if (note.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ note });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request);
    const { title, content } = await request.json();
    
    const note = await findNoteById(params.id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Ensure tenant isolation and ownership
    if (note.tenantId !== user.tenantId || note.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    await updateNote(params.id, { title, content });
    
    return NextResponse.json({ message: 'Note updated successfully' });
  } catch (error: any) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request);
    
    const note = await findNoteById(params.id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Ensure tenant isolation and ownership
    if (note.tenantId !== user.tenantId || note.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    await deleteNote(params.id);
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}