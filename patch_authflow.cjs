const fs = require('fs');
let code = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

// Update state type
code = code.replace(
  "const [view, setView] = useState<'picker' | 'pin' | 'loading'>('loading');",
  "const [view, setView] = useState<'picker' | 'pin' | 'loading' | 'add_method' | 'manual_signin' | 'manual_signup'>('loading');"
);

// Add imports for manual auth
if (!code.includes('signInWithEmailAndPassword')) {
  code = code.replace(
    "import { auth, db } from '../firebase';",
    "import { auth, db } from '../firebase';\nimport { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';"
  );
}

// Replace handleAddNew
code = code.replace(
  /const handleAddNew = async \(\) => {[\s\S]*?};/,
  `const handleAddNew = () => {
    setView('add_method');
  };
  
  const handleGoogleSignIn = async () => {
    setView('loading');
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('picker');
    }
  };
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('manual_signin');
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await checkAndCreateProfile(result.user);
      onConfirm();
    } catch (e: any) {
      console.error(e);
      setError(e.message);
      setView('manual_signup');
    }
  };`
);

// Add the UI logic before the 'pin' view block
const pinIndex = code.indexOf("if (view === 'pin' && selectedAccount) {");
const addMethodUI = `
  if (view === 'add_method') {
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign In Method</h2>
          <button onClick={handleGoogleSignIn} className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-zinc-200 transition-colors">Use Google API</button>
          <button onClick={() => setView('manual_signin')} className="w-full py-3 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors">Use Manual Sign In</button>
          <button onClick={() => setView('picker')} className="mt-4 text-zinc-400 hover:text-white transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  if (view === 'manual_signin' || view === 'manual_signup') {
    const isSignIn = view === 'manual_signin';
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">{isSignIn ? 'Manual Sign In' : 'Manual Sign Up'}</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={isSignIn ? handleManualSignIn : handleManualSignUp} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required minLength={6} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors mt-2">{isSignIn ? 'Sign In' : 'Sign Up'}</button>
          </form>
          <button onClick={() => setView(isSignIn ? 'manual_signup' : 'manual_signin')} className="mt-2 text-sm text-green-400 hover:text-green-300 transition-colors">
            {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
          <button onClick={() => setView('add_method')} className="mt-4 text-zinc-400 hover:text-white transition-colors">Back</button>
        </div>
      </div>
    );
  }

`;

code = code.slice(0, pinIndex) + addMethodUI + code.slice(pinIndex);

fs.writeFileSync('src/components/AuthFlow.tsx', code, 'utf8');
