import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, collection, query, where, onSnapshot, updateDoc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const MatchRequestsModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptedMatches, setAcceptedMatches] = useState([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    // Fetch pending match requests
    const requestsQuery = query(
      collection(db, 'roomie-users', user.uid, 'match-requests'),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
      const requestsData = await Promise.all(snapshot.docs.map(async doc => {
        const request = doc.data();
        // Get sender's data if not already included
        let senderName = request.senderName;
        if (!senderName) {
          try {
            const senderDoc = await getDoc(doc(db, 'roomie-users', request.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data();
              senderName =
                senderData.name ||
                senderData.displayName ||
                senderData.email?.split('@')[0] ||
                'Anonymous';
            }
          } catch (error) {
            console.error('Error fetching sender data:', error);
          }
        }
        return {
          id: doc.id,
          ...request,
          senderName: senderName || 'Anonymous'
        };
      }));
      setRequests(requestsData);
      setLoading(false);
    });
    // Fetch accepted matches
    const acceptedQuery = query(
      collection(db, 'roomie-users', user.uid, 'matches')
    );
    const unsubscribeAccepted = onSnapshot(acceptedQuery, async (snapshot) => {
      const matchesData = await Promise.all(snapshot.docs.map(async docSnap => {
        const match = docSnap.data();
        let matchedUserName = '';
        try {
          const matchedUserDoc = await getDoc(doc(db, 'roomie-users', match.userId));
          if (matchedUserDoc.exists()) {
            matchedUserName = matchedUserDoc.data().name || match.userId;
          } else {
            matchedUserName = match.userId;
          }
        } catch {}
        return {
          id: docSnap.id,
          ...match,
          matchedUserName
        };
      }));
      setAcceptedMatches(matchesData);
    });
    return () => {
      unsubscribe();
      unsubscribeAccepted();
    };
  }, [isOpen, user]);

  const handleRequest = async (requestId, action) => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update the request in the user's subcollection
      const requestRef = doc(db, 'roomie-users', user.uid, 'match-requests', requestId);
      
      // Mark the corresponding notification as read
      const notifQuery = query(
        collection(db, 'roomie-users', user.uid, 'notifications'),
        where('type', '==', 'match-request'),
        where('senderId', '==', request.senderId)
      );
      const notifSnapshot = await getDocs(notifQuery);
      for (const notifDoc of notifSnapshot.docs) {
        await updateDoc(notifDoc.ref, { read: true });
      }

      // Get current stats for both users
      const receiverStatsRef = doc(db, 'dashboard-stats', user.uid);
      const senderStatsRef = doc(db, 'dashboard-stats', request.senderId);
      const receiverStatsSnap = await getDoc(receiverStatsRef);
      const senderStatsSnap = await getDoc(senderStatsRef);
      const receiverStats = receiverStatsSnap.exists() ? receiverStatsSnap.data() : { matchRequests: 0, activeMatches: 0, messageCount: 0 };
      const senderStats = senderStatsSnap.exists() ? senderStatsSnap.data() : { matchRequests: 0, activeMatches: 0, messageCount: 0 };

      if (action === 'accept') {
        await updateDoc(requestRef, {
          status: 'accepted',
          acceptedAt: new Date()
        });

        // Create a match document in both users' matches subcollection
        const matchData = {
          userId: request.senderId,
          matchedAt: new Date(),
          status: 'active'
        };
        await setDoc(doc(db, 'roomie-users', user.uid, 'matches', request.senderId), matchData);
        await setDoc(doc(db, 'roomie-users', request.senderId, 'matches', user.uid), { ...matchData, userId: user.uid });

        // Create notification for sender
        const notificationRef = doc(collection(db, 'roomie-users', request.senderId, 'notifications'));
        await setDoc(notificationRef, {
          type: 'match-accepted',
          senderId: user.uid,
          senderName: user.displayName || 'Anonymous',
          message: `${user.displayName || 'Someone'} accepted your match request`,
          read: false,
          createdAt: new Date()
        });

        // Update receiver's stats (increment activeMatches)
        await setDoc(receiverStatsRef, {
          ...receiverStats,
          activeMatches: (receiverStats.activeMatches || 0) + 1,
          matchRequests: Math.max(0, (receiverStats.matchRequests || 0) - 1)
        }, { merge: true });

        // Update sender's stats (increment activeMatches)
        await setDoc(senderStatsRef, {
          ...senderStats,
          activeMatches: (senderStats.activeMatches || 0) + 1,
          matchRequests: Math.max(0, (senderStats.matchRequests || 0) - 1)
        }, { merge: true });
      } else {
        await updateDoc(requestRef, {
          status: 'rejected',
          rejectedAt: new Date()
        });

        // Create notification for sender
        const notificationRef = doc(collection(db, 'roomie-users', request.senderId, 'notifications'));
        await setDoc(notificationRef, {
          type: 'match-rejected',
          senderId: user.uid,
          senderName: user.displayName || 'Anonymous',
          message: `${user.displayName || 'Someone'} rejected your match request`,
          read: false,
          createdAt: new Date()
        });

        await setDoc(receiverStatsRef, {
          ...receiverStats,
          matchRequests: Math.max(0, (receiverStats.matchRequests || 0) - 1)
        });
      }
    } catch (error) {
      console.error('Error handling match request:', error);
      alert('Failed to process request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-pink-700/30 rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-pink-400">Match Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-pink-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {loading ? (
          <div className="text-center py-4 text-gray-300">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No pending requests</div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-800 rounded-xl p-4 bg-gray-800/70">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-200">{request.senderName}</h3>
                    <p className="text-sm text-gray-400">
                      Sent {request.createdAt?.seconds ? new Date(request.createdAt.seconds * 1000).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRequest(request.id, 'accept')}
                      className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md text-sm font-semibold shadow hover:from-pink-600 hover:to-purple-700 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, 'reject')}
                      className="px-3 py-1 border border-gray-600 text-gray-300 rounded-md text-sm hover:bg-gray-900 hover:text-pink-400 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Accepted Matches Section */}
        {acceptedMatches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-green-400 mb-4">Accepted Matches</h3>
            <div className="space-y-4">
              {acceptedMatches.map(match => (
                <div key={match.id} className="border border-green-700/30 rounded-xl p-4 bg-gray-800/70 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-200">{match.matchedUserName}</h4>
                    <p className="text-sm text-gray-400">Matched {match.matchedAt ? new Date(match.matchedAt.seconds ? match.matchedAt.seconds * 1000 : match.matchedAt).toLocaleDateString() : ''}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-pink-400 font-bold text-lg">
                      {typeof match.compatibility === 'number' ? `${match.compatibility}%` : '—'}
                    </span>
                    <span className="text-xs text-gray-400">Compatibility</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchRequestsModal; 