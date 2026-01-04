'use client';
import Link from 'next/link'; import { usePathname } from 'next/navigation';
const items=[{href:'/',label:'Dashboard'},{href:'/today',label:'Dnes'},{href:'/history',label:'Historie'},{href:'/leaderboard',label:'Žebříček'}];
export function Tabs(){const p=usePathname(); return (
  <nav className="tabs">{items.map(it=>(
    <Link key={it.href} href={it.href} className={['tab',p===it.href?'active':''].join(' ')}><span>{it.label}</span></Link>
  ))}</nav>
);}
