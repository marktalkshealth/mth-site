/* =================================================================
   MARK TALKS HEALTH — SHARED TRAINING ENGINE (Move & Strength)
   One file used by the Gut Health, Diabetes and GLP-1 protocol apps.
   Each app keeps its own safety rules for which days are strength,
   cardio or rest; this engine turns those days into full workouts:
   exercise library with photos and looping demo videos, set-by-set
   logging, rest timer, double progression, personal bests and history.

   Host apps call  MTHTrain.init({ ...adapter })  then use
   MTHTrain.main(iso), MTHTrain.settings(), MTHTrain.history(iso).
   Media: free-to-use clips from Pexels (pexels.com/license).
================================================================= */
(function () {
  if (window.MTHTrain) return;
  const VID = 'https://videos.pexels.com/video-files/', IMG = 'https://images.pexels.com/videos/';

  /* ---------- media: [video file, poster] ---------- */
  const MEDIA = {
    sitstand: ['5991897/5991897-sd_960_540_25fps.mp4', '5991897/pexels-photo-5991897.jpeg'],
    squat: ['8837118/8837118-sd_960_506_25fps.mp4', '8837118/pexels-photo-8837118.jpeg'],
    goblet: ['5547221/5547221-sd_960_540_25fps.mp4', '5547221/kettlebell-kettlebell-lifting-kettlebell-training-overhead-squat-5547221.jpeg'],
    wallpush: ['5034563/5034563-sd_960_540_30fps.mp4', '5034563/pexels-photo-5034563.jpeg'],
    pushup: ['32109500/13689479_960_540_25fps.mp4', '32109500/berlinpexelsmeetup-32109500.jpeg'],
    dbrow: ['4867634/4867634-sd_960_540_25fps.mp4', '4867634/pexels-photo-4867634.jpeg'],
    bandrow: ['7477495/7477495-sd_540_960_24fps.mp4', '7477495/pexels-photo-7477495.jpeg'],
    bridge: ['6525487/6525487-sd_960_540_25fps.mp4', '6525487/exercises-girl-sport-sporty-6525487.jpeg'],
    rdl: ['11121740/11121740-sd_960_540_30fps.mp4', '11121740/gym-equipament-11121740.jpeg'],
    lunge: ['8456658/8456658-sd_960_540_25fps.mp4', '8456658/pexels-photo-8456658.jpeg'],
    stepup: ['6286165/6286165-sd_960_540_30fps.mp4', '6286165/pexels-photo-6286165.jpeg'],
    press: ['4367541/4367541-sd_960_540_30fps.mp4', '4367541/barbell-dumbbells-exercise-bike-fitness-equipment-4367541.jpeg'],
    curl: ['6389045/6389045-sd_960_540_25fps.mp4', '6389045/pexels-photo-6389045.jpeg'],
    tricep: ['6286166/6286166-sd_960_540_30fps.mp4', '6286166/pexels-photo-6286166.jpeg'],
    floorpress: ['6149638/6149638-sd_960_540_24fps.mp4', '6149638/pexels-photo-6149638.jpeg'],
    plank: ['7801720/7801720-sd_960_406_25fps.mp4', '7801720/pexels-photo-7801720.jpeg'],
    highplank: ['8836970/8836970-sd_960_506_25fps.mp4', '8836970/pexels-photo-8836970.jpeg'],
    sideplank: ['6297136/6297136-sd_540_960_24fps.mp4', '6297136/pexels-photo-6297136.jpeg'],
    deadbug: ['6286160/6286160-sd_960_540_30fps.mp4', '6286160/pexels-photo-6286160.jpeg'],
    birddog: ['7525587/7525587-sd_960_540_25fps.mp4', '7525587/adult-apartment-beautiful-blond-7525587.jpeg'],
    calf: ['32115656/13692094_540_960_24fps.mp4', '32115656/4k-bodybuilding-build-color-grade-32115656.jpeg'],
    carry: ['8456980/8456980-sd_960_540_25fps.mp4', '8456980/pexels-photo-8456980.jpeg'],
    pullapart: ['6892964/6892964-sd_960_540_25fps.mp4', '6892964/pexels-photo-6892964.jpeg'],
    walk: ['8981719/8981719-sd_960_540_30fps.mp4', '8981719/beautiful-body-child-cute-8981719.jpeg'],
    bike: ['7934713/7934713-sd_960_540_25fps.mp4', '7934713/gt-gt-7934713.jpeg'],
    swim: ['6539507/6539507-sd_960_540_25fps.mp4', '6539507/pexels-photo-6539507.jpeg'],
    catcow: ['8480627/8480627-sd_960_540_25fps.mp4', '8480627/pexels-photo-8480627.jpeg'],
    hamstring: ['4457717/4457717-sd_960_540_25fps.mp4', '4457717/pexels-photo-4457717.jpeg'],
    child: ['7500544/7500544-sd_960_540_25fps.mp4', '7500544/pexels-photo-7500544.jpeg'],
    march: ['9943616/9943616-sd_960_540_24fps.mp4', '9943616/pexels-photo-9943616.jpeg']
  };
  const poster = (k, w) => MEDIA[k] ? IMG + MEDIA[k][1] + '?auto=compress&cs=tinysrgb&w=' + (w || 400) : '';
  const clip = k => MEDIA[k] ? VID + MEDIA[k][0] : '';

  /* ---------- exercise library ----------
     m = working weight as a multiple of the base (curl-equivalent) dumbbell. time = held for seconds. */
  const EX = {
    sitstand: { n: 'Chair sit-to-stand', mus: 'Legs & glutes', eq: 'none', cues: ['Sit tall on the front half of a sturdy chair, feet flat and hip-width.', 'Lean slightly forward and stand all the way up without using your hands.', 'Sit back down slowly, taking 3 seconds to touch the seat.'], easier: 'Use a higher seat, or push lightly off your thighs.', harder: 'Hover just above the seat for a second before standing.' },
    squat: { n: 'Bodyweight squat', mus: 'Legs & glutes', eq: 'none', cues: ['Feet shoulder-width, toes slightly out.', 'Sit back and down, chest up, knees tracking over your toes.', 'Drive up through your whole foot.'], easier: 'Squat to a chair and stand back up.', harder: 'Lower over 3 seconds and pause at the bottom.' },
    goblet: { n: 'Goblet squat', mus: 'Legs & glutes', eq: 'db', m: 1.6, one: true, cues: ['Hold one dumbbell vertically at your chest, elbows tucked.', 'Sit down between your heels, chest tall.', 'Stand up by pushing the floor away.'], easier: 'Squat to a chair, or go lighter.', harder: 'Pause 2 seconds at the bottom.' },
    wallpush: { n: 'Wall push-up', mus: 'Chest, shoulders & arms', eq: 'none', cues: ['Hands on the wall at shoulder height, a little wider than your shoulders.', 'Step your feet back until you lean in a straight line.', 'Lower your chest towards the wall, then press away.'], easier: 'Stand closer to the wall.', harder: 'Step further back, or use a kitchen counter.' },
    pushup: { n: 'Push-up', mus: 'Chest, shoulders & arms', eq: 'none', cues: ['Hands just wider than your shoulders, body in one straight line.', 'Lower until your chest is a fist from the floor.', 'Press away hard. Squeeze your glutes the whole time.'], easier: 'Knees on the floor, or hands on a counter.', harder: 'Lower over 3 seconds.' },
    floorpress: { n: 'Dumbbell floor press', mus: 'Chest & arms', eq: 'db', m: 1.2, cues: ['Lie on your back, knees bent, a dumbbell in each hand above your chest.', 'Lower until your upper arms touch the floor.', 'Press straight up, wrists stacked over elbows.'], easier: 'Lighter dumbbells, or wall push-ups.', harder: 'Pause with your arms on the floor for 1 second.' },
    dbrow: { n: 'Dumbbell row', mus: 'Back & biceps', eq: 'db', m: 1.4, cues: ['Hinge forward with a flat back, one hand on a chair if you like.', 'Pull the dumbbell to your hip, elbow close to your side.', 'Lower all the way down with control.'], easier: 'Lighter weight, or a resistance band.', harder: 'Pause at the top for 1 second.' },
    bandrow: { n: 'Seated band row', mus: 'Back & biceps', eq: 'band', cues: ['Sit tall, legs out, the band looped around your feet.', 'Pull the handles to your ribs, squeezing your shoulder blades together.', 'Return slowly with your arms straight.'], easier: 'Hold the band further down for less tension.', harder: 'Choke up on the band, or pause at your ribs.' },
    bridge: { n: 'Glute bridge', mus: 'Glutes & hamstrings', eq: 'none', cues: ['Lie on your back, knees bent, feet flat and hip-width.', 'Squeeze your glutes and lift your hips until knees, hips and shoulders line up.', 'Lower slowly. Ribs down, no arching.'], easier: 'Smaller range of motion.', harder: 'One leg at a time, or a weight on your hips.' },
    rdl: { n: 'Romanian deadlift', mus: 'Hamstrings, glutes & back', eq: 'db', m: 1.8, cues: ['Stand with a dumbbell in each hand in front of your thighs, soft knees.', 'Push your hips back as the weights slide down your legs, back flat.', 'Stand tall by squeezing your glutes.'], easier: 'Glute bridges on the floor.', harder: 'Lower over 3 seconds, or one leg at a time.' },
    stepup: { n: 'Step-up', mus: 'Legs & balance', eq: 'none', cues: ['Stand facing a bottom stair or sturdy step.', 'Step up with your whole foot and drive through that heel to stand tall.', 'Step down slowly. Do all reps on one side, then switch.'], easier: 'Use a lower step and hold a rail.', harder: 'Hold dumbbells, or use a higher step.' },
    lunge: { n: 'Reverse lunge', mus: 'Legs & glutes', eq: 'none', m: 0.7, cues: ['Stand tall, then step one foot back.', 'Drop your back knee straight down towards the floor.', 'Push through your front heel to return. Alternate legs.'], easier: 'Hold a wall or chair for balance, or do step-ups.', harder: 'Hold a dumbbell in each hand.' },
    press: { n: 'Overhead press', mus: 'Shoulders & arms', eq: 'db', m: 0.8, cues: ['Dumbbells at shoulder height, palms forward.', 'Press straight up, ribs down, no arching.', 'Lower slowly to your shoulders.'], easier: 'Sit down, or go lighter.', harder: 'Press one arm at a time.' },
    curl: { n: 'Biceps curl', mus: 'Biceps & grip', eq: 'db', m: 1.0, cues: ['Elbows pinned at your sides.', '2 seconds up, 2 seconds down. No swinging.'], easier: 'Lighter weights, or a band under your feet.', harder: 'Pause at the top.' },
    tricep: { n: 'Overhead triceps extension', mus: 'Triceps', eq: 'db', m: 0.6, one: true, cues: ['Hold one dumbbell overhead with both hands.', 'Bend your elbows to lower it behind your head, elbows pointing forward.', 'Straighten your arms to press it back up.'], easier: 'Sit down, or go lighter.', harder: 'Lower over 3 seconds.' },
    pullapart: { n: 'Band pull-apart', mus: 'Upper back & posture', eq: 'band', cues: ['Hold a band at chest height, arms straight, hands shoulder-width.', 'Pull the band apart until it touches your chest.', 'Return slowly. Shoulders down, away from your ears.'], easier: 'Hold the band wider apart.', harder: 'Hold the band closer together.' },
    plank: { n: 'Forearm plank', mus: 'Core', eq: 'none', time: true, cues: ['Elbows under your shoulders, body in one straight line.', 'Squeeze your glutes, ribs down, breathe slowly.', 'Stop when your hips sag or lift.'], easier: 'Knees down.', harder: 'Lift one foot for a few seconds at a time.' },
    highplank: { n: 'Plank shoulder taps', mus: 'Core & shoulders', eq: 'none', time: true, cues: ['High plank, hands under your shoulders, feet wide.', 'Tap one hand to the opposite shoulder without rocking your hips.', 'Alternate slowly.'], easier: 'Knees down.', harder: 'Feet closer together.' },
    sideplank: { n: 'Side plank', mus: 'Obliques & hips', eq: 'none', time: true, cues: ['Elbow under your shoulder, hips stacked.', 'Lift your hips so your body is a straight line.', 'Hold, then switch sides.'], easier: 'Bottom knee on the floor.', harder: 'Lift your top leg.' },
    deadbug: { n: 'Dead bug', mus: 'Deep core', eq: 'none', cues: ['Lie on your back, arms up, knees over hips.', 'Press your low back into the floor.', 'Slowly lower one arm and the opposite leg, then switch.'], easier: 'Move only the legs.', harder: 'Straighten the leg all the way.' },
    birddog: { n: 'Bird dog', mus: 'Core & back', eq: 'none', cues: ['On hands and knees, back flat.', 'Reach one arm forward and the opposite leg back, hips level.', 'Pause, return, switch sides.'], easier: 'Move only the arm or only the leg.', harder: 'Hold each reach for 3 seconds.' },
    calf: { n: 'Calf raise', mus: 'Calves & ankles', eq: 'none', cues: ['Stand tall, holding a wall or counter.', 'Rise onto the balls of your feet as high as you can.', 'Lower over 2 seconds.'], easier: 'Both feet, hold on firmly.', harder: 'One foot at a time, or on a step.' },
    carry: { n: 'Farmer carry', mus: 'Grip, core & posture', eq: 'db', m: 1.2, time: true, cues: ['A dumbbell in each hand, stand tall.', 'Walk slowly with short steps for the time shown.', 'Shoulders down and back.'], easier: 'Lighter weights, shorter walk.', harder: 'Heavier, or one hand at a time.' },
    walk: { n: 'Brisk walk', mus: 'Cardio', eq: 'none', time: true, cues: ['Walk at a pace where you can talk but not sing.', 'Stand tall, swing your arms, land softly.', 'A 10-minute walk after each meal counts and flattens the blood-sugar rise.'], easier: 'Slower pace, flat route, shorter walks after meals.', harder: 'Add hills, or a few 1-minute faster stretches.' },
    bike: { n: 'Cycling', mus: 'Cardio', eq: 'none', time: true, cues: ['Set the seat so your knee is slightly bent at the bottom of the pedal stroke.', 'Steady, comfortable pace: you can still talk.', 'Indoors or outdoors both count.'], easier: 'Lower resistance, shorter session.', harder: 'More resistance, or 1-minute harder efforts.' },
    swim: { n: 'Swimming', mus: 'Cardio', eq: 'none', time: true, cues: ['Easy, continuous laps at a pace you could keep for 30 minutes.', 'Rest at the wall whenever you need to.', 'Water walking or aqua aerobics count too.'], easier: 'Water walking, or rest every length.', harder: 'Longer sets without stopping.' },
    march: { n: 'March in place', mus: 'Warm-up', eq: 'none', time: true, cues: ['Stand tall and march, lifting your knees to hip height if you can.', 'Swing your arms. Breathe through your nose.'], easier: 'Smaller steps, hold a counter.', harder: 'Faster, or add arm circles.' },
    catcow: { n: 'Cat-cow', mus: 'Spine mobility', eq: 'none', cues: ['On hands and knees.', 'Round your back up as you breathe out, then let your belly drop as you breathe in.', 'Move slowly with your breath.'], easier: 'Smaller movements.', harder: 'Add a slow hip circle.' },
    hamstring: { n: 'Seated hamstring stretch', mus: 'Cool-down', eq: 'none', time: true, cues: ['Sit with one leg straight, the other bent.', 'Hinge forward from your hips until you feel a gentle stretch.', 'Breathe slowly. No bouncing.'], easier: 'Bend the straight knee a little.', harder: 'Reach a little further on each breath out.' },
    child: { n: 'Child’s pose', mus: 'Cool-down', eq: 'none', time: true, cues: ['Kneel, sit back on your heels and reach your arms forward.', 'Let your forehead rest on the floor or a cushion.', 'Breathe into your back.'], easier: 'A pillow under your hips or chest.', harder: 'Walk your hands to each side for a side stretch.' }
  };

  /* ---------- movement patterns → exercise for each level and equipment ---------- */
  const PAT = {
    squat: { n: 'Squat', found: 'sitstand', build: { db: 'goblet', none: 'squat', band: 'squat' }, strong: { db: 'goblet', none: 'squat', band: 'squat' } },
    pushup: { n: 'Push', found: 'wallpush', build: 'pushup', strong: { db: 'floorpress', none: 'pushup', band: 'pushup' } },
    row: { n: 'Pull', found: { db: 'dbrow', band: 'bandrow', none: 'birddog' }, build: { db: 'dbrow', band: 'bandrow', none: 'birddog' }, strong: { db: 'dbrow', band: 'bandrow', none: 'birddog' } },
    hinge: { n: 'Hinge', found: 'bridge', build: { db: 'rdl', none: 'bridge', band: 'bridge' }, strong: { db: 'rdl', none: 'bridge', band: 'bridge' } },
    plank: { n: 'Core', found: 'deadbug', build: 'plank', strong: 'plank' },
    lunge: { n: 'Single leg', found: 'stepup', build: 'lunge', strong: 'lunge' },
    press: { n: 'Overhead', found: { db: 'press', band: 'pullapart', none: 'highplank' }, build: { db: 'press', band: 'pullapart', none: 'highplank' }, strong: { db: 'press', band: 'pullapart', none: 'highplank' } },
    curl: { n: 'Arms', found: { db: 'curl', band: 'pullapart', none: 'calf' }, build: { db: 'curl', band: 'pullapart', none: 'calf' }, strong: { db: 'curl', band: 'pullapart', none: 'calf' } },
    carry: { n: 'Carry', found: { db: 'carry', band: 'sideplank', none: 'sideplank' }, build: { db: 'carry', band: 'sideplank', none: 'sideplank' }, strong: { db: 'carry', band: 'sideplank', none: 'sideplank' } },
    tricep: { n: 'Triceps', found: { db: 'tricep', band: 'calf', none: 'calf' }, build: { db: 'tricep', band: 'calf', none: 'calf' }, strong: { db: 'tricep', band: 'calf', none: 'calf' } }
  };
  const DAYS = { A: ['squat', 'pushup', 'row', 'hinge', 'plank'], B: ['lunge', 'press', 'curl', 'hinge', 'carry'] };
  const WARM = [['march', '2 min'], ['catcow', '8 slow reps']], COOL = [['hamstring', '30 sec a side'], ['child', '45 sec']];
  const MOB = [['catcow', '8 slow reps'], ['birddog', '6 each side'], ['hamstring', '30 sec a side'], ['child', '45 sec'], ['walk', '10 min after a meal']];
  const CARDIO = [['Brisk walk', 'walk'], ['Cycling', 'bike'], ['Swimming', 'swim'], ['Marching indoors', 'march']];
  const LVL = { found: 'Foundation', build: 'Build', strong: 'Strong' };
  const EQ = { db: 'Dumbbells', band: 'Resistance band', none: 'No equipment' };
  const BASE = { found: 8, build: 12, strong: 17.5 };   // curl-equivalent dumbbell (lb) when there's no strength test

  let H = null;   // host adapter
  const r25 = x => Math.max(2.5, Math.round(x / 2.5) * 2.5);
  const store = () => { const s = H.store(); s.log = s.log || {}; s.tr = s.tr || {}; return s; };
  const level = () => (H.level && H.level()) || store().tr.lvl || 'found';
  const equip = () => store().tr.eq || 'db';
  function exFor(p) { const v = PAT[p][level()]; return typeof v === 'string' ? v : v[equip()] || v.none; }
  function e(s) { return H.esc(s); }

  /* ---------- targets: double progression ---------- */
  function last(p, beforeISO) {
    const L = store().log;
    const k = exFor(p), ok = s => s.done && (!s.k || s.k === k);
    const days = Object.keys(L).filter(x => x < beforeISO && Array.isArray(L[x][p]) && L[x][p].some(ok)).sort();
    if (!days.length) return null;
    const x = days[days.length - 1]; return { iso: x, sets: L[x][p].filter(ok) };
  }
  function target(p, iso, sets) {
    const k = exFor(p), X = EX[k], lvl = level();
    const t = { sets, lo: 8, hi: 12, w: null, note: '', k };
    if (X.time) { t.lo = lvl === 'found' ? 20 : lvl === 'build' ? 30 : 45; t.hi = t.lo + 15; }
    if (X.m && equip() === 'db') { const b = H.baseW ? H.baseW() : null; t.w = r25((b || BASE[lvl]) * X.m * (H.baseW && b ? 0.65 : 1)); }
    const l = last(p, iso);
    if (l) {
      const lw = Math.max(...l.sets.map(s => +s.w || 0)), allTop = l.sets.length >= sets && l.sets.every(s => +s.r >= t.hi), anyLow = l.sets.some(s => +s.r && +s.r < t.lo - 2);
      if (t.w != null && lw) { t.w = allTop ? r25(lw * 1.05 + 1) : anyLow ? r25(lw * 0.9) : lw; t.note = allTop ? `Up from ${lw} lb: you hit ${t.hi} on every set last time.` : anyLow ? `Lighter than last time (${lw} lb) so you can reach ${t.lo} reps.` : `Same as last time. Aim for ${t.hi} on every set.`; }
      else if (X.time && allTop) { t.lo += 10; t.hi += 10; t.note = 'Longer than last time: you held the full time on every set.'; }
      else if (allTop) t.note = 'You hit the top of the range last time: slow the lowering to 3 seconds, or try the harder version.';
    }
    return t;
  }
  // Best set ever (estimated 1-rep max for weighted moves, reps or seconds otherwise)
  function best(p, k, beforeISO) {
    const L = store().log; let b = 0;
    Object.keys(L).forEach(x => { if (beforeISO && x >= beforeISO) return; (L[x][p] || []).forEach(s => { if (!s.done || (s.k && s.k !== k)) return; const v = +s.w ? +s.w * (1 + (+s.r || 0) / 30) : +s.r || 0; if (v > b) b = v; }); });
    return b;
  }

  /* ---------- markup helpers ---------- */
  const thumb = (k, cls) => `<button type="button" class="tr-th ${cls || ''}" data-tr-ex="${k}" aria-label="How to do ${e(EX[k].n)}"><img loading="lazy" alt="" src="${poster(k, 360)}" onerror="this.remove()"><i>▶</i></button>`;
  const chip = (k, t) => `<button type="button" class="tr-mini" data-tr-ex="${k}"><img loading="lazy" alt="" src="${poster(k, 200)}" onerror="this.remove()"><span><b>${e(EX[k].n)}</b><small>${e(t)}</small></span></button>`;

  function main(iso, T) {
    const S = store(), log = S.log[iso] = S.log[iso] || {};
    if (T.k === 'lift') {
      const pats = DAYS[T.day];
      const cards = pats.map(p => {
        const tg = target(p, iso, T.sets), X = EX[tg.k], sets = log[p] = log[p] || [];
        while (sets.length < tg.sets) sets.push({ r: '', w: tg.w == null ? '' : tg.w, done: false });
        sets.forEach(x => { if (!x.done && !x.wt && tg.w != null) x.w = tg.w; });
        const unit = X.time ? 'sec' : 'reps', done = sets.filter(s => s.done).length, pb = best(p, tg.k);
        return `<div class="tr-ex ${done >= tg.sets ? 'done' : ''}">
          <div class="tr-ex-h">${thumb(tg.k)}<div class="tr-ex-i"><div class="tr-pat">${e(PAT[p].n)}</div><button type="button" class="tr-ex-n" data-tr-ex="${tg.k}">${e(X.n)}</button>
            <div class="tr-ex-t">${tg.sets} × ${tg.lo}–${tg.hi} ${unit}${tg.w != null ? ` @ <b>${tg.w} lb</b>${X.one ? ' (one dumbbell)' : ' each hand'}` : X.eq === 'band' ? ' · band' : ' · bodyweight'}</div>
            ${tg.note ? `<div class="tr-note">${e(tg.note)}</div>` : ''}${pb ? `<div class="tr-pb">🏆 Best: ${tg.w != null ? Math.round(pb) + ' lb est. max' : Math.round(pb) + ' ' + unit}</div>` : ''}</div>
            <span class="tr-cnt">${done}/${tg.sets}</span></div>
          <div class="tr-sets">${sets.map((s, i) => `<div class="tr-set ${s.done ? 'on' : ''}"><span class="n">${i + 1}</span>
            <label><input class="fx-in" type="number" inputmode="numeric" min="0" placeholder="${tg.hi}" value="${e(s.r)}" data-tr-set="${p}|${i}|r"><small>${unit}</small></label>
            ${tg.w != null ? `<label><input class="fx-in" type="number" inputmode="decimal" step="2.5" min="0" value="${e(s.w)}" data-tr-set="${p}|${i}|w"><small>lb</small></label>` : '<span></span>'}
            <button type="button" class="fx-ico eat" data-tr-done="${p}|${i}" aria-pressed="${!!s.done}">✓ ${s.done ? 'Done' : 'Log'}</button></div>`).join('')}</div></div>`;
      }).join('');
      const total = pats.reduce((a, p) => a + Math.min((log[p] || []).filter(s => s.done).length, T.sets), 0), need = pats.length * T.sets;
      const rec = H.dayRec(iso);
      return `<div class="fx-sec-h"><h3>Strength ${T.day} · ${LVL[level()]}</h3><span>${total} of ${need} sets · about ${T.sets >= 3 ? 40 : T.sets === 2 ? 30 : 15} min</span></div>
        <div class="tr-prog"><i style="width:${need ? total / need * 100 : 0}%"></i></div>
        <p class="tr-lede">${T.note ? e(T.note) + ' ' : ''}Stop 1–3 reps short of failure and rest 60–90 seconds between sets; the timer starts when you log a set. Weights and reps go up automatically once you hit the top of the range on every set. Tap any photo to watch how it's done.</p>
        <div class="tr-blk"><div class="fx-slot">Warm-up · 3 min</div><div class="tr-minis">${WARM.map(w => chip(w[0], w[1])).join('')}</div></div>
        <div class="tr-exs">${cards}</div>
        <div class="tr-blk"><div class="fx-slot">Cool-down · 2 min</div><div class="tr-minis">${COOL.map(w => chip(w[0], w[1])).join('')}</div></div>
        <div class="tr-finish"><button type="button" class="fx-btn ${rec.move ? '' : 'dark'}" data-tr-finish="1">✓ ${rec.move ? 'Workout logged' : 'Finish workout'}</button><span>${rec.move ? 'Nice work. Protein within 2 hours helps your muscles repair.' : 'Log your sets, then finish to count it in your daily score.'}</span></div>`;
    }
    if (T.k === 'cardio' || T.k === 'walk') {
      const c = log.cardio = log.cardio || { min: '', type: 'Brisk walk' }, cur = (CARDIO.find(x => x[0] === c.type) || CARDIO[0])[1], rec = H.dayRec(iso);
      return `<div class="fx-sec-h"><h3>${e(T.title || 'Zone 2 cardio')} · ${T.min} min</h3><span>${e(T.next || '')}</span></div>
        <div class="tr-hero" data-tr-ex="${cur}"><img alt="" src="${poster(cur, 900)}" onerror="this.remove()"><i>▶</i><span>${e(c.type)}</span></div>
        <p class="tr-lede">${e(T.text || 'A pace where you can talk but not sing: brisk walking, cycling or swimming. A 10-minute walk after a meal also counts and steadies blood sugar.')}</p>
        <div class="tr-cardio">${CARDIO.map(t => `<button type="button" class="tr-chip ${c.type === t[0] ? 'on' : ''}" data-tr-ctype="${t[0]}">${t[0]}</button>`).join('')}</div>
        <div class="tr-cmin"><label>Minutes<input class="fx-in" type="number" inputmode="numeric" min="0" value="${e(c.min)}" placeholder="${T.min}" data-tr-cmin="1"></label>
          <div class="tr-quick">${[10, 20, 30, 45].map(m => `<button type="button" class="tr-chip" data-tr-cadd="${m}">${m} min</button>`).join('')}</div></div>
        <div class="tr-finish"><button type="button" class="fx-btn ${rec.move ? '' : 'dark'}" data-tr-finish="1">✓ ${rec.move ? 'Cardio logged' : 'Log cardio'}</button></div>`;
    }
    // rest, mobility, prep, bed rest
    const rec = H.dayRec(iso), list = T.k === 'bed' ? [['catcow', '6 slow reps in bed or on the floor'], ['hamstring', '30 sec a side'], ['child', '45 sec']] : MOB;
    return `<div class="fx-sec-h"><h3>${e(T.title || 'Rest & mobility')}</h3><span>${T.min ? T.min + ' min' : ''}</span></div>
      <p class="tr-lede">${e(T.text || 'Recovery day. Gentle mobility keeps your joints happy and makes tomorrow’s session feel better.')}</p>
      <div class="tr-minis big">${list.map(w => chip(w[0], w[1])).join('')}</div>
      <div class="tr-finish"><button type="button" class="fx-btn ${rec.move ? '' : 'dark'}" data-tr-finish="1">✓ ${rec.move ? 'Done' : 'Mark as done'}</button></div>`;
  }

  /* ---------- side cards ---------- */
  function settings(withLevel) {
    return `<div class="tr-set-card"><div class="fx-slot">Your setup</div>
      ${withLevel ? `<div class="tr-row"><span>Level</span><div class="tr-seg">${Object.keys(LVL).map(k => `<button type="button" class="${level() === k ? 'on' : ''}" data-tr-lvl="${k}">${LVL[k]}</button>`).join('')}</div></div>` : ''}
      <div class="tr-row"><span>Equipment</span><div class="tr-seg">${Object.keys(EQ).map(k => `<button type="button" class="${equip() === k ? 'on' : ''}" data-tr-eq="${k}">${EQ[k]}</button>`).join('')}</div></div>
      <p>${withLevel ? 'Not sure? Start at Foundation. Move up when every set feels comfortable at the top of the range.' : 'Your level comes from your strength test.'} Exercises swap automatically to match your equipment.</p></div>`;
  }
  function history(iso) {
    const L = store().log, days = Object.keys(L).filter(x => x <= iso && Object.keys(L[x]).some(p => Array.isArray(L[x][p]) && L[x][p].some(s => s.done))).sort().reverse();
    const vol = x => Object.keys(L[x]).reduce((a, p) => a + (Array.isArray(L[x][p]) ? L[x][p].filter(s => s.done).reduce((b, s) => b + (+s.w || 0) * (+s.r || 0), 0) : 0), 0);
    const sets = x => Object.keys(L[x]).reduce((a, p) => a + (Array.isArray(L[x][p]) ? L[x][p].filter(s => s.done).length : 0), 0);
    const cardio = Object.keys(L).filter(x => L[x].cardio && +L[x].cardio.min).reduce((a, x) => a + (+L[x].cardio.min), 0);
    return `<div class="tr-hist"><div class="fx-slot">Training log</div>
      <div class="tr-stats"><div><b>${days.length}</b><span>strength sessions</span></div><div><b>${days.reduce((a, x) => a + sets(x), 0)}</b><span>sets logged</span></div><div><b>${cardio}</b><span>cardio minutes</span></div></div>
      ${days.length ? `<ul>${days.slice(0, 5).map(x => { const d = H.fromISO(x); return `<li><span>${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><b>${sets(x)} sets</b><em>${vol(x) ? Math.round(vol(x)).toLocaleString('en-US') + ' lb lifted' : 'bodyweight'}</em></li>`; }).join('')}</ul>` : '<p>Your workouts appear here as you log them, with your personal bests.</p>'}</div>`;
  }

  /* ---------- the next 7 days ---------- */
  function week(iso) {
    const lbl = T => T.k === 'lift' ? 'Strength ' + T.day : T.k === 'cardio' ? 'Cardio' : T.k === 'walk' ? 'Walk' : T.k === 'bed' ? 'Rest' : T.k === 'prep' ? 'Prep' : 'Rest';
    const ico = T => T.k === 'lift' ? '🏋️' : T.k === 'cardio' ? '🚴' : T.k === 'walk' ? '🚶' : '🌿';
    const cells = [...Array(7)].map((_, i) => { const x = H.addD(iso, i), T = H.today(x), r = H.dayRec(x, true), dt = H.fromISO(x);
      return `<button type="button" class="tr-wk ${i === 0 ? 'sel' : ''} ${T.k}" data-day="${x}">${r && r.move ? '<i>✓</i>' : ''}<em>${ico(T)}</em><span>${dt.toLocaleDateString(undefined, { weekday: 'short' })} ${dt.getDate()}</span><b>${lbl(T)}</b></button>`; }).join('');
    const lifts = [...Array(7)].map((_, i) => H.addD(iso, -i)).filter(x => H.today(x).k === 'lift' && (H.dayRec(x, true) || {}).move).length;
    return `<div class="tr-wkbox"><div class="fx-slot">This week</div><div class="tr-wks">${cells}</div><div class="tr-wk-sum"><b>${lifts}</b> strength session${lifts === 1 ? '' : 's'} logged in the last 7 days · aim for 2–3</div></div>`;
  }
  function view(iso, T, asideTop) {
    return `<div class="tr-grid"><aside class="tr-side">${asideTop || ''}${week(iso)}${settings(!H.level)}${history(iso)}</aside><div class="tr-main">${main(iso, T)}</div></div>`;
  }

  /* ---------- exercise sheet with looping demo video ---------- */
  function openEx(k) {
    const X = EX[k]; if (!X) return;
    const pats = Object.keys(PAT).filter(p => ['found', 'build', 'strong'].some(l => { const v = PAT[p][l]; return (typeof v === 'string' ? v : Object.values(v).join(' ')).split(' ').includes(k); }));
    const pb = pats.length ? best(pats[0], k) : 0;
    H.modal(`<div class="tr-vid"><video src="${clip(k)}" poster="${poster(k, 900)}" autoplay muted loop playsinline preload="metadata" onerror="this.outerHTML='<img alt=&quot;&quot; src=&quot;'+this.poster+'&quot; style=&quot;width:100%;height:100%;object-fit:cover&quot;>'"></video></div>
      <div class="fx-pad" style="padding-top:14px"><div class="fx-kicker">${e(X.mus)}${X.eq !== 'none' ? ' · ' + e(EQ[X.eq]) : ''}</div><h2>${e(X.n)}</h2>
      <h4 style="margin-top:12px">How to do it</h4><ol class="fx-steps">${X.cues.map(c => `<li><span>${e(c)}</span></li>`).join('')}</ol>
      <div class="tr-eh"><div><b>Easier</b><span>${e(X.easier)}</span></div><div><b>Harder</b><span>${e(X.harder)}</span></div></div>
      ${pb ? `<div class="tr-pb" style="margin-top:10px">🏆 Your best: ${X.m ? Math.round(pb) + ' lb estimated 1-rep max' : Math.round(pb) + (X.time ? ' sec' : ' reps')}</div>` : ''}
      <p class="fx-mm" style="margin-top:12px">Breathe out on the effort. Stop if anything hurts sharply or you feel dizzy. With osteoporosis, a past fracture, a hernia or recent surgery, have a physiotherapist check your form first.</p>
      <p class="tr-credit">Demo video: Pexels</p></div>`);
  }

  /* ---------- rest timer ---------- */
  let restT = null;
  function rest(sec) {
    let el = document.getElementById('trRest');
    if (!el) { el = document.createElement('div'); el.id = 'trRest'; el.className = 'tr-rest'; el.setAttribute('role', 'timer'); el.innerHTML = '<span>Rest</span><b>1:30</b><div class="tr-rbar"><i></i></div><button type="button" data-tr-rest="-15">−15</button><button type="button" data-tr-rest="15">+15</button><button type="button" data-tr-rest="0">Skip</button>'; document.body.appendChild(el); }
    let left = sec, total = sec; clearInterval(restT); el.classList.add('on');
    const paint = () => { el.querySelector('b').textContent = Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2); el.querySelector('i').style.width = Math.max(0, left / total * 100) + '%'; };
    paint();
    el._adj = d => { if (!d) { left = 0; } else { left = Math.max(0, left + d); total = Math.max(total, left); } paint(); if (!left) stop(); };
    const stop = () => { clearInterval(restT); el.classList.remove('on'); };
    restT = setInterval(() => { left--; paint(); if (left <= 0) { stop(); try { navigator.vibrate && navigator.vibrate([180, 80, 180]); } catch (er) {} H.toast('Rest done: next set'); } }, 1000);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', ev => {
    if (!H) return;
    const b = ev.target.closest('[data-tr-ex],[data-tr-done],[data-tr-finish],[data-tr-ctype],[data-tr-cadd],[data-tr-lvl],[data-tr-eq],[data-tr-rest]'); if (!b) return;
    const S = store(), iso = H.sel();
    if (b.dataset.trRest != null) { const el = document.getElementById('trRest'); el && el._adj && el._adj(+b.dataset.trRest); return; }
    if (b.dataset.trEx) { ev.stopPropagation(); return openEx(b.dataset.trEx); }
    if (b.dataset.trLvl) { S.tr.lvl = b.dataset.trLvl; H.save(); H.rerender(); H.toast(LVL[b.dataset.trLvl] + ' level'); return; }
    if (b.dataset.trEq) { S.tr.eq = b.dataset.trEq; H.save(); H.rerender(); H.toast('Exercises matched to: ' + EQ[b.dataset.trEq].toLowerCase()); return; }
    if (b.dataset.trCtype) { const l = S.log[iso] = S.log[iso] || {}; (l.cardio = l.cardio || {}).type = b.dataset.trCtype; H.save(); H.rerender(); return; }
    if (b.dataset.trCadd) { const l = S.log[iso] = S.log[iso] || {}; (l.cardio = l.cardio || {}).min = +b.dataset.trCadd; H.save(); H.rerender(); return; }
    if (b.dataset.trFinish) { const r = H.dayRec(iso); r.move = !r.move; H.save(); H.rerender(); if (r.move) H.toast('Movement logged 💪'); return; }
    if (b.dataset.trDone) {
      const [p, i] = b.dataset.trDone.split('|'), L = S.log[iso] = S.log[iso] || {}, s = (L[p] = L[p] || [])[+i]; if (!s) return;
      if (!s.done && s.r === '') { const inp = document.querySelector(`[data-tr-set="${p}|${i}|r"]`); s.r = inp && inp.value !== '' ? +inp.value : +(inp && inp.placeholder) || ''; }
      const k = exFor(p), before = best(p, k, null);
      s.done = !s.done; s.k = k; H.save();
      const T = H.today(iso);
      if (s.done) {
        const v = +s.w ? +s.w * (1 + (+s.r || 0) / 30) : +s.r || 0;
        if (before && v > before) H.toast('🏆 New personal best on ' + EX[k].n);
        if (T.k === 'lift' && DAYS[T.day].every(x => (L[x] || []).filter(z => z.done).length >= T.sets)) { const r = H.dayRec(iso); if (!r.move) { r.move = true; H.save(); H.toast('Workout complete 💪'); } const el = document.getElementById('trRest'); el && el._adj && el._adj(0); }
        else rest(EX[k].time ? 60 : 90);
      }
      H.rerender();
    }
  }, true);
  document.addEventListener('click', ev => { if (ev.target.closest('[data-close]')) document.querySelectorAll('.tr-vid video').forEach(v => { try { v.pause(); } catch (er) {} }); }, true);
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') document.querySelectorAll('.tr-vid video').forEach(v => { try { v.pause(); } catch (er) {} }); });
  document.addEventListener('change', ev => {
    if (!H) return; const t = ev.target, S = store(), iso = H.sel();
    if (t.dataset && t.dataset.trSet) { const [p, i, f] = t.dataset.trSet.split('|'), z = ((S.log[iso] = S.log[iso] || {})[p] = S.log[iso][p] || [])[+i]; if (!z) return; z[f] = t.value === '' ? '' : +t.value; if (f === 'w') z.wt = 1; H.save(); }
    else if (t.dataset && t.dataset.trCmin) { const l = S.log[iso] = S.log[iso] || {}; (l.cardio = l.cardio || {}).min = t.value === '' ? '' : +t.value; H.save(); }
  });

  /* ---------- styles ---------- */
  const css = `
.tr-lede{font-size:.82rem;line-height:1.6;color:var(--muted,#6b7f72);margin:0 2px 12px}
.tr-prog{height:6px;border-radius:6px;background:#ece5da;overflow:hidden;margin:-4px 2px 10px}.tr-prog i{display:block;height:100%;background:#2e5c45;border-radius:6px;transition:width .5s}
.tr-blk{margin:4px 0 12px}.tr-minis{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:6px}
.tr-minis.big{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.tr-mini{display:flex;gap:10px;align-items:center;background:var(--cream,#faf6ef);border:1px solid var(--border,#e4dccd);border-radius:14px;padding:6px 10px 6px 6px;text-align:left;cursor:pointer;font:inherit;color:inherit}
.tr-mini img{width:54px;height:54px;border-radius:10px;object-fit:cover;flex:none;background:#efe7da}
.tr-mini b{display:block;font-size:.8rem}.tr-mini small{font-size:.7rem;color:var(--muted,#6b7f72)}
.tr-exs{display:grid;gap:10px}
.tr-ex{background:#fff;border:1px solid var(--border,#e4dccd);border-radius:16px;padding:10px 12px;transition:border-color .2s,background .2s}
.tr-ex.done{border-color:#2e8a62;background:#f3faf6}
.tr-ex-h{display:grid;grid-template-columns:92px 1fr auto;gap:12px;align-items:start}
.tr-th{position:relative;width:92px;height:72px;border-radius:12px;overflow:hidden;border:0;padding:0;background:#efe7da;cursor:pointer}
.tr-th img{width:100%;height:100%;object-fit:cover;display:block}
.tr-th i,.tr-hero i{position:absolute;right:6px;bottom:6px;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.92);color:#2e5c45;font-style:normal;font-size:.62rem;display:grid;place-items:center;padding-left:2px}
.tr-pat{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#2e5c45}
.tr-ex-n{background:none;border:0;padding:0;font:600 .95rem 'DM Sans',sans-serif;color:var(--text,#1e2820);cursor:pointer;text-align:left}
.tr-ex-t{font-size:.76rem;color:var(--muted,#6b7f72);margin-top:2px}.tr-ex-t b{color:var(--text,#1e2820)}
.tr-note{font-size:.72rem;color:#8a6a1e;background:#fbf3e2;border-radius:8px;padding:4px 8px;margin-top:6px;display:inline-block}
.tr-pb{font-size:.7rem;color:#2e5c45;margin-top:5px;font-weight:600}
.tr-cnt{font:700 .78rem 'DM Sans',sans-serif;color:var(--muted,#6b7f72)}
.tr-sets{display:grid;gap:6px;margin-top:10px}
.tr-set{display:grid;grid-template-columns:22px minmax(0,130px) minmax(0,130px) auto;justify-content:start;gap:8px;align-items:center}
.tr-set .n{width:22px;height:22px;border-radius:50%;background:#f1ebe0;display:grid;place-items:center;font:700 .68rem 'DM Sans',sans-serif;color:var(--muted,#6b7f72)}
.tr-set.on .n{background:#2e5c45;color:#fff}
.tr-set label{display:flex;align-items:center;gap:6px}.tr-set label small{font-size:.68rem;color:var(--muted,#6b7f72)}
.tr-set .fx-in{padding:7px 8px;text-align:center}
.tr-set.on .fx-ico.eat{background:#2e5c45;border-color:#2e5c45;color:#fff}
.tr-finish{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:14px}.tr-finish span{font-size:.75rem;color:var(--muted,#6b7f72)}
.tr-hero{position:relative;border-radius:16px;overflow:hidden;aspect-ratio:16/8;background:#efe7da;margin-bottom:12px;cursor:pointer}
.tr-hero img{width:100%;height:100%;object-fit:cover;display:block}
.tr-hero span{position:absolute;left:12px;bottom:10px;color:#fff;font:600 .9rem 'DM Sans',sans-serif;text-shadow:0 1px 6px rgba(0,0,0,.5)}
.tr-hero i{width:36px;height:36px;right:12px;bottom:10px;font-size:.8rem}
.tr-cardio,.tr-quick{display:flex;gap:6px;flex-wrap:wrap}
.tr-chip{border:1px solid var(--border,#e4dccd);background:#fff;border-radius:999px;padding:7px 13px;font:600 .74rem 'DM Sans',sans-serif;cursor:pointer;color:var(--text,#1e2820)}
.tr-chip.on{background:#1e2820;border-color:#1e2820;color:#fff}
.tr-cmin{display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap;margin-top:12px}.tr-cmin label{display:grid;gap:4px;font-size:.72rem;color:var(--muted,#6b7f72);max-width:120px}
.tr-set-card,.tr-hist{background:var(--cream,#faf6ef);border:1px solid var(--border,#e4dccd);border-radius:16px;padding:12px 14px;margin-top:12px}
.tr-row{display:grid;gap:5px;margin-top:9px}.tr-row>span{font-size:.7rem;color:var(--muted,#6b7f72);font-weight:600}
.tr-seg{display:flex;background:#efe7da;border-radius:999px;padding:3px;gap:2px}
.tr-seg button{flex:1;border:0;background:none;border-radius:999px;padding:6px 4px;font:600 .68rem 'DM Sans',sans-serif;color:var(--muted,#6b7f72);cursor:pointer}
.tr-seg button.on{background:#fff;color:var(--text,#1e2820);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.tr-set-card p,.tr-hist p{font-size:.72rem;line-height:1.5;color:var(--muted,#6b7f72);margin-top:9px}
.tr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.tr-stats div{background:#fff;border-radius:10px;padding:8px 4px;text-align:center}.tr-stats b{display:block;font-family:'Cormorant Garamond',serif;font-size:1.5rem;line-height:1;color:#2e5c45}.tr-stats span{font-size:.62rem;color:var(--muted,#6b7f72)}
.tr-hist ul{list-style:none;margin:10px 0 0;padding:0}.tr-hist li{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:7px 0;border-top:1px solid var(--border,#e4dccd);font-size:.74rem}
.tr-hist li em{grid-column:1/-1;font-style:normal;color:var(--muted,#6b7f72);font-size:.68rem}
.tr-vid{background:#111;aspect-ratio:16/9;border-radius:20px 20px 0 0;overflow:hidden;max-width:100%}
.tr-vid video{width:100%;height:100%;object-fit:cover;display:block}
.tr-eh{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.tr-eh div{background:var(--cream,#faf6ef);border-radius:12px;padding:9px 11px;font-size:.76rem;line-height:1.45}.tr-eh b{display:block;font-size:.66rem;text-transform:uppercase;letter-spacing:.1em;color:#2e5c45;margin-bottom:2px}
.tr-grid{display:grid;grid-template-columns:300px 1fr;gap:18px;align-items:start}
.tr-side>*:first-child{margin-top:0}
.tr-wkbox{background:var(--cream,#faf6ef);border:1px solid var(--border,#e4dccd);border-radius:16px;padding:12px 14px;margin-top:12px}
.tr-wks{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}
.tr-wk{position:relative;border:1px solid var(--border,#e4dccd);background:#fff;border-radius:10px;padding:6px 2px;display:grid;gap:1px;text-align:center;cursor:pointer;font:inherit;color:inherit}
.tr-wk em{font-style:normal;font-size:.95rem}.tr-wk span{font-size:.56rem;color:var(--muted,#6b7f72)}.tr-wk b{font-size:.55rem;line-height:1.15}
.tr-wk.sel{border-color:#1e2820;box-shadow:0 0 0 1px #1e2820}.tr-wk.lift{background:#f6efe2}
.tr-wk i{position:absolute;top:-5px;right:-4px;width:15px;height:15px;border-radius:50%;background:#2e8a62;color:#fff;font-style:normal;font-size:.55rem;display:grid;place-items:center}
.tr-wk-sum{font-size:.7rem;color:var(--muted,#6b7f72);margin-top:8px}.tr-wk-sum b{color:#2e5c45}
@media(max-width:860px){.tr-grid{grid-template-columns:1fr}.tr-side{order:2}}
.tr-credit{font-size:.62rem;color:var(--muted,#9a8e82);margin-top:8px}
.tr-rest{position:fixed;left:50%;bottom:18px;transform:translate(-50%,140%);z-index:2000;background:#1e2820;color:#fff;border-radius:999px;padding:8px 10px 8px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 14px 40px rgba(0,0,0,.3);transition:transform .3s;font-family:'DM Sans',sans-serif;width:min(440px,calc(100% - 24px))}
.tr-rest.on{transform:translate(-50%,0)}
.tr-rest span{font-size:.7rem;opacity:.7}.tr-rest b{font-size:1.15rem;font-variant-numeric:tabular-nums;min-width:44px}
.tr-rbar{flex:1;height:5px;border-radius:5px;background:#3a463d;overflow:hidden}.tr-rbar i{display:block;height:100%;background:#c8a04a;transition:width 1s linear}
.tr-rest button{border:0;background:#2e3a31;color:#fff;border-radius:999px;padding:6px 10px;font:600 .7rem 'DM Sans',sans-serif;cursor:pointer}
@media(max-width:640px){.tr-ex-h{grid-template-columns:72px 1fr auto;gap:10px}.tr-th{width:72px;height:60px}.tr-set{grid-template-columns:22px 1fr 1fr auto;gap:6px}.tr-eh{grid-template-columns:1fr}}
.fx-tabs:has(> :nth-child(3)){grid-template-columns:repeat(3,1fr)!important}
@media(max-width:640px){.fx-tabs:has(> :nth-child(3)){gap:4px!important;padding:4px!important}.fx-tabs:has(> :nth-child(3)) button{grid-template-columns:1fr!important;text-align:center!important;padding:8px 4px!important;font-size:1rem!important;justify-items:center}.fx-tabs:has(> :nth-child(3)) button .n{grid-row:auto!important;width:24px!important;height:24px!important;font-size:.95rem!important;margin-bottom:2px}.fx-tabs:has(> :nth-child(3)) button small{font-size:.6rem!important}}`;
  const st = document.createElement('style'); st.id = 'trCSS'; st.textContent = css; document.head.appendChild(st);

  window.MTHTrain = { init: a => { H = a; }, main, view, week, settings, history, openEx, EX, MEDIA, poster, clip, exFor, LVL, EQ, DAYS, PAT };
})();
