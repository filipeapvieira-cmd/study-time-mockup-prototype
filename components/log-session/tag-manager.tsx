"use client"

import * as React from "react"
import { Plus, Pencil, Trash2, Check, X, Settings, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { TagItem } from "@/types/tag"

const colorOptions = [
  { value: "", label: "No color" },
  { value: "#ffffff", label: "White" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colorOptions.map((color) => (
        <button
          key={color.value || "none"}
          type="button"
          onClick={() => onChange(color.value)}
          className={`size-6 rounded-full transition-transform hover:scale-110 ${
            value === color.value ? "ring-2 ring-ring ring-offset-2" : ""
          } ${color.value === "" ? "border-2 border-dashed border-muted-foreground" : ""} ${
            color.value === "#ffffff" ? "border border-border" : ""
          }`}
          style={{ backgroundColor: color.value || "transparent" }}
          title={color.label}
          aria-label={`Set color to ${color.label}`}
        />
      ))}
    </div>
  )
}

interface ColorDotProps {
  color: string
  className?: string
}

function ColorDot({ color, className = "" }: ColorDotProps) {
  if (!color) {
    return (
      <div
        className={`size-4 shrink-0 rounded-full border-2 border-dashed border-muted-foreground ${className}`}
      />
    )
  }
  return (
    <div
      className={`size-4 shrink-0 rounded-full ${color === "#ffffff" ? "border border-border" : ""} ${className}`}
      style={{ backgroundColor: color }}
    />
  )
}

interface TagListProps {
  items: TagItem[]
  onAdd: (item: Omit<TagItem, "id">) => void
  onUpdate: (id: string, item: Omit<TagItem, "id">) => void
  onDelete: (id: string) => void
  itemType: "subject" | "hashtag"
}

function TagList({ items, onAdd, onUpdate, onDelete, itemType }: TagListProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editLabel, setEditLabel] = React.useState("")
  const [editColor, setEditColor] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [newLabel, setNewLabel] = React.useState("")
  const [newColor, setNewColor] = React.useState(colorOptions[7].value) // Blue default
  const [searchQuery, setSearchQuery] = React.useState("")

  const startEdit = (item: TagItem) => {
    setEditingId(item.id)
    setEditLabel(item.label.replace(/^#/, ""))
    setEditColor(item.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditLabel("")
    setEditColor("")
  }

  const saveEdit = (id: string) => {
    if (editLabel.trim()) {
      onUpdate(id, {
        value: editLabel.toLowerCase().replace(/\s+/g, "-"),
        label: itemType === "hashtag" ? `#${editLabel.trim().replace(/^#/, "")}` : editLabel.trim(),
        color: editColor,
      })
      cancelEdit()
    }
  }

  const handleAdd = () => {
    if (newLabel.trim()) {
      onAdd({
        value: newLabel.toLowerCase().replace(/\s+/g, "-"),
        label: itemType === "hashtag" ? `#${newLabel.trim().replace(/^#/, "")}` : newLabel.trim(),
        color: newColor,
      })
      setNewLabel("")
      setNewColor(colorOptions[7].value)
      setIsAdding(false)
    }
  }

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Search ${itemType}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[240px] sm:h-[280px]">
        <div className="flex flex-col gap-2 pr-4">
          {filteredItems.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                /* Edit form - same layout as Add form */
                <div className="flex flex-col gap-3 rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <ColorDot color={editColor} />
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder={`Enter ${itemType} name...`}
                      className="h-8 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(item.id)
                        if (e.key === "Escape") cancelEdit()
                      }}
                    />
                  </div>
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(item.id)} className="flex-1">
                      Save changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <ColorDot color={item.color} />
                  <span className="flex-1 truncate text-sm">{item.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${itemType} ${item.label}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete ${itemType} ${item.label}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && !isAdding && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {searchQuery
                ? `No ${itemType}s found matching "${searchQuery}"`
                : `No ${itemType}s yet. Add your first one!`}
            </p>
          )}
        </div>
      </ScrollArea>

      {isAdding ? (
        <div className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-center gap-2">
            <ColorDot color={newColor} />
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder={`Enter ${itemType} name...`}
              className="h-8 flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") setIsAdding(false)
              }}
            />
          </div>
          <ColorPicker value={newColor} onChange={setNewColor} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="flex-1">
              Add {itemType}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsAdding(true)} className="gap-2">
          <Plus className="size-4" />
          Add {itemType}
        </Button>
      )}
    </div>
  )
}

interface TagManagerProps {
  subjects: TagItem[]
  hashtags: TagItem[]
  onSubjectsChange: (subjects: TagItem[]) => void
  onHashtagsChange: (hashtags: TagItem[]) => void
  initialTab?: "subjects" | "hashtags"
}

export function TagManager({
  subjects,
  hashtags,
  onSubjectsChange,
  onHashtagsChange,
  initialTab = "subjects",
}: TagManagerProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"subjects" | "hashtags">(
    initialTab
  )

  const addSubject = (item: Omit<TagItem, "id">) => {
    onSubjectsChange([...subjects, { ...item, id: crypto.randomUUID() }])
  }

  const updateSubject = (id: string, item: Omit<TagItem, "id">) => {
    onSubjectsChange(subjects.map((s) => (s.id === id ? { ...item, id } : s)))
  }

  const deleteSubject = (id: string) => {
    onSubjectsChange(subjects.filter((s) => s.id !== id))
  }

  const addHashtag = (item: Omit<TagItem, "id">) => {
    onHashtagsChange([...hashtags, { ...item, id: crypto.randomUUID() }])
  }

  const updateHashtag = (id: string, item: Omit<TagItem, "id">) => {
    onHashtagsChange(hashtags.map((h) => (h.id === id ? { ...item, id } : h)))
  }

  const deleteHashtag = (id: string) => {
    onHashtagsChange(hashtags.filter((h) => h.id !== id))
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setActiveTab(initialTab)
    }

    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 shrink-0">
          <Settings className="size-4" />
          <span className="sr-only">Manage subjects and hashtags</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Subjects and Tags</DialogTitle>
          <DialogDescription>
            Add, edit, or remove subjects and hashtags with custom colors.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "subjects" | "hashtags")
          }
          className="mt-2"
        >
          <TabsList className="w-full">
            <TabsTrigger value="subjects" className="flex-1">
              Subjects
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex-1">
              Hashtags
            </TabsTrigger>
          </TabsList>
          <TabsContent value="subjects" className="mt-4">
            <TagList
              items={subjects}
              onAdd={addSubject}
              onUpdate={updateSubject}
              onDelete={deleteSubject}
              itemType="subject"
            />
          </TabsContent>
          <TabsContent value="hashtags" className="mt-4">
            <TagList
              items={hashtags}
              onAdd={addHashtag}
              onUpdate={updateHashtag}
              onDelete={deleteHashtag}
              itemType="hashtag"
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export type { TagItem } from "@/types/tag"
