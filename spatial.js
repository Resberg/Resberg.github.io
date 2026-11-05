// Native scrolling drives a CSS camera. No scroll interception or WebGL runtime.
const scene=document.querySelector('#projects');
const theatre=document.createElement('div');theatre.className='project-theatre';
while(scene.firstChild)theatre.append(scene.firstChild);scene.append(theatre);
const viewport=document.createElement('div');viewport.className='project-viewport';
const deck=theatre.querySelector('.project-grid');deck.before(viewport);viewport.append(deck);
theatre.insertAdjacentHTML('afterbegin','<div class="scene-grid" aria-hidden="true"></div><div class="scene-word" aria-hidden="true">EXPLORE.</div>');
theatre.insertAdjacentHTML('beforeend','<div class="scene-status"><div class="scene-counter"><span id="scene-number">01</span><small>/ <span id="scene-total">06</span></small></div><p id="scene-name">Robot Sumo</p><span class="camera-line" aria-hidden="true"><i></i></span></div><div class="scene-footnote"><span aria-hidden="true"></span><span>Scroll untuk mengubah perspektif</span></div><div class="scene-nav" role="group" aria-label="Navigasi ruang proyek"><button aria-label="Proyek sebelumnya">←</button><button aria-label="Proyek berikutnya">→</button></div>');
const cards=[...deck.querySelectorAll('.project-card')];
const previous=theatre.querySelector('.scene-nav button:first-child'),next=theatre.querySelector('.scene-nav button:last-child');
const spatialMedia=matchMedia('(min-height: 650px), (min-width: 701px)');
let spatial=false,frame=0,activeIndex=0,visibleCards=cards;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Read layout only when it changes; scroll frames use stable, untransformed geometry.
const hero=document.querySelector('.hero'),heroTitle=document.querySelector('.hero-title'),heroGrid=document.querySelector('.hero-grid');
const sectionElements=['.about','.journey','.photo-section','.certifications'].map(selector=>document.querySelector(selector));
const photoStrip=document.querySelector('.photo-strip'),photoSlots=[...document.querySelectorAll('.photo-slot')],contactSection=document.querySelector('.contact');
let sceneLayout,sectionLayouts=[],photoLayout,contactTop=0,heroHeight=1,renderScroll=scrollY,lastPaint=0;
function layoutTop(element){let top=0;for(let node=element;node;node=node.offsetParent)top+=node.offsetTop;return top}
function measureSpatial(){const top=parseFloat(getComputedStyle(theatre).top)||0;sceneLayout={start:layoutTop(scene)-top,travel:Math.max(1,scene.offsetHeight-theatre.offsetHeight)};sectionLayouts=sectionElements.map(element=>({element,center:layoutTop(element)+element.offsetHeight/2}));photoLayout={top:layoutTop(photoStrip),height:photoStrip.offsetHeight};contactTop=layoutTop(contactSection);heroHeight=hero.offsetHeight||1}
function geometry(){if(!sceneLayout)measureSpatial();return sceneLayout}
function updateSpatialMode(){spatial=!paused&&!reduced.matches&&spatialMedia.matches;document.body.classList.toggle('spatial-enabled',spatial);scene.style.setProperty('--scene-height',`${(visibleCards.length+1)*85}svh`);if(!spatial){cards.forEach(c=>{c.style.removeProperty('--card-transform');c.style.opacity='';c.style.zIndex='';c.removeAttribute('data-active');c.removeAttribute('aria-hidden');c.tabIndex=0});document.querySelectorAll('.hero-title,.hero-grid,.about,.journey,.photo-section,.certifications').forEach(e=>e.style.transform='');document.querySelector('.contact').style.removeProperty('--contact-cut');document.querySelector('.contact').style.removeProperty('--contact-x')}measureSpatial();renderScroll=scrollY;lastPaint=0;scheduleSpatial()}
function paintSpatial(time){frame=0;if(!spatial||document.hidden){lastPaint=0;return;}
 const elapsed=Math.min(64,time-(lastPaint||time-16.67));lastPaint=time;
 if(Math.abs(scrollY-renderScroll)>innerHeight*1.25)renderScroll=scrollY;
 else renderScroll+=(scrollY-renderScroll)*(1-Math.exp(-elapsed/85));
 if(Math.abs(scrollY-renderScroll)<.1)renderScroll=scrollY;
 const mobile=innerWidth<=700,h=innerHeight,{start,travel}=geometry(),progress=clamp((renderScroll-start)/travel,0,1);
 // Hold the first and last panel before leaving the scene.
 const position=clamp((progress-.12)/.76,0,1)*Math.max(0,visibleCards.length-1),angle=Math.sin(progress*Math.PI*2);
 const index=Math.round(position);activeIndex=index;
 deck.style.setProperty('--rig-x',`${angle*(mobile?2:5)}deg`);deck.style.setProperty('--rig-y',`${angle*(mobile?3:7)}deg`);
 theatre.style.setProperty('--floor-angle',`${-10+progress*20}deg`);
 visibleCards.forEach((card,i)=>{const d=i-position,abs=Math.abs(d),x=d*(mobile?innerWidth*.83:Math.min(innerWidth*.39,620)),y=abs*(mobile?15:40),z=-abs*(mobile?220:480),ry=clamp(d*(mobile?32:44),-70,70),rz=-d*(mobile?5:8);
 card.style.setProperty('--card-transform',`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${ry}deg) rotateZ(${rz}deg)`);card.style.opacity=String(clamp(1-abs*.66,.07,1));card.style.zIndex=String(10-Math.round(abs*3));card.dataset.active=String(i===index);card.tabIndex=i===index?0:-1;card.setAttribute('aria-hidden',String(i!==index));
 });
 document.querySelector('#scene-number').textContent=String(index+1).padStart(2,'0');document.querySelector('#scene-total').textContent=String(visibleCards.length).padStart(2,'0');document.querySelector('#scene-name').textContent=visibleCards[index]?.querySelector('h3').textContent||'';theatre.querySelector('.camera-line i').style.width=`${progress*100}%`;previous.disabled=index===0;next.disabled=index===visibleCards.length-1;
 const hp=clamp(renderScroll/heroHeight,0,1);
 heroTitle.style.transform=`translate3d(${-hp*90}px,${hp*40}px,${-hp*240}px) rotateX(${hp*20}deg) rotateY(${-hp*10}deg) rotateZ(${-hp*3}deg)`;
 heroGrid.style.transform=`translate3d(${hp*35}px,${hp*-30}px,0) rotateX(${hp*-8}deg) rotateY(${hp*12}deg)`;
 for(const {element,center} of sectionLayouts){const t=clamp((center-renderScroll-h/2)/h,-1,1);element.style.transform=`perspective(2400px) rotateX(${t*(mobile?2:5)}deg) rotateY(${t*(mobile?2:5)}deg) scale(${1-Math.abs(t)*.025})`}
 const pt=clamp((h-photoLayout.top+renderScroll)/(h+photoLayout.height),0,1);photoSlots.forEach((el,i)=>{el.style.setProperty('--photo-angle',`${(pt-.5)*(i-1)*38}deg`);el.style.setProperty('--photo-y',`${Math.sin(pt*Math.PI)*(i===1?-25:15)}px`)});
 const cp=clamp((contactTop-renderScroll)/h,0,1);contactSection.style.setProperty('--contact-cut',`${cp*12}%`);contactSection.style.setProperty('--contact-x',`${cp*(mobile?20:90)}px`);
 if(renderScroll!==scrollY)scheduleSpatial();else lastPaint=0;
}
function scheduleSpatial(){if(!frame)frame=requestAnimationFrame(paintSpatial)}
function goToPanel(index){if(!spatial)return;const {start,travel}=geometry(),fraction=visibleCards.length>1?index/(visibleCards.length-1):.5;window.scrollTo({top:start+travel*(.12+fraction*.76),behavior:'smooth'})}
previous.addEventListener('click',()=>goToPanel(Math.max(0,activeIndex-1)));next.addEventListener('click',()=>goToPanel(Math.min(visibleCards.length-1,activeIndex+1)));
theatre.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{visibleCards=cards.filter(c=>!c.hidden);activeIndex=0;updateSpatialMode();if(spatial){const {start,travel}=geometry();window.scrollTo({top:start+travel*.13,behavior:'instant'})}}));
// Keyboard navigation can reach every panel without targeting transformed offscreen cards.
theatre.addEventListener('keydown',e=>{if(!spatial||e.target.closest('.filters'))return;if(e.key==='ArrowRight'){e.preventDefault();goToPanel(Math.min(visibleCards.length-1,activeIndex+1))}if(e.key==='ArrowLeft'){e.preventDefault();goToPanel(Math.max(0,activeIndex-1))}});
motionButton.addEventListener('click',updateSpatialMode);reduced.addEventListener('change',()=>{paused=reduced.matches;setMotion();updateSpatialMode()});spatialMedia.addEventListener('change',updateSpatialMode);addEventListener('scroll',scheduleSpatial,{passive:true});addEventListener('resize',()=>{measureSpatial();renderScroll=scrollY;scheduleSpatial()});addEventListener('load',()=>{measureSpatial();scheduleSpatial()});document.fonts?.ready.then(()=>{measureSpatial();scheduleSpatial()});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;lastPaint=0}else{renderScroll=scrollY;scheduleSpatial()}});updateSpatialMode();
