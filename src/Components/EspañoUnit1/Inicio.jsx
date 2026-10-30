import React, { useState, useEffect, lazy, Suspense } from "react";

/* =====================================================================
   INICIO · Portal para aprender inglés (Interchange Intro)
   Unidades a la izquierda y tareas a la derecha.
   ===================================================================== */

const UNITS = [
  {
    id: "unidad-1",
    n: 1,
    es: "Mucho gusto",
    en: "Meeting people",
    topics: ["Greetings", "Names", "Spelling and numbers", "Countries", "Introductions"],
    c: "#2F4BFF",
    l: "#E6EAFF",
    Component: lazy(() => import("./Unidad1.jsx")),
  },
  {
    id: "unidad-2",
    n: 2,
    es: "¿Qué es esto?",
    en: "Everyday things",
    topics: ["Objects", "El / la", "Plurals", "Este / ese", "Where things are"],
    c: "#0B7A75",
    l: "#DDF3F1",
    Component: lazy(() => import("./Unidad2.jsx")),
  },
];

const TASKS = [
  {
    id: "tarea-1",
    n: 1,
    es: "Ser y estar",
    en: "Workbook · 36 activities",
    topics: ["Conjugation", "Places", "Origins", "Personality", "Looks", "Professions"],
    goes: "Practice for units 1 and 2",
    c: "#7A68F0",
    l: "#E9E5FF",
    Component: lazy(() => import("./Tarea1.jsx")),
  },
];

const ALL = [...UNITS, ...TASKS];

/* ------------------------- LocalStorage ------------------------- */

const K_VISITED = "espanol-visited";
const K_LAST = "espanol-last";

const read = (k, d) => {
  try {
    const v = window.localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
};

const write = (k, v) => {
  try {
    window.localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    /* storage not available */
  }
};

/* ------------------------- Estilos CSS ------------------------- */

const CSS = `
.ini{min-height:100vh;background:#F5F7FA;color:#14213D;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.5}
.ini *{box-sizing:border-box}
.ini-wrap{max-width:1040px;margin:0 auto;padding:40px 20px 70px}
.ini-hero h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,7.5vw,68px);line-height:1.02;letter-spacing:-.02em;margin:0}
.ini-hero p{margin:10px 0 0;font-size:19px;color:#4C5A78}
.ini-cont{margin-top:22px;display:inline-flex;align-items:center;gap:10px;border:0;background:#14213D;color:#fff;padding:11px 18px;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}
.ini-cont:hover{background:#2A3A63}
.ini-cols{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;margin-top:40px;align-items:start}
@media (max-width:820px){.ini-cols{grid-template-columns:1fr;gap:44px}}
.ini-h{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.ini-h h2{font-family:Georgia,serif;font-size:30px;margin:0}
.ini-h span{color:#4C5A78;font-size:15px}
.ini-path{list-style:none;margin:0;padding:0}
.ini-path li{position:relative;padding:0 0 18px 64px}
.ini-path li::before{content:"";position:absolute;left:21px;top:42px;bottom:-2px;width:3px;background:#D3DAE6;border-radius:3px}
.ini-path li:last-child::before{display:none}
.ini-node{position:absolute;left:0;top:6px;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;font-family:Georgia,serif;font-weight:700;font-size:21px}
.ini-node.ghost{background:#fff;border:2px dashed #AEB8CC;color:#8693AD}
.ini-card{display:block;width:100%;text-align:left;font-family:inherit;color:#14213D;background:#fff;border:2px solid var(--c);border-radius:16px;padding:16px 18px;cursor:pointer;transition:transform .15s,box-shadow .15s}
.ini-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(20,33,61,.12)}
.ini-card:focus-visible,.ini-cont:focus-visible,.ini-home:focus-visible{outline:3px solid #FFB627;outline-offset:3px}
.ini-es{display:block;font-family:Georgia,serif;font-weight:700;font-size:26px;line-height:1.1}
.ini-en{display:block;color:#4C5A78;font-size:15px;margin-top:3px}
.ini-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ini-tags span{background:var(--l);border-radius:99px;padding:2px 11px;font-size:13px}
.ini-state{display:inline-block;margin-top:14px;font-weight:700;font-size:14px;color:var(--c)}
.ini-card.task{border-style:dashed;border-left:10px solid var(--c)}
.ini-goes{display:block;font-size:13px;font-weight:700;color:var(--c);margin-bottom:6px}
.ini-tasks{list-style:none;margin:0;padding:0;display:grid;gap:16px}
.ini-soon{border:2px dashed #AEB8CC;border-radius:16px;padding:16px 18px;color:#6B7893;background:transparent}
.ini-soon b{font-family:Georgia,serif;font-size:20px;color:#55627E}
.ini-foot{margin-top:46px;font-size:13.5px;color:#6B7893}
.ini-home{position:fixed;left:12px;bottom:80px;z-index:60;border:0;background:#14213D;color:#fff;padding:9px 15px;border-radius:99px;font-weight:700;font-size:14px;cursor:pointer;box-shadow:0 4px 14px rgba(20,33,61,.35);font-family:system-ui,sans-serif}
.ini-home:hover{background:#2A3A63}
.ini-load{min-height:60vh;display:grid;place-items:center;font-family:Georgia,serif;font-size:22px;color:#4C5A78}
@media (prefers-reduced-motion:reduce){.ini-card{transition:none}.ini-card:hover{transform:none}}
`;

/* ------------------------- Helpers ------------------------- */

const parseRoute = () => (typeof window === "undefined" ? "" : window.location.hash.replace(/^#\/?/, ""));

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

/* ------------------------- Vista Home ------------------------- */

function Home({ visited, last, open }) {
  const lastItem = ALL.find((x) => x.id === last);
  const label = (it, kind) => `${kind} ${it.n} · ${it.es}`;

  return (
    <div className="ini">
      <style>{CSS}</style>
      <div className="ini-wrap">
        <header className="ini-hero">
          <h1>{greeting()}.<br />¿Qué vamos a estudiar hoy?</h1>
          <p>What are we studying today? Pick a unit to learn, or a task to practice.</p>
          {lastItem && (
            <button className="ini-cont" onClick={() => open(lastItem.id)}>
              Continue where you left off:&nbsp;<b>{label(lastItem, UNITS.includes(lastItem) ? "Unidad" : "Tarea")}</b>
            </button>
          )}
        </header>

        <div className="ini-cols">
          <section aria-labelledby="ini-u">
            <div className="ini-h">
              <h2 id="ini-u">Unidades</h2>
              <span>Learn something new, in order</span>
            </div>
            <ol className="ini-path">
              {UNITS.map((u) => (
                <li key={u.id}>
                  <span className="ini-node" style={{ background: u.c }} aria-hidden="true">{u.n}</span>
                  <button className="ini-card" style={{ "--c": u.c, "--l": u.l }} onClick={() => open(u.id)} aria-label={`Unidad ${u.n}: ${u.es}`}>
                    <span className="ini-es">{u.es}</span>
                    <span className="ini-en">{u.en}</span>
                    <span className="ini-tags">{u.topics.map((t) => <span key={t}>{t}</span>)}</span>
                    <span className="ini-state">{visited.includes(u.id) ? "✓ Visited · open again" : "Open"}</span>
                  </button>
                </li>
              ))}
              <li>
                <span className="ini-node ghost" aria-hidden="true">{UNITS.length + 1}</span>
                <div className="ini-soon"><b>Unidad {UNITS.length + 1}</b><div>Coming soon</div></div>
              </li>
            </ol>
          </section>

          <section aria-labelledby="ini-t">
            <div className="ini-h">
              <h2 id="ini-t">Tareas</h2>
              <span>Practice what you learned</span>
            </div>
            <ul className="ini-tasks">
              {TASKS.map((t) => (
                <li key={t.id}>
                  <button className="ini-card task" style={{ "--c": t.c, "--l": t.l }} onClick={() => open(t.id)} aria-label={`Tarea ${t.n}: ${t.es}`}>
                    <span className="ini-goes">Tarea {t.n} · {t.goes}</span>
                    <span className="ini-es">{t.es}</span>
                    <span className="ini-en">{t.en}</span>
                    <span className="ini-tags">{t.topics.map((x) => <span key={x}>{x}</span>)}</span>
                    <span className="ini-state">{visited.includes(t.id) ? "✓ Visited · open again" : "Open"}</span>
                  </button>
                </li>
              ))}
              <li>
                <div className="ini-soon"><b>Tarea {TASKS.length + 1}</b><div>Coming soon</div></div>
              </li>
            </ul>
          </section>
        </div>

        <p className="ini-foot">The ✓ marks are saved in this browser only. Use the 🏠 Inicio button inside any unit or task to come back here.</p>
      </div>
    </div>
  );
}

/* ------------------------- Componente Principal ------------------------- */

export default function Inicio() {
  const [route, setRoute] = useState(parseRoute());
  const [visited, setVisited] = useState(() => read(K_VISITED, []));
  const [last, setLast] = useState(() => read(K_LAST, null));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const current = ALL.find((x) => x.id === route);

  useEffect(() => {
    if (!current) return;
    setVisited((v) => {
      if (v.includes(current.id)) return v;
      const nv = [...v, current.id];
      write(K_VISITED, nv);
      return nv;
    });
    setLast(current.id);
    write(K_LAST, current.id);
  }, [current]);

  const open = (id) => { window.location.hash = "/" + id; };
  const goHome = () => { window.location.hash = "/"; };

  if (!current) return <Home visited={visited} last={last} open={open} />;

  const Page = current.Component;
  return (
    <>
      <Suspense fallback={<div className="ini ini-load"><style>{CSS}</style>Cargando…</div>}>
        <Page />
      </Suspense>
      <button className="ini-home" onClick={goHome} aria-label="Back to the home page">🏠 Inicio</button>
      <style>{CSS}</style>
    </>
  );
}