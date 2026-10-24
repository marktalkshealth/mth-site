/* =================================================================
   LIBRARY — shared by the admin vault and the public Library page.
   Shelves, polish stages, how a book is offered, and book covers
   (an uploaded cover, or a typographic cover in the brand palette).
================================================================= */
(function(){
  var L=window.MTH_LIB={
    SHELVES:[["ebook","Ebooks"],["book","Finished Books"],["software","Software Text"]],
    STAGES:[["raw","Raw"],["polishing","Polishing"],["signature","Signature look"],["ready","Ready"]],
    LISTINGS:[["private","Private (vault only)"],["free","Free download"],["sale","For sale"],["amazon","On Amazon"]],
    BUCKET:"library-files", COVERS:"library-covers"
  };
  function name(list,k){ for(var i=0;i<list.length;i++) if(list[i][0]===k) return list[i][1]; return k||""; }
  L.shelfName=function(k){ return name(L.SHELVES,k); };
  L.shelfOne=function(k){ return {ebook:"Ebook",book:"Book",software:"Software Text"}[k]||"Ebook"; };
  L.stageName=function(k){ return name(L.STAGES,k); };
  L.listingName=function(k){ return name(L.LISTINGS,k); };
  L.money=function(c){ if(c==null||c==="") return ""; c=Number(c); return "$"+(c/100).toFixed(c%100?2:0); };
  /* a tidy title from a file name: "gut_health-guide v2 FINAL.pdf" -> "Gut Health Guide" */
  L.titleFrom=function(fn){
    var t=String(fn||"").replace(/\.[a-z0-9]{1,5}$/i,"").replace(/[_\-.]+/g," ").replace(/\b(final|v\d+|copy|draft)\b/gi,"").replace(/\s+/g," ").trim();
    return t.replace(/\w\S*/g,function(w){ return /^(and|or|of|the|to|for|in|on|a|an)$/i.test(w)?w.toLowerCase():w.charAt(0).toUpperCase()+w.slice(1); }).replace(/^./,function(c){ return c.toUpperCase(); })||"Untitled";
  };
  L.ext=function(fn){ var m=/\.([a-z0-9]{1,5})$/i.exec(fn||""); return m?m[1].toLowerCase():""; };
  L.safe=function(fn){ return String(fn||"file").normalize("NFKD").replace(/[^\w.\-]+/g,"-").replace(/-+/g,"-").slice(-80); };
  L.size=function(b){ b=Number(b||0); if(!b) return ""; return b>1048576?(b/1048576).toFixed(1)+" MB":Math.max(1,Math.round(b/1024))+" KB"; };
  /* the cover: uploaded image, or a typographic cover (colour follows the shelf) */
  L.cover=function(it){
    var esc=window.MTH?MTH.esc:function(s){ return s; };
    if(it.cover_url) return '<div class="lb-cover" style="background-image:url(\''+esc(it.cover_url)+'\')"></div>';
    var tone={ebook:"t-terra",book:"t-dark",software:"t-sage"}[it.shelf]||"t-terra";
    return '<div class="lb-cover lb-type '+tone+'"><small>Mark Talks Health</small><b>'+esc(it.title||"Untitled")+'</b>'+(it.subtitle?'<i>'+esc(it.subtitle)+'</i>':'')+'<span>'+esc(L.shelfOne(it.shelf))+'</span></div>';
  };
})();
