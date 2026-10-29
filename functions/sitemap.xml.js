/* Cloudflare Pages Function: /sitemap.xml, the site's public pages plus every live blog article. */
import { SITE, fetchPosts } from "../assets/blog-render.mjs";

const PAGES = [["/", "1.0"], ["/blog/", "0.8"], ["/protocols", "0.8"], ["/gut", "0.9"], ["/diabetes", "0.8"], ["/glp1", "0.8"],
  ["/healing", "0.7"], ["/picks", "0.5"], ["/partners", "0.4"], ["/privacy", "0.2"], ["/terms", "0.2"], ["/refunds", "0.2"]];

export async function onRequestGet() {
  let posts = [];
  try { posts = await fetchPosts(fetch, "select=slug,updated_at&status=eq.published"); } catch (e) {}
  const u = (loc, pri, mod) => "<url><loc>" + SITE + loc + "</loc>" + (mod ? "<lastmod>" + String(mod).slice(0, 10) + "</lastmod>" : "") + (pri ? "<priority>" + pri + "</priority>" : "") + "</url>";
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    PAGES.map(p => u(p[0], p[1])).join("") + posts.map(p => u("/blog/" + p.slug + "/", "0.7", p.updated_at)).join("") + "</urlset>";
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=300" } });
}
