const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add state
const stateMatch = "const [pendingGameToPlay, setPendingGameToPlay] = useState<{id: string, title: string, file: string} | null>(null);";
const warningState = "\n  const [warningGame, setWarningGame] = useState<{id: string, title: string, file: string} | null>(null);";
code = code.replace(stateMatch, stateMatch + warningState);

// Intercept in handlePlayGame
const playFunc = `const handlePlayGame = async (game: {id: string, title: string, file: string}) => {`;
const newPlayFunc = `const handlePlayGame = async (game: {id: string, title: string, file: string}) => {
    if (game.id === 'Roblox' || game.id === 'TikTok') {
      setWarningGame(game);
      return;
    }
`;
code = code.replace(playFunc, newPlayFunc);

// Add modal UI to the main return block
// Looking for pendingGameToPlay modal to insert after it
const pendingModal = `          </div>
        </div>
      )}

      {/* Play Time Modal */}`;
      
const warningModal = `      {warningGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl max-w-lg text-center flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-white mb-2">Warning</h2>
            <p className="text-zinc-300 font-semibold">
              DO NOT CLICK NOTHING ON THE SCREEN IF IT SAIDS "404 page not found", Just click continue and click Stop game, if it shows 404 page not found, if it doesn't just continue and play the game..
            </p>
            <p className="text-red-500 font-bold mt-2 animate-pulse">This error is getting fixed as soon as possible.</p>
            <div className="flex gap-4 justify-center mt-4">
              <button onClick={() => setWarningGame(null)} className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 font-bold rounded text-white transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  const g = warningGame;
                  setWarningGame(null);
                  if (profile?.quickResumeEnabled && suspendedGames.length >= 6 && !suspendedGames.find(s => s.game.id === g.id)) {
                    setPendingGameToPlay(g);
                  } else {
                    actuallyPlayGame(g);
                  }
                }} 
                className="px-6 py-2 bg-green-600 hover:bg-green-500 font-bold rounded text-white transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace("{/* Play Time Modal */}", warningModal + "\n      {/* Play Time Modal */}");

fs.writeFileSync('src/App.tsx', code, 'utf8');
