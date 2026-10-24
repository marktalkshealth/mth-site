/* =================================================================
   ADMIN — BRAND DEALS
   Sponsors and ad licensing: a pipeline of companies, a quote calculator
   built on Mark's rate card, licence terms (30/60/90 days … perpetual),
   a contract template, pitch emails and licence-renewal reminders.
   Tables: mth_brands, mth_deals, mth_brand_settings (admin-only).
   Public inquiries arrive from partners.html via mth_brand_inquiry().
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, sb=MTH.sb;

  var STAGES=[
    ["prospect","Want to pitch","#cbbfae"],["inquiry","They reached out","#d9b979"],["pitched","Pitched","#e3a06f"],
    ["talking","Talking","#c0623f"],["quoted","Quote sent","#b8924a"],["signed","Signed","#7a8f6e"],
    ["delivered","Delivered","#5f8f6b"],["paid","Paid","#2e5c45"],["lost","Not now","#bbbbbb"]];
  var DSTATUS=[["draft","Draft"],["sent","Sent to brand"],["accepted","Accepted"],["signed","Signed"],["delivered","Delivered"],["paid","Paid"],["declined","Declined"]];
  function stName(k){ for(var i=0;i<STAGES.length;i++) if(STAGES[i][0]===k) return STAGES[i][1]; return k||""; }
  function stColor(k){ for(var i=0;i<STAGES.length;i++) if(STAGES[i][0]===k) return STAGES[i][2]; return "#ccc"; }
  function dsName(k){ for(var i=0;i<DSTATUS.length;i++) if(DSTATUS[i][0]===k) return DSTATUS[i][1]; return k||""; }
  function pill(k){ return '<span class="pill" style="background:'+stColor(k)+'26;color:#3b332d;border:1px solid '+stColor(k)+'">'+esc(stName(k))+'</span>'; }
  var $=function(id){ return document.getElementById(id); };
  function money(c){ c=Math.round(c||0); return (c<0?"−":"")+A.money(Math.abs(c)); }
  function addDays(d,n){ var x=new Date(d+"T12:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); }
  function daysLeft(d){ return Math.round((new Date(d+"T12:00:00")-new Date(A.today()+"T12:00:00"))/864e5); }
  function nice(d){ if(!d) return "—"; return new Date(d+"T12:00:00").toLocaleDateString(undefined,{ month:"long", day:"numeric", year:"numeric" }); }

  /* ---------------- rate card (Mark can change every number) ---------------- */
  var DEF={
    business:"Mark Talks Health", legal_name:"", email:"marktalkshealth@gmail.com", website:"marktalkshealth.com", place:"",
    formats:[
      { k:"short", name:"Short-form ad (Reel / TikTok / Short, up to 60 sec, 9:16)", fee:40000, views:"shorts" },
      { k:"integration", name:"Woven-in ad segment inside a YouTube documentary (60–90 sec)", fee:90000, views:"youtube" },
      { k:"hero", name:"Stand-alone hero ad (30–60 sec, 16:9 plus a 9:16 cut)", fee:150000, views:"" },
      { k:"film", name:"Full branded mini-documentary (5–10 min)", fee:350000, views:"youtube" },
      { k:"cutdown", name:"Extra cut-down or hook variation", fee:15000, views:"" }
    ],
    organic_pct:15, paid_pct:25, whitelist_pct:30, exclusive_pct:10, perpetual_x:4,
    raw_pct:25, rush_pct:25, bundle_min:3, bundle_pct:15,
    cpm:2000, views_youtube:0, views_shorts:0,
    deposit:50, revisions:2
  };
  var RC=null;
  async function loadRC(force){
    if(RC&&!force) return RC;
    var r=await sb.from("mth_brand_settings").select("data").eq("id",1).maybeSingle();
    if(r.error) throw r.error;
    var d=(r.data&&r.data.data)||{};
    RC=Object.assign({},DEF,d); if(!Array.isArray(RC.formats)||!RC.formats.length) RC.formats=DEF.formats.slice();
    return RC;
  }
  async function saveRC(d){ var r=await sb.from("mth_brand_settings").upsert({ id:1, data:d, updated_at:new Date().toISOString() }); if(r.error){ MTH.toast("Couldn’t save: "+r.error.message); throw r.error; } RC=Object.assign({},DEF,d); MTH.toast("Rate card saved"); }

  /* ---------------- data ---------------- */
  async function brands(){ var r=await sb.from("mth_brands").select("*").order("updated_at",{ ascending:false }); if(r.error) throw r.error; return r.data||[]; }
  async function deals(brandId){ var q=sb.from("mth_deals").select("*").order("created_at",{ ascending:false }); if(brandId) q=q.eq("brand_id",brandId); var r=await q; if(r.error) throw r.error; return r.data||[]; }
  async function saveBrand(b){ var row=Object.assign({},b); delete row.created_at; row.updated_at=new Date().toISOString();
    var r=row.id?await sb.from("mth_brands").update(row).eq("id",row.id).select().single():await sb.from("mth_brands").insert(row).select().single();
    if(r.error){ MTH.toast("Couldn’t save: "+r.error.message); throw r.error; } return r.data; }
  async function saveDeal(d){ var row=Object.assign({},d); delete row.created_at; row.updated_at=new Date().toISOString();
    var r=row.id?await sb.from("mth_deals").update(row).eq("id",row.id).select().single():await sb.from("mth_deals").insert(row).select().single();
    if(r.error){ MTH.toast("Couldn’t save: "+r.error.message); throw r.error; } return r.data; }

  /* ---------------- the price maths ---------------- */
  var DUR=[[30,"30 days"],[60,"60 days"],[90,"90 days"],[180,"6 months"],[365,"1 year"],[0,"Forever (perpetual)"]];
  function durName(d){ for(var i=0;i<DUR.length;i++) if(DUR[i][0]===Number(d)) return DUR[i][1]; return d+" days"; }
  function defaultRights(){ return { mine:true, organic:true, paid:false, whitelist:false, days:30, excl_days:0, raw:false, rush:false, ai_ok:true }; }
  function price(items,R,rc){
    rc=rc||RC; R=Object.assign(defaultRights(),R||{});
    var lines=[], prod=0, count=0;
    (items||[]).forEach(function(it){ var q=Math.max(0,Number(it.qty)||0); if(!q) return;
      var f=rc.formats.filter(function(x){ return x.k===it.k; })[0]; if(!f) return;
      var fee=it.fee!=null&&it.fee!==""?Number(it.fee):f.fee; prod+=q*fee; if(it.k!=="cutdown") count+=q;
      lines.push([q+" × "+f.name, q*fee, "make"]); });
    if(count>=rc.bundle_min&&rc.bundle_pct>0){ var dsc=-Math.round(prod*rc.bundle_pct/100); lines.push(["Bundle saving ("+count+" videos, "+rc.bundle_pct+"% off)",dsc,"make"]); prod+=dsc; }
    var base=prod, perp=Number(R.days)===0, months=perp?0:Number(R.days)/30;
    /* audience: posting on Mark's own channels */
    if(R.mine){ var aud=0;
      (items||[]).forEach(function(it){ var f=rc.formats.filter(function(x){ return x.k===it.k; })[0]; if(!f||!f.views) return;
        var v=Number(rc["views_"+f.views])||0; aud+=Math.max(0,Number(it.qty)||0)*v/1000*rc.cpm; });
      if(aud>0) lines.push(["Posted on my channels (reach: "+money(rc.cpm)+" per 1,000 average views)",Math.round(aud),"reach"]);
    }
    if(perp&&(R.organic||R.paid)) lines.push(["Licence: brand may use it forever on "+(R.paid?"its own pages and in paid ads":"its own pages")+" ("+rc.perpetual_x+"× the production fee)",base*rc.perpetual_x,"rights"]);
    else {
      if(R.organic) lines.push(["Licence: brand posts it on its own pages, "+durName(R.days)+" ("+rc.organic_pct+"% per 30 days)",base*rc.organic_pct/100*months,"rights"]);
      if(R.paid) lines.push(["Licence: brand runs it as paid ads, "+durName(R.days)+" ("+rc.paid_pct+"% per 30 days)",base*rc.paid_pct/100*months,"rights"]);
    }
    if(R.whitelist){ var wm=perp?12:months; lines.push(["Whitelisting: ads run from my own account, "+(perp?"1 year":durName(R.days))+" ("+rc.whitelist_pct+"% per 30 days)",base*rc.whitelist_pct/100*wm,"rights"]); }
    if(Number(R.excl_days)>0) lines.push(["Category exclusivity, "+durName(R.excl_days)+" ("+rc.exclusive_pct+"% per 30 days)",base*rc.exclusive_pct/100*(Number(R.excl_days)/30),"rights"]);
    if(R.raw) lines.push(["Raw footage and project files (+"+rc.raw_pct+"%)",base*rc.raw_pct/100,"extra"]);
    if(R.rush) lines.push(["Rush delivery (+"+rc.rush_pct+"%)",base*rc.rush_pct/100,"extra"]);
    lines=lines.map(function(l){ return [l[0],Math.round(l[1]/100)*100,l[2]]; }); /* whole dollars */
    var total=lines.reduce(function(s,l){ return s+l[1]; },0);
    total=Math.round(total/500)*500; /* round to the nearest $5 */
    return { lines:lines, total:total, base:base, count:count };
  }

  /* ---------------- contract template ---------------- */
  function contractText(deal,brand,rc){
    var R=Object.assign(defaultRights(),deal.rights||{}), p=price(deal.items,R,rc), perp=Number(R.days)===0;
    var items=(deal.items||[]).filter(function(i){ return Number(i.qty)>0; }).map(function(i){ var f=rc.formats.filter(function(x){ return x.k===i.k; })[0]||{name:i.k}; return "   • "+i.qty+" × "+f.name; }).join("\n")||"   • (add deliverables)";
    var where=[]; if(R.mine) where.push("published by Creator on Creator’s channels"); if(R.organic) where.push("posted by Brand on Brand’s own websites and social media pages"); if(R.paid) where.push("used by Brand in paid advertising"); if(R.whitelist) where.push("run as paid advertising from Creator’s own social account (whitelisting)");
    var dep=Number(deal.deposit_pct!=null?deal.deposit_pct:rc.deposit)||0;
    var live=deal.live_date?nice(deal.live_date):"the date the Content is first delivered";
    return [
"BRAND CONTENT & LICENSING AGREEMENT",
"",
"TEMPLATE — have a lawyer review this before you use it for real.",
"",
"Date: "+nice(A.today()),
"",
"Between: "+(rc.legal_name||"[Your full legal name]")+", doing business as "+rc.business+" (\"Creator\"), "+rc.email,
"And: "+(brand.name||"[Brand]")+" (\"Brand\")"+(brand.contact_name?", attention "+brand.contact_name:"")+(brand.contact_email?", "+brand.contact_email:""),
"",
"1. THE WORK",
"Creator will produce the following video content (the \"Content\"):",
items,
"Brand will supply product information, any required talking points and approved claims within 5 business days of signing. Creator keeps creative control over style, script and editing, in Creator’s documentary style.",
"",
"2. REVIEWS",
"Brand may request up to "+rc.revisions+" rounds of reasonable changes to each piece before it is final. Further rounds are billed at 10% of that piece’s fee.",
"",
"3. FEE AND PAYMENT",
"Total fee: "+money(p.total)+" (USD).",
dep>0?dep+"% ("+money(p.total*dep/100)+") is due on signing and work starts once it is received. The remaining "+(100-dep)+"% ("+money(p.total*(100-dep)/100)+") is due on delivery of the final files, within 14 days of invoice.":"The full fee is due within 14 days of delivery of the final files.",
"",
"4. OWNERSHIP AND LICENCE",
"Creator owns the Content, including the footage, likeness, voice and artwork. On full payment, Creator grants Brand a non-exclusive licence to use the final Content as follows:",
"   • Where: "+(where.join("; ")||"[choose where it may be used]")+".",
"   • How long: "+(perp?"no end date (perpetual), for the final Content as delivered":durName(R.days)+", starting "+live+(deal.usage_ends?" and ending "+nice(deal.usage_ends):"")+"")+".",
"   • Territory: worldwide.",
"Brand may not edit the Content in a way that changes its meaning, combine it with health claims Creator did not approve, or use Creator’s name or likeness in any other material, without Creator’s written consent."+(R.raw?" Brand receives the raw footage and project files, under the same licence.":" Raw footage and project files are not included."),
perp?"":"After the licence ends, Brand will stop running the Content in new placements. Brand may renew the licence at Creator’s then-current rates; Creator will send a renewal offer before the end date.",
"",
"5. EXCLUSIVITY",
Number(R.excl_days)>0?"For "+durName(R.excl_days)+" from "+live+", Creator will not publish paid promotions for a direct competitor of Brand in the same product category.":"None. Creator may work with other brands, including in the same category.",
"",
"6. HEALTH CLAIMS AND HONESTY",
"Creator makes educational content, not medical advice. Brand warrants that every claim it asks Creator to make about its product is truthful and backed by competent evidence, and that the product is legal to sell where it is advertised. Creator may decline to say anything Creator believes is misleading, and has final approval over all health statements in the Content.",
"",
"7. DISCLOSURE",
"The Content will be clearly labelled as sponsored or paid (for example \"#ad\", \"paid partnership\", or a spoken disclosure), as required by advertising rules where it runs. Where the Content includes AI-generated imagery of Creator, Brand will not present it as an unpaid customer testimonial.",
"",
"8. DELIVERY",
"Creator will deliver the final Content by [delivery date]"+(R.rush?" (rush delivery)":"")+". Posting dates on Creator’s channels are agreed in writing.",
"",
"9. ENDING THE AGREEMENT",
"Either party may end this agreement in writing if the other breaks it and does not fix the problem within 10 days. If Brand cancels after work has started, the deposit is non-refundable and work completed so far is billed pro rata. Either party may end the agreement if the other’s conduct seriously harms its reputation.",
"",
"10. LIABILITY",
"Brand is responsible for its product and its claims, and will cover Creator for losses caused by them. Neither party is liable for indirect losses. Creator’s total liability is limited to the fee paid.",
"",
"11. GENERAL",
"This is the whole agreement. Changes must be in writing (email is fine). Governed by the laws of "+(rc.place||"[your province or state]")+".",
"",
"",
"Creator: ______________________________   Date: ____________",
(rc.legal_name||"[Your full legal name]")+", "+rc.business,
"",
"Brand: ________________________________   Date: ____________",
"Name and title: ______________________________, "+(brand.name||"[Brand]")
    ].join("\n");
  }

  /* ---------------- printable quote / contract (Save as PDF) ---------------- */
  function printDoc(title,html){
    var w=window.open("","_blank"); if(!w) return MTH.toast("Allow pop-ups for this site to open the printable page");
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>'+esc(title)+'</title>'+
      '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">'+
      '<style>body{font:15px/1.55 Inter,system-ui,sans-serif;color:#2b2724;max-width:760px;margin:40px auto;padding:0 28px}h1{font:500 40px/1.05 "Cormorant Garamond",Georgia,serif;margin:0 0 4px}h1 em{color:#c0623f}'+
      '.k{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c0623f;font-weight:700}table{width:100%;border-collapse:collapse;margin:18px 0}td{padding:10px 6px;border-bottom:1px solid #e7dccb;vertical-align:top}td:last-child{text-align:right;white-space:nowrap}'+
      '.tot td{font-weight:700;font-size:18px;border-top:2px solid #2b2724;border-bottom:0}.sm{font-size:13px;color:#6e6259}pre{white-space:pre-wrap;font:14px/1.6 Inter,system-ui,sans-serif}.bar{height:4px;background:linear-gradient(90deg,#c0623f,#b8924a,#7a8f6e);border-radius:4px;margin:14px 0 22px}'+
      '.pb{position:fixed;top:14px;right:14px;padding:10px 18px;border-radius:999px;border:0;background:#c0623f;color:#fff;font:600 14px Inter,sans-serif;cursor:pointer}@media print{.pb{display:none}body{margin:0 auto}}</style></head><body>'+
      '<button class="pb" onclick="print()">Save as PDF / Print</button>'+html+'</body></html>');
    w.document.close();
  }
  function quoteHtml(deal,brand,rc){
    var p=price(deal.items,deal.rights,rc), R=Object.assign(defaultRights(),deal.rights||{}), dep=Number(deal.deposit_pct!=null?deal.deposit_pct:rc.deposit)||0;
    return '<div class="k">'+esc(rc.business)+' · Proposal</div><h1>'+esc(deal.title||"Proposal")+' <em>for '+esc(brand.name||"")+'</em></h1><div class="bar"></div>'+
      '<p>Prepared for '+esc(brand.contact_name||brand.name||"")+' on '+esc(nice(A.today()))+'. Valid for 30 days.</p>'+
      '<table>'+p.lines.map(function(l){ return '<tr><td>'+esc(l[0])+'</td><td>'+money(l[1])+'</td></tr>'; }).join("")+
      '<tr class="tot"><td>Total</td><td>'+money(p.total)+'</td></tr></table>'+
      '<p class="sm"><b>Licence:</b> '+(Number(R.days)===0?"no end date":durName(R.days))+', worldwide, starting on delivery. '+
      (R.raw?'Raw files included. ':'')+(Number(R.excl_days)>0?'Category exclusivity for '+durName(R.excl_days)+'. ':'')+'</p>'+
      '<p class="sm"><b>Includes:</b> script and story in my documentary style, '+rc.revisions+' rounds of changes, clear sponsorship disclosure, and my approval over all health claims.</p>'+
      '<p class="sm"><b>Payment:</b> '+(dep>0?dep+'% on signing, '+(100-dep)+'% on delivery.':'on delivery.')+' Licences can be renewed at any time before they end.</p>'+
      '<p class="sm" style="margin-top:28px">'+esc(rc.legal_name||rc.business)+' · '+esc(rc.email)+' · '+esc(rc.website)+'</p>';
  }
  function quoteEmail(deal,brand,rc){
    var p=price(deal.items,deal.rights,rc);
    return "Hi "+((brand.contact_name||"").split(" ")[0]||"there")+",\n\nThanks for the chat. Here’s what I’d propose for "+(brand.name||"you")+":\n\n"+
      p.lines.map(function(l){ return "• "+l[0]+": "+money(l[1]); }).join("\n")+"\n\nTotal: "+money(p.total)+"\n\n"+
      "That includes the script and story in my documentary style, "+rc.revisions+" rounds of changes, and clear sponsorship disclosure. I keep approval over any health claims, which is what keeps my audience trusting the recommendation.\n\n"+
      "Happy to adjust the licence length or the number of videos to fit your budget. Want me to send the agreement?\n\n"+(rc.legal_name||"Mark")+"\n"+rc.business+" · "+rc.website;
  }

  /* ---------------- pitch emails ---------------- */
  function pitches(b,rc){
    var first=(b.contact_name||"").split(" ")[0]||"there", me=(rc.legal_name||"Mark").split(" ")[0];
    return [
      ["Cold pitch with a sample ad","A short idea for "+(b.name||"your brand"),
"Hi "+first+",\n\nI’m "+me+" from "+rc.business+". I make Vox-style health documentaries about fasting, gut health and metabolic repair, and I lost 100 pounds doing what I teach.\n\n"+
"I made a short sample ad for "+(b.name||"your product")+" in my style, to show how it could fit naturally inside a documentary instead of interrupting it:\n[link to your sample ad]\n\n"+
(b.fit?"Why I think it fits: "+b.fit+"\n\n":"")+
"If you like it, I can make versions for your own pages and paid ads, licensed for 30, 60 or 90 days, or longer.\n\nWould a 15-minute call next week work?\n\n"+me+"\n"+rc.business+" · "+rc.website],
      ["Reply to an inquiry","Re: working together",
"Hi "+first+",\n\nThanks for reaching out about "+rc.business+". I’d love to hear more about what you have in mind.\n\n"+
"Most brands start with one of these:\n• A woven-in segment inside one of my documentaries\n• A short-form ad (Reel / TikTok / Short) you can also run on your own pages\n• A stand-alone hero ad you license for paid ads\n\n"+
"Could you tell me your timeline, which platforms matter most, and a rough budget? I’ll send a proposal within 2 days.\n\n"+me],
      ["Licence renewal","Keep your ad running?",
"Hi "+first+",\n\nQuick heads-up: your licence for the "+rc.business+" ad ends soon. If it’s still performing, I can renew it for another 30, 60 or 90 days at the same rate, or make a fresh variation to beat ad fatigue.\n\nWant me to send the renewal?\n\n"+me],
      ["Follow-up (no reply)","Following up",
"Hi "+first+",\n\nJust floating this back to the top of your inbox. Happy to tweak the sample ad or send a version for a different product if that’s a better fit.\n\n"+me]
    ];
  }
  function mailto(to,subj,body){ return "mailto:"+encodeURIComponent(to||"")+"?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(body); }

  /* ================= SCREEN: BRANDS (pipeline) ================= */
  var bview=(function(){ try{ return localStorage.getItem("mth_brands_view")||"board"; }catch(e){ return "board"; } })();
  A.screen("brands",{ nav:"Brand deals", group:"Money", help:"Companies you want to work with. Add a brand, send a pitch, make a quote, then a contract. Licences that end soon show at the top so you can sell a renewal.",
  render: async function(V){
    var res=await Promise.all([brands(),deals(),loadRC()]), B=res[0], D=res[1];
    var byId={}; B.forEach(function(b){ byId[b.id]=b; });
    var open=B.filter(function(b){ return ["lost","paid"].indexOf(b.stage)<0; });
    var quoted=D.filter(function(d){ return d.status==="sent"||d.status==="accepted"; }).reduce(function(s,d){ return s+d.total_cents; },0);
    var yr=new Date().getFullYear();
    var won=D.filter(function(d){ return ["signed","delivered","paid"].indexOf(d.status)>=0&&new Date(d.created_at).getFullYear()===yr; }).reduce(function(s,d){ return s+d.total_cents; },0);
    var ending=D.filter(function(d){ return d.usage_ends&&["signed","delivered","paid"].indexOf(d.status)>=0&&daysLeft(d.usage_ends)<=30&&daysLeft(d.usage_ends)>=-14; }).sort(function(a,b){ return a.usage_ends<b.usage_ends?-1:1; });
    var due=B.filter(function(b){ return b.next_date&&b.next_date<=A.today()&&["lost","paid"].indexOf(b.stage)<0; });
    var newInq=B.filter(function(b){ return b.stage==="inquiry"; }).length;
    A.badge("brands",newInq);
    V.innerHTML='<div class="adm-h"><div><div class="kick">Money</div><h1>Brand <em>deals</em></h1></div><div class="acts"><a class="b sm ghost" href="#ratecard">Rate card</a><a class="b sm ghost" href="#quote">Price calculator</a><a class="b sm ghost" href="partners.html" target="_blank">Partner page ↗</a><button class="b sm" id="nb">Add a brand</button></div></div>'+
      '<div class="kpis" style="margin-bottom:14px">'+
        '<div class="card kpi"><b>'+open.length+'</b><span>Brands in progress</span></div>'+
        '<div class="card kpi'+(newInq?' warn':'')+'"><b>'+newInq+'</b><span>New inquiries</span></div>'+
        '<div class="card kpi"><b>'+money(quoted)+'</b><span>Quotes waiting</span></div>'+
        '<div class="card kpi"><b>'+money(won)+'</b><span>Signed in '+yr+'</span></div>'+
        '<div class="card kpi'+(ending.length?' warn':'')+'"><b>'+ending.length+'</b><span>Licences ending soon</span></div>'+
        '<div class="card kpi'+(due.length?' warn':'')+'"><b>'+due.length+'</b><span>Follow-ups due</span></div></div>'+
      (ending.length?'<div class="card panel" style="margin-bottom:14px;border-color:var(--gold)"><h3>Renewals to sell</h3>'+ending.map(function(d){ var b=byId[d.brand_id]||{}, n=daysLeft(d.usage_ends);
        return '<div class="row-i"><span><b>'+esc(b.name||"?")+'</b> · '+esc(d.title)+'<br><span class="small">'+(n<0?'Ended '+(-n)+' days ago':'Ends in '+n+' days')+' ('+nice(d.usage_ends)+')</span></span><a class="b sm" href="#brand/'+d.brand_id+'">Send renewal</a></div>'; }).join("")+'</div>':'')+
      (due.length?'<div class="card panel" style="margin-bottom:14px"><h3>Follow up today</h3>'+due.map(function(b){ return '<div class="row-i"><span><b>'+esc(b.name)+'</b> · '+esc(b.next_step||"Follow up")+'</span><a class="b sm ghost" href="#brand/'+b.id+'">Open</a></div>'; }).join("")+'</div>':'')+
      '<div class="bar"><div class="chips" style="margin:0">'+[["board","Board"],["list","List"]].map(function(v){ return '<button class="chip'+(bview===v[0]?' on':'')+'" data-v="'+v[0]+'">'+v[1]+'</button>'; }).join("")+'</div></div><div id="bv"></div>'+
      (B.length?'':'<div class="card panel" style="margin-top:14px"><h3>Start here</h3><ol class="step-list"><li>Open the <a href="#ratecard">Rate card</a> and check the prices. Change anything you like.</li><li>Click <b>Add a brand</b> for a company you’d love to work with. Write why they fit your channel.</li><li>Make a short sample ad for them with the documentary maker, then use <b>Pitch email</b> on their page.</li><li>When they reply, make a quote, then a contract, all from their page.</li></ol></div>');
    $("nb").onclick=async function(){ var n=prompt("Company name"); if(!n||!n.trim()) return; var b=await saveBrand({ name:n.trim().slice(0,200), stage:"prospect", next_step:"Make a sample ad and pitch", next_date:A.today() }); A.go("brand/"+b.id); };
    V.querySelectorAll("[data-v]").forEach(function(x){ x.onclick=function(){ bview=x.dataset.v; try{ localStorage.setItem("mth_brands_view",bview); }catch(e){} A.refresh(); }; });
    var dealsOf=function(id){ return D.filter(function(d){ return d.brand_id===id; }); };
    var bv=$("bv");
    if(bview==="list"){
      bv.innerHTML='<div class="card" style="overflow:auto"><table class="ct"><thead><tr><th>Brand</th><th>Stage</th><th class="hm">Contact</th><th>Next step</th><th class="hm">Deals</th></tr></thead><tbody>'+
        B.map(function(b){ var dd=dealsOf(b.id), v=dd.reduce(function(s,d){ return s+(d.status!=="declined"?d.total_cents:0); },0);
          return '<tr data-b="'+b.id+'"><td><b>'+esc(b.name)+'</b>'+(b.category?'<br><span class="small">'+esc(b.category)+'</span>':'')+'</td><td>'+pill(b.stage)+'</td><td class="hm">'+esc(b.contact_name||"")+'<br><span class="small">'+esc(b.contact_email||"")+'</span></td><td>'+esc(b.next_step||"")+(b.next_date?'<br><span class="small">'+esc(A.when(b.next_date))+'</span>':'')+'</td><td class="hm">'+(dd.length?dd.length+' · '+money(v):'—')+'</td></tr>'; }).join("")+'</tbody></table></div>';
      bv.querySelectorAll("[data-b]").forEach(function(r){ r.onclick=function(){ A.go("brand/"+r.dataset.b); }; });
    } else {
      bv.innerHTML='<div style="display:grid;grid-auto-flow:column;grid-auto-columns:minmax(190px,1fr);gap:10px;overflow-x:auto;padding-bottom:8px">'+STAGES.map(function(s){
        var L=B.filter(function(b){ return b.stage===s[0]; });
        return '<div data-col="'+s[0]+'" style="background:var(--bg2);border-radius:14px;padding:10px;min-height:160px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b style="font-size:13px"><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+s[2]+';margin-right:6px"></i>'+s[1]+'</b><span class="small">'+L.length+'</span></div>'+
          L.map(function(b){ var dd=dealsOf(b.id), v=dd.reduce(function(t,d){ return t+(d.status!=="declined"?d.total_cents:0); },0);
            return '<div class="card" draggable="true" data-b="'+b.id+'" style="padding:11px 12px;margin-bottom:8px;cursor:pointer"><b style="font-size:14.5px;display:block">'+esc(b.name)+'</b>'+
              (b.category?'<span class="small">'+esc(b.category)+'</span><br>':'')+(v?'<span class="pill own">'+money(v)+'</span>':'')+(b.source==="website"?'<span class="pill tag">Website</span>':'')+
              (b.next_step?'<div class="small" style="margin-top:4px">→ '+esc(b.next_step)+(b.next_date?' · '+esc(A.when(b.next_date)):'')+'</div>':'')+'</div>'; }).join("")+'</div>'; }).join("")+'</div>'+
        '<p class="small">Drag a card to another column to move it along.</p>';
      bv.querySelectorAll("[data-b]").forEach(function(c){
        c.onclick=function(){ A.go("brand/"+c.dataset.b); };
        c.addEventListener("dragstart",function(e){ e.dataTransfer.setData("text/plain",c.dataset.b); });
      });
      bv.querySelectorAll("[data-col]").forEach(function(col){
        col.addEventListener("dragover",function(e){ e.preventDefault(); col.style.outline="2px dashed var(--terra)"; });
        col.addEventListener("dragleave",function(){ col.style.outline=""; });
        col.addEventListener("drop",async function(e){ e.preventDefault(); col.style.outline=""; var id=Number(e.dataTransfer.getData("text/plain")); var b=byId[id]; if(!b||b.stage===col.dataset.col) return; await saveBrand({ id:id, stage:col.dataset.col }); A.refresh(); });
      });
    }
  }});

  /* ================= SCREEN: ONE BRAND ================= */
  A.screen("brand",{ parent:"brands", render: async function(V,arg){
    var id=Number(arg); var res=await Promise.all([sb.from("mth_brands").select("*").eq("id",id).maybeSingle(),deals(id),loadRC()]);
    if(res[0].error) throw res[0].error; var b=res[0].data, D=res[1], rc=res[2];
    if(!b){ V.innerHTML='<p>That brand doesn’t exist any more. <a href="#brands">Back to brand deals</a></p>'; return; }
    var P=pitches(b,rc);
    V.innerHTML='<div class="adm-h"><div><div class="kick"><a href="#brands" style="color:inherit">← Brand deals</a></div><h1>'+esc(b.name)+'</h1></div><div class="acts">'+pill(b.stage)+'</div></div>'+
      '<div class="pp"><div>'+
        '<div class="card panel"><h3>Details</h3><div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">'+
          f("bn","Company",b.name)+f("bw","Website",b.website)+f("bc","Category (e.g. electrolytes, telehealth)",b.category)+
          f("bcn","Contact name",b.contact_name)+f("bce","Contact email",b.contact_email)+f("bbu","Their budget",b.budget)+
          '<label class="small">Stage<select class="sel" id="bs">'+STAGES.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]===b.stage?' selected':'')+'>'+s[1]+'</option>'; }).join("")+'</select></label>'+
          f("bns","Next step",b.next_step)+'<label class="small">When<input class="inp" type="date" id="bnd" value="'+esc(b.next_date||"")+'" style="min-height:44px;font-size:15px"></label></div>'+
          '<label class="small" style="display:block;margin-top:10px">Why they fit my channel<textarea class="inp" id="bf" style="min-height:70px">'+esc(b.fit||"")+'</textarea></label>'+
          '<label class="small" style="display:block;margin-top:10px">Notes<textarea class="inp" id="bno">'+esc(b.notes||"")+'</textarea></label>'+
          '<div class="acts"><button class="b sm" id="bsave">Save</button><button class="b sm ghost" id="bdel">Delete brand</button></div></div>'+
        '<div class="card panel" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Quotes &amp; contracts</h3><button class="b sm" id="nd">New quote</button></div>'+
          (D.length?D.map(function(d){ return '<div class="row-i" style="cursor:pointer" data-d="'+d.id+'"><span><b>'+esc(d.title)+'</b><br><span class="small">'+esc(dsName(d.status))+(d.usage_ends?' · licence ends '+nice(d.usage_ends):'')+'</span></span><b>'+money(d.total_cents)+'</b></div>'; }).join(""):'<p class="small">No quotes yet. Click <b>New quote</b> to price a deal for them.</p>')+'</div>'+
      '</div><div>'+
        '<div class="card panel"><h3>Pitch email</h3><select class="sel" id="pt">'+P.map(function(p,i){ return '<option value="'+i+'">'+esc(p[0])+'</option>'; }).join("")+'</select>'+
          '<input class="inp" id="ps" style="margin-top:10px;min-height:44px;font-size:15px"><textarea class="inp" id="pb" style="margin-top:8px;min-height:260px;font-size:14.5px"></textarea>'+
          '<div class="acts"><a class="b sm" id="pm" href="#">Open in my email</a><button class="b sm ghost" id="pc">Copy</button><button class="b sm ghost" id="pmark">Mark as pitched</button></div>'+
          '<p class="small" style="margin-top:10px">Tip: the strongest pitch is a real sample ad made for them. Put its link where it says [link to your sample ad].</p></div>'+
      '</div></div>';
    function f(id,label,val){ return '<label class="small">'+label+'<input class="inp" id="'+id+'" value="'+esc(val||"")+'" style="min-height:44px;font-size:15px"></label>'; }
    function fillPitch(){ var p=P[Number($("pt").value)]; $("ps").value=p[1]; $("pb").value=p[2]; sync(); }
    function sync(){ $("pm").href=mailto($("bce").value,$("ps").value,$("pb").value); }
    $("pt").onchange=fillPitch; $("ps").oninput=sync; $("pb").oninput=sync; fillPitch();
    if(D.some(function(d){ return d.usage_ends&&daysLeft(d.usage_ends)<=30; })){ $("pt").value="2"; fillPitch(); }
    else if(b.stage==="inquiry"){ $("pt").value="1"; fillPitch(); }
    $("pc").onclick=function(){ A.copy("Subject: "+$("ps").value+"\n\n"+$("pb").value,"Email copied"); };
    $("pmark").onclick=async function(){ await saveBrand({ id:id, stage:"pitched", next_step:"Follow up if no reply", next_date:addDays(A.today(),5) }); MTH.toast("Marked as pitched. Follow-up set for 5 days from now."); A.refresh(); };
    $("bsave").onclick=async function(){ await saveBrand({ id:id, name:$("bn").value.trim()||b.name, website:$("bw").value.trim()||null, category:$("bc").value.trim()||null,
      contact_name:$("bcn").value.trim()||null, contact_email:$("bce").value.trim()||null, budget:$("bbu").value.trim()||null, stage:$("bs").value,
      next_step:$("bns").value.trim()||null, next_date:$("bnd").value||null, fit:$("bf").value.trim()||null, notes:$("bno").value }); MTH.toast("Saved"); A.refresh(); };
    $("bdel").onclick=async function(){ if(!confirm("Delete "+b.name+" and all its quotes?")) return; var r=await sb.from("mth_brands").delete().eq("id",id); if(r.error) return MTH.toast(r.error.message); A.go("brands"); };
    $("nd").onclick=async function(){ var d=await saveDeal({ brand_id:id, title:"Proposal for "+b.name, status:"draft", items:[{ k:"integration", qty:1 }], rights:defaultRights(), deposit_pct:rc.deposit, total_cents:0 });
      var p=price(d.items,d.rights,rc); await saveDeal({ id:d.id, total_cents:p.total }); A.go("deal/"+d.id); };
    V.querySelectorAll("[data-d]").forEach(function(r){ r.onclick=function(){ A.go("deal/"+r.dataset.d); }; });
  }});

  /* ---------------- shared quote builder (deal page + calculator) ---------------- */
  function builderHtml(items,R,rc){
    R=Object.assign(defaultRights(),R||{});
    var qty={}; (items||[]).forEach(function(i){ qty[i.k]=i.qty; });
    function ck(k,label,sub){ return '<label class="check" style="display:flex;gap:10px;align-items:flex-start;margin:8px 0"><input type="checkbox" data-r="'+k+'"'+(R[k]?' checked':'')+'><span><b style="font-weight:600">'+label+'</b>'+(sub?'<br><span class="small">'+sub+'</span>':'')+'</span></label>'; }
    return '<div class="sec-h" style="margin-top:0">1 · What you’ll make</div>'+
      rc.formats.map(function(fm){ return '<div class="row-i"><span>'+esc(fm.name)+'<br><span class="small">'+money(fm.fee)+' each</span></span><input class="inp" type="number" min="0" max="50" data-q="'+fm.k+'" value="'+(qty[fm.k]||0)+'" style="width:80px;min-height:42px;font-size:16px;text-align:center"></div>'; }).join("")+
      '<div class="sec-h">2 · Where it runs</div>'+
      ck("mine","On my channels","Adds a reach fee once you set your average views on the Rate card.")+
      ck("organic","On the brand’s own pages","Their website, Instagram, TikTok and so on.")+
      ck("paid","In the brand’s paid ads","They spend money to show it to new people. Worth more.")+
      ck("whitelist","Paid ads from my own account (whitelisting)","Ads show my name and face as the poster. Worth the most.")+
      '<div class="sec-h">3 · How long they can use it</div><div class="chips">'+DUR.map(function(d){ return '<button class="chip'+(Number(R.days)===d[0]?' on':'')+'" data-days="'+d[0]+'">'+d[1]+'</button>'; }).join("")+'</div>'+
      '<div class="sec-h">4 · Extras</div>'+
      '<label class="small">No competitor ads for<select class="sel" data-excl style="margin-top:4px"><option value="0">No exclusivity</option>'+[30,60,90,180].map(function(d){ return '<option value="'+d+'"'+(Number(R.excl_days)===d?' selected':'')+'>'+durName(d)+'</option>'; }).join("")+'</select></label>'+
      ck("raw","Raw footage and project files")+ck("rush","Rush delivery");
  }
  function readBuilder(root){
    var items=[]; root.querySelectorAll("[data-q]").forEach(function(i){ var q=Number(i.value)||0; if(q>0) items.push({ k:i.dataset.q, qty:q }); });
    var R=defaultRights(); root.querySelectorAll("[data-r]").forEach(function(c){ R[c.dataset.r]=c.checked; });
    var on=root.querySelector("[data-days].on"); R.days=on?Number(on.dataset.days):30;
    var ex=root.querySelector("[data-excl]"); R.excl_days=ex?Number(ex.value):0;
    return { items:items, rights:R };
  }
  function wireBuilder(root,onChange){
    root.querySelectorAll("[data-q],[data-r],[data-excl]").forEach(function(el){ el.addEventListener("input",onChange); el.addEventListener("change",onChange); });
    root.querySelectorAll("[data-days]").forEach(function(b){ b.onclick=function(){ root.querySelectorAll("[data-days]").forEach(function(x){ x.classList.toggle("on",x===b); }); onChange(); }; });
  }
  function totalHtml(p){
    var groups=[["make","Making it"],["reach","Reach"],["rights","Licence"],["extra","Extras"]];
    return groups.map(function(g){ var L=p.lines.filter(function(l){ return l[2]===g[0]; }); if(!L.length) return "";
      return '<div class="sec-h">'+g[1]+'</div>'+L.map(function(l){ return '<div class="row-i"><span style="font-size:14px">'+esc(l[0])+'</span><b style="white-space:nowrap">'+money(l[1])+'</b></div>'; }).join(""); }).join("")+
      '<div class="row-i" style="border-top:2px solid var(--ink);margin-top:8px;padding-top:12px"><b style="font-size:16px">Total</b><b style="font-family:var(--serif);font-size:38px;font-weight:500">'+money(p.total)+'</b></div>';
  }

  /* ================= SCREEN: PRICE CALCULATOR ================= */
  var calc=null;
  A.screen("quote",{ nav:"Price calculator", group:"Money", help:"Try out a price before you talk to a brand. Pick what you’ll make, where it runs and for how long. To send it, open the brand and make a quote there.",
  render: async function(V){
    var rc=await loadRC(); calc=calc||{ items:[{ k:"integration", qty:1 },{ k:"short", qty:2 }], rights:defaultRights() };
    V.innerHTML='<div class="adm-h"><div><div class="kick">Money</div><h1>Price <em>calculator</em></h1></div><div class="acts"><a class="b sm ghost" href="#ratecard">Change my rates</a></div></div>'+
      '<div class="cols"><div class="card panel" id="qb">'+builderHtml(calc.items,calc.rights,rc)+'</div><div><div class="card panel" style="position:sticky;top:90px"><h3>Price</h3><div id="qt"></div>'+
      '<p class="small" style="margin-top:12px">Licence prices are a share of the making fee for every 30 days. Forever is '+rc.perpetual_x+'× the making fee. Totals round to the nearest $5.</p></div></div></div>';
    var qb=$("qb"); function upd(){ calc=readBuilder(qb); $("qt").innerHTML=totalHtml(price(calc.items,calc.rights,rc)); } wireBuilder(qb,upd); upd();
  }});

  /* ================= SCREEN: ONE DEAL (quote → contract) ================= */
  A.screen("deal",{ parent:"brands", render: async function(V,arg){
    var id=Number(arg), rc=await loadRC();
    var r=await sb.from("mth_deals").select("*").eq("id",id).maybeSingle(); if(r.error) throw r.error; var d=r.data;
    if(!d){ V.innerHTML='<p>That quote doesn’t exist any more. <a href="#brands">Back</a></p>'; return; }
    var br=await sb.from("mth_brands").select("*").eq("id",d.brand_id).maybeSingle(); var b=(br.data)||{ name:"" };
    V.innerHTML='<div class="adm-h"><div><div class="kick"><a href="#brand/'+b.id+'" style="color:inherit">← '+esc(b.name)+'</a></div><h1>'+esc(d.title)+'</h1></div>'+
      '<div class="acts"><select class="sel" id="ds">'+DSTATUS.map(function(s){ return '<option value="'+s[0]+'"'+(s[0]===d.status?' selected':'')+'>'+s[1]+'</option>'; }).join("")+'</select></div></div>'+
      '<div class="chips"><button class="chip on" data-tab="q">1 · Quote</button><button class="chip" data-tab="c">2 · Contract</button></div>'+
      '<div id="tq"><div class="cols"><div class="card panel"><label class="small">Title<input class="inp" id="dt" value="'+esc(d.title)+'" style="min-height:44px;font-size:15px;margin-bottom:14px"></label><div id="qb">'+builderHtml(d.items,d.rights,rc)+'</div>'+
        '<div class="sec-h">5 · Dates and payment</div><div style="display:grid;gap:10px;grid-template-columns:1fr 1fr">'+
        '<label class="small">Licence starts<input class="inp" type="date" id="dl" value="'+esc(d.live_date||"")+'" style="min-height:44px;font-size:15px"></label>'+
        '<label class="small">Paid up front<select class="sel" id="dp">'+[0,25,50,100].map(function(x){ return '<option value="'+x+'"'+(Number(d.deposit_pct)===x?' selected':'')+'>'+x+'%</option>'; }).join("")+'</select></label></div>'+
        '<p class="small" id="dend"></p><label class="small" style="display:block;margin-top:8px">Private notes<textarea class="inp" id="dn" style="min-height:70px">'+esc(d.notes||"")+'</textarea></label></div>'+
        '<div><div class="card panel" style="position:sticky;top:90px"><h3>Quote</h3><div id="qt"></div><div class="acts"><button class="b sm" id="dsave">Save</button><button class="b sm ghost" id="dpdf">Quote as PDF</button><button class="b sm ghost" id="dmail">Email it</button></div></div></div></div></div>'+
      '<div id="tc" hidden><div class="card panel"><div class="msg" style="margin-bottom:12px">This is a starting template, not legal advice. Have a lawyer look over it once before you use it for real, then reuse it.</div>'+
        '<textarea class="inp" id="ct" style="min-height:60vh;font-size:14px;line-height:1.55"></textarea>'+
        '<div class="acts"><button class="b sm" id="csave">Save contract</button><button class="b sm ghost" id="cpdf">Contract as PDF</button><button class="b sm ghost" id="creb">Rebuild from the quote</button><button class="b sm ghost" id="ccopy">Copy</button></div>'+
        '<p class="small">Your name and province for the contract live on the <a href="#ratecard">Rate card</a>.</p></div></div>';
    var qb=$("qb"), cur=null;
    function endDate(){ var dl=$("dl").value; return (dl&&Number(cur.rights.days)>0)?addDays(dl,Number(cur.rights.days)-1):null; }
    function upd(){ cur=readBuilder(qb); var p=price(cur.items,cur.rights,rc); $("qt").innerHTML=totalHtml(p); cur.total=p.total;
      var e=endDate(); $("dend").textContent=Number(cur.rights.days)===0?"Licence: forever.":e?"Licence ends "+nice(e)+". You’ll see a renewal reminder 30 days before.":"Pick a start date to work out when the licence ends."; }
    wireBuilder(qb,upd); $("dl").onchange=upd; upd();
    function collect(){ return { id:id, title:$("dt").value.trim()||d.title, items:cur.items, rights:cur.rights, total_cents:cur.total, live_date:$("dl").value||null, usage_ends:endDate(), deposit_pct:Number($("dp").value), notes:$("dn").value, status:$("ds").value }; }
    async function save(quiet){ d=await saveDeal(collect()); if(!quiet) MTH.toast("Saved"); return d; }
    $("dsave").onclick=function(){ save(); };
    $("ds").onchange=async function(){ await save(true); var map={ sent:"quoted", accepted:"quoted", signed:"signed", delivered:"delivered", paid:"paid", declined:null };
      var ns=map[d.status]; if(ns&&STAGES.map(function(s){ return s[0]; }).indexOf(ns)>STAGES.map(function(s){ return s[0]; }).indexOf(b.stage)) await saveBrand({ id:b.id, stage:ns });
      if(d.status==="sent") await saveBrand({ id:b.id, next_step:"Check they got the quote", next_date:addDays(A.today(),3) });
      MTH.toast("Status: "+dsName(d.status)); };
    $("dpdf").onclick=async function(){ await save(true); printDoc(d.title,quoteHtml(d,b,rc)); };
    $("dmail").onclick=async function(){ await save(true); location.href=mailto(b.contact_email,d.title,quoteEmail(d,b,rc)); };
    V.querySelectorAll("[data-tab]").forEach(function(t){ t.onclick=async function(){ V.querySelectorAll("[data-tab]").forEach(function(x){ x.classList.toggle("on",x===t); });
      $("tq").hidden=t.dataset.tab!=="q"; $("tc").hidden=t.dataset.tab!=="c";
      if(t.dataset.tab==="c"){ await save(true); if(!$("ct").value) $("ct").value=d.contract||contractText(d,b,rc); } }; });
    $("csave").onclick=async function(){ var r=await saveDeal({ id:id, contract:$("ct").value }); d=r; MTH.toast("Contract saved"); };
    $("creb").onclick=async function(){ if(d.contract&&!confirm("Replace your edited contract with a fresh one from the quote?")) return; await save(true); $("ct").value=contractText(d,b,rc); };
    $("ccopy").onclick=function(){ A.copy($("ct").value,"Contract copied"); };
    $("cpdf").onclick=function(){ printDoc("Agreement · "+b.name,'<pre>'+esc($("ct").value)+'</pre>'); };
  }});

  /* ================= SCREEN: RATE CARD ================= */
  A.screen("ratecard",{ nav:"Rate card", group:"Money", help:"Your prices. Every quote is worked out from these numbers, so change them as you grow. The starting numbers are typical for new creators with strong production; raise them once you have samples and views.",
  render: async function(V){
    var rc=await loadRC(true);
    function n(k,label,suf,help){ return '<label class="small">'+label+'<div style="display:flex;align-items:center;gap:6px"><input class="inp" type="number" min="0" step="any" data-k="'+k+'" value="'+esc(rc[k])+'" style="min-height:44px;font-size:16px">'+(suf?'<span>'+suf+'</span>':'')+'</div>'+(help?'<span style="display:block;margin-top:3px">'+help+'</span>':'')+'</label>'; }
    function t(k,label,ph){ return '<label class="small">'+label+'<input class="inp" data-t="'+k+'" value="'+esc(rc[k]||"")+'" placeholder="'+esc(ph||"")+'" style="min-height:44px;font-size:15px"></label>'; }
    var g='style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))"';
    V.innerHTML='<div class="adm-h"><div><div class="kick">Money</div><h1>Rate <em>card</em></h1></div><div class="acts"><button class="b sm ghost" id="rr">Reset to starting prices</button><button class="b sm" id="rs">Save</button></div></div>'+
      '<div class="card panel"><h3>What you make (price each)</h3>'+rc.formats.map(function(fm,i){ return '<div class="row-i"><input class="inp" data-fn="'+i+'" value="'+esc(fm.name)+'" style="min-height:42px;font-size:14.5px"><div style="display:flex;align-items:center;gap:6px">$<input class="inp" type="number" min="0" data-ff="'+i+'" value="'+(fm.fee/100)+'" style="width:110px;min-height:42px;font-size:16px"></div></div>'; }).join("")+'</div>'+
      '<div class="card panel" style="margin-top:14px"><h3>Licence (share of the making fee, per 30 days)</h3><div '+g+'>'+
        n("organic_pct","Brand posts it on its own pages","%")+n("paid_pct","Brand runs it as paid ads","%")+n("whitelist_pct","Paid ads from my account (whitelisting)","%")+n("exclusive_pct","No competitor ads (exclusivity)","%")+
        n("perpetual_x","Forever licence","× making fee","A forever licence gives away all future renewals, so price it high.")+'</div></div>'+
      '<div class="card panel" style="margin-top:14px"><h3>Reach on my channels</h3><div '+g+'>'+
        '<label class="small">Price per 1,000 views<div style="display:flex;align-items:center;gap:6px">$<input class="inp" type="number" min="0" step="any" id="cpm" value="'+(rc.cpm/100)+'" style="min-height:44px;font-size:16px"></div></label>'+
        n("views_youtube","My average YouTube views","views","Leave at 0 until your views are steady.")+n("views_shorts","My average Shorts / Reels views","views")+'</div></div>'+
      '<div class="card panel" style="margin-top:14px"><h3>Extras and terms</h3><div '+g+'>'+
        n("raw_pct","Raw files","%")+n("rush_pct","Rush delivery","%")+n("bundle_min","Bundle discount from","videos")+n("bundle_pct","Bundle discount","%")+n("deposit","Usually paid up front","%")+n("revisions","Rounds of changes included","")+'</div></div>'+
      '<div class="card panel" style="margin-top:14px"><h3>You, for quotes and contracts</h3><div '+g+'>'+
        t("legal_name","Your full legal name","")+t("business","Business name")+t("email","Business email")+t("website","Website")+t("place","Laws of (province or state)","e.g. Ontario")+'</div></div>';
    function collect(){ var o=Object.assign({},rc);
      V.querySelectorAll("[data-k]").forEach(function(i){ o[i.dataset.k]=Number(i.value)||0; });
      V.querySelectorAll("[data-t]").forEach(function(i){ o[i.dataset.t]=i.value.trim(); });
      o.cpm=Math.round((Number($("cpm").value)||0)*100);
      o.formats=rc.formats.map(function(fm,i){ return Object.assign({},fm,{ name:V.querySelector('[data-fn="'+i+'"]').value.trim()||fm.name, fee:Math.round((Number(V.querySelector('[data-ff="'+i+'"]').value)||0)*100) }); });
      return o; }
    $("rs").onclick=async function(){ await saveRC(collect()); A.refresh(); };
    $("rr").onclick=async function(){ if(!confirm("Go back to the starting prices? Your name and business details are kept.")) return; var o=Object.assign({},DEF,{ legal_name:rc.legal_name, business:rc.business, email:rc.email, website:rc.website, place:rc.place }); await saveRC(o); A.refresh(); };
  }});

  /* sidebar badge for new website inquiries */
  setTimeout(function(){ sb.from("mth_brands").select("id",{ count:"exact", head:true }).eq("stage","inquiry").then(function(r){ if(!r.error) A.badge("brands",r.count||0); }); },1500);

  /* exposed for testing */
  A._brandPrice=price; A._brandDefaults=DEF; A._contract=contractText;
})();
