"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Saves or updates chat history in Neon DB
 */
export async function saveChatAction(recordId, messages) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const email = user.primaryEmailAddress?.emailAddress;

    const result = await db.chatHistory.upsert({
      where: { recordId: recordId },
      update: {
        content: messages,
      },
      create: {
        recordId: recordId,
        content: messages,
        userEmail: email,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Prisma Save Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves chat history for a specific session
 */
"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Updates or Creates the chat history in Neon
 */
export async function updateChatAction(recordId, updatedMessages) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const email = user.primaryEmailAddress?.emailAddress;

    // We use upsert: if recordId exists, update content; else, create new
    const updatedChat = await db.chatHistory.upsert({
      where: { 
        recordId: recordId 
      },
      update: {
        content: updatedMessages, // Prisma replaces the JSON array with the new one
      },
      create: {
        recordId: recordId,
        content: updatedMessages,
        userEmail: email,
      },
    });

    return { success: true, data: updatedChat };
  } catch (error) {
    console.error("Prisma Update Error:", error);
    return { success: false, error: error.message };
  }
}
export async function getChatAction(recordId) {
  try {
    const chat = await db.chatHistory.findUnique({
      where: { recordId: recordId },
    });
    return chat;
  } catch (error) {
    console.error("Prisma Fetch Error:", error);
    return null;
  }
}