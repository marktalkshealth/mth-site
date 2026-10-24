/* =================================================================
   ADMIN — THUMBNAIL STUDIO
   Type the idea + the words, pick a style, get 4 AI thumbnails with Mark's face.
   The picture is painted by Google's image model through the mth-thumbs function
   (secret GEMINI_API_KEY). Everything is saved in the private "mth-thumbs" bucket.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc;
  var STYLES=[
    ["clean","Clean Creator","Bright, simple, you + one bold word. Science-explainer look.","linear-gradient(135deg,#ffffff,#e9eef2 60%,#1f2a37 60%)"],
    ["loud","Loud Viral","Huge expression, glow, saturated drama. Biggest-creator look.","linear-gradient(135deg,#ffd400,#ff3b1f 55%,#13131a 55%)"],
    ["vox","Documentary","Vox-style paper collage, halftone, annotation marks.","repeating-linear-gradient(45deg,#e8e0cf 0 6px,#ddd3bf 6px 12px)"],
    ["brand","My Brand · Luxury","Cream, charcoal, terracotta, sage, gold. Calm and premium.","linear-gradient(135deg,#f7f1e7,#f7f1e7 50%,#c0623f 50%,#c0623f 70%,#7a8f6e 70%)"],
    ["scroll","My Brand · Scroll-Stopper","Loud and bold, but in your brand colours.","linear-gradient(135deg,#2b2724,#2b2724 55%,#c0623f 55%,#b8924a)"]
  ];
  var RATIOS=[["16:9","YouTube video · 16:9"],["9:16","Shorts / Reels · 9:16"],["4:5","Instagram feed · 4:5"],["1:1","Square · 1:1"]];
  var S={ style:"clean", ratio:"16:9", count:4, ref:null, busy:false };
  try{ var saved=JSON.parse(localStorage.getItem("mth_thumbs")||"{}"); ["style","ratio","count"].forEach(function(k){ if(saved[k]) S[k]=saved[k]; }); }catch(e){}
  function remember(){ try{ localStorage.setItem("mth_thumbs",JSON.stringify({ style:S.style, ratio:S.ratio, count:S.count })); }catch(e){} }

  function fn(body){ return MTH.fn("mth-thumbs",body); }
  function ratioOf(path){ var m=/-r(\d+)x(\d+)\./.exec(path||""); return m?m[1]+" / "+m[2]:"16 / 9"; }

  /* shrink a photo in the browser before sending it (keeps uploads fast) */
  function shrink(file,max){ return new Promise(function(res,rej){
    var fr=new FileReader(); fr.onerror=rej; fr.onload=function(){ var im=new Image(); im.onerror=rej; im.onload=function(){
      var s=Math.min(1,(max||1280)/Math.max(im.width,im.height)), c=document.createElement("canvas");
      c.width=Math.round(im.width*s); c.height=Math.round(im.height*s); c.getContext("2d").drawImage(im,0,0,c.width,c.height);
      res(c.toDataURL("image/jpeg",0.9)); }; im.src=fr.result; }; fr.readAsDataURL(file); }); }

  async function save(url,name){
    try{ var r=await fetch(url), b=await r.blob(), a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); a.remove(); }
    catch(e){ window.open(url,"_blank"); }
  }

  function css(){
    if(document.getElementById("thCss")) return;
    var st=document.createElement("style"); st.id="thCss";
    st.textContent=
      ".th{display:grid;grid-template-columns:minmax(300px,400px) 1fr;gap:18px;align-items:start}"+
      "@media(max-width:900px){.th{grid-template-columns:1fr}}"+
      ".th .panel h3{font-family:var(--serif);font-weight:500;font-size:22px;margin:0 0 4px}"+
      ".th label.l{display:block;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:16px 0 6px}"+
      ".th-styles{display:grid;gap:8px}"+
      ".th-st{display:flex;gap:10px;align-items:center;text-align:left;border:1.5px solid var(--line);background:#fff;border-radius:14px;padding:8px 10px;cursor:pointer;width:100%}"+
      ".th-st.on{border-color:var(--terra);box-shadow:0 0 0 3px var(--terraS)}"+
      ".th-st i{flex:0 0 46px;height:32px;border-radius:8px;border:1px solid rgba(0,0,0,.08)}"+
      ".th-st b{display:block;font-size:14px}.th-st span{display:block;font-size:12px;color:var(--muted);line-height:1.3}"+
      ".th-faces{display:flex;gap:8px;flex-wrap:wrap}"+
      ".th-face{position:relative;width:64px;height:64px;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--bg2)}"+
      ".th-face img{width:100%;height:100%;object-fit:cover}"+
      ".th-face button{position:absolute;top:2px;right:2px;width:20px;height:20px;border-radius:50%;border:0;background:rgba(43,39,36,.75);color:#fff;font-size:12px;line-height:20px;padding:0;cursor:pointer}"+
      ".th-add{width:64px;height:64px;border-radius:12px;border:1.5px dashed var(--faint);display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--muted);cursor:pointer;background:#fff}"+
      ".th-ref{display:flex;gap:10px;align-items:center}.th-ref img{width:96px;border-radius:8px;border:1px solid var(--line)}"+
      ".th-seg{display:flex;gap:6px;flex-wrap:wrap}.th-seg .chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}"+
      ".th-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:14px;align-items:start}"+
      ".th-card{background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden}"+
      ".th-card .pic{background:#1d1a17;display:block;width:100%;object-fit:cover;cursor:zoom-in}"+
      ".th-card .acts{display:flex;gap:6px;padding:10px;flex-wrap:wrap}"+
      ".th-card .ed{display:flex;gap:6px;padding:0 10px 10px}.th-card .ed .inp{min-height:40px;font-size:14px}"+
      ".th-sk{border-radius:16px;background:linear-gradient(90deg,var(--bg2),#f7efe2,var(--bg2));background-size:200% 100%;animation:thsk 1.4s linear infinite}"+
      "@keyframes thsk{to{background-position:-200% 0}}"+
      ".th-big{position:fixed;inset:0;background:rgba(20,18,16,.92);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;cursor:zoom-out}"+
      ".th-big img{max-width:100%;max-height:100%;border-radius:10px}"+
      ".th-err{background:var(--terraS);color:var(--terraD);border-radius:12px;padding:10px 14px;margin:0 0 12px;font-size:14px}";
    document.head.appendChild(st);
  }

  function setupCard(){
    return '<div class="panel card" style="margin-bottom:16px;border-color:var(--gold)"><h3>One-time setup (about 10 minutes)</h3>'+
      '<ol class="step-list" style="margin:8px 0 0;padding-left:20px;line-height:1.7">'+
      '<li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"><b>Google AI Studio → API keys</b></a> and press <b>Create API key</b>.</li>'+
      '<li>Next to the key, press <b>Set up billing</b> (images don’t work on the free tier). Set a monthly budget, for example $10.</li>'+
      '<li>Copy the key, open <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener"><b>Supabase → Edge Function secrets</b></a>, add a secret named <code>GEMINI_API_KEY</code> and paste the key as its value.</li>'+
      '<li>Come back here and press <b>Check again</b>.</li></ol>'+
      '<button class="b sm" data-recheck style="margin-top:10px">Check again</button></div>';
  }

  function cardHtml(it){
    var name="thumbnail-"+it.path.split("/").pop();
    return '<div class="th-card" data-p="'+esc(it.path)+'">'+
      '<img class="pic" loading="lazy" src="'+esc(it.url)+'" alt="Thumbnail option" style="aspect-ratio:'+ratioOf(it.path)+'" data-zoom>'+
      '<div class="acts"><button class="b sm" data-dl="'+esc(name)+'">⬇ Download</button><button class="b sm ghost" data-ed>✎ Change something</button><button class="b sm ghost" data-del title="Delete">🗑</button></div>'+
      '<div class="ed hidden"><input class="inp" placeholder="e.g. make the text yellow, make me look shocked, add a glass of water" data-edtxt><button class="b sm dark" data-edgo>Go</button></div></div>';
  }
  function skeletons(n){ var r=S.ratio.replace(":"," / "), h=""; for(var i=0;i<n;i++) h+='<div class="th-sk" style="aspect-ratio:'+r+'"></div>'; return h; }

  A.screen("thumbs",{ nav:"Thumbnails", group:"Growing", help:"Type what the video is about and the words you want on it, pick a style, press Make. You get 4 options with your face. Each picture costs a few cents from your Google account.", render: async function(V){
    css();
    var st=await fn({ action:"status" });
    if(st.error==="admins_only") throw new Error("Admins only");
    V.innerHTML='<div id="thRoot">'+(st.key?'':setupCard())+
      '<div class="th">'+
      '<div class="panel card">'+
        '<h3>Make a thumbnail</h3><p class="small" style="margin:0">Your face photos are used automatically.</p>'+
        '<label class="l">1 · Your face <span style="text-transform:none;letter-spacing:0;font-weight:500">(3–4 clear photos, different angles)</span></label>'+
        '<div class="th-faces" id="thFaces"><div class="small">Loading…</div></div>'+
        '<input type="file" accept="image/*" multiple id="thFaceIn" class="hidden">'+
        '<label class="l">2 · What’s the video about?</label>'+
        '<textarea class="inp" id="thIdea" rows="3" placeholder="e.g. I fasted for 5 days to fix my gut. Me looking shocked next to a glowing gut and an empty plate."></textarea>'+
        '<label class="l">3 · Words on the thumbnail <span style="text-transform:none;letter-spacing:0;font-weight:500">(2–4 words works best)</span></label>'+
        '<input class="inp" id="thText" maxlength="60" placeholder="e.g. 5 DAYS NO FOOD  (leave empty for no words)">'+
        '<label class="l">4 · Style</label><div class="th-styles" id="thStyles">'+
          STYLES.map(function(s){ return '<button class="th-st'+(s[0]===S.style?' on':'')+'" data-st="'+s[0]+'"><i style="background:'+s[3]+'"></i><span><b>'+s[1]+'</b><span>'+s[2]+'</span></span></button>'; }).join("")+
        '</div>'+
        '<label class="l">5 · Size</label><div class="th-seg" id="thRatio">'+RATIOS.map(function(r){ return '<button class="chip'+(r[0]===S.ratio?' on':'')+'" data-r="'+r[0]+'">'+r[1]+'</button>'; }).join("")+'</div>'+
        '<label class="l">How many options</label><div class="th-seg" id="thCount">'+[1,2,4].map(function(n){ return '<button class="chip'+(n===S.count?' on':'')+'" data-c="'+n+'">'+n+'</button>'; }).join("")+'</div>'+
        '<label class="l">Optional · Copy the look of a thumbnail you like</label>'+
        '<div class="th-ref" id="thRef"></div><input type="file" accept="image/*" id="thRefIn" class="hidden">'+
        '<p class="small" style="margin:6px 0 0">Save any thumbnail you love (MrBeast, Nick Norwitz…) and add it here. It copies the layout and lighting, with your face and your words.</p>'+
        '<button class="b full" id="thGo" style="margin-top:18px"'+(st.key?'':' disabled')+'>✦ Make thumbnails</button>'+
      '</div>'+
      '<div style="min-width:0"><div id="thErr"></div><div class="th-grid" id="thNew"></div>'+
        '<div class="sec-h" style="display:flex;align-items:baseline;justify-content:space-between;margin:22px 0 10px"><h3 style="font-family:var(--serif);font-weight:500;font-size:22px;margin:0">All your thumbnails</h3><span class="small" id="thCountAll"></span></div>'+
        '<div class="th-grid" id="thHist"><div class="small">Loading…</div></div></div>'+
      '</div></div>';

    var $=function(id){ return document.getElementById(id); }, R=$("thRoot");
    var rb=R.querySelector("[data-recheck]"); if(rb) rb.onclick=function(){ A.refresh(); };

    /* faces */
    async function loadFaces(){
      var r=await fn({ action:"faces" }), f=r.faces||[];
      $("thFaces").innerHTML=f.map(function(x){ return '<div class="th-face"><img src="'+esc(x.url)+'" alt="Face photo"><button data-fdel="'+esc(x.path)+'" title="Remove">×</button></div>'; }).join("")+
        (f.length<4?'<button class="th-add" id="thFaceAdd" title="Add face photos">+</button>':'')+
        (!f.length?'<div class="small" style="align-self:center">Add photos of your face so it’s you on every thumbnail.</div>':'');
      var add=$("thFaceAdd"); if(add) add.onclick=function(){ $("thFaceIn").click(); };
    }
    $("thFaceIn").onchange=async function(){
      var files=[].slice.call(this.files||[]).slice(0,4); this.value="";
      if(!files.length) return; MTH.toast("Adding photos…");
      for(var i=0;i<files.length;i++){ try{ var r=await fn({ action:"face_add", image:await shrink(files[i],1280) }); if(r.error) MTH.toast("Couldn’t add a photo: "+r.error); }catch(e){ MTH.toast("Couldn’t read that photo"); } }
      loadFaces();
    };
    $("thFaces").onclick=async function(e){ var b=e.target.closest("[data-fdel]"); if(!b) return; if(!confirm("Remove this face photo?")) return; await fn({ action:"face_del", path:b.dataset.fdel }); loadFaces(); };

    /* reference thumbnail */
    function drawRef(){ $("thRef").innerHTML=S.ref?'<img src="'+S.ref+'" alt="Reference"><button class="b sm ghost" data-rx>Remove</button>':'<button class="b sm ghost" data-ra>+ Add a thumbnail to copy</button>'; }
    $("thRef").onclick=function(e){ if(e.target.closest("[data-ra]")) $("thRefIn").click(); if(e.target.closest("[data-rx]")){ S.ref=null; drawRef(); } };
    $("thRefIn").onchange=async function(){ var f=this.files&&this.files[0]; this.value=""; if(f){ S.ref=await shrink(f,1280); drawRef(); } };
    /* paste a screenshot straight in (Ctrl+V) */
    A.thPaste=async function(e){ if(!document.getElementById("thRoot")) return; if(e.target.closest&&e.target.closest("input,textarea")) return; var it=[].slice.call((e.clipboardData||{}).items||[]).find(function(x){ return x.type.indexOf("image")===0; }); if(it){ S.ref=await shrink(it.getAsFile(),1280); drawRef(); MTH.toast("Added as the look to copy"); } };
    if(!A.thPasteOn){ A.thPasteOn=true; document.addEventListener("paste",function(e){ A.thPaste(e); }); }
    drawRef();

    /* choices */
    $("thStyles").onclick=function(e){ var b=e.target.closest("[data-st]"); if(!b) return; S.style=b.dataset.st; remember(); [].forEach.call(this.children,function(x){ x.classList.toggle("on",x===b); }); };
    $("thRatio").onclick=function(e){ var b=e.target.closest("[data-r]"); if(!b) return; S.ratio=b.dataset.r; remember(); [].forEach.call(this.children,function(x){ x.classList.toggle("on",x===b); }); };
    $("thCount").onclick=function(e){ var b=e.target.closest("[data-c]"); if(!b) return; S.count=Number(b.dataset.c); remember(); [].forEach.call(this.children,function(x){ x.classList.toggle("on",x===b); }); };
    try{ var d=JSON.parse(sessionStorage.getItem("mth_thumbs_draft")||"{}"); $("thIdea").value=d.idea||""; $("thText").value=d.text||""; }catch(e){}
    function keepDraft(){ try{ sessionStorage.setItem("mth_thumbs_draft",JSON.stringify({ idea:$("thIdea").value, text:$("thText").value })); }catch(e){} }
    $("thIdea").oninput=keepDraft; $("thText").oninput=keepDraft;

    function err(msg){ $("thErr").innerHTML=msg?'<div class="th-err">'+esc(msg)+'</div>':''; }

    /* make */
    $("thGo").onclick=async function(){
      if(S.busy) return; var idea=$("thIdea").value.trim();
      if(!idea){ $("thIdea").focus(); return MTH.toast("Type what the video is about first"); }
      S.busy=true; var btn=this; btn.disabled=true; btn.textContent="Painting your thumbnails… (about 20–40 seconds)"; err("");
      $("thNew").innerHTML=skeletons(S.count); $("thNew").scrollIntoView({ behavior:"smooth", block:"start" });
      try{
        var r=await fn({ action:"generate", idea:idea, text:$("thText").value.trim(), style:S.style, ratio:S.ratio, count:S.count, ref:S.ref });
        if(r.error==="no_key") err("Add your Google key first (see the setup box at the top).");
        else if(r.error) err(r.error);
        var items=r.items||[];
        $("thNew").innerHTML=items.map(cardHtml).join("");
        if(r.errors&&r.errors.length) err((items.length?"Some options failed: ":"")+r.errors.join(" · "));
        if(items.length) loadHist();
      }catch(e){ err("Something went wrong. Try again in a moment."); $("thNew").innerHTML=""; }
      S.busy=false; btn.disabled=false; btn.textContent="✦ Make thumbnails";
    };

    /* history */
    async function loadHist(){
      var r=await fn({ action:"history" }), items=r.items||[];
      $("thCountAll").textContent=items.length?items.length+" saved":"";
      $("thHist").innerHTML=items.length?items.map(cardHtml).join(""):'<div class="small">Nothing yet. Your thumbnails are saved here automatically.</div>';
    }

    /* card buttons (new + history) */
    R.addEventListener("click",async function(e){
      var card=e.target.closest(".th-card"); if(!card) return; var path=card.dataset.p, img=card.querySelector("img");
      if(e.target.closest("[data-zoom]")){ var z=document.createElement("div"); z.className="th-big"; z.innerHTML='<img src="'+esc(img.src)+'" alt="">'; z.onclick=function(){ z.remove(); }; document.body.appendChild(z); return; }
      var dl=e.target.closest("[data-dl]"); if(dl) return save(img.src,dl.dataset.dl);
      if(e.target.closest("[data-ed]")){ var ed=card.querySelector(".ed"); ed.classList.toggle("hidden"); if(!ed.classList.contains("hidden")) ed.querySelector("input").focus(); return; }
      if(e.target.closest("[data-del]")){ if(!confirm("Delete this thumbnail?")) return; await fn({ action:"delete", path:path }); document.querySelectorAll('.th-card[data-p="'+path+'"]').forEach(function(c){ c.remove(); }); return; }
      if(e.target.closest("[data-edgo]")){
        var inp=card.querySelector("[data-edtxt]"), t=inp.value.trim(); if(!t) return inp.focus();
        var go=e.target.closest("[data-edgo]"); go.disabled=true; go.textContent="Changing…"; err("");
        var r=await fn({ action:"edit", path:path, instruction:t });
        go.disabled=false; go.textContent="Go";
        if(r.error) return err(r.error);
        (r.items||[]).forEach(function(it){ $("thNew").insertAdjacentHTML("afterbegin",cardHtml(it)); });
        $("thNew").scrollIntoView({ behavior:"smooth", block:"start" }); inp.value=""; loadHist();
      }
    });
    R.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.matches("[data-edtxt]")){ var b=e.target.parentNode.querySelector("[data-edgo]"); if(b) b.click(); } });

    loadFaces(); loadHist();
  }});
})();
