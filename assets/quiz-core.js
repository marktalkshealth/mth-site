/* =================================================================
   MTH QUIZ CORE: questions + scoring for the free assessment quiz.
   Plain JS used in two places, so the page and the email always agree:
     - the browser (assets/quiz.js draws the quiz)
     - the mth-assess edge function (builds the emailed assessment)
   Results are educational patterns, never a diagnosis.
================================================================= */
(function (G) {
  var STEPS = ["Fasting & cleanse", "Meditation & journaling", "High protein & healing broths", "Cardio & strength", "Music therapy & spirit", "Sleep & clean air", "Nature: forest & sun"];

  var QUIZ = {
    gut: {
      product: "gut",
      name: "The Gut Health Protocol",
      sales: "gut.html",
      questions: [
        { id: "sym", type: "multi", q: "What do you deal with?", hint: "Tap everything that applies.",
          o: [["bloat", "Bloating & gas"], ["pain", "Cramps or belly pain"], ["reflux", "Acid reflux"], ["constip", "Constipation"], ["loose", "Loose stools"], ["fatigue", "Fatigue"],
              ["fog", "Brain fog"], ["sleep", "Poor sleep"], ["foodsens", "Food sensitivities"], ["skin", "Skin flare-ups"], ["cravings", "Sugar cravings"], ["stress", "Stress & anxiety"]] },
        { id: "freq", type: "one", q: "How often do symptoms show up?",
          o: [["daily", "Every day"], ["weekly", "A few times a week"], ["some", "Now and then"]] },
        { id: "dur", type: "one", q: "How long has this been going on?",
          o: [["m3", "Less than 3 months"], ["y1", "3 to 12 months"], ["y5", "1 to 5 years"], ["y5p", "More than 5 years"]] },
        { id: "trig", type: "multi", q: "Does any of this sound like you?", hint: "Tap any that fit, or skip.",
          o: [["meals", "Worse after meals"], ["foods", "Dairy, gluten or certain foods set it off"], ["abx", "Antibiotics in the last few years"], ["stressflare", "It flares when I'm stressed"], ["sugar", "Lots of sugar or processed food"], ["alcohol", "Regular alcohol"]] },
        { id: "tried", type: "multi", q: "What have you tried so far?", hint: "Tap any that fit.",
          o: [["diets", "Cutting out foods"], ["probiotics", "Probiotics or supplements"], ["doctor", "Doctors or medication"], ["cleanse", "A cleanse or fast"], ["nothing", "Nothing yet"]] },
        { id: "impact", type: "one", q: "How much is it affecting your life?",
          o: [["little", "A little"], ["some", "Some days are hard"], ["most", "Most days"], ["runs", "It runs my life"]] },
        { id: "goal", type: "one", q: "What would you love most?",
          o: [["flat", "A calm, flat stomach"], ["regular", "Regular, easy digestion"], ["energy", "More energy and a clear head"], ["weight", "To lose weight"], ["skin", "Clearer skin"]] }
      ],
      // symptom weight and the healing steps it leans on (index into STEPS)
      sym: { bloat: [3, [0, 2]], pain: [3, [0, 1]], reflux: [3, [2, 5]], constip: [2, [2, 3]], loose: [3, [0, 2]], fatigue: [2, [5, 1]], fog: [2, [1, 5]],
             sleep: [2, [5, 4]], foodsens: [3, [0, 2]], skin: [2, [2, 6]], cravings: [2, [0, 1]], stress: [2, [1, 4]] },
      patterns: {
        ibs: { label: "IBS-type pattern", w: { bloat: 2, pain: 3, constip: 2, loose: 2, stressflare: 2, stress: 1, _both: 3 },
          text: "Bloating, cramps and changing bowel habits often travel together. Calming the gut, steady meals and lowering stress usually matter most.", steps: [0, 1, 2] },
        reflux: { label: "Reflux pattern", w: { reflux: 5, meals: 1 },
          text: "Burning and reflux often ease with an earlier last meal, smaller portions and giving digestion a real rest.", steps: [0, 5, 2] },
        lining: { label: "Gut lining stress", w: { foodsens: 3, skin: 2, foods: 2, fatigue: 1, fog: 1 },
          text: "Reacting to foods, skin flare-ups and low energy can point to a stressed gut lining. Rest, broths and protein help it rebuild.", steps: [0, 2, 6] },
        flora: { label: "Flora imbalance", w: { bloat: 2, cravings: 2, abx: 3, sugar: 2, alcohol: 1, meals: 1 },
          text: "Antibiotics, sugar and alcohol shift the bacteria in your gut. A cleanse followed by whole, high-protein meals helps reset the balance.", steps: [0, 2, 3] },
        slow: { label: "Slow digestion", w: { constip: 4, bloat: 1 },
          text: "Slow, sluggish digestion responds well to water, movement every day and fibre from vegetables.", steps: [3, 2, 6] },
        brain: { label: "Gut–brain strain", w: { stress: 3, sleep: 2, fog: 2, fatigue: 1, stressflare: 2 },
          text: "Your gut and nervous system talk constantly. Calming the stress response and sleeping deeper often settles digestion too.", steps: [1, 5, 4] }
      },
      boost: { daily: 6, weekly: 3, some: 1, m3: 1, y1: 2, y5: 3, y5p: 4 }
    }
  };

  function arr(v) { return Array.isArray(v) ? v : v ? [v] : []; }
  function has(a, k) { return arr(a.sym).indexOf(k) >= 0 || arr(a.trig).indexOf(k) >= 0; }

  /* answers: { sym:[ids], freq:id, dur:id, trig:[ids], tried:[ids], impact:id, goal:id } */
  function score(product, answers) {
    var C = QUIZ[product] || QUIZ.gut, a = answers || {}, sym = arr(a.sym).filter(function (k) { return C.sym[k]; });
    var symW = 0, bars = [0, 0, 0, 0, 0, 0, 0];
    sym.forEach(function (k) { symW += C.sym[k][0]; C.sym[k][1].forEach(function (p, j) { bars[p] += 2 - j; }); });
    var freq = { daily: 3, weekly: 2, some: 1 }[a.freq] || 0, dur = { m3: 1, y1: 2, y5: 3, y5p: 4 }[a.dur] || 0, impact = { little: 1, some: 2, most: 3, runs: 4 }[a.impact] || 0;
    var pct = sym.length ? Math.min(100, Math.round(Math.min(symW, 18) / 18 * 50 + freq / 3 * 20 + dur / 4 * 15 + impact / 4 * 15)) : 0;

    // patterns
    var pats = Object.keys(C.patterns).map(function (id) {
      var P = C.patterns[id], s = 0;
      Object.keys(P.w).forEach(function (k) { if (k === "_both") { if (has(a, "constip") && has(a, "loose")) s += P.w[k]; } else if (has(a, k)) s += P.w[k]; });
      return { id: id, label: P.label, text: P.text, steps: P.steps, s: s };
    }).filter(function (p) { return p.s >= 3; }).sort(function (x, y) { return y.s - x.s; });
    pats.forEach(function (p, i) { p.steps.forEach(function (st, j) { bars[st] += (3 - j) * (i === 0 ? 2 : 1); }); });

    var top = pats[0];
    var impression = !sym.length ? "" : top ? top.label : "Mild imbalance";
    var level = pct < 40 ? 1 : 2;
    var levelName = level === 1 ? "Level 1 · Ice cream cleanse" : pct < 70 ? "Level 2 · Green juice cleanse" : "Level 2 · Green juice cleanse, with guidance";
    var stress = pct < 35 ? "mild" : pct < 70 ? "moderate" : "high";

    // protocol bars: every step is in the plan; emphasis 40–100%
    var mx = Math.max.apply(null, bars) || 1;
    var plan = STEPS.map(function (n, i) { return { step: n, pct: Math.round(40 + 60 * bars[i] / mx) }; });
    var focus = plan.map(function (b, i) { return [i, b.pct]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 3).map(function (x) { return STEPS[x[0]]; });

    // first 7 days
    var cl = level === 1 ? "Ice cream cleanse" : "Green juice cleanse";
    var arc = [
      { d: 1, t: cl + " · day 1", n: "Mostly rest: sleep, clean air, meditation and music", kcal: level === 1 ? 700 : 500 },
      { d: 2, t: cl + " · day 2", n: "Gentle walk, journal, early night", kcal: level === 1 ? 700 : 500 },
      { d: 3, t: cl + " · day 3", n: "Light movement starts; digestion is fully resting", kcal: level === 1 ? 700 : 500 },
      { d: 4, t: "Transition day", n: "Warm bone broth, soups and soft vegetables", kcal: 1000 },
      { d: 5, t: "Rebuild", n: "Gentle high-protein meals; nature and sunlight", kcal: 1400 },
      { d: 6, t: "Rebuild", n: "High-protein meals; strength or cardio begins", kcal: 1600 },
      { d: 7, t: "Full protocol", n: "All 7 healing steps; your daily fasting window", kcal: 1700 }
    ];
    return { product: C.product, name: C.name, pct: pct, stress: stress, impression: impression, patterns: pats.slice(0, 3), level: level, levelName: levelName, plan: plan, focus: focus, arc: arc, answered: sym.length > 0 };
  }

  G.MTHQuizCore = { QUIZ: QUIZ, STEPS: STEPS, score: score };
})(typeof window !== "undefined" ? window : globalThis);
