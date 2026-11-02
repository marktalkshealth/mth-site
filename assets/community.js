/* =================================================================
   COMMUNITY APP — the members' Facebook-style home.
   Views (in the address after #): home · community · live · journal
   It uses the same data as the old Healing Hub (hub_* functions in Supabase),
   so posts, likes, comments, the live room, first-week ticks and the private
   journal all carry over. ?demo=1 shows example members, stored in this browser.

   TO REARRANGE THE HOME FEED: change HOME_ORDER below.
   "posts:2" means "the next 2 member posts".
   ================================================================= */
(function () {
  var HOME_ORDER = ["today", "posts:2", "companion", "posts:3", "live", "picks", "posts:99", "journal"];
  var STORIES = ["day", "live", "piano", "member1", "member2"];

  var M = window.MTH, esc = M.esc;
  var DEMO = /[?&]demo=1\b/.test(location.search);
  var LS = "mth_hub_v1";                       /* same storage as the old Hub, so progress carries over */
  var PROTO = { gut: "gut", sugar: "sugar", glp1: "weight" };   /* site product -> Hub protocol */
  var PNAME = { gut: "Gut Health", sugar: "Diabetes", weight: "GLP-1", total: "Total Body" };

  var me = { name: "You", avatar: "", admin: false, banned: false };
  var S = { protocol: "gut", start: null, ticks: {}, checkins: {}, journal: {} };
  var live = { is_live: false, title: "Live Healing Q&A with Mark", next: "", embed: "", link: "" };
  var member = null, ctx = {}, view = "home";
  var feed = [], openC = {}, cmts = {}, chat = [], jSel = null, journalT = null;

  /* ---------- the 7-day arc (same days and tasks as the Hub's Today tab) ---------- */
  var DAYS = [
    ["Rest & Basics", "Your cleanse begins", ["Start your cleanse", "Body-scan meditation in bed", "Calming music and prayer", "20 minutes of midday sun"]],
    ["Rest & Basics", "Settle in", ["Continue your cleanse", "Meditation and journaling", "Calming music and prayer", "Fresh air and sun"]],
    ["Gentle Restoration", "Start to move", ["Continue your cleanse", "30-minute easy walk", "Time among trees", "Meditation and morning pages"]],
    ["Gentle Restoration", "Rest and recover", ["Continue your cleanse", "Meditation and journaling", "Calming music and prayer", "Regular bedtime"]],
    ["Nature & Refeed", "Ease back into food", ["A glass of water before each small meal", "Small, simple meals", "Longer walk", "Forest time"]],
    ["Nature & Refeed", "Rebuild", ["Small protein-rich meals", "Afternoon rest", "20 minutes of midday sun", "Calming music and prayer"]],
    ["Nature & Refeed", "Ready for the full 7 steps", ["Longer walk", "Forest time", "Plan tomorrow's meals", "Weekly reflection"]]
  ];
  var JPROMPTS = [["body", "How does your body feel today?", "Energy, digestion, sleep, cravings…"], ["grateful", "Three things you're grateful for", "Small things count"],
    ["letgo", "What are you letting go of?", "A habit, a worry, a story you tell yourself"], ["win", "Today's win", "Anything you're proud of, however small"]];
  var MOODS = ["😣", "😕", "😐", "🙂", "😄"];

  /* ---------- photos: Mark's own from the site, the rest free Unsplash License photos ---------- */
  var IMG = /githack|githubusercontent|^localhost$|^127\./.test(location.hostname) ? "../site/" : "/media/site/";
  function us(id) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=900&q=70"; }
  var PHOTOS = {
    days: [us("1575487426366-079595af2247"), us("1516390118834-21602d501886"), us("1505028106030-e07ea1bd80c3"), us("1613940512699-fc9150817bb2"),
      us("1763254123615-c51d91d83b7b"), us("1597892657493-6847b9640bac"), us("1601316585772-ba1e6dae9cfc")],
    piano: us("1763254123615-c51d91d83b7b"),
    mark: IMG + "mark-kitchen.jpg"
  };
  /* rooms work like Facebook groups: a cover photo and their own feed */
  var ROOMS = [
    { key: "all", name: "All members", room: "feed", protocol: "all", photo: us("1503789597747-41de608aca69"), about: "Everyone on every protocol." },
    { key: "gut", name: "Gut Health", room: "feed", protocol: "gut", photo: us("1760368104798-63e896bdca09"), about: "Members on the Gut Health Protocol." },
    { key: "sugar", name: "Diabetes", room: "feed", protocol: "sugar", photo: us("1591189863430-ab87e120f312"), about: "Members on the Diabetes Protocol." },
    { key: "weight", name: "GLP-1", room: "feed", protocol: "weight", photo: us("1758438919146-f3f59a6d2544"), about: "Members on the GLP-1 Weight Loss Protocol." },
    { key: "wins", name: "Wins & check-ins", room: "feed", protocol: "all", wins: true, photo: us("1505028106030-e07ea1bd80c3"), about: "Daily check-ins and finished fasts." },
    { key: "qa", name: "Ask Mark", room: "qa", protocol: "all", photo: IMG + "mark-kitchen.jpg", about: "Questions about your protocol, answered by Mark." }
  ];
  var roomSel = ROOMS[0];
  function photo(url) { return ' style="background-image:url(\'' + url + '\')"'; }

  /* ---------- icons ---------- */
  var I = {
    chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12z"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    today: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    shop: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
    book: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    course: '<path d="M4 5h16v11H4zM8 20h8M12 16v4"/>',
    live: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    send: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="M8 5l12 7-12 7z"/>',
    dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
    pin: '<path d="M12 17v4M8 3h8l-1 6 3 3H6l3-3z"/>'
  };
  function ic(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }
  function av(p, cls) {
    var a = p && p.avatar ? p.avatar : "", n = p && (p.author || p.name) ? (p.author || p.name) : "?";
    return '<span class="cm-av ' + (cls || "") + (a ? " emo" : "") + '" aria-hidden="true">' + esc(a || n.charAt(0).toUpperCase()) + '</span>';
  }
  function ago(t) {
    var s = (Date.now() - new Date(t).getTime()) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + "m"; if (s < 86400) return Math.floor(s / 3600) + "h";
    if (s < 604800) return Math.floor(s / 86400) + "d";
    return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  function dayKey(d) { d = new Date(d || Date.now()); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function jKey(t) { var d = new Date(t); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function jNice(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); }
  function curDay() {
    if (!S.start) return 0;
    var a = new Date(typeof S.start === "number" ? S.start : String(S.start).replace(/-/g, "/")); a.setHours(0, 0, 0, 0);
    var b = new Date(); b.setHours(0, 0, 0, 0); return Math.floor((b - a) / 864e5) + 1;
  }
  var lsx = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function toast(t) { M.toast(t); }
  function err(e) { console.warn(e); toast(e && /slow down/.test(e.message || "") ? "You're posting fast. Try again in a few minutes." : "Couldn't reach the community. Try again."); }

  /* ================= data: the Hub's Supabase functions ================= */
  function rpc(fn, args) {
    if (DEMO) return DEMOAPI[fn](args || {});
    return fetch(M.config.supabaseUrl + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { apikey: M.config.supabaseKey, Authorization: "Bearer " + M.config.supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ p_id: member.id, p_email: member.email }, args || {}))
    }).then(function (r) { return r.text().then(function (t) { var j = t ? JSON.parse(t) : null; if (!r.ok) throw new Error((j && (j.message || j.hint)) || ("Error " + r.status)); return j; }); });
  }
  var saveT = null;
  function persist() {
    lsx.set(DEMO ? LS + "_demo_state" : LS, JSON.stringify(S));
    if (DEMO) { DEMOAPI.hub_save_state({ p_state: S }); return; }
    if (!member) return;
    clearTimeout(saveT);
    saveT = setTimeout(function () { rpc("hub_save_state", { p_state: S }).catch(function () { toast("Offline. Saved on this device for now."); }); }, 800);
  }

  /* preview: same functions, stored in this browser */
  var DEMOAPI = (function () {
    var K = "mth_cm_demo_v2", db = null;
    try { db = JSON.parse(lsx.get(K) || "null"); } catch (e) {}
    if (!db) {
      var now = Date.now(), h = 36e5;
      db = { id: 20, posts: [
        { id: 1, room: "feed", protocol: "all", day: null, kind: "announce", body: "Welcome to the community. Start with Today at the top of your home: one small set of steps a day for 7 days. Post your check-ins here and ask me anything in Ask Mark.", pinned: true, answered: false, created_at: new Date(now - 30 * h).toISOString(), author: "Mark Walker", avatar: "", is_mark: true, mine: false, likes: 12, liked: false, comments: [] },
        { id: 2, room: "feed", protocol: "gut", day: 5, kind: "checkin", body: "Day 5 · Nature & Refeed — 4 of 4 done 🙂\nTook my walk in the woods behind the school and actually slept through the night for the first time in months.", pinned: false, answered: false, created_at: new Date(now - 5 * h).toISOString(), author: "Dana L.", avatar: "🌸", is_mark: false, mine: false, likes: 14, liked: false, comments: [{ id: 3, body: "So happy for you!", author: "Tom B.", avatar: "🌊", is_mark: false, mine: false, created_at: new Date(now - 4 * h).toISOString() }] },
        { id: 4, room: "feed", protocol: "sugar", day: 1, kind: "fast", body: "Finished a 16-hour fast ⏱️\nMorning reading was the steadiest it's been all month.", pinned: false, answered: false, created_at: new Date(now - 7 * h).toISOString(), author: "James K.", avatar: "", is_mark: false, mine: false, likes: 7, liked: false, comments: [] },
        { id: 5, room: "feed", protocol: "weight", day: null, kind: "post", body: "First juice day done. Honestly easier than I expected. The ginger shot in the morning helped a lot.", pinned: false, answered: false, created_at: new Date(now - 9 * h).toISOString(), author: "Tom B.", avatar: "🌊", is_mark: false, mine: false, likes: 5, liked: false, comments: [] },
        { id: 6, room: "qa", protocol: "gut", day: null, kind: "question", body: "Can I have coffee during the green juice cleanse?", pinned: false, answered: true, created_at: new Date(now - 20 * h).toISOString(), author: "Lena R.", avatar: "🌻", is_mark: false, mine: false, likes: 3, liked: false, comments: [{ id: 7, body: "Black coffee in the morning is fine for most people. Skip sugar and milk, and drink extra water.", author: "Mark Walker", avatar: "", is_mark: true, mine: false, created_at: new Date(now - 18 * h).toISOString() }] },
        { id: 8, room: "live", protocol: "all", day: null, kind: "chat", body: "Can't wait for Thursday's live!", pinned: false, answered: false, created_at: new Date(now - 3 * h).toISOString(), author: "Dana L.", avatar: "🌸", is_mark: false, mine: false, likes: 0, liked: false, comments: [] }
      ], live: { is_live: false, title: "Bloating on juice days: live Q&A", next: "Thursday, 7 pm Eastern", embed: "", link: "" },
        me: { name: "Jordan R.", avatar: "" }, state: { start: Date.now() - 2 * 864e5, ticks: { 3: [true, true] }, checkins: {}, journal: {} } };
    }
    function save() { lsx.set(K, JSON.stringify(db)); }
    function P(v) { return Promise.resolve(v); }
    function find(id) { return db.posts.filter(function (p) { return p.id == id; })[0]; }
    return {
      hub_join: function () { return P({ name: db.me.name, avatar: db.me.avatar, admin: false, banned: false, state: db.state, live: db.live }); },
      hub_profile: function (a) { db.me = { name: a.p_name, avatar: a.p_avatar }; save(); return P(null); },
      hub_save_state: function (a) { db.state = a.p_state; save(); return P(null); },
      hub_list: function (a) {
        var r = db.posts.filter(function (p) { return p.room === a.p_room && (a.p_protocol === "all" || p.protocol === a.p_protocol || p.protocol === "all") && (!a.p_before || p.id < a.p_before); });
        r.sort(function (x, y) { return (a.p_room !== "live" && !a.p_before && (y.pinned - x.pinned)) || y.id - x.id; });
        return P(r.slice(0, a.p_limit || 25).map(function (p) {
          return Object.assign({}, p, { comments: p.comments.length, author: p.mine ? db.me.name : p.author, avatar: p.mine ? db.me.avatar : p.avatar });
        }));
      },
      hub_comments_for: function (a) { var p = find(a.p_post); return P(p ? p.comments.map(function (c) { return Object.assign({}, c, { author: c.mine ? db.me.name : c.author }); }) : []); },
      hub_post: function (a) {
        var id = ++db.id;
        db.posts.push({ id: id, room: a.p_room, protocol: a.p_protocol, day: a.p_day, kind: a.p_kind, body: a.p_body, pinned: false, answered: false, created_at: new Date().toISOString(), author: db.me.name, avatar: db.me.avatar, is_mark: false, mine: true, likes: 0, liked: false, comments: [] });
        save(); return P(id);
      },
      hub_comment: function (a) { var p = find(a.p_post); p.comments.push({ id: ++db.id, body: a.p_body, author: db.me.name, avatar: db.me.avatar, is_mark: false, mine: true, created_at: new Date().toISOString() }); save(); return P(db.id); },
      hub_like: function (a) { var p = find(a.p_post); p.liked = !p.liked; p.likes += p.liked ? 1 : -1; save(); return P(p.liked); },
      hub_delete: function (a) {
        if (a.p_comment) db.posts.forEach(function (p) { p.comments = p.comments.filter(function (c) { return c.id != a.p_comment; }); });
        else db.posts = db.posts.filter(function (p) { return p.id != a.p_post; });
        save(); return P(null);
      }
    };
  })();

  /* ================= posts (Facebook-style) ================= */
  function postHTML(p) {
    var h = '<article class="cm-card cm-post' + (p.pinned ? " pinned" : "") + '" data-post="' + p.id + '">' +
      '<div class="cm-by">' + av(p, p.is_mark ? "host" : "") + '<span class="who"><b>' + esc(p.author) + (p.is_mark ? ' <i class="cm-tag">Host</i>' : "") + '</b>' +
      '<small>' + ago(p.created_at) + (PNAME[p.protocol] ? " · " + esc(PNAME[p.protocol]) : "") + '</small></span>' +
      ((p.mine || me.admin) ? '<button type="button" class="cm-opt" data-menu="' + p.id + '" aria-label="Post options">' + ic("dots") + '</button>' : "") + '</div>';
    var tags = [];
    if (p.pinned) tags.push('<span class="cm-badge gold">' + ic("pin") + 'Pinned</span>');
    if (p.kind === "announce") tags.push('<span class="cm-badge gold">Announcement</span>');
    if (p.kind === "checkin") tags.push('<span class="cm-badge">Day ' + esc(p.day) + ' check-in</span>');
    if (p.kind === "fast") tags.push('<span class="cm-badge">Fast complete</span>');
    if (p.room === "qa") tags.push('<span class="cm-badge' + (p.answered ? "" : " wait") + '">' + (p.answered ? "Answered by Mark" : "Waiting for Mark") + '</span>');
    if (tags.length) h += '<div class="cm-tags">' + tags.join("") + '</div>';
    h += '<p class="cm-p cm-text">' + esc(p.body) + '</p>';
    var nC = +p.comments || 0, nL = +p.likes || 0;
    if (nL || nC) h += '<div class="cm-count"><span>' + (nL ? '<i class="hb">' + ic("heart") + '</i>' + nL : "") + '</span>' +
      (nC ? '<button type="button" data-c="' + p.id + '">' + nC + (p.room === "qa" ? (nC > 1 ? " replies" : " reply") : (nC > 1 ? " comments" : " comment")) + '</button>' : "") + '</div>';
    h += '<div class="cm-acts"><button type="button" class="cm-act' + (p.liked ? " on" : "") + '" data-like="' + p.id + '" aria-pressed="' + !!p.liked + '">' + ic("heart") + '<span>' + (p.liked ? "Liked" : "Like") + '</span></button>' +
      '<button type="button" class="cm-act" data-c="' + p.id + '">' + ic("chat") + '<span>' + (p.room === "qa" ? "Reply" : "Comment") + '</span></button></div>';
    if (openC[p.id]) {
      h += '<div class="cm-cmts">' + (cmts[p.id] || []).map(function (c) {
        return '<div class="cm-cm">' + av(c, c.is_mark ? "host sm" : "sm") + '<div class="bub-w"><div class="bub"><b>' + esc(c.author) + (c.is_mark ? ' <i class="cm-tag">Host</i>' : "") + '</b>' + esc(c.body) + '</div>' +
          '<span class="cm-meta">' + ago(c.created_at) + ((c.mine || me.admin) ? ' · <button type="button" data-dc="' + c.id + '" data-p="' + p.id + '">Delete</button>' : "") + '</span></div></div>';
      }).join("") + (cmts[p.id] ? "" : '<p class="cm-meta">Loading…</p>') +
        (me.banned ? "" : '<form class="cm-cin" data-cf="' + p.id + '"><label class="cm-sr" for="ci' + p.id + '">Write a comment</label><input id="ci' + p.id + '" maxlength="1500" placeholder="Write a comment…" autocomplete="off"><button type="submit" aria-label="Send">' + ic("send") + '</button></form>') + '</div>';
    }
    return h + '</article>';
  }
  function findPost(id) { return feed.filter(function (x) { return x.id == id; })[0]; }
  function redrawPost(id) { var el = document.querySelector('[data-post="' + id + '"]'), p = findPost(id); if (el && p) el.outerHTML = postHTML(p); }
  function loadComments(id) { return rpc("hub_comments_for", { p_post: id }).then(function (r) { cmts[id] = r || []; redrawPost(id); }).catch(err); }
  function loadFeed(room, protocol, more) {
    var before = more && feed.length ? feed[feed.length - 1].id : null;
    return rpc("hub_list", { p_room: room, p_protocol: protocol, p_before: before, p_limit: 20 }).then(function (r) { r = r || []; feed = more ? feed.concat(r) : r; return r; });
  }

  /* ================= cards ================= */
  function todayCard() {
    var d = curDay();
    if (!S.start) return '<article class="cm-card cm-today" id="today"><span class="cm-kick">Your first week</span><h2 class="cm-h">Start your 7-day arc</h2>' +
      '<p class="cm-p">One small set of steps a day: your cleanse, rest, nature and gentle movement. Start whenever you\'re ready.</p>' +
      '<div class="cm-links"><button type="button" class="b sm" data-start>Start Day 1 today</button></div></article>';
    if (d > 7) return '<article class="cm-card cm-today" id="today"><span class="cm-kick">Your first week is done</span><h2 class="cm-h">Now the full 7 steps</h2>' +
      '<p class="cm-p">Follow your meals and exercise one week at a time in your plan.</p><div class="cm-links"><a href="' + esc(ctx.app) + '">Open my plan</a><button type="button" class="cm-lbtn" data-start>Start a new round</button></div></article>';
    var day = DAYS[d - 1], tk = S.ticks[d] || [], n = tk.filter(Boolean).length;
    return '<article class="cm-card cm-today" id="today">' +
      '<div class="cm-row"><span class="cm-kick">Today · Day ' + d + ' of 7</span><span class="cm-meta">' + n + ' of ' + day[2].length + ' done</span></div>' +
      '<h2 class="cm-h">' + esc(day[0]) + '</h2><p class="cm-meta cm-sub">' + esc(day[1]) + '</p>' +
      '<div class="cm-habits">' + day[2].map(function (t, j) {
        return '<button type="button" class="cm-hab' + (tk[j] ? " on" : "") + '" data-tick="' + j + '" aria-pressed="' + !!tk[j] + '"><span class="box">' + ic("check") + '</span><span><b>' + esc(t) + '</b></span></button>';
      }).join("") + '</div>' +
      '<div class="cm-links">' + (S.checkins[d] ? '<span class="cm-badge">Checked in today</span>' : '<button type="button" class="b sm" data-checkin>Post my check-in</button>') +
      '<a href="' + esc(ctx.app) + '">Open today\'s full plan</a><a href="' + esc(ctx.course) + '">Watch the lesson</a></div></article>';
  }
  function companionCard() {
    var e = (S.journal || {})[jKey(Date.now())] || {};
    return '<article class="cm-card cm-dark" id="companion"><span class="cm-kick gold">Healing Companion · today\'s check-in</span>' +
      '<p class="cm-q">' + (e.mood != null ? "Anything else on your mind today?" : "How are you feeling today?") + '</p>' +
      (e.mood != null ? "" : '<div class="cm-moods">' + MOODS.map(function (m, i) { return '<button type="button" data-mood="' + i + '" aria-label="Mood ' + (i + 1) + ' of 5">' + m + '</button>'; }).join("") + '</div>') +
      '<form class="cm-ask" data-ask><label for="cmAskIn" class="cm-sr">Write in your journal</label>' +
      '<input id="cmAskIn" maxlength="1000" placeholder="Write a line in your journal…" autocomplete="off">' +
      '<button type="submit" aria-label="Save to journal">' + ic("send") + '</button></form>' +
      '<span class="cm-note">Private to you. <a href="#journal">Open your journal</a></span></article>';
  }
  function liveCard() {
    return '<article class="cm-card cm-media"><div class="cm-by">' + av({ author: "Mark Walker" }, "host") + '<span class="who"><b>Mark Walker <i class="cm-tag">Host</i></b><small>' + (live.is_live ? "Live now" : "Live Q&amp;A") + '</small></span></div>' +
      '<p class="cm-p">' + esc(live.title || "Live with Mark") + (live.next && !live.is_live ? " · " + esc(live.next) : "") + '</p>' +
      '<a class="cm-video" href="#live"' + photo(PHOTOS.mark) + '><span class="pl">' + ic("play") + '</span><span>' + (live.is_live ? "Join the live now" : "Open the Live room") + '</span></a>' +
      '<div class="cm-acts"><a class="cm-act" href="#live">' + ic("chat") + '<span>Live chat</span></a><a class="cm-act" href="#community/qa">' + ic("bell") + '<span>Ask a question</span></a></div></article>';
  }
  function picksCard() {
    var P = window.MTH_PICKS, list = [];
    if (P && P.sections) P.sections.forEach(function (s) { s.picks.forEach(function (p) { if (list.length < 2) list.push(p); }); });
    if (!list.length) return "";
    return '<article class="cm-card"><div class="cm-row"><span class="cm-kick">Mark\'s picks</span><span class="cm-meta">Sponsored links</span></div>' +
      list.map(function (p) { return '<a class="cm-pick" href="' + esc(P.link(p)) + '" target="_blank" rel="noopener sponsored"><span class="ph">' + ic("shop") + '</span><span><b>' + esc(p.name) + '</b><small>' + esc(p.why) + '</small></span></a>'; }).join("") +
      '<a class="cm-more" href="picks.html">See all my picks</a><span class="cm-note">As an Amazon Associate I earn from qualifying purchases.</span></article>';
  }
  function journalCard() {
    return '<article class="cm-card cm-book"><span class="cover">The Healing Journal</span><span><b>Write it down with pen and paper</b><small>The printed companion to your 7-day arc, with a page for every day.</small><a href="picks.html">See the journal</a></span></article>';
  }
  function composer(where, label) {
    var ph = where === "qa" ? "Ask Mark a question…" : "How did today go" + (ctx.first ? ", " + esc(ctx.first) : "") + "?";
    return '<form class="cm-card cm-compose" data-compose><div class="cm-crow">' + av(me, "me") +
      '<label for="cmPost" class="cm-sr">' + (where === "qa" ? "Ask Mark" : "Write a post") + '</label>' +
      '<textarea id="cmPost" rows="1" maxlength="3000" placeholder="' + ph + '"></textarea></div>' +
      '<div class="cm-cfoot" hidden><span class="cm-meta">Posting to ' + esc(label) + '</span><button type="submit" class="b sm">' + (where === "qa" ? "Ask Mark" : "Post") + '</button></div></form>';
  }

  /* ---------- stories ---------- */
  function stories() {
    var d = Math.min(Math.max(curDay(), 1), 7);
    var S1 = {
      day: function () { return '<a class="cm-story" href="#today"' + photo(PHOTOS.days[d - 1]) + '><span class="k">' + (S.start ? "Your day" : "Start here") + '</span><span><b class="big">' + d + '</b><b>' + esc(DAYS[d - 1][0]) + '</b></span></a>'; },
      live: function () { return '<a class="cm-story" href="#live"' + photo(PHOTOS.mark) + '><span class="pill">' + (live.is_live ? "LIVE NOW" : "LIVE") + '</span><b>' + esc(live.title || "Live with Mark") + '</b></a>'; },
      piano: function () { return '<a class="cm-story" href="' + esc(ctx.app) + '"' + photo(PHOTOS.piano) + '>' + ic("music") + '<b>Healing Piano · today\'s track</b></a>'; },
      member1: function () { return DEMO ? '<a class="cm-story" href="#community/wins"' + photo(PHOTOS.days[1]) + '><span class="ring">🌸</span><b>Dana · morning journal</b></a>' : ""; },
      member2: function () { return DEMO ? '<a class="cm-story" href="#community/weight"' + photo(PHOTOS.days[0]) + '><span class="ring g">🌊</span><b>Tom · first juice day</b></a>' : ""; }
    };
    return '<section class="cm-stories" aria-label="Today at a glance">' + STORIES.map(function (k) { return S1[k](); }).join("") + '</section>';
  }

  /* ================= views ================= */
  function homeView() {
    var h = composer("feed", "everyone") + stories(), i = 0;
    HOME_ORDER.forEach(function (k) {
      var m = /^posts:(\d+)$/.exec(k);
      if (m) { var n = +m[1]; feed.slice(i, i + n).forEach(function (p) { h += postHTML(p); }); i += n; return; }
      h += ({ today: todayCard, companion: companionCard, live: liveCard, picks: picksCard, journal: journalCard })[k]();
    });
    if (!feed.length) h += '<article class="cm-card cm-empty"><p class="cm-p">No posts yet. Be the first to say hello.</p></article>';
    if (feed.length >= 20) h += '<button type="button" class="b ghost full" data-more>See more posts</button>';
    return h;
  }
  function communityView() {
    var R = roomSel;
    var posts = R.wins ? feed.filter(function (p) { return p.kind === "checkin" || p.kind === "fast"; }) : feed;
    var h = '<section class="cm-card cm-room"><div class="cover"' + photo(R.photo) + '></div><div class="rin"><h1 class="cm-h">' + esc(R.name) + '</h1><p class="cm-meta">' + esc(R.about) + '</p>' +
      '<nav class="cm-chips" aria-label="Rooms">' + ROOMS.map(function (x) {
        return '<a href="#community/' + x.key + '" class="' + (x.key === R.key ? "on" : "") + '"' + (x.key === R.key ? ' aria-current="page"' : "") + '>' + esc(x.name) + '</a>';
      }).join("") + '</nav></div></section>';
    h += composer(R.room === "qa" ? "qa" : "feed", R.room === "qa" ? "Ask Mark" : R.protocol === "all" ? "everyone" : R.name);
    h += posts.length ? posts.map(postHTML).join("") : '<article class="cm-card cm-empty"><p class="cm-p">' + (R.room === "qa" ? "No questions yet. Ask Mark anything about your protocol." : "Nothing here yet. Start the conversation.") + '</p></article>';
    if (feed.length >= 20) h += '<button type="button" class="b ghost full" data-more>See more posts</button>';
    return h;
  }
  function liveView() {
    var emb = /^https:\/\//.test(live.embed || "") ? live.embed : "";
    var h = '<section class="cm-card cm-media cm-live">' +
      (emb ? '<div class="cm-embed"><iframe src="' + esc(emb) + '" title="Live with Mark" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>'
           : '<div class="cm-video big"' + photo(PHOTOS.mark) + '><span class="pl">' + ic("live") + '</span><span>' + (live.is_live ? "Mark is live now" : "The next live session") + '</span></div>') +
      '<div class="cm-by">' + av({ author: "Mark Walker" }, "host") + '<span class="who"><b>' + esc(live.title || "Live with Mark") + '</b><small>' + (live.is_live ? '<i class="cm-livepill">LIVE</i> Happening now' : esc(live.next || "Date coming soon")) + '</small></span></div>' +
      (live.link ? '<a class="b cm-golive" href="' + esc(live.link) + '" target="_blank" rel="noopener">' + (live.is_live ? "Join the live" : "Open the live link") + '</a>' : "") + '</section>';
    h += '<section class="cm-card"><span class="cm-kick">Live chat</span><div class="cm-chat" id="cmChat">' + chatHTML() + '</div>' +
      (me.banned ? "" : '<form class="cm-cin" data-chat><label class="cm-sr" for="cmChatIn">Message</label><input id="cmChatIn" maxlength="500" placeholder="Say hello or ask a question…" autocomplete="off"><button type="submit" aria-label="Send">' + ic("send") + '</button></form>') + '</section>';
    return h;
  }
  function chatHTML() {
    if (!chat.length) return '<p class="cm-meta">No messages yet. Say hello.</p>';
    return chat.map(function (c) { return '<div class="cm-cm">' + av(c, c.is_mark ? "host sm" : "sm") + '<div class="bub-w"><div class="bub"><b>' + esc(c.author) + (c.is_mark ? ' <i class="cm-tag">Host</i>' : "") + '</b>' + esc(c.body) + '</div><span class="cm-meta">' + ago(c.created_at) + '</span></div></div>'; }).join("");
  }
  function journalView() {
    if (!S.journal) S.journal = {};
    var today = jKey(Date.now()); if (!jSel) jSel = today;
    var e = S.journal[jSel] || {}, d = curDay();
    var h = '<section class="cm-card cm-jr"><span class="cm-kick">Your journal · private to you</span><h1 class="cm-h">' + (jSel === today ? "Today's page" : esc(jNice(jSel))) + '</h1>' +
      '<p class="cm-meta">' + (jSel === today ? esc(jNice(today)) + (d >= 1 && d <= 7 ? " · Day " + d + " of your first week" : "") : "A past page. You can still edit it.") + '</p>' +
      '<span class="cm-lab">How are you feeling?</span><div class="cm-moods light">' + MOODS.map(function (m, i) { return '<button type="button" data-jmood="' + i + '" class="' + (e.mood === i ? "on" : "") + '" aria-label="Mood ' + (i + 1) + ' of 5" aria-pressed="' + (e.mood === i) + '">' + m + '</button>'; }).join("") + '</div>' +
      JPROMPTS.map(function (q) { return '<label class="cm-lab" for="jp_' + q[0] + '">' + esc(q[1]) + '</label><textarea id="jp_' + q[0] + '" data-jp="' + q[0] + '" rows="3" maxlength="2000" placeholder="' + esc(q[2]) + '">' + esc(e[q[0]] || "") + '</textarea>'; }).join("") +
      '<label class="cm-lab" for="jp_free">Anything else</label><textarea id="jp_free" data-jp="free" rows="4" maxlength="4000" placeholder="Write freely. Only you can see this.">' + esc(e.free || "") + '</textarea>' +
      '<div class="cm-row"><span class="cm-meta" id="cmJSaved">' + (e.t ? "Saved " + new Date(e.t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Saves as you type") + '</span>' + (jSel !== today ? '<button type="button" class="b ghost sm" data-jtoday>Back to today</button>' : "") + '</div></section>';
    var keys = Object.keys(S.journal).filter(function (k) { var x = S.journal[k]; return x && (x.mood != null || x.free || JPROMPTS.some(function (q) { return x[q[0]]; })); }).sort().reverse();
    h += '<section class="cm-card"><div class="cm-row"><span class="cm-kick">Past pages</span><span class="cm-meta">' + keys.length + ' page' + (keys.length === 1 ? "" : "s") + '</span></div>' +
      (keys.length ? keys.map(function (k) { var x = S.journal[k], f = x.body || x.grateful || x.letgo || x.win || x.free || ""; return '<button type="button" class="cm-jent' + (k === jSel ? " on" : "") + '" data-jk="' + k + '"><span class="jm">' + (x.mood != null ? MOODS[x.mood] : "📓") + '</span><span><b>' + esc(jNice(k)) + '</b><small>' + esc(f.slice(0, 90)) + (f.length > 90 ? "…" : "") + '</small></span></button>'; }).join("")
        : '<p class="cm-meta">Your pages appear here, one per day.</p>') + '</section>';
    return h;
  }

  /* ================= frame ================= */
  function side() {
    var L = [
      ["account.html", av(me, "me"), esc(me.name)],
      ["#journal", '<span class="cm-si dark">' + ic("chat") + '</span>', "Healing Companion"],
      ["#today", '<span class="cm-si sage">' + ic("today") + '</span>', "Today's plan"],
      [ctx.course, '<span class="cm-si terra">' + ic("course") + '</span>', "My course: " + esc(ctx.short)],
      ["#live", '<span class="cm-si terra">' + ic("live") + '</span>', "Live with Mark"],
      ["#journal", '<span class="cm-si">' + ic("book") + '</span>', "My journal"],
      ["picks.html", '<span class="cm-si">' + ic("shop") + '</span>', "Mark's picks"]
    ];
    return '<aside class="cm-side" aria-label="Your shortcuts">' + L.map(function (l) { return '<a href="' + esc(l[0]) + '">' + l[1] + '<span>' + l[2] + '</span></a>'; }).join("") +
      '<hr><span class="cm-sh">Rooms</span>' + ROOMS.map(function (r) { return '<a href="#community/' + r.key + '" class="room"><span class="rimg"' + photo(r.photo) + '></span><span>' + esc(r.name) + '</span></a>'; }).join("") + '</aside>';
  }
  function rail() {
    var today = dayKey(), n = feed.filter(function (p) { return (p.kind === "checkin" || p.kind === "fast") && dayKey(p.created_at) === today; }).length;
    return '<aside class="cm-rail" aria-label="This week">' +
      '<section class="cm-card"><span class="cm-kick">Live with Mark</span><div class="cm-when"><span class="cal">' + ic("live") + '</span><span><b>' + esc(live.title || "Live Q&A") + '</b><small>' + (live.is_live ? "Happening now" : esc(live.next || "Date coming soon")) + '</small></span></div>' +
      '<a class="b ghost full" href="#live">Open the Live room</a></section>' +
      '<section class="cm-card"><span class="cm-kick">Today in the community</span><p class="cm-p sm">' + (n ? n + " check-in" + (n > 1 ? "s" : "") + " so far today." : "No check-ins yet today. Be the first.") + '</p>' +
      '<a class="cm-more" href="#community/wins">See wins &amp; check-ins</a></section>' +
      '<section class="cm-card"><span class="cm-kick">Ask Mark</span><p class="cm-p sm">Questions about your protocol get answered here and in the weekly live.</p><a class="cm-more" href="#community/qa">Ask a question</a></section></aside>';
  }
  var NAV_OF = { home: "home", community: "community", live: "home", journal: "home" };
  function frame() {
    document.getElementById("cm").innerHTML = '<div id="cmTop"></div>' +
      (DEMO ? '<div class="cm-demo">Preview with example members. Anything you post here stays on this device.</div>' : "") +
      '<div class="cm-body"><div id="cmSide" class="cm-sidew"></div><main class="cm-feed" id="cmView" aria-live="polite"></main><div id="cmRail" class="cm-railw"></div></div><div id="cmBot"></div>';
  }
  function paint() {
    document.getElementById("cmTop").innerHTML = window.MTHNav.top(NAV_OF[view], { initial: (me.name || "?").charAt(0).toUpperCase(), word: view });
    document.getElementById("cmBot").innerHTML = window.MTHNav.bottom(NAV_OF[view]);
    document.getElementById("cmSide").innerHTML = side();
    document.getElementById("cmRail").innerHTML = rail();
    document.getElementById("cmView").innerHTML = view === "community" ? communityView() : view === "live" ? liveView() : view === "journal" ? journalView() : homeView();
    if (view === "live") { var c = document.getElementById("cmChat"); if (c) c.scrollTop = c.scrollHeight; }
  }

  /* ================= routing ================= */
  function route(first) {
    var h = (location.hash || "").replace(/^#/, ""), parts = h.split("/");
    var v = parts[0] === "community" || parts[0] === "live" || parts[0] === "journal" ? parts[0] : "home";
    var target = h === "today" || h === "companion" ? h : null;
    var prev = view, load = null; view = v; openC = {};
    if (v === "community") {
      roomSel = ROOMS.filter(function (x) { return x.key === parts[1]; })[0] || ROOMS.filter(function (x) { return x.key === S.protocol; })[0] || ROOMS[0];
      load = loadFeed(roomSel.room, roomSel.protocol, false);
    } else if (v === "live") { load = loadChat(); }
    else if (v === "home" && (prev !== "home" || first || !feed.length || roomSel !== ROOMS[0])) { roomSel = ROOMS[0]; load = loadFeed("feed", "all", false); }
    paint();
    if (target) scrollToEl(target); else if (!first) window.scrollTo(0, 0);
    if (load) load.then(function () { paint(); if (target) scrollToEl(target); }).catch(err);
  }
  function scrollToEl(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ block: "start" }); }
  function loadChat() {
    return Promise.all([
      rpc("hub_list", { p_room: "live", p_protocol: "all", p_before: null, p_limit: 60 }).then(function (r) { chat = (r || []).slice().reverse(); }),
      rpc("hub_join", {}).then(function (j) { if (j && j.live) live = j.live; })
    ]);
  }

  /* ================= actions ================= */
  function journalSet(k, patch) {
    if (!S.journal) S.journal = {};
    S.journal[k] = Object.assign({}, S.journal[k] || {}, patch, { t: Date.now() }); persist();
  }
  function postMenu(btn, id) {
    var old = document.querySelector(".cm-pop"); if (old) { old.remove(); return; }
    var m = document.createElement("div"); m.className = "cm-pop";
    m.innerHTML = '<button type="button" data-delpost="' + id + '">Delete post</button>';
    btn.parentNode.appendChild(m);
  }
  function wire() {
    var root = document.getElementById("cm");
    root.addEventListener("click", function (e) {
      var t = e.target, b;
      if (t.closest(".cm-ib.phone")) { var top = document.querySelector(".cm-top"); top.classList.toggle("srch"); if (top.classList.contains("srch")) document.getElementById("cmSearch").focus(); return; }
      if ((b = t.closest("[data-like]"))) {
        var p = findPost(b.getAttribute("data-like")); if (!p) return;
        p.liked = !p.liked; p.likes = (+p.likes || 0) + (p.liked ? 1 : -1); redrawPost(p.id);
        rpc("hub_like", { p_post: p.id }).catch(err); return;
      }
      if ((b = t.closest("[data-c]"))) {
        var id = +b.getAttribute("data-c"); openC[id] = !openC[id]; redrawPost(id);
        if (openC[id]) loadComments(id).then(function () { var i = document.getElementById("ci" + id); if (i) i.focus(); });
        return;
      }
      if ((b = t.closest("[data-dc]"))) {
        var pid = +b.getAttribute("data-p");
        rpc("hub_delete", { p_post: pid, p_comment: +b.getAttribute("data-dc") }).then(function () { var q = findPost(pid); if (q) q.comments = Math.max(0, q.comments - 1); return loadComments(pid); }).catch(err); return;
      }
      if ((b = t.closest("[data-menu]"))) { postMenu(b, +b.getAttribute("data-menu")); return; }
      if ((b = t.closest("[data-delpost]"))) {
        var did = +b.getAttribute("data-delpost");
        if (b.getAttribute("data-sure") !== "1") { b.setAttribute("data-sure", "1"); b.textContent = "Tap again to delete"; return; }
        rpc("hub_delete", { p_post: did }).then(function () { feed = feed.filter(function (x) { return x.id !== did; }); paint(); toast("Post deleted"); }).catch(err); return;
      }
      if ((b = t.closest("[data-tick]"))) {
        var d = curDay(), a = (S.ticks[d] || []).slice(), j = +b.getAttribute("data-tick"); a[j] = !a[j]; S.ticks[d] = a; persist(); paint(); return;
      }
      if (t.closest("[data-start]")) {
        S.start = dayKey(); S.ownStart = true; S.ticks = {}; S.checkins = {}; persist(); paint(); toast("Day 1 starts today"); return;
      }
      if ((b = t.closest("[data-checkin]"))) {
        var cd = curDay(), nn = (S.ticks[cd] || []).filter(Boolean).length, dd = DAYS[cd - 1];
        b.disabled = true;
        rpc("hub_post", { p_room: "feed", p_protocol: S.protocol, p_day: cd, p_kind: "checkin", p_body: "Day " + cd + " · " + dd[0] + " — " + nn + " of " + dd[2].length + " done" })
          .then(function () { S.checkins[cd] = true; persist(); return loadFeed("feed", "all", false); })
          .then(function () { paint(); toast("Checked in. Nice work."); }).catch(function (x) { b.disabled = false; err(x); });
        return;
      }
      if ((b = t.closest("[data-mood]"))) { journalSet(jKey(Date.now()), { mood: +b.getAttribute("data-mood") }); paint(); toast("Saved to your journal"); return; }
      if ((b = t.closest("[data-jmood]"))) { journalSet(jSel, { mood: +b.getAttribute("data-jmood") }); paint(); return; }
      if ((b = t.closest("[data-jk]"))) { jSel = b.getAttribute("data-jk"); paint(); window.scrollTo(0, 0); return; }
      if (t.closest("[data-jtoday]")) { jSel = null; paint(); return; }
      if ((b = t.closest("[data-more]"))) {
        b.disabled = true; b.textContent = "Loading…";
        loadFeed(roomSel.room, roomSel.protocol, true).then(paint).catch(err); return;
      }
    });
    root.addEventListener("focusin", function (e) {
      if (e.target.id === "cmPost") { var f = e.target.closest("form"); if (f) f.querySelector(".cm-cfoot").hidden = false; }
    });
    root.addEventListener("input", function (e) {
      var t = e.target;
      if (t.id === "cmSearch") {
        var q = t.value.trim().toLowerCase();
        document.querySelectorAll(".cm-post").forEach(function (el) { el.hidden = !!q && el.textContent.toLowerCase().indexOf(q) < 0; });
        return;
      }
      if (t.id === "cmPost") { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 240) + "px"; }
      if (t.getAttribute && t.getAttribute("data-jp")) {
        clearTimeout(journalT); var k = t.getAttribute("data-jp"), v = t.value;
        journalT = setTimeout(function () { var o = {}; o[k] = v; journalSet(jSel, o); var s = document.getElementById("cmJSaved"); if (s) s.textContent = "Saved " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }, 700);
      }
    });
    root.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, inp, txt;
      if (f.hasAttribute("data-compose")) {
        inp = f.querySelector("textarea"); txt = inp.value.trim(); if (!txt) return;
        var qa = view === "community" && roomSel.room === "qa", btn = f.querySelector("button[type=submit]"); btn.disabled = true;
        var proto = view === "community" && roomSel.protocol !== "all" ? roomSel.protocol : S.protocol;
        rpc("hub_post", { p_room: qa ? "qa" : "feed", p_protocol: proto, p_day: null, p_kind: qa ? "question" : "post", p_body: txt })
          .then(function () { return loadFeed(roomSel.room, roomSel.protocol, false); })
          .then(function () { paint(); toast(qa ? "Question sent to Mark" : "Posted"); }).catch(function (x) { btn.disabled = false; err(x); });
        return;
      }
      if (f.hasAttribute("data-cf")) {
        var id = +f.getAttribute("data-cf"); inp = f.querySelector("input"); txt = inp.value.trim(); if (!txt) return;
        inp.disabled = true;
        rpc("hub_comment", { p_post: id, p_body: txt }).then(function () { var p = findPost(id); if (p) p.comments = (+p.comments || 0) + 1; return loadComments(id); })
          .then(function () { var i = document.getElementById("ci" + id); if (i) i.focus(); }).catch(function (x) { inp.disabled = false; err(x); });
        return;
      }
      if (f.hasAttribute("data-chat")) {
        inp = f.querySelector("input"); txt = inp.value.trim(); if (!txt) return; inp.value = "";
        rpc("hub_post", { p_room: "live", p_protocol: "all", p_day: null, p_kind: "chat", p_body: txt }).then(loadChat)
          .then(function () { var c = document.getElementById("cmChat"); if (c) { c.innerHTML = chatHTML(); c.scrollTop = c.scrollHeight; } }).catch(err);
        return;
      }
      if (f.hasAttribute("data-ask")) {
        inp = f.querySelector("input"); txt = inp.value.trim(); if (!txt) return;
        var k = jKey(Date.now()), cur = ((S.journal || {})[k] || {}).free || "";
        var line = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + " · " + txt;
        journalSet(k, { free: cur ? cur + "\n" + line : line }); inp.value = ""; toast("Saved to your journal");
      }
    });
    window.addEventListener("hashchange", function () { route(false); });
    document.addEventListener("click", function (e) { var m = document.querySelector(".cm-pop"); if (m && !e.target.closest(".cm-pop") && !e.target.closest("[data-menu]")) m.remove(); });
  }

  /* ================= start ================= */
  async function start() {
    var key = "gut";
    if (DEMO) member = { id: "demo", email: "demo@example.com" };
    else {
      await M.require();
      if (!M.ownsAny()) { location.replace("protocols.html?from=community"); return; }
      member = { id: M.user.id, email: (M.user.email || "").toLowerCase() };
      key = M.owns(M.product()) ? M.product() : M.owned[0];
      try { var cached = JSON.parse(lsx.get(LS) || "null"); if (cached) S = Object.assign(S, cached); } catch (e) {}
    }
    var P = M.config.products[key] || M.config.products.gut;
    ctx = { short: P.short, app: P.app, course: P.course };
    S.protocol = PROTO[key] || "gut";
    frame(); wire(); paint();
    try {
      var j = await rpc("hub_join", {});
      if (j) {
        me.name = j.name || me.name; me.avatar = j.avatar || ""; me.admin = !!j.admin; me.banned = !!j.banned;
        if (j.live) live = j.live;
        if (j.state && Object.keys(j.state).length) { var keep = S.protocol; S = Object.assign(S, j.state); S.protocol = keep; if (!S.journal) S.journal = {}; if (!S.ticks) S.ticks = {}; if (!S.checkins) S.checkins = {}; }
      }
    } catch (e) { console.warn(e); toast("Couldn't reach the community. Your plan still works on this device."); }
    ctx.first = (me.name || "").split(" ")[0];
    route(true);
    setInterval(function () {
      if (document.hidden || view !== "live") return;
      loadChat().then(function () { var c = document.getElementById("cmChat"); if (c) { var atEnd = c.scrollTop + c.clientHeight >= c.scrollHeight - 30; c.innerHTML = chatHTML(); if (atEnd) c.scrollTop = c.scrollHeight; } }).catch(function () {});
    }, 5000);
  }
  start();
})();
