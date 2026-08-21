const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const badCode = `  useEffect(() => {
    const i = setInterval(() => {
      setSortAZ(localStorage.getItem('sort_az') === 'true');
      setMobileSizer(localStorage.getItem('mobile_sizer') === 'true');
    }, 500);
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

  return () => clearInterval(i);
  }, []);`;

const goodCode = `  useEffect(() => {
    const i = setInterval(() => {
      setSortAZ(localStorage.getItem('sort_az') === 'true');
      setMobileSizer(localStorage.getItem('mobile_sizer') === 'true');
    }, 500);
    return () => clearInterval(i);
  }, []);`;

code = code.replace(badCode, goodCode);

// Now I need to inject the keyframes properly.
// Best place is inside the main App component, or just in index.css

fs.writeFileSync('src/App.tsx', code, 'utf8');
