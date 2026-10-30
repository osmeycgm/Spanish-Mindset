import React, { useState, useMemo } from "react";

/* =====================================================================
   SPANISH FOR ENGLISH SPEAKERS — UNIT 2: "¿Qué es esto?"
   Modeled on Interchange Intro, Unit 2 ("What's this?"):
   names of everyday things · articles · plurals · this/that ·
   classroom language · where things are.
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
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ------------------------- styles ------------------------- */

const CSS = `
:root{
  --paper:#F4F8F8; --card:#FFFFFF; --ink:#0E2A2F; --soft:#56707A; --line:#D5E2E4;
  --acc:#0B7A75; --acc-d:#075C58; --acc-l:#DDF3F1; --sun:#FFB627; --sun-l:#FFF1D0;
  --ok:#12805C; --ok-l:#DDF5EA; --bad:#C62D3A; --bad-l:#FDE6E7;
  --m:#1D6FD1; --m-l:#E3EEFB; --f:#C2185B; --f-l:#FCE4EE;
}
*{box-sizing:border-box}body{margin:0}
.app{min-height:100vh;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
.wrap{max-width:940px;margin:0 auto;padding:0 18px 130px}
.top{position:sticky;top:0;z-index:20;background:rgba(244,248,248,.95);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top-in{max-width:940px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-family:Georgia,serif;font-weight:700;font-size:18px}
.brand span{color:var(--acc)}
.bar{flex:1;min-width:110px;height:8px;background:var(--line);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--acc);transition:width .35s}
.toggle{border:1.5px solid var(--ink);background:transparent;color:var(--ink);padding:6px 12px;border-radius:99px;font-size:13px;cursor:pointer;font-weight:600}
.toggle.on{background:var(--ink);color:#fff}
h1,h2,h3{font-family:Georgia,"Times New Roman",serif;margin:0}
.pagehead{padding:34px 0 8px}
.pagehead .es{font-size:clamp(34px,7vw,60px);line-height:1.05;letter-spacing:-.02em;font-weight:700}
.pagehead .en{font-size:18px;color:var(--soft);margin-top:6px}
.sec{margin:26px 0}
.sec > h3{font-size:22px;margin-bottom:4px}
.sub{color:var(--soft);font-size:15px;margin:0 0 14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px}
.grid{display:grid;gap:12px}
.g2{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.btn{border:0;background:var(--acc);color:#fff;padding:10px 18px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer}
.btn:hover{background:var(--acc-d)}.btn:disabled{opacity:.4;cursor:default}
.btn.ghost{background:var(--acc-l);color:var(--acc-d)}
.btn.sm{padding:5px 10px;font-size:13px;border-radius:8px}
.spk{border:0;background:var(--acc-l);color:var(--acc-d);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:15px;flex:none}
.spk:hover{background:var(--acc);color:#fff}
.note{border-left:5px solid var(--sun);background:var(--sun-l);padding:12px 14px;border-radius:0 10px 10px 0;font-size:15px}
.trap{border-left:5px solid var(--bad);background:var(--bad-l);padding:12px 14px;border-radius:0 10px 10px 0;font-size:15px}
.teach{border:2px dashed var(--ink);background:#fff;padding:12px 14px;border-radius:12px;font-size:14px;margin:18px 0}
.chip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);background:#fff;color:var(--ink);border-radius:99px;padding:6px 12px;cursor:pointer;font-size:15px;font-family:inherit}
.chip:hover{border-color:var(--acc)}
.chip.sel{background:var(--acc);color:#fff;border-color:var(--acc)}
.chip.ok{background:var(--ok-l);border-color:var(--ok);color:var(--ok)}
.chip.bad{background:var(--bad-l);border-color:var(--bad);color:var(--bad)}
.chip:disabled{cursor:default}
.opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.fb{margin-top:10px;font-size:14.5px}.fb.ok{color:var(--ok)}.fb.bad{color:var(--bad)}
.row{display:flex;align-items:center;gap:10px}
table{border-collapse:collapse;width:100%}
td,th{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:15px}
th{font-family:Georgia,serif;font-size:14px;color:var(--soft)}
.bubble{padding:10px 14px;border-radius:14px;max-width:560px;font-size:17px}
.line{display:flex;gap:10px;align-items:flex-start;margin:10px 0}.line.r{flex-direction:row-reverse}
.av{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:22px;flex:none}
.who{font-size:12px;color:var(--soft);margin-bottom:2px}
.en-line{font-size:14px;color:var(--soft);margin-top:4px}
.blur{filter:blur(5px);cursor:pointer;user-select:none}
.flip{perspective:800px;height:160px;cursor:pointer}
.flip-in{position:relative;width:100%;height:100%;transition:transform .45s;transform-style:preserve-3d}
.flip.on .flip-in{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;border:1px solid var(--line);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:8px;text-align:center}
.face.back{transform:rotateY(180deg);background:var(--acc);color:#fff;border-color:var(--acc);font-size:14px}
.big{font-family:Georgia,serif;font-weight:700;font-size:19px}
.art{display:inline-block;border-radius:6px;padding:0 7px;color:#fff;font-size:16px}
.art.m{background:var(--m)}.art.f{background:var(--f)}
.match{display:grid;grid-template-columns:1fr 1fr;gap:10px 18px}
.match .chip{width:100%;justify-content:center;border-radius:12px;padding:9px 10px;min-height:44px}
.syl{display:inline-block;padding:2px 8px;border-radius:8px;font-family:Georgia,serif;font-size:20px;font-weight:700}
.syl.st{background:var(--sun);}
.tile{border:1.5px solid var(--line);border-radius:12px;background:#fff;padding:10px;cursor:pointer;text-align:center;font-family:inherit;color:var(--ink);font-size:15px}
.tile:hover{border-color:var(--acc)}
.box{border:2px solid var(--line);border-radius:14px;background:#fff;padding:12px;text-align:center;cursor:pointer;font-family:inherit;color:var(--ink);font-size:16px}
.box:hover{border-color:var(--acc)}
.box.ok{border-color:var(--ok);background:var(--ok-l)}.box.bad{border-color:var(--bad);background:var(--bad-l)}
input[type=text]{width:100%;max-width:340px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font-size:17px;font-family:inherit}
input[type=text]:focus{outline:2px solid var(--acc);border-color:var(--acc)}
input.ok{border-color:var(--ok);background:var(--ok-l)}input.bad{border-color:var(--bad);background:var(--bad-l)}
.check{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;background:#fff;cursor:pointer;margin-bottom:8px}
.check.on{background:var(--ok-l);border-color:var(--ok)}
.cb{width:22px;height:22px;border:2px solid var(--ink);border-radius:6px;display:grid;place-items:center;flex:none;font-size:14px}
.check.on .cb{background:var(--ok);border-color:var(--ok);color:#fff}
.nav{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);z-index:30}
.nav-in{max-width:940px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:10px}
.dots{flex:1;display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.dot{width:11px;height:11px;border-radius:50%;border:0;background:var(--line);cursor:pointer;padding:0}
.dot.cur{background:var(--acc);transform:scale(1.35)}.dot.seen{background:var(--ink)}
:focus-visible{outline:3px solid var(--sun);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media (max-width:560px){.dots{display:none}.nav-in{justify-content:space-between}}
`;

/* ------------------------- small pieces ------------------------- */

function Speak({ text }) {
  return (
    <button className="spk" onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label={`Listen: ${text}`} title="Listen">🔊</button>
  );
}
function PageHead({ es, en }) {
  return <div className="pagehead"><div className="es">{es}</div><div className="en">{en}</div></div>;
}
function TeacherNote({ show, children }) {
  if (!show) return null;
  return <div className="teach"><b style={{ fontFamily: "Georgia,serif" }}>Teacher's note.</b> {children}</div>;
}
const Art = ({ a }) => <span className={"art " + (a === "la" || a === "las" ? "f" : "m")}>{a}</span>;

/* ------------------------- interactive engines ------------------------- */

function Quiz({ items, title }) {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const it = items[i];
  const pick = (o) => {
    if (sel !== null) return;
    setSel(o);
    if (o === it.a) setScore((s) => s + 1);
    if (it.say) speak(it.say);
  };
  const next = () => { if (i + 1 < items.length) { setI(i + 1); setSel(null); } else setDone(true); };
  const reset = () => { setI(0); setSel(null); setScore(0); setDone(false); };

  if (done)
    return (
      <div className="card">
        <h3>{title || "Quiz"}: {score} / {items.length}</h3>
        <p className="sub">{score === items.length ? "Perfect. ¡Muy bien!" : score >= items.length - 1 ? "Almost there. ¡Casi!" : "Good effort. Listen to each answer and try again."}</p>
        <button className="btn" onClick={reset}>Try again</button>
      </div>
    );
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>{title || "Quick check"}</b>
        <span className="sub" style={{ margin: 0 }}>{i + 1} of {items.length}</span>
      </div>
      <p style={{ fontSize: 19, margin: "12px 0 0" }}>{it.q}</p>
      <div className="opts">
        {it.o.map((o) => (
          <button key={o} className={"chip " + (sel === null ? "" : o === it.a ? "ok" : o === sel ? "bad" : "")} onClick={() => pick(o)}>{o}</button>
        ))}
      </div>
      {sel !== null && (
        <>
          <div className={"fb " + (sel === it.a ? "ok" : "bad")}><b>{sel === it.a ? "Correct. " : "Not quite. "}</b>{it.why}</div>
          <div style={{ marginTop: 12 }}><button className="btn sm" onClick={next}>{i + 1 < items.length ? "Next question" : "See score"}</button></div>
        </>
      )}
    </div>
  );
}

function WordOrder({ sentences, title }) {
  const [k, setK] = useState(0);
  const target = sentences[k];
  const words = useMemo(() => shuffle(target.split(" "), String(k)), [target, k]);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);
  const answer = built.map((b) => words[b]).join(" ");
  const right = answer === target;
  const next = () => { setK((k + 1) % sentences.length); setBuilt([]); setChecked(false); };
  return (
    <div className="card">
      <b>{title || "Build the sentence"}</b>
      <p className="sub" style={{ margin: "4px 0 10px" }}>Tap the words in the right order. Tap a word in your sentence to remove it.</p>
      <div className="opts" style={{ minHeight: 52, border: "1.5px dashed var(--line)", borderRadius: 12, padding: 8, marginTop: 0 }}>
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
        <button className="btn sm" disabled={built.length !== words.length || checked} onClick={() => { setChecked(true); if (right) speak(target); }}>Check</button>
        <button className="btn ghost sm" onClick={() => { setBuilt([]); setChecked(false); }}>Clear</button>
        {checked && <button className="btn ghost sm" onClick={next}>Next sentence</button>}
        {checked && <span className={"fb " + (right ? "ok" : "bad")} style={{ margin: 0 }}>{right ? "Correct. ¡Perfecto!" : `Not yet. Answer: ${target}`}</span>}
      </div>
    </div>
  );
}

function Match({ title, pairs, big }) {
  const rights = useMemo(() => shuffle(pairs.map((p) => p[1]), title), [pairs, title]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState({});
  const [miss, setMiss] = useState(0);
  const [flash, setFlash] = useState(null);
  const used = Object.values(done);
  const finished = Object.keys(done).length === pairs.length;
  const pickRight = (r) => {
    if (sel === null || used.includes(r)) return;
    if (pairs[sel][1] === r) { setDone({ ...done, [sel]: r }); setSel(null); }
    else { setMiss(miss + 1); setFlash(r); setTimeout(() => setFlash(null), 500); }
  };
  return (
    <div className="card">
      <b>{title}</b>
      <p className="sub" style={{ margin: "4px 0 10px" }}>Tap one on the left, then its partner on the right.</p>
      <div className="match">
        <div className="grid" style={{ gap: 10 }}>
          {pairs.map((p, i) => (
            <button key={p[0]} className={"chip " + (done[i] !== undefined ? "ok" : sel === i ? "sel" : "")} style={big ? { fontSize: 28 } : {}} disabled={done[i] !== undefined} onClick={() => { setSel(i); if (!big) speak(p[0]); }}>{p[0]}</button>
          ))}
        </div>
        <div className="grid" style={{ gap: 10 }}>
          {rights.map((r) => (
            <button key={r} className={"chip " + (used.includes(r) ? "ok" : flash === r ? "bad" : "")} disabled={used.includes(r)} onClick={() => { pickRight(r); }}>{r}</button>
          ))}
        </div>
      </div>
      {finished && (
        <div className="row" style={{ marginTop: 12 }}>
          <span className={"fb " + (miss === 0 ? "ok" : "")} style={{ margin: 0 }}>{miss === 0 ? "Perfect. ¡Muy bien!" : `Done, with ${miss} mistake${miss > 1 ? "s" : ""}.`}</span>
          <button className="btn ghost sm" onClick={() => { setSel(null); setDone({}); setMiss(0); }}>Try again</button>
        </div>
      )}
    </div>
  );
}

function TypedList({ title, instr, items }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const res = items.map((it, i) => {
    const v = ans[i] || "";
    return strict(v) === strict(it[1]) ? "ok" : loose(v) === loose(it[1]) ? "accent" : "bad";
  });
  const score = res.filter((r) => r !== "bad").length;
  const all = items.every((_, i) => (ans[i] || "").trim());
  return (
    <div className="card">
      <b>{title}</b>
      <p className="sub" style={{ margin: "4px 0 10px" }}>{instr}</p>
      {items.map((it, i) => (
        <div key={i} className="row" style={{ flexWrap: "wrap", padding: "7px 0", borderBottom: "1px dashed var(--line)" }}>
          <span style={{ minWidth: 130, fontSize: 18 }}>{it[0]} →</span>
          <input type="text" className={checked ? (res[i] === "bad" ? "bad" : "ok") : ""} disabled={checked} value={ans[i] || ""} onChange={(e) => setAns({ ...ans, [i]: e.target.value })} aria-label={`Plural of ${it[0]}`} style={{ maxWidth: 220 }} />
          {checked && res[i] === "ok" && <span style={{ color: "var(--ok)" }}>✓</span>}
          {checked && res[i] === "accent" && <span className="fb" style={{ margin: 0, color: "#9a6b00" }}>Mind the accent → {it[1]}</span>}
          {checked && res[i] === "bad" && <span className="fb bad" style={{ margin: 0 }}>→ {it[1]}</span>}
        </div>
      ))}
      <div className="row" style={{ marginTop: 12 }}>
        {!checked ? (
          <button className="btn" disabled={!all} onClick={() => setChecked(true)}>Check answers</button>
        ) : (
          <>
            <b>{score} / {items.length}</b>
            <button className="btn ghost sm" onClick={() => { setAns({}); setChecked(false); }}>Try again</button>
          </>
        )}
      </div>
    </div>
  );
}

function Dialogue({ title, lines, cast }) {
  const [showEn, setShowEn] = useState(false);
  const [role, setRole] = useState(null);
  const [revealed, setRevealed] = useState({});
  const speakers = [...new Set(lines.map((l) => l.s))];
  const colors = ["#DDF3F1", "#FFF1D0", "#E3EEFB"];
  const playAll = () => { speak("", false); lines.forEach((l) => speak(l.es, true)); };
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontSize: 20 }}>{title}</h3>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn sm" onClick={playAll}>▶ Play all</button>
          <button className="btn ghost sm" onClick={() => setShowEn(!showEn)}>{showEn ? "Hide English" : "Show English"}</button>
        </div>
      </div>
      <div className="opts" style={{ marginBottom: 6, alignItems: "center" }}>
        <span className="sub" style={{ margin: 0 }}>Role-play: hide the lines of</span>
        {speakers.map((s) => (
          <button key={s} className={"chip " + (role === s ? "sel" : "")} onClick={() => { setRole(role === s ? null : s); setRevealed({}); }}>{s}</button>
        ))}
      </div>
      {lines.map((l, i) => {
        const idx = speakers.indexOf(l.s);
        const hidden = role === l.s && !revealed[i];
        return (
          <div key={i} className={"line " + (idx % 2 ? "r" : "")}>
            <div className="av" style={{ background: colors[idx % 3] }}>{cast[l.s] || "🙂"}</div>
            <div>
              <div className="who" style={{ textAlign: idx % 2 ? "right" : "left" }}>{l.s}</div>
              <div className="row" style={{ flexDirection: idx % 2 ? "row-reverse" : "row" }}>
                <div className="bubble" style={{ background: colors[idx % 3] }} onClick={() => hidden && setRevealed({ ...revealed, [i]: true })}>
                  <span className={hidden ? "blur" : ""}>{l.es}</span>
                </div>
                <Speak text={l.es} />
              </div>
              {showEn && <div className="en-line" style={{ textAlign: idx % 2 ? "right" : "left" }}>{l.en}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlipCard({ v, known, onKnown }) {
  const [on, setOn] = useState(false);
  return (
    <div className={"flip " + (on ? "on" : "")} onClick={() => setOn(!on)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOn(!on)}>
      <div className="flip-in">
        <div className="face" style={known ? { borderColor: "var(--ok)", background: "var(--ok-l)" } : {}}>
          <div style={{ fontSize: 32 }}>{v.e}</div>
          <div className="big"><Art a={v.a} /> {v.n}</div>
          <Speak text={`${v.a} ${v.n}`} />
        </div>
        <div className="face back">
          <div style={{ fontSize: 18, fontWeight: 700 }}>{v.en}</div>
          <div>plural: {v.pl}</div>
          {v.note && <div style={{ fontSize: 12.5, opacity: 0.9 }}>{v.note}</div>}
          <button className="btn sm" style={{ background: known ? "var(--ok)" : "#fff", color: known ? "#fff" : "var(--acc-d)" }} onClick={(e) => { e.stopPropagation(); onKnown(); }}>
            {known ? "✓ I know it" : "Mark as known"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- data ------------------------- */

const VOCAB = [
  { e: "🔑", a: "la", n: "llave", pl: "las llaves", en: "key" },
  { e: "📱", a: "el", n: "celular", pl: "los celulares", en: "cell phone", note: "also: el teléfono" },
  { e: "👛", a: "la", n: "billetera", pl: "las billeteras", en: "wallet", note: "also: la cartera" },
  { e: "⌚", a: "el", n: "reloj", pl: "los relojes", en: "watch / clock" },
  { e: "✏️", a: "el", n: "lápiz", pl: "los lápices", en: "pencil" },
  { e: "🖊️", a: "el", n: "bolígrafo", pl: "los bolígrafos", en: "pen", note: "Chile: lápiz pasta" },
  { e: "📓", a: "el", n: "cuaderno", pl: "los cuadernos", en: "notebook" },
  { e: "📖", a: "el", n: "libro", pl: "los libros", en: "book" },
  { e: "🎒", a: "la", n: "mochila", pl: "las mochilas", en: "backpack" },
  { e: "☂️", a: "el", n: "paraguas", pl: "los paraguas", en: "umbrella", note: "same in plural!" },
  { e: "🪑", a: "la", n: "silla", pl: "las sillas", en: "chair" },
  { e: "🚪", a: "la", n: "puerta", pl: "las puertas", en: "door" },
  { e: "🪟", a: "la", n: "ventana", pl: "las ventanas", en: "window" },
  { e: "💻", a: "la", n: "computadora", pl: "las computadoras", en: "computer", note: "Chile: el computador" },
  { e: "📷", a: "la", n: "cámara", pl: "las cámaras", en: "camera" },
  { e: "👓", a: "los", n: "lentes", pl: "(plural only)", en: "glasses", note: "also: las gafas" },
];

const STRESS = [
  ["llave", ["lla", "ve"], 0], ["mochila", ["mo", "chi", "la"], 1], ["reloj", ["re", "loj"], 1],
  ["lápiz", ["lá", "piz"], 0], ["cámara", ["cá", "ma", "ra"], 0], ["cuaderno", ["cua", "der", "no"], 1],
  ["celular", ["ce", "lu", "lar"], 2], ["computadora", ["com", "pu", "ta", "do", "ra"], 3],
  ["paraguas", ["pa", "ra", "guas"], 1], ["teléfono", ["te", "lé", "fo", "no"], 1],
];

const LETTERS = [
  ["ca · co · cu", "hard c = k", ["casa", "cuaderno", "computadora"]],
  ["ce · ci", "c = s (Latin America)", ["celular", "cine"]],
  ["que · qui", "k sound, the u is silent", ["que", "quiero"]],
  ["ga · go · gu", "hard g", ["gato", "gusto"]],
  ["gue · gui", "hard g, the u is silent", ["guitarra", "guía"]],
  ["ge · gi", "like Spanish j (strong h)", ["gente", "gimnasio"]],
];

const NF_ITEMS = [
  { e: "🔑", n: "llave", p: "llaves", g: "f" },
  { e: "⌚", n: "reloj", p: "relojes", g: "m" },
  { e: "🎒", n: "mochila", p: "mochilas", g: "f" },
  { e: "📖", n: "libro", p: "libros", g: "m" },
  { e: "📱", n: "celular", p: "celulares", g: "m" },
  { e: "✏️", n: "lápiz", p: "lápices", g: "m" },
];

/* ------------------------- near / far scene ------------------------- */

function NearFar() {
  const [k, setK] = useState(0);
  const [near, setNear] = useState(true);
  const [pl, setPl] = useState(false);
  const it = NF_ITEMS[k];
  const dem = near ? (pl ? { m: "estos", f: "estas" } : { m: "este", f: "esta" }) : (pl ? { m: "esos", f: "esas" } : { m: "ese", f: "esa" });
  const d = dem[it.g];
  const phrase = `${d} ${pl ? it.p : it.n}`;
  const sentence = pl ? `${cap(d)} son ${it.p}.` : `${cap(d)} es ${it.g === "m" ? "un" : "una"} ${it.n}.`;
  const question = pl ? (near ? "¿Qué son estos?" : "¿Qué son esos?") : near ? "¿Qué es esto?" : "¿Qué es eso?";
  const x = near ? 170 : 440;
  return (
    <div className="card">
      <b>Move the object</b>
      <p className="sub" style={{ margin: "4px 0 10px" }}>Pick an object, then choose near or far, one or two. Watch how the word changes.</p>
      <div className="opts" style={{ marginTop: 0 }}>
        {NF_ITEMS.map((x2, i) => (
          <button key={x2.n} className={"chip " + (k === i ? "sel" : "")} onClick={() => setK(i)}><span style={{ fontSize: 20 }}>{x2.e}</span> {x2.n}</button>
        ))}
      </div>
      <div className="opts">
        <button className={"chip " + (near ? "sel" : "")} onClick={() => setNear(true)}>Near me · aquí</button>
        <button className={"chip " + (!near ? "sel" : "")} onClick={() => setNear(false)}>Far from me · allí</button>
        <button className={"chip " + (!pl ? "sel" : "")} onClick={() => setPl(false)}>One</button>
        <button className={"chip " + (pl ? "sel" : "")} onClick={() => setPl(true)}>Two</button>
      </div>
      <svg viewBox="0 0 600 170" style={{ width: "100%", marginTop: 10 }} role="img" aria-label={`${phrase}`}>
        <line x1="10" y1="140" x2="590" y2="140" stroke="#D5E2E4" strokeWidth="3" />
        <text x="40" y="128" fontSize="60">🧑</text>
        <line x1="115" y1="100" x2={x - 8} y2="100" stroke="#0B7A75" strokeWidth="3" strokeDasharray="6 6" />
        <text x={x} y="128" fontSize="56">{it.e}</text>
        {pl && <text x={x + 58} y="128" fontSize="56">{it.e}</text>}
        <text x={x + (pl ? 58 : 28)} y="162" textAnchor="middle" fontSize="15" fill="#56707A">{near ? "aquí" : "allí"}</text>
      </svg>
      <div className="card" style={{ background: "var(--acc-l)", border: 0 }}>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 30, fontWeight: 700 }}>{phrase}</span>
          <Speak text={phrase} />
        </div>
        <div style={{ marginTop: 6, fontSize: 18 }}>{question} → <b>{sentence}</b> <Speak text={sentence} /></div>
      </div>
    </div>
  );
}

/* ------------------------- where is it? ------------------------- */

function TableIcon() {
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" aria-hidden="true">
      <rect x="4" y="8" width="56" height="7" rx="2" fill="#8B5E3C" />
      <rect x="9" y="15" width="5" height="22" fill="#8B5E3C" />
      <rect x="50" y="15" width="5" height="22" fill="#8B5E3C" />
    </svg>
  );
}

function FindIt() {
  const items = [
    { e: "🔑", a: "la", n: "llave", v: "está", c: "mesa" },
    { e: "📱", a: "el", n: "celular", v: "está", c: "mochila" },
    { e: "👓", a: "los", n: "lentes", v: "están", c: "silla" },
    { e: "⌚", a: "el", n: "reloj", v: "está", c: "mesa" },
    { e: "📖", a: "el", n: "libro", v: "está", c: "mochila" },
    { e: "✏️", a: "el", n: "lápiz", v: "está", c: "silla" },
  ];
  const boxes = ["mesa", "silla", "mochila"];
  const [i, setI] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const it = items[i];
  const q = `¿Dónde ${it.v} ${it.a} ${it.n}?`;
  const sentence = `${cap(it.a)} ${it.n} ${it.v} en la ${it.c}.`;
  const pick = (b) => {
    if (sel) return;
    setSel(b);
    if (b === it.c) setScore((s) => s + 1);
    speak(sentence);
  };
  const next = () => { if (i + 1 < items.length) { setI(i + 1); setSel(null); } else setDone(true); };
  const reset = () => { setI(0); setSel(null); setScore(0); setDone(false); };
  if (done)
    return (
      <div className="card">
        <h3>Find it: {score} / {items.length}</h3>
        <button className="btn" style={{ marginTop: 10 }} onClick={reset}>Try again</button>
      </div>
    );
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>Find it</b><span className="sub" style={{ margin: 0 }}>{i + 1} of {items.length}</span>
      </div>
      <p style={{ fontSize: 20, margin: "10px 0 12px" }}>{q} <Speak text={q} /></p>
      <div className="grid g3">
        {boxes.map((b) => (
          <button key={b} className={"box " + (sel ? (b === it.c ? "ok" : b === sel ? "bad" : "") : "")} onClick={() => pick(b)}>
            <div style={{ minHeight: 44, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
              {b === "mesa" && <TableIcon />}
              {b === "silla" && <span style={{ fontSize: 38 }}>🪑</span>}
              {b === "mochila" && <span style={{ fontSize: 38 }}>🎒</span>}
            </div>
            <div style={{ fontSize: 28, minHeight: 36 }}>{items.filter((x) => x.c === b).map((x) => x.e).join(" ")}</div>
            <b>la {b}</b>
          </button>
        ))}
      </div>
      {sel && (
        <>
          <div className={"fb " + (sel === it.c ? "ok" : "bad")}><b>{sel === it.c ? "Correct. " : "Not quite. "}</b>{sentence}</div>
          <div style={{ marginTop: 10 }}><button className="btn sm" onClick={next}>{i + 1 < items.length ? "Next" : "See score"}</button></div>
        </>
      )}
    </div>
  );
}

/* ------------------------- pages ------------------------- */

function Cover({ me, setMe, partner, setPartner, teacher }) {
  const goals = [
    ["❓", "Ask and say what things are", "¿Qué es esto? · Es una llave."],
    ["🔑", "Name 16 everyday objects", "la llave · el reloj · la mochila"],
    ["🔢", "Use un/una and make plurals", "una llave · unas llaves"],
    ["👉", "Point: this one, that one", "este reloj · esa mochila"],
    ["🙋", "Ask for help in class", "¿Cómo se dice…? · No entiendo."],
    ["📍", "Say where things are", "¿Dónde está? · Está en la mesa."],
  ];
  return (
    <>
      <PageHead es="¿Qué es esto?" en="Unit 2 · Everyday things and how to talk about them" />
      <div className="card" style={{ textAlign: "center", fontSize: 44, letterSpacing: 6 }} aria-hidden="true">🔑 📱 ⌚ ✏️ 🎒 ☂️ 👓</div>

      <div className="sec">
        <h3>Make it yours</h3>
        <p className="sub">Your names appear in the conversations. Use the same ones as in Unit 1.</p>
        <div className="grid g2">
          <label>Your name<br /><input type="text" value={me} onChange={(e) => setMe(e.target.value)} /></label>
          <label>Your partner's name<br /><input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} /></label>
        </div>
      </div>

      <div className="sec">
        <h3>By the end of this unit, you can…</h3>
        <div className="grid g3" style={{ marginTop: 12 }}>
          {goals.map(([ic, t, ex]) => (
            <div className="card" key={t}>
              <div style={{ fontSize: 28 }}>{ic}</div>
              <b>{t}</b>
              <div className="sub" style={{ margin: "6px 0 0" }}>{ex}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">
        <h3>Warm-up: remember Unit 1?</h3>
        <Quiz
          title="Unit 1 recap"
          items={[
            { q: "How do you say 'My name is…'?", o: ["Me llamo…", "Tengo…", "Eres…"], a: "Me llamo…", why: "Me llamo = I call myself.", say: "Me llamo" },
            { q: "Yo ___ de Estados Unidos.", o: ["soy", "eres", "es"], a: "soy", why: "Yo → soy.", say: "Yo soy de Estados Unidos" },
            { q: "How do you ask a friend 'How are you?'", o: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?"], a: "¿Cómo estás?", why: "Cómo estás = how are you.", say: "¿Cómo estás?" },
          ]}
        />
      </div>

      <TeacherNote show={teacher}>
        Mirrors Interchange Intro Unit 2 ("What's this?"): names of things, asking what something is, articles and plurals, this/that, and asking for help in class. Plan 4 sessions of 60 min: S1 pages 2–3, S2 pages 4–5, S3 pages 6–7, S4 pages 8–9. New big idea: Spanish nouns have gender. Teach every noun with its article from the first minute.
      </TeacherNote>
    </>
  );
}

function Conversation({ me, partner, teacher }) {
  const cast = { [partner]: "👨", [me]: "👩" };
  const d1 = [
    { s: me, es: "Perdón, ¿qué es esto?", en: "Excuse me, what's this?" },
    { s: partner, es: "Es una llave.", en: "It's a key." },
    { s: me, es: "¿Y esto?", en: "And this?" },
    { s: partner, es: "Es un reloj.", en: "It's a watch." },
    { s: me, es: "¿Cómo se dice “umbrella” en español?", en: "How do you say 'umbrella' in Spanish?" },
    { s: partner, es: "Se dice “paraguas”.", en: "You say 'paraguas'." },
    { s: me, es: "¿Cómo se escribe?", en: "How do you spell it?" },
    { s: partner, es: "P-A-R-A-G-U-A-S.", en: "P-A-R-A-G-U-A-S." },
    { s: me, es: "Gracias.", en: "Thanks." },
    { s: partner, es: "De nada.", en: "You're welcome." },
  ];
  const d2 = [
    { s: me, es: partner + ", ¿qué es eso?", en: `${partner}, what's that?` },
    { s: partner, es: "¿Esto? Es un paraguas.", en: "This? It's an umbrella." },
    { s: me, es: "¿Y esas? ¿Qué son?", en: "And those? What are they?" },
    { s: partner, es: "Son llaves. Son las llaves de la casa.", en: "They're keys. They're the house keys." },
    { s: me, es: "¡Ah! ¿Y dónde está mi celular?", en: "Ah! And where is my cell phone?" },
    { s: partner, es: "Está en la mochila.", en: "It's in the backpack." },
    { s: me, es: "¡Gracias!", en: "Thanks!" },
  ];
  return (
    <>
      <PageHead es="Conversación" en="Listen, read, then act it out" />
      <p className="sub">Step 1: press ▶ Play all and just listen. Step 2: show the English. Step 3: hide your role and say your lines from memory.</p>
      <Dialogue title="1 · What's this called?" lines={d1} cast={cast} />
      <div style={{ height: 14 }} />
      <Dialogue title="2 · What are those?" lines={d2} cast={cast} />
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="note"><b>Two questions, two answers.</b> One thing: <b>¿Qué es esto?</b> → <b>Es…</b> Several things: <b>¿Qué son?</b> → <b>Son…</b></div>
        <div className="note"><b>"Mi" means "my".</b> Just learn <b>mi celular</b> and <b>mi llave</b> as chunks for now. We practice "my / your" in Unit 3.</div>
      </div>
      <TeacherNote show={teacher}>
        Bring five real objects in a bag (keys, phone, watch, wallet, umbrella). Pull one out: "¿Qué es esto?" She answers "Es un/una…". Don't explain un/una yet: let her notice the pattern, then label it on the next pages. "¿Cómo se dice…?" is the most valuable chunk of the unit because it makes her independent.
      </TeacherNote>
    </>
  );
}

function Vocabulary({ known, setKnown, teacher }) {
  const [filter, setFilter] = useState("all");
  const shown = VOCAB.filter((v) => filter === "all" || v.a === filter);
  const count = Object.values(known).filter(Boolean).length;
  return (
    <>
      <PageHead es="Vocabulario" en="Everyday objects · always learn the article too" />
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <p className="sub" style={{ margin: 0 }}>Tap a card to flip it. Say the word, with its article, before you flip.</p>
        <b>{count} / {VOCAB.length} known</b>
      </div>
      <div className="bar" style={{ margin: "10px 0 12px" }}><i style={{ width: `${(count / VOCAB.length) * 100}%` }} /></div>
      <div className="opts" style={{ marginTop: 0, marginBottom: 14 }}>
        {[["all", "All"], ["el", "el"], ["la", "la"], ["los", "los"]].map(([f, label]) => (
          <button key={f} className={"chip " + (filter === f ? "sel" : "")} onClick={() => setFilter(f)}>{label}</button>
        ))}
      </div>
      <div className="grid g4">
        {shown.map((v) => (
          <FlipCard key={v.n} v={v} known={!!known[v.n]} onKnown={() => setKnown({ ...known, [v.n]: !known[v.n] })} />
        ))}
      </div>
      <div className="grid g2" style={{ marginTop: 20 }}>
        <div className="note"><b>Color code:</b> <Art a="el" /> masculine, <Art a="la" /> feminine. Learn "la llave", never just "llave".</div>
        <div className="trap"><b>Regional words.</b> Spanish changes by country: celular / teléfono, billetera / cartera, computadora / computador. Learn the one your family uses first.</div>
      </div>
      <TeacherNote show={teacher}>
        Cut 16 cards and play "Cojo la…": you hold a card, she says "Es un/una…". Then flip it: she hides her eyes and you remove one card ("¿Qué falta?"). Heads-up: the same object can have different gender by country (la computadora in Mexico and the US, el computador in Chile). It's a good moment to say "words have gender, not logic".
      </TeacherNote>
    </>
  );
}

function Pronunciation({ teacher }) {
  const [shown, setShown] = useState({});
  return (
    <>
      <PageHead es="Pronunciación" en="Where to put the stress · c, qu, g" />
      <div className="sec">
        <h3>Which syllable is loud?</h3>
        <p className="sub">Tap a word to hear it and see its stressed syllable.</p>
        <div className="grid g4">
          {STRESS.map(([w, syl, st]) => (
            <button key={w} className="tile" onClick={() => { speak(w); setShown({ ...shown, [w]: true }); }}>
              <div style={{ minHeight: 38 }}>
                {syl.map((s, i) => (
                  <span key={i} className={"syl " + (shown[w] && i === st ? "st" : "")}>{s}</span>
                ))}
              </div>
              <div className="sub" style={{ margin: 0 }}>{w}</div>
            </button>
          ))}
        </div>
        <div className="grid g3" style={{ marginTop: 12 }}>
          <div className="note"><b>Ends in a vowel, -n or -s</b><br />stress the second-to-last: <b>LLA-ve, mo-CHI-la</b></div>
          <div className="note"><b>Ends in another consonant</b><br />stress the last: <b>re-LOJ, ce-lu-LAR</b></div>
          <div className="note"><b>Written accent</b><br />breaks the rule, so say it loud: <b>LÁ-piz, CÁ-ma-ra</b></div>
        </div>
      </div>

      <div className="sec">
        <h3>Letters that change sound: c, qu, g</h3>
        <div className="card" style={{ padding: 6 }}>
          <table>
            <thead><tr><th>Letters</th><th>Sound</th><th>Try it</th></tr></thead>
            <tbody>
              {LETTERS.map(([l, d, ws]) => (
                <tr key={l}>
                  <td><b style={{ fontFamily: "Georgia,serif", fontSize: 18 }}>{l}</b></td>
                  <td>{d}</td>
                  <td>
                    <div className="opts" style={{ marginTop: 0 }}>
                      {ws.map((w) => <button key={w} className="chip" onClick={() => speak(w)}>🔊 {w}</button>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="trap" style={{ marginTop: 12 }}><b>The silent u:</b> in <b>que, qui, gue, gui</b> the u is not pronounced. "Guitarra" is "gi-TA-rra", not "gwi-TA-rra".</div>
      </div>

      <Quiz
        title="Sound check"
        items={[
          { q: "Which word starts with a k sound?", o: ["casa", "cena", "cine"], a: "casa", why: "c + a/o/u = k. But c + e/i = s.", say: "casa" },
          { q: "Where is the stress in 'mochila'?", o: ["mo", "chi", "la"], a: "chi", why: "Ends in a vowel → second-to-last syllable: mo-CHI-la.", say: "mochila" },
          { q: "Where is the stress in 'celular'?", o: ["ce", "lu", "lar"], a: "lar", why: "Ends in -r (a consonant other than n/s) → last syllable.", say: "celular" },
          { q: "How do you say 'gente'?", o: ["HEN-te (like j)", "GEN-te (hard g)"], a: "HEN-te (like j)", why: "g + e/i sounds like the Spanish j.", say: "gente" },
        ]}
      />
      <TeacherNote show={teacher}>
        Clap the stressed syllable while saying the word. The accent rule is simple for her: if you see an accent mark, say that syllable loudly. Don't teach all accent rules now. Most important at Intro level: she should recognize "c" before e/i as /s/ and the silent "u" in que/qui/gue/gui.
      </TeacherNote>
    </>
  );
}

function Articles({ teacher }) {
  return (
    <>
      <PageHead es="El, la, un, una" en="Spanish nouns have gender" />
      <div className="grid g2">
        <div className="card">
          <h3 style={{ fontSize: 20 }}>The (definite)</h3>
          <p style={{ fontSize: 22, margin: "10px 0" }}><Art a="el" /> libro <Speak text="el libro" /><br /><Art a="la" /> llave <Speak text="la llave" /></p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 20 }}>A / an (indefinite)</h3>
          <p style={{ fontSize: 22, margin: "10px 0" }}><b>un</b> libro <Speak text="un libro" /><br /><b>una</b> llave <Speak text="una llave" /></p>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="note"><b>The easy rule:</b> nouns ending in <b>-o</b> are usually masculine (<b>el</b> libro). Nouns ending in <b>-a</b> are usually feminine (<b>la</b> mochila).</div>
        <div className="trap"><b>The catch:</b> all other endings must be memorized: <b>el</b> reloj, <b>el</b> lápiz, <b>la</b> llave, <b>el</b> paraguas. That's why you learn the article together with the word.</div>
      </div>

      <div className="sec">
        <h3>Practice</h3>
        <div className="grid g2">
          <Match
            title="Match picture and noun"
            big
            pairs={[["🔑", "la llave"], ["⌚", "el reloj"], ["🎒", "la mochila"], ["📖", "el libro"], ["🪑", "la silla"], ["📱", "el celular"]]}
          />
          <Quiz
            title="El or la?"
            items={[
              { q: "🔑 ___ llave", o: ["el", "la"], a: "la", why: "La llave. It doesn't end in -a, so you have to memorize it.", say: "la llave" },
              { q: "⌚ ___ reloj", o: ["el", "la"], a: "el", why: "El reloj. Ends in a consonant: memorize.", say: "el reloj" },
              { q: "🎒 ___ mochila", o: ["el", "la"], a: "la", why: "-a → feminine.", say: "la mochila" },
              { q: "📖 ___ libro", o: ["el", "la"], a: "el", why: "-o → masculine.", say: "el libro" },
              { q: "✏️ ___ lápiz", o: ["el", "la"], a: "el", why: "El lápiz. Memorize it.", say: "el lápiz" },
              { q: "🚪 ___ puerta", o: ["el", "la"], a: "la", why: "-a → feminine.", say: "la puerta" },
            ]}
          />
        </div>
        <div className="grid g2" style={{ marginTop: 12 }}>
          <Quiz
            title="Un or una?"
            items={[
              { q: "Es ___ reloj.", o: ["un", "una"], a: "un", why: "El reloj → un reloj.", say: "Es un reloj" },
              { q: "Es ___ ventana.", o: ["un", "una"], a: "una", why: "La ventana → una ventana.", say: "Es una ventana" },
              { q: "Es ___ cuaderno.", o: ["un", "una"], a: "un", why: "-o → un.", say: "Es un cuaderno" },
              { q: "Es ___ computadora.", o: ["un", "una"], a: "una", why: "-a → una.", say: "Es una computadora" },
              { q: "Es ___ paraguas.", o: ["un", "una"], a: "un", why: "El paraguas → un paraguas.", say: "Es un paraguas" },
            ]}
          />
          <WordOrder sentences={["Es una llave", "Es un reloj", "¿Qué es esto?", "Es una mochila"]} />
        </div>
      </div>
      <div className="note"><b>Careful:</b> "un" = a / one. When you count, you say <b>uno</b> (uno, dos, tres), but before a noun it's <b>un libro</b>.</div>
      <TeacherNote show={teacher}>
        Her instinct will be to translate: "key = llave", with no article. Ask for the full phrase every time: "¿Cómo se dice 'the key'?" → "la llave". The color code (blue el / pink la) is a visual crutch; pull it away after a few sessions. Gender has no meaning for objects. Don't search for logic.
      </TeacherNote>
    </>
  );
}

function Plurals({ teacher }) {
  return (
    <>
      <PageHead es="Los plurales" en="One thing, many things" />
      <div className="grid g2">
        <div className="card">
          <h3 style={{ fontSize: 20 }}>Making plurals</h3>
          <table>
            <tbody>
              <tr><td>ends in a <b>vowel</b></td><td>add <b>-s</b></td><td>llave → llaves</td></tr>
              <tr><td>ends in a <b>consonant</b></td><td>add <b>-es</b></td><td>reloj → relojes</td></tr>
              <tr><td>ends in <b>-z</b></td><td><b>z → -ces</b></td><td>lápiz → lápices</td></tr>
              <tr><td>ends in <b>-s</b></td><td>no change</td><td>paraguas → paraguas</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 20 }}>The articles</h3>
          <table>
            <thead><tr><th></th><th>singular</th><th>plural</th></tr></thead>
            <tbody>
              <tr><td>the</td><td><Art a="el" /> · <Art a="la" /></td><td><Art a="los" /> · <Art a="las" /></td></tr>
              <tr><td>a / some</td><td>un · una</td><td>unos · unas</td></tr>
            </tbody>
          </table>
          <div className="opts">
            {["los relojes", "las llaves", "unos libros", "unas mochilas"].map((p) => <button key={p} className="chip" onClick={() => speak(p)}>🔊 {p}</button>)}
          </div>
        </div>
      </div>
      <div className="note" style={{ marginTop: 12 }}><b>Plural-only words.</b> Some things are always plural in Spanish, like <b>los lentes</b> (glasses). English does the same with "glasses" and "scissors".</div>

      <div className="sec">
        <h3>Practice</h3>
        <TypedList
          title="Write the plural"
          instr="Include the article. Watch the accents and spelling changes."
          items={[
            ["la llave", "las llaves"],
            ["el reloj", "los relojes"],
            ["el lápiz", "los lápices"],
            ["el paraguas", "los paraguas"],
            ["la mochila", "las mochilas"],
            ["un libro", "unos libros"],
          ]}
        />
        <div style={{ height: 12 }} />
        <Quiz
          title="¿Qué es? ¿Qué son?"
          items={[
            { q: "🔑🔑 ¿Qué son?", o: ["Son llaves.", "Es llaves.", "Son llave."], a: "Son llaves.", why: "Plural → son + plural noun.", say: "Son llaves" },
            { q: "📖 ¿Qué es?", o: ["Es un libro.", "Son un libro.", "Es libros."], a: "Es un libro.", why: "One thing → es + un/una.", say: "Es un libro" },
            { q: "☂️☂️☂️ ¿Qué son?", o: ["Son paraguas.", "Son paraguases.", "Es paraguas."], a: "Son paraguas.", why: "Paraguas ends in -s and doesn't change.", say: "Son paraguas" },
            { q: "✏️✏️ ¿Qué son?", o: ["Son lápices.", "Son lápizes.", "Son lápiz."], a: "Son lápices.", why: "z becomes c before -es.", say: "Son lápices" },
            { q: "🎒🎒 ¿Qué son?", o: ["Son mochilas.", "Son mochiles.", "Es mochilas."], a: "Son mochilas.", why: "Ends in a vowel → add -s.", say: "Son mochilas" },
          ]}
        />
      </div>
      <TeacherNote show={teacher}>
        The big error: "las llave" (no plural on the noun) or "los relojs". Practice by counting real objects: "una llave, dos llaves, tres llaves…" with numbers 1–10 from Unit 1. Note that the article in the plural carries the gender, but the noun has to change too, so both must change.
      </TeacherNote>
    </>
  );
}

function ThisThat({ teacher }) {
  return (
    <>
      <PageHead es="Esto, eso, este, ese" en="This and that · near and far" />
      <div className="grid g2">
        <div className="card" style={{ padding: 6 }}>
          <table>
            <thead><tr><th></th><th>this (near)</th><th>that (far)</th></tr></thead>
            <tbody>
              <tr><td>masc.</td><td><b>este</b> reloj</td><td><b>ese</b> reloj</td></tr>
              <tr><td>fem.</td><td><b>esta</b> llave</td><td><b>esa</b> llave</td></tr>
              <tr><td>masc. pl.</td><td><b>estos</b> libros</td><td><b>esos</b> libros</td></tr>
              <tr><td>fem. pl.</td><td><b>estas</b> llaves</td><td><b>esas</b> llaves</td></tr>
            </tbody>
          </table>
        </div>
        <div className="grid">
          <div className="note"><b>Esto / eso</b> (no noun) are for things you can't name yet. They never change: <b>¿Qué es esto?</b> <Speak text="¿Qué es esto?" /></div>
          <div className="note"><b>Este / esta / ese / esa</b> go with a noun and agree with it: <b>esta</b> llave, <b>ese</b> reloj.</div>
        </div>
      </div>

      <div className="sec">
        <NearFar />
      </div>

      <div className="grid g2">
        <Quiz
          title="This or that?"
          items={[
            { q: "You hold something and don't know the word: ¿Qué es ___?", o: ["esto", "este", "esta"], a: "esto", why: "No noun yet → esto (neutral).", say: "¿Qué es esto?" },
            { q: "(near) ___ mochila", o: ["esta", "este", "esa"], a: "esta", why: "Near + feminine → esta.", say: "esta mochila" },
            { q: "(far) ___ reloj", o: ["ese", "esa", "este"], a: "ese", why: "Far + masculine → ese.", say: "ese reloj" },
            { q: "(near, two) ___ llaves", o: ["estas", "estos", "esas"], a: "estas", why: "Near + feminine plural → estas.", say: "estas llaves" },
            { q: "(far, two) ___ libros", o: ["esos", "esas", "estos"], a: "esos", why: "Far + masculine plural → esos.", say: "esos libros" },
          ]}
        />
        <WordOrder sentences={["Esta es una mochila", "Esos son libros", "¿Qué es eso?", "Ese es un reloj"]} />
      </div>
      <TeacherNote show={teacher}>
        Keep this at recognition level: the demonstratives that agree (este/esta/estos/estas) are hard in Intro, so spend most of the time on esto/eso + "Es un…" and let the table be a reference. Physical TPR works well: touch the object ("esto"), point across the room ("eso"). Nice link for her: this/these both have "es" + gender, just like el/la.
      </TeacherNote>
    </>
  );
}

function Classroom({ teacher }) {
  const phrases = [
    ["¿Cómo se dice “key” en español?", "How do you say 'key' in Spanish?"],
    ["Se dice “llave”.", "You say 'llave'."],
    ["¿Cómo se escribe?", "How do you spell it?"],
    ["¿Qué significa “paraguas”?", "What does 'paraguas' mean?"],
    ["No entiendo.", "I don't understand."],
    ["Más despacio, por favor.", "Slower, please."],
    ["¿Puedes repetir, por favor?", "Can you repeat, please?"],
    ["No sé.", "I don't know."],
  ];
  return (
    <>
      <PageHead es="En clase" en="Ask for help · say where things are" />
      <div className="sec">
        <h3>Survival phrases</h3>
        <p className="sub">These five phrases make you independent. Tap to hear.</p>
        <div className="grid g2">
          {phrases.map(([es, en]) => (
            <button key={es} className="tile" style={{ textAlign: "left" }} onClick={() => speak(es)}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b style={{ fontSize: 17 }}>{es}</b><span>🔊</span>
              </div>
              <div className="sub" style={{ margin: 0 }}>{en}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <Match
            title="What do you say when…?"
            pairs={[
              ["You don't know a word", "¿Cómo se dice…?"],
              ["You want it spelled", "¿Cómo se escribe?"],
              ["You want the meaning", "¿Qué significa…?"],
              ["You didn't understand", "No entiendo."],
              ["They talk too fast", "Más despacio, por favor."],
              ["You missed it", "¿Puedes repetir, por favor?"],
            ]}
          />
        </div>
      </div>

      <div className="sec">
        <h3>¿Dónde está…?</h3>
        <p className="sub">Where something is: <b>está</b> (one thing) / <b>están</b> (several) + <b>en</b> + place.</p>
        <FindIt />
        <div className="note" style={{ marginTop: 12 }}><b>Remember from the ser/estar workbook:</b> location always uses <b>estar</b>. "¿Dónde está mi celular?", never "¿Dónde es…?".</div>
        <div style={{ marginTop: 12 }}>
          <WordOrder title="Build the sentence" sentences={["¿Dónde está mi celular?", "Está en la mochila", "Los lentes están en la silla", "La llave está en la mesa"]} />
        </div>
      </div>
      <TeacherNote show={teacher}>
        Make the survival phrases a classroom rule from day one: she may only ask for help in Spanish. Put them on a card on the table. "¿Dónde está?" connects with her ser/estar workbook: reinforce the rule "location = estar". Optional extension: "aquí / allí" (here / there).
      </TeacherNote>
    </>
  );
}

function Review({ me, partner, teacher }) {
  const cando = [
    "I can ask ¿Qué es esto? and answer Es un / una…",
    "I can name 16 objects with el / la",
    "I can use un / una correctly",
    "I can make plurals (llaves, relojes, lápices)",
    "I can say esto / eso and este / esta",
    "I can ask ¿Cómo se dice…? and ¿Cómo se escribe?",
    "I can say where something is: Está en…",
  ];
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  const missions = [
    ["🏷️", "Label the house", `Put sticky notes with el/la + noun on 10 objects at home. Tell ${partner} where each one is.`],
    ["🎙️", "Voice note", `Send ${partner} a 30-second voice note showing three objects: "Esto es…" and "Eso es…".`],
    ["🧺", "Mystery bag", `${partner} hides an object in a bag. Ask yes/no questions until you guess: "¿Es un reloj?"`],
  ];
  return (
    <>
      <PageHead es="Repaso" en="Review · Can you do it?" />
      <div className="sec">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3>My checklist</h3><b>{count} / {cando.length}</b>
        </div>
        <div className="bar" style={{ margin: "8px 0 14px" }}><i style={{ width: `${(count / cando.length) * 100}%` }} /></div>
        {cando.map((c, i) => (
          <div key={c} className={"check " + (done[i] ? "on" : "")} onClick={() => setDone({ ...done, [i]: !done[i] })} role="checkbox" aria-checked={!!done[i]} tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setDone({ ...done, [i]: !done[i] })}>
            <div className="cb">{done[i] ? "✓" : ""}</div><div>{c}</div>
          </div>
        ))}
        {count === cando.length && <div className="note"><b>¡Felicidades, {me}!</b> Unit 2 is complete. Next: Unit 3, "¿Dónde vives?" (Where do you live?).</div>}
      </div>

      <div className="sec">
        <h3>Final quiz</h3>
        <Quiz
          title="Unit 2 review"
          items={[
            { q: "You point at a key in your hand and ask…", o: ["¿Qué es esto?", "¿Qué son estos?", "¿Cómo te llamas?"], a: "¿Qué es esto?", why: "One thing → ¿Qué es esto?", say: "¿Qué es esto?" },
            { q: "___ mochila (the backpack)", o: ["La", "El", "Los"], a: "La", why: "Mochila ends in -a → la.", say: "la mochila" },
            { q: "Es ___ reloj.", o: ["un", "una", "unos"], a: "un", why: "El reloj → un reloj.", say: "Es un reloj" },
            { q: "The plural of 'lápiz' is…", o: ["lápices", "lápizes", "lápiz"], a: "lápices", why: "z → c before -es.", say: "lápices" },
            { q: "'Those keys' (far) is…", o: ["esas llaves", "estas llaves", "esa llave"], a: "esas llaves", why: "Far + feminine plural → esas.", say: "esas llaves" },
            { q: "You don't know a word. You ask…", o: ["¿Cómo se dice…?", "¿De dónde eres?", "¿Cuántos años tienes?"], a: "¿Cómo se dice…?", why: "How do you say…?", say: "¿Cómo se dice?" },
            { q: "¿Dónde ___ mi celular?", o: ["está", "es", "están"], a: "está", why: "Location → estar; one thing → está.", say: "¿Dónde está mi celular?" },
            { q: "Which stress is correct?", o: ["mo-CHI-la", "MO-chi-la", "mo-chi-LA"], a: "mo-CHI-la", why: "Ends in a vowel → second-to-last syllable.", say: "mochila" },
          ]}
        />
      </div>

      <div className="sec">
        <h3>Speaking missions with {partner}</h3>
        <div className="grid g3">
          {missions.map(([ic, t, d]) => (
            <div className="card" key={t}>
              <div style={{ fontSize: 28 }}>{ic}</div><b>{t}</b>
              <div className="sub" style={{ margin: "6px 0 0" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <b>Model for the voice note</b>
        <p style={{ fontSize: 18, margin: "8px 0" }}>«Hola, {partner}. Esto es una llave. Eso es un reloj. Estos son mis lentes. ¿Cómo se dice “wallet” en español? ¡Gracias!»</p>
        <button className="btn sm" onClick={() => speak(`Hola, ${partner}. Esto es una llave. Eso es un reloj. Estos son mis lentes. ¿Cómo se dice wallet en español? Gracias.`)}>🔊 Listen to the model</button>
      </div>
      <TeacherNote show={teacher}>
        Mini-evaluation (10 min): she names 8 objects with article, makes 3 plurals, asks "¿Cómo se dice…?" for a word you invent, and says where an object is. Then 10 minutes with her partner: "mystery bag". Feedback on only two things: article gender and plural endings.
      </TeacherNote>
    </>
  );
}

/* ------------------------- app shell ------------------------- */

export default function App() {
  const [page, setPage] = useState(0);
  const [seen, setSeen] = useState({ 0: true });
  const [teacher, setTeacher] = useState(false);
  const [me, setMe] = useState("Emily");
  const [partner, setPartner] = useState("Diego");
  const [known, setKnown] = useState({});

  const pages = [
    { t: "Welcome", c: <Cover {...{ me, setMe, partner, setPartner, teacher }} /> },
    { t: "Conversation", c: <Conversation {...{ me, partner, teacher }} /> },
    { t: "Vocabulary", c: <Vocabulary {...{ known, setKnown, teacher }} /> },
    { t: "Pronunciation", c: <Pronunciation teacher={teacher} /> },
    { t: "Articles", c: <Articles teacher={teacher} /> },
    { t: "Plurals", c: <Plurals teacher={teacher} /> },
    { t: "This & that", c: <ThisThat teacher={teacher} /> },
    { t: "In class", c: <Classroom teacher={teacher} /> },
    { t: "Review", c: <Review {...{ me, partner, teacher }} /> },
  ];

  const go = (n) => {
    const x = Math.max(0, Math.min(pages.length - 1, n));
    setPage(x);
    setSeen((s) => ({ ...s, [x]: true }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="top">
        <div className="top-in">
          <div className="brand">Unidad 2 · <span>¿Qué es esto?</span></div>
          <div className="bar" aria-label="Progress"><i style={{ width: `${((page + 1) / pages.length) * 100}%` }} /></div>
          <span style={{ fontSize: 13, color: "var(--soft)" }}>{page + 1} / {pages.length} · {pages[page].t}</span>
          <button className={"toggle " + (teacher ? "on" : "")} onClick={() => setTeacher(!teacher)}>{teacher ? "Teacher mode: on" : "Teacher mode"}</button>
        </div>
      </div>

      <div className="wrap" key={page}>{pages[page].c}</div>

      <div className="nav">
        <div className="nav-in">
          <button className="btn ghost" onClick={() => go(page - 1)} disabled={page === 0}>← Back</button>
          <div className="dots">
            {pages.map((p, i) => (
              <button key={p.t} className={"dot " + (i === page ? "cur" : seen[i] ? "seen" : "")} onClick={() => go(i)} aria-label={`Go to page ${i + 1}: ${p.t}`} title={p.t} />
            ))}
          </div>
          <button className="btn" onClick={() => go(page + 1)} disabled={page === pages.length - 1}>Next →</button>
        </div>
      </div>
    </div>
  );
}