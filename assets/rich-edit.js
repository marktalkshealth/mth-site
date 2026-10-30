/* =================================================================
   RICH TEXT TOOLS — one formatting toolbar used by every word editor
   (Admin -> Website pages panel, and the full-window page editor).
   Size · Bold · Italic · Underline · Normal text.
   "Normal text" strips bold/italic/underline/size from the selected
   words — or, with nothing selected, makes the next words you type
   plain (fixes "I deleted a bold word and the new one is still bold").
================================================================= */
(function(){
  if(window.MTHRich) return;
  var SIZES=[["0.8","Small"],["1","Normal"],["1.25","Large"],["1.5","Larger"],["2","Huge"]];

  function inside(ed){ var s=getSelection(); return s.rangeCount&&ed.contains(s.getRangeAt(0).commonAncestorContainer); }
  function exec(c,v){ try{ document.execCommand("styleWithCSS",false,false); }catch(e){} try{ return document.execCommand(c,false,v); }catch(e){ return false; } }
  function state(c){ try{ return document.queryCommandState(c); }catch(e){ return false; } }
  function unwrapKeep(n){ var s=getSelection(), a=n.firstChild, z=n.lastChild; unwrap(n); try{ if(a){ var r=document.createRange(); r.setStartBefore(a); r.setEndAfter(z); s.removeAllRanges(); s.addRange(r); } }catch(e){} }
  function unwrap(n){ var p=n.parentNode; while(n.firstChild) p.insertBefore(n.firstChild,n); p.removeChild(n); }

  /* tidy what the browser produced: italic -> <em> (terracotta in headings), no <font>, no empty spans */
  function tidy(ed){
    ed.querySelectorAll("i").forEach(function(i){ var e=document.createElement("em"); while(i.firstChild) e.appendChild(i.firstChild); i.replaceWith(e); });
    ed.querySelectorAll("font").forEach(function(f){ var s=document.createElement("span"); if(f.style.fontSize) s.style.fontSize=f.style.fontSize; while(f.firstChild) s.appendChild(f.firstChild); f.replaceWith(s); });
    ed.querySelectorAll("span").forEach(function(s){ if(!s.getAttribute("style")&&!s.className) unwrap(s); });
    ed.querySelectorAll("[style=\"\"]").forEach(function(n){ n.removeAttribute("style"); });
    ed.querySelectorAll("b:empty,strong:empty,em:empty,u:empty,span:empty").forEach(function(n){ n.remove(); });
    if(!ed.textContent.replace(/​/g,"").trim()&&!ed.querySelector("img,svg")) ed.innerHTML="";
    ed.normalize();
  }
  function html(ed){ var c=ed.cloneNode(true); tidy(c); return c.innerHTML.replace(/​/g,"").replace(/(<br>\s*)+$/,""); }

  function setSize(ed,em,toast){
    if(!inside(ed)) ed.focus();
    var s=getSelection();
    if(!s.rangeCount||s.isCollapsed){ toast&&toast("Select the words first, then pick a size"); return; }
    var last=null;
    exec("fontSize","7");
    ed.querySelectorAll('font[size="7"],span[style*="xxx-large"],span[style*="-webkit-xxx-large"]').forEach(function(f){
      var sp=document.createElement("span");
      if(em!=="1") sp.style.fontSize=em+"em";
      while(f.firstChild) sp.appendChild(f.firstChild);
      sp.querySelectorAll("[style]").forEach(function(x){ x.style.fontSize=""; if(!x.getAttribute("style")) x.removeAttribute("style"); });
      f.replaceWith(sp);
      last=sp;
    });
    /* keep the words selected so you can carry on formatting them */
    if(last){ try{ var r=document.createRange(); r.selectNodeContents(last); s.removeAllRanges(); s.addRange(r); }catch(e){} if(em==="1") unwrapKeep(last); }
    tidy(ed);
  }
  function plain(ed){
    if(!inside(ed)) ed.focus();
    var s=getSelection();
    if(s.rangeCount&&!s.isCollapsed){
      exec("removeFormat");
      /* removeFormat can leave sized spans and <strong>/<em> behind in some browsers */
      var r=s.getRangeAt(0);
      ed.querySelectorAll("b,strong,em,i,u,span,font").forEach(function(n){
        var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT), a=w.nextNode(), z=a; while(w.nextNode()) z=w.currentNode;
        if(!a) return;
        var nr=document.createRange(); nr.setStart(a,0); nr.setEnd(z,z.length);
        if(r.compareBoundaryPoints(Range.START_TO_START,nr)<=0&&r.compareBoundaryPoints(Range.END_TO_END,nr)>=0) unwrap(n); });
    } else {
      /* nothing selected: switch off the formatting for the next words you type */
      ["bold","italic","underline"].forEach(function(c){ if(state(c)) exec(c); });
    }
    tidy(ed);
  }

  /* build the toolbar for an editable element. opts.toast(msg), opts.change() */
  function toolbar(ed,opts){
    opts=opts||{};
    var bar=document.createElement("div"); bar.className="rte-bar";
    bar.innerHTML=
      '<select class="rte-size" title="Text size" aria-label="Text size"><option value="">Size</option>'+SIZES.map(function(z){ return '<option value="'+z[0]+'">'+z[1]+'</option>'; }).join("")+'</select>'+
      '<button type="button" data-c="bold" class="rte-b" title="Bold (Ctrl+B)"><b>B</b></button>'+
      '<button type="button" data-c="italic" class="rte-i" title="Italic — terracotta in headings (Ctrl+I)"><i>I</i></button>'+
      '<button type="button" data-c="underline" class="rte-u" title="Underline (Ctrl+U)"><u>U</u></button>'+
      '<button type="button" data-c="plain" class="rte-n" title="Make the selected words normal (no bold, italic, underline or size)">Normal text</button>';
    var sel=bar.querySelector("select");
    bar.addEventListener("mousedown",function(e){ if(e.target.tagName!=="SELECT"&&e.target.tagName!=="OPTION") e.preventDefault(); });
    var saved=null;
    sel.addEventListener("mousedown",function(){ var s=getSelection(); saved=(s.rangeCount&&inside(ed))?s.getRangeAt(0).cloneRange():null; });
    sel.addEventListener("focus",function(){ var s=getSelection(); if(!saved&&s.rangeCount&&inside(ed)) saved=s.getRangeAt(0).cloneRange(); });
    sel.addEventListener("change",function(){
      var v=sel.value; sel.value=""; if(!v) return;
      ed.focus(); if(saved){ var s=getSelection(); s.removeAllRanges(); s.addRange(saved); }
      setSize(ed,v,opts.toast); saved=null; done();
    });
    bar.addEventListener("click",function(e){
      var b=e.target.closest("button[data-c]"); if(!b) return;
      if(!inside(ed)) ed.focus();
      if(b.dataset.c==="plain") plain(ed); else { exec(b.dataset.c); tidy(ed); }
      done();
    });
    function done(){ mark(); opts.change&&opts.change(); }
    function mark(){
      if(!inside(ed)) return;
      bar.querySelector(".rte-b").classList.toggle("on",state("bold"));
      bar.querySelector(".rte-i").classList.toggle("on",state("italic"));
      bar.querySelector(".rte-u").classList.toggle("on",state("underline"));
    }
    document.addEventListener("selectionchange",mark);
    ed.addEventListener("keydown",function(e){
      if(!(e.ctrlKey||e.metaKey)) return;
      var k=e.key.toLowerCase();
      if(k==="b"||k==="i"||k==="u"){ e.preventDefault(); exec({b:"bold",i:"italic",u:"underline"}[k]); tidy(ed); done(); }
    });
    /* when the box is emptied, forget the old formatting so new words start plain */
    ed.addEventListener("input",function(){ if(!ed.textContent.replace(/​/g,"").trim()){ ed.innerHTML=""; } mark(); });
    bar.destroy=function(){ document.removeEventListener("selectionchange",mark); bar.remove(); };
    return bar;
  }

  var CSS='.rte-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'+
    '.rte-bar button,.rte-bar select{border:1px solid rgba(43,39,36,.18);border-radius:8px;background:#fff;color:#2b2724;font:600 13.5px Inter,system-ui,sans-serif;padding:7px 10px;cursor:pointer;min-width:36px;line-height:1.1}'+
    '.rte-bar select{padding:7px 6px;width:auto}'+
    '.rte-bar button:hover{border-color:#c0623f}'+
    '.rte-bar button.on{background:#2b2724;color:#f7f1e7;border-color:#2b2724}'+
    '.rte-bar .rte-i i{font-family:Georgia,serif}'+
    '.rte-bar .rte-n{font-weight:500}';
  (function(){ var s=document.createElement("style"); s.textContent=CSS; (document.head||document.documentElement).appendChild(s); })();

  window.MTHRich={ toolbar:toolbar, tidy:tidy, html:html };
})();
