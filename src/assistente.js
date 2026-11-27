/* ===== v3.8: Assistente de lances (Stockfish) =====
   Monte uma posição (ou cole um FEN) e veja o melhor lance, a avaliação e mais 2 opções.
   Roda dentro do próprio app (Worker com Stockfish embutido); se o aparelho bloquear, usa a IA do jogo. */
const AS_START="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AS_FILES="abcdefgh";
let asB=Array(64).fill(null), asTurn="w", asFlip=false, asTool="P", asRun=0, asWk=null, asWkOk=null, asLines={}, asMs=3000;
function asSq(i){return AS_FILES[i&7]+(8-(i>>3));}
function asIdx(n){return (8-(+n[1]))*8+AS_FILES.indexOf(n[0]);}
function asState(){
  const c={K:asB[60]==="K"&&asB[63]==="R"?1:0,Q:asB[60]==="K"&&asB[56]==="R"?1:0,k:asB[4]==="k"&&asB[7]==="r"?1:0,q:asB[4]==="k"&&asB[0]==="r"?1:0};
  return {b:asB.slice(),turn:asTurn,cast:c,ep:-1,half:0};
}
function asFen(){
  const s=asState(); let r=[];
  for(let y=0;y<8;y++){let t="",e=0; for(let x=0;x<8;x++){const p=s.b[y*8+x]; if(p){if(e){t+=e;e=0;} t+=p;}else e++;} if(e)t+=e; r.push(t);}
  const c=(s.cast.K?"K":"")+(s.cast.Q?"Q":"")+(s.cast.k?"k":"")+(s.cast.q?"q":"");
  return r.join("/")+" "+s.turn+" "+(c||"-")+" - 0 1";
}
function asParse(f){
  const p=String(f||"").trim().split(/\s+/); if(!p[0])return null;
  const rows=p[0].split("/"); if(rows.length!==8)return null;
  const b=[];
  for(const row of rows){let n=0; for(const ch of row){ if(/[1-8]/.test(ch)){for(let k=0;k<+ch;k++)b.push(null); n+=+ch;} else if(/[pnbrqkPNBRQK]/.test(ch)){b.push(ch); n++;} else return null; } if(n!==8)return null;}
  return {b,turn:p[1]==="b"?"b":"w"};
}
/* devolve um texto de erro, ou "" se a posição é válida */
function asCheck(){
  const cnt=ch=>asB.filter(x=>x===ch).length;
  if(cnt("K")!==1||cnt("k")!==1)return "Precisa de exatamente 1 rei de cada cor.";
  for(let i=0;i<8;i++)if((asB[i]&&asB[i].toLowerCase()==="p")||(asB[56+i]&&asB[56+i].toLowerCase()==="p"))return "Peão não pode ficar na primeira nem na última fileira.";
  const s=asState();
  if(inCheck(s,asTurn!=="w"))return "Posição impossível: o lado que não joga está em xeque.";
  if(!legal(s).length)return inCheck(s,asTurn==="w")?"Xeque-mate. Não há lance.":"Afogamento (empate). Não há lance.";
  return "";
}
function asPaintBoard(){
  const g=$("asBoard"); let h="";
  for(let k=0;k<64;k++){
    const i=asFlip?63-k:k, x=i&7, y=i>>3, p=asB[i];
    h+='<button class="asq '+((x+y)%2?"d":"l")+'" data-i="'+i+'" aria-label="'+asSq(i)+'">'+(p?'<span class="ap '+(p<"a"?"w":"b")+'">'+GL[p.toLowerCase()]+VS+"</span>":"")+"</button>";
  }
  g.innerHTML=h+'<svg id="asArrows" viewBox="0 0 8 8" aria-hidden="true"></svg>';
  $("asFen").value=asFen();
  $("asTurnW").setAttribute("aria-pressed",String(asTurn==="w")); $("asTurnB").setAttribute("aria-pressed",String(asTurn==="b"));
  const pal=$("asPal"); if(!pal.firstChild){
    let t=""; for(const c of "KQRBNPkqrbnp")t+='<button class="apb '+(c<"a"?"w":"b")+'" data-t="'+c+'" aria-label="peça">'+GL[c.toLowerCase()]+VS+"</button>";
    t+='<button class="apb x" data-t="x" aria-label="apagar">&#10005;</button>'; pal.innerHTML=t;
  }
  for(const b of pal.children)b.setAttribute("aria-pressed",String(b.dataset.t===asTool));
}
function asCenter(i){const k=asFlip?63-i:i; return [(k&7)+.5,(k>>3)+.5];}
function asArrow(uci,col,w){
  const f=asIdx(uci.slice(0,2)),t=asIdx(uci.slice(2,4)); const [x1,y1]=asCenter(f),[x2,y2]=asCenter(t);
  const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,hx=x2-ux*.32,hy=y2-uy*.32;
  return '<line x1="'+x1+'" y1="'+y1+'" x2="'+hx+'" y2="'+hy+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" opacity=".85"/>'+
    '<polygon points="'+x2+","+y2+" "+(hx-uy*.2)+","+(hy+ux*.2)+" "+(hx+uy*.2)+","+(hy-ux*.2)+'" fill="'+col+'" opacity=".95"/>';
}
function asMoveTxt(uci){
  const f=asIdx(uci.slice(0,2)),p=asB[f]; let t=(p?GL[p.toLowerCase()]+VS+" ":"")+uci.slice(0,2)+" → "+uci.slice(2,4);
  if(uci[4])t+=" = "+({q:"Dama",r:"Torre",b:"Bispo",n:"Cavalo"})[uci[4]];
  if(p&&p.toLowerCase()==="k"&&Math.abs((asIdx(uci.slice(2,4))&7)-(f&7))===2)t+=" (roque)";
  return t;
}
function asEvalTxt(l){
  if(l.mate!=null){const m=asTurn==="w"?l.mate:-l.mate; return (m>0?"Brancas dão":"Pretas dão")+" mate em "+Math.abs(l.mate);}
  const v=(asTurn==="w"?l.cp:-l.cp)/100; return (v>0?"+":"")+v.toFixed(2).replace(".",",");
}
function asPaintResult(done){
  const ks=Object.keys(asLines).map(Number).sort((a,b)=>a-b); const top=asLines[1];
  const svg=$("asArrows"); if(svg){svg.innerHTML=ks.slice().reverse().map(k=>asArrow(asLines[k].pv[0],k===1?"#62e0ff":k===2?"#ffd45e":"#ff5c9f",k===1?.2:.12)).join("");}
  if(!top){$("asRes").innerHTML=""; return;}
  const cls=["best","alt","alt"];
  $("asRes").innerHTML='<p class="asinfo">Profundidade '+top.depth+(done?"":" · analisando…")+"</p>"+ks.map((k,j)=>'<div class="asline '+cls[j]+'"><b>'+(k===1?"Melhor":"Opção "+k)+"</b><span>"+asMoveTxt(asLines[k].pv[0])+"</span><em>"+asEvalTxt(asLines[k])+"</em></div>").join("");
}
function asStatus(t){$("asMsg").textContent=t||"";}
function asStop(){asRun++; if(asWk){asWk._on=false; try{asWk.postMessage("stop");}catch(e){}} $("asGo").textContent="Melhor lance"; $("asGo").dataset.run="";}
function asFallback(id){
  asStatus("Usando a IA do jogo (Stockfish não abriu neste aparelho).");
  askRate(asState(),3,3,r=>{
    if(id!==asRun)return; $("asGo").textContent="Melhor lance"; $("asGo").dataset.run="";
    if(!r||!r.length){asStatus("Não consegui analisar."); return;}
    r.sort((a,b)=>b.sc-a.sc); asLines={};
    r.slice(0,3).forEach((x,j)=>{asLines[j+1]={depth:3,cp:x.sc,mate:null,pv:[asSq(x.m.f)+asSq(x.m.t)+(x.m.p||"")]};});
    asPaintResult(true);
  });
}
function asWorker(){
  if(asWkOk===false)return null; if(asWk)return asWk;
  try{
    asWk=new Worker(URL.createObjectURL(new Blob([$("sfsrc").textContent],{type:"text/javascript"})));
    asWk.onerror=()=>{asWkOk=false; asWk=null; if($("asGo").dataset.run)asFallback(asRun);};
    asWk.onmessage=e=>{
      const l=String(e.data||""); const id=asWk&&asWk._id;
      if(l==="uciok"){asWkOk=true; asWk.postMessage("setoption name MultiPV value 3"); asWk.postMessage("isready");}
      else if(l==="readyok"&&asWk._pending){const f=asWk._pending; asWk._pending=null; f();}
      else if(l.startsWith("info")&&l.includes(" pv ")&&id===asRun&&asWk._on){
        const m=l.match(/depth (\d+).*?multipv (\d+) score (cp|mate) (-?\d+).*? pv (.+)$/); if(!m)return;
        asLines[+m[2]]={depth:+m[1],cp:m[3]==="cp"?+m[4]:null,mate:m[3]==="mate"?+m[4]:null,pv:m[5].trim().split(/\s+/)};
        asPaintResult(false);
      }
      else if(l.startsWith("bestmove")&&id===asRun&&asWk._on){asWk._on=false;asPaintResult(true); $("asGo").textContent="Melhor lance"; $("asGo").dataset.run=""; asStatus("");}
    };
    asWk.postMessage("uci");
  }catch(e){asWkOk=false; asWk=null;}
  return asWk;
}
function asAnalyze(){
  const err=asCheck(); if(err){asStatus(err); $("asRes").innerHTML=""; return;}
  asStatus(""); asLines={}; $("asRes").innerHTML=""; const id=++asRun; $("asGo").textContent="Parar"; $("asGo").dataset.run="1";
  const wk=asWorker();
  if(!wk){asFallback(id); return;}
  wk._id=id;
  const start=()=>{wk._on=true; wk.postMessage("ucinewgame"); wk.postMessage("position fen "+asFen()); wk.postMessage("go movetime "+asMs);};
  if(asWkOk){wk._pending=start; wk.postMessage("isready");}
  else wk._pending=start;
  setTimeout(()=>{ if(id===asRun&&$("asGo").dataset.run&&!Object.keys(asLines).length&&!asWkOk){asWkOk=false; try{wk.terminate();}catch(e){} asWk=null; asFallback(id);} },6000);
}
function asEdited(){asStop(); asLines={}; $("asRes").innerHTML=""; asStatus(""); asPaintBoard();}
$("asBoard").onclick=e=>{
  const b=e.target.closest(".asq"); if(!b)return; const i=+b.dataset.i;
  asB[i]=asTool==="x"?null:(asB[i]===asTool?null:asTool); asEdited();
};
$("asPal").onclick=e=>{const b=e.target.closest(".apb"); if(!b)return; asTool=b.dataset.t; asPaintBoard();};
$("asTurnW").onclick=()=>{asTurn="w"; asEdited();};
$("asTurnB").onclick=()=>{asTurn="b"; asEdited();};
$("asStart").onclick=()=>{const s=asParse(AS_START); asB=s.b; asTurn="w"; asEdited();};
$("asClear").onclick=()=>{asB=Array(64).fill(null); asEdited();};
$("asFlip").onclick=()=>{asFlip=!asFlip; asPaintBoard(); asPaintResult(!$("asGo").dataset.run);};
$("asApply").onclick=()=>{const s=asParse($("asFen").value); if(!s){asStatus("FEN inválido."); return;} asB=s.b; asTurn=s.turn; asEdited();};
$("asGo").onclick=()=>{ if($("asGo").dataset.run){asStop(); asPaintResult(true); return;} asAnalyze(); };
$("asTime").onclick=e=>{const b=e.target.closest("button"); if(!b)return; asMs=+b.dataset.ms; for(const x of $("asTime").children)x.setAttribute("aria-pressed",String(x===b));};
$("mAssist").onclick=()=>{unlockAudio(); go("assist"); asPaintBoard();};
{const s=asParse(AS_START); asB=s.b;}
