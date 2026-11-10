"""Pose l’écran de démarrage commun et les guides de jeu dans les pages. À relancer après un changement des couvertures ou des guides.
Usage : python3 outils/habillage.py   (depuis la racine du dépôt)"""
import re, glob, json, hashlib, html, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from couvertures import cover, W
import guides
idx = open('index.html', encoding='utf-8').read()
INFO = {}
for m in re.finditer(r'<a class="tile" href="([^"]+)\.html".*?<h3>(.*?)</h3>.*?<p class="desc">(.*?)</p>', idx, re.S):
    INFO[m.group(1)] = (html.unescape(m.group(2)), html.unescape(m.group(3)))
ALIAS = {'poker': ["Texas Hold'em"], 'tarot': ['Nouvelle partie de tarot']}
vjs = hashlib.sha1(open('common/menu.js', 'rb').read()).hexdigest()[:8]
js = lambda o: json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
tabs_js = lambda tabs: '[' + ','.join('[' + js(t) + ',' + js(h) + ']' for t, h in tabs) + ']'
n = 0
for f in sorted(glob.glob('*.html')):
    k = f[:-5]
    if k not in INFO: continue
    s = open(f, encoding='utf-8').read(); o = s
    s = re.sub(r'<!--MENU-->.*?<!--/MENU-->\n?', '', s, flags=re.S); s = re.sub(r'<!--MENUJS-->.*?<!--/MENUJS-->\n?', '', s, flags=re.S)
    d = {'t': INFO[k][0], 'd': INFO[k][1]}
    if k in ALIAS: d['a'] = ALIAS[k]
    top = f'<!--MENU--><template id="sdj-cover">{cover(k)}</template><script>window.SDJ_JEU={js(d)}</script><!--/MENU-->\n'
    s = re.sub(r'(<body[^>]*>\n?)', lambda m: m.group(1) + top, s, count=1)
    s = s.replace('</body>', f'<!--MENUJS--><script src="common/menu.js?v={vjs}"></script><!--/MENUJS-->\n</body>', 1)
    # guides de jeu
    if k in ('sept-merveilles', 'joyaux-renaissance'):
        tabs = guides.SEPT if k == 'sept-merveilles' else guides.JOYAUX
        s = re.sub(r'/\*GUIDE\*/.*?/\*/GUIDE\*/\n?', '', s, flags=re.S)
        code = ("/*GUIDE*/function guide(){ const back=!!document.querySelector('#modal:not([hidden]) .sdj-head'); helpTabs('Guide de jeu'," + tabs_js(tabs) + "); "
                "if(back){ const fix=()=>{ const b=document.querySelector('#mbox .acts [data-c=\"close\"]'); if(b){ b.dataset.c='new'; b.textContent='Retour au menu'; } }; fix(); const prev=$('#mbox').onclick; $('#mbox').onclick=e=>{ prev(e); fix(); }; } }\nwindow.SDJ_GUIDE=guide;/*/GUIDE*/\n")
        assert '\nfunction help(){ helpTabs(' in s
        s = s.replace('\nfunction help(){ helpTabs(', '\n' + code + 'function help(){ helpTabs(', 1)
        if "case 'guide'" not in s: s = s.replace("    case 'help': GAME.help(); break;", "    case 'guide': guide(); break;\n    case 'help': GAME.help(); break;", 1)
        if 'data-c="guide"' not in s: s = s.replace('<button class="btn" data-c="help">Aide</button>', '<button class="btn" data-c="guide">Guide</button><button class="btn" data-c="help">Aide</button>', 1)
        assert "case 'guide'" in s and 'data-c="guide"' in s
    if k == 'sept-merveilles':
        s = re.sub(r'/\*ASSIST\*/.*?/\*/ASSIST\*/\n?', '', s, flags=re.S)
        code = open(os.path.join(os.path.dirname(__file__), 'assistant_sept.js'), encoding='utf-8').read()
        anchor = '/* ---------- rendu ---------- */'
        assert anchor in s; s = s.replace(anchor, code + anchor, 1)
        def once(a, b, mark):
            global _s
            assert (mark in _s) or (a in _s), a[:50]
            if mark not in _s: _s = _s.replace(a, b, 1)
        _s = s
        once("  $('#tbl').innerHTML=`<div class=\"row3\">", "  ADV=canSee&&ASSIST?advise(G,m):null;\n  $('#tbl').innerHTML=`<div class=\"row3\">", 'ADV=canSee&&ASSIST')
        once('<h3>${hd}</h3><div class="hand">', '<h3>${hd}</h3>${canSee?coachHTML(m):\'\'}<div class="hand">', 'coachHTML(m):')
        once("cls:(SEL===c.id?'sel ':'')+'in'", "cls:(SEL===c.id?'sel ':'')+(ADV&&ADV.id===c.id?'reco ':'')+'in'", "'reco '")
        once("  const a=t.dataset.a; let ok=false;", "  const a=t.dataset.a; let ok=false;\n  if(a==='coach'){ if(ADV&&!G.choices[m]){ SEL=ADV.id; FLEETO=false; EDIFO=false; sfx('click'); render(); } return; }", "a==='coach'")
        once("    case 'guide': guide(); break;", "    case 'assist': ASSIST=!ASSIST; store('sm-assist',ASSIST); updAssist(); if(G) render(); break;\n    case 'guide': guide(); break;", "case 'assist'")
        once('<button class="btn" data-c="guide">Guide</button>', '<button class="btn" id="asBtn" data-c="assist">Assistance : oui</button><button class="btn" data-c="guide">Guide</button>', 'id="asBtn"')
        once("   ${rulesHTML()}\n   <div class=\"acts\">${G&&G.phase", "   <h4>Assistance</h4><div class=\"seg\"><button class=\"${ASSIST?'on':''}\" data-m=\"assist:1\">Activée</button><button class=\"${ASSIST?'':'on'}\" data-m=\"assist:0\">Désactivée</button></div><p class=\"net-note\">Une bulle conseille la carte à jouer et explique pourquoi.</p>\n   ${rulesHTML()}\n   <div class=\"acts\">${G&&G.phase", 'data-m="assist:1"')
        once("if(k==='h') M.seats[+v].h=+w;", "if(k==='assist'){ ASSIST=v==='1'; store('sm-assist',ASSIST); updAssist(); draw(); return; } if(k==='h') M.seats[+v].h=+w;", "k==='assist'")
        s = _s
    if k == 'duel-des-ages':
        s = re.sub(r'/\*GUIDE\*/.*?/\*/GUIDE\*/\n?', '', s, flags=re.S)
        body = '{' + ','.join(js(a) + ':' + js(h) for a, t, h in guides.AGES) + '}'
        code = ("/*GUIDE*/const GUIDE_TABS=" + js([[a, t] for a, t, h in guides.AGES]) + ",GUIDE_BODY=" + body + ";\n"
                "function showGuide(tab='debut'){ openModal(`<h3>Guide de jeu</h3><div class=\"tabs\">${GUIDE_TABS.map(([k,l])=>`<button class=\"tab ${k===tab?'on':''}\" data-a=\"guide\" data-v=\"${k}\">${l}</button>`).join('')}</div><div class=\"rules\">${GUIDE_BODY[tab]||''}</div><button class=\"ghost\" data-a=\"close\">Compris</button>`,{wide:true}); }\n"
                "if(typeof window!=='undefined') window.SDJ_GUIDE=()=>showGuide();/*/GUIDE*/\n")
        s = s.replace("function showHelp(tab='bases'){", code + "function showHelp(tab='bases'){", 1)
        if "case 'guide'" not in s: s = s.replace("    case 'rules':showHelp('bases');break;", "    case 'guide':showGuide(v||'debut');break;\n    case 'rules':showHelp('bases');break;", 1)
        if 'data-a="guide">Guide</button>' not in s: s = s.replace('<button class="hbtn" data-a="rules">Aide</button>', '<button class="hbtn" data-a="guide">Guide</button><button class="hbtn" data-a="rules">Aide</button>', 1)
        assert "case 'guide'" in s and 'data-a="guide">Guide' in s and 'GUIDE_TABS' in s
    if s != o: open(f, 'w', encoding='utf-8').write(s); n += 1
print(n, 'pages habillées, menu.js', vjs)
