const MONTHS = new Map<string, number>();

function addMonths(month: number, names: string[]) {
  for (const name of names) MONTHS.set(name.toLowerCase(), month);
}

addMonths(1, ["jan", "january", "januar", "janvier", "enero", "janeiro", "gennaio", "januari", "ene", "gen", "sty", "янв", "января", "oca", "led"]);
addMonths(2, ["feb", "february", "februar", "février", "fevrier", "febrero", "fevereiro", "febbraio", "februari", "lut", "фев", "февраля", "şub", "sub", "úno", "uno"]);
addMonths(3, ["mar", "march", "märz", "marz", "mars", "marzo", "março", "marco", "maart", "mrt", "mär", "мар", "марта", "mar", "bře", "bre"]);
addMonths(4, ["apr", "april", "avril", "abril", "aprile", "kwi", "апр", "апреля", "nis", "dub"]);
addMonths(5, ["may", "mai", "mayo", "maio", "maggio", "mei", "maj", "мая", "mayıs", "mayis", "kvě", "kve"]);
addMonths(6, ["jun", "june", "juni", "juin", "junio", "junho", "giugno", "cze", "июн", "июня", "haz", "čvn", "cvc"]);
addMonths(7, ["jul", "july", "juli", "juillet", "julio", "julho", "luglio", "lip", "июл", "июля", "tem", "čvc"]);
addMonths(8, ["aug", "august", "août", "aout", "agosto", "augustus", "sie", "авг", "августа", "ağu", "agu", "srp"]);
addMonths(9, ["sep", "sept", "september", "septembre", "septiembre", "setembro", "settembre", "wrz", "сен", "сентября", "eyl", "zář", "zar"]);
addMonths(10, ["oct", "october", "oktober", "octobre", "octubre", "outubro", "ottobre", "okt", "paź", "paz", "окт", "октября", "eki", "říj", "rij"]);
addMonths(11, ["nov", "november", "novembre", "noviembre", "novembro", "novembre", "lis", "ноя", "ноября", "kas", "lis"]);
addMonths(12, ["dec", "december", "dezember", "décembre", "decembre", "diciembre", "dezembro", "dicembre", "dez", "gru", "дек", "декабря", "ara", "pro"]);

function monthNum(raw: string): number | null {
  const token = raw.toLowerCase().replace(/\./g, "").replace(/[^a-zà-ÿа-яёışğüç]/gi, "");
  if (!token) return null;
  if (MONTHS.has(token)) return MONTHS.get(token) ?? null;
  const three = token.slice(0, 3);
  if (MONTHS.has(three)) return MONTHS.get(three) ?? null;
  const four = token.slice(0, 4);
  if (MONTHS.has(four)) return MONTHS.get(four) ?? null;
  return null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Keep Takeout prints the clock time without a zone. Store that clock as UTC so it does not shift. */
export function parseKeepDate(input: string): string | null {
  const original = input.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  if (!original) return null;

  const time = /(\d{1,2})\s*[:h時]\s*(\d{2})(?:\s*[:m分]\s*(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|오전|오후|上午|下午|午前|午後)?/i.exec(
    original,
  );
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
  } else {
    return null;
  }

  if (y < 1970 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${pad(m)}-${pad(d)}T${pad(hour)}:${pad(minute)}:${pad(second)}.000Z`;
}

export function evernoteStamp(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}
