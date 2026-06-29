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

  const FONTS = [
    { label: "Font", value: "" },
    { label: "Sans", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
    { label: "Serif", value: "Lora, Georgia, serif" },
    { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, monospace" },
  ];
  const select = "rounded border border-sky-edge bg-white px-2 py-1 text-sm text-ink outline-none focus:border-primary";

  const headingValue =
    [1, 2, 3, 4, 5, 6].find((l) => e.isActive("heading", { level: l }))?.toString() ?? "p";
  const onHeading = (v: string) =>
    v === "p"
      ? e.chain().focus().setParagraph().run()
      : e.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run();

  const currentFont = (e.getAttributes("textStyle").fontFamily as string) ?? "";
  const onFont = (v: string) =>
    v ? e.chain().focus().setFontFamily(v).run() : e.chain().focus().unsetFontFamily().run();
  const currentColor = (e.getAttributes("textStyle").color as string) || "#0f172a";

  const divider = <span className="mx-1 h-5 w-px bg-sky-edge" />;

  return (
    <div className="rounded-lg border border-sky-edge bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-sky-edge/60 p-1.5">
        <select aria-label="Text style" value={headingValue} onChange={(ev) => onHeading(ev.target.value)} className={select}>
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>
        <select aria-label="Font" value={currentFont} onChange={(ev) => onFont(ev.target.value)} className={select}>
          {FONTS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>
        {divider}
        <ToolbarButton title="Bold" onClick={() => e.chain().focus().toggleBold().run()} active={e.isActive("bold")}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => e.chain().focus().toggleItalic().run()} active={e.isActive("italic")}>
          <em>i</em>
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => e.chain().focus().toggleUnderline().run()} active={e.isActive("underline")}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => e.chain().focus().toggleStrike().run()} active={e.isActive("strike")}>
          <span className="line-through">S</span>
        </ToolbarButton>
        {divider}
        <label className="flex items-center" title="Text color">
          <input
            type="color"
            value={currentColor}
            onChange={(ev) => e.chain().focus().setColor(ev.target.value).run()}
            className="h-7 w-7 cursor-pointer rounded border border-sky-edge bg-white p-0.5"
          />
        </label>
        <ToolbarButton title="Clear color" onClick={() => e.chain().focus().unsetColor().run()}>✕</ToolbarButton>
        {divider}
        <ToolbarButton title="Align left" onClick={() => e.chain().focus().setTextAlign("left").run()} active={e.isActive({ textAlign: "left" })}>⯇</ToolbarButton>
        <ToolbarButton title="Align center" onClick={() => e.chain().focus().setTextAlign("center").run()} active={e.isActive({ textAlign: "center" })}>≡</ToolbarButton>
        <ToolbarButton title="Align right" onClick={() => e.chain().focus().setTextAlign("right").run()} active={e.isActive({ textAlign: "right" })}>⯈</ToolbarButton>
        {divider}
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
        {divider}
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
