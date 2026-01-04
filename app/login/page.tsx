'use client';
import { useState } from 'react'; import { useRouter } from 'next/navigation';
import { apiLogin } from '../../lib/api'; import { setSession } from '../../lib/storage';
export default function LoginPage(){
  const r=useRouter(); const [email,setEmail]=useState(''); const [pin,setPin]=useState('');
  const [err,setErr]=useState<string|null>(null); const [loading,setLoading]=useState(false);
  return (
    <div className="container" style={{paddingTop:40,paddingBottom:40}}>
      <div className="card" style={{maxWidth:520,margin:'0 auto'}}>
        <h1 style={{margin:'6px 0 2px',fontSize:24,letterSpacing:'-0.02em'}}>Přihlášení</h1>
        <div className="small">Zadej e-mail z listu USERS + svůj PIN.</div>
        <div className="field"><label className="small">E-mail</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="např. pepa@email.cz"/></div>
        <div className="field"><label className="small">PIN</label>
          <input className="input" value={pin} onChange={e=>setPin(e.target.value)} placeholder="např. 1234"/></div>
        {err?<div className="card" style={{borderColor:'rgba(239,68,68,0.35)',background:'rgba(239,68,68,0.10)'}}>{err}</div>:null}
        <div style={{display:'flex',gap:10,marginTop:12}}>
          <button className="btn primary" disabled={loading} onClick={async()=>{
            setErr(null); setLoading(true);
            try{const d=await apiLogin(email.trim().toLowerCase(),pin.trim());
              setSession({token:d.token,email:d.user.email,role:d.user.role,name:d.user.name}); r.replace('/');}
            catch(e:any){setErr(e.message||'Chyba');} finally{setLoading(false);}
          }}>{loading?'Přihlašuji…':'Přihlásit'}</button>
        </div>
        <div className="hr"></div>
        <div className="small">Admin tip: v Google Sheets v listu USERS přidej sloupec <b>pin</b> a vyplň ho uživatelům.</div>
      </div>
    </div>
  );
}
