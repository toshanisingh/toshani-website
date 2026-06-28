// Run: node lib/render-content.test.mjs
// The silent-failure surface: sanitize-html stripping images/links, empty body
// crashing the renderer, and unsafe URL schemes surviving.
import assert from "node:assert/strict";
const { renderContent } = await import("./render-content.ts");

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log("  ✓", name);
}

const docWith = (content) => ({ type: "doc", content });

check("images survive sanitization (the headline feature)", () => {
  const html = renderContent(
    docWith([{ type: "image", attrs: { src: "https://cdn.example.com/a.png", alt: "pic" } }]),
  );
  assert.match(html, /<img[^>]+src="https:\/\/cdn\.example\.com\/a\.png"/);
  assert.match(html, /alt="pic"/);
});

check("formatting, links and code survive", () => {
  const html = renderContent(
    docWith([
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Title" }] },
      {
        type: "paragraph",
        content: [
          { type: "text", marks: [{ type: "bold" }], text: "bold" },
          { type: "text", text: " " },
          { type: "text", marks: [{ type: "link", attrs: { href: "https://ok.com" } }], text: "link" },
        ],
      },
      { type: "codeBlock", content: [{ type: "text", text: "x=1" }] },
    ]),
  );
  assert.match(html, /<h2>Title<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<a [^>]*href="https:\/\/ok\.com"/);
  assert.match(html, /rel="noopener noreferrer nofollow"/);
  assert.match(html, /<pre><code>x=1<\/code><\/pre>/);
});

check("empty / default body does not crash and renders nothing", () => {
  assert.equal(renderContent({}), "");
  assert.equal(renderContent(null), "");
  assert.equal(renderContent("garbage"), "");
  assert.equal(renderContent(docWith([])), "");
});

check("javascript: link scheme is stripped", () => {
  const html = renderContent(
    docWith([
      {
        type: "paragraph",
        content: [
          { type: "text", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }], text: "x" },
        ],
      },
    ]),
  );
  assert.doesNotMatch(html, /javascript:/);
});

check("data: image scheme is stripped", () => {
  const html = renderContent(
    docWith([{ type: "image", attrs: { src: "data:text/html;base64,PHNjcmlwdD4=", alt: "x" } }]),
  );
  assert.doesNotMatch(html, /data:text\/html/);
});

console.log(`\n${passed} checks passed.`);
