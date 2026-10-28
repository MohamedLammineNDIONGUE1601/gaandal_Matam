(function(){
const a=document.getElementById('bgm'),ask=document.getElementById('audioAsk'),bar=document.getElementById('audioBar'),
vol=document.getElementById('aVol'),tg=document.getElementById('aToggle'),K='gaandal_audio';
const S=JSON.parse(localStorage.getItem(K)||'{}');const save=()=>localStorage.setItem(K,JSON.stringify(S));
a.volume=(S.vol??40)/100;vol.value=S.vol??40;
const setIcon=()=>{tg.textContent=a.paused?'▶':'⏸'};
const play=()=>a.play().then(()=>{bar.hidden=false;setIcon()}).catch(()=>{bar.hidden=false;setIcon()});
function setVol(v){v=Math.max(0,Math.min(100,v));vol.value=v;a.volume=v/100;S.vol=v;save()}
vol.oninput=()=>setVol(+vol.value);
document.getElementById('aUp').onclick=()=>setVol(+vol.value+10);
document.getElementById('aDown').onclick=()=>setVol(+vol.value-10);
tg.onclick=()=>{if(a.paused){a.play();S.choice='yes'}else{a.pause()}save();setIcon()};
document.getElementById('aStop').onclick=()=>{a.pause();a.currentTime=0;S.choice='no';S.t=0;save();setIcon();bar.hidden=false};
a.onplay=a.onpause=setIcon;
setInterval(()=>{if(!a.paused){S.t=a.currentTime;save()}},2000);
document.getElementById('audioYes').onclick=()=>{S.choice='yes';save();ask.hidden=true;play()};
document.getElementById('audioNo').onclick=()=>{S.choice='no';save();ask.hidden=true;bar.hidden=false;setIcon()};
if(S.t)a.currentTime=S.t;
if(!S.choice){ask.hidden=false}
else if(S.choice==='yes'){play();
  // les navigateurs bloquent l'autoplay : on relance au premier geste
  const go=()=>{if(a.paused&&S.choice==='yes')a.play();removeEventListener('pointerdown',go)};addEventListener('pointerdown',go)}
else{bar.hidden=false;setIcon()}
// Question périodique : continuer l'écoute ? (toutes les 15 min de lecture)
setInterval(()=>{if(!a.paused){ask.querySelector('p').textContent="Souhaitez-vous continuer à écouter la musique pendant que vous utilisez la plateforme ?";ask.hidden=false}},15*60*1000);
})();
