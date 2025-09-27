// app/api/subtasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, estimatedTime, mainTaskId, order } = body;

    const subTask = await prisma.subTask.create({
      data: {
        title,
        description,
        estimatedTime,
        mainTaskId,
        order,
      },
    });

    // メインタスクの総時間を更新
    const allSubTasks = await prisma.subTask.findMany({
      where: { mainTaskId },
    });

    const totalDuration = allSubTasks.reduce((sum, task) => sum + task.estimatedTime, 0);

    await prisma.mainTask.update({
      where: { id: mainTaskId },
      data: { totalDuration },
    });

    return NextResponse.json(subTask);
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isInToday, todayOrder } = body;

    const subTask = await prisma.subTask.update({
      where: { id },
      data: {
        isInToday,
        todayOrder,
      },
    });

    return NextResponse.json(subTask);
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
