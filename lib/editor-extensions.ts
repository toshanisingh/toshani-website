import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";

// Image with a display-size preset (small/medium/large/full) stored as a
// data-size attribute. CSS in globals.css turns it into a width; sanitize-html
// is configured to keep data-size.
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: "full",
        parseHTML: (el) => el.getAttribute("data-size") || "full",
        renderHTML: (attrs) => ({ "data-size": attrs.size as string }),
      },
    };
  },
});

// Shared by the client editor (components/editor/Editor.tsx) and the server
// render path (lib/render-content.ts) so authored and published HTML match.
// StarterKit v3 already bundles Link + Underline, so we configure Link here and
// use Underline as-is rather than re-registering them.
export const editorExtensions = [
  StarterKit.configure({
    // Full range of heading levels (h1 is also the page title — content h1 is
    // allowed but use sparingly). Kept in sync with the sanitize allowlist.
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
    },
  }),
  SizedImage.configure({
    // Width comes from the data-size CSS rules; keep only cosmetic classes here.
    HTMLAttributes: { class: "rounded-lg my-4 h-auto" },
  }),
  // TextStyle must come before FontFamily/Color (they attach to it).
  TextStyle,
  FontFamily,
  Color,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];
