import React, { useState, useMemo } from "react";

/* =====================================================================
   SPANISH FOR ENGLISH SPEAKERS — UNIT 1: "Mucho gusto"
   Modeled on the structure of Interchange Intro, Unit 1
   (Snapshot → Conversation → Vocabulary → Pronunciation → Grammar →
    Speaking → Review). Self-contained: React only, no other packages.
   Audio uses the browser's built-in Spanish voice (Web Speech API).
   ===================================================================== */

/* ------------------------- helpers ------------------------- */

function speak(text, queue = false) {
  const synth = window.speechSynthesis;
  if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
    console.warn("Speech synthesis is not supported in this browser.");
    return;
  }
  if (!queue) synth.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[¿¡]/g, ""));
  const voices = synth.getVoices();
  const v =
    voices.find((x) => /es[-_](MX|US|419|CL|AR|CO)/i.test(x.lang)) ||
    voices.find((x) => /^es/i.test(x.lang));
  if (v) u.voice = v;
  u.lang = v ? v.lang : "es-MX";
  u.rate = 0.85;
  synth.speak(u);
}

const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
const shuffle = (arr, seed) =>
  [...arr].sort((a, b) => hash(a + seed) - hash(b + seed) || a.localeCompare(b));

/* ------------------------- styles ------------------------- */

const CSS = `
:root{
  --paper:#F5F6FA; --card:#FFFFFF; --ink:#0F1B33; --soft:#5B6783; --line:#DCE0EC;
  --blue:#2F4BFF; --blue-d:#1B32C7; --blue-l:#E6EAFF;
  --sun:#FFC233; --sun-l:#FFF4D6; --ok:#15996A; --ok-l:#DDF5EA; --bad:#E5484D; --bad-l:#FDE6E7;
}
*{box-sizing:border-box}
body{margin:0}
.app{min-height:100vh;background:var(--paper);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
.wrap{max-width:940px;margin:0 auto;padding:0 18px 120px}
.top{position:sticky;top:0;z-index:20;background:rgba(245,246,250,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.top-in{max-width:940px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.brand{font-family:Georgia,"Times New Roman",serif;font-weight:700;font-size:18px}
.brand span{color:var(--blue)}
.bar{flex:1;min-width:120px;height:8px;background:var(--line);border-radius:99px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--blue);transition:width .35s}
.toggle{border:1.5px solid var(--ink);background:transparent;color:var(--ink);padding:6px 12px;border-radius:99px;font-size:13px;cursor:pointer;font-weight:600}
.toggle.on{background:var(--ink);color:#fff}
h1,h2,h3{font-family:Georgia,"Times New Roman",serif;margin:0}
.pagehead{padding:34px 0 8px}
.pagehead .es{font-size:clamp(34px,7vw,60px);line-height:1.05;letter-spacing:-.02em;font-weight:700}
.pagehead .en{font-size:18px;color:var(--soft);margin-top:6px}
.sec{margin:26px 0}
.sec > h3{font-size:22px;margin-bottom:4px}
.sub{color:var(--soft);font-size:15px;margin:0 0 14px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px}
.grid{display:grid;gap:12px}
.g2{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.g3{grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
.g4{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.btn{border:0;background:var(--blue);color:#fff;padding:10px 18px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer}
.btn:hover{background:var(--blue-d)}
.btn:disabled{opacity:.4;cursor:default}
.btn.ghost{background:var(--blue-l);color:var(--blue-d)}
.btn.sm{padding:5px 10px;font-size:13px;border-radius:8px}
.spk{border:0;background:var(--blue-l);color:var(--blue-d);width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:15px;flex:none}
.spk:hover{background:var(--blue);color:#fff}
.note{border-left:5px solid var(--sun);background:var(--sun-l);padding:12px 14px;border-radius:0 10px 10px 0;font-size:15px}
.trap{border-left:5px solid var(--bad);background:var(--bad-l);padding:12px 14px;border-radius:0 10px 10px 0;font-size:15px}
.teach{border:2px dashed var(--ink);background:#fff;padding:12px 14px;border-radius:12px;font-size:14px;margin:18px 0}
.teach b{font-family:Georgia,serif}
.chip{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);background:#fff;border-radius:99px;padding:6px 12px;cursor:pointer;font-size:15px}
.chip:hover{border-color:var(--blue)}
.chip.sel{background:var(--blue);color:#fff;border-color:var(--blue)}
.chip.ok{background:var(--ok-l);border-color:var(--ok)}
.chip.bad{background:var(--bad-l);border-color:var(--bad)}
.opts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.fb{margin-top:10px;font-size:14.5px}
.fb.ok{color:var(--ok)} .fb.bad{color:var(--bad)}
table{border-collapse:collapse;width:100%}
td,th{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:15px}
th{font-family:Georgia,serif;font-size:14px;color:var(--soft)}
.row{display:flex;align-items:center;gap:10px}
.bubble{padding:10px 14px;border-radius:14px;max-width:560px;font-size:17px}
.line{display:flex;gap:10px;align-items:flex-start;margin:10px 0}
.line.r{flex-direction:row-reverse}
.av{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:22px;flex:none}
.who{font-size:12px;color:var(--soft);margin-bottom:2px}
.en-line{font-size:14px;color:var(--soft);margin-top:4px}
.blur{filter:blur(5px);cursor:pointer;user-select:none}
.flip{perspective:800px;height:130px;cursor:pointer}
.flip-in{position:relative;width:100%;height:100%;transition:transform .45s;transform-style:preserve-3d}
.flip.on .flip-in{transform:rotateY(180deg)}
.face{position:absolute;inset:0;backface-visibility:hidden;border-radius:14px;border:1px solid var(--line);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px;text-align:center}
.face.back{transform:rotateY(180deg);background:var(--blue);color:#fff;border-color:var(--blue)}
.big{font-family:Georgia,serif;font-weight:700;font-size:19px}
.num{width:100%;padding:10px 0;border:1.5px solid var(--line);background:#fff;border-radius:12px;cursor:pointer;text-align:center}
.num:hover{border-color:var(--blue)}
.num b{display:block;font-family:Georgia,serif;font-size:24px}
.tile{width:54px;padding:8px 0;border:1.5px solid var(--ink);border-radius:10px;text-align:center;background:#fff;cursor:pointer}
.tile b{display:block;font-family:Georgia,serif;font-size:24px}
.tile span{font-size:11px;color:var(--soft)}
input[type=text]{width:100%;max-width:340px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;font-size:17px;font-family:inherit}
input[type=text]:focus{outline:2px solid var(--blue);border-color:var(--blue)}
.check{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1.5px solid var(--line);border-radius:12px;background:#fff;cursor:pointer;margin-bottom:8px}
.check.on{background:var(--ok-l);border-color:var(--ok)}
.box{width:22px;height:22px;border:2px solid var(--ink);border-radius:6px;display:grid;place-items:center;flex:none;font-size:14px}
.check.on .box{background:var(--ok);border-color:var(--ok);color:#fff}
.nav{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);z-index:30}
.nav-in{max-width:940px;margin:0 auto;padding:10px 18px;display:flex;align-items:center;gap:10px}
.dots{flex:1;display:flex;justify-content:center;gap:6px;flex-wrap:wrap}
.dot{width:11px;height:11px;border-radius:50%;border:0;background:var(--line);cursor:pointer;padding:0}
.dot.cur{background:var(--blue);transform:scale(1.35)}
.dot.seen{background:var(--ink)}
button:focus-visible,.chip:focus-visible,.num:focus-visible,.tile:focus-visible{outline:3px solid var(--sun);outline-offset:2px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
@media (max-width:560px){.dots{display:none}.nav-in{justify-content:space-between}}
`;

/* ------------------------- small visuals ------------------------- */

function Avatar({ emoji, bg }) {
  return <div className="av" style={{ background: bg }}>{emoji}</div>;
}

const FLAGS = {
  mx: { d: "v", c: ["#006847", "#ffffff", "#ce1126"], w: [1, 1, 1] },
  es: { d: "h", c: ["#aa151b", "#f1bf00", "#aa151b"], w: [1, 2, 1] },
  co: { d: "h", c: ["#fcd116", "#003893", "#ce1126"], w: [2, 1, 1] },
  ar: { d: "h", c: ["#74acdf", "#ffffff", "#74acdf"], w: [1, 1, 1] },
  pe: { d: "v", c: ["#d91023", "#ffffff", "#d91023"], w: [1, 1, 1] },
};

function Flag({ code, size = 56 }) {
  const W = 60, H = 40;
  let body;
  if (code === "us") {
    body = (
      <g>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="0" y={(H / 7) * i} width={W} height={H / 7 + 0.5} fill={i % 2 ? "#fff" : "#b22234"} />
        ))}
        <rect x="0" y="0" width="26" height={(H / 7) * 4} fill="#3c3b6e" />
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx={5 + (i % 4) * 5.5} cy={4 + Math.floor(i / 4) * 5} r="1" fill="#fff" />
        ))}
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
    const f = FLAGS[code];
    const total = f.w.reduce((a, b) => a + b, 0);
    body = (
      <g>
        {f.c.map((col, i) => {
          const part = (f.w[i] / total) * (f.d === "h" ? H : W);
          const offset = f.w
            .slice(0, i)
            .reduce((sum, weight) => sum + (weight / total) * (f.d === "h" ? H : W), 0);
          return f.d === "h" ? (
            <rect key={i} x="0" y={offset} width={W} height={part + 0.5} fill={col} />
          ) : (
            <rect key={i} x={offset} y="0" width={part + 0.5} height={H} fill={col} />
          );
        })}
      </g>
    );
  }
  return (
    <svg width={size} height={(size * H) / W} viewBox={`0 0 ${W} ${H}`} style={{ borderRadius: 6, border: "1px solid #DCE0EC", flex: "none" }} aria-hidden="true">
      {body}
    </svg>
  );
}

function Speak({ text, queue }) {
  return (
    <button className="spk" onClick={(e) => { e.stopPropagation(); speak(text, queue); }} aria-label={`Listen: ${text}`} title="Listen">
      🔊
    </button>
  );
}

function TeacherNote({ show, children }) {
  if (!show) return null;
  return (
    <div className="teach">
      <b>Teacher's note.</b> {children}
    </div>
  );
}

function PageHead({ es, en }) {
  return (
    <div className="pagehead">
      <div className="es">{es}</div>
      <div className="en">{en}</div>
    </div>
  );
}

/* ------------------------- interactive pieces ------------------------- */

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
  };
  const next = () => {
    if (i + 1 < items.length) { setI(i + 1); setSel(null); }
    else setDone(true);
  };
  const reset = () => { setI(0); setSel(null); setScore(0); setDone(false); };

  if (done)
    return (
      <div className="card">
        <h3>{title || "Quiz"}: {score} / {items.length}</h3>
        <p className="sub">
          {score === items.length ? "Perfect. ¡Muy bien!" : score >= items.length - 1 ? "Almost there. ¡Casi!" : "Good effort. Try again and listen to each answer."}
        </p>
        <button className="btn" onClick={reset}>Try again</button>
      </div>
    );

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <b>{title || "Quick check"}</b>
        <span className="sub" style={{ margin: 0 }}>{i + 1} of {items.length}</span>
      </div>
      <p style={{ fontSize: 18, margin: "12px 0 0" }}>{it.q}</p>
      <div className="opts">
        {it.o.map((o) => (
          <button
            key={o}
            className={"chip " + (sel === null ? "" : o === it.a ? "ok" : o === sel ? "bad" : "")}
            onClick={() => { pick(o); if (it.say) speak(it.say); }}
          >
            {o}
          </button>
        ))}
      </div>
      {sel !== null && (
        <>
          <div className={"fb " + (sel === it.a ? "ok" : "bad")}>
            <b>{sel === it.a ? "Correct. " : "Not quite. "}</b>{it.why}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn sm" onClick={next}>{i + 1 < items.length ? "Next question" : "See score"}</button>
          </div>
        </>
      )}
    </div>
  );
}

function WordOrder({ sentences }) {
  const [k, setK] = useState(0);
  const target = sentences[k];
  const words = useMemo(() => shuffle(target.split(" "), String(k)), [target, k]);
  const [built, setBuilt] = useState([]);
  const [checked, setChecked] = useState(false);
  const used = (idx) => built.includes(idx);
  const answer = built.map((b) => words[b]).join(" ");
  const right = answer === target;

  const next = () => { setK((k + 1) % sentences.length); setBuilt([]); setChecked(false); };

  return (
    <div className="card">
      <b>Build the sentence</b>
      <p className="sub" style={{ margin: "4px 0 10px" }}>Tap the words in the right order. Tap a word in your sentence to remove it.</p>
      <div style={{ minHeight: 52, border: "1.5px dashed var(--line)", borderRadius: 12, padding: 8 }} className="opts">
        {built.map((b, n) => (
          <button key={n} className={"chip " + (checked ? (right ? "ok" : "bad") : "sel")} onClick={() => { if (!checked) setBuilt(built.filter((_, x) => x !== n)); }}>
            {words[b]}
          </button>
        ))}
      </div>
      <div className="opts">
        {words.map((w, idx) => (
          <button key={idx} className="chip" disabled={used(idx)} style={{ opacity: used(idx) ? 0.3 : 1 }} onClick={() => !checked && setBuilt([...built, idx])}>
            {w}
          </button>
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

function Dialogue({ title, lines, cast }) {
  const [showEn, setShowEn] = useState(false);
  const [role, setRole] = useState(null);
  const [revealed, setRevealed] = useState({});
  const speakers = [...new Set(lines.map((l) => l.s))];
  const colors = ["#E6EAFF", "#FFF4D6", "#DDF5EA"];

  const playAll = () => {
    speak("", false);
    lines.forEach((l) => speak(l.es, true));
  };

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
          <button key={s} className={"chip " + (role === s ? "sel" : "")} onClick={() => { setRole(role === s ? null : s); setRevealed({}); }}>
            {s}
          </button>
        ))}
      </div>
      {lines.map((l, i) => {
        const idx = speakers.indexOf(l.s);
        const hidden = role === l.s && !revealed[i];
        return (
          <div key={i} className={"line " + (idx % 2 ? "r" : "")}>
            <Avatar emoji={cast[l.s] || "🙂"} bg={colors[idx % 3]} />
            <div>
              <div className="who" style={{ textAlign: idx % 2 ? "right" : "left" }}>{l.s}</div>
              <div className="row" style={{ flexDirection: idx % 2 ? "row-reverse" : "row" }}>
                <div
                  className="bubble"
                  style={{ background: colors[idx % 3] }}
                  onClick={() => hidden && setRevealed({ ...revealed, [i]: true })}
                >
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

function FlipCard({ es, en, icon, known, onKnown }) {
  const [on, setOn] = useState(false);
  return (
    <div className={"flip " + (on ? "on" : "")} onClick={() => setOn(!on)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOn(!on)}>
      <div className="flip-in">
        <div className="face" style={known ? { borderColor: "var(--ok)", background: "var(--ok-l)" } : {}}>
          <div style={{ fontSize: 28 }}>{icon}</div>
          <div className="big">{es}</div>
          <div className="row">
            <Speak text={es} />
          </div>
        </div>
        <div className="face back">
          <div style={{ fontSize: 18, fontWeight: 700 }}>{en}</div>
          <button
            className="btn sm"
            style={{ background: known ? "var(--ok)" : "#fff", color: known ? "#fff" : "var(--blue-d)" }}
            onClick={(e) => { e.stopPropagation(); onKnown(); }}
          >
            {known ? "✓ I know it" : "Mark as known"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- data ------------------------- */

const VOCAB = [
  ["Hola", "Hello / Hi", "👋"],
  ["Buenos días", "Good morning", "🌅"],
  ["Buenas tardes", "Good afternoon", "☀️"],
  ["Buenas noches", "Good evening / Good night", "🌙"],
  ["¿Cómo estás?", "How are you? (informal)", "🙂"],
  ["Bien, gracias", "Fine, thanks", "👍"],
  ["Mucho gusto", "Nice to meet you", "🤝"],
  ["Igualmente", "Likewise / You too", "🔁"],
  ["Adiós", "Goodbye", "🚪"],
  ["Chao", "Bye (casual)", "✌️"],
  ["Hasta luego", "See you later", "⏰"],
  ["Hasta mañana", "See you tomorrow", "📅"],
  ["Por favor", "Please", "🙏"],
  ["Gracias", "Thank you", "💛"],
  ["De nada", "You're welcome", "😊"],
  ["Perdón", "Sorry / Excuse me", "🙇"],
];

const VOWELS = [
  { v: "a", sound: "ah", word: "casa", trap: "Not the 'a' in cat or cake." },
  { v: "e", sound: "eh", word: "mesa", trap: "Short and crisp. Don't glide to 'ay' like in say." },
  { v: "i", sound: "ee", word: "sí", trap: "Always 'ee' as in see. Never 'eye'." },
  { v: "o", sound: "oh", word: "hola", trap: "Don't glide to 'ow' like in go. Keep it pure." },
  { v: "u", sound: "oo", word: "uno", trap: "Always 'oo' as in moon. Never 'you'." },
];

const CONSONANTS = [
  ["h", "hola", "Silent. Never pronounced."],
  ["j", "jugo", "A strong 'h' sound, like a soft 'hh' in hello."],
  ["ll / y", "yo, llamo", "Like the 'y' in yes (some countries say 'j' as in jam)."],
  ["ñ", "año", "Like 'ny' in canyon."],
  ["r", "pero", "A quick tap, like the 'tt' in butter (American English)."],
  ["rr", "perro", "A rolled trill. Takes practice. Start with 'tr-tr-tr'."],
  ["b / v", "bien, vaso", "Exactly the same sound in Spanish."],
];

const LETTERS = {
  a: "a", b: "be", c: "ce", d: "de", e: "e", f: "efe", g: "ge", h: "hache", i: "i", j: "jota",
  k: "ka", l: "ele", m: "eme", n: "ene", ñ: "eñe", o: "o", p: "pe", q: "cu", r: "erre", s: "ese",
  t: "te", u: "u", v: "uve", w: "doble ve", x: "equis", y: "ye", z: "zeta",
};

const NUMBERS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];

const COUNTRIES = [
  { flag: "us", name: "Estados Unidos", m: "estadounidense", f: "estadounidense" },
  { flag: "cl", name: "Chile", m: "chileno", f: "chilena" },
  { flag: "mx", name: "México", m: "mexicano", f: "mexicana" },
  { flag: "es", name: "España", m: "español", f: "española" },
  { flag: "co", name: "Colombia", m: "colombiano", f: "colombiana" },
  { flag: "ar", name: "Argentina", m: "argentino", f: "argentina" },
  { flag: "pe", name: "Perú", m: "peruano", f: "peruana" },
];

const QWORDS = [
  ["¿Cómo?", "How?", "¿Cómo te llamas?", "What's your name?"],
  ["¿Qué?", "What?", "¿Qué es esto?", "What is this?"],
  ["¿Dónde?", "Where?", "¿Dónde estás?", "Where are you?"],
  ["¿De dónde?", "Where from?", "¿De dónde eres?", "Where are you from?"],
  ["¿Quién?", "Who?", "¿Quién es él?", "Who is he?"],
  ["¿Cuántos años?", "How old?", "¿Cuántos años tienes?", "How old are you?"],
];

/* ------------------------- pages ------------------------- */

function Cover({ me, setMe, partner, setPartner, teacher }) {
  const goals = [
    ["👋", "Greet people and say goodbye", "Hola · Buenos días · Hasta luego"],
    ["🪪", "Say and ask names", "Me llamo… ¿Cómo te llamas?"],
    ["🔤", "Spell names and use numbers 0–20", "¿Cómo se escribe? · Tengo… años"],
    ["🌎", "Say where you're from", "Soy de… ¿De dónde eres?"],
    ["👫", "Introduce another person", "Él es mi esposo. Ella es mi amiga."],
  ];
  return (
    <>
      <PageHead es="Mucho gusto" en="Unit 1 · Meeting people and talking with your family" />
      <svg viewBox="0 0 600 190" style={{ width: "100%", maxWidth: 600 }} role="img" aria-label="Two speech bubbles: ¡Hola! and Hello!">
        <rect x="10" y="20" width="260" height="110" rx="26" fill="#2F4BFF" />
        <polygon points="60,128 40,172 100,128" fill="#2F4BFF" />
        <text x="140" y="92" textAnchor="middle" fontFamily="Georgia, serif" fontSize="56" fontWeight="700" fill="#fff">¡Hola!</text>
        <rect x="330" y="50" width="260" height="110" rx="26" fill="#FFC233" />
        <polygon points="540,158 560,184 500,158" fill="#FFC233" />
        <text x="460" y="122" textAnchor="middle" fontFamily="Georgia, serif" fontSize="56" fontWeight="700" fill="#0F1B33">Hello!</text>
      </svg>

      <div className="sec">
        <h3>Make it yours</h3>
        <p className="sub">Your names appear in the conversations on the next pages.</p>
        <div className="grid g2">
          <label>Your name<br /><input type="text" value={me} onChange={(e) => setMe(e.target.value)} /></label>
          <label>Your partner's name<br /><input type="text" value={partner} onChange={(e) => setPartner(e.target.value)} /></label>
        </div>
      </div>

      <div className="sec">
        <h3>By the end of this unit, you can…</h3>
        <p className="sub">Five things you will say with confidence.</p>
        <div className="grid g3">
          {goals.map(([ic, t, ex]) => (
            <div className="card" key={t}>
              <div style={{ fontSize: 30 }}>{ic}</div>
              <b>{t}</b>
              <div className="sub" style={{ margin: "6px 0 0" }}>{ex}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="note">
        <b>How this book works.</b> Listen first, then say it out loud. Tap 🔊 anywhere to hear a word. Spanish is spelled the way it sounds, so every new sound you learn today helps you read everything later.
      </div>

      <TeacherNote show={teacher}>
        Mirrors Interchange Intro Unit 1 ("Please call me Beth"): Snapshot → Conversation → Vocabulary → Pronunciation → Grammar → Speaking → Review. Plan 4 sessions of 60 min: S1 pages 2–3, S2 pages 4–5, S3 pages 6–7, S4 pages 8–9. Rule: 80% of class in Spanish, supported by pictures and gestures.
      </TeacherNote>
    </>
  );
}

function Conversation1({ me, partner, teacher }) {
  const cast = { [partner]: "👨", [me]: "👩", Camila: "👩‍🦰" };
  const meeting = [
    { s: partner, es: "¡Hola! Me llamo " + partner + ". ¿Cómo te llamas?", en: `Hi! My name is ${partner}. What's your name?` },
    { s: me, es: "Hola, " + partner + ". Me llamo " + me + ". Mucho gusto.", en: `Hi, ${partner}. My name is ${me}. Nice to meet you.` },
    { s: partner, es: "Mucho gusto, " + me + ". ¿Cómo estás?", en: `Nice to meet you, ${me}. How are you?` },
    { s: me, es: "Bien, gracias. ¿Y tú?", en: "Fine, thanks. And you?" },
    { s: partner, es: "Muy bien, gracias.", en: "Very well, thank you." },
  ];
  const parting = [
    { s: "Camila", es: "Buenos días. ¿Cómo te llamas?", en: "Good morning. What's your name?" },
    { s: me, es: "Me llamo " + me + ". ¿Y tú?", en: `My name is ${me}. And you?` },
    { s: "Camila", es: "Me llamo Camila. Mucho gusto.", en: "My name is Camila. Nice to meet you." },
    { s: me, es: "Igualmente.", en: "Likewise." },
    { s: "Camila", es: "Hasta luego, " + me + ".", en: `See you later, ${me}.` },
    { s: me, es: "Chao, Camila.", en: "Bye, Camila." },
  ];
  return (
    <>
      <PageHead es="Conversación" en="Listen, read, then act it out" />
      <p className="sub">Step 1: press ▶ Play all and just listen. Step 2: show the English. Step 3: hide your role and say your lines from memory.</p>
      <Dialogue title="1 · Meeting for the first time" lines={meeting} cast={cast} />
      <div style={{ height: 14 }} />
      <Dialogue title="2 · A morning greeting and goodbye" lines={parting} cast={cast} />
      <div className="note" style={{ marginTop: 18 }}>
        <b>Notice.</b> Spanish uses two question marks: <b>¿</b> to open and <b>?</b> to close. The first one tells you a question is coming before you read it.
      </div>
      <TeacherNote show={teacher}>
        Do not teach grammar yet. Treat "me llamo" and "¿cómo estás?" as chunks. Chain: teacher models → choral → half the class → pairs → student with her partner. Her partner can be the "native model" for 5 minutes at the end of each session.
      </TeacherNote>
    </>
  );
}

function Vocabulary({ known, setKnown, teacher }) {
  const count = Object.values(known).filter(Boolean).length;
  return (
    <>
      <PageHead es="Vocabulario" en="Greetings and polite words" />
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <p className="sub" style={{ margin: 0 }}>Tap a card to flip it. Say the word before you flip.</p>
        <b>{count} / {VOCAB.length} known</b>
      </div>
      <div className="bar" style={{ margin: "10px 0 18px" }}><i style={{ width: `${(count / VOCAB.length) * 100}%` }} /></div>
      <div className="grid g4">
        {VOCAB.map(([es, en, ic]) => (
          <FlipCard key={es} es={es} en={en} icon={ic} known={!!known[es]} onKnown={() => setKnown({ ...known, [es]: !known[es] })} />
        ))}
      </div>
      <div className="grid g2" style={{ marginTop: 22 }}>
        <div className="note"><b>"Buenas noches"</b> works for both "good evening" and "good night". Spanish doesn't separate them.</div>
        <div className="trap"><b>Common trap:</b> "Gracias" ends in <b>-s</b>, and the <b>c</b> sounds like <b>s</b> in Latin America. Say "GRAH-syahs".</div>
      </div>
      <TeacherNote show={teacher}>
        Quick game: lay out 6 cards, say a greeting, she points. Then swap roles. Also useful: show a clock or sun icon and she must choose buenos días / buenas tardes / buenas noches. Chilean tip: "chao" and "gracias" are universal; save "cachai" and "po" for a later "bonus" box.
      </TeacherNote>
    </>
  );
}

function Pronunciation({ teacher }) {
  return (
    <>
      <PageHead es="Pronunciación" en="Five vowels and the tricky consonants" />
      <div className="sec">
        <h3>The five vowels never change</h3>
        <p className="sub">English vowels glide and shift. Spanish vowels are short, pure and always the same. Tap to hear.</p>
        <div className="grid g3">
          {VOWELS.map((x) => (
            <div className="card" key={x.v}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontFamily: "Georgia,serif", fontSize: 54, fontWeight: 700, color: "var(--blue)" }}>{x.v}</span>
                <Speak text={x.word} />
              </div>
              <b>"{x.sound}"</b> as in <b>{x.word}</b>
              <div className="sub" style={{ margin: "6px 0 0" }}>{x.trap}</div>
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <span className="sub" style={{ margin: 0 }}>Read the vowels in a row:</span>
          <button className="btn sm" onClick={() => { speak("", false); ["a", "e", "i", "o", "u"].forEach((v) => speak(v, true)); }}>🔊 a – e – i – o – u</button>
        </div>
      </div>

      <div className="sec">
        <h3>Consonants to watch</h3>
        <div className="card" style={{ padding: 6 }}>
          <table>
            <thead><tr><th>Letter</th><th>Example</th><th>Sound</th><th /></tr></thead>
            <tbody>
              {CONSONANTS.map(([l, w, d]) => (
                <tr key={l}>
                  <td><b style={{ fontFamily: "Georgia,serif", fontSize: 20 }}>{l}</b></td>
                  <td>{w}</td>
                  <td>{d}</td>
                  <td><Speak text={w.split(",")[0]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Quiz
        title="Sound check"
        items={[
          { q: "How do you say the word hola?", o: ["HOH-lah (h is silent)", "HHOH-lah (strong h)", "HOW-la"], a: "HOH-lah (h is silent)", why: "The Spanish h is always silent, and the o is a pure 'oh'.", say: "hola" },
          { q: "The Spanish i in sí sounds like…", o: ["see", "sigh", "sick"], a: "see", why: "The vowel i is always 'ee'.", say: "sí" },
          { q: "Which pair sounds the same in Spanish?", o: ["b and v", "j and h", "r and rr"], a: "b and v", why: "B and V are identical. (J is a strong sound, h is silent, and rr is rolled.)" },
        ]}
      />
      <TeacherNote show={teacher}>
        Her biggest enemy is diphthongizing vowels (o → "ow", e → "ay"). Use a mirror or a hand gesture: flat hand = no glide. For rr, start with "butter" → "budder" → "tr-tr-tr". Don't aim for perfection at Intro level: aim for understandable.
      </TeacherNote>
    </>
  );
}

function AlphabetNumbers({ teacher }) {
  const [text, setText] = useState("");
  const [age, setAge] = useState(null);
  const letters = [...text.toLowerCase()].filter((c) => c === " " || LETTERS[c] || c === "-");
  return (
    <>
      <PageHead es="El alfabeto y los números" en="Spell your name · numbers 0–20" />
      <div className="sec">
        <h3>Spell it</h3>
        <p className="sub">Type any name. Tap a tile to hear the letter name.</p>
        <input type="text" placeholder="Type a name…" value={text} onChange={(e) => setText(e.target.value)} aria-label="Name to spell" />
        <div className="opts" style={{ marginTop: 12 }}>
          {letters.length === 0 && <span className="sub">Your tiles will appear here.</span>}
          {letters.map((c, i) =>
            c === " " ? <span key={i} style={{ width: 20 }} /> : (
              <button key={i} className="tile" onClick={() => speak(LETTERS[c] || c)}>
                <b>{c.toUpperCase()}</b>
                <span>{LETTERS[c]}</span>
              </button>
            )
          )}
        </div>
        {letters.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <button className="btn sm" onClick={() => { speak("", false); letters.forEach((c) => c !== " " && speak(LETTERS[c] || c, true)); }}>🔊 Spell it out loud</button>
          </div>
        )}
        <div className="grid g2" style={{ marginTop: 12 }}>
          <div className="note"><b>¿Cómo se escribe?</b> means "How do you spell it?" Answer: <b>Se escribe E-M-I-L-Y.</b></div>
          <div className="note"><b>Letter ñ</b> is its own letter: "eñe". And <b>w</b> is "doble ve" or "doble u".</div>
        </div>
      </div>

      <div className="sec">
        <h3>Numbers 0–20</h3>
        <div className="grid g4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(84px,1fr))" }}>
          {NUMBERS.map((n, i) => (
            <button key={n} className="num" onClick={() => speak(n)}>
              <b>{i}</b>
              <span style={{ fontSize: 13 }}>{n}</span>
            </button>
          ))}
        </div>
        <p className="sub" style={{ marginTop: 10 }}>Pattern: 16–19 are <b>diez + y + number</b> joined (dieciséis, diecisiete…). Spanish changes pattern after 20.</p>
      </div>

      <div className="sec">
        <h3>How old are you?</h3>
        <div className="card">
          <div className="row" style={{ flexWrap: "wrap" }}>
            <b style={{ fontSize: 18 }}>¿Cuántos años tienes?</b>
            <Speak text="¿Cuántos años tienes?" />
          </div>
          <div className="opts">
            {[8, 12, 20].map((n) => (
              <button key={n} className={"chip " + (age === n ? "sel" : "")} onClick={() => { setAge(n); speak(`Tengo ${NUMBERS[n]} años`); }}>{n}</button>
            ))}
          </div>
          {age !== null && <p style={{ fontSize: 20, margin: "12px 0 0" }}>Tengo <b>{NUMBERS[age]}</b> años.</p>}
          <div className="trap" style={{ marginTop: 12 }}>
            <b>Big difference:</b> English says "I <i>am</i> 20." Spanish says "I <i>have</i> 20 years" (<b>tengo</b>). Never say "soy veinte años".
          </div>
        </div>
      </div>

      <Quiz
        title="Check yourself"
        items={[
          { q: "How do you say 'I'm 7 years old'?", o: ["Tengo siete años", "Soy siete años", "Estoy siete años"], a: "Tengo siete años", why: "Spanish uses tener (to have) for age.", say: "Tengo siete años" },
          { q: "What number is 'quince'?", o: ["5", "15", "50"], a: "15", why: "Cinco = 5, quince = 15.", say: "quince" },
          { q: "How do you ask 'How do you spell it?'", o: ["¿Cómo se escribe?", "¿Cómo te llamas?", "¿Qué es?"], a: "¿Cómo se escribe?", why: "Escribir = to write, so se escribe = it is written.", say: "¿Cómo se escribe?" },
        ]}
      />
      <TeacherNote show={teacher}>
        Activity: spell the names of her husband's family members (suegros, cuñados). Then phone numbers in pairs of digits. Keep it low-pressure: this is memory work, so repeat it in short bursts every class.
      </TeacherNote>
    </>
  );
}

function GrammarSer({ me, teacher }) {
  const [pron, setPron] = useState(true);
  const rows = [
    ["yo", "soy", "I am"],
    ["tú", "eres", "you are (informal)"],
    ["él / ella", "es", "he / she is"],
    ["usted", "es", "you are (formal)"],
  ];
  return (
    <>
      <PageHead es="Gramática: me llamo y ser" en="Say your name and who you are" />
      <div className="grid g2">
        <div className="card">
          <h3 style={{ fontSize: 20 }}>Two ways to give your name</h3>
          <p style={{ fontSize: 18, margin: "10px 0" }}>
            <b>Me llamo</b> {me}. <Speak text={`Me llamo ${me}`} /><br />
            <b>Soy</b> {me}. <Speak text={`Soy ${me}`} />
          </p>
          <div className="sub" style={{ margin: 0 }}>"Me llamo" literally means "I call myself". Both are natural.</div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 20 }}>Ser: to be (identity, origin)</h3>
          <table>
            <tbody>
              {rows.map(([p, v, en]) => (
                <tr key={p + v}>
                  <td style={{ color: pron ? "var(--ink)" : "var(--line)", transition: "color .3s" }}>{p}</td>
                  <td><b style={{ fontSize: 20, color: "var(--blue)" }}>{v}</b></td>
                  <td className="sub">{en}</td>
                  <td><Speak text={`${v}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10 }}>
            <button className="btn ghost sm" onClick={() => setPron(!pron)}>{pron ? "Hide the pronouns" : "Show the pronouns"}</button>
          </div>
        </div>
      </div>

      <div className="grid g2" style={{ marginTop: 14 }}>
        <div className="note"><b>Pronouns usually disappear.</b> Say "Soy {me}", not "Yo soy {me}". The verb ending already tells you who. Use "yo" only to contrast: "Yo soy {me}, ¿y tú?"</div>
        <div className="trap"><b>Coming in Unit 2:</b> Spanish has two verbs for "to be": <b>ser</b> (who/what/where from) and <b>estar</b> (how/where now). Today, only <b>ser</b>.</div>
      </div>

      <div className="sec">
        <h3>Practice</h3>
        <div className="grid g2">
          <Quiz
            title="Choose the verb"
            items={[
              { q: "Yo ___ de Estados Unidos.", o: ["soy", "eres", "es"], a: "soy", why: "With yo (I), the form is soy.", say: "Yo soy de Estados Unidos" },
              { q: "¿Tú ___ de Chile?", o: ["soy", "eres", "es"], a: "eres", why: "With tú (you), the form is eres.", say: "¿Tú eres de Chile?" },
              { q: "Él ___ mi esposo.", o: ["soy", "eres", "es"], a: "es", why: "He / she / usted all use es.", say: "Él es mi esposo" },
              { q: "Ella ___ Camila.", o: ["soy", "eres", "es"], a: "es", why: "She = ella → es.", say: "Ella es Camila" },
            ]}
          />
          <WordOrder sentences={["Me llamo Emily", "Soy de Estados Unidos", "¿De dónde eres?", "Él es mi esposo"]} />
        </div>
      </div>
      <TeacherNote show={teacher}>
        Her question will be "why soy and not estoy?". Keep the answer short for now: "Soy = identity and origin. Estoy = feelings and location. We'll do estar next unit." Do not open the whole ser/estar debate today. Drill with a quick chain: "Yo soy…, tú eres…, él es…" using photos.
      </TeacherNote>
    </>
  );
}

function Countries({ teacher }) {
  const [gender, setGender] = useState("f");
  return (
    <>
      <PageHead es="Países y nacionalidades" en="Where are you from?" />
      <div className="card">
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <b style={{ fontSize: 18 }}>¿De dónde eres?</b><Speak text="¿De dónde eres?" />
          <span style={{ width: 16 }} />
          <b style={{ fontSize: 18 }}>Soy de Estados Unidos.</b><Speak text="Soy de Estados Unidos" />
        </div>
        <div className="sub" style={{ margin: "6px 0 0" }}>Also: <b>Soy estadounidense</b> (I'm American). Note: nationalities are lowercase in Spanish.</div>
      </div>

      <div className="sec">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h3>Nationalities change with gender</h3>
          <div className="row">
            <button className={"chip " + (gender === "m" ? "sel" : "")} onClick={() => setGender("m")}>👨 Talking about a man</button>
            <button className={"chip " + (gender === "f" ? "sel" : "")} onClick={() => setGender("f")}>👩 Talking about a woman</button>
          </div>
        </div>
        <div className="grid g3" style={{ marginTop: 12 }}>
          {COUNTRIES.map((c) => (
            <div className="card" key={c.name}>
              <div className="row">
                <Flag code={c.flag} />
                <div>
                  <b>{c.name}</b>
                  <div style={{ fontSize: 19, color: "var(--blue)", fontWeight: 700 }}>{gender === "m" ? c.m : c.f}</div>
                </div>
                <div style={{ marginLeft: "auto" }}><Speak text={`${c.name}. ${gender === "m" ? c.m : c.f}`} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g3">
        <div className="note"><b>-o → -a</b><br />chileno → chilena</div>
        <div className="note"><b>consonant → add -a</b><br />español → española</div>
        <div className="note"><b>-e / -a stay the same</b><br />estadounidense, argentina*</div>
      </div>
      <p className="sub" style={{ marginTop: 6 }}>*Argentino (m) / argentina (f) follows the -o → -a rule. Only words ending in -e don't change.</p>

      <div style={{ height: 8 }} />
      <Quiz
        title="Where is she from?"
        items={[
          { q: "Sofía es de Colombia. Sofía es ___.", o: ["colombiano", "colombiana", "colombiane"], a: "colombiana", why: "Sofía is a woman, so -o becomes -a.", say: "Sofía es colombiana" },
          { q: "Diego es de Chile. Diego es ___.", o: ["chileno", "chilena", "chilenos"], a: "chileno", why: "Diego is a man, so -o.", say: "Diego es chileno" },
          { q: "Mary es de Estados Unidos. Mary es ___.", o: ["estadounidensa", "estadounidense", "estadounidenso"], a: "estadounidense", why: "Words ending in -e don't change for gender.", say: "Mary es estadounidense" },
          { q: "Carlos es de España. Carlos es ___.", o: ["español", "españolo", "española"], a: "español", why: "A man, ending in a consonant: español. A woman would be española.", say: "Carlos es español" },
        ]}
      />
      <TeacherNote show={teacher}>
        Put a world map on screen and have her place pins for her husband's family. Chile is the most relevant context, so add "chileno/a" early. Note: in Intro, keep singular forms only; plurals come later.
      </TeacherNote>
    </>
  );
}

function Introductions({ me, partner, teacher }) {
  const [s, setS] = useState({});
  const cast = { [partner]: "👨", [me]: "👩", Sofía: "👩‍🦰", "Sr. Pérez": "👴" };
  const intro = [
    { s: partner, es: "Sofía, ella es mi esposa, " + me + ".", en: `Sofía, this is my wife, ${me}.` },
    { s: "Sofía", es: "Hola, " + me + ". Mucho gusto. ¿De dónde eres?", en: `Hi, ${me}. Nice to meet you. Where are you from?` },
    { s: me, es: "Igualmente. Soy de Estados Unidos. ¿Y tú?", en: "Likewise. I'm from the United States. And you?" },
    { s: "Sofía", es: "Soy colombiana, pero mi esposo es chileno.", en: "I'm Colombian, but my husband is Chilean." },
  ];
  const formal = [
    { s: me, es: "Buenas tardes, señor Pérez. ¿Cómo está usted?", en: "Good afternoon, Mr. Pérez. How are you?" },
    { s: "Sr. Pérez", es: "Bien, gracias. ¿Y usted?", en: "Fine, thank you. And you?" },
    { s: me, es: "Muy bien, gracias. Mucho gusto.", en: "Very well, thank you. Nice to meet you." },
  ];
  const scenes = [
    ["Your husband", "tú", "Family and partners use tú."],
    ["A 6-year-old nephew", "tú", "Children always get tú."],
    ["Your husband's boss", "usted", "Formal or professional → usted."],
    ["An older stranger at the market", "usted", "Showing respect → usted."],
  ];
  return (
    <>
      <PageHead es="Presentar a otros" en="Introduce people · tú vs. usted" />
      <Dialogue title="Introducing your husband" lines={intro} cast={cast} />

      <div className="sec">
        <h3>Question words</h3>
        <p className="sub">Tap a card to hear the question.</p>
        <div className="grid g3">
          {QWORDS.map(([es, en, ex, exEn]) => (
            <div className="card" key={es} style={{ cursor: "pointer" }} onClick={() => speak(ex)}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <b style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "var(--blue)" }}>{es}</b>
                <span className="sub" style={{ margin: 0 }}>{en}</span>
              </div>
              <div style={{ marginTop: 6 }}>{ex}</div>
              <div className="sub" style={{ margin: 0 }}>{exEn}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="sec">
        <h3>Tú or usted?</h3>
        <p className="sub">Tú is informal. Usted is formal and uses the same verb form as he/she (es, está).</p>
        <div className="grid g2">
          {scenes.map(([who, ans, why]) => (
            <div className="card" key={who}>
              <b>{who}</b>
              <div className="opts">
                {["tú", "usted"].map((o) => (
                  <button key={o} className={"chip " + (s[who] ? (o === ans ? "ok" : s[who] === o ? "bad" : "") : "")} onClick={() => !s[who] && setS({ ...s, [who]: o })}>{o}</button>
                ))}
              </div>
              {s[who] && <div className={"fb " + (s[who] === ans ? "ok" : "bad")}>{s[who] === ans ? "Correct. " : `Answer: ${ans}. `}{why}</div>}
            </div>
          ))}
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          <b>When unsure, use usted.</b> Many families switch to tú quickly. You can ask: <b>¿Te puedo tutear?</b> <Speak text="¿Te puedo tutear?" />
        </div>
      </div>

      <Dialogue title="A formal greeting" lines={formal} cast={cast} />
      <TeacherNote show={teacher}>
        Culture check: usage of tú/usted varies by country and even by family. In Chile, many people use usted with elders and in service situations. Ask her husband which one his parents expect. Intro scope: recognition and basic use, not full mastery.
      </TeacherNote>
    </>
  );
}

function Review({ me, partner, teacher }) {
  const cando = [
    "I can greet people at different times of the day",
    "I can say my name and ask someone's name",
    "I can spell my name in Spanish",
    "I can say my age and count to 20",
    "I can say where I'm from and ask ¿De dónde eres?",
    "I can introduce my husband to another person",
    "I can ask ¿Cómo estás? and answer",
  ];
  const [done, setDone] = useState({});
  const count = Object.values(done).filter(Boolean).length;
  const missions = [
    ["🎙️", "Voice note", `Send ${partner} a 30-second voice note: greet him, say your name, age and where you're from.`],
    ["📞", "Family call", "On your next video call, introduce yourself to one relative using usted or tú."],
    ["🗣️", "Dinner game", `Spell three family names to ${partner}. He must guess who it is before you finish.`],
  ];
  return (
    <>
      <PageHead es="Repaso" en="Review · Can you do it?" />
      <div className="sec">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3>My checklist</h3>
          <b>{count} / {cando.length}</b>
        </div>
        <div className="bar" style={{ margin: "8px 0 14px" }}><i style={{ width: `${(count / cando.length) * 100}%` }} /></div>
        {cando.map((c, i) => (
          <div key={c} className={"check " + (done[i] ? "on" : "")} onClick={() => setDone({ ...done, [i]: !done[i] })} role="checkbox" aria-checked={!!done[i]} tabIndex={0} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setDone({ ...done, [i]: !done[i] })}>
            <div className="box">{done[i] ? "✓" : ""}</div>
            <div>{c}</div>
          </div>
        ))}
        {count === cando.length && <div className="note"><b>¡Felicidades, {me}!</b> Unit 1 is complete. Next up: Unit 2, "¿Dónde está…?"</div>}
      </div>

      <div className="sec">
        <h3>Final quiz</h3>
        <Quiz
          title="Unit 1 review"
          items={[
            { q: "It's 9 a.m. You walk into a shop. You say…", o: ["Buenas noches", "Buenos días", "Hasta luego"], a: "Buenos días", why: "Morning greeting.", say: "Buenos días" },
            { q: "Which means 'My name is Emily'?", o: ["Me llamo Emily", "Tengo Emily", "Eres Emily"], a: "Me llamo Emily", why: "Me llamo = I call myself.", say: "Me llamo Emily" },
            { q: "Tú ___ de Estados Unidos.", o: ["soy", "eres", "es"], a: "eres", why: "Tú → eres.", say: "Tú eres de Estados Unidos" },
            { q: "María es de México. María es ___.", o: ["mexicano", "mexicana", "mexicane"], a: "mexicana", why: "Woman → -a.", say: "María es mexicana" },
            { q: "To your husband's boss you say…", o: ["¿Cómo estás?", "¿Cómo está usted?", "¿Cómo eres?"], a: "¿Cómo está usted?", why: "Formal → usted.", say: "¿Cómo está usted?" },
          ]}
        />
      </div>

      <div className="sec">
        <h3>Speaking missions with {partner}</h3>
        <div className="grid g3">
          {missions.map(([ic, t, d]) => (
            <div className="card" key={t}>
              <div style={{ fontSize: 28 }}>{ic}</div>
              <b>{t}</b>
              <div className="sub" style={{ margin: "6px 0 0" }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <b>Model for the voice note</b>
        <p style={{ fontSize: 18, margin: "8px 0" }}>
          «Hola, me llamo {me}. Tengo ___ años. Soy de Estados Unidos. Soy estadounidense. Mucho gusto. ¡Hasta luego!»
        </p>
        <button className="btn sm" onClick={() => speak(`Hola, me llamo ${me}. Tengo veinte años. Soy de Estados Unidos. Soy estadounidense. Mucho gusto. Hasta luego.`)}>🔊 Listen to the model</button>
      </div>

      <TeacherNote show={teacher}>
        Mini-evaluation (10 min): she introduces herself, spells her name, says her age and origin, and introduces her husband. Then 10 minutes with her husband present. Collect her voice note before the next class and give feedback on only 2 things: vowels and one grammar point.
      </TeacherNote>
    </>
  );
}

/* ------------------------- app shell ------------------------- */

export default function Unidad1() {
  const [page, setPage] = useState(0);
  const [seen, setSeen] = useState({ 0: true });
  const [teacher, setTeacher] = useState(false);
  const [me, setMe] = useState("Emily");
  const [partner, setPartner] = useState("Diego");
  const [known, setKnown] = useState({});

  const pages = [
    { t: "Welcome", c: <Cover {...{ me, setMe, partner, setPartner, teacher }} /> },
    { t: "Conversation", c: <Conversation1 {...{ me, partner, teacher }} /> },
    { t: "Vocabulary", c: <Vocabulary {...{ known, setKnown, teacher }} /> },
    { t: "Pronunciation", c: <Pronunciation teacher={teacher} /> },
    { t: "Alphabet & numbers", c: <AlphabetNumbers teacher={teacher} /> },
    { t: "Grammar", c: <GrammarSer {...{ me, teacher }} /> },
    { t: "Countries", c: <Countries teacher={teacher} /> },
    { t: "Introductions", c: <Introductions {...{ me, partner, teacher }} /> },
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
          <div className="brand">Mucho <span>gusto</span></div>
          <div className="bar" aria-label="Progress"><i style={{ width: `${((page + 1) / pages.length) * 100}%` }} /></div>
          <span style={{ fontSize: 13, color: "var(--soft)" }}>{page + 1} / {pages.length} · {pages[page].t}</span>
          <button className={"toggle " + (teacher ? "on" : "")} onClick={() => setTeacher(!teacher)}>
            {teacher ? "Teacher mode: on" : "Teacher mode"}
          </button>
        </div>
      </div>

      <div className="wrap">{pages[page].c}</div>

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
