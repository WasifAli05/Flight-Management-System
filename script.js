// ════════════════════════════════════════════
//  GLOBAL STATE
// ════════════════════════════════════════════
let flights=[], hashT=Array.from({length:13},()=>[]);
let queue=[], stack=[], ll=[], bstRoot=null, graph={};
let seatMat=[], selSeat=null;
let sortArr=[], cmp=0, swp=0, sorting=false;

// ════════════════════════════════════════════
//  PARTICLES BACKGROUND
// ════════════════════════════════════════════
(function(){
  const cv=document.getElementById('particles');
  const ctx=cv.getContext('2d');
  let W,H,pts=[];
  function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;pts=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.5}));}
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;
      if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(14,165,233,.18)';ctx.fill();
    });
    pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
      const dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(14,165,233,${.06*(1-dist/120)})`;ctx.lineWidth=.5;ctx.stroke();}
    }));
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize);resize();draw();
})();

// ════════════════════════════════════════════
//  CLOCK
// ════════════════════════════════════════════
function tick(){
  const d=new Date();
  const t=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  document.getElementById('sb-clock').textContent=t;
}
setInterval(tick,1000);tick();

// ════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════
const sectionNames={home:'DASHBOARD',flights:'FLIGHTS ',graph:'Airline Route Network',linkedlist:'Flight Chain System',queue:'BOARDING Management System',stack:'OPERATION History  System',bst:'Fare Index Engine ',hashing:'Flight Lookup Engine ',sorting:'Fare Optimization Engine ',seats:'SEAT MAP '};

function showSec(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.sb-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  document.querySelectorAll('.sb-link').forEach(l=>{if(l.getAttribute('onclick')&&l.getAttribute('onclick').includes("'"+id+"'"))l.classList.add('active');});
  document.getElementById('tb-cur').textContent=sectionNames[id]||id.toUpperCase();
  if(id==='graph')setTimeout(drawGraph,80);
  if(id==='sorting')genSort();
  if(id==='seats')initSeats();
  if(id==='hashing')renderHT();
  document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0,0);
}
function toggleSidebar(){document.getElementById('sidebar').classList.toggle('open');}

// ════════════════════════════════════════════
//  STATS
// ════════════════════════════════════════════

function updStats(){
  const t=flights.length;
  const a=flights.filter(f=>f.status==='ON TIME'||f.status==='BOARDING').length;
  const q=queue.length;
  let r=0;for(const k in graph)r+=graph[k].length;r=r>>1;
  ['h-tf','s-total'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=t;});
  ['h-af'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=a;});
  ['h-pq','s-queue'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=q;});
  ['h-gr','s-routes'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=r;});
  const ts=document.getElementById('ts-fl');if(ts)ts.textContent=t;
  const tq=document.getElementById('ts-q');if(tq)tq.textContent=q;
  const tr=document.getElementById('ts-r');if(tr)tr.textContent=r;
}

// ════════════════════════════════════════════
//  ARRAY — FLIGHTS
// ════════════════════════════════════════════
function addFlight(){
  const id=document.getElementById('fi').value.trim().toUpperCase();
  const from=document.getElementById('ff').value,to=document.getElementById('ft').value;
  const dep=document.getElementById('fd').value;
  const price=parseInt(document.getElementById('fp').value)||Math.floor(Math.random()*50000+10000);
  const status=document.getElementById('fs').value;
  if(!id){alert('Enter Flight ID!');return;}
  if(flights.find(f=>f.id===id)){alert('ID already exists!');return;}
  if(from===to){alert('From ≠ To');return;}
  const fl={id,from,to,dep,price,status};
  flights.push(fl);
  autoHash(id,`${from}→${to} ₨${price.toLocaleString()}`);
  renderFlights(flights);updStats();
  document.getElementById('fi').value='';
}
function renderFlights(data){
  const tb=document.getElementById('ftbody');
  tb.innerHTML=data.map((f,i)=>{
    const p=f.status==='ON TIME'?'p-on':f.status==='DELAYED'?'p-de':f.status==='BOARDING'?'p-bo':'p-ca';
    return `<tr><td style="color:var(--dim)">[${i}]</td>
      <td style="color:var(--blue);font-weight:700">${f.id}</td>
      <td>${f.from}</td><td>${f.to}</td>
      <td>${f.dep}</td>
      <td style="color:var(--amber)">₨${f.price.toLocaleString()}</td>
      <td><span class="pill ${p}">${f.status}</span></td>
      <td><button class="btn-s btn-rose" style="padding:3px 9px;font-size:.58rem" onclick="delFl('${f.id}')">DEL</button></td>
    </tr>`;
  }).join('');
  document.getElementById('alen').textContent=flights.length;
  document.getElementById('farrstate').textContent=flights.map(f=>f.id).join(', ');
}
function delFl(id){flights.splice(flights.findIndex(f=>f.id===id),1);renderFlights(flights);updStats();}
function searchFlights(){
  const q=document.getElementById('fsearch').value.toUpperCase();
  renderFlights(flights.filter(f=>f.id.includes(q)||f.from.includes(q)||f.to.includes(q)));
}
function sortPrice(){flights.sort((a,b)=>a.price-b.price);renderFlights(flights);}
function sortTime(){flights.sort((a,b)=>a.dep.localeCompare(b.dep));renderFlights(flights);}

// ════════════════════════════════════════════
//  GRAPH
// ════════════════════════════════════════════
const AP={KHI:{x:.14,y:.68},LHE:{x:.28,y:.30},ISB:{x:.21,y:.16},DXB:{x:.53,y:.60},DOH:{x:.46,y:.74},LHR:{x:.77,y:.22},JFK:{x:.91,y:.28}};

function addRoute(){
  const f=document.getElementById('gf').value,t=document.getElementById('gt').value;
  const d=parseInt(document.getElementById('gd').value)||1000;
  const time=parseInt(document.getElementById('gt2').value)||Math.round(d/800);
  if(f===t){alert('Same airport!');return;}
  if(!graph[f])graph[f]=[];if(!graph[t])graph[t]=[];
  if(!graph[f].find(e=>e.to===t)){
    graph[f].push({to:t,d,time});
    graph[t].push({to:f,d,time});
  }
  renderAdj();drawGraph();updStats();
}

function renderAdj(){
  const el=document.getElementById('gadj');
  el.innerHTML=Object.keys(graph).map(n=>{
    const nb=graph[n].map(e=>`${e.to}(${e.d}km,${e.time}h)`).join(' → ');
    return `<div class="le"><span class="li">${n}</span> → ${nb||'(none)'}</div>`;
  }).join('');
}

function drawGraph(){
  const cv=document.getElementById('gCanvas');if(!cv)return;
  const ctx=cv.getContext('2d');
  cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(14,165,233,.04)';
  for(let x=0;x<W;x+=30)for(let y=0;y<H;y+=30){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}
  const pos={};for(const a in AP)pos[a]={x:AP[a].x*W,y:AP[a].y*H};
  const drawn=new Set();
  for(const from in graph){
    for(const e of graph[from]){
      const key=[from,e.to].sort().join('|');
      if(drawn.has(key))continue;drawn.add(key);
      const a=pos[from],b=pos[e.to];if(!a||!b)continue;
      const gr=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      gr.addColorStop(0,'rgba(14,165,233,.75)');gr.addColorStop(1,'rgba(245,158,11,.75)');
      ctx.save();ctx.strokeStyle=gr;ctx.lineWidth=1.8;ctx.setLineDash([6,4]);
      ctx.shadowBlur=10;ctx.shadowColor='rgba(14,165,233,.4)';
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
      ctx.fillStyle='rgba(251,191,36,.9)';ctx.font='bold 10px JetBrains Mono,monospace';
      ctx.textAlign='center';
      ctx.fillText(`${e.d}km / ${e.time}h`,(a.x+b.x)/2,(a.y+b.y)/2-4);
    }
  }
  for(const ap in pos){
    const{x,y}=pos[ap];const conn=graph[ap]&&graph[ap].length>0;
    const gr=ctx.createRadialGradient(x,y,0,x,y,26);
    gr.addColorStop(0,conn?'rgba(14,165,233,.22)':'rgba(20,30,50,.1)');gr.addColorStop(1,'transparent');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,26,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.fillStyle=conn?'rgba(14,165,233,.12)':'rgba(15,30,52,.8)';
    ctx.strokeStyle=conn?'#0ea5e9':'#1b2f4a';ctx.lineWidth=conn?2:1;
    ctx.shadowBlur=conn?14:0;ctx.shadowColor='rgba(14,165,233,.6)';
    ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
    ctx.fillStyle=conn?'#38bdf8':'#3a5070';ctx.font='bold 11px JetBrains Mono,monospace';
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ap,x,y);
    ctx.textBaseline='alphabetic';
  }
}

// INDIRECT FLIGHT FINDER (multi-hop BFS)
function findIndirect(){
  const src=document.getElementById('gf').value;
  const dst=document.getElementById('gt').value;
  if(src===dst){glog('Same airport!','lr');return;}
  if(!graph[src]){glog(`${src} has no routes!`,'lr');return;}

  // BFS to find ALL paths
  const allPaths=[];
  const queue2=[{node:src,path:[src],dist:0,time:0}];
  const visited=new Set();

  while(queue2.length){
    const{node,path,dist,time}=queue2.shift();
    if(node===dst){
      allPaths.push({path,dist,time});
      continue;
    }
    if(path.length>5)continue; // max 4 stops
    (graph[node]||[]).forEach(e=>{
      if(!path.includes(e.to)){
        queue2.push({node:e.to,path:[...path,e.to],dist:dist+e.d,time:time+e.time});
      }
    });
  }

  if(!allPaths.length){glog(`No route found: ${src} → ${dst}`,'lr');return;}

  // Sort by distance
  allPaths.sort((a,b)=>a.dist-b.dist);

  glog(`━━ ROUTES: ${src} → ${dst} ━━`,'li');
  allPaths.forEach((p,i)=>{
    const type=p.path.length===2?'DIRECT':'INDIRECT ('+( p.path.length-2)+' stop'+(p.path.length>3?'s':'')+')';
    const cls=i===0?'lk':p.path.length===2?'lk':'lw';
    glog(`${i===0?'★ BEST: ':'  '}${p.path.join(' → ')} | ${p.dist}km | ${p.time}h | ${type}`,cls);
  });
}

function glog(msg,cls='li'){const e=document.getElementById('glog');e.innerHTML+=`<div class="le ${cls}">${msg}</div>`;e.scrollTop=e.scrollHeight;}

function runBFS(){
  const ns=Object.keys(graph);if(!ns.length){glog('No nodes yet!','lr');return;}
  const s=ns[0],vis=new Set([s]),q2=[s],res=[];
  while(q2.length){const n=q2.shift();res.push(n);(graph[n]||[]).forEach(e=>{if(!vis.has(e.to)){vis.add(e.to);q2.push(e.to);}});}
  glog(`BFS from ${s}: ${res.join(' → ')}  (uses Queue internally)`,'lk');
}

function runDFS(){
  const ns=Object.keys(graph);if(!ns.length){glog('No nodes yet!','lr');return;}
  const s=ns[0],vis=new Set(),res=[];
  const dfs=n=>{if(vis.has(n))return;vis.add(n);res.push(n);(graph[n]||[]).forEach(e=>dfs(e.to));};
  dfs(s);glog(`DFS from ${s}: ${res.join(' → ')}  (uses Stack/Recursion)`,'lw');
}

window.addEventListener('resize',drawGraph);

// ════════════════════════════════════════════
//  LINKED LIST
// ════════════════════════════════════════════
// ════════════════════════════════════════════
//  LINKED LIST (REAL NODE IMPLEMENTATION)
// ════════════════════════════════════════════

class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

let head = null;

// INSERT NODE
function llIns(){
  const v = document.getElementById('llv').value.trim().toUpperCase();
  const pos = document.getElementById('llp').value;

  if(!v) return;

  const newNode = new Node(v);

  // insert at head
  if(pos === 'head' || !head){
    newNode.next = head;
    head = newNode;
  }
  // insert at tail
  else if(pos === 'tail'){
    let temp = head;
    while(temp.next){
      temp = temp.next;
    }
    temp.next = newNode;
  }
  // insert at index (optional support)
  else{
    const idx = parseInt(document.getElementById('lli').value) || 0;

    if(idx === 0){
      newNode.next = head;
      head = newNode;
    } else {
      let temp = head;
      let i = 0;

      while(temp && i < idx - 1){
        temp = temp.next;
        i++;
      }

      if(!temp){
        lllog("Index out of range",'lr');
        return;
      }

      newNode.next = temp.next;
      temp.next = newNode;
    }
  }

  renderLL();
  lllog(`INSERT "${v}" → NODE CREATED & LINKED`,'lk');
  document.getElementById('llv').value='';
}

// DELETE HEAD
function llDelH(){
  if(!head){
    lllog('EMPTY LINKED LIST','lr');
    return;
  }

  const removed = head.data;
  head = head.next;

  renderLL();
  lllog(`DELETE HEAD "${removed}" → O(1)`,'lw');
}

// REVERSE LINKED LIST
function llRev(){
  let prev = null;
  let curr = head;

  while(curr){
    let next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  head = prev;

  renderLL();
  lllog('REVERSED LINKED LIST POINTERS → O(n)','li');
}

// RENDER LINKED LIST
function renderLL(){
  const el = document.getElementById('llviz');
  let temp = head;

  let result = '';
  let count = 0;

  if(!temp){
    el.innerHTML = `<span style="color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.75rem">NULL</span>`;
    document.getElementById('llsz').textContent = 0;
    return;
  }

  while(temp){
    result += `
      <span class="nd ${count === 0 ? 'nd-amber' : 'nd-blue'}">${temp.data}</span>
      <span class="arr">→</span>
    `;
    temp = temp.next;
    count++;
  }

  result += `<span class="nd" style="color:var(--dim)">NULL</span>`;

  el.innerHTML = result;
  document.getElementById('llsz').textContent = count;
}

// LOG FUNCTION
function lllog(msg,cls){
  const e = document.getElementById('lllog');
  e.innerHTML += `<div class="le ${cls}">${msg}</div>`;
  e.scrollTop = e.scrollHeight;
}

// ════════════════════════════════════════════
//  QUEUE
// ════════════════════════════════════════════
// ════════════════════════════════════════════
//  QUEUE (REAL LINKED LIST IMPLEMENTATION)
// ════════════════════════════════════════════

class QNode {
  constructor(data){
    this.data = data;
    this.next = null;
  }
}

let front = null;
let rear = null;

// ENQUEUE
function enq(){
  const n = document.getElementById('qn').value.trim();
  if(!n) return;

  const newNode = new QNode(n);

  if(!rear){
    front = rear = newNode;
  } else {
    rear.next = newNode;
    rear = newNode;
  }

  document.getElementById('qn').value = '';
  renderQ();
  qlog(`ENQUEUE "${n}" → rear O(1)`,'lk');
  updStats();
}

// DEQUEUE
function deq(){
  if(!front){
    qlog('EMPTY!','lr');
    return;
  }

  const removed = front.data;
  front = front.next;

  if(!front) rear = null;

  renderQ();
  qlog(`DEQUEUE "${removed}" ← front O(1) (BOARDED)`,'lw');
  updStats();
}

// PEEK
function qpeek(){
  if(!front){
    qlog('EMPTY!','lr');
    return;
  }

  qlog(`PEEK: front="${front.data}" → O(1)`,'li');
}

// RENDER QUEUE
function renderQ(){
  const el = document.getElementById('qviz');

  if(!front){
    el.innerHTML = `<span style="color:var(--dim);font-family:'JetBrains Mono',monospace;font-size:.75rem">[ EMPTY QUEUE ]</span>`;
    return;
  }

  let temp = front;
  let result = '';

  while(temp){
    const isF = temp === front;
    const isR = temp === rear;

    result += `
      <span class="nd ${isF ? 'nd-green' : isR ? 'nd-amber' : 'nd-blue'}" style="position:relative">
        ${isF ? '<span style="position:absolute;top:-14px;left:2px;font-size:.5rem;color:var(--green)">FRONT</span>' : ''}
        ${isR ? '<span style="position:absolute;top:-14px;right:2px;font-size:.5rem;color:var(--amber)">REAR</span>' : ''}
        ${temp.data}
      </span>
      ${temp.next ? '<span class="arr">→</span>' : ''}
    `;

    temp = temp.next;
  }

  el.innerHTML = result;
}

// LOG
function qlog(msg,cls){
  const e = document.getElementById('qlog');
  e.innerHTML += `<div class="le ${cls}">${msg}</div>`;
  e.scrollTop = e.scrollHeight;
}

// ════════════════════════════════════════════
//  STACK
// ════════════════════════════════════════════
let totalOps=0, undoneOps=0;

const opTemplates={
  BOOK:   ()=>`BOOK FLIGHT ${['PK','EK','QR','FZ'][Math.floor(Math.random()*4)]}-${Math.floor(Math.random()*900+100)} | Seat ${String.fromCharCode(65+Math.floor(Math.random()*5))}${Math.floor(Math.random()*6+1)}`,
  CHECKIN:()=>`CHECK-IN: Passenger ${['Ahmed Khan','Sara Ali','John Smith','Fatima Malik'][Math.floor(Math.random()*4)]}`,
  DELAY:  ()=>`DELAY FLIGHT ${['PK-303','EK-607','QR-705'][Math.floor(Math.random()*3)]} by ${Math.floor(Math.random()*3+1)*30} mins`,
  CANCEL: ()=>`CANCEL BOOKING REF#${Math.floor(Math.random()*90000+10000)}`,
  SEAT:   ()=>`SEAT CHANGE: ${String.fromCharCode(65+Math.floor(Math.random()*5))}${Math.floor(Math.random()*6+1)} → ${String.fromCharCode(65+Math.floor(Math.random()*5))}${Math.floor(Math.random()*6+1)}`,
  BOARD:  ()=>`BOARDING GATE ${Math.floor(Math.random()*20+1)} OPENED for ${['PK-303','EK-607','QR-705','PK-747'][Math.floor(Math.random()*4)]}`
};

function quickPush(type){
  const op=opTemplates[type]();
  const time=new Date().toLocaleTimeString();
  stack.push({op,time,type});
  totalOps++;
  renderSt();
  stlog(`PUSH ↑ [${time}] ${op}`,'lk');
  updStackStats();
}

function spush(){
  const o=document.getElementById('sto').value.trim();
  if(!o)return;
  const time=new Date().toLocaleTimeString();
  stack.push({op:o,time,type:'MANUAL'});
  totalOps++;
  document.getElementById('sto').value='';
  renderSt();
  stlog(`PUSH ↑ [${time}] ${o}`,'lk');
  updStackStats();
}

function spop(){
  if(!stack.length){stlog('UNDERFLOW — Stack is empty!','lr');return;}
  const item=stack.pop();
  undoneOps++;
  renderSt();
  stlog(`POP ↓ UNDO: "${item.op}"  O(1)`,'lw');
  ulog(`[${new Date().toLocaleTimeString()}] UNDONE: ${item.op}`);
  updStackStats();
}

function speek(){
  if(!stack.length){stlog('Stack is EMPTY!','lr');return;}
  const top=stack[stack.length-1];
  stlog(`PEEK 👁 TOP: "${top.op}" @ ${top.time}  O(1)`,'li');
}

function sundoAll(){
  if(!stack.length){stlog('Nothing to undo!','lr');return;}
  const count=stack.length;
  while(stack.length){
    const item=stack.pop();
    undoneOps++;
    ulog(`UNDONE: ${item.op}`);
  }
  renderSt();
  stlog(`UNDO ALL — ${count} operations reversed`,'lw');
  updStackStats();
}

function sclr(){stack=[];renderSt();stlog('STACK CLEARED','lw');updStackStats();}

function renderSt(){
  const el=document.getElementById('stviz');
  if(!stack.length){
    el.innerHTML='<div style="color:var(--dim);font-family:\'JetBrains Mono\',monospace;font-size:.75rem;padding:10px">[ EMPTY STACK — Push an operation ]</div>';
    return;
  }
  const colors={BOOK:'nd-blue',CHECKIN:'nd-green',DELAY:'nd-amber',CANCEL:'nd-rose',SEAT:'nd-blue',BOARD:'nd-green',MANUAL:'nd-blue'};
  el.innerHTML=[...stack].reverse().map((item,i)=>`
    <div class="nd ${i===0?'nd-amber':colors[item.type]||'nd-blue'}" style="display:flex;justify-content:space-between;align-items:center;border-radius:4px;padding:7px 12px">
      <span>${i===0?'▶ ':''} ${item.op}</span>
      <span style="font-size:.55rem;color:var(--dim);margin-left:10px;white-space:nowrap">
        ${i===0?'<span style="color:var(--amber)">TOP</span> | ':''}${item.time}
      </span>
    </div>`).join('');
}

function updStackStats(){
  const t=document.getElementById('st-total');if(t)t.textContent=totalOps;
  const u=document.getElementById('st-undone');if(u)u.textContent=undoneOps;
  const s=document.getElementById('st-size');if(s)s.textContent=stack.length;
}

function stlog(msg,cls){
  const e=document.getElementById('stlog');
  e.innerHTML+=`<div class="le ${cls}">[${new Date().toLocaleTimeString()}] ${msg}</div>`;
  e.scrollTop=e.scrollHeight;
}

function ulog(msg){
  const e=document.getElementById('undo-log');
  if(!e)return;
  e.innerHTML+=`<div class="le lr">${msg}</div>`;
  e.scrollTop=e.scrollHeight;
}

// ════════════════════════════════════════════
//  BST
// ════════════════════════════════════════════
class BN{constructor(v){this.v=v;this.l=this.r=null;}}
function bstPut(root,v){if(!root)return new BN(v);if(v<root.v)root.l=bstPut(root.l,v);else if(v>root.v)root.r=bstPut(root.r,v);return root;}
function bstIns(){const v=parseInt(document.getElementById('bv').value);if(isNaN(v))return;bstRoot=bstPut(bstRoot,v);renderBST();blog(`INSERT ₨${v.toLocaleString()}`,'lk');}
function bstSrch(){
  const v=parseInt(document.getElementById('bv').value);if(isNaN(v))return;
  let cur=bstRoot,path=[],steps=0;
  while(cur){path.push(cur.v);steps++;if(v===cur.v){blog(`FOUND ₨${v} in ${steps} steps | ${path.join('→')}`,'lk');return;}cur=v<cur.v?cur.l:cur.r;}
  blog(`NOT FOUND ₨${v} | searched: ${path.join('→')}`,'lr');
}
function bstIn(){const r=[];const f=n=>{if(!n)return;f(n.l);r.push(n.v);f(n.r);};f(bstRoot);blog(`INORDER (sorted): ${r.map(v=>'₨'+v.toLocaleString()).join(' → ')}`,'li');}
function bstPre(){const r=[];const f=n=>{if(!n)return;r.push(n.v);f(n.l);f(n.r);};f(bstRoot);blog(`PREORDER: ${r.map(v=>'₨'+v.toLocaleString()).join(' → ')}`,'lw');}
function bstReset(){bstRoot=null;renderBST();blog('BST cleared','lw');}
function renderBST(){
  const el=document.getElementById('bstviz');
  if(!bstRoot){el.innerHTML='<div class="tempty">Insert price values (e.g. 25000, 18000, 40000, 12000)</div>';return;}
  const lvls=[];const q=[{n:bstRoot,l:0}];
  while(q.length){const{n,l}=q.shift();if(!lvls[l])lvls[l]=[];lvls[l].push(n.v);if(n.l)q.push({n:n.l,l:l+1});if(n.r)q.push({n:n.r,l:l+1});}
  el.innerHTML=lvls.map((lv,i)=>`<div class="tlvl">${lv.map(v=>`<span class="tnode">₨${v.toLocaleString()}</span>`).join('')}</div>${i<lvls.length-1?'<div class="tconn">/ \\</div>':''}`).join('');
}
function blog(msg,cls){const e=document.getElementById('bstlog');e.innerHTML+=`<div class="le ${cls}">${msg}</div>`;e.scrollTop=e.scrollHeight;}

// ════════════════════════════════════════════
//  HASHING
// ════════════════════════════════════════════
const hFn=k=>{let h=0;for(const c of String(k))h=(h+c.charCodeAt(0))%13;return h;};
function hIns(){
  const k=document.getElementById('hk').value.trim().toUpperCase();
  const v=document.getElementById('hv').value.trim();
  if(!k||!v){hlog('Need key + value!','lr');return;}
  const i=hFn(k);hashT[i]=hashT[i].filter(e=>e.k!==k);hashT[i].push({k,v});
  renderHT();hlog(`INSERT [${k}] → h("${k}")=${i} → bucket[${i}]="${v}" O(1)`,'lk');
}
function autoHash(k,v){const i=hFn(k);hashT[i]=hashT[i].filter(e=>e.k!==k);hashT[i].push({k,v});}
function hSrch(){
  const k=document.getElementById('hk').value.trim().toUpperCase();const i=hFn(k);
  const f=hashT[i].find(e=>e.k===k);
  f?hlog(`FOUND [${k}] bucket[${i}]="${f.v}" O(1) ✓`,'lk'):hlog(`[${k}] NOT FOUND bucket[${i}] | h="${k}"=${i}`,'lr');
}
function hDel(){
  const k=document.getElementById('hk').value.trim().toUpperCase();const i=hFn(k);
  const b=hashT[i].length;hashT[i]=hashT[i].filter(e=>e.k!==k);renderHT();
  b>hashT[i].length?hlog(`DELETED [${k}] from bucket[${i}] O(1)`,'lw'):hlog(`[${k}] not found`,'lr');
}
function hFn2(){
  const k=(document.getElementById('hk').value.trim().toUpperCase()||'PK303');
  let calc=`h("${k}") = (`,s=0;
  for(const c of k){const cd=c.charCodeAt(0);calc+=`${cd}+`;s+=cd;}
  hlog(calc.slice(0,-1)+`) % 13 = ${s} % 13 = ${s%13}`,'li');
}
function renderHT(){
  const el=document.getElementById('htable');
  el.innerHTML=hashT.map((b,i)=>`<div class="htrow"><div class="htidx">${i}</div><div class="htcell">${b.length?b.map(e=>`<span style="color:var(--blue)">${e.k}</span>: ${e.v}`).join(' │ '):'—'}</div></div>`).join('');
}
function hlog(msg,cls){const e=document.getElementById('hlog');e.innerHTML+=`<div class="le ${cls}">${msg}</div>`;e.scrollTop=e.scrollHeight;}

// ════════════════════════════════════════════
//  SORTING
// ════════════════════════════════════════════
function genSort(){
  const from=document.getElementById('s-from')?document.getElementById('s-from').value:'';
  const to=document.getElementById('s-to')?document.getElementById('s-to').value:'';
  const maxP=parseInt(document.getElementById('s-maxprice')?document.getElementById('s-maxprice').value:999999)||999999;

  let filtered=flights.filter(f=>{
    const fromOk=!from||f.from===from;
    const toOk=!to||f.to===to;
    const priceOk=f.price<=maxP;
    return fromOk&&toOk&&priceOk;
  });

  if(!filtered.length){
    // fallback random prices
    sortArr=[18500,42000,55000,12000,120000,38000,25000,95000];
  } else {
    sortArr=filtered.map(f=>f.price);
  }

  cmp=0;swp=0;updCounts();
  renderBars(sortArr,[],[],[]);
  document.getElementById('sarrd').textContent='Prices: ['+sortArr.map(v=>'₨'+v.toLocaleString()).join(', ')+']';
  document.getElementById('slog').innerHTML='';
  document.getElementById('sbtn').disabled=false;
  sorting=false;
}

function searchAndSort(){
  const from=document.getElementById('s-from').value.trim();
  const to=document.getElementById('s-to').value.trim();
  const maxP=parseInt(document.getElementById('s-maxprice').value)||999999;

  let filtered=flights.filter(f=>{
    const fromOk=!from||from==='ALL'||f.from.toUpperCase()===from.toUpperCase();
    const toOk=!to||to==='ALL'||f.to.toUpperCase()===to.toUpperCase();
    const priceOk=f.price<=maxP;
    return fromOk&&toOk&&priceOk;
  });

  if(!filtered.length){
    document.getElementById('s-results').style.display='none';
    document.getElementById('slog').innerHTML='';
    slog('No flights found for this route!','lr');
    sortArr=[];
    renderBars([],[],[],[]);
    return;
  }

  // Merge sort the filtered flights by price
  const sorted=[...filtered].sort((a,b)=>a.price-b.price);

  // Show results table
  document.getElementById('s-results').style.display='block';
  document.getElementById('s-count').textContent=sorted.length+' flight(s) found';
  document.getElementById('s-tbody').innerHTML=sorted.map((f,i)=>{
    const p=f.status==='ON TIME'?'p-on':f.status==='DELAYED'?'p-de':f.status==='BOARDING'?'p-bo':'p-ca';
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    return `<tr>
      <td style="color:var(--amber);font-weight:700">${medal}</td>
      <td style="color:var(--blue);font-weight:700">${f.id}</td>
      <td>${f.from}</td><td>${f.to}</td>
      <td>${f.dep}</td>
      <td style="color:var(--green);font-weight:700">₨${f.price.toLocaleString()}</td>
      <td><span class="pill ${p}">${f.status}</span></td>
    </tr>`;
  }).join('');

  // Set bars for visualization
  sortArr=filtered.map(f=>f.price);
  cmp=0;swp=0;updCounts();
  renderBars(sortArr,[],[],[]);
  document.getElementById('sarrd').textContent='Prices to sort: ['+sortArr.map(v=>'₨'+v.toLocaleString()).join(', ')+']';
  document.getElementById('slog').innerHTML='';
  slog(`Found ${filtered.length} flight(s) — ${from||'ANY'} → ${to||'ANY'} | Max ₨${maxP.toLocaleString()}`,'lk');
  slog('Press ▶ VISUALIZE to see Merge Sort in action!','li');
}

function updCounts(){
  document.getElementById('cc').textContent=cmp;
  document.getElementById('sc').textContent=swp;
}

function renderBars(arr,cm=[],sw=[],dn=[]){
  const el=document.getElementById('sbars');
  const mx=Math.max(...arr);
  el.innerHTML=arr.map((v,i)=>`
    <div style="display:flex;flex-direction:column;align-items:center;flex:1">
      <div style="font-family:'JetBrains Mono',monospace;font-size:.45rem;color:var(--amber);margin-bottom:2px;white-space:nowrap">
        ${dn.includes(i)||sw.includes(i)||cm.includes(i)?'₨'+(v/1000).toFixed(0)+'k':''}
      </div>
      <div class="bar ${dn.includes(i)?'b-done':sw.includes(i)?'b-swp':cm.includes(i)?'b-cmp':'b-def'}"
        style="height:${(v/mx)*100}%;min-width:5px" title="₨${v.toLocaleString()}"></div>
    </div>`).join('');
}

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function startSort(){
  if(sorting)return;
  sorting=true;
  document.getElementById('sbtn').disabled=true;
  const arr=[...sortArr];
  cmp=0;swp=0;
  slog('▶ Starting MERGE SORT — O(n log n) guaranteed','li');
  slog('━ Dividing array into halves recursively...','lw');
  await mergeSort(arr,0,arr.length-1);
  sortArr=arr;
  renderBars(arr,[],[],arr.map((_,i)=>i));
  slog(`✓ SORTED! Comparisons: ${cmp} | Merges: ${swp}`,'lk');
  slog('Sorted: ['+arr.map(v=>'₨'+v.toLocaleString()).join(', ')+']','lk');
  document.getElementById('sarrd').textContent='Sorted Prices (cheapest→expensive): ['+arr.map(v=>'₨'+v.toLocaleString()).join(', ')+']';
  document.getElementById('sbtn').disabled=false;
  sorting=false;
}

async function mergeSort(arr,l,r){
  if(l>=r)return;
  const mid=Math.floor((l+r)/2);
  slog(`  Divide: [${arr.slice(l,r+1).map(v=>'₨'+(v/1000).toFixed(0)+'k').join(',')}] → left[${l}..${mid}] right[${mid+1}..${r}]`,'li');
  renderBars(arr,Array.from({length:r-l+1},(_,i)=>l+i),[],[]);
  await sleep(400);
  await mergeSort(arr,l,mid);
  await mergeSort(arr,mid+1,r);
  await merge(arr,l,mid,r);
}

async function merge(arr,l,mid,r){
  const left=arr.slice(l,mid+1);
  const right=arr.slice(mid+1,r+1);
  let i=0,j=0,k=l;
  slog(`  Merge: [${left.map(v=>'₨'+(v/1000).toFixed(0)+'k').join(',')}] + [${right.map(v=>'₨'+(v/1000).toFixed(0)+'k').join(',')}]`,'lw');
  while(i<left.length&&j<right.length){
    cmp++;updCounts();
    renderBars(arr,[k],[l+i,mid+1+j],[]);
    await sleep(300);
    if(left[i]<=right[j]){arr[k++]=left[i++];}
    else{arr[k++]=right[j++];}
    swp++;updCounts();
    renderBars(arr,[],[k-1],[]);
    await sleep(200);
  }
  while(i<left.length){arr[k++]=left[i++];swp++;updCounts();renderBars(arr,[],[k-1],[]);await sleep(150);}
  while(j<right.length){arr[k++]=right[j++];swp++;updCounts();renderBars(arr,[],[k-1],[]);await sleep(150);}
  renderBars(arr,[],Array.from({length:r-l+1},(_,i)=>l+i),[]);
  await sleep(250);
}

function resetSort(){sorting=false;genSort();}

function slog(msg,cls){
  const e=document.getElementById('slog');
  e.innerHTML+=`<div class="le ${cls}">${msg}</div>`;
  e.scrollTop=e.scrollHeight;
}

// ════════════════════════════════════════════
//  SEATS (2D ARRAY)
// ════════════════════════════════════════════
function initSeats(){
  seatMat=Array.from({length:5},()=>Array(6).fill(0));
  selSeat=null;document.getElementById('psel').value='';
  renderSeats();
}

function renderSeats(){
  const el=document.getElementById('sgrid'),rows=['A','B','C','D','E'];
  el.innerHTML=seatMat.map((row,r)=>row.map((v,c)=>{
    const lbl=rows[r]+(c+1);
    const isSel=selSeat&&selSeat.r===r&&selSeat.c===c;
    const cls=isSel?'s-sel':v?'s-booked':'s-free';
    return `<div class="seat ${cls}" onclick="selSeatFn(${r},${c},'${lbl}')" title="${lbl}">${lbl}</div>`;
  }).join('')).join('');
  document.getElementById('sarr').textContent=seatMat.map(r=>'['+r.join(',')+']').join(', ');
}
function selSeatFn(r,c,lbl){
  if(seatMat[r][c]){seatlog(`${lbl} already BOOKED!`,'lr');return;}
  selSeat={r,c,lbl};document.getElementById('psel').value=`${lbl}  [seats[${r}][${c}]]`;
  renderSeats();seatlog(`Selected ${lbl} → seats[${r}][${c}]=0 (free)`,'li');
}
function bookSeat(){
  if(!selSeat){seatlog('Select a seat first!','lr');return;}
  const n=document.getElementById('pname').value.trim();
  if(!n){seatlog('Enter passenger name!','lr');return;}
  seatMat[selSeat.r][selSeat.c]=1;renderSeats();
  seatlog(`BOOKED: ${n} → Seat ${selSeat.lbl} | seats[${selSeat.r}][${selSeat.c}]=1`,'lk');
  selSeat=null;document.getElementById('psel').value='';
}
function cancelSeat(){
  if(!selSeat){seatlog('No seat selected!','lr');return;}
  seatMat[selSeat.r][selSeat.c]=0;renderSeats();
  seatlog(`FREED: Seat ${selSeat.lbl} | seats[${selSeat.r}][${selSeat.c}]=0`,'lw');
  selSeat=null;document.getElementById('psel').value='';
}
function seatlog(msg,cls){const e=document.getElementById('seatlog');e.innerHTML+=`<div class="le ${cls}">${msg}</div>`;e.scrollTop=e.scrollHeight;}

// ════════════════════════════════════════════
//  DEMO DATA
// ════════════════════════════════════════════
function initDemo(){
  // Flights
  [{id:'PK-303',from:'KHI',to:'LHE',dep:'07:30',price:18500,status:'BOARDING'},
   {id:'EK-607',from:'KHI',to:'DXB',dep:'10:15',price:42000,status:'ON TIME'},
   {id:'QR-705',from:'ISB',to:'DOH',dep:'14:00',price:55000,status:'DELAYED'},
   {id:'PK-747',from:'LHE',to:'ISB',dep:'16:45',price:12000,status:'ON TIME'},
   {id:'PA-101',from:'KHI',to:'LHR',dep:'22:30',price:120000,status:'CANCELLED'},
   {id:'FZ-211',from:'LHE',to:'DXB',dep:'08:00',price:38000,status:'ON TIME'}
  ].forEach(f=>{flights.push(f);autoHash(f.id,`${f.from}→${f.to} ₨${f.price.toLocaleString()}`);});
  renderFlights(flights);
  // Graph
  // Graph
  [['KHI','LHE',1210,2],['KHI','DXB',2000,3],['LHE','ISB',380,1],['ISB','DOH',2500,4],['DXB','DOH',380,1],['DXB','LHR',5500,7],['LHR','JFK',5540,8]].forEach(([f,t,d,time])=>{
    if(!graph[f])graph[f]=[];if(!graph[t])graph[t]=[];
    if(!graph[f].find(e=>e.to===t)){graph[f].push({to:t,d,time});graph[t].push({to:f,d,time});}
  });
  renderAdj();
  // Queue
  ['Ahmed Khan','Sara Ali','John Smith','Fatima Malik'].forEach(p=>queue.push(p));
  renderQ();
  // Stack
  [
  {op:'BOOK FLIGHT PK-303 | Seat A1', time:'07:00:00', type:'BOOK'},
  {op:'CHECK-IN: Ahmed Khan', time:'07:15:00', type:'CHECKIN'},
  {op:'BOARDING GATE 5 OPENED for PK-303', time:'07:20:00', type:'BOARD'},
  {op:'DELAY FLIGHT EK-607 by 30 mins', time:'08:30:00', type:'DELAY'}
].forEach(o=>{stack.push(o);totalOps++;});
renderSt();
updStackStats();
  // Linked List
  ['PK-303','EK-607','QR-705','PK-747'].forEach(v=>ll.push(v));
  renderLL();
  // BST
  [25000,18500,42000,12000,55000,38000,120000].forEach(v=>{bstRoot=bstPut(bstRoot,v);});
  renderBST();
  // Hash
  renderHT();
  // Seats
  initSeats();
  // Sort
  genSort();
  updStats();
}
window.addEventListener('load',initDemo);