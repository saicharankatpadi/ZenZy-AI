import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET(req) {


    const {searchParams}=new URL (req.url);
    const courseId = searchParams.get("courseId");

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const course = await db.course.findFirst({
            where: {
                id: courseId,
                userId: user.id,
            },
        }); 
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }   
        return NextResponse.json(course[0]);
    } catch (error) {
        console.error("Get course error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}