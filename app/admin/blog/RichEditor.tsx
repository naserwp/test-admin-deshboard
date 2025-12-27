"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "@/app/lib/markdown";

type RichEditorProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  uploadPath?: string;
};

const toolbarActions = [
  { label: "B", title: "Bold", wrap: "**" },
  { label: "I", title: "Italic", wrap: "*" },
  { label: "H2", title: "Heading 2", prefix: "## " },
  { label: "H3", title: "Heading 3", prefix: "### " },
  { label: "List", title: "Bullet List", prefix: "- " },
  { label: "Quote", title: "Quote", prefix: "> " },
  { label: "Code", title: "Code Block", prefix: "```\n", suffix: "\n```" },
];

export default function RichEditor({
  label = "Content",
  value,
  onChange,
  uploadPath = "/api/admin/blog/upload",
}: RichEditorProps) {
  const [mode, setMode] = useState<"compose" | "preview">("compose");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleToolbar = (action: (typeof toolbarActions)[number]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const prefix = action.prefix ?? "";
    const suffix = action.suffix ?? action.wrap ?? "";
    const wrap = action.wrap ?? "";
    const inserted = wrap
      ? `${wrap}${selected || "text"}${wrap}`
      : `${prefix}${selected || "text"}${suffix}`;

    const newValue = value.slice(0, start) + inserted + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length + wrap.length;
      textarea.selectionEnd = textarea.selectionStart + (selected || "text").length;
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const snippets: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(uploadPath, { method: "POST", body: formData });
        if (!res.ok) continue;
        const payload = await res.json();
        if (payload.url) {
          if (payload.type === "video") {
            snippets.push(
              `<video controls src="${payload.url}" class="w-full rounded-xl"></video>`
            );
          } else {
            snippets.push(`![${file.name}](${payload.url})`);
          }
        }
      }
      if (snippets.length) {
        onChange(value + "\n\n" + snippets.join("\n\n"));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleUpload(event.dataTransfer.files);
  };

  const previewHtml = useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("compose")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "compose"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Compose
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`rounded-full px-3 py-1 transition ${
              mode === "preview"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "compose" && (
        <div
          className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900/70"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex flex-wrap gap-2">
            {toolbarActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => handleToolbar(action)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-sky-500"
                title={action.title}
              >
                {action.label}
              </button>
            ))}
            <label className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500">
              {uploading ? "Uploading..." : "Upload media"}
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={10}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-800/60"
            placeholder="Write content, drop images/videos, or use the toolbar..."
          />
          <p className="text-xs text-slate-500 dark:text-slate-300">
            Drag & drop media to auto-insert markdown. Toolbar applies formatting to selections.
          </p>
        </div>
      )}

      {mode === "preview" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      )}
    </div>
  );
}
