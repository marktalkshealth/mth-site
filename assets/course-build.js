/* =================================================================
   COURSE BUILDER — puts a course together from courses.js (built-in
   lessons, quizzes) plus Mark's edits saved in Supabase:
     mth_course_meta      course title, subtitle, thumbnail
     mth_course_sections  each module's title, subtitle, thumbnail, order, hidden; new modules
     mth_videos           every item in a module, in order: video | ebook | lesson
   Used by course.html (members) and the admin Course builder.
================================================================= */
(function(){
  var M=window.MTH;

  /* a thumbnail saved as a site-media path, or a full link */
  M.artUrl=function(u){
    u=(u||"").trim(); if(!u) return "";
    if(/^https?:\/\//i.test(u)||u.charAt(0)==="/") return u;
    return M.config.supabaseUrl+"/storage/v1/object/public/site-media/"+u.replace(/^\/+/,"");
  };

  /* admin=true keeps hidden modules/items and items still waiting for a file */
  M.loadCourse=async function(pk,admin){
    var base=window.MTH_COURSES[pk], sb=M.sb;
    var q=await Promise.all([
      sb.from("mth_course_meta").select("product,title,subtitle,thumb_url").eq("product",pk).maybeSingle(),
      sb.from("mth_course_sections").select("section_id,position,title,subtitle,thumb_url,hidden,custom").eq("product",pk),
      sb.from("mth_videos").select("id,section_id,position,title,video_url,kind,hidden").eq("product",pk).order("position")
    ]);
    if(q[2].error) throw q[2].error;
    var meta=q[0].data||{}, R={};
    (q[1].data||[]).forEach(function(r){ R[r.section_id]=r; });

    var lessonById={}, homeOf={};
    var secs=base.sections.map(function(s,i){
      var r=R[s.id]||{};
      s.lessons.forEach(function(l){ lessonById[l.id]=l; homeOf[l.id]=s.id; });
      return { id:s.id, builtIn:true, isStart:s.id==="start", img:s.img||"", lessons:s.lessons,
        title:r.title||s.title, sub:(r.subtitle!=null&&r.subtitle!=="")?r.subtitle:(s.sub||""), baseTitle:s.title, baseSub:s.sub||"",
        thumb:r.thumb_url||"", hidden:!!r.hidden, pos:r.position!=null?r.position:i, saved:!!R[s.id] };
    });
    Object.keys(R).forEach(function(id){
      var r=R[id]; if(base.sections.some(function(s){ return s.id===id; })) return;
      secs.push({ id:id, builtIn:false, isStart:false, img:"", lessons:[], title:r.title||"New module", sub:r.subtitle||"", baseTitle:"", baseSub:"",
        thumb:r.thumb_url||"", hidden:!!r.hidden, pos:r.position, saved:true });
    });
    secs.forEach(function(s,i){ s._i=i; });
    secs.sort(function(a,b){ return (a.pos-b.pos)||(a._i-b._i); });
    var byId={}; secs.forEach(function(s){ s.items=[]; byId[s.id]=s; });
    var first=secs[0];

    /* items in Mark's order */
    var seen={};
    (q[2].data||[]).forEach(function(v){
      var kind=v.kind||"video", it={ row:v, id:v.id, kind:kind, title:v.title, url:v.video_url||"", hidden:!!v.hidden };
      if(kind==="lesson"){
        var lid=(v.video_url||"").replace(/^lesson:/,""), l=lessonById[lid]; if(!l||seen[lid]) return;
        seen[lid]=1; it.lesson=l; it.title=v.title||l.title;
      }
      (byId[v.section_id]||first).items.push(it);
    });
    /* built-in lessons that have no row yet go at the end of their own module */
    Object.keys(lessonById).forEach(function(lid){
      if(seen[lid]) return; var l=lessonById[lid];
      (byId[homeOf[lid]]||first).items.push({ row:null, id:null, kind:"lesson", title:l.title, url:"lesson:"+lid, lesson:l, hidden:false });
    });

    if(!admin){
      secs=secs.filter(function(s){ return !s.hidden; });
      secs.forEach(function(s){ s.items=s.items.filter(function(it){ return !it.hidden&&(it.kind==="lesson"||it.url); }); });
    }
    /* step numbers follow the order you see ("Start here" isn't numbered) */
    var n=0; secs.forEach(function(s){ if(s.isStart){ s.num=0; return; } if(!s.hidden) n++; s.num=s.hidden?0:n; s.label=(s.num?"Step "+s.num+" · ":"")+s.title; });
    secs.forEach(function(s){ if(s.isStart) s.label=s.title; });

    return { product:pk, base:base, title:meta.title||base.title, subtitle:meta.subtitle||"", thumb:meta.thumb_url||"", meta:meta, sections:secs };
  };
})();
