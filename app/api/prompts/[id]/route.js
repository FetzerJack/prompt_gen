import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/prompts/[id]
 * Fetches a single prompt by ID from the database.
 */
export async function GET(request, context) {
  const params = await context.params;
  const id = params.id;

  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        instructions: true,
        sections: true,
      },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error fetching prompt by ID:", error);
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 });
  }
}

/**
 * PUT /api/prompts/[id]
 * Updates an existing prompt in the database using a transaction to ensure consistency.
 */
export async function PUT(request, context) {
  const params = await context.params;
  const id = params.id;
  
  try {
    const { title, objective, instructions, customSections } = await request.json();
    
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Use a transaction to ensure all operations succeed or fail together
    const updatedPrompt = await prisma.$transaction(async (tx) => {
      // First check if prompt exists
      const existingPrompt = await tx.prompt.findUnique({
        where: { id },
        include: { instructions: true, sections: true }
      });
      
      if (!existingPrompt) {
        throw new Error('Prompt not found');
      }
      
      // Update the prompt basic info
      const promptUpdate = await tx.prompt.update({
        where: { id },
        data: {
          title,
          objective: objective || '',
        },
      });
      
      // Delete existing instructions and create new ones in a single operation
      await tx.instruction.deleteMany({
        where: { promptId: id },
      });
      
      if (instructions && instructions.length > 0) {
        await tx.instruction.createMany({
          data: instructions.map(text => ({
            text,
            promptId: id,
          })),
        });
      }
      
      // Delete existing sections and create new ones in a single operation
      await tx.section.deleteMany({
        where: { promptId: id },
      });
      
      if (customSections && customSections.length > 0) {
        await tx.section.createMany({
          data: customSections.map(section => ({
            title: section.title,
            body: section.body || '',
            promptId: id,
          })),
        });
      }
      
      // Return the complete updated prompt with its relations
      return tx.prompt.findUnique({
        where: { id },
        include: {
          instructions: true,
          sections: true,
        },
      });
    });
    
    return NextResponse.json(updatedPrompt);
  } catch (error) {
    console.error("Error updating prompt:", error);
    const statusCode = error.message === 'Prompt not found' ? 404 : 500;
    const errorMessage = error.message === 'Prompt not found' 
      ? 'Prompt not found' 
      : 'Failed to update prompt';
      
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

/**
 * DELETE /api/prompts/[id]
 * Deletes a prompt by ID from the database.
 */
export async function DELETE(request, context) {
  const params = await context.params;
  const id = params.id;
  
  try {
    // Use a transaction to ensure all related data is deleted properly
    await prisma.$transaction(async (tx) => {
      // First check if prompt exists
      const existingPrompt = await tx.prompt.findUnique({
        where: { id }
      });
      
      if (!existingPrompt) {
        throw new Error('Prompt not found');
      }
      
      // Delete related instructions
      await tx.instruction.deleteMany({
        where: { promptId: id },
      });

      // Delete related sections
      await tx.section.deleteMany({
        where: { promptId: id },
      });

      // Now delete the prompt
      await tx.prompt.delete({
        where: { id },
      });
    });
    
    return NextResponse.json({ message: 'Prompt deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    
    // Handle different error types
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Log the specific Prisma error code for debugging
      console.log("Prisma error code:", error.code);
      
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }
    }
    
    const statusCode = error.message === 'Prompt not found' ? 404 : 500;
    const errorMessage = error.message === 'Prompt not found'
      ? 'Prompt not found'
      : 'Failed to delete prompt';
      
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}