// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const mainTasks = await prisma.mainTask.findMany({
      where: { userId },
      include: {
        subTasks: {
          orderBy: { order: 'asc' },
        },
        project: true,
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(mainTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startTime, projectId, userId } = body;

    const mainTask = await prisma.mainTask.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        totalDuration: 0,
        projectId,
        userId,
      },
      include: {
        subTasks: true,
      },
    });

    return NextResponse.json(mainTask);
  } catch (error) {
    console.error('Error creating main task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
