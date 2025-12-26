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
  
export default function Avatar({
  label,
  imageUrl,
  size = 40,
  className
}: Props) {
  const text = (label || "?").trim();
  const letter = text ? text[0].toUpperCase() : "?";
  const bg = colorFromString(text || "user");

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="avatar"
        style={{ width: size, height: size }}
        className={`rounded-full border object-cover ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full border font-semibold text-white ${className ?? ""}`}
      style={{ width: size, height: size, background: bg }}
      aria-label="avatar"
    >
      {letter}
    </div>
    );
  }
  
