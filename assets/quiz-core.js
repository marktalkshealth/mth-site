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
      kind: "gut", area: "Gut",
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
    },

    sugar: {
      product: "sugar",
      name: "The Diabetes Protocol",
      kind: "blood sugar", area: "Blood sugar",
      sales: "diabetes.html",
      gentle: ["meds"],
      questions: [
        { id: "sym", type: "multi", q: "What do you deal with?", hint: "Tap everything that applies.",
          o: [["crash", "Energy crashes"], ["crave", "Sugar cravings"], ["fog", "Brain fog after meals"], ["morning", "High morning readings"], ["belly", "Belly weight"], ["thirst", "Always thirsty"],
              ["tingle", "Tingling hands or feet"], ["bp", "High blood pressure"], ["sleep", "Poor sleep"], ["stress", "Stress & anxiety"], ["lowact", "Low activity"], ["night", "Snacking at night"]] },
        { id: "freq", type: "one", q: "How often do you notice these?",
          o: [["daily", "Every day"], ["weekly", "A few times a week"], ["some", "Now and then"]] },
        { id: "dur", type: "one", q: "How long has blood sugar been a concern?",
          o: [["m3", "Less than 3 months"], ["y1", "3 to 12 months"], ["y5", "1 to 5 years"], ["y5p", "More than 5 years"]] },
        { id: "trig", type: "multi", q: "Does any of this sound like you?", hint: "Tap any that fit, or skip.",
          o: [["meds", "On diabetes medication or insulin"], ["a1c", "HbA1c or fasting glucose above normal"], ["carbs", "Lots of bread, pasta or sweets"], ["sitting", "Sitting most of the day"], ["family", "Diabetes runs in my family"], ["late", "Eating late at night"]] },
        { id: "tried", type: "multi", q: "What have you tried so far?", hint: "Tap any that fit.",
          o: [["diets", "Low-carb or keto diets"], ["doctor", "Medication from my doctor"], ["track", "Tracking glucose or a CGM"], ["exercise", "More exercise"], ["nothing", "Nothing yet"]] },
        { id: "impact", type: "one", q: "How much is it affecting your life?",
          o: [["little", "A little"], ["some", "Some days are hard"], ["most", "Most days"], ["runs", "It runs my life"]] },
        { id: "goal", type: "one", q: "What would you love most?",
          o: [["a1c", "Lower my HbA1c and readings"], ["energy", "Steady energy all day"], ["weight", "Lose belly weight"], ["fewer", "Need less medication, with my doctor"], ["cravings", "Stop the sugar cravings"]] }
      ],
      sym: { crash: [2, [2, 3]], crave: [3, [2, 0]], fog: [2, [2, 3]], morning: [3, [0, 5]], belly: [2, [3, 2]], thirst: [3, [2, 0]],
             tingle: [3, [3, 2]], bp: [2, [1, 3]], sleep: [2, [5, 1]], stress: [2, [1, 4]], lowact: [2, [3, 6]], night: [2, [0, 5]] },
      patterns: {
        ir: { label: "Insulin resistance pattern", w: { crave: 2, crash: 2, belly: 2, carbs: 2, fog: 1 },
          text: "Crashes, cravings and belly weight often mean your cells have stopped listening to insulin. Protein-first meals, a shorter eating window and moving after meals help most.", steps: [2, 0, 3] },
        dawn: { label: "Night and morning spikes", w: { morning: 3, night: 2, late: 2, sleep: 1 },
          text: "High morning readings and late eating go together. An earlier last meal and deeper sleep usually bring morning numbers down.", steps: [0, 5, 2] },
        high: { label: "Raised glucose signs", w: { thirst: 3, tingle: 3, a1c: 3 },
          text: "Thirst, tingling and raised HbA1c are signs to take seriously. Work with your doctor, and use food, movement and sleep to support the numbers.", steps: [2, 3, 0] },
        stress: { label: "Stress-driven sugar", w: { stress: 3, sleep: 2, night: 1, crave: 1 },
          text: "Stress hormones push blood sugar up on their own. Calming the nervous system and sleeping well often steadies readings.", steps: [1, 5, 4] },
        still: { label: "Low-movement pattern", w: { lowact: 3, sitting: 3, belly: 1 },
          text: "Muscles are where most sugar gets used. A short walk after meals and two strength sessions a week make a real difference.", steps: [3, 6, 2] },
        heart: { label: "Heart and metabolic load", w: { bp: 3, belly: 1, family: 2 },
          text: "Blood pressure, belly weight and family history add up. Steady weight loss, movement and less stress ease the whole system.", steps: [3, 1, 2] }
      }
    },

    glp1: {
      product: "glp1",
      name: "The GLP-1 Weight Loss Protocol",
      kind: "GLP-1", area: "Metabolic",
      sales: "glp1.html",
      gentle: ["onglp"],
      questions: [
        { id: "sym", type: "multi", q: "What do you deal with?", hint: "Tap everything that applies.",
          o: [["nausea", "Nausea or reflux"], ["constip", "Constipation"], ["lowenergy", "Low energy"], ["muscle", "Losing muscle or strength"], ["hair", "Hair thinning"], ["plateau", "Weight-loss plateau"],
              ["cravings", "Cravings coming back"], ["regain", "Worried about regain"], ["sleep", "Poor sleep"], ["stresseat", "Stress eating"], ["lowact", "Low activity"], ["skip", "Skipping meals"]] },
        { id: "freq", type: "one", q: "How often do these show up?",
          o: [["daily", "Every day"], ["weekly", "A few times a week"], ["some", "Now and then"]] },
        { id: "dur", type: "one", q: "How long have you been on a GLP-1?",
          o: [["m3", "Not yet, or under 3 months"], ["y1", "3 to 12 months"], ["y5", "1 to 2 years"], ["y5p", "More than 2 years"]] },
        { id: "trig", type: "multi", q: "Does any of this sound like you?", hint: "Tap any that fit, or skip.",
          o: [["onglp", "On a GLP-1 medication now"], ["lowprot", "Low appetite, little protein"], ["nostr", "No strength training"], ["stopping", "Planning to come off it"], ["yoyo", "Lost and regained weight before"], ["alcohol", "Regular alcohol"]] },
        { id: "tried", type: "multi", q: "What have you tried so far?", hint: "Tap any that fit.",
          o: [["diets", "Diets or calorie counting"], ["meds", "Other weight-loss medication"], ["gym", "A gym or training plan"], ["coach", "A coach or program"], ["nothing", "Nothing yet"]] },
        { id: "impact", type: "one", q: "How much is it affecting your life?",
          o: [["little", "A little"], ["some", "Some days are hard"], ["most", "Most days"], ["runs", "It runs my life"]] },
        { id: "goal", type: "one", q: "What would you love most?",
          o: [["fat", "Lose fat, keep muscle"], ["keep", "Keep the weight off for good"], ["energy", "More energy"], ["taper", "Come off it, with my doctor"], ["strong", "Feel strong and confident"]] }
      ],
      sym: { nausea: [2, [2, 5]], constip: [2, [2, 6]], lowenergy: [2, [2, 3]], muscle: [3, [3, 2]], hair: [2, [2, 5]], plateau: [3, [3, 0]],
             cravings: [3, [2, 1]], regain: [3, [3, 2]], sleep: [2, [5, 1]], stresseat: [2, [1, 4]], lowact: [2, [3, 6]], skip: [2, [2, 0]] },
      patterns: {
        muscle: { label: "Muscle loss risk", w: { muscle: 3, lowprot: 3, nostr: 2, skip: 2, hair: 1, lowenergy: 1 },
          text: "Eating very little can strip muscle along with fat. Hitting your protein target and lifting twice a week protects it.", steps: [2, 3, 5] },
        gi: { label: "Gut side effects", w: { nausea: 3, constip: 3 },
          text: "Nausea and constipation are common on GLP-1s. Smaller meals, water, fibre from vegetables and gentle walks usually help.", steps: [2, 6, 5] },
        regain: { label: "Regain risk", w: { regain: 3, stopping: 3, yoyo: 2, cravings: 1 },
          text: "Weight often returns when the medication stops unless habits and muscle are in place. Building them now is the safest exit plan.", steps: [3, 2, 1] },
        plateau: { label: "Plateau pattern", w: { plateau: 3, lowact: 2, sleep: 1, alcohol: 1 },
          text: "Plateaus usually ease with more daily movement, strength work, deeper sleep and less alcohol.", steps: [3, 5, 0] },
        emotional: { label: "Stress and cravings", w: { stresseat: 3, cravings: 2, sleep: 1 },
          text: "Cravings coming back often follow stress and short sleep. Calming the stress response keeps appetite steady.", steps: [1, 5, 4] }
      }
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
    // on medication (insulin, diabetes pills, a GLP-1): gentlest level, with their doctor
    var gentle = (C.gentle || []).some(function (k) { return has(a, k); });
    var level = gentle || pct < 40 ? 1 : 2;
    var levelName = level === 1 ? "Level 1 · Ice cream cleanse" + (gentle ? ", with your doctor" : "") : pct < 70 ? "Level 2 · Green juice cleanse" : "Level 2 · Green juice cleanse, with guidance";
    var stress = pct < 35 ? "mild" : pct < 70 ? "moderate" : "high";

    // protocol bars: every step is in the plan; emphasis 40–100%
    var mx = Math.max.apply(null, bars) || 1;
    var plan = STEPS.map(function (n, i) { return { step: n, pct: Math.round(40 + 60 * bars[i] / mx) }; });
    var focus = plan.map(function (b, i) { return [i, b.pct]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 3).map(function (x) { return STEPS[x[0]]; });

    // first 7 days: the same healing arc as the app (prep, cleanse, refeed, normal),
    // bar height = calories as a share of a normal day (≈2,000 kcal)
    var NORM = 2000, cl = level === 1 ? "icecream" : "juice";
    var A1 = level === 1 ? [
      ["Prep", "Prep day", "Light meals and an early night; get your ice cream ready", 70, "prep"],
      ["Cleanse 1", "Ice cream cleanse · day 1", "Mostly rest: sleep, clean air, meditation and music", 35, "fast", 700],
      ["Cleanse 2", "Ice cream cleanse · day 2", "Gentle walk, journal, early night", 35, "fast", 700],
      ["Cleanse 3", "Ice cream cleanse · day 3", "Light movement starts; digestion is fully resting", 35, "fast", 700],
      ["Cleanse 4", "Ice cream cleanse · day 4", "Nature and sunlight; last cleanse day", 35, "fast", 700],
      ["Transition", "Transition day", "Soft-boiled eggs, bone broth and soft cooked vegetables", 70, "r2"],
      ["Normal", "Full protocol", "High-protein meals and all 7 healing steps", 100, "normal"]
    ] : [
      ["Prep", "Prep day", "Light plant-based meals and an early night", 70, "prep"],
      ["Juice 1", "Green juice cleanse · day 1", "Juice plus an avocado or nut dinner; mostly rest, meditation and music", 20, "fast", 400],
      ["Juice 2", "Green juice cleanse · day 2", "Gentle walk, journal, early night", 20, "fast", 400],
      ["Juice 3", "Green juice cleanse · day 3", "Light movement starts; digestion is fully resting", 20, "fast", 400],
      ["Refeed 1", "Refeed day 1", "Warm bone broth, soups and soft vegetables", 55, "r2"],
      ["Refeed 2", "Refeed day 2", "Gentle high-protein meals; strength or cardio begins", 80, "r3"],
      ["Normal", "Full protocol", "High-protein meals and all 7 healing steps", 100, "normal"]
    ];
    var arc = A1.map(function (x, k) { return { d: k + 1, l: x[0], t: x[1], n: x[2], p: x[3], ph: x[4], kcal: x[5] || Math.round(NORM * x[3] / 100) }; });
    var arcInfo = level === 1
      ? { lvl: 1, emoji: "🍨", name: "Ice Cream Cleanse", diff: "Easy", sub: "Calories as a share of normal intake. One light prep day, then 4 easy days of avocado or coconut-cream ice cream at breakfast and dinner (≈700 kcal), then one transition day back to whole food.",
          legend: [["prep", "Prep day (light meals)"], ["fast", "Ice cream days (≈700 kcal)"], ["r2", "Food reintroduction"], ["normal", "Normal diet"]] }
      : { lvl: 2, emoji: "🥬", name: "Green Juice Cleanse", diff: "Medium", sub: "Calories as a share of normal intake. One light plant-based prep day, then 3 simple days of a vegetable-forward juice plus an avocado or nut dinner (≈400 kcal), then two days easing back into whole food.",
          legend: [["prep", "Prep day (light meals)"], ["fast", "Green juice days (≈400 kcal)"], ["r2", "Food reintroduction"], ["normal", "Normal diet"]] };
    return { product: C.product, name: C.name, kind: C.kind, area: C.area, gentle: gentle, pct: pct, stress: stress, impression: impression, patterns: pats.slice(0, 3), level: level, levelName: levelName, plan: plan, focus: focus, arc: arc, arcInfo: arcInfo, cleanse: cl, answered: sym.length > 0 };
  }

  G.MTHQuizCore = { QUIZ: QUIZ, STEPS: STEPS, score: score };
})(typeof window !== "undefined" ? window : globalThis);
