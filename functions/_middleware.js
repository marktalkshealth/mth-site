/* Cloudflare Pages middleware: "Markdown for Agents", done in-house (Cloudflare's version needs the Pro plan).
   When an AI agent asks for a page with `Accept: text/markdown`, it gets a clean Markdown copy of the page
   (title, description, headings, text, lists, links) instead of the full HTML with styles and scripts.
   Ordinary visitors and search engines are untouched: anything that does not ask for Markdown passes straight through. */

const PRIVATE = /^\/(admin|live|account|welcome|login|course|app|community|checkin|snapshot|library|go|hub|total\/|gut\/|sugar\/|glp1\/|unsubscribe|assets|media|functions)/;

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

/* Pre-render: the home and sales pages keep their content in <template id="design"> and only put it on the page
   after the site has loaded (MTH.ready, which waits on the database). Search engines, AI bots, and visitors on a slow
   connection would see an almost empty page. Here we copy the template's content (minus its scripts) straight into
   <main id="page"> before the page leaves the server, so the full text is there on the first load.
   The page's own script still runs as before: it clears <main> and mounts the live, interactive version. */
export function prerender(html) {
  const open = '<template id="design">';
  const i = html.indexOf(open);
  if (i === -1) return html;
  const j = html.indexOf("</template>", i);
  const m = html.match(/<main id="page">([\s\S]*?)<\/main>/);
  if (j === -1 || !m || m[1].length > 400) return html;      // already has real content: leave it alone
  const design = html.slice(i + open.length, j).replace(/<script\b[\s\S]*?<\/script>/gi, "");
  // fade-in-on-scroll blocks (.rv) start invisible until the live script runs: show them in the pre-rendered copy
  const show = "<style>#page[data-prerendered] .rv{opacity:1!important;transform:none!important}</style>";
  return html.replace(m[0], '<main id="page" data-prerendered="1">' + show + design + "</main>");
}

/* Plain site links for search engines and AI bots. The real header and footer are drawn by the site's script,
   which most AI bots never run, so without this a bot landing on a page finds almost no links to follow.
   The site's script removes this block the moment it draws the real header and footer (M.chrome in mth.js).
   Sign-up-flow pages (mx-bare: quizzes, guides) are left alone so nothing distracts from the form. */
const CRAWL_LINKS = [["/", "Home"], ["/protocols", "Courses"], ["/total", "Total Body Healing System"], ["/gut", "Gut Health Protocol"],
  ["/diabetes", "Diabetes Protocol"], ["/glp1", "GLP-1 Weight Loss Protocol"], ["/assessment", "Free Healing Assessment"],
  ["/healing", "How Healing Works"], ["/blog/", "Blog"], ["/picks", "My Picks"], ["/partners", "Work with me"],
  ["/privacy", "Privacy"], ["/terms", "Terms"], ["/refunds", "Refunds"]];
export function crawlNav(html) {
  if (!/assets\/mth\.js/.test(html) || /mx-bare/.test(html.slice(0, 600)) || html.includes('class="mx-crawl"')) return html;
  const k = html.lastIndexOf("</body>");
  if (k === -1) return html;
  const nav = '<nav class="mx-crawl" aria-label="Site">' + CRAWL_LINKS.map((l) => `<a href="${l[0]}">${l[1]}</a>`).join("") + "</nav>\n";
  return html.slice(0, k) + nav + html.slice(k);
}

export async function onRequest(context) {
  const { request } = context;
  const accept = request.headers.get("accept") || "";
  const url = new URL(request.url);
  if (request.method !== "GET" || PRIVATE.test(url.pathname)) return context.next();
  if (!/text\/markdown/i.test(accept)) {
    const res = await context.next();
    if (res.status !== 200 || !/text\/html/i.test(res.headers.get("content-type") || "")) return res;
    const html = await res.text();
    const out = crawlNav(prerender(html));
    const headers = new Headers(res.headers); headers.delete("content-length");
    return new Response(out, { status: 200, headers });
  }
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
