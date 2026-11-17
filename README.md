# Xeque Combo ♟️ (xadrez do osu!)

Xadrez com tema de osu! em app Android (WebView). PP só no online, 15 bots de treino, amigos P2P, perfil, modos (Rápido, Blitz, Diário, Ritmo), análise de partida, chat e histórico.

## Estrutura
- `src/` – código do jogo (HTML/CSS/JS). `python3 src/assemble.py` gera o `index.html`.
- `android/proj/` – projeto apktool (wrapper WebView, package `com.thiago.xequecombo`).
- `dist/` – última versão pronta (`.apk` e `index.html`).

## Atualizar (fluxo)
1. Edita/gera o jogo, sobe `versionCode`/`versionName` em `android/proj/apktool.yml` e `AndroidManifest.xml`.
2. Compila e assina **com a mesma keystore** (senão o Android não deixa instalar por cima).
3. Cria um *Release* no GitHub com o `.apk` anexado e o número da versão.

Quem já tem o app só baixa o APK novo do Release e instala por cima — PP, amigos e histórico ficam.

## Segurança
A keystore (`xeque-combo.jks`) e a senha **não** ficam no repositório (ver `.gitignore`). Guarde-as em local seguro: sem elas ninguém consegue publicar update que instale por cima.

## Aviso de atualização no app
O app consulta `releases/latest` deste repositório ao abrir. Se a tag do Release (ex.: `v3.3`) for maior que `APP_VERSION` em `src/ui.js`, aparece o aviso "Versão 3.3 saiu!" com botão **Atualizar** que baixa o `.apk` anexado ao Release.

Para lançar uma versão nova:
1. Suba `APP_VERSION` em `src/ui.js` e `versionCode`/`versionName` em `android/proj/apktool.yml` e `AndroidManifest.xml`.
2. Compile e assine com a mesma keystore: `python android/build_apk.py` (ver cabeçalho do script: precisa de apktool, build-tools e das variáveis `XC_KEYSTORE`, `XC_KSPASS`, `XC_ALIAS`). O APK sai em `dist/`.
3. `gh release create v3.3 dist/xeque-combo-3.3.apk --title "Xeque Combo 3.3" --notes "o que mudou"` (as notas aparecem no aviso).

> O aviso só existe a partir da v3.2: quem está na 3.1 precisa instalar a 3.2 manualmente uma vez.

> **Nota:** o `dist/xeque-combo-3.2.apk` foi montado fora deste repositório e traz o aviso de atualização com implementação própria (`checkUpdate`, botão de versão, classe `Nav`). O aviso em `src/ui.js` e `Client.smali` é uma versão alternativa e não bate com esse APK. Ao mexer no código, parta do `assets/index.html` desse APK ou reconcilie as duas.

## Versão de navegador (iPhone e qualquer celular)
Jogue em **https://pprotiopp-lab.github.io/xeque-combo/** (hospedado pelo GitHub Pages, a partir da pasta `docs/`). No iPhone: Safari → Compartilhar → *Adicionar à Tela de Início*.
Para atualizar o site: `python tools/build_web.py`, depois `git add -A`, `git commit` e `git push`. Em ~1 minuto todo mundo recebe a versão nova (o botão de versão no menu recarrega a página).

## Conta Google (versão web)
Login com Google + salvamento do progresso na nuvem (Firebase, projeto `xadrez-fe040`). Os dados de cada pessoa ficam em `users/{uid}` no Firestore; as regras estão em `firebase/firestore.rules` (cole em *Firestore → Regras → Publicar*). A configuração do Firebase em `tools/fb_module.html` é pública; a segurança está nas regras. O login só existe no site (o APK usa WebView, onde o Google bloqueia o login).

### Login com Google dentro do app (v3.6)
O Google bloqueia login em WebView, então o clique do Google acontece no navegador: o app abre `.../xeque-combo/?app=1`, a página faz o login e devolve o token por `xequecombo://auth?t=...` (intent-filter no manifest, `Bridge.smali` entrega o token ao JavaScript). O app então entra no Firebase com `signInWithCredential`. Testado no emulador com um token falso (o Firebase respondeu `auth/invalid-credential`, ou seja, o caminho todo funciona). Limitação conhecida: o esquema `xequecombo://` não é verificado como um App Link, então outro app instalado poderia tentar interceptar o token (que vale por ~1 hora e só serve para este projeto).
