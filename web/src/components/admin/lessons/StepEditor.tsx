'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface Step {
  id: string
  text: string
  image?: string | null
}

interface StepEditorProps {
  steps: Step[]
  onChange: (steps: Step[]) => void
}

/**
 * 可排序的單個步驟項目
 * 支援拖拉、高亮、視覺反饋
 */
function SortableStepItem({
  step,
  index,
  onDelete,
}: {
  step: Step
  index: number
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-3 p-3 border rounded-lg mb-2 ${
        isDragging
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-zinc-600 bg-zinc-900'
      }`}
    >
      {/* 拖拉把手 */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center cursor-grab active:cursor-grabbing px-2 py-1 bg-zinc-800 rounded hover:bg-zinc-700"
        title="拖拉排序"
      >
        <span className="text-zinc-400">⋮⋮</span>
      </div>

      {/* 步驟序號 */}
      <div className="flex items-center justify-center w-8 h-8 bg-zinc-700 rounded-full text-sm font-semibold text-white">
        {index + 1}
      </div>

      {/* 步驟內容 */}
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-sm text-zinc-300 line-clamp-2">{step.text}</p>
        {step.image && (
          <img
            src={step.image}
            alt={`Step ${index + 1}`}
            className="w-full h-24 object-cover rounded"
          />
        )}
      </div>

      {/* 刪除按鈕 */}
      <button
        onClick={() => onDelete(step.id)}
        className="flex items-center justify-center w-8 h-8 text-red-400 hover:bg-red-900/20 rounded transition"
        title="刪除步驟"
      >
        ✕
      </button>
    </div>
  )
}

/**
 * 課程步驟編輯器 - 支援拖拉排序
 * 用於管理 how 步驟陣列
 */
export function StepEditor({ steps, onChange }: StepEditorProps) {
  const [localSteps, setLocalSteps] = useState<Step[]>(steps)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localSteps.findIndex((step) => step.id === active.id)
      const newIndex = localSteps.findIndex((step) => step.id === over.id)

      const newSteps = arrayMove(localSteps, oldIndex, newIndex)
      setLocalSteps(newSteps)
      onChange(newSteps)
    }
  }

  const handleDeleteStep = (id: string) => {
    const newSteps = localSteps.filter((step) => step.id !== id)
    setLocalSteps(newSteps)
    onChange(newSteps)
  }

  const handleAddStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      text: '',
      image: undefined,
    }
    const newSteps = [...localSteps, newStep]
    setLocalSteps(newSteps)
    onChange(newSteps)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">課程步驟</h3>
        <span className="text-sm text-zinc-400">{localSteps.length} 個步驟</span>
      </div>

      {localSteps.length === 0 ? (
        <div className="p-4 border-2 border-dashed border-zinc-600 rounded text-center text-zinc-400">
          無步驟，點擊「新增步驟」開始
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localSteps.map((step) => step.id)}
            strategy={verticalListSortingStrategy}
          >
            {localSteps.map((step, index) => (
              <SortableStepItem
                key={step.id}
                step={step}
                index={index}
                onDelete={handleDeleteStep}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <button
        onClick={handleAddStep}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
      >
        + 新增步驟
      </button>

      {/* 提示文字 */}
      <p className="text-xs text-zinc-400">
        💡 拖拉左邊的把手可重新排序步驟
      </p>
    </div>
  )
}
