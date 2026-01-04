import { Session } from './storage';
const API_BASE=process.env.NEXT_PUBLIC_API_BASE;
function base(){if(!API_BASE) throw new Error('Chybí NEXT_PUBLIC_API_BASE'); return API_BASE.replace(/\/+$/,'');}
export async function apiLogin(email:string,pin:string){
  const res=await fetch(`${base()}?path=auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,pin})});
  const data=await res.json(); if(!res.ok||!data.ok) throw new Error(data.error||'Přihlášení se nezdařilo'); return data;
}
async function get(path:string,s:Session){
  const res=await fetch(`${base()}?path=${encodeURIComponent(path)}&auth=${encodeURIComponent(s.token)}`);
  const data=await res.json(); if(!res.ok||data.ok===false) throw new Error(data.error||'Chyba API'); return data;
}
async function post(path:string,s:Session,body:any){
  const res=await fetch(`${base()}?path=${encodeURIComponent(path)}&auth=${encodeURIComponent(s.token)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});
  const data=await res.json(); if(!res.ok||data.ok===false) throw new Error(data.error||'Chyba API'); return data;
}
export const apiGetMySummary=(s:Session)=>get('summary',s);
export const apiGetHistory=(s:Session)=>get('records',s);
export const apiUpsertToday=(s:Session,p:{done:boolean;bonus:number;penalty:number;note:string})=>post('today',s,p);
export const apiLeaderboard=(s:Session)=>get('leaderboard',s);
export const apiAdminAllRecords=(s:Session)=>get('admin_records',s);
