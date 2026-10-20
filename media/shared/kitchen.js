/* =================================================================
   MARK TALKS HEALTH — SHARED KITCHEN ENGINE (meal planner)
   Used by the Gut Health, Diabetes and GLP-1 protocol apps.
   Adds: 7-day planner with photos, recipe library with search,
   filters and favourites, smarter swaps, batch-cook prep plan,
   servings scaling and short cooking clips on every recipe.
   The host app keeps its own rules for what each day can contain
   (cleanse, refeed, gentle, keto); this engine never overrides them.
   Cooking clips: free-to-use videos from Pexels (pexels.com/license).
================================================================= */
(function () {
  if (window.MTHKitchen) return;
  const VID = 'https://videos.pexels.com/video-files/', IMG = 'https://images.pexels.com/videos/';
  const CLIPS = {
    blend: ['8492293/8492293-sd_960_506_25fps.mp4', '8492293/pexels-photo-8492293.jpeg', 'Blending'],
    juice: ['6707406/6707406-sd_540_960_25fps.mp4', '6707406/adult-body-carefree-celery-6707406.jpeg', 'Fresh green juice'],
    chop: ['856437/856437-sd_960_540_25fps.mp4', '856437/free-video-856437.jpg', 'Prep and chop'],
    eggs: ['5542101/5542101-sd_960_540_24fps.mp4', '5542101/pexels-photo-5542101.jpeg', 'Cooking eggs'],
    sear: ['10432097/10432097-sd_960_540_30fps.mp4', '10432097/baking-beef-bowl-breakfast-10432097.jpeg', 'Pan-searing'],
    soup: ['35629815/15099489_540_960_30fps.mp4', '35629815/pexels-photo-35629815.jpeg', 'Slow simmering'],
    roast: ['3872465/3872465-sd_960_540_25fps.mp4', '3872465/pexels-photo-3872465.jpeg', 'Roasting vegetables'],
    salad: ['6707706/6707706-sd_960_540_25fps.mp4', '6707706/balance-beautiful-bowl-caucasian-6707706.jpeg', 'Building a fresh bowl'],
    icecream: ['8576594/8576594-sd_960_540_30fps.mp4', '8576594/adult-bowl-breakfast-child-8576594.jpeg', 'Scooping a cold bowl'],
    yogurt: ['7791621/7791621-sd_960_506_25fps.mp4', '7791621/pexels-photo-7791621.jpeg', 'Fresh berries']
  };
  function clipFor(r) {
    const t = ((r.title || '') + ' ' + (r.cat || '')).toLowerCase();
    if (/ice cream|nice cream|frozen/.test(t)) return 'icecream';
    if (/juice/.test(t)) return 'juice';
    if (/smoothie|shake|latte/.test(t)) return 'blend';
    if (/broth|soup|stew|chili|curry/.test(t)) return 'soup';
    if (/egg|omelet|omelette|frittata|shakshuka|muffin/.test(t)) return 'eggs';
    if (/yogurt|yoghurt|berr|parfait|chia|oat|pancake/.test(t)) return 'yogurt';
    if (/salad|bowl|wrap|slaw/.test(t)) return 'salad';
    if (/roast|tray|bake|baked|sheet|broccoli|cauliflower/.test(t)) return 'roast';
    if (/salmon|cod|fish|trout|shrimp|prawn|steak|chicken|turkey|pork|lamb|beef|burger|sear/.test(t)) return 'sear';
    return 'chop';
  }

  let H = null;
  const e = s => H.esc(s);
  const S = () => H.S();
  const favs = () => (S().fav = S().fav || {});
  const isFav = id => !!favs()[id];
  const mins = r => (+r.prep || 0) + (+r.cook || 0);
  const img = (r, w) => H.photoURL(r, w);
  const ICO = { swap: '<svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>', heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>' };

  /* ---------- toolbar above the Eat tab ---------- */
  function toolbar(view, extra) {
    return `<div class="kx-bar"><div class="kx-seg"><button type="button" class="${view !== 'week' ? 'on' : ''}" data-kx-view="day">Today</button><button type="button" class="${view === 'week' ? 'on' : ''}" data-kx-view="week">This week</button></div>
      ${extra || ''}
      ${view === 'week' ? `<button type="button" class="fx-btn" data-kx="newweek">${ICO.swap}New week of meals</button>` : ''}
      <button type="button" class="fx-btn" data-kx="lib">📖 Recipe library</button>
      <button type="button" class="fx-btn" data-kx="prep">🥘 Prep plan</button></div>`;
  }

  /* ---------- 7-day planner ---------- */
  function weekView() {
    const M = H.model(), sel = H.sel(), days = [...Array(7)].map((_, i) => H.addD(sel, i)), PT = H.protTarget ? H.protTarget() : null;
    const cols = days.map(x => {
      const d = H.dayIdx(x, M), P = H.phaseOf(d, M), plan = H.planFor(x, M), dt = H.fromISO(x), rec = S().days[x] || { eaten: {} };
      const slots = Object.keys(plan).filter(k => plan[k]).sort((a, b) => H.ORDER.indexOf(a) - H.ORDER.indexOf(b));
      const items = slots.map(k => H.byId(plan[k])).filter(Boolean);
      const kc = items.reduce((a, r) => a + (+r.kcal || 0), 0), pr = items.reduce((a, r) => a + (+r.protein || 0), 0), cb = items.reduce((a, r) => a + (+r.carbs || 0), 0);
      const goalP = PT && P.k !== 'cleanse' ? PT.lo : 0;
      return `<div class="kx-col ${x === sel ? 'sel' : ''}" style="--pc:${H.PCOL[P.k] || '#2e5c45'}">
        <button type="button" class="kx-h" data-day="${x}" data-kx-today="1"><span>${dt.toLocaleDateString(undefined, { weekday: 'short' })} ${dt.getDate()}</span><b>${e(P.short)}</b></button>
        ${slots.map(k => { const r = H.byId(plan[k]); if (!r) return ''; const done = rec.eaten && rec.eaten[k];
          return `<div class="kx-m ${done ? 'done' : ''}"><button type="button" class="kx-mi" data-open="${r.id}"><img loading="lazy" alt="" src="${e(img(r, 240))}" onerror="this.remove()"><span class="kx-s">${H.SLOT[k]}${done ? ' ✓' : ''}</span></button>
            <div class="kx-mt"><button type="button" class="kx-t" data-open="${r.id}">${e(r.title)}</button><span class="kx-k">${r.supp ? '0 kcal' : `${r.kcal} kcal · ${r.protein} g P`}</span></div>
            ${H.canSwap(P, k) ? `<button type="button" class="kx-sw" data-kx-swap="${x}|${k}" aria-label="Swap ${H.SLOT[k]}">${ICO.swap}</button>` : ''}</div>`; }).join('')}
        <div class="kx-f"><div><b>${H.fmt(kc)}</b> kcal</div><div class="${goalP && pr >= goalP ? 'ok' : ''}"><b>${Math.round(pr)}</b> g protein</div><div><b>${Math.round(cb)}</b> g ${e(H.carbLabel || 'net carbs')}</div>
          ${goalP ? `<div class="kx-pb"><i style="width:${Math.min(100, pr / goalP * 100)}%"></i></div>` : ''}</div>
      </div>`; }).join('');
    const tot = days.reduce((a, x) => { const p = H.planFor(x, M); Object.values(p).forEach(id => { const r = H.byId(id); if (r) { a.k += +r.kcal || 0; a.p += +r.protein || 0; } }); return a; }, { k: 0, p: 0 });
    return `<div class="kx-top"><div><div class="fx-slot">Your next 7 days</div><p>Every day follows your protocol phase and lands near your calorie target${PT ? ` with at least <b>${PT.lo} g protein</b>` : ''}. Tap a photo for the recipe, the arrows to swap, or a day to open it.</p></div>
      <div class="kx-avg"><b>${H.fmt(tot.k / 7)}</b><span>kcal a day</span><b>${Math.round(tot.p / 7)}</b><span>g protein a day</span></div></div>
      <div class="kx-grid">${cols}</div>`;
  }
  function newWeek() {
    const M = H.model(), sel = H.sel();
    [...Array(7)].map((_, i) => H.addD(sel, i)).forEach(x => { const P = H.phaseOf(H.dayIdx(x, M), M); if (P.k === 'keto' || P.k === 'gentle') { const rec = S().days[x]; const fav = rec && rec.plan ? Object.keys(rec.plan).filter(k => isFav(rec.plan[k])) : []; const keep = {}; fav.forEach(k => keep[k] = rec.plan[k]); H.planFor(x, M, true); const r2 = S().days[x]; Object.assign(r2.plan, keep); } });
    H.save(); H.rerender(); H.toast('New week of meals. Favourites kept.');
  }

  /* ---------- picker: filters, search, favourites ---------- */
  const FILTERS = [['all', 'All'], ['fav', '♥ Favourites'], ['quick', 'Under 20 min'], ['p25', '25 g+ protein'], ['u400', 'Under 400 kcal'], ['lc', 'Lowest carbs']];
  function filt(list, f, q) {
    q = (q || '').trim().toLowerCase();
    return list.filter(r => f === 'fav' ? isFav(r.id) : f === 'quick' ? mins(r) <= 20 : f === 'p25' ? r.protein >= 25 : f === 'u400' ? r.kcal < 400 : true)
      .filter(r => !q || (r.title + ' ' + (r.ing || []).map(i => i[2]).join(' ') + ' ' + (r.gut || []).join(' ')).toLowerCase().includes(q));
  }
  function card(r, attr, cur) {
    return `<div class="kx-card"><button type="button" class="kx-ci" ${attr}><img loading="lazy" alt="" src="${e(img(r, 400))}" onerror="this.remove()">${isFav(r.id) ? '<i class="kx-fv">♥</i>' : ''}${mins(r) ? `<em>${mins(r)} min</em>` : ''}</button>
      <div class="kx-cb"><button type="button" class="kx-ct" ${attr}>${e(r.title)}</button><div class="kx-cm">${r.kcal} kcal · ${r.protein} g protein · ${r.carbs} g ${e(H.carbLabel || 'net carbs')}</div>
      ${cur ? `<div class="kx-cd">${r.kcal > cur.kcal ? '+' : ''}${r.kcal - cur.kcal} kcal vs current</div>` : ''}</div>
      <button type="button" class="kx-heart ${isFav(r.id) ? 'on' : ''}" data-kx-fav="${r.id}" aria-label="Favourite">${ICO.heart}</button></div>`;
  }
  let PK = null;   // open picker state
  function picker(list, k, iso, curId, title) {
    PK = { list, k, iso, curId, title, f: 'all', q: '', sort: 'fit' };
    H.modal(pickerHTML(), true); bindPicker();
  }
  function pickerHTML() {
    const cur = H.byId(PK.curId);
    let list = filt(PK.list.filter(r => r.id !== PK.curId), PK.f, PK.q);
    list = list.sort(PK.sort === 'protein' ? (a, b) => b.protein - a.protein : PK.sort === 'carbs' ? (a, b) => a.carbs - b.carbs : PK.sort === 'quick' ? (a, b) => mins(a) - mins(b) : (a, b) => Math.abs(a.kcal - (cur ? cur.kcal : 0)) - Math.abs(b.kcal - (cur ? cur.kcal : 0)));
    return `<div class="fx-pad kx-pick"><div class="fx-kicker">${e(PK.title)}</div><h2>Choose a different ${e(H.SLOT[PK.k].toLowerCase())}</h2>
      ${cur ? `<p class="fx-mm" style="margin-top:4px">Now: <b>${e(cur.title)}</b> · ${cur.kcal} kcal · ${cur.protein} g protein</p>` : ''}
      <div class="kx-tools"><input class="fx-in" type="search" placeholder="Search recipes or ingredients" value="${e(PK.q)}" data-kx-q="1">
        <select class="fx-in" data-kx-sort="1">${[['fit', 'Closest calories'], ['protein', 'Most protein'], ['carbs', 'Fewest carbs'], ['quick', 'Quickest']].map(([v, l]) => `<option value="${v}" ${PK.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <div class="kx-chips">${FILTERS.map(([v, l]) => `<button type="button" class="kx-chip ${PK.f === v ? 'on' : ''}" data-kx-f="${v}">${l}</button>`).join('')}</div>
      <div class="kx-cards">${list.map(r => card(r, `data-kx-pick="${r.id}"`, cur)).join('') || `<p class="kx-empty">${PK.f === 'fav' ? 'No favourites here yet. Tap the heart on any recipe to save it.' : 'Nothing matches. Try another search.'}</p>`}</div></div>`;
  }
  function repaintPicker(keepFocus) {
    const box = document.querySelector('#fxModal .kx-pick'); if (!box) return;
    const pos = keepFocus ? (box.querySelector('[data-kx-q]') || {}).selectionStart : null;
    box.outerHTML = pickerHTML(); bindPicker();
    if (keepFocus) { const i = document.querySelector('#fxModal [data-kx-q]'); if (i) { i.focus(); try { i.setSelectionRange(pos, pos); } catch (er) {} } }
  }
  function bindPicker() {
    const q = document.querySelector('#fxModal [data-kx-q]'); if (q) q.oninput = () => { PK.q = q.value; repaintPicker(true); };
    const so = document.querySelector('#fxModal [data-kx-sort]'); if (so) so.onchange = () => { PK.sort = so.value; repaintPicker(); };
  }
  function openSwap(k, iso, list, title) {
    const rec = H.dayRec(iso); picker(list, k, iso, rec.plan[k], title);
  }

  /* ---------- recipe library ---------- */
  let LB = null;
  function openLibrary() { LB = { f: 'all', q: '', cat: 'all' }; H.modal(libHTML(), true); bindLib(); }
  function libHTML() {
    const cats = H.libCats || ['Breakfast', 'Lunch', 'Dinner', 'Treat'];
    let list = H.R().filter(r => cats.includes(r.cat) && (r.phase || []).includes('restore'));
    const total = list.length;
    if (LB.cat !== 'all') list = list.filter(r => r.cat === LB.cat);
    list = filt(list, LB.f, LB.q).sort((a, b) => (isFav(b.id) - isFav(a.id)) || (b.protein / Math.max(1, b.kcal) - a.protein / Math.max(1, a.kcal)));
    return `<div class="fx-pad kx-lib"><div class="fx-kicker">Recipe library · ${total} recipes</div><h2>Find a meal</h2>
      <div class="kx-tools"><input class="fx-in" type="search" placeholder="Search recipes or ingredients" value="${e(LB.q)}" data-kx-lq="1"></div>
      <div class="kx-chips">${[['all', 'All meals']].concat(cats.map(c => [c, c])).map(([v, l]) => `<button type="button" class="kx-chip ${LB.cat === v ? 'on' : ''}" data-kx-cat="${e(v)}">${e(l)}</button>`).join('')}</div>
      <div class="kx-chips">${FILTERS.map(([v, l]) => `<button type="button" class="kx-chip sm ${LB.f === v ? 'on' : ''}" data-kx-lf="${v}">${l}</button>`).join('')}</div>
      <div class="kx-cards">${list.map(r => card(r, `data-open="${r.id}"`)).join('') || '<p class="kx-empty">Nothing matches. Try another search.</p>'}</div></div>`;
  }
  function repaintLib(keepFocus) {
    const box = document.querySelector('#fxModal .kx-lib'); if (!box) return;
    box.outerHTML = libHTML(); bindLib();
    if (keepFocus) { const i = document.querySelector('#fxModal [data-kx-lq]'); if (i) { i.focus(); const n = i.value.length; try { i.setSelectionRange(n, n); } catch (er) {} } }
  }
  function bindLib() { const q = document.querySelector('#fxModal [data-kx-lq]'); if (q) q.oninput = () => { LB.q = q.value; repaintLib(true); }; }

  /* ---------- batch-cook prep plan ---------- */
  function openPrep() {
    const M = H.model(), sel = H.sel(), days = [...Array(7)].map((_, i) => H.addD(sel, i)), uses = {};
    days.forEach((x, di) => { const p = H.planFor(x, M); Object.keys(p).forEach(k => { const r = H.byId(p[k]); if (!r || r.supp || !(r.ing || []).length) return; (uses[r.id] = uses[r.id] || { r, n: 0, days: [] }).n++; uses[r.id].days.push(di); }); });
    const list = Object.values(uses).sort((a, b) => b.n - a.n || mins(b.r) - mins(a.r));
    const batch = list.filter(u => u.n > 1 || (u.r.batch && (u.r.batch.fridge || u.r.batch.freezer) && mins(u.r) >= 30)).slice(0, 6), rest = list.filter(u => !batch.includes(u));
    const wd = i => H.fromISO(days[i]).toLocaleDateString(undefined, { weekday: 'short' });
    const row = u => `<div class="kx-pr"><button type="button" class="kx-pi" data-open="${u.r.id}"><img loading="lazy" alt="" src="${e(img(u.r, 240))}" onerror="this.remove()"></button>
      <div><button type="button" class="kx-ct" data-open="${u.r.id}">${e(u.r.title)}</button><div class="kx-cm">Make <b>${u.n} serving${u.n > 1 ? 's' : ''}</b> · eaten ${u.days.map(wd).join(', ')}${mins(u.r) ? ' · ' + mins(u.r) + ' min' : ''}</div>
      ${u.r.batch && u.r.batch.note ? `<div class="kx-note">${e(u.r.batch.note)}</div>` : ''}
      <div class="kx-keep">${u.r.batch && u.r.batch.fridge ? `<span>Fridge ${u.r.batch.fridge} days</span>` : ''}${u.r.batch && u.r.batch.freezer ? '<span>Freezes well</span>' : ''}</div></div></div>`;
    H.modal(`<div class="fx-pad kx-prep"><div class="fx-kicker">Batch-cook plan · next 7 days</div><h2>Your prep session</h2>
      <p class="fx-mm" style="margin-top:6px">${batch.length ? `Cook these ${batch.length} in one session (a Sunday afternoon works well) and the bigger meals of the week are ready. Portion into containers as you go.` : 'Everything this week is quick to make fresh.'}</p>
      ${batch.length ? `<h4 class="kx-h4">Cook once, eat all week</h4>${batch.map(row).join('')}` : ''}
      ${rest.length ? `<h4 class="kx-h4">Make fresh on the day</h4>${rest.map(row).join('')}` : ''}
      ${!list.length ? '<p class="kx-empty">Nothing to cook this week: you are in a cleanse phase.</p>' : ''}
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button type="button" class="fx-btn dark" data-fx="shop">🛒 Shopping list for these</button></div></div>`, true);
  }

  /* ---------- recipe sheet: favourite, servings, cooking clip ---------- */
  function enhanceRecipe(r) {
    const box = document.querySelector('#fxModal .fx-box'); if (!box || !r) return;
    const hero = box.querySelector('.fx-rhero'), c = CLIPS[clipFor(r)];
    if (hero && c && !hero.querySelector('.kx-play')) {
      hero.insertAdjacentHTML('beforeend', `<button type="button" class="kx-play" data-kx-clip="${clipFor(r)}"><i>▶</i>${e(c[2])} clip</button>`);
    }
    const h2 = box.querySelector('.fx-rbody h2');
    if (h2 && !box.querySelector('.kx-rtools')) {
      h2.insertAdjacentHTML('afterend', `<div class="kx-rtools"><button type="button" class="kx-heart big ${isFav(r.id) ? 'on' : ''}" data-kx-fav="${r.id}">${ICO.heart}<span>${isFav(r.id) ? 'Saved' : 'Save'}</span></button>
        ${(r.ing || []).length ? `<div class="kx-serv"><span>Servings</span><button type="button" data-kx-serv="-1" aria-label="Fewer servings">−</button><b data-kx-sv>${r.serv || 1}</b><button type="button" data-kx-serv="1" aria-label="More servings">+</button></div>` : ''}
        ${mins(r) ? `<span class="kx-time">⏱ ${mins(r)} min${r.chill ? ' + ' + Math.round(r.chill / 60 * 10) / 10 + ' h chill' : ''}</span>` : ''}</div>`);
      box._kxR = r; box._kxN = r.serv || 1;
    }
  }
  function scaleIng(box, n) {
    const r = box._kxR, list = box.querySelector('.fx-ing'); if (!r || !list) return;
    const f = n / Math.max(1, r.serv || 1);
    list.innerHTML = r.ing.map(([q, u, nm]) => `<li><b>${e(H.qfmt((+q || 0) * f, u))}</b><span>${e(nm)}</span></li>`).join('');
    const sv = box.querySelector('[data-kx-sv]'); if (sv) sv.textContent = n;
    const lbl = box.querySelector('.fx-r2 h4 .fx-mm'); if (lbl) lbl.textContent = `(${n} serving${n > 1 ? 's' : ''})`;
  }
  function servPicker() {
    const n = S().serv || 1;
    return `<div class="kx-serv shop"><span>Shopping for</span><button type="button" data-kx-shop="-1" aria-label="Fewer people">−</button><b>${n} ${n > 1 ? 'people' : 'person'}</b><button type="button" data-kx-shop="1" aria-label="More people">+</button></div>`;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', ev => {
    if (!H) return;
    const b = ev.target.closest('[data-kx],[data-kx-view],[data-kx-swap],[data-kx-pick],[data-kx-fav],[data-kx-f],[data-kx-lf],[data-kx-cat],[data-kx-clip],[data-kx-serv],[data-kx-shop],[data-kx-today]'); if (!b) return;
    const d = b.dataset;
    if (d.kxToday) { S().eatView = 'day'; H.save(); return; }   // the host then opens that day
    ev.stopPropagation(); ev.preventDefault();
    if (d.kxView) { S().eatView = d.kxView; H.save(); H.rerender(); return; }
    if (d.kx === 'newweek') return newWeek();
    if (d.kx === 'lib') return openLibrary();
    if (d.kx === 'prep') return openPrep();
    if (d.kxSwap) { const [x, k] = d.kxSwap.split('|'); return H.openSwap(k, x); }
    if (d.kxPick) { const rec = H.dayRec(PK.iso); rec.plan[PK.k] = d.kxPick; rec.eaten[PK.k] = false; H.save(); H.closeModal(); H.rerender(); H.toast('Meal swapped'); return; }
    if (d.kxFav) { const f = favs(); if (f[d.kxFav]) delete f[d.kxFav]; else f[d.kxFav] = 1; H.save();
      const on = !!f[d.kxFav]; document.querySelectorAll(`[data-kx-fav="${d.kxFav}"]`).forEach(x => { x.classList.toggle('on', on); const s = x.querySelector('span'); if (s) s.textContent = on ? 'Saved' : 'Save'; });
      H.toast(on ? 'Saved to favourites. New weeks keep it.' : 'Removed from favourites'); return; }
    if (d.kxF) { PK.f = d.kxF; repaintPicker(); return; }
    if (d.kxLf) { LB.f = d.kxLf; repaintLib(); return; }
    if (d.kxCat) { LB.cat = d.kxCat; repaintLib(); return; }
    if (d.kxClip) { const c = CLIPS[d.kxClip], hero = b.closest('.fx-rhero'); if (!c || !hero) return;
      hero.insertAdjacentHTML('beforeend', `<video class="kx-vid" src="${VID + c[0]}" poster="${IMG + c[1]}?auto=compress&w=900" autoplay muted loop playsinline></video>`); b.remove(); return; }
    if (d.kxServ) { const box = b.closest('.fx-box'); box._kxN = Math.max(1, Math.min(12, (box._kxN || 1) + (+d.kxServ))); scaleIng(box, box._kxN); return; }
    if (d.kxShop) { S().serv = Math.max(1, Math.min(8, (S().serv || 1) + (+d.kxShop))); H.save(); H.openShop(); return; }
  }, true);
  document.addEventListener('click', ev => { if (ev.target.closest('[data-close]')) document.querySelectorAll('.kx-vid').forEach(v => { try { v.pause(); } catch (er) {} }); }, true);

  const css = `
.kx-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 14px}
.kx-seg{display:inline-flex;background:var(--cream,#faf6ef);border:1px solid var(--border,#e4dccd);border-radius:999px;padding:3px}
.kx-seg button{border:0;background:transparent;border-radius:999px;padding:6px 14px;font:600 .76rem 'DM Sans',sans-serif;color:var(--muted,#6b7f72);cursor:pointer}
.kx-seg button.on{background:#1e2820;color:#fff}
.kx-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;flex-wrap:wrap}.kx-top p{font-size:.8rem;color:var(--muted,#6b7f72);margin:3px 0 0;max-width:620px;line-height:1.5}
.kx-avg{display:grid;grid-template-columns:auto auto;gap:0 6px;align-items:baseline;font-size:.68rem;color:var(--muted,#6b7f72)}.kx-avg b{font-family:'Cormorant Garamond',serif;font-size:1.35rem;color:#2e5c45;text-align:right}
.kx-grid{display:grid;grid-template-columns:repeat(7,minmax(168px,1fr));gap:10px;overflow-x:auto;padding:4px 2px 8px;margin-top:10px;scroll-snap-type:x proximity}
.kx-col{background:#fff;border:1px solid var(--border,#e4dccd);border-top:4px solid var(--pc);border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:7px;min-width:0;scroll-snap-align:start}
.kx-col.sel{box-shadow:0 0 0 2px #1e2820}
.kx-h{border:0;background:none;text-align:left;cursor:pointer;padding:2px 2px 2px;display:flex;justify-content:space-between;align-items:baseline;font:inherit}
.kx-h span{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--text,#1e2820)}.kx-h b{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--pc)}
.kx-m{position:relative;background:var(--cream,#faf6ef);border-radius:11px;overflow:hidden}
.kx-m.done{opacity:.55}
.kx-mi{display:block;width:100%;aspect-ratio:16/9;border:0;padding:0;background:#efe7da;position:relative;cursor:pointer}
.kx-mi img{width:100%;height:100%;object-fit:cover;display:block}
.kx-s{position:absolute;left:6px;top:6px;background:rgba(255,255,255,.92);border-radius:999px;padding:2px 7px;font-size:.55rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:#2e5c45}
.kx-mt{padding:6px 28px 7px 8px}
.kx-t{border:0;background:none;padding:0;text-align:left;font:600 .76rem/1.25 'DM Sans',sans-serif;color:var(--text,#1e2820);cursor:pointer}
.kx-k{display:block;font-size:.62rem;color:var(--muted,#6b7f72);margin-top:2px}
.kx-sw{position:absolute;right:5px;bottom:7px;width:22px;height:22px;border:0;border-radius:50%;background:#fff;cursor:pointer;display:grid;place-items:center;padding:0;box-shadow:0 1px 3px rgba(0,0,0,.12)}
.kx-sw svg,.fx-btn svg{width:13px;height:13px;stroke:#2e5c45;fill:none;stroke-width:2}
.kx-f{margin-top:auto;font-size:.64rem;color:var(--muted,#6b7f72);display:grid;grid-template-columns:1fr 1fr;gap:2px 6px;padding-top:4px}
.kx-f b{color:var(--text,#1e2820)}.kx-f .ok b{color:#2e8a62}
.kx-pb{grid-column:1/-1;height:5px;border-radius:9px;background:#ece5da;overflow:hidden}.kx-pb i{display:block;height:100%;background:#2e8a62}
.kx-tools{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:12px}.kx-lib .kx-tools{grid-template-columns:1fr}
.kx-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.kx-chip{border:1px solid var(--border,#e4dccd);background:#fff;border-radius:999px;padding:6px 12px;font:600 .72rem 'DM Sans',sans-serif;cursor:pointer;color:var(--text,#1e2820)}
.kx-chip.sm{padding:5px 10px;font-size:.68rem}.kx-chip.on{background:#1e2820;border-color:#1e2820;color:#fff}
.kx-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-top:14px}
.kx-card{position:relative;background:#fff;border:1px solid var(--border,#e4dccd);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.kx-ci{display:block;border:0;padding:0;aspect-ratio:4/3;background:#efe7da;position:relative;cursor:pointer}.kx-ci img{width:100%;height:100%;object-fit:cover;display:block}
.kx-ci em{position:absolute;left:8px;bottom:8px;background:rgba(30,40,32,.78);color:#fff;font-style:normal;font-size:.62rem;font-weight:600;border-radius:999px;padding:2px 8px}
.kx-fv{position:absolute;left:8px;top:8px;color:#c85a3a;font-style:normal;font-size:.9rem}
.kx-cb{padding:9px 11px 11px}
.kx-ct{border:0;background:none;padding:0;text-align:left;font:600 .84rem/1.3 'DM Sans',sans-serif;color:var(--text,#1e2820);cursor:pointer}
.kx-cm{font-size:.68rem;color:var(--muted,#6b7f72);margin-top:3px;line-height:1.4}.kx-cd{font-size:.64rem;color:#8a6a1e;margin-top:3px}
.kx-heart{position:absolute;right:8px;top:8px;width:30px;height:30px;border-radius:50%;border:0;background:rgba(255,255,255,.92);display:grid;place-items:center;cursor:pointer;padding:0}
.kx-heart svg{width:16px;height:16px;stroke:#c85a3a;fill:none;stroke-width:2}.kx-heart.on svg{fill:#c85a3a}
.kx-heart.big{position:static;width:auto;height:auto;display:inline-flex;gap:6px;align-items:center;border:1px solid var(--border,#e4dccd);border-radius:999px;padding:6px 12px;font:600 .74rem 'DM Sans',sans-serif;color:var(--text,#1e2820)}
.kx-empty{font-size:.8rem;color:var(--muted,#6b7f72);padding:20px 0}
.kx-rtools{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:8px 0 4px}
.kx-serv{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border,#e4dccd);border-radius:999px;padding:3px 4px 3px 12px;font:600 .72rem 'DM Sans',sans-serif;background:#fff}
.kx-serv span{color:var(--muted,#6b7f72);font-weight:500}.kx-serv b{min-width:18px;text-align:center}
.kx-serv button{width:26px;height:26px;border-radius:50%;border:0;background:#f1ebe0;cursor:pointer;font:700 .9rem 'DM Sans',sans-serif;color:var(--text,#1e2820)}
.kx-serv.shop{margin:10px 0 4px}
.kx-time{font-size:.72rem;color:var(--muted,#6b7f72)}
.kx-play{position:absolute;left:14px;bottom:14px;display:inline-flex;gap:8px;align-items:center;border:0;border-radius:999px;background:rgba(255,255,255,.94);padding:7px 14px 7px 7px;font:600 .74rem 'DM Sans',sans-serif;color:#1e2820;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.kx-play i{width:24px;height:24px;border-radius:50%;background:#2e5c45;color:#fff;font-style:normal;font-size:.6rem;display:grid;place-items:center;padding-left:2px}
.fx-rhero{position:relative}.kx-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.kx-h4{margin:16px 0 6px;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#2e5c45}
.kx-pr{display:grid;grid-template-columns:92px 1fr;gap:12px;align-items:start;padding:10px 0;border-top:1px solid var(--border,#e4dccd)}
.kx-pi{border:0;padding:0;border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:#efe7da;cursor:pointer}.kx-pi img{width:100%;height:100%;object-fit:cover;display:block}
.kx-note{font-size:.72rem;background:#f6efe2;border-radius:8px;padding:5px 8px;margin-top:5px;line-height:1.45}
.kx-keep{display:flex;gap:6px;margin-top:5px}.kx-keep span{font-size:.62rem;background:#e7ecdd;color:#4c6142;border-radius:999px;padding:2px 8px;font-weight:600}
@media(max-width:640px){.kx-grid{grid-template-columns:repeat(7,78%)}.kx-tools{grid-template-columns:1fr}.kx-cards{grid-template-columns:1fr 1fr;gap:8px}.kx-cb{padding:7px 8px 9px}.kx-ct{font-size:.76rem}}`;
  const st = document.createElement('style'); st.id = 'kxCSS'; st.textContent = css; document.head.appendChild(st);

  window.MTHKitchen = { init: a => { H = a; }, toolbar, weekView, newWeek, picker, openSwap, openLibrary, openPrep, enhanceRecipe, servPicker, clipFor, CLIPS };
})();
