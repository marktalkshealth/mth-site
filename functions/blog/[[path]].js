/* Cloudflare Pages Function: draws the blog from Supabase.
   /blog/         -> list of live articles
   /blog/<slug>/  -> one article
   Articles are written in Admin -> Edit -> Blog; a Save shows here within a minute. */
import { articlePage, indexPage, notFoundPage, fetchPosts, LIST_COLS } from "../../assets/blog-render.mjs";

const html = (body, status, maxAge) => new Response(body, { status: status || 200, headers: {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=0, s-maxage=" + (maxAge == null ? 60 : maxAge)
}});

export async function onRequestGet({ params, request, next }) {
  const parts = [].concat(params.path || []).filter(Boolean);
  const url = new URL(request.url);
  /* static files under /blog (pictures etc.) */
  if (parts.length && /\.[a-z0-9]{2,5}$/i.test(parts[parts.length - 1])) return next();
  if (parts.length > 1) return next();
  if (!url.pathname.endsWith("/")) return Response.redirect(url.origin + url.pathname + "/" + url.search, 301);
  try {
    if (!parts.length) {
      const posts = await fetchPosts(fetch, "select=" + LIST_COLS + "&status=eq.published&order=published_at.desc.nullslast");
      return html(indexPage(posts));
    }
    const slug = parts[0].toLowerCase();
    const one = await fetchPosts(fetch, "select=*&status=eq.published&slug=eq." + encodeURIComponent(slug) + "&limit=1");
    if (!one.length) return html(notFoundPage(), 404, 30);
    const more = await fetchPosts(fetch, "select=" + LIST_COLS + "&status=eq.published&slug=neq." + encodeURIComponent(slug) + "&order=published_at.desc.nullslast&limit=3");
    return html(articlePage(one[0], more));
  } catch (e) {
    return html("<!doctype html><title>Blog</title><p>The blog is taking a breather. Please try again in a minute.</p>", 503, 0);
  }
}
