/* Two-player room matchmaking, five-round flow and host-authoritative round clock. */
(()=>{
  const $=id=>document.getElementById(id);
  const ui={panel:$('onlinePanel'),status:$('onlineStatus'),ready:$('roomReady'),code:$('roomCodeText'),players:$('roomPlayersText'),start:$('startOnlineBtn'),leave:$('leaveRoomBtn')};
  const NICK_KEY='bb-vs-nickname-v2';
  const BUY_TIME=15000,ROUND_TIME=200000,ROUND_BREAK=3500,ROUND_COUNT=5;
  let app=null,db=null,auth=null,roomRef=null,roomCode='',uid='',isHost=false,watchTimer=0,nickname='';
  let playerListener=null,statusListener=null,hitListener=null,startRequestListener=null,matchListener=null;
  let players={},started=false,statusValue='waiting',matchData=null,hostTickBusy=false,damageErrorShown=false,hostDisbandHandled=false,disbandToastTimer=0;
  const config=window.BLAZE_FIREBASE_CONFIG||{};
  const configured=()=>config.apiKey&&!config.apiKey.includes('PASTE_')&&config.projectId&&!config.projectId.includes('YOUR_')&&config.databaseURL&&!config.databaseURL.includes('YOUR_');
  function setStatus(s){ui.status.textContent=s}
  function loadFirebase(){
    if(window.firebase?.database)return Promise.resolve();
    if(!configured())return Promise.reject(Error('Firebase kurulumu henüz tamamlanmadı. firebase-config.js dosyasına proje bilgileri eklenmeli.'));
    if(window.__bbFirebaseLoading)return window.__bbFirebaseLoading;
    window.__bbFirebaseLoading=(async()=>{for(const src of ['https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/13.1.0/firebase-auth-compat.js','https://www.gstatic.com/firebasejs/13.1.0/firebase-database-compat.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Firebase bağlantısı açılamadı. Bu APK web içeriğinin internete çıkmasına izin vermeli.'));document.head.append(s)});if(!window.firebase?.database)throw Error('Firebase SDK yüklenemedi. İnternet bağlantısını kontrol et.')})();
    return window.__bbFirebaseLoading;
  }
  async function connect(){
    await loadFirebase();if(!app)app=window.firebase.initializeApp(config);auth=window.firebase.auth();db=window.firebase.database();
    if(uid&&auth.currentUser?.uid===uid)return;await auth.setPersistence(window.firebase.auth.Auth.Persistence.SESSION);if(auth.currentUser)await auth.signOut();const cred=await auth.signInAnonymously();uid=cred.user.uid;if(!nickname||nickname==='Oyuncu'){nickname=`Oyuncu-${uid.slice(0,4).toUpperCase()}`;window.BBGameNet?.setNickname?.(nickname)}
  }
  function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from({length:9},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}
  function openRoomPanel(){ui.panel.classList.remove('hidden');$('mainMenu').classList.add('hidden');setStatus('');$('copyRoomBtn').textContent='KODU KOPYALA';$('createRoomBtn').disabled=false;$('joinRoomBtn').disabled=false;$('createRoomBtn').classList.remove('hidden');$('roomCodeInput').closest('.roomCodeEntry').classList.remove('hidden');$('joinRoomBtn').classList.remove('hidden');ui.ready.classList.add('hidden');ui.start.classList.add('hidden');ui.leave.classList.add('hidden')}
  function open(){try{nickname=String(localStorage.getItem(NICK_KEY)||'').normalize('NFC').trim().slice(0,16)}catch(_e){nickname=''}if(!nickname)nickname='Oyuncu';window.BBGameNet?.setNickname?.(nickname);openRoomPanel()}
  function updatePlayers(){const count=Object.keys(players).length;ui.players.textContent=count<2?(isHost?'Arkadaşına kodu gönder':'BEKLENİYOR'):(isHost?'HAZIR':'BEKLENİYOR');ui.start.classList.toggle('hidden',count<2||started||!isHost)}
  function currentOpponent(){return Object.keys(players).find(id=>id!==uid)||''}
  function initialMatch(){
    const other=currentOpponent();if(!other)throw Error('Maçı başlatmak için ikinci oyuncu gerekli.');const now=Date.now();
    return{round:1,rounds:ROUND_COUNT,phase:'buy',phaseUntil:now+BUY_TIME,winner:null,startedAt:now,sides:{[uid]:-1,[other]:1},scores:{[uid]:{wins:0,losses:0},[other]:{wins:0,losses:0}}};
  }
  function launchMatch(){
    if(started||statusValue!=='playing'||!matchData)return;started=true;ui.panel.classList.add('hidden');setStatus('Bağlanıyor');
    const other=currentOpponent(),side=Number(matchData.sides?.[uid])|| (isHost?-1:1);
    window.BBGameNet?.beginOnline?.({uid,opponentUid:other,side,match:matchData});
  }
  async function startMatch(){
    if(!roomRef||!isHost||Object.keys(players).length<2||started)return;
    try{setStatus('Bağlanıyor');const now=Date.now(),match=initialMatch();await roomRef.update({status:'playing',startedAt:now,match});matchData=match;statusValue='playing';launchMatch()}
    catch(e){setStatus('Maç başlatılamadı: '+(e.message||e));console.error(e)}
  }
  function startResolvedMatchIfReady(){if(statusValue==='playing'&&matchData)launchMatch()}
  function setRemotePlayerSnapshot(){const other=currentOpponent(),state=other?players[other]?.state:null;window.BBGameNet?.setOpponent?.(state||null)}
  function detachListeners(){
    if(!roomRef)return;
    if(playerListener)roomRef.child('players').off('value',playerListener);
    if(statusListener)roomRef.child('status').off('value',statusListener);
    if(startRequestListener)roomRef.child('startRequests').off('child_added',startRequestListener);
    if(hitListener&&uid)roomRef.child('players').child(uid).child('hits').off('child_added',hitListener);
    if(matchListener)roomRef.child('match').off('value',matchListener);
  }
  function subscribe(){
    playerListener=roomRef.child('players').on('value',snap=>{players=snap.val()||{};updatePlayers();setRemotePlayerSnapshot()});
    statusListener=roomRef.child('status').on('value',snap=>{statusValue=snap.val()||'waiting';if(statusValue==='disbanded'&&!isHost){kickAfterHostDisband();return}startResolvedMatchIfReady()});
    matchListener=roomRef.child('match').on('value',snap=>{matchData=snap.val()||null;if(started&&matchData)window.BBGameNet?.applyMatch?.(matchData);startResolvedMatchIfReady()});
    startRequestListener=roomRef.child('startRequests').on('child_added',snap=>{if(isHost&&!started&&Object.keys(players).length>=2)startMatch()});
    hitListener=roomRef.child('players').child(uid).child('hits').on('child_added',snap=>{const hit=snap.val();if(started&&hit?.amount&&hit.from===currentOpponent()&&Number(hit.round)===Number(matchData?.round))window.BBGameNet?.applyOnlineDamage?.(hit.amount);snap.ref.remove().catch(()=>{})});
    if(isHost)roomRef.onDisconnect().update({status:'disbanded',disbandedAt:Date.now()}).catch(()=>{});else roomRef.onDisconnect().cancel().catch(()=>{});
    roomRef.child('players').child(uid).onDisconnect().remove().catch(()=>{});
    clearInterval(watchTimer);watchTimer=setInterval(syncAndAdvance,125);
  }
  async function updateMatch(transform){
    if(!roomRef||!isHost)return;const ref=roomRef.child('match');await ref.transaction(current=>transform(current));
  }
  function remainingHealth(id){const s=players[id]?.state||{};return Math.max(0,Number(s.hp)||0)+Math.max(0,Number(s.armor)||0)}
  async function finishRound(winner,reason='knockout'){
    const now=Date.now();await updateMatch(current=>{
      if(!current||current.phase!=='combat')return;
      const scores={...(current.scores||{})};for(const id of Object.keys(current.sides||{}))scores[id]={wins:Number(scores[id]?.wins)||0,losses:Number(scores[id]?.losses)||0};
      if(winner&&scores[winner]){scores[winner].wins++;const loser=Object.keys(current.sides||{}).find(id=>id!==winner);if(loser)scores[loser].losses++}
      return{...current,phase:'roundEnd',phaseUntil:now+ROUND_BREAK,winner:winner||null,reason,scores};
    }).catch(e=>console.warn('Tur sonucu kaydedilemedi',e));
  }
  async function advanceMatch(){
    const now=Date.now();await updateMatch(current=>{
      if(!current||current.phase!=='roundEnd'||now<Number(current.phaseUntil))return;
      if(Number(current.round)>=ROUND_COUNT)return{...current,phase:'matchEnd',phaseUntil:0,winner:null,finishedAt:now};
      return{...current,round:Number(current.round)+1,phase:'buy',phaseUntil:now+BUY_TIME,winner:null,roundStartedAt:now};
    }).catch(e=>console.warn('Sonraki tura geçilemedi',e));
  }
  async function syncAndAdvance(){
    if(!roomRef||!uid)return;
    const snapshot=window.BBGameNet?.getSnapshot?.();if(snapshot&&started)roomRef.child('players').child(uid).child('state').set(snapshot).catch(()=>{});
    if(!isHost||!started||hostTickBusy||!matchData)return;hostTickBusy=true;
    try{
      const now=Date.now();
      if(Object.keys(players).length<2&&matchData.phase!=='matchEnd')await updateMatch(current=>current?{...current,phase:'matchEnd',phaseUntil:0,reason:'disconnect'}:undefined);
      else if(matchData.phase==='buy'&&now>=Number(matchData.phaseUntil)){await updateMatch(current=>current?.phase==='buy'&&now>=Number(current.phaseUntil)?{...current,phase:'combat',phaseUntil:now+ROUND_TIME,combatStartedAt:now}:undefined)}
      else if(matchData.phase==='combat'){
        const ids=Object.keys(matchData.sides||{}),dead=ids.filter(id=>Number(players[id]?.state?.hp)<=0);
        if(dead.length){const winner=dead.length===1?ids.find(id=>id!==dead[0]):null;await finishRound(winner,'knockout')}
        else if(now>=Number(matchData.phaseUntil)){const a=ids[0],b=ids[1],ha=remainingHealth(a),hb=remainingHealth(b);await finishRound(ha===hb?null:ha>hb?a:b,'time')}
      }else if(matchData.phase==='roundEnd'&&now>=Number(matchData.phaseUntil))await advanceMatch();
    }finally{hostTickBusy=false}
  }
  async function createRoom(){
    try{setStatus('Bağlanıyor');await connect();isHost=true;let code,ref,created=false;
      for(let i=0;i<8&&!created;i++){code=randomCode();ref=db.ref('rooms/'+code);const tx=await ref.transaction(current=>current===null?{host:uid,map:0,status:'waiting',players:{[uid]:{joinedAt:Date.now(),state:{x:-154,z:0,yaw:Math.PI/2,hp:100,armor:0,map:0}}}}:undefined);created=!!tx.committed}
      if(!created)throw Error('Oda kodu üretilemedi, yeniden dene.');roomCode=code;roomRef=ref;showRoom();subscribe();
    }catch(e){setStatus(e.message||'Bağlantı kurulamadı.');console.error(e)}
  }
  async function joinRoom(){
    try{setStatus('Bağlanıyor');await connect();isHost=false;const code=$('roomCodeInput').value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9);if(code.length!==9)throw Error('9 karakterli oda kodunu gir.');
      const ref=db.ref('rooms/'+code),roomSnap=await ref.once('value'),room=roomSnap.val();if(!room||room.status!=='waiting')throw Error('Oda bulunamadı veya maç başlamış.');
      const playersRef=ref.child('players'),tx=await playersRef.child(uid).transaction(current=>{if(current)return current;if(Object.keys(room.players||{}).length>=2)return;return{joinedAt:Date.now(),state:{x:154,z:0,yaw:-Math.PI/2,hp:100,armor:0,map:0}}});if(!tx.committed)throw Error('Oda dolu veya maç başlamış.');roomCode=code;roomRef=ref;showRoom();subscribe();
    }catch(e){setStatus(e.message||'Odaya katılınamadı.');console.error(e)}
  }
  function showRoom(){ui.code.textContent=roomCode;ui.ready.classList.remove('hidden');ui.leave.classList.remove('hidden');$('createRoomBtn').classList.add('hidden');$('roomCodeInput').closest('.roomCodeEntry').classList.add('hidden');$('joinRoomBtn').classList.add('hidden');$('createRoomBtn').disabled=true;$('joinRoomBtn').disabled=true;setStatus('');roomRef.child('players').child(uid).update({joinedAt:Date.now()});updatePlayers()}
  function showHostDisbandMessage(){const toast=$('roomDisbandToast');toast.textContent='Oda kurucu tarafından dağıtıldı';toast.classList.remove('hidden');clearTimeout(disbandToastTimer);disbandToastTimer=setTimeout(()=>toast.classList.add('hidden'),5000)}
  async function kickAfterHostDisband(){if(isHost||hostDisbandHandled)return;hostDisbandHandled=true;await leave();showHostDisbandMessage()}
  async function damageOpponent(amount){
    if(!roomRef||!started||!matchData||matchData.phase!=='combat'||!Number.isFinite(Number(amount))||Number(amount)<=0)return;
    const target=currentOpponent();if(!target)return;
    const dealt=Math.min(250,Number(amount),Math.max(0,Number(players[target]?.state?.hp)||100));
    try{await roomRef.child('players').child(target).child('hits').push({amount:dealt,from:uid,round:Number(matchData.round),at:Date.now()})}
    catch(e){if(!damageErrorShown){damageErrorShown=true;setStatus('Vuruş Firebase’e ulaşmadı. Oda kuralları eski olabilir; Rules bölümündeki dosyadaki kuralları yayımla.');console.error('VS hasarı gönderilemedi',e)}}
  }
  async function leave(){
    clearInterval(watchTimer);if(roomRef&&uid){const leavingRoom=roomRef,wasHost=isHost;detachListeners();if(wasHost){try{await leavingRoom.onDisconnect().cancel()}catch(_e){}try{await leavingRoom.update({status:'disbanded',disbandedAt:Date.now()})}catch(e){console.warn('Oda dağıtma bilgisi gönderilemedi',e)}leavingRoom.child('players').child(uid).remove().catch(()=>{});setTimeout(()=>leavingRoom.remove().catch(()=>{}),6500)}else leavingRoom.child('players').child(uid).remove().catch(()=>{})}
    window.BBGameNet?.setOpponent?.(null);window.BBGameNet?.endOnline?.();roomRef=null;roomCode='';started=false;players={};matchData=null;statusValue='waiting';hostTickBusy=false;damageErrorShown=false;hostDisbandHandled=false;isHost=false;
    ui.ready.classList.add('hidden');ui.start.classList.add('hidden');ui.leave.classList.add('hidden');$('createRoomBtn').disabled=false;$('joinRoomBtn').disabled=false;$('createRoomBtn').classList.remove('hidden');$('roomCodeInput').closest('.roomCodeEntry').classList.remove('hidden');$('joinRoomBtn').classList.remove('hidden');setStatus('');
  }
  window.BBGameNet.damageOpponent=damageOpponent;window.BBGameNet.leaveOnline=leave;window.BBGameNet.openRooms=openRoomPanel;
  $('onlineBtn').addEventListener('click',open);
  $('onlineBackBtn').addEventListener('click',()=>{if(roomRef)leave();ui.panel.classList.add('hidden');$('mainMenu').classList.remove('hidden')});
  $('createRoomBtn').addEventListener('click',createRoom);$('joinRoomBtn').addEventListener('click',joinRoom);
  ui.start.addEventListener('click',async()=>{if(!roomRef||Object.keys(players).length<2)return;if(isHost)startMatch();else{try{await roomRef.child('startRequests').child(uid).set(Date.now());setStatus('Beş turlu maç isteği ev sahibine gönderildi…')}catch(e){setStatus('İstek gönderilemedi: '+e.message)}}});
  ui.leave.addEventListener('click',leave);
  $('copyRoomBtn').addEventListener('click',async()=>{const button=$('copyRoomBtn');try{await navigator.clipboard.writeText(roomCode)}catch(_){try{const field=document.createElement('textarea');field.value=roomCode;field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();document.execCommand('copy');field.remove()}catch(__){}}button.textContent='Kopyalandı!';setStatus('')});
})();
