type Props = {
  label?: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
};
  
function colorFromString(s: string) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 45%)`;
}

function getInitials(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "?";
  const parts = cleaned.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
  
export default function Avatar({
  label,
  imageUrl,
  size = 40,
  className
}: Props) {
  const text = (label || "?").trim();
  const initials = getInitials(text || "?");
  const bg = colorFromString(text || "user");

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="avatar"
        style={{ width: size, height: size }}
        className={`rounded-full border border-slate-200 object-cover shadow-sm dark:border-slate-700 ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full border border-white/60 font-semibold text-white shadow-sm ring-1 ring-black/5 dark:border-slate-800 ${className ?? ""}`}
      style={{ width: size, height: size, background: bg }}
      aria-label="avatar"
    >
      {initials}
    </div>
  );
}
  
