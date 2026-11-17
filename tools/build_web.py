r"""Gera a versão de navegador (PWA) em docs/ para o GitHub Pages.
Uso: python tools/build_web.py
"""
import os, re, subprocess, sys, shutil, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
D = os.path.join(ROOT, "docs"); os.makedirs(D, exist_ok=True)
env = dict(os.environ, PYTHONUTF8="1")
subprocess.check_call([sys.executable, os.path.join(ROOT, "src", "assemble.py")], env=env)
rd = lambda p: open(p, encoding="utf-8").read()
h = rd(os.path.join(ROOT, "dist", "index.html"))
ver = re.search(r'const APPV="([^"]+)"', h).group(1)
h = re.sub(r"<!--FONTS-->.*?<!--/FONTS-->", lambda m: rd(os.path.join(ROOT, "android", "fonts.html")), h, flags=re.S)
h = h.replace("<!--PEER-->", '<script src="peerjs.min.js"></script>')
FB = rd(os.path.join(ROOT, "tools", "fb_module.html"))
head = ('<meta name="theme-color" content="#150d2b"><link rel="manifest" href="manifest.webmanifest">'
        '<link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-180.png">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
        '<meta name="apple-mobile-web-app-title" content="Xeque Combo"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
h = h.replace("<title>Xeque Combo</title>", "<title>Xeque Combo</title>" + head, 1)
h = h.replace('<script id="engine">', FB + '\n<script id="engine">', 1)
h = h.replace("</body>", '<script>if("serviceWorker"in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(function(){});</script>\n</body>', 1)
open(os.path.join(D, "index.html"), "w", encoding="utf-8", newline="").write(h)
shutil.copy(os.path.join(ROOT, "android", "proj", "assets", "peerjs.min.js"), os.path.join(D, "peerjs.min.js"))
json.dump({"name": "Xeque Combo", "short_name": "Xeque Combo", "start_url": "./", "scope": "./", "display": "standalone",
           "orientation": "portrait", "background_color": "#150d2b", "theme_color": "#150d2b", "lang": "pt-BR",
           "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
                     {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]},
          open(os.path.join(D, "manifest.webmanifest"), "w", encoding="utf-8"), indent=1)
open(os.path.join(D, "sw.js"), "w", encoding="utf-8", newline="").write('''/* Service worker: abre offline e sempre tenta pegar a versão nova primeiro. */
const C="xeque-combo-%s",FILES=["./","index.html","peerjs.min.js","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request).then(m=>m||caches.match("index.html"))));
});
''' % ver)
print("OK docs/ v" + ver)
