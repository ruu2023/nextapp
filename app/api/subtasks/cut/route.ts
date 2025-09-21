
// app/api/subtasks/cut/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subTaskId, cutTime } = body;

    // 元のサブタスクを取得
    const originalSubTask = await prisma.subTask.findUnique({
      where: { id: subTaskId }
    });

    if (!originalSubTask) {
      return NextResponse.json({ error: 'SubTask not found' }, { status: 404 });
    }

    if (cutTime <= 0 || cutTime >= originalSubTask.estimatedTime) {
      return NextResponse.json({ error: 'Invalid cut time' }, { status: 400 });
    }

    // トランザクションでカット処理
    const result = await prisma.$transaction(async (tx) => {
      // 元のサブタスクの時間を更新
      const updatedOriginal = await tx.subTask.update({
        where: { id: subTaskId },
        data: {
          estimatedTime: cutTime,
          title: `${originalSubTask.title} (Part 1)`
        }
      });

      // 新しいサブタスクを作成（カット後の部分）
      const newSubTask = await tx.subTask.create({
        data: {
          title: `${originalSubTask.title} (Part 2)`,
          description: originalSubTask.description,
          estimatedTime: originalSubTask.estimatedTime - cutTime,
          mainTaskId: originalSubTask.mainTaskId,
          order: originalSubTask.order + 0.5, // 順序を調整
          parentId: subTaskId // 親子関係を設定
        }
      });

      return { updatedOriginal, newSubTask };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error cutting subtask:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
