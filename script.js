/* ─── TABS ───────────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ─── VAULT DENIAL ───────────────────────────────────────────────────────── */
const MESSAGES = [
  '🚨 ACCESS DENIED 🚨',
  '⛔ DO NOT PRESS HIM! ⛔',
  '⚠️ WARNING: EST HAS LEAVED THE CHAT ⚠️',
  '🔒 CLEARANCE LEVEL: INEXISTENT 🔒',
  '💀 FATAL ERROR: NAME TOO POWERFUL 💀',
  '🛑 VAULT SELF-DESTRUCT IN 3... 2... jk 🛑',
];

const overlay = document.getElementById('denial-overlay');

document.getElementById('btn-vault')?.addEventListener('click', () => {
  document.getElementById('denial-msg').textContent =
    MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  overlay.classList.add('show');
});

document.getElementById('btn-dismiss')?.addEventListener('click', () => overlay.classList.remove('show'));
overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });

/* ─── LIBRARY ARCHIVE ────────────────────────────────────────────────────── */
async function loadArchive() {
  const listEl = document.getElementById('archive-list');
  if (!listEl) return;
  try {
    const url = (window.location.pathname.includes('/ru/') || window.location.pathname.includes('/et/'))
      ? '../data/archive.json' : './data/archive.json';
    const response = await fetch(url + '?t=' + Date.now());
      const data = await response.json();

    if (data.files && data.files.length > 0) {
      listEl.innerHTML = data.files.map(f => `
        <div class="archive-item" style="margin-bottom: 10px;">
          <a href="${f.url}" target="_blank" class="btn-vault" style="text-decoration:none; display:inline-block; padding: 10px 20px;">📄 ${f.name}</a>
        </div>
      `).join('');
    } else {
      listEl.innerHTML = '<p>Archive is empty.</p>';
    }
    } catch (e) {
    console.error('Archive loading failed', e);
    listEl.innerHTML = '<p>Could not load library.</p>';
    }
}
loadArchive();

/* ─── LIVE CLOCKS & WEATHER ──────────────────────────────────────────────── */
const ZONES = [
  { id: 'clock-za', tz: 'Africa/Johannesburg', lat: -33.9249, lon:  18.4241 },
  { id: 'clock-et', tz: 'Europe/Tallinn',       lat:  57.8340, lon:  26.5360 },
  { id: 'clock-au', tz: 'Australia/Melbourne',  lat: -37.8136, lon: 144.9631 },
  { id: 'clock-fi', tz: 'Europe/Helsinki',      lat:  59.9793, lon:  23.6815 },
];

function wmoLabel(code) {
  if (code === 0)  return '☀️ Clear';
  if (code <= 2)   return '🌤️ Partly Cloudy';
  if (code === 3)  return '☁️ Overcast';
  if (code <= 49)  return '🌫️ Fog';
  if (code <= 57)  return '🌧️ Drizzle';
  if (code <= 67)  return '🌧️ Rain';
  if (code <= 77)  return '🌨️ Snow';
  if (code <= 82)  return '🌦️ Showers';
  if (code <= 86)  return '🌨️ Snow Showers';
  if (code <= 99)  return '⚡ Thunderstorm';
  return '🌡️ Unknown';
}

async function fetchWeather() {
  await Promise.all(ZONES.map(async z => {
    try {
      const url  = `https://api.open-meteo.com/v1/forecast?latitude=${z.lat}&longitude=${z.lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
        `&wind_speed_unit=kmh&timezone=${encodeURIComponent(z.tz)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const c    = data.current;
      const item = document.getElementById(z.id)?.closest('.clock-item');
      if (!item) return;
      item.querySelector('.clock-temp').textContent      = `${Math.round(c.temperature_2m)}°C · Feels ${Math.round(c.apparent_temperature)}°C`;
      item.querySelector('.clock-condition').textContent = wmoLabel(c.weather_code);
      item.querySelector('.clock-details').innerHTML     = `<span>💧 ${c.relative_humidity_2m}%</span><span>💨 ${Math.round(c.wind_speed_10m)} km/h</span>`;
    } catch (e) {
      console.error(`Weather fetch failed for ${z.id}:`, e);
    }
  }));
}

fetchWeather();
setInterval(fetchWeather, 15 * 60 * 1000);

const displayFmt = tz => new Intl.DateTimeFormat([], {
  timeZone: tz, hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
});

function tickClocks() {
  const now = new Date();
  ZONES.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) el.textContent = displayFmt(z.tz).format(now);
  });
}

tickClocks();
setInterval(tickClocks, 1000);

