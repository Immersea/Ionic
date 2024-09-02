import{i as o,w as s}from"./p-cbe60c68.js";import{a as t,s as r}from"./p-5347adbe.js";import{d as a}from"./p-9c77ce6f.js";import"./p-6879854f.js";
/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const c=()=>{const c=window;c.addEventListener("statusTap",(()=>{o((()=>{const o=c.innerWidth;const n=c.innerHeight;const e=document.elementFromPoint(o/2,n/2);if(!e){return}const i=t(e);if(i){new Promise((o=>a(i,o))).then((()=>{s((async()=>{i.style.setProperty("--overflow","hidden");await r(i,300);i.style.removeProperty("--overflow")}))}))}}))}))};export{c as startStatusTap};
//# sourceMappingURL=p-1c0cf846.js.map