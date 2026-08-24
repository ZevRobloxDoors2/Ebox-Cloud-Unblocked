const fs = require('fs');
let content = fs.readFileSync('src/components/Chat.tsx', 'utf8');

// State for image
content = content.replace(
  "const [text, setText] = useState('');",
  "const [text, setText] = useState('');\n  const [imageFile, setImageFile] = useState<File | null>(null);\n  const [imagePreview, setImagePreview] = useState<string | null>(null);"
);

// handleImageSelect
const handleImageSelectStr = `  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round(height * maxDim / width);
              width = maxDim;
            } else {
              width = Math.round(width * maxDim / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (e: React.FormEvent) => {`;

content = content.replace("const handleSend = async (e: React.FormEvent) => {", handleImageSelectStr);

// Change handleSend logic
const oldSend = `  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length > 1000) return;
    if (editingMsg) {
      handleEdit(editingMsg, text);
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, \`chats/\${computedChatId}/messages\`), {
        senderId: userProfile.uid,
        senderName: userProfile.gamertag,
        text: text.trim(),
        createdAt: serverTimestamp()
      });`;

const newSend = `  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || text.length > 1000) return;
    if (editingMsg) {
      handleEdit(editingMsg, text);
      return;
    }
    setSending(true);
    try {
      let b64Image = null;
      if (imageFile) {
        b64Image = await processImage(imageFile);
      }
      const msgData: any = {
        senderId: userProfile.uid,
        senderName: userProfile.gamertag,
        text: text.trim(),
        createdAt: serverTimestamp()
      };
      if (b64Image) msgData.imageUrl = b64Image;
      
      await addDoc(collection(db, \`chats/\${computedChatId}/messages\`), msgData);`;

content = content.replace(oldSend, newSend);

// Reset image after send
content = content.replace(
  "setText('');\n    } catch(e: any) {",
  "setText('');\n      setImageFile(null);\n      setImagePreview(null);\n    } catch(e: any) {"
);

// Form UI changes
const oldForm = `<form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={editingMsg ? "Edit message..." : "Type a message..."}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-green-500"
            />
            {editingMsg && (
              <button type="button" onClick={() => { setEditingMsg(null); setText(''); }} className="bg-zinc-700 hover:bg-zinc-600 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                <X size={20} />
              </button>
            )}
            <button 
              disabled={sending || !text.trim()} 
              type="submit" 
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            >
              <Send size={20} className="ml-[-2px]" />
            </button>
          </form>`;

const newForm = `<div className="flex flex-col gap-2 w-full">
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-700">
                <img src={imagePreview} className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-black">
                  <X size={14} />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <label className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={!!editingMsg} />
              </label>
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={editingMsg ? "Edit message..." : "Type a message..."}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-green-500 min-w-0"
              />
              {editingMsg && (
                <button type="button" onClick={() => { setEditingMsg(null); setText(''); }} className="bg-zinc-700 hover:bg-zinc-600 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0">
                  <X size={20} />
                </button>
              )}
              <button 
                disabled={sending || (!text.trim() && !imageFile)} 
                type="submit" 
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={20} className="ml-[-2px]" />
              </button>
            </form>
          </div>`;

content = content.replace(oldForm, newForm);

// Message rendering for image
const oldMsg = `<p className="break-words leading-relaxed text-[15px]">
                      {m.text}
                      {(m as any).editedAt && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                    </p>`;
                    
const newMsg = `{(m as any).imageUrl && (
                      <div className="mb-2">
                        <a href={(m as any).imageUrl} target="_blank" rel="noopener noreferrer">
                          <img src={(m as any).imageUrl} className="max-w-full max-h-64 rounded-md object-contain cursor-zoom-in" />
                        </a>
                      </div>
                    )}
                    {m.text && (
                      <p className="break-words leading-relaxed text-[15px]">
                        {m.text}
                        {(m as any).editedAt && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                      </p>
                    )}`;

content = content.replace(oldMsg, newMsg);

fs.writeFileSync('src/components/Chat.tsx', content);
