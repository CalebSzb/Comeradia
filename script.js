/* ─── TABS ───────────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ─── DAILY BEHEADINGS ───────────────────────────────────────────────────── */
const MEMBERS = ['Caleb', 'Rosa', 'Jacob', 'Est'];

const BEHEAD_PHRASE = {
  en: 'has been beheaded.',
  ru: 'был обезголовлен.',
  et: 'pea lõigati maha.',
};

// counts loaded from localStorage — shared across all language pages
const beheadCounts = {
  Caleb: parseInt(localStorage.getItem('behead_Caleb') || '0'),
  Rosa:  parseInt(localStorage.getItem('behead_Rosa')  || '0'),
  Jacob: parseInt(localStorage.getItem('behead_Jacob') || '0'),
  Est:   parseInt(localStorage.getItem('behead_Est')   || '0'),
};

// feed log stored as array of name strings (language-neutral)
let beheadLog = JSON.parse(localStorage.getItem('behead_log') || '[]');

function getLang() {
  return document.documentElement.lang || 'en';
}

function randomMember() {
  return MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
}

function formatCount(count) {
  const lang = getLang();
  if (lang === 'ru') {
    const m10 = count % 10, m100 = count % 100;
    if (m10 === 1 && m100 !== 11)                            return `Обезглавлен ${count} раз`;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `Обезглавлен ${count} раза`;
    return `Обезглавлен ${count} раз`;
  }
  if (lang === 'et') return `Hukatud ${count} korda`;
  return `Beheaded ${count} Time${count === 1 ? '' : 's'}`;
}

function updateMemberBadge(name) {
  const card = document.querySelector(`.member-card[data-member="${name}"]`);
  if (!card) return;
  let badge = card.querySelector('.member-behead-count');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'member-behead-count';
    card.appendChild(badge);
  }
  badge.textContent = `⚔️ ${formatCount(beheadCounts[name])}`;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 400);
}

function renderFeedEntry(name, animate) {
  const feed = document.getElementById('beheading-feed');
  if (!feed) return;
  const lang   = getLang();
  const phrase = BEHEAD_PHRASE[lang] || BEHEAD_PHRASE.en;
  const entry  = document.createElement('div');
  entry.className = animate ? 'behead-entry new' : 'behead-entry';
  entry.innerHTML = `
    <span class="behead-icon">⚔️</span>
    <span class="behead-text"><strong>${name}</strong> ${phrase}</span>`;
  feed.prepend(entry);
  if (animate) setTimeout(() => entry.classList.remove('new'), 600);
}

function addBeheading() {
  const name = randomMember();

  beheadCounts[name]++;
  localStorage.setItem(`behead_${name}`, beheadCounts[name]);

  beheadLog.unshift(name);           // newest first
  if (beheadLog.length > 50) beheadLog.pop(); // cap history at 50
  localStorage.setItem('behead_log', JSON.stringify(beheadLog));

  renderFeedEntry(name, true);
  updateMemberBadge(name);
}

// on page load: restore feed from log and badges from counts
beheadLog.forEach(name => renderFeedEntry(name, false));
MEMBERS.forEach(name => { if (beheadCounts[name] > 0) updateMemberBadge(name); });

// fire a new beheading every hour
const INTERVAL_MS = 60 * 60 * 1000;

// store the next beheading timestamp so it's consistent across language pages
if (!localStorage.getItem('behead_next')) {
  localStorage.setItem('behead_next', Date.now() + INTERVAL_MS);
}

function tickCountdown() {
  const el = document.getElementById('behead-countdown');
  if (!el) return;
  const remaining = parseInt(localStorage.getItem('behead_next')) - Date.now();
  if (remaining <= 0) {
    addBeheading();
    localStorage.setItem('behead_next', Date.now() + INTERVAL_MS);
    return;
  }
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  const lang = getLang();
  const label = lang === 'ru' ? 'Следующая казнь через'
              : lang === 'et' ? 'Järgmine hukkamine'
              : 'Next beheading in';
  el.textContent = `${label}: ${pad(h)}:${pad(m)}:${pad(s)}`;
}

tickCountdown();
setInterval(tickCountdown, 1000);

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

/* ─── LIVE CLOCKS & WEATHER ──────────────────────────────────────────────── */
const ZONES = [
  { id: 'clock-za', tz: 'Africa/Johannesburg' },
  { id: 'clock-et', tz: 'Europe/Tallinn'       },
  { id: 'clock-au', tz: 'Australia/Melbourne'  },
  { id: 'clock-fi', tz: 'Europe/Helsinki'      },
];

const fmt = tz => new Intl.DateTimeFormat([], {
  timeZone: tz,
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function tickClocks() {
  ZONES.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) el.textContent = fmt(z.tz).format(new Date());
  });
}

tickClocks();
setInterval(tickClocks, 1000);
