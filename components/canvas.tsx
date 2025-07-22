"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { EmailBlock } from "./types"
import { CanvasBlock } from "./canvas-block"

interface CanvasProps {
  blocks: EmailBlock[]
  editingBlock: string | null
  onEditBlock: (id: string | null) => void
  onUpdateBlock: (id: string, updates: Partial<EmailBlock>) => void
  onDeleteBlock: (id: string) => void
}

export function Canvas({
  blocks,
  editingBlock,
  onEditBlock,
  onUpdateBlock,
  onDeleteBlock,
}: CanvasProps) {
  const { setNodeRef } = useDroppable({ id: "canvas" })

  return (
    <div className="p-6">
      <div
        ref={setNodeRef}
        className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]"
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-center">
            <div>
              <div className="text-6xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Building Your Email
              </h3>
              <p className="text-gray-600">
                Drag blocks from the sidebar to begin creating your email layout
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <SortableContext
              items={blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  isEditing={editingBlock === block.id}
                  onEdit={() => onEditBlock(block.id)}
                  onStopEdit={() => onEditBlock(null)}
                  onUpdate={(updates) => onUpdateBlock(block.id, updates)}
                  onDelete={() => onDeleteBlock(block.id)}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  )
}
