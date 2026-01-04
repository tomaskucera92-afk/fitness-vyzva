/**
 * Fitness Výzva API (Google Apps Script)
 * Přihlášení: email + PIN -> token
 *
 * 1) Google Sheets → Rozšíření → Apps Script
 * 2) Vlož sem celý kód
 * 3) Project Settings → Script properties:
 *    SHEET_ID = ID tabulky (z URL mezi /d/ a /edit)
 *    TOKEN_SECRET = libovolné dlouhé heslo
 * 4) Deploy → New deployment → Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) Získáš URL. Tu dáš do Vercel ENV jako NEXT_PUBLIC_API_BASE
 */

const prop = PropertiesService.getScriptProperties();

function json_(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function parseBody_(e){ try{return e?.postData?.contents ? JSON.parse(e.postData.contents) : {}; }catch{return {};} }
function nowIso_(){ return Utilities.formatDate(new Date(),'Europe/Prague',"yyyy-MM-dd'T'HH:mm:ss"); }
function today_(){ return Utilities.formatDate(new Date(),'Europe/Prague','yyyy-MM-dd'); }
function ss_(){ const id=prop.getProperty('SHEET_ID'); if(!id) throw new Error('Chybí SHEET_ID'); return SpreadsheetApp.openById(id); }
function headerMap_(sh){ const h=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; const m={}; h.forEach((x,i)=>m[String(x).trim()]=i+1); return m; }
function findRowBy_(sh,map,colName,value){
  const col=map[colName]; if(!col) return -1;
  const last=sh.getLastRow(); if(last<2) return -1;
  const vals=sh.getRange(2,col,last-1,1).getValues();
  const v=String(value).trim().toLowerCase();
  for(let i=0;i<vals.length;i++){ if(String(vals[i][0]).trim().toLowerCase()===v) return i+2; }
  return -1;
}
function signToken_(email){
  const secret = prop.getProperty('TOKEN_SECRET') || 'change-me';
  const raw = email.toLowerCase() + '|' + nowIso_() + '|' + secret;
  const digest = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw));
  return Utilities.base64EncodeWebSafe(email.toLowerCase()) + '.' + digest;
}
function verifyToken_(token){
  if(!token) return null;
  const parts=token.split('.'); if(parts.length!==2) return null;
  const email=Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString();
  return email ? email.toLowerCase() : null;
}
function authUser_(email,pin){
  const sh=ss_().getSheetByName('USERS'); const map=headerMap_(sh);
  if(!map.email || !map.pin) throw new Error('V USERS musí být sloupce email a pin.');
  const row=findRowBy_(sh,map,'email',email); if(row<0) return null;
  const v=sh.getRange(row,1,1,sh.getLastColumn()).getValues()[0];
  const get=(name)=>v[map[name]-1];
  if(String(get('pin')||'').trim()!==String(pin||'').trim()) return null;
  return { email:String(get('email')).trim().toLowerCase(), role:String(get('role')||'user').trim().toLowerCase(), name:String(get('jmeno')||'Uživatel').trim() };
}
function getSettings_(){
  const sh=ss_().getSheetByName('SETTINGS'); const map=headerMap_(sh);
  const last=sh.getLastRow(); const out={}; if(last<2) return out;
  const vals=sh.getRange(2,1,last-1,sh.getLastColumn()).getValues();
  vals.forEach(r=>{ const k=String(r[map.klic-1]||'').trim(); if(k) out[k]=r[map.hodnota-1]; });
  return out;
}
function points_(done,bonus,penalty,s){ return (done?Number(s.body_splneno||1):0) + Number(bonus||0)*Number(s.body_bonus||1) - Number(penalty||0)*Number(s.body_penalizace||1); }

function getRecordsForEmail_(email){
  const sh=ss_().getSheetByName('RECORDS'); const map=headerMap_(sh);
  const last=sh.getLastRow(); if(last<2) return [];
  const vals=sh.getRange(2,1,last-1,sh.getLastColumn()).getValues();
  const rows=[];
  vals.forEach(r=>{
    const em=String(r[map.email-1]||'').trim().toLowerCase();
    if(em===email.toLowerCase()) rows.push({email:em,date:String(r[map.datum-1]||''),done:Boolean(r[map.splneno-1]),bonus:Number(r[map.bonus-1]||0),penalty:Number(r[map.penalizace-1]||0),points:Number(r[map.body-1]||0),note:String(r[map.poznamka-1]||'')});
  });
  rows.sort((a,b)=>a.date<b.date?1:-1);
  return rows;
}

function upsertToday_(email, payload){
  const sh=ss_().getSheetByName('RECORDS'); const map=headerMap_(sh); const s=getSettings_();
  const d=today_(); const last=sh.getLastRow(); const cols=sh.getLastColumn();
  let found=-1;
  if(last>=2){
    const vals=sh.getRange(2,1,last-1,cols).getValues();
    for(let i=0;i<vals.length;i++){
      const em=String(vals[i][map.email-1]||'').trim().toLowerCase();
      const dt=String(vals[i][map.datum-1]||'').trim();
      if(em===email.toLowerCase() && dt===d){ found=i+2; break; }
    }
  }
  const done=!!payload.done, bonus=Number(payload.bonus||0), penalty=Number(payload.penalty||0), note=String(payload.note||'');
  const pts=points_(done,bonus,penalty,s);
  if(found>0){
    sh.getRange(found,map.splneno).setValue(done);
    sh.getRange(found,map.bonus).setValue(bonus);
    sh.getRange(found,map.penalizace).setValue(penalty);
    sh.getRange(found,map.body).setValue(pts);
    sh.getRange(found,map.poznamka).setValue(note);
  } else {
    const row=new Array(cols).fill('');
    row[map.email-1]=email.toLowerCase(); row[map.datum-1]=d; row[map.splneno-1]=done;
    row[map.bonus-1]=bonus; row[map.penalizace-1]=penalty; row[map.body-1]=pts; row[map.poznamka-1]=note;
    sh.appendRow(row);
  }
  return {date:d,points:pts};
}

function computeLeaderboard_(){
  const ss=ss_();
  const u=ss.getSheetByName('USERS'); const r=ss.getSheetByName('RECORDS');
  const mu=headerMap_(u), mr=headerMap_(r);
  const uLast=u.getLastRow(), rLast=r.getLastRow();
  const users=uLast<2?[]:u.getRange(2,1,uLast-1,u.getLastColumn()).getValues();
  const rec=rLast<2?[]:r.getRange(2,1,rLast-1,r.getLastColumn()).getValues();
  const pts={};
  rec.forEach(x=>{ const em=String(x[mr.email-1]||'').trim().toLowerCase(); const p=Number(x[mr.body-1]||0); if(em) pts[em]=(pts[em]||0)+p; });
  const rows=users.filter(x=>String(x[mu.role-1]||'user').trim().toLowerCase()!=='admin')
    .map(x=>{ const em=String(x[mu.email-1]).trim().toLowerCase(); return {name:String(x[mu.jmeno-1]||'Uživatel').trim(), points:Number(pts[em]||0)}; })
    .sort((a,b)=>b.points-a.points);
  return rows;
}

function doPost(e){
  const path=String(e?.parameter?.path||''); const body=parseBody_(e);
  if(path==='auth'){
    const email=String(body.email||'').trim().toLowerCase();
    const pin=String(body.pin||'').trim();
    const user=authUser_(email,pin);
    if(!user) return json_({ok:false,error:'Špatný email nebo PIN.'});
    return json_({ok:true,token:signToken_(user.email),user});
  }
  const token=String(e?.parameter?.auth||'');
  const email=verifyToken_(token);
  if(!email) return json_({ok:false,error:'Neplatný token (přihlas se znovu).'});
  if(path==='today') return json_({ok:true,result:upsertToday_(email,body||{})});
  return json_({ok:false,error:'Neznámý endpoint.'});
}

function doGet(e){
  const path=String(e?.parameter?.path||'');
  if(path==='health') return json_({ok:true,time:nowIso_()});
  const token=String(e?.parameter?.auth||'');
  const email=verifyToken_(token);
  if(!email) return json_({ok:false,error:'Chybí/Neplatný token.'});
  if(path==='summary'){
    const s=getSettings_(); const rows=getRecordsForEmail_(email);
    const points=rows.reduce((a,x)=>a+Number(x.points||0),0);
    const doneDays=rows.filter(x=>x.done).length;
    const daysTotal=Number(s.pocet_dni||168);
    const last7=rows.slice(0,7).reverse().map(x=>({date:x.date,points:x.points}));
    return json_({ok:true,totals:{points,doneDays,daysTotal},last7});
  }
  if(path==='records') return json_({ok:true,rows:getRecordsForEmail_(email)});
  if(path==='leaderboard') return json_({ok:true,rows:computeLeaderboard_()});
  if(path==='admin_records'){
    const sh=ss_().getSheetByName('USERS'); const map=headerMap_(sh);
    const row=findRowBy_(sh,map,'email',email); if(row<0) return json_({ok:false,error:'Uživatel nenalezen.'});
    const v=sh.getRange(row,1,1,sh.getLastColumn()).getValues()[0];
    if(String(v[map.role-1]||'user').trim().toLowerCase()!=='admin') return json_({ok:false,error:'Nemáš admin práva.'});
    // return all rows (simple)
    const rec=ss_().getSheetByName('RECORDS'); const mr=headerMap_(rec);
    const last=rec.getLastRow(); if(last<2) return json_({ok:true,rows:[]});
    const vals=rec.getRange(2,1,last-1,rec.getLastColumn()).getValues();
    const rows=vals.map(x=>({email:String(x[mr.email-1]||'').trim().toLowerCase(),date:String(x[mr.datum-1]||''),done:Boolean(x[mr.splneno-1]),bonus:Number(x[mr.bonus-1]||0),penalty:Number(x[mr.penalizace-1]||0),points:Number(x[mr.body-1]||0),note:String(x[mr.poznamka-1]||'')})).sort((a,b)=>a.date<b.date?1:-1);
    return json_({ok:true,rows});
  }
  return json_({ok:false,error:'Neznámý endpoint.'});
}
