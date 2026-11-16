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
