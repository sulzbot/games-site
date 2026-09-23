'use strict';
(() => {
  const canvas = document.getElementById('game'), ctx = canvas.getContext('2d'), $ = id => document.getElementById(id);
  const W=canvas.width,H=canvas.height,T=24,ROWS=14,gravity=1450;let COLS=128,WORLD_W=COLS*T,WORLD_H=ROWS*T;
  const LEVELS=[
    {name:'High Meadows',short:'MEADOW',biome:'Rolling grasslands',icon:'✦',sky:['#6ec9e4','#b2e8dd','#f3dfa8'],far:'#54aa8c',near:'#73bd9a',ground:'#956044',top:'#58a85f',trim:'#a5d878',water:false,gaps:[[16,2],[31,3],[47,2],[62,4],[78,2],[93,3],[107,2]],layout:[[8,8,4],[13,6,4],[23,9,4],[29,7,3],[38,8,5],[45,6,4],[54,9,4],[63,7,4],[72,8,4],[82,6,4],[91,9,4],[100,7,4]],enemies:[[12,'walker'],[25,'hopper'],[39,'walker'],[52,'flyer'],[68,'armored'],[81,'hopper'],[97,'walker'],[106,'flyer']],boss:'Thornback King',bossColor:'#a95049'},
    {name:'Coral Coast',short:'CORAL',biome:'Tides & treasure',icon:'≈',sky:['#69cee0','#a8e5d5','#ffdb9b'],far:'#438d92',near:'#60a99f',ground:'#a88657',top:'#dcbd78',trim:'#f1da9a',water:true,gaps:[[15,3],[29,2],[44,4],[60,2],[75,3],[91,4],[106,2]],layout:[[7,9,5],[15,6,4],[25,8,5],[33,5,4],[42,9,5],[51,7,4],[60,5,5],[70,9,4],[79,6,5],[88,8,4],[98,5,5],[106,8,4]],enemies:[[11,'crab'],[24,'swimmer'],[37,'flyer'],[50,'crab'],[65,'swimmer'],[79,'hopper'],[94,'crab'],[105,'flyer']],boss:'Tidejaw the Deep',bossColor:'#348fa2'},
    {name:'Rootdeep Mine',short:'ROOTDEEP',biome:'Lantern-lit caves',icon:'◆',sky:['#15243b','#243951','#40506a'],far:'#293952',near:'#37445b',ground:'#4d4a58',top:'#7a7181',trim:'#aaa0a9',water:false,gaps:[[18,4],[34,2],[49,3],[65,4],[81,2],[96,4],[109,3]],layout:[[8,7,5],[18,5,4],[26,9,5],[36,7,5],[46,5,4],[56,9,5],[66,6,4],[76,8,5],[86,5,4],[96,9,5],[105,6,5]],enemies:[[13,'armored'],[27,'burrower'],[42,'hopper'],[57,'armored'],[72,'burrower'],[87,'flyer'],[101,'armored'],[108,'hopper']],boss:'Gloomstone Golem',bossColor:'#81758e'},
    {name:'Sunspun Desert',short:'DUNES',biome:'Warm sands & ruins',icon:'☼',sky:['#e59b5e','#f1c37a','#f5dfa2'],far:'#ba8558',near:'#d6a65f',ground:'#ad704a',top:'#c99b5e',trim:'#e1bd77',water:false,gaps:[[16,3],[32,4],[48,2],[64,4],[80,3],[95,2],[105,4]],layout:[[7,9,5],[17,6,4],[27,8,4],[36,5,5],[46,9,4],[55,7,5],[65,5,4],[75,9,5],[85,6,4],[95,8,5],[105,5,4]],enemies:[[12,'scorpion'],[26,'flyer'],[40,'scorpion'],[54,'hopper'],[69,'burrower'],[83,'scorpion'],[98,'flyer'],[108,'armored']],boss:'Suncrown Scarab',bossColor:'#c77d39'},
    {name:'Updraft Isles',short:'UPDRAFT',biome:'Cloud-top platforms',icon:'↑',sky:['#5eb9e5','#a8e1ee','#eaf6db'],far:'#6c9eb9',near:'#a5ccd0',ground:'#8397a2',top:'#e7f3e4',trim:'#fff8e8',water:false,gaps:[[17,4],[33,3],[49,4],[66,2],[81,4],[97,3],[106,4]],layout:[[7,8,5],[17,5,4],[27,9,4],[37,6,5],[47,4,4],[57,8,5],[67,5,4],[77,9,4],[87,6,5],[97,4,4],[107,8,5]],enemies:[[12,'flyer'],[25,'hopper'],[39,'flyer'],[53,'cloud'],[67,'hopper'],[82,'cloud'],[96,'flyer'],[108,'cloud']],boss:'Cirrus Stormwing',bossColor:'#596cc0'},
    {name:'Pinewild Forest',short:'PINEWILD',biome:'A path through pines',icon:'♠',sky:['#55988f','#9bc7a0','#d8dc9e'],far:'#315e56',near:'#427a5d',ground:'#705544',top:'#467b4e',trim:'#88b96a',water:false,gaps:[[15,2],[30,4],[46,3],[62,2],[78,4],[94,3],[108,2]],layout:[[8,8,4],[16,5,5],[26,9,4],[35,7,4],[44,5,5],[54,9,4],[63,6,5],[73,8,4],[82,5,5],[92,9,4],[101,6,5],[108,8,4]],enemies:[[12,'hopper'],[25,'burrower'],[39,'walker'],[53,'spitter'],[68,'hopper'],[82,'burrower'],[96,'spitter'],[108,'armored']],boss:'Mossmaw the Ancient',bossColor:'#577542'},
    {name:'Frostveil Peak',short:'FROSTVEIL',biome:'Slippery snowfields',icon:'❄',sky:['#79bfd9','#c7e7e9','#f1f7ec'],far:'#688fa7',near:'#a5c5ca',ground:'#637782',top:'#cdebf0',trim:'#f4ffff',water:false,gaps:[[17,4],[33,2],[49,4],[65,3],[81,4],[97,2],[106,4]],layout:[[7,6,5],[17,9,4],[27,6,5],[37,4,4],[47,9,5],[57,6,4],[67,4,5],[77,9,4],[87,6,5],[97,4,4],[107,8,5]],enemies:[[12,'skater'],[26,'flyer'],[40,'skater'],[54,'hopper'],[69,'icecaster'],[83,'skater'],[98,'flyer'],[108,'icecaster']],boss:'Glacierback Yeti',bossColor:'#6aa0bb'},
    {name:'Emberfall Caldera',short:'EMBERFALL',biome:'A blazing finale',icon:'▲',sky:['#a44951','#d36b52','#f6a85e'],far:'#613e50',near:'#88504a',ground:'#603d42',top:'#b65b48',trim:'#ec9960',water:false,gaps:[[16,4],[32,3],[48,4],[64,2],[80,4],[96,3],[106,4]],layout:[[8,8,4],[17,5,5],[27,9,4],[37,6,5],[47,4,4],[57,9,5],[67,6,4],[77,8,5],[87,5,4],[97,9,5],[107,6,5]],enemies:[[13,'fireling'],[27,'armored'],[41,'fireling'],[55,'flyer'],[70,'spitter'],[84,'fireling'],[99,'armored'],[108,'fireling']],boss:'Cinderwing the Last',bossColor:'#da5c45'}
  ];
  const MAP_NODES=[[38,175],[84,133],[130,171],[176,126],[222,163],[267,116],[311,151],[348,92]];

  let levelIndex=0,unlocked=1,mapSelection=0,tiles,gems=[],bugs=[],sparks=[],decorations=[],waterZones=[],powerups=[],fireballs=[],hostileShots=[],boss=null,score=0,lives=3,state='ready',stage,cameraX=0,cameraY=0,powerType='',powerTimer=0,damageFlash=0,fireCooldown=0,clock=0,last=0,acc=0,checkpoint=3;
  const control={left:false,right:false,jump:false,fire:false};
  const hero={x:3*T,y:0,w:18,h:24,vx:0,vy:0,facing:1,grounded:false,coyote:0,jumpBuffer:0,anim:0};
  try{unlocked=Math.max(1,Math.min(LEVELS.length,Number(localStorage.getItem('cloudstep-unlocked'))||1));}catch{}
  const solid=(x,y)=>x<0||x>=COLS||(y>=0&&y<ROWS&&tiles?.[y]?.[x]!=null);
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

  const POWER_TYPES=['fireball','size','invincibility','flight'];
  const POWER_LABELS={fireball:'FIREBALL',size:'GIANT FORM',invincibility:'INVINCIBLE',flight:'FLIGHT'};
  function buildWorld(index){
    stage=LEVELS[index];COLS=128;WORLD_W=COLS*T;WORLD_H=ROWS*T;
    tiles=Array.from({length:ROWS},()=>Array(COLS).fill(null));decorations=[];
    for(let x=0;x<COLS;x++){
      if(!stage.gaps.some(([g,w])=>x>=g&&x<g+w)){tiles[12][x]='grass';tiles[13][x]='dirt';if(x%11===4)decorations.push({x:x*T+6,y:12*T-7,type:'sprout'});if(x%17===8)decorations.push({x:x*T+7,y:12*T-5,type:'rock'});}
    }
    for(const [x,y,n]of stage.layout)for(let i=0;i<n;i++)tiles[y][x+i]=i===0?'edgeL':i===n-1?'edgeR':'ledge';
    for(const x of [11,24,39,55,70,86,101,109]){const y=6+(x%3);tiles[y][x]='mystery';}
    gems=[];const add=(x,y,powerOrb=false)=>gems.push({x:x*T+12,y:y*T+12,alive:true,bob:Math.random()*6,power:powerOrb});
    for(let x=4,n=0;x<COLS-14;x+=4,n++){const row=[9,8,10,7,9,6,10,8][(n+index)%8];add(x,row);if(n%7===3)add(x+1,row);}
    bugs=stage.enemies.map(([col,type],n)=>makeEnemy(col,type,n));
    const offsets=[0,1,2,3].map(i=>POWER_TYPES[(i+index)%4]);
    powerups=[20,44,70,96].map((col,i)=>({x:col*T+2,y:(8+(i%2))*T,w:20,h:22,type:offsets[i],alive:true,bob:Math.random()*6}));
    waterZones=stage.water?[[8,7,12,5],[42,8,11,4],[77,7,12,5]]:[];
    const bossHome=(COLS-15)*T;
    boss={x:bossHome,y:12*T-42,w:48,h:42,home:bossHome,vx:46,hp:3,hitCooldown:0,flash:0,shotTimer:2,phase:0,alive:true,name:stage.boss,color:stage.bossColor,kind:index};
    fireballs=[];hostileShots=[];sparks=[];checkpoint=3;damageFlash=0;powerType='';powerTimer=0;fireCooldown=0;
    hero.w=18;hero.h=24;hero.x=checkpoint*T;hero.y=12*T-hero.h;hero.vx=hero.vy=0;hero.grounded=true;hero.coyote=.1;hero.jumpBuffer=0;hero.facing=1;cameraX=cameraY=0;
  }
  function makeEnemy(col,type,n){
    const flying=['flyer','cloud'].includes(type),swim=type==='swimmer';
    return{x:col*T,y:flying?(5+(n%3))*T:swim?10*T:12*T-17,homeX:col*T,homeY:flying?(5+(n%3))*T:swim?10*T:12*T-17,w:type==='armored'?24:20,h:type==='armored'?20:17,vx:(n%2?1:-1)*(type==='flyer'?34:42),vy:0,alive:true,phase:n*1.7,hop:0,type,shot:2};
  }
  function grantPower(type){
    if(powerType==='size'&&type!=='size'){hero.y+=hero.h-24;hero.h=24;hero.w=18;}
    powerType=type;powerTimer=10;
    if(type==='size'){hero.y-=12;hero.h=36;hero.w=28;}
    sparks.push({x:hero.x+hero.w/2,y:hero.y,life:1.1,text:`${POWER_LABELS[type]} · 10s`});
  }
  function expirePower(){if(powerType==='size'){hero.y+=hero.h-24;hero.h=24;hero.w=18;}powerType='';powerTimer=0;}
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
    $('hint').textContent=state==='playing'?(boss?.alive&&hero.x>boss.x-180?'BOSS: JUMP ON THE HEAD · '+boss.hp+' HITS LEFT':isSwimming()?'SPLASH! TAP JUMP TO SWIM':powerType?`${POWER_LABELS[powerType]} · ${powerTimer.toFixed(1)}s`:`${Math.max(0,Math.ceil((WORLD_W-hero.x)/T))} CLOUDSTEPS TO BOSS`):state==='paused'?'ADVENTURE ON HOLD':state==='won'?'BOSS DEFEATED · NEXT STOP UNLOCKED':state==='over'?'PIP NEEDS A BREATHER':state==='map'?'PICK A NUMBERED STOP · FINISH TO UNLOCK THE NEXT':'READY FOR ADVENTURE';
    $('ability').textContent=powerType?POWER_LABELS[powerType]:'NONE';$('power-timer').textContent=powerType?`${powerTimer.toFixed(1)}s`:'Find a relic';$('fire').disabled=powerType!=='fireball';
    $('world-panel').hidden=state!=='map';$('touch-controls').hidden=state==='map'||state==='ready'||state==='won'||state==='over';$('map-button').hidden=state!=='playing'&&state!=='paused';
    canvas.dataset.gameState=state;canvas.dataset.level=String(levelIndex+1);canvas.dataset.theme=stage?.name||'';canvas.dataset.playerX=String(Math.round(hero.x));canvas.dataset.playerY=String(Math.round(hero.y));canvas.dataset.score=String(score);canvas.dataset.lives=String(lives);canvas.dataset.swimming=String(isSwimming());canvas.dataset.power=powerType;canvas.dataset.powerTime=powerTimer.toFixed(1);canvas.dataset.worldCols=String(COLS);canvas.dataset.enemyTypes=[...new Set((bugs||[]).map(e=>e.type))].join(',');canvas.dataset.bossName=boss?.name||'';canvas.dataset.bossHits=String(boss?.hp??0);canvas.dataset.bossAlive=String(Boolean(boss?.alive));canvas.dataset.playerWidth=String(hero.w);canvas.dataset.playerHeight=String(hero.h);canvas.dataset.fireballs=String(fireballs.length);canvas.dataset.hostileShots=String(hostileShots.length);canvas.dataset.relicsLeft=String(powerups.filter(p=>p.alive).length);
  }
  function show(title,copy,ribbon,button){$('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('ribbon').textContent=ribbon;$('start').textContent=button;$('overlay').hidden=false;}
  function startCampaign(){score=0;lives=3;powerType='';powerTimer=0;mapSelection=0;openMap();}
  function openMap(){state='map';control.left=control.right=control.jump=control.fire=false;if(powerType==='size'){hero.y+=hero.h-24;hero.h=24;hero.w=18;}powerType='';powerTimer=0;$('overlay').hidden=true;makeLevelCards();hud();}
  function startLevel(index){if(index>=unlocked)return;control.left=control.right=control.jump=control.fire=false;levelIndex=index;mapSelection=index;lives=3;state='playing';buildWorld(index);$('overlay').hidden=true;hud();}
  function togglePause(){if(state==='playing'){state='paused';show('Take a sky break.','Pip will be right here when you are ready.','PAUSED','Back to it');}else if(state==='paused'){$('overlay').hidden=true;state='playing';last=performance.now();}hud();}
  function solidAt(px,py){return solid(Math.floor(px/T),Math.floor(py/T));}
  function swimming(){if(!stage?.water)return false;const cx=hero.x+hero.w/2,cy=hero.y+hero.h/2;return waterZones.some(([x,y,w,h])=>cx>=x*T&&cx<=(x+w)*T&&cy>=y*T&&cy<(y+h)*T);}
  function isSwimming(){return state==='playing'&&swimming();}
  function bumpBlock(x,y){const tx=Math.floor(x/T),ty=Math.floor(y/T);if(tiles[ty]?.[tx]==='mystery'){tiles[ty][tx]='used';score+=100;sparks.push({x:tx*T+12,y:ty*T,life:.6,text:'+100'});}}
  function moveHero(dt){
    const wasGrounded=hero.grounded,inWater=swimming(),flight=powerType==='flight',oldBottom=hero.y+hero.h,direction=(control.right?1:0)-(control.left?1:0),maxSpeed=powerType==='size'?142:inWater?96:flight?166:158;
    if(direction){hero.vx+=direction*(inWater?640:1060)*dt;hero.vx=Math.max(-maxSpeed,Math.min(maxSpeed,hero.vx));hero.facing=direction;}else hero.vx*=Math.pow(inWater?.018:.0008,dt);
    if(Math.abs(hero.vx)<2)hero.vx=0;hero.jumpBuffer=Math.max(0,hero.jumpBuffer-dt);hero.coyote=wasGrounded?.105:Math.max(0,hero.coyote-dt);
    if(hero.jumpBuffer>0&&(hero.coyote>0||inWater||flight)){hero.vy=inWater?-260:flight?-250:-478;hero.grounded=false;hero.coyote=0;hero.jumpBuffer=0;}
    if(inWater&&control.jump&&hero.vy> -180)hero.vy-=520*dt;
    if(flight&&control.jump)hero.vy=Math.max(-250,hero.vy-700*dt);
    const g=flight?gravity*.12:inWater?gravity*.36:gravity;hero.vy=Math.min(flight?200:inWater?220:560,hero.vy+(control.jump&&hero.vy<0?g*.57:g)*dt);
    hero.x+=hero.vx*dt;
    if(hero.vx>0&&(solidAt(hero.x+hero.w,hero.y+2)||solidAt(hero.x+hero.w,hero.y+hero.h-2)))hero.x=Math.floor((hero.x+hero.w)/T)*T-hero.w-.01,hero.vx=0;
    if(hero.vx<0&&(solidAt(hero.x,hero.y+2)||solidAt(hero.x,hero.y+hero.h-2)))hero.x=(Math.floor(hero.x/T)+1)*T+.01,hero.vx=0;
    hero.y+=hero.vy*dt;hero.grounded=false;
    if(hero.vy>=0&&(solidAt(hero.x+2,hero.y+hero.h)||solidAt(hero.x+hero.w-2,hero.y+hero.h))){hero.y=Math.floor((hero.y+hero.h)/T)*T-hero.h;hero.vy=0;hero.grounded=true;}
    if(hero.vy<0&&(solidAt(hero.x+2,hero.y)||solidAt(hero.x+hero.w-2,hero.y))){const tx1=Math.floor((hero.x+2)/T),tx2=Math.floor((hero.x+hero.w-2)/T),ty=Math.floor(hero.y/T);bumpBlock(hero.x+2,hero.y);if(tx1!==tx2)bumpBlock(hero.x+hero.w-2,hero.y);hero.y=(ty+1)*T+.01;hero.vy=40;}
    hero.x=Math.max(0,Math.min(WORLD_W-hero.w,hero.x));if(hero.grounded&&hero.x/T>checkpoint+12)checkpoint=Math.floor(hero.x/T)-2;hero.anim+=Math.abs(hero.vx)*dt*.18;
    if(hero.y>WORLD_H+30)hurt(true);if(damageFlash>0)damageFlash=Math.max(0,damageFlash-dt);
  }
  function hurt(fall=false){if(state!=='playing'||damageFlash>0||powerType==='invincibility')return;lives--;if(lives<=0){state='over';show('A tumble in the clouds.','Try the level again, or head back to the storybook map.','QUEST PAUSED','Retry level');}else{hero.x=fall?checkpoint*T:Math.max(0,hero.x-34);hero.y=12*T-hero.h;hero.vx=hero.vy=0;hero.grounded=true;damageFlash=1.45;}hud();}
  function fireShot(x,y,targetX,targetY,speed,color){const dx=targetX-x,dy=targetY-y,d=Math.hypot(dx,dy)||1;hostileShots.push({x,y,w:8,h:8,vx:dx/d*speed,vy:dy/d*speed,life:5,color});}
  function updateEnemies(dt,oldBottom){
    for(const bug of bugs)if(bug.alive){
      if(['flyer','cloud'].includes(bug.type)){bug.x=bug.homeX+Math.sin(clock*1.15+bug.phase)*46;bug.y=bug.homeY+Math.sin(clock*2+bug.phase)*18;}
      else if(bug.type==='swimmer'){bug.x=bug.homeX+Math.sin(clock*1.4+bug.phase)*34;bug.y=bug.homeY+Math.sin(clock*2.1+bug.phase)*15;}
      else{bug.x+=bug.vx*dt;if(bug.x<bug.homeX-42||bug.x>bug.homeX+42)bug.vx=-bug.vx;bug.y=bug.homeY-(bug.type==='hopper'?Math.max(0,Math.sin(clock*2.8+bug.phase))*21:bug.type==='burrower'?Math.max(0,Math.sin(clock*2+bug.phase))*8:0);}
      if(['spitter','icecaster','cloud'].includes(bug.type)){bug.shot-=dt;if(bug.shot<=0&&Math.abs(hero.x-bug.x)<360){fireShot(bug.x+bug.w/2,bug.y+bug.h/2,hero.x+hero.w/2,hero.y+hero.h/2,bug.type==='icecaster'?145:125,bug.type==='icecaster'?'#b9f2ff':'#f5d08a');bug.shot=bug.type==='cloud'?2.6:2.2;}}
      if(overlap(hero,bug)){if(hero.vy>55&&oldBottom<=bug.y+11){bug.alive=false;hero.vy=-300;hero.grounded=false;score+=300;sparks.push({x:bug.x,y:bug.y,life:.55,text:'+300'});}else if(powerType==='invincibility'||powerType==='size'){bug.alive=false;score+=200;}else hurt(false);}
    }
  }
  function updateFireballs(dt){
    if(control.fire&&powerType==='fireball'&&fireCooldown<=0){fireballs.push({x:hero.x+(hero.facing>0?hero.w: -9),y:hero.y+hero.h*.48,w:10,h:9,vx:hero.facing*310,vy:-35,life:1.8});fireCooldown=.32;}
    fireballs=fireballs.filter(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=85*dt;f.life-=dt;if(f.life<=0||f.x<0||f.x>WORLD_W)return false;for(const e of bugs)if(e.alive&&overlap(f,e)){e.alive=false;score+=250;sparks.push({x:e.x,y:e.y,life:.55,text:'+250'});return false;}return true;});
    hostileShots=hostileShots.filter(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(s.life<=0||s.x<0||s.x>WORLD_W||s.y>WORLD_H)return false;if(overlap(hero,s)){if(powerType!=='invincibility')hurt(false);return false;}return true;});
  }
  function updateBoss(dt,oldBottom){
    if(!boss?.alive)return;boss.phase+=dt;boss.flash=Math.max(0,boss.flash-dt);boss.hitCooldown=Math.max(0,(boss.hitCooldown||0)-dt);boss.x+=boss.vx*dt;if(boss.x<boss.home-45||boss.x>boss.home+45)boss.vx=-boss.vx;
    boss.shotTimer-=dt;if(boss.shotTimer<=0&&Math.abs(hero.x-boss.x)<460){fireShot(boss.x+boss.w/2,boss.y+12,hero.x+hero.w/2,hero.y+hero.h/2,118,boss.color);boss.shotTimer=2.1;}
    if(!overlap(hero,boss))return;
    if(hero.vy>50&&oldBottom<=boss.y+14&&boss.hitCooldown<=0){boss.hp--;boss.hitCooldown=.72;boss.flash=.2;hero.vy=-350;hero.grounded=false;score+=1000;sparks.push({x:boss.x+boss.w/2,y:boss.y,life:.9,text:`BOSS HIT · ${boss.hp} LEFT`});if(boss.hp<=0){boss.alive=false;score+=3000;sparks.push({x:boss.x,y:boss.y,life:1.4,text:'BOSS DEFEATED!'});completeLevel();}}
    else if(boss.hitCooldown>0){hero.vy=Math.min(hero.vy,-150);}
    else if(powerType==='invincibility'){hero.vy=-180;hero.grounded=false;}else hurt(false);
  }
  function collectAndStomp(dt,oldBottom){
    for(const gem of gems)if(gem.alive&&overlap(hero,{x:gem.x-7,y:gem.y-7,w:14,h:14})){gem.alive=false;score+=50;sparks.push({x:gem.x,y:gem.y,life:.45,text:'+50'});}
    for(const relic of powerups)if(relic.alive&&overlap(hero,relic)){relic.alive=false;grantPower(relic.type);score+=400;}
    updateEnemies(dt,oldBottom);updateFireballs(dt);updateBoss(dt,oldBottom);
    for(const spark of sparks)spark.life-=dt;sparks=sparks.filter(s=>s.life>0);
  }
  function completeLevel(){if(state!=='playing')return;score+=lives*500;unlocked=Math.max(unlocked,Math.min(LEVELS.length,levelIndex+2));try{localStorage.setItem('cloudstep-unlocked',String(unlocked));}catch{}state='won';const lastLand=levelIndex===LEVELS.length-1;show(lastLand?'You crossed every land!':`Welcome to ${LEVELS[levelIndex+1].name}!`,lastLand?'Three head-stomps broke the final curse. Pip saved the Storybook Route!':'Three head-stomps down! '+stage.name+' is safe, and '+LEVELS[levelIndex+1].name+' is open.',lastLand?'WORLD 1 COMPLETE':'BOSS DEFEATED · 3/3', 'Back to the map');hud();makeLevelCards();}
  function update(dt){clock+=dt;if(powerType){powerTimer-=dt;if(powerTimer<=0)expirePower();}fireCooldown=Math.max(0,fireCooldown-dt);const oldBottom=hero.y+hero.h;moveHero(dt);if(state!=='playing')return;collectAndStomp(dt,oldBottom);cameraX=Math.max(0,Math.min(WORLD_W-W,hero.x-W*.38));cameraY=Math.max(0,Math.min(WORLD_H-H,hero.y-H*.63));hud();}

  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function drawCloud(x,y,s=1,color='#fff8e8'){rect(x,y+5*s,24*s,8*s,color);rect(x+5*s,y,12*s,12*s,color);rect(x+15*s,y+3*s,12*s,10*s,color);}
  function drawHill(x,y,w,h,color){rect(x,y+10,w,h-10,color);rect(x+10,y,w-20,h,color);rect(x+4,y+5,w-8,h-5,color);}
  function drawBackground(){
    const p=stage,sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,p.sky[0]);sky.addColorStop(.58,p.sky[1]);sky.addColorStop(1,p.sky[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    const sunX=310-cameraX*.07,sunY=31;ctx.globalAlpha=.16;rect(sunX-11,sunY-11,52,52,p.trim);ctx.globalAlpha=1;rect(sunX,sunY,30,30,p.sky[2]);rect(sunX+6,sunY-5,18,40,p.sky[2]);rect(sunX-5,sunY+6,40,18,p.sky[2]);
    for(let i=0;i<30;i++){const x=((i*73-cameraX*.08)%(W+20)+W+20)%(W+20),y=(i*47)%132;if(levelIndex===2||levelIndex===6){const twinkle=.55+.45*Math.sin(clock*2+i);ctx.globalAlpha=twinkle;rect(x,y,2,2,levelIndex===2?'#c7d4f4':'#fff');ctx.globalAlpha=1;}else if(i%3===0)rect(x,y,2,2,'#fff7d2');}
    if(levelIndex===3){ctx.globalAlpha=.45;rect(290-cameraX*.05,37,35,35,'#fff0b0');ctx.globalAlpha=1;}
    if(levelIndex===2){for(let i=0;i<8;i++){const x=((i*61-cameraX*.22)%(W+70)+W+70)%(W+70)-20;rect(x,30+(i*13)%84,7,17,p.far);rect(x+7,37+(i*19)%74,12,8,p.near);rect(x+8,40+(i*19)%74,2,2,'#f1ca72');}}
    else{for(let i=0;i<8;i++){const x=((i*91-cameraX*.18)%(W+100)+W+100)%(W+100)-40;drawCloud(x,22+(i*31)%78,.65+(i%3)*.18,levelIndex===6?'#f3fbff':'#fff8e8');}}
    for(let i=0;i<9;i++){const x=((i*97-cameraX*.3)%(W+130)+W+130)%(W+130)-55,y=137+(i%3)*14;drawHill(x,y,100+(i%3)*17,104,i%2?p.near:p.far);if(levelIndex===5){rect(x+31,y+9,8,44,'#554738');rect(x+22,y+15,27,25,p.near);rect(x+26,y+11,18,28,p.far);}if(levelIndex===3){rect(x+22,y-8,5,22,p.far);rect(x+40,y-18,4,32,p.far);rect(x+8,y+7,62,4,p.near);}if(levelIndex===7){rect(x+40,y-4,10,26,'#ea7049');rect(x+43,y-13,4,32,'#ffca69');}}
    for(let i=0;i<12;i++){const x=((i*43-cameraX*.43)%(W+60)+W+60)%(W+60)-20;rect(x,216+(i%3)*8,4+(i%3)*4,24,p.near);}
  }
  function drawTile(x,y,type){
    const sx=x*T-cameraX,sy=y*T-cameraY;
    if(type==='grass'||type==='dirt'){
      rect(sx,sy,T,T,stage.ground);rect(sx+2,sy+10,5,3,stage.trim);rect(sx+15,sy+16,6,3,stage.top);rect(sx,sy,T,6,stage.top);rect(sx,sy,T,3,stage.trim);
      if((x+y)%3===0){rect(sx+18,sy+6,3,3,stage.trim);rect(sx+6,sy+19,4,2,stage.ground);}if(y===13){rect(sx+1,sy+8,9,2,stage.near);rect(sx+13,sy+20,7,2,stage.trim);}
      if(levelIndex===2){rect(sx+4,sy+4,7,2,'#a39aaa');rect(sx+13,sy+12,8,3,'#393c4b');}
      if(levelIndex===3){rect(sx+2,sy+7,11,2,'#e2b971');rect(sx+12,sy+16,9,2,'#9c6346');}
      if(levelIndex===6){rect(sx+3,sy+8,5,2,'#f3ffff');rect(sx+14,sy+17,7,2,'#91b8c5');}
    }else if(type==='ledge'||type==='edgeL'||type==='edgeR'){
      rect(sx,sy,T,T,stage.ground);rect(sx,sy,T,5,stage.top);rect(sx+2,sy+8,T-4,2,stage.trim);rect(sx+4,sy+15,4,4,stage.near);rect(sx+16,sy+11,5,5,stage.ground);if(type==='edgeL')rect(sx,sy,4,T,stage.trim);if(type==='edgeR')rect(sx+20,sy,4,T,stage.trim);
      rect(sx+3,sy+20,8,2,stage.trim);rect(sx+14,sy+6,6,2,stage.top);
    }else if(type==='mystery'||type==='used'){
      rect(sx+1,sy+1,22,22,type==='mystery'?'#e89b42':'#756d65');rect(sx+3,sy+3,18,18,type==='mystery'?'#ffd979':'#b2a38b');rect(sx+4,sy+4,16,2,'#fff0b0');rect(sx+4,sy+18,16,2,'#a96c43');if(type==='mystery'){rect(sx+8,sy+7,8,10,'#fff8d4');rect(sx+6,sy+10,12,4,'#fff8d4');rect(sx+10,sy+18,4,2,'#b36e38');}else{rect(sx+8,sy+8,8,8,'#b5a68d');rect(sx+5,sy+5,2,2,'#4f5360');rect(sx+17,sy+17,2,2,'#4f5360');}
    }
  }
  function drawDecorations(){for(const d of decorations){const x=d.x-cameraX,y=d.y-cameraY;if(x<-12||x>W+12)continue;if(d.type==='sprout'){rect(x+3,y-8,3,8,stage.trim);rect(x,y-5,4,3,stage.top);rect(x+5,y-7,4,3,stage.top);}else{rect(x,y-4,9,4,stage.far);rect(x+2,y-7,4,3,stage.near);}}}
  function drawWater(){for(const [x,y,w,h]of waterZones){const sx=x*T-cameraX,sy=y*T-cameraY;ctx.globalAlpha=.67;rect(sx,sy,w*T,h*T,'#269eb9');ctx.globalAlpha=.8;for(let i=0;i<w*T;i+=34)rect(sx+i+((clock*15)%34),sy+5+(i%3)*5,12,2,'#c5f5e7');ctx.globalAlpha=1;for(let i=0;i<4;i++){const bx=sx+((i*53+clock*20)%(w*T)),by=sy+((i*41+clock*10)%(h*T));rect(bx,by,2,2,'#bdf3ee');}}}
  function drawHero(){
    const x=Math.round(hero.x-cameraX),y=Math.round(hero.y-cameraY),sx=hero.w/18,sy=hero.h/24;if(damageFlash>0&&Math.floor(clock*16)%2===0)return;ctx.save();
    const aura=powerType==='fireball'?'#ff884e':powerType==='size'?'#f8cb62':powerType==='invincibility'?'#b6fbff':powerType==='flight'?'#e0d5ff':'';
    if(aura){ctx.globalAlpha=.22+.12*Math.sin(clock*18);rect(x-5,y-5,hero.w+10,hero.h+10,aura);ctx.globalAlpha=1;}
    if(powerType==='flight'){const flap=Math.sin(clock*17)*3;rect(x-9,y+7+flap,9,4,'#f4f1de');rect(x-7,y+3+flap,7,4,'#e0d5ff');rect(x+hero.w,y+7-flap,9,4,'#f4f1de');rect(x+hero.w,y+3-flap,7,4,'#e0d5ff');}
    if(hero.facing<0){ctx.translate(x+hero.w,y);ctx.scale(-sx,sy);}else{ctx.translate(x,y);ctx.scale(sx,sy);}
    const run=hero.grounded&&Math.abs(hero.vx)>8?Math.floor(hero.anim)%2:0;
    rect(4,1,11,5,'#e9a461');rect(2,4,15,4,'#f1c38c');rect(3,7,14,10,'#42a9a0');rect(1,10,5,7,'#35928e');rect(5,8,9,7,'#f0bd83');rect(13,9,3,3,'#243850');rect(4,14,12,5,'#674969');rect(3,17,6,4,'#44354d');rect(11,17,6,4,'#44354d');rect(run?1:3,20,7,3,'#5b3e39');rect(run?11:9,20,7,3,'#5b3e39');rect(1,22,8,2,'#e3b16f');rect(10,22,8,2,'#e3b16f');rect(6,0,10,2,'#f6d08a');rect(3,12,4,2,'#66d5bf');
    if(powerType==='fireball'){rect(14,12,5,5,'#ff994f');rect(15,10,3,3,'#fff2a2');}if(powerType==='size'){rect(1,-2,16,3,'#d96a55');rect(0,-1,3,4,'#d96a55');rect(15,-1,3,4,'#d96a55');}
    ctx.restore();
  }
  function drawBug(b){
    const x=Math.round(b.x-cameraX),y=Math.round(b.y-cameraY),step=Math.floor(clock*8+b.phase)%2,colors={walker:['#ad4b50','#e17464'],hopper:['#568b50','#86bd58'],flyer:['#664fb0','#b49cf2'],armored:['#655e62','#a49b90'],crab:['#c15e50','#f08f6b'],swimmer:['#31829a','#69c8d0'],burrower:['#705340','#b88a55'],scorpion:['#81503d','#d99b4e'],cloud:['#788ec4','#d6ebfa'],spitter:['#b36e3e','#e8b064'],skater:['#537f9b','#a9dcea'],icecaster:['#628fc2','#b8edff'],fireling:['#a3453c','#ff9950']}[b.type]||['#ad4b50','#e17464'];
    const [dark,light]=colors;
    if(['flyer','cloud'].includes(b.type)){const flap=Math.sin(clock*15+b.phase)*4;rect(x-5,y+4+flap,7,5,light);rect(x+b.w-2,y+4-flap,7,5,light);}
    rect(x+2,y+5,b.w-4,b.h-6,dark);rect(x,y+8,b.w,b.h-10,light);rect(x+4,y+2,b.w-8,8,dark);rect(x+6,y+4,3,3,'#fff4d1');rect(x+b.w-9,y+4,3,3,'#fff4d1');rect(x+7,y+5,2,2,'#243149');rect(x+b.w-8,y+5,2,2,'#243149');
    if(b.type==='armored'){rect(x+3,y+1,b.w-6,5,'#c2b79d');rect(x+6,y-2,4,4,dark);rect(x+b.w-10,y-2,4,4,dark);rect(x+8,y+9,4,3,'#514e5c');}
    if(b.type==='crab'||b.type==='scorpion'){rect(x-4,y+5,5,3,light);rect(x+b.w-1,y+5,5,3,light);rect(x-4,y+2,3,4,dark);rect(x+b.w+1,y+2,3,4,dark);}
    if(b.type==='scorpion'){rect(x+b.w-2,y-3,3,8,dark);rect(x+b.w+1,y-6,5,4,light);}
    if(b.type==='hopper'||b.type==='skater'){rect(x+3,y+b.h-2,5,4,dark);rect(x+b.w-8,y+b.h-2,5,4,dark);}
    rect(x+3,y+b.h-2,5,2,dark);rect(x+b.w-8,y+b.h-2,5,2,dark);if(step){rect(x+2,y+b.h,5,2,light);rect(x+b.w-6,y+b.h,5,2,light);}
  }
  function drawPowerups(){for(const p of powerups)if(p.alive){const x=p.x-cameraX,y=p.y-cameraY+Math.sin(clock*4+p.bob)*3,c={fireball:'#ed684d',size:'#f6b943',invincibility:'#4dc9d1',flight:'#9a83e8'}[p.type];ctx.globalAlpha=.22;rect(x-4,y-4,p.w+8,p.h+8,c);ctx.globalAlpha=1;rect(x+2,y+2,p.w-4,p.h-4,'#fff0c0');rect(x+4,y+4,p.w-8,p.h-8,c);if(p.type==='fireball'){rect(x+8,y+6,5,9,'#fff0b2');rect(x+6,y+11,9,6,'#fff0b2');}else if(p.type==='size'){rect(x+8,y+5,4,13,'#fff1be');rect(x+5,y+8,10,4,'#fff1be');}else if(p.type==='invincibility'){rect(x+5,y+6,10,10,'#d6ffff');rect(x+8,y+8,4,6,c);}else{rect(x+3,y+8,6,3,'#fff3e1');rect(x+11,y+8,6,3,'#fff3e1');rect(x+5,y+5,3,8,'#fff3e1');rect(x+12,y+5,3,8,'#fff3e1');}}}
  function drawBoss(){
    if(!boss?.alive)return;const x=Math.round(boss.x-cameraX),y=Math.round(boss.y-cameraY),bob=Math.sin(boss.phase*3)*2;let c=boss.color;
    if(boss.flash>0&&Math.floor(clock*30)%2===0)c='#fff4cf';rect(x-5,y+9+bob,boss.w+10,boss.h-8,c);rect(x+4,y+3+bob,boss.w-8,boss.h-7,c);rect(x+9,y-3+bob,boss.w-18,12,c);
    rect(x+7,y+12+bob,8,8,'#fff1cc');rect(x+boss.w-15,y+12+bob,8,8,'#fff1cc');rect(x+10,y+14+bob,4,5,'#283047');rect(x+boss.w-12,y+14+bob,4,5,'#283047');rect(x+boss.w/2-6,y+25+bob,12,4,'#352f42');rect(x+boss.w/2-3,y+29+bob,6,4,'#fff0d0');
    rect(x+3,y+bob,8,9,'#f3c76d');rect(x+boss.w-11,y+bob,8,9,'#f3c76d');rect(x-6,y+boss.h-5,15,6,'#433846');rect(x+boss.w-9,y+boss.h-5,15,6,'#433846');
    if(boss.kind===0){for(let i=0;i<5;i++){rect(x+6+i*8,y-8+bob,5,7,'#db9b63');rect(x+8+i*8,y-11+bob,2,4,'#f5d68b');}}
    if(boss.kind===1){rect(x-12,y+19+bob,12,6,'#4fc9cf');rect(x-17,y+17+bob,6,10,'#db6a59');rect(x+boss.w+2,y+13+bob,7,14,'#70d8d5');rect(x+boss.w+8,y+9+bob,5,19,'#438fa8');rect(x+5,y+27+bob,38,5,'#e18e64');}
    if(boss.kind===2){rect(x-8,y+8+bob,15,18,'#a59ba0');rect(x+boss.w-7,y+8+bob,15,18,'#a59ba0');rect(x+11,y-9+bob,9,8,'#aaa3a5');rect(x+28,y-7+bob,8,7,'#aaa3a5');}
    if(boss.kind===3){rect(x+7,y+7+bob,34,12,'#efc15a');rect(x+11,y+9+bob,26,8,'#f6d97b');rect(x-11,y+12+bob,12,5,'#f3c76d');rect(x+boss.w-1,y+12+bob,12,5,'#f3c76d');rect(x+13,y-7+bob,4,7,'#eadc9d');rect(x+31,y-7+bob,4,7,'#eadc9d');}
    if(boss.kind===4){rect(x-13,y+10+bob,12,5,'#e1c7a1');rect(x-11,y+5+bob,9,5,'#fff0d2');rect(x+boss.w,y+10+bob,12,5,'#e1c7a1');rect(x+boss.w+2,y+5+bob,9,5,'#fff0d2');rect(x+16,y-9+bob,16,6,'#dbefff');rect(x+19,y-13+bob,9,5,'#fff');}
    if(boss.kind===5){rect(x+7,y-8+bob,5,12,'#8f7544');rect(x+3,y-12+bob,6,5,'#9dc56a');rect(x+36,y-9+bob,5,13,'#8f7544');rect(x+39,y-13+bob,6,5,'#9dc56a');rect(x+15,y+27+bob,19,4,'#6d482f');}
    if(boss.kind===6){rect(x+6,y-8+bob,9,8,'#e8f5f2');rect(x+18,y-10+bob,10,10,'#f5fbf5');rect(x+32,y-7+bob,9,7,'#e8f5f2');rect(x+9,y+28+bob,30,4,'#f7ffff');}
    if(boss.kind===7){rect(x-12,y+9+bob,12,5,'#ffb258');rect(x-9,y+3+bob,10,6,'#ffdf76');rect(x+boss.w,y+9+bob,12,5,'#ffb258');rect(x+boss.w+2,y+3+bob,10,6,'#ffdf76');for(let i=0;i<4;i++)rect(x+12+i*7,y-8+bob,4,7,i%2?'#ffdc74':'#f47a45');}
    const labelX=Math.max(2,Math.min(W-156,x+boss.w/2-78)),labelY=Math.max(2,y-43+bob);rect(labelX,labelY,154,15,'#18263d');ctx.fillStyle='#fff2cc';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText(`${boss.name} · ${boss.hp}/3`,labelX+77,labelY+10);ctx.fillStyle='#17233a';ctx.fillRect(x-2,y-20+bob,boss.w+4,5);ctx.fillStyle='#ffdc81';ctx.fillRect(x,y-18+bob,boss.w*boss.hp/3,2);
  }
  function drawShots(){for(const f of fireballs){const x=f.x-cameraX,y=f.y-cameraY;rect(x-3,y-3,16,15,'#fb7149');rect(x,y,9,8,'#ffc84e');rect(x+2,y+1,4,4,'#fff4a8');}for(const s of hostileShots){const x=s.x-cameraX,y=s.y-cameraY;rect(x-2,y-2,12,12,s.color);rect(x+1,y+1,6,6,'#fff0be');}}
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
  function draw(){
    ctx.imageSmoothingEnabled=false;if(state==='map'){drawMap();return;}drawBackground();
    for(let y=0;y<ROWS;y++)for(let x=Math.max(0,Math.floor(cameraX/T)-1);x<Math.min(COLS,Math.ceil((cameraX+W)/T)+1);x++){const type=tiles?.[y]?.[x];if(type)drawTile(x,y,type);}
    drawWater();drawDecorations();
    for(const g of gems||[])if(g.alive){const x=Math.round(g.x-cameraX),y=Math.round(g.y-cameraY+Math.sin(clock*5+g.bob)*2);rect(x-4,y-5,8,10,'#6c4fc1');rect(x-2,y-7,4,14,'#8f77ed');rect(x-1,y-4,2,4,'#fff3bf');}
    drawPowerups();for(const b of bugs||[])if(b.alive)drawBug(b);drawShots();drawGoal();drawBoss();drawHero();
    for(const s of sparks||[]){ctx.globalAlpha=Math.min(1,s.life*2);ctx.fillStyle='#fff4ba';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(s.text,Math.round(s.x-cameraX),Math.round(s.y-cameraY-s.life*24));ctx.globalAlpha=1;}
    if(state==='playing'){rect(9,9,88,4,'#23465c');rect(9,9,88*Math.max(0,(boss.home-hero.x)/(boss.home-checkpoint*T)),4,'#fff1bd');}
  }

  function frame(now){const elapsed=Math.min(.05,(now-last)/1000||0);last=now;if(state==='playing'){acc+=elapsed;while(acc>=1/60){update(1/60);acc-=1/60;}}draw();requestAnimationFrame(frame);}
  function setControl(name,on){if(name==='jump'&&on&&!control.jump)hero.jumpBuffer=.12;control[name]=on;if(on&&state==='ready')startCampaign();}
  function keyDown(e){const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','a','d','w','p','enter','f'].includes(k))e.preventDefault();if(state==='map'){if(k==='arrowleft'||k==='a')mapSelection=Math.max(0,mapSelection-1);if(k==='arrowright'||k==='d')mapSelection=Math.min(unlocked-1,mapSelection+1);if(k==='enter'&&mapSelection<unlocked)startLevel(mapSelection);makeLevelCards();return;}if(k==='arrowleft'||k==='a')setControl('left',true);if(k==='arrowright'||k==='d')setControl('right',true);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',true);if(k==='f')setControl('fire',true);if(k==='p')togglePause();}
  function keyUp(e){const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')setControl('left',false);if(k==='arrowright'||k==='d')setControl('right',false);if(k==='arrowup'||k==='w'||k===' ')setControl('jump',false);if(k==='f')setControl('fire',false);}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>{control.left=control.right=control.jump=control.fire=false;});
  document.querySelectorAll('[data-action]').forEach(button=>{const action=button.dataset.action;button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);setControl(action,true);});const release=e=>{e.preventDefault();setControl(action,false);};button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',()=>setControl(action,false));});
  canvas.addEventListener('pointerdown',e=>{if(state!=='map')return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let nearest=-1,distance=16;MAP_NODES.forEach(([nx,ny],i)=>{const d=Math.hypot(x-nx,y-ny);if(d<distance){distance=d;nearest=i;}});if(nearest>=0){mapSelection=nearest;if(nearest<unlocked)startLevel(nearest);else{makeLevelCards();hud();}}});
  $('start').addEventListener('click',()=>{if(state==='ready')startCampaign();else if(state==='paused')togglePause();else if(state==='won')openMap();else if(state==='over')startLevel(levelIndex,true);});
  $('pause').addEventListener('click',togglePause);$('map-button').addEventListener('click',openMap);$('restart').addEventListener('click',()=>state==='map'?startCampaign():state==='ready'?startCampaign():startLevel(levelIndex,true));
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePause();});
  buildWorld(0);hud();requestAnimationFrame(frame);
})();
