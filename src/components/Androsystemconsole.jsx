import { useState, useEffect, useRef } from "react";

// ─── DATA LAYER ───────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "cli-agent",
    name: "cli-agent",
    status: "running",
    uptime: "14d 6h 22m",
    version: "v0.4.1",
    description: "Terminal-based AI agent for orchestrating tools and executing dev workflows via structured reasoning loops.",
    stack: ["Rust", "OpenAI API", "Tokio", "Clap"],
    cpu: 34,
    mem: 61,
    requests: 1247,
    port: 8001,
  },
  {
    id: "jsonflow",
    name: "jsonflow",
    status: "running",
    uptime: "9d 11h 04m",
    version: "v0.2.0",
    description: "Graph-based JSON transformation pipeline using dependency graphs and transformation nodes.",
    stack: ["Go", "DAG Engine", "gRPC", "Redis"],
    cpu: 18,
    mem: 43,
    requests: 5892,
    port: 8002,
  },
  {
    id: "graph-engine",
    name: "graph-engine",
    status: "experimental",
    uptime: "2d 0h 48m",
    version: "v0.1.0-alpha",
    description: "Directed graph execution experiments. JSON-defined nodes with topological sort execution ordering.",
    stack: ["Python", "NetworkX", "FastAPI"],
    cpu: 7,
    mem: 29,
    requests: 203,
    port: 8003,
  },
  {
    id: "biodev",
    name: "biodev",
    status: "experimental",
    uptime: "—",
    version: "v0.0.1-idea",
    description: "Developer identity platform that auto-builds profiles from GitHub activity and commit history.",
    stack: ["Node.js", "GitHub API", "PostgreSQL"],
    cpu: 0,
    mem: 0,
    requests: 0,
    port: 8004,
  },
];

const LOGS = [
  { ts: "00:00:01", level: "BOOT", msg: "Rishabh Madhwal · System Console [codename: andro] initializing..." },
  { ts: "00:00:02", level: "BOOT", msg: "Loading service registry from services.json" },
  { ts: "00:00:03", level: "INFO", msg: "cli-agent registered on :8001 — status: running" },
  { ts: "00:00:04", level: "INFO", msg: "jsonflow registered on :8002 — status: running" },
  { ts: "00:00:05", level: "INFO", msg: "graph-engine registered on :8003 — status: experimental" },
  { ts: "00:00:06", level: "WARN", msg: "biodev environment config incomplete — service held from startup" },
  { ts: "00:00:07", level: "INFO", msg: "GitHub API probe scheduled (interval: 60s)" },
  { ts: "00:00:08", level: "INFO", msg: "System graph topology computed — 4 nodes, 5 edges" },
  { ts: "00:00:09", level: "INFO", msg: "Logger stream opened — writing to /var/log/andro/console.log" },
  { ts: "00:00:10", level: "INFO", msg: "Console ready. All panels mounted." },
  { ts: "00:01:12", level: "DEBUG", msg: "cli-agent: tool_call dispatched → bash_exec" },
  { ts: "00:01:13", level: "DEBUG", msg: "jsonflow: pipeline tick — 12 transforms applied" },
  { ts: "00:02:44", level: "WARN", msg: "graph-engine: node 'transform_7' retry #2 (timeout)" },
  { ts: "00:03:01", level: "INFO", msg: "GitHub API: fetched 8 repos, 3 languages detected" },
  { ts: "00:04:55", level: "WARN", msg: "biodev: concept stage only — no runtime process scheduled" },
  { ts: "00:05:10", level: "INFO", msg: "cli-agent: agent loop completed — 4 tool calls, 1 plan revision" },
];


const METRICS_HISTORY = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  cpu: Math.floor(20 + Math.sin(i * 0.5) * 15 + Math.random() * 10),
  mem: Math.floor(40 + Math.sin(i * 0.3 + 1) * 12 + Math.random() * 8),
  req: Math.floor(300 + Math.sin(i * 0.8) * 200 + Math.random() * 100),
}));

// ─── STYLES ───────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0b0e13;
    --bg1:      #111620;
    --bg2:      #161c2a;
    --bg3:      #1c2336;
    --border:   #1f2d45;
    --border2:  #243350;
    --text:     #c9d1e0;
    --text2:    #6b7fa3;
    --text3:    #3d5070;
    --green:    #39d98a;
    --green2:   #1a6640;
    --yellow:   #f5c842;
    --yellow2:  #5c4a10;
    --red:      #f5495c;
    --red2:     #5c1520;
    --blue:     #4da6ff;
    --blue2:    #0d3060;
    --purple:   #9d7eff;
    --cyan:     #3de8d4;
    --orange:   #ff8c42;
    --accent:   #4da6ff;
    --mono:     'JetBrains Mono', 'IBM Plex Mono', monospace;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    line-height: 1.5;
    overflow-x: hidden;
  }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  .console-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── TOPBAR ── */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 44px;
    background: var(--bg1);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .topbar-logo {
    font-size: 13px;
    font-weight: 700;
    color: var(--blue);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .topbar-sep {
    color: var(--border2);
    font-size: 16px;
  }
  .topbar-route {
    color: var(--text2);
    font-size: 11px;
    letter-spacing: 0.04em;
  }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .topbar-clock {
    color: var(--text2);
    font-size: 11px;
    letter-spacing: 0.06em;
  }
  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 5px;
    animation: pulse 2s infinite;
  }
  .dot-green { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot-yellow { background: var(--yellow); box-shadow: 0 0 6px var(--yellow); }
  .dot-red { background: var(--red); box-shadow: 0 0 6px var(--red); animation: none; }
  .dot-blue { background: var(--blue); box-shadow: 0 0 6px var(--blue); }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── NAV TABS ── */
  .nav-tabs {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 20px;
    height: 36px;
    background: var(--bg1);
    border-bottom: 1px solid var(--border);
  }
  .nav-tab {
    padding: 4px 16px;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--text3);
    background: none;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
    text-transform: uppercase;
  }
  .nav-tab:hover { color: var(--text); background: var(--bg2); }
  .nav-tab.active {
    color: var(--blue);
    background: var(--blue2);
    border-bottom: 2px solid var(--blue);
    border-radius: 3px 3px 0 0;
  }

  /* ── MAIN GRID ── */
  .main-grid {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── PANEL ── */
  .panel {
    background: var(--bg1);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .panel-title {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text2);
  }
  .panel-meta {
    font-size: 10px;
    color: var(--text3);
    letter-spacing: 0.04em;
  }
  .panel-body {
    padding: 14px;
  }

  /* ── ROW LAYOUT ── */
  .row { display: flex; gap: 14px; }
  .col-2 { flex: 0 0 calc(50% - 7px); }
  .col-3 { flex: 0 0 calc(33.33% - 10px); }
  .col-4 { flex: 0 0 calc(25% - 11px); }
  .col-full { flex: 1; }

  /* ── STAT CARDS ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .stat-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text3);
  }
  .stat-value {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .stat-sub {
    font-size: 10px;
    color: var(--text2);
  }
  .val-green { color: var(--green); }
  .val-yellow { color: var(--yellow); }
  .val-red { color: var(--red); }
  .val-blue { color: var(--blue); }
  .val-purple { color: var(--purple); }

  /* ── GAUGE BAR ── */
  .gauge-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .gauge-label { font-size: 10px; color: var(--text2); width: 80px; flex-shrink: 0; }
  .gauge-track {
    flex: 1;
    height: 5px;
    background: var(--bg3);
    border-radius: 2px;
    overflow: hidden;
  }
  .gauge-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.8s ease;
  }
  .gauge-val { font-size: 10px; color: var(--text); width: 34px; text-align: right; flex-shrink: 0; }

  /* ── SPARKLINE (SVG) ── */
  .sparkline-svg { width: 100%; height: 60px; }
  .spark-area { fill-opacity: 0.12; }
  .spark-line { fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }

  /* ── SERVICES ── */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .service-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .service-card:hover { border-color: var(--blue); }
  .service-card.selected { border-color: var(--blue); background: #0d1a2e; }
  .service-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .service-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.04em;
  }
  .service-version { font-size: 9px; color: var(--text3); margin-top: 2px; }
  .badge {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 2px;
  }
  .badge-running { background: var(--green2); color: var(--green); }
  .badge-experimental { background: var(--yellow2); color: var(--yellow); }
  .badge-stopped { background: var(--red2); color: var(--red); }
  .badge-external { background: var(--blue2); color: var(--blue); }

  .service-desc { font-size: 10px; color: var(--text2); line-height: 1.6; }
  .service-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .stack-tag {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--cyan);
    background: #0a2228;
    border: 1px solid #1a4048;
    padding: 1px 7px;
    border-radius: 2px;
  }
  .service-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    border-top: 1px solid var(--border);
    padding-top: 10px;
  }
  .svc-metric { font-size: 9px; color: var(--text3); }
  .svc-metric span { display: block; font-size: 11px; font-weight: 600; color: var(--text); margin-top: 2px; }

  /* ── LOGS ── */
  .log-stream {
    font-size: 11px;
    line-height: 1.8;
    height: 480px;
    max-height: 65vh;
    overflow-y: auto;
  }
  .log-line { display: flex; gap: 10px; }
  .log-ts { color: var(--text3); flex-shrink: 0; width: 58px; }
  .log-level { flex-shrink: 0; width: 46px; font-weight: 600; letter-spacing: 0.06em; }
  .log-msg { color: var(--text); }
  .lvl-BOOT  { color: var(--blue); }
  .lvl-INFO  { color: var(--green); }
  .lvl-WARN  { color: var(--yellow); }
  .lvl-ERROR { color: var(--red); }
  .lvl-DEBUG { color: var(--text3); }

  /* ── GRAPH ── */
  .graph-svg { width: 100%; height: 300px; }
  .graph-node rect {
    fill: var(--bg3);
    stroke: var(--border2);
    stroke-width: 1;
    rx: 4;
  }
  .graph-node.running rect { stroke: var(--green); }
  .graph-node.experimental rect { stroke: var(--yellow); }
  .graph-node.stopped rect { stroke: var(--red); opacity: 0.6; }
  .graph-node.external rect { stroke: var(--blue); stroke-dasharray: 3 2; }
  .graph-node text { fill: var(--text); font-family: var(--mono); font-size: 10px; }
  .graph-edge { stroke: var(--border2); stroke-width: 1; fill: none; marker-end: url(#arr); }
  .graph-edge.active { stroke: var(--blue); opacity: 0.5; }

  /* ── MINI CHART ── */
  .chart-row {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 50px;
  }
  .chart-bar {
    flex: 1;
    background: var(--blue2);
    border-radius: 2px 2px 0 0;
    transition: background 0.2s;
    min-height: 2px;
  }
  .chart-bar:hover { background: var(--blue); }

  /* ── ABOUT PANEL ── */
  .about-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .about-key { font-size: 10px; color: var(--text3); width: 100px; flex-shrink: 0; }
  .about-val { font-size: 11px; color: var(--text); }
  .about-val a { color: var(--blue); text-decoration: none; }
  .about-val a:hover { text-decoration: underline; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .services-grid { grid-template-columns: 1fr; }
    .row { flex-direction: column; }
    .col-2, .col-3, .col-4, .col-full { flex: 1 1 100%; }
  }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function statusDot(s) {
  if (s === "running") return "dot-green";
  if (s === "experimental") return "dot-yellow";
  if (s === "stopped") return "dot-red";
  return "dot-blue";
}

function badgeClass(s) {
  if (s === "running") return "badge-running";
  if (s === "experimental") return "badge-experimental";
  if (s === "stopped") return "badge-stopped";
  return "badge-external";
}

function gaugeColor(v) {
  if (v > 80) return "#f5495c";
  if (v > 60) return "#f5c842";
  return "#39d98a";
}

// ─── SPARKLINE ───────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#4da6ff", height = 60 }) {
  const W = 400, H = height;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * (H - 6);
    return `${x},${y}`;
  });
  const polyline = pts.join(" ");
  const areaPath = `M${pts[0]} ${pts.map((p, i) => (i === 0 ? "" : `L${p}`)).join(" ")} L${(data.length - 1) / (data.length - 1) * W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="sparkline-svg">
      <path d={areaPath} fill={color} className="spark-area" />
      <polyline points={polyline} stroke={color} className="spark-line" />
    </svg>
  );
}

// ─── GAUGE BAR ───────────────────────────────────────────────────────────────

function GaugeBar({ label, value, max = 100, unit = "%" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="gauge-row">
      <div className="gauge-label">{label}</div>
      <div className="gauge-track">
        <div className="gauge-fill" style={{ width: `${pct}%`, background: gaugeColor(pct) }} />
      </div>
      <div className="gauge-val">{value}{unit}</div>
    </div>
  );
}

// ─── TECH STACK GRAPH ────────────────────────────────────────────────────────

const CAT_COLOR = {
  lang:    { stroke: "#4da6ff", fill: "#0d1a2e", text: "#4da6ff" },
  runtime: { stroke: "#39d98a", fill: "#0d2018", text: "#39d98a" },
  infra:   { stroke: "#f5c842", fill: "#1c1a00", text: "#f5c842" },
  api:     { stroke: "#9d7eff", fill: "#1a1030", text: "#9d7eff" },
  lib:     { stroke: "#3de8d4", fill: "#0a2228", text: "#3de8d4" },
  other:   { stroke: "#ff8c42", fill: "#1c1208", text: "#ff8c42" },
};

// Map known tools/frameworks to categories
const TOOL_CATEGORY = {
  // langs — detected automatically from GitHub
  // infra
  redis: "infra", postgresql: "infra", postgres: "infra", mysql: "infra",
  mongodb: "infra", sqlite: "infra", docker: "infra", kubernetes: "infra",
  nginx: "infra", kafka: "infra", rabbitmq: "infra",
  // runtime
  tokio: "runtime", fastapi: "runtime", actix: "runtime", axum: "runtime",
  express: "runtime", gin: "runtime", fiber: "runtime", flask: "runtime",
  django: "runtime", spring: "runtime",
  // api
  "openai-api": "api", "github-api": "api", graphql: "api", grpc: "api",
  rest: "api", websocket: "api",
  // lib
  networkx: "lib", clap: "lib", serde: "lib", sqlx: "lib",
  "dag-engine": "lib", dagengine: "lib",
};

function buildGraphFromRepos(repos, allLanguages) {
  // allLanguages: { repoName: { Lang: bytes } }
  const langBytes = {};   // lang → total bytes
  const langRepos = {};   // lang → [repoName]
  const topicRepos = {};  // topic → [repoName]

  repos.forEach(repo => {
    const langs = allLanguages[repo.name] || {};
    Object.entries(langs).forEach(([lang, bytes]) => {
      langBytes[lang] = (langBytes[lang] || 0) + bytes;
      if (!langRepos[lang]) langRepos[lang] = [];
      langRepos[lang].push(repo.name);
    });
    (repo.topics || []).forEach(topic => {
      if (!topicRepos[topic]) topicRepos[topic] = [];
      topicRepos[topic].push(repo.name);
    });
  });

  // Build nodes
  const nodes = [];

  // Language nodes (from API)
  const maxBytes = Math.max(...Object.values(langBytes), 1);
  Object.entries(langBytes).forEach(([lang, bytes]) => {
    const r = 14 + Math.round((bytes / maxBytes) * 20); // radius 14–34
    nodes.push({
      id: lang.toLowerCase(),
      label: lang,
      category: "lang",
      r,
      projects: [...new Set(langRepos[lang])],
      bytes,
    });
  });

  // Topic nodes (tools/infra from repo topics)
  Object.entries(topicRepos).forEach(([topic, repos]) => {
    // skip if it's already a language node
    if (nodes.find(n => n.id === topic.toLowerCase())) return;
    const cat = TOOL_CATEGORY[topic.toLowerCase()] || "other";
    nodes.push({
      id: topic,
      label: topic,
      category: cat,
      r: 14 + Math.min(repos.length * 4, 14),
      projects: [...new Set(repos)],
    });
  });

  // Build edges: connect nodes that appear in the same repo
  const edges = [];
  const seen = new Set();
  repos.forEach(repo => {
    const langs = Object.keys(allLanguages[repo.name] || {}).map(l => l.toLowerCase());
    const topics = (repo.topics || []);
    const allIds = [...langs, ...topics];
    for (let i = 0; i < allIds.length; i++) {
      for (let j = i + 1; j < allIds.length; j++) {
        const key = [allIds[i], allIds[j]].sort().join("--");
        if (!seen.has(key) && nodes.find(n => n.id === allIds[i]) && nodes.find(n => n.id === allIds[j])) {
          seen.add(key);
          edges.push({ from: allIds[i], to: allIds[j] });
        }
      }
    }
  });

  // Simple force-like layout: place nodes in a rough circle, langs in center ring
  const langNodes = nodes.filter(n => n.category === "lang");
  const otherNodes = nodes.filter(n => n.category !== "lang");
  const CX = 440, CY = 200;

  langNodes.forEach((n, i) => {
    const angle = (i / langNodes.length) * Math.PI * 2 - Math.PI / 2;
    n.x = CX + Math.cos(angle) * 130;
    n.y = CY + Math.sin(angle) * 110;
  });

  otherNodes.forEach((n, i) => {
    const angle = (i / otherNodes.length) * Math.PI * 2 - Math.PI / 2;
    n.x = CX + Math.cos(angle) * 250;
    n.y = CY + Math.sin(angle) * 175;
  });

  return { nodes, edges };
}

function useStackGraph(repos) {
  const [graph, setGraph] = useState({ nodes: [], edges: [], loading: true });

  useEffect(() => {
    if (!repos || repos.length === 0) return;
    let cancelled = false;

    const loadLangs = async () => {
      try {
        // fetch languages for each repo in parallel (cap at 20 repos)
        const slice = repos.slice(0, 20);
        const results = await Promise.all(
          slice.map(r =>
            window.fetch(`https://api.github.com/repos/androdotdev/${r.name}/languages`, {
              headers: { "Accept": "application/vnd.github+json" }
            }).then(res => res.json()).then(data => ({ name: r.name, langs: data }))
          )
        );
        if (cancelled) return;
        const allLanguages = {};
        results.forEach(({ name, langs }) => {
          allLanguages[name] = Array.isArray(langs) ? {} : langs;
        });
        const { nodes, edges } = buildGraphFromRepos(slice, allLanguages);
        setGraph({ nodes, edges, loading: false });
      } catch (err) {
        console.error("stack graph error:", err);
        if (!cancelled) setGraph(g => ({ ...g, loading: false }));
      }
    };

    loadLangs();
    return () => { cancelled = true; };
  }, [repos.length]);

  return graph;
}

function TechStackGraph({ nodes, edges }) {
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const hoveredNode = nodes.find(n => n.id === hovered);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        viewBox="0 0 880 400"
        style={{ width: "100%", height: 380 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const f = nodes.find(n => n.id === e.from);
          const t = nodes.find(n => n.id === e.to);
          if (!f || !t) return null;
          const highlighted = hovered && (e.from === hovered || e.to === hovered);
          const dimmed = hovered && !highlighted;
          return (
            <line key={i}
              x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={highlighted ? CAT_COLOR[f.category]?.stroke || "#4da6ff" : "#1f2d45"}
              strokeWidth={highlighted ? 1.5 : 1}
              opacity={dimmed ? 0.06 : highlighted ? 0.6 : 0.2}
            />
          );
        })}

        {/* nodes */}
        {nodes.map(n => {
          const c = CAT_COLOR[n.category] || CAT_COLOR.other;
          const isHovered = hovered === n.id;
          const isConnected = hovered && edges.some(e =>
            (e.from === hovered && e.to === n.id) || (e.to === hovered && e.from === n.id)
          );
          const isDimmed = hovered && !isHovered && !isConnected;
          return (
            <g key={n.id} onMouseEnter={() => setHovered(n.id)} style={{ cursor: "default" }} opacity={isDimmed ? 0.12 : 1}>
              {isHovered && (
                <circle cx={n.x} cy={n.y} r={n.r + 8} fill="none"
                  stroke={c.stroke} strokeWidth={1} opacity={0.3} filter="url(#soft-glow)" />
              )}
              <circle cx={n.x} cy={n.y} r={n.r}
                fill={c.fill} stroke={c.stroke}
                strokeWidth={isHovered ? 2 : isConnected ? 1.5 : 1}
                filter={isHovered ? "url(#node-glow)" : "none"}
              />
              <text x={n.x} y={n.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={n.r > 24 ? 10 : n.r > 18 ? 9 : 8}
                fontWeight={isHovered ? 700 : 500}
                fill={isDimmed ? "#2a3a50" : c.text}
                fontFamily="'JetBrains Mono', monospace"
              >{n.label}</text>
            </g>
          );
        })}
      </svg>

      {/* tooltip */}
      {hoveredNode && (
        <div style={{
          position: "absolute",
          left: Math.min(tooltip.x + 14, 580),
          top: Math.max(tooltip.y - 70, 8),
          background: "var(--bg1)",
          border: `1px solid ${(CAT_COLOR[hoveredNode.category] || CAT_COLOR.other).stroke}`,
          borderRadius: 4, padding: "10px 14px",
          pointerEvents: "none", zIndex: 10, minWidth: 190,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: (CAT_COLOR[hoveredNode.category] || CAT_COLOR.other).stroke }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "var(--mono)" }}>{hoveredNode.label}</span>
            <span style={{ fontSize: 9, color: (CAT_COLOR[hoveredNode.category] || CAT_COLOR.other).stroke, marginLeft: "auto", letterSpacing: "0.08em" }}>{hoveredNode.category}</span>
          </div>
          {hoveredNode.bytes && (
            <div style={{ fontSize: 9, color: "var(--text3)", marginBottom: 6 }}>
              {(hoveredNode.bytes / 1000).toFixed(1)}kb written
            </div>
          )}
          <div style={{ fontSize: 9, color: "var(--text3)", marginBottom: 5, letterSpacing: "0.08em", textTransform: "uppercase" }}>used in</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 8 }}>
            {hoveredNode.projects.map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="status-dot dot-green" style={{ margin: 0, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "var(--text)", fontFamily: "var(--mono)" }}>{p}</span>
              </div>
            ))}
          </div>
          {(() => {
            const connected = edges
              .filter(e => e.from === hoveredNode.id || e.to === hoveredNode.id)
              .map(e => e.from === hoveredNode.id ? e.to : e.from)
              .map(id => nodes.find(n => n.id === id)?.label)
              .filter(Boolean);
            return connected.length > 0 ? (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 7 }}>
                <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>co-occurs with</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {connected.slice(0, 6).map(l => (
                    <span key={l} style={{ fontSize: 9, color: "var(--cyan)", background: "#0a2228", border: "1px solid #1a4048", padding: "1px 6px", borderRadius: 2 }}>{l}</span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

// ─── GRAPH TAB ───────────────────────────────────────────────────────────────

function GraphTab() {
  const { repos } = useGitHub("androdotdev");
  const { nodes, edges, loading } = useStackGraph(repos);

  const byCategory = nodes.reduce((acc, n) => {
    if (!acc[n.category]) acc[n.category] = [];
    acc[n.category].push(n);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Tech Stack · Language & Tool Graph</span>
          <span className="panel-meta">
            {loading ? "fetching repo languages..." : `${nodes.length} nodes · ${edges.length} edges · built from github api`}
          </span>
        </div>
        <div style={{ padding: "14px 14px 8px" }}>
          {loading ? (
            <div style={{ height: 380, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({length: 5}, (_, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "var(--blue)",
                    animation: `pulse 1s ${i * 0.15}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: "var(--text3)" }}>fetching languages from {repos.length} repos...</span>
            </div>
          ) : nodes.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>no language data found — add topics to your repos for richer graph</span>
            </div>
          ) : (
            <TechStackGraph nodes={nodes} edges={edges} />
          )}
        </div>
        {/* legend */}
        {!loading && (
          <div style={{ padding: "0 14px 14px", display: "flex", gap: 18, flexWrap: "wrap" }}>
            {Object.entries(CAT_COLOR).map(([cat, c]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: c.stroke, opacity: 0.8 }} />
                <span style={{ fontSize: 10, color: "var(--text3)" }}>{cat}</span>
              </div>
            ))}
            <span style={{ fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>node size = bytes written · hover to inspect</span>
          </div>
        )}
      </div>

      {/* category summary */}
      {!loading && Object.keys(byCategory).length > 0 && (
        <div className="row">
          {Object.entries(byCategory).map(([cat, catNodes]) => {
            const c = CAT_COLOR[cat] || CAT_COLOR.other;
            return (
              <div key={cat} style={{ flex: 1, background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: 4, padding: "12px 14px", borderTop: `2px solid ${c.stroke}` }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: c.stroke, marginBottom: 8 }}>{cat}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {catNodes.map(n => (
                    <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "var(--text)" }}>{n.label}</span>
                      <span style={{ fontSize: 9, color: "var(--text3)" }}>{n.projects.length} repo{n.projects.length > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── LOG VIEWER ──────────────────────────────────────────────────────────────

function LogViewer({ logs }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      requestAnimationFrame(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
      });
    }
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="log-stream" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text3)" }}>
        <span className="status-dot dot-blue" />
        <span>awaiting boot sequence...</span>
      </div>
    );
  }

  return (
    <div className="log-stream" ref={ref}>
      {logs.map((l, i) => (
        <div key={i} className="log-line">
          <span className="log-ts">{l.ts}</span>
          <span className={`log-level lvl-${l.level}`}>{l.level}</span>
          <span className="log-msg">{l.msg}</span>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, color: "var(--text3)", fontSize: 10 }}>
        <span className="status-dot dot-green" />
        <span>stream live — {logs.length} entries</span>
      </div>
    </div>
  );
}

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────

function MiniBarChart({ data, keyName, color = "#4da6ff" }) {
  const max = Math.max(...data.map(d => d[keyName]), 1);
  return (
    <div className="chart-row">
      {data.map((d, i) => (
        <div
          key={i}
          className="chart-bar"
          style={{ height: `${(d[keyName] / max) * 100}%`, background: color }}
          title={`${d.t}: ${d[keyName]}`}
        />
      ))}
    </div>
  );
}

// ─── CLOCK ───────────────────────────────────────────────────────────────────

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="topbar-clock">{t.toISOString().replace("T", " ").slice(0, 19)} UTC</span>;
}

// ─── GITHUB HOOK ─────────────────────────────────────────────────────────────

function useGitHub(username) {
  const [data, setData] = useState({ user: null, repos: [], events: [], loading: true, error: null, raw: null });

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const gh = (path) => window.fetch(`https://api.github.com${path}`, {
          headers: { "Accept": "application/vnd.github+json" }
        });
        const [uRes, rRes, eRes] = await Promise.all([
          gh(`/users/${username}`),
          gh(`/users/${username}/repos?per_page=100&sort=pushed`),
          gh(`/users/${username}/events?per_page=100`),
        ]);
        const raw = { uStatus: uRes.status, rStatus: rRes.status, eStatus: eRes.status };
        const [user, repos, events] = await Promise.all([uRes.json(), rRes.json(), eRes.json()]);
        if (!cancelled) setData({
          user: user?.login ? user : null,
          repos: Array.isArray(repos) ? repos : [],
          events: Array.isArray(events) ? events : [],
          loading: false,
          error: user?.message || null,
          raw,
        });
      } catch (err) {
        if (!cancelled) setData(d => ({ ...d, loading: false, error: err.message }));
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [username]);

  return data;
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function Skel({ w = "100%", h = 16, r = 3 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: "linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { user, repos, events, loading, error, raw } = useGitHub("androdotdev");

  // ── derived metrics ──
  const totalStars   = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
  const totalForks   = repos.reduce((a, r) => a + (r.forks_count || 0), 0);
  const topLangs     = (() => {
    const freq = {};
    repos.forEach(r => { if (r.language) freq[r.language] = (freq[r.language] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);
  })();
  const accountAgeDays = user ? Math.floor((Date.now() - new Date(user.created_at)) / 86400000) : 0;

  // ── activity sparkline: push events per day, last 30 days ──
  const activityData = (() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().slice(0, 10), count: 0 };
    });
    events.filter(e => e.type === "PushEvent").forEach(e => {
      const day = e.created_at?.slice(0, 10);
      const slot = days.find(d => d.date === day);
      if (slot) slot.count += (e.payload?.commits?.length || 1);
    });
    return days;
  })();

  const activeDays   = activityData.filter(d => d.count > 0).length;
  const totalCommits = activityData.reduce((a, d) => a + d.count, 0);
  const peakDay      = Math.max(...activityData.map(d => d.count), 1);

  // ── repo size sparkline: top 10 repos by size ──
  const repoSizeData = [...repos].sort((a, b) => b.size - a.size).slice(0, 20);
  const maxSize      = Math.max(...repoSizeData.map(r => r.size), 1);

  // ── recent events for activity feed ──
  const recentEvents = events.slice(0, 6);
  const eventLabel   = e => {
    if (e.type === "PushEvent") return `pushed ${e.payload?.commits?.length || 1} commit(s) to ${e.repo?.name?.split("/")[1]}`;
    if (e.type === "CreateEvent") return `created ${e.payload?.ref_type} in ${e.repo?.name?.split("/")[1]}`;
    if (e.type === "WatchEvent") return `starred ${e.repo?.name}`;
    if (e.type === "ForkEvent") return `forked ${e.repo?.name}`;
    if (e.type === "IssuesEvent") return `${e.payload?.action} issue in ${e.repo?.name?.split("/")[1]}`;
    if (e.type === "PullRequestEvent") return `${e.payload?.action} PR in ${e.repo?.name?.split("/")[1]}`;
    return `${e.type?.replace("Event","").toLowerCase()} on ${e.repo?.name?.split("/")[1]}`;
  };
  const timeAgo = ts => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  // ── top repos for service table ──
  const topRepos = [...repos].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 5);

  const langColor = l => ({ Go:"#00acd7", Rust:"#ce412b", Python:"#3572a5", JavaScript:"#f1e05a", TypeScript:"#2b7489", "C++":"#f34b7d" }[l] || "var(--text3)");

  return (
    <>
      {/* ── HERO ROW ── */}
      <div className="row">
        {/* identity card */}
        <div style={{
          flex: "0 0 300px", background: "var(--bg1)",
          border: "1px solid var(--border)", borderRadius: 4,
          padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--blue), var(--cyan), transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {loading
              ? <Skel w={40} h={40} r="50%" />
              : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--blue2)", border: "2px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "var(--blue)", fontWeight: 700 }}>RM</div>
            }
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Rishabh Madhwal</div>
              <div style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: "0.1em", marginTop: 2 }}>codename: andro</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["role",    "Backend Engineer"],
              ["focus",   "Systems · Architecture"],
              ["target",  "2026 roles"],
              ["repos",   loading ? null : `${user?.public_repos ?? "—"} public`],
              ["followers", loading ? null : `${user?.followers ?? "—"}`],
              ["member",  loading ? null : `${accountAgeDays}d`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--text3)" }}>{k}</span>
                {v === null ? <Skel w={60} h={11} /> : <span style={{ fontSize: 10, color: "var(--text)" }}>{v}</span>}
              </div>
            ))}
          </div>
          <a href="https://github.com/androdotdev" style={{ fontSize: 10, color: "var(--blue)", textDecoration: "none", marginTop: 2 }}>
            ↗ github.com/androdotdev
          </a>
        </div>

        {/* stat cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Public Repos",  val: user?.public_repos,   color: "var(--green)",  sub: "on github" },
              { label: "Total Stars",   val: totalStars,            color: "var(--yellow)", sub: `${totalForks} forks` },
              { label: "Commits · 30d", val: totalCommits,          color: "var(--blue)",   sub: `${activeDays}/30 active days` },
              { label: "Followers",     val: user?.followers,       color: "var(--purple)", sub: `following ${user?.following ?? "—"}` },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 3, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.4 }} />
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text3)", marginBottom: 6 }}>{s.label}</div>
                {loading
                  ? <Skel w={50} h={24} r={3} />
                  : <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.val ?? "—"}</div>
                }
                <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 5 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* system health bar — active days */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 3, padding: "10px 14px", display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>activity · last 30d</span>
            <div style={{ flex: 1, display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
              {loading
                ? Array.from({length: 30}, (_, i) => <Skel key={i} w="100%" h={8} r={2} />)
                : activityData.map((d, i) => (
                    <div key={i} title={`${d.date}: ${d.count} commits`} style={{
                      flex: 1, borderRadius: 2,
                      height: d.count === 0 ? 4 : `${Math.max(20, (d.count / peakDay) * 100)}%`,
                      background: d.count === 0 ? "var(--bg3)" : "var(--green)",
                      opacity: d.count === 0 ? 0.3 : 0.6 + (d.count / peakDay) * 0.4,
                      transition: "height 0.3s ease",
                      minHeight: 4,
                    }} />
                  ))
              }
            </div>
            {loading
              ? <Skel w={60} h={11} />
              : <span style={{ fontSize: 10, color: "var(--green)", fontWeight: 600, flexShrink: 0 }}>{activeDays}/30 days</span>
            }
          </div>

          {/* top languages */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 3, padding: "10px 14px" }}>
            <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>top languages</div>
            {loading
              ? <div style={{ display: "flex", gap: 8 }}>{Array.from({length:4}, (_,i) => <Skel key={i} w={60} h={14} />)}</div>
              : <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {topLangs.map(([lang, count]) => (
                    <div key={lang} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: langColor(lang), flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: "var(--text)" }}>{lang}</span>
                      <span style={{ fontSize: 9, color: "var(--text3)" }}>{count}</span>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="row">
        {/* commit activity sparkline */}
        <div className="col-3 panel">
          <div className="panel-header">
            <span className="panel-title">Commit Activity · 30d</span>
            <span className="panel-meta">{loading ? "..." : `${totalCommits} commits · peak ${peakDay}/day`}</span>
          </div>
          <div style={{ padding: "10px 14px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.08em" }}>TODAY</span>
              {loading ? <Skel w={40} h={20} /> : <span style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", letterSpacing: "-0.02em" }}>{activityData[activityData.length-1]?.count ?? 0}</span>}
            </div>
            {loading
              ? <Skel w="100%" h={55} />
              : <Sparkline data={activityData.map(d => d.count)} color="#39d98a" height={55} />
            }
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>30d ago</span>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>today</span>
            </div>
          </div>
        </div>

        {/* repo size distribution */}
        <div className="col-3 panel">
          <div className="panel-header">
            <span className="panel-title">Repo Sizes · top 20</span>
            <span className="panel-meta">{loading ? "..." : `${repos.length} repos total`}</span>
          </div>
          <div style={{ padding: "10px 14px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>LARGEST</span>
              {loading ? <Skel w={70} h={20} /> : <span style={{ fontSize: 14, fontWeight: 700, color: "var(--blue)" }}>{repoSizeData[0]?.name?.split("/")[1] ?? "—"}</span>}
            </div>
            {loading
              ? <Skel w="100%" h={55} />
              : <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 55 }}>
                  {repoSizeData.map((r, i) => (
                    <div key={i} title={`${r.name}: ${r.size}KB`} style={{
                      flex: 1, borderRadius: "2px 2px 0 0", minHeight: 3,
                      height: `${Math.max(6, (r.size / maxSize) * 100)}%`,
                      background: `hsl(${200 + i * 5}, 70%, 55%)`, opacity: 0.75,
                    }} />
                  ))}
                </div>
            }
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>largest</span>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>smallest</span>
            </div>
          </div>
        </div>

        {/* stars + forks */}
        <div className="col-3 panel">
          <div className="panel-header">
            <span className="panel-title">Stars &amp; Forks · per repo</span>
            <span className="panel-meta">{loading ? "..." : `${totalStars} stars · ${totalForks} forks`}</span>
          </div>
          <div style={{ padding: "10px 14px 6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ fontSize: 9, color: "var(--text3)" }}>TOTAL STARS</span>
              {loading ? <Skel w={40} h={20} /> : <span style={{ fontSize: 20, fontWeight: 700, color: "var(--yellow)", letterSpacing: "-0.02em" }}>★ {totalStars}</span>}
            </div>
            {loading
              ? <Skel w="100%" h={55} />
              : <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 55 }}>
                  {[...repos].sort((a,b) => b.stargazers_count - a.stargazers_count).slice(0, 20).map((r, i) => (
                    <div key={i} title={`${r.name}: ★${r.stargazers_count}`} style={{
                      flex: 1, borderRadius: "2px 2px 0 0", minHeight: 3,
                      height: `${Math.max(6, (r.stargazers_count / Math.max(1, repos[0]?.stargazers_count)) * 100)}%`,
                      background: "var(--yellow)", opacity: 0.5 + (i === 0 ? 0.5 : 0.05),
                    }} />
                  ))}
                </div>
            }
          </div>
        </div>
      </div>

      {/* ── REPO TABLE + RECENT EVENTS ── */}
      <div className="row">
        {/* top repos as services */}
        <div className="col-2 panel">
          <div className="panel-header">
            <span className="panel-title">Recent Repos</span>
            <span className="panel-meta">{loading ? "..." : `${repos.length} total · sorted by activity`}</span>
          </div>
          <div style={{ padding: "0 14px" }}>
            {loading
              ? Array.from({length: 5}, (_, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 6 }}>
                    <Skel w="60%" h={12} /> <Skel w="40%" h={10} />
                  </div>
                ))
              : topRepos.map((r, i) => (
                  <div key={r.id} style={{
                    display: "grid", gridTemplateColumns: "1fr 60px 50px 50px 70px",
                    alignItems: "center", gap: 10,
                    padding: "9px 0",
                    borderBottom: i < topRepos.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{r.name}</div>
                      <div style={{ fontSize: 9, color: "var(--text3)", marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
                        {r.language && <><div style={{ width: 7, height: 7, borderRadius: "50%", background: langColor(r.language), display: "inline-block" }} /> {r.language}</>}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, color: "var(--yellow)" }}>★ {r.stargazers_count}</span>
                    <span style={{ fontSize: 9, color: "var(--text3)" }}>⑂ {r.forks_count}</span>
                    <span style={{ fontSize: 9, color: r.open_issues_count > 0 ? "var(--red)" : "var(--text3)" }}>⚑ {r.open_issues_count}</span>
                    <span style={{ fontSize: 9, color: "var(--text3)", textAlign: "right" }}>{timeAgo(r.pushed_at)}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* recent github events */}
        <div className="col-2 panel">
          <div className="panel-header">
            <span className="panel-title">Recent Activity</span>
            <span className="panel-meta">live from github events api</span>
          </div>
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
            {loading
              ? Array.from({length: 5}, (_, i) => (
                  <div key={i} style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                    <Skel w="80%" h={11} /> <Skel w="30%" h={9} />
                  </div>
                ))
              : recentEvents.map((e, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    padding: "7px 10px",
                    background: i === 0 ? "var(--bg2)" : "transparent",
                    borderRadius: 3,
                    borderLeft: `2px solid ${e.type === "PushEvent" ? "var(--green)" : e.type === "CreateEvent" ? "var(--blue)" : "var(--text3)"}`,
                  }}>
                    <span style={{ fontSize: 9, color: e.type === "PushEvent" ? "var(--green)" : "var(--blue)", flexShrink: 0, marginTop: 1, fontWeight: 600 }}>
                      {e.type?.replace("Event","").toUpperCase().slice(0,4)}
                    </span>
                    <span style={{ fontSize: 10, color: i === 0 ? "var(--text)" : "var(--text2)", lineHeight: 1.5 }}>{eventLabel(e)}</span>
                    <span style={{ fontSize: 9, color: "var(--text3)", marginLeft: "auto", flexShrink: 0 }}>{timeAgo(e.created_at)}</span>
                  </div>
                ))
            }
          </div>
          {/* stack snapshot */}
          <div style={{ borderTop: "1px solid var(--border)", padding: "10px 14px" }}>
            <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>stack snapshot</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {loading
                ? Array.from({length:6}, (_,i) => <Skel key={i} w={50} h={18} />)
                : topLangs.map(([lang]) => (
                    <span key={lang} style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.06em", color: "var(--cyan)", background: "#0a2228", border: "1px solid #1a4048", padding: "2px 7px", borderRadius: 2 }}>{lang}</span>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ─── SERVICES TAB ────────────────────────────────────────────────────────────

function ServicesTab() {
  const [sel, setSel] = useState(null);
  return (
    <div className="services-grid">
      {SERVICES.map(s => (
        <div
          key={s.id}
          className={`service-card ${sel === s.id ? "selected" : ""}`}
          onClick={() => setSel(sel === s.id ? null : s.id)}
        >
          <div className="service-head">
            <div>
              <div className="service-name">
                <span className={`status-dot ${statusDot(s.status)}`} />
                {s.name}
              </div>
              <div className="service-version">{s.version} · :{s.port}</div>
            </div>
            <span className={`badge ${badgeClass(s.status)}`}>{s.status}</span>
          </div>
          <div className="service-desc">{s.description}</div>
          <div className="service-stack">
            {s.stack.map(t => <span key={t} className="stack-tag">{t}</span>)}
          </div>
          <div className="service-metrics">
            <div className="svc-metric">CPU<span className={s.cpu > 70 ? "val-red" : ""}>{s.cpu}%</span></div>
            <div className="svc-metric">MEM<span className={s.mem > 80 ? "val-red" : ""}>{s.mem}%</span></div>
            <div className="svc-metric">REQS<span>{s.requests.toLocaleString()}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── LOGS TAB ────────────────────────────────────────────────────────────────

function LogsTab({ logs, onReload }) {
  const [filter, setFilter] = useState("ALL");
  const [spinning, setSpinning] = useState(false);
  const levels = ["ALL", "BOOT", "INFO", "WARN", "ERROR", "DEBUG"];
  const filtered = filter === "ALL" ? logs : logs.filter(l => l.level === filter);

  const handleReload = () => {
    setSpinning(true);
    setFilter("ALL");
    onReload();
    setTimeout(() => setSpinning(false), 3200);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Log Stream · /var/log/andro/console.log</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {levels.map(lv => (
            <button
              key={lv}
              onClick={() => setFilter(lv)}
              style={{
                background: filter === lv ? "var(--bg3)" : "none",
                border: `1px solid ${filter === lv ? "var(--border2)" : "transparent"}`,
                color: filter === lv ? "var(--text)" : "var(--text3)",
                fontFamily: "var(--mono)",
                fontSize: 9,
                padding: "2px 8px",
                borderRadius: 2,
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >{lv}</button>
          ))}
          <div style={{ width: 1, height: 14, background: "var(--border)", margin: "0 4px" }} />
          <button
            onClick={handleReload}
            title="Replay log stream"
            style={{
              background: "none",
              border: "1px solid var(--border2)",
              color: "var(--blue)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              padding: "2px 10px",
              borderRadius: 2,
              cursor: "pointer",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--blue2)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span style={{
              display: "inline-block",
              animation: spinning ? "spin 0.7s linear infinite" : "none",
              fontSize: 13,
              lineHeight: 1,
            }}>⟳</span>
            reload
          </button>
        </div>
      </div>
      <div className="panel-body">
        <LogViewer logs={filtered} />
      </div>
    </div>
  );
}

// ─── GRAPH TAB ───────────────────────────────────────────────────────────────



// ─── ABOUT TAB ───────────────────────────────────────────────────────────────

function AboutTab() {
  return (
    <div className="row">
      <div className="col-2 panel">
        <div className="panel-header"><span className="panel-title">Engineer Profile</span></div>
        <div className="panel-body">
          {[
            ["name", "Rishabh Madhwal"],
            ["codename", <span style={{color:"var(--cyan)"}}>Andro</span>],
            ["role", "Backend Engineer"],
            ["focus", "Backend Architecture · Systems Design"],
            ["target", "Backend Engineering Roles · 2026"],
            ["location", "Ghaziabad, Uttar Pradesh, IN"],
            ["github", <a href="https://github.com/androdotdev">github.com/androdotdev</a>],
            ["approach", "Feynman-style public explanation"],
          ].map(([k, v]) => (
            <div key={k} className="about-row">
              <div className="about-key">{k}</div>
              <div className="about-val">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-2 panel">
        <div className="panel-header"><span className="panel-title">System Info</span></div>
        <div className="panel-body">
          {[
            ["console", "Rishabh Madhwal · System Console"],
            ["version", "v1.0.0"],
            ["runtime", "React 18"],
            ["theme", "Grafana-inspired dark"],
            ["uptime", "14d 6h 22m"],
            ["services", `${SERVICES.length} registered`],
            ["log_entries", `${LOGS.length} entries`],
            ["graph", "lang · tool · infra nodes"],
          ].map(([k, v]) => (
            <div key={k} className="about-row">
              <div className="about-key">{k}</div>
              <div className="about-val">{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("overview");
  const [streamedLogs, setStreamedLogs] = useState([]);

  const startStream = () => {
    setStreamedLogs([]);
    let i = 0;
    const tick = () => {
      if (i < LOGS.length) {
        const entry = LOGS[i];
        setStreamedLogs(prev => [...prev, entry]);
        i++;
        setTimeout(tick, 180 + Math.random() * 120);
      }
    };
    tick();
  };

  // simulate boot log streaming
  useEffect(() => {
    startStream();
  }, []);

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services" },
    { id: "graph", label: "Graph" },
    { id: "logs", label: "Logs" },
    { id: "about", label: "About" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="console-root">
        {/* topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <span className="topbar-logo">⬡ Rishabh</span>
            <span className="topbar-sep">/</span>
            <span style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: "0.08em" }}>andro</span>
            <span className="topbar-sep">/</span>
            <span className="topbar-route">system-console</span>
            <span className="topbar-sep">/</span>
            <span className="topbar-route">{tab}</span>
          </div>
          <div className="topbar-right">
            <span>
              <span className="status-dot dot-green" />
              <span style={{ fontSize: 10, color: "var(--text2)" }}>sys nominal</span>
            </span>
            <Clock />
          </div>
        </div>

        {/* nav tabs */}
        <div className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.08em" }}>
            {SERVICES.filter(s => s.status === "running").length}/{SERVICES.length} services ·{" "}
            <span style={{ color: "var(--green)" }}>●</span> healthy
          </span>
        </div>

        {/* main */}
        <div className="main-grid">
          {tab === "overview" && <OverviewTab />}
          {tab === "services" && <ServicesTab />}
          {tab === "graph" && <GraphTab />}
          {tab === "logs" && <LogsTab logs={streamedLogs} onReload={startStream} />}
          {tab === "about" && <AboutTab />}
        </div>
      </div>
    </>
  );
}