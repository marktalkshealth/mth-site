/* =================================================================
   ADMIN — TODAY: the simple start page. What to do today, your setup
   checklist in plain steps, yesterday's numbers, and the 3-screen setup.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb, C=MTH.config;
  var FN=C.supabaseUrl+"/functions/v1/";
  function manual(k){ try{ return localStorage.getItem("mth_setup_"+k)==="1"; }catch(e){ return false; } }
  function setManual(k,v){ try{ localStorage.setItem("mth_setup_"+k,v?"1":"0"); }catch(e){} }

  A.screen("today",{ nav:"Today", group:"Start here", live:true, help:"Start here each day. Do the to-dos, then make a post. The checklist below tells you what’s left to set up, one small step at a time.",
  render: async function(V){
    var st={}, media=[], posts=[], tasks=[], fun=[];
    var r=await Promise.all([
      MTH.fn("mth-sync",{ action:"status" }).catch(function(){ return {}; }),
      sb.from("mth_lesson_media").select("product,lesson_id,video_url,ebook_url").then(function(x){ return x.data||[]; },function(){ return []; }),
      sb.from("mth_posts").select("id,status,publish_at").then(function(x){ return x.data||[]; },function(){ return []; }),
      A.rpc("mth_admin_tasks",{ p_include_done:false },true).catch(function(){ return []; }),
      A.rpc("mth_admin_funnel",{ p_days:2 },true).catch(function(){ return []; })
    ]);
    st=r[0]||{}; media=r[1]; posts=r[2]; tasks=r[3]||[]; fun=r[4]||[];
    var P=st.providers||{};
    var vids=media.filter(function(m){ return m.video_url; }).length, ebs=media.filter(function(m){ return m.ebook_url; }).length;
    var today=A.today(), due=tasks.filter(function(t){ return !t.due||t.due<=today; });
    var y=new Date(); y.setDate(y.getDate()-1); var yk=y.toISOString().slice(0,10);
    var yd=fun.filter(function(f){ return String(f.day).slice(0,10)===yk; })[0]||{ visits:0,list_joins:0,signups:0,purchases:0 };
    var td=fun.filter(function(f){ return String(f.day).slice(0,10)===today; })[0]||{ visits:0,list_joins:0,signups:0,purchases:0 };

    /* the setup checklist, in the order Mark should do it */
    var steps=[
      { k:"stripe", done:!!st.stripe, t:"Turn on test payments", why:"So you can try buying a course with a pretend card.",
        how:'<ol class="step-list"><li>Go to <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener">Stripe → Developers → API keys</a> (test mode).</li><li>Copy the <b>Secret key</b> (it starts with <code>sk_test_</code>).</li><li>Go to <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase → Edge Functions → Secrets</a>.</li><li>Add a secret named <code>STRIPE_SECRET_KEY</code> and paste the key. Save.</li></ol>' },
      { k:"webhook", done:!!st.stripe_webhook, t:"Let refunds close access by themselves", why:"When you refund someone in Stripe, their course access closes automatically.",
        how:'<ol class="step-list"><li>Go to <a href="https://dashboard.stripe.com/test/webhooks" target="_blank" rel="noopener">Stripe → Developers → Webhooks</a> and click <b>Add endpoint</b>.</li><li>Endpoint address: <code>'+FN+'mth-stripe-webhook</code></li><li>Events: <code>checkout.session.completed</code> and <code>charge.refunded</code>. Save.</li><li>Copy the <b>Signing secret</b> (starts with <code>whsec_</code>) and add it in <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a> as <code>STRIPE_WEBHOOK_SECRET</code>.</li></ol>' },
      { k:"smtp", done:manual("smtp"), manual:true, t:"Let sign-in codes reach everyone", why:"Right now sign-in emails only reach you. This fixes it for customers.",
        how:'<ol class="step-list"><li>Make a free account at <a href="https://resend.com" target="_blank" rel="noopener">resend.com</a> and create an <b>API key</b>.</li><li>Open <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/auth/smtp" target="_blank" rel="noopener">Supabase → Authentication → SMTP</a> and turn on custom SMTP.</li><li>Host <code>smtp.resend.com</code>, port <code>465</code>, username <code>resend</code>, password = your Resend API key.</li><li>In <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/auth/templates" target="_blank" rel="noopener">Email templates → Magic Link</a>, add the line <code>Your code: {{ .Token }}</code>. Save.</li></ol>' },
      { k:"kit", done:!!(P.kit||P.mailerlite||P.resend||P.webhook), t:"Connect your email list (Kit)", why:"Everyone who signs up or buys goes into Kit automatically, so you can email them.",
        how:'<ol class="step-list"><li>Make a free account at <a href="https://kit.com" target="_blank" rel="noopener">kit.com</a>.</li><li>In Kit: <b>Settings → Developer</b> → create a <b>V4 API key</b>. Copy it.</li><li>In <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase → Edge Functions → Secrets</a> add <code>KIT_API_KEY</code> and paste it.</li><li>Come back to <a href="#integrations">Connections</a> and press <b>Send me a test contact</b>.</li></ol>' },
      { k:"video", done:vids>0, t:"Add your first lesson video", why:vids+" of "+media.length+" lessons have a video so far.",
        how:'<ol class="step-list"><li>Upload the video to YouTube as <b>Unlisted</b> (or Vimeo / Wistia).</li><li>Copy its link.</li><li>Open <a href="#content">Videos &amp; ebooks</a>, paste the link next to the lesson, press <b>Save</b>.</li></ol>' },
      { k:"ebook", done:ebs>0, t:"Upload your ebooks", why:ebs+" ebooks uploaded so far.",
        how:'<ol class="step-list"><li>Open <a href="#content">Videos &amp; ebooks</a>.</li><li>Press <b>Upload</b> next to a lesson and pick the ebook file (HTML or PDF).</li></ol>' },
      { k:"posts", done:posts.length>=5, t:"Plan your first 5 posts", why:posts.length+" posts planned so far.",
        how:'<ol class="step-list"><li>Open <a href="#studio">Posts</a> and press <b>Get ideas</b>.</li><li>Add the ones you like. Each becomes a card you can write and film.</li></ol>' },
      { k:"metricool", done:manual("metricool"), manual:true, t:"Connect Metricool", why:"Metricool publishes your posts and sends the comment-to-DM links.",
        how:'<ol class="step-list"><li>In Metricool, connect Instagram (professional account linked to a Facebook Page) and TikTok.</li><li>When posts are Ready, go to <a href="#studio">Posts</a> → <b>Export for Metricool</b>, then in Metricool: <b>Planner → Import</b>.</li><li>Make a <b>Flow</b>: when someone comments GUT, send the post’s tracking link (it’s on each post’s page).</li></ol>' },
      { k:"legal", done:manual("legal"), manual:true, t:"Read your Terms, Privacy and Refund pages", why:"Drafts I wrote. Check they fit your business before you sell for real.",
        how:'<p class="small"><a href="terms.html" target="_blank">Terms</a> · <a href="privacy.html" target="_blank">Privacy</a> · <a href="refunds.html" target="_blank">Refunds</a></p>' },
      { k:"live", done:!!st.live_allowed, t:"Go live", why:"Last step: real payments and your own web address.",
        how:'<ol class="step-list"><li>Swap the Stripe key for your <b>live</b> key (<code>sk_live_</code>) and add a secret <code>ALLOW_LIVE</code> = <code>true</code>.</li><li>Ask Claude to switch the site from test to live and connect your domain. That part is done for you.</li></ol>' }
    ];
    var doneN=steps.filter(function(s){ return s.done; }).length, next=steps.filter(function(s){ return !s.done; })[0];
    var hr=new Date().getHours();
    V.innerHTML='<div class="adm-h"><div><div class="kick">'+new Date().toLocaleDateString(undefined,{ weekday:"long", month:"long", day:"numeric" })+'</div><h1>Good '+(hr<12?'morning':hr<18?'afternoon':'evening')+', <em>Mark</em></h1></div></div>'+
      '<div class="today-big">'+
        '<a class="card tb" href="#studio"><span class="ic">🎬</span><b>Make a post</b><span>Plan, write and film</span></a>'+
        '<a class="card tb" href="#contacts"><span class="ic">👥</span><b>See my people</b><span>Customers and sign-ups</span></a>'+
        '<a class="card tb" href="#content"><span class="ic">📚</span><b>Add course videos</b><span>Paste a link, press Save</span></a>'+
        '<a class="card tb" href="javascript:void(0)" data-three><span class="ic">🖥</span><b>Set up my 3 screens</b><span>One window per monitor</span></a></div>'+
      '<div class="cols">'+
        '<div class="card panel"><h3>Your setup · '+doneN+' of '+steps.length+' done</h3><div class="mini" style="width:100%;height:10px;margin:4px 0 14px"><i style="width:'+Math.round(100*doneN/steps.length)+'%"></i></div>'+
          steps.map(function(s,i){ return '<details class="setup'+(s.done?' done':'')+'"'+(s===next?' open':'')+'><summary><span class="ck">'+(s.done?'✓':(i+1))+'</span><span class="tx"><b>'+s.t+'</b><span class="small">'+esc(s.why)+'</span></span></summary><div class="how">'+s.how+
            (s.manual?'<label class="check" style="margin-top:8px"><input type="checkbox" data-m="'+s.k+'"'+(s.done?' checked':'')+'> I’ve done this</label>':'')+'</div></details>'; }).join("")+'</div>'+
        '<div style="display:grid;gap:14px;align-content:start">'+
          '<div class="card panel"><h3>To-dos for today</h3>'+(due.slice(0,8).map(function(t){ return '<div class="task"><input type="checkbox" data-t="'+t.id+'" data-d="'+(t.due||"")+'" aria-label="Done"><div class="tx"><b>'+esc(t.title)+'</b><div class="due">'+(t.email?'<a href="#person/'+encodeURIComponent(t.email)+'">'+esc(t.email)+'</a>':'Your own to-do')+'</div></div></div>'; }).join("")||'<p class="muted" style="margin:0">Nothing to do. Make a post!</p>')+'<a class="b sm ghost" href="#tasks" style="margin-top:10px">All to-dos</a></div>'+
          '<div class="card panel"><h3>Yesterday</h3><div class="kpis" style="grid-template-columns:repeat(2,1fr)"><div class="card kpi"><b>'+(yd.visits||0)+'</b><span>Visitors</span></div><div class="card kpi"><b>'+(yd.list_joins||0)+'</b><span>Joined your list</span></div><div class="card kpi"><b>'+(yd.signups||0)+'</b><span>Made an account</span></div><div class="card kpi"><b>'+(yd.purchases||0)+'</b><span>Bought</span></div></div>'+
            '<p class="small" style="margin:10px 0 0">So far today: '+(td.visits||0)+' visitors, '+(td.list_joins||0)+' sign-ups, '+(td.purchases||0)+' sales. <a href="#conversions">What’s working →</a></p></div>'+
        '</div></div>';
    V.querySelectorAll("[data-m]").forEach(function(c){ c.onchange=function(){ setManual(c.dataset.m,c.checked); A.refresh(); }; });
    V.querySelectorAll("[data-t]").forEach(function(c){ c.onchange=async function(){ await A.rpc("mth_admin_task",{ p_id:Number(c.dataset.t), p_email:null, p_title:null, p_due:c.dataset.d||null, p_done:true }); MTH.toast("Done ✓"); A.refresh(); }; });
    var t3=V.querySelector("[data-three]"); if(t3) t3.onclick=function(e){ e.preventDefault(); A.threeScreens(); };
  }});
})();
