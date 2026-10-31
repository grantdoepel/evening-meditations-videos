(()=>{
const B='http://localhost:8766/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const S=window.EM_F=window.EM_F||{log:[],done:[],err:null};
const L=m=>{S.log.push(new Date().toISOString().slice(11,19)+' '+m);if(S.log.length>40)S.log.shift();};
const dlg=()=>document.querySelector('[role=dialog]');
const vis=e=>e&&e.offsetParent!==null;
const waitFor=async(f,ms=20000)=>{const t=Date.now();while(Date.now()-t<ms){const r=f();if(r)return r;await sleep(300);}throw new Error('timeout');};
const att=async(el,url,name)=>{let b;for(let i=0;i<60;i++){const r=await fetch(url);if(r.ok){b=await r.blob();if(b.size>1000)break;}await sleep(3000);}const dt=new DataTransfer();dt.items.add(new File([b],name,{type:'image/jpeg'}));el.files=dt.files;el.dispatchEvent(new Event('change',{bubbles:true}));};
async function fix(n){
  const m=(await (await fetch(B+'meta.json?'+Date.now())).json())[n];
  const key=m.title.slice(0,28);
  const si=[...document.querySelectorAll('input')].find(e=>vis(e)&&e.placeholder==='Search'&&!e.closest('[role=dialog]'));
  si.focus();si.select();document.execCommand('insertText',false,key);
  const row=await waitFor(()=>[...document.querySelectorAll('tr')].find(r=>r.innerText.includes(m.title.slice(0,28))&&r.innerText.includes('Dec')),20000);
  L('row found '+n);
  row.querySelector('button[aria-haspopup],button[id*=menu],button:last-of-type').click();
  await sleep(600);
  const ed=[...document.querySelectorAll('[role=menuitem],li,a,button')].find(e=>vis(e)&&e.innerText.trim()==='Edit');
  ed.click();
  await waitFor(()=>dlg()&&dlg().querySelector('input[name=title]'));
  await sleep(1500);
  const d=dlg();const fi=[...d.querySelectorAll('input[type=file]')];
  await att(fi[0],B+'thumbnails/'+m.t169,m.t169);
  await att(d.querySelector('input[name=featuredImageAlt]'),B+'thumbnails/'+m.t916,m.t916);
  L('attached '+n);
  await sleep(8000);
  await waitFor(()=>{const b=[...dlg().querySelectorAll('button')].find(b=>b.innerText.trim()==='Save');return b&&!b.disabled;},120000);
  [...dlg().querySelectorAll('button')].find(b=>b.innerText.trim()==='Save').click();
  await waitFor(()=>!dlg(),30000);
  S.done.push(n);L('fixed '+n);await sleep(2000);
}
window.EM_fix=async list=>{S.err=null;for(const n of list){if(S.done.includes(n))continue;try{await fix(n);}catch(e){S.err=n+': '+e.message;L('ERR '+S.err);return;}}L('fix queue done');};
})();
'loaded fix'
