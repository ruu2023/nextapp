'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// タイプ定義（DBスキーマに合わせて更新）
interface MainTask {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  totalDuration: number;
  color: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  projectId: string;
  userId: string;
  subTasks: SubTask[];
  project?: {
    id: string;
    title: string;
    color: string;
  };
}

interface SubTask {
  id: string;
  title: string;
  description?: string;
  estimatedTime: number;
  actualTime?: number;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isInToday: boolean;
  todayOrder?: number;
  mainTaskId: string;
}

// タイムライン上のメインタスク
const TimelineMainTask: React.FC<{
  task: MainTask;
  onSubTaskCut: (subTaskId: string, cutTime: number) => void;
  onDropBack: (subTaskId: string, mainTaskId: string) => void;
  onAddSubTask: (mainTaskId: string) => void;
}> = ({ task, onSubTaskCut, onDropBack, onAddSubTask }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'subtask',
    drop: (item: { id: string; from?: string }) => {
      if (item.from === 'today') {
        onDropBack(item.id, task.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`relative bg-white border-2 rounded-lg shadow-md mb-4 transition-colors ${
        isOver ? 'border-blue-500' : 'border-gray-300'
      }`}
    >
      <div
        className="h-8 rounded-t-lg flex items-center px-3 text-white font-semibold text-sm justify-between"
        style={{ backgroundColor: task.color }}
      >
        <p>{task.title}</p>
        <p>{task.totalDuration}分</p>
      </div>
      <div className="p-2 space-y-1 flex">
        {task.subTasks
          .filter((st) => !st.isInToday)
          .map((subTask) => (
            <SubTaskBlock
              key={subTask.id}
              subTask={subTask}
              onCut={onSubTaskCut}
              totalDuration={task.totalDuration}
            />
          ))}
      </div>
      <div className="p-2 pt-0">
        <button
          onClick={() => onAddSubTask(task.id)}
          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          サブタスク追加
        </button>
      </div>
    </div>
  );
};

// サブタスクブロックコンポーネント
const SubTaskBlock: React.FC<{
  subTask: SubTask;
  onCut: (subTaskId: string, cutTime: number) => void;
  totalDuration: number;
}> = ({ subTask, onCut, totalDuration }) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const width = totalDuration > 0 ? (subTask.estimatedTime / totalDuration) * 100 : 0;

  const [{ isDragging }, drag] = useDrag({
    type: 'subtask',
    item: { id: subTask.id, type: 'subtask' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = e.clientX - rect.left;
      const cutTime = Math.round(clickX / 2);
      onCut(subTask.id, cutTime);
    }
  };

  const getStatusColor = () => {
    switch (subTask.status) {
      case 'COMPLETED':
        return 'bg-green-400';
      case 'IN_PROGRESS':
        return 'bg-yellow-400';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div
      ref={(node) => {
        blockRef.current = node;
        drag(node);
      }}
      className={`h-6 rounded cursor-pointer transition-opacity hover:opacity-80 ${getStatusColor()} ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ width: `${width}%` }}
      onDoubleClick={handleDoubleClick}
      title={`${subTask.title} (${subTask.estimatedTime}分)`}
    >
      <div className="px-2 text-xs text-white truncate leading-6">{subTask.title}</div>
    </div>
  );
};

// Today画面のドロップゾーン
const TodayDropZone: React.FC<{
  todayTasks: SubTask[];
  onDrop: (subTaskId: string) => void;
}> = ({ todayTasks, onDrop }) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'subtask',
    drop: (item: { id: string }) => {
      onDrop(item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  const dropRef = useRef<HTMLDivElement>(null);
  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`min-h-96 p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Today</h3>
      <div className="space-y-2">
        {todayTasks.map((task) => (
          <TodayTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

const TodayTaskCard: React.FC<{ task: SubTask }> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'subtask',
    item: { id: task.id, from: 'today' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const dropRef = useRef<HTMLDivElement>(null);
  drag(dropRef);

  return (
    <div
      ref={dropRef}
      className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium">{task.title}</span>
        <span className="text-sm text-gray-500">{task.estimatedTime}分</span>
      </div>
    </div>
  );
};

// メインのタイムラインページコンポーネント
const TimelinePage: React.FC = () => {
  const [mainTasks, setMainTasks] = useState<MainTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<SubTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 仮のユーザーID（実際の実装では認証から取得）
  const userId = 'user-123';

  // データ取得
  useEffect(() => {
    fetchMainTasks();
  }, []);

  const fetchMainTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      // startTimeをDateオブジェクトに変換
      const tasksWithDates = data.map((task: any) => ({
        ...task,
        startTime: new Date(task.startTime),
      }));

      setMainTasks(tasksWithDates);

      // Today画面のタスクを抽出
      const todaySubTasks = tasksWithDates
        .flatMap((task: MainTask) => task.subTasks)
        .filter((subTask: SubTask) => subTask.isInToday)
        .sort((a, b) => (a.todayOrder || 0) - (b.todayOrder || 0));

      setTodayTasks(todaySubTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // メインタスク作成
  const createMainTask = async () => {
    try {
      const title = prompt('メインタスクのタイトルを入力してください:');
      if (!title) return;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: '',
          startTime: new Date().toISOString(),
          projectId: 'default-project', // 実際の実装では適切なprojectIdを使用
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create main task');
      }

      const newTask = await response.json();
      setMainTasks((prev) => [...prev, { ...newTask, startTime: new Date(newTask.startTime) }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  // サブタスク作成
  const createSubTask = async (mainTaskId: string) => {
    try {
      const title = prompt('サブタスクのタイトルを入力してください:');
      if (!title) return;

      const estimatedTimeStr = prompt('予想時間（分）を入力してください:', '60');
      const estimatedTime = parseInt(estimatedTimeStr || '60');

      const mainTask = mainTasks.find((t) => t.id === mainTaskId);
      if (!mainTask) return;

      const order = mainTask.subTasks.length + 1;

      const response = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: '',
          estimatedTime,
          mainTaskId,
          order,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subtask');
      }

      const newSubTask = await response.json();

      // ローカル状態を更新
      setMainTasks((prev) =>
        prev.map((task) =>
          task.id === mainTaskId
            ? {
                ...task,
                subTasks: [...task.subTasks, newSubTask],
                totalDuration: task.totalDuration + estimatedTime,
              }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subtask');
    }
  };

  // Today画面への移動
  const handleDropToToday = async (subTaskId: string) => {
    try {
      const response = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: subTaskId,
          isInToday: true,
          todayOrder: todayTasks.length + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      // ローカル状態を更新
      const allSubTasks = mainTasks.flatMap((task) => task.subTasks);
      const subTask = allSubTasks.find((st) => st.id === subTaskId);

      if (subTask && !subTask.isInToday) {
        const updatedSubTask = { ...subTask, isInToday: true, todayOrder: todayTasks.length + 1 };
        setTodayTasks((prev) => [...prev, updatedSubTask]);

        setMainTasks((prev) =>
          prev.map((mainTask) => ({
            ...mainTask,
            subTasks: mainTask.subTasks.map((st) => (st.id === subTaskId ? updatedSubTask : st)),
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task to today');
    }
  };

  // タイムラインに戻す
  const handleDropBackToTimeline = async (subTaskId: string, mainTaskId: string) => {
    try {
      const response = await fetch('/api/subtasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: subTaskId,
          isInToday: false,
          todayOrder: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subtask');
      }

      // ローカル状態を更新
      setTodayTasks((prev) => prev.filter((t) => t.id !== subTaskId));
      setMainTasks((prev) =>
        prev.map((task) =>
          task.id === mainTaskId
            ? {
                ...task,
                subTasks: task.subTasks.map((st) =>
                  st.id === subTaskId ? { ...st, isInToday: false, todayOrder: undefined } : st
                ),
              }
            : task
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task back');
    }
  };

  const handleSubTaskCut = (subTaskId: string, cutTime: number) => {
    console.log(`Cutting subtask ${subTaskId} at ${cutTime} minutes`);
    // TODO: サブタスクカット機能の実装
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">タスクタイムライン</h1>
            <div className="space-x-2">
              <button
                onClick={createMainTask}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                メインタスク追加
              </button>
              <button
                onClick={fetchMainTasks}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                更新
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  プロジェクトタイムライン
                </h2>
                <div className="space-y-4">
                  {mainTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      メインタスクがありません。「メインタスク追加」ボタンから作成してください。
                    </p>
                  ) : (
                    mainTasks.map((task) => (
                      <TimelineMainTask
                        key={task.id}
                        task={task}
                        onSubTaskCut={handleSubTaskCut}
                        onDropBack={handleDropBackToTimeline}
                        onAddSubTask={createSubTask}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <TodayDropZone todayTasks={todayTasks} onDrop={handleDropToToday} />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TimelinePage;
