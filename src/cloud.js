
/* ===== conta Google: salva o progresso na nuvem e libera brindes (só na versão web) ===== */
const cloud={user:null,timer:0,applying:false,busy:false,msg:""};
const CLOUD_KEYS=[K_PROF,K_FR,K_HIST,K_DAY];
const fbOk=()=>IS_WEB&&!!window.XCFB;
function xcDirty(k){ try{ if(!cloud.user||cloud.applying||!CLOUD_KEYS.includes(k))return; clearTimeout(cloud.timer); cloud.timer=setTimeout(()=>cloudPush().catch(()=>{}),6000); }catch(e){} }
async function cloudPush(){
  if(!cloud.user)return; cloud.busy=true; paintCloud();
  try{
    const at=Date.now(); P.syncAt=at; P.linked=true; lsSet(K_PROF,P);
    await XCFB.set(cloud.user.uid,{p:JSON.stringify(P),f:JSON.stringify(F),h:JSON.stringify(lsGet(K_HIST)||[]),d:JSON.stringify(D),u:at,v:APPV});
    cloud.msg="Salvo na nuvem às "+new Date(at).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  }catch(e){cloud.msg="Não deu para salvar agora. Tentaremos de novo.";}
  cloud.busy=false; paintCloud();
}
function cloudApply(doc){
  cloud.applying=true; clearTimeout(cloud.timer);
  try{
    const p=JSON.parse(doc.p); p.linked=true; p.syncAt=doc.u||Date.now();
    lsSet(K_PROF,p); lsSet(K_FR,JSON.parse(doc.f||"{}")); lsSet(K_HIST,JSON.parse(doc.h||"[]")); lsSet(K_DAY,JSON.parse(doc.d||"{}"));
    toast("Progresso da conta carregado."); setTimeout(()=>location.reload(),700);
  }catch(e){cloud.applying=false; toast("Não deu para ler o progresso salvo.");}
}
const localHasData=()=>P.stat.games>0||Object.keys(P.medals).length>0||P.pp>0||Object.keys(F).length>0||!!P.av.img;
async function cloudAfterLogin(fresh){
  let doc=null;
  try{doc=await XCFB.get(cloud.user.uid);}catch(e){toast("Conectado, mas sem acesso ao banco (confira as regras do Firestore)."); paintCloud(); return;}
  const keepLocal=async()=>{const was=P.linked; await cloudPush(); if(!was){toast("Conta conectada! Brindes liberados."); xcInit(); xcMedals(true); paintProfile();}};
  if(!doc){await keepLocal(); return;}
  if(!fresh){ /* retorno de sessão: só puxa se outro aparelho salvou depois */
    if((doc.u||0)>(P.syncAt||0))cloudApply(doc); else paintCloud();
    return;
  }
  if(!localHasData())cloudApply(doc);
  else ask("Essa conta já tem progresso salvo","Usar o progresso da nuvem (substitui o deste aparelho) ou manter o deste aparelho e enviá-lo para a conta?","Usar a nuvem","Manter este aparelho",()=>cloudApply(doc),()=>keepLocal());
}
async function cloudSignIn(){
  cloud.busy=true; paintCloud();
  try{
    await XCFB.load(); const r=await XCFB.signIn();
    cloud.user={uid:r.uid,name:r.name,email:r.email}; cloud.busy=false; paintCloud(); await cloudAfterLogin(true);
  }catch(e){
    cloud.busy=false; const c=(e&&e.code)||"";
    toast(/popup-closed|cancelled/.test(c)?"Login cancelado.":/popup-blocked/.test(c)?"O navegador bloqueou a janela do Google. Permita pop-ups e tente de novo.":/unauthorized-domain/.test(c)?"Este endereço ainda não está autorizado no Firebase.":/operation-not-allowed/.test(c)?"O login com Google não está ativado no Firebase.":"Não deu para entrar agora.");
    paintCloud();
  }
}
async function cloudSignOut(){ try{await XCFB.signOut();}catch(e){} cloud.user=null; cloud.msg=""; P.linked=true; saveP(); paintCloud(); toast("Você saiu da conta. Os brindes continuam liberados."); }
function paintCloud(){
  const el=$("cloudBox"); if(!el)return;
  if(!fbOk()){el.innerHTML="<b>Conta Google</b><p>Disponível na versão do site (iPhone e navegador). Entrando lá, você salva o progresso na nuvem e libera um tabuleiro, uma moldura e uma medalha exclusivos.</p>"; return;}
  const ck=P.linked?"✓ ":"";
  const gifts='<div class="gifts"><span class="gift">'+ck+"Tabuleiro Constelação</span><span class=\"gift\">"+ck+"Moldura Conectado</span><span class=\"gift\">"+ck+"Medalha Conectado</span></div>";
  if(cloud.user)el.innerHTML="<b>Conectado</b><p>"+esc(cloud.user.email||cloud.user.name||"Conta Google")+"</p>"+gifts+"<small>"+esc(cloud.msg||"Seu progresso é salvo automaticamente.")+'</small><div class="pbtns"><button class="chip" id="cloudSync"'+(cloud.busy?" disabled":"")+'>Salvar agora</button><button class="chip" id="cloudOut">Sair da conta</button></div>';
  else el.innerHTML="<b>Conta Google</b><p>Salve seu progresso na nuvem (troque de celular sem perder nada) e libere brindes exclusivos.</p>"+gifts+'<button class="btn main" id="cloudIn"'+(cloud.busy?" disabled":"")+">"+(cloud.busy?"Conectando…":"Entrar com Google")+"</button>";
}
$("cloudBox").onclick=e=>{const b=e.target.closest("button"); if(!b)return; if(b.id==="cloudIn")cloudSignIn(); else if(b.id==="cloudOut")cloudSignOut(); else if(b.id==="cloudSync")cloudPush();};
/* ao abrir: se já entrou antes, a sessão volta sozinha */
function cloudBoot(){
  if(!fbOk()||!P.linked)return;
  XCFB.load().then(()=>XCFB.onUser(u=>{ cloud.user=u?{uid:u.uid,name:u.name,email:u.email}:null; paintCloud(); if(u)cloudAfterLogin(false); })).catch(()=>{});
}
