// Assuming this is where your Prisma client is exported
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
    try {
        const { courseId } = await req.json();
        const user = await currentUser();

        // Prisma logic replacing db.insert(EnrolledCourseTable).values(...)
        const result = await db.enrolledCourse.create({
            data: {
                courseId: courseId ?? 0,
                userId: user?.primaryEmailAddress?.emailAddress ?? '',
                xpEarned: 0,
                // enrolledDate is handled by @default(now()) in your schema
            }
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Enrollment Error:", error);
        return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
    }
}