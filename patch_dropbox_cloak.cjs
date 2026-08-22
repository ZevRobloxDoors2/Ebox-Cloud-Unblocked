const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldFunc = `  const applyDropboxCloak = () => {
    const code = \`
      <!DOCTYPE html>
      <html>
      <head>
        <style>body,html{margin:0;padding:0;height:100%;overflow:hidden;}</style>
        <title>\${localStorage.getItem('cloak_title') || 'Google'}</title>
        <link rel="icon" href="\${localStorage.getItem('cloak_icon') || 'https://www.google.com/favicon.ico'}">
      </head>
      <body>
        <iframe src="\${window.location.href}" style="border:none;width:100%;height:100%;margin:0;padding:0;"></iframe>
      </body>
      </html>
    \`;
    let win = window.open('about:blank', '_blank');
    if (win) {
      win.document.write(code);
      win.document.close();
      window.location.replace('https://classroom.google.com');
    } else {
      alert('Popup blocker prevented the cloak! Please allow popups.');
    }
  };`;

const newFunc = `  const applyDropboxCloak = () => {
    const code = \`
      <!DOCTYPE html>
      <html>
      <head>
        <style>body,html{margin:0;padding:0;height:100%;overflow:hidden;}</style>
        <title>\${localStorage.getItem('cloak_title') || 'Google'}</title>
        <link rel="icon" href="\${localStorage.getItem('cloak_icon') || 'https://www.google.com/favicon.ico'}">
      </head>
      <body>
        <iframe src="\${window.location.href}" style="border:none;width:100%;height:100%;margin:0;padding:0;"></iframe>
      </body>
      </html>
    \`;
    
    let win: any;
    if (dropboxSelection === 'blob') {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      win = window.open(url, '_blank');
      if (win) window.location.replace('https://classroom.google.com');
    } else if (dropboxSelection === 'filesystem') {
      const requestFileSystem = (window as any).requestFileSystem || (window as any).webkitRequestFileSystem;
      if (requestFileSystem) {
        requestFileSystem(0, 1024*1024, (fs: any) => {
          fs.root.getFile('index.html', {create: true}, (fileEntry: any) => {
            fileEntry.createWriter((fileWriter: any) => {
              const blob = new Blob([code], {type: 'text/html'});
              fileWriter.onwriteend = () => {
                win = window.open(fileEntry.toURL(), '_blank');
                if (win) window.location.replace('https://classroom.google.com');
                else alert('Popup blocker prevented the cloak! Please allow popups.');
              };
              fileWriter.write(blob);
            });
          });
        });
        return; 
      } else {
        alert("Filesystem protocol not supported in this browser. Falling back to about:blank.");
        win = window.open('about:blank', '_blank');
        if (win) { win.document.write(code); win.document.close(); window.location.replace('https://classroom.google.com'); }
      }
    } else {
      win = window.open('about:blank', '_blank');
      if (win) {
        win.document.write(code);
        win.document.close();
        window.location.replace('https://classroom.google.com');
      }
    }
    
    if (!win && dropboxSelection !== 'filesystem') {
      alert('Popup blocker prevented the cloak! Please allow popups.');
    }
  };`;

content = content.replace(oldFunc, newFunc);

// Also need to fix handleDropbox('once') because I replaced it earlier but the logic checked for 'just_once'
content = content.replace("onClick={() => handleDropbox('once')}", "onClick={() => handleDropbox('just_once')}");

// Fix the button that replaced the Always button
content = content.replace(
  `<button 
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
                  </button>`,
  `<button 
                    onClick={() => handleDropbox('just_once')}
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
                    Always
                  </button>`
);

fs.writeFileSync('src/App.tsx', content);
