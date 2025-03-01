import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/prompts
 * Fetches all prompts from the database.
 */
export async function GET() {
  try {
    const prompts = await prisma.prompt.findMany({
      include: {
        instructions: true,
        sections: true,
      },
      orderBy: {
        updatedAt: 'desc', // Or 'asc' for ascending order
      },
    });
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

/**
 * POST /api/prompts
 * Creates a new prompt in the database.
 */
export async function POST(request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = await prisma.prompt.create({
      data: {
        title
      },
    });

    return NextResponse.json(prompt, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
