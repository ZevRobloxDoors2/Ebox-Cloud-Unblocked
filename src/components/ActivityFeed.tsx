import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Users, Gamepad2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto w-full pt-8 pb-12">
      <h2 className="text-2xl font-bold mb-4">Activity</h2>
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {activities.length === 0 && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 text-center py-12">
               No recent activity.
             </motion.div>
          )}
          {activities.map(a => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 p-4 rounded-xl flex items-center gap-4"
            >
              <img src={a.avatar || `https://picsum.photos/seed/${a.gamertag}/50/50`} className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{a.gamertag}</p>
                <p className="text-zinc-400 text-sm">{a.details}</p>
              </div>
              <div>
                {a.type === 'trophy' && <Trophy className="text-yellow-500" size={24} />}
                {a.type === 'party' && <Users className="text-blue-500" size={24} />}
                {a.type === 'game' && <Gamepad2 className="text-green-500" size={24} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
