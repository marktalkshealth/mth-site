/* =================================================================
   ADMIN CORE — layout, navigation and shared helpers.
   Each screen registers itself with ADM.screen(id, {...}) in its own file.
   Address bar: admin.html#contacts, #person/name@example.com, #studio ...
================================================================= */
(function(){
  var A=window.ADM={ screens:{}, order:[] };
  A.esc=function(s){ return MTH.esc(s); };
  A.STAGES=[["lead","Lead","#cbbfae"],["signed_up","Signed up","#d9b979"],["customer","Customer","#9fb592"],["active","Active","#5f8f6b"],["at_risk","At risk","#c0623f"],["completed","Completed","#7f8fae"],["vip","VIP","#2b2724"],["refunded","Refunded","#bbbbbb"]];
  A.stageName=function(k){ for(var i=0;i<A.STAGES.length;i++) if(A.STAGES[i][0]===k) return A.STAGES[i][1]; return k||""; };
  A.stagePill=function(k){ return '<span class="pill s-'+A.esc(k)+'">'+A.esc(A.stageName(k))+'</span>'; };
  A.money=function(c){ c=Number(c||0); return "$"+(c/100).toLocaleString(undefined,{minimumFractionDigits:c%100?2:0,maximumFractionDigits:2}); };
  A.when=function(t,withTime){ if(!t) return "—"; var d=new Date(t); if(isNaN(d)) return "—";
    var days=Math.floor((Date.now()-d.getTime())/864e5);
    if(!withTime&&days>=0&&days<1) return "Today"; if(!withTime&&days===1) return "Yesterday"; if(!withTime&&days>1&&days<7) return days+" days ago";
    return d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:d.getFullYear()===new Date().getFullYear()?undefined:"numeric"})+(withTime?" · "+d.toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"}):""); };
  A.today=function(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); };
  A.rpc=async function(name,args,quiet){
    var r=await MTH.sb.rpc(name,args||{});
    if(r.error){ console.warn(name,r.error); if(!quiet) MTH.toast("Something went wrong ("+(r.error.message||name)+")"); throw r.error; }
    return r.data;
  };
  A.copy=async function(text,msg){ try{ await navigator.clipboard.writeText(text); MTH.toast(msg||"Copied"); }catch(e){ var t=document.createElement("textarea"); t.value=text; document.body.appendChild(t); t.select(); try{ document.execCommand("copy"); MTH.toast(msg||"Copied"); }catch(x){} t.remove(); } };
  A.download=function(name,text,type){ var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:type||"text/plain"})); a.download=name; document.body.appendChild(a); a.click(); a.remove(); };
  A.csv=function(rows){ return rows.map(function(r){ return r.map(function(v){ v=v==null?"":String(v); return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(","); }).join("\n"); };

  /* contacts cache (CRM list), refreshed when something changes */
  A.people=null;
  A.loadPeople=async function(force){ if(A.people&&!force) return A.people; A.people=await A.rpc("mth_admin_crm")||[]; return A.people; };

  /* ---------- several monitors: any screen can open in its own clean window ---------- */
  var POP=/[?&]pop=1/.test(location.search);
  if(POP) document.documentElement.classList.add("adm-pop","mx-bare");
  try{ if(localStorage.getItem("mth_admin_big")==="1") document.documentElement.classList.add("adm-big"); }catch(e){}
  A.popUrl=function(id){ return location.pathname.split("/").pop()+"?pop=1#"+id; };
  A.pop=function(id,feat){ return window.open(A.popUrl(id),"mth_"+id,feat||"width=1200,height=900"); };
  /* Screen 1: today + people · Screen 2: posts · Screen 3: numbers (refreshes itself) */
  A.SCREENS=[["today","Screen 1 · Today & people"],["studio","Screen 2 · Posts"],["overview","Screen 3 · Live numbers"]];
  A.threeScreens=async function(){
    var placed=0;
    try{
      if("getScreenDetails" in window){
        var d=await window.getScreenDetails(), sc=(d.screens||[]).slice().sort(function(a,b){ return a.left-b.left; });
        if(sc.length>=2){
          A.SCREENS.forEach(function(x,i){ var m=sc[Math.min(i,sc.length-1)];
            var w=A.pop(x[0],"left="+m.availLeft+",top="+m.availTop+",width="+m.availWidth+",height="+m.availHeight); if(w) placed++; });
        }
      }
    }catch(e){ console.warn("screens",e); }
    if(placed===A.SCREENS.length) return MTH.toast("Opened on your screens. Press F11 in each window for full screen.",5000);
    /* browsers often allow only one new window per click: give one button per screen */
    var m=document.createElement("div"); m.className="mx-modal";
    m.innerHTML='<div class="box"><h3>Set up your 3 screens</h3><p>Click each button. A window opens; drag it onto that monitor and press <b>F11</b> to make it full screen. Next time, your browser remembers where each window goes.</p><div class="acts">'+
      A.SCREENS.map(function(x){ return '<button class="b full" data-s="'+x[0]+'">Open '+x[1]+'</button>'; }).join("")+'<button class="b full ghost" data-x>Close</button></div>'+
      '<p class="small" style="margin:12px 0 0">Using Chrome or Edge? If it asks to <b>manage windows on all your displays</b>, choose Allow, and the windows place themselves next time.</p></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){ var b=e.target.closest("[data-s]"); if(b){ A.pop(b.dataset.s); b.textContent="Opened ✓"; b.classList.add("ghost"); } if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); });
  };
  A.toggleBig=function(){ var on=!document.documentElement.classList.contains("adm-big"); document.documentElement.classList.toggle("adm-big",on); try{ localStorage.setItem("mth_admin_big",on?"1":"0"); }catch(e){} };

  A.screen=function(id,def){ def._p0=def.parent; A.screens[id]=def; if(def.nav) A.order.push(id); };
  /* put several screens under one sidebar item, shown as tabs: A.family("edit", ["edit","words","blog",...], {words:"Website pages",...}) */
  A.families={};
  A.home=function(id){ var s=A.screens[id]||{}, k=s.tabParent||id; s=A.screens[k]||{}; return s.parent||k; };
  A.family=function(home,ids,labels){
    A.families[home]=ids;
    ids.forEach(function(k){ var s=A.screens[k]; if(!s) return; s.tab=(labels&&labels[k])||s.nav||k;
      if(k!==home){ s.parent=home; var i=A.order.indexOf(k); if(i>-1) A.order.splice(i,1); A.families[k]=ids; }
      /* sub-screens (an article, a person…) keep pointing at their own tab */
    });
    Object.keys(A.screens).forEach(function(k){ var s=A.screens[k]; if(s.parent&&ids.indexOf(s.parent)>-1&&ids.indexOf(k)<0) s.tabParent=s.parent; });
  };


  /* ---------- departments: the big row of buttons across the top ----------
     A.departments([{ k:"crm", ic:"👥", t:"CRM", s:"People & sales", ids:["contacts","sales"], tabs:{contacts:"People"} }, ...])
     Each department's screens become tabs inside it. */
  A.DEPTS=null;
  A.departments=function(list){
    A.families={};
    Object.keys(A.screens).forEach(function(k){ var s=A.screens[k]; s.parent=s._p0; delete s.tabParent; delete s.tab; });
    A.order=Object.keys(A.screens).filter(function(k){ return A.screens[k].nav; });
    A.DEPTS=list.map(function(d){ d.ids=d.ids.filter(function(k){ return A.screens[k]; }); return d; }).filter(function(d){ return d.ids.length; });
    A.DEPTS.forEach(function(d){ if(d.ids.length>1) A.family(d.ids[0],d.ids,d.tabs||{}); });
    var first=A.DEPTS.map(function(d){ return d.ids[0]; });
    A.order=first.concat(A.order.filter(function(k){ return first.indexOf(k)<0&&!A.screens[k].parent; }));
  };
  A.deptOf=function(id){ var h=A.home(id); if(!A.DEPTS) return null; for(var i=0;i<A.DEPTS.length;i++){ if(A.DEPTS[i].ids.indexOf(h)>-1||A.DEPTS[i].ids.indexOf(id)>-1) return A.DEPTS[i]; } return null; };

  /* ---------- tabs you can pull off onto another monitor, like browser tabs ---------- */
  var BC=null; try{ BC=new BroadcastChannel("mth-admin"); }catch(e){}
  A.out={};   /* department key -> its own window */
  function markOut(){ document.querySelectorAll("[data-d]").forEach(function(a){ var w=A.out[a.dataset.d]; a.classList.toggle("out",!!(w&&!w.closed)); }); }
  A.detach=function(k,x,y){
    var d=(A.DEPTS||[]).filter(function(z){ return z.k===k; })[0]; if(!d) return;
    var cur=A.deptOf((location.hash||"#").slice(1).split("/")[0]), hash=(cur&&cur.k===k)?(location.hash||"#"+d.ids[0]).slice(1):d.ids[0];
    var W=Math.min(1400,screen.availWidth||1400), H=Math.min(950,screen.availHeight||950);
    var feat="width="+W+",height="+H+(x!=null?",left="+Math.max(0,Math.round(x-W/2))+",top="+Math.max(0,Math.round(y-30)):"");
    var w=window.open(A.popUrl(hash),"mth_"+k,feat);
    if(!w){ MTH.toast("Your browser blocked the new window. Allow pop-ups for this site, then try again.",6000); return; }
    A.out[k]=w; try{ w.focus(); }catch(e){} markOut();
    /* show another department here so the two windows aren't the same */
    if(cur&&cur.k===k){ var o=A.DEPTS.filter(function(z){ return !A.out[z.k]||A.out[z.k].closed; })[0]; if(o) A.go(o.ids[0]); }
  };
  if(BC) BC.onmessage=function(e){ var m=e.data||{};
    if(POP) return;
    if(m.t==="dock"){ if(m.k) delete A.out[m.k]; markOut(); if(m.h) A.go(m.h); try{ window.focus(); }catch(x){} }
    if(m.t==="closed") setTimeout(markOut,800);
  };
  setInterval(markOut,2000);

  function shell(){
    var root=document.getElementById("adm");
    if(!A.DEPTS) A.departments(A.order.map(function(k){ return { k:k, ic:"•", t:A.screens[k].nav, s:"", ids:[k] }; }));
    var site=[["index.html","Website"],["protocols.html","Courses"],["/blog/","Blog"],["app.html","App"],["account.html","My account"]];
    var bar=A.DEPTS.map(function(d){ return '<a href="#'+d.ids[0]+'" data-d="'+d.k+'" draggable="'+(POP?'false':'true')+'" title="'+A.esc(d.t)+(POP?'':' · drag me off to put me on another monitor')+'">'+
      '<span class="ic">'+d.ic+'</span><b>'+A.esc(d.t)+'</b><small>'+A.esc(d.s||"")+'</small>'+(POP?'':'<button class="tear" data-tear="'+d.k+'" title="Open in its own window" aria-label="Open '+A.esc(d.t)+' in its own window">⧉</button>')+'<i class="badge hidden" data-c="'+d.ids[0]+'"></i></a>'; }).join("");
    root.innerHTML='<div class="adm-top"><div class="adm-top-in"><div class="adm-title"><span class="kick">Mark Talks Health</span><b>Control room</b></div>'+
      '<nav class="adm-site" aria-label="My website">'+site.map(function(l){ return '<a href="'+l[0]+'" target="_blank" rel="noopener">'+l[1]+' ↗</a>'; }).join("")+'</nav></div>'+
      '<nav class="adm-depts" aria-label="Admin sections" role="tablist">'+bar+'</nav></div>'+
      '<main class="adm-main" id="admMain"></main>';
    var nav=root.querySelector(".adm-depts"), sx=0, sy=0;
    nav.addEventListener("click",function(e){ var t=e.target.closest("[data-tear]"); if(t){ e.preventDefault(); e.stopPropagation(); A.detach(t.dataset.tear); return; }
      var a=e.target.closest("[data-d]"); if(a){ var w=A.out[a.dataset.d]; if(w&&!w.closed){ e.preventDefault(); try{ w.focus(); }catch(x){} MTH.toast(a.querySelector("b").textContent+" is open in its own window. Press “Put back” there to bring it home.",5000); } } });
    if(!POP){
      nav.addEventListener("dragstart",function(e){ var a=e.target.closest("[data-d]"); if(!a) return; sx=e.screenX; sy=e.screenY; a.classList.add("drag"); try{ e.dataTransfer.setData("text/plain",a.dataset.d); e.dataTransfer.effectAllowed="move"; }catch(x){} });
      nav.addEventListener("dragend",function(e){ var a=e.target.closest("[data-d]"); if(!a) return; a.classList.remove("drag");
        var x=e.screenX, y=e.screenY, out=(!x&&!y)||x<window.screenX||x>window.screenX+window.outerWidth||y<window.screenY||y>window.screenY+window.outerHeight;
        var r=nav.getBoundingClientRect(), far=(y-sy)>Math.max(90,r.height*0.8)||Math.abs(x-sx)>window.innerWidth*0.6;
        if(out||far) A.detach(a.dataset.d,(!x&&!y)?null:x,(!x&&!y)?null:y); });
      document.addEventListener("dragover",function(e){ if(document.querySelector(".adm-depts .drag")) e.preventDefault(); });
    }
    markOut();
  }
  A.badge=function(id,n){ var el=document.querySelector('[data-c="'+id+'"]'); if(!el) return; el.textContent=n; el.classList.toggle("hidden",!n); };

  var lastHash=location.hash;
  async function route(){
    /* unsaved changes (e.g. a blog article): ask before leaving the screen */
    if(A._back){ A._back=false; return; }
    if(location.hash!==lastHash&&A.isDirty&&A.isDirty()){
      if(!confirm("You have changes you haven’t saved. Leave without saving?")){ A._back=true; history.replaceState(null,"",lastHash||"#today"); A._back=false; return; }
      if(A.clearDirty) A.clearDirty();
    }
    lastHash=location.hash;
    var h=decodeURIComponent((location.hash||"#today").slice(1)), parts=h.split("/"), id=parts[0], arg=parts.slice(1).join("/");
    if(!A.screens[id]) id="today";
    var D=A.deptOf(id);
    document.querySelectorAll("[data-d]").forEach(function(a){ var on=!!D&&a.dataset.d===D.k; a.classList.toggle("on",on); a.setAttribute("aria-selected",on?"true":"false"); });
    if(POP&&D) document.title=D.t+" · Mark Talks Health";
    var tab=document.querySelector('.adm-depts a.on'), bar=tab&&tab.parentNode; if(bar&&bar.scrollWidth>bar.clientWidth+4) bar.scrollLeft=Math.max(0,tab.offsetLeft-(bar.clientWidth-tab.offsetWidth)/2);
    var main=document.getElementById("admMain"), def=A.screens[id];
    if(!A._silent){ main.innerHTML='<div class="mx-wait" style="min-height:40vh">Loading…</div>'; window.scrollTo(0,0); }
    var y=window.scrollY;
    try{
      await def.render(main,arg);
      var helpId=def.help?id:(def.parent||id);
      var bar='<div class="adm-help">'+(A.screens[helpId].help?'<span class="adm-help-t">'+A.screens[helpId].help+'</span>':'<span></span>')+
        '<span class="adm-help-b"><button class="b sm ghost" data-big title="Bigger or smaller text">A<span style="font-size:1.25em">A</span></button>'+
        (POP?'<span class="small adm-live">'+(def.live?'Updates every minute':'')+'</span><button class="b sm" data-dock title="Close this window and put this tab back in the main window">↩ Put back</button>':'<button class="b sm ghost" data-pop title="Open this section in its own window, to put it on another monitor">⧉ Own window</button>')+'</span></div>';
      /* screens that live together (e.g. Edit: Website, Blog, Courses, Thumbnails) get a row of tabs */
      var tabK=def.tabParent||id, fam=A.families[tabK];
      if(fam) bar+='<div class="adm-sub" role="tablist">'+fam.map(function(k){ var on=(k===tabK); return '<a href="#'+k+'" role="tab"'+(on?' class="on" aria-selected="true"':'')+'>'+A.screens[k].tab+'</a>'; }).join("")+'</div>';
      main.insertAdjacentHTML("afterbegin",bar);
      main.querySelector("[data-big]").onclick=A.toggleBig;
      var dk=main.querySelector("[data-dock]"); if(dk) dk.onclick=A.dock;
      var pb=main.querySelector("[data-pop]"); if(pb) pb.onclick=function(){ var d=A.deptOf(id); if(d) A.detach(d.k); else A.pop(id+(arg?"/"+encodeURIComponent(arg):"")); };
      if(A._silent) window.scrollTo(0,y);
    }
    catch(e){ console.error(e); main.innerHTML='<div class="panel card"><h3>Couldn’t load this screen</h3><p class="muted">'+A.esc(e.message||String(e))+'</p><button class="b sm" onclick="location.reload()">Reload</button></div>'; }
  }
  /* pop-out windows of live screens refresh themselves every minute (not while you're typing) */
  setInterval(function(){
    var h=(location.hash||"#").slice(1).split("/")[0]; var def=A.screens[h];
    if(!POP||!def||!def.live) return;
    var a=document.activeElement; if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
    if(document.querySelector(".mx-modal,.drawer")) return;
    A._silent=true; route().then(function(){ A._silent=false; },function(){ A._silent=false; });
  },60000);
  A.dock=function(){ var h=(location.hash||"#today").slice(1), d=A.deptOf(h.split("/")[0]);
    if(BC) BC.postMessage({ t:"dock", k:d&&d.k, h:h });
    if(!window.opener||window.opener.closed){ location.href=location.pathname+(location.hash||""); return; }
    A._docked=true; window.close(); };
  if(POP) window.addEventListener("pagehide",function(){ if(A._docked||!BC) return; var d=A.deptOf((location.hash||"#").slice(1).split("/")[0]); BC.postMessage({ t:"closed", k:d&&d.k }); });
  A.go=function(hash){ if(location.hash==="#"+hash) route(); else location.hash=hash; };
  A.refresh=route;

  A.start=async function(){
    await MTH.require();
    var ok=false; try{ ok=(await MTH.sb.rpc("mth_is_admin")).data===true; }catch(e){}
    var root=document.getElementById("adm");
    if(!ok){ root.innerHTML='<main class="adm-main"><h1 class="t">Admins <em>only</em></h1><p class="lead">This page is for Mark. You’re signed in as '+A.esc(MTH.user.email)+'.</p><a class="b" href="index.html">Back to the site</a></main>'; return; }
    shell(); window.addEventListener("hashchange",route); route();

  };
})();
