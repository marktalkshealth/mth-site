/* =================================================================
   ADMIN — CRM: overview, contacts, one person, tasks, sales
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config;
  var PCOL={ gut:"#c0623f", sugar:"#b8924a", glp1:"#7a8f6e" };
  function prodShort(k){ return (C.products[k]||{}).short||k; }

  /* ---------- small bar chart: rows [{day, product, cents}] ---------- */
  function chart(rows,days){
    var end=new Date(); end.setHours(0,0,0,0);
    var keys=[], by={}; for(var i=days-1;i>=0;i--){ var d=new Date(end); d.setDate(d.getDate()-i); var k=d.toISOString().slice(0,10); keys.push(k); by[k]={}; }
    rows.forEach(function(r){ var k=String(r.day).slice(0,10); if(by[k]) by[k][r.product]=(by[k][r.product]||0)+Number(r.cents||0); });
    var max=1; keys.forEach(function(k){ var t=0; for(var p in by[k]) t+=by[k][p]; if(t>max) max=t; });
    var W=600,Hh=160,pad=22,bw=(W-pad)/keys.length;
    var bars=keys.map(function(k,i){ var y=Hh, out=""; C.order.forEach(function(p){ var v=by[k][p]||0; if(!v) return; var h=Math.max(2,(Hh-14)*v/max); y-=h; out+='<rect x="'+(pad+i*bw+bw*.15).toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+(bw*.7).toFixed(1)+'" height="'+h.toFixed(1)+'" rx="2" fill="'+PCOL[p]+'"><title>'+k+' · '+prodShort(p)+' · '+A.money(v)+'</title></rect>'; }); return out; }).join("");
    var lbl=[0,Math.floor(keys.length/2),keys.length-1].map(function(i){ var d=new Date(keys[i]+"T12:00"); return '<text x="'+(pad+i*bw+bw/2)+'" y="'+(Hh+14)+'" text-anchor="'+(i===0?'start':i===keys.length-1?'end':'middle')+'">'+d.toLocaleDateString(undefined,{month:"short",day:"numeric"})+'</text>'; }).join("");
    return '<svg class="chart" viewBox="0 0 '+W+' '+(Hh+18)+'" preserveAspectRatio="none" role="img" aria-label="Sales by day"><line x1="'+pad+'" x2="'+W+'" y1="'+Hh+'" y2="'+Hh+'" stroke="#e7dccb"/><text x="0" y="10">'+A.money(max)+'</text>'+bars+lbl+'</svg>'+
      '<div class="legend">'+C.order.map(function(p){ return '<span><i style="background:'+PCOL[p]+'"></i>'+prodShort(p)+'</span>'; }).join("")+'</div>';
  }

  /* ================= OVERVIEW ================= */
  A.screen("overview",{ nav:"Dashboard", group:"Customers", live:true, help:"Your numbers at a glance. The coloured bar shows where everyone is, from first sign-up to happy customer.", render: async function(V){
    var res=await Promise.all([A.loadPeople(true), A.rpc("mth_admin_tasks",{p_include_done:false}), A.rpc("mth_admin_sales",{p_days:30})]);
    var P=res[0], T=res[1]||[], S=res[2]||[];
    var cust=P.filter(function(p){ return p.owns&&p.owns.length; }), list=P.filter(function(p){ return p.list_opt_in; }).length;
    var risk=P.filter(function(p){ return p.stage==="at_risk"; });
    var live=S.filter(function(r){ return r.live; }).reduce(function(a,r){ return a+Number(r.cents); },0), test=S.filter(function(r){ return !r.live; }).reduce(function(a,r){ return a+Number(r.cents); },0);
    var due=T.filter(function(t){ return t.due&&t.due<=A.today(); });
    var cnt={}; P.forEach(function(p){ cnt[p.stage]=(cnt[p.stage]||0)+1; });
    var tot=P.length||1;
    var fresh=P.filter(function(p){ return p.stage==="signed_up"&&p.signed_up&&(Date.now()-new Date(p.signed_up))<7*864e5; });
    V.innerHTML='<div class="adm-h"><div><div class="kick">Dashboard</div><h1>Good '+(new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening')+', <em>Mark</em></h1></div><div class="acts"><a class="b sm ghost" href="#contacts">People</a><a class="b sm" href="#studio">Posts</a></div></div>'+
      '<div class="kpis"><div class="card kpi"><b>'+P.length+'</b><span>Contacts</span></div><div class="card kpi"><b>'+cust.length+'</b><span>Customers</span></div>'+
      '<div class="card kpi"><b>'+A.money(live)+'</b><span>Sales, last 30 days</span></div><div class="card kpi"><b>'+A.money(test)+'</b><span>Test sales, 30 days</span></div>'+
      '<div class="card kpi"><b>'+list+'</b><span>On the email list</span></div><div class="card kpi'+(due.length?' warn':'')+'"><b>'+due.length+'</b><span>Tasks due</span></div></div>'+
      '<div class="cols"><div class="card panel"><h3>Where people are</h3><div class="pipe">'+A.STAGES.map(function(s){ var n=cnt[s[0]]||0; return n?'<i style="width:'+(100*n/tot)+'%;background:'+s[2]+'" title="'+s[1]+': '+n+'"></i>':''; }).join("")+'</div>'+
        '<div class="stg">'+A.STAGES.map(function(s){ return '<a href="#contacts/stage:'+s[0]+'"><b>'+(cnt[s[0]]||0)+'</b><span>'+s[1]+'</span></a>'; }).join("")+'</div>'+
        '<div class="sec-h">Sales, last 30 days</div>'+chart(S.filter(function(r){ return r.live||!live; }),30)+(live?'':'<p class="small">Showing test purchases until real sales come in.</p>')+'</div>'+
      '<div style="display:grid;gap:14px"><div class="card panel"><h3>Due now</h3>'+(due.slice(0,6).map(function(t){ return '<div class="row-i"><span><b>'+esc(t.title)+'</b>'+(t.email?'<br><a class="small" href="#person/'+encodeURIComponent(t.email)+'">'+esc(t.email)+'</a>':'')+'</span><span class="small">'+A.when(t.due)+'</span></div>'; }).join("")||'<p class="muted">Nothing due. </p>')+'<a class="b sm ghost" href="#tasks" style="margin-top:8px">All tasks</a></div>'+
        '<div class="card panel"><h3>Needs attention</h3>'+
          (risk.slice(0,5).map(function(p){ return '<div class="row-i"><a href="#person/'+encodeURIComponent(p.email)+'">'+esc(p.name||p.email)+'</a>'+A.stagePill("at_risk")+'</div>'; }).join("")+
           fresh.slice(0,5).map(function(p){ return '<div class="row-i"><a href="#person/'+encodeURIComponent(p.email)+'">'+esc(p.name||p.email)+'</a><span class="small">signed up, hasn’t bought</span></div>'; }).join("")||'<p class="muted">Everyone is on track.</p>')+'</div></div></div>';
    A.badge("tasks",due.length);
  }});

  /* ================= CONTACTS ================= */
  var sel={}, state={ q:"", stage:"", prod:"", tag:"", sort:"active" };
  A.screen("contacts",{ nav:"People", group:"Customers", help:"Everyone who joined your email list or made an account. Tap a person to see everything about them. Tick boxes to tag or email several at once.", render: async function(V,arg){
    if(arg&&arg.indexOf("stage:")===0){ state.stage=arg.slice(6); }
    var P=await A.loadPeople(true); sel={};
    var tags={}; P.forEach(function(p){ (p.tags||[]).forEach(function(t){ tags[t]=1; }); });
    V.innerHTML='<div class="adm-h"><div><div class="kick">Customers</div><h1>People</h1></div><div class="acts"><button class="b sm ghost" id="exp">Export CSV</button><button class="b sm" id="add">Add contact</button></div></div>'+
      '<div class="bar"><input class="inp" id="q" type="search" placeholder="Search name, email, tag or source" value="'+esc(state.q)+'">'+
      '<select class="sel" id="fp"><option value="">All protocols</option>'+C.order.map(function(k){ return '<option value="'+k+'">'+prodShort(k)+'</option>'; }).join("")+'<option value="none">Hasn’t bought</option></select>'+
      '<select class="sel" id="ft"><option value="">All tags</option>'+Object.keys(tags).sort().map(function(t){ return '<option>'+esc(t)+'</option>'; }).join("")+'</select>'+
      '<select class="sel" id="fs"><option value="active">Last active</option><option value="new">Newest</option><option value="spent">Most spent</option><option value="progress">Most progress</option></select></div>'+
      '<div class="chips" id="chips"><button class="chip" data-s="">All · '+P.length+'</button>'+A.STAGES.map(function(s){ var n=P.filter(function(p){ return p.stage===s[0]; }).length; return n?'<button class="chip" data-s="'+s[0]+'">'+s[1]+' · '+n+'</button>':''; }).join("")+'</div>'+
      '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th style="width:34px"><input type="checkbox" id="all" aria-label="Select all"></th><th>Contact</th><th>Stage</th><th>Owns</th><th class="hm">Course</th><th class="hm">Last active</th><th class="hm">Tags</th></tr></thead><tbody id="rows"></tbody></table></div>'+
      '<div class="bulk hidden" id="bulk"><b id="bn"></b><button class="b sm" data-b="tag">Add tag</button><button class="b sm ghost" data-b="untag">Remove tag</button><button class="b sm ghost" data-b="copy">Copy emails</button><button class="b sm ghost" data-b="mail">Email</button><button class="b sm ghost" data-b="csv">Export</button><button class="b sm ghost" data-b="clear">Clear</button></div>';
    var $=function(id){ return document.getElementById(id); };
    $("fp").value=state.prod; $("ft").value=state.tag; $("fs").value=state.sort;
    function list(){
      var s=state.q.trim().toLowerCase();
      var L=P.filter(function(p){
        if(state.stage&&p.stage!==state.stage) return false;
        if(state.prod==="none"&&(p.owns||[]).length) return false;
        if(state.prod&&state.prod!=="none"&&(p.owns||[]).indexOf(state.prod)<0) return false;
        if(state.tag&&(p.tags||[]).indexOf(state.tag)<0) return false;
        return !s||[p.email,p.name,(p.tags||[]).join(" "),p.source].join(" ").toLowerCase().indexOf(s)>-1; });
      var key={ active:function(p){ return -new Date(p.last_activity||0); }, new:function(p){ return -new Date(p.signed_up||0); }, spent:function(p){ return -Number(p.spent_cents||0); }, progress:function(p){ return -(p.lessons_total?p.lessons_done/p.lessons_total:0); } }[state.sort];
      return L.sort(function(a,b){ return key(a)-key(b); });
    }
    function draw(){
      var L=list();
      document.querySelectorAll("#chips .chip").forEach(function(c){ c.classList.toggle("on",c.dataset.s===state.stage); });
      $("rows").innerHTML=L.map(function(p){ var pct=p.lessons_total?Math.round(100*p.lessons_done/p.lessons_total):0;
        return '<tr data-e="'+esc(p.email)+'"><td><input type="checkbox" data-k="'+esc(p.email)+'"'+(sel[p.email]?' checked':'')+' aria-label="Select"></td>'+
          '<td><b>'+esc(p.name||p.email)+'</b>'+(p.name?'<br><span class="small">'+esc(p.email)+'</span>':'')+'<br>'+(p.list_opt_in?'<span class="pill list">List</span>':'')+(!p.has_account?'<span class="pill">No account</span>':'')+(p.open_tasks?'<span class="pill tag">'+p.open_tasks+' task'+(p.open_tasks>1?'s':'')+'</span>':'')+'</td>'+
          '<td>'+A.stagePill(p.stage)+'</td><td>'+((p.owns||[]).map(function(k){ return '<span class="pill own">'+esc(prodShort(k))+'</span>'; }).join("")||'<span class="small">—</span>')+'</td>'+
          '<td class="hm">'+(p.lessons_total?'<div class="mini"><i style="width:'+pct+'%"></i></div><span class="small">'+p.lessons_done+'/'+p.lessons_total+'</span>':'<span class="small">—</span>')+'</td>'+
          '<td class="hm small">'+A.when(p.last_activity)+'</td><td class="hm">'+(p.tags||[]).map(function(t){ return '<span class="pill tag">'+esc(t)+'</span>'; }).join("")+'</td></tr>'; }).join("")||'<tr><td colspan="7" class="muted" style="padding:20px">No contacts match.</td></tr>';
      document.querySelectorAll("#rows tr[data-e]").forEach(function(tr){ tr.onclick=function(e){ if(e.target.matches("input")) return; A.go("person/"+encodeURIComponent(tr.dataset.e)); }; });
      document.querySelectorAll("#rows input[data-k]").forEach(function(c){ c.onchange=function(){ if(c.checked) sel[c.dataset.k]=1; else delete sel[c.dataset.k]; bulk(); }; });
      bulk();
    }
    function chosen(){ return Object.keys(sel); }
    function bulk(){ var n=chosen().length; $("bulk").classList.toggle("hidden",!n); $("bn").textContent=n+" selected"; }
    $("q").oninput=function(){ state.q=this.value; draw(); };
    $("fp").onchange=function(){ state.prod=this.value; draw(); };
    $("ft").onchange=function(){ state.tag=this.value; draw(); };
    $("fs").onchange=function(){ state.sort=this.value; draw(); };
    document.querySelectorAll("#chips .chip").forEach(function(c){ c.onclick=function(){ state.stage=c.dataset.s; draw(); }; });
    $("all").onchange=function(){ var on=this.checked; list().forEach(function(p){ if(on) sel[p.email]=1; else delete sel[p.email]; }); draw(); };
    function exportRows(L){ A.download("mth-contacts-"+A.today()+".csv",A.csv([["email","name","stage","owns","spent","lessons_done","lessons_total","last_active","tags","email_list","source","signed_up"]].concat(L.map(function(p){ return [p.email,p.name,A.stageName(p.stage),(p.owns||[]).join(" "),(Number(p.spent_cents||0)/100).toFixed(2),p.lessons_done,p.lessons_total,p.last_activity,(p.tags||[]).join(" "),p.list_opt_in,p.source,p.signed_up]; }))),"text/csv"); }
    $("exp").onclick=function(){ exportRows(list()); };
    $("add").onclick=function(){ var e=prompt("Email address of the new contact"); if(e&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim())){ A.rpc("mth_admin_save_contact",{ p_email:e.trim(), p_name:null, p_tags:[], p_notes:null }).then(function(){ A.go("person/"+encodeURIComponent(e.trim().toLowerCase())); }); } };
    document.querySelectorAll("#bulk [data-b]").forEach(function(b){ b.onclick=async function(){
      var L=chosen(), k=b.dataset.b;
      if(k==="clear"){ sel={}; draw(); return; }
      if(k==="copy") return A.copy(L.join(", "),L.length+" emails copied");
      if(k==="mail"){ location.href="mailto:?bcc="+encodeURIComponent(L.join(",")); return; }
      if(k==="csv") return exportRows(P.filter(function(p){ return sel[p.email]; }));
      var t=prompt(k==="tag"?"Tag to add":"Tag to remove"); if(!t) return;
      await A.rpc("mth_admin_bulk_tag",{ p_emails:L, p_tag:t, p_add:k==="tag" });
      MTH.toast((k==="tag"?"Tagged ":"Untagged ")+L.length); P=await A.loadPeople(true); draw();
    }; });
    draw();
  }});

  /* ================= ONE PERSON ================= */
  A.screen("person",{ parent:"contacts", render: async function(V,email){
    email=(email||"").toLowerCase();
    var res=await Promise.all([A.rpc("mth_admin_person",{ p_email:email }), A.loadPeople(true)]);
    var D=res[0]||{}, row=(res[1]||[]).filter(function(p){ return p.email===email; })[0]||{ email:email, stage:"lead", owns:[], tags:[] };
    var ct=D.contact||{}, acc=D.account;
    /* timeline: everything that happened, newest first */
    var ev=[];
    if(ct.created_at&&ct.list_opt_in) ev.push({ at:ct.created_at, k:"", t:"Joined the email list", d:ct.source?("From "+ct.source):"" });
    if(acc) ev.push({ at:acc.created_at, k:"", t:"Created an account" });
    if(acc&&acc.last_sign_in) ev.push({ at:acc.last_sign_in, k:"", t:"Last signed in" });
    (D.purchases||[]).forEach(function(p){ ev.push({ at:p.created_at, k:"buy", t:(p.source==="admin"?"Given ":"Bought ")+(C.products[p.product]||{}).name, d:(p.amount_cents?A.money(p.amount_cents)+(p.livemode?"":" (test)"):"")+(p.active?"":" · access removed") }); });
    var L=window.MTH_COURSES||{};
    (D.progress||[]).forEach(function(p){ var title=p.lesson; try{ (L[p.product].sections||[]).forEach(function(s){ s.lessons.forEach(function(l){ if(l.id===p.lesson) title=l.title; }); }); }catch(e){}
      if(p.done) ev.push({ at:p.at, k:"learn", t:"Finished “"+title+"”", d:(prodShort(p.product))+(p.quiz?" · quiz "+p.quiz.score+"/"+p.quiz.total:"") }); });
    (D.apps||[]).forEach(function(a){ ev.push({ at:a.at, k:"app", t:(a.started?"Using the ":"Opened the ")+prodShort(a.product)+" app", d:"Plan last saved" }); });
    (D.notes||[]).forEach(function(n){ ev.push({ at:n.at, k:"note", t:"Note", d:n.body, id:n.id }); });
    ev.sort(function(a,b){ return new Date(b.at)-new Date(a.at); });
    var tasks=D.tasks||[];
    V.innerHTML='<div style="margin-bottom:10px"><a class="small" href="#contacts">← People</a></div><div class="pp"><div style="display:grid;gap:14px">'+
      '<div class="card ph"><div class="kick">'+(acc?"Member":"Contact")+'</div><h2>'+esc(ct.name||email)+'</h2>'+(ct.name?'<div class="small">'+esc(email)+'</div>':'')+
        '<div style="margin-top:8px">'+A.stagePill(row.stage)+(row.stage!==row.auto_stage&&ct.stage?'<span class="small">set by you · auto: '+A.stageName(row.auto_stage)+'</span>':'')+'</div>'+
        '<div class="kpis" style="margin-top:14px;grid-template-columns:repeat(2,1fr)"><div class="card kpi"><b>'+A.money(row.spent_cents)+'</b><span>Spent</span></div><div class="card kpi"><b>'+(row.lessons_total?Math.round(100*row.lessons_done/row.lessons_total)+'%':'—')+'</b><span>Course progress</span></div></div>'+
        '<div class="small" style="margin-top:10px">Last active '+A.when(row.last_activity)+(ct.source?' · came from '+esc(ct.source):'')+'</div>'+
        '<div class="acts"><a class="b sm" href="mailto:'+esc(email)+'">Email</a><button class="b sm ghost" id="cp">Copy email</button><select class="sel" id="stg"><option value="">Stage: automatic</option>'+A.STAGES.map(function(s){ return '<option value="'+s[0]+'"'+(ct.stage===s[0]?' selected':'')+'>'+s[1]+'</option>'; }).join("")+'</select></div></div>'+
      '<div class="card panel"><h3>Timeline</h3><div class="tl">'+(ev.map(function(e){ return '<div class="ev '+e.k+'"><b>'+esc(e.t)+'</b> <span class="w">'+A.when(e.at,true)+'</span>'+(e.d?'<p>'+esc(e.d)+'</p>':'')+(e.id?'<button class="small" data-arch="'+e.id+'" style="background:none;border:0;color:var(--faint);cursor:pointer;padding:0;margin-top:4px">Hide note</button>':'')+'</div>'; }).join("")||'<p class="muted">Nothing yet.</p>')+'</div></div></div>'+
      '<div style="display:grid;gap:14px">'+
      '<div class="card panel"><h3>Tasks</h3><div id="tk">'+(tasks.map(function(t){ var late=!t.done&&t.due&&t.due<A.today(); return '<div class="task'+(t.done?' done':'')+'"><input type="checkbox" data-t="'+t.id+'"'+(t.done?' checked':'')+' aria-label="Done"><div class="tx"><b>'+esc(t.title)+'</b><div class="due'+(late?' late':'')+'">'+(t.due?(late?"Overdue · ":"Due ")+A.when(t.due):"No date")+'</div></div></div>'; }).join("")||'<p class="muted">No tasks.</p>')+'</div>'+
        '<div class="addrow"><input class="inp" id="tt" placeholder="Follow up about…"><input class="inp" id="td" type="date" style="flex:0 1 160px"><button class="b sm" id="ta">Add</button></div>'+
        '<div class="chips" style="margin:8px 0 0">'+[["Check in tomorrow",1],["Ask for a testimonial",7],["Offer the next protocol",14]].map(function(q){ return '<button class="chip" data-q="'+q[1]+'">'+q[0]+'</button>'; }).join("")+'</div></div>'+
      '<div class="card panel"><h3>Add a note</h3><textarea class="inp" id="nb" placeholder="Call notes, what they said, what they need…"></textarea><button class="b sm" id="na" style="margin-top:8px">Save note</button></div>'+
      '<div class="card panel"><h3>Profile</h3><div class="field"><label>Name</label><input class="inp" id="pn" value="'+esc(ct.name||"")+'"></div><div class="field"><label>Tags (comma separated)</label><input class="inp" id="ptg" value="'+esc((row.tags||[]).join(", "))+'"></div><button class="b sm ghost" id="ps">Save profile</button></div>'+
      '<div class="card panel"><h3>Access</h3>'+C.order.map(function(k){ var has=(row.owns||[]).indexOf(k)>-1; return '<div class="row-i"><span>'+C.products[k].name+'</span><button class="b sm '+(has?'ghost':'sage')+'" data-acc="'+k+'" data-on="'+(has?0:1)+'">'+(has?'Remove':'Give access')+'</button></div>'; }).join("")+(acc?'':'<p class="small">They need to sign in once before you can give access.</p>')+'</div>'+
      '</div></div>';
    var $=function(id){ return document.getElementById(id); };
    $("cp").onclick=function(){ A.copy(email,"Email copied"); };
    $("stg").onchange=async function(){ await A.rpc("mth_admin_set_stage",{ p_email:email, p_stage:this.value||null }); MTH.toast("Stage updated"); A.refresh(); };
    function addTask(title,due){ return A.rpc("mth_admin_task",{ p_id:null, p_email:email, p_title:title, p_due:due||null, p_done:false }).then(function(){ MTH.toast("Task added"); A.refresh(); }); }
    $("ta").onclick=function(){ var t=$("tt").value.trim(); if(!t) return $("tt").focus(); addTask(t,$("td").value); };
    document.querySelectorAll("[data-q]").forEach(function(b){ b.onclick=function(){ var d=new Date(); d.setDate(d.getDate()+Number(b.dataset.q)); addTask(b.textContent,d.toISOString().slice(0,10)); }; });
    document.querySelectorAll("#tk [data-t]").forEach(function(c){ c.onchange=async function(){ await A.rpc("mth_admin_task",{ p_id:Number(c.dataset.t), p_email:null, p_title:null, p_due:(tasks.filter(function(t){ return t.id==c.dataset.t; })[0]||{}).due||null, p_done:c.checked }); A.refresh(); }; });
    $("na").onclick=async function(){ var b=$("nb").value.trim(); if(!b) return $("nb").focus(); await A.rpc("mth_admin_add_note",{ p_email:email, p_body:b }); MTH.toast("Note saved"); A.refresh(); };
    document.querySelectorAll("[data-arch]").forEach(function(b){ b.onclick=async function(){ await A.rpc("mth_admin_archive_note",{ p_id:Number(b.dataset.arch) }); A.refresh(); }; });
    $("ps").onclick=async function(){ var tags=$("ptg").value.split(",").map(function(t){ return t.trim().toLowerCase(); }).filter(Boolean);
      await A.rpc("mth_admin_save_contact",{ p_email:email, p_name:$("pn").value, p_tags:tags, p_notes:ct.notes||null }); MTH.toast("Saved"); A.refresh(); };
    document.querySelectorAll("[data-acc]").forEach(function(b){ b.onclick=async function(){
      var on=b.dataset.on==="1", k=b.dataset.acc;
      if(!on&&!confirm("Remove access to the "+C.products[k].name+"? You can give it back any time.")) return;
      var r=await A.rpc("mth_admin_set_access",{ p_email:email, p_product:k, p_active:on });
      if(r==="no_account") return MTH.toast("They need to sign in once first.");
      MTH.toast(on?"Access given":"Access removed"); A.refresh(); }; });
  }});

  /* ================= TASKS ================= */
  var showDone=false;
  A.screen("tasks",{ nav:"To-dos", group:"Customers", live:true, help:"Your follow-up list. Tick a box when it\u2019s done. Claude adds some of these for you each morning.", render: async function(V){
    var res=await Promise.all([A.rpc("mth_admin_tasks",{ p_include_done:showDone }), A.loadPeople()]);
    var T=res[0]||[], P=res[1]||[], today=A.today();
    var groups=[["Overdue",function(t){ return !t.done&&t.due&&t.due<today; }],["Today",function(t){ return !t.done&&t.due===today; }],["Coming up",function(t){ return !t.done&&t.due&&t.due>today; }],["No date",function(t){ return !t.done&&!t.due; }],["Done",function(t){ return t.done; }]];
    V.innerHTML='<div class="adm-h"><div><div class="kick">Customers</div><h1>To-dos</h1></div><label class="check"><input type="checkbox" id="sd"'+(showDone?' checked':'')+'> Show done</label></div>'+
      '<div class="card panel"><div class="addrow" style="margin-top:0"><input class="inp" id="tt" placeholder="New task, e.g. Film Step 3 video"><input class="inp" id="te" list="ppl" placeholder="Contact (optional)" style="flex:0 1 220px"><datalist id="ppl">'+P.map(function(p){ return '<option value="'+esc(p.email)+'">'; }).join("")+'</datalist><input class="inp" id="td" type="date" style="flex:0 1 160px"><button class="b sm" id="ta">Add task</button></div></div>'+
      groups.map(function(g){ var L=T.filter(g[1]); if(!L.length) return ""; return '<div class="sec-h">'+g[0]+' · '+L.length+'</div><div class="card panel">'+L.map(function(t){ var late=!t.done&&t.due&&t.due<today;
        return '<div class="task'+(t.done?' done':'')+'"><input type="checkbox" data-t="'+t.id+'" data-d="'+(t.due||"")+'"'+(t.done?' checked':'')+' aria-label="Done"><div class="tx"><b>'+esc(t.title)+'</b><div class="due'+(late?' late':'')+'">'+(t.due?A.when(t.due):"No date")+(t.email?' · <a href="#person/'+encodeURIComponent(t.email)+'">'+esc(t.email)+'</a>':'')+'</div></div><input type="date" class="sel" data-due="'+t.id+'" value="'+(t.due||"")+'" style="min-height:34px;font-size:12.5px;max-width:150px" aria-label="Change due date"></div>'; }).join("")+'</div>'; }).join("")||'<p class="muted" style="margin-top:14px">No tasks yet.</p>';
    var $=function(id){ return document.getElementById(id); };
    $("sd").onchange=function(){ showDone=this.checked; A.refresh(); };
    $("ta").onclick=async function(){ var t=$("tt").value.trim(); if(!t) return $("tt").focus(); await A.rpc("mth_admin_task",{ p_id:null, p_email:$("te").value.trim()||null, p_title:t, p_due:$("td").value||null, p_done:false }); MTH.toast("Task added"); A.refresh(); };
    document.querySelectorAll("[data-t]").forEach(function(c){ c.onchange=async function(){ await A.rpc("mth_admin_task",{ p_id:Number(c.dataset.t), p_email:null, p_title:null, p_due:c.dataset.d||null, p_done:c.checked }); A.refresh(); }; });
    document.querySelectorAll("[data-due]").forEach(function(c){ c.onchange=async function(){ await A.rpc("mth_admin_task",{ p_id:Number(c.dataset.due), p_email:null, p_title:null, p_due:c.value||null, p_done:null }); A.refresh(); }; });
  }});

  /* ================= SALES ================= */
  var range=30, mode="all";
  A.screen("sales",{ nav:"Sales", group:"Customers", live:true, help:"Every order. \u201cTest\u201d sales are pretend ones made with the test card; they don\u2019t count as real money.", render: async function(V){
    var res=await Promise.all([A.rpc("mth_admin_sales",{ p_days:range }), A.rpc("mth_admin_members")]);
    var S=(res[0]||[]).filter(function(r){ return mode==="all"||(mode==="live")===!!r.live; });
    var M=(res[1]||[]).filter(function(m){ return m.source==="stripe"&&(mode==="all"||(mode==="live")===!!m.livemode); });
    var by={}; S.forEach(function(r){ by[r.product]=by[r.product]||{n:0,c:0}; by[r.product].n+=r.sales; by[r.product].c+=Number(r.cents); });
    var total=S.reduce(function(a,r){ return a+Number(r.cents); },0), n=S.reduce(function(a,r){ return a+r.sales; },0);
    V.innerHTML='<div class="adm-h"><div><div class="kick">Customers</div><h1>Sales</h1></div><div class="acts"><select class="sel" id="rg"><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select><select class="sel" id="md"><option value="all">Real + test</option><option value="live">Real only</option><option value="test">Test only</option></select></div></div>'+
      '<div class="kpis"><div class="card kpi"><b>'+A.money(total)+'</b><span>Revenue</span></div><div class="card kpi"><b>'+n+'</b><span>Orders</span></div><div class="card kpi"><b>'+(n?A.money(Math.round(total/n)):"—")+'</b><span>Average order</span></div>'+
      C.order.map(function(k){ var x=by[k]||{n:0,c:0}; return '<div class="card kpi"><b>'+x.n+'</b><span>'+prodShort(k)+' · '+A.money(x.c)+'</span></div>'; }).join("")+'</div>'+
      '<div class="card panel" style="margin-top:14px">'+chart(S,Math.min(range,90))+'</div>'+
      '<div class="sec-h">Orders</div><div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Date</th><th>Customer</th><th>Protocol</th><th>Amount</th><th class="hm">Mode</th></tr></thead><tbody>'+
      (M.map(function(m){ return '<tr data-e="'+esc(m.email)+'"><td class="small">'+A.when(m.created_at,true)+'</td><td>'+esc(m.email)+'</td><td><span class="pill own">'+esc(prodShort(m.product))+'</span></td><td>'+A.money(m.amount_cents)+'</td><td class="hm small">'+(m.livemode?"Real":"Test")+'</td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:18px">No orders yet.</td></tr>')+'</tbody></table></div>';
    document.getElementById("rg").value=String(range); document.getElementById("md").value=mode;
    document.getElementById("rg").onchange=function(){ range=Number(this.value); A.refresh(); };
    document.getElementById("md").onchange=function(){ mode=this.value; A.refresh(); };
    document.querySelectorAll("tr[data-e]").forEach(function(tr){ tr.onclick=function(){ A.go("person/"+encodeURIComponent(tr.dataset.e)); }; });
  }});
})();
