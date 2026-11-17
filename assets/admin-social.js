/* =================================================================
   ADMIN — AUTO-POST & DMs  (your own Metricool)
   1. Auto-post: a post you ticked "Auto-post" on goes to Instagram and your Facebook Page at its publish time.
   2. Auto-DMs: someone comments a keyword (GUT …) and gets your link in a private message.
      On YouTube (no DMs there) they get a public reply.
   Everything is OFF until you connect your accounts and flip the switches on this screen.
   The work itself happens on the server (Supabase function mth-social, every 2 minutes).
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb;
  var PL={ instagram:"Instagram", facebook:"Facebook", youtube:"YouTube", tiktok:"TikTok", threads:"Threads" };
  var AUTO=["instagram","facebook"];
  function dot(on){ return '<span class="status-dot'+(on?' on':'')+'"></span>'; }
  function fn(body){ return MTH.fn("mth-social",body); }
  function link(href,text){ return '<a href="'+href+'" target="_blank" rel="noopener">'+text+'</a>'; }
  function pillFor(st){
    var s=(st&&st.status)||"";
    if(s==="posted") return '<span class="pill own">Posted</span>';
    if(s==="processing"||s==="publishing") return '<span class="pill list">Sending…</span>';
    if(s==="failed") return '<span class="pill tag">Didn’t post</span>';
    if(s==="check") return '<span class="pill tag">Check it</span>';
    return '<span class="pill">Waiting</span>';
  }
  function sw(id,on,label,sub){ return '<label class="card" style="display:flex;gap:12px;align-items:center;padding:12px 14px;cursor:pointer;flex:1 1 260px">'+
    '<input type="checkbox" id="'+id+'"'+(on?' checked':'')+' style="width:22px;height:22px;accent-color:var(--terra)">'+
    '<span><b style="display:block">'+label+' '+(on?'ON':'OFF')+'</b><span class="small">'+sub+'</span></span></label>'; }

  A.screen("autopost",{ nav:"Auto-post & DMs", group:"Growing", live:true,
    help:"Your own Metricool. Connect your accounts once, then tick Auto-post on any post and it goes out at its publish time. Add comment keywords and people who comment them get your link by private message.",
    render: async function(V){
      /* back from Google's YouTube sign-in? */
      var q=new URLSearchParams(location.search);
      if(q.get("yt")){ MTH.toast(q.get("yt")==="ok"?"YouTube connected: "+(q.get("m")||""):"YouTube didn’t connect: "+(q.get("m")||""),7000); history.replaceState(null,"",location.pathname+location.hash); }

      var st=await fn({ action:"status" });
      if(!st||!st.ok){
        V.innerHTML='<div class="adm-h"><div><div class="kick">Social</div><h1>Auto-post &amp; DMs</h1></div></div>'+
          '<div class="card panel"><h3>Almost ready</h3><p class="small">The screen is built, but the engine behind it isn’t switched on in the database yet'+(st&&st.error?' ('+esc(st.error)+')':'')+'. Tell Claude “finish the auto-post setup” and it takes a couple of minutes.</p></div>';
        return;
      }
      var S=st.settings||{}, ps=S.poll_state||{}, perr=ps.errors||{};
      var res=await Promise.all([
        sb.from("mth_posts").select("id,title,status,format,platforms,publish_at,publish_state,media_urls").eq("auto_publish",true).order("publish_at",{ ascending:false }).limit(40),
        sb.from("mth_dm_keywords").select("*").order("created_at",{ ascending:true }),
        sb.from("mth_dm_log").select("*").order("created_at",{ ascending:false }).limit(40)
      ]);
      var posts=(res[0].data||[]), words=(res[1].data||[]), log=(res[2].data||[]);
      var now=Date.now();
      var upcoming=posts.filter(function(p){ return p.publish_at&&new Date(p.publish_at)>now&&p.status!=="posted"; }).reverse();
      var past=posts.filter(function(p){ return !(p.publish_at&&new Date(p.publish_at)>now&&p.status!=="posted"); });
      var problems=past.filter(function(p){ var s=p.publish_state||{}; return Object.keys(s).some(function(k){ return s[k]&&(s[k].status==="failed"||s[k].status==="check"); }); }).length;
      A.badge("studio",problems||0);

      function postRow(p){
        var s=p.publish_state||{}, late=p.publish_at&&p.status!=="posted"&&(now-new Date(p.publish_at))>864e5&&!Object.keys(s).length;
        var plats=(p.platforms||[]).map(function(pl){
          if(AUTO.indexOf(pl)<0) return '<div class="small">'+PL[pl]+': by hand or Metricool</div>';
          var x=s[pl]||{};
          return '<div style="margin:2px 0"><b style="font-weight:600">'+PL[pl]+'</b> '+(late?'<span class="pill tag">Missed</span>':pillFor(x))+
            (x.url?' '+link(esc(x.url),"Open"):'')+
            (x.status==="failed"||x.status==="check"?' <button class="b sm ghost" data-retry="'+p.id+'" data-pl="'+pl+'" style="min-height:28px;padding:2px 10px">Retry</button>':'')+
            (x.error?'<div class="small" style="color:#7e3b25">'+esc(x.error)+'</div>':'')+(x.note?'<div class="small">'+esc(x.note)+'</div>':'')+'</div>';
        }).join("");
        return '<tr data-post="'+p.id+'"><td><b>'+esc(p.title)+'</b><br><span class="small">'+(p.publish_at?A.when(p.publish_at,true):"No date")+((p.media_urls||[]).length?'':' · no media yet')+'</span></td><td>'+plats+'</td></tr>';
      }
      function table(list,empty){ return '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Post</th><th>Where it’s going</th></tr></thead><tbody>'+(list.map(postRow).join("")||'<tr><td colspan="2" class="muted" style="padding:16px">'+empty+'</td></tr>')+'</tbody></table></div>'; }

      /* the 5 topic brands: each has its own Facebook Page + Instagram (found automatically) and its own YouTube channel */
      function brandsCard(list, ytClient){
        var rows=list.map(function(b){
          var e=(b.poll_state||{}).errors||{}, le=(b.poll_state||{}).lab_errors||{}, errs=Object.keys(e).concat(Object.keys(le).filter(function(k){ return !e[k]; }));
          return '<tr data-brand="'+esc(b.slug)+'"><td><b>'+esc(b.label)+'</b></td>'+
            '<td>'+dot(b.meta_connected)+(b.fb_page_id?esc(b.fb_page_name||"Page"):'<span class="small">Page not visible yet</span>')+'</td>'+
            '<td>'+dot(!!b.ig_id&&b.meta_connected)+(b.ig_username?'@'+esc(b.ig_username):'<span class="small">not linked</span>')+'</td>'+
            '<td>'+dot(b.yt_connected)+(b.yt_connected?esc(b.yt_channel_title||"Channel"):'<span class="small">not connected</span>')+'</td>'+
            '<td style="white-space:nowrap">'+(b.yt_connected?'<button class="b sm ghost" data-ytoff style="min-height:28px;padding:2px 10px">Disconnect YouTube</button>':'<button class="b sm" data-ytgo'+(ytClient?'':' disabled')+' style="min-height:28px;padding:2px 10px">Connect YouTube</button>')+
            ' <button class="b sm ghost" data-btest style="min-height:28px;padding:2px 10px">Test</button></td></tr>'+
            (errs.length?'<tr><td colspan="5" class="small" style="color:#7e3b25;padding-top:0">'+errs.map(function(k){ return esc(PL[k]||k)+': '+esc(e[k]||le[k]); }).join(" · ")+'</td></tr>':'')+
            '<tr class="hidden" data-bres="'+esc(b.slug)+'"><td colspan="5"></td></tr>';
        }).join("");
        return '<div class="card panel" style="margin-bottom:12px"><h3>Topic brands</h3>'+
          '<p class="small">Every brand runs on the same switches and comment keywords as Mark Talks Health. Facebook Pages and their Instagram accounts are picked up by themselves (every 30 minutes) once the Page is given to your system user. YouTube: press Connect, then pick that brand’s channel when Google asks.</p>'+
          '<div style="overflow:auto"><table class="ct"><thead><tr><th>Brand</th><th>Facebook</th><th>Instagram</th><th>YouTube</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
          '<div class="acts"><button class="b sm ghost" id="bsync">Look for new Pages now</button></div></div>';
      }

      var metaSteps='<ol class="step-list">'+
        '<li>Open '+link("https://developers.facebook.com/apps/","your Meta app")+' and switch it from Development to <b>Live</b> (top of the page). Posts from an app that isn’t Live are only visible to you.</li>'+
        '<li>Open '+link("https://business.facebook.com/settings/system-users?business_id=931066053191224","Business settings → System users")+'. Pick your system user (or add one, role Admin).</li>'+
        '<li>Press <b>Assign assets</b> and give it your <b>Facebook Page</b> (full control) and your <b>Instagram account</b>.</li>'+
        '<li>Press <b>Generate token</b>, choose your app, set it to <b>never expire</b>, and tick these 11: <code>pages_show_list</code>, <code>pages_read_engagement</code>, <code>pages_manage_posts</code>, <code>pages_manage_engagement</code>, <code>pages_messaging</code>, <code>instagram_basic</code>, <code>instagram_content_publish</code>, <code>instagram_manage_comments</code>, <code>instagram_manage_messages</code>, <code>instagram_manage_insights</code>, <code>read_insights</code>. (The last two let your <a href="#lab">Tests &amp; results</a> screen read views and watch time.)</li>'+
        '<li>Copy the token, paste it below and press Connect.</li>'+
        '<li>On your phone: Instagram → Settings → Messages and story replies → Message controls → <b>Allow access to messages</b> = on. (Needed for the auto-DMs.)</li></ol>';
      var ytSteps='<ol class="step-list">'+
        '<li>Open '+link("https://console.cloud.google.com/apis/library/youtube.googleapis.com","YouTube Data API")+' (project “Mark Talks Health”) and press <b>Enable</b>. Then do the same for '+link("https://console.cloud.google.com/apis/library/youtubeanalytics.googleapis.com","YouTube Analytics API")+' (that one gives watch time).</li>'+
        '<li>Open '+link("https://console.cloud.google.com/auth/clients","Google sign-in clients")+' → <b>Create client</b> → Web application. Under “Authorized redirect URIs” paste this exactly:</li></ol>'+
        '<div class="code-box" id="ru">'+esc(st.redirect_uri||"")+'</div><ol class="step-list" start="3">'+
        '<li>Open '+link("https://console.cloud.google.com/auth/audience","Audience")+' and press <b>Publish app</b>, so the sign-in doesn’t run out every 7 days.</li>'+
        '<li>Paste the client ID and client secret below, press Save, then Connect YouTube and pick your channel. Google will warn the app isn’t verified: press Advanced → Continue (it’s your own app).</li></ol>';

      V.innerHTML='<div class="adm-h"><div><div class="kick">Social</div><h1>Auto-post &amp; DMs</h1></div><div class="acts"><button class="b sm ghost" id="run">Run now</button><a class="b sm ghost" href="#lab">Tests &amp; results</a><a class="b sm" href="#studio">Posts</a></div></div>'+
        '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">'+
          sw("swp",!!S.enabled,"Auto-posting is","Posts you ticked Auto-post on go out at their publish time.")+
          sw("swd",!!S.dm_enabled,"Auto-DMs are","Keyword comments get your link. Only comments made after you switch this on.")+'</div>'+
        '<p class="small" style="margin:-4px 0 14px">'+(S.last_tick_at?'Last check: '+A.when(S.last_tick_at,true)+'. It checks every 2 minutes while a switch is on.':'It hasn’t run yet. It checks every 2 minutes once a switch is on.')+'</p>'+
        Object.keys(perr).map(function(k){ return '<div class="msg err">'+esc(PL[k]||k)+' comments: '+esc(perr[k])+'</div>'; }).join("")+

        '<div class="sec-h">1 · Connections</div>'+
        '<div class="card panel" style="margin-bottom:12px"><h3>'+dot(st.meta_connected)+'Facebook Page + Instagram</h3>'+
          (st.meta_connected?'<p class="small">Connected to <b>'+esc(S.fb_page_name||"your Page")+'</b>'+(S.ig_username?' and Instagram <b>@'+esc(S.ig_username)+'</b>':' · <b>no Instagram account is linked to this Page</b> (link it in Instagram → Settings → Accounts Center, then reconnect)')+'.</p>'+
            (S.meta_note?'<div class="msg info">'+esc(S.meta_note)+'</div>':'')+
            '<div class="acts"><button class="b sm ghost" id="mtest">Test the connection</button><button class="b sm ghost" id="mre">Use a new token</button><button class="b sm ghost" id="moff">Disconnect</button></div><div id="mres"></div>'
            :'<p class="small">One token covers both. About 10 minutes, once.</p>'+metaSteps)+
          '<div id="mform"'+(st.meta_connected?' class="hidden"':'')+'><div class="addrow"><input class="inp" id="mtok" type="password" autocomplete="off" placeholder="Paste the token (starts with EAA…)"><button class="b sm" id="mgo">Connect</button></div><div id="mpages"></div></div></div>'+
        '<div class="card panel" style="margin-bottom:12px"><h3>'+dot(st.yt_connected)+'YouTube (comment replies)</h3>'+
          (st.yt_connected?'<p class="small">Connected to <b>'+esc(S.yt_channel_title||"your channel")+'</b>. Keyword comments get a public reply with your link (YouTube has no private messages).</p><div class="acts"><button class="b sm ghost" id="yoff">Disconnect</button></div>'
            :'<p class="small">YouTube has no private messages, so here a keyword comment gets a <b>public reply</b> with your link.</p>'+ytSteps+
             '<div class="addrow"><input class="inp" id="yid" autocomplete="off" placeholder="Client ID (ends in .apps.googleusercontent.com)"><input class="inp" id="ysec" type="password" autocomplete="off" placeholder="Client secret"><button class="b sm ghost" id="ysave">Save</button><button class="b sm" id="ygo"'+(st.yt_client?'':' disabled')+'>Connect YouTube</button></div>')+
          '</div>'+
        (st.yt_connected?'<div class="card panel" style="margin-bottom:12px" id="ytup"><h3>'+dot(true)+'Upload a video to YouTube</h3>'+
          '<p class="small">Sends a finished video straight to <b>'+esc(S.yt_channel_title||"your channel")+'</b> with its title, description, tags and thumbnail. Pick Public, Unlisted or Private below; YouTube keeps the setting you choose (tested Nov 17 2026).</p>'+
          '<div class="field"><label>Video file</label><input class="inp" id="yuf" type="file" accept="video/*"></div>'+
          '<div class="field"><label>Title (up to 100 characters)</label><input class="inp" id="yut" maxlength="100"></div>'+
          '<div class="field"><label>Description</label><textarea class="inp" id="yud" rows="4" maxlength="5000"></textarea></div>'+
          '<div class="field"><label>Tags (separate with commas)</label><input class="inp" id="yug" placeholder="gut health, high protein"></div>'+
          '<div class="field"><label>Thumbnail (optional · JPG or PNG under 2 MB)</label><input class="inp" id="yui" type="file" accept="image/jpeg,image/png"></div>'+
          '<div class="addrow"><select class="inp" id="yup" style="max-width:200px"><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select>'+
          '<label class="small" style="display:flex;align-items:center;gap:6px">Publish at (optional) <input class="inp" id="yuw" type="datetime-local" style="max-width:240px"></label>'+
          '<button class="b sm" id="yugo">Upload to YouTube</button></div>'+
          '<div id="yures" style="margin-top:10px"></div></div>':'')+
        brandsCard(st.brands||[], !!st.yt_client)+

        '<div class="sec-h">2 · Going out next</div>'+table(upcoming,'Nothing is set to auto-post. Open a post, tick <b>Auto-post</b>, give it a publish time and Save.')+
        '<div class="sec-h">3 · What happened</div>'+table(past.slice(0,20),'Nothing has gone out yet.')+

        '<div class="sec-h">4 · Comment keywords</div>'+
        '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Keyword</th><th>Private message they get</th><th>Where</th><th>Sent</th><th></th></tr></thead><tbody>'+
          (words.map(function(k){ return '<tr data-kw="'+k.id+'"><td><b>'+esc(k.keyword)+'</b>'+(k.active?'':' <span class="pill">Paused</span>')+'</td><td class="small" style="max-width:420px">'+esc(k.dm_text)+(k.public_reply?'<br>Public reply: '+esc(k.public_reply):'')+'</td><td>'+(k.platforms||[]).map(function(x){ return '<span class="pill">'+(PL[x]||x)+'</span>'; }).join("")+'</td><td>'+(k.hits||0)+'</td><td><button class="b sm ghost" style="min-height:28px;padding:2px 10px">Edit</button></td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:16px">No keywords yet. Add GUT to start.</td></tr>')+
        '</tbody></table></div><div class="acts"><button class="b sm" id="kadd">Add a keyword</button></div>'+
        '<p class="small">Rules from Instagram and Facebook: one private message per comment, within 7 days of the comment. After that you can only keep messaging someone if they reply.</p>'+

        '<div class="sec-h">5 · Recent answers</div>'+
        '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>When</th><th>Where</th><th>Who</th><th>They wrote</th><th>Result</th></tr></thead><tbody>'+
          (log.map(function(l){ var ok=l.dm_ok===true||(l.dm_ok===null&&l.public_ok===true);
            return '<tr><td class="small">'+A.when(l.created_at,true)+'</td><td>'+esc(PL[l.platform]||l.platform)+'</td><td>'+esc(l.username||"")+'</td><td class="small">'+esc(l.comment_text||"")+'</td><td>'+(ok?'<span class="pill own">'+(l.platform==="youtube"?'Replied':'DM sent')+'</span>':'<span class="pill tag">Not sent</span>')+(l.public_ok===true&&l.platform!=="youtube"?' <span class="pill">Replied</span>':'')+(!ok&&l.detail?'<div class="small" style="color:#7e3b25">'+esc(l.detail)+'</div>':'')+'</td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:16px">No keyword comments answered yet.</td></tr>')+
        '</tbody></table></div>';

      var $=function(id){ return document.getElementById(id); };
      async function act(body,btn,okMsg){ if(btn) btn.disabled=true; var r=await fn(body); if(btn) btn.disabled=false;
        if(!r||r.error){ MTH.toast(r&&(r.message||r.error)||"That didn’t work",6000); return null; } if(okMsg) MTH.toast(okMsg); return r; }

      $("swp").onchange=async function(){ var on=this.checked;
        if(on&&!confirm("Turn auto-posting ON?\n\nFrom now on, every post with Auto-post ticked goes to Instagram and Facebook at its publish time.")){ this.checked=false; return; }
        var r=await act({ action:"set_switch", posting:on },this,on?"Auto-posting is on":"Auto-posting is off"); if(!r) this.checked=!on; A.refresh(); };
      $("swd").onchange=async function(){ var on=this.checked;
        if(on&&!confirm("Turn auto-DMs ON?\n\nFrom now on, new comments with one of your keywords get your message automatically.")){ this.checked=false; return; }
        var r=await act({ action:"set_switch", dms:on },this,on?"Auto-DMs are on":"Auto-DMs are off"); if(!r) this.checked=!on; A.refresh(); };
      $("run").onclick=async function(){ var r=await act({ action:"run_now" },this); if(r){ var x=r.result||{}, p=x.posting||{}, d=x.dms||{};
        MTH.toast("Posts sent: "+(p.posted||0)+(p.failed?" · problems: "+p.failed:"")+" · answers sent: "+((d.instagram||0)+(d.facebook||0)+(d.youtube||0)),6000); A.refresh(); } };

      /* ---- Meta ---- */
      if($("mgo")) $("mgo").onclick=async function(){ var t=$("mtok").value.trim(); if(!t) return MTH.toast("Paste the token first");
        var r=await act({ action:"meta_connect", token:t },this); if(!r) return; $("mtok").value="";
        if(r.picked){ MTH.toast("Connected to "+r.picked.name,5000); return A.refresh(); }
        $("mpages").innerHTML='<p class="small" style="margin:10px 0 4px">Which Page is Mark Talks Health?</p>'+r.pages.map(function(p){ return '<button class="b sm ghost" data-pg="'+esc(p.id)+'" style="margin:0 6px 6px 0">'+esc(p.name)+(p.ig_username?' · @'+esc(p.ig_username):' · no Instagram')+'</button>'; }).join("");
        $("mpages").querySelectorAll("[data-pg]").forEach(function(b){ b.onclick=async function(){ var x=await act({ action:"meta_pick_page", page_id:b.dataset.pg },b,"Connected"); if(x) A.refresh(); }; }); };
      if($("mre")) $("mre").onclick=function(){ $("mform").classList.remove("hidden"); $("mtok").focus(); };
      if($("moff")) $("moff").onclick=async function(){ if(!confirm("Disconnect Facebook and Instagram? Auto-posting turns off.")) return; if(await act({ action:"meta_disconnect" },this,"Disconnected")) A.refresh(); };
      if($("mtest")) $("mtest").onclick=async function(){ var r=await act({ action:"meta_test" },this); if(!r) return;
        var f=r.facebook||{}, g=r.instagram||{};
        $("mres").innerHTML='<div class="msg '+(f.ok&&g.ok?'ok':'err')+'" style="margin-top:10px">Facebook: '+(f.ok?'working · '+esc(f.name)+' · '+(f.followers||0)+' followers':'problem · '+esc(f.error))+'<br>Instagram: '+(g.ok?'working · @'+esc(g.username)+' · '+(g.followers||0)+' followers · '+(g.posts||0)+' posts':'problem · '+esc(g.error))+'</div>'; };

      /* ---- YouTube ---- */
      if($("ysave")) $("ysave").onclick=async function(){ if(await act({ action:"yt_save_client", client_id:$("yid").value, client_secret:$("ysec").value },this,"Saved. Now press Connect YouTube.")) A.refresh(); };
      if($("ygo")) $("ygo").onclick=async function(){ var r=await act({ action:"yt_auth_url" },this); if(r&&r.url) location.href=r.url; };
      if($("yoff")) $("yoff").onclick=async function(){ if(!confirm("Disconnect YouTube?")) return; if(await act({ action:"yt_disconnect" },this,"Disconnected")) A.refresh(); };
      if($("ru")) $("ru").onclick=function(){ A.copy($("ru").textContent,"Copied"); };

      /* ---- Topic brands ---- */
      if($("bsync")) $("bsync").onclick=async function(){ var r=await act({ action:"sync_brands" },this); if(r){ MTH.toast("Pages found: "+((r.pages||[]).map(function(p){ return p.name; }).join(", ")||"none"),7000); A.refresh(); } };
      V.querySelectorAll("tr[data-brand]").forEach(function(tr){
        var slug=tr.dataset.brand, go=tr.querySelector("[data-ytgo]"), off=tr.querySelector("[data-ytoff]"), test=tr.querySelector("[data-btest]");
        if(go) go.onclick=async function(){ var r=await act({ action:"brand_yt_auth_url", slug:slug },this); if(r&&r.url) location.href=r.url; };
        if(off) off.onclick=async function(){ if(!confirm("Disconnect this brand’s YouTube channel?")) return; if(await act({ action:"brand_yt_disconnect", slug:slug },this,"Disconnected")) A.refresh(); };
        if(test) test.onclick=async function(){ var r=await act({ action:"brand_test", slug:slug },this); if(!r) return;
          var line=function(n,x,ok){ return n+': '+(x&&x.ok?'working · '+esc(ok(x)):'problem · '+esc((x&&x.error)||"not connected")); };
          var out=V.querySelector('[data-bres="'+slug+'"]'); out.classList.remove("hidden");
          var all=r.facebook&&r.facebook.ok&&r.instagram&&r.instagram.ok&&r.youtube&&r.youtube.ok;
          out.firstChild.innerHTML='<div class="msg '+(all?'ok':'err')+'">'+
            line("Facebook",r.facebook,function(x){ return x.name+' · '+(x.followers||0)+' followers'; })+'<br>'+
            line("Instagram",r.instagram,function(x){ return '@'+x.username+' · '+(x.followers||0)+' followers'; })+'<br>'+
            line("YouTube",r.youtube,function(x){ return x.title+' · '+(x.subscribers||0)+' subscribers · '+(x.videos||0)+' videos'; })+'</div>'; };
      });

      /* ---- YouTube upload: the server opens the upload, the browser sends the file straight to Google ---- */
      if($("yugo")) $("yugo").onclick=async function(){
        var btn=this, out=$("yures"), f=$("yuf").files[0], thumb=$("yui").files[0];
        if(!f) return MTH.toast("Pick the video file first");
        if(!$("yut").value.trim()) return MTH.toast("Give it a title");
        if(thumb&&thumb.size>2*1024*1024) return MTH.toast("The thumbnail has to be under 2 MB");
        var when=$("yuw").value?new Date($("yuw").value).toISOString():null;
        btn.disabled=true; out.innerHTML='<div class="msg info">Getting YouTube ready…</div>';
        var r=await MTH.fn("mth-yt-upload",{ action:"start", title:$("yut").value, description:$("yud").value, tags:$("yug").value, privacy:$("yup").value, publish_at:when, size:f.size, mime:f.type||"video/mp4" });
        if(!r||r.error){ btn.disabled=false; out.innerHTML='<div class="msg err">'+esc(r&&(r.message||r.error)||"That didn’t work")+'</div>'; return; }
        var video=await new Promise(function(res){
          var x=new XMLHttpRequest(); x.open("PUT",r.upload_url); x.setRequestHeader("Content-Type",f.type||"video/mp4");
          x.upload.onprogress=function(e){ if(e.lengthComputable) out.innerHTML='<div class="msg info">Uploading… '+Math.round(e.loaded/e.total*100)+'%</div><div style="height:8px;background:var(--line);border-radius:6px;overflow:hidden"><div style="height:100%;width:'+(e.loaded/e.total*100)+'%;background:var(--terra)"></div></div>'; };
          x.onload=function(){ var j=null; try{ j=JSON.parse(x.responseText); }catch(e){} res(x.status<300&&j&&j.id?j:{ error:(j&&j.error&&j.error.message)||("YouTube said "+x.status) }); };
          x.onerror=function(){ res({ error:"The connection dropped during the upload. Try again." }); };
          x.send(f);
        });
        if(video.error){ btn.disabled=false; out.innerHTML='<div class="msg err">'+esc(video.error)+'</div>'; return; }
        var note="";
        if(thumb){ out.innerHTML='<div class="msg info">Video is up. Adding the thumbnail…</div>';
          var b64=await new Promise(function(res){ var fr=new FileReader(); fr.onload=function(){ res(String(fr.result).split(",")[1]); }; fr.readAsDataURL(thumb); });
          var t=await MTH.fn("mth-yt-upload",{ action:"thumbnail", video_id:video.id, data:b64, mime:thumb.type });
          note=t&&t.ok?" Thumbnail added.":" Thumbnail didn’t go up: "+esc(t&&(t.message||t.error)||"unknown")+". Add it in YouTube Studio.";
        }
        var st2=await MTH.fn("mth-yt-upload",{ action:"status", video_id:video.id });
        btn.disabled=false;
        out.innerHTML='<div class="msg ok">Uploaded to YouTube'+(st2&&st2.privacy?' as <b>'+esc(st2.privacy)+'</b>':'')+'.'+note+' YouTube is still processing it for a few minutes. '+
          link("https://www.youtube.com/watch?v="+encodeURIComponent(video.id),"Watch it")+' · '+link("https://studio.youtube.com/video/"+encodeURIComponent(video.id)+"/edit","Open in YouTube Studio")+'</div>';
        MTH.toast("Uploaded to YouTube",5000);
      };

      /* ---- queue ---- */
      V.querySelectorAll("[data-retry]").forEach(function(b){ b.onclick=async function(e){ e.stopPropagation();
        if(!confirm("Try this one again? Only do this if it is NOT already on "+PL[b.dataset.pl]+".")) return;
        if(await act({ action:"retry", post_id:Number(b.dataset.retry), platform:b.dataset.pl },b,"It will try again on the next check")) A.refresh(); }; });
      V.querySelectorAll("tr[data-post]").forEach(function(tr){ tr.onclick=function(e){ if(e.target.closest("a,button")) return; A.go("post/"+tr.dataset.post); }; });

      /* ---- keywords ---- */
      function kwDialog(k){
        k=k||{ keyword:"", dm_text:"", public_reply:"Sent! Check your messages.", youtube_reply:"", platforms:["instagram","facebook","youtube"], active:true };
        var m=document.createElement("div"); m.className="mx-modal";
        m.innerHTML='<div class="box" style="max-width:560px"><h3 style="font-family:var(--sans);font-size:20px;font-weight:700">'+(k.id?'Edit keyword':'New keyword')+'</h3>'+
          '<div class="field"><label>Keyword people comment (one word works best)</label><input class="inp" id="kk" maxlength="40" value="'+esc(k.keyword)+'" placeholder="GUT"></div>'+
          '<div class="field"><label>Private message they get (put your link in it)</label><textarea class="inp" id="kd" maxlength="900" style="min-height:110px" placeholder="Here’s the gut quiz I mentioned: https://marktalkshealth.com/start">'+esc(k.dm_text)+'</textarea></div>'+
          '<div class="field"><label>Public reply under their comment (optional)</label><input class="inp" id="kp" maxlength="300" value="'+esc(k.public_reply||"")+'"></div>'+
          '<div class="field"><label>YouTube reply (optional · blank = same as the private message)</label><input class="inp" id="ky" maxlength="900" value="'+esc(k.youtube_reply||"")+'"></div>'+
          '<div class="field"><label>Where</label><div class="chips" id="kpl">'+["instagram","facebook","youtube"].map(function(x){ return '<button class="chip'+((k.platforms||[]).indexOf(x)>-1?' on':'')+'" data-p="'+x+'">'+PL[x]+'</button>'; }).join("")+'</div></div>'+
          '<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="ka"'+(k.active?' checked':'')+' style="width:18px;height:18px;accent-color:var(--terra)"> Active</label>'+
          '<div class="acts"><button class="b sm" data-save>Save</button>'+(k.id?'<button class="b sm ghost" data-del>Delete</button>':'')+'<button class="b sm ghost" data-x>Cancel</button></div></div>';
        document.body.appendChild(m);
        var g=function(id){ return m.querySelector("#"+id); };
        m.querySelectorAll("#kpl [data-p]").forEach(function(c){ c.onclick=function(){ c.classList.toggle("on"); }; });
        m.addEventListener("click",function(e){ if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); });
        m.querySelector("[data-save]").onclick=async function(){
          var row={ keyword:g("kk").value.trim(), dm_text:g("kd").value.trim(), public_reply:g("kp").value.trim()||null, youtube_reply:g("ky").value.trim()||null,
            platforms:[].map.call(m.querySelectorAll("#kpl .on"),function(c){ return c.dataset.p; }), active:g("ka").checked, updated_at:new Date().toISOString() };
          if(!row.keyword||!row.dm_text) return MTH.toast("Add the keyword and the message");
          if(!row.platforms.length) return MTH.toast("Pick at least one place");
          var r=k.id?await sb.from("mth_dm_keywords").update(row).eq("id",k.id):await sb.from("mth_dm_keywords").insert(row);
          if(r.error) return MTH.toast(r.error.code==="23505"?"You already have that keyword":"Couldn’t save: "+r.error.message,5000);
          m.remove(); MTH.toast("Saved"); A.refresh(); };
        var del=m.querySelector("[data-del]"); if(del) del.onclick=async function(){ if(!confirm("Delete the keyword “"+k.keyword+"”?")) return; var r=await sb.from("mth_dm_keywords").delete().eq("id",k.id); if(r.error) return MTH.toast("Couldn’t delete"); m.remove(); A.refresh(); };
      }
      $("kadd").onclick=function(){ kwDialog(); };
      V.querySelectorAll("tr[data-kw]").forEach(function(tr){ tr.onclick=function(){ var k=words.filter(function(x){ return String(x.id)===tr.dataset.kw; })[0]; if(k) kwDialog(k); }; });
    }});
})();
