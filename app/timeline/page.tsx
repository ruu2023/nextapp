'use client';

import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// タイプ定義
interface MainTask {
  id: string;
  title: string;
  startTime: Date;
  totalDuration: number;
  color: string;
  subTasks: SubTask[];
}

interface SubTask {
  id: string;
  title: string;
  estimatedTime: number;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  isInToday: boolean;
}

// タイムライン上のメインタスク
const TimelineMainTask: React.FC<{
  task: MainTask;
  onSubTaskCut: (subTaskId: string, cutTime: number) => void;
  onDropBack: (subTaskId: string, mainTaskId: string) => void; // 👈 追加
}> = ({ task, onSubTaskCut, onDropBack }) => {
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
      {/* ヘッダー ... */}
      <div
        className="h-8 rounded-t-lg flex items-center px-3 text-white font-semibold text-sm flex justify-between"
        style={{ backgroundColor: task.color }}
      >
        <p>{task.title}</p>
        <p>{task.totalDuration}分</p>
      </div>
      {/* サブタスク */}
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
    </div>
  );
};

// サブタスクブロックコンポーネント
const SubTaskBlock: React.FC<{
  subTask: SubTask;
  onCut: (subTaskId: string, cutTime: number) => void;
  totalDuration: number;
}> = ({ subTask, onCut, totalDuration }) => {
  const [isDragging, setIsDragging] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const width = (subTask.estimatedTime / totalDuration) * 100;

  const [{ isDragging: dragState }, drag] = useDrag({
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
      const cutTime = Math.round(clickX / 2); // px to minutes
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
        dragState ? 'opacity-50' : ''
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

// ✅ Todayタスクもドラッグ可能にする
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
  const [mainTasks, setMainTasks] = useState<MainTask[]>([
    {
      id: '1',
      title: 'ウェブサイト制作',
      startTime: new Date(),
      totalDuration: 480, // 8時間
      color: '#3B82F6',
      subTasks: [
        {
          id: 's1',
          title: 'デザイン作成',
          estimatedTime: 120,
          order: 1,
          status: 'PENDING',
          isInToday: false,
        },
        {
          id: 's2',
          title: 'コーディング',
          estimatedTime: 240,
          order: 2,
          status: 'PENDING',
          isInToday: false,
        },
        {
          id: 's3',
          title: 'テスト',
          estimatedTime: 120,
          order: 3,
          status: 'PENDING',
          isInToday: false,
        },
      ],
    },
    {
      id: '2',
      title: '英語',
      startTime: new Date(),
      totalDuration: 200,
      color: '#d5ab63ff',
      subTasks: [
        {
          id: 'c1',
          title: '金の文法',
          estimatedTime: 100,
          order: 1,
          status: 'IN_PROGRESS',
          isInToday: false,
        },
        {
          id: 'c2',
          title: 'やた単',
          estimatedTime: 100,
          order: 2,
          status: 'IN_PROGRESS',
          isInToday: false,
        },
      ],
    },
  ]);

  const [todayTasks, setTodayTasks] = useState<SubTask[]>([]);

  const handleDropBackToTimeline = (subTaskId: string, mainTaskId: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== subTaskId));

    setMainTasks((prev) =>
      prev.map((task) =>
        task.id === mainTaskId
          ? {
              ...task,
              subTasks: task.subTasks.map((st) =>
                st.id === subTaskId ? { ...st, isInToday: false } : st
              ),
            }
          : task
      )
    );
  };

  const handleSubTaskCut = (subTaskId: string, cutTime: number) => {
    // サブタスクをカットする処理
    console.log(`Cutting subtask ${subTaskId} at ${cutTime} minutes`);
    // 実装: サブタスクを2つに分割
  };

  const handleDropToToday = (subTaskId: string) => {
    // サブタスクをToday画面に移動
    const allSubTasks = mainTasks.flatMap((task) => task.subTasks);
    const subTask = allSubTasks.find((st) => st.id === subTaskId);

    if (subTask && !subTask.isInToday) {
      setTodayTasks((prev) => [...prev, { ...subTask, isInToday: true }]);

      // メインタスクからisInTodayを更新
      setMainTasks((prev) =>
        prev.map((mainTask) => ({
          ...mainTask,
          subTasks: mainTask.subTasks.map((st) =>
            st.id === subTaskId ? { ...st, isInToday: true } : st
          ),
        }))
      );
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">タスクタイムライン</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* タイムライン部分 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  プロジェクトタイムライン
                </h2>

                {/* メインタスク一覧 */}
                <div className="space-y-4">
                  {mainTasks.map((task) => (
                    <TimelineMainTask
                      key={task.id}
                      task={task}
                      onSubTaskCut={handleSubTaskCut}
                      onDropBack={handleDropBackToTimeline}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Today画面 */}
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
