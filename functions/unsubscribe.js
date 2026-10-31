/* Cloudflare Pages Function: /unsubscribe — on your own domain, so emails never link to a strange address.
   GET  /unsubscribe?t=TOKEN               → a page with one button (link scanners can't unsubscribe people by accident)
   POST /unsubscribe?t=TOKEN               → Gmail / Yahoo one-click unsubscribe (body "List-Unsubscribe=One-Click"), or the button
   POST /unsubscribe?t=TOKEN  resub=1      → "I changed my mind" puts them back on the list
   The real work happens in the Supabase mth-mail function. */
const ENGINE = "https://oihefcsonqjeicelezln.supabase.co/functions/v1/mth-mail";
const TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title, body, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${title} · Mark Talks Health</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--cream:#f7f1e7;--card:#fffdf8;--ink:#2b2724;--muted:#6f665d;--line:#e7dccb;--terra:#c0623f;--gold:#b8924a}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--cream);color:var(--ink);font:16px/1.6 Inter,system-ui,sans-serif;padding:24px 16px}
.k{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:14px;text-align:center}
.box{max-width:460px;width:100%;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:34px 28px;text-align:center}
h1{font:600 34px/1.15 "Cormorant Garamond",Georgia,serif;margin:0 0 12px}p{color:var(--muted);margin:0 0 20px}
button,a.b{display:inline-block;border:0;border-radius:999px;background:var(--terra);color:#fff;font:600 16px Inter,sans-serif;padding:14px 26px;cursor:pointer;text-decoration:none}
button.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}form{margin:0 0 10px}
</style></head><body><div><div class="k">Mark Talks Health</div><div class="box">${body}</div></div></body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

async function engine(token, resub) {
  try {
    const r = await fetch(ENGINE, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "unsub", token, resub: !!resub }) });
    return r.ok ? await r.json() : { ok: false };
  } catch (e) { return { ok: false }; }
}

const form = (t, resub, label, ghost) => `<form method="post" action="/unsubscribe?t=${t}">${resub ? '<input type="hidden" name="resub" value="1">' : ""}<button${ghost ? ' class="ghost"' : ""}>${label}</button></form>`;

export async function onRequestGet({ request }) {
  const t = new URL(request.url).searchParams.get("t") || "";
  if (!TOKEN.test(t)) return page("Unsubscribe", `<h1>Unsubscribe</h1><p>Please use the unsubscribe link at the bottom of any of my emails, and you’ll be taken off the list right away.</p><a class="b" href="/">Back to the site</a>`);
  return page("Unsubscribe", `<h1>Stop the emails?</h1><p>Tap below and you won’t get any more Mark Talks Health emails. No hard feelings.</p>${form(t, false, "Unsubscribe me")}<p style="margin-top:16px;font-size:14px">Changed your mind? Just close this page.</p>`);
}

export async function onRequestPost({ request }) {
  const t = new URL(request.url).searchParams.get("t") || "";
  if (!TOKEN.test(t)) return new Response("bad link", { status: 400 });
  const raw = await request.text();
  const oneClick = /List-Unsubscribe=One-Click/i.test(raw);
  const resub = !oneClick && /(^|&)resub=1(&|$)/.test(raw);
  const r = await engine(t, resub);
  if (oneClick) return new Response("unsubscribed", { status: r.ok ? 200 : 202 });
  if (resub) return page("Welcome back", `<h1>You’re back on the list</h1><p>Thanks for staying. You’ll get my next email as usual.</p><a class="b" href="/">Visit the site</a>`);
  return page("Unsubscribed", `<h1>You’re unsubscribed</h1><p>${r.email ? `<b>${r.email}</b> won’t get` : "You won’t get"} any more Mark Talks Health emails. If you bought a program, you can still sign in and use it as normal.</p>${form(t, true, "Oops, put me back on the list", true)}<a class="b" href="/" style="margin-top:6px">Back to the site</a>`);
}
