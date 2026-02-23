import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const auth = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user's chats
  useEffect(() => {
    if (!auth?.user) {
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'roomie-users', auth.user.uid, 'chats');
    const q = query(chatsRef, orderBy('lastMessageTime', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            // Get other participant's details
            const otherUserId = chatData.participants.find(id => id !== auth.user.uid);
            const otherUserRef = firestoreDoc(db, 'roomie-users', otherUserId);
            const otherUserDoc = await getDoc(otherUserRef);
            const otherUserData = otherUserDoc.data();

            return {
              id: doc.id,
              ...chatData,
              otherUser: {
                id: otherUserId,
                name: otherUserData?.name || 'Unknown User',
                photoURL: otherUserData?.photoURL || null
              }
            };
          })
        );

        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth?.user]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!auth?.user || !activeChat) return;

    const messagesRef = collection(
      db, 
      'roomie-users', 
      auth.user.uid, 
      'chats', 
      activeChat.id, 
      'messages'
    );
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [auth?.user, activeChat]);

  // Listen for unread messages for the current user
  useEffect(() => {
    if (!auth?.user) return;
    let unsubscribes = [];
    let isMounted = true;
    const chatsRef = collection(db, 'roomie-users', auth.user.uid, 'chats');
    const q = query(chatsRef);
    const unsubscribeChats = onSnapshot(q, async (snapshot) => {
      let totalUnread = 0;
      let chatDocs = snapshot.docs;
      let processed = 0;
      if (chatDocs.length === 0) {
        if (isMounted) setUnreadCount(0);
        return;
      }
      chatDocs.forEach(chatDoc => {
        const messagesRef = collection(db, 'roomie-users', auth.user.uid, 'chats', chatDoc.id, 'messages');
        const unreadQuery = query(messagesRef, where('receiverId', '==', auth.user.uid), where('read', '==', false));
        const unsub = onSnapshot(unreadQuery, (unreadSnap) => {
          totalUnread += unreadSnap.size;
          processed++;
          if (processed === chatDocs.length && isMounted) {
            setUnreadCount(totalUnread);
          }
        });
        unsubscribes.push(unsub);
      });
    });
    return () => {
      unsubscribes.forEach(unsub => unsub());
      unsubscribeChats();
      isMounted = false;
    };
  }, [auth?.user]);

  // Mark all messages as read for the current user
  const markAllMessagesAsRead = async () => {
    if (!auth?.user) return;
    const chatsRef = collection(db, 'roomie-users', auth.user.uid, 'chats');
    const chatsSnapshot = await getDocs(chatsRef);
    for (const chatDoc of chatsSnapshot.docs) {
      const messagesRef = collection(db, 'roomie-users', auth.user.uid, 'chats', chatDoc.id, 'messages');
      const unreadQuery = query(messagesRef, where('receiverId', '==', auth.user.uid), where('read', '==', false));
      const unreadSnapshot = await getDocs(unreadQuery);
      if (!unreadSnapshot.empty) {
        const batch = writeBatch(db);
        unreadSnapshot.forEach(msgDoc => {
          batch.update(msgDoc.ref, { read: true });
        });
        await batch.commit();
      }
    }
  };

  // Start a new chat
  const startChat = async (otherUserId) => {
    if (!auth?.user) return;

    try {
      // Check if chat already exists
      const existingChat = chats.find(
        chat => chat.participants.includes(otherUserId)
      );

      if (existingChat) {
        setActiveChat(existingChat);
        return existingChat;
      }

      // Create new chat
      const chatRef = collection(db, 'roomie-users', auth.user.uid, 'chats');
      const newChat = {
        participants: [auth.user.uid, otherUserId],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0
      };

      const chatDoc = await addDoc(chatRef, newChat);
      
      // Create the same chat for the other user
      const otherUserChatRef = collection(db, 'roomie-users', otherUserId, 'chats');
      await addDoc(otherUserChatRef, {
        ...newChat,
        participants: [otherUserId, auth.user.uid]
      });

      return { id: chatDoc.id, ...newChat };
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  };

  // Send a message
  const sendMessage = async (text) => {
    if (!auth?.user || !activeChat) return;

    try {
      const otherUserId = activeChat.participants.find(id => id !== auth.user.uid);
      const messageForSender = {
        text,
        senderId: auth.user.uid,
        receiverId: otherUserId,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text'
      };
      const messageForReceiver = {
        text,
        senderId: auth.user.uid,
        receiverId: otherUserId,
        timestamp: serverTimestamp(),
        read: false,
        type: 'text'
      };
      // Add message to current user's chat
      const currentUserMessagesRef = collection(
        db,
        'roomie-users',
        auth.user.uid,
        'chats',
        activeChat.id,
        'messages'
      );
      await addDoc(currentUserMessagesRef, messageForSender);
      // Add message to other user's chat
      const otherUserMessagesRef = collection(
        db,
        'roomie-users',
        otherUserId,
        'chats',
        activeChat.id,
        'messages'
      );
      await addDoc(otherUserMessagesRef, messageForReceiver);
      // Update chat metadata for both users
      const updateChatMetadata = async (userId) => {
        const chatRef = firestoreDoc(db, 'roomie-users', userId, 'chats', activeChat.id);
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            participants: [userId, userId === auth.user.uid ? otherUserId : auth.user.uid],
            lastMessage: text,
            lastMessageTime: serverTimestamp(),
            unreadCount: userId === auth.user.uid ? 0 : 1
          });
        } else {
          await updateDoc(chatRef, {
            lastMessage: text,
            lastMessageTime: serverTimestamp(),
            unreadCount: userId === auth.user.uid ? 0 : 1
          });
        }
      };
      await Promise.all([
        updateChatMetadata(auth.user.uid),
        updateChatMetadata(otherUserId)
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!auth?.user || !activeChat) return;

    try {
      const chatRef = firestoreDoc(db, 'roomie-users', auth.user.uid, 'chats', activeChat.id);
      await updateDoc(chatRef, {
        unreadCount: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  const value = {
    chats,
    activeChat,
    setActiveChat,
    messages,
    loading,
    startChat,
    sendMessage,
    markMessagesAsRead,
    unreadCount,
    markAllMessagesAsRead
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 