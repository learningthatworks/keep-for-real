import { parseKeepDate } from "./dates.ts";
import {
  baseName,
  blankNote,
  guessMime,
  type Attachment,
  type CheckItem,
  type KeepNote,
} from "./types.ts";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function timeOf(value: unknown): string | null {
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    return parseKeepDate(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value > 1e14 ? value / 1000 : value > 1e12 ? value : value > 1e9 ? value * 1000 : Number.NaN;
    if (!Number.isFinite(ms)) return null;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function itemOf(value: unknown): CheckItem | null {
  const record = asRecord(value);
  if (!record) return null;
  let text = "";
  if (typeof record.text === "string") text = record.text;
  else {
    const nested = asRecord(record.text);
    if (nested && typeof nested.text === "string") text = nested.text;
  }
  text = text.replace(/\u200e/g, "").trim();
  if (!text) return null;
  return { text, checked: Boolean(record.isChecked || record.checked) };
}

function tagsOf(record: Record<string, unknown>): string[] {
  const tags: string[] = [];
  const push = (value: string) => {
    const clean = value.replace(/\s+/g, " ").trim();
    if (clean && !tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) tags.push(clean);
  };
  const lists = [record.labels, record.tags];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      if (typeof entry === "string") push(entry);
      else {
        const obj = asRecord(entry);
        if (obj && typeof obj.name === "string") push(obj.name);
      }
    }
  }
  return tags;
}

function attachmentsOf(record: Record<string, unknown>): Attachment[] {
  if (!Array.isArray(record.attachments)) return [];
  const attachments: Attachment[] = [];
  for (const entry of record.attachments) {
    if (typeof entry === "string" && entry.trim()) {
      const name = baseName(entry);
      attachments.push({ name, mime: guessMime(name), path: entry });
      continue;
    }
    const obj = asRecord(entry);
    if (!obj) continue;
    const path = asString(obj.filePath || obj.path || obj.name);
    if (!path) continue;
    const name = baseName(path);
    const mime = asString(obj.mimetype || obj.mimeType || obj.mime) || guessMime(name);
    attachments.push({ name, mime, path });
  }
  return attachments;
}

function looksLikeNote(value: unknown): boolean {
  const record = asRecord(value);
  if (!record) return false;
  if (typeof record.title === "string") return true;
  if (typeof record.textContent === "string" || typeof record.text === "string") return true;
  if (Array.isArray(record.listContent) || Array.isArray(record.items)) return true;
  if (asRecord(record.body)) return true;
  return false;
}

function noteFromRecord(record: Record<string, unknown>): KeepNote | null {
  let body = asString(record.textContent || record.bodyText);
  if (!body && typeof record.text === "string") body = record.text;
  if (!body && typeof record.body === "string") body = record.body;

  let items = Array.isArray(record.listContent)
    ? record.listContent.map(itemOf).filter((item): item is CheckItem => item !== null)
    : [];
  if (items.length === 0 && Array.isArray(record.items)) {
    items = record.items.map(itemOf).filter((item): item is CheckItem => item !== null);
  }

  const apiBody = asRecord(record.body);
  if (apiBody) {
    const text = asRecord(apiBody.text);
    if (text && typeof text.text === "string" && !body) body = text.text;
    const list = asRecord(apiBody.list);
    if (list && Array.isArray(list.listItems) && items.length === 0) {
      items = list.listItems.map(itemOf).filter((item): item is CheckItem => item !== null);
    }
  }

  body = body.replace(/\u200e/g, "").trim();
  const title = asString(record.title).replace(/\u200e/g, "").trim();
  const created =
    timeOf(record.createdTimestampUsec) ||
    timeOf(record.created) ||
    timeOf(record.createTime) ||
    timeOf(record.date);
  const updated =
    timeOf(record.userEditedTimestampUsec) ||
    timeOf(record.updated) ||
    timeOf(record.updateTime) ||
    created;

  const note = blankNote({
    title,
    body,
    items,
    tags: tagsOf(record),
    color: asString(record.color) || "DEFAULT",
    pinned: Boolean(record.isPinned || record.pinned),
    archived: Boolean(record.isArchived || record.archived),
    trashed: Boolean(record.isTrashed || record.trashed),
    created,
    updated,
    attachments: attachmentsOf(record),
  });

  if (!note.title && !note.body && note.items.length === 0 && note.attachments.length === 0) return null;
  return note;
}

export function parseKeepJson(value: unknown): KeepNote[] {
  if (Array.isArray(value)) return value.flatMap((entry) => parseKeepJson(entry));
  const record = asRecord(value);
  if (!record) return [];
  if (Array.isArray(record.notes)) return record.notes.flatMap((entry) => parseKeepJson(entry));
  if (!looksLikeNote(record)) return [];
  const note = noteFromRecord(record);
  return note ? [note] : [];
}
