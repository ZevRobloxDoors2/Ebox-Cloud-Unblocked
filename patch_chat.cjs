const fs = require('fs');
let content = fs.readFileSync('src/components/Chat.tsx', 'utf8');

// Add icons and new state
content = content.replace(
  "import { ChevronLeft, Send } from 'lucide-react';",
  "import { ChevronLeft, Send, MoreVertical, Edit2, Trash2, X } from 'lucide-react';"
);
content = content.replace(
  "const [sending, setSending] = useState(false);",
  "const [sending, setSending] = useState(false);\n  const [editingMsg, setEditingMsg] = useState<string | null>(null);\n  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);"
);

// Update dependencies
content = content.replace(
  "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';",
  "import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';"
);

// Add handlers
content = content.replace(
  "const handleSend = async (e: React.FormEvent) => {",
  `const handleEdit = async (msgId: string, newText: string) => {
    if (!newText.trim() || newText.length > 1000) return;
    try {
      await updateDoc(doc(db, \`chats/\${computedChatId}/messages\`, msgId), {
        text: newText.trim(),
        editedAt: serverTimestamp()
      });
      setEditingMsg(null);
      setText('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteDoc(doc(db, \`chats/\${computedChatId}/messages\`, msgId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {`
);

// Handle form submission properly for edit mode
content = content.replace(
  "const handleSend = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!text.trim() || text.length > 1000) return;",
  `const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length > 1000) return;
    if (editingMsg) {
      handleEdit(editingMsg, text);
      return;
    }`
);

// Update message rendering
content = content.replace(
  "messages.map(m => {",
  `messages.map(m => {
              const isEditing = editingMsg === m.id;
              const showMenu = activeMenuId === m.id;`
);

const oldMsg = `<div key={m.id} className={\`flex \${isMe ? 'justify-end' : 'justify-start'}\`}>
                  <div className={\`max-w-[70%] px-4 py-3 rounded-2xl \${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}\`}>
                    {isGroup && !isMe && <p className="text-[11px] text-green-400 font-bold mb-1 opacity-80">{m.senderName || 'User'}</p>}
                    <p className="break-words leading-relaxed text-[15px]">{m.text}</p>
                    <span className={\`text-[10px] opacity-60 block mt-1 \${isMe ? 'text-right' : 'text-left'}\`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>`;

const newMsg = `<div key={m.id} className={\`flex \${isMe ? 'justify-end' : 'justify-start'} group relative\`}>
                  <div className={\`max-w-[70%] px-4 py-3 rounded-2xl \${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'} relative\`}>
                    {isGroup && !isMe && <p className="text-[11px] text-green-400 font-bold mb-1 opacity-80">{m.senderName || 'User'}</p>}
                    <p className="break-words leading-relaxed text-[15px]">
                      {m.text}
                      {(m as any).editedAt && <span className="text-[10px] opacity-60 ml-2 italic">(edited)</span>}
                    </p>
                    <span className={\`text-[10px] opacity-60 block mt-1 \${isMe ? 'text-right' : 'text-left'}\`}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    
                    {isMe && (
                      <div className={\`absolute top-1/2 -translate-y-1/2 \${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity\`}>
                        <button onClick={() => setActiveMenuId(showMenu ? null : m.id)} className="p-1 text-zinc-400 hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                        {showMenu && (
                          <div className="absolute right-full top-0 mr-2 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl py-1 z-10 w-24">
                            <button onClick={() => { setEditingMsg(m.id); setText(m.text); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-700 flex items-center gap-2">
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => { handleDelete(m.id); setActiveMenuId(null); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>`;

content = content.replace(oldMsg, newMsg);

// Update input placeholder for edit mode
content = content.replace(
  `placeholder="Type a message..."`,
  `placeholder={editingMsg ? "Edit message..." : "Type a message..."}`
);

// Add cancel edit button
content = content.replace(
  `<button 
              disabled={sending || !text.trim()} 
              type="submit" `,
  `{editingMsg && (
              <button type="button" onClick={() => { setEditingMsg(null); setText(''); }} className="bg-zinc-700 hover:bg-zinc-600 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors">
                <X size={20} />
              </button>
            )}
            <button 
              disabled={sending || !text.trim()} 
              type="submit" `
);

fs.writeFileSync('src/components/Chat.tsx', content);
