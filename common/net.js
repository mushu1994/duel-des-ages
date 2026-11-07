/* ===== Salle en ligne : tables (Supabase Realtime, l'hôte fait tourner la partie), sur le hall commun =====
   Le jeu déclare window.NETGAME = { id, title, min, max, rules():html, rulesClick(e):bool,
     start(list), state():G, receive(msg):Promise, act(seat,fn,args):bool, busy():bool, resume(), leave() } */
const NET=(()=>{
 const $q=s=>document.querySelector(s), es=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const nt=s=>HALL.note(s), snd=n=>{ try{ if(typeof sfx==='function') sfx(n); }catch(e){} }, sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const ld=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }, svs=(k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
 let BOXCB=null; const box=(h,locked)=>{ BOXCB=null; HALL.openBox(h,e=>{ if(e.target.closest('[data-hl=close]')){ HALL.closeBox(); return; } (BOXCB||onClick)(e); },locked); };
 const PL=G=>G?(G.players||G.P||[]):[];
 const gameClose=()=>{ try{ if(typeof closeModal==='function') closeModal(true); }catch(e){} };
 const SITE='https://mushu1994.github.io/duel-des-ages/';
 const LET='ABCDEFGHJKLMNPQRSTUVWXYZ';
 const BOTS=['Ada','Hal','Pixel','Nova','Atlas','Écho','Zéphyr','Orbit','Volt','Lumen','Quartz','Sirius'];
 const N={on:false,host:false,guest:false,started:false,code:null,name:'',seat:null,peers:{},v:0,hs:null,lastV:-1,lastHs:null,q:[],aq:[],ai:{n:0,level:'normal'},ui:null,known:new Set(),waitHost:false,open:(()=>{ try{ return localStorage.getItem('net-open')!=='false'; }catch(e){ return true; } })(),invited:new Set()};
 N.cid=HALL.cid;
 let client=null, ch=null;
 const NG=()=>window.NETGAME;
 function newCode(){ let c=''; for(let i=0;i<4;i++) c+=LET[Math.floor(Math.random()*LET.length)]; return c; }
 const link=()=>{ const base=/github\.io$/.test(location.hostname)?location.origin+location.pathname:SITE+NG().id+'.html'; return base+'?salle='+N.code; };
 const sess=()=>ld('net-sess'), setSess=v=>svs('net-sess',v);
 const isGh=()=>/github\.io$/.test(location.hostname);
 /* ---------- connexion à une table ---------- */
 async function connect(code,asHost){ client=await HALL.client();
   if(ch){ try{ await client.removeChannel(ch); }catch(e){} ch=null; }
   N.code=code; N.host=asHost; N.guest=!asHost; N.on=true; N.peers={}; N.known=new Set(); N.hs=Math.random().toString(36).slice(2,8); N.name=HALL.pseudo;
   ch=client.channel('salle:'+NG().id+':'+code,{config:{broadcast:{self:false},presence:{key:N.cid}}});
   ch.on('broadcast',{event:'st'},({payload})=>{ if(N.guest) enqueue(payload&&payload.j?JSON.parse(payload.j):payload); });
   ch.on('broadcast',{event:'act'},({payload})=>{ if(N.host){ N.aq.push(payload&&payload.j?JSON.parse(payload.j):payload); drain(); } });
   ch.on('broadcast',{event:'hello'},()=>{ if(N.host){ if(N.started) pushFull(); else pushLobby(); } });
   ch.on('broadcast',{event:'lobby'},({payload})=>{ if(N.guest&&!N.started){ N.lobby=payload; if(N.ui==='lobby') lobbyUI(); } });
   ch.on('broadcast',{event:'close'},()=>{ if(N.guest){ nt('L’hôte a fermé la table'); leave(true); } });
   ch.on('broadcast',{event:'handover'},({payload})=>{ if(payload&&payload.to===N.cid&&N.guest&&N.started) promote('handover'); });
   ch.on('broadcast',{event:'relaunch'},({payload})=>{ if(N.guest) nt(`L’hôte est parti : ${payload&&payload.n?payload.n:'un joueur'} va relancer la partie`); });
   ch.on('broadcast',{event:'react'},({payload})=>{ if(payload) showReact(payload.n,payload.e); });
   ch.on('broadcast',{event:'rematch'},({payload})=>{ if(N.host&&payload) wantRematch(payload.cid,payload.n); });
   ch.on('presence',{event:'sync'},onSync);
   return new Promise((res,rej)=>{ let done=false; const to=setTimeout(()=>{ if(!done){ done=true; rej(new Error('timeout')); } },9000);
     ch.subscribe(async st=>{ if(st==='SUBSCRIBED'){ N.at=N.at||Date.now(); N.hat=asHost?Date.now():0; await ch.track(me()); if(!done){ done=true; clearTimeout(to); res(); } if(N.guest) send('hello',{}); }
       else if((st==='CHANNEL_ERROR'||st==='TIMED_OUT')&&!done){ done=true; clearTimeout(to); rej(new Error(st)); } }); }); }
 function me(){ return {name:N.name,host:N.host,hat:N.hat||0,at:N.at||Date.now()}; }
 function retrack(){ if(ch) ch.track(me()).catch(()=>{}); }
 function send(ev,payload){ if(ch) ch.send({type:'broadcast',event:ev,payload}).catch(()=>{}); }
 function onSync(){ const st=ch.presenceState(); const peers={}; for(const k in st){ const m=st[k][st[k].length-1]; peers[k]=m; } const before=N.peers; N.peers=peers;
   const names=k=>(peers[k]||before[k]||{}).name||'Un joueur';
   for(const k in peers) if(!before[k]&&k!==N.cid){ if(N.known.has(k)) nt(`${names(k)} est de retour`); else if(N.host&&!N.started){ nt(`${names(k)} rejoint la table`); snd('pop'); } }
   for(const k in before) if(!peers[k]&&k!==N.cid) nt(`${names(k)} a quitté la table`);
   Object.keys(peers).forEach(k=>N.known.add(k));
   if(N.host){ const rival=Object.entries(peers).find(([k,m])=>k!==N.cid&&m.host&&((m.hat||0)<(N.hat||0)||((m.hat||0)===(N.hat||0)&&k<N.cid))); if(rival){ demote(); } }
   if(N.guest){ const hostHere=Object.values(peers).some(m=>m.host); N.waitHost=!hostHere&&N.started; if(N.waitHost) scheduleElection(); }
   if(N.host){ if(N.started){ const G=NG().state(); let ch2=false; if(G) PL(G).forEach(P=>{ if(P.cid&&P.away&&peers[P.cid]){ P.ai=false; P.away=false; ch2=true; } }); if(ch2) NG().resume(); pushFull(); } else pushLobby(); }
   hallRoom(); badge(); if(N.ui==='lobby') lobbyUI(); else if(N.ui==='panel') panelUI(); }
 function hallRoom(){ if(!N.on){ HALL.set({r:null}); return; } const n=N.host&&!N.started?lobbyOrder().length+N.ai.n:Object.keys(N.peers).length;
   HALL.set({r:{g:NG().id,gt:NG().title,code:N.code,host:N.host,open:N.host?N.open:false,started:N.started,n,max:NG().max}}); }
 /* ---------- hôte ---------- */
 function pushLobby(){ if(!N.host||N.started) return; send('lobby',{order:lobbyOrder().map(k=>({cid:k,name:N.peers[k].name})),ai:N.ai,open:N.open}); }
 function lobbyOrder(){ return Object.keys(N.peers).sort((a,b)=>(N.peers[b].host-N.peers[a].host)||(N.peers[a].at-N.peers[b].at)); }
 let pushT=null;
 function push(ev,kind){ if(!N.host||!N.started) return; if(!ev&&!kind){ if(!pushT) pushT=setTimeout(()=>{ pushT=null; pushNow(null,null); },40); return; } if(pushT){ clearTimeout(pushT); pushT=null; } pushNow(ev,kind); }
 function pushNow(ev,kind){ if(!N.host||!N.started) return; N.v++; const G=NG().state(); if(!G) return; const W=NG().wire?NG().wire(G):G; const p={hs:N.hs,v:N.v,G:W,ev:ev||null,kind:kind||null}; N.last=p; send('st',{j:JSON.stringify(p)}); }
 function pushFull(){ if(!N.host||!N.started) return; push(null,'full'); }
 function drain(){ if(!N.host||!N.started) return; while(N.aq.length&&!NG().busy()){ const m=N.aq.shift(); const G=NG().state(); const seat=G?PL(G).findIndex(P=>P.cid===m.cid):-1; if(seat<0||PL(G)[seat].ai) continue; NG().act(seat,m.fn,m.args||[]); } }
 /* ---------- reprise de la partie par un autre joueur ---------- */
 let elT=null;
 /* jeux vérifiés : la partie reprend exactement où elle en était chez le nouvel hôte */
 const RESUME=new Set(['serpents','souriciere','piaf','quatre-en-ligne','echecs','dames','bataille','dominos','petits-chevaux','rami','remparts','conquete','joyaux-renaissance','sept-merveilles','derniere-carte','quitte-ou-sept']);
 const canAdopt=()=>RESUME.has(NG().id);
 function scheduleElection(){ if(elT) return; elT=setTimeout(()=>{ elT=null; elect(); },canAdopt()?3000:30000); }
 function candidates(){ const G=NG().state(); const pl=PL(G); const here=Object.keys(N.peers);
   const seat=k=>{ const i=pl.findIndex(P=>P.cid===k&&!P.away); return i<0?999:i; };
   return here.sort((a,b)=>(seat(a)-seat(b))||(a<b?-1:1)); }
 function elect(){ if(!N.on||!N.guest||!N.started) return; const hostHere=Object.values(N.peers).some(m=>m.host); if(hostHere){ N.waitHost=false; return; }
   const c=candidates(); if(c[0]===N.cid) promote('election'); else scheduleElection(); }
 function promote(why){ const G=NG().state(); if(!G||N.host) return;
   N.host=true; N.guest=false; N.waitHost=false; N.hs=Math.random().toString(36).slice(2,8); N.hat=Date.now(); N.aq=[]; N.q=[];
   if(N.lobby&&N.lobby.open!=null) N.open=N.lobby.open;
   PL(G).forEach(P=>{ if(P.cid&&!P.ai&&!N.peers[P.cid]){ P.ai=true; P.away=true; P.level=P.level||'normal'; } });
   N.seat=PL(G).findIndex(P=>P.cid===N.cid); if(N.seat<0) N.seat=null;
   setSess({game:NG().id,code:N.code,host:true}); retrack();
   if(!canAdopt()){ hallRoom(); badge(); send('relaunch',{n:N.name}); box(`<h2>L’hôte a quitté la partie</h2><p>Dans ce jeu, la partie ne peut pas reprendre exactement là où elle en était. Tu peux la relancer avec les mêmes joueurs : l’ordinateur prend la place de ceux qui sont partis.</p><div class="acts"><button class="btn" data-net="lobby">Revenir au salon</button><button class="btn pri" data-net="again">Relancer la partie</button></div>`); BOXCB=e=>{ const b=e.target.closest('[data-net]'); if(!b) return; if(b.dataset.net==='again') restart(); else onClick(e); }; return; }
   try{ if(NG().adopt) NG().adopt(); else if(NG().resume) NG().resume(); }catch(e){ console.error(e); }
   pushFull(); hallRoom(); badge(); nt(why==='handover'?'L’hôte s’est absenté : tu fais tourner la partie':'L’hôte est parti : tu reprends la partie'); }
 function demote(){ if(!N.host) return; N.host=false; N.guest=true; N.hat=0; N.lastHs=null; N.lastV=-1; N.q=[];
   setSess({game:NG().id,code:N.code,host:false}); retrack(); try{ if(NG().demoted) NG().demoted(); }catch(e){} send('hello',{}); hallRoom(); badge(); }
 function handover(){ if(!N.on||!N.host||!N.started||!canAdopt()) return; const G=NG().state(); const pl=PL(G);
   const to=Object.keys(N.peers).filter(k=>k!==N.cid&&pl.some(P=>P.cid===k&&!P.ai)).sort((a,b)=>pl.findIndex(P=>P.cid===a)-pl.findIndex(P=>P.cid===b))[0];
   if(!to) return; pushNow(null,'full'); send('handover',{to}); demote(); }
 document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') handover(); else if(N.on&&N.guest) send('hello',{}); });
 addEventListener('pagehide',()=>handover());
 /* ---------- réactions et revanche ---------- */
 const EMO=['👍','😂','😮','😡','🎉','👏','🤞','😴'];
 let lastReact=0;
 function showReact(name,e){ if(!EMO.includes(e)) return; const d=document.createElement('div'); d.className='net-react'; d.style.left=(12+Math.random()*60)+'%'; d.innerHTML=`<b>${e}</b><small>${es(name||'')}</small>`; document.body.appendChild(d); setTimeout(()=>d.remove(),2600); }
 function react(e){ const t=Date.now(); if(t-lastReact<900) return; lastReact=t; send('react',{n:N.name,e}); showReact(N.name,e); }
 function reactBtn(){ let b=$q('#netReact'); if(!N.on||!N.started){ if(b) b.remove(); return; } if(b) return;
   b=document.createElement('div'); b.id='netReact'; b.innerHTML='<button class="net-rbtn" aria-label="Réagir">😀</button><div class="net-rpick" hidden>'+EMO.map(e=>`<button data-e="${e}">${e}</button>`).join('')+'</div>';
   document.body.appendChild(b); const pick=b.querySelector('.net-rpick');
   b.addEventListener('click',ev=>{ const x=ev.target.closest('[data-e]'); if(x){ react(x.dataset.e); pick.hidden=true; return; } if(ev.target.closest('.net-rbtn')) pick.hidden=!pick.hidden; }); }
 const wants=new Map(); let rmBar=null;
 function wantRematch(cid,n){ wants.set(cid,n); if(!rmBar){ rmBar=document.createElement('div'); rmBar.className='net-rm'; document.body.appendChild(rmBar); rmBar.addEventListener('click',e=>{ const b=e.target.closest('[data-rm]'); if(!b) return; if(b.dataset.rm==='go') restart(); clearRm(); }); }
   const humans=PL(NG().state()).filter(P=>P.cid&&!P.ai&&P.cid!==N.cid&&N.peers[P.cid]).length;
   rmBar.innerHTML=`<span>🔁 ${[...wants.values()].map(es).join(', ')} ${wants.size>1?'veulent':'veut'} une revanche${humans>wants.size?` (${wants.size}/${humans})`:''}</span><button data-rm="no">Plus tard</button><button data-rm="go" class="pri">Relancer</button>`; snd('pop'); }
 function clearRm(){ wants.clear(); if(rmBar){ rmBar.remove(); rmBar=null; } }
 function askRematch(){ send('rematch',{cid:N.cid,n:N.name}); nt('Demande de revanche envoyée à l’hôte'); }
 /* ---------- invité ---------- */
 function enqueue(p){ if(p.hs!==N.lastHs){ N.lastHs=p.hs; N.lastV=-1; } if(p.v<=N.lastV) return; N.lastV=p.v; N.q.push(p); pump(); }
 async function pump(){ if(N.pumping) return; N.pumping=true;
   while(N.q.length){ let p=N.q.shift(); if(p.kind==='full'||!p.ev){ while(N.q.length&&(N.q[0].kind==='full'||!N.q[0].ev)&&N.q[0].kind!=='lobby'&&N.q[0].kind!=='new') p=N.q.shift(); }
     if(p.kind==='lobby'||!p.G){ N.started=false; N.seat=null; try{ NG().receive({kind:'lobby'}); }catch(e){} hallRoom(); lobbyUI(); continue; }
     const first=!N.started; N.started=true; N.waitHost=false; if(PL(p.G).length){ const s=PL(p.G).findIndex(P=>P.cid===N.cid); N.seat=s>=0?s:null; }
     if(first){ HALL.closeBox(); gameClose(); N.ui=null; hallRoom(); if(N.seat==null) nt('Partie en cours : tu la regardes en spectateur'); }
     try{ await NG().receive(Object.assign({},p,{kind:first&&p.kind!=='new'?'new':p.kind})); }catch(e){ console.error(e); } badge(); }
   N.pumping=false; }
 function act(fn,args){ if(!N.guest) return false; if(N.waitHost){ nt('En attente de l’hôte…'); return true; } send('act',{j:JSON.stringify({cid:N.cid,fn,args})}); snd('click'); return true; }
 /* ---------- interface ---------- */
 function badge(){ reactBtn(); const b=$q('#netBtn'); if(!b) return; if(!N.on){ const n=HALL.ok?HALL.count():0; b.innerHTML=`<i class="net-dot ${HALL.ok?'':'off'}"></i>En ligne${n?` · ${n}`:''}`; b.classList.remove('net-on'); return; }
   const n=Object.keys(N.peers).length; b.innerHTML=`<i class="net-dot ${N.waitHost?'off':''}"></i>Table ${N.code} · ${n}`; b.classList.add('net-on'); }
 N.hallChanged=()=>{ badge(); const vis=$q('#hall-modal')&&!$q('#hall-modal').hidden&&$q('#hall-box [data-net]')&&!$q('#hallPseudo'); if(!vis) return; if(N.ui==='start') startUI(); else if(N.ui==='lobby'&&N.host) lobbyUI(); };
 function startUI(prefill){ N.ui='start'; const g=NG(); const tabs=HALL.ok?HALL.tables(g.id):[];
   const off=HALL.ok===false;
   box(`<h2>Jouer en ligne</h2>
    ${off?`<p class="net-note">Le salon en ligne n’est pas joignable d’ici. ${isGh()?'Vérifie ta connexion internet.':`Ouvre le jeu sur le site : <a href="${SITE}${g.id}.html" target="_blank" rel="noopener">${SITE.replace('https://','')}${g.id}.html</a>`}</p>`:''}
    <div class="net-me">${HALL.pseudo?`Ton pseudo : <b>${es(HALL.pseudo)}</b> <button class="net-link" data-net="pseudo">changer</button>`:`<button class="btn pri" data-net="pseudo">Choisir un pseudo</button> <span class="net-note">obligatoire pour jouer en ligne</span>`}</div>
    <h4>Tables ouvertes</h4>${HALL.ok==null?'<p class="net-wait"><span class="net-spin"></span>Connexion…</p>':tabs.length?`<ul class="net-list">${tabs.map(t=>`<li><span class="net-av">${es(t.p[0])}</span>Table de ${es(t.p)} <small>· ${t.n}/${t.max} joueurs</small>${t.cid===N.cid?'':`<button class="btn pri net-r" data-net="jt:${t.code}">Rejoindre</button>`}</li>`).join('')}</ul>`:'<p class="net-note">Aucune table ouverte pour ce jeu. Crée la tienne : elle apparaîtra pour tous les joueurs connectés.</p>'}
    ${HALL.ok&&HALL.live(g.id).length?`<h4>Parties en cours</h4><ul class="net-list">${HALL.live(g.id).map(t=>`<li><span class="net-av">👀</span>Table de ${es(t.p)} <small>· ${t.n} joueur${t.n>1?'s':''}</small>${t.cid===N.cid?'':`<button class="btn net-r" data-net="jt:${t.code}">Regarder</button>`}</li>`).join('')}</ul>`:''}
    <div class="net-two"><div class="net-box"><h4>Créer une table</h4><label class="net-chk"><input type="checkbox" id="netOpen" ${N.open?'checked':''}> Ouverte à tous les connectés</label><button class="btn pri" data-net="create">Créer une table</button></div>
    <div class="net-box"><h4>Rejoindre avec un code</h4><input type="text" class="net-in net-code" id="netCode" maxlength="4" autocapitalize="characters" autocomplete="off" placeholder="CODE" value="${es(prefill||'')}"><button class="btn" data-net="join">Rejoindre</button></div></div>
    <p class="net-note">${HALL.ok?`${HALL.count()} personne${HALL.count()>1?"s":""} sur le site · <button class="net-link" data-net="hall">voir qui est là et inviter</button>`:''}</p>
    <div class="acts"><button class="btn" data-hl="close">Fermer</button></div>`);
   const c=$q('#netCode'); if(c) c.oninput=()=>{ c.value=c.value.toUpperCase().replace(/[^A-Z]/g,''); }; const o=$q('#netOpen'); if(o) o.onchange=()=>{ N.open=o.checked; svs('net-open',N.open); }; }
 function busyUI(msg){ box(`<h2>Jouer en ligne</h2><p class="net-wait"><span class="net-spin"></span>${msg}</p>`); }
 async function create(){ await HALL.ensure(); if(!HALL.pseudo) return; busyUI('Ouverture de la table…');
   try{ for(let t=0;t<4;t++){ const code=newCode(); await connect(code,true); await sleep(700); const other=Object.entries(N.peers).some(([k,m])=>k!==N.cid&&m.host); if(!other) break; } }
   catch(e){ failUI(); return; }
   N.started=false; N.invited=new Set(); setSess({game:NG().id,code:N.code,host:true}); hallRoom(); lobbyUI(); badge();
   const to=HALL.pendingInvite(NG().id); if(to){ HALL.invite(to,{g:NG().id,gt:NG().title,code:N.code}); N.invited.add(to); lobbyUI(); } }
 async function join(code){ code=(code||'').toUpperCase(); if(!/^[A-Z]{4}$/.test(code)){ nt('Le code fait 4 lettres'); return; } await HALL.ensure(); if(!HALL.pseudo) return;
   if(N.on&&N.code===code) { lobbyUI(); return; } if(N.on) await leave(true);
   busyUI('Connexion à la table '+code+'…');
   try{ await connect(code,false); }catch(e){ failUI(); return; }
   N.started=false; setSess({game:NG().id,code,host:false}); await sleep(1200);
   if(!N.started){ const hostHere=Object.values(N.peers).some(m=>m.host); lobbyUI(hostHere?null:'Personne n’a encore ouvert cette table. Vérifie le code ; tu peux attendre ici.'); } hallRoom(); badge(); }
 function failUI(){ N.on=false; box(`<h2>Connexion impossible</h2><p>Le serveur de jeu n’a pas répondu. Vérifie ta connexion internet${isGh()?'':', ou ouvre le jeu directement sur le site'}.</p>${isGh()?'':`<p><a href="${SITE}${NG().id}.html" target="_blank" rel="noopener">Ouvrir ${es(NG().title)} sur le site</a></p>`}<div class="acts"><button class="btn" data-hl="close">Fermer</button><button class="btn pri" data-net="start">Réessayer</button></div>`); badge(); }
 function lobbyUI(note){ N.ui='lobby'; const g=NG();
   const order=N.host?lobbyOrder():((N.lobby&&N.lobby.order)||[]).map(x=>x.cid); const names=N.host?order.map(k=>N.peers[k].name):((N.lobby&&N.lobby.order)||[]).map(x=>x.name);
   const hs=order.length, maxAI=Math.max(0,g.max-hs); if(N.host&&N.ai.n>maxAI) N.ai.n=maxAI; const ai=N.host?N.ai:((N.lobby&&N.lobby.ai)||{n:0,level:'normal'}); const total=hs+ai.n;
   const list=names.map((n,i)=>`<li><span class="net-av">${es((n||'?')[0])}</span>${es(n)}${order[i]===N.cid?' <small>(toi)</small>':''}${i===0?' <small>· hôte</small>':''}</li>`).join('')+Array.from({length:ai.n},(_,i)=>`<li class="ai"><span class="net-av">🤖</span>Ordinateur ${i+1} <small>· ${ai.level}</small></li>`).join('');
   const cand=N.host&&HALL.ok?HALL.list().filter(m=>!N.peers[m.cid]&&!(m.r&&m.r.started)):[];
   box(`<h2>Table ${N.code}</h2>${note?`<p class="net-note">${note}</p>`:''}
    <div class="net-code-big" aria-label="Code de la table">${[...N.code].map(c=>`<b>${c}</b>`).join('')}</div>
    <div class="net-share"><button class="btn" data-net="copy">Copier le lien</button>${navigator.share?'<button class="btn" data-net="share">Partager</button>':''}</div>
    <h4>Joueurs (${total} · de ${g.min} à ${g.max})</h4><ul class="net-list">${list||'<li>…</li>'}</ul>
    ${N.host?`<h4>Inviter des joueurs connectés</h4>${cand.length?`<ul class="net-list">${cand.map(m=>`<li><span class="net-av">${es(m.p[0])}</span>${es(m.p)} <small>· ${m.r?'à une autre table':m.gt?'sur '+es(m.gt):'sur le portail'}</small>${N.invited.has(m.cid)?'<small class="net-r">invité ✓</small>':`<button class="btn net-r" data-net="inv:${m.cid}">Inviter</button>`}</li>`).join('')}</ul>`:'<p class="net-note">Personne d’autre de disponible sur le site pour l’instant. Partage le lien ou le code.</p>'}
     <label class="net-chk"><input type="checkbox" id="netOpen2" ${N.open?'checked':''}> Table visible et ouverte à tous les connectés</label>
     <h4>Ordinateurs en plus</h4><div class="seg">${Array.from({length:maxAI+1},(_,n)=>`<button class="${ai.n===n?'on':''}" data-net="ai:${n}">${n}</button>`).join('')}</div>
     ${ai.n?`<div class="seg" style="margin-left:6px">${['facile','normal','difficile'].map(l=>`<button class="${ai.level===l?'on':''}" data-net="lv:${l}">${l}</button>`).join('')}</div>`:''}
     ${g.rules?`<div class="net-rules">${g.rules()}</div>`:''}
     <div class="acts"><button class="btn" data-net="quit">Fermer la table</button><button class="btn pri" data-net="go" ${total>=g.min&&total<=g.max?'':'disabled'}>${total<g.min?`Encore ${g.min-total} joueur${g.min-total>1?'s':''}`:'Lancer la partie'}</button></div>`
    :`<p class="net-wait"><span class="net-spin"></span>En attente que l’hôte lance la partie…</p><div class="acts"><button class="btn" data-net="quit">Quitter la table</button></div>`}`,true);
   const o=$q('#netOpen2'); if(o) o.onchange=()=>{ N.open=o.checked; svs('net-open',N.open); hallRoom(); }; }
 function panelUI(){ N.ui='panel'; const G=NG().state();
   const rows=(G?PL(G):[]).map((P,i)=>{ const here=P.cid?!!N.peers[P.cid]:false; return `<li><span class="net-av">${P.cid?es((P.name||'?')[0]):'🤖'}</span>${es(P.name)}${P.cid===N.cid?' <small>(toi)</small>':''} <small>· ${P.cid?(P.ai?'remplacé par l’ordinateur':here?'<span class="net-ok">connecté</span>':'<span class="net-ko">absent</span>'):'ordinateur'}</small></li>`; }).join('');
   const away=N.host&&G&&PL(G).some(P=>P.cid&&!P.ai&&!N.peers[P.cid]);
   const watchers=Object.keys(N.peers).filter(k=>!(G&&PL(G).some(P=>P.cid===k))).map(k=>N.peers[k].name);
   box(`<h2>Table ${N.code}</h2><div class="net-share"><button class="btn" data-net="copy">Copier le lien</button>${navigator.share?'<button class="btn" data-net="share">Partager</button>':''}</div>
    <ul class="net-list">${rows}</ul>${watchers.length?`<p class="net-note">Spectateurs : ${watchers.map(esc).join(', ')}</p>`:''}
    ${N.waitHost?`<p class="net-wait"><span class="net-spin"></span>${canAdopt()?'L’hôte s’est déconnecté : un autre joueur reprend la partie dans quelques secondes…':'L’hôte s’est déconnecté. La partie reprend dès son retour ; sinon, un autre joueur pourra la relancer d’ici 30 secondes.'}</p>`:''}
    ${away?'<p class="net-note">Un joueur absent bloque la partie quand c’est son tour. Tu peux confier sa place à l’ordinateur ; il la récupère s’il revient.</p>':''}
    <div class="acts"><button class="btn" data-net="hall">Joueurs en ligne</button>${away?'<button class="btn" data-net="replace">Remplacer les absents</button>':''}${N.host?'<button class="btn" data-net="lobby">Revenir au salon</button>':''}<button class="btn" data-net="quit">${N.host&&Object.keys(N.peers).length<2?'Fermer la table':'Quitter la table'}</button><button class="btn pri" data-hl="close">Continuer</button></div>`);
   }
 function onClick(e){ const b=e.target.closest('[data-net]'); if(!b){ if(N.ui==='lobby'&&N.host&&NG().rulesClick&&NG().rulesClick(e)) lobbyUI(); return; } const [k,v]=b.dataset.net.split(':'); snd('click');
   if(k==='create') create(); else if(k==='join') join($q('#netCode').value); else if(k==='jt') join(v);
   else if(k==='pseudo'){ HALL.askPseudo(()=>{ if(N.ui==='start') startUI(); }); }
   else if(k==='hall'){ HALL.openPanel(NG().id); }
   else if(k==='inv'){ HALL.invite(v,{g:NG().id,gt:NG().title,code:N.code}); N.invited.add(v); lobbyUI(); }
   else if(k==='start') startUI(); else if(k==='copy'){ const l=link(); (navigator.clipboard?navigator.clipboard.writeText(l):Promise.reject()).then(()=>nt('Lien copié : envoie-le à tes amis'),()=>{ prompt('Lien de la table',l); }); }
   else if(k==='share'){ navigator.share({title:NG().title+' en ligne',text:`Rejoins ma table ${N.code} pour jouer à ${NG().title}`,url:link()}).catch(()=>{}); }
   else if(k==='ai'){ N.ai.n=+v; lobbyUI(); pushLobby(); hallRoom(); } else if(k==='lv'){ N.ai.level=v; lobbyUI(); pushLobby(); }
   else if(k==='go') launch(); else if(k==='quit') leave(); else if(k==='replace') replace();
   else if(k==='lobby'){ N.started=false; N.aq=[]; send('lobby',{order:lobbyOrder().map(k=>({cid:k,name:N.peers[k].name})),ai:N.ai,back:1}); send('st',{hs:N.hs,v:++N.v,G:null,kind:'lobby'}); hallRoom(); lobbyUI(); } }
 function botNames(humans,n){ const taken=new Set(humans.map(h=>HALL.key(h))); return BOTS.filter(b=>!taken.has(HALL.key(b))).slice(0,n); }
 function launch(){ const order=lobbyOrder(); const list=order.map(k=>({name:N.peers[k].name,cid:k})); const bn=botNames(list.map(x=>x.name),N.ai.n); for(let i=0;i<N.ai.n;i++) list.push({ai:true,level:N.ai.level,name:bn[i]});
   HALL.closeBox(); gameClose(); N.ui=null; N.started=true; N.aq=[]; N.seat=0; hallRoom(); NG().start(list); }
 function restart(){ clearRm(); const G=NG().state(); if(!G||!N.host) return; const list=PL(G).map(P=>P.cid&&!P.ai?{name:P.name,cid:P.cid}:{ai:true,level:P.level||'normal',name:P.cid?botNames(PL(G).map(x=>x.name),1)[0]:P.name}); HALL.closeBox(); gameClose(); N.started=true; N.aq=[]; hallRoom(); NG().start(list); }
 function replace(){ const G=NG().state(); if(!G) return; PL(G).forEach(P=>{ if(P.cid&&!P.ai&&!N.peers[P.cid]){ P.ai=true; P.away=true; P.level=P.level||'normal'; } }); HALL.closeBox(); NG().resume(); pushFull(); }
 async function leave(silent){ if(N.host&&!silent&&N.started&&Object.keys(N.peers).length>1){ handover(); silent=true; } if(N.host&&!silent) send('close',{}); clearRm(); if(elT){ clearTimeout(elT); elT=null; } const rb=$q('#netReact'); if(rb) rb.remove(); const was=N.on; N.on=false; N.host=false; N.guest=false; N.started=false; N.seat=null; N.code=null; N.q=[]; N.aq=[]; N.ui=null; setSess(null);
   if(ch&&client){ try{ await client.removeChannel(ch); }catch(e){} } ch=null; HALL.set({r:null}); badge(); HALL.closeBox(); if(was) NG().leave(); }
 function netMenu(){ if(N.host) box(`<h2>Partie en ligne</h2><p>Tu es l’hôte de la table ${N.code}.</p><div class="acts" style="justify-content:flex-start"><button class="btn pri" data-net="again">Relancer avec les mêmes joueurs</button><button class="btn" data-net="lobby">Revenir au salon (joueurs, règles)</button><button class="btn" data-net="quitlocal">Fermer la table et jouer en local</button></div><div class="acts"><button class="btn" data-hl="close">Annuler</button></div>`);
   else box(`<h2>Partie en ligne</h2><p>Seul l’hôte peut relancer une partie. Tu peux lui demander une revanche.</p><div class="acts"><button class="btn" data-hl="close">Continuer</button><button class="btn" data-net="rematch">🔁 Demander une revanche</button><button class="btn pri" data-net="quitlocal">Quitter la table et jouer en local</button></div>`);
   BOXCB=async e=>{ const b=e.target.closest('[data-net]'); if(!b) return; if(b.dataset.net==='again') restart(); else if(b.dataset.net==='rematch'){ askRematch(); HALL.closeBox(); } else if(b.dataset.net==='quitlocal'){ await leave(); NG().menuLocal(); } else onClick(e); }; }
 function hostEl(){ const g=NG(); return (g.btnHost&&$q(g.btnHost))||$q('.top .tools')||$q('.top .hrow'); }
 function placeBtn(){ if($q('#netBtn')) return; const host=hostEl(); const b=document.createElement('button'); b.id='netBtn';
   if(host){ b.className=(host.querySelector('.hbtn')?'hbtn':'btn'); const nb=host.querySelector('[data-c="new"],[data-a="menu"],[data-a="new"]'); host.insertBefore(b,nb||null); } else { b.className='btn net-fab'; document.body.appendChild(b); }
   b.onclick=()=>{ if(N.on){ if(N.started) panelUI(); else lobbyUI(); } else startUI(); }; badge(); }
 function init(){ const g=NG(); if(!g) return; HALL.where(g.id,g.title);
   placeBtn(); new MutationObserver(()=>{ const b=$q('#netBtn'); if(!b) placeBtn(); else if(b.classList.contains('net-fab')&&hostEl()){ b.remove(); placeBtn(); } }).observe(document.body,{childList:true,subtree:true});
   badge(); HALL.connect().then(badge);
   if(window.GAME&&window.GAME.menu){ const menu0=window.GAME.menu; g.menuLocal=g.menuLocal||menu0; window.GAME.menu=function(){ if(N.on&&N.started) return netMenu(); if(N.on) return lobbyUI(); return menu0.apply(this,arguments); }; }
   N.onNew=()=>{ if(N.on&&N.started){ netMenu(); return true; } if(N.on){ lobbyUI(); return true; } return false; };
   const sp=new URLSearchParams(location.search); const qs=sp.get('salle'), cr=sp.get('creer'); const s=sess();
   if(qs||cr) history.replaceState(null,'',location.pathname);
   if(cr){ setTimeout(()=>{ gameClose(); create(); },50); return; }
   if(qs&&/^[A-Za-z]{4}$/.test(qs)){ const code=qs.toUpperCase(); if(s&&s.game===g.id&&s.code===code&&s.host) resumeHost(s); else setTimeout(()=>{ gameClose(); if(HALL.pseudo) join(code); else startUI(code); },50); return; }
   if(s&&s.game===g.id){ if(s.host) resumeHost(s); else if(HALL.pseudo){ gameClose(); join(s.code); } } }
 async function resumeHost(s){ const G=NG().state(); if(!G||!G.net){ setSess(null); return; } try{ await connect(s.code,true); }catch(e){ nt('Table en ligne indisponible'); return; } N.started=true; await sleep(900); if(Object.entries(N.peers).some(([k,m])=>k!==N.cid&&m.host)){ demote(); nt('Un autre joueur a repris la partie : tu la rejoins'); return; } N.seat=PL(G).findIndex(P=>P.cid===N.cid); hallRoom(); badge(); pushFull(); nt('Table '+s.code+' rouverte'); }
 N.init=init; N.push=push; N.drain=drain; N.act=act; N.leave=leave; N.restart=restart; N.startUI=startUI; N.panel=()=>panelUI();
 N.rematch=askRematch; N.react=react; N.promote=promote; N.handover=handover;
 N.joinCode=c=>join(c); N.createFor=()=>{ HALL.closeBox(); gameClose(); create(); };
 N.mine=p=>N.on&&N.started?p===N.seat:null;
 N.waitHTML='<p class="net-wait">L’hôte peut relancer une partie ou revenir au salon.</p><div class="acts"><button class="btn" data-c="close">Fermer</button></div>';
 return N; })();
addEventListener('load',()=>setTimeout(()=>NET.init(),0));
