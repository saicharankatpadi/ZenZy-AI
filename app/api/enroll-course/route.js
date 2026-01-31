import { db } from "@/lib/prisma"; // Adjust path to your prisma client
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { courseId } = await req.json();
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check if Course already enrolled (The 'findFirst' logic from your screenshot)
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        cid: courseId,
        userEmail: userEmail,
      },
    });

    // 2. If length == 0 (not enrolled), insert new record
    if (!existingEnrollment) {
      const result = await db.enrollment.create({
        data: {
          cid: courseId,
          userEmail: userEmail,
          completedChapters: [], // Default empty JSON array
        },
      });

      return NextResponse.json(result);
    }

    // 3. Otherwise return 'Already Enrolled'
    return NextResponse.json({ resp: 'Already Enrolled' });

  } catch (error) {
    console.error("Enrollment Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}