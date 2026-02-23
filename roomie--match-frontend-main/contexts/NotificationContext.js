import { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, getDocs, writeBatch, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const notificationsRef = collection(db, 'roomie-users', user.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Fetch sender names if missing
      const notifs = await Promise.all(snapshot.docs.map(async docSnap => {
        const notif = { id: docSnap.id, ...docSnap.data() };
        if (!notif.senderName && notif.senderId) {
          try {
            const senderDoc = await getDoc(doc(db, 'roomie-users', notif.senderId));
            notif.senderName = senderDoc.exists()
              ? (senderDoc.data().name || senderDoc.data().displayName || senderDoc.data().email?.split('@')[0] || 'Anonymous')
              : 'Anonymous';
          } catch {
            notif.senderName = 'Anonymous';
          }
        }
        return notif;
      }));
      // Remove duplicates by ID
      const uniqueNotifs = Array.from(new Map(notifs.map(n => [n.id, n])).values());
      setNotifications(uniqueNotifs);
      setUnreadNotificationCount(uniqueNotifs.length);
    });
    return () => unsubscribe();
  }, [user]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    const notificationsRef = collection(db, 'roomie-users', user.uid, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach(doc => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadNotificationCount,
      markAllNotificationsAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext); 