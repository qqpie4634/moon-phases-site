(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const names = ['新月','眉月','上弦月','盈凸月','滿月','虧凸月','下弦月','殘月'];
  const mod = n => ((n % 24) + 24) % 24;
  const time = h => `${String(Math.floor(mod(h))).padStart(2,'0')}:${mod(h)%1 ? '30' : '00'}`;
  const rise = p => mod(6 + p * 3);
  function position(p,h) {
    const age = mod(h-rise(p));
    if (age > 12) return '地平線下';
    if (age === 0) return '東方地平線附近';
    if (age === 12) return '西方地平線附近';
    if (age === 6) return '南方天空';
    return age < 6 ? '東側天空' : '西側天空';
  }
  let animation = null;
  function stop() { clearInterval(animation); animation=null; el('skyPlay').textContent='▶ 播放一天'; }
  function draw() {
    const p=Number(el('skyPhase').value), h=Number(el('hour').value), age=mod(h-rise(p));
    el('clock').textContent=time(h); el('timeText').textContent=time(h);
    el('skyBg').setAttribute('fill',h>=6 && h<18 ? '#285d80' : '#12223e');
    let shape='';
    if(age<=12){
      const x=70+660*age/12, y=310-235*Math.sin(Math.PI*age/12), r=22;
      let rows=''; const angle=p*Math.PI/4, f=(1-Math.cos(angle))/2;
      for(let yy=-r;yy<=r;yy++){
        const half=Math.sqrt(Math.max(0,r*r-yy*yy)), limb=half*Math.abs(Math.cos(angle));
        const left=p<=4?(f<=.5?limb:-limb):-half;
        const right=p<=4?half:(f<=.5?-limb:limb);
        if(p!==0) rows+=`<rect x="${left}" y="${yy}" width="${Math.max(0,right-left)}" height="1" fill="#fff0bf"/>`;
      }
      shape=`<g transform="translate(${x} ${y})"><circle r="22" fill="#102039" stroke="#dbe8ef" ${p===0?'stroke-dasharray="3 3"':''}/>${rows}<text y="-34" text-anchor="middle" fill="white" font-size="19">${names[p]}</text></g>`;
    }
    el('skyMoon').innerHTML=shape;
    const where=position(p,h);
    el('skyTitle').textContent=`${time(h)}，${names[p]}：${where}，簡化地面視角`;
    el('skyStatus').textContent=`${time(h)} 的${names[p]}，模型位置：${where}。`+(p===0?'新月通常看不見，虛線圓只標示位置。':age>12?'月亮還在地平線下，這時看不到。':h>=6&&h<18?'白天也可能看見月亮，但亮度、天氣等會影響觀測。':'試著再移動時間，觀察它往哪裡走。');
    el('schedule').textContent=`模型時刻：約 ${time(rise(p))} 東升 → ${time(rise(p)+6)} 到南方天空 → ${time(rise(p)+12)} 西落。`;
  }
  el('skyPhase').onchange=()=>{stop();draw();}; el('hour').oninput=()=>{stop();draw();};
  document.querySelectorAll('[data-hour]').forEach(b=>b.onclick=()=>{stop();el('hour').value=b.dataset.hour;draw();});
  el('skyPlay').onclick=()=>{if(animation){stop();return;}let ticks=0;el('skyPlay').textContent='⏸ 暫停';animation=setInterval(()=>{el('hour').value=mod(Number(el('hour').value)+.5);draw();if(++ticks>=48)stop();},500);};
  const bank=[];
  const add=(category,q,options,answer,why,scene,image)=>bank.push({id:bank.length,category,q,options,answer,why,scene,image});
  [2,4,6].forEach(p=>[0,6,12,18].forEach(h=>{
    const options=['東方地平線附近','南方天空','西方地平線附近','地平線下'];
    const ans=position(p,h);
    add('direction',`依簡化模型，${time(h)} 的${names[p]}大約在哪裡？`,options,options.indexOf(ans),`${names[p]}約 ${time(rise(p))} 東升，6 小時後到南方天空，再過 6 小時西落。因此 ${time(h)} 在${ans}。`,{p,h});
  }));
  [2,4,6].forEach(p=>[0,6,12].forEach(offset=>{
    const labels=['東方升起','南方天空','西方落下'];
    const options=['00:00','06:00','12:00','18:00'];const h=mod(rise(p)+offset);
    add('direction',`依簡化模型，${names[p]}大約幾點在${labels[offset/6]}？`,options,options.indexOf(time(h)),`${names[p]}約 ${time(rise(p))} 東升，每過 6 小時依序到南方天空與西方地平線。`,{p,h});
  }));
  [['南','東','西','北'],['北','西','東','南'],['東','北','南','西'],['西','南','北','東']].forEach(([face,left,right,back])=>{
    [['左手',left],['右手',right],['身後',back]].forEach(([side,ans])=>add('compass',`你面向${face}方，${side}是哪個方向？`,['東','南','西','北'],['東','南','西','北'].indexOf(ans),`面向${face}：左手是${left}，右手是${right}，身後是${back}。可以站起來轉身比一比。`));
  });
  [
    ['月亮的光主要從哪裡來？',['月球自己發光','反射太陽光','反射路燈光','星星照亮'],1,'月球主要反射太陽光，我們才能看見明亮的月面。'],
    ['一般月相變化的主要原因是？',['地球影子每天遮住月亮','月球形狀改變','看見的受光部分比例改變','雲把月亮切開'],2,'月球繞地球公轉，使我們看見的受光部分比例改變；月食才與進入地影有關。'],
    ['一晚之中，月亮大致由東向西移動，主要與什麼有關？',['地球自轉','月亮忽然加速','太陽繞地球','風吹月亮'],0,'地球自西向東自轉，使天空中的天體看起來大致由東向西移動。'],
    ['白天一定看不到月亮嗎？',['一定看不到','只有滿月才看得到','不一定，白天也可能看到','只有下雨才看到'],2,'月亮有時白天也在地平線上，能否看清楚還與亮度、天氣等有關。'],
    ['要判斷月亮大約在哪個方向，需要什麼資訊？',['只看月相','只看時間','月相和觀察時間','只看月亮大小'],2,'同一月相在不同時間，位置也不同；簡化題目要同時看月相與時間。'],
    ['以臺灣常見北半球示意，上弦月通常哪邊亮？',['左半邊','右半邊','整個都亮','完全不亮'],1,'上弦月的北半球標準示意通常右半邊亮；實際看起來的傾斜角度會變。'],
    ['滿月之後，下一個主要月相是？',['眉月','新月','盈凸月','虧凸月'],3,'滿月後受光比例逐漸減少，先經過虧凸月，再到下弦月。'],
    ['月亮在地平線下，表示它消失了嗎？',['是，明天重新出現','不是，只是被地球擋住視線','是，變成星星','是，沒有太陽光'],1,'月亮仍在太空中，只是這個位置的觀察者看不到它。']
  ].forEach(a=>add('concept',...a));
  function moonPicture(p) {
    let rows='';const r=70,angle=p*Math.PI/4,f=(1-Math.cos(angle))/2;
    for(let y=-r;y<=r;y++){
      const half=Math.sqrt(Math.max(0,r*r-y*y)),limb=half*Math.abs(Math.cos(angle));
      const left=p<=4?(f<=.5?limb:-limb):-half,right=p<=4?half:(f<=.5?-limb:limb);
      if(p!==0)rows+=`<rect x="${150+left}" y="${100+y}" width="${Math.max(0,right-left)}" height="1" fill="#fff0bf"/>`;
    }
    return `<svg viewBox="0 0 300 210" role="img" aria-label="月亮亮面辨識圖；此題需觀察圖形，可切換文字題"><rect width="300" height="210" rx="18" fill="#102039"/><circle cx="150" cy="100" r="70" fill="#030b15" stroke="#a8bdd5"/>${rows}</svg>`;
  }
  for(let p=0;p<8;p++){
    const others=names.filter((_,i)=>i!==p);const options=[names[p],others[(p+1)%7],others[(p+3)%7],others[(p+5)%7]];
    add('concept','看圖：依北半球標準示意，這是哪一種月相？',options,0,`這是${names[p]}。觀察亮面的多少與左右位置，再與八大月相比較。實際天空中的月面可能呈現不同傾斜角度。`,null,moonPicture(p));
  }
  [2,4,6].forEach(p=>[0,6,12].forEach(offset=>{
    const h=mod(rise(p)+offset),x=offset===0?60:offset===6?250:440,y=offset===6?65:210;
    const picture=`<svg viewBox="0 0 500 280" role="img" aria-label="面向南方的地面天空圖；圓形標示待判讀的位置，可切換文字題"><rect width="500" height="280" rx="18" fill="#102039"/><path d="M0 210H500V280H0Z" fill="#244838"/><circle cx="${x}" cy="${y}" r="20" fill="#fff0bf"/><g fill="white" text-anchor="middle" font-size="22"><text x="60" y="252">東</text><text x="250" y="252">南</text><text x="440" y="252">西</text></g></svg>`;
    const options=['00:00','06:00','12:00','18:00'];
    add('direction',`看圖：圓形只標示月亮的位置，不代表亮面。若月相是${names[p]}，依模型現在大約幾點？`,options,options.indexOf(time(h)),`${names[p]}約 ${time(rise(p))} 東升、${time(rise(p)+6)} 到南方天空、${time(rise(p)+12)} 西落；圖中位置對應 ${time(h)}。`,{p,h},picture);
  }));
  function matches(q){const c=el('category').value,f=el('format').value;return(c==='all'||q.category===c)&&(f==='all'||(f==='image'?Boolean(q.image):!q.image));}
  let seen=new Set(), current=null, answered=false, total=0, correct=0;
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function score(){el('score').textContent=`本輪答對 ${correct} / 已答 ${total} 題`;}
  function count(){const c=el('category').value;el('bankCount').textContent=`題庫共 ${bank.length} 題；目前類型 ${bank.filter(matches).length} 題。`;}
  function next(){
    const pool=bank.filter(matches);if(!pool.length){el('question').textContent='這個組合目前沒有題目，請選擇其他類型。';el('answers').replaceChildren();el('questionImage').hidden=true;el('feedback').textContent='';el('showModel').hidden=true;current=null;count();return;}let available=pool.filter(q=>!seen.has(q.id));
    if(!available.length){pool.forEach(q=>seen.delete(q.id));available=pool.filter(q=>q.id!==current?.id);if(!available.length)available=pool;}
    current=shuffle(available)[0];seen.add(current.id);answered=false;el('question').textContent=current.q;el('feedback').textContent='選一個答案，看看你的推理！';el('showModel').hidden=true;el('questionImage').hidden=!current.image;el('questionImage').innerHTML=current.image||'';el('answers').replaceChildren();
    shuffle(current.options.map((text,i)=>({text,i}))).forEach(({text,i})=>{
      const b=document.createElement('button');b.textContent=text;b.dataset.index=i;
      b.onclick=()=>{if(answered)return;answered=true;total++;const ok=i===current.answer;if(ok)correct++;
        [...el('answers').children].forEach(button=>{button.disabled=true;if(Number(button.dataset.index)===current.answer)button.classList.add('correct');});if(!ok)b.classList.add('wrong');
        el('feedback').textContent=(ok?'答對了！':'再想一想！正確答案：'+current.options[current.answer]+'。')+' '+current.why;el('showModel').hidden=!current.scene;score();};el('answers').appendChild(b);
    });count();
  }
  el('newQuestion').onclick=next;el('category').onchange=()=>{count();next();};el('format').onchange=()=>{count();next();};
  el('resetScore').onclick=()=>{total=0;correct=0;seen.clear();score();next();};
  el('showModel').onclick=()=>{if(!current?.scene)return;stop();el('skyPhase').value=current.scene.p;el('hour').value=current.scene.h;draw();el('skyPhase').focus();el('sky').scrollIntoView({behavior:'smooth',block:'center'});};
  draw();count();
})();
