css=open('old.css').read()+open('new.css').read()+"\n.row.you{background:rgba(255,92,159,.16);border-color:var(--rosa)}\n.row.you .pp{color:var(--ouro)}\n"
head='''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Xeque Combo</title>
<!--FONTS-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,500;0,700;1,700;1,800&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%99%9A%E2%99%9B%E2%99%9C%E2%99%9D%E2%99%9E%E2%99%9F&display=swap" rel="stylesheet">
<!--/FONTS-->
<style>'''+css+'''</style>
</head>
'''
out=head+open('body.html').read()+'\n<script id="engine">'+open('engine.js').read()+'</script>\n<!--PEER-->\n<script>\n'+open('ui.js').read()+'</script>\n</body>\n</html>\n'
open('/home/claude/xeque-combo/index.html','w').write(out); print(len(out))
