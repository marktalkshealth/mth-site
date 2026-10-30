/* =================================================================
   WEBSITE WORDS — edit mode (page.html?edit=1, admins only)
   Click any text, type, press Save. Saved words live in mth_site_text
   and show on the live page straight away. "Original" puts them back.
   Loaded by mth.js; the admin screen (assets/admin-words.js) shows the
   page in a frame and lists every change.
   In the admin frame, clicking text sends it to the editing box on the
   right of the admin screen (it types into the page live). In a full
   window, a panel docked to the right edge does the same. No floating
   toolbars over the words.
================================================================= */
(function(){
  var M=window.MTH, sb=M.sb, inFrame=window.top!==window;
  var cur=null, bar=null;

  function waitRoot(){ return new Promise(function(ok){ (function t(){ if(M.wordsRoot) return ok(M.wordsRoot); setTimeout(t,120); })(); }); }
  function tell(){ try{ if(inFrame) window.parent.postMessage({ type:"mth-words-saved", page:M.pageKey },location.origin); }catch(e){} }

  var CSS='[data-mte]{outline:1.5px dashed rgba(192,98,63,.45)!important;outline-offset:3px;cursor:text!important;border-radius:3px}'+
    '[data-mte]:hover{outline:2px solid rgba(192,98,63,.8)!important;background:rgba(246,220,207,.28)}'+
    '[data-mte].mte-done{outline-color:rgba(122,143,110,.85)!important}'+
    '[data-mte].mte-on{outline:2.5px solid #c0623f!important;background:rgba(255,252,247,.92)!important;color:#2b2724!important;cursor:text}'+
    '.mte-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#2b2724;color:#f3e7d3;font:600 13.5px Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 14px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(0,0,0,.2)}'+
    '.mte-bar a,.mte-bar button{color:#2b2724;background:#f7f1e7;border:0;border-radius:999px;padding:7px 14px;font:inherit;cursor:pointer;text-decoration:none}'+
    '.mte-dock{position:fixed;z-index:2147483001;right:0;top:0;bottom:0;width:360px;background:#fffcf7;border-left:1px solid rgba(43,39,36,.14);box-shadow:-10px 0 30px rgba(43,39,36,.08);padding:20px 18px 80px;overflow:auto;font:15px/1.45 Inter,system-ui,sans-serif;color:#2b2724;box-sizing:border-box}'+
    '.mte-dock h3{font:500 24px/1.1 "Cormorant Garamond",Georgia,serif;margin:0 0 8px;color:#2b2724}'+
    '.mte-dock .what{font-size:13px;color:#7a716a;margin:0 0 10px}'+
    '.mte-dock .empty{font-size:14px;color:#7a716a}'+
    '.mte-dock .rte-bar{margin-bottom:10px}'+
    '.mte-dock .box{min-height:110px;max-height:45vh;overflow:auto;border:1.5px solid rgba(43,39,36,.16);border-radius:12px;background:#fff;padding:12px 14px;font-size:17px;line-height:1.5;outline:none;word-break:break-word}'+
    '.mte-dock .box:focus{border-color:#c0623f;box-shadow:0 0 0 3px rgba(192,98,63,.15)}'+
    '.mte-dock .box em{font-style:italic;color:#c0623f}'+
    '.mte-dock .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}'+
    '.mte-dock .acts button{border:1px solid rgba(43,39,36,.18);border-radius:999px;background:#fff;color:#2b2724;font:600 13.5px Inter,system-ui,sans-serif;padding:8px 16px;cursor:pointer}'+
    '.mte-dock .acts button.save{background:#c0623f;border-color:#c0623f;color:#fff}'+
    '.mte-dock .tip{font-size:12.5px;color:#7a716a;margin-top:14px}'+
    'html.mte-docked body{padding-right:360px!important}html.mte-docked .mte-bar{right:360px}'+
    '@media(max-width:899px){.mte-dock{top:auto;left:0;width:auto;max-height:46vh;border-left:0;border-top:1px solid rgba(43,39,36,.14);box-shadow:0 -10px 30px rgba(43,39,36,.12);padding:14px 14px 70px}html.mte-docked body{padding-right:0!important;padding-bottom:48vh!important}html.mte-docked .mte-bar{right:0}.mte-dock .box{max-height:18vh}.mte-dock .tip{display:none}}'+
    'body{padding-bottom:64px}';

  async function save(el,html){
    var w=el.__mw, key=w.saveKey||w.key, r;
    if(html===M.cleanHtml(w.html)){   /* same as the original: remove the change */
      if(!w.saveKey) return true;
      r=await sb.from("mth_site_text").delete().eq("page",M.pageKey).eq("key",key);
      if(r.error){ M.toast("Couldn’t save: "+r.error.message,4000); return false; }
      w.saveKey=null; el.classList.remove("mte-done"); M.toast("Back to the original words ✓"); tell(); return true;
    }
    r=await sb.from("mth_site_text").upsert({ page:M.pageKey, key:key, orig:w.text, html:html, updated_at:new Date().toISOString() },{ onConflict:"page,key" });
    if(r.error){ M.toast("Couldn’t save: "+r.error.message,4000); return false; }
    w.saveKey=key; el.classList.add("mte-done"); M.toast("Saved ✓ It’s live on your website"); tell(); return true;
  }

  function stop(){
    if(!cur) return;
    cur.classList.remove("mte-on"); cur=null;
  }
  function cancel(){ if(!cur) return; var el=cur; el.innerHTML=el.__mte0; stop(); }
  async function original(){
    if(!cur) return; var el=cur; stop();
    el.innerHTML=el.__mw.html;
    if(el.__mw.saveKey) await save(el,M.cleanHtml(el.__mw.html)); else M.toast("These are already the original words");
  }

  function label(el){
    var t=el.tagName.toLowerCase();
    if(/^h[1-4]$/.test(t)) return t==="h1"?"Main heading":"Heading";
    if(t==="a"||t==="button") return "Button";
    if(t==="li") return "List item";
    if(el.matches(".k,.kick")) return "Small label above a heading";
    if(el.matches(".lead")) return "Subheading";
    return "Text";
  }
  function post(m){ try{ window.parent.postMessage(m,location.origin); }catch(e){} }

  function start(el){
    if(cur===el) return;
    if(cur) commitLive();
    cur=el; el.__mte0=el.innerHTML; el.classList.add("mte-on");
    var info={ label:label(el), html:el.innerHTML, orig:el.__mw.text, changed:!!el.__mw.saveKey };
    if(inFrame) post(Object.assign({ type:"mth-words-pick" },info));   /* the box on the right of the admin screen */
    else dock.open(info);                                               /* the box docked on the right of this window */
  }
  /* actions from the editing box (admin panel or docked panel) */
  async function act(d){
    if(!cur) return;
    if(d.type==="live"){ cur.innerHTML=M.cleanHtml(d.html); return; }
    if(d.type==="save"){ cur.innerHTML=M.cleanHtml(d.html); await commitLive(); }
    else if(d.type==="cancel") cancel();
    else if(d.type==="orig") await original();
    if(inFrame) post({ type:"mth-words-closed" }); else dock.close();
  }

  /* full-window mode: an editing panel fixed to the right edge, away from the words */
  var dock={
    el:null, box:null, bar:null,
    make:function(){
      var d=this.el=document.createElement("aside"); d.className="mte-dock";
      d.innerHTML='<h3>Edit the words</h3><div class="empty">Click any words on the page and they’ll appear here to change.</div>'+
        '<div class="live" hidden><div class="what"></div><div class="tb"></div><div class="box" contenteditable="true" spellcheck="true"></div>'+
        '<div class="acts"><button class="save" data-a="save">Save</button><button data-a="cancel">Cancel</button><button data-a="orig" title="Put the original words back">Original</button></div>'+
        '<p class="tip">Select words, then pick a size or press B, I or U. <b>Normal text</b> takes the formatting off. <b>Enter</b> saves · <b>Shift+Enter</b> new line · <b>Esc</b> cancels.</p></div>';
      document.body.appendChild(d); document.documentElement.classList.add("mte-docked");
      var box=this.box=d.querySelector(".box"), self=this;
      function h(){ return window.MTHRich?window.MTHRich.html(box):box.innerHTML; }
      box.addEventListener("input",function(){ act({ type:"live", html:h() }); });
      box.addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); act({ type:"save", html:h() }); }
        else if(e.key==="Escape"){ e.preventDefault(); act({ type:"cancel" }); } });
      box.addEventListener("paste",function(e){ e.preventDefault();
        var t=(e.clipboardData||window.clipboardData).getData("text/plain").replace(/\s*\n\s*/g," ");
        try{ document.execCommand("insertText",false,t); }catch(x){} act({ type:"live", html:h() }); });
      d.querySelector(".acts").addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return;
        if(b.dataset.a==="save"){ if(!box.textContent.trim()){ M.toast("Type some words first, or press Original"); return; } act({ type:"save", html:h() }); }
        else act({ type:b.dataset.a }); });
      self.h=h;
    },
    open:function(info){
      var d=this.el, box=this.box;
      d.querySelector(".what").textContent=info.label+(info.changed?" · changed before":"")+" · was: "+(info.orig.length>90?info.orig.slice(0,89)+"…":info.orig);
      box.innerHTML=M.cleanHtml(info.html);
      if(this.bar&&this.bar.destroy) this.bar.destroy();
      var h=this.h;
      this.bar=window.MTHRich.toolbar(box,{ toast:M.toast, change:function(){ act({ type:"live", html:h() }); } });
      d.querySelector(".tb").appendChild(this.bar);
      d.querySelector(".empty").hidden=true; d.querySelector(".live").hidden=false;
      box.focus();
      try{ var rg=document.createRange(); rg.selectNodeContents(box); rg.collapse(false); var sl=getSelection(); sl.removeAllRanges(); sl.addRange(rg); }catch(e){}
    },
    close:function(){
      if(this.bar&&this.bar.destroy) this.bar.destroy(); this.bar=null; this.box.innerHTML="";
      this.el.querySelector(".empty").hidden=false; this.el.querySelector(".live").hidden=true;
    }
  };

  /* frame mode: the words were typed in the admin box and are already showing here */
  async function commitLive(){
    if(!cur) return; var el=cur, before=el.__mte0, h=M.cleanHtml(el.innerHTML);
    stop();
    if(h===M.cleanHtml(before)) return;
    if(!(await save(el,h))) el.innerHTML=before;
  }

  async function begin(){
    var ok=false; try{ ok=(await sb.rpc("mth_is_admin")).data===true; }catch(e){}
    if(!ok){ M.toast("Only Mark can edit the words on this page.",4000); return; }
    var root=await waitRoot();
    await new Promise(function(r){ setTimeout(r,300); });   /* let the page finish drawing */
    var st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
    M.textEls(root).forEach(function(el){ if(!el.__mw) return; el.setAttribute("data-mte",""); if(el.__mw.saveKey) el.classList.add("mte-done"); });
    root.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });   /* show everything, no scroll animations */

    bar=document.createElement("div"); bar.className="mte-bar";
    bar.innerHTML='<span>✎ Editing words · '+(inFrame?'click any text, then change it in the box on the right.':'click any text, then change it in the panel on the right.')+' Green outline = changed.</span>'+(inFrame?'':'<a href="'+location.pathname+'">Done</a>');
    document.body.appendChild(bar);
    if(!inFrame) dock.make();

    document.addEventListener("click",function(e){
      if(bar.contains(e.target)) return;
      if(dock.el&&dock.el.contains(e.target)) return;
      var el=e.target.closest("[data-mte]");
      if(el){ e.preventDefault(); e.stopPropagation(); start(el); return; }
      if(e.target.closest("a[href],.g2-buy,button.btn")){ e.preventDefault(); e.stopPropagation(); M.toast("Links and buy buttons are paused while you edit"); }
    },true);
    /* the admin screen can ask to reload after "Put back" */
    window.addEventListener("message",async function(e){
      if(e.origin!==location.origin||!e.data) return; var d=e.data;
      if(d.type==="mth-words-reload"){ location.reload(); return; }
      var m=/^mth-words-(live|save|cancel|orig)$/.exec(d.type);
      if(m) act({ type:m[1], html:d.html });
    });
  }
  if(window.MTHRich) begin();
  else { var rs=document.createElement("script"); rs.src="assets/rich-edit.js?v=202610301500"; rs.onload=begin; rs.onerror=begin; document.head.appendChild(rs); }
})();
