/* ─── TABS ───────────────────────────────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

/* ─── BEHEADINGS — read from data/beheadings.json (written by GitHub Actions) */
const BEHEAD_PHRASE = {
  en: 'has been beheaded.',
  ru: 'был обезголовлен.',
  et: 'pea lõigati maha.',
};

function getLang() {
  return document.documentElement.lang || 'en';
}

function formatCount(name, count) {
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

function renderFeedEntry(entry) {
  const feed = document.getElementById('beheading-feed');
  if (!feed) return;
  const lang   = getLang();
  const phrase = BEHEAD_PHRASE[lang] || BEHEAD_PHRASE.en;
  const name   = typeof entry === 'string' ? entry : entry.name;
  const ts     = entry.ts ? new Intl.DateTimeFormat([], {
    timeZone: 'Australia/Melbourne',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(entry.ts)) + ' (Melbourne)' : '';

  const div = document.createElement('div');
  div.className = 'behead-entry';
  div.innerHTML = `
    <span class="behead-icon">⚔️</span>
    <div class="behead-body">
      <span class="behead-text"><strong>${name}</strong> ${phrase}</span>
      ${ts ? `<span class="behead-ts">${ts}</span>` : ''}
    </div>`;
  feed.appendChild(div);
}

function renderMemberBadge(name, count) {
  if (count <= 0) return;
  const card = document.querySelector(`.member-card[data-member="${name}"]`);
  if (!card) return;
  let badge = card.querySelector('.member-behead-count');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'member-behead-count';
    card.appendChild(badge);
  }
  badge.textContent = `⚔️ ${formatCount(name, count)}`;
}

function applyData(data) {
  // render feed (newest first — log is already stored newest-first)
  const feed = document.getElementById('beheading-feed');
  if (feed) feed.innerHTML = '';
  (data.log || []).forEach(entry => renderFeedEntry(entry));

  // render member badges
  Object.entries(data.counts || {}).forEach(([name, count]) => {
    renderMemberBadge(name, count);
  });
}

// resolve the correct path to data/beheadings.json regardless of subfolder depth
function dataPath() {
  // pages at /ru/ or /et/ are one level deep — go up one
  const depth = window.location.pathname.replace(/\/$/, '').split('/').length - 1;
  // on GitHub Pages the root is at depth 1 (/<repo>/), subpages at depth 2
  // locally depth varies; simplest heuristic: if pathname contains /ru/ or /et/ prepend ../
  if (/\/(ru|et)(\/|$)/.test(window.location.pathname)) {
    return '../data/beheadings.json';
  }
  return './data/beheadings.json';
}

fetch(dataPath() + '?t=' + Date.now())
  .then(r => r.json())
  .then(data => applyData(data))
  .catch(() => {
    // fallback for local file:// development — read from localStorage
    const fallback = {
      counts: {
        Caleb: parseInt(localStorage.getItem('behead_Caleb') || '0'),
        Rosa:  parseInt(localStorage.getItem('behead_Rosa')  || '0'),
        Jacob: parseInt(localStorage.getItem('behead_Jacob') || '0'),
        Est:   parseInt(localStorage.getItem('behead_Est')   || '0'),
      },
      log: JSON.parse(localStorage.getItem('behead_log') || '[]'),
    };
    applyData(fallback);
  });

// re-fetch every 5 minutes so an open tab stays current without a reload
setInterval(() => {
  fetch(dataPath() + '?t=' + Date.now())
    .then(r => r.json())
    .then(data => applyData(data))
    .catch(() => {});
}, 5 * 60 * 1000);

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
  { id: 'clock-za', tz: 'Africa/Johannesburg' },
  { id: 'clock-et', tz: 'Europe/Tallinn'       },
  { id: 'clock-au', tz: 'Australia/Melbourne'  },
  { id: 'clock-fi', tz: 'Europe/Helsinki'      },
];

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
