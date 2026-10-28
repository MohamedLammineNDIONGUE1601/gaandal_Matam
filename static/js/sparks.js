(function(){const c=document.getElementById('sparks'),x=c.getContext('2d');let W,H,P=[];
function rs(){W=c.width=innerWidth;H=c.height=innerHeight}rs();addEventListener('resize',rs);
function mk(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.3,vy:-(Math.random()*.25+.05),vx:(Math.random()-.5)*.15,a:Math.random(),da:(Math.random()*.012+.003)*(Math.random()<.5?-1:1),h:Math.random()<.85?44:30}}
for(let i=0;i<Math.min(140,W/9);i++)P.push(mk());
(function f(){x.clearRect(0,0,W,H);for(const p of P){p.x+=p.vx;p.y+=p.vy;p.a+=p.da;if(p.a>1||p.a<.05)p.da*=-1;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}
x.beginPath();x.fillStyle=`hsla(${p.h},85%,65%,${Math.max(0,p.a)*.8})`;x.shadowColor='#d4af37';x.shadowBlur=8;x.arc(p.x,p.y,p.r,0,7);x.fill()}requestAnimationFrame(f)})()})();
