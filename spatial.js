// Native scrolling drives a CSS camera. No scroll interception or WebGL runtime.
const scene=document.querySelector('#projects');
const theatre=document.createElement('div');theatre.className='project-theatre';
while(scene.firstChild)theatre.append(scene.firstChild);scene.append(theatre);
const viewport=document.createElement('div');viewport.className='project-viewport';
const deck=theatre.querySelector('.project-grid');deck.before(viewport);viewport.append(deck);
theatre.insertAdjacentHTML('afterbegin','<div class="scene-grid" aria-hidden="true"></div><div class="scene-word" aria-hidden="true">EXPLORE.</div>');
theatre.insertAdjacentHTML('beforeend','<div class="scene-status"><div class="scene-counter"><span id="scene-number">01</span><small>/ <span id="scene-total">06</span></small></div><p id="scene-name">Robot Sumo</p><span class="camera-line" aria-hidden="true"><i></i></span></div><div class="scene-footnote"><span aria-hidden="true"></span><span>Scroll untuk mengubah perspektif</span></div><div class="scene-nav" role="group" aria-label="Navigasi ruang proyek"><button aria-label="Proyek sebelumnya">←</button><button aria-label="Proyek berikutnya">→</button></div>');
document.querySelector('.hero-grid').insertAdjacentHTML('beforeend','<div class="camera-guide" aria-hidden="true"><svg viewBox="0 0 50 50"><path d="M25 3 46 15 46 36 25 48 4 36 4 15Z M4 15 25 27 46 15 M25 27V48 M25 3V15L4 27 M25 15 46 27"/></svg><div><b>A change of perspective.</b><small>Scroll. Lihat dari sudut berbeda.</small></div></div>');
const cards=[...deck.querySelectorAll('.project-card')];
const previous=theatre.querySelector('.scene-nav button:first-child'),next=theatre.querySelector('.scene-nav button:last-child');
const spatialMedia=matchMedia('(min-height: 650px), (min-width: 701px)');
let spatial=false,frame=0,activeIndex=0,visibleCards=cards;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function geometry(){const top=parseFloat(getComputedStyle(theatre).top)||0;const r=scene.getBoundingClientRect();return {start:scrollY+r.top-top,travel:Math.max(1,scene.offsetHeight-theatre.offsetHeight)}}
function updateSpatialMode(){spatial=!paused&&!reduced.matches&&spatialMedia.matches;document.body.classList.toggle('spatial-enabled',spatial);scene.style.setProperty('--scene-height',`${(visibleCards.length+1)*85}svh`);if(!spatial){cards.forEach(c=>{c.style.removeProperty('--card-transform');c.style.opacity='';c.style.zIndex='';c.removeAttribute('data-active');c.removeAttribute('aria-hidden');c.tabIndex=0});document.querySelectorAll('.hero-title,.hero-grid,.about,.journey,.photo-section,.certifications').forEach(e=>e.style.transform='');document.querySelector('.contact').style.removeProperty('--contact-cut');document.querySelector('.contact').style.removeProperty('--contact-x')}scheduleSpatial()}
function paintSpatial(){frame=0;if(!spatial)return;
 const mobile=innerWidth<=700,h=innerHeight,{start,travel}=geometry(),progress=clamp((scrollY-start)/travel,0,1);
 // Hold the first and last panel before leaving the scene.
 const position=clamp((progress-.12)/.76,0,1)*Math.max(0,visibleCards.length-1),angle=Math.sin(progress*Math.PI*2);
 const index=Math.round(position);activeIndex=index;
 deck.style.setProperty('--rig-x',`${angle*(mobile?2:5)}deg`);deck.style.setProperty('--rig-y',`${angle*(mobile?3:7)}deg`);
 theatre.style.setProperty('--floor-angle',`${-10+progress*20}deg`);
 visibleCards.forEach((card,i)=>{const d=i-position,abs=Math.abs(d),x=d*(mobile?innerWidth*.83:Math.min(innerWidth*.39,620)),y=abs*(mobile?15:40),z=-abs*(mobile?220:480),ry=clamp(d*(mobile?32:44),-70,70),rz=-d*(mobile?5:8);
 card.style.setProperty('--card-transform',`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateZ(${rz}deg)`);card.style.opacity=String(clamp(1-abs*.66,.07,1));card.style.zIndex=String(10-Math.round(abs*3));card.dataset.active=String(i===index);card.tabIndex=i===index?0:-1;card.setAttribute('aria-hidden',String(i!==index));
 });
 document.querySelector('#scene-number').textContent=String(index+1).padStart(2,'0');document.querySelector('#scene-total').textContent=String(visibleCards.length).padStart(2,'0');document.querySelector('#scene-name').textContent=visibleCards[index]?.querySelector('h3').textContent||'';theatre.querySelector('.camera-line i').style.width=`${progress*100}%`;previous.disabled=index===0;next.disabled=index===visibleCards.length-1;
 const hero=document.querySelector('.hero'),hp=clamp(scrollY/hero.offsetHeight,0,1);
 document.querySelector('.hero-title').style.transform=`translate3d(${-hp*90}px,${hp*40}px,${-hp*240}px) rotateX(${hp*20}deg) rotateY(${-hp*10}deg) rotateZ(${-hp*3}deg)`;
 document.querySelector('.hero-grid').style.transform=`translate3d(${hp*35}px,${hp*-30}px,0) rotateX(${hp*-8}deg) rotateY(${hp*12}deg)`;
 for(const selector of ['.about','.journey','.photo-section','.certifications']){const el=document.querySelector(selector),r=el.getBoundingClientRect(),t=clamp((r.top+r.height/2-h/2)/h,-1,1);el.style.transform=`perspective(2400px) rotateX(${t*(mobile?2:5)}deg) rotateY(${t*(mobile?2:5)}deg) scale(${1-Math.abs(t)*.025})`}
 const photo=document.querySelector('.photo-strip').getBoundingClientRect(),pt=clamp((h-photo.top)/(h+photo.height),0,1);document.querySelectorAll('.photo-slot').forEach((el,i)=>{el.style.setProperty('--photo-angle',`${(pt-.5)*(i-1)*38}deg`);el.style.setProperty('--photo-y',`${Math.sin(pt*Math.PI)*(i===1?-25:15)}px`)});
 const contact=document.querySelector('.contact'),cp=clamp(contact.getBoundingClientRect().top/h,0,1);contact.style.setProperty('--contact-cut',`${cp*12}%`);contact.style.setProperty('--contact-x',`${cp*(mobile?20:90)}px`);
}
function scheduleSpatial(){if(!frame)frame=requestAnimationFrame(paintSpatial)}
function goToPanel(index){if(!spatial)return;const {start,travel}=geometry(),fraction=visibleCards.length>1?index/(visibleCards.length-1):.5;window.scrollTo({top:start+travel*(.12+fraction*.76),behavior:'smooth'})}
previous.addEventListener('click',()=>goToPanel(Math.max(0,activeIndex-1)));next.addEventListener('click',()=>goToPanel(Math.min(visibleCards.length-1,activeIndex+1)));
theatre.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{visibleCards=cards.filter(c=>!c.hidden);activeIndex=0;updateSpatialMode();if(spatial){const {start,travel}=geometry();window.scrollTo({top:start+travel*.13,behavior:'instant'})}}));
// Keyboard navigation can reach every panel without targeting transformed offscreen cards.
theatre.addEventListener('keydown',e=>{if(!spatial||e.target.closest('.filters'))return;if(e.key==='ArrowRight'){e.preventDefault();goToPanel(Math.min(visibleCards.length-1,activeIndex+1))}if(e.key==='ArrowLeft'){e.preventDefault();goToPanel(Math.max(0,activeIndex-1))}});
motionButton.addEventListener('click',updateSpatialMode);reduced.addEventListener('change',()=>{paused=reduced.matches;setMotion();updateSpatialMode()});spatialMedia.addEventListener('change',updateSpatialMode);addEventListener('scroll',scheduleSpatial,{passive:true});addEventListener('resize',scheduleSpatial);updateSpatialMode();
