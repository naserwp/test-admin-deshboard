type VoiceIconProps = {
  className?: string;
};

export default function VoiceIcon({ className }: VoiceIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M9.5 21h5" />
      <path d="M4 9.5c0 1.2.2 2.4.6 3.5" />
      <path d="M20 9.5c0 1.2-.2 2.4-.6 3.5" />
    </svg>
  );
}
