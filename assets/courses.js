/* =================================================================
   COURSE OUTLINES — Gut Health, Diabetes, GLP-1
   Each course has 7 sections, one per healing step (plus "Start here").
   Titles, descriptions and the refresher quizzes live here.
   Video and ebook links live in Supabase (table mth_lesson_media),
   so only members who bought that course can see them.
   Quizzes: no pass mark; a = index of the right answer (0 = first),
   fb = what the member sees after answering.
================================================================= */
window.MTH_COURSES={
 "gut": {
  "product": "gut",
  "title": "The Gut Health Protocol",
  "sections": [
   {
    "id": "start",
    "title": "Start here",
    "sub": "Welcome & your app",
    "img": "0-intro",
    "lessons": [
     {
      "id": "welcome",
      "title": "Welcome to the Gut Health Protocol",
      "mins": 5,
      "text": "How the 7-day reset works, what to expect each day, and how the course, the ebooks and your app fit together. Watch this first, then set up your app."
     },
     {
      "id": "app",
      "title": "Set up your healing app",
      "mins": 5,
      "app": true,
      "text": "Your app turns your symptoms and test results into a day-by-day plan. Fill in the short intake, choose your cleanse level and pick a start date."
     }
    ]
   },
   {
    "id": "s1",
    "step": 1,
    "title": "Fasting & cleanse",
    "sub": "Rest digestion",
    "img": "1-fasting",
    "lessons": [
     {
      "id": "fasting",
      "title": "Fasting & the green juice cleanse",
      "mins": 12,
      "text": "Why giving your gut a rest kick-starts repair: autophagy, the three cleanse levels (avocado & nut, green juice and mineral water) and how to fast safely, with the electrolytes that keep you steady.",
      "quiz": [
       {
        "q": "What is autophagy?",
        "o": [
         "A type of juice cleanse",
         "The body's built-in cellular recycling and clean-up process",
         "A hormone that makes you hungry",
         "A form of exercise"
        ],
        "a": 1,
        "fb": "Autophagy means \"self-eating\": your cells break down and recycle damaged parts. Fasting is one of its strongest triggers."
       },
       {
        "q": "Roughly when does autophagy start to switch on during a fast?",
        "o": [
         "After 1–2 hours",
         "After 12–16 hours",
         "After 5 days",
         "Only during sleep"
        ],
        "a": 1,
        "fb": "Around 12–16 hours in, stored sugar runs low and insulin drops, so the clean-up process begins. It builds from there."
       },
       {
        "q": "Which fasting style is described as the best entry point for beginners?",
        "o": [
         "A 7-day water fast",
         "Juice fasting",
         "One meal a day",
         "A dry fast"
        ],
        "a": 1,
        "fb": "Juice fasting gives your gut a rest while still providing vitamins and plant nutrients, which makes it gentler to start with."
       },
       {
        "q": "The Fasting Mimicking Diet (FMD) was developed by which researcher?",
        "o": [
         "Dr. Valter Longo",
         "Dr. Otto Warburg",
         "Dr. James Pennebaker",
         "Dr. Roger Ulrich"
        ],
        "a": 0,
        "fb": "Dr. Longo's team at USC designed FMD: five low-calorie, plant-based days that give many of fasting's benefits while still eating a little."
       },
       {
        "q": "In 16:8 intermittent fasting, what do the numbers mean?",
        "o": [
         "16 meals and 8 snacks a week",
         "16 hours fasting and an 8-hour eating window",
         "16 days fasting and 8 days eating",
         "16 glasses of water and 8 hours of sleep"
        ],
        "a": 1,
        "fb": "16:8 is the most studied daily schedule: you eat within an 8-hour window and fast for the other 16 hours."
       }
      ]
     }
    ]
   },
   {
    "id": "s2",
    "step": 2,
    "title": "Meditation & journaling",
    "sub": "Calm the nervous system",
    "img": "2-meditation",
    "lessons": [
     {
      "id": "meditation",
      "title": "Meditation",
      "mins": 10,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "In the Harvard brain-scan studies, how long did an MBSR meditation course take to show measurable brain changes?",
        "o": [
         "1 day",
         "8 weeks",
         "2 years",
         "10 years"
        ],
        "a": 1,
        "fb": "About 8 weeks of regular practice was enough to see changes on MRI scans, so a steady habit adds up quickly."
       },
       {
        "q": "Which part of the brain, the \"alarm system\" for fear and stress, became less dense after the meditation course?",
        "o": [
         "The amygdala",
         "The spinal cord",
         "The cerebellum",
         "The optic nerve"
        ],
        "a": 0,
        "fb": "The amygdala drives stress reactions. As it quietens, people report less stress and anxiety."
       },
       {
        "q": "Which brainwave state is described as \"relaxed alertness\", common in experienced meditators?",
        "o": [
         "Beta",
         "Alpha",
         "Gamma",
         "Delta"
        ],
        "a": 1,
        "fb": "Alpha is the calm, focused state. Meditation helps shift a stressed, high-beta brain toward it."
       },
       {
        "q": "What does BDNF, which rises with regular meditation, help the brain do?",
        "o": [
         "Store fat",
         "Grow new neurons and strengthen connections",
         "Produce stomach acid",
         "Raise cortisol"
        ],
        "a": 1,
        "fb": "BDNF is like fertiliser for brain cells. It supports learning, memory and mood."
       },
       {
        "q": "What does meditation do to cortisol, the main stress hormone?",
        "o": [
         "Raises it",
         "Lowers it",
         "Has no effect",
         "Turns it into insulin"
        ],
        "a": 1,
        "fb": "Regular practice lowers cortisol, which calms inflammation and helps break the stress and pain cycle."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 8,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "How long was each writing session in Pennebaker's expressive writing studies?",
        "o": [
         "2 minutes",
         "About 15 minutes a day",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Just 15 minutes a day for 4 days was enough to see real health benefits. It's a small, doable habit."
       },
       {
        "q": "In his original study, what happened to students who wrote about difficult experiences?",
        "o": [
         "They visited the health centre about half as often",
         "They got sick more often",
         "Nothing changed",
         "They stopped sleeping"
        ],
        "a": 0,
        "fb": "Putting hard feelings into words seems to take a load off the body as well as the mind."
       },
       {
        "q": "Which stress hormone tends to be lower on days people journal?",
        "o": [
         "Insulin",
         "Cortisol",
         "Melatonin",
         "Oxytocin"
        ],
        "a": 1,
        "fb": "Writing helps the brain \"close the loop\" on worries, so the stress system settles and cortisol drops."
       },
       {
        "q": "Which type of bedtime writing helped people fall asleep fastest?",
        "o": [
         "Writing a to-do list for tomorrow",
         "Writing about what went wrong today",
         "Copying out a book",
         "Writing nothing at all"
        ],
        "a": 0,
        "fb": "Getting tomorrow's tasks onto paper offloads them from your mind, so you fall asleep faster."
       },
       {
        "q": "What does gratitude journaling help with, according to the review of 64 trials?",
        "o": [
         "Only handwriting",
         "Lower anxiety and better mood and sleep",
         "Weight gain",
         "Nothing measurable"
        ],
        "a": 1,
        "fb": "Writing down a few things you're grateful for each night is linked to calmer moods and better sleep."
       }
      ]
     }
    ]
   },
   {
    "id": "s7",
    "step": 3,
    "title": "Nature & sun",
    "sub": "Reset outdoors",
    "img": "7-nature",
    "lessons": [
     {
      "id": "sunlight",
      "title": "Sunlight",
      "mins": 8,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the hospital studies, what happened to patients in sunnier rooms?",
        "o": [
         "They stayed longer",
         "They recovered faster and used less pain medication",
         "Nothing changed",
         "They slept less"
        ],
        "a": 1,
        "fb": "Brighter rooms were linked to quicker recovery, earlier discharge and less need for pain relief."
       },
       {
        "q": "Which vitamin does your skin make from sunlight?",
        "o": [
         "Vitamin C",
         "Vitamin D",
         "Vitamin B12",
         "Vitamin K"
        ],
        "a": 1,
        "fb": "UVB light on your skin starts vitamin D production, which supports immunity, bones and mood."
       },
       {
        "q": "Why is morning sunlight especially helpful?",
        "o": [
         "It's warmer",
         "It resets your body clock, which improves sleep that night",
         "It has no UV",
         "It boosts caffeine"
        ],
        "a": 1,
        "fb": "Morning light sets your circadian rhythm, so melatonin is released on time in the evening."
       },
       {
        "q": "Which mood chemical does sunlight help your brain make?",
        "o": [
         "Serotonin",
         "Adrenaline",
         "Cortisol",
         "Histamine"
        ],
        "a": 0,
        "fb": "Serotonin lifts mood and dampens pain signals, one reason sunny days feel better."
       },
       {
        "q": "What happens to blood pressure after about 20 minutes of sun, according to the Edinburgh research?",
        "o": [
         "It goes up sharply",
         "It drops slightly as nitric oxide widens blood vessels",
         "It stays exactly the same",
         "It becomes irregular"
        ],
        "a": 1,
        "fb": "UVA light releases nitric oxide from the skin, relaxing blood vessels. Enjoy the sun, but never burn."
       }
      ]
     },
     {
      "id": "redlight",
      "title": "Red light therapy",
      "mins": 6,
      "text": "What red and near-infrared light do for your cells, and how to use a panel at home.",
      "quiz": [
       {
        "q": "What is the scientific name for red light therapy?",
        "o": [
         "Photobiomodulation",
         "Phototropism",
         "Photosynthesis",
         "Ultraviolet therapy"
        ],
        "a": 0,
        "fb": "Photobiomodulation means using light to change how cells behave. Red light therapy is the everyday name."
       },
       {
        "q": "Which wavelengths does red light therapy use?",
        "o": [
         "Ultraviolet (below 400 nm)",
         "Red (630–700 nm) and near-infrared (800–1100 nm)",
         "Blue (450 nm) only",
         "X-rays"
        ],
        "a": 1,
        "fb": "Red and near-infrared light are the healing window. Unlike UV, they don't burn the skin."
       },
       {
        "q": "Which part of the cell absorbs red light and makes more energy?",
        "o": [
         "The nucleus",
         "The mitochondria",
         "The cell wall",
         "The ribosomes"
        ],
        "a": 1,
        "fb": "Your mitochondria are the cell's power plants. Red light helps them produce more ATP, the cell's energy."
       },
       {
        "q": "Which goes deeper into the body?",
        "o": [
         "Red light",
         "Near-infrared light",
         "They reach the same depth",
         "Neither passes the skin"
        ],
        "a": 1,
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimetres, reaching muscles and joints."
       },
       {
        "q": "What does the release of nitric oxide during red light therapy do?",
        "o": [
         "Tightens blood vessels",
         "Widens blood vessels and improves circulation",
         "Raises blood sugar",
         "Causes sunburn"
        ],
        "a": 1,
        "fb": "Nitric oxide relaxes blood vessels, so more blood and oxygen reach the tissue being treated."
       }
      ]
     },
     {
      "id": "forest",
      "title": "Forest bathing",
      "mins": 6,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week."
     }
    ]
   },
   {
    "id": "s6",
    "step": 4,
    "title": "Sleep & clean air",
    "sub": "Repair at night",
    "img": "6-sleep",
    "lessons": [
     {
      "id": "sleep",
      "title": "Sleep",
      "mins": 10,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "What is the ideal bedroom temperature for deep sleep, according to sleep lab studies?",
        "o": [
         "55–58°F",
         "65–68°F",
         "75–78°F",
         "Above 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature needs to drop to fall asleep. A cool room speeds that up and deepens sleep."
       },
       {
        "q": "About how long is the half-life of caffeine in most adults?",
        "o": [
         "30 minutes",
         "About 6 hours",
         "24 hours",
         "A week"
        ],
        "a": 1,
        "fb": "Half of a 2 pm coffee is still active at 8 pm, which is why an early caffeine cut-off helps sleep."
       },
       {
        "q": "How long before bed should you avoid screens and bright blue light?",
        "o": [
         "5 minutes",
         "About 1 hour",
         "It doesn't matter",
         "12 hours"
        ],
        "a": 1,
        "fb": "Blue light tells your brain it's daytime and holds back melatonin. Warm, dim light in the last hour helps."
       },
       {
        "q": "Why are blackout curtains recommended?",
        "o": [
         "They keep the room warm",
         "Even a little light can cut melatonin, and darkness lets it rise fully",
         "They block noise",
         "They look better"
        ],
        "a": 1,
        "fb": "Light through closed eyelids can still suppress melatonin, so total darkness protects deep sleep."
       },
       {
        "q": "Why does the ebook suggest keeping your phone out of the bedroom?",
        "o": [
         "Its blue light and stimulating content keep your brain alert",
         "It uses too much electricity",
         "It makes the room hot",
         "It has no effect on sleep"
        ],
        "a": 0,
        "fb": "Screens suppress melatonin and scrolling raises stress hormones. A phone-free bedroom helps your brain link bed with sleep."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 6,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "According to the EPA, how does indoor air usually compare with outdoor air?",
        "o": [
         "It is cleaner",
         "It is 2–5 times more polluted",
         "It is exactly the same",
         "It has no pollutants"
        ],
        "a": 1,
        "fb": "Indoor air traps pollutants from furniture, cleaning products and cooking, and we spend about 90% of our time inside."
       },
       {
        "q": "Radon is dangerous partly because it is…",
        "o": [
         "Bright red and smelly",
         "Colourless and odourless, so you need a monitor to detect it",
         "Only found in big cities",
         "Harmless in small amounts"
        ],
        "a": 1,
        "fb": "Radon seeps up from the ground through foundations. A simple test kit or monitor is the only way to know your level."
       },
       {
        "q": "What are VOCs?",
        "o": [
         "Vitamins in vegetables",
         "Chemicals that evaporate from things like paint, new furniture and air fresheners",
         "A type of mould",
         "Oxygen molecules"
        ],
        "a": 1,
        "fb": "Volatile organic compounds drift into the air from everyday products. Fresh air and fewer scented products help."
       },
       {
        "q": "What does mould need to grow indoors?",
        "o": [
         "Sunlight",
         "Moisture",
         "Cold air",
         "Electricity"
        ],
        "a": 1,
        "fb": "Leaks, damp bathrooms and water damage let mould grow. Fixing moisture is the first step."
       },
       {
        "q": "What is the target carbon dioxide level for good thinking and sleep?",
        "o": [
         "Below 800 ppm",
         "Around 2,500 ppm",
         "Over 4,000 ppm",
         "It doesn't matter"
        ],
        "a": 0,
        "fb": "A closed bedroom can climb past 2,000 ppm overnight. Opening a window or running ventilation keeps CO2 low."
       }
      ]
     }
    ]
   },
   {
    "id": "s5",
    "step": 5,
    "title": "Music & spirituality",
    "sub": "Sound as medicine",
    "img": "5-music",
    "lessons": [
     {
      "id": "music",
      "title": "Music therapy",
      "mins": 8,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What happened to cortisol after surgery when patients listened to calming music?",
        "o": [
         "It rose",
         "It dropped compared with silence",
         "Nothing changed",
         "It disappeared completely"
        ],
        "a": 1,
        "fb": "Calming music lowered post-surgery cortisol and inflammation markers compared with patients in silence."
       },
       {
        "q": "Which tempo best matches a resting heart and breathing rate, helping the body relax?",
        "o": [
         "About 60 beats per minute",
         "About 140 beats per minute",
         "About 200 beats per minute",
         "Tempo doesn't matter"
        ],
        "a": 0,
        "fb": "Slow music near 60 BPM nudges heart rate variability up and switches the nervous system into rest mode."
       },
       {
        "q": "What is \"brainwave entrainment\"?",
        "o": [
         "Training your memory with flashcards",
         "The brain gradually syncing its rhythm to a steady sound",
         "A type of headphone",
         "Sleeping with music on"
        ],
        "a": 1,
        "fb": "Steady rhythms invite the brain to match them, which is how certain sounds help you relax or focus."
       },
       {
        "q": "Which nerve does slow, steady music help activate to calm the body?",
        "o": [
         "The vagus nerve",
         "The optic nerve",
         "The sciatic nerve",
         "The funny bone"
        ],
        "a": 0,
        "fb": "The vagus nerve runs the rest-and-digest system, which is good for stress and for your gut."
       },
       {
        "q": "When does the brain release dopamine while listening to music?",
        "o": [
         "Only when the music stops",
         "As it anticipates and reaches the musical \"payoff\" or resolution",
         "Never",
         "Only with loud music"
        ],
        "a": 1,
        "fb": "The build-up and release in music rewards the brain with dopamine, which is why a favourite song feels so good."
       }
      ]
     }
    ]
   },
   {
    "id": "s4",
    "step": 6,
    "title": "Cardio & weights",
    "sub": "Move to heal",
    "img": "4-cardio",
    "lessons": [
     {
      "id": "exercise",
      "title": "Exercise",
      "mins": 10,
      "text": "Walking, cardio and simple strength work that wake up your metabolism without draining you, with how to progress week by week.",
      "quiz": [
       {
        "q": "How many minutes of moderate exercise a week does the big Lancet study link to a longer life?",
        "o": [
         "15 minutes",
         "150 minutes",
         "1,500 minutes",
         "Any amount over 10 hours"
        ],
        "a": 1,
        "fb": "150 minutes is about 30 minutes, 5 days a week, and it's linked to big drops in heart disease and diabetes risk."
       },
       {
        "q": "Which type of exercise builds muscle and raises the calories you burn at rest?",
        "o": [
         "Stretching only",
         "Strength (resistance) training",
         "Walking slowly",
         "Sitting upright"
        ],
        "a": 1,
        "fb": "Muscle is your metabolic engine. Every pound added burns a few more calories a day, even while resting."
       },
       {
        "q": "What is the \"afterburn\" (EPOC) effect?",
        "o": [
         "Sore muscles the next day",
         "A raised metabolism for hours after a hard workout",
         "Sunburn from outdoor exercise",
         "Heartburn after eating"
        ],
        "a": 1,
        "fb": "After intense sessions like HIIT, your body keeps burning extra energy for up to about 24 hours while it recovers."
       },
       {
        "q": "Which fat does exercise tend to target first, the most harmful kind around the organs?",
        "o": [
         "Visceral fat",
         "Fat under the skin on your arms",
         "Fat in your feet",
         "Brown fat"
        ],
        "a": 0,
        "fb": "Visceral fat drives inflammation and insulin resistance, and exercise can shrink it even before the scale moves much."
       },
       {
        "q": "How does exercise lower blood sugar without needing insulin?",
        "o": [
         "It makes you sweat out sugar",
         "Working muscles pull sugar in through GLUT4 transporters",
         "It stops the liver from working",
         "It doesn't lower blood sugar"
        ],
        "a": 1,
        "fb": "During and after exercise, muscles open their own doors (GLUT4) to absorb sugar from the blood."
       }
      ]
     },
     {
      "id": "massage",
      "title": "Massage therapy",
      "mins": 6,
      "text": "Hands-on recovery for muscles and the nervous system, including simple self-massage you can do at home.",
      "quiz": [
       {
        "q": "What happens to cortisol, the stress hormone, after a massage?",
        "o": [
         "It rises",
         "It drops",
         "It stays the same",
         "It turns into sugar"
        ],
        "a": 1,
        "fb": "Across 38 studies, cortisol fell after massage. It was measured in saliva and urine, not just how people felt."
       },
       {
        "q": "Which two \"feel-good\" chemicals rose after massage in those studies?",
        "o": [
         "Serotonin and dopamine",
         "Insulin and glucagon",
         "Adrenaline and histamine",
         "Caffeine and nicotine"
        ],
        "a": 0,
        "fb": "Serotonin steadies mood and dopamine drives motivation. Massage nudges both up naturally."
       },
       {
        "q": "Where is more than 90% of the body's serotonin made?",
        "o": [
         "In the brain",
         "In the gut",
         "In the lungs",
         "In the skin"
        ],
        "a": 1,
        "fb": "Your gut makes most of your serotonin, one reason gut health and mood are so closely linked."
       },
       {
        "q": "Which hormone, released by touch, builds trust and calms the stress response?",
        "o": [
         "Oxytocin",
         "Cortisol",
         "Testosterone",
         "Thyroxine"
        ],
        "a": 0,
        "fb": "Oxytocin is the connection hormone. Caring touch is one of the strongest ways to release it."
       },
       {
        "q": "About how long were the sessions that consistently produced measurable hormone changes?",
        "o": [
         "5 minutes",
         "About 45 minutes",
         "4 hours",
         "Only overnight"
        ],
        "a": 1,
        "fb": "Around 45 minutes gave the clearest results, though shorter sessions still helped."
       }
      ]
     }
    ]
   },
   {
    "id": "s3",
    "step": 7,
    "title": "High-protein diet",
    "sub": "Feed repair",
    "img": "3-high-protein",
    "lessons": [
     {
      "id": "keto",
      "title": "The High Protein Meal Plan",
      "mins": 12,
      "text": "How protein-first meals keep you full, protect muscle while you lose fat, and give your gut lining the building blocks to repair, and how to build a high-protein plate after your cleanse.",
      "quiz": [
       {
        "q": "Which nutrient keeps you full the longest per calorie?",
        "o": [
         "Protein",
         "Sugar",
         "Fat",
         "Alcohol"
        ],
        "a": 0,
        "fb": "Protein is the most filling nutrient. It calms hunger hormones, so you naturally eat less without fighting cravings."
       },
       {
        "q": "Roughly how much protein per kilogram of body weight is a good daily target when healing and losing weight?",
        "o": [
         "0.3 g",
         "About 1.2–1.6 g",
         "5 g",
         "No target needed"
        ],
        "a": 1,
        "fb": "Around 1.2–1.6 g per kg a day protects muscle while you lose fat and gives your body the building blocks to repair."
       },
       {
        "q": "About how much protein per meal helps your muscles rebuild best?",
        "o": [
         "5 g",
         "About 25–40 g",
         "100 g",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "Spreading 25–40 g of protein across each meal switches on muscle repair several times a day."
       },
       {
        "q": "Why does protein help when you're losing weight?",
        "o": [
         "It protects muscle so the weight you lose is fat",
         "It adds water weight",
         "It stops digestion",
         "It replaces sleep"
        ],
        "a": 0,
        "fb": "Without enough protein the body breaks down muscle. High protein keeps muscle, so the scale drop is real fat loss."
       },
       {
        "q": "Roughly how much of protein's calories does your body burn just digesting it?",
        "o": [
         "About 20–30%",
         "1%",
         "Over 80%",
         "None"
        ],
        "a": 0,
        "fb": "Protein has the highest 'thermic effect': about a quarter of its calories are used just to digest it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 6,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days."
     }
    ]
   }
  ]
 },
 "sugar": {
  "product": "sugar",
  "title": "The Diabetes Protocol",
  "sections": [
   {
    "id": "start",
    "title": "Start here",
    "sub": "Welcome & your app",
    "img": "0-intro",
    "lessons": [
     {
      "id": "welcome",
      "title": "Welcome to the Diabetes Protocol",
      "mins": 5,
      "text": "How the protocol works for your blood sugar, what to expect each day, and how the course, the ebooks and your app fit together. Watch this first, then set up your app."
     },
     {
      "id": "app",
      "title": "Set up your healing app",
      "mins": 5,
      "app": true,
      "text": "Your app turns your symptoms and test results (like HbA1c and fasting glucose) into a day-by-day plan. Fill in the short intake, choose your cleanse level and pick a start date."
     }
    ]
   },
   {
    "id": "s1",
    "step": 1,
    "title": "Fasting & cleanse",
    "sub": "Rest digestion",
    "img": "1-fasting",
    "lessons": [
     {
      "id": "fasting",
      "title": "Fasting & your blood sugar",
      "mins": 12,
      "text": "Why short, guided fasts help insulin come down and blood sugar settle, the three cleanse levels, and how to fast safely. If you take insulin or blood-sugar medication, talk to your doctor before you fast.",
      "quiz": [
       {
        "q": "What is autophagy?",
        "o": [
         "A type of juice cleanse",
         "The body's built-in cellular recycling and clean-up process",
         "A hormone that makes you hungry",
         "A form of exercise"
        ],
        "a": 1,
        "fb": "Autophagy means \"self-eating\": your cells break down and recycle damaged parts. Fasting is one of its strongest triggers."
       },
       {
        "q": "Roughly when does autophagy start to switch on during a fast?",
        "o": [
         "After 1–2 hours",
         "After 12–16 hours",
         "After 5 days",
         "Only during sleep"
        ],
        "a": 1,
        "fb": "Around 12–16 hours in, stored sugar runs low and insulin drops, so the clean-up process begins. It builds from there."
       },
       {
        "q": "Which fasting style is described as the best entry point for beginners?",
        "o": [
         "A 7-day water fast",
         "Juice fasting",
         "One meal a day",
         "A dry fast"
        ],
        "a": 1,
        "fb": "Juice fasting gives your gut a rest while still providing vitamins and plant nutrients, which makes it gentler to start with."
       },
       {
        "q": "The Fasting Mimicking Diet (FMD) was developed by which researcher?",
        "o": [
         "Dr. Valter Longo",
         "Dr. Otto Warburg",
         "Dr. James Pennebaker",
         "Dr. Roger Ulrich"
        ],
        "a": 0,
        "fb": "Dr. Longo's team at USC designed FMD: five low-calorie, plant-based days that give many of fasting's benefits while still eating a little."
       },
       {
        "q": "In 16:8 intermittent fasting, what do the numbers mean?",
        "o": [
         "16 meals and 8 snacks a week",
         "16 hours fasting and an 8-hour eating window",
         "16 days fasting and 8 days eating",
         "16 glasses of water and 8 hours of sleep"
        ],
        "a": 1,
        "fb": "16:8 is the most studied daily schedule: you eat within an 8-hour window and fast for the other 16 hours."
       }
      ]
     }
    ]
   },
   {
    "id": "s2",
    "step": 2,
    "title": "Meditation & journaling",
    "sub": "Calm the nervous system",
    "img": "2-meditation",
    "lessons": [
     {
      "id": "meditation",
      "title": "Meditation",
      "mins": 10,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "In the Harvard brain-scan studies, how long did an MBSR meditation course take to show measurable brain changes?",
        "o": [
         "1 day",
         "8 weeks",
         "2 years",
         "10 years"
        ],
        "a": 1,
        "fb": "About 8 weeks of regular practice was enough to see changes on MRI scans, so a steady habit adds up quickly."
       },
       {
        "q": "Which part of the brain, the \"alarm system\" for fear and stress, became less dense after the meditation course?",
        "o": [
         "The amygdala",
         "The spinal cord",
         "The cerebellum",
         "The optic nerve"
        ],
        "a": 0,
        "fb": "The amygdala drives stress reactions. As it quietens, people report less stress and anxiety."
       },
       {
        "q": "Which brainwave state is described as \"relaxed alertness\", common in experienced meditators?",
        "o": [
         "Beta",
         "Alpha",
         "Gamma",
         "Delta"
        ],
        "a": 1,
        "fb": "Alpha is the calm, focused state. Meditation helps shift a stressed, high-beta brain toward it."
       },
       {
        "q": "What does BDNF, which rises with regular meditation, help the brain do?",
        "o": [
         "Store fat",
         "Grow new neurons and strengthen connections",
         "Produce stomach acid",
         "Raise cortisol"
        ],
        "a": 1,
        "fb": "BDNF is like fertiliser for brain cells. It supports learning, memory and mood."
       },
       {
        "q": "What does meditation do to cortisol, the main stress hormone?",
        "o": [
         "Raises it",
         "Lowers it",
         "Has no effect",
         "Turns it into insulin"
        ],
        "a": 1,
        "fb": "Regular practice lowers cortisol, which calms inflammation and helps break the stress and pain cycle."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 8,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "How long was each writing session in Pennebaker's expressive writing studies?",
        "o": [
         "2 minutes",
         "About 15 minutes a day",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Just 15 minutes a day for 4 days was enough to see real health benefits. It's a small, doable habit."
       },
       {
        "q": "In his original study, what happened to students who wrote about difficult experiences?",
        "o": [
         "They visited the health centre about half as often",
         "They got sick more often",
         "Nothing changed",
         "They stopped sleeping"
        ],
        "a": 0,
        "fb": "Putting hard feelings into words seems to take a load off the body as well as the mind."
       },
       {
        "q": "Which stress hormone tends to be lower on days people journal?",
        "o": [
         "Insulin",
         "Cortisol",
         "Melatonin",
         "Oxytocin"
        ],
        "a": 1,
        "fb": "Writing helps the brain \"close the loop\" on worries, so the stress system settles and cortisol drops."
       },
       {
        "q": "Which type of bedtime writing helped people fall asleep fastest?",
        "o": [
         "Writing a to-do list for tomorrow",
         "Writing about what went wrong today",
         "Copying out a book",
         "Writing nothing at all"
        ],
        "a": 0,
        "fb": "Getting tomorrow's tasks onto paper offloads them from your mind, so you fall asleep faster."
       },
       {
        "q": "What does gratitude journaling help with, according to the review of 64 trials?",
        "o": [
         "Only handwriting",
         "Lower anxiety and better mood and sleep",
         "Weight gain",
         "Nothing measurable"
        ],
        "a": 1,
        "fb": "Writing down a few things you're grateful for each night is linked to calmer moods and better sleep."
       }
      ]
     }
    ]
   },
   {
    "id": "s7",
    "step": 3,
    "title": "Nature & sun",
    "sub": "Reset outdoors",
    "img": "7-nature",
    "lessons": [
     {
      "id": "sunlight",
      "title": "Sunlight",
      "mins": 8,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the hospital studies, what happened to patients in sunnier rooms?",
        "o": [
         "They stayed longer",
         "They recovered faster and used less pain medication",
         "Nothing changed",
         "They slept less"
        ],
        "a": 1,
        "fb": "Brighter rooms were linked to quicker recovery, earlier discharge and less need for pain relief."
       },
       {
        "q": "Which vitamin does your skin make from sunlight?",
        "o": [
         "Vitamin C",
         "Vitamin D",
         "Vitamin B12",
         "Vitamin K"
        ],
        "a": 1,
        "fb": "UVB light on your skin starts vitamin D production, which supports immunity, bones and mood."
       },
       {
        "q": "Why is morning sunlight especially helpful?",
        "o": [
         "It's warmer",
         "It resets your body clock, which improves sleep that night",
         "It has no UV",
         "It boosts caffeine"
        ],
        "a": 1,
        "fb": "Morning light sets your circadian rhythm, so melatonin is released on time in the evening."
       },
       {
        "q": "Which mood chemical does sunlight help your brain make?",
        "o": [
         "Serotonin",
         "Adrenaline",
         "Cortisol",
         "Histamine"
        ],
        "a": 0,
        "fb": "Serotonin lifts mood and dampens pain signals, one reason sunny days feel better."
       },
       {
        "q": "What happens to blood pressure after about 20 minutes of sun, according to the Edinburgh research?",
        "o": [
         "It goes up sharply",
         "It drops slightly as nitric oxide widens blood vessels",
         "It stays exactly the same",
         "It becomes irregular"
        ],
        "a": 1,
        "fb": "UVA light releases nitric oxide from the skin, relaxing blood vessels. Enjoy the sun, but never burn."
       }
      ]
     },
     {
      "id": "redlight",
      "title": "Red light therapy",
      "mins": 6,
      "text": "What red and near-infrared light do for your cells, and how to use a panel at home.",
      "quiz": [
       {
        "q": "What is the scientific name for red light therapy?",
        "o": [
         "Photobiomodulation",
         "Phototropism",
         "Photosynthesis",
         "Ultraviolet therapy"
        ],
        "a": 0,
        "fb": "Photobiomodulation means using light to change how cells behave. Red light therapy is the everyday name."
       },
       {
        "q": "Which wavelengths does red light therapy use?",
        "o": [
         "Ultraviolet (below 400 nm)",
         "Red (630–700 nm) and near-infrared (800–1100 nm)",
         "Blue (450 nm) only",
         "X-rays"
        ],
        "a": 1,
        "fb": "Red and near-infrared light are the healing window. Unlike UV, they don't burn the skin."
       },
       {
        "q": "Which part of the cell absorbs red light and makes more energy?",
        "o": [
         "The nucleus",
         "The mitochondria",
         "The cell wall",
         "The ribosomes"
        ],
        "a": 1,
        "fb": "Your mitochondria are the cell's power plants. Red light helps them produce more ATP, the cell's energy."
       },
       {
        "q": "Which goes deeper into the body?",
        "o": [
         "Red light",
         "Near-infrared light",
         "They reach the same depth",
         "Neither passes the skin"
        ],
        "a": 1,
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimetres, reaching muscles and joints."
       },
       {
        "q": "What does the release of nitric oxide during red light therapy do?",
        "o": [
         "Tightens blood vessels",
         "Widens blood vessels and improves circulation",
         "Raises blood sugar",
         "Causes sunburn"
        ],
        "a": 1,
        "fb": "Nitric oxide relaxes blood vessels, so more blood and oxygen reach the tissue being treated."
       }
      ]
     },
     {
      "id": "forest",
      "title": "Forest bathing",
      "mins": 6,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week."
     }
    ]
   },
   {
    "id": "s6",
    "step": 4,
    "title": "Sleep & clean air",
    "sub": "Repair at night",
    "img": "6-sleep",
    "lessons": [
     {
      "id": "sleep",
      "title": "Sleep",
      "mins": 10,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "What is the ideal bedroom temperature for deep sleep, according to sleep lab studies?",
        "o": [
         "55–58°F",
         "65–68°F",
         "75–78°F",
         "Above 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature needs to drop to fall asleep. A cool room speeds that up and deepens sleep."
       },
       {
        "q": "About how long is the half-life of caffeine in most adults?",
        "o": [
         "30 minutes",
         "About 6 hours",
         "24 hours",
         "A week"
        ],
        "a": 1,
        "fb": "Half of a 2 pm coffee is still active at 8 pm, which is why an early caffeine cut-off helps sleep."
       },
       {
        "q": "How long before bed should you avoid screens and bright blue light?",
        "o": [
         "5 minutes",
         "About 1 hour",
         "It doesn't matter",
         "12 hours"
        ],
        "a": 1,
        "fb": "Blue light tells your brain it's daytime and holds back melatonin. Warm, dim light in the last hour helps."
       },
       {
        "q": "Why are blackout curtains recommended?",
        "o": [
         "They keep the room warm",
         "Even a little light can cut melatonin, and darkness lets it rise fully",
         "They block noise",
         "They look better"
        ],
        "a": 1,
        "fb": "Light through closed eyelids can still suppress melatonin, so total darkness protects deep sleep."
       },
       {
        "q": "Why does the ebook suggest keeping your phone out of the bedroom?",
        "o": [
         "Its blue light and stimulating content keep your brain alert",
         "It uses too much electricity",
         "It makes the room hot",
         "It has no effect on sleep"
        ],
        "a": 0,
        "fb": "Screens suppress melatonin and scrolling raises stress hormones. A phone-free bedroom helps your brain link bed with sleep."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 6,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "According to the EPA, how does indoor air usually compare with outdoor air?",
        "o": [
         "It is cleaner",
         "It is 2–5 times more polluted",
         "It is exactly the same",
         "It has no pollutants"
        ],
        "a": 1,
        "fb": "Indoor air traps pollutants from furniture, cleaning products and cooking, and we spend about 90% of our time inside."
       },
       {
        "q": "Radon is dangerous partly because it is…",
        "o": [
         "Bright red and smelly",
         "Colourless and odourless, so you need a monitor to detect it",
         "Only found in big cities",
         "Harmless in small amounts"
        ],
        "a": 1,
        "fb": "Radon seeps up from the ground through foundations. A simple test kit or monitor is the only way to know your level."
       },
       {
        "q": "What are VOCs?",
        "o": [
         "Vitamins in vegetables",
         "Chemicals that evaporate from things like paint, new furniture and air fresheners",
         "A type of mould",
         "Oxygen molecules"
        ],
        "a": 1,
        "fb": "Volatile organic compounds drift into the air from everyday products. Fresh air and fewer scented products help."
       },
       {
        "q": "What does mould need to grow indoors?",
        "o": [
         "Sunlight",
         "Moisture",
         "Cold air",
         "Electricity"
        ],
        "a": 1,
        "fb": "Leaks, damp bathrooms and water damage let mould grow. Fixing moisture is the first step."
       },
       {
        "q": "What is the target carbon dioxide level for good thinking and sleep?",
        "o": [
         "Below 800 ppm",
         "Around 2,500 ppm",
         "Over 4,000 ppm",
         "It doesn't matter"
        ],
        "a": 0,
        "fb": "A closed bedroom can climb past 2,000 ppm overnight. Opening a window or running ventilation keeps CO2 low."
       }
      ]
     }
    ]
   },
   {
    "id": "s5",
    "step": 5,
    "title": "Music & spirituality",
    "sub": "Sound as medicine",
    "img": "5-music",
    "lessons": [
     {
      "id": "music",
      "title": "Music therapy",
      "mins": 8,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What happened to cortisol after surgery when patients listened to calming music?",
        "o": [
         "It rose",
         "It dropped compared with silence",
         "Nothing changed",
         "It disappeared completely"
        ],
        "a": 1,
        "fb": "Calming music lowered post-surgery cortisol and inflammation markers compared with patients in silence."
       },
       {
        "q": "Which tempo best matches a resting heart and breathing rate, helping the body relax?",
        "o": [
         "About 60 beats per minute",
         "About 140 beats per minute",
         "About 200 beats per minute",
         "Tempo doesn't matter"
        ],
        "a": 0,
        "fb": "Slow music near 60 BPM nudges heart rate variability up and switches the nervous system into rest mode."
       },
       {
        "q": "What is \"brainwave entrainment\"?",
        "o": [
         "Training your memory with flashcards",
         "The brain gradually syncing its rhythm to a steady sound",
         "A type of headphone",
         "Sleeping with music on"
        ],
        "a": 1,
        "fb": "Steady rhythms invite the brain to match them, which is how certain sounds help you relax or focus."
       },
       {
        "q": "Which nerve does slow, steady music help activate to calm the body?",
        "o": [
         "The vagus nerve",
         "The optic nerve",
         "The sciatic nerve",
         "The funny bone"
        ],
        "a": 0,
        "fb": "The vagus nerve runs the rest-and-digest system, which is good for stress and for your gut."
       },
       {
        "q": "When does the brain release dopamine while listening to music?",
        "o": [
         "Only when the music stops",
         "As it anticipates and reaches the musical \"payoff\" or resolution",
         "Never",
         "Only with loud music"
        ],
        "a": 1,
        "fb": "The build-up and release in music rewards the brain with dopamine, which is why a favourite song feels so good."
       }
      ]
     }
    ]
   },
   {
    "id": "s4",
    "step": 6,
    "title": "Cardio & weights",
    "sub": "Move to heal",
    "img": "4-cardio",
    "lessons": [
     {
      "id": "exercise",
      "title": "Exercise",
      "mins": 10,
      "text": "Working muscles soak up glucose. Walking after meals, cardio and simple strength work that steady your blood sugar, with how to progress week by week.",
      "quiz": [
       {
        "q": "How many minutes of moderate exercise a week does the big Lancet study link to a longer life?",
        "o": [
         "15 minutes",
         "150 minutes",
         "1,500 minutes",
         "Any amount over 10 hours"
        ],
        "a": 1,
        "fb": "150 minutes is about 30 minutes, 5 days a week, and it's linked to big drops in heart disease and diabetes risk."
       },
       {
        "q": "Which type of exercise builds muscle and raises the calories you burn at rest?",
        "o": [
         "Stretching only",
         "Strength (resistance) training",
         "Walking slowly",
         "Sitting upright"
        ],
        "a": 1,
        "fb": "Muscle is your metabolic engine. Every pound added burns a few more calories a day, even while resting."
       },
       {
        "q": "What is the \"afterburn\" (EPOC) effect?",
        "o": [
         "Sore muscles the next day",
         "A raised metabolism for hours after a hard workout",
         "Sunburn from outdoor exercise",
         "Heartburn after eating"
        ],
        "a": 1,
        "fb": "After intense sessions like HIIT, your body keeps burning extra energy for up to about 24 hours while it recovers."
       },
       {
        "q": "Which fat does exercise tend to target first, the most harmful kind around the organs?",
        "o": [
         "Visceral fat",
         "Fat under the skin on your arms",
         "Fat in your feet",
         "Brown fat"
        ],
        "a": 0,
        "fb": "Visceral fat drives inflammation and insulin resistance, and exercise can shrink it even before the scale moves much."
       },
       {
        "q": "How does exercise lower blood sugar without needing insulin?",
        "o": [
         "It makes you sweat out sugar",
         "Working muscles pull sugar in through GLUT4 transporters",
         "It stops the liver from working",
         "It doesn't lower blood sugar"
        ],
        "a": 1,
        "fb": "During and after exercise, muscles open their own doors (GLUT4) to absorb sugar from the blood."
       }
      ]
     },
     {
      "id": "massage",
      "title": "Massage therapy",
      "mins": 6,
      "text": "Hands-on recovery for muscles and the nervous system, including simple self-massage you can do at home.",
      "quiz": [
       {
        "q": "What happens to cortisol, the stress hormone, after a massage?",
        "o": [
         "It rises",
         "It drops",
         "It stays the same",
         "It turns into sugar"
        ],
        "a": 1,
        "fb": "Across 38 studies, cortisol fell after massage. It was measured in saliva and urine, not just how people felt."
       },
       {
        "q": "Which two \"feel-good\" chemicals rose after massage in those studies?",
        "o": [
         "Serotonin and dopamine",
         "Insulin and glucagon",
         "Adrenaline and histamine",
         "Caffeine and nicotine"
        ],
        "a": 0,
        "fb": "Serotonin steadies mood and dopamine drives motivation. Massage nudges both up naturally."
       },
       {
        "q": "Where is more than 90% of the body's serotonin made?",
        "o": [
         "In the brain",
         "In the gut",
         "In the lungs",
         "In the skin"
        ],
        "a": 1,
        "fb": "Your gut makes most of your serotonin, one reason gut health and mood are so closely linked."
       },
       {
        "q": "Which hormone, released by touch, builds trust and calms the stress response?",
        "o": [
         "Oxytocin",
         "Cortisol",
         "Testosterone",
         "Thyroxine"
        ],
        "a": 0,
        "fb": "Oxytocin is the connection hormone. Caring touch is one of the strongest ways to release it."
       },
       {
        "q": "About how long were the sessions that consistently produced measurable hormone changes?",
        "o": [
         "5 minutes",
         "About 45 minutes",
         "4 hours",
         "Only overnight"
        ],
        "a": 1,
        "fb": "Around 45 minutes gave the clearest results, though shorter sessions still helped."
       }
      ]
     }
    ]
   },
   {
    "id": "s3",
    "step": 7,
    "title": "High-protein diet",
    "sub": "Feed repair",
    "img": "3-high-protein",
    "lessons": [
     {
      "id": "keto",
      "title": "High protein for steady glucose",
      "mins": 12,
      "text": "How protein-first meals blunt blood sugar spikes, keep you full for hours and protect muscle, and how to build a high-protein plate that keeps your energy steady all day.",
      "quiz": [
       {
        "q": "Which nutrient keeps you full the longest per calorie?",
        "o": [
         "Protein",
         "Sugar",
         "Fat",
         "Alcohol"
        ],
        "a": 0,
        "fb": "Protein is the most filling nutrient. It calms hunger hormones, so you naturally eat less without fighting cravings."
       },
       {
        "q": "Roughly how much protein per kilogram of body weight is a good daily target when healing and losing weight?",
        "o": [
         "0.3 g",
         "About 1.2–1.6 g",
         "5 g",
         "No target needed"
        ],
        "a": 1,
        "fb": "Around 1.2–1.6 g per kg a day protects muscle while you lose fat and gives your body the building blocks to repair."
       },
       {
        "q": "About how much protein per meal helps your muscles rebuild best?",
        "o": [
         "5 g",
         "About 25–40 g",
         "100 g",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "Spreading 25–40 g of protein across each meal switches on muscle repair several times a day."
       },
       {
        "q": "Why does protein help when you're losing weight?",
        "o": [
         "It protects muscle so the weight you lose is fat",
         "It adds water weight",
         "It stops digestion",
         "It replaces sleep"
        ],
        "a": 0,
        "fb": "Without enough protein the body breaks down muscle. High protein keeps muscle, so the scale drop is real fat loss."
       },
       {
        "q": "Roughly how much of protein's calories does your body burn just digesting it?",
        "o": [
         "About 20–30%",
         "1%",
         "Over 80%",
         "None"
        ],
        "a": 0,
        "fb": "Protein has the highest 'thermic effect': about a quarter of its calories are used just to digest it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 6,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days."
     }
    ]
   }
  ]
 },
 "glp1": {
  "product": "glp1",
  "title": "The GLP-1 Weight Loss Protocol",
  "sections": [
   {
    "id": "start",
    "title": "Start here",
    "sub": "Welcome & your app",
    "img": "0-intro",
    "lessons": [
     {
      "id": "welcome",
      "title": "Welcome to the GLP-1 Weight Loss Protocol",
      "mins": 5,
      "text": "How to lose fat on a GLP-1 while protecting your muscle, what to expect each week, and how the course, the ebooks and your app fit together. Watch this first, then set up your app."
     },
     {
      "id": "app",
      "title": "Set up your healing app",
      "mins": 5,
      "app": true,
      "text": "Your app builds your plan around your weight, goals and symptoms: protein targets, a gentle cleanse level and your daily tracker. Fill in the short intake and pick a start date."
     }
    ]
   },
   {
    "id": "s1",
    "step": 1,
    "title": "Fasting & cleanse",
    "sub": "Rest digestion",
    "img": "1-fasting",
    "lessons": [
     {
      "id": "fasting",
      "title": "Fasting & cleansing on a GLP-1",
      "mins": 12,
      "text": "A gentle way to use fasting and cleansing alongside a GLP-1, why protein and electrolytes matter more than ever, and when to keep it light. Check with your prescriber before changing how you eat.",
      "quiz": [
       {
        "q": "What is autophagy?",
        "o": [
         "A type of juice cleanse",
         "The body's built-in cellular recycling and clean-up process",
         "A hormone that makes you hungry",
         "A form of exercise"
        ],
        "a": 1,
        "fb": "Autophagy means \"self-eating\": your cells break down and recycle damaged parts. Fasting is one of its strongest triggers."
       },
       {
        "q": "Roughly when does autophagy start to switch on during a fast?",
        "o": [
         "After 1–2 hours",
         "After 12–16 hours",
         "After 5 days",
         "Only during sleep"
        ],
        "a": 1,
        "fb": "Around 12–16 hours in, stored sugar runs low and insulin drops, so the clean-up process begins. It builds from there."
       },
       {
        "q": "Which fasting style is described as the best entry point for beginners?",
        "o": [
         "A 7-day water fast",
         "Juice fasting",
         "One meal a day",
         "A dry fast"
        ],
        "a": 1,
        "fb": "Juice fasting gives your gut a rest while still providing vitamins and plant nutrients, which makes it gentler to start with."
       },
       {
        "q": "The Fasting Mimicking Diet (FMD) was developed by which researcher?",
        "o": [
         "Dr. Valter Longo",
         "Dr. Otto Warburg",
         "Dr. James Pennebaker",
         "Dr. Roger Ulrich"
        ],
        "a": 0,
        "fb": "Dr. Longo's team at USC designed FMD: five low-calorie, plant-based days that give many of fasting's benefits while still eating a little."
       },
       {
        "q": "In 16:8 intermittent fasting, what do the numbers mean?",
        "o": [
         "16 meals and 8 snacks a week",
         "16 hours fasting and an 8-hour eating window",
         "16 days fasting and 8 days eating",
         "16 glasses of water and 8 hours of sleep"
        ],
        "a": 1,
        "fb": "16:8 is the most studied daily schedule: you eat within an 8-hour window and fast for the other 16 hours."
       }
      ]
     }
    ]
   },
   {
    "id": "s2",
    "step": 2,
    "title": "Meditation & journaling",
    "sub": "Calm the nervous system",
    "img": "2-meditation",
    "lessons": [
     {
      "id": "meditation",
      "title": "Meditation",
      "mins": 10,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "In the Harvard brain-scan studies, how long did an MBSR meditation course take to show measurable brain changes?",
        "o": [
         "1 day",
         "8 weeks",
         "2 years",
         "10 years"
        ],
        "a": 1,
        "fb": "About 8 weeks of regular practice was enough to see changes on MRI scans, so a steady habit adds up quickly."
       },
       {
        "q": "Which part of the brain, the \"alarm system\" for fear and stress, became less dense after the meditation course?",
        "o": [
         "The amygdala",
         "The spinal cord",
         "The cerebellum",
         "The optic nerve"
        ],
        "a": 0,
        "fb": "The amygdala drives stress reactions. As it quietens, people report less stress and anxiety."
       },
       {
        "q": "Which brainwave state is described as \"relaxed alertness\", common in experienced meditators?",
        "o": [
         "Beta",
         "Alpha",
         "Gamma",
         "Delta"
        ],
        "a": 1,
        "fb": "Alpha is the calm, focused state. Meditation helps shift a stressed, high-beta brain toward it."
       },
       {
        "q": "What does BDNF, which rises with regular meditation, help the brain do?",
        "o": [
         "Store fat",
         "Grow new neurons and strengthen connections",
         "Produce stomach acid",
         "Raise cortisol"
        ],
        "a": 1,
        "fb": "BDNF is like fertiliser for brain cells. It supports learning, memory and mood."
       },
       {
        "q": "What does meditation do to cortisol, the main stress hormone?",
        "o": [
         "Raises it",
         "Lowers it",
         "Has no effect",
         "Turns it into insulin"
        ],
        "a": 1,
        "fb": "Regular practice lowers cortisol, which calms inflammation and helps break the stress and pain cycle."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 8,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "How long was each writing session in Pennebaker's expressive writing studies?",
        "o": [
         "2 minutes",
         "About 15 minutes a day",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Just 15 minutes a day for 4 days was enough to see real health benefits. It's a small, doable habit."
       },
       {
        "q": "In his original study, what happened to students who wrote about difficult experiences?",
        "o": [
         "They visited the health centre about half as often",
         "They got sick more often",
         "Nothing changed",
         "They stopped sleeping"
        ],
        "a": 0,
        "fb": "Putting hard feelings into words seems to take a load off the body as well as the mind."
       },
       {
        "q": "Which stress hormone tends to be lower on days people journal?",
        "o": [
         "Insulin",
         "Cortisol",
         "Melatonin",
         "Oxytocin"
        ],
        "a": 1,
        "fb": "Writing helps the brain \"close the loop\" on worries, so the stress system settles and cortisol drops."
       },
       {
        "q": "Which type of bedtime writing helped people fall asleep fastest?",
        "o": [
         "Writing a to-do list for tomorrow",
         "Writing about what went wrong today",
         "Copying out a book",
         "Writing nothing at all"
        ],
        "a": 0,
        "fb": "Getting tomorrow's tasks onto paper offloads them from your mind, so you fall asleep faster."
       },
       {
        "q": "What does gratitude journaling help with, according to the review of 64 trials?",
        "o": [
         "Only handwriting",
         "Lower anxiety and better mood and sleep",
         "Weight gain",
         "Nothing measurable"
        ],
        "a": 1,
        "fb": "Writing down a few things you're grateful for each night is linked to calmer moods and better sleep."
       }
      ]
     }
    ]
   },
   {
    "id": "s7",
    "step": 3,
    "title": "Nature & sun",
    "sub": "Reset outdoors",
    "img": "7-nature",
    "lessons": [
     {
      "id": "sunlight",
      "title": "Sunlight",
      "mins": 8,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the hospital studies, what happened to patients in sunnier rooms?",
        "o": [
         "They stayed longer",
         "They recovered faster and used less pain medication",
         "Nothing changed",
         "They slept less"
        ],
        "a": 1,
        "fb": "Brighter rooms were linked to quicker recovery, earlier discharge and less need for pain relief."
       },
       {
        "q": "Which vitamin does your skin make from sunlight?",
        "o": [
         "Vitamin C",
         "Vitamin D",
         "Vitamin B12",
         "Vitamin K"
        ],
        "a": 1,
        "fb": "UVB light on your skin starts vitamin D production, which supports immunity, bones and mood."
       },
       {
        "q": "Why is morning sunlight especially helpful?",
        "o": [
         "It's warmer",
         "It resets your body clock, which improves sleep that night",
         "It has no UV",
         "It boosts caffeine"
        ],
        "a": 1,
        "fb": "Morning light sets your circadian rhythm, so melatonin is released on time in the evening."
       },
       {
        "q": "Which mood chemical does sunlight help your brain make?",
        "o": [
         "Serotonin",
         "Adrenaline",
         "Cortisol",
         "Histamine"
        ],
        "a": 0,
        "fb": "Serotonin lifts mood and dampens pain signals, one reason sunny days feel better."
       },
       {
        "q": "What happens to blood pressure after about 20 minutes of sun, according to the Edinburgh research?",
        "o": [
         "It goes up sharply",
         "It drops slightly as nitric oxide widens blood vessels",
         "It stays exactly the same",
         "It becomes irregular"
        ],
        "a": 1,
        "fb": "UVA light releases nitric oxide from the skin, relaxing blood vessels. Enjoy the sun, but never burn."
       }
      ]
     },
     {
      "id": "redlight",
      "title": "Red light therapy",
      "mins": 6,
      "text": "What red and near-infrared light do for your cells, and how to use a panel at home.",
      "quiz": [
       {
        "q": "What is the scientific name for red light therapy?",
        "o": [
         "Photobiomodulation",
         "Phototropism",
         "Photosynthesis",
         "Ultraviolet therapy"
        ],
        "a": 0,
        "fb": "Photobiomodulation means using light to change how cells behave. Red light therapy is the everyday name."
       },
       {
        "q": "Which wavelengths does red light therapy use?",
        "o": [
         "Ultraviolet (below 400 nm)",
         "Red (630–700 nm) and near-infrared (800–1100 nm)",
         "Blue (450 nm) only",
         "X-rays"
        ],
        "a": 1,
        "fb": "Red and near-infrared light are the healing window. Unlike UV, they don't burn the skin."
       },
       {
        "q": "Which part of the cell absorbs red light and makes more energy?",
        "o": [
         "The nucleus",
         "The mitochondria",
         "The cell wall",
         "The ribosomes"
        ],
        "a": 1,
        "fb": "Your mitochondria are the cell's power plants. Red light helps them produce more ATP, the cell's energy."
       },
       {
        "q": "Which goes deeper into the body?",
        "o": [
         "Red light",
         "Near-infrared light",
         "They reach the same depth",
         "Neither passes the skin"
        ],
        "a": 1,
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimetres, reaching muscles and joints."
       },
       {
        "q": "What does the release of nitric oxide during red light therapy do?",
        "o": [
         "Tightens blood vessels",
         "Widens blood vessels and improves circulation",
         "Raises blood sugar",
         "Causes sunburn"
        ],
        "a": 1,
        "fb": "Nitric oxide relaxes blood vessels, so more blood and oxygen reach the tissue being treated."
       }
      ]
     },
     {
      "id": "forest",
      "title": "Forest bathing",
      "mins": 6,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week."
     }
    ]
   },
   {
    "id": "s6",
    "step": 4,
    "title": "Sleep & clean air",
    "sub": "Repair at night",
    "img": "6-sleep",
    "lessons": [
     {
      "id": "sleep",
      "title": "Sleep",
      "mins": 10,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "What is the ideal bedroom temperature for deep sleep, according to sleep lab studies?",
        "o": [
         "55–58°F",
         "65–68°F",
         "75–78°F",
         "Above 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature needs to drop to fall asleep. A cool room speeds that up and deepens sleep."
       },
       {
        "q": "About how long is the half-life of caffeine in most adults?",
        "o": [
         "30 minutes",
         "About 6 hours",
         "24 hours",
         "A week"
        ],
        "a": 1,
        "fb": "Half of a 2 pm coffee is still active at 8 pm, which is why an early caffeine cut-off helps sleep."
       },
       {
        "q": "How long before bed should you avoid screens and bright blue light?",
        "o": [
         "5 minutes",
         "About 1 hour",
         "It doesn't matter",
         "12 hours"
        ],
        "a": 1,
        "fb": "Blue light tells your brain it's daytime and holds back melatonin. Warm, dim light in the last hour helps."
       },
       {
        "q": "Why are blackout curtains recommended?",
        "o": [
         "They keep the room warm",
         "Even a little light can cut melatonin, and darkness lets it rise fully",
         "They block noise",
         "They look better"
        ],
        "a": 1,
        "fb": "Light through closed eyelids can still suppress melatonin, so total darkness protects deep sleep."
       },
       {
        "q": "Why does the ebook suggest keeping your phone out of the bedroom?",
        "o": [
         "Its blue light and stimulating content keep your brain alert",
         "It uses too much electricity",
         "It makes the room hot",
         "It has no effect on sleep"
        ],
        "a": 0,
        "fb": "Screens suppress melatonin and scrolling raises stress hormones. A phone-free bedroom helps your brain link bed with sleep."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 6,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "According to the EPA, how does indoor air usually compare with outdoor air?",
        "o": [
         "It is cleaner",
         "It is 2–5 times more polluted",
         "It is exactly the same",
         "It has no pollutants"
        ],
        "a": 1,
        "fb": "Indoor air traps pollutants from furniture, cleaning products and cooking, and we spend about 90% of our time inside."
       },
       {
        "q": "Radon is dangerous partly because it is…",
        "o": [
         "Bright red and smelly",
         "Colourless and odourless, so you need a monitor to detect it",
         "Only found in big cities",
         "Harmless in small amounts"
        ],
        "a": 1,
        "fb": "Radon seeps up from the ground through foundations. A simple test kit or monitor is the only way to know your level."
       },
       {
        "q": "What are VOCs?",
        "o": [
         "Vitamins in vegetables",
         "Chemicals that evaporate from things like paint, new furniture and air fresheners",
         "A type of mould",
         "Oxygen molecules"
        ],
        "a": 1,
        "fb": "Volatile organic compounds drift into the air from everyday products. Fresh air and fewer scented products help."
       },
       {
        "q": "What does mould need to grow indoors?",
        "o": [
         "Sunlight",
         "Moisture",
         "Cold air",
         "Electricity"
        ],
        "a": 1,
        "fb": "Leaks, damp bathrooms and water damage let mould grow. Fixing moisture is the first step."
       },
       {
        "q": "What is the target carbon dioxide level for good thinking and sleep?",
        "o": [
         "Below 800 ppm",
         "Around 2,500 ppm",
         "Over 4,000 ppm",
         "It doesn't matter"
        ],
        "a": 0,
        "fb": "A closed bedroom can climb past 2,000 ppm overnight. Opening a window or running ventilation keeps CO2 low."
       }
      ]
     }
    ]
   },
   {
    "id": "s5",
    "step": 5,
    "title": "Music & spirituality",
    "sub": "Sound as medicine",
    "img": "5-music",
    "lessons": [
     {
      "id": "music",
      "title": "Music therapy",
      "mins": 8,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What happened to cortisol after surgery when patients listened to calming music?",
        "o": [
         "It rose",
         "It dropped compared with silence",
         "Nothing changed",
         "It disappeared completely"
        ],
        "a": 1,
        "fb": "Calming music lowered post-surgery cortisol and inflammation markers compared with patients in silence."
       },
       {
        "q": "Which tempo best matches a resting heart and breathing rate, helping the body relax?",
        "o": [
         "About 60 beats per minute",
         "About 140 beats per minute",
         "About 200 beats per minute",
         "Tempo doesn't matter"
        ],
        "a": 0,
        "fb": "Slow music near 60 BPM nudges heart rate variability up and switches the nervous system into rest mode."
       },
       {
        "q": "What is \"brainwave entrainment\"?",
        "o": [
         "Training your memory with flashcards",
         "The brain gradually syncing its rhythm to a steady sound",
         "A type of headphone",
         "Sleeping with music on"
        ],
        "a": 1,
        "fb": "Steady rhythms invite the brain to match them, which is how certain sounds help you relax or focus."
       },
       {
        "q": "Which nerve does slow, steady music help activate to calm the body?",
        "o": [
         "The vagus nerve",
         "The optic nerve",
         "The sciatic nerve",
         "The funny bone"
        ],
        "a": 0,
        "fb": "The vagus nerve runs the rest-and-digest system, which is good for stress and for your gut."
       },
       {
        "q": "When does the brain release dopamine while listening to music?",
        "o": [
         "Only when the music stops",
         "As it anticipates and reaches the musical \"payoff\" or resolution",
         "Never",
         "Only with loud music"
        ],
        "a": 1,
        "fb": "The build-up and release in music rewards the brain with dopamine, which is why a favourite song feels so good."
       }
      ]
     }
    ]
   },
   {
    "id": "s4",
    "step": 6,
    "title": "Cardio & weights",
    "sub": "Move to heal",
    "img": "4-cardio",
    "lessons": [
     {
      "id": "exercise",
      "title": "Strength training to protect muscle",
      "mins": 10,
      "text": "The single best way to keep muscle while the weight comes off: simple strength sessions, plus walking and cardio, with how to progress week by week.",
      "quiz": [
       {
        "q": "How many minutes of moderate exercise a week does the big Lancet study link to a longer life?",
        "o": [
         "15 minutes",
         "150 minutes",
         "1,500 minutes",
         "Any amount over 10 hours"
        ],
        "a": 1,
        "fb": "150 minutes is about 30 minutes, 5 days a week, and it's linked to big drops in heart disease and diabetes risk."
       },
       {
        "q": "Which type of exercise builds muscle and raises the calories you burn at rest?",
        "o": [
         "Stretching only",
         "Strength (resistance) training",
         "Walking slowly",
         "Sitting upright"
        ],
        "a": 1,
        "fb": "Muscle is your metabolic engine. Every pound added burns a few more calories a day, even while resting."
       },
       {
        "q": "What is the \"afterburn\" (EPOC) effect?",
        "o": [
         "Sore muscles the next day",
         "A raised metabolism for hours after a hard workout",
         "Sunburn from outdoor exercise",
         "Heartburn after eating"
        ],
        "a": 1,
        "fb": "After intense sessions like HIIT, your body keeps burning extra energy for up to about 24 hours while it recovers."
       },
       {
        "q": "Which fat does exercise tend to target first, the most harmful kind around the organs?",
        "o": [
         "Visceral fat",
         "Fat under the skin on your arms",
         "Fat in your feet",
         "Brown fat"
        ],
        "a": 0,
        "fb": "Visceral fat drives inflammation and insulin resistance, and exercise can shrink it even before the scale moves much."
       },
       {
        "q": "How does exercise lower blood sugar without needing insulin?",
        "o": [
         "It makes you sweat out sugar",
         "Working muscles pull sugar in through GLUT4 transporters",
         "It stops the liver from working",
         "It doesn't lower blood sugar"
        ],
        "a": 1,
        "fb": "During and after exercise, muscles open their own doors (GLUT4) to absorb sugar from the blood."
       }
      ]
     },
     {
      "id": "massage",
      "title": "Massage therapy",
      "mins": 6,
      "text": "Hands-on recovery for muscles and the nervous system, including simple self-massage you can do at home.",
      "quiz": [
       {
        "q": "What happens to cortisol, the stress hormone, after a massage?",
        "o": [
         "It rises",
         "It drops",
         "It stays the same",
         "It turns into sugar"
        ],
        "a": 1,
        "fb": "Across 38 studies, cortisol fell after massage. It was measured in saliva and urine, not just how people felt."
       },
       {
        "q": "Which two \"feel-good\" chemicals rose after massage in those studies?",
        "o": [
         "Serotonin and dopamine",
         "Insulin and glucagon",
         "Adrenaline and histamine",
         "Caffeine and nicotine"
        ],
        "a": 0,
        "fb": "Serotonin steadies mood and dopamine drives motivation. Massage nudges both up naturally."
       },
       {
        "q": "Where is more than 90% of the body's serotonin made?",
        "o": [
         "In the brain",
         "In the gut",
         "In the lungs",
         "In the skin"
        ],
        "a": 1,
        "fb": "Your gut makes most of your serotonin, one reason gut health and mood are so closely linked."
       },
       {
        "q": "Which hormone, released by touch, builds trust and calms the stress response?",
        "o": [
         "Oxytocin",
         "Cortisol",
         "Testosterone",
         "Thyroxine"
        ],
        "a": 0,
        "fb": "Oxytocin is the connection hormone. Caring touch is one of the strongest ways to release it."
       },
       {
        "q": "About how long were the sessions that consistently produced measurable hormone changes?",
        "o": [
         "5 minutes",
         "About 45 minutes",
         "4 hours",
         "Only overnight"
        ],
        "a": 1,
        "fb": "Around 45 minutes gave the clearest results, though shorter sessions still helped."
       }
      ]
     }
    ]
   },
   {
    "id": "s3",
    "step": 7,
    "title": "High-protein diet",
    "sub": "Feed repair",
    "img": "3-high-protein",
    "lessons": [
     {
      "id": "keto",
      "title": "Protein-first eating on a GLP-1",
      "mins": 12,
      "text": "Eating less on a GLP-1 makes every meal count. How to hit your protein so you lose fat, not muscle, with high-protein whole foods that are easy on the stomach.",
      "quiz": [
       {
        "q": "Which nutrient keeps you full the longest per calorie?",
        "o": [
         "Protein",
         "Sugar",
         "Fat",
         "Alcohol"
        ],
        "a": 0,
        "fb": "Protein is the most filling nutrient. It calms hunger hormones, so you naturally eat less without fighting cravings."
       },
       {
        "q": "Roughly how much protein per kilogram of body weight is a good daily target when healing and losing weight?",
        "o": [
         "0.3 g",
         "About 1.2–1.6 g",
         "5 g",
         "No target needed"
        ],
        "a": 1,
        "fb": "Around 1.2–1.6 g per kg a day protects muscle while you lose fat and gives your body the building blocks to repair."
       },
       {
        "q": "About how much protein per meal helps your muscles rebuild best?",
        "o": [
         "5 g",
         "About 25–40 g",
         "100 g",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "Spreading 25–40 g of protein across each meal switches on muscle repair several times a day."
       },
       {
        "q": "Why does protein help when you're losing weight?",
        "o": [
         "It protects muscle so the weight you lose is fat",
         "It adds water weight",
         "It stops digestion",
         "It replaces sleep"
        ],
        "a": 0,
        "fb": "Without enough protein the body breaks down muscle. High protein keeps muscle, so the scale drop is real fat loss."
       },
       {
        "q": "Roughly how much of protein's calories does your body burn just digesting it?",
        "o": [
         "About 20–30%",
         "1%",
         "Over 80%",
         "None"
        ],
        "a": 0,
        "fb": "Protein has the highest 'thermic effect': about a quarter of its calories are used just to digest it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 6,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days."
     }
    ]
   }
  ]
 }
};
