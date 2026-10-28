/* =================================================================
   MARK TALKS HEALTH — SHARED PHONE APP LAYOUT
   Used by the Gut Health, Diabetes and GLP-1 protocol apps.
   On phones and tablets the protocol turns into an app that looks like the
   "test drive" phone on the homepage: Today · Food · Exercise · Activity · Arc,
   built around the healing arc, with a three-page swipe intake.
   On desktop nothing changes.
   Test any device:  add ?view=app  or  ?view=desktop  to the address.
   This file only shows and hides the existing parts of each app;
   it never changes how the protocol itself works.
================================================================= */
(function () {
  if (window.MTHApp) return;
  window.MTHApp = { on: false };

  var VIEW_KEY = 'mth_view';
  var param = null, saved = null;
  try { param = new URLSearchParams(location.search).get('view'); } catch (e) {}
  try { saved = localStorage.getItem(VIEW_KEY); } catch (e) {}
  if (param === 'app' || param === 'desktop') { saved = param; try { localStorage.setItem(VIEW_KEY, param); } catch (e) {} }

  function isPhoneOrTablet() {
    var mm = function (q) { return !!(window.matchMedia && matchMedia(q).matches); };
    var coarse = mm('(pointer: coarse)');
    var hasMouse = mm('(any-pointer: fine)');   /* touchscreen laptops also have a trackpad or mouse: they get the desktop layout */
    var shortSide = Math.min(screen.width || 9999, screen.height || 9999);
    return coarse && !hasMouse && shortSide <= 1100;   /* phones and tablets, upright or sideways */
  }
  var touch = isPhoneOrTablet();
  var on = saved === 'app' ? true : saved === 'desktop' ? false : touch;

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* ---------- Meal Planner / Exercise Planner apps (?app=meals | ?app=train) ----------
     Opens just the protocol's own daily planner section, on phones and computers alike. */
  var PLAN = null; try { PLAN = new URLSearchParams(location.search).get('app'); } catch (e) {}
  if (PLAN === 'meals' || PLAN === 'train') {
    var R0 = document.documentElement; R0.classList.add('mth-planner'); if (on || touch) R0.classList.add('mth-phone');
    var pst = document.createElement('style');
    pst.textContent =
      'html.mth-planner body{background:#fffcf7!important}' +
      'html.mth-planner .hc-head,html.mth-planner .hc-grid3,html.mth-planner .hc-below,html.mth-planner #fastingArcContainer,html.mth-planner #planSlot,' +
      'html.mth-planner #fxOverview,html.mth-planner .ca-outer,html.mth-planner #main,html.mth-planner .fx-fab,html.mth-planner .hc-cap,html.mth-planner .hero,' +
      'html.mth-planner #fx>.fx-tabs,html.mth-planner .fx-lede{display:none!important}' +
      'html.mth-planner .fx-outer,html.mth-planner #fx{display:block!important}' +
      'html.mth-planner .di-outer,html.mth-planner .fx-outer{max-width:none!important}' +
      'html.mth-planner .hc-card{padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}' +
      'html.mth-planner.mth-phone .di-outer{padding:8px 8px 24px!important}' +
      'html.mth-planner.mth-phone .fx-outer{padding:0!important;margin:0!important}' +
      'html.mth-planner.mth-phone .fx-card{padding:14px 12px!important;border-radius:16px!important}' +
      'html.mth-planner.mth-phone .fx-title{font-size:1.5rem!important;line-height:1.15!important}' +
      'html.mth-planner .mth-pwait{padding:40vh 20px 0;text-align:center;font:400 1.35rem "Cormorant Garamond",Georgia,serif;color:#8a7d71}' +
      'html.mth-planner.mth-pwaiting .di-outer{visibility:hidden}' +
      '.mth-pneed{max-width:420px;margin:18vh auto 0;padding:24px 20px;text-align:center;font-family:Inter,"DM Sans",system-ui,sans-serif;color:#2b2724}' +
      '.mth-pneed h2{font:500 2rem/1.1 "Cormorant Garamond",Georgia,serif;margin:0 0 8px}.mth-pneed p{font-size:.95rem;color:#6e6259;line-height:1.5;margin:0 0 18px}' +
      '.mth-pneed a{display:block;padding:14px;border-radius:999px;background:#c0623f;color:#fff;text-decoration:none;font-weight:700}';
    (document.head || R0).appendChild(pst);
    R0.classList.add('mth-pwaiting');
    ready(function () {
      var gen = document.getElementById('diGenBtn');
      function setUp() { return gen && !gen.classList.contains('di-pending'); }
      function open() {
        R0.classList.remove('mth-pwaiting');
        var b = document.querySelector('#fx > .fx-tabs button[data-tab="' + (PLAN === 'meals' ? 'eat' : 'move') + '"]');
        if (b && b.getAttribute('aria-selected') !== 'true') b.click();
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      }
      function need() {
        R0.classList.remove('mth-pwaiting');
        var home = 'https://marktalkshealth.com'; try { if (document.referrer) home = new URL(document.referrer).origin; } catch (e) {}
        var d = document.createElement('div'); d.className = 'mth-pneed';
        d.innerHTML = '<h2>Build your plan first</h2><p>Your ' + (PLAN === 'meals' ? 'meal planner' : 'exercise planner') + ' is made from your healing plan. Set it up in the Healing App (it takes about a minute), then come back here.</p><a href="' + home + '/app" target="_top">Open the Healing App</a>';
        var o = document.querySelector('.di-outer'); if (o) o.style.display = 'none';
        document.body.appendChild(d);
      }
      if (setUp()) return open();
      var t0 = Date.now();
      (function wait() { if (setUp()) return open(); if (Date.now() - t0 > 4000) return need(); setTimeout(wait, 150); })();
    });
    return;
  }

  /* On the members' /app page on a computer: use the whole screen width */
  if (!on) {
    try { if (new URLSearchParams(location.search).get('mode') === 'app') {
      var wide = document.createElement('style');
      wide.textContent = '.di-outer,.ca-outer,.fx-outer{max-width:none!important}';
      (document.head || document.documentElement).appendChild(wide);
    } } catch (e) {}
  }
  /* A phone that was switched to the full page layout gets a small way back */
  if (!on) {
    if (touch) ready(function () {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mth-backapp'; b.textContent = 'App view';
      b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:950;padding:9px 14px;border-radius:999px;border:1px solid #e3dbd0;background:#fbf8f3;color:#2b2622;font:600 13px/1 "DM Sans",system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.12)';
      b.onclick = function () { try { localStorage.setItem(VIEW_KEY, 'app'); } catch (e) {} location.reload(); };
      document.body.appendChild(b);
    });
    return;
  }
  window.MTHApp.on = true;
  var root = document.documentElement;
  root.classList.add('mth-app');
  try { if (new URLSearchParams(location.search).get('mode') === 'app') root.classList.add('mth-standalone'); } catch (e) {}


  /* =================================================================
     PHONE APP · same look as the "test drive" phone on the homepage
     Five tabs: Today · Food · Exercise · Activity · Arc.
     Today    = the day at a glance: progress ring and what's up next.
     Food     = today's cleanse, refeed or healing meals, plus water.
     Exercise = today's gentle movement.
     Activity = today's healing practices from the protocol (meditation,
                journaling, music, prayer, sleep, fresh air, forest, sun).
     Arc      = the healing arc day by day, and the intake (three swipe pages).
     Everything is read from the protocol itself, so the desktop software is unchanged.
  ================================================================= */
  var css = `
html.mth-app { -webkit-text-size-adjust: 100%; }
html.mth-app body { padding-bottom: calc(84px + env(safe-area-inset-bottom)) !important; background: #fffcf7 !important; }
html.mth-app .di-outer { padding: 12px 14px 0 !important; max-width: 640px !important; margin: 0 auto !important; background: transparent !important; }
html.mth-app .hc-card { padding: 0 !important; background: transparent !important; border: 0 !important; box-shadow: none !important; }

/* the full software stays on the page, out of sight */
html.mth-app .hc-head, html.mth-app .hc-below, html.mth-app #fastingArcContainer, html.mth-app #planSlot,
html.mth-app .fx-outer, html.mth-app #fx, html.mth-app #fxOverview, html.mth-app .ca-outer, html.mth-app #main,
html.mth-app .fx-fab, html.mth-app .hc-cap, html.mth-app .hc-heal { display: none !important; }
html.mth-app .hc-grid3, html.mth-app .mp-pane { display: none !important; }
html.mth-app[data-mth-tab="today"] .mp-today, html.mth-app[data-mth-tab="food"] .mp-food, html.mth-app[data-mth-tab="move"] .mp-move,
html.mth-app[data-mth-tab="act"] .mp-act, html.mth-app[data-mth-tab="arc"] .mp-arc { display: block !important; }
html.mth-app.mth-setup .mp-arcsum, html.mth-app.mth-setup .mp-arcfoot, html.mth-app.mth-setup .mth-bar { display: none !important; }
html.mth-app.mth-setup body { padding-bottom: 24px !important; }

/* Arc: the intake as three swipe pages (about you · symptoms · tests) */
html.mth-app[data-mth-tab="arc"] .hc-grid3 { display: flex !important; gap: 12px; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; align-items: flex-start;
  grid-template-columns: none !important; scrollbar-width: none; -webkit-overflow-scrolling: touch; margin: 0 -14px; padding: 2px 14px 6px; transition: height .2s ease; }
html.mth-app .hc-grid3::-webkit-scrollbar { display: none; }
html.mth-app .hc-mid { display: contents !important; }
html.mth-app .hc-intake, html.mth-app .gs-panel, html.mth-app .lab-panel { flex: 0 0 100% !important; min-width: 0; max-width: 100%; scroll-snap-align: center; scroll-snap-stop: always; }
html.mth-app .hc-intake { display: block !important; }
html.mth-app .di-panel { padding: 16px 14px !important; border-radius: 18px !important; margin: 0 !important; border: 1px solid #e7dccb !important; box-shadow: none !important; background: #fff !important; }
html.mth-app .hc-intake .di-title, html.mth-app .hc-intake .di-metrics-section-title, html.mth-app .hc-intake .di-metrics-grid,
html.mth-app #diGenBtn, html.mth-app #diGenHint, html.mth-app .gs-panel > .gs-head, html.mth-app .lab-panel > .gs-head, html.mth-app #diMasterNote { display: none !important; }


/* Arc tab order: intake first, then the arc chart (swipe sideways), then day by day */
html.mth-app .hc-card { display: flex !important; flex-direction: column; }
html.mth-app .mp-archead { order: 1; } html.mth-app[data-mth-tab="arc"] .hc-grid3 { order: 2; } html.mth-app .mp-arcfoot2 { order: 3; }
html.mth-app .mp-archint { order: 4; } html.mth-app #fastingArcContainer { order: 5; } html.mth-app .mp-arcsum { order: 6; } html.mth-app .mp-arcfoot { order: 7; }
html.mth-app[data-mth-tab="arc"]:not(.mth-setup) #fastingArcContainer { display: block !important; margin: 0 0 10px !important; padding: 0 !important; }
html.mth-app #fastingArcContainer .chart-card { margin: 0 !important; padding: 14px !important; border-radius: 18px !important; border: 1px solid #e7dccb !important; background: #fff !important; box-shadow: none !important;
  overflow-x: auto !important; -webkit-overflow-scrolling: touch; scrollbar-width: thin; opacity: 1 !important; transform: none !important; }
html.mth-app #fastingArcContainer .chart-title { font-size: 1.35rem !important; line-height: 1.15 !important; position: sticky; left: 0; }
html.mth-app #fastingArcContainer .chart-sub { font-size: .82rem !important; line-height: 1.45 !important; position: sticky; left: 0; max-width: calc(100vw - 60px); }
html.mth-app #fastingArcContainer .chart-legend { position: sticky; left: 0; max-width: calc(100vw - 60px); }
html.mth-app #fastingArcContainer .slope-chart { min-width: 760px !important; height: 232px !important; }
html.mth-app.mth-setup .mp-archint { display: none !important; }

/* Food and Exercise use the full planner from the desktop (photos, recipes, swap, log, shopping list, workouts) */
html.mth-app.mth-fx[data-mth-tab="food"] .fx-outer, html.mth-app.mth-fx[data-mth-tab="move"] .fx-outer,
html.mth-app.mth-fx[data-mth-tab="food"] #fx, html.mth-app.mth-fx[data-mth-tab="move"] #fx { display: block !important; }
html.mth-app.mth-fx[data-mth-tab="food"] .mp-food, html.mth-app.mth-fx[data-mth-tab="move"] .mp-move { display: none !important; }
html.mth-app.mth-fx #fx > .fx-tabs, html.mth-app.mth-fx .fx-lede, html.mth-app.mth-fx #fxOverview, html.mth-app.mth-fx .fx-fab { display: none !important; }
html.mth-app.mth-fx .fx-outer { max-width: 640px !important; margin: 0 auto !important; padding: 0 10px !important; }
html.mth-app.mth-fx .fx-card { padding: 14px 12px !important; border-radius: 16px !important; }
html.mth-app.mth-fx .fx-title { font-size: 1.5rem !important; line-height: 1.15 !important; }

/* ---- the demo look, at phone size ---- */
.mp { font-family: Inter, 'DM Sans', system-ui, -apple-system, sans-serif; color: #2b2724; -webkit-font-smoothing: antialiased; }
.mp *, .mp *::before { box-sizing: border-box; }
.mp button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; -webkit-tap-highlight-color: transparent; text-align: left; padding: 0; }
.mp .k { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #c0623f; font-weight: 700; }
.mp .h { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 34px; line-height: 1.02; margin: 4px 0 12px; font-weight: 500; }
.mp .h em { font-style: italic; color: #c0623f; }
.mp .c { border: 1px solid #e7dccb; border-radius: 18px; padding: 14px; margin-bottom: 10px; background: #fff; }
.mp .row { display: flex; gap: 14px; align-items: center; }
.mp .sp { justify-content: space-between; }
.mp .t { font-weight: 700; font-size: 15.5px; line-height: 1.3; }
.mp .s { color: #6e6259; font-size: 13.5px; line-height: 1.4; }
.mp .xs { color: #8a7b6e; font-size: 12px; }
.mp .lbl { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #a8998b; font-weight: 700; margin: 14px 2px 8px; }
.mp .days { display: flex; gap: 6px; margin-bottom: 12px; }
.mp .days button { flex: 1; aspect-ratio: 1; max-width: 48px; border-radius: 50%; border: 1px solid #e7dccb; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: #a8998b; transition: .2s; text-align: center; background: #fff; }
.mp .days button.d { background: #e7ecdd; color: #7a8f6e; border-color: #d3dcc8; }
.mp .days button.t { background: #c0623f; color: #fff; border-color: #c0623f; }
.mp .days button.v { box-shadow: 0 0 0 2px #fffcf7, 0 0 0 3.5px #2b2724; }
.mp .days button.fut { opacity: .55; }
.mp .ring { width: 78px; height: 78px; flex: none; position: relative; }
.mp .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.mp .ring b { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; font-size: 17px; text-align: center; line-height: 1.05; font-variant-numeric: tabular-nums; }
.mp .ring b small { display: block; font-size: 10px; font-weight: 600; color: #8a7b6e; }
.mp .ring.big { width: 92px; height: 92px; } .mp .ring.big b { font-size: 21px; }
.mp .nx { display: flex; gap: 12px; align-items: center; width: 100%; border: 1px solid #e7dccb; border-radius: 16px; padding: 10px 12px; margin-bottom: 8px; background: #fff; }
.mp .nx .e, .mp .it .e { width: 42px; height: 42px; border-radius: 13px; background: #f6dccf; display: grid; place-items: center; font-size: 21px; flex: none; }
.mp .nx .go { margin-left: auto; color: #c0623f; font-size: 22px; padding-left: 6px; }
.mp .nx .tx { min-width: 0; flex: 1; }
.mp .nx .tx .t { display: block; } .mp .nx .tx .s { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp .list { padding: 4px 14px; }
.mp .it { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f0e8dc; }
.mp .it:last-child { border: 0; }
.mp .it .nm { flex: 1; min-width: 0; padding-top: 1px; }
.mp .it .nm .xs { display: block; text-transform: uppercase; letter-spacing: .08em; font-weight: 700; font-size: 10.5px; margin-bottom: 2px; }
.mp .it .nm .t { display: block; }
.mp .it .nm .s { display: block; margin-top: 3px; }
.mp .it .nm .s.clip { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mp .it.open .nm .s.clip { -webkit-line-clamp: unset; display: block; }
.mp .ib { width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid #e7dccb; display: grid !important; place-items: center; font-size: 16px; color: #8a7b6e; flex: none; text-align: center !important; transition: .2s; margin-top: 2px; background: #fff; }
.mp .ib.on { background: #7a8f6e; border-color: #7a8f6e; color: #fff; }
.mp .ib[disabled] { opacity: .45; cursor: default; }
.mp .it.on .nm .t { color: #a8998b; text-decoration: line-through; }
.mp .water { display: flex; gap: 6px; margin-top: 10px; }
.mp .water button { flex: 1; height: 36px; border-radius: 7px 7px 12px 12px; border: 2px solid #c9d6e0; background: #fff; transition: .2s; }
.mp .water button.on { background: #9db7c9; border-color: #9db7c9; }
.mp .tip { font-size: 13px; color: #8a7b6e; line-height: 1.45; padding: 4px 4px 10px; }
.mp .bar { height: 7px; border-radius: 7px; background: #ece0cf; overflow: hidden; margin-top: 8px; }
.mp .bar i { display: block; height: 100%; background: #c0623f; border-radius: 7px; transition: width .5s; }
.mp .banner { background: #2b2724; color: #fffcf7; border-radius: 18px; padding: 16px; margin-bottom: 12px; }
.mp .banner .k { color: #e3a184; }
.mp .banner .h { color: #fff; font-size: 28px; margin-bottom: 6px; }
.mp .banner p { font-size: 14px; color: #d9cfc3; margin: 0 0 12px; line-height: 1.45; }
.mp .pill { display: block; width: 100%; text-align: center !important; border-radius: 999px; padding: 14px; font-size: 15px; font-weight: 700; background: #2b2724; color: #fff !important; }
.mp .pill.t2 { background: #c0623f; }
.mp .pill.ghost { background: transparent; border: 1px solid #ddd3c6 !important; color: #2b2724 !important; }
.mp .done { text-align: center; padding: 4px 0 12px; font-size: 14px; color: #5f7355; font-weight: 600; }
.mp .seg { display: flex; background: #f3ebdf; border-radius: 999px; padding: 3px; margin-bottom: 12px; }
.mp .seg button { flex: 1; border-radius: 999px; padding: 10px 0; font-size: 13px; font-weight: 700; color: #8a7b6e; text-align: center; }
.mp .seg button.on { background: #fff; color: #2b2724; box-shadow: 0 1px 3px rgba(43,39,36,.12); }
.mp .dl { display: flex; gap: 12px; align-items: center; width: 100%; padding: 11px 0; border-bottom: 1px solid #f0e8dc; }
.mp .dl:last-child { border: 0; }
.mp .dn { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: 14px; color: #fff; }
.mp .dn.c { background: #c0623f; } .mp .dn.r { background: #b8924a; } .mp .dn.h { background: #7a8f6e; }
.mp .dl.fut .dn { opacity: .45; }
.mp .dl.full .dn { box-shadow: 0 0 0 3px #fff, 0 0 0 4.5px #7a8f6e; }
.mp .dl .tx { flex: 1; min-width: 0; }
.mp .dl .tx .s { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.mp .dl .st { font-size: 11px; font-weight: 700; color: #8a7b6e; letter-spacing: .06em; text-transform: uppercase; flex: none; }
.mp .dl .st.td { color: #c0623f; }
.mp .start { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 14px; margin-top: 12px; }
.mp .start input { font: 600 14px Inter, system-ui, sans-serif; color: #2b2724; border: 1px solid #e7dccb; border-radius: 10px; padding: 8px 10px; background: #fff; }
.mp .swipe { text-align: center; font-size: 12px; color: #a8998b; margin: 8px 0 0; }
.mp .acts { padding: 12px 0 8px; display: grid; gap: 8px; }
.mp .foot { text-align: center; padding: 10px 0 6px; }
.mp .foot button { color: #8a7b6e; font-size: 13px; text-decoration: underline; text-align: center; }
.mp .sec { margin-top: 18px; }

/* bottom tab bar, as on the demo */
.mth-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 960; display: grid; grid-template-columns: repeat(5, 1fr);
  padding: 0 4px env(safe-area-inset-bottom); background: rgba(255,252,247,.97); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border-top: 1px solid #efe5d6; }
.mth-bar button { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; height: 64px;
  border: 0; background: none; color: #a8998b; font: 700 11px/1 Inter, system-ui, sans-serif; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color .2s; }
.mth-bar svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; transition: transform .2s; }
.mth-bar button[aria-selected="true"] { color: #c0623f; }
.mth-bar button[aria-selected="true"] svg { transform: translateY(-1px) scale(1.08); }
.mth-bar button[aria-selected="true"]::before { content: ""; position: absolute; top: 0; width: 28px; height: 3px; border-radius: 0 0 3px 3px; background: #c0623f; }
html.mth-app.mth-bar-inline .mth-bar { position: static; border: 1px solid #efe5d6; border-radius: 16px; margin: 0 0 10px; }
html.mth-app.mth-bar-inline body { padding-bottom: 24px !important; }

/* waiting for a saved plan */
html.mth-app.mth-wait .di-outer, html.mth-app.mth-wait .mth-bar { visibility: hidden !important; }
html.mth-app.mth-wait body::after { content: 'Opening your plan…'; position: fixed; left: 0; right: 0; top: 40%; text-align: center;
  font: 400 1.35rem 'Cormorant Garamond', Georgia, serif; color: #8a7d71; }
`;
  var st = document.createElement('style'); st.id = 'mth-app-styles'; st.textContent = css;
  (document.head || root).appendChild(st);

  var ICONS = {
    today: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    food: '<svg viewBox="0 0 24 24"><path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6a2 2 0 0 0 2 2M11 3v6a2 2 0 0 1-2 2"/><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7 0 2 1.5 3 3.5 3"/></svg>',
    move: '<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
    act: '<svg viewBox="0 0 24 24"><path d="M12 21c-4.5-2.6-7.5-6-7.5-10A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19.5 11c0 4-3 7.4-7.5 10z"/><path d="M12 7.6V21"/></svg>',
    arc: '<svg viewBox="0 0 24 24"><path d="M3.5 17a8.5 8.5 0 0 1 17 0"/><circle cx="3.5" cy="17" r="1.6"/><circle cx="12" cy="8.5" r="1.6"/><circle cx="20.5" cy="17" r="1.6"/></svg>'
  };
  var TABS = [['today', 'Today'], ['food', 'Food'], ['move', 'Exercise'], ['act', 'Activity'], ['arc', 'Arc']];
  var TAB_KEY = 'mth_app_tab3';
  var PROTO = (location.pathname.match(/\/(gut|sugar|glp1)\b/) || [, 'gut'])[1];
  var PNAME = { gut: 'Gut Health Protocol', sugar: 'Diabetes Protocol', glp1: 'GLP-1 Protocol' }[PROTO];
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* ---------- reading the protocol ---------- */
  function g(name) { try { return (0, eval)(name); } catch (e) { return undefined; } }   /* the protocol's own top-level values */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cap(s) { s = String(s).trim(); return s.charAt(0).toUpperCase() + s.slice(1); }
  function mid(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function arc() {
    var type = g('fastingType') || 'juice', C = (g('CLEANSE') || {})[type] || { name: 'Cleanse', short: 'Cleanse', emoji: '🌿', lvl: 2 };
    var L = { cd: 3, rd: 2 }; try { L = g('cleanseLen')(); } catch (e) {}
    var start = new Date(); try { start = g('caStart')(); } catch (e) {}
    start = mid(start);
    var n = Math.max(7, L.cd + L.rd);
    var today = Math.round((mid(new Date()) - start) / 864e5) + 1;
    return { type: type, C: C, cd: L.cd, rd: L.rd, n: n, start: start, today: today };
  }
  function kind(A, d) { return d <= A.cd ? 'c' : d <= A.cd + A.rd ? 'r' : 'h'; }
  function dayDate(A, d) { var x = new Date(A.start); x.setDate(x.getDate() + d - 1); return x; }
  function dayName(A, d) { var k = kind(A, d); return k === 'c' ? A.C.short + ' day ' + d : k === 'r' ? (A.rd > 1 ? 'Refeed day ' + (d - A.cd) : 'Refeed day') : 'Healing day'; }
  function shortDate(x) { return WD[x.getDay()].slice(0, 3) + ' ' + MO[x.getMonth()] + ' ' + x.getDate(); }

  function splitTop(s, sep) {
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i]; if (ch === '(') depth++; if (ch === ')') depth = Math.max(0, depth - 1);
      if (!depth && s.substr(i, sep.length) === sep) { out.push(cur); cur = ''; i += sep.length - 1; continue; }
      cur += ch;
    }
    out.push(cur); return out.map(function (x) { return x.trim(); }).filter(Boolean);
  }
  var MEAL = /\b(breakfast|lunch|dinner)\b/i;
  function foodLines(text) {
    var body = String(text || '').replace(/^[^:]{0,40}:\s*/, '');
    var sentences = splitTop(body.replace(/\.\s*$/, ''), '. ');
    var first = sentences.shift() || '', items = [];
    if (MEAL.test(first)) {
      splitTop(first, ', ').forEach(function (c) {
        c.replace(/\b(breakfast|lunch|dinner)\s+and\s+/gi, '$1\u0001').split('\u0001').forEach(function (p) {
          p = p.replace(/^and\s+/i, '').replace(/\s*\(≈[^)]*\)/g, '').trim();
          var m = p.match(MEAL), label = m ? cap(m[1].toLowerCase()) : (items.length ? 'Meal' : 'Morning');
          p = p.replace(/\s+(?:at|for)\s+(?:breakfast|lunch|dinner)\b/i, '').trim();
          if (p) items.push({ label: label, text: cap(p) });
        });
      });
    } else if (first) items.push({ label: 'Today', text: cap(first.replace(/\s*\(≈[^)]*\)/g, '')) });
    var tip = sentences.map(function (s) { return cap(s.replace(/\s*\(≈[^)]*\)/g, '')); }).join('. ');
    return { items: items, tip: tip ? tip + '.' : '' };
  }
  function foodEmoji(t) {
    t = t.toLowerCase();
    return /bowl|yogurt/.test(t) ? '🥣' : /\bnuts\b|macadamia|walnut|almond|pecan/.test(t) && !/avocado/.test(t) ? '🌰' : /juice/.test(t) ? '🥤' : /shake/.test(t) ? '🥛' : /avocado|macadamia/.test(t) ? '🥑' : /lemon|tea|coffee|warm water/.test(t) ? '🍋'
      : /broth|soup/.test(t) ? '🍲' : /egg/.test(t) ? '🥚' : /salmon|fish/.test(t) ? '🐟' : /chicken/.test(t) ? '🍗' : /salad|greens|vegetable/.test(t) ? '🥗'
      : /water|zero calories|electrolyte/.test(t) ? '💧' : '🍽️';
  }
  function food(A, d) {
    var k = kind(A, d), F;
    try { if (k === 'c') F = foodLines(g('cleanseDayText')(A.type, d)); else if (k === 'r') F = foodLines(g('refeedText')(A.type, d - A.cd)); } catch (e) {}
    if (!F || !F.items.length) F = { items: [
      { label: 'Breakfast', text: 'Eggs with soft cooked vegetables' },
      { label: 'Lunch', text: 'A big salad with olive oil and fish or chicken' },
      { label: 'Dinner', text: 'Protein with cooked vegetables, and a glass of water first' }], tip: 'Small portions, eaten slowly.' };
    F.items.forEach(function (i) { i.e = foodEmoji(i.text); });
    return F;
  }
  function moves(A, d) {
    var fast = A.type === 'water' && kind(A, d) === 'c' && /water/i.test(A.C.name);
    if (d <= 2) return [{ e: '🚶', t: fast ? 'Slow 5-minute stroll' : 'Gentle walk', s: fast ? 'Only if you feel steady. Rest is the work today.' : '10 minutes at an easy, talking pace' },
      { e: '🧘', t: 'Easy stretching', s: 'A few minutes in bed, morning and night' }];
    if (fast) return [{ e: '🚶', t: 'Easy walk', s: '10 minutes, only if you feel steady' }, { e: '🧘', t: 'Gentle stretching', s: '5–10 minutes' }];
    return [{ e: '🚶', t: d <= 4 ? 'Gentle walk' : 'Brisk walk', s: d <= 4 ? '20 minutes at a talking pace' : '30 minutes, outdoors if you can' },
      { e: '🦵', t: 'Squats', s: 'A dozen, slow and controlled (to a chair is fine)' },
      { e: '🏃', t: 'Lunges', s: 'A dozen, alternating legs' },
      { e: '🪜', t: 'Stairs', s: 'A few flights, at your own pace' }];
  }
  function acts(A, d) {
    var out = [];
    try {
      var rows = g('caRows')(g('curPcts')());
      rows.forEach(function (r) { if (r.off || [1, 4, 5, 6].indexOf(r.cat) < 0) return; var x = r.f(d); if (x) out.push({ e: r.e, t: r.n, s: x.t }); });
    } catch (e) {}
    if (!out.length) out = [
      { e: '🧘', t: 'Meditation', s: '15 minutes, ideally in the morning' }, { e: '📓', t: 'Journaling', s: '10 minutes: how you feel and 3 things you are grateful for' },
      { e: '☀️', t: 'Sun', s: '20 minutes of midday sun. Never burn.' }, { e: '🛏️', t: 'Sleep', s: '8 hours, window open for fresh air' }];
    return out;
  }

  /* ---------- ticks ---------- */
  function tkKey(A, d) { return 'mth_ms_' + PROTO + '_' + iso(A.start) + '_d' + d; }
  function ticks(A, d) { try { return JSON.parse(localStorage.getItem(tkKey(A, d)) || '[]'); } catch (e) { return []; } }
  function setTick(A, d, id, on) { var t = ticks(A, d).filter(function (x) { return x !== id; }); if (on) t.push(id); try { localStorage.setItem(tkKey(A, d), JSON.stringify(t)); } catch (e) {} }
  function water(A, d) { var st = fxs(A, d); if (st) return st.water; var w = ticks(A, d).filter(function (x) { return x.indexOf('w') === 0; })[0]; return w ? +w.slice(1) : 0; }
  function setWater(A, d, n) { if (window.fxPhone) { try { window.fxPhone.setWater(iso(dayDate(A, d)), n); return; } catch (e) {} } var t = ticks(A, d).filter(function (x) { return x.indexOf('w') !== 0; }); if (n) t.push('w' + n); try { localStorage.setItem(tkKey(A, d), JSON.stringify(t)); } catch (e) {} }
  function fxs(A, d) { try { return window.fxPhone ? window.fxPhone.status(iso(dayDate(A, d))) : null; } catch (e) { return null; } }
  function counts(A, d) {
    var t = ticks(A, d), F = food(A, d).items.length, M = moves(A, d).length, X = acts(A, d).length;
    var c = function (p, n) { var k = 0; for (var i = 0; i < n; i++) if (t.indexOf(p + i) >= 0) k++; return k; };
    var f = c('f', F), m = c('m', M), a = c('a', X), st = fxs(A, d);
    if (st && st.F) { f = st.f; F = st.F; m = st.m; M = 1; }
    return { f: f, F: F, m: m, M: M, a: a, X: X, done: f + m + a, total: F + M + X };
  }
  function ringSvg(p, col) {
    var r = 15.5, L = 2 * Math.PI * r; p = Math.max(0, Math.min(1, p || 0));
    return '<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="' + r + '" fill="none" stroke="#ece0cf" stroke-width="3.4"/><circle cx="18" cy="18" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="' + L.toFixed(2) + '" stroke-dashoffset="' + (L * (1 - p)).toFixed(2) + '"/></svg>';
  }

  ready(function () {
    var genBtn = document.getElementById('diGenBtn');
    var card = document.querySelector('.hc-card');
    var grid = document.querySelector('.hc-grid3');
    if (!genBtn || !card || !grid) return;   /* not a protocol app page */
    function isSetUp() { return !genBtn.classList.contains('di-pending'); }

    function pane(cls) { var el = document.createElement('div'); el.className = 'mp mp-pane ' + cls; return el; }
    var P = { today: pane('mp-today'), food: pane('mp-food'), move: pane('mp-move'), act: pane('mp-act') };
    var arcSum = pane('mp-arc mp-arcsum'), arcHead = pane('mp-arc mp-archead'), arcFoot = pane('mp-arc mp-arcfoot2'), arcEnd = pane('mp-arc mp-arcfoot'), arcHint = pane('mp-arc mp-archint');
    arcHint.innerHTML = '<div class="sec"><div class="k">Your healing arc</div><div class="h" style="font-size:28px">The <em>' + 'arc</em></div><div class="s" style="padding:0 2px 10px">Swipe the chart sideways to see every day.</div></div>';
    ['today', 'food', 'move', 'act'].forEach(function (k) { card.insertBefore(P[k], grid); });
    card.insertBefore(arcSum, grid); card.insertBefore(arcHead, grid);
    grid.parentNode.insertBefore(arcFoot, grid.nextSibling); arcFoot.parentNode.insertBefore(arcEnd, arcFoot.nextSibling); arcFoot.parentNode.insertBefore(arcHint, arcFoot.nextSibling);

    var bar = document.createElement('nav');
    bar.className = 'mth-bar'; bar.setAttribute('role', 'tablist'); bar.setAttribute('aria-label', 'Sections');
    bar.innerHTML = TABS.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="false">' + ICONS[t[0]] + '<span>' + t[1] + '</span></button>'; }).join('');
    bar.addEventListener('click', function (e) { var b = e.target.closest('button[data-tab]'); if (b) show(b.dataset.tab, true); });

    /* the day being looked at: today by default; tap a day circle to peek at another */
    var view = null;
    function vday(A) { if (view && view >= 1 && view <= A.n) return view; return Math.max(1, Math.min(A.n, A.today)); }
    function live(A, d) { return d <= A.today && A.today >= 1; }
    function daysRow(A, d) {
      var h = '<div class="days">';
      for (var i = 1; i <= A.n; i++) { var C = counts(A, i);
        h += '<button type="button" data-day="' + i + '" aria-label="Day ' + i + '" class="' + (i === A.today ? 't' : C.done >= C.total ? 'd' : '') + (i === d && d !== A.today ? ' v' : '') + (i > A.today ? ' fut' : '') + '">' + i + '</button>'; }
      return h + '</div>';
    }
    function ttl(A, d, w) { return (d === A.today ? 'Today\'s ' : 'Day ' + d + ' ') + w; }
    function head(A, d, k, h) { return '<div class="k">' + k + '</div><div class="h">' + h + '</div>' + daysRow(A, d); }
    function itRow(A, d, id, e, bg, label, t, s, clip) {
      var on = ticks(A, d).indexOf(id) >= 0, can = live(A, d);
      return '<div class="it' + (on ? ' on' : '') + '"><span class="e" style="background:' + bg + '">' + e + '</span><button type="button" class="nm" data-open="1">' +
        (label ? '<span class="xs">' + esc(label) + '</span>' : '') + '<span class="t">' + esc(t) + '</span>' + (s ? '<span class="s' + (clip ? ' clip' : '') + '">' + esc(s) + '</span>' : '') + '</button>' +
        '<button type="button" class="ib' + (on ? ' on' : '') + '" data-tick="' + id + '" data-d="' + d + '"' + (can ? '' : ' disabled') + ' aria-label="Done">✓</button></div>';
    }
    function banner(A) {
      var name = ((document.getElementById('diName') || {}).value || '').trim().split(' ')[0];
      if (A.today < 1) return '<div class="banner"><div class="k">Coming up</div><div class="h">Your arc starts ' + esc(WD[A.start.getDay()]) + '</div><p>' + esc(MO[A.start.getMonth()] + ' ' + A.start.getDate()) + '. Here is Day 1 so you can get ready.</p><button type="button" class="pill t2" data-act="startnow">Start today instead</button></div>';
      if (A.today > A.n) return '<div class="banner"><div class="k">Arc complete</div><div class="h">You finished your ' + A.n + '-day arc</div><p>Well done' + (name ? ', ' + esc(name) : '') + '. Start a fresh arc whenever you are ready, or change your cleanse level under Arc first.</p><button type="button" class="pill t2" data-act="startnow">Start a new arc today</button></div>';
      return '';
    }

    function rToday() {
      var A = arc(), d = vday(A), C = counts(A, d), F = food(A, d), M = moves(A, d), X = acts(A, d), t = ticks(A, d);
      var SL = { M: 'Morning', A: 'Morning', B: 'Breakfast', N: 'Midday', L: 'Lunch', D: 'Dinner', S: 'Snack', P: 'Evening', T: 'Snack' };
      var stx = fxs(A, d), nfx = stx && stx.F ? stx.meals.filter(function (m) { return !m.done; })[0] : null;
      var nf = stx && stx.F ? (nfx ? { label: SL[nfx.slot] || 'Meal', text: nfx.title, e: foodEmoji(nfx.title) } : null) : F.items.filter(function (x, i) { return t.indexOf('f' + i) < 0; })[0],
        nm = stx && stx.F ? (stx.m ? null : { e: '🏋️', t: 'Today\u2019s workout', s: 'Open Exercise for your full session with videos' }) : M.filter(function (x, i) { return t.indexOf('m' + i) < 0; })[0], na = X.filter(function (x, i) { return t.indexOf('a' + i) < 0; })[0];
      var h = banner(A) + head(A, d, esc(PNAME), 'Day ' + d + ' of ' + A.n);
      h += '<div class="c row"><div class="ring big">' + ringSvg(C.done / C.total, '#c0623f') + '<b>' + C.done + '<small>of ' + C.total + '</small></b></div>' +
        '<div style="flex:1;min-width:0"><div class="t">' + esc(dayName(A, d)) + '</div><div class="s">' + esc(A.C.emoji || '') + ' ' + esc(A.C.name) + ' · ' + esc(shortDate(dayDate(A, d))) + '</div>' +
        '<div class="bar"><i style="width:' + Math.round(C.done / C.total * 100) + '%"></i></div></div></div>';
      h += '<div class="lbl">Up next</div>';
      h += nf ? '<button type="button" class="nx" data-go="food"><span class="e">' + nf.e + '</span><span class="tx"><span class="t">' + esc(nf.label) + '</span><span class="s">' + esc(nf.text) + '</span></span><span class="go">›</span></button>'
              : '<button type="button" class="nx" data-go="food"><span class="e">✓</span><span class="tx"><span class="t">Food done</span><span class="s">' + C.F + ' of ' + C.F + ' ticked</span></span><span class="go">›</span></button>';
      h += '<button type="button" class="nx" data-go="move"><span class="e" style="background:#e7ecdd">' + (nm ? nm.e : '✓') + '</span><span class="tx"><span class="t">' + (nm ? esc(nm.t) : 'Movement done') + '</span><span class="s">' + (nm ? esc(nm.s) : C.M + ' of ' + C.M + ' ticked') + '</span></span><span class="go">›</span></button>';
      h += '<button type="button" class="nx" data-go="act"><span class="e" style="background:#efe3cc">' + (na ? na.e : '✓') + '</span><span class="tx"><span class="t">' + (na ? esc(na.t) : 'Healing done') + '</span><span class="s">' + (na ? esc(na.s) : C.X + ' of ' + C.X + ' ticked') + '</span></span><span class="go">›</span></button>';
      var w = water(A, d);
      h += '<div class="c" style="margin-top:4px"><div class="row sp"><span class="t">Water</span><span class="xs">' + w + ' of 8 glasses</span></div><div class="water">' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<button type="button" class="' + (i < w ? 'on' : '') + '" data-w="' + (i + 1) + '" data-d="' + d + '" aria-label="Glass ' + (i + 1) + '"' + (live(A, d) ? '' : ' disabled') + '></button>'; }).join('') + '</div></div>';
      if (C.done >= C.total && live(A, d)) h += '<div class="done">Day ' + d + ' complete. Beautiful work.</div>';
      P.today.innerHTML = h;
    }
    function rFood() {
      var A = arc(), d = vday(A), F = food(A, d), C = counts(A, d), k = kind(A, d);
      var kcal = k === 'c' && A.C.kcal != null ? A.C.kcal : null;
      var h = head(A, d, 'Food · ' + esc(k === 'c' ? 'Level ' + (A.C.lvl || '') + ' · ' + A.C.short : k === 'r' ? 'Refeed' : 'Healing meals'), ttl(A, d, 'food'));
      h += '<div class="c row"><div class="ring big">' + ringSvg(C.f / C.F, '#c0623f') + '<b>' + C.f + '<small>of ' + C.F + '</small></b></div><div style="flex:1"><div class="t">' + esc(dayName(A, d)) + '</div>' +
        '<div class="s">' + (kcal != null ? 'About ' + kcal + ' kcal today' : k === 'r' ? 'Easing back into food' : 'Simple whole-food meals') + '</div>' + (F.tip ? '<div class="xs" style="margin-top:6px">' + esc(F.tip) + '</div>' : '') + '</div></div>';
      h += '<div class="c list">' + F.items.map(function (it, i) { return itRow(A, d, 'f' + i, it.e, '#f6dccf', it.label, it.text, '', false); }).join('') + '</div>';
      var w = water(A, d);
      h += '<div class="c"><div class="row sp"><span class="t">Water</span><span class="xs">' + w + ' of 8 glasses</span></div><div class="water">' +
        [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<button type="button" class="' + (i < w ? 'on' : '') + '" data-w="' + (i + 1) + '" data-d="' + d + '" aria-label="Glass ' + (i + 1) + '"' + (live(A, d) ? '' : ' disabled') + '></button>'; }).join('') + '</div></div>';
      P.food.innerHTML = h;
    }
    function rMove() {
      var A = arc(), d = vday(A), M = moves(A, d), C = counts(A, d);
      var h = head(A, d, 'Exercise · Day ' + d, ttl(A, d, 'movement'));
      h += '<div class="c row"><div class="ring big">' + ringSvg(C.m / C.M, '#7a8f6e') + '<b>' + C.m + '<small>of ' + C.M + '</small></b></div><div style="flex:1"><div class="t">' + (d <= 2 ? 'Rest and gentle movement' : 'Gentle and steady') + '</div><div class="s">' +
        (d <= 2 ? 'Your body is doing deep work. Keep it light.' : 'Go at your own pace. Stop if you feel dizzy.') + '</div></div></div>';
      h += '<div class="c list">' + M.map(function (it, i) { return itRow(A, d, 'm' + i, it.e, '#e7ecdd', '', it.t, it.s, false); }).join('') + '</div>';
      P.move.innerHTML = h;
    }
    function rAct() {
      var A = arc(), d = vday(A), X = acts(A, d), C = counts(A, d);
      var h = head(A, d, 'Activity · Healing practices', ttl(A, d, '<em>healing</em>'));
      h += '<div class="c row"><div class="ring big">' + ringSvg(C.a / C.X, '#b8924a') + '<b>' + C.a + '<small>of ' + C.X + '</small></b></div><div style="flex:1"><div class="t">Heal your whole body</div><div class="s">Meditation, journaling, music, prayer, sleep, fresh air, nature and sun.</div></div></div>';
      h += '<div class="c list">' + X.map(function (it, i) { return itRow(A, d, 'a' + i, it.e, '#efe3cc', '', it.t, it.s, true); }).join('') + '</div>';
      h += '<div class="tip">Tap any practice to read all of it.</div>';
      P.act.innerHTML = h;
    }

    var openDay = null;
    function rArc() {
      var A = arc(), full = 0;
      for (var d = 1; d <= A.n; d++) { var C = counts(A, d); if (C.done >= C.total) full++; }
      var cur = Math.max(0, Math.min(A.n, A.today));
      var h = '<div class="sec"><div class="k">' + esc(A.C.emoji || '') + ' ' + esc(A.C.name) + '</div><div class="h" style="font-size:28px">Day by <em>day</em></div></div>';
      h += '<div class="c"><div class="row"><div class="ring big">' + ringSvg(full / A.n, '#7a8f6e') + '<b>' + full + '<small>of ' + A.n + ' days</small></b></div><div style="flex:1">' +
        '<div class="t">' + (A.today < 1 ? 'Starts ' + esc(shortDate(A.start)) : A.today > A.n ? 'Arc finished' : 'You are on day ' + cur) + '</div>' +
        '<div class="s">' + A.cd + ' cleanse day' + (A.cd === 1 ? '' : 's') + (A.rd ? ', ' + A.rd + ' refeed day' + (A.rd === 1 ? '' : 's') : '') + (A.n - A.cd - A.rd > 0 ? ', then healing days' : '') + '.</div></div></div>' +
        '<div class="start"><span class="s">Start date</span><input type="date" class="mp-startin" value="' + iso(A.start) + '"></div></div>';
      h += '<div class="c list">';
      for (var i = 1; i <= A.n; i++) {
        var F = food(A, i), Cc = counts(A, i), k = kind(A, i);
        var stt = i === A.today ? '<span class="st td">Today</span>' : i < A.today ? '<span class="st">' + Cc.done + '/' + Cc.total + '</span>' : '<span class="st">' + esc(WD[dayDate(A, i).getDay()].slice(0, 3)) + '</span>';
        h += '<button type="button" class="dl' + (i > A.today ? ' fut' : '') + (Cc.done >= Cc.total ? ' full' : '') + '" data-jump="' + i + '"><span class="dn ' + k + '">' + i + '</span><span class="tx"><span class="t">' + esc(dayName(A, i)) + '</span><span class="s">' +
          esc(F.items.map(function (x) { return x.text; }).join(' · ')) + '</span></span>' + stt + '</button>';
      }
      h += '</div>';
      arcSum.innerHTML = h;
      rDetails();
    }
    var PAGES = [['About you', 'A few basics and your cleanse level.'], ['Symptoms', 'Tap everything you have most weeks.'], ['Tests', 'Optional: add blood work or gut tests.']];
    var page = 0;
    function rDetails() {
      var set = isSetUp();
      arcHead.innerHTML = (set ? '<div class="k">Your details</div><div class="h">Diagnostic <em>intake</em></div>'
                               : '<div class="k">Set up · 1 minute</div><div class="h">Let\'s build your <em>plan</em></div>') +
        '<div class="seg">' + PAGES.map(function (p, i) { return '<button type="button" data-page="' + i + '" class="' + (i === page ? 'on' : '') + '">' + (i + 1) + '. ' + p[0] + '</button>'; }).join('') + '</div>' +
        '<div class="s" style="padding:0 4px 10px">' + esc(PAGES[page][1]) + '</div>';
      arcFoot.innerHTML = '<div class="swipe">Swipe sideways for the next page</div><div class="acts">' +
        (set ? '<button type="button" class="pill" data-act="gen">Update my plan</button>'
             : '<button type="button" class="pill" data-act="next">' + (page < 2 ? 'Next' : 'Build my plan') + '</button>' + (page ? '<button type="button" class="pill ghost" data-act="back">Back</button>' : '')) + '</div>';
      arcEnd.innerHTML = '<div class="foot"><button type="button" data-act="full">Show the full software</button></div>';
    }
    function pageEls() { return [grid.querySelector('.hc-intake'), grid.querySelector('.gs-panel'), grid.querySelector('.lab-panel')]; }
    function fit() { var el = pageEls()[page]; if (el && root.getAttribute('data-mth-tab') === 'arc') grid.style.height = (el.offsetHeight + 8) + 'px'; }
    function goPage(i, smooth) {
      page = Math.max(0, Math.min(2, i)); var el = pageEls()[page];
      if (el) grid.scrollTo({ left: el.offsetLeft - grid.offsetLeft - 14, behavior: smooth ? 'smooth' : 'auto' });
      fit(); rDetails();
    }
    try { var ro = new ResizeObserver(function () { fit(); }); pageEls().forEach(function (el) { if (el) ro.observe(el); }); } catch (e) {}
    var st0 = 0;
    grid.addEventListener('scroll', function () {
      clearTimeout(st0); st0 = setTimeout(function () {
        var els = pageEls(), best = 0, bd = 1e9, mx = grid.scrollLeft + grid.clientWidth / 2;
        els.forEach(function (el, i) { if (!el) return; var c = el.offsetLeft - grid.offsetLeft + el.offsetWidth / 2, dd = Math.abs(c - mx); if (dd < bd) { bd = dd; best = i; } });
        if (best !== page) { page = best; rDetails(); } fit();
      }, 90);
    }, { passive: true });

    function setStart(v) {
      var inp = document.getElementById('caStartIn');
      if (inp) { inp.value = v; inp.dispatchEvent(new Event('change', { bubbles: true })); }
      else { var p = v.split('-').map(Number); try { window._caStart = new Date(p[0], p[1] - 1, p[2]); } catch (e) {} }
      view = null; renderAll();
    }
    var R = { today: rToday, food: rFood, move: rMove, act: rAct, arc: rArc };
    function renderCur() { var t = root.getAttribute('data-mth-tab'); (R[t] || rToday)(); }
    function renderAll() { rToday(); rFood(); rMove(); rAct(); rArc(); }

    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.mp')) return;
      var tk = e.target.closest('[data-tick]');
      if (tk && !tk.disabled) { var A = arc(); setTick(A, +tk.dataset.d, tk.dataset.tick, !tk.classList.contains('on')); renderCur(); return; }
      var w = e.target.closest('[data-w]');
      if (w && !w.disabled) { var A2 = arc(), d2 = +w.dataset.d, n = +w.dataset.w; setWater(A2, d2, water(A2, d2) === n ? n - 1 : n); renderCur(); return; }
      var dy = e.target.closest('.days [data-day]'); if (dy) { var A3 = arc(), dd = +dy.dataset.day; view = dd === A3.today ? null : dd; renderCur(); return; }
      var go = e.target.closest('[data-go]'); if (go) { show(go.dataset.go, true); return; }
      var jp = e.target.closest('[data-jump]'); if (jp) { var A4 = arc(), j = +jp.dataset.jump; view = j === A4.today ? null : j; show('today', true); return; }
      var op = e.target.closest('[data-open]'); if (op) { var row = op.closest('.it'); if (row) row.classList.toggle('open'); return; }
      var pg = e.target.closest('.seg [data-page]'); if (pg) { goPage(+pg.dataset.page, true); return; }
      var act = e.target.closest('[data-act]'); if (!act) return;
      var a = act.dataset.act;
      if (a === 'startnow') setStart(iso(new Date()));
      else if (a === 'next') { if (page < 2) goPage(page + 1, true); else { justGenerated = true; genBtn.click(); setTimeout(planReady, 400); } }
      else if (a === 'back') goPage(page - 1, true);
      else if (a === 'gen') { genBtn.click(); setTimeout(function () { view = null; renderAll(); show('today', true); }, 450); }
      else if (a === 'full') { try { localStorage.setItem(VIEW_KEY, 'desktop'); } catch (er) {} location.reload(); }
    });
    document.addEventListener('change', function (e) { if (e.target.classList && e.target.classList.contains('mp-startin') && e.target.value) setStart(e.target.value); });

    var justGenerated = false;
    function planReady() {
      if (!isSetUp()) return;
      var wasSetup = root.classList.contains('mth-setup') || root.classList.contains('mth-wait');
      root.classList.remove('mth-setup', 'mth-wait');
      if (wasSetup) page = 0;
      renderAll();
      if (wasSetup || justGenerated) show('today', true);
      justGenerated = false;
    }
    try { new MutationObserver(function () { if (isSetUp()) planReady(); }).observe(genBtn, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}

    function show(tab, scroll) {
      root.setAttribute('data-mth-tab', tab);
      var bs = bar.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-selected', bs[i].dataset.tab === tab ? 'true' : 'false');
      if (window.fxPhone && (tab === 'food' || tab === 'move')) {
        root.classList.add('mth-fx');
        try { var A0 = arc(); window.fxPhone.show(tab === 'food' ? 'eat' : 'move', iso(dayDate(A0, vday(A0)))); } catch (e) { console.warn(e); }
      }
      (R[tab] || rToday)();
      if (tab === 'arc') requestAnimationFrame(function () { goPage(page, false); });
      try { sessionStorage.setItem(TAB_KEY, tab); } catch (e) {}
      if (scroll) toTop();
      setTimeout(placeBar, 60);
    }
    function toTop() {
      try { window.scrollTo(0, 0); } catch (e) {}
      try { if (window.frameElement) window.frameElement.scrollIntoView({ block: 'start' }); } catch (e) {}
    }
    /* Some course players stretch the frame to the full page height; then the bar goes at the top instead */
    function placeBar() {
      var stretched = window.top !== window && window.innerHeight > (screen.height || 900) + 120;
      if (stretched !== root.classList.contains('mth-bar-inline')) {
        root.classList.toggle('mth-bar-inline', stretched);
        if (stretched) card.insertBefore(bar, card.firstChild); else document.body.appendChild(bar);
      }
    }
    document.body.appendChild(bar);
    placeBar();
    window.addEventListener('resize', function () { clearTimeout(placeBar.t); placeBar.t = setTimeout(placeBar, 200); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) renderCur(); });

    function startSetup() {
      root.classList.remove('mth-wait');
      if (isSetUp()) return;
      root.classList.add('mth-setup');
      show('arc', false);
      goPage(0, false);
    }
    if (isSetUp()) {
      var last = null; try { last = sessionStorage.getItem(TAB_KEY); } catch (e) {}
      show(last && R[last] ? last : 'today', false);
    } else {
      root.classList.add('mth-wait');
      show('today', false);
      setTimeout(startSetup, 3500);
    }
  });
})();
