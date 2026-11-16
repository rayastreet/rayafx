/* rayafx portfolio: data dibaca dari Google Sheet "rayafx – Data Website".
   Kalau sheet belum bisa dibaca (belum dibagikan / offline), halaman pakai data cadangan di index.html. */
(function(){
  var SHEET_ID = '1RXbWE0iW9IaGEI0hiSnYjtlbSDEeLsxxNc67HVVy2Eo';
  var DATA = JSON.parse(document.getElementById('fallback').textContent);

  var root=document.documentElement, lang='id', filter='all';
  var T={
    id:{all:'Semua',count:function(n,sh){return n+' proyek · '+sh+'+ shot sejak 2025'},shot:'shot',years:'tahun',watch:'Tonton',none:'Belum ada proyek di kategori ini.',copied:'Alamat email tersalin.',sel:'Alamat sudah diblok. Tekan Ctrl+C atau Cmd+C untuk menyalin.'},
    en:{all:'All',count:function(n,sh){return n+' projects · '+sh+'+ shots since 2025'},shot:'shots',years:'years',watch:'Watch',none:'No projects in this category yet.',copied:'Email address copied.',sel:'Address selected. Press Ctrl+C or Cmd+C to copy.'}
  };
  var CAT={Film:'Film',TVC:'TVC',Series:'Series',Digital:'MV/Digital'};
  function el(tag,attrs,kids){var e=document.createElement(tag);for(var k in attrs||{}){if(attrs[k]==null)continue;if(k==='text')e.textContent=attrs[k];else e.setAttribute(k,attrs[k])}(kids||[]).forEach(function(c){if(c)e.appendChild(typeof c==='string'?document.createTextNode(c):c)});return e}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}

  /* ---------- gambar ---------- */
  function driveId(u){var m=/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=|thumbnail\?(?:[^#]*&)?id=)([\w-]{20,})/.exec(u||'');return m?m[1]:null}
  function ytId(u){var m=/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/.exec(u||'');return m?m[1]:null}
  function img(u,w){var d=driveId(u);return d?'https://drive.google.com/thumbnail?id='+d+'&sz=w'+(w||1600):u}
  function thumbOf(p){
    if(p.thumb)return {src:img(p.thumb,400),wide:p.ratio!=='4:5'};
    var y=ytId(p.video);if(y)return {src:'https://i.ytimg.com/vi/'+y+'/mqdefault.jpg',wide:true};
    return null;
  }

  /* ---------- render ---------- */
  function renderFilters(){
    var box=document.getElementById('filters');box.textContent='';
    ['all','Film','Series','TVC','Digital'].forEach(function(c){
      var n=c==='all'?DATA.projects.length:DATA.projects.filter(function(p){return p.category===c}).length;
      if(!n&&c!=='all')return;
      var b=el('button',{type:'button','class':'fbtn','aria-pressed':String(filter===c)},[c==='all'?T[lang].all:CAT[c],el('span',{'class':'n num',text:String(n)})]);
      b.addEventListener('click',function(){filter=c;renderFilters();renderGrid()});
      box.appendChild(b);
    });
    var sh=DATA.projects.reduce(function(a,p){return a+(p.shots||0)},0);
    document.getElementById('workCount').textContent=T[lang].count(DATA.projects.length,sh);
  }
  function hasBA(title){return DATA.ba.some(function(b){return b.project===title})}
  function renderGrid(){
    var g=document.getElementById('grid');g.textContent='';
    var list=DATA.projects.filter(function(p){return filter==='all'||p.category===filter});
    if(!list.length){g.appendChild(el('li',{'class':'empty',text:T[lang].none}));return}
    list.forEach(function(p){
      var t=thumbOf(p);
      var thumb=t?el('img',{'class':'rthumb'+(t.wide?' wide':''),src:t.src,alt:'',width:t.wide?'96':'56',height:t.wide?'54':'70',loading:'lazy'}):el('span',{'class':'rthumb ph','aria-hidden':'true'});
      if(t)thumb.addEventListener('error',function(){thumb.style.visibility='hidden'});
      var sc=lang==='en'?(p.scopeEn||p.scopeId):p.scopeId;
      var sub=[p.role,p.note,sc].filter(Boolean).join(' · ');
      var title=el('div',{'class':'rtitle'},[el('h3',{text:p.title}),sub?el('span',{'class':'meta',text:sub}):null]);
      var cat=el('span',{'class':'rcat',text:CAT[p.category]||p.category,'data-m':p.shots?(p.year+' · '+p.shots+' '+T[lang].shot):p.year});
      var yr=el('span',{'class':'ryear num',text:p.year||''});
      var shc=el('span',{'class':'rshot num',text:p.shots?p.shots+' '+T[lang].shot:''});
      var act=p.video?el('a',{'class':'watch',href:p.video,target:'_blank',rel:'noopener','aria-label':T[lang].watch+': '+p.title,text:T[lang].watch+' ↗'})
        :hasBA(p.title)?el('a',{'class':'watch',href:'#before-after',text:'Before/after ↑'}):el('span',{'class':'watch none'});
      g.appendChild(el('li',{'class':'row'},[thumb,title,cat,yr,shc,act]));
    });
  }
  var zoomSvg='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
  function projOf(title){for(var i=0;i<DATA.projects.length;i++)if(DATA.projects[i].title===title)return DATA.projects[i];return null}
  function renderBA(){
    var gal=document.getElementById('before-after'),u=document.getElementById('baGrid');u.textContent='';
    gal.hidden=!DATA.ba.length;
    DATA.ba.forEach(function(b){
      var p=projOf(b.project)||{};
      var meta=[b.project,CAT[p.category]||p.category].filter(Boolean).join(' · ');
      var t=lang==='en'?(b.titleEn||b.titleId):b.titleId, d=lang==='en'?(b.descEn||b.descId):b.descId;
      var th=el('span',{'class':'ba-thumb'},[
        el('img',{src:img(b.before,800),alt:'Before: '+t,loading:'lazy'}),
        el('img',{'class':'after',src:img(b.after,800),alt:'After: '+t,loading:'lazy'}),
        el('span',{'class':'line'})]);
      var z=el('span',{'class':'zoom','aria-hidden':'true'});z.innerHTML=zoomSvg;th.appendChild(z);
      var btn=el('button',{'class':'ba-card',type:'button','aria-haspopup':'dialog'},[th,el('span',{'class':'ba-cap'},[el('span',{'class':'meta num',text:meta}),el('span',{'class':'t',text:t})])]);
      btn.addEventListener('click',function(){openBA(b,[meta,p.year].filter(Boolean).join(' · '),t,d)});
      u.appendChild(el('li',{},[btn]));
    });
  }
  var ba=document.getElementById('ba'),rg=document.getElementById('baRange'),md=document.getElementById('baModal');
  function openBA(b,meta,t,d){
    var B=document.getElementById('baB'),A=document.getElementById('baA');
    B.src=img(b.before,1920);B.alt='Before: '+t;A.src=img(b.after,1920);A.alt='After: '+t;
    var info=document.getElementById('baInfo');info.textContent='';
    info.appendChild(el('span',{'class':'meta num',text:meta}));info.appendChild(el('h3',{text:t}));if(d)info.appendChild(el('p',{text:d}));
    rg.value=50;ba.style.setProperty('--pos','50%');
    if(md.showModal)md.showModal();else md.setAttribute('open','');rg.focus();
  }
  rg.addEventListener('input',function(){ba.style.setProperty('--pos',rg.value+'%')});
  document.getElementById('baClose').addEventListener('click',function(){md.close?md.close():md.removeAttribute('open')});
  md.addEventListener('click',function(e){if(e.target===md)md.close()});

  function renderExp(){
    var u=document.getElementById('exp');u.textContent='';
    DATA.experience.forEach(function(x){
      u.appendChild(el('li',{},[el('span',{'class':'dur num'},[x.duration,el('small',{text:T[lang].years})]),el('div',{},[el('div',{'class':'role',text:x.role}),el('div',{'class':'co',text:x.company})])]));
    });
  }
  function renderLists(){
    [['disc',DATA.disciplines],['tools',DATA.tools]].forEach(function(a){var u=document.getElementById(a[0]);u.textContent='';a[1].forEach(function(s){u.appendChild(el('li',{text:s}))})});
    document.getElementById('email').textContent=DATA.email;
    document.getElementById('mailLink').href='mailto:'+DATA.email+'?subject='+encodeURIComponent(lang==='en'?'Shot estimate':'Estimasi shot');
  }
  function renderAll(){renderFilters();renderGrid();renderBA();renderExp();renderLists()}

  var langBtn=document.getElementById('langBtn');
  function setLang(l){
    lang=l;
    if(l==='en'){root.setAttribute('data-lang','en');root.lang='en';langBtn.textContent='ID';langBtn.setAttribute('aria-label','Ganti ke Bahasa Indonesia')}
    else{root.removeAttribute('data-lang');root.lang='id';langBtn.textContent='EN';langBtn.setAttribute('aria-label','Switch to English')}
    renderAll();
  }
  langBtn.addEventListener('click',function(){var n=lang==='en'?'id':'en';setLang(n);store('ra-lang',n)});

  document.getElementById('copyBtn').addEventListener('click',function(){
    var st=document.getElementById('copyStatus');
    if(navigator.clipboard)navigator.clipboard.writeText(DATA.email).then(function(){st.textContent=T[lang].copied},sel);else sel();
    function sel(){var r=document.createRange();r.selectNodeContents(document.getElementById('email'));var s=getSelection();s.removeAllRanges();s.addRange(r);st.textContent=T[lang].sel}
  });

  setLang(store('ra-lang')==='en'?'en':'id');

  /* ---------- baca Google Sheet ---------- */
  function csv(text){
    var rows=[],row=[],f='',q=false;
    for(var i=0;i<text.length;i++){var c=text[i];
      if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
      else if(c==='"')q=true;else if(c===','){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}else f+=c}
    if(f||row.length){row.push(f);rows.push(row)}
    return rows;
  }
  function tab(name){
    var url='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?tqx=out:csv&headers=1&sheet='+encodeURIComponent(name)+'&t='+Date.now();
    return fetch(url).then(function(r){if(!r.ok)throw new Error(r.status);return r.text()}).then(function(t){
      if(/^\s*</.test(t))throw new Error('not csv');
      return csv(t).slice(1).map(function(r){return r.map(function(v){return (v||'').trim()})});
    });
  }
  function yes(v){return /^(true|ya|yes|1|✓)$/i.test(v)}
  function num(v){var n=parseInt(String(v).replace(/[^\d]/g,''),10);return isNaN(n)?0:n}
  Promise.all([tab('Karya'),tab('BeforeAfter'),tab('Pengalaman'),tab('Profil')]).then(function(r){
    var projects=r[0].filter(function(x){return yes(x[0])&&x[1]}).map(function(x){return {title:x[1],category:x[2],note:x[3],year:x[4],shots:num(x[5]),scopeId:x[6],scopeEn:x[7],role:x[8],video:x[9],thumb:x[10],ratio:x[11]||'16:9'}});
    if(!projects.length)return;
    DATA.projects=projects;
    DATA.ba=r[1].filter(function(x){return yes(x[0])&&x[6]&&x[7]}).map(function(x){return {project:x[1],titleId:x[2],titleEn:x[3],descId:x[4],descEn:x[5],before:x[6],after:x[7]}});
    var ex=r[2].filter(function(x){return x[0]||x[1]}).map(function(x){return {company:x[0],role:x[1],duration:x[2]}});if(ex.length)DATA.experience=ex;
    var d=r[3].map(function(x){return x[0]}).filter(Boolean),t=r[3].map(function(x){return x[1]}).filter(Boolean),e=r[3].map(function(x){return x[2]}).filter(Boolean);
    if(d.length)DATA.disciplines=d;if(t.length)DATA.tools=t;if(e.length)DATA.email=e[0];
    renderAll();
  }).catch(function(err){if(window.console)console.info('Sheet belum bisa dibaca, pakai data cadangan.',err)});
})();
