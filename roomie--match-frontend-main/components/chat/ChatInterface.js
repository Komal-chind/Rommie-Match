import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function ChatInterface({ chatId, otherUser }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const endOfMessagesRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Listen for messages
  useEffect(() => {
    if (!chatId || !user) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);

      // Mark messages as read
      const unreadMessages = newMessages.filter(
        msg => msg.receiverId === user.uid && !msg.read
      );
      
      unreadMessages.forEach(msg => {
        updateDoc(doc(db, 'chats', chatId, 'messages', msg.id), {
          read: true
        });
      });
    });

    // Listen for typing status
    const typingRef = doc(db, 'chats', chatId, 'typing', otherUser.id);
    const typingUnsubscribe = onSnapshot(typingRef, (doc) => {
      if (doc.exists()) {
        setIsOtherTyping(doc.data().isTyping);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
    };
  }, [chatId, user, otherUser]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing status
  const handleTyping = () => {
    if (!user || !chatId) return;

    // Update typing status
    const typingRef = doc(db, 'chats', chatId, 'typing', user.uid);
    updateDoc(typingRef, { isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(typingRef, { isTyping: false });
    }, 2000);
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'User',
        receiverId: otherUser.id,
        timestamp: serverTimestamp(),
        read: false
      });

      // Update last message in chat document
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTimestamp: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {otherUser.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-white font-medium">{otherUser.name}</h3>
            <p className="text-sm text-gray-400">{otherUser.university}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.uid;
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-none shadow-lg shadow-pink-500/20' 
                      : 'bg-gray-800 text-gray-200 rounded-bl-none shadow-md border border-gray-700'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="font-medium text-xs mb-1 text-pink-400">
                      {message.senderName}
                    </div>
                  )}
                  <div>{message.text}</div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-pink-200' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                    {isOwnMessage && (
                      <span className="text-xs text-pink-200">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-200 rounded-lg px-4 py-2 text-sm">
              {otherUser.name} is typing...
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Message input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-grow bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
