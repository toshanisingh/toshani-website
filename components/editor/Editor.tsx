"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor as TiptapEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/editor-extensions";

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-2.5 py-1 text-sm font-medium transition-colors disabled:opacity-40 ${
        active ? "bg-primary text-white" : "text-muted hover:bg-sky-soft hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function Editor({
  initial,
  onChange,
}: {
  initial?: JSONContent | null;
  onChange: (json: JSONContent) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initial && Object.keys(initial).length > 0 ? initial : "",
    immediatelyRender: false, // required in the Next App Router to avoid SSR hydration mismatch
    editorProps: {
      attributes: {
        class: "prose-article min-h-[320px] max-w-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  if (!editor) {
    return <div className="min-h-[380px] rounded-lg border border-sky-edge bg-white" />;
  }

  const e: TiptapEditor = editor;

  const setLink = () => {
    const prev = e.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", prev ?? "");
    if (url === null) return;
    if (url.trim() === "") {
      e.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    e.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const onFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed.");
        return;
      }
      e.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-sky-edge bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-sky-edge/60 p-1.5">
        <ToolbarButton title="Bold" onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")}>
          <em>i</em>
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-sky-edge" />
        <ToolbarButton title="Heading 2" onClick={() => e.chain().focus().toggleHeading({ level: 2 }).run()} active={e.isActive("heading", { level: 2 })}>
          H2
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => e.chain().focus().toggleHeading({ level: 3 }).run()} active={e.isActive("heading", { level: 3 })}>
          H3
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-sky-edge" />
        <ToolbarButton title="Bullet list" onClick={() => e.chain().focus().toggleBulletList().run()} active={e.isActive("bulletList")}>
          • List
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => e.chain().focus().toggleOrderedList().run()} active={e.isActive("orderedList")}>
          1. List
        </ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => e.chain().focus().toggleBlockquote().run()} active={e.isActive("blockquote")}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Code block" onClick={() => e.chain().focus().toggleCodeBlock().run()} active={e.isActive("codeBlock")}>
          {"</>"}
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-sky-edge" />
        <ToolbarButton title="Link" onClick={setLink} active={e.isActive("link")}>
          🔗
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : "🖼 Image"}
        </ToolbarButton>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={onFile} />
      </div>

      {uploadError && (
        <p className="border-b border-red-100 bg-red-50 px-3 py-1.5 text-sm text-red-600">{uploadError}</p>
      )}

      <EditorContent editor={editor} className="px-4 py-3" />
    </div>
  );
}
