/* =================================================================
   ADS — Meta (Facebook & Instagram) ads next to real sales from the CRM.
   Spend comes from Meta (Marketing API, via the mth-meta function).
   Leads, sales and revenue come from YOUR site, matched by the tracking
   tags on each ad: utm_campaign = campaign name, utm_content = ad name.
   Pause / turn on and daily budgets are changed from here, after a confirm.
================================================================= */
(function(){
  var A=window.ADM, esc=A.esc, days=30;
  var META_SRC=/^(facebook|fb|instagram|ig|meta|facebook\.com|instagram\.com)$/i;
  var TAGS="utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}";
  var key=function(s){ return String(s||"").trim().toLowerCase(); };
  var cents=function(dollars){ return Math.round(Number(dollars||0)*100); };
  var ret=function(rev,spend){ return spend>0?(rev/spend).toFixed(2)+"×":"—"; };
  var each=function(n,c){ return n>0?A.money(Math.round(c/n)):"—"; };

  function css(){
    if(document.getElementById("ads-css")) return;
    var s=document.createElement("style"); s.id="ads-css";
    s.textContent=".ads-row{cursor:pointer}.ads-row:hover td{background:var(--bg2)}.ads-sub td{background:#fbf8f2;font-size:13.5px}.ads-sub td:first-child{padding-left:30px}"+
      ".ads-st{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:7px;background:#cbbfae;vertical-align:middle}.ads-st.on{background:#5f8f6b}"+
      ".ads-v{font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}.ads-v.win{background:#d5e6d0;color:#2e5c45}.ads-v.lose{background:#f8ddd3;color:#7e3b25}.ads-v.learn{background:#efe9df;color:#6e6259}"+
      ".ads-warn{border-left:3px solid var(--terra);padding:12px 16px;margin:0 0 14px}.ads-acts{display:flex;gap:6px;flex-wrap:wrap}";
    document.head.appendChild(s);
  }

  /* a simple, honest verdict: needs real spend before judging */
  function verdict(spend,sales,rev){
    if(spend<20) return '<span class="ads-v learn">Too early</span>';
    if(sales===0&&spend>=150) return '<span class="ads-v lose">No sales yet · consider pausing</span>';
    if(sales===0) return '<span class="ads-v learn">Learning</span>';
    var r=rev/spend;
    if(r>=2) return '<span class="ads-v win">Winning · try +20% budget</span>';
    if(r>=1) return '<span class="ads-v learn">Breaking even</span>';
    return '<span class="ads-v lose">Losing money</span>';
  }

  function setup(V){
    V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>Meta <em>ads</em></h1></div></div>'+
      '<div class="card panel"><h3>One more connection</h3><p class="small">Your website already reports sign-ups and sales to Meta. To show <b>what each ad costs</b> next to the sales it brings, and to pause ads or change budgets from here, add the ads token.</p>'+
      '<ol class="step-list"><li>Add it in <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a> as <code>META_ADS_TOKEN</code>.</li><li>Come back here and refresh.</li></ol></div>';
  }

  A.screen("ads",{ nav:"Meta ads", group:"Growing", live:true, help:"Every Facebook and Instagram ad, what it cost, and the leads and sales it really brought to your site. Green = making money. Red = spending without sales. Tap a campaign to see its ads.", render: async function(V){
    css();
    var res=await Promise.all([MTH.fn("mth-meta",{ action:"ads_report", days:days }).catch(function(e){ return { connected:true, error:String(e&&e.message||e) }; }),
                               A.rpc("mth_admin_attribution",{ p_days:days },true).catch(function(){ return []; })]);
    var R=res[0]||{}, AT=(res[1]||[]).filter(function(r){ return META_SRC.test(String(r.utm_source||"")); });
    if(!R.connected) return setup(V);
    if(R.error){ V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>Meta <em>ads</em></h1></div></div><div class="card panel ads-warn"><h3>Meta didn’t answer</h3><p class="small">'+esc(R.error)+'</p><p class="small">If it mentions the token, it may have expired: make a new one and update <code>META_ADS_TOKEN</code> in <a href="https://supabase.com/dashboard/project/oihefcsonqjeicelezln/functions/secrets" target="_blank" rel="noopener">Supabase secrets</a>.</p></div>'; return; }

    /* ---- join Meta (spend) with the CRM (leads, sales) ---- */
    var ins={}; (R.insights||[]).forEach(function(i){ ins[i.ad_id]=i; });
    var crmC={}, crmA={}, used={};
    AT.forEach(function(r){ var c=key(r.utm_campaign), a=c+"|"+key(r.utm_content);
      [[crmC,c],[crmA,a]].forEach(function(p){ var o=p[0][p[1]]||(p[0][p[1]]={ leads:0, sales:0, rev:0, rows:[] }); o.leads+=Number(r.list_joins||0)+Number(r.signups||0); o.sales+=Number(r.purchases||0); o.rev+=Number(r.revenue_cents||0); o.rows.push(r); }); });
    var adsBy={}, setsBy={};
    (R.ads||[]).forEach(function(a){ (adsBy[a.campaign_id]=adsBy[a.campaign_id]||[]).push(a); });
    (R.adsets||[]).forEach(function(s){ (setsBy[s.campaign_id]=setsBy[s.campaign_id]||[]).push(s); });
    var stat=function(list){ var o={ spend:0, clicks:0, impr:0 }; list.forEach(function(a){ var i=ins[a.id]; if(!i) return; o.spend+=cents(i.spend); o.clicks+=Number(i.inline_link_clicks||0); o.impr+=Number(i.impressions||0); }); return o; };
    var T={ spend:0, leads:0, sales:0, rev:0 }, untagged=0;
    var camps=(R.campaigns||[]).map(function(c){
      var ads=adsBy[c.id]||[], s=stat(ads), m=crmC[key(c.name)]||{ leads:0, sales:0, rev:0 };
      if(crmC[key(c.name)]) used[key(c.name)]=1;
      ads.forEach(function(a){ var t=String((a.creative&&a.creative.url_tags)||""); if(!/utm_campaign/.test(t)) { a._untagged=true; if(a.effective_status==="ACTIVE") untagged++; } });
      T.spend+=s.spend; T.leads+=m.leads; T.sales+=m.sales; T.rev+=m.rev;
      return { c:c, ads:ads, sets:setsBy[c.id]||[], s:s, m:m };
    }).filter(function(x){ return x.s.spend>0||x.c.effective_status==="ACTIVE"||x.c.status==="ACTIVE"; })
      .sort(function(a,b){ return b.s.spend-a.s.spend; });
    var lost=Object.keys(crmC).filter(function(k){ return !used[k]; }).reduce(function(a,k){ return a+crmC[k].sales; },0);
    var acct=R.account||{}, ACCT_BAD={ 2:"disabled", 3:"has an unpaid balance", 7:"is pending review", 9:"is in a grace period", 100:"is pending closure", 101:"is closed" };

    var head='<tr><th>Campaign / ad</th><th>Spend</th><th class="hm">Clicks</th><th class="hm">CTR</th><th>Leads</th><th>Sales</th><th>Revenue</th><th>Cost per sale</th><th>Return per $1</th><th></th></tr>';
    function cells(sp,cl,im,m){ return '<td>'+A.money(sp)+'</td><td class="hm">'+cl+'</td><td class="hm">'+(im?(100*cl/im).toFixed(2)+'%':'—')+'</td><td>'+m.leads+'</td><td><b>'+m.sales+'</b></td><td>'+A.money(m.rev)+'</td><td>'+each(m.sales,sp)+'</td><td>'+ret(m.rev,sp)+'</td>'; }
    function onOff(id,status,label){ var on=status==="ACTIVE"; return '<button class="b sm '+(on?'ghost':'')+'" data-st="'+id+'" data-to="'+(on?'PAUSED':'ACTIVE')+'" data-name="'+esc(label)+'">'+(on?'Pause':'Turn on')+'</button>'; }
    function budgetBtn(id,dc,label){ return dc?'<button class="b sm ghost" data-bud="'+id+'" data-cur="'+dc+'" data-name="'+esc(label)+'">'+A.money(Number(dc))+'/day</button>':''; }

    var rows=camps.map(function(x,ci){
      var c=x.c, live=c.effective_status==="ACTIVE";
      var sub=x.sets.filter(function(s){ return s.daily_budget; }).map(function(s){
          return '<tr class="ads-sub" data-of="'+ci+'" hidden><td colspan="9"><span class="ads-st'+(s.effective_status==="ACTIVE"?' on':'')+'"></span>Ad set: '+esc(s.name)+'</td><td><div class="ads-acts">'+budgetBtn(s.id,s.daily_budget,s.name)+'</div></td></tr>'; }).join("")+
        x.ads.map(function(a){ var i=ins[a.id]||{}, sp=cents(i.spend), m=crmA[key(c.name)+"|"+key(a.name)]||{ leads:0, sales:0, rev:0 };
          return '<tr class="ads-sub" data-of="'+ci+'" hidden><td><span class="ads-st'+(a.effective_status==="ACTIVE"?' on':'')+'"></span>'+esc(a.name)+(a._untagged?' <span class="pill tag">no tracking tags</span>':'')+'</td>'+cells(sp,Number(i.inline_link_clicks||0),Number(i.impressions||0),m)+'<td><div class="ads-acts">'+onOff(a.id,a.status,a.name)+'</div></td></tr>'; }).join("");
      return '<tr class="ads-row" data-i="'+ci+'"><td><span class="ads-st'+(live?' on':'')+'"></span><b>'+esc(c.name)+'</b><br>'+verdict(x.s.spend/100,x.m.sales,x.m.rev/100)+'</td>'+cells(x.s.spend,x.s.clicks,x.s.impr,x.m)+
        '<td><div class="ads-acts">'+onOff(c.id,c.status,c.name)+budgetBtn(c.id,c.daily_budget,c.name)+'</div></td></tr>'+sub;
    }).join("");

    V.innerHTML='<div class="adm-h"><div><div class="kick">Growing</div><h1>Meta <em>ads</em></h1></div><div class="acts"><select class="sel" id="dd"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><a class="b sm ghost" href="https://adsmanager.facebook.com/adsmanager/manage/campaigns?act='+esc(String(acct.id||"").replace("act_",""))+'" target="_blank" rel="noopener">Open Ads Manager</a></div></div>'+
      (ACCT_BAD[acct.account_status]?'<div class="card ads-warn"><b>Your ad account '+ACCT_BAD[acct.account_status]+'.</b> <span class="small">Ads won’t run until this is fixed in Ads Manager → Billing.</span></div>':'')+
      (untagged?'<div class="card ads-warn"><b>'+untagged+' running ad'+(untagged>1?'s are':' is')+' missing tracking tags</b>, so sales from '+(untagged>1?'them':'it')+' can’t be credited. In Ads Manager, edit the ad → <b>Tracking → URL parameters</b> and paste: <div class="code-box" style="margin-top:8px">'+esc(TAGS)+'</div><button class="b sm ghost" id="cpT">Copy</button></div>':'')+
      '<div class="kpis"><div class="card kpi"><b>'+A.money(T.spend)+'</b><span>Spent</span></div><div class="card kpi"><b>'+T.leads+'</b><span>Leads · '+each(T.leads,T.spend)+' each</span></div>'+
      '<div class="card kpi"><b>'+T.sales+'</b><span>Sales from ads</span></div><div class="card kpi"><b>'+A.money(T.rev)+'</b><span>Revenue from ads</span></div>'+
      '<div class="card kpi'+(T.sales===0&&T.spend>15000?' warn':'')+'"><b>'+each(T.sales,T.spend)+'</b><span>Cost per customer</span></div><div class="card kpi'+(T.spend&&T.rev<T.spend?' warn':'')+'"><b>'+ret(T.rev,T.spend)+'</b><span>Back for every $1</span></div></div>'+
      '<div class="sec-h">Campaigns <span class="small" style="font-weight:400">· tap one to see its ads</span></div>'+
      '<div class="card" style="overflow:auto"><table class="ct"><thead>'+head+'</thead><tbody>'+(rows||'<tr><td colspan="10" class="muted" style="padding:18px">No campaigns running in this period. Create one in <a href="https://adsmanager.facebook.com" target="_blank" rel="noopener">Ads Manager</a> (ad account <b>'+esc(acct.name||"Mark Talks Health")+'</b>), target the <b>United States</b>, and paste the tracking tags into the ad.</td></tr>')+'</tbody></table></div>'+
      '<p class="small" style="margin:12px 2px">Spend is from Meta; leads, sales and revenue are from your own site, so they’re real. '+(lost?'<b>'+lost+' sale'+(lost>1?'s':'')+'</b> came from Facebook/Instagram links that don’t match a campaign name (organic posts or untagged ads). ':'')+'Changes you make here show in Ads Manager within a minute.</p>';

    var dd=document.getElementById("dd"); dd.value=String(days); dd.onchange=function(){ days=Number(this.value); A.refresh(); };
    var cp=document.getElementById("cpT"); if(cp) cp.onclick=function(){ A.copy(TAGS,"Tracking tags copied"); };
    V.querySelectorAll(".ads-row").forEach(function(tr){ tr.onclick=function(e){ if(e.target.closest("button")) return; V.querySelectorAll('[data-of="'+tr.dataset.i+'"]').forEach(function(s){ s.hidden=!s.hidden; }); }; });
    V.querySelectorAll("[data-st]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); var to=b.dataset.to, nm=b.dataset.name;
      MTH.modal(to==="PAUSED"?"Pause this?":"Turn this on?", "“"+nm+"” will "+(to==="PAUSED"?"stop spending right away.":"start spending again on its current budget."),[[to==="PAUSED"?"Pause":"Turn on",async function(){
        var r=await MTH.fn("mth-meta",{ action:"set_status", id:b.dataset.st, status:to }).catch(function(e){ return { error:String(e.message||e) }; });
        MTH.toast(r.ok?(to==="PAUSED"?"Paused":"Turned on"):"Didn’t work: "+(r.error||"unknown"),4500); if(r.ok) A.refresh(); }],["Cancel",null,"ghost"]]); }; });
    V.querySelectorAll("[data-bud]").forEach(function(b){ b.onclick=function(e){ e.stopPropagation();
      var cur=Number(b.dataset.cur)/100, v=prompt("New daily budget for “"+b.dataset.name+"” in US dollars (now $"+cur.toFixed(2)+"):", cur.toFixed(2)); if(v==null) return;
      var n=Number(String(v).replace(/[$,\s]/g,"")); if(!(n>=1&&n<=500)) return MTH.toast("Pick an amount between $1 and $500 a day.",4000);
      var jump=n>cur*1.5?" That’s a big jump; Meta works best with changes of about 20% at a time.":"";
      MTH.modal("Change the budget?","$"+cur.toFixed(2)+"/day → $"+n.toFixed(2)+"/day."+jump,[["Change it",async function(){
        var r=await MTH.fn("mth-meta",{ action:"set_budget", id:b.dataset.bud, daily_budget_cents:Math.round(n*100) }).catch(function(e){ return { error:String(e.message||e) }; });
        MTH.toast(r.ok?"Budget changed":"Didn’t work: "+(r.error||"unknown"),4500); if(r.ok) A.refresh(); }],["Cancel",null,"ghost"]]); }; });
  }});
})();
