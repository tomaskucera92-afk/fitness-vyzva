'use client';
import Link from 'next/link'; import { useRouter } from 'next/navigation';
import { clearSession, getSession } from '../lib/storage';
export function Topbar(){
  const r=useRouter(); const s=getSession();
  return (
    <div className="topbar">
      <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <span style={{fontWeight:900,letterSpacing:'-0.02em'}}>Fitness Výzva</span>
          <span className="small">{s?`${s.name} • ${s.role}`:'Nepřihlášen'}</span>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          {s?.role==='admin'?<Link className="btn" href="/admin">Admin</Link>:null}
          <button className="btn danger" onClick={()=>{clearSession(); r.replace('/login');}}>Odhlásit</button>
        </div>
      </div>
    </div>
  );
}
