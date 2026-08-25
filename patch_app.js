const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = \`<button onClick={handleStopGame} className="bg-red-600 px-4 py-1.5 rounded-md font-bold hover:bg-red-500 transition-colors flex items-center gap-2"> 
                      Stop Game
                    </button>\`;

const replacement = \`<button onClick={() => window.open(getUrl(playingGame.file, 0), '_blank')} className="bg-zinc-700 px-4 py-1.5 text-sm rounded-md font-bold hover:bg-zinc-600 transition-colors flex items-center gap-2">
                      Open in New Tab
                    </button>
                    <button onClick={handleStopGame} className="bg-red-600 px-4 py-1.5 text-sm rounded-md font-bold hover:bg-red-500 transition-colors flex items-center gap-2"> 
                      Stop Game
                    </button>\`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
