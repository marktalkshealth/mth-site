/* Talk to Your Doctor — shared by the Gut, Diabetes and GLP-1 apps.
   1. A short guide: prepare, say it the clinical way, questions about tests, bringing up the healing plan,
      GLP-1 questions, and what to do if you feel brushed off.
   2. A one-page Doctor Visit Summary built from what the member already entered in the app
      (symptoms, history, red flags, uploaded test results, patterns, recommended tests) plus a few
      things only they know (how long, medications, supplements, top questions). Print or copy it.
   It helps people communicate. It never diagnoses and never says to change a medication.
   Mounts into #docTalk (inside .hc-risk-row, so phones show it in the Arc tab under the risk list). */
(function () {
  'use strict';
  var PROTO = (location.pathname.match(/\/(gut|sugar|glp1)\b/) || [, 'gut'])[1];
  var PNAME = { gut: 'Gut Health Protocol', sugar: 'Diabetes Protocol', glp1: 'GLP-1 Protocol' }[PROTO];
  var KEY = 'mth_doc_' + PROTO;

  // ---------- plain words → clinical wording (one line per symptom the app asks about) ----------
  var CLIN = {
    bloat: 'abdominal bloating and distension', gas: 'excess gas and belching', pain: 'abdominal pain or cramping',
    constip: 'constipation (infrequent or hard stools)', loose: 'loose stools / diarrhea', alt: 'alternating constipation and diarrhea',
    urgency: 'fecal urgency or a feeling of incomplete evacuation', mucus: 'mucus in the stool', greasy: 'greasy, floating or undigested stools',
    reflux: 'heartburn / acid reflux', nausea: 'nausea', fullness: 'early satiety and fullness after meals',
    throat: 'hoarseness, throat clearing or chronic cough', breath: 'halitosis / coated tongue', crash: 'fatigue after meals',
    fog: 'difficulty concentrating ("brain fog")', fatigue: 'persistent fatigue', crave: 'strong sugar or carbohydrate cravings',
    mood: 'anxiety or low mood', sleep: 'poor or broken sleep', foodsens: 'reactions to specific foods',
    skin: 'skin symptoms (eczema, rashes, acne or rosacea)', histamine: 'flushing, hives or nasal congestion after eating',
    allergy: 'seasonal allergies or frequent infections', lowiron: 'a history of low iron, B12 or vitamin D', joint: 'joint pain',
    nerve: 'nerve pain', numb: 'numbness or tingling in the hands or feet', headache: 'headaches or migraines', mouth: 'recurrent mouth ulcers',
    abx: 'antibiotics in the past year', nsaid: 'regular NSAID use (ibuprofen, aspirin)', ppi: 'long-term acid-suppressing medication (PPIs / antacids)',
    alcohol: 'regular alcohol use', stress: 'high ongoing stress', famhx: 'family history of IBD, celiac disease or colon cancer',
    blood: 'blood in the stool or black, tarry stools', wtloss: 'unintentional weight loss', fever: 'fever or night sweats',
    swallow: 'difficulty or pain swallowing', vomit: 'persistent vomiting', night: 'symptoms that wake me at night'
  };
  var HIST = ['abx', 'nsaid', 'ppi', 'alcohol', 'stress', 'famhx'];
  var RED = ['blood', 'wtloss', 'fever', 'swallow', 'vomit', 'night'];

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  // the app keeps its data in top-level consts of its own script; read them by name
  function get(name) { try { return eval(name); } catch (e) { return undefined; } }
  function snap() { return window._snap || null; }

  // ---------- read the member's data from the app ----------
  function readData() {
    var S = snap(), sym = (S && S.sym) || {}, out = { sym: [], hist: [], red: [], labs: [], labsOk: 0, patterns: [], tests: [], age: null, hIn: null, wLbs: null, name: '' };
    if (S) { out.age = S.age || null; out.hIn = S.hIn || null; out.wLbs = S.wLbs || null; }
    var nm = document.getElementById('diName'); out.name = nm && nm.value.trim() || '';
    Object.keys(sym).forEach(function (k) {
      if (!sym[k] || !CLIN[k]) return;
      if (RED.indexOf(k) >= 0) out.red.push(k); else if (HIST.indexOf(k) >= 0) out.hist.push(k); else out.sym.push(k);
    });
    // uploaded test results: list the out-of-range ones, count the rest
    var LAB = get('LAB'), LAB_BY = get('LAB_BY'), labGrade = get('labGrade');
    if (LAB && LAB.items && LAB_BY && typeof labGrade === 'function') {
      Object.keys(LAB.items).forEach(function (k) {
        var m = LAB_BY[k], it = LAB.items[k], g = null;
        try { g = labGrade(k); } catch (e) {}
        if (!m || !g) return;
        if (g.st === 'opt') { out.labsOk++; return; }
        var val = m.img ? 'reported finding' : m.q ? (it.val ? ((m.qlab || ['positive'])[0]) : ((m.qlab || [0, 'negative'])[1])) : (it.val + (it.unit ? ' ' + it.unit : ''));
        var where = m.img || m.q ? '' : g.side === 'lo' ? 'low' : 'high';
        var lvl = g.st === 'crit' ? 'well outside range' : g.st === 'out' ? 'outside range' : 'borderline';
        out.labs.push({ n: m.n, val: String(val), where: where, lvl: lvl, crit: g.st === 'crit', next: m.next || '' });
      });
      out.labs.sort(function (a, b) { return (b.crit - a.crit); });
    }
    // symptom patterns the app scored (to DISCUSS, never presented as a diagnosis)
    var gutProfile = get('gutProfile'), CONDS = get('GUT_CONDITIONS');
    if (S && typeof gutProfile === 'function' && CONDS) {
      try {
        var p = gutProfile(sym, 0, 0, S.lab);
        (p.top || []).slice(0, 2).forEach(function (i) { var c = CONDS[i]; if (c && c.title) out.patterns.push(c.title); });
      } catch (e) {}
    }
    // tests the app recommends that aren't on file yet
    var TESTS = get('GUT_TESTS'), labHasTest = get('labHasTest');
    if (TESTS) {
      var rows = TESTS.map(function (t) {
        var hits = (t.sym || []).filter(function (s) { return sym[s]; }).length;
        var red = (t.sym || []).some(function (s) { return sym[s] && RED.indexOf(s) >= 0; });
        var onFile = false; try { onFile = typeof labHasTest === 'function' && labHasTest(t.name); } catch (e) {}
        return { t: t, score: (red ? 20 : 0) + hits * 2 + (t.core ? 3 : 0) + (t.tag === 'critical' ? 2 : 0), hits: hits, onFile: onFile };
      }).filter(function (r) { return !r.onFile && (r.hits || r.t.core) && !/\blog\b|tracker|diary/i.test(r.t.name); }).sort(function (a, b) { return b.score - a.score; });
      out.tests = rows.slice(0, 3).map(function (r) { return r.t.name; });
    }
    return out;
  }

  // "Ask for X and Y." → ", and should we check X and Y" (only for lab next-steps that name a test)
  function nextQ(n) {
    if (!n) return '';
    var m = String(n).split('. ')[0].replace(/\.$/, '');
    var r = m.match(/^Ask (?:for|about) (?:an? )?(.+)$/i); if (r) return 'Should we check ' + r[1] + '?';
    return '';
  }

  // ---------- suggested questions, built from their own data ----------
  function suggestions(D) {
    var q = [];
    if (D.red.length) q.push('I have ' + D.red.map(function (k) { return CLIN[k]; }).join(', ') + '. What should we check first?');
    if (D.labs.length) {
      var top = D.labs.slice(0, 3).map(function (l) { return l.n; });
      var list = top.length > 1 ? top.slice(0, -1).join(', ') + ' and ' + top[top.length - 1] : top[0];
      q.push('My ' + list + (D.labs.length > 3 ? ' (and ' + (D.labs.length - 3) + ' more)' : '') + ' came back outside the normal range. What could be causing that, and what should we do next?');
      D.labs.map(function (l) { return nextQ(l.next); }).filter(Boolean).slice(0, 2).forEach(function (x) { q.push(x); });
    }
    D.tests.slice(0, 2).forEach(function (t) { q.push('Would it be useful to do the ' + t.replace(/\s*\(.*\)$/, '') + (PROTO === 'gut' ? ' for my symptoms' : '') + '?'); });
    D.patterns.slice(0, 1).forEach(function (p) { q.push('Could ' + p.replace(/\s*\(.*\)$/, '') + ' be a concern for me? What would you check to rule it in or out?'); });
    if (PROTO === 'glp1') {
      q.push('How much protein should I aim for each day to protect my muscle while I am on this medication?');
      q.push('What is our plan for managing side effects like nausea or constipation?');
      q.push('What is the long-term plan, and how do we keep the weight off if I ever stop?');
    }
    if (PROTO === 'sugar') {
      if (!D.tests.some(function (t) { return /insulin|a1c/i.test(t); })) q.push('Can we check my fasting insulin and HbA1c, not just my glucose?');
      q.push('If my numbers improve with lifestyle changes, how would we review my medications together?');
    }
    q.push('I am making diet and lifestyle changes. Can we recheck my results in about 3 months to see if they are working?');
    var seen = {}; return q.filter(function (x) { return seen[x] ? false : (seen[x] = 1); }).slice(0, 8);
  }

  // ---------- styles ----------
  var CSS = '' +
    '#docTalk{margin-top:10px}' +
    '#docTalk .dt-lede{font-size:.82rem;line-height:1.55;color:#5e554c;margin:-6px 0 14px}' +
    '#docTalk .dt-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}' +
    '@media (max-width:860px){#docTalk .dt-cols{grid-template-columns:1fr}}' +
    '#docTalk h4{margin:0 0 10px;font:600 .66rem/1 "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#b8664a}' +
    '#docTalk details{border:1px solid #e7dccb;border-radius:12px;background:#fffcf7;margin:0 0 8px;overflow:hidden}' +
    '#docTalk summary{cursor:pointer;list-style:none;padding:12px 14px;font:600 .9rem/1.3 "DM Sans",sans-serif;color:#2b2622;display:flex;justify-content:space-between;gap:10px}' +
    '#docTalk summary::-webkit-details-marker{display:none}' +
    '#docTalk summary:after{content:"+";color:#c0623f;font-weight:700}#docTalk details[open] summary:after{content:"–"}' +
    '#docTalk .dt-body{padding:0 14px 14px;font-size:.84rem;line-height:1.6;color:#3b342e}' +
    '#docTalk .dt-body ul,#docTalk .dt-body ol{margin:4px 0 0;padding-left:18px}#docTalk .dt-body li{margin:4px 0}' +
    '#docTalk .dt-swap{width:100%;border-collapse:collapse;font-size:.8rem}' +
    '#docTalk .dt-swap td{padding:7px 6px;border-top:1px solid #efe6d8;vertical-align:top}' +
    '#docTalk .dt-swap td:first-child{color:#8a7d71;width:42%}#docTalk .dt-swap td:last-child{color:#2b2622;font-weight:500}' +
    '#docTalk .dt-say{background:#f3ece1;border-left:3px solid #c0623f;border-radius:6px;padding:9px 12px;margin:8px 0;font-style:italic;color:#2b2622}' +
    '#docTalk label.dt-l{display:block;font:600 .62rem/1 "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#9a8e82;margin:10px 0 5px}' +
    '#docTalk input.dt-i,#docTalk textarea.dt-i{width:100%;box-sizing:border-box;border:1px solid #e4ddd2;border-radius:10px;padding:9px 11px;font:400 .86rem "DM Sans",sans-serif;background:#fff;color:#1e1812}' +
    '#docTalk textarea.dt-i{min-height:58px;resize:vertical}' +
    '#docTalk .dt-q{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-top:1px solid #efe6d8;font-size:.82rem;line-height:1.45;color:#2b2622;cursor:pointer}' +
    '#docTalk .dt-q input{margin-top:3px;accent-color:#2e5c45;flex:none}' +
    '#docTalk .dt-go{margin-top:14px;width:100%;min-height:48px;border:0;border-radius:12px;background:#2b2622;color:#fff;font:600 .95rem "DM Sans",sans-serif;cursor:pointer}' +
    '#docTalk .dt-go:hover{background:#1e2820}' +
    '#docTalk .dt-hint{font-size:.74rem;color:#9a8e82;margin-top:8px;line-height:1.45}' +
    '#docTalk .dt-safe{font-size:.72rem;color:#9a8e82;margin-top:12px;line-height:1.5}' +
    // the summary sheet (overlay on screen, the only thing printed)
    '#dtOverlay{position:fixed;inset:0;z-index:9999;background:rgba(30,24,18,.55);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px}' +
    '#dtOverlay .dt-bar{position:sticky;top:0;display:flex;gap:8px;justify-content:flex-end;max-width:820px;width:100%;margin:0 auto 10px}' +
    '#dtOverlay .dt-bar button{border:0;border-radius:999px;padding:10px 16px;font:600 .85rem "DM Sans",sans-serif;cursor:pointer;background:#fff;color:#2b2622}' +
    '#dtOverlay .dt-bar button.dk{background:#2b2622;color:#fff}' +
    '#dtWrap{width:100%;max-width:820px}' +
    '#dtSheet{background:#fff;color:#1e1812;border-radius:10px;padding:34px 38px;font:400 13.5px/1.5 "DM Sans",Arial,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.3)}' +
    '#dtSheet h1{font:500 26px/1.1 "Cormorant Garamond",Georgia,serif;margin:0 0 4px}' +
    '#dtSheet .meta{color:#6e6259;font-size:12.5px;margin-bottom:16px;border-bottom:2px solid #1e1812;padding-bottom:10px}' +
    '#dtSheet h2{font:700 11px/1 "DM Sans",Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#b8664a;margin:16px 0 6px}' +
    '#dtSheet ul,#dtSheet ol{margin:0;padding-left:18px}#dtSheet li{margin:2px 0}' +
    '#dtSheet .red{border:2px solid #c85a3a;border-radius:8px;padding:8px 12px;margin:10px 0;color:#7a2a18;font-weight:600}' +
    '#dtSheet table{width:100%;border-collapse:collapse;font-size:12.5px}#dtSheet td,#dtSheet th{text-align:left;padding:5px 6px;border-bottom:1px solid #e4ddd2}' +
    '#dtSheet th{font-size:11px;color:#6e6259;font-weight:600}' +
    '#dtSheet .muted{color:#8a7d71}#dtSheet .foot{margin-top:18px;padding-top:10px;border-top:1px solid #e4ddd2;font-size:11px;color:#8a7d71}' +
    '@media (max-width:600px){#dtSheet{padding:20px 18px}}' +
    '@media print{html.dt-printing body>*:not(#dtOverlay){display:none!important}html.dt-printing #dtOverlay{position:static;background:none;padding:0;display:block}' +
    'html.dt-printing .dt-bar{display:none!important}html.dt-printing #dtSheet{box-shadow:none;padding:0;border-radius:0}}';

  // ---------- the guide ----------
  function guide() {
    var glp = PROTO === 'glp1';
    return '' +
      '<h4>How to talk to your doctor</h4>' +
      '<details open><summary>1 · Prepare in 10 minutes</summary><div class="dt-body"><ul>' +
      '<li>Write down your main concern in one sentence. Lead with it.</li>' +
      '<li>Note when each symptom started, how often it happens and what makes it better or worse.</li>' +
      '<li>Bring a list of every medication and supplement, with doses.</li>' +
      '<li>Bring your recent test results, or upload them above so they appear on your summary.</li>' +
      '<li>Pick your top 2–3 questions. Ask the most important one first, not as you are leaving.</li>' +
      '</ul></div></details>' +
      '<details><summary>2 · Say it the clinical way</summary><div class="dt-body">Doctors listen for <b>what, how long, how often and how much it affects you</b>.' +
      '<table class="dt-swap">' +
      '<tr><td>"I\'m always bloated"</td><td>"I\'ve had abdominal distension most days for about three months, worse after meals."</td></tr>' +
      '<tr><td>"I\'m tired all the time"</td><td>"I\'ve had persistent fatigue for six weeks that isn\'t improved by sleep."</td></tr>' +
      '<tr><td>"My stomach is off"</td><td>"I have intermittent cramping in my lower abdomen, about three times a week."</td></tr>' +
      '<tr><td>"I can\'t go"</td><td>"I have a bowel movement every three to four days, and stools are hard."</td></tr>' +
      '<tr><td>"I get heartburn a lot"</td><td>"I have reflux symptoms four or more nights a week, despite antacids."</td></tr>' +
      '<tr><td>"My brain is foggy"</td><td>"I have trouble concentrating that affects my work, mostly in the afternoon."</td></tr>' +
      '<tr><td>"My sugar is bad"</td><td>"My fasting glucose readings have been between X and Y this month."</td></tr>' +
      '</table></div></details>' +
      '<details><summary>3 · Questions to ask about your tests</summary><div class="dt-body"><ul>' +
      '<li>"Can you walk me through which results are outside the range, and what they could mean?"</li>' +
      '<li>"Is this in the normal range, and is it in the optimal range for someone like me?"</li>' +
      '<li>"Could we check fasting insulin and HbA1c, not just glucose?"</li>' +
      '<li>"Can we check ferritin, B12 and vitamin D, not just hemoglobin?"</li>' +
      '<li>"Can we recheck in about 3 months to see if my changes are working?"</li>' +
      '<li>"Can I have a copy of my results for my records?"</li>' +
      '</ul></div></details>' +
      '<details><summary>4 · Bringing up your healing plan</summary><div class="dt-body">Keep it collaborative. You are asking for a partner, not permission.' +
      '<div class="dt-say">"I\'m working on my diet and lifestyle to support my health: more protein, better sleep, daily movement and stress practices. Here\'s what I\'m doing. Is there anything you\'d want me to watch or adjust?"</div>' +
      'If you plan to fast or do a cleanse, say so plainly and ask: <i>"Is there any reason this wouldn\'t be safe for me, given my medications?"</i></div></details>' +
      '<details' + (glp ? ' open' : '') + '><summary>5 · If you\'re on a GLP-1</summary><div class="dt-body"><ul>' +
      '<li>"How much protein should I aim for each day to protect my muscle?"</li>' +
      '<li>"Should I be doing strength training, and is there anything I should avoid?"</li>' +
      '<li>"What\'s our plan for nausea, constipation or reflux if they show up?"</li>' +
      '<li>"Should we track anything extra, like kidney function or my body composition?"</li>' +
      '<li>"What\'s the long-term plan, and how do we protect my results if I ever stop?"</li>' +
      '</ul>Never change your dose or stop the medication without your prescriber.</div></details>' +
      '<details><summary>6 · If you feel brushed off</summary><div class="dt-body"><ul>' +
      '<li>Stay calm and specific: <i>"This is affecting my daily life, and I\'d like to understand what\'s causing it."</i></li>' +
      '<li>Ask: <i>"What else could this be, and what would rule it out?"</i></li>' +
      '<li>Ask for a referral: <i>"Would a gastroenterologist (or endocrinologist) be helpful here?"</i></li>' +
      '<li>If a test is declined: <i>"Could you note in my chart that I asked about it, and why we\'re not doing it?"</i></li>' +
      '<li>A second opinion is always your right.</li>' +
      '</ul></div></details>';
  }

  function form(D, saved) {
    var sug = suggestions(D), picked = saved.q || sug.slice(0, 3);
    var noData = !snap();
    return '' +
      '<h4>Your doctor visit summary</h4>' +
      '<div class="dt-lede" style="margin:0 0 6px">One page for your doctor: your symptoms in clinical wording, your test results, and your top questions. Built from what you already entered here.</div>' +
      (noData ? '<div class="dt-hint">Tip: enter your symptoms and press Generate first, so they appear on your summary.</div>' : '') +
      '<label class="dt-l" for="dtMain">What do you most want help with?</label><input class="dt-i" id="dtMain" placeholder="e.g. Bloating and fatigue that are affecting my work" value="' + esc(saved.main || '') + '">' +
      '<label class="dt-l" for="dtLong">How long has this been going on?</label><input class="dt-i" id="dtLong" placeholder="e.g. About 6 months, worse in the last 2" value="' + esc(saved.long || '') + '">' +
      '<label class="dt-l" for="dtMeds">Medications (name and dose)</label><textarea class="dt-i" id="dtMeds" placeholder="' + (PROTO === 'glp1' ? 'e.g. Semaglutide 1 mg weekly' : 'e.g. Omeprazole 20 mg daily') + '">' + esc(saved.meds || '') + '</textarea>' +
      '<label class="dt-l" for="dtSupps">Supplements</label><textarea class="dt-i" id="dtSupps" placeholder="e.g. Vitamin D 2,000 IU, magnesium glycinate">' + esc(saved.supps || '') + '</textarea>' +
      '<label class="dt-l">Your top questions (pick up to 3)</label>' +
      sug.map(function (q, i) { return '<label class="dt-q"><input type="checkbox" data-q="' + i + '"' + (picked.indexOf(q) >= 0 ? ' checked' : '') + '><span>' + esc(q) + '</span></label>'; }).join('') +
      '<input class="dt-i" id="dtOwn" style="margin-top:8px" placeholder="Add your own question (optional)" value="' + esc(saved.own || '') + '">' +
      '<button type="button" class="dt-go" id="dtMake">Create my visit summary</button>' +
      '<div class="dt-hint">Saved on this device. Print it, save it as a PDF, or copy it into your patient portal.</div>';
  }

  // ---------- the one-page summary ----------
  function sheet(D, F) {
    var today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    var bmi = D.hIn && D.wLbs ? (703 * D.wLbs / (D.hIn * D.hIn)).toFixed(1) : null;
    var stats = [D.age ? 'Age ' + D.age : '', D.hIn ? 'Height ' + Math.floor(D.hIn / 12) + '′' + (D.hIn % 12) + '″' : '', D.wLbs ? 'Weight ' + D.wLbs + ' lb' : '', bmi ? 'BMI ' + bmi : ''].filter(Boolean).join(' · ');
    var li = function (arr) { return '<ul>' + arr.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; };
    var h = '<h1>Doctor Visit Summary</h1>' +
      '<div class="meta">' + (D.name ? '<b>' + esc(D.name) + '</b> · ' : '') + esc(today) + (stats ? ' · ' + esc(stats) : '') + '</div>';
    if (D.red.length) h += '<div class="red">Please review first: ' + esc(D.red.map(function (k) { return CLIN[k]; }).join('; ')) + '.</div>';
    h += '<h2>Reason for visit</h2><div>' + esc(F.main || 'Ongoing symptoms I would like to understand and address.') + (F.long ? ' <span class="muted">Duration: ' + esc(F.long) + '.</span>' : '') + '</div>';
    if (D.sym.length) h += '<h2>Current symptoms</h2>' + li(D.sym.map(function (k) { return CLIN[k].charAt(0).toUpperCase() + CLIN[k].slice(1); }));
    if (D.hist.length) h += '<h2>Relevant history</h2>' + li(D.hist.map(function (k) { return CLIN[k].charAt(0).toUpperCase() + CLIN[k].slice(1); }));
    h += '<h2>Medications</h2><div>' + (F.meds ? esc(F.meds).replace(/\n/g, '<br>') : '<span class="muted">None listed</span>') + '</div>';
    h += '<h2>Supplements</h2><div>' + (F.supps ? esc(F.supps).replace(/\n/g, '<br>') : '<span class="muted">None listed</span>') + '</div>';
    if (D.labs.length || D.labsOk) {
      h += '<h2>Recent test results (values as printed on my report)</h2>';
      if (D.labs.length) h += '<table><tr><th>Test</th><th>Result</th><th>Flag</th></tr>' + D.labs.map(function (l) {
        return '<tr><td>' + esc(l.n) + '</td><td>' + esc(l.val) + '</td><td>' + esc((l.where ? l.where + ', ' : '') + l.lvl) + '</td></tr>';
      }).join('') + '</table>';
      if (D.labsOk) h += '<div class="muted" style="margin-top:4px">' + D.labsOk + ' other result' + (D.labsOk > 1 ? 's' : '') + ' within range.</div>';
    }
    h += '<h2>What I am doing for my health</h2><div>I am following a structured lifestyle plan: a high-protein diet with good hydration, a regular eating window, daily movement, a sleep routine and stress-reduction practices (' + esc(PNAME) + ', Mark Talks Health). I would welcome your input on anything I should watch or adjust.</div>';
    var asks = (F.q || []).concat(F.own ? [F.own] : []);
    if (asks.length) h += '<h2>My questions</h2><ol>' + asks.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>';
    if (D.patterns.length || D.tests.length) {
      h += '<h2>Things I would like to discuss</h2><ul>';
      if (D.patterns.length) h += '<li>An app I use flagged these to ask about: ' + esc(D.patterns.join('; ')) + '. I understand this is not a diagnosis.</li>';
      if (D.tests.length) h += '<li>Tests I have read about: ' + esc(D.tests.join('; ')) + '. Would any of these be appropriate?</li>';
      h += '</ul>';
    }
    h += '<div class="foot">Prepared by the patient with the Mark Talks Health app. This is a summary of my own notes and results to help our conversation. It is not a diagnosis or medical advice.</div>';
    return h;
  }

  function sheetText(D, F) {
    var tmp = document.createElement('div'); tmp.innerHTML = sheet(D, F);
    tmp.querySelectorAll('h2').forEach(function (e) { e.textContent = '\n' + e.textContent.toUpperCase() + '\n'; });
    tmp.querySelectorAll('li').forEach(function (e) { e.textContent = '• ' + e.textContent + '\n'; });
    tmp.querySelectorAll('tr').forEach(function (e) { e.textContent = Array.from(e.children).map(function (c) { return c.textContent; }).join(' | ') + '\n'; });
    tmp.querySelectorAll('div,h1').forEach(function (e) { e.insertAdjacentText('beforeend', '\n'); });
    return tmp.textContent.replace(/\n{3,}/g, '\n\n').trim();
  }

  // ---------- mount ----------
  function collect(D) {
    var sug = suggestions(D);
    var q = Array.from(document.querySelectorAll('#docTalk .dt-q input:checked')).map(function (i) { return sug[+i.dataset.q]; }).filter(Boolean).slice(0, 3);
    var F = { main: val('dtMain'), long: val('dtLong'), meds: val('dtMeds'), supps: val('dtSupps'), own: val('dtOwn'), q: q };
    save(F); return F;
    function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  }

  function openSheet() {
    var D = readData(), F = collect(D);
    var old = document.getElementById('dtOverlay'); if (old) old.remove();
    var ov = document.createElement('div'); ov.id = 'dtOverlay'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Doctor visit summary');
    ov.innerHTML = '<div id="dtWrap"><div class="dt-bar"><button type="button" id="dtCopy">Copy text</button><button type="button" class="dk" id="dtPrint">Print or save PDF</button><button type="button" id="dtClose" aria-label="Close">Close</button></div><div id="dtSheet">' + sheet(D, F) + '</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.getElementById('dtClose').onclick = function () { ov.remove(); };
    document.getElementById('dtPrint').onclick = function () {
      document.documentElement.classList.add('dt-printing');
      setTimeout(function () { window.print(); setTimeout(function () { document.documentElement.classList.remove('dt-printing'); }, 300); }, 50);
    };
    document.getElementById('dtCopy').onclick = function () {
      var t = sheetText(D, F), b = this;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { b.textContent = 'Copied ✓'; }, function () {
        var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); b.textContent = 'Copied ✓'; } catch (e) {} ta.remove();
      });
    };
  }

  function render() {
    var host = document.getElementById('docTalk');
    if (!host) {
      host = document.createElement('div'); host.id = 'docTalk';
      var row = document.querySelector('.hc-risk-row'), risk = document.getElementById('diRiskList');
      if (row) row.appendChild(host);
      else if (risk && risk.closest('.di-panel')) risk.closest('.di-panel').insertAdjacentElement('afterend', host);
      else return;
    }
    var D = readData(), saved = load();
    host.innerHTML = '<div class="di-panel"><div class="di-title">Talk to Your Doctor</div>' +
      '<div class="dt-lede">Walk in prepared, use the words doctors listen for, and leave with answers. This helps you communicate; it isn\'t medical advice.</div>' +
      '<div class="dt-cols"><div>' + guide() + '</div><div>' + form(D, saved) + '</div></div>' +
      '<div class="dt-safe">Never stop or change a medication without your prescriber. If you have a red-flag symptom (blood in the stool, unexplained weight loss, trouble swallowing, persistent vomiting), see a doctor promptly.</div></div>';
    var mk = document.getElementById('dtMake'); if (mk) mk.onclick = openSheet;
    host.querySelectorAll('.dt-q input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var on = host.querySelectorAll('.dt-q input:checked');
        if (on.length > 3) { cb.checked = false; }
      });
    });
    host.querySelectorAll('.dt-i').forEach(function (i) { i.addEventListener('change', function () { collect(readData()); }); });
  }

  function init() {
    if (!document.getElementById('dtCss')) { var st = document.createElement('style'); st.id = 'dtCss'; st.textContent = CSS; document.head.appendChild(st); }
    render();
    // rebuild the suggestions when the member presses Generate (symptoms/tests change)
    var last = window._snap;
    setInterval(function () {
      if (window._snap !== last) {
        last = window._snap;
        var a = document.activeElement; if (a && a.closest && a.closest('#docTalk')) return; // don't redraw while typing
        render();
      }
    }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
