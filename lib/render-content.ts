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

  return sanitizeHtml(raw, {
    allowedTags: [
      "p", "h1", "h2", "h3", "h4",
      "blockquote", "ul", "ol", "li",
      "strong", "em", "s", "code", "pre",
      "a", "img", "hr", "br", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "class"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
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
