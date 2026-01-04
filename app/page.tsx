'use client';
import { useEffect, useState } from 'react';
import { RequireAuth } from '../components/RequireAuth'; import { Tabs } from '../components/Tabs'; import { Topbar } from '../components/Topbar';
import { apiGetMySummary } from '../lib/api'; import { getSession } from '../lib/storage';
type Summary={ok:true;totals:{points:number;doneDays:number;daysTotal:number};last7:{date:string;points:number}[]};
export default function Dashboard(){
  const [data,setData]=useState<Summary|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{const s=getSession(); if(!s) return; apiGetMySummary(s).then(setData).catch((e:any)=>setErr(e.message||'Chyba'));},[]);
  return (
    <RequireAuth>
      <Topbar/>
      <div className="container" style={{paddingBottom:80}}>
        {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
        {!data?<div className="card">Načítám dashboard…</div>:<>
          <div className="row">
            <div className="card kpi"><div className="value">{data.totals.points}</div><div className="label">Moje body</div></div>
            <div className="card kpi"><div className="value">{data.totals.doneDays}</div><div className="label">Splněno dní</div></div>
            <div className="card kpi"><div className="value">{data.totals.doneDays} / {data.totals.daysTotal}</div><div className="label">Progres výzvy</div></div>
          </div>
          <div className="card" style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:900}}>Posledních 7 dní</div><span className="badge">rychlý přehled</span>
            </div>
            <div className="hr"></div>
            <table className="table"><thead><tr><th>Datum</th><th className="right">Body</th></tr></thead>
              <tbody>{data.last7.map(r=>(<tr key={r.date}><td>{r.date}</td><td className="right">{r.points}</td></tr>))}</tbody>
            </table>
            <div className="small" style={{marginTop:10}}>Později lze doplnit graf (line chart). Tohle je nejstabilnější základ.</div>
          </div>
        </>}
      </div>
      <Tabs/>
    </RequireAuth>
  );
}
