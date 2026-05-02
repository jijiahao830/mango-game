// ==================== 宝箱抽奖系统 ====================

// ===== 数据定义（全局作用域） =====
var CASES = {
  basic: {
    name: '普通宝箱',
    subtitle: '免费开启 · 邀请与任务可获得次数',
    prizes: [
      { id:'b1', name:'奔驰E300 1天免费使用权', icon:'supercar', rarity:'red', value:899,
        desc:'限周一至周四非法定节假日使用；提前3天预约；仅限本人使用', weight:0.5 },
      { id:'b2', name:'500元租车券（满3天可用）', icon:'couponPlus', rarity:'gold', value:500,
        desc:'满3000元可用；限工作日使用；单笔订单限用1张', weight:2 },
      { id:'b3', name:'8折租车券（最高减400元）', icon:'couponPlus', rarity:'purple', value:400,
        desc:'满1500元可用；不与其他优惠同享', weight:10 },
      { id:'b4', name:'85折租车券（最高减200元）', icon:'coupon', rarity:'blue', value:200,
        desc:'满1000元可用；不与其他优惠同享', weight:25 },
      { id:'b5', name:'免费车辆精洗+内饰消毒1次', icon:'clean', rarity:'green', value:198,
        desc:'取车/还车时可用；无门槛', weight:40 },
      { id:'b6', name:'定制车载香薰/高端挪车码', icon:'gift', rarity:'gray', value:188,
        desc:'到店自取；无使用门槛', weight:22.5 }
    ]
  },
  advanced: {
    name: '高级宝箱',
    subtitle: '精选礼遇 · 后台配置次数后开启',
    prizes: [
      { id:'a1', name:'保时捷718/奔驰C63 1天免费使用权', icon:'supercar', rarity:'red', value:1299,
        desc:'限周一至周四非法定节假日使用；提前3天预约；仅限本人使用', weight:1 },
      { id:'a2', name:'1000元租车券（满5天可用）', icon:'ticket', rarity:'gold', value:1000,
        desc:'满5000元可用；长租专享；限工作日使用', weight:5 },
      { id:'a3', name:'75折租车券（最高减800元）', icon:'couponPlus', rarity:'purple', value:800,
        desc:'满2500元可用；不与其他优惠同享', weight:15 },
      { id:'a4', name:'8折租车券（最高减400元）', icon:'coupon', rarity:'blue', value:400,
        desc:'满1500元可用；不与其他优惠同享', weight:30 },
      { id:'a5', name:'免费机场/高铁接送服务1次', icon:'airport', rarity:'green', value:298,
        desc:'仅限与取车/还车订单绑定使用；限本市主城区', weight:39 },
      { id:'a6', name:'高端定制车载伴手礼盒', icon:'gift', rarity:'gray', value:268,
        desc:'到店自取；无使用门槛', weight:10 }
    ]
  },
  premium: {
    name: '传说宝箱',
    subtitle: '尊享礼遇 · 后台配置次数后开启',
    prizes: [
      { id:'p1', name:'兰博基尼/法拉利 1天免费使用权', icon:'supercar', rarity:'legend', value:4999,
        desc:'限周一至周四非法定节假日使用；提前5天预约；仅限本人使用', weight:1 },
      { id:'p2', name:'1500元长租抵扣券（满7天可用）', icon:'ticket', rarity:'red', value:1500,
        desc:'满7000元可用；不限使用时段', weight:16 },
      { id:'p3', name:'专属配驾服务1天（8小时）', icon:'driver', rarity:'gold', value:2400,
        desc:'仅限3天及以上长租订单绑定使用', weight:21 },
      { id:'p4', name:'7折租车券（最高减1200元）', icon:'couponPlus', rarity:'purple', value:1200,
        desc:'满3000元可用；不与其他优惠同享', weight:26 },
      { id:'p5', name:'免费全车精洗+内饰护理', icon:'clean', rarity:'silver', value:398,
        desc:'取车/还车时可用；无门槛', weight:21 },
      { id:'p6', name:'豪车尊享高端礼盒', icon:'gift', rarity:'bronze', value:888,
        desc:'到店自取；无使用门槛', weight:15 }
    ]
  }
};

var RARITY = {
  blue:   { color:'#4b69ff', label:'普通', cssClass:'blue' },
  purple: { color:'#8847ff', label:'稀有', cssClass:'purple' },
  red:    { color:'#eb4b4b', label:'特等奖', cssClass:'red' },
  gold:   { color:'#ff7f00', label:'一等奖', cssClass:'gold' },
  green:  { color:'#2bb85a', label:'四等奖', cssClass:'green' },
  gray:   { color:'#9aa6c9', label:'五等奖', cssClass:'gray' },
  legend: { color:'#eb4b4b', label:'传奇奖', cssClass:'legend' },
  silver: { color:'#0e7490', label:'二等奖', cssClass:'silver' },
  bronze: { color:'#ca8a04', label:'三等奖', cssClass:'bronze' }
};

var ICON_MAP = {
  wash:'./assets/icons/wash.svg',
  pickup:'./assets/icons/pickup.svg',
  clean:'./assets/icons/clean.svg',
  coupon:'./assets/icons/coupon.svg',
  couponPlus:'./assets/icons/coupon-plus.svg',
  supercar:'./assets/icons/supercar.svg',
  airport:'./assets/icons/airport.svg',
  ticket:'./assets/icons/ticket.svg',
  crown:'./assets/icons/crown.svg',
  diamond:'./assets/icons/diamond.svg',
  driver:'./assets/icons/driver.svg',
  gift:'./assets/icons/gift.svg',
  unknown:'./assets/icons/unknown.svg'
};

/** 开箱次数：由后台按客户姓名和手机号配置发放 */
var S = {
  freeOpens: 0,
  advancedOpens: 0,  // 高级宝箱积分（1积分=1次抽奖）
  premiumOpens: 0,   // 传说宝箱积分
  totalOpens: 0, invites: 0,
  currentTier: 'basic', isSpinning: false,
  /** 高级：连续未出特等奖(a1)次数，第20次必出 */
  pityAdvanced: 0,
  /** 传说：连续未出传奇奖(p1)次数，第40次必出 */
  pityPremium: 0,
  userId: '',
  userName: '',
  apiToken: '',
  /** 用户手机号（已验证） */
  userPhone: '',
  /** 是否已领取首次免费 */
  hasClaimedFree: false,
  /** 当前用户的邀请码，登录后生成 */
  referralCode: '',
  /** 通过别人的链接进入时暂存的邀请码 */
  pendingReferralCode: '',
  /** 当前用户是否已经领取过邀请新用户奖励 */
  hasClaimedReferralJoin: false,
  /** 邀请人已结算的有效邀请数 */
  inviteRewardedCount: 0
};

/** 开箱页一键：当前档位连续开箱，总次数=点击时剩余次数 */
var oneClickSessionTotal=0;
var oneClickSessionDone=0;
var awardsCache=null;
/** doOpen 扣次/抽奖后若转盘失败，用于完整回滚（含保底计数） */
var _spinRestore=null;

function abortPendingSpin(msg){
  if(!_spinRestore)return;
  if(!S.apiToken){
    S.freeOpens=_spinRestore.free;
    S.advancedOpens=_spinRestore.adv;
    S.premiumOpens=_spinRestore.prem;
    S.pityAdvanced=_spinRestore.pa;
    S.pityPremium=_spinRestore.pp;
  }
  _spinRestore=null;
  S.isSpinning=false;
  animPhase='idle';
  currentPrize=null;
  oneClickSessionTotal=0;
  oneClickSessionDone=0;
  save();
  updateOpenBtn();
  updateOneClickBtn();
  updatePityHint();
  if(msg)toast(msg);
}

// 全局状态变量（延迟初始化）
var openCvs=null, openCtx=null;
var pCanvas=null, pCtx=null;
var resBgCvs=null, resBgCtx=null;
var wheelTrack=null, currentPrize=null;
var animPhase='idle';
var resultBgRarity='blue';
var particles=[];
var ac=null;
var pendingPoolTier=null;
var BOX_IMAGE_PATHS={
  basic:'./assets/box/basic.png',
  advanced:'./assets/box/advanced.png',
  premium:'./assets/box/premium.png'
};
var boxImages={};
var boxImageLoaded={};
/** 主循环用缓存，避免每帧 querySelector/getElementById */
var elMenuScreen=null, elOpenScreen=null, elResultScreen=null;
var allScreenEls=null;
/** 开箱画布：initOpenScreen 后置 true，绘制一次后 false；opening 阶段由 shakeCase 独占绘制 */
var _openCaseNeedsDraw=true;

// ===== 工具函数 =====
function $(id){ return document.getElementById(id); }

function rand(min,max){ return Math.random()*(max-min)+min; }
function randInt(min,max){ return Math.floor(rand(min,max+1)); }
function getIconSrc(iconKey){ return ICON_MAP[iconKey] || ICON_MAP.unknown; }

function getTierName(tier){
  return CASES[tier]&&CASES[tier].name?CASES[tier].name:'宝箱';
}

function formatTime(value){
  if(!value)return '';
  var d=new Date(value);
  if(isNaN(d.getTime()))return String(value);
  var y=d.getFullYear();
  var m=String(d.getMonth()+1).padStart(2,'0');
  var day=String(d.getDate()).padStart(2,'0');
  var h=String(d.getHours()).padStart(2,'0');
  var min=String(d.getMinutes()).padStart(2,'0');
  return y+'-'+m+'-'+day+' '+h+':'+min;
}

function escapeHtml(str){
  return String(str==null?'':str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ensureBoxImage(tier){
  tier=tier||S.currentTier||'basic';
  if(boxImages[tier])return boxImages[tier];
  var img=new Image();
  boxImageLoaded[tier]=false;
  img.onload=function(){
    boxImageLoaded[tier]=true;
  };
  img.onerror=function(){ boxImageLoaded[tier]=false; };
  img.src=BOX_IMAGE_PATHS[tier]||BOX_IMAGE_PATHS.basic;
  if(img.complete&&img.naturalWidth){
    boxImageLoaded[tier]=true;
  }
  boxImages[tier]=img;
  return img;
}

function drawBoxImageContained(ctx,img,cw,ch){
  var iw=img.naturalWidth||img.width;
  var ih=img.naturalHeight||img.height;
  if(!iw||!ih)return false;
  // 放大宝箱占比（更贴近“主视觉”）
  var scale=Math.min((cw*0.90)/iw,(ch*0.90)/ih);
  var dw=iw*scale;
  var dh=ih*scale;
  var dx=(cw-dw)/2;
  // 视觉居中略上移，避免下方被文字/按钮区域“压”住
  var dy=(ch-dh)/2-6;
  ctx.drawImage(img,dx,dy,dw,dh);
  return true;
}

function weightedRandom(prizes){
  var total=0; for(var i=0;i<prizes.length;i++)total+=prizes[i].weight;
  var r=Math.random()*total;
  for(var i=0;i<prizes.length;i++){r-=prizes[i].weight;if(r<=0)return prizes[i];}
  return prizes[prizes.length-1];
}

function findPrizeById(prizes,id){
  for(var i=0;i<prizes.length;i++)if(prizes[i].id===id)return prizes[i];
  return prizes[0];
}

/** 普通无保底；高级20抽内必出特等奖(a1)；传说40抽内必出传奇奖(p1) */
function rollPrizeForTier(tier){
  var prizes=CASES[tier].prizes;
  if(tier==='advanced'){
    if(S.pityAdvanced>=19){
      S.pityAdvanced=0;
      return findPrizeById(prizes,'a1');
    }
    var pa=weightedRandom(prizes);
    if(pa.id==='a1')S.pityAdvanced=0;
    else S.pityAdvanced++;
    return pa;
  }
  if(tier==='premium'){
    if(S.pityPremium>=39){
      S.pityPremium=0;
      return findPrizeById(prizes,'p1');
    }
    var pp=weightedRandom(prizes);
    if(pp.id==='p1')S.pityPremium=0;
    else S.pityPremium++;
    return pp;
  }
  return weightedRandom(prizes);
}

function getOpensForTier(tier){
  if(tier==='basic')return S.freeOpens;
  if(tier==='advanced')return S.advancedOpens;
  if(tier==='premium')return S.premiumOpens;
  return 0;
}

function updatePityHint(){
  var el=$('openPityHint');
  if(!el)return;
  var t=S.currentTier;
  if(t==='advanced'){
    if(S.pityAdvanced>=19)el.textContent='特等奖保底：下次开箱必出特等奖';
    else el.textContent='特等奖保底：已连续 '+S.pityAdvanced+' 次未出特等奖，至多再 '+Math.max(1,20-S.pityAdvanced)+' 次内必出';
  }else if(t==='premium'){
    if(S.pityPremium>=39)el.textContent='传奇奖保底：下次开箱必出传奇奖';
    else el.textContent='传奇奖保底：已连续 '+S.pityPremium+' 次未出传奇奖，至多再 '+Math.max(1,40-S.pityPremium)+' 次内必出';
  }else{
    el.textContent='';
  }
}

function save(){ try{localStorage.setItem('csgo_case_state',JSON.stringify(S));}catch(e){} }

function load(){
  try{ 
    var d=JSON.parse(localStorage.getItem('csgo_case_state')); 
    if(d){
      for(var k in d)if(d.hasOwnProperty(k))S[k]=d[k];
    }
  }catch(e){}
  S.isSpinning=false; // 每次加载强制重置
  try{ delete S.vipOpens; }catch(e){} // 旧版贵宾次数已废弃，统一为余额扣费
  try{ delete S.collection; }catch(e){} // 图鉴已下线，丢弃旧存档字段
  try{ delete S.paidCoins; }catch(e){} // 已改为按档「次数包」
  if(S.advancedOpens==null||S.advancedOpens<0)S.advancedOpens=0;
  if(S.premiumOpens==null||S.premiumOpens<0)S.premiumOpens=0;
  if(S.pityAdvanced==null||S.pityAdvanced<0)S.pityAdvanced=0;
  if(S.pityPremium==null||S.pityPremium<0)S.pityPremium=0;
  if(S.pityAdvanced>19)S.pityAdvanced=19;
  if(S.pityPremium>39)S.pityPremium=39;
  if(!S.referralCode)S.referralCode='';
  if(!S.pendingReferralCode)S.pendingReferralCode='';
  if(!S.userId)S.userId='';
  if(!S.userName)S.userName='';
  if(!S.apiToken)S.apiToken='';
  if(S.hasClaimedReferralJoin==null)S.hasClaimedReferralJoin=false;
  if(S.inviteRewardedCount==null||S.inviteRewardedCount<0)S.inviteRewardedCount=0;
  if(S.inviteRewardedCount>5)S.inviteRewardedCount=5;
  if(!S.userPhone&&S.hasClaimedFree){
    S.hasClaimedFree=false;
    if(S.freeOpens===3)S.freeOpens=0;
  }
  if(!S.userPhone&&S.advancedOpens===5)S.advancedOpens=0;
  if(!S.userPhone&&S.premiumOpens===3)S.premiumOpens=0;
}

var API_BASE = window.API_BASE || '';
var isLoggingIn=false;

function apiRequest(path, options){
  options=options||{};
  var headers=options.headers||{};
  headers['Content-Type']='application/json';
  if(S.apiToken)headers['Authorization']='Bearer '+S.apiToken;
  return fetch(API_BASE+path,{
    method:options.method||'GET',
    headers:headers,
    body:options.body?JSON.stringify(options.body):undefined
  }).then(function(res){
    return res.json().catch(function(){return {};}).then(function(data){
      if(!res.ok||data.ok===false){
        throw new Error(data.message||('接口请求失败：'+res.status));
      }
      return data;
    });
  });
}

function applyBalance(balance){
  balance=balance||{};
  S.freeOpens=Number(balance.basicOpens||balance.basic_opens||0);
  S.advancedOpens=Number(balance.advancedOpens||balance.advanced_opens||0);
  S.premiumOpens=Number(balance.premiumOpens||balance.premium_opens||0);
}

function clearLoginState(){
  var pending=S.pendingReferralCode||'';
  S.userId='';
  S.userName='';
  S.userPhone='';
  S.apiToken='';
  S.referralCode='';
  S.hasClaimedFree=false;
  S.freeOpens=0;
  S.advancedOpens=0;
  S.premiumOpens=0;
  S.invites=0;
  S.pendingReferralCode=pending;
  save();
}

function syncSessionFromServer(){
  if(!S.apiToken)return Promise.resolve(false);
  return apiRequest('/api/me')
    .then(function(data){
      var user=data.user||{};
      S.userId=String(user.id||S.userId||'');
      S.userName=user.name||S.userName||'';
      S.userPhone=user.phone||S.userPhone||'';
      S.referralCode=user.referralCode||user.referral_code||S.referralCode||'';
      applyBalance(data.balance);
      S.invites=Number(data.inviteCount||0);
      save();
      updateUI();
      updateInvite();
      refreshLoginDisplay();
      return true;
    })
    .catch(function(){
      clearLoginState();
      updateUI();
      updateInvite();
      refreshLoginDisplay();
      return false;
    });
}

function toast(msg){
  var t=document.createElement('div');
  t.className='toast';t.textContent=msg;t.style.zIndex='9999';
  document.body.appendChild(t);
  setTimeout(function(){try{t.remove();}catch(e){}},2200);
}

function openPhoneModal(){
  var modal=$('phoneModal');
  if(!modal)return;

  if(S.userName&&$('nameInput'))$('nameInput').value=S.userName;
  if(S.userPhone&&$('phoneInput'))$('phoneInput').value=S.userPhone;
  if(S.userPhone){
    showGrantModal();
    return;
  }

  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  snd('click');
}

function closePhoneModal(){
  var modal=$('phoneModal');
  if(!modal)return;
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  snd('click');
}

function loginCustomer(){
  if(isLoggingIn)return;
  var name=($('nameInput')&&$('nameInput').value||'').trim();
  var phone=($('phoneInput')&&$('phoneInput').value||'').trim();
  if(!name){
    toast('请输入姓名');
    return;
  }
  if(name.length<2){
    toast('请输入完整姓名');
    return;
  }
  if(!phone){
    toast('请输入手机号');
    return;
  }
  if(!/^1[3-9]\d{9}$/.test(phone)){
    toast('手机号格式不正确，请输入11位手机号');
    return;
  }

  isLoggingIn=true;
  var submitBtn=$('loginSubmitBtn');
  var oldText=submitBtn?submitBtn.textContent:'';
  if(submitBtn){
    submitBtn.disabled=true;
    submitBtn.textContent='确认中...';
  }

  apiRequest('/api/login',{
    method:'POST',
    body:{name:name, phone:phone, ref:S.pendingReferralCode||''}
  }).then(function(data){
    var user=data.user||{};
    S.userId=String(user.id||'');
    S.userName=user.name||name;
    S.userPhone=user.phone||phone;
    S.apiToken=user.token||data.token||S.apiToken;
    S.referralCode=user.referralCode||user.referral_code||S.referralCode||ensureReferralCode();
    S.hasClaimedFree=true;
    S.pendingReferralCode='';
    applyBalance(data.balance);
    S.invites=Number(data.inviteCount||0);
    save();
    closePhoneModal();
    updateUI();
    updateInvite();
    showGrantModal();
    toast('信息确认成功，抽奖次数已发放');
    snd('gold');
    refreshLoginDisplay();
  }).catch(function(err){
    var msg=err&&err.message?err.message:'登录失败，请稍后重试';
    if(msg.indexOf('Failed to fetch')!==-1||msg.indexOf('NetworkError')!==-1){
      msg='网络连接失败，请刷新页面或稍后再试';
    }
    toast(msg);
  }).finally(function(){
    isLoggingIn=false;
    if(submitBtn){
      submitBtn.disabled=false;
      submitBtn.textContent=oldText||'确认领取';
    }
  });
}

function verifyPhoneAndClaim(){ loginCustomer(); }

function refreshLoginDisplay(){
  var display=$('userPhoneDisplay');
  if(display&&S.userPhone){
    display.textContent='已登录：'+(S.userName?S.userName+' · ':'')+S.userPhone.substr(0,3)+'****'+S.userPhone.substr(7);
    display.style.display='block';
  }else if(display){
    display.textContent='';
    display.style.display='none';
  }
  var loginBtn=$('phoneLoginBtn');
  if(loginBtn)loginBtn.textContent=S.userPhone?'查看我的次数':'登录即可抽奖';
}

function showGrantModal(){
  var b=$('grantBasic');if(b)b.textContent=S.freeOpens+' 次';
  var a=$('grantAdvanced');if(a)a.textContent=S.advancedOpens+' 次';
  var p=$('grantPremium');if(p)p.textContent=S.premiumOpens+' 次';
  var modal=$('grantModal');
  if(modal){modal.classList.add('modal--open');modal.setAttribute('aria-hidden','false');}
  document.body.style.overflow='hidden';
}

function closeGrantModal(){
  var modal=$('grantModal');
  if(modal){modal.classList.remove('modal--open');modal.setAttribute('aria-hidden','true');}
  document.body.style.overflow='';
  if($('splashScreen')&&$('splashScreen').classList.contains('active')){
    enterGame();
  }
  snd('click');
}

function makeReferralCode(phone){
  var raw=String(phone||'')+'_'+Date.now()+'_'+Math.random().toString(36).slice(2);
  var hash=0;
  for(var i=0;i<raw.length;i++)hash=((hash<<5)-hash+raw.charCodeAt(i))|0;
  return 'MG'+Math.abs(hash).toString(36).toUpperCase().slice(0,8);
}

function ensureReferralCode(){
  if(!S.referralCode){
    S.referralCode=makeReferralCode(S.userPhone);
  }
  return S.referralCode;
}

function getReferralLink(){
  if(!S.userPhone)return '';
  var code=ensureReferralCode();
  var url=new URL(window.location.href);
  url.searchParams.set('ref',code);
  return url.toString();
}

function getReferralBook(){
  try{
    return JSON.parse(localStorage.getItem('referral_book')||'{}')||{};
  }catch(e){
    return {};
  }
}

function saveReferralBook(book){
  try{localStorage.setItem('referral_book',JSON.stringify(book));}catch(e){}
}

function getCurrentVisitorId(){
  var key='visitor_id';
  var id='';
  try{id=localStorage.getItem(key)||'';}catch(e){}
  if(!id){
    id='v_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10);
    try{localStorage.setItem(key,id);}catch(e){}
  }
  return id;
}

function readReferralFromUrl(){
  try{
    var ref=new URLSearchParams(window.location.search).get('ref')||'';
    ref=ref.replace(/[^A-Za-z0-9_-]/g,'').slice(0,32);
    if(ref&&!S.pendingReferralCode&&!S.hasClaimedReferralJoin){
      S.pendingReferralCode=ref;
      save();
    }
  }catch(e){}
}

function claimPendingReferralReward(phone){
  var ref=S.pendingReferralCode;
  if(!ref||S.hasClaimedReferralJoin)return;
  if(S.referralCode&&ref===S.referralCode)return;

  var book=getReferralBook();
  if(!book[ref])book[ref]={count:0, users:[]};
  var rec=book[ref];
  var visitor=phone||getCurrentVisitorId();
  if(rec.users.indexOf(visitor)!==-1)return;
  if(rec.count>=5){
    toast('该邀请链接已达到 5 位新用户上限');
    return;
  }
  rec.users.push(visitor);
  rec.count=rec.users.length;
  book[ref]=rec;
  saveReferralBook(book);

  S.hasClaimedReferralJoin=true;
  S.pendingReferralCode='';
  S.freeOpens+=1;
  toast('邀请登录成功，已额外获得 1 次普通宝箱积分');
}

// ===== 音效 =====
function initAudio(){
  try{ if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)(); }catch(e){ac=null;}
}
function snd(type){
  try{
    if(!ac)initAudio();
    if(!ac)return;
    var o=ac.createOscillator(),g=ac.createGain();
    o.connect(g);g.connect(ac.destination);

    switch(type){
      case 'click':
        o.type='triangle';o.frequency.value=700;g.gain.value=0.06;
        g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.07);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.07);break;
      case 'open':
        o.type='square';o.frequency.value=120;
        o.frequency.exponentialRampToValueAtTime(60,ac.currentTime+0.15);
        g.gain.value=0.08;g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.2);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.2);break;
      case 'spin':
        o.type='sawtooth';o.frequency.value=180;
        o.frequency.linearRampToValueAtTime(420,ac.currentTime+0.6);
        g.gain.value=0.04;g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.65);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.65);break;
      case 'tick':
        o.type='square';o.frequency.value=900;
        g.gain.value=0.03;g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.04);
        o.start(ac.currentTime);o.stop(ac.currentTime+0.04);break;
      case 'win':
        o.type='square';g.gain.value=0.05;
        var n=ac.currentTime;
        o.frequency.setValueAtTime(523,n);o.frequency.setValueAtTime(659,n+0.1);
        o.frequency.setValueAtTime(784,n+0.2);o.frequency.setValueAtTime(1047,n+0.32);
        g.gain.exponentialRampToValueAtTime(0.001,n+0.55);
        o.start(n);o.stop(n+0.55);break;
      case 'gold':
        o.type='sine';g.gain.value=0.08;
        var tn=ac.currentTime;
        [523,659,784,1047,1319,1568].forEach(function(f,i){
          o.frequency.setValueAtTime(f,tn+i*0.09);
        });
        g.gain.exponentialRampToValueAtTime(0.001,tn+0.75);
        o.start(tn);o.stop(tn+0.75);break;
    }
  }catch(e){ac=null;}
}

// ===== 粒子系统 =====
var MAX_PARTICLES=150;
class Pt{
  constructor(x,y,c,s){
    this.x=x;this.y=y;this.vx=rand(-7,7);this.vy=rand(-12,-3);
    this.g=0.16;this.life=1;this.dec=rand(0.008,0.028);
    this.c=c;this.s=s||rand(2,6);
  }
  update(){this.x+=this.vx;this.vy+=this.g;this.y+=this.vy;this.life-=this.dec;}
  draw(ctx){
    ctx.globalAlpha=Math.max(this.life,0);ctx.fillStyle=this.c;
    ctx.fillRect(Math.floor(this.x),Math.floor(this.y),this.s,this.s);
  }
}
function emit(x,y,n,colors){
  var allowed=Math.min(n,MAX_PARTICLES-particles.length);
  for(var i=0;i<allowed;i++)
    particles.push(new Pt(x,y,colors[randInt(0,colors.length-1)]));
}
function updateP(){
  if(!pCtx||!pCanvas)return;
  if(particles.length===0)return;
  pCtx.clearRect(0,0,pCanvas.width,pCanvas.height);
  particles=particles.filter(function(p){return p.life>0;});
  for(var i=0;i<particles.length;i++){
    particles[i].update();
    particles[i].draw(pCtx);
  }
  pCtx.globalAlpha=1;
}

// ===== 开箱页：箱子绘制 =====
function drawOpenCase(shakeX,shakeY,isOpen){
  if(!openCtx)return;
  var ctx=openCtx,w=380,h=320,cx=w/2,cy=h/2;
  ctx.clearRect(0,0,w,h);
  ctx.save();
  ctx.translate(shakeX,shakeY);
  var accent=RARITY[CASES[S.currentTier].prizes[0].rarity].color;
  var tier=S.currentTier;
  var img=ensureBoxImage(tier);
  if(boxImageLoaded[tier]){
    drawBoxImageContained(ctx,img,w,h-24);
  }
  // 不显示“点击开启/开启中”文字，避免遮挡宝箱图
  ctx.restore();
}

// ===== 开箱页主题（与 data-tier 联动样式） =====
function syncOpenScreenTier(tier){
  var screen=$('openScreen');
  if(screen)screen.setAttribute('data-tier',tier||'basic');
}

// ===== 开箱页初始化 =====
function initOpenScreen(){
  animPhase='idle';
  _openCaseNeedsDraw=true;
  var tier=S.currentTier,c=CASES[tier];
  syncOpenScreenTier(tier);
  $('openTierTitle').textContent=c.name;
  $('openLabel').textContent=c.subtitle;
  $('openLabel').removeAttribute('style');
  updatePityHint();
  buildWheel(c.prizes);
  updateOpenBtn();
  updateOneClickBtn();
}

// ===== 轮盘构建 =====
function buildWheel(prizes){
  wheelTrack=$('wheelTrack');
  if(!wheelTrack)return;
  wheelTrack.innerHTML='';
  wheelTrack.style.transform='translateX(0px)';
  wheelTrack.style.transition='none';

  // 重复数量足够大，避免滚动到尾部造成跳变
  var repeatCount=12;
  var allItems=[];
  for(var r=0;r<repeatCount;r++){
    for(var pi=0;pi<prizes.length;pi++){
      allItems.push({name:prizes[pi].name,icon:prizes[pi].icon,rarity:prizes[pi].rarity,id:r+'_'+prizes[pi].id});
    }
  }

  for(var ai=0;ai<allItems.length;ai++){
    var item=allItems[ai];
    var el=document.createElement('div');
    el.className='wheel-item wi-'+item.rarity+((item.rarity==='gold'||item.rarity==='legend')?' wi-jackpot':'');
    var rc=RARITY[item.rarity]||RARITY.gray;
    el.innerHTML='<div class="wi-inner"><img class="wi-icon" src="'+getIconSrc(item.icon)+'" alt="'+item.name+'图标"><span class="wi-name">'+item.name+'</span><span class="wi-rarity wr-'+rc.cssClass+'">'+rc.label+'</span></div>';
    wheelTrack.appendChild(el);
  }
}

// ===== 按钮状态更新 =====
function updateOpenBtn(){
  var btn=$('openBtn'),t=S.currentTier;
  if(!btn)return;
  var left=getOpensForTier(t);
  btn.textContent=left>0?'开启宝箱':'暂无次数';
  btn.disabled=(left<=0||S.isSpinning);
}

function updateOneClickBtn(){
  var b=$('oneClickOpenBtn');
  if(!b)return;
  var n=getOpensForTier(S.currentTier);
  b.disabled=(n<=0||S.isSpinning||oneClickSessionTotal>0);
}

function handleOpenBtnClick(){
  if(S.isSpinning)return;
  if(!S.userPhone){
    toast('请先输入姓名和手机号领取次数');
    openPhoneModal();
    return;
  }
  if(getOpensForTier(S.currentTier)<=0){
    toast('当前宝箱暂无抽奖次数');
    return;
  }
  doOpen();
}

// ===== 执行开箱（核心） =====
function doOpen(){
  if(S.isSpinning){return;}
  var tier=S.currentTier;

  if(!S.userPhone){
    toast('请先输入姓名和手机号领取次数');
    openPhoneModal();
    return;
  }
  if(getOpensForTier(tier)<=0){
    toast('当前宝箱暂无抽奖次数');
    return;
  }

  _spinRestore={
    free:S.freeOpens, adv:S.advancedOpens, prem:S.premiumOpens,
    pa:S.pityAdvanced, pp:S.pityPremium
  };

  S.isSpinning=true;updateOpenBtn();updateOneClickBtn();save();
  apiRequest('/api/draw',{method:'POST',body:{tier:tier}})
    .then(function(data){
      currentPrize=data.prize;
      if(data.balance)applyBalance(data.balance);
      if(data.pity){
        S.pityAdvanced=Number(data.pity.advanced||S.pityAdvanced||0);
        S.pityPremium=Number(data.pity.premium||S.pityPremium||0);
      }
      save();
      updateUI();
      startOpenAnimation();
    })
    .catch(function(err){
      S.isSpinning=false;
      _spinRestore=null;
      updateUI();
      toast(err.message||'抽奖失败，请稍后重试');
    });
}

// ===== 开箱动画 =====
function startOpenAnimation(){
  animPhase='opening';
  snd('open');
  shakeCase(500);
  setTimeout(function(){
    animPhase='spinning';
    snd('spin');
    spinWheel(currentPrize);
  },550);
}

function shakeCase(duration){
  var startTime=Date.now();
  function shakeLoop(){
    var elapsed=Date.now()-startTime;
    if(elapsed>=duration||animPhase!=='opening'){
      drawOpenCase(0,0,false);
      return;
    }
    var intensity=Math.max(0,8*(1-elapsed/duration));
    var sx=(Math.random()-0.5)*intensity*2;
    var sy=(Math.random()-0.5)*intensity;
    drawOpenCase(sx,sy,true);
    requestAnimationFrame(shakeLoop);
  }
  shakeLoop();
}

// ===== 轮盘滚动 =====
function spinWheel(targetPrize){
  var track=$('wheelTrack');
  var container=$('wheelContainer');
  if(!track||!container){
    abortPendingSpin('转盘未就绪，已退回本次次数');
    return;
  }
  
  var prizeCount=CASES[S.currentTier].prizes.length;
  var targetInSet=0;
  var found=false;
  for(var ti=0;ti<prizeCount;ti++){
    if(CASES[S.currentTier].prizes[ti].id===targetPrize.id){targetInSet=ti;found=true;break;}
  }
  if(!found){/* prize id not in wheel, fallback to first */}

  var totalItems=track.children.length;
  if(totalItems===0){
    abortPendingSpin('转盘未加载，已退回本次次数');
    return;
  }

  var spins=(7+randInt(1,3));
  var startIdx=prizeCount; // 从第1轮开始（留足前导空间）
  var targetIdx=startIdx + spins*prizeCount + targetInSet;
  if(targetIdx>=totalItems-prizeCount){
    startIdx=Math.max(0, Math.floor(totalItems/2)-spins*prizeCount-targetInSet);
    targetIdx=startIdx + spins*prizeCount + targetInSet;
  }
  if(startIdx<0||targetIdx<0||startIdx>=totalItems||targetIdx>=totalItems||!track.children[startIdx]||!track.children[targetIdx]){
    abortPendingSpin('转盘索引异常，已退回本次次数');
    return;
  }

  // 先归零再测量：用视口几何对齐「容器中线」与「格子中心」，避免统一步长与 flex 实际宽度不一致导致错位
  track.style.transition='none';
  track.style.transform='translateX(0px)';
  void track.offsetWidth;

  var containerRect=container.getBoundingClientRect();
  var centerViewportX=containerRect.left+containerRect.width*0.5;

  function translateXToAlignIndex(idx){
    var el=track.children[idx];
    if(!el)return 0;
    var ir=el.getBoundingClientRect();
    var itemCenterX=ir.left+ir.width*0.5;
    return centerViewportX-itemCenterX;
  }

  var startX=translateXToAlignIndex(startIdx);
  var endX=translateXToAlignIndex(targetIdx);

  var firstItem=track.children[0];
  var itemWidth=(firstItem?firstItem.offsetWidth:0);
  if(!itemWidth){
    abortPendingSpin('转盘尺寸异常，已退回本次次数');
    return;
  }
  var itemGap=0;
  try{
    if(firstItem)itemGap=parseFloat(getComputedStyle(firstItem).marginRight)||0;
  }catch(e){itemGap=0;}
  var itemStep=(itemWidth+itemGap)||1;

  // 关键修复：不要在 rAF 中每帧叠加 CSS transition（会抖动）。
  // 采用“单次 transform 过渡 + 结束对齐”，保证丝滑横向滚动。
  var duration=6200+randInt(300,800);
  var startTime=performance.now();
  var lastTickBlock=-1;

  track.style.transition='none';
  track.style.transform='translateX('+startX+'px)';
  // 强制回流，确保 transition 生效
  void track.offsetWidth;
  track.style.transition='transform '+duration+'ms cubic-bezier(0.12, 0.78, 0.16, 1)';
  track.style.transform='translateX('+endX+'px)';

  function easeProgress(p){
    // 近似原来的两段 easing，用于 tick 频率与按钮态
    if(p<0.78){
      var p1=p/0.78;
      return 0.9*(1-Math.pow(1-p1,2.2));
    }
    var p2=(p-0.78)/0.22;
    return 0.9+0.1*(1-Math.pow(1-p2,3.6));
  }

  var btnCached=$('openBtn');
  function tickLoop(now){
    var elapsed=now-startTime;
    var progress=Math.min(elapsed/duration,1);
    var eased=easeProgress(progress);
    var traveled=Math.abs((endX-startX)*eased);
    var travelBlock=Math.floor(traveled/itemStep);
    if(travelBlock>lastTickBlock&&progress>0.06&&progress<0.985){
      lastTickBlock=travelBlock;
      snd('tick');
    }
    if(btnCached)btnCached.className='open-btn'+(progress<1?' spinning':'');
    if(progress<1){
      requestAnimationFrame(tickLoop);
    }
  }
  requestAnimationFrame(tickLoop);

  var spinFinishHandled=false;
  var spinFailTimer=setTimeout(function(){
    if(spinFinishHandled)return;
    spinFinishHandled=true;
    try{ track.removeEventListener('transitionend', onEnd); }catch(e){}
    track.style.transition='none';
    var btnFail=$('openBtn');
    if(btnFail)btnFail.className='open-btn';
    // 超时后也更新按钮状态
    updateOpenBtn();
    updateOneClickBtn();
    setTimeout(showResult,300);
  },duration+900);

  function onEnd(e){
    if(spinFinishHandled)return;
    if(e&&e.propertyName!=='transform')return;
    spinFinishHandled=true;
    clearTimeout(spinFailTimer);
    track.removeEventListener('transitionend', onEnd);
    track.style.transition='none';
    var btn=$('openBtn');
    if(btn)btn.className='open-btn';
    // 动画结束后更新按钮状态
    updateOpenBtn();
    updateOneClickBtn();
    setTimeout(showResult,300);
  }
  track.addEventListener('transitionend', onEnd);
}

// ===== 结果展示 =====
function showResult(){
  animPhase='reveal';
  S.isSpinning=false;
  _spinRestore=null;
  if(!currentPrize)return;

  // 记录
  S.totalOpens++;
  awardsCache=null;
  save();

  var rc=RARITY[currentPrize.rarity]||RARITY.gray;
  if(currentPrize.rarity==='gold'||currentPrize.rarity==='legend'){
    snd('gold');emit(190,260,80,['#ffd700','#ffcc00','#fff','#e4ae39','#f07020']);
  }else{
    snd('win');emit(190,260,35,[rc.color,'#ffffff']);
  }

  // 设置结果UI
  $('resRarity').textContent=rc.label;
  $('resRarity').className='result-rarity rr-'+rc.cssClass;
  $('resIcon').innerHTML='<img class="result-icon-img" src="'+getIconSrc(currentPrize.icon)+'" alt="'+currentPrize.name+'图标">';
  $('resIcon').className='result-icon ri-'+rc.cssClass;
  $('resName').textContent=currentPrize.name;
  $('resDesc').textContent=currentPrize.desc;
  $('resValue').textContent='价值 \uFFE5 '+currentPrize.value.toLocaleString();
  $('resValue').className='result-value rv-'+rc.cssClass;

  // 切换页（用缓存）
  for(var si=0;si<allScreenEls.length;si++)allScreenEls[si].classList.remove('active');
  $('resultScreen').classList.add('active');
  
  // 隐藏底部导航栏
  var bottomNav=document.querySelector('.bottom-nav');
  if(bottomNav)bottomNav.style.display='none';

  resultBgRarity=currentPrize.rarity;

  if(oneClickSessionTotal>0){
    oneClickSessionDone++;
    if(oneClickSessionDone<oneClickSessionTotal){
      setTimeout(function(){
        if(getOpensForTier(S.currentTier)<=0){
          oneClickSessionTotal=0;
          oneClickSessionDone=0;
          return;
        }
        for(var si=0;si<allScreenEls.length;si++)allScreenEls[si].classList.remove('active');
        $('openScreen').classList.add('active');
        // 隐藏底部导航栏
        var bottomNav=document.querySelector('.bottom-nav');
        if(bottomNav)bottomNav.style.display='none';
        initOpenScreen();
        updateUI();
        requestAnimationFrame(function(){ doOpen(); });
      },650);
    }else{
      var batchN=oneClickSessionTotal;
      oneClickSessionTotal=0;
      oneClickSessionDone=0;
      if(batchN>1)toast('本轮一键开箱已完成');
    }
  }
}

// ===== 结果背景动画（缓存 RGB 避免每帧 parseInt） =====
var _rarityRgbCache={};
function getRarityRgb(rarity){
  if(_rarityRgbCache[rarity])return _rarityRgbCache[rarity];
  var rc=RARITY[rarity]||RARITY.blue;
  var h=rc.color.replace('#','');
  _rarityRgbCache[rarity]=[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];
  return _rarityRgbCache[rarity];
}
function drawResultBg(rarity){
  if(!resBgCtx||!resBgCvs)return;
  var ctx=resBgCtx,w=resBgCvs.width,h=resBgCvs.height;
  var cx=w/2,cy=h/2,t=Date.now();
  ctx.clearRect(0,0,w,h);

  var rgb=getRarityRgb(rarity);
  var rH=rgb[0],gH=rgb[1],bH=rgb[2];

  var hi=rarity==='gold'||rarity==='legend';
  var gs=hi?320:rarity==='red'?260:200;
  var grd=ctx.createRadialGradient(cx,cy-50,8,cx,cy-50,gs+(t%4000)*0.006);
  grd.addColorStop(0,'rgba('+rH+','+gH+','+bH+','+(0.08+Math.sin(t*0.0008)*0.04)+')');
  grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);

  var cnt=hi?35:rarity==='red'?24:16;
  for(var i=0;i<cnt;i++){
    var px=cx+Math.sin(t*0.0006+i*1.4)*(120+(i%3)*40)+((i*41)%w-w/2)*0.4;
    var py=cy+Math.cos(t*0.0005+i*1.8)*(90+(i%2)*30)+((i*53)%h-h/2)*0.35;
    var sz=(hi?3.5:rarity==='red'?2.5:1.5)+Math.sin(t*0.002+i)*1.2;
    var a=(hi?0.4:rarity==='red'?0.22:0.1)*(0.5+Math.sin(t*0.002+i*2)*0.5);
    ctx.fillStyle='rgba('+rH+','+gH+','+bH+','+a+')';
    ctx.fillRect(px,py,sz,sz);
  }
}

// ===== 导航切换 =====
function switchTab(tab){
  if(tab==='menu'||tab==='invite'||tab==='awards'){
    oneClickSessionTotal=0;
    oneClickSessionDone=0;
  }
  for(var i=0;i<allScreenEls.length;i++)allScreenEls[i].classList.remove('active');
  var tabs=document.querySelectorAll('.nav-tab');
  for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');
  
  // 底部导航栏元素
  var bottomNav=document.querySelector('.bottom-nav');
  if(bottomNav)bottomNav.style.display='none';

  if(tab==='menu'){$('menuScreen').classList.add('active');$('tabMenu').classList.add('active');if(bottomNav)bottomNav.style.display='flex';}
  else if(tab==='open'){$('openScreen').classList.add('active')}
  else if(tab==='awards'){$('awardsScreen').classList.add('active');$('tabAwards').classList.add('active');if(bottomNav)bottomNav.style.display='flex';loadAwards();}
  else if(tab==='invite'){$('inviteScreen').classList.add('active');$('tabInv').classList.add('active');if(bottomNav)bottomNav.style.display='flex';updateInvite()}

  snd('click');updateUI();
}

function renderAwards(list){
  var wrap=$('awardsList');
  var countEl=$('awardCount');
  if(countEl)countEl.textContent=(list&&list.length?list.length:0)+'个';
  if(!wrap)return;
  if(!S.userPhone){
    wrap.innerHTML='<div class="awards-empty">登录后查看已获得奖品</div>';
    return;
  }
  if(!list||!list.length){
    wrap.innerHTML='<div class="awards-empty">暂未获得奖品</div>';
    return;
  }
  var html='';
  for(var i=0;i<list.length;i++){
    var item=list[i];
    var rarity=item.prize_rarity||item.prizeRarity||'gray';
    var rc=RARITY[rarity]||RARITY.gray;
    html+='<div class="award-item award-'+escapeHtml(rc.cssClass)+'">'
      +'<div class="award-main">'
        +'<div class="award-name">'+escapeHtml(item.prize_name||item.prizeName||'奖品')+'</div>'
        +'<div class="award-meta">'
          +'<span>'+escapeHtml(getTierName(item.tier))+'</span>'
          +'<span class="award-rarity">'+escapeHtml(rc.label)+'</span>'
          +'<span>¥'+Number(item.prize_value||item.prizeValue||0).toLocaleString()+'</span>'
        +'</div>'
      +'</div>'
      +'<time class="award-time">'+escapeHtml(formatTime(item.created_at||item.createdAt))+'</time>'
    +'</div>';
  }
  wrap.innerHTML=html;
}

function loadAwards(){
  if(!S.apiToken){
    awardsCache=[];
    renderAwards([]);
    return;
  }
  var wrap=$('awardsList');
  if(wrap&&!awardsCache)wrap.innerHTML='<div class="awards-empty">正在加载...</div>';
  apiRequest('/api/awards')
    .then(function(data){
      awardsCache=data.awards||[];
      renderAwards(awardsCache);
    })
    .catch(function(err){
      if(wrap)wrap.innerHTML='<div class="awards-empty">'+escapeHtml(err.message||'奖品记录加载失败')+'</div>';
    });
}

function getOwnInviteCount(){
  if(S.apiToken)return Math.min(Number(S.invites||0),5);
  if(!S.referralCode)return 0;
  var book=getReferralBook();
  var rec=book[S.referralCode];
  return rec&&rec.count?Math.min(rec.count,5):0;
}

function updateInviteLinkUI(){
  var input=$('inviteLink');
  var intro=$('inviteIntro');
  var notice=$('pendingReferralNotice');
  if(input){
    input.value=S.userPhone?getReferralLink():'登录后生成邀请链接';
  }
  if(intro){
    intro.textContent=S.userPhone
      ? '分享你的专属链接，新用户完成手机号验证后，双方各得 1 次普通宝箱抽奖积分。'
      : '先完成手机号验证，即可生成专属邀请链接。';
  }
  if(notice){
    if(S.pendingReferralCode&&!S.hasClaimedReferralJoin){
      notice.textContent='你正在通过好友邀请进入，完成手机号验证后可获得邀请奖励。';
      notice.style.display='block';
    }else{
      notice.textContent='';
      notice.style.display='none';
    }
  }
}

function copyInviteLink(){
  if(!S.userPhone){
    toast('请先手机号登录后再复制邀请链接');
    openPhoneModal();
    return;
  }
  var link=getReferralLink();
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){
      toast('邀请链接已复制');
    }).catch(function(){
      fallbackCopyInviteLink(link);
    });
  }else{
    fallbackCopyInviteLink(link);
  }
}

function fallbackCopyInviteLink(link){
  var input=$('inviteLink');
  if(input){
    input.focus();
    input.select();
  }
  try{
    document.execCommand('copy');
    toast('邀请链接已复制');
  }catch(e){
    toast(link);
  }
}

function shareInviteLink(){
  if(!S.userPhone){
    toast('请先手机号登录后再分享邀请链接');
    openPhoneModal();
    return;
  }
  var link=getReferralLink();
  if(navigator.share){
    navigator.share({
      title:'宝箱抽奖',
      text:'送你 1 次普通宝箱抽奖机会',
      url:link
    }).catch(function(){});
  }else{
    copyInviteLink();
  }
}

// 首页选箱：先弹奖池预览（与 CASES 抽奖数据一致），确认后再进入开箱页
function openPrizePoolModal(tier){
  var c=CASES[tier];
  if(!c)return;
  pendingPoolTier=tier;
  var modal=$('prizePoolModal');
  var dlg=modal?modal.querySelector('.prize-pool-dialog'):null;
  if(dlg)dlg.setAttribute('data-tier',tier);
  var tEl=$('prizePoolTitle');if(tEl)tEl.textContent=c.name+' · 奖池一览';
  var sEl=$('prizePoolSub');
  if(sEl){
    var sub=c.subtitle+' · 以下为可能获得的奖品及中奖概率';
    if(tier==='basic'){
      sub+=' · 按后台配置发放普通宝箱次数';
    }else if(tier==='advanced'){
      sub+=' · 特等奖保底：至多20次必出 · 按后台配置发放次数';
    }else if(tier==='premium'){
      sub+=' · 传奇奖保底：至多40次必出 · 按后台配置发放次数';
    }
    sEl.textContent=sub;
  }
  var list=$('prizePoolList');
  if(!list)return;
  list.innerHTML='';
  var totalW=0;
  for(var wi=0;wi<c.prizes.length;wi++)totalW+=c.prizes[wi].weight;
  for(var j=0;j<c.prizes.length;j++){
    var p=c.prizes[j], rc=RARITY[p.rarity]||RARITY.gray;
    var pct=totalW>0?(p.weight/totalW*100):0;
    var el=document.createElement('div');
    el.className='prize-pool-item pp-'+rc.cssClass;
    el.innerHTML='<div class="prize-pool-item-inner">'
      +'<div class="pp-icon-wrap"><img class="pp-icon" src="'+getIconSrc(p.icon)+'" alt="" /></div>'
      +'<div class="pp-body">'
        +'<div class="pp-name">'+escapeHtml(p.name)+'</div>'
        +'<div class="pp-row"><span class="pp-rarity">'+rc.label+'</span>'
        +'<span class="pp-value">\uFFE5'+Number(p.value).toLocaleString()+'</span>'
        +'<span class="pp-pct">\u7EA6 '+pct.toFixed(1)+'%</span></div>'
        +'<div class="pp-desc">'+escapeHtml(p.desc)+'</div>'
      +'</div></div>';
    list.appendChild(el);
  }
  if(modal){
    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden','false');
  }
  document.body.style.overflow='hidden';
  snd('click');
}

function closePrizePoolModal(){
  var modal=$('prizePoolModal');
  if(modal){
    modal.classList.remove('modal--open');
    modal.setAttribute('aria-hidden','true');
  }
  document.body.style.overflow='';
  pendingPoolTier=null;
  snd('click');
}

function confirmPrizePoolAndEnter(){
  if(!pendingPoolTier)return;
  var t=pendingPoolTier;
  var modal=$('prizePoolModal');
  if(modal){
    modal.classList.remove('modal--open');
    modal.setAttribute('aria-hidden','true');
  }
  document.body.style.overflow='';
  pendingPoolTier=null;
  S.currentTier=t;
  switchTab('open');
  requestAnimationFrame(initOpenScreen);
  snd('click');
}

function selectCase(tier){
  openPrizePoolModal(tier);
}

/** 开箱页：将当前档位剩余次数一次性连续开完 */
function openOneClickOnCurrentScreen(){
  if(S.isSpinning){toast('开箱进行中，请稍候');return;}
  if(oneClickSessionTotal>0){toast('请等待本轮一键开箱结束');return;}
  var n=getOpensForTier(S.currentTier);
  if(n<=0){toast('暂无开箱次数');return;}
  oneClickSessionTotal=n;
  oneClickSessionDone=0;
  doOpen();
}

// 返回菜单 / 再来一箱
function goMenu(){
  oneClickSessionTotal=0;
  oneClickSessionDone=0;
  switchTab('menu');
}
function openAgain(){
  if(oneClickSessionTotal>0)return;
  for(var i=0;i<allScreenEls.length;i++)allScreenEls[i].classList.remove('active');
  $('openScreen').classList.add('active');
  // 隐藏底部导航栏
  var bottomNav=document.querySelector('.bottom-nav');
  if(bottomNav)bottomNav.style.display='none';
  initOpenScreen();updateUI();
}

// ===== 启动页 → 菜单页 =====
function enterGame(){
  console.log('[enterGame] called!');
  $('splashScreen').classList.remove('active');
  $('menuScreen').classList.add('active');
  // 隐藏底部导航栏
  var bottomNav=document.querySelector('.bottom-nav');
  if(bottomNav)bottomNav.style.display='flex';
  snd('click');
}

// ===== 邀请（进度由服务端同步时可在此更新 UI） =====
function updateInvite(){
  if(S.userPhone)ensureReferralCode();
  var count=getOwnInviteCount();
  if(!S.apiToken&&S.userPhone&&count>S.inviteRewardedCount){
    var add=Math.min(count,5)-Math.min(S.inviteRewardedCount,5);
    if(add>0){
      S.freeOpens+=add;
      S.inviteRewardedCount=Math.min(count,5);
      toast('邀请奖励到账，已获得 '+add+' 次普通宝箱积分');
    }
  }
  S.invites=count;
  var ic=$('invCount');if(ic)ic.textContent=count;
  var ib=$('invBar');if(ib)ib.style.width=Math.min(count/5*100,100)+'%';
  var rw1=$('rw1');if(rw1){rw1.textContent=count>=1?'已完成':'未完成';rw1.className='ri-status'+(count>=1?' done':'');}
  var rw2=$('rw2');if(rw2){rw2.textContent=count>=3?'已完成':'未完成';rw2.className='ri-status'+(count>=3?' done':'');}
  var rw3=$('rw3');if(rw3){rw3.textContent=count>=5?'已完成':'未完成';rw3.className='ri-status'+(count>=5?' done':'');}
  updateInviteLinkUI();
  save();
}

// ===== UI更新 =====
function updateUI(){
  var menuValue='';
  var openValue='';
  if(S.currentTier==='advanced'){
    menuValue=S.advancedOpens+'积分';
    openValue=S.advancedOpens+'积分';
  }else if(S.currentTier==='premium'){
    menuValue=S.premiumOpens+'积分';
    openValue=S.premiumOpens+'积分';
  }else{
    menuValue=S.freeOpens+'次';
    openValue=S.freeOpens+'次';
  }

  var mc=$('menuCoins');if(mc)mc.textContent=menuValue;
  var oc=$('openCoins');if(oc)oc.textContent=openValue;
  var ic2=$('invCoins');if(ic2)ic2.textContent=S.invites+'\u4EBA';
  updateOpenBtn();
  updateOneClickBtn();
  updateInviteLinkUI();
}

function getActiveScreen(){
  var screens=['splashScreen','menuScreen','openScreen','resultScreen','inviteScreen','awardsScreen'];
  for(var i=0;i<screens.length;i++){
    var el=$(screens[i]);
    if(el&&el.classList.contains('active'))return screens[i];
  }
  return 'unknown';
}

function renderGameToText(){
  var payload={
    coordinateSystem:'canvas origin at top-left, +x right, +y down',
    activeScreen:getActiveScreen(),
    currentTier:S.currentTier,
    resources:{
      freeOpens:S.freeOpens,
      advancedOpens:S.advancedOpens,
      premiumOpens:S.premiumOpens,
      pityAdvanced:S.pityAdvanced,
      pityPremium:S.pityPremium
    },
    totals:{
      opens:S.totalOpens,
      invites:S.invites
    },
    animation:{
      phase:animPhase,
      isSpinning:S.isSpinning
    },
    currentPrize:currentPrize?{
      id:currentPrize.id,
      name:currentPrize.name,
      rarity:currentPrize.rarity,
      value:currentPrize.value
    }:null
  };
  return JSON.stringify(payload);
}

function advanceTime(ms){
  var steps=Math.max(1,Math.round(ms/(1000/60)));
  for(var i=0;i<steps;i++){
    updateP();
  }
  if(elMenuScreen&&elMenuScreen.classList.contains('active')){
    if(typeof drawPreviewCase==='function')drawPreviewCase(S.currentTier);
  }
  if(elOpenScreen&&elOpenScreen.classList.contains('active')&&animPhase!=='opening'){
    drawOpenCase(0,0,false);
  }
  if(elResultScreen&&elResultScreen.classList.contains('active')){
    drawResultBg(resultBgRarity);
  }
}

function toggleFullscreen(){
  var root=document.documentElement;
  if(!document.fullscreenElement){
    if(root.requestFullscreen)root.requestFullscreen();
  }else{
    if(document.exitFullscreen)document.exitFullscreen();
  }
}

// ===== 主循环 =====
function gameLoop(){
  try{
    var openActive=elOpenScreen&&elOpenScreen.classList.contains('active');
    var resultActive=elResultScreen&&elResultScreen.classList.contains('active');

    if(openActive&&animPhase!=='opening'&&_openCaseNeedsDraw){
      drawOpenCase(0,0,false);
      _openCaseNeedsDraw=false;
    }
    if(resultActive){
      drawResultBg(resultBgRarity);
    }
  }catch(e){/* ignore render errors */}

  try{updateP();}catch(e){}
  requestAnimationFrame(gameLoop);
}

// ===== 初始化入口 =====
function initGame(){
  load();
  readReferralFromUrl();

  elMenuScreen=$('menuScreen');
  elOpenScreen=$('openScreen');
  elResultScreen=$('resultScreen');
  allScreenEls=document.querySelectorAll('.screen');

  // 初始化所有Canvas
  openCvs=$('openCanvas');
  if(openCvs)openCtx=openCvs.getContext('2d');
  else console.warn('[initGame] openCanvas not found');

  pCanvas=$('particles');
  if(pCanvas)pCtx=pCanvas.getContext('2d');

  resBgCvs=$('resultBgCanvas');
  if(resBgCvs)resBgCtx=resBgCvs.getContext('2d');

  // 预加载宝箱图片
  ensureBoxImage('basic');ensureBoxImage('advanced');ensureBoxImage('premium');

  // 开箱页标题、轮盘、档位主题与当前档位一致
  initOpenScreen();

  updateInvite();
  updateUI();save();

  // 检查是否已登录，显示客户信息
  refreshLoginDisplay();
  syncSessionFromServer();

  // 注册所有函数到window（确保onclick能找到）
  window.enterGame = enterGame;
  window.doOpen = doOpen;
  window.selectCase = selectCase;
  window.openPrizePoolModal = openPrizePoolModal;
  window.closePrizePoolModal = closePrizePoolModal;
  window.confirmPrizePoolAndEnter = confirmPrizePoolAndEnter;
  window.handleOpenBtnClick = handleOpenBtnClick;
  window.switchTab = switchTab;
  window.goMenu = goMenu;
  window.openAgain = openAgain;
  window.openOneClickOnCurrentScreen = openOneClickOnCurrentScreen;
  window.render_game_to_text = renderGameToText;
  window.advanceTime = advanceTime;
  window.openPhoneModal = openPhoneModal;
  window.closePhoneModal = closePhoneModal;
  window.verifyPhoneAndClaim = verifyPhoneAndClaim;
  window.loginCustomer = loginCustomer;
  window.closeGrantModal = closeGrantModal;
  window.copyInviteLink = copyInviteLink;
  window.shareInviteLink = shareInviteLink;
  window.loadAwards = loadAwards;

  // 给按钮绑定备用事件监听（防止onclick失效）
  var opBtn=document.getElementById('openBtn');
  if(opBtn)opBtn.addEventListener('click',handleOpenBtnClick);

  document.addEventListener('keydown',function(e){
    if(e.key&&e.key.toLowerCase()==='f')toggleFullscreen();
    if(e.key==='Escape'){
      var pp=$('prizePoolModal');
      if(pp&&pp.classList.contains('modal--open'))closePrizePoolModal();
      var ph=$('phoneModal');
      if(ph&&ph.classList.contains('modal--open'))closePhoneModal();
      var gm=$('grantModal');
      if(gm&&gm.classList.contains('modal--open'))closeGrantModal();
    }
  });

  requestAnimationFrame(gameLoop);
}

// 启动：等DOM就绪后执行
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initGame);
}else{
  initGame();
}
