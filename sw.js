/* Service worker de la Salle de jeux : le site reste rapide et jouable hors ligne. Version 756ea094c8 */
const V='sdj-756ea094c8', CORE=["./", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "common/hall.js?v=13d5e0cb", "common/net.js?v=02e3ddc5", "common/profil.js?v=54ab8b12", "common/salle.css?v=282c861b", "index.html", "profil.html"], PAGES=["approche-finale.html", "bataille-navale.html", "bataille.html", "code-secret.html", "conquete.html", "dames.html", "derniere-carte.html", "dominos.html", "duel-des-ages.html", "duel-des-joyaux.html", "echecs.html", "grand-proprietaire.html", "index.html", "joyaux-renaissance.html", "mots-croises.html", "nouvelle-terre.html", "petit-bac.html", "petits-chevaux.html", "piaf.html", "plus-bas.html", "poker.html", "president.html", "profil.html", "quatre-en-ligne.html", "quitte-ou-sept.html", "rails-d-europe.html", "rami.html", "remparts.html", "reversi.html", "sept-merveilles.html", "serpents.html", "solitaire.html", "souriciere.html", "sudoku.html", "tarot.html", "tetes-de-boeuf.html"];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ for(const k of await caches.keys()) if(k!==V&&k.startsWith('sdj-')) await caches.delete(k);
  await self.clients.claim();
  /* les autres jeux se téléchargent ensuite, tranquillement, pour être jouables hors ligne */
  const c=await caches.open(V); for(const p of PAGES){ try{ if(!(await c.match(p))){ const r=await fetch(p,{cache:'no-cache'}); if(r.ok) await c.put(p,r); } }catch(x){} } })()); });
const html=req=>req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');
async function netFirst(req){ const c=await caches.open(V); const key=new URL(req.url); key.search='';
  try{ const r=await Promise.race([fetch(req),new Promise((_,j)=>setTimeout(()=>j(new Error('lent')),3500))]); if(r&&r.ok){ c.put(key.href,r.clone()); } return r; }
  catch(e){ return (await c.match(key.href))||(await c.match('index.html'))||Response.error(); } }
async function cacheFirst(req){ const c=await caches.open(V); const hit=await c.match(req); if(hit) return hit; const r=await fetch(req); if(r&&(r.ok||r.type==='opaque')) c.put(req,r.clone()); return r; }
async function swr(req){ const c=await caches.open(V); const hit=await c.match(req); const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')) c.put(req,r.clone()); return r; }).catch(()=>hit); return hit||net; }
self.addEventListener('fetch',e=>{ const req=e.request; if(req.method!=='GET') return; const u=new URL(req.url);
  if(u.origin===location.origin){ if(html(req)) { e.respondWith(netFirst(req)); return; } if(u.searchParams.has('v')||u.pathname.includes('/icons/')){ e.respondWith(cacheFirst(req)); return; } e.respondWith(swr(req)); return; }
  if(u.hostname==='cdn.jsdelivr.net'){ e.respondWith(cacheFirst(req)); return; }
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){ e.respondWith(swr(req)); return; } });
