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

/* ─── LIVE CLOCKS ────────────────────────────────────────────────────────── */
const ZONES = [
  { id: 'clock-za',  tz: 'Africa/Johannesburg',  city: 'Cape Town',  temp: '16°C' },
  { id: 'clock-et',  tz: 'Europe/Tallinn',        city: 'Tallinn',    temp: '15°C' },
  { id: 'clock-au',  tz: 'Australia/Melbourne',   city: 'Melbourne',  temp: '12°C' },
  { id: 'clock-fi',  tz: 'Europe/Helsinki',       city: 'Helsinki',   temp: '14°C' },
];

const fmt = tz => new Intl.DateTimeFormat([], {
  timeZone: tz,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function tickClocks() {
  ZONES.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) el.textContent = fmt(z.tz).format(new Date());
  });
}

tickClocks();
setInterval(tickClocks, 1000);
