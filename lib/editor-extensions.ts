import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";

// Shared by the client editor (components/editor/Editor.tsx) and the server
// render path (lib/render-content.ts) so authored and published HTML match.
// StarterKit v3 already bundles Link, so we configure it here rather than
// registering a second Link extension (which warns about duplicates).
export const editorExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  Image.configure({
    HTMLAttributes: { class: "rounded-lg my-4 h-auto max-w-full" },
  }),
];
