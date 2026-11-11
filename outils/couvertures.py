"""Couvertures des boîtes de jeux : 52 illustrations à fond perdu (240×180), même trait pour toutes.
Formes pleines, couleurs franches, ombres portées nettes, aucun émoji ni police système."""
import math
INK = '#1a1740'
FONT = "font-family=\"'Bricolage Grotesque',Arial,sans-serif\" font-weight=\"800\""
SH = 'rgba(10,8,40,.28)'

def n(v):
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return s if s not in ('-0', '') else '0'
def R(x, y, w, h, r=0, f='#fff', extra=''):
    return f'<rect x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}"' + (f' rx="{n(r)}"' if r else '') + f' fill="{f}"{extra}/>'
def C(x, y, r, f, extra=''):
    return f'<circle cx="{n(x)}" cy="{n(y)}" r="{n(r)}" fill="{f}"{extra}/>'
def E(x, y, rx, ry, f, extra=''):
    return f'<ellipse cx="{n(x)}" cy="{n(y)}" rx="{n(rx)}" ry="{n(ry)}" fill="{f}"{extra}/>'
def P(d, f, extra=''):
    return f'<path d="{d}" fill="{f}"{extra}/>'
def L(d, s, w=4, extra=''):
    return f'<path d="{d}" fill="none" stroke="{s}" stroke-width="{n(w)}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'
def G(inner, tf='', extra=''):
    return f'<g' + (f' transform="{tf}"' if tf else '') + f'{extra}>{inner}</g>'
def T(x, y, size, s, f=INK, anchor='middle', extra=''):
    return f'<text x="{n(x)}" y="{n(y)}" font-size="{n(size)}" text-anchor="{anchor}" fill="{f}" {FONT}{extra}>{s}</text>'
def at(x, y, rot=0, sc=1):
    t = f'translate({n(x)} {n(y)})'
    if rot: t += f' rotate({n(rot)})'
    if sc != 1: t += f' scale({n(sc)})'
    return t

SUITS = {
 'h': '<path d="M0-4C-2-9-10-8-10-2C-10 3-4 6 0 10C4 6 10 3 10-2C10-8 2-9 0-4Z"/>',
 's': '<path d="M0-10C-4-6-10-3-10 2C-10 7-3 8-1 4C-1 7-2 9-4 10H4C2 9 1 7 1 4C3 8 10 7 10 2C10-3 4-6 0-10Z"/>',
 'd': '<path d="M0-10L7.500 0L0 10L-7.500 0Z"/>',
 'c': '<circle cy="-5" r="4.700"/><circle cx="-5.200" cy="2" r="4.700"/><circle cx="5.200" cy="2" r="4.700"/><path d="M-1 2C-1 7-2 9-4 10H4C2 9 1 7 1 2Z"/>',
}
RED, BLK = '#e5383b', '#1a1740'
def suit(k, x, y, s, f=None):
    f = f or (RED if k in 'hd' else BLK)
    return f'<g transform="{at(x, y, 0, s / 20)}" fill="{f}">{SUITS[k]}</g>'
def card(x, y, rot=0, w=52, h=72, f='#fff', inner='', r=7, sh=True):
    """carte centrée en (x,y) ; inner est dessiné dans le repère de la carte (centre 0,0)"""
    o = ''
    if sh: o += G(R(-w / 2, -h / 2, w, h, r, SH), at(x + 3, y + 6, rot))
    return o + G(R(-w / 2, -h / 2, w, h, r, f) + inner, at(x, y, rot))
def face(rank, k, w=52, h=72):
    col = RED if k in 'hd' else BLK
    return T(-w / 2 + 11, -h / 2 + 20, 17, rank, col) + suit(k, 0, 9, 26)
def back(c1, c2, w=52, h=72):
    return R(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 4, c2) + P('M0-14L10 0L0 14L-10 0Z', c1)
PIPS = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (1, -1), (-1, 1), (1, 1)],
        5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)], 6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}
def die(x, y, s, rot=0, k=5, f='#fff', pip=INK, sh=True):
    o = G(R(-s / 2, -s / 2, s, s, s * .22, SH), at(x + 3, y + 5, rot)) if sh else ''
    pp = ''.join(C(a * s * .27, b * s * .27, s * .095, pip) for a, b in PIPS[k])
    return o + G(R(-s / 2, -s / 2, s, s, s * .22, f) + pp, at(x, y, rot))
def pawn(x, y, s, f, sh=True):
    o = E(x + 2, y + s * .5, s * .46, s * .12, SH) if sh else ''
    return o + P(f'M{n(x - s * .42)} {n(y + s * .5)}Q{n(x - s * .4)} {n(y - s * .12)} {n(x)} {n(y - s * .16)}Q{n(x + s * .4)} {n(y - s * .12)} {n(x + s * .42)} {n(y + s * .5)}Z', f) + C(x, y - s * .38, s * .27, f) + C(x - s * .09, y - s * .46, s * .07, 'rgba(255,255,255,.45)')
def disc(x, y, r, f, rim=None, sh=True):
    o = C(x + 2, y + 4, r, SH) if sh else ''
    return o + C(x, y, r, f) + (C(x, y, r * .68, rim) if rim else '') + C(x - r * .32, y - r * .36, r * .16, 'rgba(255,255,255,.4)')
def burst(c, cx=120, cy=95, k=14, r=260):
    d = ''
    for i in range(k):
        a, b = 2 * math.pi * i / k, 2 * math.pi * (i + .5) / k
        d += f'M{cx} {cy}L{n(cx + r * math.cos(a))} {n(cy + r * math.sin(a))}L{n(cx + r * math.cos(b))} {n(cy + r * math.sin(b))}Z'
    return P(d, c)
def bg(c, deco=''):
    return R(0, 0, 240, 180, 0, c) + deco
def hexa(x, y, r, f, extra=''):
    pts = ' '.join(f'{n(x + r * math.cos(math.pi / 3 * i + math.pi / 6))},{n(y + r * math.sin(math.pi / 3 * i + math.pi / 6))}' for i in range(6))
    return f'<polygon points="{pts}" fill="{f}"{extra}/>'
def star(x, y, r, f, k=5, inner=.45, rot=-90):
    pts = []
    for i in range(k * 2):
        rr = r if i % 2 == 0 else r * inner; a = math.radians(rot) + math.pi * i / k
        pts.append(f'{n(x + rr * math.cos(a))},{n(y + rr * math.sin(a))}')
    return f'<polygon points="{" ".join(pts)}" fill="{f}"/>'
def house(x, y, s, f, roof):
    return P(f'M{n(x - s / 2)} {n(y + s / 2)}V{n(y - s * .1)}L{n(x)} {n(y - s * .6)}L{n(x + s / 2)} {n(y - s * .1)}V{n(y + s / 2)}Z', f) + P(f'M{n(x - s * .62)} {n(y - s * .02)}L{n(x)} {n(y - s * .68)}L{n(x + s * .62)} {n(y - s * .02)}L{n(x + s * .5)} {n(y + s * .08)}L{n(x)} {n(y - s * .42)}L{n(x - s * .5)} {n(y + s * .08)}Z', roof)
def meeple(x, y, s, f):
    return G(P('M0-10C3-10 4.500-8 4.500-6C4.500-4.800 4-4 3.200-3.300C7-2.500 10-.500 10 1.500C10 3 8 3.500 6 3L4.500 2.600L7 10H1.500L0 6.500L-1.500 10H-7L-4.500 2.600L-6 3C-8 3.500-10 3-10 1.500C-10-.500-7-2.500-3.200-3.300C-4-4-4.500-4.800-4.500-6C-4.500-8-3-10 0-10Z', f), at(x, y, 0, s / 20))

W = {}

# ------------------------------------------------------------------ jeux de cartes
def _ages():
    cols = [['#f6e7b4', '#f6e7b4'], ['#b4783c', '#b4783c', '#b4783c'], ['#4f8ef7', '#e5484d', '#3fb56b', '#ffc93c']]
    o = bg('#2743b8', burst('#2f4fd0', 120, 70) + P('M0 150Q120 118 240 150V180H0Z', '#1c2f86'))
    for r, row in enumerate(cols):
        for i, c in enumerate(row):
            x = 120 + (i - (len(row) - 1) / 2) * 40; y = 44 + r * 34
            o += card(x, y, 0, 34, 46, c, R(-11, -17, 22, 9, 2, 'rgba(0,0,0,.18)'), 5)
    return o + P('M92 164L120 148L148 164', 'none', ' stroke="#ffc93c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"')
W['duel-des-ages'] = _ages
def _joyaux():
    o = bg('#a11458', C(120, 90, 110, '#b81f69'))
    o += R(53, 21, 140, 146, 16, SH) + R(50, 16, 140, 146, 16, '#3a0b25') + R(56, 22, 128, 134, 11, '#ffc93c') + R(60, 26, 120, 126, 8, '#4d1030')
    cols = ['#e5484d', '#4f8ef7', '#3fb56b', '#f4f1ff', '#ffc93c', '#22203a', '#4f8ef7', '#3fb56b', '#e5484d']
    for i, c in enumerate(cols):
        o += disc(84 + (i % 3) * 36, 53 + (i // 3) * 36, 13, c, None, True)
    return o
W['duel-des-joyaux'] = _joyaux
def _plusbas():
    o = bg('#0c8ea0', P('M0 180V128L50 92L88 124L132 78L186 128L240 96V180Z', '#0a7788'))
    data = [(-12, '#7b5cf0', '-2'), (-4, '#38bdf8', '0'), (4, '#3fb56b', '3'), (12, '#ff7a45', '12')]
    for i, (rot, c, t) in enumerate(data):
        o += card(48 + i * 48, 86 + abs(i - 1.5) * 6, rot, 46, 66, c, R(-18, -28, 36, 56, 4, 'rgba(255,255,255,.18)') + T(0, 9, 26, t, '#fff'))
    return o
W['plus-bas'] = _plusbas
def _boeuf():
    o = bg('#f0641e', burst('#f57a33'))
    o += card(62, 96, -14, 50, 70, '#fff', T(0, 8, 24, '23', '#7b5cf0')) + card(180, 96, 14, 50, 70, '#fff', T(0, 8, 24, '66', '#e5383b'))
    o += P('M78 60C58 58 46 42 50 22C60 40 72 46 88 48ZM162 60C182 58 194 42 190 22C180 40 168 46 152 48Z', '#fff4dc')
    o += P('M120 40C150 40 166 58 164 84C162 104 150 114 148 126C146 142 134 150 120 150C106 150 94 142 92 126C90 114 78 104 76 84C74 58 90 40 120 40Z', '#3a1408')
    o += E(120, 128, 22, 16, '#ff9a6b') + C(111, 128, 4, '#3a1408') + C(129, 128, 4, '#3a1408') + C(100, 84, 7, '#fff') + C(140, 84, 7, '#fff') + C(101, 85, 3, '#3a1408') + C(139, 85, 3, '#3a1408')
    return o
W['tetes-de-boeuf'] = _boeuf
def _renaissance():
    o = bg('#5b3fd6', burst('#684de0', 120, 80))
    for i, c in enumerate(['#e5484d', '#3fb56b', '#4f8ef7']):
        for j in range(3):
            o += E(52 + i * 68, 150 - j * 9 + 3, 26, 9, SH) + E(52 + i * 68, 150 - j * 9, 26, 9, c) + E(52 + i * 68, 148 - j * 9, 26, 9, 'rgba(255,255,255,.18)')
    o += P('M120 132L62 62L84 30H156L178 62Z', SH, ' transform="translate(3 6)"')
    o += P('M120 132L62 62H178Z', '#7ee0ff') + P('M62 62L84 30H156L178 62Z', '#c6f3ff') + P('M120 132L96 62H144Z', '#aeecff') + P('M96 62L108 30H132L144 62Z', '#fff')
    return o
W['joyaux-renaissance'] = _renaissance
def _merveilles():
    o = bg('#f0a531', C(178, 52, 30, '#ffe08a') + P('M0 180V140H240V180Z', '#c9791a'))
    o += P('M20 140L84 46L148 140Z', '#e0872a') + P('M84 46L148 140H104Z', '#b9651b')
    o += P('M120 140L172 72L224 140Z', '#f6c45c') + P('M172 72L224 140H190Z', '#d99a34')
    o += R(26, 140, 190, 10, 0, '#8a4a12')
    o += card(50, 50, -12, 34, 46, '#fff', R(-12, -18, 24, 10, 2, '#4f8ef7') + C(0, 6, 7, '#ffc93c'), 5)
    return o
W['sept-merveilles'] = _merveilles
def _bataille():
    o = bg('#d83a3a', burst('#e14b4b'))
    o += card(76, 92, -14, 62, 86, '#fff', face('R', 's', 62, 86), 8) + card(164, 92, 14, 62, 86, '#fff', face('R', 'h', 62, 86), 8)
    return o + star(120, 62, 26, '#ffc93c', 8, .5) + star(120, 62, 12, '#fff', 8, .5)
W['bataille'] = _bataille
def _president():
    o = bg('#6a4be0', C(120, 100, 96, '#7a5cf0'))
    o += card(84, 112, -12, 54, 76, '#fff', face('2', 's', 54, 76)) + card(156, 112, 12, 54, 76, '#fff', face('2', 'h', 54, 76))
    o += P('M70 62L76 22L100 44L120 12L140 44L164 22L170 62Z', SH, ' transform="translate(3 5)"') + P('M70 62L76 22L100 44L120 12L140 44L164 22L170 62Z', '#ffc93c') + R(70, 56, 100, 12, 3, '#f0a020') + C(120, 62, 5, '#e5383b') + C(92, 62, 4, '#4f8ef7') + C(148, 62, 4, '#4f8ef7')
    return o
W['president'] = _president
def _tarot():
    o = bg('#17245e', ''.join(star(x, y, r, '#3a4da0', 4, .35) for x, y, r in [(32, 30, 10), (208, 40, 13), (40, 148, 12), (204, 142, 9), (120, 20, 7)]))
    o += card(84, 96, -12, 62, 100, '#f3e6c4', R(-25, -44, 50, 88, 5, '#c0392b') + star(0, 0, 20, '#ffc93c'), 8)
    o += card(158, 92, 10, 66, 106, '#fff', R(-27, -47, 54, 94, 5, '#17245e') + T(0, 4, 40, '21', '#ffc93c') + star(0, 28, 9, '#fff'), 8)
    return o
W['tarot'] = _tarot
def _poker():
    o = bg('#0b7a53', E(120, 110, 150, 86, '#0f8d60'))
    o += card(92, 78, -12, 54, 76, '#fff', face('A', 's', 54, 76)) + card(140, 76, 8, 54, 76, '#fff', face('A', 'h', 54, 76))
    for x, c in [(60, '#e5383b'), (180, '#1a1740'), (120, '#ffc93c')]:
        for j in range(3 if x != 120 else 4):
            y = 156 - j * 8 + (0 if x != 120 else 6)
            o += E(x, y + 3, 26, 9, SH) + E(x, y, 26, 9, c) + E(x, y, 17, 5.5, 'rgba(255,255,255,.3)')
    return o
W['poker'] = _poker
def _rami():
    o = bg('#0f9d8a', P('M-10 190L250 60V190Z', '#0c8a79'))
    for i, t in enumerate(['7', '8', '9', '10']):
        o += card(54 + i * 44, 92 - (1.5 - abs(i - 1.5)) * 8, -18 + i * 12, 52, 74, '#fff', face(t, 'h', 52, 74))
    return o
W['rami'] = _rami
def _solitaire():
    o = bg('#1e8e4a', burst('#239b53', 60, 40))
    for i in range(3):
        o += card(70, 44 + i * 22, 0, 54, 74, '#3f56d8', back('#fff', '#5a70ee', 54, 74), 7, i == 0)
    o += card(70, 112, 0, 54, 74, '#fff', face('D', 'h', 54, 74))
    o += card(164, 62, 0, 54, 74, '#fff', face('A', 's', 54, 74))
    o += R(137, 108, 54, 74, 7, 'rgba(255,255,255,.14)') + suit('h', 164, 145, 26, 'rgba(255,255,255,.35)')
    return o
W['solitaire'] = _solitaire
def _derniere():
    o = bg('#2a1f7a', burst('#33278f'))
    for i, (c, t) in enumerate([('#e5383b', '7'), ('#3f7cf0', '2'), ('#3fb56b', '5'), ('#ffc93c', '9')]):
        o += card(60 + i * 40, 94 + abs(i - 1.5) * 5, -21 + i * 14, 56, 82, c, E(0, 0, 21, 33, '#fff', ' transform="rotate(24)"') + T(0, 11, 32, t, c), 9)
    return o
W['derniere-carte'] = _derniere
def _sept():
    o = bg('#0e8fa3', burst('#12a0b6'))
    o += card(56, 100, -16, 48, 68, '#fff', T(0, 11, 30, '5', '#e93d82')) + card(186, 100, 16, 48, 68, '#fff', T(0, 11, 30, '8', '#3f7cf0'))
    o += card(120, 88, 0, 76, 106, '#ffc93c', R(-31, -46, 62, 92, 7, '#fff') + T(0, 24, 72, '7', '#e5383b'), 11)
    return o
W['quitte-ou-sept'] = _sept
def _belote():
    o = bg('#12683a', C(120, 90, 100, '#17794a'))
    o += card(66, 98, -16, 54, 76, '#fff', face('V', 'c', 54, 76)) + card(120, 88, 0, 54, 76, '#fff', face('9', 'c', 54, 76)) + card(174, 98, 16, 54, 76, '#fff', face('A', 'c', 54, 76))
    return o + C(200, 34, 22, '#ffc93c') + suit('c', 200, 34, 24, INK)
W['belote'] = _belote
def _bornes():
    o = bg('#4aa8e8', E(190, 40, 34, 14, '#fff') + E(60, 30, 26, 10, '#fff') + P('M0 180V112Q120 86 240 112V180Z', '#4fb360'))
    o += P('M84 180L112 100H128L156 180Z', '#3d3a4a') + P('M118 106H122L123 122H117ZM116 134H124L125 156H115ZM114 168H126L127 180H113Z', '#fff')
    o += P('M158 150V96C158 78 198 78 198 96V150Z', SH, ' transform="translate(3 5)"') + P('M158 150V96C158 78 198 78 198 96V150Z', '#fff') + P('M158 108V96C158 78 198 78 198 96V108Z', '#e5383b')
    o += T(178, 136, 15, '1000', INK)
    return o
W['mille-bornes'] = _bornes
def _memory():
    o = bg('#7a48d8', burst('#8757e6'))
    for i in range(6):
        x, y = 62 + (i % 3) * 58, 52 + (i // 3) * 76
        if i in (1, 5):
            o += card(x, y, -4 if i == 1 else 5, 48, 64, '#fff', star(0, 2, 18, '#ffb224'))
        else:
            o += card(x, y, 0, 48, 64, '#2a1f7a', R(-18, -26, 36, 52, 4, '#3d2fa0') + C(0, 0, 8, '#7a48d8'))
    return o
W['memory'] = _memory
def _corse():
    o = bg('#e9573f', burst('#f06a52'))
    o += card(104, 108, -18, 56, 78, '#fff', face('7', 'h', 56, 78)) + card(120, 104, 4, 56, 78, '#fff', face('R', 's', 56, 78)) + card(136, 108, 20, 56, 78, '#fff', face('7', 'd', 56, 78))
    hand = ''.join(R(x, y, 15, 46, 7.5, '#ffd9b0') for x, y in [(-33, -44), (-16, -52), (1, -50), (18, -42)]) + R(-33, -14, 66, 50, 18, '#ffd9b0') + R(-50, -6, 34, 17, 8.5, '#ffd9b0', ' transform="rotate(38 -34 2)"')
    o += G(hand.replace('#ffd9b0', SH), at(181, 87, 24)) + G(hand, at(178, 80, 24))
    return o
W['bataille-corse'] = _corse

# ------------------------------------------------------------------ jeux de plateau
def _terre():
    o = bg('#2f8fd0', E(120, 96, 112, 78, '#3fa0e0'))
    r = 30; dx = r * math.sqrt(3)
    cells = [(120 - dx / 2, 51, '#2e9e54'), (120 + dx / 2, 51, '#b9bfd0'), (120 - dx, 96, '#f2c94c'), (120, 96, '#e0703a'), (120 + dx, 96, '#8fd16a'), (120 - dx / 2, 141, '#b9bfd0'), (120 + dx / 2, 141, '#2e9e54')]
    o += ''.join(hexa(x + 2, y + 6, r, SH) for x, y, c in cells) + ''.join(hexa(x, y, r - 1.5, c) for x, y, c in cells)
    o += house(120, 94, 26, '#fff', '#e5383b') + C(120 - dx, 96, 12, '#fff') + T(120 - dx, 102, 16, '8', '#e5383b')
    o += R(-17, -4, 34, 8, 4, '#3f56d8', f' transform="{at(120 + dx / 2, 74, 60)}"')
    return o
W['nouvelle-terre'] = _terre
def _rails():
    o = bg('#f1dfb8', P('M0 0H90C70 40 110 70 60 110C30 134 40 160 0 180Z', '#b9dcf2') + P('M240 180H170C180 150 220 140 240 110Z', '#b9dcf2'))
    pts = [(38, 132), (84, 96), (136, 110), (186, 62)]
    for (x1, y1), (x2, y2), c in zip(pts, pts[1:], ['#e5383b', '#3f7cf0', '#3fb56b']):
        a = math.degrees(math.atan2(y2 - y1, x2 - x1)); d = math.hypot(x2 - x1, y2 - y1); k = 2
        for j in range(k):
            t = (j + .5) / k
            o += R(-d / k / 2 + 3, -6, d / k - 6, 12, 3, c, f' transform="{at(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, a)}"')
    o += ''.join(C(x, y, 9, '#fff') + C(x, y, 5, INK) for x, y in pts)
    loco = R(-34, -6, 62, 26, 5, '#e5383b') + R(4, -26, 26, 24, 4, '#c92a2a') + R(9, -20, 14, 11, 2, '#bfe6ff') + R(-28, -22, 10, 18, 2, INK) + P('M-34 20L-48 20L-34 8Z', '#ffc93c') + ''.join(C(x, 22, 9, INK) + C(x, 22, 3.5, '#fff') for x in (-20, 2, 22))
    o += G(loco, at(151, 139, 0, 1), ' fill-opacity=".001"').replace('fill-opacity=".001"', '')
    return o
W['rails-d-europe'] = _rails
def _proprio():
    o = bg('#e03a3a', burst('#ea4c4c'))
    o += R(0, 142, 240, 38, 0, '#fff') + ''.join(R(x, 142, 58, 13, 0, c) for x, c in [(2, '#3fb56b'), (62, '#3f7cf0'), (122, '#ffc93c'), (182, '#7a48d8')]) + ''.join(R(x, 142, 2, 38, 0, INK) for x in (60, 120, 180))
    o += house(54, 112, 40, '#3fb56b', '#2c8f52') + house(98, 112, 40, '#3fb56b', '#2c8f52')
    o += P('M132 132V70H192V132Z', '#fff') + P('M126 74L162 44L198 74Z', INK) + ''.join(R(x, y, 12, 14, 2, '#3f7cf0') for x in (141, 171) for y in (82, 106)) + R(156, 108, 12, 24, 2, '#e5383b')
    o += die(202, 34, 34, 14, 6) + die(170, 22, 26, -12, 3)
    return o
W['grand-proprietaire'] = _proprio
def _remparts():
    o = bg('#5fb04c')
    t = 82
    def tile(x, y, kind):
        s = R(x + 2, y + 5, t - 4, t - 4, 5, SH) + R(x, y, t - 4, t - 4, 5, '#8fd16a')
        if kind == 0: s += P(f'M{x} {y}H{x + t - 4}V{y + 26}Q{x + (t - 4) / 2} {y + 46} {x} {y + 26}Z', '#c98b4e') + L(f'M{x + 39} {y + 78}V{y + 44}', '#f6ecd0', 9)
        if kind == 1: s += L(f'M{x} {y + 39}H{x + 78}', '#f6ecd0', 9) + C(x + 58, y + 16, 9, '#2e8e42') + C(x + 18, y + 62, 8, '#2e8e42')
        if kind == 2: s += L(f'M{x + 39} {y}V{y + 39}H{x + 78}', '#f6ecd0', 9) + R(x + 10, y + 46, 24, 20, 3, '#fff') + P(f'M{x + 6} {y + 48}L{x + 22} {y + 34}L{x + 38} {y + 48}Z', '#e5383b')
        return s
    o += tile(-6, -30, 1) + tile(78, -30, 0) + tile(162, -30, 2) + tile(-6, 54, 2) + tile(78, 54, 1) + tile(162, 54, 0) + tile(78, 138, 0) + tile(162, 138, 1) + tile(-6, 138, 1)
    return o + E(122, 122, 22, 6, SH) + meeple(120, 88, 66, '#e5383b') + E(196, 78, 13, 4, SH) + meeple(194, 58, 38, '#3f56d8')
W['remparts'] = _remparts
def _conquete():
    o = bg('#3b9fd8')
    o += P('M18 40L70 18L112 34L104 84L56 100L22 80Z', '#e5484d') + P('M112 34L166 16L216 44L190 92L104 84Z', '#ffc93c') + P('M22 80L56 100L104 84L120 136L70 164L26 140Z', '#3fb56b') + P('M104 84L190 92L222 138L176 166L120 136Z', '#8757e6')
    o += L('M70 18L112 34L104 84L56 100L22 80M112 34L166 16M104 84L190 92M104 84L120 136', '#3b9fd8', 5)
    for x, y, k in [(64, 58, '5'), (160, 54, '3'), (70, 126, '2'), (166, 128, '8')]:
        o += C(x + 2, y + 4, 17, SH) + C(x, y, 17, '#fff') + T(x, y + 7, 20, k, INK)
    return o
W['conquete'] = _conquete
def _echecs():
    o = bg('#3b2f9e', burst('#4538ad', 120, 60)) + R(0, 110, 240, 70, 0, '#241c6e') + ''.join(R(i * 48, j * 35 + 110, 48, 35, 0, '#5a4cc8') for i in range(5) for j in range(2) if (i + j) % 2 == 0)
    def king(x, y, f):
        return R(x - 4, y - 78, 8, 24, 2, f) + R(x - 12, y - 70, 24, 8, 2, f) + P(f'M{x - 22} {y}L{x - 28} {y - 46}Q{x} {y - 66} {x + 28} {y - 46}L{x + 22} {y}Z', f) + R(x - 30, y - 6, 60, 14, 5, f)
    def pion(x, y, f):
        return C(x, y - 48, 15, f) + P(f'M{x - 18} {y}Q{x - 6} {y - 30} {x - 10} {y - 36}H{x + 10}Q{x + 6} {y - 30} {x + 18} {y}Z', f) + R(x - 24, y - 6, 48, 13, 5, f)
    o += G(E(84, 150, 34, 8, SH) + king(80, 146, '#f6f1ff') + E(164, 158, 28, 7, SH) + pion(160, 154, '#ffc93c'), 'translate(-36 -44) scale(1.3)')
    return o
W['echecs'] = _echecs
def _dames():
    o = bg('#7a4a22')
    s = 60
    o += ''.join(R(i * s, j * s, s, s, 0, '#f0d9a8' if (i + j) % 2 == 0 else '#a8683a') for i in range(4) for j in range(3))
    for x, y, c, r in [(90, 30, '#fff7e6', '#e9dcc0'), (210, 30, '#fff7e6', '#e9dcc0'), (30, 90, '#e5383b', '#c92a2a'), (150, 150, '#e5383b', '#c92a2a')]:
        o += disc(x, y, 22, c, r)
    o += disc(150, 90, 22, '#e5383b', '#c92a2a') + disc(150, 82, 22, '#e5383b', '#c92a2a') + P('M138 88L140 72L147 80L150 70L153 80L160 72L162 88Z', '#ffc93c')
    return o
W['dames'] = _dames
def _reversi():
    o = bg('#178a4c')
    s = 60
    o += ''.join(R(i * s + 2, j * s + 2, s - 4, s - 4, 6, '#1e9c58') for i in range(4) for j in range(3))
    for x, y, c in [(90, 30, '#f6f1ff'), (150, 30, INK), (30, 90, INK), (150, 90, '#f6f1ff'), (210, 90, INK), (90, 150, '#f6f1ff')]:
        o += disc(x, y, 22, c)
    o += C(92, 94, 22, SH) + P('M90 68A22 22 0 0 0 90 112Z', INK) + P('M90 68A22 22 0 0 1 90 112Z', '#f6f1ff')
    return o
W['reversi'] = _reversi
def _quatre():
    o = bg('#2850d8', R(-10, -10, 260, 200, 0, '#2f5cf0'))
    cols = {(1, 3): 'r', (2, 3): 'y', (3, 3): 'r', (4, 3): 'y', (2, 2): 'r', (3, 2): 'y', (4, 2): 'y', (3, 1): 'r', (4, 1): 'r', (4, 0): 'r', (5, 3): 'y', (0, 3): 'y'}
    for i in range(6):
        for j in range(4):
            x, y = 20 + i * 40, 24 + j * 44; k = cols.get((i, j))
            o += C(x, y + 2, 16.5, '#1c3aa8') + C(x, y, 16, {'r': '#e5383b', 'y': '#ffc93c', None: '#15133a'}[k]) + (C(x - 5, y - 6, 3, 'rgba(255,255,255,.45)') if k else '')
    o += L('M60 156L180 24', '#fff', 6, ' opacity=".9"')
    return o
W['quatre-en-ligne'] = _quatre
def _navale():
    o = bg('#123a7a') + ''.join(L(f'M{x} 0V180', '#1c4d96', 2) for x in range(40, 240, 40)) + ''.join(L(f'M0 {y}H240', '#1c4d96', 2) for y in range(30, 180, 40))
    o += P('M34 96H206L190 126H52Z', SH, ' transform="translate(3 6)"') + P('M34 96H206L190 126H52Z', '#c9d1e6') + R(84, 72, 70, 24, 4, '#e8ecf7') + R(104, 52, 30, 20, 3, '#c9d1e6') + R(114, 34, 8, 18, 2, '#e5383b') + ''.join(C(x, 111, 4.5, '#123a7a') for x in (76, 100, 124, 148, 172))
    o += star(196, 44, 24, '#ff7a45', 9, .55) + star(196, 44, 11, '#ffc93c', 9, .55)
    o += C(40, 150, 13, 'none', ' stroke="#fff" stroke-width="4"') + C(40, 150, 4, '#fff')
    return o
W['bataille-navale'] = _navale
def _chevaux():
    o = bg('#fff7e6') + R(0, 0, 96, 66, 0, '#e5383b') + R(144, 0, 96, 66, 0, '#3f7cf0') + R(0, 114, 96, 66, 0, '#ffc93c') + R(144, 114, 96, 66, 0, '#3fb56b')
    o += ''.join(C(x, 90, 8, '#d9cfb8') for x in (16, 44, 72, 168, 196, 224)) + ''.join(C(120, y, 8, '#d9cfb8') for y in (14, 40, 140, 166))
    o += pawn(48, 34, 44, '#fff') + pawn(192, 34, 44, '#fff') + pawn(48, 148, 44, '#fff') + pawn(192, 148, 44, '#fff')
    return o + die(120, 90, 46, -10, 6)
W['petits-chevaux'] = _chevaux
def _awale():
    o = bg('#c4622d', burst('#cf7038'))
    o += R(17, 39, 212, 112, 30, SH) + R(14, 32, 212, 112, 30, '#7a3a14') + R(20, 38, 200, 100, 25, '#96501f')
    seeds = [3, 4, 2, 5, 3, 4, 4, 1, 5, 3, 2, 4]
    for i in range(12):
        x, y = 44 + (i % 6) * 30.4, 64 + (i // 6) * 48
        o += C(x, y, 13, '#5c2a0c')
        for k in range(seeds[i]):
            a = k * 2.4 + i; rr = 0 if seeds[i] == 1 else 5.5
            o += C(x + rr * math.cos(a), y + rr * math.sin(a), 3.6, ['#f6e7b4', '#ffc93c', '#d9e8c0'][k % 3])
    return o
W['awale'] = _awale
def _backgammon():
    o = bg('#0f6a52') + R(8, 0, 224, 180, 0, '#138063')
    for i in range(6):
        x = 14 + i * 37
        o += P(f'M{x} 0H{x + 32}L{x + 16} 78Z', '#f6e7b4' if i % 2 else '#e5383b') + P(f'M{x} 180H{x + 32}L{x + 16} 104Z', '#e5383b' if i % 2 else '#f6e7b4')
    for x, y, c in [(30, 16, INK), (30, 46, INK), (104, 16, '#fff'), (215, 164, INK), (215, 134, INK), (67, 164, '#fff'), (67, 134, '#fff'), (67, 104, '#fff')]:
        o += disc(x, y, 15, c, 'rgba(128,128,160,.25)')
    return o + die(142, 92, 36, -10, 6) + die(184, 86, 36, 12, 4)
W['backgammon'] = _backgammon
def _morpion():
    o = bg('#e9c27a') + ''.join(L(f'M{x} 0V180', '#b98d44', 2) for x in range(20, 240, 40)) + ''.join(L(f'M0 {y}H240', '#b98d44', 2) for y in range(10, 180, 40))
    st = [(60, 130, 0), (100, 90, 0), (140, 50, 0), (180, 10, 0), (20, 170, 0), (100, 130, 1), (140, 90, 1), (60, 90, 1), (180, 50, 1), (180, 130, 1), (20, 50, 0)]
    o += L('M20 170L180 10', '#e5383b', 26, ' opacity=".35"')
    for x, y, w in st: o += disc(x, y, 16, '#fff' if w else INK)
    return o
W['morpion-geant'] = _morpion

# ------------------------------------------------------------------ dés et dominos
def _approche():
    o = bg('#2b3a9c', C(196, 44, 26, '#ffc93c') + E(60, 50, 40, 12, '#4a5ac0') + E(150, 90, 54, 14, '#4a5ac0'))
    o += P('M0 180V150L240 132V180Z', '#22306f') + P('M40 180L150 139H186L130 180Z', '#3d3a4a') + L('M92 174L160 146', '#fff', 4, ' stroke-dasharray="12 10"')
    plane = P('M-52 4C-52-6-40-10-28-10H34C46-10 56-4 56 4C56 10 46 12 34 12H-28C-42 12-52 12-52 4Z', '#fff') + P('M-8-8L-30-40H-12L18-8ZM-8 10L-30 42H-12L18 10Z', '#dfe6ff') + P('M-50-4L-62-28H-48L-34-8Z', '#e5383b') + ''.join(R(x, -5, 8, 7, 2, '#2b3a9c') for x in (2, 16, 30)) + P('M44-6C50-5 54-2 55 2H42Z', '#2b3a9c')
    o += G(plane, at(100, 80, 22, 1.05), ' opacity=".25"').replace('#fff', '#000').replace('#dfe6ff', '#000').replace('#e5383b', '#000').replace('opacity=".25"', 'opacity=".2" transform-origin="0 0"') if False else ''
    o += G(plane, at(96, 76, 20, 1.05))
    return o + die(196, 120, 34, 12, 4, '#4f8ef7', '#fff') + die(34, 132, 30, -12, 6, '#ff7a45', '#fff')
W['approche-finale'] = _approche
def _dominos():
    o = bg('#f08a24', burst('#f59a3a'))
    def dom(x, y, rot, a, b):
        inner = R(-33, -64, 66, 128, 12, '#fff8ea') + R(-24, -1.5, 48, 3, 1.5, '#cdbf9f')
        for (px, py) in PIPS[a]: inner += C(px * 17, -33 + py * 17, 6, INK)
        for (px, py) in PIPS[b]: inner += C(px * 17, 33 + py * 17, 6, INK)
        return G(R(-33, -64, 66, 128, 12, SH), at(x + 4, y + 7, rot)) + G(inner, at(x, y, rot))
    return o + dom(84, 96, -62, 6, 3) + dom(170, 82, 14, 3, 5)
W['dominos'] = _dominos
def _yams():
    o = bg('#17a35e', burst('#1fb36b'))
    for x, y, rot, k in [(44, 64, -14, 6), (120, 46, 6, 6), (196, 64, 16, 6), (82, 126, 10, 6), (160, 128, -8, 6)]:
        o += die(x, y, 50, rot, k)
    return o
W['yams'] = _yams

# ------------------------------------------------------------------ lettres, chiffres et logique
def _sudoku():
    o = bg('#3f7cf0', burst('#4b88f5'))
    o += R(47, 19, 152, 152, 14, SH) + R(44, 14, 152, 152, 14, '#fff')
    vals = {0: '5', 2: '3', 4: '7', 6: '9', 8: '1'}
    for i in range(9):
        x, y = 50 + (i % 3) * 47, 20 + (i // 3) * 47
        o += R(x, y, 46, 46, 8, '#ffc93c' if i == 4 else '#eaf0ff') + (T(x + 23, y + 34, 30, vals[i], INK if i != 4 else '#7a4b00') if i in vals else '')
    return o
W['sudoku'] = _sudoku
def _croises():
    o = bg('#15133a')
    g = ['M.T#', 'O#U.', 'T.B#', '#JEU']
    o += R(31, 9, 184, 168, 0, SH)
    for j, row in enumerate(g):
        for i, ch in enumerate(row):
            x, y = 30 + i * 45, 4 + j * 43
            if ch == '#': continue
            o += R(x, y, 43, 41, 5, '#ffc93c' if j == 3 else '#fff') + ('' if ch == '.' else T(x + 21.5, y + 31, 28, ch, INK))
    return o
W['mots-croises'] = _croises
def _bac():
    o = bg('#e5484d', burst('#ee5a5e'))
    o += R(53, 17, 120, 156, 10, SH, ' transform="rotate(-6 110 90)"') + G(R(50, 12, 120, 156, 10, '#fff') + ''.join(R(64, y, 92, 5, 2.5, '#d7dcf0') for y in (98, 116, 134, 152)) + T(110, 82, 76, 'B', '#3f56d8'), 'rotate(-6 110 90)')
    pen = R(-9, -62, 18, 96, 3, '#ffc93c') + P('M-9 34H9L0 56Z', '#f6d9b0') + P('M-3.500 47.500H3.500L0 56Z', INK) + R(-9, -74, 18, 16, 4, '#ff8fa3') + R(-9, -60, 18, 6, 0, '#c9d1e6')
    return o + G(pen.replace('#ffc93c', SH).replace('#f6d9b0', SH).replace('#ff8fa3', SH).replace('#c9d1e6', SH).replace(INK, SH), at(196, 96, 24)) + G(pen, at(192, 90, 24))
W['petit-bac'] = _bac
def _code():
    o = bg('#3a2a8c', burst('#4534a0'))
    rows = [['#e5383b', '#ffc93c', '#3fb56b', '#3f7cf0'], ['#ff7a45', '#3f7cf0', '#e5383b', '#e93d82'], ['#3fb56b', '#e93d82', '#ffc93c', '#ff7a45']]
    o += R(25, 15, 196, 158, 18, SH) + R(22, 10, 196, 158, 18, '#211763')
    for j, row in enumerate(rows):
        y = 38 + j * 51
        for i, c in enumerate(row): o += disc(48 + i * 38, y, 14, c, None, False)
        for k in range(4): o += C(184 + (k % 2) * 16, y - 8 + (k // 2) * 16, 5, ['#fff', INK, '#55488f', '#55488f'][(k + j) % 4] if j else ['#fff', '#fff', INK, '#55488f'][k])
    return o
W['code-secret'] = _code
def _demineur():
    o = bg('#8f9bb8')
    s = 60
    nums = {(0, 0): ('1', '#3f56d8'), (1, 0): ('2', '#1f9a4f'), (0, 1): ('1', '#3f56d8'), (2, 1): ('3', '#e5383b'), (1, 2): ('2', '#1f9a4f')}
    for i in range(4):
        for j in range(3):
            x, y = i * s, j * s
            if (i, j) in nums or (i, j) == (1, 1):
                o += R(x + 2, y + 2, s - 4, s - 4, 6, '#e6eaf5')
                if (i, j) in nums: o += T(x + 30, y + 43, 36, nums[(i, j)][0], nums[(i, j)][1])
            else:
                o += R(x + 2, y + 2, s - 4, s - 4, 6, '#b9c3dc') + R(x + 2, y + 2, s - 4, (s - 4) * .5, 6, '#c9d2e8')
    o += C(92, 92, 17, INK) + L('M92 68V116M68 92H116M75 75L109 109M109 75L75 109', INK, 5) + C(86, 86, 5, '#fff')
    o += R(203, 22, 5, 44, 2, INK) + P('M203 22L176 34L203 46Z', '#e5383b') + R(190, 62, 30, 6, 3, INK)
    return o
W['demineur'] = _demineur
def _2048():
    o = bg('#f2a43a', burst('#f6b14e'))
    tiles = [('2', '#fff7e6', '#7a6a55', 34), ('4', '#ffe2b0', '#7a6a55', 34), ('8', '#ff9a52', '#fff', 34), ('16', '#ff7a45', '#fff', 30), ('32', '#f0562e', '#fff', 30), ('2048', '#15133a', '#ffc93c', 21)]
    o += R(15, 11, 216, 164, 16, SH) + R(12, 6, 216, 164, 16, '#b9762a')
    for i, (t, c, f, sz) in enumerate(tiles):
        x, y = 20 + (i % 3) * 68, 14 + (i // 3) * 76
        o += R(x, y, 62, 70, 10, c) + T(x + 31, y + 35 + sz * .36, sz, t, f)
    return o
W['2048'] = _2048
def _mot():
    o = bg('#15133a')
    rows = [('ARBRE', 'gygxx'), ('ROUTE', 'ggxxy'), ('RONDE', 'ggggg')]
    for j, (w, st) in enumerate(rows):
        for i, ch in enumerate(w):
            c = {'g': '#2fae66', 'y': '#f2b01e', 'x': '#3b3876'}[st[i]]
            o += R(13 + i * 43.500, 14 + j * 53, 40, 48, 7, c) + T(33 + i * 43.500, 49 + j * 53, 30, ch, '#fff')
    return o
W['mot-du-jour'] = _mot
def _meles():
    o = bg('#e93d82', burst('#f0528f'))
    g = ['CHATX', 'OLIGR', 'ZEBRE', 'PUMAS']
    o += R(15, 9, 216, 168, 16, SH) + R(12, 4, 216, 168, 16, '#fff')
    o += R(20, 12, 162, 34, 17, '#ffc93c') + R(20, 92, 200, 34, 17, '#9be7c0') + R(-17, -17, 34, 150, 17, 'rgba(79,142,247,.4)', ' transform="translate(202 28)"')
    for j, row in enumerate(g):
        for i, ch in enumerate(row): o += T(39 + i * 40.500, 40 + j * 40, 26, ch, INK)
    return o
W['mots-meles'] = _meles

# ------------------------------------------------------------------ mini-jeux vidéo
def _serpents():
    o = bg('#15133a') + ''.join(R(i * 40, j * 40 - 10, 40, 40, 0, '#1b1848') for i in range(6) for j in range(5) if (i + j) % 2)
    path = 'M24 150H96V90H56V40H150V110H206'
    o += L(path, 'rgba(0,0,0,.35)', 30, ' transform="translate(3 6)"') + L(path, '#35d07f', 30) + L(path, '#5eeaa8', 30, ' stroke-dasharray="0 48"')
    o += C(206, 110, 19, '#35d07f') + C(210, 101, 6, '#fff') + C(210, 119, 6, '#fff') + C(212, 101, 2.8, INK) + C(212, 119, 2.8, INK) + L('M224 110H236', '#e5383b', 4)
    o += C(200, 44, 15, '#e5383b') + C(195, 39, 4, 'rgba(255,255,255,.5)') + L('M200 30Q202 22 210 20', '#3fb56b', 5)
    return o
W['serpents'] = _serpents
def _souriciere():
    o = bg('#1d1a55')
    o += L('M20 20H150V70M190 20H220V160H120M20 60V160H80V110M70 60H110V110H170V70H180', '#4f6bf5', 10)
    o += ''.join(C(x, y, 4, '#ffc93c') for x, y in [(45, 40), (75, 40), (105, 40), (45, 85), (45, 115), (45, 140), (140, 135), (170, 135), (195, 135), (195, 100)])
    o += P('M118 62L162 40V84Z', '#ffc93c', ' transform="translate(48 -16)"') + C(196, 46, 4, '#f0a020') + C(204, 60, 3, '#f0a020')
    mouse = E(0, 0, 22, 17, '#d7dcf0') + C(-14, -17, 11, '#d7dcf0') + C(-14, -17, 6, '#ff8fa3') + C(8, -19, 11, '#d7dcf0') + C(8, -19, 6, '#ff8fa3') + C(12, -2, 3, INK) + C(23, 3, 4, '#ff8fa3') + L('M-20 6Q-36 12-34-6', '#ff8fa3', 4)
    o += G(mouse, at(96, 138, 0, 1.1))
    cat = P('M-24 18V-10L-18-26L-8-12H8L18-26L24-10V18Q0 30-24 18Z', '#ff7a45') + C(-9, 2, 5, '#fff') + C(9, 2, 5, '#fff') + C(-9, 3, 2.4, INK) + C(9, 3, 2.4, INK) + P('M-3 11H3L0 15Z', INK)
    return o + G(cat, at(140, 88, 0, 1))
W['souriciere'] = _souriciere
def _piaf():
    o = bg('#6ccbff', E(54, 44, 34, 13, '#fff') + E(196, 96, 30, 11, '#fff') + R(0, 156, 240, 24, 0, '#6fc65a') + R(0, 156, 240, 6, 0, '#4faa3e'))
    for x, top, bot in [(150, 46, 118)]:
        o += R(x, 0, 46, top, 0, '#3fb56b') + R(x - 5, top - 16, 56, 18, 4, '#2c9a52') + R(x, bot, 46, 156 - bot, 0, '#3fb56b') + R(x - 5, bot, 56, 18, 4, '#2c9a52') + R(x + 6, 0, 8, top - 16, 0, '#6fd690') + R(x + 6, bot + 18, 8, 156 - bot - 18, 0, '#6fd690')
    bird = E(0, 0, 30, 24, '#ffc93c') + E(-10, 6, 15, 10, '#f0a020') + C(13, -8, 9, '#fff') + C(15, -8, 4, INK) + P('M22 0L44 5L22 12Z', '#ff7a45')
    return o + G(E(0, 0, 30, 24, SH), at(78, 96, -14)) + G(bird, at(74, 88, -14))
W['piaf'] = _piaf
def _pong():
    o = bg('#15133a') + L('M120 0V180', '#3b3876', 5, ' stroke-dasharray="12 12"')
    o += R(16, 26, 20, 72, 10, '#5eeaa8') + R(204, 84, 20, 72, 10, '#ff7a6b')
    o += ''.join(C(150 - i * 17, 96 - i * 9, 12 - i * 2.2, '#ffc93c', f' opacity="{.5 - i * .12:.2f}"') for i in range(1, 4)) + C(158, 100, 14, '#ffc93c')
    return o + T(72, 44, 30, '3', '#3b3876') + T(168, 44, 30, '2', '#3b3876')
W['pong'] = _pong
def _briques():
    o = bg('#1d1a55')
    for j, c in enumerate(['#e5383b', '#ff7a45', '#ffc93c', '#3fb56b', '#4f8ef7']):
        for i in range(6):
            if (i, j) in [(2, 4), (3, 4), (3, 3), (5, 4)]: continue
            o += R(6 + i * 38.500, 8 + j * 19, 35, 15, 4, c)
    o += L('M120 150L148 108', '#fff', 5, ' opacity=".25" stroke-dasharray="2 10"') + C(150, 104, 10, '#fff') + R(74, 154, 92, 16, 8, '#5eeaa8')
    return o
W['casse-briques'] = _briques
def _blocs():
    o = bg('#15133a') + ''.join(L(f'M{x} 0V180', '#1f1c52', 2) for x in range(30, 240, 30))
    def blk(cells, c, ox, oy):
        return ''.join(R(ox + a * 30 + 1.5, oy + b * 30 + 1.5, 27, 27, 5, c) + R(ox + a * 30 + 6, oy + b * 30 + 6, 9, 5, 2.5, 'rgba(255,255,255,.4)') for a, b in cells)
    o += blk([(0, 1), (1, 1), (2, 1), (1, 0)], '#b07af5', 75, 4)
    o += blk([(0, 0), (0, 1), (1, 1), (2, 1)], '#4f8ef7', 0, 120) + blk([(0, 0), (1, 0), (0, 1), (1, 1)], '#ffc93c', 90, 120) + blk([(1, 0), (2, 0), (0, 1), (1, 1)], '#3fb56b', 150, 90) + blk([(0, 0)], '#e5383b', 210, 150) + blk([(0, 0), (1, 0)], '#ff7a45', 150, 150)
    return o + ''.join(L(f'M{x} 74V100', '#b07af5', 4, ' opacity=".4"') for x in (90, 120, 150))
W['blocs'] = _blocs
def _bombes():
    o = bg('#4d9a3c') + ''.join(R(i * 48, j * 45, 48, 45, 0, '#58a846') for i in range(5) for j in range(4) if (i + j) % 2)
    for x, y in [(24, 22), (216, 22), (24, 158), (216, 112)]:
        o += R(x - 20, y - 18, 40, 38, 5, '#c98b4e') + L(f'M{x - 12} {y - 10}L{x + 12} {y + 12}M{x + 12} {y - 10}L{x - 12} {y + 12}', '#8a5a2a', 5)
    for x, y in [(120, 22), (72, 158), (168, 158)]:
        o += R(x - 20, y - 18, 40, 38, 5, '#8790a8') + R(x - 20, y - 18, 40, 12, 5, '#a3acc4')
    o += E(122, 136, 40, 9, SH) + C(118, 100, 40, INK) + C(104, 86, 9, 'rgba(255,255,255,.3)') + R(108, 50, 22, 16, 4, '#3b3876') + L('M119 50Q122 32 142 34', '#f6e7b4', 5)
    return o + star(148, 34, 16, '#ff7a45', 8, .5) + star(148, 34, 8, '#ffc93c', 8, .5)
W['bombes'] = _bombes
def _chars():
    o = bg('#e0bb84') + ''.join(R(0, y, 240, 2, 0, '#c99f66') for y in (44, 90, 136)) + ''.join(R(x, y, 2, 46, 0, '#c99f66') for x, y in [(70, 0), (170, 44), (40, 90), (130, 136), (200, 90)])
    def block(x, y, w, h, top='#f6e6c2', side='#c7a268'):
        return R(x + 5, y + 6, w, h, 4, SH) + R(x, y, w, h, 4, side) + R(x, y, w, h - 8, 4, top)
    def tank(x, y, rot, col, tur):
        t = R(-30, -28, 60, 15, 5, INK) + R(-30, 13, 60, 15, 5, INK) + R(-25, -20, 50, 40, 8, col) + R(-25, -20, 50, 14, 8, 'rgba(255,255,255,.22)')
        t += G(R(0, -6, 46, 12, 3, col, f' stroke="{INK}" stroke-width="3"') + C(0, 0, 15, col, f' stroke="{INK}" stroke-width="3"') + C(-4, -4, 5, 'rgba(255,255,255,.4)'), f'rotate({tur})')
        return E(x + 4, y + 8, 36, 30, SH) + G(t, at(x, y, rot))
    o += block(96, 0, 40, 48) + block(96, 132, 40, 48) + block(196, 60, 44, 40, '#c1905f', '#8a5e38')
    o += L('M92 104L150 70L176 30', '#fff', 4, ' stroke-dasharray="2 10" opacity=".8"')
    o += tank(52, 124, -30, '#4f8ef7', 0) + tank(196, 150, 200, '#e5383b', 20)
    o += G(R(-9, -5, 18, 10, 5, '#fff', f' stroke="{INK}" stroke-width="3"'), at(178, 28, -58))
    return o + star(150, 70, 13, '#ffc93c', 8, .5) + star(150, 70, 6, '#fff', 8, .5)
W['chars'] = _chars
def _dessine():
    o = bg('#12a594', burst('#17b3a1'))
    o += R(27, 21, 168, 138, 12, SH) + R(24, 16, 168, 138, 12, '#fff')
    o += L('M52 112C52 80 86 78 92 96C100 70 142 76 136 108C156 108 158 136 136 136H66C46 136 44 114 52 112Z', '#3f7cf0', 7) + ''.join(L(f'M{x} 60L{x - 6} 44', '#ffc93c', 6) for x in (76, 100, 124))
    pen = R(-10, -70, 20, 100, 3, '#ff7a45') + P('M-10 30H10L0 54Z', '#f6d9b0') + P('M-4 44.500H4L0 54Z', INK) + R(-10, -82, 20, 16, 4, '#ff8fa3')
    sh = pen.replace('#ff7a45', SH).replace('#f6d9b0', SH).replace('#ff8fa3', SH).replace(INK, SH)
    return o + G(sh, at(188, 100, 28)) + G(pen, at(184, 94, 28))
W['dessine'] = _dessine

def cover(key):
    return '<svg viewBox="0 0 240 180" preserveAspectRatio="xMidYMid slice">' + W[key]() + '</svg>'

if __name__ == '__main__':
    import sys
    print(len(W), 'couvertures', sum(len(cover(k)) for k in W), 'octets')
