const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update Dropbox selection options
content = content.replace(
  '<option value="about-blank">About:Blank (Might Work)</option>',
  '<option value="about-blank">About:Blank (Might Work)</option>\n                      <option value="blob">Blob: Protocol (Recommended)</option>\n                      <option value="filesystem">Filesystem: Protocol</option>'
);

// Add 'Just Once' button
const oldButtons = `<button 
                    onClick={() => handleDropbox('always')}
                    disabled={!dropboxSelection}
                    className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-500 disabled:bg-zinc-600 disabled:cursor-not-allowed font-bold transition-colors text-white"
                  >
                    Apply
                  </button>`;

const newButtons = `<button 
                    onClick={() => handleDropbox('once')}
                    disabled={!dropboxSelection}
                    className="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 disabled:cursor-not-allowed font-bold transition-colors text-white"
                  >
                    Just Once
                  </button>
                  <button 
                    onClick={() => handleDropbox('always')}
                    disabled={!dropboxSelection}
                    className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-500 disabled:bg-zinc-600 disabled:cursor-not-allowed font-bold transition-colors text-white"
                  >
                    Apply
                  </button>`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync('src/App.tsx', content);
