const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalSearch.tsx', 'utf8');
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('src/components/GlobalSearch.tsx', content, 'utf8');
