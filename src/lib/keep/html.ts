import { parseKeepDate } from "./dates.ts";
import { baseName, blankNote, guessMime, type Attachment, type KeepNote } from "./types.ts";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
};

type Found = { classes: string[]; inner: string };

function decode(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => safeCp(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => safeCp(Number(num)))
    .replace(/&([a-z]+);/gi, (all, name: string) => NAMED[name.toLowerCase()] ?? all);
}

function safeCp(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return "";
  try {
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

function classList(attrs: string): string[] {
  const match = /\bclass\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs);
  if (!match) return [];
  return (match[2] || match[3] || "").split(/\s+/).filter(Boolean);
}

function readInner(html: string, tag: string, start: number): string {
  const open = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const close = new RegExp(`</${tag}\\s*>`, "gi");
  let depth = 1;
  let cursor = start;
  while (depth > 0 && cursor < html.length) {
    open.lastIndex = cursor;
    close.lastIndex = cursor;
    const nextOpen = open.exec(html);
    const nextClose = close.exec(html);
    if (!nextClose) return html.slice(start);
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth += 1;
      cursor = nextOpen.index + nextOpen[0].length;
    } else {
      depth -= 1;
      if (depth === 0) return html.slice(start, nextClose.index);
      cursor = nextClose.index + nextClose[0].length;
    }
  }
  return html.slice(start);
}

function elementsWithClass(html: string, className: string): Found[] {
  const out: Found[] = [];
  const re = /<([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const tag = match[1].toLowerCase();
    const attrs = match[2] || "";
    const classes = classList(attrs);
    if (!classes.includes(className)) continue;
    if (VOID.has(tag) || /\/\s*$/.test(attrs)) {
      out.push({ classes, inner: "" });
      continue;
    }
    const start = match.index + match[0].length;
    const inner = readInner(html, tag, start);
    out.push({ classes, inner });
    re.lastIndex = start + inner.length;
  }
  return out;
}

export function textOnly(html: string): string {
  return decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""))
    .replace(/\u200e/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripNoise(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function imageSrcs(html: string): string[] {
  const out: string[] = [];
  const re = /<img\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const src = /\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i.exec(match[0]);
    const value = src?.[2] || src?.[3] || "";
    if (value && !value.startsWith("data:image/svg")) out.push(value);
  }
  return out;
}

function dataUri(uri: string): Attachment | null {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(uri);
  if (!match) return null;
  const mime = match[1] || "application/octet-stream";
  const payload = match[3] || "";
  if (uri.length < 240) return null;
  if (match[2]) {
    const clean = payload.replace(/\s/g, "");
    let binary = "";
    try {
      binary = atob(clean);
    } catch {
      return null;
    }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "bin";
    return { name: `image.${ext}`, mime, bytes };
  }
  return null;
}

function attachmentsFromHtml(html: string): Attachment[] {
  const attachments: Attachment[] = [];
  let imageIndex = 1;
  for (const src of imageSrcs(html)) {
    if (src.startsWith("data:")) {
      const parsed = dataUri(src);
      if (!parsed) continue;
      parsed.name = `image-${imageIndex}.${parsed.name.split(".").pop()}`;
      imageIndex += 1;
      attachments.push(parsed);
    } else {
      const name = baseName(src.split("?")[0] || src);
      attachments.push({ name, mime: guessMime(name), path: src });
    }
  }
  return attachments;
}

function bodyFromContent(contentHtml: string): { body: string; items: KeepNote["items"] } {
  const listItems = elementsWithClass(contentHtml, "listitem");
  if (listItems.length) {
    const items = listItems
      .map((item) => {
        const textNode = elementsWithClass(item.inner, "text")[0];
        const raw = textOnly(textNode?.inner || item.inner);
        const text = raw.replace(/^[\s\u2610\u2611\u2612\u2713\u2714•●]+/u, "").trim();
        const checked =
          item.classes.includes("checked") || /[\u2611\u2612\u2713\u2714]/u.test(item.inner);
        return { text, checked };
      })
      .filter((item) => item.text);
    return { body: "", items };
  }

  const text = textOnly(contentHtml)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim().replace(/\u200e/g, "");
      if (/^[•●]\s*/u.test(trimmed)) return `* ${trimmed.replace(/^[•●]\s*/u, "")}`;
      if (/^\u2610\s*/u.test(trimmed)) return `[ ] ${trimmed.replace(/^\u2610\s*/u, "")}`;
      if (/^[\u2611\u2612]\s*/u.test(trimmed)) return `[x] ${trimmed.replace(/^[\u2611\u2612]\s*/u, "")}`;
      return trimmed;
    })
    .join("\n")
    .trim();
  return { body: text, items: [] };
}

function tagsFrom(inner: string): string[] {
  const named = elementsWithClass(inner, "label-name")
    .map((el) => textOnly(el.inner))
    .filter(Boolean);
  if (named.length) return unique(named);
  const classic = elementsWithClass(inner, "label")
    .map((el) => textOnly(el.inner))
    .filter(Boolean);
  return unique(classic);
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const clean = value.replace(/\s+/g, " ").trim();
    if (!clean || seen.has(clean.toLowerCase())) continue;
    seen.add(clean.toLowerCase());
    out.push(clean);
  }
  return out;
}

function parseNoteChunk(classes: string[], inner: string): KeepNote | null {
  const title = textOnly(elementsWithClass(inner, "title")[0]?.inner ?? "");
  const content = elementsWithClass(inner, "content")[0]?.inner ?? "";
  const heading = textOnly(elementsWithClass(inner, "heading")[0]?.inner ?? elementsWithClass(inner, "date")[0]?.inner ?? "");
  const { body, items } = content ? bodyFromContent(content) : { body: "", items: [] };
  const color = classes.find((name) => name !== "note" && /^[A-Z0-9]+$/.test(name)) || "DEFAULT";
  const archived = classes.includes("archived") || elementsWithClass(inner, "archived").length > 0;
  const pinned = classes.includes("pinned") || elementsWithClass(inner, "pinned").length > 0;
  const trashed = classes.includes("trashed") || elementsWithClass(inner, "trashed").length > 0;
  const note = blankNote({
    title,
    body,
    items,
    tags: tagsFrom(inner),
    color,
    pinned,
    archived,
    trashed,
    created: parseKeepDate(heading),
    updated: parseKeepDate(heading),
    attachments: attachmentsFromHtml(inner),
  });
  if (!note.title && !note.body && note.items.length === 0 && note.attachments.length === 0) return null;
  return note;
}

export function parseKeepHtml(html: string): KeepNote[] {
  const clean = stripNoise(html);
  const notes = elementsWithClass(clean, "note");
  if (notes.length === 0) {
    const one = parseNoteChunk(["note"], clean);
    return one ? [one] : [];
  }
  return notes.flatMap((note) => {
    const parsed = parseNoteChunk(note.classes, note.inner);
    return parsed ? [parsed] : [];
  });
}
