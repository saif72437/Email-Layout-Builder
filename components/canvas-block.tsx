"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Palette } from "lucide-react"
import type { EmailBlock } from "./types"

interface CanvasBlockProps {
  block: EmailBlock
  isEditing: boolean
  onEdit: () => void
  onStopEdit: () => void
  onUpdate: (updates: Partial<EmailBlock>) => void
  onDelete: () => void
}

export function CanvasBlock({ block, isEditing, onEdit, onStopEdit, onUpdate, onDelete }: CanvasBlockProps) {
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [tempContent, setTempContent] = useState(block.content)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { type: "canvas-item" },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleContentSave = () => {
    onUpdate({ content: tempContent })
    onStopEdit()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleContentSave()
    } else if (e.key === "Escape") {
      setTempContent(block.content)
      onStopEdit()
    }
  }

  const updateStyle = (key: string, value: string) => {
    onUpdate({
      styles: { ...block.styles, [key]: value },
    })
  }

  const renderBlock = () => {
    const commonStyles = {
      ...block.styles,
      outline: isEditing ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
    }

    switch (block.type) {
      case "heading":
        return isEditing ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleContentSave}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none text-2xl font-bold"
            style={commonStyles}
          />
        ) : (
          <h2 style={commonStyles} className="text-2xl font-bold cursor-pointer" onClick={onEdit}>
            {block.content}
          </h2>
        )

      case "paragraph":
        return isEditing ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleContentSave}
            onKeyDown={handleKeyPress}
            className="w-full bg-transparent border-none outline-none resize-none"
            style={commonStyles}
            rows={3}
          />
        ) : (
          <p style={commonStyles} className="cursor-pointer" onClick={onEdit}>
            {block.content}
          </p>
        )

      case "button":
        return isEditing ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            onBlur={handleContentSave}
            onKeyDown={handleKeyPress}
            className="bg-transparent border-none outline-none text-center"
            style={commonStyles}
          />
        ) : (
          <button style={commonStyles} className="px-6 py-3 rounded cursor-pointer" onClick={onEdit}>
            {block.content}
          </button>
        )

      case "image":
        return (
          <div
            style={commonStyles}
            className="border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer"
            onClick={onEdit}
          >
            <span className="text-gray-500">{block.content}</span>
          </div>
        )

      case "divider":
        return <hr style={commonStyles} className="border-gray-300" />

      default:
        return null
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={`group relative mb-4 ${isDragging ? "opacity-50" : ""}`}>
      {/* Block Controls */}
      <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1">
        <button {...attributes} {...listeners} className="p-1 bg-gray-100 hover:bg-gray-200 rounded cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setShowStylePanel(!showStylePanel)}
          className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          <Palette className="w-4 h-4 text-gray-600" />
        </button>
        <button onClick={onDelete} className="p-1 bg-red-100 hover:bg-red-200 rounded">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Block Content */}
      <div className="relative">{renderBlock()}</div>

      {/* Style Panel */}
      {showStylePanel && (
        <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 z-10">
          <h4 className="font-medium mb-3">Block Styles</h4>

          {block.type !== "divider" && (
            <>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={Number.parseInt(block.styles.fontSize || "16")}
                  onChange={(e) => updateStyle("fontSize", `${e.target.value}px`)}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{block.styles.fontSize}</span>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={block.styles.color || "#000000"}
                  onChange={(e) => updateStyle("color", e.target.value)}
                  className="w-full h-8 rounded"
                />
              </div>

              {block.type === "button" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Background</label>
                  <input
                    type="color"
                    value={block.styles.backgroundColor || "#3b82f6"}
                    onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                    className="w-full h-8 rounded"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Text Align</label>
                <select
                  value={block.styles.textAlign || "left"}
                  onChange={(e) => updateStyle("textAlign", e.target.value)}
                  className="w-full p-1 border border-gray-300 rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}

          <button
            onClick={() => setShowStylePanel(false)}
            className="w-full bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
