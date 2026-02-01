import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    try {
        // 1. Authenticate user via Clerk
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userEmail = user.primaryEmailAddress?.emailAddress;

        // 2. Query logic
        let result;

        if (courseId) {
            // Logic: Fetch specific course by CID (String/UUID)
            // Equivalent to image_ae05db.png select query
            result = await db.course.findFirst({
                where: {
                    cid: courseId,
                    userEmail: userEmail, // Safety check: ensures user owns the course
                },
            });
        } else {
            // Logic: Fetch all courses belonging to this user
            // Equivalent to bottom part of Screenshot 2026-01-31 141652.png
            result = await db.course.findMany({
                where: {
                    userEmail: userEmail,
                },
                orderBy: {
                    createdAt: 'desc' // Optional: show newest courses first
                }
            });
        }

        // 3. Handle Case: Not found
        if (!result || (Array.isArray(result) && result.length === 0)) {
            return NextResponse.json(
                { error: "No courses found" }, 
                { status: 404 }
            );
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error("❌ Prisma Query Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message }, 
            { status: 500 }
        );
    }
}