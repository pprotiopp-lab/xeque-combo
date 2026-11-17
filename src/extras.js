/* ===== v3.4: medalhas, adversários e gráfico de PP ===== */
const TIERS=["#c98b5a","#c4cbd6","#ffd45e","#62e0ff"];
const MEDALS=[
 {id:"win1",n:"Primeiro ponto",d:"Vença uma partida contra IA ou online.",g:"p",t:0,ok:p=>p.stat.bw+p.stat.ow>=1},
 {id:"mate1",n:"Xeque-mate!",d:"Dê um xeque-mate.",g:"k",t:0,ok:p=>p.stat.mates>=1},
 {id:"combo10",n:"Combo 10x",d:"Faça um combo de 10 lances bons seguidos.",g:"n",t:0,ok:p=>p.maxCombo>=10},
 {id:"combo25",n:"Combo 25x",d:"Faça um combo de 25.",g:"n",t:1,ok:p=>p.maxCombo>=25},
 {id:"combo50",n:"Combo 50x",d:"Faça um combo de 50.",g:"n",t:2,ok:p=>p.maxCombo>=50},
 {id:"s1",n:"Nota S",d:"Termine uma partida com 90% de precisão ou mais.",g:"b",t:0,ok:p=>p.stat.s>=1},
 {id:"s10",n:"Mestre da nota S",d:"Consiga 10 notas S.",g:"b",t:2,ok:p=>p.stat.s>=10},
 {id:"perfect",n:"Perfeição",d:"Vença com 100% de precisão (mínimo 20 lances).",g:"q",t:3,ok:p=>p.stat.perfect>=1},
 {id:"bots5",n:"Aquecimento",d:"Vença 5 IAs diferentes.",g:"r",t:0,ok:p=>Object.keys(p.bb).length>=5},
 {id:"bots15",n:"Caçador de IAs",d:"Vença as 15 IAs de treino.",g:"r",t:3,ok:p=>Object.keys(p.bb).length>=BOTS.length},
 {id:"botlast",n:"Chefão",d:"Vença a IA mais forte.",g:"q",t:2,ok:p=>!!p.bb[BOTS.length-1]},
 {id:"on1",n:"Estreia online",d:"Vença uma partida online.",g:"k",t:0,ok:p=>p.stat.ow>=1},
 {id:"on10",n:"10 vitórias online",d:"Vença 10 partidas online.",g:"k",t:1,ok:p=>p.stat.ow>=10},
 {id:"on50",n:"50 vitórias online",d:"Vença 50 partidas online.",g:"k",t:3,ok:p=>p.stat.ow>=50},
 {id:"place",n:"Classificado",d:"Conclua a classificação (5 partidas online).",g:"b",t:0,ok:p=>p.placed},
 {id:"pp1000",n:"1000 PP",d:"Chegue a 1000 PP.",g:"q",t:1,ok:p=>p.placed&&p.pp>=1000},
 {id:"pp1500",n:"1500 PP",d:"Chegue a 1500 PP.",g:"q",t:3,ok:p=>p.placed&&p.pp>=1500},
 {id:"rival",n:"Rival",d:"Vença o mesmo amigo 3 vezes.",g:"n",t:1,ok:p=>Object.keys(p.vs).some(k=>k[0]==="f"&&p.vs[k].w>=3)},
 {id:"games25",n:"Maratona",d:"Jogue 25 partidas.",g:"p",t:0,ok:p=>p.stat.games>=25},
 {id:"games100",n:"Viciado",d:"Jogue 100 partidas.",g:"p",t:2,ok:p=>p.stat.games>=100},
 {id:"pz1",n:"Primeiro puzzle",d:"Resolva um puzzle diário.",g:"r",t:0,ok:p=>p.stat.pz>=1},
 {id:"pz10",n:"Detetive",d:"Resolva 10 puzzles.",g:"r",t:1,ok:p=>p.stat.pz>=10},
 {id:"pz30",n:"Gênio tático",d:"Resolva 30 puzzles.",g:"r",t:2,ok:p=>p.stat.pz>=30},
 {id:"pzs7",n:"Sequência de 7",d:"Resolva o puzzle do dia por 7 dias seguidos.",g:"q",t:3,ok:p=>p.stat.pzBest>=7}
];
const MEDAL_IDS=new Set(MEDALS.map(m=>m.id));
const medalHtml=(m,got,small)=>'<button class="medal'+(got?"":" lock")+(small?" sm":"")+'" data-md="'+m.id+'" style="--mc:'+TIERS[m.t]+'" aria-label="'+esc(m.n)+(got?"":" (bloqueada)")+'"><span>'+(got?GL[m.g]+VS:"?")+"</span></button>";

function xcInit(){
  P.stat=Object.assign({bw:0,ow:0,mates:0,s:0,perfect:0,games:0,pz:0,pzBest:0},P.stat&&typeof P.stat==="object"?P.stat:{});
  for(const k in P.stat)P.stat[k]=Math.max(0,+P.stat[k]||0);
  for(const k of ["bb","vs","medals"])if(!P[k]||typeof P[k]!=="object"||Array.isArray(P[k]))P[k]={};
  if(!Array.isArray(P.ppH))P.ppH=[]; P.ppH=P.ppH.map(x=>x|0).filter(x=>x>=0).slice(-30);
  if(!P.pzd||typeof P.pzd!=='object')P.pzd={day:0,streak:0}; P.pzd.day=P.pzd.day|0; P.pzd.streak=P.pzd.streak|0;
  P.bd=BOARDS[P.bd]?P.bd|0:0; P.sp=SPACKS[P.sp]?P.sp|0:0; xcApplyBoard();
  xcMedals(false);
}
function xcMedals(announce){
  const got=[];
  for(const m of MEDALS)if(!P.medals[m.id]){let ok=false; try{ok=m.ok(P);}catch(e){} if(ok){P.medals[m.id]=Date.now(); got.push(m);}}
  if(got.length){saveP(); if(announce){toast("Medalha: "+got[0].n+(got.length>1?" (+"+(got.length-1)+")":"")); tone(988,.12,"triangle",.14); tone(1319,.2,"triangle",.14,.1);}}
  return got.length;
}
function xcAfterGame(r){
  if(!G||G.kind==="hist"||G.kind==="local")return;
  const me=G.my,st=cur().st[me],acc=accOf(st),moves=G.tl.length-1,won=r===1;
  P.stat.games++;
  if(won){ if(G.kind==="bot"){P.stat.bw++; P.bb[G.bot]=1;} else if(G.kind==="online")P.stat.ow++; }
  if(G.end&&G.end.type==="mate"&&G.end.winner===me)P.stat.mates++;
  if(acc>=90&&moves>=10)P.stat.s++;
  if(won&&acc===100&&moves>=20)P.stat.perfect++;
  const key=G.kind==="bot"?"b"+G.bot:G.fid?"f"+G.fid:null;
  if(key){
    const v=P.vs[key]=Object.assign({n:"",w:0,l:0,d:0,t:0},P.vs[key]);
    v.n=String(nameOf(other(me))||"").slice(0,16); v.t=Date.now(); if(r===1)v.w++; else if(r===0)v.l++; else v.d++;
    const ks=Object.keys(P.vs); if(ks.length>60){ks.sort((a,b)=>P.vs[a].t-P.vs[b].t); for(const k of ks.slice(0,ks.length-60))delete P.vs[k];}
  }
  const pi=G.ppInfo; if(G.kind==="online"&&pi&&pi.after!=null){P.ppH.push(pi.after); P.ppH=P.ppH.slice(-30);}
  saveP(); xcMedals(true); broadcastHello();
}
/* gráfico de PP em SVG */
function chartHtml(h,empty){
  h=(h||[]).filter(x=>typeof x==="number"); if(h.length<2)return '<p class="hint">'+(empty||"Jogue mais partidas online para ver o gráfico.")+"</p>";
  const W=300,H=96,pad=10,lo=Math.min(...h),hi=Math.max(...h),sp=Math.max(hi-lo,40);
  const X=i=>pad+i*(W-2*pad)/(h.length-1),Y=v=>H-pad-(v-lo)/sp*(H-2*pad)-(hi-lo<40?(40-(hi-lo))/40*(H-2*pad)/2:0);
  const pts=h.map((v,i)=>X(i).toFixed(1)+","+Y(v).toFixed(1)),last=h[h.length-1],d=last-h[0];
  return '<svg class="chart" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="PP nas últimas partidas: de '+h[0]+" para "+last+'"><polyline points="'+pad+","+(H-pad)+" "+pts.join(" ")+" "+(W-pad)+","+(H-pad)+'" class="fill"/><polyline points="'+pts.join(" ")+'" class="line"/>'
    +'<circle cx="'+X(h.length-1).toFixed(1)+'" cy="'+Y(last).toFixed(1)+'" r="4.5" class="dot"/></svg><div class="chartlb"><span>'+h[0]+' PP</span><b class="'+(d>=0?"up":"down")+'">'+(d>=0?"+":"")+d+" · agora "+last+" PP</b></div>";
}
function xcPaintProfile(){
  const n=Object.keys(P.medals).filter(k=>MEDAL_IDS.has(k)).length;
  $("mdCount").textContent=n+"/"+MEDALS.length;
  $("pMedals").innerHTML=MEDALS.map(m=>medalHtml(m,!!P.medals[m.id])).join("");
  xcPaintLook();
  $("pChart").innerHTML=chartHtml(P.ppH,"Conclua a classificação online e jogue mais partidas para ver o gráfico.");
}
$("pMedals").onclick=e=>{const b=e.target.closest("button"); if(!b)return; const m=MEDALS.find(x=>x.id===b.dataset.md); if(!m)return; const when=P.medals[m.id]; toast(m.n+": "+m.d+(when?" ✓ "+new Date(when).toLocaleDateString("pt-BR"):""));};
/* adversários (aba do histórico) */
let vsFilter="all";
function xcPaintVs(){
  const ks=Object.keys(P.vs).sort((a,b)=>P.vs[b].t-P.vs[a].t),rows=[];
  for(const k of ks){
    const v=P.vs[k],bot=k[0]==="b",b=bot?BOTS[+k.slice(1)]:null,f=bot?null:F[k.slice(1)];
    if(bot&&!b)continue;
    if(vsFilter==="lost"&&!v.l)continue; if(vsFilter==="won"&&!v.w)continue;
    const av=bot?'<span class="av" style="background:'+AVC[4]+'">'+GL[b.g]+VS+"</span>":avH(f?f.av:null);
    const nm=bot?b.n:(f?f.name:v.n||"Amigo"),when=new Date(v.t).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
    const tag=v.l>v.w?"Te vence":v.w>v.l?"Você vence":"Empatados";
    rows.push('<div class="row">'+av+'<span class="info"><b>'+esc(nm)+"</b><small>"+(bot?"IA · ":"Amigo · ")+tag+" · última em "+when+'</small></span><span class="pp vsrec"><b class="up">'+v.w+'V</b> <b>'+v.d+'E</b> <b class="down">'+v.l+"D</b></span></div>");
  }
  $("vRows").innerHTML=rows.length?rows.join(""):'<p class="hint">'+(ks.length?"Ninguém nesse filtro.":"Quando você terminar partidas contra IAs ou amigos, elas aparecem aqui.")+"</p>";
  for(const b of document.querySelectorAll("#vFilter [data-vf]"))b.setAttribute("aria-pressed",String(b.dataset.vf===vsFilter));
}
$("hTabG").onclick=()=>{$("hRows").hidden=false; $("vWrap").hidden=true; $("hTabG").setAttribute("aria-pressed","true"); $("hTabV").setAttribute("aria-pressed","false");};
$("hTabV").onclick=()=>{$("hRows").hidden=true; $("vWrap").hidden=false; $("hTabG").setAttribute("aria-pressed","false"); $("hTabV").setAttribute("aria-pressed","true"); xcPaintVs();};
$("vFilter").onclick=e=>{const b=e.target.closest("[data-vf]"); if(!b)return; vsFilter=b.dataset.vf; xcPaintVs();};
/* troca com amigos pelo "hello" */
function xcHello(){return {m:Object.keys(P.medals).filter(k=>MEDAL_IDS.has(k)),h:P.ppH.slice(-20),o:[P.on.g,P.on.w,P.on.d,P.on.l],mc:P.maxCombo,ac:P.accN?Math.round(P.accSum/P.accN*100):null};}
function xcStoreFriend(f,d){
  f.medals=Array.isArray(d.m)?d.m.filter(x=>typeof x==="string"&&MEDAL_IDS.has(x)).slice(0,MEDALS.length):null;
  f.ppH=Array.isArray(d.h)?d.h.slice(0,20).map(x=>x|0).filter(x=>x>=0):null;
  f.o=Array.isArray(d.o)&&d.o.length===4?d.o.map(x=>Math.max(0,x|0)):null;
  f.mc=Math.max(0,d.mc|0); f.ac=d.ac==null?null:Math.max(0,Math.min(100,d.ac|0));
}
function xcPaintFriend(id){
  const f=F[id],box=$("fsExtra"); if(!f){box.innerHTML=""; return;}
  let h="";
  if(f.o)h+='<div class="statgrid sm"><div><span>Online</span><b>'+f.o[0]+'</b></div><div><span>Vitórias</span><b>'+f.o[1]+'</b></div><div><span>Maior combo</span><b>'+f.mc+'x</b></div><div><span>Precisão</span><b>'+(f.ac==null?"—":f.ac+"%")+"</b></div></div>";
  const v=P.vs["f"+id]; h+='<p class="h2h">'+(v?"Você contra ele: <b class=\"up\">"+v.w+"V</b> <b>"+v.d+"E</b> <b class=\"down\">"+v.l+"D</b>":"Vocês ainda não jogaram valendo PP.")+"</p>";
  if(f.ppH)h+='<span class="lbl">PP nas últimas partidas</span>'+chartHtml(f.ppH,"Ele ainda não tem partidas suficientes para o gráfico.");
  if(f.medals){const got=new Set(f.medals);h+='<span class="lbl">Medalhas '+got.size+"/"+MEDALS.length+'</span><div class="medals sm">'+MEDALS.map(m=>medalHtml(m,got.has(m.id),true)).join("")+"</div>";}
  else h+='<p class="hint">Peça para ele atualizar o app para ver medalhas e gráfico.</p>';
  box.innerHTML=h;
}
$("fsExtra").onclick=e=>{const b=e.target.closest("button"); if(!b)return; const m=MEDALS.find(x=>x.id===b.dataset.md); if(m)toast(m.n+": "+m.d);};

/* ===== fundo do tabuleiro ===== */
const BOARDS=[
 {n:"Neon",d:"#2a1d52",l:"#3b2a72"},
 {n:"Madeira",d:"#9a6a3a",l:"#ecd2a4"},
 {n:"Torneio",d:"#5b8a4a",l:"#eeeed2"},
 {n:"Gelo",d:"#6f93b8",l:"#e6f3ff"},
 {n:"Mármore",d:"#8b8f99",l:"#ececf2"},
 {n:"Meia-noite",d:"#14163a",l:"#2c3070"},
 {n:"Sakura",d:"#d58aa8",l:"#ffe8f0"},
 {n:"Taiko",d:"#14141c",l:"#34344a"}
];
function xcApplyBoard(){document.body.dataset.bd=BOARDS[P.bd]?P.bd:0;}
/* ===== pacotes de som dos lances ===== */
const SPACKS=["Clássico","osu!","Madeira","Arcade"];
function noiseAt(dur,vol,t,freq,q,type){
  try{
    const len=Math.max(1,ac.sampleRate*dur|0),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();
    s.buffer=buf; f.type=type||"bandpass"; f.frequency.value=freq; f.Q.value=q||1; g.gain.value=vol;
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t);
  }catch(e){}
}
function sfxMove(byMe,jd,next,mover){
  if(!P.sound||!ac)return;
  const t=ac.currentTime,sp=P.sp|0,miss=jd===JUDGE[3],perfect=jd===JUDGE[0];
  const n=byMe?Math.max(Math.min(next.st[mover].combo,SCALE.length)-1,0):2,f=byMe?SCALE[n]:330;
  if(sp===1){ /* osu!: clique seco, ping do combo, palma na captura */
    if(miss){toneAt(320,.3,"sawtooth",.12,t,70); return;}
    noiseAt(.04,.5,t,4200,.7,"highpass"); toneAt(f*2,.09,"sine",byMe?.16:.08,t);
    if(perfect)toneAt(f*3,.12,"sine",.07,t+.04);
    if(next.cap){noiseAt(.06,.6,t,1700,1.4); noiseAt(.07,.5,t+.07,1500,1.4);}
    if(next.chk&&!next.over){toneAt(1175,.08,"sine",.1,t+.12); toneAt(1568,.14,"sine",.1,t+.2);}
  }else if(sp===2){ /* madeira: toc de peça no tabuleiro */
    if(miss){noiseAt(.12,.7,t,260,2); toneAt(140,.14,"sine",.2,t,70); return;}
    noiseAt(.05,.9,t,950,7); toneAt(byMe?190:150,.08,"sine",.22,t,110);
    if(next.cap){noiseAt(.06,1,t+.06,1200,6); toneAt(120,.1,"sine",.2,t+.06,70);}
    if(next.chk&&!next.over){toneAt(740,.12,"triangle",.1,t+.14); toneAt(740,.12,"triangle",.1,t+.26);}
  }else if(sp===3){ /* arcade: blips */
    if(miss){toneAt(400,.25,"square",.1,t,90); return;}
    toneAt(f,.06,"square",byMe?.1:.06,t,f*1.5); if(perfect)toneAt(f*2,.08,"square",.06,t+.06);
    if(next.cap){toneAt(220,.1,"square",.1,t+.05,60); noiseAt(.08,.4,t+.05,2600,.8,"highpass");}
    if(next.chk&&!next.over)[523,659,784].forEach((x,i)=>toneAt(x,.07,"square",.07,t+.12+i*.07));
  }else{ /* clássico (o que já existia) */
    if(miss)tone(150,.22,"sawtooth",.12);
    else{tone(f,.14,"triangle",.2); if(perfect)tone(f*1.5,.18,"sine",.1,.05);}
    if(next.cap)tone(110,.2,"square",.1);
    if(next.chk&&!next.over){tone(880,.1,"square",.07,.12);tone(660,.14,"square",.07,.22);}
  }
}
function xcPaintLook(){
  $("pBoard").innerHTML=BOARDS.map((b,i)=>'<button data-bd="'+i+'" aria-pressed="'+(P.bd===i)+'"><i class="bdp" style="background:conic-gradient('+b.l+" 25%,"+b.d+" 0 50%,"+b.l+" 0 75%,"+b.d+' 0) 0 0/14px 14px"></i>'+b.n+"</button>").join("");
  $("pSnd").innerHTML=SPACKS.map((n,i)=>'<button data-sp="'+i+'" aria-pressed="'+(P.sp===i)+'">'+n+"</button>").join("");
}
$("pBoard").onclick=e=>{const b=e.target.closest("button"); if(!b)return; P.bd=+b.dataset.bd; xcApplyBoard(); saveP(); xcPaintLook();};
$("pSnd").onclick=e=>{
  const b=e.target.closest("button"); if(!b)return; P.sp=+b.dataset.sp; saveP(); xcPaintLook(); unlockAudio();
  sfxMove(true,JUDGE[0],{st:{w:{combo:4},b:{combo:0}},cap:false,chk:false,over:false},"w"); setTimeout(()=>sfxMove(false,JUDGE[1],{st:{w:{combo:0},b:{combo:1}},cap:true,chk:false,over:false},"b"),260);
};

/* ===== puzzles: mate em 1 e mate em 2 (o do dia é igual para todo mundo) ===== */
const PUZZLES=/*@PUZ@*/[];
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/DAY);
const mates1=s=>legal(s).filter(m=>{const ns=make(s,m);return legal(ns).length===0&&inCheck(ns,ns.turn==="w");});
const winsIn2=ns=>{const rs=legal(ns);return rs.length>0&&rs.every(r=>mates1(make(ns,r)).length>0);};
function puzPly(pz){
  const b=[...pz.b].map(c=>c==="."?null:c),ids=new Array(64).fill(0); let n=1; b.forEach((c,i)=>{if(c)ids[i]=n++;});
  return {s:{b,turn:pz.t,cast:{K:0,Q:0,k:0,q:0},ep:-1,half:0},ids,st:{w:newStats(),b:newStats()},last:null};
}
const puzToday=()=>PUZZLES.length?dayNum()%PUZZLES.length:-1;
function puzStreak(){const d=P.pzd; return d.day>=dayNum()-1?d.streak:0;}
function xcPaintMenu(){
  if(!PUZZLES.length){$("mPuz").hidden=true;return;}
  const solved=P.pzd.day===dayNum(),st=puzStreak();
  $("mPuzTxt").textContent=solved?"Resolvido hoje · sequência de "+st+(st===1?" dia":" dias"):(st?"Mate em "+PUZZLES[puzToday()].n+" · mantenha a sequência de "+st:"Mate em "+PUZZLES[puzToday()].n+" · muda todo dia");
}
function startPuzzle(idx,daily){
  const pz=PUZZLES[idx]; if(!pz)return;
  startMatch({kind:"puzzle",mode:"classic",my:pz.t,tl:[puzPly(pz)],names:{w:pz.t==="w"?"Você":"Rival",b:pz.t==="b"?"Você":"Rival"}});
  G.puzzle={n:pz.n,idx,daily:!!daily,tries:0,g:G}; hud();
}
function puzExtra(){const t=puzToday(); let i; do{i=Math.random()*PUZZLES.length|0;}while(PUZZLES.length>1&&i===t); startPuzzle(i,false);}
$("mPuz").onclick=()=>{
  unlockAudio(); tone(660,.08,"triangle",.12);
  if(P.pzd.day!==dayNum())startPuzzle(puzToday(),true);
  else ask("Puzzle de hoje já resolvido","Quer treinar com outro puzzle? Não muda a sua sequência.","Outro puzzle","Voltar",()=>puzExtra());
};
function xcPuzHud(){
  const z=G.puzzle; if(!z)return;
  $("gTitle").textContent=z.daily?"Puzzle do dia":"Puzzle"; $("gTag").textContent="Mate em "+z.n; $("gTag").className="tag cool";
  $("resignBtn").hidden=true; $("undoBtn").hidden=true;
  $("gHint").textContent="Dê xeque-mate em "+z.n+(z.n>1?" lances":" lance")+". Você joga com as "+(G.my==="w"?"brancas":"pretas")+". Não vale PP.";
}
/* depois do meu lance: era o certo? */
function puzAfter(){
  if(!G||!G.puzzle||G.end)return; const s=cur().s; if(s.turn===G.my)return;
  const made=Math.ceil((G.tl.length-1)/2),len=G.tl.length,z=G.puzzle;
  if(made<z.n&&winsIn2(s)){
    busy=true; setStatus();
    setTimeout(()=>{
      if(!G||G!==z.g||G.end||G.tl.length!==len)return; busy=false;
      const rs=legal(cur().s); play(rs[Math.random()*rs.length|0],false);
    },reduce?100:650);
  }else puzWrong(len);
}
function puzWrong(len){
  const z=G.puzzle; z.tries++; z.g=G; busy=true; toast("Não era esse. Tente de novo."); tone(180,.2,"sawtooth",.1);
  setTimeout(()=>{ if(!G||G.end||G.tl.length!==len)return; G.tl.pop(); G.an=null; busy=false; sel=-1; targets=[]; render(false); },reduce?100:800);
}
function puzEnd(end){ /* chamado no lugar do fim de partida normal */
  const z=G.puzzle; z.g=G;
  if(!(end.type==="mate"&&end.winner===G.my)){ G.end=null; puzWrong(G.tl.length); return; }
  G.end=end; busy=false; sel=-1; targets=[]; $("promo").hidden=true; render(false); fanfare(1);
  const d=P.pzd,today=dayNum();
  P.stat.pz++;
  if(z.daily&&d.day!==today){d.streak=d.day===today-1?d.streak+1:1; d.day=today; P.stat.pzBest=Math.max(P.stat.pzBest,d.streak);}
  saveP(); xcMedals(true);
  setTimeout(()=>{ if(!G||G!==z.g)return; ask("Puzzle resolvido!",z.daily?"Sequência: "+d.streak+(d.streak===1?" dia":" dias")+". Volte amanhã para o próximo.":"Boa! Mais um para a conta.","Voltar","Outro puzzle",()=>leaveNow(),()=>puzExtra()); },reduce?100:900);
}
