'use strict';
const layout=[
'###################',
'#o.......#.......o#',
'#.##.###.#.###.##.#',
'#.................#',
'#.##.#.#####.#.##.#',
'#....#...#...#....#',
'####.###.#.###.####',
'#....#.......#....#',
'#.##.#.##.##.#.##.#',
'#......#   #......#',
'#.##.#.#   #.#.##.#',
'#....#.......#....#',
'####.#.#####.#.####',
'#........#........#',
'#.##.###.#.###.##.#',
'#o.#..... .....#.o#',
'##.#.#.#####.#.#.##',
'#....#...#...#....#',
'#.######.#.######.#',
'#.................#',
'###################'];
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
const dirs={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}},cell=32;
let grid,player,ghosts,score=0,lives=3,level=1,best=0,state='ready',power=0,grace=0,remaining=0,acc=0,last=0,steps=0;
try{best=Number(localStorage.getItem('midnight-maze-best'))||0;}catch{}
function walk(x,y){return layout[y]?.[x]!==undefined&&layout[y][x]!=='#';}
function actors(){player={x:9,y:15,dir:'left',next:'left'};ghosts=[{x:8,y:9,color:'#ff789e'},{x:9,y:9,color:'#ac94ff'},{x:10,y:9,color:'#6cdff5'}];grace=15;power=0;}
function board(){grid=layout.map(r=>r.split(''));remaining=grid.flat().filter(c=>c==='.'||c==='o').length;actors();}
function hud(){if(score>best){best=score;try{localStorage.setItem('midnight-maze-best',best);}catch{}}$('score').textContent=String(score).padStart(5,'0');$('best').textContent=String(best).padStart(5,'0');$('level').textContent=String(level).padStart(2,'0');$('lives').textContent='● '.repeat(lives).trim()||'—';$('pause').disabled=state!=='playing'&&state!=='paused';$('pause').textContent=state==='paused'?'Resume':'Pause';$('status').textContent=state==='playing'?(power?'POWER ON · CHASE THE GHOSTS':grace?'GET READY · SHIELD ACTIVE':remaining+' LIGHTS TO GO'):state==='paused'?'TAKE A BREATHER':state==='over'?'THE NIGHT WILL WAIT':'READY WHEN YOU ARE';}
function overlay(title,message,button){$('title').textContent=title;$('message').textContent=message;$('start').textContent=button;$('overlay').hidden=false;}
function start(){score=0;lives=3;level=1;steps=0;acc=0;board();state='playing';$('overlay').hidden=true;hud();}
function pause(){if(state==='playing'){state='paused';overlay('Take a breath.','Your midnight run is right here.','Back to the maze →');}else if(state==='paused'){state='playing';acc=0;$('overlay').hidden=true;}hud();}
function input(dir){if(state==='ready')start();if(state==='playing')player.next=dir;}
function hit(g){if(g.x!==player.x||g.y!==player.y)return false;if(power){score+=200;g.x=9;g.y=9;g.rest=10;return false;}if(grace)return false;lives--;if(!lives){state='over';overlay('Lights out.','You scored '+score+' points and reached level '+level+'. One more midnight run?','Play again →');}else actors();return true;}
function distances(){const q=[[player.x,player.y,0]],d=new Map();for(let i=0;i<q.length;i++){const[x,y,n]=q[i],key=x+','+y;if(d.has(key))continue;d.set(key,n);for(const v of Object.values(dirs))if(walk(x+v.x,y+v.y)&&!d.has((x+v.x)+','+(y+v.y)))q.push([x+v.x,y+v.y,n+1]);}return d;}
function tick(){steps++;if(power)power--;if(grace)grace--;let v=dirs[player.next];if(walk(player.x+v.x,player.y+v.y))player.dir=player.next;v=dirs[player.dir];if(walk(player.x+v.x,player.y+v.y)){player.x+=v.x;player.y+=v.y;}
const pellet=grid[player.y][player.x];if(pellet==='.'||pellet==='o'){grid[player.y][player.x]=' ';remaining--;score+=pellet==='o'?50:10;if(pellet==='o')power=55;}
for(const g of ghosts)if(hit(g)){hud();return;}
if(remaining===0){level++;board();hud();return;}
const distance=distances();if(steps%4!==0)for(const g of ghosts){if(g.rest){g.rest--;continue;}let options=Object.values(dirs).map(v=>({x:g.x+v.x,y:g.y+v.y})).filter(p=>walk(p.x,p.y));const forward=options.filter(p=>p.x!==g.prevX||p.y!==g.prevY);if(forward.length)options=forward;options.sort((a,b)=>((distance.get(a.x+','+a.y)??999)-(distance.get(b.x+','+b.y)??999))*(power?-1:1));const next=options[Math.random()<.18?Math.floor(Math.random()*options.length):0];g.prevX=g.x;g.prevY=g.y;g.x=next.x;g.y=next.y;if(hit(g))break;}hud();}
function draw(t){ctx.clearRect(0,0,608,672);ctx.fillStyle='#080e1d';ctx.fillRect(0,0,608,672);for(let y=0;y<layout.length;y++)for(let x=0;x<19;x++){const c=grid[y][x],cx=x*cell+16,cy=y*cell+16;if(c==='#'){ctx.fillStyle='#102544';ctx.strokeStyle='#285284';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x*cell+4,y*cell+4,24,24,6);ctx.fill();ctx.stroke();}else if(c==='.'||c==='o'){ctx.fillStyle=c==='o'?'#7bf0d4':'#d6cdb7';ctx.shadowColor='#7bf0d4';ctx.shadowBlur=c==='o'?14:0;ctx.beginPath();ctx.arc(cx,cy,c==='o'?6+Math.sin(t/180):2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
ctx.save();ctx.translate(player.x*cell+16,player.y*cell+16);ctx.rotate({right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[player.dir]);ctx.fillStyle=grace&&Math.floor(t/130)%2?'#fff2bd':'#ffdc78';ctx.shadowColor='#ffdc78';ctx.shadowBlur=14;const mouth=.15+Math.abs(Math.sin(t/110))*.35;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,12,mouth,Math.PI*2-mouth);ctx.closePath();ctx.fill();ctx.restore();
for(const g of ghosts){const x=g.x*cell+16,y=g.y*cell+16;ctx.fillStyle=power?(power<15&&steps%2?'#e5edff':'#4166ce'):g.color;ctx.globalAlpha=g.rest?.35:1;ctx.beginPath();ctx.arc(x,y-2,11,Math.PI,0);ctx.lineTo(x+11,y+11);ctx.lineTo(x+5,y+7);ctx.lineTo(x,y+11);ctx.lineTo(x-5,y+7);ctx.lineTo(x-11,y+11);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x-4,y-2,3,4,0,0,7);ctx.ellipse(x+4,y-2,3,4,0,0,7);ctx.fill();ctx.fillStyle='#122544';ctx.fillRect(x-4,y-2,2,3);ctx.fillRect(x+4,y-2,2,3);ctx.globalAlpha=1;}}
function frame(t){const dt=Math.min(t-last,100);last=t;if(state==='playing'){acc+=dt;const speed=Math.max(95,155-(level-1)*9);while(acc>=speed&&state==='playing'){acc-=speed;tick();}}draw(t);requestAnimationFrame(frame);}
$('start').onclick=()=>state==='paused'?pause():start();$('pause').onclick=pause;$('restart').onclick=start;
window.addEventListener('keydown',e=>{if(e.target.tagName==='BUTTON'&&(e.key===' '||e.key==='Enter'))return;const key={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'}[e.key]||{a:'left',d:'right',w:'up',s:'down'}[e.key.toLowerCase()];if(key){e.preventDefault();input(key);}if(e.code==='Space'){e.preventDefault();pause();}});
document.querySelectorAll('[data-dir]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();input(b.dataset.dir);});let touch;
canvas.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>12)input(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');touch=null;});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
board();hud();requestAnimationFrame(frame);
