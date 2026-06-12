const fs   = require('fs');
const path = require('path');

const FILE    = path.join(__dirname, '../data/beheadings.json');
const MEMBERS = ['Caleb', 'Rosa', 'Jacob', 'Est'];
const MAX_LOG = 50;

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const name = MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
const ts   = new Date().toISOString();

data.counts[name] = (data.counts[name] || 0) + 1;
data.log.unshift({ name, ts });
if (data.log.length > MAX_LOG) data.log = data.log.slice(0, MAX_LOG);

fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
console.log(`Beheaded: ${name} at ${ts}`);
