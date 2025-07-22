export type BlockType = "heading" | "paragraph" | "button" | "image" | "divider"

export interface EmailBlock {
  id: string
  type: BlockType
  content: string
  styles: Record<string, string>
}
