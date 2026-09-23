'use strict';
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const W = canvas.width, H = canvas.height, T = 24;
  const COLS = 104, ROWS = 14, WORLD_W = COLS * T, WORLD_H = ROWS * T;
  const gravity = 1450;
  const keys = new Set();
  let tiles, gems, bugs, sparks, score = 0, lives = 3, state = 'ready', cameraX = 0, cameraY = 0;
  let powered = false, invincible = 0, clock = 0, last = 0, accumulator = 0, checkpoint = 3;
  const control = { left: false, right: false, jump: false };
  const hero = { x: 3*T, y: 0, w: 18, h: 23, vx: 0, vy: 0, facing: 1, grounded: false, coyote: 0, jumpBuffer: 0, anim: 0 };
  const solid = (x, y) => x < 0 || x >= COLS || (y >= 0 && y < ROWS && tiles[y]?.[x] != null);

  function buildWorld() {
    tiles = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    const floors = [[0,18],[22,35],[39,52],[56,69],[73,86],[90,103]];
    for (const [a,b] of floors) for (let x=a; x<=b; x++) tiles[12][x] = 'grass', tiles[13][x] = 'dirt';
    const ledges = [[8,8,4],[14,6,3],[24,9,4],[30,7,4],[41,8,4],[48,6,4],[59,9,4],[65,7,4],[77,8,5],[84,6,4],[94,9,4]];
    for (const [x,y,n] of ledges) for (let i=0;i<n;i++) tiles[y][x+i] = i===0 ? 'edgeL' : i===n-1 ? 'edgeR' : 'ledge';
    [[11,7],[27,8],[33,6],[44,7],[61,8],[68,6],[80,7],[96,8]].forEach(([x,y]) => { tiles[y][x] = 'mystery'; });
    gems = [];
    const addGem = (x,y) => gems.push({x:x*T+12,y:y*T+12,alive:true,bob:Math.random()*6});
    [[4,10],[6,9],[8,7],[9,7],[10,7],[14,5],[15,5],[16,5],[19,9],[23,10],[25,8],[26,8],[27,7],[28,7],[30,6],[31,6],[34,5],[37,9],[40,10],[42,7],[43,7],[45,6],[48,5],[49,5],[50,5],[53,9],[57,10],[60,8],[62,7],[63,7],[65,6],[66,6],[69,5],[74,10],[76,8],[78,7],[79,7],[81,6],[84,5],[85,5],[88,9],[91,10],[94,8],[95,8],[97,7],[98,7],[100,10]].forEach(([x,y])=>addGem(x,y));
    gems.push({x:45*T+12,y:11*T+3,alive:true,bob:0,power:true});
    bugs = [[13,1],[31,-1],[46,1],[63,-1],[81,1],[98,-1]].map(([x,d])=>({x:x*T,y:12*T-15,w:19,h:15,vx:d*36,alive:true,phase:Math.random()*6}));
    sparks=[]; checkpoint=3;
    hero.x=checkpoint*T;hero.y=12*T-hero.h;hero.vx=hero.vy=0;hero.grounded=true;hero.coyote=.1;hero.jumpBuffer=0;hero.facing=1;
    cameraX=cameraY=0;
  }
  function hud() {
    canvas.dataset.gameState=state;canvas.dataset.score=String(score);canvas.dataset.lives=String(lives);canvas.dataset.playerX=String(Math.round(hero.x));canvas.dataset.playerY=String(Math.round(hero.y));
    $('score').textContent=String(score).padStart(6,'0');
    $('gems').textContent=`${gems.filter(g=>!g.alive).length} / ${gems.length}`;
    $('lives').textContent='♥ '.repeat(Math.max(0,lives)).trim()||'—';
    $('pause').disabled=state!=='playing'&&state!=='paused';
    $('pause').textContent=state==='paused'?'Resume':'Pause';
    $('hint').textContent=state==='playing'?(powered?'SKYFLOWER POWER · GO GET ’EM':`${Math.max(0,Math.ceil((WORLD_W-hero.x)/T))} CLOUDSTEPS TO GO`):state==='paused'?'ADVENTURE ON HOLD':state==='won'?'THE HIGH MEADOWS ARE YOURS':state==='over'?'PIP NEEDS A BREATHER':'READY FOR ADVENTURE';
  }
  function show(title,copy,ribbon,button) {
    $('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('ribbon').textContent=ribbon;$('start').innerHTML=`${button} <span>▶</span>`;$('overlay').hidden=false;
  }
  function begin() { score=0;lives=3;powered=false;invincible=0;state='playing';buildWorld();$('overlay').hidden=true;hud(); }
  function togglePause() {
    if(state==='playing'){state='paused';show('Take a sky break.','Pip will be right here when you are ready.','PAUSED','Back to it');}
    else if(state==='paused'){state='playing';$('overlay').hidden=true;last=performance.now();}
    hud();
  }
  function solidAt(px,py) { return solid(Math.floor(px/T),Math.floor(py/T)); }
  function overlap(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function bumpBlock(x,y) {
    const tx=Math.floor(x/T),ty=Math.floor(y/T);
    if(tiles[ty]?.[tx]==='mystery'){tiles[ty][tx]='used';score+=100;sparks.push({x:tx*T+T/2,y:ty*T,life:.6,text:'+100'});}
  }
  function moveHero(dt) {
    const wasGrounded=hero.grounded, oldBottom=hero.y+hero.h;
    const direction=(control.right?1:0)-(control.left?1:0);
    if(direction){hero.vx+=direction*1060*dt;hero.vx=Math.max(-158,Math.min(158,hero.vx));hero.facing=direction;}
    else hero.vx*=Math.pow(.0008,dt);
    if(Math.abs(hero.vx)<2)hero.vx=0;
    hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);
    hero.coyote=wasGrounded?.105:Math.max(0,hero.coyote-dt);
    if(hero.jumpBuffer>0&&hero.coyote>0){hero.vy=-478;hero.grounded=false;hero.coyote=0;hero.jumpBuffer=0;}
    hero.vy=Math.min(560,hero.vy+(control.jump&&hero.vy<0?gravity*.57:gravity)*dt);
    hero.x+=hero.vx*dt;
    if(hero.vx>0&&(solidAt(hero.x+hero.w,hero.y+2)||solidAt(hero.x+hero.w,hero.y+hero.h-2)))hero.x=Math.floor((hero.x+hero.w)/T)*T-hero.w-.01,hero.vx=0;
    if(hero.vx<0&&(solidAt(hero.x,hero.y+2)||solidAt(hero.x,hero.y+hero.h-2)))hero.x=(Math.floor(hero.x/T)+1)*T+.01,hero.vx=0;
    hero.y+=hero.vy*dt;hero.grounded=false;
    if(hero.vy>=0&&(solidAt(hero.x+2,hero.y+hero.h)||solidAt(hero.x+hero.w-2,hero.y+hero.h))){hero.y=Math.floor((hero.y+hero.h)/T)*T-hero.h;hero.vy=0;hero.grounded=true;}
    if(hero.vy<0&&(solidAt(hero.x+2,hero.y)||solidAt(hero.x+hero.w-2,hero.y))){const tx1=Math.floor((hero.x+2)/T),tx2=Math.floor((hero.x+hero.w-2)/T),ty=Math.floor(hero.y/T);bumpBlock(hero.x+2,hero.y);if(tx1!==tx2)bumpBlock(hero.x+hero.w-2,hero.y);hero.y=(ty+1)*T+.01;hero.vy=40;}
    hero.x=Math.max(0,Math.min(WORLD_W-hero.w,hero.x));
    if(hero.grounded&&hero.x/T>checkpoint+12)checkpoint=Math.floor(hero.x/T)-2;
    hero.anim+=Math.abs(hero.vx)*dt*.18;
    if(hero.y>WORLD_H+30)hurt(true);
    if(invincible>0)invincible=Math.max(0,invincible-dt);
  }
  function hurt(fall=false) {
    if(state!=='playing'||invincible>0)return;
    lives--;powered=false;
    if(lives<=0){state='over';show('A tumble in the clouds.','The meadow can wait. Ready for one more run?','QUEST PAUSED','Try again');}
    else {hero.x=fall?checkpoint*T:Math.max(0,hero.x-34);hero.y=12*T-hero.h;hero.vx=0;hero.vy=0;hero.grounded=true;invincible=1.45;}
    hud();
  }
  function collectAndStomp(dt,oldBottom) {
    for(const gem of gems)if(gem.alive){const box={x:gem.x-7,y:gem.y-7,w:14,h:14};if(overlap(hero,box)){gem.alive=false;if(gem.power){powered=true;score+=500;sparks.push({x:gem.x,y:gem.y,life:1,text:'SKYFLOWER!'});}else {score+=50;sparks.push({x:gem.x,y:gem.y,life:.45,text:'+50'});}}}
    for(const bug of bugs)if(bug.alive){bug.x+=bug.vx*dt;const edge=bug.vx>0?bug.x+bug.w+2:bug.x-2;if(solidAt(edge,bug.y+3)||!solidAt(edge,bug.y+bug.h+3))bug.vx=-bug.vx;
      if(overlap(hero,bug)){if(hero.vy>60&&oldBottom<=bug.y+8){bug.alive=false;hero.vy=-290;hero.grounded=false;score+=250;sparks.push({x:bug.x,y:bug.y,life:.5,text:'+250'});}else if(powered){bug.alive=false;score+=250;}else hurt(false);}}
    for(const spark of sparks)spark.life-=dt;sparks=sparks.filter(s=>s.life>0);
    if(hero.x>=(COLS-5)*T){state='won';score+=lives*500;show('You found the far sky!','Pip crossed the High Meadows with '+gems.filter(g=>!g.alive).length+' sky gems and '+score+' stardust.','WORLD 1 COMPLETE','Play again');}
  }
  function update(dt) {clock+=dt;const oldBottom=hero.y+hero.h;moveHero(dt);if(state!=='playing')return;collectAndStomp(dt,oldBottom);cameraX=Math.max(0,Math.min(WORLD_W-W,hero.x-W*.38));cameraY=Math.max(0,Math.min(WORLD_H-H,hero.y-H*.63));hud();}

  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function drawCloud(x,y,s=1){rect(x,y+5*s,24*s,8*s,'#fff8e8');rect(x+5*s,y,12*s,12*s,'#fff8e8');rect(x+15*s,y+3*s,12*s,10*s,'#fff8e8');rect(x+3*s,y+13*s,22*s,3*s,'#dff4f2');}
  function drawHill(x,y,w,h,color){rect(x,y+10,w,h-10,color);rect(x+10,y,w-20,h,color);rect(x+4,y+5,w-8,h-5,color);}
  function drawBackground(){
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#6ec9e4');sky.addColorStop(.67,'#b2e8dd');sky.addColorStop(1,'#f3dfa8');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    rect(300-cameraX*.08,22,34,34,'#ffe6a1');rect(306-cameraX*.08,16,22,46,'#ffe6a1');
    for(let i=0;i<9;i++){const x=((i*97-cameraX*.16)%(W+120)+W+120)%(W+120)-50;drawCloud(x,25+(i*37)%90,.7+(i%3)*.15);}
    for(let i=0;i<7;i++){const x=((i*103-cameraX*.29)%(W+130)+W+130)%(W+130)-55;drawHill(x,145+(i%2)*17,105,90,i%2?'#73bd9a':'#54aa8c');rect(x+23,158+(i%2)*17,10,10,'#b4e4c0');rect(x+66,175+(i%2)*17,8,8,'#d6edbb');}
  }
  function drawTile(x,y,type){
    const sx=x*T-cameraX,sy=y*T-cameraY;
    if(type==='grass'||type==='dirt'){rect(sx,sy,T,T,'#956044');rect(sx,sy+8,T,16,'#b77a4f');rect(sx+2,sy+10,5,3,'#d19a61');rect(sx+14,sy+18,6,3,'#d19a61');rect(sx,sy,T,6,'#58a85f');rect(sx,sy,T,3,'#a5d878');if((x+y)%3===0)rect(sx+18,sy+6,3,3,'#d6e593');}
    else if(type==='ledge'||type==='edgeL'||type==='edgeR'){rect(sx,sy,T,T,'#dfae63');rect(sx,sy,T,5,'#a2d87b');rect(sx+2,sy+8,T-4,2,'#f5d393');rect(sx+4,sy+15,4,4,'#bd804c');rect(sx+16,sy+11,5,5,'#bd804c');if(type==='edgeL')rect(sx,sy,4,T,'#759f5f');if(type==='edgeR')rect(sx+20,sy,4,T,'#759f5f');}
    else if(type==='mystery'||type==='used'){rect(sx+1,sy+1,22,22,type==='mystery'?'#f1a94f':'#9b8b71');rect(sx+3,sy+3,18,18,type==='mystery'?'#ffd979':'#b2a38b');rect(sx+6,sy+5,12,3,type==='mystery'?'#fff0b0':'#c5b99e');if(type==='mystery'){rect(sx+9,sy+8,6,8,'#fff8d4');rect(sx+7,sy+9,10,5,'#fff8d4');rect(sx+10,sy+18,4,2,'#b36e38');}else{rect(sx+8,sy+8,8,8,'#b5a68d');rect(sx+10,sy+10,4,4,'#92836e');}}
  }
  function drawHero(){
    const x=Math.round(hero.x-cameraX),y=Math.round(hero.y-cameraY);if(invincible>0&&Math.floor(clock*15)%2===0)return;
    ctx.save();if(hero.facing<0){ctx.translate(x+hero.w,0);ctx.scale(-1,1);}else ctx.translate(x,0);
    const run=hero.grounded&&Math.abs(hero.vx)>8?Math.floor(hero.anim)%2:0;
    rect(5,1,10,5,'#e9a461');rect(3,5,14,11,'#42a9a0');rect(1,9,5,8,'#35928e');rect(6,8,8,7,'#f0bd83');rect(13,9,3,3,'#243850');rect(6,14,10,5,'#674969');rect(3,17,6,4,'#44354d');rect(12,17,6,4,'#44354d');rect(run?1:3,20,7,3,'#5b3e39');rect(run?12:10,20,7,3,'#5b3e39');rect(1,22,8,2,'#e3b16f');rect(11,22,8,2,'#e3b16f');rect(5,0,12,2,'#f6d08a');
    if(powered){rect(4,-4,12,4,'#f47662');rect(2,-2,3,4,'#f47662');rect(15,-2,3,4,'#f47662');}
    ctx.restore();
  }
  function drawBug(b){const x=Math.round(b.x-cameraX),y=Math.round(b.y-cameraY),step=Math.floor(clock*8+b.phase)%2;rect(x+3,y+4,14,9,'#b65354');rect(x+1,y+7,18,6,'#dd735f');rect(x+4,y+3,4,4,'#f2a66f');rect(x+12,y+3,4,4,'#f2a66f');rect(x+5,y+8,3,3,'#fff3d6');rect(x+12,y+8,3,3,'#fff3d6');rect(x+6,y+9,2,2,'#27364a');rect(x+13,y+9,2,2,'#27364a');rect(x+3,y+13,5,2,'#603a42');rect(x+12,y+13,5,2,'#603a42');rect(x+(step?1:4),y+14,5,2,'#533a43');rect(x+(step?12:10),y+14,6,2,'#533a43');}
  function drawGoal(){const x=(COLS-5)*T-cameraX,y=12*T-cameraY;rect(x+8,y-66,4,66,'#f5e3b0');rect(x+12,y-65,22,17,'#f5c967');rect(x+12,y-65,8,7,'#fff0bc');rect(x+12,y-52,8,4,'#fff0bc');rect(x-5,y,30,12,'#ddc18a');rect(x-1,y+3,22,9,'#8d685b');rect(x+4,y+5,12,7,'#14243a');}
  function draw(){
    ctx.imageSmoothingEnabled=false;drawBackground();
    for(let y=0;y<ROWS;y++)for(let x=Math.max(0,Math.floor(cameraX/T)-1);x<Math.min(COLS,Math.ceil((cameraX+W)/T)+1);x++){const type=tiles[y][x];if(type)drawTile(x,y,type);}
    for(const g of gems)if(g.alive){const x=Math.round(g.x-cameraX),y=Math.round(g.y-cameraY+Math.sin(clock*5+g.bob)*2);rect(x-4,y-5,8,10,g.power?'#f97875':'#6c4fc1');rect(x-2,y-7,4,14,g.power?'#ff9a78':'#8f77ed');rect(x-1,y-4,2,4,'#fff3bf');}
    for(const b of bugs)if(b.alive)drawBug(b);
    drawGoal();drawHero();
    for(const s of sparks){ctx.globalAlpha=Math.min(1,s.life*2);ctx.fillStyle='#fff4ba';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(s.text,Math.round(s.x-cameraX),Math.round(s.y-cameraY-s.life*24));ctx.globalAlpha=1;}
    if(state==='playing'){rect(9,9,88,4,'#23465c');rect(9,9,88*Math.max(0,(WORLD_W-hero.x)/WORLD_W),4,'#fff1bd');}
  }
  function frame(now){const elapsed=Math.min(.05,(now-last)/1000||0);last=now;if(state==='playing'){accumulator+=elapsed;while(accumulator>=1/60){update(1/60);accumulator-=1/60;}}draw();requestAnimationFrame(frame);}
  function setControl(name,on){if(name==='jump'&&on&&!control.jump)hero.jumpBuffer=.12;control[name]=on;if(on&&state==='ready')begin();}
  function keyDown(e){const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w','p'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='a')setControl('left',true);if(k==='arrowright'||k==='d')setControl('right',true);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',true);if(k==='p')togglePause();}
  function keyUp(e){const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')setControl('left',false);if(k==='arrowright'||k==='d')setControl('right',false);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',false);}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>{control.left=control.right=control.jump=false;});
  document.querySelectorAll('[data-action]').forEach(button=>{
    const action=button.dataset.action;
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);setControl(action,true);if(state==='ready')begin();});
    const release=e=>{e.preventDefault();setControl(action,false);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',()=>setControl(action,false));
  });
  $('start').addEventListener('click',()=>{if(state==='paused')togglePause();else begin();});
  $('pause').addEventListener('click',togglePause);$('restart').addEventListener('click',begin);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
  buildWorld();hud();requestAnimationFrame(frame);
})();
