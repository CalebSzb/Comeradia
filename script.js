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

const beheadCounts = {
  Caleb: parseInt(localStorage.getItem('behead_Caleb') || '0'),
  Rosa:  parseInt(localStorage.getItem('behead_Rosa')  || '0'),
  Jacob: parseInt(localStorage.getItem('behead_Jacob') || '0'),
  Est:   parseInt(localStorage.getItem('behead_Est')   || '0'),
};

let beheadLog = JSON.parse(localStorage.getItem('behead_log') || '[]');
// each log entry: { name, ts } — ts is ISO timestamp

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

function renderFeedEntry(entry, animate) {
  const feed = document.getElementById('beheading-feed');
  if (!feed) return;
  const lang   = getLang();
  const phrase = BEHEAD_PHRASE[lang] || BEHEAD_PHRASE.en;
  // support both old plain-string entries and new {name,ts} objects
  const name   = typeof entry === 'string' ? entry : entry.name;
  const ts     = typeof entry === 'string' ? null   : entry.ts;
  const timeStr = ts ? new Intl.DateTimeFormat([], {
    timeZone: 'Australia/Melbourne',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(ts)) + ' (Melbourne)' : '';

  const div = document.createElement('div');
  div.className = animate ? 'behead-entry new' : 'behead-entry';
  div.innerHTML = `
    <span class="behead-icon">⚔️</span>
    <div class="behead-body">
      <span class="behead-text"><strong>${name}</strong> ${phrase}</span>
      ${timeStr ? `<span class="behead-ts">${timeStr}</span>` : ''}
    </div>`;
  feed.prepend(div);
  if (animate) setTimeout(() => div.classList.remove('new'), 600);
}

function addBeheading() {
  const name = randomMember();
  const ts   = new Date().toISOString();

  beheadCounts[name]++;
  localStorage.setItem(`behead_${name}`, beheadCounts[name]);

  const logEntry = { name, ts };
  beheadLog.unshift(logEntry);
  if (beheadLog.length > 50) beheadLog.pop();
  localStorage.setItem('behead_log', JSON.stringify(beheadLog));

  renderFeedEntry(logEntry, true);
  updateMemberBadge(name);
}

// restore feed and badges on page load
beheadLog.forEach(name => renderFeedEntry(name, false));
MEMBERS.forEach(name => { if (beheadCounts[name] > 0) updateMemberBadge(name); });

/* ─── CLOCK-BASED BEHEADING TRIGGER ─────────────────────────────────────── */
// Fires once per hour on the exact hour in Melbourne time (every hour = beheading)
let lastBeheadingHour = -1;

/* ─── LIVE CLOCKS & WEATHER ──────────────────────────────────────────────── */
const ZONES = [
  { id: 'clock-za', tz: 'Africa/Johannesburg' },
  { id: 'clock-et', tz: 'Europe/Tallinn'       },
  { id: 'clock-au', tz: 'Australia/Melbourne'  },
  { id: 'clock-fi', tz: 'Europe/Helsinki'      },
];

const melbourneFmt = new Intl.DateTimeFormat([], {
  timeZone: 'Australia/Melbourne',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const displayFmt = tz => new Intl.DateTimeFormat([], {
  timeZone: tz,
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function tickClocks() {
  const now  = new Date();

  // update all clock displays
  ZONES.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) el.textContent = displayFmt(z.tz).format(now);
  });

  // check Melbourne time for exact hour trigger
  const parts  = melbourneFmt.formatToParts(now);
  const hour   = parseInt(parts.find(p => p.type === 'hour').value);
  const minute = parseInt(parts.find(p => p.type === 'minute').value);
  const second = parseInt(parts.find(p => p.type === 'second').value);

  if (minute === 0 && second === 0 && hour !== lastBeheadingHour) {
    lastBeheadingHour = hour;
    addBeheading();
  }
}

tickClocks();
setInterval(tickClocks, 1000);

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
