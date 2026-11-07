"""Vérifie que l'appli s'installe (manifeste, service worker) et que les jeux s'ouvrent sans réseau.
Usage : python3 tests/offline.py [URL du site]"""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        ctx = await b.new_context(); pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(BASE + 'index.html'); await pg.wait_for_timeout(2500)
        await pg.evaluate("navigator.serviceWorker.ready")
        for _ in range(40):
            n = await pg.evaluate("caches.keys().then(async k=>{ if(!k.length) return 0; const c=await caches.open(k[k.length-1]); return (await c.keys()).length; })")
            if n >= 45: break
            await pg.wait_for_timeout(500)
        print('fichiers en cache :', n)
        man = await pg.evaluate("fetch('manifest.webmanifest').then(r=>r.json()).then(m=>m.name+' / '+m.display+' / '+m.icons.length+' icônes')")
        print('manifeste :', man)
        await ctx.set_offline(True)
        ok = 0
        for name in ['index.html', 'echecs.html', 'serpents.html', 'sudoku.html', 'profil.html', 'rails-d-europe.html']:
            try:
                await pg.goto(BASE + name); await pg.wait_for_timeout(600)
                t = await pg.title(); ok += 1; print('hors ligne OK ', name, '|', t)
            except Exception as e:
                print('hors ligne ERR', name, str(e)[:80])
        print('erreurs de page :', errs[:3])
        await b.close(); sys.exit(0 if ok == 6 and n >= 40 else 1)
asyncio.run(main())
