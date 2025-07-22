"use client"

import type React from "react"
import { useDraggable } from "@dnd-kit/core"
import { Type, AlignLeft, MousePointer, ImageIcon, Minus } from "lucide-react"
import type { BlockType } from "./types"

const blockTypes: { type: BlockType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "heading",
    label: "Heading",
    icon: <Type className="w-5 h-5" />,
    description: "Add a title or heading",
  },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: <AlignLeft className="w-5 h-5" />,
    description: "Add body text content",
  },
  {
    type: "button",
    label: "Button",
    icon: <MousePointer className="w-5 h-5" />,
    description: "Add a call-to-action button",
  },
  {
    type: "image",
    label: "Image",
    icon: <ImageIcon className="w-5 h-5" />,
    description: "Add an image placeholder",
  },
  {
    type: "divider",
    label: "Divider",
    icon: <Minus className="w-5 h-5" />,
    description: "Add a horizontal line",
  },
]

export function Sidebar() {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Email Blocks</h2>
        <p className="text-sm text-gray-600">Drag these blocks to your email canvas</p>
      </div>

      <div className="space-y-3">
        {blockTypes.map((blockType) => (
          <DraggableBlock
            key={blockType.type}
            type={blockType.type}
            label={blockType.label}
            icon={blockType.icon}
            description={blockType.description}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Drag blocks to the canvas</li>
          <li>• Click blocks to edit content</li>
          <li>• Reorder by dragging within canvas</li>
          <li>• Export when ready</li>
        </ul>
      </div>
    </div>
  )
}

function DraggableBlock({
  type,
  label,
  icon,
  description,
}: {
  type: BlockType
  label: string
  icon: React.ReactNode
  description: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: type,
    data: { type: "sidebar-item", },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-4 border border-gray-200 rounded-lg cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="text-gray-600 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900">{label}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
    </div>
  )
}
