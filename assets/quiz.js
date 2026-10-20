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

  function mount(el, product) {
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
          '<div class="mq-meter"><i></i></div><div class="mq-lvl">Gut stress level will show here</div><div class="mq-foc"></div>' +
          '<p class="mq-fine">An educational pattern, not a diagnosis.</p></aside>' +
      '</div>' +
      '<div class="mq-full" hidden></div>';
    var $ = function (s) { return el.querySelector(s); };

    function save() { try { localStorage.setItem("mth_quiz_" + C.product, JSON.stringify({ a: A, at: Date.now() })); } catch (e) {} }
    function live() {
      var r = Core.score(C.product, A);
      $(".mq-imp").textContent = r.answered ? r.impression : "Answer to see it";
      $(".mq-meter i").style.width = r.pct + "%";
      $(".mq-lvl").textContent = r.answered ? "Gut stress: " + r.stress + (A.freq ? " · suggested start: " + r.levelName.split(" · ")[0] : "") : "Gut stress level will show here";
      $(".mq-foc").innerHTML = r.answered ? '<span>Your plan would lean on</span>' + r.focus.map(function (f) { return "<b>" + esc(f) + "</b>"; }).join("") : "";
      return r;
    }
    function answered(q) { var v = A[q.id]; return q.type === "multi" ? (q.id !== "sym" || (v && v.length)) : !!v; }

    function draw() {
      $(".mq-prog i").style.width = Math.round((i / (N + 1)) * 100) + "%";
      $(".mq-back").style.visibility = i ? "visible" : "hidden";
      if (i >= N) return drawEmail();
      var q = Q[i], v = A[q.id];
      $(".mq-step").textContent = "Question " + (i + 1) + " of " + N;
      $(".mq-body").innerHTML = '<h3 class="mq-q">' + esc(q.q) + "</h3>" + (q.hint ? '<p class="mq-hint">' + esc(q.hint) + "</p>" : "") +
        '<div class="mq-opts ' + (q.type === "multi" ? "multi" : "one") + '">' + q.o.map(function (o) {
          var on = q.type === "multi" ? (v || []).indexOf(o[0]) >= 0 : v === o[0];
          return '<button type="button" class="mq-o' + (on ? " on" : "") + '" data-v="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
      var nx = $(".mq-next"); nx.hidden = false; nx.textContent = q.type === "multi" && !(v && v.length) && q.id !== "sym" ? "Skip" : "Next"; nx.disabled = !answered(q);
      [].forEach.call(el.querySelectorAll(".mq-o"), function (b) {
        b.addEventListener("click", function () {
          var k = b.getAttribute("data-v");
          if (q.type === "multi") {
            var list = (A[q.id] || []).slice(), at = list.indexOf(k);
            if (k === "nothing") list = at >= 0 ? [] : ["nothing"]; else { if (at >= 0) list.splice(at, 1); else list.push(k); list = list.filter(function (x) { return x !== "nothing"; }); }
            A[q.id] = list; save(); live(); draw();
          } else { A[q.id] = k; save(); live(); draw(); setTimeout(function () { if (i < N && Q[i] === q) { i++; draw(); } }, 260); }
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
      var max = Math.max.apply(null, r.arc.map(function (d) { return d.kcal; }));
      box.innerHTML =
        '<div class="mq-head"><div class="mq-k">Your gut assessment' + (name ? " · " + esc(name) : "") + '</div><h3>' + esc(r.impression) + '</h3>' +
          '<p>Gut stress: <b>' + esc(r.stress) + '</b> · Suggested start: <b>' + esc(r.levelName) + '</b></p>' +
          (emailed ? '<p class="mq-sent">✓ A copy is on its way to your inbox.</p>' : "") + '</div>' +
        (r.patterns.length ? '<div class="mq-sec"><h4>Areas to focus on</h4>' + r.patterns.map(function (p) { return '<div class="mq-pat"><b>' + esc(p.label) + "</b><p>" + esc(p.text) + "</p></div>"; }).join("") + "</div>" : "") +
        '<div class="mq-sec"><h4>Your 7 healing steps, ranked for you</h4>' + r.plan.map(function (b) { return '<div class="mq-bar"><span>' + esc(b.step) + '</span><i><em style="width:' + b.pct + '%"></em></i><small>' + b.pct + "%</small></div>"; }).join("") + "</div>" +
        '<div class="mq-sec"><h4>Your first 7 days</h4><div class="mq-arc">' + r.arc.map(function (d) {
          return '<div class="mq-day"><div class="mq-col"><em style="height:' + Math.round(d.kcal / max * 100) + '%"></em></div><b>Day ' + d.d + "</b><span>" + esc(d.t) + "</span><small>" + esc(d.n) + "</small></div>"; }).join("") + "</div></div>" +
        '<div class="mq-cta"><p>Your full protocol builds on this with your test results, a day-by-day plan, high-protein meals and the 7-part course.</p>' +
          '<button type="button" class="mq-buy">Start ' + esc(C.name) + ' · $97</button><p class="mq-fine">An educational assessment, not a medical diagnosis.</p></div>';
      box.querySelector(".mq-buy").addEventListener("click", function () { if (window.MTH) MTH.buy(C.product, this); else location.href = C.sales + "#checkout"; });
      box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    $(".mq-next").addEventListener("click", function () { if (i < N && answered(Q[i])) { i++; draw(); } });
    $(".mq-back").addEventListener("click", function () { if (i > 0) { i--; draw(); } });
    live(); draw();
  }

  window.MTHQuiz = { mount: mount, mountAll: function (root) { [].forEach.call((root || document).querySelectorAll("[data-mth-quiz]"), function (el) { mount(el, el.getAttribute("data-mth-quiz")); }); } };
})();
