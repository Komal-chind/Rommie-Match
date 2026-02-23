import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { 
  db, 
  createChat, 
  sendMessage, 
  getChatMessages, 
  getUserChats 
} from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc 
} from 'firebase/firestore';

export const useChat = (chatId = null) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all chats for current user
  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        setLoading(true);
        const userChats = await getUserChats(currentUser.uid);
        setChats(userChats);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUser]);

  // Listen for messages in current chat
  useEffect(() => {
    if (!chatId || !currentUser) {
      setMessages([]);
      return;
    }

    setLoading(true);

    // Create query for messages in this chat
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const newMessages = [];
        snapshot.forEach((doc) => {
          newMessages.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        setMessages(newMessages);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to messages:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Clean up listener
    return () => unsubscribe();
  }, [chatId, currentUser]);

  // Start a new chat with another user
  const startChat = async (otherUserId) => {
    if (!currentUser) {
      throw new Error('You must be logged in to start a chat');
    }

    try {
      const result = await createChat(currentUser.uid, otherUserId);
      return result.chatId;
    } catch (err) {
      console.error('Error starting chat:', err);
      setError(err.message);
      throw err;
    }
  };

  // Send a message in the current chat
  const sendNewMessage = async (text, receiverId) => {
    if (!currentUser || !chatId) {
      throw new Error('Missing current user or chat ID');
    }

    try {
      const messageData = {
        text,
        senderId: currentUser.uid,
        receiverId,
        senderName: currentUser.displayName || 'User',
        createdAt: new Date()
      };

      await sendMessage(chatId, messageData);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    messages,
    chats,
    loading,
    error,
    startChat,
    sendNewMessage
  };
};