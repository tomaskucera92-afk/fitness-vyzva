'use client';
import { useEffect, useState } from 'react';
import { getSession } from '../lib/storage';
import { useRouter } from 'next/navigation';
export function RequireAuth({children}:{children:React.ReactNode}){
  const r=useRouter(); const [ok,setOk]=useState(false);
  useEffect(()=>{const s=getSession(); if(!s){r.replace('/login');return;} setOk(true);},[r]);
  if(!ok) return <div className="container"><div className="card">Načítám…</div></div>;
  return <>{children}</>;
}
