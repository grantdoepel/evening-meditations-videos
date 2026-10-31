(()=>{
const B='http://localhost:8766/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const S=window.EM_S=window.EM_S||{log:[],done:[],cur:null,err:null};
const L=m=>{S.log.push(new Date().toISOString().slice(11,19)+' '+m);if(S.log.length>60)S.log.shift();};
const dlg=()=>document.querySelector('[role=dialog]');
const vis=e=>e&&e.offsetParent!==null;
const setV=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
const waitFor=async(f,ms=15000)=>{const t=Date.now();while(Date.now()-t<ms){const r=f();if(r)return r;await sleep(250);}throw new Error('timeout waiting');};
const clickTab=async name=>{const b=[...dlg().querySelectorAll('button')].find(x=>x.innerText.trim()===name);b.click();await sleep(700);};
const textIn=()=>[...dlg().querySelectorAll('input[type=text]')].filter(vis);
const att=async(el,url,name,type)=>{let b;for(let i=0;i<120;i++){const r=await fetch(url);if(r.ok){b=await r.blob();if(b.size>1000)break;}await sleep(5000);}const dt=new DataTransfer();dt.items.add(new File([b],name,{type}));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));};
async function pickMulti(openText,searchPh,items){
  const opener=[...dlg().querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&(e.innerText||e.placeholder||'').includes(openText)).pop()||[...dlg().querySelectorAll('input')].find(e=>(e.placeholder||'').includes(openText));
  (opener.closest('button')||opener).click();await sleep(600);
  const si=await waitFor(()=>[...document.querySelectorAll('input')].find(e=>vis(e)&&(e.placeholder||'').toLowerCase().includes('search')&&e.closest('[role=dialog]')));
  for(const k of items){
    si.focus();si.select();document.execCommand('insertText',false,k);
    const li=await waitFor(()=>[...document.querySelectorAll('li')].find(l=>l.innerText.trim()===k),6000);
    if(!li.querySelector('svg'))li.click();
    await sleep(450);
  }
}
async function one(n){
  let m;while(!(m=(await (await fetch(B+'meta.json?'+Date.now())).json())[n])){S.cur='waiting for '+n;if(S.stop)return;await sleep(60000);}
  S.cur=n;L('start '+n);await sleep(4000);
  if(!dlg()){[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='Add Content').click();}
  await waitFor(()=>dlg()&&dlg().querySelector('input[name=title]'));
  await sleep(500);
  const d=dlg();
  setV(d.querySelector('input[name=title]'),m.title);
  const fi=[...d.querySelectorAll('input[type=file]')];
  await att(fi[0],B+'thumbnails/'+m.t169,m.t169,'image/jpeg');
  await att(d.querySelector('input[name=featuredImageAlt]'),B+'thumbnails/'+m.t916,m.t916,'image/jpeg');
  await att(d.querySelector('input[name=video]'),B+'videos/'+m.video,m.video,'video/mp4');
  L('files attached '+n);
  await waitFor(()=>/Upload in progress|Delete Video/i.test(dlg().innerText),90000).catch(()=>{throw new Error('upload did not start for '+n);});
  await clickTab('Details');
  const ce=await waitFor(()=>[...dlg().querySelectorAll('[contenteditable=true]')].find(vis));
  ce.focus();document.execCommand('selectAll');document.execCommand('insertText',false,m.desc);
  const dd=dlg().querySelector('input[name=publishedDate]');setV(dd,m.date);
  const tt=[...dlg().querySelectorAll('input[type=time]')][0];setV(tt,'20:00');
  await sleep(300);
  await pickMulti('Choose or create keywords','search',['prayer','meditation','night prayer','Psalms','Christian Meditations','Biblical Meditation','Crossroads','Crossroads Church','Crossroads Ohio','Crossroads Show','Crossroads Meditation']);
  document.body.click();await sleep(300);
  L('details done '+n+' date='+dd.value+' '+tt.value);
  await clickTab('Access');
  await pickMulti('Choose collections','search',['Meditations']);
  await sleep(300);
  await clickTab('Content');
  const t0=Date.now();let lastIn=Date.now(),retries=0;
  while(true){
    const txt=dlg().innerText;
    if(!/Upload in progress/i.test(txt)&&/Delete Video/i.test(txt))break;
    if(/Upload in progress/i.test(txt))lastIn=Date.now();
    else if(Date.now()-lastIn>60000&&!(parseFloat(S.pct)>=5)){
      if(retries++>=5)throw new Error('video upload kept failing for '+n);
      L('retrying video upload '+n);
      await att(dlg().querySelector('input[name=video]'),B+'videos/'+m.video,m.video,'video/mp4');
      lastIn=Date.now();
    }
    S.pct=(txt.match(/\d+(\.\d+)?%/)||[''])[0];
    if(Date.now()-t0>3*3600*1000)throw new Error('upload timeout');
    await sleep(3000);
  }
  L('upload done '+n);
  await sleep(1500);
  await waitFor(()=>{const b=[...dlg().querySelectorAll('button')].find(b=>b.innerText.trim()==='Save');return b&&!b.disabled;},180000);
  [...dlg().querySelectorAll('button')].find(b=>b.innerText.trim()==='Save').click();
  await waitFor(()=>!dlg(),240000);
  S.done.push(n);L('saved '+n);await sleep(2500);
}
window.EM_run=async list=>{S.err=null;S.running=true;
  for(const n of list){
    if(S.stop)break;
    if(S.done.includes(n))continue;
    try{await one(n);}catch(e){S.err=n+': '+e.message;L('ERR '+S.err);S.running=false;return;}
  }
  S.running=false;L('queue finished');};
})();
'loaded'
