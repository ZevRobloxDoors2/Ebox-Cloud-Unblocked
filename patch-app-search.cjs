const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. imports
content = content.replace(
  "Settings, Home, Library, Users, Bell, Headphones, Trophy, Store, ChevronLeft, Flame,",
  "Settings, Home, Library, Users, Bell, Headphones, Trophy, Store, ChevronLeft, Flame, Search,"
);
content = content.replace(
  "import { ActivityFeed } from './components/ActivityFeed';",
  "import { ActivityFeed } from './components/ActivityFeed';\nimport { GlobalSearch } from './components/GlobalSearch';"
);

// 2. state
content = content.replace(
  "const [isGuideOpen, setIsGuideOpen] = useState(false);",
  "const [isGuideOpen, setIsGuideOpen] = useState(false);\n  const [isSearchOpen, setIsSearchOpen] = useState(false);"
);

// 3. render component
content = content.replace(
  "<DMCAModal />",
  "<DMCAModal />\n      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={(v) => setCurrentView(v as any)} onPlayGame={handlePlayGame} />"
);

// 4. render button
const bellBtn = `<button onClick={() => setCurrentView('notifications')} className="relative hover:text-green-400 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none rounded-full p-1">`;
content = content.replace(
  bellBtn,
  `<button onClick={() => setIsSearchOpen(true)} className="hover:text-green-400 transition-colors focus:ring-2 focus:ring-green-500 focus:outline-none rounded-full p-1">
            <Search size={22} />
          </button>\n          ` + bellBtn
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
