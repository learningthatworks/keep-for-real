import { useMemo, useRef, useState } from "react";
import { Archive, Download, Pin, Search } from "lucide-react";
import { makeBookmarklet, type LiveFormat } from "@/lib/keep/bookmarklet";
import { notesToMarkdownZip } from "@/lib/keep/bundle";
import { notesToEnex } from "@/lib/keep/enex";
import { notesToCsv, notesToJson, notesToMarkdown, notesToText } from "@/lib/keep/formats";
import { notesFromNamedBytes, parsePaste } from "@/lib/keep/read";
import { sampleNotes } from "@/lib/keep/sample";
import { displayTitle, notePlain, type KeepNote } from "@/lib/keep/types";

const LIVE: { id: LiveFormat; label: string }[] = [
  { id: "enex", label: "Evernote" },
  { id: "md", label: "Markdown" },
  { id: "json", label: "JSON" },
  { id: "csv", label: "CSV" },
  { id: "txt", label: "Text" },
];

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadText(filename: string, mime: string, text: string) {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

export function KeepApp() {
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [origin, setOrigin] = useState<"sample" | "paste" | "files" | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<LiveFormat>("enex");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(true);
  const [showTrash, setShowTrash] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const bookmark = useMemo(() => makeBookmarklet(format), [format]);

  function adopt(next: KeepNote[], source: "sample" | "paste" | "files", nextWarnings: string[]) {
    setNotes(next);
    setOrigin(source);
    setWarnings(nextWarnings);
    setSelected(new Set(next.filter((note) => !note.trashed).map((note) => note.id)));
    setActiveId((next.find((note) => !note.trashed) ?? next[0])?.id ?? null);
    setQuery("");
    setTag(null);
  }

  async function ingestFiles(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const entries = await Promise.all(
        files.map(async (file) => ({
          name: file.webkitRelativePath || file.name,
          bytes: new Uint8Array(await file.arrayBuffer()),
        })),
      );
      const result = await notesFromNamedBytes(entries);
      if (result.notes.length === 0) {
        setWarnings(result.warnings);
        return;
      }
      adopt(result.notes, "files", result.warnings);
    } catch {
      setWarnings(["That file could not be read."]);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const pool = useMemo(() => {
    return notes
      .filter((note) => (showArchived ? true : !note.archived))
      .filter((note) => (showTrash ? true : !note.trashed))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.updated || b.created || "").localeCompare(a.updated || a.created || "");
      });
  }, [notes, showArchived, showTrash]);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of pool) {
      for (const label of note.tags) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [pool]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pool.filter((note) => {
      if (tag && !note.tags.some((label) => label.toLowerCase() === tag.toLowerCase())) return false;
      if (!needle) return true;
      const hay = [note.title, note.body, note.tags.join(" "), note.items.map((item) => item.text).join(" ")]
        .join("\n")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [pool, query, tag]);

  const chosen = visible.filter((note) => selected.has(note.id));
  const active = notes.find((note) => note.id === activeId) ?? chosen[0] ?? visible[0] ?? null;
  const hiddenTrash = notes.filter((note) => note.trashed).length;

  async function copyBookmark() {
    try {
      await navigator.clipboard.writeText(bookmark);
      setCopied(true);
      setWarnings((current) => current.filter((warning) => !warning.startsWith("Clipboard is blocked")));
    } catch {
      setCopied(false);
      setWarnings([
        window.matchMedia("(hover: hover)").matches
          ? "Clipboard is blocked. Drag Keep for Real onto the bookmarks bar instead."
          : "Clipboard is blocked. Press and hold the address below, then copy it.",
      ]);
    }
  }

  function exportChosen(kind: "enex" | "md" | "zip" | "json" | "csv" | "txt") {
    if (chosen.length === 0) return;
    if (kind === "enex") downloadText("keep-notes.enex", "application/xml;charset=utf-8", notesToEnex(chosen));
    if (kind === "md") downloadText("keep-notes.md", "text/markdown;charset=utf-8", notesToMarkdown(chosen));
    if (kind === "json") downloadText("keep-notes.json", "application/json;charset=utf-8", notesToJson(chosen));
    if (kind === "csv") downloadText("keep-notes.csv", "text/csv;charset=utf-8", notesToCsv(chosen));
    if (kind === "txt") downloadText("keep-notes.txt", "text/plain;charset=utf-8", notesToText(chosen));
    if (kind === "zip") {
      const zipped = notesToMarkdownZip(chosen);
      const copy = new Uint8Array(zipped.byteLength);
      copy.set(zipped);
      downloadBlob("keep-notes.zip", new Blob([copy.buffer as ArrayBuffer], { type: "application/zip" }));
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-3xl">
        <h1 className="text-4xl font-medium tracking-tight text-ink sm:text-5xl">Keep for Real</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Save your Google Keep notes as a file. Evernote, Markdown, JSON, CSV, or plain text. Nothing is uploaded.
        </p>
      </header>

      <section className="mt-8 rounded-3xl bg-card p-4 shadow-border sm:p-6">
        <h2 className="text-2xl font-medium">Pick one way</h2>
        <p className="mt-2 max-w-2xl text-muted">You only need to do one of these. The first two make a bookmark. A bookmark is a saved link in your browser.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          <li className="rounded-2xl bg-paper p-4">
            <p className="font-medium">Computer: drag the button</p>
            <p className="mt-1 text-sm text-muted">
              Best if you are on a laptop or desktop. Drag Keep for Real onto the bookmarks bar, open Google Keep, and click it. It opens every note so text cut off on the card is saved. Pictures are not.
            </p>
          </li>
          <li className="rounded-2xl bg-paper p-4">
            <p className="font-medium">Phone, or drag will not work: copy the address</p>
            <p className="mt-1 text-sm text-muted">
              Same bookmark. Copy the address, save any bookmark, then paste that address into it. Use this when you cannot drag.
            </p>
          </li>
          <li className="rounded-2xl bg-paper p-4">
            <p className="font-medium">A few notes: paste them</p>
            <p className="mt-1 text-sm text-muted">
              Open a note in Keep, copy the words, and paste them below. This is also what works in Chrome on an Android phone.
            </p>
          </li>
          <li className="rounded-2xl bg-paper p-4">
            <p className="font-medium">Photos or recordings: Takeout zip</p>
            <p className="mt-1 text-sm text-muted">
              Google emails you a zip file. It is the slow way, and the only way to keep pictures, drawings, and voice recordings.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-4 rounded-3xl bg-card p-4 shadow-border sm:p-6">
        <h2 className="text-2xl font-medium">On a computer, drag the button</h2>
        <p className="mt-2 max-w-2xl text-muted">
          The bookmarks bar is the row of links under the address field. If you do not see it, press Ctrl+Shift+B. On a Mac, press Command+Shift+B. In Safari, use the View menu and choose Show Favorites Bar.
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Bookmark format">
          {LIVE.map((item) => {
            const on = format === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setFormat(item.id);
                  setCopied(false);
                }}
                className={
                  on
                    ? "h-11 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg"
                    : "h-11 rounded-lg bg-chip px-3 text-sm font-medium text-ink"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm text-muted">
          Choose Evernote unless you already know you want Markdown, JSON, CSV, or text. You can download the other kinds later from this page.
        </p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl bg-paper p-4">
            <p className="text-sm font-medium text-muted">1</p>
            <p className="mt-2 font-medium">Drag this to your bookmarks bar</p>
            <a
              href={bookmark}
              draggable
              onClick={(event) => event.preventDefault()}
              className="mt-3 inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
            >
              Keep for Real
            </a>
            <p className="mt-2 text-sm text-muted">Press and hold the button, then drop it on the bar. Do not click it on this page.</p>
          </li>
          <li className="rounded-2xl bg-paper p-4">
            <p className="text-sm font-medium text-muted">2</p>
            <p className="mt-2 font-medium">Open Google Keep</p>
            <p className="mt-1 text-sm text-muted">
              Go to keep.google.com and sign in. Stay on the list of notes. Do not open a single note first.
            </p>
          </li>
          <li className="rounded-2xl bg-paper p-4">
            <p className="text-sm font-medium text-muted">3</p>
            <p className="mt-2 font-medium">Click the bookmark</p>
            <p className="mt-1 text-sm text-muted">
              Leave that tab alone until a file downloads. It opens each note to get the full text. For archived notes, open Archive in Keep and click the bookmark again. Photos stay in Keep.
            </p>
          </li>
        </ol>
        <button type="button" onClick={() => void copyBookmark()} className="mt-4 h-11 text-sm font-medium text-accent">
          {copied ? "Bookmark copied" : "Copy bookmark address"}
        </button>
        <div className="mt-4 max-w-2xl text-sm text-muted">
          <p className="font-medium text-ink">Cannot drag? Use the button above, then:</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Bookmark this page. On a computer, click the star in the address bar. On a phone, tap Share, then Add Bookmark.</li>
            <li>Open your bookmarks and edit the one you just saved. Name it Keep for Real if you want.</li>
            <li>Delete the address and paste. It must start with javascript: including the colon. If those letters were cut off, type them at the start.</li>
            <li>Open keep.google.com, stay on the notes list, and tap the bookmark. Leave the tab alone until the file downloads.</li>
          </ol>
          <p className="mt-2">Safari on iPhone can run this. Chrome on Android cannot. Paste the notes, or use a Takeout zip, instead.</p>
        </div>
        {warnings.some((warning) => warning.startsWith("Clipboard is blocked")) ? (
          <textarea
            readOnly
            value={bookmark}
            rows={4}
            onFocus={(event) => event.currentTarget.select()}
            aria-label="Bookmark address"
            className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-3 text-sm text-ink"
          />
        ) : null}
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-card p-4 shadow-border sm:p-6">
          <h2 className="text-2xl font-medium">Paste a few notes</h2>
          <p className="mt-2 text-sm text-muted">
            Use this for a handful of notes, or when the bookmark cannot run. In Keep, open a note, select the words, and copy them. Paste here. The first line becomes the title. Between notes, put a line that is only ---. For a checklist, write - [ ] for not done and - [x] for done.
          </p>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            rows={6}
            placeholder={"River survey\nNorth bank was muddy.\n\n---\n\nSources\n- [ ] Smith 2019"}
            className="mt-4 w-full rounded-lg border border-line bg-paper px-3 py-3 text-base text-ink placeholder:text-faint"
          />
          <button
            type="button"
            onClick={() => {
              const next = parsePaste(paste);
              if (next.length === 0) {
                setWarnings(["Paste at least one note."]);
                return;
              }
              adopt(next, "paste", []);
            }}
            className="mt-3 h-11 rounded-lg bg-ink px-4 text-sm font-medium text-paper"
          >
            Read paste
          </button>
        </section>

        <section className="flex flex-col rounded-3xl bg-card p-4 shadow-border sm:p-6">
          <h2 className="text-2xl font-medium">Try an example first</h2>
          <p className="mt-2 text-sm text-muted">
            These are not your notes. Load them if you want to see the download buttons before you touch your account.
          </p>
          <button
            type="button"
            onClick={() => adopt(sampleNotes(), "sample", [])}
            className="mt-4 h-11 self-start rounded-lg bg-chip px-4 text-sm font-medium text-ink"
          >
            Load sample notes
          </button>
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-medium text-ink">Need the photos? Use a Takeout zip</summary>
            <p className="mt-2 text-sm text-muted">
              The bookmark saves words only. For pictures, drawings, and recordings: open takeout.google.com, sign in, turn everything off except Google Keep, and create the export. Google emails you when the zip is ready. Drop that zip here, or the HTML and JSON files inside it.
            </p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                void ingestFiles([...event.dataTransfer.files]);
              }}
              className={
                dragOver
                  ? "mt-3 rounded-2xl border border-accent bg-paper px-4 py-6 text-sm"
                  : "mt-3 rounded-2xl border border-line bg-paper px-4 py-6 text-sm"
              }
            >
              <p className="text-muted">{busy ? "Reading notes…" : "Drop a zip, HTML, or JSON file."}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 h-11 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg"
              >
                Choose files
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".zip,.json,.html,.htm,.csv,.txt,application/zip,application/json,text/html"
                className="sr-only"
                onChange={(event) => void ingestFiles([...(event.target.files ?? [])])}
              />
            </div>
          </details>
        </section>
      </div>

      {warnings.length > 0 ? (
        <div role="status" className="mt-4 rounded-2xl bg-card px-4 py-3 text-sm text-ink shadow-border">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {notes.length > 0 ? (
        <section className="mt-8" aria-label="Notes ready to export">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-medium">
                <span className="tabular-nums">{visible.length}</span> notes
              </h2>
              <p className="text-sm text-muted">
                {origin === "sample"
                  ? "Sample notes, not your account."
                  : origin === "paste"
                    ? "From what you pasted."
                    : "From the files you opened."}
                {hiddenTrash > 0 && !showTrash ? ` ${hiddenTrash} in trash are hidden.` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotes([]);
                setOrigin(null);
                setWarnings([]);
              }}
              className="h-11 text-sm font-medium text-muted"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search notes</span>
              <Search className="pointer-events-none absolute top-3 left-3 size-5 text-faint" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, text, labels"
                className="h-11 w-full rounded-lg border border-line bg-card pr-3 pl-10"
              />
            </label>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
                className="size-4"
              />
              Archived
            </label>
            <label className="flex h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showTrash}
                onChange={(event) => setShowTrash(event.target.checked)}
                className="size-4"
              />
              Trash
            </label>
          </div>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTag(null)}
                className={
                  tag === null
                    ? "h-11 rounded-lg bg-accent px-3 text-sm text-accent-fg"
                    : "h-11 rounded-lg bg-chip px-3 text-sm"
                }
              >
                All labels
              </button>
              {tags.map(([label, count]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTag((current) => (current === label ? null : label))}
                  className={
                    tag === label
                      ? "h-11 rounded-lg bg-accent px-3 text-sm text-accent-fg"
                      : "h-11 rounded-lg bg-chip px-3 text-sm"
                  }
                >
                  {label}{" "}
                  <span className={tag === label ? "tabular-nums" : "tabular-nums text-faint"}>{count}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-card shadow-border">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <button
                  type="button"
                  className="text-sm font-medium"
                  onClick={() => setSelected(new Set(visible.map((note) => note.id)))}
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-muted"
                  onClick={() => setSelected(new Set())}
                >
                  Select none
                </button>
              </div>
              <ul className="max-h-[32rem] overflow-auto">
                {visible.length === 0 ? (
                  <li className="px-4 py-6 text-sm text-muted">No notes match.</li>
                ) : (
                  visible.map((note) => {
                    const on = note.id === active?.id;
                    return (
                      <li key={note.id} className={on ? "bg-paper" : "bg-card"}>
                        <div className="flex items-start gap-3 border-b border-line px-4 py-3">
                          <input
                            type="checkbox"
                            className="mt-1 size-4"
                            checked={selected.has(note.id)}
                            aria-label={`Include ${displayTitle(note)}`}
                            onChange={(event) => {
                              setSelected((current) => {
                                const next = new Set(current);
                                if (event.target.checked) next.add(note.id);
                                else next.delete(note.id);
                                return next;
                              });
                            }}
                          />
                          <button type="button" onClick={() => setActiveId(note.id)} className="min-w-0 flex-1 text-left">
                            <span className="flex items-center gap-2 font-medium">
                              {note.pinned ? <Pin className="size-4 shrink-0" aria-label="Pinned" /> : null}
                              {note.archived ? <Archive className="size-4 shrink-0" aria-label="Archived" /> : null}
                              <span className="truncate">{displayTitle(note)}</span>
                            </span>
                            <span className="mt-1 line-clamp-2 block text-sm text-muted">{notePlain(note) || "Empty note"}</span>
                          </button>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <article className="rounded-3xl bg-card p-4 shadow-border sm:p-6">
              {active ? (
                <>
                  <h3 className="text-2xl font-medium">{displayTitle(active)}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {[
                      active.tags.join(", "),
                      active.pinned ? "Pinned" : "",
                      active.archived ? "Archived" : "",
                      active.created?.slice(0, 10) ?? "",
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No labels"}
                  </p>
                  {active.items.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {active.items.map((item) => (
                        <li key={`${item.checked}-${item.text}`} className="text-base">
                          {item.checked ? "[x]" : "[ ]"} {item.text}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {active.body ? <p className="mt-4 whitespace-pre-wrap">{active.body}</p> : null}
                  {active.attachments.length > 0 ? (
                    <ul className="mt-4 text-sm text-muted">
                      {active.attachments.map((attachment) => (
                        <li key={attachment.name}>{attachment.name}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                <p className="text-muted">Select a note to preview it.</p>
              )}
            </article>
          </div>

          <div className="sticky bottom-0 mt-4 flex flex-col gap-2 bg-paper py-3">
            <button
              type="button"
              disabled={chosen.length === 0}
              onClick={() => exportChosen("enex")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-medium text-accent-fg disabled:opacity-40"
            >
              <Download className="size-5" aria-hidden="true" />
              Download Evernote (.enex)
              <span className="tabular-nums">({chosen.length})</span>
            </button>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(
                [
                  ["md", "Markdown"],
                  ["zip", "Folder"],
                  ["json", "JSON"],
                  ["csv", "CSV"],
                  ["txt", "Text"],
                ] as const
              ).map(([kind, label]) => (
                <button
                  key={kind}
                  type="button"
                  disabled={chosen.length === 0}
                  onClick={() => exportChosen(kind)}
                  className="h-11 rounded-lg bg-chip text-sm font-medium disabled:opacity-40"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted">
              Evernote import: File, then Import, then Evernote export files. Pinned and archived notes become tags.
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
