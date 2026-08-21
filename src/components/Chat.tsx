import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send } from 'lucide-react';
import { UserProfile, ChatMessage } from '../types';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface ChatProps {
  key?: string;
  userProfile: UserProfile;
  friendId?: string;
  friendGamertag?: string;
  chatId?: string;
  isGroup?: boolean;
  chatName?: string;
  onBack: () => void;
}

export function Chat({ userProfile, friendId, friendGamertag, chatId: propChatId, isGroup, chatName, onBack }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate stable chat ID
  const computedChatId = isGroup && propChatId ? propChatId : [userProfile.uid, friendId].sort().join('_');
  const displayTitle = isGroup ? chatName : (friendGamertag === 'Friend' ? friendId?.substring(0,8) : friendGamertag);

  useEffect(() => {
    const q = query(collection(db, `chats/${computedChatId}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });
    return () => unsubscribe();
  }, [computedChatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.length > 1000) return;
    setSending(true);
    try {
      await addDoc(collection(db, `chats/${computedChatId}/messages`), {
        senderId: userProfile.uid,
        senderName: userProfile.gamertag,
        text: text.trim(),
        createdAt: serverTimestamp()
      });
      
      // Notify recipients
      import('firebase/firestore').then(async ({ getDoc, doc }) => {
        if (isGroup && propChatId) {
          const gcDoc = await getDoc(doc(db, 'groupChats', propChatId));
          if (gcDoc.exists()) {
            const members = gcDoc.data().members || [];
            members.forEach((mId: string) => {
              if (mId !== userProfile.uid) {
                addDoc(collection(db, 'notifications'), {
                  toUid: mId,
                  fromUid: userProfile.uid,
                  fromGamertag: userProfile.gamertag,
                  type: 'message',
                  isGroup: true,
                  chatId: computedChatId,
                  chatName: chatName || '',
                  read: false,
                  createdAt: serverTimestamp()
                }).catch(console.error);
              }
            });
          }
        } else if (friendId) {
          addDoc(collection(db, 'notifications'), {
            toUid: friendId,
            fromUid: userProfile.uid,
            fromGamertag: userProfile.gamertag,
            type: 'message',
            isGroup: false,
            chatId: computedChatId,
            read: false,
            createdAt: serverTimestamp()
          }).catch(console.error);
        }
      });
      
      setText('');
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col pt-8 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold">{isGroup ? 'Group Chat: ' : 'Chat with '}{displayTitle}</h2>
        </div>
        {isGroup && (
          <button 
            onClick={() => {
              const friendTag = prompt("Enter the gamertag of the friend to invite:");
              if (!friendTag) return;
              import('firebase/firestore').then(async ({ getDocs, query, collection, where, doc, updateDoc, arrayUnion }) => {
                const q = query(collection(db, 'users'), where('gamertagLower', '==', friendTag.toLowerCase()));
                const snap = await getDocs(q);
                if (snap.empty) {
                  alert("User not found.");
                  return;
                }
                const fUid = snap.docs[0].id;
                await updateDoc(doc(db, 'groupChats', computedChatId), {
                  members: arrayUnion(fUid)
                });
                alert(`Added ${friendTag} to the group chat!`);
              });
            }}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md font-bold text-sm transition-colors"
          >
            Invite Friend
          </button>
        )}
      </div>
      
      <div className="flex-1 bg-zinc-900/50 mt-4 rounded-xl border border-white/10 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scroll" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              <p>Say hello to start the chat!</p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.senderId === userProfile.uid;
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                    {isGroup && !isMe && <p className="text-[11px] text-green-400 font-bold mb-1 opacity-80">{m.senderName || 'User'}</p>}
                    <p className="break-words leading-relaxed text-[15px]">{m.text}</p>
                    <span className={`text-[10px] opacity-60 block mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 bg-zinc-900 border-t border-white/10 shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-green-500"
            />
            <button 
              disabled={sending || !text.trim()} 
              type="submit" 
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            >
              <Send size={20} className="ml-[-2px]" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
