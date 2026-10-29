/* =================================================================
   ADMIN — Edit -> Blog
   Write and change blog articles. The editor looks like the article:
   click the words and type. Save = live on the website within a minute
   (for live articles). Articles live in Supabase (mth_blog_posts) and
   the website draws them with functions/blog/[[path]].js.
   Each article: a plain title, one study (PubMed screenshot, citation,
   link), the article itself, and a small course link at the end.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb;
  var R=null;   /* assets/blog-render.mjs, loaded on first use */
  function lib(){ return R?Promise.resolve(R):import("/assets/blog-render.mjs").then(function(m){ R=m; return m; }); }
  var COLS="id,slug,title,description,body,study_title,study_cite,study_url,study_img,cover_img,cta,status,published_at,created_at,updated_at";
  var dirty=false;
  window.addEventListener("beforeunload",function(e){ if(dirty){ e.preventDefault(); e.returnValue=""; } });
  A.isDirty=function(){ return dirty; };
  A.clearDirty=function(){ dirty=false; };

  function pill(p){ return p.status==="published"?'<span class="pill s-active">Live</span>':'<span class="pill s-lead">Draft · only you can see it</span>'; }
  function css(){
    if(document.getElementById("blgCss")) return;
    var st=document.createElement("style"); st.id="blgCss";
    st.textContent=
      ".bge-list .row{display:flex;gap:14px;align-items:center;justify-content:space-between;padding:16px 4px;border-top:1px solid var(--line)}"+
      ".bge-list .row:last-child{border-bottom:1px solid var(--line)}"+
      ".bge-list b{font-family:var(--serif);font-weight:500;font-size:23px;line-height:1.15;display:block}"+
      ".bge-list .acts{display:flex;gap:8px;flex:none}"+
      ".bge-bar{position:sticky;top:0;z-index:5;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--bg);padding:10px 0 12px;margin-bottom:6px;border-bottom:1px solid var(--line)}"+
      ".bge-bar .sp{flex:1}.bge-bar .st{font-size:13px;color:var(--muted)}"+
      ".bge{max-width:760px;margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:28px clamp(16px,4vw,36px) 30px}"+
      ".bge .lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:0 0 6px}"+
      ".bge textarea.bge-title{width:100%;border:0;background:transparent;resize:none;font-family:var(--serif);font-weight:500;font-size:clamp(30px,5vw,46px);line-height:1.08;color:var(--ink);padding:4px 0;margin:0 0 18px;overflow:hidden;outline:none;border-bottom:1px dashed var(--line)}"+
      ".bge textarea.bge-title:focus{border-bottom-color:var(--terra)}"+
      ".bge-study{display:grid;grid-template-columns:170px minmax(0,1fr);gap:16px;background:var(--bg);border:1px solid var(--line);border-radius:16px;padding:14px;margin:0 0 24px}"+
      "@media(max-width:600px){.bge-study{grid-template-columns:1fr}}"+
      ".bge-shot{border:2px dashed var(--line);border-radius:12px;min-height:128px;display:grid;place-items:center;text-align:center;font-size:12.5px;color:var(--muted);cursor:pointer;background:#fff;overflow:hidden;position:relative;padding:8px}"+
      ".bge-shot.on,.bge-shot:focus{border-color:var(--terra);outline:none}"+
      ".bge-shot img{width:100%;height:100%;object-fit:cover;object-position:top left;position:absolute;inset:0}"+
      ".bge-shot .x{position:absolute;right:6px;top:6px;z-index:2;border:0;border-radius:999px;background:rgba(43,39,36,.8);color:#fff;width:26px;height:26px;cursor:pointer}"+
      ".bge-study .f{display:grid;gap:8px}.bge-study .inp{font-size:14px;min-height:40px}"+
      ".bge-tools{display:flex;gap:6px;align-items:center;margin:0 0 8px;flex-wrap:wrap}"+
      ".bge-tools button{border:1px solid var(--line);background:#fff;border-radius:8px;min-width:36px;height:34px;font:600 14px var(--sans);cursor:pointer}"+
      ".bge-tools .i{font-style:italic;font-family:Georgia,serif}.bge-tools .n{font-size:12.5px;color:var(--muted);margin-left:auto}"+
      ".bge .bl-body{min-height:300px;outline:none;border-radius:10px;padding:2px 2px 6px;box-shadow:0 0 0 1px transparent;transition:box-shadow .15s}"+
      ".bge .bl-body:focus{box-shadow:0 0 0 2px var(--terraS)}"+
      ".bge .bl-body:empty:before{content:'Start writing the article here. Press Enter for a new paragraph.';color:var(--faint);font-size:17px}"+
      ".bge .bl-body p:first-child::first-letter{all:unset}"+
      ".bge-end{display:grid;gap:12px;margin-top:22px;padding-top:18px;border-top:1px solid var(--line)}"+
      ".bge-end .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media(max-width:600px){.bge-end .two{grid-template-columns:1fr}}"+
      ".bge details{margin-top:14px}.bge summary{cursor:pointer;font-weight:600;font-size:14px;color:var(--muted)}";
    document.head.appendChild(st);
  }

  /* ---------- the list ---------- */
  async function list(V){
    var r=await sb.from("mth_blog_posts").select("id,slug,title,status,published_at,updated_at").order("updated_at",{ ascending:false });
    if(r.error) throw r.error;
    var rows=r.data||[];
    V.innerHTML='<div class="adm-h"><div><div class="kick">Edit</div><h1>Your <em>blog</em></h1></div><div class="acts"><a class="b sm ghost" href="/blog/" target="_blank" rel="noopener">View the blog</a><button class="b" id="bgNew">＋ New article</button></div></div>'+
      '<div class="card panel bge-list">'+(rows.length?rows.map(function(p){
        return '<div class="row"><div style="min-width:0"><b>'+esc(p.title||"Untitled")+'</b><div class="small" style="margin-top:4px">'+pill(p)+' &nbsp;Changed '+esc(A.when(p.updated_at))+'</div></div>'+
          '<div class="acts">'+(p.status==="published"?'<a class="b sm ghost" href="/blog/'+esc(p.slug)+'/" target="_blank" rel="noopener">View</a>':'')+'<a class="b sm" href="#blog/'+esc(p.id)+'">Edit</a></div></div>'; }).join(""):'<p class="muted" style="margin:0">No articles yet. Press <b>New article</b> to write your first one.</p>')+'</div>';
    document.getElementById("bgNew").onclick=function(){ A.go("blog/new"); };
  }

  /* ---------- PubMed: fill the study in from a link ---------- */
  function pmidOf(u){ u=String(u||"").trim(); if(/^\d{6,9}$/.test(u)) return u; var m=/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{6,9})/i.exec(u); return m?m[1]:""; }
  function doiOf(u){ var m=/(10\.\d{4,9}\/[^\s&?#"]+)/i.exec(decodeURIComponent(String(u||""))); return m?m[1].replace(/[.,;)]+$/,""):""; }
  async function pubmed(u){
    var E="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/", id=pmidOf(u), doi=doiOf(u);
    if(!id&&doi){ var s=await (await fetch(E+"esearch.fcgi?db=pubmed&retmode=json&term="+encodeURIComponent(doi+"[doi]"))).json(); id=((s.esearchresult||{}).idlist||[])[0]; }
    if(!id) return null;
    var j=await (await fetch(E+"esummary.fcgi?db=pubmed&retmode=json&id="+id)).json(), d=(j.result||{})[id];
    if(!d) return null;
    var names=(d.authors||[]).map(function(a){ return a.name; }), au=names.slice(0,3).join(", ")+(names.length>3?", et al.":"");
    var yr=String(d.pubdate||"").slice(0,4), vol=d.volume?(";"+d.volume+(d.issue?"("+d.issue+")":"")+(d.pages?":"+d.pages:"")):"";
    return { pmid:id, title:String(d.title||"").replace(/\.$/,""), cite:(au?au+". ":"")+(d.fulljournalname||d.source||"")+(yr?", "+yr:"")+vol, url:"https://pubmed.ncbi.nlm.nih.gov/"+id+"/" };
  }

  /* ---------- the editor ---------- */
  async function editor(V,id){
    var L=await lib(), p;
    if(id==="new") p={ id:null, slug:"", title:"", description:"", body:"", study_title:"", study_cite:"", study_url:"", study_img:"", cover_img:"", cta:"gut", status:"draft" };
    else{ var r=await sb.from("mth_blog_posts").select(COLS).eq("id",id).maybeSingle(); if(r.error) throw r.error; if(!r.data){ V.innerHTML='<div class="card panel"><p>That article isn’t here any more. <a href="#blog">Back to all articles</a></p></div>'; return; } p=r.data; }
    dirty=false;
    var live=function(){ return p.status==="published"; };
    V.innerHTML=
      '<div class="bge-bar"><a class="b sm ghost" href="#blog">← All articles</a><span id="bgPill">'+pill(p)+'</span><span class="sp"></span><span class="st" id="bgSt"></span>'+
        '<a class="b sm ghost" id="bgView" target="_blank" rel="noopener">View on website</a><button class="b sm ghost" id="bgPub"></button><button class="b" id="bgSave">Save</button></div>'+
      '<div class="bge">'+
        '<label class="lbl" for="bgTitle">Title</label><textarea class="bge-title" id="bgTitle" rows="1" placeholder="A simple title">'+esc(p.title)+'</textarea>'+
        '<span class="lbl">The study</span><div class="bge-study">'+
          '<div class="bge-shot" id="bgShot" tabindex="0" role="button" aria-label="Study picture: paste or choose a screenshot"></div>'+
          '<div class="f"><input class="inp" id="bgUrl" placeholder="PubMed link (paste it, then press Fill in)" value="'+esc(p.study_url||"")+'">'+
            '<input class="inp" id="bgST" placeholder="Study title" value="'+esc(p.study_title||"")+'">'+
            '<input class="inp" id="bgSC" placeholder="Citation, e.g. Wastyk HC et al. Cell, 2021" value="'+esc(p.study_cite||"")+'">'+
            '<div><button class="b sm ghost" id="bgFill">Fill in from the PubMed link</button></div></div></div>'+
        '<span class="lbl">The article</span>'+
        '<div class="bge-tools"><button class="bb" data-c="bold" title="Bold" style="font-weight:800">B</button><button class="i" data-c="italic" title="Italic">I</button><button data-c="link" title="Make the selected words a link">🔗</button><button data-c="unlink" title="Remove a link">⛓̸</button><span class="n" id="bgN"></span></div>'+
        '<div class="bl-body" id="bgBody" contenteditable="true" spellcheck="true"></div>'+
        '<div class="bge-end"><div class="two">'+
          '<div><label class="lbl" for="bgCta">Small course link at the end</label><select class="inp" id="bgCta"><option value="">No link</option>'+Object.keys(L.COURSES).map(function(k){ return '<option value="'+k+'"'+(p.cta===k?' selected':'')+'>'+esc(L.COURSES[k].name)+'</option>'; }).join("")+'</select></div>'+
          '<div><label class="lbl" for="bgDesc">Line Google shows <span id="bgDn"></span></label><input class="inp" id="bgDesc" maxlength="170" placeholder="Leave empty to use the first sentences" value="'+esc(p.description||"")+'"></div></div>'+
          '<details><summary>More</summary><div style="display:grid;gap:10px;margin-top:10px">'+
            '<div><label class="lbl" for="bgSlug">Web address</label><div style="display:flex;gap:6px;align-items:center"><span class="small">marktalkshealth.com/blog/</span><input class="inp" id="bgSlug" value="'+esc(p.slug||"")+'" placeholder="made from the title"'+(live()?' disabled title="Take the article down first to change its address"':'')+'></div></div>'+
            '<div><label class="lbl">Picture at the top (optional)</label><div class="fl" style="display:flex;gap:8px;align-items:center"><label class="b sm ghost">Choose picture<input type="file" accept="image/*" hidden id="bgCover"></label><span class="small" id="bgCvN">'+(p.cover_img?'Has a picture · <a href="javascript:void(0)" id="bgCvX">remove</a>':'None')+'</span></div></div>'+
            (p.id?'<div><button class="danger" id="bgDel">Delete this article</button></div>':'')+
          '</div></details></div>'+
      '</div>';

    var $=function(i){ return document.getElementById(i); };
    var body=$("bgBody"), title=$("bgTitle"), shot=$("bgShot");
    body.innerHTML=L.cleanBody(p.body)||"";
    try{ document.execCommand("defaultParagraphSeparator",false,"p"); }catch(e){}
    function grow(){ title.style.height="auto"; title.style.height=title.scrollHeight+"px"; }
    grow();
    function words(){ var n=L.plainText(body.innerHTML).split(" ").filter(Boolean).length, paras=body.querySelectorAll("p").length||(n?1:0); $("bgN").textContent=n+" words · "+paras+" paragraphs"; }
    function dn(){ var n=$("bgDesc").value.length; $("bgDn").textContent=n?"("+n+")":""; }
    words(); dn();
    function status(t){ $("bgSt").textContent=t||""; }
    function mark(){ dirty=true; status("Not saved yet"); }
    function bar(){
      $("bgPill").innerHTML=pill(p);
      var v=$("bgView"); v.style.display=live()?"":"none"; v.href="/blog/"+p.slug+"/";
      $("bgPub").textContent=live()?"Take down":"Make it live";
    }
    bar();

    /* study picture: paste (Ctrl+V), drop, or choose */
    function drawShot(){
      shot.innerHTML=p.study_img?'<img src="'+esc(p.study_img)+'" alt="Study picture"><button class="x" title="Remove picture" aria-label="Remove picture">✕</button>':'<span>📋 <b>Paste a PubMed screenshot</b><br>Take it with <b>Win + Shift + S</b>, click here, press <b>Ctrl + V</b>.<br><u>or choose a file</u></span>';
      var x=shot.querySelector(".x"); if(x) x.onclick=function(e){ e.stopPropagation(); p.study_img=""; drawShot(); mark(); };
    }
    drawShot();
    async function upload(file,folder){
      if(!file||!/^image\//.test(file.type)) return MTH.toast("That isn’t a picture");
      status("Uploading picture…");
      var ext=(file.type.split("/")[1]||"png").replace("jpeg","jpg"), path="blog/"+(p.slug||L.slugify(title.value)||"article")+"/"+folder+"-"+Date.now().toString(36)+"."+ext;
      var up=await sb.storage.from("site-media").upload(path,file,{ contentType:file.type, upsert:true });
      if(up.error){ status(""); MTH.toast("Couldn’t upload: "+up.error.message,5000); return null; }
      status(""); return sb.storage.from("site-media").getPublicUrl(path).data.publicUrl;
    }
    var pick=document.createElement("input"); pick.type="file"; pick.accept="image/*";
    pick.onchange=async function(){ var u=await upload(pick.files[0],"study"); pick.value=""; if(u){ p.study_img=u; drawShot(); mark(); } };
    shot.onclick=function(){ shot.focus(); };
    shot.ondblclick=function(){ pick.click(); };
    shot.addEventListener("click",function(e){ if(e.target.tagName==="U") pick.click(); });
    shot.addEventListener("paste",async function(e){
      var it=[].slice.call((e.clipboardData||{}).items||[]).filter(function(i){ return /^image\//.test(i.type); })[0];
      if(!it) return MTH.toast("Copy a screenshot first (Win + Shift + S), then press Ctrl + V here");
      e.preventDefault(); var u=await upload(it.getAsFile(),"study"); if(u){ p.study_img=u; drawShot(); mark(); }
    });
    ["dragenter","dragover"].forEach(function(t){ shot.addEventListener(t,function(e){ e.preventDefault(); shot.classList.add("on"); }); });
    ["dragleave","drop"].forEach(function(t){ shot.addEventListener(t,function(e){ e.preventDefault(); shot.classList.remove("on"); }); });
    shot.addEventListener("drop",async function(e){ var f=(e.dataTransfer.files||[])[0]; var u=await upload(f,"study"); if(u){ p.study_img=u; drawShot(); mark(); } });

    $("bgFill").onclick=async function(){
      var b=this, u=$("bgUrl").value.trim(); if(!u) return MTH.toast("Paste the PubMed link first");
      b.disabled=true; b.textContent="Looking it up…";
      try{ var s=await pubmed(u); if(!s) throw new Error("not found");
        $("bgST").value=s.title; $("bgSC").value=s.cite; $("bgUrl").value=s.url; mark(); MTH.toast("Study filled in ✓"); }
      catch(e){ MTH.toast("Couldn’t look that up. Type the study title and citation instead.",5000); }
      b.disabled=false; b.textContent="Fill in from the PubMed link";
    };

    /* the article text */
    $("bgN").parentNode.addEventListener("mousedown",function(e){ if(e.target.closest("button")) e.preventDefault(); });
    $("bgN").parentNode.querySelectorAll("[data-c]").forEach(function(b){ b.onclick=function(){
      body.focus(); var c=b.dataset.c;
      if(c==="link"){ var sel=getSelection(); if(!sel||sel.isCollapsed) return MTH.toast("Select the words first, then press 🔗");
        var u=prompt("Paste the link (for example a PubMed page or one of your pages):","https://"); if(!u||u==="https://") return;
        if(/^www\./i.test(u)) u="https://"+u; document.execCommand("createLink",false,u); }
      else document.execCommand(c);
      mark(); words(); }; });
    body.addEventListener("input",function(){ mark(); words(); });
    body.addEventListener("paste",function(e){
      e.preventDefault();
      var t=(e.clipboardData||window.clipboardData).getData("text/plain")||"";
      var paras=t.replace(/\r/g,"").split(/\n\s*\n/).map(function(x){ return x.replace(/\n/g," ").trim(); }).filter(Boolean);
      if(paras.length<=1) document.execCommand("insertText",false,t.replace(/\s*\n\s*/g," "));
      else document.execCommand("insertHTML",false,paras.map(function(x){ return "<p>"+esc(x)+"</p>"; }).join(""));
    });
    title.addEventListener("input",function(){ grow(); mark(); });
    title.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); body.focus(); } });
    ["bgUrl","bgST","bgSC","bgDesc","bgSlug","bgCta"].forEach(function(i){ $(i).addEventListener("input",mark); $(i).addEventListener("change",mark); });
    $("bgDesc").addEventListener("input",dn);
    $("bgCover").onchange=async function(){ var u=await upload(this.files[0],"cover"); this.value=""; if(u){ p.cover_img=u; $("bgCvN").textContent="Has a picture"; mark(); } };
    var cvx=$("bgCvX"); if(cvx) cvx.onclick=function(){ p.cover_img=""; $("bgCvN").textContent="None"; mark(); };

    /* save */
    async function save(extra){
      var t=title.value.replace(/\s+/g," ").trim();
      if(!t){ title.focus(); MTH.toast("Give the article a title first"); return false; }
      var row={ title:t, body:L.cleanBody(body.innerHTML), description:$("bgDesc").value.trim()||null,
        study_url:$("bgUrl").value.trim()||null, study_title:$("bgST").value.trim()||null, study_cite:$("bgSC").value.trim()||null,
        study_img:p.study_img||null, cover_img:p.cover_img||null, cta:$("bgCta").value||null, updated_at:new Date().toISOString() };
      if(!live()){ var sl=L.slugify($("bgSlug").value.trim()||t); row.slug=sl; }
      Object.assign(row,extra||{});
      if(row.status==="published"&&!p.published_at) row.published_at=new Date().toISOString();
      $("bgSave").disabled=true; status("Saving…");
      var r=p.id?await sb.from("mth_blog_posts").update(row).eq("id",p.id).select(COLS).single():await sb.from("mth_blog_posts").insert(row).select(COLS).single();
      $("bgSave").disabled=false;
      if(r.error){
        status("Not saved");
        MTH.toast(/duplicate|unique/i.test(r.error.message)?"Another article already uses that web address. Change the title or the address under More.":"Couldn’t save: "+r.error.message,6000);
        return false;
      }
      var wasNew=!p.id; p=r.data; dirty=false;
      $("bgSlug").value=p.slug; $("bgSlug").disabled=live();
      body.innerHTML=L.cleanBody(p.body); words();
      bar(); status("Saved "+new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" })+(live()?" · live on your website":" · draft"));
      if(wasNew) history.replaceState(null,"","#blog/"+p.id);
      return true;
    }
    $("bgSave").onclick=function(){ save().then(function(ok){ if(ok) MTH.toast(live()?"Saved ✓ It’s live on your blog":"Saved ✓ (draft: only you can see it)"); }); };
    $("bgPub").onclick=function(){
      if(live()) return MTH.modal("Take this article down?","It disappears from your blog straight away. You can make it live again any time.",[["Take it down",function(){ save({ status:"draft" }).then(function(ok){ if(ok) MTH.toast("Taken down. It’s a draft again."); }); },"dark"],["Keep it live",null,"ghost"]]);
      if(!L.plainText(body.innerHTML)) return MTH.toast("Write the article first");
      MTH.modal("Make this article live?","Anyone can read it on your blog, and Google can find it. You can still change the words any time.",[["Make it live",function(){ save({ status:"published" }).then(function(ok){ if(ok) MTH.toast("It’s live ✓ It can take a minute to show on the website.",5000); }); },""],["Not yet",null,"ghost"]]);
    };
    var del=$("bgDel"); if(del) del.onclick=function(){
      MTH.modal("Delete “"+(p.title||"this article")+"”?","It’s removed from your blog for good.",[["Delete",async function(){
        var r=await sb.from("mth_blog_posts").delete().eq("id",p.id); if(r.error) return MTH.toast("Couldn’t delete: "+r.error.message);
        dirty=false; MTH.toast("Deleted"); A.go("blog"); },"dark"],["Keep it",null,"ghost"]]);
    };
    V.addEventListener("keydown",function(e){ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){ e.preventDefault(); $("bgSave").click(); } });
  }

  A.screen("blog",{ nav:"Blog", group:"Edit",
    help:"Click any words in an article and type, then press <b>Save</b>. Live articles update on your website straight away. New articles stay a draft (only you can see them) until you press <b>Make it live</b>.",
    render: async function(V,arg){
      css();
      if(arg) return editor(V,arg);
      return list(V);
    }
  });
})();
