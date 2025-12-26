const avatarColors = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-teal-500"
];

export function getInitials(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) {
    return "U";
  }
  return trimmed.slice(0, 1).toUpperCase();
}

export function getAvatarColor(name?: string | null) {
  const trimmed = name?.trim();
  if (!trimmed) {
    return avatarColors[0];
  }
  const charCode = trimmed.toLowerCase().charCodeAt(0);
  return avatarColors[charCode % avatarColors.length];
}
