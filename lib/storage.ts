export type Session={token:string;email:string;role:'user'|'admin';name:string};
const KEY='fitness_vyzva_session_v1';
export function getSession():Session|null{if(typeof window==='undefined')return null;try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;}catch{return null;}}
export function setSession(s:Session){if(typeof window==='undefined')return;localStorage.setItem(KEY,JSON.stringify(s));}
export function clearSession(){if(typeof window==='undefined')return;localStorage.removeItem(KEY);}
