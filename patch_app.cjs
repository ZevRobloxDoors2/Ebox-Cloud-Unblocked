const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace(
  "import { StartupAnimation } from './components/StartupAnimation';",
  "import { StartupAnimation } from './components/StartupAnimation';\nimport { BetaWarningModal } from './components/BetaWarningModal';"
);

// Add to JSX
content = content.replace(
  "<DMCAModal />",
  "<DMCAModal />\n      <BetaWarningModal />"
);

fs.writeFileSync('src/App.tsx', content);
