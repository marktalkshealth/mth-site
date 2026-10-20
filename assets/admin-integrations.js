/* =================================================================
   ADMIN — Growth: conversions (what's working) and integrations
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;
  var FN=C.supabaseUrl+"/functions/v1/";

  /* ================= CONVERSIONS ================= */
  var days=30;
  A.screen("conversions",{ nav:"What\u2019s working", group:"Growing", live:true, help:"Which posts and websites bring you visitors, email sign-ups and sales. Bigger numbers on the right = that post is working.", render: async function(V){
    var res=await Promise.all([A.rpc("mth_admin_funnel",{ p_days:days }), A.rpc("mth_admin_attribution",{ p_days:days }), sb.from("mth_posts").select("id,title,slug")]);
    var F=res[0]||[], AT=res[1]||[], posts={}; ((res[2]&&res[2].data)||[]).forEach(function(p){ posts["post-"+p.id]=p; });
    var T={ v:0,j:0,s:0,c:0,p:0 }; F.forEach(function(d){ T.v+=+d.visits; T.j+=+d.list_joins; T.s+=+d.signups; T.c+=+d.checkouts; T.p+=+d.purchases; });
    var pct=function(a,b){ return b?Math.round(100*a/b)+"%":"—"; };
    var steps=[["Visitors",T.v],["Joined list",T.j],["Created account",T.s],["Started checkout",T.c],["Bought",T.p]], max=Math.max(1,T.v,T.j,T.s,T.c,T.p);
    var rev=AT.reduce(function(a,r){ return a+Number(r.revenue_cents||0); },0);
    V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>What’s <em>working</em></h1></div><select class="sel" id="dd"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 12 months</option></select></div>'+
      '<div class="card panel"><h3>Funnel</h3>'+steps.map(function(s,i){ return '<div class="row-i"><span style="flex:0 0 150px">'+s[0]+'</span><span style="flex:1"><span style="display:block;height:12px;border-radius:9px;background:'+["#cbbfae","#d9b979","#9fb592","#b8924a","#c0623f"][i]+';width:'+Math.max(2,100*s[1]/max)+'%"></span></span><b style="flex:0 0 60px;text-align:right">'+s[1]+'</b><span class="small" style="flex:0 0 70px;text-align:right">'+(i?pct(s[1],steps[i-1][1])+' step':'')+'</span></div>'; }).join("")+
        '<p class="small" style="margin:10px 0 0">Visitor → buyer: <b>'+pct(T.p,T.v)+'</b> · Revenue credited to sources: <b>'+A.money(rev)+'</b>. Visits count once per browser session.</p></div>'+
      '<div class="sec-h">By source and post</div><div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Source</th><th>Campaign / post</th><th>Visits</th><th>List</th><th>Accounts</th><th class="hm">Checkouts</th><th>Sales</th><th>Revenue</th></tr></thead><tbody>'+
      (AT.map(function(r){ var post=posts[r.utm_content]; return '<tr'+(post?' data-post="'+post.id+'"':'')+'><td><b>'+esc(r.utm_source)+'</b></td><td>'+esc(r.utm_campaign||"—")+(post?'<br><span class="small">'+esc(post.title)+'</span>':r.utm_content?'<br><span class="small">'+esc(r.utm_content)+'</span>':'')+'</td><td>'+r.visits+'</td><td>'+r.list_joins+'</td><td>'+r.signups+'</td><td class="hm">'+r.checkouts+'</td><td>'+r.purchases+'</td><td>'+A.money(r.revenue_cents)+'</td></tr>'; }).join("")||'<tr><td colspan="8" class="muted" style="padding:18px">No visits recorded yet. Share a tracking link from the Social Studio and it shows up here.</td></tr>')+'</tbody></table></div>';
    document.getElementById("dd").value=String(days);
    document.getElementById("dd").onchange=function(){ days=Number(this.value); A.refresh(); };
    document.querySelectorAll("tr[data-post]").forEach(function(tr){ tr.onclick=function(){ A.go("post/"+tr.dataset.post); }; });
  }});

  /* ================= INTEGRATIONS ================= */
  function dot(on){ return '<span class="status-dot'+(on?' on':'')+'"></span>'; }
  A.screen("integrations",{ nav:"Connections", group:"Growing", help:"Where your website connects to other services (payments, email, Metricool). Green dot = connected. Follow the steps under any grey dot.", render: async function(V){
    var st={}; try{ st=await MTH.fn("mth-sync",{ action:"status" }); }catch(e){}
    var P=st.providers||{}, log=[]; try{ log=await A.rpc("mth_admin_sync_log",{ p_limit:30 },true)||[]; }catch(e){}
    var site=MTH.base;
    function card(title,on,body){ return '<div class="card panel" style="margin-bottom:14px"><h3>'+dot(on)+esc(title)+'</h3>'+body+'</div>'; }
    function secret(name,hint){ return '<li>Supabase → <b>Edge Functions → Secrets</b> → add <code>'+name+'</code>'+(hint?' = '+hint:'')+'</li>'; }
    V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>Connections</h1></div><button class="b sm" id="test">Send me a test contact</button></div>'+
      '<p class="small" style="margin:-6px 0 16px">Green = switched on. Everything here is switched on by pasting a key into Supabase; nothing else to install.</p>'+
      card("Stripe payments",!!st.stripe,'<p class="small">'+(st.stripe?'Test key added.'+(st.live_allowed?' <b>Live payments are allowed.</b>':' Live payments are blocked until you add ALLOW_LIVE.'):'Not switched on yet.')+'</p><ol class="step-list">'+secret("STRIPE_SECRET_KEY","your sk_test_… key (Stripe → Developers → API keys)")+
        '<li><b>Refunds and backup:</b> Stripe → Developers → Webhooks → add endpoint <code>'+FN+'mth-stripe-webhook</code> with events <code>checkout.session.completed</code> and <code>charge.refunded</code>, then add its signing secret as <code>STRIPE_WEBHOOK_SECRET</code> '+dot(!!st.stripe_webhook)+'. With this on, a full refund in Stripe closes that person\u2019s access by itself and marks them Refunded.</li>'+
        '<li>Going live: swap in <code>sk_live_…</code> and add <code>ALLOW_LIVE</code> = <code>true</code></li></ol>')+
      card("Kit (ConvertKit) — newsletters",!!P.kit,'<p class="small">Every list sign-up, new account and purchase is added to Kit with tags: <code>mth-list</code>, <code>mth-account</code>, <code>mth-customer</code>, <code>mth-gut-customer</code> (and sugar / glp1), <code>src-instagram</code>… Use the tags to start sequences in Kit.</p><ol class="step-list"><li>Kit → Settings → Developer → create a <b>V4 API key</b></li>'+secret("KIT_API_KEY")+'</ol>')+
      card("Resend — sign-in codes and contacts",!!P.resend,'<ol class="step-list"><li>Resend → add and verify your domain (or use their test domain to start)</li><li>Supabase → <b>Authentication → Emails → SMTP settings</b>: host <code>smtp.resend.com</code>, port <code>465</code>, user <code>resend</code>, password = a Resend API key. This lets sign-in codes reach everyone.</li><li>Supabase → Authentication → Emails → Magic Link: add <code>Your code: {{ .Token }}</code></li><li>Optional, to also copy contacts into Resend: '+'add <code>RESEND_API_KEY</code> (and <code>RESEND_SEGMENT_ID</code>) as Edge Function secrets</li></ol>')+
      card("MailerLite",!!P.mailerlite,'<p class="small">Only if you choose MailerLite instead of Kit.</p><ol class="step-list">'+secret("MAILERLITE_API_KEY")+secret("MAILERLITE_GROUP_ID","(optional) the group to add people to")+'</ol>')+
      card("Leads in — ManyChat, Zapier, Make, any tool",!!st.hook,'<p class="small">Send a person into your CRM (and on to your email service) from another tool.</p><ol class="step-list">'+secret("HOOK_SECRET","any long random password you make up")+
        '<li>In ManyChat: Action → <b>External Request</b> → POST <code>'+FN+'mth-hook</code>, header <code>X-MTH-Secret</code> = your HOOK_SECRET, body:</li></ol>'+
        '<div class="code-box">{ "email": "{{email}}", "name": "{{first_name}}", "tags": ["manychat","gut"], "source": "manychat" }</div>')+
      card("Leads out — any other tool",!!P.webhook,'<p class="small">Sends every new list sign-up, account and purchase to a Zapier / Make / n8n webhook as JSON.</p><ol class="step-list">'+secret("OUTBOUND_WEBHOOK_URL")+secret("OUTBOUND_WEBHOOK_SECRET","(optional) sent as the X-MTH-Secret header")+'</ol>')+
      card("Metricool — posting and DM flows",true,'<p class="small">Plan posts in the <a href="#studio">Social Studio</a>, then <b>Export for Metricool</b> and upload the file in Metricool → Planner → Import (CSV). Each post’s link is a tracking link, so sales show up under Conversions. For comment-to-DM, point your Metricool Flow at the post’s tracking link.</p>')+
      '<div class="sec-h">Recent syncs</div><div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>When</th><th>Email</th><th>Event</th><th>Service</th><th>Result</th></tr></thead><tbody>'+
      (log.map(function(l){ return '<tr><td class="small">'+A.when(l.created_at,true)+'</td><td>'+esc(l.email)+'</td><td>'+esc(l.event)+'</td><td>'+esc(l.provider)+'</td><td>'+(l.ok?'<span class="pill own">OK</span>':'<span class="pill tag">'+esc(l.detail||"failed")+'</span>')+'</td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:16px">Nothing sent yet.</td></tr>')+'</tbody></table></div>';
    document.getElementById("test").onclick=async function(){ this.disabled=true; var r=await MTH.fn("mth-sync",{ action:"test" }); this.disabled=false;
      var res=(r.results||[]); MTH.toast(res.length?res.map(function(x){ return x.provider+": "+(x.ok?"OK":"failed"); }).join(" · "):"No email service switched on yet",4000); A.refresh(); };
  }});
})();
