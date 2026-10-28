/* =================================================================
   ADMIN — Courses: section videos (any number, drag to reorder), ebooks, giving access
   Videos live in mth_videos: one row per video, grouped by course section, ordered by position.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;

  /* ---------- Cloudflare Stream: upload from the PC, members-only playback ---------- */
  var _ready=null;
  function streamReady(){ if(!_ready) _ready=MTH.fn("mth-video",{ action:"status" }).then(function(j){ return !!j.ready; },function(){ return false; }); return _ready; }
  function loadTus(){ return window.tus?Promise.resolve():new Promise(function(res,rej){ var s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js"; s.onload=res; s.onerror=function(){ rej(new Error("couldn’t load the uploader")); }; document.head.appendChild(s); }); }
  function streamId(u){ return ((u||"").match(/^stream:([a-f0-9]{32})$/i)||[])[1]||""; }
  function kindOf(u){ u=u||""; if(streamId(u)) return "Uploaded video"; if(/youtu/i.test(u)) return "YouTube"; if(/vimeo/i.test(u)) return "Vimeo"; if(/wistia/i.test(u)) return "Wistia"; return u?"Link":""; }
  function cleanTitle(name){ return String(name||"").replace(/\.[a-z0-9]{2,5}$/i,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim().replace(/^./,function(c){ return c.toUpperCase(); })||"New video"; }

  /* uploads keep running while you move around the admin; each video's status line finds itself by id */
  var JOB={};           // video id -> latest status html
  var QUEUE=[], busy=false;
  function say(id,html){ JOB[id]=html; var el=document.querySelector('.vrow[data-id="'+id+'"] .vmeta'); if(el) el.innerHTML=html; }
  function running(){ return busy||QUEUE.length>0; }
  window.addEventListener("beforeunload",function(e){ if(running()){ e.preventDefault(); e.returnValue=""; } });

  var watching={};
  async function watchStream(id,uid){
    if(watching[id]===uid) return; watching[id]=uid;
    for(var i=0;i<720;i++){
      if(watching[id]!==uid) return;
      var j=await MTH.fn("mth-video",{ action:"state", uid:uid });
      if(j.error){ delete JOB[id]; say(id,"Uploaded video"); delete watching[id]; return; }
      if(j.ready){ say(id,'<b class="ok">✓ Ready</b>'+(j.minutes?' · '+j.minutes+' min':'')+' · members only'); delete watching[id]; return; }
      if(j.state==="error"){ say(id,"Cloudflare couldn’t process this video ("+esc(j.error||"unknown")+"). Press <b>Replace</b> to upload it again."); delete watching[id]; return; }
      say(id,"Uploaded ✓ · Cloudflare is preparing it"+(j.pct?" ("+Math.round(j.pct)+"%)":"")+"… you can leave this page.");
      await new Promise(function(r){ setTimeout(r,5000); });
    }
  }

  function enqueue(job){ QUEUE.push(job); say(job.id,"Waiting to upload ("+esc(job.file.name)+")…"); pump(); }
  async function pump(){
    if(busy) return; var job=QUEUE.shift(); if(!job) return; busy=true;
    try{ await uploadOne(job); }catch(e){ say(job.id,"Upload stopped: "+esc(String(e&&e.message||e).slice(0,160))+". Press <b>Replace</b> to try again."); }
    busy=false; pump();
  }
  async function uploadOne(job){
    var file=job.file, id=job.id;
    say(id,"Getting an upload link…");
    var up=await MTH.fn("mth-video",{ action:"upload", size:file.size, name:file.name, product:job.product, lesson_id:job.section });
    if(up.error||!up.url) throw new Error("Couldn’t start the upload: "+(up.error||"no link"));
    await loadTus();
    var t0=Date.now();
    await new Promise(function(res,rej){
      var u=new window.tus.Upload(file,{ uploadUrl:up.url, chunkSize:50*1024*1024, retryDelays:[0,3000,10000,30000],
        onProgress:function(a,b){ var p=a/b, s=(Date.now()-t0)/1000, left=p>0.02?Math.round(s/p-s):null;
          say(id,'<span class="vbar"><i style="width:'+Math.round(p*100)+'%"></i></span>Uploading '+Math.round(p*100)+'%'+(left!=null?' · about '+(left>90?Math.round(left/60)+' min':left+' s')+' left':'')+' · keep this tab open'); },
        onError:function(e){ rej(e); },
        onSuccess:res });
      u.start();
    });
    var old=job.old;
    var r=await sb.from("mth_videos").update({ video_url:"stream:"+up.uid, updated_at:new Date().toISOString() }).eq("id",id);
    if(r.error) throw new Error("Uploaded, but couldn’t save: "+r.error.message);
    var v=(STATE.videos||[]).filter(function(x){ return x.id===id; })[0]; if(v) v.video_url="stream:"+up.uid;
    if(streamId(old)) MTH.fn("mth-video",{ action:"delete", uid:streamId(old) });   // the replaced file
    watchStream(id,up.uid);
  }

  var STATE={ product:null, videos:[] };

  A.screen("content",{ nav:"Videos & ebooks", group:"Courses", help:"Each section can hold as many videos as you like. Press <b>Add videos</b> (you can pick several at once) or drag files from your PC onto a section. Drag the ⠿ handle to put them in order or move them to another section.", render: async function(V){
    var pk=sessionStorage.getItem("mth_admin_p")||"gut", course=window.MTH_COURSES[pk];
    STATE.product=pk;
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Videos &amp; <em>ebooks</em></h1></div><div class="acts"><select class="sel" id="pp">'+C.order.map(function(k){ return '<option value="'+k+'"'+(k===pk?' selected':'')+'>'+C.products[k].name+'</option>'; }).join("")+'</select><a class="b sm ghost" href="'+C.products[pk].course+'" target="_blank" rel="noopener">Preview course</a></div></div>'+
      '<div id="streamNote" class="small" style="margin:-6px 0 10px"></div><div id="ls">Loading…</div>';
    document.getElementById("pp").onchange=function(){ sessionStorage.setItem("mth_admin_p",this.value); A.refresh(); };

    var rv=await sb.from("mth_videos").select("id,section_id,position,title,video_url").eq("product",pk).order("position");
    if(rv.error) throw rv.error;
    STATE.videos=rv.data||[];
    var rm=await sb.from("mth_lesson_media").select("lesson_id,video_url,ebook_url").eq("product",pk);
    var M={}; (rm.data||[]).forEach(function(x){ M[x.lesson_id]=x; });
    var secIds=course.sections.map(function(s){ return s.id; });
    STATE.videos.forEach(function(v){ if(secIds.indexOf(v.section_id)<0) v.section_id=secIds[0]; });

    function vids(sec){ return STATE.videos.filter(function(v){ return v.section_id===sec; }).sort(function(a,b){ return a.position-b.position; }); }
    function secLabel(s){ return (s.step?'Step '+s.step+' · ':'')+s.title; }
    var moveOpts=course.sections.map(function(s){ return '<option value="'+s.id+'">'+esc(secLabel(s))+'</option>'; }).join("");

    function rowHtml(v,i){
      var sid=streamId(v.video_url), st=JOB[v.id]||(v.video_url?esc(kindOf(v.video_url)):'<span style="color:var(--terra)">No video yet</span> · press <b>Upload</b>');
      return '<li class="vrow" data-id="'+v.id+'"><span class="grip" title="Drag to move" aria-hidden="true">⠿</span><span class="num">'+(i+1)+'</span>'+
        '<div class="vmain"><input class="inp vt" value="'+esc(v.title)+'" aria-label="Video title" placeholder="Video title"><div class="small vmeta">'+st+'</div></div>'+
        '<div class="vacts"><button class="ic" data-up title="Move up" aria-label="Move up">↑</button><button class="ic" data-dn title="Move down" aria-label="Move down">↓</button>'+
        '<select class="sel vmv" data-mv aria-label="Move to another section"><option value="">Move to…</option>'+moveOpts+'</select>'+
        (v.video_url?'<a class="ic" href="'+C.products[pk].course+(C.products[pk].course.indexOf("?")<0?"?":"&")+'l=v_'+v.id+'" target="_blank" rel="noopener" title="Watch it like a member" aria-label="Preview">▶</a>':'')+
        '<label class="ic wide" title="Upload a file for this video">'+(v.video_url?'Replace':'Upload')+'<input type="file" accept="video/*,.mp4,.mov,.mkv,.webm" hidden data-rf></label>'+
        '<button class="ic del" data-del title="Delete this video" aria-label="Delete">✕</button></div></li>';
    }
    function secHtml(s){
      var list=vids(s.id), les=s.lessons.filter(function(l){ return !l.app; });
      var ebs=les.filter(function(l){ return (M[l.id]||{}).ebook_url; }).length;
      return '<section class="card vsec" data-sec="'+s.id+'"><div class="vsec-h"><div><div class="sec-h" style="margin:0">'+esc(secLabel(s))+'</div><b class="vcount">'+list.length+' video'+(list.length===1?'':'s')+'</b></div>'+
        '<div class="vsec-a"><label class="b sm">+ Add videos<input type="file" multiple accept="video/*,.mp4,.mov,.mkv,.webm" hidden data-add></label><button class="b sm ghost" data-link>+ Paste a link</button></div></div>'+
        '<ol class="vlist" data-sec="'+s.id+'">'+list.map(rowHtml).join("")+'</ol>'+
        '<div class="vdrop">Drop video files here, or press <b>Add videos</b>. Pick several at once and they upload one after another.</div>'+
        (les.length?'<details class="ebk"><summary>Ebooks for this section · '+ebs+'/'+les.length+' added</summary>'+les.map(function(l){ var m=M[l.id]||{};
          return '<div class="ls" data-l="'+l.id+'"><b>'+esc(l.title)+'</b>'+(m.video_url?'<div class="small">Also has an older lesson video ('+esc(kindOf(m.video_url))+'), which still plays on that lesson.</div>':'')+
            '<div class="fl" style="margin-top:8px"><input class="inp" data-e value="'+esc(m.ebook_url||"")+'" placeholder="Upload a file or paste a link"><label class="b sm ghost" style="flex:none">Upload<input type="file" accept=".html,.htm,.pdf" hidden data-f></label><button class="b sm" data-s style="flex:none">Save</button></div><div class="st" style="margin-top:6px">'+(m.ebook_url?'✓ ebook':'no ebook yet')+'</div></div>'; }).join("")+'</details>':'')+
        '</section>';
    }
    function draw(){
      var total=STATE.videos.length, live=STATE.videos.filter(function(v){ return v.video_url; }).length, secs=course.sections.filter(function(s){ return vids(s.id).length; }).length;
      document.getElementById("ls").innerHTML='<div class="kpis" style="margin-bottom:14px"><div class="card kpi"><b>'+live+'</b><span>Videos in this course</span></div><div class="card kpi"><b>'+secs+'/'+course.sections.length+'</b><span>Sections with videos</span></div>'+(total>live?'<div class="card kpi warn"><b>'+(total-live)+'</b><span>Waiting for a file</span></div>':'')+'</div>'+
        course.sections.map(secHtml).join("");
      wire();
    }

    /* ---------- saving ---------- */
    async function saveOrder(){
      var changed=[];
      document.querySelectorAll(".vlist").forEach(function(ol){
        var sec=ol.dataset.sec;
        ol.querySelectorAll(".vrow").forEach(function(li,i){
          var v=STATE.videos.filter(function(x){ return x.id===li.dataset.id; })[0]; if(!v) return;
          li.querySelector(".num").textContent=i+1;
          if(v.section_id!==sec||v.position!==i){ v.section_id=sec; v.position=i; changed.push(v); }
        });
      });
      counts();
      if(!changed.length) return;
      var res=await Promise.all(changed.map(function(v){ return sb.from("mth_videos").update({ section_id:v.section_id, position:v.position, updated_at:new Date().toISOString() }).eq("id",v.id); }));
      var bad=res.filter(function(r){ return r.error; })[0];
      MTH.toast(bad?"Couldn’t save the new order: "+bad.error.message:"Order saved ✓");
    }
    function counts(){
      document.querySelectorAll(".vsec").forEach(function(s){ var n=s.querySelectorAll(".vrow").length; s.querySelector(".vcount").textContent=n+" video"+(n===1?"":"s"); s.classList.toggle("empty",!n); });
    }
    async function addRows(sec,items){   // items: [{title, video_url?, file?}]
      var start=vids(sec).length;
      var ins=items.map(function(it,i){ return { product:pk, section_id:sec, position:start+i, title:it.title, video_url:it.video_url||null }; });
      var r=await sb.from("mth_videos").insert(ins).select("id,section_id,position,title,video_url");
      if(r.error){ MTH.toast("Couldn’t add: "+r.error.message); return; }
      r.data.forEach(function(v,i){ STATE.videos.push(v); });
      draw();
      r.data.forEach(function(v,i){ if(items[i].file) enqueue({ id:v.id, file:items[i].file, product:pk, section:sec }); });
    }
    function addFiles(sec,files){
      files=[].slice.call(files||[]).filter(function(f){ return /^video\//.test(f.type)||/\.(mp4|mov|mkv|webm|m4v|avi)$/i.test(f.name); });
      if(!files.length) return MTH.toast("Those don’t look like video files");
      streamReady().then(function(ok){
        if(!ok) return MTH.toast("Cloudflare Stream isn’t connected yet (see the note at the top).",5000);
        files.sort(function(a,b){ return a.name.localeCompare(b.name,undefined,{ numeric:true }); });
        addRows(sec,files.map(function(f){ return { title:cleanTitle(f.name), file:f }; }));
      });
    }

    /* ---------- wiring ---------- */
    var dragEl=null;
    function wire(){
      counts();
      STATE.videos.forEach(function(v){ var u=streamId(v.video_url); if(u&&!QUEUE.some(function(q){ return q.id===v.id; })) watchStream(v.id,u); });

      document.querySelectorAll(".vsec").forEach(function(secEl){
        var sec=secEl.dataset.sec;
        secEl.querySelector("[data-add]").onchange=function(){ addFiles(sec,this.files); this.value=""; };
        secEl.querySelector("[data-link]").onclick=function(){
          var u=(prompt("Paste a YouTube, Vimeo or Wistia link:")||"").trim(); if(!u) return;
          if(!/^https?:\/\//i.test(u)&&!/^wistia:/i.test(u)) return MTH.toast("That doesn’t look like a link");
          var t=(prompt("Title for this video:","")||"").trim()||"New video";
          addRows(sec,[{ title:t, video_url:u }]);
        };
        /* drag files from the PC onto a section */
        secEl.addEventListener("dragover",function(e){ if(dragEl) return; if([].indexOf.call(e.dataTransfer.types||[],"Files")<0) return; e.preventDefault(); secEl.classList.add("over"); });
        secEl.addEventListener("dragleave",function(e){ if(!secEl.contains(e.relatedTarget)) secEl.classList.remove("over"); });
        secEl.addEventListener("drop",function(e){ secEl.classList.remove("over"); if(dragEl) return; if(!e.dataTransfer.files.length) return; e.preventDefault(); addFiles(sec,e.dataTransfer.files); });
      });

      /* reorder: drag the ⠿ handle within or between sections */
      document.querySelectorAll(".vrow").forEach(function(li){
        var g=li.querySelector(".grip");
        g.onmousedown=g.ontouchstart=function(){ li.draggable=true; };
        li.ondragstart=function(e){ dragEl=li; li.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; try{ e.dataTransfer.setData("text/plain",li.dataset.id); }catch(x){} document.body.classList.add("vdragging"); };
        li.ondragend=function(){ li.classList.remove("dragging"); li.draggable=false; dragEl=null; document.body.classList.remove("vdragging"); document.querySelectorAll(".vsec.over").forEach(function(s){ s.classList.remove("over"); }); saveOrder(); };
      });
      document.querySelectorAll(".vsec").forEach(function(secEl){
        var ol=secEl.querySelector(".vlist");
        secEl.addEventListener("dragover",function(e){
          if(!dragEl) return; e.preventDefault(); e.dataTransfer.dropEffect="move";
          var after=[].slice.call(ol.querySelectorAll(".vrow:not(.dragging)")).filter(function(r){ var b=r.getBoundingClientRect(); return e.clientY<b.top+b.height/2; })[0];
          if(after) ol.insertBefore(dragEl,after); else ol.appendChild(dragEl);
          document.querySelectorAll(".vsec.over").forEach(function(s){ if(s!==secEl) s.classList.remove("over"); }); secEl.classList.add("over");
        });
        secEl.addEventListener("drop",function(e){ if(dragEl) e.preventDefault(); });
      });

      document.querySelectorAll(".vrow").forEach(function(li){
        var id=li.dataset.id, v=function(){ return STATE.videos.filter(function(x){ return x.id===id; })[0]; };
        li.querySelector(".vt").onchange=async function(){
          var t=this.value.trim()||"Untitled video"; this.value=t; v().title=t;
          var r=await sb.from("mth_videos").update({ title:t, updated_at:new Date().toISOString() }).eq("id",id);
          MTH.toast(r.error?"Couldn’t save the title: "+r.error.message:"Title saved ✓");
        };
        li.querySelector("[data-up]").onclick=function(){ var p=li.previousElementSibling; if(p){ li.parentNode.insertBefore(li,p); saveOrder(); } else moveSection(li,-1); };
        li.querySelector("[data-dn]").onclick=function(){ var n=li.nextElementSibling; if(n){ li.parentNode.insertBefore(n,li); saveOrder(); } else moveSection(li,1); };
        li.querySelector("[data-mv]").onchange=function(){
          var to=this.value; this.value=""; if(!to) return;
          var ol=document.querySelector('.vlist[data-sec="'+to+'"]'); ol.appendChild(li); saveOrder();
          li.scrollIntoView({ behavior:"smooth", block:"center" }); li.classList.add("flash"); setTimeout(function(){ li.classList.remove("flash"); },1400);
        };
        li.querySelector("[data-rf]").onchange=function(){
          var f=this.files[0]; this.value=""; if(!f) return;
          streamReady().then(function(ok){ if(!ok) return MTH.toast("Cloudflare Stream isn’t connected yet (see the note at the top).",5000);
            delete watching[id]; enqueue({ id:id, file:f, product:pk, section:v().section_id, old:v().video_url }); });
        };
        li.querySelector("[data-del]").onclick=async function(){
          var x=v(); if(QUEUE.some(function(q){ return q.id===id; })) return MTH.toast("Wait for this upload to finish first");
          if(!confirm('Delete "'+x.title+'"? Members won’t see it any more.'+(streamId(x.video_url)?' The uploaded file is removed from Cloudflare too.':''))) return;
          var r=await sb.from("mth_videos").delete().eq("id",id);
          if(r.error) return MTH.toast("Couldn’t delete: "+r.error.message);
          STATE.videos=STATE.videos.filter(function(y){ return y.id!==id; }); delete watching[id]; delete JOB[id];
          if(streamId(x.video_url)) MTH.fn("mth-video",{ action:"delete", uid:streamId(x.video_url) });
          li.remove(); saveOrder(); MTH.toast("Deleted");
        };
      });
      function moveSection(li,dir){
        var lists=[].slice.call(document.querySelectorAll(".vlist")), i=lists.indexOf(li.parentNode), to=lists[i+dir]; if(!to) return;
        if(dir<0) to.appendChild(li); else to.insertBefore(li,to.firstChild);
        saveOrder(); li.scrollIntoView({ behavior:"smooth", block:"center" });
      }

      /* ebooks (one per lesson, unchanged) */
      document.querySelectorAll(".ebk .ls").forEach(function(card){
        var id=card.dataset.l, st=card.querySelector(".st");
        async function save(){
          var row={ product:pk, lesson_id:id, ebook_url:card.querySelector("[data-e]").value.trim()||null, updated_at:new Date().toISOString() };
          var r=await sb.from("mth_lesson_media").upsert(row,{ onConflict:"product,lesson_id" });
          if(r.error){ st.textContent="Couldn’t save: "+r.error.message; st.classList.remove("ok"); return false; }
          M[id]=Object.assign(M[id]||{},row); st.textContent="Saved ✓"; st.classList.add("ok"); return true;
        }
        card.querySelector("[data-s]").onclick=save;
        card.querySelector("[data-f]").onchange=async function(){
          var file=this.files[0]; if(!file) return;
          var ext=(file.name.split(".").pop()||"html").toLowerCase(); if(["html","htm","pdf"].indexOf(ext)<0) return MTH.toast("Please upload an .html or .pdf file");
          var path=pk+"/"+id+"."+ext;
          st.textContent="Uploading "+file.name+"…"; st.classList.remove("ok");
          var r=await sb.storage.from("course-files").upload(path,file,{ upsert:true, contentType:ext==="pdf"?"application/pdf":"text/html" });
          if(r.error){ st.textContent="Upload failed: "+r.error.message; return; }
          card.querySelector("[data-e]").value=path; await save(); st.textContent="Uploaded and saved ✓";
        };
      });
    }

    draw();
    streamReady().then(function(ok){ var n=document.getElementById("streamNote"); if(!n) return; n.innerHTML=ok?'<b class="ok">✓ Cloudflare Stream is connected.</b> Uploaded videos are members-only. YouTube, Vimeo and Wistia links work too.':'<b>Cloudflare Stream isn’t connected yet.</b> Add CF_ACCOUNT_ID and CF_STREAM_TOKEN in your <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a>. YouTube links still work.'; });
  }});

  A.screen("access",{ nav:"Give access", group:"Courses", help:"Let someone into a course for free, for example a friend, or yourself to preview.", render: async function(V){
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Give <em>access</em></h1></div></div><div class="card panel" style="max-width:560px"><p class="small" style="margin-top:0">For a comp, a friend, a refund swap or a test. They need to have signed in once first.</p>'+
      '<div class="field"><label for="ge">Their email</label><input class="inp" id="ge" type="email" placeholder="name@example.com"></div>'+
      '<div class="field"><label for="gp">Protocol</label><select id="gp" class="inp">'+C.order.map(function(k){ return '<option value="'+k+'">'+C.products[k].name+'</option>'; }).join("")+'</select></div>'+
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="b" id="give">Give access</button><button class="b ghost" id="me">Give it to me</button></div><p id="gm" class="small" style="margin-top:12px"></p></div>';
    async function give(email){
      var k=document.getElementById("gp").value, m=document.getElementById("gm");
      var r=await A.rpc("mth_admin_set_access",{ p_email:email, p_product:k, p_active:true });
      if(r==="no_account"){ m.textContent=email+" hasn’t signed in yet. Ask them to sign in once, then try again."; return; }
      m.innerHTML="<b class='ok'>Done.</b> "+esc(email)+" now has the "+esc(C.products[k].name)+"."; await MTH.refresh();
    }
    document.getElementById("give").onclick=function(){ var e=document.getElementById("ge").value.trim(); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return MTH.toast("Enter an email"); give(e); };
    document.getElementById("me").onclick=function(){ give(MTH.user.email); };
  }});
})();
