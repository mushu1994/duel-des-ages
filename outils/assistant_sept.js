/*ASSIST*/
/* ---------- assistance : conseille la carte à jouer et explique pourquoi (même évaluation que l'ordinateur, sans hasard) ---------- */
let ASSIST=load('sm-assist')!==false, ADV=null;
function updAssist(){ const b=$('#asBtn'); if(b){ b.textContent=ASSIST?'Assistance : oui':'Assistance : non'; b.setAttribute('aria-pressed',ASSIST); } }
function cardReasons(G,p,c,o){ const P=G.players[p], out=[], age=G.age, lN=esc(G.players[L(G,p)].name), rN=esc(G.players[R(G,p)].name); let sci=false;
  effs(c.eff).forEach(e=>{ const [k,a]=e.split(':');
    if(k==='p'){ const have=prodUnits(P,false).join(''), rs=[...a.replace('/','')], miss=rs.filter(r=>!have.includes(r));
      out.push(miss.length?`Elle produit ${miss.map(r=>RES[r].toLowerCase()).join(a.includes('/')?' ou ':' et ')}, que tu ne produis pas encore.`:'Elle double une ressource que tu produis déjà.');
      if(age===3) out.push('À l’âge III, les ressources servent peu.'); }
    if(k==='m'){ const my=shields(P), l=shields(G.players[L(G,p)]), r=shields(G.players[R(G,p)]), w={1:1,2:3,3:5}[age], beat=[]; if(my<=l&&my+ +a>l) beat.push(lN); if(my<=r&&my+ +a>r) beat.push(rN);
      out.push(beat.length?`Avec ${a} bouclier${+a>1?'s':''} de plus, tu passes devant ${beat.join(' et ')} : ${w} point${w>1?'s':''} par conflit gagné à la fin de l’âge.`:(my>l&&my>r?'Tu es déjà devant tes deux voisins : ces boucliers ne changent rien pour l’instant.':'Ces boucliers ne suffisent pas encore à dépasser tes voisins.')); }
    if(k==='s'){ sci=true; const s=sciCounts(P), b=sciScore(s), s2=Object.assign({},s); if(a==='*'||a==='*1') s2.w++; else s2[a]++; const n=sciScore(s2); out.push(`Ta science passe de ${b} à ${n} point${n>1?'s':''}.`); }
    if(k==='tr') out.push('Les matières premières achetées à ton voisin ne coûtent plus que 1 pièce.');
    if(k==='tg') out.push('Les produits manufacturés achetés à tes voisins ne coûtent plus que 1 pièce.');
    if(k==='ar'||k==='ag') out.push('Elle fournit à chaque tour une ressource au choix.');
    if(k==='c') out.push(`Elle rapporte ${a} pièces tout de suite.`);
    if(k==='cp'||k==='cv') out.push('Elle rapporte des pièces selon les cartes déjà construites.');
    if(k==='dip') out.push('Elle t’évite le prochain conflit.');
    if(k==='debt') out.push('Elle fait perdre des pièces à tes adversaires.'); });
  if(!sci){ const before=scoreOf(G,p).total; P.built.push(c); let d=0; try{ d=scoreOf(G,p).total-before; }finally{ P.built.pop(); } if(d>0) out.push(`Elle vaut ${d} point${d>1?'s':''} au décompte actuel.`); }
  const next=[...new Set(CARDS_SRC.filter(x=>x[6]&&x[1]>c.age&&x[6].split('|').includes(c.name)).map(x=>x[0]))]; if(next.length) out.push(`Elle rendra gratuit${next.length>1?'s':''} : ${next.map(esc).join(', ')}.`);
  if(o){ if(o.chain) out.push('Gratuite grâce à une chaîne.'); else if(o.ok&&o.plan.coins) out.push(`Elle te coûte ${o.plan.coins} pièce${o.plan.coins>1?'s':''} de commerce.`); }
  return out; }
function advise(G,p){ const P=G.players[p]; if(!P||P.ai||BUSY||G.choices[p]) return null;
  if(G.phase==='ldraft'){ const h=G.hands[p]||[]; if(!h.length) return null; const l=h.slice().sort((a,b)=>leaderVal(G,p,b)-leaderVal(G,p,a))[0];
    return {id:l.id,txt:`garde <b>${esc(l.name)}</b>`,why:[`Son pouvoir : ${effTxt(l.eff)}.`,'C’est le meneur le plus rentable de cette main.']}; }
  if(G.phase==='recruit'){ const ok=(P.lhand||[]).filter(l=>l.cost<=P.coins).sort((a,b)=>leaderVal(G,p,b)-leaderVal(G,p,a));
    if(ok.length&&leaderVal(G,p,ok[0])>ok[0].cost/3) return {id:ok[0].id,txt:`recrute <b>${esc(ok[0].name)}</b>`,why:[`Son pouvoir : ${effTxt(ok[0].eff)}.`,`Il coûte ${ok[0].cost} pièces, il t’en restera ${P.coins-ok[0].cost}.`]};
    const l=(P.lhand||[])[0]; return l?{id:l.id,txt:`renvoie <b>${esc(l.name)}</b>`,why:['Aucun meneur ne vaut son prix pour l’instant : 3 pièces te seront plus utiles.']}:null; }
  if(G.phase!=='play'&&G.phase!=='last') return null; if(G.phase==='last'&&!(G.lastWho||[]).includes(p)) return null;
  const hand=G.hands[p]||[]; if(!hand.length) return null; const base=scoreOf(G,p).total, so=stageOptions(G,p); let best=null;
  for(const c of hand){ const o=buildOptions(G,p,c);
    if(o&&(o.ok||o.free)){ const free=!o.ok&&o.free; const v=cardVal(G,p,c,base)-(free?0:o.plan.coins/3)-(free?2:0); if(!best||v>best.v) best={v,id:c.id,act:free?'free':'build',c,o}; }
    if(so&&so.ok){ const st=stagesOf(P)[P.stages]; const v=stageVal(G,p,st[1])-so.plan.coins/3-cardVal(G,p,c,base)*.25; if(!best||v>best.v) best={v,id:c.id,act:'wonder',c}; }
    const dv=1+(P.coins<3?1:0)-cardVal(G,p,c,base)*.15; if(!best||dv>best.v) best={v:dv,id:c.id,act:'discard',c}; }
  const n=`<b>${esc(best.c.name)}</b>`;
  if(best.act==='wonder'){ const st=stagesOf(P)[P.stages]; best.txt=`glisse ${n} sous ta merveille`; best.why=[`L’étape ${P.stages+1} de ta merveille donne : ${effTxt(st[1])}.`,'Aucune carte de ta main ne t’apporte autant en la construisant.'].concat(so.plan.coins?[`Elle te coûte ${so.plan.coins} pièce${so.plan.coins>1?'s':''} de commerce.`]:[]); }
  else if(best.act==='discard'){ best.txt=`défausse ${n}`; best.why=['Rien d’utile à construire ce tour-ci : 3 pièces te serviront pour commercer.']; }
  else { best.txt=(best.act==='free'?'construis gratuitement ':'construis ')+n; best.why=cardReasons(G,p,best.c,best.o).slice(0,4); if(best.act==='free') best.why.push('Tu utilises le pouvoir de ta merveille : une carte gratuite par âge.'); }
  return best; }
function coachHTML(m){ if(!ASSIST||!ADV) return ''; const hand=G.phase==='recruit'?G.players[m].lhand:(G.hands[m]||[]); let other='';
  if(SEL&&SEL!==ADV.id&&(G.phase==='play'||G.phase==='last')){ const c=hand.find(x=>x.id===SEL); if(c){ const o=buildOptions(G,m,c); const rs=o&&!o.ok&&!o.free?[o.why==='Déjà construit'?'Tu l’as déjà construite.':'Tu n’as pas les ressources pour la construire : merveille ou défausse seulement.']:cardReasons(G,m,c,o);
      other=`<div class="coach-sel"><b>${esc(c.name)}</b> : ${rs.length?rs.join(' '):'peu d’intérêt pour toi en ce moment.'}</div>`; } }
  return `<div class="coach" role="status"><svg class="coach-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.700V17h8v-2.300A7 7 0 0 0 12 2z" fill="#ffc93c"/><path d="M9 19h6v1.500a1.500 1.500 0 0 1-1.500 1.500h-3A1.500 1.500 0 0 1 9 20.500z" fill="#1a1740"/></svg><div class="coach-tx"><div><b>Conseil :</b> ${ADV.txt}.</div><ul>${ADV.why.map(w=>`<li>${w}</li>`).join('')}</ul>${other}</div>${SEL===ADV.id?'':'<button type="button" data-a="coach">Choisir</button>'}</div>`; }
addEventListener('DOMContentLoaded',updAssist);
/*/ASSIST*/
