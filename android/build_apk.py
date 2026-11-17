r"""Gera o APK assinado a partir do src/.
Uso (PowerShell):
  $env:XC_KEYSTORE="C:\caminho\xeque-combo.jks"; $env:XC_KSPASS="senha"; $env:XC_ALIAS="xequecombo"
  python android/build_apk.py
Requer: apktool (no PATH ou em $env:APKTOOL), Android build-tools (zipalign, apksigner) e Java.
"""
import os, re, subprocess, sys, glob, shutil
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
A = os.path.join(ROOT, "android"); PROJ = os.path.join(A, "proj"); OUT = os.path.join(A, "out")
env = os.environ.copy(); env["PYTHONUTF8"] = "1"
subprocess.check_call([sys.executable, os.path.join(ROOT, "src", "assemble.py")], env=env)
rd = lambda p: open(p, encoding="utf-8").read()
h = rd(os.path.join(ROOT, "dist", "index.html"))
h = re.sub(r"<!--FONTS-->.*?<!--/FONTS-->", lambda m: rd(os.path.join(A, "fonts.html")), h, flags=re.S)
h = h.replace("<!--PEER-->", '<script src="peerjs.min.js"></script>')
h = h.replace('<script id="engine">', rd(os.path.join(ROOT, "tools", "fb_module.html")) + '\n<script id="engine">', 1)
open(os.path.join(PROJ, "assets", "index.html"), "w", encoding="utf-8", newline="").write(h)
ver = re.search(r"versionName: '([^']+)'", rd(os.path.join(PROJ, "apktool.yml"))).group(1)
os.makedirs(OUT, exist_ok=True)
unsigned = os.path.join(OUT, "unsigned.apk"); aligned = os.path.join(OUT, "aligned.apk")
final = os.path.join(ROOT, "dist", "xeque-combo-%s.apk" % ver)
jar = os.path.join(A, "tools", "apktool.jar")
apktool = os.environ.get("APKTOOL") or (jar if os.path.exists(jar) else shutil.which("apktool"))
if not apktool: sys.exit("apktool não encontrado (defina APKTOOL ou ponha no PATH).")
cmd = ["java", "-jar", apktool] if apktool.lower().endswith(".jar") else [apktool]
subprocess.check_call(cmd + ["b", PROJ, "-o", unsigned, "-f"], shell=apktool.lower().endswith((".bat", ".cmd")))
bt = sorted(glob.glob(os.path.expandvars(r"%LOCALAPPDATA%\Android\Sdk\build-tools\*")))
if not bt: sys.exit("build-tools do Android não encontrado.")
ext = ".bat" if os.name == "nt" else ""
zipalign = os.path.join(bt[-1], "zipalign" + (".exe" if os.name == "nt" else ""))
apksigner = os.path.join(bt[-1], "apksigner" + ext)
ks = os.environ.get("XC_KEYSTORE"); pw = os.environ.get("XC_KSPASS")
if not ks or not pw: sys.exit("Defina XC_KEYSTORE e XC_KSPASS (a MESMA keystore das versões anteriores).")
if os.path.exists(aligned): os.remove(aligned)
subprocess.check_call([zipalign, "-p", "4", unsigned, aligned])
subprocess.check_call([apksigner, "sign", "--ks", ks, "--ks-key-alias", os.environ.get("XC_ALIAS", "xequecombo"),
                       "--ks-pass", "env:XC_KSPASS", "--out", final, aligned], env=env, shell=(ext == ".bat"))
print("OK ->", final)
