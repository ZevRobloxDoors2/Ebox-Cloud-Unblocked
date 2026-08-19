import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Users, Mic, MicOff, PhoneOff } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, deleteDoc, collection, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
};

export const Party: React.FC<{ profile: any, onBack: () => void }> = ({ profile, onBack }) => {
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [micError, setMicError] = useState('');
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({});
  const partyId = 'global-party';

  useEffect(() => {
    if (!micPermissionGranted) return;

    let unsubs: (() => void)[] = [];
    const init = async () => {
      // 1. Log activity
      await addDoc(collection(db, 'activities'), {
        type: 'party',
        uid: profile.uid,
        gamertag: profile.gamertag,
        avatar: profile.avatar || '',
        details: 'Joined a party',
        createdAt: serverTimestamp()
      });

      // 2. Get local audio (already granted from the screen, just retrieving)
      try {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch(e) {
        console.error("No mic", e);
      }

      // 3. Join presence
      const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
      await setDoc(memberRef, {
        uid: profile.uid,
        gamertag: profile.gamertag,
        avatar: profile.avatar || '',
        isMuted: isMuted,
        joinedAt: serverTimestamp()
      });

      // 4. Listen to members
      const membersQuery = collection(db, 'parties', partyId, 'members');
      unsubs.push(onSnapshot(membersQuery, (snap) => {
        const members: any[] = [];
        snap.forEach(d => members.push({ id: d.id, ...d.data() }));
        setPartyMembers(members);
        
        // Connect to new members (we initiate if their uid > our uid, to prevent double offers)
        members.forEach(m => {
          if (m.id !== profile.uid && !peers.current[m.id] && m.id > profile.uid) {
             connectToPeer(m.id);
          }
        });
      }));

      // 5. Listen to signals sent to US
      const signalsRef = collection(db, 'parties', partyId, 'members', profile.uid, 'signals');
      unsubs.push(onSnapshot(signalsRef, (snap) => {
        snap.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data();
            handleSignal(change.doc.id, data);
          }
        });
      }));
    };

    init();

    const leaveParty = async () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peers.current).forEach((pc: any) => pc.close());
      peers.current = {};
      await deleteDoc(doc(db, 'parties', partyId, 'members', profile.uid));
    };

    window.addEventListener('beforeunload', leaveParty);

    return () => {
      leaveParty();
      unsubs.forEach(u => u());
      window.removeEventListener('beforeunload', leaveParty);
    };
  }, [profile.uid, micPermissionGranted]);

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // We got it, we can stop this temporary stream and let the effect pick it up
      stream.getTracks().forEach(t => t.stop());
      setMicPermissionGranted(true);
    } catch(e) {
      setMicError('Microphone access denied. Please allow microphone access to join the party.');
    }
  };

  if (!micPermissionGranted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col pt-8 pb-12 h-full justify-center items-center w-full">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <Mic className="text-blue-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Allow Microphone Access</h2>
        <p className="text-zinc-400 text-center mb-8 max-w-md">
          To chat with your friends in the party, you need to allow microphone access.
        </p>
        {micError && <p className="text-red-500 mb-6 font-semibold">{micError}</p>}
        <div className="flex gap-4">
          <button onClick={onBack} className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 font-bold transition-colors">
            Cancel
          </button>
          <button onClick={requestMic} className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 font-bold transition-colors shadow-lg shadow-blue-900/20">
            Allow Microphone
          </button>
        </div>
      </motion.div>
    );
  }

  const connectToPeer = async (peerId: string) => {
    const pc = new RTCPeerConnection(servers);
    peers.current[peerId] = pc;
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
    }

    pc.ontrack = (event) => setupAudioEl(peerId, event.streams[0]);

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
        const sigSnap = await getDoc(sigRef);
        const data = sigSnap.exists() ? sigSnap.data() : { candidates: [] };
        const cands = data.candidates || [];
        await setDoc(sigRef, { ...data, candidates: [...cands, event.candidate.toJSON()] }, { merge: true });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
    await setDoc(sigRef, { type: 'offer', offer: { type: offer.type, sdp: offer.sdp }, candidates: [] }, { merge: true });
  };

  const handleSignal = async (peerId: string, data: any) => {
    let pc = peers.current[peerId];
    if (!pc) {
      pc = new RTCPeerConnection(servers);
      peers.current[peerId] = pc;
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current!));
      }
      pc.ontrack = (event) => setupAudioEl(peerId, event.streams[0]);
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
          const sigSnap = await getDoc(sigRef);
          const sdata = sigSnap.exists() ? sigSnap.data() : { candidates: [] };
          const cands = sdata.candidates || [];
          await setDoc(sigRef, { ...sdata, candidates: [...cands, event.candidate.toJSON()] }, { merge: true });
        }
      };
    }

    if (data.type === 'offer' && data.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      const sigRef = doc(db, 'parties', partyId, 'members', peerId, 'signals', profile.uid);
      await setDoc(sigRef, { type: 'answer', answer: { type: answer.type, sdp: answer.sdp } }, { merge: true });
    }

    if (data.type === 'answer' && data.answer) {
      if (!pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    }

    if (data.candidates && pc.currentRemoteDescription) {
      for (const cand of data.candidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch(e){}
      }
    }
  };

  const setupAudioEl = (peerId: string, stream: MediaStream) => {
    let audio = document.getElementById(`audio-${peerId}`) as HTMLAudioElement;
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `audio-${peerId}`;
      audio.autoplay = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = stream;
  };

  const toggleMute = async () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    }
    const memberRef = doc(db, 'parties', partyId, 'members', profile.uid);
    await updateDoc(memberRef, { isMuted: !isMuted });
    setIsMuted(!isMuted);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-12 max-w-4xl mx-auto flex flex-col pt-8 pb-12 h-full overflow-y-auto w-full">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Party</h2>
              <span className="text-sm text-green-500">Voice chat active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-md transition-colors text-sm">
            Invite Friends
          </button>
          <select className="bg-zinc-800 border-none outline-none text-sm font-semibold px-3 py-2 rounded-md text-zinc-300">
            <option value="invite_only">Invite Only</option>
            <option value="public">Public</option>
          </select>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <button 
            onClick={toggleMute}
            className={`p-3 rounded-full flex items-center justify-center transition-colors focus:ring-2 focus:ring-white focus:outline-none ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
            onClick={onBack}
            className="p-3 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors focus:ring-2 focus:ring-white focus:outline-none"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-8">
        {partyMembers.map((member) => (
          <div key={member.id} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.gamertag} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-bold">
                    {member.gamertag?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!member.isMuted && (
                  <div className="absolute -inset-1 rounded-full border-2 border-green-500 animate-pulse pointer-events-none"></div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{member.gamertag}</span>
                <span className="text-sm text-zinc-400">{member.isMuted ? 'Muted' : 'Speaking...'}</span>
              </div>
            </div>
            <div className="text-zinc-500">
              {member.isMuted ? <MicOff size={20} /> : <Mic size={20} className="text-green-500" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
