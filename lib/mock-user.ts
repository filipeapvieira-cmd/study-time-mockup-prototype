export const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatarSrc: "/avatar.jpg",
} as const

export const mockUserInitials = mockUser.name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() ?? "")
  .join("")

export const mockUserFirstName =
  mockUser.name.split(" ").filter(Boolean)[0] ?? mockUser.name
