/* =================================================================
   MARK TALKS HEALTH — OWN SITE CORE
   Every page loads this after assets/vendor/supabase-*.js.
   - sign-in (email code) with "remember me"
   - who owns what (mth_enrollments in Supabase)
   - header, footer, toasts
   - Stripe checkout (test mode until Mark switches it on)
   Edit CONFIG below; everything else follows.
================================================================= */
(function(){
  var CONFIG={
    supabaseUrl:"https://oihefcsonqjeicelezln.supabase.co",
    supabaseKey:"sb_publishable_vxaKCnn-2XlvV7MmoV3wqg_dxgdqtz2",
    /* the three protocols: sales page, course and app for each */
    products:{
      gut:  { name:"Gut Health Protocol", short:"Gut Health", price:"$97", was:"$147", sales:"gut.html",      course:"course.html?p=gut",   app:"app.html?p=gut",   img:"1-fasting", thumb:"/media/site/courses/gut.jpg", line:"Calm the gut lining and rebuild your microbiome with a guided juice cleanse." },
      sugar:{ name:"Diabetes Protocol",   short:"Diabetes",   price:"$97", was:"$147", sales:"diabetes.html", course:"course.html?p=sugar", app:"app.html?p=sugar", img:"3-high-protein",    thumb:"/media/site/courses/sugar.jpg", line:"Gain control of your blood sugar and enjoy steadier energy with your personalised protocol." },
      glp1: { name:"GLP-1 Weight Loss Protocol", short:"GLP-1", price:"$97", was:"$147", sales:"glp1.html",   course:"course.html?p=glp1",  app:"app.html?p=glp1",  img:"4-cardio",  thumb:"/media/site/courses/glp1.jpg", line:"Lose fat while protecting muscle. A customised roadmap for using GLP-1s intelligently." }
    },
    order:["gut","sugar","glp1"],
    stripeKey:"",                        /* Stripe publishable key (pk_live_…): turns on the pop-up checkout. Empty = full-page Stripe checkout */
    testMode:false,                      /* shows the "test checkout" ribbon; set false when Stripe is live */
    assets:"/media/site/"   /* photos already hosted with the old site */
  };
  var H=document.documentElement;
  var REMEMBER="mth_remember";

  /* ---------- storage that follows "remember me" ----------
     Remember me ON (default on phones): stays signed in on this device.
     OFF: signed out when the browser is closed. */
  function ls(){ try{ return window.localStorage; }catch(e){ return null; } }
  function ss(){ try{ return window.sessionStorage; }catch(e){ return null; } }
  function remembered(){ var l=ls(); var v=l&&l.getItem(REMEMBER); return v!=="0"; }
  var store={
    getItem:function(k){ var a=ls(), b=ss(); return (b&&b.getItem(k))||(a&&a.getItem(k))||null; },
    setItem:function(k,v){ var a=ls(), b=ss(); if(remembered()){ a&&a.setItem(k,v); b&&b.removeItem(k); } else { b&&b.setItem(k,v); a&&a.removeItem(k); } },
    removeItem:function(k){ var a=ls(), b=ss(); a&&a.removeItem(k); b&&b.removeItem(k); }
  };
  var sb=window.supabase.createClient(CONFIG.supabaseUrl,CONFIG.supabaseKey,{
    auth:{ storage:store, storageKey:"mth-auth", persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, flowType:"implicit" }
  });

  var M=window.MTH={ config:CONFIG, sb:sb, user:null, owned:[] };
  M.base=location.href.replace(/[#?].*$/,"").replace(/[^/]*$/,"");
  M.page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  M.esc=function(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  M.qs=function(k){ try{ return new URLSearchParams(location.search).get(k); }catch(e){ return null; } };
  M.setRemember=function(on){ var l=ls(); if(l) l.setItem(REMEMBER,on?"1":"0"); };
  M.remembered=remembered;
  /* ---------- conversion tracking: where visitors came from, and what they did ----------
     first touch (utm_* from social posts / tracking links) is kept on the device and credited
     to the list sign-up, account and purchase. Visits are logged once per browser session. */
  (function(){
    var l=ls(), id=l&&l.getItem("mth_anon");
    if(!id){ id="a"+Math.random().toString(36).slice(2)+Date.now().toString(36); try{ l&&l.setItem("mth_anon",id); }catch(e){} }
    M.anon=id;
    var q={}; try{ new URLSearchParams(location.search).forEach(function(v,k){ if(/^utm_(source|medium|campaign|content|term)$/.test(k)) q[k]=v.slice(0,80); }); }catch(e){}
    var ref=""; try{ ref=document.referrer?new URL(document.referrer).hostname:""; }catch(e){}
    if(ref&&ref!==location.hostname&&!q.utm_source){ q.utm_source=ref.replace(/^www\./,"").replace(/^(l|m|lm)\./,""); q.utm_medium="referral"; }
    var has=Object.keys(q).length>0;
    if(has){ q.landing=M.page||"index.html"; try{ if(!l.getItem("mth_first")) l.setItem("mth_first",JSON.stringify(q)); l.setItem("mth_last",JSON.stringify(q)); }catch(e){} }
    M.utm=function(){ try{ return JSON.parse(l.getItem("mth_first")||"null")||JSON.parse(l.getItem("mth_last")||"null"); }catch(e){ return null; } };
    M.track=function(ev,product){ try{ sb.rpc("mth_track",{ p_anon:M.anon, p_event:ev, p_page:M.page, p_utm:(ev==="visit"&&has)?q:M.utm(), p_product:product||null }).then(function(){},function(){}); }catch(e){} };
    var sk="mth_v_"+M.page; var ses=ss();
    if(M.page!=="admin.html"&&(has||!(ses&&ses.getItem("mth_v")))){ try{ ses&&ses.setItem("mth_v","1"); }catch(e){} M.track("visit"); }
  })();
  M.isPhone=function(){ try{ return matchMedia("(pointer: coarse)").matches&&Math.min(screen.width,screen.height)<=820; }catch(e){ return false; } };

  /* ---------- who is here, and what they own ---------- */
  async function loadOwned(){
    if(!M.user){ M.owned=[]; return; }
    try{
      var r=await sb.from("mth_enrollments").select("product,livemode,created_at");
      M.owned=(r.data||[]).map(function(x){ return x.product; });
    }catch(e){ console.warn("[mth] enrolments",e); M.owned=[]; }
  }
  M.owns=function(p){ return M.owned.indexOf(p)>-1; };
  M.ownsAny=function(){ return M.owned.length>0; };
  /* which protocol a page is about: ?p=, then the sales page, then the last one used, then the first owned */
  M.product=function(){
    var p=M.qs("p"); if(CONFIG.products[p]) return p;
    for(var k in CONFIG.products) if(CONFIG.products[k].sales===M.page) return k;
    var last=null; try{ last=localStorage.getItem("mth_last_product"); }catch(e){}
    if(CONFIG.products[last]&&(!M.owned.length||M.owns(last))) return last;
    return M.owned[0]||"gut";
  };
  M.remember=function(p){ try{ localStorage.setItem("mth_last_product",p); }catch(e){} };
  M.refresh=async function(){
    var s=await sb.auth.getSession();
    M.session=s.data.session||null; M.user=M.session?M.session.user:null;
    window.MTH_USER=M.user?{ id:M.user.id, email:(M.user.email||"").toLowerCase() }:null;
    await loadOwned();
    if(M.user){ var hk="mth_hello_"+M.user.id; try{ if(!localStorage.getItem(hk)){ localStorage.setItem(hk,"1");
      sb.rpc("mth_hello",{ p_anon:M.anon, p_utm:M.utm() }).then(function(){ return M.fn("mth-sync",{ action:"signup" }); }).then(function(){},function(){}); } }catch(e){} }
    H.classList.toggle("mx-in",!!M.user); H.classList.toggle("mx-out",!M.user);
    return M;
  };
  /* course names and thumbnails Mark changed in the admin Course builder */
  async function loadCourseMeta(){
    try{
      var r=await sb.from("mth_course_meta").select("product,title,thumb_url");
      (r.data||[]).forEach(function(m){ var P=CONFIG.products[m.product]; if(!P) return;
        if(m.title) P.name=m.title;
        if(m.thumb_url) P.thumb=/^https?:\/\//i.test(m.thumb_url)?m.thumb_url:CONFIG.supabaseUrl+"/storage/v1/object/public/site-media/"+m.thumb_url; });
    }catch(e){ console.warn("[mth] course names",e); }
  }
  /* ---------- words Mark changed in Admin -> Website words (mth_site_text) ---------- */
  M.pageKey=(M.page.replace(/\.html?$/,"")||"index");
  M.words=[];
  async function loadWords(){
    try{ var r=await sb.from("mth_site_text").select("key,orig,html").eq("page",M.pageKey); M.words=r.data||[]; }
    catch(e){ M.words=[]; }
  }
  var TXT="h1,h2,h3,h4,p,li,blockquote,figcaption,.k,.kick,.lead,.sig,.hp-n,.hp-q,.hp-t span,.hp-chips span,.hp-k,.hp-row5 p,.hp-bars p,small,a.btn,a.b,button.btn,.tryit span,.ticks span,.trust span,.lvr span";
  var SKIP="script,style,template,form,[data-mth-quiz],.mthp,.mthv,.mx-list,.tdetail,.lvl,.dayplan,.seg,.tl,[data-noedit],.mx-h,.mx-f,.mx-sheet,.mx-test,.mx-modal,.mx-toast,.mte-bar";
  function norm(s){ return String(s||"").replace(/\s+/g," ").trim(); }
  M.normText=norm;
  /* the pieces of text on a page that can be edited, outermost first, in page order */
  M.textEls=function(root){
    return [].slice.call(root.querySelectorAll(TXT)).filter(function(el){
      if(el.closest(SKIP)) return false;
      for(var p=el.parentElement;p&&p!==root;p=p.parentElement) if(p.matches(TXT)) return false;
      return norm(el.textContent).length>0;
    });
  };
  /* only simple formatting survives: no scripts, no event handlers */
  M.cleanHtml=function(h){
    var t=document.createElement("template"); t.innerHTML=String(h==null?"":h);
    (function walk(n){ [].slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===1){
        if(/^(script|style|iframe|object|embed|link|meta|math|form|input|textarea|select|template|base)$/i.test(c.tagName)){ c.remove(); return; }
        [].slice.call(c.attributes).forEach(function(a){ var k=a.name.toLowerCase();
          if(!/^(class|style|href|target|rel|viewbox|d|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|aria-hidden)$/.test(k)) c.removeAttribute(a.name);
          else if(k==="href"&&/^\s*(javascript|data|vbscript):/i.test(a.value)) c.removeAttribute(a.name);
          else if(k==="style"&&/url\s*\(|expression|javascript:/i.test(a.value)) c.removeAttribute(a.name); });
        walk(c);
      } else if(c.nodeType!==3) c.remove();
    }); })(t.content);
    return t.innerHTML;
  };
  M.applyWords=function(root){
    if(!root) return;
    var els=M.textEls(root);
    els.forEach(function(el,i){ if(!el.__mw) el.__mw={ key:"t"+i, html:el.innerHTML, text:norm(el.textContent), saveKey:null }; });
    (M.words||[]).forEach(function(w){
      var hit=els.filter(function(e){ return !e.__mw.saveKey&&e.__mw.key===w.key&&e.__mw.text===w.orig; })[0]
            ||els.filter(function(e){ return !e.__mw.saveKey&&e.__mw.text===w.orig; })[0];
      if(hit){ hit.innerHTML=M.cleanHtml(w.html); hit.__mw.saveKey=w.key; }
    });
    M.wordsRoot=root;
  };
  M.ready=Promise.all([M.refresh(),loadCourseMeta(),loadWords()]).then(function(){ return M; });
  sb.auth.onAuthStateChange(function(ev){
    if(ev==="SIGNED_OUT"){ M.user=null; M.owned=[]; window.MTH_USER=null; }
  });

  M.signOut=async function(){
    try{ await sb.auth.signOut(); }catch(e){}
    store.removeItem("mth-auth");
    location.href="index.html";
  };
  M.loginUrl=function(next){ return "login.html?next="+encodeURIComponent(next||M.page+location.search+location.hash); };

  /* page guard: sign-in (and optionally a purchase) required */
  M.require=async function(product){
    await M.ready;
    if(!M.user){ location.replace(M.loginUrl()); return new Promise(function(){}); }
    if(product&&!M.owns(product)){ location.replace(CONFIG.products[product].sales+"?locked=1#checkout"); return new Promise(function(){}); }
    return M;
  };

  /* ---------- checkout (Stripe, via the mth-checkout edge function) ---------- */
  M.fn=async function(name,body){
    var s=(await sb.auth.getSession()).data.session;
    var r=await fetch(CONFIG.supabaseUrl+"/functions/v1/"+name,{ method:"POST",
      headers:{ "Content-Type":"application/json", apikey:CONFIG.supabaseKey, Authorization:"Bearer "+(s?s.access_token:CONFIG.supabaseKey) },
      body:JSON.stringify(body||{}) });
    var j={}; try{ j=await r.json(); }catch(e){}
    if(!r.ok&&!j.error) j.error="http_"+r.status;
    return j;
  };
  M.buy=async function(product,btn){
    product=product||"gut";
    await M.ready;
    var inl=document.querySelector(".mx-co");
    if(inl&&!(M.user&&M.owns(product))){ M.showCheckout(product); return; }
    /* no sign-in needed to buy: Stripe asks for the email and the account is made after payment */
    if(M.user&&M.owns(product)){ location.href=CONFIG.products[product].course; return; }
    var old=btn&&btn.innerHTML; if(btn){ btn.disabled=true; btn.innerHTML="Opening secure checkout…"; }
    M.track("checkout",product);
    try{
      if(CONFIG.stripeKey){
        var e=await M.fn("mth-checkout",{ product:product, return_base:M.base, embedded:true });
        if(e.client_secret){ await M.payPopup(e.client_secret,product); if(btn){ btn.disabled=false; btn.innerHTML=old; } return; }
        if(e.already){ await M.refresh(); location.href=CONFIG.products[product].course; return; }
        /* anything else: fall back to the full-page checkout below */
      }
      var j=await M.fn("mth-checkout",{ product:product, return_base:M.base });
      if(j.url){ location.href=j.url; return; }
      if(j.already){ await M.refresh(); location.href=CONFIG.products[product].course; return; }
      var why={ stripe_not_configured:"Checkout isn't switched on yet: the Stripe test key still needs to be added in Supabase.",
                live_key_blocked:"A live Stripe key was added, but live payments are still switched off on purpose.",
                sign_in_required:"Please sign in again, then try once more." }[j.error]||("Checkout couldn't start ("+(j.message||j.error||"unknown")+"). Please try again.");
      M.modal("Checkout unavailable",why,[["OK",null,"dark"]]);
    }catch(e){ M.modal("Checkout unavailable","We couldn't reach checkout. Check your connection and try again.",[["OK",null,"dark"]]); }
    if(btn){ btn.disabled=false; btn.innerHTML=old; }
  };

  /* ---------- pop-up checkout: Stripe's own secure form, shown on our page ---------- */
  var stripeJs=null;
  function loadStripe(){
    if(stripeJs) return stripeJs;
    stripeJs=new Promise(function(ok,bad){ if(window.Stripe) return ok(window.Stripe);
      var sc=document.createElement("script"); sc.src="https://js.stripe.com/v3/"; sc.onload=function(){ ok(window.Stripe); }; sc.onerror=function(){ stripeJs=null; bad(new Error("stripe.js")); }; document.head.appendChild(sc); });
    return stripeJs;
  }
  M.payPopup=async function(secret,product){
    var P=CONFIG.products[product]||{};
    var m=document.createElement("div"); m.className="mx-pay"; m.setAttribute("role","dialog"); m.setAttribute("aria-modal","true"); m.setAttribute("aria-label","Secure checkout");
    m.innerHTML='<div class="sheet"><div class="hd"><div><small>Secure checkout</small><b>'+M.esc(P.name||"Your protocol")+'</b></div><button type="button" class="x" aria-label="Close checkout">✕</button></div><div class="body"><div class="mx-wait">Loading secure checkout…</div><div id="mxPayMount"></div></div></div>';
    document.body.appendChild(m); document.body.style.overflow="hidden";
    var co=null;
    function close(){ try{ co&&co.destroy(); }catch(e){} m.remove(); document.body.style.overflow=""; }
    m.querySelector(".x").addEventListener("click",close);
    m.addEventListener("click",function(e){ if(e.target===m) close(); });
    document.addEventListener("keydown",function k(e){ if(e.key==="Escape"&&document.body.contains(m)){ close(); document.removeEventListener("keydown",k); } });
    try{
      var S=(await loadStripe())(CONFIG.stripeKey);
      co=await S.initEmbeddedCheckout({ fetchClientSecret:function(){ return Promise.resolve(secret); } });
      var w=m.querySelector(".mx-wait"); if(w) w.remove();
      co.mount("#mxPayMount");
    }catch(err){
      close(); M.modal("Checkout unavailable","We couldn't open the secure checkout. Check your connection and try again.",[["OK",null,"dark"]]);
    }
  };

  /* ---------- small UI helpers ---------- */
  M.toast=function(t,ms){ var el=document.querySelector(".mx-toast"); if(!el){ el=document.createElement("div"); el.className="mx-toast"; el.setAttribute("role","status"); document.body.appendChild(el); }
    el.textContent=t; el.classList.add("on"); clearTimeout(el._t); el._t=setTimeout(function(){ el.classList.remove("on"); },ms||2600); };
  M.modal=function(title,text,buttons){
    var m=document.createElement("div"); m.className="mx-modal"; m.setAttribute("role","dialog"); m.setAttribute("aria-modal","true");
    m.innerHTML='<div class="box"><h3>'+M.esc(title)+'</h3><p>'+M.esc(text)+'</p><div class="acts"></div></div>';
    (buttons||[["OK"]]).forEach(function(b){ var x=document.createElement(b[1]&&typeof b[1]==="string"?"a":"button"); x.className="b full "+(b[2]||""); x.textContent=b[0];
      if(typeof b[1]==="string") x.href=b[1]; else x.addEventListener("click",function(){ m.remove(); if(typeof b[1]==="function") b[1](); });
      m.querySelector(".acts").appendChild(x); });
    m.addEventListener("click",function(e){ if(e.target===m) m.remove(); });
    document.body.appendChild(m); var f=m.querySelector(".b"); if(f) f.focus();
    return m;
  };

  /* ---------- header + footer ---------- */
  var ICON={ menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
             close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' };
  function header(){
    if(document.querySelector(".mx-h")||H.classList.contains("mx-bare")) return;
    var cur=M.product(), P=CONFIG.products[cur], inn=!!M.user, any=M.ownsAny(), ownCur=M.owns(cur);
    var initial=inn?M.esc((M.user.email||"?").charAt(0).toUpperCase()):"";
    var links=[[any?"course.html":"protocols.html","Courses"],["app.html","Apps"],["community.html","Hub"]];
    var cta=ownCur?'<a class="b sm" href="'+P.app+'">Open app</a>':any?'<a class="b sm" href="app.html">Open app</a>':'<a class="b sm wide" href="'+P.sales+'#checkout">Start · '+P.price+'</a>';
    var h=document.createElement("header"); h.className="mx-h";
    h.innerHTML='<div class="in"><a class="mx-word" href="index.html">Mark Talks <em>Health</em></a>'+
      '<nav class="mx-nav" aria-label="Main">'+links.map(function(l){ return '<a href="'+l[0]+'"'+(M.page===l[0]?' class="on" aria-current="page"':'')+'>'+l[1]+'</a>'; }).join("")+'</nav>'+
      '<div class="mx-act">'+
        (inn?cta+'<a class="mx-me wide" href="account.html" title="Your account" aria-label="Your account">'+initial+'</a>'
            :'<a class="b sm ghost" href="'+M.loginUrl()+'">Sign in</a>'+cta)+
        '<button class="mx-burger" type="button" aria-label="Open menu">'+ICON.menu+'</button></div></div>';
    var sh=document.createElement("div"); sh.className="mx-sheet"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-label","Menu");
    /* menu: only what this member bought (their course and its app), plus their account */
    var sl=[];
    CONFIG.order.forEach(function(k){ var q=CONFIG.products[k]; if(M.owns(k)){ sl.push([q.course,q.name,"Your course"]); sl.push([q.app,"Open the app",q.short+" · your daily plan"]); } });
    if(!any) sl.push(["protocols.html","Courses","See the healing programs"]);
    sl.push(inn?["account.html","My account",M.esc(M.user.email)]:[M.loginUrl(),"Sign in","Access your courses"]);
    sh.innerHTML='<div class="top"><a class="mx-word" href="index.html">Mark Talks <em>Health</em></a><button class="mx-burger" type="button" aria-label="Close menu" style="display:grid">'+ICON.close+'</button></div>'+
      '<nav>'+sl.map(function(l){ return '<a href="'+l[0]+'">'+l[1]+(l[2]?'<small>'+l[2]+'</small>':'')+'</a>'; }).join("")+'</nav>'+
      '<div class="bot">'+(ownCur?'<a class="b full" href="'+P.app+'">Open my app</a>':'<a class="b full" href="'+P.sales+'#checkout">Start the '+P.name+' · '+P.price+'</a>')+
        (inn?'<button class="b full ghost" type="button" data-out>Sign out</button>':'<a class="b full ghost" href="'+M.loginUrl()+'">Sign in</a>')+'</div>';
    document.body.insertBefore(h,document.body.firstChild);
    document.body.appendChild(sh);
    h.querySelector(".mx-burger").addEventListener("click",function(){ sh.classList.add("on"); document.body.style.overflow="hidden"; });
    sh.querySelector(".mx-burger").addEventListener("click",function(){ sh.classList.remove("on"); document.body.style.overflow=""; });
    var so=sh.querySelector("[data-out]"); if(so) so.addEventListener("click",M.signOut);
    if(CONFIG.testMode){ var t=document.createElement("div"); t.className="mx-test"; t.innerHTML='<b>Preview site</b> · Stripe test mode<span class="wide"> · test card 4242 4242 4242 4242</span>'; document.body.insertBefore(t,document.body.firstChild); }
  }
  function footer(){
    if(document.querySelector(".mx-f")||H.classList.contains("mx-bare")) return;
    var f=document.createElement("footer"); f.className="mx-f";
    var pg=(location.pathname.split("/").filter(Boolean)[0]||"index").replace(/\.html$/,"");
    if(["index","gut","diabetes","glp1","protocols","privacy","terms","refunds","partners","healing"].indexOf(pg)<0){   /* members' pages: one quiet line */
      f.className="mx-f slim";
      f.innerHTML='<div class="in"><div class="fine">&copy; '+new Date().getFullYear()+' Mark Talks Health · Educational, not medical advice · <a href="picks.html">My Picks</a> · <a href="partners.html">Work with me</a> · <a href="mailto:marktalkshealth@gmail.com">Help</a> · <a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a></div></div>';
      document.body.appendChild(f); return;
    }
    f.innerHTML='<div class="in"><div class="brand">Mark Talks Health</div>'+
      '<nav aria-label="Footer"><a href="/blog/">Blog</a><a href="gut.html">Gut Health</a><a href="diabetes.html">Diabetes</a><a href="glp1.html">GLP-1</a><a href="picks.html">My Picks</a><a href="partners.html">Work with me</a>'+(M.user?'<a href="account.html">My account</a>':'<a href="'+M.loginUrl()+'">Sign in</a>')+'<a href="mailto:marktalkshealth@gmail.com">Help</a><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refunds.html">Refunds</a></nav>'+
      '<div class="fine">Educational, not medical advice. Results vary; talk to your healthcare provider before fasting or cleansing. &copy; '+new Date().getFullYear()+' Mark Talks Health</div></div>';
    document.body.appendChild(f);
  }
  M.chrome=function(){ header(); footer(); };

  /* ---------- shared site pieces ---------- */
  var BASE=CONFIG.assets;
  function wistiaJs(){ if(document.getElementById("wistia-js")) return; var s=document.createElement("script"); s.id="wistia-js"; s.async=true; s.src="https://fast.wistia.com/assets/external/E-v1.js"; document.head.appendChild(s); }
  function videos(root){
    [].forEach.call(root.querySelectorAll(".mthv:not([data-ready])"),function(el){
      el.setAttribute("data-ready","1");
      var id=(el.getAttribute("data-wistia")||"").trim(), title=el.getAttribute("data-title")||"Watch my story", len=el.getAttribute("data-len")||"";
      var poster=el.getAttribute("data-poster")||BASE+"mark-kitchen.jpg";
      var hint=function(t){ return (len?len+" · ":"")+t; };
      el.setAttribute("role","button"); el.setAttribute("tabindex","0"); el.setAttribute("aria-label",title+", video");
      el.innerHTML='<div class="mthv-player"></div><div class="mthv-poster" style="background-image:url(\''+poster+'\')"></div><div class="mthv-shade"></div>'+
        '<div class="mthv-cta"><span class="mthv-play"><span class="mthv-ring"></span></span><span class="mthv-txt"><b></b><small></small></span></div>'+
        '<div class="mthv-bar"><i></i></div><button type="button" class="mthv-mute" aria-label="Mute">🔊</button>';
      var slot=el.querySelector(".mthv-player"), bar=el.querySelector(".mthv-bar i"), B=el.querySelector(".mthv-txt b"), S=el.querySelector(".mthv-txt small"), M=el.querySelector(".mthv-mute");
      B.textContent=title; S.textContent=hint("Tap for sound");
      if(!id){ S.textContent=len||"Video coming soon"; el.style.cursor="default"; return; }
      var calm=false; try{ calm=matchMedia("(prefers-reduced-motion: reduce)").matches||!!(navigator.connection&&navigator.connection.saveData); }catch(e){}
      var V=null, mode="preview";
      slot.innerHTML='<div class="wistia_embed wistia_async_'+id+' muted=true autoPlay='+(calm?"false":"true")+' endVideoBehavior=loop playbar=false playButton=false smallPlayButton=false bigPlayButton=false fullscreenButton=false volumeControl=false settingsControl=false playbackRateControl=false qualityControl=false controlsVisibleOnLoad=false fitStrategy=cover videoFoam=false silentAutoPlay=allow playsinline=true copyLinkAndThumbnailEnabled=false"></div>';
      wistiaJs();
      window._wq=window._wq||[];
      window._wq.push({id:id,onReady:function(v){
        V=v;
        v.bind("play",function(){ el.classList.add("is-live"); el.classList.remove("is-paused"); });
        v.bind("pause",function(){ if(mode==="sound") el.classList.add("is-paused"); });
        v.bind("timechange",function(t){ if(mode==="sound"){ var d=v.duration()||1; bar.style.width=Math.min(100,100*t/d)+"%"; } });
        /* after the full watch, drift back to the silent loop */
        v.bind("end",function(){ if(mode!=="sound") return; mode="preview"; v.mute(); el.classList.remove("is-sound","is-paused"); B.textContent="Watch again"; S.textContent=hint("Tap for sound"); bar.style.width="0"; });
      }});
      function frame(){ /* the player script didn't load: fall back to Wistia's normal player */
        slot.innerHTML='<iframe src="https://fast.wistia.net/embed/iframe/'+id+'?autoPlay=true&playbar=true&fitStrategy=cover&videoFoam=false&playerColor=c0623f" allow="autoplay; fullscreen" allowfullscreen title="'+title.replace(/"/g,"")+'"></iframe>';
        el.classList.add("is-live","is-sound","is-frame"); el.style.cursor="default"; }
      function sound(){
        if(!V) return frame();
        mode="sound"; el.classList.add("is-sound","is-live"); el.classList.remove("is-paused");
        B.textContent=title; S.textContent=hint("Tap to pause"); M.textContent="🔊";
        V.unmute(); V.volume(1); V.time(0); V.play();
      }
      el.addEventListener("click",function(e){
        if(el.classList.contains("is-frame")) return;
        if(e.target.closest(".mthv-mute")){ e.stopPropagation(); if(V){ if(V.isMuted()){ V.unmute(); M.textContent="🔊"; } else { V.mute(); M.textContent="🔇"; } } return; }
        if(mode!=="sound") return sound();
        if(V.state()==="playing") V.pause(); else V.play();
      });
      el.addEventListener("keydown",function(e){ if((e.key==="Enter"||e.key===" ")&&e.target===el){ e.preventDefault(); el.click(); } });
      /* stop talking when it scrolls away */
      if("IntersectionObserver" in window) new IntersectionObserver(function(es){ es.forEach(function(x){ if(!x.isIntersecting&&mode==="sound"&&V&&V.state()==="playing") V.pause(); }); },{threshold:.15}).observe(el);
    });
  }
  /* swipe rows (cards, 7 steps, course cards): fingers already swipe; add mouse dragging and left/right arrows */
  function rails(root){
    var ARW=function(d){ return '<svg viewBox="0 0 24 24"><path d="'+(d<0?"M15 5l-7 7 7 7":"M9 5l7 7-7 7")+'"/></svg>'; };
    [].forEach.call(root.querySelectorAll(".sys, .rail, .tl"),function(r){
      if(r.__mthr) return; r.__mthr=1; r.classList.add("mthr-on");
      var nav=document.createElement("div"); nav.className="mthr-nav";
      var prev=document.createElement("button"), next=document.createElement("button");
      prev.type=next.type="button"; prev.className=next.className="mthr-b";
      prev.setAttribute("aria-label","Previous"); next.setAttribute("aria-label","Next"); prev.innerHTML=ARW(-1); next.innerHTML=ARW(1);
      nav.appendChild(prev);
      var dots=r.nextElementSibling; if(dots&&dots.classList.contains("sys-dots")) nav.appendChild(dots);
      nav.appendChild(next);
      r.parentNode.insertBefore(nav,r.nextSibling);
      function step(){ var c=r.children[0]; if(!c) return r.clientWidth*.8; var g=parseFloat(getComputedStyle(r).columnGap)||14; return c.getBoundingClientRect().width+g; }
      function upd(){ var max=r.scrollWidth-r.clientWidth; nav.hidden=max<8; prev.disabled=r.scrollLeft<6; next.disabled=r.scrollLeft>max-6; }
      prev.onclick=function(){ r.scrollBy({left:-step(),behavior:"smooth"}); };
      next.onclick=function(){ r.scrollBy({left:step(),behavior:"smooth"}); };
      r.addEventListener("scroll",upd,{passive:true}); window.addEventListener("resize",upd); setTimeout(upd,60); setTimeout(upd,1500);
      /* mouse drag */
      var down=false, sx=0, sl=0, moved=false;
      r.addEventListener("pointerdown",function(e){ if(e.pointerType!=="mouse"||e.button!==0) return; down=true; moved=false; sx=e.clientX; sl=r.scrollLeft; });
      window.addEventListener("pointermove",function(e){ if(!down) return; var dx=e.clientX-sx; if(!moved&&Math.abs(dx)>5){ moved=true; r.classList.add("mthr-drag"); } if(moved) r.scrollLeft=sl-dx; });
      window.addEventListener("pointerup",function(){ if(!down) return; down=false; if(!moved) return;
        var kids=[].slice.call(r.children), x0=r.getBoundingClientRect().left+parseFloat(getComputedStyle(r).paddingLeft||0), best=0, bd=1e9;
        kids.forEach(function(k,i){ var d=Math.abs(k.getBoundingClientRect().left-x0); if(d<bd){ bd=d; best=i; } });
        var t=kids[best]?r.scrollLeft+kids[best].getBoundingClientRect().left-x0:r.scrollLeft;
        r.classList.remove("mthr-drag"); r.scrollTo({left:t,behavior:"smooth"});
        setTimeout(function(){ moved=false; },0); });
      r.addEventListener("click",function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); } },true);
      r.addEventListener("dragstart",function(e){ e.preventDefault(); });
    });
  }
  /* "How healing works": five parts that open in place (no new page) */
  function parts(root){
    [].forEach.call(root.querySelectorAll("[data-hp]:not([data-on])"),function(w){
      w.setAttribute("data-on","1");
      var tabs=[].slice.call(w.querySelectorAll(".hp-t")), ps=[].slice.call(w.querySelectorAll(".hp-p")),
          cnt=w.querySelector(".hp-count"), pv=w.querySelector(".hp-prev"), nx=w.querySelector(".hp-next"), cur=0;
      function show(i,scroll){
        cur=Math.max(0,Math.min(ps.length-1,i));
        tabs.forEach(function(t,j){ t.classList.toggle("on",j===cur); t.setAttribute("aria-selected",j===cur?"true":"false"); });
        ps.forEach(function(p,j){ p.classList.toggle("on",j===cur); });
        if(cnt) cnt.textContent="Part "+(cur+1)+" of "+ps.length;
        if(pv) pv.disabled=cur===0; if(nx) nx.disabled=cur===ps.length-1;
        try{ window.dispatchEvent(new Event("resize")); }catch(e){}
        if(scroll){ var r=w.getBoundingClientRect(); if(r.top<70) window.scrollBy({ top:r.top-80, behavior:"smooth" }); }
      }
      tabs.forEach(function(t,j){ t.addEventListener("click",function(){ show(j); }); });
      if(pv) pv.addEventListener("click",function(){ show(cur-1,true); });
      if(nx) nx.addEventListener("click",function(){ show(cur+1,true); });
      show(0);
    });
  }
  /* ---------- on-page checkout: Stripe's secure form right on the page (no pop-up, no new page) ----------
     <div class="mx-co" data-co="gut"></div>  (one per page; a [data-pick] row of buttons switches the course) */
  var CO={ box:null, cur:null, live:null, n:0 };
  var INCL=["Personalised healing software","7-part video course + interactive ebook","High-protein recipes and meal planner","Fasting clock, tracker and dashboard","Healing Hub community and live Q&amp;A"];
  function coSummary(k){
    var P=CONFIG.products[k];
    return '<div class="mx-co-sum"><div class="mx-co-im" style="background-image:url(\''+P.thumb+'\')"></div><div><div class="mx-co-k">One-time payment</div><h3>'+M.esc(P.name)+'</h3>'+
      '<div class="mx-co-pr">'+(P.was?'<s>'+P.was+'</s>':'')+'<b>'+P.price+'</b><small>Lifetime access</small></div></div>'+
      '<ul>'+INCL.map(function(t){ return '<li>'+t+'</li>'; }).join("")+'</ul>'+
      '<p class="mx-co-g"><b>30-day money-back guarantee.</b> Card, Apple Pay and Google Pay.</p></div>';
  }
  async function coMount(k){
    var box=CO.box; if(!box) return;
    CO.cur=k; box.setAttribute("data-co",k);
    var sec=box.closest("section")||document; [].forEach.call(sec.querySelectorAll("[data-pick] button"),function(b){ b.classList.toggle("on",b.getAttribute("data-p")===k); b.setAttribute("aria-pressed",b.getAttribute("data-p")===k?"true":"false"); });
    var slot=box.querySelector(".mx-co-form"); box.querySelector(".mx-co-left").innerHTML=coSummary(k);
    if(CO.live){ try{ CO.live.destroy(); }catch(e){} CO.live=null; }
    if(M.user&&M.owns(k)){ slot.innerHTML='<div class="mx-co-own"><h3>You own this protocol</h3><p>Everything is unlocked on your account.</p><a class="b full" href="'+CONFIG.products[k].course+'">Open my course</a></div>'; return; }
    if(!CONFIG.stripeKey){ slot.innerHTML='<div class="mx-co-own"><button class="b full" type="button" data-co-go>Continue to secure payment · '+CONFIG.products[k].price+'</button></div>';
      slot.querySelector("[data-co-go]").onclick=function(){ coRedirect(k,this); }; return; }
    slot.innerHTML='<div class="mx-wait">Loading secure checkout…</div><div class="mx-co-mount"></div>';
    var ask=++CO.n;
    try{
      var e=await M.fn("mth-checkout",{ product:k, return_base:M.base, embedded:true });
      if(CO.cur!==k||ask!==CO.n) return;
      if(e.already){ await M.refresh(); return coMount(k); }
      if(!e.client_secret) throw new Error(e.message||e.error||"no session");
      var S=(await loadStripe())(CONFIG.stripeKey);
      var co=await S.initEmbeddedCheckout({ fetchClientSecret:function(){ return Promise.resolve(e.client_secret); } });
      if(CO.cur!==k||ask!==CO.n){ try{ co.destroy(); }catch(x){} return; }
      CO.live=co; var w=slot.querySelector(".mx-wait"); if(w) w.remove();
      co.mount(slot.querySelector(".mx-co-mount"));
      M.track("checkout",k);
    }catch(err){
      console.warn("[mth] checkout",err);
      slot.innerHTML='<div class="mx-co-own"><p>The secure form didn\u2019t load. Check your connection, then try again.</p><button class="b full" type="button" data-co-retry>Try again</button></div>';
      slot.querySelector("[data-co-retry]").onclick=function(){ coMount(k); };
    }
  }
  async function coRedirect(k,btn){   /* only used until the Stripe publishable key is added */
    if(btn){ btn.disabled=true; btn.textContent="Opening secure checkout…"; }
    M.track("checkout",k);
    var j=await M.fn("mth-checkout",{ product:k, return_base:M.base });
    if(j.url){ location.href=j.url; return; }
    if(btn){ btn.disabled=false; btn.textContent="Continue to secure payment"; }
    M.toast("Checkout couldn\u2019t start. Please try again.",3600);
  }
  M.showCheckout=function(k){
    if(!CO.box) return;
    if(k&&k!==CO.cur||!CO.started){ CO.started=true; coMount(k||CO.cur); }
    var sec=CO.box.closest("section")||CO.box; sec.scrollIntoView({ behavior:"smooth", block:"start" });
  };
  function checkouts(root){
    var box=root.querySelector(".mx-co:not([data-on])"); if(!box) return;
    box.setAttribute("data-on","1"); CO.box=box; CO.cur=box.getAttribute("data-co")||M.product();
    box.innerHTML='<div class="mx-co-left"></div><div class="mx-co-form"></div>';
    box.querySelector(".mx-co-left").innerHTML=coSummary(CO.cur);
    var sec=box.closest("section")||root;
    [].forEach.call(sec.querySelectorAll("[data-pick] button"),function(b){ b.addEventListener("click",function(){ CO.started=true; coMount(b.getAttribute("data-p")); }); });
    /* the secure form loads when the section comes near the screen (or straight away for #checkout links) */
    var go=function(){ if(!CO.started){ CO.started=true; coMount(CO.cur); } };
    if(location.hash==="#checkout"||!("IntersectionObserver" in window)) go();
    else { var io=new IntersectionObserver(function(es){ if(es.some(function(x){ return x.isIntersecting; })){ io.disconnect(); go(); } },{ rootMargin:"900px 0px" }); io.observe(box); }
  }
  M.videos=videos; M.rails=rails; M.parts=parts; M.checkouts=checkouts;
  /* email list forms: <form class="mx-list" data-source="home"> with an email input */
  M.listForms=function(root){
    [].forEach.call((root||document).querySelectorAll("form.mx-list:not([data-on])"),function(f){
      f.setAttribute("data-on","1");
      f.addEventListener("submit",async function(e){
        e.preventDefault(); var inp=f.querySelector('[name="email"]'), b=f.querySelector("button"), em=(inp.value||"").trim();
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){ M.toast("Please enter a valid email."); inp.focus(); return; }
        b.disabled=true;
        try{ var r=await sb.rpc("mth_join",{ p_email:em, p_name:null, p_source:f.getAttribute("data-source")||M.page, p_anon:M.anon, p_utm:M.utm() });
          if(r.error||r.data!=="ok") throw r.error||new Error(r.data);
          M.fn("mth-sync",{ action:"list_join", email:em }).then(function(){},function(){});
          f.innerHTML='<p class="mx-list-ok">You\u2019re on the list. Thank you!</p>';
        }catch(err){ M.toast("Couldn\u2019t sign you up. Please try again."); b.disabled=false; }
      });
    });
  };
  /* mount a page design: run its scripts, then the video card, swipe rows and test-drive phone */
  M.mount=function(html,target){
    var box=document.createElement("div"); box.innerHTML=html;
    var scripts=[].slice.call(box.querySelectorAll("script"));
    target.appendChild(box);
    scripts.forEach(function(old){ var s=document.createElement("script"); if(old.src) s.src=old.src; else s.textContent=old.textContent; old.parentNode.replaceChild(s,old); });
    if(box.querySelector(".mthp[data-proto]")&&!document.getElementById("mthp-js")){ var s=document.createElement("script"); s.id="mthp-js"; s.src=BASE+"phone.js?v=6"; document.head.appendChild(s); }
    if(box.querySelector(".mthv")) videos(box);
    try{ rails(box); }catch(e){}
    try{ parts(box); }catch(e){}
    try{ checkouts(box); }catch(e){ console.warn("[mth] checkout",e); }
    try{ M.applyWords(box); }catch(e){ console.warn("[mth] words",e); }
    return box;
  };

  /* every page: draw the header/footer once we know who is signed in */
  M.ready.then(function(){
    function go(){
      M.chrome();
      /* plain pages (no design template): their words are in <main> */
      if(!document.getElementById("design")){ var mn=document.querySelector("main"); if(mn){ try{ parts(mn); M.applyWords(mn); }catch(e){} } }
      /* Admin -> Website words opens pages with ?edit=1 */
      if(M.qs("edit")==="1"&&M.user&&!document.getElementById("mte-js")){ var s=document.createElement("script"); s.id="mte-js"; s.src="assets/site-edit.js?v=202610281800"; document.head.appendChild(s); }
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else go();
  });
})();
