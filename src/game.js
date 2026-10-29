// Appwright loads bundled projects from a local WebView origin, where ES module
// scripts and bare imports may be blocked. three.min.js is included locally.
const THREE = window.THREE;
if (!THREE) throw new Error('Three.js yüklenemedi. APK ZIP dosyasında vendor/three.min.js bulunmalı.');

// BLAZE BOUNTY — true 3D campaign renderer and game loop.
// World coordinates use X/Z for the ground and Y for height.
const $ = (id) => document.getElementById(id);
const canvas = $('world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.08, 320);
// Camera-attached view models are only rendered when the camera belongs to the scene graph.
scene.add(camera);
const clock = new THREE.Clock();

const maps = [
  {name:'Çayır Çimen',theme:'grass',floor:0x35452d,fog:0x111811,accent:0x94ce57,cost:60,maxAlive:7,hp:52,speed:2.55},
  {name:'Gece Şehri',theme:'city',floor:0x20252d,fog:0x080b15,accent:0x62d5ef,cost:100,maxAlive:8,hp:68,speed:2.7},
  {name:'Terk Edilmiş Hastane',theme:'hospital',floor:0x313936,fog:0x101513,accent:0x90d2c2,cost:150,maxAlive:10,hp:88,speed:2.85},
  {name:'Çöl Fırtınası',theme:'desert',floor:0x89704d,fog:0x2a2118,accent:0xf0c879,cost:200,maxAlive:11,hp:105,speed:2.95},
  {name:'Buz Devri',theme:'snow',floor:0x9bb2b5,fog:0x18282e,accent:0xb8f2ff,cost:280,maxAlive:12,hp:125,speed:3.05},
  {name:'Terk Edilmiş Fabrika',theme:'factory',floor:0x383b3c,fog:0x111315,accent:0xe4a14d,cost:360,maxAlive:13,hp:150,speed:3.15},
  {name:'Antik Harabeler',theme:'ruins',floor:0x655742,fog:0x20180e,accent:0xd7bd74,cost:450,maxAlive:14,hp:175,speed:3.25},
  {name:'Siber Kent',theme:'cyber',floor:0x162b36,fog:0x061018,accent:0x43fbdb,cost:550,maxAlive:15,hp:205,speed:3.35},
  {name:'Volkanik Vadi',theme:'volcano',floor:0x39201d,fog:0x170706,accent:0xff633d,cost:700,maxAlive:16,hp:240,speed:3.45},
  {name:'Uzay İstasyonu',theme:'space',floor:0x252c3d,fog:0x050711,accent:0x8fa8ff,cost:50,maxAlive:17,hp:280,speed:3.55},
  {name:'KARDİNAL',theme:'kardinal',floor:0x1b1116,fog:0x09060b,accent:0xff425c,boss:'KARDİNAL'},
  {name:'Kanlı Çayır',theme:'bloodfield',floor:0x49352a,fog:0x170d0c,accent:0xff724d,cost:800,maxAlive:18,hp:340,speed:3.65},
  {name:'Paslı Mezarlık',theme:'graveyard',floor:0x38362e,fog:0x0c0e0e,accent:0xa9b1a2,cost:950,maxAlive:19,hp:380,speed:3.75},
  {name:'Kızıl Bataklık',theme:'swamp',floor:0x303824,fog:0x0b100a,accent:0xa2b04d,cost:1100,maxAlive:20,hp:420,speed:3.8},
  {name:'Gölge Katedrali',theme:'cathedral',floor:0x30252a,fog:0x0a080d,accent:0xd0a4e9,cost:1250,maxAlive:21,hp:460,speed:3.9},
  {name:'Lanetli Köy',theme:'village',floor:0x534236,fog:0x15100b,accent:0xf5a960,cost:1400,maxAlive:22,hp:510,speed:4.0},
  {name:'Kemik Madeni',theme:'mine',floor:0x41322f,fog:0x120c0b,accent:0xdcc7a4,cost:1600,maxAlive:23,hp:560,speed:4.1},
  {name:'Çürümüş Şato',theme:'castle',floor:0x382632,fog:0x10070d,accent:0xe383aa,cost:1800,maxAlive:24,hp:620,speed:4.2},
  {name:'Gece Ormanı',theme:'forest',floor:0x26352b,fog:0x07100c,accent:0x7bd096,cost:2000,maxAlive:25,hp:680,speed:4.3},
  {name:'Kızıl Uçurum',theme:'ravine',floor:0x60342b,fog:0x1b0907,accent:0xff7654,cost:2200,maxAlive:26,hp:750,speed:4.4},
  {name:'BLOOD HARVESTER',theme:'bloodtemple',floor:0x20271e,fog:0x080d08,accent:0x95e277,boss:'BLOOD HARVESTER'},
  {name:'Kriyojenik Lab',theme:'cryolab',floor:0x263f4b,fog:0x08161e,accent:0x6ce5ff,cost:1500,maxAlive:14,hp:750,speed:4.4},
  {name:'Nükleer Atık Sahası',theme:'nuke',floor:0x454a2c,fog:0x101507,accent:0xd2eb54,cost:1800,maxAlive:14,hp:780,speed:4.45},
  {name:'Biyolojik Silah Tesisi',theme:'biolab',floor:0x34403a,fog:0x0a120e,accent:0x92f091,cost:2100,maxAlive:15,hp:800,speed:4.5},
  {name:'Yeraltı Sığınağı',theme:'bunker',floor:0x343940,fog:0x0a0c10,accent:0xc6d4db,cost:2400,maxAlive:15,hp:820,speed:4.52},
  {name:'Kimyasal Sis Vadisi',theme:'chemsmog',floor:0x364139,fog:0x101911,accent:0xa9f164,cost:2700,maxAlive:15,hp:850,speed:4.55},
  {name:'Genetik Araştırma',theme:'genetics',floor:0x293746,fog:0x080e15,accent:0xe675ed,cost:3000,maxAlive:16,hp:880,speed:4.6},
  {name:'Karantina Bölgesi',theme:'quarantine',floor:0x554738,fog:0x15100b,accent:0xe4cf64,cost:3300,maxAlive:16,hp:900,speed:4.65},
  {name:'Virüs Enstitüsü',theme:'virusinst',floor:0x2b3833,fog:0x08120e,accent:0x80f6ab,cost:3600,maxAlive:16,hp:920,speed:4.7},
  {name:'DIAGNOS',theme:'diagnos',floor:0x211418,fog:0x19090d,accent:0xff3a48,boss:'DIAGNOS'}
];

// Each campaign area gets its own readable sky and light balance. Even the
// horror and boss stages keep enough ambient fill to see movement and hazards.
const atmospheres={
  grass:{sky:0x9bc8d2,hemi:1.75,sun:3.2,sunColor:0xfff1d9},city:{sky:0x8a9eae,hemi:1.55,sun:2.7,sunColor:0xe3ebff},hospital:{sky:0xb8c7c0,hemi:1.8,sun:3.0,sunColor:0xf4fff4},desert:{sky:0xe0c28e,hemi:1.85,sun:3.4,sunColor:0xffe1ad},snow:{sky:0xc4dce4,hemi:2.0,sun:3.1,sunColor:0xe8f6ff},factory:{sky:0x899b99,hemi:1.65,sun:2.8,sunColor:0xffd7ad},ruins:{sky:0xc4ad84,hemi:1.8,sun:3.2,sunColor:0xffe1b0},cyber:{sky:0x668c9a,hemi:1.65,sun:2.8,sunColor:0xc2f7ff},volcano:{sky:0x97685b,hemi:1.8,sun:3.0,sunColor:0xffb78f},space:{sky:0x566581,hemi:1.7,sun:2.8,sunColor:0xcbd5ff},kardinal:{sky:0x79606c,hemi:1.8,sun:3.0,sunColor:0xffc3be},bloodfield:{sky:0xb17b67,hemi:1.8,sun:3.1,sunColor:0xffd2ad},graveyard:{sky:0x7c8984,hemi:1.65,sun:2.7,sunColor:0xd5ded0},swamp:{sky:0x89966e,hemi:1.75,sun:2.9,sunColor:0xd6edaa},cathedral:{sky:0x898092,hemi:1.75,sun:2.8,sunColor:0xe0c9fa},village:{sky:0xc09a74,hemi:1.9,sun:3.2,sunColor:0xffd29b},mine:{sky:0x8b746e,hemi:1.7,sun:2.8,sunColor:0xe7c0a7},castle:{sky:0x897584,hemi:1.75,sun:2.9,sunColor:0xf0c0d5},forest:{sky:0x7f9a85,hemi:1.75,sun:3.0,sunColor:0xc6f0c6},ravine:{sky:0xc38c78,hemi:1.85,sun:3.2,sunColor:0xffc09d},bloodtemple:{sky:0x74876e,hemi:1.8,sun:3.0,sunColor:0xcbedad},cryolab:{sky:0x8daebb,hemi:1.9,sun:3.0,sunColor:0xcaf5ff},nuke:{sky:0x9aa77d,hemi:1.8,sun:3.0,sunColor:0xe4ee9e},biolab:{sky:0x9aae9c,hemi:1.9,sun:3.1,sunColor:0xcaf8d0},bunker:{sky:0x929da0,hemi:1.8,sun:2.9,sunColor:0xd7e3e8},chemsmog:{sky:0x909d7e,hemi:1.8,sun:3.0,sunColor:0xdcf39e},genetics:{sky:0x8495aa,hemi:1.85,sun:3.0,sunColor:0xe2cbff},quarantine:{sky:0xb8a47e,hemi:1.9,sun:3.2,sunColor:0xffe5ae},virusinst:{sky:0x8ca895,hemi:1.9,sun:3.0,sunColor:0xc3f4d2},diagnos:{sky:0x3b1118,hemi:.9,sun:1.7,sunColor:0xff6958}
};

const weapons = [
  {name:'TABANCA',type:'pistol',price:0,damage:28,mag:12,reserve:72,rate:260,reload:1.25,speed:48,spread:.018,pellets:1,color:0xd4c39a},
  {name:'UZI',type:'uzi',price:150,damage:17,mag:30,reserve:150,rate:95,reload:1.45,speed:52,spread:.05,pellets:1,color:0xb5c3be},
  {name:'POMPALI',type:'shotgun',price:350,damage:14,mag:8,reserve:48,rate:650,reload:1.8,speed:42,spread:.14,pellets:7,color:0x9b6647},
  {name:'MINIGUN',type:'minigun',price:750,damage:20,mag:100,reserve:300,rate:62,reload:2.5,speed:55,spread:.075,pellets:1,color:0xa3a8a5},
  {name:'RPG',type:'rocket',price:1200,damage:170,mag:4,reserve:24,rate:900,reload:2.2,speed:31,spread:.008,pellets:1,color:0x6b884f},
  {name:'LASER GUN',type:'laser',price:2000,damage:65,mag:80,reserve:320,rate:55,reload:1.6,speed:90,spread:.006,pellets:1,color:0x56fff0}
];
const armorStock = [{id:'light',name:'HAFİF ZIRH',price:100,armor:50},{id:'heavy',name:'AĞIR ZIRH',price:200,armor:100},{id:'kardinal',name:'KARDİNAL ZIRHI',price:3000,armor:1000},{id:'harvester',name:'BLOOD HARVESTER ZIRHI',price:5500,armor:2000,minMap:11},{id:'diagnos',name:'DIAGNOS ZIRHI',price:7000,armor:3000,minMap:21}];
const petStock=[{id:'cat',name:'KÜP KEDİ',price:500},{id:'dog',name:'KÜP KÖPEK',price:500},{id:'fox',name:'KAR TİLKİSİ',price:500}];
const bossMapIndexes = new Set([10,20,29]);
const STORE_KEY = 'blaze-bounty-true-3d-v1';

const state = {
  mode:'menu',map:0,maxMap:0,money:1000,hp:100,maxHp:100,armor:0,armorMax:0,
  owned:[true,false,false,false,false,false],selectedWeapon:0,ammo:12,reserve:72,shadows:true,
  ownedArmor:['light'],equippedArmor:'light',ownedPets:[],equippedPet:null,petNames:{},bossCorpses:{},
  grenades:10,kits:1,bossHp:0,bossMax:0,
  ammoByWeapon:weapons.map(w=>w.mag),reserveByWeapon:weapons.map(w=>w.reserve),
  bossDefeated:{10:false,20:false,29:false},muted:false,volume:.7,quality:'medium',fpsLimit:60,cameraSensitivity:1
};
let saveData={};
try{saveData=JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch(_e){}
Object.assign(state,{money:clampInt(saveData.money,0,999999,1000),maxMap:clampInt(saveData.maxMap,0,29,0),map:clampInt(saveData.map,0,29,0),hp:clampInt(saveData.hp,1,100,100),armor:clampInt(saveData.armor,0,4000,0),armorMax:clampInt(saveData.armorMax,0,4000,0),grenades:clampInt(saveData.grenades,0,99,10),kits:clampInt(saveData.kits,0,20,1),selectedWeapon:clampInt(saveData.selectedWeapon,0,5,0),owned:Array.isArray(saveData.owned)&&saveData.owned.length===6?saveData.owned:[true,false,false,false,false,false],ownedArmor:Array.isArray(saveData.ownedArmor)?saveData.ownedArmor:['light'],equippedArmor:typeof saveData.equippedArmor==='string'?saveData.equippedArmor:'light',ownedPets:Array.isArray(saveData.ownedPets)?saveData.ownedPets:[],equippedPet:typeof saveData.equippedPet==='string'?saveData.equippedPet:null,petNames:saveData.petNames&&typeof saveData.petNames==='object'?saveData.petNames:{},bossCorpses:saveData.bossCorpses&&typeof saveData.bossCorpses==='object'?saveData.bossCorpses:{},bossDefeated:{...state.bossDefeated,...(saveData.bossDefeated||{})},volume:typeof saveData.volume==='number'?Math.max(0,Math.min(1,saveData.volume)):.7,quality:['ultra','high','medium','low'].includes(saveData.quality)?saveData.quality:'medium',fpsLimit:Number(saveData.fpsLimit)===30?30:60,shadows:saveData.shadows!==false,cameraSensitivity:typeof saveData.cameraSensitivity==='number'?Math.max(0,Math.min(5,saveData.cameraSensitivity)):1});
if(saveData.startingCashV2!==true){state.money=Math.max(state.money,50000);state.maxMap=Math.max(state.maxMap,state.map);saveData.startingCashV2=true}
if(saveData.startingCashV3!==true){state.money=500;saveData.startingCashV3=true}
if(saveData.startingCashV4!==true){state.money=50000;saveData.startingCashV4=true}
if(saveData.armorDurabilityV3!==true){if(state.armorMax===200){state.armor=Math.round(state.armor/200*1000);state.armorMax=1000}else if(state.armorMax===400){state.armor=Math.round(state.armor/400*2000);state.armorMax=2000}saveData.armorDurabilityV3=true}
if(saveData.startingCashV6!==true){state.money=Math.max(state.money,100000);saveData.startingCashV6=true}
// Persist this migration later from init/applyQuality. Calling saveGame here
// runs before onlineMatchActive is initialized (its let binding is in TDZ),
// which aborts the whole game script and leaves every UI button inert.
if(saveData.startingCashV8!==true){state.money=1000;saveData.startingCashV8=true}
const legacyEquippedArmor=armorStock.find(item=>item.armor===state.armorMax);if(legacyEquippedArmor){if(!state.ownedArmor.includes(legacyEquippedArmor.id))state.ownedArmor.push(legacyEquippedArmor.id);state.equippedArmor=legacyEquippedArmor.id}
state.maxHp=100;
if(!state.owned[state.selectedWeapon])state.selectedWeapon=0;
state.ammoByWeapon=Array.isArray(saveData.ammoByWeapon)&&saveData.ammoByWeapon.length===6?saveData.ammoByWeapon.map((n,i)=>clampInt(n,0,weapons[i].mag,weapons[i].mag)):state.ammoByWeapon;
state.reserveByWeapon=Array.isArray(saveData.reserveByWeapon)&&saveData.reserveByWeapon.length===6?saveData.reserveByWeapon.map((n,i)=>clampInt(n,0,Number.MAX_SAFE_INTEGER,weapons[i].reserve)):state.reserveByWeapon;
state.ammo=state.ammoByWeapon[state.selectedWeapon];
state.reserve=state.reserveByWeapon[state.selectedWeapon];

const sceneLights = new THREE.Group();
scene.add(sceneLights);
let world = new THREE.Group();
scene.add(world);
const materialCache = new Map();
const geometryCache = new Map();
const qualityProfiles={
  ultra:{pixelRatio:1.55,shadowMap:1024,groundSegments:256,textureRepeat:72,textureSize:1024,textureMarks:9000,props:128,anisotropy:10,bumpScale:.1},
  high:{pixelRatio:1.4,shadowMap:768,groundSegments:208,textureRepeat:60,textureSize:896,textureMarks:6500,props:96,anisotropy:8,bumpScale:.082},
  medium:{pixelRatio:1.2,shadowMap:640,groundSegments:160,textureRepeat:48,textureSize:640,textureMarks:4200,props:70,anisotropy:6,bumpScale:.06},
  low:{pixelRatio:1,shadowMap:384,groundSegments:96,textureRepeat:32,textureSize:384,textureMarks:2000,props:42,anisotropy:4,bumpScale:.04}
};
function clampInt(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.floor(n))):fallback}
function qualityProfileForMap(index=state.map){const base=qualityProfiles[state.quality]||qualityProfiles.medium;if(!bossMapIndexes.has(index))return base;const bossProfile={...base,pixelRatio:Math.min(base.pixelRatio,1),shadowMap:Math.min(base.shadowMap,256),groundSegments:Math.min(base.groundSegments,72),textureRepeat:Math.min(base.textureRepeat,36),textureSize:Math.min(base.textureSize,384),textureMarks:Math.min(base.textureMarks,1200),props:Math.min(base.props,22),anisotropy:Math.min(base.anisotropy,4),bumpScale:base.bumpScale*.72};return index===20?{...bossProfile,pixelRatio:Math.min(base.pixelRatio,.82),shadowMap:128,groundSegments:44,textureRepeat:24,textureSize:256,textureMarks:420,props:12,anisotropy:3,bumpScale:base.bumpScale*.52}:bossProfile}
function material(color,roughness=.82,metalness=0,emissive=0,emissiveIntensity=0){const key=[color,roughness,metalness,emissive,emissiveIntensity].join(':');if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity}));return materialCache.get(key)}
function geometry(key,create){if(!geometryCache.has(key))geometryCache.set(key,create());return geometryCache.get(key)}
const boxGeo=geometry('box',()=>new THREE.BoxGeometry(1,1,1));
const sphereGeo=geometry('sphere',()=>new THREE.SphereGeometry(1,16,12));
const smallSphereGeo=geometry('smallSphere',()=>new THREE.SphereGeometry(1,10,8));
const cylGeo=(top,bottom,height,radial=10)=>geometry(`cyl:${top}:${bottom}:${height}:${radial}`,()=>new THREE.CylinderGeometry(top,bottom,height,radial));
const coneGeo=(radius,height,radial=8)=>geometry(`cone:${radius}:${height}:${radial}`,()=>new THREE.ConeGeometry(radius,height,radial));
const dodecaGeo=geometry('rock',()=>new THREE.DodecahedronGeometry(1,0));
const torusGeo=(radius,tube)=>geometry(`torus:${radius}:${tube}`,()=>new THREE.TorusGeometry(radius,tube,10,32));
const tempV=new THREE.Vector3();
let sceneSeed=1, groundMesh=null, portal=null, player=null, playerModel=null, playerRig=null, petModel=null, petSoundTimer=0,enemies=[], projectiles=[], pickups=[], obstacles=[], effects=[],shotOccluders=[],skyTexture=null,harvesterSkyDark=false;
let lastShot=0,reloadLeft=0,reloadDuration=0,reloadWeaponIndex=0,grenadeThrowLeft=0,grenadeThrowDuration=.82,grenadeThrowLaunched=false,spawnClock=0,noticeTimer=0,frame=0,lastRenderedAt=0,menuStart=performance.now(),mouseLocked=false,fireHeld=false,aimHeld=false,aimBlend=0,aimKick=0,aimBloom=0,settingsDraft=null,settingsReturnMode='menu',mapReturnMode='menu',gateSelectorOpen=false,activeShopTab='weapons',bossMusicStopToken=0;
let cameraYaw=0,cameraPitch=.16,cameraMode='third',fpViewModel=null,fpWeaponRoot=null,moveInput={x:0,y:0},aimNdc=new THREE.Vector2(0,0),aimScreen={x:window.innerWidth/2,y:window.innerHeight/2},stickPointer=null,dragPointer=null,dragLast=null,introFinished=false,introWatchdog=null,deathReturnMap=0,shopReturnMode='pause';
let onlineOpponent=null,onlineOpponentModel=null,onlineOpponentTag=null,onlineOpponentPet=null,onlineFortressData=null,onlineHudTimer=0,onlineLastSync=0,onlineMatchActive=false,onlineMatchData=null,onlinePlayerId='',onlineOpponentId='',onlineNickname='Oyuncu',onlineSide=-1,onlineLocalDead=false,onlineProgressBackup=null,onlineRoundApplied=0,onlineNoticeRound=0,damageDirectionTimer=0;
const keyState=Object.create(null);
const raycaster=new THREE.Raycaster();
const miniMapCanvas=$('miniMap'),miniMapContext=miniMapCanvas?.getContext('2d');
const audio={current:null,currentKey:'',startAttemptAt:0,ctx:null,sfxBus:null,noiseBuffer:null,activeTones:0,musicLevel:.42,duckUntil:0,petTrack:null,petTracks:new Set(),petSamples:{}};
let characterLook={skin:'tan',jacket:'teal',pants:'cargo',hat:'none',glasses:'none',vest:'scout',pack:'compact'},characterLookApplied=null;
try{characterLook={...characterLook,...JSON.parse(localStorage.getItem('bb-character-look')||'{}')}}catch(_e){}

function addMesh(parent,geo,mat,pos=[0,0,0],scale=[1,1,1],cast=true,receive=false){const m=new THREE.Mesh(geo,mat);m.position.set(pos[0],pos[1],pos[2]);m.scale.set(scale[0],scale[1],scale[2]);m.castShadow=cast;m.receiveShadow=receive;parent.add(m);return m}
function addBox(parent,pos,scale,color,opts={}){return addMesh(parent,boxGeo,material(color,opts.roughness??.82,opts.metalness??0,opts.emissive??0,opts.emissiveIntensity??0),pos,scale,opts.cast??true,opts.receive??false)}
function addSphere(parent,pos,scale,color,opts={}){return addMesh(parent,opts.geometry||sphereGeo,material(color,opts.roughness??.78,opts.metalness??0,opts.emissive??0,opts.emissiveIntensity??0),pos,scale,opts.cast??true,opts.receive??false)}
function addCylinder(parent,pos,rTop,rBottom,height,color,opts={}){return addMesh(parent,cylGeo(rTop,rBottom,height,opts.radial||10),material(color,opts.roughness??.82,opts.metalness??0,opts.emissive??0,opts.emissiveIntensity??0),pos,[1,1,1],opts.cast??true,opts.receive??false)}
function addCone(parent,pos,radius,height,color,opts={}){return addMesh(parent,coneGeo(radius,height,opts.radial||8),material(color,opts.roughness??.82,opts.metalness??0,opts.emissive??0,opts.emissiveIntensity??0),pos,[1,1,1],opts.cast??true,opts.receive??false)}
function heightAt(x,z){return Math.sin(x*.018+sceneSeed)*Math.cos(z*.016-sceneSeed)*2.25+Math.sin((x+z)*.043+sceneSeed*.7)*.72+Math.cos((x-z)*.032)*.42+Math.sin(x*.13+z*.11)*.08}
function newRng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

function createSky(map,rng){
  const palettes={grass:['#5c9bc4','#dce9d4','#f4d8a0'],city:['#273d5e','#9baab6','#f0b891'],hospital:['#688d98','#d4e1d7','#fbf0cf'],desert:['#416a9e','#f0c07c','#ffebbd'],snow:['#456a91','#d0e8ee','#f4fbff'],factory:['#303e48','#a6a59a','#e7b77a'],ruins:['#626c77','#d2bc8a','#f4dfa1'],cyber:['#10263e','#267f91','#6df7dc'],volcano:['#271e37','#a35348','#ffac72'],space:['#050916','#202e56','#bac6ff'],kardinal:['#160f28','#772c4a','#ff9379'],bloodfield:['#5a3947','#d38a69','#ffd1a2'],graveyard:['#26383c','#788784','#c5c6a7'],swamp:['#263d32','#81946a','#d2d38c'],cathedral:['#392f55','#9480a7','#f6cfef'],village:['#526777','#d39a6b','#ffe0aa'],mine:['#3f3441','#9a7561','#f0c393'],castle:['#322a47','#98627b','#fac0ad'],forest:['#294958','#8cad92','#e3e4b8'],ravine:['#355b85','#e59a76','#ffd0a0'],bloodtemple:['#49634a','#bf9b56','#f2d68a'],cryolab:['#173d57','#73b4c4','#d0fcff'],nuke:['#354a3c','#9da965','#e8eaa3'],biolab:['#315c53','#a0c59b','#e5f9cf'],bunker:['#293a4e','#829094','#dce4d5'],chemsmog:['#3d5538','#9bad67','#e3d391'],genetics:['#34284c','#8f6ba7','#f3b9e9'],quarantine:['#73553c','#cdb57e','#ffe3a7'],virusinst:['#31584a','#8eb899','#e2f5cb'],diagnos:['#180e13','#f04b32','#ffbd54']};
  const sky=onlineMatchActive?['#278bd2','#78bee7','#eaf8ff']:(palettes[map.theme]||palettes.grass),[top,horizon,sun]=sky,art=document.createElement('canvas');art.width=1024;art.height=512;const ctx=art.getContext('2d'),gradient=ctx.createLinearGradient(0,0,0,512);gradient.addColorStop(0,top);gradient.addColorStop(.5,horizon);gradient.addColorStop(1,sun);ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);
  // Distinct white cumulus clouds against a clear blue arena sky.
  const glow=ctx.createRadialGradient(725,190,8,725,190,245);glow.addColorStop(0,'rgba(255,255,255,.38)');glow.addColorStop(.35,'rgba(255,255,255,.14)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(470,0,510,440);
  for(let i=0;i<13;i++){const x=rng()*1024,y=138+rng()*190,w=72+rng()*112,h=22+rng()*28;ctx.fillStyle='rgba(255,255,255,.30)';ctx.beginPath();ctx.ellipse(x,y+10,w*1.2,h*.58,0,0,Math.PI*2);ctx.fill();for(let j=0;j<7;j++){const cx=x+(rng()-.5)*w*1.35,cy=y+(rng()-.35)*h*.95,rx=h*(.72+rng()*.58),ry=h*(.6+rng()*.52),cloud=ctx.createRadialGradient(cx,cy,1,cx,cy,rx*1.5);cloud.addColorStop(0,'rgba(255,255,255,.94)');cloud.addColorStop(.58,'rgba(255,255,255,.82)');cloud.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=cloud;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill()}}
  // No point sprites: they created a view-angle circle on some mobile GPUs.
  const texture=new THREE.CanvasTexture(art);texture.colorSpace=THREE.SRGBColorSpace;texture.mapping=THREE.EquirectangularReflectionMapping;
  // Render the sky as the scene background, never as a huge mesh. This keeps
  // the gradient but removes the distant sphere surface that caused the aim
  // circle to appear and grow at particular view angles.
  skyTexture=texture;scene.background=texture;
}

function createGround(map,rng,profileOverride=null){
  const profile=profileOverride||qualityProfileForMap(state.map),seg=profile.groundSegments,geo=new THREE.PlaneGeometry(800,800,seg,seg),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=-pos.getY(i);pos.setZ(i,heightAt(x,z))}
  geo.rotateX(-Math.PI/2);geo.computeVertexNormals();
  const art=document.createElement('canvas');art.width=art.height=profile.textureSize;const texSize=profile.textureSize,ctx=art.getContext('2d');
  const palettes={
    grass:{dark:'#202b20',light:'#b2ac78',grain:'rgba(171,193,112,.18)',marks:'grass'},city:{dark:'#101821',light:'#9daeb8',grain:'rgba(67,104,123,.2)',marks:'crack'},hospital:{dark:'#26352f',light:'#d4e5d2',grain:'rgba(166,203,184,.23)',marks:'tile'},desert:{dark:'#594332',light:'#e3c888',grain:'rgba(224,181,96,.25)',marks:'sand'},snow:{dark:'#48616a',light:'#f4ffff',grain:'rgba(212,248,255,.32)',marks:'ice'},factory:{dark:'#222829',light:'#b9a27b',grain:'rgba(155,134,92,.2)',marks:'rust'},ruins:{dark:'#373026',light:'#d2bd8b',grain:'rgba(177,146,92,.21)',marks:'stone'},cyber:{dark:'#061a24',light:'#59ffdb',grain:'rgba(45,226,211,.22)',marks:'grid'},volcano:{dark:'#251716',light:'#ff7845',grain:'rgba(240,79,40,.22)',marks:'lava'},space:{dark:'#11182d',light:'#a8bdf9',grain:'rgba(112,140,226,.23)',marks:'grid'},kardinal:{dark:'#21131b',light:'#fa6677',grain:'rgba(181,45,68,.2)',marks:'stone'},bloodfield:{dark:'#35251f',light:'#ed9b70',grain:'rgba(196,85,57,.23)',marks:'grass'},graveyard:{dark:'#292d29',light:'#b4bca6',grain:'rgba(135,154,135,.18)',marks:'crack'},swamp:{dark:'#222b1a',light:'#b4bc5d',grain:'rgba(129,151,53,.24)',marks:'wet'},cathedral:{dark:'#2d2532',light:'#d1a2dc',grain:'rgba(147,91,169,.2)',marks:'stone'},village:{dark:'#43372c',light:'#dcad71',grain:'rgba(191,139,68,.22)',marks:'plank'},mine:{dark:'#332725',light:'#dcc58f',grain:'rgba(165,125,74,.23)',marks:'ore'},castle:{dark:'#382630',light:'#df8ca9',grain:'rgba(169,81,120,.22)',marks:'stone'},forest:{dark:'#1d3022',light:'#91c88a',grain:'rgba(82,167,97,.22)',marks:'grass'},ravine:{dark:'#422a25',light:'#f2a074',grain:'rgba(227,104,70,.24)',marks:'crack'},bloodtemple:{dark:'#1b281e',light:'#b5d882',grain:'rgba(115,178,87,.22)',marks:'rune'},cryolab:{dark:'#213844',light:'#adf4ff',grain:'rgba(74,205,255,.24)',marks:'grid'},nuke:{dark:'#30321e',light:'#dbee65',grain:'rgba(171,200,60,.24)',marks:'hazard'},biolab:{dark:'#26392c',light:'#9cff9c',grain:'rgba(78,197,117,.23)',marks:'bio'},bunker:{dark:'#22282e',light:'#c3d0d2',grain:'rgba(123,147,159,.2)',marks:'grid'},chemsmog:{dark:'#28311e',light:'#c5e772',grain:'rgba(151,200,69,.24)',marks:'wet'},genetics:{dark:'#25243b',light:'#f198ff',grain:'rgba(171,92,213,.23)',marks:'bio'},quarantine:{dark:'#403622',light:'#f4df87',grain:'rgba(204,160,73,.23)',marks:'hazard'},virusinst:{dark:'#202f2c',light:'#9cf5bc',grain:'rgba(90,193,137,.22)',marks:'bio'},diagnos:{dark:'#211316',light:'#ff6a36',grain:'rgba(255,49,29,.28)',marks:'lava'},online:{dark:'#343b37',light:'#c6b68f',grain:'rgba(198,182,143,.2)',marks:'plank'}
  };
  const palette=onlineMatchActive?palettes.online:(palettes[map.theme]||palettes.grass),floor=onlineMatchActive?0x74766d:map.floor,floorLift=c=>Math.round(c+(255-c)*.13);
  ctx.fillStyle=`rgb(${floorLift((floor>>16)&255)},${floorLift((floor>>8)&255)},${floorLift(floor&255)})`;ctx.fillRect(0,0,texSize,texSize);
  const wash=ctx.createLinearGradient(0,0,texSize,texSize);wash.addColorStop(0,palette.grain);wash.addColorStop(.5,'rgba(0,0,0,0)');wash.addColorStop(1,palette.grain);ctx.fillStyle=wash;ctx.fillRect(0,0,texSize,texSize);
  for(let i=0;i<profile.textureMarks;i++){const x=rng()*texSize,y=rng()*texSize,r=.5+rng()*(texSize/118),a=.025+rng()*.12;ctx.fillStyle=rng()>.5?`rgba(239,228,200,${a})`:`rgba(22,25,21,${a*1.25})`;ctx.beginPath();ctx.ellipse(x,y,r,r*(.28+rng()*.9),rng()*Math.PI,0,Math.PI*2);ctx.fill()}
  for(let i=0;i<Math.round(profile.textureMarks*.027);i++){const x=rng()*texSize,y=rng()*texSize;ctx.strokeStyle=`rgba(30,34,29,${.035+rng()*.09})`;ctx.lineWidth=.6+rng()*1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rng()-.5)*48,y+(rng()-.5)*48);ctx.stroke()}
  const markCount=Math.round(profile.textureMarks*.13);for(let i=0;i<markCount;i++){const x=rng()*texSize,y=rng()*texSize,s=3+rng()*22;ctx.save();ctx.translate(x,y);ctx.rotate(rng()*Math.PI*2);ctx.strokeStyle=rng()>.5?palette.light:palette.dark;ctx.globalAlpha=.08+rng()*.2;ctx.lineWidth=1+rng()*2;
    if(palette.marks==='grid'||palette.marks==='tile'){ctx.strokeRect(-s,-s*.62,s*2,s*1.24);if(palette.marks==='tile'){ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke()}}
    else if(palette.marks==='crack'||palette.marks==='ore'||palette.marks==='rune'){ctx.beginPath();ctx.moveTo(-s,-s*.3);ctx.lineTo(-s*.18,s*.05);ctx.lineTo(s*.12,-s*.35);ctx.lineTo(s*.8,s*.4);ctx.stroke();if(palette.marks==='rune'){ctx.beginPath();ctx.moveTo(-s*.3,-s*.6);ctx.lineTo(s*.32,s*.6);ctx.moveTo(s*.4,-s*.5);ctx.lineTo(-s*.4,s*.5);ctx.stroke()}}
    else if(palette.marks==='hazard'){ctx.strokeRect(-s,-s*.52,s*2,s*1.04);ctx.beginPath();ctx.moveTo(-s*.5,0);ctx.lineTo(-s*.16,-s*.36);ctx.lineTo(s*.16,s*.36);ctx.lineTo(s*.5,0);ctx.stroke()}
    else if(palette.marks==='bio'){ctx.beginPath();ctx.arc(0,0,s*.52,0,Math.PI*2);for(let j=0;j<3;j++){const a=j*Math.PI*2/3;ctx.moveTo(Math.cos(a)*s*.52,Math.sin(a)*s*.52);ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s)}ctx.stroke()}
    else if(palette.marks==='sand'){ctx.beginPath();for(let k=-2;k<=2;k++){ctx.ellipse(0,k*s*.22,s*(.65+Math.abs(k)*.1),s*.16,0,Math.PI*1.05,Math.PI*1.95)}ctx.stroke()}
    else if(palette.marks==='ice'){ctx.beginPath();for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.moveTo(-Math.cos(a)*s,-Math.sin(a)*s);ctx.lineTo(Math.cos(a)*s,Math.sin(a)*s);ctx.moveTo(Math.cos(a)*s*.34,Math.sin(a)*s*.34);ctx.lineTo(Math.cos(a)*s*.66,Math.sin(a)*s*.66)}ctx.stroke()}
    else if(palette.marks==='lava'){ctx.beginPath();ctx.moveTo(-s,-s*.4);ctx.lineTo(-s*.4,-s*.12);ctx.lineTo(-s*.2,s*.42);ctx.lineTo(s*.22,s*.08);ctx.lineTo(s*.44,s*.52);ctx.lineTo(s,s*.26);ctx.stroke()}
    else if(palette.marks==='wet'){ctx.beginPath();ctx.ellipse(0,0,s,s*.24,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(s*.35,-s*.12,s*.12,0,Math.PI*2);ctx.stroke()}
    else if(palette.marks==='plank'){ctx.strokeRect(-s,-s*.45,s*2,s*.9);ctx.beginPath();ctx.moveTo(-s*.4,-s*.45);ctx.lineTo(-s*.4,s*.45);ctx.moveTo(s*.55,-s*.45);ctx.lineTo(s*.55,s*.45);ctx.stroke()}
    else if(palette.marks==='grass'){for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*s*.4,s*.35);ctx.quadraticCurveTo(k*s*.2,-s*.15,k*s*.55,-s);ctx.moveTo(k*s*.4,s*.35);ctx.quadraticCurveTo(k*s*.75,-s*.08,k*s*.9,-s*.65);ctx.stroke()}}
    else if(palette.marks==='rust'){ctx.beginPath();ctx.arc(0,0,s*.62,0,Math.PI*2);ctx.moveTo(-s*.6,-s*.4);ctx.lineTo(s*.7,s*.5);ctx.stroke()}
    else if(palette.marks==='stone'){ctx.beginPath();ctx.moveTo(-s,-s*.25);ctx.lineTo(-s*.25,-s*.45);ctx.lineTo(s*.3,-s*.2);ctx.lineTo(s,s*.35);ctx.moveTo(-s*.3,-s*.2);ctx.lineTo(-s*.15,s*.48);ctx.lineTo(s*.55,s*.44);ctx.stroke()}
    ctx.restore();}
  const bumpSize=Math.round(texSize/2),bumpArt=document.createElement('canvas');bumpArt.width=bumpArt.height=bumpSize;const bctx=bumpArt.getContext('2d');bctx.fillStyle='#808080';bctx.fillRect(0,0,bumpSize,bumpSize);
  for(let i=0;i<Math.round(profile.textureMarks*.55);i++){const x=rng()*bumpSize,y=rng()*bumpSize,r=.7+rng()*(bumpSize/90),v=Math.round(104+rng()*104);bctx.fillStyle=`rgba(${v},${v},${v},${.06+rng()*.22})`;bctx.beginPath();bctx.ellipse(x,y,r,r*(.3+rng()),rng()*Math.PI,0,Math.PI*2);bctx.fill()}
  const tex=new THREE.CanvasTexture(art),bump=new THREE.CanvasTexture(bumpArt);for(const t of [tex,bump]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(profile.textureRepeat,profile.textureRepeat);t.anisotropy=Math.min(profile.anisotropy,renderer.capabilities.getMaxAnisotropy())}tex.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.MeshStandardMaterial({map:tex,bumpMap:bump,bumpScale:profile.bumpScale,color:0xffffff,roughness:.91,metalness:.015});groundMesh=new THREE.Mesh(geo,mat);groundMesh.receiveShadow=true;world.add(groundMesh);
}

function createEdgeMist(map,rng){
  const tint=new THREE.Color((atmospheres[map.theme]||atmospheres.grass).sky),art=document.createElement('canvas');art.width=64;art.height=256;const ctx=art.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'rgba(255,255,255,0)');gradient.addColorStop(.2,'rgba(255,255,255,.1)');gradient.addColorStop(.5,'rgba(255,255,255,.5)');gradient.addColorStop(.8,'rgba(255,255,255,.14)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,256);
  // A smooth alpha ramp avoids bright specks that can resemble a target dot
  // when the player looks along one of the map-edge curtains.
  const texture=new THREE.CanvasTexture(art);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.repeat.set(6,1);texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
  const mat=new THREE.MeshBasicMaterial({color:tint,map:texture,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide});
  const makeCurtain=(x,z,rotation,length)=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(length,25),mat);mesh.position.set(x,11.5,z);mesh.rotation.y=rotation;mesh.renderOrder=2;mesh.userData.aimIgnore=true;world.add(mesh)};
  makeCurtain(0,-158,0,320);makeCurtain(0,158,0,320);makeCurtain(-158,0,Math.PI/2,320);makeCurtain(158,0,Math.PI/2,320);
}

function makeLamp(x,z,color){const y=heightAt(x,z);addCylinder(world,[x,y+2.7,z],.075,.09,5.4,0x303b3a,{metalness:.65});addBox(world,[x,y+5.36,z],[.45,.16,.45],0x34433e,{metalness:.4});const glow=addSphere(world,[x,y+5.13,z],[.22,.13,.22],color,{emissive:color,emissiveIntensity:1.35,cast:false});const light=new THREE.PointLight(color,1.5,15,2);light.position.set(x,y+5,z);world.add(light);return glow}
function addTree(x,z,scale,rng,theme){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=rng()*Math.PI*2;g.scale.setScalar(scale);world.add(g);const trunkColor=theme==='snow'?0x55453d:theme==='swamp'?0x3b3521:0x493727;addCylinder(g,[0,1.1,0],.17,.28,2.2,trunkColor,{radial:7});
  const leaf={bloodfield:0x692d29,swamp:0x435532,snow:0x31504f,forest:0x2d633a,village:0x46603b,grass:0x3f713b,graveyard:0x46463a,chemsmog:0x819641,bloodtemple:0x4e6a37}[theme]||0x34533b;
  if(theme==='snow'||theme==='forest'||theme==='grass'||theme==='bloodfield'||theme==='swamp'||theme==='village'){
    for(let j=0;j<3;j++){const c=addCone(g,[0,2.35+j*.64,0],1.18-j*.18,1.75,leaf+(j*0x020300),{radial:7});c.rotation.y=j*.72;if(theme==='snow')addCone(g,[0,2.58+j*.64,.01],.96-j*.14,1.42,0xd9eeee,{radial:7,cast:false})}
  }else{
    addSphere(g,[0,2.75,0],[1.15,1.05,1.15],leaf,{geometry:dodecaGeo});addSphere(g,[.55,3.05,.2],[.72,.73,.72],leaf+0x050301,{geometry:dodecaGeo});
  }
  obstacles.push({x,z,r:.58*scale});return g;
}
function addRuin(x,z,rng,height=3){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=rng()*Math.PI;world.add(g);const theme=maps[state.map].theme,stone={kardinal:0x643541,diagnos:0x343037,bloodtemple:0x62523e,cathedral:0x65566b,castle:0x67505e,graveyard:0x626754,mine:0x62503d}[theme]||0x746958,stone2={kardinal:0x34212b,diagnos:0x1c171d,bloodtemple:0x353e2d,cathedral:0x352c3c,castle:0x382633,graveyard:0x30342f,mine:0x392b26}[theme]||0x4d4a43;addBox(g,[0,height/2,0],[2.6,height,2.2],stone,{roughness:1});addBox(g,[.15,height*.72,1.13],[2.1,.22,.16],stone2);addBox(g,[-.75,height*.23,1.13],[.25,height*.46,.14],0x252827);addBox(g,[.78,height*.33,1.13],[.45,height*.65,.14],0x252827);if(['kardinal','diagnos','bloodtemple','cathedral'].includes(theme)){const sigil=theme==='kardinal'?0xf45a73:theme==='diagnos'?0xff523b:theme==='cathedral'?0xc79ce9:0x9bd877;addBox(g,[.16,height*.7,1.23],[.07,.58,.035],sigil,{emissive:sigil,emissiveIntensity:.25,cast:false});addBox(g,[.16,height*.7,1.24],[.42,.06,.035],sigil,{emissive:sigil,emissiveIntensity:.25,cast:false})}obstacles.push({x,z,hw:1.42,hd:1.2});return g}
function addPillar(x,z,rng,h=4){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=rng()*Math.PI;world.add(g);addCylinder(g,[0,h/2,0],.42,.5,h,0x77705f,{radial:8});addBox(g,[0,h,0],[1.1,.25,1.1],0x958a70);addBox(g,[0,.16,0],[1.12,.32,1.12],0x504c43);obstacles.push({x,z,r:.72});return g}
function addRock(x,z,rng,scale=1){const g=addMesh(world,dodecaGeo,material(0x514d47,1),[x,heightAt(x,z)+.42*scale,z],[.65*scale,.6*scale,.78*scale],true,true);g.rotation.set(rng(),rng()*Math.PI,rng());if(scale>.8)obstacles.push({x,z,r:.7*scale});return g}
function addBuilding(x,z,rng,kind='building'){
  const w=kind==='container'?5.4:4.4+rng()*3,d=kind==='container'?2.3:4.2+rng()*2.5,h=kind==='container'?2.4:4.5+rng()*6;
  const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);const quarter=Math.floor(rng()*4),quarterTurn=quarter%2===1;g.rotation.y=quarter*Math.PI/2;world.add(g);
  const theme=maps[state.map].theme,base=kind==='container'?({city:0x3d5663,factory:0x594838,cyber:0x173b45,cryolab:0x436979,nuke:0x535333,chemsmog:0x435038,genetics:0x423953,quarantine:0x70603c}[theme]||0x38484c):kind==='lab'?({hospital:0x879c91,cryolab:0x759fac,biolab:0x667e69,genetics:0x6a5d83,virusinst:0x62806d}[theme]||0x778582):kind==='bunker'?0x454b4d:0x3e4242;
  addBox(g,[0,h/2,0],[w,h,d],base,{metalness:.24,roughness:.78});
  const pane=kind==='lab'?({hospital:0x62b8ad,cryolab:0x74edff,biolab:0x84ff8b,genetics:0xed83ff,virusinst:0x89ffba}[theme]||0x62b8ad):kind==='bunker'?0x242b2f:({cyber:0x122f3b,nuke:0x34351b,factory:0x33251c,city:0x182b3b}[theme]||0x182429);
  if(kind!=='container'){
    const floors=Math.max(2,Math.floor(h/2.1));
    for(let fy=1;fy<floors;fy++)for(let fx=-1;fx<=1;fx++){
      addBox(g,[fx*w*.27,fy*1.75-h/2+.8,d/2+.012],[.58,.75,.035],pane,{metalness:.32,emissive:kind==='lab'?0x184d48:0x05090a,emissiveIntensity:.35,cast:false});
    }
    addBox(g,[0,.15,d/2+.03],[.9,1.7,.09],0x222725,{metalness:.35});
  }else{
    for(let i=0;i<5;i++)addBox(g,[0,-h/2+.27+i*.42,d/2+.02],[w*.88,.045,.04],0x738080,{metalness:.6,cast:false});
  }
  addBox(g,[0,h+.1,0],[w+.22,.24,d+.22],kind==='lab'?0x9baea9:0x555a58,{metalness:.28});
  obstacles.push({x,z,hw:(quarterTurn?d:w)*.56,hd:(quarterTurn?w:d)*.56,building:true});return g;
}
function addCrystal(x,z,rng,scale=1,color=0x79e4eb){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=rng()*Math.PI;world.add(g);const c=addMesh(g,coneGeo(.45,2.5,6),material(color,.34,.24,color,.35),[0,1.15,0],[scale,1,scale],true,true);c.rotation.z=(rng()-.5)*.3;for(let i=0;i<3;i++){const s=addMesh(g,coneGeo(.3,1.4,6),material(color,.34,.24,color,.3),[(rng()-.5)*1.2,.7,(rng()-.5)*.7],[scale*.7,.7,scale*.7]);s.rotation.z=(rng()-.5)*.6}obstacles.push({x,z,r:.65*scale});}
function addPipe(x,z,rng){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=rng()*Math.PI*2;world.add(g);addCylinder(g,[0,.55,0],.48,.48,1.1,0x555f5b,{metalness:.64,radial:12});addCylinder(g,[0,1.15,0],.34,.34,1.2,0x68716c,{metalness:.72,radial:12});addCylinder(g,[0,1.78,0],.18,.18,.18,0x91a29a,{metalness:.72,radial:12});}
function addMapLandmark(map,rng,detailScale=1){
  const theme=map.theme,accent=map.accent;
  if(theme==='city'||theme==='factory'||theme==='bunker'||theme==='hospital'||theme==='cryolab'||theme==='biolab'||theme==='virusinst'||theme==='nuke'||theme==='chemsmog'||theme==='genetics'||theme==='quarantine'){
    const color={city:0x557887,factory:0x786344,bunker:0x667276,hospital:0xadc7bb,cryolab:0x76d9ee,biolab:0x74c77e,virusinst:0x79d6a0,nuke:0xb6be53,chemsmog:0x8ca34f,genetics:0xb879ce,quarantine:0xd0b95c}[theme]||0x53615e;
    for(const [x,z] of [[-14,-36],[15,-58],[28,-92],[-30,-112]].slice(0,Math.max(1,Math.ceil(4*detailScale)))){
      const h=5+rng()*10,g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y=(rng()-.5)*.08;world.add(g);
      const bw=4+rng()*2,bd=4+rng()*2;addBox(g,[0,h/2,0],[bw,h,bd],color,{roughness:.72,metalness:.18});obstacles.push({x,z,hw:bw*.58,hd:bd*.58,building:true});
      const floors=Math.floor(h/2.2);for(let y=1;y<floors;y++)for(let sx of [-.9,.9])addBox(g,[sx,y*1.8-h/2+.7,2.06],[.62,.82,.04],accent,{emissive:accent,emissiveIntensity:.23,metalness:.26,cast:false});
      addBox(g,[0,h+.12,0],[4.5,.24,4.5],0x333a38,{metalness:.32});
    }
  }else if(theme==='desert'||theme==='ravine'||theme==='volcano'){
    for(let i=0;i<Math.ceil(12*detailScale);i++){const x=(rng()-.5)*270,z=-38-rng()*108,sz=1+rng()*2.5,color=theme==='volcano'?0x7e3328:theme==='ravine'?0x895142:0x9b8054;addMesh(world,dodecaGeo,material(color,1),[x,heightAt(x,z)+sz*.4,z],[sz*1.5,sz*.72,sz],true,true)}
    if(theme==='volcano')for(let i=0;i<Math.ceil(9*detailScale);i++){const x=(rng()-.5)*230,z=-42-rng()*115,y=heightAt(x,z)+.3,vent=addMesh(world,torusGeo(.7,.14),material(0xff6230,.38,.05,0xd72e0b,.65),[x,y,z],[1.4,.5,1],false);vent.rotation.x=Math.PI/2;addSphere(world,[x,y+.04,z],[.48,.08,.48],0xffa34a,{emissive:0xf04419,emissiveIntensity:.9,cast:false})}
    if(theme==='desert')for(let i=0;i<5;i++){const x=(rng()-.5)*240,z=-50-rng()*100;for(const dx of [-.22,0,.22])addBox(world,[x+dx,heightAt(x,z)+1.6,z],[.14,3.2,.14],0x77553d)}
  }else if(theme==='snow'||theme==='forest'||theme==='grass'||theme==='bloodfield'||theme==='swamp'){
    if(theme==='snow')for(let i=0;i<24;i++){const x=(rng()-.5)*280,z=-25-rng()*130,y=heightAt(x,z);addCone(world,[x,y+2.1,z],.78,4.2,0xf0fbf3,{radial:7,cast:false});addSphere(world,[x,y+2.15,z],[.82,.16,.82],0xd5e8e8,{cast:false})}
    if(theme==='swamp')for(let i=0;i<16;i++){const x=(rng()-.5)*250,z=-24-rng()*125,y=heightAt(x,z);addSphere(world,[x,y+.13,z],[1.4,.13,1],0x3d5432,{roughness:.2,metalness:.08,emissive:0x355a24,emissiveIntensity:.12,cast:false})}
  }else if(theme==='space'){
    for(let i=0;i<9;i++){const x=(rng()-.5)*250,z=-38-rng()*110,base=new THREE.Group();base.position.set(x,heightAt(x,z),z);base.rotation.y=rng()*Math.PI;world.add(base);addCylinder(base,[0,1.1,0],.55,.5,2.2,0x535b70,{metalness:.75,radial:12});addCylinder(base,[0,2.3,0],.2,.2,.2,accent,{metalness:.55,emissive:accent,emissiveIntensity:.4,radial:12});const beam=new THREE.PointLight(accent,1.8,11,2);beam.position.set(0,2.5,0);base.add(beam)}
  }else if(theme==='bloodtemple'){
    // A broad harvest field with visible crop lanes, irrigation tracks and grain stacks.
    const rowCount=15,plantsPerRow=14,plantCount=rowCount*plantsPerRow*2,cropGeometry=new THREE.BoxGeometry(1,1,1),stalks=new THREE.InstancedMesh(cropGeometry,material(0x988348,1),plantCount),leaves=new THREE.InstancedMesh(cropGeometry,material(0x758143,1),plantCount),dummy=new THREE.Object3D();let plant=0;
    for(let row=0;row<rowCount;row++){
      const x=-112+row*16,y=heightAt(x,-88);addBox(world,[x,y+.12,-82],[.26,.12,116],row%3===0?0x84713a:0x68723a,{roughness:.98,cast:false});
      for(let z=-134;z<-38;z+=96/plantsPerRow)for(const side of [-.24,.24]){const px=x+side,pz=z+(side>0?.22:0),gy=heightAt(px,pz);dummy.position.set(px,gy+.5,pz);dummy.rotation.set(0,0,0);dummy.scale.set(.09,1,.09);dummy.updateMatrix();stalks.setMatrixAt(plant,dummy.matrix);dummy.position.set(px+.1,gy+.74,pz+.04);dummy.rotation.z=side>0?.38:-.38;dummy.scale.set(.42,.055,.09);dummy.updateMatrix();leaves.setMatrixAt(plant,dummy.matrix);plant++}
    }
    for(const batch of [stalks,leaves]){batch.count=plant;batch.instanceMatrix.needsUpdate=true;batch.castShadow=false;batch.receiveShadow=false;batch.computeBoundingSphere();world.add(batch)}
    for(const [x,z] of [[-105,-52],[105,-116]]){addCylinder(world,[x,heightAt(x,z)+2.4,z],1.7,2,4.8,0x93845e,{metalness:.2,roughness:.9,radial:12});addCone(world,[x,heightAt(x,z)+5.15,z],2.1,1.1,0x514a36,{roughness:.95,radial:12})}
  }else if(['ruins','kardinal','graveyard','cathedral','castle','mine','diagnos'].includes(theme)){
    const color={kardinal:0x722d40,bloodtemple:0x53633c,graveyard:0x586150,cathedral:0x71627a,castle:0x70515f,mine:0x685439,diagnos:0x45674f}[theme]||0x7a705c;
    for(const side of [-1,1])for(let i=0;i<Math.max(2,Math.ceil(7*detailScale));i++){const z=-26-i*18,x=side*(9+(i%2)*1.2),y=heightAt(x,z),h=3.5+(i%3)*.8;addCylinder(world,[x,y+h/2,z],.46,.6,h,color,{metalness:.12,radial:8});addBox(world,[x,y+h,z],[1.3,.3,1.3],color,{metalness:.15});addSphere(world,[x,y+h+.24,z],[.22,.22,.22],accent,{emissive:accent,emissiveIntensity:.4,cast:false})}
  }
  if(theme==='hospital'){for(let i=0;i<8;i++){const x=(rng()-.5)*250,z=-30-rng()*120,y=heightAt(x,z);addBox(world,[x,y+.16,z],[1.2,.22,1.2],i%2?0xb6c9bd:0x84998f,{roughness:.55});addBox(world,[x,y+.31,z],[.18,.08,.18],0x86efe0,{emissive:0x49a896,emissiveIntensity:.3,cast:false})}}
  if(theme==='cyber'||theme==='genetics'){for(let i=0;i<18;i++){const x=(rng()-.5)*260,z=-20-rng()*145,y=heightAt(x,z);addCylinder(world,[x,y+1.25,z],.34,.62,2.5,theme==='cyber'?0x176071:0x70528b,{metalness:.5,emissive:accent,emissiveIntensity:.16,radial:9});addSphere(world,[x,y+2.54,z],[.38,.1,.38],accent,{emissive:accent,emissiveIntensity:.6,cast:false})}}
  if(theme==='village'||theme==='castle'){for(let i=0;i<9;i++){const x=(rng()-.5)*250,z=-28-rng()*128,y=heightAt(x,z),h=3+rng()*2.5;addBox(world,[x,y+h/2,z],[3.1,h,2.8],theme==='village'?0x805f40:0x55414b,{roughness:.95});addCone(world,[x,y+h+.7,z],2,1.5,theme==='village'?0x574334:0x393039,{roughness:1,radial:4});addBox(world,[x,y+.8,z+1.43],[.72,1.6,.08],0x312922,{roughness:1})}}
  if(theme==='mine'){for(let i=0;i<9;i++){const x=(rng()-.5)*240,z=-28-rng()*130,y=heightAt(x,z);addCrystal(x,z,rng,.7+rng()*.65,0xd9a855);addBox(world,[x,y+2,z],[.12,3.2,.12],0x302923,{metalness:.45});addBox(world,[x,y+3.55,z],[1.8,.13,.14],0x725532,{metalness:.32})}}
  if(theme==='graveyard'){for(let i=0;i<22;i++){const x=(rng()-.5)*260,z=-24-rng()*140,y=heightAt(x,z),stone=i%3?0x626c5c:0x817c6d;addBox(world,[x,y+.68,z],[.18,1.36,.52],stone,{roughness:1});addBox(world,[x,y+1.19,z],[.92,.18,.56],stone,{roughness:1});addBox(world,[x,y+1.48,z],[.48,.74,.15],stone,{roughness:1})}}
  if(theme==='bloodfield'||theme==='bloodtemple'||theme==='kardinal'){for(let i=0;i<Math.ceil(30*detailScale);i++){const x=(rng()-.5)*270,z=-24-rng()*145,y=heightAt(x,z),c=theme==='bloodfield'?0x9e352e:theme==='kardinal'?0x9f183f:0x678344;addCone(world,[x,y+.12,z],.16,.24,c,{emissive:c,emissiveIntensity:.16,radial:5})}}
}
function addWorldProps(map,rng,profileOverride=null){
  obstacles=[];
  const theme=map.theme;
  const profile=profileOverride||qualityProfileForMap(state.map),propCount=profile.props;
  for(let n=0;n<propCount;n++){
    const a=rng()*Math.PI*2,r=22+Math.sqrt(rng())*135,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(Math.abs(x)<7&&z<0&&z>-168)continue;
    if(['grass','forest','bloodfield','swamp','village'].includes(theme)){
      if(rng()<.66)addTree(x,z,.72+rng()*.75,rng,theme);else addRock(x,z,rng,.55+rng()*.8);
    }else if(['city','hospital','factory','cryolab','biolab','bunker','virusinst','nuke','chemsmog','genetics','quarantine'].includes(theme)){
      if(rng()<.38)addBuilding(x,z,rng,theme==='bunker'?'bunker':theme==='hospital'||theme==='cryolab'||theme==='biolab'?'lab':'container');
      else if(rng()<.58)addPipe(x,z,rng);else addRock(x,z,rng,.6+rng()*.7);
    }else if(['ruins','cathedral','castle','graveyard','mine','bloodtemple','kardinal','diagnos'].includes(theme)){
      if(rng()<.35)addPillar(x,z,rng,2.4+rng()*3.2);else if(rng()<.65)addRuin(x,z,rng,2+rng()*3.4);else addRock(x,z,rng,.7+rng());
    }else if(['desert','volcano','ravine'].includes(theme)){
      if(rng()<.72)addRock(x,z,rng,1+rng()*2.1);else addCrystal(x,z,rng,.7+rng(),theme==='desert'?0xbe8e56:0xff563d);
    }else if(theme==='snow'){
      if(rng()<.45)addTree(x,z,.8+rng()*.7,rng,'snow');else if(rng()<.7)addCrystal(x,z,rng,.7+rng(),0x9fe8f3);else addRock(x,z,rng,1+rng());
    }else if(theme==='space'){
      if(rng()<.38)addBuilding(x,z,rng,'container');else if(rng()<.7)addRock(x,z,rng,.8+rng());else makeLamp(x,z,0x778bff);
    }else addRock(x,z,rng,.65+rng()*1.1);
  }
  if(['city','hospital','factory','cyber','cryolab','biolab','bunker','virusinst','nuke','chemsmog','genetics','quarantine','space'].includes(theme)){
    for(const x of [-37,-19,19,37])makeLamp(x,8,theme==='cyber'?0x31f6df:theme==='cryolab'?0x51d6ff:0xf6bc7a);
  }
  if(theme==='diagnos')addDiagnosArena(rng,Math.min(1,(qualityProfiles[state.quality]||qualityProfiles.medium).props/qualityProfiles.ultra.props));
  addMapLandmark(map,rng,Math.min(1,(qualityProfiles[state.quality]||qualityProfiles.medium).props/qualityProfiles.ultra.props));
}
function addDiagnosArena(rng,detailScale=1){
  const pools=[[-39,-39,5.2,3.8],[38,-43,4.6,3.4],[-45,38,4.8,3.6],[45,39,5.4,3.9],[0,75,6,4.2],[-84,-6,5.2,3.7],[83,9,4.6,3.4]];
  for(let i=0;i<pools.length;i++){const [x,z,rx,rz]=pools[i],y=heightAt(x,z);const rim=addCylinder(world,[x,y+.05,z],1,1,.22,0x21191d,{roughness:.96,radial:24,cast:false});rim.scale.set(rx*1.28,1,rz*1.28);const lava=addCylinder(world,[x,y+.18,z],1,1,.12,0xd92b16,{roughness:.42,metalness:.12,emissive:0xff2b0a,emissiveIntensity:1.3,radial:24,cast:false});lava.scale.set(rx,1,rz);const core=addCylinder(world,[x,y+.25,z],1,1,.045,0xff8a25,{roughness:.35,emissive:0xff4a12,emissiveIntensity:1.15,radial:20,cast:false});core.scale.set(rx*.52,1,rz*.46);if(i%2===0){const light=new THREE.PointLight(0xff3c18,2.1,18,2);light.position.set(x,y+1.15,z);world.add(light)}}
  const fissureCount=Math.round(18*detailScale);for(let i=0;i<fissureCount;i++){const a=rng()*Math.PI*2,r=15+rng()*100;if(r<20)continue;const x=Math.cos(a)*r,z=Math.sin(a)*r,len=2.5+rng()*8,angle=a+(rng()-.5)*.9,y=heightAt(x,z)+.11;const crack=addBox(world,[x,y,z],[len,.055,.16+rng()*.14],0x261215,{roughness:1,cast:false});crack.rotation.y=angle;const glow=addBox(world,[x,y+.045,z],[len*.68,.025,.035],i%3?0xe33b22:0xff9a37,{emissive:i%3?0xff230a:0xff6120,emissiveIntensity:.82,cast:false});glow.rotation.y=angle}
  const spires=8;for(let i=0;i<spires;i++){const a=i*Math.PI*2/spires+.12,r=76+(i%3)*12,x=Math.cos(a)*r,z=Math.sin(a)*r,y=heightAt(x,z),h=7+(i%4)*2;const shaft=addCylinder(world,[x,y+h*.38,z],.9,.5,h*.76,0x292329,{roughness:.95,metalness:.08,radial:7});shaft.rotation.z=(rng()-.5)*.16;addCone(world,[x,y+h*.86,z],.72,h*.32,0x3a282c,{roughness:.92,radial:7});addBox(world,[x,y+h*.45,z+.56],[.09,h*.43,.06],0xd53226,{emissive:0x8d120c,emissiveIntensity:.48,cast:false});if(i%2===0){const fire=addCone(world,[x,y+h+.72,z],.48,1.55,0xff4b17,{emissive:0xff2b08,emissiveIntensity:1.5,radial:7,cast:false});fire.scale.set(.75,1.25,.75);const flame=addCone(world,[x,y+h+1.65,z],.25,.95,0xffb52e,{emissive:0xff7920,emissiveIntensity:1.25,radial:7,cast:false});flame.scale.set(.8,1.2,.8)}}
}
function createPortal(){
  const g=new THREE.Group(),z=-166,y=heightAt(0,z),stone=0x6f766d,metal=0x394943;g.position.set(0,y,z);world.add(g);
  addBox(g,[0,.16,0],[6.8,.32,2.6],0x4a5149,{roughness:.95});
  for(const x of [-2.45,2.45]){
    addBox(g,[x,2.45,0],[.72,4.9,1.05],stone,{roughness:.88});
    addBox(g,[x,2.5,.57],[.49,4.45,.12],0x8b9581,{roughness:.8});
    addBox(g,[x,4.9,0],[1.04,.32,1.34],0x303936,{metalness:.38});
    addBox(g,[x,5.15,0],[1.22,.22,1.5],0xa19066,{metalness:.28});
    for(let yrow=.65;yrow<4.8;yrow+=.72)addBox(g,[x,yrow,.65],[.52,.055,.055],0x555e50,{roughness:1,cast:false});
  }
  addBox(g,[0,5.0,0],[4.6,.72,1.18],stone,{roughness:.85});
  addBox(g,[0,5.0,.62],[3.78,.33,.12],0x343c38,{metalness:.4});
  addBox(g,[0,5.0,.71],[1.05,.2,.045],0x77f3c9,{emissive:0x32bd95,emissiveIntensity:.65,cast:false});
  addBox(g,[0,.26,-.74],[3.95,.2,.48],0x9d9b7f,{roughness:.78});
  const leftLeaf=new THREE.Group(),rightLeaf=new THREE.Group();leftLeaf.position.set(-1.62,.3,.08);rightLeaf.position.set(1.62,.3,.08);g.add(leftLeaf,rightLeaf);
  for(const [leaf,sign] of [[leftLeaf,1],[rightLeaf,-1]]){
    addBox(leaf,[sign*.79,1.85,0],[1.58,3.72,.22],0x3c4944,{metalness:.35,roughness:.65});
    addBox(leaf,[sign*.79,1.85,.13],[1.34,3.45,.08],0x665c43,{metalness:.22,roughness:.75});
    for(let row=0;row<5;row++)addBox(leaf,[sign*.79,.35+row*.72,.19],[1.28,.08,.05],row%2?0x879071:0x4a5548,{metalness:.28,cast:false});
    addBox(leaf,[sign*.79,1.85,.23],[.09,3.58,.06],0xb19b68,{metalness:.42});
    for(const xhinge of [sign*.11,sign*1.47])for(const hy of [.5,3.15])addCylinder(leaf,[xhinge,hy,.16],.105,.105,.24,0xbfa975,{metalness:.7,radial:10});
  }
  addMesh(g,coneGeo(.56,.72,6),material(0x7ff5c9,.28,.32,0x35d8a7,.75),[0,5.12,.83],[1,1,.34],false);
  const pLight=new THREE.PointLight(0x66f2c2,.25,24,2);pLight.position.set(0,2.8,.8);g.add(pLight);
  const ring=addMesh(g,torusGeo(2.55,.055),material(0x78d8b6,.4,.2,0x52c49f,.35),[0,2.2,-.5],[1,1,1],false);
  portal={group:g,ring,leftLeaf,rightLeaf,light:pLight,x:0,z,y,open:false,progress:0};
}
function disposeWorld(){
  world.traverse(o=>{if(o.geometry&&!geometryCacheHas(o.geometry))o.geometry.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])if(!Array.from(materialCache.values()).includes(m)){m.map?.dispose?.();m.dispose?.()}}});
  groundMesh=null;
  scene.remove(world);world=new THREE.Group();scene.add(world);portal=null;player=null;playerModel=null;playerRig=null;petModel=null;enemies=[];projectiles=[];pickups=[];effects=[];obstacles=[];shotOccluders=[];
}

function buildWeaponModel(type,parent){
  const spec=weapons.find(w=>w.type===type)||weapons[0],g=new THREE.Group();parent.add(g);
  const body=spec.color,metal=0x515958,dark=0x242a29;
  if(type==='rocket'){
    const tube=addCylinder(g,[0,0,-.46],.16,.2,1.08,body,{metalness:.48,radial:14});tube.rotation.x=-Math.PI/2;const warhead=addCone(g,[0,0,-1.08],.16,.42,0xb7a48a,{metalness:.3,radial:12});warhead.rotation.x=-Math.PI/2;const exhaust=addCylinder(g,[0,0,.15],.19,.21,.24,dark,{metalness:.6,radial:14});exhaust.rotation.x=-Math.PI/2;for(const side of [-1,1]){addBox(g,[side*.2,-.18,-.74],[.32,.06,.24],0x53633f,{metalness:.35});addBox(g,[side*.2,.18,-.74],[.32,.06,.24],0x53633f,{metalness:.35})}addBox(g,[0,-.23,-.1],[.28,.34,.3],dark);addBox(g,[0,.2,.16],[.48,.08,.22],metal,{metalness:.65});
  }else if(type==='minigun'){
    addBox(g,[0,0,-.12],[.42,.34,.55],body,{metalness:.72,roughness:.38});
    addCylinder(g,[0,.02,-.47],.18,.2,.2,0x303735,{metalness:.82,radial:12});
    for(let i=0;i<6;i++){const a=i*Math.PI*2/6,x=Math.cos(a)*.13,y=Math.sin(a)*.13;const barrel=addCylinder(g,[x,y,-.91],.034,.042,.83,i%2?0x7e8984:0xb5b9b2,{metalness:.86,roughness:.25,radial:10});barrel.rotation.x=-Math.PI/2;addCylinder(g,[x,y,-1.34],.045,.045,.08,0x292e2d,{metalness:.75,radial:10}).rotation.x=-Math.PI/2}
    addCylinder(g,[0,0,-.55],.26,.26,.13,0x414947,{metalness:.78,radial:12});
    addBox(g,[0,-.25,.03],[.23,.34,.26],dark);addBox(g,[0,.25,-.08],[.1,.08,.44],0x9caa9f,{metalness:.74});
  }else{
    addBox(g,[0,0,-.08],[type==='shotgun'?.25:.2,.19,type==='shotgun'?.68:.52],body,{metalness:.34});
    addCylinder(g,[0,.02,-.54],type==='shotgun'?.06:.038,type==='shotgun'?.075:.055,.48,metal,{metalness:.72,radial:10}).rotation.x=-Math.PI/2;
    addBox(g,[0,-.19,-.08],[.13,.31,.19],dark);addBox(g,[0,.14,.02],[.08,.09,.15],metal,{metalness:.7});
    if(type==='shotgun')addBox(g,[0,-.12,.16],[.11,.23,.29],0x302b27);
    if(type==='laser')addBox(g,[0,.14,-.43],[.09,.08,.42],0x54fff2,{emissive:0x00fff0,emissiveIntensity:1.4});
    if(type==='uzi')addBox(g,[.14,.02,.03],[.12,.13,.22],0x303533,{metalness:.55});
  }
  addBox(g,[0,.11,.15],[.38,.09,.2],dark);addBox(g,[0,-.28,.03],[.18,.06,.15],0x9f9a7b,{metalness:.3});return g;
}
function grenadeSkinMaterial(){
  const key='grenade-skin';if(materialCache.has(key))return materialCache.get(key);
  const art=document.createElement('canvas');art.width=256;art.height=128;const ctx=art.getContext('2d');ctx.fillStyle='#536b3c';ctx.fillRect(0,0,256,128);
  for(let i=0;i<340;i++){ctx.fillStyle=Math.random()>.52?'rgba(23,39,25,.42)':'rgba(181,164,87,.18)';ctx.beginPath();ctx.ellipse(Math.random()*256,Math.random()*128,2+Math.random()*8,1+Math.random()*4,Math.random()*Math.PI,0,Math.PI*2);ctx.fill()}
  for(const y of [18,108]){ctx.fillStyle='#27332d';ctx.fillRect(0,y,256,6);ctx.fillStyle='#899456';ctx.fillRect(0,y+2,256,2)}
  const map=new THREE.CanvasTexture(art);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=THREE.RepeatWrapping;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const mat=new THREE.MeshStandardMaterial({map,color:0xffffff,roughness:.62,metalness:.28});materialCache.set(key,mat);return mat;
}
function createGrenadeModel(parent){
  const g=new THREE.Group();parent.add(g);const skin=grenadeSkinMaterial();
  addMesh(g,cylGeo(.17,.19,.4,16),skin,[0,0,0]);
  addCylinder(g,[0,.24,0],.105,.13,.1,0x59664b,{metalness:.58,radial:12});
  addCylinder(g,[0,.315,0],.065,.085,.07,0xb1a36f,{metalness:.65,radial:12});
  for(const y of [-.105,.105]){const band=addMesh(g,torusGeo(.175,.018),material(0xb6a96e,.48,.55),[0,y,0]);band.rotation.x=Math.PI/2}
  addBox(g,[.135,.2,0],[.23,.055,.105],0x8f9877,{metalness:.42,roughness:.48});
  const pin=addMesh(g,torusGeo(.055,.012),material(0xc5c7b7,.35,.8),[.02,.37,0]);pin.rotation.x=Math.PI/2;
  addSphere(g,[0,.37,0],[.045,.035,.045],0xaeb6a5,{geometry:smallSphereGeo,metalness:.58});return g;
}
function limb(parent,x,y,z,length,radius,color,angle=0){const pivot=new THREE.Group();pivot.position.set(x,y,z);parent.add(pivot);const upper=addCylinder(pivot,[0,-length*.25,0],radius*.82,radius,length*.5,color,{radial:8});upper.rotation.x=angle;const joint=addSphere(pivot,[0,-length*.52,0],[radius*.82,radius*.82,radius*.82],color,{geometry:smallSphereGeo});const lower=addCylinder(pivot,[0,-length*.77,0],radius*.72,radius*.8,length*.5,color,{radial:8});lower.rotation.x=angle*.5;addSphere(pivot,[0,-length,.025],[radius*1.12,radius*.46,radius*1.18],0x252723,{geometry:smallSphereGeo});return pivot}
function legLimb(parent,x,y,z,length,radius,color){const pivot=new THREE.Group();pivot.position.set(x,y,z);parent.add(pivot);pivot.userData.baseY=y;addCylinder(pivot,[0,-length*.24,0],radius*.82,radius,length*.48,color,{radial:8});addSphere(pivot,[0,-length*.49,0],[radius*.82,radius*.82,radius*.82],color,{geometry:smallSphereGeo});const lower=new THREE.Group();lower.position.y=-length*.5;pivot.add(lower);pivot.userData.lowerLeg=lower;addCylinder(lower,[0,-length*.23,0],radius*.7,radius*.76,length*.48,color,{radial:8});addSphere(lower,[0,-length*.4,.08],[radius*1.12,radius*.46,radius*1.3],0x252723,{geometry:smallSphereGeo});return pivot}
function createHumanoid(kind='player',bossCode=null){
  const root=new THREE.Group(),visual=new THREE.Group(),isBoss=!!bossCode,isPlayer=kind==='player';
  // Body faces local +Z, while the camera, movement and weapons use -Z.
  // Keep that convention consistent so the character and gun follow the aim.
  visual.rotation.y=Math.PI;root.add(visual);
  const skin=isPlayer?0xc08f70:kind==='brute'?0x635848:kind==='crawler'?0x819081:kind==='bloater'?0x8b8954:kind==='rifle'?0x71806a:kind==='runner'?0x9a796c:kind==='spitter'?0x73965d:kind==='armored'?0x77796b:kind==='hazmat'?0xaaa264:kind==='stalker'?0x665c70:0x78907a;
  const cloth=isPlayer?0x202b2d:kind==='brute'?0x453a33:kind==='bloater'?0x55532e:kind==='crawler'?0x405246:kind==='runner'?0x493938:kind==='spitter'?0x3d5139:kind==='armored'?0x39403e:kind==='hazmat'?0x5b6a36:kind==='stalker'?0x292632:0x49483e;
  const accent=isPlayer?0x63cfb9:kind==='brute'?0x9b3b35:kind==='bloater'?0xa6a435:kind==='rifle'?0xb27c48:kind==='runner'?0xc97862:kind==='spitter'?0x9cf05b:kind==='armored'?0xb8a96e:kind==='hazmat'?0xd9d06a:kind==='stalker'?0xd3324e:0x6e8b66;
  const part={root,visual,kind,legs:[],arms:[],body:null,gun:null,head:null,phase:Math.random()*6,lookMeshes:[],lookAccessory:null};
  const size=isBoss?(bossCode==='diagnos'?5:bossCode==='kardinal'?9:2.25):kind==='brute'?1.25:kind==='crawler'?.82:kind==='runner'?.94:kind==='armored'?1.08:1;
  root.scale.setScalar(size);
  const hips=addBox(visual,[0,.88,0],[.62,.25,.42],isPlayer?0x313d3b:cloth);
   part.body=addBox(visual,[0,1.38,0],[isBoss?.94:.73,isBoss?1.08:.88,isBoss?.55:.48],isPlayer?0x303a3b:cloth);if(isPlayer)part.lookMeshes.push(part.body);
  // Armor plates, straps, stitching and shoulder guards give each body volume and a readable silhouette.
  addBox(visual,[0,1.58,.247],[.42,.5,.035],isPlayer?0x52645c:accent);
  addBox(visual,[-.12,1.6,.27],[.035,.52,.026],isPlayer?0xd1b27a:0x3b332d);
  addBox(visual,[.12,1.6,.27],[.035,.52,.026],isPlayer?0xd1b27a:0x3b332d);
  addBox(visual,[0,1.05,.24],[.64,.09,.05],isPlayer?0x131919:0x322e2a);
  addSphere(visual,[-.43,1.68,0],[kind==='brute'?.29:.22,kind==='brute'?.27:.2,.25],isPlayer?0x51615b:kind==='armored'?0x62675e:accent,{geometry:smallSphereGeo});
  addSphere(visual,[.43,1.68,0],[kind==='brute'?.29:.22,kind==='brute'?.27:.2,.25],isPlayer?0x51615b:kind==='armored'?0x62675e:accent,{geometry:smallSphereGeo});
  if(kind==='bloater'){
    addSphere(visual,[0,1.24,.32],[.43,.4,.31],0x969847,{geometry:sphereGeo});
    for(let i=0;i<5;i++)addSphere(visual,[(i-2)*.13,1.18+(i%2)*.2,.59],[.075,.08,.045],i%2?0xc8c55a:0x737c39,{geometry:smallSphereGeo,emissive:0x4d651e,emissiveIntensity:.22});
  }
  if(kind==='spitter'){
    addSphere(visual,[0,1.57,.31],[.3,.34,.18],0x9bd04d,{emissive:0x548f21,emissiveIntensity:.5});
    addSphere(visual,[0,2.04,.28],[.22,.15,.08],0x9ef652,{emissive:0x65d528,emissiveIntensity:.8});
    addSphere(visual,[-.22,1.39,.3],[.11,.17,.1],0x8ecb43,{emissive:0x4d851e,emissiveIntensity:.4});
    addSphere(visual,[.22,1.39,.3],[.11,.17,.1],0x8ecb43,{emissive:0x4d851e,emissiveIntensity:.4});
  }
  if(kind==='armored'){
    addBox(visual,[0,1.43,.31],[.76,.82,.14],0x69766c,{metalness:.48,roughness:.5});
    addBox(visual,[0,1.72,.4],[.48,.16,.035],accent,{metalness:.3,emissive:0x524329,emissiveIntensity:.18});
    addBox(visual,[0,2.31,-.02],[.65,.15,.56],0x4c5a52,{metalness:.45,roughness:.5});
    addBox(visual,[0,2.17,.25],[.42,.08,.1],0x303c38,{metalness:.35});
  }
  if(kind==='hazmat'){
    addSphere(visual,[0,2.1,.1],[.35,.35,.34],0x9fa34c,{emissive:0x6d7522,emissiveIntensity:.16});
    addBox(visual,[0,1.45,.28],[.78,.94,.1],0x536b3f,{metalness:.12});
    for(const side of [-1,1]){addCylinder(visual,[side*.39,1.52,.03],.09,.12,.7,0xc1b84d,{roughness:.6});addSphere(visual,[side*.39,1.2,.08],[.14,.14,.14],0xd7d1a1,{geometry:smallSphereGeo})}
    addBox(visual,[0,2.08,.38],[.55,.3,.06],0x344141,{metalness:.4,roughness:.25});
  }
  if(kind==='stalker'){
    addBox(visual,[0,1.42,.3],[.2,.72,.08],0x352e3c);addCone(visual,[-.12,2.34,.02],.09,.44,0x46333b).rotation.z=-.22;addCone(visual,[.12,2.34,.02],.09,.44,0x46333b).rotation.z=.22;
    for(const side of [-1,1])addSphere(visual,[side*.15,2.09,.27],[.045,.035,.03],0xff263e,{geometry:smallSphereGeo,emissive:0xff0018,emissiveIntensity:1.2});
  }
  if(kind==='runner'){
    addBox(visual,[0,1.42,.3],[.14,.48,.06],0x9b4c40);
    addBox(visual,[0,.83,.25],[.42,.12,.12],0x282e2a);
  }
  if(isPlayer){
    addBox(visual,[0,1.45,-.29],[.62,.72,.3],0x203331,{metalness:.3,roughness:.62});
    addBox(visual,[-.2,1.48,-.455],[.075,.56,.028],0x58e2d2,{emissive:0x168c82,emissiveIntensity:.35,cast:false});
    addBox(visual,[.2,1.48,-.455],[.075,.56,.028],0x58e2d2,{emissive:0x168c82,emissiveIntensity:.35,cast:false});
    addBox(visual,[0,1.83,-.28],[.48,.13,.14],0xd18b43,{metalness:.35});
    addBox(visual,[0,1.55,.33],[.72,.49,.13],0x55736a,{metalness:.36,roughness:.54});
    addBox(visual,[0,1.61,.405],[.16,.3,.035],0xd99a4c,{metalness:.3,roughness:.6});
    addBox(visual,[0,1.08,-.22],[.82,.14,.16],0xa76c38,{metalness:.36});
    for(const side of [-1,1]){addBox(visual,[side*.48,1.73,.02],[.24,.2,.39],side<0?0x4f746b:0x716e5a,{metalness:.36,roughness:.58});addBox(visual,[side*.48,1.75,.225],[.13,.07,.035],0xf0b45d,{metalness:.24})}
  }
  const head=new THREE.Group();head.position.set(0,2.08,0);visual.add(head);part.head=head;
  part.face=addSphere(head,[0,0,0],[.31,.35,.31],skin);if(isPlayer)part.lookMeshes.push(part.face);
  addBox(head,[0,-.17,.19],[.26,.12,.1],isPlayer?0x192120:skin);
  addSphere(head,[-.12,.02,.26],[.055,.045,.035],isPlayer?0x4bdddb:0xf44642,{geometry:smallSphereGeo,emissive:isPlayer?0x18c8c1:0xc61b15,emissiveIntensity:.8});
  addSphere(head,[.12,.02,.26],[.055,.045,.035],isPlayer?0x4bdddb:0xf44642,{geometry:smallSphereGeo,emissive:isPlayer?0x18c8c1:0xc61b15,emissiveIntensity:.8});
  if(isPlayer){
    addSphere(head,[0,.22,-.01],[.34,.19,.35],0x3a4b48);
    addBox(head,[0,.18,-.005],[.66,.32,.59],0x3c544b,{metalness:.38,roughness:.48});
    addBox(head,[0,.045,.3],[.5,.14,.075],0x53e8dc,{emissive:0x20bdb2,emissiveIntensity:.75,metalness:.22});
    addBox(head,[0,.36,-.005],[.4,.055,.5],0xe6a34e,{metalness:.32});
    addBox(head,[0,.1,.38],[.36,.055,.06],0x64e2d4,{emissive:0x1e8c80,emissiveIntensity:.5});
  }
  else {addSphere(head,[0,.2,-.015],[.35,.16,.34],kind==='brute'?0x382f2b:0x4c5145);addBox(head,[0,-.08,.27],[.28,.08,.06],0x241d1b)}
  if(isBoss){
    const bossMat=bossCode==='kardinal'?0x9a2038:bossCode==='harvester'?0x394f32:0x613d79;
    addBox(visual,[0,1.48,.32],[.78,.78,.09],bossMat,{metalness:.28});
    addCone(visual,[-.38,2.35,0],.22,.9,bossMat).rotation.z=-.42;addCone(visual,[.38,2.35,0],.22,.9,bossMat).rotation.z=.42;
    addBox(visual,[-.6,1.38,0],[.26,.78,.28],bossMat);addBox(visual,[.6,1.38,0],[.26,.78,.28],bossMat);
    if(bossCode==='harvester'){
      for(let i=0;i<3;i++){const blade=addCone(visual,[Math.cos(i*2.1)*.9,1.6,Math.sin(i*2.1)*.35],.2,1.25,0x819a56);blade.rotation.z=-.45+i*.28}
      addBox(visual,[0,2.56,-.02],[.7,.12,.46],0x71804d);
    }else if(bossCode==='diagnos'){
      for(let i=0;i<4;i++){const arm=limb(visual,(i%2?1:-1)*.72,1.68-(i>1?.35:0),-.06,1.14,.13,i%2?0x9f64bc:0x5e427a);arm.rotation.z=(i%2?-.72:.72)}
      addSphere(visual,[0,1.5,.39],[.2,.28,.08],0x72ffae,{emissive:0x42ee80,emissiveIntensity:1.4});
    }
  }
  part.arms.push(limb(visual,-.49,1.67,0,.82,.14,isPlayer?0x303b39:skin));
  part.arms.push(limb(visual,.49,1.67,0,.82,.14,isPlayer?0x303b39:skin));
  part.legs.push(legLimb(visual,-.22,.88,0,.92,.17,isPlayer?0x252e2e:cloth));
  part.legs.push(legLimb(visual,.22,.88,0,.92,.17,isPlayer?0x252e2e:cloth));if(isPlayer)part.pantsGroups=part.legs;
  if(isPlayer){
    // The visual group is mirrored so its +X arm is the character's left hand.
    part.gunHand=part.arms[1];part.throwHand=part.arms[0];part.gunHand.rotation.x=-.7;part.throwHand.rotation.x=-.28;
    part.gun=buildWeaponModel(weapons[state.selectedWeapon].type,part.gunHand);part.gun.rotation.y=Math.PI;part.gun.position.set(0,-.62,.09);part.gun.scale.setScalar(1.12);
    part.heldGrenade=createGrenadeModel(part.throwHand);part.heldGrenade.position.set(0,-.74,.08);part.heldGrenade.scale.setScalar(.72);part.heldGrenade.visible=false;
  }
  else if(kind==='rifle'){part.gun=buildWeaponModel('pistol',visual);part.gun.rotation.y=Math.PI;part.gun.scale.setScalar(.82);part.gun.position.set(-.51,1.25,.12)}
  if(kind==='crawler'){root.scale.set(size*.95,size*.56,size*1.12);root.rotation.z=-.12;root.position.y=.03}
  if(kind==='runner')root.rotation.x=.12;
  if(isPlayer)applyCharacterLook(part);return part;
}

function lookMaterial(mesh,color){if(!mesh?.material)return;if(!mesh.userData.lookMaterial)mesh.userData.lookMaterial=mesh.material.clone();mesh.material=mesh.userData.lookMaterial;mesh.material.color.setHex(color)}
function applyCharacterLook(part=playerModel,look=characterLook){
  if(!part||part.kind!=='player')return;
  const skins={tan:0xc08f70,light:0xe1b99e,dark:0x704b3c,olive:0xa87c58,pale:0xe0c7bb},jackets={teal:0x218d83,black:0x252b31,red:0x9d303b,white:0xb2c3bf,purple:0x654679,gold:0x9b7430,blue:0x255f8c,orange:0xa75426},pants={cargo:0x252e2e,black:0x171b21,urban:0x4a5255,desert:0x806843,arctic:0xadbdbb,olive:0x48553b,red:0x492a31};
  const skin=skins[look.skin]||skins.tan,jacket=jackets[look.jacket]||jackets.teal,pant=pants[look.pants]||pants.cargo;
  lookMaterial(part.face,skin);lookMaterial(part.body,jacket);for(const group of [...(part.arms||[]),...(part.pantsGroups||[])])group.traverse(o=>{if(o.isMesh)lookMaterial(o,group===part.pantsGroups?.[0]||group===part.pantsGroups?.[1]?pant:jacket)});
  for(const mesh of part.lookMeshes||[])if(mesh!==part.face&&mesh!==part.body){lookMaterial(mesh,jacket)}
  if(part.lookAccessory)part.head.remove(part.lookAccessory);const acc=new THREE.Group();part.lookAccessory=acc;part.head.add(acc);
  if(look.hat==='cap'){addBox(acc,[0,.31,-.01],[.49,.16,.44],0x263d40,{metalness:.22});addBox(acc,[0,.25,.28],[.52,.055,.28],0x397a75,{metalness:.25})}
  if(look.hat==='helmet'){addSphere(acc,[0,.24,-.005],[.36,.22,.35],0x536a70,{geometry:smallSphereGeo,metalness:.48});addBox(acc,[0,.12,.25],[.58,.07,.13],0x25363a,{metalness:.52})}
  if(look.hat==='beanie'){addSphere(acc,[0,.27,-.015],[.33,.2,.33],0x633f56,{geometry:smallSphereGeo});addBox(acc,[0,.16,.01],[.65,.09,.59],0x8a4b66)}
  if(look.hat==='crown'){for(let i=-2;i<=2;i++)addCone(acc,[i*.12,.34,.02],.075,.42,0x44caff,{emissive:0x008cff,emissiveIntensity:1.1,radial:5});addBox(acc,[0,.17,0],[.58,.11,.5],0x1483bd,{metalness:.55,emissive:0x006fff,emissiveIntensity:.42})}
  if(look.hat==='boonie'){addSphere(acc,[0,.24,-.01],[.34,.15,.34],0x6d7145,{geometry:smallSphereGeo});addBox(acc,[0,.17,.02],[.72,.065,.65],0x808252,{roughness:.92})}
  if(look.hat==='pilot'){addSphere(acc,[0,.22,-.01],[.36,.25,.35],0x3a464a,{geometry:smallSphereGeo,metalness:.32});addBox(acc,[0,.02,.29],[.58,.12,.08],0x5c6768,{metalness:.36})}
  if(look.glasses!=='none'){const gold=look.glasses==='gold',frame=gold?0xd6a84b:0x1c2d34,lens=gold?0x74bdc9:look.glasses==='visor'?0x28dfff:look.glasses==='red'?0xc83945:0x16242b;for(const x of [-.12,.12]){addBox(acc,[x,.015,.285],[.18,.12,.045],frame,{metalness:.68});addBox(acc,[x,.015,.313],[.135,.074,.018],lens,{metalness:.3,emissive:look.glasses==='visor'?0x00aaff:look.glasses==='red'?0x70101a:0,emissiveIntensity:.75,cast:false})}addBox(acc,[0,.02,.29],[.07,.025,.04],frame,{metalness:.68});if(look.glasses==='tactical')for(const x of [-.225,.225])addBox(acc,[x,0,.2],[.07,.035,.14],frame,{metalness:.68})}
  if(part.lookGear)part.visual.remove(part.lookGear);const gear=new THREE.Group();part.lookGear=gear;part.visual.add(gear);
  const vestColor={scout:0x4e786e,plated:0x65716d,hazard:0x997736,royal:0x684c78}[look.vest]||0x000000;
  if(look.vest&&look.vest!=='none'){addBox(gear,[0,1.48,.304],[.67,.64,.13],vestColor,{metalness:.32,roughness:.55});addBox(gear,[0,1.48,.38],[.19,.28,.035],look.vest==='hazard'?0xd5ba46:0xb89c62,{metalness:.25});for(const x of [-.37,.37])addBox(gear,[x,1.57,.02],[.14,.43,.38],vestColor,{metalness:.35,roughness:.6})}
  if(part.lookPack)part.visual.remove(part.lookPack);const pack=new THREE.Group();part.lookPack=pack;part.visual.add(pack);
  const packStyle={compact:[0x344943,.48,.58],ranger:[0x526a43,.68,.82],heavy:[0x3b4548,.82,1.02]}[look.pack];
  if(packStyle){const [color,w,h]=packStyle;addBox(pack,[0,1.48,-.34],[w,h,.27],color,{metalness:.2,roughness:.86});addBox(pack,[0,1.53,-.49],[w*.72,h*.42,.08],color===0x526a43?0x7b8c58:0x202a2d,{roughness:.8});for(const x of [-1,1])addBox(pack,[x*w*.48,1.47,-.31],[.055,h*.9,.06],0xc69b53,{metalness:.3})}
}
function readCharacterDraft(){for(const id of ['Skin','Jacket','Pants','Hat','Glasses','Vest','Pack'])characterLook[id.toLowerCase()]=$('look'+id).value;applyCharacterLook(playerModel)}
function applyCharacterLookFromMenu(){readCharacterDraft();characterLookApplied={...characterLook};try{localStorage.setItem('bb-character-look',JSON.stringify(characterLook));const nick=String($('characterNickname').value||'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,16);if(nick){localStorage.setItem('bb-vs-nickname-v2',nick);onlineNickname=nick;window.BBGameNet?.setNickname?.(nick)}}catch(_e){}notify('KARAKTER GÜNCELLENDİ')}
function openCharacterPanel(){if(state.mode!=='menu')return;characterLookApplied={...characterLook};for(const id of ['Skin','Jacket','Pants','Hat','Glasses','Vest','Pack'])$('look'+id).value=characterLook[id.toLowerCase()]||'none';try{$('characterNickname').value=localStorage.getItem('bb-vs-nickname-v2')||onlineNickname||''}catch(_e){$('characterNickname').value=''}state.mode='character';if(playerModel)playerModel.root.position.x=3;$('mainMenu').classList.add('hidden');$('characterPanel').classList.remove('hidden')}
function closeCharacterPanel(){if(state.mode!=='character')return;if(characterLookApplied){characterLook={...characterLookApplied};applyCharacterLook(playerModel)}$('characterPanel').classList.add('hidden');state.mode='menu';if(playerModel)playerModel.root.position.x=0;$('mainMenu').classList.remove('hidden')}

function addBossDecor(part,code){
  const r=part.visual;
  if(code==='kardinal'){
    for(let i=0;i<5;i++){const spike=addCone(r,[(i-2)*.22,2.95,0],.13,.75,0x89162d);spike.rotation.z=(i-2)*-.12}
    addBox(r,[0,1.38,.43],[.34,.52,.08],0xff374d,{emissive:0xd4122e,emissiveIntensity:.8});
    const capeShape=new THREE.Shape();capeShape.moveTo(-.45,2.34);capeShape.lineTo(.45,2.34);capeShape.lineTo(.86,.34);capeShape.lineTo(.52,.5);capeShape.lineTo(.2,.22);capeShape.lineTo(-.08,.48);capeShape.lineTo(-.48,.2);capeShape.lineTo(-.82,.48);capeShape.closePath();
    const cape=new THREE.Mesh(new THREE.ShapeGeometry(capeShape),new THREE.MeshStandardMaterial({color:0x35121c,roughness:.96,metalness:.04,side:THREE.DoubleSide}));cape.position.z=-.36;cape.castShadow=true;cape.receiveShadow=true;r.add(cape);
    for(const side of [-1,1]){const trim=addBox(r,[side*.65,1.27,-.37],[.045,1.82,.035],side<0?0x701a2c:0x9a3040,{metalness:.2,roughness:.86});trim.rotation.z=side*.11}
  }else if(code==='harvester'){
    addSphere(r,[0,2.28,-.02],[.66,.48,.43],0x425f36);for(let i=-1;i<=1;i++)addCone(r,[i*.35,2.5,-.01],.15,.9,0x6c8046).rotation.z=i*.3;
  }else{
    // DIAGNOS is a distinct cathedral-sized void entity with layered plates,
    // a luminous mask, crown spines and six articulated tendrils.
    addBox(r,[0,1.42,.47],[1.02,1.08,.22],0x25382f,{metalness:.58,roughness:.34});
    addBox(r,[0,1.48,.61],[.56,.72,.1],0x101b19,{metalness:.42,roughness:.25});
    addSphere(r,[0,1.68,.7],[.22,.32,.09],0x74ffae,{emissive:0x43fa98,emissiveIntensity:2.1,cast:false});
    for(let i=-3;i<=3;i++){const spine=addCone(r,[i*.25,2.65-Math.abs(i)*.1,-.02],.17,.92,i%2?0x668d68:0x302e4d,{metalness:.48,roughness:.4,emissive:0x163c2b,emissiveIntensity:.3});spine.rotation.z=-i*.12}
    for(let i=0;i<6;i++){const side=i%2?1:-1,row=Math.floor(i/2),arm=limb(r,side*(.58+row*.12),1.95-row*.38,-.12,1.55+row*.18,.16,i%2?0x54876d:0x533e70);arm.rotation.z=-side*(.8+row*.13);arm.rotation.x=(row-1)*.18}
    for(let i=0;i<7;i++){const rib=addBox(r,[(i-3)*.2,1.26,.5],[.065,.94,.095],i%2?0x87a47b:0x584872,{metalness:.38,roughness:.48});rib.rotation.z=(i-3)*.12}
    const sigil=addMesh(r,torusGeo(.58,.055),material(0x76ffb6,.3,.34,0x39e97c,.9),[0,1.48,.48],[1,.72,1],false);sigil.rotation.z=Math.PI/4;
  }
}

function createHarvesterMachine(){
  const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);
  const part={root,visual,kind:'harvester',legs:[],arms:[],scythes:[],head:null,jaw:null,body:null,gun:null,phase:0};
  const iron=0x22252a,black=0x111519,armor=0x454044,rust=0x77402c,brass=0xa9874b,glow=0xff4a19,hot=0xffc347;
  // New silhouette: an armored nuclear combine titan with a furnace heart, missile racks and twin reaper blades.
  part.body=addBox(visual,[0,1.95,0],[2.45,2.2,1.72],iron,{metalness:.72,roughness:.38});
  addBox(visual,[0,2.28,.84],[2.08,1.18,.22],armor,{metalness:.64,roughness:.42});
  addBox(visual,[0,1.16,.66],[2.9,.38,1.86],black,{metalness:.55,roughness:.48});
  for(const side of [-1,1]){
    const plate=addBox(visual,[side*.9,2.12,.99],[.62,.72,.18],rust,{metalness:.44,roughness:.58});plate.rotation.z=-side*.22;
    addBox(visual,[side*.77,1.38,.85],[.15,.48,.16],brass,{metalness:.74,roughness:.34});
    const shoulder=addSphere(visual,[side*1.33,2.82,.02],[.67,.62,.62],armor,{metalness:.58,roughness:.46});shoulder.rotation.z=side*.16;
    const arm=addCylinder(visual,[side*1.58,2.13,.18],.37,.52,1.35,iron,{metalness:.62,roughness:.45});arm.rotation.z=-side*.4;part.arms.push(arm);
    const blade=addCone(visual,[side*2.05,1.34,.55],.39,2.02,brass,{metalness:.72,roughness:.28});blade.rotation.z=side*.74;blade.userData.restRotation=blade.rotation.z;part.scythes.push(blade);
    const bladeEdge=addCone(visual,[side*2.46,.69,.62],.2,1.02,hot,{metalness:.52,roughness:.3,emissive:0xb43b12,emissiveIntensity:.28});bladeEdge.rotation.z=-side*.93;
    const leg=addCylinder(visual,[side*.83,.5,-.02],.33,.47,1.35,black,{metalness:.48,roughness:.54});leg.rotation.z=side*.2;part.legs.push(leg);
    addSphere(visual,[side*.94,.12,.25],[.58,.22,.68],armor,{metalness:.48,roughness:.56});
    // Twin shoulder pods each carry a clearly visible triple missile rack.
    const pod=addBox(visual,[side*1.31,3.36,-.14],[.92,.8,1.03],black,{metalness:.66,roughness:.36});pod.rotation.z=-side*.13;
    for(let n=-1;n<=1;n++){const tube=addCylinder(visual,[side*1.31+n*.24,3.39,.39],.12,.15,.87,rust,{metalness:.68,roughness:.34,radial:10});tube.rotation.x=Math.PI/2;addCylinder(visual,[side*1.31+n*.24,3.39,.84],.105,.105,.08,hot,{metalness:.4,emissive:0x9b260d,emissiveIntensity:.55,radial:10})}
  }
  // Furnace helm, furnace core and crown exhaust stacks.
  part.head=addBox(visual,[0,3.67,.11],[1.28,1.04,1.08],black,{metalness:.78,roughness:.3});
  addBox(visual,[0,3.27,.63],[1.08,.22,.19],iron,{metalness:.72,roughness:.35});
  part.jaw=addBox(visual,[0,3.27,.72],[.84,.26,.16],rust,{metalness:.56,roughness:.38});
  for(const side of [-1,1]){const eye=addSphere(visual,[side*.34,3.78,.68],[.2,.13,.08],glow,{emissive:0xff210a,emissiveIntensity:3.2,cast:false});eye.rotation.z=side*.12;const horn=addCone(visual,[side*.51,4.31,.02],.23,.82,brass,{metalness:.58,roughness:.34});horn.rotation.z=side*.28}
  const core=addSphere(visual,[0,2.04,1.02],[.5,.58,.18],glow,{emissive:0xff270a,emissiveIntensity:2.8,cast:false});part.core=core;
  const cage=addMesh(visual,torusGeo(.57,.055),material(brass,.34,.68,0,0),[0,2.04,1.13],[1,1,1],true);cage.rotation.x=.22;part.coreCage=cage;
  for(let i=0;i<4;i++){const vent=addCylinder(visual,[(i-1.5)*.35,4.13,-.38],.12,.2,.72,iron,{metalness:.74,roughness:.36,radial:10});vent.rotation.x=-.2;addSphere(visual,[(i-1.5)*.35,4.5,-.38],[.17,.08,.17],glow,{emissive:0xff320e,emissiveIntensity:1.4,cast:false})}
  // Front mounted crop cutter and teeth complete the new boss silhouette.
  addBox(visual,[0,.78,1.42],[4.15,.48,.46],black,{metalness:.74,roughness:.36});
  for(let x=-1.9;x<=1.91;x+=.34){const tooth=addCone(visual,[x,.36,1.67],.13,.55,brass,{metalness:.72,roughness:.3});tooth.rotation.x=-.25}
  for(let i=0;i<5;i++){const lamp=addSphere(visual,[(i-2)*.62,1.05,1.68],[.12,.08,.055],hot,{emissive:0xff6a18,emissiveIntensity:1.7,cast:false})}
  for(let i=0;i<5;i++){const spine=addCone(visual,[(i-2)*.3,3.75,-.61],.18,.72,i%2?brass:armor,{metalness:.46,roughness:.48});spine.rotation.x=-.16;spine.rotation.z=(i-2)*-.08}
  root.scale.setScalar(4.1);part.wheels=[];return part;
}

function createEnemy(kind,boss=false){
  const bossCode=boss?(state.map===10?'kardinal':state.map===20?'harvester':'diagnos'):null;
  const model=boss&&bossCode==='harvester'?createHarvesterMachine():createHumanoid(boss?'boss':kind,bossCode);if(boss&&bossCode!=='harvester')addBossDecor(model,bossCode);
  const maxHp=boss?(state.map===10?50000:state.map===20?70000:100000):(maps[state.map].hp*(kind==='brute'?1.75:kind==='bloater'?1.42:kind==='crawler'?.72:kind==='armored'?1.65:kind==='spitter'?1.12:kind==='runner'?.78:1));
  const speedFactor={brute:.7,crawler:1.24,bloater:.74,rifle:.78,runner:1.48,spitter:.86,armored:.72}[kind]||1;
  const radius=boss?(bossCode==='kardinal'?4.25:bossCode==='harvester'?4.8:1.9):kind==='brute'?.72:kind==='crawler'?.42:kind==='armored'?.65:.52;
  const maxShield=bossCode==='kardinal'?20000:bossCode==='harvester'?4000:0;
  const e={...model,boss,code:bossCode,kind,hp:maxHp,maxHp,shield:maxShield,maxShield,speed:boss?(bossCode==='kardinal'?1.9:2.4):maps[state.map].speed*speedFactor,radius,attackAt:0,shotAt:0,flash:0,dead:false,phase:Math.random()*8,hit:0};
  if(boss){e.bossElapsed=0;e.bossPhase=0;e.introDuration=bossCode==='harvester'?6.2:2.8;e.introRemaining=e.introDuration;e.bossBaseScale=model.root.scale.x;e.bossY=0;e.jump=null;e.nextJumpAt=Infinity;e.deathAnimation=null;e.phaseMaterials=null;e.lightningQueue=[];e.nextLightningAt=18;if(bossCode==='diagnos'){e.nextDiagnosSkill=9;e.diagnosSkill=0;e.diagnosWarnings=[];e.diagnosFinalForm=false;e.diagnosMeteorWaves=0;e.nextDiagnosMeteor=Infinity}if(bossCode==='harvester'){e.harvesterPhase=0;e.nextHarvesterPhase=30;e.nextHarvesterMissiles=12;e.nextHarvesterSlam=24;e.nextHarvesterShock=16;e.nextHarvesterCharge=20;e.harvesterCharges=[];e.firstBlastDone=false;e.nukeWarningStarted=false;e.nukeTarget=null}model.root.scale.setScalar(.012)}
  e.root.traverse(o=>{if(o.isMesh)o.castShadow=true});world.add(e.root);enemies.push(e);
  if(boss){state.bossHp=maxHp;state.bossMax=maxHp;if(bossCode==='kardinal'){notify('KARDİNAL UYANIYOR — ARENADAN ÇIK');tone(54,.8,'sawtooth',.11)}}
  return e;
}

function createPlayer(){
  player={x:0,z:0,y:heightAt(0,0),yaw:0,speed:8.2212,velocity:new THREE.Vector3(),radius:.48,model:null,invulnerable:2.1,jumpVelocity:0,grounded:true};
  playerModel=createHumanoid('player');playerRig=playerModel;player.model=playerModel;world.add(playerModel.root);playerModel.root.position.set(0,player.y,0);syncCameraMode();
  cameraYaw=0;cameraPitch=.14;
}
function setBossCorpsePose(e,saved=null){
  const pose=saved||state.bossCorpses[state.map]||{},x=Number.isFinite(pose.x)?pose.x:e.root.position.x,z=Number.isFinite(pose.z)?pose.z:e.root.position.z,roll=Number.isFinite(pose.roll)?pose.roll:(e.code==='harvester'?1.48:-1.48),pitch=Number.isFinite(pose.pitch)?pose.pitch:.12,yaw=Number.isFinite(pose.yaw)?pose.yaw:e.root.rotation.y;
  e.root.scale.setScalar(e.bossBaseScale);e.root.position.set(x,heightAt(x,z)+e.bossBaseScale*(e.code==='harvester'?2.55:.48),z);e.root.rotation.set(pitch,yaw,roll);e.deathAnimation=null;e.dead=true;e.deadPose=true;
}
function replacePlayerWeapon(){if(!playerModel)return;const old=playerModel.gun;if(old){old.parent?.remove(old);old.traverse(o=>{if(o.geometry&&!geometryCacheHas(o.geometry))o.geometry.dispose();if(o.material&&!Array.from(materialCache.values()).includes(o.material))o.material.dispose()})}playerModel.gun=buildWeaponModel(weapons[state.selectedWeapon].type,playerModel.gunHand);playerModel.gun.rotation.y=Math.PI;playerModel.gun.position.set(0,-.62,.09);playerModel.gun.scale.setScalar(1.12);setFirstPersonWeapon()}
function ensureFirstPersonViewModel(){
  if(fpViewModel)return;fpViewModel=new THREE.Group();fpViewModel.name='firstPersonViewModel';camera.add(fpViewModel);
  // Keep the sleeves and hands in front of the near plane, framing the gun from both sides.
  const rightSleeve=addBox(fpViewModel,[.46,-.48,-.36],[.36,.58,.62],0x263835,{roughness:.76,metalness:.16});rightSleeve.rotation.z=-.2;
  addBox(fpViewModel,[.32,-.32,-.55],[.3,.14,.3],0x526357,{roughness:.72,metalness:.22});addSphere(fpViewModel,[.25,-.4,-.69],[.17,.12,.15],0x80694f,{geometry:smallSphereGeo,roughness:.82});
  const leftSleeve=addBox(fpViewModel,[-.46,-.52,-.58],[.34,.58,.64],0x263835,{roughness:.76,metalness:.16});leftSleeve.rotation.z=.3;
  addBox(fpViewModel,[-.26,-.35,-.75],[.3,.14,.32],0x526357,{roughness:.72,metalness:.22});addSphere(fpViewModel,[-.1,-.27,-.91],[.17,.12,.15],0x80694f,{geometry:smallSphereGeo,roughness:.82});
  fpWeaponRoot=new THREE.Group();fpWeaponRoot.position.set(.22,-.22,-.68);fpViewModel.add(fpWeaponRoot);setFirstPersonWeapon();
  fpViewModel.traverse(o=>{o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false});
}
function setFirstPersonWeapon(){
  if(!fpWeaponRoot)return;while(fpWeaponRoot.children.length){const old=fpWeaponRoot.children[0];fpWeaponRoot.remove(old);old.traverse(o=>{if(o.geometry&&!geometryCacheHas(o.geometry))o.geometry.dispose()})}
  const type=weapons[state.selectedWeapon].type,gun=buildWeaponModel(type,fpWeaponRoot),scale={pistol:.88,uzi:.82,shotgun:.8,minigun:.69,rocket:.67,laser:.78}[type]||.8;gun.scale.setScalar(scale);gun.rotation.y=0;gun.position.set(0,0,0);gun.traverse(o=>{o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false});
}
function selectWeapon(index){if(!state.owned[index]||index===state.selectedWeapon)return;state.ammoByWeapon[state.selectedWeapon]=state.ammo;state.reserveByWeapon[state.selectedWeapon]=state.reserve;state.selectedWeapon=index;state.ammo=state.ammoByWeapon[index];state.reserve=state.reserveByWeapon[index];replacePlayerWeapon();updateHud();saveGame()}
function geometryCacheHas(g){for(const cached of geometryCache.values())if(cached===g)return true;return false}

function removePetModel(){if(!petModel)return;world.remove(petModel.root);if(petModel.nameLabel){petModel.nameLabel.texture.dispose();petModel.nameLabel.material.dispose()}petModel=null}
function petDisplayName(id){const custom=String(state.petNames[id]||'').normalize('NFC').trim();return custom||petStock.find(p=>p.id===id)?.name||'DOSTUM'}
function createPetNameLabel(root,id,customName=''){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');if(!ctx)return null;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const materialLabel=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}),sprite=new THREE.Sprite(materialLabel);sprite.position.set(0,1.55,.05);sprite.scale.set(1.55,.39,1);root.add(sprite);const label={canvas,ctx,texture,material:materialLabel,sprite,id,customName};drawPetNameLabel(label);return label}
function drawPetNameLabel(label){const {ctx,canvas,id}=label,name=label.customName||petDisplayName(id);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(7,13,17,.82)';ctx.fillRect(8,19,496,90);ctx.strokeStyle='rgba(134,245,229,.78)';ctx.lineWidth=4;ctx.strokeRect(8,19,496,90);ctx.fillStyle='#ecfffb';ctx.font=`700 ${Array.from(name).length>12?39:50}px Arial, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(name,256,66,468);label.texture.needsUpdate=true}
function createPetModel(id,customName=''){
  const root=new THREE.Group(),parts={root,legs:[],ears:[],tail:null,head:null,body:null};world.add(root);
  const palette=id==='cat'?{body:0xe8e0d2,dark:0x55483e,eye:0x6de6e0,inner:0xe99eae}:id==='dog'?{body:0xc59056,dark:0x382a20,eye:0x352820,inner:0x9b6244}:{body:0xf4f5ef,dark:0x73838e,eye:0x65bde8,inner:0xb9d8e5};
  parts.body=addBox(root,[0,.45,0],[.78,.65,.92],palette.body,{roughness:.9});
  const head=new THREE.Group();head.position.set(0,.76,.38);root.add(head);parts.head=head;addBox(head,[0,.02,.08],[.68,.62,.58],palette.body,{roughness:.9});
  for(const side of [-1,1]){
    const ear=new THREE.Group();ear.position.set(side*.22,.28,.06);head.add(ear);parts.ears.push(ear);
    if(id==='cat'){const outer=addCone(ear,[0,.11,0],.15,.42,palette.body,{radial:4}),inner=addCone(ear,[0,.1,.105],.075,.27,palette.inner,{radial:4,cast:false});outer.rotation.z=side*-.13;inner.rotation.z=side*-.13}
    else {addBox(ear,[0,.05,0],[.17,.36,.15],id==='dog'?palette.dark:palette.body);if(id==='fox')addBox(ear,[0,.05,.08],[.07,.22,.025],palette.inner,{cast:false})}
    addBox(head,[side*.16,.08,.375],[.075,.075,.035],palette.eye,{emissive:id==='fox'?0x166294:0x164e49,emissiveIntensity:.34,cast:false});
  }
  addBox(head,[0,-.08,.4],[.28,.17,.19],id==='cat'?palette.dark:id==='dog'?0x3b2920:0xd2a991,{roughness:.75});
  if(id==='cat')for(const side of [-1,1]){const whisker=addBox(head,[side*.24,-.08,.46],[.22,.018,.016],0xd7d0c4,{cast:false});whisker.rotation.y=side*-.16}
  else addBox(head,[0,-.1,.49],[.18,.12,.05],id==='fox'?0x252a2d:0x32231b,{cast:false});
  for(const x of [-.25,.25])for(const z of [-.27,.29]){const legRoot=new THREE.Group();legRoot.position.set(x,.25,z);root.add(legRoot);addBox(legRoot,[0,-.055,0],[.18,.18,.19],id==='dog'?palette.dark:palette.body);const lower=new THREE.Group();lower.position.y=-.13;legRoot.add(lower);addSphere(lower,[0,-.045,0],[.095,.09,.095],palette.body,{geometry:smallSphereGeo});addBox(lower,[0,-.08,.055],[.19,.07,.23],id==='dog'?palette.dark:palette.body);parts.legs.push({upper:legRoot,lower})}
  const tail=new THREE.Group();tail.position.set(0,.62,-.38);root.add(tail);parts.tail=tail;
  if(id==='fox'){const plume=addSphere(tail,[0,.02,-.25],[.29,.29,.67],palette.body);plume.rotation.x=-.5;addSphere(tail,[0,-.04,-.53],[.23,.23,.25],palette.dark)}
  else {const fur=addCylinder(tail,[0,0,-.25],.11,.16,.66,id==='cat'?palette.dark:palette.body,{radial:6});fur.rotation.x=-Math.PI/2;tail.rotation.x=id==='cat'?-.35:.1}
  parts.id=id;parts.customName=customName;parts.collisionRadius=.58;parts.phase=Math.random()*8;parts.soundLeft=1.3+Math.random()*1.2;parts.nameLabel=createPetNameLabel(root,id,customName);return parts;
}
function petFollowPoint(id){const side=id==='dog'?.55:id==='cat'?-.55:0,back=7.35;return{x:player.x-Math.sin(player.yaw)*back+Math.cos(player.yaw)*side,z:player.z+Math.cos(player.yaw)*back+Math.sin(player.yaw)*side}}
function createEquippedPet(){removePetModel();if(!player||!state.equippedPet||!state.ownedPets.includes(state.equippedPet))return;petModel=createPetModel(state.equippedPet);const slot=petFollowPoint(state.equippedPet);petModel.root.position.set(slot.x,onlineSurfaceAt(slot.x,slot.z,player.y)+.035,slot.z)}
function playPetSound(id){
  if(state.volume<=0)return;
  if(id==='cat'||id==='dog'){
    let sample=audio.petSamples[id];if(!sample){sample=new Audio(new URL(id==='cat'?'./assets/sounds/cat-meow.ogg':'./assets/sounds/dog-bark.ogg',document.baseURI).href);sample.preload='auto';sample.addEventListener('error',()=>notify(`${id==='cat'?'Kedi':'Köpek'} sesi yüklenemedi`),{once:true});audio.petSamples[id]=sample}
    const voice=sample.cloneNode();voice.currentTime=0;voice.volume=Math.min(1,state.volume*(id==='dog'?.855:.95));audio.petTrack=voice;audio.petTracks.add(voice);voice.addEventListener('ended',()=>audio.petTracks.delete(voice),{once:true});voice.play()?.catch(()=>audio.petTracks.delete(voice));return;
  }
  if(id!=='fox')return;makeAudioContext();const ctx=audio.ctx;if(!ctx)return;
  const sound=()=>{if(audio.ctx!==ctx||ctx.state!=='running'||state.volume<=0)return;playShotTone(1180,720,.16,.23,'sine');playShotTone(1480,920,.14,.2,'sine',.2);playShotTone(1080,740,.15,.18,'triangle',.38)};
  if(ctx.state==='suspended')ctx.resume().then(sound).catch(()=>{});else sound();
}
function updatePetName(value){if(!state.equippedPet)return;const normalized=String(value).normalize('NFC'),limited=Array.from(normalized).slice(0,16).join('');if(value!==limited)$('petNameInput').value=limited;state.petNames[state.equippedPet]=limited;if(petModel?.nameLabel)drawPetNameLabel(petModel.nameLabel);saveGame()}
function updatePet(dt,t){
  if(!petModel||!player)return;const id=petModel.id,root=petModel.root,slot=petFollowPoint(id),playerDistance=Math.hypot(root.position.x-player.x,root.position.z-player.z),follow=playerDistance>8.15,dx=slot.x-root.position.x,dz=slot.z-root.position.z,slotDistance=Math.hypot(dx,dz);let moved=0;
  if(follow&&slotDistance>.08){const speed=playerDistance>13?12.5:8.7,step=Math.min(slotDistance,dt*speed),nx=root.position.x+dx/slotDistance*step,nz=root.position.z+dz/slotDistance*step;if(!isBlocked(nx,nz,.34)){root.position.x=nx;root.position.z=nz;moved=step}else{const xOnly=root.position.x+dx/slotDistance*step,zOnly=root.position.z+dz/slotDistance*step;if(!isBlocked(xOnly,root.position.z,.34)){root.position.x=xOnly;moved=step}else if(!isBlocked(root.position.x,zOnly,.34)){root.position.z=zOnly;moved=step}}}
  const moving=moved>.005,floor=onlineSurfaceAt(root.position.x,root.position.z,player.y);root.position.y=THREE.MathUtils.damp(root.position.y,floor+.035+(moving?Math.abs(Math.sin(t*10+petModel.phase))*.1:0),10,dt);
  if(moving)root.rotation.y=lerpAngle(root.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*9));
  const gait=moving?Math.sin(t*11+petModel.phase):Math.sin(t*2+petModel.phase)*.08;petModel.legs.forEach((leg,i)=>{const stride=(i===0||i===3)?gait:-gait;leg.upper.rotation.x=moving?stride*.58:0;leg.lower.rotation.x=moving?Math.max(0,-stride)*.5:0});petModel.body.position.y=.45+(moving?Math.abs(Math.sin(t*22+petModel.phase))*.035:Math.sin(t*2+petModel.phase)*.012);petModel.body.rotation.z=moving?THREE.MathUtils.clamp(-player.velocity.x*.012,-.08,.08):0;petModel.head.rotation.z=Math.sin(t*2.3+petModel.phase)*.045+(moving?Math.sin(t*11+petModel.phase)*.035:0);petModel.head.rotation.x=moving?.025:Math.sin(t*2.1+petModel.phase)*.025;petModel.ears.forEach((ear,i)=>{ear.rotation.z=(i===0?.13:-.13)+Math.sin(t*3.5+petModel.phase+i)*.06});petModel.tail.rotation.z=Math.sin(t*7+petModel.phase)*.32;petModel.tail.rotation.x=(id==='cat'?.3:id==='fox'?.0:-.15)+Math.sin(t*5+petModel.phase)*.17;
  petModel.soundLeft-=dt;if(petModel.soundLeft<=0&&(state.mode==='play'||onlineMatchActive)){playPetSound(id);petModel.soundLeft=(id==='dog'?8:10)+Math.random()*6}
}
function clearOpponentPet(){if(!onlineOpponentPet)return;if(onlineOpponentPet.root.parent)onlineOpponentPet.root.parent.remove(onlineOpponentPet.root);if(onlineOpponentPet.nameLabel){onlineOpponentPet.nameLabel.texture.dispose();onlineOpponentPet.nameLabel.material.dispose()}onlineOpponentPet=null}
function updateOpponentNameTag(name){if(!onlineOpponentModel)return;const raw=String(name||'').normalize('NFC').trim().slice(0,32),hasDeveloper=raw.startsWith('[DEVELOPER]'),clean=(hasDeveloper?raw.slice(11):raw).slice(0,16);if(!clean){if(onlineOpponentTag){onlineOpponentModel.root.remove(onlineOpponentTag.sprite);onlineOpponentTag.texture.dispose();onlineOpponentTag.material.dispose();onlineOpponentTag=null}return}const tagKey=`${hasDeveloper?'dev:':''}${clean}`;if(onlineOpponentTag?.name===tagKey)return;if(onlineOpponentTag){onlineOpponentModel.root.remove(onlineOpponentTag.sprite);onlineOpponentTag.texture.dispose();onlineOpponentTag.material.dispose()}const canvas=document.createElement('canvas');canvas.width=768;canvas.height=128;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,768,128);ctx.fillStyle='rgba(5,10,14,.82)';ctx.beginPath();ctx.roundRect(14,18,740,92,24);ctx.fill();ctx.strokeStyle='rgba(134,245,229,.84)';ctx.lineWidth=5;ctx.stroke();ctx.textBaseline='middle';ctx.textAlign='left';const prefix=hasDeveloper?'[DEVELOPER]':'';ctx.font='900 29px Arial,sans-serif';const prefixWidth=ctx.measureText(prefix).width;ctx.font=`800 ${Array.from(clean).length>12?37:45}px Arial,sans-serif`;const nameWidth=ctx.measureText(clean).width,total=prefixWidth+(hasDeveloper?12:0)+nameWidth,start=(768-total)/2;if(hasDeveloper){ctx.fillStyle='#ff344d';ctx.font='900 29px Arial,sans-serif';ctx.fillText(prefix,start,65)}ctx.fillStyle='#effffb';ctx.font=`800 ${Array.from(clean).length>12?37:45}px Arial,sans-serif`;ctx.fillText(clean,start+prefixWidth+(hasDeveloper?12:0),65,768-start-prefixWidth-26);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const materialTag=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false,toneMapped:false}),sprite=new THREE.Sprite(materialTag);sprite.position.set(0,3.05,0);sprite.scale.set(3.35,.56,1);sprite.renderOrder=8;onlineOpponentModel.root.add(sprite);onlineOpponentTag={name:tagKey,canvas,ctx,texture,material:materialTag,sprite}}
function updateOpponentPet(dt,t){
  const pet=onlineOpponentPet,data=onlineOpponent;if(!pet||!data)return;const root=pet.root,slotX=Number.isFinite(Number(data.petX))?Number(data.petX):Number(data.x||0)-Math.sin(Number(data.yaw)||0)*7.2,slotZ=Number.isFinite(Number(data.petZ))?Number(data.petZ):Number(data.z||0)+Math.cos(Number(data.yaw)||0)*7.2,slotY=Number.isFinite(Number(data.petY))?Number(data.petY):onlineSurfaceAt(slotX,slotZ,Number(data.y)||heightAt(slotX,slotZ));const before=root.position.clone();root.position.x=THREE.MathUtils.damp(root.position.x,slotX,12,dt);root.position.z=THREE.MathUtils.damp(root.position.z,slotZ,12,dt);root.position.y=THREE.MathUtils.damp(root.position.y,slotY,12,dt);const dx=root.position.x-before.x,dz=root.position.z-before.z,moving=Math.hypot(dx,dz)>.008;if(moving)root.rotation.y=lerpAngle(root.rotation.y,Math.atan2(dx,dz),Math.min(1,dt*10));const gait=moving?Math.sin(t*11+pet.phase):Math.sin(t*2+pet.phase)*.08;pet.legs.forEach((leg,i)=>{const stride=(i===0||i===3)?gait:-gait;leg.upper.rotation.x=moving?stride*.58:0;leg.lower.rotation.x=moving?Math.max(0,-stride)*.5:0});pet.body.position.y=.45+(moving?Math.abs(Math.sin(t*22+pet.phase))*.035:Math.sin(t*2+pet.phase)*.012);pet.head.rotation.z=Math.sin(t*2.3+pet.phase)*.045+(moving?Math.sin(t*11+pet.phase)*.035:0);pet.ears.forEach((ear,i)=>{ear.rotation.z=(i===0?.13:-.13)+Math.sin(t*3.5+pet.phase+i)*.06});pet.tail.rotation.z=Math.sin(t*7+pet.phase)*.32;pet.tail.rotation.x=(pet.id==='cat'?.3:pet.id==='fox'?0:-.15)+Math.sin(t*5+pet.phase)*.17;pet.soundLeft-=dt;if(pet.soundLeft<=0&&state.volume>0){playPetSound(pet.id);pet.soundLeft=(pet.id==='dog'?9:11)+Math.random()*7}
}
function syncOpponentPet(data){const id=['cat','dog','fox'].includes(data?.pet)?data.pet:'';if(!id){clearOpponentPet();return}const entered=String(data.petName||'').normalize('NFC').trim().slice(0,16),name=entered||petStock.find(p=>p.id===id)?.name||'DOSTUM';if(onlineOpponentPet?.id!==id||onlineOpponentPet?.customName!==name){clearOpponentPet();onlineOpponentPet=createPetModel(id,name)}if(onlineOpponentPet)onlineOpponentPet.root.visible=(Number(data.hp)||0)>0}

function createVSFortress(castleOffset=0){
  const base=heightAt(castleOffset,0),stone=[0x685e50,0x756958,0x5d574e,0x827866],edge=0x403b36,metal=0x9a8054;
  const data={base,offset:castleOffset,floors:[0,4,8,12],ramps:[],landings:[],climbables:[]},batches=new Map();onlineFortressData=onlineFortressData||[];onlineFortressData.push(data);
  const piece=(x,y,z,w,h,d,color,opts={})=>{const appearance={roughness:opts.roughness??.94,metalness:opts.metalness??.04,emissive:opts.emissive??0,emissiveIntensity:opts.emissiveIntensity??0,cast:opts.cast??true,receive:opts.receive??true},key=[color,appearance.roughness,appearance.metalness,appearance.emissive,appearance.emissiveIntensity,appearance.cast,appearance.receive].join(':');if(!batches.has(key))batches.set(key,{color,appearance,items:[]});batches.get(key).items.push({x:x+castleOffset,y,z,w,h,d,rotation:opts.rotation||[0,0,0]})};
  const floorPart=(x1,x2,z1,z2,y,color)=>{const w=x2-x1,d=z2-z1;if(w<.05||d<.05)return;piece((x1+x2)/2,y-.14,(z1+z2)/2,w,.28,d,color,{roughness:.98})};
  const floorWithOpening=(level,opening,color)=>{const y=base+level,x1=-12,x2=12,z1=-12,z2=12;if(!opening){floorPart(x1,x2,z1,z2,y,color);return}const {ax,bx,az,bz}=opening;floorPart(x1,ax,z1,z2,y,color);floorPart(bx,x2,z1,z2,y,color);floorPart(ax,bx,z1,az,y,color);floorPart(ax,bx,bz,z2,y,color)};
  floorWithOpening(4,{ax:-8.7,bx:4.7,az:6.15,bz:9.85},stone[0]);
  floorWithOpening(8,{ax:6.15,bx:9.85,az:-4.7,bz:8.7},stone[1]);
  floorWithOpening(12,{ax:-8.7,bx:8.7,az:-9.85,bz:-6.15},stone[2]);
  const wall=(x,z,w,d,level,side)=>{const y=base+level+1.88,h=3.76,color=stone[(level/4+side)%stone.length];piece(x,y,z,w,h,d,color);obstacles.push({x:x+castleOffset,z,hw:w*.52,hd:d*.52,yMin:base+level-.12,yMax:base+level+h,staticCollider:true});piece(x,y+h*.48,z,w*.94,.12,d*1.08,edge,{metalness:.18})};
  for(const level of [0,4,8,12]){
    const gap=3.8,sideLen=(24-gap)/2;
    wall(-12+sideLen/2,-12,sideLen,.72,level,0);wall(12-sideLen/2,-12,sideLen,.72,level,1);
    wall(-12+sideLen/2,12,sideLen,.72,level,2);wall(12-sideLen/2,12,sideLen,.72,level,3);
    wall(-12, -12+sideLen/2,.72,sideLen,level,1);wall(-12,12-sideLen/2,.72,sideLen,level,2);
    wall(12,-12+sideLen/2,.72,sideLen,level,3);wall(12,12-sideLen/2,.72,sideLen,level,0);
  }
  // Tall corner turrets and repeating stone bands establish the four-storey silhouette.
  for(const [x,z,index] of [[-11.5,-11.5,0],[11.5,-11.5,1],[-11.5,11.5,2],[11.5,11.5,3]]){
    piece(x,base+7.8,z,3.8,15.6,3.8,stone[index],{roughness:.92});piece(x,base+.48,z,4.4,.72,4.4,edge);
    for(const level of [3.8,7.8,11.8,15.6])piece(x,base+level,z,4.05,.2,4.05,stone[(index+1)%4],{roughness:.88});
    for(let k=0;k<4;k++){const a=k*Math.PI/2;piece(x+Math.cos(a)*2.02,base+16.1,z+Math.sin(a)*2.02,.58,.72,.58,edge,{rotation:[0,a,0]})}
  }
  // Doors and arrow slits break up the stone walls; warm sconces light each landing.
  for(const level of [0,4,8,12]){
    const y=base+level+2.05;
    for(const [doorIndex,[x,z,rot]] of [[0,[0,-11.45,0]],[1,[0,11.45,0]],[2,[-11.45,0,Math.PI/2]],[3,[11.45,0,Math.PI/2]]]){
      if(rot===0){piece(x-1.68,base+level+1.3,z,.2,2.6,.3,edge);piece(x+1.68,base+level+1.3,z,.2,2.6,.3,edge);piece(x,base+level+2.72,z,3.55,.26,.34,metal,{metalness:.35})}
      else{piece(x,base+level+1.3,z-1.68,.3,2.6,.2,edge);piece(x,base+level+1.3,z+1.68,.3,2.6,.2,edge);piece(x,base+level+2.72,z,.34,.26,3.55,metal,{metalness:.35})}
      if((level===0||level===8)&&doorIndex%2===0){const lamp=new THREE.PointLight(0xf5a65b,.4,6,2);lamp.position.set(x,base+level+2.7,z);sceneLights.add(lamp)}
    }
    for(const [x,z] of [[-11.45,-7],[11.45,-7],[-11.45,7],[11.45,7]])piece(x,base+level+2.35,z,.12,.82,.14,0x272521,{emissive:0x734321,emissiveIntensity:.12});
  }
  const addFlight=(a,b,yA,yB,width=3.2)=>{
    const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),count=Math.max(10,Math.ceil(length/.88)),ramp={a:{x:a.x+castleOffset,z:a.z},b:{x:b.x+castleOffset,z:b.z},yA:base+yA,yB:base+yB,width,length,dx,dz};data.ramps.push(ramp);
    for(let i=0;i<count;i++){const t=(i+.5)/count,x=a.x+dx*t,z=a.z+dz*t,y=base+THREE.MathUtils.lerp(yA,yB,t);piece(x,y-.1,z,length/count*.96,.2,width,stone[i%stone.length],{rotation:[0,Math.atan2(-dz,dx),0]});
      if(i%4===0)for(const side of [-1,1])piece(x+(-dz/length)*side*(width*.52),y+.55,z+(dx/length)*side*(width*.52),.12,1.05,.12,edge,{metalness:.12});
    }
  };
  addFlight({x:-8,z:-8},{x:8,z:-8},12,8,3.25);
  addFlight({x:8,z:-4},{x:8,z:8},8,4,3.25);
  addFlight({x:4,z:8},{x:-8,z:8},4,0,3.25);
  data.landings.push({x:8+castleOffset,z:-6,y:base+8,hw:1.25,hd:2.05},{x:6+castleOffset,z:8,y:base+4,hw:2.2,hd:1.25},{x:-8+castleOffset,z:8,y:base,hw:2.0,hd:1.7});
  for(const [x,z,color] of [[8,-6,0x9a8054],[6,8,0x8b7e68],[-8,8,0x80674d]])piece(x,base+(z===-6?8:z===8&&x===6?4:0)-.08,z,3.2,.16,3.2,color,{metalness:.12});
  // Low supply crates can be climbed and used as extra cover.
  const crate=(x,z,color)=>{const h=.82,cx=x+castleOffset,y=heightAt(cx,z);piece(x,y+h/2,z,1.65,h,1.65,color,{roughness:.91});for(const side of [-1,1]){piece(x+side*.67,y+h/2,z, .07,h*.86,1.68,metal,{metalness:.42});piece(x,y+h/2,z+side*.67,1.68,h*.86,.07,metal,{metalness:.42})}data.climbables.push({x:cx,z,hw:.88,hd:.88,base:y,top:y+h});obstacles.push({x:cx,z,hw:.84,hd:.84,yMin:y-.05,yMax:y+h,staticCollider:true})};
  crate(-16,-18,0x70543a);crate(16,18,0x53644c);crate(-18,19,0x765741);crate(18,-18,0x515e56);
  // Banners and battlements add landmarks without making the arena harder to read.
  for(const [x,z,color] of [[0,-11.35,0x9d3845],[0,11.35,0xd29b4e],[-11.35,0,0x426f76],[11.35,0,0x80604e]]){
    piece(x,base+10.5,z,.12,2.8,.16,metal,{metalness:.45});piece(x,base+10.2,z,.12,1.8,1.2,color,{emissive:color,emissiveIntensity:.08,rotation:[0,x?Math.PI/2:0,0]});
  }
  for(let x=-10;x<=10;x+=2){piece(x,base+16.15,-12,.48,.48,.68,edge);piece(x,base+16.15,12,.48,.48,.68,edge)}
  const temp=new THREE.Object3D();for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(boxGeo,material(batch.color,batch.appearance.roughness,batch.appearance.metalness,batch.appearance.emissive,batch.appearance.emissiveIntensity),batch.items.length);for(let i=0;i<batch.items.length;i++){const item=batch.items[i];temp.position.set(item.x,item.y,item.z);temp.rotation.set(item.rotation[0],item.rotation[1],item.rotation[2]);temp.scale.set(item.w,item.h,item.d);temp.updateMatrix();mesh.setMatrixAt(i,temp.matrix)}mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=batch.appearance.cast;mesh.receiveShadow=batch.appearance.receive;mesh.userData.collisionIgnore=true;mesh.computeBoundingSphere?.();world.add(mesh)}
}
function onlineSurfaceAt(x,z,currentY=player?.y??0){
  if(!onlineMatchActive||!onlineFortressData)return heightAt(x,z);for(const f of (Array.isArray(onlineFortressData)?onlineFortressData:[onlineFortressData])){
  for(const r of f.ramps){const px=x-r.a.x,pz=z-r.a.z,t=(px*r.dx+pz*r.dz)/(r.length*r.length),clamped=THREE.MathUtils.clamp(t,0,1),cx=r.a.x+r.dx*clamped,cz=r.a.z+r.dz*clamped,side=Math.abs((x-cx)*(-r.dz/r.length)+(z-cz)*(r.dx/r.length));if(t>=-.04&&t<=1.04&&side<=r.width*.5&&Math.abs(currentY-THREE.MathUtils.lerp(r.yA,r.yB,clamped))<1.65)return THREE.MathUtils.lerp(r.yA,r.yB,clamped)}
  for(const l of f.landings)if(Math.abs(x-l.x)<=l.hw&&Math.abs(z-l.z)<=l.hd&&Math.abs(currentY-l.y)<1.65)return l.y;
  for(const c of f.climbables)if(Math.abs(x-c.x)<=c.hw&&Math.abs(z-c.z)<=c.hd&&currentY>=c.top-.56&&currentY<=c.top+1.5)return c.top;
  const inside=Math.abs(x-f.offset)<=12&&Math.abs(z)<=12;if(!inside)continue;let floor=f.base;
  const openings={4:{ax:-8.7,bx:4.7,az:6.15,bz:9.85},8:{ax:6.15,bx:9.85,az:-4.7,bz:8.7},12:{ax:-8.7,bx:8.7,az:-9.85,bz:-6.15}};
  for(const level of [4,8,12]){const o=openings[level],lx=x-f.offset,inHole=lx>=o.ax&&lx<=o.bx&&z>=o.az&&z<=o.bz;if(currentY>=f.base+level-.35&&!inHole)floor=f.base+level}
  return floor}return heightAt(x,z);
}
function createVSCover(){
  const colors=[0x42514d,0x555b53,0x38454a,0x62543d],metal=0x9a8157;
  const boxDetail=(x,y,z,w,h,d,color,opts={})=>{const m=addBox(world,[x,y,z],[w,h,d],color,{roughness:opts.roughness??.82,metalness:opts.metalness??.12,emissive:opts.emissive??0,emissiveIntensity:opts.emissiveIntensity??0,cast:opts.cast??true});if(opts.collisionIgnore)m.userData.collisionIgnore=true;return m};
  const container=(x,z,w,d,color)=>{const y=heightAt(x,z),h=4.1;boxDetail(x,y+h/2,z,w,h,d,color,{metalness:.38,roughness:.68});
    for(let n=1;n<Math.floor(w/1.55);n++){const px=x-w/2+n*1.55;boxDetail(px,y+h/2,z,d*.5,h*.9,.12,0x83908a,{metalness:.58,roughness:.55,collisionIgnore:true,cast:false})}
    for(const side of [-1,1])boxDetail(x,y+h*.5,z+side*(d/2+.075),w*.96,.12,.12,metal,{metalness:.65,collisionIgnore:true,cast:false});
    boxDetail(x,y+.24,z-d*.52,w*.18,.38,.05,0x202d2b,{metalness:.18,collisionIgnore:true,cast:false});
  };
  const barricade=(x,z,w,h=2.35,d=1.6,color=0x515954)=>{const y=heightAt(x,z);boxDetail(x,y+h/2,z,w,h,d,color,{roughness:.94});boxDetail(x,y+h*.82,z,w*.93,.16,d*1.08,0x969587,{roughness:.9,collisionIgnore:true,cast:false});
    for(let px=x-w*.38;px<x+w*.4;px+=2.4)boxDetail(px,y+h*.22,z+d*.51,.26,.34,.08,px%2?0xe0b965:metal,{metalness:.36,collisionIgnore:true,cast:false});
    if(w>8)for(let px=x-w*.45;px<x+w*.46;px+=1.8){const bag=addSphere(world,[px,y+h*.93,z+d*.1],[.82,.42,.72],0x817b66,{geometry:smallSphereGeo,roughness:.98,cast:false});bag.userData.collisionIgnore=true;}
  };
  const crate=(x,z,size,color)=>{const y=heightAt(x,z),s=size;boxDetail(x,y+s*.5,z,s,s,s,color,{roughness:.89});for(const side of [-1,1]){boxDetail(x+side*s*.28,y+s*.5,z+s*.51,.09,s*.8,.07,metal,{metalness:.61,collisionIgnore:true,cast:false});boxDetail(x,y+side*s*.28,z+s*.51,s*.82,.09,.07,metal,{metalness:.61,collisionIgnore:true,cast:false})}};
  // Four weathered cargo containers create large flank cover without sealing either spawn lane.
  container(-105,-82,16,5,colors[0]);container(105,82,16,5,colors[1]);container(-105,82,13,4.5,colors[2]);container(105,-82,13,4.5,colors[3]);
  // Staggered chest-high barriers and sandbags keep the center playable while offering several routes.
  barricade(-75,-47,13,2.5,1.7,0x56605c);barricade(75,47,13,2.5,1.7,0x56605c);
  barricade(-66,46,16,2.45,1.7,0x665e4c);barricade(66,-46,16,2.45,1.7,0x665e4c);
  barricade(-28,-78,18,2.5,1.8,0x4c5c58);barricade(28,78,18,2.5,1.8,0x4c5c58);
  barricade(-32,73,12,2.25,1.6,0x625d4d);barricade(32,-73,12,2.25,1.6,0x625d4d);
  barricade(-78,0,11,2.45,1.6,0x485756);barricade(78,0,11,2.45,1.6,0x485756);
  barricade(-28,0,12,2.2,1.6,0x6a5947);barricade(28,0,12,2.2,1.6,0x6a5947);
  barricade(0,-33,12,2.2,1.6,0x515c59);barricade(0,33,12,2.2,1.6,0x515c59);
  crate(-51,-18,3.3,0x6a5139);crate(-46,-18,2.2,0x785c3f);crate(51,18,3.3,0x53624e);crate(46,18,2.2,0x667251);
  crate(-89,32,2.6,0x7b603d);crate(89,-32,2.6,0x526456);crate(-14,54,2.8,0x495955);crate(14,-54,2.8,0x6a5045);
  // A few upright steel signs make the arena easier to read at a glance.
  for(const [x,z,turn] of [[-125,0,0],[125,0,0],[0,-122,Math.PI/2],[0,122,Math.PI/2]]){const y=heightAt(x,z);const post=addCylinder(world,[x,y+2.3,z],.14,.18,4.6,0x333d3e,{metalness:.55,roughness:.7,radial:8,cast:false});post.userData.collisionIgnore=true;const sign=boxDetail(x,y+4.2,z,4.4,.68,.16,turn%Math.PI?0x253a3a:0x472b2c,{metalness:.3,emissive:turn%Math.PI?0x165246:0x48191e,emissiveIntensity:.28,collisionIgnore:true,cast:false});sign.rotation.y=turn}
}

function createWorld(index){
  disposeWorld();onlineFortressData=null;onlineOpponentTag=null;onlineOpponentPet=null;sceneSeed=1009+index*1877;const rng=newRng(sceneSeed),map=maps[index],mood=atmospheres[map.theme]||atmospheres.grass;
  if(skyTexture){skyTexture.dispose();skyTexture=null}harvesterSkyDark=false;
  scene.background=new THREE.Color(mood.sky);scene.fog=new THREE.Fog(mood.sky,58,142);
  const profile=qualityProfileForMap(index),shadowsEnabled=state.quality!=='low'&&!bossMapIndexes.has(index);renderer.shadowMap.enabled=shadowsEnabled&&state.shadows;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,profile.pixelRatio));sceneLights.clear();const hemi=new THREE.HemisphereLight(mood.sky,0x484237,mood.hemi);sceneLights.add(hemi);const sun=new THREE.DirectionalLight(mood.sunColor,mood.sun);sun.position.set(-18,28,12);sun.castShadow=shadowsEnabled&&state.shadows;sun.shadow.mapSize.set(profile.shadowMap,profile.shadowMap);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;sun.shadow.bias=-.00018;sceneLights.add(sun);
  const fill=new THREE.PointLight(map.accent,1.25,68,2);fill.position.set(0,13,-18);sceneLights.add(fill);
  createSky(map,rng);createGround(map,rng,profile);
  if(onlineMatchActive){createVSFortress(-120);createVSFortress(120);createVSCover();}else{addWorldProps(map,rng,profile);createEdgeMist(map,rng);createPortal()}
  buildStaticColliders();shotOccluders=world.children.filter(o=>!o.userData.aimIgnore);createPlayer();createEquippedPet();gateSelectorOpen=false;
  if(onlineMatchActive){enemies=[];pickups=[];projectiles=[];effects=[]}
  else if(bossMapIndexes.has(index)){
    const boss=createEnemy('boss',true),corpse=state.bossCorpses[index],bx=corpse?.x??0,bz=corpse?.z??-23;boss.root.position.set(bx,heightAt(bx,bz),bz);if(state.bossDefeated[index]){boss.dead=true;setBossCorpsePose(boss,corpse);if(index===29)spawnDiagnosRewardChest({x:bx+7,z:bz+4})}
  }else {const initial=Math.min(enemyCap(),3,2*(1+Math.floor(index/9)));for(let i=0;i<initial;i++)spawnEnemy(true)}
  if(portal)portal.open=false;
  updateHud();refreshMapGrid();
}
function spawnEnemy(force=false){
  if(bossMapIndexes.has(state.map)||!player)return;
  if(!force&&enemies.filter(e=>!e.dead).length>=enemyCap())return;
  const wanted=force?42+Math.random()*10:50+Math.random()*14,minimum=force?36:43,rearBearing=cameraYaw+Math.PI/2;let x=player.x,z=player.z,bestDistance=-1;
  for(let tries=0;tries<28;tries++){
    const angle=rearBearing+(Math.random()-.5)*Math.PI*1.5,distance=wanted*(.88+Math.random()*.12),candidateX=THREE.MathUtils.clamp(player.x+Math.cos(angle)*distance,-154,154),candidateZ=THREE.MathUtils.clamp(player.z+Math.sin(angle)*distance,-154,154),actualDistance=Math.hypot(candidateX-player.x,candidateZ-player.z);
    if(!isBlocked(candidateX,candidateZ,.6)&&actualDistance>bestDistance){x=candidateX;z=candidateZ;bestDistance=actualDistance}
    if(actualDistance>=minimum&&!isBlocked(candidateX,candidateZ,.6)){x=candidateX;z=candidateZ;break}
  }
    const pool=[['walker',30],['brute',12],['crawler',10],['bloater',9],['rifle',state.map>=3?8:3],['hazmat',7],['stalker',7]];
  if(state.map>=2)pool.push(['runner',9]);
  if(state.map>=5)pool.push(['spitter',8]);
  if(state.map>=8)pool.push(['armored',8]);
  const total=pool.reduce((sum,item)=>sum+item[1],0);let roll=Math.random()*total,kind='walker';
  for(const [candidate,weight] of pool){roll-=weight;if(roll<=0){kind=candidate;break}}
  const e=createEnemy(kind);e.root.position.set(x,heightAt(x,z),z);
}
function enemyCap(){const base=Math.min(maps[state.map].maxAlive*2,(3+Math.floor(state.map/4))*2),reduced=Math.max(3,Math.floor(base*.7));return Math.max(1,reduced-(state.map>=20?6:0))}
function buildStaticColliders(){
  world.updateMatrixWorld(true);const min=new THREE.Vector3(),max=new THREE.Vector3(),box=new THREE.Box3();
  for(const object of world.children){if(object===groundMesh||object.userData.aimIgnore||object.userData.collisionIgnore||object===portal?.group)continue;box.setFromObject(object);if(box.isEmpty())continue;box.getSize(max);box.getCenter(min);const w=max.x,d=max.z,h=max.y;if(w<.72||d<.72||w>22||d>22||h<.65||h>48)continue;
    const duplicate=obstacles.some(o=>o.hw!==undefined&&Math.abs(o.x-min.x)<Math.min(o.hw,w*.5)&&Math.abs(o.z-min.z)<Math.min(o.hd,d*.5));if(duplicate)continue;
    obstacles.push({x:min.x,z:min.z,hw:w*.52,hd:d*.52,yMin:box.min.y,yMax:box.max.y,staticCollider:true});
  }
}
function isBlocked(x,z,r){if(portal&&!portal.open&&Math.abs(x-portal.x)<1.86+r&&Math.abs(z-portal.z)<.8+r)return true;const floor=onlineMatchActive&&player?player.y:heightAt(x,z);for(const o of obstacles){if(o.yMin!==undefined&&(floor>o.yMax||floor+1.8<o.yMin))continue;if(o.hw!==undefined){if(Math.abs(x-o.x)<o.hw+r&&Math.abs(z-o.z)<o.hd+r)return true}else if(Math.hypot(x-o.x,z-o.z)<(o.r||.6)+r)return true}return false}
function isPetBlocked(x,z,r){return !!petModel&&Math.hypot(x-petModel.root.position.x,z-petModel.root.position.z)<r+(petModel.collisionRadius||.58)}
function isEnemyBlocked(x,z,r,fromX=x,fromZ=z){for(const e of enemies){if(e.dead)continue;const ex=e.root.position.x,ez=e.root.position.z,minDistance=r+e.radius,next=Math.hypot(x-ex,z-ez),current=Math.hypot(fromX-ex,fromZ-ez);if(next<minDistance&&next<current)return true}return false}
function separateEnemyFromActor(e,actorX,actorZ,actorRadius,fromX,fromZ){const pos=e.root.position;let dx=pos.x-actorX,dz=pos.z-actorZ,distance=Math.hypot(dx,dz),minDistance=e.radius+actorRadius;if(distance>=minDistance)return; if(distance<.0001){dx=fromX-actorX;dz=fromZ-actorZ;distance=Math.hypot(dx,dz)}if(distance<.0001){const angle=(e.phase||0)*2.399;dx=Math.cos(angle);dz=Math.sin(angle);distance=1}const nx=dx/distance,nz=dz/distance,nextX=actorX+nx*minDistance,nextZ=actorZ+nz*minDistance;if(!isBlocked(nextX,nextZ,e.radius)){pos.x=nextX;pos.z=nextZ}else{pos.x=fromX;pos.z=fromZ}}
function resolveEnemyCollision(e,fromX,fromZ){if(player)separateEnemyFromActor(e,player.x,player.z,player.radius,fromX,fromZ);for(const other of enemies){if(other===e||other.dead||other.boss)continue;separateEnemyFromActor(e,other.root.position.x,other.root.position.z,other.radius,fromX,fromZ)}}
function spawnPickup(x,z,type='cash',amount=20){const g=new THREE.Group();g.position.set(x,heightAt(x,z)+.55,z);world.add(g);let c=type==='cash'?0xf2bd55:type==='medkit'?0xff626a:0x63f1db;addMesh(g,type==='cash'?dodecaGeo:boxGeo,material(c,.35,.12,c,.25),[0,0,0],type==='cash'?[.25,.25,.25]:[.38,.42,.28],true);if(type==='medkit')addBox(g,[0,.01,.15],[.08,.34,.04],0xffffff,{cast:false});pickups.push({group:g,x,z,type,amount,phase:Math.random()*6})}
function spawnDiagnosRewardChest(position){
  const x=THREE.MathUtils.clamp(position.x,-150,150),z=THREE.MathUtils.clamp(position.z,-150,150),g=new THREE.Group();g.name='diagnosRewardChest';g.userData.aimIgnore=true;g.position.set(x,heightAt(x,z),z);g.rotation.y=-.18;world.add(g);
  addBox(g,[0,.63,0],[2.7,1.24,1.7],0x32191c,{roughness:.78,metalness:.16});addBox(g,[0,.67,.87],[2.3,.76,.075],0x512326,{roughness:.72,metalness:.18});
  for(const side of [-1,1]){addBox(g,[side*1.28,.68,0],[.13,1.22,1.78],0xc28a3b,{roughness:.4,metalness:.66});addBox(g,[side*.88,.68,.9],[.11,.8,.08],0xe0aa4b,{roughness:.38,metalness:.62})}
  addBox(g,[0,.13,0],[2.78,.16,1.78],0x9c6737,{roughness:.6,metalness:.48});addBox(g,[0,.7,.98],[.42,.4,.12],0xe5b34e,{roughness:.32,metalness:.68,emissive:0xff9a27,emissiveIntensity:.35});
  const lid=new THREE.Group();lid.position.set(0,1.14,-.7);g.add(lid);addBox(lid,[0,.12,.72],[2.76,.48,1.68],0x542426,{roughness:.7,metalness:.2});addBox(lid,[0,.12,.72],[2.82,.13,1.72],0xb77a35,{roughness:.45,metalness:.62});addBox(lid,[0,.12,.72],[.14,.5,1.75],0xe1aa4b,{roughness:.38,metalness:.68});lid.rotation.x=-.82;
  addSphere(g,[0,1.22,.04],[.3,.42,.3],0xffb633,{geometry:smallSphereGeo,emissive:0xff7815,emissiveIntensity:1.45,cast:false});const glow=new THREE.PointLight(0xffa12d,2.8,15,2);glow.position.set(0,1.7,.15);g.add(glow);
  const card=document.createElement('canvas');card.width=1024;card.height=256;const ctx=card.getContext('2d');ctx.fillStyle='rgba(18,10,11,.94)';ctx.fillRect(8,8,1008,240);ctx.strokeStyle='#e2a64c';ctx.lineWidth=8;ctx.strokeRect(12,12,1000,232);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff0d4';ctx.font='bold 55px Arial,sans-serif';ctx.fillText('Bana instagram dan ulaş.',512,91,950);ctx.font='bold 48px Arial,sans-serif';ctx.fillText('oynadığın için teşekkürler!',512,174,950);const tex=new THREE.CanvasTexture(card);tex.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));label.position.set(0,3.15,.48);label.scale.set(6.1,1.53,1);label.userData.aimIgnore=true;g.add(label);
  obstacles.push({x,z,hw:1.55,hd:1.02});spawnBossRing({x,z},0xffaa37,6.4,1.6);notify('DIAGNOS SANDIĞI AÇILDI');return g;
}
function showDiagnosReward(){if(state.mode!=='play')return;state.mode='reward';pauseAudio();if(document.pointerLockElement===canvas)document.exitPointerLock?.();$('diagnosRewardPanel').classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');syncControlVisibility()}
function closeDiagnosReward(){if(state.mode!=='reward')return;$('diagnosRewardPanel').classList.add('hidden');state.mode='play';resumeAudio();$('topHud').classList.remove('hidden');$('combatHud').classList.remove('hidden');$('desktopHelp').classList.remove('hidden');syncControlVisibility();updateHud()}

function buildPortalVisual(dt){if(!portal)return;const lockedBossArena=bossMapIndexes.has(state.map)&&!state.bossDefeated[state.map];if(lockedBossArena){portal.open=false;portal.progress=0;portal.group.visible=false;return}const distance=player?Math.hypot(player.x-portal.x,player.z-portal.z):Infinity;portal.open=distance<19;portal.group.visible=true;portal.progress=THREE.MathUtils.damp(portal.progress,portal.open?1:0,3.5,dt);portal.leftLeaf.rotation.y=-portal.progress*1.25;portal.rightLeaf.rotation.y=portal.progress*1.25;portal.ring.material.emissiveIntensity=.22+portal.progress*.65;portal.light.intensity=.2+portal.progress*1.6+Math.sin(performance.now()*.003)*.08;}
function mapUnlockCost(index){return index<=0?0:50+(index-1)*80}
function bossGateForMap(index){return [...bossMapIndexes].some(bossIndex=>index>bossIndex&&!state.bossDefeated[bossIndex])}
function openGateRegionSelector(){if(onlineMatchActive||gateSelectorOpen||!portal||state.mode!=='play')return;if(bossMapIndexes.has(state.map)&&!state.bossDefeated[state.map])return;gateSelectorOpen=true;mapReturnMode='play';state.mode='pause';$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');$('pauseMenu').classList.add('hidden');$('mapPanel').classList.remove('hidden');renderMapGrid();notify(`GEÇİT AÇILDI — SONRAKİ BÖLGE ${mapUnlockCost(state.map+1)} ◈`)}
function openMapQuick(){if(onlineMatchActive)return;if(state.mode!=='play')return;if(bossMapIndexes.has(state.map)&&!state.bossDefeated[state.map]){notify('BÖLÜMDEN ÇIKMAK İÇİN BOSSU YEN VEYA YENİLGİYİ BEKLE');return}gateSelectorOpen=false;mapReturnMode='play';state.mode='pause';pauseAudio();$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');$('pauseMenu').classList.add('hidden');$('mapPanel').classList.remove('hidden');renderMapGrid()}

function beginLevelNow(index){
  index=THREE.MathUtils.clamp(index,0,29);
  if(!onlineMatchActive&&bossGateForMap(index)){notify('SONRAKİ BÖLGELER İÇİN ÖNCE BOSSU YEN');return}
  if(!onlineMatchActive&&index>state.maxMap){if(index!==state.maxMap+1){notify('ÖNCEKİ BÖLÜMLERİ TAMAMLA');return}const price=mapUnlockCost(index);if(state.money<price){notify(`YETERSİZ PARA — ${price} ◈ GEREKİYOR`);return}state.money-=price;state.maxMap=index;saveGame()}
  state.map=index;state.maxHp=100;state.hp=Math.min(state.maxHp,state.hp+22);state.armorMax=state.armorMax||0;
  if(state.armorMax>0)state.armor=state.armorMax;state.mode='play';aimHeld=false;aimBlend=0;syncAimButton();document.documentElement.classList.remove('aiming');camera.fov=62;camera.updateProjectionMatrix();gateSelectorOpen=false;$('mainMenu').classList.add('hidden');$('pauseMenu').classList.add('hidden');$('shopPanel').classList.add('hidden');$('mapPanel').classList.add('hidden');$('settingsPanel').classList.add('hidden');$('introOverlay').classList.add('hidden');$('topHud').classList.remove('hidden');$('combatHud').classList.remove('hidden');$('desktopHelp').classList.remove('hidden');
  syncControlVisibility();
  createWorld(state.map);spawnClock=state.map>=20?2:2.2;cameraYaw=player.yaw;setMusicForMap();saveGame();updateHud();
  if(document.pointerLockElement===canvas)document.exitPointerLock?.();
}
function beginLevel(index){if(state.equippedPet&&state.ownedPets.includes(state.equippedPet))playPetSound(state.equippedPet);showTransition(()=>beginLevelNow(index))}
function showTransition(done,hold=240,fade=240){stopMusic();const overlay=$('transitionOverlay'),multiplayer=hold>500;if(multiplayer)overlay.style.setProperty('--transition-duration','760ms');else overlay.style.removeProperty('--transition-duration');overlay.classList.toggle('multiplayer-transition',multiplayer);overlay.classList.remove('hidden','transitionOut');requestAnimationFrame(()=>overlay.classList.add('transitionIn'));setTimeout(()=>{done();overlay.classList.remove('transitionIn');overlay.classList.add('transitionOut');setTimeout(()=>{overlay.classList.add('hidden');overlay.classList.remove('transitionOut','multiplayer-transition');overlay.style.removeProperty('--transition-duration')},fade)},hold)}
function beginIntro(){if(introFinished)return;const v=$('introVideo');$('introOverlay').classList.remove('hidden');$('mainMenu').classList.add('hidden');clearTimeout(introWatchdog);introWatchdog=setTimeout(finishIntro,45000);try{v.currentTime=0;v.muted=false;v.play().catch(()=>{v.muted=true;v.play().catch(finishIntro)})}catch(_e){finishIntro()}}
function finishIntro(){if(introFinished)return;introFinished=true;clearTimeout(introWatchdog);const v=$('introVideo'),bar=$('introProgressBar'),track=$('introProgress');try{v.pause()}catch(_e){}track.classList.remove('hidden');bar.style.width='0%';const started=performance.now(),duration=7000;let revealed=false,forceReveal=0;const reveal=()=>{if(revealed)return;revealed=true;clearTimeout(forceReveal);$('introOverlay').classList.add('hidden');track.classList.add('hidden');state.mode='menu';$('mainMenu').classList.remove('hidden');try{setMusicForMap()}catch(_e){}};function tick(now){if(revealed)return;const p=Math.min(1,(now-started)/duration);bar.style.width=`${p*100}%`;if(p<1)requestAnimationFrame(tick);else reveal()}forceReveal=setTimeout(reveal,7600);requestAnimationFrame(tick)}
function isTouch(){const localPreview=new URLSearchParams(window.location.search).has('mobilePreview')||['localhost','127.0.0.1'].includes(window.location.hostname);return localPreview||window.matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0||window.innerWidth<=720}
function syncControlVisibility(){const touch=isTouch(),playing=state.mode==='play';document.documentElement.classList.toggle('touch-layout',touch);$('mobileControls').classList.toggle('hidden',!touch||!playing);$('desktopHelp').classList.add('hidden')}
function setAimFromPointer(clientX,clientY){const rect=canvas.getBoundingClientRect();aimNdc.set(THREE.MathUtils.clamp(((clientX-rect.left)/rect.width)*2-1,-.98,.98),THREE.MathUtils.clamp(-((clientY-rect.top)/rect.height)*2+1,-.98,.98));aimScreen={x:clientX,y:clientY}}
function resetAimToCenter(){aimNdc.set(0,0);aimScreen={x:window.innerWidth/2,y:window.innerHeight/2}}
function saveGame(){if(onlineMatchActive)return;state.ammoByWeapon[state.selectedWeapon]=state.ammo;state.reserveByWeapon[state.selectedWeapon]=state.reserve;try{localStorage.setItem(STORE_KEY,JSON.stringify({money:state.money,maxMap:state.maxMap,map:state.map,hp:Math.min(100,state.hp),armor:state.armor,armorMax:state.armorMax,grenades:state.grenades,kits:state.kits,selectedWeapon:state.selectedWeapon,ammoByWeapon:state.ammoByWeapon,reserveByWeapon:state.reserveByWeapon,owned:state.owned,ownedArmor:state.ownedArmor,equippedArmor:state.equippedArmor,ownedPets:state.ownedPets,equippedPet:state.equippedPet,petNames:state.petNames,bossCorpses:state.bossCorpses,bossDefeated:state.bossDefeated,volume:state.volume,quality:state.quality,fpsLimit:state.fpsLimit,shadows:state.shadows,cameraSensitivity:state.cameraSensitivity,startingCashV1:true,startingCashV2:true,startingCashV3:true,startingCashV4:true,startingCashV5:true,startingCashV6:true,startingCashV8:true,armorDurabilityV3:true}))}catch(_e){}}
function resetGame(){if(!window.confirm('Tüm oyun ilerlemesi silinip oyun 1.000 ◈ ile sıfırlansın mı?'))return;try{localStorage.removeItem(STORE_KEY)}catch(_e){}if(onlineMatchActive)window.BBGameNet?.leaveOnline?.();stopMusic();Object.assign(state,{mode:'menu',map:0,maxMap:0,money:1000,hp:100,maxHp:100,armor:0,armorMax:0,owned:[true,false,false,false,false,false],selectedWeapon:0,ammo:weapons[0].mag,reserve:weapons[0].reserve,shadows:true,ownedArmor:['light'],equippedArmor:'light',ownedPets:[],equippedPet:null,petNames:{},bossCorpses:{},grenades:10,kits:1,bossHp:0,bossMax:0,ammoByWeapon:weapons.map(w=>w.mag),reserveByWeapon:weapons.map(w=>w.reserve),bossDefeated:{10:false,20:false,29:false},muted:false,volume:.7,quality:'medium',fpsLimit:60,cameraSensitivity:1});settingsDraft=null;gateSelectorOpen=false;cameraMode='third';cameraYaw=0;cameraPitch=.14;moveInput={x:0,y:0};fireHeld=false;for(const id of ['nicknamePanel','onlinePanel','pauseMenu','shopPanel','petPanel','mapPanel','settingsPanel','characterPanel','deathPanel','diagnosRewardPanel','vsScorePanel','vsTimerReadout','vsShopBtn','transitionOverlay'])$(id)?.classList.add('hidden');$('introOverlay').classList.add('hidden');$('introProgress').classList.add('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');$('mainMenu').classList.remove('hidden');document.documentElement.classList.remove('vs-active');restoreMapAtmosphere();createWorld(0);syncCameraMode();syncControlVisibility();updateHud();saveGame();setMusicForMap()}
function notify(text){const el=$('toast');el.textContent=text;el.classList.remove('hidden');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.add('hidden'),2400)}
function updateHud(){
  const map=maps[state.map];$('mapName').textContent=onlineMatchActive?'VS ARENA':map.name.toLocaleUpperCase('tr-TR');$('mapNumber').textContent=onlineMatchActive?`TUR ${onlineMatchData?.round||1} / 5`:`${String(state.map+1).padStart(2,'0')} / ${maps.length}`;$('moneyText').textContent=String(state.money);$('shopMoney').textContent=String(state.money);
  $('hpText').textContent=String(Math.ceil(state.hp));$('hpBar').style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`;$('armorText').textContent=String(Math.ceil(state.armor));$('armorBar').style.width=`${state.armorMax?Math.max(0,state.armor/state.armorMax*100):0}%`;
  const w=weapons[state.selectedWeapon];$('weaponName').textContent=w.name;$('ammoText').textContent=String(state.ammo);$('reserveText').textContent=String(state.reserve);
  $('kitCount').textContent=String(state.kits);$('grenadeCount').textContent=String(state.grenades);$('mobileKitCount').textContent=String(state.kits);$('mobileGrenadeCount').textContent=String(state.grenades);
  const boss=enemies.find(e=>e.boss&&(!e.dead||e.deathAnimation));$('bossPanel').classList.toggle('hidden',!boss);if(boss){const base=boss.code==='kardinal'?'KARDİNAL':boss.code==='harvester'?'ATOM HASATÇISI':'DIAGNOS',phase=boss.code==='kardinal'?['',' · ÖFKE FAZI',' · SON HÜKÜM'][boss.bossPhase]||'':'';$('bossName').textContent=boss.deathAnimation?`${base} · YENİLİYOR`:`${base}${phase}`;$('bossBar').style.width=`${Math.max(0,boss.hp/boss.maxHp*100)}%`;const shieldTrack=$('bossShieldTrack');shieldTrack.classList.toggle('hidden',!boss.maxShield);if(boss.maxShield){$('bossShieldText').textContent=`KALKAN ${Math.ceil(boss.shield)} / ${boss.maxShield}`;$('bossShieldBar').style.width=`${Math.max(0,boss.shield/boss.maxShield*100)}%`}}
}
function onlineCombatReady(){return !onlineMatchActive||(onlineMatchData?.phase==='combat'&&!onlineLocalDead)}
function onlineRuntimeMode(){return onlineMatchActive&&['play','pause','shop','pet'].includes(state.mode)}
function drawMinimap(){
  if(!miniMapContext||!player)return;
  const ctx=miniMapContext,w=miniMapCanvas.width,h=miniMapCanvas.height,cx=w/2,cy=h/2,range=62,scale=Math.min(w,h)/(range*2);
  ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.roundRect(0,0,w,h,12);ctx.clip();
  const wash=ctx.createLinearGradient(0,0,w,h);wash.addColorStop(0,'rgba(12,24,27,.94)');wash.addColorStop(1,'rgba(6,12,17,.94)');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(170,221,211,.10)';ctx.lineWidth=1;
  for(let k=-2;k<=2;k++){const offset=k*31;ctx.beginPath();ctx.moveTo(cx+offset,0);ctx.lineTo(cx+offset,h);ctx.moveTo(0,cy+offset);ctx.lineTo(w,cy+offset);ctx.stroke()}
  for(const o of obstacles){const dx=o.x-player.x,dz=o.z-player.z;if(Math.abs(dx)>range||Math.abs(dz)>range)continue;const x=cx+dx*scale,y=cy+dz*scale;ctx.fillStyle='rgba(196,205,177,.42)';ctx.fillRect(x-2,y-2,4,4)}
  for(const e of enemies){if(e.dead)continue;const dx=e.root.position.x-player.x,dz=e.root.position.z-player.z;if(Math.abs(dx)>range||Math.abs(dz)>range)continue;ctx.beginPath();ctx.fillStyle=e.boss?'#ff5564':e.kind==='spitter'?'#b5ff56':'#fb8577';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=e.boss?10:4;ctx.arc(cx+dx*scale,cy+dz*scale,e.boss?4:2.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  if(portal){const dx=portal.x-player.x,dz=portal.z-player.z,distance=Math.hypot(dx,dz),factor=Math.min(1,(range-7)/(distance||1)),gx=cx+dx*factor*scale,gy=cy+dz*factor*scale;ctx.save();ctx.shadowColor='#ff394b';ctx.shadowBlur=13;ctx.fillStyle='rgba(255,57,75,.3)';ctx.beginPath();ctx.arc(gx,gy,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ff3b4d';ctx.strokeStyle='#ffe7e9';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(gx,gy,3.4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}
  ctx.save();ctx.translate(cx,cy);ctx.rotate(player.yaw);ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(6,7);ctx.lineTo(0,4);ctx.lineTo(-6,7);ctx.closePath();ctx.fillStyle='#8bfff0';ctx.shadowColor='#40e5ca';ctx.shadowBlur=9;ctx.fill();ctx.restore();
  ctx.restore();
}

function makeAudioContext(){if(!audio.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(AC){audio.ctx=new AC();audio.sfxBus=audio.ctx.createGain();audio.sfxBus.gain.value=.72;audio.sfxBus.connect(audio.ctx.destination)}}if(audio.ctx?.state==='suspended')audio.ctx.resume()}
function tone(freq=180,duration=.08,wave='sawtooth',gain=.035){if(!audio.ctx||state.volume<=0||audio.activeTones>=6)return;const t=audio.ctx.currentTime,o=audio.ctx.createOscillator(),g=audio.ctx.createGain();audio.activeTones++;audio.duckUntil=performance.now()+Math.min(480,duration*1000+150);o.type=wave;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.55),t+duration);g.gain.setValueAtTime(gain*state.volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.sfxBus||audio.ctx.destination);o.onended=()=>{audio.activeTones=Math.max(0,audio.activeTones-1)};o.start(t);o.stop(t+duration)}
function noiseBuffer(){if(audio.noiseBuffer)return audio.noiseBuffer;const ctx=audio.ctx,length=Math.ceil(ctx.sampleRate*.4),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length*.38);audio.noiseBuffer=buffer;return buffer}
function playNoiseBurst(freq=900,duration=.09,gain=.18,filterType='bandpass',delay=0,q=1.1){if(state.volume<=0)return;makeAudioContext();const ctx=audio.ctx;if(!ctx)return;const t=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),envelope=ctx.createGain();source.buffer=noiseBuffer();filter.type=filterType;filter.frequency.setValueAtTime(freq,t);filter.Q.value=q;envelope.gain.setValueAtTime(.0001,t);envelope.gain.linearRampToValueAtTime(gain*state.volume,t+.004);envelope.gain.exponentialRampToValueAtTime(.001,t+duration);source.connect(filter);filter.connect(envelope);envelope.connect(audio.sfxBus||ctx.destination);source.start(t);source.stop(t+duration+.008);audio.duckUntil=performance.now()+Math.min(180,duration*1000+45)}
function playShotTone(freq,endFreq,duration,gain=.12,wave='triangle',delay=0){if(state.volume<=0)return;makeAudioContext();const ctx=audio.ctx;if(!ctx)return;const t=ctx.currentTime+delay,osc=ctx.createOscillator(),envelope=ctx.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,t);osc.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+duration);envelope.gain.setValueAtTime(.0001,t);envelope.gain.linearRampToValueAtTime(gain*state.volume,t+.003);envelope.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(envelope);envelope.connect(audio.sfxBus||ctx.destination);osc.start(t);osc.stop(t+duration+.01)}
function playGunshotSound(type){const v=.88+Math.random()*.24;switch(type){case'pistol':playNoiseBurst(1350*v,.082,.2,'bandpass');playShotTone(126*v,48,.095,.13,'triangle');break;case'uzi':playNoiseBurst(1750*v,.052,.14,'bandpass',0,1.7);playShotTone(115*v,54,.058,.075,'square');break;case'shotgun':playNoiseBurst(490*v,.22,.3,'lowpass',0,.85);playShotTone(82*v,35,.21,.23,'sine');break;case'minigun':playNoiseBurst(1120*v,.062,.15,'lowpass');playShotTone(96*v,45,.062,.08,'triangle');break;case'rocket':playNoiseBurst(720*v,.24,.2,'lowpass',0,.65);playShotTone(65*v,32,.22,.14,'sine');break;case'laser':playShotTone(1180*v,290,.13,.14,'sawtooth');playShotTone(1880*v,520,.075,.065,'sine',.012);break;default:playNoiseBurst(1250*v,.08,.16,'bandpass')}}
function playReloadSound(type,stage){const base={pistol:690,uzi:850,shotgun:430,minigun:540,rocket:330,laser:1040}[type]||650;if(stage==='out'){playNoiseBurst(base,.065,.09,'bandpass',0,1.4);playShotTone(base*.7,base*.42,.055,.045,'square')}else{playShotTone(base*1.12,base*.82,.045,.055,'square');playNoiseBurst(base*1.7,.042,.075,'highpass',.105,1.1);playShotTone(base*1.35,base*.9,.055,.04,'triangle',.11)}}
function updateAudioMix(){const desired=performance.now()<audio.duckUntil ? .2 : .42;audio.musicLevel+=(desired-audio.musicLevel)*.12;if(audio.current)audio.current.volume=state.volume*audio.musicLevel}
function stopMusic(){bossMusicStopToken++;if(audio.current){audio.current.pause();try{audio.current.currentTime=0}catch(_e){}if(audio.current.tagName==='VIDEO')audio.current.remove()}audio.current=null;audio.currentKey=''}
function scheduleBossMusicStop(key){const token=++bossMusicStopToken;setTimeout(()=>{if(token===bossMusicStopToken&&audio.currentKey===key)stopMusic()},10000)}
function scheduleCardinalMusicStop(){scheduleBossMusicStop('kardinal')}
function playMusic(src,key,loop=true,fallbackSrc=null){const now=performance.now();if(audio.currentKey===key&&audio.current){if(!audio.current.paused||now-audio.startAttemptAt<900)return}bossMusicStopToken++;if(audio.current){audio.current.pause();try{audio.current.currentTime=0}catch(_e){}if(audio.current.tagName==='VIDEO')audio.current.remove()}const useVideo=/\.(m4a|mp4)(?:$|[?#])/i.test(src),track=useVideo?document.createElement('video'):new Audio();if(useVideo){track.setAttribute('aria-hidden','true');track.style.cssText='position:fixed;width:1px;height:1px;left:-2px;bottom:0;opacity:0;pointer-events:none;z-index:-1'}track.preload='auto';track.loop=loop;track.playsInline=true;track.volume=state.volume*audio.musicLevel;track.src=new URL(src,document.baseURI).href;if(useVideo)document.body.appendChild(track);audio.current=track;audio.currentKey=key;audio.startAttemptAt=now;let fallbackStarted=false;const fallback=()=>{if(!fallbackSrc||fallbackStarted||audio.current!==track)return false;fallbackStarted=true;audio.currentKey='';playMusic(fallbackSrc,`${key}-fallback`,loop);return true};track.addEventListener('error',()=>{if(audio.current!==track)return;if(fallback())return;audio.currentKey='';notify(`Ses açılamadı: ${src} (kod ${track.error?.code||'?'})`)},{once:true});let start;try{start=track.play()}catch(error){start=Promise.reject(error)}start?.catch(error=>{if(audio.current!==track)return;if(error?.name==='NotAllowedError'||error?.name==='AbortError'){audio.currentKey=key;return}if(fallback())return;audio.currentKey='';notify(`Ses başlatılamadı: ${src} (${error?.name||'hata'})`)})}
function setMusicForMap(){if(state.mode==='menu'){playMusic('cut-menu.mp3','menu',true,'music-fallback.m4a');return}if(state.map===10){if(state.bossDefeated[10]){stopMusic();return}playMusic('Holy.mp3','kardinal')}else if(state.map===20){if(state.bossDefeated[20]){stopMusic();return}playMusic('teminite.m4a','harvester')}else if(state.map===29)playMusic('illision.m4a','diagnos');else stopMusic()}

function pauseAudio(){audio.current?.pause();for(const voice of audio.petTracks){voice.pause();try{voice.currentTime=0}catch(_e){}}audio.petTracks.clear();if(audio.ctx?.state==='running')audio.ctx.suspend().catch(()=>{})}
function resumeAudio(){if(audio.ctx?.state==='suspended')audio.ctx.resume().catch(()=>{});if(audio.current?.paused)audio.current.play().catch(()=>{})}
function openPause(){if(state.mode!=='play')return;state.mode='pause';fireHeld=false;aimHeld=false;syncAimButton();if(!onlineMatchActive)pauseAudio();$('pauseTitle').textContent=onlineMatchActive?'VS MENÜSÜ':'OYUN DURAKLATILDI';$('pauseDescription').textContent=onlineMatchActive?'':'Güvenli bölgede ekipmanını düzenle.';$('pauseDescription').classList.toggle('hidden',onlineMatchActive);$('pauseMenu').querySelector('.eyebrow').innerHTML=onlineMatchActive?'<i></i> VS':'<i></i> GÜVENLİ NOKTA';$('resumeBtn').querySelector('span').textContent=onlineMatchActive?'MAÇA DÖN':'DEVAM ET';$('openPetBtn').classList.toggle('hidden',onlineMatchActive&&onlineMatchData?.phase==='matchEnd');$('openShopBtn').classList.toggle('hidden',onlineMatchActive);$('pauseMenu').classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');syncControlVisibility();if(document.pointerLockElement===canvas)document.exitPointerLock?.()}
function resume(){if(state.mode!=='pause')return;if(onlineMatchActive&&onlineMatchData?.phase==='matchEnd'){window.BBGameNet?.leaveOnline?.();return}state.mode='play';if(!onlineMatchActive)resumeAudio();$('pauseTitle').textContent='OYUN DURAKLATILDI';$('pauseDescription').textContent='Güvenli bölgede ekipmanını düzenle.';$('pauseDescription').classList.remove('hidden');$('pauseMenu').querySelector('.eyebrow').innerHTML='<i></i> GÜVENLİ NOKTA';$('resumeBtn').querySelector('span').textContent='DEVAM ET';$('openPetBtn').classList.remove('hidden');$('openShopBtn').classList.remove('hidden');$('pauseMenu').classList.add('hidden');$('topHud').classList.remove('hidden');$('combatHud').classList.remove('hidden');syncControlVisibility()}
function openPetPanel(){if(state.mode!=='pause')return;state.mode='pet';$('pauseMenu').classList.add('hidden');$('petPanel').classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');renderPetItems()}
function closePetPanel(){if(state.mode!=='pet')return;$('petPanel').classList.add('hidden');state.mode='pause';$('pauseMenu').classList.remove('hidden');renderPetItems()}
function renderPetItems(){
  $('petMoney').textContent=String(state.money);const holder=$('petItems'),editor=$('petNameEditor'),input=$('petNameInput'),equippedPet=petStock.find(p=>p.id===state.equippedPet);holder.innerHTML='';editor.classList.toggle('hidden',!equippedPet);if(equippedPet){input.value=String(state.petNames[equippedPet.id]||'');input.placeholder=equippedPet.name}
  for(const pet of petStock){const free=onlineMatchActive,owned=state.ownedPets.includes(pet.id)||free,equipped=state.equippedPet===pet.id,card=document.createElement('article');card.className=`shopItem petCard${equipped?' selected':''}`;card.innerHTML=`<span class="petEmoji" aria-hidden="true">${pet.id==='cat'?'🐈':pet.id==='dog'?'🐕':'🦊'}</span><h3>${pet.name}</h3><footer><span>${free?'ÜCRETSİZ':owned?'SAHİP':'◈ 500'}</span><button ${!owned&&state.money<pet.price?'disabled':''}>${equipped?'ÇIKAR':owned?'KUŞAN':'SATIN AL'}</button></footer>`;
    card.querySelector('button').addEventListener('click',()=>{if(!state.ownedPets.includes(pet.id)){if(!free&&state.money<pet.price)return;if(!free)state.money-=pet.price;state.ownedPets.push(pet.id)}state.equippedPet=equipped?null:pet.id;createEquippedPet();updateHud();renderPetItems();saveGame();if(state.equippedPet)playPetSound(pet.id);tone(540,.1,'triangle',.045)});holder.append(card)
  }
}
function openShop(){if(state.mode!=='pause'&&state.mode!=='play')return;if(onlineMatchActive&&onlineMatchData?.phase!=='buy')return;const wasPlay=state.mode==='play';shopReturnMode=wasPlay?'play':'pause';state.mode='shop';$('pauseMenu').classList.add('hidden');$('shopPanel').classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');if(wasPlay&&document.pointerLockElement===canvas)document.exitPointerLock?.();renderShop()}
function closeShop(){if(state.mode!=='shop')return;$('shopPanel').classList.add('hidden');state.mode=onlineMatchActive?shopReturnMode:'pause';const paused=state.mode==='pause';$('pauseMenu').classList.toggle('hidden',!paused);$('topHud').classList.toggle('hidden',paused);$('combatHud').classList.toggle('hidden',paused);if(paused&&onlineMatchActive){$('pauseTitle').textContent='VS MENÜSÜ';$('pauseDescription').classList.add('hidden');$('pauseMenu').querySelector('.eyebrow').innerHTML='<i></i> VS';$('resumeBtn').querySelector('span').textContent='MAÇA DÖN';$('openPetBtn').classList.toggle('hidden',onlineMatchData?.phase==='matchEnd');$('openShopBtn').classList.add('hidden')}syncControlVisibility();updateHud()}
function renderShop(){
  $('shopMoney').textContent=String(state.money);const holder=$('shopItems');holder.innerHTML='';
  for(let i=0;i<weapons.length;i++){
    const w=weapons[i],owned=state.owned[i],selected=state.selectedWeapon===i,card=document.createElement('article');card.className=`shopItem${selected?' selected':''}`;card.dataset.shopTab='weapons';
    const status=selected?'KUŞANILDI':owned?'KUŞAN':'SATIN AL';const price=owned?'SAHİP':`◈ ${w.price}`;
    card.innerHTML=`<h3>${w.name}</h3><p>${w.damage} HASAR · ${w.mag} MERMİ<br>${Math.round(60000/w.rate)} ATIŞ / DK</p><footer><span>${price}</span><button ${!owned&&state.money<w.price?'disabled':''}>${status}</button></footer>`;
    card.querySelector('button').addEventListener('click',()=>{if(owned){selectWeapon(i);renderShop();return}if(state.money<w.price)return;state.money-=w.price;state.owned[i]=true;state.ammoByWeapon[state.selectedWeapon]=state.ammo;state.reserveByWeapon[state.selectedWeapon]=state.reserve;state.selectedWeapon=i;state.ammo=w.mag;state.reserve=w.reserve;state.ammoByWeapon[i]=w.mag;state.reserveByWeapon[i]=w.reserve;replacePlayerWeapon();updateHud();renderShop();saveGame();tone(540,.1,'triangle',.045);notify(`${w.name} SATIN ALINDI`)});
    holder.append(card);
  }
  const currentWeapon=weapons[state.selectedWeapon],summary=$('shopAmmoSummary');summary.innerHTML=`<span>ŞARJÖR <b>${state.ammo} / ${currentWeapon.mag}</b></span><span>YEDEK <b>${state.reserve}</b></span><span>TOPLAM MERMİ <b>${state.ammo+state.reserve}</b></span>`;
  for(const rounds of [50,100,200]){const price=rounds*.5,card=document.createElement('article');card.className='shopItem ammoOffer';card.dataset.shopTab='ammo';card.innerHTML=`<h3>CEPHANE +${rounds}</h3><p>${currentWeapon.name} · MERMİ BAŞI ◈ 0,5</p><footer><span>◈ ${price}</span><button ${state.money<price?'disabled':''}>SATIN AL</button></footer>`;card.querySelector('button').addEventListener('click',()=>{if(state.money<price)return;state.money-=price;const magazineFill=Math.min(currentWeapon.mag-state.ammo,rounds);state.ammo+=magazineFill;state.reserve+=rounds-magazineFill;updateHud();renderShop();saveGame();tone(540,.1,'triangle',.045);notify(`${rounds} MERMİ TEDARİK EDİLDİ`)});holder.append(card)}
  for(const item of armorStock){if(onlineMatchActive&&item.id==='kardinal')continue;const owned=state.ownedArmor.includes(item.id);if(state.map<(item.minMap||0)&&!owned)continue;const equipped=state.equippedArmor===item.id,card=document.createElement('article');card.className=`shopItem${equipped?' selected':''}`;card.dataset.shopTab='equipment';card.innerHTML=`<h3>${item.name}</h3><p>${item.armor} ZIRH PUANI<br>Mevcut: ${Math.floor(state.armor)} / ${state.armorMax}</p><footer><span>${owned?'SAHİP':`◈ ${item.price}`}</span><button ${!owned&&state.money<item.price?'disabled':''}>${equipped?'KUŞANILDI':owned?'KUŞAN':'SATIN AL'}</button></footer>`;card.querySelector('button').addEventListener('click',()=>{if(!owned){if(state.money<item.price)return;state.money-=item.price;state.ownedArmor.push(item.id)}state.equippedArmor=item.id;state.armorMax=item.armor;state.armor=item.armor;updateHud();renderShop();saveGame();notify(owned?'ZIRH DEĞİŞTİRİLDİ':'ZIRH SATIN ALINDI')});holder.append(card)}
  for(const [label,price,type] of [['İLK YARDIM KİTİ',90,'kit'],['EL BOMBASI',75,'grenade']]){const card=document.createElement('article');card.className='shopItem';card.dataset.shopTab='equipment';card.innerHTML=`<h3>${label}</h3><p>${type==='kit'?'CANINI 45 PUAN ONARIR':'ALAN HASARLI PATLAYICI'}</p><footer><span>◈ ${price}</span><button ${state.money<price?'disabled':''}>AL</button></footer>`;card.querySelector('button').addEventListener('click',()=>{if(state.money<price)return;state.money-=price;if(type==='kit')state.kits++;else state.grenades++;updateHud();renderShop();saveGame();notify(`${label} ALINDI`)});holder.append(card)}
  setShopTab(activeShopTab);
}
function setShopTab(tab){activeShopTab=tab;$('shopAmmoSummary').classList.toggle('hidden',tab!=='ammo');for(const card of document.querySelectorAll('#shopItems .shopItem'))card.classList.toggle('shopItemHidden',card.dataset.shopTab!==tab);for(const [key,id] of [['weapons','shopWeaponsTab'],['ammo','shopAmmoTab'],['equipment','shopGearTab']])$(id).classList.toggle('active',key===tab)}
function renderMapGrid(){const grid=$('mapGrid');grid.innerHTML='';maps.forEach((map,i)=>{const next=i===state.maxMap+1,locked=i>state.maxMap,bossLocked=bossGateForMap(i),cost=mapUnlockCost(i),b=document.createElement('button');b.className='mapTile';b.disabled=i>state.maxMap+1||bossLocked;b.innerHTML=`<b>${String(i+1).padStart(2,'0')} · ${map.name}</b><small>${bossLocked?'ÖNCEKİ BOSSU YEN':locked?`AÇMA BEDELİ · ${cost} ◈`:i===state.map?'ŞU ANKİ BÖLGE':bossMapIndexes.has(i)?'BOSS ARENASI':'AÇIK'}</small>${map.boss?'<span class="tileBoss">BOSS</span>':''}`;if(next&&state.money<cost)b.classList.add('mapUnaffordable');b.addEventListener('click',()=>beginLevel(i));grid.append(b)})}
function refreshMapGrid(){renderMapGrid()}
function buyMapPanel(){if(state.mode==='play'){mapReturnMode='play';openPause()}else mapReturnMode=state.mode;$('mapPanel').classList.remove('hidden');$('mainMenu').classList.add('hidden');renderMapGrid()}
function closeMap(){$('mapPanel').classList.add('hidden');if(mapReturnMode==='play'&&state.mode==='pause'){gateSelectorOpen=false;resume()}else{state.mode='menu';$('mainMenu').classList.remove('hidden')}}
function mountGameSelect(id){const select=$(id);if(!select||select.dataset.gameSelect)return;select.dataset.gameSelect='true';select.classList.add('gameSelectNative');const wrap=document.createElement('div');wrap.className='gameSelect';select.parentElement.insertBefore(wrap,select);wrap.append(select);const trigger=document.createElement('button');trigger.type='button';trigger.className='gameSelectTrigger';trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');wrap.append(trigger);const menu=document.createElement('div');menu.className='gameSelectMenu';menu.setAttribute('role','listbox');wrap.append(menu);const render=()=>{const option=select.selectedOptions[0];trigger.textContent=option?.textContent||'';menu.innerHTML='';for(const item of select.options){const button=document.createElement('button');button.type='button';button.className='gameSelectOption';button.setAttribute('role','option');button.setAttribute('aria-selected',String(item.value===select.value));button.textContent=item.textContent;button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();select.value=item.value;select.dispatchEvent(new Event('change',{bubbles:true}));render();wrap.classList.remove('open');trigger.setAttribute('aria-expanded','false')});menu.append(button)}};trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const open=!wrap.classList.contains('open');document.querySelectorAll('.gameSelect.open').forEach(other=>{other.classList.remove('open');other.querySelector('.gameSelectTrigger')?.setAttribute('aria-expanded','false')});wrap.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open))});select.addEventListener('change',render);render()}
function syncGameSelect(id){const select=$(id);if(!select)return;select.dispatchEvent(new Event('change',{bubbles:true}))}
function openSettings(){settingsReturnMode=state.mode;settingsDraft={volume:state.volume,quality:state.quality,fpsLimit:state.fpsLimit,shadows:state.shadows,cameraSensitivity:state.cameraSensitivity};$('shadowSelect').value=state.shadows?'on':'off';$('volumeSlider').value=Math.round(settingsDraft.volume*100);$('volumeValue').textContent=`${Math.round(settingsDraft.volume*100)}%`;$('qualitySelect').value=settingsDraft.quality;$('fpsLimitSelect').value=String(state.fpsLimit);$('sensitivitySlider').value=String(settingsDraft.cameraSensitivity);$('sensitivityValue').textContent=settingsDraft.cameraSensitivity.toFixed(1);for(const id of ['shadowSelect','qualitySelect','fpsLimitSelect'])syncGameSelect(id);$('settingsPanel').classList.remove('hidden');$('mainMenu').classList.add('hidden');if(settingsReturnMode==='pause')$('pauseMenu').classList.add('hidden')}
function backFromSettings(){settingsDraft=null;$('settingsPanel').classList.add('hidden');if(settingsReturnMode==='pause'){state.mode='pause';$('pauseMenu').classList.remove('hidden')}else{$('mainMenu').classList.remove('hidden')}}
function applySettings(){if(!settingsDraft)return;const previousQuality=state.quality;state.volume=Number($('volumeSlider').value)/100;state.quality=$('qualitySelect').value;state.fpsLimit=Number($('fpsLimitSelect').value)===30?30:60;state.shadows=$('shadowSelect').value==='on';state.cameraSensitivity=Math.max(0,Math.min(5,Number($('sensitivitySlider').value)));lastRenderedAt=0;applyQuality();if(audio.current)audio.current.volume=state.volume*audio.musicLevel;if(previousQuality!==state.quality&&state.mode==='menu'&&playerModel)createWorld(state.map);settingsDraft=null;$('settingsPanel').classList.add('hidden');if(settingsReturnMode==='pause'){$('pauseMenu').classList.remove('hidden')}else{$('mainMenu').classList.remove('hidden')}saveGame()}

function aimPoint(){
  camera.updateMatrixWorld(true);
  raycaster.setFromCamera(aimNdc,camera);
  raycaster.near=.05;raycaster.far=260;
  const targets=[...shotOccluders,...enemies.filter(e=>!e.dead).map(e=>e.root),...(onlineOpponentModel?[onlineOpponentModel.root]:[])];
  const hit=raycaster.intersectObjects(targets,true)[0];
  return hit?hit.point.clone():raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction,240);
}
function enemyFromHit(object){let root=object;while(root&&root.parent&&root.parent!==world)root=root.parent;return enemies.find(e=>!e.dead&&e.root===root)||null}
function addTracer(from,to,color){const geometry=new THREE.BufferGeometry().setFromPoints([from,to]),mat=new THREE.LineBasicMaterial({color,transparent:true,opacity:.78,depthWrite:false,toneMapped:false}),line=new THREE.Line(geometry,mat);line.frustumCulled=false;world.add(line);effects.push({mesh:line,life:.055,max:.055,kind:'tracer'})}
function spawnOnlineHitEffect(point){const mesh=addSphere(world,point.toArray(),[.22,.22,.22],0xff203b,{geometry:smallSphereGeo,emissive:0xd80828,emissiveIntensity:1.4,roughness:.35,cast:false});effects.push({mesh,life:.22,max:.22,kind:'hitSpark',initialScale:.55,velocity:new THREE.Vector3((Math.random()-.5)*1.4,.7+Math.random(),(Math.random()-.5)*1.4)})}
function showDamageDirection(){
  if(!onlineMatchActive||!onlineOpponentModel||!player)return;
  const el=$('damageDirection'),rect=canvas.getBoundingClientRect(),origin=new THREE.Vector3(player.x,player.y+1.15,player.z),projected=origin.clone().project(camera);
  const right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion),to=onlineOpponentModel.root.position.clone().add(new THREE.Vector3(0,1,0)).sub(origin),sx=to.dot(right),sy=to.dot(up),length=Math.hypot(sx,sy)||1;
  let anchorX=(projected.x*.5+.5)*rect.width,anchorY=(-projected.y*.5+.5)*rect.height;if(projected.z>1||Math.abs(projected.x)>.85||Math.abs(projected.y)>.85){anchorX=rect.width*.5;anchorY=rect.height*.68}anchorX=THREE.MathUtils.clamp(anchorX,30,rect.width-30);anchorY=THREE.MathUtils.clamp(anchorY,45,rect.height-45);const radius=Math.min(54,Math.max(38,rect.width*.055));
  el.style.left=`${anchorX+sx/length*radius}px`;el.style.top=`${anchorY-sy/length*radius}px`;el.style.setProperty('--damage-angle',`${Math.atan2(-sy,sx)*180/Math.PI}deg`);
  el.classList.remove('hidden','hit');void el.offsetWidth;el.classList.add('hit');clearTimeout(damageDirectionTimer);damageDirectionTimer=setTimeout(()=>el.classList.add('hidden'),2700)
}
function shoot(){
  if(state.mode!=='play'||reloadLeft>0||!onlineCombatReady())return;
  const w=weapons[state.selectedWeapon],now=performance.now();if(now-lastShot<w.rate)return;if(state.ammo<=0){reload();return}lastShot=now;state.ammo--;state.ammoByWeapon[state.selectedWeapon]=state.ammo;updateHud();playGunshotSound(w.type);
  const target=aimPoint(),right=new THREE.Vector3(Math.cos(player.yaw),0,Math.sin(player.yaw));
  const muzzleZ={rocket:-1.22,minigun:-1.39,shotgun:-.91,laser:-.86,uzi:-.78,pistol:-.78}[w.type]||-.82;
  const origin=cameraMode==='first'&&fpWeaponRoot?fpWeaponRoot.localToWorld(new THREE.Vector3(0,.015,muzzleZ)):playerModel.gun.getWorldPosition(new THREE.Vector3()).addScaledVector(right,.16).add(new THREE.Vector3(0,.12,0));
  const aimDirection=target.clone().sub(origin).normalize(),spreadRight=new THREE.Vector3().crossVectors(aimDirection,camera.up).normalize(),spreadUp=new THREE.Vector3().crossVectors(spreadRight,aimDirection).normalize();
  const moving=Math.min(1,player.velocity.length()/player.speed),spread=(w.spread+moving*.016+aimKick*.12+aimBloom*.045)*(1-aimBlend*.55),color=w.type==='laser'?0x62fff0:w.type==='rocket'?0xffad65:0xffd089;let onlineHitConfirmed=false;
  if(w.type==='rocket'){
    const mesh=addSphere(world,origin.toArray(),[.17,.17,.17],color,{geometry:smallSphereGeo,emissive:color,emissiveIntensity:1.8,roughness:.25,cast:false}),distance=origin.distanceTo(target),dir=aimDirection.clone();
    projectiles.push({mesh,pos:origin.clone(),prev:origin.clone(),dir,velocity:75,damage:w.damage,life:distance/75+.12,from:'player',rocket:true,targetPoint:target.clone()});
  }else{
    for(let i=0;i<w.pellets;i++){
      const dir=aimDirection.clone().addScaledVector(spreadRight,(Math.random()-.5)*spread).addScaledVector(spreadUp,(Math.random()-.5)*spread).normalize();
      raycaster.set(origin,dir);raycaster.near=.02;raycaster.far=Math.min(260,Math.max(3,origin.distanceTo(target)+.25));
      const hit=raycaster.intersectObjects([...shotOccluders,...enemies.filter(e=>!e.dead).map(e=>e.root),...(onlineOpponentModel?[onlineOpponentModel.root]:[])],true)[0];
      const impact=hit?hit.point.clone():origin.clone().addScaledVector(dir,raycaster.far);
      const enemy=hit?enemyFromHit(hit.object):null;let hitOpponent=!!(hit&&onlineOpponentModel&&isChildOf(hit.object,onlineOpponentModel.root));if(enemy)damageEnemy(enemy,w.damage,hit.point,dir.clone().negate());else if(hitOpponent){window.BBGameNet?.damageOpponent?.(w.damage);onlineHitConfirmed=true;spawnOnlineHitEffect(impact)}else if(onlineOpponentModel&&onlineRayHitsOpponent(origin,dir,raycaster.far)){window.BBGameNet?.damageOpponent?.(w.damage);hitOpponent=true;onlineHitConfirmed=true;spawnOnlineHitEffect(impact)}
      const traceEnd=impact.distanceTo(origin)<.2?origin.clone().addScaledVector(dir,1.6):impact;addTracer(origin,traceEnd,color);
    }
  }
  if(onlineHitConfirmed)tone(185,.075,'sine',.035);
  aimKick=Math.min(.07,aimKick+(w.type==='shotgun'?.035:w.type==='minigun'?.006:.012));
  aimBloom=Math.min(.48,aimBloom+(w.type==='shotgun'?.1:w.type==='minigun'?.018:w.type==='uzi'?.035:.025));playerModel.root.userData.recoil=Math.min(.36,(playerModel.root.userData.recoil||0)+(w.type==='shotgun'?.31:w.type==='minigun'?.04:.13));
}
function onlineRayHitsOpponent(origin,direction,maxDistance){
  if(!onlineMatchActive||!onlineCombatReady()||!onlineOpponentModel||onlineOpponent?.hp<=0)return false;
  const center=onlineOpponentModel.root.position.clone().add(new THREE.Vector3(0,1.02,0)),toCenter=center.sub(origin),along=toCenter.dot(direction);if(along<0||along>maxDistance)return false;
  const nearest=origin.clone().addScaledVector(direction,along);if(nearest.distanceTo(center)>.9)return false;
  raycaster.set(origin,direction);raycaster.near=.02;raycaster.far=along+.35;const blocker=raycaster.intersectObjects(shotOccluders,true)[0];return !blocker||blocker.distance>=along-.45;
}
function reload(){const index=state.selectedWeapon,w=weapons[index];if(state.mode!=='play'||reloadLeft||state.ammo>=w.mag||state.reserve<=0)return;reloadWeaponIndex=index;reloadDuration=w.reload;reloadLeft=w.reload;playReloadSound(w.type,'out');notify('ŞARJÖR DEĞİŞİYOR')}
function isChildOf(object,parent){for(let node=object;node;node=node.parent)if(node===parent)return true;return false}
function finishReload(){const index=reloadWeaponIndex,w=weapons[index],n=Math.min(w.mag-state.ammoByWeapon[index],state.reserveByWeapon[index]);state.ammoByWeapon[index]+=n;state.reserveByWeapon[index]-=n;if(state.selectedWeapon===index){state.ammo=state.ammoByWeapon[index];state.reserve=state.reserveByWeapon[index]}reloadDuration=0;updateHud();saveGame();playReloadSound(w.type,'in')}
function throwGrenade(){if(state.grenades<=0||state.mode!=='play'||grenadeThrowLeft>0||!onlineCombatReady())return;state.grenades--;grenadeThrowLeft=grenadeThrowDuration;grenadeThrowLaunched=false;updateHud();saveGame()}
function launchGrenade(){
  const target=aimPoint(),origin=playerModel.throwHand.getWorldPosition(new THREE.Vector3()),delta=target.clone().sub(origin),horizontal=Math.hypot(delta.x,delta.z)||.001,maxRange=34;
  if(horizontal>maxRange){delta.x*=maxRange/horizontal;delta.z*=maxRange/horizontal;delta.y=heightAt(player.x+delta.x,player.z+delta.z)-origin.y;}
  const distance=Math.hypot(delta.x,delta.z)||.001,flightTime=THREE.MathUtils.clamp(distance/18,.45,1.35),gravity=9.8;
  const velocity=new THREE.Vector3(delta.x/flightTime,(delta.y+.5*gravity*flightTime*flightTime)/flightTime,delta.z/flightTime),pos=origin.clone().addScaledVector(velocity.clone().normalize(),.42),mesh=createGrenadeModel(world);
  mesh.position.copy(pos);projectiles.push({mesh,pos,prev:pos.clone(),velocity,damage:240,life:2.2,from:'grenade',gravity});tone(330,.055,'triangle',.028);
}
function explodeAt(pos,radius,damage){
  const center=pos.clone();
  const flashMat=new THREE.MeshBasicMaterial({color:0xff642b,transparent:true,opacity:.96,depthWrite:false,toneMapped:false}),flash=addMesh(world,sphereGeo,flashMat,center.toArray(),[.32,.32,.32],false);effects.push({mesh:flash,life:.82,max:.82,kind:'blast'});
  for(const [size,color,life] of [[1.15,0xffd26b,.9],[1.85,0xfff0c4,.72]]){const ringMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false,toneMapped:false}),ring=addMesh(world,torusGeo(size,.075),ringMat,[center.x,center.y+.18,center.z],[.4,.4,.4],false);ring.rotation.x=Math.PI/2;effects.push({mesh:ring,life,max:life,kind:'blastRing'})}
  const light=new THREE.PointLight(0xff7a32,16,19,2);light.position.set(center.x,center.y+1,center.z);world.add(light);effects.push({mesh:light,life:.34,max:.34,kind:'blastLight'});
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=.55+(i%3)*.28,smokeMat=new THREE.MeshBasicMaterial({color:0x625c4e,transparent:true,opacity:.52,depthWrite:false}),smoke=addMesh(world,sphereGeo,smokeMat,[center.x+Math.cos(a)*r,center.y+.5+(i%2)*.25,center.z+Math.sin(a)*r],[.19,.19,.19],false);effects.push({mesh:smoke,life:.82,max:.82,kind:'blastSmoke',rise:.65+(i%3)*.18})}
  for(const e of enemies){if(e.dead)continue;const d=e.root.position.distanceTo(center);if(d<radius){const hitPoint=e.root.position.clone().add(new THREE.Vector3(0,1,0)),hitDirection=hitPoint.clone().sub(center).normalize();damageEnemy(e,damage*(1-d/radius*.4),hitPoint,hitDirection)}}
  if(onlineMatchActive&&onlineCombatReady()&&onlineOpponentModel&&onlineOpponent?.hp>0){const target=onlineOpponentModel.root.position.clone().add(new THREE.Vector3(0,1,0)),distance=target.distanceTo(center);if(distance<radius+1.2)window.BBGameNet?.damageOpponent?.(damage*Math.max(.15,1-distance/(radius+1.2)))}
  tone(58,.34,'sawtooth',.12);
}
function detonateGrenade(b,impact=null){if(b.exploded)return;b.exploded=true;const at=impact?impact.clone():b.pos.clone();if(!impact)at.y=heightAt(at.x,at.z)+.28;b.pos.copy(at);if(b.mesh)b.mesh.position.copy(at);explodeAt(at,8,b.damage)}
function hitSparkMaterial(color){const key=`hit-spark-${color}`;if(!materialCache.has(key))materialCache.set(key,new THREE.MeshBasicMaterial({color,depthWrite:false,toneMapped:false}));return materialCache.get(key)}
function spawnEnemyHitEffect(e,point,direction,color){const origin=point?.clone()||e.root.position.clone().add(new THREE.Vector3(0,1,0)),dir=direction?.clone().normalize()||new THREE.Vector3(0,1,0),mat=hitSparkMaterial(color);for(let i=0;i<3;i++){const velocity=dir.clone().multiplyScalar(.8+Math.random()*1.3).add(new THREE.Vector3((Math.random()-.5)*1.2,.25+Math.random()*.8,(Math.random()-.5)*1.2)),size=.035+Math.random()*.018,mesh=addMesh(world,smallSphereGeo,mat,[origin.x,origin.y,origin.z],[size,size,size],false);effects.push({mesh,life:.16+Math.random()*.04,max:.2,kind:'hitSpark',velocity,initialScale:size})}}
function damageEnemy(e,damage,point=null,direction=null){if(e.dead||e.boss&&e.introRemaining>0)return;const shielded=e.shield>0;let healthDamage=damage;if(shielded){const absorbed=Math.min(e.shield,healthDamage);e.shield-=absorbed;healthDamage-=absorbed}if(healthDamage>0)e.hp-=healthDamage;e.hit=.12;e.root.userData.hitDirection=direction?.clone()||new THREE.Vector3(0,0,1);e.root.userData.hitReact=.14;spawnEnemyHitEffect(e,point,direction,0xff4053);if(e.hp<=0){killEnemy(e)}if(e.boss)updateHud()}
function killEnemy(e){
  if(e.dead)return;e.dead=true;state.money+=e.boss?400:40;
  tone(e.boss?48:68,e.boss?.75:.12,'triangle',e.boss?.11:.04);if(e.kind==='bloater')explodeAt(e.root.position.clone(),4,75);
  if(e.boss){state.bossDefeated[state.map]=true;const roll=e.code==='harvester'?1.48:-1.48;state.bossCorpses[state.map]={x:e.root.position.x,z:e.root.position.z,yaw:e.root.rotation.y,roll,pitch:.12};e.deathAnimation={elapsed:0,duration:e.code==='harvester'?5.2:3.8,scale:e.bossBaseScale,y:heightAt(e.root.position.x,e.root.position.z),yaw:e.root.rotation.y,roll,pitch:.12,finalBurst:false};if(e.code==='kardinal')scheduleCardinalMusicStop();if(e.code==='harvester')scheduleBossMusicStop('harvester');if(e.code==='diagnos')spawnDiagnosRewardChest({x:e.root.position.x+7,z:e.root.position.z+4});notify(`${e.code==='kardinal'?'KARDİNAL':e.code==='harvester'?'ATOM HASATÇISI':'DIAGNOS'} YENİLDİ`);spawnBossRing(e.root.position,e.code==='kardinal'?0xff512d:e.code==='harvester'?0xffb52e:0xcaff94,12,1.5)}
  else e.fallAnimation={elapsed:0,duration:.46,life:1.08,baseX:e.root.rotation.x,baseZ:e.root.rotation.z,baseY:e.root.position.y,direction:Math.random()<.5?-1:1};
  state.hp=Math.min(state.maxHp,state.hp+(e.boss?18:2));saveGame();updateHud()
}
function updateEnemyDeath(e,dt){const a=e.fallAnimation;if(!a){world.remove(e.root);return}a.elapsed+=dt;const p=Math.min(1,a.elapsed/a.duration),ease=1-Math.pow(1-p,3);e.root.rotation.x=a.baseX+a.direction*1.48*ease;e.root.rotation.z=a.baseZ-a.direction*.16*ease;e.root.position.y=a.baseY+.1*Math.sin(Math.PI*p);if(a.elapsed>=a.life){world.remove(e.root);e.fallAnimation=null}}

function damagePlayer(amount){const onlineGameplay=onlineMatchActive&&['play','pause','shop','pet'].includes(state.mode)&&onlineMatchData?.phase==='combat';if(player?.invulnerable>0||!(state.mode==='play'||onlineGameplay)||onlineMatchActive&&!onlineGameplay)return;if(onlineMatchActive)showDamageDirection();player.invulnerable=.4;let left=amount;if(state.armor>0){const absorbed=Math.min(state.armor,left);state.armor-=absorbed;left-=absorbed}state.hp=Math.max(0,state.hp-left);tone(85,.16,'square',.04);updateHud();if(state.hp<=0)die()}
function die(){if(onlineMatchActive){onlineLocalDead=true;fireHeld=false;moveInput={x:0,y:0};player.velocity.set(0,0,0);notify('ELENDİN · TUR SONUCU BEKLENİYOR');updateHud();return}state.mode='dead';deathReturnMap=bossMapIndexes.has(state.map)?Math.max(0,state.map-1):state.map;fireHeld=false;pauseAudio();stopMusic();syncControlVisibility();if(document.pointerLockElement===canvas)document.exitPointerLock?.();$('deathPanel')?.classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden')}
function bossDamagePlayer(code,amount){damagePlayer(amount*(code==='kardinal'?.7:code==='harvester'?.765:1))}
function respawn(){state.money=Math.max(0,state.money-25);state.hp=state.maxHp;state.armor=Math.floor(state.armor*.5);const fromBoss=bossMapIndexes.has(state.map),destination=deathReturnMap;$('deathPanel').classList.add('hidden');beginLevel(destination);notify(fromBoss?'BOSS ARENASINDAN GERİ ÇEKİLDİN — 25 ◈':'SAHAYA DÖNDÜN — 25 ◈ TEDARİK BEDELİ')}

function jumpPlayer(){if(!player||state.mode!=='play'||!onlineCombatReady()||!player.grounded)return;player.jumpVelocity=6.9;player.grounded=false;}
function syncAimButton(){const button=$('mobileAim');if(!button)return;button.classList.toggle('is-active',aimHeld);button.setAttribute('aria-pressed',String(aimHeld));button.querySelector('small').textContent=aimHeld?'AÇIK':'NİŞAN'}
function toggleAim(){if(state.mode!=='play')return;aimHeld=!aimHeld;syncAimButton()}
function syncCameraMode(){if(playerModel)playerModel.root.visible=cameraMode!=='first';if(cameraMode==='first'){ensureFirstPersonViewModel();setFirstPersonWeapon();fpViewModel.visible=state.mode==='play'}else if(fpViewModel)fpViewModel.visible=false;const button=$('cameraModeBtn');if(button){button.textContent=cameraMode==='first'?'1. ŞAHIS':'3. ŞAHIS';button.setAttribute('aria-label',cameraMode==='first'?'Üçüncü şahıs görünümüne geç':'Birinci şahıs görünümüne geç')}}
function toggleCameraMode(){if(state.mode!=='play')return;cameraMode=cameraMode==='third'?'first':'third';syncCameraMode();if(cameraMode==='first'&&!isTouch())canvas.requestPointerLock?.();else if(cameraMode==='third'&&mouseLocked)document.exitPointerLock?.()}
function updatePlayer(dt,t){
  if(player.invulnerable>0)player.invulnerable-=dt;
  const movementAllowed=state.mode==='play'&&onlineCombatReady();let ix=movementAllowed?moveInput.x:0,iy=movementAllowed?moveInput.y:0;
  if(movementAllowed&&(keyState.KeyW||keyState.ArrowUp))iy+=1;if(movementAllowed&&(keyState.KeyS||keyState.ArrowDown))iy-=1;if(movementAllowed&&(keyState.KeyD||keyState.ArrowRight))ix+=1;if(movementAllowed&&(keyState.KeyA||keyState.ArrowLeft))ix-=1;
  const len=Math.hypot(ix,iy);if(len>1){ix/=len;iy/=len}
  const forward=new THREE.Vector3(Math.sin(cameraYaw),0,-Math.cos(cameraYaw)),right=new THREE.Vector3(Math.cos(cameraYaw),0,Math.sin(cameraYaw));
  const desired=right.clone().multiplyScalar(ix).add(forward.clone().multiplyScalar(iy));const speed=player.speed;
  const airborne=!player.grounded,acceleration=len>.08?(airborne?3.4:7.2):(airborne?.18:4.6);
  player.velocity.lerp(desired.multiplyScalar(speed),1-Math.exp(-dt*acceleration));player.velocity.multiplyScalar(Math.exp(-dt*(len>.08?(airborne?.48:.72):(airborne?.2:4.4))));
  let nx=THREE.MathUtils.clamp(player.x+player.velocity.x*dt,-172,172),nz=THREE.MathUtils.clamp(player.z+player.velocity.z*dt,-172,172);
  if(isBlocked(nx,nz,player.radius)||isPetBlocked(nx,nz,player.radius)||isEnemyBlocked(nx,nz,player.radius,player.x,player.z))nx=player.x;if(isBlocked(player.x,nz,player.radius)||isPetBlocked(player.x,nz,player.radius)||isEnemyBlocked(player.x,nz,player.radius,player.x,player.z))nz=player.z;
  player.x=nx;player.z=nz;let groundY=onlineSurfaceAt(nx,nz,player.y);if(player.grounded&&groundY<player.y-.4){player.grounded=false;player.jumpVelocity=0}if(keyState.Space&&player.grounded)jumpPlayer();if(!player.grounded){player.jumpVelocity-=19*dt;player.y+=player.jumpVelocity*dt;groundY=onlineSurfaceAt(nx,nz,player.y);if(player.y<=groundY){player.y=groundY;player.jumpVelocity=0;player.grounded=true}}else player.y=groundY;
  playerModel.root.position.set(player.x,player.y,player.z);
  if(reloadLeft>0){reloadLeft=Math.max(0,reloadLeft-dt);if(reloadLeft===0)finishReload()}
  let throwProgress=-1;if(grenadeThrowLeft>0){grenadeThrowLeft=Math.max(0,grenadeThrowLeft-dt);throwProgress=1-grenadeThrowLeft/grenadeThrowDuration;if(!grenadeThrowLaunched&&throwProgress>=.4){launchGrenade();grenadeThrowLaunched=true}if(grenadeThrowLeft===0){grenadeThrowLaunched=false;throwProgress=-1}}
  aimBlend=THREE.MathUtils.damp(aimBlend,aimHeld&&state.mode==='play'?1:0,11,dt);document.documentElement.classList.toggle('aiming',aimBlend>.08);const targetFov=cameraMode==='first'?62-13*aimBlend:62-20*aimBlend,nextFov=THREE.MathUtils.damp(camera.fov,targetFov,10,dt);if(Math.abs(camera.fov-nextFov)>.015){camera.fov=nextFov;camera.updateProjectionMatrix()}
  aimKick=Math.max(0,aimKick-dt*.34);aimBloom=Math.max(0,aimBloom-dt*1.15);const viewPitch=THREE.MathUtils.clamp(cameraPitch+aimKick,-.65,.82);
  const target=new THREE.Vector3(player.x,player.y+1.33,player.z),cp=Math.cos(viewPitch),cameraForward=new THREE.Vector3(Math.sin(cameraYaw)*cp,Math.sin(viewPitch),-Math.cos(cameraYaw)*cp);
  if(cameraMode==='first'){const eye=new THREE.Vector3(player.x,player.y+2.08,player.z).addScaledVector(cameraForward,.08);camera.position.lerp(eye,1-Math.exp(-dt*22));camera.lookAt(eye.clone().addScaledVector(cameraForward,24))}
  else{const cameraDistance=THREE.MathUtils.lerp(8.2,4.1,aimBlend),shoulder=aimBlend*.48,behind=new THREE.Vector3(-Math.sin(cameraYaw)*cameraDistance+Math.cos(cameraYaw)*shoulder,5.1-viewPitch*3.2-aimBlend*.58,Math.cos(cameraYaw)*cameraDistance+Math.sin(cameraYaw)*shoulder),wanted=target.clone().add(behind);camera.position.lerp(wanted,1-Math.exp(-dt*(6+aimBlend*5)));camera.lookAt(target.clone().addScaledVector(cameraForward,THREE.MathUtils.lerp(8.2,5.6,aimBlend)))}
  const moving=len>.08,recoil=playerModel.root.userData.recoil||0,reloadProgress=reloadDuration>0&&reloadLeft>0?1-reloadLeft/reloadDuration:0;
  if(fpViewModel){const bob=moving?Math.sin(t*9)*.009:Math.sin(t*1.7)*.002,step=moving?Math.abs(Math.sin(t*9))*.009:0;fpViewModel.visible=cameraMode==='first';fpViewModel.scale.set(THREE.MathUtils.clamp(camera.aspect/1.45,.32,1),1,1);fpViewModel.position.set(bob,-.008-step,0);fpViewModel.rotation.set(0,moving?Math.sin(t*4.5)*.01:0,moving?Math.sin(t*4.5)*.008:0);if(fpWeaponRoot){const reloadPulse=Math.sin(Math.PI*reloadProgress);fpWeaponRoot.rotation.x=-recoil*.08+reloadPulse*.34;fpWeaponRoot.position.y=-.22-reloadPulse*.12+recoil*.025}}
  camera.updateMatrixWorld(true);const aimTarget=aimPoint(),aimDx=aimTarget.x-player.x,aimDz=aimTarget.z-player.z,desiredYaw=Math.atan2(aimDx,-aimDz),desiredPitch=THREE.MathUtils.clamp(Math.asin(THREE.MathUtils.clamp(raycaster.ray.direction.y,-1,1)),-.72,.92);
  player.yaw=lerpAngle(player.yaw,desiredYaw,Math.min(1,dt*14));playerModel.root.rotation.y=lerpAngle(playerModel.root.rotation.y,-player.yaw,Math.min(1,dt*15));
  playerModel.visual.rotation.x=THREE.MathUtils.damp(playerModel.visual.rotation.x,0,14,dt);
  animateRig(playerModel,t,moving?Math.min(1,len):0,recoil,{reload:reloadProgress,throw:throwProgress});playerModel.root.userData.recoil=Math.max(0,recoil-dt*4.6);
  const weapon=weapons[state.selectedWeapon],bloomStride=Math.min(1,player.velocity.length()/(player.speed*1.35));
  const reticleGap=(4.5+weapon.spread*110+bloomStride*4.5+aimBloom*17+(fireHeld?1.2:0))*(1-aimBlend*.58),reticle=$('crosshair');
  reticle.style.setProperty('--reticle-gap',`${reticleGap.toFixed(1)}px`);
  reticle.style.setProperty('--reticle-left',`${(-reticleGap-6).toFixed(1)}px`);
  reticle.style.setProperty('--reticle-top',`${(-reticleGap-6).toFixed(1)}px`);
  reticle.style.setProperty('--reticle-scale',(1+bloomStride*.12+aimKick*1.5).toFixed(3));
  reticle.style.setProperty('--aim-x',`${aimScreen.x.toFixed(1)}px`);reticle.style.setProperty('--aim-y',`${aimScreen.y.toFixed(1)}px`);
  if(fireHeld)shoot();
}
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t}
function animateRig(part,t,moving=0,recoil=0,actions={}){
  if(part.code==='harvester'){
    const stride=Math.sin(t*5.2+part.phase)*moving;part.visual.position.y=Math.sin(t*2.7+part.phase)*.09+Math.abs(stride)*.12;part.visual.rotation.z=Math.sin(t*1.35+part.phase)*.035+stride*.035;part.body.rotation.x=Math.sin(t*1.7+part.phase)*.035;part.head.rotation.z=Math.sin(t*1.9+part.phase)*.06;part.core.scale.setScalar(1+Math.sin(t*4.1)*.12);part.coreCage.rotation.z=Math.sin(t*1.8)*.1;
    part.legs.forEach((leg,i)=>{leg.rotation.x=Math.sin(t*5.2+part.phase+i*Math.PI)*.16*moving;leg.rotation.z=(i===0?-.12:.12)+stride*.05});
    const age=part.attackPose?t-part.attackPose.start:99,active=age>=0&&age<.92;part.arms.forEach((arm,i)=>{const side=i===0?-1:1,wind=active?Math.sin(Math.min(1,age/.92)*Math.PI):0;arm.rotation.x=-.06+stride*.07;arm.rotation.z=-side*.48+side*wind*.5});
    part.scythes.forEach((blade,i)=>{const side=i===0?-1:1,wind=active?Math.sin(Math.min(1,age/.92)*Math.PI):0;blade.rotation.z=blade.userData.restRotation-side*wind*1.25});part.jaw.position.y=3.08-(active?Math.sin(Math.min(1,age/.92)*Math.PI)*.28:Math.max(0,Math.sin(t*1.6+part.phase))*.04);return;
  }
  const gait=t*(3.5+moving*4.5)+part.phase;part.legs.forEach((leg,i)=>{const step=Math.sin(gait+i*Math.PI),lift=Math.max(0,step)*moving;leg.rotation.x=step*.38*moving;leg.position.y=leg.userData.baseY+lift*.045;if(leg.userData.lowerLeg)leg.userData.lowerLeg.rotation.x=Math.max(0,-step)*.72*moving});
  const right=part.arms[0],left=part.arms[1],reloadPulse=Math.sin(Math.PI*THREE.MathUtils.clamp(actions.reload||0,0,1));
  left.rotation.x=-.7+Math.sin(t*8+part.phase+Math.PI)*.075*moving+recoil*.38+reloadPulse*.14;
  right.rotation.x=-.28+Math.sin(t*8+part.phase)*.12*moving-recoil*.08;right.rotation.z=0;
  if(actions.reload>0){right.rotation.x-=reloadPulse*1.02;right.rotation.z=-reloadPulse*.24}
  if(actions.throw>=0){const p=actions.throw;if(p<.38)right.rotation.x=THREE.MathUtils.lerp(-.48,-2.12,THREE.MathUtils.smoothstep(p/.38,0,1));else if(p<.62)right.rotation.x=THREE.MathUtils.lerp(-2.12,-.12,THREE.MathUtils.smoothstep((p-.38)/.24,0,1));else right.rotation.x=-.12+Math.sin((p-.62)*Math.PI)*.1;right.rotation.z=-.1;if(part.heldGrenade)part.heldGrenade.visible=p<.4}
  else if(part.heldGrenade)part.heldGrenade.visible=false;
  if(part.gun){part.gun.rotation.x=-recoil*.12+reloadPulse*.16;part.gun.position.y=-.62+recoil*.045+reloadPulse*.025}
  if(part.body&&part.code!=='harvester'){part.body.position.y=1.38+Math.abs(Math.sin(gait*2))*.025*moving;part.body.rotation.x=-moving*.045-recoil*.035+reloadPulse*.025}
}

function animateHit(e,dt){if(e.root.userData.hitReact>0){e.root.userData.hitReact=Math.max(0,e.root.userData.hitReact-dt);const strength=e.root.userData.hitReact/.14,impulse=e.root.userData.hitDirection||new THREE.Vector3();e.root.rotation.z=-impulse.x*.035*strength;e.body.rotation.x=-.045*strength}else{e.root.rotation.z=THREE.MathUtils.damp(e.root.rotation.z,0,12,dt);e.body.rotation.x=THREE.MathUtils.damp(e.body.rotation.x,0,12,dt)}}

function spawnBossRing(position,color,radius=9,duration=1.3){
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.88,depthWrite:false,toneMapped:false}),ring=addMesh(world,torusGeo(1,.085),mat,[position.x,heightAt(position.x,position.z)+.16,position.z],[.18,.18,.18],false);
  ring.rotation.x=Math.PI/2;effects.push({mesh:ring,life:duration,max:duration,kind:'bossPulse',targetScale:radius});
}
function startDiagnosFinalPhase(e){
  if(e.diagnosFinalForm)return;e.diagnosFinalForm=true;e.bossPhase=3;e.nextDiagnosMeteor=e.bossElapsed+1.4;e.nextDiagnosSkill=e.bossElapsed+.85;tintBoss(e,3);
  scene.background=new THREE.Color(0x020104);if(scene.fog){scene.fog.color.set(0x16050a);scene.fog.near=32;scene.fog.far=126}
  sceneLights.traverse(light=>{if(light.isHemisphereLight)light.intensity=.52;else if(light.isDirectionalLight)light.intensity=.82});
  spawnBossRing(e.root.position,0xff1627,42,2.4);spawnBossRing(e.root.position,0x8d0617,31,1.8);spawnBossEmbers(e,0xff2028,54);spawnLightningStrike({x:e.root.position.x,z:e.root.position.z},0xff1627);spawnLightningStrike({x:e.root.position.x+12,z:e.root.position.z-8},0xff4a20);tone(34,1.2,'sawtooth',.16);tone(51,.95,'triangle',.12);notify('DIAGNOS — KIZIL KIYAMET FAZI');
}
function restoreMapAtmosphere(){if(state.map!==29)return;const mood=atmospheres[maps[state.map].theme]||atmospheres.grass;scene.background=skyTexture||new THREE.Color(mood.sky);if(scene.fog){scene.fog.color.set(mood.sky);scene.fog.near=58;scene.fog.far=142}sceneLights.traverse(light=>{if(light.isHemisphereLight)light.intensity=mood.hemi;else if(light.isDirectionalLight)light.intensity=mood.sun})}
function createDiagnosMeteor(from,direction){
  const g=new THREE.Group();addSphere(g,[0,0,0],[.36,.42,.36],0x28060b,{geometry:smallSphereGeo,emissive:0xdf170f,emissiveIntensity:1.8,roughness:.45,cast:false});
  const tail=addCone(g,[0,0,-.52],.24,1.2,0xff4a15,{emissive:0xff2708,emissiveIntensity:1.7,roughness:.34,radial:7,cast:false});tail.rotation.x=-Math.PI/2;
  const hot=addCone(g,[0,0,-.86],.12,.76,0xffba36,{emissive:0xff6b13,emissiveIntensity:1.5,roughness:.3,radial:6,cast:false});hot.rotation.x=-Math.PI/2;world.add(g);g.position.copy(from);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);
  return g;
}
function queueDiagnosMeteorRain(e,count=7){
  for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=2+Math.sqrt(Math.random())*15,x=THREE.MathUtils.clamp(player.x+Math.cos(a)*r,-153,153),z=THREE.MathUtils.clamp(player.z+Math.sin(a)*r,-153,153),left=.72+Math.random()*.72; e.diagnosWarnings.push({x,z,left,radius:3.65,damage:39,kind:'meteor'});spawnBossRing({x,z},i%3?0xff3024:0xffa332,3.9,left+.35)}
  tone(49,.5,'sawtooth',.09);
}
function launchDiagnosMeteor(w){
  const from=new THREE.Vector3(w.x+(Math.random()-.5)*5,39+Math.random()*10,w.z+(Math.random()-.5)*5),target=new THREE.Vector3(w.x,heightAt(w.x,w.z)+.2,w.z),dir=target.clone().sub(from).normalize(),mesh=createDiagnosMeteor(from,dir);
  projectiles.push({mesh,pos:from,prev:from.clone(),dir,velocity:29+Math.random()*3,damage:w.damage||39,life:2.6,from:'enemy',bossShot:true,meteor:true,homing:.52,impactRadius:w.radius||3.65});
}
function spawnBossEmbers(e,color,count=12){
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,r=.6+Math.random()*2.5,pos=new THREE.Vector3(e.root.position.x+Math.cos(a)*r,e.root.position.y+1.5+Math.random()*Math.min(8,e.bossBaseScale*.7),e.root.position.z+Math.sin(a)*r),mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false,toneMapped:false}),mesh=addMesh(world,smallSphereGeo,mat,pos.toArray(),[.14+Math.random()*.17,.14+Math.random()*.17,.14+Math.random()*.17],false);
    effects.push({mesh,life:.75+Math.random()*.6,max:1.35,kind:'bossEmber',velocity:new THREE.Vector3((Math.random()-.5)*5,2+Math.random()*6,(Math.random()-.5)*5)});
  }
}
function tintBoss(e,phase){
  if(!e.phaseMaterials){const clones=new Map();e.root.traverse(o=>{if(!o.isMesh||!o.material)return;const copy=m=>{if(!clones.has(m)){const c=m.clone();c.userData.phaseBaseColor=c.color?.clone();c.userData.phaseBaseEmissive=c.emissive?.clone();clones.set(m,c)}return clones.get(m)};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material)});e.phaseMaterials=[...clones.values()]}
  const tint=phase===3?0x10050a:[0x8e1734,0x7441df,0xff552d][phase]||0x8e1734,blend=phase===0?0:phase===3?.88:.42,emissiveTint=phase===3?0x9d081b:tint;
  for(const m of e.phaseMaterials){if(m.color&&m.userData.phaseBaseColor)m.color.copy(m.userData.phaseBaseColor).lerp(new THREE.Color(tint),blend);if(m.emissive&&m.userData.phaseBaseEmissive)m.emissive.copy(m.userData.phaseBaseEmissive).lerp(new THREE.Color(emissiveTint),phase===0?0:phase===3?.92:.32);if('emissiveIntensity'in m)m.emissiveIntensity=Math.max(m.userData.phaseBaseEmissiveIntensity||0,phase===0?0:phase===3?.95:.18)}
}
function spawnLightningStrike(target,color=0xe7fbff){
  const x=target.x,z=target.z,ground=heightAt(x,z),points=[];for(let i=0;i<=8;i++){const spread=i===0||i===8?0:(Math.random()-.5)*4.2;points.push(new THREE.Vector3(x+spread,ground+44-i*5.35,z+(i===0||i===8?0:(Math.random()-.5)*3.2)))}
  const bolt=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity:.98,depthTest:false,toneMapped:false}));bolt.frustumCulled=false;world.add(bolt);effects.push({mesh:bolt,life:.38,max:.38,kind:'lightning'});
  for(const index of [2,5]){const start=points[index],end=new THREE.Vector3(x+(Math.random()-.5)*7,ground+7+Math.random()*8,z+(Math.random()-.5)*7),branch=new THREE.Line(new THREE.BufferGeometry().setFromPoints([start.clone(),start.clone().lerp(end,.45).add(new THREE.Vector3((Math.random()-.5)*2,0,(Math.random()-.5)*2)),end]),new THREE.LineBasicMaterial({color:0xb9eaff,transparent:true,opacity:.8,depthTest:false,toneMapped:false}));branch.frustumCulled=false;world.add(branch);effects.push({mesh:branch,life:.24,max:.24,kind:'lightning'})}
  spawnBossRing({x,z},color,5,.65);const flash=new THREE.PointLight(color,15,34,2);flash.position.set(x,ground+2,z);world.add(flash);effects.push({mesh:flash,life:.3,max:.3,kind:'lightningLight'});
}
function queueCardinalLightning(e,delay=.78,damage=26,color=0xe7fbff,offset=0){const x=THREE.MathUtils.clamp(player.x+player.velocity.x*.62+offset,-158,158),z=THREE.MathUtils.clamp(player.z+player.velocity.z*.62-offset*.55,-158,158);spawnBossRing({x,z},color,3.4,delay+.32);e.lightningQueue.push({x,z,delay,damage,color})}
function updateCardinalAbilities(e,dt){if(e.bossPhase>0&&e.bossElapsed>=e.nextLightningAt){const hard=e.bossPhase>=2;queueCardinalLightning(e,.78,hard?34:25,hard?0xff8d50:0xbcecff,hard?-2:0);if(hard)queueCardinalLightning(e,1.02,34,0xff8d50,3.5);e.nextLightningAt=e.bossElapsed+(hard?5.2:8.4)}for(let i=e.lightningQueue.length-1;i>=0;i--){const strike=e.lightningQueue[i];strike.delay-=dt;if(strike.delay>0)continue;spawnLightningStrike(strike,strike.color);if(Math.hypot(player.x-strike.x,player.z-strike.z)<3.35)bossDamagePlayer('kardinal',strike.damage);e.lightningQueue.splice(i,1)}}
function updateDiagnosAbilities(e,dt){
  if(e.diagnosFinalForm&&e.bossElapsed>=e.nextDiagnosMeteor){queueDiagnosMeteorRain(e,e.diagnosMeteorWaves===0?9:7);e.diagnosMeteorWaves=(e.diagnosMeteorWaves||0)+1;e.nextDiagnosMeteor=e.bossElapsed+8.2}
  if(e.bossElapsed>=e.nextDiagnosSkill){const skill=e.diagnosSkill++%4;e.nextDiagnosSkill=e.bossElapsed+([8.5,11,13,16][skill]);
    if(skill===0){const color=e.diagnosFinalForm?0xff3024:0x78ffbd;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+e.bossElapsed*.3,x=THREE.MathUtils.clamp(player.x+Math.cos(a)*7,-155,155),z=THREE.MathUtils.clamp(player.z+Math.sin(a)*7,-155,155);e.diagnosWarnings.push({x,z,left:.95,radius:3.2,damage:30});spawnBossRing({x,z},color,3.5,1.15)}notify('DIAGNOS · RUH DÜĞÜMLERİ')}
    else if(skill===1){bossFire(e);bossMissileBarrage(e,3);notify('DIAGNOS · GÜDÜMLÜ RUH FÜZELERİ')}
    else if(skill===2){const x=THREE.MathUtils.clamp(player.x+player.velocity.x*1.2,-150,150),z=THREE.MathUtils.clamp(player.z+player.velocity.z*1.2,-150,150);e.diagnosWarnings.push({x,z,left:1.3,radius:8,damage:42});spawnBossRing({x,z},e.diagnosFinalForm?0xff4226:0xb8ffdf,8,1.5);notify('DIAGNOS · BOYUTSAL YARIK')}
    else{const burst=spawnBossRing(e.root.position,e.diagnosFinalForm?0xff3024:0xc5a0ff,24,1.4);for(const other of enemies)if(!other.boss&&!other.dead&&Math.hypot(other.root.position.x-e.root.position.x,other.root.position.z-e.root.position.z)<25)other.root.userData.stunTimer=2.2;e.nextLightningAt=Math.min(e.nextLightningAt,e.bossElapsed+.4);notify('DIAGNOS · ZAMAN KIRILMASI');tone(42,.8,'sawtooth',.14)}
  }
  for(let i=e.diagnosWarnings.length-1;i>=0;i--){const w=e.diagnosWarnings[i];w.left-=dt;if(w.left<=0){if(w.kind==='meteor')launchDiagnosMeteor(w);else{const danger=e.diagnosFinalForm?0xff2b21:0x9cffce;spawnLightningStrike(w,danger);if(Math.hypot(player.x-w.x,player.z-w.z)<w.radius)bossDamagePlayer('diagnos',w.damage)}e.diagnosWarnings.splice(i,1)}}
}
function startBossJump(e){
  const dx=player.x-e.root.position.x,dz=player.z-e.root.position.z,d=Math.hypot(dx,dz)||1,ux=dx/d,uz=dz/d,landingGap=e.code==='kardinal'?(e.bossPhase>=2?4.9:5.8):2.7;
  const targetX=THREE.MathUtils.clamp(player.x-ux*landingGap,-150,150),targetZ=THREE.MathUtils.clamp(player.z-uz*landingGap,-150,150);
  e.jump={elapsed:0,duration:e.code==='kardinal'?.95:1.55,fromX:e.root.position.x,fromZ:e.root.position.z,toX:targetX,toZ:targetZ,landed:false};e.nextJumpAt=e.bossElapsed+(e.code==='kardinal'?(e.bossPhase>=2?6.2:8.4):12);
  const warning={x:targetX,z:targetZ};spawnBossRing(warning,0xffb44b,e.code==='kardinal'?4.6:2.7,1.15);tone(74,.22,'sawtooth',.08);
}
function updateBossJump(e,dt){
  const j=e.jump;if(!j)return false;j.elapsed=Math.min(j.duration,j.elapsed+dt);const p=j.elapsed/j.duration,ease=p*p*(3-2*p);
  e.root.position.x=THREE.MathUtils.lerp(j.fromX,j.toX,ease);e.root.position.z=THREE.MathUtils.lerp(j.fromZ,j.toZ,ease);e.root.position.y=heightAt(e.root.position.x,e.root.position.z)+Math.sin(Math.PI*p)*(e.code==='kardinal'?7.2:3.5);
  if(p>=1){j.landed=true;e.root.position.y=heightAt(e.root.position.x,e.root.position.z);spawnBossRing(e.root.position,e.code==='kardinal'?0xff492d:0xffa848,e.code==='kardinal'?14:6,.92);spawnBossEmbers(e,e.code==='kardinal'?0xff6237:0xffd176,e.code==='kardinal'?32:12);const impactDistance=Math.hypot(player.x-e.root.position.x,player.z-e.root.position.z);if(impactDistance<(e.code==='kardinal'?(e.bossPhase>=2?9.4:8.4):5.4))bossDamagePlayer(e.code,e.code==='kardinal'?(e.bossPhase>=2?34:28):16);e.jump=null;return false}
  return true;
}
function startBossPhase(e,phase){
  e.bossPhase=phase;tintBoss(e,phase);const color=phase===1?0xa14dff:0xff542e;spawnBossRing(e.root.position,color,phase===1?18:23,1.8);spawnBossEmbers(e,color,phase===1?18:24);queueCardinalLightning(e,.82,phase===1?28:38,phase===1?0xbdeaff:0xff8d50);e.nextLightningAt=e.bossElapsed+(phase===1?8.4:6.8);tone(phase===1?48:36,.9,'sawtooth',.12);
  notify(phase===1?'KARDİNAL FAZ DEĞİŞTİ — FÜZE YAĞMURU!':'KARDİNAL SON FAZDA — YILDIRIMLAR VE SIÇRAYIŞLAR!');bossMissileBarrage(e,phase===1?3:4);startBossJump(e);
}
function triggerHarvesterEclipse(){harvesterSkyDark=true;scene.background=new THREE.Color(0x030506);scene.fog.color.setHex(0x050807);tone(34,1.8,'sawtooth',.16)}
function detonateHarvesterCharge(x,z,radius,damage,atomic=false){
  if(atomic)triggerHarvesterEclipse(8);
  const ground=heightAt(x,z),color=atomic?0xffbb45:0xff6428;
  spawnBossRing({x,z},color,radius*(atomic?1.7:1.2),atomic?3.1:1.6);
  const flashMat=new THREE.MeshBasicMaterial({color:atomic?0xffd36a:0xff6129,transparent:true,opacity:.92,depthWrite:false,toneMapped:false}),flash=addMesh(world,sphereGeo,flashMat,[x,ground+2,z],[.2,.2,.2],false);
  effects.push({mesh:flash,life:atomic?2.1:1.05,max:atomic?2.1:1.05,kind:'blast',targetScale:atomic?radius*1.45:radius*.72});
  const ringMat=new THREE.MeshBasicMaterial({color:atomic?0xffdc76:0xff7a34,transparent:true,opacity:.95,depthWrite:false,toneMapped:false}),ring=addMesh(world,torusGeo(1,.065),ringMat,[x,ground+.12,z],[.12,.12,.12],false);ring.rotation.x=Math.PI/2;effects.push({mesh:ring,life:atomic?2.8:1.25,max:atomic?2.8:1.25,kind:'blastRing',targetScale:radius*1.8});
  const smokeCount=atomic?13:5;for(let i=0;i<smokeCount;i++){const a=i*Math.PI*2/smokeCount,cap=atomic&&i>7,smokeMat=new THREE.MeshBasicMaterial({color:cap?0x4b3830:atomic?0x6d4932:0x594331,transparent:true,opacity:.62,depthWrite:false,toneMapped:false}),smoke=addMesh(world,sphereGeo,smokeMat,[x+Math.cos(a)*(cap?3.8:.7),ground+(cap?8+i%3:1.2+i%4*1.2),z+Math.sin(a)*(cap?3.8:.7)],[.24,.24,.24],false);effects.push({mesh:smoke,life:atomic?4.8:2.1,max:atomic?4.8:2.1,kind:'blastSmoke',targetScale:cap?7.5:atomic?5.5:2.8,rise:atomic?2.4:1.1})}
  const light=new THREE.PointLight(0xffa536,atomic?42:22,atomic?105:42,1.35);light.position.set(x,ground+5,z);world.add(light);effects.push({mesh:light,life:atomic?1.35:.62,max:atomic?1.35:.62,kind:'blastLight',power:atomic?42:22});
  const distance=Math.hypot(player.x-x,player.z-z);if(distance<radius)bossDamagePlayer('harvester',damage*(1-distance/radius*.42));tone(atomic?29:46,atomic?2.1:.85,'sawtooth',atomic?.27:.18);tone(atomic?54:82,atomic?1.5:.48,'triangle',atomic?.2:.1);
}
function updateHarvesterAbilities(e,dt){
  if(e.bossElapsed>=e.nextHarvesterMissiles){e.nextHarvesterMissiles=e.bossElapsed+10.5;bossMissileBarrage(e,6);tone(78,.35,'sawtooth',.1)}
  if(e.bossElapsed>=e.nextHarvesterSlam){e.nextHarvesterSlam=e.bossElapsed+22;const x=THREE.MathUtils.clamp(player.x+player.velocity.x*.7,-158,158),z=THREE.MathUtils.clamp(player.z+player.velocity.z*.7,-158,158);e.harvesterCharges.push({x,z,left:1.55,radius:13,damage:70});spawnBossRing({x,z},0xff802a,10,1.7);tone(62,.5,'sawtooth',.11)}
  if(e.bossElapsed>=e.nextHarvesterShock){e.nextHarvesterShock=e.bossElapsed+17;for(let i=0;i<3;i++){const a=i*Math.PI*2/3+e.bossElapsed*.23,x=THREE.MathUtils.clamp(e.root.position.x+Math.cos(a)*11,-158,158),z=THREE.MathUtils.clamp(e.root.position.z+Math.sin(a)*11,-158,158);e.harvesterCharges.push({x,z,left:.95+i*.2,radius:6.5,damage:34});spawnBossRing({x,z},0xffd35c,5,.95)}notify('HASAT DALGASI YAKLAŞIYOR')}
  if(e.bossElapsed>=e.nextHarvesterCharge){e.nextHarvesterCharge=e.bossElapsed+20;const dx=player.x-e.root.position.x,dz=player.z-e.root.position.z,d=Math.hypot(dx,dz)||1;e.harvesterDash={fromX:e.root.position.x,fromZ:e.root.position.z,toX:THREE.MathUtils.clamp(player.x-dx/d*5,-150,150),toZ:THREE.MathUtils.clamp(player.z-dz/d*5,-150,150),elapsed:0,duration:1.15};e.attackPose={start:performance.now()/1000};spawnBossRing(player,0xff6b2e,5,1.25);notify('BIÇAKLI HÜCUM!')}
  if(e.harvesterDash){const dash=e.harvesterDash;dash.elapsed+=dt;const p=Math.min(1,dash.elapsed/dash.duration),ease=p*p*(3-2*p);e.root.position.x=THREE.MathUtils.lerp(dash.fromX,dash.toX,ease);e.root.position.z=THREE.MathUtils.lerp(dash.fromZ,dash.toZ,ease);if(p>=1){if(Math.hypot(player.x-e.root.position.x,player.z-e.root.position.z)<6.5)bossDamagePlayer('harvester',42);e.harvesterDash=null}}
  for(let i=e.harvesterCharges.length-1;i>=0;i--){const charge=e.harvesterCharges[i];charge.left-=dt;if(charge.left<=0){detonateHarvesterCharge(charge.x,charge.z,charge.radius,charge.damage,false);e.harvesterCharges.splice(i,1)}}
}
function startHarvesterPhase(e,phase){
  e.harvesterPhase=phase;e.bossPhase=phase;tintBoss(e,phase);const color=phase===1?0x8c43ff:0x39e4ff;
  spawnBossRing(e.root.position,color,phase===1?28:38,2.6);spawnBossEmbers(e,color,phase===1?36:58);spawnLightningStrike({x:e.root.position.x,z:e.root.position.z},color);bossMissileBarrage(e,phase===1?7:9);
  if(phase===2){for(let i=0;i<4;i++){const a=i*Math.PI/2+e.bossElapsed*.18,x=THREE.MathUtils.clamp(player.x+Math.cos(a)*9,-155,155),z=THREE.MathUtils.clamp(player.z+Math.sin(a)*9,-155,155);e.harvesterCharges.push({x,z,left:.82+i*.12,radius:7.5,damage:36});spawnBossRing({x,z},0x48e9ff,6,1.3)}}
  tone(phase===1?42:30,1.2,'sawtooth',.16);notify(phase===1?'BLOOD HARVESTER · RUH ALEVİ FAZI':'BLOOD HARVESTER · FIRTINA FAZI');
}
function updateBossAction(e,dt){
  e.bossElapsed+=dt;
  if(e.code==='diagnos'&&!e.diagnosFinalForm&&e.bossElapsed>=52.5)startDiagnosFinalPhase(e);
  if(e.code==='harvester'&&e.harvesterPhase<2&&e.bossElapsed>=e.nextHarvesterPhase){startHarvesterPhase(e,e.harvesterPhase+1);e.nextHarvesterPhase=e.harvesterPhase===1?76:Infinity}
  if(e.code==='harvester'&&!e.nukeWarningStarted&&e.bossElapsed>=60.5){e.nukeWarningStarted=true;const x=THREE.MathUtils.clamp(player.x+player.velocity.x*.55,-150,150),z=THREE.MathUtils.clamp(player.z+player.velocity.z*.55,-150,150);e.nukeTarget={x,z};spawnBossRing({x,z},0xffcf55,36,3.2);spawnBossEmbers(e,0xffc151,18);notify('ATOM ÇEKİRDEĞİ KRİTİK — PATLAMA 3 SANİYE!')}
  if(e.code==='harvester'&&!e.firstBlastDone&&e.bossElapsed>=63.5){e.firstBlastDone=true;const target=e.nukeTarget||{x:player.x+player.velocity.x*.55,z:player.z+player.velocity.z*.55};detonateHarvesterCharge(target.x,target.z,36,175,true);spawnBossEmbers(e,0xffc151,38);notify('ATOM HASADI — KIYAMET PATLAMASI!')}
  if(!e.entryEffectStarted){e.entryEffectStarted=true;e.bossY=e.root.position.y;e.entryZ=e.root.position.z;if(e.code==='harvester'){e.root.position.z-=42;e.entryZ=e.root.position.z;spawnBossRing(e.root.position,0xffbd3f,30,3);spawnBossRing(e.root.position,0xffec8a,42,3.8);spawnBossEmbers(e,0xffa52e,42);spawnLightningStrike({x:e.root.position.x,z:e.root.position.z},0xffd876);spawnLightningStrike({x:e.root.position.x-7,z:e.root.position.z-3},0xff8f3c);tone(38,1.1,'sawtooth',.16);tone(54,.9,'triangle',.1)}else{spawnBossRing(e.root.position,0xff354e,20,2.2);spawnBossEmbers(e,0xff4357,20)}}
  if(e.introRemaining>0){e.introRemaining=Math.max(0,e.introRemaining-dt);const p=1-e.introRemaining/e.introDuration,ease=p*p*(3-2*p);e.root.scale.setScalar(e.bossBaseScale*(1-Math.pow(1-p,3)));e.root.position.y=e.bossY+Math.sin(Math.PI*p)*(e.code==='harvester'?3.8:2.5);if(e.code==='harvester'){e.root.position.z=THREE.MathUtils.lerp(e.entryZ,-23,ease);if(frame%18===0&&p>.12)spawnBossEmbers(e,0xd1a34b,2)}if(e.introRemaining===0){e.root.scale.setScalar(e.bossBaseScale);e.root.position.y=e.bossY;e.root.position.z=-23;notify(e.code==='harvester'?'ATOM HASATÇISI TARLAYA İNDİ':'KARDİNAL ARENAYA İNDİ');e.nextJumpAt=e.bossElapsed+9}return true}
  if(e.code==='harvester')updateHarvesterAbilities(e,dt);
  if(e.code==='diagnos')updateDiagnosAbilities(e,dt);
  if(e.code==='kardinal'){const phaseTimes=[46.5,109]; // 109 seconds is 1:49 on the encounter clock.
    while(e.bossPhase<phaseTimes.length&&e.bossElapsed>=phaseTimes[e.bossPhase])startBossPhase(e,e.bossPhase+1);updateCardinalAbilities(e,dt)}
  if(e.jump&&updateBossJump(e,dt))return true;
    if(e.code==='kardinal'&&e.bossPhase>0&&e.bossElapsed>=e.nextJumpAt){startBossJump(e);if(updateBossJump(e,dt))return true}
  return false;
}
function updateBossDeath(e,dt){
  const a=e.deathAnimation;if(!a)return;a.elapsed=Math.min(a.duration,a.elapsed+dt);const p=a.elapsed/a.duration;
  const ease=THREE.MathUtils.smoothstep(p,0,1),lift=a.scale*(e.code==='harvester'?1.55:.48);e.root.rotation.set(a.pitch*ease,a.yaw,a.roll*ease);e.root.position.y=a.y+lift*ease+Math.sin(p*Math.PI)*.45;if(e.code==='harvester'&&frame%7===0&&p<.94)spawnBossEmbers(e,p<.55?0xffa83e:0x8c43ff,6);
  if(p>.68&&!a.finalBurst){a.finalBurst=true;spawnBossRing(e.root.position,e.code==='kardinal'?0xff5735:e.code==='harvester'?0xffc13a:0xd5ff91,e.code==='harvester'?29:17,e.code==='harvester'?2.2:1.4);spawnBossEmbers(e,e.code==='kardinal'?0xff7544:e.code==='harvester'?0xffd158:0xa8e887,e.code==='harvester'?96:32);tone(e.code==='harvester'?31:42,e.code==='harvester'?1.25:.75,'triangle',e.code==='harvester'?.17:.11)}
  if(p>=1){setBossCorpsePose(e,state.bossCorpses[state.map]);saveGame();updateHud();if(e.code==='diagnos'&&!e.rewardShown){e.rewardShown=true;showDiagnosReward()}}
}

function updateEnemies(dt,t){
  if(onlineMatchActive)return;
  spawnClock-=dt;if(spawnClock<=0&&!bossMapIndexes.has(state.map)&&enemies.filter(e=>!e.dead).length<enemyCap()){spawnEnemy();spawnClock=state.map>=20?2:2.2}
  for(const e of enemies){if(e.dead){if(e.boss)updateBossDeath(e,dt);else updateEnemyDeath(e,dt);continue}e.hit=Math.max(0,e.hit-dt);const pos=e.root.position,fromX=pos.x,fromZ=pos.z;let dx=player.x-pos.x,dz=player.z-pos.z,dist=Math.hypot(dx,dz)||.001,vx=dx/dist,vz=dz/dist;
    const ranged=e.kind==='rifle'||e.kind==='spitter';const boss=e.boss,desiredRange=boss?(e.code==='kardinal'?7.2:e.code==='harvester'?7:5):ranged?(e.kind==='spitter'?9:12):1.2,bossBusy=boss?updateBossAction(e,dt):false,bossReady=!boss||e.introRemaining<=0;
    if(!bossBusy&&dist>desiredRange){const speed=e.speed*(boss&&e.hp<e.maxHp*.35?1.36:1);pos.x+=vx*speed*dt;pos.z+=vz*speed*dt;if(isBlocked(pos.x,pos.z,e.radius)){pos.x-=vz*speed*dt*.8;pos.z+=vx*speed*dt*.8}}
    const stun=e.root.userData.stunTimer||0;if(stun>0){e.root.userData.stunTimer=Math.max(0,stun-dt);if(!boss)pos.x=fromX,pos.z=fromZ}
    pos.x=THREE.MathUtils.clamp(pos.x,-160,160);pos.z=THREE.MathUtils.clamp(pos.z,-160,160);if(!bossBusy&&!boss)resolveEnemyCollision(e,fromX,fromZ);if(!bossBusy)pos.y=heightAt(pos.x,pos.z)+(e.kind==='crawler'?.03:0);
    dx=player.x-pos.x;dz=player.z-pos.z;dist=Math.hypot(dx,dz)||.001;e.root.rotation.y=lerpAngle(e.root.rotation.y,Math.atan2(-dx,-dz),Math.min(1,dt*8));animateRig(e,t,dist>desiredRange?.75:.12,0);
    animateHit(e,dt);
    if((!ranged&&!boss)&&dist<1.38&&t>e.attackAt){e.attackAt=t+1.6;damagePlayer(e.kind==='brute'?9:e.kind==='crawler'?3:5)}
    if(ranged&&dist<23&&dist>5&&t>e.shotAt){e.shotAt=t+(2.2+Math.random()*.9);enemyFire(e)}
    if(boss&&bossReady&&!bossBusy){if(dist<(e.code==='kardinal'?7.4:e.code==='harvester'?6.2:4)&&t>e.attackAt){e.attackAt=t+(e.hp<e.maxHp*.4?.85:1.2);bossDamagePlayer(e.code,e.code==='harvester'?55:e.code==='kardinal'?(e.bossPhase>=2?31:24):22);bossSwipe(e)}else if(t>e.shotAt&&dist>(e.code==='kardinal'?7:e.code==='harvester'?6.5:4)){e.shotAt=t+(e.code==='kardinal'&&e.bossPhase>=2?1.25:e.code==='kardinal'&&e.bossPhase===1?1.6:e.code==='harvester'?(e.hp<e.maxHp*.4?1.8:2.6):e.hp<e.maxHp*.4?1.25:2.1);if(e.code==='kardinal'&&e.bossPhase>0)bossMissileBarrage(e,e.bossPhase>=2?3:2);else bossFire(e)}}
  }
}
function enemyFire(e){const acid=e.kind==='spitter',color=acid?0x9eff4d:0xff654f,from=e.root.position.clone().add(new THREE.Vector3(0,1.35,0)),target=new THREE.Vector3(player.x,player.y+1,player.z),dir=target.sub(from).normalize();const m=addSphere(world,from.toArray(),[acid?.16:.11,acid?.16:.11,acid?.16:.11],color,{geometry:smallSphereGeo,emissive:acid?0x65d522:0xff381f,emissiveIntensity:1.1,cast:false});projectiles.push({mesh:m,pos:from,prev:from.clone(),dir,velocity:acid?13:17,damage:(acid?7:9)+state.map*.35,life:3,from:'enemy'})}
function bossFire(e){if(e.code==='harvester'){e.attackPose={start:performance.now()/1000};bossMissileBarrage(e,3);return}if(e.code==='diagnos')bossMissileBarrage(e,2);const from=e.root.position.clone().add(new THREE.Vector3(0,e.code==='kardinal'?11:2,0)),target=new THREE.Vector3(player.x,player.y+1,player.z),dir=target.sub(from).normalize();for(let i=-1;i<=1;i++){const v=dir.clone().add(new THREE.Vector3(i*.11,0,0)).normalize(),color=e.code==='diagnos'?(e.diagnosFinalForm?0xff3823:0x74ffb2):0xff4e6a;const m=addSphere(world,from.toArray(),[.22,.22,.22],color,{geometry:smallSphereGeo,emissive:color,emissiveIntensity:1.3,cast:false});projectiles.push({mesh:m,pos:from.clone(),prev:from.clone(),dir:v,velocity:13,damage:e.code==='diagnos'?18:14,life:4,from:'enemy',bossShot:true})}}
function createBossMissile(position,direction,color){
  const g=new THREE.Group();world.add(g);const body=addCylinder(g,[0,0,0],.085,.12,.54,color,{metalness:.62,roughness:.32,emissive:color,emissiveIntensity:.48,radial:10});body.rotation.x=Math.PI/2;
  const nose=addCone(g,[0,0,.34],.12,.28,0xffd5a0,{metalness:.35,roughness:.25,emissive:color,emissiveIntensity:.85,radial:8});nose.rotation.x=Math.PI/2;
  for(const side of [-1,1]){const fin=addBox(g,[side*.12,0,-.19],[.2,.035,.2],0x2b1d26,{metalness:.58,roughness:.42});fin.rotation.y=side*.2}
  const glow=new THREE.PointLight(color,2.1,5,2);glow.position.set(0,0,-.34);g.add(glow);g.position.copy(position);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),direction);
  return g;
}
function bossMissileBarrage(e,count=3){
  const color=e.code==='harvester'?0xff641c:e.bossPhase>=2?0xff592e:0xa14dff,from=e.root.position.clone().add(new THREE.Vector3(0,e.code==='kardinal'?11:e.code==='harvester'?13:2,0));
  const target=new THREE.Vector3(player.x+player.velocity.x*.62,player.y+1,player.z+player.velocity.z*.62),base=target.sub(from).normalize();
  count=Math.min(count,Math.max(0,10-projectiles.filter(p=>p.bossShot).length));
  for(let i=0;i<count;i++){const spread=(i-(count-1)/2)*.115,dir=base.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread),mesh=createBossMissile(from,dir,color),rawDamage=e.code==='harvester'?48:e.code==='kardinal'?(e.bossPhase>=2?32:24):e.code==='diagnos'?28:24,damage=rawDamage*(e.code==='harvester'?.765:e.code==='kardinal'?.7:1);projectiles.push({mesh,pos:from.clone(),prev:from.clone(),dir,velocity:e.code==='harvester'?24:e.code==='diagnos'?24:e.bossPhase>=2?26:22,damage,life:8,from:'enemy',bossShot:true,homing:e.code==='harvester'?5.4:e.code==='diagnos'?4.4:e.bossPhase>=2?4.8:3.5})}
}
function bossSwipe(e){if(e.code==='harvester'){e.attackPose={start:performance.now()/1000};const slashMat=new THREE.MeshBasicMaterial({color:0xff6a24,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}),slash=addMesh(world,torusGeo(2.15,.13),slashMat,[player.x,player.y+1.15,player.z],[1.25,.72,1],false);slash.rotation.y=e.root.rotation.y;effects.push({mesh:slash,life:.42,max:.42,kind:'tracer'});return}const flash=addMesh(world,torusGeo(2.2,.08),material(e.code==='diagnos'?0x69ffa3:0xff5563,.3,.3,e.code==='diagnos'?0x20d77c:0xdc1232,.8),[player.x,player.y+.15,player.z],[1,1,1],false);flash.rotation.x=Math.PI/2;effects.push({mesh:flash,life:.35,max:.35,kind:'ring'})}
function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){const b=projectiles[i];b.prev.copy(b.pos);if(b.from==='grenade'){b.velocity.y-=b.gravity*dt;b.pos.addScaledVector(b.velocity,dt)}else{if(b.homing){const toPlayer=new THREE.Vector3(player.x-b.pos.x,player.y+1-b.pos.y,player.z-b.pos.z).normalize();b.dir.lerp(toPlayer,Math.min(1,b.homing*dt)).normalize()}b.pos.addScaledVector(b.dir,b.velocity*dt)}b.life-=dt;
    if(b.mesh){b.mesh.position.copy(b.pos);if(b.homing)b.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.dir);if(b.from==='grenade'){b.mesh.rotation.x+=dt*5.4;b.mesh.rotation.z+=dt*3.1}}let hit=false;
    if(b.from==='player'){
      const segment=b.pos.clone().sub(b.prev),d2=segment.lengthSq()||1;
      for(const e of enemies){if(e.dead)continue;const center=e.root.position.clone().add(new THREE.Vector3(0,1,0)),t=THREE.MathUtils.clamp(center.clone().sub(b.prev).dot(segment)/d2,0,1),closest=b.prev.clone().addScaledVector(segment,t);if(closest.distanceTo(center)<e.radius+.3){damageEnemy(e,b.damage,closest,b.dir.clone().negate());if(b.rocket)explodeAt(b.pos.clone(),6,b.damage*.72);hit=true;break}}
      if(!hit&&onlineOpponentModel&&onlineOpponent?.hp>0){const center=onlineOpponentModel.root.position.clone().add(new THREE.Vector3(0,1,0)),t=THREE.MathUtils.clamp(center.clone().sub(b.prev).dot(segment)/d2,0,1),closest=b.prev.clone().addScaledVector(segment,t);if(closest.distanceTo(center)<1.02){if(b.rocket)explodeAt(b.pos.clone(),6,b.damage*.72);else window.BBGameNet?.damageOpponent?.(b.damage);hit=true}}
    }else if(b.from==='grenade'){
      const segment=b.pos.clone().sub(b.prev),d2=segment.lengthSq()||1;
      for(const e of enemies){if(e.dead)continue;const center=e.root.position.clone().add(new THREE.Vector3(0,1,0)),t=THREE.MathUtils.clamp(center.clone().sub(b.prev).dot(segment)/d2,0,1),closest=b.prev.clone().addScaledVector(segment,t);if(closest.distanceTo(center)<e.radius+.28){detonateGrenade(b,center);hit=true;break}}
      if(!hit&&onlineOpponentModel&&onlineOpponent?.hp>0){const center=onlineOpponentModel.root.position.clone().add(new THREE.Vector3(0,1,0)),t=THREE.MathUtils.clamp(center.clone().sub(b.prev).dot(segment)/d2,0,1),closest=b.prev.clone().addScaledVector(segment,t);if(closest.distanceTo(center)<1.02){detonateGrenade(b,center);hit=true}}
      const ground=heightAt(b.pos.x,b.pos.z)+.22,outOfBounds=Math.abs(b.pos.x)>390||Math.abs(b.pos.z)>390||b.pos.y<-.5;
      if(!b.exploded&&(b.life<=0||b.pos.y<=ground||outOfBounds)){detonateGrenade(b);hit=true}
    }else if(b.from==='enemy'&&b.pos.distanceTo(new THREE.Vector3(player.x,player.y+1,player.z))<(b.meteor?1.45:b.bossShot?.9:.72)){damagePlayer(b.damage);if(b.bossShot)spawnBossRing(b.pos,b.meteor?0xff2a1c:0xff713f,b.meteor?7:4.4,b.meteor?.82:.48);hit=true}
    if(b.meteor&&!hit&&b.pos.y<=heightAt(b.pos.x,b.pos.z)+.62){const impact={x:b.pos.x,z:b.pos.z};spawnBossRing(impact,0xff3218,b.impactRadius*1.65,.9);spawnBossRing(impact,0xffb12f,b.impactRadius*.78,.58);if(Math.hypot(player.x-impact.x,player.z-impact.z)<b.impactRadius)bossDamagePlayer('diagnos',b.damage);hit=true}
    if(b.bossShot&&b.life<=0&&!hit)spawnBossRing(b.pos,0xff713f,3.2,.58);
    if(b.rocket&&b.life<=0&&!b.exploded){b.exploded=true;explodeAt(b.targetPoint||b.pos,6,b.damage*.68);hit=true}
    const outOfBounds=Math.abs(b.pos.x)>390||Math.abs(b.pos.z)>390||b.pos.y<-.5;
    if(b.from==='grenade'&&(hit||b.life<=0||outOfBounds)&&!b.exploded)detonateGrenade(b);
    if(b.life<=0||hit||outOfBounds){if(b.rocket&&!b.exploded)explodeAt(b.targetPoint||b.pos,6,b.damage*.68);world.remove(b.mesh);projectiles.splice(i,1)}
  }
}
function updatePickups(dt,t){for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.group.position.y=heightAt(p.x,p.z)+.48+Math.sin(t*3+p.phase)*.13;p.group.rotation.y+=dt*1.4;if(Math.hypot(player.x-p.x,player.z-p.z)<1.25){if(p.type==='cash')state.money+=p.amount;else if(p.type==='medkit'){state.hp=Math.min(state.maxHp,state.hp+28);state.kits=Math.min(20,state.kits+1)}else if(p.type==='ammo'){state.reserve+=Math.max(18,Math.floor(weapons[state.selectedWeapon].mag*.6));state.reserveByWeapon[state.selectedWeapon]=state.reserve}world.remove(p.group);pickups.splice(i,1);updateHud();saveGame();tone(620,.08,'triangle',.04)}}}
function updateEffects(dt){for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;const p=Math.max(0,e.life/e.max);if(e.kind==='bossPulse'){e.mesh.scale.setScalar(.18+(1-p)*e.targetScale);e.mesh.material.opacity=p*.88}else if(e.kind==='bossEmber'){e.velocity.y-=8*dt;e.mesh.position.addScaledVector(e.velocity,dt);e.mesh.scale.multiplyScalar(Math.max(.1,1-dt*1.1));e.mesh.material.opacity=p*.95}else if(e.kind==='blast'){e.mesh.scale.setScalar(.32+(1-p)*(e.targetScale||12));e.mesh.material.opacity=p*.92}else if(e.kind==='blastRing'){e.mesh.scale.setScalar(.4+(1-p)*(e.targetScale||5.8));e.mesh.material.opacity=p*.9}else if(e.kind==='hitSpark'){e.mesh.position.addScaledVector(e.velocity,dt);e.mesh.scale.setScalar(e.initialScale*(.2+p*.8))}else if(e.kind==='blastLight'||e.kind==='muzzleLight'){e.mesh.intensity=(e.power||(e.kind==='blastLight'?16:2.3))*p}else if(e.kind==='lightningLight'){e.mesh.intensity=15*p}else if(e.kind==='lightning'){e.mesh.material.opacity=p*.98}else if(e.kind==='blastSmoke'){e.mesh.scale.setScalar(.18+(1-p)*(e.targetScale||.5));e.mesh.position.y+=dt*(e.rise||.7);e.mesh.material.opacity=p*.54}else if(e.kind==='tracer'||e.kind==='muzzle'){e.mesh.material.opacity=p}else{e.mesh.scale.setScalar(1+(1-p)*.8);e.mesh.material.opacity=p*.8}if(e.life<=0){world.remove(e.mesh);if(e.mesh.geometry&&!geometryCacheHas(e.mesh.geometry))e.mesh.geometry.dispose();if(e.mesh.material&&!Array.from(materialCache.values()).includes(e.mesh.material))e.mesh.material.dispose();effects.splice(i,1)}}}
function useKit(){if(state.kits<=0||state.hp>=state.maxHp){notify('İLK YARDIM KİTİ KULLANILAMIYOR');return}state.kits--;state.hp=Math.min(state.maxHp,state.hp+45);updateHud();saveGame();tone(480,.16,'sine',.04);notify('CAN +45')}

function renderOnlineHud(){
  const scorePanel=$('vsScorePanel');document.querySelectorAll('#gameRoot .vsScorePanel').forEach((node,index)=>{if(index>0)node.remove()});if(!onlineMatchActive||!onlineMatchData){scorePanel.classList.add('hidden');$('vsTimerReadout').classList.add('hidden');$('vsShopBtn').classList.add('hidden');return}
  const match=onlineMatchData,self=match.scores?.[onlinePlayerId]||{wins:0,losses:0},round=Math.max(1,Math.min(5,Number(match.round)||1)),remaining=Number(match.phaseUntil)>0?Math.max(0,Math.ceil((Number(match.phaseUntil)-Date.now())/1000)):0;
  scorePanel.classList.toggle('hidden',state.mode!=='shop'||match.phase!=='buy');$('vsRoundText').textContent=`TUR ${round} / 5`;$('vsSelfScore').textContent=`${self.wins||0}-${self.losses||0}`;$('vsPhaseText').textContent=match.phase==='buy'?'HAZIRLIK':'MAÇ';
  $('vsTimerText').textContent=String(remaining);$('vsTopTimerText').textContent=String(remaining);$('vsTimerReadout').classList.toggle('hidden',!['buy','combat'].includes(match.phase));$('vsShopBtn').classList.toggle('hidden',match.phase!=='buy'||state.mode!=='play');$('vsShopBtn').textContent=`MAĞAZA · ${remaining}`;
}
function startOnlineRound(match){
  if(!player||!playerModel)return;onlineRoundApplied=Number(match.round)||1;onlineLocalDead=false;onlineSide=Number(match.sides?.[onlinePlayerId])||onlineSide||-1;
  state.mode='play';state.maxHp=100;state.hp=100;state.armor=0;state.armorMax=0;state.money=2000;state.owned=[true,false,false,false,false,false];state.ownedArmor=['light'];state.equippedArmor='light';state.selectedWeapon=0;state.ammoByWeapon=weapons.map(w=>w.mag);state.reserveByWeapon=weapons.map(w=>w.reserve);state.ammo=weapons[0].mag;state.reserve=weapons[0].reserve;state.kits=0;state.grenades=0;
  const castle=Array.isArray(onlineFortressData)?onlineFortressData[onlineSide<0?0:1]:onlineFortressData;player.x=(castle?.offset||0)+(onlineSide<0?-3.15:3.15);player.z=1.4;player.y=onlineSurfaceAt(player.x,player.z,(castle?.base||0)+12);player.yaw=onlineSide<0?Math.PI/2:-Math.PI/2;player.velocity.set(0,0,0);player.jumpVelocity=0;player.grounded=true;player.invulnerable=1.15;
  cameraYaw=player.yaw;cameraPitch=.12;resetAimToCenter();playerModel.root.position.set(player.x,player.y,player.z);playerModel.root.rotation.y=-player.yaw;replacePlayerWeapon();syncCameraMode();
  $('mainMenu').classList.add('hidden');$('onlinePanel').classList.add('hidden');$('pauseMenu').classList.add('hidden');$('shopPanel').classList.add('hidden');$('petPanel').classList.add('hidden');$('mapPanel').classList.add('hidden');$('settingsPanel').classList.add('hidden');$('topHud').classList.remove('hidden');$('combatHud').classList.remove('hidden');$('pauseTitle').textContent='VS MENÜSÜ';$('pauseDescription').classList.add('hidden');$('pauseMenu').querySelector('.eyebrow').innerHTML='<i></i> VS';$('resumeBtn').querySelector('span').textContent='MAÇA DÖN';$('openPetBtn').classList.remove('hidden');$('openShopBtn').classList.add('hidden');fireHeld=false;moveInput={x:0,y:0};syncControlVisibility();updateHud();renderOnlineHud();drawMinimap();
}
function applyOnlineMatchData(match){
  if(!onlineMatchActive||!match)return;const previous=onlineMatchData;onlineMatchData=match;if(previous?.phase==='buy'&&match.phase!=='buy'&&state.mode==='shop'){state.mode='play';$('shopPanel').classList.add('hidden');$('topHud').classList.remove('hidden');$('combatHud').classList.remove('hidden');syncControlVisibility()}
  if(Number(match.round)!==onlineRoundApplied)startOnlineRound(match);
  if(match.phase==='roundEnd'&&previous?.phase==='combat'&&onlineNoticeRound!==Number(match.round)){onlineNoticeRound=Number(match.round);notify(match.winner===onlinePlayerId?'TURU KAZANDIN':match.winner===onlineOpponentId?'TUR SANA GİTTİ':'TUR BERABERE')}
  if(match.phase==='matchEnd'&&state.mode!=='pause'){state.mode='pause';$('shopPanel').classList.add('hidden');$('petPanel').classList.add('hidden');$('settingsPanel').classList.add('hidden');$('pauseMenu').classList.remove('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');syncControlVisibility()}if(match.phase==='matchEnd'){$('pauseTitle').textContent='MAÇ TAMAMLANDI';$('pauseDescription').textContent='';$('pauseDescription').classList.add('hidden');$('pauseMenu').querySelector('.eyebrow').innerHTML='<i></i> SONUÇ';$('openPetBtn').classList.add('hidden');$('openShopBtn').classList.add('hidden');$('resumeBtn').querySelector('span').textContent='MAÇI KAPAT'}
  updateHud();renderOnlineHud();
}
function beginOnlineMatch(info){
  showTransition(()=>{if(!onlineMatchActive)onlineProgressBackup=JSON.parse(JSON.stringify(state));onlineMatchActive=true;onlinePlayerId=String(info.uid||'');onlineOpponentId=String(info.opponentUid||'');onlineSide=Number(info.side)||-1;onlineMatchData=info.match||null;onlineRoundApplied=0;onlineNoticeRound=0;onlineLocalDead=false;document.documentElement.classList.add('vs-active');cameraMode='third';aimHeld=false;aimBlend=0;state.map=0;beginLevelNow(0);if(onlineOpponent)window.BBGameNet?.setOpponent?.(onlineOpponent);if(onlineMatchData)applyOnlineMatchData(onlineMatchData);clearInterval(onlineHudTimer);onlineHudTimer=setInterval(renderOnlineHud,100)},1550,850)
}
function endOnlineMatch(){
  if(!onlineMatchActive)return;clearInterval(onlineHudTimer);onlineHudTimer=0;const restored=onlineProgressBackup;onlineMatchActive=false;onlineMatchData=null;onlinePlayerId='';onlineOpponentId='';onlineLocalDead=false;onlineRoundApplied=0;onlineNoticeRound=0;onlineProgressBackup=null;document.documentElement.classList.remove('vs-active');$('vsScorePanel').classList.add('hidden');$('vsTimerReadout').classList.add('hidden');$('vsShopBtn').classList.add('hidden');$('pauseMenu').classList.add('hidden');$('shopPanel').classList.add('hidden');$('petPanel').classList.add('hidden');$('mapPanel').classList.add('hidden');$('settingsPanel').classList.add('hidden');if(restored)Object.assign(state,restored);state.mode='menu';cameraMode='third';restoreMapAtmosphere();createWorld(state.map);$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');$('mainMenu').classList.remove('hidden');syncControlVisibility();updateHud();setMusicForMap();
}

function animate(now=performance.now()){requestAnimationFrame(animate);const frameInterval=1000/(state.fpsLimit||60);if(now-lastRenderedAt<frameInterval-.35)return;lastRenderedAt=now;const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;frame++;updateAudioMix();if(fpViewModel)fpViewModel.visible=cameraMode==='first'&&state.mode==='play';
  const worldRunning=state.mode==='play'||onlineRuntimeMode();
  if(onlineOpponent&&onlineOpponentModel&&worldRunning){const p=onlineOpponentModel.root.position;p.x=THREE.MathUtils.damp(p.x,Number(onlineOpponent.x)||0,12,dt);p.z=THREE.MathUtils.damp(p.z,Number(onlineOpponent.z)||0,12,dt);p.y=THREE.MathUtils.damp(p.y,onlineSurfaceAt(p.x,p.z,Number(onlineOpponent.y)||heightAt(p.x,p.z)),12,dt);onlineOpponentModel.root.visible=(Number(onlineOpponent.hp)||0)>0;onlineOpponentModel.root.rotation.y=lerpAngle(onlineOpponentModel.root.rotation.y,-(onlineOpponent.yaw||0),Math.min(1,dt*10));animateRig(onlineOpponentModel,t,Math.min(1,Math.hypot((onlineOpponent.x||0)-p.x,(onlineOpponent.z||0)-p.z)),0);updateOpponentPet(dt,t);}
  if(worldRunning){updatePlayer(dt,t);updatePet(dt,t);updateEnemies(dt,t);updateProjectiles(dt);updatePickups(dt,t);updateEffects(dt);if(!onlineMatchActive){buildPortalVisual(dt);if(portal?.open&&player&&Math.hypot(player.x-portal.x,player.z-portal.z)<5)openGateRegionSelector()}if(frame%5===0)drawMinimap();if(frame%8===0){updateHud();renderOnlineHud()}}
  else if((state.mode==='menu'||state.mode==='character')&&playerModel){const orbit=t*.11,previewX=state.mode==='character'?3:0;camera.position.set(previewX+Math.sin(orbit)*8,4.8,Math.cos(orbit)*8);camera.lookAt(previewX,1.1,0);playerModel.root.rotation.y=Math.sin(t*.15)*.17;for(const e of enemies){e.root.rotation.y+=dt*.12}}
  renderer.render(scene,camera);
}

window.BBGameNet={
  getSnapshot(){const equipped=state.equippedPet&&state.ownedPets.includes(state.equippedPet)?state.equippedPet:'';return player?{x:player.x,z:player.z,y:player.y,yaw:player.yaw,hp:state.hp,armor:state.armor,map:state.map,nick:onlineNickname,look:{...characterLook},pet:equipped,petName:equipped?String(state.petNames[equipped]||'').normalize('NFC').trim().slice(0,16):'',petX:petModel?.root.position.x??null,petZ:petModel?.root.position.z??null,petY:petModel?.root.position.y??null,at:Date.now()}:null},
  setNickname(name){onlineNickname=String(name||'').normalize('NFC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,16)},
  setOpponent(data){const wasAlive=(onlineOpponent?.hp??1)>0;onlineOpponent=data||null;if(!onlineOpponent){if(onlineOpponentModel?.root?.parent)onlineOpponentModel.root.parent.remove(onlineOpponentModel.root);onlineOpponentModel=null;onlineOpponentTag=null;clearOpponentPet();return}if(wasAlive&&onlineOpponent.hp<=0&&state.mode==='play'&&onlineMatchActive)notify('RAKİP ELENDİ');if(!onlineMatchActive)return;if(!onlineOpponentModel||onlineOpponentModel.root.parent!==world){onlineOpponentModel=createHumanoid('player');world.add(onlineOpponentModel.root)}const lookKey=JSON.stringify(onlineOpponent.look||{});if(onlineOpponentModel.lookKey!==lookKey){applyCharacterLook(onlineOpponentModel,onlineOpponent.look||{skin:'tan',jacket:'teal',pants:'cargo',hat:'none',glasses:'none',vest:'scout',pack:'compact'});onlineOpponentModel.lookKey=lookKey}onlineOpponentModel.root.position.set(Number(onlineOpponent.x)||0,onlineSurfaceAt(Number(onlineOpponent.x)||0,Number(onlineOpponent.z)||0,Number(onlineOpponent.y)||heightAt(Number(onlineOpponent.x)||0,Number(onlineOpponent.z)||0)),Number(onlineOpponent.z)||0);onlineOpponentModel.root.visible=(Number(onlineOpponent.hp)||0)>0;updateOpponentNameTag(onlineOpponent.nick);syncOpponentPet(onlineOpponent)},
  begin(map){if(Number.isInteger(map))beginLevel(map)},
  beginOnline:beginOnlineMatch,
  applyMatch:applyOnlineMatchData,
  endOnline:endOnlineMatch,
  applyOnlineDamage(amount){if(!onlineMatchActive||!onlineCombatReady())return;damagePlayer(Math.max(0,Math.min(250,Number(amount)||0)))},
  active(){return onlineMatchActive}
};

function resize(){const profile=qualityProfileForMap(state.map);renderer.setSize(window.innerWidth,window.innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,profile.pixelRatio));camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();if(!mouseLocked)resetAimToCenter();syncControlVisibility()}
function applyQuality(){const profile=qualityProfileForMap(state.map),shadowsEnabled=state.quality!=='low'&&!bossMapIndexes.has(state.map);renderer.shadowMap.enabled=shadowsEnabled&&state.shadows;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,profile.pixelRatio));sceneLights.traverse(light=>{if(light.isDirectionalLight){light.castShadow=shadowsEnabled&&state.shadows;light.shadow.mapSize.set(profile.shadowMap,profile.shadowMap);if(light.shadow.map){light.shadow.map.dispose();light.shadow.map=null}}});saveGame()}

function bindEvents(){
  let lastMediaUnlock=0;const unlockMedia=()=>{const now=performance.now();if(now-lastMediaUnlock<450)return;lastMediaUnlock=now;makeAudioContext();const intro=$('introVideo');if(!introFinished&&!$('introOverlay').classList.contains('hidden')&&intro.muted){intro.muted=false;intro.play().catch(()=>{intro.muted=true})}const menuTrack=audio.currentKey==='menu'||audio.currentKey==='menu-fallback';if(state.mode==='menu'){if(menuTrack&&audio.current?.paused)audio.current.play().catch(()=>{});else if(!menuTrack)setMusicForMap()}};
  document.addEventListener('pointerdown',unlockMedia,{capture:true});if(!('PointerEvent'in window))document.addEventListener('touchstart',unlockMedia,{capture:true,passive:true});document.addEventListener('keydown',unlockMedia,{capture:true});
  $('startBtn').addEventListener('click',()=>{makeAudioContext();beginLevel(state.map)});const introVideo=$('introVideo');introVideo.addEventListener('loadedmetadata',()=>{if(Number.isFinite(introVideo.duration)&&introVideo.duration>0){clearTimeout(introWatchdog);const remaining=Math.max(0,introVideo.duration-(introVideo.currentTime||0));introWatchdog=setTimeout(finishIntro,Math.ceil(remaining*1000)+700)}});introVideo.addEventListener('ended',finishIntro);introVideo.addEventListener('timeupdate',()=>{if(Number.isFinite(introVideo.duration)&&introVideo.duration>0&&introVideo.currentTime>=introVideo.duration-.2)finishIntro()});introVideo.addEventListener('error',()=>{if(!$('introOverlay').classList.contains('hidden'))finishIntro()});
  $('grenadeBtn').addEventListener('click',throwGrenade);$('kitBtn').addEventListener('click',useKit);
   $('cameraModeBtn').addEventListener('click',toggleCameraMode);$('closeDiagnosRewardBtn').addEventListener('click',closeDiagnosReward);$('pauseBtn').addEventListener('click',openPause);$('mapQuickBtn').addEventListener('click',openMapQuick);$('resumeBtn').addEventListener('click',resume);$('openShopBtn').addEventListener('click',openShop);$('vsShopBtn').addEventListener('click',openShop);$('openPetBtn').addEventListener('click',openPetPanel);$('closePetBtn').addEventListener('click',closePetPanel);$('petNameInput').addEventListener('input',e=>updatePetName(e.target.value));$('pauseSettingsBtn').addEventListener('click',openSettings);$('quitBtn').addEventListener('click',()=>{window.BBGameNet?.leaveOnline?.();state.mode='menu';restoreMapAtmosphere();cameraMode='third';syncCameraMode();saveGame();$('pauseMenu').classList.add('hidden');$('topHud').classList.add('hidden');$('combatHud').classList.add('hidden');$('desktopHelp').classList.add('hidden');$('mainMenu').classList.remove('hidden');setMusicForMap()});$('closeShopBtn').addEventListener('click',closeShop);$('shopDoneBtn').addEventListener('click',closeShop);$('shopWeaponsTab').addEventListener('click',()=>setShopTab('weapons'));$('shopAmmoTab').addEventListener('click',()=>setShopTab('ammo'));$('shopGearTab').addEventListener('click',()=>setShopTab('equipment'));
   $('mapSelectBtn').addEventListener('click',()=>{mapReturnMode='menu';$('mainMenu').classList.add('hidden');$('mapPanel').classList.remove('hidden');renderMapGrid()});$('characterBtn').addEventListener('click',openCharacterPanel);$('characterBackBtn').addEventListener('click',closeCharacterPanel);$('characterApplyBtn').addEventListener('click',applyCharacterLookFromMenu);for(const id of ['Skin','Jacket','Pants','Hat','Glasses','Vest','Pack'])$('look'+id).addEventListener('change',readCharacterDraft);$('closeMapBtn').addEventListener('click',closeMap);$('settingsBtn').addEventListener('click',openSettings);$('settingsBackBtn').addEventListener('click',backFromSettings);$('applySettingsBtn').addEventListener('click',applySettings);$('resetGameBtn').addEventListener('click',resetGame);
  $('volumeSlider').value=Math.round(state.volume*100);$('volumeValue').textContent=`${Math.round(state.volume*100)}%`;$('volumeSlider').addEventListener('input',e=>{$('volumeValue').textContent=`${e.target.value}%`});$('sensitivitySlider').value=String(state.cameraSensitivity);$('sensitivityValue').textContent=state.cameraSensitivity.toFixed(1);$('sensitivitySlider').addEventListener('input',e=>{$('sensitivityValue').textContent=Number(e.target.value).toFixed(1)});$('fpsLimitSelect').value=String(state.fpsLimit);$('qualitySelect').value=state.quality;for(const id of ['qualitySelect','fpsLimitSelect','shadowSelect'])mountGameSelect(id);document.addEventListener('pointerdown',e=>{if(!e.target.closest('.gameSelect'))document.querySelectorAll('.gameSelect.open').forEach(w=>{w.classList.remove('open');w.querySelector('.gameSelectTrigger')?.setAttribute('aria-expanded','false')})});
  $('mobileGrenade').addEventListener('pointerdown',e=>{e.preventDefault();throwGrenade()});$('mobileKit').addEventListener('pointerdown',e=>{e.preventDefault();useKit()});$('mobileAim').addEventListener('pointerdown',e=>{e.preventDefault();toggleAim()});const fire=$('mobileFire');fire.addEventListener('pointerdown',e=>{e.preventDefault();fireHeld=true;fire.setPointerCapture(e.pointerId)});for(const name of ['pointerup','pointercancel','lostpointercapture'])fire.addEventListener(name,()=>fireHeld=false);
  const jump=$('mobileJump');jump.addEventListener('pointerdown',e=>{e.preventDefault();jumpPlayer()});
  const zone=$('moveZone'),stick=$('moveStick'),knob=$('stickKnob');let stickOrigin=null;zone.addEventListener('pointerdown',e=>{if(state.mode!=='play'||stickPointer!==null)return;e.preventDefault();const bounds=zone.getBoundingClientRect(),radius=parseFloat(getComputedStyle(stick).width)/2;stickOrigin={x:Math.max(radius,Math.min(bounds.width-radius,e.clientX-bounds.left)),y:Math.max(radius,Math.min(bounds.height-radius,e.clientY-bounds.top))};stick.style.left=`${stickOrigin.x-radius}px`;stick.style.top=`${stickOrigin.y-radius}px`;stick.classList.add('is-active');stickPointer=e.pointerId;zone.setPointerCapture(e.pointerId);moveStick(e)});zone.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e)});for(const name of ['pointerup','pointercancel','lostpointercapture'])zone.addEventListener(name,e=>{if(e.pointerId===stickPointer){stickPointer=null;stickOrigin=null;moveInput={x:0,y:0};knob.style.transform='translate(0px,0px)';stick.classList.remove('is-active')}});
  function moveStick(e){e.preventDefault();if(!stickOrigin)return;const bounds=zone.getBoundingClientRect(),cx=bounds.left+stickOrigin.x,cy=bounds.top+stickOrigin.y,dx=e.clientX-cx,dy=e.clientY-cy,max=stick.offsetWidth*.36,len=Math.hypot(dx,dy),s=len>max?max/(len||1):1,x=dx*s,y=dy*s,nx=x/max,ny=-y/max,dead=.075;moveInput={x:Math.abs(nx)<dead?0:nx,y:Math.abs(ny)<dead?0:ny};knob.style.transform=`translate3d(${x}px,${y}px,0)`}
  canvas.addEventListener('pointerdown',e=>{if(state.mode!=='play')return;if(e.pointerType==='touch'){e.preventDefault();dragPointer=e.pointerId;dragLast={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)}});
  canvas.addEventListener('pointermove',e=>{if(state.mode!=='play')return;if(e.pointerId===dragPointer&&dragLast){const dx=THREE.MathUtils.clamp(e.clientX-dragLast.x,-80,80),dy=THREE.MathUtils.clamp(e.clientY-dragLast.y,-80,80);cameraYaw+=dx*.0038*state.cameraSensitivity;cameraPitch=THREE.MathUtils.clamp(cameraPitch-dy*.003*state.cameraSensitivity,-.72,.92);dragLast={x:e.clientX,y:e.clientY};return}if(e.pointerType!=='touch'&&!mouseLocked)setAimFromPointer(e.clientX,e.clientY)});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerId===dragPointer){dragPointer=null;dragLast=null}});
  document.addEventListener('pointerlockchange',()=>{mouseLocked=document.pointerLockElement===canvas;resetAimToCenter()});document.addEventListener('mousemove',e=>{if(state.mode!=='play'||!mouseLocked)return;cameraYaw+=e.movementX*.0024*state.cameraSensitivity;cameraPitch=THREE.MathUtils.clamp(cameraPitch-e.movementY*.0022*state.cameraSensitivity,-.72,.92)});
  canvas.addEventListener('mousedown',e=>{if(state.mode!=='play')return;if(e.button===2){e.preventDefault();toggleAim();return}if(e.button===0){fireHeld=true;makeAudioContext()}});canvas.addEventListener('click',()=>{if(state.mode==='play'&&!isTouch()&&!mouseLocked)canvas.requestPointerLock?.()});document.addEventListener('mouseup',e=>{if(e.button===0)fireHeld=false});canvas.addEventListener('contextmenu',e=>e.preventDefault());
   document.addEventListener('keydown',e=>{keyState[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;switch(e.code){case'KeyV':toggleCameraMode();break;case'KeyR':reload();break;case'KeyQ':if(state.mode==='play')openShop();else if(state.mode==='pause')openShop();break;case'KeyG':throwGrenade();break;case'KeyH':useKit();break;case'Escape':if(state.mode==='reward')closeDiagnosReward();else if(!$('mapPanel').classList.contains('hidden'))closeMap();else if(state.mode==='pet')closePetPanel();else if(state.mode==='play')openPause();else if(state.mode==='pause')resume();break;case'Digit1':case'Digit2':case'Digit3':case'Digit4':case'Digit5':case'Digit6':selectWeapon(Number(e.code.slice(-1))-1);break}});document.addEventListener('keyup',e=>{keyState[e.code]=false});window.addEventListener('blur',()=>{fireHeld=false;aimHeld=false;syncAimButton();for(const k in keyState)keyState[k]=false});window.addEventListener('resize',resize);
   $('respawnBtn')?.addEventListener('click',respawn);$('deathMenuBtn')?.addEventListener('click',()=>{window.BBGameNet?.leaveOnline?.();state.mode='menu';restoreMapAtmosphere();cameraMode='third';syncCameraMode();$('deathPanel').classList.add('hidden');$('mainMenu').classList.remove('hidden');setMusicForMap()});
}

function init(){
  bindEvents();applyQuality();createWorld(state.map);state.mode='menu';$('volumeSlider').value=Math.round(state.volume*100);$('volumeValue').textContent=`${Math.round(state.volume*100)}%`;
  const hint=isTouch();if(hint)$('mobileControls').classList.add('hidden');animate();beginIntro();
}
init();
