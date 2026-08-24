const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldClasses = 'className="w-[160px] h-[160px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 flex-shrink-0 group cursor-pointer flex-col transition-colors relative"';
const newClasses = 'className="w-[160px] h-[160px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none flex-shrink-0 group cursor-pointer flex-col relative transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';

content = content.replace(oldClasses, newClasses);

const oldLib = 'className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"';
const newLib = 'className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';

// There are multiple instances of oldLib equivalent (settings, friends, activity).
content = content.replace(
  'onClick={() => setCurrentView(\'library\')} className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"',
  'onClick={() => setCurrentView(\'library\')} ' + newLib
);

content = content.replace(
  'onClick={() => setCurrentView(\'settings\')} className="w-[160px] h-[160px] bg-zinc-800/90 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"',
  'onClick={() => setCurrentView(\'settings\')} ' + newLib
);

const friendsOld = 'onClick={() => setCurrentView(\'friends\')} className="w-[160px] h-[160px] bg-purple-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"';
const friendsNew = 'onClick={() => setCurrentView(\'friends\')} className="w-[160px] h-[160px] bg-purple-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';
content = content.replace(friendsOld, friendsNew);

const activityOld = 'onClick={() => setCurrentView(\'activity\')} className="w-[160px] h-[160px] bg-blue-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"';
const activityNew = 'onClick={() => setCurrentView(\'activity\')} className="w-[160px] h-[160px] bg-blue-600 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';
content = content.replace(activityOld, activityNew);

const storeOld = 'tabIndex={0} className="w-[160px] h-[160px] bg-zinc-200 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-white focus:border-green-500 group cursor-pointer flex-shrink-0 transition-colors"';
const storeNew = 'tabIndex={0} className="w-[160px] h-[160px] bg-zinc-200 rounded-lg flex flex-col justify-center items-center border-[3px] border-transparent hover:border-white focus:border-green-500 focus:outline-none group cursor-pointer flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';
content = content.replace(storeOld, storeNew);

// What about Quick Resume tiles?
const qrOld = 'className="w-[200px] h-[120px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 flex-shrink-0 group cursor-pointer flex-col transition-colors relative bg-zinc-800 shadow-lg"';
const qrNew = 'className="w-[200px] h-[120px] rounded-lg overflow-hidden border-[3px] border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none flex-shrink-0 group cursor-pointer flex-col relative bg-zinc-800 transition-all duration-300 ease-out hover:scale-110 focus:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] hover:z-10 focus:z-10"';
content = content.replace(qrOld, qrNew);

fs.writeFileSync('src/App.tsx', content);
