/* =================================================================
   ADMIN — Website words
   Shows a page of the website in edit mode (page.html?edit=1, see
   assets/site-edit.js): click any text and it opens in the editing box
   on the right (under Changes) with size/bold/italic/underline/normal. Changes are kept in
   mth_site_text and listed here, each with "Put back".
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb;
  var PAGES=[
    ["index","index.html","Home page"],
    ["gut","gut.html","Gut Health sales page"],
    ["diabetes","diabetes.html","Diabetes sales page"],
    ["glp1","glp1.html","GLP-1 sales page"],
    ["protocols","protocols.html","All courses"],
    ["partners","partners.html","Work with me"],
    ["picks","picks.html","My Picks"],
    ["library","library.html","Library"],
    ["refunds","refunds.html","Refunds"],
    ["privacy","privacy.html","Privacy"],
    ["terms","terms.html","Terms"]
  ];
  function pageOf(k){ return PAGES.filter(function(p){ return p[0]===k; })[0]||PAGES[0]; }
  function plain(h){ var d=document.createElement("div"); d.innerHTML=h||""; return MTH.normText(d.textContent); }
  function cut(t,n){ t=String(t||""); return t.length>n?t.slice(0,n-1)+"…":t; }

  var listener=null;

  A.screen("words",{ nav:"Website words", group:"Website",
    help:"Change any words on your website. Pick a page, click the text you want to change, then change it in the box on the right and press Save. It goes live straight away. Changed text has a green outline. Press Put back to undo a change.",
    render: async function(V){
      var pk=sessionStorage.getItem("mth_words_p")||"index"; var P=pageOf(pk); pk=P[0];
      var size=sessionStorage.getItem("mth_words_sz")||"phone";
      var src=P[1]+"?edit=1";
      V.innerHTML='<div class="adm-h"><div><div class="kick">Website</div><h1>Website <em>words</em></h1></div><div class="acts">'+
          '<select class="sel" id="wp" aria-label="Page">'+PAGES.map(function(p){ return '<option value="'+p[0]+'"'+(p[0]===pk?' selected':'')+'>'+esc(p[2])+'</option>'; }).join("")+'</select>'+
          '<select class="sel" id="ws" aria-label="Screen size"><option value="phone"'+(size==="phone"?' selected':'')+'>📱 Phone view</option><option value="desk"'+(size==="desk"?' selected':'')+'>🖥 Computer view</option></select>'+
          '<a class="b sm ghost" href="'+src+'" target="_blank" rel="noopener">⧉ Edit in a full window</a></div></div>'+
        '<div class="wd-grid">'+
          '<div class="wd-frame '+size+'"><iframe id="wf" src="'+src+'" title="'+esc(P[2])+' in edit mode"></iframe></div>'+
          '<div class="wd-side">'+
            '<div class="card panel wd-list"><h3>Changes on this page</h3><div id="wl" class="small">Loading…</div></div>'+
            '<div class="card panel wd-ed" id="we">'+
              '<h3>Edit the words</h3>'+
              '<div class="wd-empty small" id="we0">Click any words on the page and they’ll appear here to change.</div>'+
              '<div class="wd-live" id="we1" hidden>'+
                '<div class="wd-what small" id="weL"></div>'+
                '<div id="weT"></div>'+
                '<div class="wd-box" id="weBox" contenteditable="true" spellcheck="true"></div>'+
                '<div class="wd-acts"><button class="b sm" id="weS">Save</button><button class="b sm ghost" id="weC">Cancel</button><button class="b sm ghost" id="weO" title="Put the original words back">Original</button></div>'+
                '<p class="small wd-tip">Select words, then pick a size or press <b>B</b>, <i>I</i> or <u>U</u>. <b>Normal text</b> takes the bold, italic, underline and size off. Italic words are terracotta in headings. <b>Enter</b> saves · <b>Shift+Enter</b> new line · <b>Esc</b> cancels.</p>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>';
      document.getElementById("wp").onchange=function(){ sessionStorage.setItem("mth_words_p",this.value); A.refresh(); };
      document.getElementById("ws").onchange=function(){ sessionStorage.setItem("mth_words_sz",this.value); var f=V.querySelector(".wd-frame"); f.classList.remove("phone","desk"); f.classList.add(this.value); };
      var frame=document.getElementById("wf");
      var box=document.getElementById("weBox"), bar=null;
      function send(m){ try{ frame.contentWindow.postMessage(m,location.origin); }catch(e){} }
      function closeEd(){ if(bar&&bar.destroy) bar.destroy(); bar=null; document.getElementById("we1").hidden=true; document.getElementById("we0").hidden=false; box.innerHTML=""; }
      function openEd(d){
        document.getElementById("weL").textContent=d.label+(d.changed?" · changed before":"")+" · was: "+cut(d.orig,90);
        box.innerHTML=MTH.cleanHtml(d.html);
        if(bar&&bar.destroy) bar.destroy();
        bar=MTHRich.toolbar(box,{ toast:MTH.toast, change:live });
        document.getElementById("weT").appendChild(bar);
        document.getElementById("we0").hidden=true; document.getElementById("we1").hidden=false;
        box.focus();
        try{ var rg=document.createRange(); rg.selectNodeContents(box); rg.collapse(false); var sl=getSelection(); sl.removeAllRanges(); sl.addRange(rg); }catch(e){}
        if(window.innerWidth<1100) document.getElementById("we").scrollIntoView({ behavior:"smooth", block:"nearest" });
      }
      function live(){ send({ type:"mth-words-live", html:MTHRich.html(box) }); }
      function saveEd(){
        var h=MTHRich.html(box);
        if(!box.textContent.trim()){ MTH.toast("Type some words first, or press Original"); return; }
        send({ type:"mth-words-save", html:h });
      }
      frame.addEventListener("load",closeEd);
      box.addEventListener("input",live);
      box.addEventListener("keydown",function(e){
        if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); saveEd(); }
        else if(e.key==="Escape"){ e.preventDefault(); send({ type:"mth-words-cancel" }); }
      });
      box.addEventListener("paste",function(e){ e.preventDefault();
        var t=(e.clipboardData||window.clipboardData).getData("text/plain").replace(/\s*\n\s*/g," ");
        try{ document.execCommand("insertText",false,t); }catch(x){} live(); });
      document.getElementById("weS").onclick=saveEd;
      document.getElementById("weC").onclick=function(){ send({ type:"mth-words-cancel" }); };
      document.getElementById("weO").onclick=function(){ send({ type:"mth-words-orig" }); };

      async function list(){
        var box=document.getElementById("wl"); if(!box) return;
        var r=await sb.from("mth_site_text").select("key,orig,html,updated_at").eq("page",pk).order("updated_at",{ ascending:false });
        if(r.error){ box.innerHTML='Couldn’t load changes: '+esc(r.error.message); return; }
        var rows=r.data||[];
        if(!rows.length){ box.innerHTML='No changes yet. Click any text on the page to change it.'; return; }
        box.innerHTML='<ol class="wd-rows">'+rows.map(function(x){
          return '<li><div class="wd-new">'+esc(cut(plain(x.html),140))+'</div><div class="wd-old">Was: '+esc(cut(x.orig,140))+'</div>'+
            '<div class="wd-meta"><span>'+esc(A.when(x.updated_at,true))+'</span><button class="b sm ghost" data-k="'+esc(x.key)+'">Put back</button></div></li>'; }).join("")+'</ol>';
        box.querySelectorAll("[data-k]").forEach(function(b){ b.onclick=async function(){
          b.disabled=true;
          var d=await sb.from("mth_site_text").delete().eq("page",pk).eq("key",b.dataset.k);
          if(d.error){ MTH.toast("Couldn’t put it back: "+d.error.message); b.disabled=false; return; }
          MTH.toast("Original words are back ✓");
          try{ frame.contentWindow.postMessage({ type:"mth-words-reload" },location.origin); }catch(e){ frame.src=frame.src; }
          list();
        }; });
      }
      if(listener) window.removeEventListener("message",listener);
      listener=function(e){
        if(e.origin!==location.origin||!e.data||e.source!==frame.contentWindow) return;
        var t=e.data.type;
        if(t==="mth-words-saved") list();
        else if(t==="mth-words-pick") openEd(e.data);
        else if(t==="mth-words-closed") closeEd();
      };
      window.addEventListener("message",listener);
      list();
    }
  });
})();
