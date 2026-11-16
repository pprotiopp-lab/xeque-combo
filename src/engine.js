
/* ===== Motor de xadrez (sem DOM; também roda num Worker) ===== */
const VAL={p:100,n:320,b:330,r:500,q:900,k:0};
const KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const DG=[[-1,-1],[-1,1],[1,-1],[1,1]], ST=[[-1,0],[1,0],[0,-1],[0,1]];
const MATE=100000, BIG=1e7, TIMEOUT={};
let DEAD=0, NODES=0;

function initial(){
  const t="rnbqkbnrpppppppp"+" ".repeat(32)+"PPPPPPPPRNBQKBNR";
  return {b:[...t].map(c=>c===" "?null:c),turn:"w",cast:{K:1,Q:1,k:1,q:1},ep:-1,half:0};
}
function attacked(b,sq,byW){
  const r=sq>>3,c=sq&7,pr=r+(byW?1:-1);
  if(pr>=0&&pr<=7){const P=byW?"P":"p"; if(c>0&&b[pr*8+c-1]===P)return true; if(c<7&&b[pr*8+c+1]===P)return true;}
  const N=byW?"N":"n",K=byW?"K":"k",B=byW?"B":"b",R=byW?"R":"r",Q=byW?"Q":"q";
  for(const[dr,dc]of KN){const nr=r+dr,nc=c+dc; if(nr>=0&&nr<=7&&nc>=0&&nc<=7&&b[nr*8+nc]===N)return true;}
  for(const[dr,dc]of KG){const nr=r+dr,nc=c+dc; if(nr>=0&&nr<=7&&nc>=0&&nc<=7&&b[nr*8+nc]===K)return true;}
  for(const[dr,dc]of DG){let nr=r+dr,nc=c+dc; while(nr>=0&&nr<=7&&nc>=0&&nc<=7){const q=b[nr*8+nc]; if(q){if(q===B||q===Q)return true;break;} nr+=dr;nc+=dc;}}
  for(const[dr,dc]of ST){let nr=r+dr,nc=c+dc; while(nr>=0&&nr<=7&&nc>=0&&nc<=7){const q=b[nr*8+nc]; if(q){if(q===R||q===Q)return true;break;} nr+=dr;nc+=dc;}}
  return false;
}
function inCheck(s,w){const k=s.b.indexOf(w?"K":"k"); return k<0||attacked(s.b,k,!w);}
function gen(s,capsOnly){
  const b=s.b,w=s.turn==="w",out=[];
  for(let i=0;i<64;i++){
    const p=b[i]; if(!p||(p<"a")!==w)continue;
    const r=i>>3,c=i&7,t=p.toLowerCase();
    if(t==="p"){
      const d=w?-1:1,nr=r+d; if(nr<0||nr>7)continue;
      const promo=nr===(w?0:7);
      const push=to=>{ if(promo){for(const q of "qnrb")out.push({f:i,t:to,p:q});} else out.push({f:i,t:to}); };
      if((!capsOnly||promo)&&!b[nr*8+c]){
        push(nr*8+c);
        if(!capsOnly&&r===(w?6:1)&&!b[(r+2*d)*8+c])out.push({f:i,t:(r+2*d)*8+c});
      }
      for(const dc of [-1,1]){const nc=c+dc; if(nc<0||nc>7)continue; const to=nr*8+nc,q=b[to]; if(q?((q<"a")!==w):to===s.ep)push(to);}
    }else if(t==="n"||t==="k"){
      for(const[dr,dc]of(t==="n"?KN:KG)){
        const nr=r+dr,nc=c+dc; if(nr<0||nr>7||nc<0||nc>7)continue;
        const to=nr*8+nc,q=b[to];
        if(q){if((q<"a")!==w)out.push({f:i,t:to});}else if(!capsOnly)out.push({f:i,t:to});
      }
      if(t==="k"&&!capsOnly){
        const h=w?60:4,R=w?"R":"r";
        if(i===h){
          if(s.cast[w?"K":"k"]&&!b[h+1]&&!b[h+2]&&b[h+3]===R&&!attacked(b,h,!w)&&!attacked(b,h+1,!w)&&!attacked(b,h+2,!w))out.push({f:h,t:h+2});
          if(s.cast[w?"Q":"q"]&&!b[h-1]&&!b[h-2]&&!b[h-3]&&b[h-4]===R&&!attacked(b,h,!w)&&!attacked(b,h-1,!w)&&!attacked(b,h-2,!w))out.push({f:h,t:h-2});
        }
      }
    }else{
      const dirs=t==="b"?DG:t==="r"?ST:KG;
      for(const[dr,dc]of dirs){
        let nr=r+dr,nc=c+dc;
        while(nr>=0&&nr<=7&&nc>=0&&nc<=7){
          const to=nr*8+nc,q=b[to];
          if(q){if((q<"a")!==w)out.push({f:i,t:to});break;}
          if(!capsOnly)out.push({f:i,t:to});
          nr+=dr;nc+=dc;
        }
      }
    }
  }
  return out;
}
function make(s,m){
  const b=s.b.slice(),p=b[m.f],w=p<"a",t=p.toLowerCase(),cap=b[m.t];
  const cast={K:s.cast.K,Q:s.cast.Q,k:s.cast.k,q:s.cast.q}; let ep=-1;
  b[m.f]=null;
  if(t==="p"){ if(m.t===s.ep&&!cap)b[m.t+(w?8:-8)]=null; if(Math.abs(m.t-m.f)===16)ep=(m.t+m.f)/2; }
  b[m.t]=m.p?(w?m.p.toUpperCase():m.p):p;
  if(t==="k"){
    if(w){cast.K=cast.Q=0;}else{cast.k=cast.q=0;}
    if(m.t-m.f===2){b[m.t-1]=b[m.t+1];b[m.t+1]=null;}
    else if(m.f-m.t===2){b[m.t+1]=b[m.t-2];b[m.t-2]=null;}
  }
  if(m.f===63||m.t===63)cast.K=0; if(m.f===56||m.t===56)cast.Q=0;
  if(m.f===7||m.t===7)cast.k=0; if(m.f===0||m.t===0)cast.q=0;
  return {b,turn:w?"b":"w",cast,ep,half:(t==="p"||cap)?0:s.half+1};
}
function legal(s){const w=s.turn==="w"; return gen(s,false).filter(m=>!inCheck(make(s,m),w));}

function evalBoard(s){
  const b=s.b; let heavy=0;
  for(let i=0;i<64;i++){const p=b[i]; if(p){const t=p.toLowerCase(); if(t!=="p"&&t!=="k")heavy+=VAL[t];}}
  const endg=heavy<=2600; let sc=0;
  for(let i=0;i<64;i++){
    const p=b[i]; if(!p)continue;
    const w=p<"a",t=p.toLowerCase(),r=i>>3,c=i&7,rr=w?r:7-r,cd=Math.abs(c-3.5),rd=Math.abs(r-3.5);
    let v=VAL[t];
    if(t==="p")v+=(6-rr)*(endg?12:5)+(cd<1?(6-rr)*5:cd<2?(6-rr)*2:0);
    else if(t==="n")v+=30-(cd+rd)*8;
    else if(t==="b")v+=18-(cd+rd)*4;
    else if(t==="r")v+=rr===1?18:0;
    else if(t==="q")v+=6-(cd+rd)*1.5;
    else v+=endg?24-(cd+rd)*7:(rr===7?(cd>1.5?26:6):-18*Math.min(7-rr,2));
    sc+=w?v:-v;
  }
  return s.turn==="w"?sc:-sc;
}
function order(s,ms){
  for(const m of ms){const c=s.b[m.t]; m.o=(c?VAL[c.toLowerCase()]*10-VAL[s.b[m.f].toLowerCase()]+10000:0)+(m.p==="q"?9000:0);}
  ms.sort((a,b)=>b.o-a.o);
}
function quiesce(s,a,be,ply,qd){
  const ms=gen(s,true);
  for(const m of ms){const c=s.b[m.t]; if(c==="k"||c==="K")return MATE-ply;}
  const stand=evalBoard(s);
  if(qd===0||stand>=be)return stand;
  if(stand>a)a=stand;
  order(s,ms);
  for(const m of ms){const sc=-quiesce(make(s,m),-be,-a,ply+1,qd-1); if(sc>=be)return sc; if(sc>a)a=sc;}
  return a;
}
function negamax(s,d,a,be,ply){
  if(d===0)return quiesce(s,a,be,ply,3);
  if(DEAD&&(++NODES&1023)===0&&Date.now()>DEAD)throw TIMEOUT;
  const ms=gen(s,false);
  for(const m of ms){const c=s.b[m.t]; if(c==="k"||c==="K")return MATE-ply;}
  order(s,ms);
  let best=-(MATE-ply);
  for(const m of ms){
    const sc=-negamax(make(s,m),d-1,-be,-a,ply+1);
    if(sc>best)best=sc; if(sc>a)a=sc; if(a>=be)break;
  }
  if(best<=-(MATE-ply-1)&&!inCheck(s,s.turn==="w"))return 0; /* afogamento */
  return best;
}
/* nota de cada lance legal, visto por quem joga */
function rateMoves(s,depth){
  DEAD=0;
  return legal(s).map(m=>({m,sc:-negamax(make(s,m),depth-1,-BIG,BIG,1)}));
}
/* gosto pessoal de cada IA: empurra a escolha para o estilo dela */
function kdist(a,b){return Math.max(Math.abs((a>>3)-(b>>3)),Math.abs((a&7)-(b&7)));}
function bias(s,m,ns,w){
  const b=s.b,p=b[m.f],t=p.toLowerCase(),W=p<"a",cap=b[m.t],fr=m.f>>3,tr=m.t>>3,adv=W?fr-tr:tr-fr; let v=0;
  if(w.cap&&cap)v+=w.cap;
  if(w.trade&&cap&&Math.abs(VAL[cap.toLowerCase()]-VAL[t])<=30)v+=w.trade;
  if(w.chk&&inCheck(ns,!W))v+=w.chk;
  if(w.pawn&&t==="p")v+=w.pawn;
  if(w.knight&&t==="n")v+=w.knight;
  if(w.queen&&t==="q")v+=w.queen;
  if(w.adv)v+=w.adv*adv;
  if(w.castle&&t==="k"&&Math.abs(m.t-m.f)===2)v+=w.castle;
  if(w.dev&&(t==="n"||t==="b")&&fr===(W?7:0))v+=w.dev;
  if(w.king||w.storm){
    const k=b.indexOf(W?"k":"K");
    if(k>=0){
      if(w.king&&t!=="k")v+=w.king*(kdist(m.f,k)-kdist(m.t,k));
      if(w.storm&&t==="p"&&Math.abs((m.t&7)-(k&7))<=1)v+=w.storm;
    }
  }
  return v;
}
function pickBot(s,bot){
  const ms=legal(s); if(!ms.length)return null;
  if(bot.blun&&Math.random()<bot.blun)return ms[Math.random()*ms.length|0];
  order(s,ms);
  const w=bot.w||{}; let wsum=0;
  for(const k in w)wsum+=Math.abs(w[k])*(k==="adv"?2:k==="king"?3:1);
  const margin=(bot.noise||0)+2*wsum+1;
  const run=(d,deadline)=>{
    DEAD=deadline||0; NODES=0; let a=-BIG; const out=[];
    for(const m of ms){
      const ns=make(s,m),sc=-negamax(ns,d-1,-BIG,-(a-margin),1);
      if(sc>a)a=sc; out.push({m,ns,sc});
    }
    return out;
  };
  let res;
  if(bot.d>=4){
    res=run(3,0);
    try{res=run(4,Date.now()+(bot.t||1000));}catch(e){if(e!==TIMEOUT)throw e;}
    DEAD=0;
  }else res=run(bot.d,0);
  let best=null,bs=-Infinity;
  for(const x of res){const v=x.sc+bias(s,x.m,x.ns,w)+Math.random()*(bot.noise||0); if(v>bs){bs=v;best=x.m;}}
  return {f:best.f,t:best.t,p:best.p};
}
function drawnByMaterial(s){
  const rest=s.b.filter(p=>p&&p!=="K"&&p!=="k").map(p=>p.toLowerCase());
  return rest.length===0||(rest.length===1&&(rest[0]==="n"||rest[0]==="b"));
}
if(typeof module!=="undefined")module.exports={initial,gen,make,legal,inCheck,rateMoves,pickBot,evalBoard};
