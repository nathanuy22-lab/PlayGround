/* Offline WORLD map — real country boundaries (world.json, bundled, no tiles, no network after caching).
   + 50 India cities + 48 world cities. India highlighted, countries clickable. */
"use strict";
(function (global) {

  // Fallback India outline (used only if world.json fails to load). Schematic.
  const OUTLINE = [
    [74.3, 35.5], [75.5, 34.6], [76.2, 33.8], [77.5, 32.5], [78.9, 31.8], [80.2, 31.2],
    [81.2, 30.8], [82.5, 30.3], [84.0, 29.5], [85.2, 28.8], [86.8, 28.2], [88.1, 27.9],
    [89.0, 27.3], [89.7, 26.8], [90.5, 26.5], [91.5, 26.2], [92.5, 25.8], [93.5, 25.3],
    [94.5, 25.0], [95.2, 24.3], [94.8, 23.5], [93.8, 23.0], [92.8, 22.5], [92.2, 21.8],
    [91.8, 21.3], [91.0, 22.0], [90.2, 22.5], [89.5, 22.8], [88.9, 22.5], [88.3, 21.9],
    [87.5, 21.3], [86.8, 20.5], [86.0, 19.8], [84.8, 19.0], [83.5, 18.0], [82.5, 17.0],
    [81.5, 16.0], [80.8, 15.5], [80.2, 14.0], [80.0, 12.5], [79.8, 11.0], [79.5, 9.8],
    [78.5, 8.5], [77.5, 8.1], [76.5, 8.8], [76.0, 10.0], [75.8, 11.5], [75.5, 13.0],
    [74.8, 14.5], [74.3, 15.8], [73.5, 17.0], [72.8, 18.5], [72.5, 20.0], [72.0, 21.2],
    [71.5, 22.0], [70.0, 22.5], [69.0, 22.8], [68.2, 23.3], [68.8, 24.2], [69.5, 25.2],
    [70.2, 26.0], [71.0, 27.0], [72.0, 28.0], [73.0, 29.0], [73.5, 30.0], [74.0, 31.0],
    [73.8, 32.0], [73.5, 33.0], [74.0, 34.2], [74.3, 35.5]
  ];

  const CITIES = [
    { name: "New Delhi", lat: 28.61, lng: 77.20, state: "Delhi (NCT)", note: "National capital. India Gate, Red Fort, Parliament." },
    { name: "Mumbai", lat: 19.07, lng: 72.87, state: "Maharashtra", note: "Financial capital. Gateway of India, Bollywood." },
    { name: "Kolkata", lat: 22.57, lng: 88.36, state: "West Bengal", note: "City of Joy. Howrah Bridge, Eden Gardens." },
    { name: "Chennai", lat: 13.08, lng: 80.27, state: "Tamil Nadu", note: "Marina Beach, auto-manufacturing hub." },
    { name: "Bengaluru", lat: 12.97, lng: 77.59, state: "Karnataka", note: "Silicon Valley of India. Vidhana Soudha." },
    { name: "Hyderabad", lat: 17.38, lng: 78.48, state: "Telangana", note: "Charminar, HITEC City, biryani wars." },
    { name: "Ahmedabad", lat: 23.02, lng: 72.57, state: "Gujarat", note: "Sabarmati Ashram, textile & heritage city." },
    { name: "Surat", lat: 21.17, lng: 72.83, state: "Gujarat", note: "Diamond & textile hub on the Tapi." },
    { name: "Pune", lat: 18.52, lng: 73.85, state: "Maharashtra", note: "Oxford of the East, IT + auto hub." },
    { name: "Jaipur", lat: 26.91, lng: 75.78, state: "Rajasthan", note: "Pink City. Hawa Mahal, Amber Fort." },
    { name: "Udaipur", lat: 24.58, lng: 73.71, state: "Rajasthan", note: "City of Lakes, Lake Pichola." },
    { name: "Jaisalmer", lat: 26.91, lng: 70.91, state: "Rajasthan", note: "Golden Fort in the Thar desert." },
    { name: "Lucknow", lat: 26.84, lng: 80.94, state: "Uttar Pradesh", note: "City of Nawabs. Bara Imambara." },
    { name: "Agra", lat: 27.17, lng: 78.00, state: "Uttar Pradesh", note: "Taj Mahal (1632–53), Agra Fort." },
    { name: "Varanasi", lat: 25.31, lng: 82.98, state: "Uttar Pradesh", note: "Oldest living city. Kashi Vishwanath, ghats." },
    { name: "Kanpur", lat: 26.44, lng: 80.33, state: "Uttar Pradesh", note: "Industrial city on the Ganga." },
    { name: "Patna", lat: 25.59, lng: 85.13, state: "Bihar", note: "Ancient Pataliputra on the Ganga." },
    { name: "Gaya", lat: 24.79, lng: 85.00, state: "Bihar", note: "Bodh Gaya nearby — Buddha's enlightenment." },
    { name: "Ranchi", lat: 23.34, lng: 85.31, state: "Jharkhand", note: "City of Waterfalls, state capital." },
    { name: "Bhubaneswar", lat: 20.29, lng: 85.82, state: "Odisha", note: "Temple City. Lingaraj, Konark day-trip." },
    { name: "Puri", lat: 19.81, lng: 85.83, state: "Odisha", note: "Jagannath Temple, Rath Yatra, beach." },
    { name: "Raipur", lat: 21.25, lng: 81.63, state: "Chhattisgarh", note: "Steel & rice-bowl capital." },
    { name: "Bhopal", lat: 23.25, lng: 77.41, state: "Madhya Pradesh", note: "City of Lakes. Sanchi Stupa nearby." },
    { name: "Indore", lat: 22.71, lng: 75.85, state: "Madhya Pradesh", note: "Cleanest city, food capital Sarafa." },
    { name: "Nagpur", lat: 21.14, lng: 79.08, state: "Maharashtra", note: "Orange City, zero-mile centre of India." },
    { name: "Visakhapatnam", lat: 17.68, lng: 83.21, state: "Andhra Pradesh", note: "Vizag port, RK Beach, Eastern Naval Command." },
    { name: "Amaravati", lat: 16.57, lng: 80.35, state: "Andhra Pradesh", note: "Planned legislative capital on the Krishna." },
    { name: "Chandigarh", lat: 30.73, lng: 76.77, state: "Chandigarh", note: "Le Corbusier planned city; joint capital." },
    { name: "Amritsar", lat: 31.63, lng: 74.87, state: "Punjab", note: "Golden Temple, Wagah border ceremony." },
    { name: "Shimla", lat: 31.10, lng: 77.17, state: "Himachal Pradesh", note: "Queen of Hills, ex-summer capital." },
    { name: "Srinagar", lat: 34.08, lng: 74.79, state: "Jammu and Kashmir", note: "Dal Lake houseboats, Mughal gardens." },
    { name: "Leh", lat: 34.15, lng: 77.58, state: "Ladakh", note: "High desert 3,500 m. Pangong, Khardung La." },
    { name: "Dehradun", lat: 30.31, lng: 78.03, state: "Uttarakhand", note: "Doon valley, gateway to Char Dham." },
    { name: "Rishikesh", lat: 30.08, lng: 78.28, state: "Uttarakhand", note: "Yoga capital on the Ganga." },
    { name: "Panaji", lat: 15.49, lng: 73.82, state: "Goa", note: "Mandovi riverfront, Latin Quarter." },
    { name: "Gandhinagar", lat: 23.22, lng: 72.65, state: "Gujarat", note: "Planned capital, Akshardham." },
    { name: "Thiruvananthapuram", lat: 8.52, lng: 76.93, state: "Kerala", note: "Capital. Kovalam beach, Padmanabha temple." },
    { name: "Kochi", lat: 9.93, lng: 76.27, state: "Kerala", note: "Queen of Arabian Sea. Fort Kochi, backwaters." },
    { name: "Coimbatore", lat: 11.01, lng: 76.95, state: "Tamil Nadu", note: "Manchester of South India." },
    { name: "Madurai", lat: 9.92, lng: 78.11, state: "Tamil Nadu", note: "Meenakshi Temple, 2,500-year-old city." },
    { name: "Gangtok", lat: 27.33, lng: 88.61, state: "Sikkim", note: "Himalayan capital under Kanchenjunga." },
    { name: "Guwahati", lat: 26.14, lng: 91.73, state: "Assam", note: "Gateway to NE. Kamakhya temple, Brahmaputra." },
    { name: "Shillong", lat: 25.57, lng: 91.88, state: "Meghalaya", note: "Scotland of the East, rock music capital." },
    { name: "Imphal", lat: 24.81, lng: 93.93, state: "Manipur", note: "Loktak lake nearby, polo birthplace." },
    { name: "Aizawl", lat: 23.73, lng: 92.71, state: "Mizoram", note: "Hill capital above the Tlawng valley." },
    { name: "Kohima", lat: 25.67, lng: 94.10, state: "Nagaland", note: "Hornbill Festival, WWII memorial." },
    { name: "Itanagar", lat: 27.10, lng: 93.61, state: "Arunachal Pradesh", note: "Foothill capital; Tawang axis north." },
    { name: "Agartala", lat: 23.83, lng: 91.28, state: "Tripura", note: "Ujjayanta Palace, near Bangladesh border." },
    { name: "Port Blair", lat: 11.62, lng: 92.72, state: "Andaman and Nicobar", note: "Sri Vijaya Puram. Cellular Jail, island gateway." },
    { name: "Kavaratti", lat: 10.56, lng: 72.63, state: "Lakshadweep", note: "Coral atoll capital in the Arabian Sea." },
  ];

  // World cities. `country` matches world.json names; `capital:true` marks national capitals.
  const WORLD_CITIES = [
    { name: "London", lat: 51.50, lng: -0.12, country: "United Kingdom", capital: true, note: "Thames capital. Big Ben, Tube." },
    { name: "Paris", lat: 48.85, lng: 2.35, country: "France", capital: true, note: "Eiffel Tower, Louvre, Seine." },
    { name: "Berlin", lat: 52.52, lng: 13.40, country: "Germany", capital: true, note: "Brandenburg Gate, reunified capital." },
    { name: "Rome", lat: 41.90, lng: 12.49, country: "Italy", capital: true, note: "Colosseum, Vatican City enclave." },
    { name: "Madrid", lat: 40.41, lng: -3.70, country: "Spain", capital: true, note: "Prado, Plaza Mayor." },
    { name: "Moscow", lat: 55.75, lng: 37.61, country: "Russia", capital: true, note: "Red Square, Kremlin." },
    { name: "Ankara", lat: 39.93, lng: 32.85, country: "Turkey", capital: true, note: "Anatolian capital." },
    { name: "Istanbul", lat: 41.00, lng: 28.97, country: "Turkey", note: "Bosphorus strait city, Hagia Sophia." },
    { name: "Beijing", lat: 39.90, lng: 116.40, country: "China", capital: true, note: "Forbidden City, Tiananmen." },
    { name: "Tokyo", lat: 35.67, lng: 139.65, country: "Japan", capital: true, note: "Largest metro on Earth. Shibuya, Shinkansen hub." },
    { name: "Seoul", lat: 37.56, lng: 126.97, country: "South Korea", capital: true, note: "Han river megacity." },
    { name: "Pyongyang", lat: 39.03, lng: 125.75, country: "North Korea", capital: true, note: "Capital of North Korea." },
    { name: "Bangkok", lat: 13.75, lng: 100.50, country: "Thailand", capital: true, note: "Chao Phraya river, temples." },
    { name: "Singapore", lat: 1.35, lng: 103.81, country: "Singapore", capital: true, note: "Island city-state, Marina Bay." },
    { name: "Jakarta", lat: -6.20, lng: 106.84, country: "Indonesia", capital: true, note: "Java megacity." },
    { name: "Kuala Lumpur", lat: 3.13, lng: 101.68, country: "Malaysia", capital: true, note: "Petronas Towers." },
    { name: "Manila", lat: 14.59, lng: 120.98, country: "Philippines", capital: true, note: "Manila Bay port capital." },
    { name: "Hanoi", lat: 21.02, lng: 105.84, country: "Vietnam", capital: true, note: "Hoan Kiem lake, Old Quarter." },
    { name: "Dhaka", lat: 23.81, lng: 90.41, country: "Bangladesh", capital: true, note: "Buriganga delta megacity." },
    { name: "Kathmandu", lat: 27.71, lng: 85.32, country: "Nepal", capital: true, note: "Himalayan valley capital." },
    { name: "Colombo", lat: 6.92, lng: 79.85, country: "Sri Lanka", capital: true, note: "Island port capital." },
    { name: "Thimphu", lat: 27.47, lng: 89.63, country: "Bhutan", capital: true, note: "Himalayan kingdom capital." },
    { name: "Malé", lat: 4.17, lng: 73.50, country: "Maldives", capital: true, note: "Atoll capital in the Indian Ocean." },
    { name: "Naypyidaw", lat: 19.76, lng: 96.07, country: "Myanmar", capital: true, note: "Planned inland capital." },
    { name: "Yangon", lat: 16.84, lng: 96.17, country: "Myanmar", note: "Former capital. Shwedagon Pagoda." },
    { name: "Karachi", lat: 24.86, lng: 67.00, country: "Pakistan", note: "Arabian Sea port megacity." },
    { name: "Islamabad", lat: 33.68, lng: 73.04, country: "Pakistan", capital: true, note: "Planned Margalla Hills capital." },
    { name: "Kabul", lat: 34.52, lng: 69.17, country: "Afghanistan", capital: true, note: "High-valley capital." },
    { name: "Tehran", lat: 35.68, lng: 51.38, country: "Iran", capital: true, note: "Alborz foothill capital." },
    { name: "Baghdad", lat: 33.31, lng: 44.36, country: "Iraq", capital: true, note: "Tigris river capital." },
    { name: "Riyadh", lat: 24.71, lng: 46.67, country: "Saudi Arabia", capital: true, note: "Desert plateau capital." },
    { name: "Dubai", lat: 25.20, lng: 55.27, country: "United Arab Emirates", note: "Burj Khalifa, Gulf trade hub." },
    { name: "Doha", lat: 25.28, lng: 51.53, country: "Qatar", capital: true, note: "West Bay skyline." },
    { name: "Cairo", lat: 30.04, lng: 31.23, country: "Egypt", capital: true, note: "Nile megacity. Giza pyramids nearby." },
    { name: "Lagos", lat: 6.52, lng: 3.37, country: "Nigeria", note: "Atlantic megacity." },
    { name: "Abuja", lat: 9.05, lng: 7.48, country: "Nigeria", capital: true, note: "Planned inland capital." },
    { name: "Nairobi", lat: -1.29, lng: 36.82, country: "Kenya", capital: true, note: "Safari capital." },
    { name: "Johannesburg", lat: -26.20, lng: 28.04, country: "South Africa", note: "Largest SA city, gold-reef metropolis." },
    { name: "Pretoria", lat: -25.74, lng: 28.18, country: "South Africa", capital: true, note: "Administrative capital." },
    { name: "Cape Town", lat: -33.92, lng: 18.42, country: "South Africa", note: "Table Mountain, legislative capital." },
    { name: "Kinshasa", lat: -4.32, lng: 15.31, country: "Democratic Republic of the Congo", capital: true, note: "Congo river megacity." },
    { name: "New York", lat: 40.71, lng: -74.00, country: "United States of America", note: "Hudson harbour megacity. Statue of Liberty." },
    { name: "Washington", lat: 38.90, lng: -77.03, country: "United States of America", capital: true, note: "Federal capital. Mall, Capitol." },
    { name: "Los Angeles", lat: 34.05, lng: -118.24, country: "United States of America", note: "Pacific sprawl. Hollywood." },
    { name: "Toronto", lat: 43.65, lng: -79.38, country: "Canada", note: "CN Tower lakeside city." },
    { name: "Ottawa", lat: 45.42, lng: -75.69, country: "Canada", capital: true, note: "Federal capital." },
    { name: "Mexico City", lat: 19.43, lng: -99.13, country: "Mexico", capital: true, note: "High-altitude Aztec-rooted capital." },
    { name: "São Paulo", lat: -23.55, lng: -46.63, country: "Brazil", note: "Southern-hemisphere giant." },
    { name: "Brasília", lat: -15.79, lng: -47.88, country: "Brazil", capital: true, note: "Planned modernist capital." },
    { name: "Buenos Aires", lat: -34.60, lng: -58.38, country: "Argentina", capital: true, note: "Río de la Plata port capital." },
    { name: "Lima", lat: -12.04, lng: -77.03, country: "Peru", capital: true, note: "Pacific desert capital." },
    { name: "Bogotá", lat: 4.71, lng: -74.07, country: "Colombia", capital: true, note: "Andean high capital." },
    { name: "Santiago", lat: -33.44, lng: -70.66, country: "Chile", capital: true, note: "Andes-foothill capital." },
    { name: "Sydney", lat: -33.86, lng: 151.20, country: "Australia", note: "Harbour city. Opera House." },
    { name: "Canberra", lat: -35.28, lng: 149.13, country: "Australia", capital: true, note: "Planned bush capital." },
    { name: "Auckland", lat: -36.84, lng: 174.76, country: "New Zealand", note: "City of Sails." },
    { name: "Wellington", lat: -41.28, lng: 174.77, country: "New Zealand", capital: true, note: "Windy harbour capital." },
  ];

  const ALLCITIES = CITIES.concat(WORLD_CITIES);
  if (typeof window !== "undefined") { window.WORLD_CITIES = WORLD_CITIES; window.ALLCITIES = ALLCITIES; }
  else { globalThis.WORLD_CITIES = WORLD_CITIES; globalThis.ALLCITIES = ALLCITIES; }

  // ---- pure geo helpers (also used by node tests) ----
  function bboxOf(polys) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    polys.forEach(poly => poly.forEach(ring => ring.forEach(p => {
      if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1];
      if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1];
    })));
    return [x0, y0, x1, y1];
  }
  function pointInRing(ring, lng, lat) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function countryAt(countries, lng, lat) {
    for (const c of countries) {
      const b = c.bbox;
      if (!b || lng < b[0] || lat < b[1] || lng > b[2] || lat > b[3]) continue;
      for (const poly of c.g) {
        if (poly.length && pointInRing(poly[0], lng, lat)) {
          let hole = false;
          for (let k = 1; k < poly.length; k++) if (pointInRing(poly[k], lng, lat)) { hole = true; break; }
          if (!hole) return c.n;
        }
      }
    }
    return null;
  }

  // ---- shared geo math (Web-Mercator, tile-compatible; lat clamped ±85.0511°) ----
  const MAXLAT = 85.05112878, MAXSCALE = 16384;
  function mercY(lat) {
    const l = Math.max(-MAXLAT, Math.min(MAXLAT, lat)) * Math.PI / 180;
    return (1 - Math.log(Math.tan(l) + 1 / Math.cos(l)) / Math.PI) / 2;
  }
  function mercLat(y) {
    return (2 * Math.atan(Math.exp(Math.PI * (1 - 2 * y))) - Math.PI / 2) * 180 / Math.PI;
  }
  const TILE_HOST = "https://a.basemaps.cartocdn.com/rastertiles/voyager";
  function tileUrl(z, x, y) { return TILE_HOST + "/" + z + "/" + x + "/" + y + ".png"; }
  function lngLatToTile(lng, lat, z) {
    const n = Math.pow(2, z);
    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(mercY(lat) * n);
    return [Math.min(n - 1, Math.max(0, x)), Math.min(n - 1, Math.max(0, y))];
  }
  // tile pyramid covering a circle — estimates + offline downloads
  function regionTiles(lng, lat, radiusKm, minZ, maxZ) {
    const list = [];
    const cosLat = Math.max(0.2, Math.cos(lat * Math.PI / 180));
    const latR = radiusKm / 111, lngR = radiusKm / (111 * cosLat);
    for (let z = minZ; z <= maxZ; z++) {
      const a = lngLatToTile(lng - lngR, lat + latR, z), b = lngLatToTile(lng + lngR, lat - latR, z);
      for (let x = a[0]; x <= b[0]; x++) for (let y = a[1]; y <= b[1]; y++) list.push([z, x, y]);
    }
    return list;
  }

  function createMap(canvas, opts) {
    opts = opts || {};
    const onSelect = opts.onSelect || function () {};
    const ctx = canvas.getContext("2d");
    const view = { scale: 1, tx: 0, ty: 0 };
    let route = null, selected = null, world = null;
    let markers = [];
    let readyResolve = null;
    const ready = new Promise(res => { readyResolve = res; });

    // Web-Mercator base (tile-compatible); math lives at top level
    function baseProject(lng, lat, W, H) {
      return [((lng + 180) / 360) * W, mercY(lat) * H];
    }
    function project(lng, lat) {
      const W = canvas.width, H = canvas.height;
      const p = baseProject(lng, lat, W, H);
      const cx = W / 2, cy = H / 2;
      return [(p[0] - cx) * view.scale + cx + view.tx, (p[1] - cy) * view.scale + cy + view.ty];
    }
    function centreOn(lng, lat, scale) {
      if (scale) view.scale = Math.min(MAXSCALE, Math.max(0.8, scale));
      const W = canvas.width, H = canvas.height;
      const p = baseProject(lng, lat, W, H);
      view.tx = -(p[0] - W / 2) * view.scale;
      view.ty = -(p[1] - H / 2) * view.scale;
    }
    function fitBounds(b, pad) {
      pad = pad || 0.9;
      const W = canvas.width, H = canvas.height;
      const p0 = baseProject(b[0], b[3], W, H), p1 = baseProject(b[2], b[1], W, H);
      const bw = Math.max(1, p1[0] - p0[0]), bh = Math.max(1, p1[1] - p0[1]);
      view.scale = Math.min(MAXSCALE, Math.max(0.8, Math.min(W / bw, H / bh) * pad));
      centreOn((b[0] + b[2]) / 2, (b[1] + b[3]) / 2);
    }

    function traceCountry(c) {
      c.g.forEach(poly => poly.forEach((ring, ri) => {
        ring.forEach((p, i) => {
          const pr = project(p[0], p[1]);
          if (i === 0) ctx.moveTo(pr[0], pr[1]); else ctx.lineTo(pr[0], pr[1]);
        });
        ctx.closePath();
      }));
    }

    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#050608"); g.addColorStop(1, "#0b0703");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (mode === "vector") {
      // graticule every 30°
      ctx.lineWidth = 1;
      for (let lng = -180; lng <= 180; lng += 30) {
        const a = project(lng, -90), b = project(lng, 90);
        ctx.strokeStyle = lng === 0 ? "rgba(255,176,0,.4)" : "rgba(255,106,0,.12)";
        ctx.beginPath(); ctx.moveTo(a[0], 0); ctx.lineTo(b[0], H); ctx.stroke();
        ctx.fillStyle = "rgba(255,176,0,.45)"; ctx.font = "11px monospace";
        ctx.fillText(lng + "°", a[0] + 3, H - 6);
      }
      for (let lat = -60; lat <= 80; lat += 30) {
        const p = project(0, lat);
        ctx.strokeStyle = lat === 0 ? "rgba(255,176,0,.4)" : "rgba(255,106,0,.12)";
        ctx.beginPath(); ctx.moveTo(0, p[1]); ctx.lineTo(W, p[1]); ctx.stroke();
        ctx.fillStyle = "rgba(255,176,0,.45)"; ctx.fillText(lat + "°", 6, p[1] - 4);
      }
      } // end vector-only graticule

      if (mode === "street") drawTiles();

      if (world && mode === "vector") {
        for (const c of world) {
          const isIndia = c.n === "India";
          const isSel = selected && selected.kind === "country" && selected.name === c.n;
          ctx.beginPath();
          traceCountry(c);
          if (isIndia) { ctx.fillStyle = "rgba(255,106,0,.22)"; }
          else if (isSel) { ctx.fillStyle = "rgba(0,255,157,.20)"; }
          else { ctx.fillStyle = "rgba(245,233,208,.055)"; }
          ctx.fill();
          ctx.strokeStyle = isIndia ? "#ff6a00" : isSel ? "#00ff9d" : "rgba(255,176,0,.35)";
          ctx.lineWidth = isIndia || isSel ? 2 : 1;
          ctx.stroke();
        }
        // country labels (only when wide enough on screen)
        ctx.textAlign = "center";
        for (const c of world) {
          const b = c.bbox;
          const p0 = project(b[0], b[1]), p1 = project(b[2], b[3]);
          const wpx = Math.abs(p1[0] - p0[0]);
          const isIndia = c.n === "India";
          if (!isIndia && wpx < 70) continue;
          const cxp = (p0[0] + p1[0]) / 2, cyp = (p0[1] + p1[1]) / 2;
          if (cxp < -50 || cyp < -20 || cxp > W + 50 || cyp > H + 20) continue;
          const isSel = selected && selected.kind === "country" && selected.name === c.n;
          ctx.font = (isIndia || isSel ? "bold " : "") + (wpx > 160 ? 13 : 11) + "px monospace";
          ctx.fillStyle = isIndia ? "#ffb000" : isSel ? "#00ff9d" : "rgba(245,233,208,.55)";
          ctx.fillText(isIndia ? "INDIA ★" : c.n.toUpperCase(), cxp, cyp);
        }
        ctx.textAlign = "left";
      } else {
        // fallback schematic while world.json loads (or if it failed)
        ctx.beginPath();
        OUTLINE.forEach((p, i) => {
          const bp = baseProject(p[0], p[1], W, H);
          const cx = W / 2, cy = H / 2;
          const X = (bp[0] - cx) * view.scale + cx + view.tx, Y = (bp[1] - cy) * view.scale + cy + view.ty;
          i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(255,106,0,.14)"; ctx.fill();
        ctx.strokeStyle = "#ff6a00"; ctx.lineWidth = 2; ctx.stroke();
      }

      // route
      if (route) {
        const a = project(route[0].lng, route[0].lat), b = project(route[1].lng, route[1].lat);
        ctx.strokeStyle = "#00ff9d"; ctx.lineWidth = 3; ctx.setLineDash([10, 7]);
        ctx.beginPath(); ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.18, b[0], b[1]);
        ctx.stroke(); ctx.setLineDash([]);
      }

      // markers
      markers = [];
      const zoomed = view.scale > 2.0;
      for (const c of ALLCITIES) {
        const p = project(c.lng, c.lat);
        if (p[0] < -30 || p[1] < -30 || p[0] > W + 30 || p[1] > H + 30) continue;
        const isSel = selected && selected.kind === "city" && selected.name === c.name;
        const major = !!c.capital || /^(New Delhi|Mumbai|Kolkata|Chennai|Bengaluru|Hyderabad|Jaipur|Lucknow|Bhopal|Guwahati|Leh|Srinagar|Kochi|New York|Los Angeles|Toronto|Sydney|Dubai|Karachi|Dhaka|Istanbul|Johannesburg|Lagos|Nairobi|Cairo|São Paulo|Buenos Aires)$/.test(c.name);
        if (!zoomed && !major && !isSel) {
          ctx.fillStyle = "rgba(245,233,208,.4)";
          ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fill();
          markers.push({ c: c, x: p[0], y: p[1], r: 8 });
          continue;
        }
        if (zoomed || major || isSel) {
          const R = isSel ? 9 : 7;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = Math.PI / 3 * i - Math.PI / 6;
            const px = p[0] + R * Math.cos(a), py = p[1] + R * Math.sin(a);
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = isSel ? "#00ff9d" : (c.capital ? "#37f4ff" : "#ff6a00");
          ctx.fill();
          ctx.strokeStyle = "#000"; ctx.lineWidth = 1.5; ctx.stroke();
          const label = (isSel ? "▶ " : "") + c.name;
          ctx.font = (isSel ? "bold " : "") + "12px monospace";
          const tw = ctx.measureText(label).width;
          ctx.fillStyle = "rgba(0,0,0,.72)"; ctx.fillRect(p[0] + 10, p[1] - 10, tw + 8, 18);
          ctx.fillStyle = isSel ? "#00ff9d" : "#f5e9d0"; ctx.fillText(label, p[0] + 14, p[1] + 4);
          markers.push({ c: c, x: p[0], y: p[1], r: 14 });
        }
      }
      ctx.fillStyle = "rgba(255,176,0,.85)"; ctx.font = "bold 13px monospace";
      ctx.fillText("N ▲", W - 46, 26);
      ctx.fillStyle = "rgba(245,233,208,.6)"; ctx.font = "11px monospace";
      ctx.fillText(mode === "street" ? ("STREET z" + tileZ() + " · OSM/CARTO · CACHED OFFLINE") : (world ? ("ACCURATE WORLD VECTORS · " + world.length + " COUNTRIES · OFFLINE") : "LOADING WORLD VECTORS…"), 10, 18);
    }

    function eventPos(e) {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)];
    }
    function unproject(px, py) {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
      const x = (px - cx - view.tx) / view.scale + cx, y = (py - cy - view.ty) / view.scale + cy;
      return [(x / W) * 360 - 180, mercLat(y / H)];
    }
    function pick(px, py) {
      let best = null, bd = 1e9;
      for (const m of markers) {
        const d = Math.hypot(m.x - px, m.y - py);
        if (d < Math.max(18, m.r + 8) && d < bd) { bd = d; best = m.c; }
      }
      return best;
    }

    let drag = null;
    canvas.addEventListener("pointerdown", e => { drag = { p: eventPos(e), tx: view.tx, ty: view.ty, moved: false }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
    canvas.addEventListener("pointermove", e => {
      const pos = eventPos(e);
      if (drag) {
        const dx = pos[0] - drag.p[0], dy = pos[1] - drag.p[1];
        if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
        view.tx = drag.tx + dx; view.ty = drag.ty + dy; draw();
      } else { canvas.style.cursor = "grab"; }
    });
    canvas.addEventListener("pointerup", e => {
      if (drag && !drag.moved) {
        const pos = eventPos(e);
        const hit = pick(pos[0], pos[1]);
        if (hit) { selected = { kind: "city", name: hit.name }; draw(); onSelect({ type: "city", city: hit }); }
        else if (world) {
          const ll = unproject(pos[0], pos[1]);
          const cn = countryAt(world, ll[0], ll[1]);
          selected = cn ? { kind: "country", name: cn } : null;
          draw();
          if (cn) onSelect({ type: "country", name: cn, bbox: (world.find(c => c.n === cn) || {}).bbox || null });
        }
      }
      drag = null; canvas.style.cursor = "grab";
    });
    canvas.addEventListener("wheel", e => { e.preventDefault(); zoom(e.deltaY < 0 ? 1.25 : 1 / 1.25); }, { passive: false });
    canvas.addEventListener("dblclick", e => { e.preventDefault(); zoom(2); });

    // ---- map mode: "vector" (always offline) vs "street" (OSM tiles, cached) ----
    let mode = "vector";
    function setMode(m) { mode = (m === "street") ? "street" : "vector"; draw(); }
    function getMode() { return mode; }
    function scaleForZ(z) { return 256 * Math.pow(2, z) / canvas.width; }
    function tileZ() { return Math.max(2, Math.min(16, Math.round(Math.log2(canvas.width * view.scale / 256)))); }

    function zoom(f) { view.scale = Math.min(MAXSCALE, Math.max(0.8, view.scale * f)); draw(); }
    function reset() { view.scale = 1; view.tx = 0; view.ty = 0; route = null; selected = null; draw(); }
    function focusCity(city, s) {
      selected = { kind: "city", name: city.name };
      centreOn(city.lng, city.lat, mode === "street" ? scaleForZ(14) : (s || 2.5));
      draw(); onSelect({ type: "city", city: city });
    }
    function focusCountry(name) {
      if (!world) return null;
      const c = world.find(x => x.n.toLowerCase() === String(name).toLowerCase());
      if (!c) return null;
      selected = { kind: "country", name: c.n };
      fitBounds(c.bbox);
      draw(); onSelect({ type: "country", name: c.n, bbox: c.bbox });
      return c;
    }
    function setRoute(a, b) { route = [a, b]; selected = null; draw(); }

    function findCity(frag) {
      const f = String(frag || "").toLowerCase().trim(); if (!f) return null;
      return ALLCITIES.find(c => c.name.toLowerCase() === f) || ALLCITIES.find(c => c.name.toLowerCase().includes(f)) || null;
    }
    function findCountry(frag) {
      if (!world) return null;
      const f = String(frag || "").toLowerCase().trim(); if (!f) return null;
      return world.find(c => c.n.toLowerCase() === f) || world.find(c => c.n.toLowerCase().includes(f)) || null;
    }
    function findPlace(frag) {
      const city = findCity(frag);
      if (city) return { kind: "city", city: city };
      const co = findCountry(frag);
      if (co) return { kind: "country", name: co.n, bbox: co.bbox };
      return null;
    }

    // ---- STREET TILE ENGINE (OpenStreetMap via CARTO Voyager; cached for offline) ----
    // Tiles are fetched on demand and stored in the "magi-tiles-v1" cache, so any
    // street you view while online stays available offline. Region downloads pre-warm it.
    const TILE_CACHE = "magi-tiles-v1";
    const TILE_ATTRIB = "© OpenStreetMap contributors © CARTO";
    const tileMem = new Map(); // key -> bitmap | null(loading) | false(failed)
    let tileQueue = [], tileActive = 0;
    function queueTile(z, x, y) {
      const k = z + "/" + x + "/" + y;
      if (tileMem.has(k)) return;
      tileMem.set(k, null);
      tileQueue.push([z, x, y]);
      pumpTiles();
    }
    function pumpTiles() {
      while (tileActive < 4 && tileQueue.length) {
        const t = tileQueue.shift(); tileActive++;
        fetchTile(t[0], t[1], t[2]).finally(() => { tileActive--; pumpTiles(); draw(); });
      }
    }
    function bitmapFromBlob(blob) {
      if (typeof createImageBitmap !== "undefined") return createImageBitmap(blob);
      return new Promise((res, rej) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => { URL.revokeObjectURL(url); res(img); };
        img.onerror = e => { URL.revokeObjectURL(url); rej(e); };
        img.src = url;
      });
    }
    function imgTagFallback(url) {
      // Last resort: plain <img> renders cross-origin tiles (tainted, uncacheable) instead of failing.
      return new Promise(res => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => {
          const i2 = new Image();
          i2.onload = () => res(i2);
          i2.onerror = () => res(null);
          i2.src = url;
        };
        img.src = url;
      });
    }
    function fetchTile(z, x, y) {
      const k = z + "/" + x + "/" + y, url = tileUrl(z, x, y);
      const cache = (typeof caches !== "undefined") ? caches : null;
      const store = blob => {
        let img = null;
        return bitmapFromBlob(blob).then(b => { img = b; }).catch(() => null).then(() => {
          tileMem.set(k, img || false);
          if (tileMem.size > 400) tileMem.delete(tileMem.keys().next().value);
        });
      };
      const net = () => fetch(url).then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        const copy = r.clone();
        if (cache) cache.open(TILE_CACHE).then(cc => cc.put(url, copy)).catch(() => {});
        return r.blob();
      });
      const viaCache = cache ? cache.match(url).then(hit => hit ? hit.blob() : null).catch(() => null) : Promise.resolve(null);
      return viaCache.then(blob => blob ? store(blob)
        : net().then(store, () => imgTagFallback(url).then(img => {
          tileMem.set(k, img || false);
          if (tileMem.size > 400) tileMem.delete(tileMem.keys().next().value);
        })));
    }
    function drawTiles() {
      const W = canvas.width, H = canvas.height;
      const z = tileZ(), n = Math.pow(2, z);
      const tl = unproject(0, 0), br = unproject(W, H);
      const lon0 = Math.max(-180, tl[0]), lon1 = Math.min(180, br[0]);
      const my0 = mercY(Math.min(MAXLAT, tl[1])), my1 = mercY(Math.max(-MAXLAT, br[1]));
      const x0 = Math.floor((lon0 + 180) / 360 * n), x1 = Math.floor((lon1 + 180) / 360 * n);
      const ty0 = Math.max(0, Math.floor(my0 * n)), ty1 = Math.min(n - 1, Math.floor(my1 * n));
      if (x1 - x0 > 14 || ty1 - ty0 > 14) return; // too far out — vector bg suffices
      for (let x = x0; x <= x1; x++) {
        const xx = ((x % n) + n) % n;
        const lonA = xx / n * 360 - 180, lonB = (xx + 1) / n * 360 - 180;
        for (let y = ty0; y <= ty1; y++) {
          const latA = mercLat((y + 1) / n), latB = mercLat(y / n);
          const p0 = project(lonA, latA), p1 = project(lonB, latB);
          const k = z + "/" + xx + "/" + y;
          const img = tileMem.get(k);
          if (img && img.width) ctx.drawImage(img, p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
          else {
            ctx.fillStyle = "#101013"; ctx.fillRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
            ctx.strokeStyle = "rgba(255,106,0,.25)"; ctx.lineWidth = 1;
            ctx.strokeRect(p0[0] + 0.5, p0[1] + 0.5, p1[0] - p0[0] - 1, p1[1] - p0[1] - 1);
            if (img === undefined) queueTile(z, xx, y);
          }
        }
      }
    }
    // ---- OFFLINE REGION DOWNLOADS ----
    function regionsLoad() {
      try { return JSON.parse(localStorage.getItem("magi-regions") || "[]"); }
      catch (e) { return []; }
    }
    function regionsSave(list) { try { localStorage.setItem("magi-regions", JSON.stringify(list)); } catch (e) {} }
    function estimateRegion(lng, lat, radiusKm, minZ, maxZ) {
      return regionTiles(lng, lat, radiusKm, minZ, maxZ).length;
    }
    function downloadRegion(name, lng, lat, radiusKm, minZ, maxZ, onProg) {
      const tiles = regionTiles(lng, lat, radiusKm, minZ, maxZ);
      if (tiles.length > 4000) return Promise.reject(new Error("area too large (" + tiles.length + " tiles) — shrink radius"));
      if (typeof caches === "undefined") return Promise.reject(new Error("Cache API unavailable in this browser"));
      let done = 0, bytes = 0, alive = 0, idx = 0;
      onProg && onProg(0, tiles.length);
      return caches.open(TILE_CACHE).then(cache => new Promise((resolve, reject) => {
        let failed = 0;
        function next() {
          while (alive < 4 && idx < tiles.length) {
            const t = tiles[idx++]; alive++;
            const url = tileUrl(t[0], t[1], t[2]);
            cache.match(url).then(hit => hit || fetch(url).then(r => {
              if (!r.ok) throw new Error("HTTP " + r.status);
              return cache.put(url, r.clone()).then(() => r);
            })).then(r => r ? r.blob().catch(() => null) : null).then(b => {
              if (b) bytes += b.size || 0; else failed++;
            }).catch(() => { failed++; }).finally(() => {
              alive--; done++;
              onProg && onProg(done, tiles.length);
              if (done >= tiles.length) {
                const rec = { name: name, lng: lng, lat: lat, r: radiusKm, z0: minZ, z1: maxZ, tiles: tiles.length, bytes: bytes, failed: failed, ts: Date.now() };
                const list = regionsLoad().filter(x => x.name !== name);
                list.push(rec); regionsSave(list);
                resolve(rec);
              } else next();
            });
          }
        }
        next();
      }));
    }
    function listRegions() { return regionsLoad(); }
    function deleteRegion(name) {
      const rec = regionsLoad().find(x => x.name === name);
      regionsSave(regionsLoad().filter(x => x.name !== name));
      if (!rec || typeof caches === "undefined") return Promise.resolve(0);
      const tiles = regionTiles(rec.lng, rec.lat, rec.r, rec.z0, rec.z1);
      return caches.open(TILE_CACHE).then(cache =>
        Promise.all(tiles.map(t => cache.delete(tileUrl(t[0], t[1], t[2])).catch(() => false)))
          .then(rs => rs.filter(Boolean).length));
    }

    // async load of real boundaries (service-worker cached → offline OK)
    try {
      fetch("world.json").then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(j => {
        world = (j.countries || []).map(c => ({ n: c.n, g: c.g, bbox: bboxOf(c.g) }));
        draw();
        readyResolve(true);
      }).catch(() => readyResolve(false));
    } catch (e) { readyResolve(false); }
    draw();
    return {
      draw: draw, zoom: zoom, reset: reset, focusCity: focusCity, focusCountry: focusCountry,
      setRoute: setRoute, ready: ready,
      getCities: () => ALLCITIES.slice(),
      getCountryCount: () => (world ? world.length : 0),
      findCity: findCity, findPlace: findPlace,
      setMode: setMode, getMode: getMode, scaleForZ: scaleForZ, tileZ: tileZ,
      estimateRegion: estimateRegion, downloadRegion: downloadRegion,
      listRegions: listRegions, deleteRegion: deleteRegion, tileAttrib: TILE_ATTRIB
    };
  }

  global.INDIA_MAP = {
    CITIES: CITIES, WORLD_CITIES: WORLD_CITIES, ALLCITIES: ALLCITIES,
    OUTLINE: OUTLINE, createMap: createMap,
    _geo: { pointInRing: pointInRing, countryAt: countryAt, bboxOf: bboxOf, mercY: mercY, mercLat: mercLat, lngLatToTile: lngLatToTile, regionTiles: regionTiles, tileUrl: tileUrl }
  };
})(typeof window !== "undefined" ? window : globalThis);
