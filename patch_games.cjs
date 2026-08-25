const fs = require('fs');
let content = fs.readFileSync('src/games.ts', 'utf8');

// 1. Ace Attorney
content = content.replace(
  '"file": "Games/aceattorney.html"',
  '"file": "https://truffled.lol/games/aceattorney/"'
);

// 2. TikTok
content = content.replace(
  '"file": "https://nhjkdbiondnnd.dila.cl/embed.html#https://tiktok.com"',
  '"file": "https://opium.best/~/7dm8ml54/hudiigjq/https%3A%2F%2Fwww.tiktok.com%2Fforyou"'
);

// 3. Add GTA V, GTA San Andreas, Instagram
const newGames = `  {
    "id": "GTA V",
    "title": "GTA V",
    "image": "https://ui-avatars.com/api/?name=GTA+V&background=random&color=fff&size=256&font-size=0.33",
    "type": "game",
    "file": "https://opium.best/"
  },
  {
    "id": "GTA San Andreas",
    "title": "GTA San Andreas",
    "image": "https://ui-avatars.com/api/?name=GTA+SA&background=random&color=fff&size=256&font-size=0.33",
    "type": "game",
    "file": "https://truffled.lol/games/gtasan/"
  },
  {
    "id": "Instagram",
    "title": "Instagram",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "type": "app",
    "file": "https://opium.best/~/7dm8ml54/hudiigjq/https%3A%2F%2Fwww.instagram.com%2F"
  },
`;

// Insert new games right after TikTok
const tiktokBlock = `  {
    "id": "TikTok",
    "title": "TikTok",
    "image": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "type": "app",
    "file": "https://opium.best/~/7dm8ml54/hudiigjq/https%3A%2F%2Fwww.tiktok.com%2Fforyou"
  },`;

content = content.replace(tiktokBlock, tiktokBlock + '\n' + newGames);

fs.writeFileSync('src/games.ts', content);
