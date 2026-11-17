/* ===== Interface ===== */
(function(){
const $=id=>document.getElementById(id);
const boardEl=$("board"),piecesEl=$("pieces"),fxEl=$("fx");
const GL={k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟"},VS="︎";
const FILES="abcdefgh";
const JUDGE=[{t:"PERFEITO!",n:"Perfeito",pts:320,c:"var(--ouro)"},{t:"ÓTIMO",n:"Ótimo",pts:160,c:"var(--ok)"},{t:"OK",n:"Ok",pts:80,c:"var(--ciano)"},{t:"ERROU",n:"Erro",pts:0,c:"var(--erro)"}];
const SCALE=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5,1567.98,1760];
const K_HIST="xeque-combo-history-v1",K_MATCH="xeque-combo-match-v3",K_PROF="xeque-combo-profile-v3",K_FR="xeque-combo-friends-v1",K_DAY="xeque-combo-daily-v1";
const ROOM="xequecombo-v3-",DAY=86400000,BEAT=600,TURN_BEATS=16;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const PT={k:"R",q:"D",r:"T",b:"B",n:"C",p:""},NOME={k:"o rei",q:"a dama",r:"a torre",b:"o bispo",n:"o cavalo",p:"o peão"};
const AVC=["#ff3d8b","#3d56d6","#19b38a","#f08a24","#8a5cff","#2b2440"];
const MODES={
 classic:{n:"Clássico",d:"Sem relógio. Pense o quanto quiser.",t:0},
 rapid:{n:"Rápido",d:"10 minutos para cada jogador.",t:600},
 blitz:{n:"Blitz",d:"1 minuto para cada jogador. Não dá tempo de respirar.",t:60},
 osu:{n:"Ritmo",d:"Jogue na batida da música: faça o lance quando o anel fechar no círculo. Cada lance tem 16 batidas; se acabar, sai um lance aleatório.",t:0},
 daily:{n:"Diário",d:"Até 1 dia por lance contra um amigo. Comece pela tela Online e amigos, tocando no amigo.",t:0}
};
const SKINS=[
 {n:"Neon",a:["Rosa","Azul"],v:["#ff86b8","#ff3d8b","#f6efff","#3d56d6","#1c2470","#62e0ff"]},
 {n:"Fogo e Gelo",a:["Fogo","Gelo"],v:["#ffa040","#e2481a","#fff0d0","#6cc4f5","#1f6fc4","#eaffff"]},
 {n:"Floresta",a:["Lima","Roxo"],v:["#9ed63a","#4c9a1c","#f2ffd8","#a06bff","#4a1fa8","#e3d4ff"]},
 {n:"Ouro e Prata",a:["Ouro","Prata"],v:["#f2c84b","#c18a0a","#fff6d6","#aab6c8","#5d6b84","#ffffff"]},
 {n:"Pôr do sol",a:["Sol","Noite"],v:["#ffd36e","#ff6a3d","#fff3d6","#7a4ad8","#2a1a6e","#ffb3e6"]},
 {n:"Oceano",a:["Coral","Mar"],v:["#ff9e8a","#ff5d73","#fff0ed","#2ec4b6","#0b6e86","#c9fff6"]},
 {n:"Sakura",a:["Sakura","Tinta"],v:["#ffc2dc","#ee6fa4","#ffffff","#5b5b7a","#2a2a40","#ffd9ec"]},
 {n:"Monocromo",a:["Branco","Preto"],v:["#f4f4f8","#b9bccb","#ffffff","#3a3a48","#14141c","#8a8aa0"]},
 {n:"Matrix",a:["Verde","Sombra"],v:["#6dff9a","#12a64a","#d8ffe6","#26332c","#0b110d","#6dff9a"]}
];
/* formatos de peça (CSS em body[data-ps]) e extras de perfil */
const PSTY=["Círculo","Hit circle","Slider","Anel","Minimal","Hexágono","Diamante","Pixel","Gel"];
const FRAMES=["Nenhuma","Ouro","Ciano","Neon","Arco-íris","Pulso"];
const BANNERS=["linear-gradient(120deg,rgba(255,92,159,.28),rgba(98,224,255,.22))","linear-gradient(120deg,#ff6a3d,#7a4ad8)","linear-gradient(120deg,#12a64a,#0b6e86)","linear-gradient(120deg,#ffd36e,#ee6fa4)","linear-gradient(120deg,#2a1a6e,#0b110d)","linear-gradient(120deg,#3d56d6,#62e0ff)"];
/* 15 IAs de treino: d = profundidade, noise = imprecisão, blun = chance de lance aleatório, w = gostos */
const BOTS=[
 {n:"Pipoca",pp:200,g:"p",s:"Joga no chute. Às vezes acerta sem querer.",d:1,noise:300,blun:.55,w:{}},
 {n:"Zé Peão",pp:350,g:"p",s:"Só pensa em empurrar peão pra frente.",d:1,noise:160,blun:.3,w:{pawn:90,adv:10}},
 {n:"Faminta",pp:500,g:"q",s:"Come tudo que vê, mesmo quando é armadilha.",d:1,noise:120,blun:.18,w:{cap:160}},
 {n:"Dona Tartaruga",pp:650,g:"r",s:"Fica na defesa e quase não sai de casa.",d:1,noise:90,blun:.1,w:{adv:-22,castle:120}},
 {n:"Cavaleiro Doido",pp:800,g:"n",s:"Apaixonado por cavalos: pula pra todo lado.",d:2,noise:150,blun:.08,w:{knight:70}},
 {n:"Xequinho",pp:950,g:"b",s:"Dá xeque sempre que pode, faça sentido ou não.",d:2,noise:110,blun:.05,w:{chk:140}},
 {n:"Rainha Apressada",pp:1100,g:"q",s:"Sai com a dama cedo e parte pro ataque.",d:2,noise:80,blun:.03,w:{queen:45,king:10}},
 {n:"Troca-Troca",pp:1250,g:"b",s:"Adora trocar peças e simplificar o jogo.",d:2,noise:55,w:{trade:70}},
 {n:"Muralha",pp:1400,g:"r",s:"Sólida. Faz o roque cedo e espera você errar.",d:2,noise:30,w:{castle:90,adv:-5,dev:20}},
 {n:"Tempestade",pp:1550,g:"p",s:"Manda uma avalanche de peões no seu rei.",d:3,noise:70,w:{storm:40,adv:4}},
 {n:"Kamikaze",pp:1700,g:"n",s:"Joga tudo em cima do seu rei, custe o que custar.",d:3,noise:45,w:{king:14,chk:50}},
 {n:"Professor",pp:1850,g:"b",s:"Joga pelo manual: centro, desenvolvimento e roque.",d:3,noise:22,w:{dev:25,castle:60}},
 {n:"Víbora",pp:2000,g:"q",s:"Paciente. Pune qualquer deslize.",d:3,noise:8,w:{}},
 {n:"Relâmpago",pp:2200,g:"n",s:"Tática pura: calcula combinações mais fundo.",d:4,t:900,noise:0,w:{}},
 {n:"Rei Neon",pp:2400,g:"k",s:"O chefão. Pensa mais longe que todo mundo.",d:4,t:2500,noise:0,w:{}}
];

let P={v:3,id:"",name:"Jogador",bio:"",av:{g:"k",c:0,img:null,fr:0},skin:0,ps:0,bn:0,pp:0,placed:false,perfs:[],on:{g:0,w:0,l:0,d:0},accSum:0,accN:0,maxCombo:0,mode:"classic",color:"w",sound:true};
let F={},D={};
let G=null,screen="menu",prevScreen="menu";
let sel=-1,targets=[],busy=false,ratings=null,rateToken=0,aiToken=0,anToken=0,flipTimer=0;
const els=new Map(),sqs=[];

/* ---- utilidades ---- */
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const other=c=>c==="w"?"b":"w";
const sqName=i=>FILES[i&7]+(8-(i>>3));
const same=(a,b)=>a.f===b.f&&a.t===b.t&&(a.p||null)===(b.p||null);
const rid=()=>{const abc="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<8;i++)s+=abc[Math.random()*abc.length|0]; return s;};
const okImg=s=>typeof s==="string"&&s.length<40000&&/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(s);
function cleanAv(a){a=a&&typeof a==="object"?a:{}; return {g:GL[a.g]?a.g:"k",c:(a.c|0)>=0&&(a.c|0)<AVC.length?a.c|0:0,img:okImg(a.img)?a.img:null,fr:(a.fr|0)>0&&(a.fr|0)<FRAMES.length?a.fr|0:0};}
function avH(av,cls){av=cleanAv(av); return '<span class="av '+(av.fr?"fr"+av.fr+" ":"")+(cls||"")+'" style="'+(av.img?"background-image:url("+av.img+")":"background:"+AVC[av.c])+'">'+(av.img?"":GL[av.g]+VS)+"</span>";}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||"null");}catch(e){return null;}}
function lsSet(k,v){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const saveP=()=>lsSet(K_PROF,P),saveF=()=>lsSet(K_FR,F),saveD=()=>lsSet(K_DAY,D);
function saveMatch(){ if(!G||(G.kind!=="bot"&&G.kind!=="local"))return; lsSet(K_MATCH,G.end?null:{kind:G.kind,mode:G.mode,bot:G.bot,my:G.my,spin:G.spin,tl:G.tl,clock:G.clock}); }
function validMatch(d){return d&&Array.isArray(d.tl)&&d.tl.length&&d.tl[0].s&&d.tl[0].ids&&MODES[d.mode]&&(d.kind==="local"||(d.kind==="bot"&&BOTS[d.bot]));}
let toastT=0;
function toast(t){const el=$("toast"); el.textContent=t; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{el.hidden=true;},3200);}
function applySkin(){const v=SKINS[P.skin]?SKINS[P.skin].v:SKINS[0].v,r=document.documentElement.style; ["--p1a","--p1b","--p1r","--p2a","--p2b","--p2r"].forEach((k,i)=>r.setProperty(k,v[i])); document.body.dataset.ps=PSTY[P.ps]?P.ps:0;}
const sideName=c=>(SKINS[P.skin]||SKINS[0]).a[c==="w"?0:1];
const ppTxt=x=>x.placed?x.pp.toLocaleString("pt-BR")+" PP":"Sem PP";

const newStats=()=>({score:0,combo:0,max:0,j:[0,0,0,0]});
function firstPly(){
  const ids=new Array(64).fill(0); let n=1; const s=initial();
  for(let i=0;i<64;i++)if(s.b[i])ids[i]=n++;
  return {s,ids,st:{w:newStats(),b:newStats()},last:null};
}
const cur=()=>G.tl[G.tl.length-1];
const view=()=>G.rv!=null?G.tl[G.rv]:cur();
const mine=c=>G.kind!=="hist"&&(G.kind==="local"||c===G.my);
function nameOf(c){
  if(G.names)return G.names[c];
  if(G.kind==="local")return sideName(c);
  if(c===G.my)return "Você";
  return G.kind==="bot"?BOTS[G.bot].n:(F[G.fid]?F[G.fid].name:"Amigo");
}
/* aplica um lance e devolve a posição seguinte; k = nota (0 a 3) ou null */
function advance(p,m,k){
  const s=p.s,mover=s.turn,w=mover==="w",piece=s.b[m.f],t=piece.toLowerCase();
  const cap=s.b[m.t]||((t==="p"&&m.t===s.ep)?"x":null),ns=make(s,m),ids=p.ids.slice();
  ids[m.t]=ids[m.f]; ids[m.f]=0;
  if(t==="p"&&m.t===s.ep&&!s.b[m.t])ids[m.t+(w?8:-8)]=0;
  if(t==="k"){ if(m.t-m.f===2){ids[m.t-1]=ids[m.t+1];ids[m.t+1]=0;} else if(m.f-m.t===2){ids[m.t+1]=ids[m.t-2];ids[m.t-2]=0;} }
  const st={w:{...p.st.w,j:p.st.w.j.slice()},b:{...p.st.b,j:p.st.b.j.slice()}};
  if(k!=null){
    const me=st[mover]; me.j[k]++;
    if(k===3)me.combo=0;
    else{me.combo++; me.max=Math.max(me.max,me.combo); me.score+=Math.round(JUDGE[k].pts*(1+me.combo/8))+(cap&&cap!=="x"?VAL[cap.toLowerCase()]:cap?100:0);}
  }
  const next={s:ns,ids,st,last:{f:m.f,t:m.t,p:m.p||null},cap:!!cap,k:k==null?null:k};
  const ms=legal(ns); next.chk=inCheck(ns,ns.turn==="w");
  if(!ms.length)next.over=next.chk?"mate":"stale";
  else if(ns.half>=100)next.over="fifty";
  else if(drawnByMaterial(ns))next.over="material";
  return next;
}
const posKey=s=>s.b.map(x=>x||".").join("")+s.turn+s.cast.K+s.cast.Q+s.cast.k+s.cast.q+s.ep;
/* empate quando a mesma posição aparece pela terceira vez */
function repCheck(tl,next){
  const k=next.key=posKey(next.s); let n=1;
  for(const p of tl){ if((p.key||(p.key=posKey(p.s)))===k)n++; }
  if(n>=3&&!next.over)next.over="rep";
}
function buildTl(moves){
  const tl=[firstPly()];
  for(const m of moves){
    const p=tl[tl.length-1]; if(p.over||!m)return null;
    const lm=legal(p.s).find(x=>same(x,m)); if(!lm)return null;
    const nx=advance(p,lm,null); repCheck(tl,nx); tl.push(nx);
  }
  return tl;
}

/* ---- telas ---- */
function go(name){
  if(name==="modes"&&screen!=="modes")prevScreen=screen;
  screen=name; document.body.dataset.screen=name; scrollTo(0,0);
  if(location.protocol==="file:"){try{location.hash=name==="menu"?"menu":"in";}catch(e){}} /* o app usa isso no botão Voltar */
  if(name==="menu")paintMenu();
  if(name==="modes")paintModes();
  if(name==="bots")paintBots();
  if(name==="friends")paintFriends();
  if(name==="profile")paintProfile();
  if(name==="history")paintHistory();
  paintSound();
}
function modeForPlay(){return P.mode==="daily"?"classic":P.mode;}
function paintModeChips(){for(const el of document.querySelectorAll(".modeName"))el.textContent=MODES[modeForPlay()].n;}
function paintMenu(){
  xcPaintMenu(); $("meCard").style.background=BANNERS[P.bn]||BANNERS[0]; $("meAv").innerHTML=avH(P.av); $("meName").textContent=P.name; $("meSub").textContent=P.bio||"Toque para personalizar seu perfil";
  $("mePP").textContent=P.placed?P.pp.toLocaleString("pt-BR")+" PP":"Sem PP";
  $("meRec").textContent=P.placed?P.on.w+"V "+P.on.d+"E "+P.on.l+"D":"Classificação "+P.perfs.length+"/5";
  const sv=lsGet(K_MATCH),ok=validMatch(sv);
  $("mResume").hidden=!ok;
  if(ok)$("mResumeTxt").textContent=(sv.kind==="bot"?"Treino contra "+BOTS[sv.bot].n:"2 jogadores no mesmo celular")+" · "+MODES[sv.mode].n;
  $("mOnline").classList.toggle("main",!ok);
  $("mModeTxt").textContent="Agora: "+MODES[P.mode].n+". Rápido, Blitz, Ritmo, Diário…";
}
function paintModes(){
  $("modeList").innerHTML=Object.keys(MODES).map(k=>'<button class="mode" data-m="'+k+'" aria-pressed="'+(P.mode===k)+'"><b>'+MODES[k].n+"</b><small>"+MODES[k].d+"</small></button>").join("");
}
$("modeList").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.mode=b.dataset.m; saveP(); paintModes(); tone(660,.08,"triangle",.12);};
function paintBots(){
  paintModeChips();
  for(const b of $("colorSeg").children)b.setAttribute("aria-pressed",String(b.dataset.v===P.color));
  $("rows").innerHTML=BOTS.map((b,i)=>'<button class="row" data-bot="'+i+'"><span class="pos">'+(i+1)+'</span><span class="av" style="background:'+AVC[1]+'">'+GL[b.g]+VS+'</span><span class="info"><b>'+b.n+"</b><small>"+b.s+'</small></span><span class="pp">'+b.pp+"<small>força</small></span></button>").join("");
}
$("rows").onclick=e=>{
  const r=e.target.closest("button.row"); if(!r)return; unlockAudio(); tone(660,.1,"triangle",.14);
  startMatch({kind:"bot",bot:+r.dataset.bot,my:P.color==="r"?(Math.random()<.5?"w":"b"):P.color,mode:modeForPlay()});
};
$("colorSeg").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.color=b.dataset.v; saveP(); paintBots();};
$("mBots").onclick=()=>{unlockAudio();go("bots");};
$("mLocal").onclick=()=>{unlockAudio();startMatch({kind:"local",my:"w",spin:true,mode:modeForPlay()});};
$("mOnline").onclick=()=>{unlockAudio();go("friends");};
$("mHist").onclick=()=>{unlockAudio();go("history");};
$("mModes").onclick=()=>{unlockAudio();go("modes");};
$("meCard").onclick=()=>{unlockAudio();go("profile");};
$("mResume").onclick=()=>{
  const sv=lsGet(K_MATCH); if(!validMatch(sv)){paintMenu();return;}
  unlockAudio(); resetTurnState(); G=Object.assign({bot:-1,done:false,end:null,rv:null,an:null},sv); enterGame();
};
for(const b of document.querySelectorAll("[data-back]"))b.onclick=()=>backAction();
for(const b of document.querySelectorAll("[data-modes]"))b.onclick=()=>go("modes");
for(const b of document.querySelectorAll(".snd"))b.onclick=()=>{P.sound=!P.sound; if(P.sound){unlockAudio();tone(784,.1,"triangle",.14);}else stopMusic(); saveP(); paintSound();};
function paintSound(){for(const b of document.querySelectorAll(".snd"))b.setAttribute("aria-pressed",String(P.sound));}

/* ---- perfil ---- */
function paintProfile(){
  $("pAv").innerHTML=avH(P.av,"big");
  if(document.activeElement!==$("pName"))$("pName").value=P.name;
  if(document.activeElement!==$("pBio"))$("pBio").value=P.bio;
  $("pNoPhoto").hidden=!P.av.img; $("pAdj").hidden=!P.av.img;
  $("pGl").innerHTML="kqrbnp".split("").map(g=>'<button data-g="'+g+'" aria-pressed="'+(!P.av.img&&P.av.g===g)+'" aria-label="Avatar '+NOME[g].slice(2)+'">'+GL[g]+VS+"</button>").join("");
  $("pCol").innerHTML=AVC.map((c,i)=>'<button data-c="'+i+'" aria-pressed="'+(P.av.c===i)+'" style="background:'+c+'" aria-label="Cor '+(i+1)+'"></button>').join("");
  $("pSkin").innerHTML=SKINS.map((s,i)=>'<button data-s="'+i+'" aria-pressed="'+(P.skin===i)+'"><i style="background:'+s.v[1]+'"></i><i style="background:'+s.v[4]+'"></i>'+s.n+"</button>").join("");
  $("pFrame").innerHTML=FRAMES.map((n,i)=>'<button data-f="'+i+'" aria-pressed="'+((P.av.fr|0)===i)+'" aria-label="Moldura '+n+'"><span class="av fr'+i+'" style="width:30px;height:30px;border-width:2px;background:'+AVC[P.av.c]+'"></span></button>').join("");
  $("pBanner").innerHTML=BANNERS.map((g,i)=>'<button data-b="'+i+'" aria-pressed="'+(P.bn===i)+'" style="background:'+g+'" aria-label="Fundo '+(i+1)+'"></button>').join("");
  $("pStyle").innerHTML=PSTY.map((n,i)=>'<button data-p="'+i+'" aria-pressed="'+(P.ps===i)+'"><span class="pvw"><span class="pv" data-ps="'+i+'"><span class="pc"><span>'+GL.k+VS+'</span></span><span class="pc b"><span>'+GL.q+VS+"</span></span></span></span>"+n+"</button>").join("");
  xcPaintProfile();
  const acc=P.accN?Math.round(P.accSum/P.accN*100)+"%":"—";
  const rows=[["PP",P.placed?P.pp:"—"],["Classificação",P.placed?"Concluída":P.perfs.length+"/5"],["Partidas online",P.on.g],["Vitórias",P.on.w],["Empates",P.on.d],["Derrotas",P.on.l],["Precisão média",acc],["Maior combo",P.maxCombo+"x"]];
  $("pStats").innerHTML=rows.map(r=>"<div><span>"+r[0]+"</span><b>"+r[1]+"</b></div>").join("");
}
function profileChanged(){saveP(); paintProfile(); broadcastHello();}
$("pName").oninput=e=>{P.name=e.target.value.trim().slice(0,16)||"Jogador"; saveP();};
$("pName").onchange=()=>profileChanged();
$("pBio").oninput=e=>{P.bio=e.target.value.trim().slice(0,48); saveP();};
$("pBio").onchange=()=>profileChanged();
$("pGl").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.av.g=b.dataset.g; P.av.img=null; profileChanged();};
$("pCol").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.av.c=+b.dataset.c; profileChanged();};
$("pSkin").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.skin=+b.dataset.s; applySkin(); profileChanged();};
$("pFrame").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.av.fr=+b.dataset.f; profileChanged();};
$("pBanner").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.bn=+b.dataset.b; profileChanged(); paintMenu();};
$("pStyle").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.ps=+b.dataset.p; applySkin(); profileChanged();};
$("pNoPhoto").onclick=()=>{P.av.img=null; profileChanged();};
/* ---- editor de foto: mover, zoom, girar, espelhar e recortar ---- */
const CR={img:null,rot:0,flip:false,z:1,ox:0,oy:0,srcFull:null},cv=$("cropCv"),cc=cv.getContext("2d"),CN=cv.width;
function crDims(){const r=CR.rot&1,w=r?CR.img.height:CR.img.width,h=r?CR.img.width:CR.img.height,k=CN/Math.min(w,h)*CR.z; return {k,dw:w*k,dh:h*k};}
function crClamp(){const d=crDims(),mx=Math.max(0,(d.dw-CN)/2),my=Math.max(0,(d.dh-CN)/2); CR.ox=Math.max(-mx,Math.min(mx,CR.ox)); CR.oy=Math.max(-my,Math.min(my,CR.oy));}
function crDraw(){
  if(!CR.img)return; crClamp(); const d=crDims();
  cc.fillStyle="#150d2b"; cc.fillRect(0,0,CN,CN); cc.save();
  cc.translate(CN/2+CR.ox,CN/2+CR.oy); cc.rotate(CR.rot*Math.PI/2); if(CR.flip)cc.scale(-1,1); cc.scale(d.k,d.k);
  cc.drawImage(CR.img,-CR.img.width/2,-CR.img.height/2); cc.restore();
}
function crOpen(img){CR.img=img; CR.rot=0; CR.flip=false; CR.z=1; CR.ox=CR.oy=0; $("cropZoom").value=100; $("crop").hidden=false; crDraw();}
function crLoad(src,revoke){
  const img=new Image();
  img.onload=()=>{if(revoke)URL.revokeObjectURL(src); crOpen(img);};
  img.onerror=()=>{if(revoke)URL.revokeObjectURL(src); toast("Esse arquivo não é uma imagem que eu consiga abrir.");};
  img.src=src;
}
$("fileIn").onchange=e=>{const f=e.target.files&&e.target.files[0]; e.target.value=""; if(f)crLoad(URL.createObjectURL(f),true);};
$("pAdj").onclick=()=>{if(CR.srcFull)crOpen(CR.srcFull); else if(P.av.img)crLoad(P.av.img,false);};
$("cropZoom").oninput=e=>{CR.z=e.target.value/100; crDraw();};
$("cropRot").onclick=()=>{CR.rot=(CR.rot+1)&3; CR.ox=CR.oy=0; crDraw();};
$("cropFlip").onclick=()=>{CR.flip=!CR.flip; crDraw();};
$("cropReset").onclick=()=>{CR.z=1; CR.ox=CR.oy=0; $("cropZoom").value=100; crDraw();};
$("cropNo").onclick=()=>{$("crop").hidden=true;};
$("cropOk").onclick=()=>{
  try{
    const o=document.createElement("canvas"),S=128; o.width=o.height=S; o.getContext("2d").drawImage(cv,0,0,CN,CN,0,0,S,S);
    let d="",q=.85; do{d=o.toDataURL("image/jpeg",q); q-=.1;}while(!okImg(d)&&q>.2);
    if(okImg(d)){CR.srcFull=CR.img; P.av.img=d; $("crop").hidden=true; profileChanged();} else toast("Não deu para usar essa imagem.");
  }catch(x){toast("Não deu para usar essa imagem.");}
};
(function(){ /* arrastar com 1 dedo, pinça com 2, roda do mouse */
  const box=$("cropBox"),pts=new Map(); let last=null;
  const k=()=>CN/box.getBoundingClientRect().width;
  const dist=()=>{const a=[...pts.values()]; return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
  const setZ=z=>{CR.z=Math.max(1,Math.min(4,z)); $("cropZoom").value=Math.round(CR.z*100);};
  box.onpointerdown=e=>{box.setPointerCapture(e.pointerId); pts.set(e.pointerId,{x:e.clientX,y:e.clientY}); last=pts.size===2?dist():null;};
  box.onpointermove=e=>{
    const p=pts.get(e.pointerId); if(!p)return; const dx=e.clientX-p.x,dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
    if(pts.size===1){CR.ox+=dx*k(); CR.oy+=dy*k();}
    else if(pts.size===2){const d=dist(); if(last)setZ(CR.z*d/last); last=d; CR.ox+=dx*k()/2; CR.oy+=dy*k()/2;}
    crDraw();
  };
  const up=e=>{pts.delete(e.pointerId); last=pts.size===2?dist():null;};
  box.onpointerup=up; box.onpointercancel=up;
  box.onwheel=e=>{e.preventDefault(); setZ(CR.z*(e.deltaY<0?1.08:.93)); crDraw();};
})();

/* ---- caixa de pergunta ---- */
function ask(title,text,yes,no,onYes,onNo){
  $("askTitle").textContent=title; $("askText").textContent=text; $("askYes").textContent=yes; $("askProg").hidden=true;
  $("askNo").textContent=no||""; $("askNo").hidden=!no; $("ask").hidden=false;
  $("askYes").onclick=()=>{$("ask").hidden=true; onYes&&onYes();};
  $("askNo").onclick=()=>{$("ask").hidden=true; onNo&&onNo();};
}

/* ---- tabuleiro ---- */
for(let i=0;i<64;i++){
  const r=i>>3,c=i&7,b=document.createElement("button");
  b.className="sq"+((r+c)%2===0?" l":""); b.dataset.i=i;
  b.setAttribute("aria-label",FILES[c]+(8-r));
  if(r===7)b.insertAdjacentHTML("beforeend",'<i class="f">'+FILES[c]+"</i>");
  if(c===0)b.insertAdjacentHTML("beforeend",'<i class="r">'+(8-r)+"</i>");
  boardEl.insertBefore(b,piecesEl); sqs.push(b);
}
const canMove=()=>G&&!busy&&!G.end&&G.rv==null&&mine(cur().s.turn);
boardEl.addEventListener("click",e=>{ if(noClick){noClick=false;return;} const b=e.target.closest(".sq"); if(b)tap(+b.dataset.i);});
function tap(i){
  if(!canMove())return;
  const s=cur().s; unlockAudio();
  const hit=targets.filter(m=>m.t===i);
  if(sel>=0&&hit.length){
    if(hit.length>1){const k=beatJudge(); askPromo(s.turn,pc=>mineMove(hit.find(m=>m.p===pc),k));}
    else mineMove(hit[0]);
    return;
  }
  const pc=s.b[i];
  if(pc&&((pc<"a")===(s.turn==="w"))&&i!==sel){sel=i; targets=legal(s).filter(m=>m.f===i); tone(440,.05,"sine",.08);}
  else{sel=-1;targets=[];}
  paintMarks();
}
function mineMove(m,k){
  if(!canMove()||!m)return;
  if(k==null&&G.mode==="osu")k=beatJudge();
  if(G.kind==="online")sendF(G.fid,{t:"move",gid:G.gid,m:{f:m.f,t:m.t,p:m.p||null},n:G.tl.length,clk:G.clock?Math.round(G.clock[G.my]):null});
  play(m,true,k);
  if(G&&G.kind==="daily")dailyAfterMine();
}
function askPromo(turn,cb){
  const sh=$("promo"),row=$("promoRow"); row.className="promo-row "+turn; sh.hidden=false;
  row.onclick=e=>{const b=e.target.closest("button"); if(!b)return; sh.hidden=true; row.onclick=null; cb(b.dataset.p);};
}
/* arrastar a peça com o dedo (tocar e tocar continua funcionando) */
let drag=null,noClick=false;
function sqAt(e){
  const r=boardEl.getBoundingClientRect(); let x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  if(boardEl.classList.contains("flip")){x=1-x;y=1-y;}
  return {x:Math.min(Math.max(x,.02),.98),y:Math.min(Math.max(y,.02),.98),i:(x<0||x>=1||y<0||y>=1)?-1:Math.floor(y*8)*8+Math.floor(x*8)};
}
function dragHome(d){ if(d.el){d.el.classList.remove("drag"); d.el.style.left=(d.i&7)*12.5+"%"; d.el.style.top=(d.i>>3)*12.5+"%";} }
boardEl.addEventListener("pointerdown",e=>{
  noClick=false; drag=null;
  if(!canMove()||e.button>0)return;
  const s=cur().s,q=sqAt(e); if(q.i<0)return;
  const pc=s.b[q.i]; if(!pc||((pc<"a")!==(s.turn==="w")))return;
  drag={i:q.i,x0:e.clientX,y0:e.clientY,on:false,id:e.pointerId,el:null};
});
boardEl.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.on){
    if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<8)return;
    if(!canMove()){drag=null;return;}
    drag.on=true; sel=drag.i; targets=legal(cur().s).filter(m=>m.f===sel); paintMarks();
    drag.el=els.get(cur().ids[sel]); if(!drag.el){drag=null;return;}
    drag.el.classList.add("drag");
    try{boardEl.setPointerCapture(e.pointerId);}catch(x){}
  }
  const q=sqAt(e); drag.el.style.left=(q.x*100-6.25)+"%"; drag.el.style.top=(q.y*100-6.25)+"%";
});
function dragEnd(e,cancel){
  if(!drag||e.pointerId!==drag.id)return;
  const d=drag; drag=null; if(!d.on)return;
  noClick=true; setTimeout(()=>{noClick=false;},400);
  unlockAudio();
  const q=sqAt(e),hit=cancel||!canMove()?[]:targets.filter(m=>m.t===q.i);
  if(hit.length>1){dragHome(d); const k=beatJudge(); askPromo(cur().s.turn,pc=>mineMove(hit.find(m=>m.p===pc),k));}
  else if(hit.length){d.el.classList.remove("drag"); mineMove(hit[0]);}
  else{dragHome(d); if(q.i!==d.i){sel=-1;targets=[];} if(G)paintMarks();}
}
boardEl.addEventListener("pointerup",e=>dragEnd(e,false));
boardEl.addEventListener("pointercancel",e=>dragEnd(e,true));

/* ---- partida ---- */
function resetTurnState(){aiToken++;rateToken++;busy=false;sel=-1;targets=[];ratings=null;clearTimeout(flipTimer);drag=null;}
function startMatch(cfg){
  resetTurnState();
  const mode=MODES[cfg.mode]?cfg.mode:"classic",t=MODES[mode].t*1000;
  G={kind:cfg.kind,mode,bot:cfg.bot==null?-1:cfg.bot,my:cfg.my||"w",fid:cfg.fid||null,gid:cfg.gid||null,spin:cfg.spin!==false,
     tl:cfg.tl||[firstPly()],clock:t&&cfg.kind!=="hist"?{w:t,b:t}:null,done:false,end:cfg.end||null,rv:null,an:null,names:cfg.names||null};
  enterGame();
}
function enterGame(){
  for(const id of ["end","ask","promo","fsheet","chat"])$(id).hidden=true;
  $("chatBtn").classList.remove("new");
  document.body.classList.remove("rv"); $("review").hidden=true;
  G.b0=performance.now()+400; lastTick=performance.now();
  go("game"); render(true); saveMatch(); setBeatFx();
  if(G.end){ if(G.rv==null)showEnd(); } else afterMove();
}
/* ritmo: distância até a batida mais próxima vira nota */
const nextBeat=t=>G.b0+Math.ceil((t-G.b0)/BEAT)*BEAT;
function beatJudge(){
  if(!G||G.mode!=="osu")return null;
  const ph=(((performance.now()-G.b0)%BEAT)+BEAT)%BEAT,d=Math.min(ph,BEAT-ph);
  return d<=65?0:d<=125?1:d<=195?2:3;
}
function setBeatFx(){
  const w=$("wrap"),osu=G&&G.mode==="osu";
  if(osu&&!reduce){const ph=(((performance.now()-G.b0)%BEAT)+BEAT)%BEAT; w.style.animation="beat "+BEAT+"ms ease-in-out -"+Math.round(ph)+"ms infinite";}
  else w.style.animation="";
  $("turnbar").hidden=!osu;
}
function play(m,byMe,k){
  const p=cur(),s=p.s,mover=s.turn,w=mover==="w";
  if(byMe&&k==null){
    const list=(ratings&&ratings.s===s)?ratings.list:rateMoves(s,2);
    let best=-Infinity,my=-Infinity;
    for(const x of list){if(x.sc>best)best=x.sc; if(same(x.m,m))my=x.sc;}
    const d=best-my; k=d<=20?0:d<=70?1:d<=180?2:3;
  }
  const next=advance(p,m,byMe?k:null),jd=byMe?JUDGE[k]:null;
  repCheck(G.tl,next); G.tl.push(next); G.an=null; sel=-1; targets=[]; ratings=null;
  render(false);
  burst(m.t,next.cap?"var(--ouro)":(w?"var(--p1b)":"var(--p2r)"),next.cap?12:6);
  if(jd){floatText(m.t,jd.t,jd.c); const cb=$("combo"); cb.classList.remove("pop"); void cb.offsetWidth; cb.classList.add("pop");}
  sfxMove(byMe,jd,next,mover);
  if(next.over)endGame({type:next.over,winner:next.over==="mate"?mover:null});
  else{saveMatch(); afterMove();}
}
/* resultado do meu ponto de vista: 1 vitória, .5 empate, 0 derrota */
function resultFor(){ const e=G.end; if(!e||!e.winner)return .5; return G.kind==="local"?1:(e.winner===G.my?1:0); }
function endGame(end){
  if(!G||G.end)return;
  if(G.kind==="puzzle"){puzEnd(end);return;}
  G.end=end; aiToken++; rateToken++; busy=false; sel=-1; targets=[]; $("promo").hidden=true; stopMusic();
  if(net.drawIn){net.drawIn=false; $("ask").hidden=true;}
  const r=resultFor(); settle(r); xcAfterGame(r);
  if(G.kind==="daily")dailyFinish();
  saveHist();
  saveMatch(); fanfare(r); render(false);
  setTimeout(()=>{ if(G&&G.end===end&&screen==="game"&&G.rv==null)showEnd(); },reduce?50:900);
}
/* PP: só partidas online. As 5 primeiras são a classificação; depois sobe e desce por resultado e precisão. */
function settle(r){
  const st=cur().st[G.kind==="local"?"w":G.my]; P.maxCombo=Math.max(P.maxCombo,st.max,cur().st.b.max*(G.kind==="local"?1:0));
  if(G.kind!=="online"||G.done){saveP();return;}
  G.done=true; const acc=accOf(st)/100,o=F[G.fid]||{};
  P.on.g++; if(r===1)P.on.w++; else if(r===0)P.on.l++; else P.on.d++;
  P.accSum+=acc; P.accN++;
  if(!P.placed){
    P.perfs.push(Math.round(1200*(.6*r+.4*acc))); G.ppInfo={placing:P.perfs.length};
    if(P.perfs.length>=5){P.placed=true; P.pp=Math.round(P.perfs.reduce((a,b)=>a+b,0)/P.perfs.length); G.ppInfo={before:0,after:P.pp,first:true};}
  }else{
    const opp=o.placed?o.pp:P.pp,E=1/(1+Math.pow(10,(opp-P.pp)/400)),before=P.pp;
    P.pp=Math.max(0,Math.round(P.pp+32*(r-E)+12*(acc-.6))); G.ppInfo={before,after:P.pp};
  }
  saveP(); broadcastHello();
}
function afterMove(){
  if(!G||G.end)return; const s=cur().s;
  if(G.kind==="puzzle"){puzAfter();return;}
  if(G.mode==="osu"&&mine(s.turn))G.dead=nextBeat(performance.now())+TURN_BEATS*BEAT;
  if(G.kind==="bot"&&s.turn!==G.my){
    busy=true; setStatus();
    const tk=++aiToken,t0=performance.now();
    askBot(s,BOTS[G.bot],m=>{
      let wait=Math.max(0,(reduce?0:480)-(performance.now()-t0));
      if(G&&G.mode==="osu")wait=nextBeat(performance.now()+wait)-performance.now();
      setTimeout(()=>{ if(tk!==aiToken||!G||G.end)return; busy=false; if(m)play(m,false); },wait);
    });
  }else if(mine(s.turn)&&G.mode!=="osu"){
    const tk=++rateToken;
    askRate(s,3,2,list=>{ if(tk!==rateToken||!G||G.end||cur().s!==s||!list)return; ratings={s,list}; });
  }
}
/* relógios, tempo do lance no modo Ritmo e prazo do Diário */
let lastTick=performance.now();
function fmt(ms){ms=Math.max(0,ms); const s=ms/1000; return ms<10000?"0:0"+s.toFixed(1):Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");}
function paintClocks(){
  const bottom=boardEl.classList.contains("flip")?"b":"w";
  for(const [el,c] of [[$("sideB"),bottom],[$("sideT"),other(bottom)]]){
    const k=el.querySelector(".clk"); k.hidden=!G.clock; if(G.clock){k.textContent=fmt(G.clock[c]); k.classList.toggle("low",G.clock[c]<10000);}
  }
}
setInterval(()=>{
  const now=performance.now(),dt=now-lastTick; lastTick=now;
  if(!G||screen!=="game"||G.end||G.rv!=null)return;
  const c=cur().s.turn;
  if(G.clock&&G.tl.length>1){
    G.clock[c]-=dt; paintClocks();
    if(G.clock[c]<=0&&(G.kind!=="online"||c===G.my||G.clock[c]<-4000)){
      if(G.kind==="online")sendF(G.fid,{t:"flag",gid:G.gid,loser:c});
      endGame({type:"time",winner:other(c)}); return;
    }
  }
  if(G.mode==="osu"){
    musicTick();
    const bar=$("turnbar").firstChild;
    if(mine(c)&&!busy&&G.dead){
      bar.style.transform="scaleX("+Math.max(0,Math.min(1,(G.dead-now)/(TURN_BEATS*BEAT))).toFixed(3)+")";
      if(now>G.dead){const ms=legal(cur().s); $("promo").hidden=true; if(drag&&drag.on)dragHome(drag); drag=null; mineMove(ms[Math.random()*ms.length|0],3);}
    }else bar.style.transform="scaleX(1)";
  }
  if(G.kind==="daily"){const d=D[G.fid]; if(d&&!d.over&&Date.now()-d.ts>DAY)endGame({type:"time",winner:other(c)}); else if((now|0)%3000<120)setStatus();}
},100);

/* ---- IA e análise num Worker (não trava a tela) ---- */
let worker=null,jobId=0; const jobs={};
function runLocal(job){setTimeout(()=>{let r=null; try{r=job.kind==="rate"?rateMoves(job.s,job.dl||job.d||2):pickBot(job.s,job.bot);}catch(e){} job.cb(r);},20);}
try{
  const src=$("engine").textContent+"\nonmessage=function(e){var d=e.data,r=null;try{r=d.kind==='rate'?rateMoves(d.s,d.d||2):pickBot(d.s,d.bot)}catch(x){}postMessage({id:d.id,r:r})};";
  worker=new Worker(URL.createObjectURL(new Blob([src],{type:"text/javascript"})));
  worker.onmessage=e=>{const j=jobs[e.data.id]; if(j){delete jobs[e.data.id]; j.cb(e.data.r);}};
  worker.onerror=()=>{worker=null; for(const k in jobs){const j=jobs[k]; delete jobs[k]; runLocal(j);}};
}catch(e){worker=null;}
function askWorker(job){
  if(worker){
    const id=++jobId; jobs[id]=job;
    try{worker.postMessage({id,kind:job.kind,s:job.s,bot:job.bot||null,d:job.d||2});}catch(e){delete jobs[id]; runLocal(job); return;}
    /* se o Worker não responder (alguns aparelhos bloqueiam), calcula aqui mesmo */
    setTimeout(()=>{ if(jobs[id]){delete jobs[id]; worker=null; runLocal(job);} },(job.bot&&job.bot.t||0)+5000);
  }else runLocal(job);
}
const askBot=(s,bot,cb)=>askWorker({kind:"bot",s,bot,cb});
const askRate=(s,d,dl,cb)=>askWorker({kind:"rate",s,d,dl,cb});

/* ---- desenho ---- */
function wantFlip(){
  if(G.kind==="local"){ if(!G.spin||G.rv!=null)return false; return G.end?boardEl.classList.contains("flip"):cur().s.turn==="b"; }
  return G.my==="b";
}
function render(instant){
  const p=view(),s=p.s,seen=new Set();
  for(let i=0;i<64;i++){
    const id=p.ids[i]; if(!id)continue; seen.add(id);
    let el=els.get(id);
    if(!el){el=document.createElement("div"); el.innerHTML="<span></span>"; piecesEl.appendChild(el); els.set(id,el);}
    const pc=s.b[i];
    if(el.dataset.pc!==pc){el.dataset.pc=pc; el.firstChild.textContent=GL[pc.toLowerCase()]+VS;}
    el.className="pc "+(pc<"a"?"w":"b"); el.style.left=(i&7)*12.5+"%"; el.style.top=(i>>3)*12.5+"%";
  }
  for(const[id,el]of els){ if(!seen.has(id)){els.delete(id); el.classList.add("gone"); setTimeout(()=>el.remove(),240);} }
  clearTimeout(flipTimer);
  const f=wantFlip(),setFlip=()=>{boardEl.classList.toggle("flip",f); if(G){paintSides();paintClocks();}};
  if(instant||reduce||G.kind!=="local")setFlip(); else flipTimer=setTimeout(setFlip,420);
  paintMarks(); hud(); paintSides(); paintClocks(); setStatus();
}
function paintMarks(){
  const p=view(),s=p.s,kingSq=p.chk?s.b.indexOf(s.turn==="w"?"K":"k"):-1;
  if(G.mode==="osu"&&!reduce){const ph=(((performance.now()-G.b0)%BEAT)+BEAT)%BEAT; boardEl.style.setProperty("--ad",BEAT+"ms"); boardEl.style.setProperty("--dl","-"+Math.round(ph)+"ms");}
  else{boardEl.style.removeProperty("--ad"); boardEl.style.removeProperty("--dl");}
  for(let i=0;i<64;i++){
    const c=sqs[i].classList;
    c.toggle("sel",i===sel);
    c.toggle("last",!!p.last&&(p.last.f===i||p.last.t===i));
    c.toggle("chk",i===kingSq);
    const t=targets.some(m=>m.t===i),occ=!!s.b[i]||(t&&i===s.ep&&sel>=0&&s.b[sel]&&s.b[sel].toLowerCase()==="p");
    c.toggle("tgt",t&&!occ); c.toggle("cap",t&&occ);
  }
  for(const[,el]of els)el.classList.remove("sel");
  if(sel>=0){const el=els.get(p.ids[sel]); if(el)el.classList.add("sel");}
}
function accOf(st){const n=st.j[0]+st.j[1]+st.j[2]+st.j[3]; return n?Math.round((st.j[0]+st.j[1]*.66+st.j[2]*.33)/n*100):100;}
function hudSide(){ if(G.kind!=="local")return G.my; const p=cur(); return p.last?other(p.s.turn):"w"; }
function hud(){
  const p=cur(),side=hudSide(),st=p.st[side],M=MODES[G.mode];
  $("scoreLbl").textContent=G.kind==="local"?"Pontos · "+nameOf(side):"Pontos";
  $("score").textContent=st.score.toLocaleString("pt-BR");
  $("acc").textContent=accOf(st)+"%";
  $("combo").textContent=st.combo+"x";
  $("gTitle").textContent=G.kind==="hist"?"Partida salva":G.kind==="bot"?BOTS[G.bot].n:G.kind==="local"?"2 jogadores":nameOf(other(G.my));
  const tag=$("gTag"); tag.textContent=G.kind==="online"?"Vale PP · "+M.n:M.n; tag.className="tag"+(G.kind==="online"?"":" cool");
  const canUndo=(G.kind==="bot"||G.kind==="local")&&G.mode==="classic";
  $("undoBtn").hidden=!canUndo; $("undoBtn").disabled=G.tl.length<2||!!G.end;
  $("chatBtn").hidden=G.kind!=="online"&&G.kind!=="daily";
  $("drawBtn").hidden=G.kind!=="online"; $("drawBtn").disabled=!!G.end||!!G.drawSent;
  $("resignBtn").hidden=G.kind==="hist"; $("resignBtn").disabled=!!G.end;
  $("spinBtn").hidden=G.kind!=="local"; $("spinBtn").textContent="Girar: "+(G.spin?"ligado":"desligado");
  $("gHint").textContent=G.kind==="hist"?"Partida do seu histórico. Use Analisar partida para rever os lances.":(G.mode==="osu"?"Faça o lance quando o anel fechar no círculo: a nota vem do seu ritmo. "
    :G.kind==="online"?"Vale PP: resultado e precisão contam. Sair no meio é derrota. "
    :G.kind==="daily"?"Partida diária: até 1 dia por lance. O lance é entregue quando vocês dois estiverem com o app aberto. "
    :G.kind==="bot"?"Treino: não muda seu PP. ":"Cada jogador ganha nota pelos seus lances. ")+"Toque ou arraste as peças. Roque: mova o rei duas casas para o lado.";
  if(G.kind==="puzzle")xcPuzHud();
}
function paintSides(){
  const p=view(),bottom=boardEl.classList.contains("flip")?"b":"w";
  const start={p:8,n:2,b:2,r:2,q:1},cnt={w:{},b:{}};
  for(const x of p.s.b){ if(!x)continue; const t=x.toLowerCase(),c=x<"a"?"w":"b"; cnt[c][t]=(cnt[c][t]||0)+1; }
  const lost=c=>"qrbnp".split("").map(t=>(GL[t]+VS).repeat(Math.max(0,start[t]-(cnt[c][t]||0)))).join("");
  const fill=(el,c)=>{
    el.querySelector(".dot").className="dot "+c; el.querySelector(".who").textContent=nameOf(c);
    el.querySelector(".lost").textContent=lost(other(c)); el.classList.toggle("turn",!G.end&&G.rv==null&&p.s.turn===c);
  };
  fill($("sideB"),bottom); fill($("sideT"),other(bottom));
}
function endText(){
  const e=G.end,wn=e.winner?nameOf(e.winner):"";
  const won=wn==="Você"?"Você venceu":wn+" venceu";
  if(e.type==="mate")return "Xeque-mate! "+won;
  if(e.type==="time")return "Tempo esgotado. "+won;
  if(e.type==="resign"){const lo=nameOf(other(e.winner)); return lo==="Você"?"Você desistiu":lo+" desistiu. "+won;}
  if(e.type==="left")return e.winner===G.my?"Seu amigo saiu. Vitória por abandono":"Você saiu da partida";
  return {stale:"Empate por afogamento",fifty:"Empate pela regra dos 50 lances",material:"Empate: faltam peças para dar mate",rep:"Empate por repetição de posição",agreed:"Empate por acordo"}[e.type]||"Empate";
}
function setStatus(){
  if(!G)return; const p=cur(),s=p.s,el=$("status"); let t="",hot=false;
  if(G.end){t=endText()+".";hot=!!G.end.winner;}
  else if(!mine(s.turn)){
    if(G.kind==="bot")t=nameOf(s.turn)+" está pensando…";
    else if(G.kind==="daily"){const d=D[G.fid]; t="Vez de "+nameOf(s.turn)+"."+(d?" Prazo: "+left(d.ts):"");}
    else t="Vez de "+nameOf(s.turn)+"…";
  }
  else if(p.chk){t="Xeque! "+(G.kind==="local"?"Vez de "+nameOf(s.turn)+".":"Proteja seu rei.");hot=true;}
  else t=(G.kind==="local"?"Vez de "+nameOf(s.turn)+".":"Sua vez.")+(G.kind==="daily"&&D[G.fid]?" Prazo: "+left(D[G.fid].ts):"");
  el.textContent=t; el.classList.toggle("hot",hot);
}
function left(ts){const ms=Math.max(0,ts+DAY-Date.now()),h=Math.floor(ms/3600000); return h>=1?h+" h":Math.max(1,Math.floor(ms/60000))+" min";}

/* ---- efeitos ---- */
function burst(i,c,n){
  if(reduce)return; const x=(i&7)*12.5,y=(i>>3)*12.5;
  const r=document.createElement("div"); r.className="ring"; r.style.cssText="left:"+x+"%;top:"+y+"%;--c:"+c;
  fxEl.appendChild(r); r.addEventListener("animationend",()=>r.remove());
  for(let k=0;k<n;k++){
    const a=Math.PI*2*k/n+Math.random()*.5,d=9+Math.random()*9,sp=document.createElement("div");
    sp.className="spark"; sp.style.cssText="left:"+(x+5.3)+"%;top:"+(y+5.3)+"%;--c:"+c+";--dx:"+(Math.cos(a)*d).toFixed(1)+"cqw;--dy:"+(Math.sin(a)*d).toFixed(1)+"cqw";
    fxEl.appendChild(sp); sp.addEventListener("animationend",()=>sp.remove());
  }
}
function floatText(i,txt,c){
  const x=(i&7)*12.5+6.25,y=(i>>3)*12.5+6.25,w=document.createElement("div"); w.className="jw";
  w.style.cssText="left:"+Math.min(Math.max(x,18),82)+"%;top:"+Math.min(Math.max(y,14),86)+"%";
  w.innerHTML='<div class="judge" style="--c:'+c+'">'+txt+"</div>";
  fxEl.appendChild(w); setTimeout(()=>w.remove(),900);
}

/* ---- som e música do modo Ritmo ---- */
let ac=null;
function unlockAudio(){ if(!P.sound)return; try{ac=ac||new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==="suspended")ac.resume();}catch(e){ac=null;} }
function toneAt(f,dur,type,vol,t,f2){
  try{
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type||"triangle"; o.frequency.setValueAtTime(f,t); if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.008); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+dur+.03);
  }catch(e){}
}
function tone(f,dur,type,vol,when){ if(!P.sound||!ac)return; toneAt(f,dur,type,vol,ac.currentTime+(when||0)); }
function fanfare(r){
  const seq=r===1?[523,659,784,1047,1319]:r===0?[392,330,262,196]:[440,440,523];
  seq.forEach((f,k)=>tone(f,.22,"triangle",.16,.25+k*.12));
}
const BASS=[110,110,130.81,110,87.31,87.31,98,98],LEAD=[440,523.25,659.25,880,783.99,659.25,523.25,659.25,349.23,440,523.25,698.46,587.33,493.88,392,493.88];
let musDone=-1;
function stopMusic(){musDone=-1;}
function musicTick(){
  if(!P.sound||!ac||ac.state!=="running")return;
  const now=performance.now(),H=BEAT/2,h0=Math.max(Math.ceil((now-G.b0)/H),musDone+1,0);
  if(musDone<h0-8)musDone=h0-1;
  for(let h=h0;G.b0+h*H<now+320;h++){
    const t=ac.currentTime+(G.b0+h*H-now)/1000; musDone=h; if(t<ac.currentTime)continue;
    if(h%2===0){toneAt(130,.13,"sine",.32,t,45); toneAt(BASS[(h/2)%8],.26,"triangle",.11,t);}
    else toneAt(7000,.03,"square",.012,t);
    toneAt(LEAD[h%16],.16,"triangle",.045,t);
  }
}

/* ---- fim de jogo ---- */
function gradeOf(acc){return acc>=90?"S":acc>=80?"A":acc>=70?"B":acc>=60?"C":"D";}
function endSide(){return G.kind==="local"?((G.end&&G.end.winner)||"w"):G.my;}
function showEnd(){
  if(!G||!G.end)return;
  const st=cur().st[endSide()],acc=accOf(st);
  $("endTitle").textContent=endText();
  $("grade").textContent=gradeOf(acc);
  const pl=$("ppLine"),pi=G.ppInfo;
  if(G.kind==="online"&&pi){
    pl.hidden=false;
    if(pi.placing&&!pi.first)pl.textContent="Classificação: "+pi.placing+" de 5 partidas";
    else if(pi.first)pl.innerHTML='Classificação concluída: <b class="up">'+pi.after+" PP</b>";
    else{const d=pi.after-pi.before; pl.innerHTML="PP "+pi.before+" → "+pi.after+' <b class="'+(d>=0?"up":"down")+'">('+(d>=0?"+":"")+d+")</b>";}
  }else pl.hidden=true;
  const rows=[["Pontos",st.score.toLocaleString("pt-BR")],["Precisão",acc+"%"],["Combo máximo",st.max+"x"],["Perfeito",st.j[0]],["Ótimo",st.j[1]],["OK",st.j[2]],["Errou",st.j[3]],["Lances",Math.ceil((G.tl.length-1)/2)]];
  $("endStats").innerHTML=rows.map(r=>"<div><span>"+r[0]+"</span><b>"+r[1]+"</b></div>").join("");
  const again=$("againBtn");
  again.hidden=G.kind==="daily"||G.kind==="hist"||(G.kind==="online"&&!isOn(G.fid)); again.textContent=G.kind==="online"?"Pedir revanche":"Jogar de novo";
  $("anBtn").hidden=G.tl.length<2;
  $("end").hidden=false;
}
$("againBtn").onclick=()=>{
  unlockAudio(); const g=G;
  if(g.kind==="online"){$("end").hidden=true; challenge(g.fid,g.mode); return;}
  if(g.kind==="bot")startMatch({kind:"bot",bot:g.bot,my:P.color==="r"?(Math.random()<.5?"w":"b"):P.color,mode:g.mode});
  else startMatch({kind:"local",my:"w",spin:g.spin,mode:g.mode});
};
$("seeBtn").onclick=()=>{$("end").hidden=true;};
$("endMenuBtn").onclick=()=>{$("end").hidden=true; leaveNow();};
$("copyBtn").onclick=()=>{
  const st=cur().st[endSide()],acc=accOf(st);
  const who=G.kind==="bot"?" contra "+BOTS[G.bot].n:G.kind==="local"?"":" contra "+nameOf(other(G.my));
  const txt="Xeque Combo: "+endText()+who+" ("+MODES[G.mode].n+"). Nota "+gradeOf(acc)+", precisão "+acc+"%, combo máximo "+st.max+"x, "+st.score.toLocaleString("pt-BR")+" pontos.";
  try{navigator.clipboard.writeText(txt).then(()=>toast("Resultado copiado."),()=>toast("Não deu para copiar aqui."));}catch(e){toast("Não deu para copiar aqui.");}
};

/* ---- análise: o bot revê cada lance e explica ---- */
function moveTxt(s,m){
  const pc=s.b[m.f],t=pc.toLowerCase();
  if(t==="k"&&Math.abs(m.t-m.f)===2)return m.t>m.f?"O-O":"O-O-O";
  const cap=s.b[m.t]||(t==="p"&&m.t===s.ep);
  return PT[t]+sqName(m.f)+(cap?"x":"-")+sqName(m.t)+(m.p?"="+PT[m.p]:"");
}
function capName(s,m){const c=s.b[m.t]; if(c)return NOME[c.toLowerCase()]; return (s.b[m.f].toLowerCase()==="p"&&m.t===s.ep)?NOME.p:null;}
function why(s,m){
  const c=capName(s,m),t=s.b[m.f].toLowerCase();
  if(c)return ", que captura "+c+".";
  if(inCheck(make(s,m),s.turn!=="w"))return ", com xeque.";
  if(t==="k"&&Math.abs(m.t-m.f)===2)return ", colocando o rei em segurança.";
  if((t==="n"||t==="b")&&(m.f>>3)===(s.turn==="w"?7:0))return ", desenvolvendo uma peça.";
  return ".";
}
function explain(i){
  const p=G.tl[i],nx=G.tl[i+1],s=p.s,m=nx.last,a=G.an[i],pc=s.b[m.f],t=pc.toLowerCase(),w=s.turn==="w";
  const facts=[],cn=capName(s,m),best=moveTxt(s,a.bm),isBest=same(a.bm,m),reply=G.an[i+1]?G.an[i+1].bm:null;
  if(nx.over==="mate")facts.push("Xeque-mate: o rei não tem mais saída.");
  else{
    if(cn)facts.push("Captura "+cn+" em "+sqName(m.t)+(s.b[m.t]&&VAL[s.b[m.t].toLowerCase()]>VAL[t]+50?", ganhando material":"")+".");
    if(t==="k"&&Math.abs(m.t-m.f)===2)facts.push("Roque: o rei fica protegido e a torre entra no jogo.");
    if(m.p)facts.push("Promove o peão a "+NOME[m.p].slice(2)+".");
    if(nx.chk)facts.push("Dá xeque e obriga o adversário a responder.");
    if((t==="n"||t==="b")&&(m.f>>3)===(w?7:0)&&i<24)facts.push("Desenvolve "+NOME[t]+", que sai da casa inicial.");
    if(t==="p"&&[27,28,35,36].includes(m.t))facts.push("Ocupa o centro com o peão.");
  }
  let txt;
  if(a.k===0)txt=(isBest?"Melhor lance da posição. ":"Tão bom quanto o melhor lance. ")+(facts.join(" ")||"Mantém a posição sob controle.");
  else if(a.k===1)txt="Bom lance. "+facts.join(" ")+" O bot preferia "+best+" por pouco"+why(s,a.bm);
  else if(a.k===2)txt="Jogável, mas impreciso. "+facts.join(" ")+" "+best+" era melhor"+why(s,a.bm);
  else{
    if(a.sc<=-(MATE-20))txt="Erro grave: permite xeque-mate"+(reply?" depois de "+moveTxt(nx.s,reply):"")+".";
    else if(a.bs>=MATE-20)txt="Deixou passar um xeque-mate.";
    else if(reply&&capName(nx.s,reply)){
      txt="Erro: depois de "+moveTxt(nx.s,reply)+" você perde "+capName(nx.s,reply)+(reply.t===m.t?", porque a peça ficou sem defesa suficiente em "+sqName(m.t):"")+".";
    }else txt="Erro: entrega vantagem ao adversário.";
    txt+=" Melhor era "+best+why(s,a.bm);
  }
  return txt.replace(/\s+/g," ");
}
function startReview(){
  if(!G||!G.end||G.tl.length<2)return;
  $("end").hidden=true;
  const n=G.tl.length-1; if(G.an&&G.an.length===n){openReview();return;}
  const an=[],tk=++anToken; let i=0;
  ask("Analisando a partida","O bot está revendo cada lance…","Cancelar",null,()=>{anToken++; if(G)showEnd();});
  $("askProg").hidden=false; const bar=$("askProg").firstChild; bar.style.width="0";
  const step=()=>{
    if(tk!==anToken||!G)return;
    if(i>=n){G.an=an; $("ask").hidden=true; openReview(); return;}
    const m=G.tl[i+1].last;
    askRate(G.tl[i].s,3,3,list=>{
      if(tk!==anToken||!G)return;
      let best=null,my=null;
      for(const x of list||[]){ if(!best||x.sc>best.sc)best=x; if(same(x.m,m))my=x; }
      if(!best){best={m,sc:0};} if(!my)my=best;
      const d=best.sc-my.sc; an.push({bm:best.m,bs:best.sc,sc:my.sc,k:d<=20?0:d<=70?1:d<=180?2:3});
      i++; bar.style.width=Math.round(i/n*100)+"%"; step();
    });
  };
  step();
}
function openReview(){
  document.body.classList.add("rv"); $("review").hidden=false;
  const cnt={w:[0,0,0,0],b:[0,0,0,0]};
  G.an.forEach((a,i)=>cnt[G.tl[i].s.turn][a.k]++);
  const line=c=>nameOf(c)+": "+cnt[c][0]+" perfeitos, "+cnt[c][1]+" ótimos, "+cnt[c][2]+" ok, "+cnt[c][3]+" erros";
  $("rvSum").textContent=line("w")+" · "+line("b");
  showRv(1);
}
function showRv(i){
  const n=G.tl.length-1; G.rv=Math.max(0,Math.min(n,i)); sel=-1; targets=[];
  render(true);
  const tag=$("rvTag");
  if(G.rv===0){tag.textContent="Início"; tag.style.setProperty("--c","var(--tinta)"); $("rvMove").textContent=""; $("rvText").textContent="Posição inicial. Use as setas para passar pelos lances e ver a explicação de cada um.";}
  else{
    const k=G.rv-1,a=G.an[k],s=G.tl[k].s;
    tag.textContent=JUDGE[a.k].n; tag.style.setProperty("--c",JUDGE[a.k].c);
    $("rvMove").textContent="Lance "+(Math.floor(k/2)+1)+" · "+nameOf(s.turn)+": "+moveTxt(s,G.tl[k+1].last);
    $("rvText").textContent=explain(k);
  }
  drawGraph();
}
function drawGraph(){
  const cv=$("rvGraph"),cx=cv.getContext("2d"),W=cv.width,H=cv.height,n=G.an.length; cx.clearRect(0,0,W,H);
  const css=getComputedStyle(document.documentElement),col=k=>css.getPropertyValue(k).trim();
  const X=i=>n<=1?W/2:8+(W-16)*i/(n-1),Y=v=>H/2-Math.max(-900,Math.min(900,v))/900*(H/2-8);
  const val=i=>G.tl[i].s.turn==="w"?G.an[i].sc:-G.an[i].sc;
  cx.strokeStyle="rgba(255,255,255,.2)"; cx.lineWidth=1; cx.beginPath(); cx.moveTo(0,H/2); cx.lineTo(W,H/2); cx.stroke();
  cx.beginPath(); cx.moveTo(X(0),H/2); for(let i=0;i<n;i++)cx.lineTo(X(i),Y(val(i))); cx.lineTo(X(n-1),H/2); cx.closePath();
  cx.fillStyle="rgba(255,255,255,.14)"; cx.fill();
  cx.beginPath(); for(let i=0;i<n;i++)i?cx.lineTo(X(i),Y(val(i))):cx.moveTo(X(i),Y(val(i))); cx.strokeStyle=col("--tinta"); cx.lineWidth=3; cx.stroke();
  for(let i=0;i<n;i++){const k=G.an[i].k; if(k<2)continue; cx.beginPath(); cx.arc(X(i),Y(val(i)),k===3?6:4,0,7); cx.fillStyle=col(k===3?"--erro":"--ciano"); cx.fill();}
  if(G.rv>0){const x=X(G.rv-1); cx.strokeStyle=col("--ouro"); cx.lineWidth=3; cx.beginPath(); cx.moveTo(x,0); cx.lineTo(x,H); cx.stroke();}
}
$("rvGraph").onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),n=G.an.length; showRv(1+Math.round((e.clientX-r.left)/r.width*(n-1)));};
$("rvFirst").onclick=()=>showRv(0); $("rvPrev").onclick=()=>showRv(G.rv-1);
$("rvNext").onclick=()=>showRv(G.rv+1); $("rvLast").onclick=()=>showRv(G.tl.length-1);
function closeReview(){ if(!G)return; G.rv=null; document.body.classList.remove("rv"); $("review").hidden=true; render(true); showEnd(); }
$("rvClose").onclick=closeReview;
$("anBtn").onclick=()=>{unlockAudio();startReview();};

/* ---- controles da partida ---- */
$("undoBtn").onclick=()=>{
  if(!G||G.end||G.tl.length<2||G.mode!=="classic"||(G.kind!=="bot"&&G.kind!=="local"))return;
  resetTurnState(); G.tl.pop();
  if(G.kind==="bot")while(G.tl.length>1&&cur().s.turn!==G.my)G.tl.pop();
  render(false); saveMatch(); afterMove();
};
$("resignBtn").onclick=()=>{
  if(!G||G.end||G.kind==="hist")return; const loser=G.kind==="local"?cur().s.turn:G.my;
  ask("Desistir da partida?",G.kind==="online"?"Conta como derrota e vale PP.":"A partida termina agora.","Desistir","Continuar jogando",()=>{
    if(!G||G.end)return; if(G.kind==="online")sendF(G.fid,{t:"resign",gid:G.gid});
    endGame({type:"resign",winner:other(loser)});
  });
};
$("drawBtn").onclick=()=>{
  if(!G||G.end||G.kind!=="online"||G.drawSent)return;
  G.drawSent=true; sendF(G.fid,{t:"draw",gid:G.gid}); toast("Proposta de empate enviada."); hud();
};
/* histórico: as 30 últimas partidas ficam salvas no aparelho */
function saveHist(){
  if(!G||G.kind==="hist"||G.tl.length<2||!G.end)return;
  const H=lsGet(K_HIST)||[],st=cur().st,pi=G.ppInfo;
  H.unshift({when:Date.now(),kind:G.kind,mode:G.mode,my:G.kind==="local"?"w":G.my,names:{w:nameOf("w"),b:nameOf("b")},
    moves:G.tl.slice(1).map(p=>p.last),end:G.end,st:{w:st.w,b:st.b},pp:pi&&pi.after!=null?pi.after-pi.before:null});
  lsSet(K_HIST,H.slice(0,30));
}
function paintHistory(){
  const H=lsGet(K_HIST)||[];
  $("hRows").innerHTML=H.length?H.map((h,i)=>{
    const win=h.end&&h.end.winner,loc=h.kind==="local",r=!win?.5:(loc?1:(win===h.my?1:0)),acc=accOf(h.st[loc?(win||"w"):h.my]);
    const title=loc?(win?esc(h.names[win])+" venceu":"Empate"):(r===1?"Vitória":r===0?"Derrota":"Empate")+" contra "+esc(h.names[other(h.my)]);
    const when=new Date(h.when).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
    return '<button class="row" data-h="'+i+'"><span class="pos">'+gradeOf(acc)+'</span><span class="av" style="background:'+(r===1?AVC[2]:r===0?AVC[0]:AVC[5])+'">'+GL[r===1?"q":r===0?"p":"r"]+VS+'</span><span class="info"><b>'+title+"</b><small>"+(MODES[h.mode]?MODES[h.mode].n:"")+" · "+when+" · "+Math.ceil(h.moves.length/2)+(h.moves.length<=2?" lance":" lances")+(h.pp!=null?" · "+(h.pp>=0?"+":"")+h.pp+" PP":"")+'</small></span><span class="pp">'+acc+"%<small>precisão</small></span></button>";
  }).join(""):'<p class="hint">Nenhuma partida terminada ainda. Elas aparecem aqui quando acabam.</p>';
}
$("hRows").onclick=e=>{
  const b=e.target.closest("button.row"); if(!b)return; unlockAudio();
  const h=(lsGet(K_HIST)||[])[+b.dataset.h]; if(!h)return; const tl=buildTl(h.moves||[]);
  if(!tl||tl.length<2){toast("Não deu para abrir essa partida.");return;}
  tl[tl.length-1].st=h.st;
  startMatch({kind:"hist",mode:h.mode,my:h.my,tl,end:h.end,names:h.names});
};
/* chat com o amigo durante a partida (fica só nesta sessão) */
const chats={}; let chatFid=null;
const REACT=["gg","Boa!","Eita","Pensa rápido","\uD83D\uDC4D","\uD83D\uDE02","\uD83D\uDE2E","\uD83D\uDD25"];
$("chatReact").innerHTML=REACT.map((x,i)=>'<button data-i="'+i+'">'+x+"</button>").join("");
function paintChat(){
  const log=$("chatLog"),l=chats[chatFid]||[]; log.textContent="";
  if(!l.length){const p=document.createElement("p"); p.className="hint"; p.textContent="Nenhuma mensagem ainda."; log.appendChild(p);}
  for(const m of l){const d=document.createElement("div"); d.className="msg"+(m.me?" me":""); d.textContent=m.x; log.appendChild(d);}
  log.scrollTop=log.scrollHeight;
}
function openChat(fid){ if(!F[fid])return; chatFid=fid; $("chatTitle").textContent="Chat com "+F[fid].name; paintChat(); $("chat").hidden=false; $("chatBtn").classList.remove("new"); }
function chatPush(fid,me,x){const l=chats[fid]=chats[fid]||[]; l.push({me,x}); if(l.length>60)l.shift();}
function chatSend(x){
  x=String(x||"").trim().slice(0,120); if(!x||!chatFid)return;
  if(!isOn(chatFid)){toast("Seu amigo está offline: a mensagem não foi enviada.");return;}
  sendF(chatFid,{t:"chat",x}); chatPush(chatFid,true,x); paintChat();
}
$("chatBtn").onclick=()=>{ if(G&&G.fid)openChat(G.fid); };
$("chatClose").onclick=()=>{$("chat").hidden=true;};
$("chatSend").onclick=()=>{chatSend($("chatIn").value); $("chatIn").value="";};
$("chatIn").onkeydown=e=>{ if(e.key==="Enter"){e.preventDefault(); $("chatSend").click();} };
$("chatReact").onclick=e=>{const b=e.target.closest("button"); if(b)chatSend(REACT[+b.dataset.i]);};
$("spinBtn").onclick=()=>{G.spin=!G.spin; render(false); saveMatch();};
$("leaveBtn").onclick=()=>backAction();
function leaveNow(){
  resetTurnState(); anToken++; stopMusic(); $("wrap").style.animation="";
  document.body.classList.remove("rv"); $("review").hidden=true;
  const k=G?G.kind:""; G=null; go(k==="bot"?"bots":k==="online"||k==="daily"?"friends":k==="hist"?"history":"menu");
}
function backAction(){
  if(!$("crop").hidden){$("crop").hidden=true;return;}
  if(!$("promo").hidden){$("promo").hidden=true;return;}
  if(!$("chat").hidden){$("chat").hidden=true;return;}
  if(!$("fsheet").hidden){$("fsheet").hidden=true;return;}
  if(!$("ask").hidden){$("askNo").hidden?$("askYes").click():$("askNo").click();return;}
  if(!$("end").hidden){$("end").hidden=true;return;}
  if(screen==="modes"){go(prevScreen==="game"?"menu":prevScreen);return;}
  if(screen==="bots"||screen==="friends"||screen==="profile"||screen==="history"){go("menu");return;}
  if(screen!=="game"||!G)return;
  if(G.rv!=null){closeReview();return;}
  if(G.kind==="online"&&!G.end)
    ask("Sair da partida?","Ela vale PP. Sair agora conta como derrota.","Sair e perder","Continuar jogando",()=>{ if(!G)return; sendF(G.fid,{t:"bye",gid:G.gid}); endGame({type:"left",winner:other(G.my)}); leaveNow(); });
  else leaveNow();
}
window.__back=backAction; /* botão Voltar do Android */

/* ===== Online: conexão direta entre os celulares (PeerJS). Cada jogador tem um código fixo. ===== */
const net={peer:null,links:{},trying:{},ready:false,dup:false,pending:null,wait:null,incoming:null,lastAdd:0,drawIn:false};
const netOk=()=>typeof Peer!=="undefined"&&(typeof RTCPeerConnection!=="undefined"||!!window.__FAKEPEER);
const isOn=fid=>!!(net.links[fid]&&net.links[fid].open);
function sendTo(c,o){try{c&&c.open&&c.send(o);}catch(e){}}
const sendF=(fid,o)=>sendTo(net.links[fid],o);
const helloMsg=()=>Object.assign({t:"hello",id:P.id,name:P.name,bio:P.bio,av:P.av,pp:P.pp,placed:P.placed},xcHello());
function broadcastHello(){for(const fid in net.links)sendF(fid,helloMsg());}
function netMsg(){
  const el=$("netMsg"); let t,bad=false;
  if(!netOk()){t="O online só funciona no app instalado (APK), com internet. Nesta página a conexão entre aparelhos é bloqueada.";bad=true;}
  else if(net.dup){t="Este código já está aberto em outro aparelho ou aba.";bad=true;}
  else t=net.ready?"Conectado. Amigos online aparecem com a bolinha verde.":"Conectando… confira sua internet.";
  el.textContent=t; el.classList.toggle("bad",bad);
}
function netInit(){
  if(!netOk()||net.peer)return; let p;
  try{p=net.peer=new Peer(ROOM+P.id);}catch(e){return;}
  p.on("open",()=>{net.ready=true; netMsg(); connectAll();});
  p.on("connection",c=>adopt(c));
  p.on("disconnected",()=>{net.ready=false; netMsg(); setTimeout(()=>{try{ if(net.peer&&!net.peer.destroyed)net.peer.reconnect(); }catch(e){}},3000);});
  p.on("error",e=>{
    const t=e&&e.type;
    if(t==="unavailable-id"){net.dup=true; netMsg();}
    else if(t==="peer-unavailable"){ if(Date.now()-net.lastAdd<9000){net.lastAdd=0; toast("Esse amigo não está online agora. Ele aparece quando abrir o app.");} }
    else netMsg();
  });
}
function connectAll(){
  if(!net.ready||!net.peer)return;
  for(const fid in F){
    if(isOn(fid)||(net.trying[fid]&&Date.now()-net.trying[fid]<15000))continue;
    net.trying[fid]=Date.now();
    try{adopt(net.peer.connect(ROOM+fid,{reliable:true}));}catch(e){}
  }
}
setInterval(connectAll,20000);
function adopt(c){
  c.on("open",()=>sendTo(c,helloMsg()));
  c.on("data",d=>{try{onMsg(c,d);}catch(e){}});
  const gone=()=>linkGone(c); c.on("close",gone); c.on("error",gone);
}
function linkGone(c){
  const fid=c.fid; if(!fid||net.links[fid]!==c)return;
  delete net.links[fid];
  if(net.pending&&net.pending.fid===fid){net.pending=null; $("ask").hidden=true; toast("A conexão com seu amigo caiu.");}
  if(net.incoming&&net.incoming.fid===fid){net.incoming=null; $("ask").hidden=true;}
  if(G&&G.kind==="online"&&G.fid===fid&&!G.end)endGame({type:"left",winner:G.my});
  if(screen==="friends")paintFriends();
}
function onMsg(c,d){
  if(!d||typeof d!=="object")return;
  if(d.t==="hello"){
    if(typeof d.id!=="string"||!/^[A-Z0-9]{8}$/.test(d.id)||d.id===P.id)return;
    const isNew=!F[d.id]; c.fid=d.id; net.links[d.id]=c;
    F[d.id]={name:String(d.name||"Amigo").slice(0,16),bio:String(d.bio||"").slice(0,48),av:cleanAv(d.av),pp:Math.max(0,d.pp|0),placed:!!d.placed};
    xcStoreFriend(F[d.id],d);
    saveF(); if(isNew)toast(F[d.id].name+" agora é seu amigo.");
    if(D[d.id])sendTo(c,{t:"dsync",g:D[d.id]});
    if(screen==="friends")paintFriends(); if(G&&screen==="game"&&G.fid===d.id){hud();paintSides();}
    return;
  }
  const fid=c.fid; if(!fid||!F[fid])return; const nm=F[fid].name;
  if(d.t==="invite"){
    const busyNow=(G&&screen==="game"&&G.kind==="online"&&!G.end)||net.pending||net.incoming||!$("ask").hidden||!MODES[d.mode]||d.mode==="daily";
    if(busyNow){sendTo(c,{t:"busy",gid:d.gid});return;}
    net.incoming={fid,gid:d.gid};
    ask(nm+" te desafiou",MODES[d.mode].n+". A partida vale PP.","Aceitar","Recusar",
      ()=>{net.incoming=null; unlockAudio(); net.wait={fid,gid:d.gid,mode:d.mode}; sendF(fid,{t:"accept",gid:d.gid});},
      ()=>{net.incoming=null; sendF(fid,{t:"decline",gid:d.gid});});
  }else if(d.t==="accept"){
    const pd=net.pending; if(!pd||pd.gid!==d.gid||pd.fid!==fid)return;
    const white=Math.random()<.5?P.id:fid; sendTo(c,{t:"start",gid:pd.gid,mode:pd.mode,white});
    beginOnline(fid,pd.gid,pd.mode,white===P.id?"w":"b");
  }else if(d.t==="start"){
    const w=net.wait; if(!w||w.gid!==d.gid||w.fid!==fid)return;
    beginOnline(fid,w.gid,w.mode,d.white===P.id?"w":"b");
  }else if(d.t==="decline"||d.t==="busy"){
    if(net.pending&&net.pending.gid===d.gid){net.pending=null; $("ask").hidden=true; toast(d.t==="busy"?nm+" está ocupado agora.":nm+" recusou o convite.");}
    else if(net.incoming&&net.incoming.gid===d.gid){net.incoming=null; $("ask").hidden=true; toast(nm+" cancelou o convite.");}
  }else if(d.t==="move"){
    if(!G||G.kind!=="online"||G.gid!==d.gid||G.fid!==fid||G.end||!d.m)return;
    const p=cur(); if(p.s.turn===G.my||d.n!==G.tl.length)return;
    const m=legal(p.s).find(x=>same(x,d.m)); if(!m)return;
    if(G.clock&&typeof d.clk==="number")G.clock[other(G.my)]=d.clk;
    play(m,false);
  }else if(d.t==="flag"){
    if(G&&G.kind==="online"&&G.gid===d.gid&&G.fid===fid&&!G.end&&(d.loser==="w"||d.loser==="b"))endGame({type:"time",winner:other(d.loser)});
  }else if(d.t==="bye"){
    if(G&&G.kind==="online"&&G.gid===d.gid&&G.fid===fid&&!G.end)endGame({type:"left",winner:G.my});
  }else if(d.t==="resign"){
    if(G&&G.kind==="online"&&G.gid===d.gid&&G.fid===fid&&!G.end)endGame({type:"resign",winner:G.my});
  }else if(d.t==="draw"){
    if(!G||G.kind!=="online"||G.gid!==d.gid||G.fid!==fid||G.end)return;
    if(!$("ask").hidden){sendTo(c,{t:"drawno",gid:d.gid});return;}
    net.drawIn=true;
    ask(nm+" propôs empate","Se você aceitar, a partida termina empatada.","Aceitar empate","Recusar",
      ()=>{net.drawIn=false; if(G&&G.kind==="online"&&G.gid===d.gid&&!G.end){sendF(fid,{t:"drawyes",gid:d.gid}); endGame({type:"agreed",winner:null});}},
      ()=>{net.drawIn=false; sendF(fid,{t:"drawno",gid:d.gid});});
  }else if(d.t==="drawyes"){
    if(G&&G.kind==="online"&&G.gid===d.gid&&G.fid===fid&&!G.end&&G.drawSent)endGame({type:"agreed",winner:null});
  }else if(d.t==="drawno"){
    if(G&&G.kind==="online"&&G.gid===d.gid&&G.fid===fid&&G.drawSent){G.drawSent=false; toast(nm+" recusou o empate."); hud();}
  }else if(d.t==="chat"){
    const x=String(d.x||"").trim().slice(0,120); if(!x)return; chatPush(fid,false,x);
    if(!$("chat").hidden&&chatFid===fid)paintChat();
    else{toast(nm+": "+x); if(G&&G.fid===fid&&screen==="game")$("chatBtn").classList.add("new");}
  }else if(d.t==="dsync")dailyRecv(fid,d.g);
}
function challenge(fid,mode){
  if(!isOn(fid)){toast("Seu amigo não está online agora.");return;}
  mode=mode&&mode!=="daily"?mode:modeForPlay(); const gid=rid(); net.pending={fid,gid,mode};
  sendF(fid,{t:"invite",gid,mode});
  ask("Convite enviado","Esperando "+F[fid].name+" aceitar ("+MODES[mode].n+")…","Cancelar convite",null,()=>{ if(net.pending&&net.pending.gid===gid){sendF(fid,{t:"decline",gid}); net.pending=null;} });
}
function beginOnline(fid,gid,mode,my){
  net.pending=net.wait=net.incoming=null;
  startMatch({kind:"online",fid,gid,mode,my});
}
addEventListener("pagehide",()=>{ if(G&&G.kind==="online"&&!G.end)sendF(G.fid,{t:"bye",gid:G.gid}); });

/* ---- amigos ---- */
function dailyBadge(fid){
  const d=D[fid]; if(!d)return ""; if(d.over)return '<span class="badge">Diária terminou</span>';
  const myTurn=(d.moves.length%2===0)===(d.white===P.id);
  return '<span class="badge">Diária: '+(myTurn?"sua vez":"vez dele")+"</span>";
}
function paintFriends(){
  paintModeChips(); netMsg(); $("myCode").textContent=P.id;
  const list=Object.keys(F).map(id=>({id,pp:F[id].placed?F[id].pp:-1})); list.push({id:null,pp:P.placed?P.pp:-1});
  list.sort((a,b)=>b.pp-a.pp||(a.id===null?-1:1));
  $("fRows").innerHTML=list.map((x,k)=>{
    if(x.id===null)return '<div class="row you"><span class="pos">#'+(k+1)+"</span>"+avH(P.av)+'<span class="info"><b>'+esc(P.name)+"</b><small>Você"+(P.placed?"":" · classificação "+P.perfs.length+"/5")+'</small></span><span class="pp">'+(P.placed?P.pp:"—")+"<small>PP</small></span></div>";
    const f=F[x.id],on=isOn(x.id);
    return '<button class="row" data-f="'+x.id+'"><span class="pos">#'+(k+1)+"</span>"+avH(f.av)+'<span class="info"><b>'+esc(f.name)+'</b><small><span class="on'+(on?" y":"")+'"></span>'+(on?"online":"offline")+"</small>"+dailyBadge(x.id)+'</span><span class="pp">'+(f.placed?f.pp:"—")+"<small>PP</small></span></button>";
  }).join("")+(list.length<2?'<p class="hint">Você ainda não tem amigos adicionados. Passe seu código ou digite o de alguém.</p>':"");
}
$("copyCode").onclick=()=>{try{navigator.clipboard.writeText(P.id).then(()=>toast("Código copiado."),()=>toast("Anote o código: "+P.id));}catch(e){toast("Anote o código: "+P.id);}};
$("fAdd").onclick=()=>{
  unlockAudio(); const code=$("fCode").value.trim().toUpperCase();
  if(!/^[A-Z0-9]{8}$/.test(code)){toast("O código tem 8 letras ou números.");return;}
  if(code===P.id){toast("Esse é o seu próprio código.");return;}
  if(!netOk()){netMsg();return;}
  if(!F[code]){F[code]={name:"Amigo",bio:"",av:cleanAv(null),pp:0,placed:false}; saveF();}
  $("fCode").value=""; net.lastAdd=Date.now(); delete net.trying[code]; connectAll(); paintFriends(); toast("Adicionado. Conectando…");
};
let fsId=null;
$("fRows").onclick=e=>{
  const r=e.target.closest("button.row"); if(!r)return; unlockAudio(); fsId=r.dataset.f; const f=F[fsId]; if(!f)return;
  $("fsAv").innerHTML=avH(f.av,"big"); $("fsTitle").textContent=f.name; $("fsSub").textContent=(f.bio?f.bio+" · ":"")+ppTxt(f)+" · "+(isOn(fsId)?"online":"offline");
  $("fsPlay").textContent=isOn(fsId)?"Desafiar · "+MODES[modeForPlay()].n:"Offline agora"; $("fsPlay").disabled=!isOn(fsId);
  xcPaintFriend(fsId);
  const d=D[fsId]; $("fsDaily").textContent=d&&!d.over?"Abrir partida diária":d?"Ver diária e começar outra":"Começar partida diária";
  $("fsheet").hidden=false;
};
$("fsClose").onclick=()=>{$("fsheet").hidden=true;};
$("fsChat").onclick=()=>{$("fsheet").hidden=true; openChat(fsId);};
$("fsPlay").onclick=()=>{$("fsheet").hidden=true; challenge(fsId);};
$("fsRemove").onclick=()=>{
  $("fsheet").hidden=true; const id=fsId,nm=F[id]?F[id].name:"";
  ask("Remover "+nm+"?","A partida diária com esse amigo também é apagada.","Remover","Cancelar",()=>{ delete F[id]; delete D[id]; saveF(); saveD(); try{net.links[id]&&net.links[id].close();}catch(e){} delete net.links[id]; paintFriends(); });
};
$("fsDaily").onclick=()=>{
  $("fsheet").hidden=true; const d=D[fsId];
  if(d&&!d.over){openDaily(fsId);return;}
  if(d&&d.over){ask("Partida diária terminada","Quer ver a partida que acabou ou começar uma nova?","Começar nova","Ver a que acabou",()=>newDaily(fsId),()=>openDaily(fsId));return;}
  newDaily(fsId);
};

/* ---- partida diária: fica salva nos dois celulares e sincroniza quando os dois estão online ---- */
function newDaily(fid){ D[fid]={gid:rid(),white:Math.random()<.5?P.id:fid,moves:[],ts:Date.now(),over:null}; saveD(); sendF(fid,{t:"dsync",g:D[fid]}); openDaily(fid); }
function dailyEnd(d,tl){
  const last=tl[tl.length-1];
  if(last.over)return {type:last.over,winner:last.over==="mate"?other(last.s.turn):null};
  if(d.over&&["time","resign","agreed"].includes(d.over.type))return {type:d.over.type,winner:d.over.winner==="w"||d.over.winner==="b"?d.over.winner:null};
  return null;
}
function openDaily(fid){
  const d=D[fid]; if(!d)return; const tl=buildTl(d.moves);
  if(!tl){delete D[fid]; saveD(); toast("A partida diária estava corrompida e foi apagada."); paintFriends(); return;}
  let end=dailyEnd(d,tl);
  if(!end&&Date.now()-d.ts>DAY){end={type:"time",winner:other(tl[tl.length-1].s.turn)}; d.over=end; saveD(); sendF(fid,{t:"dsync",g:d});}
  startMatch({kind:"daily",mode:"daily",fid,gid:d.gid,my:d.white===P.id?"w":"b",tl,end});
}
function dailyAfterMine(){
  const d=D[G.fid]; if(!d||d.gid!==G.gid)return;
  d.moves=G.tl.slice(1).map(p=>p.last); d.ts=Date.now(); if(G.end)d.over=G.end;
  saveD(); sendF(G.fid,{t:"dsync",g:d}); setStatus();
}
function dailyFinish(){ const d=D[G.fid]; if(!d||d.gid!==G.gid)return; d.over=G.end; d.moves=G.tl.slice(1).map(p=>p.last); saveD(); sendF(G.fid,{t:"dsync",g:d}); }
function dailyRecv(fid,g){
  if(!g||typeof g.gid!=="string"||g.gid.length>16||!Array.isArray(g.moves)||g.moves.length>700||(g.white!==P.id&&g.white!==fid))return;
  const moves=g.moves.map(m=>m&&{f:m.f|0,t:m.t|0,p:"qrbn".includes(m.p||"-")?m.p:null}),tl=buildTl(moves); if(!tl)return;
  const over=g.over&&typeof g.over==="object"?{type:String(g.over.type),winner:g.over.winner==="w"||g.over.winner==="b"?g.over.winner:null}:null;
  const inc={gid:g.gid,white:g.white,moves,ts:Math.min(Date.now(),+g.ts||Date.now()),over},mineD=D[fid];
  let take=false;
  if(!mineD)take=true;
  else if(mineD.gid!==inc.gid)take=(!!mineD.over&&!inc.over)||(!mineD.over&&!inc.over&&inc.gid<mineD.gid)||(!!mineD.over&&!!inc.over&&inc.ts>mineD.ts);
  else take=inc.moves.length>mineD.moves.length||(inc.moves.length===mineD.moves.length&&!!inc.over&&!mineD.over);
  if(!take){ if(mineD&&(mineD.gid!==inc.gid||mineD.moves.length>inc.moves.length||(mineD.over&&!inc.over)))sendF(fid,{t:"dsync",g:mineD}); return; }
  const viewing=G&&G.kind==="daily"&&G.fid===fid&&screen==="game";
  D[fid]=inc; saveD();
  if(viewing&&G.gid===inc.gid&&!G.end&&G.rv==null){
    for(let i=G.tl.length-1;i<moves.length&&!G.end;i++){const m=legal(cur().s).find(x=>same(x,moves[i])); if(m)play(m,false);}
    if(!G.end&&over)endGame(over);
  }else if(viewing&&G.gid!==inc.gid)openDaily(fid);
  else if(!viewing)toast((F[fid]?F[fid].name:"Seu amigo")+(moves.length?" jogou na partida diária.":" começou uma partida diária com você."));
  if(screen==="friends")paintFriends();
}

/* ---- início ---- */
/* ---- atualização via GitHub Releases ---- */
const APPV="3.4", UPD_REPO="pprotiopp-lab/xeque-combo";
const verNum=v=>String(v||"").replace(/^[^0-9]*/,"").split(".").map(n=>parseInt(n,10)||0);
const verNewer=(a,b)=>{const x=verNum(a),y=verNum(b);for(let i=0;i<Math.max(x.length,y.length);i++){const p=x[i]||0,q=y[i]||0;if(p!==q)return p>q;}return false;};
let updUrl="";
const IS_WEB=/^https?:$/.test(location.protocol); /* versão de navegador: a página se atualiza sozinha */
function checkUpdate(manual){
  if(IS_WEB){if(manual){toast("Atualizando…"); setTimeout(()=>location.reload(),300);} return;}
  const btn=$("verBtn"); if(manual&&btn)btn.textContent="Verificando…";
  let done=false; const to=setTimeout(()=>{if(!done&&manual){toast("Sem resposta do GitHub agora.");paintVer();}},8000);
  try{
    fetch("https://api.github.com/repos/"+UPD_REPO+"/releases/latest",{headers:{Accept:"application/vnd.github+json"}})
    .then(r=>{if(!r.ok)throw new Error(r.status);return r.json();})
    .then(j=>{
      done=true; clearTimeout(to); paintVer();
      const tag=j&&j.tag_name; if(!tag)return;
      if(verNewer(tag,APPV)){
        const a=(j.assets||[]).find(x=>/\.apk$/i.test(x.name||""));
        updUrl=(a&&a.browser_download_url)||j.html_url||"";
        $("updT").textContent="Nova versão "+String(tag).replace(/^v/i,"")+" disponível";
        $("updBtn").hidden=false;
        if(manual)toast("Tem versão nova: "+tag);
      } else { $("updBtn").hidden=true; if(manual)toast("Você já está na versão mais recente."); }
    })
    .catch(()=>{done=true; clearTimeout(to); paintVer(); if(manual)toast("Não deu para verificar agora (repositório privado ou sem internet).");});
  }catch(e){done=true; clearTimeout(to); paintVer();}
}
function paintVer(){const b=$("verBtn"); if(b)b.textContent="v"+APPV+(IS_WEB?" · recarregar":" · atualizar");}
$("updBtn").onclick=()=>{if(updUrl)location.href=updUrl;};
$("verBtn").onclick=()=>checkUpdate(true);
function start(data){
  const pr=lsGet(K_PROF);
  if(pr&&typeof pr==="object"){P=Object.assign(P,pr); P.av=cleanAv(P.av); if(!MODES[P.mode])P.mode="classic"; if(!SKINS[P.skin])P.skin=0; if(!PSTY[P.ps])P.ps=0; if(!BANNERS[P.bn])P.bn=0; if(!Array.isArray(P.perfs))P.perfs=[]; P.on=Object.assign({g:0,w:0,l:0,d:0},P.on);}
  if(!/^[A-Z0-9]{8}$/.test(P.id||"")){P.id=rid(); saveP();}
  F=lsGet(K_FR)||{}; D=lsGet(K_DAY)||{};
  for(const k in F)F[k]=Object.assign({name:"Amigo",bio:"",pp:0,placed:false},F[k],{av:cleanAv(F[k].av)});
  xcInit(); applySkin(); netInit(); paintVer(); setTimeout(()=>checkUpdate(false),1500);
  const sv=data&&data.G;
  if(validMatch(sv)&&data.screen==="game"){resetTurnState(); G=Object.assign({bot:-1,done:false,end:null,rv:null,an:null},sv); enterGame();}
  else go(data&&["bots","friends","profile","modes","history"].includes(data.screen)?data.screen:"menu");
}
/*@EXTRAS@*/
try{window.claude&&window.claude.hot&&window.claude.hot.snapshot&&window.claude.hot.snapshot(()=>({screen,G:G&&(G.kind==="bot"||G.kind==="local")&&!G.end?{kind:G.kind,mode:G.mode,bot:G.bot,my:G.my,spin:G.spin,tl:G.tl,clock:G.clock}:null}));}catch(e){}
if(window.claude&&window.claude.hot&&window.claude.hot.ready)window.claude.hot.ready(start); else start((window.claude&&window.claude.hot&&window.claude.hot.data)||{});

/* ---- fundo: anéis flutuando ---- */
(function(){
  const cv=$("bg"),cx=cv.getContext("2d"); let W,H,rings=[];
  const cols=["255,92,159","98,224,255","138,92,255","255,212,94"];
  function size(){const d=Math.min(devicePixelRatio||1,2); W=cv.width=innerWidth*d; H=cv.height=innerHeight*d;}
  function seed(){rings=Array.from({length:16},(_,k)=>({x:Math.random(),y:Math.random(),r:.03+Math.random()*.09,v:.004+Math.random()*.012,c:cols[k%4],a:.05+Math.random()*.08}));}
  function draw(t){
    cx.clearRect(0,0,W,H);
    for(const o of rings){
      const y=((o.y-(t/1000)*o.v)%1.3+1.3)%1.3-.15,rad=o.r*Math.min(W,H)*1.4;
      cx.beginPath(); cx.arc(o.x*W,y*H,rad,0,7); cx.lineWidth=rad*.14; cx.strokeStyle="rgba("+o.c+","+o.a+")"; cx.stroke();
    }
    if(!reduce)requestAnimationFrame(draw);
  }
  size(); seed(); addEventListener("resize",()=>{size(); if(reduce)draw(0);}); requestAnimationFrame(draw);
})();
})();
