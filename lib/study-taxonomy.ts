import type { TagItem } from "@/types/tag"

export const PROTOTYPE_SUBJECTS: TagItem[] = [
  {
    id: "1",
    value: "theoretical-physics",
    label: "Theoretical Physics",
    color: "#3b82f6",
  },
  {
    id: "2",
    value: "mathematics",
    label: "Mathematics",
    color: "#8b5cf6",
  },
  {
    id: "3",
    value: "computer-science",
    label: "Computer Science",
    color: "#22c55e",
  },
  {
    id: "4",
    value: "literature",
    label: "Literature",
    color: "#f97316",
  },
  {
    id: "5",
    value: "chemistry",
    label: "Chemistry",
    color: "#ef4444",
  },
  {
    id: "6",
    value: "biology",
    label: "Biology",
    color: "#14b8a6",
  },
  {
    id: "7",
    value: "history",
    label: "History",
    color: "#eab308",
  },
]

export const PROTOTYPE_HASHTAGS: TagItem[] = [
  { id: "1", value: "quantum", label: "#quantum", color: "#3b82f6" },
  { id: "2", value: "mechanics", label: "#mechanics", color: "#8b5cf6" },
  { id: "3", value: "algebra", label: "#algebra", color: "#22c55e" },
  { id: "4", value: "calculus", label: "#calculus", color: "#f97316" },
  { id: "5", value: "algorithms", label: "#algorithms", color: "#ef4444" },
  {
    id: "6",
    value: "data-structures",
    label: "#data-structures",
    color: "#14b8a6",
  },
  { id: "7", value: "philosophy", label: "#philosophy", color: "#eab308" },
  { id: "8", value: "research", label: "#research", color: "#ec4899" },
]

export function cloneTagItems(items: TagItem[]): TagItem[] {
  return items.map((item) => ({ ...item }))
}

export function getTagItemByValue(items: TagItem[], value: string) {
  return items.find((item) => item.value === value)
}
