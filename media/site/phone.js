/* =================================================================
   MARK TALKS HEALTH — "TEST DRIVE" PHONE
   A working mini version of the member app for the homepage and the
   sales pages. Five tabs: Today, Food, Exercise, Hub, Progress.
   Tap the tab bar or swipe left/right on the screen.

   Use on a page:   <div class="mthp" data-proto="gut"></div>
   data-proto:      gut | sugar | glp1 | all   (all = homepage, can switch protocol)
   Edit the words and numbers in PROTOS below; every page updates.
================================================================= */
(function(){
  if(window.MTHPhone) { window.MTHPhone.scan(); return; }
  var BASE="/media/site/";
  var PICS=["1-fasting","2-meditation","7-nature","6-sleep","5-music","4-cardio","3-high-protein"];

  /* ======================= YOUR CONTENT =======================
     Recipes: [emoji, name, kcal, protein g, carbs g, fat g, ingredients]
     Exercises: [name, sets, reps, load]
  ============================================================== */
  var PROTOS={
    gut:{
      name:"Gut Health Protocol", short:"Gut Health", fastGoal:16, fastNote:"Fat-burning shift · goal 16h",
      steps:["Fasting & cleanse","Meditation & journaling","Nature & sun","Sleep & clean air","Music & spirituality","Cardio & weights","High-protein diet"],
      days:[["Morning green juice","Avocado & nut cleanse meal","14-hour fasting window"],["10-minute meditation","Journal three lines","2 litres of water"],
            ["20 minutes of morning sun","Forest or park walk","Notice how calm you feel"],["No screens after 9pm","Lights out by 10:30","Log your sleep"],
            ["Music therapy session","Gratitude note","Morning green juice"],["Strength circuit","20-minute brisk walk","Rate your energy"],["Protein at every meal","3 litres of water","Day 7 check-in"]],
      food:{goal:1600, carbLabel:"Carbs", t:{p:130,c:110,f:55}, style:"High protein",
        meals:{
          Breakfast:[["🥑","Lemon & sea salt avocado",320,4,3,29,"1 avocado · lemon · sea salt · olive oil"],["🍳","Eggs, spinach & avocado",410,20,5,34,"3 eggs · spinach · ½ avocado · olive oil"],["🥬","Green juice + collagen",150,12,8,0,"Celery · cucumber · spinach · lemon · collagen"]],
          Lunch:[["🥗","Chicken & greens bowl",380,32,8,22,"Chicken · kale · zucchini · olive oil · herbs"],["🐟","Salmon & cucumber salad",450,32,6,32,"Salmon · cucumber · dill · olive oil · lemon"],["🥗","Chicken & avocado salad",470,36,7,32,"Chicken · romaine · avocado · olive oil"]],
          Dinner:[["🌰","⅓ cup macadamia nuts",320,4,2,34,"Macadamias · or walnuts, almonds, pecans"],["🍗","Herb chicken & roast zucchini",480,42,7,30,"Chicken thighs · zucchini · rosemary · ghee"],["🥩","Beef & cauliflower mash",520,40,8,36,"Grass-fed beef · cauliflower · butter · chives"]],
          Snack:[["🥚","2 boiled eggs",140,12,1,10,"Eggs · sea salt"],["🌰","Macadamias, small handful",200,2,2,21,"Macadamia nuts"],["🫒","Olives & cucumber",120,1,3,11,"Olives · cucumber"]]},
        shop:[["Produce",["Avocados ×6","Spinach","Cucumber","Zucchini","Lemons"]],["Protein",["Chicken thighs","Wild salmon","Greek yogurt","Eggs, dozen"]],["Pantry",["Coconut cream","Raw cacao","Olive oil","Collagen"]]]},
      move:{week:["Strength","Walk","Strength","Cardio","Strength","Walk","Rest"], today:2, name:"Strength A", mins:25, level:"Foundation", stepsGoal:8000,
        ex:[["Goblet squat",3,"10","8 kg"],["Incline push-up",3,"8","body"],["Glute bridge",3,"12","body"],["Bird dog",2,"10/side","body"],["Brisk walk",1,"20 min","easy"]], strength:false},
      chart:{title:"Bloating", sub:"Daily self-rating, 0–10", v:[82,74,60,48,40,32,26]},
      posts:[["🌸","Sarah","DAY 3","A high-protein breakfast is keeping me full all morning.",24],["🌊","James","DAY 5","First week in years without bloating after dinner. Small win!",41],["🍃","Priya","CLEANSE","Avocado for breakfast and macadamias for dinner. Simplest cleanse I've ever done.",18]]
    },
    sugar:{
      name:"Diabetes Protocol", short:"Diabetes", fastGoal:14, fastNote:"Overnight window · goal 14h",
      steps:["Eating window & fasting","Meditation & journaling","Nature: light & walking","Sleep & clean air","Music & spirituality","Movement after meals","High-protein food order"],
      days:[["14-hour overnight window","Protein-first breakfast","Log fasting reading"],["10-minute meditation","Walk after lunch","Log your reading"],
            ["Morning sun, 20 min","Nature walk after a meal","Notice your energy"],["No late-night snacks","Lights out by 10:30","Log your sleep"],
            ["Music therapy session","High-protein lunch","Log your reading"],["Walk after every meal","15-minute strength","Log your reading"],["Veg before carbs at lunch","10-minute walk after dinner","Day 7 check-in"]],
      food:{goal:1750, carbLabel:"Carbs", t:{p:130,c:120,f:65}, style:"High protein · food order",
        meals:{
          Breakfast:[["🍳","Eggs, greens & avocado",420,22,6,34,"2 eggs · spinach · ½ avocado · olive oil"],["🫐","Greek yogurt, berries & walnuts",380,24,18,22,"Greek yogurt · berries · walnuts · cinnamon"],["🥞","Almond-flour protein pancakes",400,30,12,24,"Almond flour · eggs · protein · berries"]],
          Lunch:[["🐟","Salmon salad, olive oil",520,38,10,36,"Salmon · greens · cucumber · olive oil"],["🍲","Chicken & lentil soup",460,36,30,14,"Chicken · lentils · carrot · celery"],["🥙","Turkey lettuce wraps",430,34,12,26,"Turkey · lettuce · avocado · tomato"]],
          Dinner:[["🍗","Chicken & roasted veg",540,45,22,28,"Chicken · broccoli · peppers · olive oil"],["🥩","Beef stir-fry, cauliflower rice",520,40,14,32,"Beef · cauliflower rice · bok choy · ginger"],["🐠","Cod, greens & sweet potato",500,38,34,18,"Cod · green beans · sweet potato"]],
          Snack:[["🍎","Apple & almond butter",190,5,18,12,"Apple · almond butter"],["🧀","Cheese & cucumber",150,9,3,11,"Cheddar · cucumber"],["🥜","Mixed nuts, small handful",180,5,5,16,"Almonds · walnuts"]]},
        shop:[["Produce",["Spinach","Broccoli","Berries","Cauliflower rice","Avocados ×4"]],["Protein",["Salmon","Chicken breast","Eggs, dozen","Greek yogurt"]],["Pantry",["Olive oil","Walnuts","Lentils","Cinnamon"]]]},
      move:{week:["Walk","Strength","Walk","Strength","Walk","Cardio","Rest"], today:2, name:"After-meal movement", mins:30, level:"Foundation", stepsGoal:8000,
        ex:[["Walk after breakfast",1,"10 min","easy"],["Chair squat",3,"12","body"],["Wall push-up",3,"10","body"],["Band row",3,"12","light"],["Walk after dinner",1,"10 min","easy"]], strength:false},
      chart:{title:"Morning glucose", sub:"Your meter readings, charted", v:[88,80,74,66,60,55,50]},
      posts:[["🌸","Linda","DAY 4","Walking after dinner brought my bedtime number right down.",33],["🌊","James","FAST","Finished a 14-hour window. Steadiest morning reading all month.",47],["☀️","Tom","DAY 2","Veg before carbs is such a simple change. Loving it.",19]]
    },
    glp1:{
      name:"GLP-1 Protocol", short:"GLP-1", fastGoal:12, fastNote:"Overnight window · goal 12h",
      steps:["Eating rhythm & fasting","Meditation & journaling","Nature: light & walking","Sleep & clean air","Music & spirituality","Strength & cardio","Protein-first nutrition"],
      days:[["12-hour overnight window","30 g protein breakfast","Log weight & dose day"],["10-minute meditation","Protein at every meal","Short walk after lunch"],
            ["Morning sun, 20 min","Nature walk","Notice your energy"],["Lights out by 10:30","No screens after 9pm","Log your sleep"],
            ["Music therapy session","High-protein lunch","Water + electrolytes"],["Strength test","Protein snack after training","Log your lifts"],["30 g protein breakfast","Water + electrolytes","Day 7 check-in"]],
      food:{goal:1500, carbLabel:"Carbs", t:{p:120,c:120,f:55}, style:"High-protein · muscle-protecting",
        meals:{
          Breakfast:[["🫐","Greek yogurt, berries & eggs",420,38,26,16,"Greek yogurt · berries · 2 eggs"],["🥞","Protein pancakes",390,34,38,10,"Oats · egg whites · protein · banana"],["🍳","Egg muffins, 3",330,27,6,21,"Eggs · spinach · peppers · feta"]],
          Lunch:[["🥗","Chicken salad, olive oil",450,42,14,24,"Chicken · greens · chickpeas · olive oil"],["🍚","Turkey & quinoa bowl",480,40,42,14,"Turkey · quinoa · peppers · salsa"],["🍲","Chicken & vegetable soup",360,36,18,14,"Chicken · carrot · celery · herbs"]],
          Dinner:[["🐟","Salmon & roasted veg",520,40,24,28,"Salmon · broccoli · sweet potato"],["🌶️","Lean beef chili",490,42,32,18,"Lean beef · beans · tomato · spices"],["🍗","Chicken stir-fry",470,44,30,16,"Chicken · rice noodles · bok choy"]],
          Snack:[["🥣","Greek yogurt & walnuts",190,20,8,9,"Greek yogurt · walnuts · cinnamon"],["🍍","Cottage cheese & pineapple",170,20,14,3,"Cottage cheese · pineapple"],["🥤","Protein shake",160,30,6,2,"Whey or plant protein · water"]]},
        shop:[["Produce",["Berries","Broccoli","Sweet potatoes","Greens","Peppers"]],["Protein",["Greek yogurt ×2","Chicken breast","Salmon","Eggs, dozen","Cottage cheese"]],["Pantry",["Protein powder","Quinoa","Olive oil","Electrolytes"]]]},
      move:{week:["Strength A","Cardio","Strength B","Walk","Strength A","Cardio","Rest"], today:2, name:"Strength B", mins:30, level:"Build", stepsGoal:7000,
        ex:[["Goblet squat",3,"10","12 kg"],["Dumbbell row",3,"10","10 kg"],["Floor press",3,"8","10 kg"],["Romanian deadlift",3,"10","14 kg"],["Plank",3,"30 s","body"]], strength:true},
      chart:{title:"Weight & muscle", sub:"Weekly weigh-ins, charted", v:[88,80,74,66,60,55,50]},
      posts:[["💪","Dana","WEEK 3","Strength index held at 100 while the scale dropped. Muscle kept!",38],["🌸","Rachel","DAY 3","The protein yogurt bowl got me through a low-appetite day.",22],["🌊","Mike","DAY 6","Electrolytes fixed my afternoon slump completely.",27]]
    }
  };
  var LIVE=["🧔","Mark","LIVE","Live Q&A this Thursday at 7pm. Bring your questions!",56];
  var WEEKDAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  /* ============================================================ */

  var CSS=':host{all:initial;display:block}\
.mthp{display:flex;flex-direction:column;align-items:center;font-family:Inter,system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}\
.mthp *{box-sizing:border-box;margin:0;padding:0}\
.mthp button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;text-align:left}\
.mthp-phone{width:min(290px,80vw);aspect-ratio:9/18.7;zoom:.92;border-radius:42px;background:#111;padding:10px;box-shadow:0 34px 70px rgba(43,39,36,.25);position:relative}\
.mthp-scr{width:100%;height:100%;border-radius:33px;background:#fffcf7;color:#2b2724;overflow:hidden;position:relative;font-size:11px;touch-action:pan-y;-webkit-user-select:none;user-select:none}\
.mthp-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:86px;height:22px;border-radius:12px;background:#111;z-index:6}\
.mthp-pane{position:absolute;inset:0;padding:38px 12px 64px;overflow:hidden;touch-action:pan-y;transform:translateX(100%);transition:transform .38s cubic-bezier(.3,.7,.2,1);background:#fffcf7}\
.mthp-pane::-webkit-scrollbar{display:none}\
.mthp-pane.left{transform:translateX(-100%)}.mthp-pane.on{transform:none}\
.mthp .k{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#c0623f;font-weight:700}\
.mthp .h{font-family:"Cormorant Garamond",Georgia,serif;font-size:22px;line-height:1;margin:2px 0 7px;font-weight:500}\
.mthp .c{border:1px solid #e7dccb;border-radius:12px;padding:8px;margin-bottom:6px;background:#fff}\
.mthp .row{display:flex;gap:9px;align-items:center}\
.mthp .sp{justify-content:space-between}\
.mthp .t{font-weight:700;font-size:11px}.mthp .s{color:#6e6259;font-size:9.5px;line-height:1.35}.mthp .xs{color:#8a7b6e;font-size:8.5px}\
.mthp .lbl{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#a8998b;font-weight:700;margin:7px 2px 4px}\
.mthp .days{display:flex;gap:4px;margin-bottom:7px}\
.mthp .days button{flex:1;aspect-ratio:1;border-radius:50%;border:1px solid #e7dccb;display:grid;place-items:center;font-size:9px;font-weight:700;color:#a8998b;transition:.2s;text-align:center}\
.mthp .days button.d{background:#e7ecdd;color:#7a8f6e;border-color:#d3dcc8}\
.mthp .days button.t{background:#c0623f;color:#fff;border-color:#c0623f;transform:scale(1.08)}\
.mthp .ring{width:56px;height:56px;flex:none;position:relative}\
.mthp .ring svg{width:100%;height:100%;transform:rotate(-90deg)}\
.mthp .ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;font-variant-numeric:tabular-nums;text-align:center;line-height:1.05}\
.mthp .ring b small{display:block;font-size:7.5px;font-weight:600;color:#8a7b6e}\
.mthp .ring.big{width:64px;height:64px}.mthp .ring.big b{font-size:15px}\
.mthp .chk{display:flex;gap:6px;align-items:center;padding:3.5px 0;font-size:10px;width:100%}\
.mthp .chk i{width:13px;height:13px;border-radius:4px;border:1.5px solid #dcc8ae;flex:none;transition:.2s;display:grid;place-items:center;color:#fff;font-style:normal;font-size:8px}\
.mthp .chk.on i{background:#7a8f6e;border-color:#7a8f6e}.mthp .chk.on i:after{content:"✓"}\
.mthp .chk.on span{color:#a8998b;text-decoration:line-through}\
.mthp .bar{height:5px;border-radius:5px;background:#ece0cf;overflow:hidden;margin-top:4px}.mthp .bar i{display:block;height:100%;background:#c0623f;border-radius:5px;transition:width .5s}\
.mthp .bar.g i{background:#7a8f6e}.mthp .bar.y i{background:#b8924a}\
.mthp .nx{display:flex;gap:8px;align-items:center;width:100%;border:1px solid #e7dccb;border-radius:12px;padding:5px 8px;margin-bottom:5px;background:#fff}\
.mthp .nx .e{width:26px;height:26px;border-radius:9px;background:#f6dccf;display:grid;place-items:center;font-size:15px;flex:none;background-size:cover;background-position:center}\
.mthp .nx .go{margin-left:auto;color:#c0623f;font-size:13px}\
.mthp .seg{display:flex;background:#f3ebdf;border-radius:999px;padding:2px;margin-bottom:7px}\
.mthp .seg button{flex:1;border-radius:999px;padding:5px 0;font-size:9.5px;font-weight:700;color:#8a7b6e;text-align:center}\
.mthp .seg button.on{background:#fff;color:#2b2724;box-shadow:0 1px 3px rgba(43,39,36,.12)}\
.mthp .eq{display:grid;grid-template-columns:repeat(4,auto);justify-content:space-between;text-align:center;font-size:7.5px;color:#8a7b6e;margin-top:6px}\
.mthp .eq b{display:block;font-size:10.5px;color:#2b2724;font-variant-numeric:tabular-nums}\
.mthp .mac{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}\
.mthp .mac .xs b{color:#2b2724;font-variant-numeric:tabular-nums}\
.mthp .meal{display:flex;gap:7px;align-items:center;padding:4px 0;border-bottom:1px solid #f0e8dc}.mthp .meal:last-child{border:0}\
.mthp .meal .e{width:28px;height:28px;border-radius:10px;background:#f6dccf;display:grid;place-items:center;font-size:16px;flex:none}\
.mthp .meal .nm{flex:1;min-width:0}\
.mthp .meal .nm .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}\
.mthp .ib{width:24px;height:24px;border-radius:50%;border:1px solid #e7dccb;display:grid!important;place-items:center;font-size:11px;color:#8a7b6e;flex:none;text-align:center!important;transition:.2s}\
.mthp .ib.on{background:#7a8f6e;border-color:#7a8f6e;color:#fff}\
.mthp .ib.sw.spin{animation:mthpSpin .4s}\
.mthp .water{display:flex;gap:4px;margin-top:6px}\
.mthp .water button{flex:1;height:22px;border-radius:5px 5px 8px 8px;border:1.5px solid #c9d6e0;background:#fff;transition:.2s}\
.mthp .water button.on{background:#9db7c9;border-color:#9db7c9}\
.mthp .wk{display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid #f0e8dc}.mthp .wk:last-child{border:0}\
.mthp .wk .dd{width:28px;font-weight:700;font-size:9.5px}.mthp .wk .em{flex:1;font-size:13px;letter-spacing:2px}\
.mthp .wk.td .dd{color:#c0623f}\
.mthp .pill{display:block;width:100%;text-align:center!important;border-radius:999px;padding:7px;font-size:10px;font-weight:700;background:#2b2724;color:#fff!important;margin:2px 0 8px}\
.mthp .pill.t2{background:#c0623f}\
.mthp .wstrip{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:7px}\
.mthp .wstrip button{border:1px solid #e7dccb;border-radius:9px;padding:5px 0 4px;text-align:center!important;font-size:7.5px;color:#8a7b6e;background:#fff;line-height:1.3}\
.mthp .wstrip button b{display:block;font-size:12px;line-height:1.2}\
.mthp .wstrip button.on{background:#2b2724;color:#fff;border-color:#2b2724}\
.mthp .wstrip button.dn{background:#e7ecdd;border-color:#d3dcc8;color:#7a8f6e}\
.mthp .ex{padding:4px 0;border-bottom:1px solid #f0e8dc}.mthp .ex:last-child{border:0}\
.mthp .sets{display:flex;gap:4px;margin-top:3px}\
.mthp .sets button{min-width:38px;height:20px;border-radius:999px;border:1px solid #e7dccb;font-size:8.5px;font-weight:700;color:#8a7b6e;text-align:center!important;padding:0 6px;transition:.2s;font-variant-numeric:tabular-nums}\
.mthp .sets button.on{background:#c0623f;border-color:#c0623f;color:#fff}\
.mthp .tag{display:inline-block;font-size:7.5px;font-weight:700;letter-spacing:.06em;border-radius:4px;padding:2px 6px;background:#f6dccf;color:#a8522f;margin-right:4px}\
.mthp .tag.g{background:#e7ecdd;color:#5f7355}\
.mthp .rest{position:absolute;left:10px;right:10px;bottom:66px;z-index:6;background:#2b2724;color:#fff;border-radius:12px;padding:8px 10px;display:flex;align-items:center;gap:8px;transform:translateY(130%);opacity:0;transition:.3s;pointer-events:none}\
.mthp .rest.on{transform:none;opacity:1;pointer-events:auto}\
.mthp .rest b{font-size:15px;font-variant-numeric:tabular-nums}\
.mthp .rest .bar{flex:1;background:#4a433d;margin:0}.mthp .rest .bar i{transition:width 1s linear}\
.mthp .rest button{color:#e3a184;font-weight:700;font-size:9.5px}\
.mthp .compose{display:flex;align-items:center;gap:7px;border:1px solid #e7dccb;border-radius:999px;padding:5px 5px 5px 10px;margin-bottom:9px;background:#fff;width:100%;color:#a8998b;font-size:9.5px}\
.mthp .compose b{margin-left:auto;background:#c0623f;color:#fff;border-radius:999px;padding:4px 9px;font-size:9px}\
.mthp .post{background:#f7f1e7;border-radius:12px;padding:9px;margin-bottom:7px;font-size:9.8px;line-height:1.4;animation:mthpIn .35s}\
.mthp .post .av{width:22px;height:22px;border-radius:50%;background:#efe5d6;display:grid;place-items:center;flex:none;font-size:11px}\
.mthp .post .tg{font-size:7.5px;font-weight:700;letter-spacing:.06em;color:#7a8f6e;background:#e7ecdd;border-radius:4px;padding:1px 5px;margin-left:5px}\
.mthp .post .tg.lv{color:#fff;background:#c0623f}\
.mthp .like{margin-top:5px;font-size:9.5px;color:#8a7b6e;display:inline-flex;gap:4px;align-items:center}\
.mthp .like.on{color:#c0623f}.mthp .like.on b{animation:mthpPop .3s}\
.mthp .live{border-radius:12px;aspect-ratio:16/10;background:#2b2724 url('+BASE+'steps/2-meditation.jpg) center/cover;position:relative;margin-bottom:8px;display:flex;align-items:flex-end;padding:8px;color:#fff}\
.mthp .live:before{content:"";position:absolute;inset:0;border-radius:12px;background:linear-gradient(180deg,transparent 30%,rgba(0,0,0,.65))}\
.mthp .live *{position:relative}.mthp .live .badge{position:absolute;top:8px;left:8px;background:#c0623f;font-size:7.5px;font-weight:700;letter-spacing:.08em;padding:2px 6px;border-radius:4px}\
.mthp .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}\
.mthp .stats div{background:#f7f1e7;border-radius:10px;padding:7px 4px;text-align:center}\
.mthp .stats b{display:block;font-family:"Cormorant Garamond",Georgia,serif;font-size:20px;line-height:1;color:#c0623f}\
.mthp .stats span{font-size:8px;color:#8a7b6e}\
.mthp .spark{height:56px;display:flex;align-items:flex-end;gap:5px;margin-top:8px}\
.mthp .spark span{flex:1;border-radius:4px 4px 0 0;background:#ece0cf;transition:height .8s ease;height:10%}.mthp .spark span.on{background:#c0623f}\
.mthp .line{width:100%;height:58px;margin-top:6px;display:block}\
.mthp .line path.ln{stroke-dasharray:400;stroke-dashoffset:400;transition:stroke-dashoffset 1.2s ease}\
.mthp .line.go path.ln{stroke-dashoffset:0}\
.mthp .badges{display:flex;gap:6px}\
.mthp .badges span{flex:1;text-align:center;background:#f7f1e7;border-radius:10px;padding:7px 2px;font-size:7.5px;color:#8a7b6e;line-height:1.3}\
.mthp .badges span b{display:block;font-size:15px;margin-bottom:2px;filter:grayscale(1);opacity:.45}\
.mthp .badges span.on{background:#fbefe7;color:#a8522f}.mthp .badges span.on b{filter:none;opacity:1}\
.mthp .crs{display:flex;gap:5px;margin-bottom:6px}\
.mthp .crs button{flex:1;border:1px solid #e7dccb;border-radius:10px;padding:6px 3px;font-size:8.5px;font-weight:700;background:#fff;color:#6e6259;line-height:1.2;text-align:center!important}\
.mthp .crs button.on{background:#2b2724;border-color:#2b2724;color:#fff}\
.mthp-scr:after{content:"";position:absolute;left:0;right:0;bottom:58px;height:22px;background:linear-gradient(rgba(255,252,247,0),#fffcf7);z-index:4;pointer-events:none}\
.mthp-tabs{position:absolute;left:0;right:0;bottom:0;height:58px;padding-bottom:6px;border-top:1px solid #efe5d6;background:rgba(255,252,247,.97);display:grid;grid-template-columns:repeat(5,1fr);z-index:5}\
.mthp-tabs button{font-size:8.5px;font-weight:700;color:#a8998b;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;position:relative;transition:color .2s;text-align:center}\
.mthp-tabs svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .2s}\
.mthp-tabs button.on{color:#c0623f}.mthp-tabs button.on svg{transform:translateY(-1px) scale(1.08)}\
.mthp-tabs button.on:before{content:"";position:absolute;top:0;width:22px;height:2.5px;border-radius:0 0 3px 3px;background:#c0623f}\
.mthp-tabs .dot{position:absolute;top:7px;right:calc(50% - 13px);width:6px;height:6px;border-radius:50%;background:#c0623f;border:1.5px solid #fffcf7}\
.mthp-sheet{position:absolute;inset:0;z-index:7;background:rgba(43,39,36,.35);display:flex;align-items:flex-end;opacity:0;pointer-events:none;transition:opacity .25s}\
.mthp-sheet.on{opacity:1;pointer-events:auto}\
.mthp-sheet>div{background:#fffcf7;width:100%;border-radius:20px 20px 0 0;padding:12px 13px 18px;transform:translateY(100%);transition:transform .3s cubic-bezier(.3,.7,.2,1);max-height:88%;overflow-y:auto;scrollbar-width:none}\
.mthp-sheet.on>div{transform:none}\
.mthp-sheet .pic{aspect-ratio:16/9;border-radius:12px;background:#efe5d6 center/cover;margin-bottom:9px;position:relative}\
.mthp-sheet .pic.v:after{content:"▶";position:absolute;inset:0;margin:auto;width:34px;height:34px;border-radius:50%;background:rgba(255,252,247,.9);color:#c0623f;display:grid;place-items:center;font-size:12px;padding-left:2px}\
.mthp-sheet .big{font-size:42px;text-align:center;background:#f6dccf;border-radius:14px;padding:12px 0;margin-bottom:9px}\
.mthp-sheet .btn{display:block;width:100%;margin-top:10px;background:#c0623f;color:#fff;border-radius:999px;padding:8px;font-size:10.5px;font-weight:700;text-align:center}\
.mthp-sheet .x{position:absolute;right:0;top:0;width:24px;height:24px;border-radius:50%;background:#f3ebdf;font-size:11px;text-align:center}\
.mthp-toast{position:absolute;left:12px;right:12px;top:40px;z-index:8;background:#2b2724;color:#fff;border-radius:12px;padding:8px 10px;font-size:9.8px;line-height:1.35;text-align:center;opacity:0;transform:translateY(-8px);transition:.25s;pointer-events:none}\
.mthp-toast.on{opacity:1;transform:none}\
.mthp-hint{font-size:12px;color:#a8998b;margin-top:14px;display:flex;align-items:center;gap:8px;text-align:center}\
.mthp-hint i{display:inline-block;font-style:normal;animation:mthpSwipe 2.2s ease-in-out infinite}\
@keyframes mthpSwipe{0%,100%{transform:translateX(0)}50%{transform:translateX(-7px)}}\
@keyframes mthpIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}\
@keyframes mthpPop{50%{transform:scale(1.35)}}\
@keyframes mthpSpin{to{transform:rotate(180deg)}}\
@media (prefers-reduced-motion:reduce){.mthp-pane,.mthp-sheet>div{transition:none}.mthp-hint i{animation:none}}';

  var ICON={
    today:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
    food:'<svg viewBox="0 0 24 24"><path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M5 3v6a2 2 0 0 0 2 2M11 3v6a2 2 0 0 1-2 2"/><path d="M17 21V3c-2.2 1.2-3.5 3.6-3.5 7 0 2 1.5 3 3.5 3"/></svg>',
    exercise:'<svg viewBox="0 0 24 24"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
    hub:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.6.2 4.5 2.1 4.5 4.9"/></svg>',
    progress:'<svg viewBox="0 0 24 24"><path d="M3 20h18"/><path d="M5 16l4.5-5 3.5 3 6-7"/><path d="M15 7h4v4"/></svg>'
  };
  var TABS=[["today","Today"],["food","Food"],["exercise","Exercise"],["hub","Hub"],["progress","Progress"]];
  var MEALS=["Breakfast","Lunch","Dinner","Snack"];
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
  var fmt=function(n){ return Math.round(n).toLocaleString("en-US"); };
  function ringSvg(frac,col,cls){ var C=144.5; return '<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="23" fill="none" stroke="#ece0cf" stroke-width="6"/><circle class="'+(cls||"")+'" cx="28" cy="28" r="23" fill="none" stroke="'+(col||"#c0623f")+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-Math.max(0,Math.min(1,frac)))).toFixed(1)+'" style="transition:stroke-dashoffset .6s"/></svg>'; }

  function build(root){
    if(root.__mthp) return; root.__mthp=1;
    var all=root.getAttribute("data-proto")==="all";
    var key=all?"gut":(PROTOS[root.getAttribute("data-proto")]?root.getAttribute("data-proto"):"gut");
    var tab=0, day=2, auto=true, hubMode=0, foodMode=0, posted=false, sec=0, steps=0;
    var done, pick, eaten, water, bought, logged, weekPick, restT=null;
    function seed(){
      done={}; for(var d=0;d<7;d++) for(var j=0;j<3;j++) if(d<2||(d===2&&j<1)) done[d+"-"+j]=true;
      pick={Breakfast:0,Lunch:0,Dinner:0,Snack:0}; eaten={Breakfast:true}; water=3; bought={}; logged={};
      weekPick=[0,1,2,3,4,5,6].map(function(d){ return [d%3,(d+1)%3,(d+2)%3]; });
      steps=Math.round(P().move.stepsGoal*.62);
    }
    var P=function(){ return PROTOS[key]; };
    seed();

    /* shadow DOM keeps the page's styles out of the phone (and ours out of the page) */
    var sh=root.attachShadow?root.attachShadow({mode:"open"}):root;
    sh.innerHTML='<style>'+CSS+'</style><div class="mthp"><div class="mthp-phone"><div class="mthp-scr" role="region" aria-label="App preview: tap the tabs or swipe to explore"><span class="mthp-notch"></span>'+
      TABS.map(function(t,i){ return '<div class="mthp-pane'+(i===0?' on':'')+'" data-p="'+i+'" role="tabpanel" aria-label="'+t[1]+'"></div>'; }).join("")+
      '<div class="rest"><b class="rt">0:45</b><div class="bar"><i style="width:100%"></i></div><button class="skip">Skip rest</button></div>'+
      '<div class="mthp-tabs" role="tablist">'+TABS.map(function(t,i){ return '<button role="tab" aria-selected="'+(i===0)+'" class="'+(i===0?'on':'')+'" data-t="'+i+'">'+ICON[t[0]]+t[1]+(t[0]==="hub"?'<span class="dot"></span>':'')+'</button>'; }).join("")+'</div>'+
      '<div class="mthp-sheet"><div style="position:relative"></div></div><div class="mthp-toast"></div></div></div>'+
      (root.getAttribute("data-hint")==="off"?'':'<div class="mthp-hint"><i>👆</i>Tap the tabs or swipe to test-drive the app</div>')+'</div>';
    var scr=sh.querySelector(".mthp-scr"), panes=[].slice.call(sh.querySelectorAll(".mthp-pane")), tabs=[].slice.call(sh.querySelectorAll(".mthp-tabs button"));
    var sheet=sh.querySelector(".mthp-sheet"), toastEl=sh.querySelector(".mthp-toast"), restEl=sh.querySelector(".rest");

    function toast(msg){ toastEl.textContent=msg; toastEl.classList.add("on"); clearTimeout(toastEl._t); toastEl._t=setTimeout(function(){toastEl.classList.remove("on");},2200); }
    function stop(){ auto=false; }

    /* ---------- numbers ---------- */
    function recipe(m){ return P().food.meals[m][pick[m]]; }
    function totals(){ var t={k:0,p:0,c:0,f:0,plan:0}; MEALS.forEach(function(m){ var r=recipe(m); t.plan+=r[2]; if(eaten[m]){ t.k+=r[2]; t.p+=r[3]; t.c+=r[4]; t.f+=r[5]; } }); return t; }
    function setsTotal(){ return P().move.ex.slice(0,4).reduce(function(a,e){return a+e[1];},0); }
    function setsDone(){ return Object.keys(logged).length; }
    function burned(){ return Math.round(setsDone()/setsTotal()*180+steps*0.035); }

    /* ---------- TODAY ---------- */
    function rToday(){ var p=P(), items=p.days[day], n=items.filter(function(x,j){return done[day+"-"+j];}).length;
      var next=MEALS.filter(function(m){return !eaten[m];})[0], r=next?recipe(next):null, t=totals(), mv=p.move;
      panes[0].innerHTML=(all?'<div class="crs">'+["gut","sugar","glp1"].map(function(k){ return '<button class="'+(k===key?'on':'')+'" data-k="'+k+'">'+esc(PROTOS[k].short)+'</button>'; }).join("")+'</div>':'')+
        '<div class="k">'+esc(p.name)+'</div><div class="h">Day '+(day+1)+' of 7</div>'+
        '<div class="days">'+[0,1,2,3,4,5,6].map(function(d){ var full=[0,1,2].every(function(j){return done[d+"-"+j];}); return '<button aria-label="Day '+(d+1)+'" class="'+(d===day?'t':full?'d':'')+'" data-day="'+d+'">'+(d+1)+'</button>'; }).join("")+'</div>'+
        '<div class="c row"><div class="ring">'+ringSvg(.88,"#c0623f","rg")+'<b class="hr">14:02</b></div><div><div class="t">Fasting clock</div><div class="s">'+esc(p.fastNote)+'</div></div></div>'+
        '<div class="lbl">Up next</div>'+
        (r?'<button class="nx" data-go="1"><span class="e">'+r[0]+'</span><span><span class="t" style="display:block">'+esc(next)+' · '+r[2]+' kcal</span><span class="s">'+esc(r[1])+'</span></span><span class="go">›</span></button>'
          :'<button class="nx" data-go="1"><span class="e">✓</span><span><span class="t" style="display:block">All meals logged</span><span class="s">'+fmt(t.k)+' of '+fmt(p.food.goal)+' kcal</span></span><span class="go">›</span></button>')+
        '<button class="nx" data-go="2"><span class="e" style="background:#e7ecdd">🏋️</span><span><span class="t" style="display:block">'+esc(mv.name)+' · '+mv.mins+' min</span><span class="s">'+setsDone()+' of '+setsTotal()+' sets logged</span></span><span class="go">›</span></button>'+
        '<button class="nx" data-m="'+day+'"><span class="e" style="background-image:url('+BASE+'steps/'+PICS[day]+'.jpg)"></span><span><span class="t" style="display:block">Lesson '+(day+1)+' · '+esc(p.steps[day])+'</span><span class="s">Video · '+(5+day%3)+' min</span></span><span class="go">▶</span></button>'+
        '<div class="c" style="margin-top:4px"><div class="row sp"><span class="t">Daily habits</span><span class="xs">'+n+' of 3</span></div>'+
          items.map(function(x,j){ return '<button class="chk'+(done[day+"-"+j]?' on':'')+'" data-j="'+j+'"><i></i><span>'+esc(x)+'</span></button>'; }).join("")+'</div>';
      clock(); }

    /* ---------- FOOD ---------- */
    function rFood(){ var p=P(), F=p.food, t=totals(), b=burned(), left=F.goal-t.k;
      var head='<div class="k">Food · '+esc(F.style)+'</div><div class="h">Your meal plan</div>'+
        '<div class="seg">'+["Today","Week","Shopping"].map(function(s,i){ return '<button class="'+(foodMode===i?'on':'')+'" data-fm="'+i+'">'+s+'</button>'; }).join("")+'</div>';
      if(foodMode===0){
        panes[1].innerHTML=head+
          '<div class="c"><div class="row"><div class="ring big">'+ringSvg(t.k/F.goal,"#c0623f")+'<b>'+fmt(Math.max(0,left))+'<small>kcal left</small></b></div>'+
            '<div style="flex:1"><div class="eq"><span><b>'+fmt(F.goal)+'</b>Goal</span><span><b>−'+fmt(t.k)+'</b>Food</span><span><b>'+fmt(b)+'</b>Burned</span><span><b>'+fmt(Math.max(0,left))+'</b>Left</span></div>'+
            '<div class="xs" style="margin-top:5px">Exercise is already built into your goal.</div></div></div>'+
            '<div class="mac">'+[["Protein","p",""],[F.carbLabel,"c"," y"],["Fat","f"," g"]].map(function(m){ return '<div><div class="xs">'+m[0]+'</div><div class="bar'+m[2]+'"><i style="width:'+Math.min(100,t[m[1]]/F.t[m[1]]*100)+'%"></i></div><div class="xs"><b>'+Math.round(t[m[1]])+'</b> / '+F.t[m[1]]+' g</div></div>'; }).join("")+'</div></div>'+
          '<div class="c" style="padding:3px 9px">'+MEALS.map(function(m){ var r=recipe(m);
            return '<div class="meal"><span class="e">'+r[0]+'</span><button class="nm" data-r="'+m+'"><span class="xs">'+m+' · '+r[2]+' kcal</span><span class="t">'+esc(r[1])+'</span><span class="xs">P '+r[3]+' · '+(F.carbLabel==="Net carbs"?"NC ":"C ")+r[4]+' · F '+r[5]+'</span></button>'+
              '<button class="ib sw" data-sw="'+m+'" aria-label="Swap '+m+'">⇄</button><button class="ib'+(eaten[m]?' on':'')+'" data-eat="'+m+'" aria-label="Mark '+m+' eaten">✓</button></div>'; }).join("")+'</div>'+
          '<div class="c"><div class="row sp"><span class="t">Water</span><span class="xs">'+water+' of 8 glasses</span></div><div class="water">'+[0,1,2,3,4,5,6,7].map(function(i){ return '<button class="'+(i<water?'on':'')+'" data-w="'+i+'" aria-label="Glass '+(i+1)+'"></button>'; }).join("")+'</div></div>';
      } else if(foodMode===1){
        var avg=0;
        var rows=WEEKDAYS.map(function(d,i){ var k=0, em=""; MEALS.forEach(function(m,j){ var r=F.meals[m][j<3?weekPick[i][j]:i%3]; k+=r[2]; if(j<3) em+=r[0]; }); avg+=k;
          return '<div class="wk'+(i===day%7?' td':'')+'"><span class="dd">'+d+'</span><span class="em">'+em+'</span><span class="xs"><b style="color:#2b2724">'+fmt(k)+'</b> kcal</span></div>'; }).join("");
        panes[1].innerHTML=head+'<div class="c" style="padding:3px 9px">'+rows+'</div>'+
          '<div class="row sp" style="margin:0 2px 8px"><span class="xs">Average '+fmt(avg/7)+' kcal a day</span><span class="xs">Goal '+fmt(F.goal)+'</span></div>'+
          '<button class="pill shuffle">⇄ New week of meals</button><button class="pill t2" data-fm="2">🛒 Build my shopping list</button>';
      } else {
        var total=0, got=0;
        var html=F.shop.map(function(g,gi){ return '<div class="lbl">'+g[0]+'</div><div class="c" style="padding:3px 9px">'+g[1].map(function(it,ii){ var id=gi+"-"+ii; total++; if(bought[id]) got++;
          return '<button class="chk'+(bought[id]?' on':'')+'" data-b="'+id+'" style="padding:2.5px 0"><i></i><span>'+esc(it)+'</span></button>'; }).join("")+'</div>'; }).join("");
        panes[1].innerHTML=head+'<div class="c"><div class="row sp"><span class="t">This week’s list</span><span class="xs">'+got+' of '+total+' bought</span></div><div class="bar g"><i style="width:'+(got/total*100)+'%"></i></div><div class="xs" style="margin-top:4px">Built from your meal plan. Swap a meal and it updates.</div></div>'+html;
      } }

    /* ---------- EXERCISE ---------- */
    function rExercise(){ var p=P(), M=p.move, sd=setsDone(), st=setsTotal(), si=100+Math.round(sd/st*4);
      var ICN={Strength:"🏋️","Strength A":"🏋️","Strength B":"🏋️",Cardio:"🚴",Walk:"🚶",Rest:"😌"};
      panes[2].innerHTML='<div class="k">Exercise · this week</div><div class="h">'+esc(M.name)+'</div>'+
        '<div class="wstrip">'+M.week.map(function(w,i){ return '<button class="'+(i===M.today?'on':i<M.today?'dn':'')+'" data-wd="'+i+'"><b>'+(ICN[w]||"•")+'</b>'+WEEKDAYS[i]+'</button>'; }).join("")+'</div>'+
        '<div class="c"><div class="row sp" style="margin-bottom:2px"><span><span class="tag">'+M.mins+' MIN</span><span class="tag g">LEVEL: '+esc(M.level.toUpperCase())+'</span></span><span class="xs">'+sd+'/'+st+' sets</span></div>'+
          '<div class="bar"><i style="width:'+(sd/st*100)+'%"></i></div>'+
          M.ex.slice(0,4).map(function(e,ei){ return '<div class="ex"><div class="row sp"><span class="t">'+esc(e[0])+'</span><span class="xs">'+e[1]+' × '+esc(e[2])+(e[3]!=="body"&&e[3]!=="easy"?' · '+esc(e[3]):'')+'</span></div>'+
            '<div class="sets">'+Array.apply(null,{length:e[1]}).map(function(_,si2){ var id=ei+"-"+si2; return '<button class="'+(logged[id]?'on':'')+'" data-set="'+id+'">'+(logged[id]?'✓ ':'')+(e[1]>1?'Set '+(si2+1):'Done')+'</button>'; }).join("")+'</div></div>'; }).join("")+(M.ex.length>4?'<div class="xs" style="padding-top:4px">+ '+(M.ex.length-4)+' more · warm-up and cool-down included</div>':'')+'</div>'+
        '<div class="c row"><div class="ring">'+ringSvg(steps/M.stepsGoal,"#7a8f6e")+'<b style="font-size:10px">'+fmt(steps)+'<small>steps</small></b></div><div style="flex:1"><div class="t">Steps & activity</div><div class="s">Goal '+fmt(M.stepsGoal)+' · about '+fmt(burned())+' kcal burned today</div><button class="xs addw" style="color:#c0623f;font-weight:700;margin-top:4px">+ Log a 10-min walk</button></div></div>'+
        (M.strength?
          '<div class="c"><div class="row sp"><span class="t">Strength index</span><span class="tag g">MUSCLE KEPT</span></div><div class="row" style="align-items:flex-end;gap:6px;margin-top:4px"><b style="font-family:Cormorant Garamond,Georgia,serif;font-size:30px;line-height:1;color:#c0623f">'+si+'</b><span class="xs" style="margin-bottom:4px">baseline 100 · retest every 2 weeks</span></div><div class="s" style="margin-top:3px">Curls and squats to failure. If it drops, the plan adds protein and an extra session.</div></div>'
          :'<div class="c"><div class="row sp"><span class="t">Weekly movement</span><span class="xs">'+(85+sd*3)+' of 150 min</span></div><div class="bar g"><i style="width:'+Math.min(100,(85+sd*3)/150*100)+'%"></i></div><div class="s" style="margin-top:4px">Levels up automatically as you get stronger.</div></div>'); }

    /* ---------- HUB ---------- */
    function rHub(){ var p=P();
      var feed=(posted?[["😊","You","DAY "+(day+1),"Checked in: "+p.days[day][0].toLowerCase()+" done ✓",0]]:[]).concat(p.posts);
      panes[3].innerHTML='<div class="k">The Healing Hub</div><div class="h">Community</div>'+
        '<div class="seg"><button class="'+(hubMode===0?'on':'')+'" data-h="0">Feed</button><button class="'+(hubMode===1?'on':'')+'" data-h="1">Live</button></div>'+
        (hubMode===0?
          '<button class="compose">Share your check-in…<b>'+(posted?'Posted':'Post')+'</b></button>'+
          feed.map(function(x){ return '<div class="post"><div class="row" style="gap:7px;margin-bottom:3px"><span class="av">'+x[0]+'</span><b>'+esc(x[1])+'</b><span class="tg">'+esc(x[2])+'</span></div>'+esc(x[3])+'<br><button class="like" data-l="'+x[4]+'"><b>♡</b><span>'+x[4]+'</span></button></div>'; }).join("")
        :
          '<div class="live"><span class="badge">THURSDAY · 7PM</span><div><div class="t" style="color:#fff">Live Q&amp;A with Mark</div><div class="s" style="color:#e9dfd3">Fasting, food and your questions</div></div></div>'+
          '<button class="compose remind">Remind me when it starts<b>Remind</b></button>'+
          '<div class="post"><div class="row" style="gap:7px;margin-bottom:3px"><span class="av">'+LIVE[0]+'</span><b>'+LIVE[1]+'</b><span class="tg lv">'+LIVE[2]+'</span></div>'+esc(LIVE[3])+'<br><button class="like" data-l="'+LIVE[4]+'"><b>♡</b><span>'+LIVE[4]+'</span></button></div>'+
          '<div class="c"><div class="t">Replays</div><div class="s">Every past live, saved for members</div></div>'); }

    /* ---------- PROGRESS ---------- */
    function rProgress(){ var p=P(), ch=p.chart, t=totals();
      var meals=MEALS.filter(function(m){return eaten[m];}).length+6, wk=setsDone()===setsTotal()?3:2;
      var wv=[0,8,14,22,27,33,40], pts=wv.map(function(v,i){ return [8+i*(224/6), 10+v]; });
      var d="M"+pts.map(function(q){return q[0].toFixed(1)+" "+q[1];}).join(" L");
      panes[4].innerHTML='<div class="k">Progress · example</div><div class="h">Your week</div>'+
        '<div class="stats"><div><b>'+(day+1)+'</b><span>day streak</span></div><div><b>'+meals+'</b><span>meals logged</span></div><div><b>'+wk+'</b><span>workouts</span></div></div>'+
        '<div class="c"><div class="row sp"><span class="t">Weight</span><span class="tag g">−1.8 KG</span></div><div class="s">Weigh-ins, charted for you</div>'+
          '<svg class="line" viewBox="0 0 240 58" preserveAspectRatio="none"><path d="'+d+' L232 58 L8 58Z" fill="#f6dccf" opacity=".6"/><path class="ln" d="'+d+'" fill="none" stroke="#c0623f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'+
        '<div class="c"><div class="t">'+esc(ch.title)+'</div><div class="s">'+esc(ch.sub)+'</div><div class="spark">'+ch.v.map(function(){return '<span></span>';}).join("")+'</div>'+
          '<div class="xs" style="display:flex;justify-content:space-between;margin-top:3px"><span>Day 1</span><span>Day 7</span></div></div>'+
        '<div class="lbl">Milestones</div><div class="badges">'+[["🔥","3-day streak",day>=2],["🥗","Meal plan on track",MEALS.every(function(m){return eaten[m];})],["💪","Workout done",setsDone()===setsTotal()],["💧","8 glasses",water>=8]].map(function(b){ return '<span class="'+(b[2]?'on':'')+'"><b>'+b[0]+'</b>'+b[1]+'</span>'; }).join("")+'</div>'; }
    function anim(){ var v=P().chart.v; [].forEach.call(panes[4].querySelectorAll(".spark span"),function(s,i){ s.style.height="10%"; s.classList.remove("on"); setTimeout(function(){ s.style.height=v[i]+"%"; s.classList.toggle("on",i===6); },120+i*90); });
      var l=panes[4].querySelector(".line"); if(l){ l.classList.remove("go"); setTimeout(function(){ l.classList.add("go"); },60); } }

    var R=[rToday,rFood,rExercise,rHub,rProgress];
    function renderAll(){ R.forEach(function(f){f();}); }
    function keepScroll(i,fn){ var y=panes[i].scrollTop; fn(); panes[i].scrollTop=y; }

    /* ---------- live fasting clock ---------- */
    function clock(){ var g=P().fastGoal*3600; if(!sec) sec=Math.round(g*.88);
      var h=Math.floor(sec/3600), m=Math.floor(sec%3600/60), hr=panes[0].querySelector(".hr"), rg=panes[0].querySelector(".rg");
      if(hr) hr.textContent=h+":"+("0"+m).slice(-2); if(rg) rg.setAttribute("stroke-dashoffset",(144.5*(1-Math.min(sec/g,1))).toFixed(1)); }
    setInterval(function(){ sec+=1; if(sec>=P().fastGoal*3600) sec=Math.round(P().fastGoal*3600*.88); clock(); },1000);

    /* ---------- rest timer after each set ---------- */
    function rest(){ clearInterval(restT); var left=45, el=restEl.querySelector(".rt"), bar=restEl.querySelector(".bar i");
      restEl.classList.add("on"); el.textContent="0:45"; bar.style.transition="none"; bar.style.width="100%"; bar.offsetWidth; bar.style.transition="";
      restT=setInterval(function(){ left--; el.textContent="0:"+("0"+left).slice(-2); bar.style.width=(left/45*100)+"%"; if(left<=0){ clearInterval(restT); restEl.classList.remove("on"); } },1000); }
    function endRest(){ clearInterval(restT); restEl.classList.remove("on"); }

    /* ---------- tabs ---------- */
    function go(i,user){ if(i<0||i>4) return; if(user) stop(); var old=tab; tab=i;
      panes.forEach(function(p,j){ p.style.transition=(j===i||j===old)?"":"none"; p.style.transform="";
        p.classList.toggle("on",j===i); p.classList.toggle("left",j<i); });
      tabs.forEach(function(t,j){ t.classList.toggle("on",j===i); t.setAttribute("aria-selected",j===i); });
      if(i===3){ var d=sh.querySelector(".mthp-tabs .dot"); if(d) d.remove(); }
      if(i!==2) endRest();
      if(i===4) anim();
      panes[i].scrollTop=0; }
    tabs.forEach(function(t){ t.addEventListener("click",function(){ go(+t.dataset.t,true); }); });

    /* ---------- taps inside the screens ---------- */
    scr.addEventListener("click",function(e){
      if(swiped){ e.preventDefault(); e.stopPropagation(); return; }
      var b=e.target.closest("button"); if(!b||b.parentNode.classList.contains("mthp-tabs")) return; stop();
      var d=b.dataset;
      if(b.classList.contains("skip")){ endRest(); return; }
      if(d.day!=null){ day=+d.day; rToday(); rHub(); rProgress(); return; }
      if(d.go!=null){ go(+d.go,true); return; }
      if(d.k){ key=d.k; sec=0; posted=false; seed(); renderAll(); toast("Switched to the "+PROTOS[key].name); return; }
      if(d.m!=null){ openLesson(+d.m); return; }
      if(d.j!=null){ var k=day+"-"+d.j; if(done[k]) delete done[k]; else done[k]=true; keepScroll(0,rToday);
        if([0,1,2].every(function(j){return done[day+"-"+j];})) toast("Day "+(day+1)+" habits complete 🎉"); return; }
      /* food */
      if(d.fm!=null){ foodMode=+d.fm; rFood(); panes[1].scrollTop=0; return; }
      if(d.eat){ eaten[d.eat]=!eaten[d.eat]; keepScroll(1,rFood); rToday(); rProgress();
        if(eaten[d.eat]){ var r=recipe(d.eat); toast(d.eat+" logged · "+r[2]+" kcal, "+r[3]+" g protein"); } return; }
      if(d.sw){ pick[d.sw]=(pick[d.sw]+1)%P().food.meals[d.sw].length; keepScroll(1,rFood); rToday();
        var sw=panes[1].querySelector('[data-sw="'+d.sw+'"]'); if(sw){ sw.classList.add("spin"); }
        toast("Swapped for "+recipe(d.sw)[1]+". Your totals updated."); return; }
      if(d.r){ openRecipe(d.r); return; }
      if(d.w!=null){ var w=+d.w; water=(water===w+1)?w:w+1; keepScroll(1,rFood); rProgress(); if(water>=8) toast("8 glasses. Fully hydrated 💧"); return; }
      if(b.classList.contains("shuffle")){ weekPick=weekPick.map(function(){ return [0,1,2].map(function(){ return Math.floor(Math.random()*3); }); }); rFood(); toast("New week of meals, same calorie goal"); return; }
      if(d.b){ if(bought[d.b]) delete bought[d.b]; else bought[d.b]=true; keepScroll(1,rFood); return; }
      /* exercise */
      if(d.set){ var on=!logged[d.set]; if(on) logged[d.set]=true; else delete logged[d.set]; keepScroll(2,rExercise); rToday(); rFood(); rProgress();
        if(on){ if(setsDone()===setsTotal()){ endRest(); toast("Workout complete 💪 Logged to your progress"); } else rest(); } return; }
      if(d.wd!=null){ var M=P().move, i=+d.wd; toast(WEEKDAYS[i]+": "+M.week[i]+(M.week[i]==="Rest"?" day. Recovery is part of the plan.":" session, planned for your level.")); return; }
      if(b.classList.contains("addw")){ steps+=1100; keepScroll(2,rExercise); rFood(); toast("10-minute walk logged · about 1,100 steps"); return; }
      /* hub */
      if(d.h!=null){ hubMode=+d.h; rHub(); return; }
      if(b.classList.contains("remind")){ b.querySelector("b").textContent="Set ✓"; toast("We’ll remind you before Mark goes live."); return; }
      if(b.classList.contains("compose")){ if(!posted){ posted=true; rHub(); toast("Posted to the Healing Hub"); } return; }
      if(b.classList.contains("like")){ var lk=!b.classList.contains("on"), n=+d.l+(lk?1:0); b.classList.toggle("on",lk); b.querySelector("b").textContent=lk?"♥":"♡"; b.querySelector("span").textContent=n; return; }
    });
    function openSheet(html){ var box=sheet.firstElementChild; box.innerHTML='<button class="x" aria-label="Close">✕</button>'+html; sheet.classList.add("on"); box.scrollTop=0;
      box.querySelector(".x").onclick=function(){ sheet.classList.remove("on"); }; return box; }
    function openLesson(i){ var p=P();
      var box=openSheet('<div class="pic v" style="background-image:url('+BASE+'steps/'+PICS[i]+'.jpg)"></div><div class="k">Lesson '+(i+1)+'</div><div class="h" style="font-size:20px;margin-bottom:4px">'+esc(p.steps[i])+'</div><div class="s">The science behind this step, explained simply, plus exactly what to do today.</div><button class="btn">Start lesson</button>');
      box.querySelector(".btn").onclick=function(){ sheet.classList.remove("on"); toast("Lessons unlock when you join."); }; }
    function openRecipe(m){ var r=recipe(m), F=P().food;
      var box=openSheet('<div class="big">'+r[0]+'</div><div class="k">'+m+'</div><div class="h" style="font-size:20px;margin-bottom:6px">'+esc(r[1])+'</div>'+
        '<div class="stats" style="grid-template-columns:repeat(4,1fr)">'+[[r[2],"kcal"],[r[3]+"g","protein"],[r[4]+"g",F.carbLabel==="Net carbs"?"net carbs":"carbs"],[r[5]+"g","fat"]].map(function(x){ return '<div><b style="font-size:17px">'+x[0]+'</b><span>'+x[1]+'</span></div>'; }).join("")+'</div>'+
        '<div class="t" style="margin-bottom:3px">Ingredients</div><div class="s">'+esc(r[6])+'</div>'+
        '<div class="s" style="margin-top:6px">Step-by-step method, prep time and batch-cook notes are in the full recipe.</div>'+
        '<button class="btn">'+(eaten[m]?'Logged ✓':'Log this meal')+'</button>');
      box.querySelector(".btn").onclick=function(){ if(!eaten[m]){ eaten[m]=true; keepScroll(1,rFood); rToday(); rProgress(); toast(m+" logged · "+r[2]+" kcal"); } sheet.classList.remove("on"); }; }
    sheet.addEventListener("click",function(e){ if(e.target===sheet) sheet.classList.remove("on"); });

    /* ---------- swipe ---------- */
    var sx=0, sy=0, dx=0, lock="", down=false, swiped=false;
    scr.addEventListener("pointerdown",function(e){ if(e.target.closest(".mthp-tabs")||e.target.closest(".rest")||sheet.classList.contains("on")) return; down=true; lock=""; dx=0; sx=e.clientX; sy=e.clientY; swiped=false; });
    scr.addEventListener("pointermove",function(e){ if(!down) return; dx=e.clientX-sx; var dy=e.clientY-sy;
      if(!lock){ if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*2){ lock="x"; stop(); try{scr.setPointerCapture(e.pointerId);}catch(_){} } else if(Math.abs(dy)>6){ lock="y"; down=false; return; } else return; }
      var edge=(tab===0&&dx>0)||(tab===4&&dx<0), pull=edge?dx*.25:dx, w=scr.clientWidth;
      var cur=panes[tab], nb=panes[tab+(dx<0?1:-1)];
      cur.style.transition="none"; cur.style.transform="translateX("+pull+"px)";
      if(nb&&!edge){ nb.style.transition="none"; nb.style.transform="translateX("+((dx<0?w:-w)+pull)+"px)"; } });
    function end(){ if(!down) return; down=false; if(lock!=="x") return;
      swiped=Math.abs(dx)>4; setTimeout(function(){ swiped=false; },60);
      var w=scr.clientWidth, target=tab;
      if(dx<-w*.18&&tab<4) target=tab+1; else if(dx>w*.18&&tab>0) target=tab-1;
      panes.forEach(function(p){ p.style.transition=""; });
      if(target!==tab){ var old=tab; go(target,true); panes[old].style.transform=""; }
      else panes.forEach(function(p){ p.style.transform=""; }); }
    scr.addEventListener("pointerup",end); scr.addEventListener("pointercancel",function(){ if(lock==="x") end(); else down=false; });
    scr.addEventListener("dragstart",function(e){ e.preventDefault(); });
    /* focus or find-in-page can scroll the clipped screen sideways; keep it pinned */
    scr.addEventListener("scroll",function(){ if(scr.scrollLeft||scr.scrollTop){ scr.scrollLeft=0; scr.scrollTop=0; } });

    /* keyboard: arrows move between tabs */
    sh.querySelector(".mthp-tabs").addEventListener("keydown",function(e){ if(e.key==="ArrowRight"){ go(Math.min(4,tab+1),true); tabs[tab].focus(); } if(e.key==="ArrowLeft"){ go(Math.max(0,tab-1),true); tabs[tab].focus(); } });

    /* gentle auto-tour until the visitor touches it, only while on screen */
    var seen=true;
    if("IntersectionObserver" in window){ seen=false; new IntersectionObserver(function(es){ seen=es[0].isIntersecting; },{threshold:.5}).observe(root); }
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reduce) setInterval(function(){ if(auto&&seen&&!down) go((tab+1)%5,false); },4200);
    root.addEventListener("pointerdown",stop);

    renderAll();
  }

  function scan(){ [].forEach.call(document.querySelectorAll(".mthp[data-proto]"),build); }
  window.MTHPhone={scan:scan,PROTOS:PROTOS};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",scan); else scan();
})();
