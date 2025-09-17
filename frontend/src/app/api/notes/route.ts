import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { 
  createNote, 
  getNotesByTenant, 
  countNotesByTenant,
  findTenantById,
  findUserById
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

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    let notes;
    if (user.role === 'admin') {
      // Admin can see all tenant notes
      notes = await getNotesByTenant(user.tenantId);
    } else {
      // Members can only see their own notes
      const allNotes = await getNotesByTenant(user.tenantId);
      notes = allNotes.filter(note => note.userId === user.userId);
    }
    
    return NextResponse.json({ notes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Check subscription limits based on tenant plan
    const tenant = await findTenantById(user.tenantId);
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    if (tenant.plan === 'free') {
      const noteCount = await countNotesByTenant(user.tenantId);
      if (noteCount >= 3) {
        return NextResponse.json(
          { error: 'Note limit reached. Upgrade to Pro for unlimited notes.' },
          { status: 403 }
        );
      }
    }
    
    const noteId = await createNote({
      title,
      content,
      userId: user.userId,
      tenantId: user.tenantId
    });
    
    return NextResponse.json({ 
      id: noteId,
      message: 'Note created successfully' 
    });
  } catch (error: any) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}