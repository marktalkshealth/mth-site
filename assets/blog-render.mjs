/* =================================================================
   MARK TALKS HEALTH — BLOG PAGES
   One file draws every blog page, so the live site and the preview in
   Admin -> Edit -> Blog always look the same.
   - the website: functions/blog/[[path]].js imports it and sends real
     HTML (good for Google), straight from Supabase, so a Save is live.
   - the admin editor: import()s it to show the preview.
   Article = plain title, the study (PubMed screenshot + citation +
   link), a few paragraphs, and a small course link at the end.
================================================================= */
export const SITE = "https://marktalkshealth.com";
export const SUPABASE = { url: "https://oihefcsonqjeicelezln.supabase.co", key: "sb_publishable_vxaKCnn-2XlvV7MmoV3wqg_dxgdqtz2" };
export const COURSES = {
  gut:   { name: "The Gut Health Protocol", url: "/gut" },
  sugar: { name: "The Diabetes Protocol", url: "/diabetes" },
  glp1:  { name: "The GLP-1 Weight Loss Protocol", url: "/glp1" }
};
const V = "202610291900";

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* only simple formatting in articles: paragraphs, bold, italic, links, line breaks */
export function cleanBody(html) {
  let h = String(html || "");
  h = h.replace(/<(script|style|iframe|object|embed|template|form)[\s\S]*?<\/\1>/gi, "");
  h = h.replace(/<\s*(\/?)\s*(div|h[1-6]|li|blockquote)\b[^>]*>/gi, (m, close) => close ? "</p>" : "<p>");
  h = h.replace(/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/gi, (m, close, tag, attrs) => {
    tag = tag.toLowerCase();
    if (tag === "strong") tag = "b";
    if (tag === "em") tag = "i";
    if (!/^(p|b|i|a|br)$/.test(tag)) return "";
    if (close) return tag === "br" ? "" : "</" + tag + ">";
    if (tag === "a") {
      const m2 = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      let href = m2 ? (m2[2] || m2[3] || m2[4] || "") : "";
      href = href.replace(/&amp;/g, "&").trim();
      if (!/^(https?:\/\/|\/|mailto:)/i.test(href)) return "<a>";
      const ext = /^https?:\/\//i.test(href) && !href.startsWith(SITE);
      return '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">";
    }
    return "<" + tag + ">";
  });
  h = h.replace(/<p>\s*(<br>\s*)*<\/p>/gi, "").replace(/(<p>\s*){2,}/gi, "<p>").replace(/(<\/p>\s*){2,}/gi, "</p>");
  if (h.trim() && !/^\s*<p>/i.test(h)) h = "<p>" + h;
  if (h.trim() && !/<\/p>\s*$/i.test(h)) h = h + "</p>";
  return h.trim();
}

export function plainText(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
}
export function summary(post, n) {
  if (post.description) return post.description;
  const t = plainText(post.body); n = n || 155;
  return t.length > n ? t.slice(0, t.lastIndexOf(" ", n - 1)) + "…" : t;
}
export function niceDate(d) {
  if (!d) return "";
  const x = new Date(d); if (isNaN(x)) return "";
  return x.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
export function readMins(post) { return Math.max(1, Math.round(plainText(post.body).split(" ").length / 230)); }
export function slugify(t) {
  return String(t || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "") || "article";
}

/* the study box: the PubMed screenshot (or a tidy citation card), the citation and a link */
export function studyBox(p) {
  if (!p.study_url && !p.study_title && !p.study_cite && !p.study_img) return "";
  const url = p.study_url ? esc(p.study_url) : "";
  const pub = /pubmed|ncbi\.nlm\.nih\.gov/i.test(p.study_url || "");
  const shot = p.study_img
    ? '<img src="' + esc(p.study_img) + '" alt="' + esc(pub ? "The study on PubMed" : "The study") + '" loading="lazy">'
    : '<span class="bs-card" aria-hidden="true"><small>' + (pub ? "PubMed" : "The study") + '</small><b>' + esc(p.study_title || p.title) + '</b><i>' + esc(p.study_cite || "") + '</i></span>';
  const open = url ? '<a class="bs-shot" href="' + url + '" target="_blank" rel="noopener">' : '<span class="bs-shot">';
  return '<aside class="bs" aria-label="The study">' + open + shot + (url ? "</a>" : "</span>") +
    '<div class="bs-tx"><span class="bs-k">The study</span>' +
    (p.study_title ? '<p class="bs-t">' + esc(p.study_title) + '</p>' : "") +
    (p.study_cite ? '<p class="bs-c">' + esc(p.study_cite) + '</p>' : "") +
    (url ? '<a class="bs-a" href="' + url + '" target="_blank" rel="noopener">' + (pub ? "Read it on PubMed" : "Read the study") + ' →</a>' : "") +
    "</div></aside>";
}

function head(o) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<base href="/">\n<title>' + esc(o.title) + '</title>\n<meta name="description" content="' + esc(o.desc) + '">\n' +
    '<link rel="canonical" href="' + esc(o.url) + '">\n' + (o.noindex ? '<meta name="robots" content="noindex">\n' : "") +
    '<meta property="og:type" content="' + (o.article ? "article" : "website") + '">\n<meta property="og:site_name" content="Mark Talks Health">\n' +
    '<meta property="og:title" content="' + esc(o.ogTitle || o.title) + '">\n<meta property="og:description" content="' + esc(o.desc) + '">\n' +
    '<meta property="og:url" content="' + esc(o.url) + '">\n<meta property="og:image" content="' + esc(o.image || SITE + "/blog/img/blog.jpg") + '">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n<meta name="theme-color" content="#f7f1e7">\n' +
    '<link rel="icon" href="/assets/app-icon-192.png">\n<link rel="apple-touch-icon" href="/assets/app-icon-180.png">\n' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\n' +
    '<link rel="stylesheet" href="/assets/mth.css?v=' + V + '">\n<link rel="stylesheet" href="/assets/blog.css?v=' + V + '">\n' +
    (o.ld ? '<script type="application/ld+json">' + JSON.stringify(o.ld).replace(/</g, "\\u003c") + "</script>\n" : "") +
    '<script src="/assets/vendor/supabase-2.118.0.js"></script>\n<script src="/assets/mth.js?v=' + V + '"></script>\n</head>\n';
}

/* one article page. opts.preview = drawn inside the admin editor (no site header) */
export function articleBody(p) {
  const date = p.published_at || p.updated_at || p.created_at;
  const c = COURSES[p.cta];
  return '<article class="bl" data-noedit>' +
    '<p class="bl-meta"><a href="/blog/">The Blog</a>' + (date ? ' · <time datetime="' + esc(new Date(date).toISOString().slice(0, 10)) + '">' + esc(niceDate(date)) + "</time>" : "") + ' · ' + readMins(p) + ' min read</p>' +
    '<h1 class="bl-t">' + esc(p.title || "Untitled") + "</h1>" +
    (p.cover_img ? '<img class="bl-cover" src="' + esc(p.cover_img) + '" alt="">' : "") +
    studyBox(p) +
    '<div class="bl-body">' + cleanBody(p.body) + "</div>" +
    (c ? '<p class="bl-cta">If you want help putting this into practice, <a href="' + c.url + '?utm_source=blog&amp;utm_medium=article&amp;utm_campaign=' + esc(p.slug) + '">' + esc(c.name) + "</a> is where I walk you through it.</p>" : "") +
    '<p class="bl-fine">Written by Mark, health educator at Mark Talks Health. Educational, not medical advice: talk to your healthcare provider before changing your diet, fasting or medication.</p>' +
    "</article>";
}

export function articlePage(p, more) {
  const url = SITE + "/blog/" + p.slug + "/";
  const desc = summary(p);
  const date = p.published_at || p.updated_at;
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: desc, url: url, mainEntityOfPage: url,
    datePublished: date, dateModified: p.updated_at || date, author: { "@type": "Person", name: "Mark", url: SITE + "/" },
    publisher: { "@type": "Organization", name: "Mark Talks Health", url: SITE + "/" },
    image: p.cover_img || p.study_img || SITE + "/blog/img/blog.jpg",
    citation: p.study_title ? { "@type": "ScholarlyArticle", name: p.study_title, url: p.study_url || undefined } : undefined
  };
  const others = (more || []).filter(x => x.slug !== p.slug).slice(0, 3);
  return head({ title: p.title + " · Mark Talks Health", ogTitle: p.title, desc, url, article: true, image: p.cover_img || p.study_img, ld }) +
    '<body class="blog">\n<main id="main" class="bl-wrap">' + articleBody(p) +
    (others.length ? '<nav class="bl-more" aria-label="More articles" data-noedit><h2>More from the blog</h2>' + others.map(listItem).join("") + "</nav>" : "") +
    "</main>\n</body>\n</html>";
}

function listItem(p) {
  const date = p.published_at || p.updated_at;
  return '<a class="bl-item" href="/blog/' + esc(p.slug) + '/"><span class="bl-d">' + esc(niceDate(date)) + "</span><b>" + esc(p.title) + "</b><span>" + esc(summary(p, 150)) + "</span></a>";
}

export function indexPage(posts) {
  const url = SITE + "/blog/";
  const desc = "Gut health, fasting and natural healing research, explained in plain English. Every article is built around a real study you can read for yourself.";
  return head({ title: "The Blog · Mark Talks Health", desc, url, ld: { "@context": "https://schema.org", "@type": "Blog", name: "The Mark Talks Health Blog", url } }) +
    '<body class="blog">\n<main id="main" class="bl-wrap" data-noedit><header class="bl-home"><div class="kick">The Blog</div><h1 class="t">Research, <em>explained</em></h1>' +
    '<p class="lead">Each article takes one real study and explains what it found and what it means for you.</p></header>' +
    (posts.length ? '<div class="bl-list">' + posts.map(listItem).join("") + "</div>" : '<p class="muted">The first articles are on their way.</p>') +
    "</main>\n</body>\n</html>";
}

export function notFoundPage() {
  return head({ title: "Article not found · Mark Talks Health", desc: "That article isn't here.", url: SITE + "/blog/", noindex: true }) +
    '<body class="blog">\n<main id="main" class="bl-wrap" data-noedit><h1 class="t">That article <em>isn’t here</em></h1><p class="lead">It may have moved. <a href="/blog/">See all articles</a>.</p></main>\n</body>\n</html>';
}

/* Supabase reads (public: only live articles are visible) */
export async function fetchPosts(fetchFn, query) {
  const r = await fetchFn(SUPABASE.url + "/rest/v1/mth_blog_posts?" + query, { headers: { apikey: SUPABASE.key } });
  if (!r.ok) throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 300));
  return r.json();
}
export const LIST_COLS = "slug,title,description,body,published_at,updated_at";
