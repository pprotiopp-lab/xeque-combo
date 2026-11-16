import base64,re
W='/home/claude/web/node_modules/@fontsource/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
faces=[("Kanit",500,"normal",W+"kanit/files/kanit-latin-500-normal.woff2"),("Kanit",700,"normal",W+"kanit/files/kanit-latin-700-normal.woff2"),
("Kanit",700,"italic",W+"kanit/files/kanit-latin-700-italic.woff2"),("Kanit",800,"italic",W+"kanit/files/kanit-latin-800-italic.woff2"),
("Rubik",400,"normal",W+"rubik/files/rubik-latin-400-normal.woff2"),("Rubik",500,"normal",W+"rubik/files/rubik-latin-500-normal.woff2"),("Rubik",700,"normal",W+"rubik/files/rubik-latin-700-normal.woff2"),
("Noto Sans Symbols 2",400,"normal",W+"noto-sans-symbols-2/files/noto-sans-symbols-2-symbols-400-normal.woff2")]
css="<style>"+"".join('@font-face{font-family:"%s";font-weight:%d;font-style:%s;src:url(data:font/woff2;base64,%s) format("woff2")}'%(f,w,s,b64(p)) for f,w,s,p in faces)+"</style>"
open('fonts.html','w').write(css)
h=open('/home/claude/xeque-combo/index.html').read()
h=re.sub(r'<!--FONTS-->.*?<!--/FONTS-->',lambda m:css,h,flags=re.S)
h=h.replace('<!--PEER-->','<script src="peerjs.min.js"></script>')
open('proj/assets/index.html','w').write(h)
open('icon/icon.html','w').write('<!DOCTYPE html><html><head><meta charset="utf-8">'+css+'''<style>html,body{margin:0;width:432px;height:432px;background:#150d2b;overflow:hidden}
.c{position:absolute;left:86px;top:86px;width:260px;height:260px;box-sizing:border-box;border-radius:50%;background:linear-gradient(160deg,#ff86b8,#ff3d8b);border:22px solid #f6efff;display:grid;place-items:center;font:150px/1 "Noto Sans Symbols 2";color:#fff;box-shadow:inset 0 -22px 0 rgba(0,0,0,.14)}
.r{position:absolute;left:36px;top:36px;width:360px;height:360px;box-sizing:border-box;border-radius:50%;border:10px solid #62e0ff}</style></head><body><div class="r"></div><div class="c">&#9818;&#xFE0E;</div></body></html>''')
