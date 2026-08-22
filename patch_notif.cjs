const fs = require('fs');
let content = fs.readFileSync('src/components/GlobalNotifications.tsx', 'utf8');

// request permission on mount
content = content.replace(
  "export function GlobalNotifications({ profile, playingGame, onNavigateToChat, onNavigateToParty }: GlobalNotificationsProps) {",
  "export function GlobalNotifications({ profile, playingGame, onNavigateToChat, onNavigateToParty }: GlobalNotificationsProps) {\n  useEffect(() => { if (Notification.permission === 'default') { Notification.requestPermission(); } }, []);"
);

// add to system notification
content = content.replace(
  "setActiveToasts(prev => [...prev, { id: notifId, ...data }]);",
  `setActiveToasts(prev => [...prev, { id: notifId, ...data }]);
          
          if (Notification.permission === 'granted') {
            const title = data.type === 'message' ? (data.isGroup ? \`New message in \${data.chatName}\` : \`New message from \${data.fromGamertag}\`) : \`Party Invite from \${data.fromGamertag}\`;
            const body = data.type === 'message' ? 'Click to open chat' : 'Click to join party';
            new Notification(title, { body });
          }`
);

fs.writeFileSync('src/components/GlobalNotifications.tsx', content);
