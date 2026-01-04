'use client';
import { useState } from 'react';
import { RequireAuth } from '../../components/RequireAuth'; import { Tabs } from '../../components/Tabs'; import { Topbar } from '../../components/Topbar';
import { apiUpsertToday } from '../../lib/api'; import { getSession } from '../../lib/storage';
export default function TodayPage(){
  const [done,setDone]=useState(true); const [bonus,setBonus]=useState(0); const [penalty,setPenalty]=useState(0); const [note,setNote]=useState('');
  const [msg,setMsg]=useState<string|null>(null); const [err,setErr]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  const step=(v:number,d:number)=>Math.max(0,v+d);
  return (
    <RequireAuth>
      <Topbar/>
      <div className="container" style={{paddingBottom:80}}>
        <div className="card" style={{maxWidth:640}}>
          <h2 style={{margin:'6px 0 2px'}}>Dnešní záznam</h2>
          <div className="small">Vyplň jedním palcem. Uloží se do Google Sheets.</div>
          <div className="field"><label className="small">Splněno</label>
            <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <button className={['btn',done?'primary':''].join(' ')} onClick={()=>setDone(true)}>Ano</button>
              <button className={['btn',!done?'primary':''].join(' ')} onClick={()=>setDone(false)}>Ne</button>
              <span className="badge">{done?'✅ Splněno':'❌ Nesplněno'}</span>
            </div>
          </div>
          <div className="row">
            <div className="card" style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:900}}>Bonus</div><div className="small">extra aktivita</div>
              <div style={{display:'flex',gap:10,alignItems:'center',marginTop:10}}>
                <button className="btn" onClick={()=>setBonus(v=>step(v,-1))}>−</button>
                <div className="badge" style={{fontSize:16}}>{bonus}</div>
                <button className="btn" onClick={()=>setBonus(v=>step(v,1))}>+</button>
              </div>
            </div>
            <div className="card" style={{flex:1,minWidth:220}}>
              <div style={{fontWeight:900}}>Penalizace</div><div className="small">sladké, alkohol…</div>
              <div style={{display:'flex',gap:10,alignItems:'center',marginTop:10}}>
                <button className="btn" onClick={()=>setPenalty(v=>step(v,-1))}>−</button>
                <div className="badge" style={{fontSize:16}}>{penalty}</div>
                <button className="btn" onClick={()=>setPenalty(v=>step(v,1))}>+</button>
              </div>
            </div>
          </div>
          <div className="field"><label className="small">Poznámka (volitelné)</label>
            <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="např. 5 km běh"/></div>
          {msg?<div className="card" style={{borderColor:'rgba(16,185,129,0.35)',background:'rgba(16,185,129,0.10)'}}>{msg}</div>:null}
          {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
          <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap'}}>
            <button className="btn primary" disabled={loading} onClick={async()=>{
              setErr(null); setMsg(null); setLoading(true);
              try{const s=getSession(); if(!s) throw new Error('Nejsi přihlášen.');
                await apiUpsertToday(s,{done,bonus,penalty,note}); setMsg('Uloženo ✅');}
              catch(e:any){setErr(e.message||'Chyba');} finally{setLoading(false);}
            }}>{loading?'Ukládám…':'Uložit'}</button>
          </div>
        </div>
      </div>
      <Tabs/>
    </RequireAuth>
  );
}
