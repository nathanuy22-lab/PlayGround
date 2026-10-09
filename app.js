"use strict";
/* App glue: boot, tabs, chat deliberation, map wiring, PWA, clock. */
(function () {
  const $ = id => document.getElementById(id);
  const chat = $("chatLog"), form = $("askForm"), input = $("askInput");
  const cores = [$("core1"), $("core2"), $("core3")];
  const verdictStrip = $("verdictStrip"), verdictText = $("verdictText");

  // ---------- BOOT ----------
  const bootLines = [
    "NERV OS v7.3 — MAGI SUPERUSER TERMINAL",
    "Mounting /geofront ............ OK",
    "Loading MELCHIOR-1 ............ ONLINE",
    "Loading BALTHASAR-2 ........... ONLINE",
    "Loading CASPER-3 .............. ONLINE",
    "Bundling offline KB (" + MAGI.KB.length + " entries, " + MAGI.STATES.length + " states/UTs, " + INDIA_MAP.ALLCITIES.length + " cities, 180 countries) ... OK",
    "Map vectors: schematic, on-device ... OK",
    "External link: DISABLED BY DESIGN (AT Field active)",
    "All reasoning local. No query leaves this terminal."
  ];
  const bootLog = $("bootLog"), bootBtn = $("bootEnter");
  let bi = 0;
  const bootTimer = setInterval(() => {
    if (bi < bootLines.length) { bootLog.textContent += "> " + bootLines[bi++] + "\n"; bootLog.scrollTop = 1e6; }
    else { clearInterval(bootTimer); bootBtn.hidden = false; bootBtn.focus(); }
  }, 220);
  bootBtn.addEventListener("click", () => { $("boot").classList.add("done"); input.focus(); });

  // ---------- TABS ----------
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => { x.classList.remove("active"); x.setAttribute("aria-selected", "false"); });
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    t.classList.add("active"); t.setAttribute("aria-selected", "true");
    $("tab-" + t.dataset.tab).classList.add("active");
    if (t.dataset.tab === "map" && window._map) setTimeout(() => window._map.draw(), 30);
  }));

  // ---------- CHAT ----------
  function addMsg(who, tag, text, votes) {
    const d = document.createElement("div");
    d.className = "msg " + who;
    const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    d.innerHTML = "<span class='tag'>" + tag + "</span>" + esc.replace(/\n/g, "<br>") +
      (votes ? "<div class='votes-line'>MELCHIOR:" + votes[0] + " · BALTHASAR:" + votes[1] + " · CASPER:" + votes[2] + "</div>" : "");
    chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
    try {
      const log = JSON.parse(localStorage.getItem("magi-log") || "[]");
      log.push({ who, tag, text: text.slice(0, 800) }); localStorage.setItem("magi-log", JSON.stringify(log.slice(-60)));
    } catch (e) {}
  }
  function setCores(votes, conf) {
    const names = ["MELCHIOR-1", "BALTHASAR-2", "CASPER-3"];
    cores.forEach((el, i) => {
      const v = votes[i], box = el.querySelector(".core-vote");
      box.textContent = (v === "YES" ? "✔ YES" : v === "NO" ? "✘ NO · REJECT" : "◐ " + v);
      box.className = "core-vote " + (v === "YES" ? "yes" : v === "NO" ? "no" : "cond");
      el.querySelector(".core-bar i").style.width = (conf[i] || 50) + "%";
      void el.offsetWidth;
    });
  }
  function showVerdict(text) {
    verdictStrip.classList.remove("hidden", "decide", "reject");
    if (/NO CONSENSUS|REJECT/i.test(text)) verdictStrip.classList.add("reject");
    else if (/SPLIT|CONDITIONAL|INSUFFICIENT/i.test(text)) verdictStrip.classList.add("decide");
    verdictText.textContent = "◈ " + text + " ◈";
  }

  let thinking = false;
  function deliberate(q, done) {
    thinking = true;
    const stages = [["ANALYSING", "ANALYSING", "ANALYSING"], ["YES", "ANALYSING", "ANALYSING"], ["YES", "YES", "ANALYSING"]];
    let s = 0;
    setCores(stages[0], [30, 30, 30]); showVerdict("MAGI DELIBERATING…");
    const t = setInterval(() => {
      s++;
      if (s < stages.length) { setCores(stages[s], [55 + s * 12, 50 + s * 10, 45 + s * 8]); }
      else { clearInterval(t); thinking = false; done(); }
    }, 380);
  }

  function handleQuery(q) {
    if (!q.trim()) return;
    addMsg("user", "OPERATOR // QUERY", q);
    // LIVE MODE: any external core configured + online → ask the frontier AIs
    if (typeof CORES !== "undefined" && CORES.anyLive()) {
      thinking = true;
      setCores(["ANALYSING", "ANALYSING", "ANALYSING"], [35, 35, 35]);
      showVerdict("ESTABLISHING UPLINK TO EXTERNAL CORES…");
      const local = MAGI.ask(q, INDIA_MAP.ALLCITIES); // silent: map side-effects + local fallback lines
      CORES.queryAll(q, (def, reason) => {
        const usable = local.kind !== "unknown" && local.kind !== "empty";
        const short = usable ? (local.answer.length > 280 ? local.answer.slice(0, 280) + "…" : local.answer)
          : "No offline record for this question — bridge busy, retry shortly or add a premium key in SYSTEM.";
        return { vote: local.votes[CORES.DEFS.indexOf(def)] || "CONDITIONAL", text: "(local fallback · " + reason + ") " + short };
      }).then(results => {
        thinking = false;
        const votes = results.map(r => r.vote);
        setCores(votes, results.map(r => (r.source === "live" ? 94 : r.source === "free" ? 88 : r.source === "error" ? 45 : 70)));
        showVerdict(CORES.verdict(results));
        results.forEach(r => {
          const badge = r.source === "live" ? "●LIVE" : r.source === "free" ? "●FREE-BRIDGE" : r.source === "error" ? "✘UPLINK-FAIL" : "○LOCAL";
          addMsg("magi", r.core + " // " + r.provider + " " + badge, r.text, votes);
        });
        if (local.route && window._map) {
          window._map.setRoute(local.route[0], local.route[1]);
          document.querySelector('[data-tab="map"]').click();
        } else if (local.kind === "dlmap" && local.city && window._dlRegion) {
          window._dlRegion(local.city);
        } else if (local.city && window._map) {
          window._map.focusCity(local.city);
        }
      }).catch(() => {
        thinking = false;
        setCores(local.votes, [70, 70, 70]); showVerdict(local.verdict);
        addMsg("magi", "MAGI // RESOLUTION (LOCAL FALLBACK)", local.answer, local.votes);
      });
      return;
    }
    deliberate(q, () => {
      const r = MAGI.ask(q, INDIA_MAP.ALLCITIES);
      setCores(r.votes, r.conf); showVerdict(r.verdict);
      addMsg("magi", "MAGI // RESOLUTION (" + r.kind.toUpperCase() + ")", r.answer, r.votes);
      if (r.route && window._map) {
        window._map.setRoute(r.route[0], r.route[1]);
        document.querySelector('[data-tab="map"]').click();
      } else if (r.kind === "dlmap" && r.city && window._dlRegion) {
        window._dlRegion(r.city);
      } else if (r.city && window._map) {
        // stay on terminal but hint; focus map in background
        window._map.focusCity(r.city);
      }
    });
  }
  form.addEventListener("submit", e => { e.preventDefault(); if (thinking) return; const q = input.value; input.value = ""; handleQuery(q); });

  const suggests = ["capital of Kerala", "distance Delhi to Mumbai", "where is Leh", "list states", "12*8+5", "who built MAGI", "status"];
  const srow = $("suggestRow");
  suggests.forEach(s => { const b = document.createElement("button"); b.className = "suggest"; b.textContent = s; b.type = "button"; b.onclick = () => handleQuery(s); srow.appendChild(b); });

  // restore log
  try {
    (JSON.parse(localStorage.getItem("magi-log") || [])).forEach(m => addMsg(m.who, m.tag, m.text));
  } catch (e) {}
  if (!chat.children.length) addMsg("sys", "MAGI // WELCOME", "Welcome, operator. Cores nominal. Type 'help' or tap a suggestion. Everything runs offline.");

  // ---------- MAP ----------
  const map = INDIA_MAP.createMap($("indiaMap"), {
    onSelect: sel => {
      if (sel.type === "country") {
        const cap = (INDIA_MAP.WORLD_CITIES || []).find(c => c.capital && c.country === sel.name);
        $("mapInfo").innerHTML = "<b>" + sel.name + "</b>" + (cap ? " · capital: " + cap.name : "") + "<br>Click another country, or search a city / country to zoom.";
        const tip = $("mapTip"); tip.hidden = false; tip.textContent = sel.name + (cap ? " — capital " + cap.name : "");
        clearTimeout(tip._t); tip._t = setTimeout(() => tip.hidden = true, 2600);
        return;
      }
      const c = sel.city;
      const region = c.state || c.country || "";
      $("mapInfo").innerHTML = "<b>" + c.name + "</b> · " + c.lat.toFixed(2) + "°N " + c.lng.toFixed(2) + "°E · " + region + "<br>" + c.note;
      const tip = $("mapTip"); tip.hidden = false; tip.textContent = c.name + " — " + c.note;
      clearTimeout(tip._t); tip._t = setTimeout(() => tip.hidden = true, 2600);
    }
  });
  window._map = map;
  const cities = map.getCities().slice().sort((a, b) => a.name.localeCompare(b.name));
  const rA = $("routeA"), rB = $("routeB");
  cities.forEach(c => { rA.add(new Option(c.name, c.name)); rB.add(new Option(c.name, c.name)); });
  rA.value = "New Delhi"; rB.value = "Mumbai";
  function locate() {
    const q = $("mapSearch").value;
    const hit = map.findPlace(q);
    if (hit && hit.kind === "city") { map.focusCity(hit.city, 2.5); }
    else if (hit && hit.kind === "country") { map.focusCountry(hit.name); }
    else $("mapInfo").textContent = "No match for '" + q + "'. Try Japan, Brazil, Leh, Sydney…";
  }
  $("mapGo").onclick = locate;
  $("mapSearch").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); locate(); } });
  $("zoomIn").onclick = () => map.zoom(1.3);
  $("zoomOut").onclick = () => map.zoom(1 / 1.3);
  $("mapReset").onclick = () => { map.reset(); $("routeInfo").textContent = ""; $("mapInfo").textContent = "Click a country or city marker. Search to zoom. Drag to pan · wheel / buttons to zoom."; };
  $("routeGo").onclick = () => {
    const A = map.findCity(rA.value), B = map.findCity(rB.value);
    if (!A || !B) return;
    map.setRoute(A, B);
    const km = Math.round(MAGI.haversine(A, B));
    $("routeInfo").textContent = "◈ ROUTE " + A.name + " ↔ " + B.name + ": " + km.toLocaleString() + " km (" + Math.round(km * 0.621371).toLocaleString() + " mi) great-circle, offline.";
    document.querySelector('[data-tab="map"]').click();
  };

  // ---------- STREET MODE + OFFLINE REGIONS ----------
  const modeV = $("modeVector"), modeS = $("modeStreet"), attr = $("attrLine");
  function paintMode() {
    const m = map.getMode();
    modeV.classList.toggle("active", m === "vector");
    modeS.classList.toggle("active", m === "street");
    attr.hidden = m !== "street";
    if (m === "street") attr.textContent = "Street detail: " + map.tileAttrib + " · areas you view stay cached for offline use. Keep saved areas small — bulk downloading is discouraged by tile providers.";
  }
  try { if (localStorage.getItem("magi-mode") === "street") map.setMode("street"); } catch (e) {}
  modeV.onclick = () => { map.setMode("vector"); try { localStorage.setItem("magi-mode", "vector"); } catch (e) {} paintMode(); };
  modeS.onclick = () => { map.setMode("street"); try { localStorage.setItem("magi-mode", "street"); } catch (e) {} paintMode(); };
  paintMode();

  function refreshSaved() {
    const sel = $("dlSaved"); sel.innerHTML = "";
    const list = map.listRegions();
    if (!list.length) sel.add(new Option("no saved areas", ""));
    list.forEach(r => sel.add(new Option(r.name + " (" + r.tiles + " tiles)", r.name)));
  }
  refreshSaved();
  let downloading = false;
  function startRegionDownload(city, radiusKm) {
    if (downloading || !city) return;
    downloading = true;
    const prog = $("dlProg");
    map.setMode("street"); paintMode();
    document.querySelector('[data-tab="map"]').click();
    map.focusCity(city);
    const r = radiusKm || parseInt($("dlRadius").value, 10) || 15;
    const maxZ = r <= 10 ? 16 : r <= 20 ? 15 : 14; // wide areas stop before building zoom (tile-count safety)
    const n = map.estimateRegion(city.lng, city.lat, r, 10, maxZ);
    prog.textContent = n + " tiles ≈ " + (n * 35 / 1024).toFixed(1) + " MB (zooms 10–" + maxZ + "). Downloading… (keep the tab open)";
    map.downloadRegion(city.name, city.lng, city.lat, r, 10, maxZ, (d, t) => { prog.textContent = "⬇ " + d + "/" + t + " tiles"; }).then(rec => {
      downloading = false;
      prog.textContent = "✔ " + rec.name + ": " + rec.tiles + " tiles, " + (rec.bytes / 1048576).toFixed(1) + " MB" + (rec.failed ? ", " + rec.failed + " failed (offline gaps)" : "") + ". Works offline now.";
      refreshSaved();
    }).catch(e => { downloading = false; prog.textContent = "✘ " + String((e && e.message) || e); });
  }
  $("dlGo").onclick = () => {
    const hit = map.findCity($("dlPlace").value);
    if (!hit) { $("dlProg").textContent = "City not found — try Jaipur, Kochi, Leh, Tokyo…"; return; }
    startRegionDownload(hit);
  };
  $("dlDel").onclick = () => {
    const name = $("dlSaved").value;
    if (!name) return;
    map.deleteRegion(name).then(k => { $("dlProg").textContent = "Deleted " + name + " (" + k + " tiles)."; refreshSaved(); });
  };
  window._dlRegion = startRegionDownload;

  // ---------- DATABASE ----------
  $("dbStats").textContent = MAGI.KB.length + " knowledge entries · " + MAGI.STATES.length + " states/UTs · " + cities.length + " cities — all on-device.";
  $("sysKB").textContent = MAGI.KB.length; $("sysCities").textContent = cities.length; $("sysStates").textContent = MAGI.STATES.length;
  function renderDB(filter) {
    const f = (filter || "").toLowerCase();
    const box = $("dbList"); box.innerHTML = "";
    const cards = [];
    MAGI.KB.forEach(e => { if (!f || e.a.toLowerCase().includes(f) || e.k.join(" ").includes(f)) cards.push({ t: e.k[0], b: e.a }); });
    MAGI.STATES.forEach(s => { if (!f || (s.name + s.capital + s.info).toLowerCase().includes(f)) cards.push({ t: "STATE · " + s.name, b: "Capital: " + s.capital + " · " + s.pop + " · " + s.area + "\n" + s.info }); });
    cities.forEach(c => { const region = c.state || c.country || ""; if (!f || (c.name + " " + region).toLowerCase().includes(f)) cards.push({ t: "CITY · " + c.name, b: c.lat.toFixed(2) + "°N " + c.lng.toFixed(2) + "°E · " + region + "\n" + c.note }); });
    cards.slice(0, 120).forEach(c => { const d = document.createElement("div"); d.className = "db-card"; d.innerHTML = "<b></b><br><span></span>"; d.querySelector("b").textContent = c.t; d.querySelector("span").textContent = c.b; box.appendChild(d); });
    if (!cards.length) box.innerHTML = "<div class='db-card'>No matches. All data is local — try 'Kerala', 'Leh', 'capital'.</div>";
  }
  renderDB("");
  $("dbSearch").addEventListener("input", e => renderDB(e.target.value));

  // ---------- EXTERNAL CORES settings ----------
  (function coreSettings() {
    const box = $("coreSettings");
    if (!box || typeof CORES === "undefined") { if (box) box.innerHTML = "<p>Cores module missing.</p>"; return; }
    const settings = CORES.load();
    box.innerHTML = "";
    CORES.DEFS.forEach(def => {
      const cfg = settings[def.id];
      const fs = document.createElement("div");
      fs.className = "provider";
      fs.innerHTML =
        "<div class='row'><label class='en'><input type='checkbox'" + (cfg.enabled ? " checked" : "") + "> ENABLE</label>" +
        "<b></b><span class='core-status'></span><button class='hex-btn small test' type='button'>TEST LINK</button></div>" +
        "<div class='sub'></div>" +
        "<label>API key (optional premium — blank uses the FREE bridge)</label><input type='password' class='k' placeholder='blank = free bridge' autocomplete='off'>" +
        "<label>Premium model (with key)</label><input type='text' class='m'>" +
        "<label>Free-bridge model (no key)</label><input type='text' class='f'>" +
        "<label>Premium endpoint (with key)</label><input type='text' class='e'>";
      fs.querySelector("b").textContent = def.core + " → " + def.provider;
      fs.querySelector(".sub").textContent = def.sub;
      const en = fs.querySelector("input[type=checkbox]"), k = fs.querySelector(".k"),
        m = fs.querySelector(".m"), e = fs.querySelector(".e"), f = fs.querySelector(".f"), st = fs.querySelector(".core-status");
      k.value = cfg.key || ""; m.value = cfg.model || def.model; e.value = cfg.endpoint || def.endpoint; f.value = cfg.freeModel || def.freeModel;
      const persist = () => {
        const s = CORES.load();
        s[def.id] = { enabled: en.checked, key: k.value.trim(), model: m.value.trim() || def.model, endpoint: e.value.trim() || def.endpoint, freeModel: f.value.trim() || def.freeModel };
        CORES.save(s);
        paint();
      };
      const paint = () => {
        if (!en.checked || !navigator.onLine) { st.innerHTML = "<span style='color:var(--dim)'>○ local fallback</span>"; return; }
        st.innerHTML = k.value.trim()
          ? "<span class='live-dot'>● ARMED (premium key)</span>"
          : "<span class='live-dot'>● ARMED (free bridge)</span>";
      };
      [en].forEach(el => el.addEventListener("change", persist));
      [k, m, e, f].forEach(el => el.addEventListener("change", persist));
      fs.querySelector(".test").onclick = () => {
        persist();
        st.textContent = "…testing";
        CORES.queryOne(def.id, "Reply with exactly: LINK OK. VOTE: YES", CORES.load()).then(r => {
          st.innerHTML = !r ? "<span style='color:var(--dim)'>skipped (disabled / offline / no key)</span>"
            : r.source === "live" ? "<span class='live-dot'>● LINK OK (" + r.vote + ")</span>"
            : "<span style='color:var(--amber)'>" + r.text.slice(0, 90) + "</span>";
        });
      };
      paint();
      box.appendChild(fs);
    });
    $("wipeKeys").onclick = () => {
      CORES.wipe(); coreSettings();
      addMsg("sys", "MAGI", "External core keys wiped from this browser.");
    };
  })();
  function net() {
    const on = navigator.onLine;
    $("netBadge").textContent = on ? "● ONLINE (local-first, works offline)" : "● OFFLINE — AT FIELD ACTIVE, all systems local";
    $("netBadge").className = "net " + (on ? "online" : "offline");
    $("sysNet").textContent = on ? "Link: reachable (app still 100% local)" : "Link: unreachable — FULL OFFLINE MODE, terminal + map nominal.";
  }
  window.addEventListener("online", net); window.addEventListener("offline", net); net();
  setInterval(() => {
    const d = new Date();
    $("clock").textContent = "LOCAL " + d.toLocaleTimeString() + " · " + (navigator.onLine ? "LINK UP" : "LINK DOWN · OFFLINE OK");
  }, 1000);
  $("wipeBtn").onclick = () => { localStorage.removeItem("magi-log"); chat.innerHTML = ""; addMsg("sys", "MAGI", "Chat log purged from local storage."); };
  $("cacheBtn").onclick = async () => {
    try {
      const r = await fetch(location.href, { cache: "reload" });
      $("sysSW").textContent = r.ok ? "warmed (" + new Date().toLocaleTimeString() + ")" : "fetch failed";
    } catch (e) { $("sysSW").textContent = "offline — cache already serving"; }
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(() => $("sysSW").textContent = "registered — offline ready").catch(() => $("sysSW").textContent = "unavailable (still works this session)");
  } else $("sysSW").textContent = "unsupported (still works this session)";

  // ---------- PHONE INSTALL ----------
  (function install() {
    const btn = $("installBtn"), status = $("installStatus");
    if (!btn || !status) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (standalone) { status.innerHTML = "<b style='color:var(--green)'>INSTALLED ✔</b> — running as an app. Offline ready."; return; }
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    let deferred = null;
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault(); deferred = e; btn.hidden = false;
      status.innerHTML = "This phone can install MAGI now — tap below.";
    });
    btn.onclick = async () => {
      if (!deferred) return;
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      deferred = null; btn.hidden = true;
      status.innerHTML = "Install prompt sent. If you dismissed it, use the manual steps below.";
    };
    // Fallback text if the browser never fires the prompt (e.g. iOS Safari)
    setTimeout(() => {
      if (btn.hidden && !standalone) {
        status.innerHTML = isIOS
          ? "iPhone detected: use Safari → Share → “Add to Home Screen”."
          : "Use ⋮ menu → “Add to Home screen” / “Install app”. (Chrome fires a one-tap button here when ready.)";
      }
    }, 3500);
  })();
})();
