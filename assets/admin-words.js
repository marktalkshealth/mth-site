/* =================================================================
   ADMIN — Website words
   Shows a page of the website in edit mode (page.html?edit=1, see
   assets/site-edit.js): click any text, type, Save. Changes are kept in
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
    help:"Change any words on your website. Pick a page, click the text you want to change, type, then press Save. It goes live straight away. Changed text has a green outline. Press Put back to undo a change.",
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
          '<div class="card panel wd-list"><h3>Changes on this page</h3><div id="wl" class="small">Loading…</div>'+
            '<p class="small" style="margin-top:14px">Tip: click a heading, then use <b>I</b> to make words italic and terracotta, like the rest of your headings. Press <b>Enter</b> to save, <b>Esc</b> to cancel.</p></div>'+
        '</div>';
      document.getElementById("wp").onchange=function(){ sessionStorage.setItem("mth_words_p",this.value); A.refresh(); };
      document.getElementById("ws").onchange=function(){ sessionStorage.setItem("mth_words_sz",this.value); var f=V.querySelector(".wd-frame"); f.classList.remove("phone","desk"); f.classList.add(this.value); };
      var frame=document.getElementById("wf");

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
      listener=function(e){ if(e.origin===location.origin&&e.data&&e.data.type==="mth-words-saved") list(); };
      window.addEventListener("message",listener);
      list();
    }
  });
})();
