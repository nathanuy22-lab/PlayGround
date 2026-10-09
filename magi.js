/* MAGI offline heuristic engine — 100% on-device. No fetch, no network. */
"use strict";
(function (global) {

  const STATES = [
    { name: "Andhra Pradesh", capital: "Amaravati", pop: "53M", area: "160,205 km²", lang: "Telugu", info: "Coastal state on the Bay of Bengal. Amaravati is the legislative capital; Visakhapatnam is the largest city and port." },
    { name: "Arunachal Pradesh", capital: "Itanagar", pop: "1.7M", area: "83,743 km²", lang: "English, tribal languages", info: "Mountainous north-eastern state bordering Bhutan, China and Myanmar. Tawang monastery is a major landmark." },
    { name: "Assam", capital: "Dispur (Guwahati)", pop: "36M", area: "78,438 km²", lang: "Assamese", info: "Gateway to North-East India. Brahmaputra river, Kaziranga rhinos, tea gardens." },
    { name: "Bihar", capital: "Patna", pop: "128M", area: "94,163 km²", lang: "Hindi", info: "Ancient Magadha — Nalanda, Bodh Gaya. One of India's most populous states." },
    { name: "Chhattisgarh", capital: "Raipur", pop: "30M", area: "135,192 km²", lang: "Hindi, Chhattisgarhi", info: "Central Indian state rich in forests, coal and steel plants at Bhilai." },
    { name: "Goa", capital: "Panaji", pop: "1.6M", area: "3,702 km²", lang: "Konkani", info: "Smallest state by area. Portuguese heritage, beaches, tourism hub." },
    { name: "Gujarat", capital: "Gandhinagar", pop: "70M", area: "196,244 km²", lang: "Gujarati", info: "Industrial west-coast state. Ahmedabad, Surat, Gir lions, Statue of Unity." },
    { name: "Haryana", capital: "Chandigarh", pop: "29M", area: "44,212 km²", lang: "Hindi, Haryanvi", info: "Encircles Delhi on three sides. Gurugram IT hub, Kurukshetra battlefield." },
    { name: "Himachal Pradesh", capital: "Shimla", pop: "7.5M", area: "55,673 km²", lang: "Hindi", info: "Himalayan state. Shimla, Manali, Dharamshala. Hydro-power and apples." },
    { name: "Jharkhand", capital: "Ranchi", pop: "39M", area: "79,716 km²", lang: "Hindi", info: "Mineral-rich plateau state. Bokaro and Jamshedpur steel cities." },
    { name: "Karnataka", capital: "Bengaluru", pop: "68M", area: "191,791 km²", lang: "Kannada", info: "Tech capital Bengaluru, Mysuru palaces, Hampi ruins, Coorg coffee." },
    { name: "Kerala", capital: "Thiruvananthapuram", pop: "36M", area: "38,863 km²", lang: "Malayalam", info: "God's Own Country. Backwaters, Kochi port, highest literacy in India." },
    { name: "Madhya Pradesh", capital: "Bhopal", pop: "85M", area: "308,252 km²", lang: "Hindi", info: "Largest state by area (before Ladakh split debates aside, largest mainland). Bhopal, Indore, Khajuraho, Sanchi." },
    { name: "Maharashtra", capital: "Mumbai", pop: "128M", area: "307,713 km²", lang: "Marathi", info: "India's economic engine. Mumbai, Pune, Nagpur. Bollywood, Ajanta-Ellora." },
    { name: "Manipur", capital: "Imphal", pop: "3.2M", area: "22,327 km²", lang: "Manipuri", info: "Jewel of India. Loktak floating lake, classical dance, sports powerhouse." },
    { name: "Meghalaya", capital: "Shillong", pop: "3.4M", area: "22,429 km²", lang: "English, Khasi, Garo", info: "Abode of Clouds. Cherrapunji/Mawsynram — wettest places on Earth. Living root bridges." },
    { name: "Mizoram", capital: "Aizawl", pop: "1.3M", area: "21,081 km²", lang: "Mizo, English", info: "Hill state with near-total literacy, bamboo forests." },
    { name: "Nagaland", capital: "Kohima", pop: "2.2M", area: "16,579 km²", lang: "English", info: "Land of festivals. Hornbill Festival, WWII Kohima battle site." },
    { name: "Odisha", capital: "Bhubaneswar", pop: "47M", area: "155,707 km²", lang: "Odia", info: "Temple coast. Puri Jagannath, Konark Sun Temple, Chilika lake." },
    { name: "Punjab", capital: "Chandigarh", pop: "31M", area: "50,362 km²", lang: "Punjabi", info: "Granary of India. Amritsar Golden Temple, Wagah border, five rivers." },
    { name: "Rajasthan", capital: "Jaipur", pop: "81M", area: "342,239 km²", lang: "Hindi, Rajasthani", info: "Largest state by area. Thar desert, Jaipur Pink City, Udaipur lakes, Jaisalmer fort." },
    { name: "Sikkim", capital: "Gangtok", pop: "0.69M", area: "7,096 km²", lang: "Nepali, English", info: "Himalayan state under Kanchenjunga. India's first fully organic state." },
    { name: "Tamil Nadu", capital: "Chennai", pop: "77M", area: "130,058 km²", lang: "Tamil", info: "Temple towers, Marina beach, Madurai Meenakshi, Detroit of India (auto hub)." },
    { name: "Telangana", capital: "Hyderabad", pop: "38M", area: "112,077 km²", lang: "Telugu", info: "Youngest state (2014). Hyderabad — Charminar, HITEC City, pharma hub." },
    { name: "Tripura", capital: "Agartala", pop: "4.2M", area: "10,486 km²", lang: "Bengali, Kokborok", info: "North-eastern state bordering Bangladesh on three sides." },
    { name: "Uttar Pradesh", capital: "Lucknow", pop: "240M", area: "240,928 km²", lang: "Hindi", info: "Most populous state (and country-subdivision in the world). Taj Mahal Agra, Varanasi, Ayodhya." },
    { name: "Uttarakhand", capital: "Dehradun", pop: "11M", area: "53,483 km²", lang: "Hindi", info: "Devbhumi. Char Dham, Rishikesh yoga, Jim Corbett tigers." },
    { name: "West Bengal", capital: "Kolkata", pop: "102M", area: "88,752 km²", lang: "Bengali", info: "Howrah Bridge, Darjeeling tea, Sundarbans tigers, Durga Puja." },
    { name: "Delhi (NCT)", capital: "New Delhi", pop: "33M", area: "1,484 km²", lang: "Hindi", info: "National capital territory. India Gate, Red Fort, metro lucha of power and history." },
    { name: "Jammu and Kashmir", capital: "Srinagar / Jammu", pop: "12.5M", area: "55,538 km²", lang: "Kashmiri, Dogri, Hindi", info: "Dal Lake houseboats, Gulmarg skiing, Vaishno Devi pilgrimage." },
    { name: "Ladakh", capital: "Leh", pop: "0.3M", area: "59,146 km²", lang: "Ladakhi", info: "High desert. Pangong lake, Khardung La, monasteries. UT since 2019." },
    { name: "Puducherry", capital: "Puducherry", pop: "1.6M", area: "479 km²", lang: "Tamil, French", info: "Former French colony, Auroville, coastal boulevards." },
    { name: "Chandigarh", capital: "Chandigarh", pop: "1.2M", area: "114 km²", lang: "Hindi, Punjabi", info: "Le Corbusier planned city; joint capital of Punjab and Haryana." },
    { name: "Andaman and Nicobar", capital: "Sri Vijaya Puram (Port Blair)", pop: "0.4M", area: "8,249 km²", lang: "Hindi, Bengali, Tamil", info: "Bay of Bengal archipelago. Cellular Jail, Radhanagar beach." },
    { name: "Dadra and Nagar Haveli and Daman and Diu", capital: "Daman", pop: "0.6M", area: "603 km²", lang: "Gujarati, Hindi", info: "Merged western coastal UT, Portuguese forts." },
    { name: "Lakshadweep", capital: "Kavaratti", pop: "0.07M", area: "32 km²", lang: "Malayalam", info: "Coral atolls in the Arabian Sea. India's smallest UT." },
  ];

  const KB = [
    { k: ["capital of india", "india capital", "what is the capital"], a: "The capital of India is New Delhi (28.61°N, 77.20°E). It houses Rashtrapati Bhavan, Parliament House and India Gate." },
    { k: ["population of india", "how many people in india", "india population"], a: "India has ~1.44 billion people (2024 UN estimate) — the world's most populous country, across 28 states + 8 UTs." },
    { k: ["currency of india", "indian currency", "money in india"], a: "Currency: Indian Rupee (₹, INR). Coins: 1–20 ₹; notes: 10–500 ₹. 1 ₹ ≈ 100 paise." },
    { k: ["prime minister", "pm of india", "who leads india"], a: "As of my bundled data (verify by radio/news when online): Narendra Modi has been Prime Minister since 2014. MAGI is offline and cannot track live elections — confirm via current broadcast." },
    { k: ["president of india"], a: "As of bundled data: Droupadi Murmu has been President since 2022. Confirm via current broadcast — MAGI is offline." },
    { k: ["independence day", "when did india independence", "15 august"], a: "India became independent on 15 August 1947. Republic Day is 26 January (Constitution adopted 1950)." },
    { k: ["national anthem", "jana gana"], a: "National anthem: 'Jana Gana Mana' (Rabindranath Tagore). National song: 'Vande Mataram'. National animal: Bengal tiger; bird: peacock; flower: lotus." },
    { k: ["largest state", "biggest state"], a: "Largest state by area: Rajasthan (342,239 km²). Largest by population: Uttar Pradesh (~240M)." },
    { k: ["smallest state"], a: "Smallest state by area: Goa (3,702 km²). Smallest by population: Sikkim (~690K)." },
    { k: ["how many states", "number of states", "list states", "states in india"], a: "India has 28 states and 8 Union Territories. Ask 'capital of <state>' or open the DATABASE tab for the full list." },
    { k: ["taj mahal"], a: "Taj Mahal, Agra (27.17°N, 78.00°E) — ivory-marble mausoleum built by Shah Jahan (1632–1653). Wonder of the World, Yamuna riverbank." },
    { k: ["longest river", "ganga", "ganges river"], a: "Longest river: Ganga (~2,525 km) — Gangotri to Bay of Bengal via Varanasi, Patna, Kolkata. Also major: Godavari, Yamuna, Narmada, Brahmaputra." },
    { k: ["highest peak", "kanchenjunga", "mount everest india"], a: "Highest peak in India: Kanchenjunga, 8,586 m (Sikkim). Mt. Everest itself is in Nepal/Tibet." },
    { k: ["time zone", "ist ", "indian standard time"], a: "India uses IST = UTC+5:30, no daylight saving. 12:00 UTC = 17:30 IST." },
    { k: ["who built magi", "what is magi", "magi system"], a: "MAGI System: trio of supercomputers built by Dr. Naoko Akagi (NERV). Cores MELCHIOR-1 (scientist), BALTHASAR-2 (mother), CASPER-3 (woman) vote by majority — 3 aspects of their creator's personality. This terminal emulates them offline with a heuristic voting engine." },
    { k: ["what is nerv"], a: "NERV: paramilitary agency under SEELE, HQ in Tokyo-3. Motto: 'God's in His Heaven. All's Right with the World.' This app is a fan homage — an offline terminal + India map." },
    { k: ["at field", "a.t. field", "absolute terror"], a: "A.T. Field: Absolute Terror Field — the barrier of the soul; Evas and Angels project it as a near-impenetrable shield. In this terminal, our AT Field = airplane mode. Nothing gets in or out." },
    { k: ["evangelion", "what is eva", "shinji", "rei ", "asuka"], a: "Evangelion: biomechanical units piloted by children (Shinji, Rei, Asuka) to fight Angels. Entry plug, LCL fluid, sync ratio, berserk mode — MAGI can brief each unit on request: ask 'eva 01'." },
    { k: ["eva 01", "unit 01", "unit-01"], a: "EVA-01 (purple/green): piloted by Shinji Ikari, soul of Yui Ikari within. Berserk-capable. The test-type that eats Angels and its S² engine. Status in this terminal: CAGED, NOMINAL." },
    { k: ["angels", "what are angels", " Sachiel", "sachiel"], a: "Angels: 17+ waveform-pattern-blue entities (Sachiel, Shamshel, Ramiel…). MAGI classifies unknowns as PATTERN BLUE. Ask 'pattern blue' for protocol." },
    { k: ["pattern blue"], a: "PATTERN BLUE = Angel blood-pattern detected. Protocol: battle stations, Eva launch, MAGI to combat mode. No pattern blue in your current sector. Stay calm." },
    { k: ["seele"], a: "SEELE: shadow council above NERV, architects of the Human Instrumentality Project. Monolith 01–12 speak in unison: 'Alles wird gut.' MAGI advises healthy scepticism of masked committees." },
    { k: ["instrumentality"], a: "Human Instrumentality Project: SEELE's plan to dissolve AT Fields and merge all souls into one. MAGI vote on that proposal: MELCHIOR — CONDITIONAL, BALTHASAR — NO, CASPER — NO. Rejected 1–2." },
    { k: ["hello", "hi magi", "hey "], a: "Greetings, operator. MAGI cores online. Ask for facts ('capital of Kerala'), cities ('where is Leh'), distances ('distance Delhi to Mumbai'), math ('12*8+5'), or type 'help'." },
    { k: ["who are you", "your name"], a: "I am MAGI — tri-core decision system of NERV HQ, running fully offline in your browser. MELCHIOR reasons, BALTHASAR protects, CASPER judges." },
    { k: ["thank"], a: "Acknowledged, operator. MAGI exists to serve. AT Field holding. 🟠" },
    { k: ["joke"], a: "Operator humour module: Why did the Angel cross the Geofront? …MAGI voted 2–1 not to intercept. (MELCHIOR laughed. CASPER did not.)" },
    { k: ["cricket"], a: "Cricket: India's heartbeat. BCCI, IPL, Wankhede / Eden Gardens / Chepauk cathedrals. MAGI cannot stream scores offline — but Eden Gardens sits at 22.57°N, 88.36°E. See it on the MAP tab." },
    { k: ["himalaya"], a: "The Himalaya arc guards India's north — Kanchenjunga (8,586 m) highest within India; Leh (3,500 m) and Shimla plotted on the offline map." },
    { k: ["monsoon"], a: "Southwest monsoon (Jun–Sep) waters most of India; Mawsynram/Cherrapunji (Meghalaya) are the wettest places on Earth. Retreating monsoon wets Tamil Nadu Oct–Dec." },
    { k: ["yoga"], a: "Yoga: India's gift to the world — Rishikesh (Uttarakhand) is its capital; International Yoga Day is 21 June." },
    { k: ["chai", "indian food", "biryani"], a: "Field rations approved: masala chai, dosa (Tamil Nadu/Karnataka), biryani (Hyderabad/Lucknow), thali (Gujarat/Rajasthan), momos (Sikkim/Ladakh). Hydrate, operator." },
  ];

  function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }

  function scoreKB(query, entry) {
    const q = " " + norm(query) + " ";
    let best = 0;
    for (const key of entry.k) {
      const k = norm(key);
      if (!k) continue;
      if (q.includes(" " + k + " ") || q.includes(k)) best = Math.max(best, k.length * 2 + 10);
      else {
        const words = k.split(" ").filter(w => w.length > 2);
        let hit = 0;
        for (const w of words) if (q.includes(w)) hit++;
        if (words.length && hit) best = Math.max(best, (hit / words.length) * k.length);
      }
    }
    return best;
  }

  function findKB(query) {
    let best = null, bs = 0;
    for (const e of KB) { const s = scoreKB(query, e); if (s > bs) { bs = s; best = e; } }
    return bs >= 6 ? { entry: best, score: bs } : null;
  }

  function findState(query) {
    const q = norm(query);
    let best = null, bs = 0;
    for (const s of STATES) {
      const n = norm(s.name);
      if (q.includes(n)) { const sc = n.length * 3; if (sc > bs) { bs = sc; best = s; } continue; }
      const short = n.split(" ")[0];
      if (short.length > 3 && q.includes(short)) { const sc = short.length; if (sc > bs) { bs = sc; best = s; } }
    }
    return best;
  }

  // ---- world country capitals (from map bundle; works offline) ----
  const COUNTRY_ALIAS = {
    "usa": "United States of America", "us": "United States of America", "america": "United States of America",
    "uk": "United Kingdom", "britain": "United Kingdom", "england": "United Kingdom", "great britain": "United Kingdom",
    "uae": "United Arab Emirates", "emirates": "United Arab Emirates",
    "saudi": "Saudi Arabia", "ksa": "Saudi Arabia",
    "korea": "South Korea", "dprk": "North Korea", "north korea": "North Korea",
    "russia": "Russia", "tanzania": "United Republic of Tanzania",
    "congo": "Democratic Republic of the Congo", "drc": "Democratic Republic of the Congo"
  };
  function worldCapitals() {
    const wc = (typeof window !== "undefined" ? window.WORLD_CITIES : globalThis.WORLD_CITIES) || [];
    return wc.filter(c => c.capital);
  }
  function findWorldCapital(query) {
    const m = norm(query).match(/capital of (.+?)(\?|$)/);
    if (!m) return -1; // not a capital question
    let frag = (m[1] || "").trim();
    if (!frag) return -1;
    if (COUNTRY_ALIAS[frag]) frag = norm(COUNTRY_ALIAS[frag]);
    const caps = worldCapitals();
    const hits = caps.filter(c => norm(c.country) === frag || norm(c.country).includes(frag));
    if (!hits.length) return null; // not a known country — let other intents try
    return hits;
  }

  // ---- safe offline math ----
  function tryMath(query) {
    let expr = query.trim()
      .replace(/^.*?(calculate|compute|solve|evaluate|what is|whats|how much is)\s+/i, "")
      .replace(/\b(what|is|the|answer|please)\b/gi, "")
      .replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, "")
      .replace(/\b(sqrt|square root)\b/gi, "sqrt")
      .replace(/\bpi\b/gi, "PI").replace(/\b([0-9]+)\s*%\s*of\s*([0-9.]+)/gi, "($1/100*$2)")
      .replace(/\^/g, "**").trim();
    if (!/^[0-9+\-*/().\sPIEeusqrtcbtanolg%d^]*$/.test(expr) || !/[0-9]/.test(expr)) return null;
    if (/[a-zA-Z]{3,}/.test(expr.replace(/sqrt|PI|sin|cos|tan|log/g, ""))) return null;
    try {
      const fns = { sqrt: Math.sqrt, sin: x => Math.sin(x * Math.PI / 180), cos: x => Math.cos(x * Math.PI / 180), tan: x => Math.tan(x * Math.PI / 180), log: Math.log10, PI: Math.PI };
      const names = Object.keys(fns), vals = names.map(k => fns[k]);
      const fn = new Function(...names, '"use strict";return(' + expr + ')');
      const v = fn(...vals);
      if (typeof v !== "number" || !isFinite(v)) return null;
      return { expr: expr, value: Math.round(v * 10000) / 10000 };
    } catch (e) { return null; }
  }

  function tryConvert(query) {
    const m = query.toLowerCase().match(/convert\s+([0-9.]+)\s*(km|kilometers?|miles?|mi|celsius|c|fahrenheit|f|kg|kilos?|pounds?|lbs?)\s+(to|in)\s+(km|kilometers?|miles?|mi|celsius|c|fahrenheit|f|kg|kilos?|pounds?|lbs?)/);
    if (!m) return null;
    const v = parseFloat(m[1]); let from = m[2][0], to = m[4][0]; let out = null, unit = "";
    const lk = v => v;
    if ((from === "k" && to === "m") || (from === "m" && v && m[2][0] === "k")) { /* handled below generically */ }
    const f = m[2].toLowerCase(), t = m[4].toLowerCase();
    const isKm = s => s.startsWith("k"), isMi = s => s.startsWith("mi");
    if (isKm(f) && isMi(t)) { out = v * 0.621371; unit = "miles"; }
    else if (isMi(f) && isKm(t)) { out = v * 1.60934; unit = "km"; }
    else if (f[0] === "c" && t[0] === "f") { out = v * 9 / 5 + 32; unit = "°F"; }
    else if (f[0] === "f" && t[0] === "c") { out = (v - 32) * 5 / 9; unit = "°C"; }
    else if (f[0] === "k" && (t.startsWith("p") || t.startsWith("l"))) { out = v * 2.20462; unit = "lb"; }
    else if ((f.startsWith("p") || f.startsWith("l")) && t[0] === "k") { out = v * 0.453592; unit = "kg"; }
    else return null;
    return v + " " + m[2] + " = " + (Math.round(out * 100) / 100) + " " + unit + " (computed offline)";
  }

  function haversine(a, b) {
    const R = 6371, dLa = (b.lat - a.lat) * Math.PI / 180, dLo = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function askMAGI(rawQuery, cityIndex) {
    const q = (rawQuery || "").trim();
    if (!q) return { answer: "Empty query. State your question, operator.", votes: ["CONDITIONAL", "CONDITIONAL", "CONDITIONAL"], conf: [40, 40, 40], verdict: "INSUFFICIENT DATA", kind: "empty" };
    const nq = norm(q);

    // system intents
    if (/\b(help|commands|what can you|how to use)\b/.test(nq)) {
      return { answer: "MAGI FIELD MANUAL — try:\n• 'capital of India' / 'capital of Kerala'\n• 'list states' / 'info on Tamil Nadu'\n• 'where is Leh' / 'cities in Rajasthan'\n• 'distance Delhi to Mumbai'\n• '12*8+5' or 'sqrt(144)'\n• 'convert 100 km to miles'\n• 'time' / 'date'\n• 'who built MAGI' / 'what is NERV'\n• 'status' — all answered OFFLINE.\nTIP: online, the 3 cores answer ANY question via the free AI bridge (no setup). Premium keys in SYSTEM for top-tier.", votes: ["YES", "YES", "YES"], conf: [99, 99, 99], verdict: "CONSENSUS: YES", kind: "help" };
    }
    if (/\b(status|diagnostic|system check|offline)\b/.test(nq) && !/download|\bsave\b/.test(nq)) {
      const on = (typeof navigator !== "undefined" && "onLine" in navigator) ? (navigator.onLine ? "network reachable" : "network unreachable — FULL OFFLINE MODE") : "network state unknown";
      return { answer: "MAGI STATUS: 3/3 cores NOMINAL · knowledge base " + KB.length + " entries · " + STATES.length + " states/UTs · map cities " + ((cityIndex && cityIndex.length) || 0) + " plotted.\nLink: " + on + ". All reasoning on-device.", votes: ["YES", "YES", "YES"], conf: [100, 100, 100], verdict: "ALL SYSTEMS NOMINAL", kind: "status" };
    }
    if (/\b(time|clock)\b/.test(nq) && nq.length < 25) {
      const d = new Date();
      return { answer: "Local terminal time: " + d.toLocaleTimeString() + " · " + d.toLocaleDateString() + " (device clock, offline-safe).", votes: ["YES", "YES", "CONDITIONAL"], conf: [100, 100, 70], verdict: "CONSENSUS: YES", kind: "time" };
    }
    if (/\b(date|today|day is)\b/.test(nq) && nq.length < 30) {
      const d = new Date();
      return { answer: "Today is " + d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" }) + ".", votes: ["YES", "YES", "YES"], conf: [100, 100, 100], verdict: "CONSENSUS: YES", kind: "time" };
    }

    // distance intent needs cityIndex
    const dm = q.match(/distance\s+(.+?)\s+to\s+(.+)/i) || q.match(/how far.+?([a-zA-Z][a-zA-Z\s]+?)\s+(?:to|from|and)\s+([a-zA-Z][a-zA-Z\s]+)/i);
    if (dm && cityIndex) {
      const find = frag => {
        const f = norm(frag).split(" ").filter(w => w.length > 2);
        let best = null, bs = 0;
        for (const c of cityIndex) {
          const cn = norm(c.name); let s = 0;
          if (cn === norm(frag).trim()) s = 100;
          else { for (const w of f) if (cn.includes(w)) s += 10; }
          if (s > bs) { bs = s; best = c; }
        }
        return bs > 0 ? best : null;
      };
      const A = find(dm[1]), B = find(dm[2]);
      if (A && B) {
        const km = Math.round(haversine(A, B));
        const mi = Math.round(km * 0.621371);
        return { answer: "Great-circle distance " + A.name + " ↔ " + B.name + ": " + km.toLocaleString() + " km (" + mi.toLocaleString() + " mi), haversine on true lat/lng, computed offline.\n" + A.name + " " + A.lat.toFixed(2) + "°N " + A.lng.toFixed(2) + "°E · " + B.name + " " + B.lat.toFixed(2) + "°N " + B.lng.toFixed(2) + "°E.\nOpen MAP tab → ROUTE to visualise.", votes: ["YES", "YES", "YES"], conf: [97, 95, 93], verdict: "CONSENSUS: YES", kind: "distance", route: [A, B] };
      }
    }

    // offline region download ("download map of Jaipur", "save offline map for Leh")
    if (/download|save offline|offline map/.test(nq) && cityIndex) {
      const frag = q.replace(/\b(please|download|save|offline|maps?|area|around|for|of|the|a|an)\b/gi, " ").replace(/\s+/g, " ").trim();
      const f = norm(frag).split(" ").filter(w => w.length > 2);
      let best = null, bs = 0;
      for (const c of cityIndex) { const cn = norm(c.name); let s = cn === norm(frag) ? 100 : 0; for (const w of f) if (cn.includes(w)) s += 12; if (s > bs) { bs = s; best = c; } }
      if (best) return { answer: "Saving street-level offline area around " + best.name + " (±15 km default, zoom 10 up to building level: roads, buildings, labels). Watch MAP-tab progress — once done it works fully offline.", votes: ["YES", "YES", "YES"], conf: [93, 91, 88], verdict: "CONSENSUS: YES", kind: "dlmap", city: best };
    }

    // where-is city
    if ((/where is|location of|locate|coordinates of|find /.test(nq)) && cityIndex) {
      const frag = q.replace(/.*?(where is|location of|locate|coordinates of|find)/i, "");
      const f = norm(frag).split(" ").filter(w => w.length > 2);
      let best = null, bs = 0;
      for (const c of cityIndex) { const cn = norm(c.name); let s = cn === norm(frag).trim() ? 100 : 0; for (const w of f) if (cn.includes(w)) s += 12; if (s > bs) { bs = s; best = c; } }
      if (best) return { answer: best.name + " is at " + best.lat.toFixed(2) + "°N, " + best.lng.toFixed(2) + "°E (" + (best.state || best.country || "") + "). " + (best.note || "") + " Plotted on the MAP tab — search it there.", votes: ["YES", "YES", "YES"], conf: [96, 94, 92], verdict: "CONSENSUS: YES", kind: "city", city: best };
    }

    // cities in state
    if (/cities in|districts|major cities/.test(nq) && cityIndex) {
      const st = findState(q);
      if (st) {
        const list = cityIndex.filter(c => norm(c.state) === norm(st.name)).map(c => c.name);
        return { answer: "Major plotted cities in " + st.name + ": " + (list.length ? list.join(", ") : "(plot more via map search)") + ".\nCapital: " + st.capital + ". " + st.info, votes: ["YES", "YES", "CONDITIONAL"], conf: [92, 90, 75], verdict: "CONSENSUS: YES", kind: "state", state: st };
      }
    }

    // world country capital (offline, from map bundle)
    if (/capital of/.test(nq) && cityIndex) {
      const hits = findWorldCapital(q);
      if (hits && hits.length === 1) {
        const c = hits[0];
        return { answer: "The capital of " + c.country + " is " + c.name + " (" + c.lat.toFixed(2) + "°N, " + c.lng.toFixed(2) + "°E). " + (c.note || "") + " Plotted on the MAP tab — search it there.", votes: ["YES", "YES", "YES"], conf: [96, 94, 92], verdict: "CONSENSUS: YES", kind: "city", city: c };
      }
      if (hits && hits.length > 1) {
        return { answer: "Multiple capitals match — " + hits.map(c => c.name + " (" + c.country + ")").join(", ") + ". Ask for one country, e.g. 'capital of South Korea'.", votes: ["YES", "CONDITIONAL", "CONDITIONAL"], conf: [85, 65, 65], verdict: "CONSENSUS: YES", kind: "kb" };
      }
    }

    // state capital / info
    if (/capital of|info on|about|state of|tell me about/.test(nq)) {
      const st = findState(q);
      if (st) return { answer: st.name + " — capital: " + st.capital + " · pop ~" + st.pop + " · area " + st.area + " · language: " + st.lang + ".\n" + st.info, votes: ["YES", "YES", "YES"], conf: [95, 93, 90], verdict: "CONSENSUS: YES", kind: "state", state: st };
    }
    { const st = findState(q); if (st && norm(q).split(" ").length <= 4) return { answer: st.name + " — capital: " + st.capital + " · pop ~" + st.pop + " · area " + st.area + ".\n" + st.info, votes: ["YES", "YES", "CONDITIONAL"], conf: [90, 88, 72], verdict: "CONSENSUS: YES", kind: "state", state: st }; }

    const conv = tryConvert(q); if (conv) return { answer: conv, votes: ["YES", "YES", "YES"], conf: [99, 98, 97], verdict: "CONSENSUS: YES", kind: "math" };
    const mth = tryMath(q); if (mth) return { answer: mth.expr + " = " + mth.value + "  (evaluated offline, sandboxed arithmetic)", votes: ["YES", "YES", "CONDITIONAL"], conf: [99, 99, 80], verdict: "CONSENSUS: YES", kind: "math" };

    const hit = findKB(q);
    if (hit) {
      const c = Math.min(99, 70 + Math.round(hit.score));
      return { answer: hit.entry.a, votes: ["YES", "YES", "CONDITIONAL"], conf: [c, c - 2, Math.max(55, c - 15)], verdict: "CONSENSUS: YES", kind: "kb" };
    }

    // fallback: deliberated unknown
    return {
      answer: "MAGI deliberated and reaches no consensus on '" + q.slice(0, 120) + "'.\n\nMELCHIOR (scientist): no matching record in the offline bundle — I vote CONDITIONAL, rephrase with keywords.\nBALTHASAR (mother): I can still help — try 'help', a state name, a city, or a distance like 'distance Delhi to Mumbai'.\nCASPER (woman): intuition says you may be testing my limits. I vote NO on guessing; everything I say must come from on-device data.\n\nNothing was fetched. Nothing left the terminal.\n\nTo answer ANY question: go online — the 3 cores auto-query the free AI bridge with their own personalities. Premium keys in SYSTEM for Claude/GPT/Gemini.",
      votes: ["CONDITIONAL", "YES", "NO"], conf: [55, 60, 65], verdict: "SPLIT DECISION — NO CONSENSUS", kind: "unknown"
    };
  }

  global.MAGI = { STATES: STATES, KB: KB, ask: askMAGI, norm: norm, haversine: haversine };
})(typeof window !== "undefined" ? window : globalThis);
