import { displayTitle, notePlain, type KeepNote } from "./types.ts";

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function stampDay(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function noteToMarkdown(note: KeepNote, yaml: boolean): string {
  const title = displayTitle(note);
  const lines: string[] = [];
  if (yaml) {
    lines.push("---");
    lines.push(`title: ${yamlString(title)}`);
    const created = stampDay(note.created);
    const updated = stampDay(note.updated);
    if (created) lines.push(`created: ${created}`);
    if (updated) lines.push(`updated: ${updated}`);
    if (note.tags.length) {
      lines.push("tags:");
      for (const tag of note.tags) lines.push(`  - ${yamlString(tag)}`);
    }
    if (note.pinned) lines.push("pinned: true");
    if (note.archived) lines.push("archived: true");
    if (note.trashed) lines.push("trashed: true");
    if (note.color && note.color !== "DEFAULT") lines.push(`color: ${yamlString(note.color)}`);
    if (note.attachments.length) {
      lines.push("attachments:");
      for (const attachment of note.attachments) lines.push(`  - ${yamlString(attachment.name)}`);
    }
    lines.push("---", "");
  } else {
    lines.push(`# ${title}`, "");
  }

  for (const item of note.items) {
    lines.push(`- [${item.checked ? "x" : " "}] ${item.text}`);
  }
  if (note.items.length && note.body.trim()) lines.push("");
  if (note.body.trim()) lines.push(note.body.trim());
  for (const attachment of note.attachments) {
    lines.push("");
    if (attachment.mime.startsWith("image/") && attachment.bytes) {
      lines.push(`![${attachment.name}](attachments/${attachment.name})`);
    } else {
      lines.push(`Attachment: ${attachment.name}`);
    }
  }
  if (!yaml && (note.tags.length || note.pinned || note.archived)) {
    const meta: string[] = [];
    if (note.tags.length) meta.push(`Labels: ${note.tags.join(", ")}`);
    if (note.pinned) meta.push("Pinned");
    if (note.archived) meta.push("Archived");
    const created = note.created?.slice(0, 10);
    if (created) meta.push(created);
    lines.push("", meta.join(" · "));
  }
  return `${lines.join("\n").trim()}\n`;
}

export function notesToMarkdown(notes: KeepNote[]): string {
  return notes.map((note) => noteToMarkdown(note, false)).join("\n---\n\n");
}

export function notesToText(notes: KeepNote[]): string {
  return notes
    .map((note) => {
      const title = displayTitle(note);
      const meta: string[] = [];
      if (note.tags.length) meta.push(`Labels: ${note.tags.join(", ")}`);
      if (note.pinned) meta.push("Pinned");
      if (note.archived) meta.push("Archived");
      if (note.created) meta.push(note.created.slice(0, 10));
      return `${title}\n${"=".repeat(Math.min(title.length, 40))}\n\n${notePlain(note)}${meta.length ? `\n\n${meta.join(" · ")}` : ""}\n`;
    })
    .join("\n");
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function notesToCsv(notes: KeepNote[]): string {
  const header = ["title", "content", "labels", "pinned", "archived", "trashed", "color", "created", "updated"];
  const rows = notes.map((note) =>
    [
      displayTitle(note),
      notePlain(note),
      note.tags.join("; "),
      note.pinned ? "true" : "false",
      note.archived ? "true" : "false",
      note.trashed ? "true" : "false",
      note.color,
      note.created ?? "",
      note.updated ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return `\uFEFF${header.join(",")}\n${rows.join("\n")}\n`;
}

export function notesToJson(notes: KeepNote[]): string {
  return `${JSON.stringify(
    {
      exportedBy: "Keep for Real",
      notes: notes.map((note) => ({
        title: note.title,
        body: note.body,
        items: note.items,
        tags: note.tags,
        color: note.color,
        pinned: note.pinned,
        archived: note.archived,
        trashed: note.trashed,
        created: note.created,
        updated: note.updated,
        attachments: note.attachments.map((attachment) => attachment.name),
      })),
    },
    null,
    2,
  )}\n`;
}

export function fileSlug(title: string, index: number): string {
  const cleaned = title
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const base = cleaned || "note";
  return `${String(index + 1).padStart(3, "0")}-${base}.md`;
}
