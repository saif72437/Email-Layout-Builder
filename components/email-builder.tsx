"use client"

import type React from "react"
import { useState } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Sidebar } from "./sidebar"
import { Canvas } from "./canvas"
import { ExportModal } from "./export-modal"
import type { BlockType, EmailBlock } from "./types"
import { generateId } from "./utils"

export function EmailBuilder() {
  const [blocks, setBlocks] = useState<EmailBlock[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    // If dragging from sidebar to canvas
    if (active.data.current?.type === "sidebar-item" && over.id === "canvas") {
      const blockType = active.id as BlockType
      const newBlock: EmailBlock = {
        id: generateId(),
        type: blockType,
        content: getDefaultContent(blockType),
        styles: getDefaultStyles(blockType),
      }
      setBlocks((prev) => [...prev, newBlock])
      return
    }

    // If reordering within canvas
    if (active.data.current?.type === "canvas-item" && over.data.current?.type === "canvas-item") {
      const oldIndex = blocks.findIndex((block) => block.id === active.id)
      const newIndex = blocks.findIndex((block) => block.id === over.id)

      if (oldIndex !== newIndex) {
        setBlocks((prev) => arrayMove(prev, oldIndex, newIndex))
      }
    }
  }

  const updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id))
  }

  const exportToHTML = () => {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: white; }
        .block { margin-bottom: 20px; }
        .heading { font-weight: bold; }
        .paragraph { line-height: 1.6; }
        .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .image-placeholder { background-color: #e5e7eb; border: 2px dashed #9ca3af; text-align: center; padding: 40px; }
        .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="email-container">
`

    blocks.forEach((block) => {
      const styles = Object.entries(block.styles)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`)
        .join("; ")

      switch (block.type) {
        case "heading":
          html += `        <h2 class="block heading" style="${styles}">${block.content}</h2>\n`
          break
        case "paragraph":
          html += `        <p class="block paragraph" style="${styles}">${block.content}</p>\n`
          break
        case "button":
          html += `        <a href="#" class="block button" style="${styles}">${block.content}</a>\n`
          break
        case "image":
          html += `        <div class="block image-placeholder" style="${styles}">${block.content}</div>\n`
          break
        case "divider":
          html += `        <hr class="block divider" style="${styles}">\n`
          break
      }
    })

    html += `    </div>
</body>
</html>`

    return html
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Email Layout Builder</h1>
                <p className="text-sm text-gray-600">Drag blocks from the sidebar to build your email</p>
              </div>
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Export HTML
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <SortableContext items={blocks.map((b) => b.id as string)} strategy={verticalListSortingStrategy}>
              <Canvas
                blocks={blocks}
                editingBlock={editingBlock}
                onEditBlock={setEditingBlock}
                onUpdateBlock={updateBlock}
                onDeleteBlock={deleteBlock}
              />
            </SortableContext>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            {getBlockPreview(activeId as BlockType)}
          </div>
        ) : null}
      </DragOverlay>

      {showExportModal && <ExportModal html={exportToHTML()} onClose={() => setShowExportModal(false)} />}
    </DndContext>
  )
}

function getDefaultContent(type: BlockType): string {
  switch (type) {
    case "heading":
      return "Your Heading Here"
    case "paragraph":
      return "Your paragraph text goes here. Click to edit this content."
    case "button":
      return "Click Me"
    case "image":
      return "Image Placeholder - 600x300"
    case "divider":
      return ""
    default:
      return ""
  }
}

function getDefaultStyles(type: BlockType): Record<string, string> {
  switch (type) {
    case "heading":
      return {
        fontSize: "24px",
        color: "#1f2937",
        textAlign: "left",
        marginBottom: "16px",
      }
    case "paragraph":
      return {
        fontSize: "16px",
        color: "#374151",
        lineHeight: "1.6",
        textAlign: "left",
      }
    case "button":
      return {
        backgroundColor: "#3b82f6",
        color: "white",
        fontSize: "16px",
        textAlign: "center",
        borderRadius: "4px",
      }
    case "image":
      return {
        width: "100%",
        height: "200px",
        backgroundColor: "#f3f4f6",
      }
    case "divider":
      return {
        height: "1px",
        backgroundColor: "#e5e7eb",
        border: "none",
      }
    default:
      return {}
  }
}

function getBlockPreview(type: BlockType): React.ReactNode {
  switch (type) {
    case "heading":
      return <div className="font-bold text-lg">Heading Block</div>
    case "paragraph":
      return <div className="text-sm">Paragraph Block</div>
    case "button":
      return <div className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Button Block</div>
    case "image":
      return <div className="bg-gray-200 h-16 w-24 rounded flex items-center justify-center text-xs">Image</div>
    case "divider":
      return <div className="h-px bg-gray-300 w-24"></div>
    default:
      return null
  }
}
