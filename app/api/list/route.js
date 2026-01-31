import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const courseIdParam = searchParams.get("courseid");
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? '';

    try {
        if (courseIdParam) {
            const courseId = parseInt(courseIdParam);

            // 1. Fetch metadata (Ensure 'model' matches your schema name)
            const courseResult = await db.model.findFirst({
                where: { courseId: courseId }
            });

            // 2. Fetch chapters
            const chapterResult = await db.courseChapter.findMany({
                where: { courseId: courseId }
            });

            // 3. Fetch Enrollment
            // If this still errors, check if your schema is 'enrolledCourse' or 'enrollCourse'
            const enrolledCourse = await db.enrolledCourse.findFirst({
                where: {
                    courseId: courseId,
                    userId: userEmail,
                }
            });

            // FIX: findFirst returns an Object or null. Use boolean check.
            const isEnrolledCourse = !!enrolledCourse; 
             const completeExercise = await db.completedExercise.findFirst({
    where: {
        courseId: courseId,
        userId: user?.primaryEmailAddress?.emailAddress ?? '',
    },
    // Matches logic from image_21e8ba.png
    orderBy: [
        { courseId: 'desc' },
        { exerciseId: 'desc' }
    ]
});

    
            const responseData = {
                ...courseResult,
                chapters: chapterResult,
                userEnrolled: isEnrolledCourse,
                // FIX: enrolledCourse is the object itself, not an array
                courseEnrolledInfo: enrolledCourse ,
                completedExercises:completeExercise
            };

            return new Response(JSON.stringify(responseData, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });

        } else {
            const allCourses = await db.model.findMany();
            return new Response(JSON.stringify(allCourses, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}