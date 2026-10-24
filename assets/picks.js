/* Mark's recommended products ("My Picks"), shown on picks.html.
   To change the shop, edit this one file:
   - STORE_URL: your Amazon storefront link (amazon.com/shop/...). Leave "" to hide the "Visit my Amazon store" button.
   - TAG: your Amazon Associates tracking ID (looks like "marktalks-20"). Added to every link so purchases earn commission.
   - DOMAIN: "www.amazon.com" (US) or "www.amazon.ca" (Canada), etc.
   - Each pick: either an exact product link ("url": "https://www.amazon.com/dp/XXXXXXXXXX")
     or, until you've chosen the exact product, a search ("search": "words to search").
   Sections follow the seven pillars. */
window.MTH_PICKS = {
  STORE_URL: "",
  TAG: "",
  DOMAIN: "www.amazon.com",
  sections: [
    { key: "sleep", title: "Sleep & <em>clean air</em>", note: "Deep sleep and clean air are where repair happens.", picks: [
      { name: "Contoured sleep mask", why: "Total darkness, even with the morning light coming in.", search: "contoured blackout sleep mask" },
      { name: "Foam ear plugs", why: "Quiet nights, even with a snoring partner or a noisy street.", search: "soft foam ear plugs for sleeping" },
      { name: "Room-size HEPA air purifier", why: "True HEPA filters trap 99.97% of fine particles like dust, pollen and smoke.", search: "true HEPA air purifier bedroom" },
    ] },
    { key: "move", title: "Cardio & <em>weights</em>", note: "Simple gear for the movement days in your protocol.", picks: [
      { name: "Exercise bike", why: "Easy, joint-friendly cardio at home, any weather.", search: "stationary exercise bike home" },
      { name: "Hand weights", why: "A pair of dumbbells covers most of the strength days.", search: "neoprene dumbbells set" },
    ] },
  ],
};

window.MTH_PICKS.link = function (p) {
  var P = window.MTH_PICKS;
  if (p.internal) return p.url;
  var u = p.url || ("https://" + (P.DOMAIN || "www.amazon.com") + "/s?k=" + encodeURIComponent(p.search || p.name));
  if (P.TAG && /amazon\./.test(u)) u += (u.indexOf("?") >= 0 ? "&" : "?") + "tag=" + encodeURIComponent(P.TAG);
  return u;
};
