import{chromium}from'/Users/rintaro/.codex/skills/lp-copy/scripts/node_modules/playwright/index.mjs';import{readFile,writeFile,mkdir}from'node:fs/promises';import path from'node:path';
const root=path.resolve('heroes/copied-source-ui'),specs=JSON.parse(await readFile(root+'/page31-specs.json','utf8')),results=[];let next=0;
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
await Promise.all(Array.from({length:2},async()=>{while(next<specs.length){const s=specs[next++];for(const[width,height]of[[1440,1000],[1280,900],[768,1024],[390,844]]){
 const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',serviceWorkers:'block'}),p=await c.newPage(),errors=[],external=[];
 await c.route('**/*',route=>{if(new URL(route.request().url()).origin!=='http://127.0.0.1:4173'){external.push(route.request().url());return route.abort()}return route.continue()});
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.goto('http://127.0.0.1:4173/heroes/copied-source-ui/'+s.id+'/index.html');await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
 const state=await p.evaluate(()=>{
  const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
  const hero=rect(document.querySelector('.hero')),critical=[...document.querySelectorAll('h1,.support,.actions a')].map(el=>({text:el.textContent,box:rect(el)}));
  const clipping=critical.filter(x=>x.box.x<0||x.box.right>innerWidth+1||x.box.y<hero.y-1||x.box.bottom>hero.bottom+1);
  const mascot=document.querySelector('.president'),m=mascot&&rect(mascot),overlap=m?critical.filter(x=>Math.min(m.right,x.box.right)-Math.max(m.x,x.box.x)>2&&Math.min(m.bottom,x.box.bottom)-Math.max(m.y,x.box.y)>2).map(x=>x.text):[];
  const h=document.querySelector('h1');return{overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),clipping,overlap,headline:h.textContent,hero,critical,cta:[...document.querySelectorAll('.actions a')].map(a=>a.getAttribute('href'))};
 });
 const screenshot=width===1440?root+'/screenshots/'+s.id+'-desktop.png':width===390?root+'/screenshots/'+s.id+'-mobile.png':root+'/qa/page31/'+s.id+'-'+width+'.png';await p.screenshot({path:screenshot,fullPage:true});
 const passed=!state.overflow&&!state.broken.length&&!state.clipping.length&&!state.overlap.length&&!errors.length&&!external.length;results.push({id:s.id,width,height,...state,errors,external,passed});console.log(s.id,width,passed?'PASS':'FAIL',JSON.stringify({clipping:state.clipping,overlap:state.overlap,errors}));await c.close();
 }}}));await browser.close();await writeFile(root+'/qa/page31/layout.json',JSON.stringify(results,null,2));
