type Props = {
    label?: string;              // userId বা email
    imageUrl?: string | null;    // DB থেকে
    size?: number;               // px
  };
  
  function colorFromString(s: string) {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 45%)`;
  }
  
  export default function Avatar({ label, imageUrl, size = 40 }: Props) {
    const text = (label || "?").trim();
    const letter = text ? text[0].toUpperCase() : "?";
    const bg = colorFromString(text || "user");
  
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="avatar"
          style={{ width: size, height: size }}
          className="rounded-full object-cover border"
        />
      );
    }
  
    return (
      <div
        className="rounded-full flex items-center justify-center text-white font-semibold border"
        style={{ width: size, height: size, background: bg }}
        aria-label="avatar"
      >
        {letter}
      </div>
    );
  }
  