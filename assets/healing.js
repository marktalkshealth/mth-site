/* =================================================================
   MARK TALKS HEALTH — THE HEALING FRAMEWORK
   Part 1 · the Healing Snapshot intake (snapshot.html)
   Part 5 · the weekly check-in, trend, retest prompt and doctor report (checkin.html)
   Saves to Supabase (mth_snapshots, mth_checkins) for signed-in members; each
   member can only see their own. Educational, never a diagnosis.
================================================================= */
(function(){
  var H = window.HEAL = {};
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var store = { get: function(k){ try{ return JSON.parse(localStorage.getItem(k) || "null"); }catch(e){ return null; } }, set: function(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }, del: function(k){ try{ localStorage.removeItem(k); }catch(e){} } };
  var DRAFT = "mth_snapshot_draft", PENDING = "mth_snapshot_pending";

  /* ---------------- what we ask ---------------- */
  var SYMPTOMS = ["Bloating or gas", "Heartburn or reflux", "Constipation or diarrhea", "Joint pain", "Tiredness or low energy", "Brain fog", "Poor sleep", "Low mood", "Stress or anxiety", "Sugar or food cravings", "Headaches", "Skin problems", "Weight gain"];
  var FLAGS = [
    ["chest", "Chest pain, trouble breathing, or signs of a stroke (face drooping, arm weakness, slurred speech)"],
    ["blood", "Vomiting blood, or black or bloody stool"],
    ["pain", "Sudden, severe pain"],
    ["lump", "A new lump, or weight loss you can't explain"],
    ["faint", "Fainting or dizziness, especially while fasting"]
  ];
  var DIAG = ["Type 2 diabetes", "Prediabetes", "High blood pressure", "High cholesterol", "Fatty liver", "IBS", "Acid reflux (GERD)", "Stomach ulcer", "Arthritis or joint problems", "Obesity", "Sleep apnea", "Heart disease", "Thyroid condition", "Depression or anxiety", "Cancer (now or in the past)", "Pregnant"];
  var MEDS = ["A GLP-1 medication (e.g. Ozempic, Wegovy, Mounjaro)", "Insulin or diabetes pills", "Blood pressure medication", "Acid reducer (PPI)", "Painkillers like ibuprofen, often", "Antidepressants", "Physiotherapy", "A surgery or procedure coming up"];
  var DAMAGE = [
    { k: "smoke", q: "Do you smoke or vape?", o: ["No", "Sometimes", "Daily"], w: [0, 7, 10], fix: "Cut down on smoking or vaping, with a quit plan (your doctor or pharmacist can help)", tag: "Smoking / vaping" },
    { k: "alcohol", q: "Alcoholic drinks in a usual week", o: ["None", "1 to 7", "8 to 14", "15 or more"], w: [0, 3, 7, 9], fix: "Take a 2-week break from alcohol", tag: "Alcohol" },
    { k: "drugs", q: "Recreational drugs", o: ["No", "Sometimes", "Often"], w: [0, 6, 9], fix: "Cut back on recreational drugs (support lines can help)", tag: "Recreational drugs" },
    { k: "drinks", q: "Sugary or energy drinks", o: ["Rarely", "A few a week", "Daily"], w: [0, 3, 6], fix: "Swap sugary and energy drinks for water, tea or broth", tag: "Sugary / energy drinks" },
    { k: "processed", q: "Fast food or processed food", o: ["Rarely", "A few times a week", "Most days"], w: [0, 4, 7], fix: "Replace one processed meal a day with a high protein home-cooked meal", tag: "Processed food" },
    { k: "late", q: "Eating late at night", o: ["Rarely", "Sometimes", "Most nights"], w: [0, 2, 5], fix: "Close the kitchen 3 hours before bed", tag: "Late-night eating" },
    { k: "sleep", q: "Hours of sleep on a usual night", o: ["Under 5", "5 to 6", "6 to 7", "7 to 8", "Over 8"], w: [9, 7, 3, 0, 1], fix: "Same bedtime every night, aiming for 7 to 8 hours", tag: "Short sleep" },
    { k: "screens", q: "Screens in the hour before bed", o: ["No", "Sometimes", "Every night"], w: [0, 2, 4], fix: "No screens in the last hour before bed", tag: "Screens before bed" },
    { k: "move", q: "Moving your body (walks, exercise)", o: ["Most days", "A few times a week", "Rarely"], w: [0, 2, 6], fix: "A 15-minute walk outside every day", tag: "Not moving" }
  ];
  var LIFE = [
    { k: "stress", q: "Stress, overall" }, { k: "work", q: "Work (hours, pressure, rest days)" }, { k: "relationships", q: "Relationships at home" },
    { k: "money", q: "Money and debt" }, { k: "lonely", q: "Feeling alone or isolated" }
  ];
  var SCALE = ["Fine", "A little", "Some", "Hard", "Very hard"];

  /* ---------------- condition modules (Part 3) ---------------- */
  var MODULES = {
    gut: { name: "Gut Health", href: "gut.html", live: true },
    sugar: { name: "Diabetes & blood sugar", href: "diabetes.html", live: true },
    glp1: { name: "GLP-1 weight loss", href: "glp1.html", live: true },
    joints: { name: "Joints", live: false }, heart: { name: "Blood pressure & heart", live: false },
    sleep: { name: "Sleep", live: false }, mood: { name: "Stress & mood", live: false }
  };
  function sc(d, name){ return Number((d.symptoms || {})[name] || 0); }
  function has(list, word){ return (list || []).some(function(x){ return x.toLowerCase().indexOf(word.toLowerCase()) > -1; }); }
  function glucoseHigh(t){ var g = parseFloat(t.glucose); if (!g) return false; return t.gUnit === "mg/dL" ? g >= 100 : g >= 5.6; }
  function modulesFor(d){
    var t = d.tests || {}, m = [];
    if (sc(d, "Bloating or gas") >= 4 || sc(d, "Heartburn or reflux") >= 4 || sc(d, "Constipation or diarrhea") >= 4 || has(d.diag, "IBS") || has(d.diag, "reflux") || has(d.diag, "ulcer") || has(d.meds, "PPI")) m.push("gut");
    if (has(d.diag, "diabetes") || has(d.diag, "Prediabetes") || parseFloat(t.a1c) >= 5.7 || glucoseHigh(t) || has(d.meds, "Insulin") || has(d.diag, "Fatty liver")) m.push("sugar");
    if (has(d.meds, "GLP-1") || has(d.diag, "Obesity") || sc(d, "Weight gain") >= 5 || /weight|pound|lbs|kg|fat/i.test((d.goals || []).join(" "))) m.push("glp1");
    if (sc(d, "Joint pain") >= 4 || has(d.diag, "Arthritis")) m.push("joints");
    if (has(d.diag, "blood pressure") || has(d.diag, "Heart") || has(d.diag, "cholesterol") || parseFloat(t.sys) >= 130) m.push("heart");
    if (sc(d, "Poor sleep") >= 6 || ["Under 5", "5 to 6"].indexOf((d.damage || {}).sleep) > -1 || has(d.diag, "apnea")) m.push("sleep");
    if (sc(d, "Low mood") >= 6 || sc(d, "Stress or anxiety") >= 6 || has(d.diag, "Depression")) m.push("mood");
    return m;
  }

  /* ---------------- reading the answers ---------------- */
  function analyse(d){
    var sy = Object.keys(d.symptoms || {}).map(function(k){ return { name: k, score: Number(d.symptoms[k]) }; }).filter(function(x){ return x.score > 0; }).sort(function(a, b){ return b.score - a.score; });
    var dmg = DAMAGE.map(function(q){ var i = q.o.indexOf((d.damage || {})[q.k]); return { q: q, w: i > -1 ? q.w[i] : 0, a: (d.damage || {})[q.k] }; }).filter(function(x){ return x.w >= 3; }).sort(function(a, b){ return b.w - a.w; });
    var life = LIFE.map(function(q){ return { q: q, v: Number((d.life || {})[q.k] || 0) }; }).filter(function(x){ return x.v >= 4; }).sort(function(a, b){ return b.v - a.v; });
    var mods = modulesFor(d);
    // where to start: Phase 1 (Calm), never more than 3 actions
    var start = dmg.slice(0, 2).map(function(x){ return x.q.fix; });
    if (!dmg.some(function(x){ return x.q.k === "sleep"; }) && start.length < 3) start.push("Keep your sleep steady: same bedtime, 7 to 8 hours");
    if (start.length < 3) start.push("Drink about 2 litres of water a day, plus a cup of broth");
    if (start.length < 3) start.push("A 15-minute walk outside every day");
    return { top: sy.slice(0, 3), all: sy, damage: dmg, life: life, modules: mods, start: start.slice(0, 3), flags: (d.flags || []).filter(function(f){ return f !== "none"; }) };
  }

  /* ---------------- the form ---------------- */
  var D = null, S = 0;
  var STEPS = [
    { name: "How you feel", draw: drawFeel }, { name: "Your tests", draw: drawTests }, { name: "Diagnoses", draw: drawDiag },
    { name: "Medications & treatments", draw: drawMeds }, { name: "Daily damage", draw: drawDamage }, { name: "Your life", draw: drawLife }, { name: "Your goals", draw: drawGoals }
  ];
  function blank(){ var s = {}; SYMPTOMS.forEach(function(n){ s[n] = 0; }); return { v: 1, symptoms: s, flags: [], tests: { gUnit: "mmol/L", wUnit: "lb", waistUnit: "in" }, diag: [], diagOther: "", meds: [], medsOther: "", damage: {}, life: {}, safe: "", goals: ["", "", ""], name: "" }; }
  function save(){ store.set(DRAFT, { d: D, s: S, at: Date.now() }); }
  function opt(label, on, attrs, cls){ return '<span class="opt ' + (on ? "on " : "") + (cls || "") + '" role="button" tabindex="0" ' + (attrs || "") + '>' + esc(label) + "</span>"; }
  function multi(list, key, flagCls){ return '<div class="opts">' + list.map(function(x){ return opt(x, D[key].indexOf(x) > -1, 'data-multi="' + key + '" data-v="' + esc(x) + '"', flagCls); }).join("") + "</div>"; }
  function single(q, val, key, sub){ return '<div class="opts">' + q.map(function(x){ return opt(x, val === x, 'data-one="' + key + '" data-sub="' + (sub || "") + '" data-v="' + esc(x) + '"'); }).join("") + "</div>"; }

  function drawFeel(){
    var custom = Object.keys(D.symptoms).filter(function(k){ return SYMPTOMS.indexOf(k) < 0; });
    return '<h2>How do you feel?</h2><p class="why">Slide each one: 0 means it doesn\'t bother you, 10 means it\'s as bad as it gets. This is the starting line we measure your progress against.</p>' +
      SYMPTOMS.concat(custom).map(function(n){ var v = D.symptoms[n] || 0; return '<div class="sym"><span class="nm">' + esc(n) + '</span><span class="sc' + (v ? "" : " z") + '">' + v + '</span><input type="range" min="0" max="10" step="1" value="' + v + '" data-sym="' + esc(n) + '" aria-label="' + esc(n) + '"></div>'; }).join("") +
      '<div class="q"><div class="grid2"><input class="inp" id="addSym" placeholder="Something else? e.g. Back pain"><button class="b ghost" type="button" id="addSymB">Add it</button></div></div>' +
      '<div class="q"><span class="ql">Right now, do you have any of these?</span><div class="opts">' + FLAGS.map(function(f){ return opt(f[1], D.flags.indexOf(f[0]) > -1, 'data-flag="' + f[0] + '"', "flag"); }).join("") + opt("None of these", D.flags.indexOf("none") > -1, 'data-flag="none"') + "</div></div>" +
      '<div id="flagAlert"></div>';
  }
  function drawTests(){
    var t = D.tests;
    var f = function(k, label, ph){ return '<label class="fl">' + label + '<input class="inp" inputmode="decimal" data-test="' + k + '" value="' + esc(t[k] || "") + '" placeholder="' + (ph || "") + '"></label>'; };
    var u = function(k, list){ return '<label class="fl">Unit<select class="inp" data-test="' + k + '">' + list.map(function(x){ return "<option" + (t[k] === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></label>"; };
    return '<h2>Your tests</h2><p class="why">Only if you know them. These are the numbers we\'ll ask your doctor to retest in 8 to 12 weeks. Skip anything you don\'t have.</p>' +
      '<div class="grid3">' + f("a1c", "A1C (%)", "e.g. 6.1") + f("glucose", "Fasting blood sugar", "e.g. 6.2") + u("gUnit", ["mmol/L", "mg/dL"]) + "</div>" +
      '<div class="grid3" style="margin-top:12px">' + f("sys", "Blood pressure (top number)", "e.g. 135") + f("dia", "Blood pressure (bottom number)", "e.g. 85") + f("chol", "Cholesterol or other (optional)", "") + "</div>" +
      '<div class="grid3" style="margin-top:12px">' + f("weight", "Weight", "") + u("wUnit", ["lb", "kg"]) + "<span></span>" + f("waist", "Waist", "") + u("waistUnit", ["in", "cm"]) + f("when", "When were these taken?", "e.g. last month") + "</div>" +
      '<div class="q"><label>Any other test results worth noting? <span class="hint">e.g. iron, vitamin D, H. pylori, liver enzymes</span></label><textarea class="inp" data-test="other">' + esc(t.other || "") + "</textarea></div>";
  }
  function drawDiag(){
    return '<h2>Has a doctor diagnosed anything?</h2><p class="why">This unlocks the condition modules that fit you. Tap all that apply.</p>' + multi(DIAG, "diag") +
      '<div class="q"><label>Anything else a doctor has named?</label><input class="inp" data-text="diagOther" value="' + esc(D.diagOther) + '"></div>' +
      '<div id="pregAlert"></div>';
  }
  function drawMeds(){
    return '<h2>Medications and treatments</h2><p class="why">So your plan works <b>with</b> them, never against them. We never suggest stopping or changing a medication; that\'s always your doctor\'s decision.</p>' + multi(MEDS, "meds") +
      '<div class="q"><label>Anything else? <span class="hint">Names and doses help your doctor read your Snapshot</span></label><textarea class="inp" data-text="medsOther">' + esc(D.medsOther) + "</textarea></div>";
  }
  function drawDamage(){
    return '<h2>What\'s damaging your body every day?</h2><p class="why">No judgement here. Remove before you add: these answers decide what you work on first.</p>' +
      DAMAGE.map(function(q){ return '<div class="lifeq"><div class="ql">' + esc(q.q) + "</div>" + single(q.o, D.damage[q.k], "damage", q.k) + "</div>"; }).join("");
  }
  function drawLife(){
    return '<h2>What\'s going on in your life?</h2><p class="why">The causes most programs never ask about. How hard is each one right now?</p>' +
      LIFE.map(function(q){ var v = D.life[q.k]; return '<div class="lifeq"><div class="ql">' + esc(q.q) + '</div><div class="scale">' + SCALE.map(function(s, i){ return opt(s, v === i + 1, 'data-life="' + q.k + '" data-v="' + (i + 1) + '"'); }).join("") + "</div></div>"; }).join("") +
      '<div class="lifeq"><div class="ql">Do you feel safe at home?</div>' + single(["Yes", "No", "I'd rather not say"], D.safe, "safe") + '</div><div id="safeAlert"></div>';
  }
  function drawGoals(){
    return '<h2>What does success look like for you?</h2><p class="why">In your own words, up to three. e.g. "Walk without knee pain", "Get off the antacids with my doctor\'s OK", "Lose 30 pounds".</p>' +
      [0, 1, 2].map(function(i){ return '<div class="q"><input class="inp" data-goal="' + i + '" value="' + esc(D.goals[i] || "") + '" placeholder="Goal ' + (i + 1) + '"></div>'; }).join("") +
      '<div class="q"><label>Your first name <span class="hint">(optional, for the top of your Snapshot)</span></label><input class="inp" data-text="name" value="' + esc(D.name) + '"></div>';
  }
  function alerts(){
    var fa = $("#flagAlert"); if (fa) fa.innerHTML = D.flags.some(function(f){ return f !== "none"; }) ? '<div class="alert"><b>Please get checked by a doctor first.</b>' + (D.flags.indexOf("chest") > -1 || D.flags.indexOf("blood") > -1 ? "Chest pain, trouble breathing, stroke signs, vomiting blood or black stool can be an emergency: call 911 or go to the nearest emergency department now. " : "") + "Any of these needs a doctor before you change your diet, fast or start a new routine. You can still finish your Snapshot and take it with you.</div>" : "";
    var pa = $("#pregAlert"); if (pa) pa.innerHTML = D.diag.indexOf("Pregnant") > -1 ? '<div class="alert"><b>Congratulations, and one important note.</b>Fasting and cleanses aren\'t for pregnancy. Your Snapshot will focus on gentle, food-first steps; check every change with your doctor or midwife.</div>' : "";
    var sa = $("#safeAlert"); if (sa) sa.innerHTML = D.safe === "No" ? '<div class="alert"><b>Your safety comes before any health plan.</b>If you\'re being hurt or threatened at home, you\'re not alone. In Canada, the Assaulted Women\'s Helpline is 1-866-863-0511; in the US, the National Domestic Violence Hotline is 1-800-799-7233 (or text START to 88788). In danger right now? Call 911.</div>' : "";
  }
  function bind(){
    var card = $("#step");
    card.oninput = function(e){
      var el = e.target;
      if (el.dataset.sym != null){ D.symptoms[el.dataset.sym] = Number(el.value); var s = el.parentNode.querySelector(".sc"); s.textContent = el.value; s.classList.toggle("z", el.value === "0"); }
      if (el.dataset.test) D.tests[el.dataset.test] = el.value.trim();
      if (el.dataset.text) D[el.dataset.text] = el.value;
      if (el.dataset.goal) D.goals[Number(el.dataset.goal)] = el.value;
      save();
    };
    card.onchange = card.oninput;
    var tap = function(e){
      var el = e.target.closest(".opt"); if (!el) return;
      if (el.dataset.multi){ var k = el.dataset.multi, v = el.dataset.v, i = D[k].indexOf(v); if (i > -1) D[k].splice(i, 1); else D[k].push(v); el.classList.toggle("on"); }
      else if (el.dataset.flag){ var f = el.dataset.flag;
        if (f === "none") D.flags = D.flags.indexOf("none") > -1 ? [] : ["none"];
        else { D.flags = D.flags.filter(function(x){ return x !== "none"; }); var j = D.flags.indexOf(f); if (j > -1) D.flags.splice(j, 1); else D.flags.push(f); }
        card.querySelectorAll("[data-flag]").forEach(function(o){ o.classList.toggle("on", D.flags.indexOf(o.dataset.flag) > -1); }); }
      else if (el.dataset.one){ var key = el.dataset.one, sub = el.dataset.sub;
        if (sub) D[key][sub] = el.dataset.v; else D[key] = el.dataset.v;
        el.parentNode.querySelectorAll(".opt").forEach(function(o){ o.classList.toggle("on", o === el); }); }
      else if (el.dataset.life){ D.life[el.dataset.life] = Number(el.dataset.v); el.parentNode.querySelectorAll(".opt").forEach(function(o){ o.classList.toggle("on", o === el); }); }
      alerts(); save();
    };
    card.onclick = tap;
    card.onkeydown = function(e){ if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("opt")){ e.preventDefault(); tap(e); } };
    var ab = $("#addSymB"); if (ab) ab.onclick = function(){ var n = $("#addSym").value.trim(); if (!n) return; D.symptoms[n] = 5; save(); show(); };
  }
  function show(){
    var st = STEPS[S];
    $("#stepName").textContent = st.name; $("#stepOf").textContent = "Step " + (S + 1) + " of " + STEPS.length;
    $("#pbar").style.width = Math.round(S / STEPS.length * 100) + "%";
    $("#step").innerHTML = st.draw(); bind(); alerts();
    $("#back").style.visibility = S ? "visible" : "hidden";
    $("#next").textContent = S === STEPS.length - 1 ? "See my Snapshot" : "Next";
  }

  /* ---------------- the Snapshot ---------------- */
  function fmtTests(t){
    var out = [];
    if (t.a1c) out.push(["A1C", t.a1c + "%"]);
    if (t.glucose) out.push(["Fasting blood sugar", t.glucose + " " + (t.gUnit || "")]);
    if (t.sys || t.dia) out.push(["Blood pressure", (t.sys || "?") + "/" + (t.dia || "?")]);
    if (t.weight) out.push(["Weight", t.weight + " " + (t.wUnit || "")]);
    if (t.waist) out.push(["Waist", t.waist + " " + (t.waistUnit || "")]);
    if (t.chol) out.push(["Other", t.chol]);
    return out;
  }
  H.snapshotHtml = function(d, when){
    var a = analyse(d), t = d.tests || {}, tests = fmtTests(t);
    var date = new Date(when || Date.now()).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
    var live = a.modules.filter(function(m){ return MODULES[m].live; });
    var first = live[0] ? MODULES[live[0]] : null;
    return '<div class="card snap">' +
      '<div class="head"><div><div class="kick">Mark Talks Health · Part 1</div><h2>' + (d.name ? esc(d.name) + "'s " : "Your ") + 'Healing Snapshot</h2></div><div class="meta">' + date + "<br>Educational, not a diagnosis</div></div>" +
      (a.flags.length ? '<div class="alert"><b>See a doctor before starting anything new.</b>You reported: ' + a.flags.map(function(f){ return esc((FLAGS.filter(function(x){ return x[0] === f; })[0] || [0, f])[1]); }).join("; ") + ".</div>" : "") +
      '<div class="cols"><div><h3>Top problems</h3>' + (a.top.length ? a.top.map(function(s){ return '<div class="bar"><span>' + esc(s.name) + '</span><span class="tr"><i style="width:' + s.score * 10 + '%"></i></span><b>' + s.score + "</b></div>"; }).join("") : "<p>No symptoms scored.</p>") + "</div>" +
      "<div><h3>Biggest sources of damage</h3>" + (a.damage.length ? "<ol>" + a.damage.slice(0, 4).map(function(x){ return "<li><b>" + esc(x.q.tag) + "</b> · " + esc(x.a) + "</li>"; }).join("") + "</ol>" : "<p>Nothing major. Great foundation.</p>") +
      (a.life.length ? "<h3>Life pressures</h3><ul>" + a.life.map(function(x){ return "<li>" + esc(x.q.q) + ": <b>" + SCALE[x.v - 1].toLowerCase() + "</b></li>"; }).join("") + "</ul>" : "") + "</div></div>" +
      "<h3>Where to start · weeks 1 and 2 (Calm)</h3><div class=\"start\"><b>Three actions, nothing more:</b><ol>" + a.start.map(function(s){ return "<li>" + esc(s) + "</li>"; }).join("") + "</ol></div>" +
      "<h3>Your condition modules</h3>" + (a.modules.length ? a.modules.map(function(m){ var M = MODULES[m]; return M.live ? '<a class="mod" href="' + M.href + '">' + esc(M.name) + " →</a>" : '<span class="mod soon">' + esc(M.name) + " · coming soon</span>"; }).join("") : '<p>None needed yet. The 7-step foundation is your plan.</p>') +
      '<div class="cols"><div><h3>Tests to retest in 8–12 weeks</h3>' + (tests.length ? "<ul>" + tests.map(function(x){ return "<li>" + x[0] + ": <b>" + esc(x[1]) + "</b></li>"; }).join("") + "</ul>" + (t.when ? '<p class="small">Taken: ' + esc(t.when) + "</p>" : "") : "<p>None given. Ask your doctor for A1C, fasting blood sugar and blood pressure so we have a starting point.</p>") + (t.other ? "<p>" + esc(t.other) + "</p>" : "") + "</div>" +
      "<div><h3>Diagnoses &amp; treatments (as reported)</h3>" + ((d.diag || []).length || d.diagOther ? "<p>" + esc((d.diag || []).concat(d.diagOther ? [d.diagOther] : []).join(", ")) + "</p>" : "<p>None reported.</p>") + ((d.meds || []).length || d.medsOther ? "<p>" + esc((d.meds || []).concat(d.medsOther ? [d.medsOther] : []).join("; ")) + "</p>" : "") + "</div></div>" +
      ((d.goals || []).filter(Boolean).length ? "<h3>Goals</h3><ul>" + d.goals.filter(Boolean).map(function(g){ return "<li>" + esc(g) + "</li>"; }).join("") + "</ul>" : "") +
      '<div class="doc"><b>For my doctor:</b> I\'m following a lifestyle program (sleep, food, movement, stress) alongside your care. I won\'t change any medication without you. I\'d like to retest the numbers above in 8 to 12 weeks.</div>' +
      '<div class="foot">marktalkshealth.com · Educational program, not medical advice, diagnosis or treatment.</div></div>' +
      '<div class="acts noprint"><button class="b" type="button" onclick="window.print()">Print or save as PDF</button>' + (first ? '<a class="b ghost" href="' + first.href + '">Start with ' + esc(first.name) + "</a>" : '<a class="b ghost" href="protocols.html">See the courses</a>') + '<a class="b ghost" href="checkin.html">Weekly check-in</a></div>';
  };

  async function persist(d){
    if (!window.MTH) return { ok: false };
    await MTH.ready.catch(function(){});
    if (!MTH.user) return { ok: false, signin: true };
    var a = analyse(d);
    var r = await MTH.sb.from("mth_snapshots").insert({ user_id: MTH.user.id, data: d, red_flags: a.flags }).select("id,created_at").single();
    if (r.error) { console.warn("[heal] snapshot not saved", r.error); return { ok: false, error: r.error.message }; }
    return { ok: true, row: r.data };
  }
  function finish(){
    var d = D;
    $("#form").hidden = true; $("#intro").hidden = true;
    var res = $("#result"); res.hidden = false;
    res.innerHTML = H.snapshotHtml(d) + '<div class="card saveb noprint" id="saveBox"><p>Saving your Snapshot…</p></div>';
    window.scrollTo(0, 0);
    try { MTH.track && MTH.track("snapshot"); } catch(e){}
    persist(d).then(function(r){
      var box = $("#saveBox");
      if (r.ok){ store.del(DRAFT); store.del(PENDING); box.innerHTML = "<p><b>Saved to your account.</b> Come back once a week for your 2-minute check-in, and we'll show your progress against this Snapshot.</p><a class=\"b sm\" href=\"checkin.html\">Open check-in</a>"; }
      else if (r.signin){ store.set(PENDING, { d: d, at: Date.now() }); box.innerHTML = "<p><b>Save it and track your progress.</b> Sign in (free) and we'll keep your Snapshot so your weekly check-ins can show how far you've come.</p><a class=\"b sm\" href=\"" + MTH.loginUrl("snapshot.html?save=1") + "\">Sign in to save</a>"; }
      else box.innerHTML = "<p>Your Snapshot is ready, but we couldn't save it just now. Print it or save it as a PDF so you don't lose it.</p>";
    });
  }

  H.snapshotPage = function(){
    var start = function(fresh){
      var dr = store.get(DRAFT);
      D = !fresh && dr && dr.d ? dr.d : blank(); S = !fresh && dr ? Math.min(dr.s || 0, STEPS.length - 1) : 0;
      $("#intro").hidden = true; $("#form").hidden = false; show(); window.scrollTo(0, 0);
    };
    $("#go").onclick = function(){ start(false); };
    var dr = store.get(DRAFT);
    if (dr && dr.d){ $("#go").textContent = "Continue where you left off"; var nb = document.createElement("button"); nb.className = "b ghost"; nb.type = "button"; nb.textContent = "Start over"; nb.onclick = function(){ store.del(DRAFT); start(true); }; $("#go").after(nb); }
    $("#back").onclick = function(){ if (S > 0){ S--; save(); show(); window.scrollTo(0, 0); } };
    $("#next").onclick = function(){ if (S < STEPS.length - 1){ S++; save(); show(); window.scrollTo(0, 0); } else finish(); };
    // came back from signing in: save the Snapshot they just made
    if (MTH.qs && MTH.qs("save")){
      var p = store.get(PENDING);
      if (p && p.d){ D = p.d; finish(); }
    }
  };

  /* ================= Part 5 · weekly check-in ================= */
  var WELL = ["Sleep quality", "Energy", "Mood"];
  var TIPS = {
    "Bloating or gas": "Eat slowly and stop at 80% full, and try a cup of bone broth instead of a snack.",
    "Heartburn or reflux": "Close the kitchen 3 hours before bed and raise the head of your bed a little.",
    "Constipation or diarrhea": "Add one high-fibre vegetable to lunch and drink a glass of water first thing.",
    "Joint pain": "Take collagen with vitamin C 30 to 60 minutes before a short strength session.",
    "Tiredness or low energy": "Get 10 minutes of morning sunlight and move bedtime 30 minutes earlier.",
    "Brain fog": "Swap one processed meal for a high protein meal and take a 10-minute walk after lunch.",
    "Poor sleep": "No screens in the last hour before bed, and keep the room dark and cool.",
    "Low mood": "A daily walk in nature and one call to a friend this week.",
    "Stress or anxiety": "Five minutes of slow breathing or meditation, twice a day.",
    "Sugar or food cravings": "Add 25 to 30 grams of protein to breakfast.",
    "Headaches": "Drink about 2 litres of water a day and keep regular meal times.",
    "Skin problems": "Cut sugary drinks completely for two weeks.",
    "Weight gain": "Close the kitchen 3 hours before bed and walk 15 minutes after dinner."
  };
  function linePath(pts, x, y){ return pts.map(function(p, i){ return (i ? "L" : "M") + x(p[0]).toFixed(1) + "," + y(p[1]).toFixed(1); }).join(" "); }
  function trendSvg(series, labels){
    var W = 760, Hh = 260, L = 34, R = 12, T = 12, B = 34, n = Math.max(2, labels.length);
    var x = function(i){ return L + (W - L - R) * i / (n - 1); }, y = function(v){ return T + (Hh - T - B) * (1 - v / 10); };
    var g = "";
    for (var v = 0; v <= 10; v += 5) g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e7dccb"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="#a8998b">' + v + "</text>";
    labels.forEach(function(l, i){ if (labels.length <= 8 || i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) g += '<text x="' + x(i) + '" y="' + (Hh - 10) + '" text-anchor="middle" font-size="11" fill="#a8998b">' + esc(l) + "</text>"; });
    series.forEach(function(s){ var pts = s.v.map(function(v, i){ return [i, v]; }).filter(function(p){ return p[1] != null; }); if (!pts.length) return;
      g += '<path d="' + linePath(pts, x, y) + '" fill="none" stroke="' + s.c + '" stroke-width="' + (s.bold ? 3.5 : 2) + '" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="5 5"' : "") + "/>";
      pts.forEach(function(p){ g += '<circle cx="' + x(p[0]) + '" cy="' + y(p[1]) + '" r="' + (s.bold ? 4 : 3) + '" fill="' + s.c + '"/>'; }); });
    return '<svg viewBox="0 0 ' + W + " " + Hh + '" role="img" aria-label="Your scores over time">' + g + "</svg>";
  }
  var COLORS = ["#c0623f", "#7a8f6e", "#b8924a", "#2b2724", "#8a6fa8", "#3f7f9a"];

  H.checkinPage = async function(){
    var box = $("#ci");
    box.innerHTML = '<div class="card" style="padding:22px">Loading…</div>';
    await MTH.ready.catch(function(){});
    if (!MTH.user){ box.innerHTML = '<div class="card" style="padding:24px"><p style="margin-top:0">Sign in to see your progress and record this week\'s check-in.</p><div class="acts" style="margin-top:0"><a class="b" href="' + MTH.loginUrl() + '">Sign in</a><a class="b ghost" href="snapshot.html">Make your Snapshot first</a></div></div>'; return; }
    var sr = await MTH.sb.from("mth_snapshots").select("id,data,created_at").order("created_at", { ascending: false }).limit(1);
    if (sr.error){ box.innerHTML = '<div class="card" style="padding:24px">The check-in isn\'t switched on yet. Please try again a little later.</div>'; return; }
    var snap = (sr.data || [])[0];
    if (!snap){ box.innerHTML = '<div class="card" style="padding:24px"><p style="margin-top:0"><b>First, your Healing Snapshot.</b> Your check-ins measure progress against it.</p><a class="b" href="snapshot.html">Start your Snapshot</a></div>'; return; }
    var cr = await MTH.sb.from("mth_checkins").select("id,scores,note,created_at").eq("snapshot_id", snap.id).order("created_at", { ascending: true });
    var cks = cr.data || [];
    var base = analyse(snap.data);
    var track = (base.all.length ? base.all : [{ name: "Tiredness or low energy", score: 0 }]).slice(0, 6).map(function(s){ return s.name; });
    var last = cks[cks.length - 1];
    var days = last ? (Date.now() - new Date(last.created_at)) / 864e5 : 99;
    var weeks = Math.floor((Date.now() - new Date(snap.created_at)) / (7 * 864e5));
    var cur = {}; track.concat(WELL).forEach(function(k){ cur[k] = last && last.scores[k] != null ? last.scores[k] : k in snap.data.symptoms ? snap.data.symptoms[k] : 5; });

    function form(){
      return '<div class="card stepcard"><h2>This week</h2><p class="why">' + (last ? "Last check-in " + Math.round(days) + " day" + (Math.round(days) === 1 ? "" : "s") + " ago." + (days < 5 ? " Weekly works best, but you can update any time." : "") : "Your first check-in since your Snapshot.") + "</p>" +
        '<div class="kick" style="margin-top:4px">Symptoms · 0 = no problem, 10 = as bad as it gets</div>' +
        track.map(function(n){ return '<div class="sym"><span class="nm">' + esc(n) + '</span><span class="sc">' + cur[n] + '</span><input type="range" min="0" max="10" value="' + cur[n] + '" data-k="' + esc(n) + '"></div>'; }).join("") +
        '<div class="kick" style="margin-top:16px">How you are · 0 = very poor, 10 = excellent</div>' +
        WELL.map(function(n){ return '<div class="sym"><span class="nm">' + esc(n) + '</span><span class="sc">' + cur[n] + '</span><input type="range" min="0" max="10" value="' + cur[n] + '" data-k="' + esc(n) + '"></div>'; }).join("") +
        '<div class="q"><label>What did you change this week? <span class="hint">(this goes in your doctor report)</span></label><textarea class="inp" id="ciNote" placeholder="e.g. No alcohol, walked every day, in bed by 10:30"></textarea></div>' +
        '<div class="acts"><button class="b" type="button" id="ciSave">Save this week</button></div><div id="ciMsg"></div></div>';
    }
    function advice(){
      var out = [];
      if (cks.length >= 2){
        var a = cks[cks.length - 2].scores, b = cks[cks.length - 1].scores;
        var worse = track.filter(function(k){ return (b[k] || 0) - (snap.data.symptoms[k] || 0) >= 2; });
        if (worse.length) out.push('<div class="alert"><b>' + esc(worse.join(", ")) + " got worse since your Snapshot.</b>Please check in with your doctor about it. Don't change any medication on your own.</div>");
        var stuck = track.filter(function(k){ return (b[k] || 0) >= 4 && Math.abs((b[k] || 0) - (a[k] || 0)) <= 1 && Math.abs((a[k] || 0) - (snap.data.symptoms[k] || 0)) <= 1; });
        if (stuck.length && !worse.length){ var k = stuck[0]; out.push('<div class="tip"><b>' + esc(k) + " has been stuck for two weeks. Try one change:</b>" + esc(TIPS[k] || "Pick the next item on your foundation list and add it this week.") + "</div>"); }
      }
      var tests = fmtTests(snap.data.tests || {});
      if (weeks >= 8) out.push('<div class="tip"><b>Time to retest.</b>It\'s been ' + weeks + " weeks since your Snapshot. Ask your doctor to repeat " + (tests.length ? tests.map(function(x){ return x[0]; }).join(", ") : "your A1C, fasting blood sugar and blood pressure") + ", then compare them with your starting numbers.</div>");
      return out.join("");
    }
    function chart(){
      var labels = ["Start"].concat(cks.map(function(c){ return new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }));
      var series = track.map(function(k, i){ return { c: COLORS[i % COLORS.length], v: [snap.data.symptoms[k] || 0].concat(cks.map(function(c){ return c.scores[k]; })), name: k }; });
      return '<div class="card trend"><div class="kick">Your symptoms over time · lower is better</div>' + trendSvg(series, labels) +
        '<div class="legend">' + series.map(function(s){ return '<span><i style="background:' + s.c + '"></i>' + esc(s.name) + "</span>"; }).join("") + "</div></div>";
    }
    function report(){
      var lastS = cks.length ? cks[cks.length - 1].scores : null;
      var rows = track.map(function(k){ var a0 = snap.data.symptoms[k] || 0, b0 = lastS ? lastS[k] : null; return "<tr><td>" + esc(k) + "</td><td>" + a0 + "</td><td>" + (b0 == null ? "–" : b0) + "</td><td>" + (b0 == null ? "" : b0 < a0 ? "▼ " + (a0 - b0) : b0 > a0 ? "▲ " + (b0 - a0) : "=") + "</td></tr>"; }).join("");
      var notes = cks.filter(function(c){ return c.note; }).map(function(c){ return "<li><b>" + new Date(c.created_at).toLocaleDateString() + ":</b> " + esc(c.note) + "</li>"; }).join("");
      return '<div class="card snap" id="docReport" hidden><div class="head"><div><div class="kick">Mark Talks Health · Part 5</div><h2>Progress report for my doctor</h2></div><div class="meta">' + new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) + "<br>Started " + new Date(snap.created_at).toLocaleDateString() + " · " + weeks + " weeks</div></div>" +
        '<h3>Symptoms (0 = none, 10 = worst)</h3><table style="width:100%;border-collapse:collapse;font-size:14px"><tr style="text-align:left;border-bottom:1px solid #e7dccb"><th>Symptom</th><th>Start</th><th>Now</th><th>Change</th></tr>' + rows + "</table>" +
        "<h3>What I changed</h3>" + (notes ? "<ul>" + notes + "</ul>" : "<p>No notes yet.</p>") +
        "<h3>Starting test numbers</h3>" + (fmtTests(snap.data.tests || {}).map(function(x){ return x[0] + ": <b>" + esc(x[1]) + "</b>"; }).join(" · ") || "None recorded.") +
        '<div class="doc">I\'d like to repeat my original tests and compare. I haven\'t changed any medication on my own; any change is your decision.</div><div class="foot">marktalkshealth.com · Educational program, not medical advice.</div></div>';
    }
    function draw(){
      box.innerHTML = advice() + form() + (cks.length ? chart() : "") +
        '<div class="acts noprint"><button class="b ghost" type="button" id="docB">Doctor report</button><a class="b ghost" href="snapshot.html">New Snapshot</a></div>' + report();
      box.oninput = function(e){ var el = e.target; if (el.dataset.k){ cur[el.dataset.k] = Number(el.value); el.parentNode.querySelector(".sc").textContent = el.value; } };
      $("#docB").onclick = function(){ var r = $("#docReport"); r.hidden = false; r.scrollIntoView({ behavior: "smooth" }); document.body.classList.add("print-report"); setTimeout(function(){ window.print(); document.body.classList.remove("print-report"); }, 400); };
      $("#ciSave").onclick = async function(){
        var b = this; b.disabled = true;
        var r = await MTH.sb.from("mth_checkins").insert({ user_id: MTH.user.id, snapshot_id: snap.id, scores: cur, note: ($("#ciNote").value || "").trim() || null }).select("id,scores,note,created_at").single();
        b.disabled = false;
        if (r.error){ $("#ciMsg").innerHTML = '<div class="alert">Couldn\'t save just now. Please try again.</div>'; return; }
        cks.push(r.data); last = r.data; days = 0; draw();
        MTH.toast && MTH.toast("Saved. See you next week.");
      };
    }
    draw();
  };
})();
