/* =================================================================
   ADMIN — Course builder
   * the course: title, subtitle, thumbnail            (mth_course_meta)
   * modules: title, subtitle, thumbnail, order, add, hide, delete   (mth_course_sections)
   * items in each module, in any order: videos, ebooks, lessons     (mth_videos, kind = video | ebook | lesson)
   Plus "Give access".
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;
  function now(){ return new Date().toISOString(); }

  /* ---------- Cloudflare Stream: upload from the PC, members-only playback ---------- */
  var _ready=null;
  function streamReady(){ if(!_ready) _ready=MTH.fn("mth-video",{ action:"status" }).then(function(j){ return !!j.ready; },function(){ return false; }); return _ready; }
  function loadTus(){ return window.tus?Promise.resolve():new Promise(function(res,rej){ var s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/tus-js-client@4.3.1/dist/tus.min.js"; s.onload=res; s.onerror=function(){ rej(new Error("couldn’t load the uploader")); }; document.head.appendChild(s); }); }
  function streamId(u){ return ((u||"").match(/^stream:([a-f0-9]{32})$/i)||[])[1]||""; }
  function kindOf(u){ u=u||""; if(streamId(u)) return "Uploaded video"; if(/youtu/i.test(u)) return "YouTube"; if(/vimeo/i.test(u)) return "Vimeo"; if(/wistia/i.test(u)) return "Wistia"; return u?"Link":""; }
  function cleanTitle(name,fallback){ return String(name||"").replace(/\.[a-z0-9]{2,5}$/i,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim().replace(/^./,function(c){ return c.toUpperCase(); })||fallback||"New video"; }
  function isVideoFile(f){ return /^video\//.test(f.type)||/\.(mp4|mov|mkv|webm|m4v|avi)$/i.test(f.name); }
  function isEbookFile(f){ return /\.(pdf|html?)$/i.test(f.name); }

  /* uploads keep running while you move around the admin; each item's status line finds itself by id */
  var JOB={};           // item id -> latest status html
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
      if(j.error){ delete JOB[id]; say(id,"▶ Uploaded video"); delete watching[id]; return; }
      if(j.ready){ say(id,'▶ <b class="ok">✓ Ready</b>'+(j.minutes?' · '+j.minutes+' min':'')+' · members only'); delete watching[id]; return; }
      if(j.state==="error"){ say(id,"Cloudflare couldn’t process this video ("+esc(j.error||"unknown")+"). Press <b>Replace</b> to upload it again."); delete watching[id]; return; }
      say(id,"Uploaded ✓ · Cloudflare is preparing it"+(j.pct?" ("+Math.round(j.pct)+"%)":"")+"… you can leave this page.");
      await new Promise(function(r){ setTimeout(r,5000); });
    }
  }

  function enqueue(job){ QUEUE.push(job); say(job.id,"Waiting to upload ("+esc(job.file.name)+")…"); pump(); }
  async function pump(){
    if(busy) return; var job=QUEUE.shift(); if(!job) return; busy=true;
    try{ await (job.kind==="ebook"?uploadEbook(job):uploadVideo(job)); }catch(e){ say(job.id,"Upload stopped: "+esc(String(e&&e.message||e).slice(0,160))+". Press <b>Replace</b> to try again."); }
    busy=false; pump();
  }
  function setUrl(id,url){ var it=findItem(id); if(it) it.url=url; }
  async function uploadVideo(job){
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
    var r=await sb.from("mth_videos").update({ video_url:"stream:"+up.uid, updated_at:now() }).eq("id",id);
    if(r.error) throw new Error("Uploaded, but couldn’t save: "+r.error.message);
    setUrl(id,"stream:"+up.uid);
    if(streamId(job.old)) MTH.fn("mth-video",{ action:"delete", uid:streamId(job.old) });   // the replaced file
    watchStream(id,up.uid);
  }
  async function uploadEbook(job){
    var file=job.file, id=job.id, ext=(file.name.split(".").pop()||"pdf").toLowerCase(); if(ext==="htm") ext="html";
    var path=job.product+"/eb_"+id+"."+ext;
    say(id,"Uploading "+esc(file.name)+"…");
    var r=await sb.storage.from("course-files").upload(path,file,{ upsert:true, contentType:ext==="pdf"?"application/pdf":"text/html" });
    if(r.error) throw new Error(r.error.message);
    var u=await sb.from("mth_videos").update({ video_url:path, updated_at:now() }).eq("id",id);
    if(u.error) throw new Error("Uploaded, but couldn’t save: "+u.error.message);
    setUrl(id,path);
    if(job.old&&job.old!==path&&!/^https?:/i.test(job.old)) sb.storage.from("course-files").remove([job.old]);
    say(id,'📖 <b class="ok">✓ Ebook ready</b> · '+esc(file.name)); delete JOB[id];
    var el=document.querySelector('.vrow[data-id="'+id+'"]'); if(el) el.querySelector(".vmeta").innerHTML='📖 <b class="ok">✓ Ebook ready</b> · '+esc(file.name);
  }

  /* ---------- thumbnails: shrink on this PC, then store in the public site-media bucket ---------- */
  function shrink(file,maxW){
    return new Promise(function(res){
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)) return res(file);
      var img=new Image(), url=URL.createObjectURL(file);
      img.onload=function(){ var w=Math.min(maxW,img.naturalWidth), h=Math.round(img.naturalHeight*w/img.naturalWidth), c=document.createElement("canvas"); c.width=w; c.height=h;
        c.getContext("2d").drawImage(img,0,0,w,h); URL.revokeObjectURL(url); c.toBlob(function(b){ res(b||file); },"image/jpeg",0.86); };
      img.onerror=function(){ res(file); }; img.src=url;
    });
  }
  async function uploadArt(file,name,old){
    if(!/^image\//.test(file.type)) throw new Error("Please pick an image (JPG, PNG or WebP)");
    var blob=await shrink(file,1600), path="courses/"+name+"-"+Date.now().toString(36)+".jpg";
    var r=await sb.storage.from("site-media").upload(path,blob,{ upsert:true, contentType:"image/jpeg", cacheControl:"31536000" });
    if(r.error) throw new Error(r.error.message);
    if(old&&/^courses\//.test(old)) sb.storage.from("site-media").remove([old]);
    return path;
  }

  var S={ pk:null, course:null };
  function allItems(){ var o=[]; (S.course?S.course.sections:[]).forEach(function(s){ o=o.concat(s.items); }); return o; }
  function findItem(id){ return allItems().filter(function(x){ return x.id===id; })[0]; }
  function findSec(id){ return S.course.sections.filter(function(s){ return s.id===id; })[0]; }

  A.screen("content",{ nav:"Course builder", group:"Courses", help:"Change the course name and picture, rename modules and give them pictures, and put videos, ebooks and lessons in any order. Drag the ⠿ handle, or use the arrows. Everything saves as you go.", render: async function(V){
    var pk=sessionStorage.getItem("mth_admin_p")||"gut"; if(!C.products[pk]) pk="gut";
    S.pk=pk;
    var courseUrl=C.products[pk].course, cq=courseUrl+(courseUrl.indexOf("?")<0?"?":"&");
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Course <em>builder</em></h1></div><div class="acts"><select class="sel" id="pp">'+C.order.map(function(k){ return '<option value="'+k+'"'+(k===pk?' selected':'')+'>'+esc(C.products[k].name)+'</option>'; }).join("")+'</select><a class="b sm ghost" href="'+cq+'home=1" target="_blank" rel="noopener">Preview course</a></div></div>'+
      '<div id="streamNote" class="small" style="margin:-6px 0 10px"></div><div id="ls">Loading…</div>';
    document.getElementById("pp").onchange=function(){ sessionStorage.setItem("mth_admin_p",this.value); A.refresh(); };

    S.course=await MTH.loadCourse(pk,true);
    /* give every built-in lesson its own row so it can be moved like anything else */
    var missing=[]; S.course.sections.forEach(function(s){ s.items.forEach(function(it,i){ if(!it.id) missing.push({ it:it, row:{ product:pk, section_id:s.id, position:i, title:it.title, video_url:it.url, kind:"lesson" } }); }); });
    if(missing.length){
      var ins=await sb.from("mth_videos").insert(missing.map(function(m){ return m.row; })).select("id");
      if(ins.error) throw ins.error;
      ins.data.forEach(function(r,i){ var m=missing[i]; m.it.id=r.id; m.it.row=Object.assign({ id:r.id, hidden:false },m.row); });
    }

    /* ---------- saving ---------- */
    async function saveMeta(patch){
      var r=await sb.from("mth_course_meta").upsert(Object.assign({ product:pk, updated_at:now() },patch),{ onConflict:"product" });
      MTH.toast(r.error?"Couldn’t save: "+r.error.message:"Saved ✓");
      return !r.error;
    }
    function secRow(s,i){ return { product:pk, section_id:s.id, position:i, custom:!s.builtIn, updated_at:now() }; }
    async function saveSec(s,patch){
      var i=S.course.sections.indexOf(s);
      var r=await sb.from("mth_course_sections").upsert(Object.assign(secRow(s,i),patch),{ onConflict:"product,section_id" });
      MTH.toast(r.error?"Couldn’t save: "+r.error.message:"Saved ✓");
      return !r.error;
    }
    async function saveSecOrder(){
      var rows=S.course.sections.map(secRow);
      var r=await sb.from("mth_course_sections").upsert(rows,{ onConflict:"product,section_id" });
      MTH.toast(r.error?"Couldn’t save the module order: "+r.error.message:"Module order saved ✓");
    }
    async function saveOrder(){
      var changed=[];
      document.querySelectorAll(".vlist").forEach(function(ol){
        var sec=findSec(ol.dataset.sec), list=[];
        ol.querySelectorAll(".vrow").forEach(function(li,i){
          var it=findItem(li.dataset.id); if(!it) return;
          li.querySelector(".num").textContent=i+1; list.push(it);
          if(it.row.section_id!==sec.id||it.row.position!==i){ it.row.section_id=sec.id; it.row.position=i; changed.push(it); }
        });
        sec.items=list;
      });
      counts();
      if(!changed.length) return;
      var res=await Promise.all(changed.map(function(it){ return sb.from("mth_videos").update({ section_id:it.row.section_id, position:it.row.position, updated_at:now() }).eq("id",it.id); }));
      var bad=res.filter(function(r){ return r.error; })[0];
      MTH.toast(bad?"Couldn’t save the new order: "+bad.error.message:"Order saved ✓");
    }
    function counts(){
      document.querySelectorAll(".vsec").forEach(function(el){ var n=el.querySelectorAll(".vrow").length; el.querySelector(".vcount").textContent=n+" item"+(n===1?"":"s"); el.classList.toggle("empty",!n); });
    }
    function numberSteps(){ var n=0; S.course.sections.forEach(function(s){ s.num=(s.isStart||s.hidden)?0:++n; }); }

    /* ---------- drawing ---------- */
    function art(u,fallbackImg){ return u?MTH.artUrl(u):(fallbackImg?C.assets+"steps/"+fallbackImg+".jpg":""); }
    function rowHtml(it,i,s){
      var moveOpts=S.course.sections.map(function(x){ return '<option value="'+x.id+'">'+esc((x.num?'Step '+x.num+' · ':'')+x.title)+'</option>'; }).join("");
      var meta, file="";
      if(it.kind==="video"){ meta=JOB[it.id]||(it.url?'▶ '+esc(kindOf(it.url)):'▶ <span style="color:var(--terra)">No video yet</span> · press <b>Upload</b>'); file='<label class="ic wide" title="Upload a video file">'+(it.url?'Replace':'Upload')+'<input type="file" accept="video/*,.mp4,.mov,.mkv,.webm" hidden data-rf></label>'; }
      else if(it.kind==="ebook"){ meta=JOB[it.id]||(it.url?'📖 Ebook · '+esc(/^https?:/i.test(it.url)?"link":(it.url.split(".").pop()||"").toUpperCase()+" file"):'📖 <span style="color:var(--terra)">No file yet</span> · press <b>Upload</b>'); file='<label class="ic wide" title="Upload a PDF or HTML ebook">'+(it.url?'Replace':'Upload')+'<input type="file" accept=".pdf,.html,.htm" hidden data-rf></label>'; }
      else { var l=it.lesson||{}; meta='✎ Lesson'+(l.quiz?' · reading + '+l.quiz.length+'-question refresher':l.app?' · opens the app':' · reading'); }
      var live=it.kind==="lesson"||it.url;
      return '<li class="vrow k-'+it.kind+(it.hidden?' hid':'')+'" data-id="'+it.id+'"><span class="grip" title="Drag to move" aria-hidden="true">⠿</span><span class="num">'+(i+1)+'</span>'+
        '<div class="vmain"><input class="inp vt" value="'+esc(it.title)+'" aria-label="Title" placeholder="Title"><div class="small vmeta">'+meta+(it.hidden?' · <b style="color:var(--terra)">Hidden from members</b>':'')+'</div></div>'+
        '<div class="vacts"><button class="ic" data-up title="Move up" aria-label="Move up">↑</button><button class="ic" data-dn title="Move down" aria-label="Move down">↓</button>'+
        '<select class="sel vmv" data-mv aria-label="Move to another module"><option value="">Move to…</option>'+moveOpts+'</select>'+
        (live?'<a class="ic" href="'+cq+'l='+(it.kind==="lesson"?it.lesson.id:'v_'+it.id)+'" target="_blank" rel="noopener" title="See it like a member" aria-label="Preview">▶</a>':'')+file+
        (it.kind==="lesson"?'<button class="ic wide" data-hide title="'+(it.hidden?'Show this lesson to members':'Hide this lesson from members')+'">'+(it.hidden?'Show':'Hide')+'</button>':'<button class="ic del" data-del title="Delete" aria-label="Delete">✕</button>')+'</div></li>';
    }
    function secHtml(s,si){
      var a=art(s.thumb,s.img), last=si===S.course.sections.length-1;
      return '<section class="card vsec msec'+(s.hidden?' hid':'')+'" data-sec="'+s.id+'">'+
        '<div class="mhead"><label class="mthumb'+(s.thumb?' has':'')+'" title="Change this module’s picture"'+(a?' style="background-image:url('+esc(a)+')"':'')+'><span>'+(s.thumb?'Change picture':'+ Picture')+'</span><input type="file" accept="image/*" hidden data-thumb></label>'+
          '<div class="mfields"><div class="sec-h" style="margin:0 0 4px">'+(s.isStart?'Start here':s.hidden?'Hidden module':'Step '+s.num)+' · <b class="vcount">'+s.items.length+'</b></div>'+
            '<input class="inp mt" value="'+esc(s.title)+'" aria-label="Module title" placeholder="Module title">'+
            '<input class="inp ms" value="'+esc(s.sub)+'" aria-label="Module subtitle" placeholder="Short line under the title (optional)"></div>'+
          '<div class="macts"><button class="ic" data-mup title="Move this module up"'+(si?'':' disabled')+'>↑</button><button class="ic" data-mdn title="Move this module down"'+(last?' disabled':'')+'>↓</button>'+
            (s.thumb?'<button class="ic wide" data-nothumb title="Go back to the standard picture">Reset picture</button>':'')+
            (s.builtIn?'<button class="ic wide" data-mhide>'+(s.hidden?'Show module':'Hide module')+'</button>':'<button class="ic del" data-mdel title="Delete this module">✕</button>')+'</div></div>'+
        '<ol class="vlist" data-sec="'+s.id+'">'+s.items.map(function(it,i){ return rowHtml(it,i,s); }).join("")+'</ol>'+
        '<div class="vsec-a" style="margin-top:10px"><label class="b sm">+ Videos<input type="file" multiple accept="video/*,.mp4,.mov,.mkv,.webm" hidden data-add></label><label class="b sm">+ Ebook<input type="file" multiple accept=".pdf,.html,.htm" hidden data-addeb></label><button class="b sm ghost" data-link>+ Paste a video link</button></div>'+
        '<div class="vdrop">Drop videos or ebooks (PDF / HTML) here. Pick several at once and they upload one after another.</div>'+
        '</section>';
    }
    function draw(){
      numberSteps();
      var c=S.course, items=allItems(), nv=items.filter(function(x){ return x.kind==="video"&&x.url; }).length, ne=items.filter(function(x){ return x.kind==="ebook"&&x.url; }).length, wait=items.filter(function(x){ return x.kind!=="lesson"&&!x.url; }).length;
      var ca=c.thumb?MTH.artUrl(c.thumb):(C.products[pk].thumb||"");
      document.getElementById("ls").innerHTML=
        '<section class="card cmeta"><label class="cthumb" title="Change the course picture"'+(ca?' style="background-image:url('+esc(ca)+')"':'')+'><span>'+(c.thumb?'Change picture':'+ Course picture')+'</span><input type="file" accept="image/*" hidden data-cthumb></label>'+
          '<div class="cfields"><div class="sec-h" style="margin:0 0 6px">The course</div><div class="field"><label for="ctitle">Course name</label><input class="inp" id="ctitle" value="'+esc(c.title)+'"></div>'+
          '<div class="field"><label for="csub">Short description</label><input class="inp" id="csub" value="'+esc(c.subtitle)+'" placeholder="One line shown on the course home page"></div>'+
          '<p class="small" style="margin:0">The name and picture show on your course home, your course cards and the menu. Best picture size: 1600 × 900 (16:9).'+(c.thumb?' <a href="#" data-cnothumb>Use the standard picture</a>':'')+'</p></div></section>'+
        '<div class="kpis" style="margin:14px 0"><div class="card kpi"><b>'+c.sections.filter(function(s){ return !s.hidden; }).length+'</b><span>Modules</span></div><div class="card kpi"><b>'+nv+'</b><span>Videos</span></div><div class="card kpi"><b>'+ne+'</b><span>Ebooks</span></div>'+(wait?'<div class="card kpi warn"><b>'+wait+'</b><span>Waiting for a file</span></div>':'')+'</div>'+
        c.sections.map(secHtml).join("")+
        '<button class="b" id="addMod" style="margin-top:4px">+ Add a module</button>';
      wire();
    }

    async function addRows(sec,items){   // items: [{title, kind, video_url?, file?}]
      var s=findSec(sec), start=s.items.length;
      var ins=items.map(function(it,i){ return { product:pk, section_id:sec, position:start+i, title:it.title, video_url:it.video_url||null, kind:it.kind }; });
      var r=await sb.from("mth_videos").insert(ins).select("id,section_id,position,title,video_url,kind,hidden");
      if(r.error){ MTH.toast("Couldn’t add: "+r.error.message); return; }
      r.data.forEach(function(v){ s.items.push({ row:v, id:v.id, kind:v.kind, title:v.title, url:v.video_url||"", hidden:false }); });
      draw();
      r.data.forEach(function(v,i){ if(items[i].file) enqueue({ id:v.id, kind:v.kind, file:items[i].file, product:pk, section:sec }); });
    }
    function addFiles(sec,files){
      files=[].slice.call(files||[]);
      var vids=files.filter(isVideoFile), ebs=files.filter(isEbookFile);
      if(!vids.length&&!ebs.length) return MTH.toast("Those don’t look like videos, PDFs or HTML ebooks");
      var byName=function(a,b){ return a.name.localeCompare(b.name,undefined,{ numeric:true }); };
      var list=vids.sort(byName).map(function(f){ return { title:cleanTitle(f.name), file:f, kind:"video" }; }).concat(ebs.sort(byName).map(function(f){ return { title:cleanTitle(f.name,"Ebook"), file:f, kind:"ebook" }; }));
      if(!vids.length) return addRows(sec,list);
      streamReady().then(function(ok){
        if(!ok){ MTH.toast("Cloudflare Stream isn’t connected yet (see the note at the top), so only the ebooks were added.",5000); list=list.filter(function(x){ return x.kind==="ebook"; }); if(!list.length) return; }
        addRows(sec,list);
      });
    }

    /* ---------- wiring ---------- */
    var dragEl=null;
    function wire(){
      counts();
      allItems().forEach(function(it){ var u=streamId(it.url); if(it.kind==="video"&&u&&!QUEUE.some(function(q){ return q.id===it.id; })) watchStream(it.id,u); });

      /* the course */
      var ct=document.getElementById("ctitle"), cs=document.getElementById("csub");
      ct.onchange=function(){ var t=ct.value.trim()||S.course.base.title; ct.value=t; S.course.title=t; saveMeta({ title:t }).then(function(ok){ if(ok){ C.products[pk].name=t; var o=document.querySelector('#pp option[value="'+pk+'"]'); if(o) o.textContent=t; } }); };
      cs.onchange=function(){ var t=cs.value.trim(); S.course.subtitle=t; saveMeta({ subtitle:t||null }); };
      document.querySelector("[data-cthumb]").onchange=async function(){
        var f=this.files[0]; this.value=""; if(!f) return; MTH.toast("Uploading the picture…");
        try{ var p=await uploadArt(f,pk+"/course",S.course.thumb); if(await saveMeta({ thumb_url:p })){ S.course.thumb=p; C.products[pk].thumb=MTH.artUrl(p); draw(); } }
        catch(e){ MTH.toast("Couldn’t upload: "+e.message,5000); }
      };
      var cn=document.querySelector("[data-cnothumb]"); if(cn) cn.onclick=async function(e){ e.preventDefault(); if(await saveMeta({ thumb_url:null })){ S.course.thumb=""; draw(); } };

      /* modules */
      document.querySelectorAll(".msec").forEach(function(el){
        var s=findSec(el.dataset.sec), si=S.course.sections.indexOf(s);
        el.querySelector(".mt").onchange=function(){ var t=this.value.trim()||s.baseTitle||"New module"; this.value=t; s.title=t; saveSec(s,{ title:t }); };
        el.querySelector(".ms").onchange=function(){ var t=this.value.trim(); s.sub=t; saveSec(s,{ subtitle:t||null }); };
        el.querySelector("[data-thumb]").onchange=async function(){
          var f=this.files[0]; this.value=""; if(!f) return; MTH.toast("Uploading the picture…");
          try{ var p=await uploadArt(f,pk+"/"+s.id,s.thumb); if(await saveSec(s,{ thumb_url:p })){ s.thumb=p; draw(); } }
          catch(e){ MTH.toast("Couldn’t upload: "+e.message,5000); }
        };
        var nt=el.querySelector("[data-nothumb]"); if(nt) nt.onclick=async function(){ if(await saveSec(s,{ thumb_url:null })){ s.thumb=""; draw(); } };
        el.querySelector("[data-mup]").onclick=function(){ if(si<1) return; var L=S.course.sections; L.splice(si,1); L.splice(si-1,0,s); draw(); saveSecOrder(); };
        el.querySelector("[data-mdn]").onclick=function(){ var L=S.course.sections; if(si>=L.length-1) return; L.splice(si,1); L.splice(si+1,0,s); draw(); saveSecOrder(); };
        var mh=el.querySelector("[data-mhide]"); if(mh) mh.onclick=async function(){
          if(!s.hidden&&!confirm('Hide "'+s.title+'" from members? Its videos, ebooks and lessons stay saved here, and you can show it again any time.')) return;
          if(await saveSec(s,{ hidden:!s.hidden })){ s.hidden=!s.hidden; draw(); } };
        var md=el.querySelector("[data-mdel]"); if(md) md.onclick=async function(){
          if(s.items.length) return MTH.toast("Move or delete this module’s items first",4000);
          if(!confirm('Delete the module "'+s.title+'"?')) return;
          var r=await sb.from("mth_course_sections").delete().eq("product",pk).eq("section_id",s.id);
          if(r.error) return MTH.toast("Couldn’t delete: "+r.error.message);
          if(/^courses\//.test(s.thumb||"")) sb.storage.from("site-media").remove([s.thumb]);
          S.course.sections.splice(si,1); draw(); saveSecOrder();
        };

        el.querySelector("[data-add]").onchange=function(){ addFiles(s.id,this.files); this.value=""; };
        el.querySelector("[data-addeb]").onchange=function(){ addFiles(s.id,this.files); this.value=""; };
        el.querySelector("[data-link]").onclick=function(){
          var u=(prompt("Paste a YouTube, Vimeo or Wistia link:")||"").trim(); if(!u) return;
          if(!/^https?:\/\//i.test(u)&&!/^wistia:/i.test(u)) return MTH.toast("That doesn’t look like a link");
          var t=(prompt("Title for this video:","")||"").trim()||"New video";
          addRows(s.id,[{ title:t, video_url:u, kind:"video" }]);
        };
        /* drag files from the PC onto a module */
        el.addEventListener("dragover",function(e){ if(dragEl) return; if([].indexOf.call(e.dataTransfer.types||[],"Files")<0) return; e.preventDefault(); el.classList.add("over"); });
        el.addEventListener("dragleave",function(e){ if(!el.contains(e.relatedTarget)) el.classList.remove("over"); });
        el.addEventListener("drop",function(e){ el.classList.remove("over"); if(dragEl) return; if(!e.dataTransfer.files.length) return; e.preventDefault(); addFiles(s.id,e.dataTransfer.files); });
      });
      document.getElementById("addMod").onclick=async function(){
        var t=(prompt("Name of the new module:","")||"").trim(); if(!t) return;
        var s={ id:"m"+Math.random().toString(36).slice(2,9), builtIn:false, isStart:false, img:"", lessons:[], title:t, sub:"", baseTitle:"", baseSub:"", thumb:"", hidden:false, items:[] };
        S.course.sections.push(s);
        if(await saveSec(s,{ title:t })){ draw(); var el=document.querySelector('.msec[data-sec="'+s.id+'"]'); if(el) el.scrollIntoView({ behavior:"smooth", block:"center" }); }
        else S.course.sections.pop();
      };

      /* reorder items: drag the ⠿ handle within or between modules */
      document.querySelectorAll(".vrow").forEach(function(li){
        var g=li.querySelector(".grip");
        g.onmousedown=g.ontouchstart=function(){ li.draggable=true; };
        li.ondragstart=function(e){ dragEl=li; li.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; try{ e.dataTransfer.setData("text/plain",li.dataset.id); }catch(x){} document.body.classList.add("vdragging"); };
        li.ondragend=function(){ li.classList.remove("dragging"); li.draggable=false; dragEl=null; document.body.classList.remove("vdragging"); document.querySelectorAll(".vsec.over").forEach(function(x){ x.classList.remove("over"); }); saveOrder(); };
      });
      document.querySelectorAll(".msec").forEach(function(el){
        var ol=el.querySelector(".vlist");
        el.addEventListener("dragover",function(e){
          if(!dragEl) return; e.preventDefault(); e.dataTransfer.dropEffect="move";
          var after=[].slice.call(ol.querySelectorAll(".vrow:not(.dragging)")).filter(function(r){ var b=r.getBoundingClientRect(); return e.clientY<b.top+b.height/2; })[0];
          if(after) ol.insertBefore(dragEl,after); else ol.appendChild(dragEl);
          document.querySelectorAll(".vsec.over").forEach(function(x){ if(x!==el) x.classList.remove("over"); }); el.classList.add("over");
        });
        el.addEventListener("drop",function(e){ if(dragEl) e.preventDefault(); });
      });

      document.querySelectorAll(".vrow").forEach(function(li){
        var id=li.dataset.id, it=findItem(id); if(!it) return;
        li.querySelector(".vt").onchange=async function(){
          var t=this.value.trim()||(it.lesson?it.lesson.title:"Untitled"); this.value=t; it.title=t;
          var r=await sb.from("mth_videos").update({ title:t, updated_at:now() }).eq("id",id);
          MTH.toast(r.error?"Couldn’t save the title: "+r.error.message:"Title saved ✓");
        };
        li.querySelector("[data-up]").onclick=function(){ var p=li.previousElementSibling; if(p){ li.parentNode.insertBefore(li,p); saveOrder(); } else moveSection(li,-1); };
        li.querySelector("[data-dn]").onclick=function(){ var n=li.nextElementSibling; if(n){ li.parentNode.insertBefore(n,li); saveOrder(); } else moveSection(li,1); };
        li.querySelector("[data-mv]").onchange=function(){
          var to=this.value; this.value=""; if(!to) return;
          var ol=document.querySelector('.vlist[data-sec="'+to+'"]'); ol.appendChild(li); saveOrder();
          li.scrollIntoView({ behavior:"smooth", block:"center" }); li.classList.add("flash"); setTimeout(function(){ li.classList.remove("flash"); },1400);
        };
        var rf=li.querySelector("[data-rf]"); if(rf) rf.onchange=function(){
          var f=this.files[0]; this.value=""; if(!f) return;
          if(it.kind==="ebook"){ if(!isEbookFile(f)) return MTH.toast("Please upload a PDF or HTML file"); enqueue({ id:id, kind:"ebook", file:f, product:pk, section:it.row.section_id, old:it.url }); return; }
          streamReady().then(function(ok){ if(!ok) return MTH.toast("Cloudflare Stream isn’t connected yet (see the note at the top).",5000);
            delete watching[id]; enqueue({ id:id, kind:"video", file:f, product:pk, section:it.row.section_id, old:it.url }); });
        };
        var hd=li.querySelector("[data-hide]"); if(hd) hd.onclick=async function(){
          var r=await sb.from("mth_videos").update({ hidden:!it.hidden, updated_at:now() }).eq("id",id);
          if(r.error) return MTH.toast("Couldn’t save: "+r.error.message);
          it.hidden=!it.hidden; MTH.toast(it.hidden?"Hidden from members":"Members can see it again"); draw();
        };
        var dl=li.querySelector("[data-del]"); if(dl) dl.onclick=async function(){
          if(QUEUE.some(function(q){ return q.id===id; })||(busy&&JOB[id]&&/Uploading/.test(JOB[id]))) return MTH.toast("Wait for this upload to finish first");
          if(!confirm('Delete "'+it.title+'"? Members won’t see it any more.'+(streamId(it.url)?' The uploaded video is removed from Cloudflare too.':it.kind==="ebook"&&it.url?' The ebook file is removed too.':''))) return;
          var r=await sb.from("mth_videos").delete().eq("id",id);
          if(r.error) return MTH.toast("Couldn’t delete: "+r.error.message);
          var s=findSec(it.row.section_id)||S.course.sections.filter(function(x){ return x.items.indexOf(it)>-1; })[0];
          if(s) s.items=s.items.filter(function(y){ return y!==it; }); delete watching[id]; delete JOB[id];
          if(streamId(it.url)) MTH.fn("mth-video",{ action:"delete", uid:streamId(it.url) });
          if(it.kind==="ebook"&&it.url&&!/^https?:/i.test(it.url)) sb.storage.from("course-files").remove([it.url]);
          li.remove(); saveOrder(); MTH.toast("Deleted");
        };
      });
      function moveSection(li,dir){
        var lists=[].slice.call(document.querySelectorAll(".vlist")), i=lists.indexOf(li.parentNode), to=lists[i+dir]; if(!to) return;
        if(dir<0) to.appendChild(li); else to.insertBefore(li,to.firstChild);
        saveOrder(); li.scrollIntoView({ behavior:"smooth", block:"center" });
      }
    }

    draw();
    streamReady().then(function(ok){ var n=document.getElementById("streamNote"); if(!n) return; n.innerHTML=ok?'<b class="ok">✓ Cloudflare Stream is connected.</b> Uploaded videos are members-only. YouTube, Vimeo and Wistia links work too.':'<b>Cloudflare Stream isn’t connected yet.</b> Add CF_ACCOUNT_ID and CF_STREAM_TOKEN in your <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a>. YouTube links and ebooks still work.'; });
  }});

  A.screen("access",{ nav:"Give access", group:"Courses", help:"Let someone into a course for free, for example a friend, or yourself to preview.", render: async function(V){
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Give <em>access</em></h1></div></div><div class="card panel" style="max-width:560px"><p class="small" style="margin-top:0">For a comp, a friend, a refund swap or a test. They need to have signed in once first.</p>'+
      '<div class="field"><label for="ge">Their email</label><input class="inp" id="ge" type="email" placeholder="name@example.com"></div>'+
      '<div class="field"><label for="gp">Protocol</label><select id="gp" class="inp">'+C.order.map(function(k){ return '<option value="'+k+'">'+esc(C.products[k].name)+'</option>'; }).join("")+'</select></div>'+
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
