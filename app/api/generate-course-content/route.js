
import { inngest } from "@/lib/inngest/client";
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { courseId, ...formData } = await req.json();
    const user = await currentUser();

    // Just send the event and return immediately
    await inngest.send({
      name: "course.generate",
      data: {
        courseId,
        formData,
        userEmail: user?.primaryEmailAddress?.emailAddress
      }
    });

    return NextResponse.json({ courseId: courseId, status: "processing" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}








        