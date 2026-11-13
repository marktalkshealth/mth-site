/* =================================================================
   ADMIN — TESTS & RESULTS  (the testing lab)
   Every post on Instagram, Facebook and YouTube (auto-posted or by hand) with its numbers,
   compared at the same age (e.g. "views at 24 hours") so the comparison is fair.
   1. What the data says so far: automatic comparisons, no setup needed.
   2. Your tests: A/B experiments you set up, with a plain verdict.
   3. Every post, with a box to put it in a test.
   The numbers are collected on the server every 15 minutes (Supabase function mth-social, lab.ts).
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb;
  var PL={ instagram:"Instagram", facebook:"Facebook", youtube:"YouTube" };
  var METRICS=[["views","Views"],["reach","People reached"],["likes","Likes"],["comments","Comments"],["shares","Shares"],["saves","Saves"],["avg_watch_sec","Average watch time (sec)"],["engagement","Likes + comments + shares + saves"],["eng_rate","Engagement per 100 views"]];
  var AGES=[[1,"1 hour"],[6,"6 hours"],[24,"24 hours"],[48,"48 hours"],[168,"7 days"],[0,"Right now (unfair for new posts)"]];
  var MIN=8;   /* posts needed in a group before a comparison means much */
  var H=24, metric="views", plat="";
  try{ var sv=JSON.parse(localStorage.getItem("mth_lab")||"{}"); if(sv.H!=null) H=sv.H; if(sv.metric) metric=sv.metric; if(sv.plat!=null) plat=sv.plat; }catch(e){}
  function keep(){ try{ localStorage.setItem("mth_lab",JSON.stringify({ H:H, metric:metric, plat:plat })); }catch(e){} }
  function mName(k){ for(var i=0;i<METRICS.length;i++) if(METRICS[i][0]===k) return METRICS[i][1]; return k; }
  function aName(h){ for(var i=0;i<AGES.length;i++) if(AGES[i][0]===h) return AGES[i][1]; return h+" hours"; }

  /* ---------- the maths ---------- */
  function val(r,m){
    if(m==="engagement"||m==="eng_rate"){ if(r.likes==null&&r.comments==null) return null; var e=(+r.likes||0)+(+r.comments||0)+(+r.shares||0)+(+r.saves||0);
      if(m==="engagement") return e; return r.views>0?100*e/r.views:null; }
    return r[m]==null?null:Number(r[m]);
  }
  function median(a){ if(!a.length) return null; var s=a.slice().sort(function(x,y){ return x-y; }), n=s.length; return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; }
  function mean(a){ if(!a.length) return null; return a.reduce(function(x,y){ return x+y; },0)/a.length; }
  function erf(x){ var s=x<0?-1:1; x=Math.abs(x); var t=1/(1+0.3275911*x); var y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; }
  /* Mann–Whitney U: are two groups really different, or is it luck? Works for lopsided numbers like views. Returns the chance (0–1) that a gap this big is luck. */
  function luck(a,b){
    var n1=a.length, n2=b.length; if(n1<2||n2<2) return null;
    var all=a.map(function(v){ return [v,0]; }).concat(b.map(function(v){ return [v,1]; })).sort(function(x,y){ return x[0]-y[0]; });
    var ranks=new Array(all.length), i=0, ties=0;
    while(i<all.length){ var j=i; while(j+1<all.length&&all[j+1][0]===all[i][0]) j++; var r=(i+j)/2+1; for(var k=i;k<=j;k++) ranks[k]=r; var t=j-i+1; ties+=t*t*t-t; i=j+1; }
    var R1=0; for(i=0;i<all.length;i++) if(all[i][1]===0) R1+=ranks[i];
    var U=R1-n1*(n1+1)/2, N=n1+n2, mu=n1*n2/2, sd=Math.sqrt(n1*n2/12*((N+1)-ties/(N*(N-1))));
    if(!sd) return 1;
    var z=(Math.abs(U-mu)-0.5)/sd; if(z<0) z=0;
    return Math.max(0,Math.min(1,1-erf(z/Math.SQRT2)));
  }
  function fmt(v,m){ if(v==null||isNaN(v)) return "—"; if(m==="avg_watch_sec"||m==="eng_rate") return (Math.round(v*10)/10).toLocaleString(); return Math.round(v).toLocaleString(); }
  function dur(s){ if(s==null) return ""; s=Math.round(s); return s<60?s+"s":Math.floor(s/60)+"m"+(s%60?" "+(s%60)+"s":""); }

  /* split posts into groups and describe each */
  function groups(rows,m,keyFn,order){
    var g={}; rows.forEach(function(r){ var v=val(r,m); if(v==null||!r.reached) return; var k=keyFn(r); if(k==null) return; (g[k]=g[k]||[]).push(v); });
    var keys=order?order.filter(function(k){ return g[k]; }):Object.keys(g);
    return keys.map(function(k){ return { k:k, vals:g[k], n:g[k].length, med:median(g[k]), avg:mean(g[k]) }; });
  }
  function verdict(G,m){
    if(G.length<2) return "Needs at least two groups with posts in them.";
    var s=G.slice().sort(function(a,b){ return b.med-a.med; }), a=s[0], b=s[1];
    if(a.n<MIN||b.n<MIN) return "Not enough posts yet to say. Each group needs "+MIN+" (the top two have "+a.n+" and "+b.n+").";
    var p=luck(a.vals,b.vals), lift=b.med>0?Math.round(100*(a.med-b.med)/b.med):null;
    if(p!=null&&p<0.05) return "<b>"+esc(a.k)+"</b> is ahead of "+esc(b.k)+(lift!=null?" by "+lift+"%":"")+", and the gap looks real (about "+Math.max(1,Math.round(p*100))+" in 100 chance it’s luck).";
    return "Too close to call between <b>"+esc(a.k)+"</b> and "+esc(b.k)+" so far"+(p!=null?" (about "+Math.round(p*100)+" in 100 chance the gap is luck)":"")+". Keep posting.";
  }
  function card(title,sub,G,m,noVerdict){
    var max=Math.max.apply(null,G.map(function(x){ return x.med||0; }).concat([1]));
    return '<div class="card panel" style="margin-bottom:12px"><h3>'+esc(title)+'</h3>'+(sub?'<p class="small" style="margin:0 0 8px">'+sub+'</p>':'')+
      (G.length?'<table class="ct" style="cursor:default"><thead><tr><th>Group</th><th>Posts</th><th>Typical</th><th style="width:40%"></th><th>Average</th></tr></thead><tbody>'+
        G.map(function(x){ return '<tr style="cursor:default'+(x.n<MIN?';opacity:.55':'')+'"><td><b>'+esc(x.k)+'</b></td><td>'+x.n+'</td><td>'+fmt(x.med,m)+'</td><td><span style="display:block;height:10px;border-radius:6px;background:var(--terra);width:'+Math.max(2,100*(x.med||0)/max)+'%"></span></td><td class="small">'+fmt(x.avg,m)+'</td></tr>'; }).join("")+
        '</tbody></table>'+(noVerdict?'':'<p class="small" style="margin:8px 0 0">'+verdict(G,m)+'</p>')
        :'<p class="small">No posts in this view yet.</p>')+'</div>';
  }
  var GAP=["Under 1 hour","1–3 hours","3–6 hours","6–12 hours","12–24 hours","Over a day"];
  function gapK(r){ var g=r.gap_hours; if(g==null) return null; g=Number(g); return g<1?GAP[0]:g<3?GAP[1]:g<6?GAP[2]:g<12?GAP[3]:g<24?GAP[4]:GAP[5]; }
  var TOD=["Early morning (5–9)","Late morning (9–12)","Afternoon (12–5)","Evening (5–9)","Night (9–5)"];
  function todK(r){ var h=r.local_hour; if(h==null) return null; return h>=5&&h<9?TOD[0]:h>=9&&h<12?TOD[1]:h>=12&&h<17?TOD[2]:h>=17&&h<21?TOD[3]:TOD[4]; }
  var LEN=["Under 30 sec","30–60 sec","1–3 min","3–10 min","Over 10 min"];
  function lenK(r){ var s=r.duration_sec; if(s==null) return null; s=Number(s); return s<30?LEN[0]:s<60?LEN[1]:s<180?LEN[2]:s<600?LEN[3]:LEN[4]; }
  var DOW=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  A.screen("lab",{ nav:"Tests & results", group:"Growing", live:true,
    help:"Your testing lab. It records every post’s numbers and compares posts at the same age, so a post from an hour ago isn’t judged against one from last week. The top half needs no setup. To run your own A/B test, make a test and put posts into its groups.",
    render: async function(V){
      var res=await Promise.all([
        MTH.sb.rpc("mth_lab_items",{ p_hours:H, p_days:90 }),
        sb.from("mth_experiments").select("*").order("created_at",{ ascending:false }),
        sb.from("mth_social_settings").select("poll_state,metrics_enabled,fb_page_id,yt_channel_id").eq("id",1).maybeSingle()
      ]);
      if(res[0].error){ V.innerHTML='<div class="adm-h"><div><div class="kick">Social</div><h1>Tests &amp; results</h1></div></div><div class="card panel"><h3>Not switched on yet</h3><p class="small">'+esc(res[0].error.message||"")+'</p></div>'; return; }
      var all=res[0].data||[], EX=res[1].data||[], S=(res[2]&&res[2].data)||{}, ps=S.poll_state||{};
      var rows=plat?all.filter(function(r){ return r.platform===plat; }):all;
      var connected=!!(S.fb_page_id||S.yt_channel_id), errs=ps.lab_errors||{}, bad=ps.lab_bad||{};
      var counted=rows.filter(function(r){ return r.reached&&val(r,metric)!=null; }).length;
      var running=EX.filter(function(e){ return e.status==="running"; });
      /* tests are judged on their own number and age, so fetch those ages too */
      var byH={}; byH[H]=all;
      var need=[]; EX.forEach(function(e){ if(byH[e.at_hours]===undefined&&need.indexOf(e.at_hours)<0) need.push(e.at_hours); });
      var extra=await Promise.all(need.map(function(h){ return MTH.sb.rpc("mth_lab_items",{ p_hours:h, p_days:365 }); }));
      need.forEach(function(h,i){ byH[h]=(extra[i]&&extra[i].data)||[]; });

      function exCard(e){
        var vs=e.variants||[], R=(byH[e.at_hours]||[]).filter(function(r){ return r.experiment_id===e.id; });
        var lab={}; vs.forEach(function(v){ lab[v.key]=v.label||v.key; });
        var G=groups(R,e.metric,function(r){ return r.variant&&lab[r.variant]?lab[r.variant]:null; },vs.map(function(v){ return v.label||v.key; }));
        var waiting=R.filter(function(r){ return !r.reached; }).length;
        return '<div data-ex="'+e.id+'">'+card(e.name+(e.status==="done"?" · finished":""),(e.question?esc(e.question)+'<br>':'')+'Judged on <b>'+esc(mName(e.metric))+'</b> at <b>'+esc(aName(e.at_hours))+'</b> · '+R.length+' post'+(R.length===1?'':'s')+' in this test'+(waiting?' · '+waiting+' still too new to count':'')+' · <a href="#" data-edit="'+e.id+'">Edit</a>',G,e.metric)+'</div>';
      }
      function optFor(r){
        var o='<option value="">No test</option>';
        running.concat(EX.filter(function(e){ return e.status!=="running"&&e.id===r.experiment_id; })).forEach(function(e){ (e.variants||[]).forEach(function(v){ var on=r.experiment_id===e.id&&r.variant===v.key; o+='<option value="'+e.id+'|'+esc(v.key)+'"'+(on?' selected':'')+'>'+esc(e.name)+' · '+esc(v.label||v.key)+'</option>'; }); });
        return o;
      }
      function postRow(r){
        return '<tr style="cursor:default"><td style="width:54px">'+(r.thumb_url?'<img src="'+esc(r.thumb_url)+'" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:46px;height:46px;object-fit:cover;border-radius:6px;background:var(--bg2)" onerror="this.style.visibility=\'hidden\'">':'')+'</td>'+
          '<td style="max-width:320px"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.permalink?'<a href="'+esc(r.permalink)+'" target="_blank" rel="noopener">'+esc(r.title||"(no caption)")+'</a>':esc(r.title||"(no caption)"))+'</b>'+
            '<span class="small">'+A.when(r.posted_at,true)+(r.duration_sec!=null?' · '+dur(r.duration_sec):'')+'</span></td>'+
          '<td><span class="pill">'+esc(PL[r.platform]||r.platform)+'</span><span class="pill'+(r.via==="auto"?' own':'')+'">'+(r.via==="auto"?'Automatic':'By hand')+'</span>'+(r.kind?'<span class="pill">'+esc(r.kind)+'</span>':'')+'</td>'+
          (r.reached?'<td><b>'+fmt(r.views,"views")+'</b></td><td>'+fmt(r.likes)+'</td><td>'+fmt(r.comments)+'</td><td class="hm">'+fmt(r.shares)+'</td><td class="hm">'+fmt(r.saves)+'</td><td class="hm">'+fmt(r.avg_watch_sec,"avg_watch_sec")+'</td>'
            :'<td colspan="6" class="small">Too new for '+esc(aName(H))+' · '+fmt(r.latest_views,"views")+' views so far</td>')+
          '<td><select class="sel" data-assign="'+r.id+'" style="max-width:190px">'+optFor(r)+'</select></td></tr>';
      }

      V.innerHTML='<div class="adm-h"><div><div class="kick">Social</div><h1>Tests &amp; results</h1></div><div class="acts"><button class="b sm ghost" id="lrun">Refresh the numbers now</button><button class="b sm" id="exnew">New test</button></div></div>'+
        '<div class="bar"><span class="small">Compare posts at</span><select class="sel" id="lh">'+AGES.map(function(a){ return '<option value="'+a[0]+'"'+(a[0]===H?' selected':'')+'>'+a[1]+'</option>'; }).join("")+'</select>'+
          '<span class="small">on</span><select class="sel" id="lm">'+METRICS.map(function(m){ return '<option value="'+m[0]+'"'+(m[0]===metric?' selected':'')+'>'+m[1]+'</option>'; }).join("")+'</select>'+
          '<select class="sel" id="lp"><option value="">All platforms</option>'+Object.keys(PL).map(function(k){ return '<option value="'+k+'"'+(plat===k?' selected':'')+'>'+PL[k]+'</option>'; }).join("")+'</select>'+
          '<span class="small">'+rows.length+' post'+(rows.length===1?'':'s')+' in the last 90 days · '+counted+' old enough to count</span></div>'+
        '<p class="small" style="margin:-4px 0 12px">'+(ps.lab_at?'Numbers last collected '+A.when(new Date(Number(ps.lab_at)).toISOString(),true)+'. Collected every 15 minutes.':(connected?'The first collection happens within 15 minutes.':'Nothing is connected yet, so there is nothing to collect. Connect your accounts in <a href="#autopost">Auto-post &amp; DMs</a>.'))+'</p>'+
        Object.keys(errs).map(function(k){ return '<div class="msg err">'+esc(PL[k]||k)+': '+esc(errs[k])+'</div>'; }).join("")+
        (ps.yt_no_analytics?'<div class="msg info">YouTube watch time isn’t coming in yet: turn on the YouTube Analytics API (step in Auto-post &amp; DMs), then reconnect YouTube. Views, likes and comments are unaffected.</div>':'')+
        (Object.keys(bad).length?'<p class="small">Numbers the platforms no longer hand out (skipped): '+esc(Object.keys(bad).map(function(k){ return bad[k].join(", "); }).filter(Boolean).join(", "))+'</p>':'')+

        (rows.length?'':'<div class="card panel"><h3>No results yet</h3><p class="small">Once your accounts are connected, every post on them shows up here by itself, including ones you post by hand. Comparisons start to mean something after about '+MIN+' posts in each group.</p></div>')+

        '<div class="sec-h">1 · What the data says so far · '+esc(mName(metric))+' at '+esc(aName(H))+'</div>'+
        '<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(420px,1fr))">'+
          card("Posted by hand vs automatically","Do posts sent by this system get treated differently from ones you post yourself? Check this first.",groups(rows,metric,function(r){ return r.via==="auto"?"Automatic":"By hand"; },["By hand","Automatic"]),metric)+
          card("Time since your previous post","How long you waited after the post before it, on the same platform. This is your posting-frequency answer.",groups(rows,metric,gapK,GAP),metric)+
          card("Time of day","When it went out, US Central time.",groups(rows,metric,todK,TOD),metric)+
          card("Video length","Length is known for YouTube; Instagram and Facebook don’t report it.",groups(rows,metric,lenK,LEN),metric)+
          card("Day of the week","",groups(rows,metric,function(r){ return r.local_dow?DOW[r.local_dow-1]:null; },DOW),metric)+
          card("Kind of post","",groups(rows,metric,function(r){ return r.kind||null; }),metric)+
        '</div><p class="small">“Typical” is the middle post (the median), which one viral post can’t distort. Faded rows have fewer than '+MIN+' posts. These comparisons show what went together, not proof of cause: a real test (below) changes one thing on purpose.</p>'+

        '<div class="sec-h">2 · Your tests</div>'+
        (EX.length?'<div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(420px,1fr))">'+EX.map(exCard).join("")+'</div>'
          :'<div class="card panel"><p class="small" style="margin:0">No tests yet. Press <b>New test</b>, name the groups (for example “Every 2 hours” and “Every 6 hours”), then put posts into each group in the list below, or on a planned post before it goes out. Change only one thing between the groups.</p></div>')+

        '<div class="sec-h">3 · Every post · numbers at '+esc(aName(H))+'</div>'+
        '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th></th><th>Post</th><th>Where</th><th>Views</th><th>Likes</th><th>Comments</th><th class="hm">Shares</th><th class="hm">Saves</th><th class="hm">Avg watch (s)</th><th>Test group</th></tr></thead><tbody>'+
          (rows.slice(0,150).map(postRow).join("")||'<tr style="cursor:default"><td colspan="10" class="muted" style="padding:16px">Nothing collected yet.</td></tr>')+'</tbody></table></div>'+
        (rows.length>150?'<p class="small">Showing the newest 150 of '+rows.length+'.</p>':'');

      var $=function(id){ return document.getElementById(id); };
      $("lh").onchange=function(){ H=Number(this.value); keep(); A.refresh(); };
      $("lm").onchange=function(){ metric=this.value; keep(); A.refresh(); };
      $("lp").onchange=function(){ plat=this.value; keep(); A.refresh(); };
      $("lrun").onclick=async function(){ this.disabled=true; this.textContent="Collecting…"; var r=await MTH.fn("mth-social",{ action:"lab_run" }); this.disabled=false; this.textContent="Refresh the numbers now";
        if(!r||r.error) return MTH.toast(r&&(r.message||r.error)||"That didn’t work",6000);
        var x=r.result||{}, n=0; ["instagram","facebook","youtube"].forEach(function(k){ if(x[k]) n+=x[k].recorded||0; }); MTH.toast(n?n+" post"+(n===1?"":"s")+" updated":"Nothing new to record right now",4000); A.refresh(); };
      V.querySelectorAll("[data-assign]").forEach(function(s){ s.onchange=async function(){ var v=s.value.split("|");
        var r=await sb.from("mth_social_items").update({ experiment_id:v[0]?Number(v[0]):null, variant:v[0]?v.slice(1).join("|"):null }).eq("id",Number(s.dataset.assign));
        if(r.error) return MTH.toast("Couldn’t save: "+r.error.message,5000); MTH.toast(v[0]?"Added to the test":"Taken out of the test"); A.refresh(); }; });

      function exDialog(e){
        var isNew=!e; e=e||{ name:"", question:"", metric:metric==="eng_rate"?"views":metric, at_hours:H||24, variants:[{key:"A",label:""},{key:"B",label:""}], status:"running" };
        var m=document.createElement("div"); m.className="mx-modal";
        m.innerHTML='<div class="box" style="max-width:560px"><h3 style="font-family:var(--sans);font-size:20px;font-weight:700">'+(isNew?'New test':'Edit test')+'</h3>'+
          '<div class="field"><label>Name</label><input class="inp" id="en" maxlength="120" value="'+esc(e.name)+'" placeholder="Every 2 hours vs every 6 hours"></div>'+
          '<div class="field"><label>The question (optional)</label><input class="inp" id="eq" maxlength="300" value="'+esc(e.question||"")+'" placeholder="Does posting more often cut views per post?"></div>'+
          '<div class="field"><label>Groups, one per line (2 to 6). Change only one thing between them.</label><textarea class="inp" id="ev" style="min-height:96px" placeholder="Every 2 hours&#10;Every 6 hours">'+esc((e.variants||[]).map(function(v){ return v.label||""; }).join("\n"))+'</textarea></div>'+
          '<div style="display:grid;gap:10px;grid-template-columns:1fr 1fr"><div class="field"><label>Judge it on</label><select class="sel" id="em">'+METRICS.map(function(x){ return '<option value="'+x[0]+'"'+(x[0]===e.metric?' selected':'')+'>'+x[1]+'</option>'; }).join("")+'</select></div>'+
          '<div class="field"><label>Measured at</label><select class="sel" id="eh">'+AGES.filter(function(a){ return a[0]>0; }).map(function(a){ return '<option value="'+a[0]+'"'+(a[0]===e.at_hours?' selected':'')+'>'+a[1]+' after posting</option>'; }).join("")+'</select></div></div>'+
          (isNew?'':'<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="ed"'+(e.status==="done"?' checked':'')+' style="width:18px;height:18px;accent-color:var(--terra)"> This test is finished</label>')+
          '<div class="acts"><button class="b sm" data-save>Save</button>'+(isNew?'':'<button class="b sm ghost" data-del>Delete</button>')+'<button class="b sm ghost" data-x>Cancel</button></div></div>';
        document.body.appendChild(m);
        var g=function(id){ return m.querySelector("#"+id); };
        m.addEventListener("click",function(ev){ if(ev.target===m||ev.target.hasAttribute("data-x")) m.remove(); });
        m.querySelector("[data-save]").onclick=async function(){
          var labels=g("ev").value.split("\n").map(function(x){ return x.trim(); }).filter(Boolean).slice(0,6);
          if(!g("en").value.trim()) return MTH.toast("Give the test a name");
          if(labels.length<2) return MTH.toast("A test needs at least 2 groups");
          /* keep each group's letter when it is only renamed, so posts already in it stay put */
          var old=e.variants||[], vs=labels.map(function(l,i){ return { key:(old[i]&&old[i].key)||"ABCDEF".charAt(i), label:l }; });
          var row={ name:g("en").value.trim(), question:g("eq").value.trim()||null, metric:g("em").value, at_hours:Number(g("eh").value), variants:vs, status:(g("ed")&&g("ed").checked)?"done":"running", updated_at:new Date().toISOString() };
          var r=isNew?await sb.from("mth_experiments").insert(row):await sb.from("mth_experiments").update(row).eq("id",e.id);
          if(r.error) return MTH.toast("Couldn’t save: "+r.error.message,5000);
          m.remove(); MTH.toast("Saved"); A.refresh(); };
        var del=m.querySelector("[data-del]"); if(del) del.onclick=async function(){ if(!confirm("Delete the test “"+e.name+"”? The posts and their numbers stay.")) return; var r=await sb.from("mth_experiments").delete().eq("id",e.id); if(r.error) return MTH.toast("Couldn’t delete"); m.remove(); A.refresh(); };
      }
      $("exnew").onclick=function(){ exDialog(); };
      V.querySelectorAll("[data-edit]").forEach(function(a){ a.onclick=function(ev){ ev.preventDefault(); var e=EX.filter(function(x){ return String(x.id)===a.dataset.edit; })[0]; if(e) exDialog(e); }; });
    }});
  /* exposed for checking the maths */
  A._lab={ median:median, luck:luck, groups:groups };
})();
