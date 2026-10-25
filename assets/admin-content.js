/* =================================================================
   ADMIN — Courses: lesson videos + ebooks, and giving access
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;
  /* ---------- Cloudflare Stream: upload from the PC, members-only playback ---------- */
  var _ready=null;
  function streamReady(){ if(!_ready) _ready=MTH.fn("mth-video",{ action:"status" }).then(function(j){ return !!j.ready; },function(){ return false; }); return _ready; }
  function loadTus(){ return window.tus?Promise.resolve():new Promise(function(res,rej){ var s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js"; s.onload=res; s.onerror=function(){ rej(new Error("couldn’t load the uploader")); }; document.head.appendChild(s); }); }
  // after an upload Cloudflare prepares the video for every screen size; show how far it is
  async function watchStream(uid,el){
    for(var i=0;i<720;i++){
      var j=await MTH.fn("mth-video",{ action:"state", uid:uid });
      if(!el.isConnected) return;
      if(j.error){ el.textContent=""; return; }
      if(j.ready){ el.innerHTML='<b class="ok">✓ Ready on Cloudflare Stream</b>'+(j.minutes?' · '+j.minutes+' min':'')+' · members only'; return; }
      if(j.state==="error"){ el.textContent="Cloudflare couldn’t process this video: "+(j.error||"unknown")+". Try uploading it again."; return; }
      el.textContent="Uploaded ✓ · Cloudflare is preparing it"+(j.pct?" ("+Math.round(j.pct)+"%)":"")+"… you can leave this page.";
      await new Promise(function(r){ setTimeout(r,5000); });
    }
  }

  A.screen("content",{ nav:"Videos & ebooks", group:"Courses", help:"Add your lesson videos and ebooks here. Press Upload video to send a file from your PC to Cloudflare Stream (members-only), or paste a YouTube link.", render: async function(V){
    var pk=sessionStorage.getItem("mth_admin_p")||"gut";
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Videos &amp; <em>ebooks</em></h1></div><div class="acts"><select class="sel" id="pp">'+C.order.map(function(k){ return '<option value="'+k+'"'+(k===pk?' selected':'')+'>'+C.products[k].name+'</option>'; }).join("")+'</select><a class="b sm ghost" href="'+C.products[pk].course+'" target="_blank" rel="noopener">Preview course</a></div></div>'+
      '<div id="streamNote" class="small" style="margin:-6px 0 10px"></div><p class="small" style="margin:-6px 0 14px">Video: press <b>Upload video</b> to pick the file from your Finished Videos folder (it goes to Cloudflare Stream and only buyers can play it), or paste a YouTube, Vimeo or Wistia link. Ebook: upload the file (HTML or PDF) or paste a link. Members only see these after buying. To preview, give yourself access under "Give access".</p><div id="ls">Loading…</div>';
    document.getElementById("pp").onchange=function(){ sessionStorage.setItem("mth_admin_p",this.value); A.refresh(); };
    var r=await sb.from("mth_lesson_media").select("lesson_id,video_url,ebook_url,updated_at").eq("product",pk);
    var M={}; (r.data||[]).forEach(function(x){ M[x.lesson_id]=x; });
    var course=window.MTH_COURSES[pk], all=0, vids=0, ebs=0;
    course.sections.forEach(function(s){ s.lessons.forEach(function(l){ all++; if((M[l.id]||{}).video_url) vids++; if((M[l.id]||{}).ebook_url) ebs++; }); });
    document.getElementById("ls").innerHTML='<div class="kpis" style="margin-bottom:14px"><div class="card kpi"><b>'+vids+'/'+all+'</b><span>Videos added</span></div><div class="card kpi"><b>'+ebs+'/'+(all-1)+'</b><span>Ebooks added</span></div></div>'+
      course.sections.map(function(s){ return '<div class="sec-h">'+(s.step?'Step '+s.step+' · ':'')+esc(s.title)+'</div>'+s.lessons.map(function(l){ var m=M[l.id]||{};
      return '<div class="card ls" data-l="'+l.id+'"><h4>'+esc(l.title)+'</h4><div class="row">'+
        '<div><label class="small">Video</label><div class="fl"><input class="inp" data-v value="'+esc(m.video_url||"")+'" placeholder="Upload a file, or paste a YouTube link"><label class="b sm" style="flex:none">Upload video<input type="file" accept="video/*,.mp4,.mov,.mkv,.webm" hidden data-vf></label></div><div class="small vp" style="margin-top:6px"></div></div>'+
        (l.app?'<div></div>':'<div><label class="small">Ebook</label><div class="fl"><input class="inp" data-e value="'+esc(m.ebook_url||"")+'" placeholder="Upload a file or paste a link"><label class="b sm ghost" style="flex:none">Upload<input type="file" accept=".html,.htm,.pdf" hidden data-f></label></div></div>')+
        '</div><div class="fl" style="margin-top:12px"><button class="b sm" data-s>Save</button><span class="st">'+(m.video_url?'✓ video ':'no video yet ')+(l.app?'':(m.ebook_url?'· ✓ ebook':'· no ebook yet'))+'</span></div></div>'; }).join(""); }).join("");
    streamReady().then(function(ok){ document.getElementById("streamNote").innerHTML=ok?'<b class="ok">✓ Cloudflare Stream is connected.</b> Uploaded videos are members-only.':'<b>Cloudflare Stream isn’t connected yet.</b> Add CF_ACCOUNT_ID and CF_STREAM_TOKEN in your <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a>. YouTube links still work.'; });
    document.querySelectorAll(".ls").forEach(function(card){
      var id=card.dataset.l, st=card.querySelector(".st");
      async function save(){
        var row={ product:pk, lesson_id:id, video_url:card.querySelector("[data-v]").value.trim()||null, updated_at:new Date().toISOString() };
        var e=card.querySelector("[data-e]"); if(e) row.ebook_url=e.value.trim()||null;
        var r=await sb.from("mth_lesson_media").upsert(row,{ onConflict:"product,lesson_id" });
        if(r.error){ st.textContent="Couldn’t save: "+r.error.message; st.classList.remove("ok"); return false; }
        st.textContent="Saved ✓"; st.classList.add("ok"); return true;
      }
      card.querySelector("[data-s]").onclick=save;
      var vf=card.querySelector("[data-vf]"), vp=card.querySelector(".vp");
      var cur=(card.querySelector("[data-v]").value||"").match(/^stream:([a-f0-9]{32})$/i);
      if(cur) watchStream(cur[1],vp);
      vf.onchange=async function(){
        var file=vf.files[0]; if(!file) return;
        vf.value="";
        if(!(await streamReady())) { vp.textContent="Cloudflare Stream isn’t connected yet (see the note at the top)."; return; }
        vp.textContent="Getting an upload link…";
        var up=await MTH.fn("mth-video",{ action:"upload", size:file.size, name:file.name, product:pk, lesson_id:id });
        if(up.error||!up.url){ vp.textContent="Couldn’t start the upload: "+(up.error||"no link"); return; }
        await loadTus();
        var t0=Date.now();
        await new Promise(function(res){
          var u=new window.tus.Upload(file,{ uploadUrl:up.url, chunkSize:50*1024*1024, retryDelays:[0,3000,10000,30000],
            onProgress:function(a,b){ var p=a/b, s=(Date.now()-t0)/1000, left=p>0.02?Math.round(s/p-s):null;
              vp.innerHTML='<div class="pbar" style="max-width:360px"><i style="width:'+Math.round(p*100)+'%"></i></div>Uploading '+esc(file.name)+': '+Math.round(p*100)+'%'+(left!=null?' · about '+(left>90?Math.round(left/60)+' min':left+' s')+' left':'')+' · keep this tab open'; },
            onError:function(e){ vp.textContent="Upload stopped: "+String(e&&e.message||e).slice(0,160)+". Press Upload video to try again."; res(); },
            onSuccess:async function(){ card.querySelector("[data-v]").value="stream:"+up.uid; if(await save()) watchStream(up.uid,vp); res(); } });
          u.start();
        });
      };
      var f=card.querySelector("[data-f]");
      if(f) f.onchange=async function(){
        var file=f.files[0]; if(!file) return;
        var ext=(file.name.split(".").pop()||"html").toLowerCase(); if(["html","htm","pdf"].indexOf(ext)<0) return MTH.toast("Please upload an .html or .pdf file");
        var path=pk+"/"+id+"."+ext;
        st.textContent="Uploading "+file.name+"…"; st.classList.remove("ok");
        var r=await sb.storage.from("course-files").upload(path,file,{ upsert:true, contentType:ext==="pdf"?"application/pdf":"text/html" });
        if(r.error){ st.textContent="Upload failed: "+r.error.message; return; }
        card.querySelector("[data-e]").value=path; await save(); st.textContent="Uploaded and saved ✓";
      };
    });
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
