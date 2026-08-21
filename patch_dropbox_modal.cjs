const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const promptCode = `
  const [showDropboxPrompt, setShowDropboxPrompt] = useState(
    !localStorage.getItem('dropbox_prompt') && window.location !== window.parent.location === false
  );
  const [dropboxToast, setDropboxToast] = useState(false);

  const handleDropbox = (choice: string) => {
    if (choice === 'never') {
      localStorage.setItem('dropbox_prompt', 'never');
      setShowDropboxPrompt(false);
      setDropboxToast(true);
      setTimeout(() => setDropboxToast(false), 3000);
    } else if (choice === 'always') {
      localStorage.setItem('dropbox_prompt', 'always');
      setShowDropboxPrompt(false);
      // Automatically apply cloak or redirect if needed?
      applyDropboxCloak();
    } else {
      setShowDropboxPrompt(false);
    }
  };

  const applyDropboxCloak = () => {
    // Just simple about:blank cloak for now since the options are listed in text
    let win = window.open();
    if (win) {
      win.document.body.style.margin = '0';
      win.document.body.style.height = '100vh';
      let iframe = win.document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.margin = '0';
      iframe.src = window.location.href;
      win.document.body.appendChild(iframe);
      window.location.replace("https://google.com");
    }
  };
`;

const stateMatch = "const [warningGame, setWarningGame] = useState<{id: string, title: string, file: string} | null>(null);";
code = code.replace(stateMatch, stateMatch + promptCode);

const uiCode = `
      {/* Dropbox Prompt Modal */}
      {showDropboxPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl max-w-2xl text-center flex flex-col gap-6 transform transition-all">
            <h2 className="text-3xl font-bold text-white mb-2">Do you want to go in DROPBOX?</h2>
            <div className="text-left text-zinc-300 font-semibold space-y-2 bg-zinc-800/50 p-4 rounded-lg">
              <p className="text-white mb-2">-&gt; Options available:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>About:Blank? (Might Work)</li>
                <li>Blob? (Recommended)</li>
                <li>Filesystem? (Unrecommended some games might not work, but it is hidden to the teacher.)</li>
                <li>HTML File (Very Recommended, COMING SOON!!!)</li>
              </ul>
            </div>
            <p className="text-zinc-400 font-bold">This is used to bypass School Teachers Watching Your Screen.</p>
            <div className="flex gap-4 justify-center mt-2 opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards]">
              <button onClick={() => handleDropbox('always')} className="px-6 py-3 bg-green-600 hover:bg-green-500 font-bold rounded text-white transition-colors flex-1">Always</button>
              <button onClick={() => handleDropbox('ask_later')} className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 font-bold rounded text-white transition-colors flex-1">Ask Later</button>
              <button onClick={() => handleDropbox('never')} className="px-6 py-3 bg-red-600/80 hover:bg-red-500 font-bold rounded text-white transition-colors flex-1">Never</button>
            </div>
          </div>
        </div>
      )}

      {/* Dropbox Toast */}
      <AnimatePresence>
        {dropboxToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold shadow-xl z-[2000]"
          >
            To enable, go to settings
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace("{/* Play Time Modal */}", uiCode + "\n      {/* Play Time Modal */}");

// Add fade in keyframes
if (!code.includes("keyframes fadeIn")) {
  code = code.replace("return (", `
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = \`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    \`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  return (`);
}

fs.writeFileSync('src/App.tsx', code, 'utf8');
