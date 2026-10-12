import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Archive, i as Download, n as Search, r as Pin } from "../_libs/lucide-react.mjs";
import { n as unzip, r as zipSync, t as strToU8 } from "../_libs/fflate.mjs";
import { t as require_spark_md5 } from "../_libs/spark-md5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CHA6cgnr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_spark_md5 = /* @__PURE__ */ __toESM(require_spark_md5());
var LIVE_FORMATS = [
	"enex",
	"md",
	"json",
	"csv",
	"txt"
];
function liveProgram(format) {
	return `(()=>{var FMT='${LIVE_FORMATS.includes(format) ? format : "enex"}';function toast(msg){var id='keepfile-toast';var el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.setAttribute('role','status');el.style.position='fixed';el.style.left='16px';el.style.right='16px';el.style.bottom='16px';el.style.zIndex='2147483647';el.style.background='#243e5a';el.style.color='#f6f4ef';el.style.padding='14px 16px';el.style.font='500 15px/1.4 Segoe UI,sans-serif';el.style.borderRadius='12px';el.style.boxShadow='0 8px 24px rgba(0,0,0,.2)';document.documentElement.appendChild(el);}el.textContent=msg;}function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}function save(name,mime,text){var blob=new Blob([text],{type:mime});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);}function xml(s){return String(s).replace(/&/g,'\u0026amp;').replace(/</g,'\u0026lt;').replace(/>/g,'\u0026gt;').replace(/\u0022/g,'\u0026quot;');}function cdata(s){return '<![CDATA['+String(s).replace(/]]>/g,']]]]><![CDATA[>')+']]>';}function stamp(d){function p(n){return (n<10?'0':'')+n;}return d.getUTCFullYear()+p(d.getUTCMonth()+1)+p(d.getUTCDate())+'T'+p(d.getUTCHours())+p(d.getUTCMinutes())+p(d.getUTCSeconds())+'Z';}function enex(notes){var body=notes.map(function(n){var title=xml((n.title||'Untitled').slice(0,255));var chunks=[];(n.items||[]).forEach(function(item){chunks.push('<div><en-todo checked="'+(item.checked?'true':'false')+'"/>'+xml(item.text)+'</div>');});String(n.body||'').split('\\n').forEach(function(line){if(line.trim())chunks.push('<div>'+xml(line)+'</div>');else if(n.body)chunks.push('<div><br/></div>');});if(!chunks.length)chunks.push('<div><br/></div>');var tags=(n.tags||[]).slice();if(n.pinned&&tags.indexOf('pinned')<0)tags.push('pinned');if(n.archived&&tags.indexOf('archived')<0)tags.push('archived');var tagXml=tags.map(function(t){return '<tag>'+xml(String(t).replace(/,/g,' ').slice(0,100))+'</tag>';}).join('');var enml='<?xml version="1.0" encoding="UTF-8" standalone="no"?>\\n<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">\\n<en-note>'+chunks.join('')+'</en-note>';return '<note><title>'+title+'</title><content>'+cdata(enml)+'</content>'+tagXml+'<note-attributes><source>google-keep</source><source-application>Keepfile</source-application></note-attributes></note>';}).join('');return '<?xml version="1.0" encoding="UTF-8"?>\\n<!DOCTYPE en-export SYSTEM "http://xml.evernote.com/pub/evernote-export3.dtd">\\n<en-export export-date="'+stamp(new Date())+'" application="Keepfile" version="1.0">'+body+'</en-export>\\n';}function markdown(notes){return notes.map(function(n){var lines=['# '+(n.title||'Untitled'),''];(n.items||[]).forEach(function(item){lines.push('- ['+(item.checked?'x':' ')+'] '+item.text);});if(n.body)lines.push(n.body);if(n.tags&&n.tags.length)lines.push('','Labels: '+n.tags.join(', '));return lines.join('\\n').trim();}).join('\\n\\n---\\n\\n')+'\\n';}function csvCell(s){s=String(s==null?'':s);if(s.indexOf(',')>=0||s.indexOf('"')>=0||s.indexOf('\\n')>=0)return '"'+s.replace(/"/g,'""')+'"';return s;}function csv(notes){var rows=notes.map(function(n){var content=(n.items||[]).map(function(item){return (item.checked?'[x] ':'[ ] ')+item.text;}).join('\\n');if(n.body)content=(content?content+'\\n':'')+n.body;return [n.title||'Untitled',content,(n.tags||[]).join('; '),n.pinned?'true':'false'].map(csvCell).join(',');});return '\\uFEFFtitle,content,labels,pinned\\n'+rows.join('\\n')+'\\n';}function textFile(notes){return notes.map(function(n){return (n.title||'Untitled')+'\\n\\n'+((n.items||[]).map(function(item){return (item.checked?'[x] ':'[ ] ')+item.text;}).join('\\n'))+(n.body?('\\n'+n.body):'');}).join('\\n\\n----\\n\\n');}function build(notes){if(FMT==='md')return {name:'keep-notes.md',mime:'text/markdown;charset=utf-8',text:markdown(notes)};if(FMT==='json')return {name:'keep-notes.json',mime:'application/json;charset=utf-8',text:JSON.stringify({exportedBy:'Keepfile',notes:notes},null,2)};if(FMT==='csv')return {name:'keep-notes.csv',mime:'text/csv;charset=utf-8',text:csv(notes)};if(FMT==='txt')return {name:'keep-notes.txt',mime:'text/plain;charset=utf-8',text:textFile(notes)};return {name:'keep-notes.enex',mime:'application/xml;charset=utf-8',text:enex(notes)};}function isComposer(text){var t=text.trim().toLowerCase();return t.indexOf('take a note')===0||t==='new list'||t==='title'&&text.length<8;}function parseCard(el){if(el.closest&&el.closest('#keepfile-toast'))return null;var boxes=[].slice.call(el.querySelectorAll('[role="checkbox"]'));var items=boxes.map(function(b){var text=(b.innerText||b.getAttribute('aria-label')||'').trim();return {text:text,checked:b.getAttribute('aria-checked')==='true'};}).filter(function(item){return item.text&&!/^list item$/i.test(item.text);});var skip={};items.forEach(function(item){skip[item.text]=1;});var action=/^(pin note|unpin|archive|unarchive|delete|more|remind|share|collaborat|background|change color|add label|make a copy|copy to|select|close|back|options|image|drawing|new list|take a note)/i;var tags=[];[].slice.call(el.querySelectorAll('[role="button"]')).forEach(function(b){var t=(b.innerText||'').trim();if(!t||t.length>40||t.indexOf('\\n')>=0||action.test(t)||skip[t])return;if(tags.indexOf(t)<0)tags.push(t);});tags.forEach(function(t){skip[t]=1;});var lines=(el.innerText||'').split('\\n').map(function(s){return s.trim();}).filter(Boolean).filter(function(line){return !skip[line]&&!action.test(line);});var title='';var body='';if(items.length){title=lines[0]||'';body=lines.slice(1).join('\\n');}else if(lines.length>1&&lines[0].length<=80){title=lines[0];body=lines.slice(1).join('\\n');}else body=lines.join('\\n');if(!title&&!body&&!items.length)return null;var blob=(title+'\\n'+body+'\\n'+items.map(function(i){return i.text;}).join('|')).trim();if(isComposer(blob))return null;var pinned=!!el.querySelector('[aria-label*="Unpin" i],[aria-label*="unpin"]');return {title:title,body:body,items:items,tags:tags,pinned:pinned,archived:false};}function harvest(bag){var all=[];var divs=document.querySelectorAll('div');for(var i=0;i<divs.length;i++){var el=divs[i];var r=el.getBoundingClientRect();if(r.width<150||r.width>560||r.height<48||r.height>920)continue;var text=(el.innerText||'').trim();if(text.length<1||text.length>20000)continue;all.push(el);}var cards=all.filter(function(el){for(var i=0;i<all.length;i++){if(all[i]!==el&&all[i].contains(el))return false;}return true;});cards.forEach(function(el){var note=parseCard(el);if(!note)return;var key=[note.title,note.body,note.items.map(function(item){return (item.checked?'1':'0')+item.text;}).join('|'),note.tags.join(',')].join('\\n');if(!bag[key])bag[key]=note;});}function nudge(){var moved=false;var nodes=document.querySelectorAll('div');for(var i=0;i<nodes.length;i++){var el=nodes[i];if(el.scrollHeight>el.clientHeight+80&&el.clientHeight>240){var before=el.scrollTop;el.scrollTop=before+Math.max(480,el.clientHeight*0.9);if(el.scrollTop!==before)moved=true;}}var se=document.scrollingElement;if(se){var b=se.scrollTop;se.scrollTop=b+800;if(se.scrollTop!==b)moved=true;}return moved;}if(!/(^|\\.)keep\\.google\\.com$/.test(location.hostname)){toast('Open Google Keep first (keep.google.com), then click Export Keep.');return;}var bag={};var stable=0;var last=-1;var started=Date.now();(async function(){try{toast('Keepfile is scrolling your notes…');while(stable<8&&Date.now()-started<90000){harvest(bag);var n=Object.keys(bag).length;nudge();await sleep(380);var after=Object.keys(bag).length;harvest(bag);after=Object.keys(bag).length;if(after===last)stable++;else stable=0;last=after;toast('Keepfile is reading notes. '+after+' so far.');}var notes=Object.keys(bag).map(function(k){return bag[k];});notes.sort(function(a,b){if(a.pinned!==b.pinned)return a.pinned?-1:1;return (a.title||a.body).localeCompare(b.title||b.body);});if(!notes.length){toast('No notes were visible. Open the notes list, not a single note, and try again.');return;}var file=build(notes);save(file.name,file.mime,file.text);toast('Downloaded '+notes.length+' notes as '+file.name+'. Photos are not included. Open Archive and run it again for archived notes.');}catch(err){toast('Export failed. '+((err&&err.message)||err));}})();})();`;
}
function makeBookmarklet(format) {
	return `javascript:${encodeURIComponent(liveProgram(format))}`;
}
function makeId(seed, index) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return `n${index.toString(36)}-${(h >>> 0).toString(36)}`;
}
function displayTitle(note) {
	const title = note.title.trim();
	if (title) return title;
	return notePlain(note).split("\n").find((line) => line.trim())?.trim() || "Untitled";
}
function notePlain(note) {
	const lines = [];
	for (const item of note.items) lines.push(`${item.checked ? "[x]" : "[ ]"} ${item.text}`);
	if (note.body.trim()) lines.push(note.body.trim());
	return lines.join("\n").trim();
}
function blankNote(partial) {
	return {
		id: partial.id ?? "",
		title: partial.title,
		body: partial.body ?? "",
		items: partial.items ?? [],
		tags: partial.tags ?? [],
		color: partial.color ?? "DEFAULT",
		pinned: partial.pinned ?? false,
		archived: partial.archived ?? false,
		trashed: partial.trashed ?? false,
		created: partial.created ?? null,
		updated: partial.updated ?? null,
		attachments: partial.attachments ?? []
	};
}
function assignIds(notes) {
	return notes.map((note, index) => ({
		...note,
		id: note.id || makeId(`${note.title}\n${note.body}\n${note.created ?? ""}`, index)
	}));
}
function guessMime(name) {
	return {
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		webp: "image/webp",
		svg: "image/svg+xml",
		pdf: "application/pdf",
		mp3: "audio/mpeg",
		m4a: "audio/mp4",
		wav: "audio/wav",
		ogg: "audio/ogg",
		mp4: "video/mp4",
		"3gp": "video/3gpp"
	}[name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";
}
function baseName(path) {
	const clean = path.replace(/\\/g, "/").split("/").pop() || "file";
	try {
		return decodeURIComponent(clean);
	} catch {
		return clean;
	}
}
function yamlString(value) {
	return JSON.stringify(value);
}
function stampDay(iso) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString();
}
function noteToMarkdown(note, yaml) {
	const title = displayTitle(note);
	const lines = [];
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
	} else lines.push(`# ${title}`, "");
	for (const item of note.items) lines.push(`- [${item.checked ? "x" : " "}] ${item.text}`);
	if (note.items.length && note.body.trim()) lines.push("");
	if (note.body.trim()) lines.push(note.body.trim());
	for (const attachment of note.attachments) {
		lines.push("");
		if (attachment.mime.startsWith("image/") && attachment.bytes) lines.push(`![${attachment.name}](attachments/${attachment.name})`);
		else lines.push(`Attachment: ${attachment.name}`);
	}
	if (!yaml && (note.tags.length || note.pinned || note.archived)) {
		const meta = [];
		if (note.tags.length) meta.push(`Labels: ${note.tags.join(", ")}`);
		if (note.pinned) meta.push("Pinned");
		if (note.archived) meta.push("Archived");
		const created = note.created?.slice(0, 10);
		if (created) meta.push(created);
		lines.push("", meta.join(" · "));
	}
	return `${lines.join("\n").trim()}\n`;
}
function notesToMarkdown(notes) {
	return notes.map((note) => noteToMarkdown(note, false)).join("\n---\n\n");
}
function notesToText(notes) {
	return notes.map((note) => {
		const title = displayTitle(note);
		const meta = [];
		if (note.tags.length) meta.push(`Labels: ${note.tags.join(", ")}`);
		if (note.pinned) meta.push("Pinned");
		if (note.archived) meta.push("Archived");
		if (note.created) meta.push(note.created.slice(0, 10));
		return `${title}\n${"=".repeat(Math.min(title.length, 40))}\n\n${notePlain(note)}${meta.length ? `\n\n${meta.join(" · ")}` : ""}\n`;
	}).join("\n");
}
function csvCell(value) {
	if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, "\"\"")}"`;
	return value;
}
function notesToCsv(notes) {
	const header = [
		"title",
		"content",
		"labels",
		"pinned",
		"archived",
		"trashed",
		"color",
		"created",
		"updated"
	];
	const rows = notes.map((note) => [
		displayTitle(note),
		notePlain(note),
		note.tags.join("; "),
		note.pinned ? "true" : "false",
		note.archived ? "true" : "false",
		note.trashed ? "true" : "false",
		note.color,
		note.created ?? "",
		note.updated ?? ""
	].map(csvCell).join(","));
	return `\uFEFF${header.join(",")}\n${rows.join("\n")}\n`;
}
function notesToJson(notes) {
	return `${JSON.stringify({
		exportedBy: "Keepfile",
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
			attachments: note.attachments.map((attachment) => attachment.name)
		}))
	}, null, 2)}\n`;
}
function fileSlug(title, index) {
	const base = title.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "note";
	return `${String(index + 1).padStart(3, "0")}-${base}.md`;
}
function notesToMarkdownZip(notes) {
	const files = {};
	const used = /* @__PURE__ */ new Set();
	notes.forEach((note, index) => {
		let name = fileSlug(displayTitle(note), index);
		while (used.has(name)) name = name.replace(/\.md$/, `-${used.size}.md`);
		used.add(name);
		files[name] = strToU8(noteToMarkdown(note, true));
		for (const attachment of note.attachments) {
			if (!attachment.bytes || attachment.bytes.byteLength === 0) continue;
			const path = `attachments/${attachment.name}`;
			if (!files[path]) files[path] = attachment.bytes;
		}
	});
	return zipSync(files);
}
var MONTHS = /* @__PURE__ */ new Map();
function addMonths(month, names) {
	for (const name of names) MONTHS.set(name.toLowerCase(), month);
}
addMonths(1, [
	"jan",
	"january",
	"januar",
	"janvier",
	"enero",
	"janeiro",
	"gennaio",
	"januari",
	"ene",
	"gen",
	"sty",
	"янв",
	"января",
	"oca",
	"led"
]);
addMonths(2, [
	"feb",
	"february",
	"februar",
	"février",
	"fevrier",
	"febrero",
	"fevereiro",
	"febbraio",
	"februari",
	"lut",
	"фев",
	"февраля",
	"şub",
	"sub",
	"úno",
	"uno"
]);
addMonths(3, [
	"mar",
	"march",
	"märz",
	"marz",
	"mars",
	"marzo",
	"março",
	"marco",
	"maart",
	"mrt",
	"mär",
	"мар",
	"марта",
	"mar",
	"bře",
	"bre"
]);
addMonths(4, [
	"apr",
	"april",
	"avril",
	"abril",
	"aprile",
	"kwi",
	"апр",
	"апреля",
	"nis",
	"dub"
]);
addMonths(5, [
	"may",
	"mai",
	"mayo",
	"maio",
	"maggio",
	"mei",
	"maj",
	"мая",
	"mayıs",
	"mayis",
	"kvě",
	"kve"
]);
addMonths(6, [
	"jun",
	"june",
	"juni",
	"juin",
	"junio",
	"junho",
	"giugno",
	"cze",
	"июн",
	"июня",
	"haz",
	"čvn",
	"cvc"
]);
addMonths(7, [
	"jul",
	"july",
	"juli",
	"juillet",
	"julio",
	"julho",
	"luglio",
	"lip",
	"июл",
	"июля",
	"tem",
	"čvc"
]);
addMonths(8, [
	"aug",
	"august",
	"août",
	"aout",
	"agosto",
	"augustus",
	"sie",
	"авг",
	"августа",
	"ağu",
	"agu",
	"srp"
]);
addMonths(9, [
	"sep",
	"sept",
	"september",
	"septembre",
	"septiembre",
	"setembro",
	"settembre",
	"wrz",
	"сен",
	"сентября",
	"eyl",
	"zář",
	"zar"
]);
addMonths(10, [
	"oct",
	"october",
	"oktober",
	"octobre",
	"octubre",
	"outubro",
	"ottobre",
	"okt",
	"paź",
	"paz",
	"окт",
	"октября",
	"eki",
	"říj",
	"rij"
]);
addMonths(11, [
	"nov",
	"november",
	"novembre",
	"noviembre",
	"novembro",
	"novembre",
	"lis",
	"ноя",
	"ноября",
	"kas",
	"lis"
]);
addMonths(12, [
	"dec",
	"december",
	"dezember",
	"décembre",
	"decembre",
	"diciembre",
	"dezembro",
	"dicembre",
	"dez",
	"gru",
	"дек",
	"декабря",
	"ara",
	"pro"
]);
function monthNum(raw) {
	const token = raw.toLowerCase().replace(/\./g, "").replace(/[^a-zà-ÿа-яёışğüç]/gi, "");
	if (!token) return null;
	if (MONTHS.has(token)) return MONTHS.get(token) ?? null;
	const three = token.slice(0, 3);
	if (MONTHS.has(three)) return MONTHS.get(three) ?? null;
	const four = token.slice(0, 4);
	if (MONTHS.has(four)) return MONTHS.get(four) ?? null;
	return null;
}
function pad(n) {
	return String(n).padStart(2, "0");
}
/** Keep Takeout prints the clock time without a zone. Store that clock as UTC so it does not shift. */
function parseKeepDate(input) {
	const original = input.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
	if (!original) return null;
	const time = /(\d{1,2})\s*[:h時]\s*(\d{2})(?:\s*[:m分]\s*(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|오전|오후|上午|下午|午前|午後)?/i.exec(original);
	let hour = time ? Number(time[1]) : 0;
	const minute = time ? Number(time[2]) : 0;
	const second = time && time[3] ? Number(time[3]) : 0;
	const marker = time?.[4]?.toLowerCase().replace(/\./g, "") ?? "";
	const isPm = marker === "pm" || marker === "오후" || marker === "下午" || marker === "午後";
	const isAm = marker === "am" || marker === "오전" || marker === "上午" || marker === "午前";
	if (isPm && hour < 12) hour += 12;
	if (isAm && hour === 12) hour = 0;
	if (hour > 23 || minute > 59 || second > 59) return null;
	const s = original.replace(/,/g, " ");
	let y = 0;
	let m = 0;
	let d = 0;
	const ymd = /(\d{4})\s*[./年-]\s*(\d{1,2})\s*[./月-]\s*(\d{1,2})/.exec(s);
	const dmyDot = /(\d{1,2})\s*\.\s*(\d{1,2})\s*\.\s*(\d{4})/.exec(s);
	const slash = /(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/.exec(s);
	const dMonth = /(\d{1,2})\s+(?:de\s+)?([A-Za-zÀ-ÿ\u0400-\u04FF]{3,12})\.?(?:\s+de)?\s+(\d{4})/i.exec(s);
	const monthD = /([A-Za-zÀ-ÿ\u0400-\u04FF]{3,12})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})/i.exec(s);
	if (ymd) {
		y = Number(ymd[1]);
		m = Number(ymd[2]);
		d = Number(ymd[3]);
	} else if (dmyDot) {
		y = Number(dmyDot[3]);
		m = Number(dmyDot[2]);
		d = Number(dmyDot[1]);
	} else if (dMonth) {
		const mon = monthNum(dMonth[2]);
		if (!mon) return null;
		y = Number(dMonth[3]);
		m = mon;
		d = Number(dMonth[1]);
	} else if (monthD) {
		const mon = monthNum(monthD[1]);
		if (!mon) return null;
		y = Number(monthD[3]);
		m = mon;
		d = Number(monthD[2]);
	} else if (slash) {
		const a = Number(slash[1]);
		const b = Number(slash[2]);
		y = Number(slash[3]);
		if (a > 12) {
			d = a;
			m = b;
		} else if (b > 12) {
			m = a;
			d = b;
		} else {
			m = a;
			d = b;
		}
	} else return null;
	if (y < 1970 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
	return `${y}-${pad(m)}-${pad(d)}T${pad(hour)}:${pad(minute)}:${pad(second)}.000Z`;
}
function evernoteStamp(iso) {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}
function xml(value) {
	return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function cdata(value) {
	return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}
function md5Hex(bytes) {
	const buffer = bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength ? bytes.buffer : bytes.slice().buffer;
	return import_spark_md5.default.ArrayBuffer.hash(buffer);
}
function tagValue(value) {
	const clean = value.replace(/[\u0000-\u001f]/g, "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
	if (!clean) return null;
	return clean.slice(0, 100);
}
function enml(note) {
	const chunks = [];
	for (const item of note.items) chunks.push(`<div><en-todo checked="${item.checked ? "true" : "false"}"/>${xml(item.text)}</div>`);
	const body = note.body.replace(/\r\n/g, "\n");
	if (body.trim() || !note.items.length && !note.attachments.length) {
		const lines = body.length ? body.split("\n") : [];
		if (lines.length === 0 && chunks.length === 0) chunks.push("<div><br/></div>");
		for (const line of lines) chunks.push(line.trim() ? `<div>${xml(line)}</div>` : "<div><br/></div>");
	}
	for (const attachment of note.attachments) if (attachment.bytes && attachment.bytes.byteLength > 0) {
		const hash = md5Hex(attachment.bytes);
		chunks.push(`<div><en-media hash="${hash}" type="${xml(attachment.mime)}"/></div>`);
	} else if (attachment.name) chunks.push(`<div>${xml(`Attachment: ${attachment.name}`)}</div>`);
	if (chunks.length === 0) chunks.push("<div><br/></div>");
	return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">
<en-note>${chunks.join("")}</en-note>`;
}
function noteXml(note) {
	const title = xml(displayTitle(note).slice(0, 255));
	const tags = [];
	const pushTag = (value) => {
		const clean = tagValue(value);
		if (!clean) return;
		if (tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) return;
		tags.push(clean);
	};
	for (const tag of note.tags) pushTag(tag);
	if (note.pinned) pushTag("pinned");
	if (note.archived) pushTag("archived");
	if (note.trashed) pushTag("trashed");
	const created = evernoteStamp(note.created);
	const updated = evernoteStamp(note.updated);
	const resources = note.attachments.filter((attachment) => attachment.bytes && attachment.bytes.byteLength > 0).map((attachment) => {
		const bytes = attachment.bytes;
		let binary = "";
		const chunk = 32768;
		for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
		return `<resource><data encoding="base64">${btoa(binary)}</data><mime>${xml(attachment.mime)}</mime><resource-attributes><file-name>${xml(attachment.name)}</file-name></resource-attributes></resource>`;
	}).join("");
	return `<note><title>${title}</title><content>${cdata(enml(note))}</content>` + (created ? `<created>${created}</created>` : "") + (updated ? `<updated>${updated}</updated>` : "") + tags.map((tag) => `<tag>${xml(tag)}</tag>`).join("") + `<note-attributes><source>google-keep</source><source-application>Keepfile</source-application></note-attributes>` + resources + `</note>`;
}
function notesToEnex(notes) {
	const exported = evernoteStamp((/* @__PURE__ */ new Date()).toISOString()) ?? "19700101T000000Z";
	const body = notes.map(noteXml).join("");
	return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE en-export SYSTEM "http://xml.evernote.com/pub/evernote-export3.dtd">
<en-export export-date="${exported}" application="Keepfile" version="1.0">` + body + `</en-export>\n`;
}
var VOID = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr"
]);
var NAMED = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: " ",
	hellip: "…",
	mdash: "—",
	ndash: "–"
};
function decode(value) {
	return value.replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeCp(Number.parseInt(hex, 16))).replace(/&#(\d+);/g, (_, num) => safeCp(Number(num))).replace(/&([a-z]+);/gi, (all, name) => NAMED[name.toLowerCase()] ?? all);
}
function safeCp(code) {
	if (!Number.isFinite(code) || code < 0 || code > 1114111) return "";
	try {
		return String.fromCodePoint(code);
	} catch {
		return "";
	}
}
function classList(attrs) {
	const match = /\bclass\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs);
	if (!match) return [];
	return (match[2] || match[3] || "").split(/\s+/).filter(Boolean);
}
function readInner(html, tag, start) {
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
function elementsWithClass(html, className) {
	const out = [];
	const re = /<([a-zA-Z][\w:-]*)\b([^>]*)>/g;
	let match;
	while (match = re.exec(html)) {
		const tag = match[1].toLowerCase();
		const attrs = match[2] || "";
		const classes = classList(attrs);
		if (!classes.includes(className)) continue;
		if (VOID.has(tag) || /\/\s*$/.test(attrs)) {
			out.push({
				classes,
				inner: ""
			});
			continue;
		}
		const start = match.index + match[0].length;
		const inner = readInner(html, tag, start);
		out.push({
			classes,
			inner
		});
		re.lastIndex = start + inner.length;
	}
	return out;
}
function textOnly(html) {
	return decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/\u200e/g, "").replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function stripNoise(html) {
	return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}
function imageSrcs(html) {
	const out = [];
	const re = /<img\b[^>]*>/gi;
	let match;
	while (match = re.exec(html)) {
		const src = /\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i.exec(match[0]);
		const value = src?.[2] || src?.[3] || "";
		if (value && !value.startsWith("data:image/svg")) out.push(value);
	}
	return out;
}
function dataUri(uri) {
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
		return {
			name: `image.${mime.split("/")[1]?.replace("jpeg", "jpg") || "bin"}`,
			mime,
			bytes
		};
	}
	return null;
}
function attachmentsFromHtml(html) {
	const attachments = [];
	let imageIndex = 1;
	for (const src of imageSrcs(html)) if (src.startsWith("data:")) {
		const parsed = dataUri(src);
		if (!parsed) continue;
		parsed.name = `image-${imageIndex}.${parsed.name.split(".").pop()}`;
		imageIndex += 1;
		attachments.push(parsed);
	} else {
		const name = baseName(src.split("?")[0] || src);
		attachments.push({
			name,
			mime: guessMime(name),
			path: src
		});
	}
	return attachments;
}
function bodyFromContent(contentHtml) {
	const listItems = elementsWithClass(contentHtml, "listitem");
	if (listItems.length) return {
		body: "",
		items: listItems.map((item) => {
			const textNode = elementsWithClass(item.inner, "text")[0];
			return {
				text: textOnly(textNode?.inner || item.inner).replace(/^[\s\u2610\u2611\u2612\u2713\u2714•●]+/u, "").trim(),
				checked: item.classes.includes("checked") || /[\u2611\u2612\u2713\u2714]/u.test(item.inner)
			};
		}).filter((item) => item.text)
	};
	return {
		body: textOnly(contentHtml).split("\n").map((line) => {
			const trimmed = line.trim().replace(/\u200e/g, "");
			if (/^[•●]\s*/u.test(trimmed)) return `* ${trimmed.replace(/^[•●]\s*/u, "")}`;
			if (/^\u2610\s*/u.test(trimmed)) return `[ ] ${trimmed.replace(/^\u2610\s*/u, "")}`;
			if (/^[\u2611\u2612]\s*/u.test(trimmed)) return `[x] ${trimmed.replace(/^[\u2611\u2612]\s*/u, "")}`;
			return trimmed;
		}).join("\n").trim(),
		items: []
	};
}
function tagsFrom(inner) {
	const named = elementsWithClass(inner, "label-name").map((el) => textOnly(el.inner)).filter(Boolean);
	if (named.length) return unique(named);
	return unique(elementsWithClass(inner, "label").map((el) => textOnly(el.inner)).filter(Boolean));
}
function unique(values) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const value of values) {
		const clean = value.replace(/\s+/g, " ").trim();
		if (!clean || seen.has(clean.toLowerCase())) continue;
		seen.add(clean.toLowerCase());
		out.push(clean);
	}
	return out;
}
function parseNoteChunk(classes, inner) {
	const title = textOnly(elementsWithClass(inner, "title")[0]?.inner ?? "");
	const content = elementsWithClass(inner, "content")[0]?.inner ?? "";
	const heading = textOnly(elementsWithClass(inner, "heading")[0]?.inner ?? elementsWithClass(inner, "date")[0]?.inner ?? "");
	const { body, items } = content ? bodyFromContent(content) : {
		body: "",
		items: []
	};
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
		attachments: attachmentsFromHtml(inner)
	});
	if (!note.title && !note.body && note.items.length === 0 && note.attachments.length === 0) return null;
	return note;
}
function parseKeepHtml(html) {
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
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function asString(value) {
	return typeof value === "string" ? value : "";
}
function timeOf(value) {
	if (typeof value === "string") {
		if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
			const date = new Date(value);
			return Number.isNaN(date.getTime()) ? null : date.toISOString();
		}
		return parseKeepDate(value);
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		const ms = value > 0x5af3107a4000 ? value / 1e3 : value > 0xe8d4a51000 ? value : value > 1e9 ? value * 1e3 : NaN;
		if (!Number.isFinite(ms)) return null;
		const date = new Date(ms);
		return Number.isNaN(date.getTime()) ? null : date.toISOString();
	}
	return null;
}
function itemOf(value) {
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
	return {
		text,
		checked: Boolean(record.isChecked || record.checked)
	};
}
function tagsOf(record) {
	const tags = [];
	const push = (value) => {
		const clean = value.replace(/\s+/g, " ").trim();
		if (clean && !tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) tags.push(clean);
	};
	const lists = [record.labels, record.tags];
	for (const list of lists) {
		if (!Array.isArray(list)) continue;
		for (const entry of list) if (typeof entry === "string") push(entry);
		else {
			const obj = asRecord(entry);
			if (obj && typeof obj.name === "string") push(obj.name);
		}
	}
	return tags;
}
function attachmentsOf(record) {
	if (!Array.isArray(record.attachments)) return [];
	const attachments = [];
	for (const entry of record.attachments) {
		if (typeof entry === "string" && entry.trim()) {
			const name = baseName(entry);
			attachments.push({
				name,
				mime: guessMime(name),
				path: entry
			});
			continue;
		}
		const obj = asRecord(entry);
		if (!obj) continue;
		const path = asString(obj.filePath || obj.path || obj.name);
		if (!path) continue;
		const name = baseName(path);
		const mime = asString(obj.mimetype || obj.mimeType || obj.mime) || guessMime(name);
		attachments.push({
			name,
			mime,
			path
		});
	}
	return attachments;
}
function looksLikeNote(value) {
	const record = asRecord(value);
	if (!record) return false;
	if (typeof record.title === "string") return true;
	if (typeof record.textContent === "string" || typeof record.text === "string") return true;
	if (Array.isArray(record.listContent) || Array.isArray(record.items)) return true;
	if (asRecord(record.body)) return true;
	return false;
}
function noteFromRecord(record) {
	let body = asString(record.textContent || record.bodyText);
	if (!body && typeof record.text === "string") body = record.text;
	if (!body && typeof record.body === "string") body = record.body;
	let items = Array.isArray(record.listContent) ? record.listContent.map(itemOf).filter((item) => item !== null) : [];
	if (items.length === 0 && Array.isArray(record.items)) items = record.items.map(itemOf).filter((item) => item !== null);
	const apiBody = asRecord(record.body);
	if (apiBody) {
		const text = asRecord(apiBody.text);
		if (text && typeof text.text === "string" && !body) body = text.text;
		const list = asRecord(apiBody.list);
		if (list && Array.isArray(list.listItems) && items.length === 0) items = list.listItems.map(itemOf).filter((item) => item !== null);
	}
	body = body.replace(/\u200e/g, "").trim();
	const title = asString(record.title).replace(/\u200e/g, "").trim();
	const created = timeOf(record.createdTimestampUsec) || timeOf(record.created) || timeOf(record.createTime) || timeOf(record.date);
	const updated = timeOf(record.userEditedTimestampUsec) || timeOf(record.updated) || timeOf(record.updateTime) || created;
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
		attachments: attachmentsOf(record)
	});
	if (!note.title && !note.body && note.items.length === 0 && note.attachments.length === 0) return null;
	return note;
}
function parseKeepJson(value) {
	if (Array.isArray(value)) return value.flatMap((entry) => parseKeepJson(entry));
	const record = asRecord(value);
	if (!record) return [];
	if (Array.isArray(record.notes)) return record.notes.flatMap((entry) => parseKeepJson(entry));
	if (!looksLikeNote(record)) return [];
	const note = noteFromRecord(record);
	return note ? [note] : [];
}
function unzipBytes(data) {
	return new Promise((resolve, reject) => {
		unzip(data, (error, result) => error ? reject(error) : resolve(result));
	});
}
function decodeText(bytes) {
	return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
function stemOf(path) {
	return path.replace(/\\/g, "/").replace(/\.[^.]+$/, "").toLowerCase();
}
function merge(primary, extra) {
	const tags = [...primary.tags];
	for (const tag of extra.tags) if (!tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) tags.push(tag);
	const attachments = [...primary.attachments];
	for (const attachment of extra.attachments) if (!attachments.some((current) => current.name === attachment.name || current.path && current.path === attachment.path)) attachments.push(attachment);
	return {
		...primary,
		title: primary.title || extra.title,
		body: primary.body.trim() ? primary.body : extra.body,
		items: primary.items.length ? primary.items : extra.items,
		tags,
		color: primary.color !== "DEFAULT" ? primary.color : extra.color,
		pinned: primary.pinned || extra.pinned,
		archived: primary.archived || extra.archived,
		trashed: primary.trashed || extra.trashed,
		created: primary.created || extra.created,
		updated: primary.updated || extra.updated,
		attachments
	};
}
function parseCsv(text) {
	const rows = csvRows(text.replace(/^\uFEFF/, ""));
	if (rows.length < 2) return [];
	const header = rows[0].map((cell) => cell.trim().toLowerCase());
	const index = (names) => header.findIndex((cell) => names.includes(cell));
	const titleI = index(["title", "name"]);
	const bodyI = index([
		"content",
		"body",
		"text",
		"textcontent"
	]);
	if (titleI < 0 && bodyI < 0) return [];
	const tagsI = index(["labels", "tags"]);
	const pinnedI = index(["pinned", "ispinned"]);
	const archivedI = index(["archived", "isarchived"]);
	const trashedI = index(["trashed", "istrashed"]);
	const colorI = index(["color"]);
	const createdI = index(["created", "createdtimestampusec"]);
	const updatedI = index(["updated", "usereditedtimestampusec"]);
	return rows.slice(1).flatMap((row) => {
		if (row.every((cell) => !cell.trim())) return [];
		return parseKeepJson({
			title: titleI >= 0 ? row[titleI] : "",
			body: bodyI >= 0 ? row[bodyI] : "",
			tags: tagsI >= 0 ? row[tagsI].split(/[;,]/).map((tag) => tag.trim()).filter(Boolean) : [],
			pinned: pinnedI >= 0 ? /^true|yes|1$/i.test(row[pinnedI] || "") : false,
			archived: archivedI >= 0 ? /^true|yes|1$/i.test(row[archivedI] || "") : false,
			trashed: trashedI >= 0 ? /^true|yes|1$/i.test(row[trashedI] || "") : false,
			color: colorI >= 0 ? row[colorI] : "DEFAULT",
			created: createdI >= 0 ? row[createdI] : null,
			updated: updatedI >= 0 ? row[updatedI] : null
		});
	});
}
function csvRows(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let quoted = false;
	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (char === "\"") {
				if (text[i + 1] === "\"") {
					cell += "\"";
					i += 1;
				} else quoted = false;
			} else cell += char;
		} else if (char === "\"") quoted = true;
		else if (char === ",") {
			row.push(cell);
			cell = "";
		} else if (char === "\n") {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = "";
		} else if (char !== "\r") cell += char;
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	return rows;
}
async function expand(entries, warnings) {
	const out = [];
	for (const entry of entries) {
		const lower = entry.name.toLowerCase();
		if (lower.endsWith(".zip")) try {
			const unzipped = await unzipBytes(entry.bytes);
			for (const [path, bytes] of Object.entries(unzipped)) {
				if (!path || path.endsWith("/") || path.includes("__MACOSX") || path.split("/").pop()?.startsWith(".")) continue;
				out.push({
					name: path,
					bytes
				});
			}
		} catch {
			warnings.push(`${baseName(entry.name)} is not a zip Keepfile can read. Export Takeout as a .zip, or drop the HTML and JSON files.`);
		}
		else if (lower.endsWith(".tgz") || lower.endsWith(".tar.gz")) warnings.push("This archive is .tgz. In Takeout, choose .zip, or unzip it and drop the Keep folder.");
		else out.push(entry);
	}
	return out;
}
function attachBytes(notes, files) {
	const byPath = /* @__PURE__ */ new Map();
	const byBase = /* @__PURE__ */ new Map();
	for (const file of files) {
		const path = file.name.replace(/\\/g, "/").toLowerCase();
		byPath.set(path, file.bytes);
		const base = path.split("/").pop() ?? path;
		if (!byBase.has(base)) byBase.set(base, file.bytes);
	}
	for (const note of notes) for (const attachment of note.attachments) {
		if (attachment.bytes) continue;
		const path = attachment.path?.replace(/\\/g, "/").toLowerCase();
		const bytes = path && byPath.get(path) || byBase.get(attachment.name.toLowerCase());
		if (!bytes) continue;
		attachment.bytes = bytes;
		if (!attachment.mime || attachment.mime === "application/octet-stream") attachment.mime = guessMime(attachment.name);
	}
}
async function notesFromNamedBytes(entries) {
	const warnings = [];
	const files = await expand(entries, warnings);
	const buckets = /* @__PURE__ */ new Map();
	const loose = [];
	const bucket = (path) => {
		const key = stemOf(path);
		let current = buckets.get(key);
		if (!current) {
			current = {
				json: [],
				html: []
			};
			buckets.set(key, current);
		}
		return current;
	};
	for (const file of files) {
		const lower = file.name.toLowerCase();
		if (lower.endsWith("archive_browser.html")) continue;
		try {
			if (lower.endsWith(".json")) {
				const parsed = parseKeepJson(JSON.parse(decodeText(file.bytes)));
				if (parsed.length === 1) bucket(file.name).json = parsed;
				else if (parsed.length > 1) loose.push(...parsed);
			} else if (lower.endsWith(".html") || lower.endsWith(".htm")) {
				const parsed = parseKeepHtml(decodeText(file.bytes));
				if (parsed.length === 1) bucket(file.name).html = parsed;
				else loose.push(...parsed);
			} else if (lower.endsWith(".csv")) loose.push(...parseCsv(decodeText(file.bytes)));
			else if (lower.endsWith(".txt")) {
				const text = decodeText(file.bytes).trim();
				if (!text) continue;
				loose.push(...parseKeepJson({
					title: baseName(file.name).replace(/\.txt$/i, ""),
					body: text
				}));
			}
		} catch {
			warnings.push(`Could not read ${baseName(file.name)}.`);
		}
	}
	const notes = [...loose];
	for (const group of buckets.values()) if (group.json.length === 1 && group.html.length === 1) notes.push(merge(group.json[0], group.html[0]));
	else notes.push(...group.json, ...group.html);
	attachBytes(notes, files);
	const ready = assignIds(notes.filter((note) => note.title || note.body || note.items.length || note.attachments.length));
	if (ready.length === 0) warnings.push("No Keep notes found. Paste notes, or drop Keep HTML, JSON, or a Takeout zip.");
	return {
		notes: ready,
		warnings
	};
}
function parsePaste(text) {
	const trimmed = text.replace(/\r\n/g, "\n").trim();
	if (!trimmed) return [];
	return assignIds(trimmed.split(/\n[ \t]*(?:---|\*\*\*)[ \t]*\n/).map((chunk) => chunk.trim()).filter(Boolean).map((chunk) => {
		const lines = chunk.split("\n");
		let title = "";
		let rest = chunk;
		if (lines.length > 1) {
			title = lines[0].replace(/^#\s+/, "").trim();
			rest = lines.slice(1).join("\n").trim();
		} else if (lines[0]?.startsWith("# ")) {
			title = lines[0].slice(2).trim();
			rest = "";
		}
		const items = [];
		const bodyLines = [];
		for (const line of rest.split("\n")) {
			const item = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/.exec(line);
			if (item) items.push({
				text: item[2].trim(),
				checked: item[1].toLowerCase() === "x"
			});
			else bodyLines.push(line);
		}
		return parseKeepJson({
			title,
			body: bodyLines.join("\n").trim(),
			items
		})[0];
	}).filter((note) => Boolean(note)));
}
var samples = [
	blankNote({
		title: "Research question",
		body: "Why does the north bank run more turbid after rain than the gauge suggests? Compare the June log before writing the methods section.",
		tags: ["research", "field"],
		pinned: true,
		created: "2024-06-02T15:10:00.000Z",
		updated: "2024-10-03T18:04:00.000Z"
	}),
	blankNote({
		title: "Sources to pull",
		items: [
			{
				text: "Smith 2019 on bank erosion",
				checked: false
			},
			{
				text: "City gauge data, 2018–2024",
				checked: true
			},
			{
				text: "Interview transcript, 12 May",
				checked: false
			}
		],
		tags: ["research"],
		created: "2024-05-12T11:00:00.000Z",
		updated: "2024-09-30T09:12:00.000Z"
	}),
	blankNote({
		title: "Draft abstract",
		body: "Three bends on the same river do not share one sediment story. Rain, cattle access, and a repaired culvert show up as separate signals in the notes.",
		tags: ["draft", "research"],
		color: "BLUE",
		created: "2024-08-19T13:40:00.000Z",
		updated: "2024-10-01T16:22:00.000Z"
	}),
	blankNote({
		title: "Aside — discarded framing",
		body: "The first framing blamed the dam alone. The notes from week two do not support that, so this version stays archived.",
		tags: ["research"],
		archived: true,
		created: "2024-07-01T08:05:00.000Z",
		updated: "2024-07-04T08:05:00.000Z"
	}),
	blankNote({
		title: "Lab meeting, 3 Oct",
		body: "Decision: move the working notes into Evernote, and keep labels as tags. Follow up on the missing photo set separately.",
		tags: ["meeting"],
		created: "2024-10-03T17:30:00.000Z",
		updated: "2024-10-03T17:48:00.000Z"
	})
];
function sampleNotes() {
	return assignIds(samples);
}
var LIVE = [
	{
		id: "enex",
		label: "Evernote"
	},
	{
		id: "md",
		label: "Markdown"
	},
	{
		id: "json",
		label: "JSON"
	},
	{
		id: "csv",
		label: "CSV"
	},
	{
		id: "txt",
		label: "Text"
	}
];
function downloadBlob(filename, blob) {
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
function downloadText(filename, mime, text) {
	downloadBlob(filename, new Blob([text], { type: mime }));
}
function KeepApp() {
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [origin, setOrigin] = (0, import_react.useState)(null);
	const [warnings, setWarnings] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [format, setFormat] = (0, import_react.useState)("enex");
	const [query, setQuery] = (0, import_react.useState)("");
	const [tag, setTag] = (0, import_react.useState)(null);
	const [showArchived, setShowArchived] = (0, import_react.useState)(true);
	const [showTrash, setShowTrash] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [paste, setPaste] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const bookmark = (0, import_react.useMemo)(() => makeBookmarklet(format), [format]);
	function adopt(next, source, nextWarnings) {
		setNotes(next);
		setOrigin(source);
		setWarnings(nextWarnings);
		setSelected(new Set(next.filter((note) => !note.trashed).map((note) => note.id)));
		setActiveId((next.find((note) => !note.trashed) ?? next[0])?.id ?? null);
		setQuery("");
		setTag(null);
	}
	async function ingestFiles(files) {
		if (files.length === 0) return;
		setBusy(true);
		try {
			const result = await notesFromNamedBytes(await Promise.all(files.map(async (file) => ({
				name: file.webkitRelativePath || file.name,
				bytes: new Uint8Array(await file.arrayBuffer())
			}))));
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
	const pool = (0, import_react.useMemo)(() => {
		return notes.filter((note) => showArchived ? true : !note.archived).filter((note) => showTrash ? true : !note.trashed).sort((a, b) => {
			if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
			return (b.updated || b.created || "").localeCompare(a.updated || a.created || "");
		});
	}, [
		notes,
		showArchived,
		showTrash
	]);
	const tags = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const note of pool) for (const label of note.tags) counts.set(label, (counts.get(label) ?? 0) + 1);
		return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	}, [pool]);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return pool.filter((note) => {
			if (tag && !note.tags.some((label) => label.toLowerCase() === tag.toLowerCase())) return false;
			if (!needle) return true;
			return [
				note.title,
				note.body,
				note.tags.join(" "),
				note.items.map((item) => item.text).join(" ")
			].join("\n").toLowerCase().includes(needle);
		});
	}, [
		pool,
		query,
		tag
	]);
	const chosen = visible.filter((note) => selected.has(note.id));
	const active = notes.find((note) => note.id === activeId) ?? chosen[0] ?? visible[0] ?? null;
	const hiddenTrash = notes.filter((note) => note.trashed).length;
	async function copyBookmark() {
		try {
			await navigator.clipboard.writeText(bookmark);
			setCopied(true);
		} catch {
			setCopied(false);
			setWarnings(["Clipboard is blocked. Drag Export Keep onto the bookmarks bar instead."]);
		}
	}
	function exportChosen(kind) {
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
			downloadBlob("keep-notes.zip", new Blob([copy.buffer], { type: "application/zip" }));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-muted",
						children: "Google Keep export"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl",
						children: "Keepfile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 max-w-2xl text-lg text-muted",
						children: "Get notes out of Google Keep without waiting on Takeout. Evernote is the file to download. Markdown, JSON, CSV, and text are next to it. Nothing is uploaded."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-3xl bg-card p-4 shadow-border sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-medium",
						children: "From the Keep page"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-muted",
						children: "This is the quick way. The bookmark reads the notes already open in your browser, scrolls the list, and downloads a file there."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						role: "group",
						"aria-label": "Bookmark format",
						children: LIVE.map((item) => {
							const on = format === item.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": on,
								onClick: () => {
									setFormat(item.id);
									setCopied(false);
								},
								className: on ? "h-11 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg" : "h-11 rounded-lg bg-chip px-3 text-sm font-medium text-ink",
								children: item.label
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-5 grid gap-4 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-paper p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-muted",
										children: "1"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-medium",
										children: "Drag this to your bookmarks bar"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: bookmark,
										draggable: true,
										onClick: (event) => event.preventDefault(),
										className: "mt-3 inline-flex h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg",
										children: "Export Keep"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-paper p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-muted",
										children: "2"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-medium",
										children: "Open Google Keep"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Use the notes list, signed in. Archive is a separate pass."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-paper p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-muted",
										children: "3"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-medium",
										children: "Click the bookmark"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "It scrolls, then downloads. Photos stay in Keep."
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void copyBookmark(),
						className: "mt-4 h-11 text-sm font-medium text-accent",
						children: copied ? "Bookmark copied" : "Copy bookmark address"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-3xl bg-card p-4 shadow-border sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-medium",
							children: "Paste a few notes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "First line is the title. Put a line that is only --- between notes. Checklists can be - [ ] and - [x]."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: paste,
							onChange: (event) => setPaste(event.target.value),
							rows: 6,
							placeholder: "River survey\nNorth bank was muddy.\n\n---\n\nSources\n- [ ] Smith 2019",
							className: "mt-4 w-full rounded-lg border border-line bg-paper px-3 py-3 text-base text-ink placeholder:text-faint"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const next = parsePaste(paste);
								if (next.length === 0) {
									setWarnings(["Paste at least one note."]);
									return;
								}
								adopt(next, "paste", []);
							},
							className: "mt-3 h-11 rounded-lg bg-ink px-4 text-sm font-medium text-paper",
							children: "Read paste"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col rounded-3xl bg-card p-4 shadow-border sm:p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-medium",
							children: "Try the download"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Sample research notes, so you can see an Evernote file before touching your account."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => adopt(sampleNotes(), "sample", []),
							className: "mt-4 h-11 self-start rounded-lg bg-chip px-4 text-sm font-medium text-ink",
							children: "Load sample notes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "mt-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
									className: "cursor-pointer text-sm font-medium text-ink",
									children: "Need photos too? Use a Takeout zip"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Google’s full copy, including images and recordings, still comes from Takeout. Choose only Keep, then drop the zip here. HTML and JSON from that folder work as well."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									onDragOver: (event) => {
										event.preventDefault();
										setDragOver(true);
									},
									onDragLeave: () => setDragOver(false),
									onDrop: (event) => {
										event.preventDefault();
										setDragOver(false);
										ingestFiles([...event.dataTransfer.files]);
									},
									className: dragOver ? "mt-3 rounded-2xl border border-accent bg-paper px-4 py-6 text-sm" : "mt-3 rounded-2xl border border-line bg-paper px-4 py-6 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted",
											children: busy ? "Reading notes…" : "Drop a zip, HTML, or JSON file."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => fileRef.current?.click(),
											className: "mt-3 h-11 rounded-lg bg-accent px-4 text-sm font-medium text-accent-fg",
											children: "Choose files"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileRef,
											type: "file",
											multiple: true,
											accept: ".zip,.json,.html,.htm,.csv,.txt,application/zip,application/json,text/html",
											className: "sr-only",
											onChange: (event) => void ingestFiles([...event.target.files ?? []])
										})
									]
								})
							]
						})
					]
				})]
			}),
			warnings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				className: "mt-4 rounded-2xl bg-card px-4 py-3 text-sm text-ink shadow-border",
				children: warnings.map((warning) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warning }, warning))
			}) : null,
			notes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				"aria-label": "Notes ready to export",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-2xl font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: visible.length
							}), " notes"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [origin === "sample" ? "Sample notes, not your Keep account." : origin === "paste" ? "From what you pasted." : "From the files you opened.", hiddenTrash > 0 && !showTrash ? ` ${hiddenTrash} in trash are hidden.` : ""]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setNotes([]);
								setOrigin(null);
								setWarnings([]);
							},
							className: "h-11 text-sm font-medium text-muted",
							children: "Clear"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "relative min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sr-only",
										children: "Search notes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "pointer-events-none absolute top-3 left-3 size-5 text-faint",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: "Search titles, text, labels",
										className: "h-11 w-full rounded-lg border border-line bg-card pr-3 pl-10"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex h-11 items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showArchived,
									onChange: (event) => setShowArchived(event.target.checked),
									className: "size-4"
								}), "Archived"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex h-11 items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: showTrash,
									onChange: (event) => setShowTrash(event.target.checked),
									className: "size-4"
								}), "Trash"]
							})
						]
					}),
					tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setTag(null),
							className: tag === null ? "h-11 rounded-lg bg-accent px-3 text-sm text-accent-fg" : "h-11 rounded-lg bg-chip px-3 text-sm",
							children: "All labels"
						}), tags.map(([label, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTag((current) => current === label ? null : label),
							className: tag === label ? "h-11 rounded-lg bg-accent px-3 text-sm text-accent-fg" : "h-11 rounded-lg bg-chip px-3 text-sm",
							children: [
								label,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: tag === label ? "tabular-nums" : "tabular-nums text-faint",
									children: count
								})
							]
						}, label))]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-4 lg:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "overflow-hidden rounded-3xl bg-card shadow-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-line px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm font-medium",
									onClick: () => setSelected(new Set(visible.map((note) => note.id))),
									children: "Select all"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm font-medium text-muted",
									onClick: () => setSelected(/* @__PURE__ */ new Set()),
									children: "Select none"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "max-h-[32rem] overflow-auto",
								children: visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "px-4 py-6 text-sm text-muted",
									children: "No notes match."
								}) : visible.map((note) => {
									const on = note.id === active?.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: on ? "bg-paper" : "bg-card",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start gap-3 border-b border-line px-4 py-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "mt-1 size-4",
												checked: selected.has(note.id),
												"aria-label": `Include ${displayTitle(note)}`,
												onChange: (event) => {
													setSelected((current) => {
														const next = new Set(current);
														if (event.target.checked) next.add(note.id);
														else next.delete(note.id);
														return next;
													});
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setActiveId(note.id),
												className: "min-w-0 flex-1 text-left",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-2 font-medium",
													children: [
														note.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
															className: "size-4 shrink-0",
															"aria-label": "Pinned"
														}) : null,
														note.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, {
															className: "size-4 shrink-0",
															"aria-label": "Archived"
														}) : null,
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "truncate",
															children: displayTitle(note)
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 line-clamp-2 block text-sm text-muted",
													children: notePlain(note) || "Empty note"
												})]
											})]
										})
									}, note.id);
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
							className: "rounded-3xl bg-card p-4 shadow-border sm:p-6",
							children: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-2xl font-medium",
									children: displayTitle(active)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: [
										active.tags.join(", "),
										active.pinned ? "Pinned" : "",
										active.archived ? "Archived" : "",
										active.created?.slice(0, 10) ?? ""
									].filter(Boolean).join(" · ") || "No labels"
								}),
								active.items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 space-y-2",
									children: active.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-base",
										children: [
											item.checked ? "[x]" : "[ ]",
											" ",
											item.text
										]
									}, `${item.checked}-${item.text}`))
								}) : null,
								active.body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 whitespace-pre-wrap",
									children: active.body
								}) : null,
								active.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 text-sm text-muted",
									children: active.attachments.map((attachment) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: attachment.name }, attachment.name))
								}) : null
							] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "Select a note to preview it."
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky bottom-0 mt-4 flex flex-col gap-2 bg-paper py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: chosen.length === 0,
								onClick: () => exportChosen("enex"),
								className: "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-medium text-accent-fg disabled:opacity-40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										className: "size-5",
										"aria-hidden": "true"
									}),
									"Download Evernote (.enex)",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "tabular-nums",
										children: [
											"(",
											chosen.length,
											")"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-5",
								children: [
									["md", "Markdown"],
									["zip", "Folder"],
									["json", "JSON"],
									["csv", "CSV"],
									["txt", "Text"]
								].map(([kind, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: chosen.length === 0,
									onClick: () => exportChosen(kind),
									className: "h-11 rounded-lg bg-chip text-sm font-medium disabled:opacity-40",
									children: label
								}, kind))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "Evernote import: File, then Import, then Evernote export files. Pinned and archived notes become tags."
							})
						]
					})
				]
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeepApp, {});
}
//#endregion
export { Home as component };
