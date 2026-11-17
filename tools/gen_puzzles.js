// Gera puzzles "mate em 1" e "mate em 2" a partir de partidas simuladas pelo próprio motor.
// Uso: node tools/gen_puzzles.js > src/puzzles.json   (a verificação das soluções roda de novo dentro do app)
const E=require("../src/engine.js");
const {initial,make,legal,inCheck,pickBot}=E;
const V={p:1,n:3,b:3,r:5,q:9,k:0};
const mat=(s,w)=>s.b.reduce((a,p)=>a+(p&&((p<"a")===w)?V[p.toLowerCase()]:0),0);
const isMate=ns=>{const w=ns.turn==="w";return legal(ns).length===0&&inCheck(ns,w);};
const mates1=s=>legal(s).filter(m=>isMate(make(s,m)));
function mates2(s){
  const out=[];
  for(const m of legal(s)){
    const ns=make(s,m),rs=legal(ns);
    if(!rs.length)continue;                       // mate em 1 ou afogamento: não conta aqui
    if(rs.every(r=>mates1(make(ns,r)).length>0))out.push(m);
  }
  return out;
}
const enc=s=>s.b.map(p=>p||".").join("");
const want={1:50,2:70},got={1:[],2:[]},seen=new Set();
let games=0;const bot={d:1,noise:140,blun:.1,w:{}};
const t0=Date.now();
while((got[1].length<want[1]||got[2].length<want[2])&&Date.now()-t0<540000){
  let s=initial();games++;
  for(let ply=0;ply<120;ply++){
    const lg=legal(s);if(!lg.length)break;
    if(ply>=16){
      const w=s.turn==="w",adv=mat(s,w)-mat(s,!w);
      if(adv>=-1&&!inCheck(s,w)&&s.b.filter(Boolean).length>=7){
        const k=enc(s)+s.turn;
        if(!seen.has(k)){
          const m1=mates1(s);
          if(m1.length===1&&got[1].length<want[1]){seen.add(k);got[1].push({b:enc(s),t:s.turn,n:1});}
          else if(m1.length===0&&got[2].length<want[2]){
            const m2=mates2(s);
            if(m2.length>=1&&m2.length<=2){seen.add(k);got[2].push({b:enc(s),t:s.turn,n:2});}
          }
        }
      }
    }
    const m=pickBot(s,bot);if(!m)break;
    s=make(s,m);
  }
}
console.error("jogos:",games,"m1:",got[1].length,"m2:",got[2].length,"s:",((Date.now()-t0)/1000)|0);
const all=[];for(let i=0;i<Math.max(got[1].length,got[2].length);i++){if(got[2][i])all.push(got[2][i]);if(got[1][i]&&i%2===0)all.push(got[1][i]);}
console.log(JSON.stringify(all));
