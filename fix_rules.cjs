const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
const lines = rules.split('\n');
const fixedLines = lines.filter(line => !line.trim().match(/^}$/) && !line.trim().match(/^}$/));
// find the last match /chats and then append correctly
