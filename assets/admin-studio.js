/* =================================================================
   ADMIN — SOCIAL STUDIO
   Plan → write → film → edit → schedule → post, for Reels/TikTok, Instagram feed,
   YouTube, Facebook and Threads. Each post gets tracking links (go.html) so the
   Conversions screen shows which posts bring list sign-ups and sales.
   Publishing is done by Metricool: "Export for Metricool" makes their bulk-upload CSV.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;
  var STATUS=[["idea","Idea"],["script","Scripted"],["filmed","Filmed"],["edited","Edited"],["ready","Ready"],["scheduled","Scheduled"],["posted","Posted"]];
  var PLAT=[["instagram","Instagram","IG"],["tiktok","TikTok","TT"],["youtube","YouTube","YT"],["facebook","Facebook","FB"],["threads","Threads","TH"]];
  var FORMATS=[["reel","Reel / TikTok / Short · 9:16"],["feed","Instagram feed · 4:5"],["carousel","Carousel · 4:5"],["story","Story · 9:16"],["youtube","YouTube video · 16:9"]];
  var PILLARS=["Fasting & cleanse","Meditation & journaling","High protein & broths","Cardio & strength","Music & spirit","Sleep & clean air","Nature & sun","My story","Results","Myth-busting","Recipe","Q&A"];
  var LIMIT={ instagram:2200, tiktok:2200, youtube:5000, facebook:5000, threads:500 };
  var LINKPAGES=[["gut.html","Gut Health sales page"],["diabetes.html","Diabetes sales page"],["glp1.html","GLP-1 sales page"],["protocols.html","All protocols"],["index.html","Homepage (email list)"]];
  function stName(k){ for(var i=0;i<STATUS.length;i++) if(STATUS[i][0]===k) return STATUS[i][1]; return k; }
  function platShort(k){ for(var i=0;i<PLAT.length;i++) if(PLAT[i][0]===k) return PLAT[i][2]; return k; }
  function slugify(t,id){ return (String(t||"post").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)||"post")+"-"+id; }
  function siteBase(){ return MTH.base; }
  function trackLink(p,plat){ return siteBase()+"go.html?p="+encodeURIComponent(p.slug||"")+"&s="+plat; }
  function capFor(p,plat){ var c=(p.captions||{})[plat]; return (c&&c.trim())?c:(p.caption||""); }
  function fullText(p,plat){
    var t=capFor(p,plat).trim(), link=p.slug?trackLink(p,plat):"";
    var cta=(p.cta||"").trim();
    var clickable=plat==="facebook"||plat==="threads"||plat==="youtube";
    var parts=[t];
    if(cta) parts.push(clickable&&link?cta+" "+link:cta);
    else if(clickable&&link) parts.push(link);
    if(p.hashtags&&plat!=="threads") parts.push(p.hashtags.trim());
    return parts.filter(Boolean).join("\n\n");
  }
  async function loadPosts(){ var r=await sb.from("mth_posts").select("*").order("publish_at",{ ascending:true, nullsFirst:false }).order("created_at",{ ascending:false }); if(r.error) throw r.error; return r.data||[]; }
  async function savePost(p){
    var row=Object.assign({},p); delete row.created_at; row.updated_at=new Date().toISOString();
    var r=row.id?await sb.from("mth_posts").update(row).eq("id",row.id).select().single():await sb.from("mth_posts").insert(row).select().single();
    if(r.error){ MTH.toast("Couldn’t save: "+r.error.message); throw r.error; }
    var saved=r.data;
    if(!saved.slug){ var u=await sb.from("mth_posts").update({ slug:slugify(saved.title,saved.id) }).eq("id",saved.id).select().single(); if(!u.error) saved=u.data; }
    return saved;
  }
  async function newPost(defaults){
    var p=await savePost(Object.assign({ title:"New post", status:"idea", platforms:["instagram","tiktok"], format:"reel", link_page:"gut.html", product:"gut", captions:{} },defaults||{}));
    A.go("post/"+p.id);
  }

  /* ---------- idea engine: turns the course's own facts into post ideas ---------- */
  var HOOKS=[
    ["Myth-busting","Most people get this wrong about {topic}.","{fact}"],
    ["Did you know","Did you know this about {topic}?","{fact}"],
    ["Story","What happened when I started {topic}.","{fact} Here’s what I noticed in my own body."],
    ["How-to","How to start {topic} this week (even as a beginner).","{fact} Step one is simpler than you think."],
    ["Question","Quick quiz: {question}","The answer: {answer}. {fact}"],
    ["Stop doing","Stop doing this if you want {benefit}.","{fact}"]
  ];
  var BENEF={ fasting:"your gut to heal", meditation:"less stress", journaling:"a calmer mind", keto:"steady energy", protein:"steady energy and fewer cravings", exercise:"more energy", massage:"faster recovery", music:"to switch off stress", sleep:"deeper sleep", air:"cleaner air at home", sunlight:"better sleep and mood", redlight:"faster recovery", forest:"a calmer nervous system", broth:"a happier gut" };
  function ideas(n){
    var out=[], pool=[];
    C.order.forEach(function(prod){ (window.MTH_COURSES[prod].sections||[]).forEach(function(s,si){ s.lessons.forEach(function(l){ (l.quiz||[]).forEach(function(q){ pool.push({ prod:prod, step:s.step, pillar:s.step?PILLARS[s.step-1]:"My story", lesson:l, q:q }); }); }); }); });
    var seen={};
    for(var i=0;i<400&&out.length<n;i++){
      var x=pool[Math.floor(Math.random()*pool.length)], h=HOOKS[Math.floor(Math.random()*HOOKS.length)];
      var key=x.q.q+"|"+h[0]; if(seen[key]) continue; seen[key]=1;
      var topic=x.lesson.title.replace(/^The /,"").toLowerCase(), fact=x.q.fb, ans=x.q.o[x.q.a];
      var fill=function(t){ return t.replace("{topic}",topic).replace("{fact}",fact).replace("{question}",x.q.q).replace("{answer}",ans).replace("{benefit}",BENEF[x.lesson.id]||"better health"); };
      out.push({ angle:h[0], title:fill(h[1]), hook:fill(h[1]), body:fill(h[2]), pillar:x.pillar, product:x.prod, lesson:x.lesson.title });
    }
    return out;
  }

  /* ================= STUDIO (board / calendar / list) ================= */
  var view=localStorage.getItem("mth_studio_view")||"board", month=null, fprod="";
  A.screen("studio",{ nav:"Posts", group:"Growing", help:"Plan your social posts. Each card is one post. Move it along as you go: idea → write → film → edit → ready. Then Export for Metricool to schedule them.", render: async function(V){
    var P=await loadPosts();
    if(fprod) P=P.filter(function(p){ return p.product===fprod; });
    var due=P.filter(function(p){ return p.status!=="posted"&&p.publish_at&&new Date(p.publish_at)<Date.now(); }).length;
    var week=P.filter(function(p){ if(!p.publish_at) return false; var d=(new Date(p.publish_at)-Date.now())/864e5; return d>=0&&d<7; }).length;
    V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>Your <em>posts</em></h1></div><div class="acts"><button class="b sm ghost" id="ideas">Get ideas</button><button class="b sm ghost" id="exp">Export for Metricool</button><button class="b sm" id="new">New post</button></div></div>'+
      '<div class="kpis" style="margin-bottom:14px">'+[["idea","Ideas"],["script","Scripted"],["filmed","Filmed"],["edited","Edited"],["ready","Ready"],["scheduled","Scheduled"]].map(function(s){ return '<div class="card kpi"><b>'+P.filter(function(p){ return p.status===s[0]; }).length+'</b><span>'+s[1]+'</span></div>'; }).join("")+'</div>'+
      (due?'<div class="msg err">'+due+' post'+(due>1?'s are':' is')+' past the publish date but not marked posted.</div>':'')+
      '<div class="bar"><div class="chips" style="margin:0">'+[["board","Board"],["calendar","Calendar"],["list","List"]].map(function(v){ return '<button class="chip'+(view===v[0]?' on':'')+'" data-v="'+v[0]+'">'+v[1]+'</button>'; }).join("")+'</div>'+
      '<select class="sel" id="fp"><option value="">All protocols</option>'+C.order.map(function(k){ return '<option value="'+k+'"'+(fprod===k?' selected':'')+'>'+C.products[k].short+'</option>'; }).join("")+'</select><span class="small">'+week+' going out in the next 7 days</span></div><div id="sv"></div>';
    var $=function(id){ return document.getElementById(id); };
    $("new").onclick=function(){ var t=prompt("What\u2019s the post about? (working title)"); if(t) newPost({ title:t.trim().slice(0,120) }); };
    $("fp").onchange=function(){ fprod=this.value; A.refresh(); };
    $("exp").onclick=function(){ exportDialog(P); };
    $("ideas").onclick=function(){ ideaDialog(); };
    document.querySelectorAll("[data-v]").forEach(function(b){ b.onclick=function(){ view=b.dataset.v; localStorage.setItem("mth_studio_view",view); A.refresh(); }; });
    var sv=$("sv");
    function card(p){ return '<div class="card" draggable="true" data-id="'+p.id+'" style="padding:12px 12px 10px;margin-bottom:8px;cursor:pointer"><b style="font-size:14.5px;display:block;line-height:1.3">'+esc(p.title)+'</b>'+
      '<div style="margin-top:6px">'+(p.platforms||[]).map(function(x){ return '<span class="pill">'+platShort(x)+'</span>'; }).join("")+(p.product?'<span class="pill own">'+esc((C.products[p.product]||{}).short||p.product)+'</span>':'')+'</div>'+
      '<div class="small" style="margin-top:4px">'+(p.publish_at?A.when(p.publish_at,true):'No date')+(p.pillar?' · '+esc(p.pillar):'')+'</div></div>'; }
    if(view==="board"){
      sv.innerHTML='<div style="display:grid;grid-auto-flow:column;grid-auto-columns:minmax(230px,1fr);gap:12px;overflow-x:auto;padding-bottom:10px">'+STATUS.map(function(s){ var L=P.filter(function(p){ return p.status===s[0]; });
        return '<div class="col" data-s="'+s[0]+'" style="background:var(--bg2);border-radius:16px;padding:10px;min-height:200px"><div class="sec-h" style="margin:2px 4px 10px">'+s[1]+' · '+L.length+'</div>'+L.map(card).join("")+(s[0]==="idea"?'<button class="b sm ghost full" data-add>+ Add idea</button>':'')+'</div>'; }).join("")+'</div><p class="small">Tip: drag cards between columns on a computer, or open a post to change its stage.</p>';
      var add=sv.querySelector("[data-add]"); if(add) add.onclick=function(){ var t=prompt("Post idea"); if(t) newPost({ title:t }); };
      sv.querySelectorAll("[data-id]").forEach(function(c){
        c.onclick=function(){ A.go("post/"+c.dataset.id); };
        c.addEventListener("dragstart",function(e){ e.dataTransfer.setData("text/plain",c.dataset.id); });
      });
      sv.querySelectorAll(".col").forEach(function(col){
        col.addEventListener("dragover",function(e){ e.preventDefault(); col.style.outline="2px dashed var(--terra)"; });
        col.addEventListener("dragleave",function(){ col.style.outline=""; });
        col.addEventListener("drop",async function(e){ e.preventDefault(); col.style.outline=""; var id=Number(e.dataTransfer.getData("text/plain")); var r=await sb.from("mth_posts").update({ status:col.dataset.s, updated_at:new Date().toISOString() }).eq("id",id); if(r.error) MTH.toast("Couldn’t move"); A.refresh(); });
      });
    } else if(view==="calendar"){
      var base=month?new Date(month):new Date(); base.setDate(1); base.setHours(0,0,0,0);
      var start=new Date(base); start.setDate(1-((base.getDay()+6)%7));
      var cells=""; for(var i=0;i<42;i++){ var d=new Date(start); d.setDate(start.getDate()+i); var key=d.toDateString();
        var L=P.filter(function(p){ return p.publish_at&&new Date(p.publish_at).toDateString()===key; });
        cells+='<div data-day="'+d.toISOString().slice(0,10)+'" style="min-height:96px;border:1px solid var(--line);border-radius:10px;padding:6px;background:'+(d.getMonth()===base.getMonth()?'#fff':'var(--bg)')+';cursor:pointer;min-width:0"><div class="small" style="font-weight:700;'+(d.toDateString()===new Date().toDateString()?'color:var(--terra)':'')+'">'+d.getDate()+'</div>'+
          L.map(function(p){ return '<div data-id="'+p.id+'" style="font-size:11.5px;line-height:1.25;margin-top:4px;padding:3px 5px;border-radius:6px;background:'+({posted:"#e4eadf",scheduled:"#f3ead8",ready:"#f6dccf"}[p.status]||"var(--bg2)")+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(p.title)+'</div>'; }).join("")+'</div>'; }
      sv.innerHTML='<div class="bar"><button class="b sm ghost" id="pm">←</button><b style="font-family:var(--serif);font-size:24px;font-weight:500">'+base.toLocaleDateString(undefined,{month:"long",year:"numeric"})+'</b><button class="b sm ghost" id="nm">→</button></div>'+
        '<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">'+["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(function(d){ return '<div class="small" style="text-align:center;font-weight:700">'+d+'</div>'; }).join("")+cells+'</div><p class="small">Tap a day to plan a post on it.</p>';
      $("pm").onclick=function(){ var m=new Date(base); m.setMonth(m.getMonth()-1); month=m.toISOString(); A.refresh(); };
      $("nm").onclick=function(){ var m=new Date(base); m.setMonth(m.getMonth()+1); month=m.toISOString(); A.refresh(); };
      sv.querySelectorAll("[data-id]").forEach(function(c){ c.onclick=function(e){ e.stopPropagation(); A.go("post/"+c.dataset.id); }; });
      sv.querySelectorAll("[data-day]").forEach(function(c){ c.onclick=function(){ var t=prompt("New post for "+c.dataset.day); if(t) newPost({ title:t, publish_at:new Date(c.dataset.day+"T18:00").toISOString(), status:"idea" }); }; });
    } else {
      sv.innerHTML='<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Post</th><th>Stage</th><th>Platforms</th><th class="hm">Protocol</th><th>Publish</th></tr></thead><tbody>'+
        (P.map(function(p){ return '<tr data-id="'+p.id+'"><td><b>'+esc(p.title)+'</b>'+(p.pillar?'<br><span class="small">'+esc(p.pillar)+'</span>':'')+'</td><td><span class="pill">'+stName(p.status)+'</span></td><td>'+(p.platforms||[]).map(function(x){ return '<span class="pill">'+platShort(x)+'</span>'; }).join("")+'</td><td class="hm">'+esc((C.products[p.product]||{}).short||"")+'</td><td class="small">'+(p.publish_at?A.when(p.publish_at,true):"—")+'</td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:18px">No posts yet. Tap “Get ideas” to start.</td></tr>')+'</tbody></table></div>';
      sv.querySelectorAll("tr[data-id]").forEach(function(tr){ tr.onclick=function(){ A.go("post/"+tr.dataset.id); }; });
    }
  }});

  function ideaDialog(){
    var list=ideas(8);
    var m=document.createElement("div"); m.className="drawer"; m.style.cssText="position:fixed;inset:0;z-index:70;background:rgba(43,39,36,.45);display:flex;justify-content:flex-end";
    m.innerHTML='<div style="width:min(560px,100%);height:100%;overflow:auto;background:var(--bg);padding:22px 20px 40px"><div style="display:flex;justify-content:space-between;align-items:center"><div class="kick">Idea engine</div><button class="b sm ghost" data-x>Close</button></div><h3 style="font-family:var(--serif);font-weight:500;font-size:30px;margin:6px 0 4px">Post ideas from your course</h3><p class="small">Built from the facts in your lessons and quizzes. Add the ones you like to the board.</p>'+
      list.map(function(x,i){ return '<div class="card" style="padding:14px;margin-top:10px"><span class="pill tag">'+esc(x.angle)+'</span><span class="pill">'+esc(x.pillar)+'</span><span class="pill own">'+esc(C.products[x.product].short)+'</span><b style="display:block;margin-top:6px;font-size:16px">'+esc(x.hook)+'</b><p class="small" style="margin:6px 0 10px">'+esc(x.body)+'</p><button class="b sm" data-i="'+i+'">Add to board</button></div>'; }).join("")+
      '<button class="b ghost full" data-more style="margin-top:14px">More ideas</button></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){ if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); if(e.target.hasAttribute("data-more")){ m.remove(); ideaDialog(); } });
    m.querySelectorAll("[data-i]").forEach(function(b){ b.onclick=async function(){ var x=list[Number(b.dataset.i)]; b.disabled=true;
      await savePost({ title:x.hook.slice(0,90), hook:x.hook, caption:x.hook+"\n\n"+x.body, pillar:x.pillar, product:x.product, link_page:C.products[x.product].sales, status:"idea", platforms:["instagram","tiktok"], format:"reel", captions:{}, cta:"Comment GUT and I’ll send you the link, or tap the link in my bio.".replace("GUT",x.product==="sugar"?"SUGAR":x.product==="glp1"?"GLP1":"GUT") });
      b.textContent="Added ✓"; }; });
  }

  /* ---------- Metricool bulk-upload CSV ---------- */
  var MC_HEAD=["Text","Date","Time","Draft","Facebook","Twitter/X","LinkedIn","GBP","Instagram","Pinterest","TikTok","YouTube","Threads","Bluesky"]
    .concat([1,2,3,4,5,6,7,8,9,10].map(function(i){ return "Picture Url "+i; })).concat([1,2,3,4,5,6,7,8,9,10].map(function(i){ return "Alt text picture "+i; }))
    .concat(["Document title","Shortener","Video Thumbnail Url","Video Cover Frame","Brand name",
      "Twitter/X Can reply","Twitter/X Type","Twitter/X Poll Duration minutes","Twitter/X Poll Option 1","Twitter/X Poll Option 2","Twitter/X Poll Option 3","Twitter/X Poll Option 4",
      "Pinterest Board","Pinterest Pin Title","Pinterest Pin Link","Pinterest Pin New Format",
      "Instagram Post Type","Instagram Show Reel On Feed",
      "YouTube Video Title","YouTube Video Type","YouTube Video Privacy","YouTube video for kids","YouTube Video Category","YouTube Video Tags","YouTube Playlist","YouTube Notify Subscribers",
      "GBP Post Type","Facebook Post Type","Facebook Title","First Comment Text",
      "TikTok Title","TikTok disable comments","TikTok disable duet","TikTok disable stitch"]);
  function mcRows(posts){
    var rows=[MC_HEAD];
    posts.forEach(function(p){ (p.platforms||[]).forEach(function(pl){
      var d=p.publish_at?new Date(p.publish_at):null, r={};
      MC_HEAD.forEach(function(h){ r[h]=""; });
      r["Text"]=fullText(p,pl);
      r["Date"]=d?d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"):"";
      r["Time"]=d?String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+":00":"";
      r["Draft"]=d?"FALSE":"TRUE";
      ["Facebook","Twitter/X","LinkedIn","GBP","Instagram","Pinterest","TikTok","YouTube","Threads","Bluesky"].forEach(function(n){ r[n]="FALSE"; });
      r[{instagram:"Instagram",tiktok:"TikTok",youtube:"YouTube",facebook:"Facebook",threads:"Threads"}[pl]]="TRUE";
      (p.media_urls||[]).slice(0,10).forEach(function(u,i){ r["Picture Url "+(i+1)]=u; r["Alt text picture "+(i+1)]=p.title; });
      var vert=p.format==="reel"||p.format==="story";
      if(pl==="instagram"){ r["Instagram Post Type"]=p.format==="story"?"STORY":vert?"REEL":"POST"; if(vert&&p.format!=="story") r["Instagram Show Reel On Feed"]="TRUE"; }
      if(pl==="youtube"){ r["YouTube Video Title"]=(p.youtube_title||p.title).slice(0,100); r["YouTube Video Type"]=p.format==="youtube"?"VIDEO":"SHORT"; r["YouTube Video Privacy"]="PUBLIC"; r["YouTube video for kids"]="FALSE"; }
      if(pl==="facebook"){ r["Facebook Post Type"]=p.format==="story"?"STORY":vert?"REEL":"POST"; }
      if(pl==="tiktok"){ r["TikTok Title"]=(p.title||"").slice(0,90); r["TikTok disable comments"]="FALSE"; r["TikTok disable duet"]="FALSE"; r["TikTok disable stitch"]="FALSE"; }
      if(p.first_comment&&(pl==="instagram"||pl==="facebook"||pl==="youtube")) r["First Comment Text"]=p.first_comment;
      rows.push(MC_HEAD.map(function(h){ return r[h]; }));
    }); });
    return rows;
  }
  function exportDialog(all){
    var pick=all.filter(function(p){ return (p.status==="ready"||p.status==="scheduled")&&p.publish_at&&new Date(p.publish_at)>Date.now(); });
    var m=document.createElement("div"); m.className="mx-modal";
    m.innerHTML='<div class="box" style="max-width:520px"><h3>Export for Metricool</h3><p>Posts at <b>Ready</b> or <b>Scheduled</b> with a future publish date: <b>'+pick.length+'</b> post'+(pick.length===1?'':'s')+', one row per platform. Metricool recommends up to 50 rows per file.</p>'+
      '<ol class="step-list" style="margin:0 0 16px"><li>Download the file</li><li>Metricool → Planner → <b>Import</b> (bulk upload by CSV), choose date format <b>YYYY-MM-DD</b> and time <b>HH:mm:ss</b></li><li>Check the drafts in Metricool, then come back and mark them Scheduled</li></ol>'+
      '<div class="acts" style="display:grid;gap:10px"><button class="b full" data-dl'+(pick.length?'':' disabled')+'>Download CSV</button><button class="b full ghost" data-mark'+(pick.length?'':' disabled')+'>Mark these as Scheduled</button><button class="b full ghost" data-x>Close</button></div>'+
      '<p class="small" style="margin:12px 0 0">Images and videos must be public links (upload them in each post). If Metricool ever rejects the file, download their template and the columns can be matched to it.</p></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){ if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); });
    m.querySelector("[data-dl]").onclick=function(){ A.download("metricool-"+A.today()+".csv","﻿"+A.csv(mcRows(pick)),"text/csv;charset=utf-8"); };
    m.querySelector("[data-mark]").onclick=async function(){ var ids=pick.map(function(p){ return p.id; }); var r=await sb.from("mth_posts").update({ status:"scheduled", updated_at:new Date().toISOString() }).in("id",ids); if(r.error) return MTH.toast("Couldn’t update"); m.remove(); MTH.toast(ids.length+" marked scheduled"); A.refresh(); };
  }

  /* ================= ONE POST (editor) ================= */
  A.screen("post",{ parent:"studio", render: async function(V,id){
    var r=await sb.from("mth_posts").select("*").eq("id",Number(id)).single();
    if(r.error||!r.data){ V.innerHTML='<p class="muted">Post not found.</p><a class="b sm" href="#studio">Back to the Studio</a>'; return; }
    var p=r.data; p.captions=p.captions||{}; p.platforms=p.platforms||[]; p.media_urls=p.media_urls||[];
    var stats={}; try{ var at=await A.rpc("mth_admin_attribution",{ p_days:365 },true); (at||[]).forEach(function(x){ if(x.utm_content==="post-"+p.id){ ["visits","list_joins","signups","purchases","revenue_cents"].forEach(function(k){ stats[k]=(stats[k]||0)+Number(x[k]||0); }); } }); }catch(e){}
    var local=p.publish_at?new Date(new Date(p.publish_at).getTime()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16):"";
    var tab=p.platforms[0]||"instagram";
    V.innerHTML='<div style="margin-bottom:10px"><a class="small" href="#studio">← Posts</a></div><div class="pp"><div style="display:grid;gap:14px">'+
      '<div class="card panel"><div class="field"><label>Working title</label><input class="inp" id="t" value="'+esc(p.title)+'"></div>'+
        '<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">'+
          '<div class="field"><label>Stage</label><select class="sel" id="st">'+STATUS.map(function(s){ return '<option value="'+s[0]+'"'+(p.status===s[0]?' selected':'')+'>'+s[1]+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label>Format</label><select class="sel" id="fm">'+FORMATS.map(function(f){ return '<option value="'+f[0]+'"'+(p.format===f[0]?' selected':'')+'>'+f[1]+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label>Pillar</label><select class="sel" id="pl"><option value="">—</option>'+PILLARS.map(function(x){ return '<option'+(p.pillar===x?' selected':'')+'>'+esc(x)+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label>Publish</label><input class="inp" id="pa" type="datetime-local" value="'+local+'" style="min-height:42px;font-size:14.5px"></div></div>'+
        '<div class="field"><label>Platforms</label><div class="chips" id="pf">'+PLAT.map(function(x){ return '<button class="chip'+(p.platforms.indexOf(x[0])>-1?' on':'')+'" data-p="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div></div></div>'+
      '<div class="card panel"><h3>Script</h3><div class="field"><label>Hook (first 2 seconds)</label><input class="inp" id="hk" value="'+esc(p.hook||"")+'" placeholder="Most people get this wrong about fasting…"><span class="small" id="hkc"></span></div>'+
        '<div class="field"><label>Script</label><textarea class="inp" id="sc" style="min-height:180px" placeholder="What you’ll say on camera">'+esc(p.script||"")+'</textarea><span class="small" id="scc"></span></div>'+
        '<button class="b sm ghost" id="tele">Open teleprompter</button></div>'+
      '<div class="card panel"><h3>Caption</h3><div class="field"><label>Main caption (all platforms)</label><textarea class="inp" id="cp" style="min-height:140px">'+esc(p.caption||"")+'</textarea></div>'+
        '<div class="chips" id="ct"></div>'+
        '<div class="field"><textarea class="inp" id="cpx" placeholder="Leave empty to use the main caption"></textarea><span class="small" id="cpc"></span></div>'+
        '<div class="field"><label>Call to action</label><input class="inp" id="cta" value="'+esc(p.cta||"")+'" placeholder="Comment GUT and I’ll send you the link"></div>'+
        '<div class="field"><label>Hashtags</label><input class="inp" id="hs" value="'+esc(p.hashtags||"")+'" placeholder="#guthealth #fasting #naturalhealing"><span class="small" id="hsc"></span></div>'+
        '<div class="field"><label>First comment (Instagram, Facebook, YouTube)</label><input class="inp" id="fc" value="'+esc(p.first_comment||"")+'"></div>'+
        '<div class="field"><label>YouTube title</label><input class="inp" id="yt" maxlength="100" value="'+esc(p.youtube_title||"")+'"></div></div>'+
      '</div><div style="display:grid;gap:14px">'+
      '<div class="card panel"><button class="b full" id="save">Save</button><div class="acts"><button class="b sm ghost" id="dup">Duplicate</button><button class="b sm ghost" id="posted">Mark posted</button></div><div id="chk" style="margin-top:12px"></div></div>'+
      '<div class="card panel"><h3>Link &amp; tracking</h3><div class="field"><label>Send people to</label><select class="sel" id="lp">'+LINKPAGES.map(function(x){ return '<option value="'+x[0]+'"'+(p.link_page===x[0]?' selected':'')+'>'+x[1]+'</option>'; }).join("")+'</select></div>'+
        '<div class="field"><label>Protocol this post sells</label><select class="sel" id="pr"><option value="">—</option>'+C.order.map(function(k){ return '<option value="'+k+'"'+(p.product===k?' selected':'')+'>'+C.products[k].name+'</option>'; }).join("")+'</select></div>'+
        '<div id="links"></div><div class="kpis" style="grid-template-columns:repeat(2,1fr);margin-top:10px"><div class="card kpi"><b>'+(stats.visits||0)+'</b><span>Visits</span></div><div class="card kpi"><b>'+(stats.list_joins||0)+'</b><span>List sign-ups</span></div><div class="card kpi"><b>'+(stats.purchases||0)+'</b><span>Sales</span></div><div class="card kpi"><b>'+A.money(stats.revenue_cents||0)+'</b><span>Revenue</span></div></div></div>'+
      '<div class="card panel"><h3>Media</h3><p class="small" style="margin-top:0">Upload the finished video or images (public links, so Metricool can fetch them). Up to 10.</p><div id="md"></div><div class="addrow"><label class="b sm">Upload<input type="file" id="up" accept="video/*,image/*" multiple hidden></label><input class="inp" id="mu" placeholder="…or paste a public link"><button class="b sm ghost" id="ma">Add</button></div></div>'+
      '<div class="card panel"><h3>Post now (by hand)</h3><p class="small" style="margin-top:0">Copies the full caption for one platform, ready to paste.</p><div class="acts" id="cpy"></div></div>'+
      '<div class="card panel"><h3>Notes</h3><textarea class="inp" id="nt">'+esc(p.notes||"")+'</textarea></div>'+
      '</div></div>';
    var $=function(i){ return document.getElementById(i); };
    function collect(){
      var pa=$("pa").value;
      p.title=$("t").value.trim()||"Untitled post"; p.status=$("st").value; p.format=$("fm").value; p.pillar=$("pl").value||null;
      p.publish_at=pa?new Date(pa).toISOString():null; p.hook=$("hk").value; p.script=$("sc").value; p.caption=$("cp").value;
      p.captions[tab]=$("cpx").value; p.cta=$("cta").value; p.hashtags=$("hs").value; p.first_comment=$("fc").value; p.youtube_title=$("yt").value;
      p.link_page=$("lp").value; p.product=$("pr").value||null; p.notes=$("nt").value;
      return p;
    }
    function counts(){
      var hw=($("hk").value.trim().match(/\S+/g)||[]).length; $("hkc").textContent=hw+" words"+(hw>12?" · keep hooks under ~12 words":"");
      var sw=($("sc").value.trim().match(/\S+/g)||[]).length; $("scc").textContent=sw+" words · about "+Math.round(sw/2.5)+" seconds on camera";
      var t=fullText(collect(),tab).length; $("cpc").textContent=t+" / "+LIMIT[tab]+" characters for "+tab+(t>LIMIT[tab]?" · too long":"");
      var hc=($("hs").value.match(/#\w+/g)||[]).length; $("hsc").textContent=hc+" hashtags"+(hc>5?" · 3–5 tends to work best":"");
      check();
    }
    function check(){
      var q=collect(), items=[
        [!!q.hook&&q.hook.trim().length>0,"Hook written"],[!!q.caption||Object.keys(q.captions).some(function(k){ return q.captions[k]; }),"Caption written"],
        [q.platforms.length>0,"Platforms chosen"],[!!q.publish_at,"Publish date set"],[(q.media_urls||[]).length>0,"Media uploaded"],[!!q.cta,"Call to action"],
        [q.platforms.every(function(pl){ return fullText(q,pl).length<=LIMIT[pl]; }),"Captions within limits"],[q.platforms.indexOf("youtube")<0||!!(q.youtube_title||q.title),"YouTube title"]];
      $("chk").innerHTML='<div class="sec-h" style="margin-top:0">Ready check</div>'+items.map(function(i){ return '<div class="row-i" style="padding:5px 0"><span>'+i[1]+'</span><span style="color:'+(i[0]?'var(--sage)':'var(--terra)')+'">'+(i[0]?'✓':'—')+'</span></div>'; }).join("");
    }
    function links(){
      $("links").innerHTML=p.slug?p.platforms.map(function(pl){ var u=trackLink(p,pl); return '<div class="row-i"><span class="small" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+platShort(pl)+' · '+esc(u)+'</span><button class="b sm ghost" data-l="'+esc(u)+'">Copy</button></div>'; }).join("")+'<p class="small">Use these in your bio, Metricool Flows and stories. Visits, sign-ups and sales from them are counted below.</p>':'<p class="small">Save once to create tracking links.</p>';
      $("links").querySelectorAll("[data-l]").forEach(function(b){ b.onclick=function(){ A.copy(b.dataset.l,"Link copied"); }; });
    }
    function media(){
      $("md").innerHTML=p.media_urls.map(function(u,i){ var vid=/\.(mp4|mov|webm)(\?|$)/i.test(u); return '<div class="row-i"><span style="display:flex;gap:10px;align-items:center;min-width:0">'+(vid?'<span class="pill">Video</span>':'<img src="'+esc(u)+'" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:8px">')+'<a class="small" href="'+esc(u)+'" target="_blank" rel="noopener" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(u.split("/").pop())+'</a></span><button class="b sm ghost" data-rm="'+i+'">Remove</button></div>'; }).join("")||'<p class="small">No media yet.</p>';
      $("md").querySelectorAll("[data-rm]").forEach(function(b){ b.onclick=function(){ p.media_urls.splice(Number(b.dataset.rm),1); media(); check(); }; });
    }
    function showTab(){ $("cpx").value=p.captions[tab]||""; document.querySelectorAll("#ct [data-c]").forEach(function(c){ c.classList.toggle("on",c.dataset.c===tab); }); counts(); }
    function platUI(){
      var on=PLAT.filter(function(x){ return p.platforms.indexOf(x[0])>-1; });
      if(on.length&&p.platforms.indexOf(tab)<0){ p.captions[tab]=$("cpx").value; tab=on[0][0]; }
      $("ct").innerHTML=on.map(function(x){ return '<button class="chip'+(x[0]===tab?' on':'')+'" data-c="'+x[0]+'">'+x[1]+' version</button>'; }).join("");
      $("cpy").innerHTML=on.map(function(x){ return '<button class="b sm ghost" data-copy="'+x[0]+'">Copy for '+x[1]+'</button>'; }).join("")||'<span class="small">Choose a platform first.</span>';
      document.querySelectorAll("#ct [data-c]").forEach(function(c){ c.onclick=function(){ p.captions[tab]=$("cpx").value; tab=c.dataset.c; showTab(); }; });
      document.querySelectorAll("[data-copy]").forEach(function(b){ b.onclick=function(){ collect(); A.copy(fullText(p,b.dataset.copy),"Caption copied for "+b.dataset.copy); }; });
      showTab(); links();
    }
    document.querySelectorAll("#pf [data-p]").forEach(function(c){ c.onclick=function(){ var k=c.dataset.p, i=p.platforms.indexOf(k); if(i>-1) p.platforms.splice(i,1); else p.platforms.push(k); c.classList.toggle("on"); platUI(); }; });
    ["t","hk","sc","cp","cpx","cta","hs","fc","yt","pa"].forEach(function(i){ $(i).addEventListener("input",counts); });
    async function save(){ collect(); var b=$("save"); b.disabled=true; b.textContent="Saving…"; try{ var s=await savePost(p); p.slug=s.slug; p.id=s.id; links(); MTH.toast("Saved"); }catch(e){} b.disabled=false; b.textContent="Save"; }
    $("save").onclick=save;
    $("dup").onclick=async function(){ collect(); var c=Object.assign({},p); delete c.id; delete c.slug; c.title=p.title+" (copy)"; c.status="idea"; c.publish_at=null; var s=await savePost(c); A.go("post/"+s.id); };
    $("posted").onclick=async function(){ $("st").value="posted"; await save(); };
    $("tele").onclick=function(){ var w=window.open("","_blank"); if(!w) return; w.document.write('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>Teleprompter</title><body style="margin:0;background:#111;color:#fff;font:600 7vw/1.35 Georgia,serif;padding:40vh 6vw 80vh"><div id="t"></div><script>document.getElementById("t").textContent='+JSON.stringify(($("hk").value+"\n\n"+$("sc").value).trim())+';var s=0;function go(){scrollBy(0,1.2);requestAnimationFrame(go)}setTimeout(go,1500);<\/script>'); w.document.close(); };
    $("ma").onclick=function(){ var u=$("mu").value.trim(); if(!/^https?:\/\//.test(u)) return MTH.toast("Paste a full link starting with https://"); p.media_urls.push(u); $("mu").value=""; media(); check(); };
    $("up").onchange=async function(){
      var files=[].slice.call(this.files||[]); if(!files.length) return;
      for(var i=0;i<files.length;i++){ var f=files[i], ext=(f.name.split(".").pop()||"bin").toLowerCase().replace(/[^a-z0-9]/g,"");
        var path="posts/"+(p.id||"new")+"/"+Date.now()+"-"+i+"."+ext;
        MTH.toast("Uploading "+f.name+"…",8000);
        var up=await sb.storage.from("social-media").upload(path,f,{ upsert:true, contentType:f.type||undefined });
        if(up.error){ MTH.toast("Upload failed: "+up.error.message); continue; }
        p.media_urls.push(sb.storage.from("social-media").getPublicUrl(path).data.publicUrl);
      }
      media(); check(); save();
    };
    media(); platUI();
  }});
})();
