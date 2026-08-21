const fs = require('fs');
let code = fs.readFileSync('src/components/AuthFlow.tsx', 'utf8');

// Remove manual_signup from view types
code = code.replace(
  "const [view, setView] = useState<'picker' | 'pin' | 'loading' | 'add_method' | 'manual_signin' | 'manual_signup'>('loading');",
  "const [view, setView] = useState<'picker' | 'pin' | 'loading' | 'add_method' | 'manual_signin'>('loading');"
);

// We can just leave handleManualSignUp defined but unused, or remove it. Let's remove it if we can, but it's fine to leave it.
// Let's modify the UI to only show Sign In.
const oldUI = `  if (view === 'manual_signin' || view === 'manual_signup') {
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
  }`;

const newUI = `  if (view === 'manual_signin') {
    return (
      <div className="min-h-screen bg-[#101010] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-green-600/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="z-10 bg-zinc-900 border border-zinc-700 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-[400px]">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Owner Sign In</h2>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <form onSubmit={handleManualSignIn} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 outline-none" required minLength={6} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition-colors mt-2">Sign In</button>
          </form>
          <button onClick={() => setView('add_method')} className="mt-4 text-zinc-400 hover:text-white transition-colors">Back</button>
        </div>
      </div>
    );
  }`;

code = code.replace(oldUI, newUI);
fs.writeFileSync('src/components/AuthFlow.tsx', code, 'utf8');
