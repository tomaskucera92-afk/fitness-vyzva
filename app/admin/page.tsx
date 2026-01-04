'use client';
import { useEffect, useState } from 'react';
import { RequireAuth } from '../../components/RequireAuth'; import { Topbar } from '../../components/Topbar';
import { getSession } from '../../lib/storage'; import { apiAdminAllRecords } from '../../lib/api';
type Row={email:string;date:string;done:boolean;bonus:number;penalty:number;points:number;note:string};
export default function AdminPage(){
  const [rows,setRows]=useState<Row[]|null>(null); const [err,setErr]=useState<string|null>(null);
  useEffect(()=>{const s=getSession(); if(!s) return; if(s.role!=='admin'){setErr('Nemáš admin práva.');return;}
    apiAdminAllRecords(s).then((d:any)=>setRows(d.rows)).catch((e:any)=>setErr(e.message||'Chyba'));},[]);
  return (
    <RequireAuth>
      <Topbar/>
      <div className="container" style={{paddingBottom:40}}>
        <div className="card">
          <div style={{fontWeight:900}}>Admin – všechny záznamy</div>
          <div className="small">Jen pro roli admin.</div>
          <div className="hr"></div>
          {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
          {!rows?<div className="small">Načítám…</div>:<table className="table">
            <thead><tr><th>E-mail</th><th>Datum</th><th>Splněno</th><th className="right">Body</th><th>Poznámka</th></tr></thead>
            <tbody>{rows.map((r,idx)=>(<tr key={idx}><td>{r.email}</td><td>{r.date}</td><td>{r.done?'✅':'❌'}</td><td className="right">{r.points}</td><td style={{color:'var(--muted)'}}>{r.note||''}</td></tr>))}</tbody>
          </table>}
        </div>
      </div>
    </RequireAuth>
  );
}
