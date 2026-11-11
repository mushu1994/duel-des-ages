"""Test du jeu en ligne à trois navigateurs : un hôte et deux invités.
Pour chaque jeu : création de la table, lancement, échanges, puis l'hôte ferme sa page et un invité
doit reprendre la partie automatiquement (le troisième continue de recevoir la partie).

Usage : python3 tests/online.py [URL du site] [jeu1,jeu2,…]
Les pseudos de test (EssaiHote, EssaiInvite, EssaiTiers) ont des codes fixes : leurs profils servent aux tests."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1].startswith('http') else 'http://localhost:8765/'
ARGS = [a for a in sys.argv[1:] if not a.startswith('http')]
ALL = ['serpents', 'souriciere', 'piaf', 'quatre-en-ligne', 'echecs', 'dames', 'reversi', 'bataille', 'bataille-navale',
       'code-secret', 'dominos', 'petits-chevaux', 'president', 'tarot', 'poker', 'rami', 'petit-bac', 'plus-bas',
       'tetes-de-boeuf', 'duel-des-ages', 'duel-des-joyaux', 'grand-proprietaire', 'nouvelle-terre', 'rails-d-europe',
       'remparts', 'conquete', 'joyaux-renaissance', 'sept-merveilles', 'derniere-carte', 'quitte-ou-sept', 'approche-finale',
       'awale', 'morpion-geant', 'backgammon', 'yams', 'memory', 'belote', 'mille-bornes', 'demineur', '2048', 'mot-du-jour', 'mots-meles',
       'pong', 'casse-briques', 'blocs', 'bombes', 'dessine', 'bataille-corse', 'chars']
GAMES = ARGS[0].split(',') if ARGS else ALL
WHO = [('EssaiHote', 'essaihote0secret0fixe0pour0tests'), ('EssaiInvite', 'essaiinvite0secret0fixe0tests0'), ('EssaiTiers', 'essaitiers0secret0fixe0tests00')]
SIG = "(()=>{ const G=NETGAME.state(); if(!G) return null; try{ return JSON.stringify(G).length+':'+JSON.stringify(G).slice(-400); }catch(e){ return 'x'; } })()"

async def browser_ctx(b, i):
    ctx = await b.new_context(viewport={'width': 420, 'height': 860})
    name, secret = WHO[i]
    await ctx.add_init_script(f"try{{ localStorage.setItem('prof-secret',JSON.stringify('{secret}')); localStorage.setItem('net-open','false'); "
                              f"['serpents','souriciere','piaf','pong','casse-briques','blocs','bombes','dessine','chars'].forEach(s=>localStorage.setItem('tuto-'+s,'1')); }}catch(e){{}}")
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    return ctx, pg, errs

async def run(b, g):
    res = {'jeu': g}
    P = [await browser_ctx(b, i) for i in range(3)]
    try:
        for _, pg, _ in P:
            await pg.goto(BASE + g + '.html')
        await P[0][1].wait_for_timeout(1800)
        for i, (_, pg, _) in enumerate(P):
            r = await pg.evaluate(f"HALL.setPseudo('{WHO[i][0]}')")
            if r: res['pseudo'] = r; return res
        await P[0][1].evaluate("(typeof closeModal==='function')&&closeModal(true); NET.createFor()")
        await P[0][1].wait_for_timeout(2600)
        code = await P[0][1].evaluate('NET.code')
        mx = await P[0][1].evaluate('NETGAME.max')
        players = P[1:] if mx >= 3 else P[1:2]
        for _, pg, _ in players:
            await pg.evaluate(f"(typeof closeModal==='function')&&closeModal(true); NET.joinCode('{code}')")
        for _ in range(30):
            await P[0][1].wait_for_timeout(400)
            if await P[0][1].evaluate("Object.keys(NET.peers).length") >= 1 + len(players): break
        await P[0][1].wait_for_timeout(600)
        mn = await P[0][1].evaluate('NETGAME.min')
        if mn > 1 + len(players):  # compléter avec l'ordinateur
            await P[0][1].click(f'#hall-box [data-net="ai:{mn - 1 - len(players)}"]'); await P[0][1].wait_for_timeout(400)
        await P[0][1].click('#hall-box [data-net="go"]')
        await P[0][1].wait_for_timeout(2500)
        if mx < 3:  # jeu à deux : le troisième arrive pendant la partie et regarde
            await P[2][1].evaluate(f"(typeof closeModal==='function')&&closeModal(true); NET.joinCode('{code}')")
        await P[0][1].wait_for_timeout(3500)
        seats = [await pg.evaluate('NET.seat') for _, pg, _ in P]
        res['places'] = seats
        # bouton de réaction : dans l'en-tête, jamais par-dessus le jeu
        rb = await P[1][1].evaluate("(()=>{ const b=document.getElementById('netReact'); if(!b) return 'absent'; const r=b.getBoundingClientRect(); b.click(); const k=document.getElementById('netRpick'); const vis=k&&!k.hidden; if(vis) k.querySelector('[data-e]').click(); return (r.top<innerHeight*.4?'haut':'bas')+(vis?'':' sans-choix'); })()")
        if rb != 'haut': res['reaction'] = rb
        s1 = await P[2][1].evaluate(SIG)
        res['invites_recoivent'] = bool(await P[1][1].evaluate(SIG)) and bool(s1)
        if g in ('serpents', 'souriciere', 'piaf'):
            w = await P[0][1].evaluate("JSON.stringify(NETGAME.wire?NETGAME.wire(NETGAME.state()):NETGAME.state()).length")
            res['taille_message'] = w
        # l'hôte s'en va : sa page se ferme
        await P[0][0].close()
        t0 = time.time(); newhost = None
        for _ in range(90):
            await P[1][1].wait_for_timeout(500)
            h = [await pg.evaluate('NET.host') for _, pg, _ in P[1:]]
            if any(h): newhost = h.index(True) + 1; break
        res['reprise_s'] = round(time.time() - t0, 1) if newhost else None
        res['nouvel_hote'] = WHO[newhost][0] if newhost else None
        if newhost:
            other = P[3 - newhost][1]; hp = P[newhost][1]
            await hp.wait_for_timeout(600)
            rb = await hp.query_selector('#hall-box [data-net="again"]')
            if rb:  # jeu sans reprise exacte : le nouvel hôte relance la partie
                res['relance'] = True; await rb.click(); await hp.wait_for_timeout(2500)
            before = await other.evaluate(SIG)
            # pour vérifier que la partie avance, l'ordinateur joue toutes les places sur le nouvel hôte
            await hp.evaluate("(()=>{ const G=NETGAME.state(); const L=G.players||G.P||[]; L.forEach(P=>{ if(P.cid){ P.ai=true; P.level=P.level||'normal'; } }); try{ NETGAME.resume&&NETGAME.resume(); }catch(e){} NET.push(null,'full'); })()")
            await hp.wait_for_timeout(1500)
            before = await other.evaluate(SIG)  # référence prise après le passage à l'ordinateur
            moved = False
            for _ in range(25):
                await hp.wait_for_timeout(600)
                if g == 'piaf':
                    await other.mouse.click(200, 420)
                if await other.evaluate(SIG) != before: moved = True; break
            res['la_partie_continue'] = moved
        res['erreurs'] = [e for _, _, errs in P for e in errs][:3]
    except Exception as e:
        res['exception'] = str(e)[:200]
    finally:
        for ctx, pg, _ in P:
            try:
                await pg.evaluate('NET.leave(true)')
            except Exception:
                pass
            try:
                await ctx.close()
            except Exception:
                pass
    return res

async def main():
    out = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        for g in GAMES:
            r = await run(b, g); out.append(r); print(json.dumps(r, ensure_ascii=False), flush=True)
        await b.close()
    bad = [r['jeu'] for r in out if not r.get('invites_recoivent') or not r.get('nouvel_hote') or not r.get('la_partie_continue') or r.get('erreurs') or r.get('exception') or r.get('reaction')]
    print('\nÀ revoir :', ', '.join(bad) if bad else 'aucun')
    sys.exit(1 if bad else 0)

asyncio.run(main())
