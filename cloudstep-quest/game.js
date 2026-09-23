'use strict';
(() => {
  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d'), $ = id => document.getElementById(id);
  const W=canvas.width,H=canvas.height,T=24,ROWS=14,gravity=1450;let COLS=74,WORLD_W=COLS*T,WORLD_H=ROWS*T;
  const LEVELS=[
    {name:'High Meadows',short:'MEADOW',biome:'Rolling grasslands',icon:'✦',sky:['#6ec9e4','#b2e8dd','#f3dfa8'],far:'#54aa8c',near:'#73bd9a',ground:'#956044',top:'#58a85f',trim:'#a5d878',water:false,gaps:[17,31,46,60]},
    {name:'Coral Coast',short:'CORAL',biome:'Tides & treasure',icon:'≈',sky:['#69cee0','#a8e5d5','#ffdb9b'],far:'#438d92',near:'#60a99f',ground:'#a88657',top:'#dcbd78',trim:'#f1da9a',water:true,gaps:[16,30,45,59]},
    {name:'Rootdeep Mine',short:'ROOTDEEP',biome:'Lantern-lit caves',icon:'◆',sky:['#15243b','#243951','#40506a'],far:'#293952',near:'#37445b',ground:'#4d4a58',top:'#7a7181',trim:'#aaa0a9',water:false,gaps:[17,32,46,61]},
    {name:'Sunspun Desert',short:'DUNES',biome:'Warm sands & ruins',icon:'☼',sky:['#e59b5e','#f1c37a','#f5dfa2'],far:'#ba8558',near:'#d6a65f',ground:'#ad704a',top:'#c99b5e',trim:'#e1bd77',water:false,gaps:[16,31,45,60]},
    {name:'Updraft Isles',short:'UPDRAFT',biome:'Cloud-top platforms',icon:'↑',sky:['#5eb9e5','#a8e1ee','#eaf6db'],far:'#6c9eb9',near:'#a5ccd0',ground:'#8397a2',top:'#e7f3e4',trim:'#fff8e8',water:false,gaps:[17,31,46,60]},
    {name:'Pinewild Forest',short:'PINEWILD',biome:'A path through pines',icon:'♠',sky:['#55988f','#9bc7a0','#d8dc9e'],far:'#315e56',near:'#427a5d',ground:'#705544',top:'#467b4e',trim:'#88b96a',water:false,gaps:[16,30,46,59]},
    {name:'Frostveil Peak',short:'FROSTVEIL',biome:'Slippery snowfields',icon:'❄',sky:['#79bfd9','#c7e7e9','#f1f7ec'],far:'#688fa7',near:'#a5c5ca',ground:'#637782',top:'#cdebf0',trim:'#f4ffff',water:false,gaps:[17,32,45,60]},
    {name:'Emberfall Caldera',short:'EMBERFALL',biome:'A blazing finale',icon:'▲',sky:['#a44951','#d36b52','#f6a85e'],far:'#613e50',near:'#88504a',ground:'#603d42',top:'#b65b48',trim:'#ec9960',water:false,gaps:[16,31,46,59]}
  ];
  const MAP_NODES=[[38,175],[84,133],[130,171],[176,126],[222,163],[267,116],[311,151],[348,92]];
  const offsets=[[[7,8,4],[13,6,3],[23,9,4],[29,7,4],[38,8,4],[44,6,4],[53,9,4],[59,7,4],[66,8,3]],[[8,8,4],[13,6,3],[22,9,4],[29,7,4],[37,8,4],[44,6,4],[52,9,4],[59,7,4],[66,8,3]]];
  let levelIndex=0,unlocked=1,mapSelection=0,tiles,gems=[],bugs=[],sparks=[],waterZones=[],score=0,lives=3,state='ready',stage,cameraX=0,cameraY=0,powered=false,invincible=0,clock=0,last=0,acc=0,checkpoint=3;
  const control={left:false,right:false,jump:false};
  const hero={x:3*T,y:0,w:18,h:24,vx:0,vy:0,facing:1,grounded:false,coyote:0,jumpBuffer:0,anim:0};
  try{unlocked=Math.max(1,Math.min(LEVELS.length,Number(localStorage.getItem('cloudstep-unlocked'))||1));}catch{}
  const solid=(x,y)=>x<0||x>=COLS||(y>=0&&y<ROWS&&tiles?.[y]?.[x]!=null);
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

  function buildWorld(index){
    stage=LEVELS[index];COLS=74;WORLD_W=COLS*T;WORLD_H=ROWS*T;
    tiles=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    const gapStarts=stage.gaps;
    for(let x=0;x<COLS;x++){if(!gapStarts.some((g,i)=>x>=g&&x<g+(i%2?3:2))){tiles[12][x]='grass';tiles[13][x]='dirt';}}
    const pattern=offsets[index%2];
    for(const [x,y,n]of pattern)for(let i=0;i<n;i++)tiles[y][x+i]=i===0?'edgeL':i===n-1?'edgeR':'ledge';
    [[10,7],[28,8],[33,6],[45,7],[61,8],[67,7]].forEach(([x,y])=>{tiles[y][x]='mystery';});
    gems=[];const add=(x,y,powerOrb=false)=>gems.push({x:x*T+12,y:y*T+12,alive:true,bob:Math.random()*6,power:powerOrb});
    [[4,10],[6,9],[8,7],[9,7],[12,9],[14,5],[15,5],[16,5],[20,9],[23,10],[25,8],[26,8],[28,7],[30,6],[31,6],[34,5],[37,9],[40,10],[42,7],[43,7],[45,6],[48,5],[49,5],[50,5],[53,9],[56,10],[59,8],[61,7],[63,7],[65,6],[68,9]].forEach(([x,y])=>add(x,y));
    add(51,10,true);
    bugs=[[13,1],[29,-1],[43,1],[62,-1]].map(([x,d])=>({x:x*T,y:12*T-15,w:19,h:15,vx:d*36,alive:true,phase:Math.random()*6}));
    waterZones=stage.water?[[8,7,11,5],[34,8,9,4]]:[];
    sparks=[];checkpoint=3;hero.x=checkpoint*T;hero.y=12*T-hero.h;hero.vx=hero.vy=0;hero.grounded=true;hero.coyote=.1;hero.jumpBuffer=0;hero.facing=1;cameraX=cameraY=0;
  }
  function makeLevelCards(){
    const nav=$('level-list');nav.replaceChildren();
    LEVELS.forEach((land,i)=>{const button=document.createElement('button');button.type='button';button.className='level-card';button.dataset.level=String(i);button.disabled=i>=unlocked;button.setAttribute('aria-label',`${i+1}, ${land.name}${button.disabled?', locked':''}`);button.innerHTML=`<span class="number">${button.disabled?'×':String(i+1).padStart(2,'0')}</span><span class="land"><span class="name">${land.name}</span><span class="biome">${land.biome}</span></span>`;button.addEventListener('click',()=>{if(i<unlocked)startLevel(i);});nav.append(button);});
    $('map-progress').textContent=`${unlocked} OF 8 LANDS OPEN`;
    nav.querySelectorAll('.level-card').forEach(b=>b.classList.toggle('selected',Number(b.dataset.level)===mapSelection));
  }
  function hud(){
    $('score').textContent=String(score).padStart(6,'0');$('lives').textContent='♥ '.repeat(Math.max(0,lives)).trim()||'—';
    $('level').textContent=state==='map'?'MAP':`${String(levelIndex+1).padStart(2,'0')} / 08`;
    $('world-name').textContent=state==='map'?'WORLD 1 · STORYBOOK ROUTE':`WORLD 1 · ${stage?.name.toUpperCase()||'THE HIGH MEADOWS'}`;
    $('pause').disabled=state!=='playing'&&state!=='paused';$('pause').textContent=state==='paused'?'Resume':'Pause';
    $('hint').textContent=state==='playing'?(isSwimming()?'SPLASH! TAP JUMP TO SWIM':powered?'SKYFLOWER POWER · GO GET ’EM':`${Math.max(0,Math.ceil((WORLD_W-hero.x)/T))} CLOUDSTEPS TO GO`):state==='paused'?'ADVENTURE ON HOLD':state==='won'?'LAND COMPLETE · NEXT STOP UNLOCKED':state==='over'?'PIP NEEDS A BREATHER':state==='map'?'PICK A NUMBERED STOP · FINISH TO UNLOCK THE NEXT':'READY FOR ADVENTURE';
    $('world-panel').hidden=state!=='map';$('touch-controls').hidden=state==='map'||state==='ready'||state==='won'||state==='over';$('map-button').hidden=state!=='playing'&&state!=='paused';
    canvas.dataset.gameState=state;canvas.dataset.level=String(levelIndex+1);canvas.dataset.theme=stage?.name||'';canvas.dataset.playerX=String(Math.round(hero.x));canvas.dataset.playerY=String(Math.round(hero.y));canvas.dataset.score=String(score);canvas.dataset.lives=String(lives);canvas.dataset.swimming=String(isSwimming());
  }
  function show(title,copy,ribbon,button){$('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('ribbon').textContent=ribbon;$('start').textContent=button;$('overlay').hidden=false;}
  function startCampaign(){score=0;lives=3;powered=false;mapSelection=0;openMap();}
  function openMap(){state='map';control.left=control.right=control.jump=false;$('overlay').hidden=true;makeLevelCards();hud();}
  function startLevel(index){if(index>=unlocked)return;control.left=control.right=control.jump=false;levelIndex=index;mapSelection=index;lives=3;powered=false;invincible=0;state='playing';buildWorld(index);$('overlay').hidden=true;hud();}
  function togglePause(){if(state==='playing'){state='paused';show('Take a sky break.','Pip will be right here when you are ready.','PAUSED','Back to it');}else if(state==='paused'){$('overlay').hidden=true;state='playing';last=performance.now();}hud();}
  function solidAt(px,py){return solid(Math.floor(px/T),Math.floor(py/T));}
  function swimming(){if(!stage?.water)return false;const cx=hero.x+hero.w/2,cy=hero.y+hero.h/2;return waterZones.some(([x,y,w,h])=>cx>=x*T&&cx<=(x+w)*T&&cy>=y*T&&cy<(y+h)*T);}
  function isSwimming(){return state==='playing'&&swimming();}
  function bumpBlock(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(tiles[ty]?.[tx]==='mystery'){tiles[ty][tx]='used';score+=100;sparks.push({x:tx*T+12,y:ty*T,life:.6,text:'+100'});}}
  function moveHero(dt){
    const wasGrounded=hero.grounded,inWater=swimming(),oldBottom=hero.y+hero.h,direction=(control.right?1:0)-(control.left?1:0);
    if(direction){hero.vx+=direction*(inWater?640:1060)*dt;hero.vx=Math.max(-(inWater?96:158),Math.min(inWater?96:158,hero.vx));hero.facing=direction;}else hero.vx*=Math.pow(inWater?.018:.0008,dt);
    if(Math.abs(hero.vx)<2)hero.vx=0;hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);hero.coyote=wasGrounded?.105:Math.max(0,hero.coyote-dt);
    if(hero.jumpBuffer>0&&(hero.coyote>0||inWater)){hero.vy=inWater?-260:-478;hero.grounded=false;hero.coyote=0;hero.jumpBuffer=0;}
    if(inWater&&control.jump&&hero.vy> -180)hero.vy-=520*dt;
    hero.vy=Math.min(inWater?220:560,hero.vy+(control.jump&&hero.vy<0?gravity*.57:gravity)*(inWater?.36:1)*dt);
    hero.x+=hero.vx*dt;
    if(hero.vx>0&&(solidAt(hero.x+hero.w,hero.y+2)||solidAt(hero.x+hero.w,hero.y+hero.h-2)))hero.x=Math.floor((hero.x+hero.w)/T)*T-hero.w-.01,hero.vx=0;
    if(hero.vx<0&&(solidAt(hero.x,hero.y+2)||solidAt(hero.x,hero.y+hero.h-2)))hero.x=(Math.floor(hero.x/T)+1)*T+.01,hero.vx=0;
    hero.y+=hero.vy*dt;hero.grounded=false;
    if(hero.vy>=0&&(solidAt(hero.x+2,hero.y+hero.h)||solidAt(hero.x+hero.w-2,hero.y+hero.h))){hero.y=Math.floor((hero.y+hero.h)/T)*T-hero.h;hero.vy=0;hero.grounded=true;}
    if(hero.vy<0&&(solidAt(hero.x+2,hero.y)||solidAt(hero.x+hero.w-2,hero.y))){const tx1=Math.floor((hero.x+2)/T),tx2=Math.floor((hero.x+hero.w-2)/T),ty=Math.floor(hero.y/T);bumpBlock(hero.x+2,hero.y);if(tx1!==tx2)bumpBlock(hero.x+hero.w-2,hero.y);hero.y=(ty+1)*T+.01;hero.vy=40;}
    hero.x=Math.max(0,Math.min(WORLD_W-hero.w,hero.x));if(hero.grounded&&hero.x/T>checkpoint+12)checkpoint=Math.floor(hero.x/T)-2;hero.anim+=Math.abs(hero.vx)*dt*.18;
    if(hero.y>WORLD_H+30)hurt(true);if(invincible>0)invincible=Math.max(0,invincible-dt);
  }
  function hurt(fall=false){if(state!=='playing'||invincible>0)return;lives--;powered=false;if(lives<=0){state='over';show('A tumble in the clouds.','Try the level again, or head back to the storybook map.','QUEST PAUSED','Retry level');}else{hero.x=fall?checkpoint*T:Math.max(0,hero.x-34);hero.y=12*T-hero.h;hero.vx=hero.vy=0;hero.grounded=true;invincible=1.45;}hud();}
  function collectAndStomp(dt,oldBottom){
    for(const gem of gems)if(gem.alive&&overlap(hero,{x:gem.x-7,y:gem.y-7,w:14,h:14})){gem.alive=false;if(gem.power){powered=true;score+=500;sparks.push({x:gem.x,y:gem.y,life:1,text:'SKYFLOWER!'});}else{score+=50;sparks.push({x:gem.x,y:gem.y,life:.45,text:'+50'});}}
    for(const bug of bugs)if(bug.alive){bug.x+=bug.vx*dt;const edge=bug.vx>0?bug.x+bug.w+2:bug.x-2;if(solidAt(edge,bug.y+3)||!solidAt(edge,bug.y+bug.h+3))bug.vx=-bug.vx;if(overlap(hero,bug)){if(hero.vy>60&&oldBottom<=bug.y+8){bug.alive=false;hero.vy=-290;hero.grounded=false;score+=250;sparks.push({x:bug.x,y:bug.y,life:.5,text:'+250'});}else if(powered){bug.alive=false;score+=250;}else hurt(false);}}
    for(const spark of sparks)spark.life-=dt;sparks=sparks.filter(s=>s.life>0);
    if(hero.x>=(COLS-5)*T)completeLevel();
  }
  function completeLevel(){if(state!=='playing')return;score+=lives*500;unlocked=Math.max(unlocked,Math.min(LEVELS.length,levelIndex+2));try{localStorage.setItem('cloudstep-unlocked',String(unlocked));}catch{}state='won';const lastLand=levelIndex===LEVELS.length-1;show(lastLand?'You crossed every land!':`Welcome to ${LEVELS[levelIndex+1].name}!`,lastLand?'Pip found every corner of the Storybook Route. A new adventure awaits.':'You cleared '+stage.name+' and opened '+LEVELS[levelIndex+1].name+'. Return to the map to choose your next stop.',lastLand?'WORLD 1 COMPLETE':'NEW STOP UNLOCKED',lastLand?'Back to the map':'Back to the map');hud();makeLevelCards();}
  function update(dt){clock+=dt;const oldBottom=hero.y+hero.h;moveHero(dt);if(state!=='playing')return;collectAndStomp(dt,oldBottom);cameraX=Math.max(0,Math.min(WORLD_W-W,hero.x-W*.38));cameraY=Math.max(0,Math.min(WORLD_H-H,hero.y-H*.63));hud();}

  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function drawCloud(x,y,s=1,color='#fff8e8'){rect(x,y+5*s,24*s,8*s,color);rect(x+5*s,y,12*s,12*s,color);rect(x+15*s,y+3*s,12*s,10*s,color);}
  function drawHill(x,y,w,h,color){rect(x,y+10,w,h-10,color);rect(x+10,y,w-20,h,color);rect(x+4,y+5,w-8,h-5,color);}
  function drawBackground(){
    const palette=stage,sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,palette.sky[0]);sky.addColorStop(.65,palette.sky[1]);sky.addColorStop(1,palette.sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    rect(302-cameraX*.06,20,29,29,palette.sky[2]);rect(308-cameraX*.06,14,17,42,palette.sky[2]);
    for(let i=0;i<7;i++){const x=((i*99-cameraX*.17)%(W+100)+W+100)%(W+100)-42;if(levelIndex===2){rect(x,30+(i*17)%96,8,12,palette.near);rect(x+8,36+(i*13)%85,12,7,palette.far);}else drawCloud(x,25+(i*37)%88,.66+(i%3)*.13,levelIndex===6?'#effaff':'#fff8e8');}
    for(let i=0;i<7;i++){const x=((i*103-cameraX*.29)%(W+125)+W+125)%(W+125)-54;drawHill(x,143+(i%2)*20,104,95,i%2?palette.near:palette.far);if(levelIndex===5){rect(x+28,146+(i%2)*20,7,29,'#4b443c');rect(x+19,154+(i%2)*20,25,18,palette.near);}if(levelIndex===7){rect(x+35,154+(i%2)*20,10,27,'#f08a56');rect(x+39,161+(i%2)*20,4,16,'#ffd071');}}
  }
  function drawTile(x,y,type){const sx=x*T-cameraX,sy=y*T-cameraY;if(type==='grass'||type==='dirt'){rect(sx,sy,T,T,stage.ground);rect(sx,sy+8,T,16,stage.ground);rect(sx+3,sy+11,5,3,stage.trim);rect(sx+15,sy+18,5,3,stage.top);rect(sx,sy,T,6,stage.top);rect(sx,sy,T,3,stage.trim);if((x+y)%3===0)rect(sx+18,sy+6,3,3,stage.trim);}else if(type==='ledge'||type==='edgeL'||type==='edgeR'){rect(sx,sy,T,T,stage.ground);rect(sx,sy,T,5,stage.top);rect(sx+2,sy+8,T-4,2,stage.trim);rect(sx+4,sy+15,4,4,stage.trim);rect(sx+16,sy+11,5,5,stage.ground);if(type==='edgeL')rect(sx,sy,4,T,stage.trim);if(type==='edgeR')rect(sx+20,sy,4,T,stage.trim);}else if(type==='mystery'||type==='used'){rect(sx+1,sy+1,22,22,type==='mystery'?'#f1a94f':'#9b8b71');rect(sx+3,sy+3,18,18,type==='mystery'?'#ffd979':'#b2a38b');rect(sx+6,sy+5,12,3,'#fff0b0');if(type==='mystery'){rect(sx+9,sy+8,6,8,'#fff8d4');rect(sx+7,sy+9,10,5,'#fff8d4');rect(sx+10,sy+18,4,2,'#b36e38');}else rect(sx+8,sy+8,8,8,'#b5a68d');}}
  function drawWater(){for(const [x,y,w,h]of waterZones){const sx=x*T-cameraX,sy=y*T-cameraY;ctx.globalAlpha=.67;rect(sx,sy,w*T,h*T,'#269eb9');ctx.globalAlpha=.8;for(let i=0;i<w*T;i+=34)rect(sx+i+((clock*15)%34),sy+5+(i%3)*5,12,2,'#c5f5e7');ctx.globalAlpha=1;for(let i=0;i<4;i++){const bx=sx+((i*53+clock*20)%(w*T)),by=sy+((i*41+clock*10)%(h*T));rect(bx,by,2,2,'#bdf3ee');}}}
  function drawHero(){const x=Math.round(hero.x-cameraX),y=Math.round(hero.y-cameraY);if(invincible>0&&Math.floor(clock*15)%2===0)return;ctx.save();if(hero.facing<0){ctx.translate(x+hero.w,y);ctx.scale(-1,1);}else ctx.translate(x,y);const run=hero.grounded&&Math.abs(hero.vx)>8?Math.floor(hero.anim)%2:0;rect(5,1,10,5,'#e9a461');rect(3,5,14,11,'#42a9a0');rect(1,9,5,8,'#35928e');rect(6,8,8,7,'#f0bd83');rect(13,9,3,3,'#243850');rect(6,14,10,5,'#674969');rect(3,17,6,4,'#44354d');rect(12,17,6,4,'#44354d');rect(run?1:3,20,7,3,'#5b3e39');rect(run?12:10,20,7,3,'#5b3e39');rect(1,22,8,2,'#e3b16f');rect(11,22,8,2,'#e3b16f');rect(5,0,12,2,'#f6d08a');if(powered){rect(4,-4,12,4,'#f47662');rect(2,-2,3,4,'#f47662');rect(15,-2,3,4,'#f47662');}ctx.restore();}
  function drawBug(b){const x=Math.round(b.x-cameraX),y=Math.round(b.y-cameraY),step=Math.floor(clock*8+b.phase)%2;rect(x+3,y+4,14,9,'#b65354');rect(x+1,y+7,18,6,'#dd735f');rect(x+4,y+3,4,4,'#f2a66f');rect(x+12,y+3,4,4,'#f2a66f');rect(x+5,y+8,3,3,'#fff3d6');rect(x+12,y+8,3,3,'#fff3d6');rect(x+6,y+9,2,2,'#27364a');rect(x+13,y+9,2,2,'#27364a');rect(x+3,y+13,5,2,'#603a42');rect(x+12,y+13,5,2,'#603a42');rect(x+(step?1:4),y+14,5,2,'#533a43');rect(x+(step?12:10),y+14,6,2,'#533a43');}
  function drawGoal(){const x=(COLS-5)*T-cameraX,y=12*T-cameraY;rect(x+8,y-66,4,66,'#f5e3b0');rect(x+12,y-65,22,17,'#f5c967');rect(x+12,y-65,8,7,'#fff0bc');rect(x+12,y-52,8,4,'#fff0bc');rect(x-5,y,30,12,'#ddc18a');rect(x-1,y+3,22,9,'#8d685b');rect(x+4,y+5,12,7,'#14243a');}
  function drawMap(){
    const sea=ctx.createLinearGradient(0,0,0,H);sea.addColorStop(0,'#3e99ad');sea.addColorStop(1,'#1e617b');ctx.fillStyle=sea;ctx.fillRect(0,0,W,H);
    for(let i=0;i<15;i++){const x=(i*47+Math.sin(clock+i)*5)%W,y=15+(i*31)%H;rect(x,y,18,1,'#78bdba');rect(x+7,y+3,12,1,'#65abb0');}
    // Storybook islands: a stitched chain crossing the map.
    [[21,150,62,54],[75,105,59,64],[126,145,62,58],[174,99,62,57],[221,137,66,60],[268,91,62,60],[309,125,58,59],[329,55,48,53]].forEach(([x,y,w,h],i)=>{drawHill(x,y,w,h,i%2?'#567b5e':'#64885d');rect(x+11,y+12,w-22,h-18,i%2?'#8ab977':'#9cc476');rect(x+19,y+19,8,6,'#bed58d');});
    ctx.beginPath();MAP_NODES.forEach(([x,y],i)=>{if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.strokeStyle='#f9d98e';ctx.lineWidth=3;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
    MAP_NODES.forEach(([x,y],i)=>{const open=i<unlocked,active=i===mapSelection,c=LEVELS[i];ctx.fillStyle=active?'#fff0b0':open?'#f4d18b':'#738392';ctx.beginPath();ctx.arc(x,y,active?12:10,0,Math.PI*2);ctx.fill();ctx.fillStyle=open?c.ground:'#394b5c';ctx.fillRect(x-6,y-6,12,12);ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(String(i+1),x,y+3);ctx.fillStyle=open?'#f4f4df':'#9da9b3';ctx.font='6px monospace';ctx.fillText(c.short.slice(0,8),x,y+18);if(i===1){ctx.fillStyle='#d0f6ee';ctx.fillRect(x-12,y+9,24,2);ctx.fillRect(x-8,y+12,16,2);}if(i===2){ctx.fillStyle='#ffd979';ctx.fillRect(x-3,y+10,6,7);}});
    ctx.fillStyle='#f4f0d6';ctx.font='bold 9px monospace';ctx.textAlign='left';ctx.fillText('PIP’S STORYBOOK MAP',12,17);ctx.fillStyle='#d0e6d9';ctx.font='7px monospace';ctx.fillText('FOLLOW THE DOTTED PATH · TAP AN OPEN STOP',12,29);
  }
  function draw(){ctx.imageSmoothingEnabled=false;if(state==='map'){drawMap();return;}drawBackground();for(let y=0;y<ROWS;y++)for(let x=Math.max(0,Math.floor(cameraX/T)-1);x<Math.min(COLS,Math.ceil((cameraX+W)/T)+1);x++){const type=tiles?.[y]?.[x];if(type)drawTile(x,y,type);}drawWater();for(const g of gems||[])if(g.alive){const x=Math.round(g.x-cameraX),y=Math.round(g.y-cameraY+Math.sin(clock*5+g.bob)*2);rect(x-4,y-5,8,10,g.power?'#f97875':'#6c4fc1');rect(x-2,y-7,4,14,g.power?'#ff9a78':'#8f77ed');rect(x-1,y-4,2,4,'#fff3bf');}for(const b of bugs||[])if(b.alive)drawBug(b);drawGoal();drawHero();for(const s of sparks||[]){ctx.globalAlpha=Math.min(1,s.life*2);ctx.fillStyle='#fff4ba';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(s.text,Math.round(s.x-cameraX),Math.round(s.y-cameraY-s.life*24));ctx.globalAlpha=1;}if(state==='playing'){rect(9,9,88,4,'#23465c');rect(9,9,88*Math.max(0,(WORLD_W-hero.x)/WORLD_W),4,'#fff1bd');}}
  function frame(now){const elapsed=Math.min(.05,(now-last)/1000||0);last=now;if(state==='playing'){acc+=elapsed;while(acc>=1/60){update(1/60);acc-=1/60;}}draw();requestAnimationFrame(frame);}
  function setControl(name,on){if(name==='jump'&&on&&!control.jump)hero.jumpBuffer=.12;control[name]=on;if(on&&state==='ready')startCampaign();}
  function keyDown(e){const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w','p','enter'].includes(k))e.preventDefault();if(state==='map'){if(k==='arrowleft'||k==='a')mapSelection=Math.max(0,mapSelection-1);if(k==='arrowright'||k==='d')mapSelection=Math.min(unlocked-1,mapSelection+1);if(k==='enter'&&mapSelection<unlocked)startLevel(mapSelection);makeLevelCards();return;}if(k==='arrowleft'||k==='a')setControl('left',true);if(k==='arrowright'||k==='d')setControl('right',true);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',true);if(k==='p')togglePause();}
  function keyUp(e){const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')setControl('left',false);if(k==='arrowright'||k==='d')setControl('right',false);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',false);}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>{control.left=control.right=control.jump=false;});
  document.querySelectorAll('[data-action]').forEach(button=>{const action=button.dataset.action;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);setControl(action,true);});const release=e=>{e.preventDefault();setControl(action,false);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',()=>setControl(action,false));});
  canvas.addEventListener('pointerdown',e=>{if(state!=='map')return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let nearest=-1,distance=16;MAP_NODES.forEach(([nx,ny],i)=>{const d=Math.hypot(x-nx,y-ny);if(d<distance){distance=d;nearest=i;}});if(nearest>=0){mapSelection=nearest;if(nearest<unlocked)startLevel(nearest);else{makeLevelCards();hud();}}});
  $('start').addEventListener('click',()=>{if(state==='ready')startCampaign();else if(state==='paused')togglePause();else if(state==='won')openMap();else if(state==='over')startLevel(levelIndex,true);});
  $('pause').addEventListener('click',togglePause);$('map-button').addEventListener('click',openMap);$('restart').addEventListener('click',()=>state==='map'?startCampaign():state==='ready'?startCampaign():startLevel(levelIndex,true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
  buildWorld(0);hud();requestAnimationFrame(frame);
})();
