// ---------- Data (generated sample; replace with your API or CSV) ----------
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REGIONS=['North America','Europe','Asia Pacific','Latin America'];
const PRODUCTS=['Analytics Suite','Data Warehouse','Forecasting','Embedded BI','Support Plans'];
let seed=42;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const DATA=[];
REGIONS.forEach((rg,i)=>PRODUCTS.forEach((p,j)=>MONTHS.forEach((m,k)=>{
  const base=(60+j*18)*(1.3-i*.2)*(1+k*.03+Math.sin(k/2+j)*.08);
  const rev=Math.round(base*1000*(.9+rnd()*.2));
  DATA.push({m:k,region:rg,product:p,rev,orders:Math.round(rev/(900+j*250)),cost:Math.round(rev*(.52+j*.04+rnd()*.05))});
})));

// ---------- Helpers ----------
const $=id=>document.getElementById(id);
const money=n=>'$'+(Math.abs(n)>=1e6?(n/1e6).toFixed(2)+'M':Math.abs(n)>=1e3?Math.round(n/1e3)+'K':n);
const num=n=>n.toLocaleString('en-US');
const pct=n=>(n*100).toFixed(1)+'%';
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const state={region:'All',product:'All',sortKey:'rev',sortDir:-1};

function filtered(){
  return DATA.filter(d=>(state.region==='All'||d.region===state.region)&&(state.product==='All'||d.product===state.product));
}
function summarize(rows){
  const rev=sum(rows,d=>d.rev),cost=sum(rows,d=>d.cost),orders=sum(rows,d=>d.orders);
  return{rev,orders,aov:orders?rev/orders:0,margin:rev?(rev-cost)/rev:0};
}

// ---------- Views ----------
function renderKpis(rows){
  const s=summarize(rows);
  const h1=summarize(rows.filter(d=>d.m<6)),h2=summarize(rows.filter(d=>d.m>=6));
  const delta=(a,b)=>b?(a-b)/b:0;
  const items=[
    ['Revenue',money(s.rev),delta(h2.rev,h1.rev)],
    ['Orders',num(s.orders),delta(h2.orders,h1.orders)],
    ['Average order value',money(s.aov),delta(h2.aov,h1.aov)],
    ['Gross margin',pct(s.margin),h2.margin-h1.margin]
  ];
  $('kpis').innerHTML=items.map(([l,v,d])=>`
    <div class="panel kpi"><div class="l">${l}</div><div class="v">${v}</div>
    <div class="d ${d>=0?'up':'down'}">${d>=0?'▲':'▼'} ${(Math.abs(d)*100).toFixed(1)}% vs. first half</div></div>`).join('');
}

function renderTrend(rows){
  const W=600,H=230,L=44,R=10,T=10,B=26;
  const vals=MONTHS.map((_,k)=>sum(rows.filter(d=>d.m===k),d=>d.rev));
  const max=Math.max(...vals,1)*1.1;
  const x=k=>L+(W-L-R)*k/11, y=v=>T+(H-T-B)*(1-v/max);
  let g='';
  for(let i=0;i<=4;i++){const v=max*i/4;
    g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)"/><text x="${L-6}" y="${y(v)+4}" text-anchor="end">${money(v)}</text>`;}
  MONTHS.forEach((m,k)=>{g+=`<text x="${x(k)}" y="${H-6}" text-anchor="middle">${m}</text>`;});
  const pts=vals.map((v,k)=>`${x(k)},${y(v)}`).join(' ');
  const area=`${L},${y(0)} ${pts} ${W-R},${y(0)}`;
  const dots=vals.map((v,k)=>`<circle cx="${x(k)}" cy="${y(v)}" r="4" fill="var(--a)"><title>${MONTHS[k]}: ${money(v)}</title></circle>`).join('');
  $('trend').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly revenue line chart">${g}
    <polygon points="${area}" fill="var(--a)" opacity=".12"/>
    <polyline points="${pts}" fill="none" stroke="var(--a)" stroke-width="2.5"/>${dots}</svg>`;
}

function renderBars(rows){
  const totals=REGIONS.map(r=>[r,sum(rows.filter(d=>d.region===r),d=>d.rev)]);
  const max=Math.max(...totals.map(t=>t[1]),1);
  const W=400,rowH=46,H=rowH*totals.length,L=100;
  $('bars').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue by region bar chart">`+
    totals.map(([r,v],i)=>{
      const w=(W-L-52)*v/max, cy=i*rowH+rowH/2;
      return `<text x="0" y="${cy+4}">${r}</text>
        <rect x="${L}" y="${cy-11}" width="${w}" height="22" rx="3" fill="${state.region===r?'var(--b)':'var(--a)'}"/>
        <text x="${L+w+6}" y="${cy+4}">${money(v)}</text>`;}).join('')+`</svg>`;
}

const COLS=[['product','Product'],['rev','Revenue'],['orders','Orders'],['aov','Avg order'],['margin','Margin']];
function renderTable(rows){
  const list=PRODUCTS.map(p=>({product:p,...summarize(rows.filter(d=>d.product===p))})).filter(r=>r.rev>0);
  const{sortKey:k,sortDir:dir}=state;
  list.sort((a,b)=>(typeof a[k]==='string'?a[k].localeCompare(b[k]):a[k]-b[k])*dir);
  $('tbl').tHead.innerHTML='<tr>'+COLS.map(([key,l])=>
    `<th tabindex="0" data-k="${key}" ${key===k?`aria-sort="${dir>0?'ascending':'descending'}"`:''}>${l}${key===k?(dir>0?' ▲':' ▼'):''}</th>`).join('')+'</tr>';
  $('tbl').tBodies[0].innerHTML=list.map(r=>
    `<tr><td>${r.product}</td><td>${money(r.rev)}</td><td>${num(r.orders)}</td><td>${money(r.aov)}</td><td>${pct(r.margin)}</td></tr>`).join('');
}

function render(){
  const rows=filtered();
  renderKpis(rows);renderTrend(rows);renderBars(DATA.filter(d=>state.product==='All'||d.product===state.product));renderTable(rows);
}

// ---------- Wiring ----------
function fill(sel,items,key){
  sel.innerHTML=['All',...items].map(i=>`<option>${i}</option>`).join('');
  sel.onchange=()=>{state[key]=sel.value;render();};
}
fill($('fRegion'),REGIONS,'region');
fill($('fProduct'),PRODUCTS,'product');
function sortBy(th){
  const k=th.dataset.k;
  if(!k)return;
  state.sortDir=state.sortKey===k?-state.sortDir:-1;
  state.sortKey=k;renderTable(filtered());
}
$('tbl').tHead.addEventListener('click',e=>{const th=e.target.closest('th');if(th)sortBy(th);});
$('tbl').tHead.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const th=e.target.closest('th');if(th){e.preventDefault();sortBy(th);}}});
render();
