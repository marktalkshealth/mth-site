/* =================================================================
   MTH QUIZ: the free assessment quiz on the sales pages and homepage.
   <div data-mth-quiz="gut" data-source="gut-page"></div>  +  MTHQuiz.mountAll()
   Live first impression while they answer; the full assessment (protocol
   bars, focus areas, 7-day healing arc) appears after they enter their
   email, and is emailed to them by the mth-assess edge function.
================================================================= */
(function () {
  var Core = window.MTHQuizCore;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function arcHtml(r) {
    var I = r.arcInfo, maxH = 120;
    var cols = r.arc.map(function (d) {
      return '<div class="mq-sc"><span class="mq-pc">' + d.p + '%</span><span class="mq-kc">' + d.kcal.toLocaleString("en-US") + ' kcal</span>' +
        '<i class="mq-ph ph-' + d.ph + '" style="height:' + Math.max(8, Math.round(d.p / 100 * maxH)) + 'px"></i><span class="mq-lb">' + esc(d.l) + "</span></div>"; }).join("");
    return '<div class="mq-arcc"><div class="mq-arct">' + I.emoji + " Level " + I.lvl + " · " + esc(I.name) + ' — 7-Day Arc <span class="mq-chip l' + I.lvl + '">' + esc(I.diff) + "</span></div>" +
      '<div class="mq-arcs">' + esc(I.sub) + '</div><div class="mq-slope">' + cols + "</div>" +
      '<div class="mq-leg">' + I.legend.map(function (x) { return '<span><i class="ph-' + x[0] + '"></i>' + esc(x[1]) + "</span>"; }).join("") + "</div></div>" +
      '<ol class="mq-days">' + r.arc.map(function (d) { return '<li><i class="ph-' + d.ph + '"></i><div><b>' + esc(d.t) + "</b><span>" + esc(d.n) + "</span></div></li>"; }).join("") + "</ol>";
  }

  function mount(el, product) {
    if (el && !el.getAttribute("data-on") && Core.QUIZ[product] && Core.QUIZ[product].kind === "heal") return mountHeal(el);
    if (!el || el.getAttribute("data-on")) return; el.setAttribute("data-on", "1");
    var C = Core.QUIZ[product] || Core.QUIZ.gut, Q = C.questions, N = Q.length;
    var A = {}, i = 0, done = false;
    try { var saved = JSON.parse(localStorage.getItem("mth_quiz_" + C.product) || "null"); if (saved && saved.a) { A = saved.a; } } catch (e) {}

    el.classList.add("mq");
    el.innerHTML =
      '<div class="mq-grid">' +
        '<div class="mq-card"><div class="mq-top"><span class="mq-step"></span><div class="mq-prog"><i></i></div></div><div class="mq-body"></div>' +
          '<div class="mq-nav"><button type="button" class="mq-back">Back</button><button type="button" class="mq-next">Next</button></div></div>' +
        '<aside class="mq-live" aria-live="polite"><div class="mq-k">Your first impression</div><div class="mq-imp">Answer to see it</div>' +
          '<div class="mq-meter"><i></i></div><div class="mq-lvl">' + C.area + ' stress level will show here</div><div class="mq-foc"></div>' +
          '<p class="mq-fine">An educational pattern, not a diagnosis.</p></aside>' +
      '</div>' +
      '<div class="mq-full" hidden></div>';
    var $ = function (s) { return el.querySelector(s); };

    function save() { try { localStorage.setItem("mth_quiz_" + C.product, JSON.stringify({ a: A, at: Date.now() })); } catch (e) {} }
    function live() {
      var r = Core.score(C.product, A);
      $(".mq-imp").textContent = r.answered ? r.impression : "Answer to see it";
      $(".mq-meter i").style.width = r.pct + "%";
      $(".mq-lvl").textContent = r.answered ? C.area + " stress: " + r.stress + (A.freq ? " · suggested start: " + r.levelName.split(" · ")[0] : "") : C.area + " stress level will show here";
      $(".mq-foc").innerHTML = r.answered ? '<span>Your plan would lean on</span>' + r.focus.map(function (f) { return "<b>" + esc(f) + "</b>"; }).join("") : "";
      return r;
    }
    function answered(q) { var v = A[q.id]; return q.type === "multi" ? (q.id !== "sym" || (v && v.length)) : !!v; }

    function qHtml(q, v) {
      return '<h3 class="mq-q">' + esc(q.q) + "</h3>" + (q.hint ? '<p class="mq-hint">' + esc(q.hint) + "</p>" : "") +
        '<div class="mq-opts ' + (q.type === "multi" ? "multi" : "one") + '">' + q.o.map(function (o) {
          var on = q.type === "multi" ? (v || []).indexOf(o[0]) >= 0 : v === o[0];
          return '<button type="button" class="mq-o' + (on ? " on" : "") + '" data-v="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
    }
    /* keep the question box one fixed height (the tallest question), so Next never moves */
    var fitW = 0;
    function fit(force) {
      var body = $(".mq-body"); if (!body || done) return;
      var w = body.clientWidth; if (!w || (w === fitW && !force)) return; fitW = w;
      var keep = document.createDocumentFragment(), max = 0;
      while (body.firstChild) keep.appendChild(body.firstChild);   /* set aside the live question (keeps its taps working) */
      body.style.minHeight = "0";
      Q.forEach(function (q) { body.innerHTML = qHtml(q, A[q.id]); max = Math.max(max, body.scrollHeight); });
      body.innerHTML = ""; body.appendChild(keep); body.style.minHeight = max + "px";
    }
    window.addEventListener("resize", function () { if (i < N) fit(); });

    function draw() {
      $(".mq-prog i").style.width = Math.round((i / (N + 1)) * 100) + "%";
      $(".mq-back").style.visibility = i ? "visible" : "hidden";
      if (i >= N) return drawEmail();
      var q = Q[i], v = A[q.id];
      $(".mq-step").textContent = "Question " + (i + 1) + " of " + N;
      $(".mq-body").innerHTML = qHtml(q, v);
      fit();
      var nx = $(".mq-next"); nx.hidden = false; nx.textContent = q.type === "multi" && !(v && v.length) && q.id !== "sym" ? "Skip" : "Next"; nx.disabled = !answered(q);
      [].forEach.call(el.querySelectorAll(".mq-o"), function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-v");
          if (q.type === "multi") {
            var list = (A[q.id] || []).slice(), at = list.indexOf(k);
            if (k === "nothing") list = at >= 0 ? [] : ["nothing"]; else { if (at >= 0) list.splice(at, 1); else list.push(k); list = list.filter(function (x) { return x !== "nothing"; }); }
            A[q.id] = list; save(); live(); draw();
          } else { A[q.id] = k; save(); live(); draw(); }
        });
      });
    }

    function drawEmail() {
      var r = live();
      $(".mq-step").textContent = "Last step";
      $(".mq-next").hidden = true;
      $(".mq-body").innerHTML = '<h3 class="mq-q">Get your full assessment</h3>' +
        '<p class="mq-hint">Your <b>' + esc(r.impression) + '</b> results, your 7 healing steps ranked for you, and your first 7 days, sent to your inbox and shown right here.</p>' +
        '<form class="mq-form" novalidate><input class="mq-in" name="name" autocomplete="given-name" placeholder="First name"><input class="mq-in" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" placeholder="Your email" required>' +
        '<button class="mq-go" type="submit">Get my full assessment</button><p class="mq-fine">Free. No spam; unsubscribe any time.</p></form>';
      var f = $(".mq-form");
      f.addEventListener("submit", async function (e) {
        e.preventDefault();
        var em = (f.email.value || "").trim(), nm = (f.name.value || "").trim(), b = f.querySelector(".mq-go");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { f.email.focus(); f.email.classList.add("bad"); return; }
        b.disabled = true; b.textContent = "Building your assessment…";
        var src = el.getAttribute("data-source") || (window.MTH && MTH.page) || "quiz";
        try {
          if (window.MTH) {
            await MTH.ready;
            var j = await MTH.fn("mth-assess", { product: C.product, email: em, name: nm, answers: A, source: src, anon: MTH.anon, utm: MTH.utm ? MTH.utm() : null });
            if (j && j.error && j.error !== "rate_limited") throw new Error(j.error);
            full(r, nm, j && j.emailed);
          } else full(r, nm, false);
        } catch (err) { b.disabled = false; b.textContent = "Get my full assessment"; if (window.MTH) MTH.toast("Couldn’t send that. Please try again."); }
      });
    }

    function full(r, name, emailed) {
      done = true;
      $(".mq-grid").hidden = true;
      var box = $(".mq-full"); box.hidden = false;
      /* simple result: a short heading, the focus areas in a few lines, the 7-day arc, then the inbox note */
      box.innerHTML =
        '<div class="mq-k">Your ' + esc(C.kind) + ' assessment' + (name ? " · " + esc(name) : "") + '</div>' +
        (r.patterns.length ? '<div class="mq-pats">' + r.patterns.slice(0, 2).map(function (p) { return '<p><b>' + esc(p.label) + ':</b> ' + esc(p.text) + "</p>"; }).join("") + "</div>" : "") +
        arcHtml(r) +
        '<p class="mq-inbox">' + "✓ Check your inbox for your full protocol." + "</p>";
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $(".mq-next").addEventListener("click", function () { if (i < N && answered(Q[i])) { i++; draw(); } });
    $(".mq-back").addEventListener("click", function () { if (i > 0) { i--; draw(); } });
    live(); draw();
  }

  /* =================================================================
     THE HEALING ASSESSMENT: <div data-mth-quiz="heal" data-goal="gut" data-source="home"></div>
     7 sections; a live Healing Score while they answer; the full result
     (score, areas, top 3 changes, clues, course) after their email.
  ================================================================= */
  function mountHeal(el) {
    el.setAttribute("data-on", "1");
    var C = Core.QUIZ.heal, Q = C.questions, N = Q.length, S = C.sections;
    var A = {}, i = 0;
    try { var saved = JSON.parse(localStorage.getItem("mth_quiz_heal") || "null"); if (saved && saved.a) A = saved.a; } catch (e) {}
    var preset = el.getAttribute("data-goal"); if (preset && !A.goal) A.goal = preset;
    var mins = Math.max(4, Math.round(N * 11 / 60));

    el.classList.add("mq", "mq-heal");
    el.innerHTML =
      '<div class="mq-grid">' +
        '<div class="mq-card"><div class="mq-top"><span class="mq-step"></span><div class="mq-prog"><i></i></div></div><div class="mq-sechd"></div><div class="mq-body"></div>' +
          '<div class="mq-nav"><button type="button" class="mq-back">Back</button><button type="button" class="mq-next">Next</button></div></div>' +
        '<aside class="mq-live" aria-live="polite"><div class="mq-k">Your Healing Score so far</div><div class="mq-imp"><span class="mq-num">–</span><small> / 100</small></div>' +
          '<div class="mq-meter"><i></i></div><div class="mq-lvl">Answer a few questions to see it</div><div class="mq-dots"></div><div class="mq-foc"></div>' +
          '<p class="mq-fine">About ' + mins + ' minutes · ' + N + ' questions · an educational assessment, not a diagnosis.</p></aside>' +
      '</div><div class="mq-full" hidden></div>';
    var $ = function (s) { return el.querySelector(s); };
    function save() { try { localStorage.setItem("mth_quiz_heal", JSON.stringify({ a: A, at: Date.now() })); } catch (e) {} }
    function exclusive(k) { return k === "none" || k === "nothing"; }

    function live() {
      var r = Core.score("heal", A), sec = i < N ? Q[i].s : S.length;
      $(".mq-num").textContent = r.answered ? r.score : "–";
      $(".mq-meter i").style.width = (r.answered ? r.score : 0) + "%";
      $(".mq-lvl").textContent = r.answered ? r.band : "Answer a few questions to see it";
      $(".mq-dots").innerHTML = S.map(function (x, j) { return '<span class="' + (j < sec ? "done" : j === sec ? "on" : "") + '" title="' + esc(x[0]) + '"></span>'; }).join("");
      $(".mq-foc").innerHTML = r.answered && i > 8 ? '<span>Your plan would lean on</span>' + r.focus.map(function (f) { return "<b>" + esc(f) + "</b>"; }).join("") : "";
      return r;
    }
    function ok(q) { return q.type === "multi" ? true : !!A[q.id]; }

    function draw() {
      $(".mq-prog i").style.width = Math.round((i / (N + 1)) * 100) + "%";
      $(".mq-back").style.visibility = i ? "visible" : "hidden";
      live();
      if (i >= N) return drawEmail();
      var q = Q[i], v = A[q.id], first = !i || Q[i - 1].s !== q.s;
      $(".mq-step").textContent = "Part " + (q.s + 1) + " of " + S.length + " · " + S[q.s][0];
      $(".mq-sechd").innerHTML = first ? '<p class="mq-intro">' + esc(S[q.s][1]) + "</p>" : "";
      $(".mq-body").innerHTML = '<h3 class="mq-q">' + esc(q.q) + "</h3>" + (q.hint ? '<p class="mq-hint">' + esc(q.hint) + "</p>" : "") +
        '<div class="mq-opts ' + (q.type === "multi" ? "multi" : "one") + '">' + q.o.map(function (o) {
          var on = q.type === "multi" ? (v || []).indexOf(o[0]) >= 0 : v === o[0];
          return '<button type="button" class="mq-o' + (on ? " on" : "") + '" data-v="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>" +
        '<p class="mq-count">Question ' + (i + 1) + " of " + N + "</p>";
      var nx = $(".mq-next"); nx.hidden = false; nx.disabled = !ok(q);
      nx.textContent = q.type === "multi" && !(v && v.length) ? "Skip" : i === N - 1 ? "See my results" : "Next";
      [].forEach.call(el.querySelectorAll(".mq-o"), function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-v");
          if (q.type === "multi") {
            var list = (A[q.id] || []).slice(), at = list.indexOf(k);
            if (exclusive(k)) list = at >= 0 ? [] : [k];
            else { if (at >= 0) list.splice(at, 1); else list.push(k); list = list.filter(function (x) { return !exclusive(x); }); }
            A[q.id] = list; save(); draw();
          } else { A[q.id] = k; save(); draw(); }   /* no auto-skip: the person presses Next */
        });
      });
    }

    function drawEmail() {
      var r = live();
      $(".mq-step").textContent = "Last step";
      $(".mq-sechd").innerHTML = '<p class="mq-intro">Thank you for being honest. Nothing here is a failure. It’s your starting point.</p>';
      $(".mq-next").hidden = true;
      $(".mq-body").innerHTML = '<h3 class="mq-q">Where should I send your results?</h3>' +
        '<p class="mq-hint">Your Healing Score, the 3 changes that matter most for you, what to check at home and work, and the plan that fits. Shown right here and sent to your inbox to keep.</p>' +
        '<form class="mq-form" novalidate><input class="mq-in" name="name" autocomplete="given-name" placeholder="First name"><input class="mq-in" name="email" type="email" inputmode="email" autocomplete="email" autocapitalize="none" placeholder="Your email" required>' +
        '<button class="mq-go" type="submit">Show my results</button><p class="mq-fine">Free. No spam; unsubscribe any time.</p></form>';
      var f = $(".mq-form");
      f.addEventListener("submit", async function (e) {
        e.preventDefault();
        var em = (f.email.value || "").trim(), nm = (f.name.value || "").trim(), b = f.querySelector(".mq-go");
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { f.email.focus(); f.email.classList.add("bad"); return; }
        b.disabled = true; b.textContent = "Building your results…";
        var src = el.getAttribute("data-source") || (window.MTH && MTH.page) || "quiz", emailed = false;
        try {
          if (window.MTH) { await MTH.ready; var j = await MTH.fn("mth-assess", { product: "heal", email: em, name: nm, answers: A, source: src, anon: MTH.anon, utm: MTH.utm ? MTH.utm() : null }); emailed = !!(j && j.emailed);
            if (!j || !j.ok) throw new Error((j && j.error) || "assess"); }
        } catch (err) {
          console.warn("assess", err);
          /* safety net: never lose the person, even if the results email couldn't go */
          try { if (window.MTH) await MTH.sb.rpc("mth_join", { p_email: em, p_name: nm || null, p_source: "assessment", p_anon: MTH.anon, p_utm: MTH.utm ? MTH.utm() : null }); } catch (e2) {}
        }
        full(r, nm, emailed);   /* they always see their results, even if the email couldn't go */
      });
    }

    function bar(label, pct, note) { return '<div class="mq-bar"><span>' + esc(label) + '</span><i><em style="width:' + pct + '%"></em></i><small>' + (note == null ? pct + "%" : note) + "</small></div>"; }
    function full(r, name, emailed) {
      $(".mq-grid").hidden = true;
      var box = $(".mq-full"); box.hidden = false;
      var cta = { now: "Start today", soon: "Here’s the plan when you’re ready", look: "Take a look at the plan" }[r.ready] || "Start your plan";
      box.innerHTML =
        (r.unsafe ? '<div class="mq-safe"><b>Your safety comes first.</b><p>You said you don’t always feel safe at home. You deserve to. If you’re in danger, call 911. In the US, the National Domestic Violence Hotline is free and confidential, 24/7: 1-800-799-7233 or thehotline.org. In Canada, find support near you at sheltersafe.ca.</p></div>' : "") +
        '<div class="mq-head"><div class="mq-k">Your Healing Assessment' + (name ? " · " + esc(name) : "") + '</div>' +
          '<div class="mq-big"><b>' + r.score + '</b><span>/ 100<br>Healing Score</span></div><h3>' + esc(r.band) + '</h3>' +
          (emailed ? '<p class="mq-sent">✓ A copy is on its way to your inbox.</p>' : "") + '</div>' +
        '<div class="mq-sec"><p class="mq-heard">' + (r.alone ? "You said you don’t have many people to lean on right now. That matters for your health as much as food does, and it’s why nobody in this program heals on their own." : "Your answers show the whole person: your diet, lifestyle, habits, work, stress and relationships, not just symptoms. That’s Lifestyle as Medicine, and it’s where real healing starts, and you won’t be doing it on your own.") + '</p>' +
          r.areas.map(function (x) { return bar(x.name, x.score, x.score + ""); }).join("") + "</div>" +
        '<div class="mq-sec"><h4>The 3 changes that matter most for you</h4>' + r.changes.map(function (c, j) {
          return '<div class="mq-chg"><span class="mq-n">' + (j + 1) + '</span><div><b>' + esc(c.step) + '</b>' +
            (c.because.length ? '<p class="mq-why">Why for you: ' + esc(c.because.join("; ")) + ".</p>" : "") +
            '<p><em>First step:</em> ' + esc(c.first) + "</p></div></div>"; }).join("") + "</div>" +
        (r.clues.length ? '<div class="mq-sec"><h4>Worth checking at home and work</h4><ul class="mq-clues">' + r.clues.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" : "") +
        '<div class="mq-sec"><h4>Your 7 healing steps, weighted for you</h4>' + r.plan.map(function (b) { return bar(b.step, b.pct); }).join("") + "</div>" +
        '<div class="mq-cta"><div class="mq-k">The plan that fits you</div><h4>' + esc(r.courseName) + '</h4>' +
          '<p>A personal app, the 7-part course and weekly support, built around the changes above. ' + esc(cta) + '.</p>' +
          '<button type="button" class="mq-buy">Start ' + esc(r.courseName.replace(/^The /, "")) + ' · $97</button>' +
          '<p class="mq-fine">An educational assessment based on your answers, not a medical diagnosis. Talk to your doctor before fasting or changing any medication.</p></div>';
      box.querySelector(".mq-buy").addEventListener("click", function () { if (window.MTH) MTH.buy(r.course, this); else location.href = r.sales + "#checkout"; });
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $(".mq-next").addEventListener("click", function () { if (i < N && ok(Q[i])) { i++; draw(); } });
    $(".mq-back").addEventListener("click", function () { if (i > 0) { i--; draw(); } });
    draw();
  }

  window.MTHQuiz = { mount: mount, mountAll: function (root) { [].forEach.call((root || document).querySelectorAll("[data-mth-quiz]"), function (el) { mount(el, el.getAttribute("data-mth-quiz")); }); } };
})();
