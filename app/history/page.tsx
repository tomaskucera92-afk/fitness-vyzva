'use client';
import { useEffect, useState } from 'react';
import { RequireAuth } from '../../components/RequireAuth'; import { Tabs } from '../../components/Tabs'; import { Topbar } from '../../components/Topbar';
import { apiGetHistory } from '../../lib/api'; import { getSession } from '../../lib/storage';
type Row={date:string;done:boolean;bonus:number;penalty:number;points:number;note:string};
export default function HistoryPage(){
  const [rows,setRows]=useState<Row[]|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{const s=getSession(); if(!s) return; apiGetHistory(s).then((d:any)=>setRows(d.rows)).catch((e:any)=>setErr(e.message||'Chyba'));},[]);
  return (
    <RequireAuth>
      <Topbar/>
      <div className="container" style={{paddingBottom:80}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <div><div style={{fontWeight:900}}>Historie</div><div className="small">Jen tvoje záznamy.</div></div>
            <span className="badge">nejnovější nahoře</span>
          </div>
          <div className="hr"></div>
          {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
          {!rows?<div className="small">Načítám…</div>:<table className="table">
            <thead><tr><th>Datum</th><th>Splněno</th><th className="right">Body</th><th>Poznámka</th></tr></thead>
            <tbody>{rows.map(r=>(<tr key={r.date}><td>{r.date}</td><td>{r.done?'✅':'❌'}</td><td className="right">{r.points}</td><td style={{color:'var(--muted)'}}>{r.note||''}</td></tr>))}</tbody>
          </table>}
        </div>
      </div>
      <Tabs/>
    </RequireAuth>
  );
}
