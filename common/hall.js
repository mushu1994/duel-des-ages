/* ===== Hall de la Salle de jeux : joueurs connectés, pseudos uniques, tables ouvertes, invitations (Supabase Realtime, sans base) ===== */
const HALL=(()=>{
 const SB_URL='https://evepcodcppxpufbkuflq.supabase.co', SB_KEY='sb_publishable_iUC6966SeFt_05Iac1wGQw_yDo9zl7y';
 const LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
 const SITE='https://mushu1994.github.io/duel-des-ages/';
 const GAMES={"serpents":"Serpents","souriciere":"Souricière","piaf":"Piaf","derniere-carte":"Dernière carte","quitte-ou-sept":"Quitte ou Sept","joyaux-renaissance":"Joyaux de la Renaissance","sept-merveilles":"Sept Merveilles","echecs":"Échecs","quatre-en-ligne":"Quatre en ligne","reversi":"Reversi","dames":"Dames","bataille-navale":"Bataille navale","code-secret":"Code Secret","bataille":"La Bataille","petits-chevaux":"Petits Chevaux","dominos":"Dominos","tetes-de-boeuf":"Têtes de Bœuf","plus-bas":"Plus Bas","petit-bac":"Petit Bac","poker":"Poker","president":"Président","tarot":"Tarot","rami":"Rami voleur","remparts":"Remparts","conquete":"Conquête","approche-finale":"Approche finale","duel-des-joyaux":"Duel des Joyaux","duel-des-ages":"Duel des Âges","grand-proprietaire":"Grand Propriétaire","nouvelle-terre":"Nouvelle Terre","rails-d-europe":"Rails d’Europe","awale":"Awalé","morpion-geant":"Morpion géant","backgammon":"Backgammon","yams":"Yams","memory":"Memory","belote":"Belote","mille-bornes":"Mille Bornes","demineur":"Démineur","2048":"2048","mot-du-jour":"Mot du jour","mots-meles":"Mots mêlés","pong":"Pong","casse-briques":"Casse-briques","blocs":"Duel de blocs","bombes":"Bombes en arène","chars":"Bataille de chars","dessine":"Dessine et devine","bataille-corse":"Bataille corse"};
 const q=s=>document.querySelector(s), es=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const ld=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } }, sv=(k,v)=>{ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} };
 const note=s=>{ if(typeof toast==='function') return toast(s); const t=document.createElement('div'); t.className='hall-toast'; t.textContent=s; document.body.appendChild(t); setTimeout(()=>t.remove(),2800); };
 const H={note,ready:false,ok:null,pseudo:ld('net-name')||'',peers:{},me:{},listeners:[],page:'',title:''};
 let cid=ld('net-cid'); if(!cid){ cid=Math.random().toString(36).slice(2,10); sv('net-cid',cid); } H.cid=cid;
 const key=p=>String(p||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/œ/g,'oe').replace(/æ/g,'ae').replace(/[^a-z0-9]/g,'');
 H.key=key;
 let client=null, ch=null, libP=null, syncedP=null, syncRes=null, at=ld('net-at')||Date.now();
 function lib(){ if(window.supabase) return Promise.resolve(); if(libP) return libP; libP=new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=LIB; s.onload=res; s.onerror=()=>{ libP=null; rej(new Error('lib')); }; document.head.appendChild(s); }); return libP; }
 H.client=async()=>{ await lib(); if(!client) client=window.supabase.createClient(SB_URL,SB_KEY,{realtime:{params:{eventsPerSecond:20}}}); return client; };
 /* ---------- connexion au hall ---------- */
 H.connect=async()=>{ if(ch) return syncedP; syncedP=new Promise(r=>syncRes=r);
   try{ await H.client(); }catch(e){ H.ok=false; paint(); return syncedP; }
   ch=client.channel('salle:hall',{config:{broadcast:{self:false},presence:{key:H.cid}}});
   ch.on('presence',{event:'sync'},onSync);
   ch.on('broadcast',{event:'inv'},({payload:p})=>{ if(p.to===H.cid) invited(p); });
   ch.on('broadcast',{event:'invr'},({payload:p})=>{ if(p.to===H.cid) note(p.ok?`${p.fromP} arrive à ta table`:`${p.fromP} ne peut pas jouer maintenant`); });
   const to=setTimeout(()=>{ if(H.ok==null){ H.ok=false; paint(); syncRes(); } },9000);
   ch.subscribe(async st=>{ if(st==='SUBSCRIBED'){ clearTimeout(to); H.ok=true; await track(); setTimeout(()=>syncRes(),900); paint(); } else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'){ if(H.ok==null){ H.ok=false; paint(); syncRes(); } } });
   return syncedP; };
 function payload(){ return Object.assign({p:H.pseudo,k:key(H.pseudo),at,g:H.page,gt:H.title},H.me); }
 async function track(){ if(!ch) return; try{ await ch.track(payload()); }catch(e){} }
 function onSync(){ const st=ch.presenceState(), peers={}; for(const k in st){ const m=st[k][st[k].length-1]; if(m) peers[k]=m; } H.peers=peers;
   // doublon de pseudo : le plus récent cède la place
   if(H.pseudo){ const mk=key(H.pseudo); for(const k in peers){ if(k===H.cid) continue; const o=peers[k]; if(o.p&&o.k===mk&&(o.at<at||(o.at===at&&k<H.cid))){ const old=H.pseudo; H.pseudo=''; sv('net-name',null); track(); note(`Le pseudo « ${old} » est déjà utilisé par quelqu’un d’autre`); setTimeout(()=>H.askPseudo(),300); break; } } }
   paint(); H.listeners.forEach(f=>{ try{ f(); }catch(e){} }); }
 H.onChange=f=>H.listeners.push(f);
 H.set=o=>{ Object.assign(H.me,o); track(); };
 H.where=(page,title)=>{ H.page=page; H.title=title; track(); };
 H.list=()=>Object.entries(H.peers).filter(([k,m])=>k!==H.cid&&m.p).map(([k,m])=>Object.assign({cid:k},m)).sort((a,b)=>a.p.localeCompare(b.p));
 H.count=()=>Object.keys(H.peers).length;
 H.live=g=>Object.entries(H.peers).map(([k,m])=>m.p&&m.r&&m.r.host&&m.r.open!==false&&m.r.started&&(!g||m.r.g===g)?Object.assign({cid:k,p:m.p},m.r):null).filter(Boolean);
 H.tables=g=>Object.entries(H.peers).map(([k,m])=>m.p&&m.r&&m.r.host&&m.r.open&&!m.r.started&&m.r.n<m.r.max&&(!g||m.r.g===g)?Object.assign({cid:k,p:m.p},m.r):null).filter(Boolean);
 H.free=p=>{ const k=key(p); return !Object.entries(H.peers).some(([c,m])=>c!==H.cid&&m.p&&m.k===k); };
 H.anon=()=>Object.entries(H.peers).filter(([k,m])=>k!==H.cid&&!m.p).length;
 /* ---------- pseudo ---------- */
 H.setPseudo=async p=>{ p=String(p||'').replace(/\s+/g,' ').trim(); if(p.length<2||p.length>16||key(p).length<2) return 'Entre 2 et 16 caractères (lettres ou chiffres).';
   if(/^(ordi|ordinateur|bot|ia|robot)\d*$/i.test(key(p))) return 'Ce pseudo est réservé.';
   await H.connect(); if(!H.ok) return 'Connexion impossible pour le moment.';
   if(!H.free(p)) return `« ${p} » est déjà utilisé par quelqu’un en ligne.`; if(typeof PROF!=='undefined'&&!(await PROF.libre(p))) return 'Ce pseudo appartient au profil de quelqu’un d’autre. Si c’est le tien, récupère-le avec ton code depuis la page Profil.';
   H.pseudo=p; at=Date.now(); sv('net-at',at); sv('net-name',p); await track(); paint(); if(typeof PROF!=='undefined'){ PROF.sync(); try{ H.set({n:PROF.stats().parties,av:PROF.data().avatar}); }catch(e){} } H.listeners.forEach(f=>{ try{ f(); }catch(e){} }); return null; };
 H.ensure=()=>H.pseudo?Promise.resolve(H.pseudo):new Promise(res=>H.askPseudo(res));
 H.askPseudo=(cb)=>{ openBox(`<h2>Ton pseudo</h2><p>Il s’affiche pour les autres joueurs connectés. Deux personnes en ligne ne peuvent pas avoir le même.</p>
   <input class="hall-in" id="hallPseudo" maxlength="16" placeholder="Ex. : Mushu" value="${es(H.pseudo||ld('net-last')||'')}"><p class="hall-err" id="hallErr"></p>
   <div class="hall-acts"><button class="hall-btn" data-hl="close">Annuler</button><button class="hall-btn pri" data-hl="ok">Valider</button></div>`,async e=>{ const b=e.target.closest('[data-hl]'); if(!b) return; if(b.dataset.hl==='close'){ closeBox(); return; }
     const v=q('#hallPseudo').value; b.disabled=true; const err=await H.setPseudo(v); b.disabled=false; if(err){ q('#hallErr').textContent=err; return; } sv('net-last',H.pseudo); closeBox(); if(cb) cb(H.pseudo); });
   const i=q('#hallPseudo'); if(i){ i.focus(); i.onkeydown=e=>{ if(e.key==='Enter') q('[data-hl=ok]').click(); }; } };
 /* ---------- invitations ---------- */
 H.invite=(to,room)=>{ if(!ch) return; ch.send({type:'broadcast',event:'inv',payload:{to,from:H.cid,fromP:H.pseudo,g:room.g,gt:room.gt,code:room.code}}); note(`Invitation envoyée à ${(H.peers[to]||{}).p||'ce joueur'}`); };
 function invited(p){ const id='inv-'+p.code; if(q('#'+id)) return; if(typeof sfx==='function') sfx('ding');
   const d=document.createElement('div'); d.className='hall-invite'; d.id=id;
   d.innerHTML=`<b>${es(p.fromP)}</b> t’invite à jouer à <b>${es(p.gt)}</b><div class="hall-acts"><button class="hall-btn" data-i="no">Pas maintenant</button><button class="hall-btn pri" data-i="ok">Rejoindre</button></div><i class="hall-bar"></i>`;
   document.body.appendChild(d); const t=setTimeout(()=>d.remove(),30000);
   d.onclick=e=>{ const b=e.target.closest('[data-i]'); if(!b) return; clearTimeout(t); d.remove(); const ok=b.dataset.i==='ok';
     if(ch) ch.send({type:'broadcast',event:'invr',payload:{to:p.from,fromP:H.pseudo,ok}}); if(ok) H.goTable(p.g,p.code); }; }
 H.goTable=(g,code)=>{ if(window.NETGAME&&window.NETGAME.id===g&&typeof NET!=='undefined'){ NET.joinCode(code); return; } location.href=g+'.html?salle='+code; };
 H.inviteFlow=to=>{ const P=H.peers[to]; if(!P) return; const r=H.me.r;
   if(r&&r.host&&!r.started){ H.invite(to,r); return; }
   const opts=Object.entries(GAMES).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
   openBox(`<h2>Inviter ${es(P.p)}</h2><p>Choisis le jeu : une table s’ouvre et l’invitation part tout de suite.</p><div class="hall-games">${opts.map(([g,t])=>`<button class="hall-btn" data-g="${g}">${es(t)}</button>`).join('')}</div><div class="hall-acts"><button class="hall-btn" data-hl="close">Annuler</button></div>`,e=>{
     const b=e.target.closest('[data-g],[data-hl]'); if(!b) return; if(b.dataset.hl){ closeBox(); return; } const g=b.dataset.g; sessionStorage.setItem('hall-invite',JSON.stringify({to,g})); closeBox();
     if(window.NETGAME&&window.NETGAME.id===g&&typeof NET!=='undefined') NET.createFor(); else location.href=g+'.html?creer=1'; }); };
 H.pendingInvite=g=>{ try{ const v=JSON.parse(sessionStorage.getItem('hall-invite')||'null'); if(v&&v.g===g){ sessionStorage.removeItem('hall-invite'); return v.to; } }catch(e){} return null; };
 /* ---------- interface ---------- */
 function where(m){ if(m.r&&m.r.started) return `joue à ${es(m.r.gt)}`; if(m.r&&m.r.host) return `ouvre une table de ${es(m.r.gt)}`; if(m.r) return `attend à une table de ${es(m.r.gt)}`; return m.gt?`regarde ${es(m.gt)}`:'sur le portail'; }
 function busy(m){ return m.r&&m.r.started; }
 H.panelHTML=(g)=>{ if(H.ok===false) return `<p class="hall-note">Le salon en ligne n’est pas joignable d’ici.${/github\.io$/.test(location.hostname)?' Vérifie ta connexion.':` Ouvre la salle sur <a href="${SITE}" target="_blank" rel="noopener">le site</a>.`}</p>`;
   if(H.ok==null) return '<p class="hall-note"><span class="hall-spin"></span>Connexion au salon…</p>';
   const tabs=H.tables(g), ppl=H.list();
   return `<div class="hall-me">${H.pseudo?`Ton pseudo : <b>${es(H.pseudo)}</b> <button class="hall-link" data-hl="pseudo">changer</button>`:`<button class="hall-btn pri" data-hl="pseudo">Choisir un pseudo</button> <span class="hall-note">pour apparaître et être invité</span>`}</div>
    <h4>Tables ouvertes${g?'':' (tous les jeux)'}</h4>${tabs.length?`<ul class="hall-list">${tabs.map(t=>`<li><span class="hall-av">${es(t.p[0])}</span><span class="hall-tx"><b>${es(t.gt)}</b><small>table de ${es(t.p)} · ${t.n}/${t.max} joueurs</small></span>${t.cid===H.cid?'<small>ta table</small>':`<button class="hall-btn pri" data-join="${es(t.g)}:${es(t.code)}">Rejoindre</button>`}</li>`).join('')}</ul>`:`<p class="hall-note">Aucune table ouverte${g?' pour ce jeu':''} pour l’instant.</p>`}
    ${H.live(g).length?`<h4>Parties en cours</h4><ul class="hall-list">${H.live(g).map(t=>`<li><span class="hall-av">👀</span><span class="hall-tx"><b>${es(t.gt)}</b><small>table de ${es(t.p)} · ${t.n} joueur${t.n>1?'s':''}</small></span>${t.cid===H.cid?'':`<button class="hall-btn" data-join="${es(t.g)}:${es(t.code)}">Regarder</button>`}</li>`).join('')}</ul>`:''}
    <h4>Joueurs en ligne (${ppl.length})</h4>${H.anon()?`<p class="hall-note">+ ${H.anon()} visiteur${H.anon()>1?'s':''} sans pseudo</p>`:''}${ppl.length?`<ul class="hall-list">${ppl.map(m=>`<li><span class="hall-av">${es(m.p[0])}</span><span class="hall-tx"><b>${m.av?es(m.av)+' ':''}${es(m.p)}</b><small>${where(m)}${m.n>3?` · <a class="hall-link" href="profil.html?p=${encodeURIComponent(m.p)}">voir le profil</a>`:''}</small></span>${H.pseudo&&!busy(m)?`<button class="hall-btn" data-inv="${m.cid}">Inviter</button>`:''}</li>`).join('')}</ul>`:'<p class="hall-note">Personne d’autre pour le moment. Partage le lien du site à tes amis !</p>'}`; };
 H.panelClick=e=>{ const b=e.target.closest('[data-hl],[data-join],[data-inv]'); if(!b) return false;
   if(b.dataset.hl==='pseudo'){ H.askPseudo(); return true; }
   if(b.dataset.join){ const [g,c]=b.dataset.join.split(':'); closeBox(); H.ensure().then(()=>H.goTable(g,c)); return true; }
   if(b.dataset.inv){ H.inviteFlow(b.dataset.inv); return true; } return false; };
 let boxCb=null;
 function openBox(h,cb,locked){ let m=q('#hall-modal'); if(!m){ m=document.createElement('div'); m.id='hall-modal'; m.innerHTML='<div class="hall-box" id="hall-box"></div>'; document.body.appendChild(m); m.addEventListener('click',e=>{ if(e.target===m){ if(!m.dataset.locked) closeBox(); return; } if(boxCb) boxCb(e); }); }
   q('#hall-box').innerHTML=h; boxCb=cb; m.dataset.locked=locked?'1':''; m.hidden=false; }
 function closeBox(){ const m=q('#hall-modal'); if(m) m.hidden=true; boxCb=null; if(H.onBoxClose){ const f=H.onBoxClose; H.onBoxClose=null; f(); } }
 H.openBox=openBox; H.closeBox=closeBox;
 H.openPanel=g=>{ const draw=()=>openBox(`<h2>Le salon</h2>${H.panelHTML(g)}<div class="hall-acts"><button class="hall-btn" data-hl="close">Fermer</button></div>`,e=>{ const b=e.target.closest('[data-hl=close]'); if(b){ closeBox(); return; } H.panelClick(e); });
   draw(); H.redraw=()=>{ const m=q('#hall-modal'); if(m&&!m.hidden&&q('#hall-box h2')&&q('#hall-box h2').textContent==='Le salon') draw(); }; };
 function paint(){ const bar=q('#hall-bar'); if(bar){ const n=H.count();
     bar.innerHTML=H.ok===false?'':`<button class="hall-pill" data-hl="open"><i class="hall-dot ${H.ok?'':'off'}"></i><b>${H.ok?n:'…'}</b> en ligne${H.pseudo?` · <span>${es(H.pseudo)}</span>`:''}</button>${H.ok?`<span class="hall-sub">${H.tables().length?`${H.tables().length} table${H.tables().length>1?'s':''} ouverte${H.tables().length>1?'s':''} · `:''}<button class="hall-link" data-hl="open">Voir qui joue</button>${H.pseudo?'':' · <button class="hall-link" data-hl="pseudo">choisir un pseudo</button>'}</span>`:''}`;
     bar.onclick=e=>{ const b=e.target.closest('[data-hl]'); if(!b) return; if(b.dataset.hl==='open') H.openPanel(''); else H.askPseudo(); }; }
   if(H.redraw) H.redraw(); if(typeof NET!=='undefined'&&NET.hallChanged) NET.hallChanged(); }
 H.paint=paint;
 return H; })();
addEventListener('load',()=>setTimeout(()=>{ if(!window.NETGAME) HALL.where('',''); HALL.connect(); },0));
