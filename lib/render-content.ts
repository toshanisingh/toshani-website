import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/core";
import sanitizeHtml from "sanitize-html";
import { editorExtensions } from "./editor-extensions.ts";

// A Tiptap document node. `body` is stored as JSON in the DB and may be the
// `{}` default for never-edited pages, so we validate before rendering.
function isDoc(body: unknown): body is { type: "doc"; content?: unknown[] } {
  return (
    !!body &&
    typeof body === "object" &&
    (body as { type?: unknown }).type === "doc"
  );
}

// Convert stored Tiptap JSON to sanitized HTML for public display.
// NOTE: sanitize-html drops <img> and class attributes by default — they are
// allowed explicitly below, or every image would silently vanish on publish.
export function renderContent(body: unknown): string {
  if (!isDoc(body)) return "";

  let raw: string;
  try {
    raw = generateHTML(body as JSONContent, editorExtensions);
  } catch {
    return "";
  }

  const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];
  return sanitizeHtml(raw, {
    allowedTags: [
      "p", ...headings,
      "blockquote", "ul", "ol", "li",
      "strong", "em", "s", "u", "code", "pre",
      "a", "img", "hr", "br", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "class"],
      code: ["class"],
      pre: ["class"],
      span: ["class", "style"],
      p: ["style"],
      ...Object.fromEntries(headings.map((h) => [h, ["style"]])),
    },
    // Only these CSS properties survive, with value patterns that exclude
    // url()/expression()/semicolons — so inline style can't carry an exploit.
    allowedStyles: {
      "*": {
        "font-family": [/^[\w\s"',-]+$/],
        color: [/^#(0x)?[0-9a-fA-F]{3,8}$/, /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/, /^[a-zA-Z]+$/],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    // Block javascript:/data: URIs in links; images only over http(s).
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer nofollow", target: "_blank" },
        true,
      ),
    },
  });
}
