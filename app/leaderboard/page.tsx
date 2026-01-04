'use client';
import { useEffect, useState } from 'react';
import { RequireAuth } from '../../components/RequireAuth'; import { Tabs } from '../../components/Tabs'; import { Topbar } from '../../components/Topbar';
import { apiLeaderboard } from '../../lib/api'; import { getSession } from '../../lib/storage';
type Row={name:string;points:number};
export default function LeaderboardPage(){
  const [rows,setRows]=useState<Row[]|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{const s=getSession(); if(!s) return; apiLeaderboard(s).then((d:any)=>setRows(d.rows)).catch((e:any)=>setErr(e.message||'Chyba'));},[]);
  const medal=(i:number)=>i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`;
  return (
    <RequireAuth>
      <Topbar/>
      <div className="container" style={{paddingBottom:80}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <div><div style={{fontWeight:900}}>Žebříček</div><div className="small">TOP 10 podle bodů.</div></div>
            <span className="badge">motivace 💪</span>
          </div>
          <div className="hr"></div>
          {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
          {!rows?<div className="small">Načítám…</div>:<table className="table">
            <thead><tr><th>#</th><th>Jméno</th><th className="right">Body</th></tr></thead>
            <tbody>{rows.slice(0,10).map((r,i)=>(<tr key={r.name}><td>{medal(i)}</td><td style={{fontWeight:800}}>{r.name}</td><td className="right">{r.points}</td></tr>))}</tbody>
          </table>}
        </div>
      </div>
      <Tabs/>
    </RequireAuth>
  );
}
