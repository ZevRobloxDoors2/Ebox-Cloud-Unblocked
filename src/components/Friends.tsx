import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, UserPlus, User, MessageSquare } from 'lucide-react';
import { UserProfile, FriendRequest } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, or, serverTimestamp } from 'firebase/firestore';

interface FriendsProps {
  key?: string;
  userProfile: UserProfile;
  onBack: () => void;
  onChat: (friendId: string, friendGamertag: string) => void;
}

export function Friends({ userProfile, onBack, onChat }: FriendsProps) {
  const [searchTag, setSearchTag] = useState('');
  const [searching, setSearching] = useState(false);
  
  const [friends, setFriends] = useState<{uid: string, gamertag: string}[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'friendRequests'),
      or(
        where('fromUid', '==', auth.currentUser.uid),
        where('toUid', '==', auth.currentUser.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest));
      
      // Compute friends
      const accepted = data.filter(r => r.status === 'accepted');
      const friendList = accepted.map(r => {
        if (r.fromUid === auth.currentUser!.uid) return { uid: r.toUid, gamertag: 'Friend' }; // We'd ideally fetch their gamertag, but for simplicity
        return { uid: r.fromUid, gamertag: r.fromGamertag };
      });
      // To properly get gamertags, we should really just store them in the request or fetch them.
      // We have fromGamertag, but not toGamertag. Let's just fetch the user profile if needed, or just show ID.
      setFriends(friendList);
    }, (err) => console.error(err));

    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTag.trim()) return;
    setSearching(true);
    try {
      const q = query(collection(db, 'users'), where('gamertagLower', '==', searchTag.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        alert("Player not found.");
      } else {
        const foundUser = snap.docs[0].data() as UserProfile;
        if (foundUser.uid === userProfile.uid) {
          alert("That's you!");
          return;
        }
        
        // Send request
        await addDoc(collection(db, 'friendRequests'), {
          fromUid: userProfile.uid,
          fromGamertag: userProfile.gamertag,
          toUid: foundUser.uid,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        alert(`Friend request sent to ${foundUser.gamertag}!`);
        setSearchTag('');
      }
    } catch(e: any) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-5xl mx-auto flex flex-col gap-8 pt-8 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold">Social & Friends</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {/* Add Friend */}
          <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-green-400" /> Add a Friend
            </h3>
            <form onSubmit={handleSearch} className="flex flex-col gap-3">
              <input 
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="Enter Gamertag to search..."
                className="bg-zinc-900 border border-zinc-700 px-4 py-3 rounded-md text-white focus:outline-none focus:border-green-500 font-medium"
              />
              <button disabled={searching} type="submit" className="bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold py-3 rounded-md transition-colors text-sm uppercase tracking-wide flex justify-center">
                {searching ? 'Searching...' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Friend List */}
        <div className="bg-zinc-800/80 p-6 rounded-lg border border-transparent hover:border-white/10 transition-colors">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User size={20} className="text-blue-400" /> My Friends
          </h3>
          {friends.length === 0 ? (
            <p className="text-zinc-400 text-sm">You haven't added any friends yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {friends.map(f => (
                <div key={f.uid} className="bg-zinc-900 p-4 rounded-md flex items-center justify-between group">
                  <span className="font-semibold">{f.gamertag === 'Friend' ? f.uid.substring(0,8) + '...' : f.gamertag}</span>
                  <button 
                    onClick={() => onChat(f.uid, f.gamertag)} 
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Chat"
                  >
                    <MessageSquare size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
