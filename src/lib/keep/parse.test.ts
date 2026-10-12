import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zipSync, strToU8 } from "fflate";
import { makeBookmarklet, liveProgram } from "./bookmarklet.ts";
import { notesToEnex } from "./enex.ts";
import { notesToCsv, notesToMarkdown } from "./formats.ts";
import { parseKeepHtml } from "./html.ts";
import { parseKeepJson } from "./json.ts";
import { notesFromNamedBytes, parsePaste } from "./read.ts";
import { notePlain } from "./types.ts";

const BASIC = `
<html><body><div class="note DEFAULT"><div class="heading">
21 Jun 2016, 22:39:47</div>
<div class="title">A & B</div>
<div class="content">Hearts of darkness<br>Water ship down<br>The Dubliners<br><br></div>
<div class="labels"><span class="label">Reading List</span><span class="label">Another Tag</span></div>
</div></body></html>`;

const CHIPS = `
<html><body><div class="note DEFAULT"><div class="heading">
21 Jun 2016, 22:39:47</div>
<div class="title">Ll</div>
<div class="content">Hearts of darkness<br>Water ship down<br>The Dubliners<br><br></div>
<div class="chips">
<span class="chip label"><span class="label-name">Chip Label 1</span></span>
<span class="chip label"><span class="label-name">Chip Label 2</span>
</div>
</body></html>`;

const LISTS = `<html><body><div class="note DEFAULT"><div class="heading"><div class="meta-icons">
<span class="archived" title="Note archived"></span>
</div>
19 May 2018, 15:48:01</div>
<div class="title">Problems</div>
<div class="content">• How. It&#39;s like.<br>• \u200eSo so tired.<br>• \u200eWake up in water</div>
</div></body></html>`;

const TODO = `<html><body><div class="note DEFAULT"><div class="heading"><span class="archived"></span>
19 May 2018, 15:58:26</div>
<div class="content"><ul class="list">
<li class="listitem"><span class="bullet">&#9744;</span><span class="text">Localization</span></li>
<li class="listitem checked"><span class="bullet">&#9745;</span><span class="text">Tablets screeshots</span></li>
</ul></div></div></body></html>`;

describe("keep html", () => {
  it("reads labels, title entities, and the printed time as UTC", () => {
    const note = parseKeepHtml(BASIC)[0];
    assert.equal(note.title, "A & B");
    assert.equal(note.body, "Hearts of darkness\nWater ship down\nThe Dubliners");
    assert.deepEqual(note.tags, ["Reading List", "Another Tag"]);
    assert.equal(note.created, "2016-06-21T22:39:47.000Z");
    assert.equal(note.archived, false);
  });

  it("reads the chip label format", () => {
    const note = parseKeepHtml(CHIPS)[0];
    assert.deepEqual(note.tags, ["Chip Label 1", "Chip Label 2"]);
  });

  it("turns bullet lines into markdown and marks archived notes", () => {
    const note = parseKeepHtml(LISTS)[0];
    assert.equal(note.title, "Problems");
    assert.equal(note.archived, true);
    assert.equal(note.body, "* How. It's like.\n* So so tired.\n* Wake up in water");
  });

  it("reads checked list items", () => {
    const note = parseKeepHtml(TODO)[0];
    assert.deepEqual(note.items, [
      { text: "Localization", checked: false },
      { text: "Tablets screeshots", checked: true },
    ]);
  });
});

describe("keep json and enex", () => {
  it("reads Takeout JSON and round-trips through the export JSON", () => {
    const parsed = parseKeepJson({
      title: "Field",
      textContent: "Muddy after rain",
      isPinned: true,
      labels: [{ name: "research" }],
      createdTimestampUsec: 1466541587000000,
      listContent: [{ text: "Gauge", isChecked: false }],
    });
    assert.equal(parsed[0].title, "Field");
    assert.equal(parsed[0].pinned, true);
    assert.equal(parsed[0].tags[0], "research");
    assert.equal(parsed[0].created, "2016-06-21T20:39:47.000Z");
    const again = parseKeepJson(JSON.parse(notesToJsonSafe(parsed)));
    assert.equal(again[0].title, "Field");
    assert.equal(again[0].items[0].text, "Gauge");
  });

  it("builds an Evernote file with todos, tags, and escaped titles", () => {
    const notes = parseKeepHtml(BASIC).concat(parseKeepHtml(TODO));
    const enex = notesToEnex(notes);
    assert.match(enex, /<!DOCTYPE en-export SYSTEM "http:\/\/xml\.evernote\.com\/pub\/evernote-export3\.dtd">/);
    assert.match(enex, /<title>A \u0026amp; B<\/title>/);
    assert.match(enex, /<tag>Reading List<\/tag>/);
    assert.match(enex, /<en-todo checked="true"\/>Tablets screeshots/);
    assert.match(enex, /<created>20160621T223947Z<\/created>/);
    assert.match(enex, /<source-application>Keep for Real<\/source-application>/);
  });

  it("keeps a CDATA terminator from breaking the note", () => {
    const note = parseKeepJson({ title: "Odd", textContent: "before ]]> after" })[0];
    const enex = notesToEnex([note]);
    assert.match(enex, /before \]\]\u0026gt; after/);
    assert.match(enex, /<\/en-export>/);
  });
});

describe("ingest", () => {
  it("merges a Takeout zip of html plus json", async () => {
    const html = `<html><body><div class="note BLUE"><div class="title">River</div><div class="content">See photo</div><div class="labels"><span class="label">field</span></div></div></body></html>`;
    const json = JSON.stringify({
      title: "River",
      textContent: "See photo",
      isArchived: true,
      labels: [{ name: "research" }],
      attachments: [{ filePath: "bank.jpg", mimetype: "image/jpeg" }],
      createdTimestampUsec: 1466541587000000,
    });
    const zipped = zipSync({
      "Takeout/Keep/River.html": strToU8(html),
      "Takeout/Keep/River.json": strToU8(json),
      "Takeout/Keep/bank.jpg": new Uint8Array([1, 2, 3, 4]),
    });
    const result = await notesFromNamedBytes([{ name: "takeout.zip", bytes: zipped }]);
    assert.equal(result.notes.length, 1);
    assert.equal(result.notes[0].archived, true);
    assert.ok(result.notes[0].tags.includes("field"));
    assert.ok(result.notes[0].tags.includes("research"));
    assert.equal(result.notes[0].attachments[0].bytes?.length, 4);
    assert.match(notesToMarkdown(result.notes), /# River/);
    assert.match(notesToCsv(result.notes), /field/);
  });

  it("splits pasted notes on a divider", () => {
    const notes = parsePaste("First title\nHello\n\n---\n\nSecond\n- [x] Done\n- [ ] Later");
    assert.equal(notes.length, 2);
    assert.equal(notes[0].title, "First title");
    assert.equal(notes[1].items[0].checked, true);
    assert.equal(notePlain(notes[1]), "[x] Done\n[ ] Later");
  });
});

describe("bookmarklet", () => {
  it("is valid JavaScript and targets Keep", () => {
    const program = liveProgram("enex");
    assert.doesNotThrow(() => new Function(program));
    assert.match(program, /keep\\.google\\.com/);
    assert.match(program, /en-export/);
    assert.match(program, /en-todo/);
    assert.match(makeBookmarklet("md"), /^javascript:/);
    assert.match(decodeURIComponent(makeBookmarklet("json").slice("javascript:".length)), /FMT='json'/);
  });
});

function notesToJsonSafe(notes: ReturnType<typeof parseKeepJson>): string {
  return JSON.stringify({
    notes: notes.map((note) => ({
      title: note.title,
      body: note.body,
      items: note.items,
      tags: note.tags,
      pinned: note.pinned,
      created: note.created,
    })),
  });
}
