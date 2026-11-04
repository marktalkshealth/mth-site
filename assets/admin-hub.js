/* =================================================================
   ADMIN — CONTROL ROOM: the big row of buttons across the top,
   plus two new screens: Email journeys (a map of every automatic
   email) and Pages & funnels (every page, listed or unlisted).
   Loaded last, after every other admin file.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb, C=MTH.config;
  function prodShort(k){ return ((C.products||{})[k]||{}).short||k; }

  /* ================= EMAIL JOURNEYS (the map) ================= */
  function trigText(t){
    if(t==="list_join") return "Someone joins your email list";
    if(t==="manual") return "Only people you add by hand";
    if(t==="purchase:any") return "Someone buys any program";
    if(/^purchase:/.test(t)) return "Someone buys "+prodShort(t.split(":")[1]);
    return t;
  }
  function waitText(h){ h=Number(h||0); if(!h) return "Right away"; if(h%24===0){ var d=h/24; return d+" day"+(d===1?"":"s")+" later"; } return h+" hour"+(h===1?"":"s")+" later"; }
  function dayText(h){ h=Number(h||0); if(h<24) return h?"Hour "+h:"Day 0"; return "Day "+Math.round(h/24); }

  A.screen("journeys",{ nav:"Journey map", help:"A picture of every automatic email. Read each row left to right: what starts it, then each email in order with the wait in between. Tap any email to change its words.", render: async function(V){
    var r=await Promise.all([
      sb.from("mth_email_sequences").select("*").order("id"),
      sb.from("mth_email_steps").select("id,sequence_id,position,delay_hours,subject,active").order("position"),
      sb.from("mth_email_runs").select("sequence_id,status"),
      A.rpc("mth_admin_funnel",{ p_days:30 },true).catch(function(){ return []; })
    ]);
    var seqs=r[0].data||[], steps=r[1].data||[], runs=r[2].data||[], F=r[3]||[];
    var T={ v:0,j:0,s:0,p:0 }; F.forEach(function(d){ T.v+=+d.visits; T.j+=+d.list_joins; T.s+=+d.signups; T.p+=+d.purchases; });
    var welcome=seqs.filter(function(s){ return s.trigger==="list_join"&&s.active; })[0];
    var buyers=seqs.filter(function(s){ return /^purchase:/.test(s.trigger)&&s.active; });
    var nSteps=function(s){ return steps.filter(function(x){ return x.sequence_id===s.id&&x.active!==false; }).length; };

    /* the big picture: how a stranger becomes a member */
    var big=[
      ["👀","Someone finds you","Ads, social posts, Google, YouTube",T.v+" visitors (30 days)",""],
      ["📝","Free gut quiz","marktalkshealth.com/start · or the free assessment","Gives their email to see results","pages"],
      ["✉️","Joins your list",welcome?"Starts “"+welcome.name+"” ("+nSteps(welcome)+" emails)":"No welcome journey switched on",T.j+" joined (30 days)",welcome?"email-seq/"+welcome.id:"email-seq"],
      ["💳","Buys a protocol","$97 · Gut, Diabetes or GLP-1",T.p+" sales (30 days)","sales"],
      ["🎓","New member",buyers.length?buyers.length+" welcome journey"+(buyers.length===1?"":"s")+", one per program":"No member journeys yet","Course + app + emails","journeys"]
    ];
    var bigHtml='<div class="jm-big">'+big.map(function(b,i){
      return (i?'<span class="jm-arrow" aria-hidden="true">→</span>':'')+'<a class="jm-node card" href="#'+(b[4]||"journeys")+'"><span class="ic">'+b[0]+'</span><b>'+esc(b[1])+'</b><span>'+esc(b[2])+'</span><em>'+esc(b[3])+'</em></a>'; }).join("")+'</div>';

    /* one row per journey */
    function lane(s){
      var st=steps.filter(function(x){ return x.sequence_id===s.id; }).sort(function(a,b){ return a.position-b.position; });
      var act=runs.filter(function(x){ return x.sequence_id===s.id&&x.status==="active"; }).length, done=runs.filter(function(x){ return x.sequence_id===s.id&&x.status==="done"; }).length;
      var t=0, track='<div class="jm-start"><span>Starts when</span><b>'+esc(trigText(s.trigger))+'</b></div>';
      st.forEach(function(x,i){ t+=Number(x.delay_hours||0);
        track+='<div class="jm-wait"><i></i><span>'+esc(waitText(x.delay_hours))+'</span></div>'+
          '<a class="jm-mail'+(x.active===false?' off':'')+'" href="#email-seq/'+s.id+'" title="Change this email"><span class="d">'+dayText(t)+' · Email '+(i+1)+(x.active===false?' · skipped':'')+'</span><b>'+esc(x.subject||"(no subject yet)")+'</b></a>'; });
      track+='<div class="jm-wait"><i></i><span>&nbsp;</span></div><div class="jm-end"><b>Journey ends</b><span>'+(s.kind==="onboarding"?"They keep their course and app":"They stay on your list for one-off emails")+'</span></div>';
      return '<div class="card jm-lane'+(s.active?'':' paused')+'"><div class="jm-lh"><div><h3>'+esc(s.name)+'</h3><span class="small">'+(s.kind==="onboarding"?"Program welcome · goes to everyone who bought":"Marketing · goes to people on your list")+'</span></div>'+
        '<div class="jm-stats"><span><b>'+act+'</b> in it now</span><span><b>'+done+'</b> finished</span>'+(s.active?'<span class="pill own">On</span>':'<span class="pill">Paused</span>')+'<a class="b sm ghost" href="#email-seq/'+s.id+'">Edit emails</a></div></div>'+
        '<div class="jm-track">'+track+'</div>'+
        (s.stop_on_purchase?'<div class="jm-branch">↳ <b>If they buy</b> at any point, they leave this journey early and start the new-member journey for what they bought, so they never get “please buy” emails after paying.</div>':'')+'</div>';
    }
    V.innerHTML='<div class="pf-explain"><b>How your emails work</b><span>① Something happens (they join your list or buy)</span><span>② That starts one journey</span><span>③ The emails in it go out by themselves, one after another, with a wait between each</span><span>④ Tap any email to change its words</span></div>'+
      '<div class="adm-h"><div><div class="kick">Email journeys</div><h1>How your emails <em>flow</em></h1></div><div class="acts"><a class="b sm ghost" href="#email-bc/new">Write a one-off email</a><a class="b sm" href="#email-seq">All automatic emails</a></div></div>'+
      '<div class="sec-h">The big picture · stranger to member</div>'+bigHtml+
      '<div class="sec-h">Every automatic journey</div>'+(seqs.map(lane).join("")||'<div class="card panel"><p class="muted">No automatic emails yet. <a href="#email-seq">Make your first one</a>.</p></div>')+
      '<p class="small" style="margin-top:14px">Emails go out by themselves every 5 minutes. Changing an email’s words updates it for everyone, including people already part-way through.</p>';
  }});

  /* ================= PAGES & FUNNELS ================= */
  /* where: menu = top menu · footer = bottom of every page · hidden = only reachable by a link you share (ads, bio, emails) · members = signed-in only · admin */
  var PAGES=[
    ["index","/","Home page","Info","menu",true,"The front door. App demo, then the free Healing Assessment."],
    ["start","/start","Free 60-second gut quiz","Funnel","hidden",true,"Where your Meta ads send people. Quiz first, then results with the $97 offer."],
    ["gut","/gut","Gut Health Protocol","Sales page","footer",true,"Your main sales page, with checkout at the bottom. Your social bio link."],
    ["diabetes","/diabetes","Diabetes Protocol","Sales page","footer",true,"Sales page with checkout at the bottom."],
    ["glp1","/glp1","GLP-1 Weight Loss Protocol","Sales page","footer",true,"Sales page with checkout at the bottom."],
    ["assessment","/assessment","Free Healing Assessment","Funnel","hidden",true,"5-minute assessment. Gives a Healing Score and the 3 changes that matter most."],
    ["snapshot","/snapshot","Healing Snapshot","Funnel","hidden",false,"Part 1 of your method: a one-page snapshot to take to the doctor."],
    ["checkin","/checkin","Weekly check-in","Members","hidden",false,"Part 5 of your method: 2-minute weekly check-in and progress."],
    ["protocols","/protocols","Courses","Info","menu",true,"All your programs side by side."],
    ["blog","/blog/","Blog","Info","menu",true,"Your research articles. Each one shows on Google."],
    ["healing","/healing","How healing works","Info","hidden",true,"Your 5-part method explained. On Google, but not in the menu."],
    ["library","/library","Library","Info","hidden",false,"Free guides and ebooks. Not on Google yet."],
    ["picks","/picks","My Picks","Info","footer",true,"Products you recommend."],
    ["partners","/partners","Work with me","Info","footer",true,"For brands that want to work with you."],
    ["get-app","/get-app","Get the app","Members","hidden",true,"Puts the app on a phone in two taps."],
    ["go","/go","Tracking links","Funnel","hidden",false,"Not a real page: post links pass through here so you can see which post brought each sale."],
    ["login","/login","Sign in","Members","members",false,"Google or email sign-in."],
    ["welcome","/welcome","Welcome (after buying)","Members","members",false,"The thank-you page right after checkout."],
    ["course","/course","Course","Members","members",false,"The lessons for whatever they bought."],
    ["app","/app","Healing app","Members","members",false,"Their personal plan and dashboard."],
    ["community","/community","Healing Hub","Members","members",false,"The members' space."],
    ["account","/account","My account","Members","members",false,"Their programs, receipts and settings."],
    ["privacy","/privacy","Privacy policy","Legal","footer",true,""],
    ["terms","/terms","Terms of use","Legal","footer",true,""],
    ["refunds","/refunds","Refund policy","Legal","footer",true,""],
    ["admin","/admin","This control room","Admin","admin",false,"Only you can open it."]
  ];
  var WHERE={ menu:["In the top menu","on"], footer:["In the footer","on"], hidden:["Unlisted · link only","un"], members:["Members only","mem"], admin:["Only you","mem"] };
  var FUNNELS=[
    ["Paid ads","Meta ad","/start","Gut quiz","Results + $97 offer","Checkout","Welcome email journey"],
    ["Social bio","Instagram / TikTok bio","/gut","Sales page","Checkout","Welcome page","Gut new-member emails"],
    ["Posts","Comment GUT → DM link","/go","Tracked link","Sales page or quiz","Checkout",""],
    ["Website","Google / blog","/","Home page","Free Healing Assessment","Email list","Welcome email journey"]
  ];
  var filter="all", pdays=30;

  /* Nov 4 2026: one clear picture — how it works, where people land, the front door, the 3 funnels, the unlisted pages */
  A.screen("pages",{ nav:"Pages & funnels", render: async function(V){
    var stats={}, seqs=[];
    var r=await Promise.all([
      A.rpc("mth_admin_page_stats",{ p_days:pdays },true).catch(function(){ return []; }),
      sb.from("mth_email_sequences").select("trigger,active").then(function(x){ return x.data||[]; },function(){ return []; })
    ]);
    (r[0]||[]).forEach(function(x){ stats[x.page]=x; }); seqs=r[1];
    var S=function(k){ var x=stats[k]||(k==="index"?stats[""]:null)||{}; return { v:Number(x.visitors)||0, j:(Number(x.list_joins)||0)+(Number(x.signups)||0), p:Number(x.purchases)||0 }; };
    var pct=function(a,b){ return b?Math.round(100*a/b)+"%":"–"; };
    var mailOn=function(t){ return seqs.some(function(q){ return q.trigger===t&&q.active; }); };
    var nums=function(k){ var x=S(k); return '<span class="pf-num"><b>'+x.v+'</b> visitors</span><span class="pf-num"><b>'+x.j+'</b> sign-ups</span><span class="pf-num"><b>'+x.p+'</b> sales</span>'; };
    var pg=function(k){ for(var i=0;i<PAGES.length;i++) if(PAGES[i][0]===k) return PAGES[i]; return null; };
    var openA=function(u){ return '<a class="pf-open" href="'+esc(u)+'" target="_blank" rel="noopener">marktalkshealth.com'+esc(u)+' ↗</a>'; };

    /* where people land: every page with visitors, biggest first */
    var land=PAGES.map(function(p){ return { p:p, s:S(p[0]) }; }).filter(function(x){ return x.s.v>0&&x.p[4]!=="admin"; }).sort(function(a,b){ return b.s.v-a.s.v; }).slice(0,8);
    var maxV=land.length?land[0].s.v:1;
    var landHtml=land.length?land.map(function(x){ return '<div class="pf-bar"><span class="pf-bar-n">'+esc(x.p[2])+'</span><span class="pf-bar-t"><i style="width:'+Math.max(3,Math.round(100*x.s.v/maxV))+'%"></i></span><b>'+x.s.v+'</b></div>'; }).join(""):'<p class="muted small" style="margin:0">No visitors in this period yet.</p>';

    /* the 3 funnels */
    var F3=[["gut","gut","Gut Health","Social bio, posts and ads (through the free gut quiz)"],["sugar","diabetes","Diabetes","Posts and links you share"],["glp1","glp1","GLP-1 Weight Loss","Posts and links you share"]];
    var funnelHtml=F3.map(function(f){
      var sp=S(f[1]), on=mailOn("purchase:"+f[0]), quiz=f[0]==="gut"?S("start"):null;
      return '<div class="card pf-fun"><div class="pf-fun-h"><b>'+esc(f[2])+'</b><span class="small muted">'+esc(f[3])+'</span></div><div class="pf-flow">'+
        (quiz?'<div class="pf-step"><span class="pf-k">Free gut quiz</span><b>'+quiz.v+'</b><span>visitors</span><small>'+quiz.j+' gave their email</small>'+openA("/start")+'</div><span class="pf-arr">→</span>':'')+
        '<div class="pf-step"><span class="pf-k">Sales page</span><b>'+sp.v+'</b><span>visitors</span>'+openA("/"+f[1])+'</div><span class="pf-arr">→</span>'+
        '<div class="pf-step"><span class="pf-k">Bought · $97</span><b>'+sp.p+'</b><span>sales</span><small>'+pct(sp.p,sp.v)+' of visitors</small></div><span class="pf-arr">→</span>'+
        '<a class="pf-step '+(on?'ok':'warn')+'" href="#journeys"><span class="pf-k">Welcome emails</span><b>'+(on?'On':'Off')+'</b><span>'+(on?'running':'not set up yet')+'</span></a>'+
      '</div></div>'; }).join("");

    /* unlisted pages */
    var UN=["start","assessment","healing","library","snapshot","get-app","go"];
    var unHtml=UN.map(function(k){ var p=pg(k); if(!p) return ""; var x=S(k);
      return '<div class="card pf-un"><b>'+esc(p[2])+'</b><span class="small muted">'+esc(p[6]||"")+'</span><div class="pf-nums">'+nums(k)+'</div>'+openA(p[1])+'</div>'; }).join("");

    /* everything else, folded away */
    var rest=PAGES.filter(function(p){ return ["index","gut","diabetes","glp1"].indexOf(p[0])<0&&UN.indexOf(p[0])<0; });
    var restHtml='<table class="ct pf-t"><thead><tr><th>Page</th><th>Who can find it</th><th>Visitors</th><th>Sign-ups</th><th>Sales</th></tr></thead><tbody>'+
      rest.map(function(p){ var x=S(p[0]), w=WHERE[p[4]]; return '<tr><td><b>'+esc(p[2])+'</b> '+openA(p[1])+'</td><td><span class="pf-w '+w[1]+'">'+w[0]+'</span></td><td>'+x.v+'</td><td>'+x.j+'</td><td>'+x.p+'</td></tr>'; }).join("")+'</tbody></table>';

    var h=S("index");
    V.innerHTML=
      '<div class="pf-explain"><b>How your website works</b><span>① People arrive from ads, social posts or Google</span><span>② They land on <u>one</u> page</span><span>③ That page either <b>sells</b> ($97 checkout) or <b>collects an email</b> (free quiz or assessment)</span><span>④ Your emails take it from there</span>'+
        '<select class="sel" id="pd" style="width:auto;margin-left:auto"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div>'+
      '<div class="pf-top">'+
        '<div class="card panel"><h3>Where people land</h3>'+landHtml+'</div>'+
        '<div class="card panel pf-home"><h3>Front door · Home page</h3><div class="pf-nums big">'+nums("index")+'</div><p class="small muted" style="margin:4px 0">Everyone from Google and your blog starts here. It shows the app, then the free Healing Assessment.</p>'+openA("/")+'</div>'+
      '</div>'+
      '<div class="sec-h">Your 3 funnels · read left to right</div><div class="pf-funs">'+funnelHtml+'</div>'+
      '<div class="sec-h">Unlisted pages · not in any menu, only reached by a link you share (ads, bio, emails)</div><div class="pf-uns">'+unHtml+'</div>'+
      '<details class="pf-rest"><summary>Everything else · menu pages, members pages and legal ('+rest.length+')</summary><div class="card" style="overflow:auto;margin-top:6px">'+restHtml+'</div></details>';
    V.querySelector("#pd").value=String(pdays);
    V.querySelector("#pd").onchange=function(){ pdays=Number(this.value); A.refresh(); };
  }});

  /* ================= THE TOP ROW ================= */
  A.departments([
    { k:"home", ic:"🏠", t:"Home", s:"Today", ids:["today","attention"], tabs:{ today:"Today", attention:"Needs attention" } },
    { k:"crm", ic:"👥", t:"CRM", s:"People & sales", ids:["contacts","sales","access"], tabs:{ contacts:"People", sales:"Sales", access:"Give access" } },
    { k:"email", ic:"✉️", t:"Email journeys", s:"Automatic emails", ids:["journeys","email-seq","email-bc","email","email-set"], tabs:{ journeys:"Journey map", "email-seq":"Automatic emails", "email-bc":"One-off emails", email:"Health & numbers", "email-set":"Settings" } },
    { k:"ads", ic:"📣", t:"Paid ads", s:"Meta ads", ids:["ads"] },
    { k:"pages", ic:"🧭", t:"Pages", s:"Home, funnels, unlisted", ids:["pages"] },
    { k:"stats", ic:"📈", t:"Analytics", s:"What’s working", ids:["overview","conversions"], tabs:{ overview:"Dashboard", conversions:"What’s working" } },
    { k:"edit", ic:"✎", t:"Edit", s:"Pages, blog, courses", ids:["edit","words","blog","content","thumbs"], tabs:{ edit:"All", words:"Website pages", blog:"Blog", content:"Courses", thumbs:"Thumbnails" } },
    { k:"social", ic:"🎬", t:"Social", s:"Posts", ids:["studio"] },
    { k:"vault", ic:"📚", t:"Vault", s:"Ebooks & books", ids:["library"] },
    { k:"money", ic:"🤝", t:"Brand deals", s:"Sponsors", ids:["brands","quote","ratecard"], tabs:{ brands:"Brand deals", quote:"Price calculator", ratecard:"Rate card" } },
    { k:"settings", ic:"⚙", t:"Settings", s:"Connections", ids:["integrations"] }
  ]);
})();
