/* ===== Profil du joueur : parties, victoires, succès, défis, parrainage (local + Supabase) ===== */
const PROF=(()=>{
 const SB_URL='https://evepcodcppxpufbkuflq.supabase.co', SB_KEY='sb_publishable_iUC6966SeFt_05Iac1wGQw_yDo9zl7y';
 const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
 const SITE='https://mushu1994.github.io/duel-des-ages/';
 const CAT={"duel-des-ages": {"t": "Duel des Âges", "ty": "cartes"}, "duel-des-joyaux": {"t": "Duel des Joyaux", "ty": "cartes"}, "plus-bas": {"t": "Plus Bas", "ty": "cartes"}, "tetes-de-boeuf": {"t": "Têtes de Bœuf", "ty": "cartes"}, "joyaux-renaissance": {"t": "Joyaux de la Renaissance", "ty": "cartes"}, "sept-merveilles": {"t": "Sept Merveilles", "ty": "cartes"}, "bataille": {"t": "La Bataille", "ty": "cartes"}, "president": {"t": "Président", "ty": "cartes"}, "tarot": {"t": "Tarot", "ty": "cartes"}, "poker": {"t": "Poker", "ty": "cartes"}, "rami": {"t": "Rami voleur", "ty": "cartes"}, "solitaire": {"t": "Solitaire", "ty": "cartes"}, "derniere-carte": {"t": "Dernière carte", "ty": "cartes"}, "quitte-ou-sept": {"t": "Quitte ou Sept", "ty": "cartes"}, "nouvelle-terre": {"t": "Nouvelle Terre", "ty": "plateau"}, "rails-d-europe": {"t": "Rails d’Europe", "ty": "plateau"}, "grand-proprietaire": {"t": "Grand Propriétaire", "ty": "plateau"}, "remparts": {"t": "Remparts", "ty": "plateau"}, "conquete": {"t": "Conquête", "ty": "plateau"}, "echecs": {"t": "Échecs", "ty": "plateau"}, "dames": {"t": "Dames", "ty": "plateau"}, "reversi": {"t": "Reversi", "ty": "plateau"}, "quatre-en-ligne": {"t": "Quatre en ligne", "ty": "plateau"}, "bataille-navale": {"t": "Bataille Navale", "ty": "plateau"}, "petits-chevaux": {"t": "Petits Chevaux", "ty": "plateau"}, "approche-finale": {"t": "Approche finale", "ty": "des"}, "dominos": {"t": "Dominos", "ty": "des"}, "sudoku": {"t": "Sudoku", "ty": "lettres"}, "mots-croises": {"t": "Mots croisés", "ty": "lettres"}, "petit-bac": {"t": "Petit Bac", "ty": "lettres"}, "code-secret": {"t": "Code Secret", "ty": "lettres"}, "serpents": {"t": "Serpents", "ty": "arcade"}, "souriciere": {"t": "Souricière", "ty": "arcade"}, "piaf": {"t": "Piaf", "ty": "arcade"}, "belote": {"t": "Belote", "ty": "cartes"}, "mille-bornes": {"t": "Mille Bornes", "ty": "cartes"}, "memory": {"t": "Memory", "ty": "cartes"}, "awale": {"t": "Awalé", "ty": "plateau"}, "backgammon": {"t": "Backgammon", "ty": "plateau"}, "morpion-geant": {"t": "Morpion géant", "ty": "plateau"}, "yams": {"t": "Yams", "ty": "des"}, "demineur": {"t": "Démineur", "ty": "lettres"}, "2048": {"t": "2048", "ty": "lettres"}, "mot-du-jour": {"t": "Mot du jour", "ty": "lettres"}, "mots-meles": {"t": "Mots mêlés", "ty": "lettres"}, "pong": {"t": "Pong", "ty": "arcade"}, "casse-briques": {"t": "Casse-briques", "ty": "arcade"}, "blocs": {"t": "Duel de blocs", "ty": "arcade"}, "bombes": {"t": "Bombes en arène", "ty": "arcade"}, "chars": {"t": "Bataille de chars", "ty": "arcade"}, "dessine": {"t": "Dessine et devine", "ty": "arcade"}, "bataille-corse": {"t": "Bataille corse", "ty": "cartes"}};
 const ARCADE={serpents:{u:'pommes',min:3},souriciere:{u:'points',min:500},piaf:{u:'colonnes',min:2}};
 const P={CAT,ARCADE,SITE};
 const ld=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }, sv=(k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
 const key=p=>String(p||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe').replace(/æ/g,'ae').replace(/[^a-z0-9]/g,'');
 const es=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 P.key=key; P.es=es;
 const slug=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
 P.slug=CAT[slug]?slug:null;
 let D=ld('prof')||{}; D=Object.assign({v:1,avatar:'🎲',couleur:'#d8b25a',bio:'',favs:[],jeux:{},succes:{},jours:[],env:0,ok:0,cree:Date.now(),rec:{}},D);
 let SECRET=ld('prof-secret'); if(!SECRET){ const a=new Uint8Array(18); (crypto.getRandomValues?crypto.getRandomValues(a):a.forEach((_,i)=>a[i]=Math.random()*256|0)); SECRET=[...a].map(x=>'abcdefghjkmnpqrstuvwxyz23456789'[x%31]).join(''); sv('prof-secret',SECRET); }
 P.data=()=>D; P.secret=()=>SECRET;
 P.pseudo=()=>(typeof HALL!=='undefined'&&HALL.pseudo)||ld('net-name')||'';
 /* ---------- statistiques ---------- */
 const today=()=>{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
 P.stats=(d)=>{ d=d||D; const js=Object.entries(d.jeux||{}); const sum=f=>js.reduce((a,[,x])=>a+(x[f]||0),0);
   const jours=(d.jours||[]).slice().sort(); let serie=0; if(jours.length){ let cur=new Date(jours[jours.length-1]+'T12:00'); const t=new Date(today()+'T12:00'); if((t-cur)/864e5<=1){ serie=1; for(let i=jours.length-2;i>=0;i--){ const p=new Date(jours[i]+'T12:00'); if(Math.round((cur-p)/864e5)===1){ serie++; cur=p; } else if(Math.round((cur-p)/864e5)>1) break; } } }
   let best=0, run=jours.length?1:0; for(let i=1;i<jours.length;i++){ const g=Math.round((new Date(jours[i]+'T12:00')-new Date(jours[i-1]+'T12:00'))/864e5); run=g===1?run+1:g===0?run:1; best=Math.max(best,run); } best=Math.max(best,run,serie);
   const parties=sum('p'), v=sum('v'), l=sum('l'), t=sum('t'), nbj=js.filter(([,x])=>x.p>0).length, nbs=Object.keys(d.succes||{}).length;
   const xp=parties*10+v*15+l*5+nbs*50; const niveau=Math.floor(Math.sqrt(xp/40))+1; const base=40*(niveau-1)**2, next=40*niveau**2;
   return {parties,v,l,t,nbj,nbs,serie,best,xp,niveau,prog:(xp-base)/(next-base),next:next-xp,top:js.filter(([,x])=>x.p>0).sort((a,b)=>b[1].p-a[1].p||(b[1].t||0)-(a[1].t||0)).slice(0,3).map(([k,x])=>Object.assign({k},x))}; };
 /* ---------- succès ---------- */
 const A=(id,ic,t,d,f,goal)=>({id,ic,t,d,f,goal});
 P.SUCCES=[
  A('premiere','🎲','Première partie','Jouer une partie',s=>s.parties,1), A('habitue','🃏','Habitué','Jouer 10 parties',s=>s.parties,10), A('accro','🔥','Accro','Jouer 50 parties',s=>s.parties,50), A('legende','👑','Légende de la salle','Jouer 200 parties',s=>s.parties,200),
  A('curieux','🧭','Curieux','Essayer 5 jeux différents',s=>s.nbj,5), A('explorateur','🗺️','Explorateur','Essayer 15 jeux différents',s=>s.nbj,15), A('tourcomplet','🏛️','Tour complet','Essayer 30 jeux différents',s=>s.nbj,30),
  A('vainqueur','🏅','Première victoire','Gagner une partie',s=>s.v,1), A('champion','🏆','Champion','Gagner 10 parties',s=>s.v,10), A('invincible','💎','Invincible','Gagner 50 parties',s=>s.v,50),
  A('enligne','🌐','Connecté','Jouer une partie en ligne',s=>s.l,1), A('social','🤝','Esprit d’équipe','Jouer 10 parties en ligne',s=>s.l,10), A('pilier','🏟️','Pilier du salon','Jouer 50 parties en ligne',s=>s.l,50),
  A('arcade','🕹️','Borne d’arcade','Jouer aux 3 mini-jeux vidéo',(s,d)=>['serpents','souriciere','piaf'].filter(k=>d.jeux[k]&&d.jeux[k].p).length,3),
  A('serpent','🐍','Grand serpent','Manger 25 pommes dans une partie de Serpents',(s,d)=>d.rec.serpents||0,25), A('souris','🧀','Souris gourmande','Faire 3 000 points à Souricière',(s,d)=>d.rec.souriciere||0,3000),
  A('piaf','🐦','Bel envol','Passer 20 colonnes à Piaf',(s,d)=>d.rec.piaf||0,20), A('piaf50','🦅','Roi du ciel','Passer 50 colonnes à Piaf',(s,d)=>d.rec.piaf||0,50),
  A('fidele','📅','Fidèle','Jouer 3 jours d’affilée',s=>s.best,3), A('assidu','🗓️','Assidu','Jouer 7 jours d’affilée',s=>s.best,7),
  A('marathon','⏱️','Marathon','Cumuler 2 heures de jeu',s=>Math.floor(s.t/60),120),
  A('noctambule','🌙','Noctambule','Jouer entre minuit et 5 h',(s,d)=>d.nuit?1:0,1),
  A('favoris','⭐','Coups de cœur','Choisir 3 jeux favoris',(s,d)=>(d.favs||[]).length,3), A('portrait','🪞','Autoportrait','Choisir un avatar et écrire une présentation',(s,d)=>(d.avatar&&d.avatar!=='🎲'&&d.bio?1:0),1),
  A('defieur','⚔️','Défieur','Envoyer un défi',(s,d)=>d.env||0,1), A('provocateur','📣','Provocateur','Envoyer 10 défis',(s,d)=>d.env||0,10), A('releve','🎯','Défi relevé','Réussir un défi reçu',(s,d)=>d.ok||0,1), A('imbattable','🥇','Imbattable','Réussir 5 défis',(s,d)=>d.ok||0,5),
  A('parrain','📨','Parrain','Faire venir un ami qui joue 4 parties',(s,d)=>d.fil||0,1), A('ambassadeur','🎖️','Ambassadeur','Faire venir 5 amis',(s,d)=>d.fil||0,5)];
 P.progress=(a,d)=>{ d=d||D; const s=P.stats(d); return Math.min(a.goal,a.f(s,d)||0); };
 function checkSucces(silent){ const s=P.stats(); const fresh=[]; for(const a of P.SUCCES){ if(D.succes[a.id]) continue; if((a.f(s,D)||0)>=a.goal){ D.succes[a.id]=Date.now(); fresh.push(a); } }
   if(fresh.length&&!silent) fresh.forEach((a,i)=>setTimeout(()=>notice(`${a.ic} Succès débloqué : ${a.t}`,true),400+i*2600)); return fresh.length; }
 /* ---------- notifications ---------- */
 function notice(txt,good,act){ const st=document.getElementById('prof-st'); if(!st){ const s=document.createElement('style'); s.id='prof-st'; s.textContent='.prof-note{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:95;background:#1b1b1f;color:#fff;border-radius:14px;padding:10px 16px;font:700 15px "Nunito Sans",Karla,system-ui,sans-serif;box-shadow:0 12px 34px #000a;display:flex;gap:10px;align-items:center;width:max-content;max-width:min(480px,calc(100vw - 24px));box-sizing:border-box;animation:profin .35s cubic-bezier(.2,1.3,.4,1)}.prof-note.good{background:linear-gradient(135deg,#b8862b,#e9c46a);color:#2a1a05}.prof-note span{flex:1;min-width:0}.prof-note button,.prof-note a{font:800 14px inherit;border:0;border-radius:9px;padding:7px 11px;background:#fff;color:#2a1a05;cursor:pointer;text-decoration:none;white-space:nowrap}@keyframes profin{from{transform:translate(-50%,30px);opacity:0}}'; document.head.appendChild(s); }
   const n=document.createElement('div'); n.className='prof-note'+(good?' good':''); n.innerHTML=`<span>${es(txt)}</span>`; if(act){ const b=document.createElement('button'); b.textContent=act[0]; b.onclick=()=>{ n.remove(); act[1](); }; n.appendChild(b); }
   document.body.appendChild(n); try{ if(good&&typeof sfx==='function') sfx('ding'); }catch(e){} setTimeout(()=>n.remove(),act?9000:3800); }
 P.notice=notice;
 /* ---------- enregistrement ---------- */
 const J=s=>(D.jeux[s]=D.jeux[s]||{p:0,v:0,l:0,t:0});
 function mark(){ const t=today(); if(!D.jours.includes(t)){ D.jours.push(t); D.jours=D.jours.slice(-90); } const h=new Date().getHours(); if(h<5) D.nuit=1; }
 P.played=(s,online)=>{ s=s||P.slug; if(!s||!CAT[s]) return; const j=J(s); j.p++; if(online) j.l++; j.last=Date.now(); mark(); armed=false; inter=0; checkDefiPlayed(s); save(); };
 let lastWin=0; P.won=(s)=>{ s=s||P.slug; if(!s||!CAT[s]) return; if(Date.now()-lastWin<8000) return; lastWin=Date.now(); J(s).v++; save(); };
 window.PROFWIN=v=>{ if(v===true) P.won(P.slug); armed=true; inter=0; t0=Date.now(); };
 P.result=(s,o)=>{ if(o.win) P.won(s); if(o.score!=null&&o.score>(D.rec[s]||0)){ D.rec[s]=o.score; if(o.score>=(ARCADE[s]||{}).min) setTimeout(()=>notice(`Nouveau record à ${CAT[s].t} : ${o.score} ${ARCADE[s].u}`,true),900); } if(o.score!=null) checkDefiScore(s,o.score); save(); };
 let saveT=null, syncT=null;
 function save(){ checkSucces(); sv('prof',D); clearTimeout(syncT); syncT=setTimeout(sync,2500); try{ if(typeof HALL!=='undefined'&&HALL.set) HALL.set({n:P.stats().parties,av:D.avatar}); }catch(e){} }
 P.save=save;
 /* ---------- serveur ---------- */
 let client=null, libP=null;
 P.client=async()=>{ if(typeof HALL!=='undefined'&&HALL.client) return HALL.client(); if(client) return client;
   if(!window.supabase){ if(!libP) libP=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=LIB; s.onload=res; s.onerror=()=>{ libP=null; rej(new Error('lib')); }; document.head.appendChild(s); }); await libP; }
   client=window.supabase.createClient(SB_URL,SB_KEY); return client; };
 P.rpc=async(fn,args)=>{ const c=await P.client(); const {data,error}=await c.rpc(fn,args); if(error) throw error; return data; };
 async function sync(){ const ps=P.pseudo(); if(!ps) return null; const s=P.stats(); const k=key(ps); if(k.length<2) return null;
   const data=Object.assign({},D,{nbs:s.nbs,niveau:s.niveau,bio:String(D.bio||'').slice(0,140)}); delete data.defiActif;
   try{ const r=await P.rpc('profil_sauver',{p_k:k,p_pseudo:ps,p_secret:SECRET,p_data:data,p_parties:s.parties,p_parrain:ld('prof-parrain')}); D.pris=r==='pris'?k:null; sv('prof',D); return r; }catch(e){ return null; } }
 P.sync=sync;
 P.libre=async ps=>{ try{ return await P.rpc('pseudo_libre',{p_k:key(ps),p_secret:SECRET}); }catch(e){ return true; } };
 P.moi=async()=>{ const ps=P.pseudo(); if(!ps) return null; try{ return await P.rpc('profil_moi',{p_k:key(ps),p_secret:SECRET}); }catch(e){ return null; } };
 P.restore=async(ps,code)=>{ code=String(code||'').replace(/[^a-z0-9]/gi,'').toLowerCase(); const r=await P.rpc('profil_moi',{p_k:key(ps),p_secret:code}); if(!r) return false;
   SECRET=code; sv('prof-secret',code); const d=r.data||{}; for(const [k,x] of Object.entries(D.jeux)){ const y=(d.jeux=d.jeux||{})[k]||{}; d.jeux[k]={p:Math.max(x.p||0,y.p||0),v:Math.max(x.v||0,y.v||0),l:Math.max(x.l||0,y.l||0),t:Math.max(x.t||0,y.t||0),last:Math.max(x.last||0,y.last||0)}; }
   const av=Object.assign({},D.av||{}); for(const [g,x] of Object.entries(d.av||{})){ const y=av[g]||{n:0,st:{}}; const st=Object.assign({},y.st); for(const [k,v] of Object.entries(x.st||{})) st[k]=Math.max(st[k]||0,v); av[g]={n:Math.max(y.n||0,x.n||0),st}; }
   D=Object.assign({},D,d,{jeux:d.jeux,av,succes:Object.assign({},D.succes,d.succes),rec:Object.assign({},D.rec,d.rec)}); D.pris=null; sv('prof',D); sv('net-name',r.pseudo); return true; };
 P.setData=o=>{ Object.assign(D,o); save(); };
 /* ---------- défis ---------- */
 const b64=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const unb64=s=>{ try{ return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))); }catch(e){ return null; } };
 P.defiText=(o)=>{ const g=CAT[o.j]; if(!g) return ''; return o.c!=null&&ARCADE[o.j]?`${o.d} te défie à ${g.t} : fais mieux que ${o.c} ${ARCADE[o.j].u} !`:`${o.d} te défie à ${g.t} : viens jouer une partie !`; };
 P.defiLink=(j,cible)=>{ const ps=P.pseudo()||'Un ami'; const o={d:ps,dk:key(ps),j}; if(cible!=null) o.c=cible; return SITE+j+'.html?defi='+b64(o)+(ps?'&de='+key(ps):''); };
 P.shareDefi=async(j,cible)=>{ const url=P.defiLink(j,cible); const txt=cible!=null&&ARCADE[j]?`Je te défie à ${CAT[j].t} : bats mes ${cible} ${ARCADE[j].u} !`:`Je te défie à ${CAT[j].t} sur la Salle de jeux !`;
   D.env=(D.env||0)+1; save();
   if(navigator.share){ try{ await navigator.share({title:'Défi – Salle de jeux',text:txt,url}); return 'partage'; }catch(e){ if(e&&e.name==='AbortError') return null; } }
   try{ await navigator.clipboard.writeText(txt+' '+url); notice('Lien du défi copié : envoie-le à qui tu veux'); return 'copie'; }catch(e){ prompt('Lien du défi',url); return 'copie'; } };
 P.sendDefi=async(toPseudo,j,cible)=>{ const ps=P.pseudo(); if(!ps) return 'pseudo'; await sync(); const r=await P.rpc('defi_envoyer',{p_de:key(ps),p_secret:SECRET,p_a:key(toPseudo),p_jeu:j,p_data:cible!=null?{c:cible}:{}}); if(r==='ok'){ D.env=(D.env||0)+1; save(); } return r; };
 P.mesDefis=async()=>{ const ps=P.pseudo(); if(!ps) return null; try{ return await P.rpc('defis_mes',{p_k:key(ps),p_secret:SECRET}); }catch(e){ return null; } };
 P.defiStatut=async(id,st)=>{ const ps=P.pseudo(); if(!ps||!id) return; try{ await P.rpc('defi_statut',{p_k:key(ps),p_secret:SECRET,p_id:id,p_statut:st}); }catch(e){} };
 P.acceptDefi=(o)=>{ D.defiActif=Object.assign({},o,{t0:Date.now()}); sv('prof',D); };
 function defiDone(){ const o=D.defiActif; if(!o) return; D.defiActif=null; D.ok=(D.ok||0)+1; if(o.i) P.defiStatut(o.i,'reussi'); save();
   const txt=o.c!=null?`Défi de ${o.d} relevé à ${CAT[o.j].t} !`:`Défi de ${o.d} relevé !`;
   setTimeout(()=>notice(txt,true,['Le lui dire',async()=>{ const m=o.c!=null?`J’ai relevé ton défi à ${CAT[o.j].t} : ${D.rec[o.j]} ${ARCADE[o.j].u} contre tes ${o.c} ! À toi de jouer.`:`J’ai relevé ton défi à ${CAT[o.j].t} ! Une revanche ?`; const url=P.defiLink(o.j,o.c!=null?D.rec[o.j]:null); if(navigator.share){ try{ await navigator.share({text:m,url}); return; }catch(e){} } try{ await navigator.clipboard.writeText(m+' '+url); notice('Message copié'); }catch(e){} }]),1200); }
 function checkDefiScore(s,score){ const o=D.defiActif; if(o&&o.j===s&&o.c!=null&&score>o.c) defiDone(); }
 function checkDefiPlayed(s){ const o=D.defiActif; if(o&&o.j===s&&o.c==null) defiDone(); }
 /* ---------- détection générique des parties (jeux de société) ---------- */
 let armed=true, inter=0, t0=Date.now(), lastIn=0;
 const modalOpen=()=>['modal','hall-modal','cover','menu','overlay'].some(id=>{ const e=document.getElementById(id); return e&&!e.hidden&&e.offsetParent!==null; });
 function onInput(e){ lastIn=Date.now(); if(!P.slug||window.PROF_MANUAL) return;
   const t=e.target; if(t&&t.closest){ const b=t.closest('button,[data-c]'); if(b&&(b.dataset&&b.dataset.c==='new'||(t.closest('#modal,#mbox,.mbox')&&/jouer|rejouer|revanche|nouvelle|commencer|lancer|c.est parti|go/i.test(b.textContent||'')))){ armed=true; inter=0; t0=Date.now(); return; } }
   if(modalOpen()) return; if(!armed) return; inter++; if(inter>=10&&Date.now()-t0>=30000) P.played(P.slug,typeof NET!=='undefined'&&NET.on&&NET.started); }
 addEventListener('pointerdown',onInput,true); addEventListener('keydown',onInput,true);
 setInterval(()=>{ if(!P.slug||document.hidden) return; if(Date.now()-lastIn<60000){ J(P.slug).t=(J(P.slug).t||0)+.25; sv('prof',D); } },15000);
 /* ---------- branchements ---------- */
 addEventListener('load',()=>setTimeout(()=>{
   if(P.slug&&!window.PROF_MANUAL){
     if(!window.PROF_WIN_MANUAL&&typeof window.confetti==='function'){ const c0=window.confetti; window.confetti=function(){ P.won(P.slug); armed=true; inter=0; t0=Date.now(); return c0.apply(this,arguments); }; }
     if(!window.PROF_WIN_MANUAL&&typeof window.sfx==='function'){ const s0=window.sfx; window.sfx=function(n){ if(n==='win'){ P.won(P.slug); armed=true; inter=0; t0=Date.now(); } return s0.apply(this,arguments); }; }
     const NG=window.NETGAME; if(NG&&NG.start){ const st0=NG.start; NG.start=function(){ P.played(P.slug,true); return st0.apply(this,arguments); }; }
   }
   const NG=window.NETGAME; if(NG&&NG.receive){ const r0=NG.receive; NG.receive=function(m){ try{ if(m&&m.kind==='new'&&typeof NET!=='undefined'&&NET.guest) P.played(P.slug,true); }catch(e){} return r0.apply(this,arguments); }; }
   // défi reçu par lien
   const sp=new URLSearchParams(location.search); const df=sp.get('defi'), de=sp.get('de');
   if(de&&!ld('prof-parrain')&&!P.stats().parties&&key(de)!==key(P.pseudo())) sv('prof-parrain',key(de));
   if(df){ const o=unb64(df); if(o&&CAT[o.j]&&o.dk!==key(P.pseudo())){ P.acceptDefi(o); setTimeout(()=>notice('⚔️ '+P.defiText(o),false),900); } }
   if(df||de){ try{ sp.delete('defi'); sp.delete('de'); history.replaceState(null,'',location.pathname+(sp.toString()?'?'+sp:'')); }catch(e){} }
   else if(D.defiActif&&D.defiActif.j===P.slug) setTimeout(()=>notice('⚔️ '+P.defiText(D.defiActif)),900);
   checkSucces(true); sv('prof',D);
   try{ if(typeof HALL!=='undefined'&&HALL.set) HALL.set({n:P.stats().parties,av:D.avatar}); }catch(e){}
   setTimeout(sync,4000);
 },30));
 /* ---------- réglages (volume, couleurs, vibrations) ---------- */
 const OPTS=Object.assign({vol:80,cb:false,vib:true},ld('sdj-opts')||{});
 P.opt=k=>OPTS[k]; P.setOpt=(k,v)=>{ OPTS[k]=v; sv('sdj-opts',OPTS); applyVol(); try{ document.dispatchEvent(new CustomEvent('sdj-opts',{detail:{k,v}})); }catch(e){} };
 /* volume général : tous les sons des jeux passent par un réglage commun */
 const ctxs=new Set();
 try{ const BA=window.BaseAudioContext||window.AudioContext||window.webkitAudioContext; const desc=BA&&Object.getOwnPropertyDescriptor(BA.prototype,'destination');
   if(desc&&desc.get){ Object.defineProperty(BA.prototype,'destination',{configurable:true,get(){ if(!this.__sdj){ const real=desc.get.call(this); const g=this.createGain(); g.gain.value=OPTS.vol/100; g.connect(real); this.__sdj=g; ctxs.add(this); } return this.__sdj; }}); } }catch(e){}
 function applyVol(){ ctxs.forEach(c=>{ try{ c.__sdj.gain.value=OPTS.vol/100; }catch(e){} }); }
 P.vibrate=ms=>{ try{ if(OPTS.vib&&navigator.vibrate) navigator.vibrate(ms); }catch(e){} };
 P.optsHTML=()=>`<div class="optrow"><label for="sdjVol">🔊 Volume des sons</label><input type="range" id="sdjVol" min="0" max="100" step="5" value="${OPTS.vol}"><b id="sdjVolV">${OPTS.vol} %</b></div>
   <label class="optrow"><input type="checkbox" id="sdjCb" ${OPTS.cb?'checked':''}> Couleurs adaptées au daltonisme <small>(mini-jeux vidéo)</small></label>
   ${'vibrate' in navigator?`<label class="optrow"><input type="checkbox" id="sdjVib" ${OPTS.vib?'checked':''}> Vibrations</label>`:''}`;
 P.bindOpts=root=>{ root=root||document; const v=root.querySelector('#sdjVol'); if(v) v.oninput=()=>{ P.setOpt('vol',+v.value); const o=root.querySelector('#sdjVolV'); if(o) o.textContent=v.value+' %'; };
   const c=root.querySelector('#sdjCb'); if(c) c.onchange=()=>P.setOpt('cb',c.checked); const b=root.querySelector('#sdjVib'); if(b) b.onchange=()=>P.setOpt('vib',b.checked); };
 /* ---------- première visite d'un jeu : proposer les règles ---------- */
 addEventListener('load',()=>setTimeout(()=>{ if(!P.slug||window.PROF_MANUAL||(D.jeux[P.slug]&&D.jeux[P.slug].p)) return; let seen=false; try{ seen=!!localStorage.getItem('tuto-'+P.slug); }catch(e){} if(seen) return;
   try{ localStorage.setItem('tuto-'+P.slug,'1'); }catch(e){}
   const hb=document.querySelector('[data-c="help"],[data-a="help"],#helpBtn,[data-act="help"]'); if(!hb) return;
   notice(`Première partie de ${CAT[P.slug].t} ? Les règles en une minute.`,false,['Voir les règles',()=>hb.click()]); },1800));
 /* ---------- application installable ---------- */
 P.standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 P.ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 P.bip=null; addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); P.bip=e; try{ document.dispatchEvent(new Event('prof-install')); }catch(x){} });
 addEventListener('appinstalled',()=>{ P.bip=null; notice('Salle de jeux installée sur cet appareil',true); });
 P.install=async()=>{ if(P.bip){ P.bip.prompt(); try{ await P.bip.userChoice; }catch(e){} P.bip=null; return; }
   const how=P.ios?'<ol><li>Touche le bouton <b>Partager</b> de Safari (le carré avec une flèche vers le haut).</li><li>Choisis <b>Sur l’écran d’accueil</b>.</li><li>Touche <b>Ajouter</b>.</li></ol><p>La Salle de jeux s’ouvre alors en plein écran, comme une application, et les jeux restent disponibles sans réseau.</p>':'<p>Dans le menu du navigateur, choisis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b>.</p><p>La Salle de jeux s’ouvre alors en plein écran, comme une application, et les jeux restent disponibles sans réseau.</p>';
   if(typeof HALL!=='undefined'&&HALL.openBox){ HALL.openBox(`<h2>Installer la Salle de jeux</h2>${how}<div class="acts"><button class="btn pri" data-hl="close">Compris</button></div>`,e=>{ if(e.target.closest('[data-hl=close]')) HALL.closeBox(); }); } else alert(how.replace(/<[^>]+>/g,' ')); };
 if('serviceWorker' in navigator&&(/github\.io$/.test(location.hostname)||location.hostname==='localhost')) addEventListener('load',()=>setTimeout(()=>navigator.serviceWorker.register('sw.js').catch(()=>{}),1500));
 return P; })();
window.PROF=PROF;
