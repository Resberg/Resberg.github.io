// A chapter trail driven by native scroll; no scrolling interception.
const routeLinks=[...document.querySelectorAll('[data-route]')];
const routeStops=routeLinks.map(link=>({link,element:document.getElementById(link.dataset.route)}));
let routeFrame=0;
function updateRoute(){routeFrame=0;const edge=innerHeight*.42;let active=0;
 routeStops.forEach((stop,i)=>{if(stop.element.getBoundingClientRect().top<=edge)active=i});
 if(scrollY+innerHeight>=document.documentElement.scrollHeight-25)active=routeStops.length-1;
 routeStops.forEach((stop,i)=>{stop.link.classList.toggle('passed',i<active);if(i===active)stop.link.setAttribute('aria-current','step');else stop.link.removeAttribute('aria-current')});
 document.querySelector('.route-current').textContent=routeStops[active].link.textContent.trim();
 document.querySelector('.route-count').textContent=String(active+1).padStart(2,'0')+' / '+String(routeStops.length).padStart(2,'0');
 const nextLink=document.querySelector('.route-next'),nextStop=routeStops[active+1]||routeStops[0];nextLink.href='#'+nextStop.element.id;nextLink.setAttribute('aria-label',active===routeStops.length-1?'Kembali ke awal perjalanan':'Lanjut ke '+nextStop.link.textContent.trim());nextLink.innerHTML=active===routeStops.length-1?'Ke awal <span aria-hidden="true">↑</span>':'Lanjut <span aria-hidden="true">↓</span>';
 const max=document.documentElement.scrollHeight-innerHeight,progress=max>0?Math.min(1,Math.max(0,scrollY/max)):0;document.querySelector('.route-progress i').style.transform=`scaleX(${progress})`;
 const start=document.querySelector('.journey-start'),r=start.getBoundingClientRect(),travel=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));start.style.setProperty('--traveller-progress',String(travel));
}
function scheduleRoute(){if(!routeFrame)routeFrame=requestAnimationFrame(updateRoute)}
addEventListener('scroll',scheduleRoute,{passive:true});addEventListener('resize',scheduleRoute);updateRoute();
const weightInput=document.querySelector('#print-weight'),estimateOutput=document.querySelector('#print-total');
const rupiah=new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0});
weightInput.addEventListener('input',()=>{const grams=Number(weightInput.value);estimateOutput.textContent=weightInput.value!==''&&weightInput.validity.valid&&Number.isFinite(grams)&&grams>0&&grams<=100000?rupiah.format(grams*500):'Isi berat valid';});
