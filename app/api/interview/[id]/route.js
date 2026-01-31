import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - Fetch interview
export async function GET(req, { params }) {
  const { id } = await params;
  
  try {
    const interview = await db.interview.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' }
        },
        answers: true
      }
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update status (THIS WAS MISSING!)
// app/api/interview/[id]/route.js
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { status, currentIndex } = await request.json();
  
  try {
    const data = {};
    if (status) data.status = status;
    if (currentIndex !== undefined) data.currentIndex = currentIndex;
    
    const updated = await db.interview.update({
      where: { id },
      data
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}