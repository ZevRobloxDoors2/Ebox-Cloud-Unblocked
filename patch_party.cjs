const fs = require('fs');
let content = fs.readFileSync('src/components/Party.tsx', 'utf8');
content = content.replace(
  "export const Party: React.FC<{ profile: any, onBack: () => void }> = ({ profile, onBack }) => {",
  "export const Party: React.FC<{ profile: any, onBack: () => void, initialPartyId?: string }> = ({ profile, onBack, initialPartyId }) => {"
);
content = content.replace(
  "const partyId = 'global-party';",
  "const partyId = initialPartyId || profile.uid;"
);
fs.writeFileSync('src/components/Party.tsx', content);
