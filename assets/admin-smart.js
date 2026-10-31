/* =================================================================
   ADMIN — Needs attention: the smart layer of the CRM.
   • Claude's morning brief, with drafted personal emails you approve in one click
   • Live signals from the database: abandoned checkouts, bought-but-not-started,
     gone quiet, hot leads, quiz leads, new buyers, nearly finished
   • Write a personal email to anyone, add a to-do, or hide a signal for a week
   • On each person's page: engagement score, full activity and a "Write to them" button
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb, C=MTH.config;
  var SITE="https://marktalkshealth.com";
  function prodName(k){ return (C.products[k]||{}).name||"the program"; }
  function prodShort(k){ return (C.products[k]||{}).short||k||""; }

  /* ready-made personal drafts for each kind of signal (you can edit before sending) */
  var DRAFTS={
    abandoned_checkout:function(s){ return { subject:"Any questions about the "+prodShort(s.product)+" program?", body:"Hi {{first_name|there}},\n\nI noticed you were looking at the "+prodName(s.product)+" and didn’t quite finish signing up. Totally fine. I just wanted to check whether anything was unclear, or if you had a question I can answer.\n\nJust hit reply and tell me what’s on your mind. I read every email myself.\n\nMark" }; },
    not_started:function(s){ return { subject:"Getting started with "+prodShort(s.product), body:"Hi {{first_name|there}},\n\nThanks again for joining the "+prodName(s.product)+". I noticed you haven’t opened your app yet, so here’s the quickest way in:\n\n- Sign in at marktalkshealth.com with this email\n- Watch the short Introduction lesson\n- Open the app and fill in your intake (about 5 minutes)\n\n[[Open my course|"+SITE+"/course.html?p="+(s.product||"gut")+"]]\n\nIf anything gets in the way, reply and I’ll help.\n\nMark" }; },
    stalled:function(s){ return { subject:"How are you getting on?", body:"Hi {{first_name|there}},\n\nJust checking in. It’s been a few days since you were last in the "+prodName(s.product)+", and I wanted to see how you’re doing.\n\nIf life got busy, that’s normal. You can pick up right where you left off; one good meal or one short walk today is enough to get going again.\n\nIs anything making it harder? Reply and tell me. I’m happy to help.\n\nMark" }; },
    new_buyer:function(s){ return { subject:"Welcome, from Mark", body:"Hi {{first_name|there}},\n\nI just saw you joined the "+prodName(s.product)+", and I wanted to say a personal thank you.\n\nIf you have any questions as you go, or want help adjusting the plan to your life, just reply to this email. It comes straight to me.\n\nMark" }; },
    hot_lead:function(){ return { subject:"Can I help?", body:"Hi {{first_name|there}},\n\nI noticed you’ve been looking at my programs, and I wanted to reach out personally.\n\nIf you’re trying to decide whether one is right for you, I’m happy to help. What’s the main thing you want to change about your health right now?\n\nJust reply. I read every email.\n\nMark" }; },
    quiz_lead:function(){ return { subject:"About your quiz results", body:"Hi {{first_name|there}},\n\nThanks for taking my health quiz. I wanted to follow up personally.\n\nIf you’d like help understanding your results, or what to do first, reply with your biggest question and I’ll point you in the right direction.\n\nMark" }; },
    nearly_done:function(s){ return { subject:"You’re nearly there (and a quick favor?)", body:"Hi {{first_name|there}},\n\nYou’re almost through the "+prodName(s.product)+". That takes real commitment, well done.\n\nCould I ask a quick favor? Reply with a sentence or two about how you’re feeling compared with when you started. If you’re happy for me to share it (first name only), it really helps other people decide to start.\n\nThank you,\nMark" }; }
  };
  var ICON={ abandoned_checkout:"🛒", not_started:"⏳", stalled:"💤", new_buyer:"🎉", hot_lead:"🔥", quiz_lead:"📝", nearly_done:"🏁", email_problem:"⚠️" };

  if(!document.getElementById("sm-css")){ var st=document.createElement("style"); st.id="sm-css"; st.textContent=
    ".sm-sig{display:grid;grid-template-columns:36px 1fr auto;gap:12px;align-items:start;padding:14px 0;border-bottom:1px solid var(--line)}.sm-sig:last-child{border:0}"+
    ".sm-ic{font-size:22px;line-height:36px;text-align:center}.sm-sig b{display:block}.sm-sig .r{font-size:14px;color:var(--ink)}.sm-sig .a{font-size:13px;color:var(--muted);margin-top:2px}"+
    ".sm-acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.sm-score{display:inline-block;min-width:34px;text-align:center;font:600 12px Inter,sans-serif;border-radius:999px;padding:3px 8px;background:#f1e7d6;color:#6e5427;margin-left:6px}"+
    ".sm-score.hi{background:#dfe9da;color:#3f5a37}.sm-score.lo{background:#f6e0d8;color:#7e3b25}"+
    ".sm-brief{white-space:pre-wrap;font-size:15px;line-height:1.6}.sm-draft{border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-top:10px;background:#fffdf8}"+
    ".sm-draft.done{opacity:.55}.sm-pri{font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:18px 0 4px}"+
    "@media(max-width:700px){.sm-sig{grid-template-columns:30px 1fr}.sm-acts{grid-column:1/-1;justify-content:flex-start}}";
    document.head.appendChild(st); }

  function score(n){ n=Number(n||0); return '<span class="sm-score'+(n>=60?' hi':n<25?' lo':'')+'" title="Engagement score, 0–100">'+n+'</span>'; }

  /* compose & send a personal email (used everywhere) */
  A.writeTo=function(email,name,draft,onSent){
    draft=draft||{ subject:"", body:"Hi {{first_name|there}},\n\n\n\nMark" };
    var m=document.createElement("div"); m.className="mx-modal";
    m.innerHTML='<div class="box" style="max-width:640px;width:96vw;text-align:left"><h3>Write to '+esc(name||email)+'</h3><p class="small" style="margin:0 0 8px">'+esc(email)+' · sent from you, replies come to your inbox</p>'+
      '<label class="em-lbl" style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:var(--muted);margin:10px 0 6px">Subject</label><input class="inp" id="wS" value="'+esc(draft.subject)+'">'+
      '<label class="em-lbl" style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:var(--muted);margin:10px 0 6px">Message</label><textarea class="inp" id="wB" style="min-height:240px">'+esc(draft.body)+'</textarea>'+
      '<p class="small" style="margin:6px 0 0">{{first_name|there}} becomes their first name. [[Button text|link]] makes a button.</p>'+
      '<div class="acts" style="margin-top:12px"><button class="b sm" id="wGo">Send</button><button class="b sm ghost" id="wT">Send me a test</button><button class="b sm ghost" data-x>Cancel</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){ if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); });
    m.querySelector("#wT").onclick=async function(){ var b=this; b.disabled=true; var r=await MTH.fn("mth-mail",{ action:"test", subject:m.querySelector("#wS").value, body:m.querySelector("#wB").value, kind:"onboarding" }); b.disabled=false; MTH.toast(r.ok?"Test sent to "+r.to:"Couldn’t send: "+(r.error||r.message),5000); };
    m.querySelector("#wGo").onclick=async function(){
      var b=this, sub=m.querySelector("#wS").value.trim(), body=m.querySelector("#wB").value.trim();
      if(!sub||!body) return MTH.toast("Add a subject and a message.");
      b.disabled=true; b.textContent="Sending…";
      var r=await MTH.fn("mth-mail",{ action:"direct", to:email, subject:sub, body:body, kind:(draft.kind||"note") });
      if(r.ok){ MTH.toast("Sent to "+(name||email)); m.remove(); if(onSent) onSent(); }
      else { MTH.toast("Couldn’t send: "+(r.error||r.message),6000); b.disabled=false; b.textContent="Send"; }
    };
  };

  /* ================= NEEDS ATTENTION ================= */
  A.screen("attention",{ nav:"Needs attention", group:"Start here", live:true, help:"The people who need you today and why. Your system spots them automatically; Claude writes a short brief each morning with emails ready for your OK. Nothing is sent until you press Send.", render: async function(V){
    var today=A.today();
    var res=await Promise.all([A.rpc("mth_admin_signals"), sb.from("mth_daily_brief").select("*").order("day",{ ascending:false }).limit(1)]);
    var S=(res[0]||[]), brief=((res[1]&&res[1].data)||[])[0];
    A.badge("attention",S.filter(function(s){ return s.priority===1; }).length);
    var drafts=(brief&&brief.drafts)||[], waiting=drafts.filter(function(d){ return d.status==="draft"; });
    var groups=[[1,"Act today"],[2,"Good to do"],[3,"When you have a minute"]];
    V.innerHTML='<div class="adm-h"><div><div class="kick">Start here</div><h1>Needs <em>attention</em></h1></div><div class="acts"><a class="b sm ghost" href="#contacts">All people</a></div></div>'+
      (brief?'<div class="card panel"><h3>Claude’s brief · '+A.when(brief.day+"T12:00")+(brief.day!==today?' <span class="small">(latest)</span>':'')+'</h3><div class="sm-brief">'+esc(brief.summary)+'</div>'+
        (drafts.length?'<div class="sec-h">Emails ready for you · '+waiting.length+' waiting</div>'+drafts.map(function(d,i){ return '<div class="sm-draft'+(d.status!=="draft"?' done':'')+'"><div class="row-i" style="padding:0;border:0"><span><b>'+esc(d.name||d.email)+'</b> <span class="small">'+esc(d.email)+'</span><br><span class="small">'+esc(d.subject)+'</span></span><span class="sm-acts">'+
          (d.status==="draft"?'<button class="b sm" data-dsend="'+i+'">Review & send</button><button class="b sm ghost" data-dskip="'+i+'">Skip</button>':'<span class="pill'+(d.status==="sent"?' own':'')+'">'+(d.status==="sent"?"Sent":"Skipped")+'</span>')+'</span></div></div>'; }).join(""):'')+'</div>'
       :'<div class="msg info">Claude’s morning brief will appear here once the daily review runs. The list below is live right now.</div>')+
      (S.length?groups.map(function(g){ var L=S.filter(function(s){ return s.priority===g[0]; }); if(!L.length) return "";
        return '<div class="sm-pri">'+g[1]+' · '+L.length+'</div><div class="card panel" style="padding-top:4px;padding-bottom:4px">'+L.map(function(s){ var k=S.indexOf(s);
          return '<div class="sm-sig"><div class="sm-ic">'+(ICON[s.kind]||"•")+'</div><div><b>'+esc(s.title)+' · <a href="#person/'+encodeURIComponent(s.email)+'">'+esc(s.name||s.email)+'</a>'+score(s.score)+'</b><div class="r">'+esc(s.reason)+'</div><div class="a">→ '+esc(s.action)+(s.since?' · '+A.when(s.since):'')+'</div></div>'+
            '<div class="sm-acts">'+(DRAFTS[s.kind]?'<button class="b sm" data-w="'+k+'">Write to them</button>':'')+'<button class="b sm ghost" data-t="'+k+'">To-do</button><button class="b sm ghost" data-h="'+k+'" title="Hide this for 7 days">Hide</button></div></div>'; }).join("")+'</div>'; }).join("")
       :'<div class="card panel"><h3>All clear</h3><p class="muted">Nobody needs a nudge right now. New buyers, stuck customers and hot leads show up here by themselves.</p></div>');

    V.querySelectorAll("[data-w]").forEach(function(b){ b.onclick=function(){ var s=S[Number(b.dataset.w)], d=DRAFTS[s.kind](s); d.kind=s.kind; A.writeTo(s.email,s.name,d,function(){ hide(s,3); }); }; });
    V.querySelectorAll("[data-t]").forEach(function(b){ b.onclick=async function(){ var s=S[Number(b.dataset.t)]; await A.rpc("mth_admin_task",{ p_id:null, p_email:s.email, p_title:s.action.replace(/:.*$/,""), p_due:A.today(), p_done:false }); MTH.toast("Added to your to-dos"); }; });
    V.querySelectorAll("[data-h]").forEach(function(b){ b.onclick=function(){ hide(S[Number(b.dataset.h)],7); }; });
    async function hide(s,days){ await sb.from("mth_signal_dismiss").upsert({ email:s.email, kind:s.kind, until:new Date(Date.now()+days*864e5).toISOString() }); A.refresh(); }
    async function setDraft(i,status){ drafts[i].status=status; await sb.from("mth_daily_brief").update({ drafts:drafts, updated_at:new Date().toISOString() }).eq("day",brief.day); A.refresh(); }
    V.querySelectorAll("[data-dsend]").forEach(function(b){ b.onclick=function(){ var i=Number(b.dataset.dsend), d=drafts[i]; A.writeTo(d.email,d.name,{ subject:d.subject, body:d.body, kind:d.kind },function(){ setDraft(i,"sent"); if(d.kind) sb.from("mth_signal_dismiss").upsert({ email:d.email, kind:d.kind, until:new Date(Date.now()+3*864e5).toISOString() }); }); }; });
    V.querySelectorAll("[data-dskip]").forEach(function(b){ b.onclick=function(){ setDraft(Number(b.dataset.dskip),"skipped"); }; });
  }});

  /* keep the sidebar badge fresh on any screen */
  setTimeout(function(){ A.rpc("mth_admin_signals",{},true).then(function(S){ A.badge("attention",(S||[]).filter(function(s){ return s.priority===1; }).length); },function(){}); },1500);

  /* ================= PERSON PAGE: score, write button, full activity ================= */
  var person=A.screens.person;
  if(person&&!person._sm){ var orig=person.render; person._sm=true;
    person.render=async function(V,arg){ await orig.call(this,V,arg);
      var email=decodeURIComponent(arg||"").toLowerCase();
      try{
        var r=await Promise.all([A.rpc("mth_admin_scores",{},true), A.rpc("mth_admin_timeline",{ p_email:email },true), A.rpc("mth_admin_signals",{},true)]);
        var sc=((r[0]||[]).filter(function(x){ return x.email===email; })[0]||{}).score||0, T=r[1]||[], mine=(r[2]||[]).filter(function(s){ return s.email===email; });
        var name=(V.querySelector(".ph h2")||{}).textContent||email;
        var box=document.createElement("div"); box.className="card panel"; box.style.marginTop="14px";
        box.innerHTML='<h3>Smart view '+score(sc)+'</h3>'+
          (mine.length?mine.map(function(s){ return '<div class="row-i"><span>'+(ICON[s.kind]||"•")+' <b>'+esc(s.title)+'</b><br><span class="small">'+esc(s.reason)+' → '+esc(s.action)+'</span></span></div>'; }).join(""):'<p class="small" style="margin:0 0 8px">Nothing needs your attention for this person right now.</p>')+
          '<div class="acts" style="margin-top:10px"><button class="b sm" id="smW">Write to them</button></div>'+
          '<details style="margin-top:12px"><summary class="small" style="cursor:pointer">Full activity · '+T.length+' events (pages visited, emails, lessons)</summary><div style="margin-top:8px">'+
          T.map(function(t){ return '<div class="row-i"><span><b>'+esc(t.title)+'</b>'+(t.detail?'<br><span class="small">'+esc(t.detail)+'</span>':'')+'</span><span class="small">'+A.when(t.at,true)+'</span></div>'; }).join("")+'</div></details>';
        V.appendChild(box);
        box.querySelector("#smW").onclick=function(){ var s=mine.filter(function(x){ return DRAFTS[x.kind]; })[0]; var d=s?DRAFTS[s.kind](s):null; if(d) d.kind=s.kind; A.writeTo(email,name,d,function(){ A.refresh(); }); };
      }catch(e){ console.warn(e); }
    };
  }
})();
