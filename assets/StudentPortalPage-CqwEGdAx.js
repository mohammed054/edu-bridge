import{j as e,r as m,u as Q,a as ee}from"./index-df1SZI71.js";import{a8 as ae,a9 as se}from"./api-x0wxRGLh.js";/* empty css                      */function D({title:a,description:i,compact:s=!1}){return e.jsxs("div",{className:`flex flex-col items-center justify-center text-center rounded-md bg-slate-50 border border-border ${s?"py-8 px-6":"py-14 px-6"}`,children:[e.jsx("div",{className:"w-10 h-10 rounded-full bg-border mb-3"}),e.jsx("p",{className:"text-[15px] font-semibold text-text-primary",children:a}),i&&e.jsx("p",{className:"mt-1 text-[13px] text-text-secondary max-w-[260px]",children:i})]})}const re=new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short",year:"numeric"}),te=new Intl.DateTimeFormat("ar-SA",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),S=a=>{if(!a)return"—";const i=a instanceof Date?a:new Date(a);return Number.isNaN(i.getTime())?"—":re.format(i)},ie=a=>{if(!a)return"—";const i=a instanceof Date?a:new Date(a);return Number.isNaN(i.getTime())?"—":te.format(i)},E=(a,i=0)=>{const s=Number(a);return Number.isFinite(s)?new Intl.NumberFormat("ar-SA",{minimumFractionDigits:0,maximumFractionDigits:i}).format(s):"0"},ne=a=>{if(!a.length)return 0;const i=a.reduce((r,t)=>r+Number(t.score||0),0),s=a.reduce((r,t)=>r+Number(t.outOf||0),0);return s?i/s*100:0},oe=a=>a>=75?"#00C853":a>=50?"#FFB300":"#D32F2F",_=a=>a>=90?{label:"ممتاز",color:"#00C853"}:a>=75?{label:"جيد جداً",color:"#2C7BE5"}:a>=60?{label:"جيد",color:"#FFB300"}:a>=50?{label:"مقبول",color:"#F97316"}:{label:"ضعيف",color:"#D32F2F"};function le({rows:a=[]}){const i=ne(a),{label:s,color:r}=_(i);return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"panel-card",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsx("span",{className:"text-[13px] font-semibold text-text-secondary",children:"المتوسط العام"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-[11px] font-semibold px-2 py-0.5 rounded-full",style:{background:r+"18",color:r},children:s}),e.jsxs("span",{className:"text-[22px] font-bold text-text-primary",children:[E(i,1),"٪"]})]})]}),e.jsx("div",{className:"h-2 rounded-full bg-border overflow-hidden",children:e.jsx("div",{className:"grade-fill h-full rounded-full",style:{width:`${Math.max(2,Math.min(100,i))}%`,background:oe(i)}})})]}),a.length?e.jsx("div",{className:"surface-card overflow-hidden",children:e.jsxs("table",{className:"w-full min-w-[480px] border-collapse",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-slate-50 border-b border-border",children:[e.jsx("th",{className:"text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide",children:"التقييم"}),e.jsx("th",{className:"text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide",children:"الدرجة"}),e.jsx("th",{className:"text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide",children:"النسبة"}),e.jsx("th",{className:"text-right px-4 py-3 text-[11px] font-semibold text-text-secondary uppercase tracking-wide",children:"التاريخ"})]})}),e.jsx("tbody",{children:a.map((t,l)=>{const p=t.outOf?Number(t.score)/Number(t.outOf)*100:0,{label:o,color:n}=_(p);return e.jsxs("tr",{className:`border-b border-border last:border-0 premium-transition hover:bg-slate-50 ${l%2===0,""}`,children:[e.jsx("td",{className:"px-4 py-3 text-[14px] text-text-primary",children:t.assessment}),e.jsxs("td",{className:"px-4 py-3 text-[14px] font-bold text-text-primary",children:[E(t.score)," / ",E(t.outOf)]}),e.jsx("td",{className:"px-4 py-3",children:e.jsx("span",{className:"text-[11px] font-semibold px-2 py-0.5 rounded-full",style:{background:n+"18",color:n},children:o})}),e.jsx("td",{className:"px-4 py-3 text-[13px] text-text-secondary",children:S(t.date)})]},t.id)})})]})}):e.jsx(D,{title:"لا توجد درجات بعد",description:"ستظهر الدرجات هنا بعد إضافتها.",compact:!0})]})}const W={أكاديمي:{bg:"#EFF6FF",color:"#2C7BE5"},سلوك:{bg:"#FFFBEB",color:"#D97706"},واجبات:{bg:"#F0FDF4",color:"#00C853"},أخرى:{bg:"#F8FAFC",color:"#475569"}};function ce({summary:a,recentFeedback:i=[]}){const s=[{label:"الواجبات",value:(a==null?void 0:a.homeworkCount)??0,accent:"#2C7BE5"},{label:"المتوسط",value:`${E((a==null?void 0:a.averageGrade)??0,1)}٪`,accent:"#00C853"},{label:"الملاحظات",value:(a==null?void 0:a.feedbackCount)??0,accent:"#FFB300"}];return e.jsxs("aside",{className:"space-y-4",children:[e.jsxs("div",{className:"panel-card",children:[e.jsx("p",{className:"text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-3",children:"ملخص المادة"}),e.jsx("div",{className:"space-y-2",children:s.map(r=>e.jsxs("div",{className:"flex items-center justify-between py-2 border-b border-border last:border-0",children:[e.jsx("span",{className:"text-[13px] text-text-secondary",children:r.label}),e.jsx("strong",{className:"text-[16px] font-bold",style:{color:r.accent},children:r.value})]},r.label))})]}),e.jsxs("div",{className:"panel-card",children:[e.jsx("p",{className:"text-[12px] font-semibold text-text-secondary uppercase tracking-wide mb-3",children:"ملاحظات المادة"}),i.length?e.jsx("div",{className:"space-y-3",children:i.slice(0,4).map(r=>{const t=W[r.category]||W.أخرى;return e.jsxs("div",{className:"pb-3 border-b border-border last:border-0 last:pb-0",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2 mb-1",children:[e.jsx("span",{className:"text-[10px] font-bold px-1.5 py-0.5 rounded-full",style:{background:t.bg,color:t.color},children:r.category}),e.jsx("span",{className:"text-[11px] text-text-secondary",children:S(r.date)})]}),e.jsx("p",{className:"clamp-2 text-[12px] text-text-secondary leading-relaxed",children:r.preview})]},r.id)})}):e.jsx(D,{title:"لا توجد ملاحظات",compact:!0})]})]})}function de({tabs:a=[],activeKey:i,onChange:s}){return e.jsx("div",{className:"flex gap-1 p-1 bg-slate-50 border border-border rounded-sm mb-5",children:a.map(r=>{const t=r.key===i;return e.jsx("button",{type:"button",role:"tab","aria-selected":t,onClick:()=>s==null?void 0:s(r.key),className:`flex-1 py-2 px-3 rounded-[6px] text-[13px] font-semibold premium-transition focus-ring
              ${t?"bg-surface text-primary shadow-sm border border-border":"text-text-secondary hover:text-text-primary"}`,children:r.label},r.key)})})}const pe=[{key:"posts",label:"المنشورات"},{key:"homework",label:"الواجبات"},{key:"grades",label:"الدرجات"}],xe={مكتمل:{bg:"#F0FDF4",color:"#00C853"},"غير مكتمل":{bg:"#FEF2F2",color:"#D32F2F"}};function me(){return e.jsx("svg",{viewBox:"0 0 20 20",fill:"none",className:"w-4 h-4","aria-hidden":"true",children:e.jsx("path",{d:"m4 7 6 6 6-6",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})}const U=["#2C7BE5","#00C853","#FFB300","#D32F2F","#8B5CF6","#F97316","#14B8A6","#EC4899"];function he({current:a,allSubjects:i,onSwitch:s}){const[r,t]=m.useState(!1),l=m.useRef(null);return m.useEffect(()=>{if(!r)return;const p=o=>{l.current&&!l.current.contains(o.target)&&t(!1)};return document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[r]),e.jsxs("div",{ref:l,className:"relative",children:[e.jsxs("button",{type:"button",onClick:()=>t(p=>!p),className:"action-btn flex items-center gap-2 focus-ring","aria-haspopup":"listbox","aria-expanded":r,children:[e.jsx("span",{className:"max-w-[130px] truncate",children:a.name}),e.jsx(me,{})]}),r&&e.jsx("div",{role:"listbox","aria-label":"اختر مادة",className:"absolute start-0 top-full z-30 mt-1 min-w-[200px] rounded-md border border-border bg-surface shadow-md animate-fadeUp overflow-hidden",children:i.map((p,o)=>{const n=U[o%U.length];return e.jsxs("button",{type:"button",role:"option","aria-selected":p.id===a.id,onClick:()=>{s(p.id),t(!1)},className:`flex w-full items-center gap-3 px-4 py-3 text-right text-[13px] premium-transition hover:bg-slate-50 focus-ring
                  ${p.id===a.id?"bg-slate-50 font-semibold text-text-primary":"text-text-secondary"}`,children:[e.jsx("div",{className:"w-1 h-6 rounded-full flex-shrink-0",style:{background:n}}),e.jsx("img",{src:p.image,alt:"","aria-hidden":!0,className:"w-7 h-7 object-contain flex-shrink-0"}),e.jsx("span",{className:"flex-1",children:p.name})]},p.id)})})]})}function ge({subject:a,allSubjects:i,recentFeedback:s,onBack:r,onSwitch:t}){var h,x;const[l,p]=m.useState("posts"),[o,n]=m.useState({});m.useEffect(()=>{p("posts"),n({}),window.scrollTo({top:0,behavior:"smooth"})},[a==null?void 0:a.id]);const c=m.useMemo(()=>{const g=(a==null?void 0:a.grades)||[];if(!g.length)return 0;const b=g.reduce((N,F)=>N+Number(F.score||0),0),j=g.reduce((N,F)=>N+Number(F.outOf||0),0);return j?b/j*100:0},[a==null?void 0:a.grades]),d=g=>n(b=>({...b,[g]:!b[g]})),f=()=>{const g=a.posts||[];return g.length?e.jsx("div",{className:"space-y-3",children:g.map(b=>{var F;const j=!!o[b.id],N=b.body.length>180;return e.jsxs("div",{className:"panel-card",children:[e.jsxs("div",{className:"flex items-start justify-between gap-3 mb-2",children:[e.jsx("h4",{className:"text-[15px] font-semibold text-text-primary",children:b.title}),e.jsx("span",{className:"flex-shrink-0 text-[12px] text-text-secondary",children:S(b.date)})]}),e.jsx("p",{className:`text-[14px] text-text-secondary leading-[1.8] ${j?"":"clamp-3"}`,children:b.body}),((F=b.attachments)==null?void 0:F.length)>0&&e.jsx("div",{className:"flex flex-wrap gap-2 mt-3",children:b.attachments.map(C=>e.jsx("span",{className:"text-[12px] text-text-secondary border border-border bg-slate-50 px-2.5 py-1 rounded-sm",children:C},C))}),N&&e.jsx("button",{type:"button",onClick:()=>d(b.id),className:"mt-2 text-[12px] font-semibold text-primary hover:opacity-80 focus-ring",children:j?"إخفاء":"قراءة المزيد"})]},b.id)})}):e.jsx(D,{title:"لا توجد منشورات",description:"لا توجد منشورات لهذه المادة حالياً.",compact:!0})},u=()=>{const g=a.homework||[];return g.length?e.jsx("div",{className:"space-y-3",children:g.map(b=>{const j=xe[b.status]||{bg:"#F8FAFC",color:"#475569"};return e.jsxs("div",{className:"panel-card",children:[e.jsxs("div",{className:"flex items-start justify-between gap-3 mb-2",children:[e.jsx("h4",{className:"text-[15px] font-semibold text-text-primary",children:b.title}),e.jsx("span",{className:"flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full",style:{background:j.bg,color:j.color},children:b.status})]}),e.jsxs("p",{className:"text-[13px] text-text-secondary",children:["موعد التسليم: ",ie(b.dueDate)]}),b.attachment&&e.jsxs("p",{className:"mt-1 text-[13px] text-text-secondary",children:["مرفق: ",b.attachment]}),b.teacherComment&&e.jsxs("div",{className:"mt-3 bg-slate-50 border border-border rounded-sm px-3 py-2.5 text-[13px] text-text-secondary leading-relaxed",children:["ملاحظة المعلم: ",b.teacherComment]})]},b.id)})}):e.jsx(D,{title:"لا توجد واجبات",description:"لا توجد واجبات مسجلة لهذه المادة.",compact:!0})},y={homeworkCount:((h=a.homework)==null?void 0:h.length)||0,averageGrade:c,feedbackCount:((x=a.feedbackItems)==null?void 0:x.length)||0};return e.jsxs("main",{dir:"rtl",className:"min-h-screen bg-background",children:[e.jsx("div",{className:"sticky top-0 z-20 bg-surface border-b border-border",children:e.jsxs("div",{className:"max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4",children:[e.jsx("button",{type:"button",onClick:r,className:"action-btn focus-ring pressable",children:"← رجوع"}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"text-[12px] text-text-secondary hidden sm:inline",children:"الانتقال إلى:"}),e.jsx(he,{current:a,allSubjects:i,onSwitch:t})]})]})}),e.jsxs("div",{className:"max-w-[1200px] mx-auto px-6 py-8",children:[e.jsxs("div",{className:"surface-card mb-7 overflow-hidden",children:[e.jsx("div",{className:"h-1 w-full bg-primary"}),e.jsxs("div",{className:"flex items-center gap-5 p-6",children:[e.jsx("div",{className:"flex-shrink-0 w-20 h-20 flex items-center justify-center bg-slate-50 rounded-md border border-border",children:e.jsx("img",{src:a.image,alt:a.name,className:"w-14 h-14 object-contain"})}),e.jsxs("div",{children:[e.jsx("h1",{className:"h2-premium",children:a.name}),e.jsxs("p",{className:"text-[14px] text-text-secondary mt-1",children:["المعلم: ",a.teacher]}),e.jsxs("p",{className:"text-[13px] text-text-secondary mt-0.5",children:["المتوسط الحالي: ",e.jsxs("strong",{className:"text-text-primary",children:[Number(c).toFixed(1),"٪"]})]})]})]})]}),e.jsxs("div",{className:"grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]",children:[e.jsxs("div",{children:[e.jsx(de,{tabs:pe,activeKey:l,onChange:p}),l==="posts"?f():l==="homework"?u():e.jsx(le,{rows:a.grades||[]})]}),e.jsx(ce,{summary:y,recentFeedback:a.feedbackItems||[]})]})]})]})}const be="/edu-bridge/assets/arabic-DpzAsG7P.png",ue="/edu-bridge/assets/biology-CLN4ZAM2.png",fe="/edu-bridge/assets/chemistry-CXjPhEZn.png",je="/edu-bridge/assets/islamic-studies-BCn_swsR.png",$="/edu-bridge/assets/math-Bl34fPvW.png",ye="/edu-bridge/assets/physics-Dst6CiM8.png",ve="/edu-bridge/assets/social-studies-CLGdCg6t.png",Ne="/edu-bridge/assets/english-CoFe_4wl.png",T={الرياضيات:$,"اللغة العربية":be,الفيزياء:ye,الكيمياء:fe,الأحياء:ue,"الدراسات الاجتماعية":ve,"التربية الإسلامية":je,"اللغة الانجليزية":Ne};function we(a){if(!a)return $;if(T[a])return T[a];const i=Object.keys(T).find(s=>a.includes(s)||s.includes(a));return i?T[i]:$}const Fe={academic:"أكاديمي",moral:"سلوك",behavior:"سلوك",idfk:"أخرى"},X=a=>Fe[String(a||"").trim().toLowerCase()]||a||"أخرى",k=["#2C7BE5","#00C853","#FFB300","#D32F2F","#8B5CF6","#F97316","#14B8A6"],ke={improving:"في تحسّن",declining:"يحتاج متابعة",stable:"مستقر"},K={low:{label:"منخفض",color:"#00C853"},medium:{label:"متوسط",color:"#FFB300"},high:{label:"مرتفع",color:"#D32F2F"}},Ce={active:"نشط ومتفاعل",moderate:"متوسط",low:"يحتاج اهتماماً"},z={أكاديمي:{bg:"#EFF6FF",c:"#2C7BE5"},سلوك:{bg:"#FFFBEB",c:"#D97706"},واجبات:{bg:"#F0FDF4",c:"#00C853"},أخرى:{bg:"#F8FAFC",c:"#475569"}},Ee={1:"الاثنين",2:"الثلاثاء",3:"الأربعاء",4:"الخميس",5:"الجمعة"},H=["#2C7BE5","#00C853","#FFB300","#D32F2F","#8B5CF6","#F97316","#14B8A6","#EC4899"],q=["الرياضيات","الفيزياء","اللغة الانجليزية","اللغة الإنجليزية","اللغة العربية","الكيمياء","الأحياء","التربية الإسلامية","الدراسات الاجتماعية"];function Be(a){return[...a].sort((i,s)=>{const r=q.findIndex(o=>{var n;return((n=i.name)==null?void 0:n.includes(o))||o.includes(i.name||"")}),t=q.findIndex(o=>{var n;return((n=s.name)==null?void 0:n.includes(o))||o.includes(s.name||"")});return(r===-1?999:r)-(t===-1?999:t)})}const v={dashboard:"dashboard",grades:"grades",schedule:"schedule",ai:"ai",notes:"notes",profile:"profile"},Ae=[{id:v.dashboard,label:"الرئيسية",icon:"🏠"},{id:v.grades,label:"الدرجات",icon:"📊"},{id:v.schedule,label:"الجدول الأسبوعي",icon:"📅"},{id:v.ai,label:"التحليل الذكي",icon:"🤖"},{id:v.notes,label:"الملاحظات",icon:"📝"},{id:v.profile,label:"ملفي",icon:"👤"}];function L({d:a,size:i=18}){return e.jsx("svg",{viewBox:"0 0 24 24",fill:"none",style:{width:i,height:i,flexShrink:0},"aria-hidden":"true",children:e.jsx("path",{d:a,stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})}const ze=()=>e.jsx(L,{d:"M12 3a4 4 0 0 0-4 4v2.2c0 .8-.2 1.6-.7 2.3L6 13.4v1.1h12v-1.1l-1.3-1.9a4.2 4.2 0 0 1-.7-2.3V7a4 4 0 0 0-4-4Zm-2 14a2 2 0 0 0 4 0"}),I=()=>e.jsx(L,{d:"m15 18-6-6 6-6"}),Z=()=>e.jsx(L,{d:"m9 18 6-6-6-6"}),Se=()=>e.jsx(L,{d:"M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"});function Te({studentName:a,avatarUrl:i,notifCount:s,onLogout:r}){return e.jsx("nav",{className:"premium-topnav",children:e.jsxs("div",{className:"premium-topnav-inner",children:[e.jsxs("div",{className:"nav-identity",children:[i?e.jsx("img",{src:i,alt:a,className:"nav-avatar"}):e.jsx("div",{className:"nav-avatar-placeholder",children:(a==null?void 0:a[0])||"ط"}),e.jsx("div",{className:"nav-student-info",children:e.jsx("span",{className:"nav-student-name",children:a})})]}),e.jsx("div",{style:{flex:1}}),e.jsxs("div",{className:"nav-actions",children:[e.jsxs("button",{type:"button","aria-label":"الإشعارات",className:"nav-action-btn relative",children:[e.jsx(ze,{}),s>0&&e.jsx("span",{className:"nav-badge",children:s>9?"9+":s})]}),e.jsxs("button",{type:"button",onClick:r,className:"nav-action-btn nav-logout",children:[e.jsx(Se,{}),e.jsx("span",{className:"nav-logout-label",children:"خروج"})]})]})]})})}function De({activeTab:a,onTabChange:i}){const s=m.useRef(null),[r,t]=m.useState(!1),[l,p]=m.useState(!1),o=m.useCallback(()=>{const c=s.current;c&&(t(c.scrollLeft>4),p(c.scrollLeft<c.scrollWidth-c.clientWidth-4))},[]);m.useEffect(()=>{const c=s.current;if(!c)return;o(),c.addEventListener("scroll",o,{passive:!0});const d=new ResizeObserver(o);return d.observe(c),()=>{c.removeEventListener("scroll",o),d.disconnect()}},[o]);const n=c=>{var d;(d=s.current)==null||d.scrollBy({left:c*-160,behavior:"smooth"})};return e.jsxs("div",{className:"tabbar-wrap",children:[r&&e.jsx("button",{type:"button",className:"tabbar-scroll-arrow tabbar-scroll-arrow-start",onClick:()=>n(-1),"aria-label":"تمرير يساراً",children:e.jsx(Z,{})}),e.jsx("div",{ref:s,className:"tabbar-inner",role:"tablist",children:Ae.map(c=>e.jsxs("button",{role:"tab","aria-selected":a===c.id,type:"button",onClick:()=>i(c.id),className:`tabbar-tab ${a===c.id?"tabbar-tab-active":""}`,children:[e.jsx("span",{className:"tabbar-icon",children:c.icon}),e.jsx("span",{children:c.label}),a===c.id&&e.jsx("span",{className:"tabbar-underline"})]},c.id))}),l&&e.jsx("button",{type:"button",className:"tabbar-scroll-arrow tabbar-scroll-arrow-end",onClick:()=>n(1),"aria-label":"تمرير يميناً",children:e.jsx(I,{})})]})}function Le({subjects:a,onSelect:i}){const s=m.useRef(null),r=m.useRef(!1),t=m.useRef(0),l=m.useRef(0),p=m.useRef(0),o=m.useRef(0),n=m.useRef(0),c=m.useRef(null),d=m.useCallback(h=>{r.current=!0,t.current=h.pageX-s.current.offsetLeft,l.current=s.current.scrollLeft,p.current=0,o.current=h.pageX,n.current=Date.now(),s.current.style.cursor="grabbing",cancelAnimationFrame(c.current)},[]),f=m.useCallback(h=>{if(!r.current)return;h.preventDefault();const x=Date.now(),g=x-n.current||1,b=h.pageX-o.current;p.current=b/g,o.current=h.pageX,n.current=x;const N=(h.pageX-s.current.offsetLeft-t.current)*1.2;s.current.scrollLeft=l.current-N},[]),u=m.useCallback(()=>{if(!r.current)return;r.current=!1,s.current&&(s.current.style.cursor="grab");let h=p.current*16;const x=()=>{s.current&&(h*=.93,!(Math.abs(h)<.5)&&(s.current.scrollLeft-=h,c.current=requestAnimationFrame(x)))};c.current=requestAnimationFrame(x)},[]),y=h=>{var x;(x=s.current)==null||x.scrollBy({left:h*-280,behavior:"smooth"})};return e.jsxs("div",{className:"carousel-wrapper",children:[e.jsx("button",{type:"button",className:"carousel-arrow carousel-arrow-start",onClick:()=>y(-1),"aria-label":"السابق",children:e.jsx(Z,{})}),e.jsx("div",{ref:s,className:"carousel-track",onMouseDown:d,onMouseMove:f,onMouseUp:u,onMouseLeave:u,children:a.map((h,x)=>{const g=k[x%k.length];return e.jsxs("button",{type:"button",draggable:!1,className:"carousel-card",onClick:()=>i(h.id),style:{"--accent":g},children:[e.jsx("div",{className:"carousel-card-accent-bar",style:{background:g}}),e.jsx("div",{className:"carousel-card-img-zone",children:e.jsx("img",{src:h.image,alt:h.name,draggable:!1,className:"carousel-card-img"})}),e.jsxs("div",{className:"carousel-card-info",children:[e.jsx("p",{className:"carousel-card-name",children:h.name}),e.jsx("p",{className:"carousel-card-teacher",children:h.teacher}),e.jsx("p",{className:"carousel-card-cta",style:{color:g},children:"عرض المادة ←"})]}),e.jsx("div",{className:"carousel-card-hover-glow",style:{"--accent":g}})]},h.id)})}),e.jsx("button",{type:"button",className:"carousel-arrow carousel-arrow-end",onClick:()=>y(1),"aria-label":"التالي",children:e.jsx(I,{})})]})}function Ie({subjects:a,feedback:i,onTabChange:s}){const r=a.reduce((o,n)=>{var c;return o+(((c=n.homework)==null?void 0:c.length)||0)},0),t=a.reduce((o,n)=>o+(n.homework||[]).filter(c=>c.status==="مكتمل").length,0),l=i[0]||null,p=l?z[l.category]||z.أخرى:null;return e.jsxs("div",{className:"summary-cards-row",children:[e.jsxs("div",{className:"summary-card",children:[e.jsxs("div",{className:"summary-card-header",children:[e.jsx("div",{className:"summary-card-icon",style:{background:"#F0FDF4",color:"#00C853"},children:"📝"}),e.jsxs("div",{children:[e.jsx("p",{className:"summary-card-title",children:"الواجبات"}),e.jsx("p",{className:"summary-card-sub",children:t>0?`${t} مكتمل من ${r}`:`${r} واجب`})]})]}),r>0&&e.jsx("div",{className:"summary-progress-track",children:e.jsx("div",{className:"summary-progress-fill",style:{width:`${r?t/r*100:0}%`,background:"#00C853"}})})]}),e.jsxs("button",{type:"button",className:"summary-card summary-card-clickable",onClick:()=>s(v.notes),children:[e.jsxs("div",{className:"summary-card-header",children:[e.jsx("div",{className:"summary-card-icon",style:{background:"#FFF7ED",color:"#F97316"},children:"🔔"}),e.jsxs("div",{children:[e.jsx("p",{className:"summary-card-title",children:"الملاحظات"}),e.jsxs("p",{className:"summary-card-sub",children:[i.length," ملاحظة — اضغط للعرض"]})]})]}),l?e.jsxs("div",{className:"summary-feedback-preview",children:[e.jsxs("div",{className:"summary-feedback-top",children:[e.jsx("span",{className:"summary-feedback-subject",children:l.subjectName}),e.jsx("span",{className:"summary-feedback-badge",style:{background:p.bg,color:p.c},children:l.category}),e.jsx("span",{className:"summary-feedback-date",children:S(l.date)})]}),e.jsx("p",{className:"summary-feedback-text clamp-2",children:l.preview})]}):e.jsx("p",{className:"summary-empty-hint",children:"لا توجد ملاحظات حالياً"})]})]})}function Re({studentName:a,className:i,avatarUrl:s}){const r=new Date().getHours(),t=r<12?"صباح الخير":r<17?"مساء الخير":"مساء النور";return e.jsxs("div",{className:"welcome-card",children:[e.jsx("div",{className:"welcome-card-bg"}),e.jsxs("div",{className:"welcome-card-content",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"welcome-greeting",children:[t,"،"]}),e.jsx("h1",{className:"welcome-name",children:a}),i&&e.jsxs("p",{className:"welcome-class",children:["الصف ",i]}),e.jsx("p",{className:"welcome-subtitle",children:"مرحباً بك في بوابتك الأكاديمية المتكاملة"})]}),e.jsx("div",{className:"welcome-avatar-wrap",children:s?e.jsx("img",{src:s,alt:a,className:"welcome-avatar"}):e.jsx("div",{className:"welcome-avatar-placeholder",children:(a==null?void 0:a[0])||"ط"})})]})]})}function $e({portalData:a,subjects:i,onSelectSubject:s,onTabChange:r}){const t=(a==null?void 0:a.recentFeedback)||[],l=a==null?void 0:a.weeklySnapshot,p=t.slice(0,3);return e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsx(Ie,{subjects:i,feedback:t,onTabChange:r}),e.jsxs("section",{className:"section-block",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h2",{className:"section-title-premium",children:"المواد الدراسية"}),e.jsx("p",{className:"section-subtitle-premium",children:"اسحب أو اضغط للاستعراض ←"})]}),i.length>0?e.jsx(Le,{subjects:i,onSelect:s}):e.jsx("div",{className:"empty-card",children:e.jsx("p",{className:"empty-title",children:"لا توجد مواد مخصصة"})})]}),e.jsxs("div",{className:"dashboard-bottom-grid",children:[e.jsxs("div",{className:"section-block",children:[e.jsxs("div",{className:"section-header",children:[e.jsx("h3",{className:"section-title-sm",children:"آخر الملاحظات"}),t.length>0&&e.jsxs("button",{type:"button",className:"view-all-btn",onClick:()=>r(v.notes),children:["عرض الكل (",t.length,")"]})]}),p.length?e.jsx("div",{className:"notes-list",children:p.map(o=>{const n=z[o.category]||z.أخرى;return e.jsxs("div",{className:"note-row",children:[e.jsx("div",{className:"note-dot",style:{background:n.c}}),e.jsxs("div",{className:"note-body",children:[e.jsxs("div",{className:"note-header",children:[e.jsx("span",{className:"note-subject",children:o.subjectName}),e.jsx("span",{className:"note-badge",style:{background:n.bg,color:n.c},children:o.category})]}),e.jsx("p",{className:"note-preview clamp-2",children:o.preview})]}),e.jsx("span",{className:"note-date",children:S(o.date)})]},o.id)})}):e.jsx("div",{className:"empty-card-sm",children:e.jsx("p",{className:"empty-hint",children:"لا توجد ملاحظات حالياً"})})]}),l&&e.jsxs("div",{className:"ai-entry-card",onClick:()=>r(v.ai),children:[e.jsx("div",{className:"ai-entry-icon",children:"🤖"}),e.jsxs("div",{className:"ai-entry-info",children:[e.jsx("p",{className:"ai-entry-title",children:"التحليل الذكي للأداء"}),e.jsxs("p",{className:"ai-entry-sub",children:[ke[l.academicDirection]||"—",l.riskStatus&&` · متابعة ${(K[l.riskStatus]||{}).label||""}`]})]}),e.jsx("div",{className:"ai-entry-arrow",children:e.jsx(I,{})})]})]})]})}function Me({subjects:a}){const[i,s]=m.useState(0),r=a[i],t=m.useMemo(()=>{if(!r)return 0;const o=r.grades||[],n=o.reduce((d,f)=>d+Number(f.score||0),0),c=o.reduce((d,f)=>d+Number(f.outOf||0),0);return c?n/c*100:0},[r,i]),l=t>=90?{label:"ممتاز",color:"#00C853",bg:"#F0FDF4"}:t>=80?{label:"جيد جداً",color:"#2C7BE5",bg:"#EFF6FF"}:t>=70?{label:"جيد",color:"#FFB300",bg:"#FFFBEB"}:t>=60?{label:"مقبول",color:"#F97316",bg:"#FFF7ED"}:{label:"يحتاج تحسين",color:"#D32F2F",bg:"#FEF2F2"};if(!a.length)return e.jsx("div",{className:"tab-content fade-in-up",children:e.jsx("div",{className:"empty-card",children:e.jsx("p",{className:"empty-title",children:"لا توجد مواد"})})});const p=(r==null?void 0:r.grades)||[];return p.filter(o=>o.type==="exam"||!o.type),p.filter(o=>o.type==="assignment"),p.filter(o=>o.type==="quiz"),e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsxs("div",{className:"tab-page-header",children:[e.jsx("h2",{className:"tab-page-title",children:"الدرجات"}),e.jsx("p",{className:"tab-page-sub",children:"استعرض درجاتك في جميع المواد"})]}),e.jsx("div",{className:"subject-pills-scroll",children:a.map((o,n)=>{const c=k[n%k.length];return e.jsxs("button",{type:"button",onClick:()=>s(n),className:`subject-pill ${i===n?"subject-pill-active":""}`,style:i===n?{background:c,borderColor:c,color:"#fff"}:{},children:[e.jsx("img",{src:o.image,alt:"",className:"subject-pill-img"}),o.name]},o.id)})}),r&&e.jsxs("div",{className:"grades-display fade-in-up",children:[e.jsxs("div",{className:"grade-subject-header",children:[e.jsxs("div",{className:"grade-subject-left",children:[e.jsx("img",{src:r.image,alt:r.name,className:"grade-subject-img"}),e.jsxs("div",{children:[e.jsx("h3",{className:"grade-subject-name",children:r.name}),e.jsx("p",{className:"grade-subject-teacher",children:r.teacher})]})]}),e.jsxs("div",{className:"grade-subject-right",children:[e.jsx("span",{className:"grade-badge",style:{background:l.bg,color:l.color},children:l.label}),e.jsxs("p",{className:"grade-avg",style:{color:k[i%k.length]},children:[E(t,1),"٪"]})]})]}),e.jsx("div",{className:"grade-progress-wrap",children:e.jsx("div",{className:"grade-progress-track",children:e.jsx("div",{className:"grade-progress-fill",style:{width:`${t}%`,background:k[i%k.length]}})})}),p.length===0?e.jsx("div",{className:"empty-card-sm",children:e.jsx("p",{className:"empty-hint",children:"لا توجد درجات مسجلة"})}):e.jsx("div",{className:"grades-table-wrap",children:e.jsxs("table",{className:"grades-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"التقييم"}),e.jsx("th",{children:"الدرجة"}),e.jsx("th",{children:"من أصل"}),e.jsx("th",{children:"النسبة"})]})}),e.jsx("tbody",{children:p.map((o,n)=>{const c=o.outOf?Number(o.score)/Number(o.outOf)*100:0,d=c>=90?"#00C853":c>=70?"#2C7BE5":c>=50?"#FFB300":"#D32F2F";return e.jsxs("tr",{className:"grade-row",children:[e.jsx("td",{className:"grade-cell-name",children:o.name||o.label||`تقييم ${n+1}`}),e.jsx("td",{className:"grade-cell-score",style:{color:d},children:o.score}),e.jsx("td",{className:"grade-cell-out",children:o.outOf}),e.jsx("td",{children:e.jsxs("span",{className:"grade-pct-badge",style:{background:`${d}15`,color:d},children:[E(c,1),"٪"]})})]},n)})})]})})]},r.id)]})}function Oe({token:a}){const[i,s]=m.useState(!0),[r,t]=m.useState(""),[l,p]=m.useState({className:"",entries:[],schoolDays:[1,2,3,4,5]});m.useEffect(()=>{let d=!0;return(async()=>{try{s(!0),t("");const u=await se(a);if(!d)return;p({className:u.className||"",entries:u.entries||[],schoolDays:u.schoolDays||[1,2,3,4,5]})}catch(u){d&&t((u==null?void 0:u.message)||"تعذّر تحميل الجدول الأسبوعي.")}finally{d&&s(!1)}})(),()=>{d=!1}},[a]);const o=m.useMemo(()=>[...new Set((l.entries||[]).map(f=>`${f.startTime}-${f.endTime}`))].sort((f,u)=>String(f).localeCompare(String(u))),[l.entries]),n=m.useMemo(()=>{const d={};return(l.entries||[]).forEach(f=>{d[`${f.dayOfWeek}-${f.startTime}-${f.endTime}`]=f}),d},[l.entries]),c=m.useMemo(()=>{const d={};let f=0;return(l.entries||[]).forEach(u=>{u.subject&&!d[u.subject]&&(d[u.subject]=H[f%H.length],f++)}),d},[l.entries]);return e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsxs("div",{className:"tab-page-header",children:[e.jsx("h2",{className:"tab-page-title",children:"الجدول الأسبوعي"}),l.className&&e.jsxs("p",{className:"tab-page-sub",children:["الصف ",l.className]})]}),r&&e.jsx("div",{className:"error-banner-premium",children:r}),i?e.jsx("div",{className:"sched-skeleton",children:[1,2,3,4].map(d=>e.jsx("div",{className:"skeleton-row"},d))}):l.entries.length?e.jsx("div",{className:"schedule-card",children:e.jsx("div",{className:"schedule-table-wrap",children:e.jsxs("table",{className:"schedule-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"sched-time-col",children:"الوقت"}),l.schoolDays.map(d=>e.jsx("th",{className:"sched-day-col",children:Ee[d]||d},d))]})}),e.jsx("tbody",{children:o.map((d,f)=>{const[u,y]=d.split("-");return e.jsxs("tr",{className:`sched-row ${f%2===0?"":"sched-row-alt"}`,children:[e.jsxs("td",{className:"sched-time",children:[u," – ",y]}),l.schoolDays.map(h=>{const x=n[`${h}-${u}-${y}`],g=x?c[x.subject]||"#2C7BE5":null;return e.jsx("td",{className:"sched-cell",children:x?e.jsxs("div",{className:"sched-entry",style:{borderRightColor:g},children:[e.jsx("p",{className:"sched-entry-subject",children:x.subject}),x.teacherName&&e.jsx("p",{className:"sched-entry-teacher",children:x.teacherName}),x.room&&e.jsx("p",{className:"sched-entry-room",children:x.room})]}):e.jsx("div",{className:"sched-empty-cell"})},`${h}-${d}`)})]},d)})})]})})}):e.jsxs("div",{className:"empty-card",children:[e.jsx("div",{className:"empty-icon",children:"📅"}),e.jsx("p",{className:"empty-title",children:"لم يتم تحديد الجدول بعد"}),e.jsx("p",{className:"empty-hint",children:"سيظهر الجدول هنا عند إعداده من قِبل المدرسة."})]})]})}function J({pct:a=0,color:i="#2C7BE5",size:s=80,stroke:r=6}){const t=(s-r)/2,l=2*Math.PI*t,p=a/100*l;return e.jsxs("svg",{width:s,height:s,style:{transform:"rotate(-90deg)",flexShrink:0},children:[e.jsx("circle",{cx:s/2,cy:s/2,r:t,fill:"none",stroke:"#F1F5F9",strokeWidth:r}),e.jsx("circle",{cx:s/2,cy:s/2,r:t,fill:"none",stroke:i,strokeWidth:r,strokeDasharray:`${p} ${l}`,strokeLinecap:"round",style:{transition:"stroke-dasharray 1.2s cubic-bezier(0.16,1,0.3,1)"}})]})}function Pe({snap:a,subjects:i,portalData:s}){if(!a)return e.jsx("div",{className:"tab-content fade-in-up",children:e.jsxs("div",{className:"empty-card",children:[e.jsx("div",{className:"empty-icon",children:"🤖"}),e.jsx("p",{className:"empty-title",children:"لا توجد بيانات تحليل متاحة"}),e.jsx("p",{className:"empty-hint",children:"يظهر التحليل الذكي بعد اكتمال بيانات الطالب."})]})});const r=K[a.riskStatus]||{label:a.riskStatus||"—",color:"#475569"},t=Ce[a.parentEngagementStatus]||a.parentEngagementStatus||"—",l={active:"#00C853",moderate:"#FFB300",low:"#D32F2F"}[a.parentEngagementStatus]||"#64748B",p={active:88,moderate:55,low:20}[a.parentEngagementStatus]||50,o={low:25,medium:60,high:90}[a.riskStatus]||50,n=(i||[]).map(x=>{const g=x.grades||[],b=g.reduce((F,C)=>F+Number(C.score||0),0),j=g.reduce((F,C)=>F+Number(C.outOf||0),0),N=j?b/j*100:null;return{...x,avg:N}}).filter(x=>x.avg!==null).sort((x,g)=>g.avg-x.avg),c=(i||[]).flatMap(x=>x.grades||[]),d=c.reduce((x,g)=>x+Number(g.score||0),0),f=c.reduce((x,g)=>x+Number(g.outOf||0),0),u=f?d/f*100:0;s!=null&&s.recentFeedback;const y={improving:{label:"في تحسّن ↑",bg:"#F0FDF4",color:"#00C853"},declining:{label:"يحتاج متابعة ↓",bg:"#FEF2F2",color:"#D32F2F"},stable:{label:"مستقر →",bg:"#F8FAFC",color:"#64748B"}},h=y[a.academicDirection]||y.stable;return e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsxs("div",{className:"tab-page-header",children:[e.jsx("h2",{className:"tab-page-title",children:"🤖 التحليل الذكي للأداء"}),e.jsx("p",{className:"tab-page-sub",children:"تقرير مدعوم بالذكاء الاصطناعي"})]}),e.jsxs("div",{className:"ai-kpi-row",children:[e.jsxs("div",{className:"ai-kpi-card",children:[e.jsxs("p",{className:"ai-kpi-value",style:{color:"#2C7BE5"},children:[E(u,1),"٪"]}),e.jsx("p",{className:"ai-kpi-label",children:"المتوسط العام"})]}),e.jsxs("div",{className:"ai-kpi-card",children:[e.jsx("p",{className:"ai-kpi-value",style:{color:h.color},children:h.label}),e.jsx("p",{className:"ai-kpi-label",children:"الاتجاه الأكاديمي"})]}),e.jsxs("div",{className:"ai-kpi-card",children:[e.jsx("p",{className:"ai-kpi-value",style:{color:r.color},children:r.label}),e.jsx("p",{className:"ai-kpi-label",children:"مستوى المتابعة"})]}),e.jsxs("div",{className:"ai-kpi-card",children:[e.jsx("p",{className:"ai-kpi-value",style:{color:l},children:t}),e.jsx("p",{className:"ai-kpi-label",children:"تواصل ولي الأمر"})]})]}),e.jsxs("div",{className:"ai-main-grid",children:[e.jsxs("div",{className:"ai-left-col",children:[n.length>0&&e.jsxs("div",{className:"ai-block",children:[e.jsx("h3",{className:"ai-block-title",children:"📊 الأداء حسب المادة"}),e.jsx("div",{className:"ai-bars-list",children:n.map((x,g)=>{const b=k[g%k.length],j=x.avg??0,N=j>=90?"ممتاز":j>=80?"جيد جداً":j>=70?"جيد":j>=60?"مقبول":"يحتاج تحسين";return e.jsxs("div",{className:"ai-bar-row",children:[e.jsx("img",{src:x.image,alt:x.name,className:"ai-bar-img"}),e.jsxs("div",{className:"ai-bar-info",children:[e.jsxs("div",{className:"ai-bar-header",children:[e.jsx("span",{className:"ai-bar-name",children:x.name}),e.jsxs("div",{className:"ai-bar-meta",children:[e.jsx("span",{className:"ai-bar-badge",style:{background:`${b}18`,color:b},children:N}),e.jsxs("span",{className:"ai-bar-pct",style:{color:b},children:[E(j,1),"٪"]})]})]}),e.jsx("div",{className:"ai-bar-track",children:e.jsx("div",{className:"ai-bar-fill grade-fill",style:{width:`${j}%`,background:b}})})]})]},x.id)})})]}),a.attendancePattern&&e.jsxs("div",{className:"ai-block",style:{borderTop:"2px solid #2C7BE5"},children:[e.jsx("h3",{className:"ai-block-title",children:"📅 الحضور والغياب"}),e.jsx("p",{className:"ai-block-text",children:a.attendancePattern})]})]}),e.jsxs("div",{className:"ai-right-col",children:[e.jsxs("div",{className:"ai-block",children:[e.jsx("h3",{className:"ai-block-title",children:"📡 مؤشرات المتابعة"}),e.jsxs("div",{className:"ai-gauges",children:[e.jsxs("div",{className:"ai-gauge-row",children:[e.jsx(J,{pct:o,color:r.color,size:72,stroke:6}),e.jsxs("div",{children:[e.jsx("p",{className:"ai-gauge-label",children:"مستوى المتابعة المطلوب"}),e.jsx("p",{className:"ai-gauge-value",style:{color:r.color},children:r.label})]})]}),e.jsx("div",{className:"ai-gauge-divider"}),e.jsxs("div",{className:"ai-gauge-row",children:[e.jsx(J,{pct:p,color:l,size:72,stroke:6}),e.jsxs("div",{children:[e.jsx("p",{className:"ai-gauge-label",children:"تواصل ولي الأمر"}),e.jsx("p",{className:"ai-gauge-value",style:{color:l},children:t})]})]})]})]}),n.length>0&&e.jsxs("div",{className:"ai-block",children:[e.jsx("h3",{className:"ai-block-title",children:"🏆 أفضل المواد أداءً"}),e.jsx("div",{className:"ai-top-subjects",children:n.slice(0,4).map((x,g)=>{const b=["🥇","🥈","🥉","🎖"];return e.jsxs("div",{className:"ai-top-row",children:[e.jsx("span",{className:"ai-top-medal",children:b[g]||"•"}),e.jsx("span",{className:"ai-top-name",children:x.name}),e.jsxs("span",{className:"ai-top-pct",style:{color:k[g%k.length]},children:[E(x.avg,1),"٪"]})]},x.id)})})]})]})]})]})}function Ge({feedback:a}){const[i,s]=m.useState({}),r=t=>s(l=>({...l,[t]:!l[t]}));return e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsxs("div",{className:"tab-page-header",children:[e.jsx("h2",{className:"tab-page-title",children:"الملاحظات"}),e.jsx("span",{className:"tab-count-badge",children:a.length})]}),a.length?e.jsx("div",{className:"notes-grid",children:a.map(t=>{const l=z[t.category]||z.أخرى,p=i[t.id],o=(t.preview||"").length>120;return e.jsxs("div",{className:"note-card",children:[e.jsxs("div",{className:"note-card-header",children:[e.jsxs("div",{children:[e.jsx("p",{className:"note-card-subject",children:t.subjectName}),e.jsx("p",{className:"note-card-date",children:S(t.date)})]}),e.jsx("span",{className:"note-card-badge",style:{background:l.bg,color:l.c},children:t.category})]}),e.jsx("p",{className:`note-card-text ${p||!o?"":"clamp-3"}`,children:t.preview}),o&&e.jsx("button",{type:"button",className:"note-expand-btn",onClick:()=>r(t.id),children:p?"إخفاء":"قراءة المزيد"})]},t.id)})}):e.jsxs("div",{className:"empty-card",children:[e.jsx("div",{className:"empty-icon",children:"📝"}),e.jsx("p",{className:"empty-title",children:"لا توجد ملاحظات"}),e.jsx("p",{className:"empty-hint",children:"ستظهر ملاحظات المعلمين هنا."})]})]})}function Ye({portalData:a,subjects:i,user:s,avatarUrl:r,studentName:t,className:l,onTabChange:p}){const o=i.flatMap(u=>u.grades||[]),n=o.reduce((u,y)=>u+Number(y.score||0),0),c=o.reduce((u,y)=>u+Number(y.outOf||0),0),d=c?n/c*100:0,f=(a==null?void 0:a.recentFeedback)||[];return e.jsxs("div",{className:"tab-content fade-in-up",children:[e.jsx("div",{className:"tab-page-header",children:e.jsx("h2",{className:"tab-page-title",children:"ملفي الشخصي"})}),e.jsxs("div",{className:"profile-layout",children:[e.jsxs("div",{className:"profile-card",children:[e.jsx("div",{className:"profile-avatar-wrap",children:r?e.jsx("img",{src:r,alt:t,className:"profile-avatar"}):e.jsx("div",{className:"profile-avatar-placeholder",children:(t==null?void 0:t[0])||"ط"})}),e.jsx("h3",{className:"profile-name",children:t}),l&&e.jsxs("p",{className:"profile-class",children:["الصف ",l]}),(s==null?void 0:s.email)&&e.jsx("p",{className:"profile-email",children:s.email})]}),e.jsxs("div",{className:"profile-stats-col",children:[e.jsxs("div",{className:"profile-stat-card",children:[e.jsx("span",{className:"profile-stat-icon",children:"📊"}),e.jsxs("div",{children:[e.jsxs("p",{className:"profile-stat-value",style:{color:"#2C7BE5"},children:[E(d,1),"٪"]}),e.jsx("p",{className:"profile-stat-label",children:"المتوسط الأكاديمي"})]})]}),e.jsxs("div",{className:"profile-stat-card",children:[e.jsx("span",{className:"profile-stat-icon",children:"📚"}),e.jsxs("div",{children:[e.jsx("p",{className:"profile-stat-value",style:{color:"#8B5CF6"},children:i.length}),e.jsx("p",{className:"profile-stat-label",children:"المواد الدراسية"})]})]}),e.jsxs("div",{className:"profile-stat-card",children:[e.jsx("span",{className:"profile-stat-icon",children:"📝"}),e.jsxs("div",{children:[e.jsx("p",{className:"profile-stat-value",style:{color:"#F97316"},children:f.length}),e.jsx("p",{className:"profile-stat-label",children:"الملاحظات"})]})]}),e.jsxs("button",{type:"button",className:"profile-ai-btn",onClick:()=>p(v.ai),children:[e.jsx("span",{children:"🤖"}),e.jsx("span",{children:"عرض التحليل الذكي"}),e.jsx(I,{})]})]})]})]})}function qe(){var M,O,P,G;const a=Q(),{token:i,user:s,logout:r}=ee(),[t,l]=m.useState(!0),[p,o]=m.useState(""),[n,c]=m.useState(null),[d,f]=m.useState(v.dashboard),[u,y]=m.useState(null);m.useEffect(()=>{let w=!0;return i?(async()=>{try{l(!0),o("");const B=await ae(i);if(!w)return;c({...B,subjects:Be((B.subjects||[]).map(A=>({...A,image:we(A.name),feedbackItems:(A.feedbackItems||[]).map(Y=>({...Y,category:X(Y.category)}))}))),recentFeedback:(B.recentFeedback||[]).map(A=>({...A,category:X(A.category)}))})}catch(B){w&&(o((B==null?void 0:B.message)||"تعذّر تحميل البوابة."),c(null))}finally{w&&l(!1)}})():l(!1),()=>{w=!1}},[i]);const h=(n==null?void 0:n.subjects)||[],x=m.useMemo(()=>u&&h.find(w=>w.id===u)||null,[u,h]),g=()=>{r(),a("/login",{replace:!0})},b=w=>{y(w)},j=()=>{y(null)},N=((M=n==null?void 0:n.student)==null?void 0:M.name)||(s==null?void 0:s.name)||"الطالب",F=((O=n==null?void 0:n.student)==null?void 0:O.className)||((P=s==null?void 0:s.classes)==null?void 0:P[0])||"",C=((G=n==null?void 0:n.student)==null?void 0:G.avatarUrl)||(s==null?void 0:s.profilePicture)||"",V=((n==null?void 0:n.recentFeedback)||[]).length;if(x)return e.jsx(ge,{subject:x,allSubjects:h,subjectDetails:{},recentFeedback:(n==null?void 0:n.recentFeedback)||[],onBack:j,onSwitch:w=>y(w)});const R=w=>{f(w),window.scrollTo({top:0,behavior:"smooth"})};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:_e}),e.jsxs("main",{dir:"rtl",className:"portal-root",children:[e.jsx(Te,{studentName:N,avatarUrl:C,notifCount:V,onLogout:g}),e.jsxs("div",{className:"portal-content",children:[e.jsx(Re,{studentName:N,className:F,avatarUrl:C}),e.jsx(De,{activeTab:d,onTabChange:R}),p&&e.jsx("div",{className:"error-banner-premium",children:p}),t?e.jsxs("div",{className:"loading-grid",children:[e.jsx("div",{className:"loading-bar",style:{height:88}}),e.jsx("div",{className:"loading-row",children:[1,2,3,4].map(w=>e.jsx("div",{className:"skeleton-card"},w))}),e.jsx("div",{className:"loading-bar",style:{height:240}})]}):e.jsxs(e.Fragment,{children:[d===v.dashboard&&e.jsx($e,{portalData:n,subjects:h,onSelectSubject:b,onTabChange:R}),d===v.grades&&e.jsx(Me,{subjects:h}),d===v.schedule&&e.jsx(Oe,{token:i}),d===v.ai&&e.jsx(Pe,{snap:n==null?void 0:n.weeklySnapshot,subjects:h,portalData:n}),d===v.notes&&e.jsx(Ge,{feedback:(n==null?void 0:n.recentFeedback)||[]}),d===v.profile&&e.jsx(Ye,{portalData:n,subjects:h,user:s,avatarUrl:C,studentName:N,className:F,onTabChange:R})]})]})]})]})}const _e=`
/* ── Root ── */
.portal-root {
  min-height: 100dvh;
  background: #F5F6FA;
  font-family: 'Cairo', sans-serif;
}

/* ── Top Nav — slim identity bar only ── */
.premium-topnav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E8ECF4;
  box-shadow: 0 1px 8px rgba(15,23,42,0.05);
}
.premium-topnav-inner {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 32px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.nav-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #E8ECF4;
}
.nav-avatar-placeholder {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #EFF6FF;
  border: 2px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; color: #2C7BE5;
}
.nav-student-name { font-size: 13px; font-weight: 700; color: #0F172A; }
.nav-actions { display: flex; align-items: center; gap: 6px; }
.nav-action-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  border: 1px solid #E8ECF4; border-radius: 8px;
  background: #F8FAFC; cursor: pointer;
  font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 600; color: #475569;
  transition: all 180ms ease;
}
.nav-action-btn:hover { background: #EFF6FF; border-color: #BFDBFE; color: #2C7BE5; transform: translateY(-1px); }
.nav-badge {
  position: absolute; top: -4px; left: -4px;
  min-width: 16px; height: 16px;
  background: #D32F2F; color: #fff;
  font-size: 9px; font-weight: 700; border-radius: 999px;
  display: flex; align-items: center; justify-content: center; padding: 0 3px;
}
.nav-logout { color: #D32F2F; }
.nav-logout:hover { background: #FEF2F2 !important; border-color: #FECACA !important; color: #D32F2F !important; }
.nav-logout-label { font-size: 13px; }

/* ── Tab Bar — below welcome card ── */
.tabbar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 6px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  gap: 4px;
}
.tabbar-inner {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.tabbar-inner::-webkit-scrollbar { display: none; }
.tabbar-tab {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px;
  border: none; background: none; cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 14px; font-weight: 600;
  color: #64748B;
  border-radius: 11px;
  transition: color 200ms ease, background 200ms ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.tabbar-tab:hover { color: #0F172A; background: #F8FAFC; }
.tabbar-tab-active {
  color: #2C7BE5 !important;
  background: #EFF6FF !important;
  font-weight: 700;
}
.tabbar-icon { font-size: 16px; }
.tabbar-underline {
  position: absolute;
  bottom: 4px; left: 12px; right: 12px;
  height: 2px;
  background: #2C7BE5;
  border-radius: 2px;
  animation: slideIn 220ms cubic-bezier(0.16,1,0.3,1);
}
@keyframes slideIn {
  from { transform: scaleX(0); opacity: 0; }
  to   { transform: scaleX(1); opacity: 1; }
}
/* Scroll arrows inside tabbar */
.tabbar-scroll-arrow {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #E8ECF4;
  background: #F8FAFC;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: all 180ms ease;
  animation: fadeUp 200ms ease;
}
.tabbar-scroll-arrow:hover {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #2C7BE5;
}

/* ── Summary Cards (2-card row) ── */
.summary-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}
@media (max-width: 600px) { .summary-cards-row { grid-template-columns: 1fr; } }
.summary-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
  animation: fadeUp 350ms ease both;
  text-align: right;
}
.summary-card-clickable {
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
  font-family: 'Cairo', sans-serif;
  width: 100%;
}
.summary-card-clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15,23,42,0.09);
  border-color: #F97316;
}
.summary-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.summary-card-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
}
.summary-card-title {
  font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 2px;
}
.summary-card-sub {
  font-size: 12px; color: #64748B; margin: 0;
}
.summary-progress-track {
  height: 7px;
  background: #F1F5F9;
  border-radius: 999px;
  overflow: hidden;
}
.summary-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 900ms cubic-bezier(0.16,1,0.3,1);
}
.summary-feedback-preview {
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  border-radius: 10px;
  padding: 10px 12px;
}
.summary-feedback-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.summary-feedback-subject { font-size: 12px; font-weight: 700; color: #0F172A; }
.summary-feedback-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 999px;
}
.summary-feedback-date { font-size: 11px; color: #94A3B8; margin-right: auto; }
.summary-feedback-text { font-size: 12px; color: #64748B; line-height: 1.6; margin: 0; }
.summary-empty-hint { font-size: 13px; color: #94A3B8; margin: 0; text-align: center; padding: 8px 0; }
.portal-content {
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px 32px 48px;
}

/* ── Welcome Card ── */
.welcome-card {
  position: relative;
  background: linear-gradient(135deg, #1E3A8A 0%, #2C7BE5 60%, #38BDF8 100%);
  border-radius: 20px;
  padding: 32px 36px;
  margin-bottom: 28px;
  overflow: hidden;
}
.welcome-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 60%);
  pointer-events: none;
}
.welcome-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.07);
  pointer-events: none;
}
.welcome-card::after {
  content: '';
  position: absolute;
  bottom: -60px; left: -20px;
  width: 160px; height: 160px;
  border-radius: 50%;
  background: rgba(255,255,255,0.05);
  pointer-events: none;
}
.welcome-card-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.welcome-greeting {
  font-size: 14px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 4px;
}
.welcome-name {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 4px;
}
.welcome-class {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 8px;
}
.welcome-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin: 0;
}
.welcome-avatar-wrap {
  flex-shrink: 0;
}
.welcome-avatar {
  width: 72px; height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,0.4);
}
.welcome-avatar-placeholder {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 3px solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 800; color: #fff;
}

/* ── Section Block ── */
.section-block {
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.section-title-premium {
  font-size: 18px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}
.section-subtitle-premium {
  font-size: 12px;
  color: #94A3B8;
  margin: 0;
}
.section-title-sm {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  margin: 0;
}
.view-all-btn {
  border: none;
  background: none;
  font-family: 'Cairo', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #2C7BE5;
  cursor: pointer;
  padding: 0;
}
.view-all-btn:hover { opacity: 0.7; }

/* ── Subject Carousel ── */
.carousel-wrapper {
  position: relative;
  padding: 0 44px;
}
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-60%); /* offset for padding-top on track */
  z-index: 3;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid #E8ECF4;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 200ms ease;
  box-shadow: 0 2px 8px rgba(15,23,42,0.08);
  opacity: 0;
}
.carousel-wrapper:hover .carousel-arrow { opacity: 1; }
.carousel-arrow:hover {
  background: #2C7BE5;
  color: #fff;
  border-color: #2C7BE5;
  transform: translateY(-60%) scale(1.05);
}
.carousel-arrow-start { right: 0; }
.carousel-arrow-end { left: 0; }
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: visible; /* CRITICAL: allow cards to lift without clipping */
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-top: 10px;   /* room for hover lift */
  padding-bottom: 12px;
  cursor: grab;
  user-select: none;
}
.carousel-track:active { cursor: grabbing; }
.carousel-track::-webkit-scrollbar { display: none; }
.carousel-card {
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  text-align: right;
  position: relative;
  transition: transform 240ms cubic-bezier(0.16,1,0.3,1), box-shadow 240ms ease, border-color 240ms ease;
  box-shadow: 0 2px 10px rgba(15,23,42,0.05);
}
.carousel-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 36px rgba(15,23,42,0.13);
  border-color: var(--accent);
}
.carousel-card:active { transform: scale(0.97); }
.carousel-card-accent-bar { height: 3px; width: 100%; }
.carousel-card-img-zone {
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px;
  background: #F8FAFC;
}
.carousel-card-img {
  width: 72px; height: 72px;
  object-fit: contain;
  transition: transform 240ms ease;
  pointer-events: none;
}
.carousel-card:hover .carousel-card-img { transform: scale(1.08); }
.carousel-card-info { padding: 12px 14px 14px; border-top: 1px solid #F1F5F9; }
.carousel-card-name {
  font-size: 13px; font-weight: 700; color: #0F172A;
  margin: 0 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.carousel-card-teacher {
  font-size: 11px; color: #94A3B8;
  margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.carousel-card-cta { font-size: 11px; font-weight: 700; margin: 0; }
.carousel-card-hover-glow {
  position: absolute; inset: 0; border-radius: 16px; opacity: 0;
  transition: opacity 240ms ease;
  box-shadow: inset 0 0 0 2px var(--accent);
  pointer-events: none;
}
.carousel-card:hover .carousel-card-hover-glow { opacity: 1; }

/* ── Dashboard Bottom Grid ── */
.dashboard-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0,2fr) minmax(0,1fr);
  gap: 24px;
  align-items: start;
}
@media (max-width: 800px) { .dashboard-bottom-grid { grid-template-columns: 1fr; } }

/* ── Notes preview list ── */
.notes-list { display: flex; flex-direction: column; gap: 8px; }
.note-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 12px;
  padding: 12px 14px;
  transition: box-shadow 200ms ease;
}
.note-row:hover { box-shadow: 0 4px 16px rgba(15,23,42,0.07); }
.note-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.note-body { flex: 1; min-width: 0; }
.note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.note-subject { font-size: 13px; font-weight: 700; color: #0F172A; }
.note-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
.note-preview { font-size: 12px; color: #64748B; margin: 0; line-height: 1.6; }
.note-date { font-size: 11px; color: #94A3B8; flex-shrink: 0; }

/* ── AI Entry Card ── */
.ai-entry-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-right: 3px solid #2C7BE5;
  border-radius: 16px;
  padding: 18px 20px;
  cursor: pointer;
  transition: all 220ms ease;
}
.ai-entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(44,123,229,0.12);
  border-right-color: #2C7BE5;
}
.ai-entry-icon {
  width: 40px; height: 40px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.ai-entry-info { flex: 1; min-width: 0; }
.ai-entry-title { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0 0 3px; }
.ai-entry-sub { font-size: 12px; color: #64748B; margin: 0; }
.ai-entry-arrow { color: #94A3B8; }

/* ── Tab Content ── */
.tab-content { animation: fadeUp 300ms ease-out both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-in-up { animation: fadeUp 280ms ease-out both; }

/* ── Tab Page Header ── */
.tab-page-header {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.tab-page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0F172A;
  margin: 0;
}
.tab-page-sub { font-size: 13px; color: #94A3B8; margin: 0; }
.tab-count-badge {
  font-size: 12px;
  font-weight: 700;
  background: #EFF6FF;
  color: #2C7BE5;
  border: 1px solid #BFDBFE;
  padding: 2px 10px;
  border-radius: 999px;
}

/* ── Subject Pills ── */
.subject-pills-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
  margin-bottom: 24px;
}
.subject-pills-scroll::-webkit-scrollbar { display: none; }
.subject-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border: 1.5px solid #E8ECF4;
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  transition: all 220ms ease;
}
.subject-pill:hover { border-color: #BFDBFE; color: #0F172A; }
.subject-pill-active { box-shadow: 0 4px 12px rgba(44,123,229,0.2); }
.subject-pill-img { width: 20px; height: 20px; object-fit: contain; }

/* ── Grades Display ── */
.grades-display {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(15,23,42,0.06);
}
.grade-subject-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 20px;
  border-bottom: 1px solid #F1F5F9;
  flex-wrap: wrap;
}
.grade-subject-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.grade-subject-img { width: 48px; height: 48px; object-fit: contain; }
.grade-subject-name { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 3px; }
.grade-subject-teacher { font-size: 13px; color: #64748B; margin: 0; }
.grade-subject-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.grade-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.grade-avg { font-size: 28px; font-weight: 800; margin: 0; }
.grade-progress-wrap { padding: 0 24px 16px; }
.grade-progress-track {
  height: 8px;
  background: #F1F5F9;
  border-radius: 999px;
  overflow: hidden;
}
.grade-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 900ms cubic-bezier(0.16,1,0.3,1);
}

/* ── Grades Table ── */
.grades-table-wrap { padding: 0 24px 24px; overflow-x: auto; }
.grades-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.grades-table th {
  text-align: right;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #F1F5F9;
}
.grade-row { transition: background 150ms ease; }
.grade-row:hover { background: #F8FAFC; }
.grade-row td { padding: 11px 12px; border-bottom: 1px solid #F8FAFC; }
.grade-row:last-child td { border-bottom: none; }
.grade-cell-name { font-weight: 600; color: #0F172A; }
.grade-cell-score { font-weight: 700; font-size: 15px; }
.grade-cell-out { color: #64748B; }
.grade-pct-badge {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

/* ── Schedule ── */
.schedule-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(15,23,42,0.06);
}
.schedule-table-wrap { overflow-x: auto; }
.schedule-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  text-align: right;
}
.schedule-table thead { background: #F8FAFC; border-bottom: 1px solid #E8ECF4; }
.sched-time-col { padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; width: 100px; }
.sched-day-col { padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0F172A; }
.sched-row { border-bottom: 1px solid #F1F5F9; }
.sched-row:last-child { border-bottom: none; }
.sched-row-alt { background: #FAFBFC; }
.sched-time { padding: 10px 16px; font-size: 12px; font-weight: 700; color: #64748B; white-space: nowrap; }
.sched-cell { padding: 6px 8px; }
.sched-entry {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-right-width: 3px;
  border-radius: 10px;
  padding: 8px 10px;
  transition: box-shadow 180ms ease;
}
.sched-entry:hover { box-shadow: 0 3px 12px rgba(15,23,42,0.07); }
.sched-entry-subject { font-size: 13px; font-weight: 700; color: #0F172A; margin: 0 0 2px; }
.sched-entry-teacher { font-size: 11px; color: #64748B; margin: 0; }
.sched-entry-room { font-size: 11px; color: #94A3B8; margin: 0; }
.sched-empty-cell { background: #F8FAFC; border: 1px dashed #E8ECF4; border-radius: 10px; height: 56px; }
.sched-skeleton { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 56px; background: #E8ECF4; border-radius: 10px; animation: shimmer 1.2s ease-out infinite; background-size: 200% 100%; background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%); }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

/* ── AI Tab ── */
.ai-kpi-row {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 14px;
  margin-bottom: 24px;
}
@media (max-width: 900px) { .ai-kpi-row { grid-template-columns: repeat(2,1fr); } }
.ai-kpi-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 18px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.ai-kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
.ai-kpi-value { font-size: 20px; font-weight: 800; margin: 0 0 4px; }
.ai-kpi-label { font-size: 12px; color: #64748B; margin: 0; }
.ai-main-grid {
  display: grid;
  grid-template-columns: minmax(0,2fr) minmax(0,1fr);
  gap: 20px;
  align-items: start;
}
@media (max-width: 900px) { .ai-main-grid { grid-template-columns: 1fr; } }
.ai-left-col, .ai-right-col { display: flex; flex-direction: column; gap: 16px; }
.ai-block {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 20px;
}
.ai-block-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 16px; }
.ai-block-text { font-size: 14px; color: #475569; line-height: 1.7; margin: 0; }
.ai-bars-list { display: flex; flex-direction: column; gap: 14px; }
.ai-bar-row { display: flex; align-items: center; gap: 12px; }
.ai-bar-img { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
.ai-bar-info { flex: 1; min-width: 0; }
.ai-bar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.ai-bar-name { font-size: 13px; font-weight: 600; color: #0F172A; }
.ai-bar-meta { display: flex; align-items: center; gap: 8px; }
.ai-bar-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; }
.ai-bar-pct { font-size: 13px; font-weight: 800; }
.ai-bar-track { height: 7px; border-radius: 999px; overflow: hidden; background: #F1F5F9; }
.ai-bar-fill { height: 100%; border-radius: 999px; }
.ai-gauges { display: flex; flex-direction: column; gap: 16px; }
.ai-gauge-row { display: flex; align-items: center; gap: 14px; }
.ai-gauge-divider { height: 1px; background: #F1F5F9; }
.ai-gauge-label { font-size: 11px; color: #94A3B8; margin: 0 0 4px; }
.ai-gauge-value { font-size: 16px; font-weight: 700; margin: 0; }
.ai-top-subjects { display: flex; flex-direction: column; gap: 10px; }
.ai-top-row { display: flex; align-items: center; gap: 10px; }
.ai-top-medal { font-size: 16px; flex-shrink: 0; }
.ai-top-name { flex: 1; font-size: 13px; font-weight: 600; color: #0F172A; }
.ai-top-pct { font-size: 13px; font-weight: 800; }

/* ── Notes Tab ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
  gap: 14px;
}
.note-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 16px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.note-card:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(15,23,42,0.08); }
.note-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.note-card-subject { font-size: 14px; font-weight: 700; color: #0F172A; margin: 0; }
.note-card-date { font-size: 11px; color: #94A3B8; margin: 2px 0 0; }
.note-card-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px; flex-shrink: 0; }
.note-card-text { font-size: 13px; color: #475569; line-height: 1.7; margin: 0; }
.note-expand-btn {
  margin-top: 8px;
  border: none; background: none;
  font-family: 'Cairo', sans-serif;
  font-size: 12px; font-weight: 700;
  color: #2C7BE5; cursor: pointer; padding: 0;
}
.note-expand-btn:hover { opacity: 0.7; }

/* ── Profile Tab ── */
.profile-layout {
  display: grid;
  grid-template-columns: 240px minmax(0,1fr);
  gap: 24px;
  align-items: start;
}
@media (max-width: 700px) { .profile-layout { grid-template-columns: 1fr; } }
.profile-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 20px;
  padding: 28px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(15,23,42,0.05);
}
.profile-avatar-wrap { margin-bottom: 14px; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #BFDBFE; }
.profile-avatar-placeholder {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: #EFF6FF;
  border: 3px solid #BFDBFE;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 800; color: #2C7BE5;
  margin: 0 auto;
}
.profile-name { font-size: 17px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
.profile-class { font-size: 13px; color: #64748B; margin: 0 0 4px; }
.profile-email { font-size: 12px; color: #94A3B8; margin: 0; }
.profile-stats-col { display: flex; flex-direction: column; gap: 12px; }
.profile-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 14px;
  padding: 16px 18px;
  transition: transform 200ms ease;
}
.profile-stat-card:hover { transform: translateY(-2px); }
.profile-stat-icon { font-size: 22px; }
.profile-stat-value { font-size: 22px; font-weight: 800; margin: 0 0 2px; }
.profile-stat-label { font-size: 12px; color: #64748B; margin: 0; }
.profile-ai-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #EFF6FF;
  border: 1.5px solid #BFDBFE;
  border-radius: 14px;
  padding: 16px 18px;
  cursor: pointer;
  font-family: 'Cairo', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #2C7BE5;
  transition: all 200ms ease;
  text-align: right;
}
.profile-ai-btn:hover {
  background: #DBEAFE;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(44,123,229,0.15);
}
.profile-ai-btn > *:last-child { margin-right: auto; }

/* ── Empty + Error states ── */
.empty-card {
  background: #fff;
  border: 1px solid #E8ECF4;
  border-radius: 16px;
  padding: 60px 24px;
  text-align: center;
}
.empty-card-sm {
  background: #F8FAFC;
  border: 1px dashed #E8ECF4;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}
.empty-icon { font-size: 36px; margin-bottom: 12px; }
.empty-title { font-size: 15px; font-weight: 700; color: #0F172A; margin: 0 0 6px; }
.empty-hint { font-size: 13px; color: #94A3B8; margin: 0; }
.error-banner-premium {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: #D32F2F;
  margin-bottom: 20px;
}

/* ── Loading skeletons ── */
.loading-grid { display: flex; flex-direction: column; gap: 16px; }
.loading-bar {
  background: #E8ECF4;
  border-radius: 16px;
  animation: shimmer 1.2s ease-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%);
}
.loading-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.skeleton-card {
  height: 88px;
  background: #E8ECF4;
  border-radius: 14px;
  animation: shimmer 1.2s ease-out infinite;
  background-size: 200% 100%;
  background-image: linear-gradient(90deg, #E8ECF4 0%, #F1F5F9 50%, #E8ECF4 100%);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .premium-topnav-inner { padding: 0 20px; gap: 16px; }
  .portal-content { padding: 20px 20px 40px; }
  .welcome-card { padding: 24px 24px; }
}
@media (max-width: 700px) {
  .nav-student-info { display: none; }
  .nav-logout-label { display: none; }
  .welcome-name { font-size: 22px; }
  .welcome-avatar { width: 56px; height: 56px; }
  .welcome-avatar-placeholder { width: 56px; height: 56px; font-size: 22px; }
}
`;export{qe as default};
