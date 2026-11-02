/* =================================================================
   MEMBER NAV — the Facebook-style frame shared by members' pages:
   a top bar (section name, search, Companion, account) and the five tabs
   Home · Courses · Heal · Community · Blog (bottom on phones, top on wider screens).
   Pages that draw their own content call MTHNav.mount("courses") after sign-in.
   To rename a tab or change where it goes, edit TABS below.
   ================================================================= */
(function () {
  var M = window.MTH;
  var I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    courses: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    heal: '<path d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z"/><path d="M8 12h2.5l1.5-3 2 5 1.5-2H17"/>',
    community: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5"/>',
    blog: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }

  /* links follow the member's own protocol */
  function links() {
    var P = { course: "course.html?p=gut", app: "app.html?p=gut" };
    try {
      var k = M.owned && M.owned.length ? (M.owns(M.product()) ? M.product() : M.owned[0]) : "gut";
      P = M.config.products[k] || P;
    } catch (e) {}
    return P;
  }
  var TABS = [
    ["home", "Home", "community.html#home"],
    ["courses", "Courses", "#course"],
    ["heal", "Heal", "#app"],
    ["community", "Community", "community.html#community"],
    ["blog", "Blog", "/blog/"]
  ];
  function href(t) { var P = links(); return t[2] === "#course" ? P.course : t[2] === "#app" ? P.app : t[2]; }

  function tabs(active, bottom) {
    return TABS.map(function (t) {
      var on = t[0] === active;
      return '<a class="cm-tab' + (on ? " on" : "") + '" href="' + M.esc(href(t)) + '"' + (on ? ' aria-current="page"' : "") + '>' +
        (bottom ? ic(t[0]) : "") + '<span>' + t[1] + '</span></a>';
    }).join("");
  }
  function initial(o) {
    if (o && o.initial) return o.initial;
    var e = (M.user && M.user.email) || "";
    return (e.charAt(0) || "?").toUpperCase();
  }
  function word(active) {
    var t = TABS.filter(function (x) { return x[0] === active; })[0];
    return (t ? t[1] : "Home").toLowerCase();
  }

  window.MTHNav = {
    tabs: TABS,
    top: function (active, o) {
      return '<header class="cm-top">' +
        '<a class="cm-word" href="community.html#home">' + M.esc((o && o.word) || word(active)) + '</a>' +
        '<label for="cmSearch" class="cm-sr">Search</label>' +
        '<input id="cmSearch" class="cm-search" placeholder="Search posts, lessons, recipes">' +
        '<nav class="cm-tabs" aria-label="Sections">' + tabs(active, false) + '</nav>' +
        '<div class="cm-icons">' +
        '<button type="button" class="cm-ib phone" aria-label="Search">' + ic("search") + '</button>' +
        '<a class="cm-ib" href="community.html#journal" aria-label="Healing Companion journal">' + ic("chat") + '</a>' +
        '<a class="cm-ib" href="account.html" aria-label="Your account"><span class="cm-av me" aria-hidden="true">' + M.esc(initial(o)) + '</span></a>' +
        '</div></header>';
    },
    bottom: function (active) { return '<nav class="cm-bottom" aria-label="Main">' + tabs(active, true) + '</nav>'; },
    /* for pages that keep their own content: add the bar above it and the tabs below */
    mount: function (active) {
      if (document.querySelector(".cm-top")) return;
      var t = document.createElement("div"); t.innerHTML = this.top(active) + this.bottom(active);
      document.body.insertBefore(t.firstChild, document.body.firstChild);
      document.body.appendChild(t.lastChild);
      document.documentElement.classList.add("cm-framed");
    }
  };
})();
