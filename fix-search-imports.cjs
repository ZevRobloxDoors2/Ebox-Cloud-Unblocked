const fs = require('fs');

let content = fs.readFileSync('src/components/GlobalSearch.tsx', 'utf8');

content = content.replace(
  "import { Search, Headphones, X, Settings, Users, MessageSquare, Gamepad2, User, Flame } from 'lucide-react';",
  "import { Search, Headphones, X, Settings, Users, MessageSquare, Gamepad2, User, Flame } from 'lucide-react';"
);

fs.writeFileSync('src/components/GlobalSearch.tsx', content, 'utf8');
