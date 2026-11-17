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
2. `python src/assemble.py`, compile e assine com a mesma keystore.
3. `gh release create v3.3 dist/xeque-combo-3.3.apk --title "Xeque Combo 3.3" --notes "o que mudou"` (as notas aparecem no aviso).

> O aviso só existe a partir da v3.2: quem está na 3.1 precisa instalar a 3.2 manualmente uma vez.
