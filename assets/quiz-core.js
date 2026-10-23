/* =================================================================
   MTH QUIZ CORE: questions + scoring for the free assessment quiz.
   Plain JS used in two places, so the page and the email always agree:
     - the browser (assets/quiz.js draws the quiz)
     - the mth-assess edge function (builds the emailed assessment)
   Results are educational patterns, never a diagnosis.
================================================================= */
(function (G) {
  var STEPS = ["Fasting & cleanse", "Meditation & journaling", "Nature & sun", "Sleep & clean air", "Music & spirituality", "Cardio & weights", "High-protein diet"];

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
      sym: { bloat: [3, [0, 6]], pain: [3, [0, 1]], reflux: [3, [6, 3]], constip: [2, [6, 5]], loose: [3, [0, 6]], fatigue: [2, [3, 1]], fog: [2, [1, 3]],
             sleep: [2, [3, 4]], foodsens: [3, [0, 6]], skin: [2, [6, 2]], cravings: [2, [0, 1]], stress: [2, [1, 4]] },
      patterns: {
        ibs: { label: "IBS-type pattern", w: { bloat: 2, pain: 3, constip: 2, loose: 2, stressflare: 2, stress: 1, _both: 3 },
          text: "Bloating, cramps and changing bowel habits often travel together. Calming the gut, steady meals and lowering stress usually matter most.", steps: [0, 1, 6] },
        reflux: { label: "Reflux pattern", w: { reflux: 5, meals: 1 },
          text: "Burning and reflux often ease with an earlier last meal, smaller portions and giving digestion a real rest.", steps: [0, 3, 6] },
        lining: { label: "Gut lining stress", w: { foodsens: 3, skin: 2, foods: 2, fatigue: 1, fog: 1 },
          text: "Reacting to foods, skin flare-ups and low energy can point to a stressed gut lining. Rest, protein and plenty of water help it rebuild.", steps: [0, 6, 2] },
        flora: { label: "Flora imbalance", w: { bloat: 2, cravings: 2, abx: 3, sugar: 2, alcohol: 1, meals: 1 },
          text: "Antibiotics, sugar and alcohol shift the bacteria in your gut. A cleanse followed by whole, high-protein meals helps reset the balance.", steps: [0, 6, 5] },
        slow: { label: "Slow digestion", w: { constip: 4, bloat: 1 },
          text: "Slow, sluggish digestion responds well to water, movement every day and fibre from vegetables.", steps: [5, 6, 2] },
        brain: { label: "Gut–brain strain", w: { stress: 3, sleep: 2, fog: 2, fatigue: 1, stressflare: 2 },
          text: "Your gut and nervous system talk constantly. Calming the stress response and sleeping deeper often settles digestion too.", steps: [1, 3, 4] }
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
      sym: { crash: [2, [6, 5]], crave: [3, [6, 0]], fog: [2, [6, 5]], morning: [3, [0, 3]], belly: [2, [5, 6]], thirst: [3, [6, 0]],
             tingle: [3, [5, 6]], bp: [2, [1, 5]], sleep: [2, [3, 1]], stress: [2, [1, 4]], lowact: [2, [5, 2]], night: [2, [0, 3]] },
      patterns: {
        ir: { label: "Insulin resistance pattern", w: { crave: 2, crash: 2, belly: 2, carbs: 2, fog: 1 },
          text: "Crashes, cravings and belly weight often mean your cells have stopped listening to insulin. Protein-first meals, a shorter eating window and moving after meals help most.", steps: [6, 0, 5] },
        dawn: { label: "Night and morning spikes", w: { morning: 3, night: 2, late: 2, sleep: 1 },
          text: "High morning readings and late eating go together. An earlier last meal and deeper sleep usually bring morning numbers down.", steps: [0, 3, 6] },
        high: { label: "Raised glucose signs", w: { thirst: 3, tingle: 3, a1c: 3 },
          text: "Thirst, tingling and raised HbA1c are signs to take seriously. Work with your doctor, and use food, movement and sleep to support the numbers.", steps: [6, 5, 0] },
        stress: { label: "Stress-driven sugar", w: { stress: 3, sleep: 2, night: 1, crave: 1 },
          text: "Stress hormones push blood sugar up on their own. Calming the nervous system and sleeping well often steadies readings.", steps: [1, 3, 4] },
        still: { label: "Low-movement pattern", w: { lowact: 3, sitting: 3, belly: 1 },
          text: "Muscles are where most sugar gets used. A short walk after meals and two strength sessions a week make a real difference.", steps: [5, 2, 6] },
        heart: { label: "Heart and metabolic load", w: { bp: 3, belly: 1, family: 2 },
          text: "Blood pressure, belly weight and family history add up. Steady weight loss, movement and less stress ease the whole system.", steps: [5, 1, 6] }
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
      sym: { nausea: [2, [6, 3]], constip: [2, [6, 2]], lowenergy: [2, [6, 5]], muscle: [3, [5, 6]], hair: [2, [6, 3]], plateau: [3, [5, 0]],
             cravings: [3, [6, 1]], regain: [3, [5, 6]], sleep: [2, [3, 1]], stresseat: [2, [1, 4]], lowact: [2, [5, 2]], skip: [2, [6, 0]] },
      patterns: {
        muscle: { label: "Muscle loss risk", w: { muscle: 3, lowprot: 3, nostr: 2, skip: 2, hair: 1, lowenergy: 1 },
          text: "Eating very little can strip muscle along with fat. Hitting your protein target and lifting twice a week protects it.", steps: [6, 5, 3] },
        gi: { label: "Gut side effects", w: { nausea: 3, constip: 3 },
          text: "Nausea and constipation are common on GLP-1s. Smaller meals, water, fibre from vegetables and gentle walks usually help.", steps: [6, 2, 3] },
        regain: { label: "Regain risk", w: { regain: 3, stopping: 3, yoyo: 2, cravings: 1 },
          text: "Weight often returns when the medication stops unless habits and muscle are in place. Building them now is the safest exit plan.", steps: [5, 6, 1] },
        plateau: { label: "Plateau pattern", w: { plateau: 3, lowact: 2, sleep: 1, alcohol: 1 },
          text: "Plateaus usually ease with more daily movement, strength work, deeper sleep and less alcohol.", steps: [5, 3, 0] },
        emotional: { label: "Stress and cravings", w: { stresseat: 3, cravings: 2, sleep: 1 },
          text: "Cravings coming back often follow stress and short sleep. Calming the stress response keeps appetite steady.", steps: [1, 3, 4] }
      }
    }
  };

  function arr(v) { return Array.isArray(v) ? v : v ? [v] : []; }
  function has(a, k) { return arr(a.sym).indexOf(k) >= 0 || arr(a.trig).indexOf(k) >= 0; }

  /* =================================================================
     THE HEALING ASSESSMENT ("heal"): the whole-life lead-magnet quiz.
     7 sections, 29 questions: goal, how you feel, what's been hard,
     daily habits, home & work clues, stress & support, your 90 days.
     Result: a Healing Score out of 100, four area scores, the 3 changes
     that matter most for this person, home/work clues worth checking,
     and the course that fits. Educational, never a diagnosis.
  ================================================================= */
  var STEPS7 = ["Fasting & Cleanse", "Meditation & Journaling", "Nature (forest & sun)", "Sleep & Clean Air", "Music & Spirituality", "Cardio & Weights", "High-Protein Diet"];
  var FIRST = [
    "Start with a gentle 12-hour overnight fast, then try one guided green juice day.",
    "Ten minutes each morning: breathe, then write three lines about how you feel.",
    "Get 10 minutes of morning sunlight and one walk among trees this week.",
    "Same bedtime every night, screens off an hour before, a window open for fresh air.",
    "Make a healing playlist, and end each day with a few minutes of gratitude or prayer.",
    "A 20-minute walk every day, plus two short strength sessions this week.",
    "Build every meal around protein and vegetables, and drink water before each meal."
  ];
  QUIZ.heal = {
    kind: "heal", product: "heal", name: "The Healing Assessment",
    sections: [
      ["Your goal", "Let's start with what matters most to you."],
      ["How you feel", "Your body has been trying to tell you something. Let's listen."],
      ["What's been hard", "You've probably tried a lot already. That isn't failure. It tells us where to start."],
      ["Daily habits", "No judgement here. Honest answers build a plan that actually fits your life."],
      ["Home and work", "Where you live and work affects your health more than most people realise."],
      ["Stress and support", "These are personal. Answer only what you're comfortable with. Stress and relationships affect your body as much as food does, and the research is clear on that."],
      ["Your next 90 days", "Almost done. Let's picture where you want to be."]
    ],
    questions: [
      { id: "goal", s: 0, type: "one", q: "What would you most like help with?",
        o: [["gut", "My gut and digestion"], ["sugar", "My blood sugar"], ["weight", "Losing weight"], ["energy", "More energy"], ["pain", "Pain and inflammation"], ["calm", "Sleep, stress and mood"], ["whole", "Healing my whole body"]] },
      { id: "glp", s: 0, type: "one", q: "Are you taking a weight-loss or diabetes injection?", hint: "Such as Ozempic, Wegovy, Mounjaro or Zepbound.",
        o: [["yes", "Yes, I'm on one"], ["maybe", "I'm considering it"], ["no", "No"]] },
      { id: "age", s: 0, type: "one", q: "What's your age?",
        o: [["u30", "Under 30"], ["30s", "30s"], ["40s", "40s"], ["50s", "50s"], ["60s", "60s"], ["70p", "70 or older"]] },
      { id: "dur", s: 0, type: "one", q: "How long have you been dealing with this?",
        o: [["new", "Less than 3 months"], ["y1", "3 to 12 months"], ["y5", "1 to 5 years"], ["y5p", "More than 5 years"]] },

      { id: "gutsx", s: 1, type: "multi", q: "Any of these in your gut?", hint: "Tap everything that applies.",
        o: [["bloat", "Bloating or gas"], ["reflux", "Reflux or heartburn"], ["constip", "Constipation"], ["loose", "Loose stools"], ["pain", "Belly pain or cramps"], ["foods", "Reacting to foods"], ["none", "None of these"]] },
      { id: "bodysx", s: 1, type: "multi", q: "And in the rest of your body?", hint: "Tap everything that applies.",
        o: [["tired", "Fatigue"], ["fog", "Brain fog"], ["joints", "Joint or muscle pain"], ["head", "Headaches"], ["skin", "Skin flare-ups"], ["crave", "Sugar cravings"], ["belly", "Weight around the middle"], ["colds", "Catching every cold"], ["none", "None of these"]] },
      { id: "mindsx", s: 1, type: "multi", q: "How about your mind and sleep?", hint: "Tap everything that applies.",
        o: [["anx", "Anxiety or worry"], ["low", "Low mood"], ["sleep", "Trouble falling asleep"], ["wake", "Waking in the night"], ["irrit", "Irritability"], ["none", "None of these"]] },
      { id: "energy", s: 1, type: "one", q: "How is your energy on most days?",
        o: [["e1", "Running on empty"], ["e2", "Low"], ["e3", "Up and down"], ["e4", "Pretty good"], ["e5", "Great"]] },
      { id: "freq", s: 1, type: "one", q: "How often do you feel unwell?",
        o: [["daily", "Every day"], ["weekly", "A few times a week"], ["some", "Now and then"], ["rare", "Rarely"]] },

      { id: "impact", s: 2, type: "one", q: "How much is your health holding you back?",
        o: [["little", "A little"], ["some", "Some days are hard"], ["most", "Most days"], ["runs", "It runs my life"]] },
      { id: "tried", s: 2, type: "multi", q: "What have you tried so far?", hint: "Tap any that fit.",
        o: [["diets", "Diets or cutting out foods"], ["supps", "Supplements"], ["doctor", "Doctors or medication"], ["fast", "A cleanse or fast"], ["gym", "A gym or fitness plan"], ["nothing", "Nothing yet"]] },
      { id: "hard", s: 2, type: "multi", q: "What has made it hardest?", hint: "Tap any that fit.",
        o: [["last", "Results never last"], ["confuse", "Too much confusing advice"], ["time", "Not enough time"], ["alone", "Doing it on my own"], ["cost", "The cost"], ["start", "Not knowing where to start"]] },

      { id: "food", s: 3, type: "one", q: "What does your food look like most days?",
        o: [["whole", "Mostly home-cooked, whole foods"], ["mix", "A mix"], ["fast", "Mostly packaged or fast food"]] },
      { id: "sweet", s: 3, type: "one", q: "How often do you have sweets or desserts?",
        o: [["daily", "Every day"], ["weekly", "A few times a week"], ["rare", "Rarely"]] },
      { id: "drinks", s: 3, type: "multi", q: "What do you drink on most days?", hint: "Tap everything that applies.",
        o: [["water", "Plenty of water"], ["coffee", "Three or more coffees"], ["soda", "Soda or juice"], ["energy", "Energy drinks"], ["alcohol", "Alcohol"]] },
      { id: "smoke", s: 3, type: "one", q: "Do you smoke or vape?",
        o: [["no", "No"], ["yes", "Yes"], ["quit", "I quit"]] },
      { id: "meds", s: 3, type: "one", q: "How many prescription medicines do you take daily?",
        o: [["0", "None"], ["1", "One or two"], ["3", "Three or more"]] },
      { id: "sleephrs", s: 3, type: "one", q: "How much sleep do you usually get?",
        o: [["u5", "Under 5 hours"], ["h6", "5 to 6 hours"], ["h7", "7 to 8 hours"], ["h9", "More than 8 hours"]] },
      { id: "move", s: 3, type: "one", q: "How many days a week do you move for 30 minutes or more?",
        o: [["0", "None"], ["1", "1 or 2"], ["3", "3 or 4"], ["5", "5 or more"]] },
      { id: "outside", s: 3, type: "one", q: "How much daylight do you get outside on most days?",
        o: [["u15", "Less than 15 minutes"], ["h1", "15 to 60 minutes"], ["h1p", "More than an hour"]] },

      { id: "home", s: 4, type: "multi", q: "Does any of this sound like your home?", hint: "Tap any that fit. These are clues, not answers.",
        o: [["away", "I feel worse at home and better when I'm away"], ["musty", "A musty smell, mold or past water damage"], ["egg", "A rotten-egg smell near drains or the toilet"], ["basement", "I live or sleep in a basement"], ["new", "New furniture, flooring or renovations this year"], ["gas", "A gas stove"], ["none", "None of these"]] },
      { id: "work", s: 4, type: "multi", q: "At work, are you around any of these?", hint: "Tap any that fit.",
        o: [["noise", "Loud noise"], ["dust", "Dust: wood, concrete, grain, drywall"], ["chem", "Chemicals, solvents or pesticides"], ["fumes", "Fumes or smoke, like welding or exhaust"], ["damp", "Mold or a damp building"], ["night", "Night or rotating shifts"], ["sit", "Long hours sitting or at a screen"], ["lift", "Heavy lifting or repetitive strain"], ["none", "None of these"]] },

      { id: "stress", s: 5, type: "one", q: "How stressed do you feel most weeks?",
        o: [["low", "Low"], ["mod", "Moderate"], ["high", "High"], ["over", "Overwhelming"]] },
      { id: "load", s: 5, type: "multi", q: "Where does the stress come from?", hint: "Tap any that fit, or skip.",
        o: [["work", "Work or a difficult boss"], ["money", "Money or debt"], ["partner", "My relationship"], ["family", "Family tension or someone I don't speak to"], ["care", "Caring for someone"], ["grief", "Grief or a big loss"], ["health", "Worry about my health"], ["lonely", "Loneliness"], ["unsafe", "I don't always feel safe at home"]] },
      { id: "support", s: 5, type: "one", q: "When things get hard, who can you lean on?",
        o: [["many", "Several people"], ["one", "One person"], ["none", "No one, really"]] },
      { id: "calm", s: 5, type: "multi", q: "What helps you feel calm or whole?", hint: "Tap any you do now.",
        o: [["pray", "Prayer or meditation"], ["write", "Journaling"], ["music", "Music"], ["nature", "Time in nature"], ["people", "Time with people I love"], ["none", "Nothing right now"]] },

      { id: "vision", s: 6, type: "one", q: "In 90 days, what would change your life the most?",
        o: [["energy", "Waking up with energy"], ["gut", "A calm, easy gut"], ["sugar", "Steady blood sugar"], ["weight", "Losing weight and keeping it off"], ["pain", "Less pain"], ["calm", "Feeling calm and sleeping well"], ["me", "Feeling like myself again"]] },
      { id: "ready", s: 6, type: "one", q: "How ready are you to start?",
        o: [["now", "Ready now"], ["soon", "Soon, I need a plan"], ["look", "Just exploring"]] }
    ]
  };

  var COURSES = {
    gut: { product: "gut", name: "The Gut Health Protocol", sales: "gut.html" },
    sugar: { product: "sugar", name: "The Diabetes Protocol", sales: "diabetes.html" },
    glp1: { product: "glp1", name: "The GLP-1 Weight Loss Protocol", sales: "glp1.html" }
  };
  function lvl(map, v, d) { return v in map ? map[v] : d; }
  function clamp(x) { return Math.max(0, Math.min(100, Math.round(x))); }

  function scoreHeal(answers) {
    var a = answers || {}, L = function (k) { return arr(a[k]).filter(function (x) { return x !== "none" && x !== "nothing"; }); };
    var pts = [0, 0, 0, 0, 0, 0, 0], why = [[], [], [], [], [], [], []];
    function add(step, p, reason) { pts[step] += p; if (reason) why[step].push([p, reason]); }

    // ---- how you feel (body) ----
    var gut = L("gutsx"), body = L("bodysx"), mind = L("mindsx");
    var nSym = gut.length + body.length + mind.length;
    var energy = lvl({ e1: 0, e2: 25, e3: 50, e4: 75, e5: 100 }, a.energy, 60);
    var freq = lvl({ daily: 0, weekly: 35, some: 70, rare: 100 }, a.freq, 70);
    var impact = lvl({ little: 85, some: 60, most: 30, runs: 5 }, a.impact, 70);
    var sBody = clamp((100 - Math.min(nSym, 12) / 12 * 100) * 0.4 + energy * 0.2 + freq * 0.2 + impact * 0.2);

    if (gut.length) add(0, 2 + gut.length, gut.length > 1 ? "your " + gut.length + " gut symptoms" : "your gut symptom");
    if (gut.indexOf("foods") >= 0 || gut.indexOf("bloat") >= 0) add(6, 2, "bloating and food reactions often ease with simpler, protein-first meals");
    if (body.indexOf("crave") >= 0 || body.indexOf("belly") >= 0) { add(0, 3, "sugar cravings and weight around the middle"); add(6, 3, "cravings settle when meals are built on protein"); }
    if (body.indexOf("tired") >= 0 || a.energy === "e1" || a.energy === "e2") { add(3, 3, "your low energy"); add(5, 1, ""); }
    if (body.indexOf("joints") >= 0) { add(0, 2, "joint and muscle pain, often linked to inflammation"); add(5, 1, ""); }
    if (body.indexOf("fog") >= 0) add(3, 2, "brain fog");
    if (mind.indexOf("anx") >= 0 || mind.indexOf("low") >= 0) { add(1, 3, "the anxiety or low mood you mentioned"); add(4, 2, "your mood"); add(2, 1, ""); }
    if (mind.indexOf("sleep") >= 0 || mind.indexOf("wake") >= 0) add(3, 4, "your broken sleep");
    if (mind.indexOf("irrit") >= 0) add(1, 1, "");

    // ---- habits ----
    var hp = 100, hn = [];
    if (a.food === "fast") { hp -= 20; add(6, 4, "most of your food comes from packages or fast food"); add(0, 2, ""); } else if (a.food === "mix") { hp -= 8; add(6, 1, ""); }
    if (a.sweet === "daily") { hp -= 12; add(0, 3, "sweets every day"); add(6, 2, ""); } else if (a.sweet === "weekly") hp -= 4;
    var dr = arr(a.drinks);
    if (dr.indexOf("water") < 0) { hp -= 8; add(6, 2, "you're not drinking much water"); }
    if (dr.indexOf("soda") >= 0) { hp -= 8; add(0, 2, "soda or juice most days"); }
    if (dr.indexOf("energy") >= 0) { hp -= 6; add(3, 2, "energy drinks, which borrow sleep from tomorrow"); }
    if (dr.indexOf("alcohol") >= 0) { hp -= 10; add(0, 2, "alcohol most days"); add(3, 1, ""); }
    if (dr.indexOf("coffee") >= 0) { hp -= 3; add(3, 1, ""); }
    if (a.smoke === "yes") { hp -= 20; add(3, 2, "smoking, which strains your lungs and blood vessels"); add(5, 1, ""); }
    if (a.sleephrs === "u5") { hp -= 18; add(3, 6, "you're sleeping under 5 hours"); } else if (a.sleephrs === "h6") { hp -= 10; add(3, 4, "you're sleeping 5 to 6 hours"); }
    if (a.move === "0") { hp -= 16; add(5, 6, "you're not moving much yet"); } else if (a.move === "1") { hp -= 8; add(5, 3, "you move 1 or 2 days a week"); }
    if (a.outside === "u15") { hp -= 10; add(2, 5, "you get less than 15 minutes of daylight"); } else if (a.outside === "h1") { hp -= 3; add(2, 1, ""); }
    var sHabits = clamp(hp);

    // ---- home and work clues ----
    var home = L("home"), work = L("work"), clues = [];
    var C2 = {
      away: "Feeling better away from home is a clue worth following. Air quality is the first thing to check.",
      musty: "Look for hidden mold or water damage, especially in basements, bathrooms and under sinks.",
      egg: "Have drains, traps and toilet seals checked. A rotten-egg smell can be sewer gas (hydrogen sulfide).",
      basement: "Test for radon with an inexpensive home kit, especially if you live or sleep below ground.",
      "new": "Air out rooms often. New furniture, flooring and paint release fumes (VOCs) for months.",
      gas: "Use the range hood or open a window when cooking on gas.",
      noise: "Protect your hearing at work. Constant noise also raises stress hormones.",
      dust: "Ask about masks and dust control at work, and change clothes before you get home.",
      chem: "Ask about gloves, masks and ventilation for the chemicals you work with.",
      fumes: "Ask about ventilation and the right mask for fumes at work.",
      damp: "A damp or moldy workplace is worth raising with your employer.",
      night: "Night shifts upset sleep and blood sugar. A steady sleep routine on days off helps most.",
      sit: "Stand up and move for a few minutes every hour you sit.",
      lift: "Strength training protects the joints that heavy work wears down."
    };
    home.concat(work).forEach(function (k) { if (C2[k]) clues.push(C2[k]); });
    var envHits = home.length * 14 + work.length * 9;
    var sEnv = clamp(100 - envHits);
    if (home.length) add(3, 2 + 2 * home.length, home.length > 1 ? "several clues about the air in your home" : "a clue about the air in your home");
    if (home.indexOf("away") >= 0 || home.indexOf("musty") >= 0) add(2, 2, "time outdoors gives your body a break from indoor air");
    if (work.indexOf("night") >= 0) add(3, 4, "night or rotating shifts");
    if (work.indexOf("sit") >= 0) add(5, 3, "long hours sitting");
    if (work.indexOf("fumes") >= 0 || work.indexOf("chem") >= 0 || work.indexOf("dust") >= 0) add(3, 2, "what you breathe at work");

    // ---- stress and support ----
    var stress = lvl({ low: 90, mod: 65, high: 35, over: 10 }, a.stress, 65);
    var unsafe = arr(a.load).indexOf("unsafe") >= 0, load = L("load").filter(function (x) { return x !== "unsafe"; });
    var support = lvl({ many: 100, one: 65, none: 20 }, a.support, 65);
    var calm = L("calm");
    var sMind = clamp(stress * 0.45 + support * 0.3 + Math.min(calm.length, 3) / 3 * 100 * 0.15 + (100 - Math.min(load.length, 5) * 20) * 0.1);
    if (a.stress === "high" || a.stress === "over") { add(1, 6, "your stress is " + (a.stress === "over" ? "overwhelming" : "high")); add(4, 2, ""); add(2, 2, ""); }
    else if (a.stress === "mod") add(1, 2, "");
    if (load.indexOf("grief") >= 0) { add(4, 3, "the grief you're carrying"); add(1, 2, ""); }
    if (load.indexOf("family") >= 0 || load.indexOf("partner") >= 0) add(1, 3, "tension with people close to you");
    if (load.indexOf("money") >= 0 || load.indexOf("work") >= 0) add(1, 2, "pressure from work or money");
    if (a.support === "none" || load.indexOf("lonely") >= 0) add(4, 4, "you're carrying a lot on your own");
    if (calm.length === 0 && a.calm) { add(1, 2, "you don't have a way to unwind yet"); add(4, 2, ""); }

    // ---- the score ----
    var answered = !!a.goal && (gut.length + body.length + mind.length > 0 || !!a.energy);
    var score = clamp(sBody * 0.3 + sHabits * 0.3 + sEnv * 0.15 + sMind * 0.25);
    var band = score >= 80 ? "A strong foundation" : score >= 60 ? "A good base, with clear gains ahead" : score >= 40 ? "Your body is asking for change" : "Time to put yourself first";
    var areas = [
      { id: "body", name: "How you feel", score: sBody },
      { id: "habits", name: "Daily habits", score: sHabits },
      { id: "env", name: "Home and work", score: sEnv },
      { id: "mind", name: "Stress and support", score: sMind }
    ];

    // goal leans a little on its matching steps
    ({ gut: [[0, 3], [6, 2]], sugar: [[6, 3], [5, 3], [0, 2]], weight: [[6, 3], [5, 3], [0, 2]], energy: [[3, 3], [2, 2]], pain: [[0, 3], [5, 2]], calm: [[1, 3], [3, 3], [4, 2]], whole: [[2, 1], [1, 1]] }[a.goal] || []).forEach(function (x) { add(x[0], x[1], ""); });

    var mx = Math.max.apply(null, pts) || 1;
    var plan = STEPS7.map(function (n, i) { return { step: n, pct: Math.round(40 + 60 * pts[i] / mx) }; });
    var order = pts.map(function (p, i) { return [i, p]; }).sort(function (x, y) { return y[1] - x[1] || x[0] - y[0]; });
    var changes = order.slice(0, 3).map(function (o) {
      var i = o[0], r = why[i].slice().sort(function (x, y) { return y[0] - x[0]; }).map(function (x) { return x[1]; }).filter(Boolean);
      return { step: STEPS7[i], i: i, because: r.slice(0, 2), first: FIRST[i] };
    });
    var focus = changes.map(function (c) { return c.step; });

    // which course fits
    var course = a.goal === "sugar" ? "sugar" : (a.goal === "weight" && (a.glp === "yes" || a.glp === "maybe")) || a.glp === "yes" ? "glp1" : "gut";
    return { kind: "heal", product: "heal", course: course, courseName: COURSES[course].name, sales: COURSES[course].sales,
      score: score, band: band, areas: areas, changes: changes, focus: focus, plan: plan, clues: clues.slice(0, 5), unsafe: unsafe,
      alone: a.support === "none", ready: a.ready || "", answered: answered, pct: 100 - score, impression: band };
  }
  QUIZ.heal.score = scoreHeal;
  QUIZ.heal.courses = COURSES;

  /* answers: { sym:[ids], freq:id, dur:id, trig:[ids], tried:[ids], impact:id, goal:id } */
  function score(product, answers) {
    if (QUIZ[product] && QUIZ[product].kind === "heal") return scoreHeal(answers);
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
      ["Transition", "Transition day", "Soft-boiled eggs, Greek yogurt and soft cooked vegetables", 70, "r2"],
      ["Normal", "Full protocol", "High-protein meals and all 7 healing steps", 100, "normal"]
    ] : [
      ["Prep", "Prep day", "Light plant-based meals and an early night", 70, "prep"],
      ["Juice 1", "Green juice cleanse · day 1", "Juice plus an avocado or nut dinner; mostly rest, meditation and music", 20, "fast", 400],
      ["Juice 2", "Green juice cleanse · day 2", "Gentle walk, journal, early night", 20, "fast", 400],
      ["Juice 3", "Green juice cleanse · day 3", "Light movement starts; digestion is fully resting", 20, "fast", 400],
      ["Refeed 1", "Refeed day 1", "Diluted green juice, coconut water and soft vegetables", 55, "r2"],
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

  G.MTHQuizCore = { QUIZ: QUIZ, STEPS: STEPS, STEPS7: STEPS7, score: score };
})(typeof window !== "undefined" ? window : globalThis);
