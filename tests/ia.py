"""Fait jouer l'ordinateur contre lui-même dans les jeux au tour par tour, jusqu'à la fin de la partie.
Usage : python3 tests/ia.py [URL] [jeu1,jeu2]"""
import asyncio, sys, time
from playwright.async_api import async_playwright
BASE = next((a for a in sys.argv[1:] if a.startswith('http')), 'http://localhost:8765/')
ARGS = [a for a in sys.argv[1:] if not a.startswith('http')]
GAMES = ARGS[0].split(',') if ARGS else ['demineur', '2048', 'mot-du-jour', 'mots-meles', 'awale', 'morpion-geant', 'backgammon', 'yams', 'memory', 'belote', 'mille-bornes']
N = {'belote': 4, 'mille-bornes': 3, 'yams': 3, 'memory': 3, 'demineur': 3, '2048': 2, 'mot-du-jour': 3, 'mots-meles': 3}
async def run(b, g):
    ctx = await b.new_context(viewport={'width': 420, 'height': 860})
    n = N.get(g, 2)
    seats = [{'name': f'Ordi{i}', 'ai': True, 'level': ['facile', 'normal', 'difficile'][i % 3]} for i in range(n)]
    import json
    await ctx.add_init_script(f"localStorage.setItem('tk-fast','1'); localStorage.setItem('tuto-{g}','1'); localStorage.setItem('tk-seats-{g}',{json.dumps(json.dumps(seats))});")
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type in ('error', 'warning') and 'refusé' in m.text else None)
    await pg.goto(BASE + g + '.html'); await pg.wait_for_timeout(700)
    await pg.click('#mbox .acts [data-k="local"]')
    t0 = time.time(); over = None
    while time.time() - t0 < 240:
        await pg.wait_for_timeout(1000)
        over = await pg.evaluate("(()=>{ const G=TK.G(); return G&&G.over?JSON.stringify({w:G.over.winners,t:G.over.title}):null; })()")
        if over: break
    v = await pg.evaluate("TK.G()?TK.G().v:null")
    print(g.ljust(14), 'fin' if over else 'PAS FINIE', round(time.time() - t0), 's', v, 'coups', over or '', errs[:3], flush=True)
    await ctx.close(); return bool(over) and not errs
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        ok = [await run(b, g) for g in GAMES]
        await b.close()
    sys.exit(0 if all(ok) else 1)
asyncio.run(main())
