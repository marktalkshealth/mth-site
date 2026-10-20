/* =================================================================
   ADMIN — Courses: lesson videos + ebooks, and giving access
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;

  A.screen("content",{ nav:"Videos & ebooks", group:"Courses", help:"Add your lesson videos and ebooks here. Paste a YouTube link and press Save. That\u2019s it.", render: async function(V){
    var pk=sessionStorage.getItem("mth_admin_p")||"gut";
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Videos &amp; <em>ebooks</em></h1></div><div class="acts"><select class="sel" id="pp">'+C.order.map(function(k){ return '<option value="'+k+'"'+(k===pk?' selected':'')+'>'+C.products[k].name+'</option>'; }).join("")+'</select><a class="b sm ghost" href="'+C.products[pk].course+'" target="_blank" rel="noopener">Preview course</a></div></div>'+
      '<p class="small" style="margin:-6px 0 14px">Video: paste a YouTube, Vimeo or Wistia link (unlisted works). Ebook: upload the file (HTML or PDF) or paste a link. Members only see these after buying. To preview, give yourself access under "Give access".</p><div id="ls">Loading…</div>';
    document.getElementById("pp").onchange=function(){ sessionStorage.setItem("mth_admin_p",this.value); A.refresh(); };
    var r=await sb.from("mth_lesson_media").select("lesson_id,video_url,ebook_url,updated_at").eq("product",pk);
    var M={}; (r.data||[]).forEach(function(x){ M[x.lesson_id]=x; });
    var course=window.MTH_COURSES[pk], all=0, vids=0, ebs=0;
    course.sections.forEach(function(s){ s.lessons.forEach(function(l){ all++; if((M[l.id]||{}).video_url) vids++; if((M[l.id]||{}).ebook_url) ebs++; }); });
    document.getElementById("ls").innerHTML='<div class="kpis" style="margin-bottom:14px"><div class="card kpi"><b>'+vids+'/'+all+'</b><span>Videos added</span></div><div class="card kpi"><b>'+ebs+'/'+(all-1)+'</b><span>Ebooks added</span></div></div>'+
      course.sections.map(function(s){ return '<div class="sec-h">'+(s.step?'Step '+s.step+' · ':'')+esc(s.title)+'</div>'+s.lessons.map(function(l){ var m=M[l.id]||{};
      return '<div class="card ls" data-l="'+l.id+'"><h4>'+esc(l.title)+'</h4><div class="row">'+
        '<div><label class="small">Video link</label><input class="inp" data-v value="'+esc(m.video_url||"")+'" placeholder="https://youtu.be/…"></div>'+
        (l.app?'<div></div>':'<div><label class="small">Ebook</label><div class="fl"><input class="inp" data-e value="'+esc(m.ebook_url||"")+'" placeholder="Upload a file or paste a link"><label class="b sm ghost" style="flex:none">Upload<input type="file" accept=".html,.htm,.pdf" hidden data-f></label></div></div>')+
        '</div><div class="fl" style="margin-top:12px"><button class="b sm" data-s>Save</button><span class="st">'+(m.video_url?'✓ video ':'no video yet ')+(l.app?'':(m.ebook_url?'· ✓ ebook':'· no ebook yet'))+'</span></div></div>'; }).join(""); }).join("");
    document.querySelectorAll(".ls").forEach(function(card){
      var id=card.dataset.l, st=card.querySelector(".st");
      async function save(){
        var row={ product:pk, lesson_id:id, video_url:card.querySelector("[data-v]").value.trim()||null, updated_at:new Date().toISOString() };
        var e=card.querySelector("[data-e]"); if(e) row.ebook_url=e.value.trim()||null;
        var r=await sb.from("mth_lesson_media").upsert(row,{ onConflict:"product,lesson_id" });
        if(r.error){ st.textContent="Couldn’t save: "+r.error.message; st.classList.remove("ok"); return false; }
        st.textContent="Saved ✓"; st.classList.add("ok"); return true;
      }
      card.querySelector("[data-s]").onclick=save;
      var f=card.querySelector("[data-f]");
      if(f) f.onchange=async function(){
        var file=f.files[0]; if(!file) return;
        var ext=(file.name.split(".").pop()||"html").toLowerCase(); if(["html","htm","pdf"].indexOf(ext)<0) return MTH.toast("Please upload an .html or .pdf file");
        var path=pk+"/"+id+"."+ext;
        st.textContent="Uploading "+file.name+"…"; st.classList.remove("ok");
        var r=await sb.storage.from("course-files").upload(path,file,{ upsert:true, contentType:ext==="pdf"?"application/pdf":"text/html" });
        if(r.error){ st.textContent="Upload failed: "+r.error.message; return; }
        card.querySelector("[data-e]").value=path; await save(); st.textContent="Uploaded and saved ✓";
      };
    });
  }});

  A.screen("access",{ nav:"Give access", group:"Courses", help:"Let someone into a course for free, for example a friend, or yourself to preview.", render: async function(V){
    V.innerHTML='<div class="adm-h"><div><div class="kick">Courses</div><h1>Give <em>access</em></h1></div></div><div class="card panel" style="max-width:560px"><p class="small" style="margin-top:0">For a comp, a friend, a refund swap or a test. They need to have signed in once first.</p>'+
      '<div class="field"><label for="ge">Their email</label><input class="inp" id="ge" type="email" placeholder="name@example.com"></div>'+
      '<div class="field"><label for="gp">Protocol</label><select id="gp" class="inp">'+C.order.map(function(k){ return '<option value="'+k+'">'+C.products[k].name+'</option>'; }).join("")+'</select></div>'+
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
