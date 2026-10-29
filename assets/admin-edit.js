/* =================================================================
   ADMIN — EDIT: one place for everything you change on the website.
   Tabs: Website pages · Blog · Courses · Thumbnails.
   Also tidies the sidebar: related screens become tabs of one item,
   and the old To-do list is gone. Loaded after every other admin file.
================================================================= */
(function(){
  var A=window.ADM;

  A.screen("edit",{ nav:"✎ Edit", group:"Edit",
    help:"Everything you can change, in one place. Pick a tab: the words on your website pages, your blog articles, your courses, or thumbnails.",
    render: async function(V){
      var tiles=[
        ["words","🖊","Website pages","Click any words on a page and type. Save, and it’s live."],
        ["blog","📰","Blog","Write a new article or change the words in one."],
        ["content","🎓","Courses","Course names, pictures, modules, videos and ebooks."],
        ["thumbs","🖼","Thumbnails","Make thumbnails for your videos."],
        ["library","📚","Vault","Your ebooks, books and videos, all in one place."]
      ];
      V.innerHTML='<div class="adm-h"><div><div class="kick">Edit</div><h1>What do you want to <em>change?</em></h1></div></div>'+
        '<div class="today-big">'+tiles.map(function(t){ return '<a class="card tb" href="#'+t[0]+'"><span class="ic">'+t[1]+'</span><b>'+t[2]+'</b><span>'+t[3]+'</span></a>'; }).join("")+'</div>';
    }
  });

  /* the sidebar, simplified */
  A.family("edit",["edit","words","blog","content","thumbs"],{ edit:"All", words:"Website pages", blog:"Blog", content:"Courses", thumbs:"Thumbnails" });
  A.family("contacts",["contacts","sales","access"],{ contacts:"People", sales:"Sales", access:"Give access" });
  A.family("brands",["brands","quote","ratecard"],{ brands:"Brand deals", quote:"Price calculator", ratecard:"Rate card" });

  /* the To-do list is retired (Today shows your vault instead) */
  var i=A.order.indexOf("tasks"); if(i>-1) A.order.splice(i,1); delete A.screens.tasks;

  /* tidy names and order in the sidebar */
  var S=A.screens;
  if(S.library){ S.library.nav="Vault"; S.library.group="Edit"; }
  if(S.contacts){ S.contacts.nav="People & sales"; }
  if(S.overview) S.overview.group="Customers";
  var want=["today","edit","library","overview","contacts","studio","conversions","integrations","brands"];
  A.order.sort(function(a,b){ var x=want.indexOf(a), y=want.indexOf(b); return (x<0?99:x)-(y<0?99:y); });
})();
