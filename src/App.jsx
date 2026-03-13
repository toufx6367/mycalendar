import { useState, useRef, useEffect } from "react";

// ── Colors ────────────────────────────────────────────────────────
const CAL_COLORS = {
  "研究室":    { bg:"#6366F1", pill:"#EEF2FF", text:"#4F46E5" },
  "バイト":    { bg:"#F59E0B", pill:"#FFFBEB", text:"#B45309" },
  "学校":      { bg:"#10B981", pill:"#ECFDF5", text:"#047857" },
  "お出かけ":  { bg:"#EC4899", pill:"#FDF2F8", text:"#BE185D" },
  "日本の祝日":{ bg:"#EF4444", pill:"#FEF2F2", text:"#DC2626" },
  "その他":    { bg:"#94A3B8", pill:"#F8FAFC", text:"#64748B" },
};
const color = n => CAL_COLORS[n] || CAL_COLORS["その他"];

// ── Helpers ───────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,"0");
function toYMD(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function fmtTime(s){ return new Date(s).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}); }
function fmtDur(s,e){
  const m=Math.round((new Date(e)-new Date(s))/60000);
  return m<60?`${m}分`:(m%60?`${Math.floor(m/60)}時間${m%60}分`:`${Math.floor(m/60)}時間`);
}
function uid(){ return "id_"+Math.random().toString(36).slice(2); }

const DAY  = ["日","月","火","水","木","金","土"];
const MON  = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const CALS = ["研究室","バイト","学校","お出かけ","その他"];

// ── Storage helpers ───────────────────────────────────────────────
const STORAGE_KEY_EVENTS = "mycal_events";
const STORAGE_KEY_IDEAS  = "mycal_ideas";

function loadEvents() {
  try {
    const s = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (s) return JSON.parse(s);
  } catch(e) {}
  return INIT_EVENTS;
}
function saveEvents(evs) {
  try { localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(evs)); } catch(e) {}
}
function loadIdeas() {
  try {
    const s = localStorage.getItem(STORAGE_KEY_IDEAS);
    if (s) return JSON.parse(s);
  } catch(e) {}
  return INIT_IDEAS;
}
function saveIdeas(ideas) {
  try { localStorage.setItem(STORAGE_KEY_IDEAS, JSON.stringify(ideas)); } catch(e) {}
}

// ── Initial Data ──────────────────────────────────────────────────
const TODAY_DATE = new Date();

const INIT_EVENTS = [
  {event_id:"e1", calendar_name:"研究室", all_day:false, start_time:"2026-03-13T09:30:00+0900", end_time:"2026-03-13T10:30:00+0900", title:"研究室打ち合わせ", location:"", memo:"", done:false},
  {event_id:"e2", calendar_name:"研究室", all_day:false, start_time:"2026-03-13T11:00:00+0900", end_time:"2026-03-13T12:00:00+0900", title:"ぱいざと面談", location:"", memo:"", done:false},
  {event_id:"e3", calendar_name:"研究室", all_day:false, start_time:"2026-03-13T13:00:00+0900", end_time:"2026-03-13T14:00:00+0900", title:"ジョーカツ面談", location:"", memo:"", done:false},
  {event_id:"e4", calendar_name:"研究室", all_day:false, start_time:"2026-03-13T14:00:00+0900", end_time:"2026-03-13T15:00:00+0900", title:"14拓郎と面談", location:"", memo:"", done:false},
  {event_id:"e5", calendar_name:"研究室", all_day:false, start_time:"2026-03-13T16:30:00+0900", end_time:"2026-03-13T17:30:00+0900", title:"め。面接について", location:"", memo:"", done:false},
  {event_id:"e6", calendar_name:"研究室", all_day:false, start_time:"2026-03-17T11:30:00+0900", end_time:"2026-03-17T12:00:00+0900", title:"パイザ", location:"", memo:"", done:false},
  {event_id:"e7", calendar_name:"研究室", all_day:false, start_time:"2026-03-17T15:30:00+0900", end_time:"2026-03-17T16:30:00+0900", title:"長井さん自己PR", location:"", memo:"", done:false},
  {event_id:"e8", calendar_name:"研究室", all_day:false, start_time:"2026-03-17T18:00:00+0900", end_time:"2026-03-17T19:15:00+0900", title:"freee説明会", location:"", memo:"", done:false},
  {event_id:"e9", calendar_name:"研究室", all_day:false, start_time:"2026-03-19T12:00:00+0900", end_time:"2026-03-19T13:00:00+0900", title:"メタチーム", location:"", memo:"", done:false},
  {event_id:"e10",calendar_name:"研究室", all_day:false, start_time:"2026-03-19T13:30:00+0900", end_time:"2026-03-19T14:30:00+0900", title:"ツナグバ面談", location:"", memo:"", done:false},
  {event_id:"e11",calendar_name:"研究室", all_day:false, start_time:"2026-03-20T13:00:00+0900", end_time:"2026-03-20T14:00:00+0900", title:"Reframe面談", location:"", memo:"", done:false},
  {event_id:"e12",calendar_name:"バイト", all_day:false, start_time:"2026-03-14T12:00:00+0900", end_time:"2026-03-14T17:00:00+0900", title:"プレカル", location:"", memo:"", done:false},
  {event_id:"e13",calendar_name:"バイト", all_day:false, start_time:"2026-03-14T19:00:00+0900", end_time:"2026-03-14T22:00:00+0900", title:"19アサイー", location:"", memo:"", done:false},
  {event_id:"e14",calendar_name:"バイト", all_day:false, start_time:"2026-03-15T18:00:00+0900", end_time:"2026-03-15T22:00:00+0900", title:"18アサイー", location:"", memo:"", done:false},
  {event_id:"e15",calendar_name:"学校",  all_day:false, start_time:"2026-03-13T12:30:00+0900", end_time:"2026-03-13T13:30:00+0900", title:"ツナグバ", location:"", memo:"", done:false},
  {event_id:"e16",calendar_name:"学校",  all_day:false, start_time:"2026-03-19T22:00:00+0900", end_time:"2026-03-19T23:00:00+0900", title:"社長とご飯！", location:"", memo:"", done:false},
  {event_id:"e20",calendar_name:"お出かけ",all_day:true, start_time:"2026-03-15",end_time:"2026-03-15",title:"フィントケイイベント",location:"",memo:"",done:false},
  {event_id:"e21",calendar_name:"お出かけ",all_day:false,start_time:"2026-03-17T17:00:00+0900",end_time:"2026-03-17T18:00:00+0900",title:"ゆうりくんと夜ご飯！",location:"",memo:"",done:false},
  {event_id:"e22",calendar_name:"お出かけ",all_day:false,start_time:"2026-03-26T17:30:00+0900",end_time:"2026-03-26T18:30:00+0900",title:"社長とご飯",location:"",memo:"",done:false},
  {event_id:"e23",calendar_name:"日本の祝日",all_day:true,start_time:"2026-03-20",end_time:"2026-03-20",title:"春分の日",location:"",memo:"",done:false},
];

const INIT_IDEAS = [
  { id:"i0", text:"Claudeでカレンダーアプリを自動更新する仕組みを作る", tag:"🛠️ 改善", date: toYMD(TODAY_DATE), pinned:false },
  { id:"i1", text:"YouTubeチャンネルのコンセプトを固める", tag:"🚀 やりたいこと", date: toYMD(TODAY_DATE), pinned:false },
];

// ── Styles ────────────────────────────────────────────────────────
const S = {
  input: {
    width:"100%", boxSizing:"border-box", background:"#0F172A",
    border:"1px solid #334155", borderRadius:10, padding:"9px 12px",
    color:"#E2E8F0", fontSize:14, outline:"none", fontFamily:"inherit",
  },
  select: {
    background:"#0F172A", border:"1px solid #334155", borderRadius:8,
    color:"#E2E8F0", fontSize:14, padding:"7px 10px",
    fontFamily:"inherit", outline:"none", cursor:"pointer",
  },
  navBtn: {
    background:"#1E293B", border:"none", color:"#94A3B8",
    borderRadius:8, width:28, height:28, cursor:"pointer", fontSize:18,
    display:"flex", alignItems:"center", justifyContent:"center",
  },
};

// ── Field ─────────────────────────────────────────────────────────
function Field({ icon, label, children }) {
  return (
    <div style={{ borderBottom:"1px solid #1E293B", padding:"12px 0" }}>
      <div style={{ fontSize:11, color:"#64748B", fontWeight:700, marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
        <span>{icon}</span>{label}
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, color:"#CBD5E1", fontSize:14 }}>
      <span style={{ flexShrink:0 }}>{icon}</span>
      <span style={{ lineHeight:1.5 }}>{text}</span>
    </div>
  );
}

// ── Achievement Bar ───────────────────────────────────────────────
function AchievementBar({ events, dateStr }) {
  const dayEvs = events.filter(ev =>
    ev.all_day ? ev.start_time === dateStr : toYMD(new Date(ev.start_time)) === dateStr
  );
  if (dayEvs.length === 0) return null;
  const done = dayEvs.filter(e => e.done).length;
  const pct  = Math.round((done / dayEvs.length) * 100);
  const barColor = pct === 100 ? "#10B981" : pct >= 50 ? "#6366F1" : "#F59E0B";
  return (
    <div style={{ margin:"0 0 14px", background:"#1E293B", borderRadius:12, padding:"10px 14px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:12, fontWeight:700, color:"#94A3B8" }}>今日の達成度</span>
        <span style={{ fontSize:13, fontWeight:800, color:barColor }}>
          {pct===100 ? "🎉 完璧！" : `${done}/${dayEvs.length}  ${pct}%`}
        </span>
      </div>
      <div style={{ background:"#0F172A", borderRadius:99, height:8, overflow:"hidden" }}>
        <div style={{
          height:"100%", borderRadius:99, width:`${pct}%`,
          background:`linear-gradient(90deg,${barColor},${barColor}cc)`,
          transition:"width 0.4s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

// ── Event Pill ────────────────────────────────────────────────────
function EventPill({ ev, onToggleDone, onClick }) {
  const c = color(ev.calendar_name);
  const timeStr = ev.all_day ? "終日" : fmtTime(ev.start_time);
  return (
    <div style={{
      display:"flex", alignItems:"stretch",
      background: ev.done ? "#0F172A" : c.pill,
      borderLeft:`3px solid ${ev.done?"#334155":c.bg}`,
      borderRadius:"0 8px 8px 0", marginBottom:6,
      opacity:ev.done?0.65:1, transition:"all 0.2s",
    }}>
      <button onClick={e=>{ e.stopPropagation(); onToggleDone(ev.event_id); }} style={{
        background:"none", border:"none", cursor:"pointer",
        padding:"0 10px 0 10px", fontSize:18,
        color:ev.done?"#10B981":"#334155",
        flexShrink:0, display:"flex", alignItems:"center",
      }}>
        {ev.done ? "✓" : "○"}
      </button>
      <div onClick={()=>onClick(ev)} style={{ flex:1, padding:"6px 10px 6px 0", cursor:"pointer", minWidth:0 }}>
        <div style={{ fontSize:10, color:ev.done?"#475569":c.text, fontWeight:700 }}>{timeStr}</div>
        <div style={{
          fontSize:13, color:ev.done?"#475569":"#1E293B", fontWeight:600,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          textDecoration:ev.done?"line-through":"none",
        }}>{ev.title}</div>
        {ev.location&&!ev.done&&<div style={{ fontSize:10, color:"#64748B", marginTop:1 }}>📍 {ev.location}</div>}
      </div>
    </div>
  );
}

// ── Event Detail ──────────────────────────────────────────────────
function EventDetail({ ev, onClose, onToggleDone }) {
  const c = color(ev.calendar_name);
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end",zIndex:100 }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#1E293B", borderRadius:"20px 20px 0 0",
        padding:24, width:"100%", maxWidth:430, margin:"0 auto",
        borderTop:`4px solid ${c.bg}`,
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-block",padding:"3px 10px",borderRadius:20,background:c.pill,color:c.text,fontSize:11,fontWeight:600,marginBottom:8 }}>{ev.calendar_name}</div>
            <div style={{ fontSize:20,fontWeight:700,color:"#F1F5F9",lineHeight:1.3,textDecoration:ev.done?"line-through":"none" }}>{ev.title}</div>
          </div>
          <button onClick={onClose} style={{ background:"#334155",border:"none",color:"#94A3B8",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:16 }}>✕</button>
        </div>
        <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:10 }}>
          {ev.all_day
            ? <InfoRow icon="📅" text="終日" />
            : <>
                <InfoRow icon="📅" text={new Date(ev.start_time).toLocaleDateString("ja-JP",{year:"numeric",month:"long",day:"numeric",weekday:"short"})} />
                <InfoRow icon="🕐" text={`${fmtTime(ev.start_time)} 〜 ${fmtTime(ev.end_time)}（${fmtDur(ev.start_time,ev.end_time)}）`} />
              </>
          }
          {ev.location && <InfoRow icon="📍" text={ev.location} />}
          {ev.memo     && <InfoRow icon="📝" text={ev.memo} />}
        </div>
        <button onClick={()=>{ onToggleDone(ev.event_id); onClose(); }} style={{
          marginTop:20,width:"100%",padding:"12px 0",borderRadius:12,border:"none",cursor:"pointer",
          background:ev.done?"#1E3A5F":"linear-gradient(135deg,#6366F1,#8B5CF6)",
          color:"white",fontWeight:700,fontSize:15,fontFamily:"inherit",
        }}>
          {ev.done ? "⏪ 未完了に戻す" : "✓ 完了にする"}
        </button>
      </div>
    </div>
  );
}

// ── Add Event Sheet ───────────────────────────────────────────────
function AddEventSheet({ defaultDate, onClose, onSave }) {
  const d0 = defaultDate || TODAY_DATE;
  const [title,    setTitle]    = useState("");
  const [date,     setDate]     = useState(toYMD(d0));
  const [allDay,   setAllDay]   = useState(false);
  const [startH,   setStartH]   = useState(pad(d0.getHours()));
  const [startM,   setStartM]   = useState(pad(d0.getMinutes()));
  const [endH,     setEndH]     = useState(pad(Math.min(d0.getHours()+1,23)));
  const [endM,     setEndM]     = useState(pad(d0.getMinutes()));
  const [location, setLocation] = useState("");
  const [memo,     setMemo]     = useState("");
  const [calendar, setCalendar] = useState("学校");
  const [error,    setError]    = useState("");

  const durMins=(parseInt(endH)*60+parseInt(endM))-(parseInt(startH)*60+parseInt(startM));
  const durLabel=!allDay&&durMins>0?fmtDur(`2000-01-01T${startH}:${startM}`,`2000-01-01T${endH}:${endM}`):"";
  const hours=Array.from({length:24},(_,i)=>pad(i));
  const minutes=["00","05","10","15","20","25","30","35","40","45","50","55"];

  function save(){
    if(!title.trim()){setError("なにをするか入力してください");return;}
    if(!date){setError("日付を選んでください");return;}
    const startISO=allDay?date:`${date}T${startH}:${startM}:00+09:00`;
    const endISO  =allDay?date:`${date}T${endH}:${endM}:00+09:00`;
    if(!allDay&&durMins<=0){setError("終了時刻は開始より後にしてください");return;}
    onSave({event_id:uid(),title:title.trim(),calendar_name:calendar,all_day:allDay,start_time:startISO,end_time:endISO,location,memo,done:false});
  }

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",zIndex:200 }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#1E293B",borderRadius:"24px 24px 0 0",
        width:"100%",maxWidth:430,margin:"0 auto",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",maxHeight:"90vh",overflowY:"auto",
      }}>
        <div style={{ textAlign:"center",padding:"12px 0 4px" }}>
          <div style={{ width:36,height:4,borderRadius:2,background:"#334155",margin:"0 auto" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 20px 12px" }}>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#94A3B8",fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>キャンセル</button>
          <span style={{ fontWeight:700,color:"#F1F5F9",fontSize:16 }}>新しい予定</span>
          <button onClick={save} style={{ background:"none",border:"none",color:"#818CF8",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>追加</button>
        </div>
        <div style={{ padding:"0 20px 40px" }}>
          <Field icon="✏️" label="なにをする？">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例：カフェで勉強、面接準備…" style={S.input} />
          </Field>
          <Field icon="📅" label="いつ？">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ ...S.input,marginBottom:8 }} />
            <label style={{ display:"flex",alignItems:"center",gap:8,color:"#94A3B8",fontSize:13,cursor:"pointer",marginBottom:allDay?0:10 }}>
              <input type="checkbox" checked={allDay} onChange={e=>setAllDay(e.target.checked)} style={{ accentColor:"#6366F1",width:16,height:16 }} />終日
            </label>
            {!allDay&&(
              <div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <span style={{ fontSize:12,color:"#64748B",width:36 }}>開始</span>
                  <select value={startH} onChange={e=>setStartH(e.target.value)} style={S.select}>{hours.map(h=><option key={h} value={h}>{h}時</option>)}</select>
                  <select value={startM} onChange={e=>setStartM(e.target.value)} style={S.select}>{minutes.map(m=><option key={m} value={m}>{m}分</option>)}</select>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontSize:12,color:"#64748B",width:36 }}>終了</span>
                  <select value={endH} onChange={e=>setEndH(e.target.value)} style={S.select}>{hours.map(h=><option key={h} value={h}>{h}時</option>)}</select>
                  <select value={endM} onChange={e=>setEndM(e.target.value)} style={S.select}>{minutes.map(m=><option key={m} value={m}>{m}分</option>)}</select>
                  {durLabel&&<span style={{ fontSize:12,color:"#6366F1",fontWeight:700 }}>{durLabel}</span>}
                </div>
              </div>
            )}
          </Field>
          <Field icon="📍" label="どこで？">
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="例：スタバ 宇都宮店、Zoom" style={S.input} />
          </Field>
          <Field icon="📝" label="どのくらい・メモ">
            <textarea value={memo} onChange={e=>setMemo(e.target.value)} placeholder="例：2時間で参考書3章まで" rows={3} style={{ ...S.input,resize:"none",lineHeight:1.7 }} />
          </Field>
          <Field icon="🗂️" label="カレンダー">
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {CALS.map(c=>{
                const col=CAL_COLORS[c]||CAL_COLORS["その他"];
                return(
                  <button key={c} onClick={()=>setCalendar(c)} style={{
                    padding:"5px 14px",borderRadius:20,border:"none",cursor:"pointer",
                    fontSize:12,fontWeight:600,transition:"all 0.15s",
                    background:calendar===c?col.bg:"#0F172A",
                    color:calendar===c?"white":"#64748B",
                    outline:calendar===c?`2px solid ${col.bg}`:"none",
                  }}>{c}</button>
                );
              })}
            </div>
          </Field>
          {error&&<div style={{ color:"#F87171",fontSize:12,marginTop:12,textAlign:"center" }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Idea Box ──────────────────────────────────────────────────────
const IDEA_TAGS=["💡 アイデア","🚀 やりたいこと","📚 学びたい","💼 就活","🎯 目標","🛠️ 改善"];

function IdeaBox() {
  const [ideas,  setIdeas]  = useState(loadIdeas);
  const [text,   setText]   = useState("");
  const [tag,    setTag]    = useState("💡 アイデア");
  const [filter, setFilter] = useState("すべて");
  const [sent,   setSent]   = useState(false);

  useEffect(()=>{ saveIdeas(ideas); },[ideas]);

  function submit(){
    if(!text.trim())return;
    setIdeas(p=>[{ id:uid(),text:text.trim(),tag,date:toYMD(TODAY_DATE),pinned:false },...p]);
    setText(""); setSent(true);
    setTimeout(()=>setSent(false),1800);
  }

  const allTags=["すべて",...IDEA_TAGS];
  const shown=ideas
    .filter(i=>filter==="すべて"||i.tag===filter)
    .sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));

  return(
    <div style={{ padding:"16px 16px 100px" }}>
      <div style={{ background:"#1E293B",borderRadius:16,padding:16,marginBottom:20 }}>
        <div style={{ fontSize:13,fontWeight:700,color:"#94A3B8",marginBottom:10 }}>💭 アイデアを書く</div>
        <textarea
          value={text} onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))submit(); }}
          placeholder={"思いついたことをなんでも…\n（Cmd+Enter で送信）"}
          rows={3}
          style={{ ...S.input,resize:"none",lineHeight:1.7,marginBottom:10 }}
        />
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:12 }}>
          {IDEA_TAGS.map(t=>(
            <button key={t} onClick={()=>setTag(t)} style={{
              padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",
              fontSize:11,fontWeight:600,transition:"all 0.15s",
              background:tag===t?"#6366F1":"#0F172A",
              color:tag===t?"white":"#64748B",
            }}>{t}</button>
          ))}
        </div>
        <button onClick={submit} style={{
          width:"100%",padding:"11px 0",borderRadius:12,border:"none",cursor:"pointer",
          background:sent?"#10B981":"linear-gradient(135deg,#6366F1,#8B5CF6)",
          color:"white",fontWeight:700,fontSize:15,fontFamily:"inherit",transition:"background 0.3s",
        }}>{sent?"✓ 追加しました！":"アイデアボックスに追加 →"}</button>
      </div>

      <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:14 }}>
        {allTags.map(t=>(
          <button key={t} onClick={()=>setFilter(t)} style={{
            padding:"4px 10px",borderRadius:20,border:"none",cursor:"pointer",
            fontSize:11,fontWeight:600,
            background:filter===t?"#334155":"#1E293B",
            color:filter===t?"#E2E8F0":"#64748B",
          }}>{t}</button>
        ))}
      </div>
      <div style={{ fontSize:12,color:"#475569",marginBottom:10 }}>{shown.length} 件のアイデア</div>
      {shown.length===0&&<div style={{ textAlign:"center",color:"#475569",padding:"40px 0",fontSize:14 }}>まだアイデアがありません 🌱</div>}
      {shown.map(idea=>(
        <div key={idea.id} style={{
          background:"#1E293B",borderRadius:14,padding:"12px 14px",marginBottom:10,
          borderLeft:idea.pinned?"3px solid #F59E0B":"3px solid #1E293B",transition:"all 0.2s",
        }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,background:"#0F172A",color:"#94A3B8" }}>{idea.tag}</span>
                {idea.pinned&&<span style={{ fontSize:10,color:"#F59E0B",fontWeight:700 }}>📌 固定</span>}
              </div>
              <div style={{ fontSize:14,color:"#E2E8F0",lineHeight:1.6 }}>{idea.text}</div>
              <div style={{ fontSize:11,color:"#475569",marginTop:6 }}>{idea.date}</div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
              <button onClick={()=>setIdeas(p=>p.map(i=>i.id===idea.id?{...i,pinned:!i.pinned}:i))} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,padding:2 }}>{idea.pinned?"📌":"📍"}</button>
              <button onClick={()=>setIdeas(p=>p.filter(i=>i.id!==idea.id))} style={{ background:"none",border:"none",cursor:"pointer",fontSize:14,padding:2,color:"#475569" }}>✕</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [events,        setEvents]        = useState(loadEvents);
  const [tab,           setTab]           = useState("cal");
  const [viewMode,      setViewMode]      = useState("day");
  const [weekStart,     setWeekStart]     = useState(()=>{ const d=new Date(TODAY_DATE); d.setDate(d.getDate()-d.getDay()); return d; });
  const [selectedDay,   setSelectedDay]   = useState(TODAY_DATE);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAdd,       setShowAdd]       = useState(false);

  useEffect(()=>{ saveEvents(events); },[events]);

  function getEvs(dateStr){
    return events.filter(ev=>
      ev.all_day ? ev.start_time===dateStr : toYMD(new Date(ev.start_time))===dateStr
    ).sort((a,b)=>{
      const ta=a.all_day?"00:00":fmtTime(a.start_time);
      const tb=b.all_day?"00:00":fmtTime(b.start_time);
      return ta>tb?1:-1;
    });
  }

  function toggleDone(id){
    setEvents(p=>p.map(e=>e.event_id===id?{...e,done:!e.done}:e));
    setSelectedEvent(prev=>prev?.event_id===id?{...prev,done:!prev.done}:prev);
  }

  const weekDays = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const todayStr = toYMD(TODAY_DATE);
  const selStr   = toYMD(selectedDay);

  // ── Calendar body ────────────────────────────────────────────
  function CalBody(){
    if(viewMode==="day"){
      const evs=getEvs(selStr);
      const allDay=evs.filter(e=>e.all_day);
      const timed =evs.filter(e=>!e.all_day);
      return(
        <div style={{ padding:"16px 16px 100px" }}>
          <AchievementBar events={events} dateStr={selStr}/>
          <div style={{ fontSize:14,fontWeight:700,color:"#94A3B8",marginBottom:12 }}>
            {selectedDay.toLocaleDateString("ja-JP",{month:"long",day:"numeric",weekday:"long"})}
          </div>
          {evs.length===0&&<div style={{ textAlign:"center",color:"#475569",padding:"40px 0",fontSize:14 }}>予定なし 🎉</div>}
          {allDay.length>0&&<div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11,color:"#64748B",marginBottom:6,fontWeight:600 }}>終日</div>
            {allDay.map(ev=><EventPill key={ev.event_id} ev={ev} onToggleDone={toggleDone} onClick={setSelectedEvent}/>)}
          </div>}
          {timed.map(ev=><EventPill key={ev.event_id} ev={ev} onToggleDone={toggleDone} onClick={setSelectedEvent}/>)}
        </div>
      );
    }
    if(viewMode==="week"){
      return(
        <div style={{ padding:"16px 16px 100px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4 }}>
            {weekDays.map((day,i)=>{
              const dStr=toYMD(day),isToday=dStr===todayStr;
              const evs=getEvs(dStr);
              const done=evs.filter(e=>e.done).length;
              return(
                <div key={i} onClick={()=>{ setSelectedDay(day); setViewMode("day"); }} style={{ cursor:"pointer" }}>
                  <div style={{ textAlign:"center",fontSize:10,fontWeight:700,color:isToday?"#818CF8":i===0?"#F87171":i===6?"#60A5FA":"#475569",marginBottom:4 }}>{day.getDate()}</div>
                  {evs.slice(0,3).map(ev=>(
                    <div key={ev.event_id} style={{
                      background:(CAL_COLORS[ev.calendar_name]||CAL_COLORS["その他"]).bg,
                      borderRadius:4,marginBottom:2,padding:"2px 3px",
                      fontSize:9,color:"white",fontWeight:600,
                      whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                      opacity:ev.done?0.4:1,
                    }}>{ev.done?"✓ ":""}{ev.title}</div>
                  ))}
                  {evs.length>0&&<div style={{ fontSize:8,color:"#64748B",marginTop:2 }}>{done}/{evs.length} 完了</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    // agenda
    let lastDate="";
    const sorted=[...events].filter(ev=>new Date(ev.start_time)>=TODAY_DATE).sort((a,b)=>new Date(a.start_time)-new Date(b.start_time));
    return(
      <div style={{ padding:"16px 16px 100px" }}>
        <div style={{ fontSize:13,fontWeight:700,color:"#64748B",marginBottom:16 }}>今後の予定</div>
        {sorted.map(ev=>{
          const d=new Date(ev.start_time),dStr=toYMD(d),showDate=dStr!==lastDate;
          lastDate=dStr;
          return(
            <div key={ev.event_id}>
              {showDate&&<div style={{ fontSize:12,fontWeight:700,color:"#6366F1",marginTop:16,marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1E293B" }}>
                {d.toLocaleDateString("ja-JP",{month:"long",day:"numeric",weekday:"short"})}
              </div>}
              <EventPill ev={ev} onToggleDone={toggleDone} onClick={setSelectedEvent}/>
            </div>
          );
        })}
      </div>
    );
  }

  return(
    <div style={{ fontFamily:"'Noto Sans JP','Hiragino Sans',sans-serif",background:"#0F172A",minHeight:"100vh",color:"#E2E8F0",maxWidth:430,margin:"0 auto",position:"relative" }}>

      {/* ── HEADER ── */}
      {tab==="cal"?(
        <div style={{ background:"linear-gradient(135deg,#1E293B 0%,#0F172A 100%)",padding:"20px 20px 0",borderBottom:"1px solid #1E293B" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11,color:"#64748B",letterSpacing:2,textTransform:"uppercase" }}>{MON[weekStart.getMonth()]} {weekStart.getFullYear()}</div>
              <div style={{ fontSize:22,fontWeight:700,color:"#F1F5F9" }}>マイカレンダー</div>
            </div>
            <div style={{ display:"flex",gap:4 }}>
              {["week","day","agenda"].map(m=>(
                <button key={m} onClick={()=>setViewMode(m)} style={{
                  padding:"5px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,
                  background:viewMode===m?"#6366F1":"#1E293B",
                  color:viewMode===m?"white":"#64748B",
                }}>{m==="week"?"週":m==="day"?"日":"一覧"}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <button onClick={()=>{ const d=new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }} style={S.navBtn}>‹</button>
            <div style={{ flex:1,display:"flex",gap:2 }}>
              {weekDays.map((day,i)=>{
                const dStr=toYMD(day),isToday=dStr===todayStr,isSel=dStr===selStr;
                const evs=getEvs(dStr);
                const allDone=evs.length>0&&evs.every(e=>e.done);
                return(
                  <div key={i} onClick={()=>{ setSelectedDay(day); if(viewMode==="week")setViewMode("day"); }} style={{
                    flex:1,textAlign:"center",cursor:"pointer",padding:"6px 2px 8px",borderRadius:10,
                    background:isSel?"#6366F1":isToday?"#1E3A5F":"transparent",
                  }}>
                    <div style={{ fontSize:10,color:i===0?"#F87171":i===6?"#60A5FA":"#64748B",marginBottom:4 }}>{DAY[i]}</div>
                    <div style={{ fontSize:16,fontWeight:700,color:isSel?"white":isToday?"#93C5FD":"#CBD5E1" }}>{day.getDate()}</div>
                    {evs.length>0&&<div style={{ width:4,height:4,borderRadius:"50%",background:allDone?"#10B981":isSel?"white":"#6366F1",margin:"3px auto 0" }}/>}
                  </div>
                );
              })}
            </div>
            <button onClick={()=>{ const d=new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }} style={S.navBtn}>›</button>
          </div>
        </div>
      ):(
        <div style={{ background:"linear-gradient(135deg,#1E293B 0%,#0F172A 100%)",padding:"20px 20px 16px",borderBottom:"1px solid #1E293B" }}>
          <div style={{ fontSize:11,color:"#64748B",letterSpacing:2,textTransform:"uppercase",marginBottom:4 }}>BRAIN DUMP</div>
          <div style={{ fontSize:22,fontWeight:700,color:"#F1F5F9" }}>💡 アイデアボックス</div>
        </div>
      )}

      {/* ── BODY ── */}
      {tab==="cal" ? <CalBody/> : <IdeaBox/>}

      {/* ── FAB ── */}
      {tab==="cal"&&(
        <button onClick={()=>setShowAdd(true)} style={{
          position:"fixed",bottom:76,right:"calc(50% - 200px)",
          width:52,height:52,borderRadius:"50%",
          background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
          border:"none",cursor:"pointer",fontSize:26,color:"white",
          boxShadow:"0 4px 20px rgba(99,102,241,0.5)",
          display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,
        }}>＋</button>
      )}

      {/* ── BOTTOM NAV ── */}
      <div style={{
        position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:"#1E293B",borderTop:"1px solid #334155",
        display:"flex",zIndex:60,
      }}>
        {[{key:"cal",icon:"📅",label:"カレンダー"},{key:"idea",icon:"💡",label:"アイデア"}].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",
            padding:"10px 0 12px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            color:tab===t.key?"#818CF8":"#475569",
            borderTop:tab===t.key?"2px solid #6366F1":"2px solid transparent",
            fontFamily:"inherit",
          }}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <span style={{ fontSize:10,fontWeight:600 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── MODALS ── */}
      {showAdd&&(
        <AddEventSheet
          defaultDate={selectedDay}
          onClose={()=>setShowAdd(false)}
          onSave={ev=>{ setEvents(p=>[...p,ev]); setShowAdd(false); }}
        />
      )}
      {selectedEvent&&(
        <EventDetail ev={selectedEvent} onClose={()=>setSelectedEvent(null)} onToggleDone={toggleDone}/>
      )}
    </div>
  );
}
