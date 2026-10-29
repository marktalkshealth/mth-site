/* =================================================================
   ADMIN — Library: Mark's private vault for every ebook, finished book
   and software text, and the switch that puts a book in the public
   Library (free download, for sale, or on Amazon).
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb, L=window.MTH_LIB;
  var F={ shelf:"all", stage:"", q:"" };
  try{ F.shelf=sessionStorage.getItem("mth_lib_shelf")||"all"; }catch(e){}
  var ITEMS=[];

  function pills(it){
    return '<span class="pill">'+esc(L.shelfOne(it.shelf))+'</span><span class="pill st-'+esc(it.stage)+'">'+esc(L.stageName(it.stage))+'</span>'+
      (it.listing!=="private"?'<span class="pill ls-'+esc(it.listing)+'">'+esc(it.listing==="sale"?(L.money(it.price_cents)||"For sale"):L.listingName(it.listing))+'</span>':'');
  }
  async function load(){
    var r=await sb.from("mth_library").select("*").order("sort").order("title");
    if(r.error) throw r.error;
    ITEMS=r.data||[];
  }

  A.screen("library",{ nav:"Library", group:"Library", help:"Your vault for every ebook, book, video and software text. Drop files in, then decide what goes in the public Library. Course videos show here too; you add and change those in Edit → Courses.", render: async function(V){
    await load();
    var cnt=function(f){ return ITEMS.filter(f).length; };
    V.innerHTML='<div class="adm-h"><div><div class="kick">Library</div><h1>Your <em>vault</em></h1></div><div class="acts"><a class="b sm ghost" href="library.html" target="_blank" rel="noopener">View public Library</a></div></div>'+
      '<div class="kpis" style="margin-bottom:16px">'+
        '<div class="card kpi"><b>'+ITEMS.length+'</b><span>Everything</span></div>'+
        L.SHELVES.map(function(s){ return '<div class="card kpi"><b>'+cnt(function(x){ return x.shelf===s[0]; })+'</b><span>'+s[1]+'</span></div>'; }).join("")+
        '<div class="card kpi"><b>'+cnt(function(x){ return x.stage==="ready"; })+'</b><span>Ready</span></div>'+
        '<div class="card kpi"><b>'+cnt(function(x){ return x.listing!=="private"; })+'</b><span>In public Library</span></div></div>'+
      '<div class="lb-drop" id="drop"><h3>Drop your files here</h3><p class="small" style="margin:0">Drag a whole folder in at once: ebooks, PDFs, Word, HTML, text, short videos. Each file becomes a card. Files stay private until you list them. Files up to 50 MB; long course videos go in Edit → Courses.</p>'+
        '<div class="acts"><label class="small" for="dShelf">Put them on</label><select class="sel" id="dShelf" style="width:auto">'+L.SHELVES.map(function(s){ return '<option value="'+s[0]+'"'+(F.shelf===s[0]?' selected':'')+'>'+s[1]+'</option>'; }).join("")+'</select>'+
        '<label class="b">Choose files<input type="file" multiple hidden id="dFiles"></label></div><div class="lb-q" id="dq"></div></div>'+
      '<div class="lb-tabs"><button data-sh="all">All</button>'+L.SHELVES.map(function(s){ return '<button data-sh="'+s[0]+'">'+s[1]+'</button>'; }).join("")+
        '<span class="sp"></span><select class="sel" id="fSt" style="width:auto"><option value="">Any stage</option>'+L.STAGES.map(function(s){ return '<option value="'+s[0]+'">'+s[1]+'</option>'; }).join("")+'</select>'+
        '<input class="inp" id="fQ" type="search" placeholder="Search titles"></div><div id="lbList"></div><div id="lbCv"></div>';
    var tabs=V.querySelectorAll("[data-sh]");
    function draw(){
      tabs.forEach(function(b){ b.classList.toggle("on",b.dataset.sh===F.shelf); });
      var q=F.q.toLowerCase(), list=ITEMS.filter(function(x){ return (F.shelf==="all"||x.shelf===F.shelf)&&(!F.stage||x.stage===F.stage)&&(!q||(x.title+" "+(x.subtitle||"")+" "+(x.topic||"")).toLowerCase().indexOf(q)>-1); });
      var box=document.getElementById("lbList");
      if(!list.length){ box.innerHTML='<div class="card panel"><p class="muted" style="margin:0">'+(ITEMS.length?'Nothing matches.':'Your vault is empty. Drop your first books in above.')+'</p></div>'; return; }
      box.innerHTML='<div class="lb-grid">'+list.map(function(it){ return '<button class="lb-item" data-id="'+it.id+'">'+L.cover(it)+'<h4>'+esc(it.title)+'</h4><div class="pills">'+pills(it)+'</div></button>'; }).join("")+'</div>';
      box.querySelectorAll("[data-id]").forEach(function(b){ b.onclick=function(){ edit(b.dataset.id); }; });
    }
    tabs.forEach(function(b){ b.onclick=function(){ F.shelf=b.dataset.sh; try{ sessionStorage.setItem("mth_lib_shelf",F.shelf); }catch(e){} draw(); }; });
    var st=document.getElementById("fSt"); st.value=F.stage; st.onchange=function(){ F.stage=st.value; draw(); };
    var fq=document.getElementById("fQ"); fq.value=F.q; fq.oninput=function(){ F.q=fq.value; draw(); };
    draw();
    courseVideos();

    /* course videos (Cloudflare Stream or links): shown here so everything is in one place */
    async function courseVideos(){
      var box=document.getElementById("lbCv"); if(!box) return;
      var r=await sb.from("mth_videos").select("product,title,video_url,hidden").eq("kind","video").order("product").order("position");
      var vids=(r.data||[]).filter(function(v){ return v.video_url; });
      var names={}; (MTH.config.order||[]).forEach(function(k){ names[k]=MTH.config.products[k].short; });
      box.innerHTML='<div class="card panel" style="margin-top:16px"><h3>Videos in your courses · '+vids.length+'</h3>'+
        '<p class="small" style="margin:0 0 10px">These play inside your courses (members only). To add, rename or reorder them, go to <a href="#content">Edit → Courses</a>.</p>'+
        (vids.length?'<ol class="wd-rows">'+vids.map(function(v){ return '<li><div class="wd-new">'+esc(v.title||"Untitled video")+(v.hidden?' <span class="pill">Hidden</span>':'')+'</div><div class="wd-old">'+esc(names[v.product]||v.product)+' course · '+(/^stream:/.test(v.video_url)?'Uploaded video':'Video link')+'</div></li>'; }).join("")+'</ol>':'<p class="muted" style="margin:0">No course videos yet.</p>')+'</div>';
    }

    /* ---------- bulk upload ---------- */
    var drop=document.getElementById("drop"), inp=document.getElementById("dFiles");
    ["dragenter","dragover"].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.add("on"); }); });
    ["dragleave","drop"].forEach(function(e){ drop.addEventListener(e,function(ev){ ev.preventDefault(); drop.classList.remove("on"); }); });
    drop.addEventListener("drop",async function(ev){ upload(await dropped(ev.dataTransfer)); });
    inp.onchange=function(){ upload([].slice.call(inp.files)); inp.value=""; };
    async function upload(files){
      files=files.filter(function(f){ return f&&f.size>0&&!/^\./.test(f.name); });
      if(!files.length) return;
      var shelf=document.getElementById("dShelf").value, q=document.getElementById("dq"), done=0;
      q.innerHTML=files.map(function(f,i){ return '<div id="q'+i+'"><span>'+esc(f.name)+'</span><span class="small">waiting</span></div>'; }).join("");
      for(var i=0;i<files.length;i++){
        var f=files[i], row=document.getElementById("q"+i).lastChild;
        if(f.size>L.MAX){ row.textContent="✕ too big ("+L.size(f.size)+"). Up to 50 MB here; put long videos in Edit → Courses"; row.className="bad"; continue; }
        row.textContent="uploading…";
        try{
          var sh=/^video\//.test(f.type)?"video":shelf;
          var path=sh+"/"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+"-"+L.safe(f.name);
          var up=await sb.storage.from(L.BUCKET).upload(path,f,{ contentType:f.type||"application/octet-stream" });
          if(up.error) throw up.error;
          var ins=await sb.from("mth_library").insert({ title:L.titleFrom(f.name), shelf:sh, file_path:path, file_name:f.name, file_type:L.ext(f.name), file_size:f.size, sort:ITEMS.length+i });
          if(ins.error) throw ins.error;
          row.textContent="✓ added"; row.className="ok"; done++;
        }catch(e){ row.textContent="✕ "+(e.message||"failed"); row.className="bad"; }
      }
      MTH.toast(done+" of "+files.length+" added to "+L.shelfName(shelf),4000);
      await load(); draw();
    }
  }});

  /* folders dragged in: walk them for files */
  async function dropped(dt){
    var items=dt.items?[].slice.call(dt.items):[], out=[];
    if(!items.length||!items[0].webkitGetAsEntry) return [].slice.call(dt.files||[]);
    async function walk(en){
      if(!en) return;
      if(en.isFile){ await new Promise(function(ok){ en.file(function(f){ out.push(f); ok(); },function(){ ok(); }); }); return; }
      if(en.isDirectory){ var rd=en.createReader(), batch;
        do{ batch=await new Promise(function(ok){ rd.readEntries(ok,function(){ ok([]); }); }); for(var i=0;i<batch.length;i++) await walk(batch[i]); }while(batch.length); }
    }
    var ents=items.map(function(i){ return i.webkitGetAsEntry(); });
    for(var i=0;i<ents.length;i++) await walk(ents[i]);
    return out;
  }

  /* ---------- the book drawer ---------- */
  function edit(id){
    var it=ITEMS.filter(function(x){ return x.id===id; })[0]; if(!it) return;
    var d=document.createElement("div"); d.className="lb-dr";
    var opt=function(list,v){ return list.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]===v?' selected':'')+'>'+s[1]+'</option>'; }).join(""); };
    d.innerHTML='<div class="pane" role="dialog" aria-modal="true" aria-label="Edit book">'+
      '<div class="top"><div id="bc">'+L.cover(it)+'</div><div style="min-width:0"><div class="kick">'+esc(L.shelfOne(it.shelf))+'</div><h3>'+esc(it.title)+'</h3>'+
        '<p class="small" style="margin:0 0 10px">'+esc(it.file_name||"No file")+(it.file_size?' · '+L.size(it.file_size):'')+(it.downloads?' · '+it.downloads+' downloads':'')+'</p>'+
        '<div class="fl"><button class="b sm" data-open'+(it.file_path?'':' disabled')+'>Open file</button><label class="b sm ghost">Replace file<input type="file" hidden data-rf></label><label class="b sm ghost">Cover image<input type="file" accept="image/*" hidden data-cv></label></div></div>'+
        '<button class="x" data-x aria-label="Close">✕</button></div>'+
      '<div class="field"><label>Title</label><input class="inp" data-k="title" value="'+esc(it.title)+'"></div>'+
      '<div class="field"><label>Subtitle</label><input class="inp" data-k="subtitle" value="'+esc(it.subtitle||"")+'"></div>'+
      '<div class="two"><div class="field"><label>Shelf</label><select class="inp" data-k="shelf">'+opt(L.SHELVES,it.shelf)+'</select></div>'+
        '<div class="field"><label>Polish stage</label><select class="inp" data-k="stage">'+opt(L.STAGES,it.stage)+'</select></div></div>'+
      '<div class="field"><label>Topic</label><input class="inp" data-k="topic" value="'+esc(it.topic||"")+'" placeholder="Gut health, fasting, sleep…"></div>'+
      '<div class="field"><label>Description (shown in the public Library)</label><textarea class="inp" data-k="description" rows="4">'+esc(it.description||"")+'</textarea></div>'+
      '<div class="sec-h">In the public Library</div>'+
      '<div class="field"><label>How it’s offered</label><select class="inp" data-k="listing">'+opt(L.LISTINGS,it.listing)+'</select></div>'+
      '<div class="two" data-show="sale"><div class="field"><label>Price (USD)</label><input class="inp" data-k="price" inputmode="decimal" value="'+(it.price_cents!=null?(it.price_cents/100):"")+'" placeholder="19"></div>'+
        '<div class="field"><label>Buy link (optional)</label><input class="inp" data-k="buy_url" value="'+esc(it.buy_url||"")+'" placeholder="https://…"></div></div>'+
      '<div class="field" data-show="amazon sale"><label>Amazon link</label><input class="inp" data-k="amazon_url" value="'+esc(it.amazon_url||"")+'" placeholder="https://www.amazon.com/dp/…"></div>'+
      '<label class="check" style="display:flex;gap:8px;align-items:center;margin:4px 0 14px"><input type="checkbox" data-k="featured"'+(it.featured?' checked':'')+'> Feature it at the top of the Library</label>'+
      '<div class="field"><label>My notes (private: what to polish, headers to change…)</label><textarea class="inp" data-k="notes" rows="4">'+esc(it.notes||"")+'</textarea></div>'+
      '<div class="fl" style="justify-content:space-between"><button class="b" data-save>Save</button><button class="danger" data-del>Delete from vault</button></div><p class="small" data-msg></p></div>';
    document.body.appendChild(d); document.body.style.overflow="hidden";
    function close(){ d.remove(); document.body.style.overflow=""; }
    d.addEventListener("click",function(e){ if(e.target===d||e.target.closest("[data-x]")) close(); });
    var val=function(k){ var el=d.querySelector('[data-k="'+k+'"]'); return el.type==="checkbox"?el.checked:el.value.trim(); };
    function shows(){ var l=val("listing"); d.querySelectorAll("[data-show]").forEach(function(el){ el.style.display=el.dataset.show.split(" ").indexOf(l)>-1?"":"none"; }); }
    d.querySelector('[data-k="listing"]').onchange=shows; shows();
    var msg=d.querySelector("[data-msg]");
    async function patch(row){ row.updated_at=new Date().toISOString(); var r=await sb.from("mth_library").update(row).eq("id",it.id).select().single(); if(r.error) throw r.error; Object.assign(it,r.data); return it; }

    d.querySelector("[data-save]").onclick=async function(){
      var price=val("price").replace(/[$,\s]/g,""), l=val("listing");
      if(l==="free"&&!it.file_path) return MTH.toast("Add the file first: a free download needs a file.");
      if(l==="amazon"&&!/^https?:\/\//.test(val("amazon_url"))) return MTH.toast("Paste the Amazon link first.");
      if(price&&isNaN(Number(price))) return MTH.toast("Price should be a number, like 19 or 9.99");
      try{
        await patch({ title:val("title")||it.title, subtitle:val("subtitle")||null, shelf:val("shelf"), stage:val("stage"), topic:val("topic")||null, description:val("description")||null,
          listing:l, price_cents:price?Math.round(Number(price)*100):null, buy_url:val("buy_url")||null, amazon_url:val("amazon_url")||null, featured:val("featured"), notes:val("notes")||null });
        MTH.toast("Saved"); close(); A.refresh();
      }catch(e){ msg.textContent="Couldn’t save: "+(e.message||e); }
    };
    d.querySelector("[data-open]").onclick=async function(){
      var w=window.open("about:blank","_blank");
      var r=await sb.storage.from(L.BUCKET).createSignedUrl(it.file_path,3600);
      if(r.error){ if(w) w.close(); return MTH.toast("Couldn’t open: "+r.error.message); }
      if(w) w.location=r.data.signedUrl; else location.href=r.data.signedUrl;
    };
    d.querySelector("[data-rf]").onchange=async function(){
      var f=this.files[0]; if(!f) return; msg.textContent="Uploading "+f.name+"…";
      try{
        var path=it.shelf+"/"+Date.now().toString(36)+"-"+L.safe(f.name), old=it.file_path;
        var up=await sb.storage.from(L.BUCKET).upload(path,f,{ contentType:f.type||"application/octet-stream" }); if(up.error) throw up.error;
        await patch({ file_path:path, file_name:f.name, file_type:L.ext(f.name), file_size:f.size });
        if(old) sb.storage.from(L.BUCKET).remove([old]).then(function(){},function(){});
        msg.textContent="New file saved ✓";
      }catch(e){ msg.textContent="Upload failed: "+(e.message||e); }
    };
    d.querySelector("[data-cv]").onchange=async function(){
      var f=this.files[0]; if(!f) return; msg.textContent="Uploading cover…";
      try{
        var path=it.id+"/"+Date.now().toString(36)+"-"+L.safe(f.name);
        var up=await sb.storage.from(L.COVERS).upload(path,f,{ contentType:f.type }); if(up.error) throw up.error;
        await patch({ cover_url:sb.storage.from(L.COVERS).getPublicUrl(path).data.publicUrl });
        d.querySelector("#bc").innerHTML=L.cover(it); msg.textContent="Cover saved ✓";
      }catch(e){ msg.textContent="Cover upload failed: "+(e.message||e); }
    };
    d.querySelector("[data-del]").onclick=function(){
      MTH.modal("Delete “"+it.title+"”?","This removes the book and its file from your vault for good.",[["Delete",async function(){
        var r=await sb.from("mth_library").delete().eq("id",it.id);
        if(r.error) return MTH.toast("Couldn’t delete: "+r.error.message);
        if(it.file_path) sb.storage.from(L.BUCKET).remove([it.file_path]).then(function(){},function(){});
        MTH.toast("Deleted"); close(); A.refresh();
      },"dark"],["Keep it",null,"ghost"]]);
    };
  }
})();
