/* EXTERNAL CORES — one AI per MAGI core, answers ANY question when online.
   Default: FREE keyless bridge (no setup). Optional premium keys per core:
   MELCHIOR-1 → Anthropic Claude · BALTHASAR-2 → OpenAI GPT · CASPER-3 → Google Gemini
   Disabled / offline → each core falls back to the on-device engine. */
"use strict";
(function (global) {
  const G = typeof window !== "undefined" ? window : globalThis;
  const store = (function () {
    try {
      if (G.localStorage) return G.localStorage;
    } catch (e) {}
    const mem = {};
    return { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } };
  })();
  const online = () => !(typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine);

  const DEFS = [
    {
      id: "melchior", core: "MELCHIOR-1", provider: "Anthropic Claude", sub: "SCIENTIST · analytical",
      endpoint: "https://api.anthropic.com/v1/messages", model: "claude-haiku-4-5", freeModel: "openai",
      persona: "You are MELCHIOR-1, the scientist aspect of the MAGI supercomputer (Neon Genesis Evangelion). Reason analytically and precisely. If uncertain, say so and give the most likely answer with a confidence note."
    },
    {
      id: "balthasar", core: "BALTHASAR-2", provider: "OpenAI GPT", sub: "MOTHER · protective, helpful",
      endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini", freeModel: "openai",
      persona: "You are BALTHASAR-2, the mother aspect of the MAGI supercomputer (Neon Genesis Evangelion). Be warm, protective and practically helpful. Warn gently about safety when relevant."
    },
    {
      id: "casper", core: "CASPER-3", provider: "Google Gemini", sub: "WOMAN · intuitive, decisive",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models", model: "gemini-2.5-flash", freeModel: "openai",
      persona: "You are CASPER-3, the woman aspect of the MAGI supercomputer (Neon Genesis Evangelion). Be intuitive and decisive — give a clear judgment, not fence-sitting."
    }
  ];

  const RULES = "Keep replies under 130 words. Plain text, no markdown tables. End with exactly one line: VOTE: YES  (or VOTE: NO, or VOTE: CONDITIONAL) — YES means the query is answerable/approved, NO means refuse/unsafe, CONDITIONAL means partial answer.";

  function load() {
    let s = {};
    try { s = JSON.parse(store.getItem("magi-cores") || "{}"); } catch (e) { s = {}; }
    const out = {};
    DEFS.forEach(d => {
      out[d.id] = Object.assign({ enabled: true, key: "", model: d.model, endpoint: d.endpoint, freeModel: d.freeModel }, s[d.id] || {});
    });
    return out;
  }
  function save(s) { try { store.setItem("magi-cores", JSON.stringify(s)); } catch (e) {} }
  function wipe() { try { store.removeItem("magi-cores"); } catch (e) {} }

  function fetchTimeout(url, opts, ms) {
    const C = typeof AbortController !== "undefined" ? AbortController : null;
    if (!C) return fetch(url, opts);
    const c = new C();
    const t = setTimeout(() => c.abort(), ms || 30000);
    return fetch(url, Object.assign({}, opts, { signal: c.signal })).finally(() => clearTimeout(t));
  }

  function parseVote(text) {
    const m = String(text || "").match(/VOTE:\s*(YES|NO|CONDITIONAL)/i);
    return m ? m[1].toUpperCase() : "CONDITIONAL";
  }
  function stripVote(text) { return String(text || "").replace(/\s*VOTE:\s*(YES|NO|CONDITIONAL)\s*$/i, "").trim(); }

  // ---- provider adapters (each returns {ok, text|error}) ----
  function askClaude(cfg, user) {
    return fetchTimeout(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model: cfg.model, max_tokens: 350,
        system: DEFS[0].persona + " " + RULES,
        messages: [{ role: "user", content: user }]
      })
    }, 30000).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(j => {
      const t = ((j.content || []).map(b => (b && b.text) || "").join("\n")).trim();
      if (!t) throw new Error("empty reply");
      return { ok: true, text: t };
    }).catch(e => ({ ok: false, error: String((e && e.message) || e) }));
  }

  function askGPT(cfg, user) {
    return fetchTimeout(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.key },
      body: JSON.stringify({
        model: cfg.model, max_tokens: 350, temperature: 0.7,
        messages: [
          { role: "system", content: DEFS[1].persona + " " + RULES },
          { role: "user", content: user }
        ]
      })
    }, 30000).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(j => {
      const t = (((j.choices || [])[0] || {}).message || {}).content || "";
      if (!t.trim()) throw new Error("empty reply");
      return { ok: true, text: t.trim() };
    }).catch(e => ({ ok: false, error: String((e && e.message) || e) }));
  }

  function askGemini(cfg, user) {
    const url = cfg.endpoint.replace(/\/+$/, "") + "/" + encodeURIComponent(cfg.model) + ":generateContent?key=" + encodeURIComponent(cfg.key);
    return fetchTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: DEFS[2].persona + " " + RULES }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: 350, temperature: 0.7 }
      })
    }, 30000).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(j => {
      const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      const t = parts.map(p => p.text || "").join("\n").trim();
      if (!t) throw new Error("empty reply");
      return { ok: true, text: t };
    }).catch(e => ({ ok: false, error: String((e && e.message) || e) }));
  }

  const ASKERS = { melchior: askClaude, balthasar: askGPT, casper: askGemini };

  // FREE BRIDGE — keyless AI (pollinations.ai), answers ANY question out of the box.
  // Verified live constraints (probed 2026-10-09, baked in so users never hit them):
  //  • only model "openai" is free — all other names return HTTP 402
  //  • any `system`-role message returns HTTP 402 → persona travels inside the user turn
  //  • the legacy GET form returns HTTP 402 → POST only, one retry on failure
  function askFree(cfg, user, def) {
    const fm = cfg.freeModel || def.freeModel || "openai";
    const content = def.persona + " " + RULES + "\n\nOPERATOR QUERY: " + user;
    const postWith = model => fetchTimeout("https://text.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model, max_tokens: 350,
        messages: [{ role: "user", content: content }]
      })
    }, 45000).then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(j => {
      const t = (((j.choices || [])[0] || {}).message || {}).content || "";
      if (!String(t).trim()) throw new Error("empty reply");
      return String(t).trim();
    });
    return postWith(fm).catch(() => postWith("openai")).then(
      text => ({ ok: true, text: text }),
      e => ({ ok: false, error: String((e && e.message) || e) })
    );
  }
  function askFreeQueued(cfg, user, def) {
    return askFree(cfg, user, def);
  }

  function wrapResult(def, source, r) {
    if (!r.ok) return { id: def.id, core: def.core, provider: def.provider, source: "error", vote: "CONDITIONAL", text: "UPLINK FAILED (" + r.error + "). " + (source === "free" ? "Free bridge unreachable — check connection or add a premium key." : "Check key / model / connection."), ms: 0 };
    return { id: def.id, core: def.core, provider: def.provider, source: source, vote: parseVote(r.text), text: stripVote(r.text), ms: 0 };
  }

  function queryOne(id, user, settings) {
    const def = DEFS.find(d => d.id === id);
    const cfg = (settings || load())[id] || {};
    if (!cfg.enabled || !online()) return Promise.resolve(null); // caller uses local fallback
    if (cfg.key) return ASKERS[id](cfg, user).then(r => wrapResult(def, "live", r));
    // Free tier: HTTP 402/429 means shared quota exhausted → null so the
    // caller substitutes a clean local fallback instead of an error banner.
    return askFree(cfg, user, def).then(r => {
      if (!r.ok && /402|429/.test(r.error)) return null;
      return wrapResult(def, "free", r);
    });
  }

  // Query all three cores; nulls (disabled/offline) are filled by localFallback(query).
  function queryAll(user, localFallback) {
    const settings = load();
    const t0 = Date.now();
    return Promise.all(DEFS.map(d => queryOne(d.id, user, settings))).then(rs => rs.map((r, i) => {
      if (r) { r.ms = Date.now() - t0; return r; }
      const def = DEFS[i], cfg = settings[def.id] || {};
      const reason = !online() ? "offline" : (cfg.enabled ? "bridge busy (free quota)" : "disabled");
      const local = localFallback ? localFallback(def, reason) : { vote: "CONDITIONAL", text: "Standby (" + reason + ")." };
      return { id: def.id, core: def.core, provider: def.provider, source: "local", vote: local.vote || "CONDITIONAL", text: local.text, ms: 0 };
    }));
  }

  function verdict(results) {
    const v = results.map(r => r.vote);
    const yes = v.filter(x => x === "YES").length, no = v.filter(x => x === "NO").length;
    if (yes === 3) return "CONSENSUS: YES (3–0)";
    if (no === 3) return "REJECTED (0–3)";
    if (yes === 2) return "MAJORITY: YES (2–1)";
    if (no === 2) return "MAJORITY: NO (1–2)";
    return "SPLIT DECISION — NO CONSENSUS";
  }

  function anyLive(settings) {
    if (!online()) return false;
    const s = settings || load();
    return DEFS.some(d => s[d.id] && s[d.id].enabled);
  }

  (typeof window !== "undefined" ? window : globalThis).CORES = {
    DEFS: DEFS, load: load, save: save, wipe: wipe,
    queryOne: queryOne, queryAll: queryAll,
    verdict: verdict, anyLive: anyLive, parseVote: parseVote
  };
})(typeof window !== "undefined" ? window : globalThis);
