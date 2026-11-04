"""Regenerates the 1200x630 share cards in img/og-*.jpg and src/apple-touch-icon.png.
Run from this folder:  npm i @fontsource/montserrat@5.0.19 @fontsource/inter@5.0.18 && pip install playwright pillow && python3 render.py
"""
import asyncio, os
from playwright.async_api import async_playwright
F='file://'+os.path.abspath('node_modules/@fontsource')
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..'))
IMG='file://'+ROOT+'/img/'
VICON='<svg viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#C9F36A"/><path d="M19 17h10l5 18 9-18h10L38 48H28z" fill="#15191C"/><path d="M7 22h11l-1.6 4H5.4zM5 30h10l-1.6 4H3.4zM7 38h8l-1.6 4H5.4z" fill="#15191C"/><path d="M52 6l1.6 4.4L58 12l-4.4 1.6L52 18l-1.6-4.4L46 12l4.4-1.6z" fill="#15191C"/></svg>'
CARDS={
 'og-home':('shine.jpg','58% 55%','Showroom shine,<br><em>at your doorstep.</em>',['Car wash','Bike wash','Detailing'],'Doorstep car &amp; bike care in Mumbai. We bring our own water &amp; power.'),
 'og-car':('foam.jpg','62% 55%','Car wash<br><em>in your parking.</em>',['Hatchback','Sedan','SUV'],'Snow foam, hand wash &amp; interior care at your society.'),
 'og-bike':('bike.jpg','68% 50%','Bike wash before<br><em>your first ride.</em>',['Foam wash','Chain lube','Polish'],'Scooters, commuters &amp; big bikes. Done from 6 AM.'),
 'og-detail':('interior.jpg','55% 45%','Deeper than<br><em>a wash.</em>',['Interior','Polish','Ceramic sealant'],'Premium detailing at your parking in Mumbai.'),
 'og-plans':('doorstep.jpg','40% 50%','Always clean.<br><em>Never booked.</em>',['Weekly slot','Same washer','Pause anytime'],'Monthly doorstep wash plans for cars &amp; bikes.'),
}
def html(img,pos,h,chips,sub): return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:M;src:url({F}/montserrat/files/montserrat-latin-900-italic.woff2);font-weight:900;font-style:italic}}
@font-face{{font-family:M;src:url({F}/montserrat/files/montserrat-latin-800-normal.woff2);font-weight:800}}
@font-face{{font-family:I;src:url({F}/inter/files/inter-latin-500-normal.woff2);font-weight:500}}
@font-face{{font-family:I;src:url({F}/inter/files/inter-latin-700-normal.woff2);font-weight:700}}
*{{margin:0;box-sizing:border-box}}
body{{width:1200px;height:630px;overflow:hidden;background:#15191C;color:#F7F8F5;font-family:I}}
.bg{{position:absolute;inset:0;background:url({IMG}{img}) {pos}/cover}}
.sh{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,18,20,.96) 0%,rgba(15,18,20,.82) 38%,rgba(15,18,20,.15) 72%,rgba(15,18,20,0)),linear-gradient(0deg,rgba(15,18,20,.7),transparent 35%)}}
.c{{position:absolute;left:64px;top:56px;bottom:56px;width:640px;display:flex;flex-direction:column}}
.logo{{display:flex;align-items:center;gap:16px}}
.wm b{{display:block;font:italic 900 40px/1 M;letter-spacing:-.5px}} .wm b i{{color:#C9F36A}}
.wm small{{display:block;font:700 12px I;letter-spacing:4px;color:#A8AFB4;margin-top:8px}}
h1{{font:800 66px/1.02 M;letter-spacing:-2px;margin-top:auto}} h1 em{{font-style:normal;color:#C9F36A}}
p{{font:500 23px/1.4 I;color:#D3D8DB;margin-top:18px;max-width:560px}}
.row{{display:flex;align-items:center;gap:12px;margin-top:28px}}
.cta{{background:#C9F36A;color:#15191C;font:800 21px M;padding:15px 24px;border-radius:6px}}
.chip{{font:700 16px I;padding:11px 15px;border-radius:999px;border:1.5px solid rgba(255,255,255,.28);background:rgba(15,18,20,.5)}}
.stripes{{position:absolute;right:56px;top:62px;width:120px;height:16px;background:repeating-linear-gradient(115deg,#C9F36A 0 11px,transparent 11px 18px)}}
.url{{position:absolute;right:56px;bottom:52px;font:700 17px I;letter-spacing:1px;color:#F7F8F5;background:rgba(15,18,20,.6);padding:9px 14px;border-radius:6px}}
</style></head><body><div class="bg"></div><div class="sh"></div><div class="stripes"></div>
<div class="c"><div class="logo">{VICON}<div class="wm"><b>VROOM<i>BRITE</i></b><small>DOORSTEP CAR &amp; BIKE CARE</small></div></div>
<h1>{h}</h1><p>{sub}</p><div class="row"><span class="cta">Book in 1 minute →</span>{''.join(f'<span class="chip">{c}</span>' for c in chips)}</div></div>
<div class="url">MUMBAI · ANDHERI · POWAI</div></body></html>'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':630})
        for name,(img,pos,h,chips,sub) in CARDS.items():
            await pg.set_content(html(img,pos,h,chips,sub)); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'{name}.png')
            from PIL import Image; Image.open(f'{name}.png').convert('RGB').save(os.path.join(ROOT,'img',name+'.jpg'),'JPEG',quality=84,optimize=True); os.remove(f'{name}.png')
        # apple touch icon 180px
        await pg.set_viewport_size({'width':180,'height':180})
        big=VICON.replace('width="64" height="64"','width="180" height="180"')
        await pg.set_content('<body style="margin:0;background:#15191C">'+big+'</body>')
        await pg.screenshot(path=os.path.join(ROOT,'src','apple-touch-icon.png'))
        await b.close()
asyncio.run(main())
