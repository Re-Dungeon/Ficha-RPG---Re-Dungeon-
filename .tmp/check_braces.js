const fs=require('fs');
const path='d:/Bagre.exe/01_PROJETOS/ReDungeon_Ficha/js/racas-data.js';
const s=fs.readFileSync(path,'utf8');
let stack=[];
let inSingle=false,inDouble=false,inBack=false,escape=false,inLineComment=false,inBlockComment=false;
for(let i=0;i<s.length;i++){
  const ch=s[i];
  const next=s[i+1];
  if(inLineComment){ if(ch==='\n') inLineComment=false; continue; }
  if(inBlockComment){ if(ch==='*' && next==='/' ){ inBlockComment=false; i++; continue; } else continue; }
  if(!inSingle && !inDouble && !inBack){ if(ch==='/' && next=='/'){ inLineComment=true; i++; continue } if(ch==='/' && next==='*'){ inBlockComment=true; i++; continue } }
  if(escape){ escape=false; continue }
  if(ch==='\\'){ escape=true; continue }
  if(!inSingle && !inBack && ch==='"'){ inDouble=!inDouble; continue }
  if(!inDouble && !inBack && ch==="'"){ inSingle=!inSingle; continue }
  if(!inSingle && !inDouble && ch==='`'){ inBack=!inBack; continue }
  if(inSingle||inDouble||inBack) continue;
  if(ch==='{'||ch==='[') stack.push({ch,i});
  else if(ch==='}'||ch===']'){
    if(stack.length===0){ console.log('unmatched closing',ch,'at',i); process.exit(0); }
    const top=stack[stack.length-1];
    if((top.ch==='{'&&ch==='}')||(top.ch==='['&&ch===']')) stack.pop();
    else{ console.log('mismatch at',i,'found',ch,'expected matching for',top.ch); process.exit(0); }
  }
}
if(stack.length){ const first=stack[stack.length-1]; const upto=s.slice(0,first.i); const line=upto.split('\n').length; console.log('first unclosed at index',first.i,'line',line,'char',first.ch); console.log('\n--- context before ---\n',s.slice(Math.max(0,first.i-200),first.i)); console.log('\n--- context after ---\n',s.slice(first.i,first.i+400)); } else console.log('balanced');
