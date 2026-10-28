(function(){
const log=document.getElementById('log'),form=document.getElementById('chatForm'),q=document.getElementById('q'),
title=document.getElementById('subjTitle');let hist=[],subject=null;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
document.querySelectorAll('.subj').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.subj').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  subject=b.dataset.slug;if(title)title.textContent=b.dataset.title;
  document.getElementById('chat').scrollIntoView();
  q.value=`Fais-moi un cours d'introduction en ${b.dataset.title}, puis propose-moi les chapitres que je peux étudier.`;q.focus()});
document.getElementById('clearChat').onclick=()=>{hist=[];log.innerHTML='<div class="bot msg"><div class="bubble">Nouvelle discussion. Posez votre question !</div></div>'};
function render(md){
  const M=[];md=md.replace(/\$\$[\s\S]+?\$\$|\$[^\n$]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/g,m=>{M.push(m);return `@@M${M.length-1}@@`});
  md=md.replace(/!\[([^\]]*)\]\(wiki:([^)]+)\)/g,(_,a,t)=>`![${a}](#wiki-${encodeURIComponent(t.trim())})`);
  let h=DOMPurify.sanitize(marked.parse(md));
  h=h.replace(/@@M(\d+)@@/g,(_,i)=>esc(M[+i]));
  const d=document.createElement('div');d.innerHTML=h;
  d.querySelectorAll('code.language-chart').forEach(c=>{const box=document.createElement('div');box.className='chartbox';
    const cv=document.createElement('canvas');box.appendChild(cv);c.closest('pre').replaceWith(box);
    try{const cfg=JSON.parse(c.textContent);cfg.options=Object.assign({responsive:true},cfg.options||{});new Chart(cv,cfg)}catch(e){box.textContent='Graphique invalide.'}});
  d.querySelectorAll('img').forEach(async im=>{const s=im.getAttribute('src')||'';if(!s.includes('#wiki-'))return;
    const t=decodeURIComponent(s.split('#wiki-')[1]);const fig=document.createElement('figure');im.replaceWith(fig);
    for(const l of['fr','en']){try{const r=await fetch(`https://${l}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`);
      const j=await r.json();const u=j.thumbnail&&(j.originalimage?.source||j.thumbnail.source);
      if(u){fig.innerHTML=`<img loading="lazy" src="${u}" alt=""><figcaption>${esc(im.alt||t)} · Wikipédia</figcaption>`;return}}catch(e){}}
    fig.remove()});
  try{renderMathInElement(d,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\[',right:'\\]',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false}],throwOnError:false})}catch(e){}
  return d}
function add(role,node){const m=document.createElement('div');m.className='msg '+(role==='user'?'me':'bot');
  const b=document.createElement('div');b.className='bubble';b.append(node);m.append(b);log.append(m);log.scrollTop=log.scrollHeight;return b}
form.onsubmit=async e=>{e.preventDefault();const t=q.value.trim();if(!t)return;q.value='';
  add('user',document.createTextNode(t));hist.push({role:'user',content:t});
  const wait=document.createElement('span');wait.className='dots';wait.innerHTML='<span></span><span></span><span></span>';const wb=add('bot',wait);
  try{const r=await fetch(window.CHAT_URL,{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':window.CSRF},body:JSON.stringify({messages:hist,subject})});
    const j=await r.json();wb.innerHTML='';
    if(j.reply){hist.push({role:'assistant',content:j.reply});wb.append(render(j.reply))}else{hist.pop();q.value=t;wb.textContent=j.error||'Erreur.'}
  }catch(err){hist.pop();q.value=t;wb.textContent='Connexion impossible.'}
  log.scrollTop=log.scrollHeight};
q.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
})();
