import React, { useState, useMemo, createContext, useContext } from "react";

/* =====================================================================
   WORKBOOK · SER y ESTAR (TO BE)
   Pure activities, built on the class mind map:
   Conjugación · Ubicaciones · Orígenes · Personalidad · Físico · Profesión
   + the big contrast (ser o estar) and a final challenge.
   Self-contained: React only. Audio = browser Spanish voice.
   ===================================================================== */

/* ------------------------- helpers ------------------------- */

function speak(text, queue = false) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (!queue) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[¿¡_]/g, ""));
    const voices = synth.getVoices();
    const v =
      voices.find((x) => /es[-_](MX|US|419|CL|AR|CO)/i.test(x.lang)) ||
      voices.find((x) => /^es/i.test(x.lang));
    if (v) u.voice = v;
    u.lang = v ? v.lang : "es-MX";
    u.rate = 0.85;
    synth.speak(u);
  } catch (e) {
    /* no audio available */
  }
}

const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
const shuffle = (arr, seed) =>
  [...arr].sort((a, b) => hash(a + seed) - hash(b + seed) || String(a).localeCompare(String(b)));
const loose = (s) => s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const strict = (s) => s.trim().toLowerCase();
const judge = (val, answers) =>
  answers.some((a) => strict(a) === strict(val)) ? "ok" : answers.some((a) => loose(a) === loose(val)) ? "accent" : "bad";

const SER = ["soy", "eres", "es", "somos", "son"];
const ESTAR = ["estoy", "estás", "está", "estamos", "están"];

const SECS = [
  { id: "conj", es: "Conjugación", sub: "SER · ESTAR", en: "Forms of ser and estar", c: "#FFD84D", l: "#FFF6CC", ids: ["conj1", "conj2", "conj3", "conj4"] },
  { id: "ubic", es: "Ubicaciones", sub: "ESTAR · ¿Dónde estás?", en: "Where people are", c: "#FF9F5A", l: "#FFE9D6", ids: ["ubic1", "ubic2", "ubic3", "ubic4"] },
  { id: "orig", es: "Orígenes", sub: "SER · ¿De dónde eres?", en: "Where people are from", c: "#8FD14F", l: "#EAF7D8", ids: ["orig1", "orig2", "orig3", "orig4"] },
  { id: "pers", es: "Personalidad", sub: "SER · ¿Cómo eres?", en: "What people are like", c: "#6CCBFF", l: "#DDF3FF", ids: ["pers1", "pers2", "pers3", "pers4"] },
  { id: "fis", es: "Físico", sub: "SER · ¿Cómo luce?", en: "How people look", c: "#FF8AD8", l: "#FFE0F5", ids: ["fis1", "fis2", "fis3", "fis4", "fis5"] },
  { id: "prof", es: "Profesión", sub: "SER · ¿A qué te dedicas?", en: "What people do", c: "#4FD8C8", l: "#D8F6F2", ids: ["prof1", "prof2", "prof3", "prof4", "prof5"] },
  { id: "mix", es: "¿Ser o estar?", sub: "The big contrast", en: "Choose the right verb", c: "#9B8CFF", l: "#E9E5FF", ids: ["mix1", "mix2", "mix3", "mix4", "mix5", "mix6"] },
  { id: "fin", es: "Desafío final", sub: "Mixed review", en: "Put it all together", c: "#1E1B33", l: "#E2DEF2", ids: ["fin1", "fin2", "fin3", "fin4"] },
];
const ALL_IDS = SECS.flatMap((s) => s.ids);

const WB = createContext({ results: {}, report: () => {}, teacher: false });

/* ------------------------- styles ------------------------- */

const CSS = `
:root{--ink:#1E1B33;--paper:#FAF9FF;--card:#fff;--line:#E2DEF2;--soft:#625C80;--pur:#9B8CFF;--pur-l:#E9E5FF;
--ok:#12805C;--ok-l:#D9F4E8;--bad:#C62D3A;--bad-l:#FDE3E5;--c:#9B8CFF;--l:#E9E5FF}
*{box-sizing:border-box}body{margin:0}
.app{min-height:100vh;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
.wrap{max-width:960px;margin:0 auto;padding:0 18px 130px}
.top{position:sticky;top:0;z-index:20;background:rgba(250,249,255,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top-in{max-width:960px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-family:Georgia,serif;font-weight:700;font-size:18px}
.bar{flex:1;min-width:110px;height:8px;background:var(--line);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--ink);transition:width .35s}
.toggle{border:1.5px solid var(--ink);background:transparent;color:var(--ink);padding:6px 12px;border-radius:99px;font-size:13px;cursor:pointer;font-weight:600}
.toggle.on{background:var(--ink);color:#fff}
h1,h2,h3{font-family:Georgia,"Times New Roman",serif;margin:0}
.hero{margin:26px 0 18px;padding:22px 22px 20px;border-radius:16px;background:var(--l);border-left:12px solid var(--c)}
.hero .es{font-family:Georgia,serif;font-weight:700;font-size:clamp(32px,6.5vw,54px);line-height:1.05;letter-spacing:-.02em}
.hero .en{margin-top:6px;color:var(--soft);font-size:17px}
.hero .q{margin-top:10px;display:inline-block;background:#fff;border-radius:99px;padding:3px 14px;font-weight:700;font-size:15px}
.sub{color:var(--soft);font-size:15px;margin:2px 0 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.grid{display:grid;gap:12px}
.g2{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
.ref{margin:0 0 22px;padding:16px;border-radius:14px;background:#fff;border:2px solid var(--c)}
.ref h3{font-size:19px;margin-bottom:8px}
.act{margin:22px 0;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px;border-top:6px solid var(--c)}
.act-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}
.act-h h3{font-size:20px}
.badge{background:var(--ok-l);color:var(--ok);font-weight:700;border-radius:99px;padding:3px 12px;font-size:14px;white-space:nowrap}
.btn{border:0;background:var(--ink);color:#fff;padding:9px 16px;border-radius:10px;font-weight:700;font-size:14.5px;cursor:pointer}
.btn:hover{background:#3a3560}.btn:disabled{opacity:.35;cursor:default}
.btn.ghost{background:var(--pur-l);color:var(--ink)}
.btn.sm{padding:5px 11px;font-size:13px;border-radius:8px}
.spk{border:0;background:var(--pur-l);color:var(--ink);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:14px;flex:none}
.spk:hover{background:var(--ink);color:#fff}
.note{border-left:5px solid #FFC233;background:#FFF4D6;padding:11px 14px;border-radius:0 10px 10px 0;font-size:14.5px}
.trap{border-left:5px solid var(--bad);background:var(--bad-l);padding:11px 14px;border-radius:0 10px 10px 0;font-size:14.5px}
.teach{border:2px dashed var(--ink);background:#fff;padding:12px 14px;border-radius:12px;font-size:14px;margin:20px 0}
.row{display:flex;align-items:center;gap:10px}
.opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.chip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);background:#fff;color:var(--ink);border-radius:99px;padding:6px 13px;cursor:pointer;font-size:15px;font-family:inherit}
.chip:hover{border-color:var(--ink)}
.chip.sel{background:var(--ink);color:#fff;border-color:var(--ink)}
.chip.ok{background:var(--ok-l);border-color:var(--ok);color:var(--ok)}
.chip.bad{background:var(--bad-l);border-color:var(--bad);color:var(--bad)}
.chip:disabled{cursor:default}
.fb{font-size:14.5px;margin-top:10px}.fb.ok{color:var(--ok)}.fb.bad{color:var(--bad)}
.match{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}
.match .chip{width:100%;justify-content:center;border-radius:12px;padding:9px 10px;min-height:44px}
.match .big{font-size:26px}
.gap-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:9px 0;border-bottom:1px dashed var(--line);font-size:17px}
.gap-row:last-child{border-bottom:0}
.clue{width:100%;font-size:13px;color:var(--soft);margin-top:-4px}
select,input[type=text],textarea{font-family:inherit;font-size:16px;border:1.5px solid var(--ink);border-radius:9px;padding:6px 9px;background:#fff;color:var(--ink)}
select.ok,input.ok{border-color:var(--ok);background:var(--ok-l)}
select.bad,input.bad{border-color:var(--bad);background:var(--bad-l)}
input[type=text]{width:130px}
textarea{width:100%;min-height:56px;resize:vertical}
:focus-visible{outline:3px solid #FFC233;outline-offset:2px}
.buckets{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.bucket{border:2px dashed var(--ink);border-radius:14px;padding:12px;min-height:120px;cursor:pointer;background:#fff}
.bucket.flash{background:var(--bad-l);border-color:var(--bad)}
.bucket h4{margin:0 0 8px;font-family:Georgia,serif;font-size:19px}
.placed{font-size:14.5px;background:var(--ok-l);border-radius:8px;padding:4px 8px;margin-top:6px}
.tile{border:1.5px solid var(--line);border-radius:12px;background:#fff;padding:9px 11px;cursor:pointer;text-align:left;font-family:inherit;font-size:15px;color:var(--ink)}
.tile:hover{border-color:var(--ink)}
.tile b{display:block;font-size:16px}
.tile span{color:var(--soft);font-size:13px}
.check{display:flex;gap:8px;align-items:center;font-size:14px;margin-top:8px;cursor:pointer}
table{border-collapse:collapse;width:100%}
td,th{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;font-size:15px}
th{font-family:Georgia,serif;color:var(--soft);font-size:14px}
.maplist{display:none}
.nav{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);z-index:30}
.nav-in{max-width:960px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:10px}
.dots{flex:1;display:flex;justify-content:center;gap:7px;flex-wrap:wrap}
.dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--ink);background:#fff;cursor:pointer;padding:0}
.dot.cur{transform:scale(1.4)}
@media (max-width:620px){.map{display:none}.maplist{display:grid}.dots{display:none}.nav-in{justify-content:space-between}.buckets{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/* ------------------------- small visuals ------------------------- */

const FL = {
  ve: { d: "h", c: ["#FFCC00", "#00247D", "#CF142B"], w: [1, 1, 1] },
  ca: { d: "v", c: ["#D80621", "#ffffff", "#D80621"], w: [1, 2, 1] },
  mx: { d: "v", c: ["#006847", "#ffffff", "#ce1126"], w: [1, 1, 1] },
  co: { d: "h", c: ["#fcd116", "#003893", "#ce1126"], w: [2, 1, 1] },
};
function Flag({ code, size = 54 }) {
  const W = 60, H = 40;
  let body;
  if (code === "us") {
    body = (
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} y={(H / 7) * i} width={W} height={H / 7 + 0.5} fill={i % 2 ? "#fff" : "#b22234"} />
        ))}
        <rect width="26" height={(H / 7) * 4} fill="#3c3b6e" />
      </g>
    );
  } else if (code === "cl") {
    body = (
      <g>
        <rect width={W} height={H / 2} fill="#fff" />
        <rect y={H / 2} width={W} height={H / 2} fill="#d52b1e" />
        <rect width="20" height="20" fill="#0039a6" />
        <text x="10" y="15" fontSize="13" textAnchor="middle" fill="#fff">★</text>
      </g>
    );
  } else {
    const f = FL[code];
    const total = f.w.reduce((a, b) => a + b, 0);
    let acc = 0;
    body = (
      <g>
        {f.c.map((col, i) => {
          const part = (f.w[i] / total) * (f.d === "h" ? H : W);
          const el = f.d === "h" ? <rect key={i} y={acc} width={W} height={part + 0.5} fill={col} /> : <rect key={i} x={acc} width={part + 0.5} height={H} fill={col} />;
          acc += part;
          return el;
        })}
      </g>
    );
  }
  return (
    <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 6, border: "1px solid #E2DEF2", flex: "none" }} aria-hidden="true">
      {body}
    </svg>
  );
}

function Speak({ text }) {
  return (
    <button className="spk" onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label={`Listen: ${text}`} title="Listen">🔊</button>
  );
}

function Hero({ s }) {
  return (
    <div className="hero" style={{ "--c": s.c, "--l": s.l }}>
      <div className="es">{s.es}</div>
      <div className="en">{s.en}</div>
      <div className="q">{s.sub}</div>
    </div>
  );
}

function Teacher({ children }) {
  const { teacher } = useContext(WB);
  if (!teacher) return null;
  return <div className="teach"><b style={{ fontFamily: "Georgia,serif" }}>Teacher's note.</b> {children}</div>;
}

function Act({ id, title, instr, children }) {
  const { results } = useContext(WB);
  const r = results[id];
  return (
    <section className="act">
      <div className="act-h">
        <div>
          <h3>{title}</h3>
          {instr && <p className="sub">{instr}</p>}
        </div>
        {r && <span className="badge">{r.scored ? `${r.s} / ${r.t}` : "✓ done"}</span>}
      </div>
      {children}
    </section>
  );
}

function VocabBank({ groups }) {
  const [open, setOpen] = useState({});
  return (
    <div className="grid g2">
      {groups.map((g, gi) => (
        <div className="grid g3" key={gi} style={{ alignContent: "start", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {g.map(([es, en]) => (
            <button key={es} className="tile" onClick={() => { speak(es); setOpen({ ...open, [es]: !open[es] }); }}>
              <b>{es}</b>
              <span>{open[es] ? en : "tap to hear · tap to translate"}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------- activity engines ------------------------- */

function Match({ id, title, instr, pairs, big }) {
  const { report } = useContext(WB);
  const rights = useMemo(() => shuffle(pairs.map((p) => p[1]), id), [pairs, id]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState({});
  const [miss, setMiss] = useState(0);
  const [flash, setFlash] = useState(null);
  const n = pairs.length;
  const used = Object.values(done);
  const finished = Object.keys(done).length === n;

  const pickRight = (r) => {
    if (sel === null || used.includes(r)) return;
    if (pairs[sel][1] === r) {
      const nd = { ...done, [sel]: r };
      setDone(nd);
      setSel(null);
      if (Object.keys(nd).length === n) report(id, Math.max(0, n - miss), n);
    } else {
      setMiss(miss + 1);
      setFlash(r);
      setTimeout(() => setFlash(null), 500);
    }
  };
  const reset = () => { setSel(null); setDone({}); setMiss(0); };

  return (
    <Act id={id} title={title} instr={instr || "Tap one on the left, then its partner on the right."}>
      <div className="match">
        <div className="grid" style={{ gap: 10 }}>
          {pairs.map((p, i) => (
            <button key={p[0]} className={"chip " + (done[i] !== undefined ? "ok" : sel === i ? "sel" : "") + (big ? " big" : "")} disabled={done[i] !== undefined} onClick={() => { setSel(i); if (!big) speak(p[0]); }}>
              {p[0]}
            </button>
          ))}
        </div>
        <div className="grid" style={{ gap: 10 }}>
          {rights.map((r) => (
            <button key={r} className={"chip " + (used.includes(r) ? "ok" : flash === r ? "bad" : "")} disabled={used.includes(r)} onClick={() => pickRight(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <span className={"fb " + (miss === 0 ? "ok" : "")} style={{ margin: 0 }}>
            {miss === 0 ? "Perfect. ¡Muy bien!" : `Done, with ${miss} mistake${miss > 1 ? "s" : ""}.`}
          </span>
          <button className="btn ghost sm" onClick={reset}>Try again</button>
        </div>
      )}
    </Act>
  );
}

function Gaps({ id, title, instr, items }) {
  const { report } = useContext(WB);
  const opts = useMemo(() => items.map((it, i) => shuffle(it.o, id + i)), [items, id]);
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const all = items.every((_, i) => ans[i]);
  const score = items.filter((it, i) => ans[i] === it.a).length;

  return (
    <Act id={id} title={title} instr={instr || "Choose the correct word for each blank."}>
      {items.map((it, i) => (
        <div className="gap-row" key={i}>
          <span>{it.pre}</span>
          <select
            className={checked ? (ans[i] === it.a ? "ok" : "bad") : ""}
            disabled={checked}
            value={ans[i] || ""}
            onChange={(e) => setAns({ ...ans, [i]: e.target.value })}
            aria-label={`Blank ${i + 1}`}
          >
            <option value="">…</option>
            {opts[i].map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>{it.post}</span>
          {checked && ans[i] === it.a && <span style={{ color: "var(--ok)" }}>✓</span>}
          {checked && ans[i] !== it.a && <span className="fb bad" style={{ margin: 0 }}>→ {it.a}</span>}
          {it.clue && <div className="clue">{it.clue}</div>}
        </div>
      ))}
      <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
        {!checked ? (
          <button className="btn" disabled={!all} onClick={() => { setChecked(true); report(id, score, items.length); }}>Check answers</button>
        ) : (
          <>
            <b>{score} / {items.length}</b>
            <button className="btn ghost sm" onClick={() => { setAns({}); setChecked(false); }}>Try again</button>
          </>
        )}
      </div>
    </Act>
  );
}

function Typed({ id, title, instr, items }) {
  const { report } = useContext(WB);
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const res = items.map((it, i) => judge(ans[i] || "", it.a));
  const score = res.filter((r) => r !== "bad").length;
  const all = items.every((_, i) => (ans[i] || "").trim());

  return (
    <Act id={id} title={title} instr={instr || "Type the correct form. Watch the accents."}>
      {items.map((it, i) => (
        <div className="gap-row" key={i}>
          <span>{it.pre}</span>
          <input
            type="text"
            className={checked ? (res[i] === "bad" ? "bad" : "ok") : ""}
            disabled={checked}
            value={ans[i] || ""}
            onChange={(e) => setAns({ ...ans, [i]: e.target.value })}
            aria-label={`Answer ${i + 1}`}
          />
          <span>{it.post}</span>
          {checked && res[i] === "ok" && <span style={{ color: "var(--ok)" }}>✓</span>}
          {checked && res[i] === "accent" && <span className="fb" style={{ margin: 0, color: "#9a6b00" }}>Almost: mind the accent → {it.a[0]}</span>}
          {checked && res[i] === "bad" && <span className="fb bad" style={{ margin: 0 }}>→ {it.a[0]}</span>}
        </div>
      ))}
      <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
        {!checked ? (
          <button className="btn" disabled={!all} onClick={() => { setChecked(true); report(id, score, items.length); }}>Check answers</button>
        ) : (
          <>
            <b>{score} / {items.length}</b>
            <button className="btn ghost sm" onClick={() => { setAns({}); setChecked(false); }}>Try again</button>
          </>
        )}
      </div>
    </Act>
  );
}

function Choice({ id, title, instr, items, passage }) {
  const { report } = useContext(WB);
  const opts = useMemo(() => items.map((it, i) => shuffle(it.o, id + i)), [items, id]);
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);
  const it = items[i];

  const pick = (o) => {
    if (sel !== null) return;
    setSel(o);
    if (o === it.a) setScore((s) => s + 1);
    if (it.say) speak(it.say);
  };
  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setSel(null); }
    else { setFin(true); report(id, score, items.length); }
  };
  const reset = () => { setI(0); setSel(null); setScore(0); setFin(false); };

  return (
    <Act id={id} title={title} instr={instr}>
      {passage}
      {fin ? (
        <div>
          <b style={{ fontSize: 18 }}>{score} / {items.length}</b>
          <p className="sub">{score === items.length ? "Perfect. ¡Excelente!" : "Good work. Listen to each answer and try again."}</p>
          <button className="btn ghost sm" onClick={reset}>Try again</button>
        </div>
      ) : (
        <>
          <div className="sub" style={{ marginBottom: 6 }}>Question {i + 1} of {items.length}</div>
          <p style={{ fontSize: 18, margin: "4px 0 0" }}>{it.q}</p>
          <div className="opts">
            {opts[i].map((o) => (
              <button key={o} className={"chip " + (sel === null ? "" : o === it.a ? "ok" : o === sel ? "bad" : "")} disabled={sel !== null} onClick={() => pick(o)}>{o}</button>
            ))}
          </div>
          {sel !== null && (
            <>
              <div className={"fb " + (sel === it.a ? "ok" : "bad")}><b>{sel === it.a ? "Correct. " : "Not quite. "}</b>{it.why}</div>
              <div style={{ marginTop: 10 }}><button className="btn sm" onClick={next}>{i + 1 < items.length ? "Next" : "See score"}</button></div>
            </>
          )}
        </>
      )}
    </Act>
  );
}

function WordOrder({ id, title, instr, sentences }) {
  const { report } = useContext(WB);
  const [k, setK] = useState(0);
  const target = sentences[k];
  const words = useMemo(() => shuffle(target.split(" "), id + k), [target, id, k]);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);
  const [first, setFirst] = useState({});
  const [fin, setFin] = useState(false);
  const answer = built.map((b) => words[b]).join(" ");
  const right = answer === target;

  const check = () => {
    setChecked(true);
    if (first[k] === undefined) setFirst({ ...first, [k]: right });
    if (right) speak(target);
  };
  const next = () => {
    if (k + 1 < sentences.length) { setK(k + 1); setBuilt([]); setChecked(false); }
    else { setFin(true); report(id, Object.values(first).filter(Boolean).length, sentences.length); }
  };
  const reset = () => { setK(0); setBuilt([]); setChecked(false); setFirst({}); setFin(false); };

  return (
    <Act id={id} title={title} instr={instr || "Tap the words in the right order. Tap a word in your sentence to remove it."}>
      {fin ? (
        <div>
          <b style={{ fontSize: 18 }}>{Object.values(first).filter(Boolean).length} / {sentences.length} on the first try</b>
          <div style={{ marginTop: 8 }}><button className="btn ghost sm" onClick={reset}>Try again</button></div>
        </div>
      ) : (
        <>
          <div className="sub">Sentence {k + 1} of {sentences.length}</div>
          <div className="opts" style={{ minHeight: 52, border: "1.5px dashed var(--line)", borderRadius: 12, padding: 8 }}>
            {built.map((b, n) => (
              <button key={n} className={"chip " + (checked ? (right ? "ok" : "bad") : "sel")} onClick={() => !checked && setBuilt(built.filter((_, x) => x !== n))}>{words[b]}</button>
            ))}
          </div>
          <div className="opts">
            {words.map((w, idx) => (
              <button key={idx} className="chip" disabled={built.includes(idx)} style={{ opacity: built.includes(idx) ? 0.3 : 1 }} onClick={() => !checked && setBuilt([...built, idx])}>{w}</button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
            {!checked && <button className="btn sm" disabled={built.length !== words.length} onClick={check}>Check</button>}
            {!checked && <button className="btn ghost sm" onClick={() => setBuilt([])}>Clear</button>}
            {checked && <button className="btn sm" onClick={next}>{k + 1 < sentences.length ? "Next sentence" : "See score"}</button>}
            {checked && <span className={"fb " + (right ? "ok" : "bad")} style={{ margin: 0 }}>{right ? "Correct. ¡Perfecto!" : `Not yet. Answer: ${target}`}</span>}
          </div>
        </>
      )}
    </Act>
  );
}

function OpenQA({ id, title, instr, items }) {
  const { report } = useContext(WB);
  const [txt, setTxt] = useState({});
  const [show, setShow] = useState({});
  const [ok, setOk] = useState({});
  const tick = (i) => {
    const n = { ...ok, [i]: !ok[i] };
    setOk(n);
    const c = Object.values(n).filter(Boolean).length;
    if (c === items.length) report(id, c, items.length, false);
  };
  return (
    <Act id={id} title={title} instr={instr || "Answer in Spanish, then compare with the model answer. Tick each one when you're happy with it."}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: "10px 0", borderBottom: i < items.length - 1 ? "1px dashed var(--line)" : 0 }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <b style={{ fontSize: 17 }}>{it.q}</b>
            <Speak text={it.q} />
          </div>
          <textarea value={txt[i] || ""} onChange={(e) => setTxt({ ...txt, [i]: e.target.value })} placeholder="Write your answer here…" aria-label={it.q} />
          <div className="row" style={{ flexWrap: "wrap", marginTop: 6 }}>
            <button className="btn ghost sm" onClick={() => setShow({ ...show, [i]: !show[i] })}>{show[i] ? "Hide model" : "Show model answer"}</button>
            <label className="check" style={{ margin: 0 }}>
              <input type="checkbox" checked={!!ok[i]} onChange={() => tick(i)} /> I answered it
            </label>
          </div>
          {show[i] && (
            <div className="note" style={{ marginTop: 8 }}>
              <b>Model:</b> {it.m} <Speak text={it.m} />
            </div>
          )}
        </div>
      ))}
    </Act>
  );
}

function Sort({ id, title, instr, cards, buckets }) {
  const { report } = useContext(WB);
  const order = useMemo(() => shuffle(cards.map((c) => c.t), id), [cards, id]);
  const [placed, setPlaced] = useState({});
  const [sel, setSel] = useState(null);
  const [miss, setMiss] = useState(0);
  const [flash, setFlash] = useState(null);
  const remaining = order.filter((t) => !placed[t]);

  const put = (b) => {
    if (!sel) return;
    const card = cards.find((c) => c.t === sel);
    if (card.b === b) {
      const np = { ...placed, [sel]: b };
      setPlaced(np);
      setSel(null);
      speak(card.t.replace("___", card.v));
      if (Object.keys(np).length === cards.length) report(id, Math.max(0, cards.length - miss), cards.length);
    } else {
      setMiss(miss + 1);
      setFlash(b);
      setTimeout(() => setFlash(null), 500);
    }
  };
  const reset = () => { setPlaced({}); setSel(null); setMiss(0); };

  return (
    <Act id={id} title={title} instr={instr || "Tap a sentence, then tap the verb that belongs in the blank."}>
      <div className="opts" style={{ minHeight: 44 }}>
        {remaining.map((t) => (
          <button key={t} className={"chip " + (sel === t ? "sel" : "")} onClick={() => setSel(t)}>{t}</button>
        ))}
        {remaining.length === 0 && (
          <span className="fb ok" style={{ margin: 0 }}>
            {miss === 0 ? "Perfect sort." : `Sorted, with ${miss} mistake${miss > 1 ? "s" : ""}.`}{" "}
            <button className="btn ghost sm" onClick={reset}>Try again</button>
          </span>
        )}
      </div>
      <div className="buckets">
        {buckets.map((b) => (
          <div key={b} className={"bucket " + (flash === b ? "flash" : "")} onClick={() => put(b)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && put(b)}>
            <h4>{b}</h4>
            {cards.filter((c) => placed[c.t] === b).map((c) => (
              <div className="placed" key={c.t}>{c.t.replace("___", c.v)}</div>
            ))}
          </div>
        ))}
      </div>
    </Act>
  );
}

/* ------------------------- pages ------------------------- */

function Home({ go }) {
  const { results } = useContext(WB);
  const doneCount = ALL_IDS.filter((i) => results[i]).length;
  const scored = ALL_IDS.map((i) => results[i]).filter((r) => r && r.scored);
  const acc = scored.length ? Math.round((scored.reduce((a, r) => a + r.s, 0) / scored.reduce((a, r) => a + r.t, 0)) * 100) : null;
  const info = (s) => `${s.ids.filter((i) => results[i]).length} / ${s.ids.length}`;
  const pos = {
    ubic: [20, 14], pers: [20, 164], prof: [20, 314],
    orig: [430, 14], conj: [430, 164], fis: [430, 314],
  };
  const center = [320, 200];
  return (
    <>
      <div className="hero" style={{ "--c": "#9B8CFF", "--l": "#E9E5FF" }}>
        <div className="es">Ser y estar</div>
        <div className="en">Workbook · {ALL_IDS.length} activities, one for every branch of the class mind map</div>
      </div>

      <svg className="map" viewBox="0 0 640 400" style={{ width: "100%" }} role="group" aria-label="Mind map: tap a branch to open its activities">
        {SECS.slice(0, 6).map((s) => {
          const [x, y] = pos[s.id];
          const left = x < 300;
          return <line key={s.id} x1={center[0]} y1={center[1]} x2={left ? x + 190 : x} y2={y + 36} stroke={s.c} strokeWidth="4" />;
        })}
        <rect x="235" y="165" width="170" height="70" rx="16" fill="#B7ABFF" stroke="#7A68F0" strokeWidth="2" />
        <text x="320" y="196" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="22" fill="#1E1B33">SER y ESTAR</text>
        <text x="320" y="219" textAnchor="middle" fontSize="14" fill="#1E1B33">(TO BE)</text>
        {SECS.slice(0, 6).map((s, idx) => {
          const [x, y] = pos[s.id];
          return (
            <g key={s.id} style={{ cursor: "pointer" }} onClick={() => go(idx + 1)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(idx + 1)} aria-label={`${s.es}: ${info(s)} done`}>
              <rect x={x} y={y} width="190" height="72" rx="14" fill={s.c} stroke="#1E1B33" strokeWidth="1.5" />
              <text x={x + 95} y={y + 28} textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="18" fill="#1E1B33">{s.es}</text>
              <text x={x + 95} y={y + 47} textAnchor="middle" fontSize="12" fill="#1E1B33">{s.sub}</text>
              <text x={x + 95} y={y + 63} textAnchor="middle" fontSize="12" fontWeight="700" fill="#1E1B33">{info(s)} done</text>
            </g>
          );
        })}
      </svg>

      <div className="maplist grid g2">
        {SECS.slice(0, 6).map((s, idx) => (
          <button key={s.id} className="tile" style={{ background: s.c, border: "1.5px solid var(--ink)" }} onClick={() => go(idx + 1)}>
            <b style={{ fontFamily: "Georgia,serif", fontSize: 18 }}>{s.es}</b>
            <span style={{ color: "var(--ink)" }}>{s.sub} · {info(s)} done</span>
          </button>
        ))}
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        {SECS.slice(6).map((s, idx) => (
          <button key={s.id} className="tile" style={{ background: s.l, border: `2px solid ${s.c}` }} onClick={() => go(idx + 7)}>
            <b style={{ fontFamily: "Georgia,serif", fontSize: 18 }}>{s.es}</b>
            <span style={{ color: "var(--ink)" }}>{s.en} · {info(s)} done</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <b>Your progress: {doneCount} / {ALL_IDS.length} activities</b>
          <b>{acc === null ? "Accuracy: –" : `Accuracy: ${acc}%`}</b>
        </div>
        <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${(doneCount / ALL_IDS.length) * 100}%` }} /></div>
      </div>

      <div className="note" style={{ marginTop: 14 }}>
        <b>The golden rule.</b> <b>Ser</b> says <i>what someone is</i> (origin, profession, personality, looks). <b>Estar</b> says <i>where someone is</i>. Every activity here practices one of those two ideas.
      </div>
      <div className="trap" style={{ marginTop: 10 }}>
        <b>Progress is kept while this page is open.</b> If you refresh, it starts again.
      </div>
    </>
  );
}

function PConj() {
  const s = SECS[0];
  const rows = [["yo", "soy", "estoy"], ["tú", "eres", "estás"], ["él / ella / eso", "es", "está"], ["nosotros", "somos", "estamos"], ["ellos", "son", "están"]];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>The two verbs side by side</h3>
        <table>
          <thead><tr><th></th><th>SER</th><th>ESTAR</th></tr></thead>
          <tbody>
            {rows.map(([p, a, b]) => (
              <tr key={p}>
                <td>{p}</td>
                <td><b>{a}</b> <Speak text={a} /></td>
                <td><b>{b}</b> <Speak text={b} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="opts">
          {[["Maikol", "él es / está", "👨"], ["Morgan", "yo soy / estoy", "🧑"], ["Mía", "ella es / está", "👩"], ["Tammy y Michael", "ellos son / están", "👫"]].map(([n, f, e]) => (
            <span className="chip" key={n} style={{ cursor: "default" }}>{e} <b>{n}</b> — {f}</span>
          ))}
        </div>
      </div>

      <Match id="conj1" title="Match the form" pairs={[["ser · yo", "soy"], ["ser · tú", "eres"], ["ser · nosotros", "somos"], ["estar · yo", "estoy"], ["estar · tú", "estás"], ["estar · ellos", "están"]]} />
      <Gaps
        id="conj2"
        title="Conjugate the verb"
        instr="The verb in parentheses tells you which one to use. Pick the right form."
        items={[
          { pre: "Nosotros (ser)", post: "meseros.", a: "somos", o: SER },
          { pre: "Ellos (estar)", post: "en la calle.", a: "están", o: ESTAR },
          { pre: "Tú (estar)", post: "en la universidad.", a: "estás", o: ESTAR },
          { pre: "Él (ser)", post: "ingeniero.", a: "es", o: SER },
          { pre: "Yo (estar)", post: "en la escuela.", a: "estoy", o: ESTAR },
          { pre: "Ella (estar)", post: "en clases.", a: "está", o: ESTAR },
          { pre: "Ellos (ser)", post: "de Canadá.", a: "son", o: SER },
          { pre: "Nosotros (estar)", post: "en la casa.", a: "estamos", o: ESTAR },
        ]}
      />
      <Typed
        id="conj3"
        title="Write the form"
        items={[
          { pre: "Mía", post: "en clases. (estar)", a: ["está"] },
          { pre: "Tammy y Michael", post: "de Canadá. (ser)", a: ["son"] },
          { pre: "Tú", post: "en la universidad. (estar)", a: ["estás"] },
          { pre: "Michael y yo", post: "amigos. (ser)", a: ["somos"] },
          { pre: "Yo", post: "en la casa. (estar)", a: ["estoy"] },
        ]}
      />
      <Choice
        id="conj4"
        title="Choose the correct sentence"
        items={[
          { q: "We are at home.", o: ["Nosotros estamos en la casa.", "Nosotros somos en la casa.", "Nosotros están en la casa."], a: "Nosotros estamos en la casa.", why: "Location → estar, and nosotros → estamos.", say: "Nosotros estamos en la casa" },
          { q: "They are engineers.", o: ["Ellos son ingenieros.", "Ellos están ingenieros.", "Ellos somos ingenieros."], a: "Ellos son ingenieros.", why: "Profession → ser, and ellos → son.", say: "Ellos son ingenieros" },
          { q: "You (tú) are at the university.", o: ["Tú estás en la universidad.", "Tú eres en la universidad.", "Tú está en la universidad."], a: "Tú estás en la universidad.", why: "Location → estar, and tú → estás (with the accent).", say: "Tú estás en la universidad" },
          { q: "Which is the 'she' form of estar?", o: ["está", "es", "estás"], a: "está", why: "Ella está. Careful: ella es is the form of ser.", say: "ella está" },
        ]}
      />
      <Teacher>The accent marks (estás, está, están) are the most common writing error. Notice that "está" and "estás" differ by one letter but have different subjects. Use the names from class (Maikol, Morgan, Mía, Tammy and Michael) in oral drills before the written work.</Teacher>
    </>
  );
}

function PUbic() {
  const s = SECS[1];
  const places = [["la escuela", "🏫"], ["la universidad", "🎓"], ["las clases", "📚"], ["la casa", "🏠"], ["la calle", "🛣️"], ["el parque", "🌳"], ["el supermercado", "🛒"]];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>Places</h3>
        <div className="grid g4">
          {places.map(([p, e]) => (
            <button key={p} className="tile" onClick={() => speak(p)}>
              <span style={{ fontSize: 28 }}>{e}</span>
              <b>{p}</b>
            </button>
          ))}
        </div>
        <p className="sub" style={{ marginTop: 10 }}>The last two (el parque, el supermercado) are new. Where someone is = <b>estar</b> + <b>en</b> + place.</p>
        <div className="note" style={{ marginTop: 8 }}><b>Ella está en su casa.</b> "Su casa" can mean his, her or their house. Context tells you which.</div>
      </div>

      <Match
        id="ubic1"
        title="Match the sentence with its meaning"
        pairs={[
          ["Yo estoy en la escuela", "I'm at school"],
          ["Tú estás en la universidad", "You're at the university"],
          ["Ella está en clases", "She's in class"],
          ["Nosotros estamos en la casa", "We're at home"],
          ["Ellos están en la calle", "They're in the street"],
          ["Ella está en su casa", "She's at her house"],
        ]}
      />
      <Gaps
        id="ubic2"
        title="Where are they?"
        instr="Look at the picture and pick the form of estar."
        items={[
          { pre: "🏠 Nosotros", post: "en la casa.", a: "estamos", o: ESTAR },
          { pre: "🎓 Tú", post: "en la universidad.", a: "estás", o: ESTAR },
          { pre: "🌳 Mía", post: "en el parque.", a: "está", o: ESTAR },
          { pre: "🛒 Tammy y Michael", post: "en el supermercado.", a: "están", o: ESTAR },
          { pre: "🏫 Yo", post: "en la escuela.", a: "estoy", o: ESTAR },
        ]}
      />
      <WordOrder id="ubic3" title="Build the sentence" sentences={["Yo estoy en la escuela", "Ellos están en la calle", "¿Dónde estás?", "Nosotros estamos en la casa"]} />
      <OpenQA id="ubic4" title="Answer about you" items={[{ q: "¿Dónde estás ahora?", m: "Estoy en la casa." }, { q: "¿Dónde está tu familia?", m: "Mi familia está en Estados Unidos." }]} />
      <Teacher>Don't let "ser en" slip through: "Yo soy en la casa" is the typical error for English speakers, because "I am at home" uses the same verb as "I am a teacher". Run a drill where you point to a place on a picture and she answers ¿Dónde estás? in the first person.</Teacher>
    </>
  );
}

function POrig() {
  const s = SECS[2];
  const c = [["ve", "Venezuela", "venezolano / venezolana"], ["us", "Estados Unidos", "estadounidense"], ["ca", "Canadá", "canadiense"], ["mx", "México", "mexicano / mexicana"], ["co", "Colombia", "colombiano / colombiana"], ["cl", "Chile", "chileno / chilena"]];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>Countries and nationalities</h3>
        <div className="grid g3">
          {c.map(([f, n, nat]) => (
            <div className="row card" key={n} style={{ padding: 10 }}>
              <Flag code={f} />
              <div><b>{n}</b><div className="sub" style={{ margin: 0 }}>{nat}</div></div>
              <div style={{ marginLeft: "auto" }}><Speak text={`${n}. ${nat}`} /></div>
            </div>
          ))}
        </div>
        <div className="grid g3" style={{ marginTop: 12 }}>
          <div className="note"><b>¿De dónde eres?</b><br />Soy de Venezuela.</div>
          <div className="note"><b>¿De dónde es?</b><br />Es de Canadá.</div>
          <div className="note"><b>¿De dónde son?</b><br />Son de Estados Unidos.</div>
        </div>
      </div>

      <Match id="orig1" title="Country ↔ nationality (masculine)" pairs={[["Venezuela", "venezolano"], ["Canadá", "canadiense"], ["Estados Unidos", "estadounidense"], ["México", "mexicano"], ["Colombia", "colombiano"], ["Chile", "chileno"]]} />
      <Gaps
        id="orig2"
        title="Man or woman?"
        instr="Choose the nationality that agrees with the person."
        items={[
          { pre: "Maikol es de Venezuela. Él es", post: ".", a: "venezolano", o: ["venezolano", "venezolana"] },
          { pre: "Mía es de Venezuela. Ella es", post: ".", a: "venezolana", o: ["venezolano", "venezolana"] },
          { pre: "Tammy es de Canadá. Ella es", post: ".", a: "canadiense", o: ["canadiense", "canadiensa"] },
          { pre: "Michael es de Estados Unidos. Él es", post: ".", a: "estadounidense", o: ["estadounidense", "estadounidensa"] },
          { pre: "Morgan es de México. Ella es", post: ".", a: "mexicana", o: ["mexicana", "mexicano"] },
        ]}
      />
      <Choice
        id="orig3"
        title="Ask the right question"
        items={[
          { q: "How do you ask 'Where is she from?'", o: ["¿De dónde es?", "¿De dónde eres?", "¿De dónde son?"], a: "¿De dónde es?", why: "Ella → es.", say: "¿De dónde es?" },
          { q: "How do you ask 'Where are they from?'", o: ["¿De dónde son?", "¿De dónde es?", "¿Dónde están?"], a: "¿De dónde son?", why: "Ellos → son.", say: "¿De dónde son?" },
          { q: "How do you ask a friend (tú) 'Where are you from?'", o: ["¿De dónde eres?", "¿De dónde estás?", "¿De dónde soy?"], a: "¿De dónde eres?", why: "Origin → ser. Never 'de dónde estás'.", say: "¿De dónde eres?" },
          { q: "Which sentence is correct?", o: ["Yo soy de Estados Unidos.", "Yo estoy de Estados Unidos.", "Yo soy en Estados Unidos."], a: "Yo soy de Estados Unidos.", why: "Origin = ser + de.", say: "Yo soy de Estados Unidos" },
        ]}
      />
      <OpenQA id="orig4" title="Answer about you" items={[{ q: "¿De dónde eres?", m: "Soy de Estados Unidos. Soy estadounidense." }, { q: "¿De dónde es tu esposo?", m: "Mi esposo es de Chile. Es chileno." }]} />
      <Teacher>Distinguish "ser de" (origin) from "estar en" (current place). Good contrast: "Soy de Venezuela pero estoy en Chile." Keep nationalities singular and lowercase.</Teacher>
    </>
  );
}

function PPers() {
  const s = SECS[3];
  const groups = [
    [["inteligente", "smart"], ["generoso", "generous"], ["tímido", "shy"], ["optimista", "optimistic"], ["trabajador", "hard-working"]],
    [["sincero", "sincere"], ["paciente", "patient"], ["egoísta", "selfish"], ["simpático", "sympathetic / nice"], ["responsable", "responsible"]],
    [["rebelde", "rebel"], ["cariñoso", "caring"], ["valiente", "brave"], ["tranquilo", "calm"], ["antipático", "rude"]],
    [["creativo", "creative"], ["ambicioso", "ambitious"], ["distraído", "distracted"], ["celoso", "jealous"], ["sociable", "social"]],
  ];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>Vocabulary bank</h3>
        <VocabBank groups={groups} />
        <div className="note" style={{ marginTop: 12 }}><b>Agreement:</b> adjectives ending in <b>-o</b> change to <b>-a</b> for a woman (tímido → tímida). Adjectives ending in <b>-e</b>, <b>-ista</b> or a consonant stay the same (paciente, egoísta, sociable).</div>
      </div>

      <Match id="pers1" title="Spanish ↔ English" pairs={[["tímido", "shy"], ["generoso", "generous"], ["trabajador", "hard-working"], ["egoísta", "selfish"], ["valiente", "brave"], ["tranquilo", "calm"], ["celoso", "jealous"], ["distraído", "distracted"]]} />
      <Match id="pers2" title="Opposites" instr="Match each adjective with its opposite." pairs={[["simpático", "antipático"], ["generoso", "egoísta"], ["tímido", "sociable"], ["distraído", "responsable"]]} />
      <Gaps
        id="pers3"
        title="Who is it?"
        instr="Read the clue in English and choose the right adjective. Watch masculine / feminine."
        items={[
          { pre: "Michael es muy", post: ".", clue: "Michael always shares his things.", a: "generoso", o: ["generoso", "egoísta", "tímido"] },
          { pre: "Tammy es muy", post: ".", clue: "Tammy never gets angry while waiting.", a: "paciente", o: ["paciente", "celosa", "distraída"] },
          { pre: "Morgan es muy", post: ".", clue: "Morgan doesn't like to talk to new people (she).", a: "tímida", o: ["tímida", "tímido", "sociable"] },
          { pre: "Maikol es", post: ".", clue: "Maikol only thinks about himself.", a: "egoísta", o: ["egoísta", "generoso", "cariñoso"] },
          { pre: "Mía es muy", post: ".", clue: "Mía loves to hug her family (she).", a: "cariñosa", o: ["cariñosa", "antipática", "distraído"] },
          { pre: "Ellos son", post: ".", clue: "They are never afraid (plural).", a: "valientes", o: ["valientes", "celosos", "tímidas"] },
        ]}
      />
      <OpenQA id="pers4" title="Describe yourself" items={[{ q: "¿Cómo eres? Use three adjectives.", m: "Soy paciente, creativo y trabajador. (Women: creativa, trabajadora.)" }, { q: "¿Cómo es tu mejor amigo o amiga?", m: "Mi mejor amiga es simpática y muy sociable." }]} />
      <Teacher>Personality adjectives with ser describe stable character. Introduce the contrast later: "Maikol es tranquilo" (he's a calm person) vs. "Maikol está tranquilo" (he's calm right now). That's covered on the ¿Ser o estar? page.</Teacher>
    </>
  );
}

function PFis() {
  const s = SECS[4];
  const groups = [
    [["alto", "tall"], ["bajo", "short"], ["delgado / flaco", "thin"], ["fuerte", "strong"], ["pelirrubio", "blonde"]],
    [["pelicastaño", "brown hair"], ["pelirrojo", "red hair"], ["pelirrizado", "curly hair"], ["peliliso", "straight hair"], ["calvo", "bald"]],
    [["feo", "ugly"], ["mediano", "average"], ["joven / menor", "younger"], ["mayor", "older"]],
    [["guapo / hermoso / bonito", "handsome / beautiful / pretty"], ["elegante", "elegant"], ["relleno", "chubby"], ["atlético", "athletic"]],
  ];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>Vocabulary bank</h3>
        <VocabBank groups={groups} />
        <p className="sub" style={{ marginTop: 10 }}>Question: <b>¿Cómo luce?</b> (one person) · <b>¿Cómo lucen?</b> (several). Answer with <b>ser</b>: "Ella es alta y pelirroja."</p>
      </div>

      <Match id="fis1" big title="Match the picture" pairs={[["👱", "pelirrubio"], ["🧑‍🦰", "pelirrojo"], ["🧑‍🦱", "pelirrizado"], ["🧑‍🦲", "calvo"], ["👴", "mayor"], ["🧒", "joven"]]} />
      <Match id="fis2" title="Spanish ↔ English" pairs={[["alto", "tall"], ["bajo", "short"], ["delgado", "thin"], ["fuerte", "strong"], ["elegante", "elegant"], ["atlético", "athletic"], ["bonito", "pretty"], ["mediano", "average"]]} />
      <Choice
        id="fis3"
        title="Opposites"
        items={[
          { q: "The opposite of alto is…", o: ["bajo", "fuerte", "delgado"], a: "bajo", why: "Alto ↔ bajo.", say: "alto. bajo" },
          { q: "The opposite of joven is…", o: ["mayor", "bajo", "calvo"], a: "mayor", why: "Joven ↔ mayor.", say: "joven. mayor" },
          { q: "The opposite of guapo is…", o: ["feo", "mayor", "elegante"], a: "feo", why: "Guapo ↔ feo.", say: "guapo. feo" },
        ]}
      />
      <Gaps
        id="fis4"
        title="Describe them"
        instr="Choose the adjective that matches the clue."
        items={[
          { pre: "Michael es", post: ".", clue: "Michael has no hair.", a: "calvo", o: ["calvo", "pelirrojo", "peliliso"] },
          { pre: "Tammy es", post: ".", clue: "Tammy has blond hair.", a: "pelirrubia", o: ["pelirrubia", "pelirrubio", "pelirroja"] },
          { pre: "Mía es", post: ".", clue: "Mía has curly hair.", a: "pelirrizada", o: ["pelirrizada", "pelirrizado", "peliliso"] },
          { pre: "Maikol es", post: ".", clue: "Maikol has straight hair.", a: "peliliso", o: ["peliliso", "pelirrojo", "pelirrizado"] },
          { pre: "Morgan es muy", post: ".", clue: "Morgan is very tall (she).", a: "alta", o: ["alta", "alto", "baja"] },
        ]}
      />
      <OpenQA id="fis5" title="Describe people" items={[{ q: "¿Cómo luces tú?", m: "Soy alta y pelicastaña. (Men: alto y pelicastaño.)" }, { q: "¿Cómo luce tu esposo?", m: "Mi esposo es alto y atlético." }]} />
      <Teacher>The map's hair words (pelirrubio, pelirrojo, pelirrizado, peliliso, pelicastaño) are compound words: pelo + color/type. Acknowledge that "pelirrubio" is formal-natural but "rubio" is more common in everyday speech. Be careful with sensitive adjectives (feo, relleno, calvo): practice on cartoon characters rather than classmates.</Teacher>
    </>
  );
}

function PProf() {
  const s = SECS[5];
  const jobs = [["cuidador / cuidadora", "caregiver", "🤝"], ["ingeniero / ingeniera", "engineer", "👷"], ["chef", "chef", "🧑‍🍳"], ["entrenador / entrenadora", "trainer, coach", "🏋️"], ["mesero / mesera", "waiter / waitress", "🍽️"], ["limpiador / limpiadora", "cleaner", "🧹"]];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>Professions</h3>
        <div className="grid g3">
          {jobs.map(([es, en, e]) => (
            <button key={es} className="tile" onClick={() => speak(es)}>
              <span style={{ fontSize: 28 }}>{e}</span>
              <b>{es}</b>
              <span>{en}</span>
            </button>
          ))}
        </div>
        <div className="grid g2" style={{ marginTop: 12 }}>
          <div className="note"><b>-o → -a</b> and <b>-or → -ora</b> for women. <b>Chef</b> doesn't change.</div>
          <div className="trap"><b>No "un / una"!</b> Say "Soy ingeniero", not "Soy un ingeniero", when you just state the job.</div>
        </div>
        <p className="sub" style={{ marginTop: 10 }}>Question: <b>¿A qué te dedicas?</b> / <b>¿A qué se dedica?</b></p>
      </div>

      <Match id="prof1" big title="Match the picture" pairs={[["👷", "ingeniero"], ["🧑‍🍳", "chef"], ["🏋️", "entrenador"], ["🍽️", "mesero"], ["🧹", "limpiador"], ["🤝", "cuidador"]]} />
      <Gaps
        id="prof2"
        title="Masculine or feminine?"
        items={[
          { pre: "Yo soy", post: ".", clue: "You are a woman and an engineer.", a: "ingeniera", o: ["ingeniera", "ingeniero"] },
          { pre: "Él es", post: ".", clue: "He is a trainer.", a: "entrenador", o: ["entrenador", "entrenadora"] },
          { pre: "Ella es", post: ".", clue: "She is a chef.", a: "chef", o: ["chef", "chefa", "chefo"] },
          { pre: "Nosotros somos", post: ".", clue: "We (men) are waiters.", a: "meseros", o: ["meseros", "meseras", "mesero"] },
          { pre: "Ellas son", post: ".", clue: "They (women) are cleaners.", a: "limpiadoras", o: ["limpiadoras", "limpiadores", "limpiadora"] },
          { pre: "Yo soy", post: ".", clue: "You are a woman and a caregiver.", a: "cuidadora", o: ["cuidadora", "cuidador"] },
        ]}
      />
      <WordOrder id="prof3" title="Build the sentence" sentences={["Yo soy ingeniero", "Ella es chef", "Nosotros somos meseros", "¿A qué te dedicas?"]} />
      <Choice
        id="prof4"
        title="Choose the correct sentence"
        items={[
          { q: "He is a trainer.", o: ["Él es entrenador.", "Él es un entrenador.", "Él está entrenador."], a: "Él es entrenador.", why: "Profession → ser, and no article when you only state the job.", say: "Él es entrenador" },
          { q: "She is a chef.", o: ["Ella es chef.", "Ella está chef.", "Ella es una chef."], a: "Ella es chef.", why: "Ser, no article.", say: "Ella es chef" },
          { q: "They are cleaners.", o: ["Ellos son limpiadores.", "Ellos están limpiadores.", "Ellos somos limpiadores."], a: "Ellos son limpiadores.", why: "Ser + plural form.", say: "Ellos son limpiadores" },
        ]}
      />
      <OpenQA id="prof5" title="Answer about you" items={[{ q: "¿A qué te dedicas?", m: "Soy ___. (For example: Soy ingeniera.)" }, { q: "¿A qué se dedica tu esposo?", m: "Mi esposo es ___." }]} />
      <Teacher>The map says "Yo soy cuidadora" and "Yo soy ingeniero": a nice chance to show how the ending reveals the speaker's gender. Optional extension: "Yo trabajo en…" (not required in this unit).</Teacher>
    </>
  );
}

function PMix() {
  const s = SECS[6];
  const feel = [["feliz", "happy"], ["cansado", "tired"], ["triste", "sad"], ["enojado", "angry"], ["ocupado", "busy"], ["enfermo", "sick"]];
  return (
    <>
      <Hero s={s} />
      <div className="ref" style={{ "--c": s.c }}>
        <h3>The contrast</h3>
        <div className="grid g2">
          <div className="card"><b style={{ fontFamily: "Georgia,serif", fontSize: 20 }}>SER</b><div className="sub">Who or what someone <i>is</i>: origin, profession, personality, looks.</div><div style={{ marginTop: 6 }}>Ella <b>es</b> de Canadá. Él <b>es</b> ingeniero.</div></div>
          <div className="card"><b style={{ fontFamily: "Georgia,serif", fontSize: 20 }}>ESTAR</b><div className="sub">Where someone <i>is</i>, and how they are right now.</div><div style={{ marginTop: 6 }}>Ella <b>está</b> en clases. Él <b>está</b> cansado.</div></div>
        </div>
      </div>

      <Sort
        id="mix1"
        title="Sort the sentences"
        cards={[
          { t: "Yo ___ de Canadá.", b: "SER", v: "soy" },
          { t: "Ella ___ en la escuela.", b: "ESTAR", v: "está" },
          { t: "Él ___ ingeniero.", b: "SER", v: "es" },
          { t: "Ellos ___ simpáticos.", b: "SER", v: "son" },
          { t: "Tú ___ en la calle.", b: "ESTAR", v: "estás" },
          { t: "Mía ___ pelirroja.", b: "SER", v: "es" },
          { t: "Nosotros ___ en la universidad.", b: "ESTAR", v: "estamos" },
          { t: "Yo ___ valiente.", b: "SER", v: "soy" },
        ]}
        buckets={["SER", "ESTAR"]}
      />
      <Gaps
        id="mix2"
        title="Ser or estar?"
        items={[
          { pre: "Tammy", post: "de Canadá.", a: "es", o: ["es", "está"] },
          { pre: "Michael", post: "en la calle.", a: "está", o: ["es", "está"] },
          { pre: "Morgan", post: "ingeniera.", a: "es", o: ["es", "está"] },
          { pre: "Nosotros", post: "en la casa.", a: "estamos", o: ["estamos", "somos"] },
          { pre: "Ellos", post: "muy simpáticos.", a: "son", o: ["son", "están"] },
          { pre: "Yo", post: "en la universidad.", a: "estoy", o: ["estoy", "soy"] },
          { pre: "Mía", post: "muy alta.", a: "es", o: ["es", "está"] },
          { pre: "Tú", post: "de Colombia.", a: "eres", o: ["eres", "estás"] },
        ]}
      />
      <Choice
        id="mix3"
        title="Find the correct sentence"
        items={[
          { q: "Which sentence is correct?", o: ["Yo soy en la escuela.", "Yo estoy en la escuela.", "Yo estoy de Venezuela."], a: "Yo estoy en la escuela.", why: "Location → estar. Origin → ser.", say: "Yo estoy en la escuela" },
          { q: "Which sentence is correct?", o: ["Ella está ingeniera.", "Ella es en clases.", "Ella es ingeniera."], a: "Ella es ingeniera.", why: "Profession → ser.", say: "Ella es ingeniera" },
          { q: "Which sentence is correct?", o: ["Ellos son en la calle.", "Ellos están en la calle.", "Ellos somos en la calle."], a: "Ellos están en la calle.", why: "Location → estar.", say: "Ellos están en la calle" },
          { q: "Which sentence is correct?", o: ["Nosotros somos de Chile.", "Nosotros estamos de Chile.", "Nosotros somos en Chile."], a: "Nosotros somos de Chile.", why: "Origin → ser + de.", say: "Nosotros somos de Chile" },
        ]}
      />

      <div className="note"><b>New: estar also describes feelings and states.</b> This goes beyond the class map, but it's the other half of the contrast.</div>
      <Match id="mix4" title="Feelings ↔ English" pairs={feel} />
      <Gaps
        id="mix5"
        title="How are they right now?"
        items={[
          { pre: "Maikol", post: "cansado.", a: "está", o: ["es", "está"] },
          { pre: "Yo", post: "muy feliz.", a: "estoy", o: ["soy", "estoy"] },
          { pre: "Tú", post: "ocupado hoy.", a: "estás", o: ["eres", "estás"] },
          { pre: "Ellos", post: "tristes.", a: "están", o: ["son", "están"] },
        ]}
      />
      <Choice
        id="mix6"
        title="Same adjective, different meaning"
        items={[
          { q: "'Maikol es tranquilo' means…", o: ["Maikol is a calm person.", "Maikol is calm right now."], a: "Maikol is a calm person.", why: "Ser = permanent character.", say: "Maikol es tranquilo" },
          { q: "'Maikol está tranquilo' means…", o: ["Maikol is calm right now.", "Maikol is a calm person."], a: "Maikol is calm right now.", why: "Estar = state at this moment.", say: "Maikol está tranquilo" },
          { q: "How do you say 'Mía is tired today'?", o: ["Mía está cansada hoy.", "Mía es cansada hoy.", "Mía están cansada hoy."], a: "Mía está cansada hoy.", why: "A temporary state → estar.", say: "Mía está cansada hoy" },
        ]}
      />
      <Teacher>Here you can introduce the common memory aids if she asks: DOCTOR for ser (Description, Occupation, Characteristic, Time, Origin, Relationship) and PLACE for estar (Position, Location, Action, Condition, Emotion). Keep it as a bonus: the map's categories are enough for Intro. The feelings block is outside the class map: use it only if the group is ready.</Teacher>
    </>
  );
}

function PFin() {
  const s = SECS[7];
  const text = "Hola, me llamo Morgan. Soy de México y soy ingeniera. Soy muy responsable. Ahora estoy en la universidad con mi amiga Mía. Ella es de Venezuela y es muy simpática. Hoy Mía está cansada.";
  const passage = (
    <div className="note" style={{ marginBottom: 12, fontSize: 16 }}>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div>{text}</div>
        <Speak text={text} />
      </div>
    </div>
  );
  return (
    <>
      <Hero s={s} />
      <Choice
        id="fin1"
        title="Reading"
        instr="Read (or listen to) the text, then answer."
        passage={passage}
        items={[
          { q: "¿De dónde es Morgan?", o: ["De México", "De Venezuela", "De Canadá"], a: "De México", why: "'Soy de México.'" },
          { q: "¿A qué se dedica Morgan?", o: ["Es ingeniera", "Es chef", "Es entrenadora"], a: "Es ingeniera", why: "'Soy ingeniera.'" },
          { q: "¿Dónde está Morgan ahora?", o: ["En la universidad", "En el parque", "En la casa"], a: "En la universidad", why: "'Ahora estoy en la universidad.'" },
          { q: "¿Cómo es Mía?", o: ["Simpática", "Tímida", "Egoísta"], a: "Simpática", why: "'Es muy simpática.'" },
          { q: "¿Cómo está Mía hoy?", o: ["Cansada", "Feliz", "Ocupada"], a: "Cansada", why: "'Hoy Mía está cansada.'" },
        ]}
      />
      <Choice
        id="fin2"
        title="Mixed review"
        items={[
          { q: "Tú ___ de Colombia.", o: ["eres", "estás", "es"], a: "eres", why: "Origin → ser.", say: "Tú eres de Colombia" },
          { q: "Nosotros ___ en la casa.", o: ["estamos", "somos", "están"], a: "estamos", why: "Location → estar.", say: "Nosotros estamos en la casa" },
          { q: "Ella es ___. (she is a waitress)", o: ["mesera", "mesero", "meseros"], a: "mesera", why: "A woman → -a.", say: "Ella es mesera" },
          { q: "Michael es ___. (he is generous)", o: ["generoso", "generosa", "egoísta"], a: "generoso", why: "A man → -o.", say: "Michael es generoso" },
          { q: "Ellos ___ en la calle.", o: ["están", "son", "estamos"], a: "están", why: "Location → estar.", say: "Ellos están en la calle" },
          { q: "How do you ask 'What do you do?' (tú)", o: ["¿A qué te dedicas?", "¿De dónde eres?", "¿Dónde estás?"], a: "¿A qué te dedicas?", why: "Professions: ¿A qué te dedicas?", say: "¿A qué te dedicas?" },
        ]}
      />
      <WordOrder id="fin3" title="Build the sentence" sentences={["Ella es de Venezuela", "Tú estás en la universidad", "Ellos son meseros", "Maikol está en la casa"]} />
      <OpenQA
        id="fin4"
        title="Write about yourself"
        instr="Answer in complete sentences. Then compare with the models."
        items={[
          { q: "¿Cómo te llamas?", m: "Me llamo ___." },
          { q: "¿De dónde eres?", m: "Soy de Estados Unidos. Soy estadounidense." },
          { q: "¿A qué te dedicas?", m: "Soy ___." },
          { q: "¿Cómo eres?", m: "Soy paciente y muy simpática." },
          { q: "¿Dónde estás ahora?", m: "Estoy en la casa." },
        ]}
      />
      <Teacher>Final task: she gives a 45-second spoken self-introduction using at least one example of each branch (origin, profession, personality, physical, location). Record it as a voice note and give feedback on two things only: the ser/estar choice and the accent in estás/está.</Teacher>
    </>
  );
}

/* ------------------------- app shell ------------------------- */

export default function App() {
  const [page, setPage] = useState(0);
  const [teacher, setTeacher] = useState(false);
  const [results, setResults] = useState({});
  const report = (id, s, t, scored = true) => setResults((r) => ({ ...r, [id]: { s, t, scored } }));

  const pages = [
    { t: "Home", c: "#9B8CFF", node: <Home go={(n) => go(n)} /> },
    { t: "Conjugación", c: SECS[0].c, node: <PConj /> },
    { t: "Ubicaciones", c: SECS[1].c, node: <PUbic /> },
    { t: "Orígenes", c: SECS[2].c, node: <POrig /> },
    { t: "Personalidad", c: SECS[3].c, node: <PPers /> },
    { t: "Físico", c: SECS[4].c, node: <PFis /> },
    { t: "Profesión", c: SECS[5].c, node: <PProf /> },
    { t: "¿Ser o estar?", c: SECS[6].c, node: <PMix /> },
    { t: "Desafío final", c: "#1E1B33", node: <PFin /> },
  ];

  const go = (n) => {
    setPage(Math.max(0, Math.min(pages.length - 1, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const doneCount = ALL_IDS.filter((i) => results[i]).length;

  return (
    <WB.Provider value={{ results, report, teacher }}>
      <div className="app">
        <style>{CSS}</style>
        <div className="top">
          <div className="top-in">
            <div className="brand">Ser y estar · Workbook</div>
            <div className="bar" aria-label="Overall progress"><i style={{ width: `${(doneCount / ALL_IDS.length) * 100}%` }} /></div>
            <span style={{ fontSize: 13, color: "var(--soft)" }}>{doneCount} / {ALL_IDS.length}</span>
            <button className={"toggle " + (teacher ? "on" : "")} onClick={() => setTeacher(!teacher)}>{teacher ? "Teacher mode: on" : "Teacher mode"}</button>
          </div>
        </div>

        <div className="wrap" key={page}>{pages[page].node}</div>

        <div className="nav">
          <div className="nav-in">
            <button className="btn ghost" onClick={() => go(page - 1)} disabled={page === 0}>← Back</button>
            <div className="dots">
              {pages.map((p, i) => (
                <button key={p.t} className={"dot " + (i === page ? "cur" : "")} style={{ background: p.c }} onClick={() => go(i)} aria-label={`Go to ${p.t}`} title={p.t} />
              ))}
            </div>
            <button className="btn" onClick={() => go(page + 1)} disabled={page === pages.length - 1}>Next →</button>
          </div>
        </div>
      </div>
    </WB.Provider>
  );
}