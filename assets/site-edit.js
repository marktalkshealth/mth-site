/* =================================================================
   WEBSITE WORDS — edit mode (page.html?edit=1, admins only)
   Click any text, type, press Save. Saved words live in mth_site_text
   and show on the live page straight away. "Original" puts them back.
   Loaded by mth.js; the admin screen (assets/admin-words.js) shows the
   page in a frame and lists every change.
================================================================= */
(function(){
  var M=window.MTH, sb=M.sb, inFrame=window.top!==window;
  var cur=null, bar=null, tools=null;

  function waitRoot(){ return new Promise(function(ok){ (function t(){ if(M.wordsRoot) return ok(M.wordsRoot); setTimeout(t,120); })(); }); }
  function tell(){ try{ if(inFrame) window.parent.postMessage({ type:"mth-words-saved", page:M.pageKey },location.origin); }catch(e){} }

  var CSS='[data-mte]{outline:1.5px dashed rgba(192,98,63,.45)!important;outline-offset:3px;cursor:text!important;border-radius:3px}'+
    '[data-mte]:hover{outline:2px solid rgba(192,98,63,.8)!important;background:rgba(246,220,207,.28)}'+
    '[data-mte].mte-done{outline-color:rgba(122,143,110,.85)!important}'+
    '[data-mte].mte-on{outline:2.5px solid #c0623f!important;background:rgba(255,252,247,.92)!important;color:#2b2724!important;cursor:text}'+
    '.mte-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#2b2724;color:#f3e7d3;font:600 13.5px Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;padding:10px 14px calc(10px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(0,0,0,.2)}'+
    '.mte-bar a,.mte-bar button{color:#2b2724;background:#f7f1e7;border:0;border-radius:999px;padding:7px 14px;font:inherit;cursor:pointer;text-decoration:none}'+
    '.mte-tools{position:absolute;z-index:2147483001;display:flex;gap:6px;background:#2b2724;padding:6px;border-radius:12px;box-shadow:0 10px 28px rgba(0,0,0,.25);font:600 13px Inter,system-ui,sans-serif}'+
    '.mte-tools button{border:0;border-radius:8px;padding:7px 11px;font:inherit;cursor:pointer;background:#46403a;color:#fff}'+
    '.mte-tools button.save{background:#c0623f}.mte-tools button.b{font-weight:800}.mte-tools button.i{font-style:italic;font-family:Georgia,serif}'+
    'body{padding-bottom:64px}';

  function place(){
    if(!cur||!tools) return;
    var r=cur.getBoundingClientRect(), top=r.top+window.scrollY-48;
    if(r.top<60) top=r.bottom+window.scrollY+8;
    tools.style.top=top+"px";
    tools.style.left=Math.max(8,Math.min(r.left+window.scrollX,window.scrollX+document.documentElement.clientWidth-tools.offsetWidth-8))+"px";
  }

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
    cur.removeAttribute("contenteditable"); cur.classList.remove("mte-on");
    cur=null; if(tools){ tools.remove(); tools=null; }
  }
  async function commit(){
    if(!cur) return;
    var el=cur, html=M.cleanHtml(el.innerHTML);
    stop();
    if(html===el.__mte0) return;              /* nothing typed */
    el.innerHTML=html;
    var ok=await save(el,html);
    if(!ok) el.innerHTML=el.__mte0;
  }
  function cancel(){ if(!cur) return; var el=cur; el.innerHTML=el.__mte0; stop(); }
  async function original(){
    if(!cur) return; var el=cur; stop();
    el.innerHTML=el.__mw.html;
    if(el.__mw.saveKey) await save(el,M.cleanHtml(el.__mw.html)); else M.toast("These are already the original words");
  }

  function start(el){
    if(cur===el) return;
    if(cur) commit();
    cur=el; el.__mte0=el.innerHTML;
    el.setAttribute("contenteditable","true"); el.classList.add("mte-on"); el.focus();
    try{ var rg=document.createRange(); rg.selectNodeContents(el); rg.collapse(false); var sel=getSelection(); sel.removeAllRanges(); sel.addRange(rg); }catch(e){}
    tools=document.createElement("div"); tools.className="mte-tools";
    tools.innerHTML='<button class="b" data-c="bold" title="Bold">B</button><button class="i" data-c="italic" title="Italic (the terracotta words in headings)">I</button>'+
      '<button class="save" data-a="save">Save</button><button data-a="cancel">Cancel</button><button data-a="orig" title="Put the original words back">Original</button>';
    document.body.appendChild(tools); place();
    tools.addEventListener("mousedown",function(e){ e.preventDefault(); });   /* keep the cursor in the text */
    tools.addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; e.stopPropagation();
      if(b.dataset.c){ try{ document.execCommand(b.dataset.c); }catch(x){} return; }
      if(b.dataset.a==="save") commit(); else if(b.dataset.a==="cancel") cancel(); else original(); });
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
    bar.innerHTML='<span>✎ Editing words · click any text, type, then Save. Green outline = changed.</span>'+(inFrame?'':'<a href="'+location.pathname+'">Done</a>');
    document.body.appendChild(bar);

    document.addEventListener("click",function(e){
      if(tools&&tools.contains(e.target)) return;
      if(bar.contains(e.target)) return;
      var el=e.target.closest("[data-mte]");
      if(el){ e.preventDefault(); e.stopPropagation(); start(el); return; }
      if(cur&&!cur.contains(e.target)) commit();
      if(e.target.closest("a[href],.g2-buy,button.btn")){ e.preventDefault(); e.stopPropagation(); M.toast("Links and buy buttons are paused while you edit"); }
    },true);
    document.addEventListener("keydown",function(e){
      if(!cur) return;
      if(e.key==="Escape"){ e.preventDefault(); cancel(); }
      else if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); commit(); }
    },true);
    document.addEventListener("input",function(){ place(); });
    window.addEventListener("scroll",place,{passive:true}); window.addEventListener("resize",place);
    /* pasting: plain text only */
    document.addEventListener("paste",function(e){ if(!cur||!cur.contains(e.target)) return; e.preventDefault();
      var t=(e.clipboardData||window.clipboardData).getData("text/plain"); try{ document.execCommand("insertText",false,t); }catch(x){} },true);
    /* the admin screen can ask to reload after "Put back" */
    window.addEventListener("message",function(e){ if(e.origin===location.origin&&e.data&&e.data.type==="mth-words-reload") location.reload(); });
  }
  begin();
})();
