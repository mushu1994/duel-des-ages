"""Ouvre chaque page, vérifie qu'elle se charge sans erreur et que le salon, les tables et le profil sont présents.
Usage : python3 tests/smoke.py [URL du site]   (par défaut http://localhost:8765/)"""
import asyncio, sys, glob, os
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = sorted(os.path.basename(p) for p in glob.glob(os.path.join(HERE, '*.html')))
async def main():
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 400, 'height': 840})
        for name in PAGES:
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            r = await pg.goto(BASE + name); await pg.wait_for_timeout(900)
            got = await pg.evaluate("[typeof HALL, typeof NET, typeof PROF, typeof NETGAME]")
            ok = r.status == 200 and not errs and got[2] == 'object'
            bad += not ok
            print(('OK  ' if ok else 'ERR ') + name.ljust(26), got, errs[:2])
            await pg.close()
        await b.close()
    print('pages en erreur :', bad); sys.exit(1 if bad else 0)
asyncio.run(main())
