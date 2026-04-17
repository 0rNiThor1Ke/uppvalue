"use client";
import{useState,useEffect,useMemo,useCallback,useRef}from"react";
import{ResponsiveContainer,AreaChart,Area,LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ReferenceLine}from"recharts";

const AppLogo=({color="currentColor",size=28})=>(
<svg width={size} height={size} viewBox="0 0 100 109" fill={color} fillRule="evenodd">
<path d="M35.96,67.57L33.99,67.31L32.3,66.28L16.71,51.68L15.87,49.61L16.71,45.74L19.38,43.28L24.72,47.93L34.41,39.02L35.81,36.43L35.81,33.33L33.01,29.46L28.93,26.74L25,26.74L22.75,27.78L12.08,37.6L10.11,38.63L6.18,38.37L2.67,35.4L17.7,21.58L20.79,20.03L24.44,18.99L30.9,19.25L32.87,19.77L36.8,21.83L41.71,26.61L43.96,31.27L44.24,36.43L42.28,42.12L39.47,45.48L30.76,53.23L41.71,63.57L38.2,66.8ZM80.34,97.29L74.3,91.47L81.6,85.01L81.6,84.5L78.37,81.78L72.47,87.21L67.28,82.69L66.71,81.65L72.33,76.49L72.33,75.97L42.28,48.32L45.37,45.22L47.19,41.99L97.05,87.6L97.05,88.11L91.29,93.41L87.64,90.31ZM59.27,47.16L48.74,37.98L48.46,33.07L60.25,21.96L61.1,20.16L61.1,17.05L59.69,14.47L55.62,10.98L53.93,10.21L50.56,10.21L46.91,12.27L39.61,18.99L37.08,17.18L31.88,15.25L42.42,5.56L48.03,2.97L51.97,2.45L55.34,2.71L60.39,4.52L64.04,7.11L66.43,9.56L68.68,13.18L69.24,14.99L69.52,20.93L68.12,25.06L65.31,28.68L58.01,35.14L65.03,41.6Z"/>
</svg>);

const V={bg:"#121212",card:"#1E1E1E",card2:"#252525",card3:"#2C2C2C",card4:"#333",border:"#363636",green:"#00C805",red:"#DC3545",blue:"#5865F2",gold:"#FFD700",purple:"#9B59B6",orange:"#FF9800",cyan:"#00BCD4",txt:"#FFFFFF",txM:"#B0B0B0",txD:"#666",txDD:"#444"};
const TIER_C={1:V.green,2:V.gold,3:V.blue};
const TIER_L={1:"Achat Immediat",2:"Surveillance",3:"Long Terme"};
const SECTOR_C={"Technologie":V.blue,"Finance":V.purple,"Industrie":V.orange,"Consommation":"#E91E63","Sante":V.cyan,"Matiere premiere":V.green,"Energie":V.orange,"ETF":V.gold,"Crypto":"#FF6B35","Autre":"#888"};
const DOMAINS={AMZN:"amazon.com",MSFT:"microsoft.com",AAPL:"apple.com",GOOGL:"google.com",GOOG:"google.com",META:"meta.com",NVDA:"nvidia.com",TSLA:"tesla.com","SU.PA":"se.com","AI.PA":"airliquide.com","MC.PA":"lvmh.com",SPGI:"spglobal.com",MA:"mastercard.com",FTNT:"fortinet.com",MELI:"mercadolibre.com",CCJ:"cameco.com",GLD:"spdrgoldshares.com",V:"visa.com",JPM:"jpmorganchase.com",NFLX:"netflix.com",COST:"costco.com",ADBE:"adobe.com",CRM:"salesforce.com",COIN:"coinbase.com",NET:"cloudflare.com",AMD:"amd.com",ASML:"asml.com",BKNG:"booking.com","RMS.PA":"hermes.com",FICO:"fico.com",NVO:"novonordisk.com","BTC-USD":"bitcoin.org","ETH-USD":"ethereum.org",CRCL:"circle.com"};
const getLogo=t=>{const d=DOMAINS[t];return d?`https://icon.horse/icon/${d}`:`/api/logo?t=${encodeURIComponent(t)}`;};
const fmtN=n=>n==null?"---":n>1e6?(n/1e6).toFixed(2)+" M":n>1e3?(n/1e3).toFixed(2)+" K":n.toLocaleString("fr-FR",{maximumFractionDigits:2});
const fmtP=n=>n==null?"---":(n>=0?"+":"")+n.toFixed(2)+"%";

// Market hours data
const MARKETS=[
  {name:"NYSE",flag:"US",open:"15:30",close:"22:00",tz:"America/New_York"},
  {name:"NASDAQ",flag:"US",open:"15:30",close:"22:00",tz:"America/New_York"},
  {name:"Euronext Paris",flag:"FR",open:"09:00",close:"17:30",tz:"Europe/Paris"},
  {name:"London Stock Exchange",flag:"GB",open:"09:00",close:"17:30",tz:"Europe/London"},
  {name:"Xetra",flag:"DE",open:"09:00",close:"17:30",tz:"Europe/Berlin"},
  {name:"Tokyo",flag:"JP",open:"02:00",close:"08:30",tz:"Asia/Tokyo"},
  {name:"Hong Kong",flag:"HK",open:"03:30",close:"10:00",tz:"Asia/Hong_Kong"},
  {name:"Toronto",flag:"CA",open:"15:30",close:"22:00",tz:"America/Toronto"},
];
const INDICES=[
  {name:"S&P 500",ticker:"^GSPC",flag:"US"},
  {name:"Nasdaq-100",ticker:"^NDX",flag:"US"},
  {name:"Dow Jones",ticker:"^DJI",flag:"US"},
  {name:"CAC 40",ticker:"^FCHI",flag:"FR"},
  {name:"DAX",ticker:"^GDAXI",flag:"DE"},
  {name:"FTSE 100",ticker:"^FTSE",flag:"GB"},
  {name:"Nikkei 225",ticker:"^N225",flag:"JP"},
];
const TRENDING_TICKERS=["MSFT","NVDA","AAPL","AMZN","META","GOOGL","MA","FTNT","ASML","BKNG","FICO","NVO"];

function Logo({ticker,size=32}){const[e,setE]=useState(false);if(e)return<div style={{width:size,height:size,borderRadius:8,background:V.card3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:V.txM,flexShrink:0}}>{(ticker||"?")[0]}</div>;return<img src={getLogo(ticker)} width={size} height={size} style={{borderRadius:8,objectFit:"contain",background:V.card3,flexShrink:0}} onError={()=>setE(true)} alt=""/>;}

function isMarketOpen(m){const now=new Date();const day=now.getDay();if(day===0||day===6)return false;const h=now.getHours(),mi=now.getMinutes();const[oh,om]=m.open.split(":").map(Number);const[ch,cm]=m.close.split(":").map(Number);const curr=h*60+mi;return curr>=oh*60+om&&curr<ch*60+cm;}

function MiniSpark({data,width=80,height=28,color}){
  if(!data||data.length<3)return null;
  const mn=Math.min(...data),mx=Math.max(...data),rg=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-mn)/rg)*height}`).join(" ");
  const c=color||(data[data.length-1]>=data[0]?V.green:V.red);
  return<svg width={width} height={height}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>;
}

export default function UppValueApp(){
  const[tab,setTab]=useState("home");
  const[portfolio,setPortfolio]=useState([]);
  const[watchlist,setWatchlist]=useState([]);
  const[prices,setPrices]=useState({});
  const[indexData,setIndexData]=useState({});
  const[trendingData,setTrendingData]=useState({});
  const[loading,setLoading]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[addMode,setAddMode]=useState("portfolio");
  const[addTicker,setAddTicker]=useState("");
  const[addData,setAddData]=useState(null);
  const[addFetching,setAddFetching]=useState(false);
  const[addForm,setAddForm]=useState({qty:"",pru:"",date:"",tier:1,target:"",sector:"Tech",type:"stock",name:""});
  const[searchResults,setSearchResults]=useState([]);
  const[searchLoading,setSearchLoading]=useState(false);
  const searchTimer=useRef(null);
  const[dcf,setDcf]=useState({fcf:"5000",g:"15",wacc:"10",tg:"3",sh:"1000"});
  const[selChart,setSelChart]=useState(null);
  const[chartData,setChartData]=useState(null);
  const[clock,setClock]=useState(new Date());
  const[displayCur,setDisplayCur]=useState("USD");
  const[fxRate,setFxRate]=useState(null);

  const cvt=useCallback((n)=>{if(n==null)return null;if(displayCur==="EUR"&&fxRate)return n*fxRate;return n;},[displayCur,fxRate]);
  const fmt=useCallback((n)=>n==null?"---":new Intl.NumberFormat("fr-FR",{style:"currency",currency:displayCur,maximumFractionDigits:0}).format(n),[displayCur]);
  const fmtU=useCallback((n)=>{if(n==null)return"---";const sym=displayCur==="EUR"?"\u20ac":"$";return n<1?n.toFixed(4)+" "+sym:n.toLocaleString("fr-FR",{maximumFractionDigits:2})+" "+sym;},[displayCur]);

  // Clock
  useEffect(()=>{const t=setInterval(()=>setClock(new Date()),30000);return()=>clearInterval(t);},[]);
  useEffect(()=>{(async()=>{try{const r=await fetch("/api/price?ticker=EURUSD=X");if(r.ok){const d=await r.json();if(d?.price)setFxRate(1/d.price);}}catch(e){}})();},[]);

  // Load from localStorage
  useEffect(()=>{try{const s=localStorage.getItem("uppvalue-v5");if(s){const d=JSON.parse(s);if(d.portfolio)setPortfolio(d.portfolio);if(d.watchlist)setWatchlist(d.watchlist);}}catch(e){}},[]);
  const save=useCallback((p,w)=>{localStorage.setItem("uppvalue-v5",JSON.stringify({portfolio:p??portfolio,watchlist:w??watchlist}));},[portfolio,watchlist]);

  const fetchPrice=async(ticker)=>{try{const r=await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}`);if(!r.ok)return null;return await r.json();}catch(e){return null;}};
  const fetchChart=async(ticker)=>{try{const r=await fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&compare=^GSPC`);if(!r.ok)return null;return await r.json();}catch(e){return null;}};

  // Fetch indices on load
  useEffect(()=>{(async()=>{
    const res={};
    for(const idx of INDICES){const d=await fetchPrice(idx.ticker);if(d)res[idx.ticker]=d;}
    setIndexData(res);
    // Fetch trending
    const tr={};
    for(const tk of TRENDING_TICKERS.slice(0,8)){const d=await fetchPrice(tk);if(d)tr[tk]=d;}
    setTrendingData(tr);
  })();},[]);

  // Refresh portfolio/watchlist prices
  const refreshAll=async()=>{setLoading(true);const tks=[...new Set([...portfolio.map(p=>p.ticker),...watchlist.map(w=>w.ticker)])];const np={};for(const t of tks){const d=await fetchPrice(t);if(d)np[t]=d;}setPrices(np);setLoading(false);};
  useEffect(()=>{if(portfolio.length>0||watchlist.length>0)refreshAll();},[portfolio.length,watchlist.length]);
  useEffect(()=>{if(!selChart)return;(async()=>{const d=await fetchChart(selChart);if(d)setChartData(d);})();},[selChart]);

  const enrichedP=useMemo(()=>{
    const groups={};
    portfolio.forEach(p=>{if(!groups[p.ticker])groups[p.ticker]={ticker:p.ticker,name:p.name,sector:p.sector,type:p.type,lots:[],totalQty:0,totalInv:0};const g=groups[p.ticker];g.lots.push(p);g.totalQty+=p.qty;g.totalInv+=p.qty*p.pru;g.name=p.name||g.name;});
    return Object.values(groups).map(g=>{const pru=g.totalQty>0?g.totalInv/g.totalQty:0;const l=prices[g.ticker];const inv=cvt(g.totalInv);const liveRaw=l?.price;const live=cvt(liveRaw);const mk=live!=null?g.totalQty*live:null;const pl=mk!=null?mk-inv:null;return{...g,qty:g.totalQty,pru:cvt(pru),pruRaw:pru,inv,mk,live,liveRaw,chg:l?.changePct,pl,plP:inv>0&&pl!=null?(pl/inv)*100:null,id:g.lots[0]?.id};});
  },[portfolio,prices,cvt]);
  const enrichedW=useMemo(()=>watchlist.map(w=>{const l=prices[w.ticker];const lp=cvt(l?.price);const tp=cvt(w.tp);const gap=lp&&tp?((lp-tp)/tp)*100:null;return{...w,live:lp,chg:l?.changePct,gap,atTarget:lp&&tp?lp<=tp:false};}),[watchlist,prices,cvt]);
  const totInv=enrichedP.reduce((s,e)=>s+(e.inv||0),0);const totMk=enrichedP.reduce((s,e)=>s+(e.mk||0),0);const totPL=totMk-totInv;

  const dcfR=useMemo(()=>{const f=parseFloat(dcf.fcf)||0,g=(parseFloat(dcf.g)||0)/100,w=(parseFloat(dcf.wacc)||10)/100,tg=(parseFloat(dcf.tg)||0)/100,sh=parseFloat(dcf.sh)||1;if(w<=tg)return{proj:[],ev:0,tvPV:0,fair:"N/A"};let ev=0;const proj=[];for(let y=1;y<=10;y++){const fc=f*Math.pow(1+g,y),pv=fc/Math.pow(1+w,y);ev+=pv;proj.push({year:"A"+y,fcf:Math.round(fc),pv:Math.round(pv)});}const tv=f*Math.pow(1+g,10)*(1+tg)/(w-tg),tvPV=tv/Math.pow(1+w,10);ev+=tvPV;return{proj,ev:Math.round(ev),tvPV:Math.round(tvPV),fair:(ev/sh).toFixed(2)};},[dcf]);

  const handleFetch=async()=>{if(!addTicker.trim())return;setAddFetching(true);setSearchResults([]);const d=await fetchPrice(addTicker.trim().toUpperCase());setAddData(d);if(d){setAddForm(f=>({...f,pru:d.price?.toFixed(2)||"",name:d.name||addTicker.toUpperCase()}));setPrices(p=>({...p,[addTicker.trim().toUpperCase()]:d}));}setAddFetching(false);};
  const handleTickerSearch=(val)=>{setAddTicker(val);setAddData(null);if(searchTimer.current)clearTimeout(searchTimer.current);if(val.length<1){setSearchResults([]);return;}setSearchLoading(true);searchTimer.current=setTimeout(async()=>{try{const r=await fetch("/api/search?q="+encodeURIComponent(val));const d=await r.json();setSearchResults(d.results||[]);}catch(e){setSearchResults([]);}setSearchLoading(false);},300);};
  const handleSelectResult=(r)=>{setAddTicker(r.symbol);setSearchResults([]);setAddFetching(true);fetchPrice(r.symbol).then(d=>{setAddData(d);if(d){setAddForm(f=>({...f,pru:d.price?.toFixed(2)||"",name:d.name||r.name,type:r.type==="equity"?"stock":r.type||"stock"}));setPrices(p=>({...p,[r.symbol]:d}));}setAddFetching(false);});};
  const handleAdd=()=>{const tk=addTicker.trim().toUpperCase();if(!tk)return;if(addMode==="portfolio"){const q=parseFloat(addForm.qty),pr=parseFloat(addForm.pru);if(!q||!pr)return;const np=[...portfolio,{id:Date.now(),ticker:tk,name:addForm.name||tk,qty:q,pru:pr,date:addForm.date||new Date().toISOString().split("T")[0],sector:addForm.sector,type:addForm.type}];setPortfolio(np);save(np,null);}else{const nw=[...watchlist,{id:Date.now(),ticker:tk,name:addForm.name||tk,tier:parseInt(addForm.tier)||1,tp:parseFloat(addForm.target)||0,sector:addForm.sector,type:addForm.type}];setWatchlist(nw);save(null,nw);}setShowAdd(false);setAddTicker("");setAddData(null);setSearchResults([]);setAddForm({qty:"",pru:"",date:"",tier:1,target:"",sector:"Tech",type:"stock",name:""});};

  const cs={background:V.card,border:"1px solid "+V.border,borderRadius:12,padding:16};
  const is={background:V.card2,border:"1px solid "+V.border,borderRadius:8,padding:"9px 12px",color:V.txt,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"};
  const bg={background:V.green,color:"#000",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5};

  const navItems=[
    {id:"home",label:"Accueil",icon:"\u2302"},
    {id:"portfolio",label:"Portefeuille",icon:"\u2197"},
    {id:"watchlist",label:"Watchlist",icon:"\u2605"},
    {id:"charts",label:"Graphiques",icon:"\u2500"},
    {id:"screener",label:"Screener",icon:"\u25CE"},
    {id:"dcf",label:"Valorisation",icon:"\u25B3"},
  ];

  return(<div style={{minHeight:"100vh",background:V.bg,color:V.txt,fontFamily:"Inter,sans-serif",display:"flex"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');*::-webkit-scrollbar{width:5px}*::-webkit-scrollbar-thumb{background:${V.border};border-radius:3px}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}`}</style>

    {/* SIDEBAR */}
    <div style={{width:72,minHeight:"100vh",background:V.card,borderRight:"1px solid "+V.border,padding:"12px 0",display:"flex",flexDirection:"column",alignItems:"center",position:"sticky",top:0,flexShrink:0}}>
      <div style={{marginBottom:20,cursor:"pointer"}} onClick={()=>setTab("home")}>
        <div style={{width:40,height:40,borderRadius:10,background:V.green+"22",display:"flex",alignItems:"center",justifyContent:"center"}}><AppLogo color={V.green} size={24}/></div>
      </div>
      <nav style={{flex:1,display:"flex",flexDirection:"column",gap:4,width:"100%",padding:"0 8px"}}>
        {navItems.map(n=>
          <button key={n.id} onClick={()=>setTab(n.id)} title={n.label} style={{width:"100%",height:48,borderRadius:10,border:"none",background:tab===n.id?V.green+"22":"transparent",color:tab===n.id?V.green:V.txD,cursor:"pointer",fontSize:10,fontWeight:tab===n.id?600:400,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
            <span style={{fontSize:18}}>{n.icon}</span>
            <span style={{fontSize:9}}>{n.label}</span>
          </button>
        )}
      </nav>
      <button onClick={()=>{setShowAdd(true);setAddMode("portfolio");}} title="Ajouter" style={{width:40,height:40,borderRadius:10,background:V.green,border:"none",color:"#000",fontSize:22,fontWeight:700,cursor:"pointer",marginBottom:8}}>+</button>
    </div>

    {/* MAIN */}
<div style={{flex:1,padding:"16px 32px",maxWidth:1536,marginLeft:"auto",marginRight:"auto",overflow:"auto",width:"100%"}}>

      {/* CURRENCY TOGGLE */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <div style={{display:"flex",background:V.card2,borderRadius:8,padding:2,gap:2}}>
          {["USD","EUR"].map(cu=><button key={cu} onClick={()=>setDisplayCur(cu)} style={{padding:"4px 12px",borderRadius:6,border:"none",background:displayCur===cu?V.green:"transparent",color:displayCur===cu?"#000":V.txD,cursor:"pointer",fontSize:11,fontWeight:displayCur===cu?700:400}}>{cu==="USD"?"$ USD":"\u20ac EUR"}</button>)}
        </div>
      </div>

      {/* ADD MODAL */}
      {showAdd&&<div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setShowAdd(false)}>
        <div onClick={e=>e.stopPropagation()} style={{width:440,background:V.card,border:"1px solid "+V.border,borderRadius:16,padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><h2 style={{margin:0,fontSize:18,fontWeight:700}}>Ajouter un Ticker</h2><button onClick={()=>setShowAdd(false)} style={{background:"transparent",border:"none",color:V.txD,cursor:"pointer",fontSize:18}}>X</button></div>
          <div style={{display:"flex",gap:4,marginBottom:16,background:V.card2,borderRadius:8,padding:3}}>
            {["portfolio","watchlist"].map(m=><button key={m} onClick={()=>setAddMode(m)} style={{flex:1,padding:8,borderRadius:6,border:"none",background:addMode===m?V.card3:"transparent",color:addMode===m?V.txt:V.txD,cursor:"pointer",fontSize:12,fontWeight:addMode===m?600:400}}>{m==="portfolio"?"Portefeuille":"Watchlist"}</button>)}
          </div>
          <div style={{position:"relative",marginBottom:16}}>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,position:"relative"}}>
                <span style={{position:"absolute",left:12,top:11,fontSize:14,color:V.txD}}>&#x1F50D;</span>
                <input value={addTicker} onChange={e=>handleTickerSearch(e.target.value.toUpperCase())} placeholder="Rechercher... (ex: Apple, MSFT, Bitcoin)" style={{...is,flex:1,fontSize:15,fontWeight:600,paddingLeft:36}} onKeyDown={e=>e.key==="Enter"&&handleFetch()} autoFocus/>
              </div>
              {addFetching&&<div style={{display:"flex",alignItems:"center",color:V.txD,fontSize:12}}>...</div>}
            </div>
            {searchResults.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:V.card2,border:"1px solid "+V.border,borderRadius:10,marginTop:4,maxHeight:280,overflowY:"auto",zIndex:10}}>
              {searchResults.map((r,i)=><div key={r.symbol+i} onClick={()=>handleSelectResult(r)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid "+V.border+"44"}} onMouseEnter={e=>e.currentTarget.style.background=V.card3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Logo ticker={r.symbol} size={28}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13}}>{r.symbol}</div>
                  <div style={{fontSize:11,color:V.txD,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:r.type==="equity"?V.blue+"22":r.type==="etf"?V.gold+"22":r.type==="cryptocurrency"?V.orange+"22":V.purple+"22",color:r.type==="equity"?V.blue:r.type==="etf"?V.gold:r.type==="cryptocurrency"?V.orange:V.purple}}>{r.type==="equity"?"Stock":r.type==="etf"?"ETF":r.type==="cryptocurrency"?"Crypto":r.type}</span>
                  <div style={{fontSize:10,color:V.txD,marginTop:2}}>{r.exchange}</div>
                </div>
              </div>)}
            </div>}
            {searchLoading&&searchResults.length===0&&addTicker.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:V.card2,border:"1px solid "+V.border,borderRadius:10,marginTop:4,padding:16,textAlign:"center",color:V.txD,fontSize:12}}>Recherche...</div>}
          </div>
          {addData&&<div style={{background:V.card2,borderRadius:10,padding:14,marginBottom:16,border:"1px solid "+V.green+"33",display:"flex",alignItems:"center",gap:12}}>
            <Logo ticker={addTicker} size={40}/>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{addData.name}</div><div style={{fontSize:11,color:V.txD}}>{addTicker}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:20,fontWeight:800,fontFamily:"monospace"}}>{fmtU(addData.price)}</div><div style={{fontSize:11,color:addData.changePct>0?V.green:V.red}}>{fmtP(addData.changePct)}</div></div>
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <input value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} style={is} placeholder="Nom"/>
            {addMode==="portfolio"?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <input type="number" step="0.01" value={addForm.pru} onChange={e=>setAddForm(f=>({...f,pru:e.target.value}))} style={is} placeholder="PRU ($)"/>
              <input type="number" step="0.001" value={addForm.qty} onChange={e=>setAddForm(f=>({...f,qty:e.target.value}))} style={is} placeholder="Quantite"/>
              <input type="date" value={addForm.date} onChange={e=>setAddForm(f=>({...f,date:e.target.value}))} style={is}/>
            </div>:<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <select value={addForm.tier} onChange={e=>setAddForm(f=>({...f,tier:parseInt(e.target.value)}))} style={is}><option value={1}>Tier 1 - Achat Immediat</option><option value={2}>Tier 2 - Surveillance</option><option value={3}>Tier 3 - Long Terme</option></select>
              <input type="number" step="0.01" value={addForm.target} onChange={e=>setAddForm(f=>({...f,target:e.target.value}))} style={is} placeholder="Prix cible ($)"/>
            </div>}
          </div>
          <button onClick={handleAdd} style={{...bg,width:"100%",justifyContent:"center",marginTop:16,padding:12,fontSize:14,borderRadius:10}}>Ajouter</button>
        </div>
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ HOME ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="home"&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
        {/* Search bar */}
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,position:"relative"}}>
            <span style={{position:"absolute",left:14,top:11,fontSize:16,color:V.txD}}>&#x1F50D;</span>
            <input placeholder="Rechercher une action..." style={{...is,paddingLeft:40,fontSize:14,borderRadius:12}} onClick={()=>{setShowAdd(true);setAddMode("portfolio");}}/>
          </div>
          <div style={{fontSize:11,color:V.txD}}>{clock.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</div>
        </div>

        {/* Indices Banner */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          {INDICES.slice(0,4).map(idx=>{
            const d=indexData[idx.ticker];
            return<div key={idx.ticker} style={{...cs,padding:14,cursor:"pointer"}} onClick={()=>{setSelChart(idx.ticker);setTab("charts");}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div><span style={{fontSize:10,color:V.txD,marginRight:4}}>{idx.flag}</span><span style={{fontSize:13,fontWeight:600}}>{idx.name}</span></div>
                {d&&<span style={{fontSize:12,fontWeight:700,color:d.changePct>=0?V.green:V.red}}>{fmtP(d.changePct)}</span>}
              </div>
              {d&&<div style={{fontSize:18,fontWeight:800,fontFamily:"monospace"}}>{fmtN(d.price)}</div>}
              {!d&&<div style={{fontSize:14,color:V.txD}}>Chargement...</div>}
            </div>;
          })}
        </div>

        {/* Market Hours + Indices Table side by side */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {/* Market Hours */}
          <div style={cs}>
            <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700}}>Marches</h3>
            {MARKETS.map(m=>{
              const open=isMarketOpen(m);
              return<div key={m.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid "+V.border+"44"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:10,color:V.txD,minWidth:18}}>{m.flag}</span>
                  <span style={{fontSize:12,color:V.txM}}>{m.name}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:V.txD}}>{m.open} - {m.close}</span>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:600,background:open?V.green+"22":V.red+"22",color:open?V.green:V.red}}>{open?"Ouvert":"Ferme"}</span>
                </div>
              </div>;
            })}
          </div>

          {/* Indices Table */}
          <div style={cs}>
            <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700}}>Principaux indices</h3>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr>{["Nom","Cours","Variation"].map(h=><th key={h} style={{padding:"6px 4px",textAlign:"left",color:V.txD,fontSize:10,borderBottom:"1px solid "+V.border}}>{h}</th>)}</tr></thead>
              <tbody>{INDICES.map(idx=>{
                const d=indexData[idx.ticker];
                return<tr key={idx.ticker} style={{borderBottom:"1px solid "+V.border+"22"}}>
                  <td style={{padding:"8px 4px"}}><span style={{fontSize:10,color:V.txD,marginRight:4}}>{idx.flag}</span><span style={{fontWeight:500}}>{idx.name}</span></td>
                  <td style={{padding:"8px 4px",fontFamily:"monospace"}}>{d?fmtN(d.price):"---"}</td>
                  <td style={{padding:"8px 4px",fontFamily:"monospace",color:d?.changePct>=0?V.green:V.red}}>{d?fmtP(d.changePct):"---"}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>

        {/* Trending Stocks */}
        <div style={cs}>
          <h3 style={{margin:"0 0 12px",fontSize:15,fontWeight:700}}>Tendances du moment</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
            {TRENDING_TICKERS.filter(tk=>trendingData[tk]).map(tk=>{
              const d=trendingData[tk];
              return<div key={tk} style={{background:V.card2,borderRadius:10,padding:12,cursor:"pointer",border:"1px solid "+V.border,transition:"border-color .15s"}} onClick={()=>{setSelChart(tk);setTab("charts");}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=V.green+"66"} onMouseLeave={e=>e.currentTarget.style.borderColor=V.border}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <Logo ticker={tk} size={28}/>
                  <div><div style={{fontWeight:600,fontSize:12}}>{d.name?.split(" ").slice(0,2).join(" ")}</div><div style={{fontSize:10,color:V.txD,fontFamily:"monospace"}}>{tk}</div></div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:15,fontWeight:700,fontFamily:"monospace"}}>{fmtU(d.price)}</span>
                  <span style={{fontSize:11,fontWeight:600,color:d.changePct>=0?V.green:V.red}}>{fmtP(d.changePct)}</span>
                </div>
              </div>;
            })}
          </div>
        </div>

        {/* Quick Portfolio Summary */}
        {portfolio.length>0&&<div style={cs}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Mon Portefeuille</h3>
            <button onClick={()=>setTab("portfolio")} style={{background:"transparent",border:"none",color:V.green,cursor:"pointer",fontSize:12}}>Voir tout &rarr;</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            <div style={{background:V.card2,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:10,color:V.txD}}>INVESTI</div><div style={{fontSize:16,fontWeight:700,color:V.blue,fontFamily:"monospace"}}>{fmt(totInv)}</div></div>
            <div style={{background:V.card2,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:10,color:V.txD}}>VALEUR</div><div style={{fontSize:16,fontWeight:700,fontFamily:"monospace"}}>{totMk>0?fmt(totMk):"---"}</div></div>
            <div style={{background:V.card2,borderRadius:8,padding:12,textAlign:"center"}}><div style={{fontSize:10,color:V.txD}}>P&L</div><div style={{fontSize:16,fontWeight:700,color:totPL>=0?V.green:V.red,fontFamily:"monospace"}}>{totInv>0?fmt(totPL):"---"}</div></div>
          </div>
        </div>}
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ PORTFOLIO ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="portfolio"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,fontWeight:700,color:V.green}}>Portefeuille</h2><button onClick={()=>{setShowAdd(true);setAddMode("portfolio");}} style={bg}>+ Position</button></div>
        {portfolio.length===0?<div style={{...cs,textAlign:"center",padding:48,color:V.txD}}>Ajoutez votre premiere position</div>:<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
            {[{l:"INVESTI",v:fmt(totInv),c:V.blue},{l:"MARCHE",v:totMk>0?fmt(totMk):"---",c:V.txt},{l:"P&L",v:totInv>0?fmt(totPL):"---",c:totPL>=0?V.green:V.red,sub:totInv>0?fmtP(totPL/totInv*100):null}].map(k=>
              <div key={k.l} style={{...cs,padding:14}}><div style={{fontSize:10,color:V.txD,letterSpacing:1,marginBottom:6}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,fontFamily:"monospace"}}>{k.v}</div>{k.sub&&<div style={{fontSize:11,color:k.c}}>{k.sub}</div>}</div>
            )}
          </div>
          {enrichedP.map(e=><div key={e.id} style={{...cs,padding:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Logo ticker={e.ticker} size={38}/>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{e.name} <span style={{fontSize:10,color:V.txD,fontFamily:"monospace"}}>{e.ticker}</span>{e.lots&&e.lots.length>1&&<span style={{fontSize:9,color:V.gold,marginLeft:4}}>({e.lots.length} lots)</span>}</div><div style={{fontSize:10,color:V.txD}}>{e.qty.toFixed(3)} x {fmtU(e.pru)} = {fmt(e.inv)}</div></div>
              <div style={{textAlign:"right"}}>
                {e.live&&<div style={{fontSize:18,fontWeight:800,fontFamily:"monospace"}}>{fmtU(e.live)}</div>}
                {e.chg!=null&&<div style={{fontSize:11,color:e.chg>0?V.green:V.red,fontFamily:"monospace"}}>{fmtP(e.chg)}</div>}
                {e.pl!=null&&<div style={{fontSize:13,fontWeight:700,color:e.pl>=0?V.green:V.red,fontFamily:"monospace"}}>{fmt(e.pl)} ({fmtP(e.plP)})</div>}
              </div>
              <button onClick={()=>{const p=portfolio.filter(x=>x.ticker!==e.ticker);setPortfolio(p);save(p,null);}} style={{background:"transparent",border:"none",color:V.txD,cursor:"pointer",fontSize:16}}>X</button>
            </div>
          </div>)}
        </>}
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ WATCHLIST ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="watchlist"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h2 style={{margin:0,fontSize:18,fontWeight:700,color:V.green}}>Watchlist</h2><button onClick={()=>{setShowAdd(true);setAddMode("watchlist");}} style={bg}>+ Ticker</button></div>
        {watchlist.length===0?<div style={{...cs,textAlign:"center",padding:48,color:V.txD}}>Ajoutez des tickers</div>:
          [1,2,3].map(tier=>{const items=enrichedW.filter(w=>w.tier===tier);if(!items.length)return null;return<div key={tier}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{width:10,height:10,borderRadius:3,background:TIER_C[tier]}}/><span style={{fontSize:14,fontWeight:700,color:TIER_C[tier]}}>Tier {tier} - {TIER_L[tier]}</span></div>
            {items.map(w=><div key={w.id} style={{...cs,padding:14,marginBottom:8,borderLeft:"3px solid "+TIER_C[w.tier]}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Logo ticker={w.ticker} size={36}/>
                <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{w.name} <span style={{fontSize:10,color:V.txD,fontFamily:"monospace"}}>{w.ticker}</span>{w.atTarget&&<span style={{fontSize:8,padding:"2px 6px",borderRadius:3,background:V.green+"22",color:V.green,fontWeight:700,marginLeft:6}}>CIBLE ATTEINTE</span>}</div></div>
                <div style={{textAlign:"right"}}>
                  {w.live&&<div style={{fontSize:17,fontWeight:800,fontFamily:"monospace"}}>{fmtU(w.live)}</div>}
                  <div style={{fontSize:11,color:V.txD}}>Cible: <span style={{color:V.gold,fontFamily:"monospace"}}>{w.tp>0?fmtU(w.tp):"---"}</span>{w.gap!=null&&<span style={{color:w.gap<=0?V.green:V.red,marginLeft:4}}>({fmtP(w.gap)})</span>}</div>
                </div>
                <button onClick={()=>{const wl=watchlist.filter(x=>x.id!==w.id);setWatchlist(wl);save(null,wl);}} style={{background:"transparent",border:"none",color:V.txD,cursor:"pointer",fontSize:16}}>X</button>
              </div>
            </div>)}
          </div>;})}
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ CHARTS ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="charts"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:V.green}}>Graphiques vs S&P 500</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {[...portfolio,...watchlist,...INDICES.map(i=>({id:i.ticker,ticker:i.ticker,name:i.name}))].map(p=><button key={p.id+p.ticker} onClick={()=>setSelChart(p.ticker)} style={{padding:"6px 12px",borderRadius:6,border:selChart===p.ticker?"1px solid "+V.green:"1px solid "+V.border,background:selChart===p.ticker?V.green+"20":"transparent",color:selChart===p.ticker?V.green:V.txM,cursor:"pointer",fontSize:11,fontWeight:selChart===p.ticker?600:400}}>{p.name}</button>)}
        </div>
        {chartData?<div style={cs}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontSize:16,fontWeight:700}}>{chartData.name}</div>
            <div style={{fontSize:13,fontFamily:"monospace",fontWeight:700}}>{fmtU(chartData.price)}</div>
          </div>
          <div style={{fontSize:12,color:V.txD,marginBottom:16}}>Rendement 1 an: <span style={{color:chartData.returnPct>=0?V.green:V.red,fontWeight:600}}>{fmtP(chartData.returnPct)}</span></div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,color:V.txD,marginBottom:6}}>Cours historique (1 an)</div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData.chartData}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={V.green} stopOpacity={0.3}/><stop offset="95%" stopColor={V.green} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={V.border}/><XAxis dataKey="date" tick={{fill:V.txD,fontSize:9}} tickFormatter={d=>d.slice(5)}/><YAxis tick={{fill:V.txD,fontSize:10}} domain={["auto","auto"]}/>
                <Tooltip contentStyle={{background:V.card2,border:"1px solid "+V.border,borderRadius:8,color:V.txt,fontSize:11}} formatter={v=>fmtU(v)}/>
                <Area type="monotone" dataKey="close" stroke={V.green} fill="url(#cg)" strokeWidth={2}/></AreaChart>
            </ResponsiveContainer>
          </div>
          {chartData.comparison&&chartData.comparison.length>0&&<div>
            <div style={{fontSize:11,color:V.txD,marginBottom:6}}>Performance vs S&P 500</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData.comparison}><CartesianGrid strokeDasharray="3 3" stroke={V.border}/>
                <XAxis dataKey="date" tick={{fill:V.txD,fontSize:9}} tickFormatter={d=>d.slice(5)}/><YAxis tick={{fill:V.txD,fontSize:10}} tickFormatter={v=>v.toFixed(0)+"%"}/>
                <Tooltip contentStyle={{background:V.card2,border:"1px solid "+V.border,borderRadius:8,color:V.txt,fontSize:11}} formatter={v=>v.toFixed(1)+"%"}/>
                <Line type="monotone" dataKey="main" name={chartData.name} stroke={V.green} strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="compare" name="S&P 500" stroke={V.gold} strokeWidth={2} dot={false} strokeDasharray="5 5"/>
                <Legend wrapperStyle={{fontSize:11}}/></LineChart>
            </ResponsiveContainer>
          </div>}
        </div>:<div style={{...cs,textAlign:"center",padding:48,color:V.txD}}>Selectionnez un ticker</div>}
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ SCREENER (S&P Table) ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="screener"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:V.green}}>Screener</h2>
        {enrichedP.length===0?<div style={{...cs,textAlign:"center",padding:48,color:V.txD}}>Ajoutez des positions pour voir les donnees</div>:
          <div style={cs}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead><tr>{["","Position","PRU","Prix Actuel","P&L","P&L %",""].map(h=><th key={h} style={{padding:8,textAlign:"left",color:V.txD,fontSize:10,borderBottom:"1px solid "+V.border}}>{h}</th>)}</tr></thead>
            <tbody>{enrichedP.map(e=><tr key={e.id} style={{cursor:"pointer",borderBottom:"1px solid "+V.border+"22"}} onClick={()=>{setSelChart(e.ticker);setTab("charts");}}
              onMouseEnter={ev=>ev.currentTarget.style.background=V.card2} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
              <td style={{padding:8}}><Logo ticker={e.ticker} size={28}/></td>
              <td style={{padding:8}}><div style={{fontWeight:600}}>{e.name}</div><div style={{fontSize:10,color:V.txD}}>{e.ticker}</div></td>
              <td style={{padding:8,fontFamily:"monospace"}}>{fmtU(e.pru)}</td>
              <td style={{padding:8,fontFamily:"monospace",fontWeight:600}}>{e.live?fmtU(e.live):"---"}</td>
              <td style={{padding:8,fontFamily:"monospace",color:e.pl!=null?(e.pl>=0?V.green:V.red):V.txD}}>{e.pl!=null?fmt(e.pl):"---"}</td>
              <td style={{padding:8,fontFamily:"monospace",fontWeight:600,color:e.plP!=null?(e.plP>=0?V.green:V.red):V.txD}}>{fmtP(e.plP)}</td>
              <td style={{padding:8,fontSize:10,color:V.green}}>Graphique &rarr;</td>
            </tr>)}</tbody>
          </table></div>}
      </div>}

      {/* ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ DCF ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ */}
      {tab==="dcf"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <h2 style={{margin:0,fontSize:18,fontWeight:700,color:V.green}}>Valeur Intrinseque (DCF)</h2>
        <div style={cs}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:16}}>
            {[{l:"FCF (M$)",k:"fcf"},{l:"Croissance %",k:"g"},{l:"WACC %",k:"wacc"},{l:"Terminal %",k:"tg"},{l:"Actions (M)",k:"sh"}].map(inp=>
              <div key={inp.k}><label style={{fontSize:10,color:V.txD,display:"block",marginBottom:3}}>{inp.l}</label><input type="number" value={dcf[inp.k]} onChange={ev=>setDcf(d=>({...d,[inp.k]:ev.target.value}))} style={is}/></div>
            )}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
            <div style={{padding:16,background:V.green+"15",borderRadius:12,textAlign:"center",border:"1px solid "+V.green+"33"}}><div style={{fontSize:10,color:V.green,letterSpacing:1,fontWeight:600}}>FAIR VALUE</div><div style={{fontSize:28,fontWeight:900,color:V.green,fontFamily:"monospace",marginTop:4}}>{dcfR.fair}$</div></div>
            <div style={{padding:16,background:V.card2,borderRadius:12,textAlign:"center"}}><div style={{fontSize:10,color:V.txD}}>ENTERPRISE VALUE</div><div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",marginTop:4}}>{(dcfR.ev/1e3).toFixed(1)}B$</div></div>
            <div style={{padding:16,background:V.card2,borderRadius:12,textAlign:"center"}}><div style={{fontSize:10,color:V.txD}}>TERMINAL (PV)</div><div style={{fontSize:18,fontWeight:700,color:V.gold,fontFamily:"monospace",marginTop:4}}>{(dcfR.tvPV/1e3).toFixed(1)}B$</div></div>
          </div>
          <ResponsiveContainer width="100%" height={200}><BarChart data={dcfR.proj}><CartesianGrid strokeDasharray="3 3" stroke={V.border}/>
            <XAxis dataKey="year" tick={{fill:V.txD,fontSize:10}}/><YAxis tick={{fill:V.txD,fontSize:10}}/>
            <Tooltip contentStyle={{background:V.card2,border:"1px solid "+V.border,borderRadius:8,color:V.txt,fontSize:11}}/>
            <Bar dataKey="fcf" name="FCF" fill={V.blue} radius={[4,4,0,0]} barSize={16}/><Bar dataKey="pv" name="VA" fill={V.green} radius={[4,4,0,0]} barSize={16} opacity={.5}/>
            <Legend wrapperStyle={{fontSize:11}}/></BarChart></ResponsiveContainer>
        </div>
      </div>}

      <div style={{marginTop:28,padding:"14px 0",borderTop:"1px solid "+V.border,textAlign:"center"}}><p style={{margin:0,fontSize:10,color:V.txD}}>UppValue v5 | Yahoo Finance | Inspire par Baggr</p></div>
    </div>
  </div>);
}
