/* Cloudflare Pages middleware: "Markdown for Agents", done in-house (Cloudflare's version needs the Pro plan).
   When an AI agent asks for a page with `Accept: text/markdown`, it gets a clean Markdown copy of the page
   (title, description, headings, text, lists, links) instead of the full HTML with styles and scripts.
   Ordinary visitors and search engines are untouched: anything that does not ask for Markdown passes straight through. */

const PRIVATE = /^\/(admin|account|welcome|login|course|app|community|checkin|snapshot|library|go|hub|gut\/|sugar\/|glp1\/|unsubscribe|assets|media|functions)/;

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", larr: "←", mdash: "—", ndash: "–", middot: "·", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", copy: "©", times: "×", check: "✓" };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === "#") { const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENT[e.toLowerCase()] ?? m;
});
const meta = (html, re) => { const m = html.match(re); return m ? decode(m[1]).trim() : ""; };

export function htmlToMarkdown(html, url) {
  const title = meta(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = meta(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  let body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1];
  body = body
    .replace(/<(script|style|noscript|svg|iframe|canvas|video|audio|select)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(nav|footer)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?template\b[^>]*>/gi, "")
    ;
  body = body
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, n, t) => `\n\n${"#".repeat(Number(n))} ${t.replace(/<[^>]+>/g, " ").trim()}\n\n`)
    .replace(/<a\b[^>]*href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, h, t) => {
      const txt = t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!txt) return "";
      let href = h; try { href = new URL(decode(h), url).toString(); } catch (_) { /* keep as is */ }
      return /^(javascript|mailto|tel):/i.test(href) ? txt : `[${txt}](${href})`;
    })
    .replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|section|article|header|main|ul|ol|li|table|tr|blockquote|figure|figcaption|h[1-6])>/gi, "\n")
    .replace(/<(td|th)\b[^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ");
  let text = decode(body)
    .split("\n").map((l) => l.replace(/[ \t ]+/g, " ").trim()).join("\n")
    .replace(/\*\*\s*\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const head = [`# ${title || "Mark Talks Health"}`, desc ? `> ${desc}` : "", `Source: ${url}`].filter(Boolean).join("\n\n");
  // drop a repeated top heading identical to the title
  text = text.replace(new RegExp("^#\\s+" + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\n"), "");
  return `${head}\n\n${text}\n`;
}

export async function onRequest(context) {
  const { request } = context;
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);
  if (request.method !== "GET" || !/text\/markdown/i.test(accept) || PRIVATE.test(url.pathname)) return context.next();
  // ask the rest of the site for the normal HTML page
  const htmlReq = new Request(request.url, { headers: { accept: "text/html" } });
  const res = await context.next(htmlReq);
  const type = res.headers.get("content-type") || "";
  if (res.status !== 200 || !/text\/html/i.test(type)) return res;
  const md = htmlToMarkdown(await res.text(), url.origin + url.pathname);
  return new Response(md, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "vary": "Accept",
      "cache-control": "no-cache",
      "x-markdown-tokens": String(Math.ceil(md.length / 4)),
    },
  });
}
