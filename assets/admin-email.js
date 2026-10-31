/* =================================================================
   ADMIN — Email: your own email system on Resend.
   Tabs: Overview (health + numbers) · Sequences (automatic emails) · Broadcasts (one-off emails) · Settings
   The sending itself runs on its own every 5 minutes (Supabase mth-mail function).
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, C=MTH.config, sb=MTH.sb;
  var PROJECT="oihefcsonqjeicelezln";
  var LINKS={
    resendDomains:"https://resend.com/domains", resendWebhooks:"https://resend.com/webhooks",
    secrets:"https://supabase.com/dashboard/project/"+PROJECT+"/functions/secrets",
    hook:C.supabaseUrl+"/functions/v1/mth-mail",
    porkbunDns:"https://porkbun.com/account/domainsSpeedy", cfDns:"https://dash.cloudflare.com/?to=/:account/marktalkshealth.com/dns/records"
  };
  function prodShort(k){ return (C.products[k]||{}).short||k; }
  var TRIGGERS=[["list_join","When someone joins the email list"]].concat(C.order.map(function(k){ return ["purchase:"+k,"After buying "+prodShort(k)]; }),[["purchase:any","After buying any program"],["manual","Only people I add by hand"]]);
  function trigName(t){ for(var i=0;i<TRIGGERS.length;i++) if(TRIGGERS[i][0]===t) return TRIGGERS[i][1]; return t; }
  function pct(a,b){ return b?(Math.round(1000*a/b)/10)+"%":"—"; }
  function waitText(h){ h=Number(h||0); if(!h) return "Right away"; if(h%24===0) return "Wait "+(h/24)+" day"+(h===24?"":"s"); return "Wait "+h+" hour"+(h===1?"":"s"); }
  async function eng(action,body){ var j=await MTH.fn("mth-mail",Object.assign({ action:action },body||{})); if(j.error) throw new Error(j.message||j.error); return j; }

  /* little bit of styling just for these screens */
  if(!document.getElementById("em-css")){ var st=document.createElement("style"); st.id="em-css"; st.textContent=
    ".em-lbl{display:block;font-size:12.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin:14px 0 6px}"+
    ".em-two{display:grid;gap:10px}@media(min-width:760px){.em-two{grid-template-columns:1fr 1fr}}"+
    ".em-body{min-height:260px!important;font:15px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace!important}"+
    ".em-step{border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:12px;background:#fffdf8}"+
    ".em-step h4{margin:0;display:flex;gap:10px;align-items:center;justify-content:space-between;font-size:16px}"+
    ".em-wait{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:14px;color:var(--muted);margin:2px 0 10px}.em-wait .inp{width:90px}.em-wait .sel{width:auto}"+
    ".em-ck{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}.em-ck:last-child{border:0}"+
    ".em-ck i{flex:0 0 22px;height:22px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:13px;color:#fff;background:#c9bfb1;margin-top:2px}.em-ck i.ok{background:#2e8a62}.em-ck i.bad{background:var(--terra)}"+
    ".em-ck b{display:block}.em-ck span{font-size:13.5px;color:var(--muted)}"+
    ".em-frame{width:100%;height:70vh;border:1px solid var(--line);border-radius:14px;background:#f7f1e7}"+
    ".em-help{font-size:13px;color:var(--muted);margin:6px 0 0}.em-help code{font-size:12px}"+
    ".em-grid{display:grid;gap:14px}@media(min-width:1100px){.em-grid{grid-template-columns:1.25fr 1fr}}";
    document.head.appendChild(st); }

  function previewModal(subject,body,preheader,kind){
    var m=document.createElement("div"); m.className="mx-modal";
    m.innerHTML='<div class="box" style="max-width:720px;width:96vw"><h3 id="pvS">Preview</h3><iframe class="em-frame" id="pvF" title="Email preview"></iframe><div class="acts" style="margin-top:12px"><button class="b sm ghost" data-x>Close</button></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click",function(e){ if(e.target===m||e.target.hasAttribute("data-x")) m.remove(); });
    eng("preview",{ subject:subject, body:body, preheader:preheader, kind:kind }).then(function(r){ m.querySelector("#pvS").textContent=r.subject||"(no subject)"; m.querySelector("#pvF").srcdoc=r.html; },function(e){ m.querySelector("#pvS").textContent="Couldn’t preview: "+e.message; });
  }
  async function testSend(subject,body,preheader,kind,btn){
    if(btn){ btn.disabled=true; btn.textContent="Sending…"; }
    try{ var r=await eng("test",{ subject:subject, body:body, preheader:preheader, kind:kind }); MTH.toast(r.ok?"Test sent to "+r.to+". Check your inbox (and spam folder).":"Couldn’t send: "+r.error,6000); }
    catch(e){ MTH.toast("Couldn’t send: "+e.message,6000); }
    if(btn){ btn.disabled=false; btn.textContent="Send me a test"; }
  }
  var FORMAT_HELP='<p class="em-help">Type like a normal email. Extras: <code>## Heading</code> · <code>**bold**</code> · <code>[link text](https://marktalkshealth.com/gut)</code> · a button on its own line: <code>[[Start the protocol|https://marktalkshealth.com/gut]]</code> · <code>- bullet</code> · <code>{{first_name|friend}}</code> = their first name, or “friend”. Links to your site are tracked so sales are credited to the email.</p>';

  /* ================= OVERVIEW ================= */
  A.screen("email",{ nav:"Email", group:"Customers", live:true, help:"Your own email system. The checklist keeps your emails out of spam; the numbers show how they’re doing. Green ticks = good.", render: async function(V){
    var res=await Promise.all([eng("status").catch(function(e){ return { error:e.message }; }), A.rpc("mth_admin_email_stats",{ p_days:30 }),
      sb.from("mth_email_sends").select("email,subject,kind,status,sent_at,created_at,error").neq("kind","test").order("created_at",{ ascending:false }).limit(15),
      fetch("https://dns.google/resolve?name=_dmarc.marktalkshealth.com&type=TXT").then(function(r){ return r.json(); }).catch(function(){ return null; })]);
    var S=res[0]||{}, N=res[1]||{}, recent=(res[2]&&res[2].data)||[], dm=res[3];
    var set=S.settings||{}, doms=S.domains||[];
    var fromDomain=String(set.from_email||"").split("@")[1]||"";
    var dom=doms.filter(function(d){ return d.name===fromDomain; })[0];
    var dmarc=dm&&(dm.Answer||[]).some(function(a){ return /v=DMARC1/i.test(a.data||""); });
    var bounceRate=N.sent?N.bounces/N.sent:0, complaintRate=N.sent?N.complaints/N.sent:0;
    var checks=[
      [!!S.resend_key,"Resend is connected","Your Resend key is in Supabase."],
      [dom&&dom.status==="verified","Sending domain verified"+(fromDomain?" ("+esc(fromDomain)+")":""),dom?("Resend says: <b>"+esc(dom.status)+"</b>."+(dom.status!=="verified"?' Open <a href="'+LINKS.resendDomains+'" target="_blank" rel="noopener">Resend → Domains</a> and finish the DNS records.':"")):'Your “from” address must be on a domain verified in <a href="'+LINKS.resendDomains+'" target="_blank" rel="noopener">Resend → Domains</a>.'],
      [dmarc,"DMARC record","Gmail and Yahoo require it for bulk senders. "+(dmarc?"Found.":"Not found yet. See Settings for the one record to add.")],
      [!!set.mailing_address,"Mailing address in the footer","The US law (CAN-SPAM) requires it on every email. "+(set.mailing_address?esc(set.mailing_address):'<a href="#email-set">Add it in Settings</a> (a PO box is fine). <b>Nothing sends until this is filled in.</b>')],
      [!!S.webhook_secret,"Bounce & spam protection","Resend tells your system about bounces and spam complaints, so those addresses are never emailed again. "+(S.webhook_secret?"Connected.":'<a href="#email-set">Set it up in Settings</a>.')],
      [S.cron&&S.cron.scheduled,"Automatic sending","Runs every 5 minutes."+(S.cron&&S.cron.last_run?" Last run "+A.when(S.cron.last_run,true)+".":"")],
      [!set.paused,"Sending switched on",set.paused?'Paused. <a href="#email-set">Switch it back on in Settings</a>.':"Emails go out as soon as they’re due."],
      [bounceRate<0.02&&complaintRate<0.001,"Healthy numbers","Bounces under 2% and spam complaints under 0.1% keep you in the inbox."+(N.sent?" Yours: "+pct(N.bounces,N.sent)+" bounces, "+pct(N.complaints,N.sent)+" complaints.":"")]
    ];
    var good=checks.filter(function(c){ return c[0]; }).length;
    V.innerHTML='<div class="adm-h"><div><div class="kick">Customers</div><h1>Your <em>email</em></h1></div><div class="acts"><a class="b sm ghost" href="#email-seq">Automatic emails</a><a class="b sm" href="#email-bc/new">Write an email</a></div></div>'+
      '<div class="kpis"><div class="card kpi"><b>'+(N.subscribed||0)+'</b><span>On your list</span></div><div class="card kpi"><b>'+(N.sent||0)+'</b><span>Sent, 30 days</span></div>'+
      '<div class="card kpi"><b>'+pct(N.opened,N.delivered||N.sent)+'</b><span>Opened</span></div><div class="card kpi"><b>'+pct(N.clicked,N.delivered||N.sent)+'</b><span>Clicked</span></div>'+
      '<div class="card kpi'+(bounceRate>=0.02?' warn':'')+'"><b>'+pct(N.bounces,N.sent)+'</b><span>Bounced</span></div><div class="card kpi'+(N.unsubs_period?'':'')+'"><b>'+(N.unsubs_period||0)+'</b><span>Unsubscribed, 30 days</span></div></div>'+
      '<div class="em-grid" style="margin-top:14px"><div class="card panel"><h3>Inbox checklist · '+good+' of '+checks.length+'</h3>'+checks.map(function(c){ return '<div class="em-ck"><i class="'+(c[0]?'ok':'bad')+'">'+(c[0]?'✓':'!')+'</i><div><b>'+c[1]+'</b><span>'+c[2]+'</span></div></div>'; }).join("")+'</div>'+
      '<div class="card panel"><h3>Right now</h3><div class="row-i"><span>Waiting to send</span><b>'+(N.queued||0)+'</b></div><div class="row-i"><span>People moving through automatic emails</span><b>'+(N.active_runs||0)+'</b></div><div class="row-i"><span>Sent in the last 24 hours</span><b>'+(N.sent_today||0)+' / '+(set.daily_cap||"—")+'</b></div>'+
        '<div class="row-i"><span>Blocked addresses (bounced or marked spam)</span><b>'+((N.bounced||0)+(N.complained||0))+'</b></div>'+(N.failed?'<div class="row-i"><span style="color:var(--terra)">Failed sends, 30 days</span><b>'+N.failed+'</b></div>':'')+
        '<div class="acts" style="margin-top:12px"><button class="b sm ghost" id="run">Send what’s due now</button></div>'+
        '<div class="sec-h">Latest emails</div>'+(recent.map(function(s){ return '<div class="row-i"><span><a href="#person/'+encodeURIComponent(s.email)+'">'+esc(s.email)+'</a><br><span class="small">'+esc(s.subject||"")+'</span></span><span class="small" title="'+esc(s.error||"")+'">'+esc(s.status)+'<br>'+A.when(s.sent_at||s.created_at,true)+'</span></div>'; }).join("")||'<p class="muted">Nothing sent yet.</p>')+'</div></div>';
    document.getElementById("run").onclick=async function(){ this.disabled=true; try{ var r=await eng("run_now"); MTH.toast(r.ok?(r.paused?"Sending is paused.":"Sent "+(r.sent||0)+(r.capped?" (daily limit reached)":"")):(r.reason==="no_mailing_address"?"Add your mailing address in Settings first.":"Not sent: "+r.reason),5000); }catch(e){ MTH.toast(e.message); } A.refresh(); };
  }});

  /* ================= SEQUENCES ================= */
  A.screen("email-seq",{ nav:"Automatic emails", help:"Automatic emails go out by themselves, one after another, when someone joins your list or buys. Edit the words any time; people already part-way through get your new version.", render: async function(V,arg){
    if(arg) return seqEditor(V,arg);
    var r=await Promise.all([sb.from("mth_email_sequences").select("*").order("id"), sb.from("mth_email_steps").select("sequence_id,id"), sb.from("mth_email_runs").select("sequence_id,status")]);
    var seqs=r[0].data||[], steps=r[1].data||[], runs=r[2].data||[];
    V.innerHTML='<div class="adm-h"><div><div class="kick">Email</div><h1>Automatic <em>emails</em></h1></div><button class="b sm" id="new">New sequence</button></div>'+
      '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Sequence</th><th>Starts</th><th>Emails</th><th>In it now</th><th>Finished</th><th>On?</th></tr></thead><tbody>'+
      (seqs.map(function(s){ var n=steps.filter(function(x){ return x.sequence_id===s.id; }).length, act=runs.filter(function(x){ return x.sequence_id===s.id&&x.status==="active"; }).length, done=runs.filter(function(x){ return x.sequence_id===s.id&&x.status==="done"; }).length;
        return '<tr data-id="'+s.id+'" style="cursor:pointer"><td><b>'+esc(s.name)+'</b><br><span class="small">'+(s.kind==="onboarding"?"Program welcome":"Marketing")+(s.stop_on_purchase?" · stops when they buy":"")+'</span></td><td class="small">'+esc(trigName(s.trigger))+'</td><td>'+n+'</td><td>'+act+'</td><td>'+done+'</td><td>'+(s.active?'<span class="pill own">On</span>':'<span class="pill">Paused</span>')+'</td></tr>'; }).join("")||'<tr><td colspan="6" class="muted" style="padding:16px">No sequences yet.</td></tr>')+'</tbody></table></div>';
    V.querySelectorAll("tr[data-id]").forEach(function(tr){ tr.onclick=function(){ A.go("email-seq/"+tr.dataset.id); }; });
    document.getElementById("new").onclick=async function(){ var name=prompt("Name this sequence (for example: Diabetes welcome)"); if(!name) return;
      var ins=await sb.from("mth_email_sequences").insert({ slug:name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString(36), name:name, trigger:"manual", active:false }).select("id").single();
      if(ins.error) return MTH.toast(ins.error.message); A.go("email-seq/"+ins.data.id); };
  }});

  async function seqEditor(V,id){
    var r=await Promise.all([sb.from("mth_email_sequences").select("*").eq("id",id).single(), sb.from("mth_email_steps").select("*").eq("sequence_id",id).order("position")]);
    if(r[0].error) throw r[0].error;
    var s=r[0].data, steps=r[1].data||[], dirty=false, removed=[];
    A.isDirty=function(){ return dirty; }; A.clearDirty=function(){ dirty=false; };
    function stepCard(st,i){
      var h=Number(st.delay_hours||0), unit=h&&h%24===0?"days":"hours", val=unit==="days"?h/24:h;
      return '<div class="em-step" data-i="'+i+'"><h4><span>Email '+(i+1)+'</span><span class="acts"><button class="b sm ghost" data-up title="Move up">↑</button><button class="b sm ghost" data-del>Remove</button></span></h4>'+
        '<div class="em-wait">'+(i===0?'Send':'Then')+' <input class="inp" type="number" min="0" step="1" data-f="wait" value="'+val+'"> <select class="sel" data-f="unit"><option value="hours"'+(unit==="hours"?" selected":"")+'>hours</option><option value="days"'+(unit==="days"?" selected":"")+'>days</option></select> '+(i===0?'after they start (0 = right away)':'after the email before')+
        '<label class="check" style="margin-left:auto"><input type="checkbox" data-f="active"'+(st.active!==false?" checked":"")+'> Send this one</label></div>'+
        '<label class="em-lbl">Subject line</label><input class="inp" data-f="subject" value="'+esc(st.subject||"")+'" placeholder="Short, personal, no ALL CAPS">'+
        '<label class="em-lbl">Preview text <span style="text-transform:none;font-weight:400">(the grey line after the subject in the inbox)</span></label><input class="inp" data-f="preheader" value="'+esc(st.preheader||"")+'">'+
        '<label class="em-lbl">Email</label><textarea class="inp em-body" data-f="body">'+esc(st.body||"")+'</textarea>'+
        '<div class="acts" style="margin-top:10px"><button class="b sm ghost" data-pv>Preview</button><button class="b sm ghost" data-test>Send me a test</button></div></div>';
    }
    function read(){ V.querySelectorAll(".em-step").forEach(function(el){ var i=Number(el.dataset.i), st=steps[i], f=function(k){ return el.querySelector('[data-f="'+k+'"]'); };
      var v=Math.max(0,Math.round(Number(f("wait").value||0))); st.delay_hours=f("unit").value==="days"?v*24:v; st.subject=f("subject").value; st.preheader=f("preheader").value; st.body=f("body").value; st.active=f("active").checked; });
      s.name=V.querySelector("#sName").value; s.trigger=V.querySelector("#sTrig").value; s.kind=V.querySelector("#sKind").value; s.stop_on_purchase=V.querySelector("#sStop").checked; s.active=V.querySelector("#sOn").checked; }
    function draw(){
      V.innerHTML='<div class="adm-h"><div><div class="kick"><a href="#email-seq">Automatic emails</a></div><h1>'+esc(s.name)+'</h1></div><div class="acts"><button class="b sm ghost" id="dup">Duplicate</button><button class="b sm" id="save">Save</button></div></div>'+
        '<div class="card panel"><div class="em-two"><div><label class="em-lbl">Name</label><input class="inp" id="sName" value="'+esc(s.name)+'"></div>'+
        '<div><label class="em-lbl">Starts</label><select class="sel" id="sTrig" style="width:100%">'+TRIGGERS.map(function(t){ return '<option value="'+t[0]+'"'+(t[0]===s.trigger?" selected":"")+'>'+t[1]+'</option>'; }).join("")+'</select></div>'+
        '<div><label class="em-lbl">Type</label><select class="sel" id="sKind" style="width:100%"><option value="marketing"'+(s.kind==="marketing"?" selected":"")+'>Marketing (only people on your list)</option><option value="onboarding"'+(s.kind==="onboarding"?" selected":"")+'>Program welcome (everyone who bought)</option></select></div>'+
        '<div style="display:grid;gap:8px;align-content:end"><label class="check"><input type="checkbox" id="sStop"'+(s.stop_on_purchase?" checked":"")+'> Stop sending when they buy a program</label><label class="check"><input type="checkbox" id="sOn"'+(s.active?" checked":"")+'> This sequence is on</label></div></div>'+
        '<p class="em-help">New people start this sequence from now on. People who joined before it was switched on don’t get it.</p></div>'+
        '<div class="sec-h">Emails in this sequence</div>'+steps.map(stepCard).join("")+
        '<button class="b sm ghost" id="addStep">+ Add another email</button>'+FORMAT_HELP;
      V.addEventListener("input",function(){ dirty=true; });
      V.querySelectorAll(".em-step").forEach(function(el){ var i=Number(el.dataset.i);
        el.querySelector("[data-pv]").onclick=function(){ read(); previewModal(steps[i].subject,steps[i].body,steps[i].preheader,s.kind); };
        el.querySelector("[data-test]").onclick=function(){ read(); testSend(steps[i].subject,steps[i].body,steps[i].preheader,s.kind,this); };
        el.querySelector("[data-del]").onclick=function(){ if(!confirm("Remove email "+(i+1)+"?")) return; read(); var x=steps.splice(i,1)[0]; if(x.id) removed.push(x.id); dirty=true; draw(); };
        el.querySelector("[data-up]").onclick=function(){ if(!i) return; read(); var x=steps[i]; steps[i]=steps[i-1]; steps[i-1]=x; dirty=true; draw(); };
      });
      V.querySelector("#addStep").onclick=function(){ read(); steps.push({ delay_hours:48, subject:"", preheader:"", body:"Hi {{first_name|there}},\n\n\n\nTalk soon,\nMark", active:true }); dirty=true; draw(); };
      V.querySelector("#save").onclick=save;
      V.querySelector("#dup").onclick=async function(){ read(); var ins=await sb.from("mth_email_sequences").insert({ slug:s.slug+"-copy-"+Date.now().toString(36), name:s.name+" (copy)", trigger:"manual", kind:s.kind, stop_on_purchase:s.stop_on_purchase, active:false }).select("id").single();
        if(ins.error) return MTH.toast(ins.error.message);
        await sb.from("mth_email_steps").insert(steps.map(function(x,k){ return { sequence_id:ins.data.id, position:k+1, delay_hours:x.delay_hours, subject:x.subject||"(no subject)", preheader:x.preheader, body:x.body||"", active:x.active!==false }; }));
        MTH.toast("Copied. It starts switched off."); A.go("email-seq/"+ins.data.id); };
    }
    async function save(){
      read();
      if(steps.some(function(x){ return !String(x.subject||"").trim()||!String(x.body||"").trim(); })) return MTH.toast("Every email needs a subject and some words.",4000);
      var b=V.querySelector("#save"); b.disabled=true; b.textContent="Saving…";
      try{
        var u=await sb.from("mth_email_sequences").update({ name:s.name, trigger:s.trigger, kind:s.kind, stop_on_purchase:s.stop_on_purchase, active:s.active }).eq("id",s.id); if(u.error) throw u.error;
        if(removed.length){ var d=await sb.from("mth_email_steps").delete().in("id",removed); if(d.error) throw d.error; removed=[]; }
        /* positions are unique: park them out of the way, then write the final order */
        for(var k=0;k<steps.length;k++) if(steps[k].id) await sb.from("mth_email_steps").update({ position:1000+k }).eq("id",steps[k].id);
        for(k=0;k<steps.length;k++){ var x=steps[k], row={ sequence_id:s.id, position:k+1, delay_hours:x.delay_hours, subject:x.subject, preheader:x.preheader||null, body:x.body, active:x.active!==false, updated_at:new Date().toISOString() };
          var q=x.id?await sb.from("mth_email_steps").update(row).eq("id",x.id):await sb.from("mth_email_steps").insert(row).select("id").single();
          if(q.error) throw q.error; if(!x.id&&q.data) x.id=q.data.id; }
        dirty=false; MTH.toast("Saved"); draw();
      }catch(e){ MTH.toast("Couldn’t save: "+(e.message||e),5000); b.disabled=false; b.textContent="Save"; }
    }
    draw();
  }

  /* ================= BROADCASTS ================= */
  A.screen("email-bc",{ nav:"One-off emails", help:"Write one email and send it to your list (or part of it) now or at a time you choose. Always send yourself a test first.", render: async function(V,arg){
    if(arg) return bcEditor(V,arg);
    var r=await sb.from("mth_broadcasts").select("*").order("created_at",{ ascending:false }).limit(100);
    var B=r.data||[], ids=B.map(function(b){ return b.id; });
    var st=ids.length?(await sb.from("mth_email_sends").select("broadcast_id,status,opened_at,clicked_at").in("broadcast_id",ids)).data||[]:[];
    V.innerHTML='<div class="adm-h"><div><div class="kick">Email</div><h1>One-off <em>emails</em></h1></div><a class="b sm" href="#email-bc/new">Write an email</a></div>'+
      '<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Subject</th><th>Status</th><th>Sent to</th><th>Opened</th><th>Clicked</th></tr></thead><tbody>'+
      (B.map(function(b){ var m=st.filter(function(x){ return x.broadcast_id===b.id; }), op=m.filter(function(x){ return x.opened_at; }).length, cl=m.filter(function(x){ return x.clicked_at; }).length;
        return '<tr data-id="'+b.id+'" style="cursor:pointer"><td><b>'+esc(b.subject||"(no subject yet)")+'</b><br><span class="small">'+A.when(b.send_at||b.created_at,true)+'</span></td><td>'+({ draft:"Draft", scheduled:"Scheduled", sending:"Sending", sent:"Sent", cancelled:"Cancelled" }[b.status]||b.status)+'</td><td>'+(b.recipients||"—")+'</td><td>'+(b.recipients?pct(op,b.recipients):"—")+'</td><td>'+(b.recipients?pct(cl,b.recipients):"—")+'</td></tr>'; }).join("")||'<tr><td colspan="5" class="muted" style="padding:16px">Nothing yet. Write your first email.</td></tr>')+'</tbody></table></div>';
    V.querySelectorAll("tr[data-id]").forEach(function(tr){ tr.onclick=function(){ A.go("email-bc/"+tr.dataset.id); }; });
  }});

  async function bcEditor(V,id){
    var b;
    if(id==="new"){ var ins=await sb.from("mth_broadcasts").insert({ subject:"", body:"Hi {{first_name|there}},\n\n\n\nTalk soon,\nMark" }).select("*").single(); if(ins.error) throw ins.error; history.replaceState(null,"","#email-bc/"+ins.data.id); b=ins.data; }
    else { var r=await sb.from("mth_broadcasts").select("*").eq("id",id).single(); if(r.error) throw r.error; b=r.data; }
    var locked=b.status==="sent"||b.status==="sending", aud=b.audience||{ who:"list" }, dirty=false;
    A.isDirty=function(){ return dirty; }; A.clearDirty=function(){ dirty=false; };
    var people=await A.loadPeople(); var tags={}; people.forEach(function(p){ (p.tags||[]).forEach(function(t){ tags[t]=1; }); });
    V.innerHTML='<div class="adm-h"><div><div class="kick"><a href="#email-bc">One-off emails</a></div><h1>'+(locked?"Sent email":"Write an <em>email</em>")+'</h1></div><div class="acts">'+(locked?'':'<button class="b sm ghost" id="save">Save draft</button>')+'</div></div>'+
      (b.status==="scheduled"?'<div class="msg info">Scheduled for <b>'+A.when(b.send_at,true)+'</b>. <button class="b sm ghost" id="unsched">Cancel and edit</button></div>':'')+
      '<div class="em-grid"><div class="card panel"><label class="em-lbl">Subject line</label><input class="inp" id="bS" value="'+esc(b.subject)+'"'+(locked||b.status==="scheduled"?" disabled":"")+'>'+
      '<label class="em-lbl">Preview text</label><input class="inp" id="bP" value="'+esc(b.preheader||"")+'"'+(locked||b.status==="scheduled"?" disabled":"")+'>'+
      '<label class="em-lbl">Email</label><textarea class="inp em-body" id="bB"'+(locked||b.status==="scheduled"?" disabled":"")+'>'+esc(b.body)+'</textarea>'+FORMAT_HELP+
      '<div class="acts" style="margin-top:10px"><button class="b sm ghost" id="pv">Preview</button><button class="b sm ghost" id="tst">Send me a test</button></div></div>'+
      '<div class="card panel"><h3>Who gets it</h3><label class="em-lbl">People</label><select class="sel" id="aW" style="width:100%"'+(locked?" disabled":"")+'><option value="list">Everyone on my list</option><option value="leads">Only people who haven’t bought</option><option value="customers">Only customers</option></select>'+
      '<label class="em-lbl">Who bought</label><select class="sel" id="aP" style="width:100%"'+(locked?" disabled":"")+'><option value="">Any (or none)</option>'+C.order.map(function(k){ return '<option value="'+k+'">'+prodShort(k)+'</option>'; }).join("")+'</select>'+
      '<label class="em-lbl">With tag</label><select class="sel" id="aT" style="width:100%"'+(locked?" disabled":"")+'><option value="">Any tag</option>'+Object.keys(tags).sort().map(function(t){ return '<option>'+esc(t)+'</option>'; }).join("")+'</select>'+
      '<p style="margin:14px 0 0"><b id="cnt">…</b> <span class="small">people will get this. Unsubscribed, bounced and spam-complaint addresses are always left out.</span></p>'+
      (locked?'<p class="small" style="margin-top:12px">Sent to <b>'+b.recipients+'</b> people '+A.when(b.send_at,true)+'.</p>':
      '<label class="em-lbl">When</label><select class="sel" id="wh" style="width:100%"><option value="now">Send now</option><option value="later">Pick a time</option></select><input class="inp hidden" type="datetime-local" id="at" style="margin-top:8px">'+
      '<button class="b full" id="go" style="margin-top:14px"'+(b.status==="scheduled"?" disabled":"")+'>Send it</button>')+'</div></div>';
    if(aud.who) V.querySelector("#aW").value=aud.who; if(aud.product) V.querySelector("#aP").value=aud.product; if(aud.tag) V.querySelector("#aT").value=aud.tag;
    function cur(){ return { subject:V.querySelector("#bS").value, preheader:V.querySelector("#bP").value, body:V.querySelector("#bB").value, audience:{ who:V.querySelector("#aW").value, product:V.querySelector("#aP").value||undefined, tag:V.querySelector("#aT").value||undefined } }; }
    async function count(){ try{ var r=await eng("audience",{ audience:cur().audience }); V.querySelector("#cnt").textContent=r.count; }catch(e){ V.querySelector("#cnt").textContent="?"; } }
    async function save(quiet){ var c=cur(); var u=await sb.from("mth_broadcasts").update({ subject:c.subject, preheader:c.preheader||null, body:c.body, audience:c.audience, updated_at:new Date().toISOString() }).eq("id",b.id); if(u.error){ MTH.toast(u.error.message); return false; } dirty=false; if(!quiet) MTH.toast("Draft saved"); return true; }
    ["aW","aP","aT"].forEach(function(k){ V.querySelector("#"+k).onchange=function(){ dirty=true; count(); }; });
    ["bS","bP","bB"].forEach(function(k){ V.querySelector("#"+k).oninput=function(){ dirty=true; }; });
    count();
    V.querySelector("#pv").onclick=function(){ var c=cur(); previewModal(c.subject,c.body,c.preheader,"marketing"); };
    V.querySelector("#tst").onclick=function(){ var c=cur(); testSend(c.subject,c.body,c.preheader,"marketing",this); };
    var sv=V.querySelector("#save"); if(sv) sv.onclick=function(){ save(); };
    var un=V.querySelector("#unsched"); if(un) un.onclick=async function(){ await sb.from("mth_broadcasts").update({ status:"draft", send_at:null }).eq("id",b.id); A.refresh(); };
    var wh=V.querySelector("#wh"); if(wh) wh.onchange=function(){ V.querySelector("#at").classList.toggle("hidden",wh.value!=="later"); };
    var go=V.querySelector("#go"); if(go) go.onclick=async function(){
      var c=cur(); if(!c.subject.trim()||!c.body.trim()) return MTH.toast("Add a subject and some words first.");
      var later=wh.value==="later", at=later?V.querySelector("#at").value:"";
      if(later&&!at) return MTH.toast("Pick a date and time.");
      var n=V.querySelector("#cnt").textContent;
      if(!confirm((later?"Schedule":"Send")+" “"+c.subject+"” to "+n+" people"+(later?" on "+new Date(at).toLocaleString():" now")+"?")) return;
      if(!(await save(true))) return;
      go.disabled=true; go.textContent="Working…";
      try{ await eng("schedule",{ id:b.id, send_at:later?new Date(at).toISOString():null }); if(!later) await eng("run_now").catch(function(){});
        MTH.toast(later?"Scheduled.":"On its way. Sending happens in small batches to protect your inbox reputation.",5000); A.go("email-bc"); }
      catch(e){ MTH.toast(e.message,6000); go.disabled=false; go.textContent="Send it"; }
    };
  }

  /* ================= SETTINGS ================= */
  A.screen("email-set",{ nav:"Settings", help:"Who your emails come from, your mailing address (required by law), and the one-time setup steps that keep you out of spam.", render: async function(V){
    var r=await sb.from("mth_email_settings").select("*").eq("id",1).single(); var s=r.data||{};
    var S={}; try{ S=await eng("status"); }catch(e){}
    var root=String(s.from_email||"").split("@")[1]||"marktalkshealth.com";
    V.innerHTML='<div class="adm-h"><div><div class="kick">Email</div><h1>Email <em>settings</em></h1></div><button class="b sm" id="save">Save</button></div>'+
      '<div class="em-grid"><div class="card panel"><h3>Who it’s from</h3><div class="em-two"><div><label class="em-lbl">From name</label><input class="inp" id="fN" value="'+esc(s.from_name||"")+'"></div><div><label class="em-lbl">From address</label><input class="inp" id="fE" value="'+esc(s.from_email||"")+'"></div></div>'+
      '<p class="em-help">The address must be on a domain verified in Resend. Domains Resend knows about: '+((S.domains||[]).map(function(d){ return '<b>'+esc(d.name||d.error)+'</b>'+(d.status?' ('+esc(d.status)+')':''); }).join(", ")||"none found")+'.</p>'+
      '<label class="em-lbl">Replies go to</label><input class="inp" id="rT" value="'+esc(s.reply_to||"")+'" placeholder="marktalkshealth@gmail.com">'+
      '<p class="em-help">Real replies are great for your reputation. Use an inbox you actually read.</p>'+
      '<label class="em-lbl">Mailing address (shown small at the bottom of every email)</label><input class="inp" id="mA" value="'+esc(s.mailing_address||"")+'" placeholder="PO Box 123, City, State 12345, USA">'+
      '<p class="em-help">Required by US law (CAN-SPAM). A PO box or virtual mailbox is fine. Nothing sends until this is filled in.</p>'+
      '<div class="em-two"><div><label class="em-lbl">Most emails per day</label><input class="inp" type="number" min="10" id="cap" value="'+(s.daily_cap||500)+'"></div><div style="align-self:end"><label class="check"><input type="checkbox" id="pz"'+(s.paused?" checked":"")+'> Pause all sending</label></div></div>'+
      '<p class="em-help">A new domain builds trust by growing slowly. Raise the daily limit gradually as your list grows (for example 500 → 1,000 → 2,500).</p></div>'+
      '<div class="card panel"><h3>One-time setup</h3><ol class="step-list">'+
      '<li><b>DMARC record</b>: open <a href="'+LINKS.cfDns+'" target="_blank" rel="noopener">Cloudflare → DNS records</a> → Add record → Type <code>TXT</code>, Name <code>_dmarc</code>, Content:<div class="code-box">v=DMARC1; p=none; rua=mailto:'+esc(s.reply_to||"marktalkshealth@gmail.com")+'</div></li>'+
      '<li><b>Bounce & spam protection</b> '+(S.webhook_secret?'<span class="pill own">Done</span>':'')+': open <a href="'+LINKS.resendWebhooks+'" target="_blank" rel="noopener">Resend → Webhooks</a> → Add Webhook → Endpoint URL:<div class="code-box">'+LINKS.hook+'</div>Tick <code>email.delivered</code>, <code>email.bounced</code>, <code>email.complained</code>, <code>email.opened</code>, <code>email.clicked</code>, <code>email.delivery_delayed</code>. Copy its <b>Signing Secret</b> (starts with <code>whsec_</code>), then open <a href="'+LINKS.secrets+'" target="_blank" rel="noopener">Supabase → Edge Function secrets</a> and add <code>RESEND_WEBHOOK_SECRET</code> with that value.</li>'+
      '<li><b>Open and click tracking</b> (optional): <a href="'+LINKS.resendDomains+'" target="_blank" rel="noopener">Resend → Domains</a> → '+esc(root)+' → Configuration → turn on Click Tracking and Open Tracking.</li></ol></div></div>';
    V.querySelector("#save").onclick=async function(){
      var row={ from_name:V.querySelector("#fN").value.trim()||"Mark Talks Health", from_email:V.querySelector("#fE").value.trim().toLowerCase(), reply_to:V.querySelector("#rT").value.trim()||null,
        mailing_address:V.querySelector("#mA").value.trim()||null, daily_cap:Math.max(10,Number(V.querySelector("#cap").value||500)), paused:V.querySelector("#pz").checked, updated_at:new Date().toISOString() };
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.from_email)) return MTH.toast("That from address doesn’t look right.");
      var u=await sb.from("mth_email_settings").update(row).eq("id",1); MTH.toast(u.error?u.error.message:"Saved"); };
  }});

  A.family("email",["email","email-seq","email-bc","email-set"],{ email:"Overview", "email-seq":"Automatic emails", "email-bc":"One-off emails", "email-set":"Settings" });

  /* person page: show their emails under everything else */
  var person=A.screens.person;
  if(person&&!person._em){ var orig=person.render; person._em=true;
    person.render=async function(V,arg){ await orig.call(this,V,arg); try{
      var d=await A.rpc("mth_admin_person_emails",{ p_email:decodeURIComponent(arg||"") },true); if(!d) return;
      var st=d.status||{}, lab={ subscribed:"Subscribed", unsubscribed:"Unsubscribed", bounced:"Bounced (blocked)", complained:"Marked as spam (blocked)" };
      var box=document.createElement("div"); box.className="card panel"; box.style.marginTop="14px";
      box.innerHTML='<h3>Email</h3><div class="row-i"><span>Status</span><b>'+esc(lab[st.email_status]||"—")+(st.email_status==="subscribed"&&!st.list_opt_in?" · not on the marketing list":"")+'</b></div>'+
        (st.consent_at?'<div class="row-i"><span>Joined the list</span><span class="small">'+A.when(st.consent_at,true)+(st.consent_source?' · from '+esc(st.consent_source):'')+'</span></div>':'')+
        (d.runs||[]).map(function(r){ return '<div class="row-i"><span>'+esc(r.sequence)+'</span><span class="small">'+(r.status==="active"?'next: email '+r.next_position+' '+A.when(r.next_at,true):r.status+(r.reason?' ('+esc(r.reason)+')':''))+'</span></div>'; }).join("")+
        '<div class="sec-h">Emails sent</div>'+((d.sends||[]).map(function(s){ return '<div class="row-i"><span>'+esc(s.subject||"")+'</span><span class="small">'+esc(s.status)+' · '+A.when(s.at,true)+'</span></div>'; }).join("")||'<p class="muted">None yet.</p>');
      V.appendChild(box);
    }catch(e){} };
  }
})();
