var connected=false;
var wallet='';
var price=0.0052;
var turboType='30d';
var betType='';
var betNum=0;
var stakeDays=30;
var user={balance:15000,staked:0,released:0,usdt:500};

function connectWallet(){
    var btn=document.getElementById('cBtn');
    btn.innerHTML='连接中...';
    setTimeout(function(){
        wallet='T'+Math.random().toString(36).substr(2,33);
        connected=true;
        btn.style.display='none';
        document.getElementById('dBtn').style.display='block';
        document.getElementById('wInfo').style.display='flex';
        document.getElementById('wAddr').innerHTML=wallet.substr(0,6)+'...'+wallet.substr(-4);
        updateUI();
        alert('连接成功！演示: 15000 PANDA');
    },800);
}

function disconnectWallet(){
    connected=false;
    wallet='';
    user={balance:15000,staked:0,released:0,usdt:500};
    document.getElementById('cBtn').style.display='block';
    document.getElementById('cBtn').innerHTML='连接钱包';
    document.getElementById('dBtn').style.display='none';
    document.getElementById('wInfo').style.display='none';
    document.getElementById('stForm').classList.remove('show');
    updateUI();
}

function updateUI(){
    document.getElementById('wBal').innerHTML=user.balance.toLocaleString();
    document.getElementById('tBal').innerHTML='可用: '+user.balance.toLocaleString()+' PANDA';
    document.getElementById('sBal').innerHTML='可Swap: '+user.released.toLocaleString()+' PANDA';
    document.getElementById('dBal').innerHTML='可用: '+user.balance.toLocaleString()+' PANDA';
    document.getElementById('stBal').innerHTML=user.balance.toLocaleString()+' PANDA';
}

function switchTab(tab){
    document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active')});
    event.target.classList.add('active');
    document.querySelectorAll('.panels').forEach(function(p){p.classList.remove('active')});
    document.getElementById(tab+'P').classList.add('active');
}

function setMaxTurbo(){document.getElementById('tAmt').value=user.balance;calcTurbo();}
function setMaxSwap(){document.getElementById('sAmt').value=user.released;calcSwap();}
function setMaxStake(){document.getElementById('stAmt').value=user.balance;calcStake();}
function setMaxDice(){document.getElementById('dAmt').value=user.balance;}

function selectTurbo(el,type){
    document.querySelectorAll('#turboP .topt .opt').forEach(function(o){o.classList.remove('selected')});
    el.classList.add('selected');
    turboType=type;
    calcTurbo();
}

function calcTurbo(){
    var amt=parseFloat(document.getElementById('tAmt').value)||0;
    var fee=0,out=amt;
    if(turboType==='direct'){fee=amt*0.2;out=amt*0.8;}
    else if(turboType==='30d'){fee=amt*0.1;out=amt*0.9;}
    document.getElementById('tOut').innerHTML=out.toLocaleString()+' PANDA';
    document.getElementById('tFee').innerHTML=fee.toLocaleString()+' PANDA';
    document.getElementById('tUSD').innerHTML='$'+(out*price*0.95).toFixed(2);
}

function calcSwap(){
    var amt=parseFloat(document.getElementById('sAmt').value)||0;
    document.getElementById('sOut').innerHTML='$'+(amt*price).toFixed(2);
    document.getElementById('sFee').innerHTML='$'+(amt*price*0.05).toFixed(2);
}

function calcStake(){
    var amt=parseFloat(document.getElementById('stAmt').value)||0;
    var rate=stakeDays===30?0.15:stakeDays===60?0.45:0.9;
    var reward=(amt*rate*stakeDays)/365;
    document.getElementById('stConfAmt').innerHTML=amt.toLocaleString();
    document.getElementById('stConfDays').innerHTML=stakeDays+'天';
    document.getElementById('stConfRew').innerHTML=reward.toFixed(2)+' PANDA';
    document.getElementById('dailyE').innerHTML=(reward/stakeDays).toFixed(4)+' PANDA/天';
}

function executeTurbo(){
    if(!connected){alert('请先连接钱包');return;}
    var amt=parseFloat(document.getElementById('tAmt').value);
    if(!amt||amt<=0){alert('请输入数量');return;}
    if(amt>user.balance){alert('余额不足');return;}
    var fee=0;
    if(turboType==='direct')fee=amt*0.2;
    else if(turboType==='30d')fee=amt*0.1;
    var release=amt-fee;
    user.balance-=amt;
    if(turboType==='direct'){
        user.usdt+=release*price*0.95;
        alert('Turbo成功！释放:'+release.toLocaleString()+' PANDA 获得:$'+(release*price*0.95).toFixed(2));
    }else{
        user.released+=release;
        alert('Turbo成功！释放:'+release.toLocaleString()+' PANDA');
    }
    updateUI();
    document.getElementById('tAmt').value='';
    calcTurbo();
}

function executeSwap(){
    if(!connected){alert('请先连接钱包');return;}
    var amt=parseFloat(document.getElementById('sAmt').value);
    if(!amt||amt<=0){alert('请输入数量');return;}
    if(amt>user.released){alert('可Swap代币不足(Turbo释放)');return;}
    user.released-=amt;
    user.usdt+=amt*price*0.95;
    updateUI();
    alert('Swap成功！交换:'+amt.toLocaleString()+' PANDA 获得:$'+(amt*price*0.95).toFixed(2));
    document.getElementById('sAmt').value='';
    calcSwap();
}

function redeemKey(){
    if(!connected){alert('请先连接钱包');return;}
    var key=document.getElementById('keyIn').value.trim();
    if(!key){alert('请输入密钥');return;}
    var tokens=Math.floor(Math.random()*2500)+500;
    user.balance+=tokens;
    updateUI();
    alert('🎉 盲盒开启！获得: '+tokens.toLocaleString()+' PANDA');
    document.getElementById('keyIn').value='';
}

function showStake(days){
    if(!connected){alert('请先连接钱包');return;}
    stakeDays=days;
    document.getElementById('stTitle').innerHTML='质押 - '+days+'天';
    document.getElementById('stForm').classList.add('show');
    calcStake();
}

function confirmStake(){
    if(!connected){alert('请先连接钱包');return;}
    var amt=parseFloat(document.getElementById('stAmt').value);
    if(!amt||amt<=0){alert('请输入数量');return;}
    if(amt>user.balance){alert('余额不足');return;}
    user.balance-=amt;
    user.staked+=amt;
    updateUI();
    var rate=stakeDays===30?0.15:stakeDays===60?0.45:0.9;
    var reward=(amt*rate*stakeDays)/365;
    alert('质押成功！数量:'+amt.toLocaleString()+' 期限:'+stakeDays+'天 收益:'+reward.toFixed(2)+' PANDA');
    document.getElementById('stForm').classList.remove('show');
}

function selectBet(type){
    betType=type;
    betNum=0;
    document.querySelectorAll('.dbet').forEach(function(x){x.classList.remove('selected')});
    event.target.classList.add('selected');
    document.querySelectorAll('.dnum').forEach(function(n){n.classList.remove('selected')});
}

function selectNum(num){
    betType='num';
    betNum=num;
    document.querySelectorAll('.dbet').forEach(function(x){x.classList.remove('selected')});
    document.querySelectorAll('.dnum').forEach(function(x){x.classList.remove('selected')});
    event.target.classList.add('selected');
}

function rollDice(){
    if(!connected){alert('请先连接钱包');return;}
    var amt=parseFloat(document.getElementById('dAmt').value);
    if(!amt||amt<=0){alert('请输入数量');return;}
    if(amt>user.balance){alert('余额不足');return;}
    if(!betType){alert('请选择下注类型');return;}
    user.balance-=amt;
    var d1=Math.floor(Math.random()*6)+1;
    var d2=Math.floor(Math.random()*6)+1;
    var d3=Math.floor(Math.random()*6)+1;
    var sum=d1+d2+d3;
    var isTriple=(d1===d2&&d2===d3);
    var isBig=(sum>=11&&!isTriple);
    var isSmall=(sum<=10&&!isTriple);
    var win=false;
    var winAmt=0;
    if(betType==='big'&&isBig){win=true;winAmt=amt;}
    if(betType==='small'&&isSmall){win=true;winAmt=amt;}
    if(betType==='num'&&(d1===betNum||d2===betNum||d3===betNum)){win=true;winAmt=amt*5;}
    if(win){
        user.balance+=winAmt;
        alert('🎉 获胜！骰子:'+d1+' '+d2+' '+d3+'='+sum+' 赢得:'+winAmt.toLocaleString());
    }else{
        alert('😢 未中 骰子:'+d1+' '+d2+' '+d3+'='+sum);
    }
    updateUI();
}

setInterval(function(){
    price=price*(1+(Math.random()-0.4)*0.001);
    document.getElementById('pDis').innerHTML='$'+price.toFixed(4);
},3000);
