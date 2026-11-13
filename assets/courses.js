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
      "mins": 10,
      "text": "Two videos. First the repair switch: autophagy, what a 100-person fasting trial did to blood work, and what fasting does for joints and the brain. Then how to rest your gut with the juice cleanse or the water fast, how to come back to food, and who needs to check with their doctor first.",
      "quiz": [
       {
        "q": "What does autophagy mean?",
        "o": [
         "Fat burning",
         "Self eating: your cells recycling their own worn out parts",
         "A kind of juice cleanse",
         "A hunger hormone"
        ],
        "a": 1,
        "fb": "Autophagy is your body's built-in recycling system. The discovery of how it works won the Nobel Prize in 2016."
       },
       {
        "q": "Which 2 hormones fall when you fast, flipping your body from growth into repair?",
        "o": [
         "Insulin and IGF-1",
         "Melatonin and serotonin",
         "Adrenaline and cortisol",
         "Estrogen and testosterone"
        ],
        "a": 0,
        "fb": "Insulin and IGF-1 tell your cells to grow and store. When they fall, the cleanup crew finally gets a turn."
       },
       {
        "q": "In Valter Longo's trial of 100 people, who improved the most?",
        "o": [
         "The youngest people",
         "People who were already healthy",
         "People who started with the worst numbers",
         "People who exercised the most"
        ],
        "a": 2,
        "fb": "Fasting fixed what was off. People with high blood pressure, cholesterol or inflammation improved most, and healthy numbers barely moved."
       },
       {
        "q": "What happened to gut stem cells after a 24 hour fast in the MIT study (in mice)?",
        "o": [
         "They shut down",
         "Their repair power roughly doubled",
         "Nothing changed",
         "They turned into fat cells"
        ],
        "a": 1,
        "fb": "The stem cells that rebuild your gut lining switched to burning fat and got better at repair, most of all in older animals."
       },
       {
        "q": "What are the 2 cleanse levels in this course?",
        "o": [
         "Keto and carnivore",
         "Juice cleanse and water fast",
         "Broth fast and dry fast",
         "Smoothies and soup"
        ],
        "a": 1,
        "fb": "The juice cleanse is the gentler place to start. The water fast flips the repair switch the hardest."
       },
       {
        "q": "Who should talk to their doctor before any fast?",
        "o": [
         "Only people over 70",
         "Nobody, fasting is safe for everyone",
         "Anyone on insulin, blood sugar pills or blood pressure medication, or who is pregnant or has had an eating disorder",
         "Only people who have never fasted"
        ],
        "a": 2,
        "fb": "Your numbers can drop fast when you stop eating, and your doctor may need to adjust your dose to keep you safe."
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
      "mins": 5,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "After an 8 week mindfulness course, what happened to the brain's alarm center (the amygdala)?",
        "o": [
         "It grew larger",
         "It got less dense",
         "It stopped working",
         "Nothing changed"
        ],
        "a": 1,
        "fb": "The alarm center got less dense, and the more a person's stress came down, the more it changed. The memory area (hippocampus) grew."
       },
       {
        "q": "How much meditation training did the beginners in the Wake Forest pain study get?",
        "o": [
         "4 sessions of 20 minutes",
         "8 weeks of daily practice",
         "A 3 month retreat",
         "1 hour a day for a year"
        ],
        "a": 0,
        "fb": "Just 80 minutes in total. Pain felt about 40% less intense and 57% less unpleasant."
       },
       {
        "q": "Why is calming your mind a gut treatment?",
        "o": [
         "It burns calories",
         "Your gut only digests properly in the rest and digest gear",
         "It kills gut bacteria",
         "It raises stomach acid"
        ],
        "a": 1,
        "fb": "You can't digest properly in the stress gear. Meditation shifts you into rest and digest, where healing happens."
       },
       {
        "q": "In the UCLA sleep trial, what worked better for poor sleepers?",
        "o": [
         "A sleep habits class",
         "Sleeping pills",
         "A 6 week mindfulness course",
         "Afternoon naps"
        ],
        "a": 2,
        "fb": "The mindfulness group slept better and had less fatigue and depression. A busy head is behind most sleep trouble."
       },
       {
        "q": "When your mind wanders during meditation, what does that mean?",
        "o": [
         "You failed and should stop",
         "You are doing it wrong",
         "Noticing it and coming back is the exercise",
         "You need a longer session"
        ],
        "a": 2,
        "fb": "That's the rep. Start with 5 minutes a day and build up from there."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 5,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "In the New Zealand wound study, how many of the expressive writers had healed by day 11?",
        "o": [
         "42%",
         "50%",
         "76%",
         "100%"
        ],
        "a": 2,
        "fb": "76% of the people who wrote about their feelings had healed, compared with 42% of the people who wrote about their daily plans."
       },
       {
        "q": "In Pennebaker's original study, students who wrote about hard experiences for 4 days did what over the next 6 months?",
        "o": [
         "Got better grades",
         "Visited the health center about half as often",
         "Slept 2 hours longer",
         "Lost weight"
        ],
        "a": 1,
        "fb": "One hour of honest writing in total, and about half as many doctor visits."
       },
       {
        "q": "What did the Baylor study find helps you fall asleep faster?",
        "o": [
         "Writing a to do list for the coming days",
         "Reading the news",
         "Writing about what you already finished",
         "Counting backwards"
        ],
        "a": 0,
        "fb": "The to do list group fell asleep about 9 minutes faster, and the more detailed the list, the faster they dropped off."
       },
       {
        "q": "What is the simplest gratitude practice from the lesson?",
        "o": [
         "Writing a letter every day",
         "3 good things at the end of the day",
         "A 1 hour journaling session",
         "Meditating on gratitude for 30 minutes"
        ],
        "a": 1,
        "fb": "Three things that went well today, even small ones. It trains your brain to look for what's working."
       },
       {
        "q": "What should you end every journal entry with?",
        "o": [
         "A list of your worries",
         "One next step",
         "A drawing",
         "Yesterday's entry"
        ],
        "a": 1,
        "fb": "One next step keeps you moving forward so you're not going around in circles."
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
      "mins": 5,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the Swedish study of about 30,000 women, how did sun avoiders compare with those who got the most sun?",
        "o": [
         "They lived longer",
         "Roughly twice the death rate",
         "No difference",
         "Half the death rate"
        ],
        "a": 1,
        "fb": "Sun avoiders had roughly twice the death rate over 20 years. It's one study and can't prove cause, but it's striking."
       },
       {
        "q": "Spine surgery patients in brighter hospital rooms used how much less pain medication?",
        "o": [
         "2%",
         "22%",
         "60%",
         "None"
        ],
        "a": 1,
        "fb": "About 46% more sunlight, and 22% less pain medication every hour."
       },
       {
        "q": "When is the most important light of the day for your body clock?",
        "o": [
         "Midday",
         "Late afternoon",
         "Morning",
         "Just before bed"
        ],
        "a": 2,
        "fb": "15 to 30 minutes of morning light sets your clock, lifts your serotonin and lets melatonin rise on time that night."
       },
       {
        "q": "How does sunlight lower blood pressure, apart from vitamin D?",
        "o": [
         "It makes you sweat",
         "It releases nitric oxide from your skin, which relaxes blood vessels",
         "It slows your heart",
         "It thins your blood"
        ],
        "a": 1,
        "fb": "Edinburgh researchers found blood pressure came down within about 20 minutes."
       },
       {
        "q": "What is rule number 1 with the sun?",
        "o": [
         "Get as much as you can",
         "Only go out at noon",
         "Never burn",
         "Always wear a hat"
        ],
        "a": 2,
        "fb": "A burn is damage. Build up gradually with short, regular exposure."
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
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimeters, reaching muscles and joints."
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
      "mins": 5,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week.",
      "quiz": [
       {
        "q": "After a 2 to 3 day forest trip, what happened to natural killer cell activity?",
        "o": [
         "It dropped by half",
         "It rose by about 50%",
         "It stayed the same",
         "It doubled every day"
        ],
        "a": 1,
        "fb": "Natural killer cells hunt virus infected and abnormal cells. Their activity rose by about half, and a matching city trip changed nothing."
       },
       {
        "q": "How long did the immune lift last after a longer forest trip?",
        "o": [
         "A few hours",
         "1 day",
         "Up to 30 days",
         "1 year"
        ],
        "a": 2,
        "fb": "Up to 30 days, which is why a forest day once a month keeps it switched on."
       },
       {
        "q": "What are phytoncides?",
        "o": [
         "A kind of pollen",
         "Natural oils trees release to protect themselves",
         "Forest soil bacteria",
         "A vitamin in leaves"
        ],
        "a": 1,
        "fb": "They are the scent of a pine or cedar forest. Breathing them in raised killer cells and lowered stress hormones."
       },
       {
        "q": "In the Stanford study, what did a 90 minute nature walk do that a walk beside a busy road did not?",
        "o": [
         "Burned more calories",
         "Reduced brooding and quieted a brain area that is overactive in depression",
         "Raised blood pressure",
         "Improved eyesight"
        ],
        "a": 1,
        "fb": "Only the nature walkers came back brooding less."
       },
       {
        "q": "How do you forest bathe?",
        "o": [
         "Hike as fast as you can",
         "Walk slowly, breathe deeply, phone away",
         "Run with headphones on",
         "Only in winter"
        ],
        "a": 1,
        "fb": "It isn't a hike. Slow down, breathe through your nose, or simply sit against a tree for 20 minutes."
       }
      ]
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
      "mins": 5,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "In the sleep lab study, caffeine taken 6 hours before bed did what?",
        "o": [
         "Nothing",
         "Cut sleep by more than 1 hour",
         "Helped people fall asleep",
         "Only affected dreams"
        ],
        "a": 1,
        "fb": "And people didn't notice. Caffeine has a half life of about 5 hours, so the cutoff is noon."
       },
       {
        "q": "What bedroom temperature supports deep sleep?",
        "o": [
         "60 to 62°F",
         "65 to 68°F",
         "72 to 75°F",
         "78 to 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature has to drop 1 to 2 degrees to fall asleep, and a cool room lets it."
       },
       {
        "q": "What did ordinary room light in the evening do in the Harvard study?",
        "o": [
         "Nothing",
         "Raised melatonin",
         "Cut the melatonin window by about 90 minutes",
         "Improved deep sleep"
        ],
        "a": 2,
        "fb": "Use warm dim lamps for the last hour, blackout curtains, and keep your phone out of the bedroom."
       },
       {
        "q": "How long before bed should you finish eating?",
        "o": [
         "30 minutes",
         "1 hour",
         "About 3 hours",
         "It doesn't matter"
        ],
        "a": 2,
        "fb": "Digestion and body temperature need about 3 hours to wind down."
       },
       {
        "q": "Which habit anchors your whole body clock?",
        "o": [
         "Going to bed at 9",
         "The same wake time every day, weekends too",
         "A nap after lunch",
         "Sleeping in on Sundays"
        ],
        "a": 1,
        "fb": "Your wake time matters more than your bedtime."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 5,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "About how much of your life do you spend indoors?",
        "o": [
         "30%",
         "50%",
         "70%",
         "90%"
        ],
        "a": 3,
        "fb": "About 90%, and the EPA says indoor air is often 2 to 5 times more polluted than outdoor air."
       },
       {
        "q": "What is the leading cause of lung cancer in people who have never smoked?",
        "o": [
         "Mold",
         "Radon",
         "Dust",
         "Pollen"
        ],
        "a": 1,
        "fb": "Radon causes about 21,000 US deaths a year. A test kit costs 15 to 30 dollars."
       },
       {
        "q": "What indoor humidity keeps mold away?",
        "o": [
         "10 to 20%",
         "40 to 50%",
         "65 to 75%",
         "Above 80%"
        ],
        "a": 1,
        "fb": "Above 60% the risk of mold climbs fast. A small humidity meter costs about 15 dollars."
       },
       {
        "q": "A closed bedroom can reach what carbon dioxide level by morning?",
        "o": [
         "About 420 ppm",
         "About 800 ppm",
         "2,000 ppm or more",
         "It stays the same as outside"
        ],
        "a": 2,
        "fb": "Outside air is about 420. Crack a window or leave the door open and aim for under 800."
       },
       {
        "q": "What does a true HEPA filter NOT remove?",
        "o": [
         "Fine particles",
         "Mold spores",
         "Pollen",
         "Gases, radon and carbon dioxide"
        ],
        "a": 3,
        "fb": "HEPA catches particles. Gases need activated carbon, and radon and CO2 need venting and fresh air."
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
      "mins": 9,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What did the Lancet review of 73 surgery trials find about music?",
        "o": [
         "It distracted surgeons",
         "Less pain, less anxiety and fewer painkillers",
         "No effect",
         "It only worked for children"
        ],
        "a": 1,
        "fb": "About 7,000 patients, and it worked even under general anesthesia."
       },
       {
        "q": "Your favorite song releases dopamine at how many separate moments?",
        "o": [
         "1",
         "2",
         "5",
         "None"
        ],
        "a": 1,
        "fb": "Once in the build up, when your brain predicts what's coming, and again at the peak."
       },
       {
        "q": "What tempo is most calming music?",
        "o": [
         "20 to 40 beats a minute",
         "60 to 80 beats a minute",
         "120 to 140 beats a minute",
         "Over 160 beats a minute"
        ],
        "a": 1,
        "fb": "About the speed of a resting heartbeat. For sleep go under 60, for exercise 120 or more."
       },
       {
        "q": "What is the iso principle?",
        "o": [
         "Always play calm music",
         "Start with music that matches how you feel, then step it down",
         "Only listen with headphones",
         "Play the same song on repeat"
        ],
        "a": 1,
        "fb": "Jumping straight from stressed to calm rarely works. You take the stairs."
       },
       {
        "q": "How long was a typical music session in the clinical trials?",
        "o": [
         "2 minutes",
         "20 to 30 minutes",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Headphones on, eyes closed, really listening, for 20 to 30 minutes."
       },
       {
        "q": "What are the 3 parts of the daily 15 minute practice?",
        "o": [
         "Music, stillness and gratitude",
         "Running, lifting and stretching",
         "Reading, writing and talking",
         "Juice, water and rest"
        ],
        "a": 0,
        "fb": "Music that matches your mood then slows down, a few minutes of quiet, and 3 things you're grateful for."
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
        "q": "In the Diabetes Prevention Program, how did lifestyle change compare with metformin?",
        "o": [
         "The drug won easily",
         "They were equal",
         "Lifestyle cut diabetes risk by 58%, the drug by 31%",
         "Neither worked"
        ],
        "a": 2,
        "fb": "About 150 minutes of walking a week and a little weight loss nearly doubled the drug's result."
       },
       {
        "q": "Why does a walk after a meal lower blood sugar?",
        "o": [
         "It makes you sweat sugar out",
         "Working muscles pull sugar from the blood without needing insulin",
         "It slows digestion",
         "It raises insulin"
        ],
        "a": 1,
        "fb": "Working muscle has a second door called GLUT4 that doesn't need the insulin key. A 10 minute walk is enough."
       },
       {
        "q": "What is the weekly cardio target?",
        "o": [
         "30 minutes",
         "150 minutes",
         "500 minutes",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "150 minutes a week at a pace where you can still talk. If you're starting out, 10 minutes is a win."
       },
       {
        "q": "Why does muscle matter for blood sugar?",
        "o": [
         "It stores fat",
         "It is the biggest sugar sponge in your body",
         "It makes insulin",
         "It slows digestion"
        ],
        "a": 1,
        "fb": "Most of the sugar from a meal is soaked up by muscle, so more muscle means more room to put it away."
       },
       {
        "q": "What are the 5 moves in the strength plan?",
        "o": [
         "Squats, lunges, push ups, sit ups and shadow boxing",
         "Deadlifts, bench press, rows, curls and dips",
         "Running, cycling, swimming, rowing and hiking",
         "Yoga, pilates, stretching, tai chi and dance"
        ],
        "a": 0,
        "fb": "No gym needed. Two sessions a week, and a little bit more each week."
       },
       {
        "q": "What should you do for exercise during your cleanse week?",
        "o": [
         "Train as hard as possible",
         "Rest for the first 2 days, then only gentle walks",
         "Lift heavy every day",
         "Run every morning"
        ],
        "a": 1,
        "fb": "Your body is busy repairing. Build back up once you're eating again."
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
      "mins": 5,
      "text": "How protein-first meals keep you full, protect muscle while you lose fat, and give your gut lining the building blocks to repair, and how to build a high-protein plate after your cleanse.",
      "quiz": [
       {
        "q": "Which hormone, the same one weight loss shots copy, does a high protein meal turn up?",
        "o": [
         "Insulin",
         "GLP-1",
         "Cortisol",
         "Melatonin"
        ],
        "a": 1,
        "fb": "Your gut makes its own GLP-1. Protein also turns down ghrelin, the hunger hormone."
       },
       {
        "q": "What are protein's 3 jobs?",
        "o": [
         "Energy, sweetness and fiber",
         "Fullness, costing more energy to digest, and protecting muscle",
         "Hydration, sleep and mood",
         "Storing fat, raising sugar and building bone"
        ],
        "a": 1,
        "fb": "Higher protein diets lost more fat and kept more muscle in the pooled weight loss trials."
       },
       {
        "q": "What is the simple protein rule in this course?",
        "o": [
         "10 grams a day",
         "30 grams at every meal",
         "100 grams at dinner",
         "Protein only on training days"
        ],
        "a": 1,
        "fb": "30 grams looks like a palm sized piece of meat or fish, or 4 to 5 eggs. Eat it first."
       },
       {
        "q": "What should you eat first on your plate?",
        "o": [
         "Bread",
         "Fruit",
         "The protein",
         "Dessert"
        ],
        "a": 2,
        "fb": "Protein first fills you up and steadies your blood sugar, then the vegetables."
       },
       {
        "q": "Why does protein matter even more when you lose weight fast or use a GLP-1?",
        "o": [
         "It speeds up weight loss",
         "It protects your muscle so the weight you lose is fat",
         "It replaces water",
         "It blocks the medication"
        ],
        "a": 1,
        "fb": "Muscle is the engine that keeps the weight off. Protein plus lifting is how you keep it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 2,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days.",
      "quiz": [
       {
        "q": "Fewer than how many Americans get enough potassium?",
        "o": [
         "1 in 2",
         "1 in 5",
         "1 in 20",
         "Nearly everyone gets enough"
        ],
        "a": 2,
        "fb": "Potassium helps steady your heart rhythm, blood pressure and muscles. You get it from vegetables, avocado and fish."
       },
       {
        "q": "What is often mistaken for hunger?",
        "o": [
         "Tiredness",
         "Thirst",
         "Cold",
         "Boredom only"
        ],
        "a": 1,
        "fb": "A lot of what we think is hunger is really thirst, so drink first."
       },
       {
        "q": "When does Mark drink a big glass of water?",
        "o": [
         "Only at dinner",
         "As soon as he gets up and before every meal",
         "Only after exercise",
         "Just before bed"
        ],
        "a": 1,
        "fb": "Your body needs plenty of water to process protein and keep digestion moving."
       }
      ]
     },
     {
      "id": "supplements",
      "title": "Nature's supplements & the pills worth taking",
      "mins": 5,
      "text": "The three foods that work like a multivitamin (oysters, beef liver and canned sardines), then the three pills that have earned a place: creatine, collagen with vitamin C, and lactoferrin. Food first, pills last.",
      "quiz": [
       {
        "q": "Which food has about 3 times your daily zinc in a 3 ounce serving?",
        "o": [
         "Chicken breast",
         "Oysters",
         "Spinach",
         "Rice"
        ],
        "a": 1,
        "fb": "Oysters have more zinc than any other food. Canned smoked oysters once or twice a week is plenty."
       },
       {
        "q": "Why is beef liver treated like a supplement and kept to a small serving about once a week?",
        "o": [
         "It is expensive",
         "It is very high in vitamin A, which builds up in your body",
         "It has no nutrients",
         "It is hard to digest"
        ],
        "a": 1,
        "fb": "A 3 ounce serving has almost 9 times your daily vitamin A. If you're pregnant, talk to your doctor before eating liver."
       },
       {
        "q": "What do you get from the soft bones in canned sardines?",
        "o": [
         "Zinc",
         "Calcium and vitamin D",
         "Vitamin C",
         "Fiber"
        ],
        "a": 1,
        "fb": "Plus protein, omega 3 fats and more than 3 days of B12 in a single can."
       },
       {
        "q": "What is the daily dose of creatine, and what does it need to work?",
        "o": [
         "20 grams, and nothing else",
         "3 to 5 grams, alongside strength training",
         "1 gram, with coffee",
         "50 grams, on rest days only"
        ],
        "a": 1,
        "fb": "Creatine without the training did nothing in the studies. Check with your doctor first if you have kidney disease."
       },
       {
        "q": "How does Mark rank the evidence for lactoferrin?",
        "o": [
         "Proven beyond doubt",
         "Promising but not proven",
         "Useless",
         "Dangerous"
        ],
        "a": 1,
        "fb": "Much of the research is early and done in the lab. Food comes first, then nature's supplements, then pills."
       }
      ]
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
      "mins": 10,
      "text": "Two videos. First the repair switch: autophagy, what a 100-person fasting trial did to blood work, and what fasting does for joints and the brain. Then how to rest your gut with the juice cleanse or the water fast, how to come back to food, and who needs to check with their doctor first.",
      "quiz": [
       {
        "q": "What does autophagy mean?",
        "o": [
         "Fat burning",
         "Self eating: your cells recycling their own worn out parts",
         "A kind of juice cleanse",
         "A hunger hormone"
        ],
        "a": 1,
        "fb": "Autophagy is your body's built-in recycling system. The discovery of how it works won the Nobel Prize in 2016."
       },
       {
        "q": "Which 2 hormones fall when you fast, flipping your body from growth into repair?",
        "o": [
         "Insulin and IGF-1",
         "Melatonin and serotonin",
         "Adrenaline and cortisol",
         "Estrogen and testosterone"
        ],
        "a": 0,
        "fb": "Insulin and IGF-1 tell your cells to grow and store. When they fall, the cleanup crew finally gets a turn."
       },
       {
        "q": "In Valter Longo's trial of 100 people, who improved the most?",
        "o": [
         "The youngest people",
         "People who were already healthy",
         "People who started with the worst numbers",
         "People who exercised the most"
        ],
        "a": 2,
        "fb": "Fasting fixed what was off. People with high blood pressure, cholesterol or inflammation improved most, and healthy numbers barely moved."
       },
       {
        "q": "What happened to gut stem cells after a 24 hour fast in the MIT study (in mice)?",
        "o": [
         "They shut down",
         "Their repair power roughly doubled",
         "Nothing changed",
         "They turned into fat cells"
        ],
        "a": 1,
        "fb": "The stem cells that rebuild your gut lining switched to burning fat and got better at repair, most of all in older animals."
       },
       {
        "q": "What are the 2 cleanse levels in this course?",
        "o": [
         "Keto and carnivore",
         "Juice cleanse and water fast",
         "Broth fast and dry fast",
         "Smoothies and soup"
        ],
        "a": 1,
        "fb": "The juice cleanse is the gentler place to start. The water fast flips the repair switch the hardest."
       },
       {
        "q": "Who should talk to their doctor before any fast?",
        "o": [
         "Only people over 70",
         "Nobody, fasting is safe for everyone",
         "Anyone on insulin, blood sugar pills or blood pressure medication, or who is pregnant or has had an eating disorder",
         "Only people who have never fasted"
        ],
        "a": 2,
        "fb": "Your numbers can drop fast when you stop eating, and your doctor may need to adjust your dose to keep you safe."
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
      "mins": 5,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "After an 8 week mindfulness course, what happened to the brain's alarm center (the amygdala)?",
        "o": [
         "It grew larger",
         "It got less dense",
         "It stopped working",
         "Nothing changed"
        ],
        "a": 1,
        "fb": "The alarm center got less dense, and the more a person's stress came down, the more it changed. The memory area (hippocampus) grew."
       },
       {
        "q": "How much meditation training did the beginners in the Wake Forest pain study get?",
        "o": [
         "4 sessions of 20 minutes",
         "8 weeks of daily practice",
         "A 3 month retreat",
         "1 hour a day for a year"
        ],
        "a": 0,
        "fb": "Just 80 minutes in total. Pain felt about 40% less intense and 57% less unpleasant."
       },
       {
        "q": "Why is calming your mind a gut treatment?",
        "o": [
         "It burns calories",
         "Your gut only digests properly in the rest and digest gear",
         "It kills gut bacteria",
         "It raises stomach acid"
        ],
        "a": 1,
        "fb": "You can't digest properly in the stress gear. Meditation shifts you into rest and digest, where healing happens."
       },
       {
        "q": "In the UCLA sleep trial, what worked better for poor sleepers?",
        "o": [
         "A sleep habits class",
         "Sleeping pills",
         "A 6 week mindfulness course",
         "Afternoon naps"
        ],
        "a": 2,
        "fb": "The mindfulness group slept better and had less fatigue and depression. A busy head is behind most sleep trouble."
       },
       {
        "q": "When your mind wanders during meditation, what does that mean?",
        "o": [
         "You failed and should stop",
         "You are doing it wrong",
         "Noticing it and coming back is the exercise",
         "You need a longer session"
        ],
        "a": 2,
        "fb": "That's the rep. Start with 5 minutes a day and build up from there."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 5,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "In the New Zealand wound study, how many of the expressive writers had healed by day 11?",
        "o": [
         "42%",
         "50%",
         "76%",
         "100%"
        ],
        "a": 2,
        "fb": "76% of the people who wrote about their feelings had healed, compared with 42% of the people who wrote about their daily plans."
       },
       {
        "q": "In Pennebaker's original study, students who wrote about hard experiences for 4 days did what over the next 6 months?",
        "o": [
         "Got better grades",
         "Visited the health center about half as often",
         "Slept 2 hours longer",
         "Lost weight"
        ],
        "a": 1,
        "fb": "One hour of honest writing in total, and about half as many doctor visits."
       },
       {
        "q": "What did the Baylor study find helps you fall asleep faster?",
        "o": [
         "Writing a to do list for the coming days",
         "Reading the news",
         "Writing about what you already finished",
         "Counting backwards"
        ],
        "a": 0,
        "fb": "The to do list group fell asleep about 9 minutes faster, and the more detailed the list, the faster they dropped off."
       },
       {
        "q": "What is the simplest gratitude practice from the lesson?",
        "o": [
         "Writing a letter every day",
         "3 good things at the end of the day",
         "A 1 hour journaling session",
         "Meditating on gratitude for 30 minutes"
        ],
        "a": 1,
        "fb": "Three things that went well today, even small ones. It trains your brain to look for what's working."
       },
       {
        "q": "What should you end every journal entry with?",
        "o": [
         "A list of your worries",
         "One next step",
         "A drawing",
         "Yesterday's entry"
        ],
        "a": 1,
        "fb": "One next step keeps you moving forward so you're not going around in circles."
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
      "mins": 5,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the Swedish study of about 30,000 women, how did sun avoiders compare with those who got the most sun?",
        "o": [
         "They lived longer",
         "Roughly twice the death rate",
         "No difference",
         "Half the death rate"
        ],
        "a": 1,
        "fb": "Sun avoiders had roughly twice the death rate over 20 years. It's one study and can't prove cause, but it's striking."
       },
       {
        "q": "Spine surgery patients in brighter hospital rooms used how much less pain medication?",
        "o": [
         "2%",
         "22%",
         "60%",
         "None"
        ],
        "a": 1,
        "fb": "About 46% more sunlight, and 22% less pain medication every hour."
       },
       {
        "q": "When is the most important light of the day for your body clock?",
        "o": [
         "Midday",
         "Late afternoon",
         "Morning",
         "Just before bed"
        ],
        "a": 2,
        "fb": "15 to 30 minutes of morning light sets your clock, lifts your serotonin and lets melatonin rise on time that night."
       },
       {
        "q": "How does sunlight lower blood pressure, apart from vitamin D?",
        "o": [
         "It makes you sweat",
         "It releases nitric oxide from your skin, which relaxes blood vessels",
         "It slows your heart",
         "It thins your blood"
        ],
        "a": 1,
        "fb": "Edinburgh researchers found blood pressure came down within about 20 minutes."
       },
       {
        "q": "What is rule number 1 with the sun?",
        "o": [
         "Get as much as you can",
         "Only go out at noon",
         "Never burn",
         "Always wear a hat"
        ],
        "a": 2,
        "fb": "A burn is damage. Build up gradually with short, regular exposure."
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
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimeters, reaching muscles and joints."
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
      "mins": 5,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week.",
      "quiz": [
       {
        "q": "After a 2 to 3 day forest trip, what happened to natural killer cell activity?",
        "o": [
         "It dropped by half",
         "It rose by about 50%",
         "It stayed the same",
         "It doubled every day"
        ],
        "a": 1,
        "fb": "Natural killer cells hunt virus infected and abnormal cells. Their activity rose by about half, and a matching city trip changed nothing."
       },
       {
        "q": "How long did the immune lift last after a longer forest trip?",
        "o": [
         "A few hours",
         "1 day",
         "Up to 30 days",
         "1 year"
        ],
        "a": 2,
        "fb": "Up to 30 days, which is why a forest day once a month keeps it switched on."
       },
       {
        "q": "What are phytoncides?",
        "o": [
         "A kind of pollen",
         "Natural oils trees release to protect themselves",
         "Forest soil bacteria",
         "A vitamin in leaves"
        ],
        "a": 1,
        "fb": "They are the scent of a pine or cedar forest. Breathing them in raised killer cells and lowered stress hormones."
       },
       {
        "q": "In the Stanford study, what did a 90 minute nature walk do that a walk beside a busy road did not?",
        "o": [
         "Burned more calories",
         "Reduced brooding and quieted a brain area that is overactive in depression",
         "Raised blood pressure",
         "Improved eyesight"
        ],
        "a": 1,
        "fb": "Only the nature walkers came back brooding less."
       },
       {
        "q": "How do you forest bathe?",
        "o": [
         "Hike as fast as you can",
         "Walk slowly, breathe deeply, phone away",
         "Run with headphones on",
         "Only in winter"
        ],
        "a": 1,
        "fb": "It isn't a hike. Slow down, breathe through your nose, or simply sit against a tree for 20 minutes."
       }
      ]
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
      "mins": 5,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "In the sleep lab study, caffeine taken 6 hours before bed did what?",
        "o": [
         "Nothing",
         "Cut sleep by more than 1 hour",
         "Helped people fall asleep",
         "Only affected dreams"
        ],
        "a": 1,
        "fb": "And people didn't notice. Caffeine has a half life of about 5 hours, so the cutoff is noon."
       },
       {
        "q": "What bedroom temperature supports deep sleep?",
        "o": [
         "60 to 62°F",
         "65 to 68°F",
         "72 to 75°F",
         "78 to 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature has to drop 1 to 2 degrees to fall asleep, and a cool room lets it."
       },
       {
        "q": "What did ordinary room light in the evening do in the Harvard study?",
        "o": [
         "Nothing",
         "Raised melatonin",
         "Cut the melatonin window by about 90 minutes",
         "Improved deep sleep"
        ],
        "a": 2,
        "fb": "Use warm dim lamps for the last hour, blackout curtains, and keep your phone out of the bedroom."
       },
       {
        "q": "How long before bed should you finish eating?",
        "o": [
         "30 minutes",
         "1 hour",
         "About 3 hours",
         "It doesn't matter"
        ],
        "a": 2,
        "fb": "Digestion and body temperature need about 3 hours to wind down."
       },
       {
        "q": "Which habit anchors your whole body clock?",
        "o": [
         "Going to bed at 9",
         "The same wake time every day, weekends too",
         "A nap after lunch",
         "Sleeping in on Sundays"
        ],
        "a": 1,
        "fb": "Your wake time matters more than your bedtime."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 5,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "About how much of your life do you spend indoors?",
        "o": [
         "30%",
         "50%",
         "70%",
         "90%"
        ],
        "a": 3,
        "fb": "About 90%, and the EPA says indoor air is often 2 to 5 times more polluted than outdoor air."
       },
       {
        "q": "What is the leading cause of lung cancer in people who have never smoked?",
        "o": [
         "Mold",
         "Radon",
         "Dust",
         "Pollen"
        ],
        "a": 1,
        "fb": "Radon causes about 21,000 US deaths a year. A test kit costs 15 to 30 dollars."
       },
       {
        "q": "What indoor humidity keeps mold away?",
        "o": [
         "10 to 20%",
         "40 to 50%",
         "65 to 75%",
         "Above 80%"
        ],
        "a": 1,
        "fb": "Above 60% the risk of mold climbs fast. A small humidity meter costs about 15 dollars."
       },
       {
        "q": "A closed bedroom can reach what carbon dioxide level by morning?",
        "o": [
         "About 420 ppm",
         "About 800 ppm",
         "2,000 ppm or more",
         "It stays the same as outside"
        ],
        "a": 2,
        "fb": "Outside air is about 420. Crack a window or leave the door open and aim for under 800."
       },
       {
        "q": "What does a true HEPA filter NOT remove?",
        "o": [
         "Fine particles",
         "Mold spores",
         "Pollen",
         "Gases, radon and carbon dioxide"
        ],
        "a": 3,
        "fb": "HEPA catches particles. Gases need activated carbon, and radon and CO2 need venting and fresh air."
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
      "mins": 9,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What did the Lancet review of 73 surgery trials find about music?",
        "o": [
         "It distracted surgeons",
         "Less pain, less anxiety and fewer painkillers",
         "No effect",
         "It only worked for children"
        ],
        "a": 1,
        "fb": "About 7,000 patients, and it worked even under general anesthesia."
       },
       {
        "q": "Your favorite song releases dopamine at how many separate moments?",
        "o": [
         "1",
         "2",
         "5",
         "None"
        ],
        "a": 1,
        "fb": "Once in the build up, when your brain predicts what's coming, and again at the peak."
       },
       {
        "q": "What tempo is most calming music?",
        "o": [
         "20 to 40 beats a minute",
         "60 to 80 beats a minute",
         "120 to 140 beats a minute",
         "Over 160 beats a minute"
        ],
        "a": 1,
        "fb": "About the speed of a resting heartbeat. For sleep go under 60, for exercise 120 or more."
       },
       {
        "q": "What is the iso principle?",
        "o": [
         "Always play calm music",
         "Start with music that matches how you feel, then step it down",
         "Only listen with headphones",
         "Play the same song on repeat"
        ],
        "a": 1,
        "fb": "Jumping straight from stressed to calm rarely works. You take the stairs."
       },
       {
        "q": "How long was a typical music session in the clinical trials?",
        "o": [
         "2 minutes",
         "20 to 30 minutes",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Headphones on, eyes closed, really listening, for 20 to 30 minutes."
       },
       {
        "q": "What are the 3 parts of the daily 15 minute practice?",
        "o": [
         "Music, stillness and gratitude",
         "Running, lifting and stretching",
         "Reading, writing and talking",
         "Juice, water and rest"
        ],
        "a": 0,
        "fb": "Music that matches your mood then slows down, a few minutes of quiet, and 3 things you're grateful for."
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
        "q": "In the Diabetes Prevention Program, how did lifestyle change compare with metformin?",
        "o": [
         "The drug won easily",
         "They were equal",
         "Lifestyle cut diabetes risk by 58%, the drug by 31%",
         "Neither worked"
        ],
        "a": 2,
        "fb": "About 150 minutes of walking a week and a little weight loss nearly doubled the drug's result."
       },
       {
        "q": "Why does a walk after a meal lower blood sugar?",
        "o": [
         "It makes you sweat sugar out",
         "Working muscles pull sugar from the blood without needing insulin",
         "It slows digestion",
         "It raises insulin"
        ],
        "a": 1,
        "fb": "Working muscle has a second door called GLUT4 that doesn't need the insulin key. A 10 minute walk is enough."
       },
       {
        "q": "What is the weekly cardio target?",
        "o": [
         "30 minutes",
         "150 minutes",
         "500 minutes",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "150 minutes a week at a pace where you can still talk. If you're starting out, 10 minutes is a win."
       },
       {
        "q": "Why does muscle matter for blood sugar?",
        "o": [
         "It stores fat",
         "It is the biggest sugar sponge in your body",
         "It makes insulin",
         "It slows digestion"
        ],
        "a": 1,
        "fb": "Most of the sugar from a meal is soaked up by muscle, so more muscle means more room to put it away."
       },
       {
        "q": "What are the 5 moves in the strength plan?",
        "o": [
         "Squats, lunges, push ups, sit ups and shadow boxing",
         "Deadlifts, bench press, rows, curls and dips",
         "Running, cycling, swimming, rowing and hiking",
         "Yoga, pilates, stretching, tai chi and dance"
        ],
        "a": 0,
        "fb": "No gym needed. Two sessions a week, and a little bit more each week."
       },
       {
        "q": "What should you do for exercise during your cleanse week?",
        "o": [
         "Train as hard as possible",
         "Rest for the first 2 days, then only gentle walks",
         "Lift heavy every day",
         "Run every morning"
        ],
        "a": 1,
        "fb": "Your body is busy repairing. Build back up once you're eating again."
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
      "mins": 5,
      "text": "How protein-first meals blunt blood sugar spikes, keep you full for hours and protect muscle, and how to build a high-protein plate that keeps your energy steady all day.",
      "quiz": [
       {
        "q": "Which hormone, the same one weight loss shots copy, does a high protein meal turn up?",
        "o": [
         "Insulin",
         "GLP-1",
         "Cortisol",
         "Melatonin"
        ],
        "a": 1,
        "fb": "Your gut makes its own GLP-1. Protein also turns down ghrelin, the hunger hormone."
       },
       {
        "q": "What are protein's 3 jobs?",
        "o": [
         "Energy, sweetness and fiber",
         "Fullness, costing more energy to digest, and protecting muscle",
         "Hydration, sleep and mood",
         "Storing fat, raising sugar and building bone"
        ],
        "a": 1,
        "fb": "Higher protein diets lost more fat and kept more muscle in the pooled weight loss trials."
       },
       {
        "q": "What is the simple protein rule in this course?",
        "o": [
         "10 grams a day",
         "30 grams at every meal",
         "100 grams at dinner",
         "Protein only on training days"
        ],
        "a": 1,
        "fb": "30 grams looks like a palm sized piece of meat or fish, or 4 to 5 eggs. Eat it first."
       },
       {
        "q": "What should you eat first on your plate?",
        "o": [
         "Bread",
         "Fruit",
         "The protein",
         "Dessert"
        ],
        "a": 2,
        "fb": "Protein first fills you up and steadies your blood sugar, then the vegetables."
       },
       {
        "q": "Why does protein matter even more when you lose weight fast or use a GLP-1?",
        "o": [
         "It speeds up weight loss",
         "It protects your muscle so the weight you lose is fat",
         "It replaces water",
         "It blocks the medication"
        ],
        "a": 1,
        "fb": "Muscle is the engine that keeps the weight off. Protein plus lifting is how you keep it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 2,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days.",
      "quiz": [
       {
        "q": "Fewer than how many Americans get enough potassium?",
        "o": [
         "1 in 2",
         "1 in 5",
         "1 in 20",
         "Nearly everyone gets enough"
        ],
        "a": 2,
        "fb": "Potassium helps steady your heart rhythm, blood pressure and muscles. You get it from vegetables, avocado and fish."
       },
       {
        "q": "What is often mistaken for hunger?",
        "o": [
         "Tiredness",
         "Thirst",
         "Cold",
         "Boredom only"
        ],
        "a": 1,
        "fb": "A lot of what we think is hunger is really thirst, so drink first."
       },
       {
        "q": "When does Mark drink a big glass of water?",
        "o": [
         "Only at dinner",
         "As soon as he gets up and before every meal",
         "Only after exercise",
         "Just before bed"
        ],
        "a": 1,
        "fb": "Your body needs plenty of water to process protein and keep digestion moving."
       }
      ]
     },
     {
      "id": "supplements",
      "title": "Nature's supplements & the pills worth taking",
      "mins": 5,
      "text": "The three foods that work like a multivitamin (oysters, beef liver and canned sardines), then the three pills that have earned a place: creatine, collagen with vitamin C, and lactoferrin. Food first, pills last.",
      "quiz": [
       {
        "q": "Which food has about 3 times your daily zinc in a 3 ounce serving?",
        "o": [
         "Chicken breast",
         "Oysters",
         "Spinach",
         "Rice"
        ],
        "a": 1,
        "fb": "Oysters have more zinc than any other food. Canned smoked oysters once or twice a week is plenty."
       },
       {
        "q": "Why is beef liver treated like a supplement and kept to a small serving about once a week?",
        "o": [
         "It is expensive",
         "It is very high in vitamin A, which builds up in your body",
         "It has no nutrients",
         "It is hard to digest"
        ],
        "a": 1,
        "fb": "A 3 ounce serving has almost 9 times your daily vitamin A. If you're pregnant, talk to your doctor before eating liver."
       },
       {
        "q": "What do you get from the soft bones in canned sardines?",
        "o": [
         "Zinc",
         "Calcium and vitamin D",
         "Vitamin C",
         "Fiber"
        ],
        "a": 1,
        "fb": "Plus protein, omega 3 fats and more than 3 days of B12 in a single can."
       },
       {
        "q": "What is the daily dose of creatine, and what does it need to work?",
        "o": [
         "20 grams, and nothing else",
         "3 to 5 grams, alongside strength training",
         "1 gram, with coffee",
         "50 grams, on rest days only"
        ],
        "a": 1,
        "fb": "Creatine without the training did nothing in the studies. Check with your doctor first if you have kidney disease."
       },
       {
        "q": "How does Mark rank the evidence for lactoferrin?",
        "o": [
         "Proven beyond doubt",
         "Promising but not proven",
         "Useless",
         "Dangerous"
        ],
        "a": 1,
        "fb": "Much of the research is early and done in the lab. Food comes first, then nature's supplements, then pills."
       }
      ]
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
      "mins": 10,
      "text": "Two videos. First the repair switch: autophagy, what a 100-person fasting trial did to blood work, and what fasting does for joints and the brain. Then how to rest your gut with the juice cleanse or the water fast, how to come back to food, and who needs to check with their doctor first.",
      "quiz": [
       {
        "q": "What does autophagy mean?",
        "o": [
         "Fat burning",
         "Self eating: your cells recycling their own worn out parts",
         "A kind of juice cleanse",
         "A hunger hormone"
        ],
        "a": 1,
        "fb": "Autophagy is your body's built-in recycling system. The discovery of how it works won the Nobel Prize in 2016."
       },
       {
        "q": "Which 2 hormones fall when you fast, flipping your body from growth into repair?",
        "o": [
         "Insulin and IGF-1",
         "Melatonin and serotonin",
         "Adrenaline and cortisol",
         "Estrogen and testosterone"
        ],
        "a": 0,
        "fb": "Insulin and IGF-1 tell your cells to grow and store. When they fall, the cleanup crew finally gets a turn."
       },
       {
        "q": "In Valter Longo's trial of 100 people, who improved the most?",
        "o": [
         "The youngest people",
         "People who were already healthy",
         "People who started with the worst numbers",
         "People who exercised the most"
        ],
        "a": 2,
        "fb": "Fasting fixed what was off. People with high blood pressure, cholesterol or inflammation improved most, and healthy numbers barely moved."
       },
       {
        "q": "What happened to gut stem cells after a 24 hour fast in the MIT study (in mice)?",
        "o": [
         "They shut down",
         "Their repair power roughly doubled",
         "Nothing changed",
         "They turned into fat cells"
        ],
        "a": 1,
        "fb": "The stem cells that rebuild your gut lining switched to burning fat and got better at repair, most of all in older animals."
       },
       {
        "q": "What are the 2 cleanse levels in this course?",
        "o": [
         "Keto and carnivore",
         "Juice cleanse and water fast",
         "Broth fast and dry fast",
         "Smoothies and soup"
        ],
        "a": 1,
        "fb": "The juice cleanse is the gentler place to start. The water fast flips the repair switch the hardest."
       },
       {
        "q": "Who should talk to their doctor before any fast?",
        "o": [
         "Only people over 70",
         "Nobody, fasting is safe for everyone",
         "Anyone on insulin, blood sugar pills or blood pressure medication, or who is pregnant or has had an eating disorder",
         "Only people who have never fasted"
        ],
        "a": 2,
        "fb": "Your numbers can drop fast when you stop eating, and your doctor may need to adjust your dose to keep you safe."
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
      "mins": 5,
      "text": "Stress shows up in the gut. Learn what a few minutes of daily practice does to your stress hormones and brain, and a simple routine you can start today.",
      "quiz": [
       {
        "q": "After an 8 week mindfulness course, what happened to the brain's alarm center (the amygdala)?",
        "o": [
         "It grew larger",
         "It got less dense",
         "It stopped working",
         "Nothing changed"
        ],
        "a": 1,
        "fb": "The alarm center got less dense, and the more a person's stress came down, the more it changed. The memory area (hippocampus) grew."
       },
       {
        "q": "How much meditation training did the beginners in the Wake Forest pain study get?",
        "o": [
         "4 sessions of 20 minutes",
         "8 weeks of daily practice",
         "A 3 month retreat",
         "1 hour a day for a year"
        ],
        "a": 0,
        "fb": "Just 80 minutes in total. Pain felt about 40% less intense and 57% less unpleasant."
       },
       {
        "q": "Why is calming your mind a gut treatment?",
        "o": [
         "It burns calories",
         "Your gut only digests properly in the rest and digest gear",
         "It kills gut bacteria",
         "It raises stomach acid"
        ],
        "a": 1,
        "fb": "You can't digest properly in the stress gear. Meditation shifts you into rest and digest, where healing happens."
       },
       {
        "q": "In the UCLA sleep trial, what worked better for poor sleepers?",
        "o": [
         "A sleep habits class",
         "Sleeping pills",
         "A 6 week mindfulness course",
         "Afternoon naps"
        ],
        "a": 2,
        "fb": "The mindfulness group slept better and had less fatigue and depression. A busy head is behind most sleep trouble."
       },
       {
        "q": "When your mind wanders during meditation, what does that mean?",
        "o": [
         "You failed and should stop",
         "You are doing it wrong",
         "Noticing it and coming back is the exercise",
         "You need a longer session"
        ],
        "a": 2,
        "fb": "That's the rep. Start with 5 minutes a day and build up from there."
       }
      ]
     },
     {
      "id": "journaling",
      "title": "Journaling",
      "mins": 5,
      "text": "Writing things down calms the mind and shows you patterns in your symptoms. A short, guided way to journal through your reset.",
      "quiz": [
       {
        "q": "In the New Zealand wound study, how many of the expressive writers had healed by day 11?",
        "o": [
         "42%",
         "50%",
         "76%",
         "100%"
        ],
        "a": 2,
        "fb": "76% of the people who wrote about their feelings had healed, compared with 42% of the people who wrote about their daily plans."
       },
       {
        "q": "In Pennebaker's original study, students who wrote about hard experiences for 4 days did what over the next 6 months?",
        "o": [
         "Got better grades",
         "Visited the health center about half as often",
         "Slept 2 hours longer",
         "Lost weight"
        ],
        "a": 1,
        "fb": "One hour of honest writing in total, and about half as many doctor visits."
       },
       {
        "q": "What did the Baylor study find helps you fall asleep faster?",
        "o": [
         "Writing a to do list for the coming days",
         "Reading the news",
         "Writing about what you already finished",
         "Counting backwards"
        ],
        "a": 0,
        "fb": "The to do list group fell asleep about 9 minutes faster, and the more detailed the list, the faster they dropped off."
       },
       {
        "q": "What is the simplest gratitude practice from the lesson?",
        "o": [
         "Writing a letter every day",
         "3 good things at the end of the day",
         "A 1 hour journaling session",
         "Meditating on gratitude for 30 minutes"
        ],
        "a": 1,
        "fb": "Three things that went well today, even small ones. It trains your brain to look for what's working."
       },
       {
        "q": "What should you end every journal entry with?",
        "o": [
         "A list of your worries",
         "One next step",
         "A drawing",
         "Yesterday's entry"
        ],
        "a": 1,
        "fb": "One next step keeps you moving forward so you're not going around in circles."
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
      "mins": 5,
      "text": "Morning light, vitamin D and your body clock: how to get the right amount of sun safely.",
      "quiz": [
       {
        "q": "In the Swedish study of about 30,000 women, how did sun avoiders compare with those who got the most sun?",
        "o": [
         "They lived longer",
         "Roughly twice the death rate",
         "No difference",
         "Half the death rate"
        ],
        "a": 1,
        "fb": "Sun avoiders had roughly twice the death rate over 20 years. It's one study and can't prove cause, but it's striking."
       },
       {
        "q": "Spine surgery patients in brighter hospital rooms used how much less pain medication?",
        "o": [
         "2%",
         "22%",
         "60%",
         "None"
        ],
        "a": 1,
        "fb": "About 46% more sunlight, and 22% less pain medication every hour."
       },
       {
        "q": "When is the most important light of the day for your body clock?",
        "o": [
         "Midday",
         "Late afternoon",
         "Morning",
         "Just before bed"
        ],
        "a": 2,
        "fb": "15 to 30 minutes of morning light sets your clock, lifts your serotonin and lets melatonin rise on time that night."
       },
       {
        "q": "How does sunlight lower blood pressure, apart from vitamin D?",
        "o": [
         "It makes you sweat",
         "It releases nitric oxide from your skin, which relaxes blood vessels",
         "It slows your heart",
         "It thins your blood"
        ],
        "a": 1,
        "fb": "Edinburgh researchers found blood pressure came down within about 20 minutes."
       },
       {
        "q": "What is rule number 1 with the sun?",
        "o": [
         "Get as much as you can",
         "Only go out at noon",
         "Never burn",
         "Always wear a hat"
        ],
        "a": 2,
        "fb": "A burn is damage. Build up gradually with short, regular exposure."
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
        "fb": "Red light reaches a few millimetres, good for skin. Near-infrared travels several centimeters, reaching muscles and joints."
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
      "mins": 5,
      "text": "Slow, mindful time among trees. Why it calms the body and how to make it part of your week.",
      "quiz": [
       {
        "q": "After a 2 to 3 day forest trip, what happened to natural killer cell activity?",
        "o": [
         "It dropped by half",
         "It rose by about 50%",
         "It stayed the same",
         "It doubled every day"
        ],
        "a": 1,
        "fb": "Natural killer cells hunt virus infected and abnormal cells. Their activity rose by about half, and a matching city trip changed nothing."
       },
       {
        "q": "How long did the immune lift last after a longer forest trip?",
        "o": [
         "A few hours",
         "1 day",
         "Up to 30 days",
         "1 year"
        ],
        "a": 2,
        "fb": "Up to 30 days, which is why a forest day once a month keeps it switched on."
       },
       {
        "q": "What are phytoncides?",
        "o": [
         "A kind of pollen",
         "Natural oils trees release to protect themselves",
         "Forest soil bacteria",
         "A vitamin in leaves"
        ],
        "a": 1,
        "fb": "They are the scent of a pine or cedar forest. Breathing them in raised killer cells and lowered stress hormones."
       },
       {
        "q": "In the Stanford study, what did a 90 minute nature walk do that a walk beside a busy road did not?",
        "o": [
         "Burned more calories",
         "Reduced brooding and quieted a brain area that is overactive in depression",
         "Raised blood pressure",
         "Improved eyesight"
        ],
        "a": 1,
        "fb": "Only the nature walkers came back brooding less."
       },
       {
        "q": "How do you forest bathe?",
        "o": [
         "Hike as fast as you can",
         "Walk slowly, breathe deeply, phone away",
         "Run with headphones on",
         "Only in winter"
        ],
        "a": 1,
        "fb": "It isn't a hike. Slow down, breathe through your nose, or simply sit against a tree for 20 minutes."
       }
      ]
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
      "mins": 5,
      "text": "Your body does its deepest repair at night. Set up your room and evening routine for deep, restorative sleep.",
      "quiz": [
       {
        "q": "In the sleep lab study, caffeine taken 6 hours before bed did what?",
        "o": [
         "Nothing",
         "Cut sleep by more than 1 hour",
         "Helped people fall asleep",
         "Only affected dreams"
        ],
        "a": 1,
        "fb": "And people didn't notice. Caffeine has a half life of about 5 hours, so the cutoff is noon."
       },
       {
        "q": "What bedroom temperature supports deep sleep?",
        "o": [
         "60 to 62°F",
         "65 to 68°F",
         "72 to 75°F",
         "78 to 80°F"
        ],
        "a": 1,
        "fb": "Your core temperature has to drop 1 to 2 degrees to fall asleep, and a cool room lets it."
       },
       {
        "q": "What did ordinary room light in the evening do in the Harvard study?",
        "o": [
         "Nothing",
         "Raised melatonin",
         "Cut the melatonin window by about 90 minutes",
         "Improved deep sleep"
        ],
        "a": 2,
        "fb": "Use warm dim lamps for the last hour, blackout curtains, and keep your phone out of the bedroom."
       },
       {
        "q": "How long before bed should you finish eating?",
        "o": [
         "30 minutes",
         "1 hour",
         "About 3 hours",
         "It doesn't matter"
        ],
        "a": 2,
        "fb": "Digestion and body temperature need about 3 hours to wind down."
       },
       {
        "q": "Which habit anchors your whole body clock?",
        "o": [
         "Going to bed at 9",
         "The same wake time every day, weekends too",
         "A nap after lunch",
         "Sleeping in on Sundays"
        ],
        "a": 1,
        "fb": "Your wake time matters more than your bedtime."
       }
      ]
     },
     {
      "id": "air",
      "title": "Indoor air quality",
      "mins": 5,
      "text": "Simple ways to clean up the air you breathe at home: ventilation, plants, filters and what to avoid.",
      "quiz": [
       {
        "q": "About how much of your life do you spend indoors?",
        "o": [
         "30%",
         "50%",
         "70%",
         "90%"
        ],
        "a": 3,
        "fb": "About 90%, and the EPA says indoor air is often 2 to 5 times more polluted than outdoor air."
       },
       {
        "q": "What is the leading cause of lung cancer in people who have never smoked?",
        "o": [
         "Mold",
         "Radon",
         "Dust",
         "Pollen"
        ],
        "a": 1,
        "fb": "Radon causes about 21,000 US deaths a year. A test kit costs 15 to 30 dollars."
       },
       {
        "q": "What indoor humidity keeps mold away?",
        "o": [
         "10 to 20%",
         "40 to 50%",
         "65 to 75%",
         "Above 80%"
        ],
        "a": 1,
        "fb": "Above 60% the risk of mold climbs fast. A small humidity meter costs about 15 dollars."
       },
       {
        "q": "A closed bedroom can reach what carbon dioxide level by morning?",
        "o": [
         "About 420 ppm",
         "About 800 ppm",
         "2,000 ppm or more",
         "It stays the same as outside"
        ],
        "a": 2,
        "fb": "Outside air is about 420. Crack a window or leave the door open and aim for under 800."
       },
       {
        "q": "What does a true HEPA filter NOT remove?",
        "o": [
         "Fine particles",
         "Mold spores",
         "Pollen",
         "Gases, radon and carbon dioxide"
        ],
        "a": 3,
        "fb": "HEPA catches particles. Gases need activated carbon, and radon and CO2 need venting and fresh air."
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
      "mins": 9,
      "text": "How calming music lowers stress and supports rest-and-digest, and how to use it every day of your reset.",
      "quiz": [
       {
        "q": "What did the Lancet review of 73 surgery trials find about music?",
        "o": [
         "It distracted surgeons",
         "Less pain, less anxiety and fewer painkillers",
         "No effect",
         "It only worked for children"
        ],
        "a": 1,
        "fb": "About 7,000 patients, and it worked even under general anesthesia."
       },
       {
        "q": "Your favorite song releases dopamine at how many separate moments?",
        "o": [
         "1",
         "2",
         "5",
         "None"
        ],
        "a": 1,
        "fb": "Once in the build up, when your brain predicts what's coming, and again at the peak."
       },
       {
        "q": "What tempo is most calming music?",
        "o": [
         "20 to 40 beats a minute",
         "60 to 80 beats a minute",
         "120 to 140 beats a minute",
         "Over 160 beats a minute"
        ],
        "a": 1,
        "fb": "About the speed of a resting heartbeat. For sleep go under 60, for exercise 120 or more."
       },
       {
        "q": "What is the iso principle?",
        "o": [
         "Always play calm music",
         "Start with music that matches how you feel, then step it down",
         "Only listen with headphones",
         "Play the same song on repeat"
        ],
        "a": 1,
        "fb": "Jumping straight from stressed to calm rarely works. You take the stairs."
       },
       {
        "q": "How long was a typical music session in the clinical trials?",
        "o": [
         "2 minutes",
         "20 to 30 minutes",
         "2 hours",
         "All day"
        ],
        "a": 1,
        "fb": "Headphones on, eyes closed, really listening, for 20 to 30 minutes."
       },
       {
        "q": "What are the 3 parts of the daily 15 minute practice?",
        "o": [
         "Music, stillness and gratitude",
         "Running, lifting and stretching",
         "Reading, writing and talking",
         "Juice, water and rest"
        ],
        "a": 0,
        "fb": "Music that matches your mood then slows down, a few minutes of quiet, and 3 things you're grateful for."
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
        "q": "In the Diabetes Prevention Program, how did lifestyle change compare with metformin?",
        "o": [
         "The drug won easily",
         "They were equal",
         "Lifestyle cut diabetes risk by 58%, the drug by 31%",
         "Neither worked"
        ],
        "a": 2,
        "fb": "About 150 minutes of walking a week and a little weight loss nearly doubled the drug's result."
       },
       {
        "q": "Why does a walk after a meal lower blood sugar?",
        "o": [
         "It makes you sweat sugar out",
         "Working muscles pull sugar from the blood without needing insulin",
         "It slows digestion",
         "It raises insulin"
        ],
        "a": 1,
        "fb": "Working muscle has a second door called GLUT4 that doesn't need the insulin key. A 10 minute walk is enough."
       },
       {
        "q": "What is the weekly cardio target?",
        "o": [
         "30 minutes",
         "150 minutes",
         "500 minutes",
         "It doesn't matter"
        ],
        "a": 1,
        "fb": "150 minutes a week at a pace where you can still talk. If you're starting out, 10 minutes is a win."
       },
       {
        "q": "Why does muscle matter for blood sugar?",
        "o": [
         "It stores fat",
         "It is the biggest sugar sponge in your body",
         "It makes insulin",
         "It slows digestion"
        ],
        "a": 1,
        "fb": "Most of the sugar from a meal is soaked up by muscle, so more muscle means more room to put it away."
       },
       {
        "q": "What are the 5 moves in the strength plan?",
        "o": [
         "Squats, lunges, push ups, sit ups and shadow boxing",
         "Deadlifts, bench press, rows, curls and dips",
         "Running, cycling, swimming, rowing and hiking",
         "Yoga, pilates, stretching, tai chi and dance"
        ],
        "a": 0,
        "fb": "No gym needed. Two sessions a week, and a little bit more each week."
       },
       {
        "q": "What should you do for exercise during your cleanse week?",
        "o": [
         "Train as hard as possible",
         "Rest for the first 2 days, then only gentle walks",
         "Lift heavy every day",
         "Run every morning"
        ],
        "a": 1,
        "fb": "Your body is busy repairing. Build back up once you're eating again."
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
      "mins": 5,
      "text": "Eating less on a GLP-1 makes every meal count. How to hit your protein so you lose fat, not muscle, with high-protein whole foods that are easy on the stomach.",
      "quiz": [
       {
        "q": "Which hormone, the same one weight loss shots copy, does a high protein meal turn up?",
        "o": [
         "Insulin",
         "GLP-1",
         "Cortisol",
         "Melatonin"
        ],
        "a": 1,
        "fb": "Your gut makes its own GLP-1. Protein also turns down ghrelin, the hunger hormone."
       },
       {
        "q": "What are protein's 3 jobs?",
        "o": [
         "Energy, sweetness and fiber",
         "Fullness, costing more energy to digest, and protecting muscle",
         "Hydration, sleep and mood",
         "Storing fat, raising sugar and building bone"
        ],
        "a": 1,
        "fb": "Higher protein diets lost more fat and kept more muscle in the pooled weight loss trials."
       },
       {
        "q": "What is the simple protein rule in this course?",
        "o": [
         "10 grams a day",
         "30 grams at every meal",
         "100 grams at dinner",
         "Protein only on training days"
        ],
        "a": 1,
        "fb": "30 grams looks like a palm sized piece of meat or fish, or 4 to 5 eggs. Eat it first."
       },
       {
        "q": "What should you eat first on your plate?",
        "o": [
         "Bread",
         "Fruit",
         "The protein",
         "Dessert"
        ],
        "a": 2,
        "fb": "Protein first fills you up and steadies your blood sugar, then the vegetables."
       },
       {
        "q": "Why does protein matter even more when you lose weight fast or use a GLP-1?",
        "o": [
         "It speeds up weight loss",
         "It protects your muscle so the weight you lose is fat",
         "It replaces water",
         "It blocks the medication"
        ],
        "a": 1,
        "fb": "Muscle is the engine that keeps the weight off. Protein plus lifting is how you keep it."
       }
      ]
     },
     {
      "id": "hydration",
      "title": "High hydration",
      "mins": 2,
      "text": "How much water you need each day, when to drink it, and why it matters more as your protein goes up. Simple ways to hit your daily target, including on cleanse days.",
      "quiz": [
       {
        "q": "Fewer than how many Americans get enough potassium?",
        "o": [
         "1 in 2",
         "1 in 5",
         "1 in 20",
         "Nearly everyone gets enough"
        ],
        "a": 2,
        "fb": "Potassium helps steady your heart rhythm, blood pressure and muscles. You get it from vegetables, avocado and fish."
       },
       {
        "q": "What is often mistaken for hunger?",
        "o": [
         "Tiredness",
         "Thirst",
         "Cold",
         "Boredom only"
        ],
        "a": 1,
        "fb": "A lot of what we think is hunger is really thirst, so drink first."
       },
       {
        "q": "When does Mark drink a big glass of water?",
        "o": [
         "Only at dinner",
         "As soon as he gets up and before every meal",
         "Only after exercise",
         "Just before bed"
        ],
        "a": 1,
        "fb": "Your body needs plenty of water to process protein and keep digestion moving."
       }
      ]
     },
     {
      "id": "supplements",
      "title": "Nature's supplements & the pills worth taking",
      "mins": 5,
      "text": "The three foods that work like a multivitamin (oysters, beef liver and canned sardines), then the three pills that have earned a place: creatine, collagen with vitamin C, and lactoferrin. Food first, pills last.",
      "quiz": [
       {
        "q": "Which food has about 3 times your daily zinc in a 3 ounce serving?",
        "o": [
         "Chicken breast",
         "Oysters",
         "Spinach",
         "Rice"
        ],
        "a": 1,
        "fb": "Oysters have more zinc than any other food. Canned smoked oysters once or twice a week is plenty."
       },
       {
        "q": "Why is beef liver treated like a supplement and kept to a small serving about once a week?",
        "o": [
         "It is expensive",
         "It is very high in vitamin A, which builds up in your body",
         "It has no nutrients",
         "It is hard to digest"
        ],
        "a": 1,
        "fb": "A 3 ounce serving has almost 9 times your daily vitamin A. If you're pregnant, talk to your doctor before eating liver."
       },
       {
        "q": "What do you get from the soft bones in canned sardines?",
        "o": [
         "Zinc",
         "Calcium and vitamin D",
         "Vitamin C",
         "Fiber"
        ],
        "a": 1,
        "fb": "Plus protein, omega 3 fats and more than 3 days of B12 in a single can."
       },
       {
        "q": "What is the daily dose of creatine, and what does it need to work?",
        "o": [
         "20 grams, and nothing else",
         "3 to 5 grams, alongside strength training",
         "1 gram, with coffee",
         "50 grams, on rest days only"
        ],
        "a": 1,
        "fb": "Creatine without the training did nothing in the studies. Check with your doctor first if you have kidney disease."
       },
       {
        "q": "How does Mark rank the evidence for lactoferrin?",
        "o": [
         "Proven beyond doubt",
         "Promising but not proven",
         "Useless",
         "Dangerous"
        ],
        "a": 1,
        "fb": "Much of the research is early and done in the lab. Food comes first, then nature's supplements, then pills."
       }
      ]
     }
    ]
   }
  ]
 }
};
